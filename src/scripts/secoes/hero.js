/* =======================
   HERO
   ======================= */

import { gsap } from '../core/scroll.js';
import { reduzirMovimento } from '../utils/movimento.js';

const ENTRADA = { duration: 1.4, ease: 'power3.out' };

/* ENTRADA NO CARREGAMENTO + VÍDEO NO SCROLL */
export function iniciarHero(hero) {
  /* ECONOMIA DE DADOS CONTA COMO MOVIMENTO REDUZIDO: VÍDEO PARADO NO POSTER */
  const parado = reduzirMovimento || navigator.connection?.saveData === true;

  const video = hero.querySelector('.hero-video');
  if (video && !parado) tocarSoNaTela(hero, video);

  if (reduzirMovimento) return;

  const rotulo = hero.querySelector('.rotulo');
  const titulo = hero.querySelector('.hero-titulo');
  const texto = hero.querySelector('.hero-texto');
  const local = hero.querySelector('.hero-local');
  const botoes = hero.querySelector('.hero-botoes');
  const linhas = titulo ? dividirLinhas(titulo) : [];

  const passo = 0.12;
  const entrada = gsap.timeline({ defaults: { duration: 1.3, ease: 'power3.out' } });
  entrada
    .from(rotulo, { y: 30, autoAlpha: 0 }, 0)
    .from(linhas, { yPercent: 110, stagger: passo }, passo)
    .from([texto, local, botoes], { y: 30, autoAlpha: 0, stagger: passo }, passo * (linhas.length + 1));

  animarMidia(hero, passo);
}

/* === VÍDEO SÓ NA TELA === */
function tocarSoNaTela(hero, video) {
  new IntersectionObserver(([entrada]) => {
    if (entrada.isIntersecting) video.play().catch(() => {});
    else video.pause();
  }).observe(hero);
}

/* === MÍDIA (MOBILE × DESKTOP) === */
function animarMidia(hero, passo) {
  const midia = hero.querySelector('.hero-midia');
  const quadro = hero.querySelector('.hero-quadro');
  const video = hero.querySelector('.hero-video');
  if (!midia || !quadro || !video) return;

  const rolagem = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  const telas = gsap.matchMedia();

  /* MOBILE: SEM ENTRADA (O POSTER É O LCP); PARALLAX SÓ NO VÍDEO, A MÁSCARA FICA PARADA */
  telas.add('(max-width: 899px)', () => {
    gsap.to(video, { yPercent: 8, scale: 1.06, ease: 'none', scrollTrigger: rolagem });
  });

  /* DESKTOP: QUADRO ABRE DE BAIXO PARA CIMA E SOBE NO SCROLL */
  telas.add('(min-width: 900px)', () => {
    gsap.fromTo(midia, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', delay: passo, ...ENTRADA });
    gsap.to(quadro, { y: -60, ease: 'none', scrollTrigger: { ...rolagem } });
  });
}

/* === LINHAS DO H1 (MÁSCARA A PARTIR DOS <BR>) === */
function dividirLinhas(titulo) {
  const grupos = [[]];
  [...titulo.childNodes].forEach((no) => {
    if (no.nodeName === 'BR') grupos.push([]);
    else grupos.at(-1).push(no);
  });

  const linhas = grupos.map((nos) => {
    const mascara = document.createElement('span');
    const interna = document.createElement('span');
    mascara.className = 'hero-linha';
    interna.className = 'hero-linha-interna';
    interna.append(...nos);
    mascara.append(interna);
    return mascara;
  });

  titulo.replaceChildren(...linhas);
  return linhas.map((linha) => linha.firstElementChild);
}
