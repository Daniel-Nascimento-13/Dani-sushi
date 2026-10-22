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
  if (data) data.min = hojeIso();

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

    /* SAUDAÇÃO E RÓTULOS VÊM DO HTML (DATA-MENSAGEM); O VALOR VAI COMO A PESSOA DIGITOU */
    const linhas = campos.map((campo) => `${campo.dataset.mensagem}: ${formatar(campo)}`);
    const mensagem = [comanda.dataset.mensagem, ...linhas].join('\n');
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

/* HOJE NO FUSO LOCAL (AAAA-MM-DD), SEM O DESVIO DE UTC DO TOISOSTRING */
function hojeIso() {
  const hoje = new Date();
  return [hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate()].map((n) => String(n).padStart(2, '0')).join('-');
}

/* DATA AAAA-MM-DD → DD/MM/AAAA; DEMAIS CAMPOS COMO DIGITADOS */
function formatar(campo) {
  const valor = campo.value.trim();
  return campo.type === 'date' ? valor.split('-').reverse().join('/') : valor;
}
