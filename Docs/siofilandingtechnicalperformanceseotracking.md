# SiOfi Landing Page — Technical Performance, SEO & Tracking Specification

**Versão:** 1.0 · **Data:** 25/08/2026 · **Uso:** especificação técnica executável para implementação pelo Claude Code · **Depende de:** `siofi_landing_page_copy_claude_code.md` (copy — imutável) e `siofi-landing-visual-design-system.md` (design system — imutável). Este documento **não** redefine copy nem visual; define como construir, medir e escalar tecnicamente.

**Convenção usada em todo o documento:** `MUST` = obrigatório para o lançamento · `SHOULD` = fortemente recomendado, pode ficar para v1.1 se houver restrição de prazo · `OPTIONAL` = nice-to-have, não bloqueia lançamento. Todo dado que dependa de decisão de negócio ainda não tomada aparece como `[TBD — DECISÃO NECESSÁRIA]`.

---

## 1. Executive Summary

A landing page do SiOfi (`/siofi`) é uma página de marketing de conversão único (lead → demonstração), com necessidade de: indexação orgânica forte (é destino de tráfego de busca e SEO de conteúdo), Core Web Vitals no verde em mobile (maioria do tráfego virá de Meta Ads mobile), e uma cadeia de atribuição confiável ponta a ponta (UTMs → click IDs → formulário → CRM → GA4/Google Ads/Meta CAPI) sem depender de um único evento client-side não confirmado.

**Decisões centrais deste documento:**

1. **Stack:** Astro (SSG) com uma única ilha interativa (o formulário) — não uma SPA React/Next full client-side. Justificativa em §3.
2. **Conversão é confirmada no servidor.** O evento `lead_submitted` só dispara para GA4/Ads/Meta depois que a API responde 2xx e persiste o lead — nunca no `onClick` do botão.
3. **Meta usa Pixel + CAPI com o mesmo `event_id`**, deduplicados por design (§29). Google Ads usa Enhanced Conversions com dado hasheado no servidor.
4. **UTMs e click IDs persistem em cookie de primeira parte por 90 dias** (não em `localStorage` puro, que se perde com Intelligent Tracking Prevention no Safari) e viajam com o payload do formulário até o CRM.
5. **Nenhum PII (nome, telefone, e-mail) é enviado ao dataLayer/GA4.** PII vai apenas para CRM e para o payload hasheado do CAPI/Enhanced Conversions, nunca em texto plano para camadas de analytics.
6. **Página de obrigado dedicada (`/siofi/obrigado`)**, não modal inline — necessária para conversão limpa do Google Ads (URL de destino de conversão) e para permitir teste de redirecionamento sem reprocessar o evento em reload.
7. **Metas:** LCP < 2,0s (mais agressivo que o piso de 2,5s — justificado em §10), INP < 200ms, CLS < 0,05, Lighthouse mobile Performance ≥ 90.
8. **Arquitetura escalável desde o dia 1** para as variantes previstas na copy (`/siofi/oficina-mecanica`, `/siofi/auto-center`, `/siofi/ordem-de-servico`, `/siofi/trocar-sistema`, `/siofi/gestao-oficina`) via content collections + config por página, sem duplicar componentes.

---

## 2. Recommended Architecture

```
Usuário (Google/Meta Ads, orgânico, direto, WhatsApp)
        │
        ▼
Astro SSG (HTML pré-renderizado, CDN edge) ── assets estáticos (CSS/JS/imagens) via CDN
        │
        ▼
Ilha LeadForm (Preact, hidratação parcial, ~8–12 KB)
        │  POST /api/lead
        ▼
Edge/Serverless Function (Cloudflare Worker ou Vercel Function)
   ├─ valida + sanitiza
   ├─ rate limit + honeypot
   ├─ grava lead (CRM/planilha/webhook) com lead_id
   ├─ dispara Meta CAPI (server→server)
   └─ retorna { ok: true, lead_id }
        │
        ▼
Cliente recebe 2xx → dispara dataLayer (lead_submitted) → GTM → GA4 + Google Ads (Enhanced Conversions) + Meta Pixel (mesmo event_id do CAPI)
        │
        ▼
Redirect para /siofi/obrigado (conversão confirmada, sem PII na URL)
```

**Por que este desenho:** separa "o usuário clicou" de "o lead foi realmente registrado" — a métrica de conversão que alimenta Google/Meta só é populada quando há garantia de que o dado chegou ao destino de negócio (CRM). Isso evita o erro mais comum em landing pages de geração de leads: contar como conversão um clique que gerou erro 500 no backend.

---

## 3. Technology Stack

### Stack recomendado
**Astro (modo `output: 'static'`/SSG) + uma ilha Preact para o formulário + Cloudflare Pages (hosting + Pages Functions para `/api/lead` e `/api/capi`).**

### Por quê
- A página é, em essência, **conteúdo estático com um formulário** — não há personalização por usuário autenticado, não há dashboard, não há dado que mude por requisição. SSG entrega HTML completo no primeiro byte, sem esperar hidratação para o conteúdo ser indexável ou visível (resolve LCP e SEO ao mesmo tempo).
- Astro por padrão **envia zero JavaScript de framework** para componentes que não precisam de interatividade (hero, pilares, FAQ estático em HTML/CSS puro com `<details>`, cards) — só a ilha do formulário (e pequenos scripts vanilla para drawer/timeline/accordion) hidrata.
- **Content Collections do Astro** mapeiam 1:1 com a necessidade de §66/67 (variantes de campanha): cada página de campanha é um arquivo de config (frontmatter) reaproveitando os mesmos componentes.
- **Cloudflare Pages/Functions**: edge global (baixa latência no Brasil via PoPs locais), Functions rodam no edge para `/api/lead`, `/api/capi`; free/baixo custo; headers de segurança e cache configuráveis via `_headers`/`_redirects` nativamente (§40–42).

### Alternativa viável
**Next.js 14+ (App Router) com rotas estáticas (`export const dynamic = 'force-static'`) para a landing e Route Handlers para `/api/lead`, hospedado na Vercel.** Faz sentido se a F5 já mantém outro produto em Next/React e quer reaproveitar componentes/design system entre times, ou se previsão é de crescer para páginas com personalização server-side (ex.: geolocalização, testes A/B server-side) além do escopo atual. Vercel resolve edge functions, cache e headers de forma equivalente ao Cloudflare.

### O que evitar
- **SPA client-side pura** (Create React App, Vite+React sem SSR/SSG): força o HTML crítico a depender de JS executado no navegador — prejudica LCP, FCP e indexação (mesmo com Googlebot renderizando JS, é mais lento e frágil para conteúdo que precisa ranquear).
- **WordPress + page builder (Elementor/Divi) ou Webflow como solução final:** viável para landing simples, mas dificulta controle fino de CWV (plugins injetam JS/CSS não otimizado), controle de headers de segurança e a arquitetura de tracking server-side (CAPI, dedup) exigida aqui. Só considerar se a equipe não tiver capacidade de manter código e aceitar controle de tracking mais limitado — **não recomendado para este projeto**.
- **Gatsby**: overhead de build/GraphQL desnecessário para o escopo (uma página + poucas variantes); Astro entrega o mesmo resultado com menos complexidade.
- Qualquer stack que force **hidratação total da página** para exibir conteúdo textual (hero, pilares, FAQ) — o texto e os headings precisam estar no HTML inicial independentemente de JS.

---

## 4. URL Architecture

| URL | Função | Indexável |
|---|---|---|
| `/siofi` | Página principal (canonical raiz do produto) | Sim |
| `/siofi/oficina-mecanica` | Variante Google Ads — sistema/software/programa | Sim (própria, não duplicada — copy adaptada por segmento) |
| `/siofi/auto-center` | Variante Google Ads — auto center | Sim |
| `/siofi/ordem-de-servico` | Variante Google Ads/SEO — OS | Sim |
| `/siofi/trocar-sistema` | Variante campanha — troca de sistema | Sim |
| `/siofi/gestao-oficina` | Variante Meta Ads — dor/lucro | `noindex` inicialmente (ver nota abaixo) |
| `/siofi/obrigado` | Página de conversão | **Não** (`noindex`) |

**Regra MUST:** `/siofi` é a versão canônica do produto. As variantes de campanha (`/siofi/oficina-mecanica`, `/siofi/auto-center`, `/siofi/ordem-de-servico`, `/siofi/trocar-sistema`) só são criadas quando tiverem **copy substancialmente diferente** (headline, ordem de seções, prova social direcionada) — nunca a mesma página com querystring trocando um texto. Se a variante reaproveitar > 80% do conteúdo de `/siofi` sem diferenciação real de intenção de busca, ela deve usar `rel="canonical"` apontando para `/siofi` e ficar fora do sitemap (é página só para mídia paga, não para SEO).

**`/siofi/gestao-oficina`** (Meta Ads, dor/lucro): como a copy indica "usar apenas depois de validar o tom", ela nasce com `noindex, follow` até aprovação de SEO — evita indexar uma página que pode mudar de headline nos primeiros testes.

### Slugs
`kebab-case`, sem acentos, sem stopwords desnecessárias, em português (`oficina-mecanica`, não `oficina_mecanica` nem `oficinaMecanica`).

### Canonical
Todas as páginas têm `<link rel="canonical">` self-referencing por padrão. Exceção: variantes 100%-reaproveitadas apontam para `/siofi`.

### Trailing slash
**Sem trailing slash** (`/siofi`, não `/siofi/`). Configurar redirect 301 permanente de `/siofi/` → `/siofi` (evita conteúdo duplicado por variação de URL). Consistente em todo o site.

### Redirects
- `www.siofi.com.br` (ou domínio real) → domínio canônico não-www (ou vice-versa, conforme decisão de negócio `[TBD — DEFINIR DOMÍNIO CANÔNICO]`), 301 permanente, aplicado no nível de DNS/CDN, não em JS.
- HTTP → HTTPS, 301, sempre.
- `/oficina` `/auto-center` (sem `/siofi`) → 301 para as URLs corretas com `/siofi/...`, caso anúncios antigos apontem para variações.

### Parâmetros e query strings
**MUST:** nenhum parâmetro de UTM, click ID ou campanha gera conteúdo diferente indexável nem cria URL canônica distinta. `?utm_source=meta&utm_campaign=...` sempre canonicaliza para a URL base (`/siofi`), via `<link rel="canonical" href="https://.../siofi">` fixo (sem querystring). Google Search Console não deve nunca reportar `/siofi?utm_source=...` como página separada.

**Query strings toleradas sem afetar SEO:** `?ctx=troca` (pré-seleciona chip do formulário, definido no design system) — também canonicaliza para `/siofi`.

---

## 5. Indexation Strategy

### O que deve ser indexado
`/siofi`, `/siofi/oficina-mecanica`, `/siofi/auto-center`, `/siofi/ordem-de-servico`, `/siofi/trocar-sistema` (após revisão de conteúdo único por página).

### O que NÃO deve ser indexado
- `/siofi/obrigado` — `<meta name="robots" content="noindex, follow">`.
- `/siofi/gestao-oficina` — `noindex, follow` até validação (§4).
- Qualquer URL com querystring (`?utm_*`, `?gclid`, `?fbclid`, `?ctx=*`) — resolvido via canonical fixo, reforçado com `noindex` **não** é necessário aqui (canonical já resolve); **MUST**: nunca usar `noindex` na própria `/siofi` por causa de parâmetro — o robots meta da página é sempre `index, follow` independente da querystring.
- Ambiente de staging inteiro — `noindex` global + `X-Robots-Tag: noindex` no header HTTP (dupla proteção) + `robots.txt` bloqueando tudo em staging (§68).
- Páginas de erro (`404`, `500`).

### Canonical tags
Self-referencing em produção; apontando para `/siofi` nas variantes-espelho (§4); **nunca** apontando para staging.

### Robots meta
Produção: `index, follow` (padrão, omitir a tag equivale a isso, mas **MUST declarar explicitamente** para clareza e para facilitar override por página): `<meta name="robots" content="index, follow">`.
`/obrigado` e páginas não prontas: `<meta name="robots" content="noindex, follow">` (follow para não bloquear rastreamento de links internos, ex. footer).

### robots.txt
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /siofi/obrigado

