"use client";
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import React from 'react'
import { api } from '../../../convex/_generated/api';
import { TicketSlash, TicketsPlaneIcon } from 'lucide-react';
import TicketCard from '@/components/TicketCard';

type Props = {}

const MyTicketsPage = (props: Props) => {
    const {user}=useUser();
    //get all tickets
    const tickets= useQuery(api.events.getUserTickets,{
      userId:user?.id ?? "",
    });
    if(!tickets)
    {
      return null;
    }
    const validTickets= tickets.filter((ticket)=> ticket.status==="valid");
    const otherTickets= tickets.filter((ticket)=> ticket.status!=="valid");
    const upcomingTickets=validTickets.filter((ticket)=>ticket.event && ticket.event?.eventDate>Date.now());
    const pastTickets= validTickets.filter((ticket)=>ticket.event && ticket.event.eventDate <=Date.now());



    
  return (
    <div>
      <div>
        <div>
          <div>
            <h1>My Tickets</h1>
            <p>Manage and view all your tickets in one place</p>

          </div>
          <div>
            <div>
              <TicketsPlaneIcon/>
              <span>
                {tickets.length} Total Tickets
              </span>
            </div>
          </div>
        </div>
        {upcomingTickets.length >0 && (

          <div>
            <h2>
              Upcoming Events
            </h2>
            <div>
              
              {upcomingTickets.map((ticket)=>(
                <TicketCard key={ticket._id}  ticketId={ticket._id}/>
              ))}
              </div>
            </div>
        )}
        {pastTickets.length >0 && (

<div>
  <h2>
    Past  Events
  </h2>
  <div>
    
    {pastTickets.map((ticket)=>(
      <TicketCard key={ticket._id}  ticketId={ticket._id}/>
    ))}
    </div>
  </div>
)}
 {otherTickets.length >0 && (

<div>
  <h2>
    Past  Events
  </h2>
  <div>
    
    {otherTickets.map((ticket)=>(
      <TicketCard key={ticket._id}  ticketId={ticket._id}/>
    ))}
    </div>
  </div>
)}

{tickets.length ===0 && (
  <div>
    <TicketSlash/>
    |<h3>
      No Tickets Yet
    </h3>
    <p>
    When you purchase tickets, they&apos;ll appear here
    </p>
    </div>
)}


      </div>
    </div>
  )
}

export default MyTicketsPage