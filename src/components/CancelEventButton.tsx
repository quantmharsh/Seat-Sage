import React, { useState } from 'react'
import { Id } from '../../convex/_generated/dataModel'
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { refundEventTickets } from '../../actions/refundEventTickets';
import { toast } from 'sonner';
import { Ban } from 'lucide-react';



const CancelEventButton = ({eventId}: {eventId:Id<"events">;}) => {

  const[isCancelling ,setIsCancelling]=useState(false);
  const cancelEvent= useMutation(api.events.cancelEvent);
  const router= useRouter();
  const handelCancel=async()=>{
    if(!confirm("Are you sure you want to cancel this event? All tickets will be refunded and the event will be cancelled permanently."))
    {
      return ;
    }

    setIsCancelling(true);
    try {
      
      // Refund all tickets then cancel the event
      await refundEventTickets(eventId);
      await cancelEvent({eventId});
       toast.success('Event canclled',
                              {
                                  description: "All tickets have been refunded successfully",
                                  duration: 5000,
      
                              })
    } catch (error) {
      toast.error('Error',
        {
            description: "Failed to cancel event . Please try again",
            duration: 5000,

        })
    }
    finally{
      setIsCancelling(false)
    }
  }
  
  return (
   <button
   onClick={handelCancel}
   disabled={isCancelling}
     className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
   >
<Ban className="w-4 h-4" />
<span>{isCancelling ? "Processing..." : "Cancel Event"}</span>
   </button>
  )
}

 export default CancelEventButton;