import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { reduzirMovimento } from '../utils/movimento.js';

/* === REGISTRO DE PLUGINS (ÚNICO LUGAR DO PROJETO) === */
gsap.registerPlugin(ScrollTrigger);

/* === ROLAGEM SUAVE (LENIS + SCROLLTRIGGER SINCRONIZADOS) === */
export function iniciarScroll() {
  if (reduzirMovimento) return null;

  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export { gsap, ScrollTrigger };
