/**
 * Número de WhatsApp real da F5 — extraído do rodapé do site institucional
 * (f5sistemasdegestao.com.br) na auditoria SEO de 2026-08-26. Centraliza a
 * lógica do link para não duplicar o valor em cada componente que usa
 * WhatsApp (botão flutuante, footer, página de obrigado).
 */
const WHATSAPP_NUMBER = '5516992980598'; // +55 16 99298-0598, formato internacional sem símbolos

/** Mensagem genérica e estática (spec técnica §37 MUST) — nunca inclui dado do usuário. */
export const WHATSAPP_PREFILLED_MESSAGE = 'Olá! Vim pela página do SiOfi e gostaria de saber mais.';

export function getWhatsappHref(): string {
  if (!WHATSAPP_NUMBER) return '#';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PREFILLED_MESSAGE)}`;
}

export function hasWhatsappNumber(): boolean {
  return Boolean(WHATSAPP_NUMBER);
}
