# Prompt para Claude Code — Tarefa 1: Setup do Stack + Estrutura Base da LP SiOfi

> **Como usar este documento:** copie o conteúdo a partir da seção "PROMPT" abaixo e cole diretamente na sessão do Claude Code, dentro do repositório do projeto. Antes de colar, coloque os três documentos de especificação na pasta `/docs` do repositório (crie-a se não existir), com estes nomes exatos:
> - `/docs/siofi_landing_page_copy_claude_code.md`
> - `/docs/siofi-landing-visual-design-system.md`
> - `/docs/siofi-landing-technical-performance-seo-tracking.md`
>
> Este é o **Prompt 1 de uma sequência de 5**. Ele cobre apenas fundação (stack + estrutura + tokens + rotas). Os próximos prompts (implementação de seções com a copy real, tracking/GTM/GA4/Meta, backend do formulário/CRM, QA final de performance/acessibilidade) serão gerados depois que esta etapa for validada — não peça ao Claude Code para adiantá-los.

---

## PROMPT (cole a partir daqui)

Você vai atuar como **Front-End Architect** implementando a fundação técnica da landing page do **SiOfi**, sistema de gestão da F5 Software para oficinas mecânicas e auto centers. O projeto já passou pelas fases de pesquisa, copy e design — esta tarefa é **só infraestrutura e estrutura**, não conteúdo final nem integrações de tracking reais.

### 1. Leia primeiro, nesta ordem

1. `/docs/siofi-landing-technical-performance-seo-tracking.md` — especialmente §3 (Technology Stack), §4 (URL Architecture), §46–47 (Environment Architecture/Variables), §68 (Claude Code Implementation Map), §69 (Acceptance Criteria).
2. `/docs/siofi-landing-visual-design-system.md` — especialmente §4–9 (Color/Typography/Grid/Spacing/Radius/Shadows), §20 (Design Tokens), §30 (Claude Code Implementation Guidelines).
3. `/docs/siofi_landing_page_copy_claude_code.md` — especialmente §5 (Arquitetura da página), §28 (Variantes futuras), §29 (Regras de implementação).

Esses três documentos são a **fonte única de verdade** e são **imutáveis**. Não resuma, não reescreva e não "melhore" o conteúdo deles — apenas extraia os valores técnicos necessários para esta tarefa.

### 2. Objetivo desta tarefa

Configurar o projeto Astro do zero e montar o **esqueleto estrutural** da landing page: stack, dependências, pastas, rotas, content collections vazias/placeholder, design tokens e variáveis de ambiente — **sem** escrever a copy final dentro dos componentes de seção, **sem** implementar tracking real e **sem** implementar a lógica de backend do formulário. Ao final desta tarefa, `npm run build` deve gerar um site estático navegável, com todas as seções renderizando como placeholders estruturais fiéis ao layout do design system, prontos para receber conteúdo real na Tarefa 2.

### 3. Escopo — Incluir

- Inicializar o projeto Astro (`output: 'static'`), integração **Preact** (só para a ilha do formulário) e **adapter Cloudflare Pages**, conforme §3 da especificação técnica.
- Criar a estrutura de pastas **exatamente** como definida no Claude Code Implementation Map (§68 da especificação técnica) — reproduzida abaixo para referência rápida:

```
/src
  /components
    /layout        → Header.astro, Footer.astro, MobileDrawer.astro
    /sections      → Hero.astro, TrustBar.astro, PainSection.astro, ValueProposition.astro,
                      FeaturePillars.astro, WorkOrderSection.astro, FinancialSection.astro,
                      InventorySection.astro, BeforeAfterSection.astro, SegmentsSection.astro,
                      SwitchingSection.astro, SupportSection.astro, TestimonialsSection.astro,
                      FAQSection.astro, FinalCTA.astro
    /ui            → Button.astro, ProductFrame.astro, Callout.astro, Card.astro, Chip.astro,
                      Icon.astro (wrapper de sprite Lucide), WorkOrderTimeline.astro
    /form          → LeadForm.tsx (ilha Preact), FormField.tsx, ChoiceChips.tsx
    /global        → FloatingWhatsApp.astro, StickyMobileCTA.astro
  /content
    /landing-pages → siofi-main.json + config.ts (schema das variantes)
    /copy          → siofi-main.copy.json (placeholder nesta tarefa — ver §5 abaixo)
  /lib
    /analytics     → dataLayer.ts (stub tipado, sem envio real ainda)
    /tracking      → attribution.ts (stub, sem lógica real ainda)
    /validation    → leadSchema.ts (schema Zod, sem uso em API ainda)
  /pages
    /siofi
      index.astro
      obrigado.astro
      [slug].astro
    /api
      lead.ts       → stub que retorna 501 Not Implemented (implementação real é tarefa futura)
  /styles
    tokens.css
    global.css
  /schemas
    organization.json
    software-application.ts
    faq-page.ts
public/
  /fonts
  /assets/screens
  /assets/logo
  robots.txt
  _headers
  _redirects
```

