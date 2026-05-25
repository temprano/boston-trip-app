import { Event } from '../types'

const EVENTS_STORAGE_KEY = 'boston_events_local'

/**
 * Local Events Data Service - stores events in localStorage
 * Primary source of truth during offline use.
 * Firebase is the permanent source of truth - deleted events are permanently removed from Firestore.
 */
export const localEventsDataService = {
  /**
   * Get all events from localStorage
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
   * Create a new event
   */
  createEvent(event: Omit<Event, 'id'>): Event {
    const events = this.getEvents()
    
    // Find the largest numeric ID and add 1
    let maxId = 0
    events.forEach((e) => {
      const numId = parseInt(e.id, 10)
      if (!isNaN(numId) && numId > maxId) {
        maxId = numId
      }
    })
    
    const newEvent: Event = {
      ...event,
      id: String(maxId + 1),
    }
    events.push(newEvent)
    this.saveEvents(events)
    return newEvent
  },

  /**
   * Update an event
   */
  updateEvent(id: string, updates: Partial<Event>): Event | null {
    const events = this.getEvents()
    const index = events.findIndex((e) => e.id === id)

    if (index === -1) {
      console.error(`Event with id ${id} not found`)
      return null
    }

    const updated: Event = {
      ...events[index],
      ...updates,
      id: events[index].id, // Preserve original ID
    }

    events[index] = updated
    this.saveEvents(events)

    return updated
  },

  /**
   * Delete an event
   */
  deleteEvent(id: string): boolean {
    const events = this.getEvents()
    const index = events.findIndex((e) => e.id === id)

    if (index === -1) {
      console.error(`Event with id ${id} not found`)
      return false
    }

    events.splice(index, 1)
    this.saveEvents(events)
    return true
  },

  /**
   * Save all events to localStorage
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
   * Clear all events from localStorage
   */
  clearAll(): void {
    try {
      localStorage.removeItem(EVENTS_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing events from local storage:', error)
    }
  },

  /**
   * Replace local events with events from Firebase
   * Firestore is the single source of truth - no merging
   * Since events can only be created/edited/deleted online,
   * we can safely replace local cache entirely on sync
   */
  replaceEvents(remoteEvents: Event[]): Event[] {
    this.saveEvents(remoteEvents)
    return remoteEvents
  },
}
