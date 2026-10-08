import { buzz } from '../lib/device';

/** Skala von 0 bis 10 als Reihe runder Glas-Knöpfe. */
export function Rating({
  value,
  onChange,
  label,
  low = 'ganz entspannt',
  high = 'maximal',
}: {
  value: number | null;
  onChange: (n: number) => void;
  label: string;
  low?: string;
  high?: string;
}) {
  return (
    <div>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => {
              onChange(n);
              buzz(8);
            }}
            className={`h-9 rounded-full text-[13px] tabular-nums transition-colors duration-200 ${
              value === n ? 'liquid-glass-selected font-semibold text-white' : 'liquid-glass text-white/75'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between px-1 text-[11px] font-light text-white/50">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

