import type { KVNamespace } from '@cloudflare/workers-types';

/**
 * Abstração mínima de key-value com TTL, usada por rate limiting e
 * idempotência (§19/§35 da spec técnica). Usa o binding `RATE_LIMIT_KV` do
 * Cloudflare quando disponível; cai para um Map em memória caso contrário
 * (ex.: `astro dev` sem Miniflare/binding configurado).
 *
 * MUST saber: o fallback em memória só existe dentro de uma única instância
 * de isolate — não funciona de forma distribuída entre edges. É aceitável
 * para desenvolvimento local, mas a proteção real de produção depende do
 * binding KV estar configurado (ver README).
 */
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, ttlSeconds: number): Promise<void>;
}

const memoryStore = new Map<string, { value: string; expiresAt: number }>();

function createMemoryStore(): KeyValueStore {
  return {
    async get(key) {
      const entry = memoryStore.get(key);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) {
        memoryStore.delete(key);
        return null;
      }
      return entry.value;
    },
    async put(key, value, ttlSeconds) {
      memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    },
  };
}

function createKvStore(kv: KVNamespace): KeyValueStore {
  return {
    get: (key) => kv.get(key),
    async put(key, value, ttlSeconds) {
      await kv.put(key, value, { expirationTtl: ttlSeconds });
    },
  };
}

export function createStore(kv: KVNamespace | undefined): KeyValueStore {
  return kv ? createKvStore(kv) : createMemoryStore();
}
