import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Check, Pause, Play, Plus, RotateCcw, Square } from 'lucide-react';
import { useTimer, type TimerApi } from '../lib/timer';
import { buzz, chime, unlockAudio, useWakeLock } from '../lib/device';
import { useRecorder } from '../lib/recorder';
import { Glow, Waveform, fmtSec, fmtTime } from './ui';

const R = 46;
const CIRC = 2 * Math.PI * R;

/** Ein Zyklus „zyklisches Seufzen“: 2,6 s ein, 0,9 s nachatmen, 6 s aus. */
export const CYCLE_MS = 9500;
const BREATH_CUES = ['Einatmen', 'Oben nachatmen', 'Langsam ausatmen'];

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const easeInOut = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

export function breathAt(ms: number): { phase: number; scale: number } {
  const t = ms % CYCLE_MS;
  if (t < 2600) return { phase: 0, scale: 1 + 0.3 * easeOut(t / 2600) };
  if (t < 3500) return { phase: 1, scale: 1.3 + 0.15 * easeOut((t - 2600) / 900) };
  return { phase: 2, scale: 1.45 - 0.45 * easeInOut((t - 3500) / 6000) };
}

function useRing(timer: TimerApi): RefObject<SVGCircleElement> {
  const ref = useRef<SVGCircleElement>(null);
  const { onFrame, totalMs } = timer;
  useEffect(
    () =>
      onFrame((ms) => {
        const el = ref.current;
        if (!el) return;
        const p = Math.min(1, ms / totalMs);
        el.style.strokeDashoffset = String(CIRC * (1 - p));
        el.style.opacity = p > 0 ? '1' : '0';
      }),
    [onFrame, totalMs],
  );
  return ref;
}

/** Großer runder Glas-Knopf mit Schein, optional mit Fortschrittsring oder Atemkreis. */
function ActionOrb({
  label,
  onClick,
  children,
  ringRef,
  breathRef,
  glowRef,
  buttonProps,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  ringRef?: RefObject<SVGCircleElement>;
  breathRef?: RefObject<HTMLDivElement>;
  glowRef?: RefObject<HTMLDivElement>;
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <div className="relative flex h-[100px] w-[100px] shrink-0 items-center justify-center">
      <Glow glowRef={glowRef} />
      {breathRef && (
        <div
          ref={breathRef}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -ml-8 -mt-8 h-16 w-16 rounded-full border border-white/40 bg-white/10"
        />
      )}
      {ringRef && (
        <svg aria-hidden="true" className="absolute inset-0 -rotate-90" width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <circle
            ref={ringRef}
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
            style={{ opacity: 0 }}
          />
        </svg>
      )}
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        {...buttonProps}
        className="liquid-glass flex h-16 w-16 select-none items-center justify-center rounded-full text-white"
        style={{ touchAction: 'manipulation' }}
      >
        {children}
      </button>
    </div>
  );
}

const playIcon = <Play size={22} className="translate-x-[1px]" />;

/** Geführte Atmung mit wachsendem und schrumpfendem Kreis. */
export function BreathControl({
  cycles,
  onStart,
  onFinished,
  cueOverride = null,
  labelOverride = null,
}: {
  cycles: number;
  onStart?: () => void;
  onFinished?: () => void;
  cueOverride?: string | null;
  labelOverride?: string | null;
}) {
  const totalMs = cycles * CYCLE_MS;
  const timer = useTimer(totalMs);
  const { state, sec, onFrame } = timer;
  const breathRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const finished = useRef(onFinished);
  finished.current = onFinished;
  useWakeLock(state === 'running');

  useEffect(
    () =>
      onFrame((ms) => {
        const b = breathAt(ms);
        if (breathRef.current) breathRef.current.style.transform = `scale(${b.scale.toFixed(3)})`;
        if (glowRef.current) {
          glowRef.current.style.transform = `translate(-50%, -50%) scale(${(0.9 + (b.scale - 1) * 0.5).toFixed(3)})`;
        }
        setPhase(b.phase);
      }),
    [onFrame],
  );

  useEffect(() => {
    if (state !== 'done') return;
    chime('end');
    buzz(40);
    finished.current?.();
  }, [state]);

  const handle = () => {
    unlockAudio();
    if (state === 'done') {
      timer.reset();
      timer.start();
      onStart?.();
      return;
    }
    if (state === 'idle') onStart?.();
    timer.toggle();
  };

  const remaining = totalMs / 1000 - sec;
  const cue =
    cueOverride ??
    (state === 'idle'
      ? 'Tippe zum Starten'
      : state === 'paused'
        ? 'Pausiert'
        : state === 'done'
          ? 'Geschafft. Spür kurz nach.'
          : BREATH_CUES[phase]);
  const label =
    labelOverride ??
    (state === 'idle'
      ? `start · ${fmtTime(totalMs / 1000)}`
      : state === 'done'
        ? 'nochmal'
        : `${state === 'paused' ? 'pausiert · ' : ''}${fmtTime(remaining)}`);

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 h-5 text-center text-[13px] text-white/90">{cue}</p>
      <ActionOrb
        label={state === 'running' ? 'Pause' : state === 'done' ? 'Nochmal' : 'Atemübung starten'}
        onClick={handle}
        breathRef={breathRef}
        glowRef={glowRef}
      >
        {state === 'running' ? <Pause size={22} /> : state === 'done' ? <RotateCcw size={20} /> : playIcon}
      </ActionOrb>
      <p className="mt-2 text-[12px] tabular-nums text-white/70">{label}</p>
    </div>
  );
}

