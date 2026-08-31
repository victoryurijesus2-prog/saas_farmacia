/* Natal Farma V7 — área do cliente: login, perfil, pontos e histórico com linha do tempo */
(function () {
  'use strict';
  var S = window.NFStore, Sec = window.NFSecurity, E = Sec.escape;
  var $ = function (id) { return document.getElementById(id); };
  var state = { cust: null, guestPhone: '' };

  var brl = function (v) { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
  var dt = function (v) { return v ? new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'; };

  function matches(a, b) {
    function norm(x) { return String(x || '').replace(/\D/g, ''); }
    var pa = norm(a.phone), pb = norm(b.phone), ea = String(a.email || '').toLowerCase(), eb = String(b.email || '').toLowerCase();
    return (pa && pb && pa === pb) || (ea && eb && ea === eb);
  }

  function toast(t, type) { var d = document.createElement('div'); d.className = 'toast' + (type === 'error' ? ' toast-error' : ''); d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.classList.add('show'); }, 10); setTimeout(function () { d.remove(); }, 2600); }

  function badgeClass(v) {
    if (['Concluído', 'Pago'].indexOf(v) >= 0) return 'green';
    if (['Pedido recebido', 'Aguardando pagamento', 'Pagamento confirmado', 'Em separação', 'Pronto', 'Pendente'].indexOf(v) >= 0) return 'yellow';
    if (v === 'Saiu para entrega') return 'blue';
    if (['Cancelado', 'Não pago'].indexOf(v) >= 0) return 'red';
    return 'gray';
  }
  function badge(v) { return '<span class="badge ' + badgeClass(v) + '">' + E(v) + '</span>'; }
  function pill(v) { return '<span class="pill ' + badgeClass(v) + '">' + E(v) + '</span>'; }

  function myOrders() {
    var all = S.getOrders();
    if (state.cust) return all.filter(function (o) { return matches(o.customer, state.cust); });
    return all.filter(function (o) { return matches(o.customer, { phone: state.guestPhone }); });
  }

  function resolveCustomer() {
    var customers = S.getCustomers();
    var u = S.currentUser();
    var probe = state.cust || (u ? { email: u.email, phone: u.phone } : { phone: state.guestPhone });
    var found = customers.find(function (c) { return matches(c, probe); });
    if (!found && u && u.email) {
      found = { id: S.nextId(S.K.customerSeq), name: u.name || 'Cliente', email: u.email, phone: u.phone || '', address: '', points: 0, ordersCount: 0, totalSpent: 0, profile: 'novo' };
      customers.push(found); S.saveCustomers(customers);
    }
    state.cust = found;
    return found;
  }

  function render() {
    var cust = resolveCustomer();
    var ords = myOrders().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    var done = ords.filter(function (o) { return o.status === 'Concluído'; });
    var spent = done.reduce(function (s, o) { return s + Number(o.total); }, 0);
    var pts = cust && cust.points != null && cust.points > 0 ? cust.points : done.length;
    var last = ords[0];

    $('userChip').textContent = '● ' + (cust ? cust.name : 'Cliente');
    var first = cust ? (cust.name || '').split(' ')[0] : 'Olá!';
    $('greeting').textContent = 'Olá, ' + E(first) + '!';
    $('welcomeSub').textContent = state.guestPhone ? 'Consulta rápida para ' + E(state.guestPhone) + ' — seus pedidos abaixo.' : 'Acompanhe seus pedidos e pontos de fidelidade em um só lugar.';
    $('cPoints').textContent = pts;
    $('cOrders').textContent = ords.length;
    $('cSpent').textContent = brl(spent);
    $('cLast').textContent = last ? last.number : '—';

    $('pName').value = cust.name || ''; $('pPhone').value = cust.phone || '';
    $('pEmail').value = cust.email || ''; $('pAddress').value = cust.address || '';

    var i = S.getInfo();
    $('contactCard').innerHTML =
      '<div class="cc"><span>WhatsApp</span><b><a href="https://wa.me/55' + (i.whatsapp || '').replace(/\D/g, '') + '" target="_blank" rel="noopener">' + E(i.whatsapp || '—') + '</a></b></div>' +
      '<div class="cc"><span>Endereço</span><b>' + E(i.address || '—') + '</b></div>' +
      '<div class="cc"><span>Horários</span><b>' + E(i.hoursWeek || '—') + '</b></div>' +
      '<div class="cc"><span>Dom./feriados</span><b>' + E(i.hoursSunday || '—') + '</b></div>';

    $('orderList').innerHTML = ords.length ? ords.map(function (o) {
      return '<div class="order-card">' +
        '<div class="oc-head"><div><b>' + E(o.number) + '</b><small>' + dt(o.createdAt) + ' · ' + E(o.deliveryMode === 'entrega' ? 'Entrega · ' + (o.zone || '') : 'Retirada na loja') + '</small></div>' + badge(o.status) + '</div>' +
        '<div class="oc-body">' +
        '<div class="oc-items">' + o.items.map(function (it) { return '<div><span>' + E(it.name) + ' <small>×' + it.qty + '</small></span><b>' + brl(it.price * it.qty) + '</b></div>'; }).join('') +
        (o.discount ? '<div class="disc"><span>Cupom aplicado</span><b>−' + brl(o.discount) + '</b></div>' : '') +
        '<div class="oc-total"><span>Total</span><b>' + brl(o.total) + '</b></div></div>' +
        '<div class="oc-foot"><span class="pay">💳 ' + E(o.paymentConfirmed || o.paymentRequested || '—') + (o.paymentStatus && o.paymentStatus !== 'Pendente' ? ' · ' + E(o.paymentStatus) : '') + '</span><button class="btn outline" data-toggle-order="' + o.id + '">Ver detalhes</button></div>' +
        '<div class="oc-detail hidden" id="od-' + o.id + '"><div class="timeline">' + timeline(o) + '</div>' +
        (o.status === 'Cancelado' && o.cancelReason ? '<p class="cancel-note">Cancelado: ' + E(o.cancelReason) + '</p>' : '') +
        '</div></div>';
    }).join('') : '<div class="empty-state"><b>Nenhum pedido ainda</b><span>Faça seu primeiro pedido na loja e ele aparecerá aqui.</span></div>';

    document.querySelectorAll('[data-toggle-order]').forEach(function (b) {
      b.onclick = function () {
        var d = $('od-' + b.dataset.toggleOrder);
        if (d) d.classList.toggle('hidden');
        b.textContent = d && !d.classList.contains('hidden') ? 'Ocultar detalhes' : 'Ver detalhes';
      };
    });
  }

  function timeline(o) {
    var seq = ['Pedido recebido', 'Aguardando pagamento', 'Pagamento confirmado', 'Em separação', 'Pronto', 'Saiu para entrega', 'Concluído'];
    var hist = (o.statusHistory || []).slice();
    if (o.status === 'Concluído' && !hist.some(function (h) { return h.status === 'Concluído'; })) hist.push({ status: 'Concluído', at: new Date().toISOString() });
    if (o.status === 'Cancelado' && !hist.some(function (h) { return h.status === 'Cancelado'; })) hist.push({ status: 'Cancelado', at: new Date().toISOString() });
    if (!hist.length) hist = [{ status: o.status, at: o.createdAt }];
    return hist.map(function (h) {
      return '<div class="tl"><i class="dot ' + badgeClass(h.status) + '"></i><span>' + E(h.status) + (h.by ? ' <small>· ' + E(h.by) + '</small>' : '') + (h.note ? '<small style="display:block;margin-top:3px">' + E(h.note) + '</small>' : '') + '</span><small>' + dt(h.at) + '</small></div>';
    }).join('');
  }

  function setup() {
    $('login').classList.add('hidden');
    $('app').classList.remove('hidden');
    $('logout').textContent = state.guestPhone ? 'Nova consulta' : 'Sair';
    render();
  }

  function initAuth() {
    var u = S.currentUser();
    if (u) {
      if (u.role === 'admin') { location.href = '../admin/'; return; }
      if (u.role === 'employee') { location.href = '../funcionario/'; return; }
      setup();
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
        if (r.user.role === 'employee') { location.href = '../funcionario/'; return; }
        setup();
      });
    };
    $('quickBtn').onclick = function () {
      var ph = $('phone').value.trim();
      if (!ph) { $('loginError').textContent = 'Informe o telefone usado no pedido.'; return; }
      var c = S.findCustomerByPhone(ph);
      if (!c) { $('loginError').textContent = 'Nenhum cliente encontrado com esse telefone.'; return; }
      state.guestPhone = ph; setup();
    };
  }

  $('logout').onclick = function () {
    if (state.guestPhone) { location.reload(); return; }
    S.logout(); location.reload();
  };

  $('profileForm').onsubmit = function (ev) { if (ev) ev.preventDefault();
    var name = $('pName').value.trim(), phone = $('pPhone').value.trim();
    if (!name || !phone) { toast('Informe nome e telefone.', 'error'); return; }
    var customers = S.getCustomers();
    var c = customers.find(function (x) { return matches(x, state.cust); });
    var updated = false;
    if (c) { c.name = name; c.phone = phone; c.email = $('pEmail').value.trim(); c.address = $('pAddress').value.trim(); updated = true; }
    else { state.cust.name = name; state.cust.phone = phone; state.cust.email = $('pEmail').value.trim(); state.cust.address = $('pAddress').value.trim(); customers.push(state.cust); updated = true; }
    if (updated) { S.saveCustomers(customers); toast('Dados atualizados com sucesso.'); render(); }
  };

  window.addEventListener('load', function(){ Promise.resolve(S.ready ? S.ready() : true).then(initAuth).catch(function(e){ console.error(e); $('loginError').textContent='Falha ao conectar ao banco de dados.'; }); });
})();
