# SiOfi — Landing Page

Landing page comercial do **SiOfi** (sistema de gestão da F5 Software para
oficinas mecânicas e auto centers). Este repositório implementa as 5 tarefas
descritas em `docs/promptclaudecode01setupstackestrutura.md` (setup, copy
real, tracking, backend, QA) — o que ficou pendente em cada uma é sempre
uma credencial, asset ou decisão de negócio que só a F5 pode fornecer, nunca
código faltando.

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
- **Adapter Cloudflare** (`@astrojs/cloudflare` 14.x) — um único endpoint dinâmico
  (`/api/lead`) e um template dinâmico (`/siofi/[slug]`) via `export const prerender = false`
  dentro de um output majoritariamente estático
- **Zod** — validação do payload de `/api/lead`, compartilhada client/server
- **lucide-static** — ícones (design system §10), lidos via `import.meta.glob` em build time
- **wrangler** + **@cloudflare/workers-types** — tipos e config local do runtime Cloudflare

## Rodando o projeto

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # gera dist/
npm run preview   # roda o build via Wrangler local
npm run lint      # astro check (type-check)
```

Para testar o backend localmente com variáveis reais de teste (Meta CAPI,
CRM etc.), copie `.dev.vars.example` para `.dev.vars` (git-ignorado) e
preencha com credenciais de sandbox — nunca produção. Ver nota técnica
abaixo sobre por que `.dev.vars` (Wrangler) é diferente de `.env` (Vite).

## Estado do projeto

### Tarefa 1 — Setup e estrutura
Estrutura de pastas conforme o Claude Code Implementation Map (spec técnica
§68), design tokens espelhando o design system §20, rotas `/siofi`,
`/siofi/obrigado`, `/siofi/[slug]`, content collections.

### Tarefa 2 — Copy real
`src/content/copy/siofi-main.copy.json` contém o texto literal de
`siofi_landing_page_copy_claude_code.md`, estruturado por seção. Todas as 15
seções consomem esse JSON — nenhum texto de marketing hardcoded nos
componentes. Duas seções ficam condicionalmente ocultas por falta de dado
real (design system: "seções condicionais ocultas quando vazias"):
- **TrustBar**: a frase fixa da copy renderiza; a fila de logos (`trustBar.logos`)
  só aparece quando a F5 fornecer logos autorizados.
- **Testimonials**: a seção inteira (`<section>`) não renderiza enquanto
  `testimonials.items` estiver vazio — nenhum depoimento fictício foi criado.

O FAQ usa apenas as 7 perguntas com resposta validada na copy; as 2 marcadas
`TODO F5` (implantação, migração) ficam fora do accordion **e** do
`FAQPage` JSON-LD.

### Tarefa 3 — Tracking
- **Consent Mode v2** (`src/lib/tracking/consent.ts`): os 4 sinais começam
  `denied`, banner de consentimento (`ConsentBanner.astro`, 2 categorias:
  Necessários + Analytics e Publicidade) grava a escolha em cookie
  `siofi_consent` (12 meses) e atualiza o Consent Mode via `gtag('consent','update',...)`.
- **GTM** (`AnalyticsBootstrap.astro`): só carrega se `PUBLIC_GTM_CONTAINER_ID`
  for um ID real (`/^GTM-[A-Z0-9]+$/`) — com o `.env.example` placeholder,
  o snippet nem tenta carregar (evita erro 404 contra `GTM-undefined`).
- **Atribuição de primeira parte** (`src/lib/tracking/attribution.ts`): lê
  UTMs/click IDs da URL, grava cookie `siofi_attribution` (90 dias) com
  first-touch (nunca sobrescrito) e last-touch (atualizado só com sinal de
  campanha novo), espelha em `sessionStorage` como fallback de navegação.
- **Taxonomia completa** (`src/lib/analytics/dataLayer.ts`): `page_view`
  (automático via GA4 quando o GTM/GA4 estiverem configurados),
  `form_start`, `hero_cta_click`/`demo_cta_click`/`secondary_cta_click`,
  `whatsapp_click`, `phone_click`, `scroll_depth` (25/50/75/100, uma vez por
  carregamento), `faq_open`, `migration_interest`, `form_error`,
  `lead_submitted` — todos com parâmetros de vocabulário fechado, nunca PII.
- Todo CTA usa `data-track`/`data-section` (delegação de clique central em
  `AnalyticsBootstrap.astro` — nenhum componente chama `dataLayer.push` direto).

**O que só existe no painel do GTM, não em código:** a configuração das tags/
triggers/variáveis dentro do container (§25) é feita na UI do Google Tag
Manager pela pessoa que tiver acesso à conta — nenhum código pode
"pré-configurar" isso à distância. O que este repositório garante é que os
eventos certos, com os parâmetros certos, cheguem ao `dataLayer` para essa
configuração consumir.

### Tarefa 4 — Backend do formulário
`/api/lead.ts` implementa, nesta ordem: checagem de `Origin` (CSRF leve),
rate limit por IP (15 tentativas/h, 5 sucessos/h), validação Zod estrita
(`leadSchema`, rejeita campos extras), honeypot + timing check (< 3s → 200
falso e silencioso), idempotência por `lead_id` (24h), normalização de
telefone para E.164, sanitização de texto livre, montagem do payload de CRM
(§34), disparo ao CRM e ao Meta CAPI (com hash SHA-256 do telefone via Web
Crypto nativa do Workers).

`LeadForm.tsx` gera o `lead_id` no primeiro foco (`form_start`), envia
atribuição + flags de consentimento + honeypot no payload, trata timeout (8s)
com um retry silencioso, mostra fallback de WhatsApp em erro, e redireciona
para `/siofi/obrigado` só após 2xx real (nunca no clique do botão).

**CRM e Meta CAPI são condicionais a env vars reais** (`CRM_ENDPOINT`/
`CRM_API_KEY`, `META_PIXEL_ID`/`META_CAPI_ACCESS_TOKEN`) — sem elas, o lead
ainda é validado, protegido contra spam e registrado no store de
idempotência do servidor, só não é entregue a nenhum destino externo (loga
um aviso). **Mecanismo de fila/retry para indisponibilidade do CRM** é
`[TBD — DEFINIR MECANISMO, ex. Cloudflare Queues]`, não implementado.

### Tarefa 5 — QA
Verificado nesta tarefa (ambiente sandbox, sem Chrome/domínio real
disponíveis — ver limitações abaixo):
- **Estrutura**: 1 único `<h1>` por página, hierarquia H2 sem saltos,
  `aria-labelledby` em todas as seções com heading, landmarks (`header`,
  `main`, `footer`, `nav`), skip link, `lang="pt-BR"`.
- **Schema.org**: `Organization`, `SoftwareApplication` e `FAQPage` (7
  perguntas) validados manualmente na saída HTML.
- **SEO técnico**: `sitemap-index.xml` contém apenas `/siofi` (obrigado
  excluído); `robots.txt` bloqueia `/api/` e `/siofi/obrigado`.
- **Backend**: testado manualmente via `curl` — submissão válida, reenvio
  idempotente, honeypot, timing check, payload inválido, campo extra
  (rejeitado pelo schema `.strict()`) e rate limit (estourado
  deliberadamente em teste, confirmado 429 no 16º attempt).
- **Performance (proxy, sem Lighthouse real)**: tamanho gzip medido
  diretamente nos artefatos do build —
  HTML `/siofi` ≈ 16 KB (budget ≤ 35 KB), JS total ≈ 15,9 KB
  (budget inicial ≤ 70 KB; ilha do formulário sozinha ≈ 3,1 KB, budget ≤ 35 KB),
  CSS total ≈ 5,9 KB (budget ≤ 40 KB) — folgado porque não há screenshots/fontes
  reais ainda; vai crescer quando os assets da checklist abaixo entrarem.

**Limitações desta QA (não são bugs, são o ambiente de execução):**
- Não há Chrome/Chromium disponível neste ambiente para rodar Lighthouse de
  verdade — os números de performance acima são um proxy (tamanho de
  transferência), não o LCP/INP/CLS reais de §10. Rodar
  `npx lighthouse http://localhost:PORT/siofi --view` numa máquina com Chrome
  antes do lançamento.
