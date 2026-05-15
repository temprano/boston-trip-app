/**
 * Firebase Cloud Function: Geocode Address
 * Proxies Google Geocoding API calls to avoid CORS issues and keep API key server-side
 * 
 * Deploy with: firebase deploy --only functions
 */

const functions = require('firebase-functions')
const axios = require('axios')

/**
 * HTTP Cloud Function for geocoding addresses
 * Called from client via fetch POST
 */
exports.geocodeAddress = functions.https.onRequest(async (req, res) => {
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

    const { address } = req.body

    if (!address || typeof address !== 'string') {
      res.status(400).json({ 
        error: 'address is required and must be a string',
        lat: null,
        lng: null,
      })
      return
    }

    // Improve address format for better geocoding results
    let formattedAddress = address
    
    // Convert all-caps city names to proper case
    const addressParts = address.split(',')
    if (addressParts.length >= 2) {
      // Capitalize city and state properly
      formattedAddress = addressParts
        .map((part, i) => {
          const trimmed = part.trim()
          if (i === 0) return trimmed // Keep street as-is
          // Capitalize first letter, format rest in lowercase
          return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
        })
        .join(', ')
    }

    // Call Google Geocoding API
    const googleUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
    const params = {
      address: formattedAddress,
      components: 'country:US',
      key: GOOGLE_MAPS_API_KEY,
    }

    const googleResponse = await axios.get(googleUrl, { params })

    if (!googleResponse.data.results || googleResponse.data.results.length === 0) {
      res.status(200).json({
        lat: null,
        lng: null,
        status: 'ZERO_RESULTS',
        error: 'Address not found',
      })
      return
    }

    const location = googleResponse.data.results[0].geometry.location

    res.status(200).json({
      lat: location.lat,
      lng: location.lng,
      status: 'OK',
      address: googleResponse.data.results[0].formatted_address,
    })
  } catch (error) {
    console.error('Error calling Google Geocoding API:', error.message)
    res.status(500).json({
      lat: null,
      lng: null,
      status: 'ERROR',
      error: error.message || 'Internal server error',
    })
  }
})
