// GTR Cart — one Shopify cart shared by every page.
// Uses the Storefront Cart API and the same localStorage key (gtr_cart_id) as the
// product pages and Ritual, so whatever a shopper adds anywhere lands in one cart
// and one checkout.
(function() {
  var DOMAIN      = 'muq7w3-im.myshopify.com';   // permanent Shopify address; unaffected by custom domain changes
  var TOKEN       = 'c6efa00d9c5d9849c6c13d59cca6ab82';
  var API_VERSION = '2025-01';
  var CART_KEY    = 'gtr_cart_id';
  var MIRROR_KEY  = 'gtr_cart_v2';   // read by gtr-controls.js for the nav badge

  // ── PAIRINGS ───────────────────────────────────────────────────────────────
  // One suggestion shown under the cart. Key = product in cart, value = what goes with it.
  // Edit freely. The first cart item that has an available, not-yet-added partner wins;
  // otherwise FALLBACK is tried in order.
  var PAIRS = {
    'ranch-water-body-room-fragrance':        'the-still-amber-glass-reed-diffuser',
    'the-still-amber-glass-reed-diffuser':    'ranch-water-body-room-fragrance',
    'the-monument-candle':                    'ranch-water-body-room-fragrance',
    'trail-light-travel-soy-candle':          'ranch-water-body-room-fragrance',
    'sunbroke-the-wash-cold-pressed-grapefruit': 'silk-skin-hand-cream-spices-sandalwood',
    'hand-body-wash-grapefruit':              'silk-skin-hand-cream-spices-sandalwood',
    'hand-body-wash-grapefruit-1':            'silk-skin-hand-cream-spices-sandalwood',
    'hand-body-wash-patchouli-amber-vanilla': 'silk-skin-hand-cream-spices-sandalwood',
    'silk-skin-hand-cream-spices-sandalwood': 'sunbroke-the-wash-cold-pressed-grapefruit',
    'drawn-line-matte-lip-color':             'long-shot-peptide-mascara',
    'long-shot-peptide-mascara':              'drawn-line-matte-lip-color',
    'rose-cut-daily-facial-wash':             'peptide-anti-aging-serum',
    'peptide-anti-aging-serum':               'the-hold-anti-age-day-cream',
    'the-hold-anti-age-day-cream':            'peptide-anti-aging-serum',
    'moisturising-day-cream':                 'peptide-anti-aging-serum',
    'dusk-til-dawn-hydration-gel':            'gold-rush-hydrogel-eye-mask',
    'glycolic-acid-exfoliating-toner':        'microbiome-prebiotics-face-mist-1',
    'biphasic-make-up-remover-fragrance-free':'rose-cut-daily-facial-wash',
    'rosemary-hair-scalp-strengthening-oil':  'keratin-shine-leave-in-hair-mist',
    'outlaws-reserve-2-in-1-hair-skin-rinse': 'rosemary-hair-scalp-strengthening-oil',
    'dry-creek-quick-refresh-hair-mist':      'keratin-shine-leave-in-hair-mist',
    'day-ride-bag':                           'drawn-line-matte-lip-color'
  };
  var FALLBACK = ['ranch-water-body-room-fragrance', 'day-ride-bag'];
  // Short line under the suggestion. Anything not listed shows no line.
  var PAIR_NOTES = {
    'drawn-line-matte-lip-color': 'Buy both, save $17 at checkout.',
    'long-shot-peptide-mascara':  'Buy both, save $17 at checkout.'
  };

  // ── STATE ──────────────────────────────────────────────────────────────────
  var cart = { id: null, checkoutUrl: '', lines: [] };
  var busy = false;
  var queue = [];
  var pairCache = {};       // handle -> product data, or false if unavailable

  var LINE_FIELDS = 'id quantity merchandise { ... on ProductVariant { id title price { amount } image { url altText } product { title handle } } }';
  var CART_FIELDS = 'id checkoutUrl lines(first: 50) { edges { node { ' + LINE_FIELDS + ' } } }';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return '$' + Number(n).toFixed(2).replace(/\.00$/, ''); }
  function gid(id) {
    id = String(id);
    return id.indexOf('gid://') === 0 ? id : 'gid://shopify/ProductVariant/' + id;
  }
  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  function api(query, variables) {
    return fetch('https://' + DOMAIN + '/api/' + API_VERSION + '/graphql.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
      body: JSON.stringify({ query: query, variables: variables || {} })
    }).then(function(r) { return r.json(); });
  }

  function applyCart(c) {
    if (!c) return;
    cart.id = c.id;
    cart.checkoutUrl = c.checkoutUrl;
    cart.lines = c.lines.edges.map(function(e) { return e.node; });
    store(CART_KEY, c.id);
    // Mirror the count for the nav badge (gtr-controls.js reads items[].qty).
    store(MIRROR_KEY, JSON.stringify({ items: cart.lines.map(function(l) { return { qty: l.quantity }; }) }));
  }

  // ── CART API ───────────────────────────────────────────────────────────────
  function fetchCart(id) {
    return api('query($id: ID!) { cart(id: $id) { ' + CART_FIELDS + ' } }', { id: id })
      .then(function(r) { return r && r.data && r.data.cart; });
  }
  function createCart(lines) {
    return api('mutation($lines: [CartLineInput!]) { cartCreate(input: { lines: $lines }) { cart { ' + CART_FIELDS + ' } } }',
      { lines: lines || [] })
      .then(function(r) { return r && r.data && r.data.cartCreate && r.data.cartCreate.cart; });
  }
  function mutate(name, args, vars) {
    return api('mutation(' + args + ') { ' + name + ' { cart { ' + CART_FIELDS + ' } userErrors { message } } }', vars)
      .then(function(r) {
        var key = name.split('(')[0];
        var out = r && r.data && r.data[key];
        if (!out || (out.userErrors && out.userErrors.length)) throw new Error('cart');
        return out.cart;
      });
  }

  // Serialize writes so quick taps don't race each other.
  function run(task) {
    return new Promise(function(resolve) {
      queue.push(function() {
        return task().then(resolve, function() { resolve(null); });
      });
      pump();
    });
  }
  function pump() {
    if (busy || !queue.length) return;
    busy = true;
    var job = queue.shift();
    job().then(function() { busy = false; pump(); });
  }

  function ensureCart() {
    if (cart.id) return Promise.resolve(cart.id);
    return createCart([]).then(function(c) { applyCart(c); return cart.id; });
  }

  // Carry over anything left in the old local-only cart (pre-unification visitors).
  function legacyLines() {
    try {
      var old = JSON.parse(read(MIRROR_KEY) || '{}');
      if (!('checkoutId' in old) || !Array.isArray(old.items)) return [];
      return old.items.filter(function(i) { return i.id && i.qty > 0; })
        .map(function(i) { return { merchandiseId: gid(i.id), quantity: i.qty }; });
    } catch (e) { return []; }
  }

  function boot() {
    var legacy = legacyLines();
    var id = read(CART_KEY);
    return run(function() {
      var p = id ? fetchCart(id) : Promise.resolve(null);
      return p.then(function(c) {
        if (c) {
          applyCart(c);
          if (!legacy.length) return;
          return mutate('cartLinesAdd(cartId: $id, lines: $lines)', '$id: ID!, $lines: [CartLineInput!]!',
            { id: cart.id, lines: legacy }).then(applyCart);
        }
        return createCart(legacy).then(applyCart);
      });
    }).then(render);
  }

  // ── STYLES ─────────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = `
    .gtr-cart-overlay{display:none;position:fixed;inset:0;background:rgba(20,20,20,0.4);z-index:300;backdrop-filter:blur(2px);}
    .gtr-cart-overlay.open{display:block;}
    .gtr-cart-drawer{position:fixed;top:0;right:-480px;width:480px;max-width:100vw;height:100vh;height:100dvh;background:#FBFBF9;z-index:400;display:flex;flex-direction:column;transition:right 0.35s cubic-bezier(0.4,0,0.2,1);box-shadow:-8px 0 40px rgba(0,0,0,0.12);}
    .gtr-cart-drawer.open{right:0;}
    .gtr-cart-header{display:flex;justify-content:space-between;align-items:center;padding:28px 32px;border-bottom:1px solid #E2E4E0;}
    .gtr-cart-title{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#141414;font-weight:500;}
    .gtr-cart-count{font-family:'Cormorant Garamond',serif;font-size:13px;color:#6E716C;}
    .gtr-cart-close{background:none;border:none;cursor:pointer;color:#6E716C;font-size:24px;line-height:1;padding:0;transition:color 0.2s;}
    .gtr-cart-close:hover{color:#141414;}
    .gtr-cart-items{flex:1;overflow-y:auto;padding:24px 32px;display:flex;flex-direction:column;gap:24px;}
    .gtr-cart-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:20px;color:#6E716C;text-align:center;}
    .gtr-cart-item{display:grid;grid-template-columns:72px 1fr auto;gap:16px;align-items:start;padding-bottom:24px;border-bottom:1px solid #E2E4E0;}
    .gtr-cart-item:last-child{border-bottom:none;padding-bottom:0;}
    .gtr-item-img{width:72px;height:96px;object-fit:cover;background:#E2E4E0;}
    .gtr-item-info{display:flex;flex-direction:column;gap:6px;}
    .gtr-item-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#141414;font-weight:500;}
    .gtr-item-variant{font-family:'Barlow',sans-serif;font-size:12px;color:#6E716C;}
    .gtr-item-qty{display:flex;align-items:center;gap:10px;margin-top:8px;}
    .gtr-qty-btn{background:none;border:1px solid #E2E4E0;width:28px;height:28px;cursor:pointer;font-size:16px;color:#141414;transition:all 0.2s;display:flex;align-items:center;justify-content:center;}
    .gtr-qty-btn:hover{border-color:#B5B99A;}
    .gtr-qty-num{font-family:'Barlow Condensed',sans-serif;font-size:14px;color:#141414;min-width:20px;text-align:center;}
    .gtr-item-price{font-family:'Cormorant Garamond',serif;font-size:20px;color:#141414;white-space:nowrap;}
    .gtr-item-remove{display:block;margin-top:8px;background:none;border:none;font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6E716C;cursor:pointer;padding:0;transition:color 0.2s;}
    .gtr-item-remove:hover{color:#141414;}
    .gtr-pair{display:none;margin:0 32px 0;padding:20px 0;border-top:1px solid #E2E4E0;}
    .gtr-pair.show{display:block;}
    .gtr-pair-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#6E716C;margin-bottom:12px;}
    .gtr-pair-row{display:grid;grid-template-columns:56px 1fr auto;gap:14px;align-items:center;}
    .gtr-pair-img{width:56px;height:72px;object-fit:cover;background:#E2E4E0;display:block;}
    .gtr-pair-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#141414;font-weight:500;text-decoration:none;}
    .gtr-pair-price{font-family:'Cormorant Garamond',serif;font-size:17px;color:#141414;margin-top:2px;}
    .gtr-pair-note{font-family:'Barlow',sans-serif;font-size:12px;color:#6E716C;margin-top:4px;}
    .gtr-pair-add{background:none;border:1px solid #141414;color:#141414;cursor:pointer;padding:10px 14px;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;transition:all 0.2s;white-space:nowrap;}
    .gtr-pair-add:hover{background:#141414;color:#FBFBF9;}
    .gtr-pair-add:disabled{opacity:0.5;cursor:default;}
    .gtr-cart-footer{padding:24px 32px;border-top:1px solid #E2E4E0;display:flex;flex-direction:column;gap:16px;}
    .gtr-cart-subtotal{display:flex;justify-content:space-between;align-items:baseline;}
    .gtr-subtotal-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6E716C;}
    .gtr-subtotal-amount{font-family:'Cormorant Garamond',serif;font-size:28px;color:#141414;}
    .gtr-cart-note{font-family:'Barlow',sans-serif;font-size:12px;color:#6E716C;text-align:center;}
    .gtr-checkout-btn{display:block;width:100%;padding:18px;background:#141414;color:#FBFBF9;border:none;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;text-align:center;transition:background 0.2s;}
    .gtr-checkout-btn:hover{background:#262725;}
    .gtr-checkout-btn.wait{opacity:0.5;pointer-events:none;}
    .gtr-continue-btn{display:block;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6E716C;cursor:pointer;background:none;border:none;border-bottom:1px solid #E2E4E0;padding-bottom:2px;transition:color 0.2s;}
    .gtr-continue-btn:hover{color:#141414;}
    .gtr-cart-trigger{position:fixed;bottom:24px;right:24px;z-index:200;background:#141414;color:#FBFBF9;border:none;cursor:pointer;width:56px;height:56px;display:none;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:background 0.2s;}
    .gtr-cart-trigger:hover{background:#262725;}
    .gtr-cart-trigger.has-items{display:flex;}
    .gtr-trigger-icon{font-size:20px;line-height:1;}
    .gtr-trigger-count{font-family:'Barlow Condensed',sans-serif;position:absolute;top:6px;right:6px;background:#B5B99A;color:#141414;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;}
    @media(max-width:600px){.gtr-cart-drawer{width:100vw;}.gtr-cart-header,.gtr-cart-items,.gtr-cart-footer{padding-left:20px;padding-right:20px;}.gtr-pair{margin:0 20px;}}
  `;
  document.head.appendChild(style);

  // ── MARKUP ─────────────────────────────────────────────────────────────────
  function mount() {
    if (document.getElementById('gtr-drawer')) return;
    var div = document.createElement('div');
    div.innerHTML = `
      <div class="gtr-cart-overlay" id="gtr-overlay" onclick="GTRCart.close()"></div>
      <div class="gtr-cart-drawer" id="gtr-drawer" role="dialog" aria-label="Cart">
        <div class="gtr-cart-header">
          <div>
            <div class="gtr-cart-title">Your Cart</div>
            <div class="gtr-cart-count" id="gtr-item-count"></div>
          </div>
          <button class="gtr-cart-close" onclick="GTRCart.close()" aria-label="Close cart">×</button>
        </div>
        <div class="gtr-cart-items" id="gtr-items"></div>
        <div class="gtr-pair" id="gtr-pair"></div>
        <div class="gtr-cart-footer" id="gtr-footer" style="display:none">
          <div class="gtr-cart-subtotal">
            <span class="gtr-subtotal-label">Subtotal</span>
            <span class="gtr-subtotal-amount" id="gtr-subtotal">$0</span>
          </div>
          <p class="gtr-cart-note">Taxes and shipping calculated at checkout</p>
          <a href="#" class="gtr-checkout-btn" id="gtr-checkout-btn">Checkout →</a>
          <button class="gtr-continue-btn" onclick="GTRCart.close()">Continue Shopping</button>
        </div>
      </div>
      <button class="gtr-cart-trigger" id="gtr-trigger" onclick="GTRCart.open()" aria-label="Open cart">
        <span class="gtr-trigger-icon">🛒</span>
        <span class="gtr-trigger-count" id="gtr-trigger-count">0</span>
      </button>
    `;
    document.body.appendChild(div);
    document.getElementById('gtr-checkout-btn').addEventListener('click', function(e) {
      e.preventDefault();
      // Wait for any pending cart writes so checkout always has every item.
      var btn = this;
      btn.classList.add('wait');
      run(function() { return Promise.resolve(); }).then(function() {
        if (cart.checkoutUrl) window.location.href = cart.checkoutUrl;
        else btn.classList.remove('wait');
      });
    });
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  function render() {
    var itemsEl = document.getElementById('gtr-items');
    if (!itemsEl) return;
    var footerEl  = document.getElementById('gtr-footer');
    var countEl   = document.getElementById('gtr-item-count');
    var triggerEl = document.getElementById('gtr-trigger');

    var total = 0, count = 0;
    cart.lines.forEach(function(l) {
      total += parseFloat(l.merchandise.price.amount) * l.quantity;
      count += l.quantity;
    });

    countEl.textContent = count + ' item' + (count !== 1 ? 's' : '');
    document.getElementById('gtr-subtotal').textContent = money(total);
    document.getElementById('gtr-trigger-count').textContent = count;
    triggerEl.classList.toggle('has-items', count > 0);

    if (!cart.lines.length) {
      itemsEl.innerHTML = '<div class="gtr-cart-empty"><p>Your cart is empty.</p><p style="font-size:14px;font-style:normal;font-family:\'Barlow Condensed\',sans-serif;letter-spacing:0.1em;text-transform:uppercase;margin-top:8px;">Something belongs here.</p></div>';
      footerEl.style.display = 'none';
    } else {
      footerEl.style.display = 'flex';
      itemsEl.innerHTML = cart.lines.map(function(l) {
        var v = l.merchandise;
        var showVariant = v.title && v.title !== 'Default Title' && v.title !== 'Default';
        return '<div class="gtr-cart-item">' +
          '<img class="gtr-item-img" src="' + esc(v.image && v.image.url) + '" alt="' + esc(v.product.title) + '">' +
          '<div class="gtr-item-info">' +
            '<div class="gtr-item-name">' + esc(v.product.title) + '</div>' +
            (showVariant ? '<div class="gtr-item-variant">' + esc(v.title) + '</div>' : '') +
            '<div class="gtr-item-qty">' +
              '<button class="gtr-qty-btn" aria-label="Decrease" onclick="GTRCart.setQty(\'' + esc(l.id) + '\',' + (l.quantity - 1) + ')">−</button>' +
              '<span class="gtr-qty-num">' + l.quantity + '</span>' +
              '<button class="gtr-qty-btn" aria-label="Increase" onclick="GTRCart.setQty(\'' + esc(l.id) + '\',' + (l.quantity + 1) + ')">+</button>' +
            '</div>' +
            '<button class="gtr-item-remove" onclick="GTRCart.setQty(\'' + esc(l.id) + '\',0)">Remove</button>' +
          '</div>' +
          '<div class="gtr-item-price">' + money(parseFloat(v.price.amount) * l.quantity) + '</div>' +
        '</div>';
      }).join('');
    }

    renderPair();
    try { window.dispatchEvent(new CustomEvent('gtr:cart-updated', { detail: { count: count } })); } catch (e) {}
  }

  // ── PAIRING ────────────────────────────────────────────────────────────────
  function fetchPairProduct(handle) {
    if (handle in pairCache) return Promise.resolve(pairCache[handle]);
    return api('query($h: String!) { product(handle: $h) { title handle featuredImage { url } variants(first: 10) { nodes { id availableForSale price { amount } } } } }', { h: handle })
      .then(function(r) {
        var p = r && r.data && r.data.product;
        var v = p && p.variants.nodes.filter(function(n) { return n.availableForSale; })[0];
        pairCache[handle] = (p && v) ? { handle: p.handle, title: p.title, img: p.featuredImage && p.featuredImage.url, variantId: v.id, price: v.price.amount } : false;
        return pairCache[handle];
      }, function() { pairCache[handle] = false; return false; });
  }

  var pairToken = 0;
  function renderPair() {
    var el = document.getElementById('gtr-pair');
    if (!el) return;
    if (!cart.lines.length) { el.classList.remove('show'); return; }

    var inCart = {};
    cart.lines.forEach(function(l) { inCart[l.merchandise.product.handle] = true; });
    var candidates = [];
    cart.lines.slice().reverse().forEach(function(l) {     // most recently added first
      var p = PAIRS[l.merchandise.product.handle];
      if (p && !inCart[p] && candidates.indexOf(p) < 0) candidates.push(p);
    });
    FALLBACK.forEach(function(h) { if (!inCart[h] && candidates.indexOf(h) < 0) candidates.push(h); });

    var token = ++pairToken;
    (function next(i) {
      if (i >= candidates.length) { if (token === pairToken) el.classList.remove('show'); return; }
      fetchPairProduct(candidates[i]).then(function(p) {
        if (token !== pairToken) return;
        if (!p) return next(i + 1);
        var note = PAIR_NOTES[p.handle];
        el.innerHTML =
          '<div class="gtr-pair-label">Goes with</div>' +
          '<div class="gtr-pair-row">' +
            '<a href="/products/' + esc(p.handle) + '/"><img class="gtr-pair-img" src="' + esc(p.img) + '" alt="' + esc(p.title) + '"></a>' +
            '<div><a class="gtr-pair-name" href="/products/' + esc(p.handle) + '/">' + esc(p.title) + '</a>' +
              '<div class="gtr-pair-price">' + money(p.price) + '</div>' +
              (note ? '<div class="gtr-pair-note">' + esc(note) + '</div>' : '') +
            '</div>' +
            '<button class="gtr-pair-add" id="gtr-pair-add">Add</button>' +
          '</div>';
        el.classList.add('show');
        document.getElementById('gtr-pair-add').onclick = function() {
          this.disabled = true; this.textContent = 'Adding…';
          addLine(p.variantId, 1);
        };
      });
    })(0);
  }

  // ── WRITES ─────────────────────────────────────────────────────────────────
  // Resolves true if the item made it into the Shopify cart.
  function addLine(variantId, qty) {
    var line = { merchandiseId: gid(variantId), quantity: qty || 1 };
    function has(c) {
      return !!c && c.lines.edges.some(function(e) { return e.node.merchandise.id === line.merchandiseId; });
    }
    return run(function() {
      return ensureCart().then(function() {
        return mutate('cartLinesAdd(cartId: $id, lines: $lines)', '$id: ID!, $lines: [CartLineInput!]!',
          { id: cart.id, lines: [line] })
          .catch(function() {
            // Cart expired or was checked out: start a fresh one with this item.
            return createCart([line]);
          });
      }).then(function(c) {
        var ok = has(c);
        if (ok) applyCart(c);
        return ok;
      });
    }).then(function(ok) {
      if (!ok) cart.lines = cart.lines.filter(function(l) { return String(l.id).indexOf('pending-') !== 0; });
      if (!ok && cart.id) {
        // Drop any placeholder line and show Shopify's real cart.
        return fetchCart(cart.id).then(function(c) { if (c) applyCart(c); render(); return false; });
      }
      render();
      return !!ok;
    });
  }

  // ── PUBLIC API ─────────────────────────────────────────────────────────────
  window.GTRCart = {
    open: function() {
      mount();
      document.getElementById('gtr-drawer').classList.add('open');
      document.getElementById('gtr-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    },
    close: function() {
      var d = document.getElementById('gtr-drawer'), o = document.getElementById('gtr-overlay');
      if (d) d.classList.remove('open');
      if (o) o.classList.remove('open');
      document.body.style.overflow = '';
    },
    // Signature kept from the old cart so every existing "Add" button keeps working.
    add: function(variantId, name, variant, price, img) {
      // Show the item right away; Shopify's response replaces this placeholder.
      var tmpId = 'pending-' + Date.now();
      cart.lines.push({ id: tmpId, quantity: 1, merchandise: {
        id: gid(variantId), title: variant || '', price: { amount: String(price || 0) },
        image: { url: img || '' }, product: { title: name || '', handle: '' } } });
      render();
      GTRCart.open();
      return addLine(variantId, 1);
    },
    // Add by variant only (product pages). Opens the cart on success; resolves true/false.
    addVariant: function(variantId, qty) {
      return addLine(variantId, qty || 1).then(function(ok) {
        if (ok) GTRCart.open();
        return ok;
      });
    },
    count: function() {
      return cart.lines.reduce(function(s, l) { return s + l.quantity; }, 0);
    },
    setQty: function(lineId, qty) {
      if (String(lineId).indexOf('pending-') === 0) return;
      run(function() {
        var p = qty > 0
          ? mutate('cartLinesUpdate(cartId: $id, lines: $lines)', '$id: ID!, $lines: [CartLineUpdateInput!]!',
              { id: cart.id, lines: [{ id: lineId, quantity: qty }] })
          : mutate('cartLinesRemove(cartId: $id, lineIds: $ids)', '$id: ID!, $ids: [ID!]!',
              { id: cart.id, ids: [lineId] });
        return p.then(applyCart);
      }).then(render);
    },
    // Old names, kept for any page that still calls them.
    updateQty: function(idx, delta) { var l = cart.lines[idx]; if (l) GTRCart.setQty(l.id, l.quantity + delta); },
    remove: function(idx) { var l = cart.lines[idx]; if (l) GTRCart.setQty(l.id, 0); },
    clear: function() {
      cart = { id: null, checkoutUrl: '', lines: [] };
      try { localStorage.removeItem(CART_KEY); localStorage.removeItem(MIRROR_KEY); } catch (e) {}
      render();
    }
  };

  // ── BOOT ───────────────────────────────────────────────────────────────────
  function start() { mount(); render(); boot(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  // Another tab changed the cart: refresh.
  window.addEventListener('storage', function(e) {
    if (e.key === CART_KEY && e.newValue && e.newValue !== cart.id) {
      fetchCart(e.newValue).then(function(c) { if (c) { applyCart(c); render(); } });
    }
  });
})();
