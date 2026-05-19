// ─────────────────────────────────────────────
//  FormPorn Service Worker
//  Strategy: Network-first for HTML, cache-first for static assets
//  Bump CACHE_VERSION when deploying breaking changes
// ─────────────────────────────────────────────

const CACHE_VERSION = 'formporn-v3';
const STATIC_ASSETS = [
  '/manifest.json'
];

// HTML files — never cache, always network
const HTML_PATTERN = /\.html($|\?)/;
const INDEX_PATTERN = /\/(#.*)?$/;

// ── Install ──────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(STATIC_ASSETS))
  );
  // Activate immediately — don't wait for old SW to die
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET and cross-origin requests
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  const isHTML = HTML_PATTERN.test(url.pathname) || INDEX_PATTERN.test(url.pathname);

  if (isHTML) {
    // HTML → Network first, no cache fallback (always fresh)
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => {
          // Only fall back to cache if completely offline
          return caches.match(e.request);
        })
    );
  } else {
    // Static assets → Cache first, update in background
    e.respondWith(
      caches.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
          }
          return response;
        });
        return cached || networkFetch;
      })
    );
  }
});
