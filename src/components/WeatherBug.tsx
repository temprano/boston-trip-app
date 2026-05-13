import { useEffect, useState } from 'react'
import { Sun, Cloud, CloudRain, Wind } from 'lucide-react'
import { weatherService } from '../services/weatherService'

interface WeatherData {
  dayDate: string
  highTemp: number
  lowTemp: number
  condition: string
  icon: string
}

interface WeatherBugProps {
  date?: string
}

export function WeatherBug({ date }: WeatherBugProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)

        // Parse date parameter (MM/DD/YYYY format)
        let eventDate = new Date()
        if (date) {
          const [month, day, year] = date.split('/').map(Number)
          eventDate = new Date(year, month - 1, day) // month is 0-indexed
        }

        const dayName = eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
        })
        const monthName = eventDate.toLocaleDateString('en-US', { month: 'long' })
        const dayNum = eventDate.getDate()

        // Add ordinal suffix (1ST, 2ND, 3RD, etc)
        const getOrdinal = (n: number) => {
          const s = ['TH', 'ST', 'ND', 'RD']
          const v = n % 100
          return n + (s[(v - 20) % 10] || s[v] || s[0])
        }

        const dayDate = `${dayName.toUpperCase()} ${monthName.toUpperCase()} ${getOrdinal(dayNum)}`

        // Fetch 5-day forecast for Boston
        const forecastData = await weatherService.getForecast(42.3601, -71.0589)

        // Find forecasts for the event date
        const eventDateStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 0, 0, 0).getTime() / 1000
        const eventDateEnd = eventDateStart + 86400 // 24 hours later

        // Filter forecast entries for this specific date
        const dayForecasts = forecastData.list.filter((entry) => entry.dt >= eventDateStart && entry.dt < eventDateEnd)

        if (dayForecasts.length > 0) {
          // Calculate high/low temps for the day
          const temps = dayForecasts.map((f) => f.main.temp)
          const highTemp = Math.max(...temps)
          const lowTemp = Math.min(...temps)

          // Use the weather from the first entry (representative of the day)
          const condition = dayForecasts[0].weather[0]?.main || 'Clear'
          const icon = dayForecasts[0].weather[0]?.icon || '01d'

          setWeather({
            dayDate,
            highTemp: Math.round(highTemp),
            lowTemp: Math.round(lowTemp),
            condition,
            icon,
          })
        } else {
          // Fallback to current weather if no forecast found for date
          const data = await weatherService.getCurrentWeather(42.3601, -71.0589)
          setWeather({
            dayDate,
            highTemp: Math.round(data.main.temp_max),
            lowTemp: Math.round(data.main.temp_min),
            condition: data.weather[0]?.main || 'Clear',
            icon: data.weather[0]?.icon || '01d',
          })
        }
        setError(null)
      } catch (err) {
        console.error('Weather fetch error:', err)
        setError('Unable to load weather')
        // Set default values on error with parsed date
        let eventDate = new Date()
        if (date) {
          const [month, day, year] = date.split('/').map(Number)
          eventDate = new Date(year, month - 1, day)
        }
        const dayName = eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
        })
        const monthName = eventDate.toLocaleDateString('en-US', { month: 'long' })
        const dayNum = eventDate.getDate()

        const getOrdinal = (n: number) => {
          const s = ['TH', 'ST', 'ND', 'RD']
          const v = n % 100
          return n + (s[(v - 20) % 10] || s[v] || s[0])
        }

        const dayDate = `${dayName.toUpperCase()} ${monthName.toUpperCase()} ${getOrdinal(dayNum)}`

        setWeather({
          dayDate,
          highTemp: 72,
          lowTemp: 59,
          condition: 'Clear',
          icon: '01d',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [date])

  // Get weather icon based on condition
  const getWeatherIcon = () => {
    if (!weather) return null

    const condition = weather.condition.toLowerCase()

    if (
      condition.includes('clear') ||
      condition.includes('sunny') ||
      weather.icon.includes('01')
    ) {
      return <Sun className="w-10 h-10" style={{ color: '#f5c518' }} />
    } else if (
      condition.includes('cloud') ||
      weather.icon.includes('02') ||
      weather.icon.includes('03') ||
      weather.icon.includes('04')
    ) {
      return <Cloud className="w-10 h-10" style={{ color: '#f5c518' }} />
    } else if (
      condition.includes('rain') ||
      weather.icon.includes('09') ||
      weather.icon.includes('10')
    ) {
      return <CloudRain className="w-10 h-10" style={{ color: '#f5c518' }} />
    } else if (condition.includes('wind')) {
      return <Wind className="w-10 h-10" style={{ color: '#f5c518' }} />
    }

    // Default to sun
    return <Sun className="w-10 h-10" style={{ color: '#f5c518' }} />
  }

  if (loading) {
    return <div className="weather-bug" />
  }

  if (error && !weather) {
    return <div className="weather-bug" />
  }

  return (
    <div className="weather-bug" style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
      <div className="weather-date" style={{ whiteSpace: 'nowrap', flexShrink: 0, color: '#ffffff' }}>{weather?.dayDate}</div>
      <div className="weather-temps" style={{ whiteSpace: 'nowrap', flex: 1, flexShrink: 0, color: '#ffffff' }}>
        HI: {weather?.highTemp}° LO: {weather?.lowTemp}°
      </div>
      <div className="weather-icon" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {getWeatherIcon()}
      </div>
    </div>
  )
}
