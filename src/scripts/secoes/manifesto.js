/* =======================
   MANIFESTO
   ======================= */

import { reduzirMovimento } from '../utils/movimento.js';
import { revelar } from '../utils/revelar.js';

export function iniciarManifesto(secao) {
  if (reduzirMovimento) return;

  revelar(secao.querySelector('.manifesto-texto'));
}
