import { useEffect, useState } from 'react'
import { MapPin, Star, Loader } from 'lucide-react'
import { GlassCard } from '../glass'
import { mapsService, Location, PlaceDetails } from '../../services/mapsService'

interface NearbyPlacesWidgetProps {
  location: Location
  placeType: string
  radius?: number
  title?: string
  maxResults?: number
}

export function NearbyPlacesWidget({
  location,
  placeType,
  radius = 1000,
  title = 'Nearby Places',
  maxResults = 5,
}: NearbyPlacesWidgetProps) {
  const [places, setPlaces] = useState<PlaceDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setLoading(true)
        const results = await mapsService.getNearbyPlaces(
          location,
          placeType,
          radius
        )
        setPlaces(results.slice(0, maxResults))
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load places')
        console.error('Nearby places error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPlaces()
  }, [location, placeType, radius, maxResults])

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading {placeType}...</span>
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

  if (places.length === 0) {
    return (
      <GlassCard className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No {placeType} found nearby
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
          {places.length}
        </span>
      </div>

      <div className="space-y-3">
        {places.map((place, idx) => (
          <div
            key={idx}
            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {place.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {place.address}
                </p>
              </div>
              {place.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {place.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
