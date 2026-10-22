# Dani Sushi — Landing page

Landing page da bio do Instagram (https://danisushii.com.br) que leva o visitante ao WhatsApp.

## Stack
Vite + HTML/CSS/JS vanilla + Tailwind v4 (`@tailwindcss/vite`) + GSAP + ScrollTrigger + Lenis.

- `npm run dev` — servidor local
- `npm run build` — build de produção em `dist/` (rodar e corrigir erros ao fim de toda tarefa)

## Estrutura
```
index.html                    → conteúdo da página; carrega só /src/main.js
public/
  arquivos/videos/            → vídeos (.mp4/.webm), servidos sem hash
  arquivos/og-image.jpg       → imagem de compartilhamento (1200x630)
  favicon.svg, robots.txt, sitemap.xml
src/
  main.js                     → ENTRADA ÚNICA: importa o CSS, inicia o scroll e registra as seções sob demanda
  estilos/
    main.css                  → Tailwind (theme + utilities, SEM preflight) + @theme (tokens) + imports
    base.css                  → reset, tipografia e botão .cta (layer base)
    secoes/<secao>.css        → um arquivo por seção (layer components)
  scripts/
    core/scroll.js            → Lenis + GSAP/ScrollTrigger sincronizados; ÚNICO lugar que registra plugins
                                (reexporta gsap e ScrollTrigger para os módulos de seção)
    core/carregador.js        → carregarAoAproximar(seletor, carregar): import() dinâmico via IntersectionObserver
    secoes/<secao>.js         → um módulo por seção, exporta iniciar<Secao>(elemento)
    utils/movimento.js        → export const reduzirMovimento (prefers-reduced-motion)
  assets/imagens/             → imagens processadas pelo Vite (hash)
```

Seções atuais (CSS em `src/estilos/secoes/`): `hero`, `quem-somos`, `modelos`, `informacoes`, `cta-final`, `rodape`.
Ainda não existe nenhum módulo em `src/scripts/secoes/`.

## Regras
1. `index.html` carrega apenas `<script type="module" src="/src/main.js"></script>`. Nada de `<link rel="stylesheet">` ou outros scripts.
2. Lenis: `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t => lenis.raf(t * 1000))`; `gsap.ticker.lagSmoothing(0)`. Não iniciar Lenis se `reduzirMovimento` for true.
3. Cada módulo de seção só roda se o elemento existir no DOM.
4. Seções abaixo da dobra: JS carregado via `import()` dinâmico disparado por IntersectionObserver (rootMargin 200px). Para adicionar uma seção, registre em `secoesSobDemanda` no `main.js`:
   `{ seletor: '#modelos', carregar: () => import('./scripts/secoes/modelos.js').then((m) => m.iniciarModelos) }`
5. Animações suaves e lentas: duration 1–1.4s, ease `power3.out`. Importe `gsap`/`ScrollTrigger` de `core/scroll.js`.
6. Conteúdo (textos, links de WhatsApp, depoimentos) fica no HTML, nunca hardcoded no JS.
7. Identificadores de CSS/JS em português. Comentários em CAIXA ALTA; seções divididas com `/* === TITULO === */`.
8. HTML, CSS e JS em arquivos separados. Sem código morto, sem `console.log`.
9. Remover arquivos e dependências que ficarem sem uso.

## Convenções
- **Tokens** ficam em `@theme static` no `main.css`, no namespace do Tailwind (`--color-<nome-em-português>`), e são usados como `var(--color-...)` no CSS ou como utilitário (`bg-fundo`, `text-branco`).
- **Sem preflight**: o reset é o de `base.css`. Não troque por `@import "tailwindcss"`: o preflight muda os h1–h3 (negrito e tamanho) e as imagens.
- Use caminhos absolutos a partir da raiz (`/src/assets/imagens/x.jpg`) no HTML e no CSS, para o Vite aplicar o hash.
- **Imagens**: JPG com no máximo 1920px de largura e qualidade 80. Toda `<img>` tem `width`/`height` reais; abaixo da dobra, `loading="lazy" decoding="async"`. A imagem do hero tem `preload` com `fetchpriority="high"` no `<head>`.
- Media queries ficam no fim de cada arquivo de seção, ordenadas do maior para o menor (`max-width` 900 → 600 → 360), para que a menor vença.
- Domínio canônico: `https://danisushii.com.br/` (canonical, og:url, og:image, sitemap, robots).
