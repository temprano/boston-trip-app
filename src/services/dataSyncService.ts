/**
 * Data Sync Service - DISABLED
 * GitHub sync is disabled due to CORS issues in browser deployments
 * All data is stored locally in localStorage
 */

interface SyncResult {
  synced: boolean
  message: string
}

class DataSyncService {
  /**
   * Sync events - DISABLED
   * Use local storage instead
   */
  async syncEvents(): Promise<SyncResult> {
    return { synced: false, message: 'GitHub sync disabled - using local storage' }
  }

  /**
   * Sync travelers - DISABLED
   * Use local storage instead
   */
  async syncTravelers(): Promise<SyncResult> {
    return { synced: false, message: 'GitHub sync disabled - using local storage' }
  }

  /**
   * Sync both events and travelers - DISABLED
   */
  async syncAll(): Promise<{ events: SyncResult; travelers: SyncResult }> {
    return {
      events: await this.syncEvents(),
      travelers: await this.syncTravelers(),
    }
  }
}

export const dataSyncService = new DataSyncService()
