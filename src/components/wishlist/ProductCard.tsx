import type { CSSProperties, ReactNode } from 'react';
import type { CardVariant, PlasticColor, Product } from '../../data/products';
import { Hearts } from '../ui/Hearts';
import { Window } from '../ui/Window';
import { storeName } from '../../lib/format';
import './cards.css';

export interface CardProps {
  product: Product;
  reserved: boolean;
  mine: boolean;
  onOpen: (id: string, intent?: 'reserve') => void;
  /** reservar directo (para regalos cuyo link ya implica reservar) */
  onQuickReserve?: (id: string) => void;
  style?: CSSProperties;
}

const DEFAULT_COLOR: Record<CardVariant, PlasticColor> = {
  hardware: 'blueberry',
  blister: 'lime',
  snapshot: 'strawberry',
  window: 'grape',
};

/** Elige la presentación según product.look.variant (por defecto: ventana). */
export function ProductCard(props: CardProps) {
  const variant = props.product.look?.variant ?? 'window';
  const color = props.product.look?.color ?? DEFAULT_COLOR[variant];
  const shared = { ...props, color };
  switch (variant) {
    case 'hardware':
      return <HardwareCard {...shared} />;
    case 'blister':
      return <BlisterCard {...shared} />;
    case 'snapshot':
      return <SnapshotCard {...shared} />;
    default:
      return <WindowCard {...shared} />;
  }
}

type VariantProps = CardProps & { color: PlasticColor };

/* ------------------------------------------------------------------ */
/* Piezas compartidas                                                  */
/* ------------------------------------------------------------------ */

function cardClass(base: string, reserved: boolean) {
  return `card ${base}${reserved ? ' is-reserved' : ''}`;
}

/** La foto es un botón real que abre la ventana del producto. */
function PhotoButton({ product, onOpen, className = '', children }: {
  product: Product;
  onOpen: CardProps['onOpen'];
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button type="button" className={`card__photo ${className}`} onClick={() => onOpen(product.id)}>
      <img src={product.image} alt={product.imageAlt} loading="lazy" decoding="async" />
      {children}
      <span className="sr-only">Ver detalles de {product.name}</span>
    </button>
  );
}

function Note({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="card__note">“{text}”</p>;
}

function Meta({ product }: { product: Product }) {
  const items: ReactNode[] = [];
  if (product.size) items.push(<span key="size" className="chip chip--size">{product.size}</span>);
  if (product.category) items.push(<span key="cat" className="chip">{product.category}</span>);
  if (product.price) items.push(<span key="price" className="chip">{product.price}</span>);
  if (!items.length) return null;
  return <div className="card__meta">{items}</div>;
}

function Actions({ product, reserved, mine, onOpen, onQuickReserve }: CardProps) {
  const store = storeName(product.url);
  if (product.linkReserves && product.url && !reserved) {
    return (
      <div className="card__actions">
        <a
          className="plastic-btn plastic-btn--sm"
          data-color="tangerine"
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onQuickReserve?.(product.id)}
        >
          <span aria-hidden="true">♡</span> {product.linkLabel ?? 'lo regalo yo'} <span aria-hidden="true">↗</span>
          <span className="sr-only">(lo reserva y abre el link en una pestaña nueva)</span>
        </a>
      </div>
    );
  }
  if (reserved) {
    return (
      <div className="card__actions">
        <button type="button" className="reserved-chip" onClick={() => onOpen(product.id)}>
          <span aria-hidden="true">✓</span> {product.reservedBy ?? (mine ? 'lo reservaste vos' : 'ya está reservado')}
        </button>
      </div>
    );
  }
  return (
    <div className="card__actions">
      {product.url ? (
        <a className="plastic-btn plastic-btn--sm" data-color="tangerine" href={product.url} target="_blank" rel="noopener noreferrer">
          {product.linkLabel ?? 'ir a comprar'} <span aria-hidden="true">↗</span>
          <span className="sr-only">en {store ?? 'la tienda'} (abre en una pestaña nueva)</span>
        </a>
      ) : (
        <span className="no-link">sin link todavía</span>
      )}
      <button type="button" className="plastic-btn plastic-btn--sm plastic-btn--ghost" onClick={() => onOpen(product.id, 'reserve')}>
        <span aria-hidden="true">♡</span> lo regalo yo
      </button>
      {store && !product.linkLabel && <span className="card__store" aria-hidden="true">en {store}</span>}
    </div>
  );
}

function ReservedStamp({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="stamp" aria-hidden="true">
      ¡reservado!
    </span>
  );
}

