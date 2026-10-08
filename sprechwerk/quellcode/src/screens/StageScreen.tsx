import { useEffect, useState, type ReactNode } from 'react';
import { CircleUserRound, Menu, Pause, Play, UserRound, X } from 'lucide-react';
import { STAGE_SECONDS, STAGE_WHY } from '../content';
import { STAGE_TOPICS } from '../examples';
import { stageStats, type Progress } from '../lib/progress';
import { useRecorder } from '../lib/recorder';
import { rotate, usePick } from '../lib/rotation';
import { useTimer } from '../lib/timer';
import { buzz, chime, unlockAudio, useWakeLock } from '../lib/device';
import { useLayout } from '../lib/layout';
import { StageBackground } from '../components/StageBackground';
import { ShuffleButton, WhyNote, delay, fmtTime } from '../components/ui';
import { Rating } from '../components/Rating';

type Phase = 'hero' | 'before' | 'live' | 'after' | 'result';

const AVATAR_URLS = [
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100',
];

// Ersatz, wo externe Bilder gesperrt sind: weiche Verläufe als Publikum.
const AVATAR_FILLS = [
  'linear-gradient(135deg, #f6d29a, #c97a4a)',
  'linear-gradient(135deg, #a9cbee, #4d6f9e)',
  'linear-gradient(135deg, #dcbbe8, #8b5aa9)',
  'linear-gradient(135deg, #add9bd, #4a8768)',
];

const LOGO_PATH =
  'M 128 128 C 198.692 128 256 185.308 256 256 L 151.883 256 C 149.812 220.307 120.213 192 84 192 C 47.787 192 18.188 220.307 16.117 256 L 0 256 C 0 185.308 57.308 128 128 128 Z M 104.117 0 C 106.188 35.694 135.787 64 172 64 C 208.213 64 237.812 35.694 239.883 0 L 256 0 C 256 70.692 198.692 128 128 128 C 57.308 128 0 70.692 0 0 Z';

const fmtScore = (v: number) => v.toLocaleString('de-DE', { maximumFractionDigits: 1 });

function Avatar({ index, nodding }: { index: number; nodding: boolean }) {
  const [failed, setFailed] = useState(__ARTIFACT__);
  const cls = `h-5 w-5 rounded-full border-2 border-white/20 object-cover ${nodding ? 'nod' : ''}`;
  const style = nodding ? { animationDelay: `${index * 0.55}s` } : undefined;
  if (!failed) {
    return <img src={AVATAR_URLS[index]} alt="" className={cls} style={style} onError={() => setFailed(true)} />;
  }
  return (
    <span className={`${cls} flex items-center justify-center`} style={{ ...style, background: AVATAR_FILLS[index] }}>
      <UserRound size={10} strokeWidth={2.2} className="text-white/90" />
    </span>
  );
}

/** Dreieck aus 9 Punkten (1, 3, 5) als Icon für die erste Kennzahl. */
function TriangleDots() {
  const dots: [number, number][] = [
    [8.75, 1.5],
    [4.375, 8.75],
    [8.75, 8.75],
    [13.125, 8.75],
    [0, 16],
    [4.375, 16],
    [8.75, 16],
    [13.125, 16],
    [17.5, 16],
  ];
  return (
    <div aria-hidden="true" className="relative h-5 w-5">
      {dots.map(([x, y], i) => (
        <span key={i} className="absolute bg-white/60" style={{ left: x, top: y, width: 2.5, height: 2.5 }} />
      ))}
    </div>
  );
}

/** 3×3-Schachbrett als Icon für die zweite Kennzahl. */
function Checker() {
  return (
    <div aria-hidden="true" className="grid w-fit grid-cols-3 gap-[2px]">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`h-1 w-1 rounded-[1px] ${i % 2 === 0 ? 'bg-white/60' : 'bg-white/0'}`} />
      ))}
    </div>
  );
}

function Stat({ icon, value, label, animDelay }: { icon: ReactNode; value: string; label: string; animDelay: number }) {
  return (
    <div className="fade-up flex min-w-0 flex-col gap-2" style={delay(animDelay)}>
      {icon}
      <div className="text-xl font-normal leading-tight text-white tabular-nums">{value}</div>
      <div className="text-xs font-light leading-snug text-white/60">{label}</div>
    </div>
  );
}

