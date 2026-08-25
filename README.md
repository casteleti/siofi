# SiOfi — Landing Page

Landing page comercial do **SiOfi** (sistema de gestão da F5 Software para
oficinas mecânicas e auto centers). Este repositório está na **Tarefa 1 de
uma sequência de 5** — ver `docs/promptclaudecode01setupstackestrutura.md`
(cópia local do prompt original) para o escopo completo.

## Documentos-fonte (imutáveis)

- `docs/siofi_landing_page_copy_claude_code.md` — copy aprovada.
- `docs/siofi-landing-visual-design-system.md` — design system.
- `docs/siofi-landing-technical-performance-seo-tracking.md` — arquitetura técnica, SEO, performance e tracking.

Esses três documentos são a fonte única de verdade. Nenhum valor visual, texto
de copy ou decisão de arquitetura neste código deveria divergir deles sem
atualizar o documento correspondente primeiro.

## Stack

- **Astro** (`output: 'static'`, `trailingSlash: 'never'`, `build.format: 'file'`)
- **Preact** — única ilha interativa (`LeadForm.tsx`), hidratada com `client:visible`
- **Adapter Cloudflare Pages** (`@astrojs/cloudflare`) — permite o único endpoint
  dinâmico (`/api/lead`, `/siofi/[slug]`) via `export const prerender = false`
  dentro de um output majoritariamente estático
- **Zod** — schema de validação do lead (ainda não conectado a nada)
- **lucide-static** — ícones (design system §10), lidos via `import.meta.glob`
  em build time (não via `node:fs`, que não existe no runtime Cloudflare Workers)

