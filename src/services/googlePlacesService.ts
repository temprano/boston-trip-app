import { GooglePlace } from '../types'

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Type definitions for Google API responses
interface GeocodeResult {
  lat: number
  lng: number
}

interface PlacesNearbyResult {
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
 * Handles all Google Maps & Places API interactions
 */
export const googlePlacesService = {
  /**
   * Convert address string to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    try {
      // Improve address format for better geocoding results
      // Convert "Street, CITY ST ZIP" to "Street, City, ST ZIP"
      let formattedAddress = address
      
      // Convert all-caps city names to proper case
      const addressParts = address.split(',')
      if (addressParts.length >= 2) {
        // Capitalize city and state properly
        formattedAddress = addressParts
          .map((part, i) => {
            const trimmed = part.trim()
            if (i === 0) return trimmed // Keep street as-is
            // Capitalize first letter of city, format state abbreviation
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
          })
          .join(', ')
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formattedAddress)}&components=country:US&key=${GOOGLE_API_KEY}`
      )
      const data = await response.json()

      if (!data.results || data.results.length === 0) {
        console.error('Geocoding response:', data)
        throw new Error('Address not found')
      }

      const location = data.results[0].geometry.location
      return {
        lat: location.lat,
        lng: location.lng,
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      throw error
    }
  },

  /**
   * Get nearby places of a specific type within radius
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
      // Map type to Google Places API keyword/type
      const typeKeywords: Record<string, string> = {
        restaurant: 'restaurant',
        bar: 'bar',
        museum: 'museum',
        tourist_attraction: 'tourist_attraction',
      }

      const typeQuery = typeKeywords[type] || type

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=${typeQuery}&key=${GOOGLE_API_KEY}`
      )
      
      if (!response.ok) {
        console.error(`API error for ${type}: ${response.status} ${response.statusText}`)
        return this.getFallbackPlaces(type)
      }
      
      const data = (await response.json()) as PlacesNearbyResult

      if (!data.results) {
        return []
      }

      // Transform API response to GooglePlace format
      return data.results.map((place) => ({
        id: place.place_id,
        name: place.name,
        type: type,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        rating: place.rating,
        address: place.formatted_address,
      }))
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
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,opening_hours&key=${GOOGLE_API_KEY}`
      )
      const data = (await response.json()) as PlaceDetailsResult

      if (!data.result) {
        return {}
      }

      return {
        phone: data.result.formatted_phone_number,
        website: data.result.website,
        openingHours: data.result.opening_hours?.weekday_text,
      }
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
