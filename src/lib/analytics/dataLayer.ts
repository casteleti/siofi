/**
 * Único ponto de `dataLayer.push` da aplicação (§68 — nenhum componente deve
 * chamar `window.dataLayer.push` diretamente).
 *
 * STUB — Tarefa 1. Nenhum envio real é feito ainda; implementação completa dos
 * eventos de §22/§23 da spec técnica (form_start, hero_cta_click, lead_submitted
 * etc.) e do Consent Mode (§37/§38) é a Tarefa 3.
 */

export type DataLayerEvent = {
  event: string;
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export function pushToDataLayer(_event: DataLayerEvent): void {
  // TODO (Tarefa 3): dataLayer.push real, com Consent Mode e taxonomia de §22.
}
