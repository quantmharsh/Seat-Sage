"use client";
import { useQuery } from 'convex/react';
import { useSearchParams } from 'next/navigation';
import React from 'react'
import { api } from '../../../convex/_generated/api';
import Spinner from '@/components/Spinner';

type Props = {}

const SearchPage = (props: Props) => {

    const searchParams= useSearchParams();
    const query= searchParams.get("q")|| "";
    const searchResults= useQuery(api.events.search ,{
        searchTerm:query
    });

    if(!searchResults)
    {
        return (

            <div className='min-h-[400px] flex items-center justify-center'>
                <Spinner/>
            </div>
        )
    }

    const upcomingEvents=searchResults.filter((event)=>event.eventDate >Date.now()).sort((a , b)=>a.eventDate - b.eventDate);
    const pastEvents=searchResults.filter((event)=>event.eventDate <=Date.now() ).sort((a ,b)=>b.eventDate -a.eventDate);

    return(
    <div>SearchPage</div>
  )
}

export default SearchPage