/**
 * Gerador de JSON-LD `WebPage` (spec técnica §9.4, SHOULD) — nunca havia
 * sido implementado (auditoria SEO 2026-08-26). Complementa Organization/
 * SoftwareApplication, um por página.
 */
export function buildWebPageSchema(params: {
  name: string;
  pageUrl: string;
  siteUrl: string;
  siteName?: string;
}) {
  const { name, pageUrl, siteUrl, siteName = 'SiOfi' } = params;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url: pageUrl,
    inLanguage: 'pt-BR',
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
    },
  };
}
