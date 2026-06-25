const CACHE_NAME = 'hiddenspot-cache-v1'
const OFFLINE_URL = '/offline'

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/favicon.ico',
  '/manifest.json'
]

// 1. Install Event: Cache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

// 2. Activate Event: Cleanup stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// 3. Fetch Event: Stale-While-Revalidate caching strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip Supabase API/Auth routes
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('/auth/')
  ) {
    return
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Cache successful HTML/assets
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone())
            }
            return networkResponse
          })
          .catch(() => {
            // Serve offline fallback page for document navigation failures
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
            }
            return null
          })

        return cachedResponse || fetchPromise
      })
    })
  )
})
