"use client";
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { redirect, useParams } from 'next/navigation';
import React, { useEffect, useRef } from 'react'
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import Link from 'next/link';
import { ArrowLeftCircle, Download, Share2 } from 'lucide-react';
import Ticket from '@/components/Ticket';
import { toPng  , toBlob} from "html-to-image";



const TicketPage = () => {
    const params = useParams();
    const { user } = useUser();
    const ticket = useQuery(api.tickets.getTicketWithDetails, {
        ticketId: params.id as Id<"tickets">
    });
    const ticketRef = useRef<HTMLDivElement>(null);
    useEffect(() => {

        if (!user) {
            redirect("/")
        }
        if (ticket?.userId != user?.id) {
            redirect("/tickets");
        }
        if (!ticket.event) {
            redirect("/tickets")
        }
    }, [user, ticket]);
    if (!ticket || !ticket.event) {
        return null;
    }
    const handleDownload = async () => {
        if (!ticketRef.current) {
            return;
        }
        try {
            const dataUrl = await toPng(ticketRef.current, {});
            const link = document.createElement("a");
            link.download = `ticket-${ticket._id}`;
            link.href = dataUrl;
            link.click();

        } catch (error) {
            console.error("Failed To Download Ticket", error);
            throw new Error("Failed to download ticket", error as Error);
        }
    }

    const handleShare=async()=>{
        if(!ticketRef.current)
        {
            return ;
        }
        // 1.) Try Sharing the image itself(Web Share API level  2)
        if(navigator.canShare)
        {
            try {
                const blob=await toBlob(ticketRef.current);
                const file =new File([blob!], `ticket-${ticket._id}.png`,
                    {
                        type:blob!.type
                    }
                )
                if(navigator.canShare({files:[file]}))
                {
                    await navigator.share({
                        files:[file],
                        title: "Guess who’s going? 👀",
                        text: "Here’s my ticket for the big day—so excited!",
                    });
                    console.log("got files ")
                    return ;
                }
                
            } catch (error) {
                console.warn("Share image failed, falling back to URL", error);
            }
        }
        // 2. share just the page URL if  sharing file is not supported
        if(navigator.share)
        {
            await navigator.share({
                title: "Guess who’s going? 👀",
                        text: "Here’s my ticket for the big day—so excited!",
                        url:window.location.href,
            });
            console.log("Sharing only url");
        }
        //  3. Last option fallback: copy  URL to clipboard
        else{
                    try {
                        await navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!")
                    } catch (error) {
                        console.error("Error occured",error);
                        alert("Your browser does not support sharing.")
                    }
        }

    };
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 space-y-8">
                    {/* Navigation and Actions */}
                    <div className="flex items-center justify-between">
                        <Link
                            href="/tickets"
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftCircle className="w-4 h-4 mr-2" />
                            Back to My Tickets
                        </Link>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                                <Download className="w-4 h-4" />
                                <span className="text-sm">Save</span>
                            </button>
                            <button 
                             onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm">Share</span>
                            </button>
                        </div>
                    </div>

                    {/* Event info */}
                    <div
                        className={`bg-gradient-to-r from-amber-400 to-amber-600 p-6 rounded-lg shadow-sm border ${ticket.event.is_cancelled ? "border-red-200" : "border-gray-100"}`}
                    >
                        <h1 className="text-2xl font-bold text-gray-900">
                            {ticket.event.name}
                        </h1>
                        <p className="mt-1 text-gray-900">
                            {new Date(ticket.event.eventDate).toLocaleDateString()} at{" "}
                            {ticket.event.location}
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${ticket.event.is_cancelled
                                        ? "bg-red-50 text-red-700"
                                        : "bg-green-50 text-green-700"
                                    }`}
                            >
                                {ticket.event.is_cancelled ? "Cancelled" : "Valid Ticket"}
                            </span>
                            <span className="text-sm text-gray-900">
                                Purchased on {new Date(ticket.purchasedAt).toLocaleDateString()}
                            </span>
                        </div>
                        {ticket.event.is_cancelled && (
                            <p className="mt-4 text-sm text-red-600">
                                This event has been cancelled. A refund will be processed if it
                                hasn&apos;t been already.
                            </p>
                        )}
                    </div>
                </div>
                {/* Ticket Component */}
                <div ref={ticketRef}>
                    <Ticket ticketId={ticket._id} />
                </div>

                {/* Additional info  */}
                <div
                    className={`mt-8 rounded-lg p-4 ${ticket.event.is_cancelled
                            ? "bg-red-50 border-red-100 border"
                            : "bg-blue-50 border-blue-100 border"
                        }`}
                >
                    <h3
                        className={`text-sm font-medium ${ticket.event.is_cancelled ? "text-red-900" : "text-blue-900"
                            }`}
                    >
                        Need Help?
                    </h3>
                    <p
                        className={`mt-1 text-sm ${ticket.event.is_cancelled ? "text-red-700" : "text-blue-700"
                            }`}
                    >
                        {ticket.event.is_cancelled
                            ? "For questions about refunds or cancellations, please contact our support team at srivastavah240@gmail.com"
                            : "If you have any issues with your ticket, please contact our support team at srivastavah240@gmail.com"}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default TicketPage;