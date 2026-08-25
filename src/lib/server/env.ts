import type { KVNamespace } from '@cloudflare/workers-types';

/**
 * Shape das variáveis/bindings de ambiente server-side (spec técnica §47).
 * Acesso real em runtime via `cloudflare:workers` (Astro.locals.runtime.env
 * foi removido nesta versão do adapter — ver README, nota técnica).
 */
export interface Env {
  PUBLIC_SITE_URL?: string;
  META_PIXEL_ID?: string;
  META_CAPI_ACCESS_TOKEN?: string;
  GOOGLE_ADS_CONVERSION_ID?: string;
  GOOGLE_ADS_CONVERSION_LABEL?: string;
  GOOGLE_ADS_ENHANCED_CONVERSIONS_API_KEY?: string;
  CRM_ENDPOINT?: string;
  CRM_API_KEY?: string;
  HONEYPOT_FIELD_NAME?: string;
  RATE_LIMIT_KV?: KVNamespace;
}

/** `true` só quando a variável existe e não é um placeholder `[TBD ...]` do .env.example. */
export function isConfigured(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0 && !value.startsWith('[TBD');
}
