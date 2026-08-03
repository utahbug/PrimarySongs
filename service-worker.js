const CACHE_NAME = "primary-music-helper-shell-v505";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=primary-2026-260",
  "./assets/pdf.min.js?v=3.11.174",
  "./assets/pdf.worker.min.js?v=3.11.174",
  "./lyrics-cards.js?v=primary-2026-101",
  "./script.js?v=primary-2026-260",
  "./library.json",
  "./manifest.json",
  "./favicon.ico",
  "./assets/icon.svg",
  "./assets/musicdocs-social-card.png",
  "./assets/apple-touch-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/jazz-ensemble-puzzle.webp",
  "./assets/jazz-ensemble-puzzle-2.webp",
  "./assets/jazz-ensemble-puzzle-3.webp",
  "./assets/jazz-ensemble-puzzle-4.webp",
  "./assets/jazz-ensemble-puzzle-5.webp",
  "./assets/jazz-ensemble-puzzle-6.webp",
  "./assets/jazz-ensemble-puzzle-7.webp",
  "./assets/AtkinsonHyperlegible-Regular.woff2",
  "./assets/AtkinsonHyperlegible-Italic.woff2",
  "./assets/AtkinsonHyperlegible-Bold.woff2",
  "./assets/AtkinsonHyperlegible-BoldItalic.woff2"
];

const OFFLINE_PDFS = [
  "./music/Primary-2026/called-to-serve-hymnbook-174.pdf",
  "./music/Primary-2026/called-to-serve-249.pdf",
  "./music/Primary-2026/choose-to-serve-the-lord.pdf",
  "./music/Primary-2026/i-feel-my-saviors-love-74.pdf",
  "./music/Primary-2026/i-will-follow-gods-plan-for-me-165.pdf",
  "./music/Primary-2026/i-will-walk-with-jesus-1004.pdf",
  "./music/Primary-2026/search-ponder-and-pray-109.pdf",
  "./music/Primary-2026/the-wise-man-and-the-foolish-man-281.pdf",
  "./music/Primary-2026/this-little-light-of-mine-1028.pdf",
  "./music/Primary-favorites/build-an-ark-1060.pdf",
  "./music/Primary-favorites/do-as-im-doing-276.pdf",
  "./music/Primary-favorites/follow-the-prophet-110.pdf",
  "./music/Primary-favorites/give-said-the-little-stream-236.pdf",
  "./music/Primary-favorites/head-shoulders-knees-and-toes-275a.pdf",
  "./music/Primary-favorites/hello-song-260.pdf",
  "./music/Primary-favorites/if-youre-happy-266.pdf",
  "./music/Primary-favorites/once-there-was-a-snowman-249.pdf",
  "./music/Primary-favorites/popcorn-popping-242.pdf",
  "./music/Primary-favorites/the-handcart-song-220.pdf",
  "./music/Just-for-fun/a-childs-prayer-12.pdf",
  "./music/Just-for-fun/beauty-everywhere-232.pdf",
  "./music/Just-for-fun/children-all-over-the-world-16.pdf",
  "./music/Just-for-fun/gethsemane-1009.pdf",
  "./music/Just-for-fun/he-sent-his-son-34.pdf",
  "./music/Just-for-fun/holding-hands-around-the-world-1011.pdf",
  "./music/Primary-favorites/i-am-a-child-of-god-2.pdf",
  "./music/Just-for-fun/i-belong-to-the-church-of-jesus-christ-77.pdf",
  "./music/Just-for-fun/i-hope-they-call-me-on-a-mission-169.pdf",
  "./music/Just-for-fun/i-love-to-see-the-temple-95.pdf",
  "./music/Just-for-fun/i-need-my-heavenly-father-18.pdf",
  "./music/Just-for-fun/i-thank-thee-dear-father-7.pdf",
  "./music/Just-for-fun/i-want-to-be-a-missionary-now-168.pdf",
  "./music/Just-for-fun/im-trying-to-be-like-jesus-78.pdf",
  "./music/Just-for-fun/jesus-has-risen-70.pdf",
  "./music/Just-for-fun/jesus-wants-me-for-a-sunbeam-60.pdf",
  "./music/Just-for-fun/little-purple-pansies-244.pdf",
  "./music/Just-for-fun/my-heavenly-father-loves-me-228.pdf",
  "./music/Just-for-fun/scripture-power.pdf",
  "./music/Just-for-fun/when-he-comes-again-82.pdf",
  "./music/Just-for-fun/when-i-am-baptized-103.pdf",
  "./music/Just-for-fun/where-love-is-138.pdf",
  "./music/Primary-2026/HymnsForHomeAndChurch July 23, 2026).pdf"
];

const OFFLINE_ASSETS = [...CORE_ASSETS, ...OFFLINE_PDFS];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(OFFLINE_ASSETS.map((asset) => cache.add(asset))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CHECK_OFFLINE_READY") return;
  event.waitUntil(reportOfflineReadiness(event));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(navigationNetworkFirst(request));
    return;
  }
  if (url.pathname.endsWith("/library.json")) {
    event.respondWith(networkFirst(request, "./library.json"));
    return;
  }
  if (url.pathname.includes("/music/") || url.pathname.endsWith("/pdf.worker.min.js")) {
    event.respondWith(cacheFirst(request));
    return;
  }
  event.respondWith(cacheFirst(request));
});

async function reportOfflineReadiness(event) {
  const cache = await caches.open(CACHE_NAME);
  const checks = await Promise.all(OFFLINE_ASSETS.map((asset) => cache.match(asset)));
  const missing = OFFLINE_ASSETS.filter((asset, index) => !checks[index]);
  event.ports[0]?.postMessage({
    type: "OFFLINE_READY_STATUS",
    ready: missing.length === 0,
    missingCount: missing.length,
    totalCount: OFFLINE_ASSETS.length
  });
}

async function navigationNetworkFirst(request) {
  try {
    const response = await fetch(request);
    if (response?.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put("./index.html", response.clone());
    }
    return response;
  } catch {
    return (await caches.match("./index.html")) || (await caches.match("./"));
  }
}

async function networkFirst(request, fallback) {
  try {
    const response = await fetch(request);
    if (response?.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request, { ignoreSearch: true })) || (fallback ? caches.match(fallback) : undefined);
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response?.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}
