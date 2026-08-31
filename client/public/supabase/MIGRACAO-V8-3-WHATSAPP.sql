-- Natal Farma V8.3 — status detalhado + log de notificações WhatsApp
-- Execute UMA VEZ no SQL Editor do projeto já existente.

alter type public.order_status add value if not exists 'AWAITING_PAYMENT' after 'PENDING';

create table if not exists public.whatsapp_notification_logs (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  recipient text not null,
  provider_message_id text,
  delivery_state text not null default 'QUEUED',
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_notification_logs_order_idx
  on public.whatsapp_notification_logs(order_id,created_at desc);

alter table public.whatsapp_notification_logs enable row level security;

drop policy if exists "whatsapp_logs_staff_select" on public.whatsapp_notification_logs;
create policy "whatsapp_logs_staff_select" on public.whatsapp_notification_logs
for select using(public.is_pharmacy_member(pharmacy_id));

drop policy if exists "whatsapp_logs_staff_insert" on public.whatsapp_notification_logs;
create policy "whatsapp_logs_staff_insert" on public.whatsapp_notification_logs
for insert with check(public.is_pharmacy_member(pharmacy_id));
