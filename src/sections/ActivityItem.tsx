import React, { useState } from 'react'
import { Activity } from '../types'
import { GlassCard } from '../components/glass'
import { MapPin, Clock, Tag, ChevronDown, Map } from 'lucide-react'

interface ActivityItemProps {
  activity: Activity
  showMapPreview?: boolean
}

const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  food: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200', icon: '🍽️' },
  sightseeing: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', icon: '🏛️' },
  entertainment: { bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-800 dark:text-pink-200', icon: '🎭' },
  transport: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', icon: '🚗' },
  other: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200', icon: '📌' },
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, showMapPreview = false }) => {
  const [isMapOpen, setIsMapOpen] = useState(false)
  const colors = categoryColors[activity.category] || categoryColors.other

  return (
    <GlassCard
      className="mb-3 cursor-default hover:shadow-lg transition-shadow"
      displacementScale={35}
      elasticity={0.18}
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Time Badge */}
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg p-2 w-14 text-center">
              <span className="text-white font-bold text-sm">{activity.time}</span>
            </div>
          </div>

          {/* Title and Category */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{activity.title}</h4>
            <span className={`text-xs font-medium px-2 py-1 rounded inline-block mt-1 ${colors.bg} ${colors.text}`}>
              {colors.icon} {activity.category}
            </span>
          </div>

          {/* Duration */}
          <div className="flex-shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5" />
              <span>{activity.duration}m</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-3 pl-16">
          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-white">{activity.location.name}</p>
            {activity.location.address && (
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{activity.location.address}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 pl-16 line-clamp-2">
            {activity.description}
          </p>
        )}

        {/* Notes */}
        {activity.notes && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-400 p-2 mb-3 ml-16 text-xs text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Note:</span> {activity.notes}
          </div>
        )}

        {/* Map Preview Toggle */}
        {showMapPreview && (
          <div className="mt-3 pl-16">
            <button
              onClick={() => setIsMapOpen(!isMapOpen)}
              className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <Map className="w-3.5 h-3.5" />
              {isMapOpen ? 'Hide Map' : 'Show Map'}
              <ChevronDown className={`w-3 h-3 transition-transform ${isMapOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMapOpen && (
              <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Map className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Map for: {activity.location.name}</p>
                  <p className="text-xs mt-1">Lat: {activity.location.lat.toFixed(4)}</p>
                  <p className="text-xs">Lng: {activity.location.lng.toFixed(4)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
