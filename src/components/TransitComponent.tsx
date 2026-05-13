import { useEffect, useState } from 'react'
import { Event } from '../types'
import { transitService } from '../services/transitService'

interface TransitRoute {
  summary: string
  legs: Array<{
    mode: string
    startAddress: string
    endAddress: string
    startTime: string
    endTime: string
    duration: number
    distance: number
    transitDetails?: {
      lineName: string
      transitType: string
      departure: string
      arrival: string
      stops: number
    }
  }>
  totalDuration: number
  totalDistance: number
  warning?: string
}

interface TransitComponentProps {
  event: Event
}

export function TransitComponent({ event }: TransitComponentProps) {
  const [route, setRoute] = useState<TransitRoute | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransit = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // For now, use fallback data (in production, would geocode the address)
        const transitRoute = await transitService.getTransitDirections(42.3554, -71.0555, event.time)

        setRoute(transitRoute)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transit information')
        console.error('Transit error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransit()
  }, [event])

  if (isLoading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#666666' }}>
        <p>Loading transit options...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '16px', color: '#d32f2f', textAlign: 'center' }}>
        <p>Error: {error}</p>
      </div>
    )
  }

  if (!route) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#666666' }}>
        <p>No transit information available</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Trip Summary */}
      <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
          {route.summary}
        </h3>
        <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#333333' }}>
          <div>
            <span style={{ color: '#666666' }}>Duration:</span>
            <br />
            <strong>{route.totalDuration} min</strong>
          </div>
          <div>
            <span style={{ color: '#666666' }}>Distance:</span>
            <br />
            <strong>{(route.totalDistance / 1000).toFixed(1)} km</strong>
          </div>
        </div>
        {route.warning && (
          <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#ff9800' }}>⚠️ {route.warning}</p>
        )}
      </div>

      {/* Step-by-Step Directions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>
          Step-by-Step Directions
        </h3>

        {route.legs.map((leg, index) => {
          const icon = transitService.getTransitIcon(leg.mode)
          const isTransit = leg.mode === 'TRANSIT'

          return (
            <div key={index} style={{ position: 'relative', paddingLeft: '32px', minHeight: '80px' }}>
              {/* Timeline connector */}
              {index < route.legs.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '32px',
                    bottom: '-32px',
                    width: '2px',
                    backgroundColor: '#2255cc',
                  }}
                />
              )}

              {/* Timeline node */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isTransit ? '#2255cc' : '#4caf50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                }}
              >
                {icon}
              </div>

              {/* Leg content */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                {/* Header with times */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#000000', fontSize: '13px' }}>
                    {leg.startTime} → {leg.endTime}
                  </span>
                  <span style={{ fontSize: '12px', color: '#666666' }}>{leg.duration} min</span>
                </div>

                {/* Locations */}
                <div style={{ fontSize: '12px', color: '#666666', marginBottom: '8px' }}>
                  <p style={{ margin: '0 0 4px 0' }}>
                    <strong>From:</strong> {leg.startAddress}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>To:</strong> {leg.endAddress}
                  </p>
                </div>

                {/* Transit details if applicable */}
                {isTransit && leg.transitDetails && (
                  <div
                    style={{
                      backgroundColor: '#f0f0f0',
                      padding: '8px',
                      borderRadius: '4px',
                      marginTop: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#2255cc' }}>
                      {leg.transitDetails.lineName} {transitService.getTransitIcon(leg.transitDetails.transitType)}
                    </p>
                    <p style={{ margin: '0 0 2px 0' }}>
                      Depart: <strong>{leg.transitDetails.departure}</strong>
                    </p>
                    <p style={{ margin: '0 0 2px 0' }}>
                      Arrive: <strong>{leg.transitDetails.arrival}</strong>
                    </p>
                    <p style={{ margin: 0 }}>
                      Stops: <strong>{leg.transitDetails.stops}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Transit tips */}
      <div
        style={{
          backgroundColor: '#e3f2fd',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#1565c0',
        }}
      >
        <p style={{ margin: '0 0 6px 0', fontWeight: '600' }}>💡 Transit Tips:</p>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Arrive 10-15 minutes early to account for delays</li>
          <li>Check the MBTA website for real-time service alerts</li>
          <li>Have a valid MBTA pass or CharlieCard ready</li>
          <li>Download the MBTA app for live updates</li>
        </ul>
      </div>
    </div>
  )
}
