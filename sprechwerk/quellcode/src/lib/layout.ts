import { createContext, useContext, useEffect, useState } from 'react';

// compact = Handy-Breite: Die App füllt dann den ganzen Bildschirm statt im Handy-Rahmen zu stehen.
// short = compact und niedriger Bildschirm: Abstände werden etwas enger.
export const LayoutContext = createContext<{ compact: boolean; short: boolean }>({ compact: false, short: false });

export const useLayout = () => useContext(LayoutContext);

/** Abstand oben: 56 px im Handy-Rahmen (Platz für die Dynamic Island), sonst weniger. */
export function useTopPad(): string {
  const { compact, short } = useLayout();
  if (!compact) return 'pt-14';
  return short ? 'pt-8' : 'pt-10';
}

export function useViewport(): { w: number; h: number } {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  return vp;
}
