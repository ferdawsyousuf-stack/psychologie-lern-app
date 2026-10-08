import { BookOpen, Minus, Plus, Wind } from 'lucide-react';
import { dayKey, missionStats, streak, type Progress } from '../lib/progress';
import type { SyncState } from '../lib/store';
import { useLayout, useTopPad } from '../lib/layout';
import { Pill, StatCard, VoiceOrb, delay, fmtSec } from '../components/ui';
import { SlideToConfirm } from '../components/SlideToConfirm';

/** Fortschritt nach dem Training oder über „Sprechwerk Daily“ oben auf dem Startbildschirm. */
export function OverviewScreen({
  mode,
  minutes,
  progress,
  sync,
  onMoment,
  onMoments,
  onSources,
  onClose,
}: {
  mode: 'done' | 'browse';
  minutes: number;
  progress: Progress;
  sync: SyncState;
  onMoment: () => void;
  onMoments: (delta: number) => void;
  onSources: () => void;
  onClose: () => void;
}) {
  const { short } = useLayout();
  const topPad = useTopPad();
  const today = dayKey();
  const days = streak(progress, today);
  const { rated, better } = missionStats(progress);
  const moments = progress.moments[today] ?? 0;

  const subtitle = mode === 'done' ? `Training geschafft · ${minutes} Min` : 'Dein Fortschritt';
  let heading: string;
  if (mode === 'done') {
    heading =
      days >= 2
        ? `Tag ${days} in Folge. Dein Gehirn sammelt Beweise.`
        : progress.sessions <= 1
          ? 'Dein erstes Training ist geschafft.'
          : 'Wieder dabei. Jeder Tag zählt.';
  } else {
    heading =
      progress.sessions === 0
        ? 'Noch kein Training. Das erste dauert rund 7 Minuten.'
        : `${progress.sessions} ${progress.sessions === 1 ? 'Training' : 'Trainings'}, ${progress.minutes} Minuten. Bleib dran.`;
  }

  const syncText = sync === 'account' ? 'Im Konto gespeichert' : sync === 'device' ? 'Nur auf diesem Gerät' : '';

  return (
    <div
      className={`no-scrollbar relative z-10 flex h-full flex-col overflow-y-auto px-6 pb-6 ${topPad}`}
    >
      <div className={`fade-up shrink-0 self-start ${short ? 'mb-6' : 'mb-10'}`} style={delay(0.1)}>
        <Pill>Sprechwerk Daily</Pill>
      </div>

      <div className={`fade-up shrink-0 ${short ? 'mb-5' : 'mb-8'}`} style={delay(0.25)}>
        <p className="mb-2 text-[14px] text-white/60">{subtitle}</p>
        <h1 className="balance text-[28px] font-normal leading-tight tracking-tight text-white">{heading}</h1>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3">
        <StatCard caption="Tage in Folge" value={days} animDelay={0.4} />
        <StatCard caption="Trainings" value={progress.sessions} animDelay={0.48} />
        <StatCard caption="Missionen besser als befürchtet" value={rated ? `${better}/${rated}` : '–'} animDelay={0.56} />
        <StatCard
          caption="Echte Momente heute"
          value={
            <span key={moments} className="pop">
              {moments}
            </span>
          }
          animDelay={0.64}
          action={
            <span className="-mb-1 -mr-1 flex shrink-0 items-center gap-1.5">
              {moments > 0 && (
                <button
                  type="button"
                  aria-label="Einen echten Moment abziehen"
                  onClick={() => onMoments(-1)}
                  className="liquid-glass flex h-8 w-8 items-center justify-center rounded-full text-white/80"
                >
                  <Minus size={14} />
                </button>
              )}
              <button
                type="button"
                aria-label="Einen echten Moment zählen"
                onClick={() => onMoments(1)}
                className="liquid-glass-selected flex h-8 w-8 items-center justify-center rounded-full text-white"
              >
                <Plus size={15} />
              </button>
            </span>
          }
        />
      </div>

      <p className="fade-up hyphens mt-3 shrink-0 px-1 text-[12px] leading-snug text-white/60" style={delay(0.68)}>
        Echter Moment: Du hast spontan etwas Echtes gesagt, so wie bei den Croques.
        {progress.bestExhale > 0 && ` Längster Atem: ${fmtSec(progress.bestExhale)} s.`}
      </p>

      <div className={`fade-up flex shrink-0 grow flex-col items-center justify-center ${short ? 'my-4' : 'my-6'}`} style={delay(0.7)}>
        <VoiceOrb label="Moment-Hilfe vor einem Gespräch öffnen" onClick={onMoment}>
          <Wind size={24} />
        </VoiceOrb>
        <span className="mt-2 text-[12px] text-white/70">moment-hilfe</span>
      </div>

      <div className="fade-up mb-4 flex shrink-0 items-center justify-between gap-3" style={delay(0.78)}>
        <button
          type="button"
          onClick={onSources}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[12px] font-medium text-white/80"
        >
          <BookOpen size={13} />
          Die Wissenschaft dahinter
        </button>
        <span className="min-w-0 truncate text-right text-[11px] text-white/50">{syncText}</span>
      </div>

      <div className="fade-up shrink-0" style={delay(0.85)}>
        <SlideToConfirm label={mode === 'done' ? 'Fertig' : 'Zurück zum Start'} onConfirm={onClose} />
      </div>
    </div>
  );
}
