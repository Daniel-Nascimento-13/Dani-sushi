/* === SUBCONJUNTO DE KANJI DO SHIPPORI MINCHO ===
   LÊ OS TEXTOS COM LANG="JA" NOS HTML DA RAIZ E NO INDEX.HTML DE CADA PÁGINA (MOMENTOS/, DEPOIMENTOS/...), GERA FONTES WOFF2 SÓ COM ESSES
   CARACTERES E ESCREVE O @FONT-FACE EM SRC/ESTILOS/FONTES-KANJI.CSS.
   RODA AUTOMATICAMENTE ANTES DE "NPM RUN DEV" E "NPM RUN BUILD". */
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import subsetFont from 'subset-font';

const require = createRequire(import.meta.url);
const pastaFonte = require.resolve('@fontsource/shippori-mincho/400.css').replace(/400\.css$/, '');
const pastaSaida = 'src/assets/fontes';
const arquivoCss = 'src/estilos/fontes-kanji.css';

/* === CARACTERES USADOS NO HTML === */
const IGNORAR = new Set(['node_modules', 'dist', 'public', 'src']);
const paginas = readdirSync('.', { withFileTypes: true }).flatMap((item) => {
  if (item.isFile() && item.name.endsWith('.html')) return [item.name];
  if (item.isDirectory() && !IGNORAR.has(item.name) && existsSync(`${item.name}/index.html`)) return [`${item.name}/index.html`];
  return [];
});
const html = paginas.map((pagina) => readFileSync(pagina, 'utf8')).join('');
const textos = [...html.matchAll(/lang="ja"[^>]*>([^<]+)</g)].map((trecho) => trecho[1]);
const caracteres = [...new Set(textos.join('').replace(/\s/g, ''))].sort();

/* === BLOCOS JAPONESES DO FONTSOURCE (UNICODE-RANGE → ARQUIVO) === */
const cssFonte = readFileSync(`${pastaFonte}400.css`, 'utf8');
const blocos = [...cssFonte.matchAll(/src: url\(\.\/files\/(shippori-mincho-(\d+)-400-normal\.woff2)\).*?unicode-range: ([^;]+);/gs)]
  .map(([, arquivo, indice, faixas]) => ({ arquivo, indice, faixas: faixas.split(',').map(lerFaixa) }));

function lerFaixa(faixa) {
  const [inicio, fim = inicio] = faixa.trim().slice(2).split('-');
  return [parseInt(inicio, 16), parseInt(fim, 16)];
}

const grupos = new Map();
caracteres.forEach((caractere) => {
  const codigo = caractere.codePointAt(0);
  const bloco = blocos.find(({ faixas }) => faixas.some(([inicio, fim]) => codigo >= inicio && codigo <= fim));
  if (!bloco) throw new Error(`Caractere sem fonte: ${caractere}`);
  grupos.set(bloco, [...(grupos.get(bloco) ?? []), caractere]);
});

/* === GERA AS FONTES E O CSS === */
rmSync(pastaSaida, { recursive: true, force: true });
mkdirSync(pastaSaida, { recursive: true });

const regras = [];
for (const [bloco, letras] of grupos) {
  const nome = `shippori-kanji-${bloco.indice}.woff2`;
  const fonte = await subsetFont(readFileSync(`${pastaFonte}files/${bloco.arquivo}`), letras.join(''), { targetFormat: 'woff2' });
  writeFileSync(`${pastaSaida}/${nome}`, fonte);

  const faixa = letras.map((letra) => `U+${letra.codePointAt(0).toString(16).toUpperCase()}`).join(',');
  regras.push(`@font-face {
  font-family: "Shippori Mincho";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/${pastaSaida}/${nome}") format("woff2");
  unicode-range: ${faixa};
}`);
}

writeFileSync(arquivoCss, `/* === KANJI DO SHIPPORI MINCHO (GERADO POR FERRAMENTAS/KANJI.JS — NÃO EDITAR) === */\n${regras.join('\n\n')}\n`);
process.stdout.write(`kanji: ${caracteres.join('')} → ${grupos.size} arquivo(s)\n`);
