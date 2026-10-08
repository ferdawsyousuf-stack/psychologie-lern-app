import { CONTENT, POOLS, WARMUP, type Exercise, type FocusId } from './content';
import { findMission, missionsForLevel, type MissionDef } from './examples';
import { dayKey, missionLevel, openMission, todayMission, type MissionEntry, type Progress } from './lib/progress';
import { rotate } from './lib/rotation';

export type Step =
  /** `pick`: welches Beispiel aus der Liste, `variant`: wie oft die Übung schon dran war. */
  | { kind: 'exercise'; ex: Exercise; pick: number; variant: number }
  | { kind: 'checkin'; mission: MissionEntry }
  /** `existing`: die heute schon angenommene Mission, sonst null. */
  | { kind: 'mission'; mission: MissionDef; existing: MissionEntry | null };

/**
 * Die Mission am Ende: eine pro Tag. Wer mehrmals am Tag trainiert, sieht die Mission von heute
 * wieder. Neue Missionen wechseln innerhalb der Stufe und wiederholen die letzten nicht.
 */
function missionStep(p: Progress, today: string): Step {
  const existing = todayMission(p, today);
  if (existing) {
    const mission = findMission(existing.title) ?? { level: existing.level, title: existing.title, text: 'Deine Mission für heute.' };
    return { kind: 'mission', mission, existing };
  }
  const options = missionsForLevel(missionLevel(p));
  const recent = new Set(p.missions.slice(-Math.max(1, options.length - 1)).map((m) => m.title));
  const fresh = options.filter((o) => !recent.has(o.title));
  const list = fresh.length ? fresh : options;
  return { kind: 'mission', mission: list[p.missions.length % list.length], existing: null };
}

/**
 * Ein Training: Rückblick auf die letzte Mission (falls offen), Aufwärmen mit Atem,
 * eine Übung je gewähltem Bereich (wechselt von Mal zu Mal), am Ende die Mission für den Alltag.
 * Die Beispiele laufen je Übung einmal durch die ganze Liste, bevor sich eines wiederholt.
 */
export function buildSession(focus: FocusId[], p: Progress, today: string = dayKey()): Step[] {
  const n = p.sessions;
  const steps: Step[] = [];
  const open = openMission(p, today);
  if (open) steps.push({ kind: 'checkin', mission: open });
  if (!focus.includes(1)) steps.push({ kind: 'exercise', ex: WARMUP, pick: 0, variant: 0 });
  for (const f of [1, 2, 3, 4] as FocusId[]) {
    if (!focus.includes(f)) continue;
    const pool = POOLS[f];
    const ex = pool[n % pool.length];
    const round = Math.floor(n / pool.length);
    const spec = ex.content ? CONTENT[ex.content] : null;
    const pick = spec ? rotate(spec.list.length, round, spec.salt) : 0;
    steps.push({ kind: 'exercise', ex, pick, variant: round });
  }
  steps.push(missionStep(p, today));
  return steps;
}

export function sessionMinutes(steps: Step[]): number {
  return steps.reduce((sum, s) => sum + (s.kind === 'exercise' ? s.ex.minutes : 0), 0);
}
