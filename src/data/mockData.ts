import { Itinerary, Day, Activity, Traveler, Location } from '../types'

// Mock locations
const bostonLocations: Record<string, Location> = {
  faneuil: {
    lat: 42.3604,
    lng: -71.0589,
    name: 'Faneuil Hall Marketplace',
    address: '100 Hanover St, Boston, MA 02109',
  },
  newbury: {
    lat: 42.3555,
    lng: -71.0755,
    name: 'Newbury Street',
    address: 'Newbury St, Boston, MA',
  },
  prudential: {
    lat: 42.3466,
    lng: -71.0801,
    name: 'Prudential Center',
    address: '800 Boylston St, Boston, MA 02199',
  },
  museum: {
    lat: 42.3378,
    lng: -71.0939,
    name: 'Museum of Fine Arts',
    address: '465 Huntington Ave, Boston, MA 02115',
  },
  north_end: {
    lat: 42.3646,
    lng: -71.0545,
    name: 'North End',
    address: 'North End, Boston, MA',
  },
  commons: {
    lat: 42.3549,
    lng: -71.0727,
    name: 'Boston Common',
    address: 'Boston Common, Boston, MA 02108',
  },
}

// Mock activities
const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Breakfast at Union Oyster House',
    description: 'Historic oyster bar - America\'s oldest continuously operating restaurant',
    time: '08:00',
    duration: 60,
    location: bostonLocations.faneuil,
    category: 'food',
    notes: 'Make reservation in advance',
  },
  {
    id: '2',
    title: 'Faneuil Hall & Marketplace',
    description: 'Historic marketplace with shops, restaurants, and street performers',
    time: '10:00',
    duration: 120,
    location: bostonLocations.faneuil,
    category: 'sightseeing',
  },
  {
    id: '3',
    title: 'Walk the Freedom Trail',
    description: 'Iconic 2.5 mile red-brick trail through historic Boston',
    time: '12:30',
    duration: 180,
    location: bostonLocations.commons,
    category: 'sightseeing',
    notes: 'Wear comfortable shoes',
  },
  {
    id: '4',
    title: 'Lunch at Neptune Oyster',
    description: 'Fresh seafood in the historic North End',
    time: '15:30',
    duration: 60,
    location: bostonLocations.north_end,
    category: 'food',
    notes: 'No reservations - expect a wait',
  },
  {
    id: '5',
    title: 'Shopping at Newbury Street',
    description: 'Upscale shopping district with boutiques and galleries',
    time: '17:00',
    duration: 120,
    location: bostonLocations.newbury,
    category: 'entertainment',
  },
  {
    id: '6',
    title: 'Dinner at Oleana',
    description: 'Mediterranean cuisine with city views',
    time: '19:30',
    duration: 90,
    location: bostonLocations.prudential,
    category: 'food',
    notes: 'Reservation highly recommended',
  },
]

// Mock days
const mockDays: Day[] = [
  {
    id: 'day-1',
    date: '05/14/2026',
    dayOfWeek: 'Wednesday',
    activities: mockActivities.slice(0, 3),
    notes: 'First day - explore downtown and Freedom Trail',
  },
  {
    id: 'day-2',
    date: '05/15/2026',
    dayOfWeek: 'Thursday',
    activities: mockActivities.slice(3, 6),
    notes: 'Second day - North End and shopping',
  },
]

// Mock travelers
export const mockTravelers: Traveler[] = [
  {
    id: '1',
    name: 'Jeff Svehla',
    avatar: '/img/Jeff_thumbnail.png',
    contact: {
      email: '',
      phone: '(402) 910-5996',
    },
    flightInfo: {
      arrivalAirline: 'American Airlines',
      arrivalFlightNumber: 'AA123',
      arrivalTime: '2:00pm',
      departureAirline: 'American Airlines',
      departureFlightNumber: 'AA564',
      departureTime: '11:00am',
    },
  },
  {
    id: '2',
    name: 'Deb Svehla',
    avatar: '/img/Deb_thumbnail.png',
    contact: {
      email: '',
      phone: '(402) 910-8202',
    },
    flightInfo: {
      arrivalAirline: 'American Airlines',
      arrivalFlightNumber: 'AA123',
      arrivalTime: '2:00pm',
      departureAirline: 'American Airlines',
      departureFlightNumber: 'AA564',
      departureTime: '11:00am',
    },
  },
  {
    id: '3',
    name: 'Darrin Pecka',
    avatar: '/img/Darrin_thumbnail.png',
    contact: {
      email: '',
      phone: '(402) 555-5555',
    },
    flightInfo: {
      arrivalAirline: 'American Airlines',
      arrivalFlightNumber: 'AA123',
      arrivalTime: '2:00pm',
      departureAirline: 'American Airlines',
      departureFlightNumber: 'AA564',
      departureTime: '11:00am',
    },
  },
]

// Mock itinerary
export const mockItinerary: Itinerary = {
  id: 'itin-1',
  title: 'Boston Adventure 2026',
  description: 'A 2-day exploration of historic Boston with friends',
  startDate: '05/14/2026',
  endDate: '05/15/2026',
  days: mockDays,
  createdAt: new Date('2026-05-10'),
  updatedAt: new Date('2026-05-14'),
}
