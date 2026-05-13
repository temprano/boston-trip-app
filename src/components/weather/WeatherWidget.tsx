import { useEffect, useState } from 'react'
import { Cloud, Droplets, Wind, Eye, Gauge } from 'lucide-react'
import { GlassCard } from '../glass'
import { weatherService } from '../../services/weatherService'

interface WeatherData {
  temp: number
  feelsLike: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  windDirection: string
  cloudCover: number
  visibility?: number
  pressure: number
}

interface WeatherWidgetProps {
  lat?: number
  lon?: number
  title?: string
  compact?: boolean
}

export function WeatherWidget({
  lat = 42.36,
  lon = -71.06,
  title = 'Boston Weather',
  compact = false,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setLoading(true)
        const data = await weatherService.getCurrentWeather(lat, lon)

        setWeather({
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          description:
            data.weather[0]?.description || 'Unknown conditions',
          icon: data.weather[0]?.icon || '01d',
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
          windDirection: weatherService.getWindDirection(data.wind.deg),
          cloudCover: data.clouds.all,
          pressure: data.main.pressure,
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weather')
        console.error('Weather fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadWeather()
  }, [lat, lon])

  if (loading) {
    return (
      <GlassCard className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Loading weather...</p>
      </GlassCard>
    )
  }

  if (error) {
    return (
      <GlassCard className="text-center py-8 border border-red-300">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </GlassCard>
    )
  }

  if (!weather) return null

  if (compact) {
    // Compact inline widget
    return (
      <GlassCard className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {weather.temp}°C
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {weather.description}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Feels like {weather.feelsLike}°C
            </p>
          </div>

          <div className="flex gap-3 text-gray-700 dark:text-gray-300">
            <div className="text-center text-xs">
              <Droplets className="w-4 h-4 mx-auto mb-1" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="text-center text-xs">
              <Wind className="w-4 h-4 mx-auto mb-1" />
              <span>{weather.windSpeed}km/h</span>
            </div>
          </div>
        </div>
      </GlassCard>
    )
  }

  // Full detailed widget
  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {weather.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-gray-900 dark:text-white">
              {weather.temp}°
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Feels like {weather.feelsLike}°
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {/* Humidity */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Humidity
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {weather.humidity}%
              </p>
            </div>
          </div>

          {/* Wind */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
              <Wind className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Wind
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {weather.windSpeed}
                <span className="text-sm ml-1">km/h</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {weather.windDirection}
              </p>
            </div>
          </div>

          {/* Cloud Cover */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Cloud className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Clouds
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {weather.cloudCover}%
              </p>
            </div>
          </div>

          {/* Pressure */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Pressure
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {weather.pressure}
                <span className="text-sm ml-1">hPa</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
