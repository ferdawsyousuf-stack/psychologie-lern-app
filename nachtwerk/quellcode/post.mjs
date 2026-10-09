// Nachtwerk-Postfach: bringt Oura-Nächte verschlüsselt zur App auf dem Handy.
//
// Aufruf:  node post.mjs --in <Ordner> [--key NWK.… …] [--out <nachtwerk-Ordner>]
//   <Ordner> enthält die Antworten der Oura-Verbindung in Claude, so wie sie kamen:
//   sleep.json (get_sleep), readiness.json (get_readiness), activity.json (get_activity).
//   Ohne --key gelten die Schlüssel aus <out>/post/keys.txt (eine Zeile je Handy).
//
// Für jeden Schlüssel entsteht <out>/post/<id>.json. Das Handy hat den passenden privaten Schlüssel
// erzeugt und nie hergegeben; nur damit lässt sich die Datei öffnen (ECDH P-256, HKDF, AES-GCM).
// Das Skript gibt keine Gesundheitswerte aus, nur Anzahl und Datum.
// Die Rohdateien gehören nie ins Repo; ein Ordner darin wird abgelehnt.
// Rückgabe: 0 fertig, 1 Fehler, 2 keine gültigen Nächte, 3 nur ein Teil der Schlüssel ging.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createHash, webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const { subtle } = webcrypto;
const te = new TextEncoder();
const b64u = { enc: (b) => Buffer.from(b).toString('base64url'), dec: (s) => new Uint8Array(Buffer.from(s, 'base64url')) };
const INFO = 'nachtwerk-post-1';

function args(argv) {
  const o = { key: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--key') o.key.push(argv[++i]);
    else if (a === '--in') o.in = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else throw new Error('Unbekannte Angabe: ' + a);
  }
  return o;
}

// Oura-Antworten lesen. Die Datei darf das Objekt der Verbindung sein ({sleep:[…]}) oder gleich die Liste.
function rows(dir, file, field) {
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) return [];
  let j;
  try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { throw new Error(file + ' ist kein gültiges JSON'); }
  const list = Array.isArray(j) ? j : j && Array.isArray(j[field]) ? j[field] : null;
  if (!list) throw new Error(file + ': keine Liste „' + field + '“ gefunden');
  return list;
}

// Prüfwerte: alles, was nicht in diese Bereiche passt, ist ein Übertragungsfehler und fliegt raus
const ISO_D = /^\d{4}-\d{2}-\d{2}$/;
const num = (v, lo, hi) => (v == null ? null : typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : NaN);
const bad = (r) => r.some((v) => Number.isNaN(v));

function sleepRow(x) {
  if (!x || !ISO_D.test(x.date)) return null;
  const s = Date.parse(x.bedtime_start), e = Date.parse(x.bedtime_end);
  if (!(e > s) || e - s > 24 * 3600e3) return null;
  const r = [x.date, new Date(s).toISOString(), new Date(e).toISOString(),
    num(x.total_sleep_minutes, 0, 1440), num(x.rem_minutes, 0, 1440), num(x.deep_minutes, 0, 1440), num(x.light_minutes, 0, 1440),
    num(x.awake_minutes, 0, 1440), num(x.sleep_efficiency_percent, 0, 100), num(x.sleep_latency_seconds, 0, 86400),
    num(x.lowest_heart_rate, 20, 200), x.avg_hrv == null ? null : num(Math.round(x.avg_hrv), 0, 500), num(x.sleep_score, 0, 100),
    num(x.avg_breath_rate ?? null, 3, 60)];
  if (bad(r) || r[3] == null) return null;
  // Schlafphasen müssen zur Gesamtschlafzeit passen
  if (r[4] != null && r[5] != null && r[6] != null && Math.abs(r[4] + r[5] + r[6] - r[3]) > 3) return null;
  if ((e - s) / 60e3 + 2 < r[3]) return null;
  return r;
}
function readyRow(x) {
  if (!x || !ISO_D.test(x.date)) return null;
  const c = x.contributors || {};
  const r = [x.date, num(x.readiness_score, 0, 100), num(c.sleep_balance, 0, 100), num(c.hrv_balance, 0, 100), num(c.recovery_index, 0, 100),
    num(c.resting_heart_rate, 0, 100), num(c.previous_night, 0, 100), num(c.activity_balance, 0, 100), num(c.temperature_deviation ?? 0, -5, 5)];
  return bad(r) ? null : r;
}
function actRow(x) {
  if (!x || !ISO_D.test(x.date)) return null;
  const r = [x.date, num(x.activity_score, 0, 100), num(x.steps, 0, 200000), num(x.calories_active, 0, 20000)];
  return bad(r) ? null : r;
}

