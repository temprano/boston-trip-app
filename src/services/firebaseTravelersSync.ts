import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore'
import { db } from './firebase'
import { Traveler } from '../types'
import { localTravelersDataService } from './localTravelersDataService'

/**
 * Firebase Travelers Sync Service - handles real-time sync of team members
 * 
 * Similar to firebaseSyncService but for travelers/team members
 */

class FirebaseTravelersSyncService {
  private unsubscribers: (() => void)[] = []
  private syncInitialized = false

  /**
   * Initialize real-time sync for travelers
   */
  subscribeToTravelerSync(itineraryId: string): () => void {
    console.log('[firebaseTravelersSyncService] subscribeToTravelerSync called for itinerary:', itineraryId)
    
    if (!db) {
      console.log('[firebaseTravelersSyncService] Firebase not initialized (db is null), returning no-op')
      return () => {}
    }

    if (this.syncInitialized) {
      console.log('[firebaseTravelersSyncService] Already subscribed, returning existing unsubscriber')
      return () => {}
    }

    this.syncInitialized = true
    console.log('[firebaseTravelersSyncService] Setting up new subscription...')
    
    try {
      const travelersRef = collection(db, `itineraries/${itineraryId}/travelers`)
      console.log('[firebaseTravelersSyncService] Travelers ref created:', travelersRef.path)
      
      const unsubscribe = onSnapshot(
        travelersRef,
        (snapshot) => {
          try {
            console.log('[firebaseTravelersSyncService] Received snapshot with', snapshot.docs.length, 'documents')
            
            // Convert Firebase docs to Traveler objects
            const firebaseTravelers: Traveler[] = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as Omit<Traveler, 'id'>),
            }))
            
            console.log('[firebaseTravelersSyncService] Converted to', firebaseTravelers.length, 'travelers')
            
            // Merge with local travelers (Firebase is source of truth for shared data)
            const localTravelers = localTravelersDataService.getTravelers()
            const merged = this.mergeTravelers(localTravelers, firebaseTravelers)
            
            // Update localStorage
            localStorage.setItem('boston_travelers_local', JSON.stringify(merged))
            console.log('[firebaseTravelersSyncService] Updated localStorage with merged travelers')
            
            // CRITICAL: Update Zustand store so UI reflects changes
            try {
              import('../store/appStore').then((mod) => {
                const { setTravelers } = mod.useAppStore.getState()
                setTravelers(merged)
                console.log('[firebaseTravelersSyncService] ✓ Updated Zustand store with', merged.length, 'travelers from remote sync')
              }).catch((error) => {
                console.warn('[firebaseTravelersSyncService] Could not update Zustand store:', error)
              })
            } catch (error) {
              console.warn('[firebaseTravelersSyncService] Could not update Zustand store:', error)
            }
          } catch (error) {
            console.error('[firebaseTravelersSyncService] Error processing snapshot:', error)
          }
        },
        (error) => {
          console.error('[firebaseTravelersSyncService] Snapshot listener error:', error)
        }
      )
      
      this.unsubscribers.push(unsubscribe)
      console.log('[firebaseTravelersSyncService] ✓ Subscription established')
      return unsubscribe
    } catch (error) {
      console.error('[firebaseTravelersSyncService] Error setting up subscription:', error)
      return () => {}
    }
  }

  /**
   * Sync a single traveler to Firebase
   */
  async syncTravelerToFirebase(itineraryId: string, traveler: Traveler): Promise<void> {
    console.log('[firebaseTravelersSyncService] syncTravelerToFirebase called:', traveler.id)
    
    if (!db) {
      console.warn('[firebaseTravelersSyncService] Firebase not initialized, skipping sync')
      return
    }

    try {
      const travelerRef = doc(db, `itineraries/${itineraryId}/travelers`, traveler.id)
      await setDoc(travelerRef, traveler, { merge: true })
      console.log('[firebaseTravelersSyncService] ✓ Traveler synced to Firebase:', traveler.id)
    } catch (error) {
      console.error('[firebaseTravelersSyncService] Error syncing traveler:', error)
      throw error
    }
  }

  /**
   * Sync multiple travelers to Firebase
   */
  async syncTravelersToFirebase(itineraryId: string, travelers: Traveler[]): Promise<void> {
    console.log('[firebaseTravelersSyncService] syncTravelersToFirebase called with', travelers.length, 'travelers')
    
    if (!db) {
      console.warn('[firebaseTravelersSyncService] Firebase not initialized, skipping sync')
      return
    }

    try {
      for (const traveler of travelers) {
        const travelerRef = doc(db, `itineraries/${itineraryId}/travelers`, traveler.id)
        await setDoc(travelerRef, traveler, { merge: true })
      }
      console.log('[firebaseTravelersSyncService] ✓ All travelers synced to Firebase')
    } catch (error) {
      console.error('[firebaseTravelersSyncService] Error syncing travelers:', error)
      throw error
    }
  }

  /**
   * Merge Firebase travelers with local travelers
   * Firebase is the source of truth for shared data
   */
  private mergeTravelers(local: Traveler[], firebase: Traveler[]): Traveler[] {
    const merged = new Map<string, Traveler>()

    // Add local travelers first
    for (const traveler of local) {
      merged.set(traveler.id, traveler)
    }

    // Override with Firebase travelers (they're more recent)
    for (const traveler of firebase) {
      merged.set(traveler.id, traveler)
    }

    return Array.from(merged.values())
  }

  /**
   * Pull travelers from Firebase (one-time fetch)
   */
  async pullTravelersFromFirebase(itineraryId: string): Promise<Traveler[]> {
    console.log('[firebaseTravelersSyncService] pullTravelersFromFirebase called for itinerary:', itineraryId)
    
    if (!db) {
      console.log('[firebaseTravelersSyncService] Firebase not initialized, returning local travelers')
      return localTravelersDataService.getTravelers()
    }
    
    try {
      const travelersRef = collection(db, `itineraries/${itineraryId}/travelers`)
      console.log('[firebaseTravelersSyncService] Fetching travelers from:', travelersRef.path)
      
      const snapshot = await getDocs(travelersRef)
      console.log('[firebaseTravelersSyncService] Received', snapshot.docs.length, 'travelers from Firebase')
      
      const remoteTravelers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Traveler[]

      console.log('[firebaseTravelersSyncService] Remote travelers:', remoteTravelers.length)

      // Merge with local
      const merged = this.mergeTravelers(localTravelersDataService.getTravelers(), remoteTravelers)
      console.log('[firebaseTravelersSyncService] Merged travelers (local + remote):', merged.length)
      
      // Update localStorage with merged data
      localStorage.setItem('boston_travelers_local', JSON.stringify(merged))
      
      // CRITICAL: Also update Zustand store so UI reflects new travelers
      try {
        const { setTravelers } = await import('../store/appStore').then(m => m.useAppStore.getState())
        setTravelers(merged)
        console.log('[firebaseTravelersSyncService] ✓ Updated Zustand store with', merged.length, 'travelers')
      } catch (error) {
        console.warn('[firebaseTravelersSyncService] Could not update Zustand store:', error)
      }
      
      return merged
    } catch (error) {
      console.error('[firebaseTravelersSyncService] Firebase pull failed:', error)
      const localTravelers = localTravelersDataService.getTravelers()
      console.log('[firebaseTravelersSyncService] Falling back to', localTravelers.length, 'local travelers')
      return localTravelers
    }
  }

  /**
   * Cleanup all subscriptions
   */
  unsubscribeAll(): void {
    console.log('[firebaseTravelersSyncService] Unsubscribing from all listeners...')
    this.unsubscribers.forEach((unsubscribe) => unsubscribe())
    this.unsubscribers = []
    this.syncInitialized = false
  }

  /**
   * Clean up subscriptions (alias for unsubscribeAll)
   */
  cleanup(): void {
    this.unsubscribeAll()
  }
}

export const firebaseTravelersSyncService = new FirebaseTravelersSyncService()
