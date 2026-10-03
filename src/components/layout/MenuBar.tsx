import type { SyncMode } from '../../lib/useReservations';
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
export function MenuBar({ mode }: { mode: SyncMode }) {
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
