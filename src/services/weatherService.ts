// Weather service - fetches from OpenWeatherMap (mocked by MSW in dev)
interface WeatherResponse {
  name: string
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    humidity: number
    pressure: number
  }
  wind: {
    speed: number
    deg: number
  }
  clouds: {
    all: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  dt: number
}

interface ForecastResponse {
  list: Array<{
    dt: number
    main: {
      temp: number
      humidity: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
    wind: {
      speed: number
    }
    clouds: {
      all: number
    }
  }>
}

const API_BASE = 'https://api.openweathermap.org/data/2.5'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo-key'

export const weatherService = {
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherResponse> {
    const url = `${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`)
    }
    return response.json()
  },

  async getForecast(lat: number, lon: number): Promise<ForecastResponse> {
    const url = `${API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.statusText}`)
    }
    return response.json()
  },

  // Get weather icon URL
  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  },

  // Convert wind degree to direction
  getWindDirection(degrees: number): string {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ]
    const normalizedDegrees = ((degrees + 11.25) % 360)
    const index = Math.floor(normalizedDegrees / 22.5)
    return directions[index % 16]
  },
}
