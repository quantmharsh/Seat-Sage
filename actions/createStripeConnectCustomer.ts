"use server";

import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe Secret Key is not set");
}
if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error(" Next Public Convex URL is not set");
}
const convex = getConvexClient();

//function to create stripe account where sellers will manage their payment details. here sellers  account will be created on stripe .

export async function createStripeConnectCustomer(){

    const { userId } = await auth();
    if (!userId) {
        throw new Error("User Not Authenticated");
    }

    // check whether user already has a connect account 
    const existingStripeConnectId = await convex.query(api.users.getUsersStripeConnectId, {
        userId,
    });
    if (existingStripeConnectId) {
        return {
            account: existingStripeConnectId
        };
    }
    //create new connect account
    const account = await stripe.accounts.create({
        type: "express",
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });

    await convex.mutation(api.users.updateOrCreateUserStripeConnectId, {
        userId, 
        stripeConnectId: account.id,
    });
    return {account:account.id};
}