Sitemap: https://[dominio]/sitemap.xml
```
Em staging, `robots.txt` é substituído por:
```
User-agent: *
Disallow: /
```

### sitemap.xml
Gerado no build (Astro tem integração `@astrojs/sitemap`) contendo apenas as URLs indexáveis de §5.1, com `lastmod` real (data do último deploy/commit da página), sem `priority`/`changefreq` arbitrários (o Google os ignora — não gastar tempo neles). **MUST** excluir `/siofi/obrigado` e páginas `noindex` explicitamente via `filter` na config do sitemap.

### Google Search Console
Propriedade de domínio (DNS, não apenas prefixo de URL) `[TBD — VERIFICAR DOMÍNIO]`. Submeter sitemap manualmente após o primeiro deploy. Ativar alertas de cobertura e Core Web Vitals.

### Bing Webmaster Tools
`SHOULD` — importar via verificação do GSC (Bing permite import direto), custo de esforço quase zero e amplia alcance orgânico (Bing/Copilot usa esse índice).

### Páginas de confirmação, campanha e duplicadas
Regras já cobertas acima — resumo: obrigado = noindex; campanha-espelho = canonical para raiz; nenhuma URL com parâmetro é tratada como página distinta.

---

## 6. Technical SEO

Checklist técnico consolidado (detalhes de cada item nas seções correspondentes):

- [ ] `<title>` único por página, dentro do limite de §7 — **MUST**
- [ ] `<meta name="description">` único por página — **MUST**
- [ ] `<link rel="canonical">` em todas as páginas — **MUST**
- [ ] `<meta name="robots">` explícito em todas as páginas — **MUST**
- [ ] Open Graph completo (`og:title`, `og:description`, `og:image`, `og:url`, `og:type=website`, `og:locale=pt_BR`) — **MUST**
- [ ] Twitter Card (`summary_large_image`) reaproveitando a imagem OG — **SHOULD**
- [ ] Favicon set completo (16, 32, 180 apple-touch, 512) — **MUST**
- [ ] `manifest.webmanifest` — **OPTIONAL** (só relevante se houver intenção de "adicionar à tela inicial"; não é PWA, então baixa prioridade — incluir versão mínima não custa nada)
- [ ] Schema.org conforme §9 — **MUST** (Organization, SoftwareApplication, FAQPage) / **SHOULD** (BreadcrumbList só se houver breadcrumb visual)
- [ ] HTML semântico (`<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`) — **MUST**
- [ ] Um único H1, hierarquia de headings sem pular níveis — **MUST**
- [ ] `alt` descritivo em 100% das imagens (decorativas com `alt=""`) — **MUST**
- [ ] Breadcrumb visual — **OPTIONAL** (página única de conversão, não há hierarquia de navegação a expor; se implementado, usar BreadcrumbList schema)
- [ ] Links internos entre variantes de campanha e para `/siofi` no footer — **SHOULD**
- [ ] Links externos (nenhum previsto na copy) — se existirem futuramente, `rel="noopener"` sempre; `rel="nofollow sponsored"` se forem parceiros pagos
- [ ] `sitemap.xml` válido e submetido — **MUST**
- [ ] `robots.txt` válido — **MUST**
- [ ] Idioma declarado `<html lang="pt-BR">` — **MUST**
- [ ] URL canônica sempre HTTPS, sem `www`/`non-www` inconsistente — **MUST**

---

## 7. Metadata

### Title
Padrão: `{Benefício/Intenção principal} | {Marca}` — máx. **60 caracteres** (limite prático de exibição no Google; acima disso trunca).

Página principal (usar a copy já aprovada, §23 da copy):
```
Sistema para Oficina Mecânica e Auto Center | SiOfi
```
(52 caracteres — dentro do limite.)

Variantes: `[TBD — VALIDAR COM SEO/COPY]` — cada variante deve ter title distinto refletindo a intenção de busca do grupo de anúncios correspondente (ex.: `/siofi/ordem-de-servico` → algo como "Sistema de Ordem de Serviço para Oficina | SiOfi" — **não finalizar sem validação**, pois a copy fornecida cobre só a página principal).

### Description
Padrão: benefício + público + CTA implícito, **120–155 caracteres** (Google trunca por volta de 155–160 no desktop, menos no mobile — mirar 150 para segurança).

Página principal (copy §23):
```
Gerencie ordens de serviço, financeiro, estoque, clientes e resultados da sua oficina ou auto center com o SiOfi. Agende uma demonstração.
```
(140 caracteres — dentro do limite.)

Variantes: `[TBD — VALIDAR COM SEO/COPY]`.

### Regras gerais
- Nunca duplicar title/description entre páginas indexáveis.
- Não fazer keyword stuffing (a copy já instrui isso — reforçado aqui: cada termo-alvo aparece no máximo 1x no title e 1x na description).
- Title e description não são reescritos automaticamente por template — cada página tem os seus, versionados junto com o conteúdo (`content/pages/*.md` frontmatter, ver §8/§67).

---

## 8. Semantic HTML & Headings

**MUST:** exatamente um `<h1>` por página, correspondendo à headline do hero. Nenhum outro elemento usa `<h1>`, mesmo que visualmente maior (tamanho é resolvido por CSS/classe, nunca por tag heading incorreta).

Árvore de headings da página principal (mapeada 1:1 à copy — ver design system §22 para correspondência de componente):

```
H1: Sua oficina trabalha muito. Mas você sabe quanto realmente sobra?
 ├── H2: Sua oficina cresceu. A gestão acompanhou?              (Dores)
 │     └── (H3 dentro dos 4 PainCards seria over-marking — usar <strong>/<p> nos cards, não H3;
 │          o título do card é visualmente H3 no design system mas semanticamente pode ficar como
 │          <p class="card-title"> se não houver subestrutura própria — ver nota abaixo)
 ├── H2: Mais do que informatizar a oficina. É ter controle do negócio.  (Virada)
 ├── H2: O que você precisa acompanhar, em um só lugar             (Pilares)
 │     ├── H3: Acompanhe cada serviço                              (Pilar 1 — Oficina)
 │     ├── H3: Saiba o que entra, o que sai e o que precisa receber (Pilar 2 — Financeiro)
 │     ├── H3: Enxergue os resultados da empresa                   (Pilar 3 — Gestão)
 │     ├── H3: Estoque integrado à operação                        (Pilar 4 — Estoque)
 │     ├── H3: Compre com mais informação                          (Pilar 5 — Compras)
 │     └── H3: Emissão fiscal integrada à rotina                   (Pilar 6 — Fiscal)
 ├── H2: Do orçamento à entrega, acompanhe cada serviço            (Ordem de Serviço)
 ├── H2: Sua oficina está cheia. Mas ela está dando resultado?     (Financeiro)
 ├── H2: Saiba o que entra, o que sai e o que precisa comprar      (Estoque e Compras)
 ├── H2: Quando as informações se conectam, administrar fica mais simples (Antes×Depois)
 ├── H2: Feito para quem vive a rotina do setor automotivo         (Para quem é)
 │     └── H3 × 5 (Oficinas mecânicas / Auto centers / Centros automotivos / Autoelétricas / Funilarias)
 ├── H2: Já usa outro sistema?                                     (Troca de sistema)
 ├── H2: Quando você precisa de ajuda, precisa falar com quem entende o sistema (Suporte)
 ├── H2: Quem usa o SiOfi na rotina                                (Prova social)
 │     └── H3 × N (nome de cada depoimento — opcional, avaliar se cliente ou nome do card)
 ├── H2: Dúvidas frequentes                                        (FAQ)
 │     └── H3 × 7 (cada pergunta é H3 dentro do accordion — semântica correta para `<details><summary>`)
 └── H2: Veja como o SiOfi pode funcionar na sua oficina           (CTA final)
```

**Regra de decisão MUST:** headings dos `PainCard` (Dores) e `SegmentCard` (Para quem é) — os das Dores ficam como texto forte (`<p><strong>`) porque são só 4 rótulos curtos sem hierarquia de conteúdo abaixo; os de "Para quem é" viram `<h3>` porque cada segmento é semanticamente um subtópico do H2 "Feito para quem vive a rotina do setor automotivo" com texto próprio. FAQ usa `<h3>` dentro de `<details>` porque cada pergunta é, de fato, um subtópico pesquisável (boa prática para snippets do Google).

**Nunca:** usar heading apenas para efeito visual (ex.: transformar um label de badge/eyebrow em H4 só porque "parece um título"). Eyebrows são `<p class="eyebrow">`.

---

## 9. Structured Data

Todos os schemas em JSON-LD, injetados no `<head>` (não em microdata inline — mais fácil de manter e validar).

### 9.1 `Organization` — MUST (site-wide, injetado no layout base)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "F5 Software de Gestão",
  "url": "https://[dominio]/",
  "logo": "https://[dominio]/assets/logo/siofi-logo-square.png",
  "sameAs": [
    "[TBD — URL Instagram]",
    "[TBD — URL Facebook]",
    "[TBD — URL LinkedIn]"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "[TBD — TELEFONE F5]",
    "contactType": "sales",
    "areaServed": "BR",
    "availableLanguage": "Portuguese"
  }
}
```
Propriedades obrigatórias: `name`, `url`. Recomendadas: `logo`, `sameAs`, `contactPoint`. Dados pendentes: telefone e redes sociais reais `[TBD]`.

### 9.2 `SoftwareApplication` — MUST (só na página `/siofi`)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SiOfi",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Windows",
  "description": "Sistema de gestão para oficinas mecânicas, auto centers, autoelétricas e funilarias: ordem de serviço, financeiro, estoque, compras e fiscal.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "BRL",
    "price": "[TBD — PREÇO NÃO DIVULGADO PUBLICAMENTE / OMITIR CAMPO SE NÃO HOUVER PREÇO PÚBLICO]"
  },
  "publisher": {
    "@type": "Organization",
    "name": "F5 Software de Gestão"
  }
}
```
**Atenção MUST:** se não houver preço público (a copy não define preço em nenhuma seção), **omitir o bloco `offers` inteiro** — não inventar valor nem usar `"price": "0"` (isso é falso e pode gerar penalização por dado estruturado enganoso). `applicationCategory` e `operatingSystem` são obrigatórios pela spec do Google para este tipo; `operatingSystem: "Windows"` reflete o produto real (desktop) — **confirmar com F5** `[TBD]` se houver também versão web/nuvem.

### 9.3 `FAQPage` — MUST, condicionado a política vigente
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Para quais empresas o SiOfi é indicado?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O SiOfi foi desenvolvido para empresas do setor automotivo, como oficinas mecânicas, auto centers, autoelétricas, funilarias e centros automotivos."
      }
    }
    // ... repetir para as 7 perguntas com resposta validada da copy;
    // as 2 perguntas marcadas TODO F5 na copy (implantação, migração)
    // NÃO entram no schema até terem resposta aprovada.
  ]
}
```
**Nota crítica de política (2023+):** o Google restringiu o rich result de FAQ na busca a domínios de governo/saúde reconhecidos oficialmente — para a maioria dos sites comerciais o snippet visual pode não aparecer. **Ainda assim, MUST manter o `FAQPage` schema**: (1) alimenta AI Overviews e outros motores/LLMs que continuam consumindo dados estruturados independentemente do rich snippet clássico; (2) é semanticamente correto e não penaliza. Não prometer ao cliente que o rich snippet vai aparecer — deixar claro que é preparação estrutural, não garantia visual.

### 9.4 `WebPage` — SHOULD (por página, complementa Organization/SoftwareApplication)
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Sistema para Oficina Mecânica e Auto Center | SiOfi",
  "url": "https://[dominio]/siofi",
  "inLanguage": "pt-BR",
  "isPartOf": { "@type": "WebSite", "name": "SiOfi", "url": "https://[dominio]/" }
}
```

### 9.5 `BreadcrumbList` — OPTIONAL
Só implementar se houver breadcrumb visual real (não previsto no design system atual — página única de conversão). Não adicionar schema de algo que não existe na UI (dado estruturado deve refletir o que é renderizado).

### 9.6 `Product` — NÃO USAR
`Product` schema é para itens com preço/avaliação/disponibilidade de e-commerce — aplicá-lo a um software B2B sem preço público e sem rating agregado real seria um schema incorreto (e arriscaria manual action por dado estruturado enganoso caso reviews sejam inventados). Usar `SoftwareApplication` (§9.2), que é o tipo correto para este caso.

---

## 10. Core Web Vitals

| Métrica | Meta deste projeto | Piso "aprovado" do Google | Justificativa da meta mais agressiva |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | **< 2,0s** (mobile 4G simulado) | < 2,5s | O elemento LCP é o H1 do hero (texto, não imagem — ver decisão abaixo), que não depende de download de imagem grande; manter a meta apertada dá margem para o screenshot do hero, que carrega em paralelo, não atrasar a percepção de "página pronta". |
| **INP** (Interaction to Next Paint) | **< 150ms** | < 200ms | Página com poucas interações JS pesadas (accordion, drawer, form); INP baixo é alcançável com JS mínimo e sem hidratação desnecessária. |
| **CLS** (Cumulative Layout Shift) | **< 0,05** | < 0,1 | Todas as imagens com `width`/`height` (ou `aspect-ratio`), fontes com fallback métrico ajustado, sem inserção de conteúdo (banners, cookie banner) que empurre layout após o primeiro paint. |
| TTFB | < 600ms | < 800ms (bom) | SSG servido por CDN edge — deve ficar bem abaixo disso na prática (< 200ms típico). |
| FCP | < 1,5s | < 1,8s | Decorre naturalmente de HTML estático + CSS crítico inline. |
| Speed Index | < 2,5s | — | Medido em lab (Lighthouse); acompanhar como diagnóstico, não como meta isolada. |
| Total Blocking Time | < 150ms | < 200ms (bom) | JS total < 70KB gz (§11) e nenhum script síncrono bloqueante no `<head>`. |

**Decisão MUST sobre o elemento LCP:** no hero, o **H1 (texto) é o candidato a LCP**, não o screenshot do dashboard — porque o H1 renderiza no primeiro paint via HTML+CSS crítico sem esperar rede de imagem, enquanto o screenshot, mesmo otimizado, é sempre um recurso de rede adicional. Isso é obtido garantindo que: (a) o H1 não fica atrás de nenhuma fonte web-block (usar `font-display: swap` + fallback com métricas ajustadas, §15); (b) o screenshot do hero usa `fetchpriority="high"` e é servido em tamanho comprimido (§13) para, mesmo que o LCP tools escolha a imagem em alguma medição de viewport largo, ela ainda cumprir a meta.

**O que fazer tecnicamente para atingir essas metas:**
1. Zero render-blocking JS no `<head>` — todo script de terceiros (GTM) carrega via `<script defer>` ou injetado após `load`/interação, nunca síncrono acima da dobra.
2. CSS crítico do hero inline (`<style>` no `<head>`, gerado automaticamente pelo build do Astro ou por ferramenta de critical CSS); restante do CSS via `<link rel="stylesheet">` normal (Astro já faz code-splitting de CSS por página).
3. Fontes: 2 famílias, subset latin, `font-display: swap`, `size-adjust`/`ascent-override` calculados para o fallback (`Arial`) reduzir o salto de layout ao trocar da fonte de sistema para Manrope/Inter (ferramenta: `next/font` não se aplica ao Astro — usar `@fontsource` com CSS `@font-face` manual + `unicode-range`, ou o gerador de fallback do `capsize`/`fontaine`).
4. Imagens do hero e above-the-fold: `fetchpriority="high"`, sem `loading="lazy"`; todas as demais: `loading="lazy"` + `decoding="async"`.
5. Nenhum layout shift por anúncio/consentimento: o banner de cookies (§37) reserva espaço fixo (`min-height`) ou aparece como camada sobreposta (`position: fixed`) que não empurra o conteúdo.
6. `<link rel="preconnect">` para `fonts.googleapis.com`, `fonts.gstatic.com`, e para o domínio do GTM (`www.googletagmanager.com`) — reduz latência de handshake sem bloquear o parser.
7. Nenhuma dependência de hidratação para exibir texto: hero, pilares, FAQ, footer são HTML puro; só o formulário hidrata (ilha isolada, carregada com `client:idle` ou `client:visible` no Astro — nunca `client:load` no topo da página, pois o form está no fim).

---

## 11. Performance Budget

| Recurso | Budget (gzip/brotli, produção) |
|---|---:|
| HTML (por página, inicial) | ≤ 35 KB |
| CSS total | ≤ 40 KB |
| CSS crítico inline (hero) | ≤ 8 KB |
| JS inicial (parse+exec até interativo) | ≤ 70 KB |
| JS da ilha do formulário (Preact + lógica) | ≤ 35 KB |
| JS de tracking (GTM container + snippets custom, carregados após load) | ≤ 45 KB (não conta no orçamento "inicial", carrega deferred) |
| Fontes (2 famílias, pesos usados, subset latin, WOFF2) | ≤ 60 KB total |
| Hero screenshot (AVIF, @2x incluído no srcset) | ≤ 120 KB (arquivo servido no viewport do usuário, não a soma do srcset) |
| Demais screenshots (cada um) | ≤ 100 KB |
| Ícones (sprite SVG Lucide, subset usado) | ≤ 6 KB |
| **Total acima da dobra (HTML+CSS crítico+JS crítico+hero image)** | **≤ 250 KB** |
| **Total da página (todos os recursos, primeira visita)** | **≤ 900 KB** (excluindo GTM/pixels de terceiros, que não são controláveis diretamente, mas devem ficar < 150 KB combinados) |
| Total de requisições HTTP (primeira dobra) | ≤ 20 |

Estes números são **verificados no CI** (§49) a cada deploy — build falha (ou gera aviso bloqueante) se o budget estourar (`bundlesize` ou checagem equivalente no pipeline).

---

## 12. JavaScript Strategy

### JS necessário (MUST)
- Ilha do formulário (validação, máscara de telefone, campo condicional, submit, feedback) — Preact, hidratação `client:visible` (só carrega quando a seção entra perto do viewport, já que fica no fim da página).
- Header: toggle do drawer mobile, classe `is-scrolled` no scroll — vanilla JS, ~1 KB, carregado inline ou em módulo pequeno com `defer`.
- FAQ accordion — **preferir `<details>/<summary>` nativo do HTML** (zero JS) em vez de componente JS; o design system pede comportamento de accordion simples, que `<details>` cobre nativamente, inclusive acessibilidade de teclado e leitor de tela.
- IntersectionObserver para animações `.reveal` (fade-up) e para mostrar/esconder o sticky CTA mobile — vanilla JS, um único observer reaproveitado (~1 KB).
- Consent Mode + GTM loader (§37/§24) — snippet mínimo no `<head>` (síncrono, mas ínfimo: só define `dataLayer` e `gtag` stubs, não carrega o container ainda).

### JS opcional (SHOULD)
- Crossfade de screenshot ao interagir com FeatureCards (mencionado como não-v1 no design system) — não implementar agora.
- Smooth scroll customizado — usar `scroll-behavior: smooth` via CSS (zero JS) respeitando `prefers-reduced-motion` via media query CSS, não JS.

### Scripts third-party
| Script | Estratégia de carregamento |
|---|---|
| GTM container | `<script>` assíncrono, injetado logo após `DOMContentLoaded` (não no `<head>` de forma síncrona); ou via `defer` no head — nunca bloqueante. Consent Mode stub carrega antes (síncrono, mas é só JS inline de poucas linhas, não uma requisição de rede). |
| Meta Pixel (via GTM) | Carregado pela tag do GTM, disparado só após consentimento de `ad_storage` (§37). |
| Google Ads / gtag (via GTM) | Idem. |

### Regras gerais
- **Nenhum script de terceiro roda antes do consentimento relevante** (ver Consent Mode, §37) — GTM carrega sempre (necessário para medir `page_view` anônimo e para o próprio Consent Mode funcionar), mas as tags de ads/analytics dentro dele respeitam o estado de consentimento.
- Code splitting: Astro já isola JS por ilha; não há bundle único monolítico.
- Nenhuma biblioteca de animação (GSAP, Framer Motion) para os efeitos simples definidos no design system (`fade-up` 320ms) — CSS transitions/animations resolvem sem JS extra.
- Hidratação parcial: **MUST** usar `client:visible` ou `client:idle` para a ilha do formulário — nunca `client:load` (isso hidrataria no carregamento inicial da página, competindo com o parse do hero por CPU/main thread, mesmo o form estando fora da viewport inicial).

---

## 13. Image Optimization

| Regra | Especificação |
|---|---|
| Formato primário | AVIF |
| Fallback | WebP (via `<picture>` com múltiplos `<source>`); JPEG como último fallback apenas se necessário para navegadores muito antigos (baixa prioridade — Safari/Chrome/Firefox atuais suportam AVIF/WebP) |
| `width`/`height` | **MUST** explícitos em todo `<img>`, correspondendo à proporção real (evita CLS mesmo antes do CSS carregar) |
| `srcset`/`sizes` | Gerado automaticamente pelo pipeline de imagem do Astro (`astro:assets` / `sharp`) — 3 larguras por imagem (ex.: 800/1200/1600 para screenshots 16:10) |
| `loading` | `lazy` em tudo, **exceto** o candidato a LCP do hero (`loading="eager"` ou omitido, que é o padrão do navegador para above-the-fold quando bem posicionado) |
| `fetchpriority` | `high` apenas na imagem do hero; ausente (padrão `auto`) nas demais |
| `decoding` | `async` em todas |
| Preload | `<link rel="preload" as="image" href="hero-dashboard.avif" fetchpriority="high">` no `<head>` **apenas** se o H1 não for o LCP na prática (medir; se o H1 texto já é o LCP, este preload é desnecessário e desperdiça banda — decidir com base em medição real, não por padrão) |

### Hero — atenção especial
- Imagem prioritária: o `ProductFrame` do dashboard (definido no design system, §15 do doc visual).
- Tamanho máximo do arquivo final servido: **120 KB** (AVIF, qualidade ajustada para manter texto da UI legível — priorizar nitidez do texto sobre tamanho mínimo absoluto, mas nunca acima de 150 KB).
- Proporção: 16:10 desktop, recorte 4:3 para mobile (arquivo **separado**, não a mesma imagem redimensionada via CSS — servir a versão já recortada via `<picture>` + media query `sizes`).
- Todas as demais imagens (OS, financeiro, estoque, fotos de suporte/prova social): `lazy`.

---

## 14. Screenshots do SiOfi

| Tela | Formato | Resolução de origem | Compressão alvo | Mobile | Alt (exemplo) | Filename | Loading |
|---|---|---|---|---|---|---|---|
| Dashboard/indicadores (hero) | AVIF + WebP fallback | Captura 2× (3200×2000 origem) | ≤ 120 KB | Recorte 4:3 dedicado (1600×1200) | "Tela de indicadores do SiOfi mostrando faturamento e resultado do período" | `siofi-dashboard-hero.avif` / `siofi-dashboard-hero-mobile.avif` | `eager` + `fetchpriority="high"` |
| Ordem de serviço | AVIF + WebP | 3200×2000 | ≤ 100 KB | Recorte 4:5 (1600×2000) | "Tela de ordem de serviço do SiOfi com cliente, veículo, peças e total" | `siofi-ordem-servico.avif` | `lazy` |
| Financeiro / DRE | AVIF + WebP | 3200×1800 | ≤ 100 KB | 16:9 mantido, largura reduzida | "Tela de DRE e resultados do período no SiOfi" | `siofi-financeiro-dre.avif` | `lazy` |
| Estoque / importação XML | AVIF + WebP | 3200×2000 | ≤ 100 KB | 16:10 mantido | "Tela de consulta de estoque e importação de XML no SiOfi" | `siofi-estoque.avif` | `lazy` |
| Fiscal (se usado em algum callout, não é seção própria) | AVIF + WebP | conforme necessário | ≤ 80 KB | — | "Tela de emissão de NF-e no SiOfi" | `siofi-fiscal-nfe.avif` | `lazy` |

**Todas** seguem: `width`/`height` fixos no HTML (mesmo com `srcset` responsivo, a proporção base evita CLS), `decoding="async"`, nomes de arquivo descritivos em kebab-case (bom para SEO de imagens/Google Images, baixo custo).

**Preload:** nenhum screenshot além do hero recebe preload — todos os demais estão abaixo da dobra e devem competir normalmente por banda depois do conteúdo crítico.

---

## 15. Font Optimization

| Regra | Especificação |
|---|---|
| Famílias | 2 — Manrope (display) + Inter (body/UI), conforme design system |
| Pesos carregados | Manrope: 700, 800 (2 arquivos) · Inter: 400, 500, 600 (3 arquivos) = **5 arquivos WOFF2 no total** |
| Hospedagem | **Self-hosted** (baixar de Google Fonts uma vez, servir do próprio domínio/CDN) — elimina o round-trip extra para `fonts.gstatic.com` e dá controle total de cache/preload; **alternativa aceitável (SHOULD evitar, mas viável):** Google Fonts CDN com `preconnect`, se a equipe preferir não gerenciar os arquivos |
| `font-display` | `swap` em todos os `@font-face` |
| Preload | `<link rel="preload" as="font" type="font/woff2" href="/fonts/manrope-800.woff2" crossorigin>` para o peso 800 (usado no H1, crítico para LCP) — **MUST**; demais pesos carregam via CSS normal, sem preload |
| Subset | Apenas `latin` (+ `latin-ext` se precisar de caracteres acentuados fora do básico — testar cobertura de "ç", "ã", "õ" no subset padrão `latin` do próprio Google Fonts, que já inclui esses caracteres) |
| Fallback stack | `"Manrope", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif` / `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif` (do design system) |
| Ajuste de fallback | Gerar métricas ajustadas do fallback (via ferramenta como `fontaine` ou cálculo manual de `ascent-override`/`descent-override`/`size-adjust`) para minimizar CLS na troca fonte-de-sistema → Manrope/Inter |
| Variável ou estática | **Estática** (WOFF2 por peso) — Manrope e Inter têm versões variáveis, mas como só usamos 2–3 pesos fixos por família, arquivos estáticos são menores no total do que baixar o range variável completo |

**Budget:** 5 arquivos × ~10–14 KB (subset latin, WOFF2) ≈ 55–60 KB total, dentro do orçamento de §11.

---

## 16. CSS Strategy

- **CSS puro com Design Tokens** (custom properties `:root`, já definidos integralmente no `siofi-landing-visual-design-system.md` §20) — **não introduzir Tailwind** neste projeto: o design system já é um conjunto fechado de tokens e componentes específicos; Tailwind adicionaria uma camada de tradução (utilitários → tokens) sem ganho real, e o risco listado no próprio design system ("nenhum valor visual arbitrário fora dos tokens") é mais fácil de auditar com CSS direto que referencia `var(--token)` do que com classes utilitárias que podem escapar do sistema.
- **CSS Modules** (arquivo `.module.css` por componente Astro/Preact) para escopar estilos sem colisão de nomes, mantendo os tokens globais importados de `tokens.css`.
- **Critical CSS:** o CSS do Hero (e do Header) é extraído e inlined no `<head>` via plugin de build (ex.: `astro-critters` ou script de build customizado com `critters`/`beasties`); o restante carrega via `<link rel="stylesheet">` padrão com `media="print" onload="this.media='all'"` **não é necessário** se o CSS não-crítico já for pequeno o suficiente (< 32 KB) para não bloquear significativamente — medir e decidir; se o tempo de bloqueio for perceptível, aplicar a técnica de "print trick" para CSS não-crítico.
- **Minificação:** automática no build (Astro/Vite já minifica CSS em produção) — **MUST** verificar que está ativo.
- **Purge/tree-shaking:** como não há framework de utilitários, não há classes não-usadas geradas em massa; ainda assim, **SHOULD** rodar um linter/analisador (ex. PurgeCSS em modo de auditoria, não obrigatório em build) para detectar seletores mortos manualmente escritos e removê-los.
- Nenhum CSS-in-JS em runtime (evitar overhead de execução JS para estilos que podem ser estáticos).

---

## 17. Responsive Architecture

Breakpoints (idênticos ao design system, reaproveitados aqui para consistência técnica):
```css
--bp-sm: 480px;   /* ajustes tipográficos apenas */
--bp-md: 768px;   /* tablet */
--bp-lg: 1024px;  /* laptop — splits lado a lado */
--bp-xl: 1280px;  /* desktop — container 1200 */
--bp-2xl: 1536px; /* wide — hero full-bleed até 1440 */
```

- **Fluid typography:** `clamp()` para toda a escala tipográfica (já especificado no design system §5.3/§20) — reduz o número de media queries necessárias só para ajustar tamanho de fonte.
- **Layout:** CSS Grid para as seções de grade (Pilares, Dores, Segmentos) e Flexbox para splits texto/imagem — sem framework de grid externo.
- **`min()`/`max()`/`clamp()`** usados para larguras de container e paddings fluidos entre breakpoints, reduzindo saltos abruptos.
- **Container queries:** **OPTIONAL** — avaliar uso apenas no `FeatureCard` (Pilares) e `TestimonialCard`, caso esses componentes sejam reaproveitados em contextos de largura variável nas páginas de campanha (ex.: card dentro de uma coluna mais estreita numa variante). Não é necessário para o layout atual, que é definido por breakpoint de página, não por contexto de componente — **não implementar na v1** a menos que uma variante futura exija.
- Testar visualmente em 375px, 390px, 768px, 1024px, 1280px, 1440px, 1920px (dispositivos reais de referência: iPhone SE 375px, iPhone 14 390px, iPad 768px/1024px, laptop 1366/1440, desktop 1920).

---

## 18. Mobile-First Requirements

Implementação escrita **mobile-first** no CSS (estilos base = mobile; `min-width` media queries adicionam/ajustam para telas maiores — nunca o inverso).

- [ ] CTA principal visível sem scroll em viewport de 375×667 (iPhone SE) — **MUST**, validado manualmente a cada deploy de hero
- [ ] Formulário com no máximo 7 campos, todos com altura ≥ 52px (definido no design system) — **MUST**
- [ ] Screenshots legíveis em largura de tela real (não apenas redimensionados — usar os recortes mobile dedicados de §14) — **MUST**
- [ ] Todos os botões e itens tocáveis ≥ 44×44px — **MUST**
- [ ] Sticky CTA inferior aparece após o hero e desaparece ao alcançar o formulário final (IntersectionObserver, já especificado no design system) — **MUST**
- [ ] Zero rolagem horizontal em qualquer viewport ≥ 320px — **MUST**, testado via `overflow-x: hidden` no `<body>` como rede de segurança + auditoria manual da causa raiz (nunca usar o `overflow: hidden` para mascarar um elemento que estoura a largura sem investigar)
- [ ] Navegação mobile via drawer simples (definido no design system), sem submenu aninhado
- [ ] Nenhum hover-only reproduzido como única forma de acessar informação (tudo que depende de `:hover` no desktop tem equivalente por toque/foco no mobile)

---

## 19. Lead Form Architecture

Campos (da copy, §20 — "CTA final + formulário"): Nome · Empresa · WhatsApp · Cidade/UF · Quantidade aproximada de pessoas na equipe · Já utiliza sistema de gestão? (Sim/Não) · Se sim, qual sistema (opcional).

**Avaliação de necessidade real de cada campo:**
| Campo | Necessário? | Por quê |
|---|---|---|
| Nome | Sim | Identificação mínima para contato humano |
| Empresa | Sim | Qualifica e identifica o negócio antes da demo |
| WhatsApp | Sim | Canal de contato principal do setor (evidenciado na pesquisa de público) |
| Cidade/UF | Sim | Qualificação geográfica e priorização comercial (ex.: proximidade com Jaboticabal) |
| Pessoas na equipe | Sim | Proxy de porte/complexidade — ajuda a priorizar leads de maior fit (auto center vs. oficina pequena) |
| Já utiliza sistema? | Sim | Direciona a demonstração (script comercial diferente para troca de sistema) |
| Qual sistema (condicional) | Opcional, mas mantido | Só aparece se "Sim" — não adiciona fricção para quem responde "Não" |
| E-mail | **Não solicitado** pela copy | Não adicionar campo que a copy não pediu — WhatsApp já é o canal definido |

Nenhum campo deve ser adicionado além dos definidos pela copy sem validação de negócio.

### Client-side validation (MUST)
- HTML5 nativo (`required`, `type`, `pattern`) como primeira camada.
- JS complementar para: máscara de WhatsApp (formato BR, aceita DDD + 8/9 dígitos), feedback inline por campo (não só no submit), desabilitar botão durante envio (mostrar estado `loading` do design system).
- Nenhuma validação client-side impede o submit por si só sem espelho no servidor (client-side é UX, não segurança).

### Server-side validation (MUST)
- Revalidar todos os campos na function `/api/lead`: tipos, tamanhos máximos (nome ≤ 120 chars, empresa ≤ 150, cidade ≤ 100), telefone em formato BR válido (regex + normalização para E.164 ao gravar).
- Rejeitar payload com campos extras não esperados (allowlist estrita de chaves aceitas).

### Sanitização (MUST)
- Trim de espaços, remoção de tags HTML de qualquer campo de texto livre (nome, empresa, cidade, "qual sistema") antes de persistir — nunca interpolar esses valores em HTML sem escape (mesmo sendo só armazenados/enviados a CRM/e-mail, tratar como potencialmente hostil).
- Normalizar telefone e remover caracteres não numéricos antes de validar/gravar.

### Rate limiting (MUST)
- Limite por IP: máx. 5 submissões bem-sucedidas por hora, máx. 15 tentativas (incluindo falhas de validação) por hora — implementado na edge function (Cloudflare: KV ou Durable Object simples com contador; Vercel: middleware com armazenamento equivalente, ex. Upstash Redis).
- Resposta ao exceder: HTTP 429, sem detalhar a razão exata ao cliente (evita fingerprinting do mecanismo de defesa).

### Honeypot (MUST)
- Campo oculto (`display:none` via CSS, nunca `type="hidden"` sozinho — bots simples ignoram `hidden` mas preenchem campos visíveis via CSS escondidos de forma menos óbvia) com nome não óbvio (ex.: `website_url`); se vier preenchido, resposta 200 "falsa" (para não alertar o bot) mas o lead **não é gravado nem disparado para tracking**.
- Complementar: campo de tempo mínimo de preenchimento (timestamp de render do formulário vs. timestamp de submit) — rejeitar envios com menos de 3 segundos entre os dois (indicativo de bot).

### CAPTCHA (OPTIONAL, condicional)
- **Não implementar no lançamento.** Só introduzir (Cloudflare Turnstile, preferível ao reCAPTCHA por ser mais leve e não depender de scripts do Google) se o rate limiting + honeypot mostrarem, após 2–4 semanas de dados reais, volume relevante de spam passando pelas defesas. Justificativa: CAPTCHA adiciona fricção e uma dependência de terceiro logo na etapa mais crítica do funil (conversão) — só vale o custo se o problema for comprovado, não preventivamente.

### Feedback de sucesso/erro (MUST)
- Sucesso: formulário é substituído por bloco de confirmação inline (definido no design system, §12) **e** o usuário é redirecionado para `/siofi/obrigado` logo em seguida (ver §35) — a substituição inline evita "flash" antes do redirect.
- Erro de validação: mensagem inline por campo, foco automático no primeiro campo inválido.
- Erro de servidor (5xx, timeout, rede): mensagem geral não-técnica ("Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.") com link direto para o WhatsApp como fallback — nunca deixar o usuário sem saída.

### Retry e timeout (MUST)
- Timeout do fetch: 8 segundos: acima disso, tratar como erro de servidor (mostrar fallback de WhatsApp).
- Um retry automático silencioso apenas para falhas de rede (não para 4xx, que são erros de validação legítimos) antes de exibir erro ao usuário.

### Proteção contra duplicidade (MUST)
- Gerar `lead_id` (UUID v4) **no cliente**, no momento em que o usuário começa a preencher o formulário (evento `form_start`) — esse mesmo `lead_id` é enviado no submit e usado como chave de idempotência no backend (se o mesmo `lead_id` chegar duas vezes — ex. duplo clique ou retry — o backend responde 200 sem gravar novamente nem disparar tracking duplicado).
- Desabilitar o botão de submit imediatamente ao clicar (previne duplo clique) e só reabilitar em caso de erro.

---

## 20. Validation & Anti-Spam
(Consolidado com §19 — resumo de responsabilidades por camada)

| Camada | Responsabilidade |
|---|---|
| HTML5 (`required`, `pattern`, `type`) | Primeira barreira de UX, não de segurança |
| JS client-side | Máscara, feedback inline, honeypot de tempo, `lead_id` |
| Edge Function `/api/lead` | Revalidação completa, sanitização, allowlist de campos, rate limit, honeypot server-side, idempotência por `lead_id` |
| CRM/webhook de destino | Última linha — nunca confiar cegamente mesmo após passar pela function; se o CRM tiver suas próprias regras de dedupe por telefone/e-mail, mantê-las ativas |

---

## 21. Conversion Architecture

### Conversão principal
```text
lead_submitted
```

- **Quando dispara:** exclusivamente após a Edge Function `/api/lead` responder `200 { ok: true, lead_id }`. Nunca no `onClick` do botão, nunca no `onSubmit` antes da resposta da API.
- **Onde dispara:** no cliente, dentro do `.then()` da chamada fetch, via `dataLayer.push(...)` — que aciona as tags do GTM (GA4 Event, Google Ads Conversion via Enhanced Conversions, Meta Pixel `Lead`). Em paralelo, a própria Edge Function dispara o **Meta CAPI** server-side com o **mesmo `event_id`** (= `lead_id`) para garantir que o evento existe mesmo se o navegador do usuário bloquear o Pixel client-side (ad blockers, ITP, Safari).
- **Quando NÃO deve disparar:** em erro de validação (4xx), erro de servidor (5xx), timeout, quando o honeypot é acionado (bot), ou em reenvio com `lead_id` já processado (idempotência).
- **Deduplicação:** ver §29 — Pixel (browser) e CAPI (server) compartilham `event_id = lead_id`; o Meta deduplica automaticamente eventos com o mesmo `event_id` e mesmo `event_name` dentro da janela de deduplicação (48h). GA4 não tem conceito nativo de dedupe entre client/server para este evento porque **só disparamos GA4 no client** (não há envio server-side duplicado para GA4 nesta arquitetura — Measurement Protocol do GA4 fica fora de escopo do lançamento, `OPTIONAL` futuro).

### Conversões secundárias
Ver taxonomia completa em §22.

---

## 22. Event Taxonomy

Convenção de nomenclatura: **`snake_case`** em todos os eventos e parâmetros, sempre em inglês para nomes de evento (padrão de mercado/GA4/Meta), valores de parâmetro em português quando refletem conteúdo da página (ex. `business_type`).

| Evento | Quando dispara | Onde | Prioridade |
|---|---|---|---|
| `page_view` | Carregamento da página (GA4 Enhanced Measurement cobre isso automaticamente — não duplicar manualmente) | Automático (GA4) | MUST |
| `form_start` | Primeiro campo do formulário recebe foco | Cliente | MUST |
| `hero_cta_click` | Clique no CTA primário do hero | Cliente | MUST |
| `demo_cta_click` | Clique em qualquer CTA "Agendar demonstração" fora do hero (virada, financeiro, header, sticky) — usar parâmetro `cta_location` para diferenciar | Cliente | MUST |
| `secondary_cta_click` | Clique em "Conhecer o SiOfi" / "Ver o SiOfi funcionando" / "Quero avaliar o SiOfi" | Cliente | SHOULD |
| `whatsapp_click` | Clique no botão flutuante de WhatsApp ou link do footer | Cliente | MUST |
| `phone_click` | Clique em link `tel:` (se existir no footer/suporte) | Cliente | SHOULD |
| `scroll_depth` | 25/50/75/100% de rolagem da página (uma vez por marco, por sessão) | Cliente | SHOULD |
| `faq_open` | Abertura de um item do accordion FAQ (parâmetro `faq_question`) | Cliente | OPTIONAL |
| `migration_interest` | Usuário seleciona "Sim" no chip "Já utiliza sistema de gestão?" dentro do formulário (antes do submit) | Cliente | SHOULD |
| `form_error` | Validação client ou server falha (parâmetro `error_type`: `validation` \| `server` \| `timeout`) | Cliente | MUST |
| `lead_submitted` | Conversão principal — ver §21 | Cliente (pós-confirmação) + Server (CAPI) | MUST |
| `qualified_lead` | Evento reservado para quando o CRM/vendas marcar o lead como qualificado — **não disparado pela landing page**; chega via integração server-to-server do CRM para GA4 (Measurement Protocol) ou Meta (CAPI, evento customizado) — `OPTIONAL`, depende de CRM definido | Server (futuro) | OPTIONAL |
| `click_google_ads_landing` | **Não implementar como evento custom** — é redundante com a própria detecção de `gclid` na sessão; não rastrear "cliquei vindo do Google Ads" como evento, isso é atribuição, não interação (ver §30/§31) | — | NÃO USAR |

**Eventos deliberadamente fora do escopo (evitar rastrear por rastrear):** hover de card, tempo de permanência por seção, movimento de mouse, clique em cada ícone individual dos pilares. Nenhum desses é acionável para o objetivo de geração de leads qualificados — instrumentá-los infla o volume de eventos no GA4 (custo e ruído) sem gerar decisão de negócio.

---

## 23. Data Layer

Padrão de push: sempre um objeto plano, `event` como chave obrigatória, demais chaves em `snake_case`, valores primitivos (string/number/boolean) — nunca objetos aninhados complexos nem PII.

```javascript
// form_start
window.dataLayer.push({
  event: "form_start",
  lead_id: "3f9a1c2e-...",       // UUID gerado no cliente
  form_context: "final_cta"      // "final_cta" | "troca_sistema" (via ?ctx=troca)
});

