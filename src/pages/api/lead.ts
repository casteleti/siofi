/**
 * Edge Function /api/lead (spec técnica §19/§20/§21/§29/§34). Valida,
 * sanitiza, aplica rate limit + honeypot + idempotência, grava no CRM,
 * dispara Meta CAPI e responde { ok: true, lead_id }.
 *
 * Acesso a env/bindings via `cloudflare:workers` — `Astro.locals.runtime.env`
 * foi removido nesta versão do adapter (ver README, nota técnica).
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';
import { leadSchema } from '../../lib/validation/leadSchema';
import { sanitizeFreeText, normalizePhoneBr } from '../../lib/server/sanitize';
import { isAttemptAllowed, recordAttempt, isSuccessAllowed, recordSuccess } from '../../lib/server/rateLimit';
import { getPreviousResult, recordResult } from '../../lib/server/idempotency';
import { dispatchToCrm, type CrmPayload } from '../../lib/server/crm';
import { sendMetaCapiLead } from '../../lib/server/metaCapi';
import { isConfigured, type Env } from '../../lib/server/env';

const env = cfEnv as unknown as Env;

const EMPLOYEES_RANGE_ENUM: Record<string, string> = { '1-4': '1_4', '5-12': '5_12', '13+': '13_plus' };
const USES_SYSTEM_ENUM: Record<string, 'yes' | 'no'> = { sim: 'yes', nao: 'no' };

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

export const POST: APIRoute = async ({ request }) => {
  // CSRF leve (§40): a Origin, quando enviada pelo browser, precisa bater com
  // a própria origem que está servindo a requisição — não depende de domínio
  // configurado, funciona igual em dev/staging/produção.
  const origin = request.headers.get('origin');
  const expectedOrigin = new URL(request.url).origin;
  if (origin && origin !== expectedOrigin) {
    return jsonResponse({ ok: false, error: 'forbidden' }, 403);
  }

  const ip = getClientIp(request);

  if (!(await isAttemptAllowed(env.RATE_LIMIT_KV, ip))) {
    return jsonResponse({ ok: false, error: 'rate_limited' }, 429);
  }
  await recordAttempt(env.RATE_LIMIT_KV, ip);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'validation' }, 422);
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ ok: false, error: 'validation' }, 422);
  }
  const data = parsed.data;

  // Idempotência (§35): reenvio do mesmo lead_id retorna o resultado já processado.
  const previous = await getPreviousResult(env.RATE_LIMIT_KV, data.leadId);
  if (previous) {
    return jsonResponse(previous, 200);
  }

  // Honeypot + timing check (§19/§56): resposta 200 "falsa" e silenciosa —
  // nada é gravado nem disparado, e o bot não recebe sinal de que foi pego.
  const tooFast = Date.now() - data.formRenderedAt < 3000;
  if (data.website_url || tooFast) {
    return jsonResponse({ ok: true, lead_id: data.leadId }, 200);
  }

  if (!(await isSuccessAllowed(env.RATE_LIMIT_KV, ip))) {
    return jsonResponse({ ok: false, error: 'rate_limited' }, 429);
  }

  const normalizedPhone = normalizePhoneBr(data.whatsapp);
  if (!normalizedPhone) {
    return jsonResponse({ ok: false, error: 'validation' }, 422);
  }

  const crmPayload: CrmPayload = {
    lead: {
      lead_id: data.leadId,
      name: sanitizeFreeText(data.name),
      company: sanitizeFreeText(data.company),
      whatsapp: normalizedPhone,
      city: sanitizeFreeText(data.city),
    },
    business: {
      employees_range: EMPLOYEES_RANGE_ENUM[data.employeesRange] ?? data.employeesRange,
      current_system: USES_SYSTEM_ENUM[data.usesManagementSystem] ?? 'no',
      current_system_name: data.currentSystem ? sanitizeFreeText(data.currentSystem) : undefined,
      page_variant: data.pageVariant,
      form_context: data.formContext,
    },
    attribution: {
      first_touch: data.firstTouch ?? null,
      last_touch: data.lastTouch ?? null,
      landing_url: data.lastTouch?.landing_url ?? data.firstTouch?.landing_url,
      referrer: data.lastTouch?.referrer ?? data.firstTouch?.referrer,
    },
    technical: {
      submitted_at: new Date().toISOString(),
      user_agent: request.headers.get('user-agent') ?? 'unknown',
      consent_ad_storage: data.consentAdUserData,
      consent_analytics_storage: data.consentAnalyticsStorage,
    },
    lead_source_system: 'landing_page_siofi',
  };

  // Nunca perder o lead: mesmo se o CRM estiver indisponível, o registro de
  // idempotência abaixo preserva o resultado da tentativa. Fila/retry real
  // para reenvio ao CRM é [TBD — DEFINIR MECANISMO, ex. Cloudflare Queues],
  // não implementado nesta tarefa (spec técnica §56).
  await dispatchToCrm(crmPayload, env.CRM_ENDPOINT, env.CRM_API_KEY);

  if (data.consentAdUserData && isConfigured(env.META_PIXEL_ID) && isConfigured(env.META_CAPI_ACCESS_TOKEN)) {
    await sendMetaCapiLead({
      leadId: data.leadId,
      eventSourceUrl: data.lastTouch?.landing_url ?? data.firstTouch?.landing_url ?? expectedOrigin + '/siofi',
      phoneE164: normalizedPhone,
      clientIp: ip !== 'unknown' ? ip : undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      fbp: data.fbp,
      fbc: data.fbc,
      pixelId: env.META_PIXEL_ID,
      accessToken: env.META_CAPI_ACCESS_TOKEN,
    });
  }

  await recordSuccess(env.RATE_LIMIT_KV, ip);

  const result = { ok: true as const, lead_id: data.leadId };
  await recordResult(env.RATE_LIMIT_KV, data.leadId, result);

  return jsonResponse(result, 200);
};
