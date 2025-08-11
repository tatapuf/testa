const CACHE_NAME = 'tassin-map-cache-v1';
const ASSETS = [
  './map.html',
  './poi_data.json',
  './service-worker.js',
  // images
  './poi_images/bakery.jpg',
  './poi_images/clock.jpg',
  './poi_images/gallery.jpg',
  './poi_images/market.jpg',
  './poi_images/restaurant.jpg',
  './poi_images/train.jpg',
  './poi_images/wine_shop.jpg',
  // Leaflet assets (fetched from CDN; caches after first load)
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);
  // For carto tile, ignore dynamic {s} placeholder
  if (requestURL.hostname.includes('basemaps.cartocdn.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((resp) => {
          return (
            resp ||
            fetch(event.request).then((networkResp) => {
              cache.put(event.request, networkResp.clone());
              return networkResp;
            })
          );
        });
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return (
        resp ||
        fetch(event.request).then((networkResp) => {
          return networkResp;
        })
      );
    })
  );
});