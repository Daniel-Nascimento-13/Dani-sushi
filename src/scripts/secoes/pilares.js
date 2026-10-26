/* =======================
   PILARES
   ======================= */

import { reduzirMovimento } from '../utils/movimento.js';
import { revelarEmSequencia } from '../utils/revelar.js';

export function iniciarPilares(secao) {
  if (reduzirMovimento) return;

  revelarEmSequencia(secao.querySelectorAll('.pilares-item'), secao.querySelector('.pilares-lista'));
}
