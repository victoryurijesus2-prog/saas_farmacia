-- Natal Farma V8 — Fundação SaaS multi-tenant para Supabase/PostgreSQL
-- Execute em um projeto Supabase NOVO ou após revisar migrações existentes.
-- Nunca use service_role no navegador.

create extension if not exists pgcrypto;

-- ---------- enums ----------
do $$ begin
  create type public.app_role as enum ('SUPER_ADMIN','OWNER','ADMIN','MANAGER','EMPLOYEE','CUSTOMER');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.order_status as enum ('PENDING','AWAITING_PAYMENT','PAYMENT_APPROVED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.payment_status as enum ('PENDING','APPROVED','REJECTED','CANCELLED','REFUNDED');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.stock_movement_type as enum ('IN','OUT','RESERVE','RELEASE','ADJUST');
exception when duplicate_object then null; end $$;

-- ---------- SaaS / empresas ----------
create table if not exists public.pharmacies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  cnpj text,
  email text,
  phone text,
  logo_url text,
  address jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('trial','active','past_due','suspended','cancelled')),
  plan text not null default 'pilot',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  platform_role public.app_role not null default 'CUSTOMER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pharmacy_members (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null check (role in ('OWNER','ADMIN','MANAGER','EMPLOYEE')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(pharmacy_id,user_id)
);
create index if not exists idx_pharmacy_members_user on public.pharmacy_members(user_id, active);
create index if not exists idx_pharmacy_members_pharmacy on public.pharmacy_members(pharmacy_id, active);

-- ---------- catálogo ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  name text not null,
  slug text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(pharmacy_id,slug)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  brand text,
  sku text,
  barcode text,
  description text not null default '',
  price numeric(12,2) not null check(price >= 0),
  promo_price numeric(12,2) check(promo_price is null or (promo_price >= 0 and promo_price <= price)),
  cost numeric(12,2) not null default 0 check(cost >= 0),
  stock integer not null default 0 check(stock >= 0),
  reserved_stock integer not null default 0 check(reserved_stock >= 0 and reserved_stock <= stock),
  min_stock integer not null default 0 check(min_stock >= 0),
  expiry_date date,
  image_url text,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(pharmacy_id,slug),
  unique(pharmacy_id,sku),
  unique(pharmacy_id,barcode)
);
create index if not exists idx_products_pharmacy_active on public.products(pharmacy_id,active);
create index if not exists idx_products_pharmacy_name on public.products(pharmacy_id,name);
create index if not exists idx_products_low_stock on public.products(pharmacy_id,stock,min_stock) where active=true;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

-- ---------- clientes ----------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  total_spent numeric(12,2) not null default 0,
  orders_count integer not null default 0,
  points integer not null default 0,
  last_order_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(pharmacy_id,phone)
);
create index if not exists idx_customers_pharmacy on public.customers(pharmacy_id);
create index if not exists idx_customers_auth on public.customers(auth_user_id, pharmacy_id);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text not null default 'Principal',
  street text not null,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  reference text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- delivery ----------
create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  name text not null,
  fee numeric(12,2) not null default 0 check(fee >= 0),
  min_order numeric(12,2) not null default 0 check(min_order >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  unique(pharmacy_id,name)
);

-- ---------- marketing ----------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  code text not null,
  type text not null check(type in ('percent','fixed')),
  value numeric(12,2) not null check(value >= 0),
  min_total numeric(12,2) not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  per_customer integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(pharmacy_id,code)
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  title text,
  subtitle text,
  button_text text,
  button_url text,
  image_url text,
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- vendas ----------
create sequence if not exists public.order_number_seq start 1001;
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete restrict,
  order_number bigint not null default nextval('public.order_number_seq'),
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address_snapshot jsonb not null default '{}'::jsonb,
  subtotal numeric(12,2) not null check(subtotal >= 0),
  discount numeric(12,2) not null default 0 check(discount >= 0),
  delivery_fee numeric(12,2) not null default 0 check(delivery_fee >= 0),
  total numeric(12,2) not null check(total >= 0),
  payment_method text not null,
  payment_status public.payment_status not null default 'PENDING',
  status public.order_status not null default 'PENDING',
  delivery_mode text not null default 'delivery' check(delivery_mode in ('delivery','pickup')),
  delivery_zone_id uuid references public.delivery_zones(id) on delete set null,
  coupon_id uuid references public.coupons(id) on delete set null,
  stock_reserved boolean not null default false,
  stock_committed boolean not null default false,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(pharmacy_id,order_number)
);
create index if not exists idx_orders_pharmacy_created on public.orders(pharmacy_id,created_at desc);
create index if not exists idx_orders_customer on public.orders(pharmacy_id,customer_id,created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12,2) not null check(unit_price >= 0),
  unit_cost numeric(12,2) not null default 0 check(unit_cost >= 0),
  quantity integer not null check(quantity > 0),
  line_total numeric(12,2) generated always as (unit_price * quantity) stored
);
create index if not exists idx_order_items_order on public.order_items(order_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text,
  provider_payment_id text,
  method text not null,
  status public.payment_status not null default 'PENDING',
  amount numeric(12,2) not null check(amount >= 0),
  raw_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider,provider_payment_id)
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  actor_id uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

