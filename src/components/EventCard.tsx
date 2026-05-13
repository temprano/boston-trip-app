import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2 } from 'lucide-react'
import { Event } from '../types'
import { EventCTABar } from './EventCTABar'
import { EditEventForm } from './EditEventForm'
import { eventDataService } from '../services/eventDataService'

interface EventCardProps {
  event: Event
  onMapClick?: (event: Event) => void
  onTransitClick?: (event: Event) => void
}

export function EventCard({ event, onMapClick, onTransitClick }: EventCardProps) {
  const navigate = useNavigate()
  const [showEditForm, setShowEditForm] = useState(false)

  const handleTransitClick = () => {
    // If event has a stopId, navigate to transit page with the stop
    if (event.stopId) {
      navigate(`/transit?stop=${event.stopId}`)
    } else {
      // Fallback to callback if no stopId
      onTransitClick?.(event)
    }
  }

  const handleSaveEvent = async (updatedEvent: Event) => {
    try {
      eventDataService.saveEvents([
        ...eventDataService.getEvents().filter(e => e.id !== updatedEvent.id),
        updatedEvent,
      ])
      // Reload the page to reflect changes
      window.location.reload()
    } catch (error) {
      console.error('Error saving event:', error)
      throw error
    }
  }

  return (
    <>
      <div style={{ width: '100%', marginBottom: '16px' }}>
        {/* Main Card Container */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            position: 'relative',
          }}
        >
          {/* Corner Image */}
          {event.eventImage && (
            <img
              src={event.eventImage}
              alt="Event logo"
              style={{
                position: 'absolute',
                top: '8px',
                right: '14px',
                width: '96px',
                height: '96px',
                objectFit: 'cover',
                borderRadius: '4px',
              }}
            />
          )}

          {/* Title */}
          <h2
            style={{
              fontSize: '17px',
              fontWeight: 'bold',
              color: '#000000',
              margin: '0 0 8px 0',
              letterSpacing: '0.05em',
              lineHeight: '1.2',
              textTransform: 'uppercase',
              paddingRight: '110px',
            }}
          >
            {event.title}
          </h2>

          {/* Venue */}
          <p
            style={{
              fontSize: '20px',
              fontStyle: 'italic',
              color: '#000000',
              margin: '0 0 12px 0',
              fontFamily: "'Blackhawk Italic', serif",
              lineHeight: '1.2',
            }}
          >
            {event.venue}
          </p>

          {/* Details Section - Two Columns */}
          <div style={{ display: 'flex', gap: '24px', fontSize: '15px', color: '#2255cc', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: '1.8' }}>
            {/* Left Column - Date & Time */}
            <div style={{ flex: 1 }}>
              <div>DATE: {event.date}</div>
              <div>TIME: {event.time}</div>
            </div>
            {/* Right Column - Address */}
            <div style={{ flex: 1 }}>
              <div>{event.address.line1}</div>
              <div>{event.address.line2}</div>
            </div>
          </div>

          {/* Edit Button - Lower Right Corner */}
          <button
            onClick={() => setShowEditForm(true)}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Edit event"
          >
            <Edit2 style={{ width: '20px', height: '20px', color: '#2255cc' }} />
          </button>
        </div>

        {/* CTA Bar */}
        <EventCTABar
          onMapClick={() => onMapClick?.(event)}
          onTransitClick={handleTransitClick}
        />
      </div>

      {/* Edit Form Modal */}
      <EditEventForm
        event={event}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleSaveEvent}
      />
    </>
  )
}
