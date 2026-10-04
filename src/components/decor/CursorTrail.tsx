import { useEffect, useRef } from 'react';

/** Estelas rosa / celeste / verde que siguen al cursor, como volando. Solo con mouse. */
const COLORS = ['#ff5fa8', '#4fc3f7', '#7ed957'];
const OUTLINE = '#1d0b22';
const LIFE_MS = 420; // cuánto dura cada punto de la estela
const BAND = 9; // ancho de cada franja (px) en la punta
const COLOR_ALPHA = 0.6;
const OUTLINE_ALPHA = 0.35;

interface Pt {
  x: number;
  y: number;
  t: number;
}

export function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const fine = window.matchMedia('(pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduce.matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };
    resize();

    const pts: Pt[] = [];
    let raf = 0;

    const draw = () => {
      const now = performance.now();
      while (pts.length && now - pts[0].t > LIFE_MS) pts.shift();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (pts.length > 1) {
        // cada segmento: franjas paralelas desplazadas a lo ancho del recorrido
        const n = pts.length;
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 1; i < n; i++) {
            const a = pts[i - 1];
            const b = pts[i];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;
            const life = 1 - (now - b.t) / LIFE_MS; // 1 = recién, 0 = viejo
            const w = BAND * (0.25 + 0.75 * life);
            // translúcida; el contorno más suave que los colores
            ctx.globalAlpha = Math.max(0, life) * (pass === 0 ? OUTLINE_ALPHA : COLOR_ALPHA);
            // butt: sin punto oscuro en la punta ni "puntitos" en las uniones
            ctx.lineCap = 'butt';
            if (pass === 0) {
              // contorno: una franja ancha oscura detrás de las tres
              ctx.strokeStyle = OUTLINE;
              ctx.lineWidth = w * 3 + 4;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            } else {
              COLORS.forEach((c, k) => {
                const off = (k - 1) * w;
                ctx.strokeStyle = c;
                ctx.lineWidth = w;
                ctx.beginPath();
                ctx.moveTo(a.x + nx * off, a.y + ny * off);
                ctx.lineTo(b.x + nx * off, b.y + ny * off);
                ctx.stroke();
              });
            }
          }
        }
        ctx.globalAlpha = 1;
      }
      raf = pts.length ? requestAnimationFrame(draw) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      const last = pts[pts.length - 1];
      // evita puntos casi iguales (líneas más limpias)
      if (last && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 3) return;
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (!raf) raf = requestAnimationFrame(draw);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="cursor-trail" aria-hidden="true" />;
}
