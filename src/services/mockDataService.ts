import { mockItinerary, mockTravelers } from '../data/mockData'
import { Itinerary, Traveler } from '../types'

/**
 * Mock Data Service - provides mock itinerary and traveler data
 * Later can be replaced with actual API calls
 */

export const mockDataService = {
  /**
   * Get the mock itinerary
   */
  getItinerary: async (): Promise<Itinerary> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockItinerary
  },

  /**
   * Get all travelers for the current itinerary
   */
  getTravelers: async (): Promise<Traveler[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockTravelers
  },

  /**
   * Get a specific traveler by ID
   */
  getTravelerById: async (id: string): Promise<Traveler | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockTravelers.find((t) => t.id === id) || null
  },

  /**
   * Get activities for a specific day
   */
  getActivitiesForDay: async (dayId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const day = mockItinerary.days.find((d) => d.id === dayId)
    return day?.activities || []
  },

  /**
   * Update itinerary (mock - just returns updated data)
   */
  updateItinerary: async (updated: Partial<Itinerary>): Promise<Itinerary> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return { ...mockItinerary, ...updated, updatedAt: new Date() }
  },

  /**
   * Update traveler (mock - just returns updated data)
   */
  updateTraveler: async (id: string, updated: Partial<Traveler>): Promise<Traveler | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const traveler = mockTravelers.find((t) => t.id === id)
    if (!traveler) return null
    return { ...traveler, ...updated }
  },
}
