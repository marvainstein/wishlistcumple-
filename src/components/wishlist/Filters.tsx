export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface FiltersProps {
  options: FilterOption[];
  active: string;
  onChange: (id: string) => void;
}

/** Selector físico de filtros: teclas de plástico con LED. */
export function Filters({ options, active, onChange }: FiltersProps) {
  return (
    <div className="filters" role="group" aria-label="Filtrar regalos">
      <span className="filters__label" aria-hidden="true">mostrar:</span>
      <div className="filters__keys">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className="filter-key"
            aria-pressed={active === o.id}
            onClick={() => onChange(o.id)}
            disabled={o.count === 0 && active !== o.id}
          >
            <span className="filter-key__led" aria-hidden="true" />
            <span>{o.label}</span>
            <span className="filter-key__count" aria-label={`${o.count} regalos`}>{o.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
