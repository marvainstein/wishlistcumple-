import { Sun } from '../decor/Decor';

/** Cierre: el sol se esconde detrás de la última colina. */
export function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-title">
      <div className="final__inner">
        <Sun className="final__sun" />
        <div className="final__copy">
          <p className="final__kicker lcd">¡OTRA VEZ!</p>
          <h2 id="final-title" className="final__title">
            gracias por pensar en mí <span aria-hidden="true">♥</span>
          </h2>
          <p className="final__text bubble-text">Cualquier cosa de esta lista me va a hacer muy feliz.</p>
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
        <span>hecho con ♥ para mi cumple</span>
      </footer>
    </section>
  );
}
