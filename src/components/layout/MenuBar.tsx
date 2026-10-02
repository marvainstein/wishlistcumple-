import { useEffect, useState } from 'react';
import type { SyncMode } from '../../lib/useReservations';
import './menubar.css';

const LINKS = [
  { href: '#inicio', label: 'inicio', icon: '★' },
  { href: '#wishlist', label: 'wishlist', icon: '♡' },
  { href: '#como', label: 'cómo funciona', icon: '?' },
];

const MODE_LABEL: Record<SyncMode, string> = {
  connecting: 'conectando…',
  online: 'en línea',
  local: 'modo local',
};

/** Barra de menú del "sistema operativo": navegación + estado de sincronización + reloj. */
export function MenuBar({ mode }: { mode: SyncMode }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setTime(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const hhmm = time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="menubar">
      <nav className="menubar__inner" aria-label="Navegación principal">
        <a className="menubar__logo" href="#inicio" aria-label="Wish.OS, ir al inicio">
          <span className="menubar__apple" aria-hidden="true">✿</span>
          <span>Wish.OS</span>
        </a>
        <ul className="menubar__links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>
                <span aria-hidden="true">{l.icon}</span> {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="menubar__tray">
          <span
            className={`menubar__led menubar__led--${mode}`}
            title={mode === 'local' ? 'Las reservas solo se guardan en este navegador' : 'Las reservas se comparten con todos'}
          >
            <span className="menubar__dot" aria-hidden="true" />
            <span className="menubar__mode">{MODE_LABEL[mode]}</span>
          </span>
          <time className="menubar__clock" dateTime={time.toISOString()}>
            {hhmm}
          </time>
        </div>
      </nav>
    </header>
  );
}
