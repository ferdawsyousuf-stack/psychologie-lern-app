import { useEffect, useState } from 'react';
import { Share, SquarePlus } from 'lucide-react';
import { useInstall } from '../lib/install';

/**
 * Hinweis „Sprechwerk als App“: erscheint einmal kurz nach dem Öffnen im Browser,
 * nie in der installierten App. Android/Chrome: Installieren-Knopf. iPhone: zwei Schritte.
 */
export function InstallSheet() {
  const { mode, install, later } = useInstall();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 1400);
    return () => window.clearTimeout(t);
  }, []);

  if (mode === 'none' || !ready) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-black/25 p-3 pb-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sprechwerk als App installieren"
    >
      <div className="sheet-in install-card w-full rounded-[32px] p-5 text-white">
        <div className="flex items-center gap-3.5">
          <img src="icons/icon-192.png" alt="" className="h-14 w-14 shrink-0 rounded-[14px]" />
          <div className="min-w-0">
            <p className="text-[17px] font-medium leading-tight">Sprechwerk als App</p>
            <p className="mt-1 text-[13px] leading-snug text-white/75">
              Eigenes Symbol auf dem Startbildschirm. Startet sofort, auch ohne Internet.
            </p>
          </div>
        </div>

        {mode === 'ios' && (
          <ol className="mt-4 space-y-2.5 text-[14px] leading-snug text-white/90">
            <li className="flex items-center gap-3">
              <span className="install-step">1</span>
              <span>
                In Safari unten auf <Share size={15} className="mx-0.5 inline-block -translate-y-[2px]" /> Teilen tippen
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="install-step">2</span>
              <span>
                <SquarePlus size={15} className="mr-1 inline-block -translate-y-[2px]" />
                „Zum Home-Bildschirm“ wählen
              </span>
            </li>
          </ol>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={later} className="rounded-full px-4 py-2.5 text-[14px] text-white/80">
            {mode === 'ios' ? 'Verstanden' : 'Später'}
          </button>
          {mode === 'prompt' && (
            <button
              type="button"
              onClick={() => void install()}
              className="rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#1a1a1e]"
            >
              Installieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
