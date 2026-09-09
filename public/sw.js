// Bump this on every deploy that changes cached assets so activate() clears stale caches.
const CACHE_VERSION = "v1";
const CACHE_NAME = `geekery-${CACHE_VERSION}`;
// Separate, version-independent cache for poster/cover art from third-party
// providers (TMDB, IGDB, ComicVine, Google Books, ...). It doesn't get
// wiped on app-shell deploys — only explicitly, via the "Clear cached
// images" action in Settings (see the "message" listener below).
const IMAGE_CACHE_NAME = "geekery-images-v1";

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  // Activate this worker as soon as it finishes installing instead of waiting
  // for old tabs to close, so a new version doesn't sit idle behind stale ones.
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {})),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== IMAGE_CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      // Take control of any already-open tabs immediately, rather than only
      // affecting tabs opened after this activation.
      await self.clients.claim();
    })(),
  );
});

// Settings' "Clear cached images" button talks to the active worker over a
// MessageChannel so it can await confirmation before refreshing the page.
self.addEventListener("message", (event) => {
  if (event.data?.type !== "CLEAR_IMAGE_CACHE") return;
  event.waitUntil(
    caches.delete(IMAGE_CACHE_NAME).then((deleted) => {
      event.ports[0]?.postMessage({ ok: true, deleted });
    }),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.destination === "image") {
    // Cache-first with a background revalidate: repeat views of a poster
    // are instant, and this cache is what "Clear cached images" clears.
    // Cross-origin <img> requests arrive here in "no-cors" mode, so the
    // response is opaque (status 0, response.ok is always false) — there's
    // no way to inspect success from JS, so any opaque response is cached
    // as-is, same as a normal ok same-origin response.
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const cached = await cache.match(request);
        const revalidate = fetch(request)
          .then((response) => {
            if (response.ok || response.type === "opaque") {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => undefined);
        return cached ?? (await revalidate) ?? Response.error();
      })(),
    );
    return;
  }

  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw new Error("Network request failed and no cache match was found");
      }
    })(),
  );
});
