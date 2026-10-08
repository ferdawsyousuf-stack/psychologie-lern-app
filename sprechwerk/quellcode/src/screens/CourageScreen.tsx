import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  Drama,
  Flame,
  Footprints,
  Lightbulb,
  MessagesSquare,
  Trophy,
  Wind,
  X,
} from 'lucide-react';
import {
  COURAGE_CATS,
  COURAGE_EXERCISES,
  COURAGE_WHY,
  KNOWLEDGE,
  STARTERS,
  THOUGHT_EXAMPLES,
  THOUGHT_HINTS,
  WIN_EXAMPLES,
  type CourageCat,
  type CourageExercise,
} from '../courage';
import {
  addThought,
  addWins,
  formatDay,
  ladderSteps,
  markTool,
  newLadderStep,
  removeWin,
  saveLadderStep,
  dayKey,
  type LadderStep,
  type Progress,
} from '../lib/progress';
import { usePick } from '../lib/rotation';
import { useLayout, useTopPad } from '../lib/layout';
import { buzz, chime } from '../lib/device';
import { Pill, PromptCard, RoundButton, StepList, WhyNote, delay, pad2 } from '../components/ui';
import { BreathControl, SpeakControl, TimerControl } from '../components/controls';
import { Rating } from '../components/Rating';
import { SlideToConfirm } from '../components/SlideToConfirm';

type View =
  | { name: 'hub' }
  | { name: 'exercise'; id: string }
  | { name: 'ladder' }
  | { name: 'thought' }
  | { name: 'wins' }
  | { name: 'starters' }
  | { name: 'knowledge' };

type Update = (fn: (p: Progress) => Progress) => void;

const iconClass = 'text-white/80';

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------

function Frame({
  pill,
  icon,
  subtitle,
  heading,
  onBack,
  backLabel,
  footer,
  children,
}: {
  pill: string;
  icon: ReactNode;
  subtitle: string;
  heading: string;
  onBack: () => void;
  backLabel: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  const { short } = useLayout();
  const topPad = useTopPad();
  return (
    <div className={`relative z-10 flex h-full flex-col px-6 pb-6 ${topPad}`}>
      <div className={`fade-up flex shrink-0 items-center gap-2 ${short ? 'mb-5' : 'mb-7'}`} style={delay(0.08)}>
        <Pill icon={icon}>{pill}</Pill>
        <div className="flex-1" />
        <RoundButton label={backLabel} onClick={onBack}>
          {backLabel === 'Schließen' ? <X size={16} /> : <ArrowLeft size={16} />}
        </RoundButton>
      </div>
      <div className={`fade-up shrink-0 ${short ? 'mb-4' : 'mb-5'}`} style={delay(0.16)}>
        <p className="mb-1.5 text-[14px] text-white/60">{subtitle}</p>
        <h1 className="balance text-[28px] font-normal leading-tight tracking-tight text-white">{heading}</h1>
      </div>
      <div className="no-scrollbar -mx-6 min-h-0 flex-1 overflow-y-auto px-6">
        <div className="flex min-h-full flex-col pb-2">{children}</div>
      </div>
      <div className="fade-up shrink-0 pt-4" style={delay(0.5)}>
        {footer}
      </div>
    </div>
  );
}

function Section({ title, children, animDelay = 0.3 }: { title: string; children: ReactNode; animDelay?: number }) {
  return (
    <section className="fade-up mt-6 first:mt-0" style={delay(animDelay)}>
      <h2 className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white/60">{title}</h2>
      {children}
    </section>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${selected ? 'liquid-glass-selected text-white' : 'liquid-glass text-white/85'} rounded-full px-3 py-1.5 text-left text-[12.5px] leading-snug transition-colors duration-200`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-1 text-[12px] font-medium text-white/75">{label}</span>
      <textarea
        className="glass-input"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
      />
    </label>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`liquid-glass rounded-[28px] p-4 ${className}`}>{children}</div>;
}

function NumberBadge({ n, done }: { n: number; done?: boolean }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-medium tabular-nums ${
        done ? 'bg-white/85 text-[#3b4756]' : 'bg-white/15 text-white'
      }`}
    >
      {done ? <Check size={15} /> : n}
    </span>
  );
}

function Back({ onBack, label = 'Zurück zur Übersicht' }: { onBack: () => void; label?: string }) {
  return <SlideToConfirm label={label} onConfirm={onBack} />;
}

