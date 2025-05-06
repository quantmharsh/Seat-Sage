import EventForm from '@/components/EventForm';
import React from 'react'



const  NewEventPage = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-8 text-blue-950  font-medium">
        <h2 className="text-2xl font-bold">Create New Event</h2>
        <p className=" mt-2 text-blue-950  font-medium">
          List your event and start selling tickets
        </p>
      </div>

      <div className="p-6">
        <EventForm mode="create" />
      </div>
    </div>
  </div>
  )
}

export default  NewEventPage;