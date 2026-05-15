/**
 * Firebase Cloud Function: Get Nearby Places
 * Proxies Google Places API nearby search calls to avoid CORS issues and keep API key server-side
 * 
 * Deploy with: firebase deploy --only functions
 */

const functions = require('firebase-functions')
const axios = require('axios')

/**
 * HTTP Cloud Function for getting nearby places
 * Called from client via fetch POST
 */
exports.getNearbyPlaces = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).send('')
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const GOOGLE_MAPS_API_KEY = functions.config().google.maps_api_key
    
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured')
    }

    const { lat, lng, type, radius = 800 } = req.body

    if (lat === undefined || lng === undefined || !type) {
      res.status(400).json({ 
        error: 'lat, lng, and type are required',
        results: []
      })
      return
    }

    // Validate type
    const validTypes = ['restaurant', 'bar', 'museum', 'tourist_attraction']
    if (!validTypes.includes(type)) {
      res.status(400).json({ 
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
        results: []
      })
      return
    }

    // Call Google Places API - Nearby Search
    const googleUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
    const params = {
      location: `${lat},${lng}`,
      radius: Math.min(radius, 50000), // Cap radius at 50km
      type,
      key: GOOGLE_MAPS_API_KEY,
    }

    const googleResponse = await axios.get(googleUrl, { params })

    if (googleResponse.data.status !== 'OK') {
      res.status(200).json({
        results: [],
        status: googleResponse.data.status,
        error: googleResponse.data.error_message || 'Unable to find nearby places',
      })
      return
    }

    // Transform results to client format
    const results = googleResponse.data.results.map((place) => ({
      id: place.place_id,
      name: place.name,
      type: type,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating,
      address: place.formatted_address || place.vicinity,
    }))

    res.status(200).json({
      results,
      status: 'OK',
    })
  } catch (error) {
    console.error('Error calling Google Places API:', error.message)
    res.status(500).json({
      results: [],
      status: 'ERROR',
      error: error.message || 'Internal server error',
    })
  }
})