/**
 * Die Bühne: ein Auftritt von 60 Sekunden vor vier vorgestellten Zuhörern.
 * Vorher schätzt du ein, wie schlimm es wird, nachher, wie schlimm es war.
 * Der Unterschied ist das, woraus das Gehirn lernt.
 */
export function StageScreen({
  progress,
  onSave,
  onTraining,
  onOverview,
  onSources,
}: {
  progress: Progress;
  onSave: (entry: { expected: number; actual: number; seconds: number }) => void;
  onTraining: () => void;
  onOverview: () => void;
  onSources: () => void;
}) {
  const { compact, short } = useLayout();
  const [menuOpen, setMenuOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('hero');
  const [expected, setExpected] = useState<number | null>(null);
  const [actual, setActual] = useState<number | null>(null);
  const [spoken, setSpoken] = useState(0);
  // Themen laufen von Auftritt zu Auftritt durch alle Kategorien, ohne sich zu wiederholen.
  const [topicIndex, nextTopic] = usePick(STAGE_TOPICS.length, rotate(STAGE_TOPICS.length, progress.stage.length));
  const [topicUsed, setTopicUsed] = useState(false);
  const timer = useTimer(STAGE_SECONDS * 1000);
  const { state, sec } = timer;
  // Der Auftritt wird automatisch aufgenommen, wo der Browser das Mikrofon erlaubt.
  const { available: canRecord, state: recState, url: recording, playing, start: startRec, stop: stopRec, togglePlay, clear: clearRec } =
    useRecorder();
  useWakeLock(state === 'running');
  const stats = stageStats(progress);

  useEffect(() => {
    if (phase !== 'live' || state !== 'done') return;
    stopRec();
    chime('end');
    buzz(40);
    setSpoken(STAGE_SECONDS);
    setPhase('after');
  }, [phase, state, stopRec]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const begin = () => {
    setExpected(null);
    setActual(null);
    clearRec();
    if (topicUsed) {
      nextTopic();
      setTopicUsed(false);
    }
    setPhase('before');
  };
  const enter = () => {
    if (expected === null) return;
    unlockAudio();
    if (canRecord) void startRec();
    timer.reset();
    timer.start();
    setTopicUsed(true);
    setPhase('live');
  };
  const finish = () => {
    timer.pause();
    stopRec();
    setSpoken(sec);
    setPhase('after');
  };
  const save = () => {
    if (expected === null || actual === null) return;
    onSave({ expected, actual, seconds: spoken });
    chime('soft');
    setPhase('result');
  };

  const go = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  const topic = STAGE_TOPICS[topicIndex];
  const live = phase === 'live';

  let badge: string;
  let heading: ReactNode;
  let subtitle: string;
  let body: ReactNode = null;
  let cta: { label: string; onClick: () => void; disabled?: boolean };

  switch (phase) {
    case 'before':
      badge = 'dein Publikum macht sich bereit';
      heading = (
        <>
          Wie schlimm
          <br />
          wird es?
        </>
      );
      subtitle = 'Schätz vorher ein. Danach vergleichst du mit dem, was wirklich passiert ist.';
      body = (
        <>
          <div className="fade-up mt-5" style={delay(0.35)}>
            <Rating value={expected} onChange={setExpected} label="Wie schlimm wird es, 0 bis 10" />
          </div>
          <div className="fade-up liquid-glass mt-4 rounded-[28px] px-4 py-3.5" style={delay(0.42)} aria-live="polite">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-[11px] font-medium text-white/50">Dein Thema · {topic.cat}</span>
              <ShuffleButton label="Anderes Thema" onClick={nextTopic} />
            </div>
            <p key={topicIndex} className="fade-up text-[16px] font-normal leading-snug text-white">
              {topic.text}
            </p>
          </div>
        </>
      );
      cta = { label: expected === null ? 'Erst einschätzen' : 'Bühne betreten', onClick: enter, disabled: expected === null };
      break;
    case 'live':
      badge = recState === 'recording' ? 'Publikum hört zu · Aufnahme läuft' : 'dein Publikum hört zu';
      heading = topic.text;
      subtitle = 'Sprich zu einem Gesicht, dann zum nächsten. Pausen sind erlaubt.';
      cta = { label: 'Fertig', onClick: finish };
      break;
    case 'after':
      badge = 'Applaus von deinem Publikum';
      heading = (
        <>
          Wie schlimm
          <br />
          war es wirklich?
        </>
      );
      subtitle = `Vorher hast du ${expected ?? '–'} erwartet. Schätz jetzt ehrlich ein.`;
      body = (
        <div className="fade-up mt-5" style={delay(0.35)}>
          <Rating value={actual} onChange={setActual} label="Wie schlimm war es, 0 bis 10" />
        </div>
      );
      cta = { label: actual === null ? 'Erst einschätzen' : 'Speichern', onClick: save, disabled: actual === null };
      break;
    case 'result': {
      const e = expected ?? 0;
      const a = actual ?? 0;
      badge = `Auftritt Nr. ${stats.count}`;
      heading = (
        <>
          {e} erwartet.
          <br />
          {a} erlebt.
        </>
      );
      subtitle =
        a < e
          ? 'Deine Angst hat mehr vorhergesagt, als dann kam. Genau aus diesem Unterschied lernt dein Gehirn.'
          : a === e
            ? 'Genau wie erwartet. Beim nächsten Mal etwas länger auf der Bühne bleiben.'
            : 'Schwerer als gedacht, und du hast es trotzdem gemacht. Das zählt. Nimm beim nächsten Mal ein leichteres Thema.';
      if (recording) {
        body = (
          <div className="fade-up mt-5 flex flex-wrap items-center gap-x-3 gap-y-2" style={delay(0.35)}>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Wiedergabe pausieren' : 'Auftritt anhören'}
              className="liquid-glass inline-flex items-center gap-2 rounded-full py-2.5 pl-3.5 pr-4 text-sm font-medium text-white"
            >
              {playing ? <Pause size={16} /> : <Play size={16} className="translate-x-[1px]" />}
              {playing ? 'Pause' : 'Auftritt anhören'}
            </button>
            <span className="text-xs font-light leading-snug text-white/60">Hör zu wie eine fremde Person.</span>
          </div>
        );
      }
      cta = { label: 'Nochmal auftreten', onClick: begin };
      break;
    }
    default:
      badge = 'dein Publikum wartet';
      heading = (
        <>
          Deine Bühne.
          <br />
          Dein Auftritt.
        </>
      );
      subtitle = canRecord ? 'Ein Thema. 60 Sekunden. Vier Zuhörer. Mit Aufnahme.' : 'Ein Thema. 60 Sekunden. Vier Zuhörer.';
      cta = { label: 'Auftritt starten', onClick: begin };
  }

  const firstStat = live
    ? { value: fmtTime(STAGE_SECONDS - sec), label: 'Redezeit' }
    : { value: `${stats.count} ${stats.count === 1 ? 'Auftritt' : 'Auftritte'}`, label: 'auf deiner Bühne' };
  const secondStat = live
    ? { value: `${expected ?? '–'} / 10`, label: 'vorher erwartet' }
    : {
        value: stats.expected === null || stats.actual === null ? '– → –' : `${fmtScore(stats.expected)} → ${fmtScore(stats.actual)}`,
        label: 'Ø erwartet → erlebt',
      };

  const navPad = compact ? 'pt-6' : 'pt-14';
  const links: { label: string; active?: boolean; onClick: () => void }[] = [
    {
      label: 'Bühne',
      active: true,
      onClick: () => {
        timer.reset();
        clearRec();
        setPhase('hero');
      },
    },
    { label: 'Training', onClick: onTraining },
    { label: 'Die Wissenschaft', onClick: onSources },
  ];

  return (
    <div className="font-inter sheet-in absolute inset-0 z-10 flex flex-col overflow-hidden">
      <StageBackground />

      {/* Menü-Overlay */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-xl transition-opacity duration-500 ease-out ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <nav
          className={`flex flex-col items-center gap-8 transition-transform duration-500 ease-out ${menuOpen ? 'translate-y-0' : '-translate-y-8'}`}
          aria-label="Menü"
        >
          {links.map((l) => (
            <button
              key={l.label}
              type="button"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => go(l.onClick)}
              className={`text-2xl font-medium transition-colors ${l.active ? 'text-white' : 'text-white/70 hover:text-white'}`}
            >
              {l.label}
            </button>
          ))}
          <button
            type="button"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => go(onOverview)}
            className="flex flex-col items-center gap-2"
          >
            <span className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full">
              <CircleUserRound size={20} strokeWidth={1.5} className="text-white/80" />
            </span>
            <span className="text-sm font-light text-white/60">Dein Fortschritt</span>
          </button>
        </nav>
      </div>

      {/* Navigation */}
      <header className={`relative z-20 flex shrink-0 items-center justify-between px-5 ${navPad}`}>
        <button type="button" onClick={onTraining} aria-label="Zurück zum Training" className="rounded-md">
          <svg width="32" height="32" viewBox="0 0 256 256" fill="white" aria-hidden="true">
            <path d={LOGO_PATH} />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={menuOpen}
          className="liquid-glass relative z-50 h-10 w-10 rounded-full"
        >
          <Menu
            size={20}
            className={`absolute left-1/2 top-1/2 -ml-[10px] -mt-[10px] text-white transition-all duration-300 ${
              menuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
            }`}
          />
          <X
            size={20}
            className={`absolute left-1/2 top-1/2 -ml-[10px] -mt-[10px] text-white transition-all duration-300 ${
              menuOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
            }`}
          />
        </button>
      </header>

      {/* Inhalt */}
      <main
        className={`no-scrollbar relative z-10 flex min-h-0 flex-1 flex-col justify-between overflow-y-auto px-5 pb-8 transition-opacity duration-500 ${
          menuOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <div key={phase} className={`max-w-2xl shrink-0 ${short ? 'mt-8' : 'mt-14'}`}>
          <div className="fade-up liquid-glass mb-5 inline-flex items-center gap-2.5 rounded-full px-3 py-1.5" style={delay(0.1)}>
            <div className="flex -space-x-2">
              {AVATAR_URLS.map((_, i) => (
                <Avatar key={i} index={i} nodding={live} />
              ))}
            </div>
            <span className="text-xs font-light text-white/80">
              {live && recState === 'recording' && (
                <span aria-hidden="true" className="rec-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#ff5a4f] align-middle" />
              )}
              {badge}
            </span>
          </div>

          <h1
            className={`fade-up font-normal leading-[1.05] text-white ${live ? 'text-[30px]' : 'text-4xl'}`}
            style={{ ...delay(0.18), letterSpacing: '-0.05em' }}
            aria-live={live ? 'polite' : undefined}
          >
            {heading}
          </h1>

          <p className="fade-up mt-4 text-sm font-light leading-relaxed text-white/70" style={delay(0.26)}>
            {subtitle}
          </p>

          {body}

          <div className="fade-up mt-6 flex flex-wrap items-center gap-x-5 gap-y-3" style={delay(0.5)}>
            <button
              type="button"
              onClick={cta.onClick}
              aria-disabled={cta.disabled || undefined}
              className={`liquid-glass rounded-full px-6 py-3 text-sm font-medium text-white transition duration-300 hover:bg-white/10 ${
                cta.disabled ? 'cursor-not-allowed opacity-60' : ''
              }`}
            >
              {cta.label}
            </button>
            {phase === 'result' && (
              <button type="button" onClick={() => setPhase('hero')} className="text-sm font-light text-white/70 hover:text-white">
                Zurück
              </button>
            )}
          </div>

          {phase === 'hero' && (
            <div className="mt-6 max-w-sm">
              <WhyNote why={STAGE_WHY.why} source={STAGE_WHY.source} animDelay={0.6} collapsible />
            </div>
          )}
        </div>

        <div className="mt-8 flex shrink-0 items-end gap-6">
          <Stat icon={<TriangleDots />} value={firstStat.value} label={firstStat.label} animDelay={0.55} />
          <Stat icon={<Checker />} value={secondStat.value} label={secondStat.label} animDelay={0.62} />
        </div>
      </main>
    </div>
  );
}
