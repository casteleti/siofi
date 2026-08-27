/**
 * Gerador de JSON-LD `SoftwareApplication` (spec técnica §9.2).
 * Renderizado apenas na página principal `/siofi`.
 *
 * MUST: se não houver preço público, omitir o bloco `offers` por completo —
 * nunca inventar valor nem usar "price": "0" (dado estruturado enganoso).
 *
 * `pageUrl` recebe a URL COMPLETA da página do produto (ex.: .../siofi), não
 * a origem crua do site — auditoria SEO 2026-08-26: schema.org define `url`
 * de um SoftwareApplication como a página que descreve o software, e antes
 * esse campo recebia só `https://f5sg.com.br` (a raiz), o que é factualmente
 * impreciso mesmo não sendo "errado" o bastante pra falhar validação.
 */
export function buildSoftwareApplicationSchema(pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SiOfi',
    applicationCategory: 'BusinessApplication',
    // operatingSystem: "Windows" reflete o produto atual (desktop).
    // [TBD — F5 CONFIRMAR] se também existe versão web/nuvem.
    operatingSystem: 'Windows',
    description:
      'Sistema de gestão para oficinas mecânicas, auto centers, autoelétricas e funilarias: ordem de serviço, financeiro, estoque, compras e fiscal.',
    url: pageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'F5 Software de Gestão',
    },
    // offers omitido propositalmente — sem preço público na copy (§9.2).
  };
}
