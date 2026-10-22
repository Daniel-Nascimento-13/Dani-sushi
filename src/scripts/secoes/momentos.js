import { gsap } from '../core/scroll.js';
import { reduzirMovimento } from '../utils/movimento.js';
import { revelar } from '../utils/revelar.js';

/* === MOMENTOS: TOPO REVELADO + FOTOS COM MÁSCARA DE BAIXO PARA CIMA === */
export function iniciarMomentos(secao) {
  if (reduzirMovimento) return;

  revelar(secao.querySelectorAll('.rotulo, h2, .momentos-link'));

  secao.querySelectorAll('.momentos-card').forEach((card, indice) => {
    gsap.fromTo(
      card.querySelector('.momentos-foto'),
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.4,
        ease: 'power3.out',
        delay: indice * 0.12,
        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
      },
    );
  });
}
