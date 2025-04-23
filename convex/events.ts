import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";
import RateLimiter, { MINUTE } from "@convex-dev/rate-limiter";
import { api, components, internal } from "./_generated/api";
import { RegisteredMutation } from "convex/server";
import { Id } from "./_generated/dataModel";
import { processQueue, processQueueImpl } from "./waitingList";
import { promise } from "zod";


// Initialize rateLimiter
const rateLimiter = new RateLimiter(components.rateLimiter, {
    queueJoin: {
        kind: "fixed window",
        rate: 50,
        period: 30 * MINUTE, //30 minutes 3  request
    }
})
export type Metrics={
    soldTickets:number ;
    refundedTickets:number ;
    cancelledTickets:number;
    revenue:number;
};

export const get = query({
    args: {},
    handler: async (ctx) => {

        return await ctx.db.query("events").filter((q) => q.eq(q.field("is_cancelled"), undefined)).collect();
    },
});
export const getById = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, { eventId }) => {
        return await ctx.db.get(eventId);
    },
});

export const getEventAvaliability = query({
    args: {
        eventId: v.id("events")
    },
    handler: async (ctx, { eventId }) => {

        const event = await ctx.db.get(eventId);
        if (!event) {
            throw new Error("Event not Found");
        }

        //Count total Purchased Tickets
        const purchasedCount = await ctx.db.query("tickets")
            .withIndex("by_event", (q) => q.eq("eventId", eventId))
            .collect()
            .then((tickets) => tickets.filter((t) => t.status == TICKET_STATUS.VALID || t.status == TICKET_STATUS.USED).length);

        //count current valid offers
        //users  those who have reserved tickets but havnt paid till now

        const now = Date.now();
        const activeOffers = await ctx.db.query("waitingList").withIndex('by_event_status', (q) => q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED))
            .collect()
            .then(
                (entries) => entries.filter((e) => e.offerExpiresAt ?? 0 > now).length
            );

        const totalReserved = purchasedCount + activeOffers;
        return {
            isSoldOut: totalReserved >= event.totalTickets,
            totalTickets: event.totalTickets,
            purchasedCount,
            activeOffers,
            remainingTickets: Math.max(0, event.totalTickets - totalReserved),
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
> = mutation({

    args: {
        eventId: v.id("events"),
        userId: v.string()
    },
    handler: async (ctx, { eventId, userId }) => {
        //Rate limit requests to stop spamming
        const status = await rateLimiter.limit(ctx, "queueJoin", { key: userId });
        if (!status.ok) {
            throw new ConvexError(`You have joined waiting list too many times. Please wait ${Math.ceil(status.retryAfter / (60 * 1000))}  minutes before trying again.`);
        }
        //First check whether user has already has an active entry in waitinglist means offered ,purchased or waiting 
        const existingEntry = await ctx.db.query("waitingList").withIndex("by_user_event", (q) => q.eq("userId", userId).eq("eventId", eventId))
            .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
            .first();

        if (existingEntry) {
            throw new Error("Already in waiting list for this event");

        }
        //Verify  the event exists or not
        const event = await ctx.db.get(eventId);
        if (!event) {
            throw new Error("Event not found")
        }

        //check if there are any tickets available right now
        // To this:
        const { isSoldOut } = await ctx.runQuery(api.events.getEventAvaliability, { eventId });


        const now = Date.now();
        if (!isSoldOut) {
            //create an offer entry for  user
            //mark their waiting status to offered from waiting 
            const waitingListId = await ctx.db.insert("waitingList", {
                eventId,
                userId,
                status: WAITING_LIST_STATUS.OFFERED,
                offerExpiresAt: now + DURATIONS.TICKET_OFFER,
            })

            //scheduler  job that expires the offer if user didint purchase ticket 
            await ctx.scheduler.runAfter(
                DURATIONS.TICKET_OFFER,
                internal.waitingList.expireOffer,
                {
                    waitingListId,
                    eventId,
                }
            );
        }
        // tickets  sold out 
        else {
            await ctx.db.insert('waitingList', {
                eventId,
                userId,
                status: WAITING_LIST_STATUS.WAITING
            });


        }
        return {
            success: true,
            status: !isSoldOut ? WAITING_LIST_STATUS.OFFERED : WAITING_LIST_STATUS.WAITING,
            message: !isSoldOut ? "Ticket offered - you have 30 minutes to purchase" : "Added to waiting list - you'll  be notified when a ticket becomes available",
        };

    }


});

// Create Event
export const create = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        location: v.string(),
        eventDate: v.number(),
        price: v.number(),
        totalTickets: v.number(),
        userId: v.string(),

    },
    handler: async (ctx, args) => {
        const eventId = await ctx.db.insert('events', {
            name: args.name,
            description: args.description,
            location: args.location,
            eventDate: args.eventDate,
            price: args.price,
            totalTickets: args.totalTickets,
            userId: args.userId,
        })
        return eventId;
    }
})