// demo_cta_click / hero_cta_click / secondary_cta_click
window.dataLayer.push({
  event: "demo_cta_click",
  cta_location: "financeiro",    // "header" | "hero" | "virada" | "financeiro" | "sticky_mobile"
  cta_label: "Quero ter mais controle da minha oficina"
});

// whatsapp_click
window.dataLayer.push({
  event: "whatsapp_click",
  click_location: "floating_button" // "floating_button" | "footer_link"
});

// scroll_depth
window.dataLayer.push({
  event: "scroll_depth",
  scroll_percentage: 50 // 25 | 50 | 75 | 100 (number, não string)
});

// migration_interest
window.dataLayer.push({
  event: "migration_interest",
  current_system_disclosed: true // boolean — NÃO enviar o nome do sistema atual aqui (é texto livre do usuário, tratar como PII-adjacent/dado de negócio, só vai para o CRM)
});

// form_error
window.dataLayer.push({
  event: "form_error",
  error_type: "validation" // "validation" | "server" | "timeout"
});

// lead_submitted — conversão principal
window.dataLayer.push({
  event: "lead_submitted",
  lead_id: "3f9a1c2e-...",
  business_type: "auto_center",     // derivado de contexto da página/campanha, NÃO do nome da empresa
  employees_range: "5_12",          // "1_4" | "5_12" | "13_plus" — enum fixo, nunca número livre
  current_system: "yes",            // "yes" | "no"
  form_context: "final_cta",        // "final_cta" | "troca_sistema"
  page_variant: "siofi_main"        // slug da página/variante de campanha
});
```

**Tipos e valores aceitos:** `lead_id` (string UUID), `cta_location`/`click_location`/`error_type`/`form_context`/`page_variant` (string, enum fechado — validar contra lista permitida antes do push, nunca string livre do usuário), `employees_range`/`business_type`/`current_system` (string, enum fechado — nunca o texto livre "qual sistema você usa hoje"), `scroll_percentage` (number).

**Dados proibidos no dataLayer (reforço de §23, detalhado em §22 abaixo):** nome, empresa (texto livre), WhatsApp, cidade/UF em texto livre, nome do sistema concorrente informado pelo usuário. Esses valores existem **apenas** no payload que vai para a Edge Function → CRM, nunca no `dataLayer`/GTM/GA4/Pixel client-side.

---

## 24. LGPD & PII

### PII proibida (nunca no dataLayer, GA4, Meta Pixel, Google Ads, ou qualquer tag do GTM)
Nome completo · WhatsApp/telefone · e-mail (não coletado, mas se algum dia for adicionado, mesma regra) · CPF/CNPJ · nome exato da empresa · endereço completo · texto livre de "qual sistema utiliza hoje".

### Dados permitidos (podem ir para analytics/ads, pois são agregados/categóricos)
Faixa de funcionários (`1_4`/`5_12`/`13_plus`) · tipo de negócio inferido pela página/campanha (`oficina`/`auto_center`/etc., não pelo texto que o usuário digitou) · se já usa sistema (`yes`/`no`, booleano categórico) · origem/campanha (UTMs, click IDs) · UF (estado, não cidade+bairro) — **nota:** a copy pede "Cidade/UF" como campo — **cidade em texto livre é PII-adjacent** (pode identificar um negócio específico em município pequeno) e **não deve ir ao dataLayer**; apenas a UF (2 letras) pode ser usada como parâmetro categórico se necessário para relatórios agregados, e mesmo assim como campo opcional de enriquecimento, não obrigatório.
`page_variant`, `form_context`, nomes de evento e parâmetros técnicos (`event_id`, timestamps não-identificáveis).

### Onde a PII realmente trafega
Nome, empresa, WhatsApp, cidade e "qual sistema" **só** viajam: (1) do formulário para a Edge Function via HTTPS; (2) da Edge Function para o CRM (§33); (3), quando aplicável, para o Meta CAPI **hasheados em SHA-256** (telefone, nunca nome/empresa em claro) como `user_data` — nunca em texto plano para a Graph API; (4) para o Google Ads Enhanced Conversions, telefone hasheado em SHA-256 seguindo a spec do Google.

**MUST:** revisar o container do GTM periodicamente (checklist de pré-lançamento §63) para confirmar que nenhuma variável de dataLayer contendo PII foi mapeada, por engano, para um parâmetro de tag GA4/Google Ads/Meta.

---

## 25. GTM Architecture

- **Container:** um único container GTM para o domínio da landing (compartilhado com outras propriedades do mesmo domínio, se houver, respeitando naming de tags por prefixo de projeto — ex. `SIOFI - ...`).
- **Environments:** usar os ambientes nativos do GTM — `Live` (produção), `Latest`/`Draft` (staging/preview) — publicar em produção **apenas** após validar em preview com GTM Preview Mode + GA4 DebugView.
- **Preview:** obrigatório antes de toda publicação (`MUST`); checklist de pré-publicação inclui disparar manualmente cada evento crítico (`form_start`, `lead_submitted`, `whatsapp_click`) no modo preview e confirmar na aba de tags acionadas.
- **Versionamento:** cada publicação do GTM recebe nome de versão descritivo (`v3 - add migration_interest event`, não "Version 12") e nota do que mudou — facilita rollback.
- **Naming convention:**
  - Tags: `{Destino} - {Ação}` → `GA4 - Event - lead_submitted`, `Meta Pixel - Lead`, `Google Ads - Conversion - Demo`.
  - Triggers: `{Tipo} - {Evento/Condição}` → `Custom Event - lead_submitted`, `Click - WhatsApp Button`.
  - Variables: `{Tipo} - {Nome}` → `DLV - lead_id`, `DLV - business_type`, `Const - GA4 Measurement ID`.
- **Folders:** organizar por domínio funcional — `Consent`, `GA4`, `Google Ads`, `Meta`, `Custom Events`, `Utilities` (variables reaproveitáveis).
- **Consent Mode:** os templates de tag do GA4/Google Ads/Meta (via GTM) devem ter os campos de "Consent Settings" configurados para respeitar `analytics_storage`/`ad_storage`/`ad_user_data`/`ad_personalization` nativamente (recursos built-in do GTM desde a v2 do Consent Mode) — não depender de lógica manual de "if consent then fire tag".

---

## 26. GA4

- **Propriedade:** dedicada ao domínio da landing (ou dedicada a "SiOfi" dentro de uma conta GA4 maior da F5, se existir) `[TBD — DEFINIR ESTRUTURA DE CONTA]`.
- **Stream:** um Web Data Stream para o domínio de produção; **stream separado ou filtro de dados para staging** (nunca o mesmo stream recebendo dados de `staging.siofi...` e produção sem segregação — ver Internal/Developer traffic abaixo).
- **Enhanced Measurement:** manter ativado (cobre `page_view`, `scroll` nativo — mas como já definimos `scroll_depth` customizado com marcos de 25/50/75/100%, **desativar o "Scrolls" nativo do Enhanced Measurement** para não duplicar sinal de rolagem com semântica diferente, ou then mapear ambos com clareza no relatório) — decisão: **desativar Scrolls nativo, usar apenas o customizado**, que já está alinhado à taxonomia de §22.
- **Eventos custom → Key Events (antigas "conversões"):** marcar como Key Event no GA4: `lead_submitted` (MUST), `whatsapp_click` (SHOULD), `form_start` (OPTIONAL, útil para funil mas não é conversão de negócio).
- **Cross-domain:** **MUST** configurar se o link de WhatsApp ou qualquer CTA levar o usuário para um subdomínio diferente antes de retornar (ex. `checkout.` ou `crm.` em outro domínio) — hoje não há esse fluxo previsto; se um domínio de CRM/agendamento externo for adicionado no futuro, configurar "Domínios não relacionados" no GA4.
- **Referrals indesejados:** adicionar à "Lista de exclusão de referência" o próprio domínio de pagamento/CRM (se usar Stripe, Calendly, etc. para agendar a demo no futuro) para não contar isso como novo canal de aquisição.
- **Internal traffic:** definir regra de IP (ou parâmetro de URL `?debug_internal=true` combinado com uma condição de exclusão) para marcar tráfego da equipe F5/agência como `traffic_type: internal` — excluído dos relatórios principais por padrão, mas **não bloqueado de ser coletado** (útil para debug).
- **DebugView:** usado ativamente durante QA (§46/§63) via extensão "Google Analytics Debugger" ou parâmetro `?gtm_debug` — **MUST** validar todos os eventos da taxonomia (§22) aparecendo corretamente antes do lançamento.

---

## 27. Google Ads Tracking

- **Search (MUST no lançamento):** conversão de importação via GA4 (Key Event `lead_submitted` importado para o Google Ads como Conversion Action) **ou** tag nativa do Google Ads via GTM disparada no mesmo gatilho `lead_submitted` — **recomendação: usar a importação GA4 → Google Ads** como fonte única de verdade, evitando manter duas tags de conversão redundantes (reduz risco de contagem duplicada/config divergente).
- **Conversion Action:** nome `SiOfi - Lead Demonstração`, categoria "Lead", valor **não atribuído por padrão** (não há valor monetário definido por lead — `[TBD — DEFINIR SE HAVERÁ VALOR ATRIBUÍDO POR LEAD OU POR SEGMENTO]`; se definido futuramente, popular via parâmetro de `value`/`currency` no `dataLayer` a partir do `business_type`).
- **Enhanced Conversions for Leads (MUST, quando telefone estiver disponível):** enviar o WhatsApp normalizado e hasheado (SHA-256) via **server-side** (a mesma Edge Function que processa `/api/lead` chama a API de Enhanced Conversions do Google Ads, ou popula via importação do GA4 com Enhanced Conversions habilitado ao nível de propriedade) — melhora a correspondência de conversões sem expor PII no client-side.
- **Display/Remarketing (futuro, SHOULD preparar agora):** a mesma tag base do Google Ads (via GTM) já cobre remarketing lists automaticamente quando o `gclid`/cookie do Google Ads está presente; nenhuma implementação adicional necessária além de criar a audiência no painel do Google Ads quando a campanha existir.
- **Performance Max (futuro, OPTIONAL):** dependeria do mesmo Conversion Action já criado — não requer mudança técnica na landing.
- **`gclid`:** capturado e persistido (§31); usado para o "Conversion Linker" (tag nativa do GTM, `MUST` ativa) que também lê `gclid` de cookies de primeira parte do próprio Google (`_gcl_au`, `_gcl_aw`) para atribuição robusta mesmo com Safari ITP.
- **`gbraid`/`wbraid`:** capturados da mesma forma que `gclid` (parâmetros de URL usados em contextos iOS/App/Web-to-App do Google Ads) — persistidos e enviados ao CRM junto com os demais parâmetros de atribuição, mesmo que não sejam imediatamente acionáveis sem uma integração de app (preparação para cenários futuros).
- **Attribution model:** herdado da conta do Google Ads (Data-Driven por padrão) — a landing não precisa implementar lógica de atribuição própria além de garantir que os click IDs cheguem intactos ao ponto de conversão.

---

## 28. Meta Pixel

| Evento | Padrão ou custom | Quando |
|---|---|---|
| `PageView` | Padrão | Toda page load (via GTM, automático) |
| `ViewContent` | **Não usar** | Não há conteúdo variável por "produto" a rastrear (página única) — evitar evento sem propósito acionável |
| `Lead` | Padrão | No mesmo gatilho de `lead_submitted` (§21), com parâmetros customizados (`business_type`, `employees_range`, `current_system` — os mesmos enums de §23, nunca PII) |
| `Contact` | Padrão | No clique do WhatsApp (`whatsapp_click`) — evento padrão do Meta que sinaliza intenção de contato, útil para otimização de campanha |
| Custom: `form_start` | Custom Event | Espelha o `dataLayer` (opcional para otimização de campanha de topo de funil) |

**Regra de uso padrão vs. custom:** sempre que o Meta tiver um evento-padrão semanticamente correto (`Lead`, `Contact`, `PageView`), usá-lo — eventos padrão têm melhor suporte a otimização de campanha e benchmarking dentro do Ads Manager. Custom events são reservados para o que não tem equivalente padrão (`form_start`, `migration_interest` se decidido enviar ao Meta).

Todos os parâmetros customizados seguem a mesma allowlist de enums de §23 — nenhum PII em texto plano no Pixel (o `user_data` avançado, com telefone hasheado, vai **apenas via CAPI server-side**, nunca via Pixel client-side em texto claro).

---

## 29. Meta Conversion API

Arquitetura desde o lançamento (não como fase 2):

```
Browser Pixel (Lead)          Server CAPI (Lead)
   event_id = lead_id            event_id = lead_id  ← MESMO valor
   fbp (cookie)                  fbp (lido do cookie no request)
   fbc (cookie, se houver fbclid) fbc (idem)
   user_data: (nenhum PII cru)   user_data: phone (SHA-256), external_id = lead_id
        │                              │
        └──────────────┬───────────────┘
                        ▼
              Meta deduplica por event_id
                (janela de 48h, mesmo event_name)
