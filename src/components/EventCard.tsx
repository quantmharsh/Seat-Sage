"use client"
import React from 'react'
import { Id } from '../../convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useStorageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { CalendarDays, CheckCircle, CircleArrowRight, LoaderCircleIcon, MapPin, PencilIcon, StarIcon, TicketsPlane, XCircle } from 'lucide-react';
import PurchaseTicket from './PurchaseTicket';




const EventCard = ({ eventId }: {
  eventId: Id<"events">
}) => {

  const { user } = useUser();
  const router = useRouter();
  const event = useQuery(api.events.getById, {
    eventId
  });
  //get avaliability of tickets
  const availability = useQuery(api.events.getEventAvaliability, {
    eventId
  });
  // Check  wheteher user has purchased ticket for this event or not
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId: user?.id ?? "",
  })

  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });
  const imageUrl = useStorageUrl(event?.imageStorageId);

  if (!event || !availability) {
    return null;
  }

  const isPastEvent = event?.eventDate <= Date.now();
  const isEventOwner = event?.userId === user?.id;
  console.log("isEventOwner", isEventOwner);


  const renderQueuePosition = () => {
    if (!queuePosition || queuePosition.status !== "waiting") return null;

    if (availability.purchasedCount >= availability.totalTickets) {
      return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TicketsPlane className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Event is sold out</span>
          </div>
        </div>
      );
    }

    if (queuePosition.position === 2) {
      return (
        <div className="flex flex-col lg:flex-row items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex items-center">
            <CircleArrowRight className="w-5 h-5 text-amber-500 mr-2" />
            <span className="text-amber-700 font-medium">
              You&apos;re next in line! (Queue position:{" "}
              {queuePosition.position})
            </span>
          </div>
          <div className="flex items-center">
            <LoaderCircleIcon className="w-4 h-4 mr-1 animate-spin text-amber-500" />
            <span className="text-amber-600 text-sm">Waiting for ticket</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center">
          <LoaderCircleIcon className="w-4 h-4 mr-2 animate-spin text-blue-500" />
          <span className="text-blue-700">Queue position</span>
        </div>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
          #{queuePosition.position}
        </span>
      </div>
    );
  };

  //    Render Ticket Status. whether owner of event , user reserver it , or user already holds the ticket , number  of people in queue

  const renderTicketStatus = () => {
    if (!user) {
      return null;
    }
    //if owner of event
    if (isEventOwner) {
      return (
        <div className=' mt-4'>
          <button onClick={(e) => {
            e.stopPropagation()
            router.push(`/seller/events/${eventId}/edit`);

          }}
            className='w-full bg-purple-100 text-gray-700  px-6 py-3 rounded-lg font-medium hover:bg-purple-200  transition-colors duration-200 shadow-sm flex items-center justify-center gap-2'
          >
            <PencilIcon className='w-5 h-5' />
            Edit Event
          </button>
        </div>
      );
    }

    if (userTicket) {
      return (
        <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">
              You have a ticket 😀
            </span>
          </div>
          <button onClick={() => router.push(`/tickets/${userTicket._id}`)}
            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-medium shadow-sm transition-colors duration-200 flex items-center gap-1">
            View your ticket
          </button>
        </div>
      )
    }
    if (queuePosition) {
      return (
        <div className="mt-4">
          {queuePosition.status === "offered" && (
            <PurchaseTicket eventId={eventId} />

          )}
          {renderQueuePosition()}
          {queuePosition.status === "expired" && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="text-red-700 font-medium flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Offer expired
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;

  }


  return (
    <div onClick={() => router.push(`/event/${eventId}`)}
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden relative ${isPastEvent ? "opacity-75 hover:opacity-100 " : ""} `}
    >
      {/* Event image */}
      {imageUrl && (
        <div className='relative w-full h-48'>
          <Image src={imageUrl}
            alt={event.name}
            fill
            className='object-cover'
            priority
          />
          <div className=' absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
        </div>
      )}
      <div className={`p-6${imageUrl ? "relative" : ""}`} >
        <div className='flex justify-between items-start'>
          <div>
            <div className=' flex flex-col items-start gap-2'>
              {isEventOwner && (
                <span className='inline-flex items-center ap-1 bg-blue-600/90 text-white px-2 py-1 rounded-full text-xs font-medium '>
                  <StarIcon className=' w-3 h-3' />
                  Your Event
                </span>
              )}
              <h2 className='text-2xl  font-bold text-gray-900 '> {event.name}</h2>

            </div>
            {isPastEvent && (
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2 '>
                Past Event
              </span>
            )}
          </div>

          {/* Price tag*/}
          <div className='flex flex-col items-end gap-2 ml-4'>
            <span className={`px-4 py-1.5 font-semibold rounded-full ${isPastEvent
                ? "bg-gray-50 text-gray-500"
                : "bg-green-50 text-green-700"
              }`}>
              Rs.{event.price.toFixed(2)}
            </span>
            {availability.purchasedCount >= availability.totalTickets && (
              <span className='px-4 py-1.5 bg-red-50 text-red-700 font-semibold rounded-full text-sm'>
                Sold Out
              </span>
            )}


          </div>

        </div>
        <div className='mt-4 space-y-3'>
          <div className=' flex items-center text-gray-600'>
            <MapPin className='w-4 h-4 mr-2' />
            <span>
              {event.location}
            </span>
          </div>
          <div className='flex items-center text-gray-600'>
            <CalendarDays className='w-4 h-4 mr-2' />
            <span>
              {new Date(event.eventDate).toLocaleDateString()}{" "}
              {isPastEvent && "(Ended)"}
            </span>
          </div>

          <div>
            <TicketsPlane />
            <span>
              {availability.totalTickets - availability.purchasedCount} /{" "}
              {availability.totalTickets} available
              {/*  render total ticket reserved by diffrent peoples */}
              {!isPastEvent && availability.activeOffers > 0 && (
                <span className=' text-amber-600 text-sm ml-2'>
                  ({availability.activeOffers}{" "}

                  {availability.activeOffers === 1 ? "person" : "people"} trying to buy)
                </span>
              )}
            </span>
          </div>


        </div>
        <p className=' mt-4 text-gray-600 text-sm line-clamp-2'>
          {event.description}
        </p>
        {/*We Want to render ticket status . so need to  stop propogation . ( on click  dont redirect to  event details page . but  render ticket status . ) */}
        <div onClick={(e) => e.stopPropagation()}>
          {!isPastEvent && renderTicketStatus()}
        </div>
      </div>

    </div>
  )
}

export default EventCard