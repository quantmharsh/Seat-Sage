"use server"

import { auth } from "@clerk/nextjs/server";
import { Id } from "../convex/_generated/dataModel"
import { getConvexClient } from "@/lib/convex";
import { api } from "../convex/_generated/api";
import { stripe } from "@/lib/stripe";
import { DURATIONS } from "../convex/constants";
import baseUrl from "@/lib/baseUrl";

export type StripeCheckoutMetaData={
    eventId:Id<"events">;
    userId:string;
    waitingListId:Id<"waitingList">;
};
export async function createStripeCheckoutSession({
    eventId,
}:{eventId:Id<"events">}){

    const {userId}=await auth();
    if(!userId)
    {
        throw new Error("Request Not Authenticated");

    }
    const convex=getConvexClient();
    //fetch event details
    const event =await  convex.query(api.events.getById,{
        eventId
    });
    if(!event)
    {
        throw new Error("Event not found");
    }
    //get waiting list entry of user
    const queuePosition=await convex.query(api.waitingList.getQueuePosition,{
        userId ,
        eventId
    });
    if(!queuePosition || queuePosition.status!=="offered")
        {
            throw new Error("No Valid Ticket offer found");
        }
    //get stripeConnectId of event organiser to whom payment will be transferred
    const stripeConnectId =await convex.query(api.users.getUsersStripeConnectId,{
        userId:event.userId,
    });
    if(!stripeConnectId)
    {
        throw new Error("Stripe connect id not found for the  Event Owner");
    }
    if(!queuePosition.offerExpiresAt)
    {
        throw new Error("Ticket offer has no expiration date");
    }
    const metadata:StripeCheckoutMetaData={
        eventId ,
        userId,
        waitingListId:queuePosition._id,
    };

    // create stripe checkout session 
    
    const session =await stripe.checkout.sessions.create({
        payment_method_types:["card" ,"amazon_pay" ],
        line_items:[
            {
                price_data:{
                    currency:"inr",
                    product_data:{
                        name:event.name ,
                        description:event.description,
                    },
                    unit_amount:Math.round(event.price *100),
                },
                quantity:1,
            },
        ],
        payment_intent_data:{
            application_fee_amount:Math.round(event.price *100*0.01),
        },
        expires_at:Math.floor(Date.now()/1000)+DURATIONS.TICKET_OFFER/1000,
        mode:"payment",
        success_url: `${baseUrl}/tickets/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/event/${eventId}`,
        metadata,
    },
    //credit into sellers account 
{
    stripeAccount:stripeConnectId
});
return {sessionId:session.id , sessionUrl:session.url};

}