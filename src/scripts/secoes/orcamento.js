import { reduzirMovimento } from '../utils/movimento.js';
import { revelar } from '../utils/revelar.js';

/* === ORÇAMENTO: COMANDA → MENSAGEM NO WHATSAPP === */
export function iniciarOrcamento(secao) {
  const comanda = secao.querySelector('.comanda');
  if (comanda) iniciarComanda(comanda);

  if (reduzirMovimento) return;
  revelar(secao.querySelectorAll('.rotulo, h2, .orcamento-texto, .comanda'));
}

function iniciarComanda(comanda) {
  const campos = [...comanda.querySelectorAll('[data-mensagem]')];

  /* LIMPA O ERRO ASSIM QUE O CAMPO É CORRIGIDO */
  campos.forEach((campo) => {
    campo.addEventListener('input', () => {
      if (campo.checkValidity()) campo.removeAttribute('aria-invalid');
    });
  });

  comanda.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const invalidos = campos.filter((campo) => !campo.checkValidity());
    campos.forEach((campo) => campo.toggleAttribute('aria-invalid', invalidos.includes(campo)));
    if (invalidos.length) {
      invalidos[0].reportValidity();
      return;
    }

    /* SAUDAÇÃO E RÓTULOS VÊM DO HTML (DATA-MENSAGEM) */
    const linhas = campos.map((campo) => `${campo.dataset.mensagem}: ${formatar(campo)}`);
    const mensagem = [comanda.dataset.mensagem, ...linhas].join('\n');
    window.open(`https://wa.me/${comanda.dataset.whatsapp}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
  });
}

/* DATA AAAA-MM-DD → DD/MM/AAAA; DEMAIS CAMPOS COMO DIGITADOS */
function formatar(campo) {
  const valor = campo.value.trim();
  return campo.type === 'date' ? valor.split('-').reverse().join('/') : valor;
}
