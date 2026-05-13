import { useEffect, useState } from 'react'
import { Event } from '../types'
import { EventCard } from '../components/EventCard'
import { WeatherBug } from '../components/WeatherBug'
import { eventDataService } from '../services/eventDataService'

export function ItineraryPage() {
  const [currentDayEvents, setCurrentDayEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load events from local storage
    const loadedEvents = eventDataService.getEvents()

    // Get today's date in MM/DD/YYYY format
    const today = new Date()
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`

    // Find events for today
    const todayEvents = loadedEvents.filter((event) => event.date === todayStr)

    // If today has events, use them; otherwise use first day's events
    if (todayEvents.length > 0) {
      setCurrentDayEvents(todayEvents)
    } else if (loadedEvents.length > 0) {
      // Find the first day with events
      const firstDate = loadedEvents[0].date
      const firstDayEvents = loadedEvents.filter((event) => event.date === firstDate)
      setCurrentDayEvents(firstDayEvents)
    }

    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <p style={{ color: '#666666' }}>Loading events...</p>
      </div>
    )
  }

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
    <div style={{ padding: '16px' }}>
      {/* Get the date for the header */}
      {currentDayEvents.length > 0 && (
        <>
          {/* Weather header for the day */}
          <WeatherBug date={currentDayEvents[0].date} />

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
