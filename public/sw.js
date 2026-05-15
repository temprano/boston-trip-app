// Service Worker for Boston Trip App PWA - Network First Strategy
const CACHE_NAME = 'boston-trip-app-v1'

console.log('[SW] Service Worker installing...')

// Skip waiting - activate immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Install event - calling skipWaiting()')
  self.skipWaiting()
})

// Claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event - calling clients.claim()')
  event.waitUntil(self.clients.claim())
})

// Fetch event - Network first strategy
self.addEventListener('fetch', (event) => {
  // Don't intercept JSON files or API requests - let them go straight to network
  const url = new URL(event.request.url)
  const isJSON = url.pathname.endsWith('.json')
  const isAPI = url.hostname.includes('googleapis.com') || url.hostname.includes('firebaseio.com')
  
  if (isJSON || isAPI) {
    console.log('[SW] Bypassing cache for:', url.pathname || url.hostname)
    return // Let default network handling continue
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        console.log('[SW] Network request succeeded:', event.request.url, 'status:', response.status)
        
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response
        }
        
        // Cache successful responses
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          console.log('[SW] Caching response:', event.request.url)
          cache.put(event.request, responseToCache)
        })
        return response
      })
      .catch((error) => {
        console.log('[SW] Network request failed:', event.request.url, error)
        
        // Fall back to cache only if network fails
        return caches.match(event.request).then((response) => {
          if (response) {
            console.log('[SW] Using cached response:', event.request.url)
            return response
          }
          console.log('[SW] No cache available for:', event.request.url)
          return new Response('Offline - content unavailable', { status: 503 })
        })
      })
  )
})
