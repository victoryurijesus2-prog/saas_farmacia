-- Natal Farma V8.2 — rode UMA VEZ no SQL Editor do projeto já criado.
-- Torna o campo "Destaque na loja" persistente no Supabase.
alter table public.products
  add column if not exists featured boolean not null default false;

-- Mantém leitura pública apenas dos produtos ativos; nenhuma chave secreta é necessária.
-- As demais policies/RLS continuam as mesmas do schema V8.
