/* =======================
   MOMENTOS (HOME E PÁGINA)
   ======================= */

import { gsap } from '../core/rolagem.js';
import { reduzirMovimento } from '../utils/movimento.js';
import { revelar } from '../utils/revelar.js';

export function iniciarMomentos(secao) {
  if (reduzirMovimento) return;

  /* PÁGINA: CADA REGISTRO ENTRA INTEIRO */
  const registros = secao.querySelectorAll('.momento');
  if (registros.length) {
    revelar(registros);
    return;
  }

  /* HOME: TOPO REVELADO + FOTOS ABRINDO DE BAIXO PARA CIMA */
  revelar(secao.querySelectorAll('.rotulo, h2, .link-secao'));

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
