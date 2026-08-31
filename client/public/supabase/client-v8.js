/* Natal Farma V8 — cliente Supabase de produção.
   Requer config.js + @supabase/supabase-js. Nunca use service_role no navegador. */
(function (w) {
  'use strict';
  var cfg = w.NF_SUPABASE || {};
  var api = { enabled:false, client:null, pharmacy:null };

  function clean(v){ return String(v == null ? '' : v).trim(); }
  function need(){ if(!api.client) throw new Error('Supabase não configurado.'); return api.client; }
  function role(r){ r=String(r||'').toUpperCase(); return r==='EMPLOYEE'?'employee':['OWNER','ADMIN','MANAGER','SUPER_ADMIN'].indexOf(r)>=0?'admin':'customer'; }
  function slugify(s){ return clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
  function fail(r){ if(r && r.error) throw r.error; return r && r.data; }

  async function accessContext(c,u){
    var rows=await Promise.all([
      c.from('profiles').select('id,full_name,phone,platform_role').eq('id',u.id).maybeSingle(),
      c.from('pharmacy_members').select('pharmacy_id,role,active,pharmacies(id,name,slug,status)').eq('user_id',u.id).eq('active',true).limit(1).maybeSingle()
    ]);
    var p=rows[0],m=rows[1];
    if(p.error && m.error) throw new Error('Não foi possível consultar o perfil e as permissões deste usuário. Confira a migração e as políticas RLS.');
    var raw=m.data&&m.data.role?m.data.role:(p.data&&p.data.platform_role)||'CUSTOMER';
    return {id:u.id,name:p.data&&p.data.full_name||u.user_metadata&&u.user_metadata.full_name||u.email,email:u.email,phone:p.data&&p.data.phone||u.user_metadata&&u.user_metadata.phone||'',role:role(raw),rawRole:raw,pharmacyId:m.data&&m.data.pharmacy_id||null,pharmacy:m.data&&m.data.pharmacies||null};
  }

  api.init=function(){
    if(!cfg.enabled) return false;
    if(!w.supabase || !w.supabase.createClient) throw new Error('supabase-js não foi carregado.');
    if(!cfg.url || !cfg.anonKey || /SEU-PROJETO|SUA_ANON_KEY/.test(cfg.url+cfg.anonKey)) throw new Error('Configure URL e anonKey em supabase/config.js.');
    api.client=w.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    api.enabled=true; return true;
  };

  api.resolvePharmacy=async function(){
    if(api.pharmacy) return api.pharmacy;
    var q=need().from('pharmacies').select('id,name,slug,logo_url,email,phone,address,status,plan');
    if(cfg.defaultPharmacyId) q=q.eq('id',cfg.defaultPharmacyId); else q=q.eq('slug',cfg.defaultPharmacySlug||'natal-farma');
    var r=await q.in('status',['trial','active']).limit(1).maybeSingle();
    if(r.error) throw r.error;
    if(!r.data) throw new Error('Farmácia não encontrada. Confira defaultPharmacySlug/defaultPharmacyId.');
    api.pharmacy=r.data; return r.data;
  };
  api.pharmacyId=async function(){ return (await api.resolvePharmacy()).id; };

  api.signIn=async function(email,password){
    var c=need(), r=await c.auth.signInWithPassword({email:clean(email).toLowerCase(),password:password});
    if(r.error) return {ok:false,error:r.error.message};
    try { return {ok:true,user:await accessContext(c,r.data.user)}; }
    catch(e){ await c.auth.signOut(); return {ok:false,error:e.message||'Não foi possível consultar as permissões do usuário.'}; }
  };
  api.currentUser=async function(){
    var c=need(),r=await c.auth.getUser(); if(r.error||!r.data.user) return null;
    return accessContext(c,r.data.user);
  };
  api.signUpCustomer=async function(data){
    var r=await need().auth.signUp({email:clean(data.email).toLowerCase(),password:data.password,options:{data:{full_name:clean(data.name),phone:clean(data.phone).replace(/\D/g,'')}}});
    if(r.error) return {ok:false,error:r.error.message}; return {ok:true,user:r.data.user,needsEmailConfirmation:!r.data.session};
  };
  api.signOut=async function(){ var r=await need().auth.signOut(); return {ok:!r.error,error:r.error&&r.error.message}; };
  api.resetPassword=async function(email,redirectTo){ var r=await need().auth.resetPasswordForEmail(clean(email).toLowerCase(),redirectTo?{redirectTo:redirectTo}:undefined); return {ok:!r.error,error:r.error&&r.error.message}; };

  api.products=async function(pid,opts){
    opts=opts||{}; pid=pid||await api.pharmacyId();
    var session=await need().auth.getSession(), rpcName=session.data.session&&opts.includeInactive?'staff_products_secure':'public_catalog_products_secure';
    var r=await need().rpc(rpcName,{p_pharmacy:pid});
    if(r.error&&rpcName==='staff_products_secure')r=await need().rpc('public_catalog_products_secure',{p_pharmacy:pid});
    if(r.error&&r.error.code==='PGRST202')r=await need().from('products').select('*,categories(name)').eq('pharmacy_id',pid).order('name');
    if(r.error)throw r.error;
    var rows=Array.isArray(r.data)?r.data:[];
    if(opts.search){var term=clean(opts.search).toLocaleLowerCase('pt-BR');rows=rows.filter(function(p){return String(p.name||'').toLocaleLowerCase('pt-BR').indexOf(term)>=0;});}
    return rows;
  };
  api.categories=async function(pid){ pid=pid||await api.pharmacyId(); return fail(await need().from('categories').select('*').eq('pharmacy_id',pid).order('sort_order').order('name')); };
  api.settings=async function(pid){ pid=pid||await api.pharmacyId(); return fail(await need().from('pharmacy_settings').select('*').eq('pharmacy_id',pid).maybeSingle()); };
  api.banners=async function(pid,all){ pid=pid||await api.pharmacyId(); var q=need().from('banners').select('*').eq('pharmacy_id',pid); if(!all) q=q.eq('active',true); return fail(await q.order('sort_order').order('created_at')); };
  api.coupons=async function(pid,all){ pid=pid||await api.pharmacyId(); var q=need().from('coupons').select('*').eq('pharmacy_id',pid); if(!all)q=q.eq('active',true); return fail(await q.order('created_at',{ascending:false})); };
  api.deliveryZones=async function(pid,all){ pid=pid||await api.pharmacyId(); var q=need().from('delivery_zones').select('*').eq('pharmacy_id',pid); if(!all)q=q.eq('active',true); return fail(await q.order('sort_order').order('name')); };
  api.orders=async function(pid,limit){ pid=pid||await api.pharmacyId(); return fail(await need().from('orders').select('*,order_items(*),order_status_history(*)').eq('pharmacy_id',pid).order('created_at',{ascending:false}).limit(limit||250)); };
  api.customers=async function(pid){ pid=pid||await api.pharmacyId(); return fail(await need().from('customers').select('*').eq('pharmacy_id',pid).order('last_order_at',{ascending:false,nullsFirst:false})); };
  api.lowStock=async function(pid){ pid=pid||await api.pharmacyId(); var r=await need().rpc('low_stock_secure',{p_pharmacy:pid}); if(r.error&&r.error.code==='PGRST202'){var d=await need().from('products').select('id,pharmacy_id,name,sku,stock,reserved_stock,min_stock,expiry_date').eq('pharmacy_id',pid).eq('active',true);if(d.error)throw d.error;return(d.data||[]).filter(function(p){p.available_stock=Number(p.stock)-Number(p.reserved_stock||0);return p.available_stock<=Number(p.min_stock||0);});}if(r.error)throw r.error; return r.data||[]; };

  api.createOrder=async function(pid,payload){ pid=pid||await api.pharmacyId(); var r=await need().rpc('create_order_secure_v2',{p_pharmacy:pid,p_payload:payload}); if(r.error&&r.error.code==='PGRST202'){var old=await need().rpc('create_order_secure',{p_pharmacy:pid,payload:payload});if(old.error)return{ok:false,error:old.error.message};return{ok:true,receipt:{id:old.data},orderId:old.data};}if(r.error)return {ok:false,error:r.error.message}; return {ok:true,receipt:r.data,orderId:r.data&&r.data.id}; };
  api.orderById=async function(id){ var r=await need().from('orders').select('*,order_items(*),order_status_history(*)').eq('id',id).single(); if(r.error)return {ok:false,error:r.error.message}; return {ok:true,order:r.data}; };
  api.setOrderStatus=async function(id,status,note,paymentStatus,paymentMethod){ var r=await need().rpc('set_order_status_secure_v2',{p_order:id,p_status:status,p_note:note||null,p_payment_status:paymentStatus||null,p_payment_method:paymentMethod||null});if(r.error&&r.error.code==='PGRST202')r=await need().rpc('set_order_status_secure',{p_order:id,p_status:status,p_note:note||null}); return {ok:!r.error,error:r.error&&r.error.message}; };
  api.notifyOrderStatusWhatsApp=async function(id,status){ if(cfg.whatsappStatusNotifications===false)return {ok:true,skipped:true,reason:'disabled'}; try{ var r=await need().functions.invoke('order-whatsapp',{body:{order_id:id,status:status}}); if(r.error)return {ok:false,error:r.error.message||String(r.error)}; return Object.assign({ok:true},r.data||{}); }catch(e){ return {ok:false,error:e.message||String(e)}; } };

  api.upsertProduct=async function(pid,p){ pid=pid||await api.pharmacyId(); var payload={id:p.id||null,category_id:p.category_id||p.categoryId||null,category:p.category||null,name:clean(p.name),slug:p.slug||slugify(p.name),brand:p.brand||null,sku:p.sku||null,barcode:p.barcode||null,description:p.description||p.desc||'',price:Number(p.price||0),promo_price:p.promo_price!=null?p.promo_price:(p.promo!=null?Number(p.promo):null),cost:Number(p.cost||0),stock:Number(p.rawStock!=null?p.rawStock:(p.stock||0)),min_stock:Number(p.min_stock!=null?p.min_stock:(p.minStock||0)),expiry_date:p.expiry_date||p.expiry||null,image_url:p.image_url||p.image||null,featured:!!p.featured,active:p.active!==false}; var r=await need().rpc('upsert_product_secure',{p_pharmacy:pid,p_payload:payload});if(r.error&&r.error.code==='PGRST202'){var row={pharmacy_id:pid,category_id:payload.category_id,name:payload.name,slug:payload.slug,brand:payload.brand,sku:payload.sku,barcode:payload.barcode,description:payload.description,price:payload.price,promo_price:payload.promo_price,cost:payload.cost,stock:payload.stock,min_stock:payload.min_stock,expiry_date:payload.expiry_date,image_url:payload.image_url,featured:payload.featured,active:payload.active};if(payload.id)row.id=payload.id;r=await need().from('products').upsert(row).select().single();} return {ok:!r.error,data:r.data,error:r.error&&r.error.message}; };
  api.deleteProduct=async function(id){ var r=await need().rpc('delete_product_secure',{p_product:id});if(r.error&&r.error.code==='PGRST202')r=await need().from('products').delete().eq('id',id); return {ok:!r.error,error:r.error&&r.error.message}; };
  api.upsertCoupon=async function(pid,c){ pid=pid||await api.pharmacyId(); var row={pharmacy_id:pid,code:clean(c.code).toUpperCase(),type:c.type,value:Number(c.value||0),min_total:Number(c.min_total!=null?c.min_total:(c.minTotal||0)),starts_at:c.starts_at||c.startsAt||null,ends_at:c.ends_at||c.endsAt||null,max_uses:c.max_uses!=null?c.max_uses:(c.maxUses||null),per_customer:c.per_customer!=null?c.per_customer:(c.perUser||null),active:c.active!==false}; if(c.id)row.id=c.id; var r=await need().from('coupons').upsert(row).select().single(); return {ok:!r.error,data:r.data,error:r.error&&r.error.message}; };
  api.upsertZone=async function(pid,z){ pid=pid||await api.pharmacyId(); var row={pharmacy_id:pid,name:clean(z.name),fee:Number(z.fee||0),min_order:Number(z.min_order!=null?z.min_order:(z.minOrder||0)),active:z.active!==false,sort_order:Number(z.sort_order||z.sortOrder||0)}; if(z.id)row.id=z.id; var r=await need().from('delivery_zones').upsert(row).select().single(); return {ok:!r.error,data:r.data,error:r.error&&r.error.message}; };
  api.upsertBanner=async function(pid,b){ pid=pid||await api.pharmacyId(); var row={pharmacy_id:pid,title:b.title||'',subtitle:b.subtitle||b.lead||'',button_text:b.button_text||b.button||'',button_url:b.button_url||b.link||'',image_url:b.image_url||b.image||null,active:b.active!==false,sort_order:Number(b.sort_order||b.sortOrder||0)}; if(b.id)row.id=b.id; var r=await need().from('banners').upsert(row).select().single(); return {ok:!r.error,data:r.data,error:r.error&&r.error.message}; };
  api.saveSettings=async function(pid,s){ pid=pid||await api.pharmacyId(); var row={pharmacy_id:pid,whatsapp:s.whatsapp||null,support_phone:s.support_phone||s.supportPhone||null,hours:s.hours||{},free_delivery_min:Number(s.free_delivery_min!=null?s.free_delivery_min:(s.freeDeliveryMin||0)),loyalty_rate:Number(s.loyalty_rate!=null?s.loyalty_rate:(s.loyaltyRate||1)),loyalty_redeem_points:Number(s.loyalty_redeem_points!=null?s.loyalty_redeem_points:(s.loyaltyRedeemPoints||500)),loyalty_redeem_value:Number(s.loyalty_redeem_value!=null?s.loyalty_redeem_value:(s.loyaltyRedeemValue||20)),pix_enabled:s.pix_enabled!=null?!!s.pix_enabled:!!s.pixEnabled,card_enabled:s.card_enabled!=null?!!s.card_enabled:!!s.cardEnabled,pickup_enabled:s.pickup_enabled!=null?!!s.pickup_enabled:(s.pickupEnabled!==false)}; var r=await need().from('pharmacy_settings').upsert(row).select().single(); return {ok:!r.error,data:r.data,error:r.error&&r.error.message}; };
  api.savePharmacy=async function(pid,p){ pid=pid||await api.pharmacyId(); var row={name:clean(p.name),logo_url:p.logo_url||p.logo||null,phone:p.phone||p.whatsapp||null,address:p.address_json||p.address||{}}; var r=await need().from('pharmacies').update(row).eq('id',pid).select().single(); if(!r.error)api.pharmacy=r.data; return {ok:!r.error,data:r.data,error:r.error&&r.error.message}; };

  api.uploadImage=async function(pid,file,pathPrefix){ pid=pid||await api.pharmacyId(); if(!file) return {ok:false,error:'Arquivo não informado.'}; var ext=(file.name&&file.name.split('.').pop()||'webp').toLowerCase().replace(/[^a-z0-9]/g,''); var path=pid+'/'+(pathPrefix||'products')+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext; var r=await need().storage.from(cfg.storageBucket||'pharmacy-images').upload(path,file,{upsert:false,cacheControl:'3600'}); if(r.error)return {ok:false,error:r.error.message}; var pub=need().storage.from(cfg.storageBucket||'pharmacy-images').getPublicUrl(path); return {ok:true,path:path,url:pub.data.publicUrl}; };

  w.NFSupabaseV8=api;
})(window);
