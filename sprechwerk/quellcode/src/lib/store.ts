import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPTY_PROGRESS, merge, normalize, type Progress } from './progress';

// Speichert den Fortschritt dauerhaft:
// - auf claude.ai im privaten Bereich des Kontos (db-Capability, data/users/<id>/progress),
// - sonst und zusätzlich im Browser dieses Geräts.

const LS_KEY = 'sprechwerk.progress.v1';

export type SyncState = 'connecting' | 'account' | 'device';

type Snapshot = { exists: boolean; data(): Record<string, unknown> | undefined };

interface DocRef {
  get(): Promise<Snapshot>;
  set(data: Record<string, unknown>): Promise<void>;
  onSnapshot(next: (snap: Snapshot) => void, error?: (e: unknown) => void): () => void;
}

interface DbLike {
  doc(path: string): DocRef;
}

interface UserLike {
  id(): Promise<string | null>;
}

function loadLocal(): Progress {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch {
    // Speicher gesperrt oder leer: mit leerem Stand starten.
  }
  return EMPTY_PROGRESS;
}

function saveLocal(p: Progress): void {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {
    // Speicher gesperrt: der Stand lebt dann nur in dieser Sitzung.
  }
}

async function connectAccount(): Promise<DocRef | null> {
  const runtime = window.claude;
  if (!runtime || typeof runtime.use !== 'function') return null;
  try {
    const [db, user] = (await Promise.all([runtime.use('db'), runtime.use('user')])) as [
      DbLike | null,
      UserLike | null,
    ];
    if (!db || !user) return null;
    const uid = await user.id();
    if (!uid) return null;
    return db.doc(`data/users/${uid}/progress`);
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadLocal);
  const [sync, setSync] = useState<SyncState>(() => (window.claude ? 'connecting' : 'device'));
  const current = useRef<Progress>(progress);
  const docRef = useRef<DocRef | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const writing = useRef(false);
  const dirty = useRef(false);

  const flush = useCallback(async () => {
    if (!docRef.current || writing.current) return;
    writing.current = true;
    try {
      while (dirty.current && docRef.current) {
        dirty.current = false;
        const body = current.current as unknown as Record<string, unknown>;
        try {
          await docRef.current.set(body);
        } catch (err) {
          const code = (err as { code?: string } | null)?.code;
          if (code === 'unavailable') {
            await sleep(600 + Math.random() * 900);
            try {
              await docRef.current?.set(current.current as unknown as Record<string, unknown>);
            } catch {
              setSync('device');
            }
          } else {
            docRef.current = null;
            setSync('device');
          }
        }
      }
    } finally {
      writing.current = false;
    }
  }, []);

  const schedule = useCallback(() => {
    if (!docRef.current) return;
    dirty.current = true;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void flush();
    }, 500);
  }, [flush]);

  const update = useCallback(
    (fn: (p: Progress) => Progress) => {
      const next: Progress = { ...fn(current.current), updatedAt: Date.now() };
      current.current = next;
      setProgress(next);
      saveLocal(next);
      schedule();
    },
    [schedule],
  );

  useEffect(() => {
    if (!window.claude) return undefined;
    let alive = true;
    let unsubscribe: (() => void) | undefined;
    (async () => {
      const ref = await connectAccount();
      if (!alive) return;
      if (!ref) {
        setSync('device');
        return;
      }
      try {
        const snap = await ref.get();
        if (!alive) return;
        const remote = snap.exists ? normalize(snap.data()) : null;
        const merged = remote ? merge(remote, current.current) : current.current;
        current.current = merged;
        setProgress(merged);
        saveLocal(merged);
        docRef.current = ref;
        setSync('account');
        const changed = !remote || JSON.stringify(remote) !== JSON.stringify(merged);
        if (changed && (remote !== null || merged.updatedAt > 0)) {
          dirty.current = true;
          void flush();
        }
        unsubscribe = ref.onSnapshot(
          (s) => {
            if (!s.exists) return;
            const incoming = normalize(s.data());
            if (incoming.updatedAt > current.current.updatedAt) {
              current.current = incoming;
              setProgress(incoming);
              saveLocal(incoming);
            }
          },
          () => {
            // Live-Abgleich beendet; Speichern funktioniert weiter.
          },
        );
      } catch {
        if (alive) setSync('device');
      }
    })();
    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [flush]);

  return { progress, update, sync };
}
