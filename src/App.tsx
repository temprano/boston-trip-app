import { useEffect } from 'react'
import { Router } from './router'
import { useAppStore } from './store'
import { mockDataService } from './services/mockDataService'
import { localTravelersDataService } from './services/localTravelersDataService'
import { eventDataService } from './services/eventDataService'
import { dataSyncService } from './services/dataSyncService'
import { Traveler, Event } from './types'
import './App.css'

function App() {
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load itinerary from mock service
        const itinerary = await mockDataService.getItinerary()
        useAppStore.getState().setItinerary(itinerary)

        // Load travelers from JSON file
        const travelersResponse = await fetch('/assets/localstore-v1.json')
        if (!travelersResponse.ok) {
          throw new Error('Failed to load travelers from JSON file')
        }

        const travelers: Traveler[] = await travelersResponse.json()

        // Save to localStorage
        localTravelersDataService.saveTravelers(travelers)

        // Set data in store
        useAppStore.getState().setTravelers(travelers)

        // Load events - check localStorage first, then load from JSON if empty
        const existingEvents = eventDataService.getEvents()
        if (existingEvents.length === 0) {
          // Only load from JSON if localStorage is empty (fresh start)
          const eventsResponse = await fetch('/assets/events-v1.json')
          if (eventsResponse.ok) {
            const events: Event[] = await eventsResponse.json()
            // Save to localStorage
            eventDataService.saveEvents(events)
          }
        }

        // ── Sync with GitHub (pull latest master data if available) ──
        // This runs silently in background - doesn't block app load
        // Disabled in development due to CORS restrictions on localhost
        if (!import.meta.env.DEV) {
          dataSyncService.syncAll().then(result => {
            if (result.events.synced) {
              console.log('Events synced from GitHub')
            }
            if (result.travelers.synced) {
              console.log('Travelers synced from GitHub')
            }
          }).catch(err => {
            console.warn('Background sync failed:', err)
          })
        }
      } catch (error) {
        console.error('Failed to load initial data:', error)
        // Fallback: try to load from localStorage if file load fails
        const stored = localTravelersDataService.getTravelers()
        if (stored.length > 0) {
          useAppStore.getState().setTravelers(stored)
        }
      }
    }

    loadData()
  }, [])

  return <Router />
}

export default App
