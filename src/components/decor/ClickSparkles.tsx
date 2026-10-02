import { useEffect } from 'react';

const COLORS = ['#ff8a1f', '#ff5a94', '#4b66ff', '#bfe83a', '#9d63ff', '#16b9cc'];

/** Pequeña explosión de estrellitas en cada click (se apaga con reduced-motion). */
export function ClickSparkles() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onDown = (e: PointerEvent) => {
      if (reduce.matches || e.button !== 0) return;
      for (let i = 0; i < 7; i++) {
        const s = document.createElement('span');
        s.className = 'click-spark';
        const angle = (Math.PI * 2 * i) / 7 + Math.random() * 0.5;
        const dist = 26 + Math.random() * 22;
        s.style.left = `${e.clientX}px`;
        s.style.top = `${e.clientY}px`;
        s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
        s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
        s.style.background = COLORS[i % COLORS.length];
        document.body.appendChild(s);
        s.addEventListener('animationend', () => s.remove());
      }
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);
  return null;
}
