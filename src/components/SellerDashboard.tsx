"use client";
import React, { useEffect, useState } from 'react'
import { AccountStatus, getStripeConnectAccountStatus } from '../../actions/getStripeConnectAccountStatus';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Spinner from './Spinner';
import { createStripeConnectLoginLink } from '../../actions/createStripeConnectLoginLink';
import Link from 'next/link';
import { BookPlusIcon, CalendarHeart } from 'lucide-react';

type Props = {}

const SellerDashboard = (props: Props) => {
  const[accountCreatePending , setAccountCreatePending]=useState(false);
  const[accountLinkCreatePending , setAccountLinkCreatePending]=useState(false);
  const[error , setError]=useState(false);
  const[accountStatus ,setAccountStatus]=useState<AccountStatus | null>(null);
  const router=useRouter();
  const {user}=useUser();

  //get stripeconnect Id from db;
  const stripeConnectId=useQuery(api.users.getUsersStripeConnectId,{
    userId:user?.id ||"",
  });
  const isReadyToAcceptPayments=accountStatus?.isActive && accountStatus?.payoutsEnabled;
  useEffect(()=>{
    if(stripeConnectId)
    {
    fetchAccountStatus();
    }
  },[stripeConnectId]);
  if(stripeConnectId===undefined)
  {
    return <Spinner/>;
  }
  const fetchAccountStatus=async()=>{
    if(stripeConnectId)
    {
      try {
        const status= await  getStripeConnectAccountStatus(stripeConnectId);
        setAccountStatus(status);
      } catch (error) {
        console.error("Error fetching account status:");
      }
    }
  }
  const handleManageAccount=async()=>{
    try {
      if(stripeConnectId && accountStatus?.isActive)
      {
        const loginUrl=await createStripeConnectLoginLink(stripeConnectId);
        window.location.href=loginUrl;
      }
    } catch (error) {
      console.error("Error accessing stripe Connect portal:" ,error);
      setError(true);
    }
  }
  return (

      <div className='max-w-3xl mx-auto p-6'>
        <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
          {/* Header Section */}
          <div className='bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-8 text-white'>
            <h2 className='text-2xl font-bold '>
      Seller Dashboard
            </h2>
            <p className='text-blue-100 font-semibold  mt-2'>
      Manage your seller profile and payment settings
            </p>
          </div>
          {/* Main Content */}
          {!isReadyToAcceptPayments && (
            <>
            <div className='bg-white p-8 rounded-lg'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
                Sell tickets for your event
              </h2>
              <p className='text-gray-600 mb-8'>
                List your tickets for sale and manage your listings
              </p>
              <div className='bg-white rounded-xl shadow-sm border border-blue-200 p-4'>
                <div className='flex justify-center gap-4'>
                  <Link href="/seller/new-event"
                    className='flex items-center gap-2 bg-blue-600  text-amber-50 px-4 py-2 rounded-lg  hover:bg-blue-700 transition-colors'
                  >

                    <BookPlusIcon className='w-5 h-5'/>
                    Create Event
                  </Link>
                  <Link href="/seller/events"
                    className='flex items-center gap-2 bg-gray-100 text-gray-700  px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors'
                  >
                    <CalendarHeart/> View My Events
                  </Link>
                </div>
              </div>
            </div>
           
            <hr className='my-8  border-blue-200 '/>
           
           
            </>
          )}

        </div>

      </div>
  )
}

export default SellerDashboard