import { gsap, ScrollTrigger } from '../core/scroll.js';
import { reduzirMovimento } from '../utils/movimento.js';

/* === CABEÇALHO: FIXO DEPOIS DO HERO + MENU MOBILE === */
export function iniciarCabecalho(cabecalho, lenis) {
  const hero = document.querySelector('.hero');
  if (hero) {
    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom top',
      onEnter: () => fixar(cabecalho, true),
      onLeaveBack: () => fixar(cabecalho, false),
    });
  }

  const botao = cabecalho.querySelector('.cabecalho-menu');
  const menu = botao && document.getElementById(botao.getAttribute('aria-controls'));
  if (menu) iniciarMenu(cabecalho, botao, menu, lenis);
}

/* === FIXO DEPOIS DO HERO === */
function fixar(cabecalho, ativo) {
  gsap.killTweensOf(cabecalho);
  cabecalho.classList.toggle('cabecalho-fixo', ativo);

  if (ativo && !reduzirMovimento) {
    gsap.fromTo(cabecalho, { yPercent: -100 }, { yPercent: 0, duration: 1.2, ease: 'power3.out' });
  } else {
    gsap.set(cabecalho, { clearProps: 'transform' });
  }
}

/* === MENU MOBILE (TELA CHEIA) === */
function iniciarMenu(cabecalho, botao, menu, lenis) {
  const alternar = (abrir) => {
    botao.setAttribute('aria-expanded', String(abrir));
    botao.setAttribute('aria-label', abrir ? botao.dataset.rotuloFechar : botao.dataset.rotuloAbrir);
    menu.hidden = !abrir;
    document.documentElement.classList.toggle('menu-aberto', abrir);

    /* O RESTO DA PÁGINA FICA INERTE ENQUANTO O MENU ESTÁ ABERTO */
    [...document.body.children].forEach((elemento) => {
      if (elemento !== cabecalho && elemento !== menu) elemento.inert = abrir;
    });

    if (abrir) {
      lenis?.stop();
      menu.querySelector('a')?.focus();
      animarItens(menu);
    } else {
      lenis?.start();
    }
  };

  const aberto = () => botao.getAttribute('aria-expanded') === 'true';

  botao.addEventListener('click', () => alternar(!aberto()));

  menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) alternar(false);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape' || !aberto()) return;
    alternar(false);
    botao.focus();
  });

  /* FECHA AO PASSAR PARA O LAYOUT DESKTOP */
  window.matchMedia('(min-width: 900px)').addEventListener('change', (evento) => {
    if (evento.matches && aberto()) alternar(false);
  });
}

/* === ITENS DO MENU ENTRAM EM SEQUÊNCIA (SELO + TEXTO JUNTOS) === */
function animarItens(menu) {
  if (reduzirMovimento) return;

  gsap.fromTo(
    menu.querySelectorAll('li'),
    { y: 20, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true },
  );
}