```

**Campos enviados pelo CAPI (server-side, dentro da Edge Function, imediatamente após persistir o lead):**
- `event_name`: `"Lead"`
- `event_id`: o `lead_id` (UUID) — **idêntico** ao usado no Pixel do browser
- `event_time`: timestamp Unix do momento em que o servidor confirma o lead (não o momento do clique)
- `action_source`: `"website"`
- `event_source_url`: URL completa da página onde o formulário foi enviado (sem querystring de PII, mas **com** UTMs/click IDs — são dados de atribuição, não PII)
- `user_data`:
  - `ph`: telefone normalizado (E.164) e hasheado em SHA-256 (hash feito no servidor, nunca no cliente)
  - `client_ip_address` e `client_user_agent`: capturados do request na Edge Function
  - `fbp`/`fbc`: lidos do cookie de primeira parte que o Pixel já grava no navegador (repassados no payload do formulário para o servidor ter acesso a eles)
  - `external_id`: o `lead_id` (não hasheado — é um identificador interno, não PII)
- **Nunca enviado ao CAPI:** nome, e-mail (não coletado), cidade em texto livre, nome da empresa.

**Consentimento:** o disparo do CAPI (assim como do Pixel) só ocorre se `ad_storage`/`ad_user_data` estiverem concedidos no Consent Mode (§37) — a Edge Function verifica um campo `consent_ad_user_data: boolean` enviado junto com o submit do formulário (refletindo o estado de consentimento do usuário no momento do envio) antes de chamar a Graph API.

---

## 30. Event Deduplication

**Regra objetiva:** `event_id` (Meta) = `lead_id` (interno) = valor único gerado no cliente em `form_start` e reutilizado em todo o ciclo de vida daquele envio (client dataLayer → server CAPI → CRM). O Meta usa a combinação `(event_name, event_id)` dentro de uma janela de deduplicação de até 48h para tratar Pixel e CAPI como **um único evento**, não dois leads.

**Checklist de implementação (MUST):**
- [ ] `lead_id` gerado uma única vez por tentativa de submissão (regenerar apenas se o usuário reiniciar o formulário do zero em uma nova sessão/página).
- [ ] O mesmo `lead_id` é passado: (1) ao `dataLayer.push` que aciona o Pixel `Lead` via GTM; (2) ao payload da Edge Function, que o usa como `event_id` no CAPI e como chave de idempotência de gravação.
- [ ] `event_name` idêntico nos dois lados (`"Lead"`, não `"lead"` nem `"LEAD"`).
- [ ] Testado no Meta Events Manager (aba "Test Events") mostrando as duas origens (Browser + Server) casando como um evento deduplicado antes do lançamento (§63).
- [ ] Google Ads **não precisa** de deduplicação equivalente nesta arquitetura porque só há uma via de disparo (client, via importação GA4 ou tag nativa) — Enhanced Conversions server-side (§27) é um *enriquecimento* do mesmo Conversion Action, não uma segunda contagem.

---

## 31. UTM Strategy

### Padrão obrigatório de UTMs
Todo link pago (Google Ads, Meta Ads) e todo material de campanha (e-mail, parcerias) **MUST** incluir os 5 parâmetros:
```
utm_source
utm_medium
utm_campaign
utm_content
utm_term       (Google Ads: dinâmico com {keyword}; Meta: opcional, usado para variação de público)
```

### Naming convention

**Meta Ads:**
```
utm_source=meta
utm_medium=paid_social
utm_campaign=META_SP_PROSPECTING_DOR_LUCRO_01
utm_content={{ad.name}}            (dinâmico via Meta, ou nome manual do criativo)
utm_term=(vazio ou público, ex. lookalike_1pct)
```

**Google Ads:**
```
utm_source=google
utm_medium=cpc
utm_campaign=GOOGLE_SEARCH_SP_SISTEMA_OFICINA
utm_content={{creative}}            (opcional; Google recomenda usar auto-tagging + gclid como fonte primária de verdade, UTMs como redundância legível)
utm_term={keyword}                  (dinâmico, padrão do Google Ads)
```
**Nota MUST:** manter o **auto-tagging (gclid) ativado** no Google Ads além das UTMs manuais — são complementares, não substitutos: `gclid` é a fonte de verdade para Enhanced Conversions/importação, UTMs são a camada legível para relatórios de canal/campanha no GA4.

**Remarketing:**
```
utm_source=meta (ou google)
utm_medium=remarketing
utm_campaign=META_SP_REMARKETING_VISITANTES_LP_01
```

**Orgânico:** não recebe UTM manual — o GA4 classifica automaticamente via `referrer` (`google / organic`, `bing / organic`, etc.). **Nunca** adicionar UTM a links de conteúdo orgânico interno (isso quebraria a atribuição orgânica correta, sobrescrevendo-a como se fosse campanha).

**Parceiros/indicações:**
```
utm_source=parceiro
utm_medium=referral
utm_campaign=PARCEIRO_[NOME]_2026
```

**Naming das campanhas (padrão geral):** `{CANAL}_{UF/REGIÃO}_{OBJETIVO}_{ÂNGULO/TERMO}_{VERSÃO}`, tudo em maiúsculas com underscore, sem espaços/acentos — exemplos já usados acima. Este padrão é **documentado no README do repositório** (§70) para que qualquer pessoa da equipe de mídia crie campanhas consistentes sem depender de perguntar.

---

## 32. Click ID Persistence

### O que é capturado
`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `gbraid`, `wbraid`, `fbclid` — lidos da querystring no carregamento da página. `fbc` e `fbp` — **não** lidos da URL; são cookies que o próprio Meta Pixel cria automaticamente (`fbp` sempre; `fbc` quando há `fbclid` na URL) — a aplicação apenas os lê do documento quando monta o payload do formulário.

