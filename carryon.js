// GTR carry-on badge.
// Any product tagged "carry-on" in Shopify gets a small carry-on case icon next to its name on its card,
// wherever the card appears, plus a line on its product page. Tag or untag in Shopify;
// no site change needed. Loaded on every page by gtr-controls.js.
(function () {
  if (window.__gtrCarryOn) return; window.__gtrCarryOn = true;
  var TAG = 'carry-on';
  var API = 'https://muq7w3-im.myshopify.com/api/2025-01/graphql.json';
  var TOKEN = 'c6efa00d9c5d9849c6c13d59cca6ab82';
  var ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 6V3.5h5V6"/><rect x="6" y="6" width="12" height="13" rx="2"/><path d="M10 9.5v6M14 9.5v6"/><circle cx="9" cy="20.5" r="1"/><circle cx="15" cy="20.5" r="1"/></svg>';
  var known = {};      // handle -> true/false once looked up
  var pending = {};    // handle -> true while a lookup is in flight

  var css = document.createElement('style');
  css.textContent =
    '.co-badge{position:absolute;left:10px;top:10px;z-index:2;width:28px;height:28px;border-radius:50%;' +
    'display:flex;align-items:center;justify-content:center;background:rgba(246,246,243,.94);color:#5D643A;' +
    'border:1px solid rgba(93,100,58,.4);}' +
    '.co-host{position:relative;}' +
    '.co-inline{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;margin-left:8px;' +
    'vertical-align:.12em;flex:none;color:#5D643A;border:1px solid rgba(93,100,58,.4);background:#F6F6F3;}' +
    '.co-inline svg{width:11px;height:11px;}' +
    '.co-pdp{display:flex;align-items:center;gap:8px;margin-top:10px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;' +
    'letter-spacing:.1em;text-transform:uppercase;color:inherit;opacity:.82;}' +
    '.co-pdp .co-inline{width:24px;height:24px;margin-left:0;} .co-pdp .co-inline svg{width:13px;height:13px;}';
  document.head.appendChild(css);

  function handleOf(el) {
    var h = el.getAttribute('data-handle') || el.getAttribute('data-st-handle');
    if (h) return h;
    var a = el.tagName === 'A' ? el : el.querySelector('a[href*="/products/"]');
    var m = a && (a.getAttribute('href') || '').match(/\/products\/([a-z0-9-]+)/);
    return m ? m[1] : null;
  }

  function cards() {
    return [].slice.call(document.querySelectorAll(
      '.pcard, .set, .st-card, .gp-card, .product-card, .kit-items li, [data-handle]'
    )).filter(function (el) { return !el.closest('.co-skip'); });
  }

  function badge(el) {
    if (el.querySelector('.co-inline')) return;
    // the icon sits right after the product name, never on the photo
    var n = el.querySelector('.pcard-name, .set-name, .st-name, .gp-name, .card-name, .kit-name, .product-name, h3, h4');
    if (!n) return;
    var s = document.createElement('span');
    s.className = 'co-inline'; s.title = 'Carry-on size';
    s.setAttribute('role', 'img'); s.setAttribute('aria-label', 'Carry-on size');
    s.innerHTML = ICON;
    var sub = n.querySelector('small');               // names with a sub-line: keep the icon on the name line
    if (sub) n.insertBefore(s, sub); else n.appendChild(s);
  }

  function pdp() {
    var m = location.pathname.match(/^\/products\/([a-z0-9-]+)\/?$/);
    var h = m ? m[1] : new URLSearchParams(location.search).get('handle');
    return h;
  }

  function paint() {
    cards().forEach(function (el) {
      if (el.matches('.st-feature')) return;         // big starter blocks stay clean
      var h = handleOf(el); if (h && known[h]) badge(el);
    });
    var h = pdp(), sub = document.getElementById('product-subtitle');
    if (h && known[h] && sub && !document.querySelector('.co-pdp')) {
      var d = document.createElement('div'); d.className = 'co-pdp';
      d.innerHTML = '<span class="co-inline">' + ICON + '</span><span>Carry-on size \u00b7 clears security</span>';
      sub.parentNode.insertBefore(d, sub.nextSibling);
    }
  }

  function lookup() {
    var hs = [];
    cards().forEach(function (el) { var h = handleOf(el); if (h && !(h in known) && !pending[h] && hs.indexOf(h) < 0) hs.push(h); });
    var p = pdp(); if (p && !(p in known) && !pending[p] && hs.indexOf(p) < 0) hs.push(p);
    if (!hs.length) { paint(); return; }
    for (var i = 0; i < hs.length; i += 40) (function (batch) {
      batch.forEach(function (h) { pending[h] = true; });
      var q = 'query{' + batch.map(function (h, k) { return 'p' + k + ':product(handle:' + JSON.stringify(h) + '){tags}'; }).join(' ') + '}';
      fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN }, body: JSON.stringify({ query: q }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          batch.forEach(function (h, k) {
            var pr = j.data && j.data['p' + k];
            known[h] = !!(pr && (pr.tags || []).some(function (t) { return t.toLowerCase() === TAG; }));
            delete pending[h];
          });
          paint();
        })
        .catch(function () { batch.forEach(function (h) { delete pending[h]; }); });
    })(hs.slice(i, i + 40));
  }

  var t;
  function soon() { clearTimeout(t); t = setTimeout(lookup, 250); }
  function start() {
    [].slice.call(document.querySelectorAll('.co-legend')).forEach(function (el) { el.innerHTML = ICON; });
    lookup();
    if ('MutationObserver' in window) new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
