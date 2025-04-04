"use client";
import React, { useState } from 'react'
import { AccountStatus } from '../../actions/getStripeConnectAccountStatus';

type Props = {}

const SellerDashboard = (props: Props) => {
  const[accountCreatePending , setAccountCreatePending]=useState(false);
  const[accountLinkCreatePending , setAccountLinkCreatePending]=useState(false);
  const[error , setError]=useState(false);
  const[accountStatus ,setAccountStatus]=useState<AccountStatus | null>(null);

  return (

    <div>SellerDashboard</div>
  )
}

export default SellerDashboard