/** Zeitgeber mit Ring, optional mit Phasen (Aufmerksamkeitstraining) oder Zähler (Meditation). */
export function TimerControl({
  seconds,
  phases,
  counterLabel,
}: {
  seconds: number;
  phases?: { at: number; label: string }[];
  counterLabel?: string;
}) {
  const timer = useTimer(seconds * 1000);
  const { state, sec } = timer;
  const ringRef = useRing(timer);
  const [count, setCount] = useState(0);
  useWakeLock(state === 'running');

  const phaseIndex = phases ? phases.reduce((acc, p, i) => (sec >= p.at ? i : acc), 0) : 0;
  const lastPhase = useRef(phaseIndex);
  useEffect(() => {
    if (phases && state === 'running' && phaseIndex !== lastPhase.current) {
      chime('soft');
      buzz(15);
    }
    lastPhase.current = phaseIndex;
  }, [phaseIndex, state, phases]);

  useEffect(() => {
    if (state !== 'done') return;
    chime('end');
    buzz(40);
  }, [state]);

  const handle = () => {
    unlockAudio();
    if (state === 'done') {
      timer.reset();
      timer.start();
      setCount(0);
      return;
    }
    timer.toggle();
  };

  const remaining = seconds - sec;
  const cue =
    state === 'done'
      ? 'Geschafft.'
      : phases
        ? `${phaseIndex + 1}/${phases.length} · ${phases[phaseIndex].label}`
        : state === 'idle'
          ? 'Tippe zum Starten'
          : state === 'paused'
            ? 'Pausiert'
            : 'Nur der Atem';
  const label =
    state === 'idle'
      ? `start · ${fmtTime(seconds)}`
      : state === 'done'
        ? 'nochmal'
        : `${state === 'paused' ? 'pausiert · ' : ''}${fmtTime(remaining)}`;

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 h-5 text-center text-[13px] text-white/90">{cue}</p>
      <ActionOrb
        label={state === 'running' ? 'Pause' : state === 'done' ? 'Nochmal' : 'Timer starten'}
        onClick={handle}
        ringRef={ringRef}
      >
        {state === 'running' ? <Pause size={22} /> : state === 'done' ? <RotateCcw size={20} /> : playIcon}
      </ActionOrb>
      <p className="mt-2 text-[12px] tabular-nums text-white/70">{label}</p>
      {counterLabel && (
        <button
          type="button"
          onClick={() => {
            setCount((c) => c + 1);
            buzz(10);
          }}
          className="liquid-glass mt-4 inline-flex items-center gap-2 rounded-full py-2 pl-3 pr-4 text-[12px] font-medium text-white/90"
        >
          <Plus size={13} />
          {counterLabel}
          <span key={count} className="pop tabular-nums text-white">
            {count}
          </span>
        </button>
      )}
    </div>
  );
}

/** Hörbarer Laut beim Ausatmen: „sss“ wird zu „sssss …“, „sch“ zu „schhh …“. */
const drawnOut = (sound: string) => `„${sound}${sound[sound.length - 1].repeat(2)} …“`;