-- ---------- estoque ----------
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  type public.stock_movement_type not null,
  quantity integer not null check(quantity > 0),
  previous_stock integer not null,
  new_stock integer not null,
  reason text,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_stock_movements_product on public.stock_movements(pharmacy_id,product_id,created_at desc);

-- ---------- fidelidade ----------
create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  points integer not null,
  kind text not null check(kind in ('earn','redeem','adjust','expire')),
  description text,
  created_at timestamptz not null default now()
);

-- ---------- configurações / auditoria ----------
create table if not exists public.pharmacy_settings (
  pharmacy_id uuid primary key references public.pharmacies(id) on delete cascade,
  whatsapp text,
  support_phone text,
  hours jsonb not null default '{}'::jsonb,
  free_delivery_min numeric(12,2) not null default 0,
  loyalty_rate numeric(8,2) not null default 1,
  loyalty_redeem_points integer not null default 500,
  loyalty_redeem_value numeric(12,2) not null default 20,
  pix_enabled boolean not null default false,
  card_enabled boolean not null default false,
  pickup_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated by default as identity primary key,
  pharmacy_id uuid references public.pharmacies(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- helpers de autorização ----------
create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.platform_role='SUPER_ADMIN');
$$;

create or replace function public.is_pharmacy_member(pid uuid, allowed public.app_role[] default array['OWNER','ADMIN','MANAGER','EMPLOYEE']::public.app_role[])
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_super_admin() or exists(
    select 1 from public.pharmacy_members m
    where m.user_id=auth.uid() and m.pharmacy_id=pid and m.active=true and m.role=any(allowed)
  );
$$;

create or replace function public.customer_owns(cid uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.customers c where c.id=cid and c.auth_user_id=auth.uid());
$$;

-- ---------- RLS ----------
alter table public.pharmacies enable row level security;
alter table public.profiles enable row level security;
alter table public.pharmacy_members enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.coupons enable row level security;
alter table public.banners enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.order_status_history enable row level security;
alter table public.stock_movements enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.pharmacy_settings enable row level security;
alter table public.audit_logs enable row level security;

-- perfis
create policy "profile_self_read" on public.profiles for select using(id=auth.uid() or public.is_super_admin());
create policy "profile_self_update" on public.profiles for update using(id=auth.uid()) with check(id=auth.uid());

-- farmácia e membros
create policy "pharmacy_member_read" on public.pharmacies for select using(public.is_super_admin() or public.is_pharmacy_member(id));
create policy "pharmacy_owner_update" on public.pharmacies for update using(public.is_pharmacy_member(id,array['OWNER','ADMIN']::public.app_role[])) with check(public.is_pharmacy_member(id,array['OWNER','ADMIN']::public.app_role[]));
create policy "members_read_same_pharmacy" on public.pharmacy_members for select using(public.is_pharmacy_member(pharmacy_id));
create policy "members_manage_admin" on public.pharmacy_members for all using(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN']::public.app_role[])) with check(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN']::public.app_role[]));

-- catálogo público só de loja ativa; escrita somente equipe autorizada
create policy "public_categories" on public.categories for select using(active=true or public.is_pharmacy_member(pharmacy_id));
create policy "manage_categories" on public.categories for all using(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER']::public.app_role[])) with check(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER']::public.app_role[]));
create policy "public_products" on public.products for select using(active=true or public.is_pharmacy_member(pharmacy_id));
create policy "manage_products" on public.products for all using(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER','EMPLOYEE']::public.app_role[])) with check(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER','EMPLOYEE']::public.app_role[]));
create policy "public_product_images" on public.product_images for select using(true);
create policy "manage_product_images" on public.product_images for all using(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER']::public.app_role[])) with check(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER']::public.app_role[]));