//Update Event
export const updateEvent = mutation({
    args: {
        eventId: v.id("events"),
        name: v.string(),
        description: v.string(),
        location: v.string(),
        eventDate: v.number(),
        price: v.number(),
        totalTickets: v.number(),

    },
    handler: async (ctx, args) => {
        const { eventId, ...updates } = args;
        //get current event to check tickets sold
        const event = await ctx.db.get(eventId);
        if (!event) {
            throw new Error("Event  not found");
        }
        //get total tickets sold out for event
        const soldTickets = await ctx.db.query("tickets").withIndex("by_event", (q) => q.eq("eventId", eventId)).filter((q) => q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), 'used'))).collect();
        //Ensure new total tickets is not less than sold tickets
        if (updates.totalTickets < soldTickets.length) {
            throw new Error(`Cannot reduce total tickets below ${soldTickets.length}(number of tickets already sold)`);
        }
        //update in db
        await ctx.db.patch(eventId, updates);
        return eventId;

    }
})

// Purchase Ticket 
export const purchaseTicket = mutation(
    {
        args: {
            eventId: v.id("events"),
            userId: v.string(),
            waitingListId: v.id("waitingList"),
            paymentInfo: v.object({
                paymentIntentId: v.string(),
                amount: v.number(),
            })
        }, handler: async (ctx, args) => {
            console.log("Initiating payment", args);
            //verify waiting List Entry exist and is valid
            const waitingListEntry = await ctx.db.get(args.waitingListId);
            console.log('Waiting list entry', args.waitingListId);
            if (!waitingListEntry) {
                console.error("Waiting list Entry not found");
                throw new Error("Waiting list entry not found");
            }
            if (waitingListEntry.status !== WAITING_LIST_STATUS.OFFERED) {
                console.error("Invalid waiting list status", {
                    status: waitingListEntry.status,
                });
                throw new Error(
                    "Invalid waiting list status - ticket offer may have expired"
                );
            }
            if (waitingListEntry.userId !== args.userId) {
                console.error("User ID mismatch", {
                    waitingListUserId: waitingListEntry.userId,
                    requestedUserId: args.userId,
                });
                throw new Error("Waiting List entry does not belong to this user");

            }
            //verify that event exist or not and  is not cancelled
            const event = await ctx.db.get(args.eventId);
            if (!event) {
                console.error("Event not found", args.eventId);
                throw new Error("Event not found");
            }
            if (event.is_cancelled) {
                console.error("Attempted purchase of cancelled event", args.eventId);
                throw new Error("Event  is no longer active");

            }
            try {
                console.log("creating ticket with payment info", args.paymentInfo);
                //create ticket with payment Info
                await ctx.db.insert("tickets", {
                    eventId: args.eventId,
                    userId: args.userId,
                    purchasedAt: Date.now(),
                    status: TICKET_STATUS.VALID,
                    paymentIntentId: args.paymentInfo.paymentIntentId,
                    amount: args.paymentInfo.amount

                });
                //now update waitingListStatus from offered to purchased
                await ctx.db.patch(args.waitingListId, {
                    status: WAITING_LIST_STATUS.PURCHASED,
                });
                //process queue for other people.
                await processQueueImpl(ctx, args.eventId);

                console.log("Purchase ticket completed successfully");
            } catch (error) {
                console.error("Failed to complete ticket purchase:", error);

            }





        }
    })

    //get users tickets with event information
    //fetch all tickets of  user ,then fetcch  events for which those tickets are (2 db call , tickets ,then from tickets we are getting  all events details  )
    export const getUserTickets=query({
        args:{
            userId:v.string() ,

        },
        handler:async(ctx , {userId})=>{
            //get all tickets of user
            const tickets=await ctx.db.query("tickets").withIndex("by_user",(q)=> q.eq("userId",userId)).collect();

            //get all  events for  each user tickets
            const ticketsWithEvents= await  Promise.all(
                tickets.map(async(ticket)=>{
                    const event=await ctx.db.get(ticket.eventId);
                    return {
                        ...ticket ,
                        event
                    };
                })
            );


                return ticketsWithEvents;
        }
    })

    export const search=query({
        args:{ searchTerm:v.string()},
        handler:async(ctx , {searchTerm})=>{
            const events=await ctx.db.query('events').filter((q)=>q.eq(q.field("is_cancelled") ,undefined)).collect();

            return events.filter((event)=>{
                const searchTermLower=searchTerm.toLowerCase();
                return(
                    event.name.toLowerCase().includes(searchTermLower) ||
                    event.description.toLowerCase().includes(searchTermLower) ||
                    event.location.toLowerCase().includes(searchTermLower)
                );
            });
        },
    });
    



    export const  getSellerEvents=query({
        args:{userId:v.string()},
        handler:async(ctx ,{userId})=>{
            //fetch all events 
            const events=await ctx.db.query("events").filter((q)=>q.eq(q.field("userId") ,userId)).collect();

            //for each event , get ticket sales data
            const eventsWithMetrics=await Promise.all(
                events.map(async(event)=>{
                    const tickets=await ctx.db.query("tickets").withIndex("by_event",(q)=>q.eq("eventId" ,event._id)).collect();

                    const validTickets=tickets.filter((t)=>t.status==='used' || t.status==="valid");

                    const refundedTickets=tickets.filter((t)=>t.status==="refunded");
                    const cancelledTickets=tickets.filter((t)=>t.status==="cancelled");

                    const metrics:Metrics={
                        soldTickets:validTickets.length,
                        refundedTickets:refundedTickets.length,
                        cancelledTickets:cancelledTickets.length,
                        revenue:validTickets.length*event.price
                    };
                    return {
                        ...event ,
                        metrics,
                    }
                })
               
            )
        }
    })



    export const cancelEvent= mutation({args:{
        eventId:v.id("events")
    },
        handler:async(ctx ,{eventId})=>{
            const event =await ctx.db.get(eventId);
            if(!event)
            {
                throw new Error("Event not found");
            }
            //get all vaid tickets for this event
            const tickets=await ctx.db.query("tickets").withIndex("by_event" , (q)=>q.eq("eventId" ,eventId)).filter((q)=>q.or(q.eq(q.field("status") ,"valid") , q.eq(q.field("status") ,"used"))).collect();


            if(tickets.length >0)
            {
                throw new Error("Cannot cancel event with active tickets. Please refund all tickets first.")
            }
            //mark event has cancelled
            await ctx.db.patch(eventId,{
                is_cancelled:true
            });

            //Delete any waitingList Entries
            const waitingListEntries=await ctx.db.query("waitingList").withIndex("by_event_status",(q)=>q.eq("eventId" ,eventId)).collect();

            for (const entry of waitingListEntries)
            {
                await ctx.db.delete(entry._id);
            }
            return {success:true};
        }
    })