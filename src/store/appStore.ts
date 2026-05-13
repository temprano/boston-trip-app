import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Itinerary, Traveler, AppState, Location } from '../types'

export interface AppStore extends AppState {
  // Setters
  setItinerary: (itinerary: Itinerary | null) => void
  setTravelers: (travelers: Traveler[]) => void
  setIsOffline: (isOffline: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setUserLocation: (location: Location | null) => void
  setIsTrackingLocation: (isTracking: boolean) => void
  setOptimizedActivityOrder: (activityIds: string[]) => void

  // Actions
  addTraveler: (traveler: Traveler) => void
  removeTraveler: (travelerId: string) => void
  updateTraveler: (travelerId: string, updates: Partial<Traveler>) => void
  resetState: () => void
}

const initialState: AppState = {
  currentItinerary: null,
  travelers: [],
  isOffline: false,
  theme: 'light',
  userLocation: null,
  isTrackingLocation: false,
  optimizedActivityOrder: [],
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    // Setters
    setItinerary: (itinerary) => set({ currentItinerary: itinerary }),

    setTravelers: (travelers) => set({ travelers }),

    setIsOffline: (isOffline) => set({ isOffline }),

    setTheme: (theme) => set({ theme }),

    setUserLocation: (location) => set({ userLocation: location }),

    setIsTrackingLocation: (isTracking) => set({ isTrackingLocation: isTracking }),

    setOptimizedActivityOrder: (activityIds) =>
      set({ optimizedActivityOrder: activityIds }),

    // Actions
    addTraveler: (traveler) =>
      set((state) => ({
        travelers: [...state.travelers, traveler],
      })),

    removeTraveler: (travelerId) =>
      set((state) => ({
        travelers: state.travelers.filter((t) => t.id !== travelerId),
      })),

    updateTraveler: (travelerId, updates) =>
      set((state) => ({
        travelers: state.travelers.map((t) =>
          t.id === travelerId ? { ...t, ...updates } : t
        ),
      })),

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
