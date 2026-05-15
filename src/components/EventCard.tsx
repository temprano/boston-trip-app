import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2 } from 'lucide-react'
import { Event, DirectionRoute } from '../types'
import { EventCTABar } from './EventCTABar'
import { EditEventForm } from './EditEventForm'
import { DirectionsPanel } from './DirectionsPanel'
import { eventDataService } from '../services/eventDataService'
import { directionsService } from '../services/directionsService'
import { useAppStore } from '../store/appStore'

interface EventCardProps {
  event: Event
  onMapClick?: (event: Event) => void
}

export function EventCard({ event, onMapClick }: EventCardProps) {
  const navigate = useNavigate()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [directionsLoading, setDirectionsLoading] = useState(false)
  const [directionsError, setDirectionsError] = useState<string | null>(null)
  const [directionsRoutes, setDirectionsRoutes] = useState<DirectionRoute[]>([])

  // Use separate selectors to avoid object reference changes
  const currentItinerary = useAppStore((state) => state.currentItinerary)
  const userLocation = useAppStore((state) => state.userLocation)
  const baseAddress = useAppStore((state) => state.baseAddress)
  const directionsOrigin = useAppStore((state) => state.directionsOrigin)

  const handleTransitClick = useCallback(() => {
    // Always navigate to transit page for real MBTA data
    // If event has a stopId, use it; otherwise just open transit page
    if (event.stopId) {
      navigate(`/transit?stop=${event.stopId}`)
    } else {
      // Navigate to transit page - user can search for transit there
      navigate('/transit')
    }
  }, [event, navigate])

  const handleDirectionsClick = useCallback(async () => {
    try {
      setShowDirections(true)
      setDirectionsLoading(true)
      setDirectionsError(null)

      // Determine origin based on directionsOrigin preference
      let origin: string
      
      if (directionsOrigin === 'current') {
        // User prefers current location
        if (userLocation) {
          origin = `${userLocation.lat},${userLocation.lng}`
          console.log('[EventCard] Using current location:', origin, 'Accuracy:', userLocation.accuracy, 'meters')
        } else {
          const error = 'Current location not available. Please enable location in Settings.'
          console.error('[EventCard] Direction error:', error)
          setDirectionsError(error)
          setDirectionsLoading(false)
          return
        }
      } else {
        // User prefers base address (default)
        if (baseAddress) {
          origin = baseAddress
          console.log('[EventCard] Using base address:', origin)
        } else {
          const error = 'Please set a base address in Settings or enable location tracking'
          console.error('[EventCard] Direction error:', error)
          setDirectionsError(error)
          setDirectionsLoading(false)
          return
        }
      }

      // Event destination
      const destination = `${event.address.line1}, ${event.address.line2}`
      console.log('[EventCard] Requesting directions:', { origin, destination, mode: 'transit' })

      // Fetch directions from Firebase Cloud Function
      const response = await directionsService.getDirections(origin, destination, 'transit')
      console.log('[EventCard] Directions response:', response)

      if (response.status !== 'OK') {
        setDirectionsError(response.error || 'Could not find directions')
      } else if (response.routes.length > 0) {
        setDirectionsRoutes(response.routes)
      } else {
        setDirectionsError('No routes found')
      }
    } catch (err) {
      setDirectionsError(err instanceof Error ? err.message : 'Error fetching directions')
    } finally {
      setDirectionsLoading(false)
    }
  }, [directionsOrigin, userLocation, baseAddress, event.address.line1, event.address.line2])

  const handleSaveEvent = useCallback(async (updatedEvent: Event) => {
    try {
      console.log('[EventCard] handleSaveEvent called with updated event:', updatedEvent)
      
      if (!currentItinerary?.id) {
        console.error('[EventCard] No itinerary selected')
        throw new Error('No itinerary selected')
      }
      
      console.log('[EventCard] Calling eventDataService.updateEvent for itinerary:', currentItinerary.id)
      // Update locally (works offline)
      await eventDataService.updateEvent(currentItinerary.id, event.id, updatedEvent)
      console.log('[EventCard] ✓ Event saved, closing form')
      
      setShowEditForm(false)
    } catch (err) {
      console.error('[EventCard] Failed to save event:', err)
      throw err
    }
  }, [currentItinerary, event.id])

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
            marginTop: '-7px',
          }}
        >
          {/* Corner Image - Only show if image exists and loads successfully */}
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
              onError={(e) => {
                // Hide image if it fails to load
                ;(e.target as HTMLImageElement).style.display = 'none'
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
          onDirectionsClick={handleDirectionsClick}
        />
      </div>

      {/* Edit Form Modal */}
      <EditEventForm
        event={event}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleSaveEvent}
      />

      {/* Directions Panel Modal */}
      <DirectionsPanel
        isOpen={showDirections}
        onClose={() => setShowDirections(false)}
        event={event}
        routes={directionsRoutes}
        isLoading={directionsLoading}
        error={directionsError}
      />
    </>
  )
}
