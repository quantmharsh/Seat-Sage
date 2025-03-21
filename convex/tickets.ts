import { v } from "convex/values";
import { query } from "./_generated/server";



export const getUserTicketForEvent=query({

    args:{
        userId:v.string(),
        eventId:v.id("events"),
    },
    handler:async(ctx , {userId , eventId})=>{
         const ticket= await ctx.db.query("tickets").withIndex("by_user_event" , (q)=>q.eq("userId" , userId).eq("eventId",eventId)).first();
         return  ticket;

    }
})