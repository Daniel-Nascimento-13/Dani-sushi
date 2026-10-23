import { gsap } from '../core/scroll.js';
import { reduzirMovimento } from '../utils/movimento.js';
import { revelar } from '../utils/revelar.js';

/* === MOMENTOS (HOME E PÁGINA /MOMENTOS) === */
export function iniciarMomentos(secao) {
  if (reduzirMovimento) return;

  /* PÁGINA /MOMENTOS: CADA REGISTRO ENTRA INTEIRO (Y 30 → 0 + OPACIDADE) AO CHEGAR NA TELA */
  const registros = secao.querySelectorAll('.momento');
  if (registros.length) {
    revelar(registros);
    return;
  }

  /* HOME: TOPO REVELADO + FOTOS COM MÁSCARA DE BAIXO PARA CIMA */
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
