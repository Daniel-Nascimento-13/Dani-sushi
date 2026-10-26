import { reduzirMovimento } from '../utils/movimento.js';
import { revelar, revelarEmSequencia } from '../utils/revelar.js';

/* === DEPOIMENTOS: CARROSSEL (HOME E /DEPOIMENTOS) + FORMULÁRIO DE ENVIO (/DEPOIMENTOS#ENVIAR) === */
export function iniciarDepoimentos(secao) {
  const carrossel = secao.querySelector('.depoimentos-carrossel');
  if (carrossel) iniciarCarrossel(carrossel);

  const formulario = secao.querySelector('.depoimentos-form');
  if (formulario) iniciarFormulario(formulario, secao.querySelector('.depoimentos-recebido'));

  if (reduzirMovimento) return;
  revelar(secao.querySelectorAll('.secao-topo .rotulo, .secao-topo h2, .secao-topo .momentos-link'));
  if (carrossel) revelarEmSequencia(carrossel.querySelectorAll('.depoimentos-item'), carrossel);
}

/* === CARROSSEL: SETAS (DESKTOP) E INDICADOR "1 / N" (MOBILE) SEGUEM O SCROLL NATIVO === */
function iniciarCarrossel(carrossel) {
  const trilho = carrossel.querySelector('.depoimentos-trilho');
  const cards = [...trilho.children];
  const setas = carrossel.querySelectorAll('[data-direcao]');
  const atual = carrossel.querySelector('[data-atual]');
  carrossel.querySelector('[data-total]').textContent = cards.length;

  /* DISTÂNCIA ENTRE DOIS CARDS (LARGURA + GAP) */
  const passo = () => (cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : trilho.clientWidth);

  const atualizar = () => {
    const maximo = trilho.scrollWidth - trilho.clientWidth;
    const noFim = trilho.scrollLeft >= maximo - 1;

    setas[0].disabled = trilho.scrollLeft <= 1;
    setas[1].disabled = noFim;
    /* O ÚLTIMO CARD NUNCA ENCOSTA NO INÍCIO (FALTA ESPAÇO DEPOIS DELE): NO FIM DO SCROLL, É O ÚLTIMO */
    atual.textContent = noFim ? cards.length : Math.round(trilho.scrollLeft / passo()) + 1;
  };

  setas.forEach((seta) => {
    seta.addEventListener('click', () => {
      trilho.scrollBy({ left: passo() * Number(seta.dataset.direcao), behavior: reduzirMovimento ? 'auto' : 'smooth' });
    });
  });

  trilho.addEventListener('scroll', atualizar, { passive: true });
  window.addEventListener('resize', atualizar);
  atualizar();
}

/* === FORMULÁRIO: VALIDAÇÃO PRÓPRIA (LIMITES NO HTML) → POST /API/DEPOIMENTOS === */
function iniciarFormulario(formulario, recebido) {
  const campos = [...formulario.querySelectorAll('[required]')];
  const botao = formulario.querySelector('[type="submit"]');
  const erro = formulario.querySelector('.depoimentos-erro');
  const texto = formulario.elements.texto;
  const contador = formulario.querySelector('[data-contador]');

  /* GUARDA OS TEXTOS NORMAIS PARA VOLTAR A ELES */
  campos.forEach((campo) => {
    const ajuda = ajudaDe(campo);
    if (ajuda) ajuda.dataset.normal = ajuda.textContent;
  });
  erro.dataset.padrao = erro.textContent;

  /* CONTADOR 0/400 */
  const contar = () => { contador.textContent = texto.value.length; };
  texto.addEventListener('input', contar);
  contar();

  campos.forEach((campo) => {
    /* AO SAIR DO CAMPO: VALIDA SE ALGO FOI PREENCHIDO (O CHECKBOX VALIDA AO MARCAR/DESMARCAR) */
    campo.addEventListener('blur', () => {
      if (campo.type !== 'checkbox' && campo.value) validar(campo);
    });

    /* AO CORRIGIR: SAI DO ESTADO DE ERRO ASSIM QUE FICA VÁLIDO */
    ['input', 'change'].forEach((evento) => campo.addEventListener(evento, () => {
      if (campo.type === 'checkbox') validar(campo);
      else if (campo.getAttribute('aria-invalid') === 'true' && valido(campo)) marcar(campo, true);
    }));
  });

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const invalidos = campos.filter((campo) => !validar(campo));
    if (invalidos.length) {
      invalidos[0].focus();
      return;
    }

    botao.disabled = true;
    botao.textContent = botao.dataset.enviando;
    erro.hidden = true;

    try {
      const resposta = await fetch(formulario.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(formulario)), autorizado: formulario.elements.autorizado.checked }),
      });
      if (!resposta.ok) throw resposta.status;

      formulario.hidden = true;
      recebido.hidden = false;
      recebido.focus();
    } catch (status) {
      erro.textContent = status === 429 ? erro.dataset.limite : erro.dataset.padrao;
      erro.hidden = false;
      botao.textContent = botao.dataset.tentar;
    } finally {
      botao.disabled = false;
    }
  });
}

/* === REGRAS: CHECKBOX MARCADO; DEMAIS PREENCHIDOS DENTRO DE MINLENGTH/MAXLENGTH (SEM ESPAÇOS NAS PONTAS) === */
function valido(campo) {
  if (campo.type === 'checkbox') return campo.checked;

  const tamanho = campo.value.trim().length;
  const minimo = campo.minLength > 0 ? campo.minLength : 1;
  const maximo = campo.maxLength > 0 ? campo.maxLength : Infinity;
  return tamanho >= minimo && tamanho <= maximo;
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
  ajuda.classList.toggle('depoimentos-ajuda-erro', !ok);
}

function ajudaDe(campo) {
  const id = campo.getAttribute('aria-describedby');
  return id ? document.getElementById(id) : null;
}