-- clientes
create policy "customer_self_or_staff" on public.customers for select using(auth_user_id=auth.uid() or public.is_pharmacy_member(pharmacy_id));
create policy "staff_manage_customers" on public.customers for all using(public.is_pharmacy_member(pharmacy_id)) with check(public.is_pharmacy_member(pharmacy_id));
create policy "address_owner_or_staff" on public.customer_addresses for select using(public.customer_owns(customer_id) or public.is_pharmacy_member(pharmacy_id));
create policy "address_owner_write" on public.customer_addresses for all using(public.customer_owns(customer_id) or public.is_pharmacy_member(pharmacy_id)) with check(public.customer_owns(customer_id) or public.is_pharmacy_member(pharmacy_id));

-- delivery/marketing/settings públicos para leitura; gestão restrita
create policy "public_delivery_zones" on public.delivery_zones for select using(active=true or public.is_pharmacy_member(pharmacy_id));
create policy "manage_delivery_zones" on public.delivery_zones for all using(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER']::public.app_role[])) with check(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER']::public.app_role[]));
create policy "public_valid_coupons" on public.coupons for select using(active=true and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>=now()) or public.is_pharmacy_member(pharmacy_id));
create policy "manage_coupons" on public.coupons for all using(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER']::public.app_role[])) with check(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER']::public.app_role[]));
create policy "public_banners" on public.banners for select using(active=true or public.is_pharmacy_member(pharmacy_id));
create policy "manage_banners" on public.banners for all using(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER']::public.app_role[])) with check(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN','MANAGER']::public.app_role[]));
create policy "public_settings" on public.pharmacy_settings for select using(true);
create policy "manage_settings" on public.pharmacy_settings for all using(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN']::public.app_role[])) with check(public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN']::public.app_role[]));

-- pedidos e itens
create policy "orders_customer_or_staff" on public.orders for select using(public.is_pharmacy_member(pharmacy_id) or public.customer_owns(customer_id));
create policy "orders_staff_update" on public.orders for update using(public.is_pharmacy_member(pharmacy_id)) with check(public.is_pharmacy_member(pharmacy_id));
create policy "items_customer_or_staff" on public.order_items for select using(public.is_pharmacy_member(pharmacy_id) or exists(select 1 from public.orders o where o.id=order_id and public.customer_owns(o.customer_id)));
create policy "payments_customer_or_staff" on public.payments for select using(public.is_pharmacy_member(pharmacy_id) or exists(select 1 from public.orders o where o.id=order_id and public.customer_owns(o.customer_id)));
create policy "history_customer_or_staff" on public.order_status_history for select using(public.is_pharmacy_member(pharmacy_id) or exists(select 1 from public.orders o where o.id=order_id and public.customer_owns(o.customer_id)));

-- estoque, fidelidade, auditoria
create policy "stock_staff_read" on public.stock_movements for select using(public.is_pharmacy_member(pharmacy_id));
create policy "loyalty_owner_or_staff" on public.loyalty_transactions for select using(public.is_pharmacy_member(pharmacy_id) or public.customer_owns(customer_id));
create policy "audit_admin_read" on public.audit_logs for select using(public.is_super_admin() or (pharmacy_id is not null and public.is_pharmacy_member(pharmacy_id,array['OWNER','ADMIN']::public.app_role[])));

-- ---------- criação segura de pedido ----------
-- Recebe somente IDs/quantidades + dados do cliente. Preço, desconto, frete e estoque são recalculados no banco.
create or replace function public.create_order_secure(p_pharmacy uuid, payload jsonb)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  oid uuid := gen_random_uuid();
  cid uuid;
  item jsonb;
  prod public.products%rowtype;
  z public.delivery_zones%rowtype;
  cp public.coupons%rowtype;
  subtotal_v numeric(12,2) := 0;
  discount_v numeric(12,2) := 0;
  fee_v numeric(12,2) := 0;
  total_v numeric(12,2);
  q integer;
  phone_v text := regexp_replace(coalesce(payload->>'phone',''),'\D','','g');
  mode_v text := coalesce(payload->>'delivery_mode','delivery');
