const CACHE_NAME = "killerwhalesound-static-v1";
const ASSETS = [
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/css/site.css",
  "/js/site.js",
  "/images/cover.svg",
  "/background/index.html",
  "/background/style.css"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith("killerwhalesound-static-") &&
                           key !== CACHE_NAME)
            .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin)
    return;

  // No almacenar canciones: evitar uso inesperado de espacio.
  if (url.pathname.startsWith("/music/") ||
      /\.(mp3|wav|ogg|m4a|flac)$/i.test(url.pathname))
    return;

  // Para navegación, intentar red primero y usar página offline si falla.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () =>
        (await caches.match("/offline.html")) ||
        Response.error()
      )
    );
    return;
  }

  // Recursos estáticos: caché primero y actualización de caché en segundo plano.
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        const network = fetch(request).then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        });
        return cached || network;
      })
    );
  }
});