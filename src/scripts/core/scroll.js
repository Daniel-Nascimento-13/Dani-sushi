/* =======================
   ROLAGEM
   ======================= */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { reduzirMovimento } from '../utils/movimento.js';

/* === PLUGINS (ÚNICO REGISTRO DO PROJETO) === */
gsap.registerPlugin(ScrollTrigger);

/* === LENIS + SCROLLTRIGGER === */
export function iniciarScroll() {
  /* RECALCULA OS GATILHOS DEPOIS DO SWAP DAS FONTES */
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* [DATA-TOPO]: SOBE SEM RECARREGAR; SEM LENIS (MOVIMENTO REDUZIDO), DIRETO */
  let lenis = null;
  document.addEventListener('click', (evento) => {
    if (!evento.target.closest('a[data-topo]')) return;
    evento.preventDefault();
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo(0, 0);
  });

  if (reduzirMovimento) return null;

  lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ÂNCORAS: SEM OFFSET, O LENIS JÁ DESCONTA O SCROLL-PADDING-TOP */
  document.addEventListener('click', (evento) => {
    const link = evento.target.closest('a[href^="#"]');
    const destino = link && link.hash && document.querySelector(link.hash);
    if (!destino) return;
    evento.preventDefault();
    lenis.scrollTo(destino, { duration: 1.4 });
  });

  return lenis;
}

export { gsap, ScrollTrigger };
