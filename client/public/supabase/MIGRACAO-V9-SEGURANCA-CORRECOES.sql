-- Natal Farma V9 — correções de pedidos, estoque, pagamentos, catálogo e RLS.
-- Execute UMA VEZ no SQL Editor depois das migrações V8.2 e V8.3.

begin;

alter table public.orders
  add column if not exists public_receipt_token uuid not null default gen_random_uuid(),
  add column if not exists reservation_expires_at timestamptz,
  add column if not exists coupon_usage_counted boolean not null default false,
  add column if not exists payment_confirmed_method text,
  add column if not exists customer_totals_applied boolean not null default false;

update public.orders
set reservation_expires_at = coalesce(reservation_expires_at, created_at + interval '30 minutes')
where stock_reserved = true and stock_committed = false and status not in ('CANCELLED','DELIVERED');

create unique index if not exists orders_public_receipt_token_uidx on public.orders(public_receipt_token);
create index if not exists orders_pending_reservation_idx
  on public.orders(reservation_expires_at)
  where stock_reserved = true and stock_committed = false;
create index if not exists orders_phone_coupon_idx
  on public.orders(pharmacy_id,customer_phone,coupon_id,created_at desc);

-- Catálogo público: devolve somente os campos necessários à vitrine.
create or replace function public.public_catalog_products_secure(p_pharmacy uuid)
returns jsonb
language sql stable security definer
set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',p.id,'pharmacy_id',p.pharmacy_id,'category_id',p.category_id,
      'name',p.name,'slug',p.slug,'brand',p.brand,'description',p.description,
      'price',p.price,'promo_price',p.promo_price,
      'stock',greatest(0,p.stock-p.reserved_stock),'reserved_stock',0,'min_stock',0,
      'expiry_date',null,'image_url',p.image_url,'featured',p.featured,'active',p.active,
      'categories',case when c.id is null then null else jsonb_build_object('name',c.name) end
    ) order by p.name
  ),'[]'::jsonb)
  from public.products p
  join public.pharmacies ph on ph.id=p.pharmacy_id and ph.status in ('trial','active')
  left join public.categories c on c.id=p.category_id and c.pharmacy_id=p.pharmacy_id
  where p.pharmacy_id=p_pharmacy and p.active=true;
$$;

-- Lista completa somente para equipe da farmácia.
create or replace function public.staff_products_secure(p_pharmacy uuid)
returns jsonb
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_pharmacy_member(p_pharmacy) then raise exception 'Acesso negado'; end if;
  return (
    select coalesce(jsonb_agg(to_jsonb(p) || jsonb_build_object(
      'categories',case when c.id is null then null else jsonb_build_object('name',c.name) end
    ) order by p.name),'[]'::jsonb)
    from public.products p
    left join public.categories c on c.id=p.category_id and c.pharmacy_id=p.pharmacy_id
    where p.pharmacy_id=p_pharmacy
  );
end;
$$;

create or replace function public.upsert_product_secure(p_pharmacy uuid,p_payload jsonb)
returns jsonb
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare v_id uuid; v_category uuid; v_row public.products%rowtype;
begin
  if not public.is_pharmacy_member(p_pharmacy,array['OWNER','ADMIN','MANAGER','EMPLOYEE']::public.app_role[]) then raise exception 'Acesso negado'; end if;
  if length(trim(coalesce(p_payload->>'name',''))) < 2 then raise exception 'Nome do produto inválido'; end if;
  v_id=nullif(p_payload->>'id','')::uuid;
  v_category=nullif(p_payload->>'category_id','')::uuid;
  if v_category is null and nullif(trim(p_payload->>'category'),'') is not null then
    select id into v_category from public.categories where pharmacy_id=p_pharmacy and name=p_payload->>'category' limit 1;
  end if;
  if v_category is not null and not exists(select 1 from public.categories where id=v_category and pharmacy_id=p_pharmacy) then raise exception 'Categoria inválida'; end if;

  insert into public.products(id,pharmacy_id,category_id,name,slug,brand,sku,barcode,description,price,promo_price,cost,stock,min_stock,expiry_date,image_url,featured,active)
  values(coalesce(v_id,gen_random_uuid()),p_pharmacy,v_category,trim(p_payload->>'name'),coalesce(nullif(p_payload->>'slug',''),lower(regexp_replace(trim(p_payload->>'name'),'[^a-zA-Z0-9]+','-','g'))),
    nullif(p_payload->>'brand',''),nullif(p_payload->>'sku',''),nullif(p_payload->>'barcode',''),coalesce(p_payload->>'description',''),
    greatest(0,coalesce((p_payload->>'price')::numeric,0)),nullif(p_payload->>'promo_price','')::numeric,greatest(0,coalesce((p_payload->>'cost')::numeric,0)),
    greatest(0,coalesce((p_payload->>'stock')::integer,0)),greatest(0,coalesce((p_payload->>'min_stock')::integer,0)),nullif(p_payload->>'expiry_date','')::date,
    nullif(p_payload->>'image_url',''),coalesce((p_payload->>'featured')::boolean,false),coalesce((p_payload->>'active')::boolean,true))
  on conflict(id) do update set category_id=excluded.category_id,name=excluded.name,slug=excluded.slug,brand=excluded.brand,sku=excluded.sku,barcode=excluded.barcode,
    description=excluded.description,price=excluded.price,promo_price=excluded.promo_price,cost=excluded.cost,stock=excluded.stock,min_stock=excluded.min_stock,
    expiry_date=excluded.expiry_date,image_url=excluded.image_url,featured=excluded.featured,active=excluded.active,updated_at=now()
  where public.products.pharmacy_id=p_pharmacy
  returning * into v_row;
  if v_row.id is null then raise exception 'Produto não encontrado nesta farmácia'; end if;
  return to_jsonb(v_row);
