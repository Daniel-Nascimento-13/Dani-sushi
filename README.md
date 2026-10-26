# Dani Sushi

Site do Dani Sushi, sushi bar ao vivo e jantares personalizados em Lajeado, no Vale do Taquari, na Serra e em Porto Alegre. O site apresenta o serviço e leva o visitante a contar sobre o evento e continuar a conversa pelo WhatsApp.

- Site: https://danisushii.com.br
- Repositório: https://github.com/Daniel-Nascimento-13/Dani-sushi

## Páginas
- **Home** (`/`): apresentação, formatos, momentos em destaque, depoimentos e o formulário da Experiência, que monta a mensagem do WhatsApp.
- **Momentos** (`/momentos/`): registros dos eventos realizados, com fotos e números.
- **Depoimentos** (`/depoimentos/`): depoimentos aprovados e formulário de envio, com moderação por e-mail.
- **404**: página própria para endereços inexistentes.

## Stack
- Vite (multipágina), HTML, CSS e JavaScript vanilla
- GSAP + ScrollTrigger e Lenis (animações e rolagem suave)
- Fontes self-hosted (@fontsource)
- Vercel: hospedagem, funções (`api/`) e cron
- Supabase: banco dos depoimentos
- Resend: e-mails de moderação

## Estrutura
```
index.html, momentos/, depoimentos/, 404.html   páginas
src/main.js                                     entrada única do JS e do CSS
src/estilos/                                    CSS: base, componentes e um arquivo por seção
src/scripts/                                    JS: núcleo, utilitários e um módulo por seção
api/                                            funções da Vercel (depoimentos, moderação, keep-alive)
public/                                         imagens, vídeo, favicons, robots.txt e sitemap.xml
ferramentas/                                    scripts de apoio (kanji e derivados de imagem)
marca/                                          originais da marca (fora do deploy)
supabase/schema.sql                             tabela dos depoimentos
```

## Como rodar
```bash
npm install
npm run dev     # servidor local
npm run build   # build de produção em dist/
```
- Variáveis: copie `.env.example` para `.env` e preencha (Supabase, Resend, moderação, deploy hook, cron).
- Sem as variáveis do Supabase, o dev e o build local funcionam sem depoimentos (a seção da home some). Na Vercel, o build falha de propósito.
- As funções de `api/` não rodam no `npm run dev`; para testá-las, use `vercel dev`.

## Ferramentas
- `npm run kanji`: gera as fontes só com os kanji usados no HTML (roda sozinho antes de `dev` e `build`).
- `python3 ferramentas/derivados.py`: gera os derivados de imagem (logo recortado, og-image, favicons, selo do menu e fotos dos momentos); precisa de Pillow.

## Deploy
- Cada push na `main` é publicado automaticamente pela Vercel.
- Se algo quebrar em produção: Vercel → Deployments → Instant Rollback.

## Padrões do código
- Identificadores (classes, ids, funções e variáveis) em português.
- Comentários em caixa alta, organizados em títulos em bloco e subtítulos.
- Um arquivo de CSS e um módulo de JS por seção.

Documentação técnica completa em CLAUDE.md.
