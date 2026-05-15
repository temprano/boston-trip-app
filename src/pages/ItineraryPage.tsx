import { useMemo } from 'react'
import { EventCard } from '../components/EventCard'
import { WeatherBug } from '../components/WeatherBug'
import { useAppStore } from '../store/appStore'
import { MapPin, Home } from 'lucide-react'

export function ItineraryPage() {
  const events = useAppStore((state) => state.events)
  const userLocation = useAppStore((state) => state.userLocation)
  const directionsOrigin = useAppStore((state) => state.directionsOrigin)
  const setDirectionsOrigin = useAppStore((state) => state.setDirectionsOrigin)

  // Filter today's events (or first day's events if today has none)
  const currentDayEvents = useMemo(() => {
    if (events.length === 0) return []

    // Get today's date in MM/DD/YYYY format
    const today = new Date()
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`

    // Find events for today
    const todayEvents = events.filter((event) => event.date === todayStr)

    // If today has events, use them; otherwise use first day's events
    if (todayEvents.length > 0) {
      return todayEvents
    } else if (events.length > 0) {
      const firstDate = events[0].date
      return events.filter((event) => event.date === firstDate)
    }

    return []
  }, [events])

  if (currentDayEvents.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <p style={{ color: '#666666', marginBottom: '16px' }}>
          No events scheduled
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      {/* Directions From Toggle */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Card Header */}
        <h2
          style={{
            fontSize: '17px',
            fontWeight: 'bold',
            color: '#000000',
            margin: '0 0 12px 0',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Directions From
        </h2>

        {/* Status Section */}
        <div style={{ flex: 1, marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            {directionsOrigin === 'current' ? (
              <>
                <MapPin size={20} color="#2255cc" />
                <span style={{ color: '#2255cc', fontWeight: 'bold', fontSize: '15px' }}>
                  Current Location
                </span>
                {userLocation ? (
                  <span style={{ color: '#4caf50', fontSize: '12px', marginLeft: 'auto' }}>
                    ✓ Available
                  </span>
                ) : (
                  <span style={{ color: '#ff9800', fontSize: '12px', marginLeft: 'auto' }}>
                    ⚠ Not Available
                  </span>
                )}
              </>
            ) : (
              <>
                <Home size={20} color="#2255cc" />
                <span style={{ color: '#2255cc', fontWeight: 'bold', fontSize: '15px' }}>
                  Base Address (Airbnb)
                </span>
                <span style={{ color: '#4caf50', fontSize: '12px', marginLeft: 'auto' }}>
                  ✓ Default
                </span>
              </>
            )}
          </div>

          {directionsOrigin === 'current' && !userLocation && (
            <p style={{ fontSize: '12px', color: '#ff9800', margin: '0' }}>
              Enable location in Settings to use current location for directions
            </p>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => {
            const newOrigin = directionsOrigin === 'current' ? 'base' : 'current'
            setDirectionsOrigin(newOrigin)
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: directionsOrigin === 'current' ? '#2255cc' : '#666666',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              directionsOrigin === 'current' ? '#1a3fa0' : '#555555'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              directionsOrigin === 'current' ? '#2255cc' : '#666666'
          }}
        >
          Use {directionsOrigin === 'current' ? 'Base Address' : 'Current Location'}
        </button>
      </div>

      {/* Get the date for the header */}
      {currentDayEvents.length > 0 && (
        <>
          {/* Weather header for today */}
          <WeatherBug />

          {/* Events for the day */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginTop: '16px',
            }}
          >
            {currentDayEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
