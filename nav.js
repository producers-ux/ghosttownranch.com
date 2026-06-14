/* Ghost Town Ranch — shared site navigation.
   Renders the canonical top nav (matches the homepage) and loads on every page
   except the homepage, which keeps its own app-wired nav.
   Drop into any page with:  <script defer src="/nav.js"></script>  */
(function () {
  var LOGO = '/ghost_town_ranch_bull_icon_filled_in_army_7c82d02c-6e27-47d3-9500-d2054537d8f0.png';
  var CART_KEY = 'gtr_cart_v2';

  // ── Ensure fonts (no-op if the page already loads them) ──
  function ensureFont(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
  }
  ensureFont('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Jost:wght@300;400;500&display=swap');

  // ── Styles ──
  var css = '' +
  '#gtrnav{position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;align-items:center;justify-content:space-between;padding:14px 48px;background:rgba(28,24,20,0.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-family:"Jost",system-ui,sans-serif;}' +
  '#gtrnav a{text-decoration:none;}' +
  '#gtrnav .gtrnav-logo img{height:28px;width:auto;display:block;}' +
  '#gtrnav .gtrnav-links{display:flex;align-items:center;gap:30px;list-style:none;margin:0;padding:0;}' +
  '#gtrnav .gtrnav-links > li{position:relative;display:flex;align-items:center;}' +
  '#gtrnav .gtrnav-links a,#gtrnav .gtrnav-toggle{font-family:"Jost",system-ui,sans-serif;font-size:11px;font-weight:400;letter-spacing:0.18em;text-transform:uppercase;color:#F4EFE6;opacity:0.82;background:none;border:0;cursor:pointer;padding:0;transition:opacity .2s;display:flex;align-items:center;gap:6px;}' +
  '#gtrnav .gtrnav-links a:hover,#gtrnav .gtrnav-toggle:hover{opacity:1;}' +
  '#gtrnav .gtrnav-links a.current{opacity:1;border-bottom:1px solid #9B7A3F;padding-bottom:3px;}' +
  '#gtrnav .gtrnav-chev{width:8px;height:8px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(45deg);margin-top:-3px;transition:transform .2s;}' +
  '#gtrnav .gtrnav-dd.open .gtrnav-chev{transform:rotate(-135deg);margin-top:2px;}' +
  '#gtrnav .gtrnav-menu{position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%);min-width:180px;background:rgba(28,24,20,0.96);border:1px solid rgba(244,239,230,0.14);padding:10px 0;display:none;flex-direction:column;}' +
  '#gtrnav .gtrnav-dd.open .gtrnav-menu{display:flex;}' +
  '#gtrnav .gtrnav-menu a{padding:9px 22px;letter-spacing:0.14em;white-space:nowrap;}' +
  '#gtrnav .gtrnav-right{display:flex;align-items:center;gap:22px;}' +
  '#gtrnav .gtrnav-cart{position:relative;background:none;border:0;cursor:pointer;color:#F4EFE6;opacity:0.9;display:flex;align-items:center;transition:opacity .2s;}' +
  '#gtrnav .gtrnav-cart:hover{opacity:1;}' +
  '#gtrnav .gtrnav-badge{position:absolute;top:-7px;right:-9px;min-width:16px;height:16px;padding:0 4px;border-radius:9px;background:#9B7A3F;color:#F4EFE6;font-family:"Jost",sans-serif;font-size:10px;line-height:16px;text-align:center;display:none;}' +
  '#gtrnav .gtrnav-burger{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;}' +
  '#gtrnav .gtrnav-burger span{display:block;width:22px;height:1px;background:#F4EFE6;}' +
  '#gtr-trigger{display:none !important;}' + /* hide the floating cart trigger; nav cart replaces it */
  '@media(max-width:860px){' +
    '#gtrnav{padding:14px 22px;}' +
    '#gtrnav .gtrnav-burger{display:flex;}' +
    '#gtrnav .gtrnav-links{display:none;position:absolute;top:56px;right:22px;background:rgba(28,24,20,0.97);border:1px solid rgba(244,239,230,0.14);flex-direction:column;align-items:flex-start;gap:18px;padding:22px 26px;}' +
    '#gtrnav .gtrnav-links.open{display:flex;}' +
    '#gtrnav .gtrnav-menu{position:static;transform:none;border:0;background:none;padding:6px 0 0 14px;}' +
  '}';
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ── Markup ──
  var path = location.pathname.replace(/\/+$/, '/');
  function cur(test){ return test ? ' current' : ''; }
  var onRoutines = /\/routines\/?$/.test(location.pathname);
  var onRitual   = /\/ritual\/?$/.test(location.pathname);
  var onDeepWell = /\/collections\/deep-well\/?$/.test(location.pathname);

  var nav = document.createElement('nav');
  nav.id = 'gtrnav';
  nav.setAttribute('aria-label', 'Main navigation');
  nav.innerHTML = '' +
    '<a class="gtrnav-logo" href="/" aria-label="Ghost Town Ranch home"><img src="' + LOGO + '" alt="Ghost Town Ranch"></a>' +
    '<div class="gtrnav-right">' +
      '<ul class="gtrnav-links" id="gtrnav-links">' +
        '<li><a href="/">Home</a></li>' +
        '<li class="gtrnav-dd" id="gtrnav-shop">' +
          '<button class="gtrnav-toggle" aria-haspopup="true" aria-expanded="false">Shop <i class="gtrnav-chev"></i></button>' +
          '<div class="gtrnav-menu" role="menu">' +
            '<a href="/#shop-fragrance" role="menuitem">Fragrance + Home</a>' +
            '<a href="/#shop-skin" role="menuitem">Body + Skin</a>' +
            '<a href="/collections/deep-well/" role="menuitem">Deep Well &middot; New</a>' +
            '<a href="/#shop-all" role="menuitem">Shop All</a>' +
          '</div>' +
        '</li>' +
        '<li><a class="' + cur(onRoutines).trim() + '" href="/routines/">Routines</a></li>' +
        '<li><a class="' + cur(onRitual).trim() + '" href="/ritual/">Ritual</a></li>' +
        '<li><a class="' + cur(onDeepWell).trim() + '" href="/collections/deep-well/">Deep Well</a></li>' +
        '<li><a href="/#wholesale">Wholesale</a></li>' +
      '</ul>' +
      '<button class="gtrnav-cart" id="gtrnav-cart" aria-label="Open cart">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
        '<span class="gtrnav-badge" id="gtrnav-badge">0</span>' +
      '</button>' +
      '<button class="gtrnav-burger" id="gtrnav-burger" aria-label="Toggle menu"><span></span><span></span><span></span></button>' +
    '</div>';
  document.body.insertBefore(nav, document.body.firstChild);

  // ── Dropdown ──
  var shop = document.getElementById('gtrnav-shop');
  var toggle = shop.querySelector('.gtrnav-toggle');
  toggle.addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    var open = shop.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) {
    if (!shop.contains(e.target)) { shop.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
  });

  // ── Mobile ──
  var burger = document.getElementById('gtrnav-burger');
  var links = document.getElementById('gtrnav-links');
  burger.addEventListener('click', function () { links.classList.toggle('open'); });

  // ── Cart ──
  function loadCartJs(cb) {
    if (window.GTRCart) { cb && cb(); return; }
    var existing = document.querySelector('script[src$="cart.js"]');
    if (existing) { existing.addEventListener('load', function(){ cb && cb(); }); return; }
    var s = document.createElement('script'); s.src = '/cart.js';
    s.onload = function () { cb && cb(); };
    document.body.appendChild(s);
  }
  document.getElementById('gtrnav-cart').addEventListener('click', function () {
    if (window.GTRCart && GTRCart.open) { GTRCart.open(); }
    else if (typeof window.openCart === 'function') { window.openCart(); }
    else { loadCartJs(function () { if (window.GTRCart && GTRCart.open) GTRCart.open(); }); }
  });

  // Preload the shared cart on pages that have no cart system, so the icon works.
  if (!window.GTRCart && typeof window.openCart !== 'function') { loadCartJs(); }

  // ── Badge ──
  var badge = document.getElementById('gtrnav-badge');
  function syncBadge() {
    var n = 0;
    try {
      var raw = localStorage.getItem(CART_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && Array.isArray(p.items)) n = p.items.reduce(function (s, i) { return s + (i.qty || 0); }, 0);
      }
    } catch (e) {}
    if (n > 0) { badge.textContent = n; badge.style.display = 'block'; }
    else { badge.style.display = 'none'; }
  }
  syncBadge();
  window.addEventListener('storage', syncBadge);
  window.addEventListener('focus', syncBadge);
  window.addEventListener('pageshow', syncBadge);
})();