// ---------------------------------------------------------------------------
// Übersicht
// ---------------------------------------------------------------------------

function ToolTile({
  number,
  label,
  meta,
  icon,
  onClick,
  animDelay,
}: {
  number: string;
  label: string;
  meta: string;
  icon: ReactNode;
  onClick: () => void;
  animDelay: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fade-up liquid-glass flex h-[112px] flex-col justify-between rounded-[32px] p-4 text-left"
      style={delay(animDelay)}
    >
      <span className="flex items-center justify-between">
        <span className="text-[11px] font-medium tabular-nums text-white/50">{number}</span>
        <span className="text-white/70">{icon}</span>
      </span>
      <span>
        <span className="block text-[16px] font-medium leading-snug text-white">{label}</span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-white/60">{meta}</span>
      </span>
    </button>
  );
}

function ListRow({
  title,
  text,
  right,
  icon,
  onClick,
  first,
}: {
  title: string;
  text?: string;
  right?: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
  first?: boolean;
}) {
  return (
    <li className={first ? undefined : 'border-t border-white/10'}>
      <button type="button" onClick={onClick} className="flex w-full items-center gap-3 py-3 text-left">
        {icon && <span className="shrink-0 text-white/75">{icon}</span>}
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] leading-snug text-white">{title}</span>
          {text && <span className="mt-0.5 block text-[12px] leading-snug text-white/60">{text}</span>}
        </span>
        {right}
        <ChevronRight size={15} className="shrink-0 text-white/45" />
      </button>
    </li>
  );
}

