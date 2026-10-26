/* =======================
   FORMATOS
   ======================= */

import { reduzirMovimento } from '../utils/movimento.js';
import { revelar, revelarEmSequencia } from '../utils/revelar.js';

export function iniciarFormatos(secao) {
  if (reduzirMovimento) return;

  revelar(secao.querySelectorAll('.rotulo, h2, .secao-topo-texto'));
  revelarEmSequencia(secao.querySelectorAll('.formatos-lista li'), secao.querySelector('.formatos-lista'));
}
