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
import { localEventsDataService } from './localEventsDataService'

/**
 * Firebase Sync Service - handles real-time sync between users
 * 
 * Architecture:
 * 1. LocalStorage = Primary source (works offline)
 * 2. Firebase = Sync layer (broadcasts changes to other users)
 * 3. When local data changes → save to localStorage → sync to Firebase
 * 4. When Firebase updates arrive → merge into localStorage
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
            localEventsDataService.mergeRemoteEvents(remoteEvents)
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
      console.log('[firebaseSyncService] Fetching events from:', eventsRef.path)
      
      const snapshot = await getDocs(eventsRef)
      console.log('[firebaseSyncService] Received', snapshot.docs.length, 'events from Firebase')
      
      const remoteEvents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[]

      console.log('[firebaseSyncService] Remote events:', remoteEvents.length)

      // Merge with local
      const merged = localEventsDataService.mergeRemoteEvents(remoteEvents)
      console.log('[firebaseSyncService] Merged events (local + remote):', merged.length)
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
    if (!db) return // Firebase not configured
    
    try {
      const eventRef = doc(db, 'events', eventId)
      await deleteDoc(eventRef)
      console.log('[firebaseSyncService] ✓ Event deleted from Firebase:', eventId)
    } catch (error) {
      console.error('[firebaseSyncService] Firebase delete failed:', error)
      // Don't throw - delete failures shouldn't break local operations
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
