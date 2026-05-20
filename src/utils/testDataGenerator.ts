import { Event, Traveler } from '../types'

/**
 * Generate test event data for pull-to-refresh testing
 * Call from browser console: window.addTestData()
 */
export function generateTestEvent(): Event {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]

  const testEvent: Event = {
    id: String(Math.max(0, ...JSON.parse(localStorage.getItem('boston_events_local') || '[]').map((e: Event) => parseInt(e.id))) + 1),
    title: '🧪 Test Event - Pull to Refresh',
    venue: 'Test Venue Boston',
    date: dateStr,
    time: '14:00',
    address: {
      line1: '123 Test Street',
      line2: 'Boston, MA 02101',
    },
    eventImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    category: 'sightseeing',
    phone: '(617) 555-TEST',
  }
  return testEvent
}

export function generateTestTraveler(): Traveler {
  const existingTravelers = JSON.parse(localStorage.getItem('boston_travelers_local') || '[]') as Traveler[]
  const maxId = Math.max(0, ...existingTravelers.map(t => parseInt(t.id)))

  const testTraveler: Traveler = {
    id: String(maxId + 1),
    name: '🧪 Test Traveler',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    contact: {
      email: 'test@example.com',
      phone: '(617) 555-TEST',
      address: '123 Test Ave, Boston, MA',
    },
    flightInfo: {
      arrivalAirline: 'TEST AIR',
      arrivalFlightNumber: 'TEST-001',
      arrivalTime: '10:00 AM',
      departureAirline: 'TEST AIR',
      departureFlightNumber: 'TEST-002',
      departureTime: '6:00 PM',
    },
    role: 'guest',
    bio: 'This is a test traveler for testing pull-to-refresh',
  }
  return testTraveler
}

export function addTestData() {
  console.log('[testDataGenerator] Adding test event and traveler...')

  // Add test event
  const testEvent = generateTestEvent()
  const events = JSON.parse(localStorage.getItem('boston_events_local') || '[]') as Event[]
  events.push(testEvent)
  localStorage.setItem('boston_events_local', JSON.stringify(events))
  console.log('[testDataGenerator] ✓ Added test event:', testEvent)

  // Add test traveler
  const testTraveler = generateTestTraveler()
  const travelers = JSON.parse(localStorage.getItem('boston_travelers_local') || '[]') as Traveler[]
  travelers.push(testTraveler)
  localStorage.setItem('boston_travelers_local', JSON.stringify(travelers))
  console.log('[testDataGenerator] ✓ Added test traveler:', testTraveler)

  // Reload page to show new data
  console.log('[testDataGenerator] Reloading page in 1 second...')
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

// Expose to window for console access
declare global {
  interface Window {
    addTestData: typeof addTestData
  }
}
