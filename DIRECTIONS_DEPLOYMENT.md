# Deploying the Directions API Firebase Cloud Function

## Overview
The Directions feature requires a Firebase Cloud Function to proxy Google Directions API calls. This keeps your API key server-side and avoids CORS issues.

## Prerequisites
- Firebase project set up (you already have: boston-travel-app-2dcff)
- Firebase CLI installed: `npm install -g firebase-tools`
- Google Directions API enabled in your Google Cloud Console
- Google Maps API key with Directions API enabled

## Step 1: Set Up Firebase Functions

```bash
cd d:\TempranoProjects\boston
firebase init functions
```

When prompted:
- Select "TypeScript" or "JavaScript" (TypeScript recommended)
- Choose the existing Firebase project: `boston-travel-app-2dcff`
- Accept default location for functions

## Step 2: Install Dependencies

```bash
cd functions
npm install axios
npm install --save-dev @types/node
```

## Step 3: Add the Directions Function

The function file has already been created at `functions/getDirections.js`. You need to update `functions/index.js` to export it:

```bash
# Edit functions/index.js
```

Replace or update `functions/index.js` to include:

```javascript
// Import the directions function
const { getDirections, getDirectionsCallable } = require('./getDirections')

// Export functions
exports.getDirections = getDirections
exports.getDirectionsCallable = getDirectionsCallable
```

## Step 4: Configure Environment Variables

Firebase Cloud Functions need your Google Maps API key. Set it up:

```bash
# Create/update .env.local in project root
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE

# Or set via Firebase config
firebase functions:config:set google.maps_api_key="YOUR_API_KEY_HERE"
```

To get your API key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: "Boston Travel App"
3. Go to APIs & Services > Credentials
4. Create new API Key
5. Enable "Directions API" for this key
6. Restrict key to HTTP referrers: `localhost:5173`, `*.firebaseapp.com`

## Step 5: Update Environment Variable in Function

Update `functions/getDirections.js` to read from environment:

```javascript
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.google?.maps_api_key

if (!GOOGLE_MAPS_API_KEY) {
  console.error('GOOGLE_MAPS_API_KEY environment variable is not set')
}
```

## Step 6: Deploy to Firebase

```bash
# From project root (d:\TempranoProjects\boston)
firebase deploy --only functions

# Or just the directions function:
firebase deploy --only functions:getDirections
```

You'll see output like:
```
✔ functions: Deploying functions and triggers...
✔ functions[getDirections]: Successful create operation.
Function URL (getDirections): https://us-central1-boston-travel-app-2dcff.cloudfunctions.net/getDirections
```

Copy the function URL - this is already configured in `directionsService.ts`

## Step 7: Test the Function

```bash
# Test with curl
curl -X POST https://us-central1-boston-travel-app-2dcff.cloudfunctions.net/getDirections \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "42.3601,-71.0589",
    "destination": "306 Congress Street, Boston MA 02210",
    "mode": "transit"
  }'
```

Expected response:
```json
{
  "routes": [
    {
      "summary": "Route summary",
      "distance": { "text": "1.2 km", "value": 1200 },
      "duration": { "text": "5 mins", "value": 300 },
      "steps": [...]
    }
  ],
  "status": "OK"
}
```

## Step 8: Test in App

1. In Settings page, set a base address (e.g., "42 Newbury Street, Boston MA")
2. Go back to Home
3. Click the compass emoji (🧭) button on an event
4. Wait for directions to load
5. View the step-by-step directions in the modal

## Step 9: Enable CORS for Production

If deploying to production (not localhost), update CORS in the function:

```javascript
res.set('Access-Control-Allow-Origin', 'https://yourdomain.com')
```

Or allow all (not recommended for production):
```javascript
res.set('Access-Control-Allow-Origin', '*')
```

## Troubleshooting

### "Failed to fetch from Firebase Function"
- Check function is deployed: `firebase list functions`
- Verify API key is set correctly
- Check browser console for exact error

### "Firebase function returned 403 Forbidden"
- API key permissions issue
- Check API key is enabled in Google Cloud Console
- Verify key has Directions API enabled

### "Cannot find module 'axios'"
- Run `npm install axios` in functions directory
- Re-deploy with `firebase deploy --only functions`

### "CORS errors"
- Check browser console for origin
- Update `Access-Control-Allow-Origin` in function
- Clear browser cache and retry

## Local Development (Optional)

To test Firebase Functions locally before deploying:

```bash
# Start Firebase emulator
firebase emulators:start

# Your functions will run at:
# http://localhost:5001/boston-travel-app-2dcff/us-central1/getDirections

# Update directionsService.ts temporarily to use localhost:
# const firebaseUrl = `http://localhost:5001/boston-travel-app-2dcff/us-central1/getDirections`
```

## Production Deployment

When ready for production:

1. Enable Firebase Hosting: `firebase hosting:sites:create your-site-name`
2. Deploy everything: `firebase deploy`
3. Update `directionsService.ts` with production URL if different
4. Test thoroughly with real Google Directions API

## Security Best Practices

1. **Keep API key server-side** - Your Cloud Function handles the key
2. **Restrict API key** in Google Cloud Console:
   - Application restrictions: HTTP referrers only
   - API restrictions: Directions API only
   - No unrestricted API keys

3. **Rate limit** (optional) - Add to function:
```javascript
// Use simple in-memory rate limiting
const requestCounts = {}
const RATE_LIMIT = 10 // requests per minute per IP

const ip = req.ip
const now = Date.now()
if (!requestCounts[ip]) requestCounts[ip] = []

// Clean old requests
requestCounts[ip] = requestCounts[ip].filter(t => now - t < 60000)

if (requestCounts[ip].length >= RATE_LIMIT) {
  return res.status(429).json({ error: 'Rate limit exceeded' })
}
requestCounts[ip].push(now)
```

4. **Monitor usage** in Google Cloud Console:
   - APIs & Services > Credentials
   - View API usage and quotas
   - Set up billing alerts

## Next Steps

Once the function is deployed and working:
- ✅ Directions feature fully functional
- Users can get transit/walking/driving directions from their base address
- No infinite loops - proper error handling
- All directions are calculated server-side for reliability

Questions? Check Firebase documentation:
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Google Directions API](https://developers.google.com/maps/documentation/directions)
