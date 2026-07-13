const CACHE_NAME = "primary-music-helper-shell-v171";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=primary-2026-8",
  "./script.js?v=primary-2026-8",
  "./library.json",
  "./manifest.json",
  "./favicon.ico",
  "./assets/icon.svg",
  "./assets/apple-touch-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./music/Primary-2026/Called to Serve - lyrics, 249.pdf",
  "./music/Primary-2026/Called to Serve (hymnbook) ♫, 174.pdf",
  "./music/Primary-2026/Called to Serve ♫, 249.pdf",
  "./music/Primary-2026/Choose to Serve the Lord - lyrics.pdf",
  "./music/Primary-2026/Choose to Serve the Lord ♪ ♫.pdf",
  "./music/Primary-2026/I Feel My Savior's Love ♫, 74.pdf",
  "./music/Primary-2026/I Feel My Savior’s Love, lyrics, 74.pdf",
  "./music/Primary-2026/I Will Follow God’s Plan - lyrics, 165.pdf",
  "./music/Primary-2026/I Will Follow God's Plan for Me ♫, 165.pdf",
  "./music/Primary-2026/I Will Walk with Jesus, 1004 - lyrics.pdf",
  "./music/Primary-2026/I Will Walk with Jesus, 1004 ♫.pdf",
  "./music/Primary-2026/Search, Ponder, and Pray - lyrics, 109.pdf",
  "./music/Primary-2026/Search, Ponder, and Pray ♫, 109.pdf",
  "./music/Primary-2026/The Wise Man and the Foolish Man ♫, 281.pdf",
  "./music/Primary-2026/The Wise Man and the Foolish Man, lyrics, 281.pdf",
  "./music/Primary-2026/This Little Light of Mine - lyrics, 1028.pdf",
  "./music/Primary-2026/This Little Light of Mine ♫, 1028.pdf"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
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

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.endsWith("/library.json")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // PDFs are intentionally not pre-cached in this first version. For reliable
  // offline PDFs, add chosen private PDF paths to a cache list or provide an
  // in-app download step that stores them after the user confirms local use.
  if (url.pathname.includes("/music/")) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    })
    .catch(() => caches.match(request));
}
