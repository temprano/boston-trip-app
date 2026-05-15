export interface Location {
  lat: number
  lng: number
  name: string
  address?: string
}

export interface Activity {
  id: string
  title: string
  description?: string
  time: string
  duration: number
  location: Location
  category: 'food' | 'sightseeing' | 'entertainment' | 'transport' | 'other'
  notes?: string
}

export interface Day {
  id: string
  date: string
  dayOfWeek: string
  activities: Activity[]
  notes?: string
}

export interface Itinerary {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  days: Day[]
  baseAddress?: string
  createdAt: Date
  updatedAt: Date
}

export interface WeatherData {
  temp: number
  feelsLike: number
  tempMin: number
  tempMax: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: number
  cloudCover: number
  description: string
  icon: string
  timestamp: Date
}

export interface FlightInfo {
  arrivalAirline: string
  arrivalFlightNumber: string
  arrivalTime: string
  departureAirline: string
  departureFlightNumber: string
  departureTime: string
}

export interface Contact {
  email?: string
  phone?: string
  address?: string
}

export interface Traveler {
  id: string
  name: string
  avatar?: string
  contact: Contact
  flightInfo?: FlightInfo
  bio?: string
  role?: 'organizer' | 'guest'
  dietaryRestrictions?: string[]
  notes?: string
}

export interface Event {
  id: string
  title: string
  venue: string
  date: string
  time: string
  phone?: string
  address: {
    line1: string
    line2: string
  }
  eventImage: string
  category?: string
  stopId?: string
}

export interface GooglePlace {
  id: string
  name: string
  type: 'restaurant' | 'bar' | 'museum' | 'tourist_attraction'
  lat: number
  lng: number
  rating?: number
  address?: string
  phone?: string
  website?: string
  openingHours?: string[]
}

export interface MapFilters {
  restaurants: boolean
  bars: boolean
  museums: boolean
  touristAttractions: boolean
}

export interface MapMarkerColors {
  restaurant: string
  bar: string
  museum: string
  tourist_attraction: string
  event: string
}

export interface AppState {
  currentItinerary: Itinerary | null
  travelers: Traveler[]
  events: Event[]
  isOffline: boolean
  theme: 'light' | 'dark'
  userLocation: any | null // UserLocation from locationService (lat, lng, accuracy, timestamp)
  isTrackingLocation: boolean
  optimizedActivityOrder: string[]
  baseAddress?: string
  directionsOrigin: 'current' | 'base'
}

// Directions API types
export interface Duration {
  value: number // seconds
  text: string
}

export interface Distance {
  value: number // meters
  text: string
}

export interface DirectionStep {
  instruction: string
  distance: Distance
  duration: Duration
  startLocation: { lat: number; lng: number }
  endLocation: { lat: number; lng: number }
  html_instructions?: string
  transit_details?: {
    line: {
      name: string
      short_name?: string
      vehicle: {
        type: string
      }
      agencies?: Array<{
        name: string
      }>
    }
    arrival_time?: {
      text: string
      value: number
    }
    departure_time?: {
      text: string
      value: number
    }
    arrival_stop?: {
      name: string
    }
    departure_stop?: {
      name: string
    }
    num_stops?: number
  }
}

export interface TransitLeg {
  steps: DirectionStep[]
  distance: Distance
  duration: Duration
  start_location: { lat: number; lng: number }
  end_location: { lat: number; lng: number }
  start_address: string
  end_address: string
  startLocation?: { lat: number; lng: number }
  endLocation?: { lat: number; lng: number }
  startAddress?: string
  endAddress?: string
}

export interface DirectionRoute {
  legs: TransitLeg[]
  distance: Distance
  duration: Duration
  summary: string
}

export interface DirectionsResponse {
  routes: DirectionRoute[]
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'UNKNOWN_ERROR'
  error?: string
}
