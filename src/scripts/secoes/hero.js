import { gsap } from '../core/scroll.js';
import { reduzirMovimento } from '../utils/movimento.js';

/* === HERO: ENTRADA NO CARREGAMENTO + MÍDIA REAGINDO AO SCROLL === */
export function iniciarHero(hero) {
  /* COM MOVIMENTO REDUZIDO, O VÍDEO FICA PARADO NO POSTER */
  if (reduzirMovimento) {
    const video = hero.querySelector('.hero-video');
    video?.removeAttribute('autoplay');
    video?.pause();
    return;
  }

  const rotulo = hero.querySelector('.rotulo');
  const titulo = hero.querySelector('.hero-titulo');
  const texto = hero.querySelector('.hero-texto');
  const local = hero.querySelector('.hero-local');
  const botoes = hero.querySelector('.hero-botoes');
  const linhas = titulo ? dividirLinhas(titulo) : [];

  /* ENTRADA EM SEQUÊNCIA (STAGGER 0.12S) */
  const passo = 0.12;
  const entrada = gsap.timeline({ defaults: { duration: 1.3, ease: 'power3.out' } });
  entrada
    .from(rotulo, { y: 30, autoAlpha: 0 }, 0)
    .from(linhas, { yPercent: 110, stagger: passo }, passo)
    .from([texto, local, botoes], { y: 30, autoAlpha: 0, stagger: passo }, passo * (linhas.length + 1));

  /* MÍDIA ESCURECE E ESCALA DE 1 PARA 1.06 (SCRUB) */
  const rolagem = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to(hero.querySelector('.hero-midia'), { scale: 1.06, ease: 'none', scrollTrigger: rolagem });
  gsap.to(hero.querySelector('.hero-escurecer'), { opacity: 0.5, ease: 'none', scrollTrigger: { ...rolagem } });
}

/* === DIVIDE O H1 NAS QUEBRAS <BR> E ENVOLVE CADA LINHA NUMA MÁSCARA === */
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
