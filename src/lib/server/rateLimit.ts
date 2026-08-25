import type { KVNamespace } from '@cloudflare/workers-types';
import { createStore } from './kvStore';

/**
 * Rate limiting por IP em `/api/lead` (spec técnica §19):
 * máx. 5 submissões bem-sucedidas/hora, máx. 15 tentativas/hora.
 *
 * Implementado como get-then-put sobre KV (não atômico — aproximado, não
 * perfeito sob concorrência alta; suficiente para o volume de uma landing
 * page e é o mesmo trade-off que a própria spec reconhece ao citar Durable
 * Object como alternativa mais rigorosa, não implementada aqui).
 */
const HOUR_MS = 3_600_000;
const MAX_ATTEMPTS_PER_HOUR = 15;
const MAX_SUCCESSES_PER_HOUR = 5;

function hourBucket(): number {
  return Math.floor(Date.now() / HOUR_MS);
}

async function getCount(store: ReturnType<typeof createStore>, key: string): Promise<number> {
  const raw = await store.get(key);
  return raw ? Number.parseInt(raw, 10) || 0 : 0;
}

async function increment(store: ReturnType<typeof createStore>, key: string): Promise<void> {
  const current = await getCount(store, key);
  await store.put(key, String(current + 1), 3600);
}

export async function isAttemptAllowed(kv: KVNamespace | undefined, ip: string): Promise<boolean> {
  const store = createStore(kv);
  const key = `siofi:rl:attempts:${ip}:${hourBucket()}`;
  const count = await getCount(store, key);
  return count < MAX_ATTEMPTS_PER_HOUR;
}

export async function recordAttempt(kv: KVNamespace | undefined, ip: string): Promise<void> {
  const store = createStore(kv);
  await increment(store, `siofi:rl:attempts:${ip}:${hourBucket()}`);
}

export async function isSuccessAllowed(kv: KVNamespace | undefined, ip: string): Promise<boolean> {
  const store = createStore(kv);
  const key = `siofi:rl:success:${ip}:${hourBucket()}`;
  const count = await getCount(store, key);
  return count < MAX_SUCCESSES_PER_HOUR;
}

export async function recordSuccess(kv: KVNamespace | undefined, ip: string): Promise<void> {
  const store = createStore(kv);
  await increment(store, `siofi:rl:success:${ip}:${hourBucket()}`);
}
