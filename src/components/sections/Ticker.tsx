interface TickerProps {
  total: number;
  reserved: number;
}

/** Display LCD que corre de lado a lado (estático con reduced-motion). */
export function Ticker({ total, reserved }: TickerProps) {
  const free = total - reserved;
  const items = [
    'gracias por pensar en mí',
    `${total} deseos cargados`,
    `${free} sin reservar`,
    'las reservas son anónimas',
    'hecho a mano en Wish.OS',
  ];
  const line = items.map((t) => `★ ${t} `).join('');
  return (
    <div className="ticker" role="marquee" aria-label={items.join('. ')}>
      <div className="ticker__screen lcd" aria-hidden="true">
        <div className="ticker__track">
          <span>{line}</span>
          <span>{line}</span>
        </div>
      </div>
    </div>
  );
}
