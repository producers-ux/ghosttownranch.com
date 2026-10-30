// GTR carry-on badge.
// Any product tagged "carry-on" in Shopify gets a small CARRY-ON badge on its card,
// wherever the card appears, plus a line on its product page. Tag or untag in Shopify;
// no site change needed. Loaded on every page by gtr-controls.js.
(function () {
  if (window.__gtrCarryOn) return; window.__gtrCarryOn = true;
  var TAG = 'carry-on';
  var API = 'https://muq7w3-im.myshopify.com/api/2025-01/graphql.json';
  var TOKEN = 'c6efa00d9c5d9849c6c13d59cca6ab82';
  var known = {};      // handle -> true/false once looked up
  var pending = {};    // handle -> true while a lookup is in flight

  var css = document.createElement('style');
  css.textContent =
    '.co-badge{position:absolute;left:10px;top:10px;z-index:2;font-family:"JetBrains Mono",ui-monospace,monospace;' +
    'font-size:9.5px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;line-height:1;padding:5px 7px 4px;' +
    'background:rgba(246,246,243,.94);color:#5D643A;border:1px solid rgba(93,100,58,.45);pointer-events:none;}' +
    '.co-host{position:relative;}' +
    '.co-inline{display:inline-block;margin-top:8px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:10px;' +
    'letter-spacing:.14em;text-transform:uppercase;color:#5D643A;border:1px solid rgba(93,100,58,.45);padding:5px 8px 4px;}' +
    '.co-pdp{margin-top:10px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.1em;' +
    'text-transform:uppercase;color:#5D643A;}';
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
    if (el.querySelector('.co-badge, .co-inline')) return;
    if (el.matches('.kit-items li')) {               // small list rows: inline tag after the name
      var n = el.querySelector('.kit-name');
      if (n) { var s = document.createElement('span'); s.className = 'co-inline'; s.textContent = 'Carry-on'; s.style.marginTop = '4px'; s.style.display = 'table'; n.appendChild(s); }
      return;
    }
    var host = el.querySelector('.pcard-img, .set-img, .gp-img, .card-img') || (el.querySelector('img') || {}).parentNode;
    if (!host || host === document) return;
    host.classList.add('co-host');
    var b = document.createElement('span'); b.className = 'co-badge'; b.textContent = 'Carry-on';
    host.appendChild(b);
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
      d.textContent = '✦ Carry-on size · clears security';
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
    lookup();
    if ('MutationObserver' in window) new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
