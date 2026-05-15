/**
 * Firebase Cloud Function: Get Directions
 * Proxies Google Directions API calls to avoid CORS issues and keep API key server-side
 * 
 * Deploy with: firebase deploy --only functions
 * 
 * Callable from client: 
 * const functions = require('firebase/functions')
 * const fn = httpsCallable(functions, 'getDirections')
 * const result = await fn({ origin, destination, mode })
 */

const functions = require('firebase-functions')
const axios = require('axios')

/**
 * HTTP Cloud Function for getting directions
 * Called from client via fetch POST
 */
exports.getDirections = functions.https.onRequest(async (req, res) => {
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

    const { origin, destination, mode = 'transit' } = req.body

    if (!origin || !destination) {
      res.status(400).json({ 
        error: 'origin and destination are required',
        status: 'INVALID_REQUEST'
      })
      return
    }

    // Validate mode
    const validModes = ['transit', 'driving', 'walking', 'bicycling']
    if (!validModes.includes(mode)) {
      res.status(400).json({ 
        error: `Invalid mode. Must be one of: ${validModes.join(', ')}`,
        status: 'INVALID_REQUEST'
      })
      return
    }

    // Call Google Directions API
    const googleUrl = 'https://maps.googleapis.com/maps/api/directions/json'
    const params = {
      origin,
      destination,
      mode,
      key: GOOGLE_MAPS_API_KEY,
      alternatives: true, // Return multiple routes when available
    }

    // Add transit preferences for transit mode
    if (mode === 'transit') {
      params.departure_time = 'now' // Get current transit options
    }

    const googleResponse = await axios.get(googleUrl, { params })

    // Check if Google API returned an error
    if (googleResponse.data.status !== 'OK') {
      res.status(400).json({
        routes: [],
        status: googleResponse.data.status,
        error: googleResponse.data.error_message || 'Unable to find directions',
      })
      return
    }

    // Return Google API response directly (compatible with Google Maps UI libraries)
    res.status(200).json({
      routes: googleResponse.data.routes,
      status: 'OK',
    })
  } catch (error) {
    console.error('Error calling Google Directions API:', error.message)
    res.status(500).json({
      routes: [],
      status: 'ERROR',
      error: error.message || 'Internal server error',
    })
  }
})

/**
 * Callable Cloud Function for getting directions (alternative pattern)
 * Useful if you want to use Firebase SDK on client instead of fetch
 */
exports.getDirectionsCallable = functions.https.onCall(async (data, context) => {
  try {
    const GOOGLE_MAPS_API_KEY = functions.config().google.maps_api_key
    
    if (!GOOGLE_MAPS_API_KEY) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Google Maps API key not configured'
      )
    }

    const { origin, destination, mode = 'transit' } = data

    if (!origin || !destination) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'origin and destination are required'
      )
    }

    const validModes = ['transit', 'driving', 'walking', 'bicycling']
    if (!validModes.includes(mode)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid mode. Must be one of: ${validModes.join(', ')}`
      )
    }

    // Call Google Directions API
    const googleUrl = 'https://maps.googleapis.com/maps/api/directions/json'
    const params = {
      origin,
      destination,
      mode,
      key: GOOGLE_MAPS_API_KEY,
      alternatives: true,
    }

    if (mode === 'transit') {
      params.departure_time = 'now'
    }

    const googleResponse = await axios.get(googleUrl, { params })

    if (googleResponse.data.status !== 'OK') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        googleResponse.data.error_message || 'Unable to find directions'
      )
    }

    // Return Google API response directly (compatible with Google Maps UI libraries)
    return {
      routes: googleResponse.data.routes,
      status: 'OK',
    }
  } catch (error) {
    console.error('Error getting directions:', error)
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to get directions'
    )
  }
})
