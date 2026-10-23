/* === /API/MODERAR ===
   GET: SÓ MOSTRA A CONFIRMAÇÃO (O ANTIVÍRUS DO E-MAIL PODE PRÉ-ABRIR O LINK SEM APROVAR NADA).
   POST (BOTÃO DA CONFIRMAÇÃO): ALTERA O STATUS; AO APROVAR, DISPARA O DEPLOY HOOK DA VERCEL */
import { escaparHtml, consultarSupabase, tokenValido, UUID } from './_comum.js';

const ACOES = {
  aprovar: { status: 'aprovado', botao: 'Confirmar aprovação', titulo: 'Aprovar depoimento?' },
  recusar: { status: 'recusado', botao: 'Confirmar recusa', titulo: 'Recusar depoimento?' },
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return responder(res, 405, { titulo: 'Método não permitido.' });
  }

  const { id, acao, token } = (req.method === 'POST' ? req.body : req.query) ?? {};

  if (!UUID.test(String(id)) || !ACOES[acao] || !tokenValido(id, acao, token)) {
    return responder(res, 403, { titulo: 'Link inválido.', mensagem: 'Abra o link de novo direto do e-mail.' });
  }

  try {
    const depoimento = await buscar(id);
    if (!depoimento) return responder(res, 404, { titulo: 'Depoimento não encontrado.' });

    /* JÁ MODERADO: SÓ MOSTRA O STATUS ATUAL */
    if (depoimento.status !== 'pendente') return responderJaModerado(res, depoimento);

    if (req.method === 'GET') {
      return responder(res, 200, { titulo: ACOES[acao].titulo, depoimento, formulario: { id, acao, token, rotulo: ACOES[acao].botao } });
    }

    /* SÓ ATUALIZA SE AINDA ESTIVER PENDENTE (DOIS CLIQUES SEGUIDOS NÃO MODERAM DUAS VEZES) */
    const status = ACOES[acao].status;
    const atualizados = await consultarSupabase(process.env, `depoimentos?id=eq.${id}&status=eq.pendente`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ status, moderado_em: new Date().toISOString() }),
    });
    if (!atualizados.length) return responderJaModerado(res, await buscar(id));

    if (status === 'recusado') {
      return responder(res, 200, { titulo: 'Pronto.', mensagem: 'O depoimento foi recusado e não vai para o site.', depoimento });
    }

    const deploy = await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => null);
    if (!deploy?.ok) {
      return responder(res, 200, {
        titulo: 'Aprovado, mas o site não foi atualizado.',
        mensagem: 'O deploy não foi disparado. Faça um Redeploy no painel da Vercel para o depoimento entrar no site.',
        depoimento,
      });
    }

    return responder(res, 200, { titulo: 'Pronto.', mensagem: 'Entra no site em cerca de 1 minuto.', depoimento });
  } catch (erro) {
    console.error(erro);
    return responder(res, 500, { titulo: 'Algo deu errado.', mensagem: 'Tente de novo em alguns minutos.' });
  }
}

async function buscar(id) {
  const [depoimento] = await consultarSupabase(process.env, `depoimentos?id=eq.${id}&select=nome,cidade,tipo_evento,texto,status`);
  return depoimento ?? null;
}

function responderJaModerado(res, depoimento) {
  return responder(res, 200, {
    titulo: `Este depoimento já foi ${depoimento.status}.`,
    mensagem: 'Nada foi alterado.',
    depoimento,
  });
}

/* === PÁGINA MÍNIMA NA IDENTIDADE VISUAL (FUNDO PRETO, VERMELHO), SEM INDEXAÇÃO NEM CACHE === */
function responder(res, codigo, { titulo, mensagem, depoimento, formulario }) {
  const cartao = depoimento
    ? `<figure>
      <blockquote>${escaparHtml(depoimento.texto)}</blockquote>
      <figcaption><strong>${escaparHtml(depoimento.nome)}</strong><span>${escaparHtml(depoimento.tipo_evento)} · ${escaparHtml(depoimento.cidade)}</span></figcaption>
    </figure>`
    : '';

  const confirmar = formulario
    ? `<form method="post" action="/api/moderar">
      <input type="hidden" name="id" value="${escaparHtml(formulario.id)}">
      <input type="hidden" name="acao" value="${escaparHtml(formulario.acao)}">
      <input type="hidden" name="token" value="${escaparHtml(formulario.token)}">
      <button type="submit">${escaparHtml(formulario.rotulo)}</button>
    </form>`
    : '';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Referrer-Policy', 'no-referrer');

  return res.status(codigo).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${escaparHtml(titulo)} · Dani Sushi</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { min-height: 100vh; display: grid; place-items: center; padding: 40px 20px; background: #0B0908; color: #BDB5AE; font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; }
    main { width: 100%; max-width: 560px; }
    .marca { font: 13px Georgia, serif; letter-spacing: 0.32em; text-transform: uppercase; color: #E8566B; }
    h1 { margin-top: 16px; font: 400 28px/1.2 Georgia, "Times New Roman", serif; letter-spacing: 0.06em; text-transform: uppercase; color: #F2EEEA; }
    p { margin-top: 12px; }
    figure { margin-top: 32px; padding: 28px 24px; border: 1px solid rgba(242,238,234,0.10); border-radius: 4px; }
    blockquote { font: 18px/1.6 Georgia, serif; color: #F2EEEA; white-space: pre-line; }
    figcaption { display: grid; margin-top: 20px; font-size: 14px; }
    figcaption strong { font-weight: 500; color: #F2EEEA; }
    figcaption span { color: #8E8680; }
    button { margin-top: 32px; width: 100%; height: 52px; border: 0; border-radius: 999px; background: #C8102E; color: #ffffff; font: 500 15px system-ui, sans-serif; cursor: pointer; }
    button:focus-visible { outline: 2px solid #E8566B; outline-offset: 4px; }
  </style>
</head>
<body>
  <main>
    <p class="marca">Dani Sushi · Depoimentos</p>
    <h1>${escaparHtml(titulo)}</h1>
    ${mensagem ? `<p>${escaparHtml(mensagem)}</p>` : ''}
    ${cartao}
    ${confirmar}
  </main>
</body>
</html>`);
}
