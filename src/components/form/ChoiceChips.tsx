/**
 * Grupo de chips de escolha única (design system §12): usado em
 * "Pessoas na equipe" e "Já utiliza sistema de gestão?".
 */
import type { JSX } from 'preact';

interface Option {
  value: string;
  label: string;
}

interface Props {
  legend: string;
  name: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function ChoiceChips({ legend, name, options, value, onChange }: Props): JSX.Element {
  return (
    <fieldset class="choice-chips">
      <legend class="choice-chips__legend">{legend}</legend>
      <div class="choice-chips__row" role="radiogroup" aria-label={legend}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              class={`choice-chips__chip${selected ? ' choice-chips__chip--selected' : ''}`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <input type="hidden" name={name} value={value} />

      <style>{`
        .choice-chips {
          border: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .choice-chips__legend {
          padding: 0;
          font: var(--weight-medium) var(--text-sm) var(--font-body);
          color: var(--color-text-primary);
        }
        .choice-chips__row {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
        .choice-chips__chip {
          height: var(--btn-h-sm);
          padding: 0 var(--space-4);
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-strong);
          background: var(--color-white);
          font: var(--weight-medium) var(--text-sm) var(--font-body);
          color: var(--color-text-secondary);
          cursor: pointer;
        }
        .choice-chips__chip--selected {
          background: var(--color-primary-light);
          border-color: var(--color-primary);
          color: var(--color-primary-dark);
        }
      `}</style>
    </fieldset>
  );
}
