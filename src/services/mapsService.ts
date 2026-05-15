// Google Maps service for directions and location-based features
import { Loader } from '@googlemaps/js-api-loader'

export interface Location {
  lat: number
  lng: number
  name?: string
}

export interface DirectionsResult {
  distance: string
  duration: string
  steps: string[]
}

export interface PlaceDetails {
  name: string
  address: string
  lat: number
  lng: number
  rating?: number
  types: string[]
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo-key'
const FIREBASE_PLACES_URL = 'https://us-central1-boston-travel-app-2dcff.cloudfunctions.net/getNearbyPlaces'

let mapsLoaded = false
let loader: Loader | null = null

const getLoader = () => {
  if (!loader) {
    loader = new Loader({
      apiKey: API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    })
  }
  return loader
}

export const mapsService = {
  async ensureMapsLoaded(): Promise<void> {
    if (mapsLoaded) return

    try {
      await getLoader().load()
      mapsLoaded = true
    } catch (error) {
      console.error('Failed to load Google Maps:', error)
      throw error
    }
  },

  async getDirections(
    origin: Location,
    destination: Location
  ): Promise<DirectionsResult> {
    // Call the Cloud Function proxy instead of Google API directly
    // This keeps the API key server-side and handles CORS
    const cloudFunctionUrl = 'https://us-central1-boston-travel-app-2dcff.cloudfunctions.net/getDirections'
    
    const body = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: 'walking',
    }

    const response = await fetch(cloudFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Directions API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== 'OK' || data.routes.length === 0) {
      throw new Error(data.error || 'No route found')
    }

    const route = data.routes[0]
    const leg = route.legs[0]

    return {
      distance: leg.distance.text,
      duration: leg.duration.text,
      steps: leg.steps.map((step: any) => step.html_instructions),
    }
  },

  async getNearbyPlaces(
    location: Location,
    type: string,
    radius: number = 1000
  ): Promise<PlaceDetails[]> {
    try {
      const response = await fetch(FIREBASE_PLACES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          type,
          radius,
        }),
      })

      if (!response.ok) {
        throw new Error(`Nearby Search API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.results) {
        return []
      }

      // Transform Firebase function response to PlaceDetails format
      return data.results.map((place: any) => ({
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        rating: place.rating,
        types: [place.type],
      }))
    } catch (error) {
      console.error('Error fetching nearby places:', error)
      return []
    }
  },

  calculateDistance(
    from: Location,
    to: Location
  ): number {
    // Haversine formula for distance between two coordinates (in km)
    const R = 6371
    const dLat = ((to.lat - from.lat) * Math.PI) / 180
    const dLng = ((to.lng - from.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.lat * Math.PI) / 180) *
        Math.cos((to.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  getMapEmbedUrl(location: Location, zoom: number = 15): string {
    const params = new URLSearchParams({
      center: `${location.lat},${location.lng}`,
      zoom: zoom.toString(),
      size: '600x400',
      maptype: 'roadmap',
      markers: `color:red|${location.lat},${location.lng}`,
      key: API_KEY,
    })
    return `https://maps.googleapis.com/maps/api/staticmap?${params}`
  },
}
