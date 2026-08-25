/**
 * Campo de formulário rotulado (design system §12). Label sempre visível
 * acima (nunca floating); erro inline com ícone e `aria-describedby`.
 */
import type { JSX } from 'preact';

interface Props {
  id: string;
  label: string;
  type?: 'text' | 'tel';
  required?: boolean;
  placeholder?: string;
  value: string;
  error?: string;
  onInput: (value: string) => void;
  maxLength?: number;
}

export default function FormField({
  id,
  label,
  type = 'text',
  required = false,
  placeholder,
  value,
  error,
  onInput,
  maxLength,
}: Props): JSX.Element {
  const errorId = `${id}-error`;

  return (
    <div class="form-field">
      <label htmlFor={id} class="form-field__label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        class="form-field__input"
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onInput={(event) => onInput((event.target as HTMLInputElement).value)}
      />
      {error && (
        <p id={errorId} class="form-field__error" role="alert">
          {error}
        </p>
      )}

      <style>{`
        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .form-field__label {
          font: var(--weight-medium) var(--text-sm) var(--font-body);
          color: var(--color-text-primary);
        }
        .form-field__input {
          height: var(--input-h);
          padding: 0 var(--input-px);
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-strong);
          background: var(--color-white);
          font: var(--weight-regular) var(--text-base) var(--font-body);
          color: var(--color-text-primary);
        }
        .form-field__input:hover {
          border-color: var(--color-neutral-500);
        }
        .form-field__input:focus-visible {
          border-color: var(--color-primary);
          outline: none;
          box-shadow: var(--focus-ring);
        }
        .form-field__error {
          margin: 0;
          font: var(--weight-regular) var(--text-xs) var(--font-body);
          color: var(--color-error);
        }
      `}</style>
    </div>
  );
}
