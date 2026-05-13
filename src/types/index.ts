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
  isOffline: boolean
  theme: 'light' | 'dark'
  userLocation: Location | null
  isTrackingLocation: boolean
  optimizedActivityOrder: string[]
}
