import { useAppStore } from '../store/appStore'
import { DayView } from '../sections/DayView'

export function HomePage() {
  const itinerary = useAppStore((state) => state.currentItinerary)

  if (!itinerary) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: '#999999',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '8px' }}>No Itinerary Loaded</h2>
          <p>Loading itinerary data...</p>
        </div>
      </div>
    )
  }

  // Get today's date in MM/DD/YYYY format
  const today = new Date()
  const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`

  // Find the current day in the itinerary
  const currentDay = itinerary.days.find((day) => day.date === todayStr)

  // Fallback to first day if today is not in the itinerary
  const dayToDisplay = currentDay || itinerary.days[0]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header Section */}
      <div style={{ padding: '16px', borderBottom: '1px solid #333333' }}>
        <h1 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '20px' }}>
          {itinerary.title}
        </h1>
        <p
          style={{
            margin: '0',
            color: '#999999',
            fontSize: '13px',
            lineHeight: '1.4',
          }}
        >
          {itinerary.description}
        </p>
      </div>

      {/* Main Section - DayView for current day */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <DayView day={dayToDisplay} />
      </div>
    </div>
  )
}
