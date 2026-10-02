import type { CSSProperties, ReactNode } from 'react';
import type { PlasticColor } from '../../data/products';

interface WindowProps {
  title: string;
  color?: PlasticColor;
  status?: ReactNode;
  /** botón real de cerrar (solo en ventanas que se pueden cerrar) */
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
  screenClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: 'div' | 'section' | 'article';
  labelledBy?: string;
}

/** Ventana de "sistema operativo 2001" con bisel de plástico translúcido. */
export function Window({
  title,
  color = 'grape',
  status,
  onClose,
  closeLabel = 'Cerrar ventana',
  className = '',
  screenClassName = '',
  style,
  children,
  as: Tag = 'div',
  labelledBy,
}: WindowProps) {
  return (
    <Tag className={`win ${className}`} data-color={color} style={style} aria-labelledby={labelledBy}>
      <div className="win__bar">
        {onClose ? (
          <div className="win__lights">
            <button type="button" className="win__close" onClick={onClose} aria-label={closeLabel}>
              <span aria-hidden="true">×</span>
            </button>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </div>
        ) : (
          <div className="win__lights" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
        <div className="win__title" aria-hidden="true">
          {title}
        </div>
        <div className="win__lights win__lights--ghost" aria-hidden="true" />
      </div>
      <div className={`win__screen ${screenClassName}`}>{children}</div>
      {status && <div className="win__status">{status}</div>}
    </Tag>
  );
}
