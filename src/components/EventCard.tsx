"use client";
import React from 'react'
import { Id } from '../../convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useStorageUrl } from '@/lib/utils';

type Props = {}

const EventCard = ({eventId}:{
    eventId:Id<"events">
}) => {

  const {user}=useUser();
  const {router}=useRouter();
  const event =useQuery(api.events.getById , {
    eventId
  });
  //get avaliability of tickets
  const availability= useQuery(api.events.getEventAvaliability , {
    eventId
  });
  // Check  wheteher user has purchased ticket for this event or not
  const userTicket=useQuery(api.tickets.getUserTicketForEvent , {
      eventId  , 
      userId:user?.id ?? "",
  })

  const queuePosition=useQuery(api.waitingList.getQueuePosition , {
    eventId ,
    userId: user?.id ?? "",
  });
  const imageUrl= useStorageUrl(event?.imageStorageId);

  if(!event  ||!availability)
  {
    return  null ;
  }
  
  const isPastEvent= event?.eventDate <=Date.now();
  const isEventOwner= event?.userId ===user?.id;
  return (
    <div>EventCard</div>
  )
}

export default EventCard