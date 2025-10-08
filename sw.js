// Nombre de la caché (cambia el número cuando quieras forzar limpieza)
const CACHE_NAME = "pwa-cache-v2";

// Página de respaldo si no hay conexión
const OFFLINE_URL = "/offline.html";

// Archivos principales que se guardan para uso offline
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/style.css",
  "/script.js",
  "/offline.html"
];

// Instalación: guarda los assets básicos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activación: limpia cachés antiguas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: Network First (usa lo nuevo si hay conexión, caché si no)
self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then(response => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
        return response;
      })
      .catch(() =>
        caches.match(request).then(cached => {
          if (cached) return cached;
          if (request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
        })
      )
  );
});
