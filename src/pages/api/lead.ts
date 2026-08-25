/**
 * Edge Function /api/lead (spec técnica §19/§20/§21). Responsabilidade final:
 * validar, sanitizar, rate-limit, honeypot, gravar no CRM, disparar Meta CAPI,
 * responder { ok: true, lead_id }.
 *
 * STUB DE PROPÓSITO — Tarefa 1. A lógica real é a Tarefa 4; até lá este
 * endpoint responde 501 Not Implemented, sem tocar em nenhum dado enviado.
 */
export const prerender = false;

export async function POST(): Promise<Response> {
  return new Response(
    JSON.stringify({
      ok: false,
      error: 'not_implemented',
      message: 'Lógica de /api/lead ainda não implementada (Tarefa 4).',
    }),
    {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
