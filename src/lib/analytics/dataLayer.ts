/**
 * Único ponto de `dataLayer.push` da aplicação (§68 do Implementation Map —
 * nenhum outro módulo deve chamar `window.dataLayer.push` diretamente).
 * Taxonomia completa em §22, formato de payload em §23 da spec técnica.
 *
 * Guarda-corpo de PII: todo valor aqui é string/number/boolean de vocabulário
 * fechado (enum) ou identificador técnico (`lead_id`) — nunca texto livre do
 * usuário (nome, empresa, WhatsApp, cidade, nome do sistema concorrente).
 * Esses campos existem apenas no payload de `/api/lead` → CRM (§34).
 */

export type DataLayerEvent = {
  event: string;
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    // `any[]` de propósito: o dataLayer real do GTM mistura objetos de evento
    // (DataLayerEvent) com arrays de comando do gtag.js (`['consent', ...]`,
    // §38) — não é homogêneo o suficiente para um tipo único mais estrito.
    dataLayer: any[];
  }
}

function push(event: DataLayerEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export type CtaEvent = 'hero_cta_click' | 'demo_cta_click' | 'secondary_cta_click';

export function trackCtaClick(event: CtaEvent, ctaLocation: string | undefined, ctaLabel: string | undefined): void {
  push({ event, cta_location: ctaLocation, cta_label: ctaLabel });
}

export type WhatsappClickLocation = 'floating_button' | 'footer_link' | 'support_section' | 'mobile_drawer' | 'thank_you_page';

export function trackWhatsappClick(clickLocation: WhatsappClickLocation): void {
  push({ event: 'whatsapp_click', click_location: clickLocation });
}

export function trackPhoneClick(clickLocation: string): void {
  push({ event: 'phone_click', click_location: clickLocation });
}

export type ScrollPercentage = 25 | 50 | 75 | 100;

export function trackScrollDepth(scrollPercentage: ScrollPercentage): void {
  push({ event: 'scroll_depth', scroll_percentage: scrollPercentage });
}

export function trackFaqOpen(faqQuestion: string): void {
  push({ event: 'faq_open', faq_question: faqQuestion });
}

export type FormContext = 'final_cta' | 'troca_sistema';

export function trackFormStart(leadId: string, formContext: FormContext): void {
  push({ event: 'form_start', lead_id: leadId, form_context: formContext });
}

export function trackMigrationInterest(currentSystemDisclosed: boolean): void {
  // NUNCA enviar o nome do sistema atual aqui (texto livre do usuário) — só ao CRM (§23).
  push({ event: 'migration_interest', current_system_disclosed: currentSystemDisclosed });
}

export type FormErrorType = 'validation' | 'server' | 'timeout';

export function trackFormError(errorType: FormErrorType): void {
  push({ event: 'form_error', error_type: errorType });
}

export type EmployeesRange = '1_4' | '5_12' | '13_plus';
export type CurrentSystemAnswer = 'yes' | 'no';

export interface LeadSubmittedParams {
  leadId: string;
  employeesRange: EmployeesRange;
  currentSystem: CurrentSystemAnswer;
  formContext: FormContext;
  pageVariant: string;
  /** Derivado de contexto de página/campanha — nunca do texto digitado pelo usuário. Omitir na página principal, sem segmento fixo. */
  businessType?: string;
}

export function trackLeadSubmitted(params: LeadSubmittedParams): void {
  push({
    event: 'lead_submitted',
    lead_id: params.leadId,
    business_type: params.businessType,
    employees_range: params.employeesRange,
    current_system: params.currentSystem,
    form_context: params.formContext,
    page_variant: params.pageVariant,
  });
}
