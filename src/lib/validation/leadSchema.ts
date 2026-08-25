import { z } from 'zod';

/**
 * Schema de validação do payload de `/api/lead` (spec técnica §19/§20/§32/§34).
 * Compartilhado entre client (LeadForm.tsx) e server (/api/lead.ts).
 * `.strict()` no nível raiz: allowlist estrita — rejeita qualquer campo extra
 * não esperado (§19 "Rejeitar payload com campos extras não esperados").
 */
const touchSchema = z
  .object({
    utm_source: z.string().max(100).optional(),
    utm_medium: z.string().max(100).optional(),
    utm_campaign: z.string().max(150).optional(),
    utm_content: z.string().max(150).optional(),
    utm_term: z.string().max(150).optional(),
    gclid: z.string().max(255).optional(),
    gbraid: z.string().max(255).optional(),
    wbraid: z.string().max(255).optional(),
    fbclid: z.string().max(255).optional(),
    landing_url: z.string().max(2048).optional(),
    referrer: z.string().max(2048).optional(),
    seen_at: z.string().max(64).optional(),
  })
  .strict();

export const leadSchema = z
  .object({
    leadId: z.uuid(),
    name: z.string().trim().min(1).max(120),
    company: z.string().trim().min(1).max(150),
    whatsapp: z.string().trim().min(10).max(20),
    city: z.string().trim().min(1).max(100),
    employeesRange: z.enum(['1-4', '5-12', '13+']),
    usesManagementSystem: z.enum(['sim', 'nao']),
    currentSystem: z.string().trim().max(150).optional(),
    formContext: z.enum(['final_cta', 'troca_sistema']).default('final_cta'),
    pageVariant: z.string().max(60).default('siofi_main'),
    // Honeypot (§19): campo oculto que um usuário real nunca preenche.
    // Sem limite de tamanho aqui de propósito — se viesse com max(0) a própria
    // validação rejeitaria com 422 e entregaria o mecanismo a um bot.
    website_url: z.string().max(500).optional().default(''),
    // Timestamp (ms) de quando o formulário foi renderizado, para o timing check (§19).
    formRenderedAt: z.number(),
    firstTouch: touchSchema.nullable().optional(),
    lastTouch: touchSchema.nullable().optional(),
    fbp: z.string().max(255).optional(),
    fbc: z.string().max(255).optional(),
    consentAdUserData: z.boolean().default(false),
    consentAnalyticsStorage: z.boolean().default(false),
  })
  .strict();

export type LeadInput = z.infer<typeof leadSchema>;
