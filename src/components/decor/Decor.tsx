import type { CSSProperties } from 'react';

/* Objetos de época puramente decorativos (aria-hidden). */

export function CompactDisc({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`cd ${className}`} style={style} aria-hidden="true">
      <div className="cd__label">
        <span>MIX</span>
        <span>cumple</span>
      </div>
    </div>
  );
}

export function Floppy({ label = 'deseos.dsk', className = '', style }: { label?: string; className?: string; style?: CSSProperties }) {
  return (
    <div className={`floppy ${className}`} style={style} aria-hidden="true">
      <div className="floppy__shutter" />
      <div className="floppy__label">{label}</div>
    </div>
  );
}

export function PointerArrow({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={`pointer-arrow ${className}`} style={style} viewBox="0 0 22 26" aria-hidden="true">
      <path
        d="M2 2 L2 20 L7 15.5 L10.5 23 L14 21.5 L10.6 14.2 L17.5 14 Z"
        fill="#fff"
        stroke="#2b2150"
        strokeWidth="2"
        strokeLinejoin="round"
      />
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
