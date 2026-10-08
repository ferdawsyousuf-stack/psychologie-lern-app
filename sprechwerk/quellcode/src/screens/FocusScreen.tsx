import { useState } from 'react';
import { Drama } from 'lucide-react';
import { FOCUS_OPTIONS, type FocusId } from '../content';
import { OptionCard, Pill, VoiceOrb, Waveform, delay, pad2 } from '../components/ui';
import { SlideToConfirm } from '../components/SlideToConfirm';
import { useLayout, useTopPad } from '../lib/layout';

/** Startbildschirm: Bereiche wählen, dann Training starten. */
export function FocusScreen({
  initial,
  minutesFor,
  onStart,
  onVoice,
  onOverview,
  onStage,
}: {
  initial: FocusId[];
  minutesFor: (focus: FocusId[]) => number;
  onStart: (focus: FocusId[]) => void;
  onVoice: () => void;
  onOverview: () => void;
  onStage: () => void;
}) {
  const { short } = useLayout();
  const topPad = useTopPad();
  const [selected, setSelected] = useState<FocusId[]>(initial);

  const toggle = (id: FocusId) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id].sort((a, b) => a - b)));

  const minutes = minutesFor(selected);

  return (
    <div
      className={`no-scrollbar relative z-10 flex h-full flex-col overflow-y-auto px-6 pb-6 ${topPad}`}
    >
      <div className={`fade-up flex shrink-0 items-center justify-between ${short ? 'mb-6' : 'mb-10'}`} style={delay(0.1)}>
        <Pill onClick={onOverview} ariaLabel="Sprechwerk Daily: Fortschritt und Moment-Hilfe öffnen">
          Sprechwerk Daily
        </Pill>
        <Pill
          icon={<Drama size={12} className="text-white/80" />}
          onClick={onStage}
          ariaLabel="Bühne öffnen: Auftritt vor Publikum"
        >
          Bühne
        </Pill>
      </div>

      <div className={`fade-up shrink-0 ${short ? 'mb-6' : 'mb-8'}`} style={delay(0.25)}>
        <p className="mb-2 text-[14px] text-white/60">Wähle alles, was zutrifft</p>
        <h1 className="balance text-[28px] font-normal leading-tight tracking-tight text-white">
          Was willst du heute an deinem Sprechen stärken?
        </h1>
      </div>

      <div className="grid shrink-0 grow grid-cols-2 content-start gap-3" role="group" aria-label="Bereiche">
        {FOCUS_OPTIONS.map((option, i) => (
          <OptionCard
            key={option.id}
            number={pad2(i + 1)}
            label={option.label}
            selected={selected.includes(option.id)}
            onToggle={() => toggle(option.id)}
            animDelay={0.4 + i * 0.08}
          />
        ))}
      </div>

      <div className={`fade-up flex shrink-0 flex-col items-center ${short ? 'my-4' : 'my-6'}`} style={delay(0.7)}>
        <VoiceOrb label="Stimm-Check öffnen" onClick={onVoice}>
          <Waveform />
        </VoiceOrb>
        <span className="mt-2 text-[12px] text-white/70">sprechen</span>
      </div>

      <div className="fade-up shrink-0" style={delay(0.85)}>
        <SlideToConfirm
          label={`Los geht’s · ${minutes} Min`}
          blockedLabel={selected.length ? null : 'Wähle mindestens einen Bereich'}
          onConfirm={() => onStart(selected)}
        />
      </div>
    </div>
  );
}
