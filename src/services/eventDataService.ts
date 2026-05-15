import { Event } from '../types'
import { localEventsDataService } from './localEventsDataService'
import { firebaseSyncService } from './firebaseSyncService'
import { useAppStore } from '../store'

/**
 * Event Data Service - Primary API for event operations
 * 
 * Architecture:
 * - All reads/writes use localStorage (fast, offline-capable)
 * - Changes automatically sync to Firebase
 * - Updates from Firebase are merged back to localStorage
 * 
 * Note: Events are only loaded from initial JSON data and edited, never created/deleted
 */

export const eventDataService = {
  /**
   * Update an event locally and sync to Firebase
   */
  async updateEvent(itineraryId: string, eventId: string, updates: Partial<Event>): Promise<void> {
    console.log('[eventDataService] updateEvent called for event:', eventId, 'with updates:', updates)
    
    // Update locally first
    const updated = localEventsDataService.updateEvent(eventId, updates)
    
    if (!updated) {
      console.error('[eventDataService] Event not found:', eventId)
      throw new Error(`Event ${eventId} not found`)
    }

    console.log('[eventDataService] Event updated locally:', updated)
    
    // Update store to trigger re-render and auto-persistence
    console.log('[eventDataService] Updating app store with all events...')
    const allEvents = localEventsDataService.getEvents()
    useAppStore.getState().setEvents(allEvents)
    console.log('[eventDataService] ✓ Store updated with', allEvents.length, 'events')
    
    // Async sync to Firebase
    console.log('[eventDataService] Syncing to Firebase...')
    firebaseSyncService.syncEventToFirebase(itineraryId, updated).catch((error) => {
      console.error('[eventDataService] Failed to sync updated event to Firebase:', error)
    })
  },

  /**
   * Get all events from localStorage
   */
  getEvents(): Event[] {
    return localEventsDataService.getEvents()
  },

  /**
   * Get a single event by ID
   */
  getEventById(id: string): Event | null {
    return localEventsDataService.getEventById(id)
  },

  /**
   * Start syncing with Firebase
   * Call this on app startup to pull latest data and listen for real-time changes
   */
  initializeSync(itineraryId: string): () => void {
    console.log('[eventDataService] initializeSync called with itineraryId:', itineraryId)
    
    // Pull latest from Firebase on startup
    console.log('[eventDataService] Pulling events from Firebase...')
    firebaseSyncService.pullEventsFromFirebase(itineraryId).catch((error) => {
      console.error('[eventDataService] Failed to pull events on sync init:', error)
    })
    
    // Subscribe to real-time updates from other users
    console.log('[eventDataService] Subscribing to event sync updates...')
    const unsubscribe = firebaseSyncService.subscribeToEventSync(itineraryId)
    console.log('[eventDataService] ✓ Subscribed to event sync')
    return unsubscribe
  },

  /**
   * Stop all syncing
   */
  stopSync(): void {
    console.log('[eventDataService] stopSync called')
    firebaseSyncService.unsubscribeAll()
  },
}
