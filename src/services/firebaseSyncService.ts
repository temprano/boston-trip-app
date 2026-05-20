import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore'
import { db } from './firebase'
import { Event } from '../types'
import { useAppStore } from '../store/appStore'
import { localEventsDataService } from './localEventsDataService'

/**
 * Firebase Sync Service - handles real-time sync between users
 * 
 * Architecture:
 * 1. LocalStorage = Primary source (works offline)
 * 2. Firebase = Sync layer (broadcasts changes to other users)
 * 3. When local data changes → save to localStorage → sync to Firebase
 * 4. When Firebase updates arrive → merge into localStorage
 * 5. Deletions are tracked in 'deletions' collection to prevent resurrection
 */

class FirebaseSyncService {
  private unsubscribers: (() => void)[] = []
  private syncInitialized = false
  private deletionsSyncInitialized = false
  private remoteDeletedEventIds: Set<string> = new Set()

  /**
   * Initialize real-time sync for events
   * Listens for changes from other users and merges them locally
   * Safe to call multiple times - only subscribes once per itinerary
   */
  subscribeToEventSync(itineraryId: string): () => void {
    console.log('[firebaseSyncService] subscribeToEventSync called for itinerary:', itineraryId)
    
    // If Firebase not initialized, return no-op
    if (!db) {
      console.log('[firebaseSyncService] Firebase not initialized (db is null), returning no-op')
      return () => {}
    }

    console.log('[firebaseSyncService] Firebase initialized, db:', !!db)

    // Prevent duplicate subscriptions
    if (this.syncInitialized) {
      console.log('[firebaseSyncService] Already subscribed, returning existing unsubscriber')
      return () => {} // Return no-op unsubscriber
    }

    this.syncInitialized = true
    console.log('[firebaseSyncService] Setting up new subscription...')
    
    // Also subscribe to deletions collection
    this.subscribeToDeletions()
    
    try {
      // Subscribe to events collection
      const eventsRef = collection(db, 'events')
      console.log('[firebaseSyncService] Events ref created:', eventsRef.path)
      
      const unsubscribe = onSnapshot(
        eventsRef,
        (snapshot) => {
          try {
            console.log('[firebaseSyncService] Received snapshot with', snapshot.docs.length, 'documents')
            // Convert Firebase docs to Event objects
            const remoteEvents: Event[] = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Event[]

            // Merge remote events with local, keeping local as primary
            // Pass remote deleted event IDs to prevent re-adding deleted events
            const mergedEvents = localEventsDataService.mergeRemoteEvents(remoteEvents, this.remoteDeletedEventIds)
            
            // Save merged events to localStorage
            localStorage.setItem('boston_events_local', JSON.stringify(mergedEvents))
            
            // Update app state with merged events
            useAppStore.getState().setEvents(mergedEvents)
            console.log('[firebaseSyncService] ✓ Events updated in store:', mergedEvents.length, 'events')
          } catch (error) {
            console.error('Error processing Firebase snapshot:', error)
          }
        },
        (error) => {
          console.debug('Firebase sync unavailable (app works offline):', error)
          // Don't throw - app works offline
        }
      )

      this.unsubscribers.push(unsubscribe)
      return unsubscribe
    } catch (error) {
      console.debug('Firebase sync not available:', error)
      // Return no-op if subscription fails
      return () => {}
    }
  }

  /**
   * Subscribe to deletions collection to track deleted events across all users
   */
  private subscribeToDeletions(): void {
    if (!db || this.deletionsSyncInitialized) return

    this.deletionsSyncInitialized = true
    console.log('[firebaseSyncService] Subscribing to deletions collection for real-time deletion tracking...')

    try {
      const deletionsRef = collection(db, 'deletions')
      
      const unsubscribe = onSnapshot(
        deletionsRef,
        (snapshot) => {
          try {
            console.log('[firebaseSyncService] Received deletions snapshot with', snapshot.docs.length, 'deletions')
            this.remoteDeletedEventIds.clear()
            snapshot.docs.forEach((doc) => {
              this.remoteDeletedEventIds.add(doc.data().eventId)
            })
            console.log('[firebaseSyncService] Updated remote deleted event IDs:', Array.from(this.remoteDeletedEventIds))
          } catch (error) {
            console.error('[firebaseSyncService] Error processing deletions snapshot:', error)
          }
        },
        (error) => {
          console.debug('[firebaseSyncService] Deletions subscription error:', error)
        }
      )

      this.unsubscribers.push(unsubscribe)
    } catch (error) {
      console.debug('[firebaseSyncService] Failed to subscribe to deletions:', error)
    }
  }

