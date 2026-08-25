/**
 * Gerador de JSON-LD `SoftwareApplication` (spec técnica §9.2).
 * Renderizado apenas na página principal `/siofi`.
 *
 * MUST: se não houver preço público, omitir o bloco `offers` por completo —
 * nunca inventar valor nem usar "price": "0" (dado estruturado enganoso).
 */
export function buildSoftwareApplicationSchema(siteUrl: string) {
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
    url: siteUrl,
    publisher: {
      '@type': 'Organization',
      name: 'F5 Software de Gestão',
    },
    // offers omitido propositalmente — sem preço público na copy (§9.2).
  };
}