/** Ausatmen auf einen Laut („sss“, „fff“, „sch“): Kreis gedrückt halten, die Zeit wird gemessen. */
export function HoldControl({
  rounds = 5,
  best,
  onRound,
  sound = 'sss',
}: {
  rounds?: number;
  best: number;
  onRound: (seconds: number) => void;
  sound?: string;
}) {
  const [holding, setHolding] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const live = useRef<HTMLSpanElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const startedAt = useRef(0);
  const holdingRef = useRef(false);
  useWakeLock(holding);

  useEffect(() => {
    if (!holding) return undefined;
    let raf = 0;
    const loop = () => {
      const s = (performance.now() - startedAt.current) / 1000;
      if (live.current) live.current.textContent = fmtSec(s);
      if (ring.current) {
        ring.current.style.strokeDashoffset = String(CIRC * (1 - Math.min(1, s / 30)));
        ring.current.style.opacity = '1';
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [holding]);

  const finished = results.length >= rounds;

  const begin = () => {
    if (finished || holdingRef.current) return;
    unlockAudio();
    holdingRef.current = true;
    startedAt.current = performance.now();
    setHolding(true);
    buzz(15);
  };

  const end = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    if (ring.current) ring.current.style.opacity = '0';
    const s = (performance.now() - startedAt.current) / 1000;
    if (s < 1) return;
    const value = Math.round(s * 10) / 10;
    setResults((r) => [...r, value]);
    onRound(value);
    chime('soft');
  };

  const record = Math.max(best, 0, ...results);
  const cue = holding
    ? drawnOut(sound)
    : finished
      ? 'Fünf Runden geschafft.'
      : `Runde ${results.length + 1} von ${rounds} · Kreis gedrückt halten`;

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 h-5 text-center text-[13px] text-white/90">{cue}</p>
      <ActionOrb
        label={`Gedrückt halten und auf ${sound} ausatmen`}
        onClick={() => undefined}
        ringRef={ring}
        buttonProps={{
          onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            begin();
          },
          onPointerUp: end,
          onPointerCancel: end,
          onLostPointerCapture: end,
          onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              begin();
            }
          },
          onKeyUp: (e: ReactKeyboardEvent<HTMLButtonElement>) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              end();
            }
          },
          onContextMenu: (e: ReactMouseEvent<HTMLButtonElement>) => e.preventDefault(),
        }}
      >
        {holding ? (
          <span ref={live} className="text-[15px] font-medium tabular-nums">
            0,0
          </span>
        ) : finished ? (
          <Check size={22} />
        ) : (
          <Waveform size={22} />
        )}
      </ActionOrb>
      <p className="mt-2 text-[12px] tabular-nums text-white/70">
        {record > 0 ? `Rekord ${fmtSec(record)} s` : 'Noch kein Rekord'}
      </p>
      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: rounds }, (_, i) => (
          <span
            key={i}
            className={`min-w-[44px] rounded-full px-2 py-1 text-center text-[11px] tabular-nums ${
              results[i] !== undefined ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'
            }`}
          >
            {results[i] !== undefined ? fmtSec(results[i]) : '–'}
          </span>
        ))}
      </div>
    </div>
  );
}

type SpeakMode = 'idle' | 'rec' | 'review' | 'talk';

/**
 * Sprechen mit automatischer Aufnahme: Ein Tipp startet Sprechzeit und Aufnahme zugleich,
 * am Ende der Zeit stoppt beides, danach kannst du reinhören. Wo das Mikrofon gesperrt ist
 * (innerhalb von claude.ai), läuft nur die Sprechzeit, und die Sprachmemo-App übernimmt.
 */
