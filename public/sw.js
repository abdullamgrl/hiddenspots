// Cache version — bump on any change to this file. The activate handler
// deletes every non-matching cache, so bumping purges the previous
// (cache-first-everything) version that served stale HTML and stale
// cross-origin Supabase reads.
const CACHE_NAME = 'hiddenspot-cache-v2'
const OFFLINE_URL = '/offline'

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/favicon.ico',
  '/manifest.json'
]

// 1. Install: cache the offline shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  )
  self.skipWaiting()
})

// 2. Activate: drop stale caches (including the poisoned v1).
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache)
          }
        })
      )
    )
  )
  self.clients.claim()
})

// 3. Fetch: strategy split by request type.
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never touch non-GET or cross-origin requests. The old worker checked
  // for a "/api/" substring, but Supabase REST/auth/storage live on a
  // different ORIGIN (*.supabase.co) — an origin check is what actually
  // keeps live data out of the cache. Falling through = browser default.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Never cache Next.js RSC / prefetch payloads: they share a page's URL
  // (differing only by the RSC header / _rsc param) and caching them
  // corrupts client navigations.
  if (url.searchParams.has('_rsc') || request.headers.get('RSC') === '1') return

  // Navigations: network-first so a deploy is seen on the first reload,
  // not the second. Fall back to a cached copy of that page, then the
  // offline shell. Every branch must end in a real Response.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const copy = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return networkResponse
        })
        .catch(async () =>
          (await caches.match(request)) ||
          (await caches.match(OFFLINE_URL)) ||
          Response.error()
        )
    )
    return
  }

  // Hashed, immutable build assets: cache-first is correct and fast.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const hit = await cache.match(request)
        if (hit) return hit
        const networkResponse = await fetch(request)
        if (networkResponse.status === 200) {
          cache.put(request, networkResponse.clone())
        }
        return networkResponse
      })
    )
    return
  }

  // Other same-origin GETs (icons, manifest, brand images): cosmetic, so
  // stale-while-revalidate is fine.
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      const network = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone())
          }
          return networkResponse
        })
        .catch(() => cached || Response.error())
      return cached || network
    })
  )
})
