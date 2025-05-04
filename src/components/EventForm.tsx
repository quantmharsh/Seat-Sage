"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useSonner } from "sonner";
import { toast } from 'sonner'
import { useStorageUrl } from "@/lib/imageUrl";
import { init } from "next/dist/compiled/webpack/webpack";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { error } from "console";
const formSchema = z.object({
    name: z.string().min(5, "Event name is required"),
    description: z.string().min(10, "Description is required"),
    location: z.string().min(3, "Location is required"),
    eventDate: z.date().min(new Date(new Date().setHours(0, 0, 0, 0)), "Event date must be in future"),
    price: z.number().min(0, "Price must be 0 or greater"),
    totalTickets: z.number().min(1, "Must have at least 1 ticket"),
});
type FormData = z.infer<typeof formSchema>;

interface InitialEventData {
    _id: Id<"events">;
    name: string;
    description: string;
    location: string;
    eventDate: number;
    price: number;
    totalTickets: number;
    imageStorageId?: Id<"_storage">;
}

interface EventFormProps {
    mode: "create" | "edit";
    initialData?: InitialEventData;
}


const EventForm = ({ mode, initialData }: EventFormProps) => {
    const { user } = useUser();
    const createEvent = useMutation(api.events.create);
    const updateEvent = useMutation(api.events.updateEvent);
    const router = useRouter();
    // useTransition lets you mark part of your UI update as non-urgent, so that React can keep the app responsive (for example, by allowing a spinner to render first) while the slower state update happens in the background.
    const [isPending, startTransition] = useTransition();

    //get current Image URL
    const currentImageUrl = useStorageUrl(initialData?.imageStorageId);
    //image upload
    const imageInput = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removedCurrentImage, setRemovedCurrentImage] = useState(false);
    const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
    const updateEventImage = useMutation(api.storage.updateEventImage);
    const deleteImage = useMutation(api.storage.deleteImage);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            location: initialData?.location ?? "",
            eventDate: initialData ? new Date(initialData.eventDate) : new Date(),
            price: initialData?.price ?? 0,
            totalTickets: initialData?.totalTickets ?? 1,
        }


    });

    async function handleImageUpload(file: File): Promise<string | null> {
        try {
            // Step 1: Ask Convex to generate an upload URL
            const postUrl = await generateUploadUrl();
            // Step 2: Upload the file to that URL
            const result = await fetch(postUrl, {
                method: "POST",
                headers: {
                    "Content-Type": file.type
                },
                body: file,
            });
            
            toast.success("Image Uploaded Successfully");
            // Step 3: Get the storageId back from Convex
            const { storageId } = await result.json();
            return storageId;


        } catch (error) {
            console.error("Failed to upload image", error);
            return null;

        }
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            }
          
            toast.success("Image changed Successfully");
            // starts reading the file content.
            reader.readAsDataURL(file);
        }


    };


    async function onSubmit(values: FormData) {

        if (!user?.id) return;

        startTransition(async () => {
            try {
                let imageStorageId = null;
                //handle image changes
                //user selected new image
                if (selectedImage) {
                    //upload new image   
                    imageStorageId = await handleImageUpload(selectedImage);

                }

                //Handle  image  deletion in edit mode
                if (mode === "edit" && initialData?.imageStorageId) {
                    if (removedCurrentImage || selectedImage) {
                        // delete old image from storage. if user has seleted new image or removed old image
                        await deleteImage({
                            storageId: initialData.imageStorageId
                        });
                    }
                }
                if (mode === "create") {
                    const eventId = await createEvent({
                        ...values,
                        userId: user.id,
                        eventDate: values.eventDate.getTime(),
                    });
                    //add event Image
                    if (imageStorageId) {
                        await updateEventImage({
                            eventId,
                            storageId: imageStorageId as Id<"_storage">,
                        });
                    }
                    router.push(`/event/${eventId}`);
                }
                //update event information   if in edit mode
                else {
                    //ensure initialData exists before procceding with update
                    if (!initialData) {
                        throw new Error("Initial event data is required for updates");
                    }
                    //update event details
                    await updateEvent({
                        eventId: initialData._id,
                        ...values,
                        eventDate: values.eventDate.getTime(),
                    });
                    //update image-this will now handle  adding new image ,above in if condition we were deleting the old image . to free up spaces .
                    if (imageStorageId || removedCurrentImage) {
                        await updateEventImage({
                            eventId: initialData._id,
                            //if  having new image id pass it or otherwise passs null .
                            storageId: imageStorageId ? (imageStorageId as Id<'_storage'>) : null,
                        })
                    }
                    toast.success('Event updated',
                        {
                            description: "your event has been successfully updated.",
                            duration: 5000,

                        })
                    router.push(`/event/${initialData._id}`);
                }
            } catch (error) {
                console.error("Failed to handle event", error);
                toast.error('Uh oh! something went wrong.',
                    {
                        description: "There was a problem with your request.Please try again later",
                        duration: 5000,

                    })


            }

        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
            >
                {/* Form Fields */}
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Date</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(
                                                e.target.value ? new Date(e.target.value) : null
                                            );
                                        }}
                                        value={
                                            field.value
                                                ? new Date(field.value).toISOString().split("T")[0]
                                                : ""
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price per Ticket</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2">
                                            ₹
                                        </span>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            className="pl-6"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="totalTickets"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Tickets Available</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                                
                                {/* {mode === "edit" && 
                                <FormMessage>
                                    To many tickets !!!
                                    </FormMessage>} */}
                                    <FormMessage/>
                            </FormItem>
                        )}
                    />
                    {/* Image Upload */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Event Image
                        </label>
                        <div className="mt-1 flex items-center gap-4">
                            {imagePreview || (!removedCurrentImage && currentImageUrl) ? (
                                <div className="relative w-32 aspect-square bg-gray-100 rounded-lg">
                                    <Image
                                        src={imagePreview || currentImageUrl!}
                                        alt="Preview"
                                        fill
                                        className="object-contain rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setImagePreview(null);
                                            setRemovedCurrentImage(true);
                                            if (imageInput.current) {
                                                imageInput.current.value = "";
                                            }
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    ref={imageInput}
                                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                                />
                            )}
                        </div>
                    </div>

                </div>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {mode === "create" ? "Creating Event..." : "Updating Event..."}
                        </>
                    ) : mode === "create" ? (
                        "Create Event"
                    ) : (
                        "Update Event"
                    )}
                </Button>
            </form>
        </Form>

    )
}

export default EventForm