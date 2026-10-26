/* =======================
   UTILITÁRIOS DAS FUNÇÕES
   ======================= */

/* O "_" NO NOME IMPEDE A VERCEL DE PUBLICAR COMO ROTA */
import { createHmac, timingSafeEqual } from 'node:crypto';

/* === LIMITES (OS MESMOS DO SCHEMA.SQL) === */
export const TIPOS_EVENTO = ['Jantar residencial', 'Casamento', 'Aniversário', 'Corporativo', 'Outro'];
export const LIMITES = { nome: [2, 60], cidade: [2, 60], texto: [10, 400] };

/* TAMANHO EM CARACTERES (CODE POINTS), COMO O CHAR_LENGTH DO POSTGRES */
export const tamanho = (texto) => [...texto].length;

/* === ESCAPE DE HTML === */
const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escaparHtml = (texto) => String(texto ?? '').replace(/[&<>"']/g, (caractere) => ENTIDADES[caractere]);

/* === SUPABASE (REST, SERVICE ROLE) === */
/* AUTHORIZATION SÓ COM CHAVE LEGADA (JWT): AS SB_SECRET_ NÃO SÃO JWT */
export async function consultarSupabase(env, caminho, opcoes = {}) {
  const chave = env.SUPABASE_SERVICE_ROLE_KEY;
  const resposta = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${caminho}`, {
    ...opcoes,
    headers: {
      apikey: chave,
      ...(chave.startsWith('eyJ') && { Authorization: `Bearer ${chave}` }),
      'Content-Type': 'application/json',
      ...opcoes.headers,
    },
  });

  if (!resposta.ok) throw new Error(`Supabase ${resposta.status}: ${await resposta.text()}`);
  return resposta.status === 204 ? null : resposta.json();
}

/* === TOKEN DE MODERAÇÃO (HMAC-SHA256) === */
export function tokenModeracao(id, acao) {
  return createHmac('sha256', process.env.SEGREDO_MODERACAO).update(id + acao).digest('hex');
}

export function tokenValido(id, acao, token) {
  const esperado = Buffer.from(tokenModeracao(id, acao));
  const recebido = Buffer.from(String(token ?? ''));
  return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
