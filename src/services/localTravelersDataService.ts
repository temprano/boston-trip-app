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
   * Create a new traveler
   */
  createTraveler(traveler: Omit<Traveler, 'id'>): Traveler {
    const travelers = this.getTravelers()
    
    // Find the largest numeric ID and add 1
    let maxId = 0
    travelers.forEach((t) => {
      const numId = parseInt(t.id, 10)
      if (!isNaN(numId) && numId > maxId) {
        maxId = numId
      }
    })
    
    const newTraveler: Traveler = {
      ...traveler,
      id: String(maxId + 1),
    }
    travelers.push(newTraveler)
    this.saveTravelers(travelers)
    return newTraveler
  },

  /**
   * Add a traveler with existing ID (useful for batch imports)
   */
  addTraveler(traveler: Traveler): void {
    const travelers = this.getTravelers()
    const exists = travelers.find((t) => t.id === traveler.id)
    if (!exists) {
      travelers.push(traveler)
      this.saveTravelers(travelers)
    }
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
   * Delete a traveler
   */
  deleteTraveler(id: string): boolean {
    const travelers = this.getTravelers()
    const index = travelers.findIndex((t) => t.id === id)

    if (index === -1) {
      console.error(`Traveler with id ${id} not found`)
      return false
    }

    travelers.splice(index, 1)
    this.saveTravelers(travelers)
    return true
  },

  /**
   * Save all travelers to local storage
   */
  saveTravelers(travelers: Traveler[]): void {
    try {
      localStorage.setItem(TRAVELERS_STORAGE_KEY, JSON.stringify(travelers))
      console.log(`✓ Saved ${travelers.length} travelers to localStorage`)
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
      console.log('✓ Cleared travelers from localStorage')
    } catch (error) {
      console.error('Error clearing travelers from local storage:', error)
    }
  },
}
