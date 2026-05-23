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
 * 1. LocalStorage = Primary source during offline use
 * 2. Firebase = Permanent truth (deleted events are permanently removed)
 * 3. Real-time listeners sync Firebase changes to all devices
 * 4. Deletions are permanent - deleted docs don't appear in future syncs
 */

class FirebaseSyncService {
  private unsubscribers: (() => void)[] = []
  private syncInitialized = false

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
            // Firebase is source of truth - deleted events won't be in the snapshot
            const mergedEvents = localEventsDataService.mergeRemoteEvents(remoteEvents)
            
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
      
      console.log('[firebaseSyncService] Fetching events from Firebase...')
      const eventsSnapshot = await getDocs(eventsRef)

      console.log('[firebaseSyncService] Received', eventsSnapshot.docs.length, 'events')
      
      const remoteEvents = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[]

      // Merge with local - Firebase is source of truth (deleted events aren't here)
      const merged = localEventsDataService.mergeRemoteEvents(remoteEvents)
      console.log('[firebaseSyncService] Merged events (local + remote)')
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
   * Delete an event from Firebase permanently
   */
  async deleteEventFromFirebase(_itineraryId: string, eventId: string): Promise<void> {
    console.log('[firebaseSyncService] deleteEventFromFirebase called for event:', eventId)
    console.log('[firebaseSyncService] Firebase initialized?', !!db)
    
    if (!db) {
      console.error('[firebaseSyncService] ❌ Firebase not initialized (db is null), cannot delete')
      return
    }
    
    try {
      console.log('[firebaseSyncService] Deleting event from Firestore...')
      const eventRef = doc(db, 'events', eventId)
      console.log('[firebaseSyncService] Event ref path:', eventRef.path)
      await deleteDoc(eventRef)
      console.log('[firebaseSyncService] ✓ Event permanently deleted from Firebase')
      // Deletion is now permanent - the event document no longer exists
    } catch (error) {
      console.error('[firebaseSyncService] ❌ Firebase delete failed:', error)
      console.error('[firebaseSyncService] Error code:', (error as any).code)
      console.error('[firebaseSyncService] Error message:', (error as any).message)
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
