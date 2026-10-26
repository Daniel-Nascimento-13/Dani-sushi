/* =======================
   POST /API/DEPOIMENTOS
   ======================= */

/* VALIDA, GRAVA COMO PENDENTE E AVISA POR E-MAIL */
import { createHash } from 'node:crypto';
import { TIPOS_EVENTO, LIMITES, tamanho, escaparHtml, consultarSupabase, tokenModeracao } from './_comum.js';

const ENVIOS_POR_HORA = 3;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ erro: 'metodo' });
  }

  const corpo = req.body && typeof req.body === 'object' ? req.body : {};

  /* HONEYPOT: ROBÔ PREENCHEU O CAMPO OCULTO → RESPONDE OK SEM GRAVAR */
  if (corpo.site) return res.status(200).json({ ok: true });

  const depoimento = {
    nome: limparLinha(corpo.nome),
    cidade: limparLinha(corpo.cidade),
    tipo_evento: limparLinha(corpo.tipo_evento),
    texto: limparTexto(corpo.texto),
    autorizado: corpo.autorizado === true,
  };

  if (!valido(depoimento)) return res.status(400).json({ erro: 'dados' });

  try {
    /* RATE LIMIT: NO MÁXIMO 3 ENVIOS POR IP (HASH COM O SEGREDO) POR HORA */
    const ipHash = createHash('sha256').update(ipDe(req) + process.env.SEGREDO_MODERACAO).digest('hex');
    const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentes = await consultarSupabase(
      process.env,
      `depoimentos?select=id&ip_hash=eq.${ipHash}&criado_em=gte.${encodeURIComponent(umaHoraAtras)}&limit=${ENVIOS_POR_HORA}`,
    );
    if (recentes.length >= ENVIOS_POR_HORA) return res.status(429).json({ erro: 'limite' });

    const [gravado] = await consultarSupabase(process.env, 'depoimentos', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ ...depoimento, ip_hash: ipHash }),
    });

    await avisarPorEmail(gravado);
    return res.status(201).json({ ok: true });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'servidor' });
  }
}

/* === LIMPEZA === */
/* SEM HTML; NOME/CIDADE/TIPO EM 1 LINHA, TEXTO MANTÉM PARÁGRAFOS */
const semHtml = (valor) => String(valor ?? '').replace(/<[^>]*>/g, '');
const limparLinha = (valor) => semHtml(valor).replace(/\s+/g, ' ').trim();
const limparTexto = (valor) => semHtml(valor).replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

function valido(depoimento) {
  const dentro = (campo) => {
    const [minimo, maximo] = LIMITES[campo];
    const total = tamanho(depoimento[campo]);
    return total >= minimo && total <= maximo;
  };
  return dentro('nome') && dentro('cidade') && dentro('texto') && TIPOS_EVENTO.includes(depoimento.tipo_evento) && depoimento.autorizado;
}

/* IP DO VISITANTE (A VERCEL PREENCHE O X-FORWARDED-FOR) */
function ipDe(req) {
  return String(req.headers['x-forwarded-for'] ?? req.headers['x-real-ip'] ?? '').split(',')[0].trim();
}

/* === E-MAIL (RESEND) === */
async function avisarPorEmail({ id, nome, cidade, tipo_evento: tipo, texto }) {
  const link = (acao) => `${process.env.SITE_URL}/api/moderar?id=${id}&acao=${acao}&token=${tokenModeracao(id, acao)}`;
  const botao = (acao, rotulo, cor) =>
    `<a href="${link(acao)}" style="display:inline-block;padding:14px 28px;margin:0 8px 8px 0;border-radius:999px;background:${cor};color:#ffffff;font-weight:600;text-decoration:none">${rotulo}</a>`;

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1A1513;max-width:560px">
  <p style="margin:0 0 4px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#9E0E26">Novo depoimento</p>
  <p style="margin:0 0 20px"><strong>${escaparHtml(nome)}</strong><br>${escaparHtml(tipo)} · ${escaparHtml(cidade)}</p>
  <blockquote style="margin:0 0 28px;padding:0 0 0 16px;border-left:3px solid #C8102E;white-space:pre-line">${escaparHtml(texto)}</blockquote>
  ${botao('aprovar', 'Aprovar', '#C8102E')}${botao('recusar', 'Recusar', '#1A1513')}
  <p style="margin:20px 0 0;font-size:13px;color:#6b625c">Cada botão abre uma página de confirmação. Nada muda antes de você confirmar.</p>
</div>`;

  const text = `${nome}\n${tipo} · ${cidade}\n\n${texto}\n\nAprovar: ${link('aprovar')}\nRecusar: ${link('recusar')}`;

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Dani Sushi <avisos@danisushii.com.br>',
      to: [process.env.EMAIL_AVISO],
      subject: `Novo depoimento — ${nome} (${tipo})`,
      html,
      text,
    }),
  });

  if (!resposta.ok) throw new Error(`Resend ${resposta.status}: ${await resposta.text()}`);
}