- Sem domínio real, PageSpeed Insights/Search Console/field data (§51/§52)
  não podem ser executados — só fazem sentido contra produção.
- Sem dispositivos físicos neste ambiente — o checklist mobile (§60) precisa
  de um Android e um iOS reais antes do lançamento.
- Sem conta de GTM/GA4/Meta/Google Ads reais — a validação ponta a ponta do
  tracking (Preview Mode, DebugView, Events Manager, dedupe) só é possível
  com as contas e IDs reais da F5.

## Notas técnicas registradas durante a implementação

Pequenos ajustes de engenharia não previstos literalmente nos documentos-fonte,
necessários para o build funcionar neste stack — nenhum altera copy, tokens
visuais ou arquitetura de tracking/backend, só a forma como o stack é montado:

- **Ícones via `import.meta.glob`, não `node:fs`.** O runtime Cloudflare
  Workers (usado até em prerender) não expõe módulos Node. `Icon.astro` lê os
  SVGs do `lucide-static` via `import.meta.glob(..., { query: '?raw' })`,
  resolvido por Vite em build time. **Todo ícone novo precisa ser adicionado
  à lista explícita em `Icon.astro`** — sem fallback automático.
- **`build.format: 'file'` + `trailingSlash: 'never'`.** Evita que o
  Cloudflare/Wrangler sirva `/siofi/index.html` como diretório e force um
  redirect automático `/siofi` → `/siofi/`, que entraria em loop com o
  redirect inverso exigido pela spec (§4: sem trailing slash).
- **`src/content.config.ts`** (não `src/content/config.ts`, formato legado
  nesta versão do Astro). A entrada de `/siofi` tem id real `"siofi"`
  (o loader `glob()` usa o campo `slug` do JSON como override do id, não o
  nome do arquivo) — por isso `getEntry('landing-pages', 'siofi')`.