export function SpeakControl({ seconds, reading = false }: { seconds: number; reading?: boolean }) {
  const { available, state: recState, playing, start: startRec, stop: stopRec, togglePlay, clear } = useRecorder();
  const [mode, setMode] = useState<SpeakMode>('idle');
  const [recorded, setRecorded] = useState(0);
  const timer = useTimer(seconds * 1000);
  const { state, sec, reset, start, pause, toggle } = timer;
  const ringRef = useRing(timer);
  useWakeLock(state === 'running');

  // Zeit abgelaufen: Aufnahme beenden oder das Ende anzeigen.
  useEffect(() => {
    if (state !== 'done') return;
    if (mode === 'rec') {
      setRecorded(seconds);
      stopRec();
    }
    if (mode === 'talk') {
      chime('end');
      buzz(40);
    }
  }, [state, mode, seconds, stopRec]);

  // Aufnahme abgeschlossen: zum Reinhören wechseln.
  useEffect(() => {
    if (mode !== 'rec') return;
    if (recState === 'ready') {
      setMode('review');
      reset();
      chime('soft');
    } else if (recState === 'idle') {
      setMode('idle');
      reset();
    }
  }, [mode, recState, reset]);

  const startTalk = () => {
    setMode('talk');
    reset();
    start();
  };

  const begin = async () => {
    unlockAudio();
    if (available && (await startRec())) {
      setMode('rec');
      reset();
      start();
      return;
    }
    startTalk();
  };

  const again = () => {
    clear();
    setMode('idle');
    reset();
  };

  const handle = () => {
    if (recState === 'starting') return;
    if (mode === 'idle') void begin();
    else if (mode === 'rec') {
      setRecorded(sec);
      pause();
      stopRec();
    } else if (mode === 'review') togglePlay();
    else if (state === 'done') {
      unlockAudio();
      startTalk();
    } else toggle();
  };

  const remaining = seconds - sec;
  let icon: ReactNode;
  let cue: string;
  let label: string;
  let aria: string;
  if (recState === 'starting') {
    icon = <Waveform size={24} />;
    cue = 'Mikrofon startet …';
    label = 'einen Moment';
    aria = 'Mikrofon startet';
  } else if (mode === 'rec') {
    icon = <Square size={18} className="fill-white" />;
    cue = 'Aufnahme läuft';
    label = `aufnahme · ${fmtTime(remaining)}`;
    aria = 'Aufnahme stoppen';
  } else if (mode === 'review') {
    icon = playing ? <Pause size={22} /> : playIcon;
    cue = 'Hör zu wie eine fremde Person';
    label = playing ? 'läuft …' : `anhören · ${fmtTime(recorded)}`;
    aria = playing ? 'Wiedergabe pausieren' : 'Aufnahme anhören';
  } else if (mode === 'talk') {
    icon = state === 'running' ? <Pause size={22} /> : state === 'done' ? <RotateCcw size={20} /> : playIcon;
    cue = state === 'done' ? 'Geschafft.' : state === 'paused' ? 'Pausiert' : reading ? 'Lies laut' : 'Du sprichst';
    label = state === 'done' ? 'nochmal' : `${state === 'paused' ? 'pausiert · ' : ''}${fmtTime(remaining)}`;
    aria = state === 'running' ? 'Pause' : state === 'done' ? 'Nochmal' : 'Weiter';
  } else {
    icon = <Waveform size={24} />;
    cue = available ? (reading ? 'Tippe und lies laut' : 'Tippe und sprich') : `Tippe, dann ${reading ? 'lies laut' : 'sprich los'}`;
    label = available ? 'aufnehmen' : reading ? 'lies los' : 'sprich los';
    aria = available ? 'Aufnahme starten' : 'Sprechzeit starten';
  }

  let hint: string | null = null;
  if (!available) hint = 'Tipp: Nimm parallel mit der Sprachmemo-App auf.';
  else if (mode === 'idle') hint = 'Nimmt automatisch auf. Danach reinhören.';

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 h-5 text-center text-[13px] text-white/90">
        {mode === 'rec' && <span aria-hidden="true" className="rec-dot mr-1.5 inline-block h-2 w-2 rounded-full bg-[#ff5a4f] align-middle" />}
        {cue}
      </p>
      <ActionOrb label={aria} onClick={handle} ringRef={ringRef}>
        {icon}
      </ActionOrb>
      <div className="mt-2 flex items-center gap-3 text-[12px] tabular-nums text-white/70">
        <span>{label}</span>
        {mode === 'review' && (
          <button type="button" onClick={again} className="inline-flex items-center gap-1 font-medium text-white/90">
            <RotateCcw size={12} />
            neu
          </button>
        )}
      </div>
      {hint && <p className="mt-2 max-w-[300px] text-center text-[11.5px] leading-snug text-white/60">{hint}</p>}
    </div>
  );
}
