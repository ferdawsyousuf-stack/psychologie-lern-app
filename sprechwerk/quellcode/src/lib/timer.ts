import { useCallback, useEffect, useRef, useState } from 'react';

export type TimerState = 'idle' | 'running' | 'paused' | 'done';

export interface TimerApi {
  state: TimerState;
  /** Vergangene ganze Sekunden. */
  sec: number;
  totalMs: number;
  start(): void;
  toggle(): void;
  pause(): void;
  reset(): void;
  /** Ruft `cb` bei jedem Frame mit den vergangenen Millisekunden auf. Gibt eine Abmeldung zurück. */
  onFrame(cb: (ms: number) => void): () => void;
}

// Zeitgeber auf Basis der Systemzeit: bleibt genau, auch wenn der Tab kurz im Hintergrund ist.
export function useTimer(totalMs: number): TimerApi {
  const [state, setState] = useState<TimerState>('idle');
  const [sec, setSec] = useState(0);
  const acc = useRef(0);
  const since = useRef(0);
  const live = useRef(false);
  const listeners = useRef(new Set<(ms: number) => void>());

  const elapsed = () => (live.current ? acc.current + (performance.now() - since.current) : acc.current);
  const emit = (ms: number) => listeners.current.forEach((cb) => cb(ms));

  useEffect(() => {
    if (state !== 'running') return undefined;
    since.current = performance.now();
    live.current = true;
    let raf = 0;
    const finish = () => {
      acc.current = totalMs;
      live.current = false;
      emit(totalMs);
      setSec(Math.floor(totalMs / 1000));
      setState('done');
    };
    const loop = () => {
      const e = elapsed();
      if (e >= totalMs) {
        finish();
        return;
      }
      emit(e);
      setSec(Math.floor(e / 1000));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // Falls der Tab im Hintergrund ist und keine Frames kommen.
    const backup = window.setTimeout(() => {
      if (live.current && elapsed() >= totalMs) {
        cancelAnimationFrame(raf);
        finish();
      }
    }, Math.max(0, totalMs - acc.current) + 80);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(backup);
      if (live.current) {
        acc.current = Math.min(totalMs, elapsed());
        live.current = false;
      }
    };
    // elapsed/emit lesen nur Refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, totalMs]);

  const start = useCallback(() => setState((s) => (s === 'done' ? s : 'running')), []);
  const pause = useCallback(() => setState((s) => (s === 'running' ? 'paused' : s)), []);
  const toggle = useCallback(
    () => setState((s) => (s === 'running' ? 'paused' : s === 'done' ? s : 'running')),
    [],
  );
  const reset = useCallback(() => {
    live.current = false;
    acc.current = 0;
    setSec(0);
    listeners.current.forEach((cb) => cb(0));
    setState('idle');
  }, []);
  const onFrame = useCallback((cb: (ms: number) => void) => {
    listeners.current.add(cb);
    cb(acc.current);
    return () => {
      listeners.current.delete(cb);
    };
  }, []);

  return { state, sec, totalMs, start, toggle, pause, reset, onFrame };
}
