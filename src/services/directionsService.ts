import { DirectionsResponse } from '../types'

/**
 * Directions Service - calls Firebase Cloud Function to get Google Directions
 * Uses Firebase function to proxy Google API calls (avoids CORS issues, keeps API key server-side)
 */
export const directionsService = {
  /**
   * Get directions between two points
   * Calls Firebase Cloud Function which handles Google Directions API
   * @param origin - "lat,lng" or address string
   * @param destination - "lat,lng" or address string
   * @param mode - "transit", "driving", "walking", "bicycling"
   * @returns DirectionsResponse with routes
   */
  async getDirections(
    origin: string,
    destination: string,
    mode: 'transit' | 'driving' | 'walking' | 'bicycling' = 'transit'
  ): Promise<DirectionsResponse> {
    try {
      // Call Firebase Cloud Function endpoint
      const firebaseUrl = `https://us-central1-boston-travel-app-2dcff.cloudfunctions.net/getDirections`
      
      console.log(`[directionsService] 📍 Requesting directions:`, { origin, destination, mode })
      
      const response = await fetch(firebaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, mode }),
      })

      console.log(`[directionsService] 📡 Response status:`, response.status, response.statusText)

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`[directionsService] ❌ HTTP Error:`, errorData)
        return {
          routes: [],
          status: 'ERROR' as any,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      console.log(`[directionsService] ✓ Got response:`, data)

      // Check if Firebase function returned an error
      if (data.status !== 'OK') {
        console.error(`[directionsService] ❌ API Error:`, data.error)
        return {
          routes: [],
          status: data.status,
          error: data.error || 'Unable to find directions',
        }
      }

      return data
    } catch (error) {
      console.error('[directionsService] ❌ Exception:', error)
      return {
        routes: [],
        status: 'ERROR' as any,
        error: error instanceof Error ? error.message : 'Directions service unavailable',
      }
    }
  },
}
