import { useState } from 'react'
import { Event } from '../types'
import { DayEventsGroup } from '../components/DayEventsGroup'
import { EventInfoPanel } from '../components/EventInfoPanel'
import { useAppStore } from '../store/appStore'

interface EventsSectionProps {
  title?: string
}

export function EventsSection({ title = 'Events & Activities' }: EventsSectionProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [infoType, setInfoType] = useState<'map' | 'transit' | null>(null)
  const events = useAppStore((state) => state.events)

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

  const closeInfoPanel = () => {
    setSelectedEvent(null)
    setInfoType(null)
  }

  if (events.length === 0) {
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
    <>
      <div style={{ padding: '16px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 'bold', marginBottom: '6px', color: '#ffffff', backgroundColor: '#000000', padding: '6px 10px', borderRadius: '4px', display: 'inline-block', letterSpacing: '-1.68px' }}>
          {title.toUpperCase()}
        </h1>
        <div style={{ height: '2px', backgroundColor: '#ffffff', width: '100%', marginBottom: '16px' }} />

        {/* Day Groups with Weather Headers */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0px',
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '8px',
          }}
        >
          {sortedDates.map((date) => (
            <DayEventsGroup
              key={date}
              date={date}
              events={eventsByDate[date]}
              onMapClick={handleMapClick}
              onTransitClick={handleTransitClick}
            />
          ))}
        </div>
      </div>

      {/* Info Panel */}
      <EventInfoPanel
        event={selectedEvent}
        infoType={infoType}
        onClose={closeInfoPanel}
      />
    </>
  )
}
