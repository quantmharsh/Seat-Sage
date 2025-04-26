"use client";
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import React from 'react'
import { api } from '../../convex/_generated/api';
import { Doc } from '../../convex/_generated/dataModel';
import { Metrics } from '../../convex/events';
import { useStorageUrl } from '@/lib/imageUrl';
import Image from 'next/image';

type Props = {}

const SellerEventList = (props: Props) => {
  const {user}=useUser();
  const events:any=useQuery(api.events.getSellerEvents ,{
    userId:user?.id ??"",
  });
  if(!events)
  {
    return null;
  }
  
  const upcomingEvents = events.filter((e:any) => e.eventDate > Date.now());
  const pastEvents = events.filter((e:any) => e.eventDate <= Date.now());
  return (
     <div className='mx-auto space-y-8'>
      {/* Upcoming Events */}
      <div>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>
          Upcoming Events
        </h2>
        <div className='grid grid-cols-1 gap-6'>
          {upcomingEvents.map((event:any)=>(
            <SellerEventCard key={event._id} event={event}/>
          ))}
          {upcomingEvents.length=== 0 && (
            <p className='text-gray-500'>
              No Upcoming Events
            </p>
          )}
        </div>
      </div>
      {pastEvents.length >0 && (
        <div>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            <div className='grid grid-cols-1'>
              {pastEvents.map((event:any)=>(
                <SellerEventCard key={event._id} event={event}/>
              ))}
            </div>
          </h2>
          </div>
      )}



     </div>
  )
}

export default SellerEventList;

function SellerEventCard ({
  event,
}:{
  event:Doc<"events"> & {
    metrics:Metrics;
  };
}){
  const imageUrl=useStorageUrl(event.imageStorageId);
  const isPastEvent=event.eventDate <Date.now();

  return (
    <div
     className={`bg-white rounded-lg shadow-sm border ${event.is_cancelled ? "border-red-200":"border-gray-200"} overflow-hidden`}
     >
      <div className='p-6'>
        <div className='flex items-start gap-6'>
          {/* Event Image */}
          {imageUrl &&(
            <div className='relative w-40 h-40 rounded-lg overflow-hidden shrink-0'>
              <Image
              src={imageUrl}
              alt={event.name}
              fill
              className='object-cover'/>
              </div>
          )}
        </div>
      </div>
    </div>
  )

}