// Service Worker für Sprechwerk Daily.
// Die App startet sofort aus dem Speicher (auch ohne Internet) und holt Neuerungen im Hintergrund;
// sie gelten ab dem nächsten Start. Das Bühnen-Video lädt nur online.

const VERSION = '__VERSION__';
const SHELL = 'sprechwerk-shell-' + VERSION;
const RUNTIME = 'sprechwerk-runtime-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];
// Schriften und Bilder aus dem Design, damit die App auch offline wie gewohnt aussieht.
const RUNTIME_HOSTS = /(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com|db\.onlinewebfonts\.com|images\.higgs\.ai|images\.pexels\.com)$/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('sprechwerk-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** Sofort aus dem Speicher antworten und im Hintergrund auffrischen. */
function cachedThenRefresh(event, cacheName, key) {
  const { request } = event;
  const refresh = caches.open(cacheName).then((cache) =>
    fetch(request)
      .then((response) => {
        if (response && (response.ok || response.type === 'opaque')) {
          return cache.put(key || request, response.clone()).then(() => response);
        }
        return response;
      })
      .catch(() => null),
  );
  event.waitUntil(refresh.then(() => undefined));
  event.respondWith(
    caches
      .open(cacheName)
      .then((cache) => cache.match(key || request))
      .then((cached) => cached || refresh.then((fresh) => fresh || Response.error())),
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') cachedThenRefresh(event, SHELL, './index.html');
    else cachedThenRefresh(event, SHELL);
    return;
  }
  if (RUNTIME_HOSTS.test(url.hostname)) cachedThenRefresh(event, RUNTIME);
});
