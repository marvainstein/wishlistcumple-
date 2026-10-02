import { CompactDisc } from '../decor/Decor';

/** Cierre: "fin del disco". */
export function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-title">
      <div className="final__inner">
        <CompactDisc className="final__cd" />
        <div className="final__copy">
          <p className="final__kicker lcd">FIN DEL DISCO</p>
          <h2 id="final-title" className="final__title">
            gracias por pensar en mí <span aria-hidden="true">♥</span>
          </h2>
          <p className="final__text">
            Cualquier cosa de esta lista me va a hacer muy feliz.
          </p>
          <div className="final__actions">
            <a href="#wishlist" className="plastic-btn" data-color="strawberry">
              ♡ volver a la wishlist
            </a>
            <a href="#inicio" className="plastic-btn plastic-btn--ghost">
              ↑ arriba
            </a>
          </div>
        </div>
      </div>
      <footer className="footer">
        <span>Wish.OS</span>
        <span aria-hidden="true">·</span>
        <span>edición 2001, hecha en 2026</span>
        <span aria-hidden="true">·</span>
        <span>con ♥</span>
      </footer>
    </section>
  );
}