## Rodando o projeto

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # gera dist/
npm run preview   # roda o build via Wrangler local
npm run lint      # astro check (type-check)
```

## O que já existe (Tarefa 1)

- Estrutura de pastas completa conforme o Claude Code Implementation Map
  (spec técnica §68): `/components` (layout, sections, ui, form, global),
  `/content` (config + placeholders), `/lib` (stubs), `/pages`, `/schemas`, `/styles`.
- `src/styles/tokens.css` — espelho exato dos tokens do design system §20.
- As 15 seções da copy (§5) como componentes Astro, com placeholders visuais
  explícitos (`[PLACEHOLDER — ...]`) fiéis à estrutura de grid/split/cards de
  cada seção — nenhum lorem ipsum genérico.
- Rotas `/siofi`, `/siofi/obrigado` (noindex) e `/siofi/[slug]` (template
  dinâmico para variantes futuras — retorna 404 gracioso para slugs não
  cadastrados, sem quebrar).
- `/api/lead` respondendo `501 Not Implemented` de propósito.
- Content Collections (`src/content.config.ts`) com o schema de página de
  landing, populado apenas com `/siofi`.
- `LeadForm.tsx` funcional na estrutura (validação HTML5, estado dos 7 campos,
  chama `/api/lead` e trata a resposta 501) — sem tracking, sem lead_id/idempotência,
  sem honeypot funcional, sem redirect para `/obrigado` (isso é Tarefa 3/4).
- Schemas JSON-LD (`Organization`, `SoftwareApplication`, `FAQPage`) — gerados
  em código, com campos `[TBD]` explícitos onde faltam dados reais.
- `.env.example`, `robots.txt`, `_headers`, `_redirects` com placeholders
  `[TBD]` nos valores que dependem de decisão de negócio.

## Observação técnica registrada durante a implementação

O design system (§16 Motion / classes `.reveal`) e o wrapper de ícones foram
implementados com pequenos ajustes de engenharia não previstos literalmente
nos documentos-fonte, mas necessários para o build funcionar neste stack:

- **Ícones via `import.meta.glob`, não `node:fs`.** O adapter Cloudflare
  renderiza (inclusive em prerender) dentro do runtime Workers, que não expõe
  `node:fs`/`node:path`. `Icon.astro` lê os SVGs do `lucide-static` com
  `import.meta.glob(..., { eager: true, query: '?raw' })`, resolvido por Vite
  em build time. Isso significa que **todo ícone novo usado no projeto precisa
  ser adicionado à lista explícita dentro de `Icon.astro`** — não há fallback
  automático para nomes não listados (renderiza um `<span>` vazio com
  `data-icon` para não quebrar o layout).
- **`build.format: 'file'` + `trailingSlash: 'never'`.** Sem essa combinação,
  o Cloudflare/Wrangler serve `/siofi/index.html` como diretório e força um
  redirect automático `/siofi` → `/siofi/`, que entra em loop com o redirect
  inverso exigido pela spec técnica (§4: sem trailing slash). Gerando páginas
  como arquivos planos (`siofi.html`) esse conflito não existe.
- **Content Collections:** o arquivo de configuração precisa ficar em
  `src/content.config.ts` (raiz de `src`), não em `src/content/config.ts` —
  a segunda localização é o formato "legacy" e falha o build nesta versão do
  Astro. Além disso, o loader `glob()` trata um campo `slug` dentro do JSON de
  dados como **override do id da entrada** — por isso a entrada de
  `siofi-main.json` tem id real `"siofi"` (valor do campo `slug`), não
  `"siofi-main"` (nome do arquivo). As páginas buscam a entrada por
  `getEntry('landing-pages', 'siofi')`.

Nenhuma dessas decisões altera copy, tokens visuais ou arquitetura de
tracking/backend — são detalhes de implementação do stack, registrados aqui
em vez de alterados silenciosamente nos documentos-fonte.

## Pendente / `[TBD]` (checklist para a F5)

### Bloqueante para lançamento
- Logo SiOfi em SVG (lockup colorido flat, lockup negativo, símbolo isolado) — `public/assets/logo`.
- 4 screenshots recapturados em alta resolução (dashboard, OS, DRE, estoque/XML) — `public/assets/screens`.
- Fontes Manrope (700/800) e Inter (400/500/600) em WOFF2 self-hosted — `public/fonts`
  (os `@font-face` em `src/styles/global.css` já referenciam os nomes de arquivo esperados).
- Domínio canônico definitivo (`PUBLIC_SITE_URL`, `.env.example`, `astro.config.mjs`, `robots.txt`, `_redirects`).
- Confirmação das modalidades fiscais suportadas (a página deve exibir apenas NF-e até validação).
- Telefone, WhatsApp, e-mail, endereço e CNPJ da F5 (`Footer.astro`, `FloatingWhatsApp.astro`, `organization.json`).
- URL da política de privacidade (`Footer.astro`).
- Destino do formulário (CRM/e-mail/webhook) e IDs de GTM/GA4/Google Ads/Meta Pixel (`.env.example`).

### Recomendado
- Foto da equipe de suporte F5 (`SupportSection.astro`).
- 3 depoimentos reais autorizados (`TestimonialsSection.astro`).
- Logos de clientes autorizados (`TrustBar.astro`).
- Dados validados para a TrustBar (anos de mercado, nº de clientes, cidades).
- Resposta validada para "Como funciona a implantação?" e "Posso migrar dados?" (hoje ocultas do FAQ/JSON-LD).

### Fora de escopo desta tarefa (não implementado de propósito)
- Copy final dentro dos componentes — `src/content/copy/siofi-main.copy.json` está
  todo com placeholders `[PENDENTE — Tarefa 2]`.
- Tracking real (GTM, GA4, Meta Pixel, CAPI, dataLayer com eventos reais,
  Consent Mode) — stubs tipados em `src/lib/analytics` e `src/lib/tracking`.
- Lógica real de `/api/lead` (validação server-side, rate limit, honeypot,
  gravação em CRM, disparo de CAPI) — responde `501` de propósito.
- Imagens/screenshots/fotos reais e logo em SVG.
- Auditoria de Lighthouse/PageSpeed contra as metas de produção.

## Próximos prompts da sequência

1. ~~Setup do stack + estrutura base~~ (este)
2. Implementação das seções com a copy real (`content/copy/siofi-main.copy.json`)
3. Tracking completo (GTM, GA4, Meta Pixel/CAPI, Consent Mode, atribuição/UTMs)
4. Backend do formulário (validação, rate limit, honeypot, CRM, `/api/lead` real)
5. QA final de performance, acessibilidade e SEO contra as metas de produção
