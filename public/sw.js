const CACHE_NAME = 'indranext-v3'

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((name) => {
        if (name !== CACHE_NAME) return caches.delete(name)
      })),
    ),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return

  const url = new URL(event.request.url)
  const isAsset = url.pathname.match(/\.(js|css|ts|tsx|jsx|map|json)$/i)
  const isPage = url.pathname === '/' || url.pathname === '/index.html'

  if (isAsset) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
    return
  }

  if (isPage) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return res
        })
        .catch(() => caches.match(event.request).then((r) => r || new Response('', { status: 503 }))),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((r) => r || fetch(event.request)),
  )
})
