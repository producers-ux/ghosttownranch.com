/* ──────────────────────────────────────────────────────────────────────────
   GTR Controls — shared nav search + cart, drop-in for every page.
   Self-styled (prefix: gtrc-) so it never depends on a page's own nav CSS.
   - Adds a SEARCH button to the nav on every page.
   - Adds a CART button wired to GTRCart, UNLESS the page already ships its own
     cart control (ritual/, products/ define openCart()), in which case it only
     adds search and leaves the existing cart alone.
   - Cart badge reads the canonical store (gtr_cart_v2) and updates live via the
     'gtr:cart-updated' event (fired by cart.js) and cross-tab 'storage' events.
   Include with:  <script src="/gtr-controls.js" defer></script>
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  if (window.__gtrControls) return;        // guard against double-loading
  window.__gtrControls = true;

  // ── SEARCH INDEX ──────────────────────────────────────────────────────────
  // Curated so results link to real URLs. Sections first, then key products.
  var INDEX = [
    // Sections
    { t: 'Ritual',           c: 'Scent + Home',   u: '/ritual/',                 k: 'candle votive diffuser fragrance scent home reed' },
    { t: 'Routines',         c: 'Skin',           u: '/routines/',               k: 'serum cream eye routine morning evening skincare face' },
    { t: 'Wash House',       c: 'At the sink',    u: '/wash-house/',             k: 'hand wash soap body cream sink' },
    { t: 'Find Your Range',  c: 'Skin Regimen',   u: '/range/',                  k: 'range archetype regimen collection scout claim landed' },
    { t: 'Field Guide',      c: 'Origin',         u: '/field-guide/',            k: 'origin philosophy frontier modernism story about' },
    { t: 'Shop the Ranch',   c: 'All Objects',    u: '/shop/',                   k: 'shop all products store browse' },
    { t: 'Wholesale',        c: 'Trade',          u: '/wholesale/',              k: 'wholesale trade stockist retailer line sheet' },
    { t: 'Deep Well',        c: 'Ingestible',     u: '/collections/deep-well/',  k: 'deep well ingestible beauty supplement the well first light last light' },

    // Wash House
    { t: 'The Wash',         c: 'Hydrating Hand Wash', u: '/products/sunbroke-the-wash-cold-pressed-grapefruit', k: 'hand wash soap grapefruit hydrating sink' },
    { t: 'The Basin',        c: 'Hand Wash + Body Cream Set', u: '/products/the-basin-hand-wash-body-cream-set-of-two-choose-your-scent', k: 'basin set bundle hand wash body cream' },
    { t: 'All Over',         c: 'Body Cream',     u: '/products/all-over-body-cream',     k: 'body cream lotion moisturizer all over' },
    { t: 'The Wash House Set', c: 'Hair + Body',  u: '/products/the-wash-house-hair-body-set', k: 'hair body set wash house bundle' },
    { t: 'Sink Tray',        c: 'Sustainable',    u: '/products/sustainable-sink-tray',   k: 'sink tray dish sustainable accessory' },

    // Ritual / Home
    { t: 'The Votive',       c: 'Fragrance + Home', u: '/products/the-votive-single',     k: 'votive candle small fragrance home wax' },
    { t: 'The Votive — Set of 6', c: 'Candle Set', u: '/products/the-votive-six',         k: 'votive set six candles gift' },
    { t: 'The Monument',     c: 'Candle',         u: '/products/the-monument-candle',     k: 'monument candle large fragrance home wax' },
    { t: 'The Wander',       c: 'Travel Candle',  u: '/products/the-wander-hand-poured-travel-candle', k: 'wander travel candle tin small' },
    { t: 'The Still',        c: 'Reed Diffuser',  u: '/products/the-still-amber-glass-reed-diffuser', k: 'still reed diffuser amber glass home fragrance' },
    { t: 'Ranch Water',      c: 'Body + Linen Mist', u: '/products/ranch-water-body-linen-fragrance', k: 'ranch water body linen mist spray fragrance' },

    // Skin / Body
    { t: 'Golden Hour',      c: 'Body Oil',       u: '/products/omega-6-9-glowing-skin-body-oil', k: 'golden hour body oil glow omega skin' },
    { t: 'Desert Glow',      c: 'Facial Oil',     u: '/products/desert-glow-hydrating-facial-oil', k: 'desert glow facial oil hydrating face' },
    { t: 'Dusk til Dawn',    c: 'Hydration Gel',  u: '/products/dusk-til-dawn-hydration-gel',     k: 'dusk dawn hydration gel moisturizer overnight' },
    { t: 'Peptide Serum',    c: 'Anti-Aging',     u: '/products/peptide-anti-aging-serum',        k: 'peptide serum anti aging face routine' },
    { t: 'Rose Cut',        c: 'Daily Facial Wash', u: '/products/rose-cut-daily-facial-wash',    k: 'rose cut facial wash cleanser face daily' },
    { t: 'Rosemary Scalp Oil', c: 'Hair + Scalp', u: '/products/rosemary-hair-scalp-strengthening-oil', k: 'rosemary scalp hair oil strengthening' },

    // The Field Kit + apparel
    { t: 'The Field Kit',    c: 'Discovery Set',  u: '/products/the-field-kit',           k: 'field kit discovery set sampler travel' },
    { t: 'GTR Tee',          c: 'Garment-Dyed',   u: '/products/gtr-unisex-tee',          k: 'tee shirt apparel unisex cotton' },
    { t: 'GTR Hoodie',       c: 'Apparel',        u: '/products/gtr-unisex-hoodie',       k: 'hoodie sweatshirt apparel unisex' }
  ];

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  function cartCount() {
    try {
      var raw = localStorage.getItem('gtr_cart_v2');
      if (!raw) return 0;
      var p = JSON.parse(raw);
      if (!p || !Array.isArray(p.items)) return 0;
      return p.items.reduce(function (s, i) { return s + (i.qty || 0); }, 0);
    } catch (e) { return 0; }
  }

  // True when the page ships its own cart control (ritual/, products/).
  function pageHasOwnCart() {
    if (typeof window.openCart === 'function') return true;
    return !!document.querySelector('#cart-btn, .nav-cart, .cart-nav-btn-open, [onclick*="openCart"]');
  }

  function openCartUI() {
    if (window.GTRCart && typeof window.GTRCart.open === 'function') return window.GTRCart.open();
    if (typeof window.openCart === 'function') return window.openCart();
    window.location.href = 'https://or-cre.com/cart';
  }

  // ── STYLES ────────────────────────────────────────────────────────────────
  var css = `
  .gtrc-tools{display:inline-flex;align-items:center;gap:6px;margin-left:22px;color:inherit;}
  .gtrc-btn{display:inline-flex;align-items:center;justify-content:center;position:relative;
    width:40px;height:40px;min-width:40px;min-height:40px;padding:0;background:none;border:none;
    cursor:pointer;color:currentColor;opacity:0.8;transition:opacity .2s;}
  .gtrc-btn:hover{opacity:1;}
  .gtrc-btn svg{width:19px;height:19px;display:block;}
  .gtrc-count{position:absolute;top:3px;right:0;min-width:15px;height:15px;padding:0 3px;
    display:none;align-items:center;justify-content:center;border-radius:8px;background:#9B7A3F;
    color:#F4EFE6;font-family:'Jost',system-ui,sans-serif;font-size:9px;font-weight:500;
    letter-spacing:0.02em;line-height:1;}
  .gtrc-count.on{display:inline-flex;}

  .gtrc-search-overlay{position:fixed;inset:0;z-index:600;display:none;
    background:rgba(26,21,18,0.55);backdrop-filter:blur(4px);}
  .gtrc-search-overlay.open{display:block;}
  .gtrc-search-panel{position:absolute;top:0;left:0;right:0;background:#F4EFE6;
    border-bottom:1px solid #1e1c18;box-shadow:0 24px 60px rgba(26,21,18,0.25);
    transform:translateY(-12px);opacity:0;transition:transform .28s ease,opacity .28s ease;
    max-height:88vh;overflow-y:auto;}
  .gtrc-search-overlay.open .gtrc-search-panel{transform:translateY(0);opacity:1;}
  .gtrc-search-inner{max-width:760px;margin:0 auto;padding:40px 32px 48px;}
  .gtrc-search-head{display:flex;align-items:center;gap:16px;
    border-bottom:1px solid rgba(30,28,24,0.25);padding-bottom:14px;}
  .gtrc-search-icon{flex-shrink:0;color:#7c8260;opacity:0.85;}
  .gtrc-search-icon svg{width:22px;height:22px;display:block;}
  .gtrc-search-input{flex:1;background:none;border:none;outline:none;
    font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:300;
    color:#1e1c18;letter-spacing:0.01em;padding:4px 0;}
  .gtrc-search-input::placeholder{color:rgba(30,28,24,0.32);}
  .gtrc-search-close{background:none;border:none;cursor:pointer;flex-shrink:0;
    font-family:'Jost',system-ui,sans-serif;font-size:10px;letter-spacing:0.22em;
    text-transform:uppercase;color:#7c8260;opacity:0.8;padding:8px;transition:opacity .2s;}
  .gtrc-search-close:hover{opacity:1;}
  .gtrc-hint{font-family:'Jost',system-ui,sans-serif;font-size:11px;letter-spacing:0.2em;
    text-transform:uppercase;color:#7c8260;opacity:0.6;margin:22px 0 10px;}
  .gtrc-results{display:flex;flex-direction:column;}
  .gtrc-result{display:flex;align-items:baseline;gap:16px;text-decoration:none;
    padding:15px 4px;border-bottom:1px solid rgba(30,28,24,0.08);transition:background .15s;}
  .gtrc-result:hover,.gtrc-result.sel{background:rgba(124,130,96,0.08);}
  .gtrc-result-name{font-family:'Cormorant Garamond',Georgia,serif;font-size:21px;
    font-weight:300;color:#1e1c18;flex:1;letter-spacing:0.01em;}
  .gtrc-result-cat{font-family:'Jost',system-ui,sans-serif;font-size:10px;letter-spacing:0.18em;
    text-transform:uppercase;color:#7c8260;opacity:0.8;white-space:nowrap;}
  .gtrc-empty{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:19px;
    color:#7c8260;padding:28px 4px;}
  @media(max-width:600px){
    .gtrc-tools{margin-left:6px;gap:2px;}
    .gtrc-search-inner{padding:24px 18px 32px;}
    .gtrc-search-head{gap:10px;padding-bottom:12px;}
    .gtrc-search-input{font-size:22px;}
    .gtrc-search-close{padding:8px 2px;letter-spacing:0.14em;}
    .gtrc-search-icon svg{width:18px;height:18px;}
    .gtrc-hint{margin:18px 0 8px;}
    .gtrc-result{padding:14px 2px;gap:12px;}
    .gtrc-result-name{font-size:18px;}
    .gtrc-result-cat{font-size:9px;letter-spacing:0.14em;}
  }`;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

  // ── SEARCH OVERLAY ────────────────────────────────────────────────────────
  var overlay = el(
    '<div class="gtrc-search-overlay" id="gtrc-search">' +
      '<div class="gtrc-search-panel">' +
        '<div class="gtrc-search-inner">' +
          '<div class="gtrc-search-head">' +
            '<span class="gtrc-search-icon">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>' +
            '</span>' +
            '<input class="gtrc-search-input" id="gtrc-input" type="text" placeholder="Search the ranch" autocomplete="off" spellcheck="false">' +
            '<button class="gtrc-search-close" id="gtrc-close">Close</button>' +
          '</div>' +
          '<div class="gtrc-hint" id="gtrc-hint">Start typing — products, scents, and pages</div>' +
          '<div class="gtrc-results" id="gtrc-results"></div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
  document.body.appendChild(overlay);

  var input   = overlay.querySelector('#gtrc-input');
  var results = overlay.querySelector('#gtrc-results');
  var hint    = overlay.querySelector('#gtrc-hint');
  var selIdx  = -1;
  var current = [];

  function score(item, q) {
    var name = item.t.toLowerCase(), cat = item.c.toLowerCase(), k = (item.k || '');
    if (name === q) return 100;
    if (name.indexOf(q) === 0) return 80;
    if (name.indexOf(q) > -1) return 60;
    if (cat.indexOf(q) > -1) return 40;
    if (k.indexOf(q) > -1) return 20;
    return 0;
  }

  function renderResults(list) {
    selIdx = -1;
    current = list;
    if (!list.length) {
      results.innerHTML = '<div class="gtrc-empty">Nothing matched. Try a scent, a product, or a section.</div>';
      return;
    }
    results.innerHTML = list.map(function (i) {
      return '<a class="gtrc-result" href="' + i.u + '">' +
        '<span class="gtrc-result-name">' + i.t + '</span>' +
        '<span class="gtrc-result-cat">' + i.c + '</span></a>';
    }).join('');
  }

  function doSearch() {
    var q = input.value.trim().toLowerCase();
    if (!q) {
      hint.textContent = 'Start typing — products, scents, and pages';
      renderResults(INDEX.slice(0, 6));   // suggest top sections/products
      return;
    }
    var matched = INDEX
      .map(function (i) { return { i: i, s: score(i, q) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .map(function (r) { return r.i; });
    hint.textContent = matched.length + ' result' + (matched.length === 1 ? '' : 's');
    renderResults(matched);
  }

  function openSearch() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    input.value = '';
    doSearch();
    setTimeout(function () { input.focus(); }, 60);
  }
  function closeSearch() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  input.addEventListener('input', doSearch);
  overlay.querySelector('#gtrc-close').addEventListener('click', closeSearch);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });

  // keyboard: Esc closes; arrows + Enter navigate results
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeSearch(); return; }
    if (!overlay.classList.contains('open')) return;
    var nodes = results.querySelectorAll('.gtrc-result');
    if (!nodes.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = Math.min(selIdx + 1, nodes.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selIdx = Math.max(selIdx - 1, 0); }
    else if (e.key === 'Enter' && selIdx > -1) { e.preventDefault(); window.location.href = current[selIdx].u; return; }
    else return;
    nodes.forEach(function (n, i) { n.classList.toggle('sel', i === selIdx); });
    nodes[selIdx].scrollIntoView({ block: 'nearest' });
  });

  // ── NAV TOOLS (search + cart) ─────────────────────────────────────────────
  function resolveMount() {
    var mount = document.querySelector('.nav-right') ||
                document.querySelector('nav') ||
                document.querySelector('.archetype-nav, #nav, header');
    return mount || null;
  }

  function buildTools() {
    var ownCart = pageHasOwnCart();

    var tools = document.createElement('div');
    tools.className = 'gtrc-tools';

    var searchBtn = el(
      '<button class="gtrc-btn" id="gtrc-search-btn" aria-label="Search">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>' +
      '</button>'
    );
    searchBtn.addEventListener('click', openSearch);
    tools.appendChild(searchBtn);

    if (!ownCart) {
      var cartBtn = el(
        '<button class="gtrc-btn" id="gtrc-cart-btn" aria-label="Cart">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' +
            '<path d="M6 8h12l-1 11a2 2 0 0 1-2 1.8H9A2 2 0 0 1 7 19L6 8z"/>' +
            '<path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>' +
          '<span class="gtrc-count" id="gtrc-cart-count">0</span>' +
        '</button>'
      );
      cartBtn.addEventListener('click', openCartUI);
      tools.appendChild(cartBtn);
    }

    var mount = resolveMount();
    if (!mount) return;

    // Match the nav's text color so icons read correctly on dark or light navs.
    try {
      var c = getComputedStyle(mount).color;
      if (c) tools.style.color = c;
    } catch (e) {}

    var ham = mount.querySelector('.nav-hamburger');
    if (ham) mount.insertBefore(tools, ham);
    else mount.appendChild(tools);

    updateBadge();
  }

  // ── CART BADGE (live) ─────────────────────────────────────────────────────
  function updateBadge() {
    var badge = document.getElementById('gtrc-cart-count');
    if (!badge) return;
    var n = cartCount();
    badge.textContent = n;
    badge.classList.toggle('on', n > 0);
  }
  window.addEventListener('gtr:cart-updated', updateBadge);
  window.addEventListener('storage', function (e) { if (e.key === 'gtr_cart_v2') updateBadge(); });

  // ── BOOT ──────────────────────────────────────────────────────────────────
  // Nav may be injected by nav.js after DOMContentLoaded, so retry briefly.
  function boot(tries) {
    if (resolveMount()) { buildTools(); return; }
    if (tries > 0) setTimeout(function () { boot(tries - 1); }, 120);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(12); });
  } else {
    boot(12);
  }
})();
