/**
 * Sanitização de campos de texto livre (spec técnica §19/§40): remove tags
 * HTML e espaços nas pontas antes de persistir — client-side é só UX, esta é
 * a linha de defesa real contra XSS refletido em qualquer destino futuro.
 */
export function sanitizeFreeText(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

/** Normaliza WhatsApp BR para E.164 (+55DDDNNNNNNNN[N]). `null` se inválido. */
export function normalizePhoneBr(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  let national = digits;
  if (national.length === 12 || national.length === 13) {
    if (national.startsWith('55')) national = national.slice(2);
  }
  if (national.length < 10 || national.length > 11) return null;
  return `+55${national}`;
}
