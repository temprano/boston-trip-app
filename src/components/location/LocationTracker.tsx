import { useEffect, useState } from 'react'
import { MapPin, Navigation, Loader, AlertCircle, Zap } from 'lucide-react'
import { GlassCard } from '../glass'
import { locationService } from '../../services/locationService'
import { useAppStore } from '../../store'
import { Location } from '../../types'

export function LocationTracker() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [watchId, setWatchId] = useState<number>(-1)

  const userLocation = useAppStore((state) => state.userLocation)
  const isTracking = useAppStore((state) => state.isTrackingLocation)
  const setUserLocation = useAppStore((state) => state.setUserLocation)
  const setIsTracking = useAppStore((state) => state.setIsTrackingLocation)
  const itinerary = useAppStore((state) => state.currentItinerary)

  // Get current position once
  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true)
      setError(null)
      const location = await locationService.getCurrentPosition()
      setUserLocation({
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get location'
      )
      console.error('Location error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Start watching position
  const handleStartTracking = async () => {
    try {
      setError(null)
      setIsTracking(true)

      const id = locationService.watchPosition(
        (location) => {
          setUserLocation({
            lat: location.lat,
            lng: location.lng,
            accuracy: location.accuracy,
            timestamp: location.timestamp,
          })
        },
        (err) => {
          setError(err.message)
          setIsTracking(false)
        }
      )

      setWatchId(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start tracking')
      setIsTracking(false)
    }
  }

  // Stop watching position
  const handleStopTracking = () => {
    if (watchId !== -1) {
      locationService.stopWatching(watchId)
      setWatchId(-1)
    }
    setIsTracking(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== -1) {
        locationService.stopWatching(watchId)
      }
    }
  }, [watchId])

  // Calculate distance to first activity
  useEffect(() => {
    if (userLocation && itinerary?.days[0]?.activities[0]) {
      const firstActivity = itinerary.days[0].activities[0]
      const dist = calculateDistance(userLocation, firstActivity.location)
      setDistance(dist)
    }
  }, [userLocation, itinerary])

  const calculateDistance = (from: Location, to: Location): number => {
    const R = 6371
    const dLat = ((to.lat - from.lat) * Math.PI) / 180
    const dLng = ((to.lng - from.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.lat * Math.PI) / 180) *
        Math.cos((to.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Location Tracker
        </h3>
        {isTracking && (
          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
            Live
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {userLocation ? (
        <div className="space-y-4">
          {/* Current Location */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Latitude
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {userLocation.lat.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Longitude
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {userLocation.lng.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Distance to next activity */}
          {distance !== null && itinerary?.days[0]?.activities[0] && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                Distance to {itinerary.days[0].activities[0].title}
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {distance.toFixed(2)} km
              </p>
            </div>
          )}

          {/* Tracking Status */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {isTracking
                ? '📍 Real-time tracking active'
                : '📍 One-time location'}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400 py-4">
          No location data yet
        </p>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!userLocation ? (
          <button
            onClick={handleGetCurrentLocation}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Getting...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Get Location
              </>
            )}
          </button>
        ) : isTracking ? (
          <button
            onClick={handleStopTracking}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Stop Tracking
          </button>
        ) : (
          <button
            onClick={handleStartTracking}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            <Zap className="w-4 h-4" />
            Start Tracking
          </button>
        )}
      </div>
    </GlassCard>
  )
}
