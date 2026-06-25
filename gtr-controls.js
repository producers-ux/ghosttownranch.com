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
    { t: 'Find Your Range', c: 'Skin Regimen',  u: '/range/',                 k: 'range archetype regimen collection scout claim landed' },
    { t: 'Field Guide',     c: 'Origin',        u: '/field-guide/',           k: 'origin philosophy frontier modernism story about' },
    { t: 'Shop the Ranch',  c: 'All Objects',   u: '/shop/',                  k: 'shop all products store browse' },
    { t: 'Wholesale',       c: 'Trade',         u: '/wholesale/',             k: 'wholesale trade stockist retailer line sheet hospitality' },
    { t: 'Deep Well',       c: 'Ingestible',    u: '/collections/deep-well/', k: 'deep well ingestible beauty supplement the well first light last light' },

    // ── PRODUCTS (generated) ──
    { t: "All Over Body Cream", c: "Ghost Town Ranch  ·  $55", u: "/products/all-over-body-cream", k: "All Over Body Cream 5% Urea, Amber (Packaging color), Body lotion (Type), body-care, Dehydrated skin (Concern), Dermatologically tested (Claims), Dry (Skin type), Hyaluronic Acid (Active ingredients), Intensive Hydration, Nourishing and Non-Greasy Texture, Panthenol (Active ingredients), shoppe-object, Sodium PCA (Active ingredients), Urea (Active ingredients) all over body cream" },
    { t: "All Told", c: "3-in-1 Eye Cream  ·  $62", u: "/products/all-told-eye-cream", k: "All Told, 3-in-1 Eye Cream Eye Cream All skin types (Skin type), Aloe Juice (Active ingredients), Anti-age (Concern), Black (Packaging color), Calms the skin around eyes, Eye cream (Type), face-care, Hyaluronic Acid (Active ingredients), Lightweight texture, shoppe-object, Under-eye fatigue (Concern) all told eye cream" },
    { t: "Desert Day Cream", c: "Moisturizer  ·  $64", u: "/products/moisturising-day-cream", k: "Desert Day Cream Moisturizer All skin types (Skin type), Aloe Juice (Active ingredients), Betaine (Active ingredients), Black (Packaging color), Dehydrated skin (Concern), face-care, Gluten Free (Claims), Hyaluronic acid, Hyaluronic Acid (Active ingredients), Luxurious texture, Moisture boost, Moisturiser (Type), Natural Certified (Claims), Nut Free (Claims), shoppe-object, Vegan (Claims) moisturising day cream" },
    { t: "Desert Glow Hydrating Facial Oil", c: "Facial Oil  ·  $67", u: "/products/desert-glow-hydrating-facial-oil", k: "Desert Glow Hydrating Facial Oil Facial Oil avocado, facial oil, hydration, jojoba, shoppe-object desert glow hydrating facial oil" },
    { t: "Desert Veil Full Shade Set Shade set · 4 shades", c: "Makeup  ·  $187", u: "/products/soft-proof-full-shade-set-10-shades-all-variants", k: "Desert Veil Full Shade Set Shade set · 4 shades Makeup bundle, Make-up buildup (Concern), makeup, sun care, The Face Routine soft proof full shade set 10 shades all variants" },
    { t: "DESERT VEIL: Available in Light", c: "Medium, Tan, and Deep  ·  $55", u: "/products/desert-veil-tone-correction-barrier-protection", k: "DESERT VEIL: Available in Light, Medium, Tan, and Deep Face Care All skin types (Skin type), Ceramides (Active ingredients), Cocoa Butter (Active ingredients), Damaged skin barrier (Concern), Dark spots (Concern), Evens skin tone, face-care, Gluten Free (Claims), Nut Free (Claims), shoppe-object, Stick (Type), supports skin barrier, Vegan (Claims), White (Packaging color) desert veil tone correction barrier protection" },
    { t: "Drawn Line", c: "Matte Lip Tint  ·  $42", u: "/products/drawn-line-matte-lip-color", k: "Drawn Line, Matte Lip Tint Makeup All skin types (Skin type), Cream lipstick, Dehydrated skin (Concern), face-care, makeup, satin finish, Shea Butter (Active ingredients), shoppe-object, velvety, White (Packaging color) drawn line matte lip color" },
    { t: "Dry Creek", c: "Dry Shampoo Hair Mist  ·  $39", u: "/products/quick-refresh-dry-shampoo-spray", k: "Dry Creek, Dry Shampoo Hair Mist Shampoo adds volume to the hair, hair-care, Nourishes hair and scalp, shoppe-object quick refresh dry shampoo spray" },
    { t: "Dusk Til Dawn Hydration Gel", c: "Night Gel  ·  $60", u: "/products/dusk-til-dawn-hydration-gel", k: "Dusk Til Dawn Hydration Gel Night Gel hyaluronic acid, hydration gel, overnight, shoppe-object dusk til dawn hydration gel" },
    { t: "Evening Repair Bundle", c: "Ghost Town Ranch  ·  $274", u: "/products/evening-repair-bundle", k: "Evening Repair Bundle Anti-age (Concern), bundle, face-care, shoppe-object evening repair bundle" },
    { t: "Frontier Fade Toning Exfoliant", c: "Toner  ·  $55", u: "/products/glycolic-acid-exfoliating-toner", k: "Frontier Fade Toning Exfoliant Toner All skin types (Skin type), Betaine (Active ingredients), Dark spots (Concern), Exfoliates, Exfoliator (Type), face-care, Glycolic Acid (Active ingredients), promotes the appearance of a more even skin tone, removes build-up, shoppe-object, Sodium PCA (Active ingredients), Toner (Type), Transparent (Packaging color) glycolic acid exfoliating toner" },
    { t: "Golden Hour Body Oil", c: "Body Care  ·  $62", u: "/products/omega-6-9-glowing-skin-body-oil", k: "Golden Hour Body Oil Body Care Adds Healthy Glow, All skin types (Skin type), Argan Oil (Active ingredients), Black (Packaging color), Body Oil (Type), body-care, Dehydrated skin (Concern), Gluten Free (Claims), Hydrating, Organic Certified (Claims), Rejuvenating, shoppe-object, Vegan (Claims), Vitamin E (Active ingredients) omega 6 9 glowing skin body oil" },
    { t: "GTR Garment-dyed long-sleeve Tee", c: "Ghost Town Ranch  ·  $64", u: "/products/gtr-garment-dyed-long-sleeve-tee", k: "GTR Garment-dyed long-sleeve Tee gtr garment dyed long sleeve tee" },
    { t: "GTR Unisex Hoodie in Black/French Navy/Carbon Grey", c: "Sweatshirt  ·  $74", u: "/products/gtr-unisex-hoodie-in-black-french-navy-white-copy", k: "GTR Unisex Hoodie in Black/French Navy/Carbon Grey Sweatshirt gtr unisex hoodie in black french navy white copy" },
    { t: "GTR Unisex Sweatshirt in Black/French Navy/White", c: "Sweatshirt  ·  $84", u: "/products/gtr-unisex-sweatshirt-in-black-french-navy-white", k: "GTR Unisex Sweatshirt in Black/French Navy/White Sweatshirt gtr unisex sweatshirt in black french navy white" },
    { t: "GTR Unisex Tee in Black or Bone", c: "Tee Shirt  ·  $53", u: "/products/gtr-unisex-tee-in-black-or-bone", k: "GTR Unisex Tee in Black or Bone Tee Shirt gtr unisex tee in black or bone" },
    { t: "Long Range Endurance Skincare Collection", c: "Anti-Age  ·  $178", u: "/products/long-range-endurance-skincare-collection", k: "Long Range Endurance Skincare Collection Anti-Age Anti-age (Concern), collection-box, Deep hydration, Dehydrated skin (Concern), instant boost of moisture, lightweight texture, Mature (Skin type), shoppe-object long range endurance skincare collection" },
    { t: "LONG SHOT Peptide Mascara in Blackened Earth", c: "Ghost Town Ranch  ·  $45", u: "/products/long-shot-peptide-mascara", k: "LONG SHOT Peptide Mascara in Blackened Earth All skin types (Skin type), Gives volume and length, Gluten Free (Claims), Lack of volume (Concern), makeup, Nut Free (Claims), Peptide-infused, Peptides (Active ingredients), shoppe-object, Vegan (Claims), White (Packaging color) long shot peptide mascara" },
    { t: "Mojave Reset Cooling Face Mist", c: "Face Care  ·  $44", u: "/products/microbiome-prebiotics-face-mist-1", k: "Mojave Reset Cooling Face Mist Face Care All skin types (Skin type), Calming effect, Damaged skin barrier (Concern), Dehydrated skin (Concern), Face mist (Type), face-care, Hyaluronic Acid (Active ingredients), Hydrates and refreshes the skin, Prebiotics (Active ingredients), Protects the skin barrier, shoppe-object, Transparent (Packaging color), White (Packaging color) microbiome prebiotics face mist 1" },
    { t: "Morning Skin Routine", c: "Bundle · 6 products  ·  $353", u: "/products/morning-skin-routine", k: "Morning Skin Routine, Bundle · 6 products Skincare bundle, Calms the skin around eyes, routine, skincare morning skin routine" },
    { t: "Outlaw's Reserve 2-in-1 Hair + Body Wash", c: "Shampoo  ·  $55", u: "/products/outlaws-reserve-2-in-1-hair-skin-rinse", k: "Outlaw's Reserve 2-in-1 Hair + Body Wash Shampoo adds volume to the hair, All skin types (Skin type), Amber (Packaging color), Betaine (Active ingredients), Body wash (Type), body-care, Cleansing (Concern), Dehydrated skin (Concern), Lack of volume (Concern), Shampoo (Type), shoppe-object, Suitable for skin and hair, Wheat Protein (Active ingredients) outlaws reserve 2 in 1 hair skin rinse" },
    { t: "Outlaw's Wipeout Makeup Remover", c: "Makeup Remover  ·  $55", u: "/products/biphasic-make-up-remover-fragrance-free", k: "Outlaw's Wipeout Makeup Remover Makeup Remover All skin types (Skin type), Aloe Juice (Active ingredients), Cleanser (Type), Cleansing (Concern), face-care, Gentle to skin, Hyaluronic Acid (Active ingredients), Make-up buildup (Concern), removes make-up and impurities, shoppe-object, Transparent (Packaging color) biphasic make up remover fragrance free" },
    { t: "Ranch Water", c: "Body + Room Fragrance  ·  $88", u: "/products/ranch-water-body-room-fragrance", k: "Ranch Water, Body + Room Fragrance Body & Home Fragrance body mist, fragrance, phthalate-free, room spray, shoppe-object ranch water body room fragrance" },
    { t: "ROSE CUT Daily Facial Wash", c: "Cleanser  ·  $62", u: "/products/rose-cut-daily-facial-wash", k: "ROSE CUT Daily Facial Wash Cleanser Aloe Juice (Active ingredients), Betaine (Active ingredients), Cleanser (Type), Cleansing (Concern), face-care, Gently cleanses refreshes, Gluten Free (Claims), Make-up buildup (Concern), Normal (Skin type), Nut Free (Claims), Oily (Skin type), revitalises reveals natural radiance, shoppe-object, Sodium PCA (Active ingredients), Transparent (Packaging color), Vegan (Claims) rose cut daily facial wash" },
    { t: "Rosemary Mint Revive Hair + Scalp Oil", c: "Hair Care  ·  $48", u: "/products/rosemary-hair-scalp-strengthening-oil", k: "Rosemary Mint Revive Hair + Scalp Oil Hair Care All skin types (Skin type), Dehydrated skin (Concern), Dry ends (Concern), Gives shine and healthy glow, hair-care, Lack of volume (Concern), Nourishes hair and scalp, Rosemary Oil (Active ingredients), shoppe-object, Transparent (Packaging color), White (Packaging color) rosemary hair scalp strengthening oil" },
    { t: "Soft Proof Full Shade Set · 10 shades", c: "Ghost Town Ranch  ·  $383", u: "/products/soft-proof-full-shade-set", k: "Soft Proof Full Shade Set · 10 shades bundle, Make-up buildup (Concern), makeup, sun care, The Face Routine soft proof full shade set" },
    { t: "SOFT PROOF Pigment Foundation with Peptides", c: "10 Shades  ·  $45", u: "/products/soft-proof-peptide-foundation", k: "SOFT PROOF Pigment Foundation with Peptides, 10 Shades Makeup All skin types (Skin type), Dark spots (Concern), Delicate, for even complexion, makeup, Peptides (Active ingredients), Sensitive skin (Concern), shoppe-object, velvety feel, White (Packaging color) soft proof peptide foundation" },
    { t: "Still Air Natural Roll-On Deodorant", c: "Ghost Town Ranch  ·  $32", u: "/products/still-air-natural-roll-on-deodorant", k: "Still Air Natural Roll-On Deodorant body care, deodorant, shoppe-object still air natural roll on deodorant" },
    { t: "Sustainable Sink Tray", c: "Tools & Accessories  ·  $24", u: "/products/sustainable-sink-tray", k: "Sustainable Sink Tray Tools & Accessories bathroom, handcrafted, plant-based, shoppe-object, sink tray, sustainable sustainable sink tray" },
    { t: "The Basin", c: "Body Care  ·  $84", u: "/products/the-basin-hand-wash-body-cream-set-of-two-choose-your-scent", k: "The Basin | Hand Wash + Body Cream + Set of two · Choose your scent Body Care All skin types (Skin type), body cream, hand wash, liquid soap, shoppe-object the basin hand wash body cream set of two choose your scent" },
    { t: "The Face — Full Shade Edit", c: "Bundle · 14 products  ·  $570", u: "/products/the-face-full-shade-edit-bundle-14-shades", k: "The Face — Full Shade Edit, Bundle · 14 products bundle, Make-up buildup (Concern), makeup, sun care, The Face Routine the face full shade edit bundle 14 shades" },
    { t: "The Field Kit", c: "Ghost Town Ranch  ·  $34", u: "/products/the-field-kit", k: "The Field Kit the field kit" },
    { t: "The Grade Peptide Serum", c: "Anti-Age  ·  $72", u: "/products/peptide-anti-aging-serum", k: "The Grade Peptide Serum Anti-Age Aloe Juice (Active ingredients), Anti-age (Concern), Dehydrated skin (Concern), Dry (Skin type), face-care, Hyaluronic Acid (Active ingredients), Normal (Skin type), Peptides (Active ingredients), Reduces fine lines, Serum (Type), shoppe-object, Smooths, Sodium PCA (Active ingredients), Transparent (Packaging color), White (Packaging color) peptide anti aging serum" },
    { t: "The Hold", c: "Anti-age day cream  ·  $74", u: "/products/the-hold-anti-age-day-cream", k: "The Hold, Anti-age day cream Anti-Age Aloe Juice (Active ingredients), Anti-age (Concern), Betaine (Active ingredients), face-care, Hyaluronic acid, Hyaluronic Acid (Active ingredients), Luxurious texture, Mature (Skin type), Moisture boost, Moisturiser (Type), Shea Butter (Active ingredients), shoppe-object, White (Packaging color) the hold anti age day cream" },
    { t: "The Monument", c: "Candle  ·  $190", u: "/products/the-monument-candle", k: "The Monument, Hand-Poured Mega 4-Wick Coconut-Soy Candle, 55oz Candle candle, coconut soy, hand-poured, large, shoppe-object the monument candle" },
    { t: "The Slow", c: "Hand-Poured Colored Wax Candle, 11oz  ·  $54", u: "/products/the-slow-candle", k: "The Slow, Hand-Poured Colored Wax Candle, 11oz Candle candle, coconut soy, hand-poured, shoppe-object the slow candle" },
    { t: "The Still", c: "Amber Glass Reed Diffuser  ·  $72", u: "/products/the-still-amber-glass-reed-diffuser", k: "The Still, Amber Glass Reed Diffuser Home Fragrance diffuser, home fragrance, reed diffuser, shoppe-object the still amber glass reed diffuser" },
    { t: "The Votive – Single", c: "Ghost Town Ranch  ·  $26", u: "/products/the-votive-single", k: "The Votive – Single candle, hand-poured, scent, shoppe-object, single, votive the votive single" },
    { t: "The Votive", c: "Set of 6  ·  $148", u: "/products/the-votive-candle-set-of-6", k: "The Votive, Set of 6 body-care, Cotton wick, Gentle aroma, Gluten Free (Claims), Natural soy wax, Nut Free (Claims), shoppe-object, Transparent (Packaging color), Vegan (Claims), White (Packaging color) the votive candle set of 6" },
    { t: "The Wander", c: "Hand-Poured Travel Candle  ·  $28", u: "/products/the-wander-hand-poured-travel-candle", k: "The Wander, Hand-Poured Travel Candle Candle body-care, Cotton wick, Gentle aroma, Gluten Free (Claims), Natural soy wax, Nut Free (Claims), shoppe-object, Transparent (Packaging color), Vegan (Claims), White (Packaging color) the wander hand poured travel candle" },
    { t: "THE WASH HOUSE", c: "Ghost Town Ranch  ·  $72", u: "/products/the-wash-house-hair-body-set", k: "THE WASH HOUSE the wash house hair body set" },
    { t: "The Wash", c: "Hydrating Hand Wash  ·  $44", u: "/products/sunbroke-the-wash-cold-pressed-grapefruit", k: "The Wash, Hydrating Hand Wash HAND SOAP body wash, grapefruit, shoppe-object, vegan, wash sunbroke the wash cold pressed grapefruit" },
    { t: "Trail's End Keratin Hair Mist", c: "Hair Care  ·  $53", u: "/products/keratin-shine-leave-in-hair-mist", k: "Trail's End Keratin Hair Mist Hair Care Adds shine, All skin types (Skin type), Hair softening, hair-care, Keratin (Active ingredients), Lack of glow (Concern), Lack of volume (Concern), shoppe-object, Transparent (Packaging color) keratin shine leave in hair mist" }
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
      renderResults(INDEX.slice(0, 8));   // section shortcuts as suggestions
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

    // Match the surrounding nav's text color so icons read on dark or light navs.
    try {
      var navForColor = (mount.closest && mount.closest('nav')) || document.querySelector('nav') || mount;
      var c = getComputedStyle(navForColor).color;
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
