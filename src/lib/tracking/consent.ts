/**
 * Google Consent Mode v2 (spec técnica §38) + persistência da escolha do
 * usuário em cookie de primeira parte (`siofi_consent`, §39).
 *
 * Os 4 sinais começam `denied` por padrão, antes de qualquer tag do GTM
 * carregar — só mudam para `granted` conforme a escolha no banner.
 */

export type ConsentCategory = 'necessary' | 'analytics_and_ads';

export interface ConsentChoice {
  analytics_and_ads: boolean;
}

const CONSENT_COOKIE_NAME = 'siofi_consent';
const CONSENT_COOKIE_MAX_AGE_DAYS = 365;

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

function setCookie(name: string, value: string, maxAgeDays: number): void {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeDays * 86400}; Path=/; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * MUST rodar antes do loader do GTM (BaseLayout) — define os stubs
 * `dataLayer`/`gtag` e o estado padrão "denied" dos 4 sinais.
 */
export function applyDefaultConsent(): void {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer.push(args));
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  });

  const stored = getStoredConsent();
  if (stored) {
    applyConsentChoice(stored);
  }
}

export function getStoredConsent(): ConsentChoice | null {
  const raw = getCookie(CONSENT_COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed.analytics_and_ads === 'boolean' ? parsed : null;
  } catch {
    return null;
  }
}

export function hasStoredConsentChoice(): boolean {
  return getStoredConsent() !== null;
}

function applyConsentChoice(choice: ConsentChoice): void {
  const granted = choice.analytics_and_ads;
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer.push(args));
  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
  });
}

export function setConsentChoice(choice: ConsentChoice): void {
  setCookie(CONSENT_COOKIE_NAME, JSON.stringify(choice), CONSENT_COOKIE_MAX_AGE_DAYS);
  applyConsentChoice(choice);
}

/**
 * Flags para o payload de `/api/lead` (§29/§34) — o CAPI só usa dado real do
 * usuário quando `ad_storage`/`ad_user_data` estiverem concedidos.
 */
export function getConsentFlagsForSubmission(): { consent_ad_user_data: boolean; consent_analytics_storage: boolean } {
  const stored = getStoredConsent();
  const granted = stored?.analytics_and_ads ?? false;
  return { consent_ad_user_data: granted, consent_analytics_storage: granted };
}