### Estratégia de armazenamento
**Cookie de primeira parte (`siofi_attribution`), não `localStorage` puro.** Justificativa: Safari ITP e Firefox ETP limitam ou expiram `localStorage`/cookies de terceiros de forma imprevisível para atribuição de médio prazo, mas um **cookie de primeira parte com `SameSite=Lax` e `Secure`**, definido pelo próprio domínio da landing, tem tratamento mais previsível para esse caso de uso (é exatamente o mecanismo que o próprio Meta usa para `fbp`/`fbc`).

- **Duração:** 90 dias (janela de consideração razoável para decisão B2B de compra de software, conforme jornada mapeada na pesquisa de público — decisão pode levar semanas).
- **Escrita:** na primeira visita com parâmetros de campanha presentes, grava/atualiza o cookie com um JSON compacto: `{ utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, gbraid, wbraid, fbclid, landing_url, first_seen_at }`.
- **Leitura:** ao montar o payload do formulário, o cookie é lido e seus valores anexados ao `lead` enviado à Edge Function → CRM.
- Como fallback de compatibilidade (`SHOULD`, não substitui o cookie), espelhar os mesmos dados em `sessionStorage` para persistir corretamente durante a navegação entre `/siofi` e `/siofi/obrigado` na mesma aba, mesmo em navegadores que bloqueiem escrita de cookie em algum contexto específico.
- Servidor **não** depende de sessão/estado — o cookie/valor é sempre enviado explicitamente no payload do POST, então a Edge Function não precisa "adivinhar" a origem por IP ou header `Referer`.

---

## 33. First-Touch / Last-Touch Attribution

- **First touch:** capturado **uma única vez**, na primeira visita em que o cookie `siofi_attribution` ainda não existe. Uma vez gravado, o bloco de first-touch **nunca é sobrescrito** nas visitas seguintes, mesmo que o usuário volte por outro canal.
- **Last touch:** atualizado a **cada nova visita com parâmetros de campanha presentes na URL** (se a visita não tiver UTM/click ID, ex. usuário digitou a URL direto ou voltou por um favorito, o last-touch não é sobrescrito com "direto/nenhum" — só é atualizado quando há sinal de campanha novo).
- Ambos os blocos (`first_touch` e `last_touch`, cada um com o mesmo conjunto de campos de §32) são enviados ao CRM no payload do lead (§34) — nunca só um dos dois, para permitir que a análise de mídia decida qual modelo usar por segmento/relatório.

```json
{
  "first_touch": { "utm_source": "meta", "utm_campaign": "META_SP_PROSPECTING_DOR_LUCRO_01", "seen_at": "2026-08-01T14:22:00Z" },
  "last_touch":  { "utm_source": "google", "utm_campaign": "GOOGLE_SEARCH_SP_SISTEMA_OFICINA", "gclid": "...", "seen_at": "2026-08-20T09:10:00Z" }
}
```

---

## 34. CRM Payload

Estrutura recomendada (independente do CRM final escolhido — `[TBD — DEFINIR CRM]`), enviada pela Edge Function via webhook/API REST:

```json
{
  "lead": {
    "lead_id": "3f9a1c2e-...",
    "name": "[PII — só aqui e no destino final]",
    "company": "[PII]",
    "whatsapp": "[PII, normalizado E.164]",
    "city": "[PII-adjacent]",
    "state": "SP"
  },
  "business": {
    "employees_range": "5_12",
    "current_system": "yes",
    "current_system_name": "[texto livre do usuário, opcional]",
    "page_variant": "siofi_main",
    "form_context": "final_cta"
  },
  "attribution": {
    "first_touch": { "utm_source": "meta", "utm_medium": "paid_social", "utm_campaign": "...", "utm_content": "...", "utm_term": "...", "gclid": null, "fbclid": "...", "seen_at": "..." },
    "last_touch": { "utm_source": "google", "utm_medium": "cpc", "utm_campaign": "...", "gclid": "...", "seen_at": "..." },
    "landing_url": "https://.../siofi",
    "referrer": "https://www.google.com/"
  },
  "technical": {
    "submitted_at": "2026-08-25T13:04:11Z",
    "user_agent": "...",
    "ip_country": "BR",        // país inferido, não IP completo persistido além do necessário para CAPI
    "consent_ad_storage": true,
    "consent_analytics_storage": true
  }
}
```

Campos recomendados adicionais (`SHOULD`): `utm_full_query_string` (string bruta, para auditoria manual em caso de campo novo não mapeado), `lead_source_system: "landing_page_siofi"` (para o CRM distinguir leads vindos desta LP de outras fontes futuras).

---

## 35. Lead ID Strategy

- **Formato:** UUID v4 (`crypto.randomUUID()` no navegador — suportado nativamente em todos os browsers-alvo de §47; fallback simples via `Math.random` **não é aceitável** por colisão, mas não é necessário dado o suporte nativo).
- **Geração:** no cliente, no momento do evento `form_start` (primeiro foco em qualquer campo) — **não** gerado no carregamento da página (evitaria gerar IDs para visitantes que nunca interagem com o formulário, poluindo métricas).
- **Propagação:** `lead_id` acompanha: dataLayer (`form_start`, `lead_submitted`) → payload POST `/api/lead` → resposta da API → CAPI (`event_id`) → CRM (`lead.lead_id`) → (futuro) qualquer evento de `qualified_lead` que o time comercial dispare a partir do CRM, permitindo religar a jornada completa de um lead entre analytics interno, Meta e CRM.
- **Não exposto:** nunca incluído na URL (nem em `/siofi/obrigado?lead_id=...` — usar `sessionStorage`/estado de navegação para eventuais necessidades da thank-you page, não querystring, para não vazar o identificador em logs de servidor de terceiros/compartilhamento de link).

---

## 36. Thank-You Flow

**Decisão: página de obrigado dedicada, `/siofi/obrigado`, não modal/confirmação inline apenas.**

### Justificativa
- **Google Ads:** o método mais robusto de conversão por "visita à página de destino" (útil como sinal complementar ao evento de conversão via GTM) exige uma URL distinta e estável — um modal na mesma URL não oferece esse sinal adicional.
- **Meta Ads:** o CAPI/Pixel já dispara no evento de sucesso do formulário (§21), então a página de obrigado **não** é o gatilho do evento `Lead` (evitaria depender de o usuário efetivamente navegar até lá, e evitaria contagem dupla se o evento já disparou antes do redirect) — ela serve para **experiência** (confirmação clara, próximos passos) e como **sinal complementar opcional** (`page_view` da página de obrigado pode ser usado como meta de conversão adicional/redundante no Google Ads, mas nunca como a única fonte).
- **Duplicação por reload:** como o evento de conversão já disparou antes do redirect (baseado na resposta 2xx da API, não na chegada na página), **um reload de `/siofi/obrigado` não duplica o evento de conversão** — a página em si não dispara `lead_submitted` novamente. Ela pode disparar um `page_view` padrão (inofensivo, sem ser a conversão).
- **Experiência:** dá espaço para reforçar a mensagem "nossa equipe entrará em contato", oferecer o link de WhatsApp como atalho, e (se aplicável) embutir um agendamento direto (Calendly ou similar) no futuro sem misturar isso com a lógica de conversão da LP principal.

### Especificação
- `noindex, follow` (§5).
- Sem formulário duplicado.
- CTA secundário: link de WhatsApp com mensagem pré-preenchida genérica, **não incluindo nome/telefone do lead na URL** (§36 abaixo detalha).
- Se o usuário acessar `/siofi/obrigado` diretamente sem ter vindo do fluxo (sem `sessionStorage`/estado esperado), exibir uma versão genérica de agradecimento com CTA para `/siofi` — não quebrar a página, mas também não fingir que uma conversão ocorreu para fins de tracking (nenhum evento de conversão dispara nesse acesso direto).

---

## 37. WhatsApp Tracking

- **Botão flutuante:** `whatsapp_click` com `click_location: "floating_button"`.
- **CTA de contato (footer/suporte):** `whatsapp_click` com `click_location: "footer_link"` ou `"support_section"`.
- **Botão pós-formulário (thank-you page):** `whatsapp_click` com `click_location: "thank_you_page"`.
- Todos os cliques também disparam o evento **Meta `Contact`** (padrão, §28), permitindo otimização de campanha por essa micro-conversão além do `Lead` do formulário.
- **URL do WhatsApp:** `https://wa.me/[TBD — NÚMERO F5]?text=[mensagem pré-preenchida genérica, ex.: "Olá! Vim pela página do SiOfi e gostaria de saber mais."]` — **MUST**: a mensagem pré-preenchida é sempre genérica e estática, **nunca** inclui nome, telefone, cidade ou qualquer dado do formulário (mesmo que o usuário já tenha preenchido o formulário antes de clicar) — evita vazar PII em um link que pode ser compartilhado/logado por terceiros (encurtadores, proxies corporativos).
- Origem/campanha do clique **não vai na URL do WhatsApp** — é registrada via `dataLayer`/GA4/Meta (associada à sessão via cookie de atribuição, §32), não via parâmetro visível no link.

