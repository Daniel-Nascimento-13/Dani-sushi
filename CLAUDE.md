# Dani Sushi — Site

Site da Dani Sushi (https://danisushii.com.br): sushi bar ao vivo e jantares personalizados. A home leva o visitante a contar os detalhes do evento no formulário da Experiência e continuar a conversa pelo WhatsApp.

## Fluxo de trabalho
- **`main` = produção.** Todo o trabalho é feito direto na `main`. A Vercel publica cada push automaticamente em https://danisushii.com.br.
- Ao fim de cada tarefa: `npm run build` (corrigir erros), commit e push na `main`.
- **Se algo quebrar em produção:** rollback pelo painel da Vercel, em Deployments → Instant Rollback (volta ao deploy anterior na hora); depois corrija na `main`.
- **Branch `v2`:** histórico do redesign. Não apague, não faça commits nem traga mudanças para ela.

## Stack
Vite + HTML/CSS/JS vanilla + GSAP + ScrollTrigger + Lenis + fontes self-hosted (@fontsource). Sem framework de CSS: os tokens são variáveis CSS em `main.css`.

- `npm run dev` — servidor local
- `npm run build` — build de produção em `dist/` (rodar e corrigir erros ao fim de toda tarefa)
- `npm run kanji` — regenera o subconjunto de kanji (roda sozinho antes de `dev` e `build`)

## Estrutura
```
index.html                    → home; carrega só /src/main.js
momentos/index.html           → página /momentos/
depoimentos/index.html        → página /depoimentos/ (carrossel gerado no build + formulário de envio)
404.html                      → página de erro (noindex; a Vercel serve com status 404)
api/                          → funções da Vercel (Node, sem dependências; "_" no nome = não vira rota)
  depoimentos.js              → POST do formulário de depoimentos
  moderar.js                  → aprovar/recusar pelo link do e-mail
  manter.js                   → keep-alive do Supabase (cron diário da Vercel)
  _comum.js                   → helpers (limites, escape de HTML, Supabase, token de moderação)
supabase/schema.sql           → tabela depoimentos (rodar no SQL Editor do Supabase)
.env.example                  → variáveis do fluxo de depoimentos (o .env nunca vai para o Git)
public/                       → servido na raiz, SEM hash (cache pela Vercel, ver vercel.json)
  imagens/                    → imagens do site (<img src="/imagens/...">)
    marca/                    → derivados da marca: logo-sem-fundo-recortado.webp, simbolo-peixe-menu.webp
    hero/                     → hero-poster.jpg (poster do vídeo + preload)
    compartilhamento/         → og-image.jpg (1200x630, og:image e JSON-LD)
    momentos/<evento>/        → fotos de /momentos e da home: <N>-500|1000.webp|jpg (derivados.py momentos)
  videos/                     → hero.mp4 (<source src="/videos/...">)
  favicon-32.png, apple-touch-icon.png, robots.txt, sitemap.xml
vercel.json                   → trailingSlash, Cache-Control (/imagens e /videos 1 dia + SWR; /assets 1 ano) e cron
marca/                        → ORIGINAIS da marca (logo, símbolo); só fonte dos derivados, fora do deploy
ferramentas/
  kanji.js                    → gera src/assets/fontes/*.woff2 e src/estilos/fontes-kanji.css (lê *.html e <pasta>/index.html)
  derivados.py                → gera o recorte do logo, a og-image, os favicons, o selo e as fotos dos momentos
src/
  main.js                     → ENTRADA ÚNICA: fontes, CSS, rolagem, cabeçalho e hero; o resto sob demanda
  estilos/
    main.css                  → camadas (theme, base, components) + tokens (@layer theme) + imports
    fontes-kanji.css          → GERADO (não editar)
    base.css                  → reset, foco, layout, fundos, tipografia, rótulo (layer base)
    componentes.css           → botões, .secao-topo, .link-secao, abertura das páginas internas (layer base)
    secoes/<secao>.css        → um arquivo por seção (layer components); momentos-pagina.css e
                                depoimentos-envio.css separam a página /momentos e o envio de depoimentos
  scripts/
    core/rolagem.js           → Lenis + GSAP/ScrollTrigger sincronizados; ÚNICO lugar que registra plugins
                                (reexporta gsap e ScrollTrigger; trata cliques em âncoras #id e [data-topo])
    core/carregador.js        → carregarAoAproximar(seletor, carregar): import() dinâmico via IntersectionObserver
    secoes/<secao>.js         → um módulo por seção, exporta iniciar<Secao>(elemento)
    utils/movimento.js        → export const reduzirMovimento (prefers-reduced-motion)
    utils/revelar.js          → revelar(elementos) e revelarEmSequencia(elementos, gatilho)
    utils/teclado.js          → detectarTeclado(): html.usando-teclado enquanto a navegação for por teclado
  assets/fontes/              → GERADO pelo ferramentas/kanji.js
```

## Seções da home (ordem)
| Seção | Classe / id | JS | Fundo |
|---|---|---|---|
| Cabeçalho + menu mobile | `.cabecalho`, `#menu-mobile` | `cabecalho.js` (main.js) | sempre fixo, fundo próprio (ver "Navegação") |
| Hero | `.hero` | `hero.js` (main.js) | `.fundo-base` (sempre preto, em todas as larguras; ver "Hero com vídeo") |
| Números | `.numeros` | `numeros.js` | `.fundo-superficie` |
| Manifesto | `.manifesto` | `manifesto.js` | `.fundo-base` |
| Pilares | `.pilares` | `pilares.js` | `.fundo-superficie` |
| Formatos | `.formatos` | `formatos.js` | `.fundo-base` |
| Momentos | `.momentos` / `#momentos` | `momentos.js` | `.fundo-superficie` |
| Depoimentos | `.depoimentos` / `#depoimentos` | `depoimentos.js` | `.fundo-base` (some sem aprovados; ver "Depoimentos") |
| Experiência | `.experiencia` / `#experiencia` | `experiencia.js` | `.fundo-superficie` |
| Rodapé | `.rodape` | `rodape.js` (ano atual em `[data-ano-atual]`) | `.fundo-base` |

### Fundos alternados
- **O hero é sempre preto.** A partir dele, as seções alternam `.fundo-base` (`--color-fundo`) e `.fundo-superficie` (`--color-superficie`) pela ordem real do HTML, até o rodapé.
- As classes ficam no HTML e são definidas em `base.css`; nenhum CSS de seção define `background` próprio.
- **Sem `nth-child`:** a alternância quebraria quando uma seção entra ou sai.
- **Ao adicionar ou mover uma seção, refaça a alternância.**
- **Divisórias:** a mudança de fundo já separa as seções, então não use bordas superior/inferior entre seções. As hairlines ficam só dentro dos blocos (listas de Números, Pilares e Formatos; o © do rodapé).

### Números
- Conteúdo: 2020 O começo ("Mais de cinco anos servindo experiências."; conta a partir de 2000 via `data-contar-de`) / +50 Eventos ("Jantares, celebrações e eventos corporativos.") / +10 Cidades atendidas ("No Vale do Taquari, Serra e Porto Alegre.").
- Nos dois últimos o "+" é fixo e a contagem vai de 0 ao número.
- **Mobile (até 899px):** 3 colunas lado a lado com hairline vertical; legenda escondida; padding de 56px.
  - Número em cima (`order: -1`), com `min(44px, 100cqi / 2.14)` e `container-type` no item. O mais largo é "2020" (2,062em) + 4% de folga; "+50" = 1,627em e "+10" = 1,612em. Se mudar um número, meça de novo.
  - Rótulo embaixo (10px, 0.18em, margin-top de 10px).
- **Desktop:** rótulo, número de 104px e legenda, padding da `.secao` (`revert-layer`).

### Pilares
- 3 colunas só a partir de 1200px: "PERSONALIZAÇÃO" não quebra e não cabe em 1/3 antes disso.

### Formatos
- Cada linha é um link inteiro para `#experiencia`. **Sem seta.**
- Número (mono 12px) em `--color-acento-claro`; grid de `32px 1fr` no mobile (descrição embaixo, na coluna 2) e de `80px 1fr 1.1fr` a partir de 900px.
- O título fica vermelho no hover (só com mouse) e no `:focus-visible`.
- No mobile, "Jantares residenciais" e "Eventos corporativos" quebram em 2 linhas até 360px e cabem em 1 a partir de 390px (quebra natural, sem nowrap).

### Momentos (home)
- 3 cards = os 3 primeiros registros de /momentos/, na mesma ordem: foto 1 de corporativo-marcia, aniversario-adriana e formatura-leo (formatura com `--foco: 55% 50%`, para a barca caber inteira no 4:5 e no 3:4).
- Alt, cidade, convidados e peças copiados de /momentos/ (o complemento "+ yakisoba e poke" fica só lá). **Se a ordem de /momentos/ mudar, troque os cards também.**
- `<picture class="momentos-foto">` (WebP + JPG, srcset, lazy) na moldura fixa do card: 4:5 no mobile; 1:1 e 3:4 nos cards 2 e 3 a partir de 900px, com `object-fit: cover` e `--foco`.
- `sizes` por card pela largura desenhada da foto (ver "Sizes" em "Fotos dos momentos").
- h3 com o tipo e `.metadado` "Cidade · N convidados · N peças". No topo, `.link-secao` "Ver todos os momentos →".

### Depoimentos (home)
- Rótulo + h2 + `.link-secao` "Ver todos os depoimentos →" (`/depoimentos/`) e o carrossel com os 6 aprovados mais recentes (gerados no build).
- **Sem aprovados, a seção inteira some** (ver "Depoimentos").

### Experiência
- Formulário do evento (cartão "Sua experiência", ver "Formulário da Experiência").
- Rótulo "体験 Taiken · Experiência", h2 "Vamos criar uma experiência" / "para você?" (`<br class="so-desktop">`: 2 linhas a partir de 600px, quebra natural no mobile).
- **Sempre empilhado** (cartão embaixo, máx. 560px): a linha 1 do h2 mede 20,87em (~918px a 44px) e quebraria ao lado do cartão.
- Nunca use "pedido", "comanda", "solicitação", "orçamento" nem "preencher" nos textos visíveis da seção, dos links para ela nem na mensagem do WhatsApp.

### Rodapé
- **Tudo centralizado**, um embaixo do outro, em todas as larguras: logo (72px) → 24px → frase → 40px → nav → hairline → ©.
- **Frase:** "Você faz a vibe e o Dani Sushi!" (Shippori uppercase, 0.12em, `clamp(16px, 2.2vw, 22px)`, "Dani Sushi!" em `.destaque`). No mobile, `<br class="so-mobile">` quebra em "VOCÊ FAZ A VIBE / E O DANI SUSHI!".
- **Nav:** 4 itens (Momentos, Depoimentos, Experiência, Instagram; o WhatsApp fica no formulário e nos botões). Cada link `inline-flex` com `min-height: 44px` (área de toque) e `nowrap`. Sem "Início" (o logo já leva ao início).
  - **Até 599px:** 14px com gap de 18px. Os 4 somam 328,5px (64,8 + 80,3 + 69,3 + 60,1 + 3 × 18), então ficam em **1 linha** com `@container (min-width: 334px)` (1,7% de folga), ou seja, a partir de 375px.
  - Abaixo disso (320 e 360): **grid 2 × 2 de colunas iguais** (`repeat(2, minmax(0, 1fr))`, `justify-items: center`), Momentos sobre Experiência e Depoimentos sobre Instagram, alinhados. Nunca o 2 + 2 solto nem 3 + 1.
  - **A partir de 600px:** 15px, gap de 28px, 1 linha. Se um link mudar, meça de novo.
- **©:** "© 2020–{ano} · Dani Sushi · Todos os direitos reservados." (mono 11px, texto-3; no mobile, 2 linhas sem o "·" pendurado, via `.so-desktop` e `<br class="so-mobile">`).

## Navegação
### Cabeçalho
- **Sempre fixo** desde o carregamento (`position: fixed`, sem troca de estado nem salto).
- Fundo sutil: rgba(11,9,8,.45) + `blur(14px) saturate(140%)` + hairline. Depois de 80px de scroll ganha `.cabecalho-rolado` (.75, só cor, transição de 0.6s); sem backdrop-filter, .85.
- `transform: translateZ(0)` + `will-change: background-color` contra o piscar no Safari/iOS. Sem animação de entrada (a cor muda por classe, não por GSAP).
- Nav do desktop: Início, Momentos, Depoimentos, Experiência + botão "Vamos conversar". Em 900px, a nav com 4 itens (371px) + logo + botão deixa 121px de sobra; se um item novo entrar, meça de novo.
- Link da página atual com `aria-current="page"` (sublinhado em `--color-acento`, em `cabecalho.css`).
- Nas páginas internas, cabeçalho, menu e rodapé são cópias dos da home, com links absolutos (`/`, `/momentos/`, `/#depoimentos`, `/#experiencia`).

### Âncoras e cabeçalho fixo
- `--altura-cabecalho` (77px no mobile / 97px a partir de 900px, altura real com a hairline) em `:root` e `html { scroll-padding-top: var(--altura-cabecalho) }`.
- O `lenis.scrollTo` **já desconta o `scroll-padding-top`**, então em `rolagem.js` o clique em âncora chama `lenis.scrollTo(alvo, { duration: 1.4 })` **sem offset** (passar offset desconta duas vezes).
- Resultado: a seção começa exatamente na base do cabeçalho. Se a altura do cabeçalho mudar, atualize a variável.

### "Início"
- Primeiro item da nav do cabeçalho e do menu mobile, nas 3 páginas (fora do rodapé, que tem a largura calculada para 4 itens). `href="/"` em todas.
- Na home ele tem `aria-current="page"` (sublinhado da página atual) e `data-topo`: o `rolagem.js` intercepta o clique em `a[data-topo]` e sobe com `lenis.scrollTo(0, { duration: 1.4 })`, sem recarregar.
- Com movimento reduzido (sem Lenis), `window.scrollTo(0, 0)` direto. No menu mobile, o listener do menu fecha antes (o clique chega nele antes do `document`).

### Botão hambúrguer (`.cabecalho-menu`, área de 44×44px)
- 3 `<span aria-hidden="true">` desenhados como o **kanji 三** do Shippori (o mesmo da contagem dos Pilares), na cor `--color-texto` (branco).
- **Larguras:** 19,4 / 15,4 / 22px (88% / 70% / 100%, medidas no glyph); o do meio é recuado.
- **Forma:** corpo de 1,5px com a "escama" (uroko) Mincho na ponta direita.
- **Técnica:** cada span é uma caixa de **4px** recortada por `clip-path: polygon(...)`. Uma altura fracionária faz o Chrome arredondar os riscos de forma desigual.
- **Espaçamento:** centros a 8px (`gap: 4px`). O `translateY` do X é igual à distância entre os centros.
- **Aberto (`aria-expanded="true"`):** o `clip-path` vira um risco reto (mesmo número de pontos, para a forma se transformar), as larguras vão para 22px e os riscos formam o X: `translateY(±8px) rotate(±45deg)`, com o do meio em `opacity: 0` e `scaleX(0)`.
- **Transição:** 0.5s `cubic-bezier(0.65, 0, 0.35, 1)`; sem transição com movimento reduzido.

### Menu mobile (`#menu-mobile`)
- Cada link tem `<img class="menu-selo">` (selo do peixe, 24px de altura, `width="14" height="24"`, opacity .85, raio de 2px) + `<span class="menu-texto">`, em flex com gap de 14px.
- No hover (só mouse), `:focus-visible` e `:active`, o selo vai a opacity 1 e o texto a `translateX(4px)` (0.5s).
- Ao abrir, os itens (selo e texto juntos) entram com y 20 → 0 e opacidade, 0.8s power3.out, stagger 0.08s (`animarItens` em `cabecalho.js`); sem animação com movimento reduzido.
- Fecha com Esc, deixa o resto da página `inert` e devolve o foco ao botão.

## Hero com vídeo
**O texto NUNCA fica sobre o vídeo, em nenhuma largura.**
- Estrutura: `.hero > .envoltorio.hero-grade > .hero-conteudo` (texto) + `.hero-quadro > .hero-midia > video.hero-video` + `.hero-legenda`.

### Layout
- **Mobile (até 899px):** `.hero-midia` fica absoluta no topo do `.hero` (100% de largura, altura `min(100vw * 1.3, 520px)`, `object-position: center 40%`).
  - A base some por `mask-image` no próprio `.hero-midia` (preto até 55%, transparente em 96%, `mask-repeat: no-repeat`, `overflow: hidden`). A máscara fica parada e quem se move no scroll é o `<video>`, então nunca vaza uma linha.
  - O `::after` cuida só do topo escuro (leitura do cabeçalho) e de uma transição suave no meio.
  - O `.hero` tem `padding-top: min(100vw * 1.05, 420px)`: o texto começa abaixo do vídeo, sobre fundo sólido. A legenda fica escondida.
- **Desktop (900px+):** duas colunas alinhadas embaixo. Texto à esquerda (flex 1) e quadro vertical à direita, em fluxo normal.
  - Largura do quadro: `min(clamp(300px, 28vw, 400px), (100svh - 290px) * 9 / 16)` (o limite pela altura faz quadro e legenda caberem na tela), `aspect-ratio: 9/16`, raio de 4px.
  - Fundo preto (`.fundo-base`), sem degradê. A legenda embaixo mostra "本物 Evento real" à esquerda e "Role ↓" à direita.

### h1 sempre em 2 linhas fixas
- "PARA QUEM TEM FOME" / "DE EXPERIÊNCIA." em qualquer largura. A `.hero-conteudo` tem `container-type: inline-size`, e o tamanho segue a coluna, tomando a linha 1 como referência.
- O divisor é a largura de "PARA QUEM TEM FOME" em em, medida no Shippori, com ~2% de folga:
  - até 599px: letter-spacing 0.04em → 13,445em → `font-size: calc(100cqi / 13.7)`;
  - a partir de 600px: letter-spacing 0.1em → 14,525em → `font-size: min(64px, 100cqi / 14.8)`;
  - `white-space: nowrap` no `.hero-titulo` e em cada `.hero-linha` (máscara criada pelo JS a partir do `<br>`);
  - line-height 1.25 e margin-bottom de 20px no mobile / 28px no desktop;
  - fallback sem cqi: `clamp(20px, 5.6vw, 56px)`.
- Se mudar a copy, a fonte ou o letter-spacing do h1, **meça de novo a linha mais longa** e recalcule o divisor.

### Frase (`.hero-texto`), sempre em 1 linha quando cabe
- **HTML:** `Sushi bar ao vivo e jantares personalizados<span class="hero-texto-extra">, finalizados diante dos seus convidados</span>.` (sem texto duplicado; o ponto fica fora do span).
- **Versão curta (coluna < 700px):** `.hero-texto-extra { display: none }`. A curta mede 18,605em → divisor 18,98 (2% de folga).
  - No mobile a fonte é `max(15px, min(17px, 100cqi / 18.98))`; a partir de 600px, `revert-layer` volta ao `.texto-intro` (17 → 19px).
- **`nowrap`:** só com `@container (min-width: 285px)` (15px × 18,98). Abaixo disso a frase pode quebrar; na prática, em 320px (coluna 280) ela coube a 15px.
- **Versão completa (`@container (min-width: 700px)`):** mostra o span, sem max-width, ~680px a 19px.
- Se a frase mudar, meça de novo as duas versões.

### Localização e botões
- **Localização (`.hero-local`), mobile:** `font-size: max(12px, min(14px, (100cqi - 26px) / 24.4))`. O texto mede 23,93em + 2% de folga; os 26px são o pin (16px) + o gap (10px).
  - `nowrap` + pin centralizado (`align-items: center`) com `@container (min-width: 319px)`: 1 linha a partir de 360px; em 320 quebra a 12px. A partir de 600px volta a 14px (16px no desktop).
- **Botões, mobile:** flex com gap de 10px e `flex-wrap`; cada `.botao` com `flex: 1 1 auto`, `min-height: 48px`, padding 0 18px e 15px.
  - Lado a lado a partir de 360px: "Vamos conversar" 155 + 10 + "Ver momentos" 138 = 303px numa coluna de 320 (folga de 17px, medido no Chrome com os botões sem esticar). Se o texto de um botão crescer, eles empilham no 360.
  - Em 320 o wrap empilha, cada um com 100%. A partir de 600px voltam ao padrão (52px, padding 28px, gap 12px, sem esticar).
- **Ritmo:** h1 → frase → localização → botões com espaços iguais, de 20px no mobile e 28px no desktop.
- A máscara das linhas do h1 usa `clip-path: inset()` negativo; não use padding/margin negativa, porque a margem vaza para fora do h1 e encurta o espaço até a frase.

### Carregamento
- O `<video>` tem `muted loop playsinline preload="none"` e NÃO tem `autoplay` (o download só começa no `play()`).
- Poster com `<link rel="preload" as="image" fetchpriority="high">` no `<head>`. O poster é o LCP da home: nunca o esconda com opacidade/clip-path no mobile.
- O `hero.js` chama `play().catch(() => {})` quando o hero entra na tela e `pause()` quando sai (IntersectionObserver).
- Com `prefers-reduced-motion` ou `navigator.connection.saveData`, o vídeo nunca é iniciado e fica no poster.

## Página /momentos (`momentos/index.html`)
- Vite multipágina: `build.rollupOptions.input` em `vite.config.js` (`principal`, `momentos`, `depoimentos`, `erro` = 404.html); o build gera `dist/momentos/index.html`, servido em `/momentos/`. Toda página nova entra nesse `input` e no `sitemap.xml`.
- Fundos: `.momentos-pagina` (abertura + registros, `.fundo-base`) → `.momentos-fechamento` (`.fundo-superficie`) → rodapé (`.fundo-base`).
- Abertura compartilhada com /depoimentos em `componentes.css`: `.pagina-topo`, `.pagina-abertura`, `.pagina-voltar`, `.pagina-sobretitulo`, `.pagina-titulo` + `--divisor-titulo` por página, `.pagina-intro`.
- h1 ("Cada evento," / "uma história.") e h2 do fechamento sempre em 2 linhas, com `nowrap` + `cqi`: divisores 10,1 ("UMA HISTÓRIA." = 9,787em) e 14,3 ("PODE SER O PRÓXIMO." = 13,872em), com 3% de folga pelo itálico sintético.
- O CSS da página fica em `secoes/momentos-pagina.css` (o da seção da home em `momentos.css`), **desktop primeiro**, com `max-width` 899 → 599 → 359.
- JS: `iniciarMomentos` (o mesmo da home) revela cada `.momento` com `revelar()` quando a seção é `.momentos-pagina`.

### Registros
- **12 registros** (`<article class="momento">`, hairline no topo), numerados 01 a 12, nesta ordem:
  corporativo-marcia, aniversario-adriana, formatura-leo, casamento-dani-diuly, festa-fantasia, jantar-karina, pre-wedding-guto-helo, jantar-eduarda, aniversario-rafaela, jantar-marcelo, aniversario-natalia, aniversario-naide.
- Ao reordenar, mova o `<article>` inteiro e renumere o `.momento-numero` e o id `momento-NN-titulo` (+ `aria-labelledby`) pela posição. O `fetchpriority="high"` (sem lazy) fica sempre na foto principal do novo registro 01.
- Cada registro: `.momento-tipo` ("01 — Casamento"), h2 com um título curto e único (ex.: "Duas noivas, mil peças."; a cidade fica só no `<dl>`) e descritivo em 2 `<p class="momento-descricao">`.
- `<dl class="momento-dados">`: Cidade (`<dd class="momento-dados-texto">`, menor que os números), Convidados e Peças (complemento, como "+ yakisoba e poke", em `<span class="momento-dados-extra">`, embaixo do número).

### Dados sempre em 3 colunas na mesma linha, em qualquer largura
- Grid `minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)`, `align-items: start`, `column-gap: clamp(12px, 2vw - 6px, 24px)`, `max-width: 440px`.
- A cidade pode quebrar em 2 linhas na própria coluna (line-height 1.3; "Cruzeiro / do Sul"); rótulos e números com `nowrap`.
- Medidas do pior caso:
  - "Encantado" (maior palavra de cidade) = 5,075em → 1,4fr dá 105px em 320 (≥ 101,5).
  - "CONVIDADOS" = 81,4px (11px, 0.14em) não cabe nos 75px da coluna em 320: **até 359px** o `dt` usa letter-spacing 0.06em (72,6px + 2%).
  - "3.000" = 2,333em (112px a 48px numa coluna de 116 em 1440).
- Testado de 320 a 1920px sem vazar. Se entrar uma cidade com palavra maior que "Encantado" ou um número maior que "3.000", meça de novo.

### Galeria
- `.momento-galeria` com 3 `<picture>` (WebP + JPG): foto 1 = principal, 2 e 3 = laterais. 2fr/1fr com a foto 1 nas 2 linhas; até 599px, foto 1 na largura toda e 2 + 3 lado a lado.
- O srcset usa a largura **real** de cada arquivo (`500w` e a do "-1000", que pode ser menor que 1000); `width`/`height` com a proporção real da foto.
- Tudo `loading="lazy" decoding="async"`, exceto a principal do registro 01 (`fetchpriority="high"`, sem lazy).
- `sizes` por foto, pela largura desenhada (ver "Sizes" em "Fotos dos momentos").
- **Moldura fixa + enquadramento:** as molduras não mudam com a foto (`object-fit: cover`). Para ajustar o corte, use `style="--foco: 50% 30%"` no `<img>` (ou no `<picture>`); o padrão é `object-position: var(--foco, 50% 50%)`, também nos cards da home.

## Depoimentos (página /depoimentos + envio + moderação por e-mail)
- h1 "Quem viveu," / "conta." → divisor 8,7 ("QUEM VIVEU," = 8,437em). h2 do envio "Esteve em um" / "dos nossos eventos?" → `100cqi / 14.9` ("DOS NOSSOS EVENTOS?" = 14,583em).
- CSS: carrossel (home e página) em `secoes/depoimentos.css`; formulário de envio em `secoes/depoimentos-envio.css`.

### Fluxo
1. Formulário (`#enviar`) → `POST /api/depoimentos`: honeypot `site`, validação com os limites do banco, sem HTML, rate limit de 3/h por `ip_hash` = sha256(IP + SEGREDO_MODERACAO).
2. Grava `pendente` no Supabase → e-mail (Resend) para `EMAIL_AVISO` com Aprovar/Recusar.
3. `GET /api/moderar` só mostra a confirmação (antivírus de e-mail pré-abre links); o `POST` do botão muda o status (só se ainda `pendente`).
4. Ao aprovar, `POST` no `VERCEL_DEPLOY_HOOK_URL` → novo build.

### E-mail, token e Supabase
- **E-mail (Resend):** remetente `Dani Sushi <avisos@danisushii.com.br>` (em `api/depoimentos.js`). Domínio `danisushii.com.br` verificado no Resend, região São Paulo (`sa-east-1`).
  - Registros DNS no registro.br, só para o e-mail: TXT `resend._domainkey` (DKIM), CNAME `rsend`, CNAME `send` e TXT `_dmarc`. **Os registros A e o CNAME do `www` são do site (Vercel): não altere.**
- **Token dos links:** HMAC-SHA256(id + ação, SEGREDO_MODERACAO), comparado com `timingSafeEqual`. Trocar o segredo invalida os links já enviados.
- **Supabase:** RLS ativo e **nenhuma policy**; tudo passa pela service role key, só no servidor (funções e build). Nunca use essa chave no front.
  - A chave vai sempre no header `apikey`; o `Authorization: Bearer` só vai com a chave **legada** (JWT, começa com `eyJ`): as chaves novas `sb_secret_...` não são JWT e são recusadas no `Authorization` (`consultarSupabase` em `api/_comum.js`).

### Build (`depoimentosAprovados` em `vite.config.js`)
- `<!-- DEPOIMENTOS_HOME -->` (6 mais recentes) e `<!-- DEPOIMENTOS -->` (todos) viram `<li class="depoimentos-item"><figure class="depoimento">`, com escape de HTML.
- Sem aprovados, sai tudo entre `<!-- DEPOIMENTOS:INICIO -->` e `<!-- DEPOIMENTOS:FIM -->`; se o trecho removido tinha `fundo-*` (a seção da home), os fundos seguintes se invertem e a alternância continua.
- **Não existem depoimentos de exemplo** (nem em dev): o site só mostra depoimentos reais aprovados.
- Sem `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`: em dev e no build local, segue sem depoimentos (a seção da home some e /depoimentos/ fica só com o formulário); **na Vercel, o build falha** com "Depoimentos: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY...".
- Com as variáveis, qualquer falha na busca derruba o build com "Depoimentos: falha ao buscar os aprovados no Supabase..." (+ status e resposta do Supabase), e a Vercel mantém o deploy anterior no ar.
- Para testar o carrossel localmente sem gravar no Supabase, gere cópias do `dist/index.html` com cards fictícios dentro de `dist/` (não versionado) e sirva com `vite preview`.

### Carrossel (`.depoimentos-carrossel`, mesmo HTML na home e na página)
- Scroll-snap nativo; mobile com swipe, próximo card aparecendo e indicador "1 / N"; 2 cards a partir de 600px; 3 + setas a partir de 900px.
- Os controles (`.depoimentos-controles`) somem **pelo CSS, pela quantidade de cards**, quando todos cabem: até 599px com 1 card, de 600 a 899px com até 2, a partir de 900px com até 3 (`.depoimentos-carrossel:not(:has(.depoimentos-item:nth-child(N + 1)))`).
- Assim a altura da seção já sai certa no primeiro paint: se o JS (carregado sob demanda) escondesse os controles, a página encolheria no meio da rolagem de uma âncora e o Lenis pararia fora do lugar.
- Se a quantidade de cards visíveis por largura (`flex-basis`) mudar, atualize esses seletores. O JS só cuida das setas (habilitar/desabilitar) e do indicador "1 / N".

### Formulário de envio
- `novalidate`; limites em `minlength`/`maxlength` no HTML; erros via `aria-invalid` + `data-erro` na dica (mesmo padrão do formulário da Experiência).
- Botão desabilitado durante o envio; sucesso esconde o form e mostra `.depoimentos-recebido` (já no HTML com `hidden`, com `.link-secao` "Ver momentos →").
- Erro mostra `.depoimentos-erro` (429 usa o `data-limite`) e o botão vira "Tentar de novo".
- Em `npm run dev` não existe `/api`, então o envio sempre cai no erro (teste com `vercel dev`).

### Keep-alive do Supabase (`api/manter.js`)
- O plano Free pausa o projeto após ~7 dias sem uso, o que derrubaria os builds (a busca dos aprovados falha) e o formulário.
- O cron da Vercel (`vercel.json`: `/api/manter`, `0 12 * * *` = diário às 12h UTC / 9h de Brasília; o Hobby permite 1 execução por dia) faz `GET` com `Authorization: Bearer ${CRON_SECRET}` (enviado automaticamente pela Vercel; comparado com `timingSafeEqual`).
- A rota faz uma consulta leve (`depoimentos?select=id&limit=1`). Sem header, header errado ou `CRON_SECRET` não cadastrado → 401; falha no Supabase → 500 + `console.error` com o motivo, sem chaves.
- `CRON_SECRET` só em Production.

## Formulário da Experiência (cartão "Sua experiência")
- Classes e ids com o prefixo `experiencia-` (`.experiencia-form`, `.experiencia-campo`, `.experiencia-ajuda`, `#experiencia-tipo`...); JS em `experiencia.js` (`iniciarExperiencia` → `iniciarFormulario`), CSS em `secoes/experiencia.css`.
- **Cabeçalho do cartão:** linha 1 = h3 "Sua experiência" (`.experiencia-form-titulo`, `nowrap`); divisor tracejado; linha 2 = `.experiencia-form-subtitulo` "Detalhes do evento".
  - No mobile o h3 segue a largura do cartão: `min(20px, 100cqi / 12.3)` ("SUA EXPERIÊNCIA" = 12,023em + 2%; `container-type` no `.experiencia-form-topo`).

### Dados e mensagem
- No `<form>` ficam o número do WhatsApp (`data-whatsapp`) e a frase da mensagem (`data-mensagem`) com marcadores `{tipo}`, `{data}`, `{convidados}` e `{cidade}`.
- Cada campo tem `data-mensagem` com o seu marcador; cada `<option>` do tipo tem `data-frase` com o artigo ("um jantar residencial", "uma celebração").
- Os valores saem **como a pessoa digitou** (nada é arredondado nem alterado), exceto a data e o tipo.
- **Mensagem (`montarMensagem` em `experiencia.js`), sem emojis, em 1 parágrafo:**
  ```
  Olá, Dani! Estou planejando um evento social para quinta-feira, 29/10/2026, com cerca de 30 convidados em Lajeado. Gostaria de conversar sobre a experiência.
  ```
  - A data é montada com `new Date(ano, mes - 1, dia)` (fuso local) + `Intl.DateTimeFormat('pt-BR', { weekday: 'long' })` em minúsculas + dd/mm/aaaa.

### Campos
- **Ordem** (a do HTML e da mensagem não muda; o layout usa `grid-template-areas` com `.experiencia-campo-tipo/-data/-convidados/-cidade`):
  - **Até 599px:** Tipo / Data / Convidados + Cidade. A data ocupa a linha inteira porque, em meia coluna, quebrava no iPhone.
  - **A partir de 600px:** Tipo / Data + Convidados / Cidade. Conferido em 1200 e 1440px, sem quebra.
  - `align-items: start`: a dica de Convidados, que tem 2 linhas em meia coluna, não empurra a Cidade, e os inputs ficam alinhados.
- **Date no Safari/iOS:**
  - O `input[type="date"]` tem `-webkit-appearance: none`, `display: block`, `height: 44px` (o conteúdo nativo deixava o campo com 45px no Chrome e 47px no WebKit), `min-width: 0`, `text-align: left` e `nowrap`.
  - `::-webkit-date-and-time-value` com `margin: 0` e `text-align: left`: sem centralizar e sem a margem do iOS. O calendário nativo continua abrindo no toque.
- **"Escolha a data":** o Safari não mostra placeholder em date. O input fica dentro de `.experiencia-data`, com um `<span class="experiencia-data-vazia" aria-hidden="true">` no HTML (`pointer-events: none`, então o toque chega ao input).
  - O span aparece com o campo vazio e sem foco; nesse estado a cor do input fica `transparent`, para não sobrepor o "dd/mm/aaaa" do desktop. No foco, o texto nativo volta (dá para digitar no desktop).
  - O JS (`marcarPreenchida`, no carregamento e em `input`/`change`) aplica `.experiencia-data-preenchida` quando há `value` ou `validity.badInput` (data digitada pela metade).

### Validação, erro e foco
- **Validação própria:** o form tem `novalidate`, sem balão do navegador e sem `reportValidity`/`setCustomValidity`.
  - **Convidados:** inteiro ≥ `min` (10). Vazio, não numérico, decimal ou < 10 bloqueia o envio.
  - **Data:** ≥ hoje; o `min` é definido via JS no carregamento, no fuso local (AAAA-MM-DD).
  - **Tipo e cidade:** precisam estar preenchidos.
- **Estado de erro:** `aria-invalid="true"` (nunca `toggleAttribute`, que grava `""` e equivale a "válido"), linha inferior em `--color-acento` e a dica trocada pelo texto do `data-erro`, em acento.
  - A dica é o `<p class="experiencia-ajuda" aria-live="polite">` ligado por `aria-describedby`. O texto normal dela fica no HTML e é restaurado ao corrigir.
  - A validação roda no blur (se algo foi preenchido) e no envio, quando o foco vai para o primeiro campo inválido. Ao digitar, o erro sai assim que o campo fica válido.
- **Dica:** mono 11px, tinta a 60% (4,51:1 sobre o papel, no limite; não clareie). O "Escolha a data" usa a mesma cor.
- **Foco padronizado em todos os campos:** linha inferior de 2px em acento em qualquer foco (`box-shadow`, sem mudar a altura).
  - O contorno (`outline: 2px solid var(--color-acento); outline-offset: 4px`) aparece **só na navegação por teclado**: `html.usando-teclado .experiencia-campo :focus-visible`.
  - Ele não depende só de `:focus-visible` porque, no Chrome, inputs e select casam `:focus-visible` até no clique.
- **`utils/teclado.js` (`detectarTeclado`, iniciado no `main.js`):** Tab ou setas adicionam `html.usando-teclado`; `pointerdown` remove. Botões e links do site seguem com o `:focus-visible` padrão.

## Tokens (`@layer theme` em main.css)
| Token | Valor | Uso |
|---|---|---|
| `--color-fundo` | #0B0908 | fundo base |
| `--color-superficie` | #17120F | seções alternadas (contraste de 1,07:1 com o fundo: perceptível sem acinzentar; não passe de #1A1511) |
| `--color-placeholder` | #221B18 | placeholders de foto/vídeo (visível também sobre a superfície) |
| `--color-branco` | #fff | segunda frase do manifesto (`.frase-abertura-fim`, em `manifesto.css`; a primeira, `.frase-abertura-inicio`, fica em texto-3) |
| `--color-texto` | #F2EEEA | títulos e links |
| `--color-texto-2` | #BDB5AE | parágrafos |
| `--color-texto-3` | #8E8680 | rótulos, metadados |
| `--color-acento` | #C8102E | botões primários |
| `--color-acento-claro` | #E8566B | kanji, destaques, foco sobre fundo escuro |
| `--color-linha` | rgba(242,238,234,.10) | hairlines |
| `--color-papel` / `--color-tinta` | #F2EEEA / #1A1513 | cartão do formulário da Experiência |
| `--color-carimbo` | #9E0E26 | kanji e foco sobre o papel |
| `--font-titulo` / `--font-texto` / `--font-mono` | Shippori Mincho / Inter Tight / JetBrains Mono | |

- Use sempre `var(--color-...)` / `var(--font-...)` no CSS.
- **Camadas:** `@layer theme, base, components` (tokens → `base.css` e `componentes.css` → seções). O que não tem camada (o CSS do Lenis) vence as camadas.
- O hover/active do `.botao-primario` usa `color-mix()` com um fallback calculado antes (`#a40d26`, o mesmo tom) para navegadores sem `color-mix` (Safari < 16.2). Se o acento mudar, recalcule o fallback.

## Fontes
- **Shippori Mincho 400/500** → títulos, números, rótulos. Latim via `@fontsource/shippori-mincho/latin-*.css`.
- **Kanji** → NUNCA importar o `400.css` completo (são cerca de 120 @font-face e 150 KB de CSS). O `ferramentas/kanji.js` lê os textos com `lang="ja"` em todos os HTML e gera fontes só com esses caracteres.
  - **Todo kanji novo precisa estar dentro de um elemento com `lang="ja"`.**
- **Inter Tight 400/500** → texto corrido e botões. **JetBrains Mono 400** → só metadados e campos do formulário da Experiência.
- Todas com `font-display: swap`. Só o Shippori 400 latin tem preload (no `<head>`, apontando para `/node_modules/...`; o Vite aplica o hash).

## Padrões tipográficos e componentes (base.css e componentes.css)
### Rótulo (`.rotulo`)
- Shippori, uppercase, texto-3. **A partir de 600px:** 13px, letter-spacing 4px (tradução em 1px).
- **Até 599px (todos os rótulos):** letter-spacing 0.14em (kanji 0.06em, tradução 0.08em) e `font-size: max(10px, min(13px, 100cqi / 27.7))`.
  - O divisor vem do mais longo, o do hero ("おもてなし OMOTENASHI · A arte de servir bem" = 27,14em, mais 2% de folga). O `.envoltorio` tem `container-type: inline-size` só no mobile, como referência da coluna.
  - `nowrap` só com `@container (min-width: 277px)` (10px × 27,7); em 320px a coluna tem 280, então cabe a 10px. Se um rótulo mais longo entrar, meça de novo.
- O `.numeros .rotulo` tem regra própria (10px, 0.18em).
- `<p class="rotulo"><span class="rotulo-kanji" lang="ja">形</span> Katachi · <em>Formatos</em></p>` (o kanji em acento-claro; o `<em>` em itálico, sem uppercase).

### Títulos e texto
- h1/h2: Shippori 400, UPPERCASE, letter-spacing 0.1em, line-height 1.15. h1 base `clamp(36px, 6vw, 80px)` (o h1 do hero tem regra própria), h2 `clamp(20px, 3vw, 44px)`, h3 17 → 24 → 26px (letter-spacing 0.12–0.14em).
- Rótulo → h1: 20px; rótulo → h2: 14px no mobile / 18px no desktop.
- **Hierarquia: o h1 do hero é sempre o maior título da página**, em qualquer largura: h1 ≥ h2 > h3. Ao mexer em tamanhos de título (ou na largura da coluna do hero), confira em 320–1920px.
- **h2 com `<br>` forçado** ("Cada evento,<br>uma história." etc.) precisa ficar em exatamente 2 linhas. Se uma coluna ficar estreita demais, empilhe o layout em vez de deixar o h2 quebrar em mais linhas.
- Texto corrido: Inter Tight 16/17px (`.texto-intro`: 17/19px), line-height 1.6, texto-2.

### Componentes e utilitários
- `.botao.botao-primario` (acento, pill, 52px) · `.botao.botao-secundario` (borda 1px rgba(242,238,234,.28)).
- `.link-secao`: link "Ver todos os ... →" (15px, texto, borda inferior de 1px que clareia no hover). Usado nos topos de Momentos e Depoimentos da home, no fechamento de /momentos e no "recebido" de /depoimentos.
- `.secao-topo`: rótulo + h2 à esquerda e texto ou link à direita (≥900px); margem até o conteúdo de 56px (mobile) / 64px (desktop).
- `.metadado` (mono 12px) · `.destaque` (acento-claro) · `.visualmente-oculto` · `.so-mobile` (some a partir de 600px; ex.: `<br class="so-mobile">`) · `.so-desktop` (só a partir de 600px; ex.: um separador " ·").
- Layout: `.envoltorio` (conteúdo com máx. 1344px; respiro de 20 → 32 → 48px exposto em `--respiro`) e `.secao` (96px → 140px a partir de 900px).
- **Hover só no mouse:** todo `:hover` do site fica dentro de `@media (hover: hover) and (pointer: fine)`, num bloco `/* === HOVER (SÓ MOUSE) === */` depois da responsividade de cada arquivo.
  - No toque, o `:hover` gruda depois do tap e deixava o item vermelho. Feedback de toque só com `:active`, onde faz sentido: botões (`transition-duration: 0s` no `:active`, mesma cor do hover) e links do menu mobile.
  - `:focus-visible` continua fora do bloco.
- Mobile-first: `min-width` 600 / 900 / 1200, com as media queries no fim de cada arquivo, da menor para a maior (a página /momentos é a exceção, desktop primeiro).

## Animações
- GSAP + ScrollTrigger; duração 1.2–1.4s; ease `power3.out`. **Tudo desligado com `reduzirMovimento`.** Funcionalidades (menu, formulários, ano) continuam rodando.
- Hero e cabeçalho iniciam no `main.js`; as demais seções entram em `secoesSobDemanda` com `carregarAoAproximar`.
- **Hero, texto:** rótulo, h1 (linha a linha, com máscara criada pelo JS a partir dos `<br>`), `.hero-texto`, `.hero-local` e botões em stagger de 0.12s.
- **Hero, vídeo (com `gsap.matchMedia`):**
  - Mobile: **sem animação de entrada** (o poster é o LCP da home; um fade de opacidade 0 atrasava o LCP em ~1,4s). No scroll, o `<video>` (não o container mascarado) vai de `yPercent` 0 → 8 e scale 1 → 1.06 (scrub).
  - Desktop: o quadro abre com `clip-path: inset(100% 0 0 0)` → `inset(0)` em 1.4s, junto com o texto, e no scroll sobe com y 0 → -60 (scrub).
- **Números:** contagem de 0 até o valor escrito no HTML, preservando prefixo/sufixo (ex.: "+"); `data-contar-de` muda o início, se precisar.
- **Rótulos, h2 e textos de topo:** `revelar()` (y 30 → 0 + opacidade). **Pilares e linhas de Formatos:** `revelarEmSequencia()`.
- **Momentos:** foto com `clip-path: inset()` de baixo para cima.
- Cabeçalho, hambúrguer e menu mobile: ver "Navegação".

## Regras
1. `index.html` carrega apenas `<script type="module" src="/src/main.js"></script>` (o JSON-LD é dado, não script).
2. Lenis: `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t => lenis.raf(t * 1000))`; `gsap.ticker.lagSmoothing(0)`. Não iniciar Lenis se `reduzirMovimento` for true.
3. Cada módulo de seção só roda se o elemento existir no DOM.
4. Seções abaixo da dobra: JS via `import()` dinâmico disparado por IntersectionObserver (rootMargin 200px).
5. Animações suaves e lentas: duration 1–1.4s, ease `power3.out`. Importe `gsap`/`ScrollTrigger` de `core/rolagem.js`.
6. Conteúdo (textos, links de WhatsApp, depoimentos, mensagens) fica no HTML, nunca hardcoded no JS.
7. Identificadores de CSS/JS em português, com prefixo da seção (`.experiencia-*`, `.momentos-*`...). Comentários em CAIXA ALTA, curtos, só onde explicam o PORQUÊ (nada que repita o código); explicações longas de medidas ficam neste arquivo, não no código. Organização:
   - CSS/JS: TÍTULO (bloco principal) `/* =======================` / `   TÍTULO` / `   ======================= */` e SUBTÍTULO `/* === SUBTÍTULO === */`.
   - HTML: `<!-- =======================` / `     TÍTULO` / `     ======================= -->` e `<!-- === SUBTÍTULO === -->` (títulos HEAD, NAVEGAÇÃO, CONTEÚDO, RODAPÉ).
   - Python: `# =======================` / `# TÍTULO` / `# =======================` e `# === SUBTÍTULO ===`.
   - Em CSS, os blocos finais (RESPONSIVIDADE, HOVER (SÓ MOUSE), MOVIMENTO REDUZIDO) ficam como subtítulos do último título; quando as media queries misturam vários títulos, viram o título "RESPONSIVIDADE E ESTADOS".
   - **Não mexa** nos marcadores `<!-- DEPOIMENTOS:INICIO -->`, `<!-- DEPOIMENTOS:FIM -->`, `<!-- DEPOIMENTOS_HOME -->` e `<!-- DEPOIMENTOS -->`: o build procura esses textos exatos (o subtítulo da seção fica acima deles).
8. HTML, CSS e JS em arquivos separados. Sem código morto, sem `console.log`.
9. Remover arquivos e dependências que ficarem sem uso.
10. Imagens e vídeos ficam em public/ (sem hash). Ao trocar o conteúdo de um arquivo, renomeie-o (ex.: hero-v2.jpg) e atualize as referências, para não servir versão antiga do cache.
    - Referencie sempre com caminho absoluto da raiz (`/imagens/...`, `/videos/...`) e, em metatags e JSON-LD, com a URL completa (`https://danisushii.com.br/...`).

## SEO e acessibilidade
- Um único h1 por página; hierarquia h2 → h3 (use `.visualmente-oculto` quando a seção não tiver título visível). Use `lang="ja"` em todo kanji.
- Imagens com `width`/`height` reais; placeholders com `aspect-ratio` fixo (CLS zero).
- Contraste ≥ 4.5:1; foco visível (acento-claro no escuro, carimbo no papel); labels reais; o menu mobile fecha com Esc, deixa o resto da página `inert` e devolve o foco ao botão.
- JSON-LD `FoodEstablishment` no `<head>`, com `sameAs` apontando para o Instagram (https://www.instagram.com/danisushii/).
- Domínio canônico: `https://danisushii.com.br/` (canonical, og:url, og:image, sitemap, robots).

### URLs e rastreamento
- **Sempre com barra final:** `"trailingSlash": true` no `vercel.json` redireciona (308) `/momentos` → `/momentos/` (igual ao canonical). Vale para todo caminho sem extensão, `/api/*` incluso.
  - Por isso o cron chama `/api/manter/` e os endereços internos das funções já têm a barra (`action="/api/depoimentos/"`, links `/api/moderar/?id=...` e o form da moderação): o cron da Vercel não segue redirect.
- **404 própria:** `404.html` na raiz (input `erro` no `vite.config.js`), com cabeçalho, menu e rodapé das páginas internas, `noindex` e CSS em `secoes/erro.css`.
  - h1 "Página não" / "encontrada." → divisor 9,3 ("ENCONTRADA." = 9,013em + 3%). A Vercel serve com status 404 (`/qualquer-coisa` → 308 → `/qualquer-coisa/` → 404).
  - No Lighthouse ela tira SEO 58 de propósito (`noindex` e sem description).
- **sitemap.xml:** as 3 páginas com barra final e `<lastmod>` = data do último commit de cada uma (`git log -1 --format=%cs -- <arquivo>`). Atualize o `<lastmod>` ao mudar o conteúdo de uma página; a 404 fica fora. Página nova entra aqui.
- **robots.txt:** `Allow: /`, `Disallow: /api/` e `Sitemap: https://danisushii.com.br/sitemap.xml`.

### Metatags (em toda página indexável)
- `<title>` com "·" como separador: home "Dani Sushi · Eventos e jantares personalizados em Lajeado" (até ~60 caracteres); internas "<Página> · Dani Sushi".
- `description` de 140 a 160 caracteres, com cidade/região, sem "orçamento", "pedido" ou "comanda".
- Open Graph: title, description, image (+ width/height e `og:image:alt`), url, type, locale e `og:site_name` "Dani Sushi". Twitter: `summary_large_image` + title, description, image e `twitter:image:alt` (iguais aos do OG).

### Dados estruturados (JSON-LD)
- **Home (`@graph`):** `FoodEstablishment` + `WebSite`.
  - `FoodEstablishment` (`@id` `#empresa`): logo, descrição, telefone, `founder` Dani, `foundingDate` 2020, endereço em Lajeado, `areaServed`, `contactPoint` com o WhatsApp e `sameAs` Instagram.
  - `WebSite` (`@id` `#site`), com publisher = `#empresa`.
  - `areaServed` só com lugares reais do site: as cidades dos registros de /momentos (Lajeado, Encantado, Cruzeiro do Sul, Xangri-lá) + Porto Alegre, Vale do Taquari e Serra Gaúcha. Cidade nova em /momentos entra aqui.
- **/momentos/ e /depoimentos/:** `BreadcrumbList` (Início → página).
- **Nunca** use `aggregateRating`, `review` nem `priceRange`: os depoimentos não têm nota e o site não mostra preço.

## Mídias da marca
Os **originais** ficam em `marca/` (fora de `public/`, não vão para o deploy) e servem só de fonte. O site usa apenas os **derivados**. Nenhum HTML/CSS/JS pode referenciar a pasta `marca/` da raiz (a `public/imagens/marca/` guarda só os derivados).

| Arquivo | Onde | Origem |
|---|---|---|
| `marca/logo-sem-fundo.webp` (500×500) | não vai para o site | logo com letras claras e fundo transparente (com muita margem); fonte do recorte |
| `marca/logo.webp` (1200×1200) | não vai para o site | logo sobre fundo escuro texturizado (arte de perfil/redes) |
| `marca/simbolo-peixe.webp` (828×1472) | não vai para o site | selo vermelho com o peixe; fonte dos favicons |
| `public/imagens/marca/logo-sem-fundo-recortado.webp` (332×252) | cabeçalho (`alt="Dani Sushi"`, `fetchpriority="high"`; 42px mobile / 52px desktop) e rodapé (`alt=""`, lazy; 72px) | recorte justo de `marca/logo-sem-fundo.webp` |
| `public/favicon-32.png` / `public/apple-touch-icon.png` (180, fundo #0B0908, 14% de respiro) | `<link rel="icon">` / `<link rel="apple-touch-icon">` | `marca/simbolo-peixe.webp` |
| `public/imagens/compartilhamento/og-image.jpg` (1200×630) | `og:image` e `image` do JSON-LD | à esquerda, o recorte do `hero-poster.jpg`; à direita, o logo recortado + "Sushi bar ao vivo · Desde 2020" (Shippori, #BDB5AE) |
| `public/imagens/hero/hero-poster.jpg` | `poster` do vídeo + preload | frame do `hero.mp4` (ver abaixo) |
| `public/imagens/marca/simbolo-peixe-menu.webp` (54×96, ~1,6 KB) | menu mobile (`.menu-selo`, exibido a 14×24, `alt=""`, lazy) | `marca/simbolo-peixe.webp`, 96px de altura (4× dos 24px), WebP q85 |

### Regerar os derivados (na raiz do projeto)
O `ferramentas/derivados.py` (python3 + Pillow) tem toda a lógica. Ele lê de `marca/` e do poster e grava em `public/`:
```bash
python3 ferramentas/derivados.py            # tudo: recorte, og-image e favicons
python3 ferramentas/derivados.py recorte    # public/imagens/marca/logo-sem-fundo-recortado.webp
python3 ferramentas/derivados.py og         # public/imagens/compartilhamento/og-image.jpg (depende do recorte e do poster)
python3 ferramentas/derivados.py favicons   # public/favicon-32.png e public/apple-touch-icon.png
python3 ferramentas/derivados.py selo       # public/imagens/marca/simbolo-peixe-menu.webp (selo do menu mobile)
python3 ferramentas/derivados.py momentos   # public/imagens/momentos/<evento>/ (fora do "tudo"; ver abaixo)
ffmpeg -ss 20 -i public/videos/hero.mp4 -frames:v 1 -q:v 4 public/imagens/hero/hero-poster.jpg   # poster
```
- **Logo mudou:** substitua `marca/logo-sem-fundo.webp` e rode `recorte` e `og`. Se o tamanho do recorte mudar (o script imprime), atualize o `width`/`height` dos dois `<img>`.
- **Símbolo mudou:** substitua `marca/simbolo-peixe.webp` e rode `favicons` e `selo`. Se a proporção mudar, atualize o `width`/`height` dos `<img class="menu-selo">`.
- **Vídeo mudou:** regere o poster (ffmpeg) e depois rode `og`.
- A og-image precisa da fonte em `node_modules/` (rode `npm install` antes). Depois do lançamento, siga a regra 10 (renomear arquivos alterados).

### Fotos dos momentos
- **Originais fora do repositório**, em `~/Desktop/dani-sushi-originais/`, com o nome `<evento>-<N>.webp` (ex.: `aniversario-adriana-1.webp`, `pre-wedding-guto-helo-2.webp`): só minúsculas, sem acento, `-` como separador.
- `python3 ferramentas/derivados.py momentos` gera em `public/imagens/momentos/<evento>/` os arquivos `<N>-500.webp`, `<N>-500.jpg`, `<N>-1000.webp` e `<N>-1000.jpg`.
  - Proporção original, sem corte, WebP q78, JPG q80 progressivo, sem EXIF/GPS (a rotação do EXIF é aplicada antes).
- **Nunca amplia:** se o original tiver menos de 1000px de largura, o "-1000" sai na largura original (o script imprime as dimensões). No HTML, o descritor do srcset e o `width`/`height` usam essa largura real.
- Ao trocar uma foto já publicada, use um nome novo (regra 10).

#### Sizes = largura desenhada da foto, considerando o corte do cover
- Vale para a home e para /momentos/, no `<source>` e no `<img>`.
- Com `object-fit: cover` numa moldura fixa, a foto é desenhada com `largura da moldura × max(1, proporção da foto ÷ proporção da moldura)`. Use a proporção real do arquivo (`width`/`height` do `<img>`).
- Uma foto horizontal numa moldura vertical fica bem mais larga que o card (ex.: formatura-leo, 1,5, no card 3:4 da home → 2× a largura do card, 762px em 1440).
- Cada `<picture>` tem o seu `sizes`, uma reta em vw por faixa (até 599 / 600 / 900 / 1440+, onde o layout para de crescer). Ex.: `(min-width: 1440px) 762px, (min-width: 900px) calc(58.8vw - 84px), (min-width: 600px) calc(86.21vw - 55px), calc(149.92vw - 59px)`.
- **Para recalcular** (foto trocada, moldura ou grid mudou): meça no Chrome a moldura (w × h) de cada foto em 2 larguras de cada faixa, aplique a fórmula, tire a reta (vw arredondado para 2 casas, px arredondado para cima) e confira numa 3ª largura que o valor não fica abaixo do medido.
- Conferido em 390/900/1200/1440px, DPR 1 e 2: a versão carregada é sempre ≥ largura desenhada × DPR, ou a maior que existe.

### Vídeo do hero (`videos/hero.mp4`)
- Padrão de exportação: 720×1280, 30fps constante, H.264 High, yuv420p, sem áudio, faststart.
  `ffmpeg -i ENTRADA -vf "scale=720:1280:flags=lanczos" -r 30 -c:v libx264 -crf 28 -preset slow -profile:v high -pix_fmt yuv420p -an -movflags +faststart public/videos/hero.mp4`
- Meta: até 5 MB (versão atual: 30,4s, 4,97 MB). O master em alta fica fora do repositório (`~/Desktop/hero-master-1080.mp4`).
- Poster: frame dos **20s** (mesa montada, sem texto sobreposto e sem pessoas em close). Ao trocar o vídeo, escolha um frame com os mesmos critérios, regere o poster e rode `python3 ferramentas/derivados.py og`.
