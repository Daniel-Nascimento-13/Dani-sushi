import { reduzirMovimento } from '../utils/movimento.js';
import { revelarEmSequencia } from '../utils/revelar.js';

/* === PILARES: COLUNAS EM SEQUÊNCIA === */
export function iniciarPilares(secao) {
  if (reduzirMovimento) return;

  revelarEmSequencia(secao.querySelectorAll('.pilares-item'), secao.querySelector('.pilares-lista'));
}
