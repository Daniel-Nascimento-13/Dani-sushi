import { gsap } from '../core/scroll.js';

/* === ENTRADA PADRÃO (Y 30 → 0 + OPACIDADE) === */
const ENTRADA = { y: 30, autoAlpha: 0, duration: 1.2, ease: 'power3.out' };

/* CADA ELEMENTO REVELA AO ENTRAR NA TELA */
export function revelar(elementos) {
  gsap.utils.toArray(elementos).forEach((elemento) => {
    gsap.from(elemento, { ...ENTRADA, scrollTrigger: { trigger: elemento, start: 'top 88%', once: true } });
  });
}

/* GRUPO REVELADO EM SEQUÊNCIA QUANDO O GATILHO ENTRA NA TELA */
export function revelarEmSequencia(elementos, gatilho) {
  gsap.from(elementos, { ...ENTRADA, stagger: 0.12, scrollTrigger: { trigger: gatilho, start: 'top 85%', once: true } });
}
