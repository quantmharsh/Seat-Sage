import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const updateUser=mutation({
    args:{
        userId:v.string(),
        name:v.string(),
        email:v.string()
    },
    handler:async(ctx, {userId , name , email})=>{

        const existingUser= await ctx.db.query("users").withIndex("by_user_id" , (q)=> q.eq("userId", userId)).first();

        if(existingUser)
        {
            await ctx.db.patch(existingUser._id, {
                name ,
                email,
            });
            return existingUser._id;
        }

        //create new user
        const newUserId=await ctx.db.insert("users",{
            userId,
            name,
            email,
            stripeConnectId:undefined,
        });
        return newUserId;
    },
});


export const getUserById=query({
    args:{
        userId:v.string()
    },
    handler:async(ctx , {userId})=>{
        const user=await ctx.db.query("users").withIndex("by_user_id", (q)=> q.eq("userId", userId)).first();
        return user;
    },
});



//create stripeConnectId for seller. it will be used  to transfer money into event organiser . 
export const updateOrCreateUserStripeConnectId= mutation({
    args:{
        userId:v.string() ,
        stripeConnectId:v.string()
    },
        handler:async(ctx , {userId , stripeConnectId})=>{
            //get user
            const user= await ctx.db.query("users").withIndex("by_user_id" , (q)=>q.eq("userId", userId)).first();

            if(!user)
            {
                throw new Error("User not found");
            }

            //update  stripeConnectId
            await ctx.db.patch(user._id ,{
                stripeConnectId:stripeConnectId
            });

    }
}) 