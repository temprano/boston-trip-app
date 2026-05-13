import { useEffect, useState } from 'react'
import { Event } from '../types'
import { EventCard } from '../components/EventCard'
import { DayEventsGroup } from '../components/DayEventsGroup'
import { EventInfoPanel } from '../components/EventInfoPanel'
import { eventDataService } from '../services/eventDataService'

export function DayViewPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [infoType, setInfoType] = useState<'map' | 'transit' | 'tickets' | null>(null)

  useEffect(() => {
    // Load events from local storage
    const loadedEvents = eventDataService.getEvents()
    setEvents(loadedEvents)
    setIsLoading(false)
  }, [])

  // Group events by date
  const eventsByDate = events.reduce(
    (acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = []
      }
      acc[event.date].push(event)
      return acc
    },
    {} as Record<string, Event[]>
  )

  // Sort dates chronologically
  const sortedDates = Object.keys(eventsByDate).sort()

  const handleMapClick = (event: Event) => {
    setSelectedEvent(event)
    setInfoType('map')
  }

  const handleTransitClick = (event: Event) => {
    setSelectedEvent(event)
    setInfoType('transit')
  }

  const handleTicketsClick = (event: Event) => {
    setSelectedEvent(event)
    setInfoType('tickets')
  }

  const closeInfoPanel = () => {
    setSelectedEvent(null)
    setInfoType(null)
  }

  if (isLoading) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <p style={{ color: '#666666' }}>Loading events...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <p style={{ color: '#666666', marginBottom: '16px' }}>
          No events scheduled yet
        </p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
    }}>
      {/* CARPE DIEM Header */}
      <div style={{ 
        padding: '12px 16px',
        backgroundColor: '#0d0d0d',
        flexShrink: 0
      }}>
        <h1 style={{ 
          fontSize: 'clamp(20px, 6vw, 28px)', 
          fontWeight: 'bold', 
          marginBottom: '0px', 
          color: '#ffffff', 
          backgroundColor: '#000000', 
          padding: '6px 10px', 
          borderRadius: '4px', 
          display: 'inline-block', 
          letterSpacing: '-1.68px' 
        }}>
          CARPE DIEM
        </h1>
      </div>

      {/* Events Container - Scrollable */}
      <div style={{ 
        padding: '12px 16px 16px 16px',
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0px',
          }}
        >
          {sortedDates.map((date) => (
            <DayEventsGroup
              key={date}
              date={date}
              events={eventsByDate[date]}
              onMapClick={handleMapClick}
              onTransitClick={handleTransitClick}
              onTicketsClick={handleTicketsClick}
            />
          ))}
        </div>
      </div>

      {/* Info Panel */}
      {selectedEvent && infoType && (
        <EventInfoPanel
          event={selectedEvent}
          infoType={infoType}
          onClose={closeInfoPanel}
          onMapClick={() => handleMapClick(selectedEvent)}
          onTransitClick={() => handleTransitClick(selectedEvent)}
          onTicketsClick={() => handleTicketsClick(selectedEvent)}
        />
      )}
    </div>
  )
}
