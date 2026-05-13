import { useEffect, useRef, useState } from 'react'
import { Map, Navigation, Activity } from 'lucide-react'
import { GlassCard } from '../glass'
import { Location, Activity as ActivityType } from '../../types'

interface InteractiveMapProps {
  center: Location
  activities: ActivityType[]
  userLocation?: Location | null
  zoom?: number
  height?: string
}

export function InteractiveMap({
  center,
  activities,
  userLocation,
  zoom = 14,
  height = 'h-96',
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // In development, we'll show a static map image
  // In production, you'd integrate with @react-google-maps/api

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=600x400&maptype=roadmap&markers=color:blue|label:S|${center.lat},${center.lng}${activities
    .map((a, i) => `&markers=color:red|label:${i + 1}|${a.location.lat},${a.location.lng}`)
    .join('')}${
    userLocation
      ? `&markers=color:green|label:U|${userLocation.lat},${userLocation.lng}`
      : ''
  }&key=demo-key`

  return (
    <GlassCard className={`${height} overflow-hidden`}>
      <div ref={mapRef} className="w-full h-full flex flex-col">
        {mapLoaded && !error ? (
          <div className="w-full h-full flex flex-col">
            {/* Map Image */}
            <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
              <img
                src={staticMapUrl}
                alt="Trip map"
                className="w-full h-full object-cover"
                onError={() => setError('Map unavailable')}
              />
            </div>

            {/* Legend */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">Center</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Activities ({activities.length})
                </span>
              </div>

              {userLocation && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Your Location
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {error || 'Loading map...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
