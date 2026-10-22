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

  /* DATA: SÓ A PARTIR DE HOJE */
  const data = comanda.querySelector('input[type="date"]');
  if (data) {
    data.min = hojeIso();
    marcarPreenchida(data);
    ['input', 'change'].forEach((evento) => data.addEventListener(evento, () => marcarPreenchida(data)));
  }

  /* GUARDA O TEXTO NORMAL DE CADA DICA PARA VOLTAR A ELE */
  campos.forEach((campo) => {
    const ajuda = ajudaDe(campo);
    if (ajuda) ajuda.dataset.normal = ajuda.textContent;
  });

  campos.forEach((campo) => {
    /* AO SAIR DO CAMPO: VALIDA SE ALGO FOI PREENCHIDO */
    campo.addEventListener('blur', () => {
      if (campo.value || campo.validity.badInput) validar(campo);
    });

    /* AO CORRIGIR: SAI DO ESTADO DE ERRO ASSIM QUE FICA VÁLIDO */
    campo.addEventListener('input', () => {
      if (campo.getAttribute('aria-invalid') === 'true' && valido(campo)) marcar(campo, true);
    });
  });

  comanda.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const invalidos = campos.filter((campo) => !validar(campo));
    if (invalidos.length) {
      invalidos[0].focus();
      return;
    }

    const mensagem = montarMensagem(comanda, campos);
    window.open(`https://wa.me/${comanda.dataset.whatsapp}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
  });
}

/* === REGRAS: CONVIDADOS INTEIRO ≥ MIN; DATA ≥ HOJE; DEMAIS, PREENCHIDOS === */
function valido(campo) {
  const valor = campo.value.trim();
  if (campo.type === 'number') return !campo.validity.badInput && /^\d+$/.test(valor) && Number(valor) >= Number(campo.min);
  if (campo.type === 'date') return valor !== '' && valor >= campo.min;
  return valor !== '';
}

function validar(campo) {
  const ok = valido(campo);
  marcar(campo, ok);
  return ok;
}

/* ESTADO VISUAL E ACESSÍVEL: ARIA-INVALID + DICA NORMAL OU MENSAGEM DE ERRO (DATA-ERRO) */
function marcar(campo, ok) {
  if (ok) campo.removeAttribute('aria-invalid');
  else campo.setAttribute('aria-invalid', 'true');

  const ajuda = ajudaDe(campo);
  if (!ajuda) return;
  ajuda.textContent = ok ? ajuda.dataset.normal : ajuda.dataset.erro;
  ajuda.classList.toggle('comanda-ajuda-erro', !ok);
}

function ajudaDe(campo) {
  const id = campo.getAttribute('aria-describedby');
  return id ? document.getElementById(id) : null;
}

/* "ESCOLHA A DATA" SOME QUANDO HÁ VALOR (OU DATA DIGITADA PELA METADE, QUE NÃO TEM VALUE AINDA) */
function marcarPreenchida(data) {
  data.parentElement.classList.toggle('comanda-data-preenchida', data.value !== '' || data.validity.badInput);
}

/* HOJE NO FUSO LOCAL (AAAA-MM-DD), SEM O DESVIO DE UTC DO TOISOSTRING */
function hojeIso() {
  const hoje = new Date();
  return [hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate()].map((n) => String(n).padStart(2, '0')).join('-');
}

/* === MENSAGEM: SAUDAÇÃO + LINHA EM BRANCO + "* RÓTULO: VALOR" + LINHA EM BRANCO + DESPEDIDA ===
   TEXTOS NO HTML (DATA-MENSAGEM / DATA-DESPEDIDA DO FORM, DATA-MENSAGEM DE CADA CAMPO).
   "* " NO INÍCIO DA LINHA VIRA LISTA COM MARCADORES NO WHATSAPP */
function montarMensagem(comanda, campos) {
  const itens = campos.map((campo) => `* ${campo.dataset.mensagem}: ${formatar(campo)}`);
  return [comanda.dataset.mensagem, '', ...itens, '', comanda.dataset.despedida]
    .join('\n')
    .split('\n')
    .map((linha) => linha.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* DATA AAAA-MM-DD → "QUINTA-FEIRA, 29/10/2026" (FUSO LOCAL); DEMAIS CAMPOS COMO DIGITADOS */
const DIA_DA_SEMANA = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });

function formatar(campo) {
  const valor = campo.value.trim();
  if (campo.type !== 'date') return valor;

  const [ano, mes, dia] = valor.split('-').map(Number);
  const semana = DIA_DA_SEMANA.format(new Date(ano, mes - 1, dia)).toLocaleLowerCase('pt-BR');
  return `${semana}, ${valor.split('-').reverse().join('/')}`;
}
