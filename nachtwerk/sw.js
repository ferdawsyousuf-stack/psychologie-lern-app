// Service Worker für Nachtwerk.
// Die App startet sofort aus dem Speicher (auch ohne Internet) und holt Neuerungen im Hintergrund;
// sie gelten ab dem nächsten Start. Oura-Abrufe gehen immer direkt ins Netz.

const VERSION = '808d59f73476';
const SHELL = 'nachtwerk-shell-' + VERSION;
const RUNTIME = 'nachtwerk-runtime-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];
const SCOPE = new URL('./', self.location).pathname;
const SHELL_PATHS = new Set(SHELL_FILES.map((f) => new URL(f, self.location).pathname));
// Schriften, damit die App auch offline wie gewohnt aussieht.
const RUNTIME_HOSTS = /(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com)$/;

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
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('nachtwerk-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** Sofort aus dem Speicher antworten und im Hintergrund auffrischen. */
function cachedThenRefresh(event, cacheName, key) {
  const { request } = event;
  const refresh = caches.open(cacheName).then((cache) =>
    fetch(request)
      .then((response) => {
        // Unter dem Schlüssel der App nur eine echte HTML-Seite ablegen
        const html = (response && response.headers.get('content-type')) || '';
        if (response && (response.ok || response.type === 'opaque') && (!key || html.includes('text/html'))) {
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
    // Der Oura-Rücksprung (?code=…) zeigt auf diese Seite; index.html aus dem Speicher reicht, die App liest den Code selbst.
    // Andere Seiten im Ordner (Anleitung, Quellcode) gehen am Speicher vorbei, sonst ersetzen sie die App.
    if (request.mode === 'navigate') {
      if (url.pathname === SCOPE || url.pathname === SCOPE + 'index.html') cachedThenRefresh(event, SHELL, './index.html');
      return;
    }
    if (SHELL_PATHS.has(url.pathname)) cachedThenRefresh(event, SHELL);
    return;
  }
  if (RUNTIME_HOSTS.test(url.hostname)) cachedThenRefresh(event, RUNTIME);
});
