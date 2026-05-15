import { useState } from 'react'
import { X, MapPin, Clock, DollarSign } from 'lucide-react'
import { DirectionRoute, Event } from '../types'

// Helper to strip HTML tags from strings
const stripHtml = (html: string): string => {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Helper to get transit type emoji and label
const getTransitIcon = (vehicleType: string): { icon: string; label: string } => {
  const typeMap: Record<string, { icon: string; label: string }> = {
    SUBWAY: { icon: '🚇', label: 'Subway' },
    TRAM: { icon: '🚊', label: 'Tram' },
    TRAIN: { icon: '🚆', label: 'Train' },
    BUS: { icon: '🚌', label: 'Bus' },
    FERRY: { icon: '⛴️', label: 'Ferry' },
    LIGHT_RAIL: { icon: '🚊', label: 'Light Rail' },
  }
  return typeMap[vehicleType] || { icon: '🚍', label: 'Transit' }
}

// Helper to get line color based on Boston MBTA lines
const getLineColor = (lineName: string): string => {
  const nameUpper = lineName?.toUpperCase() || ''
  if (nameUpper.includes('RED')) return '#da291c'
  if (nameUpper.includes('BLUE')) return '#003da5'
  if (nameUpper.includes('ORANGE')) return '#ed8936'
  if (nameUpper.includes('GREEN')) return '#00a651'
  return '#2255cc'
}

interface DirectionsPanelProps {
  isOpen: boolean
  onClose: () => void
  event: Event
  routes: DirectionRoute[]
  isLoading: boolean
  error: string | null
}

// Helper to find fastest route
const findFastestRoute = (routes: DirectionRoute[]): number => {
  if (routes.length === 0) return 0
  let fastestIdx = 0
  let fastestTime = routes[0].legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0)
  
  for (let i = 1; i < routes.length; i++) {
    const time = routes[i].legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0)
    if (time < fastestTime) {
      fastestTime = time
      fastestIdx = i
    }
  }
  return fastestIdx
}

// Helper to get total duration in minutes
const getTotalDuration = (route: DirectionRoute): number => {
  return Math.round(route.legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0) / 60)
}

// Helper to get total distance
const getTotalDistance = (route: DirectionRoute): string => {
  const totalMeters = route.legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0)
  const km = (totalMeters / 1000).toFixed(1)
  return `${km} km`
}