- Criar `src/styles/tokens.css` como **espelho exato** dos tokens definidos no §20 do design system (cores, tipografia, espaçamento, radius, sombra — sem arredondar, aproximar ou "melhorar" nenhum valor).
- Configurar a escala tipográfica (Manrope + Inter) via `@font-face` self-hosted apontando para `/public/fonts` (os arquivos `.woff2` reais ainda não existem — deixe os `@font-face` referenciando os nomes de arquivo esperados e documente no README que faltam os arquivos, conforme checklist de assets do design system §29.1).
- Criar as rotas `/siofi` (index), `/siofi/obrigado` (com `<meta name="robots" content="noindex, follow">`) e o template dinâmico `/siofi/[slug]` para as variantes futuras (§4 da especificação técnica e §28 da copy: `oficina-mecanica`, `auto-center`, `ordem-de-servico`, `trocar-sistema`, `gestao-oficina`).
- Configurar Content Collections (`src/content/config.ts`) com o schema de uma página de landing (campos: slug, título/H1, meta title/description, indexável sim/não, canonical, seções incluídas e ordem) — populado só com a entrada de `/siofi` por enquanto; as variantes entram como tarefa futura.
- Cada componente em `/components/sections` deve renderizar a **estrutura de layout** (grid, espaçamento, hierarquia de heading, áreas de imagem) definida no wireframe desktop/mobile do design system (§23–24), preenchida com **placeholders visuais claramente marcados** (ex.: `[PLACEHOLDER — headline da seção X]`) — nunca com lorem ipsum genérico, para que fique óbvio o que falta preencher na Tarefa 2 e de onde vem cada texto.
- Criar `.env.example` listando **todas** as variáveis do §47 da especificação técnica, com comentário indicando se é pública (`PUBLIC_*`) ou secreta, e valor de exemplo `[TBD — FORNECER PELA F5]` onde não há valor real disponível.
- Criar `public/robots.txt` básico (bloqueando `/api/` e a variante ainda não aprovada, se já estiver mapeada) e esqueletos de `_headers`/`_redirects` no formato Cloudflare Pages, com os valores de produção marcados como `[TBD — DEFINIR DOMÍNIO CANÔNICO]` onde dependem de decisão de negócio (§4, §41, §45 da especificação técnica).
- Configurar `package.json` com as dependências corretas e scripts (`dev`, `build`, `preview`, `lint`), `tsconfig.json`, e um `README.md` documentando: como rodar o projeto, o que já existe, o que está pendente (fontes, imagens reais, domínio, IDs de tracking) e a lista dos próximos prompts da sequência.
- Inicializar o repositório Git (se ainda não existir) com um `.gitignore` adequado (Astro + Node + `.env`).

### 4. Escopo — NÃO incluir (fica para prompts futuros)

- **Não** escrever a copy final dentro dos componentes — texto vem de `/content/copy` na Tarefa 2, com o JSON extraído literalmente do documento de copy.
- **Não** implementar tracking real (GTM, GA4, Meta Pixel, CAPI, dataLayer com eventos reais) — isso é o Prompt 3. Os arquivos em `/lib/analytics` e `/lib/tracking` nesta tarefa são só stubs/esqueletos tipados.
- **Não** implementar a lógica real de `/api/lead.ts` (validação, rate limiting, honeypot, gravação em CRM, disparo de CAPI) — isso é o Prompt 4. Deixe o endpoint retornando `501 Not Implemented` de propósito.
- **Não** buscar, gerar ou tratar imagens reais de screenshots do produto, fotos ou o logo em SVG — esses assets ainda não foram fornecidos pela F5 (ver checklist §29.1 do design system). Use retângulos/placeholders com `alt` descritivo e dimensões corretas (`width`/`height`) para não quebrar CLS.
- **Não** tomar nenhuma decisão de negócio listada como `[TBD]` nos três documentos (domínio canônico, CRM escolhido, IDs de conta de tracking, valor monetário por lead) — apenas deixe o espaço estruturalmente pronto para recebê-la.
- **Não** rodar auditoria de Lighthouse/PageSpeed contra metas de produção ainda — isso faz sentido só depois que houver conteúdo e imagens reais (Prompt 5).

