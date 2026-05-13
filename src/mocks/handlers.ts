import { http, HttpResponse } from 'msw'

export const handlers = [
  // OpenWeatherMap - Current Weather
  http.get('https://api.openweathermap.org/data/2.5/weather', ({ request }) => {
    const url = new URL(request.url)
    const lat = url.searchParams.get('lat')
    const lon = url.searchParams.get('lon')

    return HttpResponse.json({
      coord: { lon: parseFloat(lon || '0'), lat: parseFloat(lat || '0') },
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
      ],
      main: {
        temp: 72.5,
        feels_like: 71.2,
        temp_min: 68.0,
        temp_max: 76.0,
        pressure: 1013,
        humidity: 65,
      },
      visibility: 10000,
      wind: {
        speed: 5.5,
        deg: 230,
      },
      clouds: { all: 10 },
      dt: Math.floor(Date.now() / 1000),
      sys: {
        type: 2,
        id: 2019646,
        country: 'US',
        sunrise: Math.floor(Date.now() / 1000) - 3600,
        sunset: Math.floor(Date.now() / 1000) + 3600,
      },
      timezone: -18000,
      id: 4930956,
      name: 'Boston',
      cod: 200,
    })
  }),

  // OpenWeatherMap - 5 Day Forecast
  http.get('https://api.openweathermap.org/data/2.5/forecast', ({ request }) => {
    const url = new URL(request.url)
    const lat = url.searchParams.get('lat')
    const lon = url.searchParams.get('lon')

    // Generate forecast data for event dates (May 26-30)
    // In reality, OpenWeatherMap free API only supports 5-day forecasts
    // For testing, we create synthetic data for the trip dates
    const eventDates = [
      { date: new Date(2026, 4, 26), condition: 'Partly cloudy', icon: '02d', tempHigh: 76, tempLow: 62 },
      { date: new Date(2026, 4, 27), condition: 'Clear', icon: '01d', tempHigh: 75, tempLow: 61 },
      { date: new Date(2026, 4, 28), condition: 'Light rain', icon: '10d', tempHigh: 72, tempLow: 60 },
      { date: new Date(2026, 4, 29), condition: 'Cloudy', icon: '04d', tempHigh: 73, tempLow: 61 },
      { date: new Date(2026, 4, 30), condition: 'Clear', icon: '01d', tempHigh: 77, tempLow: 63 },
    ]

    // Create 8 forecast entries (3-hour intervals) for each event date
    const list = eventDates.flatMap((eventDay) => {
      const dayStart = eventDay.date.getTime() / 1000
      return Array.from({ length: 8 }, (_, i) => ({
        dt: Math.floor(dayStart + i * 3600),
        main: {
          temp: eventDay.tempLow + (eventDay.tempHigh - eventDay.tempLow) * Math.sin((i / 8) * Math.PI),
          feels_like: eventDay.tempLow + 2 + (eventDay.tempHigh - eventDay.tempLow) * Math.sin((i / 8) * Math.PI),
          temp_min: eventDay.tempLow,
          temp_max: eventDay.tempHigh,
          pressure: 1013 + Math.random() * 2,
          humidity: 60 + Math.random() * 20,
        },
        weather: [
          {
            id: 800,
            main: eventDay.condition,
            description: eventDay.condition.toLowerCase(),
            icon: eventDay.icon,
          },
        ],
        clouds: { all: eventDay.condition.includes('cloud') ? 50 : 20 },
        wind: { speed: 5 + Math.random() * 3, deg: 230 },
        visibility: 10000,
        pop: eventDay.condition.includes('rain') ? 0.4 : 0.1,
        sys: { pod: i < 4 ? 'd' : 'n' },
      }))
    })

    return HttpResponse.json({
      cod: '200',
      message: 0,
      cnt: list.length,
      list,
      city: {
        id: 4930956,
        name: 'Boston',
        coord: { lat: parseFloat(lat || '42.3601'), lon: parseFloat(lon || '-71.0589') },
        country: 'US',
        population: 692600,
        timezone: -18000,
        sunrise: Math.floor(Date.now() / 1000) - 3600,
        sunset: Math.floor(Date.now() / 1000) + 3600,
      },
    })
  }),

  // Google Maps Geocoding API - Mock fallback
  // Comment this out once real API is working
  http.get('https://maps.googleapis.com/maps/api/geocode/json', () => {
    return HttpResponse.json({
      results: [
        {
          address_components: [
            { long_name: 'Boston', short_name: 'Boston', types: ['locality'] },
            { long_name: 'Massachusetts', short_name: 'MA', types: ['administrative_area_level_1'] },
            { long_name: 'United States', short_name: 'US', types: ['country'] },
          ],
          formatted_address: 'Boston, MA, USA',
          geometry: {
            bounds: {
              northeast: { lat: 42.361, lng: -71.050 },
              southwest: { lat: 42.350, lng: -71.060 },
            },
            location: { lat: 42.3554, lng: -71.0555 },
            location_type: 'APPROXIMATE',
            viewport: {
              northeast: { lat: 42.365, lng: -71.045 },
              southwest: { lat: 42.346, lng: -71.065 },
            },
          },
          place_id: 'ChIJQeKYwMxw44kRrRpJJDsKdyI',
          types: ['point_of_interest', 'establishment'],
        },
      ],
      status: 'OK',
    })
  }),

  // Google Places API - Nearby Search
  // Mock handler to demonstrate nearby places filtering
  http.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')

    // Sample restaurants near Boston Tea Party Museum
    const placesByType: Record<string, Array<{ name: string; rating: number; lat: number; lng: number; vicinity: string }>> = {
      restaurant: [
        { name: 'Union Oyster House', rating: 4.6, lat: 42.361, lng: -71.057, vicinity: '41 Union St, Boston' },
        { name: 'The Barking Crab', rating: 4.5, lat: 42.355, lng: -71.051, vicinity: '88 Sleeper St, Boston' },
        { name: 'Neptune Oyster', rating: 4.7, lat: 42.363, lng: -71.053, vicinity: '63 Salem St, Boston' },
        { name: 'Abe & Louie\'s', rating: 4.6, lat: 42.351, lng: -71.068, vicinity: '60 Charles St, Boston' },
        { name: 'Eastern Standard', rating: 4.5, lat: 42.346, lng: -71.064, vicinity: '528 Commonwealth Ave, Boston' },
      ],
      bar: [
        { name: 'The Beehive', rating: 4.6, lat: 42.352, lng: -71.064, vicinity: '541 Tremont St, Boston' },
        { name: 'Top of the Hub', rating: 4.5, lat: 42.358, lng: -71.064, vicinity: '800 Boylston St, Boston' },
      ],
      museum: [
        { name: 'Museum of Fine Arts', rating: 4.6, lat: 42.339, lng: -71.099, vicinity: '465 Huntington Ave, Boston' },
        { name: 'New England Aquarium', rating: 4.5, lat: 42.369, lng: -71.038, vicinity: '1 Central Wharf, Boston' },
      ],
      tourist_attraction: [
        { name: 'Public Garden', rating: 4.6, lat: 42.353, lng: -71.071, vicinity: 'Boston, MA' },
        { name: 'Boston Common', rating: 4.5, lat: 42.357, lng: -71.064, vicinity: 'Boston, MA' },
      ],
    }

    const places = placesByType[type || 'restaurant'] || []

    return HttpResponse.json({
      html_attributions: [],
      results: places.map((place) => ({
        business_status: 'OPERATIONAL',
        geometry: { location: { lat: place.lat, lng: place.lng } },
        name: place.name,
        vicinity: place.vicinity,
        rating: place.rating,
        types: [type || 'restaurant'],
        place_id: `place_${place.name.replace(/\s+/g, '_')}`,
      })),
      status: 'OK',
    })
  }),

  // Google Directions API - Transit Routes
  http.get('https://maps.googleapis.com/maps/api/directions/json', () => {
    return HttpResponse.json({
      routes: [
        {
          summary: 'Red Line → Event',
          legs: [
            {
              distance: { text: '0.3 km', value: 300 },
              duration: { text: '5 mins', value: 300 },
              start_address: 'Downtown Boston',
              end_address: 'Downtown Crossing Station',
              arrival_time: { text: '2:30 PM' },
              departure_time: { text: '2:35 PM' },
              steps: [
                {
                  distance: { text: '0.3 km', value: 300 },
                  duration: { text: '5 mins', value: 300 },
                  travel_mode: 'WALKING',
                  html_instructions: 'Walk to Downtown Crossing Station',
                },
              ],
            },
            {
              distance: { text: '3.0 km', value: 3000 },
              duration: { text: '30 mins', value: 1800 },
              start_address: 'Downtown Crossing Station',
              end_address: 'Event Location',
              arrival_time: { text: '3:15 PM' },
              departure_time: { text: '2:45 PM' },
              steps: [
                {
                  distance: { text: '3.0 km', value: 3000 },
                  duration: { text: '30 mins', value: 1800 },
                  travel_mode: 'TRANSIT',
                  html_instructions: 'Take Red Line (Downtown Crossing → Alewife)',
                  transit_details: {
                    arrival_time: { text: '3:15 PM' },
                    departure_time: { text: '2:45 PM' },
                    line: {
                      name: 'Red Line',
                      short_name: 'Red Line',
                      vehicle: { type: 'SUBWAY' },
                    },
                    num_stops: 8,
                  },
                },
              ],
            },
            {
              distance: { text: '0.2 km', value: 200 },
              duration: { text: '5 mins', value: 300 },
              start_address: 'Station Exit',
              end_address: 'Event Location Entrance',
              arrival_time: { text: '3:20 PM' },
              departure_time: { text: '3:15 PM' },
              steps: [
                {
                  distance: { text: '0.2 km', value: 200 },
                  duration: { text: '5 mins', value: 300 },
                  travel_mode: 'WALKING',
                  html_instructions: 'Walk to venue entrance',
                },
              ],
            },
          ],
        },
      ],
      status: 'OK',
    })
  }),
]
