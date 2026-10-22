# Dani Sushi — Site

Site da Dani Sushi (https://danisushii.com.br): sushi bar ao vivo e jantares personalizados. A home leva o visitante a preencher a comanda e continuar a conversa pelo WhatsApp.
Branch de trabalho do novo design: `v2`. A `main` só recebe a v2 quando ela for aprovada.

## Stack
Vite + HTML/CSS/JS vanilla + Tailwind v4 (`@tailwindcss/vite`) + GSAP + ScrollTrigger + Lenis + fontes self-hosted (@fontsource).

- `npm run dev` — servidor local
- `npm run build` — build de produção em `dist/` (rodar e corrigir erros ao fim de toda tarefa)
- `npm run kanji` — regenera o subconjunto de kanji (roda sozinho antes de `dev` e `build`)

## Estrutura
```
index.html                    → home; todo o conteúdo fica aqui; carrega só /src/main.js
public/
  arquivos/videos/            → vídeos (.mp4/.webm), servidos sem hash
  arquivos/og-image.jpg       → imagem de compartilhamento (1200x630)
  favicon.svg, robots.txt, sitemap.xml
ferramentas/
  kanji.js                    → gera src/assets/fontes/*.woff2 e src/estilos/fontes-kanji.css
src/
  main.js                     → ENTRADA ÚNICA: fontes, CSS, scroll, cabeçalho e hero; o resto sob demanda
  estilos/
    main.css                  → Tailwind (theme + utilities, SEM preflight) + @theme (tokens) + imports
    fontes-kanji.css          → GERADO (não editar)
    base.css                  → reset, foco, layout, tipografia, rótulo, botões, .secao-topo (layer base)
    secoes/<secao>.css        → um arquivo por seção (layer components)
  scripts/
    core/scroll.js            → Lenis + GSAP/ScrollTrigger sincronizados; ÚNICO lugar que registra plugins
                                (reexporta gsap e ScrollTrigger; trata cliques em âncoras #id com Lenis)
    core/carregador.js        → carregarAoAproximar(seletor, carregar): import() dinâmico via IntersectionObserver
    secoes/<secao>.js         → um módulo por seção, exporta iniciar<Secao>(elemento)
    utils/movimento.js        → export const reduzirMovimento (prefers-reduced-motion)
    utils/revelar.js          → revelar(elementos) e revelarEmSequencia(elementos, gatilho)
  assets/imagens/             → imagens processadas pelo Vite (hash); logo-claro.png
  assets/fontes/              → GERADO pelo ferramentas/kanji.js
```

## Seções da home (ordem)
| Seção | Classe / id | JS | Fundo |
|---|---|---|---|
| Cabeçalho + menu mobile | `.cabecalho`, `#menu-mobile` | `cabecalho.js` (main.js) | transparente → fixo com blur depois do hero |
| Hero | `.hero` | `hero.js` (main.js) | placeholder do vídeo |
| Números | `.numeros` | `numeros.js` | fundo |
| Manifesto | `.manifesto` | `manifesto.js` | superfície |
| Pilares | `.pilares` | `pilares.js` | fundo |
| Formatos | `.formatos` | `formatos.js` | fundo |
| Momentos | `.momentos` / `#momentos` | `momentos.js` | superfície |
| Depoimentos | `.depoimentos` / `#depoimentos` | `depoimentos.js` | fundo |
| Orçamento (comanda) | `.orcamento` / `#orcamento` | `orcamento.js` | superfície |
| Rodapé | `.rodape` | `rodape.js` (ano atual) | fundo |

Páginas futuras: /momentos, /depoimentos, /orcamento.

## Tokens (`@theme static` em main.css)
| Token | Valor | Uso |
|---|---|---|
| `--color-fundo` | #0B0908 | fundo base |
| `--color-superficie` | #120E0C | seções alternadas |
| `--color-placeholder` | #1B1613 | placeholders de foto/vídeo |
| `--color-texto` | #F2EEEA | títulos e links |
| `--color-texto-2` | #BDB5AE | parágrafos |
| `--color-texto-3` | #8E8680 | rótulos, metadados |
| `--color-acento` | #C8102E | botões primários |
| `--color-acento-claro` | #E8566B | kanji, destaques, foco sobre fundo escuro |
| `--color-linha` | rgba(242,238,234,.10) | hairlines |
| `--color-papel` / `--color-tinta` | #F2EEEA / #1A1513 | cartão da comanda |
| `--color-carimbo` | #9E0E26 | kanji e foco sobre o papel |
| `--font-titulo` / `--font-texto` / `--font-mono` | Shippori Mincho / Inter Tight / JetBrains Mono | |

Use `var(--color-...)` no CSS ou os utilitários do Tailwind (`bg-fundo`, `text-texto-2`).

## Fontes
- **Shippori Mincho 400/500** → títulos, números, rótulos. Latim via `@fontsource/shippori-mincho/latin-*.css`.
- **Kanji** → NUNCA importar o `400.css` completo (são cerca de 120 @font-face e 150 KB de CSS). O `ferramentas/kanji.js` lê os textos com `lang="ja"` em todos os `*.html` da raiz e gera fontes só com esses caracteres. **Todo kanji novo precisa estar dentro de um elemento com `lang="ja"`.**
- **Inter Tight 400/500** → texto corrido e botões. **JetBrains Mono 400** → só metadados e campos da comanda.
- Todas com `font-display: swap`. Só o Shippori 400 latin tem preload (no `<head>`, apontando para `/node_modules/...`; o Vite aplica o hash).

## Padrões tipográficos e componentes (base.css)
- `.rotulo`: Shippori 13px, uppercase, letter-spacing 4px, texto-3.
  `<p class="rotulo"><span class="rotulo-kanji" lang="ja">形</span> Katachi · <em>Formatos</em></p>` (o kanji em acento-claro; o `<em>` em itálico, sem uppercase)
- h1/h2: Shippori 400, UPPERCASE, letter-spacing 0.1em, line-height 1.15. h1 `clamp(36px, 6vw, 80px)`, h2 `clamp(30px, 4.2vw, 60px)`, h3 20 → 24 → 26px (letter-spacing 0.12–0.14em).
- Texto corrido: Inter Tight 16/17px (`.texto-intro`: 17/19px), line-height 1.6, texto-2.
- `.botao.botao-primario` (acento, pill, 52px) · `.botao.botao-secundario` (borda 1px rgba(242,238,234,.28)).
- `.metadado` (mono 12px) · `.destaque` (acento-claro) · `.apagado` (texto-3) · `.visualmente-oculto`.
- `.secao-topo`: rótulo + h2 à esquerda e texto ou link à direita (≥900px).
- Layout: `.container` (conteúdo com máx. 1344px; respiro de 20 → 32 → 48px exposto em `--respiro`) e `.secao` (96px → 140px a partir de 900px).
- Mobile-first: `min-width` 600 / 900 / 1200, com as media queries no fim de cada arquivo, da menor para a maior.

## Animações
GSAP + ScrollTrigger; duração 1.2–1.4s; ease `power3.out`. **Tudo desligado com `reduzirMovimento`.** Funcionalidades (menu, comanda, ano) continuam rodando.
- Hero: rótulo, h1 (linha a linha, com máscara criada pelo JS a partir dos `<br>`), p e botões em stagger de 0.12s; no scroll, a mídia escala de 1 para 1.06 e escurece (scrub).
- Números: contagem até o valor escrito no HTML (`data-contar-de` define o início, padrão 0).
- Rótulos, h2 e textos de topo: `revelar()` (y 30 → 0 + opacidade).
- Pilares e linhas de Formatos: `revelarEmSequencia()`.
- Momentos: foto com `clip-path: inset()` de baixo para cima.
- Cabeçalho: vira fixo e desce (yPercent -100 → 0) depois do hero.
- Hero e cabeçalho iniciam no `main.js`; as demais seções entram em `secoesSobDemanda` com `carregarAoAproximar`.

## Comanda (orçamento)
- O número do WhatsApp fica em `data-whatsapp` no `<form>` e a saudação em `data-mensagem`.
- Cada campo tem `data-mensagem` com o rótulo usado na mensagem. A data sai em dd/mm/aaaa.
- A validação é a nativa (`required`, `min="10"`) com `aria-invalid`. O formulário abre `https://wa.me/<numero>?text=...`.

## Regras
1. `index.html` carrega apenas `<script type="module" src="/src/main.js"></script>` (o JSON-LD é dado, não script).
2. Lenis: `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t => lenis.raf(t * 1000))`; `gsap.ticker.lagSmoothing(0)`. Não iniciar Lenis se `reduzirMovimento` for true.
3. Cada módulo de seção só roda se o elemento existir no DOM.
4. Seções abaixo da dobra: JS via `import()` dinâmico disparado por IntersectionObserver (rootMargin 200px).
5. Animações suaves e lentas: duration 1–1.4s, ease `power3.out`. Importe `gsap`/`ScrollTrigger` de `core/scroll.js`.
6. Conteúdo (textos, links de WhatsApp, depoimentos, mensagens) fica no HTML, nunca hardcoded no JS.
7. Identificadores de CSS/JS em português. Comentários em CAIXA ALTA; seções divididas com `/* === TITULO === */`.
8. HTML, CSS e JS em arquivos separados. Sem código morto, sem `console.log`.
9. Remover arquivos e dependências que ficarem sem uso.

## SEO e acessibilidade
- Um único h1 por página; hierarquia h2 → h3 (use `.visualmente-oculto` quando a seção não tiver título visível). Use `lang="ja"` em todo kanji.
- Imagens com `width`/`height` reais; placeholders com `aspect-ratio` fixo (CLS zero).
- Contraste ≥ 4.5:1; foco visível (acento-claro no escuro, carimbo no papel); labels reais; o menu mobile fecha com Esc, deixa o resto da página `inert` e devolve o foco ao botão.
- JSON-LD `FoodEstablishment` no `<head>` (o Instagram em `sameAs` ainda é TODO).
- Domínio canônico: `https://danisushii.com.br/` (canonical, og:url, og:image, sitemap, robots).
