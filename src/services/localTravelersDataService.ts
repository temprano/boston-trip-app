import { Traveler } from '../types'

const TRAVELERS_STORAGE_KEY = 'boston_travelers_local'

/**
 * Local datastore service for team members
 * Persists travelers to localStorage for offline availability
 */
export const localTravelersDataService = {
  /**
   * Get all travelers from local storage
   */
  getTravelers(): Traveler[] {
    try {
      const data = localStorage.getItem(TRAVELERS_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error reading travelers from local storage:', error)
      return []
    }
  },

  /**
   * Get a single traveler by ID
   */
  getTravelerById(id: string): Traveler | null {
    const travelers = this.getTravelers()
    return travelers.find((t) => t.id === id) || null
  },

  /**
   * Update a traveler's information
   */
  updateTraveler(id: string, updates: Partial<Traveler>): Traveler | null {
    const travelers = this.getTravelers()
    const index = travelers.findIndex((t) => t.id === id)

    if (index === -1) {
      console.error(`Traveler with id ${id} not found`)
      return null
    }

    const updated = {
      ...travelers[index],
      ...updates,
      id: travelers[index].id, // Preserve original ID
    }

    travelers[index] = updated
    this.saveTravelers(travelers)

    return updated
  },

  /**
   * Save all travelers to local storage
   */
  saveTravelers(travelers: Traveler[]): void {
    try {
      localStorage.setItem(TRAVELERS_STORAGE_KEY, JSON.stringify(travelers))
    } catch (error) {
      console.error('Error saving travelers to local storage:', error)
    }
  },

  /**
   * Initialize with default travelers (if not already present)
   */
  initializeDefaults(defaultTravelers: Traveler[]): void {
    const existing = this.getTravelers()
    if (existing.length === 0) {
      this.saveTravelers(defaultTravelers)
    }
  },

  /**
   * Clear all travelers from local storage
   */
  clearAll(): void {
    try {
      localStorage.removeItem(TRAVELERS_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing travelers from local storage:', error)
    }
  },
}
