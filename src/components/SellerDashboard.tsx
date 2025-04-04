"use client";
import React, { useEffect, useState } from 'react'
import { AccountStatus, getStripeConnectAccountStatus } from '../../actions/getStripeConnectAccountStatus';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Spinner from './Spinner';

type Props = {}

const SellerDashboard = (props: Props) => {
  const[accountCreatePending , setAccountCreatePending]=useState(false);
  const[accountLinkCreatePending , setAccountLinkCreatePending]=useState(false);
  const[error , setError]=useState(false);
  const[accountStatus ,setAccountStatus]=useState<AccountStatus | null>(null);
  const router=useRouter();
  const {user}=useUser();
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
      } catch (error) {
        console.error("Error fetching account status:");
      }
    }
  }
  return (

    <div>SellerDashboard</div>
  )
}

export default SellerDashboard