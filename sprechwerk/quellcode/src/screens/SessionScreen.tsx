import { useState, type ReactNode } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { CHECKIN_WHY, CONTENT, MISSION_ROUTINE, MISSION_WHY, OUTCOMES, type Exercise } from '../content';
import { HOLD_SOUNDS, MEDITATION_ANCHORS, missionsForLevel, type MissionDef } from '../examples';
import { formatDay, type MissionEntry, type Outcome } from '../lib/progress';
import { usePick } from '../lib/rotation';
import type { Step } from '../session';
import { useLayout, useTopPad } from '../lib/layout';
import {
  CardHeader,
  OptionCard,
  Pill,
  PracticeText,
  PromptCard,
  RoundButton,
  ShuffleButton,
  StepList,
  WhyNote,
  delay,
  pad2,
} from '../components/ui';
import { BreathControl, HoldControl, SpeakControl, TimerControl } from '../components/controls';
import { SlideToConfirm } from '../components/SlideToConfirm';

interface FrameProps {
  index: number;
  total: number;
  onBack: () => void;
  onExit: () => void;
}

function StepFrame({
  frame,
  tag,
  title,
  footer,
  children,
}: {
  frame: FrameProps;
  tag: string;
  title: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  const { short } = useLayout();
  const topPad = useTopPad();
  const { index, total, onBack, onExit } = frame;
  return (
    <div className={`relative z-10 flex h-full flex-col px-6 pb-6 ${topPad}`}>
      <div className={`fade-up flex shrink-0 items-center gap-2 ${short ? 'mb-3' : 'mb-4'}`} style={delay(0.1)}>
        {index > 0 && (
          <RoundButton label="Zurück" onClick={onBack}>
            <ChevronLeft size={16} />
          </RoundButton>
        )}
        <Pill>
          Training · {index + 1} / {total}
        </Pill>
        <div className="flex-1" />
        <RoundButton label="Training beenden" onClick={onExit}>
          <X size={16} />
        </RoundButton>
      </div>

      <div className={`fade-up flex shrink-0 gap-1.5 ${short ? 'mb-4' : 'mb-6'}`} style={delay(0.15)} aria-hidden="true">
        {Array.from({ length: total }, (_, k) => (
          <div
            key={k}
            className={`h-1 flex-1 rounded-full ${k < index ? 'bg-white/80' : k === index ? 'bg-white/50' : 'bg-white/20'}`}
          />
        ))}
      </div>

      <div className={`fade-up shrink-0 ${short ? 'mb-3' : 'mb-4'}`} style={delay(0.25)}>
        <p className="mb-1.5 text-[14px] text-white/60">{tag}</p>
        <h1 className="balance text-[28px] font-normal leading-tight tracking-tight text-white">{title}</h1>
      </div>

      <div className="no-scrollbar -mx-6 min-h-0 flex-1 overflow-y-auto px-6">
        <div className="flex min-h-full flex-col">{children}</div>
      </div>

      <div className="fade-up shrink-0 pt-4" style={delay(0.85)}>
        {footer}
      </div>
    </div>
  );
}

function ExerciseStep({
  ex,
  pick,
  variant,
  frame,
  bestExhale,
  onBest,
  onNext,
}: {
  ex: Exercise;
  pick: number;
  variant: number;
  frame: FrameProps;
  bestExhale: number;
  onBest: (seconds: number) => void;
  onNext: () => void;
}) {
  const spec = ex.content ? CONTENT[ex.content] : null;
  const [index, shuffle] = usePick(spec ? spec.list.length : 0, pick);
  const item = spec ? spec.list[index] : null;
  const speak = ex.kind === 'speak';
  const sound = HOLD_SOUNDS[variant % HOLD_SOUNDS.length];
  const anchor = MEDITATION_ANCHORS[variant % MEDITATION_ANCHORS.length];
  const steps = ex.steps.map((s) => s.replace('{laut}', sound).replace('{anker}', anchor));

  let card: ReactNode;
  if (spec && item && spec.reading) {
    card = (
      <div className="liquid-glass rounded-[32px] px-5 py-[18px]" aria-live="polite">
        <CardHeader label={spec.label} shuffleLabel={spec.shuffle} onShuffle={shuffle} />
        <div key={index} className="fade-up">
          <PracticeText text={item} emphasis={Boolean(spec.marked)} />
        </div>
      </div>
    );
  } else if (spec && item) {
    card = (
      <PromptCard
        label={spec.label}
        prompt={item}
        onShuffle={shuffle}
        shuffleLabel={spec.shuffle}
        marked={spec.marked}
        quote={spec.quote}
      />
    );
  } else {
    card = (
      <div className="liquid-glass rounded-[32px] p-5">
        <StepList steps={steps} />
      </div>
    );
  }

  return (
    <StepFrame frame={frame} tag={ex.tag} title={ex.title} footer={<SlideToConfirm label="Geschafft" onConfirm={onNext} />}>
      <div className="fade-up shrink-0" style={delay(0.4)}>
        {card}
        {speak && (
          <div className="mt-3 px-1">
            <StepList steps={steps} size="sm" />
          </div>
        )}
      </div>

      <div className="fade-up flex min-h-[176px] flex-1 items-center justify-center py-4" style={delay(0.55)}>
        {ex.kind === 'breath' && <BreathControl cycles={ex.cycles ?? 6} />}
        {ex.kind === 'timer' && <TimerControl seconds={ex.seconds} phases={ex.phases} counterLabel={ex.counterLabel} />}
        {ex.kind === 'hold' && <HoldControl best={bestExhale} onRound={onBest} sound={sound} />}
        {ex.kind === 'speak' && <SpeakControl seconds={ex.seconds} reading={Boolean(spec?.reading)} />}
      </div>

      <div className="shrink-0 pb-1">
        <WhyNote why={ex.why} source={ex.source} collapsible={speak} />
      </div>
    </StepFrame>
  );
}

function CheckinStep({
  mission,
  frame,
  onDone,
}: {
  mission: MissionEntry;
  frame: FrameProps;
  onDone: (outcome: Outcome) => void;
}) {
  const [choice, setChoice] = useState<Outcome | null>(null);
  return (
    <StepFrame
      frame={frame}
      tag="Verhaltenstherapie · Rückblick"
      title="Wie lief deine letzte Mission?"
      footer={<SlideToConfirm label={choice ? 'Weiter' : 'Überspringen'} onConfirm={() => onDone(choice ?? 'skipped')} />}
    >
      <div className="fade-up liquid-glass mb-3 shrink-0 rounded-[28px] px-5 py-4" style={delay(0.35)}>
        <span className="text-[11px] font-medium text-white/50">
          {formatDay(mission.date)} · Stufe {mission.level}
        </span>
        <p className="mt-1 text-[17px] leading-snug text-white">{mission.title}</p>
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-3" role="radiogroup" aria-label="Wie lief es?">
        {OUTCOMES.map((o, i) => (
          <OptionCard
            key={o.id}
            single
            number={pad2(i + 1)}
            label={o.label}
            selected={choice === o.id}
            onToggle={() => setChoice((c) => (c === o.id ? null : o.id))}
            animDelay={0.4 + i * 0.08}
            height={88}
          />
        ))}
      </div>
      <div className="min-h-[16px] flex-1" />
      <div className="shrink-0 pb-1 pt-4">
        <WhyNote why={CHECKIN_WHY.why} source={CHECKIN_WHY.source} />
      </div>
    </StepFrame>
  );
}

/**
 * Mission für den Alltag. Pro Tag eine: Beim ersten Training des Tages wird sie angenommen,
 * bei jedem weiteren erscheint sie als Erinnerung. Mit „Andere Mission“ lässt sie sich
 * innerhalb derselben Stufe tauschen.
 */
function MissionStep({
  mission,
  existing,
  frame,
  onAccept,
}: {
  mission: MissionDef;
  existing: MissionEntry | null;
  frame: FrameProps;
  onAccept: (mission: MissionDef) => void;
}) {
  const options = missionsForLevel(mission.level);
  const start = options.findIndex((o) => o.title === mission.title);
  const [index, shuffle] = usePick(options.length, Math.max(0, start));
  const [touched, setTouched] = useState(false);
  const current = (touched || start >= 0) && options[index] ? options[index] : mission;
  const changed = current.title !== mission.title;
  const onShuffle =
    options.length > 1
      ? () => {
          setTouched(true);
          shuffle();
        }
      : undefined;
  const slideLabel = existing ? (changed ? 'Mission tauschen' : 'Fertig') : 'Mission annehmen';

  return (
    <StepFrame
      frame={frame}
      tag={existing ? 'Deine Mission für heute · Alltag' : 'Mission des Tages · Alltag'}
      title={current.title}
      footer={<SlideToConfirm label={slideLabel} onConfirm={() => onAccept(current)} />}
    >
      <div className="fade-up liquid-glass shrink-0 rounded-[32px] p-5" style={delay(0.4)} aria-live="polite">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[11px] font-medium text-white/50">
            Stufe {current.level} von 5
            <span className="flex gap-1" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((l) => (
                <span key={l} className={`h-1.5 w-1.5 rounded-full ${l <= current.level ? 'bg-white/90' : 'bg-white/25'}`} />
              ))}
            </span>
          </span>
          {onShuffle && <ShuffleButton label="Andere Mission" onClick={onShuffle} />}
        </div>
        <p key={current.title} className="fade-up hyphens text-[18px] leading-snug text-white">
          {current.text}
        </p>
      </div>

      {existing && (
        <p className="fade-up hyphens mt-3 shrink-0 px-1 text-[12.5px] leading-snug text-white/70" style={delay(0.5)}>
          Heute schon angenommen. Ab morgen fragt dich die App, wie es lief.
        </p>
      )}

      <ol className="fade-up mt-5 shrink-0 space-y-3 px-1" style={delay(0.55)}>
        {MISSION_ROUTINE.map((r) => (
          <li key={r.label} className="flex gap-3">
            <span className="w-[54px] shrink-0 pt-[2px] text-[11px] font-medium text-white/50">{r.label}</span>
            <span className="hyphens text-[14px] leading-snug text-white/90">{r.text}</span>
          </li>
        ))}
      </ol>

      <div className="min-h-[16px] flex-1" />
      <div className="shrink-0 pb-1 pt-4">
        <WhyNote why={MISSION_WHY.why} source={MISSION_WHY.source} />
      </div>
    </StepFrame>
  );
}

