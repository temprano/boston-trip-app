import { describe, it, expect } from 'vitest'
import { mapsService, Location } from './mapsService'

describe('Maps Service', () => {
  const bostonLocation: Location = { lat: 42.36, lng: -71.06, name: 'Boston' }
  const cambridgeLocation: Location = {
    lat: 42.3736,
    lng: -71.1097,
    name: 'Cambridge',
  }

  it('should calculate distance between two locations', () => {
    const distance = mapsService.calculateDistance(
      bostonLocation,
      cambridgeLocation
    )

    expect(distance).toBeGreaterThan(0)
    expect(distance).toBeLessThan(10) // Should be roughly 4-5 km
  })

  it('should calculate zero distance for same location', () => {
    const distance = mapsService.calculateDistance(
      bostonLocation,
      bostonLocation
    )

    expect(distance).toBe(0)
  })

  it('should generate correct static map URL', () => {
    const url = mapsService.getMapEmbedUrl(bostonLocation, 15)

    expect(url).toContain('maps.googleapis.com')
    expect(url).toContain('42.36')
    expect(url).toContain('-71.06')
    expect(url).toContain('zoom=15')
    expect(url).toContain('600x400')
  })

  it('should fetch directions between locations', async () => {
    const directions = await mapsService.getDirections(
      bostonLocation,
      cambridgeLocation
    )

    expect(directions.distance).toBeDefined()
    expect(directions.duration).toBeDefined()
    expect(directions.steps).toBeInstanceOf(Array)
    expect(directions.distance).toContain('km')
    expect(directions.duration).toContain('min')
  })

  it('should fetch nearby places of a given type', async () => {
    const places = await mapsService.getNearbyPlaces(
      bostonLocation,
      'restaurant',
      1000
    )

    expect(places).toBeInstanceOf(Array)
    expect(places.length).toBeGreaterThan(0)
    expect(places[0]).toHaveProperty('name')
    expect(places[0]).toHaveProperty('address')
    expect(places[0]).toHaveProperty('lat')
    expect(places[0]).toHaveProperty('lng')
  })

  it('should handle custom radius for nearby places search', async () => {
    const places = await mapsService.getNearbyPlaces(
      bostonLocation,
      'cafe',
      500
    )

    expect(places).toBeInstanceOf(Array)
    // Result count may vary based on API response
  })
})
