/* === CARREGAMENTO SOB DEMANDA (IMPORT DINÂMICO AO SE APROXIMAR DA SEÇÃO) === */
export function carregarAoAproximar(seletor, carregar) {
  const elemento = document.querySelector(seletor);
  if (!elemento) return;

  const observador = new IntersectionObserver((entradas) => {
    if (!entradas.some((entrada) => entrada.isIntersecting)) return;
    observador.disconnect();
    carregar().then((iniciar) => iniciar(elemento));
  }, { rootMargin: '200px' });

  observador.observe(elemento);
}
