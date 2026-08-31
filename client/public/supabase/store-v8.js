/* Adaptador de compatibilidade: mantém a UI V8 e troca os dados de negócio para Supabase.
   O carrinho continua local de propósito; catálogo/pedidos/admin ficam no banco quando enabled=true. */
(function(w){
  'use strict';
  var cfg=w.NF_SUPABASE||{}, legacy=w.NFStore;
  if(!cfg.enabled){ if(legacy && !legacy.ready) legacy.ready=function(){return Promise.resolve(true);}; return; }

  var DB=w.NFSupabaseV8;
  var cache={products:[],orders:[],customers:[],coupons:[],zones:[],banners:[],settings:{},info:{},user:null};
  var readyPromise=null;
  var cartKey='nf_v8_cart';
  var clone=function(x){return JSON.parse(JSON.stringify(x==null?null:x));};
  var sid=function(a,b){return String(a)==String(b);};
  var statusToUi={PENDING:'Pedido recebido',AWAITING_PAYMENT:'Aguardando pagamento',PAYMENT_APPROVED:'Pagamento confirmado',PREPARING:'Em separação',READY:'Pronto',OUT_FOR_DELIVERY:'Saiu para entrega',DELIVERED:'Concluído',CANCELLED:'Cancelado'};
  var statusToDb={'Pedido recebido':'PENDING','Aguardando pagamento':'AWAITING_PAYMENT','Pagamento confirmado':'PAYMENT_APPROVED','Em separação':'PREPARING','Pronto':'READY','Saiu para entrega':'OUT_FOR_DELIVERY','Concluído':'DELIVERED','Cancelado':'CANCELLED'};

  function product(p){return {id:p.id,name:p.name,brand:p.brand||'',category:p.categories&&p.categories.name||'',categoryId:p.category_id||null,price:Number(p.price||0),promo:p.promo_price==null?null:Number(p.promo_price),cost:Number(p.cost||0),stock:Number(p.stock||0)-Number(p.reserved_stock||0),rawStock:Number(p.stock||0),reservedStock:Number(p.reserved_stock||0),minStock:Number(p.min_stock||0),expiry:p.expiry_date||'',desc:p.description||'',image:p.image_url||'',featured:!!p.featured,active:p.active!==false,sku:p.sku||'',barcode:p.barcode||'',slug:p.slug||''};}
  function coupon(c){return {id:c.id,code:c.code,type:c.type,value:Number(c.value||0),minTotal:Number(c.min_total||0),startsAt:c.starts_at,endsAt:c.ends_at,maxUses:c.max_uses,usedCount:Number(c.used_count||0),perUser:c.per_customer,active:c.active!==false};}
  function zone(z){return {id:z.id,name:z.name,fee:Number(z.fee||0),minOrder:Number(z.min_order||0),active:z.active!==false,sortOrder:Number(z.sort_order||0)};}
  function banner(b){return {id:b.id,title:b.title||'',subtitle:b.subtitle||'',lead:b.subtitle||'',button:b.button_text||'',link:b.button_url||'',image:b.image_url||'',active:b.active!==false,sortOrder:Number(b.sort_order||0)};}
  function order(o){
    return {id:o.id,number:'NF-'+String(o.order_number||'').padStart(6,'0'),createdAt:o.created_at,status:statusToUi[o.status]||o.status,paymentStatus:o.payment_status==='APPROVED'?'Pago':(o.payment_status==='REJECTED'?'Não pago':'Pendente'),paymentRequested:o.payment_method||'',paymentConfirmed:o.payment_status==='APPROVED'?(o.payment_confirmed_method||o.payment_method||''):null,deliveryMode:o.delivery_mode==='pickup'?'retirada':'entrega',zone:'',zoneId:o.delivery_zone_id||'',deliveryFee:Number(o.delivery_fee||0),subtotal:Number(o.subtotal||0),discount:Number(o.discount||0),total:Number(o.total||0),customer:{id:o.customer_id||'',name:o.customer_name||'',phone:o.customer_phone||'',email:o.customer_email||'',address:formatAddress(o.address_snapshot)},items:(o.order_items||[]).map(function(i){return {id:i.product_id,name:i.product_name,price:Number(i.unit_price||0),cost:Number(i.unit_cost||0),qty:Number(i.quantity||0)};}),statusHistory:(o.order_status_history||[]).sort(function(a,b){return new Date(a.created_at)-new Date(b.created_at);}).map(function(h){return {status:statusToUi[h.status]||h.status,at:h.created_at,by:'Sistema',note:h.note||''};})};
  }
  function customer(c){return {id:c.id,name:c.name||'',phone:c.phone||'',email:c.email||'',address:'',points:Number(c.points||0),ordersCount:Number(c.orders_count||0),totalSpent:Number(c.total_spent||0),profile:c.profile||'',authUserId:c.auth_user_id||null};}
  function formatAddress(a){ if(!a)return ''; if(typeof a==='string')return a; if(a.formatted)return String(a.formatted); return [a.street,a.number,a.complement,a.neighborhood,a.city,a.state,a.zip_code,a.reference].filter(Boolean).join(', '); }
  function settings(s){s=s||{};return {whatsapp:s.whatsapp||'',supportPhone:s.support_phone||'',hours:s.hours||{},freeDeliveryMin:Number(s.free_delivery_min||0),loyaltyRate:Number(s.loyalty_rate||1),loyaltyRedeemPoints:Number(s.loyalty_redeem_points||500),loyaltyRedeemValue:Number(s.loyalty_redeem_value||20),pixEnabled:!!s.pix_enabled,cardEnabled:!!s.card_enabled,pickupEnabled:s.pickup_enabled!==false,topNotice:(s.hours&&s.hours.topNotice)||''};}
  function info(ph,s){ph=ph||{};s=s||{};var a=ph.address||{};return {name:ph.name||'Farmácia',slogan:(s.hours&&s.hours.slogan)||'',logo:ph.logo_url||'',whatsapp:s.whatsapp||ph.phone||'',instagram:(s.hours&&s.hours.instagram)||'',address:typeof a==='string'?a:formatAddress(a),hoursWeek:(s.hours&&s.hours.hoursWeek)||'',hoursSunday:(s.hours&&s.hours.hoursSunday)||''};}

  async function hydrate(){
    if(readyPromise)return readyPromise;
    readyPromise=(async function(){
      DB.init();
      var ph=await DB.resolvePharmacy(), pid=ph.id;
      var vals=await Promise.all([DB.products(pid,{includeInactive:true}),DB.settings(pid),DB.banners(pid,true),DB.coupons(pid,true),DB.deliveryZones(pid,true),DB.currentUser()]);
      cache.products=vals[0].map(product); cache.settings=settings(vals[1]); cache.info=info(ph,vals[1]); cache.banners=vals[2].map(banner); cache.coupons=vals[3].map(coupon); cache.zones=vals[4].map(zone); cache.user=vals[5];
      if(cache.user){
        var more=await Promise.all([DB.orders(pid,300),DB.customers(pid)]);
        cache.orders=more[0].map(order); cache.customers=more[1].map(customer);
      }
      return true;
    })().catch(function(e){readyPromise=null; console.error('Falha ao carregar Supabase:',e); throw e;});
    return readyPromise;
  }
  async function reloadPrivate(){var pid=(await DB.resolvePharmacy()).id; var a=await Promise.all([DB.orders(pid,300),DB.customers(pid),DB.products(pid,{includeInactive:true})]); cache.orders=a[0].map(order);cache.customers=a[1].map(customer);cache.products=a[2].map(product);}
  function asyncError(p){p.catch(function(e){console.error(e); if(w.dispatchEvent)w.dispatchEvent(new CustomEvent('nf:data-error',{detail:{message:e.message||String(e)}}));});}

  var api={
    K: legacy&&legacy.K||{}, mode:'supabase', ready:hydrate,
    getProducts:function(){return clone(cache.products)||[];}, getOrders:function(){return clone(cache.orders)||[];},getCustomers:function(){return clone(cache.customers)||[];},getCoupons:function(){return clone(cache.coupons)||[];},getZones:function(){return clone(cache.zones)||[];},getBanners:function(){return clone(cache.banners)||[];},getSettings:function(){return clone(cache.settings)||{};},getInfo:function(){return clone(cache.info)||{};},
    getCart:function(){try{return JSON.parse(localStorage.getItem(cartKey)||'[]');}catch(e){return[];}}, saveCart:function(v){localStorage.setItem(cartKey,JSON.stringify(v||[]));},
    currentUser:function(){return cache.user;},
    login:async function(e,p){
      try{
        var r=await DB.signIn(e,p);
        if(r.ok){
          cache.user=r.user;
          try{await reloadPrivate();}catch(loadError){console.error('Login realizado, mas os dados privados não carregaram:',loadError);r.warning=loadError.message||String(loadError);}
        }
        return r;
      }catch(e){return {ok:false,error:e.message||'Falha inesperada ao entrar.'};}
    },
    logout:function(){cache.user=null;cache.orders=[];cache.customers=[];return DB.signOut();},
    registerCustomer:async function(d){if(String(d.password||'').length<8)return{ok:false,error:'A senha deve ter ao menos 8 caracteres.'};var r=await DB.signUpCustomer(d);if(r.ok){cache.user=await DB.currentUser();}return r;},
    resetPassword:function(email,redirect){return DB.resetPassword(email,redirect);},
    findCustomerByPhone:function(phone){var n=String(phone||'').replace(/\D/g,'');return cache.customers.find(function(c){return String(c.phone||'').replace(/\D/g,'')===n;})||null;},
    nextId:function(){return (w.crypto&&crypto.randomUUID)?crypto.randomUUID():(Date.now()+'-'+Math.random().toString(36).slice(2));}, nextOrderNumber:function(){return '';},
    couponState:function(c){var now=new Date();if(c.active===false)return{ok:false,msg:'Este cupom está inativo.'};if(c.startsAt&&new Date(c.startsAt)>now)return{ok:false,msg:'Este cupom ainda não começou.'};if(c.endsAt&&new Date(c.endsAt)<now)return{ok:false,msg:'Este cupom expirou.'};if(Number(c.maxUses||0)>0&&Number(c.usedCount||0)>=Number(c.maxUses))return{ok:false,msg:'Este cupom atingiu o limite de utilizações.'};return{ok:true,msg:''};},
    validateCoupon:function(code,subtotal){var c=cache.coupons.find(function(x){return String(x.code).toUpperCase()===String(code).trim().toUpperCase();});if(!c)return{ok:false,error:'Cupom não encontrado.'};var st=this.couponState(c);if(!st.ok)return{ok:false,error:st.msg};if(subtotal<Number(c.minTotal||0))return{ok:false,error:'Compra mínima não atingida para este cupom.'};var d=c.type==='percent'?subtotal*Number(c.value)/100:Number(c.value);return{ok:true,coupon:c,discount:Math.min(d,subtotal)};},
    bestActiveCoupon:function(){var self=this;return cache.coupons.filter(function(c){return self.couponState(c).ok;}).sort(function(a,b){return new Date(a.endsAt||'9999-12-31')-new Date(b.endsAt||'9999-12-31');})[0]||null;},
    createOrder:async function(p){
      var pid=(await DB.resolvePharmacy()).id, mode=p.deliveryMode==='retirada'?'pickup':'delivery';
      var payload={name:p.customer.name,phone:p.customer.phone,email:p.customer.email||'',delivery_mode:mode,delivery_zone_id:mode==='delivery'?p.zoneId:null,coupon_code:p.couponCode||'',payment_method:p.paymentRequested||'PIX',address:mode==='delivery'?{formatted:p.customer.address,street:p.customer.address}: {},items:(p.items||[]).map(function(i){return{id:String(i.id),qty:Number(i.qty||1)};})};
      var r=await DB.createOrder(pid,payload);if(!r.ok)return r;var mapped=order(r.receipt);cache.orders.unshift(mapped);if(cache.user)await reloadPrivate();return{ok:true,order:mapped};
    },
    updateOrderStatus:async function(id,status,extra){extra=extra||{};var dbs=statusToDb[status]||status;var pay=extra.paymentStatus==='Pago'?'APPROVED':(extra.paymentStatus==='Não pago'?'REJECTED':null);if(pay==='APPROVED'&&(dbs==='PENDING'||dbs==='AWAITING_PAYMENT'))dbs='PAYMENT_APPROVED';var r=await DB.setOrderStatus(id,dbs,extra.cancelReason||extra.by||null,pay,extra.paymentConfirmed||null);if(!r.ok)return r;var wa=await DB.notifyOrderStatusWhatsApp(id,dbs);await reloadPrivate();return {ok:true,whatsapp:wa};},
    saveProducts:async function(v){cache.products=clone(v)||[];var pid=(await DB.resolvePharmacy()).id;var before=await DB.products(pid,{includeInactive:true});var keep={};for(var i=0;i<v.length;i++){var rr=await DB.upsertProduct(pid,v[i]);if(!rr.ok)throw new Error(rr.error);keep[String(rr.data.id)]=true;}for(var j=0;j<before.length;j++){if(!keep[String(before[j].id)]){var dr=await DB.deleteProduct(before[j].id);if(!dr.ok)throw new Error(dr.error);}}var latest=await DB.products(pid,{includeInactive:true});cache.products=latest.map(product);return {ok:true};},
    saveCoupons:function(v){cache.coupons=clone(v)||[];asyncError((async function(){var pid=(await DB.resolvePharmacy()).id;for(var i=0;i<v.length;i++){var r=await DB.upsertCoupon(pid,v[i]);if(!r.ok)throw new Error(r.error);}cache.coupons=(await DB.coupons(pid,true)).map(coupon);})());},
    saveZones:function(v){cache.zones=clone(v)||[];asyncError((async function(){var pid=(await DB.resolvePharmacy()).id;for(var i=0;i<v.length;i++){var r=await DB.upsertZone(pid,v[i]);if(!r.ok)throw new Error(r.error);}cache.zones=(await DB.deliveryZones(pid,true)).map(zone);})());},
    saveBanners:function(v){cache.banners=clone(v)||[];asyncError((async function(){var pid=(await DB.resolvePharmacy()).id;for(var i=0;i<v.length;i++){var r=await DB.upsertBanner(pid,v[i]);if(!r.ok)throw new Error(r.error);}cache.banners=(await DB.banners(pid,true)).map(banner);})());},
    saveSettings:function(v){cache.settings=clone(v)||{};asyncError((async function(){var pid=(await DB.resolvePharmacy()).id;var hours=Object.assign({},cache.settings.hours||{},{topNotice:v.topNotice||'',slogan:cache.info.slogan||'',instagram:cache.info.instagram||'',hoursWeek:cache.info.hoursWeek||'',hoursSunday:cache.info.hoursSunday||''});var r=await DB.saveSettings(pid,Object.assign({},v,{hours:hours,whatsapp:cache.info.whatsapp||v.whatsapp}));if(!r.ok)throw new Error(r.error);cache.settings=settings(r.data);})());},
    saveInfo:function(v){cache.info=Object.assign({},cache.info,v||{});asyncError((async function(){var pid=(await DB.resolvePharmacy()).id;var address={formatted:cache.info.address||''};var r=await DB.savePharmacy(pid,{name:cache.info.name,logo:cache.info.logo,phone:cache.info.whatsapp,address:address});if(!r.ok)throw new Error(r.error);var hours=Object.assign({},cache.settings.hours||{},{topNotice:cache.settings.topNotice||'',slogan:cache.info.slogan||'',instagram:cache.info.instagram||'',hoursWeek:cache.info.hoursWeek||'',hoursSunday:cache.info.hoursSunday||''});var sr=await DB.saveSettings(pid,Object.assign({},cache.settings,{whatsapp:cache.info.whatsapp,hours:hours}));if(!sr.ok)throw new Error(sr.error);})());},
    saveCustomers:function(v){cache.customers=clone(v)||[];}, saveOrders:function(v){cache.orders=clone(v)||[];}, saveUsage:function(){}, getUsage:function(){return[];}, getUsers:function(){return[];}, saveUsers:function(){},
    lowStock:function(){return cache.products.filter(function(p){return Number(p.stock)<=Number(p.minStock||0);});},
    expiringSoon:function(days){var max=Date.now()+(days||90)*86400000;return cache.products.filter(function(p){var t=p.expiry?new Date(p.expiry).getTime():0;return t&&t<=max;});},
    salesRanking:function(days){var since=days?Date.now()-days*86400000:0,q={};cache.orders.forEach(function(o){if(o.status!=='Concluído'||(since&&new Date(o.createdAt).getTime()<since))return;o.items.forEach(function(i){var k=String(i.id);if(!q[k])q[k]={id:k,name:i.name||'Produto',qty:0,revenue:0};q[k].qty+=Number(i.qty||0);q[k].revenue+=Number(i.price||0)*Number(i.qty||0);});});return Object.keys(q).map(function(k){return q[k];}).sort(function(a,b){return b.qty-a.qty;});},
    dashboardStats:function(){var os=cache.orders,self=this,today=new Date().toISOString().slice(0,10);var todays=os.filter(function(o){return String(o.createdAt).slice(0,10)===today;});var done=os.filter(function(o){return o.status==='Concluído';});var revenue=Math.round(done.reduce(function(s,o){return s+Number(o.total||0);},0)*100)/100;var itemsSold=done.reduce(function(s,o){return s+(o.items||[]).reduce(function(a,i){return a+Number(i.qty||0);},0);},0);var pend=['Pedido recebido','Aguardando pagamento','Pagamento confirmado','Em separação','Pronto','Saiu para entrega'];return{ordersToday:todays.length,revenue:revenue,ticket:done.length?revenue/done.length:0,itemsSold:itemsSold,pending:os.filter(function(o){return pend.indexOf(o.status)>=0;}).length,activeCoupons:cache.coupons.filter(function(c){return self.couponState(c).ok;}).length,customers:cache.customers.length,lowStock:self.lowStock().length};},
    salesByDay:function(days){days=days||7;var out=[];for(var i=days-1;i>=0;i--){var d=new Date(Date.now()-i*86400000);var key=d.toISOString().slice(0,10);var label=d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});var value=cache.orders.filter(function(o){return o.status==='Concluído'&&String(o.createdAt).slice(0,10)===key;}).reduce(function(s,o){return s+Number(o.total||0);},0);out.push({label:label,value:Math.round(value*100)/100});}return out;},
    resetDemo:function(){throw new Error('Reset de demonstração desativado em produção.');}
  };
  w.NFStore=api;
})(window);
