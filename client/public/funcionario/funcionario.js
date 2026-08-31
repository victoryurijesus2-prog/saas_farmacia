/* Natal Farma V7 — Painel do funcionário */
(function () {
  'use strict';
  var S = window.NFStore, Sec = window.NFSecurity, E = Sec.escape;
  var $ = function (id) { return document.getElementById(id); };
  var orders = [], products = [], activeOrderId = null;

  var brl = function (v) { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
  var dt = function (v) { return v ? new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'; };

  function toast(t, type) { var d = document.createElement('div'); d.className = 'toast' + (type === 'error' ? ' toast-error' : ''); d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.classList.add('show'); }, 10); setTimeout(function () { d.remove(); }, 2600); }
  function badgeClass(v) {
    if (['Concluído', 'Pago'].indexOf(v) >= 0) return 'green';
    if (['Pedido recebido', 'Aguardando pagamento', 'Pagamento confirmado', 'Em separação', 'Pronto', 'Pendente'].indexOf(v) >= 0) return 'yellow';
    if (v === 'Saiu para entrega') return 'blue';
    if (['Cancelado', 'Não pago'].indexOf(v) >= 0) return 'red';
    return 'gray';
  }
  function badge(v) { return '<span class="badge ' + badgeClass(v) + '">' + E(v) + '</span>'; }

  function initAuth() {
    var u = S.currentUser();
    if (u) {
      if (u.role === 'admin') { location.href = '../admin/'; return; }
      if (u.role === 'customer') { location.href = '../cliente/'; return; }
      $('login').classList.add('hidden'); $('app').classList.remove('hidden');
      $('userChip').textContent = '● ' + u.name + ' · funcionário';
      refresh();
      return;
    }
    $('loginForm').onsubmit = function (ev) { if (ev) ev.preventDefault();
      var em = $('email').value.trim(), pw = $('password').value;
      $('loginError').textContent = '';
      if (!em || !pw) { $('loginError').textContent = 'Informe e-mail e senha.'; return; }
      var btn = $('loginSubmit'); btn.disabled = true; btn.textContent = 'Entrando...';
      S.login(em, pw).then(function (r) {
        if (!r.ok) { $('loginError').textContent = r.error; btn.disabled = false; btn.textContent = 'Entrar'; return; }
        if (r.user.role === 'admin') { location.href = '../admin/'; return; }
        if (r.user.role === 'customer') { location.href = '../cliente/'; return; }
        $('login').classList.add('hidden'); $('app').classList.remove('hidden');
        $('userChip').textContent = '● ' + r.user.name + ' · funcionário';
        refresh();
      });
    };
  }
  $('logout').onclick = function () { S.logout(); location.reload(); };

  document.querySelectorAll('[data-view]').forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll('[data-view]').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      document.querySelectorAll('.view').forEach(function (v) { v.classList.add('hidden'); });
      $(b.dataset.view + 'View').classList.remove('hidden');
      var label = b.textContent.replace(/[^\p{L}\p{N} ]/gu, '').trim();
      $('pageTitle').textContent = label;
      refresh();
    };
  });

  function refresh() {
    orders = S.getOrders(); products = S.getProducts();
    renderStats(); renderQueue(); renderStock();
  }

  function renderStats() {
    var pend = ['Pedido recebido', 'Aguardando pagamento', 'Pagamento confirmado'];
    var prog = ['Em separação', 'Pronto', 'Saiu para entrega'];
    var today = new Date().toISOString().slice(0, 10);
    $('fNew').textContent = orders.filter(function (o) { return pend.indexOf(o.status) >= 0; }).length;
    $('fProgress').textContent = orders.filter(function (o) { return prog.indexOf(o.status) >= 0; }).length;
    $('fDone').textContent = orders.filter(function (o) { return o.status === 'Concluído' && String(o.createdAt).slice(0, 10) === today; }).length;
    $('fCancelled').textContent = orders.filter(function (o) { return o.status === 'Cancelado'; }).length;
  }

  function renderQueue() {
    var q = ($('fSearch').value || '').toLowerCase().trim(), f = $('fFilter').value;
    var list = orders.filter(function (o) {
      if (f !== 'all' && o.status !== f) return false;
      if (!q) return true;
      return (o.number + ' ' + o.customer.name + ' ' + o.customer.phone).toLowerCase().indexOf(q) >= 0;
    });
    var orderBy = { 'Pedido recebido': 0, 'Aguardando pagamento': 1, 'Pagamento confirmado': 2, 'Em separação': 3, 'Pronto': 4, 'Saiu para entrega': 5, 'Concluído': 6, 'Cancelado': 7 };
    list.sort(function (a, b) { return (orderBy[a.status] || 9) - (orderBy[b.status] || 9) || new Date(b.createdAt) - new Date(a.createdAt); });
    $('fQueue').innerHTML = list.length ? list.map(function (o) {
      return '<div class="fq-card"><div class="fq-head"><div><b>' + E(o.number) + '</b><small>' + dt(o.createdAt) + ' · ' + E(o.deliveryMode === 'entrega' ? 'Entrega · ' + (o.zone || '') : 'Retirada na loja') + '</small></div>' + badge(o.status) + '</div>' +
        '<div class="fq-body">' +
        '<div class="blk"><span>Cliente</span><b>' + E(o.customer.name) + '</b><p>' + E(o.customer.phone || '') + (o.customer.address ? ' · ' + E(o.customer.address) : '') + '</p></div>' +
        '<div class="blk"><span>Itens</span><div class="fq-items">' + o.items.map(function (i) { return E(i.name) + ' ×' + i.qty + '<br>'; }).join('') + '</div></div>' +
        '<div class="blk"><span>Valor</span><b>' + brl(o.total) + '</b><p>Pagamento: ' + E(o.paymentConfirmed || o.paymentRequested || '—') + '</p><p>Status pago: ' + E(o.paymentStatus || 'Pendente') + '</p></div>' +
        '</div><div class="fq-actions"><button class="btn primary" data-open-order="' + o.id + '">Atender pedido</button></div></div>';
    }).join('') : '<div class="empty-state"><b>Nenhum pedido encontrado</b><span>Ajuste a busca ou o filtro de status.</span></div>';
    document.querySelectorAll('[data-open-order]').forEach(function (b) { b.onclick = function () { openOrder(b.dataset.openOrder); }; });
  }
  $('fSearch').oninput = renderQueue; $('fFilter').onchange = renderQueue;

  function whatsappStatusSuffix(r) {
    if (!r || !r.whatsapp) return '';
    if (r.whatsapp.sent) return ' · WhatsApp enviado';
    if (r.whatsapp.skipped) return ' · WhatsApp não configurado';
    return ' · Status salvo, mas o WhatsApp falhou';
  }

  function openOrder(id) {
    var o = orders.find(function (x) { return String(x.id) === String(id); });
    if (!o) return;
    activeOrderId = id;
    $('fOrderTitle').textContent = 'Pedido ' + o.number;
    $('fOrderMeta').innerHTML =
      '<div><span>Cliente</span><b>' + E(o.customer.name) + '</b></div>' +
      '<div><span>Telefone</span><b>' + E(o.customer.phone || '-') + '</b></div>' +
      '<div><span>Data</span><b>' + dt(o.createdAt) + '</b></div>' +
      '<div><span>Entrega</span><b>' + E(o.deliveryMode === 'entrega' ? (o.zone + ' · ' + brl(o.deliveryFee)) : 'Retirada na loja') + '</b></div>' +
      (o.customer.address ? '<div><span>Endereço</span><b>' + E(o.customer.address) + '</b></div>' : '') +
      (o.observations ? '<div><span>Obs.</span><b>' + E(o.observations) + '</b></div>' : '');
    $('fOrderItems').innerHTML = o.items.map(function (i) {
      return '<div class="oi"><span>' + E(i.name) + ' <small>×' + i.qty + '</small></span><b>' + brl(i.price * i.qty) + '</b></div>';
    }).join('');
    $('fOrderTotal').textContent = brl(o.total) + (o.discount ? ' <small style="font-size:12px;color:var(--green)">(cupom −' + brl(o.discount) + ')</small>' : '');
    $('fPaymentCard').innerHTML = '💳 <b>Solicitado:</b> ' + E(o.paymentRequested || '-') + (o.paymentConfirmed ? '<br>✅ <b>Confirmado:</b> ' + E(o.paymentConfirmed) : '') + '<br>📌 <b>Status:</b> ' + E(o.paymentStatus || 'Pendente');

    var seq = ['Pedido recebido', 'Aguardando pagamento', 'Pagamento confirmado', 'Em separação', 'Pronto', 'Saiu para entrega', 'Concluído'];
    var idx = seq.indexOf(o.status);
    var next = (idx >= 0 && idx < seq.length - 1) ? seq[idx + 1] : '';
    $('fNext').textContent = next ? 'Avançar: ' + next : (o.status === 'Concluído' ? 'Pedido concluído ✓' : 'Pedido cancelado');
    $('fNext').disabled = !next;
    $('fNext').onclick = function () { advance(o.id, next, seq[idx]); };
    $('fConfirmPay').style.display = o.status === 'Cancelado' ? 'none' : '';
    $('fPayWrap').classList.add('hidden');
    $('fCancelWrap').classList.add('hidden');
    $('fPayMethod').value = o.paymentConfirmed || o.paymentRequested || 'PIX';
    $('fCancelReason').value = '';
    $('fConfirmPay').onclick = function () { $('fPayWrap').classList.toggle('hidden'); };
    $('fPaySave').onclick = async function () {
      var r = await S.updateOrderStatus(id, o.status, { paymentConfirmed: $('fPayMethod').value, paymentStatus: 'Pago', by: 'Funcionário' });
      if (r.ok) { toast('Pagamento confirmado: ' + $('fPayMethod').value + whatsappStatusSuffix(r)); refresh(); $('fOrderDialog').close(); } else toast(r.error, 'error');
    };
    $('fCancel').onclick = function () { $('fCancelWrap').classList.toggle('hidden'); };
    $('fCancelSave').onclick = async function () {
      var reason = $('fCancelReason').value;
      if (!reason) return toast('Selecione o motivo do cancelamento.', 'error');
      var r = await S.updateOrderStatus(id, 'Cancelado', { cancelReason: reason, paymentStatus: 'Não pago', by: 'Funcionário' });
      if (r.ok) { toast('Pedido cancelado — estoque devolvido.' + whatsappStatusSuffix(r)); refresh(); $('fOrderDialog').close(); } else toast(r.error, 'error');
    };
    $('fAudit').innerHTML = (o.statusHistory || []).length ? (o.statusHistory || []).map(function (h) {
      return '<div class="au"><span class="dotw"></span><span>' + E(h.status) + (h.by ? ' <small style="color:var(--muted)">· ' + E(h.by) + '</small>' : '') + '</span><small>' + dt(h.at) + '</small></div>';
    }).join('') : '<div class="au"><span class="dotw"></span><span>Pedido recebido</span></div>';
    $('fOrderDialog').showModal();
  }
  async function advance(id, next, from) {
    var msg = from === 'Em separação' ? 'Confirmar "' + next + '"?' : 'Avançar para "' + next + '"?';
    var r = await S.updateOrderStatus(id, next, { by: 'Funcionário' });
    if (r.ok) {
      var note = next === 'Concluído' ? ' — 1 ponto atribuído ao cliente' : '';
      toast('Status atualizado: ' + next + note + whatsappStatusSuffix(r));
      refresh(); $('fOrderDialog').close();
    } else toast(r.error, 'error');
  }
  $('fCloseOrder').onclick = function () { $('fOrderDialog').close(); };

  function renderStock() {
    var q = ($('sSearch').value || '').toLowerCase().trim(), f = $('sFilter').value;
    var list = products.filter(function (p) {
      var low = Number(p.stock) <= Number(p.minStock || 0), out = Number(p.stock) <= 0;
      if (f === 'low' && !low) return false;
      if (f === 'out' && !out) return false;
      if (!q) return true;
      return p.name.toLowerCase().indexOf(q) >= 0;
    });
    $('stockRows').innerHTML = list.map(function (p) {
      var out = Number(p.stock) <= 0;
      return '<tr><td class="strong">' + E(p.name) + '<br><small style="color:var(--muted)">' + E(p.category || '') + '</small></td>' +
        '<td><b>' + p.stock + '</b> un.</td><td>' + p.minStock + '</td>' +
        '<td><div class="qty"><button data-stock-d="' + p.id + '">−</button><b>' + p.stock + '</b><button data-stock-u="' + p.id + '">+</button></div></td>' +
        '<td>' + (p.active === false ? badge('Indisponível') : out ? badge('Esgotado') : badge('Disponível')) + ' <button class="btn outline" data-toggle-stock="' + p.id + '" style="margin-left:8px">' + (p.active === false ? 'Reativar' : 'Indisponibilizar') + '</button></td></tr>';
    }).join('');
    document.querySelectorAll('[data-stock-u]').forEach(function (b) { b.onclick = function () { adjustStock(b.dataset.stockU, 1); }; });
    document.querySelectorAll('[data-stock-d]').forEach(function (b) { b.onclick = function () { adjustStock(b.dataset.stockD, -1); }; });
    document.querySelectorAll('[data-toggle-stock]').forEach(function (b) {
      b.onclick = function () { var p = products.find(function (x) { return String(x.id) === String(b.dataset.toggleStock); }); if (!p) return; p.active = p.active === false; S.saveProducts(products); refresh(); toast('Disponibilidade atualizada.'); };
    });
  }
  function adjustStock(id, d) {
    var p = products.find(function (x) { return String(x.id) === String(id); });
    if (!p) return;
    var n = Number(p.stock) + d;
    if (n < 0) return toast('Estoque não pode ficar negativo.', 'error');
    p.stock = n; S.saveProducts(products); refresh();
  }
  $('sSearch').oninput = renderStock; $('sFilter').onchange = renderStock;

  window.addEventListener('load', function () { Promise.resolve(S.ready ? S.ready() : true).then(initAuth).catch(function(e){ console.error(e); $('loginError').textContent='Falha ao conectar ao banco de dados.'; }); });
})();
