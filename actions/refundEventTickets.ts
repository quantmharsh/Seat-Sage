"use server";

import { getConvexClient } from "@/lib/convex";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export async function refundEventTickets({eventId}:{
    eventId:Id<"events">
}){

    const convex=getConvexClient();
    // Get event details
    const event=await convex.query(api.events.getById ,{eventId});
    if(!event)
    {
        throw new Error("Event not found");
    }
    

}