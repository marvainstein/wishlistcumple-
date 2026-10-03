import type { SyncMode } from '../../lib/useReservations';
import type { Music } from '../../lib/useMusic';
import './menubar.css';

const LINKS = [
  { href: '#inicio', label: 'inicio', color: 'strawberry' },
  { href: '#wishlist', label: 'wishlist', color: 'blueberry' },
  { href: '#como', label: 'cómo funciona', color: 'lime' },
];

const MODE_LABEL: Record<SyncMode, string> = {
  connecting: 'conectando…',
  online: 'reservas en vivo',
  local: 'modo local',
};

/** Navegación flotante: una pastilla de dibujo animado con tres botones de color. */
export function MenuBar({ mode, music }: { mode: SyncMode; music: Music }) {
  return (
    <header className="menubar">
      <nav className="menubar__inner" aria-label="Navegación principal">
        <a className="menubar__logo" href="#inicio" aria-label="Mi cumple, ir al inicio">
          <span aria-hidden="true">★</span> mi cumple
        </a>
        <ul className="menubar__links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} data-color={l.color}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        {music.available && (
          <button
            type="button"
            className="menubar__music"
            aria-pressed={music.playing}
            aria-label={music.playing ? 'Pausar la música' : 'Poner la música'}
            onClick={music.toggle}
          >
            <span aria-hidden="true">{music.playing ? '♫' : '♪'}</span>
            <span className="menubar__music-label" aria-hidden="true">{music.playing ? 'pausar' : 'música'}</span>
          </button>
        )}
        <span
          className={`menubar__led menubar__led--${mode}`}
          title={mode === 'local' ? 'Las reservas solo se guardan en este navegador' : 'Las reservas se comparten con todos'}
        >
          <span className="menubar__dot" aria-hidden="true">♥</span>
          <span className="menubar__mode">{MODE_LABEL[mode]}</span>
        </span>
      </nav>
    </header>
  );
}
