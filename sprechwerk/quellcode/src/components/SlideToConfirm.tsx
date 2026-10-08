import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

const PAD = 6;
const THUMB = 44;
const THRESHOLD = 0.85;

/**
 * Schieberegler zum Bestätigen. Rastet am Ende ein, wenn er über 85 % gezogen wird,
 * sonst springt er zurück. Mit der Tastatur: Enter, Leertaste oder Pfeil nach rechts.
 */
export function SlideToConfirm({
  label,
  onConfirm,
  blockedLabel = null,
}: {
  label: string;
  onConfirm: () => void;
  blockedLabel?: string | null;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [locked, setLocked] = useState(false);
  const xRef = useRef(0);
  const start = useRef({ pointer: 0, x: 0, scale: 1 });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const maxX = () => {
    const el = track.current;
    return el ? Math.max(1, el.offsetWidth - THUMB - PAD * 2) : 271;
  };

  const setPos = (value: number) => {
    xRef.current = value;
    setX(value);
  };

  const complete = () => {
    if (blockedLabel) {
      setPos(0);
      return;
    }
    setLocked(true);
    setPos(maxX());
    window.setTimeout(() => onConfirm(), 300);
    window.setTimeout(() => {
      if (!mounted.current) return;
      setLocked(false);
      setPos(0);
    }, 900);
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (locked) return;
    const el = track.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    start.current = { pointer: e.clientX, x: xRef.current, scale: el.offsetWidth ? rect.width / el.offsetWidth : 1 };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const dx = (e.clientX - start.current.pointer) / start.current.scale;
    setPos(Math.max(0, Math.min(maxX(), start.current.x + dx)));
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (xRef.current / maxX() > THRESHOLD) complete();
    else setPos(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (locked) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault();
      complete();
    }
  };

  const progress = x / maxX();
  const fade = Math.max(0, 1 - progress * 1.4);
  const text = blockedLabel ?? label;

  return (
    <div ref={track} className="liquid-glass relative h-14 rounded-full select-none" style={{ touchAction: 'none' }}>
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-16 text-center text-[14px] font-medium text-white/60"
        style={{ opacity: fade }}
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-5 flex items-center"
        style={{ opacity: fade }}
      >
        <ChevronRight size={14} className="-mr-1 text-white/40" />
        <ChevronRight size={14} className="-mr-1 text-white/50" />
        <ChevronRight size={14} className="text-white/60" />
      </span>
      <button
        type="button"
        aria-label={`${text}: zum Bestätigen nach rechts schieben`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="absolute left-[6px] top-[6px] flex h-11 w-11 cursor-grab items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] active:cursor-grabbing"
        style={{
          transform: `translateX(${x}px)`,
          transition: dragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          touchAction: 'none',
        }}
      >
        <ArrowRight size={20} className="text-gray-800" />
      </button>
    </div>
  );
}
