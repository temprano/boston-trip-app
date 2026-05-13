import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useAppStore } from './store'

describe('App & Data Loading', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      currentItinerary: null,
      travelers: [],
      isOffline: false,
      theme: 'light',
    })
  })

  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have MSW mocks available', async () => {
    const response = await fetch(
      'https://api.openweathermap.org/data/2.5/weather?lat=42.36&lon=-71.06'
    )
    const data = await response.json()
    expect(data.name).toBe('Boston')
    expect(data.main.temp).toBeGreaterThan(0)
  })

  it('should verify mock data service returns data', async () => {
    const { mockDataService } = await import('./services/mockDataService')

    const itinerary = await mockDataService.getItinerary()
    expect(itinerary).not.toBeNull()
    expect(itinerary.title).toBe('Boston Adventure 2026')
    expect(itinerary.days).toHaveLength(2)

    const travelers = await mockDataService.getTravelers()
    expect(travelers).toHaveLength(3)
    expect(travelers[0].name).toBe('Jeff Svehla')
  })
})
