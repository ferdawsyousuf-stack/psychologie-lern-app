import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BookOpen, ExternalLink, Mic, Wind, X } from 'lucide-react';
import { MOMENT_STEPS, MOMENT_WHY, SOURCE_GROUPS, VOICE_STEPS, VOICE_WHY } from '../content';
import { MOMENT_FOCUS, PROMPTS } from '../examples';
import { useLayout, useTopPad } from '../lib/layout';
import { chime } from '../lib/device';
import { usePick } from '../lib/rotation';
import { Background, Pill, PromptCard, RoundButton, StepList, WhyNote, delay } from '../components/ui';
import { BreathControl, SpeakControl } from '../components/controls';
import { SlideToConfirm } from '../components/SlideToConfirm';

function SheetFrame({
  icon,
  title,
  subtitle,
  heading,
  onClose,
  footer,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  heading: string;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
}) {
  const { short } = useLayout();
  const topPad = useTopPad();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sheet-in absolute inset-0 z-40" role="dialog" aria-modal="true" aria-label={title}>
      <Background />
      <div className={`relative z-10 flex h-full flex-col px-6 pb-6 ${topPad}`}>
        <div className={`fade-up flex shrink-0 items-center gap-2 ${short ? 'mb-5' : 'mb-8'}`} style={delay(0.08)}>
          <Pill icon={icon}>{title}</Pill>
          <div className="flex-1" />
          <RoundButton label="Schließen" onClick={onClose}>
            <X size={16} />
          </RoundButton>
        </div>
        <div className="fade-up mb-5 shrink-0" style={delay(0.18)}>
          <p className="mb-1.5 text-[14px] text-white/60">{subtitle}</p>
          <h2 className="balance text-[28px] font-normal leading-tight tracking-tight text-white">{heading}</h2>
        </div>
        <div className="no-scrollbar -mx-6 min-h-0 flex-1 overflow-y-auto px-6">
          <div className="flex min-h-full flex-col">{children}</div>
        </div>
        <div className="fade-up shrink-0 pt-4" style={delay(0.6)}>
          {footer}
        </div>
      </div>
    </div>
  );
}

const iconClass = 'text-white/80';

const randomIndex = (len: number) => Math.floor(Math.random() * len);

/** 25 Sekunden vor einem Gespräch: zweimal seufzen, umdeuten, Blick nach außen (wechselt jedes Mal). */
export function MomentSheet({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState(-1);
  const [steps] = useState(() => [...MOMENT_STEPS, MOMENT_FOCUS[randomIndex(MOMENT_FOCUS.length)]]);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const onStart = () => {
    clearTimers();
    setStage(0);
  };
  const onFinished = () => {
    setStage(1);
    timers.current.push(window.setTimeout(() => setStage(2), 3000));
    timers.current.push(
      window.setTimeout(() => {
        setStage(3);
        chime('end');
      }, 6000),
    );
  };

  const cue =
    stage === 1 ? 'Sag leise: „Ich bin aufgeregt.“' : stage === 2 ? 'Blick nach außen' : stage === 3 ? 'Los. Du bist bereit.' : null;
  const label = stage >= 1 ? (stage === 3 ? 'nochmal' : 'gleich geht’s los') : null;

  return (
    <SheetFrame
      icon={<Wind size={12} className={iconClass} />}
      title="Moment-Hilfe"
      subtitle="25 Sekunden vor einem Gespräch"
      heading="Ruhig rein, Blick nach außen."
      onClose={onClose}
      footer={<SlideToConfirm label="Bereit" onConfirm={onClose} />}
    >
      <div className="fade-up liquid-glass shrink-0 rounded-[32px] p-5" style={delay(0.3)}>
        <StepList steps={steps} active={stage >= 0 ? Math.min(stage, 2) : undefined} />
      </div>
      <div className="fade-up flex min-h-[176px] flex-1 items-center justify-center py-4" style={delay(0.42)}>
        <BreathControl
          cycles={2}
          onStart={onStart}
          onFinished={onFinished}
          cueOverride={cue}
          labelOverride={label}
        />
      </div>
      <div className="shrink-0 pb-1">
        <WhyNote why={MOMENT_WHY.why} source={MOMENT_WHY.source} animDelay={0.5} />
      </div>
    </SheetFrame>
  );
}

/** Freies Sprechen zu einer Frage, mit Aufnahme wo möglich. */
export function VoiceSheet({ onClose }: { onClose: () => void }) {
  const [start] = useState(() => randomIndex(PROMPTS.length));
  const [index, shuffle] = usePick(PROMPTS.length, start);
  return (
    <SheetFrame
      icon={<Mic size={12} className={iconClass} />}
      title="Stimm-Check"
      subtitle="30 Sekunden frei sprechen"
      heading="Erzähl einfach los."
      onClose={onClose}
      footer={<SlideToConfirm label="Fertig" onConfirm={onClose} />}
    >
      <div className="fade-up shrink-0" style={delay(0.3)}>
        <PromptCard label="Deine Frage" prompt={PROMPTS[index]} onShuffle={shuffle} />
      </div>
      <div className="fade-up flex min-h-[176px] flex-1 items-center justify-center py-4" style={delay(0.42)}>
        <SpeakControl seconds={30} />
      </div>
      <div className="fade-up mb-4 shrink-0 px-1" style={delay(0.5)}>
        <p className="mb-2 text-[11px] font-medium text-white/50">Danach</p>
        <StepList steps={VOICE_STEPS} size="sm" />
      </div>
      <div className="shrink-0 pb-1">
        <WhyNote why={VOICE_WHY.why} source={VOICE_WHY.source} animDelay={0.56} collapsible />
      </div>
    </SheetFrame>
  );
}

/** Alle Quellen, nach Fachgebiet. */
export function SourcesSheet({ onClose }: { onClose: () => void }) {
  const count = SOURCE_GROUPS.reduce((n, g) => n + g.items.length, 0);
  return (
    <SheetFrame
      icon={<BookOpen size={12} className={iconClass} />}
      title="Die Wissenschaft"
      subtitle={`${count} Quellen aus ${SOURCE_GROUPS.length} Bereichen`}
      heading="Worauf Sprechwerk aufbaut"
      onClose={onClose}
      footer={<SlideToConfirm label="Zurück" onConfirm={onClose} />}
    >
      <div className="space-y-5 pb-2">
        {SOURCE_GROUPS.map((group, gi) => (
          <section key={group.title} className="fade-up" style={delay(0.28 + gi * 0.06)}>
            <h3 className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white/60">{group.title}</h3>
            <ul className="liquid-glass rounded-[28px] px-4 py-1">
              {group.items.map((item, k) => (
                <li key={item.url} className={k ? 'border-t border-white/10' : undefined}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block py-3">
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-[14px] leading-snug text-white">{item.who}</span>
                      <ExternalLink size={13} className="mt-[3px] shrink-0 text-white/50" />
                    </span>
                    <span className="hyphens mt-1 block text-[12.5px] leading-snug text-white/70">{item.what}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="fade-up hyphens px-1 text-[12px] leading-snug text-white/60" style={delay(0.6)}>
          Sprechwerk ersetzt keine Therapie. Wenn es sich trotz Training festfährt, können Logopädie oder
          Verhaltenstherapie gezielt mit dir üben.
        </p>
      </div>
    </SheetFrame>
  );
}
