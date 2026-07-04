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
  // Sections + the full product catalog. Product entries are generated from the
  // Shopify export; regenerate this PRODUCTS block when the catalog changes.
  var INDEX = [
    // Sections / pages
    { t: 'Ritual',          c: 'Scent + Home',  u: '/ritual/',                k: 'candle votive diffuser fragrance scent home reed' },
    { t: 'Routines',        c: 'Skin',          u: '/routines/',              k: 'serum cream eye routine morning evening skincare face' },
    { t: 'Wash House',      c: 'At the sink',   u: '/wash-house/',            k: 'hand wash soap body cream sink' },
    { t: 'Wide Light',     c: 'Origin',        u: '/field-guide/',           k: 'origin philosophy frontier modernism story about wide light' },
    { t: 'Shop the Ranch',  c: 'All Objects',   u: '/shop/',                  k: 'shop all products store browse' },
    { t: 'Wholesale',       c: 'Trade',         u: '/wholesale/',             k: 'wholesale trade stockist retailer line sheet hospitality' },
    { t: 'Deep Well',       c: 'Ingestible',    u: '/collections/deep-well/', k: 'deep well ingestible beauty supplement the well first light last light' },

    // ── PRODUCTS (generated) ──
    { t: "All Over Body Cream", c: "Ghost Town Ranch  ·  $55", u: "/products/all-over-body-cream", k: "all over body cream 5% urea amber lotion body-care dehydrated skin dermatologically tested dry hyaluronic acid intensive hydration nourishing and non-greasy texture panthenol shoppe-object sodium pca" },
    { t: "All Told", c: "3-in-1 Eye Cream  ·  $62", u: "/products/all-told-eye-cream", k: "all told 3-in-1 eye cream skin types aloe juice anti-age black calms the around eyes face-care hyaluronic acid lightweight texture shoppe-object under-eye fatigue" },
    { t: "Desert Day Cream", c: "Moisturizer  ·  $64", u: "/products/moisturising-day-cream", k: "desert day cream moisturizer all skin types aloe juice betaine black dehydrated face-care gluten free hyaluronic acid luxurious texture moisture boost moisturiser natural certified nut shoppe-object vegan moisturising" },
    { t: "Desert Glow Hydrating Facial Oil", c: "Facial Oil  ·  $67", u: "/products/desert-glow-hydrating-facial-oil", k: "desert glow hydrating facial oil avocado hydration jojoba shoppe-object" },
    { t: "Desert Veil Full Shade Set Shade set · 4 shades", c: "Makeup  ·  $187", u: "/products/soft-proof-full-shade-set-10-shades-all-variants", k: "desert veil full shade set shades makeup bundle make-up buildup sun care the face routine soft proof 10 all variants" },
    { t: "DESERT VEIL: Available in Light", c: "Medium, Tan, and Deep  ·  $55", u: "/products/desert-veil-tone-correction-barrier-protection", k: "desert veil available in light medium tan and deep face care all skin types ceramides cocoa butter damaged barrier dark spots evens tone face-care gluten free nut shoppe-object stick supports vegan white correction protection" },
    { t: "Drawn Line", c: "Satin Lip Color  ·  $42", u: "/products/drawn-line-matte-lip-color", k: "drawn line matte lip tint makeup all skin types cream lipstick dehydrated face-care satin finish shea butter shoppe-object velvety white color" },
    { t: "Dry Creek", c: "Dry Shampoo Hair Mist  ·  $39", u: "/products/quick-refresh-dry-shampoo-spray", k: "dry creek shampoo hair mist adds volume to the hair-care nourishes and scalp shoppe-object quick refresh spray" },
    { t: "Dusk Til Dawn Hydration Gel", c: "Night Gel  ·  $60", u: "/products/dusk-til-dawn-hydration-gel", k: "dusk til dawn hydration gel night hyaluronic acid overnight shoppe-object" },
    { t: "Evening Repair Bundle", c: "Ghost Town Ranch  ·  $274", u: "/products/evening-repair-bundle", k: "evening repair bundle anti-age face-care shoppe-object" },
    { t: "Frontier Fade Toning Exfoliant", c: "Toner  ·  $55", u: "/products/glycolic-acid-exfoliating-toner", k: "frontier fade toning exfoliant toner all skin types betaine dark spots exfoliates exfoliator face-care glycolic acid promotes the appearance of more even tone removes build-up shoppe-object sodium pca transparent exfoliating" },
    { t: "Golden Hour Body Oil", c: "Body Care  ·  $62", u: "/products/omega-6-9-glowing-skin-body-oil", k: "golden hour body oil care adds healthy glow all skin types argan black body-care dehydrated gluten free hydrating organic certified rejuvenating shoppe-object vegan vitamin omega glowing" },
    { t: "GTR Garment-dyed long-sleeve Tee", c: "Ghost Town Ranch  ·  $64", u: "/products/gtr-garment-dyed-long-sleeve-tee", k: "gtr garment-dyed long-sleeve tee garment dyed long sleeve" },
    { t: "GTR Unisex Hoodie in Black/French Navy/Carbon Grey", c: "Sweatshirt  ·  $74", u: "/products/gtr-unisex-hoodie-in-black-french-navy-white-copy", k: "gtr unisex hoodie in black/french navy/carbon grey sweatshirt black french navy white copy" },
    { t: "GTR Unisex Sweatshirt in Black/French Navy/White", c: "Sweatshirt  ·  $84", u: "/products/gtr-unisex-sweatshirt-in-black-french-navy-white", k: "gtr unisex sweatshirt in black/french navy/white black french navy white" },
    { t: "GTR Unisex Tee in Black or Bone", c: "Tee Shirt  ·  $53", u: "/products/gtr-unisex-tee-in-black-or-bone", k: "gtr unisex tee in black or bone shirt" },
    { t: "Long Range Endurance Skincare Collection", c: "Anti-Age  ·  $178", u: "/products/long-range-endurance-skincare-collection", k: "long range endurance skincare collection anti-age collection-box deep hydration dehydrated skin instant boost of moisture lightweight texture mature shoppe-object" },
    { t: "LONG SHOT Peptide Mascara in Blackened Earth", c: "Ghost Town Ranch  ·  $45", u: "/products/long-shot-peptide-mascara", k: "long shot peptide mascara in blackened earth all skin types gives volume and length gluten free lack of makeup nut peptide-infused peptides shoppe-object vegan white" },
    { t: "Mojave Reset Cooling Face Mist", c: "Face Care  ·  $44", u: "/products/microbiome-prebiotics-face-mist-1", k: "mojave reset cooling face mist care all skin types calming effect damaged barrier dehydrated face-care hyaluronic acid hydrates and refreshes the prebiotics protects shoppe-object transparent white microbiome" },
    { t: "Morning Skin Routine", c: "Bundle · 6 products  ·  $353", u: "/products/morning-skin-routine", k: "morning skin routine bundle products skincare calms the around eyes" },
    { t: "Outlaw's Reserve 2-in-1 Hair + Body Wash", c: "Shampoo  ·  $55", u: "/products/outlaws-reserve-2-in-1-hair-skin-rinse", k: "outlaw reserve 2-in-1 hair body wash shampoo adds volume to the all skin types amber betaine body-care cleansing dehydrated lack of shoppe-object suitable for and wheat protein outlaws in rinse" },
    { t: "Outlaw's Wipeout Makeup Remover", c: "Makeup Remover  ·  $55", u: "/products/biphasic-make-up-remover-fragrance-free", k: "outlaw wipeout makeup remover all skin types aloe juice cleanser cleansing face-care gentle to hyaluronic acid make-up buildup removes and impurities shoppe-object transparent biphasic make up fragrance free" },
    { t: "Ranch Water", c: "Body + Room Fragrance  ·  $88", u: "/products/ranch-water-body-room-fragrance", k: "ranch water body room fragrance home mist phthalate-free spray shoppe-object" },
    { t: "ROSE CUT Daily Facial Wash", c: "Cleanser  ·  $62", u: "/products/rose-cut-daily-facial-wash", k: "rose cut daily facial wash cleanser aloe juice betaine cleansing face-care gently cleanses refreshes gluten free make-up buildup normal nut oily revitalises reveals natural radiance shoppe-object sodium pca transparent vegan" },
    { t: "Rosemary Mint Revive Hair + Scalp Oil", c: "Hair Care  ·  $48", u: "/products/rosemary-hair-scalp-strengthening-oil", k: "rosemary mint revive hair scalp oil care all skin types dehydrated dry ends gives shine and healthy glow hair-care lack of volume nourishes shoppe-object transparent white strengthening" },
    { t: "Soft Proof Full Shade Set · 10 shades", c: "Ghost Town Ranch  ·  $383", u: "/products/soft-proof-full-shade-set", k: "soft proof full shade set 10 shades bundle make-up buildup makeup sun care the face routine" },
    { t: "SOFT PROOF Pigment Foundation with Peptides", c: "10 Shades  ·  $45", u: "/products/soft-proof-peptide-foundation", k: "soft proof pigment foundation with peptides 10 shades makeup all skin types dark spots delicate for even complexion sensitive shoppe-object velvety feel white peptide" },
    { t: "Still Air Natural Roll-On Deodorant", c: "Ghost Town Ranch  ·  $32", u: "/products/still-air-natural-roll-on-deodorant", k: "still air natural roll-on deodorant body care shoppe-object roll on" },
    { t: "Sustainable Sink Tray", c: "Tools & Accessories  ·  $24", u: "/products/sustainable-sink-tray", k: "sustainable sink tray tools accessories bathroom handcrafted plant-based shoppe-object" },
    { t: "The Basin", c: "Body Care  ·  $84", u: "/products/the-basin-hand-wash-body-cream-set-of-two-choose-your-scent", k: "the basin hand wash body cream set of two choose your scent care all skin types liquid soap shoppe-object" },
    { t: "The Face — Full Shade Edit", c: "Bundle · 14 products  ·  $570", u: "/products/the-face-full-shade-edit-bundle-14-shades", k: "the face full shade edit bundle 14 products make-up buildup makeup sun care routine shades" },
    { t: "The Field Kit", c: "Ghost Town Ranch  ·  $34", u: "/products/the-field-kit", k: "the field kit" },
    { t: "The Grade Peptide Serum", c: "Anti-Age  ·  $72", u: "/products/peptide-anti-aging-serum", k: "the grade peptide serum anti-age aloe juice dehydrated skin dry face-care hyaluronic acid normal peptides reduces fine lines shoppe-object smooths sodium pca transparent white anti aging" },
    { t: "The Hold", c: "Anti-age day cream  ·  $74", u: "/products/the-hold-anti-age-day-cream", k: "the hold anti-age day cream aloe juice betaine face-care hyaluronic acid luxurious texture mature moisture boost moisturiser shea butter shoppe-object white anti age" },
    { t: "The Monument", c: "Candle  ·  $190", u: "/products/the-monument-candle", k: "the monument hand-poured mega 4-wick coconut-soy candle 55oz coconut soy large shoppe-object" },
    { t: "The Slow", c: "Hand-Poured Colored Wax Candle, 11oz  ·  $54", u: "/products/the-slow-candle", k: "the slow hand-poured colored wax candle 11oz coconut soy shoppe-object" },
    { t: "The Still", c: "Amber Glass Reed Diffuser  ·  $72", u: "/products/the-still-amber-glass-reed-diffuser", k: "the still amber glass reed diffuser home fragrance shoppe-object" },
    { t: "The Votive – Single", c: "Ghost Town Ranch  ·  $26", u: "/products/the-votive-single", k: "the votive single candle hand-poured scent shoppe-object" },
    { t: "The Votive", c: "Set of 6  ·  $148", u: "/products/the-votive-candle-set-of-6", k: "the votive set of body-care cotton wick gentle aroma gluten free natural soy wax nut shoppe-object transparent vegan white candle" },
    { t: "The Wander", c: "Hand-Poured Travel Candle  ·  $28", u: "/products/the-wander-hand-poured-travel-candle", k: "the wander hand-poured travel candle body-care cotton wick gentle aroma gluten free natural soy wax nut shoppe-object transparent vegan white hand poured" },
    { t: "THE WASH HOUSE", c: "Ghost Town Ranch  ·  $72", u: "/products/the-wash-house-hair-body-set", k: "the wash house hair body set" },
    { t: "The Wash", c: "Hydrating Hand Wash  ·  $44", u: "/products/sunbroke-the-wash-cold-pressed-grapefruit", k: "the wash hydrating hand soap body grapefruit shoppe-object vegan sunbroke cold pressed" },
    { t: "Trail's End Keratin Hair Mist", c: "Hair Care  ·  $53", u: "/products/keratin-shine-leave-in-hair-mist", k: "trail end keratin hair mist care adds shine all skin types softening hair-care lack of glow volume shoppe-object transparent leave in" }
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

  // Precompute a lowercased search blob (name + category + keywords) per item.
  INDEX.forEach(function (i) {
    i._b = (i.t + ' ' + i.c + ' ' + (i.k || '')).toLowerCase();
    i._n = i.t.toLowerCase();
  });

  // Rank: full-phrase name match > name word-start > name contains >
  // category contains > matched only via keywords/tags.
  function score(item, q) {
    if (item._n === q) return 100;
    if (item._n.indexOf(q) === 0) return 85;
    if ((' ' + item._n).indexOf(' ' + q) > -1) return 75;
    if (item._n.indexOf(q) > -1) return 60;
    if (item.c.toLowerCase().indexOf(q) > -1) return 40;
    return 20;
  }

  function renderResults(list) {
    selIdx = -1;
    current = list;
    if (!list.length) {
      results.innerHTML = '<div class="gtrc-empty">Nothing matched. Try a product, scent, or category — like “lip,” “candle,” or “serum.”</div>';
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
      hint.textContent = 'Start typing — any product, scent, or category';
      renderResults(INDEX.filter(function (i) { return i.u.indexOf('/products/') !== 0; }));
      return;
    }
    // Every whitespace-separated token must appear somewhere in the blob,
    // so "matte lip" and "lip tint" both work as well as single terms.
    var tokens = q.split(/\s+/);
    var matched = INDEX
      .filter(function (i) {
        return tokens.every(function (tok) { return i._b.indexOf(tok) > -1; });
      })
      .map(function (i) { return { i: i, s: score(i, q) }; })
      .sort(function (a, b) {
        if (b.s !== a.s) return b.s - a.s;
        return a.i.t.length - b.i.t.length;   // shorter, tighter names first
      })
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
    return document.querySelector('.nav-hamburger') ||
           document.querySelector('.nav-right') ||
           document.querySelector('nav') ||
           document.querySelector('.archetype-nav, #nav, header') ||
           null;
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

    // Place tools just before the hamburger (handles hamburgers nested in a
    // wrapper div), else inside .nav-right, else at the end of the nav.
    var ham = document.querySelector('.nav-hamburger');
    var mount, before = null;
    if (ham && ham.parentElement) { mount = ham.parentElement; before = ham; }
    else {
      mount = document.querySelector('.nav-right') ||
              document.querySelector('nav') ||
              document.querySelector('.archetype-nav, #nav, header');
    }
    if (!mount) return;

    // Match the nav's link text color so icons read on dark or light navs
    // (sample an actual link, not the nav element, whose default color may differ).
    try {
      var navForColor = (mount.closest && mount.closest('nav')) || document.querySelector('nav') || mount;
      var sample = navForColor.querySelector('.nav-links a, .nav-link, a') || navForColor;
      var c = getComputedStyle(sample).color;
      if (c) tools.style.color = c;
    } catch (e) {}

    if (before) mount.insertBefore(tools, before);
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
