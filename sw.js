// sw.js - Basic Service Worker

const CACHE_NAME = 'treinos-cache-v1';
const urlsToCache = [
  '/', // Alias for index.html
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/treino_a.html',
  '/treino_b.html',
  '/treino_c.html',
  '/treino_d.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Montserrat:wght@400;500&display=swap' // Cache Google Fonts if possible
];

// Install event: Cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all URLs to the cache
        // Using addAll which fetches and caches in one step
        // Important: If any request fails, the entire operation fails.
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' }))); // Force reload to bypass browser cache
      })
      .catch(error => {
        console.error('Failed to cache resources during install:', error);
        // Optionally, handle the error, e.g., skip caching problematic resources
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the service worker takes control of the page immediately
  return self.clients.claim();
});

// Fetch event: Serve cached assets or fetch from network
self.addEventListener('fetch', event => {
  // For Google Fonts, use a CacheFirst strategy but update in the background (StaleWhileRevalidate)
  if (event.request.url.startsWith('https://fonts.googleapis.com') || event.request.url.startsWith('https://fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          // Return cached response immediately if available, otherwise wait for fetch
          return response || fetchPromise;
        });
      })
    );
    return; // Don't execute the code below for Google Fonts
  }

  // For other requests, use a CacheFirst strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              // Don't cache invalid responses (like from Chrome extensions)
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetching failed:', error);
          // Optional: Return a fallback page/resource if fetch fails
          // For example, return an offline page:
          // return caches.match('/offline.html');
          throw error;
        });
      })
  );
});

