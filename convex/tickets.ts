import { v } from "convex/values";
import { mutation, query } from "./_generated/server";



export const getUserTicketForEvent = query({

    args: {
        userId: v.string(),
        eventId: v.id("events"),
    },
    handler: async (ctx, { userId, eventId }) => {
        const ticket = await ctx.db.query("tickets").withIndex("by_user_event", (q) => q.eq("userId", userId).eq("eventId", eventId)).first();
        return ticket;

    }
})

//get event details for particulat ticket  detail .

export const getTicketWithDetails = query({
    args: {
        ticketId: v.id("tickets")
    },
    handler: async (ctx, { ticketId }) => {
        const ticket = await ctx.db.get(ticketId);
        if (!ticket) {
            return null;
        }
        const event = await ctx.db.get(ticket.eventId);
        return {
            ...ticket,
            event
        }
    }
});


export const getValidTicketsForEvent=query({
    args:{
        eventId:v.id("events")
    },
    handler:async(ctx ,{eventId})=>{

        return await ctx.db.query("tickets").withIndex("by_event",(q)=>q.eq("eventId", eventId)).filter((q)=>q.or(q.eq(q.field("status") ,"used") ,q.eq(q.field('status'),"valid"))).collect();
    }

});

export const updateTicketStatus=mutation({
    args:{
  ticketId:v.id("tickets"),
  status: v.union(
    v.literal("valid"),
    v.literal("used"),
    v.literal("refunded"),
    v.literal("cancelled")
  ),
    },
    handler:async(ctx , {ticketId ,status})=>{

        await ctx.db.patch(ticketId ,{status})
    }


});
