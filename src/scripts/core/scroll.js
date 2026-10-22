import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { reduzirMovimento } from '../utils/movimento.js';

/* === REGISTRO DE PLUGINS (ÚNICO LUGAR DO PROJETO) === */
gsap.registerPlugin(ScrollTrigger);

/* === ROLAGEM SUAVE (LENIS + SCROLLTRIGGER SINCRONIZADOS) === */
export function iniciarScroll() {
  /* RECALCULA OS GATILHOS QUANDO AS FONTES TROCAM (SWAP) */
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  if (reduzirMovimento) return null;

  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ÂNCORAS INTERNAS COM ROLAGEM SUAVE */
  document.addEventListener('click', (evento) => {
    const link = evento.target.closest('a[href^="#"]');
    const destino = link && link.hash && document.querySelector(link.hash);
    if (!destino) return;
    evento.preventDefault();
    lenis.scrollTo(destino);
  });

  return lenis;
}

export { gsap, ScrollTrigger };
