import React, { useMemo, useState } from 'react'
import { Day } from '../types'
import { ActivityItem } from './ActivityItem'
import { GlassPanel } from '../components/glass'
import { Calendar, MapPin, Zap } from 'lucide-react'

interface DayViewProps {
  day: Day
  showMapPreviews?: boolean
}

interface ActivityStats {
  totalActivities: number
  totalDuration: number
  categories: Record<string, number>
}

export const DayView: React.FC<DayViewProps> = ({ day, showMapPreviews = false }) => {
  const [sortBy, setSortBy] = useState<'time' | 'category'>('time')

  // Calculate stats
  const stats = useMemo<ActivityStats>(() => {
    const categories: Record<string, number> = {}

    day.activities.forEach((activity) => {
      categories[activity.category] = (categories[activity.category] || 0) + 1
    })

    return {
      totalActivities: day.activities.length,
      totalDuration: day.activities.reduce((sum, a) => sum + a.duration, 0),
      categories,
    }
  }, [day])

  // Sort activities
  const sortedActivities = useMemo(() => {
    if (sortBy === 'time') {
      return [...day.activities].sort((a, b) => a.time.localeCompare(b.time))
    } else {
      return [...day.activities].sort((a, b) => a.category.localeCompare(b.category))
    }
  }, [day.activities, sortBy])

  // Format date for display
  const dateObj = new Date(day.date)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  if (day.activities.length === 0) {
    return (
      <GlassPanel title={`${day.dayOfWeek} - ${day.date}`} displacementScale={60} elasticity={0.25}>
        <div className="py-12 text-center">
          <MapPin className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Activities</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This day is completely free! Add some activities to plan your day.
          </p>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
            + Add Activity
          </button>
        </div>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel title={`${day.dayOfWeek} - ${day.date}`} displacementScale={60} elasticity={0.25}>
      <div className="space-y-4">
        {/* Header Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <div className="text-xs text-gray-600 dark:text-gray-400">Date</div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm">{formattedDate}</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
            <div className="text-xs text-gray-600 dark:text-gray-400">Activities</div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {stats.totalActivities}
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Time</div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
            <div className="text-xs text-gray-600 dark:text-gray-400">Categories</div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {Object.keys(stats.categories).length}
            </div>
          </div>
        </div>

        {/* Day Notes */}
        {day.notes && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3 rounded">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{day.notes}</p>
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
          <Zap className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
          <button
            onClick={() => setSortBy('time')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              sortBy === 'time'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Time
          </button>
          <button
            onClick={() => setSortBy('category')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              sortBy === 'category'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Category
          </button>
        </div>

        {/* Activities List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} showMapPreview={showMapPreviews} />
          ))}
        </div>
      </div>
    </GlassPanel>
  )
}
