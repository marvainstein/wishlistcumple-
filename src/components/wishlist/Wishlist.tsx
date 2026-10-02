import { useMemo, useState, type CSSProperties } from 'react';
import type { Product } from '../../data/products';
import type { Reservations } from '../../lib/useReservations';
import { Filters, type FilterOption } from './Filters';
import { ProductCard } from './ProductCard';
import './wishlist.css';

interface WishlistProps {
  products: Product[];
  reservations: Reservations;
  onOpen: (id: string, intent?: 'reserve') => void;
}

type Predicate = (p: Product, reserved: boolean) => boolean;

/** Filtros armados con datos reales: corazones, disponibilidad y categorías si existen. */
function buildFilters(products: Product[]): { id: string; label: string; test: Predicate }[] {
  const filters: { id: string; label: string; test: Predicate }[] = [
    { id: 'todo', label: 'todo', test: () => true },
    { id: 'libres', label: 'sin reservar', test: (_p, r) => !r },
  ];
  ([3, 2, 1] as const).forEach((h) => {
    if (products.some((p) => p.hearts === h)) {
      filters.push({ id: `h${h}`, label: '♥'.repeat(h), test: (p) => p.hearts === h });
    }
  });
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];
  categories.forEach((c) => filters.push({ id: `cat:${c}`, label: c, test: (p) => p.category === c }));
  return filters;
}

/* inclinaciones "a mano" que rotan entre cards: caos controlado */
const TILTS = ['-1.4deg', '1.2deg', '-0.6deg', '1.6deg', '-1.1deg', '0.8deg'];
const SHIFTS = ['0px', '48px', '-14px', '26px', '8px', '-6px'];

export function Wishlist({ products, reservations, onOpen }: WishlistProps) {
  const [active, setActive] = useState('todo');
  const filters = useMemo(() => buildFilters(products), [products]);

  const options: FilterOption[] = filters.map((f) => ({
    id: f.id,
    label: f.label,
    count: products.filter((p) => f.test(p, reservations.reserved.has(p.id))).length,
  }));

  const current = filters.find((f) => f.id === active) ?? filters[0];
  const visible = products.filter((p) => current.test(p, reservations.reserved.has(p.id)));

  return (
    <section id="wishlist" className="wishlist" aria-labelledby="wishlist-title">
      <div className="wishlist__head">
        <div className="wishlist__titles on-rug">
          <p className="wishlist__kicker">
            <span className="lcd">C:\deseos\</span>
          </p>
          <h2 id="wishlist-title" className="wishlist__title">
            la wishlist
            <span className="wishlist__count" aria-label={`${products.length} regalos`}>{products.length}</span>
          </h2>
          <p className="wishlist__intro">
            Tocá cualquier regalo para ver los detalles. Si ya sabés cuál vas a regalar, tocá <strong>“lo regalo yo”</strong> y queda reservado para todos.
          </p>
        </div>
        <Filters options={options} active={current.id} onChange={setActive} />
      </div>

      <p className="sr-only" aria-live="polite">
        Mostrando {visible.length} de {products.length} regalos
      </p>

      {visible.length ? (
        <div className="desk">
          {visible.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              reserved={reservations.reserved.has(p.id)}
              mine={reservations.mine.has(p.id)}
              onOpen={onOpen}
              style={
                {
                  '--tilt': TILTS[i % TILTS.length],
                  '--shift': SHIFTS[i % SHIFTS.length],
                  animationDelay: `${i * 0.08}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : (
        <div className="desk-empty">
          <p>No hay regalos con este filtro.</p>
          <button type="button" className="plastic-btn plastic-btn--sm plastic-btn--ghost" onClick={() => setActive('todo')}>
            ver todo
          </button>
        </div>
      )}
    </section>
  );
}
