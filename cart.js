// GTR Cart — persistent across pages via localStorage
(function() {
  var DOMAIN  = 'or-cre.com';
  var TOKEN   = 'c6efa00d9c5d9849c6c13d59cca6ab82';
  var STORAGE_KEY = 'gtr_cart';

  // ── PERSIST / RESTORE ─────────────────────────────────────────────────────
  function saveCart(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
  }
  function loadCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : {}; return { items: Array.isArray(parsed.items) ? parsed.items : [], checkoutId: parsed.checkoutId || null, checkoutUrl: parsed.checkoutUrl || null };
    } catch(e) { return { items: [], checkoutId: null, checkoutUrl: null }; }
  }

  var cart = loadCart();

  // ── INJECT STYLES ──────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = `
    .gtr-cart-overlay{display:none;position:fixed;inset:0;background:rgba(28,24,20,0.4);z-index:300;backdrop-filter:blur(2px);}
    .gtr-cart-overlay.open{display:block;}
    .gtr-cart-drawer{position:fixed;top:0;right:-480px;width:480px;max-width:100vw;height:100vh;background:#FDFAF5;z-index:400;display:flex;flex-direction:column;transition:right 0.35s cubic-bezier(0.4,0,0.2,1);box-shadow:-8px 0 40px rgba(0,0,0,0.12);}
    .gtr-cart-drawer.open{right:0;}
    .gtr-cart-header{display:flex;justify-content:space-between;align-items:center;padding:28px 32px;border-bottom:1px solid #E8DFC8;}
    .gtr-cart-title{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#1C1814;font-weight:500;}
    .gtr-cart-count{font-family:'Cormorant Garamond',serif;font-size:13px;color:#7A7060;}
    .gtr-cart-close{background:none;border:none;cursor:pointer;color:#7A7060;font-size:24px;line-height:1;padding:0;transition:color 0.2s;}
    .gtr-cart-close:hover{color:#1C1814;}
    .gtr-cart-items{flex:1;overflow-y:auto;padding:24px 32px;display:flex;flex-direction:column;gap:24px;}
    .gtr-cart-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:20px;color:#7A7060;text-align:center;}
    .gtr-cart-item{display:grid;grid-template-columns:72px 1fr auto;gap:16px;align-items:start;padding-bottom:24px;border-bottom:1px solid #E8DFC8;}
    .gtr-cart-item:last-child{border-bottom:none;padding-bottom:0;}
    .gtr-item-img{width:72px;height:96px;object-fit:cover;background:#E8DFC8;}
    .gtr-item-info{display:flex;flex-direction:column;gap:6px;}
    .gtr-item-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#1C1814;font-weight:500;}
    .gtr-item-variant{font-family:'Barlow',sans-serif;font-size:12px;color:#7A7060;}
    .gtr-item-qty{display:flex;align-items:center;gap:10px;margin-top:8px;}
    .gtr-qty-btn{background:none;border:1px solid #E8DFC8;width:28px;height:28px;cursor:pointer;font-size:16px;color:#1C1814;transition:all 0.2s;display:flex;align-items:center;justify-content:center;}
    .gtr-qty-btn:hover{border-color:#C4A882;}
    .gtr-qty-num{font-family:'Barlow Condensed',sans-serif;font-size:14px;color:#1C1814;min-width:20px;text-align:center;}
    .gtr-item-price{font-family:'Cormorant Garamond',serif;font-size:20px;color:#1C1814;white-space:nowrap;}
    .gtr-item-remove{display:block;margin-top:8px;background:none;border:none;font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#7A7060;cursor:pointer;padding:0;transition:color 0.2s;}
    .gtr-item-remove:hover{color:#1C1814;}
    .gtr-cart-footer{padding:24px 32px;border-top:1px solid #E8DFC8;display:flex;flex-direction:column;gap:16px;}
    .gtr-cart-subtotal{display:flex;justify-content:space-between;align-items:baseline;}
    .gtr-subtotal-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7A7060;}
    .gtr-subtotal-amount{font-family:'Cormorant Garamond',serif;font-size:28px;color:#1C1814;}
    .gtr-cart-note{font-family:'Barlow',sans-serif;font-size:12px;color:#7A7060;text-align:center;}
    .gtr-checkout-btn{display:block;width:100%;padding:18px;background:#1C1814;color:#FDFAF5;border:none;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;text-align:center;transition:background 0.2s;}
    .gtr-checkout-btn:hover{background:#2E2820;}
    .gtr-checkout-btn:disabled{opacity:0.5;cursor:default;}
    .gtr-continue-btn{display:block;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#7A7060;cursor:pointer;background:none;border:none;border-bottom:1px solid #E8DFC8;padding-bottom:2px;transition:color 0.2s;}
    .gtr-continue-btn:hover{color:#1C1814;}
    .gtr-cart-trigger{position:fixed;bottom:24px;right:24px;z-index:200;background:#1C1814;color:#FDFAF5;border:none;cursor:pointer;width:56px;height:56px;display:none;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:background 0.2s;}
    .gtr-cart-trigger:hover{background:#2E2820;}
    .gtr-cart-trigger.has-items{display:flex;}
    .gtr-trigger-icon{font-size:20px;line-height:1;}
    .gtr-trigger-count{font-family:'Barlow Condensed',sans-serif;position:absolute;top:6px;right:6px;background:#C4A882;color:#1C1814;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;}
    @media(max-width:600px){.gtr-cart-drawer{width:100vw;}}
  `;
  document.head.appendChild(style);

  // ── INJECT HTML ────────────────────────────────────────────────────────────
  var div = document.createElement('div');
  div.innerHTML = `
    <div class="gtr-cart-overlay" id="gtr-overlay" onclick="GTRCart.close()"></div>
    <div class="gtr-cart-drawer" id="gtr-drawer">
      <div class="gtr-cart-header">
        <div>
          <div class="gtr-cart-title">Your Cart</div>
          <div class="gtr-cart-count" id="gtr-item-count"></div>
        </div>
        <button class="gtr-cart-close" onclick="GTRCart.close()">×</button>
      </div>
      <div class="gtr-cart-items" id="gtr-items"></div>
      <div class="gtr-cart-footer" id="gtr-footer" style="display:none">
        <div class="gtr-cart-subtotal">
          <span class="gtr-subtotal-label">Subtotal</span>
          <span class="gtr-subtotal-amount" id="gtr-subtotal">$0</span>
        </div>
        <p class="gtr-cart-note">Taxes and shipping calculated at checkout</p>
        <a href="#" class="gtr-checkout-btn" id="gtr-checkout-btn" target="_blank">Checkout →</a>
        <button class="gtr-continue-btn" onclick="GTRCart.close()">Continue Shopping</button>
      </div>
    </div>
    <button class="gtr-cart-trigger" id="gtr-trigger" onclick="GTRCart.open()">
      <span class="gtr-trigger-icon">🛒</span>
      <span class="gtr-trigger-count" id="gtr-trigger-count">0</span>
    </button>
  `;
  document.body.appendChild(div);

  // ── SHOPIFY CLIENT ─────────────────────────────────────────────────────────
  function initClient(callback) {
    if (window.ShopifyBuy && window.ShopifyBuy.buildClient) {
      var client = ShopifyBuy.buildClient({ domain: DOMAIN, storefrontAccessToken: TOKEN });
      window.GTRClient = client;

      // Restore existing checkout or create new one
      if (cart.checkoutId) {
        client.checkout.fetch(cart.checkoutId).then(function(co) {
          if (co && !co.completedAt) {
            cart.checkoutUrl = co.webUrl;
            document.getElementById('gtr-checkout-btn').href = co.webUrl;
            if (callback) callback();
          } else {
            // Checkout completed or expired — create fresh
            createCheckout(client, callback);
          }
        }).catch(function() {
          createCheckout(client, callback);
        });
      } else {
        createCheckout(client, callback);
      }
    }
  }

  function createCheckout(client, callback) {
    client.checkout.create().then(function(co) {
      cart.checkoutId = co.id;
      cart.checkoutUrl = co.webUrl;
      saveCart(cart);
      document.getElementById('gtr-checkout-btn').href = co.webUrl;
      // Re-add any stored items to the new checkout
      if (cart.items.length > 0) {
        var lineItems = cart.items.map(function(i) {
          return { variantId: 'gid://shopify/ProductVariant/' + i.id, quantity: i.qty };
        });
        client.checkout.addLineItems(co.id, lineItems).then(function(co2) {
          cart.checkoutUrl = co2.webUrl;
          saveCart(cart);
          document.getElementById('gtr-checkout-btn').href = co2.webUrl;
        });
      }
      if (callback) callback();
    });
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  function render() {
    var itemsEl   = document.getElementById('gtr-items');
    var footerEl  = document.getElementById('gtr-footer');
    var countEl   = document.getElementById('gtr-item-count');
    var triggerEl = document.getElementById('gtr-trigger');
    var trigCount = document.getElementById('gtr-trigger-count');
    var subtotal  = document.getElementById('gtr-subtotal');

    if (!Array.isArray(cart.items)) cart.items = [];
    var total = cart.items.reduce(function(s,i){ return s + i.price * i.qty; }, 0);
    var count = cart.items.reduce(function(s,i){ return s + i.qty; }, 0);

    countEl.textContent  = count + ' item' + (count !== 1 ? 's' : '');
    subtotal.textContent = '$' + total.toFixed(2).replace(/\.00$/, '');
    trigCount.textContent = count;
    triggerEl.classList.toggle('has-items', count > 0);

    if (cart.checkoutUrl) {
      document.getElementById('gtr-checkout-btn').href = cart.checkoutUrl;
    }

    if (cart.items.length === 0) {
      itemsEl.innerHTML = '<div class="gtr-cart-empty"><p>Your cart is empty.</p><p style="font-size:14px;font-style:normal;font-family:\'Barlow Condensed\',sans-serif;letter-spacing:0.1em;text-transform:uppercase;margin-top:8px;">Something belongs here.</p></div>';
      footerEl.style.display = 'none';
    } else {
      footerEl.style.display = 'flex';
      itemsEl.innerHTML = cart.items.map(function(item, idx) {
        var showVariant = item.variant && item.variant !== 'Default' && item.variant !== 'Default Title';
        return '<div class="gtr-cart-item">' +
          '<img class="gtr-item-img" src="' + item.img + '" alt="' + item.name + '">' +
          '<div class="gtr-item-info">' +
            '<div class="gtr-item-name">' + item.name + '</div>' +
            (showVariant ? '<div class="gtr-item-variant">' + item.variant + '</div>' : '') +
            '<div class="gtr-item-qty">' +
              '<button class="gtr-qty-btn" onclick="GTRCart.updateQty(' + idx + ',-1)">−</button>' +
              '<span class="gtr-qty-num">' + item.qty + '</span>' +
              '<button class="gtr-qty-btn" onclick="GTRCart.updateQty(' + idx + ',1)">+</button>' +
            '</div>' +
            '<button class="gtr-item-remove" onclick="GTRCart.remove(' + idx + ')">Remove</button>' +
          '</div>' +
          '<div class="gtr-item-price">$' + (item.price * item.qty).toFixed(2).replace(/\.00$/,'') + '</div>' +
        '</div>';
      }).join('');
    }
  }

  // ── ADD TO CART ────────────────────────────────────────────────────────────
  function addToShopify(variantId, qty) {
    if (!window.GTRClient || !cart.checkoutId) return;
    window.GTRClient.checkout.addLineItems(cart.checkoutId, [{
      variantId: 'gid://shopify/ProductVariant/' + variantId,
      quantity: qty || 1
    }]).then(function(co) {
      cart.checkoutUrl = co.webUrl;
      saveCart(cart);
      document.getElementById('gtr-checkout-btn').href = co.webUrl;
    }).catch(function() {
      // If checkout expired, create fresh and retry
      createCheckout(window.GTRClient, function() {
        addToShopify(variantId, qty);
      });
    });
  }

  // ── PUBLIC API ─────────────────────────────────────────────────────────────
  window.GTRCart = {
    open: function() {
      document.getElementById('gtr-drawer').classList.add('open');
      document.getElementById('gtr-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    },
    close: function() {
      document.getElementById('gtr-drawer').classList.remove('open');
      document.getElementById('gtr-overlay').classList.remove('open');
      document.body.style.overflow = '';
    },
    add: function(variantId, name, variant, price, img) {
      var existing = cart.items.find(function(i){ return i.id == variantId && i.variant === variant; });
      if (existing) {
        existing.qty++;
      } else {
        cart.items.push({ id: variantId, name: name, variant: variant, price: price, qty: 1, img: img });
      }
      saveCart(cart);
      addToShopify(variantId, 1);
      render();
      GTRCart.open();
    },
    updateQty: function(idx, delta) {
      cart.items[idx].qty = Math.max(0, cart.items[idx].qty + delta);
      if (cart.items[idx].qty === 0) cart.items.splice(idx, 1);
      saveCart(cart);
      // Rebuild Shopify checkout with updated quantities
      if (window.GTRClient) {
        createCheckout(window.GTRClient, null);
      }
      render();
    },
    remove: function(idx) {
      cart.items.splice(idx, 1);
      saveCart(cart);
      if (window.GTRClient) {
        createCheckout(window.GTRClient, null);
      }
      render();
    },
    clear: function() {
      cart = { items: [], checkoutId: null, checkoutUrl: null };
      saveCart(cart);
      render();
    }
  };

  // ── BOOT ───────────────────────────────────────────────────────────────────
  function tryInit() {
    if (window.ShopifyBuy && window.ShopifyBuy.buildClient) {
      initClient();
    } else {
      setTimeout(tryInit, 200);
    }
  }

  if (!window.ShopifyBuy) {
    var s = document.createElement('script');
    s.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    s.async = true;
    s.onload = function() { tryInit(); };
    document.head.appendChild(s);
  } else {
    tryInit();
  }

  render();
})();
