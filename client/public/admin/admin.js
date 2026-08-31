/* Natal Farma V7 — Painel administrativo
   Fluxo: login único (admin/funcionario/cliente) → admin vê gestão completa. */
(function () {
  'use strict';
  var S = window.NFStore, Sec = window.NFSecurity, E = Sec.escape;
  var $ = function (id) { return document.getElementById(id); };
  var products = [], orders = [], customers = [], coupons = [], zones = [], banners = [];
  var editingBannerImage = '', editingImage = '', editingCompanyLogo = '', activeOrderId = null, confirmCb = null;

  var brl = function (v) { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
  var dt = function (v) { return v ? new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'; };
  var dts = function (v) { return v ? new Date(v).toLocaleString('pt-BR', { dateStyle: 'short' }) : '-'; };

  function toast(t, type) { var d = document.createElement('div'); d.className = 'toast' + (type === 'error' ? ' toast-error' : ''); d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.classList.add('show'); }, 10); setTimeout(function () { d.remove(); }, 2600); }
  function confirmModal(title, text, cb) { $('confirmTitle').textContent = title; $('confirmText').textContent = text; confirmCb = cb; $('confirmDialog').showModal(); }
  $('confirmOk').onclick = function () { if (confirmCb) confirmCb(); $('confirmDialog').close(); confirmCb = null; };
  $('confirmCancel').onclick = function () { $('confirmDialog').close(); confirmCb = null; };

  function badgeClass(v) {
    if (['Concluído', 'Pago', 'Entregue'].indexOf(v) >= 0) return 'green';
    if (['Pedido recebido', 'Aguardando pagamento', 'Pagamento confirmado', 'Em separação', 'Pronto', 'Pendente'].indexOf(v) >= 0) return 'yellow';
    if (v === 'Saiu para entrega') return 'blue';
    if (['Cancelado', 'Não pago', 'Estornado'].indexOf(v) >= 0) return 'red';
    return 'gray';
  }
  function badge(v) { return '<span class="badge ' + badgeClass(v) + '">' + E(v) + '</span>'; }

  /* ---------------- Autenticação ---------------- */
  function routeByRole(u) {
    if (u.role === 'admin') showApp();
    else if (u.role === 'employee') location.href = '../funcionario/';
    else location.href = '../cliente/';
  }
  function initAuth() {
    var u = S.currentUser();
    if (u) { routeByRole(u); return; }
    $('login').classList.remove('hidden');
    $('loginForm').onsubmit = function (ev) { if (ev) ev.preventDefault();
      var em = $('email').value.trim(), pw = $('password').value;
      $('loginError').textContent = '';
      if (!em || !pw) { $('loginError').textContent = 'Informe e-mail e senha.'; return; }
      var btn = $('loginSubmit'); btn.disabled = true; btn.textContent = 'Entrando...';
      S.login(em, pw).then(function (r) {
        if (!r.ok) { $('loginError').textContent = r.error; btn.disabled = false; btn.textContent = 'Entrar'; return; }
        routeByRole(r.user);
      });
    };
  }
  $('logout').onclick = function () { S.logout(); location.reload(); };

  function showApp() { $('login').classList.add('hidden'); $('app').classList.remove('hidden'); refreshAll(); }

  /* ---------------- Navegação ---------------- */
  document.querySelectorAll('[data-view]').forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll('[data-view]').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      document.querySelectorAll('.view').forEach(function (v) { v.classList.add('hidden'); });
      $(b.dataset.view + 'View').classList.remove('hidden');
      var label = b.textContent.replace(/[^\p{L}\p{N} ]/gu, '').trim();
      $('pageTitle').textContent = label;
      refreshAll();
      if (b.dataset.view === 'products') { $('productSearch').value = ''; $('stockFilter').value = 'all'; }
      window.scrollTo({ top: 0 });
    };
  });
  document.querySelectorAll('[data-go]').forEach(function (b) {
    b.onclick = function () { var el = document.querySelector('[data-view="' + b.dataset.go + '"]'); if (el) el.click(); };
  });
  $('openLowStock').onclick = function () { $('stockFilter').value = 'low'; document.querySelector('[data-view="products"]').click(); };
  $('viewAllLowStock').onclick = function () { $('stockFilter').value = 'low'; document.querySelector('[data-view="products"]').click(); };

  /* ---------------- Refresh ---------------- */
  function refreshAll() {
    products = S.getProducts(); orders = S.getOrders(); customers = S.getCustomers();
    coupons = S.getCoupons(); zones = S.getZones(); banners = S.getBanners();
    renderProducts(); renderOrders(); renderCustomers(); renderCoupons(); renderZones();
    renderDashboard(); renderReports(); renderBanners();
  }
  async function saveProducts() { var r = await S.saveProducts(products); refreshAll(); return r; }
  function saveOrders() { S.saveOrders(orders); refreshAll(); }
  function saveCoupons() { S.saveCoupons(coupons); refreshAll(); }
  function saveZones() { S.saveZones(zones); refreshAll(); }
  function saveBanners() { S.saveBanners(banners); refreshAll(); }

  /* ---------------- Dashboard ---------------- */
  function renderDashboard() {
    var st = S.dashboardStats();
    $('dashOrdersToday').textContent = st.ordersToday;
    $('dashRevenue').textContent = brl(st.revenue);
    $('dashTicket').textContent = brl(st.ticket);
    $('dashPending').textContent = st.pending;
    $('dashCustomers').textContent = st.customers;
    $('dashProductsSold').textContent = st.itemsSold;
    $('dashLowStock').textContent = st.lowStock;
    $('dashExpiring').textContent = S.expiringSoon(90).length;

    var days = S.salesByDay(7), max = Math.max.apply(null, days.map(function (d) { return d.value; }).concat([1]));
    $('salesChart').innerHTML = days.map(function (d) {
      var h = Math.max(4, Math.round(d.value / max * 100));
      return '<div class="bar"><b>' + (d.value ? brl(d.value) : '') + '</b><i style="height:' + h + '%"></i><span>' + E(d.label) + '</span></div>';
    }).join('');

    var done = orders.filter(function (o) { return o.status === 'Concluído'; }).slice(0, 6);
    $('recentOrders').innerHTML = done.length ? done.map(function (o) {
      return '<tr><td class="strong">' + E(o.number) + '</td><td>' + dt(o.createdAt) + '</td><td>' + E(o.customer.name) + '</td><td class="strong">' + brl(o.total) + '</td><td>' + E(o.paymentConfirmed || o.paymentRequested || '-') + '</td><td>' + badge(o.status) + '</td></tr>';
    }).join('') : '<tr><td colspan="6" class="empty">Nenhum pedido concluído ainda.</td></tr>';

    var insights = [];
    S.lowStock().forEach(function (p) { insights.push('<div class="ins"><span>⚠️</span><div><b>' + E(p.name) + '</b> — estoque em ' + p.stock + ' un. (mínimo ' + p.minStock + '). Repor agora.</div></div>'); });
    S.expiringSoon(60).forEach(function (p) { insights.push('<div class="ins"><span>📅</span><div><b>' + E(p.name) + '</b> vence em ' + Math.ceil((new Date(p.expiry + 'T23:59:59') - Date.now()) / 86400000) + ' dias.</div></div>'); });
    if (st.activeCoupons) insights.push('<div class="ins"><span>🎟️</span><div><b>' + st.activeCoupons + ' cupom(ns) ativo(s)</b> aparecendo na Home com contagem regressiva.</div></div>');
    if (!insights.length) insights.push('<div class="ins">✅ Tudo sob controle. Nenhuma ação urgente.</div>');
    $('insightsList').innerHTML = insights.slice(0, 6).join('');
    $('lowStockSummary').innerHTML = insights.length ? '' : '';

    var lows = S.lowStock();
    $('lowStockRows').innerHTML = lows.length ? lows.map(function (p) {
      var sit = Number(p.stock) <= 0 ? '<span class="warn">Sem estoque</span>' : Number(p.stock) <= Math.ceil(Number(p.minStock) / 2) ? '<span class="warn">Crítico</span>' : 'Atenção';
      return '<tr><td class="strong">' + E(p.name) + '</td><td>' + E(p.category) + '</td><td class="strong">' + p.stock + ' un.</td><td>' + p.minStock + ' un.</td><td>' + sit + '</td><td><button class="btn outline" data-edit-product="' + p.id + '">Editar</button></td></tr>';
    }).join('') : '<tr><td colspan="6" class="empty">Nenhum produto abaixo do estoque mínimo. 🎉</td></tr>';
    document.querySelectorAll('[data-edit-product]').forEach(function (b) { b.onclick = function () { openProduct(b.dataset.editProduct); }; });
  }

  /* ---------------- Pedidos ---------------- */
  function renderOrders() {
    var q = ($('orderSearch') ? $('orderSearch').value : '').toLowerCase().trim();
    var f = ($('orderFilter') ? $('orderFilter').value : 'all');
    var list = orders.filter(function (o) {
      if (f !== 'all' && o.status !== f) return false;
      if (!q) return true;
      return (o.number + ' ' + o.customer.name + ' ' + o.customer.phone).toLowerCase().indexOf(q) >= 0;
    });
    $('orderRows').innerHTML = list.length ? list.map(function (o) {
      return '<tr><td class="strong">' + E(o.number) + '</td><td>' + dt(o.createdAt) + '</td><td>' + E(o.customer.name) + '<br><small style="color:var(--muted)">' + E(o.customer.phone || '') + '</small></td><td>' + E(o.deliveryMode === 'entrega' ? 'Entrega · ' + E(o.zone) : 'Retirada') + '</td><td class="strong">' + brl(o.total) + '</td><td>' + E(o.paymentConfirmed || o.paymentRequested || '-') + '</td><td>' + badge(o.status) + '</td><td><button class="btn outline" data-open-order="' + o.id + '">Abrir</button></td></tr>';
    }).join('') : '<tr><td colspan="8" class="empty">Nenhum pedido encontrado.</td></tr>';
    document.querySelectorAll('[data-open-order]').forEach(function (b) { b.onclick = function () { openOrder(b.dataset.openOrder); }; });
    if ($('orderSearch')) $('orderSearch').oninput = renderOrders;
    if ($('orderFilter')) $('orderFilter').onchange = renderOrders;
  }

  function openOrder(id) {
    var o = orders.find(function (x) { return String(x.id) === String(id); });
    if (!o) return;
    activeOrderId = id;
    $('orderDialogTitle').textContent = 'Pedido ' + o.number;
    $('orderMeta').innerHTML =
      '<div><span>Cliente</span><b>' + E(o.customer.name) + '</b></div>' +
      '<div><span>Telefone</span><b>' + E(o.customer.phone || '-') + '</b></div>' +
      '<div><span>Data</span><b>' + dt(o.createdAt) + '</b></div>' +
      '<div><span>Entrega</span><b>' + E(o.deliveryMode === 'entrega' ? o.zone + ' · ' + brl(o.deliveryFee) : 'Retirada na loja') + '</b></div>' +
      (o.customer.address ? '<div><span>Endereço</span><b>' + E(o.customer.address) + '</b></div>' : '') +
      (o.observations ? '<div><span>Observações</span><b>' + E(o.observations) + '</b></div>' : '');
    $('orderItems').innerHTML = o.items.map(function (i) {
      return '<div class="oi"><span>' + E(i.name) + ' <small>×' + i.qty + '</small></span><b>' + brl(i.price * i.qty) + '</b></div>';
    }).join('');
    $('orderTotal').textContent = brl(o.total) + (o.discount ? ' <small style="font-size:12px;color:var(--green)">(cupom −' + brl(o.discount) + ')</small>' : '');
    $('paymentCard').innerHTML = '💳 <b>Pagamento solicitado:</b> ' + E(o.paymentRequested || '-') + (o.paymentConfirmed ? '<br>✅ <b>Confirmado:</b> ' + E(o.paymentConfirmed) : '') + '<br>📌 <b>Status:</b> ' + E(o.paymentStatus || 'Pendente');
    $('editOrderStatus').value = o.status;
    $('editPaymentStatus').value = o.paymentStatus || 'Pendente';
    $('editPaymentMethod').value = o.paymentConfirmed || '';
    $('editCancelReason').value = o.cancelReason || '';
    $('cancelReasonWrap').classList.toggle('hidden', o.status !== 'Cancelado' && $('editOrderStatus').value !== 'Cancelado');
    $('editOrderStatus').onchange = function () { $('cancelReasonWrap').classList.toggle('hidden', $('editOrderStatus').value !== 'Cancelado'); };

    var seq = ['Pedido recebido', 'Aguardando pagamento', 'Pagamento confirmado', 'Em separação', 'Pronto', 'Saiu para entrega', 'Concluído'];
    var hist = (o.statusHistory || []).slice();
    if ((o.status === 'Cancelado') && !hist.some(function (h) { return h.status === 'Cancelado'; })) hist.push({ status: 'Cancelado', at: new Date().toISOString(), by: 'Equipe' });
    $('auditList').innerHTML = hist.length ? hist.map(function (h) {
      return '<div class="au"><span class="dotw"></span><span>' + E(h.status) + (h.by ? ' <small style="color:var(--muted)">· ' + E(h.by) + '</small>' : '') + '</span><small>' + dt(h.at) + '</small></div>';
    }).join('') : '<div class="au"><span class="dotw"></span><span>Pedido recebido</span></div>';
    var rank = '';
    if (o.status !== 'Concluído') {
      var idx = seq.indexOf(o.status);
      var next = idx >= 0 && idx < seq.length - 1 ? seq[idx + 1] : '';
      rank = next ? '<button class="btn primary" data-next="' + next + '">Avançar para "' + next + '"</button>' : '';
    }
    var extra = '<button id="quickDone" class="btn primary" ' + (o.status === 'Concluído' || o.status === 'Cancelado' ? 'disabled' : '') + '>Marcar como Concluído</button>' + rank;
    $('orderControlQuick') ? $('orderControlQuick').innerHTML = extra : null;
    var qd = $('quickDone'); if (qd) qd.onclick = function () { $('editOrderStatus').value = 'Concluído'; saveOrderChanges(); };
    document.querySelectorAll('[data-next]').forEach(function (b) { b.onclick = function () { $('editOrderStatus').value = b.dataset.next; saveOrderChanges(); }; });
    $('orderDialog').showModal();
  }
  $('saveOrderChanges').onclick = saveOrderChanges;
  function whatsappStatusSuffix(r) {
    if (!r || !r.whatsapp) return '';
    if (r.whatsapp.sent) return ' · WhatsApp enviado';
    if (r.whatsapp.skipped) return ' · WhatsApp não configurado';
    return ' · Status salvo, mas o WhatsApp falhou';
  }
  async function saveOrderChanges() {
    var o = orders.find(function (x) { return String(x.id) === String(activeOrderId); });
    if (!o) return;
    var status = $('editOrderStatus').value;
    var extra = { paymentStatus: $('editPaymentStatus').value, by: 'Administrador' };
    var meth = $('editPaymentMethod').value;
    if (meth) extra.paymentConfirmed = meth;
    if (status === 'Cancelado') {
      extra.cancelReason = $('editCancelReason').value || 'Não informado';
      confirmModal('Cancelar pedido ' + o.number + '?', 'O estoque dos itens será devolvido automaticamente e o pedido não gerará pontos.', async function () {
        var r = await S.updateOrderStatus(activeOrderId, status, extra);
        if (r.ok) { toast('Pedido cancelado. Estoque devolvido.' + whatsappStatusSuffix(r)); refreshAll(); $('orderDialog').close(); } else toast(r.error, 'error');
      });
      return;
    }
    var r = await S.updateOrderStatus(activeOrderId, status, extra);
    if (r.ok) {
      toast('Pedido atualizado para "' + status + '"' + (status === 'Concluído' ? ' — 1 ponto atribuído ao cliente' : '') + whatsappStatusSuffix(r));
      refreshAll(); $('orderDialog').close();
    } else toast(r.error, 'error');
  }
  $('closeOrder').onclick = function () { $('orderDialog').close(); };

  /* ---------------- Produtos ---------------- */
  var CATEGORIES = ['Medicamentos', 'Vitaminas e Suplementos', 'Higiene', 'Dermocosméticos', 'Beleza e Cuidados Pessoais', 'Bebê e Infantil', 'Primeiros Socorros'];
  function renderProducts() {
    var q = ($('productSearch') ? $('productSearch').value : '').toLowerCase().trim();
    var f = ($('stockFilter') ? $('stockFilter').value : 'all');
    var list = products.filter(function (p) {
      var st = Number(p.stock || 0), low = st <= Number(p.minStock || 0), out = st <= 0;
      var fm = f === 'all' || (f === 'low' && low && !out) || (f === 'out' && out) || (f === 'normal' && !low);
      if (!fm) return false;
      if (!q) return true;
      return (p.name + ' ' + (p.brand || '') + ' ' + (p.category || '')).toLowerCase().indexOf(q) >= 0;
    });
    $('productCount').textContent = list.length + ' de ' + products.length + ' produtos';
    $('productRows').innerHTML = list.map(function (p) {
      var margin = Number(p.cost) > 0 ? Math.round((1 - Number(p.cost) / (p.promo != null ? p.promo : p.price)) * 100) : 0;
      return '<tr><td><img src="' + E(p.image || '') + '" style="width:44px;height:44px;object-fit:contain;border-radius:9px;border:1px solid var(--line);background:#fff"></td>' +
        '<td class="strong">' + E(p.name) + '<br><small style="color:var(--muted)">' + E(p.brand || '') + '</small></td>' +
        '<td>' + brl(p.price) + '</td><td>' + (p.promo != null ? '<b style="color:var(--brand)">' + brl(p.promo) + '</b>' : '—') + '</td>' +
        '<td>' + (Number(p.cost) ? margin + '%' : '—') + '</td>' +
        '<td><b>' + p.stock + '</b> <small style="color:var(--muted)">/ min ' + p.minStock + '</small></td>' +
        '<td>' + expiryStatus(p) + '</td>' +
        '<td>' + (p.active === false ? badge('Inativo') : Number(p.stock) <= 0 ? badge('Esgotado') : Number(p.stock) <= Number(p.minStock) ? badge('Estoque baixo') : badge('Ativo')) + '</td>' +
        '<td><div class="buttons-row"><button data-edit-product="' + p.id + '">Editar</button><button data-toggle-product="' + p.id + '">' + (p.active === false ? 'Ativar' : 'Inativar') + '</button><button class="icon-act danger" data-del-product="' + p.id + '">Excluir</button></div></td></tr>';
    }).join('');
    document.querySelectorAll('[data-edit-product]').forEach(function (b) { b.onclick = function () { openProduct(b.dataset.editProduct); }; });
    document.querySelectorAll('[data-toggle-product]').forEach(function (b) { b.onclick = function () { var p = products.find(function (x) { return String(x.id) === String(b.dataset.toggleProduct); }); if (p) { p.active = p.active === false; saveProducts(); } }; });
    document.querySelectorAll('[data-del-product]').forEach(function (b) {
      b.onclick = function () {
        var p = products.find(function (x) { return String(x.id) === String(b.dataset.delProduct); });
        if (!p) return;
        confirmModal('Excluir "' + p.name + '"?', 'Esta ação é definitiva. Os dados de vendas anteriores continuam no histórico.', function () {
          products = products.filter(function (x) { return String(x.id) !== String(p.id); });
          saveProducts(); toast('Produto excluído.');
        });
      };
    });
    if ($('productSearch')) $('productSearch').oninput = renderProducts;
    if ($('stockFilter')) $('stockFilter').onchange = renderProducts;
  }
  function expiryStatus(p) {
    if (!p.expiry) return '—';
    var d = Math.ceil((new Date(p.expiry + 'T23:59:59') - Date.now()) / 86400000);
    return d < 0 ? '<span class="warn">Vencido</span>' : d <= 90 ? '<span class="warn">' + d + ' dias</span>' : new Date(p.expiry + 'T12:00:00').toLocaleDateString('pt-BR');
  }
  function fillCategorySelect(sel, cur) {
    var all = CATEGORIES.slice();
    products.forEach(function (p) { if (p.category && all.indexOf(p.category) < 0) all.push(p.category); });
    sel.innerHTML = all.map(function (c) { return '<option' + (c === cur ? ' selected' : '') + '>' + E(c) + '</option>'; }).join('');
  }
  $('newProduct').onclick = function () { openProduct(null); };
  function openProduct(id) {
    var p = id != null ? products.find(function (x) { return String(x.id) === String(id); }) : null;
    $('formTitle').textContent = p ? 'Editar produto' : 'Novo produto';
    $('productId').value = p ? p.id : '';
    $('pName').value = p ? p.name : ''; $('pBrand').value = p ? (p.brand || '') : '';
    fillCategorySelect($('pCategory'), p ? p.category : CATEGORIES[0]);
    $('pPrice').value = p ? p.price : ''; $('pPromo').value = p && p.promo != null ? p.promo : '';
    $('pCost').value = p ? (p.cost || '') : ''; $('pStock').value = p ? p.stock : ''; $('pMinStock').value = p ? (p.minStock || 0) : '';
    $('pExpiry').value = p ? (p.expiry || '') : ''; $('pDesc').value = p ? (p.desc || '') : '';
    $('pActive').checked = p ? p.active !== false : true; $('pFeatured').checked = p ? !!p.featured : false;
    editingImage = p ? (p.image && p.image.indexOf('data:') === 0 ? p.image : '') : '';
    if (editingImage) { $('productPreview').src = editingImage; $('productPreview').classList.remove('hidden'); } else $('productPreview').classList.add('hidden');
    $('productDialog').showModal();
  }
  $('closeProduct').onclick = function () { $('productDialog').close(); };
  $('pImage').onchange = function (ev) { var f = ev.target.files[0]; if (!f) return; if (f.size > 900 * 1024) { toast('Imagem acima de 900 KB. Reduza antes.', 'error'); ev.target.value = ''; return; } var r = new FileReader(); r.onload = function () { editingImage = r.result; $('productPreview').src = editingImage; $('productPreview').classList.remove('hidden'); }; r.readAsDataURL(f); };
  $('productForm').onsubmit = async function (ev) {
    if (ev) ev.preventDefault();
    var name = $('pName').value.trim(), price = Number($('pPrice').value);
    if (!name || !(price > 0)) { toast('Preencha nome e preço de venda.', 'error'); return; }
    var id = $('productId').value;
    var data = {
      name: name, brand: $('pBrand').value.trim(), category: $('pCategory').value,
      price: price, promo: $('pPromo').value === '' ? null : Number($('pPromo').value),
      cost: $('pCost').value === '' ? 0 : Number($('pCost').value),
      stock: Number($('pStock').value || 0), minStock: Number($('pMinStock').value || 0),
      expiry: $('pExpiry').value || '', desc: $('pDesc').value.trim(),
      image: editingImage || (id ? '' : 'assets/products/sabonete-lux.jpg'),
      active: $('pActive').checked, featured: $('pFeatured').checked
    };
    if (id) { var p = products.find(function (x) { return String(x.id) === String(id); }); if (p) { if (!data.image) data.image = p.image; if (!data.expiry && p.expiry) data.expiry = p.expiry; Object.assign(p, data); } }
    else { data.id = S.nextId(S.K.productSeq); products.push(data); }
    try {
      var btn = $('productForm').querySelector('.save');
      if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }
      await saveProducts();
      toast('Produto salvo.');
      $('productDialog').close();
    } catch (e) {
      console.error(e);
      toast('Não foi possível salvar o produto: ' + (e.message || e), 'error');
    } finally {
      var btn2 = $('productForm').querySelector('.save');
      if (btn2) { btn2.disabled = false; btn2.textContent = 'Salvar produto'; }
    }
    return false;
  };

  /* ---------------- Clientes ---------------- */
  function renderCustomers() {
    var q = ($('customerSearch') ? $('customerSearch').value : '').toLowerCase().trim();
    var list = customers.filter(function (c) {
      if (!q) return true;
      return (c.name + ' ' + c.phone + ' ' + (c.email || '')).toLowerCase().indexOf(q) >= 0;
    });
    $('customerRows').innerHTML = list.length ? list.map(function (c) {
      var ticket = c.ordersCount ? c.totalSpent / c.ordersCount : 0;
      return '<tr><td class="strong">' + E(c.name) + '<br><small style="color:var(--muted)">' + E(c.phone || '') + '</small></td>' +
        '<td>' + c.ordersCount + '</td><td class="strong">' + brl(c.totalSpent) + '</td><td>' + brl(ticket) + '</td>' +
        '<td><b style="color:var(--brand)">' + (c.points || 0) + '</b></td><td>' + (c.lastOrderAt ? dt(c.lastOrderAt) : '—') + '</td><td>' + badge(c.profile === 'fiel' ? 'Fiel' : c.profile === 'recorrente' ? 'Recorrente' : 'Novo') + '</td></tr>';
    }).join('') : '<tr><td colspan="7" class="empty">Nenhum cliente encontrado.</td></tr>';
    if ($('customerSearch')) $('customerSearch').oninput = renderCustomers;
  }

  /* ---------------- Cupons ---------------- */
  function renderCoupons() {
    var now = new Date();
    $('couponRows').innerHTML = coupons.map(function (c) {
      var state = S.couponState(c), expired = c.endsAt && new Date(c.endsAt) < now;
      return '<tr><td class="strong">' + E(c.code) + '</td><td>' + (c.type === 'percent' ? '-' + c.value + '%' : '-' + brl(c.value)) + '</td><td>' + (c.minTotal ? brl(c.minTotal) : '—') + '</td>' +
        '<td>' + (c.startsAt ? dts(c.startsAt) : '—') + ' → ' + (c.endsAt ? dts(c.endsAt) : '—') + (expired ? ' <span class="warn">(expirado)</span>' : '') + '</td>' +
        '<td>' + (c.usedCount || 0) + (c.maxUses ? ' / ' + c.maxUses : '') + '</td>' +
        '<td>' + (c.active === false ? badge('Inativo') : expired ? badge('Expirado') : badge('Ativo')) + '</td>' +
        '<td><div class="buttons-row"><button data-edit-coupon="' + c.id + '">Editar</button><button data-toggle-coupon="' + c.id + '">' + (c.active === false ? 'Ativar' : 'Pausar') + '</button></div></td></tr>';
    }).join('');
    document.querySelectorAll('[data-edit-coupon]').forEach(function (b) { b.onclick = function () { openCoupon(b.dataset.editCoupon); }; });
    document.querySelectorAll('[data-toggle-coupon]').forEach(function (b) { b.onclick = function () { var c = coupons.find(function (x) { return String(x.id) === String(b.dataset.toggleCoupon); }); if (c) { c.active = c.active === false; saveCoupons(); } }; });
  }
  $('newCoupon').onclick = function () { openCoupon(null); };
  function openCoupon(id) {
    var c = id != null ? coupons.find(function (x) { return String(x.id) === String(id); }) : null;
    $('couponFormTitle').textContent = c ? 'Editar cupom' : 'Novo cupom';
    $('cId').value = c ? c.id : ''; $('cCode').value = c ? c.code : '';
    $('cType').value = c ? c.type : 'percent'; $('cValue').value = c ? c.value : '';
    $('cMin').value = c ? (c.minTotal || 0) : ''; $('cMax').value = c ? (c.maxUses || 0) : '';
    $('cPerUser').value = c ? (c.perUser || 0) : '';
    $('cStarts').value = c && c.startsAt ? c.startsAt.slice(0, 16) : '';
    $('cEnds').value = c && c.endsAt ? c.endsAt.slice(0, 16) : '';
    $('cActive').checked = c ? c.active !== false : true;
    $('couponDialog').showModal();
  }
  $('closeCoupon').onclick = function () { $('couponDialog').close(); };
  $('couponForm').onsubmit = function (ev) { if (ev) ev.preventDefault();
    var code = $('cCode').value.trim().toUpperCase(), val = Number($('cValue').value);
    if (!code || !(val > 0)) { toast('Informe código e valor do desconto.', 'error'); return; }
    if (coupons.some(function (c) { return String(c.code).toUpperCase() === code && String(c.id) !== $('cId').value; })) { toast('Já existe um cupom com este código.', 'error'); return; }
    var id = $('cId').value;
    var data = { code: code, type: $('cType').value, value: val, minTotal: Number($('cMin').value || 0), maxUses: Number($('cMax').value || 0), perUser: Number($('cPerUser').value || 0), startsAt: $('cStarts').value ? new Date($('cStarts').value).toISOString().slice(0, 16) : '', endsAt: $('cEnds').value ? new Date($('cEnds').value).toISOString().slice(0, 16) : '', active: $('cActive').checked };
    if (data.startsAt && data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) { toast('Data final deve ser posterior à inicial.', 'error'); return; }
    if (id) { var c = coupons.find(function (x) { return String(x.id) === String(id); }); if (c) { data.usedCount = c.usedCount || 0; Object.assign(c, data); } }
    else { data.id = S.nextId(S.K.couponSeq); data.usedCount = 0; coupons.push(data); }
    saveCoupons(); toast('Cupom salvo — ' + (data.active ? 'ativo na Home.' : 'pausado.')); $('couponDialog').close();
  };

  /* ---------------- Entregas ---------------- */
  function renderZones() {
    $('zoneRows').innerHTML = zones.map(function (z) {
      return '<tr><td class="strong">' + E(z.name) + '</td><td>' + brl(z.fee) + '</td><td>' + (z.active === false ? badge('Inativa') : badge('Ativa')) + '</td>' +
        '<td><div class="buttons-row"><button data-edit-zone="' + z.id + '">Editar</button><button data-toggle-zone="' + z.id + '">' + (z.active === false ? 'Ativar' : 'Pausar') + '</button></div></td></tr>';
    }).join('');
    document.querySelectorAll('[data-edit-zone]').forEach(function (b) { b.onclick = function () { openZone(b.dataset.editZone); }; });
    document.querySelectorAll('[data-toggle-zone]').forEach(function (b) { b.onclick = function () { var z = zones.find(function (x) { return String(x.id) === String(b.dataset.toggleZone); }); if (z) { z.active = z.active === false; saveZones(); } }; });
  }
  $('newZone').onclick = function () { openZone(null); };
  function openZone(id) {
    var z = id != null ? zones.find(function (x) { return String(x.id) === String(id); }) : null;
    $('zId').value = z ? z.id : ''; $('zName').value = z ? z.name : ''; $('zFee').value = z ? z.fee : '';
    $('zoneDialog').showModal();
  }
  $('closeZone').onclick = function () { $('zoneDialog').close(); };
  $('zoneForm').onsubmit = function (ev) { if (ev) ev.preventDefault();
    var name = $('zName').value.trim();
    if (!name) { toast('Informe o nome da região.', 'error'); return; }
    var id = $('zId').value;
    var data = { name: name, fee: Number($('zFee').value || 0) };
    if (id) { var z = zones.find(function (x) { return String(x.id) === String(id); }); if (z) Object.assign(z, data); }
    else { data.id = S.nextId(S.K.zoneSeq); data.active = true; zones.push(data); }
    saveZones(); toast('Região salva.'); $('zoneDialog').close();
  };

  /* ---------------- Relatórios ---------------- */
  function renderReports() {
    var done = orders.filter(function (o) { return o.status === 'Concluído'; });
    var revenue = done.reduce(function (s, o) { return s + Number(o.total); }, 0);
    var cost = 0;
    done.forEach(function (o) { o.items.forEach(function (it) { var p = products.find(function (x) { return String(x.id) === String(it.id); }); if (p) cost += Number(p.cost || 0) * it.qty; }); });
    var profit = revenue - cost, margin = revenue ? profit / revenue * 100 : 0;
    $('reportRevenue').textContent = brl(revenue);
    $('reportCost').textContent = brl(cost);
    $('reportProfit').textContent = brl(profit);
    $('reportMargin').textContent = Math.round(margin) + '%';

    var period = $('rankingPeriod').value;
    var days = period === 'all' ? 0 : Number(period);
    var rank = S.salesRanking(days).slice(0, 10);
    $('rankingList').innerHTML = rank.length ? rank.map(function (r, i) {
      return '<div class="rank-item"><span class="pos' + (i < 3 ? ' top' : '') + '">' + (i + 1) + '</span><div><b>' + E(r.name) + '</b><small>' + r.qty + ' unidades vendidas</small></div><span class="rev">' + brl(r.revenue) + '</span></div>';
    }).join('') : '<div class="empty-state">Ainda não há vendas concluídas.</div>';

    var pay = {};
    done.forEach(function (o) { var k = o.paymentConfirmed || o.paymentRequested || '—'; pay[k] = (pay[k] || 0) + Number(o.total); });
    var payArr = Object.keys(pay).map(function (k) { return { k: k, v: pay[k] }; }).sort(function (a, b) { return b.v - a.v; });
    $('paymentReport').innerHTML = payArr.length ? payArr.map(function (p, i) {
      return '<div class="rank-item"><span class="pos">' + (i + 1) + '</span><div><b>' + E(p.k) + '</b></div><span class="rev">' + brl(p.v) + '</span></div>';
    }).join('') : '<div class="empty-state">Sem dados ainda.</div>';
  }
  $('rankingPeriod').onchange = renderReports;

  /* ---------------- Banners ---------------- */
  function renderBanners() {
    var now = new Date();
    $('bannerRows').innerHTML = banners.map(function (b) {
      var expiry = b.endsAt && new Date(b.endsAt) < now;
      return '<tr><td class="strong">' + E(b.title) + '<br><small style="color:var(--muted)">' + E(b.button || 'sem botão') + '</small></td>' +
        '<td>' + (b.startsAt ? dts(b.startsAt) : '—') + ' → ' + (b.endsAt ? dts(b.endsAt) : '—') + (expiry ? ' <span class="warn">(encerrado)</span>' : '') + '</td>' +
        '<td>' + (b.active === false ? badge('Inativo') : expiry ? badge('Encerrado') : badge('Ativo')) + '</td>' +
        '<td><div class="buttons-row"><button data-edit-banner="' + b.id + '">Editar</button><button data-toggle-banner="' + b.id + '">' + (b.active === false ? 'Ativar' : 'Pausar') + '</button><button class="icon-act danger" data-del-banner="' + b.id + '">Excluir</button></div></td></tr>';
    }).join('');
    document.querySelectorAll('[data-edit-banner]').forEach(function (b) { b.onclick = function () { openBanner(b.dataset.editBanner); }; });
    document.querySelectorAll('[data-toggle-banner]').forEach(function (b) { b.onclick = function () { var x = banners.find(function (y) { return String(y.id) === String(b.dataset.toggleBanner); }); if (x) { x.active = x.active === false; saveBanners(); } }; });
    document.querySelectorAll('[data-del-banner]').forEach(function (b) { b.onclick = function () { var x = banners.find(function (y) { return String(y.id) === String(b.dataset.delBanner); }); if (!x) return; confirmModal('Excluir banner?', 'O banner será removido do carrossel da Home.', function () { banners = banners.filter(function (y) { return String(y.id) !== String(x.id); }); saveBanners(); }); }; });
  }
  $('newBanner').onclick = function () { openBanner(null); };
  $('closeBannerEditor').onclick = function () { $('bannerEditor').classList.add('hidden'); };
  function openBanner(id) {
    var b = id != null ? banners.find(function (x) { return String(x.id) === String(id); }) : null;
    $('bannerFormTitle').textContent = b ? 'Editar banner' : 'Novo banner';
    $('bId').value = b ? b.id : '';
    $('bTitle').value = b ? b.title : ''; $('bSubtitle').value = b ? (b.subtitle || '') : '';
    $('bButton').value = b ? (b.button || '') : ''; $('bLink').value = b ? (b.link || '#produtos') : '#produtos';
    $('bTone').value = b && b.tone === 'teal' ? 'teal' : 'brand';
    $('bStarts').value = b && b.startsAt ? b.startsAt.slice(0, 16) : '';
    $('bEnds').value = b && b.endsAt ? b.endsAt.slice(0, 16) : '';
    $('bActive').checked = b ? b.active !== false : true;
    editingBannerImage = b && b.image && b.image.indexOf('data:') === 0 ? b.image : (b ? b.image || '' : '');
    if (editingBannerImage) { $('bImagePreview').src = editingBannerImage; $('bImagePreview').classList.remove('hidden'); } else $('bImagePreview').classList.add('hidden');
    $('bannerEditor').classList.remove('hidden');
    previewBanner();
  }
  function previewBanner() {
    $('previewTitle').textContent = $('bTitle').value || 'Título do banner';
    $('previewSubtitle').textContent = $('bSubtitle').value || 'Subtítulo aparece aqui para o cliente.';
    $('bannerPreview').classList.toggle('teal', $('bTone').value === 'teal');
    $('bannerPreview').style.backgroundImage = editingBannerImage ? 'url(' + editingBannerImage + ')' : '';
  }
  ['bTitle', 'bSubtitle', 'bTone'].forEach(function (id) { $(id).oninput = previewBanner; });
  $('bImage').onchange = function (ev) { var f = ev.target.files[0]; if (!f) return; if (f.size > 1200 * 1024) { toast('Imagem acima de 1,2 MB. Reduza antes.', 'error'); ev.target.value = ''; return; } var r = new FileReader(); r.onload = function () { editingBannerImage = r.result; $('bImagePreview').src = editingBannerImage; $('bImagePreview').classList.remove('hidden'); previewBanner(); }; r.readAsDataURL(f); };
  $('clearBanner').onclick = function () { editingBannerImage = ''; $('bImage').value = ''; $('bImagePreview').classList.add('hidden'); previewBanner(); };
  $('saveBanner').onclick = function () {
    var title = $('bTitle').value.trim();
    if (!title) { toast('Informe o título do banner.', 'error'); return; }
    var id = $('bId').value;
    var data = { title: title, subtitle: $('bSubtitle').value.trim(), button: $('bButton').value.trim(), link: $('bLink').value.trim() || '#produtos', tone: $('bTone').value, image: editingBannerImage || '', startsAt: $('bStarts').value ? new Date($('bStarts').value).toISOString().slice(0, 16) : '', endsAt: $('bEnds').value ? new Date($('bEnds').value).toISOString().slice(0, 16) : '', active: $('bActive').checked };
    if (data.startsAt && data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) { toast('Data final deve ser posterior à inicial.', 'error'); return; }
    if (id) { var b = banners.find(function (x) { return String(x.id) === String(id); }); if (b) Object.assign(b, data); }
    else { data.id = S.nextId(S.K.bannerSeq); banners.push(data); }
    saveBanners(); toast('Banner publicado na Home.'); $('bannerEditor').classList.add('hidden');
  };

  /* ---------------- Configurações ---------------- */
  function updateBrandPreview() {
    var i = S.getInfo();
    $('infoNamePreview').textContent = $('infoName').value.trim() || i.name || 'Natal Farma';
    $('infoSloganPreview').textContent = $('infoSlogan').value.trim() || '';
    $('infoLogoPreview').src = editingCompanyLogo || i.logo || '../assets/logo-natal-farma.png';
  }
  function loadInfo() {
    var i = S.getInfo(), s = S.getSettings();
    $('infoName').value = i.name || 'Natal Farma'; $('infoSlogan').value = i.slogan || '';
    editingCompanyLogo = i.logo || '';
    $('infoWhatsapp').value = i.whatsapp || ''; $('infoInstagram').value = i.instagram || '';
    $('infoAddress').value = i.address || ''; $('infoHoursWeek').value = i.hoursWeek || ''; $('infoHoursSunday').value = i.hoursSunday || '';
    $('freeDeliveryMin').value = s.freeDeliveryMin || 0; $('loyaltyRate').value = s.loyaltyRate || 1;
    $('redeemPoints').value = s.loyaltyRedeemPoints || 500; $('topNotice').value = s.topNotice || '';
    updateBrandPreview();
  }
  $('infoName').oninput = updateBrandPreview; $('infoSlogan').oninput = updateBrandPreview;
  $('infoLogo').onchange = function (ev) {
    var f = ev.target.files[0]; if (!f) return;
    if (f.size > 700 * 1024) { toast('A logo deve ter no máximo 700 KB.', 'error'); ev.target.value = ''; return; }
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type)) { toast('Formato de logo não suportado.', 'error'); ev.target.value = ''; return; }
    var r = new FileReader(); r.onload = function () { editingCompanyLogo = r.result; updateBrandPreview(); }; r.readAsDataURL(f);
  };
  $('clearLogo').onclick = function () { editingCompanyLogo = ''; $('infoLogo').value = ''; $('infoLogoPreview').src = '../assets/logo-natal-farma.png'; };
  $('settingsForm').onsubmit = function (ev) { if (ev) ev.preventDefault();
    var companyName = $('infoName').value.trim();
    if (!companyName) { toast('Informe o nome da empresa.', 'error'); return; }
    S.saveInfo({ name: companyName, slogan: $('infoSlogan').value.trim(), logo: editingCompanyLogo, whatsapp: $('infoWhatsapp').value.trim(), instagram: $('infoInstagram').value.trim(), address: $('infoAddress').value.trim(), hoursWeek: $('infoHoursWeek').value.trim(), hoursSunday: $('infoHoursSunday').value.trim() });
    var prev = S.getSettings();
    S.saveSettings(Object.assign({}, prev, { freeDeliveryMin: Number($('freeDeliveryMin').value || 0), loyaltyRate: Number($('loyaltyRate').value || 1), loyaltyRedeemPoints: Number($('redeemPoints').value || 500), loyaltyRedeemValue: 20, topNotice: $('topNotice').value.trim() }));
    if (window.NFBranding) window.NFBranding.apply();
    updateBrandPreview();
    toast('Configurações salvas — nome e logo já refletem no sistema.');
  };
  $('resetDemo').onclick = function () {
    confirmModal('Restaurar dados de demonstração?', 'Catálogo, pedidos, cupons, banners e usuários voltarão ao estado inicial.', function () { S.resetDemo(); location.reload(); });
  };

  /* ---------------- Init ---------------- */
  window.addEventListener('load', function () {
    Promise.resolve(S.ready ? S.ready() : true)
      .then(function(){ initAuth(); loadInfo(); })
      .catch(function(e){
        console.error(e);
        initAuth();
        $('loginError').textContent='O banco respondeu com erro antes do login. Você ainda pode entrar para identificar a permissão que está faltando.';
        toast('Falha ao carregar dados iniciais do banco.', 'error');
      });
  });
})();
