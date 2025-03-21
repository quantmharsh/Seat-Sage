import { v } from "convex/values";
import { query } from "./_generated/server";
import { TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";



export const get=query({
    args:{},
    handler:async(ctx)=>{

        return await ctx.db.query("events").filter((q)=>q.eq(q.field("is_cancelled"), undefined)).collect();
    },
});
export const getById=query({
    args:{eventId:v.id("events")},
    handler:async(ctx, {eventId})=>{
        return await ctx.db.get(eventId);
    },
});

export const getEventAvaliability=query({
    args:{
        eventId:v.id("events")
    },
    handler:async(ctx , {eventId})=>{

        const event =await ctx.db.get(eventId);
        if(!event)
        {
            throw new Error("Event not Found");
        }

        //Count total Purchased Tickets
        const purchasedCount=await  ctx.db.query("tickets")
        .withIndex("by_event" , (q)=> q.eq("eventId" ,eventId))
        .collect()
        .then((tickets)=>tickets.filter((t)=>t.status==TICKET_STATUS.VALID || t.status==TICKET_STATUS.USED).length);

        //count current valid offers
        //users  those who have reserved tickets but havnt paid till now

        const now= Date.now();
        const activeOffers=await ctx.db.query("waitingList").withIndex('by_event_status', (q)=>q.eq("eventId",eventId).eq("status",WAITING_LIST_STATUS.OFFERED))
        .collect()
        .then(
            (entries)=>entries.filter((e)=>e.offerExpiresAt ?? 0 > now).length
        );

        const totalReserved=purchasedCount+activeOffers;
        return {
            isSoldOut:totalReserved >= event.totalTickets ,
            totalTickets:event.totalTickets ,
            purchasedCount,
            activeOffers ,
            remainingTickets :Math.max(0 , event.totalTickets - totalReserved),
        };
    

    }
})