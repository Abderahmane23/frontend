/* =====================
   CACHE CONFIG
===================== */
const VERSION = 'v3'; // Updated for pagination support

const APP_CACHE = `auto-parts-app-${VERSION}`;
const IMAGE_CACHE = `auto-parts-images-${VERSION}`;
const API_CACHE = `auto-parts-api-${VERSION}`;

const DEBUG = true;

/* =====================
   INSTALL
===================== */
self.addEventListener('install', (event) => {
  if (DEBUG) console.log('[SW] 📦 Install');
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) =>
      cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ])
    )
  );
});

/* =====================
   ACTIVATE
===================== */
self.addEventListener('activate', (event) => {
  if (DEBUG) console.log('[SW] 🚀 Activate');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) =>
            ![APP_CACHE, IMAGE_CACHE, API_CACHE].includes(key)
          )
          .map((key) => {
            if (DEBUG) console.log('[SW] 🧹 Delete old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

/* =====================
   FETCH
===================== */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip unsupported schemes (chrome-extension, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // IMPORTANT: Skip ALL cross-origin requests
  // Let browser handle Beam Cloud images directly (no service worker interference)
  if (url.origin !== self.location.origin) {
    if (DEBUG) console.log('[SW] ⏭️ Skipping cross-origin:', url.origin);
    return; // Browser will fetch directly, no caching, no blocking
  }

  /* =====================
     🖼️ IMAGES – NETWORK FIRST WITH BACKGROUND CACHE
     For same-origin images only (Vercel-hosted assets)
  ===================== */
  if (
    request.destination === 'image' ||
    url.pathname.startsWith('/images/')
  ) {
    event.respondWith(
      (async () => {
        try {
          if (DEBUG) console.log('[SW] 🌐 Fetch image (network first):', request.url);
          
          // Fetch from network (fast, no cache lookup delay)
          const response = await fetch(request);

          if (response.ok) {
            // Cache in background WITHOUT blocking the response
            const responseToCache = response.clone();
            caches.open(IMAGE_CACHE).then(cache => {
              cache.put(request, responseToCache);
              if (DEBUG) console.log('[SW] ✅ Cached in background:', request.url);
            });
            
            return response; // Return immediately
          }

          throw new Error('Image fetch failed');
        } catch (err) {
          // Only use cache as fallback when offline
          if (DEBUG) console.log('[SW] 📦 Network failed, trying cache');
          const cached = await caches.match(request);
          
          if (cached) {
            if (DEBUG) console.log('[SW] 🖼️ Cache hit (offline):', request.url);
            return cached;
          }

          // Last resort: fallback SVG
          if (DEBUG) console.warn('[SW] ⚠️ Image offline fallback', err);
          return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
              <rect width="300" height="300" fill="#f1f3f5"/>
              <text x="150" y="150" text-anchor="middle"
                font-size="14" fill="#868e96">
                Image indisponible
              </text>
            </svg>`,
            {
              headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'no-store'
              }
            }
          );
        }
      })()
    );
    return;
  }

  /* =====================
     🔌 API – NETWORK FIRST
  ===================== */
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          
          if (response.ok) {
            // CRITICAL FIX: Clone immediately before any async operation
            const responseToCache = response.clone();
            
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          
          return response;
        } catch (error) {
          if (DEBUG) console.log('[SW] 📦 API fallback cache');
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({
            success: false,
            offline: true,
            message: 'API indisponible (offline)'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
          });
        }
      })()
    );
    return;
  }

  /* =====================
     🧱 APP SHELL – CACHE FIRST
  ===================== */
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request);
    })
  );
});