function collect(dir) {
  const report = {};
  const take = (file, field, fn) => {
    const all = rows(dir, file, field), ok = all.map(fn).filter(Boolean);
    report[field] = { ok: ok.length, dropped: all.length - ok.length };
    return ok;
  };
  const sleep = take('sleep.json', 'sleep', sleepRow);
  const ready = take('readiness.json', 'readiness', readyRow);
  const act = take('activity.json', 'activity', actRow);
  return { d: { sleep, ready, act, spo2: [] }, report };
}

async function seal(keyCode, json, plainJson, outDir) {
  const m = String(keyCode || '').trim().match(/^NWK\.([A-Za-z0-9_-]{80,100})$/);
  if (!m) throw new Error('Schlüssel ungültig: ' + String(keyCode).slice(0, 12) + '…');
  const pubRaw = b64u.dec(m[1]);
  if (pubRaw.length !== 65 || pubRaw[0] !== 4) throw new Error('Schlüssel ungültig (Länge)');
  // Hex statt Base64: GitHub Pages veröffentlicht keine Dateien, die mit „_“ beginnen
  const id = createHash('sha256').update(pubRaw).digest('hex').slice(0, 24);
  const file = path.join(outDir, 'post', id + '.json');
  // Gleiche Daten wie beim letzten Mal: nichts schreiben, damit kein leerer Commit entsteht.
  // h hängt nur an den Daten, nicht an der Uhrzeit, die verschlüsselt mitreist
  const h = b64u.enc(createHash('sha256').update(INFO + '|' + id + '|' + json).digest()).slice(0, 16);
  try { if (JSON.parse(fs.readFileSync(file, 'utf8')).h === h) return { id, file, changed: false }; } catch (e) {}
  const plain = 'NW1.' + b64u.enc(zlib.deflateRawSync(Buffer.from(plainJson, 'utf8'), { level: 9 }));
  const recip = await subtle.importKey('raw', pubRaw, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const eph = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const epk = new Uint8Array(await subtle.exportKey('raw', eph.publicKey));
  const bits = await subtle.deriveBits({ name: 'ECDH', public: recip }, eph.privateKey, 256);
  const hk = await subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
  const aes = await subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: epk, info: te.encode(INFO) }, hk, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: te.encode(id) }, aes, te.encode(plain)));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ v: 1, id, t: JSON.parse(plainJson).t, h, epk: b64u.enc(epk), iv: b64u.enc(iv), ct: b64u.enc(ct) }) + '\n');
  return { id, file, changed: true };
}

// Wurzel des Git-Repos, in dem das Skript liegt
function repoRoot(from) {
  for (let d = from; ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, '.git'))) return d;
    if (path.dirname(d) === d) return null;
  }
}

async function main() {
  const o = args(process.argv.slice(2));
  if (!o.in) throw new Error('--in <Ordner> fehlt');
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = repoRoot(here), inDir = fs.realpathSync(path.resolve(o.in));
  if (root) {
    const rel = path.relative(fs.realpathSync(root), inDir);
    if (!rel.startsWith('..') && !path.isAbsolute(rel)) throw new Error('--in liegt im Repo. Rohdaten gehören in einen Ordner außerhalb.');
  }
  const outDir = path.resolve(o.out || path.join(here, '..'));
  let keys = o.key;
  if (!keys.length) {
    const kf = path.join(outDir, 'post', 'keys.txt');
    keys = fs.existsSync(kf) ? fs.readFileSync(kf, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean) : [];
  }
  if (!keys.length) throw new Error('Kein Schlüssel: --key NWK.… oder post/keys.txt');
  const { d, report } = collect(inDir);
  console.log('Geprüft: ' + Object.entries(report).map(([k, v]) => `${k} ${v.ok} gut${v.dropped ? `, ${v.dropped} verworfen` : ''}`).join(' · '));
  if (!d.sleep.length) { console.log('Keine gültigen Nächte. Nichts geschrieben.'); process.exitCode = 2; return; }
  const last = d.sleep.reduce((a, r) => (r[0] > a ? r[0] : a), '');
  const json = JSON.stringify({ v: 1, d });
  // t reist verschlüsselt mit, damit das Handy eine ältere Lieferung erkennt
  const plainJson = JSON.stringify({ v: 1, t: Date.now(), d });
  let failed = 0;
  for (const [i, k] of keys.entries()) {
    try {
      const r = await seal(k, json, plainJson, outDir);
      console.log(`${r.changed ? 'Neu' : 'Unverändert'}: post/${r.id}.json (${d.sleep.length} Nächte, letzte ${last})`);
    } catch (e) {
      failed++;
      console.error(`Fehler bei Schlüssel ${i + 1}: ${e.message}`);
    }
  }
  if (failed) process.exitCode = failed === keys.length ? 1 : 3;
}

main().catch((e) => { console.error('Fehler: ' + e.message); process.exitCode = 1; });
