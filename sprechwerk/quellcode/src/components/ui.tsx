import { useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { BookOpen, ChevronDown, Shuffle, Timer } from 'lucide-react';

export const BG_URL =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260704_143500_a76b8e64-2c69-4683-80e7-2bb060a921d6.png&w=1280&q=85';

export const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Sekunden als m:ss. */
export function fmtTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}

/** Sekunden mit einer Nachkommastelle, deutsch formatiert. */
export function fmtSec(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

const BLUR: CSSProperties = { filter: 'blur(12px)', transform: 'scale(1.1)' };

export function Background() {
  const [failed, setFailed] = useState(false);
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-fallback" style={BLUR} />
      {!__ARTIFACT__ && !failed && (
        <img
          src={BG_URL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={BLUR}
          onError={() => setFailed(true)}
        />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(138, 154, 170, 0.3)' }} />
    </div>
  );
}

export function PhoneShell({ compact, scale, children }: { compact: boolean; scale: number; children: ReactNode }) {
  if (compact) return <div className="phone phone--compact">{children}</div>;
  return (
    <div className="relative shrink-0" style={{ width: 397 * scale, height: 802 * scale }}>
      <div
        className="phone"
        style={{ position: 'absolute', left: 11 * scale, top: 11 * scale, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        <div className="dynamic-island" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

export function Pill({
  icon,
  children,
  onClick,
  ariaLabel,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const inner = (
    <>
      {icon ?? <Timer size={12} className="text-white/80" />}
      <span className="text-[12px] font-medium text-white/90 leading-none whitespace-nowrap">{children}</span>
    </>
  );
  const cls = 'liquid-glass rounded-full inline-flex items-center gap-1.5 py-2.5 px-3';
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick} aria-label={ariaLabel}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function RoundButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="liquid-glass w-9 h-9 rounded-full flex items-center justify-center text-white/90 shrink-0"
    >
      {children}
    </button>
  );
}

const GLOW =
  'radial-gradient(ellipse at center, rgba(220,200,80,0.5) 0%, rgba(180,160,40,0.2) 40%, transparent 70%)';

export function Glow({ glowRef }: { glowRef?: RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{ width: 200, height: 150, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: GLOW }}
    />
  );
}

/** Runder Glas-Knopf mit goldenem Schein, wie der Voice-Button im Design. */
export function VoiceOrb({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <div className="relative w-16 h-16">
      <Glow />
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="liquid-glass w-16 h-16 rounded-full flex items-center justify-center text-white"
      >
        {children}
      </button>
    </div>
  );
}

export function Waveform({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="10" x2="4" y2="14" />
      <line x1="8" y1="6" x2="8" y2="18" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="16" y1="7" x2="16" y2="17" />
      <line x1="20" y1="10" x2="20" y2="14" />
    </svg>
  );
}

export function OptionCard({
  number,
  label,
  selected,
  onToggle,
  animDelay,
  height = 100,
  single = false,
}: {
  number: string;
  label: string;
  selected: boolean;
  onToggle: () => void;
  animDelay: number;
  height?: number;
  single?: boolean;
}) {
  return (
    <button
      type="button"
      role={single ? 'radio' : undefined}
      aria-checked={single ? selected : undefined}
      aria-pressed={single ? undefined : selected}
      onClick={onToggle}
      className={`fade-up ${selected ? 'liquid-glass-selected' : 'liquid-glass'} rounded-[32px] p-4 flex flex-col justify-between text-left transition-[background-color,box-shadow] duration-300`}
      style={{ ...delay(animDelay), height }}
    >
      <span className="text-[11px] font-medium text-white/50 tabular-nums">{number}</span>
      <span className="text-[16px] font-medium text-white leading-snug">{label}</span>
    </button>
  );
}

export function StatCard({
  caption,
  value,
  animDelay,
  action,
}: {
  caption: string;
  value: ReactNode;
  animDelay: number;
  action?: ReactNode;
}) {
  return (
    <div className="fade-up liquid-glass rounded-[32px] h-[100px] p-4 flex flex-col justify-between" style={delay(animDelay)}>
      <span className="text-[11px] font-medium leading-tight text-white/60">{caption}</span>
      <div className="flex items-end justify-between gap-2">
        <span className="text-[28px] leading-none tracking-tight text-white tabular-nums">{value}</span>
        {action}
      </div>
    </div>
  );
}

export function StepList({ steps, size = 'md', active }: { steps: string[]; size?: 'md' | 'sm'; active?: number }) {
  const sm = size === 'sm';
  return (
    <ol className={sm ? 'space-y-1.5' : 'space-y-3'}>
      {steps.map((step, k) => {
        const dim = active !== undefined && k !== active;
        return (
          <li key={k} className={`flex gap-3 transition-opacity duration-300 ${dim ? 'opacity-40' : ''}`}>
            <span
              className={`shrink-0 font-medium text-white/50 tabular-nums ${sm ? 'w-4 pt-[2px] text-[10.5px]' : 'w-5 pt-[3px] text-[11px]'}`}
            >
              {pad2(k + 1)}
            </span>
            <span className={`hyphens ${sm ? 'text-[13px] leading-snug text-white/80' : 'text-[15px] leading-snug text-white/90'}`}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function WhyNote({
  why,
  source,
  animDelay = 0.7,
  collapsible = false,
}: {
  why: string;
  source: string;
  animDelay?: number;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);
  if (!open) {
    return (
      <div className="fade-up" style={delay(animDelay)}>
        <button
          type="button"
          aria-expanded={false}
          onClick={() => setOpen(true)}
          className="flex w-full min-w-0 items-center gap-2.5 text-left"
        >
          <BookOpen size={14} className="shrink-0 text-white/50" />
          <span className="shrink-0 text-[12.5px] font-medium text-white/85">Warum es wirkt</span>
          <span className="min-w-0 flex-1 truncate text-[11px] text-white/50">{source}</span>
          <ChevronDown size={14} className="shrink-0 text-white/60" />
        </button>
      </div>
    );
  }
  return (
    <div className="fade-up flex gap-2.5 items-start" style={delay(animDelay)}>
      <BookOpen size={14} className="mt-[2px] shrink-0 text-white/50" />
      <div className="min-w-0">
        <p className="hyphens text-[12.5px] leading-snug text-white/80">{why}</p>
        <p className="mt-1 text-[11px] leading-snug text-white/50">{source}</p>
      </div>
    </div>
  );
}

/** Text mit *markierten* Wörtern. Hervorgehoben nur, wenn `emphasis` an ist. */
export function Marked({ text, emphasis }: { text: string; emphasis: boolean }) {
  return (
    <>
      {text
        .split(/(\*[^*]+\*)/g)
        .filter(Boolean)
        .map((part, k) =>
          part.startsWith('*') && part.endsWith('*') ? (
            <span
              key={k}
              className={emphasis ? 'font-medium text-white underline decoration-white/50 underline-offset-4' : undefined}
            >
              {part.slice(1, -1)}
            </span>
          ) : (
            <span key={k}>{part}</span>
          ),
        )}
    </>
  );
}

/** Übungstext: „/“ trennt Sinneinheiten, *Wort* ist das Schlüsselwort. */
export function PracticeText({ text, emphasis }: { text: string; emphasis: boolean }) {
  const units = text
    .split('/')
    .map((u) => u.trim())
    .filter(Boolean);
  return (
    <p className="text-[16px] leading-[1.55] text-white/90">
      {units.map((unit, i) => (
        <span key={i}>
          <Marked text={unit} emphasis={emphasis} />
          {i < units.length - 1 && (
            <>
              {' '}
              <span aria-hidden="true" className="text-white/40">
                /
              </span>{' '}
            </>
          )}
        </span>
      ))}
    </p>
  );
}

/** Kleiner Knopf oben rechts in einer Karte: ein anderes Beispiel derselben Übung. */
export function ShuffleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-my-1 inline-flex shrink-0 items-center gap-1.5 py-1 text-[11px] font-medium text-white/80"
    >
      <Shuffle size={12} />
      {label}
    </button>
  );
}

/** Kopfzeile einer Karte: Bezeichnung links, optional „Anderes Beispiel“ rechts. */
export function CardHeader({ label, shuffleLabel, onShuffle }: { label: string; shuffleLabel?: string; onShuffle?: () => void }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="min-w-0 truncate text-[11px] font-medium text-white/50">{label}</span>
      {onShuffle && <ShuffleButton label={shuffleLabel ?? 'Neue Frage'} onClick={onShuffle} />}
    </div>
  );
}

export function PromptCard({
  label,
  prompt,
  onShuffle,
  shuffleLabel = 'Neue Frage',
  marked = false,
  quote = false,
}: {
  label: string;
  prompt: string;
  onShuffle?: () => void;
  shuffleLabel?: string;
  marked?: boolean;
  quote?: boolean;
}) {
  return (
    <div className="liquid-glass rounded-[32px] p-5" aria-live="polite">
      <CardHeader label={label} shuffleLabel={shuffleLabel} onShuffle={onShuffle} />
      <p key={prompt} className="fade-up balance text-[20px] leading-snug text-white">
        {quote && '„'}
        <Marked text={prompt} emphasis={marked} />
        {quote && '“'}
      </p>
    </div>
  );
}
