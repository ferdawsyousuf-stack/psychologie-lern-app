// Brücke zwischen Nachtwerk und Oura (Cloudflare Worker, der kostenlose Tarif reicht).
// Oura erlaubt keine Abrufe direkt aus dem Browser (CORS). Dieser Worker macht zwei Dinge:
// 1. Bei der Anmeldung tauscht er den Code von Oura gegen Zugangsschlüssel. Dafür verlangt Oura das
//    Client Secret. Es liegt verschlüsselt als Secret OURA_CLIENT_SECRET in diesem Worker, nie in der App.
//    Beim Trennen meldet er die Schlüssel bei Oura wieder ab.
// 2. Er reicht Lese-Anfragen der Nachtwerk-Seite an api.ouraring.com weiter.
// Er speichert nichts: Die Schlüssel kommen bei jeder Anfrage von deinem Handy mit.

const ALLOWED = ['https://ferdawsyousuf-stack.github.io'];
const REDIRECT = 'https://ferdawsyousuf-stack.github.io/psychologie-lern-app/nachtwerk/';
const TOKEN_URL = 'https://moi.ouraring.com/oauth/v2/ext/oauth-token';
const REVOKE_URL = 'https://moi.ouraring.com/oauth/v2/ext/oauth-revoke';
const API = 'https://api.ouraring.com';
const PASS = ['Retry-After', 'X-RateLimit-Limit', 'X-RateLimit-Window', 'X-RateLimit-Reset', 'X-RateLimit-Tier'];

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    const origin = req.headers.get('Origin') || '';
    // Im normalen Browser-Tab aufgerufen: kurzer Selbsttest für die Einrichtung
    if (!origin && req.method === 'GET' && u.pathname === '/') {
      const ok = !!String((env && env.OURA_CLIENT_SECRET) || '').trim();
      return new Response(
        'Nachtwerk-Brücke läuft.\nClient Secret: ' + (ok ? 'eingetragen.' : 'fehlt noch (Settings → Runtime variables and secrets).') + '\n',
        { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } },
      );
    }
    if (!ALLOWED.includes(origin)) return new Response('forbidden', { status: 403 });
    const cors = {
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Expose-Headers': PASS.join(', '),
      'Access-Control-Max-Age': '86400',
    };
    const json = (status, body) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    if (u.pathname === '/oauth/token' || u.pathname === '/oauth/revoke') {
      if (req.method !== 'POST') return json(405, { error: 'method' });
      return token(req, env, cors, json, u.pathname === '/oauth/revoke');
    }

    if (req.method !== 'GET') return json(405, { error: 'method' });
    if (!/^\/v2\/(sandbox\/)?usercollection\/[a-z0-9_]+$/.test(u.pathname)) return json(404, { error: 'path' });
    let up;
    try {
      up = await fetch(API + u.pathname + u.search, { headers: { Authorization: req.headers.get('Authorization') || '' } });
    } catch (e) {
      return json(502, { error: 'oura_unreachable' });
    }
    const h = new Headers(cors);
    h.set('Content-Type', up.headers.get('Content-Type') || 'application/json');
    h.set('Cache-Control', 'no-store');
    PASS.forEach((k) => up.headers.get(k) && h.set(k, up.headers.get(k)));
    return new Response(up.body, { status: up.status, headers: h });
  },
};

// Code oder Erneuerungs-Schlüssel gegen neue Zugangsschlüssel tauschen. Nur die zwei Fälle, die
// Nachtwerk braucht, und nur mit der Rücksprung-Adresse von Nachtwerk. Oder einen Schlüssel abmelden.
async function token(req, env, cors, json, revoke) {
  const secret = String((env && env.OURA_CLIENT_SECRET) || '').trim();
  if (!secret) return json(500, { error: 'no_secret' });
  let p;
  try {
    p = new URLSearchParams(await req.text());
  } catch (e) {
    return json(400, { error: 'invalid_request' });
  }
  const grant = p.get('grant_type');
  const cid = String(p.get('client_id') || '').trim();
  if (!cid) return json(400, { error: 'invalid_request' });
  if (revoke) {
    if (!p.get('token')) return json(400, { error: 'invalid_request' });
    const hint = p.get('token_type_hint');
    const out = new URLSearchParams({ token: p.get('token'), client_id: cid, client_secret: secret });
    if (hint === 'refresh_token' || hint === 'access_token') out.set('token_type_hint', hint);
    return forward(REVOKE_URL, out, cors);
  }
  const out = new URLSearchParams({ grant_type: grant || '', client_id: cid, client_secret: secret });
  if (grant === 'authorization_code') {
    // Nachtwerk schickt immer einen PKCE-Prüfwert mit. Ohne ihn tauscht die Brücke keinen Code
    if (!p.get('code') || !p.get('code_verifier') || p.get('redirect_uri') !== REDIRECT) return json(400, { error: 'invalid_request' });
    out.set('code', p.get('code'));
    out.set('redirect_uri', REDIRECT);
    out.set('code_verifier', p.get('code_verifier'));
  } else if (grant === 'refresh_token') {
    if (!p.get('refresh_token')) return json(400, { error: 'invalid_request' });
    out.set('refresh_token', p.get('refresh_token'));
  } else {
    return json(400, { error: 'unsupported_grant_type' });
  }
  return forward(TOKEN_URL, out, cors);
}

async function forward(url, out, cors) {
  let up;
  try {
    up = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: out.toString(),
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'oura_unreachable' }), {
      status: 502,
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  return new Response(await up.text(), {
    status: up.status,
    headers: { ...cors, 'Content-Type': up.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'no-store' },
  });
}
