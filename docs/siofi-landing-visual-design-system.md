# SiOfi Landing Page — Visual Design System

**Versão:** 1.0 · **Data:** 25/08/2026 · **Uso:** documento de implementação para Claude Code · **Insumos:** logotipo SiOfi (símbolo + wordmark), apresentação comercial F5 (apressiofi_dig.pdf), copy estruturada (`siofi_landing_page_copy_claude_code.md`), pesquisa de público (`pesquisa_publico_siofi.md`).

**Regra de leitura:** tudo que está entre colchetes `[TBD — FORNECER DADO REAL]` não deve ser inventado na implementação. A copy é a fonte de verdade para textos; este documento define apenas a forma.

---

## 1. Executive Visual Direction

**Conceito:** *"Clareza sobre a operação."* A página deve parecer o painel de um gestor que finalmente enxerga a oficina inteira — não um site de oficina, não um SaaS genérico.

**Decisões-chave (resumo para quem implementa):**

1. **Fundo claro dominante, azul institucional como cor de ação e de estrutura, cinza-grafite do wordmark como cor de texto.** Proporção: 72% neutros claros · 18% azul (CTA, ícones, highlights, 2 seções escuras) · 7% grafite/cinza escuro (headings, texto) · 3% azul-claro do símbolo (acentos suaves). Sem accent adicional.
2. **Duas famílias tipográficas do Google Fonts:** `Manrope` (display/headings, peso 700–800) e `Inter` (corpo, UI, formulários). Ambas humanistas-geométricas, sem aparência sci-fi.
3. **Screenshots reais do SiOfi são a prova do produto.** Apresentados em "product frame" próprio (janela neutra, borda 1px, sombra suave, recorte por funcionalidade). Nunca em perspectiva 3D, nunca como decoração.
4. **Uma família de ícones:** Lucide, outline, stroke 1.75, dentro de container 44px com fundo `primary-light`.
5. **Layout editorial > grade de cards.** Apenas 4 seções usam cards (dores, pilares, segmentos, depoimentos). As demais são split layouts (texto + screenshot) ou blocos de largura total.
6. **Ritmo vertical respirado:** seções com `padding-block` 112px desktop / 72px mobile; alternância clara entre branco, neutral-50 e duas seções azul-profundo (financeiro e CTA final).
7. **Mobile desenhado à parte:** hero com screenshot abaixo do CTA, tabela Antes×Depois vira cards pareados, CTA sticky inferior após 60% de scroll, WhatsApp flutuante discreto.
8. **Elementos gráficos derivados do símbolo (hexágono facetado) aparecem no máximo 3 vezes na página**, sempre como fundo sutil, nunca como ícone.
9. **Motion mínimo:** fade-up de 16px em 320ms com `cubic-bezier(0.2, 0.8, 0.2, 1)`, respeitando `prefers-reduced-motion`.
10. **Nada inventado:** logos, números, depoimentos e promessas de migração/fiscal dependem de dados fornecidos pela F5 (ver §29.1).

**Alerta de direção de arte (crítico):** as capturas de tela presentes na apresentação atual mostram uma interface desktop Windows de geração anterior (janelas cinza, barras de ferramentas clássicas). A copy pede "evitar estética de ERP antigo" e a pesquisa mostra que o público compara o SiOfi com concorrentes em nuvem. Isso é o maior risco visual da página. A mitigação está no §15: recapturas em alta resolução, recorte por funcionalidade, moldura própria, callouts sobre a tela e proporção reduzida da janela original dentro do enquadramento. Se a F5 tiver uma versão atualizada da interface, ela deve ser usada. Se não tiver, a página deve mostrar **resultado** (relatórios, DRE, gráficos) mais do que **formulários** (cadastros).

---

## 2. Logo Analysis

