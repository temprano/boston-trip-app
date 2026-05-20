import { Event } from '../types'

const EVENTS_STORAGE_KEY = 'boston_events_local'
const DELETION_LOG_KEY = 'boston_events_deletion_log'
const DELETION_LOG_RETENTION_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Local Events Data Service - stores events in localStorage
 * Primary source of truth. Firebase syncs changes from other users.
 * 
 * Uses a deletion log to prevent deleted events from being resurrected
 * when merging with remote data.
 */
export const localEventsDataService = {
  /**
   * Get deletion log and clean up old entries
   */
  getDeletionLog(): Record<string, number> {
    try {
      const data = localStorage.getItem(DELETION_LOG_KEY)
      const log = data ? JSON.parse(data) : {}
      
      // Clean up entries older than retention period
      const now = Date.now()
      const cleaned: Record<string, number> = {}
      
      Object.entries(log).forEach(([eventId, timestamp]: [string, number]) => {
        if (now - timestamp < DELETION_LOG_RETENTION_MS) {
          cleaned[eventId] = timestamp
        }
      })
      
      if (Object.keys(cleaned).length !== Object.keys(log).length) {
        localStorage.setItem(DELETION_LOG_KEY, JSON.stringify(cleaned))
      }
      
      return cleaned
    } catch (error) {
      console.error('Error reading deletion log:', error)
      return {}
    }
  },

  /**
   * Add event to deletion log
   */
  logDeletion(eventId: string): void {
    try {
      const log = this.getDeletionLog()
      log[eventId] = Date.now()
      localStorage.setItem(DELETION_LOG_KEY, JSON.stringify(log))
      console.log('[localEventsDataService] Logged deletion of event:', eventId)
    } catch (error) {
      console.error('Error logging deletion:', error)
    }
  },

  /**
   * Clear a deletion log entry (after Firebase confirms deletion)
   */
  clearDeletionLog(eventId?: string): void {
    try {
      if (eventId) {
        const log = this.getDeletionLog()
        delete log[eventId]
        localStorage.setItem(DELETION_LOG_KEY, JSON.stringify(log))
        console.log('[localEventsDataService] Cleared deletion log for event:', eventId)
      } else {
        localStorage.removeItem(DELETION_LOG_KEY)
      }
    } catch (error) {
      console.error('Error clearing deletion log:', error)
    }
  },

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
    
    // Log the deletion to prevent it from being re-added during merges
    this.logDeletion(id)
    
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
   * Merge events from Firebase (for syncing with other users)
   * Uses deletion log to prevent resurrecting deleted events
   * Filters out both locally deleted events and events deleted by deletion log
   */
  mergeRemoteEvents(remoteEvents: Event[], deletedEventIds?: Set<string>): Event[] {
    const localEvents = this.getEvents()
    const deletionLog = this.getDeletionLog()
    const allDeletedIds = new Set([...Object.keys(deletionLog), ...(deletedEventIds || [])])
    
    const merged: Record<string, Event> = {}

    // Add all local events (excluding deleted ones)
    localEvents.forEach((e) => {
      if (!allDeletedIds.has(e.id)) {
        merged[e.id] = e
      }
    })

    // Merge remote events (excluding deleted ones, remote events don't overwrite local)
    remoteEvents.forEach((remoteEvent) => {
      // Don't add remote events that have been deleted locally
      if (allDeletedIds.has(remoteEvent.id)) {
        console.log('[localEventsDataService] Skipping deleted event in merge:', remoteEvent.id)
        return
      }
      
      const localEvent = merged[remoteEvent.id]
      if (!localEvent) {
        // Remote event doesn't exist locally, add it
        merged[remoteEvent.id] = remoteEvent
      }
      // If event exists locally, keep the local version (user's version is authoritative)
    })

    const mergedArray = Object.values(merged)
    this.saveEvents(mergedArray)
    return mergedArray
  },
}
