-- Execute DEPOIS de criar seu primeiro usuário administrador em Authentication > Users.
-- Troque somente os valores entre <...> antes de rodar.
-- Este arquivo cria a primeira farmácia, configurações e vincula o usuário como OWNER.

do $$
declare
  v_user uuid;
  v_pharmacy uuid;
begin
  select id into v_user from auth.users where lower(email)=lower('<SEU_EMAIL_ADMIN>') limit 1;
  if v_user is null then
    raise exception 'Crie primeiro o usuário <SEU_EMAIL_ADMIN> em Authentication > Users';
  end if;

  insert into public.pharmacies(name,slug,email,phone,status,plan)
  values('<NOME_DA_FARMACIA>','natal-farma','<SEU_EMAIL_ADMIN>','<WHATSAPP>','active','pilot')
  on conflict(slug) do update set name=excluded.name,email=excluded.email,phone=excluded.phone,status='active'
  returning id into v_pharmacy;

  insert into public.pharmacy_members(pharmacy_id,user_id,role,active)
  values(v_pharmacy,v_user,'OWNER',true)
  on conflict(pharmacy_id,user_id) do update set role='OWNER',active=true;

  insert into public.pharmacy_settings(pharmacy_id,whatsapp,pix_enabled,card_enabled,pickup_enabled)
  values(v_pharmacy,'<WHATSAPP>',false,false,true)
  on conflict(pharmacy_id) do nothing;

  insert into public.categories(pharmacy_id,name,slug,sort_order) values
    (v_pharmacy,'Medicamentos','medicamentos',10),
    (v_pharmacy,'Vitaminas e Suplementos','vitaminas-e-suplementos',20),
    (v_pharmacy,'Higiene','higiene',30),
    (v_pharmacy,'Dermocosméticos','dermocosmeticos',40),
    (v_pharmacy,'Beleza e Cuidados Pessoais','beleza-e-cuidados-pessoais',50),
    (v_pharmacy,'Bebê e Infantil','bebe-e-infantil',60),
    (v_pharmacy,'Primeiros Socorros','primeiros-socorros',70)
  on conflict(pharmacy_id,slug) do nothing;

  raise notice 'Farmácia criada: %', v_pharmacy;
end $$;
