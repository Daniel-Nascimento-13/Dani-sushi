/* === RODAPÉ: ANO ATUAL NO COPYRIGHT (O ANO DO HTML É O FALLBACK) === */
export function iniciarRodape(rodape) {
  const ano = rodape.querySelector('[data-ano-atual]');
  if (ano) ano.textContent = new Date().getFullYear();
}
