-- === DEPOIMENTOS DA DANI SUSHI ===
-- RODAR UMA VEZ NO SQL EDITOR DO SUPABASE.
-- O ACESSO É SÓ PELO SERVIDOR (FUNÇÕES DA VERCEL E BUILD), COM A SERVICE ROLE KEY:
-- RLS ATIVO E NENHUMA POLICY, ENTÃO AS CHAVES ANON/PUBLISHABLE NÃO LEEM NEM GRAVAM NADA.

create table if not exists public.depoimentos (
  id           uuid primary key default gen_random_uuid(),
  criado_em    timestamptz not null default now(),
  nome         text not null check (char_length(nome) between 2 and 60),
  cidade       text not null check (char_length(cidade) between 2 and 60),
  tipo_evento  text not null check (tipo_evento in ('Jantar residencial', 'Casamento', 'Aniversário', 'Corporativo', 'Outro')),
  texto        text not null check (char_length(texto) between 10 and 400),
  autorizado   boolean not null check (autorizado = true),
  status       text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado')),
  moderado_em  timestamptz,
  ip_hash      text
);

alter table public.depoimentos enable row level security;

create index if not exists depoimentos_status_criado_em_idx
  on public.depoimentos (status, criado_em desc);
