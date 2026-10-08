import { useEffect } from 'react';

// Ton, Vibration, Bildschirm-Wachhalten und Mikrofon-Erkennung.
// Alles ist optional: Wenn der Browser etwas verweigert, läuft die App ohne weiter.

let ctx: AudioContext | null = null;

/** Muss aus einem Tipp heraus aufgerufen werden, sonst blockiert der Browser den Ton. */
export function unlockAudio(): void {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

/** Sanfter Glockenton: 'end' am Ende einer Übung, 'soft' als Zwischensignal. */
export function chime(kind: 'end' | 'soft' = 'end'): void {
  const c = ctx;
  if (!c) return;
  try {
    const now = c.currentTime;
    const notes = kind === 'end' ? [659.25, 987.77] : [880];
    const peak = kind === 'end' ? 0.16 : 0.07;
    const length = kind === 'end' ? 1.4 : 0.35;
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.16;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + length + 0.05);
    });
  } catch {
    // Kein Ton möglich.
  }
}

export function buzz(ms = 20): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Vibration nicht erlaubt.
  }
}

type WakeLockSentinelLike = { release(): Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request(type: 'screen'): Promise<WakeLockSentinelLike> };
};

/** Hält den Bildschirm wach, solange eine Übung läuft. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    let sentinel: WakeLockSentinelLike | null = null;
    const nav = navigator as WakeLockNavigator;
    nav.wakeLock
      ?.request('screen')
      .then((s) => {
        if (cancelled) void s.release().catch(() => undefined);
        else sentinel = s;
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (sentinel) void sentinel.release().catch(() => undefined);
    };
  }, [active]);
}

type PolicyDocument = Document & {
  permissionsPolicy?: { allowsFeature(feature: string): boolean };
  featurePolicy?: { allowsFeature(feature: string): boolean };
};

/**
 * Ob Aufnehmen hier möglich ist. Innerhalb von claude.ai gibt der Rahmen der App das Mikrofon
 * nicht frei; als eigene Datei oder Webseite fragt der Browser einmal nach.
 */
export function micSupported(): boolean {
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') return false;
  if (typeof window.MediaRecorder === 'undefined') return false;
  const doc = document as PolicyDocument;
  const policy = doc.permissionsPolicy ?? doc.featurePolicy;
  if (policy && typeof policy.allowsFeature === 'function') return policy.allowsFeature('microphone');
  // Browser ohne Policy-Abfrage (Safari): Im Rahmen von claude.ai ist das Mikrofon nicht freigegeben.
  return !window.claude;
}
