import { useState } from 'react'
import { Event } from '../types'
import { DayEventsGroup } from '../components/DayEventsGroup'
import { EventInfoPanel } from '../components/EventInfoPanel'
import { EditEventForm } from '../components/EditEventForm'
import { useAppStore } from '../store/appStore'
import { Plus } from 'lucide-react'
import { syncLocalEventsToFirebaseOnce } from '../services/syncLocalEventsToFirebase'

export function DayViewPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [infoType, setInfoType] = useState<'map' | 'transit' | null>(null)
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const events = useAppStore((state) => state.events)
  const setEvents = useAppStore((state) => state.setEvents)
  const currentItinerary = useAppStore((state) => state.currentItinerary)

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

  const closeInfoPanel = () => {
    setSelectedEvent(null)
    setInfoType(null)
  }

  const handleAddEvent = async (newEvent: Event) => {
    // Add to local state
    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    
    // Save to localStorage
    localStorage.setItem('boston_events_local', JSON.stringify(updatedEvents))
    
    // Sync to Firebase on-demand
    if (currentItinerary?.id) {
      await syncLocalEventsToFirebaseOnce(currentItinerary.id)
    }
    
    setShowAddEventForm(false)
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
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{ 
          fontSize: 'clamp(20px, 6vw, 28px)', 
          fontWeight: 'bold', 
          marginBottom: '0px',
          margin: 0,
          color: '#ffffff', 
          backgroundColor: '#000000', 
          padding: '6px 10px', 
          borderRadius: '4px', 
          display: 'inline-block', 
          letterSpacing: '-1.68px' 
        }}>
          CARPE DIEM
        </h1>
        <button
          onClick={() => setShowAddEventForm(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            opacity: 0.8,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
          aria-label="Add new event"
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={20} />
          </div>
        </button>
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
        />
      )}

      {/* Add Event Form */}
      <EditEventForm
        isOpen={showAddEventForm}
        onClose={() => setShowAddEventForm(false)}
        onSave={handleAddEvent}
        isAddMode={true}
      />
    </div>
  )
}
