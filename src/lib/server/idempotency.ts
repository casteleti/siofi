import type { KVNamespace } from '@cloudflare/workers-types';
import { createStore } from './kvStore';

/**
 * Idempotência por `lead_id` (spec técnica §19/§35): se o mesmo `lead_id`
 * chegar duas vezes (duplo clique, retry), responde com o resultado já
 * processado sem gravar de novo nem disparar tracking duplicado.
 */
const IDEMPOTENCY_TTL_SECONDS = 24 * 3600;

export interface IdempotentResult {
  ok: true;
  lead_id: string;
}

export async function getPreviousResult(kv: KVNamespace | undefined, leadId: string): Promise<IdempotentResult | null> {
  const store = createStore(kv);
  const raw = await store.get(`siofi:lead:${leadId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function recordResult(kv: KVNamespace | undefined, leadId: string, result: IdempotentResult): Promise<void> {
  const store = createStore(kv);
  await store.put(`siofi:lead:${leadId}`, JSON.stringify(result), IDEMPOTENCY_TTL_SECONDS);
}