function Title({ product, onOpen }: { product: Product; onOpen: CardProps['onOpen'] }) {
  return (
    <h3 className="card__name">
      <button type="button" onClick={() => onOpen(product.id)}>
        {product.name}
      </button>
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/* Snapshot: foto revelada pegada con cinta dentro de un visor de fotos */
/* (para experiencias / fotos que no son de catálogo)                   */
/* ------------------------------------------------------------------ */
function SnapshotCard(p: VariantProps) {
  const { product, reserved, color } = p;
  return (
    <article className={cardClass('card--snapshot', reserved)} style={p.style} aria-label={product.name}>
      <Window title={product.hearts === 3 ? 'top de la lista' : product.hearts ? 'lo quiero' : '¡plan!'} color={color} screenClassName="snap__screen">
        <div className="snap__layout">
          <div className="snap__print">
            <span className="tape tape--a" aria-hidden="true" />
            <span className="tape tape--b" aria-hidden="true" />
            <PhotoButton product={product} onOpen={p.onOpen} className="snap__photo" />
            {product.imageIsPlaceholder && <span className="snap__caption">foto provisoria</span>}
            {product.look?.sticker && (
              <span className="sticker sticker--burst snap__sticker" data-color="lime" aria-hidden="true">
                {product.look.sticker}
              </span>
            )}
          </div>
          <div className="snap__info">
            <div className="snap__head">
              <Hearts value={product.hearts} size="lg" />
              {product.hearts === 3 && <span className="snap__top lcd">TOP DE LA LISTA</span>}
            </div>
            <Title product={product} onOpen={p.onOpen} />
            {product.description && <p className="card__desc">{product.description}</p>}
            <Meta product={product} />
            <Note text={product.note} />
            <Actions {...p} />
          </div>
        </div>
      </Window>
      <ReservedStamp show={reserved} />
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Hardware: un aparato de plástico translúcido con display LCD y      */
/* botones con luz (los botones encendidos = corazones)                */
/* ------------------------------------------------------------------ */
function HardwareCard(p: VariantProps) {
  const { product, reserved, color } = p;
  const lit = product.hearts ?? 0;
  return (
    <article className={cardClass('card--hardware', reserved)} data-color={color} style={p.style} aria-label={product.name}>
      <div className="hw__shell">
        <div className="hw__top">
          <span className="hw__brand">★ ★ ★</span>
          <span className="hw__grill" aria-hidden="true" />
        </div>
        <div className="hw__lcd lcd" aria-hidden="true">
          <span>{product.look?.sticker ?? 'READY'}</span>
        </div>
        <PhotoButton product={product} onOpen={p.onOpen} className="hw__window" />
        <div className="hw__panel">
          <div className="hw__leds" role="img" aria-label={product.hearts ? `Qué tanto lo quiero: ${product.hearts} de 3` : 'Sin puntaje'}>
            {[1, 2, 3].map((n) => (
              <span key={n} className={`hw__led${n <= lit ? ' is-on' : ''}`} aria-hidden="true">
                ♥
              </span>
            ))}
          </div>
          <span className="hw__label" aria-hidden="true">nivel de ganas</span>
        </div>
        <div className="hw__body">
          <Title product={product} onOpen={p.onOpen} />
          {product.description && <p className="card__desc">{product.description}</p>}
          <Meta product={product} />
          <Note text={product.note} />
          <Actions {...p} />
        </div>
        <span className="hw__foot" aria-hidden="true" />
      </div>
      <ReservedStamp show={reserved} />
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Blister: packaging de juguete con burbuja de plástico y troquel     */
/* ------------------------------------------------------------------ */
function BlisterCard(p: VariantProps) {
  const { product, reserved, color } = p;
  return (
    <article className={cardClass('card--blister', reserved)} data-color={color} style={p.style} aria-label={product.name}>
      <div className="bl__card">
        <span className="bl__hole" aria-hidden="true" />
        <div className="bl__header">
          <span className="bl__brand" aria-hidden="true">NEW!</span>
          <Hearts value={product.hearts} />
        </div>
        <div className="bl__bubble">
          <PhotoButton product={product} onOpen={p.onOpen} className="bl__photo" />
          <span className="bl__shine" aria-hidden="true" />
        </div>
        {product.size && (
          <span className="sticker sticker--burst bl__size" data-color="tangerine" aria-hidden="true">
            {product.size}
          </span>
        )}
        <div className="bl__body">
          <Title product={product} onOpen={p.onOpen} />
          {product.description && <p className="card__desc">{product.description}</p>}
          <Meta product={product} />
          <Note text={product.note} />
          <Actions {...p} />
        </div>
        <div className="bl__barcode" aria-hidden="true">
          <span />
          <small>{product.id.toUpperCase()}</small>
        </div>
      </div>
      <ReservedStamp show={reserved} />
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Window: formato genérico para regalos nuevos                        */
/* ------------------------------------------------------------------ */
function WindowCard(p: VariantProps) {
  const { product, reserved, color } = p;
  return (
    <article className={cardClass('card--window', reserved)} style={p.style} aria-label={product.name}>
      <Window title={product.hearts ? 'lo quiero' : '¡bonus!'} color={color}>
        <PhotoButton product={product} onOpen={p.onOpen} className="wc__photo" />
        <div className="wc__body">
          <div className="wc__row">
            <Hearts value={product.hearts} size="sm" />
            {product.look?.sticker && <span className="sticker wc__sticker" data-color="lime">{product.look.sticker}</span>}
          </div>
          <Title product={product} onOpen={p.onOpen} />
          {product.description && <p className="card__desc">{product.description}</p>}
          <Meta product={product} />
          <Note text={product.note} />
          <Actions {...p} />
        </div>
      </Window>
      <ReservedStamp show={reserved} />
    </article>
  );
}
