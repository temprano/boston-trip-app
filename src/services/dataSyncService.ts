/**
 * Data Sync Service - Synchronizes events and travelers data from GitHub
 * Fetches master JSON files and updates localStorage if server has newer data
 */

interface DataVersion {
  timestamp: string
}

interface SyncResult {
  synced: boolean
  message: string
}

const GITHUB_REPO_OWNER = 'temprano' // Your GitHub username
const GITHUB_REPO_NAME = 'boston-trip-data' // Your repo name
const GITHUB_BRANCH = 'main'

// Raw GitHub URLs for data files
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}`
const EVENTS_URL = `${GITHUB_RAW_BASE}/boston_events.json`
const TRAVELERS_URL = `${GITHUB_RAW_BASE}/boston_travelers.json`
const EVENTS_VERSION_URL = `${GITHUB_RAW_BASE}/.versions/boston_events.version`
const TRAVELERS_VERSION_URL = `${GITHUB_RAW_BASE}/.versions/boston_travelers.version`

class DataSyncService {
  /**
   * Get local version timestamp from localStorage
   */
  private getLocalVersion(key: string): string | null {
    const versionKey = `${key}_version`
    const stored = localStorage.getItem(versionKey)
    return stored ? JSON.parse(stored).timestamp : null
  }

  /**
   * Set local version timestamp in localStorage
   */
  private setLocalVersion(key: string, timestamp: string): void {
    const versionKey = `${key}_version`
    localStorage.setItem(versionKey, JSON.stringify({ timestamp }))
  }

  /**
   * Fetch data from GitHub with error handling
   */
  private async fetchFromGitHub<T>(url: string): Promise<T | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.raw+json',
          'Cache-Control': 'no-cache',
        },
      })

      if (!response.ok) {
        console.warn(`Failed to fetch from GitHub: ${url}`, response.status)
        return null
      }

      // Handle both JSON and text responses
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      } else {
        const text = await response.text()
        return JSON.parse(text)
      }
    } catch (error) {
      console.warn('GitHub sync error:', error)
      return null
    }
  }

  /**
   * Sync events from GitHub to localStorage
   */
  async syncEvents(): Promise<SyncResult> {
    // DISABLED: GitHub raw content has CORS issues in browser deployments
    return { synced: false, message: 'GitHub sync disabled' }
  }
      const remoteVersion = await this.fetchFromGitHub<DataVersion>(EVENTS_VERSION_URL)
      if (!remoteVersion) {
        return { synced: false, message: 'Could not fetch remote version' }
      }

      // Compare with local version
      const localVersion = this.getLocalVersion('boston_events_local')
      const remoteTimestamp = new Date(remoteVersion.timestamp).getTime()
      const localTimestamp = localVersion ? new Date(localVersion).getTime() : 0

      // If local is up-to-date, skip
      if (localTimestamp >= remoteTimestamp) {
        return { synced: false, message: 'Local events already up-to-date' }
      }

      // Fetch remote data
      const remoteEvents = await this.fetchFromGitHub(EVENTS_URL)
      if (!remoteEvents) {
        return { synced: false, message: 'Could not fetch remote events' }
      }

      // Update localStorage
      localStorage.setItem('boston_events_local', JSON.stringify(remoteEvents))
      this.setLocalVersion('boston_events_local', remoteVersion.timestamp)

      return { synced: true, message: 'Events synced successfully' }
    } catch (error) {
      console.error('Events sync failed:', error)
      return { synced: false, message: 'Sync failed' }
    }
  }

  /**
   * Sync travelers from GitHub to localStorage
   */
  async syncTravelers(): Promise<SyncResult> {
    // DISABLED: GitHub raw content has CORS issues in browser deployments
    return { synced: false, message: 'GitHub sync disabled' }
  }
      const remoteVersion = await this.fetchFromGitHub<DataVersion>(TRAVELERS_VERSION_URL)
      if (!remoteVersion) {
        return { synced: false, message: 'Could not fetch remote version' }
      }

      // Compare with local version
      const localVersion = this.getLocalVersion('boston_travelers_local')
      const remoteTimestamp = new Date(remoteVersion.timestamp).getTime()
      const localTimestamp = localVersion ? new Date(localVersion).getTime() : 0

      // If local is up-to-date, skip
      if (localTimestamp >= remoteTimestamp) {
        return { synced: false, message: 'Local travelers already up-to-date' }
      }

      // Fetch remote data
      const remoteTravelers = await this.fetchFromGitHub(TRAVELERS_URL)
      if (!remoteTravelers) {
        return { synced: false, message: 'Could not fetch remote travelers' }
      }

      // Update localStorage
      localStorage.setItem('boston_travelers_local', JSON.stringify(remoteTravelers))
      this.setLocalVersion('boston_travelers_local', remoteVersion.timestamp)

      return { synced: true, message: 'Travelers synced successfully' }
    } catch (error) {
      console.error('Travelers sync failed:', error)
      return { synced: false, message: 'Sync failed' }
    }
  }

  /**
   * Sync both events and travelers
   */
  async syncAll(): Promise<{ events: SyncResult; travelers: SyncResult }> {
    const [eventResult, travelerResult] = await Promise.all([
      this.syncEvents(),
      this.syncTravelers(),
    ])

    return { events: eventResult, travelers: travelerResult }
  }
}

export const dataSyncService = new DataSyncService()
