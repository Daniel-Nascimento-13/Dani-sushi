import './estilos/main.css';
import { iniciarScroll } from './scripts/core/scroll.js';
import { carregarAoAproximar } from './scripts/core/carregador.js';

/* === ROLAGEM SUAVE === */
iniciarScroll();

/* === SEÇÕES ABAIXO DA DOBRA === */
/* CADA ITEM: { seletor: '#secao', carregar: () => import('./scripts/secoes/secao.js').then((m) => m.iniciarSecao) } */
const secoesSobDemanda = [];

secoesSobDemanda.forEach(({ seletor, carregar }) => carregarAoAproximar(seletor, carregar));
