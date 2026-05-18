import { Traveler } from '../types'
import { localTravelersDataService } from './localTravelersDataService'
import { firebaseTravelersSyncService } from './firebaseTravelersSync'
import { useAppStore } from '../store'

/**
 * Travelers Data Service
 * 
 * Wraps Firebase travelers sync functionality
 * Provides high-level initialization and update methods
 */

export const travelersDataService = {
  /**
   * Add a new traveler locally and sync to Firebase
   */
  async addTraveler(itineraryId: string, newTraveler: Traveler): Promise<void> {
    console.log('[travelersDataService] addTraveler called for new traveler:', newTraveler.id)
    
    // Add to local storage
    localTravelersDataService.addTraveler(newTraveler)
    console.log('[travelersDataService] Traveler added locally:', newTraveler.id)
    
    // Update store to trigger re-render and auto-persistence
    console.log('[travelersDataService] Updating app store with all travelers...')
    const allTravelers = localTravelersDataService.getTravelers()
    useAppStore.getState().setTravelers(allTravelers)
    console.log('[travelersDataService] ✓ Store updated with', allTravelers.length, 'travelers')
    
    // Async sync to Firebase
    console.log('[travelersDataService] Syncing new traveler to Firebase...')
    firebaseTravelersSyncService.syncTravelerToFirebase(itineraryId, newTraveler).catch((error) => {
      console.error('[travelersDataService] Failed to sync new traveler to Firebase:', error)
    })
  },

  /**
   * Update a traveler locally and sync to Firebase
   */
  async updateTraveler(itineraryId: string, travelerId: string, updates: Partial<Traveler>): Promise<void> {
    console.log('[travelersDataService] updateTraveler called for traveler:', travelerId, 'with updates:', updates)
    
    // Update locally first
    const updated = localTravelersDataService.updateTraveler(travelerId, updates)
    
    if (!updated) {
      console.error('[travelersDataService] Traveler not found:', travelerId)
      throw new Error(`Traveler ${travelerId} not found`)
    }

    console.log('[travelersDataService] Traveler updated locally:', updated)
    
    // Update store to trigger re-render and auto-persistence
    console.log('[travelersDataService] Updating app store with all travelers...')
    const allTravelers = localTravelersDataService.getTravelers()
    useAppStore.getState().setTravelers(allTravelers)
    console.log('[travelersDataService] ✓ Store updated with', allTravelers.length, 'travelers')
    
    // Async sync to Firebase
    console.log('[travelersDataService] Syncing to Firebase...')
    firebaseTravelersSyncService.syncTravelerToFirebase(itineraryId, updated).catch((error) => {
      console.error('[travelersDataService] Failed to sync updated traveler to Firebase:', error)
    })
  },

  /**
   * Delete a traveler from local storage and Firebase
   */
  async deleteTraveler(itineraryId: string, travelerId: string): Promise<void> {
    console.log('[travelersDataService] deleteTraveler called for traveler:', travelerId)
    
    // Delete from local storage
    const deleted = localTravelersDataService.deleteTraveler(travelerId)
    
    if (!deleted) {
      console.error('[travelersDataService] Traveler not found for deletion:', travelerId)
      throw new Error(`Traveler ${travelerId} not found`)
    }

    console.log('[travelersDataService] Traveler deleted locally:', travelerId)
    
    // Update store to trigger re-render and auto-persistence
    console.log('[travelersDataService] Updating app store with remaining travelers...')
    const allTravelers = localTravelersDataService.getTravelers()
    useAppStore.getState().setTravelers(allTravelers)
    console.log('[travelersDataService] ✓ Store updated with', allTravelers.length, 'travelers')
    
    // Async sync deletion to Firebase
    console.log('[travelersDataService] Syncing deletion to Firebase...')
    firebaseTravelersSyncService.deleteTravelerFromFirebase(itineraryId, travelerId).catch((error) => {
      console.error('[travelersDataService] Failed to sync traveler deletion to Firebase:', error)
    })
  },

  /**
   * Initialize sync for travelers
   * - Pulls latest from Firebase (AWAITED - waits for completion)
   * - Subscribes to real-time updates
   */
  async initializeSync(itineraryId: string): Promise<() => void> {
    console.log('[travelersDataService] initializeSync called with itineraryId:', itineraryId)
    
    // Pull latest from Firebase on startup - MUST complete before subscribing
    try {
      console.log('[travelersDataService] Pulling travelers from Firebase...')
      const pulledTravelers = await firebaseTravelersSyncService.pullTravelersFromFirebase(itineraryId)
      console.log('[travelersDataService] ✓ Pull complete. Got', pulledTravelers.length, 'travelers')
    } catch (error) {
      console.error('[travelersDataService] Failed to pull travelers on sync init:', error)
    }
    
    // Subscribe to real-time updates from other users (after pull completes)
    console.log('[travelersDataService] Subscribing to traveler sync updates...')
    const unsubscribe = firebaseTravelersSyncService.subscribeToTravelerSync(itineraryId)
    console.log('[travelersDataService] ✓ Subscribed to traveler sync')
    return unsubscribe
  },

  /**
   * Stop all syncing
   */
  stopSync(): void {
    console.log('[travelersDataService] stopSync called')
    firebaseTravelersSyncService.unsubscribeAll()
  },
}