end;
$$;

create or replace function public.delete_product_secure(p_product uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_pid uuid;
begin
  select pharmacy_id into v_pid from public.products where id=p_product;
  if v_pid is null then raise exception 'Produto não encontrado'; end if;
  if not public.is_pharmacy_member(v_pid,array['OWNER','ADMIN','MANAGER','EMPLOYEE']::public.app_role[]) then raise exception 'Acesso negado'; end if;
  delete from public.products where id=p_product and pharmacy_id=v_pid;
end; $$;

-- Libera reservas abandonadas e devolve o uso do cupom.
create or replace function public.expire_stale_order_reservations()
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders%rowtype; it record; affected integer:=0;
begin
  for o in select * from public.orders
    where stock_reserved=true and stock_committed=false and status not in ('CANCELLED','DELIVERED')
      and reservation_expires_at is not null and reservation_expires_at<=now()
    order by id for update skip locked
  loop
    for it in select * from public.order_items where order_id=o.id order by product_id loop
      update public.products set reserved_stock=greatest(0,reserved_stock-it.quantity),updated_at=now()
      where id=it.product_id and pharmacy_id=o.pharmacy_id;
    end loop;
    if o.coupon_id is not null and o.coupon_usage_counted then
      update public.coupons set used_count=greatest(0,used_count-1) where id=o.coupon_id and pharmacy_id=o.pharmacy_id;
    end if;
    update public.orders set status='CANCELLED',stock_reserved=false,reservation_expires_at=null,coupon_usage_counted=false,cancel_reason='Reserva expirada',updated_at=now() where id=o.id;
    insert into public.order_status_history(pharmacy_id,order_id,status,note) values(o.pharmacy_id,o.id,'CANCELLED','Reserva expirada automaticamente');
    affected:=affected+1;
  end loop;
  return affected;
end; $$;

-- Pedido V2: limita abuso, valida endereço/pagamento, aplica limite por cliente e retorna recibo seguro.
create or replace function public.create_order_secure_v2(p_pharmacy uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  oid uuid:=gen_random_uuid(); cid uuid; item jsonb; prod public.products%rowtype; z public.delivery_zones%rowtype; cp public.coupons%rowtype;
  subtotal_v numeric(12,2):=0; discount_v numeric(12,2):=0; fee_v numeric(12,2):=0; total_v numeric(12,2); q integer;
  phone_v text:=regexp_replace(coalesce(p_payload->>'phone',''),'\D','','g'); mode_v text:=coalesce(p_payload->>'delivery_mode','delivery');
  uid_v uuid:=(select auth.uid()); receipt jsonb; verified_email text;
begin
  perform public.expire_stale_order_reservations();
  if not exists(select 1 from public.pharmacies where id=p_pharmacy and status in ('trial','active')) then raise exception 'Farmácia indisponível'; end if;
  if length(trim(coalesce(p_payload->>'name',''))) < 2 or length(phone_v) < 10 then raise exception 'Dados do cliente inválidos'; end if;
  if jsonb_typeof(p_payload->'items') <> 'array' or jsonb_array_length(p_payload->'items')=0 or jsonb_array_length(p_payload->'items')>50 then raise exception 'Carrinho inválido'; end if;
  if mode_v='delivery' and length(trim(coalesce(p_payload->'address'->>'formatted',''))) < 8 then raise exception 'Endereço de entrega inválido'; end if;
  if coalesce(p_payload->>'payment_method','PIX') not in ('PIX','Dinheiro','Cartão de débito','Cartão de crédito') then raise exception 'Forma de pagamento inválida'; end if;
  if (select count(*) from public.orders where pharmacy_id=p_pharmacy and customer_phone=phone_v and created_at>now()-interval '15 minutes' and status not in ('CANCELLED','DELIVERED'))>=5 then raise exception 'Muitos pedidos recentes. Aguarde alguns minutos'; end if;

  for item in select * from jsonb_array_elements(p_payload->'items') order by value->>'id' loop
    begin q:=(item->>'qty')::integer; exception when others then raise exception 'Quantidade inválida'; end;
    if q<1 or q>100 then raise exception 'Quantidade inválida'; end if;
    select * into prod from public.products where id=(item->>'id')::uuid and pharmacy_id=p_pharmacy and active=true for update;
    if not found then raise exception 'Produto inválido'; end if;
    if prod.stock-prod.reserved_stock<q then raise exception 'Estoque insuficiente para %',prod.name; end if;
    subtotal_v:=subtotal_v+coalesce(prod.promo_price,prod.price)*q;
  end loop;

  if mode_v='delivery' then
    select * into z from public.delivery_zones where id=nullif(p_payload->>'delivery_zone_id','')::uuid and pharmacy_id=p_pharmacy and active=true;
    if not found then raise exception 'Região de entrega inválida'; end if;
    if subtotal_v<z.min_order then raise exception 'Pedido abaixo do mínimo para esta região'; end if;
    fee_v:=z.fee;
    if exists(select 1 from public.pharmacy_settings where pharmacy_id=p_pharmacy and free_delivery_min>0 and subtotal_v>=free_delivery_min) then fee_v:=0; end if;
  elsif mode_v<>'pickup' then raise exception 'Modalidade de entrega inválida'; end if;

  if nullif(trim(coalesce(p_payload->>'coupon_code','')),'') is not null then
    select * into cp from public.coupons where pharmacy_id=p_pharmacy and upper(code)=upper(trim(p_payload->>'coupon_code')) and active=true
      and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>=now()) and min_total<=subtotal_v and (max_uses is null or used_count<max_uses) for update;
    if not found then raise exception 'Cupom inválido ou indisponível'; end if;
    if cp.per_customer is not null and (select count(*) from public.orders where pharmacy_id=p_pharmacy and coupon_id=cp.id and customer_phone=phone_v and coupon_usage_counted=true)>=cp.per_customer then raise exception 'Limite deste cupom atingido para este cliente'; end if;
    discount_v:=least(subtotal_v,case when cp.type='percent' then subtotal_v*cp.value/100 else cp.value end);
    update public.coupons set used_count=used_count+1 where id=cp.id;
  end if;
  total_v:=greatest(0,subtotal_v-discount_v+fee_v);

  if uid_v is not null then select id into cid from public.customers where pharmacy_id=p_pharmacy and auth_user_id=uid_v limit 1; end if;
  if cid is null then select id into cid from public.customers where pharmacy_id=p_pharmacy and phone=phone_v limit 1; end if;
  if cid is null then
    insert into public.customers(pharmacy_id,auth_user_id,name,phone,email) values(p_pharmacy,uid_v,trim(p_payload->>'name'),phone_v,nullif(trim(p_payload->>'email'),'')) returning id into cid;
  else
    if uid_v is not null then
      select lower(email) into verified_email from auth.users where id=uid_v and email_confirmed_at is not null;
      update public.customers set auth_user_id=uid_v where id=cid and auth_user_id is null and verified_email is not null and lower(email)=verified_email;
    end if;
    update public.customers set name=trim(p_payload->>'name'),email=coalesce(nullif(trim(p_payload->>'email'),''),email),updated_at=now() where id=cid;
  end if;

  insert into public.orders(id,pharmacy_id,customer_id,customer_name,customer_phone,customer_email,address_snapshot,subtotal,discount,delivery_fee,total,payment_method,delivery_mode,delivery_zone_id,coupon_id,stock_reserved,reservation_expires_at,coupon_usage_counted)
  values(oid,p_pharmacy,cid,trim(p_payload->>'name'),phone_v,nullif(trim(p_payload->>'email'),''),coalesce(p_payload->'address','{}'),subtotal_v,discount_v,fee_v,total_v,p_payload->>'payment_method',mode_v,case when mode_v='delivery' then z.id end,cp.id,true,now()+interval '30 minutes',cp.id is not null);
  for item in select * from jsonb_array_elements(p_payload->'items') order by value->>'id' loop
    q:=(item->>'qty')::integer; select * into prod from public.products where id=(item->>'id')::uuid and pharmacy_id=p_pharmacy for update;
    insert into public.order_items(pharmacy_id,order_id,product_id,product_name,unit_price,unit_cost,quantity) values(p_pharmacy,oid,prod.id,prod.name,coalesce(prod.promo_price,prod.price),prod.cost,q);
    update public.products set reserved_stock=reserved_stock+q,updated_at=now() where id=prod.id;
    insert into public.stock_movements(pharmacy_id,product_id,order_id,type,quantity,previous_stock,new_stock,reason,actor_id) values(p_pharmacy,prod.id,oid,'RESERVE',q,prod.stock,prod.stock,'Reserva do pedido',uid_v);
  end loop;
  insert into public.order_status_history(pharmacy_id,order_id,status,actor_id,note) values(p_pharmacy,oid,'PENDING',uid_v,'Pedido criado');
  select to_jsonb(o)||jsonb_build_object('order_items',(select coalesce(jsonb_agg(to_jsonb(i)),'[]') from public.order_items i where i.order_id=o.id),'order_status_history',(select coalesce(jsonb_agg(to_jsonb(h) order by h.created_at),'[]') from public.order_status_history h where h.order_id=o.id)) into receipt from public.orders o where o.id=oid;
  return receipt;
end; $$;

-- Status V2: valida a sequência e persiste pagamento.
create or replace function public.set_order_status_secure_v2(p_order uuid,p_status public.order_status,p_note text default null,p_payment_status text default null,p_payment_method text default null)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders%rowtype; it record; p public.products%rowtype; allowed boolean:=false; earned_points integer:=0;
begin
  perform public.expire_stale_order_reservations();
  select * into o from public.orders where id=p_order for update;
  if not found then raise exception 'Pedido não encontrado'; end if;
  if not public.is_pharmacy_member(o.pharmacy_id) then raise exception 'Acesso negado'; end if;
  if p_status=o.status then allowed:=true;
  elsif o.status='PENDING' and p_status in ('AWAITING_PAYMENT','PAYMENT_APPROVED','PREPARING','CANCELLED') then allowed:=true;
  elsif o.status='AWAITING_PAYMENT' and p_status in ('PAYMENT_APPROVED','CANCELLED') then allowed:=true;
  elsif o.status='PAYMENT_APPROVED' and p_status in ('PREPARING','CANCELLED') then allowed:=true;
  elsif o.status='PREPARING' and p_status in ('READY','CANCELLED') then allowed:=true;
  elsif o.status='READY' and p_status in ('OUT_FOR_DELIVERY','DELIVERED','CANCELLED') then allowed:=true;
  elsif o.status='OUT_FOR_DELIVERY' and p_status in ('DELIVERED','CANCELLED') then allowed:=true; end if;
  if not allowed then raise exception 'Transição de status inválida: % para %',o.status,p_status; end if;

  if p_status='CANCELLED' and o.stock_reserved and not o.stock_committed then
    for it in select * from public.order_items where order_id=o.id order by product_id loop
      update public.products set reserved_stock=greatest(0,reserved_stock-it.quantity),updated_at=now() where id=it.product_id and pharmacy_id=o.pharmacy_id;
    end loop;
    if o.coupon_id is not null and o.coupon_usage_counted then update public.coupons set used_count=greatest(0,used_count-1) where id=o.coupon_id; end if;
    update public.orders set stock_reserved=false,reservation_expires_at=null,coupon_usage_counted=false where id=o.id;
  end if;
  if p_status in ('PAYMENT_APPROVED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED') and o.stock_reserved and not o.stock_committed then
    for it in select * from public.order_items where order_id=o.id order by product_id loop
      select * into p from public.products where id=it.product_id for update;
      if p.stock<it.quantity then raise exception 'Estoque inconsistente para %',p.name; end if;
      update public.products set stock=stock-it.quantity,reserved_stock=greatest(0,reserved_stock-it.quantity),updated_at=now() where id=p.id;
      insert into public.stock_movements(pharmacy_id,product_id,order_id,type,quantity,previous_stock,new_stock,reason,actor_id) values(o.pharmacy_id,p.id,o.id,'OUT',it.quantity,p.stock,p.stock-it.quantity,'Baixa por pedido confirmado',(select auth.uid()));
    end loop;
    update public.orders set stock_committed=true,stock_reserved=false,reservation_expires_at=null where id=o.id;
  end if;
  if p_status='DELIVERED' and o.customer_id is not null and not o.customer_totals_applied then
    select greatest(0,floor(o.subtotal*coalesce(s.loyalty_rate,1)))::integer into earned_points
    from public.pharmacy_settings s where s.pharmacy_id=o.pharmacy_id;
    earned_points:=coalesce(earned_points,greatest(0,floor(o.subtotal))::integer);
    update public.customers set total_spent=total_spent+o.total,orders_count=orders_count+1,
      points=points+earned_points,last_order_at=now(),updated_at=now()
    where id=o.customer_id and pharmacy_id=o.pharmacy_id;
    if earned_points>0 then
      insert into public.loyalty_transactions(pharmacy_id,customer_id,order_id,points,kind,description)
      values(o.pharmacy_id,o.customer_id,o.id,earned_points,'earn','Pontos do pedido entregue');
    end if;
    update public.orders set customer_totals_applied=true where id=o.id;
  end if;
  update public.orders set status=p_status,payment_status=case when p_payment_status in ('PENDING','APPROVED','REJECTED','CANCELLED','REFUNDED') then p_payment_status::public.payment_status else payment_status end,
    payment_confirmed_method=case when p_payment_status='APPROVED' and p_payment_method in ('PIX','Dinheiro','Cartão de débito','Cartão de crédito') then p_payment_method else payment_confirmed_method end,updated_at=now() where id=o.id;
  insert into public.order_status_history(pharmacy_id,order_id,status,actor_id,note) values(o.pharmacy_id,o.id,p_status,(select auth.uid()),p_note);
end; $$;

-- View de estoque baixo deve respeitar as políticas do chamador.
drop view if exists public.low_stock_products;
create view public.low_stock_products with (security_invoker=true) as
select id,pharmacy_id,name,sku,stock,reserved_stock,(stock-reserved_stock) available_stock,min_stock,expiry_date
from public.products where active=true and (stock-reserved_stock)<=min_stock;

create or replace function public.low_stock_secure(p_pharmacy uuid)
returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
  if not public.is_pharmacy_member(p_pharmacy) then raise exception 'Acesso negado'; end if;
  return (select coalesce(jsonb_agg(to_jsonb(v) order by v.available_stock),'[]'::jsonb) from public.low_stock_products v where v.pharmacy_id=p_pharmacy);
end; $$;

-- Privilégios mínimos.
revoke all on function public.public_catalog_products_secure(uuid) from public;
grant execute on function public.public_catalog_products_secure(uuid) to anon,authenticated;
revoke all on function public.staff_products_secure(uuid) from public;
grant execute on function public.staff_products_secure(uuid) to authenticated;
revoke all on function public.upsert_product_secure(uuid,jsonb) from public;
grant execute on function public.upsert_product_secure(uuid,jsonb) to authenticated;
revoke all on function public.delete_product_secure(uuid) from public;
grant execute on function public.delete_product_secure(uuid) to authenticated;
revoke all on function public.expire_stale_order_reservations() from public,anon,authenticated;
revoke all on function public.create_order_secure_v2(uuid,jsonb) from public;
grant execute on function public.create_order_secure_v2(uuid,jsonb) to anon,authenticated;
revoke all on function public.set_order_status_secure_v2(uuid,public.order_status,text,text,text) from public;
grant execute on function public.set_order_status_secure_v2(uuid,public.order_status,text,text,text) to authenticated;
revoke all on function public.low_stock_secure(uuid) from public;
grant execute on function public.low_stock_secure(uuid) to authenticated;

-- O frontend público agora usa RPCs com colunas permitidas; bloqueia leitura direta de produtos.
revoke select on public.products from anon,authenticated;
grant select(id,pharmacy_id,category_id,name,slug,brand,description,price,promo_price,image_url,featured,active) on public.products to anon,authenticated;
revoke all on public.low_stock_products from anon,authenticated;

-- Desativa os RPCs antigos para impedir que as validações V9 sejam contornadas.
revoke all on function public.create_order_secure(uuid,jsonb) from public,anon,authenticated;
revoke all on function public.set_order_status_secure(uuid,public.order_status,text) from public,anon,authenticated;

commit;

-- Recomendado: no Dashboard > Integrations > Cron, agende a cada 5 minutos:
-- select public.expire_stale_order_reservations();