export function SessionScreen({
  steps,
  bestExhale,
  onOutcome,
  onBest,
  onExit,
  onFinish,
}: {
  steps: Step[];
  bestExhale: number;
  onOutcome: (missionId: string, outcome: Outcome) => void;
  onBest: (seconds: number) => void;
  onExit: () => void;
  onFinish: (mission: MissionDef, existingId: string | null) => void;
}) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const next = () => setIndex((i) => Math.min(steps.length - 1, i + 1));
  const frame: FrameProps = {
    index,
    total: steps.length,
    onBack: () => setIndex((i) => Math.max(0, i - 1)),
    onExit,
  };

  if (step.kind === 'checkin') {
    return (
      <CheckinStep
        key={index}
        mission={step.mission}
        frame={frame}
        onDone={(outcome) => {
          onOutcome(step.mission.id, outcome);
          next();
        }}
      />
    );
  }
  if (step.kind === 'mission') {
    return (
      <MissionStep
        key={index}
        mission={step.mission}
        existing={step.existing}
        frame={frame}
        onAccept={(mission) => onFinish(mission, step.existing?.id ?? null)}
      />
    );
  }
  return (
    <ExerciseStep
      key={index}
      ex={step.ex}
      pick={step.pick}
      variant={step.variant}
      frame={frame}
      bestExhale={bestExhale}
      onBest={onBest}
      onNext={next}
    />
  );
}
