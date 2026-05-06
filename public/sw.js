// Origin Myth Map — Service Worker
// Strategy: cache-first for GeoJSON files (stable, frequently re-requested on era changes);
//           network-first for everything else.

const CACHE = 'omm-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const { request } = e
  // Only handle GET requests
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Cache-first for GeoJSON: serve instantly from cache; populate cache on first fetch
  if (url.pathname.startsWith('/geojson/')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(request).then(hit => {
          if (hit) return hit
          return fetch(request).then(resp => {
            if (resp.ok) cache.put(request, resp.clone())
            return resp
          })
        })
      )
    )
    return
  }

  // Network-first for JS/CSS/HTML: always get latest, fall back to cache when offline
  e.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
