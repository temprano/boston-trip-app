// Transit service - uses Google Directions API for public transit routing
// Assumption: User starts from a central Boston location (downtown)

interface TransitLeg {
  mode: string // 'TRANSIT', 'WALKING', 'DRIVING'
  startAddress: string
  endAddress: string
  startTime: string
  endTime: string
  duration: number // in minutes
  distance: number // in meters
  instructions?: string
  transitDetails?: {
    lineName: string // e.g., "Red Line", "Route 1"
    transitType: string // "BUS", "SUBWAY", "TRAIN", "TRAM", "RAIL"
    departure: string
    arrival: string
    stops: number
  }
}

interface TransitRoute {
  summary: string
  legs: TransitLeg[]
  totalDuration: number // in minutes
  totalDistance: number // in meters
  warning?: string
}

// Boston transit starting point (Downtown Boston)
const BOSTON_START = { lat: 42.3554, lng: -71.0555 }

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo-key'

export const transitService = {
  /**
   * Get public transit directions to an event location
   */
  async getTransitDirections(
    eventLat: number,
    eventLng: number,
    eventTime?: string
  ): Promise<TransitRoute> {
    try {
      const departureTime = eventTime ? this.parseEventTime(eventTime) : Math.floor(Date.now() / 1000)

      const url = new URL('https://maps.googleapis.com/maps/api/directions/json')
      url.searchParams.set('origin', `${BOSTON_START.lat},${BOSTON_START.lng}`)
      url.searchParams.set('destination', `${eventLat},${eventLng}`)
      url.searchParams.set('mode', 'transit')
      url.searchParams.set('departure_time', departureTime.toString())
      url.searchParams.set('key', GOOGLE_API_KEY)
      url.searchParams.set('alternatives', 'true')

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Directions API error: ${response.statusText}`)
      }

      const data = (await response.json()) as any

      if (data.status !== 'OK') {
        return this.getFallbackTransitRoute()
      }

      // Process the first route
      const route = data.routes[0]
      if (!route) {
        return this.getFallbackTransitRoute()
      }

      const legs: TransitLeg[] = route.legs.map((leg: any) => {
        const transitDetails = leg.steps
          ?.filter((step: any) => step.travel_mode === 'TRANSIT')
          .map((step: any) => ({
            lineName: step.transit_details?.line?.short_name || step.transit_details?.line?.name || 'Transit',
            transitType: step.transit_details?.line?.vehicle?.type || 'BUS',
            departure: step.transit_details?.departure_time?.text || '',
            arrival: step.transit_details?.arrival_time?.text || '',
            stops: step.transit_details?.num_stops || 0,
          }))

        return {
          mode: leg.steps?.[0]?.travel_mode || 'TRANSIT',
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          startTime: leg.arrival_time?.text || '',
          endTime: leg.departure_time?.text || '',
          duration: Math.round(leg.duration.value / 60), // convert to minutes
          distance: leg.distance.value,
          instructions: leg.steps
            ?.map((step: any) => `${step.html_instructions}`)
            .join(' → '),
          transitDetails: transitDetails?.[0],
        }
      })

      return {
        summary: route.summary || 'Public Transit Route',
        legs,
        totalDuration: Math.round(route.legs.reduce((sum: number, leg: any) => sum + leg.duration.value, 0) / 60),
        totalDistance: route.legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0),
      }
    } catch (error) {
      console.error('Error fetching transit directions:', error)
      return this.getFallbackTransitRoute()
    }
  },

  /**
   * Fallback/demo transit route data
   */
  getFallbackTransitRoute(): TransitRoute {
    return {
      summary: 'Downtown Boston → Event Location',
      legs: [
        {
          mode: 'WALKING',
          startAddress: 'Downtown Boston',
          endAddress: 'Downtown Crossing Station',
          startTime: '2:30 PM',
          endTime: '2:35 PM',
          duration: 5,
          distance: 300,
          instructions: 'Walk to Downtown Crossing Station',
        },
        {
          mode: 'TRANSIT',
          startAddress: 'Downtown Crossing Station',
          endAddress: 'Event Location',
          startTime: '2:45 PM',
          endTime: '3:15 PM',
          duration: 30,
          distance: 3000,
          transitDetails: {
            lineName: 'Red Line',
            transitType: 'SUBWAY',
            departure: '2:45 PM',
            arrival: '3:15 PM',
            stops: 8,
          },
          instructions: 'Take Red Line (Downtown Crossing → Alewife) 8 stops',
        },
        {
          mode: 'WALKING',
          startAddress: 'Station Exit',
          endAddress: 'Event Location',
          startTime: '3:15 PM',
          endTime: '3:20 PM',
          duration: 5,
          distance: 200,
          instructions: 'Walk to venue entrance',
        },
      ],
      totalDuration: 40,
      totalDistance: 3500,
      warning: 'Demo data - actual transit times may vary',
    }
  },

  /**
   * Parse event time string to Unix timestamp
   */
  parseEventTime(timeStr: string): number {
    // timeStr format: "3:00 pm" or "11:00 am"
    const [time, period] = timeStr.toLowerCase().split(' ')
    const [hours, minutes] = time.split(':').map(Number)

    let hour24 = hours
    if (period === 'pm' && hours !== 12) {
      hour24 += 12
    } else if (period === 'am' && hours === 12) {
      hour24 = 0
    }

    // Create time for today (in actual app, use event date)
    const now = new Date()
    const eventDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour24, minutes, 0)

    return Math.floor(eventDateTime.getTime() / 1000)
  },

  /**
   * Get transit type icon/emoji
   */
  getTransitIcon(type: string): string {
    const icons: Record<string, string> = {
      SUBWAY: '🚇',
      BUS: '🚌',
      TRAIN: '🚂',
      TRAM: '🚊',
      RAIL: '🚆',
      WALKING: '🚶',
      DRIVING: '🚗',
    }
    return icons[type] || '🚌'
  },
}