- **`Astro.locals.runtime.env` foi removido no `@astrojs/cloudflare` 14.x.**
  A spec técnica (§46/§47) foi escrita pensando no modelo clássico de
  Cloudflare Pages Functions; a versão do adapter instalada usa o novo
  `@cloudflare/vite-plugin` e expõe env/bindings via
  `import { env } from 'cloudflare:workers'` (usado em `src/pages/api/lead.ts`).
  Isso é uma mudança de API da própria Cloudflare/Astro entre quando a spec
  foi escrita e agora — a arquitetura (edge function, mesmo domínio, mesmo
  fluxo) continua idêntica ao diagrama de §2.
- **Rate limiting KV**: binding `RATE_LIMIT_KV` declarado em `wrangler.jsonc`
  sem `id` fixo (provisionamento automático do Cloudflare no primeiro
  deploy, mesmo mecanismo usado pelo binding `SESSION` que o próprio adapter
  já cria). Em ambientes sem o binding resolvido (ex. `astro dev` fora de
  Miniflare), `src/lib/server/kvStore.ts` cai para um `Map` em memória —
  funciona para testes locais, **não** é rate limiting distribuído de verdade.
- **CSP com `'unsafe-inline'`** em `script-src` (documentado como risco
  aceito na própria spec técnica §41, necessário para o snippet inline do
  GTM/Consent Mode).

## Pendente / `[TBD]` (checklist para a F5)

### Bloqueante para lançamento
- Logo SiOfi em SVG (lockup colorido flat, lockup negativo, símbolo isolado) — `public/assets/logo`.
- ~~Screenshots do dashboard (Indicadores) e da ordem de serviço~~ — aplicados (`public/assets/screens/indicadores.jpg` e `ordem-de-servico.jpg`, de `docs/img-hero.jpg` e `docs/img-os.jpg`), mas são prints legados de baixa resolução (686×429, sistema desktop antigo); recapturar em alta resolução do sistema atual quando possível. Ainda faltam **DRE e estoque/XML** — `public/assets/screens`.
- ~~Fontes Manrope/Inter~~ — resolvido via Google Fonts CDN (alternativa aceita pela spec §15) enquanto os arquivos self-hosted não chegam; `public/fonts` continua vazio, é `SHOULD`, não bloqueante.
- Domínio canônico definitivo (`PUBLIC_SITE_URL`, `astro.config.mjs`, `robots.txt`, `_redirects`, `wrangler.jsonc` se precisar de rota customizada).
- Confirmação das modalidades fiscais suportadas (a página exibe apenas NF-e até validação).
- ~~Telefone, e-mail, endereço~~ — preenchidos (`src/lib/contact.ts`, `Footer.astro`, `SupportSection.astro`, `organization.json`). Ainda faltam **WhatsApp** (`src/lib/whatsapp.ts`) e **CNPJ** (`organization.json`, footer).
- URL da política de privacidade (`Footer.astro`, `ConsentBanner.astro`).
- CRM escolhido (`CRM_ENDPOINT`/`CRM_API_KEY`) e mecanismo de fila/retry para indisponibilidade.
- IDs reais de GTM/GA4/Meta Pixel/Google Ads (`.env.example`/`.dev.vars.example`) e configuração das tags dentro do painel do GTM.
- Criar o KV namespace de rate limiting em produção (`wrangler kv namespace create RATE_LIMIT_KV` ou deixar o provisionamento automático do Cloudflare rodar no primeiro deploy).

### Recomendado
- Foto da equipe de suporte F5 (`SupportSection.astro`).
- 3 depoimentos reais autorizados → preencher `testimonials.items` em `siofi-main.copy.json` (a seção volta a aparecer automaticamente).
- Logos de clientes autorizados → preencher `trustBar.logos`.
- Dados validados para a TrustBar (anos de mercado, nº de clientes, cidades).
- Resposta validada para "Como funciona a implantação?" e "Posso migrar dados?" → adicionar a `faq.items` em `siofi-main.copy.json` (entram automaticamente no accordion e no `FAQPage` schema).
- Lighthouse real, PageSpeed Insights, teste em dispositivos físicos e validação de tracking ponta a ponta (GTM Preview/GA4 DebugView/Meta Events Manager) assim que houver domínio e contas reais.

### Fora de escopo deste repositório (decisão de negócio, não técnica)
- Variantes de campanha (`/siofi/oficina-mecanica`, `/siofi/auto-center` etc.) — o template dinâmico (`[slug].astro`) e o schema de content collection já suportam adicionar uma variante só criando um novo JSON em `src/content/landing-pages`, sem duplicar componentes (§67).
- `qualified_lead` (integração CRM → GA4/Meta) — depende do CRM escolhido.
- CAPTCHA (Cloudflare Turnstile) — só introduzir se o rate limit + honeypot mostrarem volume de spam real após o lançamento (§19, decisão deliberada de não adicionar fricção preventivamente).
