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
public/                       → servido na raiz, SEM hash (cache pela Vercel, ver vercel.json)
  imagens/                    → logos, hero-poster.jpg e demais imagens (<img src="/imagens/...">)
  videos/                     → hero.mp4 (<source src="/videos/...">)
  arquivos/og-image-v2.jpg    → imagem de compartilhamento (1200x630)
  favicon-32.png, apple-touch-icon.png, robots.txt, sitemap.xml
vercel.json                   → Cache-Control: /imagens e /videos 1 dia + SWR 7 dias; /assets (hash) 1 ano, imutável
marca/                        → ORIGINAIS da marca (logo, símbolo); só fonte dos derivados, fora do deploy
ferramentas/
  kanji.js                    → gera src/assets/fontes/*.woff2 e src/estilos/fontes-kanji.css
  derivados.py                → gera o recorte do logo, a og-image e os favicons a partir de marca/
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
  assets/fontes/              → GERADO pelo ferramentas/kanji.js
```

## Seções da home (ordem)
| Seção | Classe / id | JS | Fundo |
|---|---|---|---|
| Cabeçalho + menu mobile | `.cabecalho`, `#menu-mobile` | `cabecalho.js` (main.js) | sempre com fundo sutil: rgba(11,9,8,.45) + `blur(14px) saturate(140%)` + hairline; fixo depois do hero, com .75 (transição de 0.6s); sem backdrop-filter, .85 |
| Hero | `.hero` | `hero.js` (main.js) | mobile: fundo; desktop: superfície (ver "Hero com vídeo") |
| Números | `.numeros` | `numeros.js` | fundo |
| Manifesto | `.manifesto` | `manifesto.js` | superfície |
| Pilares | `.pilares` | `pilares.js` | fundo (3 colunas só a partir de 1200px: "PERSONALIZAÇÃO" não quebra e não cabe em 1/3 antes disso) |
| Formatos | `.formatos` | `formatos.js` | fundo |
| Momentos | `.momentos` / `#momentos` | `momentos.js` | superfície |
| Depoimentos | `.depoimentos` / `#depoimentos` | `depoimentos.js` | fundo |
| Orçamento (comanda) | `.orcamento` / `#orcamento` | `orcamento.js` | superfície (2 colunas só a partir de 1200px; abaixo disso, comanda embaixo com máx. 560px) |
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
- h1/h2: Shippori 400, UPPERCASE, letter-spacing 0.1em, line-height 1.15. h1 base `clamp(36px, 6vw, 80px)` (o h1 do hero tem regra própria, ver "Hero com vídeo"), h2 `clamp(20px, 3vw, 44px)`, h3 17 → 24 → 26px (letter-spacing 0.12–0.14em). Rótulo → h1: 20px; rótulo → h2: 14px no mobile / 18px no desktop.
- **Hierarquia: o h1 do hero é sempre o maior título da página**, em qualquer largura: h1 ≥ h2 > h3. Ao mexer em tamanhos de título (ou na largura da coluna do hero), confira em 320–1920px.
- **h2 com `<br>` forçado** ("Cada evento,<br>uma história." etc.) precisa ficar em exatamente 2 linhas. Se uma coluna ficar estreita demais, empilhe o layout em vez de deixar o h2 quebrar em mais linhas.
- Texto corrido: Inter Tight 16/17px (`.texto-intro`: 17/19px), line-height 1.6, texto-2.
- `.botao.botao-primario` (acento, pill, 52px) · `.botao.botao-secundario` (borda 1px rgba(242,238,234,.28)).
- `.metadado` (mono 12px) · `.destaque` (acento-claro) · `.apagado` (texto-3) · `.visualmente-oculto`.
- `.secao-topo`: rótulo + h2 à esquerda e texto ou link à direita (≥900px); margem até o conteúdo de 56px (mobile) / 64px (desktop).
- Layout: `.envoltorio` (conteúdo com máx. 1344px; respiro de 20 → 32 → 48px exposto em `--respiro`). **Nunca use a classe `container`:** o Tailwind v4 gera um utilitário `container` com `max-width` por breakpoint (768/1024/1280...) na layer utilities, que vence a nossa base. Evite também outros nomes de utilitário do Tailwind como classe (`hidden`, `static`, `flex`...) e `.secao` (96px → 140px a partir de 900px).
- Mobile-first: `min-width` 600 / 900 / 1200, com as media queries no fim de cada arquivo, da menor para a maior.

## Hero com vídeo
**O texto NUNCA fica sobre o vídeo, em nenhuma largura.**
- Estrutura: `.hero > .envoltorio.hero-grade > .hero-conteudo` (texto) + `.hero-quadro > .hero-midia > video.hero-video` + `.hero-legenda`.
- **Mobile (até 899px):** `.hero-midia` fica absoluta no topo do `.hero` (100% de largura, altura `min(100vw * 1.3, 520px)`, `object-position: center 40%`). A base some por `mask-image` no próprio `.hero-midia` (preto até 55%, transparente em 96%, `mask-repeat: no-repeat`, `overflow: hidden`). A máscara fica parada e quem se move no scroll é o `<video>`, então nunca vaza uma linha na transição. O `::after` cuida só do topo escuro (leitura do cabeçalho) e de uma transição suave no meio. O `.hero` tem `padding-top: min(100vw * 1.05, 420px)`, então o texto começa abaixo do vídeo, sobre fundo sólido. A legenda fica escondida.
- **Desktop (900px+):** duas colunas alinhadas embaixo. O texto fica à esquerda (flex 1) e o quadro vertical à direita, em fluxo normal: largura `min(clamp(300px, 28vw, 400px), (100svh - 290px) * 9 / 16)` (o limite pela altura faz quadro e legenda caberem na tela), `aspect-ratio: 9/16` e raio de 4px. Fundo `--color-superficie`, sem degradê. A legenda embaixo mostra "本物 Evento real" à esquerda e "Role ↓" à direita.
- **h1 sempre em 2 linhas fixas:** "PARA QUEM TEM FOME" / "DE EXPERIÊNCIA." em qualquer largura. A `.hero-conteudo` tem `container-type: inline-size`, e o tamanho segue a coluna, tomando a linha 1 como referência. O divisor é a largura de "PARA QUEM TEM FOME" em em, medida no Shippori, com ~2% de folga:
  - até 599px: letter-spacing 0.04em → 13,445em → `font-size: calc(100cqi / 13.7)`;
  - a partir de 600px: letter-spacing 0.1em → 14,525em → `font-size: min(64px, 100cqi / 14.8)`;
  - `white-space: nowrap` no `.hero-titulo` e em cada `.hero-linha` (máscara criada pelo JS a partir do `<br>`);
  - line-height 1.25 e margin-bottom de 20px no mobile / 28px no desktop;
  - fallback sem cqi: `clamp(20px, 5.6vw, 56px)`.
  Se mudar a copy, a fonte ou o letter-spacing do h1, **meça de novo a linha mais longa** e recalcule o divisor.
- **Frase do hero (`.hero-texto`), sempre em 1 linha quando cabe:**
  - **HTML:** `Sushi bar ao vivo e jantares personalizados<span class="hero-texto-extra">, finalizados diante dos seus convidados</span>.` (sem texto duplicado; o ponto fica fora do span).
  - **Versão curta (coluna < 700px):** `.hero-texto-extra { display: none }`. A curta mede 18,605em → divisor 18,98 (2% de folga). No mobile a fonte é `max(15px, min(17px, 100cqi / 18.98))` e, a partir de 600px, `revert-layer` volta ao `.texto-intro` (17 → 19px).
  - **`nowrap`:** só com `@container (min-width: 285px)` (15px × 18,98). Abaixo disso a frase pode quebrar; na prática, em 320px (coluna 280) ela coube a 15px.
  - **Versão completa (`@container (min-width: 700px)`):** mostra o span, sem max-width, ~680px a 19px.
  - Se a frase mudar, meça de novo as duas versões.
- **Ritmo do hero:** h1 → frase → localização → botões com espaços iguais, de 20px no mobile e 28px no desktop. A máscara das linhas do h1 usa `clip-path: inset()` negativo; não use padding/margin negativa, porque a margem vaza para fora do h1 e encurta o espaço até a frase.
- **Carregamento:** o `<video>` tem `muted loop playsinline preload="none"` e poster com preload no `<head>`, mas NÃO tem `autoplay` (o download só começa no `play()`). O `hero.js` chama `play().catch(() => {})` quando o hero entra na tela e `pause()` quando sai (IntersectionObserver). Com `prefers-reduced-motion` ou `navigator.connection.saveData`, o vídeo nunca é iniciado e fica no poster.

## Animações
GSAP + ScrollTrigger; duração 1.2–1.4s; ease `power3.out`. **Tudo desligado com `reduzirMovimento`.** Funcionalidades (menu, comanda, ano) continuam rodando.
- Hero, texto: rótulo, h1 (linha a linha, com máscara criada pelo JS a partir dos `<br>`), `.hero-texto`, `.hero-local` e botões em stagger de 0.12s.
- Hero, vídeo (com `gsap.matchMedia`): no mobile, opacidade 0 → 1 em 1.4s na `.hero-midia` e, no scroll, o `<video>` (não o container mascarado) vai de `yPercent` 0 → 8 e scale 1 → 1.06 (scrub). No desktop, o quadro abre com `clip-path: inset(100% 0 0 0)` → `inset(0)` em 1.4s, junto com o texto, e no scroll sobe com y 0 → -60 (scrub).
- Números: contagem até o valor escrito no HTML (`data-contar-de` define o início, padrão 0).
- Rótulos, h2 e textos de topo: `revelar()` (y 30 → 0 + opacidade).
- Pilares e linhas de Formatos: `revelarEmSequencia()`.
- Momentos: foto com `clip-path: inset()` de baixo para cima.
- Cabeçalho: vira fixo e desce (yPercent -100 → 0) depois do hero.
- Botão hambúrguer (`.cabecalho-menu`, área de 44×44px): 3 `<span aria-hidden="true">` desenhados como o **kanji 三** do Shippori (o mesmo da contagem dos Pilares), na cor `--color-texto` (branco):
  - **Larguras:** 19,4 / 15,4 / 22px (88% / 70% / 100%, medidas no glyph); o do meio é recuado.
  - **Forma:** corpo de 1,5px com a "escama" (uroko) Mincho na ponta direita.
  - **Técnica:** cada span é uma caixa de **4px** recortada por `clip-path: polygon(...)`. Uma altura fracionária faz o Chrome arredondar os riscos de forma desigual.
  - **Espaçamento:** centros a 8px (`gap: 4px`).
  - **Aberto (`aria-expanded="true"`):** o `clip-path` passa para um risco reto (mesmo número de pontos, para a forma se transformar), as larguras vão para 22px e os riscos formam o X: `translateY(±8px) rotate(±45deg)`, com o do meio em `opacity: 0` e `scaleX(0)`.
  - **Transição:** 0.5s `cubic-bezier(0.65, 0, 0.35, 1)`; sem transição com movimento reduzido.
  - O `translateY` é igual à distância entre os centros.
- Menu mobile (`#menu-mobile`): cada link tem `<img class="menu-selo">` (selo do peixe, 32px de altura, opacity .85, raio de 2px) + `<span class="menu-texto">`, em flex com gap de 16px. No hover, `:focus-visible` e `:active`, o selo vai a opacity 1 e o texto a `translateX(4px)` (0.5s). Ao abrir, os itens (selo e texto juntos) entram com y 20 → 0 e opacidade, 0.8s power3.out, stagger 0.08s (`animarItens` em `cabecalho.js`); sem animação com movimento reduzido.
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
10. Imagens e vídeos ficam em public/ (sem hash). Ao trocar o conteúdo de um arquivo, renomeie-o (ex.: hero-v2.jpg) e atualize as referências, para não servir versão antiga do cache. Antes do lançamento, mídias podem ser sobrescritas com o mesmo nome; depois que a v2 for para produção, vale a regra de renomear. Referencie sempre com caminho absoluto da raiz (`/imagens/...`, `/videos/...`) e, em metatags e JSON-LD, com a URL completa (`https://danisushii.com.br/...`).

## SEO e acessibilidade
- Um único h1 por página; hierarquia h2 → h3 (use `.visualmente-oculto` quando a seção não tiver título visível). Use `lang="ja"` em todo kanji.
- Imagens com `width`/`height` reais; placeholders com `aspect-ratio` fixo (CLS zero).
## Mídias da marca
Os **originais** ficam em `marca/` (fora de `public/`, não vão para o deploy) e servem só de fonte. O site usa apenas os **derivados**. Nenhum HTML/CSS/JS pode referenciar `marca/`.

| Arquivo | Onde | Origem |
|---|---|---|
| `marca/logo-sem-fundo.webp` (500×500) | não vai para o site | logo com letras claras e fundo transparente (com muita margem); fonte do recorte |
| `marca/logo.webp` (1200×1200) | não vai para o site | logo sobre fundo escuro texturizado (arte de perfil/redes) |
| `marca/simbolo-peixe.webp` (828×1472) | não vai para o site | selo vermelho com o peixe; fonte dos favicons |
| `public/imagens/logo-sem-fundo-recortado.webp` (332×252) | cabeçalho (`alt="Dani Sushi"`, `fetchpriority="high"`; 42px mobile / 52px desktop) e rodapé (`alt=""`, lazy; 72px) | recorte justo de `marca/logo-sem-fundo.webp` |
| `public/favicon-32.png` / `public/apple-touch-icon.png` (180, fundo #0B0908, 14% de respiro) | `<link rel="icon">` / `<link rel="apple-touch-icon">` | `marca/simbolo-peixe.webp` |
| `public/arquivos/og-image-v2.jpg` (1200×630) | `og:image` e `image` do JSON-LD | à esquerda, o recorte do `hero-poster.jpg`; à direita, o logo recortado + "Sushi bar ao vivo · Desde 2020" (Shippori, #BDB5AE) |
| `public/imagens/hero-poster.jpg` | `poster` do vídeo + preload | frame do `hero.mp4` (ver abaixo) |
| `public/imagens/simbolo-peixe-menu.webp` (54×96, ~1,6 KB) | menu mobile, antes de cada opção (`.menu-selo`, exibido a 18×32, `alt=""`, lazy) | `marca/simbolo-peixe.webp`, 96px de altura (3× de 32px), WebP q85 |

### Regerar os derivados (na raiz do projeto)
O `ferramentas/derivados.py` (python3 + Pillow) tem toda a lógica. Ele lê de `marca/` e do poster e grava em `public/`:
```bash
python3 ferramentas/derivados.py            # tudo: recorte, og-image e favicons
python3 ferramentas/derivados.py recorte    # public/imagens/logo-sem-fundo-recortado.webp
python3 ferramentas/derivados.py og         # public/arquivos/og-image-v2.jpg (depende do recorte e do poster)
python3 ferramentas/derivados.py favicons   # public/favicon-32.png e public/apple-touch-icon.png
python3 ferramentas/derivados.py selo       # public/imagens/simbolo-peixe-menu.webp (selo do menu mobile)
ffmpeg -ss 20 -i public/videos/hero.mp4 -frames:v 1 -q:v 4 public/imagens/hero-poster.jpg   # poster
```
- **Logo mudou:** substitua `marca/logo-sem-fundo.webp` e rode `recorte` e `og`. Se o tamanho do recorte mudar (o script imprime), atualize o `width`/`height` dos dois `<img>`.
- **Símbolo mudou:** substitua `marca/simbolo-peixe.webp` e rode `favicons` e `selo`. Se a proporção mudar, atualize o `width`/`height` dos 3 `<img class="menu-selo">`.
- **Vídeo mudou:** regere o poster (ffmpeg) e depois rode `og`.
- A og-image precisa da fonte em `node_modules/` (rode `npm install` antes). Depois do lançamento, siga a regra 10 (renomear arquivos alterados).

### Vídeo do hero (`videos/hero.mp4`)
- Padrão de exportação: 720×1280, 30fps constante, H.264 High, yuv420p, sem áudio, faststart.
  `ffmpeg -i ENTRADA -vf "scale=720:1280:flags=lanczos" -r 30 -c:v libx264 -crf 28 -preset slow -profile:v high -pix_fmt yuv420p -an -movflags +faststart public/videos/hero.mp4`
- Meta: até 5 MB (versão atual: 30,4s, 4,97 MB). O master em alta fica fora do repositório (`~/Desktop/hero-master-1080.mp4`).
- Poster: frame dos **20s** (mesa montada, sem texto sobreposto e sem pessoas em close). Ao trocar o vídeo, escolha um frame com os mesmos critérios, regere o poster e rode `python3 ferramentas/derivados.py og`.
- Contraste ≥ 4.5:1; foco visível (acento-claro no escuro, carimbo no papel); labels reais; o menu mobile fecha com Esc, deixa o resto da página `inert` e devolve o foco ao botão.
- JSON-LD `FoodEstablishment` no `<head>` (o Instagram em `sameAs` ainda é TODO).
- Domínio canônico: `https://danisushii.com.br/` (canonical, og:url, og:image, sitemap, robots).
