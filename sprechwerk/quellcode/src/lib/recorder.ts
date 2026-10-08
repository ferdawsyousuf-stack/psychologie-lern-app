import { useCallback, useEffect, useRef, useState } from 'react';
import { micSupported } from './device';

// Aufnahme fürs Sprechen: startet mit der Sprechzeit, endet mit ihr, danach reinhören.
// Wo der Browser das Mikrofon sperrt (z. B. innerhalb von claude.ai), meldet `available` false
// und die App läuft mit Sprechzeit ohne Aufnahme weiter.

export type RecorderState = 'idle' | 'starting' | 'recording' | 'ready';

export interface RecorderApi {
  /** Mikrofon nutzbar. Wird false, sobald ein Zugriff scheitert. */
  available: boolean;
  state: RecorderState;
  /** Die letzte Aufnahme, abspielbar. */
  url: string | null;
  playing: boolean;
  /** Startet die Aufnahme. Liefert false, wenn das Mikrofon nicht zur Verfügung steht. */
  start(): Promise<boolean>;
  stop(): void;
  /** Abspielen oder pausieren. */
  togglePlay(): void;
  /** Aufnahme verwerfen. */
  clear(): void;
}

const AUDIO: MediaTrackConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };

export function useRecorder(): RecorderApi {
  const [available, setAvailable] = useState(micSupported);
  const [state, setState] = useState<RecorderState>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const audio = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const stopWanted = useRef(false);
  const discard = useRef(false);
  const alive = useRef(true);

  const releaseStream = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };

  const setRecording = (next: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next;
    setUrl(next);
  };

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      const r = recorder.current;
      if (r && r.state !== 'inactive') {
        r.onstop = null;
        try {
          r.stop();
        } catch {
          // bereits gestoppt
        }
      }
      releaseStream();
      audio.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    if (!available) return false;
    const current = recorder.current;
    if (current && current.state === 'recording') return true;
    audio.current?.pause();
    stopWanted.current = false;
    discard.current = false;
    setState('starting');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: AUDIO });
      if (!alive.current || stopWanted.current) {
        s.getTracks().forEach((t) => t.stop());
        if (alive.current) setState('idle');
        return false;
      }
      stream.current = s;
      chunks.current = [];
      const r = new MediaRecorder(s);
      recorder.current = r;
      r.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.current.push(e.data);
      };
      r.onstop = () => {
        releaseStream();
        recorder.current = null;
        if (!alive.current) return;
        if (discard.current) {
          discard.current = false;
          setState('idle');
          return;
        }
        if (chunks.current.length) {
          setRecording(URL.createObjectURL(new Blob(chunks.current, { type: r.mimeType || 'audio/webm' })));
          setState('ready');
        } else {
          setState('idle');
        }
      };
      r.start();
      setState('recording');
      return true;
    } catch {
      releaseStream();
      if (alive.current) {
        setAvailable(false);
        setState('idle');
      }
      return false;
    }
  }, [available]);

  const stop = useCallback(() => {
    stopWanted.current = true;
    const r = recorder.current;
    if (r && r.state !== 'inactive') {
      try {
        r.stop();
      } catch {
        releaseStream();
      }
    }
  }, []);

  const togglePlay = useCallback(() => {
    const src = urlRef.current;
    if (!src) return;
    let a = audio.current;
    if (!a) {
      a = new Audio();
      a.onplay = () => setPlaying(true);
      a.onpause = () => setPlaying(false);
      a.onended = () => setPlaying(false);
      audio.current = a;
    }
    if (a.src !== src) a.src = src;
    if (a.paused) void a.play().catch(() => setPlaying(false));
    else a.pause();
  }, []);

  const clear = useCallback(() => {
    const r = recorder.current;
    if (r && r.state !== 'inactive') discard.current = true;
    stop();
    audio.current?.pause();
    setPlaying(false);
    setRecording(null);
    setState('idle');
  }, [stop]);

  return { available, state, url, playing, start, stop, togglePlay, clear };
}
