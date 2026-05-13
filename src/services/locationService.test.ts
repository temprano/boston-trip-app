import { describe, it, expect, beforeEach, vi } from 'vitest'
import { locationService } from './locationService'

describe('Location Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should check geolocation support', () => {
    const supported = locationService.isSupported()
    expect(typeof supported).toBe('boolean')
  })

  it('should calculate bearing between two points', () => {
    const from = { lat: 42.36, lng: -71.06 }
    const to = { lat: 42.37, lng: -71.05 }

    const bearing = locationService.calculateBearing(from, to)

    expect(bearing).toBeGreaterThanOrEqual(0)
    expect(bearing).toBeLessThan(360)
  })

  it('should handle bearing calculation for same point', () => {
    const point = { lat: 42.36, lng: -71.06 }
    const bearing = locationService.calculateBearing(point, point)

    expect(bearing).toBeGreaterThanOrEqual(0)
    expect(bearing).toBeLessThan(360)
  })

  it('should get permission status', async () => {
    const status = await locationService.getPermissionStatus()

    expect(status).toHaveProperty('granted')
    expect(status).toHaveProperty('denied')
    expect(status).toHaveProperty('prompt')
  })

  it('should handle north bearing correctly', () => {
    const south = { lat: 40.0, lng: 0.0 }
    const north = { lat: 41.0, lng: 0.0 }

    const bearing = locationService.calculateBearing(south, north)
    // Should be roughly 0 (north) or 360
    expect(bearing).toBeLessThan(45)
  })

  it('should handle east bearing correctly', () => {
    const west = { lat: 40.0, lng: -1.0 }
    const east = { lat: 40.0, lng: 0.0 }

    const bearing = locationService.calculateBearing(west, east)
    // Should be roughly 90 (east)
    expect(bearing).toBeGreaterThan(45)
    expect(bearing).toBeLessThan(135)
  })
})
