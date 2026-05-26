import { useEffect, useRef } from 'react'
import { Router } from './router'
import { useAppStore } from './store'
import { eventDataService } from './services/eventDataService'
import { travelersDataService } from './services/travelersDataService'
import { baseAddressSyncService } from './services/baseAddressSyncService'
import { localTravelersDataService } from './services/localTravelersDataService'
import { addTestData } from './utils/testDataGenerator'
import initialTravelers from './data/initialTravelers.json'
import initialEvents from './data/initialEvents.json'
import initialItineraryData from './data/initialItinerary.json'
import './App.css'

// Expose test data function to window for console debugging
if (typeof window !== 'undefined') {
  (window as any).addTestData = addTestData
  console.log('[App] Exposed window.addTestData() for testing - run in console to add test event and traveler')
}

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
          let parsed = JSON.parse(savedEvents)
          
          // Migration: ensure ALL events have nearestStopId from initialEvents
          let needsUpdate = false
          parsed = parsed.map((event: any) => {
            // If event already has nearestStopId, keep it
            if (event.nearestStopId) {
              // Clean up any old fields
              if (event.stopId || event.stop) {
                needsUpdate = true
                return {
                  ...event,
                  stop: undefined,
                  stopId: undefined,
                }
              }
              return event
            }
            
            // Event missing nearestStopId - look it up from initialEvents
            const initialEvent = initialEvents.find((e: any) => e.id === event.id)
            if (initialEvent && initialEvent.nearestStopId) {
              console.log('[App] Adding nearestStopId to event', event.id, ':', initialEvent.nearestStopId)
              needsUpdate = true
              return {
                ...event,
                nearestStopId: initialEvent.nearestStopId,
                stop: undefined,
                stopId: undefined,
              }
            }
            
            // Fallback: convert old stopId/stop field if present
            if (event.stopId || event.stop) {
              console.log('[App] Migrating event', event.id, 'from old stopId/stop field')
              needsUpdate = true
              return {
                ...event,
                nearestStopId: event.stop || event.stopId,
                stop: undefined,
                stopId: undefined,
              }
            }
            
            return event
          })
          
          if (needsUpdate) {
            console.log('[App] Events migrated, saving updated data to localStorage')
            localStorage.setItem('boston_events_local', JSON.stringify(parsed))
          }
          
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
        await travelersDataService.initializeSync(itineraryToUse.id)
        
        // Pull base address from Firebase (if available)
        console.log('[App] Pulling base address from Firebase...')
        const firebaseBaseAddress = await baseAddressSyncService.pullBaseAddressFromFirebase(itineraryToUse.id)
        if (firebaseBaseAddress) {
          console.log('[App] ✓ Base address found in Firebase:', firebaseBaseAddress)
          useAppStore.getState().setBaseAddress(firebaseBaseAddress)
        } else {
          console.log('[App] No base address in Firebase, using local value:', useAppStore.getState().baseAddress)
        }
        
        // Subscribe to real-time base address updates
        baseAddressSyncService.subscribeToBaseAddressSync(itineraryToUse.id, (address) => {
          console.log('[App] Base address updated from Firebase:', address)
          useAppStore.getState().setBaseAddress(address)
        })
        
        console.log('[App] ✓ Firebase sync initialized')
        console.log('[App] ✓ All initialization complete')
        console.log('[App] TIP: Run window.addTestData() in console to add test event and traveler for pull-to-refresh testing')
      } catch (err) {
        console.error('[App] Failed to initialize app:', err)
      }
    })()

    // Cleanup
    return () => {
      eventDataService.stopSync()
      travelersDataService.stopSync()
    }
  }, [])

  return <Router />
}

export default App
