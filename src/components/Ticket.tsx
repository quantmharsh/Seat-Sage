"use client";
import React from 'react'
import { Id } from '../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

type Props = {
    ticketId:Id<"tickets">
}

const Ticket = ({ticketId}: Props) => {
    //fetch ticket detail
    const ticket =useQuery(api.tickets.getTicketWithDetails,{
        ticketId
    });
    //with help of ticket find  user to whom this tickets belongs 
  return (
    <div>Ticket Details component </div>
  )
}

export default Ticket