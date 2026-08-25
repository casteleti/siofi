/**
 * Número de WhatsApp da F5 ainda não fornecido — `[TBD — WHATSAPP F5]`
 * (checklist de assets, design system §29.1). Centraliza a lógica do link
 * para não duplicar o placeholder em cada componente que usa WhatsApp.
 */
const WHATSAPP_NUMBER = ''; // formato internacional sem símbolos, ex.: "5516999999999"

/** Mensagem genérica e estática (spec técnica §37 MUST) — nunca inclui dado do usuário. */
export const WHATSAPP_PREFILLED_MESSAGE = 'Olá! Vim pela página do SiOfi e gostaria de saber mais.';

export function getWhatsappHref(): string {
  if (!WHATSAPP_NUMBER) return '#';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PREFILLED_MESSAGE)}`;
}

export function hasWhatsappNumber(): boolean {
  return Boolean(WHATSAPP_NUMBER);
}
