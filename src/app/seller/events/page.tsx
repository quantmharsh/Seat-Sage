
import SellerEventList from '@/components/SellerEventList';
import { ArrowLeftFromLine, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

type Props = {}

const SellerEventsPage = (props: Props) => {
    
  return (
   <div className='min-h-screen bg-gray-50'>
    <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      {/* Header */}
      <div className='bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl shadow-sm border border-gray-200 p-6 mb-8'>
        <div className='flex flex-col  md:flex-row items-start md:items-center  justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <Link

            href={'/seller'}
            className='text-gray-500  hover:text-gray-700 transition-colors'
            >
             <ArrowLeftFromLine className='w-5 h-5'/>
            </Link>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                My Events
              </h1>
              <p className='mt-1 text-black  font-mono'>
                Manage your event listings and track sales
              </p>
            </div>
          </div>
          <Link
          href={'/seller/new-event'}
           className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className='w-5 h-5'/>
            Create Event
          </Link>
        </div>
        </div>
        {/* Event list created by   user(seller) */}
        <div className='bg-white rounded-xl shadow-sm border-gray-200 p-6'>
          <SellerEventList/>
        </div>
    </div>
   </div>
  )
}

export default SellerEventsPage ;