import { describe, it, expect } from 'vitest'
import { routeOptimizationService } from './routeOptimizationService'
import { Activity, Location } from '../types'

describe('Route Optimization Service', () => {
  const bostonLocation: Location = { lat: 42.36, lng: -71.06, name: 'Boston' }
  const loc1: Location = { lat: 42.361, lng: -71.059, name: 'Loc1' }
  const loc2: Location = { lat: 42.362, lng: -71.060, name: 'Loc2' }
  const loc3: Location = { lat: 42.363, lng: -71.061, name: 'Loc3' }

  const mockActivities: Activity[] = [
    {
      id: '1',
      title: 'Museum',
      time: '09:00',
      duration: 120,
      location: loc1,
      category: 'sightseeing',
    },
    {
      id: '2',
      title: 'Restaurant',
      time: '12:00',
      duration: 60,
      location: loc2,
      category: 'food',
    },
    {
      id: '3',
      title: 'Park',
      time: '15:00',
      duration: 90,
      location: loc3,
      category: 'sightseeing',
    },
  ]

  it('should calculate distance between two locations', () => {
    const distance = routeOptimizationService.calculateDistance(
      bostonLocation,
      loc1
    )
    expect(distance).toBeGreaterThan(0)
    expect(distance).toBeLessThan(0.2) // Nearby locations
  })

  it('should optimize route by proximity', () => {
    const optimized = routeOptimizationService.optimizeByProximity(
      mockActivities,
      bostonLocation
    )

    expect(optimized.orderedActivities).toHaveLength(3)
    expect(optimized.activityIds).toHaveLength(3)
    expect(optimized.totalDistance).toBeGreaterThan(0)
  })

  it('should handle empty activity list', () => {
    const optimized = routeOptimizationService.optimizeByProximity(
      [],
      bostonLocation
    )

    expect(optimized.orderedActivities).toHaveLength(0)
    expect(optimized.activityIds).toHaveLength(0)
    expect(optimized.totalDistance).toBe(0)
  })

  it('should calculate total distance for route', () => {
    const distance = routeOptimizationService.calculateTotalDistance(
      mockActivities,
      bostonLocation
    )
    expect(distance).toBeGreaterThan(0)
  })

  it('should get distances to each activity', () => {
    const distances = routeOptimizationService.getDistancesToActivities(
      mockActivities,
      bostonLocation
    )

    expect(distances.size).toBe(3)
    expect(distances.get('1')).toBeGreaterThan(0)
    expect(distances.get('2')).toBeGreaterThan(0)
    expect(distances.get('3')).toBeGreaterThan(0)
  })

  it('should sort activities by distance', () => {
    const sorted = routeOptimizationService.sortByDistance(
      mockActivities,
      bostonLocation
    )

    expect(sorted).toHaveLength(3)
    // First activity should be closer than last
    const firstDist = routeOptimizationService.calculateDistance(
      bostonLocation,
      sorted[0].location
    )
    const lastDist = routeOptimizationService.calculateDistance(
      bostonLocation,
      sorted[sorted.length - 1].location
    )
    expect(firstDist).toBeLessThanOrEqual(lastDist)
  })
})
