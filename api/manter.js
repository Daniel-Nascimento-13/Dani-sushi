/* =======================
   GET /API/MANTER (KEEP-ALIVE DO SUPABASE)
   ======================= */

/* O PLANO FREE PAUSA APÓS ~7 DIAS SEM USO; O CRON DA VERCEL CHAMA 1 VEZ POR DIA */
import { timingSafeEqual } from 'node:crypto';
import { consultarSupabase } from './_comum.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ erro: 'metodo' });
  }

  if (!autorizado(req.headers.authorization)) return res.status(401).json({ erro: 'nao-autorizado' });

  try {
    await consultarSupabase(process.env, 'depoimentos?select=id&limit=1');
    return res.status(200).json({ ok: true });
  } catch (erro) {
    /* A MENSAGEM TRAZ SÓ STATUS E CORPO DA RESPOSTA DO SUPABASE (OU O CÓDIGO DE REDE), NUNCA AS CHAVES */
    console.error(`Keep-alive: ${erro.message}${erro.cause?.code ? ` (${erro.cause.code})` : ''}`);
    return res.status(500).json({ erro: 'supabase' });
  }
}

/* SEM CRON_SECRET CONFIGURADO, NINGUÉM PASSA */
function autorizado(cabecalho) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;

  const esperado = Buffer.from(`Bearer ${segredo}`);
  const recebido = Buffer.from(String(cabecalho ?? ''));
  return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
}
