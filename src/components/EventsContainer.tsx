import { useAppStore } from '../store/appStore'
import { Activity } from '../types'
import { Clock, MapPin, Utensils, Camera, Music, Navigation } from 'lucide-react'

interface EventsContainerProps {
  activities?: Activity[]
  className?: string
}

const getCategoryIcon = (category: Activity['category']) => {
  switch (category) {
    case 'food':
      return <Utensils className="w-5 h-5" />
    case 'sightseeing':
      return <Camera className="w-5 h-5" />
    case 'entertainment':
      return <Music className="w-5 h-5" />
    case 'transport':
      return <Navigation className="w-5 h-5" />
    default:
      return <Clock className="w-5 h-5" />
  }
}

const getCategoryColor = (category: Activity['category']) => {
  switch (category) {
    case 'food':
      return 'bg-orange-500'
    case 'sightseeing':
      return 'bg-blue-500'
    case 'entertainment':
      return 'bg-purple-500'
    case 'transport':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

export function EventsContainer({ activities, className = '' }: EventsContainerProps) {
  const itinerary = useAppStore((state) => state.currentItinerary)
  
  // Use provided activities or fetch all activities from itinerary
  const displayActivities = activities || 
    (itinerary?.days.flatMap((day) => day.activities) || [])

  return (
    <div
      className={`scrollable-events-container ${className}`}
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        flex: 1,
        paddingBottom: '8px',
        scrollBehavior: 'smooth',
      }}
    >
      {displayActivities.length === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: '#999999',
            fontSize: '14px',
          }}
        >
          No activities scheduled
        </div>
      ) : (
        <div style={{ padding: '16px' }}>
          {displayActivities.map((activity) => (
            <div
              key={activity.id}
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                borderLeft: `4px solid var(--color-text-accent)`,
              }}
            >
              {/* Header: Time + Category */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  <Clock className="w-4 h-4" />
                  {activity.time}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: getCategoryColor(activity.category),
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {getCategoryIcon(activity.category)}
                  <span style={{ textTransform: 'capitalize' }}>
                    {activity.category}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3
                style={{
                  margin: '0 0 8px 0',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                {activity.title}
              </h3>

              {/* Description */}
              {activity.description && (
                <p
                  style={{
                    margin: '0 0 8px 0',
                    color: '#a0a0a0',
                    fontSize: '13px',
                    lineHeight: '1.4',
                  }}
                >
                  {activity.description}
                </p>
              )}

              {/* Duration */}
              <div
                style={{
                  color: '#888888',
                  fontSize: '12px',
                  marginBottom: '8px',
                }}
              >
                Duration: {activity.duration}
                {activity.duration === 1 ? ' hour' : ' hours'}
              </div>

              {/* Location */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  color: '#2255cc',
                  fontSize: '13px',
                  marginBottom: activity.notes ? '8px' : '0',
                }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div>{activity.location.name}</div>
                  {activity.location.address && (
                    <div style={{ fontSize: '12px', color: '#999999' }}>
                      {activity.location.address}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {activity.notes && (
                <div
                  style={{
                    backgroundColor: '#0d0d0d',
                    padding: '8px',
                    borderRadius: '4px',
                    borderLeft: '2px solid #666666',
                    color: '#999999',
                    fontSize: '12px',
                    lineHeight: '1.4',
                  }}
                >
                  <strong>Note:</strong> {activity.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
