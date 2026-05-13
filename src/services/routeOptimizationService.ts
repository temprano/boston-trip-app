// Route optimization service - reorder activities by proximity
import { Activity, Location } from '../types'

export interface OptimizedRoute {
  orderedActivities: Activity[]
  totalDistance: number
  activityIds: string[]
}

export const routeOptimizationService = {
  // Calculate distance between two points (Haversine formula)
  calculateDistance(from: Location, to: Location): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((to.lat - from.lat) * Math.PI) / 180
    const dLng = ((to.lng - from.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.lat * Math.PI) / 180) *
        Math.cos((to.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  // Nearest neighbor algorithm - greedy optimization
  optimizeByProximity(
    activities: Activity[],
    startLocation: Location
  ): OptimizedRoute {
    if (activities.length === 0) {
      return {
        orderedActivities: [],
        totalDistance: 0,
        activityIds: [],
      }
    }

    const remaining = [...activities]
    const ordered: Activity[] = []
    let currentLocation = startLocation
    let totalDistance = 0

    // Greedy nearest neighbor approach
    while (remaining.length > 0) {
      let nearest = 0
      let minDistance = Infinity

      for (let i = 0; i < remaining.length; i++) {
        const distance = this.calculateDistance(
          currentLocation,
          remaining[i].location
        )
        if (distance < minDistance) {
          minDistance = distance
          nearest = i
        }
      }

      const activity = remaining[nearest]
      ordered.push(activity)
      currentLocation = activity.location
      totalDistance += minDistance
      remaining.splice(nearest, 1)
    }

    return {
      orderedActivities: ordered,
      totalDistance,
      activityIds: ordered.map((a) => a.id),
    }
  },

  // Calculate total route distance
  calculateTotalDistance(activities: Activity[], startLocation: Location): number {
    let total = 0
    let current = startLocation

    for (const activity of activities) {
      total += this.calculateDistance(current, activity.location)
      current = activity.location
    }

    return total
  },

  // Get distances from user to each activity
  getDistancesToActivities(
    activities: Activity[],
    userLocation: Location
  ): Map<string, number> {
    const distances = new Map<string, number>()

    for (const activity of activities) {
      const distance = this.calculateDistance(userLocation, activity.location)
      distances.set(activity.id, distance)
    }

    return distances
  },

  // Sort activities by distance from user (nearest first)
  sortByDistance(activities: Activity[], userLocation: Location): Activity[] {
    return [...activities].sort((a, b) => {
      const distA = this.calculateDistance(userLocation, a.location)
      const distB = this.calculateDistance(userLocation, b.location)
      return distA - distB
    })
  },
}
