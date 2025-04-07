"use client";
import React, { useEffect, useState } from 'react'
import { AccountStatus, getStripeConnectAccountStatus } from '../../actions/getStripeConnectAccountStatus';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Spinner from './Spinner';
import { createStripeConnectLoginLink } from '../../actions/createStripeConnectLoginLink';

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
            <p>
      Manage your seller profile and payment settings
            </p>
          </div>

        </div>

      </div>
  )
}

export default SellerDashboard