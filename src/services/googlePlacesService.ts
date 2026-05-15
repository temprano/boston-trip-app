import { GooglePlace } from '../types'

// Firebase Cloud Function URLs
const FIREBASE_GEOCODE_URL = 'https://us-central1-boston-travel-app-2dcff.cloudfunctions.net/geocodeAddress'
const FIREBASE_PLACES_URL = 'https://us-central1-boston-travel-app-2dcff.cloudfunctions.net/getNearbyPlaces'

// Type definitions for Google API responses
interface GeocodeResult {
  lat: number
  lng: number
}

interface PlacesNearbyResponse {
  results: Array<{
    place_id: string
    name: string
    rating?: number
    formatted_address?: string
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
    opening_hours?: {
      open_now?: boolean
      weekday_text?: string[]
    }
    types: string[]
  }>
}

interface PlaceDetailsResult {
  result: {
    formatted_phone_number?: string
    website?: string
    opening_hours?: {
      weekday_text?: string[]
    }
  }
}

/**
 * Google Places Service
 * Handles all Google Maps & Places API interactions via Firebase Cloud Functions
 * This avoids CORS issues and keeps the API key server-side
 */
export const googlePlacesService = {
  /**
   * Convert address string to coordinates via Firebase Cloud Function
   */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    try {
      const response = await fetch(FIREBASE_GEOCODE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new Error(`Geocoding function error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status !== 'OK' || data.lat === null || data.lng === null) {
        console.error('Geocoding response:', data)
        throw new Error(data.error || 'Address not found')
      }

      return {
        lat: data.lat,
        lng: data.lng,
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      throw error
    }
  },

  /**
   * Get nearby places of a specific type within radius via Firebase Cloud Function
   * @param lat - Latitude
   * @param lng - Longitude
   * @param type - Place type: 'restaurant', 'bar', 'museum', 'tourist_attraction'
   * @param radiusMeters - Search radius in meters (default 800m = walking distance)
   */
  async getNearbyPlaces(
    lat: number,
    lng: number,
    type: 'restaurant' | 'bar' | 'museum' | 'tourist_attraction',
    radiusMeters = 800
  ): Promise<GooglePlace[]> {
    try {
      const response = await fetch(FIREBASE_PLACES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat,
          lng,
          type,
          radius: radiusMeters,
        }),
      })

      if (!response.ok) {
        console.error(`Places API error for ${type}: ${response.status} ${response.statusText}`)
        return this.getFallbackPlaces(type)
      }

      const data = await response.json()

      if (data.status !== 'OK' || !data.results) {
        console.warn(`No results for ${type}:`, data.error)
        return this.getFallbackPlaces(type)
      }

      // Firebase function already returns transformed GooglePlace format
      return data.results
    } catch (error) {
      console.error(`Error fetching ${type} places:`, error)
      return this.getFallbackPlaces(type)
    }
  },

  /**
   * Fallback demo data when API is unavailable
   */
  getFallbackPlaces(type: 'restaurant' | 'bar' | 'museum' | 'tourist_attraction'): GooglePlace[] {
    const fallbackData: Record<string, GooglePlace[]> = {
      restaurant: [
        { id: '1', name: 'Union Oyster House', type: 'restaurant', lat: 42.361, lng: -71.057, rating: 4.6, address: '41 Union St, Boston, MA' },
        { id: '2', name: 'The Barking Crab', type: 'restaurant', lat: 42.355, lng: -71.051, rating: 4.5, address: '88 Sleeper St, Boston, MA' },
        { id: '3', name: 'Neptune Oyster', type: 'restaurant', lat: 42.363, lng: -71.053, rating: 4.7, address: '63 Salem St, Boston, MA' },
        { id: '4', name: 'Abe & Louie\'s', type: 'restaurant', lat: 42.351, lng: -71.068, rating: 4.6, address: '60 Charles St, Boston, MA' },
        { id: '5', name: 'Eastern Standard', type: 'restaurant', lat: 42.346, lng: -71.064, rating: 4.5, address: '528 Commonwealth Ave, Boston, MA' },
      ],
      bar: [
        { id: '6', name: 'The Beehive', type: 'bar', lat: 42.352, lng: -71.064, rating: 4.6, address: '541 Tremont St, Boston, MA' },
        { id: '7', name: 'Top of the Hub', type: 'bar', lat: 42.358, lng: -71.064, rating: 4.5, address: '800 Boylston St, Boston, MA' },
      ],
      museum: [
        { id: '8', name: 'Museum of Fine Arts', type: 'museum', lat: 42.339, lng: -71.099, rating: 4.6, address: '465 Huntington Ave, Boston, MA' },
        { id: '9', name: 'New England Aquarium', type: 'museum', lat: 42.369, lng: -71.038, rating: 4.5, address: '1 Central Wharf, Boston, MA' },
      ],
      tourist_attraction: [
        { id: '10', name: 'Public Garden', type: 'tourist_attraction', lat: 42.353, lng: -71.071, rating: 4.6, address: 'Boston, MA' },
        { id: '11', name: 'Boston Common', type: 'tourist_attraction', lat: 42.357, lng: -71.064, rating: 4.5, address: 'Boston, MA' },
      ],
    }
    return fallbackData[type] || []
  },

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<Partial<GooglePlace>> {
    try {
      // Note: Direct API calls to Google Places require GOOGLE_API_KEY
      // For production, this should be proxied through Firebase Cloud Function
      // For now, return empty object as details are optional
      return {}
    } catch (error) {
      console.error('Error fetching place details:', error)
      return {}
    }
  },

  /**
   * Batch fetch nearby places for all selected types
   */
  async getNearbyPlacesByTypes(
    lat: number,
    lng: number,
    types: Array<'restaurant' | 'bar' | 'museum' | 'tourist_attraction'>,
    radiusMeters = 800
  ): Promise<Record<string, GooglePlace[]>> {
    try {
      const results = await Promise.all(
        types.map((type) => this.getNearbyPlaces(lat, lng, type, radiusMeters))
      )

      const placesByType: Record<string, GooglePlace[]> = {}
      types.forEach((type, index) => {
        placesByType[type] = results[index]
      })

      return placesByType
    } catch (error) {
      console.error('Error fetching places by types:', error)
      return {}
    }
  },
}
