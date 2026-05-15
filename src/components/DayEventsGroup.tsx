import { Event } from '../types'
import { EventCard } from './EventCard'
import { WeatherBug } from './WeatherBug'

interface DayEventsGroupProps {
  date: string
  events: Event[]
  onMapClick?: (event: Event) => void
}

export function DayEventsGroup({
  date,
  events,
  onMapClick,
}: DayEventsGroupProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Weather Header */}
      <div style={{ marginBottom: '16px' }}>
        <WeatherBug date={date} />
      </div>

      {/* Events for this day */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onMapClick={onMapClick}
          />
        ))}
      </div>
    </div>
  )
}
