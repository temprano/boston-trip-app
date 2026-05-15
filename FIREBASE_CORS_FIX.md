# Google Maps API CORS Fix - Firebase Functions Proxy

## Overview
Changed the Google Maps API integration to route all API calls through Firebase Cloud Functions, eliminating CORS issues and keeping the API key server-side.

## Changes Made

### 1. New Firebase Cloud Functions

#### `functions/geocodeAddress.js`
- Proxies Google Geocoding API calls
- Converts address strings to latitude/longitude coordinates
- Keeps API key server-side
- Enables CORS for client requests

#### `functions/getPlaces.js`
- Proxies Google Places API nearby search calls
- Searches for places by type (restaurant, bar, museum, tourist_attraction)
- Returns formatted place data with rating, location, and address
- Includes built-in validation and error handling

#### `functions/index.js`
- Entry point that exports all cloud functions
- Ensures all functions are properly discovered by Firebase

### 2. Updated Services

#### `src/services/googlePlacesService.ts`
- **geocodeAddress()**: Now calls Firebase function instead of direct Google API
- **getNearbyPlaces()**: Now calls Firebase function for place searches
- **getNearbyPlacesByTypes()**: Batch calls now use Firebase functions
- Removed client-side API key usage
- Improved error handling with fallback demo data

#### `src/services/mapsService.ts`
- **getNearbyPlaces()**: Updated to use Firebase function proxy
- Added `FIREBASE_PLACES_URL` constant
- Removed direct Google API calls from client
- Maintained backward-compatible interface

#### `functions/package.json`
- Updated main entry point to `index.js`

## Architecture

### Before (CORS Issues)
```
Client Browser
     ↓
Direct Google Maps API (CORS failure)
```

### After (No CORS)
```
Client Browser
     ↓
Firebase Cloud Function (handles CORS)
     ↓
Google Maps API (server-to-server, API key secure)
```

## Benefits

1. **No CORS Issues**: All API calls go through server-side functions
2. **Secure API Key**: Google Maps API key never exposed to client
3. **Consistent Pattern**: All Google APIs now use the same proxy pattern
4. **Better Error Handling**: Firebase functions provide better error messages
5. **Scalability**: Functions can be cached and optimized independently

## Firebase Configuration

### Required Environment Variables
In Firebase Cloud Functions settings (via `firebase deploy`), ensure this is configured:
```
google.maps_api_key=YOUR_GOOGLE_MAPS_API_KEY
```

### Available Functions

1. **geocodeAddress**
   - POST request
   - Body: `{ address: string }`
   - Returns: `{ lat: number, lng: number, status: string, address?: string }`

2. **getNearbyPlaces**
   - POST request
   - Body: `{ lat: number, lng: number, type: string, radius?: number }`
   - Returns: `{ results: GooglePlace[], status: string }`

3. **getDirections** (existing)
   - POST request
   - Body: `{ origin: string, destination: string, mode?: string }`
   - Returns: `{ routes: any[], status: string }`

## Deployment

To deploy the updated functions:

```bash
firebase deploy --only functions
```

This will deploy all three Cloud Functions:
- geocodeAddress
- getNearbyPlaces
- getDirections

## Testing

The services now handle API failures gracefully:
- `googlePlacesService` returns fallback demo data if API calls fail
- Error messages are logged for debugging
- Components continue to work with partial data

## Component Impact

Components using the updated services:
- `GoogleMapComponent`: Uses geocodeAddress and getNearbyPlacesByTypes
- `NearbyPlacesWidget`: Uses mapsService.getNearbyPlaces
- `DirectionsWidget`: Already uses mapsService.getDirections (now fully integrated)

All components continue to work with the same API, but CORS issues are now eliminated.
