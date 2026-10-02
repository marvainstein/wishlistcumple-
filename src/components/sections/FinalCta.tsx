import { Critter, Flowers, Sun } from '../decor/Decor';

/** Cierre: el sol se esconde detrás de la última colina. */
export function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-title">
      <div className="final__inner">
        <div className="final__sunset" aria-hidden="true">
          <Sun className="final__sun" />
          <svg className="final__hill" viewBox="0 0 400 140" preserveAspectRatio="none">
            <path d="M0 80 C 90 10, 260 0, 400 70 V140 H0Z" fill="#7cc944" />
          </svg>
          <Critter kind="heart" className="final__critter" />
        </div>
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
      <Flowers count={22} seed={7} className="final__flowers" />
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
