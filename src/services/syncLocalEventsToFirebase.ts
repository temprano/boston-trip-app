/**
 * One-time utility to sync local events up to Firebase
 * Uses merge: true to safely update without deleting existing fields
 * 
 * Usage: Call this once on app startup to ensure Firebase has the latest local copy
 */

import { firebaseSyncService } from './firebaseSyncService'
import { localEventsDataService } from './localEventsDataService'

let syncCompleted = false

export async function syncLocalEventsToFirebaseOnce(itineraryId: string): Promise<void> {
  // Only run once per app session
  if (syncCompleted) {
    console.log('[syncLocalEventsToFirebase] Already completed in this session, skipping')
    return
  }

  if (!itineraryId) {
    console.warn('[syncLocalEventsToFirebase] No itineraryId provided, skipping sync')
    return
  }

  try {
    console.log('[syncLocalEventsToFirebase] Starting one-time sync for itinerary:', itineraryId)
    
    // Get all local events (which now have nearestStopId)
    const localEvents = localEventsDataService.getEvents()
    console.log(`[syncLocalEventsToFirebase] Found ${localEvents.length} local events to sync`)
    
    if (localEvents.length === 0) {
      console.log('[syncLocalEventsToFirebase] No events to sync')
      syncCompleted = true
      return
    }

    // Log each event to confirm nearestStopId is present
    localEvents.forEach((event, index) => {
      console.log(`[syncLocalEventsToFirebase] Event ${index + 1}: ${event.id} "${event.title}" → nearestStopId: ${event.nearestStopId || 'MISSING'}`)
    })

    // Verify all events have nearestStopId
    const eventsWithoutStop = localEvents.filter(e => !e.nearestStopId)
    if (eventsWithoutStop.length > 0) {
      console.warn(`[syncLocalEventsToFirebase] ⚠️ WARNING: ${eventsWithoutStop.length} events are missing nearestStopId!`, eventsWithoutStop)
    } else {
      console.log('[syncLocalEventsToFirebase] ✓ All events have nearestStopId field')
    }

    // Push all events to Firebase with merge: true (safe, won't delete existing data)
    await firebaseSyncService.syncEventsToFirebase(itineraryId, localEvents)
    
    console.log('[syncLocalEventsToFirebase] ✓ Successfully synced all local events to Firebase')
    syncCompleted = true
  } catch (error) {
    console.error('[syncLocalEventsToFirebase] Sync failed:', error)
    // Don't set syncCompleted = true so it can retry on next app load if needed
  }
}
