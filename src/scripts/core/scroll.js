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

  /* LINK PARA O TOPO DA PÁGINA ATUAL ([DATA-TOPO], EX.: "INÍCIO" NA HOME): SOBE SEM RECARREGAR.
     COM MOVIMENTO REDUZIDO NÃO HÁ LENIS: SOBE DIRETO */
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

  /* ÂNCORAS INTERNAS COM ROLAGEM SUAVE. O DESCONTO DO CABEÇALHO FIXO VEM DO SCROLL-PADDING-TOP DO HTML,
     QUE O LENIS JÁ APLICA: NÃO PASSE OFFSET AQUI (SERIA DESCONTADO DUAS VEZES) */
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
