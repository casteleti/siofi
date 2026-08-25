/**
 * Ilha Preact do formulário de lead (design system §12 / spec técnica §19).
 * Tarefa 1 — ESCOPO ESTRUTURAL APENAS:
 *  - HTML5 validation + estado local dos 7 campos, na ordem da copy.
 *  - Chama /api/lead, que responde 501 de propósito (Tarefa 4 implementa a lógica real).
 * FORA de escopo aqui (fica para tarefas futuras): geração de lead_id/idempotência,
 * honeypot funcional, máscara de WhatsApp, dataLayer/eventos reais, UTMs/click IDs,
 * retry/timeout, redirect para /siofi/obrigado.
 */
import { useState } from 'preact/hooks';
import FormField from './FormField';
import ChoiceChips from './ChoiceChips';

type UsesSystem = 'sim' | 'nao' | '';

interface FormState {
  name: string;
  company: string;
  whatsapp: string;
  city: string;
  employeesRange: string;
  usesManagementSystem: UsesSystem;
  currentSystem: string;
}

const EMPLOYEES_OPTIONS = [
  { value: '1-4', label: '1 a 4' },
  { value: '5-12', label: '5 a 12' },
  { value: '13+', label: '13 ou mais' },
];

const USES_SYSTEM_OPTIONS = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
];

const INITIAL_STATE: FormState = {
  name: '',
  company: '',
  whatsapp: '',
  city: '',
  employeesRange: '',
  usesManagementSystem: '',
  currentSystem: '',
};

type Status = 'idle' | 'submitting' | 'error' | 'not-implemented';

export default function LeadForm() {
  const [values, setValues] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<Status>('idle');

  const setField = <K extends keyof FormState>(key: K) => (value: FormState[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(event: Event) {
    event.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.status === 501) {
        // Esperado nesta tarefa — backend real é a Tarefa 4.
        setStatus('not-implemented');
        return;
      }

      setStatus(response.ok ? 'idle' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form class="lead-form" onSubmit={handleSubmit} noValidate={false}>
      <FormField
        id="name"
        label="Nome"
        required
        maxLength={120}
        value={values.name}
        onInput={setField('name')}
      />
      <FormField
        id="company"
        label="Empresa"
        required
        maxLength={150}
        value={values.company}
        onInput={setField('company')}
      />
      <FormField
        id="whatsapp"
        label="WhatsApp"
        type="tel"
        required
        placeholder="(16) 99999-9999"
        value={values.whatsapp}
        onInput={setField('whatsapp')}
      />
      <FormField
        id="city"
        label="Cidade / UF"
        required
        maxLength={100}
        value={values.city}
        onInput={setField('city')}
      />
      <ChoiceChips
        legend="Quantidade aproximada de pessoas na equipe"
        name="employeesRange"
        options={EMPLOYEES_OPTIONS}
        value={values.employeesRange}
        onChange={setField('employeesRange')}
      />
      <ChoiceChips
        legend="Já utiliza sistema de gestão?"
        name="usesManagementSystem"
        options={USES_SYSTEM_OPTIONS}
        value={values.usesManagementSystem}
        onChange={(value) => setField('usesManagementSystem')(value as UsesSystem)}
      />
      {values.usesManagementSystem === 'sim' && (
        <FormField
          id="currentSystem"
          label="Qual sistema utiliza hoje?"
          maxLength={150}
          value={values.currentSystem}
          onInput={setField('currentSystem')}
        />
      )}

      <button type="submit" class="lead-form__submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Enviando…' : 'Quero agendar uma demonstração'}
      </button>

      <p class="lead-form__microcopy">
        Ao enviar seus dados, nossa equipe entrará em contato para combinar a demonstração.
      </p>

      {status === 'not-implemented' && (
        <p class="lead-form__status" role="status">
          [Estrutura funcionando — envio real chega na Tarefa 4. O endpoint /api/lead
          respondeu 501 Not Implemented, como esperado nesta etapa.]
        </p>
      )}

      {status === 'error' && (
        <p class="lead-form__status lead-form__status--error" role="alert">
          Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.
        </p>
      )}

      <style>{`
        .lead-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }
        .lead-form__submit {
          height: var(--btn-h);
          border-radius: var(--radius-sm);
          border: none;
          background: var(--color-primary);
          color: var(--color-white);
          font: var(--weight-semibold) var(--text-base) var(--font-body);
          cursor: pointer;
        }
        .lead-form__submit:hover {
          background: var(--color-primary-dark);
        }
        .lead-form__submit:disabled {
          background: var(--color-neutral-300);
          cursor: not-allowed;
        }
        .lead-form__microcopy {
          margin: 0;
          font: var(--weight-regular) var(--text-xs) var(--font-body);
          color: var(--color-text-muted);
        }
        .lead-form__status {
          margin: 0;
          font: var(--weight-medium) var(--text-sm) var(--font-body);
          color: var(--color-primary-dark);
        }
        .lead-form__status--error {
          color: var(--color-error);
        }
      `}</style>
    </form>
  );
}
