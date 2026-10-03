import { useEffect, useRef } from 'react';
import { Sun } from './Decor';

/**
 * El sol (con la cara de Luli) te acompaña mientras scrolleás: arranca en el hueco
 * del hero (data-sun-slot="start"), después te sigue asomándose desde el borde
 * derecho (con un poco de retraso y balanceo) y se pone en el hueco del cierre
 * (data-sun-slot="end").
 */
export function SunCompanion({ up }: { up: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    // posiciones de los huecos en coordenadas del documento
    let start = { x: 0, y: 0, s: 300 };
    let end = { x: 0, y: 0, s: 300 };
    let maxScroll = 1;
    const measure = () => {
      const a = document.querySelector<HTMLElement>('[data-sun-slot="start"]');
      const b = document.querySelector<HTMLElement>('[data-sun-slot="end"]');
      if (!a || !b) return;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      start = { x: ra.left, y: ra.top + window.scrollY, s: ra.width };
      end = { x: rb.left, y: rb.top + window.scrollY, s: rb.width };
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    const cur = { x: 0, y: 0, s: 0, tilt: 0 };
    let first = true;
    let raf = 0;
    let lastY = window.scrollY;

    const smooth = (t: number) => t * t * (3 - 2 * t);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // tramo 1 (0 → IN): del hero al borde; tramo 2: te sigue asomándose desde el borde
    // derecho; tramo 3 (OUT → 1): baja a ponerse en el cierre
    const IN = 0.14;
    const OUT = 0.86;
    const target = () => {
      const sy = window.scrollY;
      const p = Math.min(1, Math.max(0, sy / maxScroll));
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sideS = Math.max(110, Math.min(start.s, end.s) * 0.55);
      const side = {
        x: vw - sideS * 0.78,
        // se mece un poco mientras te acompaña
        y: vh * 0.32 + Math.sin(p * Math.PI * 6) * vh * 0.05,
        s: sideS,
      };
      const a = { x: start.x, y: start.y - sy, s: start.s };
      const b = { x: end.x, y: end.y - sy, s: end.s };
      if (p <= IN) {
        const t = smooth(p / IN);
        return { x: lerp(a.x, side.x, t), y: lerp(a.y, side.y, t), s: lerp(a.s, side.s, t) };
      }
      if (p >= OUT) {
        const t = smooth((p - OUT) / (1 - OUT));
        return { x: lerp(side.x, b.x, t), y: lerp(side.y, b.y, t), s: lerp(side.s, b.s, t) };
      }
      return side;
    };

    const tick = () => {
      const t = target();
      const k = reduce.matches || first ? 1 : 0.09;
      first = false;
      cur.x += (t.x - cur.x) * k;
      cur.y += (t.y - cur.y) * k;
      cur.s += (t.s - cur.s) * k;
      const vel = window.scrollY - lastY;
      lastY = window.scrollY;
      const tiltTarget = reduce.matches ? 0 : Math.max(-14, Math.min(14, vel * 0.5));
      cur.tilt += (tiltTarget - cur.tilt) * 0.12;
      el.style.width = `${cur.s}px`;
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) rotate(${cur.tilt}deg)`;
      const moving =
        Math.abs(t.x - cur.x) > 0.3 || Math.abs(t.y - cur.y) > 0.3 || Math.abs(t.s - cur.s) > 0.3 || Math.abs(cur.tilt) > 0.2;
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      first = true;
      wake();
    };

    measure();
    tick();
    // las fotos y fuentes pueden mover los huecos al cargar
    const late = window.setTimeout(onResize, 1200);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
    };
  }, []);

  return (
    <div ref={ref} className={`sun-companion${up ? ' is-up' : ''}`} aria-hidden="true">
      <Sun className="sun-companion__sun" />
    </div>
  );
}