export function DirectionsPanel({
  isOpen,
  onClose,
  event,
  routes,
  isLoading,
  error,
}: DirectionsPanelProps) {
  const [selectedLegIndex, setSelectedLegIndex] = useState(0)
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0)

  if (!isOpen) return null

  const fastestRouteIndex = findFastestRoute(routes)
  const currentRoute = routes[selectedRouteIndex]
  const currentLeg = currentRoute?.legs[selectedLegIndex]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          borderRadius: '16px 16px 0 0',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            Directions to {event.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p style={{ color: '#666' }}>Loading directions...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div
            style={{
              backgroundColor: '#ffe6e6',
              color: '#cc0000',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {/* Route Summary */}
        {currentRoute && !isLoading && (
          <>
            {/* Route Selector (if multiple routes available) */}
            {routes.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                  overflowX: 'auto',
                }}
              >
                {routes.map((route, idx) => {
                  const isFastest = idx === fastestRouteIndex
                  const isSelected = idx === selectedRouteIndex
                  const duration = getTotalDuration(route)
                  const distance = getTotalDistance(route)

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedRouteIndex(idx)
                        setSelectedLegIndex(0)
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #2255cc' : '1px solid #ddd',
                        backgroundColor: isSelected ? '#e8f0fe' : '#f9f9f9',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        {isFastest && '⚡ Fastest'} Route {idx + 1}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {duration} min • {distance}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Route Summary */}
            <div
              style={{
                backgroundColor: '#f5f5f5',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Clock size={16} style={{ marginBottom: '4px' }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                  {getTotalDuration(currentRoute)} min
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <MapPin size={16} style={{ marginBottom: '4px' }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                  {getTotalDistance(currentRoute)}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <DollarSign size={16} style={{ marginBottom: '4px' }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                  {currentRoute.legs.length} leg{currentRoute.legs.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Legs Navigation */}
            {currentRoute.legs.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                  overflowX: 'auto',
                }}
              >
                {currentRoute.legs.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedLegIndex(idx)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: idx === selectedLegIndex ? '#2255cc' : '#e8e8e8',
                      color: idx === selectedLegIndex ? '#fff' : '#333',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: idx === selectedLegIndex ? 'bold' : 'normal',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Leg {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Current Leg Details */}
            {currentLeg && (
              <>
                <div
                  style={{
                    backgroundColor: '#f9f9f9',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                    From
                  </p>
                  <p
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    {(currentLeg.start_address || currentLeg.startAddress) || 'Starting point'}
                  </p>

                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                    To
                  </p>
                  <p
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    {(currentLeg.end_address || currentLeg.endAddress) || 'Destination'}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    <span>⏱️ {currentLeg.duration?.text || 'N/A'}</span>
                    <span>📍 {currentLeg.distance?.text || 'N/A'}</span>
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <h3
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginBottom: '12px',
                    }}
                  >
                    Directions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentLeg.steps.map((step, idx) => {
                      const hasTransit = !!step.transit_details
                      const transit = step.transit_details
                      const vehicleType = transit?.line?.vehicle?.type || ''
                      const { icon: transitIcon, label: transitLabel } = getTransitIcon(vehicleType)
                      const lineColor = getLineColor(transit?.line?.name || '')

                      return hasTransit ? (
                        // Transit Step
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '12px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            borderLeft: `4px solid ${lineColor}`,
                          }}
                        >
                          <div
                            style={{
                              minWidth: '40px',
                              height: '40px',
                              backgroundColor: lineColor,
                              color: '#fff',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              fontWeight: 'bold',
                            }}
                          >
                            {transitIcon}
                          </div>
                          <div style={{ flex: 1 }}>
                            {/* Line Info */}
                            <p
                              style={{
                                margin: '0 0 4px 0',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: lineColor,
                              }}
                            >
                              {transit?.line?.short_name || transit?.line?.name || transitLabel}
                            </p>

                            {/* Route Name */}
                            {transit?.line?.name && (
                              <p
                                style={{
                                  margin: '0 0 6px 0',
                                  fontSize: '12px',
                                  color: '#666',
                                }}
                              >
                                {transit.line.name}
                              </p>
                            )}

                            {/* Stops */}
                            <p
                              style={{
                                margin: '0 0 4px 0',
                                fontSize: '12px',
                                color: '#333',
                              }}
                            >
                              {transit?.departure_stop?.name} →{' '}
                              {transit?.arrival_stop?.name}
                            </p>

                            {/* Number of Stops */}
                            <p
                              style={{
                                margin: '0 0 6px 0',
                                fontSize: '11px',
                                color: '#999',
                              }}
                            >
                              {transit?.num_stops || 0} stop
                              {(transit?.num_stops || 0) !== 1 ? 's' : ''}
                            </p>

                            {/* Times and Duration */}
                            <p
                              style={{
                                margin: 0,
                                fontSize: '11px',
                                color: '#666',
                              }}
                            >
                              ⏱️ {transit?.departure_time?.text || 'N/A'} -{' '}
                              {transit?.arrival_time?.text || 'N/A'} •{' '}
                              {step.duration?.text || 'N/A'}
                            </p>

                            {/* Agency */}
                            {transit?.line?.agencies?.[0]?.name && (
                              <p
                                style={{
                                  margin: '4px 0 0 0',
                                  fontSize: '10px',
                                  color: '#999',
                                }}
                              >
                                {transit.line.agencies[0].name}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Walking/Regular Step
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '12px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            borderLeft: '3px solid #2255cc',
                          }}
                        >
                          <div
                            style={{
                              minWidth: '24px',
                              height: '24px',
                              backgroundColor: '#2255cc',
                              color: '#fff',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold',
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
                              {stripHtml(step.html_instructions || '')}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: '11px',
                                color: '#999',
                              }}
                            >
                              {step.distance?.text || 'N/A'} •{' '}
                              {step.duration?.text || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* No Route Found */}
        {!currentRoute && !isLoading && !error && (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p style={{ color: '#666' }}>Click the Get Directions button to load directions</p>
          </div>
        )}
      </div>
    </div>
  )
}
