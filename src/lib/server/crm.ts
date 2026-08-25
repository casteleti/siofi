import { isConfigured } from './env';

/** Estrutura de payload do CRM — espelha exatamente a spec técnica §34. */
export interface CrmPayload {
  lead: {
    lead_id: string;
    name: string;
    company: string;
    whatsapp: string;
    // "Cidade/UF" é um único campo de texto livre no formulário (design
    // system §12) — não tentamos separar UF automaticamente (risco de dado
    // errado); ficaria em `city` como o usuário digitou, se algum dia
    // enriquecimento por UF for necessário, é `SHOULD`, não `MUST` (§24).
    city: string;
  };
  business: {
    employees_range: string;
    current_system: 'yes' | 'no';
    current_system_name?: string;
    page_variant: string;
    form_context: string;
  };
  attribution: {
    first_touch: unknown;
    last_touch: unknown;
    landing_url?: string;
    referrer?: string;
  };
  technical: {
    submitted_at: string;
    user_agent: string;
    consent_ad_storage: boolean;
    consent_analytics_storage: boolean;
  };
  lead_source_system: 'landing_page_siofi';
}

/**
 * Envia o lead ao CRM (§34). `CRM_ENDPOINT`/`CRM_API_KEY` são `[TBD — DEFINIR
 * CRM]` até a F5 escolher um destino — sem eles, esta função só loga e
 * retorna `delivered: false`; **nunca** falha a resposta ao usuário por isso
 * (o lead ainda existe no registro de idempotência do servidor).
 *
 * Mecanismo de fila/retry para indisponibilidade do CRM é `[TBD — DEFINIR
 * MECANISMO, ex. Cloudflare Queues]` (spec técnica §56) — não implementado
 * aqui; ver README.
 */
export async function dispatchToCrm(
  payload: CrmPayload,
  endpoint: string | undefined,
  apiKey: string | undefined,
): Promise<{ delivered: boolean }> {
  if (!isConfigured(endpoint)) {
    console.warn(`[siofi] CRM_ENDPOINT não configurado — lead_id=${payload.lead.lead_id} não foi enviado a nenhum CRM.`);
    return { delivered: false };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(isConfigured(apiKey) ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[siofi] CRM respondeu ${response.status} para lead_id=${payload.lead.lead_id}`);
      return { delivered: false };
    }

    return { delivered: true };
  } catch (error) {
    console.error(`[siofi] Falha ao enviar lead_id=${payload.lead.lead_id} ao CRM:`, error);
    return { delivered: false };
  }
}
