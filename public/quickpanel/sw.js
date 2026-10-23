const CACHE_NAME = "yorphives-quickpanel-v1";
const APP_SHELL = [
  "/quickpanel/index.html",
  "/quickpanel/app.css",
  "/quickpanel/app.js",
  "/quickpanel/manifest.webmanifest",
  "/quickpanel/icon.svg"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("yorphives-quickpanel-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/quickpanel/")) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put("/quickpanel/index.html", copy));
      }
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match("/quickpanel/index.html")) || Response.error()));
    return;
  }
  event.respondWith(caches.match(request).then(cached => {
    const networkUpdate = fetch(request).then(response => {
      if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => cached);
    return cached || networkUpdate;
  }));
});