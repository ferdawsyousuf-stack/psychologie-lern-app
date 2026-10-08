import { useRef, useState } from 'react';

// Abwechslung ohne Wiederholung: Jede Liste wird in Sprüngen durchlaufen, die zur Länge teilerfremd
// sind. So kommt jedes Beispiel einmal dran, bevor sich eines wiederholt, und aufeinanderfolgende
// Trainings liegen inhaltlich weit auseinander.

const STEPS = [7, 11, 13, 17, 19, 23, 29, 31];

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** Sprungweite für eine Liste dieser Länge. */
export function stepFor(len: number): number {
  return STEPS.find((s) => s % len !== 0 && gcd(s, len) === 1) ?? 1;
}

/**
 * Welches Beispiel beim n-ten Mal dran ist. Zwei Übungen, die dieselbe Liste nutzen,
 * bekommen mit verschiedenem `salt` nie dasselbe Beispiel.
 */
export function rotate(len: number, counter: number, salt = 0): number {
  if (len <= 0) return 0;
  return (((counter * stepFor(len) + salt) % len) + len) % len;
}

/** Ein zufälliges Beispiel, das in dieser Runde noch nicht dran war. */
export function another(len: number, seen: readonly number[]): number {
  if (len <= 1) return 0;
  const options: number[] = [];
  for (let i = 0; i < len; i += 1) if (!seen.includes(i)) options.push(i);
  if (!options.length) return (seen[seen.length - 1] + 1) % len;
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Aktuelles Beispiel einer Liste und ein „Anderes Beispiel“-Knopf dazu.
 * Erst wenn alle einmal dran waren, kann eines wiederkommen.
 */
export function usePick(len: number, initial: number): [number, () => void] {
  const [index, setIndex] = useState(() => (len > 0 ? ((initial % len) + len) % len : 0));
  const seen = useRef<number[]>([index]);
  const next = () => {
    if (len <= 1) return;
    if (seen.current.length >= len) seen.current = [seen.current[seen.current.length - 1]];
    const i = another(len, seen.current);
    seen.current = [...seen.current, i];
    setIndex(i);
  };
  return [index, next];
}
