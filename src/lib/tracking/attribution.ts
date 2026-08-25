/**
 * Atribuição de primeira parte (spec técnica §32/§33): UTMs + click IDs
 * persistidos por 90 dias em cookie `siofi_attribution`, com first-touch
 * (nunca sobrescrito) e last-touch (atualizado a cada visita com campanha).
 */

export interface Touch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  landing_url?: string;
  referrer?: string;
  seen_at: string;
}

export interface AttributionCookie {
  first_touch: Touch | null;
  last_touch: Touch | null;
}

const ATTRIBUTION_COOKIE_NAME = 'siofi_attribution';
const ATTRIBUTION_COOKIE_MAX_AGE_DAYS = 90;
const CAMPAIGN_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'] as const;

function setCookie(name: string, value: string, maxAgeDays: number): void {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeDays * 86400}; Path=/; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function readStored(): AttributionCookie | null {
  const raw = getCookie(ATTRIBUTION_COOKIE_NAME) ?? sessionStorage.getItem(ATTRIBUTION_COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(data: AttributionCookie): void {
  const serialized = JSON.stringify(data);
  setCookie(ATTRIBUTION_COOKIE_NAME, serialized, ATTRIBUTION_COOKIE_MAX_AGE_DAYS);
  // Fallback de compatibilidade (§32 SHOULD) — sobrevive à navegação /siofi → /siofi/obrigado
  // na mesma aba mesmo se a escrita de cookie falhar em algum contexto específico.
  try {
    sessionStorage.setItem(ATTRIBUTION_COOKIE_NAME, serialized);
  } catch {
    // sessionStorage indisponível (modo privado restrito) — cookie já é a fonte principal.
  }
}

function buildTouchFromUrl(): Touch | null {
  const params = new URLSearchParams(location.search);
  const hasCampaignSignal = CAMPAIGN_PARAMS.some((key) => params.has(key));
  if (!hasCampaignSignal) return null;

  const touch: Touch = { seen_at: new Date().toISOString() };
  for (const key of CAMPAIGN_PARAMS) {
    const value = params.get(key);
    if (value) touch[key] = value;
  }
  touch.landing_url = location.href;
  touch.referrer = document.referrer || undefined;
  return touch;
}

/**
 * Roda no carregamento de toda página (AnalyticsBootstrap). Grava first_touch
 * apenas se ainda não existir; atualiza last_touch apenas se a visita atual
 * trouxer sinal de campanha novo (nunca sobrescreve com "direto/nenhum").
 */
export function captureAttributionFromUrl(): void {
  const current = readStored() ?? { first_touch: null, last_touch: null };
  const touch = buildTouchFromUrl();

  if (!touch) {
    // Sem campanha na URL: garante que o que já existe continue persistido
    // (renova o TTL do cookie sem alterar o conteúdo).
    if (current.first_touch || current.last_touch) writeStored(current);
    return;
  }

  if (!current.first_touch) {
    current.first_touch = touch;
  }
  current.last_touch = touch;
  writeStored(current);
}

export function getAttribution(): AttributionCookie {
  return readStored() ?? { first_touch: null, last_touch: null };
}

/** Lidos do cookie que o próprio Meta Pixel grava (via GTM) — não geridos por nós. */
export function getMetaCookies(): { fbp?: string; fbc?: string } {
  return {
    fbp: getCookie('_fbp') ?? undefined,
    fbc: getCookie('_fbc') ?? undefined,
  };
}
