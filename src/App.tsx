import { useEffect, useRef } from 'react'
import { Router } from './router'
import { useAppStore } from './store'
import { eventDataService } from './services/eventDataService'
import { localTravelersDataService } from './services/localTravelersDataService'
import initialTravelers from './data/initialTravelers.json'
import initialEvents from './data/initialEvents.json'
import initialItineraryData from './data/initialItinerary.json'
import './App.css'

// Build version: LATEST
function App() {
  const initializedRef = useRef(false)

  useEffect(() => {
    // Prevent re-initialization
    if (initializedRef.current) return
    initializedRef.current = true

    // Non-blocking initialization - load from localStorage, seed with initial data on first load
    ;(async () => {
      try {
        console.log('[App] Starting initialization...')

        // Load baseAddress from localStorage if available
        const savedBaseAddress = localStorage.getItem('baseAddress')
        if (savedBaseAddress) {
          console.log('[App] Loaded baseAddress from localStorage:', savedBaseAddress)
          useAppStore.getState().setBaseAddress(savedBaseAddress)
        }

        // Load directionsOrigin from localStorage if available
        const savedDirectionsOrigin = localStorage.getItem('directionsOrigin') as 'current' | 'base' | null
        if (savedDirectionsOrigin) {
          console.log('[App] Loaded directionsOrigin from localStorage:', savedDirectionsOrigin)
          useAppStore.getState().setDirectionsOrigin(savedDirectionsOrigin)
        }

        // Load userLocation from localStorage if available
        const savedUserLocation = localStorage.getItem('userLocation')
        if (savedUserLocation) {
          try {
            const location = JSON.parse(savedUserLocation)
            console.log('[App] Loaded userLocation from localStorage:', location)
            useAppStore.getState().setUserLocation(location)
          } catch (err) {
            console.error('[App] Failed to parse userLocation from localStorage:', err)
          }
        }

        // Load stored travelers from localStorage, seed with initial data on first load only
        console.log('[App] Loading travelers...')
        const savedTravelers = localStorage.getItem('boston_travelers_local')
        if (savedTravelers) {
          console.log('[App] Found existing travelers in localStorage, using those')
          const parsed = JSON.parse(savedTravelers)
          useAppStore.getState().setTravelers(parsed)
        } else {
          console.log('[App] No travelers in localStorage, seeding with initial data')
          console.log('[App] Initial travelers count:', initialTravelers.length)
          localTravelersDataService.saveTravelers(initialTravelers)
          useAppStore.getState().setTravelers(initialTravelers)
        }
        console.log('[App] ✓ Travelers loaded and synced to store')

        // Load stored events from localStorage, seed with initial data on first load only
        console.log('[App] Loading events...')
        const savedEvents = localStorage.getItem('boston_events_local')
        if (savedEvents) {
          console.log('[App] Found existing events in localStorage, using those')
          const parsed = JSON.parse(savedEvents)
          useAppStore.getState().setEvents(parsed)
        } else {
          console.log('[App] No events in localStorage, seeding with initial data')
          console.log('[App] Initial events count:', initialEvents.length)
          localStorage.setItem('boston_events_local', JSON.stringify(initialEvents))
          useAppStore.getState().setEvents(initialEvents)
        }
        console.log('[App] ✓ Events loaded and synced to store')

        // Load stored itinerary from localStorage, seed with initial data on first load only
        console.log('[App] Loading itinerary...')
        const savedItinerary = localStorage.getItem('currentItinerary')
        
        let itineraryToUse
        if (savedItinerary) {
          console.log('[App] Found existing itinerary in localStorage, using that')
          itineraryToUse = JSON.parse(savedItinerary)
          // Parse dates since they're stored as strings
          itineraryToUse.createdAt = new Date(itineraryToUse.createdAt)
          itineraryToUse.updatedAt = new Date(itineraryToUse.updatedAt)
        } else {
          console.log('[App] No itinerary in localStorage, seeding with initial data')
          
          if (!initialItineraryData) {
            throw new Error('initialItineraryData is undefined - JSON import failed')
          }
          
          // Convert JSON dates to Date objects
          itineraryToUse = {
            ...initialItineraryData,
            createdAt: new Date(initialItineraryData.createdAt),
            updatedAt: new Date(initialItineraryData.updatedAt),
          }
          console.log('[App] Initial itinerary created:', itineraryToUse)
          localStorage.setItem('currentItinerary', JSON.stringify(itineraryToUse))
        }
        
        console.log('[App] Itinerary:', itineraryToUse)
        useAppStore.getState().setItinerary(itineraryToUse)
        console.log('[App] ✓ Itinerary loaded and synced to store')

        // Start Firebase sync for itinerary
        console.log('[App] Initializing Firebase sync with itinerary ID:', itineraryToUse.id)
        eventDataService.initializeSync(itineraryToUse.id)
        console.log('[App] ✓ Firebase sync initialized')
        
        console.log('[App] ✓ All initialization complete')
      } catch (err) {
        console.error('[App] Failed to initialize app:', err)
      }
    })()

    // Cleanup
    return () => {
      eventDataService.stopSync()
    }
  }, [])

  return <Router />
}

export default App
