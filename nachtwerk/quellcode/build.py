#!/usr/bin/env python3
"""Baut Nachtwerk aus app.html.

  python3 build.py                     -> ../index.html und ../sw.js (Web-App für GitHub Pages, ohne Daten)
  python3 build.py --artifact OUT.html --snap daten.json
                                       -> Fassung für claude.ai mit eingebettetem Datenstand

Die Web-App enthält nie Schlafdaten. Sie kommen auf dem Handy per Code, Datei oder Oura-Anmeldung dazu
und bleiben dort im Browser-Speicher.
"""
import argparse, hashlib, json, pathlib

HERE = pathlib.Path(__file__).resolve().parent
APP = HERE.parent

HEAD = """<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#12050a">
<meta name="description" content="Dein Schlaf auf dem nächsten Level: Schlafforschung, auf deine Oura-Daten angewandt.">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Nachtwerk">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="color-scheme" content="dark">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.ouraring.com https://*.workers.dev; base-uri 'none'; form-action 'none'; object-src 'none'">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<script>window.NW_PWA=true</script>
"""

SW = """// Service Worker für Nachtwerk.
// Die App startet sofort aus dem Speicher (auch ohne Internet) und holt Neuerungen im Hintergrund;
// sie gelten ab dem nächsten Start. Oura-Abrufe gehen immer direkt ins Netz.

const VERSION = '%s';
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
const RUNTIME_HOSTS = /(^|\\.)(fonts\\.googleapis\\.com|fonts\\.gstatic\\.com)$/;

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
    // Der Oura-Rücksprung trägt die Anmeldung im #-Teil; der erreicht den Server nie, darum reicht index.html.
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
"""

MANIFEST = {
    "id": "/psychologie-lern-app/nachtwerk/",
    "name": "Nachtwerk Schlaf",
    "short_name": "Nachtwerk",
    "description": "Dein Schlaf auf dem nächsten Level: Schlafforschung, auf deine Oura-Daten angewandt.",
    "lang": "de",
    "dir": "ltr",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "orientation": "portrait",
    "background_color": "#12050a",
    "theme_color": "#12050a",
    "categories": ["health", "lifestyle", "medical"],
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
}


def assemble(snap=None):
    src = (HERE / "app.html").read_text(encoding="utf-8")
    icons = (HERE / "icons-data.js").read_text(encoding="utf-8")
    assert src.count("/*ICONS*/") == 1 and src.count("/*SNAP*/null/*END*/") == 1
    src = src.replace("/*ICONS*/", icons)
    if snap is not None:
        src = src.replace("/*SNAP*/null/*END*/", "/*SNAP*/" + json.dumps(snap, separators=(",", ":")) + "/*END*/")
    return src


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--artifact")
    ap.add_argument("--snap")
    a = ap.parse_args()
    if a.artifact:
        snap = json.loads(pathlib.Path(a.snap).read_text()) if a.snap else None
        pathlib.Path(a.artifact).write_text(assemble(snap), encoding="utf-8")
        print("Artifact:", a.artifact)
        return
    body = assemble(None)
    # Die Artifact-Fassung beginnt mit <title>; für die Web-App kommt der Dokumentrahmen davor.
    title_end = body.index("</title>") + len("</title>")
    page = HEAD + body[:title_end] + "\n" + body[title_end:].lstrip()
    head_end = page.index("<div class=\"page-sky")
    page = page[:head_end] + "</head>\n<body>\n" + page[head_end:].rstrip() + "\n</body>\n</html>\n"
    (APP / "index.html").write_text(page, encoding="utf-8")
    (APP / "manifest.webmanifest").write_text(json.dumps(MANIFEST, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    h = hashlib.sha256(page.encode()).hexdigest()[:12]
    (APP / "sw.js").write_text(SW % h, encoding="utf-8")
    print("Web-App gebaut, Version", h)


if __name__ == "__main__":
    main()
