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
const formSchema=z.object({
    name:z.string().min(5 ,"Event name is required"),
    description:z.string().min(10 , "Description is required"),
    location:z.string().min(3 ,"Location is required"),
    eventDate:z.date().min(new Date(new Date().setHours(0,0,0,0)),"Event date must be in future"), 
    price:z.number().min(0 ,"Price must be 0 or greater"),
    totalTickets:z.number().min(1 ,"Must have at least 1 ticket"),
});
type formData=z.infer<typeof formSchema>;

interface InitialEventData{
    _id:Id<"events">;
    name:string;
    description:string ;
    location:string;
    eventDate:number;
    price:number;
    totalTickets:number;
    imageStorageId?:Id<"_storage">;
}

interface EventFormProps{
    mode:"create"|"edit";
    initialData?: InitialEventData;
}


const EventForm = ({mode , initialData}:EventFormProps) => {
    const{user}=useUser();
    const createEvent=useMutation(api.events.create);
    const updateEvent=useMutation(api.events.updateEvent);
    const router=useRouter();
    // useTransition lets you mark part of your UI update as non-urgent, so that React can keep the app responsive (for example, by allowing a spinner to render first) while the slower state update happens in the background.
    const[isPending , startTransition]=useTransition();
    
    //get current Image URL
    const currentImageUrl=useStorageUrl(initialData?.imageStorageId);
    //image upload
    const imageInput=useRef<HTMLInputElement>(null);
    const[selectedImage ,setSelectedImage]=useState<File| null>(null);
    const[imagePreview ,setImagePreview]=useState<string | null>(null);
    const[removedCurrentImage , setRemovedCurrentImage]=useState(false);
    const genereateUploadUrl=useMutation(api.storage.generateUploadUrl);
    const updateEventImage=useMutation(api.storage.updateEventImage);
    const deleteImage=useMutation(api.storage.deleteImage);

  return (
    <div>EventForm</div>
  )
}

export default EventForm