begin
  if not exists(select 1 from public.pharmacies where id=p_pharmacy and status in ('trial','active')) then
    raise exception 'Farmácia indisponível';
  end if;
  if length(trim(coalesce(payload->>'name',''))) < 2 or length(phone_v) < 10 then
    raise exception 'Dados do cliente inválidos';
  end if;
  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') = 0 then
    raise exception 'Carrinho vazio';
  end if;

  for item in select * from jsonb_array_elements(payload->'items') loop
    q := greatest(1,(item->>'qty')::integer);
    select * into prod from public.products
      where id=(item->>'id')::uuid and pharmacy_id=p_pharmacy and active=true
      for update;
    if not found then raise exception 'Produto inválido'; end if;
    if (prod.stock - prod.reserved_stock) < q then raise exception 'Estoque insuficiente para %', prod.name; end if;
    subtotal_v := subtotal_v + coalesce(prod.promo_price,prod.price) * q;
  end loop;

  if mode_v='delivery' then
    select * into z from public.delivery_zones
      where id=(payload->>'delivery_zone_id')::uuid and pharmacy_id=p_pharmacy and active=true;
    if not found then raise exception 'Região de entrega inválida'; end if;
    if subtotal_v < z.min_order then raise exception 'Pedido abaixo do mínimo para esta região'; end if;
    fee_v := z.fee;
    if exists(select 1 from public.pharmacy_settings s where s.pharmacy_id=p_pharmacy and s.free_delivery_min>0 and subtotal_v>=s.free_delivery_min) then fee_v:=0; end if;
  elsif mode_v <> 'pickup' then
    raise exception 'Modalidade de entrega inválida';
  end if;

  if nullif(trim(coalesce(payload->>'coupon_code','')),'') is not null then
    select * into cp from public.coupons
      where pharmacy_id=p_pharmacy and upper(code)=upper(trim(payload->>'coupon_code')) and active=true
        and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>=now())
        and min_total<=subtotal_v and (max_uses is null or used_count<max_uses)
      for update;
    if found then
      discount_v := least(subtotal_v, case when cp.type='percent' then subtotal_v*cp.value/100 else cp.value end);
      update public.coupons set used_count=used_count+1 where id=cp.id;
    end if;
  end if;

  total_v := greatest(0, subtotal_v - discount_v + fee_v);

  select id into cid from public.customers where pharmacy_id=p_pharmacy and phone=phone_v;
  if cid is null then
    insert into public.customers(pharmacy_id,auth_user_id,name,phone,email)
    values(p_pharmacy,auth.uid(),trim(payload->>'name'),phone_v,nullif(trim(payload->>'email'),''))
    returning id into cid;
  else
    update public.customers set name=trim(payload->>'name'), email=coalesce(nullif(trim(payload->>'email'),''),email), updated_at=now()
      where id=cid;
  end if;

  insert into public.orders(id,pharmacy_id,customer_id,customer_name,customer_phone,customer_email,address_snapshot,subtotal,discount,delivery_fee,total,payment_method,delivery_mode,delivery_zone_id,coupon_id,stock_reserved)
  values(oid,p_pharmacy,cid,trim(payload->>'name'),phone_v,nullif(trim(payload->>'email'),''),coalesce(payload->'address','{}'::jsonb),subtotal_v,discount_v,fee_v,total_v,coalesce(payload->>'payment_method','PIX'),mode_v,case when mode_v='delivery' then z.id else null end,cp.id,true);

  for item in select * from jsonb_array_elements(payload->'items') loop
    q := greatest(1,(item->>'qty')::integer);
    select * into prod from public.products where id=(item->>'id')::uuid and pharmacy_id=p_pharmacy for update;
    insert into public.order_items(pharmacy_id,order_id,product_id,product_name,unit_price,unit_cost,quantity)
      values(p_pharmacy,oid,prod.id,prod.name,coalesce(prod.promo_price,prod.price),prod.cost,q);
    update public.products set reserved_stock=reserved_stock+q, updated_at=now() where id=prod.id;
    insert into public.stock_movements(pharmacy_id,product_id,order_id,type,quantity,previous_stock,new_stock,reason,actor_id)
      values(p_pharmacy,prod.id,oid,'RESERVE',q,prod.stock,prod.stock,'Reserva do pedido',auth.uid());
  end loop;

  insert into public.order_status_history(pharmacy_id,order_id,status,actor_id,note)
    values(p_pharmacy,oid,'PENDING',auth.uid(),'Pedido criado');
  return oid;
end;
$$;

