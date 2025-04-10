"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
const formSchema=z.object({
    name:z.string().min(5 ,"Event name is required"),
    description:z.string().min(10 , "Description is required"),
    location:z.string().min(3 ,"Location is required"),
    eventDate:z.date().min(new Date(new Date().setHours(0,0,0,0)),"Event date must be in future"), 
    price:z.number().min(0 ,"Price must be 0 or greater"),
    totalTickets:z.number().min(1 ,"Must have at least 1 ticket"),
});
type formData=z.infer<typeof formSchema>;