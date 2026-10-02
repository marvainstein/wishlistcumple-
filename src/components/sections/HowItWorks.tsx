import { Window } from '../ui/Window';

const STEPS = [
  { title: 'Elegí un regalo', text: 'Mirá la wishlist y tocá el que te guste para ver los detalles y la nota.' },
  { title: 'Reservalo', text: 'Tocá “lo regalo yo”. Queda marcado para todos, así nadie lo repite. Es anónimo: no veo quién reservó qué.' },
  { title: 'Compralo', text: 'Seguí el link a la tienda (o donde prefieras). Si te arrepentís, podés deshacer la reserva desde el mismo navegador.' },
];

/** "Asistente de regalos": instalador de época con los 3 pasos reales del flujo. */
export function HowItWorks() {
  return (
    <section id="como" className="how" aria-labelledby="how-title">
      <Window title="Asistente de regalos — paso a paso" color="blueberry" className="how__win">
        <div className="how__screen">
          <div className="how__side" aria-hidden="true">
            <div className="how__badge">
              <span>?</span>
            </div>
            <p>v1.0</p>
          </div>
          <div className="how__main">
            <h2 id="how-title" className="how__title">¿Cómo funciona?</h2>
            <ol className="how__steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="how__step">
                  <span className="how__num" aria-hidden="true">{i + 1}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="how__foot">
              <span className="how__bar" aria-hidden="true">
                <span />
              </span>
              <a href="#wishlist" className="plastic-btn plastic-btn--sm" data-color="blueberry">
                siguiente: elegir regalo <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </Window>
    </section>
  );
}
