import { useEffect, useRef, useState } from 'react';
import type { Product } from '../../data/products';
import type { Reservations } from '../../lib/useReservations';
import { Hearts, heartsLabel } from '../ui/Hearts';
import { Window } from '../ui/Window';
import { storeName } from '../../lib/format';
import './product-window.css';

interface ProductWindowProps {
  product: Product | null;
  intent?: 'reserve';
  reservations: Reservations;
  onClose: () => void;
}

type Step = 'view' | 'confirm' | 'working' | 'done' | 'taken' | 'error';

/** Ventana-aplicación con el detalle de un regalo y el flujo de reserva. */
export function ProductWindow({ product, intent, reservations, onClose }: ProductWindowProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>('view');

  // abrir / cerrar el <dialog> nativo (trae focus trap y Esc gratis)
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (product && !dlg.open) {
      dlg.showModal();
      document.documentElement.classList.add('has-modal');
    }
    if (!product && dlg.open) dlg.close();
  }, [product]);

  useEffect(() => {
    if (product) setStep(intent === 'reserve' && !reservations.reserved.has(product.id) ? 'confirm' : 'view');
    // solo al abrir un producto distinto
  }, [product?.id, intent]);

  const handleClose = () => {
    document.documentElement.classList.remove('has-modal');
    onClose();
  };

  if (!product) {
    return <dialog ref={dialogRef} className="pw" aria-label="Detalle del regalo" onClose={handleClose} />;
  }

  const reserved = reservations.reserved.has(product.id);
  const mine = reservations.mine.has(product.id);
  const store = storeName(product.url);
  const variant = product.look?.variant ?? 'window';
  const color = product.look?.color ?? 'grape';

  const doReserve = async () => {
    setStep('working');
    const res = await reservations.reserve(product.id);
    setStep(res === 'ok' ? 'done' : res === 'taken' ? 'taken' : 'error');
  };

  const doUndo = async () => {
    setStep('working');
    const ok = await reservations.unreserve(product.id);
    setStep(ok ? 'view' : 'error');
  };

  const statusText =
    reservations.mode === 'online'
      ? '● reservas compartidas: todos ven lo mismo'
      : reservations.mode === 'local'
        ? '○ modo local: la reserva queda en este navegador'
        : '… conectando';

  return (
    <dialog
      ref={dialogRef}
      className="pw"
      aria-labelledby="pw-title"
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <Window
        title="¡lo quiero!"
        color={color}
        onClose={() => dialogRef.current?.close()}
        closeLabel="Cerrar detalle"
        className="pw__win"
        status={
          <>
            <span>{statusText}</span>
            <span>esc para cerrar</span>
          </>
        }
      >
        <div className={`pw__layout pw__layout--${variant}`}>
          <figure className="pw__photo" data-color={color}>
            <img src={product.image} alt={product.imageAlt} />
            {product.imageIsPlaceholder && <figcaption>foto provisoria</figcaption>}
            {reserved && (
              <span className="stamp pw__stamp" aria-hidden="true">
                ¡reservado!
              </span>
            )}
          </figure>

          <div className="pw__info">
            <h2 id="pw-title" className="pw__name">
              {product.name}
            </h2>

            <dl className="pw__specs">
              {product.hearts && (
                <div>
                  <dt>qué tanto lo quiero</dt>
                  <dd>
                    <Hearts value={product.hearts} /> <span className="pw__muted">{heartsLabel(product.hearts)}</span>
                  </dd>
                </div>
              )}
              {product.size && (
                <div>
                  <dt>talle / variante</dt>
                  <dd className="pw__strong">{product.size}</dd>
                </div>
              )}
              {product.category && (
                <div>
                  <dt>categoría</dt>
                  <dd>{product.category}</dd>
                </div>
              )}
              {product.price && (
                <div>
                  <dt>precio</dt>
                  <dd>{product.price}</dd>
                </div>
              )}
              <div>
                <dt>dónde</dt>
                <dd>{store ?? 'sin link todavía'}</dd>
              </div>
            </dl>

            {product.description && <p className="pw__desc">{product.description}</p>}
            {product.note && (
              <blockquote className="card__note pw__note">
                <span className="pw__note-label">nota personal</span>
                {product.note}
              </blockquote>
            )}

            <div className="pw__actions" aria-live="polite">
              {step === 'confirm' && !reserved && (
                <div className="pw__confirm" role="group" aria-labelledby="pw-confirm-q">
                  <p id="pw-confirm-q">
                    <strong>¿Confirmás que lo vas a regalar vos?</strong> Lo marco como reservado para que nadie más lo compre. Es anónimo.
                  </p>
                  <div className="pw__row">
                    <button type="button" className="plastic-btn plastic-btn--sm" data-color="strawberry" onClick={doReserve} autoFocus>
                      ♡ sí, lo regalo yo
                    </button>
                    <button type="button" className="plastic-btn plastic-btn--sm plastic-btn--ghost" onClick={() => setStep('view')}>
                      cancelar
                    </button>
                  </div>
                </div>
              )}

              {step === 'working' && <p className="pw__msg lcd">guardando…</p>}

              {step === 'done' && (
                <p className="pw__msg pw__msg--ok">
                  <strong>¡Listo, quedó reservado!</strong> Gracias por pensar en mí ♥
                </p>
              )}
              {step === 'taken' && (
                <p className="pw__msg pw__msg--warn">Justo alguien lo reservó antes. ¡Elegí otro de la lista!</p>
              )}
              {step === 'error' && (
                <p className="pw__msg pw__msg--warn">
                  No se pudo guardar. Revisá tu conexión y probá de nuevo.
                </p>
              )}

              {(step === 'view' || step === 'done' || step === 'taken' || step === 'error') && (
                <div className="pw__row">
                  {product.url && (
                    <a className="plastic-btn" data-color="tangerine" href={product.url} target="_blank" rel="noopener noreferrer">
                      ir a {store ?? 'la tienda'} <span aria-hidden="true">↗</span>
                      <span className="sr-only">(abre en una pestaña nueva)</span>
                    </a>
                  )}
                  {!reserved && (
                    <button type="button" className="plastic-btn plastic-btn--ghost" onClick={() => setStep('confirm')}>
                      ♡ lo regalo yo
                    </button>
                  )}
                  {reserved && !mine && <span className="reserved-chip">✓ ya está reservado</span>}
                </div>
              )}

              {reserved && mine && step !== 'working' && (
                <p className="pw__undo">
                  Lo reservaste vos.{' '}
                  <button type="button" onClick={doUndo}>
                    deshacer reserva
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </Window>
    </dialog>
  );
}
