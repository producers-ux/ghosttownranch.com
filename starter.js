// Starter sets: live price + "Add the set" for the Shopify bundle products.
// Markup: any element with data-st-handle="<bundle handle>".
//   .st-price b / s  -> filled with the bundle's price / compare-at price
//   .st-add          -> adds the bundle (picked variant if a .st-pick group is present)
// If a bundle isn't published yet, its button reads "Coming soon" and stays disabled.
(function () {
  var SHOP = 'muq7w3-im.myshopify.com', TOKEN = 'c6efa00d9c5d9849c6c13d59cca6ab82';
  var els = [].slice.call(document.querySelectorAll('[data-st-handle]'));
  if (!els.length) return;
  var handles = [];
  els.forEach(function (e) { var h = e.getAttribute('data-st-handle'); if (handles.indexOf(h) < 0) handles.push(h); });
  var q = 'query{' + handles.map(function (h, i) {
    return 'p' + i + ':product(handle:' + JSON.stringify(h) + '){ availableForSale variants(first:20){ nodes{ id title availableForSale price{ amount } compareAtPrice{ amount } } } }';
  }).join(' ') + '}';
  function money(n) { n = Number(n); return '$' + (n % 1 ? n.toFixed(2) : n.toFixed(0)); }

  els.forEach(function (box) {
    var pick = box.querySelector('.st-pick');
    if (!pick) return;
    pick.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      [].forEach.call(pick.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var lbl = box.querySelector('.st-pick-label'); if (lbl) lbl.textContent = b.textContent;
    });
  });

  fetch('https://' + SHOP + '/api/2025-01/graphql.json', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
    body: JSON.stringify({ query: q })
  }).then(function (r) { return r.json(); }).then(function (j) {
    var D = {}; handles.forEach(function (h, i) { D[h] = j.data && j.data['p' + i]; });
    els.forEach(function (box) {
      var p = D[box.getAttribute('data-st-handle')];
      var btn = box.querySelector('.st-add');
      if (!p || !p.availableForSale) {
        if (btn) { btn.disabled = true; btn.textContent = 'Coming soon'; }
        return;
      }
      var v0 = p.variants.nodes.filter(function (v) { return v.availableForSale; })[0] || p.variants.nodes[0];
      var b = box.querySelector('.st-price b'), s = box.querySelector('.st-price s');
      if (b && v0) b.textContent = money(v0.price.amount);
      if (s && v0 && v0.compareAtPrice) s.textContent = money(v0.compareAtPrice.amount);
      if (!btn) return;
      btn.disabled = false;
      btn.addEventListener('click', function () {
        var pick = box.querySelector('.st-pick button[aria-pressed="true"]');
        var want = pick ? pick.getAttribute('data-value') : null;
        var v = want ? p.variants.nodes.filter(function (x) { return x.title === want; })[0] : v0;
        if (!v || !v.availableForSale) { btn.textContent = 'Sold out'; return; }
        if (!window.GTRCart) return;
        var label = btn.textContent; btn.disabled = true; btn.textContent = 'Adding…';
        GTRCart.addVariant(v.id, 1).then(function (ok) {
          btn.disabled = false; btn.textContent = ok ? label : 'Try again';
        });
      });
    });
  }).catch(function () {});
})();

// What's-packed photo grid: <li data-pk-handle="product" data-pk-variant="Charcoal"> gets that product's
// (or that variant's) photo from Shopify, so new visitors can see exactly what's in a set.
(function () {
  var SHOP = 'muq7w3-im.myshopify.com', TOKEN = 'c6efa00d9c5d9849c6c13d59cca6ab82';
  var lis = [].slice.call(document.querySelectorAll('[data-pk-handle]'));
  if (!lis.length) return;
  var hs = [];
  lis.forEach(function (l) { var h = l.getAttribute('data-pk-handle'); if (hs.indexOf(h) < 0) hs.push(h); });
  var q = 'query{' + hs.map(function (h, i) {
    return 'p' + i + ':product(handle:' + JSON.stringify(h) + '){ title featuredImage{ url } variants(first:20){ nodes{ title image{ url } } } }';
  }).join(' ') + '}';
  function sized(u) { return u + (u.indexOf('?') < 0 ? '?' : '&') + 'width=400'; }
  fetch('https://' + SHOP + '/api/2025-01/graphql.json', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
    body: JSON.stringify({ query: q })
  }).then(function (r) { return r.json(); }).then(function (j) {
    lis.forEach(function (l) {
      var p = j.data && j.data['p' + hs.indexOf(l.getAttribute('data-pk-handle'))]; if (!p) return;
      var want = (l.getAttribute('data-pk-variant') || '').toLowerCase(), url = null;
      if (want) (p.variants.nodes || []).forEach(function (v) { if (!url && v.image && v.title.toLowerCase().indexOf(want) > -1) url = v.image.url; });
      if (!url && p.featuredImage) url = p.featuredImage.url;
      var box = l.querySelector('.st-th-img');
      if (url && box && !box.firstChild) box.innerHTML = '<img src="' + sized(url) + '" alt="' + p.title.replace(/"/g, '&quot;') + '" loading="lazy">';
    });
  }).catch(function () {});
})();
