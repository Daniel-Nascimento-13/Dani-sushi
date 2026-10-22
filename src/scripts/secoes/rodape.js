/* === RODAPÉ: ANO ATUAL === */
export function iniciarRodape(rodape) {
  const ano = rodape.querySelector('.rodape-ano');
  if (ano) ano.textContent = new Date().getFullYear();
}
