import { firebaseTravelersSyncService } from './firebaseTravelersSync'

/**
 * Travelers Data Service
 * 
 * Wraps Firebase travelers sync functionality
 * Provides high-level initialization and cleanup methods
 */

export const travelersDataService = {
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