function Hub({
  progress,
  open,
  onClose,
  onMoment,
  onStage,
}: {
  progress: Progress;
  open: (v: View) => void;
  onClose: () => void;
  onMoment: () => void;
  onStage: () => void;
}) {
  const [cat, setCat] = useState<CourageCat | null>(null);
  const steps = ladderSteps(progress);
  const done = steps.filter((s) => s.done).length;
  const list = cat ? COURAGE_EXERCISES.filter((e) => e.cat === cat) : COURAGE_EXERCISES;
  const totalDone = Object.values(progress.tools).reduce((a, b) => a + b, 0);

  return (
    <Frame
      pill="Mut"
      icon={<Flame size={12} className={iconClass} />}
      subtitle={totalDone ? `${totalDone} Mut-Übungen gemacht` : 'Angst überwinden, Selbstvertrauen aufbauen'}
      heading="Mutiger sprechen, Schritt für Schritt."
      onBack={onClose}
      backLabel="Schließen"
      footer={<SlideToConfirm label="Zurück zum Start" onConfirm={onClose} />}
    >
      <div className="grid shrink-0 grid-cols-2 gap-3">
        <ToolTile
          number="01"
          label="Angst-Leiter"
          meta={`${done} von ${steps.length} Stufen`}
          icon={<Footprints size={16} />}
          onClick={() => open({ name: 'ladder' })}
          animDelay={0.22}
        />
        <ToolTile
          number="02"
          label="Gedanken-Check"
          meta={progress.thoughts.length ? `${progress.thoughts.length} geprüft` : 'Prüfen statt glauben'}
          icon={<Brain size={16} />}
          onClick={() => open({ name: 'thought' })}
          animDelay={0.28}
        />
        <ToolTile
          number="03"
          label="Erfolge"
          meta={progress.wins.length ? `${progress.wins.length} Einträge` : 'Was gut lief'}
          icon={<Trophy size={16} />}
          onClick={() => open({ name: 'wins' })}
          animDelay={0.34}
        />
        <ToolTile
          number="04"
          label="Gespräche"
          meta="Starter und Retter-Sätze"
          icon={<MessagesSquare size={16} />}
          onClick={() => open({ name: 'starters' })}
          animDelay={0.4}
        />
      </div>

      <div className="fade-up mt-3" style={delay(0.44)}>
        <ul className="liquid-glass rounded-[28px] px-4">
          <ListRow
            first
            icon={<Lightbulb size={16} />}
            title="Wissen"
            text={`${KNOWLEDGE.length} kurze Erklärungen: Warum Angst so wirkt und was hilft`}
            onClick={() => open({ name: 'knowledge' })}
          />
          <ListRow icon={<Wind size={16} />} title="Moment-Hilfe" text="25 Sekunden vor einem Gespräch" onClick={onMoment} />
          <ListRow icon={<Drama size={16} />} title="Bühne" text="60 Sekunden Auftritt vor Publikum" onClick={onStage} />
        </ul>
      </div>

      <Section title="Mut-Übungen" animDelay={0.5}>
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Bereich der Übungen">
          <Chip label="Alle" selected={cat === null} onClick={() => setCat(null)} />
          {COURAGE_CATS.map((c) => (
            <Chip key={c} label={c} selected={cat === c} onClick={() => setCat((x) => (x === c ? null : c))} />
          ))}
        </div>
        <ul className="liquid-glass rounded-[28px] px-4">
          {list.map((e, i) => {
            const count = progress.tools[e.id] ?? 0;
            return (
              <ListRow
                key={e.id}
                first={i === 0}
                title={e.title}
                text={e.intro}
                onClick={() => open({ name: 'exercise', id: e.id })}
                right={
                  <span className="flex shrink-0 flex-col items-end gap-0.5 text-[11px] tabular-nums text-white/55">
                    <span>{e.minutes} Min</span>
                    {count > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-white/80">
                        <Check size={11} />
                        {count}×
                      </span>
                    )}
                  </span>
                }
              />
            );
          })}
        </ul>
      </Section>

      <div className="fade-up mt-5 shrink-0 pb-1" style={delay(0.56)}>
        <WhyNote why={COURAGE_WHY.why} source={COURAGE_WHY.source} collapsible />
      </div>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Eine Mut-Übung
// ---------------------------------------------------------------------------

function ExerciseView({ ex, update, onBack }: { ex: CourageExercise; update: Update; onBack: () => void }) {
  const [choice, setChoice] = useState<string | null>(null);
  const [texts, setTexts] = useState<string[]>(() => (ex.inputs ?? []).map(() => ''));
  const [rating, setRating] = useState<number | null>(null);

  const finish = () => {
    update((p) => {
      let next = markTool(p, ex.id);
      if (ex.saveToWins) next = addWins(next, texts);
      return next;
    });
    chime('soft');
    onBack();
  };

  return (
    <Frame
      pill="Mut-Übung"
      icon={<Flame size={12} className={iconClass} />}
      subtitle={`${ex.cat} · ${ex.minutes} Min`}
      heading={ex.title}
      onBack={onBack}
      backLabel="Zurück"
      footer={<SlideToConfirm label="Geschafft" onConfirm={finish} />}
    >
      <p className="fade-up hyphens mb-4 px-1 text-[15px] leading-snug text-white/85" style={delay(0.24)}>
        {ex.intro}
      </p>
      <div className="fade-up liquid-glass shrink-0 rounded-[32px] p-5" style={delay(0.3)}>
        <StepList steps={ex.steps} />
      </div>

      {ex.chips && (
        <div className="fade-up mt-5" style={delay(0.36)}>
          <p className="mb-2 px-1 text-[12px] font-medium text-white/75">{ex.chips.label}</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ex.chips.label}>
            {ex.chips.options.map((o) => (
              <Chip key={o} label={o} selected={choice === o} onClick={() => setChoice((c) => (c === o ? null : o))} />
            ))}
          </div>
          {choice && ex.id === 'safety' && (
            <p className="mt-3 px-1 text-[13px] leading-snug text-white/85">
              Heute lässt du weg: <span className="font-medium text-white">{choice}</span>.
            </p>
          )}
        </div>
      )}

      {ex.inputs && (
        <div className="fade-up mt-5 space-y-3" style={delay(0.4)}>
          {ex.inputs.map((input, i) => (
            <Field
              key={input.label}
              label={input.label}
              placeholder={input.placeholder}
              value={texts[i]}
              rows={ex.inputs && ex.inputs.length > 2 ? 2 : 3}
              onChange={(v) => setTexts((t) => t.map((x, k) => (k === i ? v : x)))}
            />
          ))}
          {ex.saveToWins && <p className="px-1 text-[11.5px] text-white/55">Landet beim Abschließen im Erfolgs-Tagebuch.</p>}
        </div>
      )}

      {ex.rating && (
        <div className="fade-up mt-5" style={delay(0.44)}>
          <p className="mb-2 px-1 text-[12px] font-medium text-white/75">{ex.rating.label}</p>
          <Rating value={rating} onChange={setRating} label={ex.rating.label} low={ex.rating.low} high={ex.rating.high} />
          {rating !== null && ex.id === 'liking-gap' && (
            <p className="mt-3 px-1 text-[13px] leading-snug text-white/85">
              Wahrscheinlich eher {Math.min(10, rating + 1)} bis {Math.min(10, rating + 2)}. Dein innerer Kritiker ist strenger als dein Gegenüber.
            </p>
          )}
          {rating !== null && ex.id === 'spotlight' && (
            <p className="mt-3 px-1 text-[13px] leading-snug text-white/85">
              Merk dir die Zahl. Beim nächsten Versprecher erinnerst du dich: Die meisten haben es gar nicht bemerkt.
            </p>
          )}
          {rating !== null && (ex.id === 'strangers' || ex.id === 'mistake') && (
            <p className="mt-3 px-1 text-[13px] leading-snug text-white/85">
              Deine Vorhersage: {rating} von 10. Nach dem Gespräch vergleichen und ins Erfolgs-Tagebuch schreiben.
            </p>
          )}
        </div>
      )}

      {ex.control && (
        <div className="fade-up flex min-h-[176px] flex-1 items-center justify-center py-5" style={delay(0.48)}>
          {ex.control.kind === 'timer' && <TimerControl seconds={ex.control.seconds} cueLabel={ex.control.label} />}
          {ex.control.kind === 'speak' && <SpeakControl seconds={ex.control.seconds} />}
          {ex.control.kind === 'breath' && <BreathControl cycles={ex.control.cycles} />}
        </div>
      )}

      {!ex.control && <div className="min-h-[16px] flex-1" />}
      <div className="mt-4 shrink-0 pb-1">
        <WhyNote why={ex.why} source={ex.source} collapsible animDelay={0.52} />
      </div>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Angst-Leiter
// ---------------------------------------------------------------------------

function LadderRow({
  step,
  index,
  open,
  onToggle,
  onSave,
}: {
  step: LadderStep;
  index: number;
  open: boolean;
  onToggle: () => void;
  onSave: (s: LadderStep) => void;
}) {
  const [actual, setActual] = useState<number | null>(step.actual);
  return (
    <li className={index ? 'border-t border-white/10' : undefined}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 py-3 text-left">
        <NumberBadge n={step.fear} done={step.done} />
        <span className="min-w-0 flex-1">
          <span className={`block text-[14px] leading-snug ${step.done ? 'text-white/70' : 'text-white'}`}>{step.text}</span>
          <span className="mt-0.5 block text-[11.5px] text-white/55">
            {step.done
              ? `Geschafft ${step.date ? formatDay(step.date) : ''} · erwartet ${step.fear}, erlebt ${step.actual ?? '–'}`
              : `Angst ${step.fear} von 10`}
          </span>
        </span>
        <ChevronDown size={15} className={`shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4">
          {!step.done ? (
            <>
              <p className="mb-2 text-[12px] font-medium text-white/75">Wie viel Angst macht dir das?</p>
              <Rating value={step.fear} onChange={(n) => onSave({ ...step, fear: n })} label="Angst vorher, 0 bis 10" />
              <p className="mb-2 mt-4 text-[12px] font-medium text-white/75">Gemacht? Wie schlimm war es wirklich?</p>
              <Rating value={actual} onChange={setActual} label="Wie schlimm war es, 0 bis 10" />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={actual === null}
                  onClick={() => {
                    if (actual === null) return;
                    onSave({ ...step, done: true, actual, date: dayKey() });
                    buzz(20);
                    chime('soft');
                  }}
                  className={`rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#1a1a1e] ${actual === null ? 'opacity-40' : ''}`}
                >
                  Als geschafft speichern
                </button>
                {step.custom && (
                  <button type="button" onClick={() => onSave({ ...step, hidden: true })} className="px-3 py-2 text-[13px] text-white/70">
                    Entfernen
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[13px] leading-snug text-white/85">
                {step.actual !== null && step.actual < step.fear
                  ? 'Besser als befürchtet. Genau daraus lernt dein Gehirn.'
                  : 'Geschafft, auch wenn es schwer war. Das zählt.'}
              </p>
              <button
                type="button"
                onClick={() => onSave({ ...step, done: false, actual: null, date: null })}
                className="liquid-glass rounded-full px-3 py-1.5 text-[12px] text-white/85"
              >
                Nochmal üben
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function LadderView({ progress, update, onBack }: { progress: Progress; update: Update; onBack: () => void }) {
  const steps = ladderSteps(progress);
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [fear, setFear] = useState<number | null>(null);
  const save = (s: LadderStep) => update((p) => saveLadderStep(p, s));

  return (
    <Frame
      pill="Angst-Leiter"
      icon={<Footprints size={12} className={iconClass} />}
      subtitle="Von leicht nach schwer. Immer nur die nächste Stufe."
      heading={next ? 'Deine nächste Stufe wartet.' : 'Alle Stufen geschafft!'}
      onBack={onBack}
      backLabel="Zurück"
      footer={<Back onBack={onBack} />}
    >
      <div className="fade-up" style={delay(0.24)}>
        <Card>
          <div className="mb-2 flex items-center justify-between text-[12px] text-white/70">
            <span>
              {done} von {steps.length} geschafft
            </span>
            <span className="tabular-nums">{steps.length ? Math.round((done / steps.length) * 100) : 0} %</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
            <div className="h-full rounded-full bg-white/85 transition-[width] duration-500" style={{ width: `${steps.length ? (done / steps.length) * 100 : 0}%` }} />
          </div>
          {next && (
            <button type="button" onClick={() => setOpenId(next.id)} className="mt-4 flex w-full items-center gap-3 text-left">
              <NumberBadge n={next.fear} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-white/55">Als Nächstes</span>
                <span className="block text-[16px] leading-snug text-white">{next.text}</span>
              </span>
            </button>
          )}
        </Card>
      </div>

      <p className="fade-up mt-4 px-1 text-[12.5px] leading-snug text-white/70" style={delay(0.3)}>
        Vorher schätzt du die Angst, nachher, wie schlimm es wirklich war. Tippe auf eine Stufe.
      </p>

      <div className="fade-up mt-3" style={delay(0.34)}>
        <ul className="liquid-glass rounded-[28px] px-4">
          {steps.map((s, i) => (
            <LadderRow
              key={s.id}
              step={s}
              index={i}
              open={openId === s.id}
              onToggle={() => setOpenId((o) => (o === s.id ? null : s.id))}
              onSave={save}
            />
          ))}
        </ul>
      </div>

      <Section title="Eigene Stufe" animDelay={0.4}>
        <Card className="space-y-3">
          <Field label="Was willst du schaffen?" placeholder="z. B. Beim Training jemanden ansprechen" value={text} onChange={setText} rows={2} />
          <div>
            <p className="mb-2 px-1 text-[12px] font-medium text-white/75">Wie viel Angst macht dir das?</p>
            <Rating value={fear} onChange={setFear} label="Angst, 0 bis 10" />
          </div>
          <button
            type="button"
            disabled={!text.trim() || fear === null}
            onClick={() => {
              if (!text.trim() || fear === null) return;
              update((p) => saveLadderStep(p, newLadderStep(text, fear)));
              setText('');
              setFear(null);
              buzz(15);
            }}
            className={`rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#1a1a1e] ${!text.trim() || fear === null ? 'opacity-40' : ''}`}
          >
            Stufe hinzufügen
          </button>
        </Card>
      </Section>

      <div className="mt-5 shrink-0 pb-1">
        <WhyNote
          why="Schrittweise Konfrontation ist die am besten belegte Methode gegen Angst. Am meisten lernt das Gehirn, wenn die Wirklichkeit besser ist als die Befürchtung. Darum der Vergleich vorher und nachher."
          source="Craske u. a. 2014; Hofmann & Otto 2008"
          collapsible
          animDelay={0.46}
        />
      </div>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Gedanken-Check
// ---------------------------------------------------------------------------

function ThoughtView({ progress, update, onBack }: { progress: Progress; update: Update; onBack: () => void }) {
  const [thought, setThought] = useState('');
  const [before, setBefore] = useState<number | null>(null);
  const [against, setAgainst] = useState('');
  const [friend, setFriend] = useState('');
  const [balanced, setBalanced] = useState('');
  const [after, setAfter] = useState<number | null>(null);
  const [result, setResult] = useState<{ before: number; after: number } | null>(null);
  const ready = Boolean(thought.trim() && balanced.trim() && before !== null && after !== null);
  const history = [...progress.thoughts].reverse().slice(0, 12);

  const save = () => {
    if (!ready || before === null || after === null) return;
    update((p) => addThought(p, { thought: thought.trim(), before, after, against: against.trim(), friend: friend.trim(), balanced: balanced.trim() }));
    setResult({ before, after });
    chime('soft');
    setThought('');
    setBefore(null);
    setAgainst('');
    setFriend('');
    setBalanced('');
    setAfter(null);
  };

  const appendHint = (h: string) => setAgainst((a) => (a.trim() ? `${a.trim()} ${h}` : h));

  return (
    <Frame
      pill="Gedanken-Check"
      icon={<Brain size={12} className={iconClass} />}
      subtitle="Prüfen statt glauben"
      heading="Stimmt das wirklich?"
      onBack={onBack}
      backLabel="Zurück"
      footer={<SlideToConfirm label="Speichern" blockedLabel={ready ? null : 'Erst Gedanke und neue Sicht eintragen'} onConfirm={save} />}
    >
      {result && (
        <div className="fade-up mb-4">
          <Card>
            <p className="text-[12px] font-medium text-white/60">Gespeichert</p>
            <p className="mt-1 text-[17px] leading-snug text-white">
              Vorher {result.before} von 10, jetzt {result.after} von 10.
            </p>
            <p className="mt-1 text-[12.5px] leading-snug text-white/75">
              {result.after < result.before ? 'Der Gedanke hat an Kraft verloren. Gut gemacht.' : 'Auch Prüfen braucht Übung. Beim nächsten Mal wird es leichter.'}
            </p>
          </Card>
        </div>
      )}

      <div className="fade-up space-y-5" style={delay(0.24)}>
        <div>
          <Field label="1 · Was denkst du gerade?" placeholder="z. B. Die halten mich für komisch." value={thought} onChange={setThought} rows={2} />
          <div className="mt-2 flex flex-wrap gap-2">
            {THOUGHT_EXAMPLES.map((t) => (
              <Chip key={t} label={t} selected={thought === t} onClick={() => setThought(t)} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 px-1 text-[12px] font-medium text-white/75">2 · Wie sehr glaubst du das?</p>
          <Rating value={before} onChange={setBefore} label="Wie sehr glaubst du das, 0 bis 10" low="gar nicht" high="völlig" />
        </div>
        <div>
          <Field label="3 · Was spricht dagegen?" placeholder="Beweise, Erfahrungen, Fakten …" value={against} onChange={setAgainst} />
          <div className="mt-2 flex flex-wrap gap-2">
            {THOUGHT_HINTS.map((h) => (
              <Chip key={h} label={h} onClick={() => appendHint(h)} />
            ))}
          </div>
        </div>
        <Field label="4 · Was würdest du einem Freund sagen, der das denkt?" placeholder="Hey, das …" value={friend} onChange={setFriend} />
        <Field label="5 · Neue, faire Sicht" placeholder="z. B. Vielleicht merkt es kaum jemand, und wenn doch, ist es okay." value={balanced} onChange={setBalanced} />
        <div>
          <p className="mb-2 px-1 text-[12px] font-medium text-white/75">6 · Wie sehr glaubst du den alten Gedanken jetzt?</p>
          <Rating value={after} onChange={setAfter} label="Wie sehr glaubst du den Gedanken jetzt, 0 bis 10" low="gar nicht" high="völlig" />
        </div>
      </div>

      {history.length > 0 && (
        <Section title="Deine Checks" animDelay={0.3}>
          <ul className="liquid-glass rounded-[28px] px-4">
            {history.map((h, i) => (
              <li key={h.id} className={`py-3 ${i ? 'border-t border-white/10' : ''}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-[14px] leading-snug text-white">„{h.thought}“</span>
                  <span className="shrink-0 text-[12px] tabular-nums text-white/70">
                    {h.before} → {h.after}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] leading-snug text-white/70">{h.balanced}</p>
                <p className="mt-0.5 text-[11px] text-white/45">{formatDay(h.date)}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="mt-5 shrink-0 pb-1">
        <WhyNote
          why="Angstgedanken zu prüfen, statt ihnen sofort zu glauben, ist ein Kernstück der kognitiven Verhaltenstherapie bei sozialer Angst. Der Blick von außen, wie bei einem Freund, macht fairer."
          source="Hofmann & Otto 2008; Clark & Wells 1995"
          collapsible
        />
      </div>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Erfolgs-Tagebuch
// ---------------------------------------------------------------------------

function WinsView({ progress, update, onBack }: { progress: Progress; update: Update; onBack: () => void }) {
  const [text, setText] = useState('');
  const wins = [...progress.wins].reverse();
  const groups: { day: string; items: typeof wins }[] = [];
  for (const w of wins) {
    const g = groups[groups.length - 1];
    if (g && g.day === w.date) g.items.push(w);
    else groups.push({ day: w.date, items: [w] });
  }
  const add = () => {
    if (!text.trim()) return;
    update((p) => addWins(p, [text]));
    setText('');
    buzz(15);
    chime('soft');
  };

  return (
    <Frame
      pill="Erfolge"
      icon={<Trophy size={12} className={iconClass} />}
      subtitle={wins.length ? `${wins.length} Einträge` : 'Dein Beweis-Tagebuch'}
      heading="Was lief heute beim Sprechen gut?"
      onBack={onBack}
      backLabel="Zurück"
      footer={<Back onBack={onBack} />}
    >
      <div className="fade-up" style={delay(0.24)}>
        <Card className="space-y-3">
          <Field label="Neuer Eintrag" placeholder="Auch Kleines zählt …" value={text} onChange={setText} rows={2} />
          <div className="flex flex-wrap gap-2">
            {WIN_EXAMPLES.map((w) => (
              <Chip key={w} label={w} onClick={() => setText(w)} />
            ))}
          </div>
          <button
            type="button"
            disabled={!text.trim()}
            onClick={add}
            className={`rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#1a1a1e] ${text.trim() ? '' : 'opacity-40'}`}
          >
            Eintragen
          </button>
        </Card>
      </div>

      {groups.length === 0 ? (
        <p className="fade-up mt-5 px-1 text-[13px] leading-snug text-white/70" style={delay(0.3)}>
          Angst merkt sich jeden Patzer und vergisst die guten Momente. Hier sammelst du die Gegenbeweise. Lies sie vor schwierigen Gesprächen.
        </p>
      ) : (
        groups.map((g, gi) => (
          <Section key={g.day} title={formatDay(g.day)} animDelay={0.3 + gi * 0.04}>
            <ul className="liquid-glass rounded-[28px] px-4">
              {g.items.map((w, i) => (
                <li key={w.id} className={`flex items-start gap-3 py-3 ${i ? 'border-t border-white/10' : ''}`}>
                  <Trophy size={14} className="mt-[3px] shrink-0 text-white/60" />
                  <span className="min-w-0 flex-1 text-[14px] leading-snug text-white">{w.text}</span>
                  <button
                    type="button"
                    aria-label="Eintrag löschen"
                    onClick={() => update((p) => removeWin(p, w.id))}
                    className="-mr-1 shrink-0 p-1 text-white/45"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        ))
      )}

      <div className="mt-5 shrink-0 pb-1">
        <WhyNote
          why="Das Gehirn mit Angst übersieht Gegenbeweise. Ein Positiv-Tagebuch macht sie sichtbar, und gemeisterte Erfahrungen sind die stärkste Quelle von Selbstvertrauen."
          source="Padesky 1994; Bandura 1977"
          collapsible
        />
      </div>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Gesprächs-Starter und Retter-Sätze
// ---------------------------------------------------------------------------

function StarterCard({ lines, shuffleLabel }: { lines: string[]; shuffleLabel: string }) {
  const [index, next] = usePick(lines.length, Math.floor(Math.random() * lines.length));
  return <PromptCard label="Zum Ausprobieren" prompt={lines[index]} onShuffle={next} shuffleLabel={shuffleLabel} quote />;
}

function StartersView({ onBack }: { onBack: () => void }) {
  const [groupId, setGroupId] = useState(STARTERS[0].id);
  const group = STARTERS.find((g) => g.id === groupId) ?? STARTERS[0];
  return (
    <Frame
      pill="Gespräche"
      icon={<MessagesSquare size={12} className={iconClass} />}
      subtitle="Sätze, die dir den Anfang leicht machen"
      heading="Nie wieder sprachlos."
      onBack={onBack}
      backLabel="Zurück"
      footer={<Back onBack={onBack} />}
    >
      <div className="fade-up flex flex-wrap gap-2" style={delay(0.22)} role="group" aria-label="Art der Sätze">
        {STARTERS.map((g) => (
          <Chip key={g.id} label={g.title} selected={g.id === groupId} onClick={() => setGroupId(g.id)} />
        ))}
      </div>
      <p className="fade-up mt-4 px-1 text-[13px] leading-snug text-white/75" style={delay(0.26)}>
        {group.intro}
      </p>
      <div className="fade-up mt-3" style={delay(0.3)}>
        <StarterCard key={group.id} lines={group.lines} shuffleLabel="Anderer Satz" />
      </div>
      <Section title={`Alle ${group.lines.length} Sätze`} animDelay={0.36}>
        <ul className="liquid-glass rounded-[28px] px-4">
          {group.lines.map((l, i) => (
            <li key={l} className={`flex gap-3 py-2.5 ${i ? 'border-t border-white/10' : ''}`}>
              <span className="w-5 shrink-0 pt-[2px] text-[11px] font-medium tabular-nums text-white/45">{pad2(i + 1)}</span>
              <span className="text-[14px] leading-snug text-white/90">{l}</span>
            </li>
          ))}
        </ul>
      </Section>
      <div className="mt-5 shrink-0 pb-1">
        <WhyNote
          why="Wer ein paar Einstiege und Nachfragen parat hat, muss im Moment weniger nachdenken. Das entlastet das Arbeitsgedächtnis, das bei Angst ohnehin knapp ist. Und wer fragt, wird mehr gemocht."
          source="Eysenck u. a. 2007; Huang u. a. 2017"
          collapsible
        />
      </div>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Wissen
// ---------------------------------------------------------------------------

function KnowledgeView({ onBack }: { onBack: () => void }) {
  const [openId, setOpenId] = useState<string | null>(KNOWLEDGE[0].id);
  return (
    <Frame
      pill="Wissen"
      icon={<Lightbulb size={12} className={iconClass} />}
      subtitle={`${KNOWLEDGE.length} kurze Erklärungen`}
      heading="Warum Angst so wirkt und was hilft."
      onBack={onBack}
      backLabel="Zurück"
      footer={<Back onBack={onBack} />}
    >
      <div className="fade-up" style={delay(0.24)}>
        <ul className="liquid-glass rounded-[28px] px-4">
          {KNOWLEDGE.map((k, i) => {
            const open = openId === k.id;
            return (
              <li key={k.id} className={i ? 'border-t border-white/10' : undefined}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId((o) => (o === k.id ? null : k.id))}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <span className="w-5 shrink-0 text-[11px] font-medium tabular-nums text-white/45">{pad2(i + 1)}</span>
                  <span className="min-w-0 flex-1 text-[14.5px] leading-snug text-white">{k.title}</span>
                  <ChevronDown size={15} className={`shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="pb-4 pl-8">
                    <p className="hyphens text-[13.5px] leading-snug text-white/85">{k.text}</p>
                    <p className="hyphens mt-2 text-[13px] leading-snug text-white">
                      <span className="font-medium">So nutzt du das: </span>
                      {k.tip}
                    </p>
                    <p className="mt-2 text-[11px] text-white/50">{k.source}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Frame>
  );
}

// ---------------------------------------------------------------------------

/** Bereich „Mut“: Angst überwinden und Selbstvertrauen aufbauen. */
export function CourageScreen({
  progress,
  update,
  onClose,
  onMoment,
  onStage,
}: {
  progress: Progress;
  update: Update;
  onClose: () => void;
  onMoment: () => void;
  onStage: () => void;
}) {
  const [view, setView] = useState<View>({ name: 'hub' });
  const [nonce, setNonce] = useState(0);
  const open = (v: View) => {
    setView(v);
    setNonce((n) => n + 1);
  };
  const back = () => open({ name: 'hub' });

  let content: ReactNode;
  switch (view.name) {
    case 'exercise': {
      const ex = COURAGE_EXERCISES.find((e) => e.id === view.id);
      content = ex ? <ExerciseView ex={ex} update={update} onBack={back} /> : null;
      break;
    }
    case 'ladder':
      content = <LadderView progress={progress} update={update} onBack={back} />;
      break;
    case 'thought':
      content = <ThoughtView progress={progress} update={update} onBack={back} />;
      break;
    case 'wins':
      content = <WinsView progress={progress} update={update} onBack={back} />;
      break;
    case 'starters':
      content = <StartersView onBack={back} />;
      break;
    case 'knowledge':
      content = <KnowledgeView onBack={back} />;
      break;
    default:
      content = <Hub progress={progress} open={open} onClose={onClose} onMoment={onMoment} onStage={onStage} />;
  }
  return (
    <div key={nonce} className="sheet-in absolute inset-0 z-10">
      {content}
    </div>
  );
}
