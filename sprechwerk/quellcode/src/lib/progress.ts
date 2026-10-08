// Fortschritt: reine Funktionen ohne Seiteneffekte.

export type Outcome = 'better' | 'expected' | 'harder' | 'notyet' | 'skipped';

export interface MissionEntry {
  id: string;
  date: string;
  level: number;
  title: string;
  outcome: Outcome | null;
}

export interface StageEntry {
  id: string;
  date: string;
  /** Erwartet vorher, 0–10. */
  expected: number;
  /** Erlebt nachher, 0–10. */
  actual: number;
  seconds: number;
}

export interface Progress {
  v: 1;
  days: string[];
  sessions: number;
  minutes: number;
  missions: MissionEntry[];
  moments: Record<string, number>;
  bestExhale: number;
  focus: number[];
  stage: StageEntry[];
  updatedAt: number;
}

export const EMPTY_PROGRESS: Progress = {
  v: 1,
  days: [],
  sessions: 0,
  minutes: 0,
  missions: [],
  moments: {},
  bestExhale: 0,
  focus: [],
  stage: [],
  updatedAt: 0,
};

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const OUTCOME_IDS: Outcome[] = ['better', 'expected', 'harder', 'notyet', 'skipped'];
const DONE: Outcome[] = ['better', 'expected', 'harder'];

export function dayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + delta));
}

export function formatDay(key: string, today: string = dayKey()): string {
  if (key === today) return 'heute';
  if (key === shiftDay(today, -1)) return 'gestern';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

function isMission(value: unknown): value is MissionEntry {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.date === 'string' &&
    DAY_RE.test(r.date) &&
    typeof r.level === 'number' &&
    typeof r.title === 'string' &&
    (r.outcome === null || OUTCOME_IDS.includes(r.outcome as Outcome))
  );
}

const isScore = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 10;

function isStage(value: unknown): value is StageEntry {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.date === 'string' &&
    DAY_RE.test(r.date) &&
    isScore(r.expected) &&
    isScore(r.actual) &&
    typeof r.seconds === 'number' &&
    r.seconds >= 0
  );
}

const byDateThenId = (x: { date: string; id: string }, y: { date: string; id: string }) =>
  x.date === y.date ? x.id.localeCompare(y.id) : x.date.localeCompare(y.date);

function pruneMoments(moments: Record<string, number>): Record<string, number> {
  const keys = Object.keys(moments).sort().slice(-120);
  const out: Record<string, number> = {};
  for (const k of keys) out[k] = moments[k];
  return out;
}

/** Bringt gespeicherte Daten (lokal oder aus dem Konto) in eine sichere Form. */
export function normalize(raw: unknown): Progress {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0);
  const days = Array.isArray(r.days)
    ? r.days.filter((d): d is string => typeof d === 'string' && DAY_RE.test(d))
    : [];
  const missions = Array.isArray(r.missions) ? r.missions.filter(isMission) : [];
  const moments: Record<string, number> = {};
  if (r.moments && typeof r.moments === 'object') {
    for (const [k, v] of Object.entries(r.moments as Record<string, unknown>)) {
      if (DAY_RE.test(k) && typeof v === 'number' && v > 0) moments[k] = Math.floor(v);
    }
  }
  const focus = Array.isArray(r.focus)
    ? r.focus.filter((f): f is number => f === 1 || f === 2 || f === 3 || f === 4)
    : [];
  const stage = Array.isArray(r.stage) ? r.stage.filter(isStage).slice(-100) : [];
  return {
    v: 1,
    days: [...new Set(days)].sort().slice(-400),
    sessions: Math.floor(num(r.sessions)),
    minutes: Math.floor(num(r.minutes)),
    missions: missions.slice(-200),
    moments: pruneMoments(moments),
    bestExhale: num(r.bestExhale),
    focus,
    stage,
    updatedAt: num(r.updatedAt),
  };
}

/** Führt zwei Stände zusammen, ohne Trainings zu verlieren. */
export function merge(a: Progress, b: Progress): Progress {
  const days = [...new Set([...a.days, ...b.days])].sort().slice(-400);
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  const older = newer === a ? b : a;
  // Der neuere Stand gewinnt (z. B. eine getauschte Mission), löscht aber nie eine Bewertung.
  const byId = new Map<string, MissionEntry>();
  for (const m of [...older.missions, ...newer.missions]) {
    const prev = byId.get(m.id);
    if (!prev || m.outcome !== null || prev.outcome === null) byId.set(m.id, m);
  }
  const missions = [...byId.values()].sort(byDateThenId).slice(-200);
  const stageById = new Map<string, StageEntry>();
  for (const s of [...a.stage, ...b.stage]) stageById.set(s.id, s);
  const stage = [...stageById.values()].sort(byDateThenId).slice(-100);
  const moments: Record<string, number> = { ...a.moments };
  for (const [k, v] of Object.entries(b.moments)) moments[k] = Math.max(moments[k] ?? 0, v);
  return {
    v: 1,
    days,
    sessions: Math.max(a.sessions, b.sessions),
    minutes: Math.max(a.minutes, b.minutes),
    missions,
    moments: pruneMoments(moments),
    bestExhale: Math.max(a.bestExhale, b.bestExhale),
    focus: newer.focus.length ? newer.focus : older.focus,
    stage,
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
  };
}

