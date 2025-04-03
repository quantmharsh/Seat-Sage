"use server";
import { stripe } from "@/lib/stripe";


// to check whether seller has setup their account for accepting payment or not
export type AccountStatus={
    isActive:boolean ;
    requiresInformation:boolean ;
    requirements:{
        currently_due:string[];
        eventually_due:string[];
        past_due:string[];
    };
    chargesEnabled:boolean;
    payoutsEnabled:boolean;
};
export async function getStripeConnectAccountStatus(
    stripeConnectId:string
):Promise<AccountStatus>{

    if(!stripeConnectId)
    {
        throw new Error("No Stripe account ID Provided");
    }
    try {
         const account =await stripe.accounts.retrieve(stripeConnectId);
         return {
            isActive:account.details_submitted && 
            !account.requirements?.currently_due?.length,
            requiresInformation:!!(
                account.requirements?.currently_due?.length ||
                account.requirements?.past_due?.length ||
                account.requirements?.eventually_due?.length
            ),
            requirements:{
                currently_due:account.requirements?.currently_due || [],
                eventually_due:account.requirements?.eventually_due ||[],
                past_due:account.requirements?.past_due ||[]
            },
            chargesEnabled:account.charges_enabled,
            payoutsEnabled:account.payouts_enabled,
         };

    } catch (error) {
        console.error("Error fetchin stripe connect account status:" ,error);
        throw new Error("Failed to fetch stripe connect account status");
        
    }


}