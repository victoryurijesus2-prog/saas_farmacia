/* Natal Farma V7 — NFStore: camada de dados (modo demonstração local).
   Em produção use Supabase (pasta supabase/). Nenhum dado sensível aqui. */
(function () {
  'use strict';
  var K = {
    products: 'nf_v7_products', settings: 'nf_v7_settings', info: 'nf_v7_info',
    orders: 'nf_v7_orders', customers: 'nf_v7_customers', coupons: 'nf_v7_coupons',
    usage: 'nf_v7_coupon_usage', zones: 'nf_v7_zones', users: 'nf_v7_users',
    banners: 'nf_v7_banners', session: 'nf_v7_session', cart: 'nf_v7_cart',
    orderIdSeq: 'nf_v7_order_id_seq', orderNumberSeq: 'nf_v7_order_number_seq',
    customerSeq: 'nf_v7_customer_seq', userSeq: 'nf_v7_user_seq', usageSeq: 'nf_v7_usage_seq',
    bannerSeq: 'nf_v7_banner_seq', productSeq: 'nf_v7_product_seq', couponSeq: 'nf_v7_coupon_seq', zoneSeq: 'nf_v7_zone_seq'
  };
  var D = window;
  var clone = function (x) { return JSON.parse(JSON.stringify(x)); };
  var read = function (key, fb) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : clone(fb); } catch (e) { return clone(fb); } };
  var write = function (key, v) { localStorage.setItem(key, JSON.stringify(v)); };

  function seed() {
    if (!localStorage.getItem(K.products)) write(K.products, D.PHARMACY_DEFAULT_PRODUCTS);
    if (!localStorage.getItem(K.settings)) write(K.settings, D.PHARMACY_DEFAULT_SETTINGS);
    if (!localStorage.getItem(K.info)) write(K.info, D.PHARMACY_INFO);
    if (!localStorage.getItem(K.coupons)) write(K.coupons, D.PHARMACY_DEFAULT_COUPONS);
    if (!localStorage.getItem(K.usage)) write(K.usage, D.PHARMACY_DEFAULT_COUPON_USAGE || []);
    if (!localStorage.getItem(K.zones)) write(K.zones, D.PHARMACY_DEFAULT_ZONES);
    if (!localStorage.getItem(K.users)) write(K.users, D.PHARMACY_DEFAULT_USERS);
    if (!localStorage.getItem(K.banners)) write(K.banners, D.PHARMACY_DEFAULT_BANNERS);
    if (!localStorage.getItem(K.customers)) write(K.customers, D.PHARMACY_DEFAULT_CUSTOMERS);
    if (!localStorage.getItem(K.orders)) write(K.orders, D.PHARMACY_DEFAULT_ORDERS || []);
    function maxId(arr) { return (arr || []).reduce(function (m, x) { return Math.max(m, Number(x.id) || 0); }, 0); }
    if (!localStorage.getItem(K.orderIdSeq)) localStorage.setItem(K.orderIdSeq, String(maxId(D.PHARMACY_DEFAULT_ORDERS)));
    if (!localStorage.getItem(K.orderNumberSeq)) {
      var maxNum = (D.PHARMACY_DEFAULT_ORDERS || []).reduce(function (m, x) { var n = Number(String(x.number || '').replace(/\D/g, '')); return Math.max(m, n || 1000); }, 1000);
      localStorage.setItem(K.orderNumberSeq, String(maxNum));
    }
    if (!localStorage.getItem(K.customerSeq)) localStorage.setItem(K.customerSeq, String(maxId(D.PHARMACY_DEFAULT_CUSTOMERS)));
    if (!localStorage.getItem(K.userSeq)) localStorage.setItem(K.userSeq, String(maxId(D.PHARMACY_DEFAULT_USERS)));
    if (!localStorage.getItem(K.bannerSeq)) localStorage.setItem(K.bannerSeq, String(maxId(D.PHARMACY_DEFAULT_BANNERS)));
    if (!localStorage.getItem(K.productSeq)) localStorage.setItem(K.productSeq, String(maxId(D.PHARMACY_DEFAULT_PRODUCTS)));
    if (!localStorage.getItem(K.couponSeq)) localStorage.setItem(K.couponSeq, String(maxId(D.PHARMACY_DEFAULT_COUPONS)));
    if (!localStorage.getItem(K.zoneSeq)) localStorage.setItem(K.zoneSeq, String(maxId(D.PHARMACY_DEFAULT_ZONES)));
    if (!localStorage.getItem(K.usageSeq)) localStorage.setItem(K.usageSeq, String(maxId(D.PHARMACY_DEFAULT_COUPON_USAGE)));
  }
  seed();

  var api = {
    K: K,
    getProducts: function () { return read(K.products, []); },
    saveProducts: function (v) { write(K.products, v); },
    getSettings: function () { return Object.assign({}, D.PHARMACY_DEFAULT_SETTINGS || {}, read(K.settings, {})); },
    saveSettings: function (v) { write(K.settings, v); },
    getInfo: function () { return Object.assign({}, D.PHARMACY_INFO || {}, read(K.info, {})); },
    saveInfo: function (v) { write(K.info, Object.assign({}, this.getInfo(), v || {})); },
    getOrders: function () { return read(K.orders, []); },
    saveOrders: function (v) { write(K.orders, v); },
    getCustomers: function () { return read(K.customers, []); },
    saveCustomers: function (v) { write(K.customers, v); },
    getCoupons: function () { return read(K.coupons, []); },
    saveCoupons: function (v) { write(K.coupons, v); },
    getUsage: function () { return read(K.usage, []); },
    saveUsage: function (v) { write(K.usage, v); },
    getZones: function () { return read(K.zones, []); },
    saveZones: function (v) { write(K.zones, v); },
    getUsers: function () { return read(K.users, []); },
    saveUsers: function (v) { write(K.users, v); },
    getBanners: function () { return read(K.banners, []); },
    saveBanners: function (v) { write(K.banners, v); },
    getCart: function () { try { return JSON.parse(localStorage.getItem(K.cart) || '[]'); } catch (e) { return []; } },
    saveCart: function (v) { localStorage.setItem(K.cart, JSON.stringify(v)); },
    nextId: function (key) { var n = Number(localStorage.getItem(key) || '0') + 1; localStorage.setItem(key, String(n)); return n; },
    nextOrderNumber: function () { var n = Number(localStorage.getItem(K.orderNumberSeq) || 1000) + 1; localStorage.setItem(K.orderNumberSeq, String(n)); return 'NF-' + String(n).padStart(6, '0'); },

    /* ---------- autenticação (1 login, 3 perfis) ---------- */
    login: function (email, password) {
      var users = this.getUsers();
      var u = users.find(function (x) { return String(x.email).toLowerCase() === String(email).trim().toLowerCase(); });
      if (!u) return Promise.resolve({ ok: false, error: 'Usuário não encontrado.' });
      if (u.active === false) return Promise.resolve({ ok: false, error: 'Conta desativada. Procure o administrador.' });
      return D.NFSecurity.verify(password, u).then(function (ok) {
        if (!ok) return { ok: false, error: 'Senha incorreta.' };
        sessionStorage.setItem(K.session, String(u.id));
        return { ok: true, user: u };
      }).catch(function () { return { ok: false, error: 'Não foi possível validar o login neste navegador.' }; });
    },
    logout: function () { sessionStorage.removeItem(K.session); },
    currentUser: function () {
      var id = sessionStorage.getItem(K.session);
      if (!id) return null;
      return this.getUsers().find(function (u) { return String(u.id) === String(id); }) || null;
    },
    registerCustomer: function (data) {
      var users = this.getUsers(), self = this;
      var email = String(data.email || '').trim().toLowerCase();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Promise.resolve({ ok: false, error: 'Informe um e-mail válido.' });
      if (String(data.password || '').length < 8) return Promise.resolve({ ok: false, error: 'A senha deve ter ao menos 8 caracteres.' });
      var phone = String(data.phone || '').replace(/\D/g, '');
      if (phone.length < 10 || phone.length > 13) return Promise.resolve({ ok: false, error: 'Informe um WhatsApp válido com DDD.' });
      if (users.some(function (u) { return String(u.email).toLowerCase() === email; })) {
        return Promise.resolve({ ok: false, error: 'Este e-mail já está cadastrado. Faça login.' });
      }
      return D.NFSecurity.createPassword(String(data.password)).then(function (cred) {
        var u = { id: self.nextId(K.userSeq), name: String(data.name || '').trim() || 'Cliente', email: email, phone: phone, role: 'customer', salt: cred.salt, hash: cred.hash, fallbackHash: cred.fallbackHash, scheme: cred.scheme, active: true, createdAt: new Date().toISOString() };
        users.push(u);
        self.saveUsers(users);
        sessionStorage.setItem(K.session, String(u.id));
        return { ok: true, user: u };
      });
    },
    findCustomerByPhone: function (phone) {
      var p = String(phone || '').replace(/\D/g, '');
      return this.getCustomers().find(function (c) { return String(c.phone || '').replace(/\D/g, '') === p; }) || null;
    },

    /* ---------- cupons ---------- */
    couponState: function (c) {
      var now = new Date();
      if (c.active === false) return { ok: false, msg: 'Este cupom está inativo.' };
      if (c.startsAt && new Date(c.startsAt) > now) return { ok: false, msg: 'Este cupom ainda não começou.' };
      if (c.endsAt && new Date(c.endsAt) < now) return { ok: false, msg: 'Este cupom expirou.' };
      if (Number(c.maxUses || 0) > 0 && Number(c.usedCount || 0) >= Number(c.maxUses)) return { ok: false, msg: 'Este cupom atingiu o limite de utilizações.' };
      return { ok: true, msg: '' };
    },
    validateCoupon: function (code, subtotal, userKey) {
      var self = this;
      var found = this.getCoupons().find(function (x) { return String(x.code).toUpperCase() === String(code).trim().toUpperCase(); });
      if (!found) return { ok: false, error: 'Cupom não encontrado.' };
      var st = this.couponState(found);
      if (!st.ok) return { ok: false, error: st.msg };
      if (subtotal < Number(found.minTotal || 0)) return { ok: false, error: 'Compra mínima de R$ ' + Number(found.minTotal).toFixed(2).replace('.', ',') + ' para este cupom.' };
      if (Number(found.perUser || 0) > 0 && userKey) {
        var used = this.getUsage().filter(function (u) {
          return String(u.couponCode).toUpperCase() === String(found.code).toUpperCase() && u.userKey === userKey;
        }).length;
        if (used >= Number(found.perUser)) return { ok: false, error: 'Este cupom já foi utilizado por você.' };
      }
      var discount = found.type === 'percent' ? subtotal * Number(found.value) / 100 : Number(found.value);
      return { ok: true, coupon: found, discount: Math.min(discount, subtotal) };
    },
    bestActiveCoupon: function () {
      var now = new Date();
      return this.getCoupons().filter(function (c) {
        return c.active !== false && c.startsAt && new Date(c.startsAt) <= now && c.endsAt && new Date(c.endsAt) > now;
      }).sort(function (a, b) { return new Date(a.endsAt) - new Date(b.endsAt); })[0] || null;
    },

    /* ---------- criação de pedido (valida tudo de novo) ---------- */
    createOrder: function (payload) {
      var products = this.getProducts(), items = [], subtotal = 0;
      payload = payload || {};
      if (!Array.isArray(payload.items)) return { ok: false, error: 'Carrinho inválido.' };
      payload.items.forEach(function (it) {
        var p = products.find(function (x) { return Number(x.id) === Number(it.id); });
        if (!p) return;
        if (p.active === false || Number(p.stock) <= 0) return;
        var q = Math.max(1, Math.floor(Number(it.qty)));
        if (q > Number(p.stock)) { q = Number(p.stock); }
        var price = p.promo != null ? Number(p.promo) : Number(p.price);
        items.push({ id: p.id, name: p.name, price: price, qty: q });
        subtotal += price * q;
      });
      if (!items.length) return { ok: false, error: 'Seu carrinho está vazio.' };
      subtotal = Math.round(subtotal * 100) / 100;
      var delivery = 0, zoneName = 'Retirada na loja';
      if (payload.deliveryMode === 'entrega') {
        var z = this.getZones().find(function (x) { return Number(x.id) === Number(payload.zoneId); });
        if (!z || z.active === false) return { ok: false, error: 'Região de entrega inválida.' };
        delivery = Number(z.fee || 0); zoneName = z.name;
      }
      var set = this.getSettings();
      if (Number(set.freeDeliveryMin || 0) > 0 && subtotal >= Number(set.freeDeliveryMin)) delivery = 0;
      var discount = 0, couponRec = null;
      if (payload.couponCode) {
        var v = this.validateCoupon(payload.couponCode, subtotal, payload.customer.phone);
        if (!v.ok) return { ok: false, error: v.error };
        discount = v.discount; couponRec = { code: v.coupon.code, value: discount };
      }
      var total = Math.max(0, Math.round((subtotal - discount + delivery) * 100) / 100);
      var now = new Date(), self = this;
      var order = {
        id: self.nextId(K.orderIdSeq), number: self.nextOrderNumber(), createdAt: now.toISOString(),
        customer: { name: payload.customer.name, phone: String(payload.customer.phone || ''), email: payload.customer.email || '', address: payload.customer.address || '' },
        deliveryMode: payload.deliveryMode, zone: zoneName, deliveryFee: delivery, items: items,
        subtotal: subtotal, discount: discount, coupon: couponRec, total: total,
        paymentRequested: payload.paymentRequested || 'PIX', paymentConfirmed: null,
        paymentStatus: 'Pendente', status: 'Pedido recebido', cancelReason: '',
        observations: payload.observations || '', changeFor: payload.changeFor || '',
        loyaltyAwarded: false, statusHistory: [{ status: 'Pedido recebido', at: now.toISOString(), by: 'Cliente' }]
      };
      products.forEach(function (p) { var it = items.find(function (x) { return x.id === p.id; }); if (it) p.stock = Number(p.stock) - it.qty; });
      self.saveProducts(products);
      if (couponRec) {
        var cs = self.getCoupons(), c = cs.find(function (x) { return String(x.code).toUpperCase() === couponRec.code.toUpperCase(); });
        if (c) { c.usedCount = Number(c.usedCount || 0) + 1; self.saveCoupons(cs); }
        var us = self.getUsage(); us.push({ id: self.nextId(K.usageSeq), couponCode: couponRec.code, userKey: order.customer.phone, orderNumber: order.number, usedAt: order.createdAt }); self.saveUsage(us);
      }
      var os = self.getOrders(); os.unshift(order); self.saveOrders(os);
      self.upsertCustomer(order);
      return { ok: true, order: order };
    },
    upsertCustomer: function (order) {
      var cs = this.getCustomers(), phone = String(order.customer.phone || '').replace(/\D/g, '');
      var c = cs.find(function (x) { return String(x.phone || '').replace(/\D/g, '') === phone; });
      if (!c) {
        c = { id: this.nextId(K.customerSeq), name: order.customer.name, phone: phone, email: order.customer.email || '', address: order.customer.address || '', totalSpent: 0, ordersCount: 0, points: 0, lastOrderAt: null, createdAt: new Date().toISOString(), profile: 'novo' };
        cs.push(c);
      }
      c.name = order.customer.name || c.name; c.email = order.customer.email || c.email; c.address = order.customer.address || c.address;
      var related = this.getOrders().filter(function (o) { return String(o.customer && o.customer.phone || '').replace(/\D/g, '') === phone; });
      var valid = related.filter(function (o) { return o.status !== 'Cancelado'; });
      var completed = related.filter(function (o) { return o.status === 'Concluído'; });
      c.ordersCount = valid.length;
      c.totalSpent = Math.round(completed.reduce(function (sum, o) { return sum + Number(o.total || 0); }, 0) * 100) / 100;
      c.lastOrderAt = related.length ? related.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); })[0].createdAt : null;
      c.profile = c.ordersCount >= 4 ? 'fiel' : c.ordersCount >= 2 ? 'recorrente' : 'novo';
      this.saveCustomers(cs);
      return c;
    },
    updateOrderStatus: function (orderId, status, extra) {
      var self = this;
      var os = this.getOrders(), o = os.find(function (x) { return Number(x.id) === Number(orderId); });
      if (!o) return { ok: false, error: 'Pedido não encontrado.' };
      var old = o.status;
      if (old === status && !(extra && extra.paymentStatus)) return { ok: true, order: o };
      if (status === 'Cancelado' && old !== 'Cancelado') {
        var ps = this.getProducts();
        ps.forEach(function (p) { var it = o.items.find(function (x) { return x.id === p.id; }); if (it) p.stock = Number(p.stock) + it.qty; });
        this.saveProducts(ps);
      }
      if (old === 'Cancelado' && status !== 'Cancelado') {
        var ps2 = this.getProducts();
        o.items.forEach(function (it) { var p = ps2.find(function (x) { return x.id === it.id; }); if (p) { p.stock = Number(p.stock) - it.qty; if (p.stock < 0) p.stock = 0; } });
        this.saveProducts(ps2);
      }
      o.status = status;
      if (extra) {
        if (extra.paymentConfirmed) o.paymentConfirmed = extra.paymentConfirmed;
        if (extra.paymentStatus) o.paymentStatus = extra.paymentStatus;
        if (extra.cancelReason) o.cancelReason = extra.cancelReason;
      }
      if (!o.statusHistory) o.statusHistory = [];
      o.statusHistory.push({ status: status, at: new Date().toISOString(), by: (extra && extra.by) || 'Equipe' });
      if (status === 'Concluído' && !o.loyaltyAwarded) {
        o.loyaltyAwarded = true;
        var cs = this.getCustomers(), c = cs.find(function (x) { return String(x.phone || '').replace(/\D/g, '') === String(o.customer.phone || '').replace(/\D/g, ''); });
        if (c) { c.points = Number(c.points || 0) + 1; this.saveCustomers(cs); }
      }
      this.saveOrders(os);
      this.upsertCustomer(o);
      return { ok: true, order: o };
    },

    /* ---------- indicadores ---------- */
    lowStock: function () {
      return this.getProducts().filter(function (p) { return p.active !== false && Number(p.stock) <= Number(p.minStock || 0); });
    },
    expiringSoon: function (days) {
      days = days || 90;
      var now = new Date();
      return this.getProducts().filter(function (p) {
        if (!p.expiry) return false;
        var d = Math.ceil((new Date(p.expiry + 'T23:59:59') - now) / 86400000);
        return d >= 0 && d <= days;
      });
    },
    salesRanking: function (days) {
      var self = this;
      var os = this.getOrders().filter(function (o) {
        return o.status === 'Concluído' && (!days || (Date.now() - new Date(o.createdAt).getTime()) <= days * 86400000);
      });
      var acc = {};
      os.forEach(function (o) { o.items.forEach(function (it) { if (!acc[it.id]) acc[it.id] = { name: it.name, qty: 0, revenue: 0 }; acc[it.id].qty += it.qty; acc[it.id].revenue += it.price * it.qty; }); });
      return Object.keys(acc).map(function (k) { return acc[k]; }).sort(function (a, b) { return b.qty - a.qty; });
    },
    dashboardStats: function () {
      var os = this.getOrders(), self = this;
      var today = new Date().toISOString().slice(0, 10);
      var todays = os.filter(function (o) { return String(o.createdAt).slice(0, 10) === today; });
      var done = os.filter(function (o) { return o.status === 'Concluído'; });
      var revenue = Math.round(done.reduce(function (s, o) { return s + Number(o.total); }, 0) * 100) / 100;
      var itemsSold = done.reduce(function (s, o) { return s + o.items.reduce(function (a, i) { return a + i.qty; }, 0); }, 0);
      var ticket = done.length ? revenue / done.length : 0;
      var pend = ['Pedido recebido', 'Aguardando pagamento', 'Pagamento confirmado', 'Em separação', 'Pronto', 'Saiu para entrega'];
      return {
        ordersToday: todays.length, revenue: revenue, ticket: ticket, itemsSold: itemsSold,
        pending: os.filter(function (o) { return pend.indexOf(o.status) >= 0; }).length,
        activeCoupons: this.getCoupons().filter(function (c) { return self.couponState(c).ok; }).length,
        customers: this.getCustomers().length, lowStock: this.lowStock().length
      };
    },
    salesByDay: function (days) {
      days = days || 7;
      var os = this.getOrders().filter(function (o) { return o.status === 'Concluído'; });
      var out = [];
      for (var i = days - 1; i >= 0; i--) {
        var d = new Date(Date.now() - i * 86400000);
        var key = d.toISOString().slice(0, 10);
        var label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        var sum = os.filter(function (o) { return String(o.createdAt).slice(0, 10) === key; }).reduce(function (s, o) { return s + Number(o.total); }, 0);
        out.push({ label: label, value: Math.round(sum * 100) / 100 });
      }
      return out;
    },
    resetDemo: function () {
      Object.keys(K).forEach(function (name) {
        var key = K[name];
        if (key !== K.session) localStorage.removeItem(key);
      });
      sessionStorage.removeItem(K.session);
      seed();
    }
  };
  window.NFStore = api;
})();
