import { useEffect, useState } from 'react'
import { MapPin, Navigation, Clock, Loader } from 'lucide-react'
import { GlassCard } from '../glass'
import { mapsService, Location, DirectionsResult } from '../../services/mapsService'

interface DirectionsWidgetProps {
  origin: Location
  destination: Location
  compact?: boolean
}

export function DirectionsWidget({
  origin,
  destination,
  compact = false,
}: DirectionsWidgetProps) {
  const [directions, setDirections] = useState<DirectionsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDirections = async () => {
      try {
        setLoading(true)
        const result = await mapsService.getDirections(origin, destination)
        setDirections(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load directions')
        console.error('Directions error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDirections()
  }, [origin, destination])

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading directions...</span>
        </div>
      </GlassCard>
    )
  }

  if (error) {
    return (
      <GlassCard className="p-4 border border-red-300">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </GlassCard>
    )
  }

  if (!directions) return null

  if (compact) {
    // Compact inline view
    return (
      <GlassCard className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-gray-700 dark:text-gray-300">
            <div className="text-center text-xs">
              <Navigation className="w-4 h-4 mx-auto mb-1" />
              <span>{directions.distance}</span>
            </div>
            <div className="text-center text-xs">
              <Clock className="w-4 h-4 mx-auto mb-1" />
              <span>{directions.duration}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    )
  }

  // Full detailed view
  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Directions
        </h3>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Distance
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {directions.distance}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Duration
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {directions.duration}
          </p>
        </div>
      </div>

      {/* Steps */}
      {directions.steps.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Route
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {directions.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-6">
                  {idx + 1}.
                </span>
                <p dangerouslySetInnerHTML={{ __html: step }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  )
}
