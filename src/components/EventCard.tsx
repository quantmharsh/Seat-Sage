import React from 'react'
import { Id } from '../../convex/_generated/dataModel'

type Props = {}

const EventCard = ({eventId}:{
    eventId:Id<"events">
}) => {
  return (
    <div>EventCard</div>
  )
}

export default EventCard