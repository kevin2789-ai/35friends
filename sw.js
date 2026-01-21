/* sw.js - 35friends PWA */
const CACHE_NAME = "kw35friends-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.svg",
  "./icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// 같은 origin(=github pages) 정적 파일만 캐시
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Apps Script 같은 외부 도메인(API)은 캐시하지 않고 그대로 통과
  if (url.origin !== self.location.origin) return;

  // HTML은 네트워크 우선(업데이트 반영)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./", copy));
          return res;
        })
        .catch(() => caches.match("./"))
    );
    return;
  }

  // 나머지는 캐시 우선
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
