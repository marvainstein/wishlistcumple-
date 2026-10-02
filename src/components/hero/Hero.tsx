import type { CSSProperties } from 'react';
import type { Product } from '../../data/products';
import { Window } from '../ui/Window';
import { CompactDisc, Floppy, PointerArrow, Sparkle } from '../decor/Decor';
import './hero.css';

interface HeroProps {
  featured: Product[];
  total: number;
  reservedCount: number;
  onOpen: (id: string) => void;
}

export function Hero({ featured, total, reservedCount, onOpen }: HeroProps) {
  const progress = total ? Math.round((reservedCount / total) * 100) : 0;

  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="hero__stage">
        {/* íconos de escritorio */}
        <ul className="desk-icons" aria-label="Accesos directos">
          <li>
            <a href="#wishlist" className="desk-icon">
              <span className="desk-icon__img desk-icon__img--folder" aria-hidden="true" />
              <span className="desk-icon__label">wishlist</span>
            </a>
          </li>
          <li>
            <a href="#como" className="desk-icon">
              <span className="desk-icon__img desk-icon__img--doc" aria-hidden="true" />
              <span className="desk-icon__label">cómo.txt</span>
            </a>
          </li>
        </ul>

        <CompactDisc className="hero__cd" />
        <Floppy className="hero__floppy" />
        <Sparkle className="hero__spark hero__spark--1" />
        <Sparkle className="hero__spark hero__spark--2" />

        <Window
          title="cumple.wish — 2001 edition"
          color="tangerine"
          className="hero__window"
          status={
            <>
              <span>{total} deseos · {reservedCount} reservados</span>
              <span>disco: 99% lleno de ganas</span>
            </>
          }
        >
          <div className="hero__screen">
            <p className="hero__eyebrow lcd">
              <span>HELLO!</span>
              <span aria-hidden="true">★</span>
              <span>pasá nomás</span>
            </p>

            <h1 id="hero-title" className="hero__title">
              <span className="hero__word hero__word--wish" data-text="Wish">Wish</span>
              <span className="hero__word hero__word--list" data-text="list">list</span>
              <span className="hero__tag sticker" data-color="lime">de cumple ♡</span>
            </h1>

            <p className="hero__lede">
              Una lista corta de cosas que me harían feliz. Si elegís una, reservala acá así nadie la repite.
            </p>

            <div className="hero__actions">
              <a href="#wishlist" className="plastic-btn" data-color="strawberry">
                <span aria-hidden="true">♡</span> ver la wishlist
              </a>
              <a href="#como" className="plastic-btn plastic-btn--ghost">
                ¿cómo reservo?
              </a>
            </div>

            <div className="hero__meter" aria-label={`${reservedCount} de ${total} regalos reservados`}>
              <span className="hero__meter-label">reservados</span>
              <span className="hero__meter-track" aria-hidden="true">
                <span className="hero__meter-fill" style={{ width: `${progress}%` }} />
              </span>
              <span className="hero__meter-num">
                {reservedCount}/{total}
              </span>
            </div>
          </div>
        </Window>

        {/* los regalos reales, como stickers troquelados */}
        <ul className="hero__stickers" aria-label="Algunos regalos de la lista">
          {featured.map((p, i) => (
            <li key={p.id} style={{ '--i': i } as CSSProperties}>
              <button type="button" className="photo-sticker" onClick={() => onOpen(p.id)}>
                <img src={p.image} alt="" loading="eager" />
                <span className="photo-sticker__cap">{p.name}</span>
                <span className="sr-only">Abrir {p.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="hero__click" aria-hidden="true">
          <span className="sticker" data-color="bondi">CLICK!</span>
          <PointerArrow className="hero__arrow" />
        </div>
      </div>
    </section>
  );
}
