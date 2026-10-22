import { reduzirMovimento } from '../utils/movimento.js';
import { revelar } from '../utils/revelar.js';

/* === DEPOIMENTOS: TOPO E CARTÃO REVELADOS === */
export function iniciarDepoimentos(secao) {
  if (reduzirMovimento) return;

  revelar(secao.querySelectorAll('.rotulo, h2, .depoimentos-cartao'));
}
