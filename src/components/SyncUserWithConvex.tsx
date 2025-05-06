"use client"
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react';
import  { useEffect } from 'react'
import { api } from '../../convex/_generated/api';



const SyncUserWithConvex = () => {

    const {user}=useUser();
    const updatedUser=useMutation(api.users.updateUser);

    useEffect(() => {

        if(!user)
        {
            return;
        }
        const syncUser=async()=>{
            try {
                await  updatedUser({
                    userId:user.id ,
                    name:`${user.firstName ?? ""} ${user.lastName ?? ""}.trim()`,
                    email:user.emailAddresses[0]?.emailAddress ?? "",
                })
            } catch (error) {
                console.error("Error synching clerk user with Convex:",error);
            }
        }
        syncUser();
     
    }, [user ,updatedUser])
    
  return  null ;
}

export default SyncUserWithConvex