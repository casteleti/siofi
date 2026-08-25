import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// Stack e decisões de arquitetura: docs/siofi-landing-technical-performance-seo-tracking.md §3
// output: 'static' (SSG) com rotas dinâmicas pontuais (ex.: /api/lead) via `export const prerender = false`.
const siteUrl = process.env.PUBLIC_SITE_URL || 'https://siofi.example.com';

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
    }),
  ],
});
