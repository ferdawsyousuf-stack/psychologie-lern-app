// Brücke zwischen Nachtwerk und der Oura-API (Cloudflare Worker, kostenloser Tarif reicht).
// Oura erlaubt keine Abrufe direkt aus dem Browser (CORS). Dieser Worker reicht Lese-Anfragen der
// Nachtwerk-Seite an api.ouraring.com weiter und ergänzt die nötigen CORS-Kopfzeilen.
// Er speichert nichts: Die Oura-Anmeldung kommt bei jeder Anfrage von deinem Handy mit.

const ALLOWED = ['https://ferdawsyousuf-stack.github.io'];
const PASS = ['Retry-After', 'X-RateLimit-Limit', 'X-RateLimit-Window', 'X-RateLimit-Reset', 'X-RateLimit-Tier'];

export default {
  async fetch(req) {
    const origin = req.headers.get('Origin') || '';
    if (!ALLOWED.includes(origin)) return new Response('forbidden', { status: 403 });
    const cors = {
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization',
      'Access-Control-Expose-Headers': PASS.join(', '),
      'Access-Control-Max-Age': '86400',
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'GET') return new Response('method', { status: 405, headers: cors });
    const u = new URL(req.url);
    if (!/^\/v2\/(sandbox\/)?usercollection\/[a-z0-9_]+$/.test(u.pathname)) {
      return new Response('path', { status: 403, headers: cors });
    }
    const up = await fetch('https://api.ouraring.com' + u.pathname + u.search, {
      headers: { Authorization: req.headers.get('Authorization') || '' },
    });
    const h = new Headers(cors);
    h.set('Content-Type', up.headers.get('Content-Type') || 'application/json');
    h.set('Cache-Control', 'no-store');
    PASS.forEach((k) => up.headers.get(k) && h.set(k, up.headers.get(k)));
    return new Response(up.body, { status: up.status, headers: h });
  },
};