-- ---------- commit/release de estoque pela equipe/backend ----------
create or replace function public.set_order_status_secure(p_order uuid, p_status public.order_status, p_note text default null)
returns void language plpgsql security definer set search_path=public as $$
declare o public.orders%rowtype; it record; p public.products%rowtype;
begin
  select * into o from public.orders where id=p_order for update;
  if not found then raise exception 'Pedido não encontrado'; end if;
  if not public.is_pharmacy_member(o.pharmacy_id) then raise exception 'Acesso negado'; end if;

  if p_status='CANCELLED' and o.stock_reserved=true and o.stock_committed=false then
    for it in select * from public.order_items where order_id=o.id loop
      select * into p from public.products where id=it.product_id for update;
      update public.products set reserved_stock=greatest(0,reserved_stock-it.quantity),updated_at=now() where id=p.id;
      insert into public.stock_movements(pharmacy_id,product_id,order_id,type,quantity,previous_stock,new_stock,reason,actor_id)
        values(o.pharmacy_id,p.id,o.id,'RELEASE',it.quantity,p.stock,p.stock,'Cancelamento/liberação de reserva',auth.uid());
    end loop;
    update public.orders set stock_reserved=false where id=o.id;
  end if;

  if p_status in ('PAYMENT_APPROVED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED') and o.stock_reserved=true and o.stock_committed=false then
    for it in select * from public.order_items where order_id=o.id loop
      select * into p from public.products where id=it.product_id for update;
      if p.stock < it.quantity then raise exception 'Estoque inconsistente para %',p.name; end if;
      update public.products set stock=stock-it.quantity,reserved_stock=greatest(0,reserved_stock-it.quantity),updated_at=now() where id=p.id;
      insert into public.stock_movements(pharmacy_id,product_id,order_id,type,quantity,previous_stock,new_stock,reason,actor_id)
        values(o.pharmacy_id,p.id,o.id,'OUT',it.quantity,p.stock,p.stock-it.quantity,'Baixa por pedido confirmado',auth.uid());
    end loop;
    update public.orders set stock_committed=true,stock_reserved=false where id=o.id;
  end if;

  update public.orders set status=p_status,updated_at=now() where id=o.id;
  insert into public.order_status_history(pharmacy_id,order_id,status,actor_id,note) values(o.pharmacy_id,o.id,p_status,auth.uid(),p_note);
end;
$$;

-- ---------- gatilho para profile ----------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,full_name,phone,platform_role)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_user_meta_data->>'phone','CUSTOMER')
  on conflict(id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- ---------- views úteis ----------
create or replace view public.low_stock_products as
select id,pharmacy_id,name,sku,stock,reserved_stock,(stock-reserved_stock) available_stock,min_stock,expiry_date
from public.products
where active=true and (stock-reserved_stock)<=min_stock;

-- permissões das funções públicas
revoke all on function public.create_order_secure(uuid,jsonb) from public;
grant execute on function public.create_order_secure(uuid,jsonb) to anon,authenticated;
revoke all on function public.set_order_status_secure(uuid,public.order_status,text) from public;
grant execute on function public.set_order_status_secure(uuid,public.order_status,text) to authenticated;

-- ============================================================
-- V8.1 — ajustes para frontend público + Storage
-- ============================================================
-- A loja pública precisa resolver a farmácia pelo slug antes de consultar catálogo.
drop policy if exists "public_active_pharmacy_read" on public.pharmacies;
create policy "public_active_pharmacy_read" on public.pharmacies
for select using (status in ('trial','active'));

-- Bucket público de imagens. Escrita continua limitada a membros autorizados.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pharmacy-images',
  'pharmacy-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public_read_pharmacy_images" on storage.objects;
create policy "public_read_pharmacy_images" on storage.objects
for select using (bucket_id = 'pharmacy-images');

drop policy if exists "staff_insert_pharmacy_images" on storage.objects;
create policy "staff_insert_pharmacy_images" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'pharmacy-images'
  and public.is_pharmacy_member(
    ((storage.foldername(name))[1])::uuid,
    array['OWNER','ADMIN','MANAGER','EMPLOYEE']::public.app_role[]
  )
);

drop policy if exists "staff_update_pharmacy_images" on storage.objects;
create policy "staff_update_pharmacy_images" on storage.objects
for update to authenticated
using (
  bucket_id = 'pharmacy-images'
  and public.is_pharmacy_member(
    ((storage.foldername(name))[1])::uuid,
    array['OWNER','ADMIN','MANAGER','EMPLOYEE']::public.app_role[]
  )
)
with check (
  bucket_id = 'pharmacy-images'
  and public.is_pharmacy_member(
    ((storage.foldername(name))[1])::uuid,
    array['OWNER','ADMIN','MANAGER','EMPLOYEE']::public.app_role[]
  )
);

drop policy if exists "staff_delete_pharmacy_images" on storage.objects;
create policy "staff_delete_pharmacy_images" on storage.objects
for delete to authenticated
using (
  bucket_id = 'pharmacy-images'
  and public.is_pharmacy_member(
    ((storage.foldername(name))[1])::uuid,
    array['OWNER','ADMIN','MANAGER']::public.app_role[]
  )
);