export function streak(p: Progress, today: string = dayKey()): number {
  const set = new Set(p.days);
  let cursor = set.has(today) ? today : shiftDay(today, -1);
  let n = 0;
  while (set.has(cursor)) {
    n += 1;
    cursor = shiftDay(cursor, -1);
  }
  return n;
}

export function missionStats(p: Progress): { rated: number; better: number; done: number } {
  const rated = p.missions.filter((m) => m.outcome !== null && DONE.includes(m.outcome));
  return { rated: rated.length, better: rated.filter((m) => m.outcome === 'better').length, done: rated.length };
}

/** Stufe 1–5: steigt nach je drei erledigten Missionen, danach wechseln die Stufen 3–5. */
export function missionLevel(p: Progress): number {
  const { done } = missionStats(p);
  if (done < 12) return 1 + Math.floor(done / 3);
  return [3, 4, 5][p.sessions % 3];
}

/** Die letzte Mission vor heute, falls sie noch nicht bewertet ist. */
export function openMission(p: Progress, today: string = dayKey()): MissionEntry | null {
  for (let i = p.missions.length - 1; i >= 0; i -= 1) {
    const m = p.missions[i];
    if (m.date >= today) continue;
    return m.outcome === null ? m : null;
  }
  return null;
}

/** Die Mission, die heute schon angenommen wurde (die letzte, falls es mehrere gibt). */
export function todayMission(p: Progress, today: string = dayKey()): MissionEntry | null {
  for (let i = p.missions.length - 1; i >= 0; i -= 1) {
    if (p.missions[i].date === today) return p.missions[i];
  }
  return null;
}

export function setOutcome(p: Progress, id: string, outcome: Outcome): Progress {
  return { ...p, missions: p.missions.map((m) => (m.id === id ? { ...m, outcome } : m)) };
}

export function addMoment(p: Progress, delta: number, today: string = dayKey()): Progress {
  const next = Math.max(0, (p.moments[today] ?? 0) + delta);
  const moments = { ...p.moments };
  if (next > 0) moments[today] = next;
  else delete moments[today];
  return { ...p, moments: pruneMoments(moments) };
}

/** Auftritte gesamt und Durchschnitt der letzten fünf: erwartet und erlebt. */
export function stageStats(p: Progress): { count: number; expected: number | null; actual: number | null } {
  const recent = p.stage.slice(-5);
  if (!recent.length) return { count: p.stage.length, expected: null, actual: null };
  const avg = (key: 'expected' | 'actual') => recent.reduce((sum, s) => sum + s[key], 0) / recent.length;
  return { count: p.stage.length, expected: avg('expected'), actual: avg('actual') };
}

export function addStage(
  p: Progress,
  entry: { expected: number; actual: number; seconds: number },
  today: string = dayKey(),
): Progress {
  return { ...p, stage: [...p.stage, { id: makeId(), date: today, ...entry }].slice(-100) };
}

function makeId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Schließt ein Training ab. Pro Tag gibt es eine Mission: Steht für heute schon eine fest
 * (`existingId`), wird sie höchstens getauscht, sonst kommt die neue dazu.
 */
export function completeSession(
  p: Progress,
  minutes: number,
  mission: { level: number; title: string },
  focus: number[],
  existingId: string | null = null,
  today: string = dayKey(),
): Progress {
  const days = p.days.includes(today) ? p.days : [...p.days, today].sort().slice(-400);
  const existing = existingId ? p.missions.find((m) => m.id === existingId) : undefined;
  const missions = existing
    ? p.missions.map((m) =>
        m.id === existing.id && m.title !== mission.title ? { ...m, level: mission.level, title: mission.title } : m,
      )
    : [...p.missions, { id: makeId(), date: today, level: mission.level, title: mission.title, outcome: null }].slice(-200);
  return {
    ...p,
    days,
    sessions: p.sessions + 1,
    minutes: p.minutes + minutes,
    missions,
    focus,
  };
}