### 5. Sobre o placeholder de copy

Crie `src/content/copy/siofi-main.copy.json` com a **estrutura** de chaves espelhando as 16 seções da arquitetura de página (§5 da copy: Hero, Barra de confiança, Identificação da dor, Virada/proposta de valor, Pilares, Ordem de serviço, Financeiro, Estoque, Antes×Depois, Para quem é, Troca de sistema, Suporte, Prova social, FAQ, CTA final, Footer), com o valor de cada campo igual a `"[PENDENTE — Tarefa 2: copiar texto literal de siofi_landing_page_copy_claude_code.md, seção correspondente]"`. Isso garante que a Tarefa 2 só precise preencher valores, sem redesenhar a estrutura de dados.

### 6. Regras invioláveis

- Siga os valores de cor/tipografia/espaçamento do design system **literalmente** — se um valor parecer "estranho" ou você tiver uma ideia "melhor", **não altere**; sinalize como observação no README em vez de mudar silenciosamente.
- Nunca prefixe uma variável secreta (`META_CAPI_ACCESS_TOKEN`, `CRM_API_KEY`, etc.) com `PUBLIC_` nem a referencie fora de código server-side, mesmo em stub.
- Nunca invente um valor de negócio (domínio, ID de conta, telefone, e-mail) — use sempre o placeholder `[TBD — ...]` exatamente como aparece nos documentos-fonte.
- Não expanda o escopo desta tarefa para tracking, backend ou copy final, mesmo que pareça "rápido de fazer já" — registre como sugestão no README em vez de implementar.
- Se encontrar uma contradição entre os três documentos, **pare e reporte** a contradição em vez de escolher um dos lados silenciosamente.

### 7. Critérios de aceite (verificáveis)

```text
- [ ] `npm install` e `npm run build` completam sem erro
- [ ] `npm run dev` sobe o servidor local e `/siofi`, `/siofi/obrigado` renderizam sem erro 500
- [ ] Estrutura de pastas em `/src` e `/public` corresponde exatamente ao mapa da seção 3 acima
- [ ] `tokens.css` contém todos os tokens de cor/tipografia/espaçamento/radius/sombra do §20 do design system, sem divergência de valor
- [ ] Cada seção da página (§5 da copy) tem um componente Astro correspondente em `/components/sections`, renderizando placeholder estrutural fiel ao wireframe (não lorem ipsum genérico)
- [ ] `.env.example` lista todas as variáveis do §47, com marcação clara de pública/secreta
- [ ] `robots.txt`, `_headers` e `_redirects` existem com a estrutura correta (mesmo com valores `[TBD]` onde aplicável)
- [ ] `/api/lead` responde `501 Not Implemented` (endpoint existe, lógica não)
- [ ] `src/content/config.ts` define o schema de landing page e `/siofi` está registrado como entrada válida
- [ ] Nenhum segredo aparece em código versionado ou em variável `PUBLIC_*`
- [ ] README documenta como rodar o projeto, o que falta (assets reais, domínio, IDs) e a lista dos próximos prompts
- [ ] `git status` limpo após o commit inicial (nada de `node_modules`, `.env` real ou build artifacts versionados)
```

### 8. Checklist de validação a rodar antes de considerar pronto

1. `npm run build` — build estático completo sem erros/warnings críticos.
2. `npm run preview` (ou equivalente) — navegar manualmente por `/siofi`, `/siofi/obrigado` e `/siofi/qualquer-slug-de-teste` (para validar que o template dinâmico não quebra mesmo sem variantes reais cadastradas).
3. Inspecionar visualmente que a ordem e a hierarquia de heading (`h1` único por página, `h2`/`h3` nas seções) seguem §8 (Semantic HTML & Headings) da especificação técnica.
4. Conferir no DevTools que nenhum placeholder de imagem gera *layout shift* (todas têm `width`/`height` ou `aspect-ratio` definidos).
5. Rodar `git diff --stat` e confirmar que nada fora do escopo desta tarefa foi tocado.

---

Ao concluir, apresente um resumo do que foi criado, a lista de arquivos/pastas gerados, e uma lista explícita de tudo que ficou marcado como `[TBD]` ou pendente — isso vira o ponto de partida do Prompt 2.
