import { Event } from '../types'

const EVENTS_STORAGE_KEY = 'boston_events_local'

/**
 * Local datastore service for events
 * Persists events to localStorage for offline availability
 */
export const eventDataService = {
  /**
   * Get all events from local storage
   */
  getEvents(): Event[] {
    try {
      const data = localStorage.getItem(EVENTS_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error reading events from local storage:', error)
      return []
    }
  },

  /**
   * Get a single event by ID
   */
  getEventById(id: string): Event | null {
    const events = this.getEvents()
    return events.find((e) => e.id === id) || null
  },

  /**
   * Update an event's information
   */
  updateEvent(id: string, updates: Partial<Event>): Event | null {
    const events = this.getEvents()
    const index = events.findIndex((e) => e.id === id)

    if (index === -1) {
      console.error(`Event with id ${id} not found`)
      return null
    }

    const updated = {
      ...events[index],
      ...updates,
      id: events[index].id, // Preserve original ID
    }

    events[index] = updated
    this.saveEvents(events)

    return updated
  },

  /**
   * Save all events to local storage
   */
  saveEvents(events: Event[]): void {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events))
    } catch (error) {
      console.error('Error saving events to local storage:', error)
    }
  },

  /**
   * Initialize with default events (if not already present)
   */
  initializeDefaults(defaultEvents: Event[]): void {
    const existing = this.getEvents()
    if (existing.length === 0) {
      this.saveEvents(defaultEvents)
    }
  },

  /**
   * Clear all events from local storage
   */
  clearAll(): void {
    try {
      localStorage.removeItem(EVENTS_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing events from local storage:', error)
    }
  },
}
