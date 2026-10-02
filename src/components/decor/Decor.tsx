import type { CSSProperties } from 'react';
import { SUN_FACE } from '../../config';

/* Elementos decorativos del paisaje (aria-hidden, salvo indicación). */

/** Sol enorme con rayos, haz de luz y una cara (foto o carita dibujada). */
export function Sun({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`sun ${className}`} style={style} aria-hidden="true">
      <div className="sun__beams" />
      <div className="sun__glow" />
      <svg className="sun__rays" viewBox="-100 -100 200 200">
        <defs>
          <radialGradient id="sunRay" r="0.5">
            <stop offset="0.45" stopColor="#fff4a8" />
            <stop offset="0.8" stopColor="#ffd23a" />
            <stop offset="1" stopColor="#ffc21f" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <polygon points={spikes(22, 96, 62)} fill="url(#sunRay)" />
      </svg>
      <div className="sun__face">
        {SUN_FACE ? (
          <img src={SUN_FACE} alt="" />
        ) : (
          <svg viewBox="0 0 100 100" className="sun__drawn">
            <ellipse cx="34" cy="44" rx="5" ry="6.5" fill="#5b3a12" />
            <ellipse cx="66" cy="44" rx="5" ry="6.5" fill="#5b3a12" />
            <circle cx="35.6" cy="41.6" r="1.7" fill="#fff" />
            <circle cx="67.6" cy="41.6" r="1.7" fill="#fff" />
            <ellipse cx="24" cy="60" rx="8" ry="5" fill="#ff9a5c" opacity="0.55" />
            <ellipse cx="76" cy="60" rx="8" ry="5" fill="#ff9a5c" opacity="0.55" />
            <path d="M36 62 Q50 76 64 62" fill="none" stroke="#5b3a12" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
}

/** Polígono de rayos alternando radio largo y corto. */
function spikes(n: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Nube esponjosa hecha de bolitas. */
export function Cloud({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`cloud ${className}`} style={style} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

/**
 * Colinas redondeadas en capas. "back" = las del fondo; "front" = la de adelante,
 * del mismo verde que el pasto de .meadow (así el paisaje sigue hacia abajo).
 * Entre las dos capas se pueden asomar cosas (los bichitos).
 */
export function Hills({ layer, className = '' }: { layer: 'back' | 'front'; className?: string }) {
  return (
    <svg className={`hills hills--${layer} ${className}`} viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`hillA-${layer}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c2f07a" />
          <stop offset="1" stopColor="#86cf47" />
        </linearGradient>
        <linearGradient id={`hillB-${layer}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a6e44f" />
          <stop offset="1" stopColor="#6cc13a" />
        </linearGradient>
      </defs>
      {layer === 'back' ? (
        <>
          <path d="M0 110 C 180 30, 380 40, 560 100 S 900 30, 1100 80 S 1340 60, 1440 90 V260 H0Z" fill={`url(#hillA-${layer})`} />
          <path d="M0 165 C 220 85, 420 105, 640 155 S 1000 75, 1220 135 S 1400 145, 1440 135 V260 H0Z" fill="#7cc944" />
        </>
      ) : (
        <path d="M0 215 C 260 150, 520 175, 760 210 S 1180 165, 1440 200 V260 H0Z" fill={`url(#hillB-${layer})`} />
      )}
    </svg>
  );
}

const FLOWER_COLORS = ['#ffffff', '#ffd23a', '#ef3b36', '#ffffff', '#ff8fc8', '#ffd23a'];

/** Florcitas tipo margarita, para salpicar el pasto. */
export function Flower({ color, className = '', style }: { color?: string; className?: string; style?: CSSProperties }) {
  const c = color ?? FLOWER_COLORS[0];
  return (
    <svg className={`flower ${className}`} style={style} viewBox="-20 -20 40 40" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ellipse key={i} cx="0" cy="-9" rx="5.5" ry="9" fill={c} transform={`rotate(${i * 60})`} />
      ))}
      <circle r="6" fill={c === '#ffd23a' ? '#e8730c' : '#ffc21f'} />
    </svg>
  );
}

export function Flowers({ count = 14, seed = 1, className = '' }: { count?: number; seed?: number; className?: string }) {
  // pseudo-azar determinístico para que no cambien en cada render
  let x = seed * 9301 + 49297;
  const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  return (
    <div className={`flowers ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <Flower
          key={i}
          color={FLOWER_COLORS[i % FLOWER_COLORS.length]}
          style={{ left: `${rnd() * 100}%`, top: `${rnd() * 100}%`, width: `${12 + rnd() * 14}px`, rotate: `${rnd() * 60}deg` }}
        />
      ))}
    </div>
  );
}

/**
 * Bichitos de peluche propios (homenaje, no copia): cuerpo redondo, carita clara
 * y una antena con forma distinta cada uno.
 */
export type CritterKind = 'star' | 'heart' | 'swirl' | 'bulb';
const CRITTERS: Record<CritterKind, { body: string; dark: string }> = {
  star: { body: '#8b55d6', dark: '#5f2fa8' },
  heart: { body: '#ef3b36', dark: '#b51e1a' },
  swirl: { body: '#93d93b', dark: '#5d9e1a' },
  bulb: { body: '#ffcf2e', dark: '#d99a00' },
};

export function Critter({ kind, className = '', style }: { kind: CritterKind; className?: string; style?: CSSProperties }) {
  const { body, dark } = CRITTERS[kind];
  return (
    <svg className={`critter critter--${kind} ${className}`} style={style} viewBox="0 0 120 150" aria-hidden="true">
      <defs>
        <radialGradient id={`fur-${kind}`} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.35" stopColor={body} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
      </defs>
      {/* antena */}
      <g stroke={dark} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M60 42 L60 18" />
      </g>
      {kind === 'star' && <polygon points="60,2 64,12 75,12 66,18 69,29 60,23 51,29 54,18 45,12 56,12" fill={body} stroke={dark} strokeWidth="2.5" strokeLinejoin="round" />}
      {kind === 'heart' && <path d="M60 22 C 48 12, 46 0, 55 0 C 58 0, 60 3, 60 5 C 60 3, 62 0, 65 0 C 74 0, 72 12, 60 22Z" fill={body} stroke={dark} strokeWidth="2.5" />}
      {kind === 'swirl' && <path d="M60 18 C 60 8, 72 6, 72 14 C 72 22, 58 22, 58 12 C 58 4, 66 0, 70 2" fill="none" stroke={dark} strokeWidth="5" strokeLinecap="round" />}
      {kind === 'bulb' && <circle cx="60" cy="11" r="9" fill={body} stroke={dark} strokeWidth="2.5" />}
      {/* cuerpo */}
      <ellipse cx="60" cy="100" rx="52" ry="60" fill={`url(#fur-${kind})`} />
      {/* orejitas */}
      <ellipse cx="14" cy="76" rx="9" ry="14" fill={body} stroke={dark} strokeWidth="2" />
      <ellipse cx="106" cy="76" rx="9" ry="14" fill={body} stroke={dark} strokeWidth="2" />
      {/* carita */}
      <ellipse cx="60" cy="78" rx="30" ry="27" fill="#fbe6d4" />
      <ellipse cx="60" cy="72" rx="24" ry="14" fill="#fff" opacity="0.35" />
      <circle cx="49" cy="76" r="4" fill="#3a2414" />
      <circle cx="71" cy="76" r="4" fill="#3a2414" />
      <circle cx="50.3" cy="74.6" r="1.3" fill="#fff" />
      <circle cx="72.3" cy="74.6" r="1.3" fill="#fff" />
      <path d="M50 88 Q60 97 70 88" fill="#7a2a1e" />
      {/* bracito saludando */}
      <path className="critter__arm" d="M98 104 C 112 92, 116 80, 112 72" stroke={body} strokeWidth="16" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function PointerArrow({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={`pointer-arrow ${className}`} style={style} viewBox="0 0 22 26" aria-hidden="true">
      <path d="M2 2 L2 20 L7 15.5 L10.5 23 L14 21.5 L10.6 14.2 L17.5 14 Z" fill="#fff" stroke="#1c2a56" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function Sparkle({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={`sparkle ${className}`} style={style} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.8 6.4 4.6 10.6 12 12-7.4 1.4-11.2 5.6-12 12-.8-6.4-4.6-10.6-12-12C7.4 10.6 11.2 6.4 12 0z" />
    </svg>
  );
}
