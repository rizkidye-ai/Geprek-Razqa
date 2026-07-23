// Minimal service worker: no offline caching (POS data must always be fresh),
// but a registered fetch handler is required for Chrome/Android to treat this
// as an installable PWA.
self.addEventListener("fetch", () => {});
