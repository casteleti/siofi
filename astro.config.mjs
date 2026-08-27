import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// Stack e decisões de arquitetura: docs/siofi-landing-technical-performance-seo-tracking.md §3
// output: 'static' (SSG) com rotas dinâmicas pontuais (ex.: /api/lead) via `export const prerender = false`.
//
// Domínio canônico definido por Renato em 2026-08-26 (auditoria SEO): https://f5sg.com.br
// A rota do produto em si já é "/siofi" (kebab-case minúsculo, consistente com o resto
// do projeto — ver §4 da spec técnica) mesmo o link informado usando "/siOfi" (grafia
// do slug atual no site institucional da F5); ajustar aqui + em public/_redirects se
// o path final precisar bater literalmente com a grafia do WordPress deles.
const siteUrl = process.env.PUBLIC_SITE_URL || 'https://f5sg.com.br';

export default defineConfig({
  site: siteUrl,
  output: 'static',
  // §4 da spec técnica: URLs sem trailing slash ("/siofi", não "/siofi/").
  // build.format 'file' evita que o Cloudflare/Wrangler sirva /siofi/index.html
  // como diretório e force um redirect automático de volta para a barra final
  // (o que geraria loop com o redirect 301 inverso definido em public/_redirects).
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [
    preact(),
    sitemap({
      // §5 da spec técnica: obrigado e variantes não aprovadas ficam fora do sitemap.
      filter: (page) =>
        !page.includes('/siofi/obrigado') && !page.includes('/siofi/gestao-oficina'),
      // §5 exige `lastmod` real ("data do último deploy/commit da página") — sem
      // isso o sitemap saía sem <lastmod> nenhum. Timestamp do build é a aproximação
      // correta para um site estático sem CMS por página (auditoria SEO 2026-08-26).
      serialize(item) {
        return { ...item, lastmod: new Date() };
      },
    }),
  ],
});
