/**
 * Leitura/escrita do cookie de atribuição de primeira parte (§32/§33 da spec
 * técnica): UTMs + click IDs persistidos por 90 dias, first-touch e last-touch.
 *
 * STUB — Tarefa 1. Sem leitura/escrita real de cookie ainda; implementação
 * completa é a Tarefa 3 (junto com o restante do tracking).
 */

export type AttributionData = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  landingUrl?: string;
  capturedAt?: string;
};

export const ATTRIBUTION_COOKIE_NAME = 'siofi_attribution';
export const ATTRIBUTION_COOKIE_MAX_AGE_DAYS = 90;

export function readAttribution(): { firstTouch: AttributionData | null; lastTouch: AttributionData | null } {
  // TODO (Tarefa 3): ler `document.cookie[ATTRIBUTION_COOKIE_NAME]` e decodificar first/last touch.
  return { firstTouch: null, lastTouch: null };
}

export function writeAttribution(_data: AttributionData): void {
  // TODO (Tarefa 3): gravar cookie de primeira parte por ATTRIBUTION_COOKIE_MAX_AGE_DAYS dias.
}
