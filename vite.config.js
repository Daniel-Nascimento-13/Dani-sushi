/* =======================
   VITE
   ======================= */

import { defineConfig, loadEnv } from 'vite';
import { escaparHtml, consultarSupabase } from './api/_comum.js';

export default defineConfig(({ mode }) => ({
  plugins: [depoimentosAprovados(loadEnv(mode, process.cwd(), ''))],
  build: {
    rollupOptions: {
      input: { principal: 'index.html', momentos: 'momentos/index.html', depoimentos: 'depoimentos/index.html', erro: '404.html' },
    },
  },
}));

/* =======================
   DEPOIMENTOS NO BUILD
   ======================= */

/* MARCADORES DO HTML VIRAM CARDS; SEM APROVADOS, O BLOCO SAI (VER CLAUDE.MD) */
/* SEM AS VARIÁVEIS: SEM DEPOIMENTOS FORA DA VERCEL E ERRO NA VERCEL; FALHA NA BUSCA DERRUBA O BUILD */
const MARCADORES = [
  { marcador: '<!-- DEPOIMENTOS_HOME -->', limite: 6 },
  { marcador: '<!-- DEPOIMENTOS -->', limite: Infinity },
];
const INICIO = '<!-- DEPOIMENTOS:INICIO -->';
const FIM = '<!-- DEPOIMENTOS:FIM -->';

function depoimentosAprovados(env) {
  let busca;

  return {
    name: 'depoimentos-aprovados',
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        const alvo = MARCADORES.find(({ marcador }) => html.includes(marcador));
        if (!alvo) return html;

        busca ??= buscarAprovados(env);
        const aprovados = (await busca).slice(0, alvo.limite);
        if (!aprovados.length) return removerBloco(html);

        return html
          .replace(alvo.marcador, aprovados.map(cartao).join('\n'))
          .replace(/[ \t]*<!-- DEPOIMENTOS:(INICIO|FIM) -->\n/g, '');
      },
    },
  };
}

/* === BUSCA === */
async function buscarAprovados(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    if (env.VERCEL) throw new Error('Depoimentos: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis da Vercel.');
    return [];
  }

  try {
    return await consultarSupabase(env, 'depoimentos?select=nome,cidade,tipo_evento,texto&status=eq.aprovado&order=criado_em.desc');
  } catch (erro) {
    throw new Error(`Depoimentos: falha ao buscar os aprovados no Supabase; build interrompido para manter o deploy anterior no ar (${erro.message})`);
  }
}

/* === REMOÇÃO DO BLOCO (SEM APROVADOS) === */
function removerBloco(html) {
  const inicio = html.indexOf(INICIO);
  const fim = html.indexOf(FIM) + FIM.length;
  const bloco = html.slice(inicio, fim);
  let resto = html.slice(fim).replace(/^\n/, '');

  if (/fundo-(base|superficie)/.test(bloco)) {
    resto = resto.replace(/fundo-(base|superficie)/g, (_, fundo) => `fundo-${fundo === 'base' ? 'superficie' : 'base'}`);
  }

  return html.slice(0, inicio).replace(/[ \t]*$/, '') + resto;
}

/* === CARD === */
function cartao({ nome, cidade, tipo_evento: tipo, texto }) {
  return `<li class="depoimentos-item">
  <figure class="depoimento">
    <span class="depoimento-aspas" aria-hidden="true">“</span>
    <blockquote class="depoimento-texto"><p>${escaparHtml(texto)}</p></blockquote>
    <figcaption class="depoimento-autor">
      <span class="depoimento-nome">${escaparHtml(nome)}</span>
      <span class="depoimento-evento">${escaparHtml(tipo)} · ${escaparHtml(cidade)}</span>
    </figcaption>
  </figure>
</li>`;
}
