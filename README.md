# Dani Sushi

Site oficial do Dani Sushi, sushi bar ao vivo e jantares personalizados em Lajeado e em todo o Vale do Taquari, na Serra e em Porto Alegre.

É um projeto real, em produção e em uso pela empresa: apresenta o serviço e leva o visitante a contar sobre o evento e continuar a conversa pelo WhatsApp.

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
~~~
index.html, momentos/, depoimentos/, 404.html   páginas
src/main.js                                     entrada única do JS e do CSS
src/estilos/                                    CSS: base, componentes e um arquivo por seção
src/scripts/                                    JS: núcleo, utilitários e um módulo por seção
api/                                            funções da Vercel (depoimentos, moderação, keep-alive)
public/                                         imagens, vídeo, favicons, robots.txt e sitemap.xml
ferramentas/                                    scripts de apoio (kanji e derivados de imagem)
marca/                                          originais da marca (fora do deploy)
supabase/schema.sql                             tabela dos depoimentos
~~~
