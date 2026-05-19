import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Base Address Sync Service - handles Firestore sync for the base address (Airbnb location)
 * 
 * Stores the base address per itinerary so all team members see the same home base
 * Used for directions and transit calculations
 */

class BaseAddressSyncService {
  private unsubscriber: (() => void) | null = null

  /**
   * Sync base address to Firebase
   */
  async syncBaseAddressToFirebase(itineraryId: string, address: string): Promise<void> {
    console.log('[baseAddressSyncService] syncBaseAddressToFirebase called for itinerary:', itineraryId, 'address:', address)
    
    if (!db) {
      console.warn('[baseAddressSyncService] Firebase not initialized, skipping sync')
      return
    }

    try {
      const addressRef = doc(db, 'baseAddresses', itineraryId)
      await setDoc(addressRef, { itineraryId, address, updatedAt: new Date().toISOString() }, { merge: true })
      console.log('[baseAddressSyncService] ✓ Base address synced to Firebase:', address)
    } catch (error) {
      console.error('[baseAddressSyncService] Error syncing base address:', error)
      // Don't throw - let the operation succeed locally even if Firebase sync fails
    }
  }

  /**
   * Pull base address from Firebase (one-time fetch)
   */
  async pullBaseAddressFromFirebase(itineraryId: string): Promise<string | null> {
    console.log('[baseAddressSyncService] pullBaseAddressFromFirebase called for itinerary:', itineraryId)
    
    if (!db) {
      console.log('[baseAddressSyncService] Firebase not initialized, returning null')
      return null
    }

    try {
      const addressRef = doc(db, 'baseAddresses', itineraryId)
      const snapshot = await getDoc(addressRef)
      
      if (snapshot.exists()) {
        const { address } = snapshot.data() as { address: string }
        console.log('[baseAddressSyncService] ✓ Pulled base address from Firebase:', address)
        return address
      } else {
        console.log('[baseAddressSyncService] No base address found in Firebase for itinerary:', itineraryId)
        return null
      }
    } catch (error) {
      console.error('[baseAddressSyncService] Error pulling base address from Firebase:', error)
      return null
    }
  }

  /**
   * Subscribe to real-time base address updates from other users
   */
  subscribeToBaseAddressSync(
    itineraryId: string,
    onUpdate: (address: string) => void
  ): () => void {
    console.log('[baseAddressSyncService] subscribeToBaseAddressSync called for itinerary:', itineraryId)
    
    if (!db) {
      console.log('[baseAddressSyncService] Firebase not initialized, returning no-op')
      return () => {}
    }

    try {
      const addressRef = doc(db, 'baseAddresses', itineraryId)
      
      const unsubscribe = onSnapshot(
        addressRef,
        (snapshot) => {
          try {
            if (snapshot.exists()) {
              const { address } = snapshot.data() as { address: string }
              console.log('[baseAddressSyncService] Received updated base address from Firebase:', address)
              onUpdate(address)
            }
          } catch (error) {
            console.error('[baseAddressSyncService] Error processing base address snapshot:', error)
          }
        },
        (error) => {
          console.error('[baseAddressSyncService] Snapshot listener error:', error)
        }
      )

      this.unsubscriber = unsubscribe
      console.log('[baseAddressSyncService] ✓ Subscription established')
      return unsubscribe
    } catch (error) {
      console.error('[baseAddressSyncService] Error setting up subscription:', error)
      return () => {}
    }
  }

  /**
   * Cleanup subscriptions
   */
  unsubscribe(): void {
    if (this.unsubscriber) {
      console.log('[baseAddressSyncService] Unsubscribing from base address updates...')
      this.unsubscriber()
      this.unsubscriber = null
    }
  }
}

export const baseAddressSyncService = new BaseAddressSyncService()
