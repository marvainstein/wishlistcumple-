import type { CSSProperties, ReactNode } from 'react';
import type { PlasticColor } from '../../data/products';

interface WindowProps {
  title: string;
  color?: PlasticColor;
  status?: ReactNode;
  /** botón real de cerrar (solo en paneles que se pueden cerrar) */
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
  screenClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: 'div' | 'section' | 'article';
  labelledBy?: string;
}

/** Panel de dibujo animado: contorno grueso, solapa de color con estrellitas y sombra dura. */
export function Window({
  title,
  color = 'grape',
  status,
  onClose,
  closeLabel = 'Cerrar',
  className = '',
  screenClassName = '',
  style,
  children,
  as: Tag = 'div',
  labelledBy,
}: WindowProps) {
  return (
    <Tag className={`win toon ${className}`} data-color={color} style={style} aria-labelledby={labelledBy}>
      <div className="win__bar">
        <span className="win__stars" aria-hidden="true">★ ★ ★</span>
        <div className="win__title" aria-hidden="true">
          {title}
        </div>
        {onClose ? (
          <button type="button" className="win__close" onClick={onClose} aria-label={closeLabel}>
            <span aria-hidden="true">×</span>
          </button>
        ) : (
          <span className="win__heart" aria-hidden="true">♥</span>
        )}
      </div>
      <div className={`win__screen ${screenClassName}`}>{children}</div>
      {status && <div className="win__status">{status}</div>}
    </Tag>
  );
}