---

## 38. Consent & LGPD

### Quando o banner é necessário
A LGPD (e boas práticas gerais, alinhadas ao espírito do GDPR/Consent Mode v2 do Google) exige **consentimento explícito antes de qualquer coleta não estritamente necessária** — cookies de analytics e publicidade (GA4, Meta Pixel, Google Ads) **não são "estritamente necessários"** para o funcionamento da página, logo **MUST** existir um banner de consentimento antes desses cookies serem efetivamente utilizados para fins de analytics/ads.

### Comportamento
- **Google Consent Mode v2 (MUST):** os 4 sinais (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) começam em `"denied"` por padrão (definido no `dataLayer` antes de qualquer tag disparar) e só mudam para `"granted"` conforme a escolha do usuário no banner.
- **Comportamento "denied" (antes do consentimento ou se recusado):** GTM/GA4 ainda coletam sinais anonimizados/modelados (cookieless pings) conforme o próprio Consent Mode do Google — isso é nativo do Google e não requer lógica customizada além de configurar o Consent Mode corretamente nas tags.
- **Meta Pixel/CAPI:** só disparam com dado real de usuário quando `ad_storage`/`ad_user_data` = `granted`; se negado, a Edge Function **não** chama o CAPI com `user_data` de telefone (pode ainda registrar o lead no CRM normalmente — consentimento de marketing não é pré-requisito para o CRM registrar um lead que o próprio usuário pediu para ser contatado, mas **é** pré-requisito para compartilhar esse dado com Meta/Google para fins de publicidade).
- **Granularidade do banner:** no mínimo 2 categorias selecionáveis independentemente — "Necessários" (sempre ativo, não editável) e "Analytics e Publicidade" (opt-in, desativado por padrão) — `SHOULD` ideal ter 3 categorias (Necessários / Analytics / Publicidade) se a ferramenta de CMP escolhida suportar facilmente, para granularidade mais alinhada às melhores práticas, mas 2 categorias já atende ao mínimo legal.
- **Persistência da escolha:** cookie de consentimento (`siofi_consent`) com validade de 6–12 meses `[TBD — DEFINIR POLÍTICA]`, renovando o banner após expirar.
- **Não bloquear a renderização da página** por trás do banner (nenhum "cookie wall" que impeça o uso básico do site) — apenas os cookies de analytics/ads ficam condicionados.

---

## 39. Cookies

| Categoria | Nome (exemplo) | Finalidade | Duração | Domínio | SameSite | Secure |
|---|---|---|---|---|---|---|
| Necessário | `siofi_consent` | Armazena a escolha de consentimento do usuário | 12 meses | Primeira parte | Lax | Sim |
| Necessário | `siofi_attribution` | UTMs/click IDs para atribuição (§32) | 90 dias | Primeira parte | Lax | Sim |
| Necessário | `siofi_session` (se usado para rate limit/CSRF) | Suporte técnico ao formulário | Sessão | Primeira parte | Strict | Sim |
| Analytics | `_ga`, `_ga_XXXXX` | GA4 | 2 anos (padrão Google) | Primeira parte | Lax | Sim |
| Advertising | `_gcl_au`, `_gcl_aw` | Google Ads Conversion Linker | 90 dias (padrão Google) | Primeira parte | Lax | Sim |
| Advertising | `_fbp` | Meta Pixel (identificação de browser) | 90 dias (padrão Meta) | Primeira parte | Lax | Sim |
| Advertising | `_fbc` | Meta Click ID (quando há `fbclid`) | 90 dias (padrão Meta) | Primeira parte | Lax | Sim |

Todos os cookies de Analytics/Advertising só são efetivamente gravados **após** consentimento (§37) — antes disso, o Consent Mode impede a gravação real ou limita a sinais cookieless conforme o comportamento nativo de cada ferramenta.

---

## 40. Security

- **HTTPS obrigatório** em 100% das rotas, sem exceção, com redirect automático de HTTP.
- **HSTS:** `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` — ativado após confirmar que todos os subdomínios relevantes suportam HTTPS (evitar `preload` antes disso, sob risco de bloquear acesso a um subdomínio esquecido).
- **CSP (Content-Security-Policy):** política restritiva permitindo apenas os domínios necessários (ver §41 para o header completo).
- **X-Content-Type-Options:** `nosniff`.
- **Referrer-Policy:** `strict-origin-when-cross-origin` (equilibra atribuição de campanha — mantém origem em navegação cross-site — com privacidade, não vazando o path completo para terceiros).
- **Permissions-Policy:** desabilitar APIs não usadas pela página (`camera=(), microphone=(), geolocation=(), payment=()`).
- **CSRF:** a Edge Function `/api/lead` valida `Origin`/`Referer` do request contra o domínio esperado, além do honeypot e rate limit — como não há autenticação de usuário/sessão logada, o risco clássico de CSRF é baixo, mas a validação de origem previne submissões automatizadas de domínios externos.
- **XSS:** sanitização de todo input (§19), `Content-Security-Policy` restritiva como defesa em profundidade, nenhuma renderização de HTML vindo de input do usuário em nenhuma parte da página (inclusive na página de obrigado, se ela algum dia exibir algo como "Olá, {nome}" — **se implementado, MUST escapar o valor corretamente pelo template engine, nunca via `innerHTML` direto**).
- **Sanitização:** camada server-side (§19/§20) é a linha de defesa real; client-side é só UX.
- **Rate limiting:** já detalhado em §19 (por IP, na Edge Function).
- **Spam protection:** honeypot + timing + rate limit (§19); CAPTCHA como plano B condicional.

---

## 41. HTTP Headers

Aplicados via configuração de hosting (`_headers` no Cloudflare Pages, ou `next.config.js`/`vercel.json` na alternativa Next.js/Vercel):

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com https://www.facebook.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://graph.facebook.com; frame-src https://www.googletagmanager.com; font-src 'self'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
X-Frame-Options: SAMEORIGIN
```

**Notas MUST:**
- `script-src 'unsafe-inline'` é necessário para o snippet inline do GTM/Consent Mode stub — **mitigar** com nonce ou hash (`'nonce-{random}'` gerado por request, se a plataforma de hosting suportar geração de nonce por request; Cloudflare Pages estático não gera nonce dinâmico facilmente — alternativa viável: usar `'unsafe-inline'` documentado como risco aceito, já que o conteúdo é controlado internamente e não há input de terceiros renderizado sem sanitização).
- Ajustar a lista de domínios do CSP se o CRM/webhook final (§34) usar domínio próprio para o `connect-src` do submit do formulário (ex. `https://api.crm-escolhido.com`).
- `frame-src` do GTM é necessário para alguns cenários de tags que usam iframe internamente (ex. algumas integrações de consentimento) — manter restrito apenas ao necessário.

---

## 42. Cache Strategy

| Recurso | Cache-Control | Observação |
|---|---|---|
| HTML (`/siofi`, variantes) | `public, max-age=0, must-revalidate` (ou `s-maxage=300, stale-while-revalidate=86400` se usando CDN com purge automático no deploy) | Garante que atualizações de copy/conteúdo apareçam rápido sem esperar TTL longo |
| CSS/JS com hash no filename (`app.a1b2c3.css`) | `public, max-age=31536000, immutable` | Nome de arquivo muda a cada build (fingerprint), então cache "para sempre" é seguro |
| Fontes (WOFF2, com hash ou versionadas) | `public, max-age=31536000, immutable` | Idem |
| Imagens/screenshots (com hash de conteúdo no nome ou query de versão) | `public, max-age=31536000, immutable` | Idem — **MUST** versionar o nome do arquivo ao trocar um screenshot (nunca sobrescrever o mesmo filename esperando invalidação de cache automática) |
| `sitemap.xml`, `robots.txt` | `public, max-age=3600` | Atualiza a cada hora, tempo suficiente para mudanças pouco frequentes |
| `/api/lead`, `/api/capi` | `no-store` | Nunca cachear respostas de API com dados de formulário |

**Cache-busting:** garantido pelo build (hash de conteúdo no nome do arquivo via Astro/Vite) — nunca depender de `?v=1` manual.

---

## 43. CDN

- **MUST** usar CDN para todos os assets estáticos (HTML, CSS, JS, imagens, fontes) — resolvido nativamente pelo hosting recomendado (Cloudflare Pages já serve tudo via sua rede global de edge; Vercel equivalente).
- **Edge caching:** HTML estático servido diretamente do edge (sem ida a uma origem central) — essencial para TTFB baixo a partir de qualquer região do Brasil.
- **Geographic delivery:** confirmar que o provedor tem PoPs (pontos de presença) no Brasil (Cloudflare e Vercel/Vercel Edge Network têm) — evita que o tráfego brasileiro percorra até os EUA para receber um HTML estático.
- Imagens servidas com transformação automática (Cloudflare Images/Vercel Image Optimization) **OPTIONAL** — como o pipeline de build já gera AVIF/WebP/tamanhos múltiplos estaticamente (§13/§14), transformação em runtime não é estritamente necessária, mas pode simplificar manutenção futura se a equipe preferir não gerenciar múltiplos arquivos manualmente.

---

## 44. Hosting

### Recomendado: **Cloudflare Pages** (alinhado ao stack Astro de §3)
- Performance no Brasil: rede de edge extensa com PoPs locais — latência baixa sem configuração extra.
- Custo: gratuito para o volume esperado de uma landing page (tráfego de campanha), com upgrade simples se necessário.
- Simplicidade: deploy via Git (push → build → deploy automático), preview deployments por PR/branch (útil para QA de cada mudança antes de produção).
- Logs: Cloudflare Pages/Functions expõe logs de execução das funções (`/api/lead`, `/api/capi`) via dashboard e `wrangler tail` para debug em tempo real.
- Deploy: zero-downtime, rollback com um clique para qualquer deploy anterior.

### Alternativa: **Vercel** (se stack Next.js, §3)
Mesmas vantagens equivalentes (edge network, preview deployments, logs, rollback) — decisão entre as duas é mais uma questão de qual a equipe já domina do que diferença técnica relevante para este projeto.

### Evitar
Hospedagem compartilhada tradicional (cPanel/PHP) ou VPS autogerenciado sem CDN na frente — exigiria configurar manualmente tudo que Cloudflare/Vercel entregam prontos (HTTPS, headers, cache, edge functions), aumentando risco operacional sem benefício correspondente para este caso de uso.

---

## 45. DNS

