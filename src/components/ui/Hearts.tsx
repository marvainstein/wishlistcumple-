interface HeartsProps {
  size?: 'sm' | 'md' | 'lg';
}

/** Tres corazones decorativos (iguales en todos los regalos: no son un puntaje). */
export function Hearts({ size = 'md' }: HeartsProps) {
  return (
    <span className={`hearts hearts--${size}`} aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <svg key={n} viewBox="0 0 24 22" className="is-on">
          <path d="M12 21s-8.5-5.3-10.6-10.4C-.1 6.9 2.4 2 6.8 2c2.3 0 3.9 1.2 5.2 3 1.3-1.8 2.9-3 5.2-3 4.4 0 6.9 4.9 5.4 8.6C20.5 15.7 12 21 12 21z" />
        </svg>
      ))}
    </span>
  );
}
