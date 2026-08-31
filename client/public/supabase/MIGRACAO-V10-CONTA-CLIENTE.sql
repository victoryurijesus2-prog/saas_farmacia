-- Natal Farma V10 — conta do cliente integrada à loja React.
-- Execute depois da MIGRACAO-V9-SEGURANCA-CORRECOES.sql.

begin;

create or replace function public.customer_account_secure()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := (select auth.uid());
  profile_row public.profiles%rowtype;
  customer_row public.customers%rowtype;
  account jsonb;
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  select * into profile_row from public.profiles where id=uid;
  select * into customer_row from public.customers where auth_user_id=uid order by updated_at desc limit 1;

  select jsonb_build_object(
    'profile',jsonb_build_object(
      'full_name',coalesce(profile_row.full_name,''),
      'phone',coalesce(profile_row.phone,''),
      'email',coalesce((select email from auth.users where id=uid),'')
    ),
    'customer',case when customer_row.id is null then null else
      to_jsonb(customer_row)||jsonb_build_object(
        'address',coalesce((select concat_ws(', ',a.street,nullif(a.number,''),nullif(a.neighborhood,''),nullif(a.city,'')) from public.customer_addresses a where a.customer_id=customer_row.id order by a.is_default desc,a.created_at limit 1),'')
      ) end,
    'orders',coalesce((
      select jsonb_agg(to_jsonb(o)||jsonb_build_object(
        'order_items',coalesce((select jsonb_agg(to_jsonb(i)) from public.order_items i where i.order_id=o.id),'[]'::jsonb),
        'order_status_history',coalesce((select jsonb_agg(to_jsonb(h) order by h.created_at) from public.order_status_history h where h.order_id=o.id),'[]'::jsonb)
      ) order by o.created_at desc)
      from public.orders o where o.customer_id=customer_row.id
    ),'[]'::jsonb)
  ) into account;
  return account;
end;
$$;

create or replace function public.update_customer_profile_secure(p_name text,p_phone text,p_email text default null,p_address text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := (select auth.uid());
  clean_phone text := regexp_replace(coalesce(p_phone,''),'\D','','g');
  customer_row public.customers%rowtype;
  address_id uuid;
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  if length(trim(coalesce(p_name,'')))<2 then raise exception 'Nome inválido'; end if;
  if length(clean_phone)<10 or length(clean_phone)>13 then raise exception 'WhatsApp inválido'; end if;

  update public.profiles set full_name=trim(p_name),phone=clean_phone,updated_at=now() where id=uid;
  select * into customer_row from public.customers where auth_user_id=uid order by updated_at desc limit 1 for update;
  if customer_row.id is not null then
    update public.customers set name=trim(p_name),phone=clean_phone,
      email=coalesce((select email from auth.users where id=uid),email),updated_at=now()
    where id=customer_row.id;
    if nullif(trim(coalesce(p_address,'')),'') is not null then
      select id into address_id from public.customer_addresses where customer_id=customer_row.id order by is_default desc,created_at limit 1 for update;
      if address_id is null then
        insert into public.customer_addresses(pharmacy_id,customer_id,label,street,is_default)
        values(customer_row.pharmacy_id,customer_row.id,'Principal',trim(p_address),true);
      else
        update public.customer_addresses set street=trim(p_address),is_default=true where id=address_id and customer_id=customer_row.id;
      end if;
    end if;
  end if;
  return public.customer_account_secure();
end;
$$;

revoke all on function public.customer_account_secure() from public,anon,authenticated;
grant execute on function public.customer_account_secure() to authenticated;
revoke all on function public.update_customer_profile_secure(text,text,text,text) from public,anon,authenticated;
grant execute on function public.update_customer_profile_secure(text,text,text,text) to authenticated;

commit;