- **TTL:** 300s (5 min) durante o período de lançamento/ajustes; pode subir para 3600s (1h) após estabilizar, para reduzir carga de consultas DNS sem comprometer agilidade de mudança se necessário.
- **HTTPS:** registro `CNAME`/`A` apontando para o provedor de hosting, com certificado gerenciado automaticamente (Cloudflare/Vercel emitem e renovam via Let's Encrypt automaticamente) — **MUST** confirmar HTTPS ativo antes de qualquer campanha ir ao ar.
- **www / non-www:** decidir domínio canônico `[TBD — DEFINIR COM F5: www.siofi.com.br OU siofi.com.br]`; o outro faz **301 permanente** para o canônico, configurado no nível de DNS/CDN (nunca deixar as duas versões servindo o mesmo conteúdo sem redirect — isso duplica sinal de SEO).
- **Redirects:** gerenciados na camada de CDN (regras de redirect do Cloudflare Pages/`_redirects`), não em código de aplicação, para responder mais rápido (edge) e não depender de a função da aplicação estar "quente".
- **Domínio canônico:** usado consistentemente em: canonical tags, sitemap, Open Graph, Search Console (propriedade de domínio), variáveis de ambiente que compõem URLs absolutas.

---

## 46. Environment Architecture

| Ambiente | URL | Propósito | Tracking |
|---|---|---|---|
| Development | `localhost:4321` (porta padrão Astro) | Desenvolvimento local | GTM em modo `Preview`; nenhum ID de produção usado; `.env.local` com IDs de teste/sandbox |
| Staging | `staging.siofi-lp.pages.dev` (subdomínio de preview do Cloudflare Pages, um por branch/PR) | QA, revisão de stakeholder, testes de tracking em ambiente "real" antes de produção | GTM container **mesmo** (usar variável de ambiente do GTM para diferenciar `Environment` de preview vs. live), mas com **GA4 Data Stream separado ou filtro `traffic_type: staging`** para não poluir relatórios de produção; `robots.txt` bloqueando indexação total (§5) |
| Production | domínio canônico (§45) | Ambiente real, recebe tráfego de campanha | Todos os IDs reais de produção; Consent Mode ativo; todas as tags publicadas no ambiente `Live` do GTM |

**MUST:** nenhuma métrica de staging chega às contas de produção do GA4/Google Ads/Meta sem marcação clara de origem — a forma mais simples e robusta é **nunca disparar tags de Ads/Meta em staging** (deixar apenas GA4 com stream/propriedade de teste rodando lá, útil para validar que os eventos dispararam com os parâmetros certos, sem contaminar dados de mídia paga que dependem de conversões reais).

---

## 47. Environment Variables

| Variável | Uso | Exposta ao client? |
|---|---|---|
| `PUBLIC_GTM_CONTAINER_ID` | ID do container GTM (`GTM-XXXXXXX`) | Sim (necessário para carregar o snippet) |
| `PUBLIC_GA4_MEASUREMENT_ID` | ID do stream GA4 (`G-XXXXXXX`) | Sim (configurado via GTM na maioria dos casos; se usado diretamente, precisa ser público) |
| `PUBLIC_SITE_URL` | URL canônica base (usada para gerar canonical/OG/sitemap absolutos) | Sim |
| `META_PIXEL_ID` | ID do Pixel (usado tanto no client via GTM quanto no server para CAPI) | Sim para o ID em si (não é secreto), mas ver `META_CAPI_ACCESS_TOKEN` abaixo |
| `META_CAPI_ACCESS_TOKEN` | Token de acesso à Graph API para chamadas server-side do CAPI | **Não** — só na Edge Function (variável de ambiente do servidor/secret do Cloudflare Pages, nunca em código versionado nem no bundle client) |
| `GOOGLE_ADS_CONVERSION_ID` / `GOOGLE_ADS_CONVERSION_LABEL` | Identifica a Conversion Action para Enhanced Conversions | Server-side (se disparado via API) ou via GTM (público, pois é usado no client-side também nesse caso) |
| `GOOGLE_ADS_ENHANCED_CONVERSIONS_API_KEY` | Credencial para envio server-side de Enhanced Conversions (se implementado fora do GTM) | **Não** — apenas server |
| `CRM_ENDPOINT` | URL do webhook/API do CRM de destino | **Não** — apenas server (a Edge Function chama, o client nunca vê essa URL) |
| `CRM_API_KEY` | Credencial de autenticação com o CRM | **Não** — apenas server, secret |
| `RATE_LIMIT_KV_NAMESPACE` (ou equivalente) | Binding do armazenamento usado para rate limiting | Não aplicável ao client — configuração de infraestrutura |
| `HONEYPOT_FIELD_NAME` | Nome do campo honeypot (evitar hardcode espalhado; ainda assim não é secreto de alto risco, mas mantém consistência) | Não — server |

**Regra MUST:** nenhum secret (`META_CAPI_ACCESS_TOKEN`, `CRM_API_KEY`, qualquer credencial) é prefixado como público (`PUBLIC_*` no Astro, `NEXT_PUBLIC_*` no Next) nem referenciado em código que roda no bundle client. Variáveis públicas (`PUBLIC_GTM_CONTAINER_ID`, IDs de Pixel/GA4 que já são, por natureza, visíveis no HTML/JS renderizado) não são segredos — o segredo real está nos tokens de API server-side, esses sim protegidos.

---

## 48. Observability

- **Erros JavaScript (client):** **SHOULD** integrar Sentry (ou alternativa gratuita/open-source como GlitchTip) com sample rate reduzido (ex. 20–50% das sessões, para controlar custo/volume) — captura erros do formulário, falhas de hidratação da ilha, exceptions não tratadas.
- **Erros do formulário:** já instrumentado via evento `form_error` (§22) no GA4 — serve como observabilidade de produto (quantos usuários falham e por quê) além de Sentry (que serve para stack trace técnico).
- **API failures (`/api/lead`, `/api/capi`):** logs estruturados na Edge Function (Cloudflare Pages Functions logs, ou integração com serviço de logging se o volume justificar) — registrar `lead_id`, timestamp, tipo de falha (validação/CRM indisponível/CAPI falhou), **nunca** logar PII completo em texto plano em sistema de log de terceiro sem necessidade (logar `lead_id` e categorias, não nome/telefone, nos logs de aplicação — PII fica só no destino final, o CRM).
- **Uptime:** **SHOULD** monitor simples e gratuito (UptimeRobot, Better Uptime free tier, ou o monitoramento nativo do Cloudflare) checando `/siofi` a cada 5 minutos, alertando por e-mail/Slack se cair.
- **Latência:** acompanhada via Core Web Vitals de campo (CrUX, disponível no PageSpeed Insights/Search Console) — não é necessário um APM dedicado para uma landing page deste porte; se o volume de tráfego crescer muito, reavaliar.
- **Não exigir ferramentas pagas se não forem necessárias:** Sentry free tier, UptimeRobot free tier e os logs nativos do Cloudflare Pages cobrem o necessário para o lançamento sem custo adicional.

---

## 49. Testing Strategy

### Funcionais
- [ ] Todos os CTAs levam ao destino correto (`#form`, `#pilares`, `#os`, `/siofi/obrigado`)
- [ ] Formulário completo: submit com sucesso, cada validação de erro, campo condicional aparecendo/desaparecendo corretamente
- [ ] Accordion FAQ abre/fecha, um item por vez ou múltiplos conforme definido no design system
- [ ] Drawer mobile abre/fecha, foco preso, `Esc` fecha
- [ ] Sticky CTA mobile aparece/some nos pontos corretos de scroll

### Tracking
- [ ] Todos os eventos de §22 disparando com os parâmetros corretos (GTM Preview + GA4 DebugView)
- [ ] `lead_submitted` só dispara após resposta 2xx real da API (testar simulando erro 500 — evento NÃO deve disparar)
- [ ] Deduplicação Meta confirmada no Events Manager (Pixel + CAPI casando pelo mesmo `event_id`)
- [ ] Enhanced Conversions do Google Ads recebendo dado hasheado corretamente (ferramenta de diagnóstico do Google Ads)
- [ ] UTMs/click IDs persistindo do primeiro clique até o payload final enviado ao CRM (testar navegando por 2–3 páginas antes de converter)
- [ ] Consent Mode: testar com consentimento negado (nenhuma tag de ads/analytics com dado real dispara) e concedido (tudo dispara)

### SEO
- [ ] Title/description/canonical corretos em cada página (inspecionar HTML renderizado, não só o código-fonte)
- [ ] `robots.txt` e `sitemap.xml` acessíveis e válidos (validador do Search Console)
- [ ] Rich Results Test do Google validando os schemas de §9 sem erros
- [ ] Nenhuma URL com querystring aparecendo como página indexada distinta (checar via `site:` search após algumas semanas)

### Performance
- [ ] Lighthouse mobile e desktop atingindo as metas de §50
- [ ] PageSpeed Insights em produção (field data, quando disponível após volume de tráfego) revisado periodicamente
- [ ] Budget de §11 validado no CI a cada deploy

### Mobile
- [ ] Testado em dispositivos reais (não só emulador): pelo menos 1 Android (Chrome) e 1 iOS (Safari)
- [ ] Nenhuma rolagem horizontal em nenhum viewport de §17
- [ ] Touch targets ≥ 44px verificados manualmente nos componentes críticos (CTA, form, accordion, WhatsApp)

### Navegadores
Ver §51.

### Formulários
Cobertos acima e em §19/§20 — incluir teste de rate limit (disparar > 5 submissões do mesmo IP em 1h e confirmar bloqueio) e teste de honeypot (preencher o campo oculto via ferramenta de dev tools e confirmar que o lead não é gravado nem trackeado).

### Consentimento
- [ ] Banner aparece na primeira visita, não reaparece após escolha (dentro da validade do cookie)
- [ ] Escolha "recusar" realmente impede tags de ads/analytics de carregar com dado real
- [ ] Comportamento correto em navegação anônima/privada (banner aparece novamente, como esperado, pois não há cookie)

---

## 50. Lighthouse Targets

| Categoria | Meta Mobile | Meta Desktop |
|---|---:|---:|
| Performance | ≥ 90 | ≥ 95 |
| Accessibility | ≥ 95 | ≥ 95 |
| Best Practices | ≥ 95 | ≥ 95 |
| SEO | 100 | 100 |

Medido em modo incógnito, throttling padrão do Lighthouse (Slow 4G/mid-tier mobile CPU para mobile; sem throttling adicional além do padrão para desktop), contra a URL de produção (ou preview deployment idêntico a produção) — nunca contra `localhost` sem throttling, que infla os números artificialmente.

---

## 51. PageSpeed Validation

### Procedimento
1. Rodar PageSpeed Insights (`https://pagespeed.web.dev/`) contra a URL de **produção** (`/siofi`), não staging — o Field Data (CrUX) só existe para URLs com tráfego real e público suficiente, então essa validação de campo só fica disponível algumas semanas após o lançamento.
2. Nas primeiras semanas (sem Field Data suficiente), usar apenas o **Lab Data** (mesmo motor do Lighthouse) como proxy, sabendo que é uma simulação, não o comportamento real de usuários.
3. Validar **mobile e desktop separadamente** — as metas de §10/§50 são por dispositivo.
4. **Não otimizar apenas para a pontuação Lighthouse** — usar as métricas de Field Data reais (Core Web Vitals report no Search Console) como fonte de verdade assim que disponíveis; a pontuação de laboratório é um proxy útil no dia 0, não o objetivo final.

---

## 52. Search Console

- **Propriedade:** tipo domínio (verificação via DNS), cobrindo `www` e non-www automaticamente — preferível à propriedade por prefixo de URL.
- **Sitemap:** submetido manualmente após o primeiro deploy de produção; reenviar apenas se a estrutura de URLs mudar significativamente (o Google já revisita sitemaps automaticamente depois).
- **Inspeção de URL:** usar a ferramenta "Testar URL ao vivo" para `/siofi` logo após o lançamento, solicitando indexação manual para acelerar a primeira descoberta (não substitui o crawl orgânico, mas ajuda a antecipar).
- **Cobertura:** monitorar semanalmente nas primeiras 4–6 semanas para garantir que `/siofi` e as variantes indexáveis aparecem como "Válidas" e que `/siofi/obrigado`/staging não aparecem como "Indexadas, embora bloqueadas" (sinal de que o `noindex`/`robots.txt` não está funcionando).
- **Core Web Vitals (relatório):** acompanhar mensalmente — é a fonte de Field Data mais acessível e gratuita.
- **Páginas e queries:** revisar mensalmente quais termos de busca já trazem impressões/cliques para calibrar as futuras variantes de campanha SEO (§4) com dados reais em vez de só suposição.

---

## 53. Tracking Plan

| Evento | Trigger | GA4 | Google Ads | Meta | CRM | Parâmetros |
|---|---|:---:|:---:|:---:|:---:|---|
| `page_view` | Carregamento | ✓ (auto) | — | ✓ (`PageView`) | — | `page_location`, `page_referrer` |
| `form_start` | Foco no 1º campo | ✓ | — | ✓ (custom, opcional) | — | `lead_id`, `form_context` |
| `hero_cta_click` | Clique CTA hero | ✓ | — | — | — | `cta_location`, `cta_label` |
| `demo_cta_click` | Clique CTA "Agendar demonstração" (fora do hero) | ✓ | — | — | — | `cta_location`, `cta_label` |
| `secondary_cta_click` | Clique CTA secundário | ✓ | — | — | — | `cta_location`, `cta_label` |
| `whatsapp_click` | Clique WhatsApp | ✓ (Key Event) | — | ✓ (`Contact`) | — | `click_location` |
| `phone_click` | Clique `tel:` | ✓ | — | — | — | `click_location` |
| `scroll_depth` | 25/50/75/100% | ✓ | — | — | — | `scroll_percentage` |
| `faq_open` | Abrir item FAQ | ✓ | — | — | — | `faq_question` |
| `migration_interest` | Chip "Sim" no form | ✓ | — | — | ✓ (via payload) | `current_system_disclosed` |
| `form_error` | Falha de validação/servidor | ✓ | — | — | — | `error_type` |
| **`lead_submitted`** | API responde 2xx | **✓ (Key Event)** | **✓ (via importação GA4 + Enhanced Conversions)** | **✓ (`Lead`, Pixel + CAPI deduplicado)** | **✓ (payload completo)** | `lead_id`, `business_type`, `employees_range`, `current_system`, `form_context`, `page_variant` |
| `qualified_lead` (futuro) | CRM marca como qualificado | ✓ (via Measurement Protocol, futuro) | — | ✓ (custom, futuro) | (origem) | `lead_id`, `qualification_status` |

---

## 54. UTM Plan

| Campo | Exemplo | Obrigatório | Persistir | CRM |
|---|---|:---:|:---:|:---:|
| `utm_source` | `meta`, `google`, `parceiro` | Sim (mídia paga) | Sim (first e last touch) | Sim |
| `utm_medium` | `paid_social`, `cpc`, `referral` | Sim | Sim | Sim |
| `utm_campaign` | `META_SP_PROSPECTING_DOR_LUCRO_01` | Sim | Sim | Sim |
| `utm_content` | nome do criativo/anúncio | Sim (SHOULD) | Sim | Sim |
| `utm_term` | keyword (Google) / público (Meta) | Sim (Google) / Opcional (Meta) | Sim | Sim |
| `gclid` | auto-tagging do Google Ads | Automático (não manual) | Sim (90 dias) | Sim |
| `gbraid`/`wbraid` | auto-tagging (contextos app/iOS) | Automático | Sim | Sim |
| `fbclid` | auto-tagging do Meta | Automático | Sim (90 dias) | Sim |
| `fbc`/`fbp` | cookies gerados pelo Pixel | Automático | Sim (lidos do cookie) | Sim (para CAPI) |
| `landing_url` | URL completa da primeira visita | Sim | Sim | Sim |
| `referrer` | `document.referrer` | Sim | Sim (first touch) | Sim |

---

## 55. Attribution Diagram

```text
                    ┌─────────────────────┐
                    │   Google / Meta      │
                    │   (clique no anúncio) │
                    └──────────┬───────────┘
                               ▼
                    URL da LP + UTMs + gclid/fbclid
                               ▼
                    ┌─────────────────────┐
                    │   Landing Page       │
                    │   (leitura na carga) │
                    └──────────┬───────────┘
                               ▼
              Cookie de 1ª parte `siofi_attribution`
              (grava first_touch se novo; atualiza last_touch)
                               ▼
                    ┌─────────────────────┐
                    │  Navegação na LP     │
                    │  (eventos client)    │
                    └──────────┬───────────┘
                               ▼
                    Usuário preenche o Form
                               ▼
              Payload = dados do form + cookie de atribuição + lead_id
                               ▼
                    ┌─────────────────────┐
                    │  Edge Function       │
                    │  /api/lead           │
                    └──────────┬───────────┘
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
                  CRM      Meta CAPI   (Enhanced Conversions
              (payload    (event_id =   Google Ads, via GA4
               completo)   lead_id)      import ou API)
                    │          │              │
                    └──────────┴──────┬───────┘
                                      ▼
                    Cliente recebe 2xx → dataLayer.push(lead_submitted)
                                      ▼
                          GTM → GA4 (Key Event) + Google Ads (client tag,
                          se usada em paralelo à importação) + Meta Pixel
                          (mesmo event_id do CAPI → deduplicado)
```

---

## 56. Lead Flow Diagram

```text
Ad (Google/Meta)
   │
   ▼
Landing Page carrega → lê UTMs/click IDs → grava cookie de atribuição
   │
   ▼
Usuário navega, interage (scroll, FAQ) → eventos secundários disparam
   │
   ▼
Usuário clica em CTA → chega ao formulário (#form)
   │
   ▼
Foco no 1º campo → gera lead_id → dispara form_start
   │
   ▼
Preenche e envia (client-side validation)
   │
   ├── Validação falha ────────────────────► form_error (validation) → mensagem inline, usuário corrige
   │
   ▼ (válido)
POST /api/lead { dados + cookie de atribuição + lead_id + consent flags }
   │
   ├── Rate limit excedido ────────────────► 429 → form_error (server) → fallback WhatsApp
   ├── Honeypot acionado ───────────────────► 200 "falso" silencioso → NADA é gravado/trackeado
   ├── Erro de validação server ────────────► 422 → form_error (validation) → mensagem inline
   ├── Timeout/erro de rede ────────────────► form_error (timeout) → retry automático 1x → se falhar de novo, fallback WhatsApp
   │
   ▼ (sucesso)
Edge Function grava lead no CRM (com attribution completa)
   │
   ├── CRM indisponível/erro ───────────────► log interno + (SHOULD) fila de retry assíncrona; response ainda pode ser 200 se o dado foi ao menos enfileirado com segurança — decisão de negócio: nunca perder o lead, mesmo que o CRM esteja fora do ar `[TBD — DEFINIR MECANISMO DE FILA/RETRY, ex. Cloudflare Queues]`
   │
   ▼
Edge Function dispara Meta CAPI (event_id = lead_id) + prepara dado para Enhanced Conversions
   │
   ▼
Resposta 2xx ao cliente { ok: true, lead_id }
   │
   ▼
Cliente dispara dataLayer.push(lead_submitted) → GTM → GA4 Key Event + Meta Pixel (Lead, mesmo event_id) + Google Ads
   │
   ▼
Redirect para /siofi/obrigado (noindex; sem novo evento de conversão, apenas page_view padrão)
   │
   ▼
Time comercial (Sales) contata o lead via CRM
   │
   ▼ (futuro)
CRM marca "qualificado" → dispara qualified_lead (server-to-server, fora do escopo desta LP)
```

---

## 57. SEO Checklist

- [ ] Um único H1 por página, igual à headline aprovada na copy
- [ ] Hierarquia H2/H3 sem saltos, mapeada em §8
- [ ] Title e description únicos, dentro dos limites de caractere (§7)
- [ ] Canonical self-referencing em todas as páginas indexáveis; apontando para `/siofi` nas variantes-espelho
- [ ] `robots.txt` válido, bloqueando `/api/` e `/siofi/obrigado`
- [ ] `sitemap.xml` gerado no build, sem URLs `noindex`
- [ ] Open Graph completo + Twitter Card
- [ ] Schemas `Organization`, `SoftwareApplication`, `FAQPage` validados no Rich Results Test sem erros
- [ ] `alt` descritivo em 100% das imagens de conteúdo; `alt=""` nas decorativas
- [ ] Nenhuma URL com querystring indexada como página distinta
- [ ] `/siofi/obrigado` e staging com `noindex` confirmado (meta tag **e** header `X-Robots-Tag`)
- [ ] Search Console configurado, sitemap submetido, sem erros de cobertura após 2 semanas

## 58. Performance Checklist

- [ ] LCP < 2,0s, INP < 150ms, CLS < 0,05 em campo (após volume suficiente) e em lab
- [ ] Budget de §11 respeitado (verificado no CI)
- [ ] Elemento LCP (H1) não depende de imagem nem de JS para renderizar
- [ ] Imagem do hero com `fetchpriority="high"`, demais com `loading="lazy"`
- [ ] Fontes com `font-display: swap`, preload apenas do peso crítico (Manrope 800)
- [ ] CSS crítico inline; restante via `<link>` normal
- [ ] Zero script síncrono bloqueante no `<head>` além do stub de Consent Mode
- [ ] JS total < 70 KB no carregamento inicial; ilha do formulário com hidratação `client:visible`/`client:idle`
- [ ] Nenhuma biblioteca de animação pesada; motion via CSS
- [ ] Cache-Control correto por tipo de asset (§42)

## 59. Tracking Checklist

- [ ] Todos os eventos da taxonomia (§22) disparando com os parâmetros corretos
- [ ] `lead_submitted` dispara **apenas** após 2xx real da API (testado simulando falha)
- [ ] Meta Pixel + CAPI compartilhando `event_id`, deduplicação confirmada no Events Manager
- [ ] Google Ads recebendo conversão (via importação GA4) com Enhanced Conversions ativo e validado
- [ ] Nenhum PII no dataLayer/GA4/Pixel client-side (auditoria manual das variáveis do GTM)
- [ ] UTMs/click IDs persistindo em cookie de 90 dias e chegando ao CRM em first + last touch
- [ ] Consent Mode: tags de ads/analytics respeitam o estado de consentimento (testado negando e concedindo)
- [ ] Ambiente de staging não contamina contas de produção do GA4/Ads/Meta

## 60. Mobile Checklist

- [ ] CTA principal visível sem scroll em 375×667
- [ ] Nenhuma rolagem horizontal em qualquer viewport ≥ 320px
- [ ] Touch targets ≥ 44×44px em todos os elementos interativos
- [ ] Formulário utilizável com teclado virtual (nenhum campo escondido atrás do teclado sem scroll automático)
- [ ] Sticky CTA aparece/some corretamente
- [ ] Screenshots legíveis nos recortes mobile dedicados
- [ ] Testado em pelo menos 1 dispositivo Android real e 1 iOS real

## 61. Accessibility Checklist

- [ ] Contraste AA em todos os pares de texto/fundo (herdado do design system, §4.4 daquele documento)
- [ ] Navegação completa por teclado (Tab, Shift+Tab, Enter, Esc no drawer/accordion)
- [ ] Foco visível em todos os elementos interativos
- [ ] `aria-expanded`/`aria-controls` no accordion FAQ (ou uso correto de `<details>/<summary>`, que já resolve isso nativamente)
- [ ] Labels associados a todos os inputs (`for`/`id`)
- [ ] Mensagens de erro anunciadas via `aria-live`/`aria-describedby`
- [ ] `prefers-reduced-motion` respeitado em todas as animações
- [ ] `lang="pt-BR"` no `<html>`

## 62. Security Checklist

- [ ] HTTPS forçado em 100% das rotas, HSTS configurado
- [ ] CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options presentes (validado via securityheaders.com ou similar)
- [ ] Rate limiting ativo e testado em `/api/lead`
- [ ] Honeypot + timing check funcionando (testado manualmente)
- [ ] Sanitização de input confirmada (tentativa de injeção de `<script>` em campos de texto não é refletida sem escape em nenhum destino)
- [ ] Secrets (tokens CAPI, CRM API key) nunca expostos no bundle client (auditoria do build final)
- [ ] Validação de `Origin`/`Referer` na Edge Function

## 63. Pre-Launch Checklist

- [ ] Tracking validado ponta a ponta em staging com IDs de teste, depois revalidado em produção com IDs reais antes do primeiro real de mídia
- [ ] Eventos sem duplicação confirmados (GA4 DebugView + Meta Test Events mostrando um evento por submissão real)
- [ ] Formulário real testado com dado real (não apenas dado fake) chegando ao CRM de fato
- [ ] CRM confirmadamente recebendo o payload completo (`lead`, `business`, `attribution`, `technical`)
- [ ] UTMs persistindo corretamente até o submit (teste de navegação multi-página)
- [ ] Google Ads: conversão testada com uma campanha de teste de baixo orçamento antes do lançamento pleno, ou via ferramenta de diagnóstico do Google Ads
- [ ] Meta Pixel Helper (extensão) sem erros/avisos críticos na página
- [ ] Meta Events Manager mostrando `Lead` recebido e deduplicado (Pixel + CAPI)
- [ ] GA4 DebugView validando todos os eventos críticos
- [ ] `robots.txt` e `sitemap.xml` corretos em produção
- [ ] Canonical correto em todas as páginas
- [ ] Página 404 customizada existe e funciona
- [ ] Testado em mobile real (Android + iOS)
- [ ] Lighthouse mobile/desktop dentro das metas de §50
- [ ] PageSpeed Insights rodado contra produção
- [ ] Cookies auditados (categorias, duração, Secure/SameSite corretos)
- [ ] Política de privacidade publicada e linkada no footer e no banner de consentimento
- [ ] Banner de consentimento funcional (aparece, categoriza, persiste escolha)

## 64. Post-Launch 24h Checklist

- [ ] Volume de `page_view` e `lead_submitted` no GA4 condizente com o tráfego real observado (sem zeros suspeitos nem picos anômalos)
- [ ] Nenhum erro 5xx acumulando em `/api/lead` (checar logs)
- [ ] Nenhum alerta de uptime disparado
- [ ] Search Console sem erros de cobertura recém-surgidos
- [ ] Conferir manualmente 2–3 leads reais chegando corretamente ao CRM com attribution completa

## 65. Post-Launch 7d Checklist

- [ ] CPL (custo por lead) por campanha calculável e dentro do esperado (comparar Google Ads/Meta Ads Manager vs. CRM)
- [ ] Taxa de conversão visitante → lead por canal/segmento sem discrepância grosseira entre GA4 e o painel de mídia (se houver diferença > 20–30%, investigar tracking antes de continuar escalando budget)
- [ ] Core Web Vitals de campo começando a aparecer no Search Console (ainda com pouco volume, mas checar tendência)
- [ ] Nenhum erro JavaScript recorrente no Sentry/observabilidade
- [ ] Rate limiting não está bloqueando tráfego legítimo (checar logs de 429 e investigar se algum IP legítimo de grande volume — ex. rede corporativa — está sendo penalizado incorretamente)

## 66. Post-Launch 30d Checklist

- [ ] CPL, % de leads qualificados, comparecimento em demonstração e CAC revisados com o time comercial (métricas de negócio de §30 do design system/copy)
- [ ] Core Web Vitals de campo (CrUX) com volume suficiente para avaliação confiável — ajustar performance se alguma métrica estiver "Precisa melhorar"
- [ ] Revisão de queries no Search Console para informar copy/SEO das próximas variantes de campanha (§4)
- [ ] Auditoria de consentimento: taxa de opt-in/opt-out, ajustar linguagem do banner se a taxa de recusa estiver anormalmente alta (pode indicar banner mal desenhado, não necessariamente comportamento real do usuário)
- [ ] Revisão de attribution: comparar first-touch vs. last-touch para entender se algum canal está sendo subvalorizado no modelo padrão usado pelo time de mídia

---

## 67. Scalability for Future Landing Pages

Arquitetura de conteúdo (Astro Content Collections) que permite criar `/siofi/oficina-mecanica`, `/siofi/auto-center`, `/siofi/ordem-de-servico`, `/siofi/trocar-sistema`, `/siofi/gestao-oficina` sem duplicar componentes:

```
/src/content/landing-pages/
  siofi-main.json          ← /siofi (página base)
  siofi-oficina-mecanica.json
  siofi-auto-center.json
  siofi-ordem-de-servico.json
  siofi-trocar-sistema.json
  siofi-gestao-oficina.json
```

Cada arquivo de config contém:
```json
{
  "slug": "oficina-mecanica",
  "indexable": true,
  "seo": {
    "title": "[TBD]",
    "description": "[TBD]",
    "canonical_override": null
  },
  "content": {
    "hero_headline": "...",
    "hero_subheadline": "...",
    "sections_order": ["hero", "trustbar", "pain", "value_prop", "pillars", "work_order", "financial", "..."],
    "sections_overrides": {
      "pain": { "emphasis": "estoque" }
    }
  },
  "tracking": {
    "page_variant": "siofi_oficina_mecanica",
    "default_utm_campaign_hint": "GOOGLE_SEARCH_SP_SISTEMA_OFICINA"
  },
  "form": {
    "default_context": "final_cta"
  },
  "schema": {
    "software_application": true,
    "faq_page": true
  }
}
```

O template Astro (`[slug].astro` dinâmico, alimentado pela Content Collection) monta a página lendo essa config e renderizando os mesmos componentes (`Hero`, `PainCard`, `FeatureCard`, etc.) do design system — **nenhum componente novo é criado por variante**; apenas o conteúdo e a ordem/ênfase de seções mudam. Isso satisfaz diretamente a exigência do briefing de "permitir headline, copy, screenshots, segmento, campanha e metadata diferentes sem duplicar toda a implementação".

**Regra MUST:** nenhuma variante é publicada com `indexable: true` sem um title/description próprios e conteúdo suficientemente distinto de `/siofi` (mínimo: headline diferente + reordenação ou ênfase de pelo menos 2 seções) — caso contrário, `indexable: false` + `canonical_override` apontando para `/siofi` (ver §4).

---

## 68. Claude Code Implementation Map

```
/src
  /components
    /layout        → Header.astro, Footer.astro, MobileDrawer.astro
    /sections       → Hero.astro, TrustBar.astro, PainSection.astro, ValueProposition.astro,
                       FeaturePillars.astro, WorkOrderSection.astro, FinancialSection.astro,
                       InventorySection.astro, BeforeAfterSection.astro, SegmentsSection.astro,
                       SwitchingSection.astro, SupportSection.astro, TestimonialsSection.astro,
                       FAQSection.astro, FinalCTA.astro
    /ui             → Button.astro, ProductFrame.astro, Callout.astro, Card.astro, Chip.astro,
                       Icon.astro (wrapper de sprite Lucide), WorkOrderTimeline.astro
    /form           → LeadForm.tsx (ilha Preact), FormField.tsx, ChoiceChips.tsx (client:visible)
    /global         → FloatingWhatsApp.astro, StickyMobileCTA.astro (script vanilla)
  /content
    /landing-pages  → siofi-main.json + variantes (§67)
    /copy           → siofi-main.copy.json (texto imutável, extraído literalmente da copy fornecida)
  /lib
    /analytics      → dataLayer.ts (helpers tipados de push por evento, §23), consent.ts (Consent Mode helpers)
    /tracking       → attribution.ts (leitura/escrita do cookie siofi_attribution, first/last touch, §32/§33)
    /validation     → leadSchema.ts (schema de validação compartilhado client+server, ex. Zod)
  /pages
    /siofi
      index.astro           → página principal
      obrigado.astro        → thank-you, noindex
      [slug].astro           → template dinâmico para variantes de §67
    /api
      lead.ts                → Edge Function: valida, sanitiza, rate-limit, honeypot, grava CRM, dispara CAPI, responde
      capi.ts                → (se separado de lead.ts) chamada isolada à Graph API do Meta
  /styles
    tokens.css               → design tokens (copiados/importados do design system, fonte única de verdade)
    global.css                → reset, tipografia base, utilitários mínimos
  /schemas
    organization.json        → JSON-LD estático (§9.1)
    software-application.ts  → gerador de JSON-LD (§9.2), populado por config da página
    faq-page.ts              → gerador de JSON-LD (§9.3), populado pelas perguntas validadas da copy
public/
  /fonts                     → WOFF2 self-hosted (§15)
  /assets/screens            → screenshots AVIF/WebP (§14)
  /assets/logo               → SVGs do logo (§30/§31 do design system)
  robots.txt
  _headers                   → headers HTTP (§41), formato Cloudflare Pages
  _redirects                 → redirects (§4/§45), formato Cloudflare Pages
```

### Responsabilidade por pasta

| Pasta | Responsabilidade | NÃO deve conter |
|---|---|---|
| `/components/sections` | Um componente por seção da copy, consumindo `content/copy` e `content/landing-pages` — puramente apresentacional | Lógica de tracking direta (delega para `/lib/analytics`); texto hardcoded (vem do JSON de copy) |
| `/components/form` | Única parte hidratada da página (ilha Preact) | Chamadas diretas à Graph API do Meta ou ao CRM (isso é responsabilidade do backend em `/pages/api`) |
| `/lib/analytics` | Único ponto de `dataLayer.push` da aplicação — todo componente que precisa disparar um evento importa daqui, nunca escreve `window.dataLayer.push` solto em múltiplos lugares | Lógica de negócio do formulário; chamadas de rede |
| `/lib/tracking` | Leitura/escrita do cookie de atribuição, cálculo de first/last touch | Envio dos dados ao CRM (isso é `/pages/api/lead.ts`) |
| `/pages/api/lead.ts` | Toda a lógica server-side crítica: validação, sanitização, rate limit, honeypot, gravação no CRM, disparo do CAPI, resposta | Nenhuma lógica de apresentação; nenhum secret hardcoded (vem de env vars, §47) |
| `/content` | Fonte única de verdade para texto (copy) e configuração de página (SEO, seções, tracking hints) por variante | Componentes ou lógica — só dados |
| `/styles/tokens.css` | Espelho exato dos tokens do `siofi-landing-visual-design-system.md` | Qualquer valor visual que não venha do design system aprovado |

---

## 69. Acceptance Criteria

```text
MUST
- [ ] Exactly one <h1> per page, matching the approved hero headline
- [ ] Canonical tag present and correct on every page (self-referencing or pointing to /siofi for mirrored variants)
- [ ] sitemap.xml generated at build time, containing only indexable URLs
- [ ] robots.txt valid, blocking /api/ and /siofi/obrigado
- [ ] LCP element (H1) is not lazy-loaded and does not depend on JS to render
- [ ] Hero image uses fetchpriority="high"; all other images use loading="lazy"
- [ ] No image renders without explicit width/height (or aspect-ratio), zero CLS from images
- [ ] GTM container loads without blocking the critical rendering path
- [ ] GA4 receives page_view on every page load (verified in DebugView)
- [ ] GA4 receives all events from the taxonomy in §22 with correct parameters
- [ ] Meta Pixel receives PageView on load
- [ ] lead_submitted fires only after a real 2xx response from /api/lead — never on button click alone
- [ ] Pixel and CAPI share the same event_id (lead_id) and are confirmed deduplicated in Meta Events Manager
- [ ] Google Ads conversion (via GA4 import) fires correctly and Enhanced Conversions data is validated
- [ ] UTMs and click IDs (gclid, gbraid, wbraid, fbclid) persist in a first-party cookie for 90 days and reach the CRM payload (first_touch and last_touch)
- [ ] CRM receives the full payload structure defined in §34, including attribution fields
- [ ] No PII (name, company, WhatsApp, free-text city, free-text current system) is ever sent to dataLayer, GA4, Meta Pixel, or Google Ads client-side
- [ ] Staging traffic never mixes with production GA4/Google Ads/Meta accounts (staging uses noindex + separate GA4 stream/filter, no ads tags fire)
- [ ] Mobile viewport has zero horizontal overflow at any width ≥ 320px
- [ ] All text/background pairs meet WCAG AA contrast (inherited from the visual design system)
- [ ] Rate limiting and honeypot are active and verified on /api/lead
- [ ] No secret (CAPI token, CRM API key) is present in client-side bundles
- [ ] HTTPS enforced site-wide with HSTS; security headers (CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options) present and validated
- [ ] Consent Mode v2 implemented: ad_storage/ad_user_data/ad_personalization/analytics_storage default to denied, tags respect the user's actual choice
- [ ] Thank-you page (/siofi/obrigado) exists, is noindex, and does not re-fire the conversion event on reload/direct access
- [ ] Lighthouse mobile Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100 on the production build

SHOULD
- [ ] Enhanced Conversions for Leads sends hashed phone data server-side
- [ ] Sentry (or equivalent) capturing client-side JS errors at a reasonable sample rate
- [ ] Uptime monitor configured and alerting
- [ ] Bing Webmaster Tools verified via GSC import
- [ ] Performance budget (§11) enforced automatically in CI
- [ ] Content Collection architecture in place so a new campaign variant can be created by adding one config file, without duplicating components
- [ ] Failed CRM delivery is queued/retried rather than silently dropped (mechanism TBD with F5)

OPTIONAL
- [ ] CAPTCHA (Cloudflare Turnstile) added only if spam volume after launch justifies it
- [ ] qualified_lead event wired from CRM back to GA4/Meta once the CRM is defined
- [ ] Container query usage in FeatureCard/TestimonialCard if a future campaign variant requires context-based sizing
- [ ] manifest.webmanifest for "add to home screen" affordance
```

---

**Nota final:** todo item marcado `[TBD — ...]` neste documento (domínio canônico, telefone/e-mail da F5, CRM escolhido, IDs de conta GTM/GA4/Meta/Google Ads, valor monetário por lead, mecanismo de fila para falha de CRM) é uma decisão de negócio ou credencial que precisa ser fornecida pela F5 antes da implementação final desses pontos específicos — o restante da especificação é executável imediatamente pelo Claude Code.
