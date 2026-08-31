/* Identidade visual dinâmica da empresa — aplicada em todas as áreas. */
(function () {
  'use strict';
  function applyBranding() {
    if (!window.NFStore) return;
    var info = window.NFStore.getInfo ? window.NFStore.getInfo() : {};
    var name = String(info.name || 'Natal Farma').trim() || 'Natal Farma';
    var logo = info.logo || '';
    var slogan = String(info.slogan || '').trim();

    document.querySelectorAll('img').forEach(function (img) {
      var src = img.getAttribute('src') || '';
      if (src.indexOf('logo-natal-farma.png') >= 0 || img.hasAttribute('data-company-logo')) {
        if (!img.dataset.defaultLogo) img.dataset.defaultLogo = src;
        img.src = logo || img.dataset.defaultLogo;
        img.alt = name;
        img.setAttribute('data-company-logo', '');
      }
    });

    document.querySelectorAll('[data-company-name]').forEach(function (el) { el.textContent = name; });
    document.querySelectorAll('[data-company-slogan]').forEach(function (el) { el.textContent = slogan; });

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var nodes = [], node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (n) {
      if (n.nodeValue && n.nodeValue.indexOf('Natal Farma') >= 0) n.nodeValue = n.nodeValue.replace(/Natal Farma/g, name);
    });

    document.querySelectorAll('[alt],[title],[aria-label]').forEach(function (el) {
      ['alt','title','aria-label'].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (v && v.indexOf('Natal Farma') >= 0) el.setAttribute(attr, v.replace(/Natal Farma/g, name));
      });
    });
    if (document.title.indexOf('Natal Farma') >= 0) document.title = document.title.replace(/Natal Farma/g, name);
  }
  window.NFBranding = { apply: applyBranding };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyBranding); else applyBranding();
  window.addEventListener('storage', function (e) { if (e.key === 'nf_v7_info') applyBranding(); });
})();
