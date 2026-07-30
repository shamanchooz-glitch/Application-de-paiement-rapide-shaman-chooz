const CACHE_NAME = "shaman-paiement-v1";
const FICHIERS_A_CACHER = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./icon-32.png",
  "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FICHIERS_A_CACHER)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((noms) => Promise.all(noms.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  event.respondWith(
    caches.match(request).then((reponseCache) => {
      if (reponseCache) return reponseCache;
      return fetch(request)
        .then((reponseReseau) => {
          if (request.url.startsWith(self.location.origin)) {
            const clone = reponseReseau.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return reponseReseau;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
