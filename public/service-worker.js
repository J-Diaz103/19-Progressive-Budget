const STATIC_CACHE = "static-cache-v3";
const RUNTIME_CACHE = "data-cache-v3";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/styles.css",
  "/manifest.json",
  "/db.js",
];

// install event
self.addEventListener("install", (event) => {
  // precache transaction data
  event.waitUntil(
    caches.open(RUNTIME_CACHE).then((cache) => cache.add("/api/transaction"))
  );

  //prechache static data
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  //Ativates service-workers immideiatly
  self.skipWaiting();
});

// Activates the event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
            console.log("Clearing cache data", key);
            //returs cleared caches
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  console.log(event);
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/transaction")) {
    console.log("[Service Worker] Fetch (data)", event.request.url);

    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })
          .catch((err) => {
            // If no network retrieve from cache
            return cache.match(event.request);
          });
      })
    );

    return;
  }

  //cache static files
  event.respondWith(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request);
        });
      })
      .catch((err) => console.log(err))
  );
});