  /**
   * Sync a single event to Firebase
   * Called when local event is created/updated
   */
  async syncEventToFirebase(_itineraryId: string, event: Event): Promise<void> {
    console.log('[firebaseSyncService] syncEventToFirebase called for event:', event.id)
    
    if (!db) {
      console.log('[firebaseSyncService] Firebase not initialized (db is null), skipping sync')
      return // Firebase not configured
    }
    
    try {
      const eventRef = doc(db, 'events', event.id)
      console.log('[firebaseSyncService] Writing event to:', eventRef.path)
      console.log('[firebaseSyncService] Event data:', event)
      
      await setDoc(eventRef, event, { merge: true })
      console.log('[firebaseSyncService] ✓ Event synced to Firebase')
    } catch (error) {
      console.error('[firebaseSyncService] Firebase sync failed:', error)
      // Don't throw - sync failures shouldn't break local operations
    }
  }

  /**
   * Sync multiple events to Firebase
   */
  async syncEventsToFirebase(itineraryId: string, events: Event[]): Promise<void> {
    if (!db) return // Firebase not configured
    
    try {
      const promises = events.map((event) => this.syncEventToFirebase(itineraryId, event))
      await Promise.all(promises)
    } catch (error) {
      console.debug('Firebase sync failed (app works offline):', error)
    }
  }

  /**
   * Pull all events from Firebase (one-time sync)
   * Useful on app startup
   */
  async pullEventsFromFirebase(itineraryId: string): Promise<Event[]> {
    console.log('[firebaseSyncService] pullEventsFromFirebase called for itinerary:', itineraryId)
    
    if (!db) {
      console.log('[firebaseSyncService] Firebase not initialized, returning local events')
      // Firebase not configured, use local events
      return localEventsDataService.getEvents()
    }
    
    try {
      const eventsRef = collection(db, 'events')
      const deletionsRef = collection(db, 'deletions')
      
      console.log('[firebaseSyncService] Fetching events and deletions from Firebase...')
      const [eventsSnapshot, deletionsSnapshot] = await Promise.all([
        getDocs(eventsRef),
        getDocs(deletionsRef),
      ])

      console.log('[firebaseSyncService] Received', eventsSnapshot.docs.length, 'events and', deletionsSnapshot.docs.length, 'deletions')
      
      const remoteEvents = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[]

      // Build set of deleted event IDs from Firebase
      const deletedEventIds = new Set(
        deletionsSnapshot.docs.map((doc) => doc.data().eventId)
      )

      // Merge with local deletion log + remote deletions
      const merged = localEventsDataService.mergeRemoteEvents(remoteEvents, deletedEventIds)
      console.log('[firebaseSyncService] Merged events (local + remote), deleted:', deletedEventIds.size)
      return merged
    } catch (error) {
      console.error('[firebaseSyncService] Firebase pull failed:', error)
      // Return local events if pull fails
      const localEvents = localEventsDataService.getEvents()
      console.log('[firebaseSyncService] Falling back to', localEvents.length, 'local events')
      return localEvents
    }
  }

  /**
   * Delete an event from Firebase
   */
  async deleteEventFromFirebase(_itineraryId: string, eventId: string): Promise<void> {
    console.log('[firebaseSyncService] deleteEventFromFirebase called for event:', eventId)
    console.log('[firebaseSyncService] Firebase initialized?', !!db)
    
    if (!db) {
      console.error('[firebaseSyncService] ❌ Firebase not initialized (db is null), cannot delete')
      return
    }
    
    try {
      console.log('[firebaseSyncService] Step 1: Deleting from events collection...')
      const eventRef = doc(db, 'events', eventId)
      console.log('[firebaseSyncService] Event ref path:', eventRef.path)
      await deleteDoc(eventRef)
      console.log('[firebaseSyncService] ✓ Step 1 complete: Event deleted from Firebase')
      
      console.log('[firebaseSyncService] Step 2: Writing deletion record to deletions collection...')
      const deletionRef = doc(db, 'deletions', eventId)
      try {
        await setDoc(deletionRef, {
          eventId,
          deletedAt: new Date().toISOString(),
        }, { merge: true })
        console.log('[firebaseSyncService] ✓ Step 2 complete: Deletion record logged to Firebase')
      } catch (deletionError) {
        console.warn('[firebaseSyncService] ⚠ Step 2 failed (non-critical):', (deletionError as any).code)
        console.warn('[firebaseSyncService] Event deleted locally, deletion tracking degraded')
      }
      
      console.log('[firebaseSyncService] Step 3: Updating local deletion log...')
      localEventsDataService.clearDeletionLog(eventId)
      console.log('[firebaseSyncService] ✓ Step 3 complete: Event successfully deleted (synced to Firebase)')
    } catch (error) {
      console.error('[firebaseSyncService] ❌ Firebase delete failed:', error)
      console.error('[firebaseSyncService] Error code:', (error as any).code)
      console.error('[firebaseSyncService] Error message:', (error as any).message)
      console.error('[firebaseSyncService] Full error:', JSON.stringify(error, null, 2))
    }
  }

  /**
   * Cleanup all subscriptions
   */
  unsubscribeAll(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe())
    this.unsubscribers = []
  }
}

export const firebaseSyncService = new FirebaseSyncService()
