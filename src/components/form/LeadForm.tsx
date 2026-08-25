/**
 * Ilha Preact do formulário de lead (design system §12 / spec técnica §19/§21).
 * lead_id gerado no primeiro foco (§35); payload inclui atribuição (§32/§33),
 * flags de consentimento (§38) e honeypot/timing (§19); `lead_submitted` só
 * dispara após 2xx real de `/api/lead` (§21); redireciona para
 * `/siofi/obrigado` com uma flag de sessão que confirma a conversão (§36).
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import FormField from './FormField';
import ChoiceChips from './ChoiceChips';
import { getAttribution, getMetaCookies } from '../../lib/tracking/attribution';
import { getConsentFlagsForSubmission } from '../../lib/tracking/consent';
import { trackFormStart, trackMigrationInterest, trackFormError, trackLeadSubmitted } from '../../lib/analytics/dataLayer';
import { getWhatsappHref } from '../../lib/whatsapp';

type UsesSystem = 'sim' | 'nao' | '';
type FormContext = 'final_cta' | 'troca_sistema';

interface FormState {
  name: string;
  company: string;
  whatsapp: string;
  city: string;
  employeesRange: string;
  usesManagementSystem: UsesSystem;
  currentSystem: string;
}

interface Props {
  buttonLabel: string;
  microcopy: string;
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

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'rate_limited';

const WHATSAPP_FALLBACK_HREF = getWhatsappHref();

export default function LeadForm({ buttonLabel, microcopy }: Props) {
  const [values, setValues] = useState<FormState>(INITIAL_STATE);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const leadIdRef = useRef<string | null>(null);
  const formRenderedAtRef = useRef<number>(Date.now());
  const formContextRef = useRef<FormContext>('final_cta');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ctx') === 'troca') {
      formContextRef.current = 'troca_sistema';
      setValues((prev) => ({ ...prev, usesManagementSystem: 'sim' }));
    }
  }, []);

  const setField = <K extends keyof FormState>(key: K) => (value: FormState[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  function handleFirstFocus() {
    if (leadIdRef.current) return;
    leadIdRef.current = crypto.randomUUID();
    trackFormStart(leadIdRef.current, formContextRef.current);
  }

  function handleUsesSystemChange(value: string) {
    setField('usesManagementSystem')(value as UsesSystem);
    if (value === 'sim') trackMigrationInterest(true);
  }

  async function submitWithTimeout(payload: unknown, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!leadIdRef.current) handleFirstFocus();
    const leadId = leadIdRef.current as string;

    setStatus('submitting');

    const { first_touch, last_touch } = getAttribution();
    const { fbp, fbc } = getMetaCookies();
    const consent = getConsentFlagsForSubmission();

    const payload = {
      leadId,
      name: values.name,
      company: values.company,
      whatsapp: values.whatsapp,
      city: values.city,
      employeesRange: values.employeesRange,
      usesManagementSystem: values.usesManagementSystem,
      currentSystem: values.currentSystem || undefined,
      formContext: formContextRef.current,
      pageVariant: 'siofi_main',
      website_url: honeypot,
      formRenderedAt: formRenderedAtRef.current,
      firstTouch: first_touch,
      lastTouch: last_touch,
      fbp,
      fbc,
      consentAdUserData: consent.consent_ad_user_data,
      consentAnalyticsStorage: consent.consent_analytics_storage,
    };

    let response: Response;
    try {
      response = await submitWithTimeout(payload, 8000);
    } catch {
      // Falha de rede/timeout: um retry silencioso antes de desistir (§19).
      try {
        response = await submitWithTimeout(payload, 8000);
      } catch {
        trackFormError('timeout');
        setStatus('error');
        return;
      }
    }

    if (response.status === 429) {
      trackFormError('server');
      setStatus('rate_limited');
      return;
    }

    if (response.status === 422) {
      trackFormError('validation');
      setStatus('error');
      return;
    }

    if (!response.ok) {
      trackFormError('server');
      setStatus('error');
      return;
    }

    trackLeadSubmitted({
      leadId,
      employeesRange:
        values.employeesRange === '1-4' ? '1_4' : values.employeesRange === '5-12' ? '5_12' : '13_plus',
      currentSystem: values.usesManagementSystem === 'sim' ? 'yes' : 'no',
      formContext: formContextRef.current,
      pageVariant: 'siofi_main',
    });

    setStatus('success');
    try {
      sessionStorage.setItem('siofi_conversion_confirmed', '1');
    } catch {
      // sessionStorage indisponível — a thank-you page cai no estado genérico.
    }
    window.setTimeout(() => {
      window.location.href = '/siofi/obrigado';
    }, 900);
  }

  if (status === 'success') {
    return (
      <div class="lead-form__confirmation" role="status">
        <p class="text-h3">Recebemos seus dados</p>
        <p class="text-body">Redirecionando…</p>
        <style>{`
          .lead-form__confirmation { text-align: center; padding: var(--space-8) 0; }
        `}</style>
      </div>
    );
  }

  return (
    <form class="lead-form" onSubmit={handleSubmit}>
      {/* Honeypot (§19): campo real escondido via CSS (não display:none no
          atributo `hidden`, que bots simples ignoram) — usuários reais nunca
          o preenchem; fora da navegação por teclado e de leitores de tela. */}
      <div class="lead-form__honeypot" aria-hidden="true">
        <label htmlFor="website_url">Deixe este campo em branco</label>
        <input
          type="text"
          id="website_url"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onInput={(event) => setHoneypot((event.target as HTMLInputElement).value)}
        />
      </div>

      <FormField
        id="name"
        label="Nome"
        required
        maxLength={120}
        value={values.name}
        onFocus={handleFirstFocus}
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
        onChange={handleUsesSystemChange}
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
        {status === 'submitting' ? 'Enviando…' : buttonLabel}
      </button>

      <p class="lead-form__microcopy">{microcopy}</p>

      {status === 'rate_limited' && (
        <p class="lead-form__status lead-form__status--error" role="alert">
          Não foi possível enviar agora. Tente novamente em instantes ou fale pelo{' '}
          <a href={WHATSAPP_FALLBACK_HREF} data-track="whatsapp_click" data-section="form_fallback">
            WhatsApp
          </a>
          .
        </p>
      )}

      {status === 'error' && (
        <p class="lead-form__status lead-form__status--error" role="alert">
          Não foi possível enviar agora. Tente novamente ou fale pelo{' '}
          <a href={WHATSAPP_FALLBACK_HREF} data-track="whatsapp_click" data-section="form_fallback">
            WhatsApp
          </a>
          .
        </p>
      )}

      <style>{`
        .lead-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }
        .lead-form__honeypot {
          display: none;
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
        }
        .lead-form__status--error {
          color: var(--color-error);
        }
      `}</style>
    </form>
  );
}
