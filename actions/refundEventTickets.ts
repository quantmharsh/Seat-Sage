"use server";

import { getConvexClient } from "@/lib/convex";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { stripe } from "@/lib/stripe";

export async function refundEventTickets(eventId: Id<"events"> ) {

    const convex = getConvexClient();
    // Get event details
    const event = await convex.query(api.events.getById, { eventId });
    if (!event) {
        throw new Error("Event not found");
    }

    //get event owner's  stripe Connect Id
    const stripeConnectId = await convex.query(api.users.getUsersStripeConnectId, {
        userId: event.userId,
    });
    if (!stripeConnectId) {
        throw new Error("Stripes Connect Id not found ")
    }
    // Get all valid tickets for this event
    const tickets = await convex.query(api.tickets.getValidTicketsForEvent, {
        eventId: eventId
    });
    // Process refunds for each ticket
    // using allSettled instead of all because . all -> returns array if every promise is succedded
    //allSettled -> returns in both case whether promise is succeded or failed.which is require for refund issue 
    const results = await Promise.allSettled(
        tickets.map(async (ticket) => {
            try {
                if (!ticket.paymentIntentId) {
                    throw new Error("Payment information not found");
                }

                //issue refund through Stripe
                await stripe.refunds.create({
                    payment_intent: ticket.paymentIntentId,
                    reason: "requested_by_customer",
                },
                    {
                        stripeAccount: stripeConnectId,
                    });

                // Update ticket status to refunded 
                await convex.mutation(api.tickets.updateTicketStatus, {
                    ticketId: ticket._id,
                    status: "refunded"
                });

                return {
                    success: true,
                    ticketId: ticket._id
                };
            } catch (error) {

                console.error(`Failed to refund ticket ${ticket._id}`, error);
                return {
                    success: false, ticketId: ticket._id, error
                }
            };


        })
    )
    // check if all refunds were successfull
    const allSuccessfull = results.every(
        (result) => result.status === "fulfilled" && result.value.success
    );
    if (!allSuccessfull) {
        throw new Error("Some refunds failed. Please check the logs and try again")
    }
    //cancel the event
    await convex.mutation(api.events.cancelEvent, { eventId });
    return {
        success: true
    };





}