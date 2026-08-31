-- V11 — reparo do acesso administrativo existente.
-- Execute depois das migrações V9 e V10.
-- Não cria usuário e não redefine senha.

begin;

-- Usuários antigos do Auth podem ter sido criados antes do gatilho de perfis.
insert into public.profiles(id,full_name,phone,platform_role)
select
  u.id,
  coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),split_part(u.email,'@',1)),
  nullif(regexp_replace(coalesce(u.raw_user_meta_data->>'phone',''),'\D','','g'),''),
  'CUSTOMER'::public.app_role
from auth.users u
where not exists(select 1 from public.profiles p where p.id=u.id);

-- Recupera o OWNER somente quando o e-mail do usuário é exatamente o e-mail
-- cadastrado na própria farmácia. Isso evita promover clientes por engano.
insert into public.pharmacy_members(pharmacy_id,user_id,role,active)
select ph.id,u.id,'OWNER'::public.app_role,true
from public.pharmacies ph
join auth.users u on lower(u.email)=lower(ph.email)
where nullif(trim(ph.email),'') is not null
on conflict(pharmacy_id,user_id) do update set active=true;

-- A permissão de tabela é necessária antes da RLS poder liberar a linha correta.
grant select on public.profiles to authenticated;
grant select on public.pharmacy_members to authenticated;
grant select on public.pharmacies to anon,authenticated;

commit;

-- Conferência: o resultado precisa mostrar role OWNER/ADMIN/MANAGER e active=true.
select
  u.email,
  p.platform_role,
  ph.name as farmacia,
  m.role,
  m.active
from auth.users u
left join public.profiles p on p.id=u.id
left join public.pharmacy_members m on m.user_id=u.id
left join public.pharmacies ph on ph.id=m.pharmacy_id
order by u.email;
