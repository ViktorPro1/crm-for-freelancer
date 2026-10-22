// Service worker: робить сайт придатним до встановлення і показує сторінку "немає мережі".
// Свідомо простий: НЕ кешує сторінки, дані клієнтів, відповіді сервера чи вхід.
// Кешуються лише файли, які не змінюються (скрипти й стилі з /_next/static та іконки).
// Змінюєш цей файл або іконки: збільш VERSION, і старий кеш буде видалено.

const VERSION = "v1";
const CACHE = `crm-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Лише прості читання з нашого сайту. Усе інше (форми, вхід, дії сервера) йде напряму в мережу.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Перехід на сторінку: спершу мережа, а якщо її немає, показуємо сторінку "офлайн".
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Файли з хешем у назві й іконки: спершу кеш, інакше мережа з додаванням у кеш.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
