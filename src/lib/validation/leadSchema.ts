import { z } from 'zod';

/**
 * Schema de validação do formulário de lead (§19/§20 da spec técnica).
 * Compartilhável entre client (LeadForm.tsx) e server (/api/lead.ts) —
 * nesta tarefa ainda não está conectado a nenhum dos dois (Tarefa 4).
 */
export const leadSchema = z.object({
  leadId: z.uuid(),
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().min(1).max(150),
  whatsapp: z.string().trim().min(10).max(11),
  city: z.string().trim().min(1).max(100),
  employeesRange: z.enum(['1-4', '5-12', '13+']),
  usesManagementSystem: z.enum(['sim', 'nao']),
  currentSystem: z.string().trim().max(150).optional(),
  // Nome do campo alinhado com HONEYPOT_FIELD_NAME (.env.example) — hardcoded aqui
  // de propósito nesta tarefa; a Tarefa 4 decide como injetar o valor de env em runtime.
  website_url: z.string().max(0).optional(),
  formRenderedAt: z.number().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

// TODO (Tarefa 4): usar este schema em LeadForm.tsx (client) e /api/lead.ts (server),
// com allowlist estrita de chaves e normalização de telefone para E.164 antes de gravar.
