import { useEffect, useRef, useState } from 'react';

export const STAGE_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_082433_69699cf8-444b-4484-93cc-053e57896dfd.mp4';

/**
 * Gezeichnetes Bühnenlicht: ein warmer Spot, der langsam wandert, ein Lichtkegel auf dem Boden,
 * kühles Seitenlicht und Staub, der im Licht aufsteigt. Läuft mit ca. 30 Bildern pro Sekunde
 * und steht still, wenn reduzierte Bewegung eingestellt ist.
 */
function StageLights() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(canvas);

    const motes = Array.from({ length: 36 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.7,
      speed: 0.008 + Math.random() * 0.018,
      drift: (Math.random() - 0.5) * 0.012,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.15 + Math.random() * 0.4,
    }));

    const glow = (x: number, y: number, rx: number, ry: number, rgb: string, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, `rgba(${rgb},${alpha})`);
      g.addColorStop(0.45, `rgba(${rgb},${alpha * 0.42})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let raf = 0;
    let last = 0;
    let lastDraw = 0;
    const draw = (now: number) => {
      if (!reduce) raf = requestAnimationFrame(draw);
      if (!reduce && now - lastDraw < 32) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      lastDraw = now;
      const t = now / 1000;

      ctx.globalCompositeOperation = 'source-over';
      const base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, '#141b27');
      base.addColorStop(0.55, '#212b3b');
      base.addColorStop(1, '#0d1219');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      const pulse = 0.9 + 0.1 * Math.sin(t * 0.5);
      const spot = 0.52 + 0.16 * Math.sin(t * 0.11);
      const spotX = w * spot;
      // Lichtkegel von oben, Quelle unter der Kante, Lichtpfütze auf dem Boden
      glow(spotX, h * 0.42, w * 0.3, h * 0.62, '255,214,160', 0.12 * pulse);
      glow(spotX, h * 0.11, w * 0.3, h * 0.09, '255,226,180', 0.36 * pulse);
      glow(w * (0.2 + spot * 0.6), h * 0.9, w * 0.72, h * 0.12, '255,190,125', 0.26 * pulse);
      // Seitenlichter
      glow(w * (0.08 + 0.06 * Math.sin(t * 0.09 + 2)), h * 0.58, w * 0.55, h * 0.45, '95,140,215', 0.22);
      glow(w * (0.94 + 0.05 * Math.sin(t * 0.07 + 4)), h * 0.3, w * 0.45, h * 0.32, '150,120,215', 0.12);

      for (const m of motes) {
        if (!reduce) {
          m.y -= m.speed * dt;
          m.x += m.drift * dt + Math.sin(t * 0.6 + m.phase) * 0.00025;
          if (m.y < -0.04) {
            m.y = 1.04;
            m.x = Math.random();
          }
        }
        const twinkle = 0.55 + 0.45 * Math.sin(t * 1.3 + m.phase);
        const inBeam = Math.exp(-((m.x - spot) ** 2) / 0.012);
        const alpha = Math.min(0.95, m.alpha * twinkle * (0.6 + 1.6 * inBeam));
        ctx.fillStyle = `rgba(255,236,205,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(m.x * w, m.y * h, m.r * (1 + 0.4 * inBeam), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      const vignette = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.25, w / 2, h * 0.5, Math.max(w, h) * 0.78);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

/** Hintergrund der Bühne: das Video aus dem Design, darunter das gezeichnete Bühnenlicht als Ersatz. */
export function StageBackground() {
  const [videoOk, setVideoOk] = useState(!__ARTIFACT__);
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <StageLights />
      {videoOk && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={STAGE_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoOk(false)}
        />
      )}
    </div>
  );
}
