/* =======================
   NÚMEROS (CONTAGEM AO ENTRAR NA TELA)
   ======================= */

import { gsap } from '../core/scroll.js';
import { reduzirMovimento } from '../utils/movimento.js';
import { revelar } from '../utils/revelar.js';

export function iniciarNumeros(secao) {
  if (reduzirMovimento) return;

  revelar(secao.querySelectorAll('.rotulo'));
  secao.querySelectorAll('.numeros-valor').forEach(contar);
}

/* LÊ O VALOR DO HTML (EX.: "+50") E CONTA A PARTIR DE DATA-CONTAR-DE (PADRÃO 0) */
function contar(elemento) {
  const partes = elemento.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
  if (!partes) return;

  const [, prefixo, final, sufixo] = partes;
  const contador = { valor: Number(elemento.dataset.contarDe ?? 0) };
  const escrever = () => { elemento.textContent = `${prefixo}${Math.round(contador.valor)}${sufixo}`; };

  escrever();
  gsap.to(contador, {
    valor: Number(final),
    duration: 1.4,
    ease: 'power3.out',
    onUpdate: escrever,
    scrollTrigger: { trigger: elemento, start: 'top 88%', once: true },
  });
}
