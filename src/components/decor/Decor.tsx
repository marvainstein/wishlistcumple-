import type { CSSProperties } from 'react';
import { SCENE_IMAGE, SUN_FACE, SUN_IMAGE } from '../../config';

/* Elementos decorativos (aria-hidden). */

/** Paisaje fotográfico fijo detrás de toda la página. */
export function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <img src={SCENE_IMAGE} alt="" />
    </div>
  );
}

/** El sol (foto), con bordes fundidos en el cielo y, opcional, otra cara en el centro. */
export function Sun({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`sun ${className}`} style={style} aria-hidden="true">
      <div className="sun__glow" />
      <img className="sun__photo" src={SUN_IMAGE} alt="" />
      {SUN_FACE && (
        <div className="sun__face">
          <img src={SUN_FACE} alt="" />
        </div>
      )}
    </div>
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
