"use client"
import React from 'react'
import { Id } from '../../convex/_generated/dataModel'
import { toast } from 'sonner'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ConvexError } from 'convex/values'
import { Toaster } from './ui/sonner'
import Spinner from './Spinner'
import { WAITING_LIST_STATUS } from '../../convex/constants'
import { Clock, OctagonXIcon } from 'lucide-react'


type Props = {}

const JoinQueue = ({eventId , userId}:{
    eventId:Id<"events">,
    userId:string
}) => {

    // Removed useSonner as it's not needed
    const joinWaitingList= useMutation(api.events.joinWaitingList)
    const queuePositon =useQuery(api.waitingList.getQueuePosition , {
        eventId ,
        userId
    });
    const userTicket= useQuery(api.tickets.getUserTicketForEvent,{
        userId ,
        eventId
    });
    const availability=useQuery(api.events.getEventAvaliability , {
        eventId
    });
    const event =useQuery(api.events.getById , {
        eventId
    });
    const isEventOwner= userId=== event?.userId;

    const handleJoinQueue=async()=>{

        try {
            const result=await joinWaitingList({eventId , userId});
            console.log("result",result);
            if(result?.success)
            {
                console.log("successfully joined waaiting list");
                toast.success('Joined Queue',
                    {
                        description:result.message,
                        duration:5000,
                        
                    })
            }
        } catch (error) {
            if(error instanceof ConvexError && 
                error.message.includes("joined the waiting list too many times")
            )
            {
                toast.warning('Slow down there',
                    {
                        description:error.data,
                        duration:5000,
                        
                    }
                )
            }
            else{
                console.error("Error joining waiting list:" ,error);
                toast.error('Uh oh! Something went wrong',
                    {
                        description:"Failed to join queue. please try again later",
                        duration:5000,
                        
                    }
                )
            }
        }
    };
    if(queuePositon===undefined  || availability=== undefined || !event )
    {
      return <Spinner/>;
    }
        //no need to render joinQueue if user already have a  Ticket
    if(userTicket)
    {
        return null;
    }
    const isPastEvent=event.eventDate <Date.now();
  return (
     <div>
        {(!queuePositon || queuePositon.status===WAITING_LIST_STATUS.EXPIRED || (queuePositon.status===WAITING_LIST_STATUS.OFFERED && queuePositon.offerExpiresAt && queuePositon.offerExpiresAt <=Date.now())) && (
            <>
            {isEventOwner ?(
  <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg">
  <OctagonXIcon className="w-5 h-5" />
  <span>You cannot buy a ticket for your own event</span>
</div>
            ):isPastEvent ?(
                <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                <Clock className="w-5 h-5" />
                <span>Event has ended ☹️</span>
              </div>
            ): availability.purchasedCount >=availability?.totalTickets ? (  <div className="text-center p-4">
                <p className="text-lg font-semibold text-red-600">
                  Sorry, this event is sold out 🥲
                </p>
              </div>):( <button
              onClick={handleJoinQueue}
              disabled={isPastEvent || isEventOwner}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Buy Ticket
            </button>)}</>
        )}

     </div>
  )
}

export default JoinQueue