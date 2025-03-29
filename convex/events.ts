import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";
import RateLimiter, { MINUTE } from "@convex-dev/rate-limiter";
import { api, components, internal } from "./_generated/api";
import { RegisteredMutation } from "convex/server";
import { Id } from "./_generated/dataModel";


// Initialize rateLimiter
const rateLimiter= new RateLimiter(components.rateLimiter, {
    queueJoin:{
        kind:"fixed window",
        rate:50 ,
        period:30* MINUTE  , //30 minutes 3  request
    }
})

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



//API to join waiting List 
export const joinWaitingList: RegisteredMutation<
"public",
{ eventId: Id<"events">; userId: string },
Promise<{
  success: boolean;
  status: string;
  message: string;
}>
>= mutation({

    args:{
        eventId:v.id("events"),
        userId:v.string()
    },
    handler:async(ctx , {eventId , userId})=>{
//Rate limit requests to stop spamming
const status=await rateLimiter.limit(ctx , "queueJoin", {key:userId});
if(!status.ok)
{
    throw new ConvexError(`You have joined waiting list too many times. Please wait ${Math.ceil( status.retryAfter/ (60*1000))}  minutes before trying again.`);
}
//First check whether user has already has an active entry in waitinglist means offered ,purchased or waiting 
const existingEntry=await ctx.db.query("waitingList").withIndex("by_user_event" , (q)=> q.eq("userId", userId).eq("eventId",eventId))
.filter((q)=>q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
.first();

if(existingEntry)
{
    throw new Error("Already in waiting list for this event");

} 
//Verify  the event exists or not
const event  =await ctx.db.get(eventId);
if(!event)
{
 throw new Error("Event not found")
}

//check if there are any tickets available right now
// To this:
 const {isSoldOut} =await ctx.runQuery(api.events.getEventAvaliability , {eventId});


 const now=Date.now();
 if(!isSoldOut)
 {
    //create an offer entry for  user
    //mark their waiting status to offered from waiting 
    const waitingListId=await ctx.db.insert("waitingList",{
        eventId,
        userId,
        status:WAITING_LIST_STATUS.OFFERED,
        offerExpiresAt:now+DURATIONS.TICKET_OFFER,
    })

    //scheduler  job that expires the offer if user didint purchase ticket 
    await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER ,
        internal.waitingList.expireOffer,
        {
            waitingListId ,
            eventId,
        }
    );
 }
// tickets  sold out 
 else{
   await ctx.db.insert('waitingList', {
    eventId,
    userId,
    status:WAITING_LIST_STATUS.WAITING
   });

   
 }
 return {
    success:true ,
    status:!isSoldOut? WAITING_LIST_STATUS.OFFERED :WAITING_LIST_STATUS.WAITING ,
    message:!isSoldOut ? "Ticket offered - you have 30 minutes to purchase":"Added to waiting list - you'll  be notified when a ticket becomes available", 
   };
    
    }

    
});