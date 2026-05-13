import { describe, it, expect, beforeEach, vi } from 'vitest'
import { weatherService } from './weatherService'

describe('Weather Service', () => {
  it('should fetch current weather for Boston', async () => {
    const weather = await weatherService.getCurrentWeather(42.36, -71.06)

    expect(weather.name).toBe('Boston')
    expect(weather.main.temp).toBeGreaterThan(0)
    expect(weather.main.humidity).toBeDefined()
    expect(weather.wind.speed).toBeDefined()
  })

  it('should fetch forecast for Boston', async () => {
    const forecast = await weatherService.getForecast(42.36, -71.06)

    expect(forecast.list).toBeInstanceOf(Array)
    expect(forecast.list.length).toBeGreaterThan(0)
    expect(forecast.list[0].main.temp).toBeDefined()
    expect(forecast.list[0].weather).toBeInstanceOf(Array)
  })

  it('should generate correct weather icon URL', () => {
    const iconUrl = weatherService.getWeatherIconUrl('01d')

    expect(iconUrl).toBe('https://openweathermap.org/img/wn/01d@2x.png')
  })

  it('should convert degrees to wind direction', () => {
    expect(weatherService.getWindDirection(0)).toBe('N')
    expect(weatherService.getWindDirection(90)).toBe('E')
    expect(weatherService.getWindDirection(180)).toBe('S')
    expect(weatherService.getWindDirection(270)).toBe('W')
    expect(weatherService.getWindDirection(45)).toBe('NE')
    expect(weatherService.getWindDirection(225)).toBe('SW')
  })

  it('should handle wind direction wrap-around', () => {
    const direction = weatherService.getWindDirection(359)
    expect(['N', 'NNW', 'NNE']).toContain(direction)
  })
})
