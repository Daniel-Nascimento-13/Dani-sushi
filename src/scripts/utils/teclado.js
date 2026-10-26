/* =======================
   TECLADO
   ======================= */

/* HTML.USANDO-TECLADO ENQUANTO A NAVEGAÇÃO FOR POR TECLADO */
const TECLAS_DE_NAVEGACAO = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export function detectarTeclado() {
  const raiz = document.documentElement;
  document.addEventListener('keydown', (evento) => {
    if (TECLAS_DE_NAVEGACAO.has(evento.key)) raiz.classList.add('usando-teclado');
  });
  document.addEventListener('pointerdown', () => raiz.classList.remove('usando-teclado'));
}
