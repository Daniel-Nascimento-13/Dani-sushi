/* =======================
   ENTRADA
   ======================= */

/* === FONTES (SELF-HOSTED) === */
import '@fontsource/shippori-mincho/latin-400.css';
import '@fontsource/shippori-mincho/latin-500.css';
import '@fontsource/inter-tight/latin-400.css';
import '@fontsource/inter-tight/latin-500.css';
import '@fontsource/jetbrains-mono/latin-400.css';

import './estilos/main.css';
import { iniciarScroll } from './scripts/core/scroll.js';
import { carregarAoAproximar } from './scripts/core/carregador.js';
import { detectarTeclado } from './scripts/utils/teclado.js';
import { iniciarCabecalho } from './scripts/secoes/cabecalho.js';
import { iniciarHero } from './scripts/secoes/hero.js';

/* === ROLAGEM SUAVE === */
const lenis = iniciarScroll();

/* === TECLADO × PONTEIRO === */
detectarTeclado();

/* === ACIMA DA DOBRA === */
const cabecalho = document.querySelector('.cabecalho');
if (cabecalho) iniciarCabecalho(cabecalho, lenis);

const hero = document.querySelector('.hero');
if (hero) iniciarHero(hero);

/* === ABAIXO DA DOBRA (CARREGADAS SOB DEMANDA) === */
const secoesSobDemanda = [
  { seletor: '.numeros', carregar: () => import('./scripts/secoes/numeros.js').then((m) => m.iniciarNumeros) },
  { seletor: '.manifesto', carregar: () => import('./scripts/secoes/manifesto.js').then((m) => m.iniciarManifesto) },
  { seletor: '.pilares', carregar: () => import('./scripts/secoes/pilares.js').then((m) => m.iniciarPilares) },
  { seletor: '.formatos', carregar: () => import('./scripts/secoes/formatos.js').then((m) => m.iniciarFormatos) },
  { seletor: '.momentos', carregar: () => import('./scripts/secoes/momentos.js').then((m) => m.iniciarMomentos) },
  { seletor: '.momentos-pagina', carregar: () => import('./scripts/secoes/momentos.js').then((m) => m.iniciarMomentos) },
  { seletor: '.depoimentos', carregar: () => import('./scripts/secoes/depoimentos.js').then((m) => m.iniciarDepoimentos) },
  { seletor: '.depoimentos-pagina', carregar: () => import('./scripts/secoes/depoimentos.js').then((m) => m.iniciarDepoimentos) },
  { seletor: '.depoimentos-envio', carregar: () => import('./scripts/secoes/depoimentos.js').then((m) => m.iniciarDepoimentos) },
  { seletor: '.orcamento', carregar: () => import('./scripts/secoes/orcamento.js').then((m) => m.iniciarOrcamento) },
  { seletor: '.rodape', carregar: () => import('./scripts/secoes/rodape.js').then((m) => m.iniciarRodape) },
];

secoesSobDemanda.forEach(({ seletor, carregar }) => carregarAoAproximar(seletor, carregar));
