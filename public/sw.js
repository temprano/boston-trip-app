// Service Worker for Boston Trip App PWA - Network First Strategy
//
// IMPORTANT: This cache version must change on every deploy so that
// the browser detects a changed SW file and triggers the update flow.
//
// Option A (manual): bump the date/version string below before each commit.
// Option B (automated): replace the placeholder at build time via vite.config.ts
//   using the `define` option:
//     define: { __SW_CACHE_VERSION__: JSON.stringify(Date.now().toString()) }
//   Then reference it here as: const CACHE_NAME = `boston-trip-app-${__SW_CACHE_VERSION__}`
//
// For now, update this string before every deploy:
const CACHE_NAME = 'boston-trip-app-2025-05-15-001'

console.log('[SW] Service Worker loading, cache:', CACHE_NAME)

// ── Install ───────────────────────────────────────────────────────────────────
// skipWaiting() makes the new SW activate immediately instead of waiting for
// all tabs running the old SW to be closed.
self.addEventListener('install', (event) => {
  console.log('[SW] Install event - calling skipWaiting()')
  self.skipWaiting()
})

// ── Activate ──────────────────────────────────────────────────────────────────
// Delete ALL old caches (any cache whose name doesn't match CACHE_NAME).
// This is the key step that actually delivers new assets — without it, the old
// cached index.html keeps loading old JS/CSS bundles even after SW update.
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const deletions = cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
        return Promise.all(deletions)
      })
      .then(() => {
        console.log('[SW] Old caches cleared, claiming clients')
        return self.clients.claim()
      })
  )
})

// ── Message handler ───────────────────────────────────────────────────────────
// Receives SKIP_WAITING from main.tsx registration.update() flow so that a
// newly installed SW activates immediately without needing a page close/reopen.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message')
    self.skipWaiting()
  }
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
// Network-first strategy: always try the network, fall back to cache only when
// the network is completely unavailable (offline). This ensures users always
// get the latest content when online.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Pass-through: JSON data files and external APIs go straight to network,
  // no SW involvement at all.
  const isJSON = url.pathname.endsWith('.json')
  const isAPI =
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseio.com')

  if (isJSON || isAPI) {
    return // default browser fetch handles it
  }

  // Pass-through: non-GET requests (POST, etc.) are never cached.
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    fetch(event.request, {
      // Bypass the HTTP cache for navigation requests so index.html is always
      // fresh from Vercel, preventing the stale-HTML/new-JS mismatch.
      cache: event.request.mode === 'navigate' ? 'no-store' : 'default',
    })
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response
        }

        // Cache a clone of the successful response for offline fallback.
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // Network failed (offline) — serve from cache if available.
        return caches.match(event.request).then((cached) => {
          if (cached) {
            console.log('[SW] Offline - serving from cache:', event.request.url)
            return cached
          }
          console.log('[SW] Offline - no cache for:', event.request.url)
          return new Response('Offline - content unavailable', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          })
        })
      })
  )
})