### 2.1 Estrutura
- **Lockup horizontal:** símbolo à esquerda + wordmark "SiOfi" à direita. Proporção aproximada símbolo : wordmark = 1 : 2,6 em largura. Altura do símbolo ≈ 1,1× a altura das capitais do wordmark.
- **Símbolo:** hexágono regular (ponta para cima) construído como cubo isométrico facetado em 4–5 tons de azul, com um losango central mais escuro (#1257B8 aprox.) que sugere um "núcleo" ou "módulo central". Leitura: caixa/cubo = sistema, estrutura, integração; facetas = módulos conectados.
- **Wordmark:** "Si" em azul (gradiente sutil de #1B75DB para #0F5FC6) e "Ofi" em cinza-grafite (gradiente de #5C6470 para #3B424C). Tipografia geométrica de peso bold, cantos levemente arredondados, "i" com ponto quadrado arredondado, "O" com contraforma quase retangular. Sem serifa; largura ampla.

### 2.2 Geometria e proporções
- Módulo base: altura da capital "S" = 1u. Símbolo ≈ 1,15u de altura. Espaço símbolo–wordmark ≈ 0,35u. Altura total do lockup ≈ 1,2u; largura ≈ 4,3u.
- Área de proteção recomendada: 0,5u em todos os lados (metade da altura da capital).
- Tamanho mínimo digital: lockup 120px de largura; símbolo isolado 24px.

### 2.3 Cores extraídas (aproximação a partir da imagem fornecida; substituir pelos valores do arquivo vetorial oficial quando disponível — `[TBD — FORNECER SVG OFICIAL]`)

| Elemento | HEX | RGB | HSL |
|---|---|---|---|
| Faceta superior clara | #8CCBF5 | 140, 203, 245 | 204°, 84%, 75% |
| Faceta média | #3D9BE9 | 61, 155, 233 | 207°, 80%, 58% |
| Azul principal (wordmark "Si", faceta frontal) | #1B75DB | 27, 117, 219 | 212°, 78%, 48% |
| Núcleo escuro do símbolo | #1257B8 | 18, 87, 184 | 215°, 82%, 40% |
| Grafite claro ("Ofi" topo) | #5C6470 | 92, 100, 112 | 216°, 10%, 40% |
| Grafite escuro ("Ofi" base) | #3B424C | 59, 66, 76 | 215°, 13%, 26% |

### 2.4 Contraste e personalidade
- Contraste interno alto entre azul saturado e grafite neutro: transmite **tecnologia (azul) + solidez/gestão (grafite)**. É exatamente o equilíbrio 70/30 pedido, já embutido na marca.
- Nível de modernidade: médio-alto. O símbolo facetado e os gradientes sutis são atuais; o wordmark bold e largo dá presença e "peso de software instalado" — bom para B2B, ruim se exagerado.
- Força visual: alta em tamanhos grandes; em tamanhos pequenos as facetas do símbolo se perdem e o gradiente do wordmark vira ruído.

### 2.5 Problemas de aplicação digital
1. **Gradientes no wordmark** não escalam bem abaixo de 32px de altura e complicam versões monocromáticas. Solução: versão flat (azul #1B75DB + grafite #3B424C) para header, footer e favicon.
2. **Símbolo com 5 tons** perde definição em 24–32px. Solução: versão simplificada com 3 facetas para favicon/app icon `[TBD — FORNECER]`.
3. **Sem versão negativa** no material. Necessária para as duas seções escuras e footer: wordmark inteiro em branco, símbolo mantendo as facetas azuis (funcionam sobre azul-profundo #0B3D82).
4. A imagem fornecida é raster com bordas de recorte visíveis. Exige SVG.

### 2.6 Decisões

**Preservar:** hexágono facetado exatamente como está; dualidade cromática azul/grafite do wordmark; proporções do lockup; sensação de "sistema estruturado".

**Orientar a interface:** azul #1B75DB → cor institucional (ícones, símbolo, highlights); grafite #3B424C/#1F2933 → cor de headings; facetas claras (#8CCBF5) → superfícies suaves e um único padrão de fundo derivado do hexágono; cantos levemente arredondados do wordmark → radius médio (8–12px) em vez de pílulas.

**NÃO repetir excessivamente:** o hexágono como ícone de lista, bullets ou padrão de fundo em todas as seções; gradientes azuis em botões e cards; cubo isométrico como ilustração 3D; o símbolo como marca d'água gigante.

**Sensação atual:** software sólido, técnico, um pouco "de instalação local" — confiável, mas pode parecer datado se cercado por interface antiga.

**Sensação a reforçar:** clareza, controle, proximidade. A página deve fazer a marca parecer **atual e leve** através de espaço, tipografia moderna e telas bem recortadas — não através de efeitos.

---

## 3. Brand Personality

| Atributo | Como aparece visualmente | Como NÃO aparece |
|---|---|---|
| Tecnologia (35%) | Screenshots reais, ícones outline precisos, azul institucional, grid rigoroso | Dashboards futuristas, neon, glassmorphism, partículas |
| Gestão (35%) | Headings em grafite, números em tabular figures, DRE/indicadores em destaque, seção financeira escura e sóbria | Gráficos decorativos sem dado real, "métricas" inventadas |
| Controle / Confiança (15%) | Bordas 1px definidas, sombras discretas, hierarquia consistente, seções de suporte e troca de sistema com fotos reais da F5 | Selos falsos, badges de prêmio, contadores animados |
| Simplicidade (10%) | Máximo 3 cores por seção, 1 CTA principal por dobra, texto em colunas ≤ 60 caracteres | Cards em todas as seções, ícones em todos os parágrafos |
| Proximidade / universo automotivo (5–30% de "tempero") | Fotos reais de oficinas clientes e equipe F5 em 2 seções (suporte, prova social), termos da copy, timeline da OS com o veículo como objeto central | Foto de mecânico sorrindo no hero, pneus, faíscas, tuning, vermelho/preto de autopeças |

**Referências de tom (para calibrar, não copiar):** páginas de produto de softwares de gestão B2B com fundo claro e screenshot dominante — o que importa é a combinação "screenshot legível + texto curto + muito espaço", não um estilo específico.

---

## 4. Color System

### 4.1 Paleta

| Token | HEX | Origem | Uso principal |
|---|---|---|---|
| `brand-blue` | #1B75DB | wordmark "Si" | Ícones, símbolo, elementos gráficos grandes, highlights (não usar em texto pequeno sobre branco: 4,55:1) |
| `primary` | #1565C0 | brand-blue escurecido 8% | CTAs, links, foco, texto de destaque (5,75:1 sobre branco) |
| `primary-dark` | #0F4FA8 | derivada | Hover de CTA, headings de destaque em fundos claros, ícones sobre `primary-light` (7,77:1) |
| `primary-deep` | #0B3D82 | derivada do núcleo do símbolo | Fundo das 2 seções escuras e footer (texto branco 10,48:1) |
| `primary-light` | #E8F2FC | faceta clara dessaturada | Containers de ícone, badges, fundo de destaque suave, hover de linha |
| `primary-soft` | #8CCBF5 | faceta clara do símbolo | Acentos sobre `primary-deep` (eyebrows, ícones em seção escura: 5,98:1), padrão hexagonal de fundo |
| `secondary` | #4A5563 | grafite do wordmark | Texto secundário, ícones neutros, labels (7,58:1) |
| `neutral-50` | #F7F9FC | — | Background de seções alternadas |
| `neutral-100` | #F1F4F8 | — | Surface secundária, fundo de inputs desabilitados, trilha do accordion |
| `neutral-200` | #E3E8EF | — | Borders padrão, divisores |
| `neutral-300` | #CBD2DC | — | Borders de inputs, borda de screenshots |
| `neutral-500` | #6B7280 | — | Texto auxiliar (small, captions) — mínimo permitido sobre branco (4,83:1) |
| `neutral-700` | #4A5563 | = secondary | Body text secundário |
| `neutral-900` | #1F2933 | grafite escuro do wordmark aprofundado | Texto principal, headings (14,76:1) |
| `white` | #FFFFFF | — | Background principal, cards, texto sobre escuro |
| `success` | #1E8E5A | funcional | Validação de formulário |
| `error` | #C8342B | funcional | Erros de formulário |
| `whatsapp` | #25D366 | funcional (apenas ícone) | Ícone do botão flutuante; o fundo do botão é `primary-deep`, não verde |

**Accent:** não há. O azul-claro do símbolo cumpre o papel de acento suave. Introduzir laranja/verde "para chamar atenção" quebraria o 70/30.

### 4.2 Regras de uso

| Elemento | Cor | Observação |
|---|---|---|
| Background principal | `white` | Hero, pilares, OS, estoque, segmentos, FAQ |
| Sections alternadas | `neutral-50` | Dores, Antes×Depois, suporte, prova social |
| Sections de destaque (2) | `primary-deep` | Financeiro e resultados; CTA final |
| Cards | `white` sobre `neutral-50`; `neutral-50` sobre `white` | Sempre inverter em relação ao fundo da seção; border 1px `neutral-200` |
| Headings (H1–H3) | `neutral-900` | Em seções escuras: `white` |
| Body | `neutral-700` | Em seções escuras: `#DCE6F5` (branco 85%) |
| Small/captions | `neutral-500` | Nunca mais claro que isso |
| Links inline | `primary`, underline 1px offset 3px | Hover: `primary-dark` |
| CTA primário | bg `primary`, texto `white` | Hover `primary-dark`; active `primary-deep` |
| CTA secundário | bg transparente, border 1.5px `primary`, texto `primary` | Hover: bg `primary-light` |
| Focus (todos) | outline 3px `#8CCBF5` + offset 2px; em fundo escuro outline `white` | Nunca remover outline |
| Borders | `neutral-200` (cards, divisores) / `neutral-300` (inputs, screenshots) | 1px |
| Ícones | `primary-dark` dentro de container `primary-light`; sem container: `secondary` | Em seção escura: `primary-soft` |
| Badges/eyebrow | texto `primary-dark` sobre `primary-light`, ou texto `primary` sem fundo com letter-spacing | Em seção escura: `primary-soft` |
| Highlights de texto | `primary` (peso 700), nunca fundo amarelo | — |
| Elementos gráficos | padrão hexagonal em `primary-soft` a 12% de opacidade sobre claro; `white` a 6% sobre escuro | Máximo 3 ocorrências |
| Screenshots | moldura `white`, border `neutral-300`, sombra `shadow-md`; fundo de apoio `primary-light` ou `neutral-100` | — |
| Footer | bg `primary-deep`; texto `#DCE6F5`; links `white`; divisor `rgba(255,255,255,0.12)` | — |

### 4.3 Proporção final
**72% neutros claros · 18% azul (primary/deep/light) · 7% grafite (texto) · 3% azul-claro.** O azul-profundo aparece em exatamente três blocos (financeiro, CTA final, footer) — isso cria o ritmo "claro → claro → escuro" que dá peso às conclusões.

### 4.4 Contraste (WCAG AA) — pares validados

| Par | Razão | Status |
|---|---|---|
| `neutral-900` sobre `white` | 14,76:1 | AAA |
| `neutral-700` sobre `white` | 7,58:1 | AAA |
| `neutral-500` sobre `white` | 4,83:1 | AA (texto normal) |
| `primary` sobre `white` | 5,75:1 | AA |
| `white` sobre `primary` (CTA) | 5,75:1 | AA |
| `white` sobre `primary-dark` (hover) | 7,77:1 | AAA |
| `white` sobre `primary-deep` | 10,48:1 | AAA |
| `primary-soft` sobre `primary-deep` | 5,98:1 | AA |
| `primary-dark` sobre `primary-light` | 6,86:1 | AA |
| `primary` sobre `neutral-50` | 5,35:1 | AA |
| `brand-blue` sobre `white` | 4,55:1 | AA apenas para texto ≥ 18,66px bold ou ≥ 24px; usar só em ícones/gráficos |

Proibido: texto em `neutral-300` ou mais claro; texto `brand-blue` em 14–16px; placeholders mais claros que `neutral-500`.

---

## 5. Typography

### 5.1 Famílias
- **Display / headings:** `Manrope` (Google Fonts), pesos 700 e 800. Geométrica com toques humanistas, contraforma aberta, ótima em tamanhos grandes, compatível com o wordmark sem imitá-lo.
- **Body / UI:** `Inter` (Google Fonts), pesos 400, 500, 600. Excelente legibilidade em 15–17px, `font-feature-settings: "tnum"` para números em tabelas e métricas.
- **Fallback:** `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.
- **Loading:** `<link rel="preconnect">` para fonts.googleapis.com e fonts.gstatic.com; `display=swap`; carregar apenas Manrope 700/800 e Inter 400/500/600 (subset latin). Peso total alvo < 120 KB.

Evitados deliberadamente: Orbitron/Exo (sci-fi), Montserrat (genérica), Bebas/Oswald (condensadas automotivas), Poppins (infantil).

### 5.2 Sistema tipográfico

| Estilo | Família | Peso | Desktop (≥1280) | Tablet (768–1279) | Mobile (<768) | Line-height | Letter-spacing | Max-width |
|---|---|---|---|---|---|---|---|---|
| Display / Hero H1 | Manrope | 800 | 56px | 44px | 34px | 1.08 | -0.02em | 14ch (≈ 640px) |
| H1 (= Display) | Manrope | 800 | 56px | 44px | 34px | 1.08 | -0.02em | 640px |
| H2 (seção) | Manrope | 800 | 40px | 34px | 28px | 1.15 | -0.015em | 18ch (≈ 720px) |
| H3 (card, pilar) | Manrope | 700 | 22px | 20px | 19px | 1.3 | -0.005em | 32ch |
| Subheadline (hero, seção) | Inter | 400 | 20px | 18px | 17px | 1.55 | 0 | 56ch (≈ 560px) |
| Body Large | Inter | 400 | 18px | 17px | 16px | 1.6 | 0 | 62ch |
| Body | Inter | 400 | 16px | 16px | 16px | 1.6 | 0 | 62ch |
| Small | Inter | 400 | 14px | 14px | 14px | 1.5 | 0 | — |
| Eyebrow / Overline | Inter | 600 | 13px | 13px | 12px | 1.2 | +0.08em, uppercase | — |
| Button Label | Inter | 600 | 16px | 16px | 16px | 1 | +0.01em | — |
| Form Label | Inter | 500 | 14px | 14px | 14px | 1.3 | 0 | — |
| Navigation | Inter | 500 | 15px | 15px | 17px (menu mobile) | 1 | 0 | — |
| Metric (número grande) | Manrope | 800 | 40px | 34px | 30px | 1 | -0.02em, `tnum` | — |
| Timeline step label | Inter | 600 | 15px | 15px | 15px | 1.3 | 0 | — |

Cor por estilo: headings `neutral-900`; subheadline e body `neutral-700`; small `neutral-500`; eyebrow `primary`; button `white`/`primary`; labels `neutral-900`.

### 5.3 Escala fluida (clamp)
```css
--text-xs:   0.8125rem;                                  /* 13px */
--text-sm:   0.875rem;                                   /* 14px */
--text-base: 1rem;                                       /* 16px */
--text-md:   clamp(1rem, 0.95rem + 0.25vw, 1.125rem);    /* 16–18px */
--text-lg:   clamp(1.0625rem, 1rem + 0.35vw, 1.25rem);   /* 17–20px */
--text-xl:   clamp(1.1875rem, 1.1rem + 0.4vw, 1.375rem); /* 19–22px */
--text-2xl:  clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);     /* 28–40px */
--text-3xl:  clamp(2.125rem, 1.6rem + 2.4vw, 3.5rem);    /* 34–56px */
--text-metric: clamp(1.875rem, 1.5rem + 1.6vw, 2.5rem);  /* 30–40px */
```

### 5.4 Hierarquia visual (contraste entre níveis)
- H1 : subheadline = 2,8:1 em tamanho e 800:400 em peso — a headline domina sem depender de cor.
- H2 : body = 2,5:1. Cada H2 é precedido de eyebrow (13px, uppercase, `primary`) com `margin-bottom: 12px` e seguido de intro (Body Large) com `margin-top: 16px`.
- H3 dentro de cards: 22px/700, `margin-bottom: 8px`; texto 16px/400.
- Agrupamento: eyebrow + H2 + intro formam um `SectionHeader` sempre alinhado à esquerda em split layouts e centralizado (max-width 720px) em seções de grade.
- Ordem de dominância na página: (1) H1, (2) CTA primário, (3) screenshot do hero, (4) H2 das seções, (5) screenshots das seções, (6) cards/timeline, (7) prova social, (8) CTA final (recupera dominância pelo fundo escuro).

---

## 6. Grid

| Viewport | Container max-width | Colunas | Gutter | Padding lateral |
|---|---|---|---|---|
| Desktop ≥ 1280 | 1200px (conteúdo) / 1440px (hero e seções escuras com fundo full-bleed) | 12 | 24px | 32px |
| Laptop 1024–1279 | 100% – 64px | 12 | 24px | 32px |
| Tablet 768–1023 | 100% – 48px | 8 | 20px | 24px |
| Mobile < 768 | 100% – 40px | 4 | 16px | 20px |

Regras:
- Texto corrido nunca ocupa mais de 7 colunas desktop (≈ 690px).
- Split layouts: 5 col texto + 7 col screenshot (ou 6/6 quando o screenshot é vertical). Gap entre as duas metades: 64px desktop, 40px tablet; empilha no mobile.
- Grades de cards: 4 col (dores, desktop) → 2 col (tablet) → 1 col (mobile); pilares 3 col → 2 → 1; segmentos 5 col → 3 (+2 centralizados) → carrossel horizontal com scroll-snap no mobile.
- Container central para SectionHeader centralizado: 720px.

---

## 7. Spacing

Escala base 4px:
```
--space-1: 4px   --space-2: 8px   --space-3: 12px  --space-4: 16px
--space-5: 20px  --space-6: 24px  --space-8: 32px  --space-10: 40px
--space-12: 48px --space-16: 64px --space-20: 80px --space-24: 96px
--space-28: 112px --space-32: 128px
```

| Aplicação | Desktop | Tablet | Mobile |
|---|---|---|---|
| Section padding-block | 112px | 88px | 72px |
| Hero padding-block | 96px top / 80px bottom | 72 / 64 | 48 / 56 |
| Seções escuras padding-block | 112px | 88px | 72px |
| SectionHeader → conteúdo | 56px | 48px | 40px |
| Entre cards (gap) | 24px | 20px | 16px |
| Card padding | 32px | 28px | 24px |
| Feature card padding | 32px 32px 36px | 28px | 24px |
| Testimonial card padding | 32px | 28px | 24px |
| Entre parágrafos | 16px | 16px | 16px |
| H2 → intro | 16px | 16px | 12px |
| Eyebrow → H2 | 12px | 12px | 10px |
| Intro → CTA | 32px | 28px | 24px |
| CTA primário ↔ secundário (gap) | 16px | 16px | 12px (empilhados) |
| Lista de recursos (gap entre itens) | 10px | 10px | 10px |
| Form field gap | 20px | 20px | 16px |
| Footer padding-block | 64px top / 32px bottom | 56/32 | 48/24 |
| Header altura | 72px | 68px | 64px |

### 7.1 Ritmo vertical
Sequência de "peso" das seções (altura aproximada desktop): Hero 640–720px → TrustBar 96px → Dores 560px → Virada 360px (texto centralizado, sem imagem) → Pilares 720px → OS 640px → Financeiro (escuro) 720px → Estoque 560px → Antes×Depois 520px → Segmentos 480px → Troca 480px → Suporte 560px → Prova 560px → FAQ 640px → CTA final (escuro) 640px → Footer 280px. Total ≈ 8.400–9.000px desktop; ≈ 11.000px mobile. Blocos leves (Virada, TrustBar, Segmentos) funcionam como pausas entre blocos densos.

---

## 8. Border Radius

```
--radius-xs: 4px    (badges, chips, tags)
--radius-sm: 6px    (inputs, botões, itens de accordion)
--radius-md: 10px   (cards, testimonial, containers de ícone)
--radius-lg: 14px   (product frame de screenshots, blocos de destaque)
--radius-xl: 20px   (apenas o bloco do formulário no CTA final e o painel do hero mobile)
--radius-full: 999px (botão flutuante WhatsApp, avatar)
```
Botões usam `radius-sm` (6px) — cantos suaves, não pílula: preserva a leitura B2B e ecoa os cantos do wordmark. Modais/drawer mobile: `radius-lg` no topo.

---

## 9. Shadows

```
--shadow-xs: 0 1px 2px rgba(15, 35, 70, 0.06);
--shadow-sm: 0 2px 6px rgba(15, 35, 70, 0.08);
--shadow-md: 0 8px 24px -8px rgba(15, 35, 70, 0.18), 0 2px 6px rgba(15, 35, 70, 0.06);
--shadow-lg: 0 24px 48px -16px rgba(15, 35, 70, 0.24), 0 4px 12px rgba(15, 35, 70, 0.08);
```
Uso: `xs` em inputs (inset none, apenas border) e header sticky após scroll; `sm` em cards hover; `md` em product frames e testimonial em destaque; `lg` apenas no screenshot do hero. Cards em repouso: sem sombra, só border. A sombra usa azul-escuro dessaturado, nunca preto puro.

---

## 10. Iconography

- **Biblioteca única:** Lucide (ISC, SVG inline ou sprite). Estilo outline. `stroke-width: 1.75` (não 2 — mais leve, combina com Inter). `stroke-linecap: round`.
- **Tamanhos:** 20px (inline, lista de recursos, nav), 24px (cards, timeline), 28px (pilares, apenas dentro de container).
- **Container:** 44×44px, `radius-md`, bg `primary-light`, ícone 24px em `primary-dark`. Em seção escura: container `rgba(255,255,255,0.08)`, ícone `primary-soft`.
- **Sem container:** ícone 20px em `secondary`, alinhado ao topo do texto com `margin-top: 2px` — usado em listas de recursos e no footer.
- Posição em cards: canto superior esquerdo, `margin-bottom: 20px`, nunca centralizado acima do título (evita aparência de template).

### 10.1 Linguagem e mapa de ícones

| Conceito | Ícone Lucide | Uso |
|---|---|---|
| Ordem de serviço / oficina | `clipboard-list` | Pilar 1, timeline OS |
| Cliente | `user-round` | Timeline OS, lista |
| Veículo | `car-front` | Timeline OS (única ocorrência de carro na página, além de fotos) |
| Orçamento | `file-text` | Timeline OS |
| Peças / estoque | `package` | Pilar 4, seção estoque, dores |
| Técnico / produtividade | `wrench` — **uso único**, apenas na timeline OS; na seção de produtividade usar `gauge` | — |
| Financeiro | `wallet` | Pilar 2 |
| Contas a pagar/receber | `arrow-down-left` / `arrow-up-right` | Financeiro (escuro) |
| Fluxo de caixa | `trending-up` | Financeiro |
| Boletos / cobrança | `receipt` | Financeiro |
| DRE / indicadores / gestão | `bar-chart-3` | Pilar 3, financeiro |
| Relatórios | `file-bar-chart` | Pilar 3 |
| Compras | `shopping-cart` | Pilar 5 |
| Fiscal / NF-e | `file-check-2` | Pilar 6 |
| XML | `file-code-2` | Estoque |
| Integração / conexão | `link-2` ou `git-merge` | Virada, Antes×Depois |
| Dependência do dono | `user-round-cog` | Dores (card 4) |
| Informação espalhada | `layers` | Dores (card 2) |
| Pouca clareza | `eye-off` → após virada `eye` | Dores (card 1) / Antes×Depois |
| Suporte / atendimento | `headset` | Suporte |
| Telefone | `phone` | Suporte, footer |
| E-mail | `mail` | Suporte, footer |
| Ticket | `ticket` | Suporte |
| Acesso remoto | `monitor-smartphone` ou `screen-share` | Suporte |
| Segurança / confiança | `shield-check` | Troca de sistema |
| Migração | `arrow-right-left` | Troca de sistema |
| Acompanhamento | `route` | Troca de sistema |
| Demonstração / ver funcionando | `play-circle` | CTAs secundários |
| Check (listas, antes×depois) | `check` (em círculo `primary-light`) | — |
| Antes (negativo) | `minus` em círculo `neutral-100` | Antes×Depois |
| Segmentos: oficina / auto center / centro automotivo / autoelétrica / funilaria | `wrench` NÃO. Usar: `clipboard-list` / `store` / `building-2` / `zap` / `paintbrush` | Segmentos |
| WhatsApp | ícone oficial WhatsApp (SVG simple-icons) | Botão flutuante |
| Localização | `map-pin` | Footer, prova social (cidade) |
| FAQ chevron | `chevron-down` | Accordion |

Proibido: `settings` (engrenagem) em qualquer lugar; `car` em mais de um ponto; ícones preenchidos misturados com outline.

---

## 11. Buttons

| Propriedade | Primary | Secondary | Ghost/Text | WhatsApp (flutuante) |
|---|---|---|---|---|
| Altura | 52px (desktop) / 52px (mobile) | 52px | 44px | 56px |
| Padding | 0 28px | 0 26px | 0 8px | 0 20px (expandido) / 0 (círculo) |
| Radius | 6px | 6px | 6px | 999px |
| Font | Inter 600 16px, +0.01em | idem | Inter 600 15px | Inter 600 15px |
| Background | `primary` | transparent | transparent | `primary-deep` |
| Border | none | 1.5px `primary` | none | none |
| Texto | `white` | `primary` | `primary` | `white` + ícone WhatsApp `#25D366` |
| Ícone | opcional à direita, 20px, `arrow-right` | opcional à esquerda `play-circle` | seta à direita | ícone WhatsApp 24px |
| Hover | bg `primary-dark`; translateY(-1px); shadow-sm | bg `primary-light` | underline | bg `#082E63`; expande label |
| Focus-visible | outline 3px `primary-soft`, offset 2px | idem | idem | outline 3px `white` |
| Active | bg `primary-deep`; translateY(0) | bg `#D6E7F9` | — | scale(0.98) |
| Disabled | bg `neutral-300`, texto `white`, cursor not-allowed | border `neutral-300`, texto `neutral-500` | — | — |
| Loading | spinner 18px `white` à esquerda + label "Enviando…" | — | — | — |
| Mobile | full-width (100%) quando dentro de hero/form; auto em inline | full-width empilhado abaixo do primário | — | círculo 56px, bottom 88px (acima do sticky CTA), right 16px |
| Transição | 160ms ease-out (bg, transform, shadow) | idem | idem | 200ms |

Em fundo escuro (financeiro, CTA final): Primary mantém `primary` bg (contraste 5,75 sobre branco do texto; sobre o fundo `primary-deep` o botão se destaca por ser mais claro); Secondary vira border `white` 1.5px + texto `white`, hover bg `rgba(255,255,255,0.10)`.

### 11.1 Diferenciação dos CTAs
- **Principal ("Agendar uma demonstração" / "Quero agendar uma demonstração"):** único botão sólido azul por dobra. Aparece em: header, hero, virada, OS ("Ver o SiOfi funcionando" — variante secundária), financeiro, troca de sistema, suporte ("Falar com a equipe" — secundária), CTA final, sticky mobile.
- **Secundário ("Conhecer o SiOfi"):** outline; rola suavemente para #pilares.
- **WhatsApp:** só o botão flutuante e um link textual no footer. Nunca um botão verde grande no meio da página.
- **Links textuais:** azul `primary` sublinhado; usados apenas em FAQ, footer e microcopy.

---

## 12. Forms

| Propriedade | Valor |
|---|---|
| Input altura | 52px |
| Input padding | 0 16px |
| Radius | 6px |
| Border | 1px `neutral-300`; hover `neutral-500` |
| Background | `white` (sobre bloco de formulário branco); na seção escura o formulário fica dentro de um card branco, inputs permanecem brancos |
| Font | Inter 400 16px `neutral-900` (16px evita zoom no iOS) |
| Placeholder | `neutral-500`, texto exemplo curto ("(16) 99999-9999") |
| Label | Inter 500 14px `neutral-900`, `margin-bottom: 6px`, sempre visível acima (nunca floating) |
| Focus | border `primary` 1px + box-shadow `0 0 0 3px rgba(27,117,219,0.20)` |
| Erro | border `error`; mensagem 13px `error` com ícone `alert-circle` 16px, `margin-top: 6px`; `aria-describedby` |
| Sucesso | check 16px `success` à direita do input (opcional) |
| Select | mesmo estilo; chevron `chevron-down` 20px `secondary` à direita; nativo com `appearance: none` |
| Radio "Já utiliza sistema?" | dois chips 44px altura, radius 6px, border 1px `neutral-300`; selecionado: bg `primary-light`, border `primary`, texto `primary-dark` 500 |
| Campo condicional "Qual sistema?" | aparece com fade 160ms abaixo dos chips quando "Sim" |
| Checkbox (consentimento LGPD, se exigido) | 20px, radius 4px, check `white` sobre `primary` |
| Botão | Primary full-width no mobile; no desktop full-width dentro do card do formulário (max-width 480px) |
| Layout desktop | 1 coluna (max-width 480px); Nome e Empresa podem ir lado a lado em 2 colunas de 50% |
| Ordem dos campos (copy) | Nome · Empresa · WhatsApp · Cidade/UF · Pessoas na equipe (select: 1–4 / 5–12 / 13+) · Já utiliza sistema? (Sim/Não) · Qual sistema? (condicional) |
| Máscara | WhatsApp com máscara BR; validação de 10–11 dígitos |
| Microcopy | 13px `neutral-500` abaixo do botão: "Ao enviar seus dados, nossa equipe entrará em contato para combinar a demonstração." + ícone `lock` 14px |
| Estado enviado | substitui o formulário por bloco com ícone `check-circle` 40px `success`, título H3 "Recebemos seus dados" e texto `[TBD — DEFINIR MENSAGEM PÓS-ENVIO]` |

Sensação: simples (7 campos, 1 coluna), seguro (cadeado + microcopy), rápido (chips em vez de select onde possível).

---

## 13. Cards

| Tipo | Radius | Border | Background | Padding | Ícone | Heading | Texto | Hover | Onde |
|---|---|---|---|---|---|---|---|---|---|
| **Flat card** | 10px | 1px `neutral-200` | `white` (sobre neutral-50) | 32px | container 44px, topo-esquerda | H3 22px | Body 16px `neutral-700` | border `neutral-300`; sem elevação | Dores (4), Segmentos (5) |
| **Feature card** | 10px | 1px `neutral-200` | `neutral-50` (sobre white) | 32px 32px 36px | container 44px | H3 22px | Body + lista de recursos com `check` 16px | shadow-sm + border `neutral-300` | Pilares (6) |
| **Highlight card** | 14px | none | `primary-light` | 32px | ícone 28px `primary-dark` sem container | H3 22px `primary-deep` | Body `neutral-900` | none | Bloco de qualificação em "Para quem é"; bloco "Como funciona a demonstração" em Troca de sistema |
| **Elevated card** | 14px | 1px `neutral-200` | `white` | 32px | — | — | — | — | Card do formulário no CTA final (shadow-lg); painel de canais no Suporte (shadow-md) |
| **Testimonial card** | 10px | 1px `neutral-200` | `white` | 32px | aspas `quote` 24px `primary-soft` | Nome 16px 600 `neutral-900`; empresa — cidade/UF 14px `neutral-500` | Citação Body Large 18px `neutral-900`, itálico não | shadow-sm | Prova social |
| **Metric card** (seção escura) | 10px | 1px `rgba(255,255,255,0.12)` | `rgba(255,255,255,0.06)` | 24px | ícone 20px `primary-soft` | label 13px uppercase `primary-soft` | valor Manrope 800 `white` — **apenas com dado real** `[TBD]` | none | Financeiro (opcional) |

Regra: no máximo **4 seções com grade de cards** (dores, pilares, segmentos, depoimentos). Financeiro, OS, estoque, troca de sistema e suporte são layouts editoriais/split.

---

## 14. Photography

**Decisão:** fotografia real é usada em **duas seções** (Suporte e Prova social) e opcionalmente como imagem pequena em "Para quem é". Não há foto no hero (a copy é explícita). Sem fotos = usar os fallbacks indicados; nunca stock.

| Uso | Asset | Fallback se não houver |
|---|---|---|
| Suporte | Foto real da equipe de atendimento F5 no ambiente de trabalho (2–3 pessoas, mesa, telefone/headset, tela com SiOfi) | Composição de ícones dos 5 canais em painel elevado + texto |
| Prova social | Foto do responsável na frente da oficina/auto center ou foto da fachada/pátio | Card de depoimento sem foto, com iniciais em avatar `primary-light` |
| Para quem é (opcional) | Uma única foto ampla de um auto center cliente (pátio com elevadores, balcão) como faixa de 320px de altura acima dos cards | Sem foto |

### 14.1 Direção fotográfica
- **Luz:** natural ou ambiente real, levemente elevada; sem flash frontal.
- **Enquadramento:** médio (pessoas do peito para cima em contexto) e amplo (ambiente); nada de close dramático nem olhar para a câmera com sorriso publicitário. Pessoas fazendo o que fazem: atendendo, olhando a tela, conversando com cliente.
- **Profundidade:** f/2.8–4 — fundo levemente desfocado, contexto ainda reconhecível.
- **Temperatura:** neutra a levemente fria (5.200–5.600K) para dialogar com o azul; evitar amarelo de lâmpada de galpão.
- **Contraste e saturação:** médios; leve dessaturação de vermelhos e laranjas (uniformes, ferramentas) para não competir com o azul institucional. Sem filtros, sem HDR.
- **Tratamento:** radius 14px, sem molduras, sem overlay azul. Em cards, proporção 4:3; faixa ampla 21:9.
- **Autenticidade:** oficina como é — limpa mas em uso; equipe da F5 como é. Legenda em 13px com nome/cidade quando houver autorização `[TBD — AUTORIZAÇÃO DE IMAGEM]`.

---

## 15. Screenshots

### 15.1 Tratamento padrão — "Product Frame"
- **Moldura própria** (não browser, não mockup de notebook): container `white`, border 1px `neutral-300`, radius 14px, `shadow-md`; barra superior de 36px com três pontos 8px em `neutral-300` e, à direita, o nome da tela em 12px `neutral-500` (ex.: "Ordem de serviço"). Isso neutraliza a barra de título Windows original.
- **Conteúdo:** captura recortada por funcionalidade, **sem a janela/barra de título original**, sem barra de tarefas, com zoom que deixe a menor fonte da tela ≥ 11px no desktop e ≥ 9px no mobile.
- **Fundo de apoio:** o frame flutua sobre um painel `primary-light` (radius 20px, padding 40px, com padrão hexagonal a 12%) no hero e na seção escura; nas demais seções fica direto sobre o fundo da seção.
- **Frontal**, nunca perspectiva/isométrico.
- **Callouts:** até 3 pílulas por screenshot (bg `white`, border `neutral-200`, shadow-sm, 13px 500, ícone 16px `primary`) posicionadas sobre a borda do frame apontando para o dado relevante (ex.: "Total da OS", "Resultado do período"). São HTML, não parte da imagem.
- **Proporção padrão:** 16:10 (1600×1000 @2x). Recortes verticais 4:5 para mobile quando a tela for tabela alta.
- **Formato:** AVIF com fallback WebP, `srcset` 800/1200/1600, `loading="lazy"` fora do hero, `decoding="async"`, `width/height` explícitos.
- **Alt:** descritivo do conteúdo ("Tela de ordem de serviço do SiOfi com cliente, veículo, peças e total").

### 15.2 Mitigação da estética "ERP antigo" (obrigatória)
1. Recapturar todas as telas em monitor 1920×1200 com escala 100%, tema padrão do Windows atual, sem ícones de terceiros na tela.
2. Recortar para mostrar **o dado**, não a janela: o frame próprio substitui a cromia do Windows.
3. Priorizar telas de **saída** (dashboard de indicadores, DRE, gráficos, OS preenchida) sobre telas de **entrada** (cadastros).
4. Dados de exemplo realistas e limpos: nomes de clientes fictícios genéricos, placas no padrão Mercosul, valores redondos plausíveis. Nunca dados reais de clientes.
5. Se existir versão atualizada da UI, ela substitui as capturas `[TBD — F5 CONFIRMAR VERSÃO DA INTERFACE]`.

### 15.3 Screenshot por seção

| Seção | Tela | Posição | Proporção | Recorte / destaque | Callouts |
|---|---|---|---|---|---|
| Hero | Dashboard de indicadores (faturamento, resultado, gráfico) | Direita, 7 col, sobrepondo 24px o painel de apoio | 16:10 | Gráfico + 3–4 indicadores; esconder menus | "Resultado do período", "Faturamento" |
| OS | Tela de ordem de serviço preenchida | Direita, 7 col | 16:10 | Cabeçalho com cliente/veículo, itens (peças + serviços), técnico, total | "Peças e serviços", "Total" |
| Financeiro (escuro) | DRE demonstrativo ou Resultados do período | Centro, 10 col, abaixo do texto | 16:9 | Tabela de resultados com totais; ocultar cabeçalho de janela | "Resultado líquido" |
| Financeiro (escuro) — secundário | Gráfico de inadimplência ou fluxo de caixa | Esquerda, 5 col, abaixo do principal (opcional) | 4:3 | Gráfico | — |
| Estoque | Consulta de produtos ou entrada de NF via XML | Esquerda, 7 col (inverte o split) | 16:10 | Lista de produtos com saldo, ou tela de importação | "Importação de XML" |
| Pilar 3 (opcional, dentro do card não) | — | — | — | — | — |
| Troca de sistema | Nenhum screenshot; ilustração de fluxo | — | — | — | — |
| CTA final | Nenhum | — | — | — | — |

---

## 16. Graphic Language

A identidade pede **módulos conectados** (facetas do cubo). Tradução para a interface, com moderação:

1. **Padrão hexagonal (derivado do símbolo):** malha de hexágonos de 48px, stroke 1px `primary-soft` a 12% de opacidade, mascarada com gradiente radial que desvanece para transparente. Usado em exatamente 3 lugares: painel de apoio do hero, fundo da seção Financeiro (escuro, `white` a 6%), fundo do CTA final. Nunca como textura de card.
2. **Linhas de conexão:** na timeline da OS e na "Virada", linha de 2px `neutral-200` com nós circulares 12px `primary`; representa "informações conectadas". Sem setas curvas decorativas.
3. **Divisores:** nenhum `<hr>` entre seções; a alternância de fundo faz o papel.
4. **Formas:** retângulos com radius 10–20px; nenhum blob, nenhuma diagonal.
5. **Gradientes:** apenas um, opcional, no painel escuro: linear 180° de `primary-deep` para `#082E63` (sutil). Botões e cards são sempre flat.
6. **Símbolo isolado:** aparece apenas no favicon, no botão flutuante (opcional, em vez do ícone WhatsApp — não recomendado) e como avatar de fallback no footer. Não usar como bullet.

### 16.1 Sequência de backgrounds
Hero `white` (painel `primary-light` à direita) → TrustBar `white` com border-top/bottom `neutral-200` → Dores `neutral-50` → Virada `white` → Pilares `white` (cards `neutral-50`) → OS `white` → **Financeiro `primary-deep`** → Estoque `white` → Antes×Depois `neutral-50` → Segmentos `white` → Troca de sistema `neutral-50` → Suporte `white` → Prova social `neutral-50` → FAQ `white` → **CTA final `primary-deep`** → Footer `primary-deep` (com divisor `rgba(255,255,255,0.12)`).

Regra: nunca duas seções `neutral-50` consecutivas; as duas escuras ficam a ~8 seções de distância; a última escura emenda no footer sem borda visível para a página "fechar".

---

## 17. Responsive Strategy

### 17.1 Breakpoints
```
--bp-sm: 480px   (mobile grande — ajustes de tipografia)
--bp-md: 768px   (tablet — grid 8 col, splits ainda empilhados)
--bp-lg: 1024px  (laptop — splits lado a lado, nav completa)
--bp-xl: 1280px  (desktop — container 1200)
--bp-2xl: 1536px (wide — hero painel full-bleed até 1440)
```
Quatro breakpoints efetivos (480 é apenas tipográfico).

### 17.2 Mobile (< 768) — desenhado à parte
- **Header:** 64px; logo flat 112px de largura à esquerda; à direita botão "Demonstração" compacto (40px altura, 14px, `primary`) + ícone menu 44×44. Menu abre como drawer inferior (radius-lg no topo) com 4 links + CTA primário full-width + link WhatsApp.
- **Hero:** eyebrow → H1 34px (máx. 3 linhas; a headline da copy tem 58 caracteres, cabe em 3 linhas a 34px em 335px de largura) → subheadline 17px (máx. 4 linhas) → CTA primário full-width → CTA secundário full-width outline → microcopy 13px → screenshot em painel `primary-light` full-bleed (margens negativas 20px), frame com radius 14px, altura ≈ 240px, recorte 4:3 focado nos indicadores. O CTA fica visível sem scroll em 812px de altura (header 64 + padding 48 + eyebrow 16 + H1 ~120 + 16 + sub ~100 + 24 + CTA 52 = ~440px).
- **TrustBar:** frase em 15px centralizada; logos em linha horizontal com scroll-snap, 96px de largura cada, altura 32px, cinza (`grayscale` + opacity 0.8).
- **Dores:** 4 cards empilhados, padding 24px; ícone e título na mesma linha (ícone 44px à esquerda, título à direita) para reduzir altura.
- **Virada:** texto centralizado, H2 28px, CTA full-width.
- **Pilares:** 6 feature cards empilhados; lista de recursos colapsada em "Ver recursos" (accordion interno) para reduzir altura — **ou** exibir os recursos como chips 13px em linha com wrap. Escolher chips (menos JS).
- **OS:** H2 → texto → timeline **vertical** (linha à esquerda, 7 nós, ícone 20px + label) → screenshot frame 4:5 → CTA secundário full-width.
- **Financeiro (escuro):** H2 → texto → screenshot DRE 16:9 full-bleed dentro de padding 20px → lista de 9 destaques em chips de 2 colunas (bg `rgba(255,255,255,0.08)`, 13px) → frase de apoio 20px Manrope 700 → CTA primário full-width.
- **Estoque:** H2 → texto → 4 benefícios com check → screenshot 16:10.
- **Antes×Depois:** 6 pares como cards empilhados; cada card tem duas linhas: "Antes" (ícone `minus` cinza, texto `neutral-500` com `text-decoration: none`) e "Com o SiOfi" (ícone `check` azul, texto `neutral-900` 500). Sem tabela.
- **Segmentos:** carrossel horizontal com scroll-snap, cards 260px de largura, indicadores de posição (5 pontos). Bloco de qualificação abaixo, full-width.
- **Troca de sistema:** H2 → subheadline → texto → 3 pontos de confiança em lista com ícone → CTA full-width.
- **Suporte:** foto 4:3 full-width → H2 → texto → 5 canais em lista vertical (ícone + label) → CTA secundário.
- **Prova social:** carrossel de depoimentos (1 por vez, scroll-snap, cards 100% – 40px) ou empilhado se ≤ 2.
- **FAQ:** accordion full-width, 56px de altura mínima por item, área de toque total.
- **CTA final:** H2 28px → texto → card de formulário full-width (radius 14px, padding 24px) → botão full-width.
- **Footer:** logo negativo → contatos em lista → links legais → copyright, tudo empilhado, alinhado à esquerda.
- **Sticky CTA:** barra inferior 64px (`white`, border-top `neutral-200`, shadow-md invertida) com botão primário full-width "Agendar demonstração"; aparece após o usuário rolar além do hero (IntersectionObserver no hero) e some quando o formulário final está visível. WhatsApp flutuante fica 88px acima da base, à direita.
- **Tamanhos mínimos:** touch targets 44×44px; texto ≥ 14px; ícones ≥ 20px; gap entre CTAs ≥ 12px.

### 17.3 Tablet (768–1023)
- Splits permanecem empilhados (texto acima, screenshot abaixo) com screenshot a 100% de largura; grades em 2 colunas; timeline OS horizontal com 7 passos em 2 linhas (4 + 3); Antes×Depois em 2 colunas lado a lado; hero com H1 44px e CTAs inline.

### 17.4 Laptop/Desktop (≥ 1024)
- Todos os splits lado a lado; timeline horizontal em 1 linha; nav completa.

---

## 18. Motion

| Interação | Especificação |
|---|---|
| Entrada de seção (fade-up) | `opacity 0→1`, `translateY(16px→0)`, 320ms, `cubic-bezier(0.2, 0.8, 0.2, 1)`, disparada por IntersectionObserver a 15% de visibilidade; stagger máximo 80ms entre cards, delay máximo total 240ms; executa uma vez |
| Hover CTA | 160ms ease-out: bg + translateY(-1px) + shadow-sm |
| Hover card | 160ms: border `neutral-300` + shadow-sm (feature/testimonial) |
| Accordion FAQ | altura via `grid-template-rows: 0fr→1fr`, 240ms ease; chevron rotate 180° 200ms |
| Header no scroll | após 24px: adiciona `shadow-xs` e reduz altura 72→64px, 200ms |
| Sticky CTA mobile | slide-up 240ms |
| Troca de screenshot (pilares, opcional) | crossfade 240ms ao hover/clique no card — apenas desktop; sem autoplay |
| Timeline OS | nós acendem sequencialmente (`primary-light`→`primary`) com stagger 60ms ao entrar na viewport; sem loop |
| Campo condicional | fade + height 160ms |
| Reduced motion | `@media (prefers-reduced-motion: reduce)`: todas as transições ≤ 1ms, sem translate; estados finais aplicados imediatamente |

Proibido: parallax, scroll hijacking, contadores animados, elementos flutuando, vídeo de fundo, animações > 400ms, autoplay de carrosséis.

---

## 19. Accessibility

- **Landmarks:** `<header>`, `<main>`, `<nav aria-label="Principal">`, `<section aria-labelledby>` por seção, `<footer>`, `<form aria-labelledby>`.
- **H1 único** (hero). Cada seção tem H2; cards têm H3. Eyebrows são `<p>`, não headings.
- **Foco visível** em tudo: outline 3px `primary-soft` offset 2px (branco em seções escuras). Ordem de tabulação = ordem visual. Skip link "Ir para o conteúdo" no topo.
- **Contraste:** todos os pares do §4.4; ícones informativos ≥ 3:1; ícones decorativos `aria-hidden="true"`.
- **Touch targets:** ≥ 44×44px (botões, chips, accordion, nav mobile, WhatsApp).
- **Formulário:** `<label for>` sempre; erros com `aria-describedby` e `aria-invalid`; região `aria-live="polite"` para mensagens; sem captcha visual bloqueante (preferir honeypot + validação server-side).
- **Accordion:** `<button aria-expanded aria-controls>` + painel `role="region"`.
- **Carrosséis mobile:** scroll nativo com `scroll-snap`, sem sequestro de gestos; botões prev/next apenas em desktop, `aria-label`.
- **Imagens:** alt descritivo em screenshots e fotos; logos de clientes com alt = nome; padrão hexagonal em CSS (sem alt).
- **Tipografia:** base 16px; nada abaixo de 13px; zoom até 200% sem quebra (grid fluido).
- **Reduced motion e** `prefers-contrast: more` (borda de cards vira `neutral-500`).
- **Idioma:** `<html lang="pt-BR">`.
- **Sticky CTA mobile:** não cobre o foco de inputs (form final esconde a barra).

---

## 20. Design Tokens

```css
:root {
  /* ---- Cores ---- */
  --color-brand-blue: #1B75DB;
  --color-primary: #1565C0;
  --color-primary-dark: #0F4FA8;
  --color-primary-deep: #0B3D82;
  --color-primary-deeper: #082E63;      /* hover/active em fundo escuro, base do gradiente opcional */
  --color-primary-light: #E8F2FC;
  --color-primary-light-active: #D6E7F9;
  --color-primary-soft: #8CCBF5;
  --color-secondary: #4A5563;

  --color-neutral-50: #F7F9FC;
  --color-neutral-100: #F1F4F8;
  --color-neutral-200: #E3E8EF;
  --color-neutral-300: #CBD2DC;
  --color-neutral-500: #6B7280;
  --color-neutral-700: #4A5563;
  --color-neutral-900: #1F2933;
  --color-white: #FFFFFF;

  --color-success: #1E8E5A;
  --color-error: #C8342B;
  --color-whatsapp: #25D366;

  /* Semânticos */
  --color-bg: var(--color-white);
  --color-bg-alt: var(--color-neutral-50);
  --color-bg-dark: var(--color-primary-deep);
  --color-surface: var(--color-white);
  --color-surface-alt: var(--color-neutral-50);
  --color-surface-dark: rgba(255, 255, 255, 0.06);
  --color-border: var(--color-neutral-200);
  --color-border-strong: var(--color-neutral-300);
  --color-border-dark: rgba(255, 255, 255, 0.12);
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-700);
  --color-text-muted: var(--color-neutral-500);
  --color-text-on-dark: #FFFFFF;
  --color-text-on-dark-secondary: #DCE6F5;
  --color-link: var(--color-primary);
  --color-link-hover: var(--color-primary-dark);
  --color-focus-ring: var(--color-primary-soft);
  --color-icon: var(--color-primary-dark);
  --color-icon-bg: var(--color-primary-light);
  --color-icon-on-dark: var(--color-primary-soft);
  --color-eyebrow: var(--color-primary);

  /* ---- Tipografia ---- */
  --font-display: "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  --font-body: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;

  --text-xs: 0.8125rem;                                   /* 13 */
  --text-sm: 0.875rem;                                    /* 14 */
  --text-base: 1rem;                                      /* 16 */
  --text-md: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);     /* 16–18 */
  --text-lg: clamp(1.0625rem, 1rem + 0.35vw, 1.25rem);    /* 17–20 */
  --text-xl: clamp(1.1875rem, 1.1rem + 0.4vw, 1.375rem);  /* 19–22 */
  --text-2xl: clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);     /* 28–40 */
  --text-3xl: clamp(2.125rem, 1.6rem + 2.4vw, 3.5rem);    /* 34–56 */
  --text-metric: clamp(1.875rem, 1.5rem + 1.6vw, 2.5rem); /* 30–40 */

  --leading-tight: 1.08;
  --leading-heading: 1.15;
  --leading-h3: 1.3;
  --leading-body: 1.6;
  --leading-sub: 1.55;

  --tracking-display: -0.02em;
  --tracking-heading: -0.015em;
  --tracking-h3: -0.005em;
  --tracking-eyebrow: 0.08em;
  --tracking-button: 0.01em;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-extrabold: 800;

  /* ---- Espaçamento ---- */
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-5: 20px; --space-6: 24px;  --space-8: 32px;  --space-10: 40px;
  --space-12: 48px; --space-16: 64px; --space-20: 80px; --space-24: 96px;
  --space-28: 112px; --space-32: 128px;

  --section-py: var(--space-28);
  --section-py-md: 88px;
  --section-py-sm: 72px;
  --card-p: var(--space-8);
  --card-p-sm: var(--space-6);
  --header-h: 72px;
  --header-h-sm: 64px;

  /* ---- Layout ---- */
  --container: 1200px;
  --container-wide: 1440px;
  --container-narrow: 720px;
  --container-form: 480px;
  --gutter: 24px;
  --gutter-md: 20px;
  --gutter-sm: 16px;
  --page-px: 32px;
  --page-px-md: 24px;
  --page-px-sm: 20px;
  --split-gap: 64px;
  --split-gap-md: 40px;

  /* ---- Radius ---- */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 999px;

  /* ---- Sombras ---- */
  --shadow-xs: 0 1px 2px rgba(15, 35, 70, 0.06);
  --shadow-sm: 0 2px 6px rgba(15, 35, 70, 0.08);
  --shadow-md: 0 8px 24px -8px rgba(15, 35, 70, 0.18), 0 2px 6px rgba(15, 35, 70, 0.06);
  --shadow-lg: 0 24px 48px -16px rgba(15, 35, 70, 0.24), 0 4px 12px rgba(15, 35, 70, 0.08);
  --focus-ring: 0 0 0 3px rgba(27, 117, 219, 0.20);

  /* ---- Componentes ---- */
  --btn-h: 52px;
  --btn-h-sm: 44px;
  --btn-px: 28px;
  --input-h: 52px;
  --input-px: 16px;
  --icon-sm: 20px;
  --icon-md: 24px;
  --icon-lg: 28px;
  --icon-box: 44px;
  --icon-stroke: 1.75;
  --touch-min: 44px;
  --frame-bar-h: 36px;

  /* ---- Motion ---- */
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur-fast: 160ms;
  --dur-base: 240ms;
  --dur-enter: 320ms;
  --enter-distance: 16px;
  --stagger: 80ms;

  /* ---- Breakpoints (referência; media queries não leem custom properties) ---- */
  /* sm 480 · md 768 · lg 1024 · xl 1280 · 2xl 1536 */
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast: 1ms; --dur-base: 1ms; --dur-enter: 1ms; --enter-distance: 0px; --stagger: 0ms; }
}
```

### 20.1 Classes tipográficas de referência
```css
.text-display { font: var(--weight-extrabold) var(--text-3xl)/var(--leading-tight) var(--font-display); letter-spacing: var(--tracking-display); color: var(--color-text-primary); max-width: 640px; }
.text-h2      { font: var(--weight-extrabold) var(--text-2xl)/var(--leading-heading) var(--font-display); letter-spacing: var(--tracking-heading); max-width: 720px; }
.text-h3      { font: var(--weight-bold) var(--text-xl)/var(--leading-h3) var(--font-display); letter-spacing: var(--tracking-h3); }
.text-sub     { font: var(--weight-regular) var(--text-lg)/var(--leading-sub) var(--font-body); color: var(--color-text-secondary); max-width: 560px; }
.text-body-lg { font: var(--weight-regular) var(--text-md)/var(--leading-body) var(--font-body); color: var(--color-text-secondary); max-width: 62ch; }
.text-body    { font: var(--weight-regular) var(--text-base)/var(--leading-body) var(--font-body); color: var(--color-text-secondary); max-width: 62ch; }
.text-small   { font: var(--weight-regular) var(--text-sm)/1.5 var(--font-body); color: var(--color-text-muted); }
.text-eyebrow { font: var(--weight-semibold) var(--text-xs)/1.2 var(--font-body); letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--color-eyebrow); }
.text-metric  { font: var(--weight-extrabold) var(--text-metric)/1 var(--font-display); letter-spacing: var(--tracking-display); font-feature-settings: "tnum"; }
```

---

## 21. Component System

Lista de componentes reutilizáveis:

```
Header · MobileDrawer · Hero · ProductFrame · Callout · TrustBar · SectionHeader
PainCard · ValueProposition · FeatureCard · FeatureChip · WorkOrderTimeline
FinancialHighlights · HighlightChip · BeforeAfter (BeforeAfterRow / BeforeAfterCard)
SegmentCard · QualifierBlock · SwitchingBlock · TrustPoint · SupportPanel · SupportChannel
TestimonialCard · LogoStrip · FAQAccordion · FAQItem · LeadForm · FormField · ChoiceChips
FinalCTA · Footer · FloatingWhatsApp · StickyMobileCTA · Button · Icon · HexPattern
```

### 21.1 Especificações dos componentes principais

**Header**
- Objetivo: acesso permanente ao CTA sem competir com o hero.
- Conteúdo: logo lockup flat (altura 32px desktop / 28px mobile, largura ≈ 128/112px); nav com 4 links (Recursos → #pilares, Ordem de serviço → #os, Financeiro → #financeiro, Suporte → #suporte); Button primary "Agendar demonstração" (altura 44px no header); mobile: botão compacto + menu.
- Layout: altura 72px; container 1200; logo à esquerda, nav centralizada (gap 32px), CTA à direita.
- Variantes: `default` (transparente sobre branco), `scrolled` (bg `white` 96% + backdrop-blur 8px + shadow-xs, altura 64px).
- Estados: link hover `primary`; link ativo (seção visível) `primary` com underline 2px offset 6px.
- Responsivo: < 1024 esconde nav e mostra MobileDrawer.
- Sticky: `position: sticky; top: 0; z-index: 50`.

**Hero**
- Objetivo: headline + CTA + prova visual em uma dobra.
- Conteúdo (copy §6): eyebrow, H1, subheadline, CTA primário, CTA secundário, microcopy; ProductFrame com dashboard e 2 Callouts.
- Layout desktop: grid 12 col; texto col 1–5 (max-width 560px), frame col 6–12 sobre painel `primary-light` (radius 20, padding 40, HexPattern) que sangra à direita até 1440px. Alinhamento vertical central. Altura mínima 640px, máxima 760px.
- Estados: frame com shadow-lg; callouts com fade-up stagger.
- Responsivo: §17.2.

**ProductFrame**
- Props: `src`, `alt`, `title` (nome da tela), `ratio` (16:10 | 16:9 | 4:3 | 4:5), `callouts[]` ({label, icon, x%, y%}), `elevation` (md | lg).
- Layout: barra 36px + imagem; border 1px `neutral-300`; radius 14px; overflow hidden.

**TrustBar**
- Conteúdo: frase da copy (§7) em 15px 500 `neutral-700` centralizada + LogoStrip (logos em `grayscale(1) opacity .75`, altura 32px, gap 48px) `[TBD — LOGOS AUTORIZADOS]` + até 3 fatos validados em texto (ex.: "Jaboticabal/SP", "Clientes em [N] cidades") `[TBD — DADOS REAIS]`. Se não houver logos nem dados: exibir apenas a frase, com border-top/bottom 1px `neutral-200`, altura 80px.

**SectionHeader**
- Props: `eyebrow?`, `title` (H2), `intro?`, `align` (left | center), `onDark`.
- Layout: max-width 720px quando center; margin-bottom 56px.

**PainCard** (flat card) — ícone container + H3 + body. Grid 4 col. No mobile ícone e título na mesma linha.

**ValueProposition** — bloco centralizado (max-width 720px): eyebrow "Proposta de valor" (opcional, não está na copy — omitir), H2, dois parágrafos Body Large, CTA primário "Quero conhecer o SiOfi". Abaixo do texto, uma linha de conexão horizontal com 5 nós rotulados (Atendimento · Ordem de serviço · Estoque · Financeiro · Gestão) — os rótulos vêm do próprio texto da copy ("Do atendimento ao financeiro, da ordem de serviço ao estoque"). Marca visualmente a virada problema → solução: é a primeira vez que a linha de conexão aparece; nas dores, os ícones estavam isolados.

**FeatureCard** (pilares) — container ícone + H3 + body + lista "Recursos relacionados" como FeatureChips (bg `white`, border `neutral-200`, 13px 500, radius 4px, gap 8px, wrap). Grid 3×2. Hover: shadow-sm. Opcional desktop: `data-screenshot` para crossfade em um ProductFrame lateral — **não implementar na v1**.

**WorkOrderTimeline**
- Conteúdo: 7 passos da copy (Cliente → Veículo → Orçamento → Ordem de Serviço → Peças → Técnico → Fechamento), cada um com ícone 24px em container 44px e label 15px 600.
- Desktop: horizontal, linha 2px `neutral-200` atrás dos containers, nós ativados em `primary` com stagger; "Ordem de Serviço" (passo 4) recebe container `primary` com ícone `white` e label `primary-dark` 700 — é o centro do fluxo.
- Tablet: 2 linhas (4+3). Mobile: vertical, linha à esquerda.
- Posição: abaixo do SectionHeader, acima do split texto/screenshot; largura total do container.

**FinancialHighlights** (seção escura)
- Conteúdo: 9 destaques da copy como HighlightChips (bg `rgba(255,255,255,0.08)`, border `rgba(255,255,255,0.12)`, texto `white` 14px 500, ícone 16px `primary-soft`, altura 40px, radius 6px, gap 12px, wrap) alinhados à esquerda sob o texto; frase de apoio "Menos achismo. Mais informação para decidir." em Manrope 700 24px `white` com barra vertical 3px `primary-soft` à esquerda; CTA primário.
- Métricas numéricas: **somente se a F5 fornecer números reais** — caso contrário, não renderizar MetricCards.

**BeforeAfter**
- Desktop: bloco de 2 colunas lado a lado com cabeçalhos "Antes" (`neutral-500`, ícone `minus`) e "Com o SiOfi" (`primary-dark`, ícone `check`), 6 linhas alinhadas; a coluna direita tem bg `primary-light` e radius 14px, a esquerda bg `white` com border; entre elas, no centro, uma seta `arrow-right` 24px `primary` por linha (apenas ≥ 1024). Não é `<table>` visual: são duas listas `<ul>` alinhadas por grid; semanticamente use `<dl>` com pares. Mobile: BeforeAfterCard por par.

**SegmentCard** — flat card, ícone + H3 + 1 linha. 5 col desktop; carrossel mobile. **QualifierBlock** abaixo: highlight card com o texto de qualificação da copy, ícone `target`.

**SwitchingBlock** (Troca de sistema)
- Layout: split 6/6. Esquerda: SectionHeader (H2, subheadline em 20px, texto) + CTA "Quero avaliar o SiOfi" (primário, âncora para #form com `?ctx=troca` que pré-seleciona "Sim" no chip). Direita: painel `white` radius 14 border `neutral-200` shadow-md com 3 TrustPoints (ícone 24 em container + título 16px 600 + 1 linha 14px): "Comparação ponto a ponto na demonstração" / "Avaliação de recursos e operação antes da decisão" / "Acompanhamento da equipe F5" — **textos derivados literalmente da copy §16; qualquer promessa de migração/prazo fica como** `[TBD F5 — VALIDAR PROCESSO DE MIGRAÇÃO]`. Visual de confiança: ícone `shield-check` grande (48px, `primary-soft`) no canto do painel.

**SupportPanel**
- Layout: split 5/7. Esquerda: foto real (4:3, radius 14) ou fallback. Direita: SectionHeader + lista de 5 SupportChannels (ícone 24 container + label 16px 500) em grid 2 col + CTA secundário "Falar com a equipe" + texto pequeno "Jaboticabal/SP" com `map-pin` (dado validado no PDF).

**TestimonialCard** — ver §13. Grid 3 col desktop; se houver menos de 3 depoimentos reais, exibir 1–2 em largura 6 col centralizados; se nenhum: **não renderizar a seção** e manter a LogoStrip na TrustBar `[TBD — DEPOIMENTOS REAIS]`.

**FAQAccordion** — lista com border-top/bottom 1px `neutral-200` por item; pergunta 17px 600 `neutral-900`, padding 20px 0, chevron à direita; resposta Body 16px `neutral-700`, padding-bottom 20px, max-width 720px; primeiro item aberto por padrão. Container narrow 720px centralizado. Itens com `TODO F5` na copy **não são renderizados** até validação.

**LeadForm** — ver §12. Props: `context` (default | troca) para pré-selecionar o chip. Emite eventos `form_start` (primeiro foco) e `form_submit`. Preserva UTMs/gclid/fbclid em campos hidden.

**FinalCTA** — seção escura, split 6/6: esquerda H2 (branco), texto, 3 linhas de "o que acontece depois" com ícone `check-circle` (`primary-soft`) — usar apenas frases já presentes na copy (agendar demonstração; conhecer recursos para a rotina; equipe entra em contato) — e, se houver, um depoimento curto; direita: LeadForm em elevated card branco (radius 20, padding 40, shadow-lg). HexPattern a 6% no fundo.

**Footer** — 4 colunas desktop (logo negativo + tagline "Software de gestão para o setor automotivo" | Contato: telefone, WhatsApp, e-mail, Jaboticabal/SP `[TBD — CONFIRMAR DADOS]` | Links: Recursos, OS, Financeiro, Suporte, FAQ | Legal: Política de privacidade, Termos); linha inferior com "© F5 Software de Gestão" e CNPJ `[TBD]`. Texto 14px `#DCE6F5`; links `white` hover underline.

**FloatingWhatsApp** — círculo 56px `primary-deep` com ícone WhatsApp 24px `#25D366`; ao hover (desktop) expande para pílula com label "Falar com um especialista"; `aria-label`; link `https://wa.me/[TBD]` com `utm_source` preservada; evento `whatsapp_click`. Posição: bottom 24px / right 24px desktop; bottom 88px / right 16px mobile.

**StickyMobileCTA** — ver §17.2.

**Button** — props: `variant` (primary | secondary | ghost | onDark), `size` (md 52 | sm 44), `fullWidth`, `icon`, `iconPosition`, `loading`, `href | onClick`, `trackingId`.

---

## 22. Section-by-Section Art Direction

| # | Seção (copy) | Direção visual resumida |
|---|---|---|
| 0 | Header | Sticky, branco, logo flat, CTA primário 44px. |
| 1 | Hero | Split 5/7; H1 56px grafite; painel `primary-light` com HexPattern e ProductFrame do dashboard (shadow-lg) + 2 callouts; CTAs lado a lado; microcopy 13px. Sem foto. |
| 2 | TrustBar | Faixa 96px, frase + logos cinza. Sem números inventados. |
| 3 | Dores | `neutral-50`; SectionHeader centralizado; 4 PainCards (ícones `eye-off`, `layers`, `package`, `user-round-cog`). Tom sóbrio: sem vermelho, sem ícones de alerta. |
| 4 | Virada | Branco; texto centralizado; primeira aparição da linha de conexão com 5 nós; CTA primário. A transição problema→solução é marcada por: mudança de fundo cinza→branco, ícones isolados→ícones conectados, H2 de 40px sem card. |
| 5 | Pilares | Branco; 6 FeatureCards `neutral-50` em 3×2; chips de recursos; ordem da copy (Oficina, Financeiro, Gestão, Estoque, Compras, Fiscal). Pilar Fiscal usa apenas os 4 recursos validados. |
| 6 | Ordem de serviço | Branco; SectionHeader esquerda; WorkOrderTimeline largura total; split 5/7 texto + ProductFrame da OS com callouts "Peças e serviços" e "Total"; CTA secundário "Ver o SiOfi funcionando" (ícone `play-circle`). |
| 7 | Financeiro e resultados | **`primary-deep`**, HexPattern 6%; SectionHeader branco à esquerda (eyebrow `primary-soft`); split 5/7 texto + ProductFrame do DRE (frame branco cria o maior contraste da página); FinancialHighlights chips; frase de apoio com barra lateral; CTA primário. Esta é a seção de maior impacto: fundo escuro + tela clara + números. |
| 8 | Estoque e compras | Branco; split invertido 7/5 (screenshot à esquerda) para quebrar o ritmo; 4 benefícios com `check`. Sem CTA (a copy não traz). |
| 9 | Antes × Com o SiOfi | `neutral-50`; BeforeAfter duas colunas com setas; coluna direita `primary-light`. |
| 10 | Para quem é | Branco; 5 SegmentCards em linha; QualifierBlock highlight abaixo; foto ampla opcional acima. |
| 11 | Troca de sistema | `neutral-50`; SwitchingBlock com painel de confiança e `shield-check`. Parece seção de confiança: sem screenshot, sem chips, ícones de escudo/rota. |
| 12 | Suporte | Branco; foto real da equipe F5 + canais em grid; "Jaboticabal/SP". Humaniza. |
| 13 | Prova social | `neutral-50`; 3 TestimonialCards ou placeholders claramente marcados; LogoStrip repetida embaixo se houver logos. |
| 14 | FAQ | Branco; accordion narrow 720px; 7 itens validados (os 2 com TODO ficam ocultos). |
| 15 | CTA final + formulário | **`primary-deep`**; split texto/form; card branco do formulário com shadow-lg. |
| 16 | Footer | `primary-deep`, divisor sutil, 4 colunas. |
| — | FloatingWhatsApp / StickyMobileCTA | Ver §21. |

Problemas de hierarquia identificados na copy (sinalização, sem alterar conteúdo): (a) a seção Financeiro traz 9 destaques em lista — renderizados como chips, não como lista vertical, para não virar bloco de texto; (b) Pilares tem 6 cards com 4–6 recursos cada — chips com wrap e H3 curtos resolvem; (c) há 6 CTAs com textos diferentes ao longo da página — todos apontam para #form (exceto "Conhecer o SiOfi" → #pilares e "Ver o SiOfi funcionando" → #os), o que é aceitável, mas recomenda-se manter o mesmo texto no header e no sticky mobile ("Agendar demonstração") para consistência.

---

## 23. Desktop Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER (72px, sticky, white)                                                 │
│ [Logo SiOfi]        Recursos  Ordem de serviço  Financeiro  Suporte   [Agendar demonstração] │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ HERO (white, min 640px)                                                      │
│ ┌ col 1–5 ───────────────────────┐  ┌ col 6–12  painel primary-light ─────┐ │
│ │ SISTEMA DE GESTÃO PARA OFICINAS │  │  ░░ hex pattern ░░                   │ │
│ │ Sua oficina trabalha muito.     │  │  ┌ ProductFrame "Indicadores" ────┐ │ │
│ │ Mas você sabe quanto            │  │  │ ● ● ●                          │ │ │
│ │ realmente sobra?  (H1 56px)     │  │  │  [dashboard: gráfico + KPIs]   │ │ │
│ │                                 │  │  │        (Resultado do período)◄─┼─┼─┼─ callout
│ │ Subheadline 20px (56ch)         │  │  │  (Faturamento)◄────────────────┼─┼─┼─ callout
│ │                                 │  │  └────────────────────────────────┘ │ │
│ │ [Agendar uma demonstração] [Conhecer o SiOfi]                            │ │
│ │ microcopy 13px                  │  └──────────────────────────────────────┘ │
│ └─────────────────────────────────┘                                          │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ TRUSTBAR (96px, border-top/bottom)                                           │
│   Desenvolvido para a rotina de oficinas, auto centers e empresas do setor…  │
│   [logo] [logo] [logo] [logo] [logo]   ← TBD logos autorizados               │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ DORES (neutral-50, py 112)                                                   │
│                 Sua oficina cresceu. A gestão acompanhou? (H2, center)       │
│                 Intro Body Large (720px)                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                           │
│ │ [eye-off]│ │ [layers] │ │[package] │ │[user-cog]│                           │
│ │ Muito    │ │ Informa- │ │ Estoque  │ │ Tudo     │  ← 4 PainCards, 3 col cada│
│ │ movimento│ │ ção esp. │ │ difícil  │ │ depende  │                           │
│ │ texto    │ │ texto    │ │ texto    │ │ texto    │                           │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘                           │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ VIRADA (white, py 112, center 720px)                                         │
│        Mais do que informatizar a oficina. É ter controle do negócio. (H2)   │
│        Parágrafo 1 · Parágrafo 2 (Body Large)                                │
│   ●─────────●─────────●─────────●─────────●   (linha de conexão, 5 nós)      │
│ Atendimento  OS     Estoque  Financeiro  Gestão                              │
│                    [Quero conhecer o SiOfi]                                  │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ PILARES (white, py 112)  id=#pilares                                         │
│            O que você precisa acompanhar, em um só lugar (H2, center)        │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                     │
│ │[clipboard] H3  │ │[wallet] H3     │ │[bar-chart] H3  │                     │
│ │ texto          │ │ texto          │ │ texto          │  ← FeatureCards     │
│ │ [chip][chip]…  │ │ [chip][chip]…  │ │ [chip][chip]…  │    neutral-50       │
│ └────────────────┘ └────────────────┘ └────────────────┘                     │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                     │
│ │[package] H3    │ │[cart] H3       │ │[file-check] H3 │                     │
│ │ …              │ │ …              │ │ …              │                     │
│ └────────────────┘ └────────────────┘ └────────────────┘                     │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ ORDEM DE SERVIÇO (white, py 112)  id=#os                                     │
│ Do orçamento à entrega, acompanhe cada serviço (H2, left)                    │
│ ○──────○──────○──────●──────○──────○──────○   WorkOrderTimeline (horizontal) │
│ Cliente Veículo Orçam.  OS   Peças Técnico Fecham.                           │
│ ┌ col 1–5 ──────────────┐  ┌ col 6–12 ProductFrame "Ordem de serviço" ─────┐ │
│ │ Texto (2 parágrafos)  │  │ ● ● ●                                          │ │
│ │                       │  │ [tela OS: cliente/veículo, itens, técnico]     │ │
│ │ [▶ Ver o SiOfi        │  │              (Peças e serviços)◄ (Total)◄      │ │
│ │    funcionando]       │  └────────────────────────────────────────────────┘ │
│ └───────────────────────┘                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ FINANCEIRO E RESULTADOS (primary-deep, py 112, hex 6%)  id=#financeiro       │
│ ┌ col 1–5 ──────────────────────┐  ┌ col 6–12 ProductFrame "DRE" ─────────┐ │
│ │ FINANCEIRO (eyebrow soft)     │  │ ● ● ●                                 │ │
│ │ Sua oficina está cheia. Mas   │  │ [tabela DRE / resultados do período]  │ │
│ │ ela está dando resultado?     │  │                (Resultado líquido)◄   │ │
│ │ (H2 white)                    │  └───────────────────────────────────────┘ │
│ │ Texto (2 parágrafos, #DCE6F5) │                                            │
│ │ [faturamento][contas a pagar][contas a receber][fluxo de caixa][DRE]      │
│ │ [balanço gerencial][resultados do período][ticket médio][indicadores]     │
│ │ ▌Menos achismo. Mais informação para decidir.                             │
│ │ [Quero ter mais controle da minha oficina]                                │
│ └───────────────────────────────┘                                            │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ ESTOQUE E COMPRAS (white, py 112)                                            │
│ ┌ col 1–7 ProductFrame "Estoque" ───────────┐  ┌ col 8–12 ─────────────────┐ │
│ │ ● ● ●                                     │  │ Saiba o que entra, o que  │ │
│ │ [consulta de produtos / entrada por XML]  │  │ sai e o que precisa       │ │
│ │                    (Importação de XML)◄   │  │ comprar (H2)              │ │
│ └───────────────────────────────────────────┘  │ Texto (2 parágrafos)      │ │
│                                                │ ✓ organização das entradas│ │
│                                                │ ✓ histórico de moviment.  │ │
│                                                │ ✓ integração com OS       │ │
│                                                │ ✓ apoio aos pedidos       │ │
│                                                └───────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ ANTES × COM O SIOFI (neutral-50, py 112)                                     │
│      Quando as informações se conectam, administrar fica mais simples (H2)   │
│ ┌ ANTES (white, border) ──────┐     ┌ COM O SIOFI (primary-light) ─────────┐ │
│ │ – Informações espalhadas    │  →  │ ✓ Dados centralizados                │ │
│ │ – OS em papel…              │  →  │ ✓ Histórico organizado de serviços   │ │
│ │ – Estoque difícil…          │  →  │ ✓ Movimentações integradas           │ │
│ │ – Financeiro sem visão…     │  →  │ ✓ Relatórios e indicadores           │ │
│ │ – Dependência da memória    │  →  │ ✓ Informações registradas            │ │
│ │ – Problemas percebidos tarde│  →  │ ✓ Mais visibilidade da operação      │ │
│ └─────────────────────────────┘     └──────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ PARA QUEM É (white, py 112)                                                  │
│            Feito para quem vive a rotina do setor automotivo (H2)            │
│ [foto ampla 21:9 opcional — TBD]                                             │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                       │
│ │[clip]  │ │[store] │ │[bldg]  │ │[zap]   │ │[brush] │  ← 5 SegmentCards     │
│ │Oficinas│ │Auto    │ │Centros │ │Auto-   │ │Funila- │                       │
│ │mecân.  │ │centers │ │automot.│ │elétric.│ │rias    │                       │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘                       │
│ ┌ QualifierBlock (primary-light, 14px radius) ──────────────────────────────┐│
│ │ [target] O SiOfi faz especialmente sentido para empresas que já possuem…  ││
│ └───────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ TROCA DE SISTEMA (neutral-50, py 112)                                        │
│ ┌ col 1–6 ───────────────────────┐  ┌ col 7–12 painel white shadow-md ─────┐ │
│ │ Já usa outro sistema? (H2)     │  │                     [shield-check 48]│ │
│ │ Trocar de sistema precisa      │  │ [arrow-right-left] Comparação ponto  │ │
│ │ trazer mais controle — não     │  │                    a ponto na demo   │ │
│ │ mais problemas. (sub 20px)     │  │ [route] Avaliação de recursos e      │ │
│ │ Texto (2 parágrafos)           │  │         operação antes da decisão    │ │
│ │ [Quero avaliar o SiOfi]        │  │ [headset] Acompanhamento da equipe F5│ │
│ └────────────────────────────────┘  │ TBD F5: processo de migração         │ │
│                                     └──────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ SUPORTE (white, py 112)  id=#suporte                                         │
│ ┌ col 1–5 foto equipe F5 4:3 ─┐  ┌ col 6–12 ────────────────────────────────┐│
│ │ [foto real — TBD]           │  │ Quando você precisa de ajuda, precisa    ││
│ │                             │  │ falar com quem entende o sistema (H2)    ││
│ └─────────────────────────────┘  │ Texto                                    ││
│                                  │ [user] Atendimento pessoal [phone] Telef.││
│                                  │ [mail] E-mail   [ticket] Sistema de ticket│
│                                  │ [screen-share] Acesso remoto             ││
│                                  │ [Falar com a equipe]  ⌖ Jaboticabal/SP   ││
│                                  └──────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ PROVA SOCIAL (neutral-50, py 112)                                            │
│                     Quem usa o SiOfi na rotina (H2)                          │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                     │
│ │ " Antes do     │ │ " …            │ │ " …            │  ← TestimonialCards │
│ │   SiOfi, …     │ │                │ │                │    [TBD — REAIS]    │
│ │ (foto) Nome    │ │ (foto) Nome    │ │ (foto) Nome    │                     │
│ │ Empresa — Cid. │ │ Empresa — Cid. │ │ Empresa — Cid. │                     │
│ └────────────────┘ └────────────────┘ └────────────────┘                     │
│   [logo] [logo] [logo] [logo] [logo] [logo]   ← LogoStrip (TBD autorização)  │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ FAQ (white, py 112, container 720)                                           │
│                     Dúvidas frequentes (H2)                                  │
│ ─────────────────────────────────────────────────────────────────────────    │
│ Para quais empresas o SiOfi é indicado?                              ˄       │
│   Resposta…                                                                  │
│ ─────────────────────────────────────────────────────────────────────────    │
│ O SiOfi possui ordem de serviço?                                     ˅       │
│ ─────────────────────────────────────────────────────────────────────────    │
│ … (7 itens validados)                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ CTA FINAL (primary-deep, py 112, hex 6%)  id=#form                           │
│ ┌ col 1–6 ───────────────────────┐  ┌ col 7–12 card white radius 20 ──────┐ │
│ │ Veja como o SiOfi pode         │  │ Nome            │ Empresa            │ │
│ │ funcionar na sua oficina (H2)  │  │ WhatsApp                             │ │
│ │ Texto                          │  │ Cidade / UF                          │ │
│ │ ✓ Demonstração prática         │  │ Pessoas na equipe  [1–4][5–12][13+]  │ │
│ │ ✓ Recursos para a sua rotina   │  │ Já utiliza sistema?  [Sim] [Não]     │ │
│ │ ✓ Nossa equipe entra em contato│  │ Qual sistema? (condicional)          │ │
│ │                                │  │ [Quero agendar uma demonstração]     │ │
│ │                                │  │ 🔒 Ao enviar seus dados…             │ │
│ └────────────────────────────────┘  └──────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ FOOTER (primary-deep, divisor 12%)                                           │
│ [Logo negativo]      Contato          Links            Legal                 │
│ Software de gestão   Telefone TBD     Recursos         Política de privac.   │
│ para o setor autom.  WhatsApp TBD     Ordem de serviço Termos                │
│                      E-mail TBD       Financeiro                             │
│                      Jaboticabal/SP   Suporte · FAQ                          │
│ ──────────────────────────────────────────────────────────────────────────── │
│ © F5 Software de Gestão · CNPJ TBD                                           │
└──────────────────────────────────────────────────────────────────────────────┘
                                                              (●) WhatsApp 56px
```

---

## 24. Mobile Wireframe

```text
┌──────────────────────────────┐
│ HEADER 64px                  │
│ [Logo 112px]  [Demonstração][≡]│
├──────────────────────────────┤
│ HERO (white, pt 48)          │
│ SISTEMA DE GESTÃO PARA…      │
│ Sua oficina trabalha         │
│ muito. Mas você sabe         │
│ quanto realmente sobra?      │
│ (H1 34px, 3 linhas)          │
│ Subheadline 17px (4 linhas)  │
│ ┌──────────────────────────┐ │
│ │ Agendar uma demonstração │ │  ← full-width, visível sem scroll
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Conhecer o SiOfi         │ │  ← outline
│ └──────────────────────────┘ │
│ microcopy 13px               │
│ ┌ painel primary-light ────┐ │  ← full-bleed
│ │ ┌ ProductFrame 4:3 ────┐ │ │
│ │ │ ● ● ●                │ │ │
│ │ │ [dashboard recorte]  │ │ │
│ │ │ (Resultado)◄         │ │ │
│ │ └──────────────────────┘ │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ TRUSTBAR                     │
│ Desenvolvido para a rotina…  │
│ [logo][logo][logo] → scroll  │
├──────────────────────────────┤
│ DORES (neutral-50, py 72)    │
│ Sua oficina cresceu.         │
│ A gestão acompanhou? (28px)  │
│ Intro                        │
│ ┌──────────────────────────┐ │
│ │ [icon] Muito movimento…  │ │
│ │ texto                    │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ [icon] Informação esp.   │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ [icon] Estoque difícil…  │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ [icon] Tudo depende…     │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ VIRADA (white)               │
│ Mais do que informatizar…(H2)│
│ Parágrafos                   │
│ ●──●──●──●──●  (linha, 5 nós)│
│ ┌──────────────────────────┐ │
│ │ Quero conhecer o SiOfi   │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ PILARES (white) #pilares     │
│ O que você precisa… (H2)     │
│ ┌──────────────────────────┐ │
│ │ [icon] Acompanhe cada    │ │
│ │ serviço · texto          │ │
│ │ [chip][chip][chip][chip] │ │
│ └──────────────────────────┘ │
│ … ×6 empilhados              │
├──────────────────────────────┤
│ ORDEM DE SERVIÇO #os         │
│ Do orçamento à entrega… (H2) │
│ Texto                        │
│ ○ Cliente                    │
│ │                            │
│ ○ Veículo                    │
│ │                            │
│ ○ Orçamento                  │
│ │                            │
│ ● Ordem de Serviço           │
│ │                            │
│ ○ Peças                      │
│ │                            │
│ ○ Técnico                    │
│ │                            │
│ ○ Fechamento                 │
│ ┌ ProductFrame 4:5 ────────┐ │
│ │ [tela OS recorte]        │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ ▶ Ver o SiOfi funcionando│ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ FINANCEIRO (primary-deep)    │
│ FINANCEIRO                   │
│ Sua oficina está cheia. Mas  │
│ ela está dando resultado?    │
│ Texto                        │
│ ┌ ProductFrame 16:9 ───────┐ │
│ │ [DRE recorte]            │ │
│ └──────────────────────────┘ │
│ [faturamento] [contas a pag.]│
│ [contas a rec.][fluxo caixa] │
│ [DRE]         [balanço ger.] │
│ [resultados]  [ticket médio] │
│ [indicadores]                │
│ ▌Menos achismo. Mais         │
│ ▌informação para decidir.    │
│ ┌──────────────────────────┐ │
│ │ Quero ter mais controle… │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ ESTOQUE (white)              │
│ Saiba o que entra… (H2)      │
│ Texto                        │
│ ✓ ✓ ✓ ✓ (4 benefícios)       │
│ ┌ ProductFrame 16:10 ──────┐ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ ANTES × SIOFI (neutral-50)   │
│ Quando as informações… (H2)  │
│ ┌──────────────────────────┐ │
│ │ – Informações espalhadas │ │
│ │ ✓ Dados centralizados    │ │
│ └──────────────────────────┘ │
│ … ×6 cards pareados          │
├──────────────────────────────┤
│ PARA QUEM É (white)          │
│ Feito para quem vive… (H2)   │
│ ┌────────┐┌────────┐┌───  → │  ← carrossel 260px, snap
│ │Oficinas││Auto c. ││Cen…    │
│ └────────┘└────────┘└───     │
│ • • • • •                    │
│ ┌ QualifierBlock ──────────┐ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ TROCA DE SISTEMA (neutral-50)│
│ Já usa outro sistema? (H2)   │
│ Trocar de sistema precisa…   │
│ Texto                        │
│ [shield] Comparação ponto…   │
│ [route] Avaliação de rec…    │
│ [headset] Acompanhamento…    │
│ ┌──────────────────────────┐ │
│ │ Quero avaliar o SiOfi    │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ SUPORTE (white) #suporte     │
│ ┌ foto 4:3 ────────────────┐ │
│ └──────────────────────────┘ │
│ Quando você precisa de       │
│ ajuda… (H2)                  │
│ Texto                        │
│ [icon] Atendimento pessoal   │
│ [icon] Telefone              │
│ [icon] E-mail                │
│ [icon] Sistema de ticket     │
│ [icon] Acesso remoto         │
│ ┌──────────────────────────┐ │
│ │ Falar com a equipe       │ │  ← outline
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ PROVA SOCIAL (neutral-50)    │
│ Quem usa o SiOfi… (H2)       │
│ ┌────────────────────────┐ → │  ← 1 card por vez, snap
│ │ " depoimento TBD       │   │
│ │ Nome · Empresa — Cid.  │   │
│ └────────────────────────┘   │
│ [logo][logo][logo] → scroll  │
├──────────────────────────────┤
│ FAQ (white)                  │
│ Dúvidas frequentes (H2)      │
│ ── Pergunta 1            ˄   │
│    Resposta                  │
│ ── Pergunta 2            ˅   │
│ … (56px min por item)        │
├──────────────────────────────┤
│ CTA FINAL (primary-deep)#form│
│ Veja como o SiOfi pode       │
│ funcionar na sua oficina(H2) │
│ Texto                        │
│ ┌ card white radius 14 ────┐ │
│ │ Nome                     │ │
│ │ Empresa                  │ │
│ │ WhatsApp                 │ │
│ │ Cidade / UF              │ │
│ │ Pessoas: [1–4][5–12][13+]│ │
│ │ Já usa sistema? [Sim][Não]│ │
│ │ Qual sistema? (cond.)    │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ Quero agendar uma    │ │ │
│ │ │ demonstração         │ │ │
│ │ └──────────────────────┘ │ │
│ │ 🔒 Ao enviar seus dados… │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ FOOTER (primary-deep)        │
│ [Logo negativo]              │
│ Software de gestão para…     │
│ Telefone · WhatsApp · E-mail │
│ Jaboticabal/SP               │
│ Política de privacidade      │
│ Termos                       │
│ © F5 Software de Gestão      │
└──────────────────────────────┘
┌──────────────────────────────┐
│ STICKY CTA 64px (após hero,  │
│ some no #form)               │
│ [ Agendar demonstração     ] │
└──────────────────────────────┘
                     (●) WhatsApp 56px, bottom 88px
```

Ordem mobile difere do desktop em dois pontos: (1) no hero e no financeiro o screenshot vem **depois** do CTA/texto; (2) no estoque o screenshot vem **depois** dos benefícios (no desktop está à esquerda). Todo o resto mantém a ordem da copy.

---

## 25. Section Map

| # | Section | Background | Layout | Elemento visual principal | CTA |
|---|---|---|---|---|---|
| 0 | Header | white (sticky) | logo / nav / botão | Logo flat | Agendar demonstração (primário 44px) |
| 1 | Hero | white + painel primary-light | split 5/7 | ProductFrame dashboard + callouts | Agendar uma demonstração (primário) · Conhecer o SiOfi (secundário) |
| 2 | TrustBar | white, borders | faixa centralizada | LogoStrip (TBD) | — |
| 3 | Dores | neutral-50 | header center + 4 cards | 4 PainCards | — |
| 4 | Virada | white | bloco center 720 | linha de conexão 5 nós | Quero conhecer o SiOfi (primário) |
| 5 | Pilares | white | grid 3×2 | 6 FeatureCards com chips | — |
| 6 | Ordem de serviço | white | timeline + split 5/7 | WorkOrderTimeline + ProductFrame OS | Ver o SiOfi funcionando (secundário) |
| 7 | Financeiro | primary-deep | split 5/7 | ProductFrame DRE + chips | Quero ter mais controle da minha oficina (primário) |
| 8 | Estoque | white | split 7/5 invertido | ProductFrame estoque + checklist | — |
| 9 | Antes × Depois | neutral-50 | duas colunas + setas | BeforeAfter | — |
| 10 | Para quem é | white | 5 cards + highlight | SegmentCards + QualifierBlock | — |
| 11 | Troca de sistema | neutral-50 | split 6/6 | painel de confiança + shield-check | Quero avaliar o SiOfi (primário) |
| 12 | Suporte | white | split 5/7 | foto equipe F5 + canais | Falar com a equipe (secundário) |
| 13 | Prova social | neutral-50 | grid 3 | TestimonialCards + LogoStrip | — |
| 14 | FAQ | white | narrow 720 | FAQAccordion | — |
| 15 | CTA final | primary-deep | split 6/6 | LeadForm em card branco | Quero agendar uma demonstração (primário) |
| 16 | Footer | primary-deep | 4 col | Logo negativo | link WhatsApp |
| — | Flutuantes | — | fixed | FloatingWhatsApp · StickyMobileCTA | Falar com um especialista · Agendar demonstração |

---

### 25.1 Component Map

| Section | Componente | Variante | Desktop | Mobile |
|---|---|---|---|---|
| Header | Header | default / scrolled | nav inline + CTA | logo + CTA compacto + MobileDrawer |
| Hero | Hero, ProductFrame, Callout, Button | frame `lg`, callouts 2 | split 5/7 | texto → CTAs → frame 4:3 full-bleed |
| TrustBar | TrustBar, LogoStrip | com/sem logos | linha única | frase + scroll-snap |
| Dores | SectionHeader, PainCard | flat | 4 col | 1 col, ícone inline com título |
| Virada | ValueProposition, Button | — | center 720 | center, CTA full |
| Pilares | SectionHeader, FeatureCard, FeatureChip | — | 3×2 | 1 col, chips wrap |
| OS | SectionHeader, WorkOrderTimeline, ProductFrame, Button | timeline horizontal / vertical; frame `md` | timeline full + split 5/7 | timeline vertical → frame 4:5 → CTA |
| Financeiro | SectionHeader (onDark), ProductFrame, FinancialHighlights, HighlightChip, Button | onDark | split 5/7 | texto → frame 16:9 → chips 2 col → CTA |
| Estoque | SectionHeader, ProductFrame, lista check | frame `md` | split 7/5 | texto → checklist → frame |
| Antes×Depois | SectionHeader, BeforeAfter | rows / cards | 2 col + setas | BeforeAfterCard ×6 |
| Para quem é | SectionHeader, SegmentCard, QualifierBlock | flat / highlight | 5 col | carrossel snap + bloco |
| Troca | SwitchingBlock, TrustPoint, Button | — | split 6/6 | empilhado |
| Suporte | SupportPanel, SupportChannel, Button | com foto / fallback | split 5/7 | foto → texto → lista → CTA |
| Prova | SectionHeader, TestimonialCard, LogoStrip | com foto / avatar iniciais / oculto | 3 col | carrossel 1 por vez |
| FAQ | SectionHeader, FAQAccordion, FAQItem | — | narrow 720 | full-width, 56px min |
| CTA final | FinalCTA, LeadForm, FormField, ChoiceChips, Button | onDark | split 6/6 | texto → card form |
| Footer | Footer | — | 4 col | empilhado |
| Global | FloatingWhatsApp, StickyMobileCTA, HexPattern, Icon | — | WhatsApp only | ambos |

---

## 26. Typography Map

| Elemento | Font | Weight | Desktop | Mobile | Line Height | Cor |
|---|---|---:|---:|---:|---:|---|
| H1 hero | Manrope | 800 | 56px | 34px | 1.08 | neutral-900 |
| H2 seção | Manrope | 800 | 40px | 28px | 1.15 | neutral-900 / white |
| H3 card | Manrope | 700 | 22px | 19px | 1.3 | neutral-900 |
| Subheadline hero | Inter | 400 | 20px | 17px | 1.55 | neutral-700 |
| Subheadline troca ("Trocar de sistema precisa…") | Inter | 500 | 20px | 18px | 1.5 | neutral-900 |
| Intro de seção (Body Large) | Inter | 400 | 18px | 16px | 1.6 | neutral-700 |
| Body | Inter | 400 | 16px | 16px | 1.6 | neutral-700 |
| Frase de apoio financeiro | Manrope | 700 | 24px | 20px | 1.3 | white |
| Chip de recurso / destaque | Inter | 500 | 13px | 13px | 1.2 | neutral-700 / white |
| Eyebrow | Inter | 600 | 13px | 12px | 1.2 | primary / primary-soft |
| Button | Inter | 600 | 16px | 16px | 1 | white / primary |
| Nav | Inter | 500 | 15px | 17px | 1 | neutral-900 |
| Form label | Inter | 500 | 14px | 14px | 1.3 | neutral-900 |
| Input | Inter | 400 | 16px | 16px | 1.4 | neutral-900 |
| Microcopy / small | Inter | 400 | 13–14px | 13px | 1.5 | neutral-500 |
| Timeline label | Inter | 600 | 15px | 15px | 1.3 | neutral-700 (ativo: primary-dark) |
| Depoimento (citação) | Inter | 400 | 18px | 17px | 1.6 | neutral-900 |
| Depoimento (nome) | Inter | 600 | 16px | 15px | 1.3 | neutral-900 |
| FAQ pergunta | Inter | 600 | 17px | 16px | 1.4 | neutral-900 |
| Callout | Inter | 500 | 13px | 12px | 1.2 | neutral-900 |
| Footer | Inter | 400 | 14px | 14px | 1.6 | #DCE6F5 |
| Metric (se houver dado) | Manrope | 800 | 40px | 30px | 1 | white |

---

## 27. Color Map

| Token | Cor | Uso |
|---|---|---|
| `--color-brand-blue` | #1B75DB | Símbolo, ícones grandes, gráficos, HexPattern base |
| `--color-primary` | #1565C0 | CTA primário, links, eyebrow, foco, chips selecionados (texto) |
| `--color-primary-dark` | #0F4FA8 | Hover CTA, ícones em container, coluna "Com o SiOfi" (títulos) |
| `--color-primary-deep` | #0B3D82 | Seções Financeiro e CTA final, footer, botão WhatsApp, active CTA |
| `--color-primary-deeper` | #082E63 | Hover WhatsApp, base de gradiente opcional |
| `--color-primary-light` | #E8F2FC | Painel do hero, containers de ícone, highlight cards, coluna "Com o SiOfi", hover secundário |
| `--color-primary-soft` | #8CCBF5 | Eyebrows/ícones em seção escura, HexPattern, focus ring, aspas do depoimento |
| `--color-secondary` / `neutral-700` | #4A5563 | Body text, ícones sem container |
| `--color-neutral-50` | #F7F9FC | Seções alternadas, FeatureCards |
| `--color-neutral-100` | #F1F4F8 | Ícone "Antes", inputs desabilitados |
| `--color-neutral-200` | #E3E8EF | Borders de cards, divisores, linha da timeline |
| `--color-neutral-300` | #CBD2DC | Border de inputs e ProductFrame, pontos do frame |
| `--color-neutral-500` | #6B7280 | Small, placeholders, texto "Antes", nome da tela no frame |
| `--color-neutral-900` | #1F2933 | Headings, texto principal, inputs |
| `--color-white` | #FFFFFF | Fundo principal, cards, texto sobre escuro, frame |
| `--color-text-on-dark-secondary` | #DCE6F5 | Body em seções escuras e footer |
| `--color-success` | #1E8E5A | Validação, estado enviado |
| `--color-error` | #C8342B | Erros de formulário |
| `--color-whatsapp` | #25D366 | Apenas o ícone WhatsApp |

---

## 28. Icon Map

| Conceito | Ícone sugerido | Biblioteca |
|---|---|---|
| Ordem de serviço / oficina / segmento oficina | `clipboard-list` | Lucide |
| Cliente | `user-round` | Lucide |
| Veículo | `car-front` | Lucide |
| Orçamento | `file-text` | Lucide |
| Peças / estoque | `package` | Lucide |
| Técnico (timeline) | `wrench` | Lucide |
| Fechamento | `check-circle-2` | Lucide |
| Produtividade | `gauge` | Lucide |
| Financeiro | `wallet` | Lucide |
| Contas a pagar / receber | `arrow-down-left` / `arrow-up-right` | Lucide |
| Fluxo de caixa | `trending-up` | Lucide |
| Cobrança / boletos | `receipt` | Lucide |
| DRE / indicadores | `bar-chart-3` | Lucide |
| Relatórios | `file-bar-chart` | Lucide |
| Compras | `shopping-cart` | Lucide |
| Fiscal / NF-e | `file-check-2` | Lucide |
| XML | `file-code-2` | Lucide |
| Integração / conexão | `link-2` | Lucide |
| Pouca clareza (dor 1) | `eye-off` | Lucide |
| Informação espalhada (dor 2) | `layers` | Lucide |
| Estoque difícil (dor 3) | `package-search` | Lucide |
| Tudo depende do dono (dor 4) | `user-round-cog` | Lucide |
| Suporte | `headset` | Lucide |
| Atendimento pessoal | `users-round` | Lucide |
| Telefone | `phone` | Lucide |
| E-mail | `mail` | Lucide |
| Ticket | `ticket` | Lucide |
| Acesso remoto | `screen-share` | Lucide |
| Segurança / confiança | `shield-check` | Lucide |
| Migração / comparação | `arrow-right-left` | Lucide |
| Acompanhamento | `route` | Lucide |
| Ver funcionando | `play-circle` | Lucide |
| Check (benefícios, "Com o SiOfi") | `check` | Lucide |
| Antes (negativo) | `minus` | Lucide |
| Seta Antes→Depois | `arrow-right` | Lucide |
| Auto center | `store` | Lucide |
| Centro automotivo | `building-2` | Lucide |
| Autoelétrica | `zap` | Lucide |
| Funilaria | `paintbrush` | Lucide |
| Qualificação ("faz sentido para…") | `target` | Lucide |
| Localização | `map-pin` | Lucide |
| Cadeado (microcopy form) | `lock` | Lucide |
| Erro de formulário | `alert-circle` | Lucide |
| Sucesso | `check-circle` | Lucide |
| FAQ | `chevron-down` | Lucide |
| Menu mobile | `menu` / `x` | Lucide |
| Aspas depoimento | `quote` | Lucide |
| WhatsApp | `whatsapp` | Simple Icons (SVG) |

---

## 29. Asset Map

| Section | Asset necessário | Formato | Proporção | Observação |
|---|---|---|---|---|
| Global | Logo lockup flat (azul + grafite) | SVG | — | Header |
| Global | Logo lockup negativo (branco, símbolo colorido) | SVG | — | Footer, seções escuras se necessário |
| Global | Símbolo isolado simplificado (3 facetas) | SVG + PNG 512 | 1:1 | Favicon, OG, app icon |
| Global | Favicon set (32, 180, 512) + `manifest` | ICO/PNG | 1:1 | — |
| Global | Imagem OG (Open Graph) | JPG/WebP 1200×630 | 1.91:1 | Logo + headline sobre painel primary-light |
| Hero | Screenshot dashboard de indicadores | AVIF/WebP @2x 3200×2000 | 16:10 | Recortado, sem barra Windows; dados fictícios |
| Hero (mobile) | Recorte do dashboard | AVIF/WebP 1600×1200 | 4:3 | Foco em 2–3 indicadores |
| OS | Screenshot ordem de serviço preenchida | AVIF/WebP 3200×2000 | 16:10 | Cliente, veículo, itens, técnico, total visíveis |
| OS (mobile) | Recorte vertical da OS | 1600×2000 | 4:5 | — |
| Financeiro | Screenshot DRE / resultados do período | AVIF/WebP 3200×1800 | 16:9 | Totais legíveis |
| Financeiro (opcional) | Gráfico de inadimplência ou fluxo | 1600×1200 | 4:3 | — |
| Estoque | Screenshot consulta de produtos ou importação XML | 3200×2000 | 16:10 | — |
| TrustBar / Prova | Logos de clientes autorizados | SVG ou PNG 400px, mono | — | `[TBD — AUTORIZAÇÃO]`; renderizados em cinza |
| Suporte | Foto real da equipe F5 | JPG/WebP 1600×1200 | 4:3 | Direção §14.1 |
| Prova social | Fotos de clientes/oficinas | WebP 800×800 | 1:1 (avatar) ou 4:3 | `[TBD — AUTORIZAÇÃO DE IMAGEM]` |
| Para quem é (opcional) | Foto ampla de auto center cliente | WebP 2400×1030 | 21:9 | — |
| Global | HexPattern | SVG inline / CSS | tile 48px | Gerado em código |
| Global | Ícones Lucide | SVG sprite | — | Apenas os do §29 |

---

### 29.1 Assets necessários (checklist para a F5)

### Obrigatório
- Logo SiOfi em SVG (lockup colorido flat, lockup negativo, símbolo isolado).
- 4 screenshots recapturados em alta resolução com dados fictícios: dashboard/indicadores, ordem de serviço, DRE/resultados, estoque (ou importação XML).
- Confirmação das modalidades fiscais suportadas (a página exibirá apenas NF-e até lá).
- Telefone, WhatsApp, e-mail, endereço e CNPJ da F5 para footer e botão flutuante.
- Política de privacidade (URL).
- Destino do formulário (CRM/e-mail/webhook) e IDs de GTM/GA4/Google Ads/Meta Pixel.

### Recomendado
- Foto da equipe de suporte/atendimento da F5.
- 3 depoimentos reais no formato da copy, com nome, empresa, cidade/UF e autorização.
- Logos de clientes com autorização de uso (lista da apresentação como ponto de partida).
- Dados validados para a TrustBar (anos de mercado, nº de clientes, cidades atendidas).
- Resposta validada para "Como funciona a implantação?" e "Posso migrar dados?".
- Confirmação sobre acesso remoto/consulta pelo celular (resposta à objeção "tem app?").

### Opcional
- Foto ampla de auto center cliente para "Para quem é".
- Screenshot de gráfico de inadimplência/fluxo de caixa.
- Vídeo curto (< 60s, sem autoplay, abaixo da dobra) mostrando a OS — só se produzido com qualidade.
- Versão atualizada da interface do SiOfi, se existir.

---

## 30. Claude Code Implementation Guidelines

1. **Stack sugerida:** HTML semântico + CSS com custom properties (§20) + JS vanilla mínimo (drawer, accordion, IntersectionObserver, máscara de telefone, campo condicional, tracking). Framework opcional (Astro/Next) apenas se o projeto já usar; sem Tailwind arbitrário — se usar Tailwind, mapear os tokens no `theme.extend` e não usar valores fora deles.
2. **Todos os valores visuais vêm dos tokens.** Nenhum hex, px de radius ou sombra inline fora de `:root`.
3. **Estrutura de arquivos:** `content/copy.json` (textos da copy, por seção, com chaves `todo: true` para itens pendentes) separado dos componentes; `tokens.css`; `components/*.{html|tsx}`; `assets/screens/*.avif|webp`; `assets/logo/*.svg`.
4. **Copy é imutável na implementação.** Textos vêm do arquivo de copy; nenhum texto novo além dos rótulos de UI listados aqui (labels de formulário, "Ver recursos", mensagens de erro, aria-labels).
5. **Itens `TODO F5`** não são renderizados; ficam no JSON com `todo: true` e um comentário no código. Seções sem dado real (depoimentos, logos, métricas) são condicionais e ocultas quando vazias.
6. **Ordem das seções** exatamente como §25. IDs: `#pilares`, `#os`, `#financeiro`, `#suporte`, `#faq`, `#form`.
7. **Header sticky** com classe `is-scrolled` após 24px; drawer mobile com foco preso e `Esc` para fechar.
8. **ProductFrame** é um componente único; screenshots sempre com `width`/`height`, `srcset`, `sizes`, `loading="lazy"` (exceto hero: `fetchpriority="high"`), `decoding="async"`.
9. **Fontes:** preconnect + `display=swap`; apenas Manrope 700/800 e Inter 400/500/600; `font-feature-settings: "tnum"` em métricas e tabelas.
10. **HexPattern** em CSS/SVG inline (sem imagem externa), com `mask-image: radial-gradient(...)`.
11. **Motion** via classes `.reveal` + IntersectionObserver (threshold 0.15, `once`), stagger por `--i` custom property; tudo desativado sob `prefers-reduced-motion`.
12. **Formulário:** validação HTML5 + JS; máscara de WhatsApp; campos hidden `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, `landing_url`, `context`; honeypot; POST para endpoint `[TBD]`; estado enviado sem recarregar página; eventos `form_start`/`form_submit` no `dataLayer`.
13. **Tracking:** cada CTA com `data-track="hero_cta_click|demo_cta_click|whatsapp_click|…"` e `data-section`; `scroll_depth` em 25/50/75/100; GTM carregado com `defer`.
14. **Links de CTA:** todos os primários → `#form` com scroll suave (`scroll-behavior: smooth` respeitando reduced-motion); "Conhecer o SiOfi" → `#pilares`; "Ver o SiOfi funcionando" → `#os`; "Quero avaliar o SiOfi" → `#form?ctx=troca` (pré-seleciona "Sim").
15. **Sticky mobile CTA** montado apenas < 1024px; controlado por IntersectionObserver do hero (mostrar) e do `#form` (esconder).
16. **Acessibilidade:** landmarks, skip link, foco visível, `aria-expanded`, `aria-live`, alt descritivo, touch ≥ 44px, `lang="pt-BR"`.
17. **Performance alvo:** LCP < 2,5s (hero screenshot ≤ 180 KB AVIF), CLS < 0,05 (dimensões explícitas, fontes com swap e `size-adjust`), INP < 200ms, JS total < 40 KB gz, CSS < 30 KB gz. Sem bibliotecas de animação, sem jQuery, sem carrossel de terceiros (scroll-snap nativo).
18. **SEO:** `<title>` e `meta description` da copy §23; H1 único; FAQ com `FAQPage` JSON-LD apenas se a política vigente do buscador permitir (ver copy); OG image; canonical.
19. **Não inventar:** nenhum número, logo, depoimento, funcionalidade fiscal, prazo de migração ou selo. Se faltar, `[TBD — FORNECER DADO REAL]` no JSON e a seção/elemento fica oculto.
20. **Entrega:** preview em 375, 768, 1024, 1440px; screenshots de cada seção anexadas ao PR; checklist §31 preenchido.

---

## 31. Final QA Checklist

**Identidade**
- [ ] Logo em SVG flat no header e negativo no footer, com área de proteção ≥ 0,5× altura da capital
- [ ] Azul institucional #1B75DB/#1565C0 e grafite #1F2933 são as únicas cores de marca; nenhum accent extra
- [ ] Hexágono/facetas aparecem no máximo 3 vezes (painel hero, financeiro, CTA final) e nunca como bullet
- [ ] Nenhum gradiente em botões ou cards; no máximo o gradiente sutil opcional das seções escuras

**Percepção**
- [ ] Aparência de SaaS B2B profissional; não parece site de oficina, autopeças, fintech ou dashboard futurista
- [ ] Proporção visual ≈ 72% claro / 18% azul / 7% grafite / 3% azul-claro
- [ ] Página parece atual sem "modinha" (sem glass, neon, blobs, 3D)
- [ ] Screenshots não transmitem "ERP antigo": sem barra de título Windows, recorte por funcionalidade, moldura própria, telas de resultado priorizadas

**Tipografia e hierarquia**
- [ ] Apenas Manrope (700/800) e Inter (400/500/600)
- [ ] H1 único, 56px desktop / 34px mobile, claramente dominante
- [ ] Todo H2 tem 40/28px; H3 22/19px; body 16px; nada abaixo de 13px
- [ ] Texto corrido ≤ 62ch; H1 ≤ 640px; H2 ≤ 720px
- [ ] Eyebrows em uppercase 13px `primary`, não são headings

**Cor e contraste**
- [ ] Todos os pares de texto/fundo ≥ 4,5:1 (§4.4); `brand-blue` nunca em texto pequeno
- [ ] Sequência de backgrounds igual ao §16.1; nunca duas seções `neutral-50` seguidas
- [ ] Exatamente duas seções `primary-deep` + footer

**Componentes**
- [ ] Uma única família de ícones (Lucide outline 1.75); sem engrenagem; carro só na timeline
- [ ] Cards apenas em Dores, Pilares, Segmentos e Prova social; demais seções são split/editorial
- [ ] Cards em repouso sem sombra (só border); hover com shadow-sm
- [ ] CTA primário: 52px, radius 6px, `primary`→`primary-dark`→`primary-deep`; texto consistente no header e sticky
- [ ] CTA secundário outline; WhatsApp só flutuante (azul-profundo com ícone verde) + link no footer
- [ ] ProductFrame com barra 36px, border `neutral-300`, radius 14px, callouts HTML
- [ ] Timeline da OS com 7 passos e "Ordem de Serviço" destacada
- [ ] Antes×Depois não é `<table>` visual; mobile em cards pareados
- [ ] FAQ accordion acessível, primeiro item aberto, itens TODO ocultos

**Formulário**
- [ ] 7 campos na ordem da copy; chips para equipe e "já usa sistema?"; campo condicional
- [ ] Inputs 52px, radius 6px, labels visíveis, erro com ícone e `aria-describedby`
- [ ] Microcopy com cadeado; estado enviado sem reload; UTMs/gclid/fbclid preservados
- [ ] Fácil de completar em < 60s no mobile

**Mobile**
- [ ] Desenhado à parte: hero com CTA visível sem scroll em 812px; screenshot abaixo do CTA
- [ ] Sticky CTA aparece após o hero e some no formulário; WhatsApp 88px acima da base
- [ ] Carrosséis com scroll-snap nativo; touch targets ≥ 44px; sem texto < 13px
- [ ] Sem scroll horizontal da página

**Motion e performance**
- [ ] Apenas fade-up 320ms + hovers 160ms + accordion 240ms; nada > 400ms; sem parallax/autoplay
- [ ] `prefers-reduced-motion` respeitado
- [ ] LCP < 2,5s, CLS < 0,05, INP < 200ms; imagens AVIF/WebP com dimensões; fontes com swap; JS < 40 KB gz

**Acessibilidade e SEO**
- [ ] Landmarks, skip link, foco visível em tudo, `lang="pt-BR"`, alt descritivo em screenshots e fotos
- [ ] Title/meta description da copy; H1→H2→H3 sem pulos; IDs de seção corretos

**Integridade de conteúdo**
- [ ] Nenhum cliente, número, depoimento, funcionalidade fiscal, prazo ou garantia inventado
- [ ] Todo `TODO F5` está oculto na página e visível no código/JSON
- [ ] Seções condicionais (prova social, logos, métricas) ocultas quando vazias
- [ ] Todos os tokens documentados em `:root`; nenhum valor visual arbitrário fora deles
