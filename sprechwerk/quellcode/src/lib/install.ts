import { useEffect, useState } from 'react';

// Installation als App auf dem Startbildschirm. Nur in der Web-App-Version (__PWA__),
// nie innerhalb von claude.ai oder in der Datei-Version.

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

// Früh lauschen: Chrome meldet die Installierbarkeit oft, bevor React die Seite zeigt.
if (__PWA__ && typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    notify();
  });
}

/** Läuft die App gerade als installierte App (vom Startbildschirm gestartet)? */
export function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return Boolean(window.matchMedia?.('(display-mode: standalone)').matches) || nav.standalone === true;
}

export function isIOS(): boolean {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

const LATER_KEY = 'sprechwerk.install.later';
const LATER_MS = 3 * 24 * 60 * 60 * 1000;

function askedRecently(): boolean {
  try {
    const t = Number(window.localStorage.getItem(LATER_KEY));
    return t > 0 && Date.now() - t < LATER_MS;
  } catch {
    return false;
  }
}

export type InstallMode = 'none' | 'prompt' | 'ios';

/**
 * Was die App zum Installieren anbieten kann: einen Installieren-Knopf (Android, Chrome, Edge)
 * oder die zwei Schritte über „Teilen“ (iPhone, iPad).
 */
export function useInstall(): { mode: InstallMode; install: () => Promise<void>; later: () => void } {
  const [, rerender] = useState(0);
  const [hidden, setHidden] = useState(askedRecently);

  useEffect(() => {
    const onChange = () => rerender((n) => n + 1);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  let mode: InstallMode = 'none';
  if (__PWA__ && !hidden && !installed && !isStandalone()) {
    if (deferred) mode = 'prompt';
    else if (isIOS()) mode = 'ios';
  }

  const install = async () => {
    const e = deferred;
    if (!e) return;
    deferred = null;
    try {
      await e.prompt();
      await e.userChoice;
    } catch {
      // Abgebrochen: beim nächsten Mal wieder anbieten.
    }
    notify();
  };

  const later = () => {
    try {
      window.localStorage.setItem(LATER_KEY, String(Date.now()));
    } catch {
      // Speicher gesperrt: dann nur für diesen Besuch ausblenden.
    }
    setHidden(true);
  };

  return { mode, install, later };
}

/** Service Worker anmelden (Offline-Start) und den Speicher der installierten App dauerhaft halten. */
export function setupWebApp(): void {
  if (!__PWA__) return;
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => undefined);
    });
  }
  if (isStandalone()) {
    navigator.storage?.persist?.().catch(() => undefined);
  }
}
