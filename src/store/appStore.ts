import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Itinerary, Traveler, Event, AppState } from '../types'
import { UserLocation } from '../services/locationService'
import { localTravelersDataService } from '../services/localTravelersDataService'

export interface AppStore extends AppState {
  // Setters
  setItinerary: (itinerary: Itinerary | null) => void
  setTravelers: (travelers: Traveler[]) => void
  setEvents: (events: Event[]) => void
  setIsOffline: (isOffline: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setUserLocation: (location: UserLocation | null) => void
  setIsTrackingLocation: (isTracking: boolean) => void
  setOptimizedActivityOrder: (activityIds: string[]) => void
  setBaseAddress: (address: string) => void
  setDirectionsOrigin: (origin: 'current' | 'base') => void

  // Actions
  addTraveler: (traveler: Traveler) => void
  removeTraveler: (travelerId: string) => void
  updateTraveler: (travelerId: string, updates: Partial<Traveler>) => void
  resetState: () => void
}

const initialState: AppState = {
  currentItinerary: null,
  travelers: [],
  events: [],
  isOffline: false,
  theme: 'light',
  userLocation: null,
  isTrackingLocation: false,
  optimizedActivityOrder: [],
  baseAddress: '',
  directionsOrigin: 'base',
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    // Setters
    setItinerary: (itinerary) => {
      // Auto-persist to localStorage whenever itinerary changes
      if (itinerary) {
        localStorage.setItem('currentItinerary', JSON.stringify(itinerary))
      } else {
        localStorage.removeItem('currentItinerary')
      }
      set({ currentItinerary: itinerary })
    },

    setTravelers: (travelers) => {
      // Auto-persist to localStorage whenever travelers change
      localTravelersDataService.saveTravelers(travelers)
      set({ travelers })
    },

    setEvents: (events) => {
      // Auto-persist to localStorage whenever events change
      localStorage.setItem('boston_events_local', JSON.stringify(events))
      set({ events })
    },

    setIsOffline: (isOffline) => set({ isOffline }),

    setTheme: (theme) => set({ theme }),

    setUserLocation: (location) => {
      // Auto-persist to localStorage whenever location changes
      if (location) {
        localStorage.setItem('userLocation', JSON.stringify(location))
      } else {
        localStorage.removeItem('userLocation')
      }
      set({ userLocation: location })
    },

    setIsTrackingLocation: (isTracking) => set({ isTrackingLocation: isTracking }),

    setOptimizedActivityOrder: (activityIds) =>
      set({ optimizedActivityOrder: activityIds }),

    setBaseAddress: (address) => {
      // Auto-persist to localStorage whenever baseAddress changes
      localStorage.setItem('baseAddress', address)
      set({ baseAddress: address })
    },

    setDirectionsOrigin: (origin) => {
      // Auto-persist to localStorage
      localStorage.setItem('directionsOrigin', origin)
      set({ directionsOrigin: origin })
    },

    // Actions
    addTraveler: (traveler) =>
      set((state) => {
        const updated = [...state.travelers, traveler]
        localTravelersDataService.saveTravelers(updated)
        return { travelers: updated }
      }),

    removeTraveler: (travelerId) =>
      set((state) => {
        const updated = state.travelers.filter((t) => t.id !== travelerId)
        localTravelersDataService.saveTravelers(updated)
        return { travelers: updated }
      }),

    updateTraveler: (travelerId, updates) =>
      set((state) => {
        const updated = state.travelers.map((t) =>
          t.id === travelerId ? { ...t, ...updates } : t
        )
        localTravelersDataService.saveTravelers(updated)
        return { travelers: updated }
      }),

    resetState: () => set(initialState),
  }))
)

// Selector hooks for better performance
export const useItinerary = () => useAppStore((state) => state.currentItinerary)
export const useTravelers = () => useAppStore((state) => state.travelers)
export const useIsOffline = () => useAppStore((state) => state.isOffline)
export const useTheme = () => useAppStore((state) => state.theme)
export const useUserLocation = () => useAppStore((state) => state.userLocation)
export const useIsTrackingLocation = () =>
  useAppStore((state) => state.isTrackingLocation)
export const useOptimizedActivityOrder = () =>
  useAppStore((state) => state.optimizedActivityOrder)
