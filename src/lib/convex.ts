import { ConvexHttpClient } from "convex/browser"

//function to  get convex client. basically get public convex url to access db and all mutations , query 
export const getConvexClient=()=>{

    if(!process.env.NEXT_PUBLIC_CONVEX_URL)
    {
        throw new Error("NEXT_PUBLIC_CONVEX_URL is not set")

    }
    return  new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
}