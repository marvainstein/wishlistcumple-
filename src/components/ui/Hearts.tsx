interface HeartsProps {
  value?: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
}

const LABELS = { 1: 'me gustaría', 2: 'lo quiero mucho', 3: 'lo quiero muchísimo' } as const;

/** Medidor de "qué tanto lo quiero" (1 a 3). */
export function Hearts({ value, size = 'md' }: HeartsProps) {
  if (!value) return null;
  return (
    <span className={`hearts hearts--${size}`} role="img" aria-label={`Qué tanto lo quiero: ${value} de 3 (${LABELS[value]})`}>
      {[1, 2, 3].map((n) => (
        <svg key={n} viewBox="0 0 24 22" className={n <= value ? 'is-on' : ''} aria-hidden="true">
          <path d="M12 21s-8.5-5.3-10.6-10.4C-.1 6.9 2.4 2 6.8 2c2.3 0 3.9 1.2 5.2 3 1.3-1.8 2.9-3 5.2-3 4.4 0 6.9 4.9 5.4 8.6C20.5 15.7 12 21 12 21z" />
        </svg>
      ))}
    </span>
  );
}

export function heartsLabel(value?: 1 | 2 | 3): string | undefined {
  return value ? LABELS[value] : undefined;
}
