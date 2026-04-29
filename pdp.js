// GTR Product Drawer — standalone, loadable on any page
// Usage: add <script src="/pdp.js"></script> to any page
// Trigger: <div class="pdp-trigger" onclick="openPDP(this)" data-product-name="Product Name\nSub">

(function() {

// ── CSS ────────────────────────────────────────────────────────────────────
var style = document.createElement('style');
style.textContent = `
  :root {
    --parchment: #F4EFE6;
    --warm-black: #1A1512;
    --ink: #2E2820;
    --army: #7c8260;
    --dust: #D4C9B5;
    --ochre: #C4955A;
    --mist: rgba(124,130,96,0.07);
    --rule: 1px solid rgba(26,21,18,0.1);
  }
  #pdp-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(26,21,18,0.45); z-index: 500;
    backdrop-filter: blur(2px);
  }
  #pdp-overlay.open { display: block; }
  #pdp-drawer {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 520px; max-width: 100vw;
    background: var(--parchment); z-index: 600;
    display: flex; flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.32s ease;
    box-shadow: -4px 0 40px rgba(26,21,18,0.12);
  }
  #pdp-drawer.open { transform: translateX(0); }
  .pdp-close {
    position: absolute; top: 20px; right: 24px;
    background: none; border: none; cursor: pointer;
    font-size: 16px; color: var(--warm-black);
    opacity: 0.4; transition: opacity 0.2s; z-index: 10; padding: 6px;
  }
  .pdp-close:hover { opacity: 1; }
  .pdp-scroll { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
  .pdp-images { display: flex; gap: 0; }
  .pdp-img { width: 100%; display: block; object-fit: cover; aspect-ratio: 4/3; flex: 1; }
  .pdp-img-second { border-left: 1px solid rgba(26,21,18,0.1); }
  .pdp-content { padding: 2rem 2.5rem 3rem; }
  .pdp-category { font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--army); margin-bottom: 0.5rem; }
  .pdp-name { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 400; line-height: 1.1; margin-bottom: 1rem; color: var(--warm-black); }
  .pdp-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .pdp-badge { font-size: 0.58rem; letter-spacing: 0.16em; text-transform: uppercase; border: 1px solid rgba(124,130,96,0.45); color: var(--army); padding: 0.25rem 0.6rem; }
  .pdp-desc { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 0.9rem; line-height: 1.75; color: var(--ink); margin-bottom: 0.75rem; }
  .pdp-details { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 0.8rem; line-height: 1.7; color: var(--ink); opacity: 0.6; margin-bottom: 1.5rem; }
  .pdp-ingredients-block { border-top: var(--rule); padding-top: 1.25rem; margin-bottom: 1.75rem; }
  .pdp-ingredients-label { display: block; font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--army); margin-bottom: 0.6rem; }
  .pdp-ingredients { font-size: 0.72rem; line-height: 1.8; color: var(--ink); opacity: 0.55; font-family: 'Cormorant Garamond', Georgia, serif; }
  .pdp-footer { border-top: var(--rule); padding-top: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .pdp-price { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.2rem; color: var(--warm-black); }
  #pdp-buy-area .pdp-buy-btn {
    display: block; width: 100%; background: var(--warm-black); color: var(--parchment);
    font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; letter-spacing: 0.22em;
    text-transform: uppercase; border: none; padding: 1rem 1.5rem; cursor: pointer;
    transition: background 0.2s; text-align: center; text-decoration: none;
  }
  #pdp-buy-area .pdp-buy-btn:hover { background: var(--ochre); }
  #pdp-buy-area .pdp-scent-select {
    width: 100%; background: var(--parchment); color: var(--ink);
    font-family: 'Cormorant Garamond', Georgia, serif; font-size: 0.85rem;
    border: 1px solid rgba(26,21,18,0.2); padding: 0.7rem 0.75rem;
    appearance: none; -webkit-appearance: none; cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%231A1512'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 0.75rem center; margin-bottom: 0.6rem;
  }
  /* Sensory */
  .pdp-sensory { margin-bottom: 1.5rem; }
  .sensory-label { display: block; font-size: 0.58rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--army); margin-bottom: 0.75rem; }
  .sensory-moment { background: var(--warm-black); padding: 1.5rem; margin-bottom: 1rem; }
  .sensory-moment .sensory-label { color: rgba(212,201,181,0.45); }
  .sensory-moment-text { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 0.9rem; line-height: 1.8; color: var(--dust); font-style: italic; }
  .sensory-callouts { margin-bottom: 1rem; }
  .sensory-callout { padding: 0.85rem 0; border-bottom: var(--rule); }
  .sensory-callout:first-of-type { border-top: var(--rule); }
  .sensory-callout-name { display: block; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 0.75rem; font-weight: 400; letter-spacing: 0.1em; color: var(--ink); margin-bottom: 0.3rem; }
  .sensory-callout-desc { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 0.75rem; line-height: 1.7; color: var(--ink); opacity: 0.55; }
  .sensory-words { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.6rem 1rem; padding: 1.25rem 0 0.5rem; border-top: var(--rule); }
  .sensory-word { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; color: var(--ink); opacity: 0.5; letter-spacing: 0.02em; line-height: 1; }
  .sensory-word--lg { font-size: 1.2rem; opacity: 0.7; }
  .sensory-word--md { font-size: 0.95rem; opacity: 0.55; }
  .sensory-word--sm { font-size: 0.72rem; opacity: 0.4; }
  /* Skin profile */
  .pdp-skin-profile { background: var(--mist); border-radius: 2px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
  .skin-profile-row { display: flex; flex-direction: column; gap: 0.4rem; }
  .skin-profile-row--split { display: grid; grid-template-columns: auto auto 1fr; gap: 1.5rem; align-items: start; }
  .skin-profile-label { font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--army); }
  .skin-concerns { display: flex; flex-wrap: wrap; gap: 6px; }
  .skin-concern-tag { font-size: 0.58rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.2rem 0.5rem; border: 1px solid; border-radius: 1px; }
  .skin-texture-track { position: relative; height: 3px; background: rgba(26,21,18,0.1); width: 120px; margin-top: 8px; }
  .skin-texture-fill { position: absolute; left: 0; top: 0; height: 100%; background: var(--army); transition: width 0.4s; }
  .skin-texture-label { font-size: 0.65rem; color: var(--army); margin-top: 4px; display: block; }
  .skin-timing-group { display: flex; gap: 6px; margin-top: 6px; }
  .skin-timing { font-size: 0.6rem; letter-spacing: 0.1em; padding: 2px 6px; border: 1px solid rgba(26,21,18,0.15); color: rgba(26,21,18,0.3); }
  .skin-timing.active { border-color: var(--army); color: var(--army); }
  .skin-scent-track { display: flex; gap: 5px; margin-top: 6px; }
  .skin-scent-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(26,21,18,0.1); }
  .skin-scent-dot.active { background: var(--army); }
  .skin-types { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
  .skin-type-tag { font-size: 0.58rem; color: rgba(26,21,18,0.5); }
  /* Cursor on triggers */
  .pdp-trigger { cursor: pointer; }
  @media(max-width: 600px) {
    #pdp-drawer { width: 100vw; top: auto; height: 90vh; border-radius: 16px 16px 0 0; transform: translateY(100%); }
    #pdp-drawer.open { transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// ── HTML ────────────────────────────────────────────────────────────────────
var div = document.createElement('div');
div.innerHTML = `
  <div id="pdp-overlay" onclick="closePDP()"></div>
  <div id="pdp-drawer">
    <button class="pdp-close" onclick="closePDP()">✕</button>
    <div class="pdp-scroll">
      <div class="pdp-images">
        <img id="pdp-img1" src="" alt="" class="pdp-img">
        <img id="pdp-img2" src="" alt="" class="pdp-img pdp-img-second" style="display:none">
      </div>
      <div class="pdp-content">
        <p id="pdp-category" class="pdp-category"></p>
        <h2 id="pdp-name" class="pdp-name"></h2>
        <div class="pdp-badges">
          <span class="pdp-badge">COSMOS Certified</span>
          <span class="pdp-badge">Small-Batch</span>
          <span class="pdp-badge">Vegan</span>
        </div>
        <p id="pdp-desc" class="pdp-desc"></p>
        <p id="pdp-details" class="pdp-details"></p>
        <div id="pdp-sensory" class="pdp-sensory" style="display:none"></div>
        <div id="pdp-skin-profile" class="pdp-skin-profile" style="display:none"></div>
        <div class="pdp-ingredients-block">
          <span class="pdp-ingredients-label">Full Ingredient List</span>
          <p id="pdp-ingredients" class="pdp-ingredients"></p>
        </div>
        <div class="pdp-footer">
          <span id="pdp-price" class="pdp-price"></span>
          <div id="pdp-buy-area"></div>
        </div>
      </div>
    </div>
  </div>`;
document.body.appendChild(div);

// ── DATA ────────────────────────────────────────────────────────────────────
// Variant IDs for buy buttons
var VARIANT_IDS = {
  "All Told\n3-in-1 Eye Cream":          51729909350696,
  "The Grade\nPeptide Serum":            51729911120168,
  "The Hold\nAnti-Age Day Cream":        51729910137128,
  "Desert Day Cream":                    51729912103208,
  "Dusk Til Dawn\nHydration Gel":        51730077385000,
  "Desert Glow\nHydrating Facial Oil":   51730077286696,
  "Frontier Fade\nToning Exfoliant":     51729936384296,
  "Mojave Reset\nCooling Face Mist":     51729933467944,
  "Outlaw's Wipeout\nMakeup Remover":    51729930322216,
  "Rose Cut\nDaily Facial Wash":         51754756440360,
  "Golden Hour\nBody Oil":               51729940873512,
  "Rosemary Mint Revive\nHair + Scalp Oil": 51729938088232,
  "Trail's End\nKeratin Hair Mist":      51729923211560,
  "Outlaw's Reserve\n2-in-1 Hair + Skin": 51729943626024,
};

// Multi-variant products — link to product page
var PRODUCT_URLS = {
  "The Monument":         "/products/the-monument-candle",
  "The Slow":             "/products/the-slow-candle",
  "The Wander":           "/products/the-wander-candle",
  "Ranch Water":          "/products/ranch-water-body-room-fragrance",
  "The Wash":             "/products/sunbroke-the-wash",
  "Hand Cream":           "/products/worn-soft-hand-cream",
  "GTR Tee":              "/products/gtr-unisex-tee",
  "GTR Hoodie":           "/products/gtr-unisex-hoodie",
  "GTR Sweatshirt":       "/products/gtr-unisex-sweatshirt",
};

// Product prices
var PRICES = {
  "All Told": 48, "The Grade": 58, "The Hold": 64, "Desert Day Cream": 56,
  "Dusk Til Dawn": 52, "Desert Glow": 58, "Frontier Fade": 48, "Mojave Reset": 46,
  "Outlaw's Wipeout": 48, "Rose Cut": 54, "Golden Hour": 64,
  "Rosemary Mint Revive": 44, "Trail's End": 46, "Outlaw's Reserve": 48,
  "The Monument": 196, "The Slow": 68, "The Wander": 32, "Ranch Water": 74,
  "The Wash": 38, "Hand Cream": 46,
};


  var GTR_SKIN_PROFILES = {};
  var GTR_SENSORY = {};
  var GTR_PRODUCTS = {};
  var GTR_CONCERN_COLORS = {};
  var GTR_TEXTURE_SVGS = {};


var var GTR_SKIN_PROFILES = {"Desert Day Cream": {"concerns": ["Hydration", "Environmental Shield", "Anti-age"], "texture": "cream", "timing": ["AM"], "scent": "none", "skin_type": ["All", "Dry", "Normal"]}, "Dusk Til Dawn\nHydration Gel": {"concerns": ["Hydration", "Overnight Repair", "Microbiome"], "texture": "gel", "timing": ["PM"], "scent": "none", "skin_type": ["All", "Oily", "Combination"]}, "Desert Glow\nHydrating Facial Oil": {"concerns": ["Hydration", "Glow", "Nourishing"], "texture": "oil", "timing": ["AM", "PM"], "scent": "light", "skin_type": ["Dry", "Normal", "Mature"]}, "The Grade\nPeptide Serum": {"concerns": ["Anti-age", "Firming", "Fine Lines"], "texture": "serum", "timing": ["AM", "PM"], "scent": "light", "skin_type": ["All", "Mature"]}, "Mojave Reset\nCooling Face Mist": {"concerns": ["Hydration", "Microbiome", "Refreshing"], "texture": "watery", "timing": ["AM", "PM"], "scent": "none", "skin_type": ["All"]}, "Frontier Fade\nToning Exfoliant": {"concerns": ["Exfoliating", "Brightening", "Even Tone"], "texture": "watery", "timing": ["PM"], "scent": "none", "skin_type": ["All", "Dull", "Uneven"]}, "Outlaw's Wipeout\nMakeup Remover": {"concerns": ["Cleansing", "Soothing", "Gentle"], "texture": "biphasic", "timing": ["PM"], "scent": "none", "skin_type": ["All", "Sensitive"]}, "All Told\n3-in-1 Eye Cream": {"concerns": ["Anti-age", "Hydration", "Resilience"], "texture": "cream", "timing": ["AM", "PM"], "scent": "none", "skin_type": ["Mature", "Dry"]}, "Rose Cut\nDaily Facial Wash": {"concerns": ["Cleansing", "Brightening", "Hydrating"], "texture": "gel", "timing": ["AM", "PM"], "scent": "light", "skin_type": ["Normal", "Oily", "All"]}, "Golden Hour\nBody Oil": {"concerns": ["Nourishing", "Glow", "Organic"], "texture": "oil", "timing": ["AM", "PM"], "scent": "none", "skin_type": ["All", "Dry"]}, "Outlaw's Reserve\n2-in-1 Hair + Skin": {"concerns": ["Cleansing", "Conditioning", "Gentle"], "texture": "gel", "timing": ["AM", "PM"], "scent": "light", "skin_type": ["All"]}, "Rosemary Mint Revive\nHair + Scalp Oil": {"concerns": ["Scalp Health", "Growth", "Strengthening"], "texture": "oil", "timing": ["AM", "PM"], "scent": "moderate", "skin_type": ["All hair types"]}, "Rosemary Mint Scrub\nHair + Scalp Treatment": {"concerns": ["Detox", "Scalp Health", "Buildup Removal"], "texture": "balm", "timing": ["PM"], "scent": "moderate", "skin_type": ["All hair types"]}, "Trail's End\nKeratin Hair Mist": {"concerns": ["Frizz Control", "Shine", "Strengthening"], "texture": "watery", "timing": ["AM", "PM"], "scent": "light", "skin_type": ["All hair types"]}, "The Hold\nAnti-Age Day Cream": {"concerns": ["Anti-age", "Hydration", "Firming"], "texture": "cream", "timing": ["AM"], "scent": "none", "skin_type": ["All", "Mature"]}, "The Wash\nHydrating Hand + Body Wash": {"concerns": ["Cleansing", "Hydrating", "Energising"], "texture": "lotion", "timing": ["AM", "PM"], "scent": "moderate", "skin_type": ["All"]}, "Hand Cream\nVegan Hand Cream": {"concerns": ["Repair", "Hydration", "Long-wear"], "texture": "cream", "timing": ["AM", "PM"], "scent": "moderate", "skin_type": ["All", "Dry", "Rough"]}};
var var GTR_SENSORY = {"Desert Day Cream": {"moment": "Before you step outside. The moment between indoor and open air, when your skin is about to take the full weight of the day — sun, wind, whatever the desert throws. This goes on last and stays there.", "callouts": [["Rowanberry", "Grows in cold harsh climates. High in antioxidants because the plant has to fight to survive. Your skin in desert wind is doing the same thing."], ["Hyaluronic Acid", "Pulls moisture from the air and holds it at skin level. Works harder in dry climates than anywhere else."], ["Jojoba Oil", "Chemically similar to skin's own sebum. Absorbs without sitting on top. Doesn't clog."]], "sensory": ["Lightweight", "Melts in", "No white cast", "Faint botanics", "Sets clean"]}, "Dusk Til Dawn\nHydration Gel": {"moment": "Last thing before sleep. Press it in, pull the sheet up. By morning your skin has done eight hours of work without you. Cool at application. Gone by the time your head hits the pillow.", "callouts": [["Sodium PCA", "A naturally occurring humectant in skin. Draws moisture from the air and keeps it there through the night."], ["White Tea Extract", "Antioxidant. Calming. The kind of quiet, consistent protection that only works if you show up every night."], ["Sage Extract", "Antimicrobial, mildly astringent. Balances without stripping."]], "sensory": ["Cool", "Water-light", "No residue", "No scent", "Invisible by morning"]}, "Desert Glow\nHydrating Facial Oil": {"moment": "Two drops. Warm them between your palms. Press into skin — don't rub. Your face takes it in the way dry ground takes in the first rain. The glow comes after, not during.", "callouts": [["Sea-Buckthorn", "Deep amber oil loaded with beta-carotene. The thing that makes this formula run orange in the bottle and golden on skin."], ["Rosehip", "Cold-pressed from Rosa canina seeds. High in vitamin A precursors. The oil skin deploys when it needs to rebuild."], ["Evening Primrose", "Gamma-linolenic acid. Addresses dryness at a cellular level. Old-world remedy with a solid body of research behind it."]], "sensory": ["Two drops", "Warm amber", "Sinks in 60 seconds", "Faint mandarin", "Skin looks fed"]}, "The Grade\nPeptide Serum": {"moment": "After cleansing, before everything else. Skin still slightly damp. Press it in with fingertips, not palms. The peptides need contact time. This is a product that rewards patience — you feel it over weeks, not minutes.", "callouts": [["Acetyl Hexapeptide-8", "Signal peptide. Communicates with muscle contractions under the skin that cause expression lines. Works at the source."], ["Palmitoyl Tripeptide-1", "Collagen-stimulating peptide. Tells skin to produce what it's gradually making less of."], ["Rose Flower Water", "The base. Organic. Toning, slightly antibacterial, pH-supporting. The thing that makes this feel like a serum instead of a science experiment."]], "sensory": ["Light fluid", "No pull", "Faint rose", "Slightly tacky for 30 seconds", "Sets to nothing"]}, "Mojave Reset\nCooling Face Mist": {"moment": "Mid-afternoon. Sundown. After the ride. Shake it once, hold it eight inches out, close your eyes. It hits cool and disappears fast. You come back to yourself. That's the whole job.", "callouts": [["Prebiotic Complex", "Feeds the good bacteria on your skin's surface. Your microbiome is your first line of defense — it needs tending the same as anything else."], ["Sodium PCA", "Instant hydration hit. No waiting. No setting time."], ["Aloe Juice", "Anti-inflammatory. Takes the edge off heat, sun, and friction. Works in the first thirty seconds."]], "sensory": ["Instant cool", "Fine mist", "No residue", "No scent", "Resets in seconds"]}, "Frontier Fade\nToning Exfoliant": {"moment": "At night, after cleansing. Cotton pad or bare hands — both work. You'll feel a mild tingle for thirty seconds. That's glycolic acid doing exactly what it's supposed to do. In the morning your skin is smoother and you'll wonder why you didn't start sooner.", "callouts": [["Glycolic Acid", "The smallest alpha hydroxy acid. Gets deep into the surface layer, dissolves the bonds holding dead cells together. Reveals the skin underneath."], ["Cranberry Extract", "Rich in polyphenols. Calms post-exfoliation inflammation. Makes this formula forgiving enough to use regularly."], ["Lingonberry Extract", "Arctic berry. High in resveratrol. Works alongside cranberry to even tone over time."]], "sensory": ["Mild tingle", "Water-thin", "Slight tartness", "No sting", "Skin feels polished by morning"]}, "Outlaw's Wipeout\nMakeup Remover": {"moment": "End of the day, everything still on. Shake it hard — the two phases are distinct in the bottle and they need to combine. It goes on milky, dissolves everything, wipes clean. One pass is usually enough. Skin feels clean, not stripped.", "callouts": [["Chamomile Flower Extract", "Anti-inflammatory. Counters the mechanical friction of wiping. Leaves skin calm, not reactive."], ["Sea-Buckthorn", "Soothing and restorative. The thing that makes this more than a simple oil-and-water biphasic."], ["Aloe Juice", "Hydrating through the cleanse. You finish with more moisture than you started with."]], "sensory": ["Milky on application", "Dissolves on contact", "Fragrance-free", "No eye sting", "Skin calm after"]}, "All Told\n3-in-1 Eye Cream": {"moment": "Morning or night — it works either way. Rich without being heavy. Sinks faster than you'd expect from something this substantial. The kind of cream that makes your skin feel restored rather than coated.", "callouts": [["Alteromonas Ferment Extract", "From deep-sea bacteria that survive extreme pressure and temperature shifts. The extract mimics their resilience. Applied to skin, it supports the same kind of adaptive toughness."], ["Multi-Molecular Hyaluronic Acid", "Different chain lengths penetrate at different depths. Short chains go deep, long chains hold the surface. Full-spectrum hydration from a single ingredient."], ["Shea Butter", "Cold-pressed, unrefined. The fatty acids in shea mirror the structure of healthy skin lipids. Restores the barrier without blocking it."]], "sensory": ["Rich", "Sinks in", "No shine", "Faint cream scent", "Skin holds moisture all day"]}, "Rose Cut\nDaily Facial Wash": {"moment": "Morning, before anything else. Wet hands, a small amount — it's denser than it looks. The color gives it away: not synthetic, not sweet. Blackberry and sage together, which is darker and more grounded than you'd expect from a face wash. Lather it in, take your time on the jaw and the nose. The lactic acid is working while you think you're just rinsing. Shake it first — natural formulas settle. That's not a flaw. That's the formula telling you something.", "callouts": [["Blackberry Fruit Extract", "High in anthocyanins and vitamin C. The thing giving this formula its color and its antioxidant load. Works while the surfactants clean."], ["Sweet Flag Root Extract", "Acorus calamus. An ancient botanical used for skin clarification and tone. Rarely seen in modern formulas. It's here because it works, not because it's trendy."], ["Lactic Acid", "The gentlest AHA. Dissolves the bonds between dead surface cells without disrupting the barrier. You won't feel it. Your skin will show it."]], "sensory": ["Shake first", "Rose-tinted lather", "Botanical depth", "Rinses clean", "Skin feels reset"]}, "Golden Hour\nBody Oil": {"moment": "Damp skin, straight out of the shower. Pour a small amount into your palm — more than you'd expect for oil, less than you'd use for lotion. Press into skin rather than rubbing. It takes thirty seconds to absorb fully. The glow is immediate. There's no scent competing with anything. Just your skin, but better.", "callouts": [["Raspberry Seed Oil", "Naturally high in omega-3 and omega-6 in optimal ratio. The oil that visibly improves skin texture over consistent use."], ["Sea-Buckthorn", "The trace of warm color. Beta-carotene at work. Gives the oil its depth and the skin its warmth."], ["Pumpkin Seed Oil", "High in zinc and vitamin E. The unglamorous workhorse in this formula — it's doing repair while the others provide glow."]], "sensory": ["Warm amber color", "Press don't rub", "30-second absorption", "No scent", "Immediate glow"]}, "Outlaw's Reserve\n2-in-1 Hair + Skin": {"moment": "Camping. The long ride. Anywhere with one bag and one priority. Lather into wet hair from root to end. Same formula on your body. Rinse together. It does exactly what it says and nothing it doesn't need to.", "callouts": [["Rose Flower Water", "Organic. Toning for skin, conditioning for hair. The thing that keeps a 2-in-1 formula from feeling like a compromise."], ["Nettle Leaf Extract", "Traditionally used to strengthen hair and reduce breakage. High in silica and mineral content."], ["Quince Fruit Extract", "Natural conditioning agent. High in pectins that smooth the hair cuticle without silicones."]], "sensory": ["Light rose", "Builds lather", "Conditions on rinse", "Clean without strip", "Works on everything"]}, "Rosemary Mint Revive\nHair + Scalp Oil": {"moment": "Section dry hair. Apply directly to the scalp with a dropper or your fingertips. Massage in for two minutes — the circulation benefit is in the massage, not just the oil. Leave it. Minimum twenty minutes. Overnight is better. Wash out completely. The results are in the weeks, not the session.", "callouts": [["Rosemary Leaf Oil", "Stimulates blood flow to hair follicles. The most researched natural ingredient for hair growth support. Consistent use is the variable."], ["Peppermint Oil", "Vasodilating. Increases circulation at the scalp. You'll feel it — a cool, tingling activation that tells you something is happening."], ["Sweet Almond Oil", "The carrier. Lightweight, penetrates the hair shaft, conditions from inside. Keeps the formula from being too intense for the scalp."]], "sensory": ["Cool tingle", "Light oil", "Strong botanics", "Warms with massage", "Wash out fully"]}, "Rosemary Mint Scrub\nHair + Scalp Treatment": {"moment": "Once a week, pre-wash. Section damp hair, apply at the root. The salt crystals are immediate — you feel the grit before you feel the tingle. Massage section by section. Five to fifteen minutes. The scalp itches a little when it's working. Rinse completely, then shampoo as usual. Your hair is lighter after this. Literally.", "callouts": [["Sea Salt", "Physical exfoliant. Removes product buildup, dead skin, and excess sebum from the scalp. The thing that makes the rest of your hair routine work better."], ["Hydrolyzed Keratin", "Fills in gaps in the hair shaft during the treatment. Conditions while the salt clears. Leaves hair smoother at the fiber level."], ["Rosemary and Peppermint Oils", "Working together here. Rosemary stimulates, peppermint activates. The tingle is both of them at once."]], "sensory": ["Gritty on application", "Cools then warms", "Strong botanics", "Scalp activation", "Rinse until clear"]}, "Trail's End\nKeratin Hair Mist": {"moment": "Post-wash, still damp. Shake the bottle. Spray six to eight inches from hair, work through with fingers or a wide comb. Don't rinse. Style as normal. The frizz control is in the drying — as hair dries, keratin bonds to the shaft and smooths the cuticle. Works in humidity and in dry desert air equally.", "callouts": [["Hydrolyzed Keratin", "Broken down into small enough particles to actually penetrate the hair cortex, not just coat the outside. Structural repair from inside the strand."], ["Lactic Acid", "Maintains the slightly acidic pH that keeps the hair cuticle closed and lying flat. Frizz is an open cuticle problem. This addresses it directly."], ["Bitter Orange Peel Oil", "Organic. Light citrus scent that lifts in the heat of drying. Gone by the time your hair is dry."]], "sensory": ["Light mist", "No weight", "Faint citrus while drying", "Hair dries smoother", "No residue"]}, "The Hold\nAnti-Age Day Cream": {"moment": "Morning, after serum. A pea-sized amount covers the full face. It sinks within thirty seconds — faster than you'd expect for something this substantive. Skin holds moisture through meetings, commutes, and whatever the day brings. By end of day you can still feel it doing something.", "callouts": [["Multi-Molecular Hyaluronic Acid", "Three chain lengths, three depths of penetration. Micro-HA goes deep. Medium-HA builds volume in the mid-layer. High-weight HA holds the surface. All day."], ["Aloe Juice", "The base of this formula. More bioactive than a water base. Everything else in the formula works better because of it."], ["Shea Butter", "Unrefined cold-pressed. Ceramide-rich. Supports the skin barrier so the hydration the other ingredients deliver has somewhere to stay."]], "sensory": ["Rich on fingers", "Sinks fast", "No shine", "No scent", "Skin holds all day"]}, "The Wash\nHydrating Hand + Body Wash": {"moment": "First thing or last thing. The scent hits before the water does. Three directions: sharp grapefruit that clears the head, cool peppermint and dark cedar that smells like elevation, or warm ginger and smoky cardamom for when you want the shower to feel like something.", "callouts": [["Aloe Juice Base", "The entire formula is built on aloe rather than plain water. More active from the first drop."], ["Sodium Hyaluronate", "Hydrates during the rinse. The thing that stops the tight, stripped feeling after showering."], ["Sulfate-Free Surfactants", "Cocamidopropyl betaine and sodium lauryl sulfoacetate from plant sources. Real lather without stripping the barrier."]], "sensory": ["Choose your mood", "Dense lather", "Rinses clean", "Skin feels alive", "No dry-out"]}, "Hand Cream\nVegan Hand Cream": {"moment": "End of day. Hands that have been at it. A small amount — less than you think. Work it in fast, focus on knuckles and the spaces between fingers. Dry in sixty seconds. You forget it's there, but your hands remember it all day. Two directions: warm amber and leather, or bright citrus and pink peppercorn.", "callouts": [["Jojoba Oil", "Carries fragrance deep into skin. Also the primary emollient. Doesn't sit on the surface."], ["Betaine", "Naturally derived from sugar beets. Pulls water into the skin and keeps it there. The reason this cream lasts."], ["Lavender Flower Extract", "Anti-inflammatory. Keeps skin calm under fragrance load. The quiet ingredient doing steady work."]], "sensory": ["Small amount", "Fast absorption", "Scent blooms with warmth", "No residue", "Stays all day"]}};
var var GTR_PRODUCTS = {"The Slow": {"ingredients": "Coconut-Soy Wax Blend, Premium Fragrance Oil (skin-safe), Cotton Wick", "img2": "", "details": "Hand-poured in small batches. 18oz vessel. Cotton wick, no lead. 80–100 hour burn time. Trim wick to ¼ inch before each burn. First burn: allow wax to pool to edges. No dyes or synthetic colorants."}, "The Monument": {"ingredients": "Coconut-Soy Wax Blend, Premium Fragrance Oil (skin-safe), Cotton Wicks", "img2": "", "details": "Four-wick, 55oz tumbler. 120-hour burn time. Hand-poured, small batch. Coconut-soy blend throws scent the way a desert evening holds heat. Made for great rooms and open plans."}, "The Still": {"ingredients": "Dipropylene Glycol, Isopropyl Myristate, Premium Fragrance Oil", "img2": "https://or-cre.com/cdn/shop/files/TheStill_allitems.png?v=1776726357", "details": "Continuous, quiet scent. Flip reeds every 7–10 days. Keep away from direct sunlight and finished surfaces. Lasts 3–4 months. Amber glass vessel is refillable."}, "Ranch Water": {"ingredients": "Deionized Water, Alcohol Denat., Fragrance, Polysorbate 20", "img2": "", "details": "One formula. Every surface. Mist on linens, into a room, or directly on skin. No dyes, parabens, or phthalates. Skin-safe fragrance oils. 100ml / 3.4 fl oz."}, "The Wander": {"ingredients": "Coconut-Soy Wax Blend, Fragrance Oil, Cotton Wick", "img2": "", "details": "Hand-poured soy wax travel candle. Cotton wick. Light it anywhere. 100ml vessel."}, "Golden Hour\nBody Oil": {"ingredients": "Helianthus Annuus (Sunflower) Seed Oil*, Prunus Amygdalus Dulcis (Sweet Almond) Oil*, Simmondsia Chinensis (Jojoba) Seed Oil*, Argania Spinosa (Argan) Kernel Oil*, Rosa Canina (Rosehip) Fruit Oil*, Rubus Idaeus (Raspberry) Seed Oil*, Cucurbita Pepo (Pumpkin) Seed Oil*, Tocopherol. *Organic", "img2": "", "details": "COSMOS Organic certified. 100% organic cold-pressed oils. No fragrance, no water, no fillers. Apply to damp skin for best absorption. Seven oils, zero compromise."}, "Desert Glow\nHydrating Facial Oil": {"ingredients": "Simmondsia Chinensis (Jojoba) Seed Oil*, Persea Gratissima (Avocado) Oil*, Prunus Amygdalus Dulcis (Sweet Almond) Oil*, Oenothera Biennis (Evening Primrose) Oil*, Hippophae Rhamnoides (Sea-Buckthorn) Fruit Oil*, Rubus Idaeus (Raspberry) Seed Oil*, Tocopherol. *Organic", "img2": "", "details": "COSMOS Organic certified. Six organic oils for facial skin. Sea-buckthorn delivers beta-carotene. Concentrated formula — 15ml goes far. Sparkling mandarin aroma."}, "Desert Day Cream": {"ingredients": "Aqua, Aloe Barbadensis Leaf Juice*, Simmondsia Chinensis (Jojoba) Seed Oil*, Glycerin*, Cetearyl Alcohol, Sorbus Aucuparia (Rowanberry) Fruit Extract*, Rosa Canina (Rosehip) Flower Extract*, Sodium Hyaluronate, Betaine*, Xanthan Gum, Tocopherol, Phenoxyethanol, Ethylhexylglycerin. *Organic", "img2": "", "details": "COSMOS Natural certified. Rowanberry antioxidant complex shields against environmental stress. Aloe juice and hyaluronic acid deliver deep, lasting hydration. Formulated for desert climate — wind, heat, dry air."}, "Dusk Til Dawn\nHydration Gel": {"ingredients": "Aqua, Aloe Barbadensis Leaf Juice*, Glycerin*, Sodium PCA, Sodium Hyaluronate, Salvia Officinalis (Sage) Extract*, Camellia Sinensis (White Tea) Extract*, Panthenol, Xanthan Gum, Phenoxyethanol, Ethylhexylglycerin. *Organic", "img2": "", "details": "COSMOS Natural certified. Overnight hydration gel. Sodium PCA draws moisture from air, hyaluronic acid locks it in. Sage and white tea calm overnight. No occlusive layer, no residue. 30ml."}, "Rose Cut\nDaily Facial Wash": {"ingredients": "Aloe Barbadensis Leaf Juice, Coco-Glucoside, Cocamidopropyl Betaine, Glycerin, Rubus Fruticosus (Blackberry) Fruit Extract, Sodium PCA, Lactic Acid, Salvia Officinalis (Sage) Leaf Extract, Arctium Lappa (Burdock) Root Extract, Acorus Calamus (Sweet Flag) Root Extract", "img2": "https://or-cre.com/cdn/shop/files/Rosecut.png?v=1777339980", "details": "COSMOS Natural certified. Aloe juice base — not water. Blackberry and sage botanical complex. Lactic acid for gentle daily exfoliation. Sodium PCA locks moisture through the rinse. Shake before use — natural formulas settle."}, "All Told\n3-in-1 Eye Cream": {"ingredients": "Aqua, Aloe Barbadensis Leaf Juice, Simmondsia Chinensis (Jojoba) Seed Oil, Shea Butter, Sodium Hyaluronate, Alteromonas Ferment Extract, Glycerin, Cetearyl Alcohol, Phenoxyethanol, Ethylhexylglycerin", "img2": "https://or-cre.com/cdn/shop/files/AllTold.png?v=1777338299", "details": "COSMOS Natural certified. Alteromonas ferment extract — a marine-derived active that mimics the survival adaptation of deep-sea bacteria. Supports skin resilience. Moisture boost and luxurious texture for daily use."}, "Mojave Reset\nCooling Face Mist": {"ingredients": "Aqua, Glycerin*, Lactobacillus Ferment (Prebiotic Complex), Sodium PCA, Sodium Hyaluronate, Aloe Barbadensis Leaf Juice*, Panthenol, Phenoxyethanol, Ethylhexylglycerin. *Organic", "img2": "", "details": "COSMOS Natural certified. Prebiotic mist supports skin's microbiome while delivering instant hydration. Use over makeup, mid-ride, post-sun. 100ml / 3.38 fl oz."}, "Frontier Fade\nToning Exfoliant": {"ingredients": "Aqua, Glycolic Acid, Potassium Hydroxide, Glycerin*, Vaccinium Macrocarpon (Cranberry) Extract*, Vaccinium Vitis-Idaea (Lingonberry) Extract*, Panthenol, Sodium Hyaluronate, Phenoxyethanol, Ethylhexylglycerin. *Organic", "img2": "", "details": "COSMOS Natural certified. pH-adjusted glycolic acid toner. Cranberry and lingonberry antioxidants calm post-exfoliation skin. Start 2–3 times per week. 250ml."}, "Outlaw's Wipeout\nMakeup Remover": {"ingredients": "Aqua, Isododecane, Glycerin*, Matricaria Chamomilla (Chamomile) Flower Extract*, Hippophae Rhamnoides (Sea-Buckthorn) Extract*, Sodium Hyaluronate, Aloe Barbadensis Leaf Juice*, Phenoxyethanol, Ethylhexylglycerin. *Organic", "img2": "", "details": "COSMOS Natural certified. Biphasic formula — shake to combine. Dissolves makeup and SPF without stripping. Chamomile calms. Fragrance-free. 100ml."}, "Outlaw's Reserve\n2-in-1 Hair + Skin": {"ingredients": "Aqua, Sodium Lauryl Sulfoacetate, Cocamidopropyl Betaine, Glycerin*, Rosa Damascena (Rose) Flower Water*, Cydonia Oblonga (Quince) Fruit Extract*, Urtica Dioica (Nettle) Leaf Extract*, Limonene (naturally derived), Panthenol, Phenoxyethanol, Ethylhexylglycerin. *Organic", "img2": "", "details": "COSMOS Natural certified. Sulfate-free. One formula, head to toe. Rose water and quince condition. Nettle strengthens. 16.57 fl oz."}, "Rosemary Mint Revive\nHair + Scalp Oil": {"ingredients": "Prunus Amygdalus Dulcis (Sweet Almond) Oil*, Rosmarinus Officinalis (Rosemary) Leaf Oil*, Mentha Piperita (Peppermint) Oil*. *Organic", "img2": "", "details": "COSMOS Organic certified. Three organic ingredients, nothing else. Rosemary stimulates scalp circulation. Apply, massage in, leave 20–30 min or overnight. 30ml."}, "Rosemary Mint Scrub\nHair + Scalp Treatment": {"ingredients": "Aqua, Cetearyl Alcohol, Glycerin, Butyrospermum Parkii (Shea Butter), Hydrolyzed Keratin, Rosmarinus Officinalis (Rosemary) Leaf Oil, Mentha Piperita (Peppermint) Oil, Sea Salt, Phenoxyethanol, Ethylhexylglycerin", "img2": "", "details": "Detox treatment. Salt and keratin remove buildup. Rosemary and peppermint soothe irritation. Massage in, leave 5–15 minutes, rinse. 170ml / 5.75 fl oz."}, "Trail's End\nKeratin Hair Mist": {"ingredients": "Aqua, Hydrolyzed Keratin, Lactic Acid, Citrus Aurantium (Bitter Orange) Peel Oil*, Panthenol, Glycerin*, Phenoxyethanol, Ethylhexylglycerin. *Organic", "img2": "", "details": "COSMOS Natural certified. Leave-in keratin mist — no rinse. Hydrolyzed keratin bonds to hair shaft, smooths cuticle, reduces frizz. Apply to damp hair and style as usual. 100ml."}, "The Grade\nPeptide Serum": {"ingredients": "Aqua, Rosa Damascena (Rose) Flower Water*, Cydonia Oblonga (Quince) Fruit Extract*, Urtica Dioica (Nettle) Leaf Extract*, Glycerin*, Acetyl Hexapeptide-8, Palmitoyl Tripeptide-1, Sodium Hyaluronate, Panthenol, Phenoxyethanol, Ethylhexylglycerin. *Organic", "img2": "", "details": "COSMOS Natural certified. Two-peptide system: Acetyl Hexapeptide-8 relaxes expression lines, Palmitoyl Tripeptide-1 supports collagen synthesis. Apply morning and evening before moisturiser. Works over time."}, "The Hold\nAnti-Age Day Cream": {"ingredients": "Aqua, Aloe Barbadensis Leaf Juice, Glycerin, Butyrospermum Parkii (Shea Butter), Cetearyl Alcohol, Sodium Hyaluronate, Multi-Molecular Hyaluronic Acid Complex, Tocopherol, Phenoxyethanol, Ethylhexylglycerin", "img2": "", "details": "COSMOS Natural certified. Multi-molecular hyaluronic acid — different chain lengths penetrate at different skin depths. Shea butter and aloe juice base. Rich but never heavy. Settles fast."}, "Root Revival\nScalp Scrubber": {"ingredients": "Natural Wood, Food-Grade Silicone Bristles", "img2": "", "details": "Handcrafted. Natural wood handle, silicone bristles. Use with or without product. Stimulates scalp circulation for healthy hair growth. Each piece unique. 3\" W × 2.75\" H. Hand wash only."}, "The Wash\nHydrating Hand + Body Wash": {"ingredients": "Aqua, Aloe Barbadensis Leaf Juice, Cocamidopropyl Betaine, Sodium Lauryl Sulfoacetate, Glycerin, Simmondsia Chinensis (Jojoba) Seed Oil, Butyrospermum Parkii (Shea Butter), Sodium Hyaluronate, Parfum, Phenoxyethanol, Ethylhexylglycerin", "img2": "", "details": "Vegan. COSMOS-compliant. Sulfate-free surfactant system. pH balanced for daily use. Three scents: Cold-Pressed Grapefruit, Peppermint + Dark Cedar, Ginger + Smoky Cardamom."}, "Hand Cream\nVegan Hand Cream": {"ingredients": "Aqua, Glycerin, Simmondsia Chinensis (Jojoba) Seed Oil, Butyrospermum Parkii (Shea Butter), Cetearyl Alcohol, Lavandula Angustifolia Flower Extract, Betaine, Parfum, Phenoxyethanol, Ethylhexylglycerin", "img2": "", "details": "Vegan. COSMOS-compliant. Rich but fast-absorbing — no greasy residue. Jojoba and shea base, lavender extract for calm. Two scents: Citrus + Pink Peppercorn, Mesquite Amber + Leather."}, "The Wander\nHand-Poured Travel Candle": {"ingredients": "Coconut-Soy Wax Blend, Premium Fragrance Oil (skin-safe), Cotton Wick", "img2": "", "details": "Hand-poured in small batches. Travel-ready vessel. Cotton wick, no lead. All six GTR open range scents. First burn: allow wax to pool to edges. Trim wick to ¼ inch before each burn."}}

  var GTR_SHOP = 'muq7w3-im.myshopify.com';

  let gtrCart = JSON.parse(localStorage.getItem('gtr_cart') || '[]');
  // Sanitize any NaN prices from previous sessions
  gtrCart = gtrCart.map(function(i) { return Object.assign({}, i, {price: isNaN(i.price) ? 0 : i.price}); });

  function cartSave() {
    localStorage.setItem('gtr_cart', JSON.stringify(gtrCart));
  }

  function clientAddToCart(variantId, productTitle, variantTitle, price) {
    var existing = null; for (var ei=0;ei<gtrCart.length;ei++) { if (gtrCart[ei].variantId===variantId){existing=gtrCart[ei];break;} }
    if (existing) {
      existing.qty += 1;
    } else {
      var parsedPrice = parseFloat(price); gtrCart.push({ variantId, productTitle, variantTitle, price: isNaN(parsedPrice) ? 0 : parsedPrice, qty: 1 });
    }
    cartSave();
    updateCartBadge();
    renderCartDrawer();
    openCart();
  }

  function updateCartBadge() {
    var totalQty = gtrCart.reduce(function(s, i) { return s + i.qty; }, 0);
    var badge = document.getElementById('cart-count');
    if (badge) {
      badge.textContent = totalQty;
      badge.style.display = totalQty > 0 ? 'flex' : 'none';
    }
  }

  function renderCartDrawer() {
    updateCartBadge();
    if (!document.getElementById('cart-items')) return;
    var subtotal = 0; for (var si=0;si<gtrCart.length;si++) subtotal += isNaN(gtrCart[si].price)?0:gtrCart[si].price*gtrCart[si].qty;
    var totalQty = 0; for (var ti=0;ti<gtrCart.length;ti++) totalQty += gtrCart[ti].qty;

    document.getElementById('cart-items').innerHTML = gtrCart.length === 0
      ? '<p class="cart-empty">Your cart is empty.</p>'
      : gtrCart.map(function(item, idx) { return '<div class="cart-item">' +
            '<div class="cart-item-info">' +
              '<span class="cart-item-title">' + item.productTitle + '</span>' +
              (item.variantTitle ? '<span class="cart-item-variant">' + item.variantTitle + '</span>' : '') +
            '</div>' +
            '<div class="cart-item-right">' +
              '<div class="cart-item-qty-ctrl">' +
                '<button onclick="cartChangeQty(' + idx + ',-1)" class="qty-btn">−</button>' +
                '<span class="cart-item-qty">' + item.qty + '</span>' +
                '<button onclick="cartChangeQty(' + idx + ',1)" class="qty-btn">+</button>' +
              '</div>' +
              '<span class="cart-item-price">' + (item.price > 0 ? '$' + (item.price * item.qty).toFixed(2) : '—') + '</span>' +
            '</div>' +
          '</div>'
        }).join('');

    document.getElementById('cart-subtotal').textContent = '$' + subtotal.toFixed(2);

    // Build Shopify cart permalink: /cart/id1:qty1,id2:qty2
    var cartUrl = gtrCart.length > 0
      ? 'https://' + GTR_SHOP + '/cart/' + gtrCart.map(function(i){return i.variantId+':'+i.qty;}).join(',')
      : '#';
    document.getElementById('cart-checkout-btn').href = cartUrl;

  }

  function cartChangeQty(idx, delta) {
    gtrCart[idx].qty += delta;
    if (gtrCart[idx].qty <= 0) gtrCart.splice(idx, 1);
    cartSave();
    renderCartDrawer();
  }

  function openCart()  {
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* Variant products (fragrance + apparel) */
  function addVariantToCart(e, btn, handle) {
    e.preventDefault();
    var card = btn.closest('[id^="shopify-btn"]');
    var select = card ? card.querySelector('.variant-select') : null;
    var variantId = select ? select.value : null;
    if (!variantId) return;

    var variantTitle = select.options[select.selectedIndex].text;

    // Try article first (card context), then pdp-buy-area (drawer context)
    var article = btn.closest('article');
    var buyArea = document.getElementById('pdp-buy-area');
    var inDrawer = !article && buyArea && buyArea.contains(btn);

    var productTitle, price;
    if (inDrawer) {
      productTitle = buyArea.dataset.productTitle || handle;
      price = buyArea.dataset.price || '0';
    } else {
      productTitle = article ? article.querySelector('.product-name').innerText.split('\n').join(' ').trim() : handle;
      var priceEl = article ? article.querySelector('.product-price') : null;
      price = priceEl ? (priceEl.textContent.replace(/[^0-9.]/g,'') || '0') : '0';
    }

    btn.textContent = 'Added ✓';
    setTimeout(function() { btn.textContent = 'Add to Cart'; }, 1200);
    clientAddToCart(variantId, productTitle, variantTitle, price);
  }

  /* Single-variant products — variantId from data attribute */
  function addToCart(e, btn) {
    e.preventDefault();
    var variantId = btn.dataset.variantId;
    if (!variantId) {
      window.open(btn.href, '_blank');
      return;
    }

    var article = btn.closest('article');
    var buyArea = document.getElementById('pdp-buy-area');
    var inDrawer = !article && buyArea && buyArea.contains(btn);

    var productTitle, price;
    if (inDrawer) {
      productTitle = buyArea.dataset.productTitle || 'Product';
      price = buyArea.dataset.price || '0';
    } else {
      productTitle = article ? article.querySelector('.product-name').innerText.split('\n').join(' ').trim() : 'Product';
      var priceEl = article ? article.querySelector('.product-price') : null;
      price = priceEl ? (priceEl.textContent.replace(/[^0-9.]/g,'') || '0') : '0';
    }

    btn.textContent = 'Added ✓';
    setTimeout(function() { btn.textContent = 'Add to Cart'; }, 1200);
    clientAddToCart(variantId, productTitle, '', price);
  }

  // Render badge on load
  document.addEventListener('DOMContentLoaded', function() {
    renderCartDrawer();
    updateCartBadge();
    // Handle deep links from external pages e.g. /#wholesale or /#catalog?filter=skin
    var hashFull = window.location.hash.replace('#', '');
    var hashParts = hashFull.split('?');
    var hash = hashParts[0];
    var filterParam = null;
    if (hashParts[1]) {
      var params = hashParts[1].split('&');
      for (var p = 0; p < params.length; p++) {
        var kv = params[p].split('=');
        if (kv[0] === 'filter') filterParam = kv[1];
      }
    }
    if (hash && ['brand','catalog','wholesale','quiz'].indexOf(hash) !== -1) {
      showPage(hash);
      if (filterParam && hash === 'catalog') {
        var filterBtns = document.querySelectorAll('.filter-btn');
        var filterMap = { all: 0, fragrance: 1, skin: 2, hair: 3, tools: 4, bundles: 5, merch: 6 };
var var GTR_CONCERN_COLORS = {"Hydration": "#7B9EA6", "Anti-age": "#9B7A8A", "Brightening": "#C4A55A", "Exfoliating": "#A08060", "Cleansing": "#7C8C7A", "Soothing": "#8FA89A", "Nourishing": "#8B7355", "Organic": "#6B8A5A", "Glow": "#C4A55A", "Fine Lines": "#9B7A8A", "Firming": "#8A7A9B", "UV Protection": "#C4955A", "Mineral": "#8A9A8A", "Outdoor": "#7C8260", "Microbiome": "#7A9B8A", "Overnight Repair": "#6A7A9B", "Environmental Shield": "#8A9A7A", "Repair": "#8B7355", "Long-wear": "#7A6A5A", "Fast-absorb": "#9AA87A", "Even Tone": "#B8956A", "Refreshing": "#7AAAB8", "Energising": "#C4B55A", "Warming": "#B87A5A", "Grounding": "#7A6A55", "Gentle": "#8FA899", "Scalp Health": "#7A9B8A", "Growth": "#6B8A5A", "Strengthening": "#7A7A6A", "Detox": "#8A7A6A", "Buildup Removal": "#8A8A7A", "Frizz Control": "#8A9AAA", "Shine": "#C4B05A", "Conditioning": "#8A9A8A", "Resilience": "#8A7A9B", "Biphasic": "#9A8A7A"};
var var GTR_TEXTURE_SVGS = {"watery": "<svg viewBox=\"0 0 120 80\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <line x1=\"10\" y1=\"20\" x2=\"110\" y2=\"20\" stroke=\"#7c8260\" stroke-width=\"0.5\" stroke-opacity=\"0.4\"/>\n  <line x1=\"10\" y1=\"35\" x2=\"110\" y2=\"35\" stroke=\"#7c8260\" stroke-width=\"0.5\" stroke-opacity=\"0.25\"/>\n  <line x1=\"10\" y1=\"50\" x2=\"110\" y2=\"50\" stroke=\"#7c8260\" stroke-width=\"0.5\" stroke-opacity=\"0.4\"/>\n  <line x1=\"10\" y1=\"65\" x2=\"110\" y2=\"65\" stroke=\"#7c8260\" stroke-width=\"0.5\" stroke-opacity=\"0.25\"/>\n  <line x1=\"18\" y1=\"27\" x2=\"102\" y2=\"27\" stroke=\"#7c8260\" stroke-width=\"0.3\" stroke-opacity=\"0.15\"/>\n  <line x1=\"18\" y1=\"43\" x2=\"102\" y2=\"43\" stroke=\"#7c8260\" stroke-width=\"0.3\" stroke-opacity=\"0.15\"/>\n  <line x1=\"18\" y1=\"58\" x2=\"102\" y2=\"58\" stroke=\"#7c8260\" stroke-width=\"0.3\" stroke-opacity=\"0.15\"/>\n</svg>", "serum": "<svg viewBox=\"0 0 120 80\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <ellipse cx=\"35\" cy=\"22\" rx=\"3.5\" ry=\"5\" fill=\"#7c8260\" fill-opacity=\"0.5\"/>\n  <ellipse cx=\"60\" cy=\"30\" rx=\"3.5\" ry=\"5\" fill=\"#7c8260\" fill-opacity=\"0.35\"/>\n  <ellipse cx=\"85\" cy=\"20\" rx=\"3.5\" ry=\"5\" fill=\"#7c8260\" fill-opacity=\"0.5\"/>\n  <ellipse cx=\"47\" cy=\"48\" rx=\"2.5\" ry=\"3.5\" fill=\"#7c8260\" fill-opacity=\"0.25\"/>\n  <ellipse cx=\"72\" cy=\"52\" rx=\"2.5\" ry=\"3.5\" fill=\"#7c8260\" fill-opacity=\"0.3\"/>\n  <line x1=\"35\" y1=\"27\" x2=\"35\" y2=\"58\" stroke=\"#7c8260\" stroke-width=\"0.4\" stroke-opacity=\"0.2\"/>\n  <line x1=\"60\" y1=\"35\" x2=\"60\" y2=\"64\" stroke=\"#7c8260\" stroke-width=\"0.4\" stroke-opacity=\"0.15\"/>\n  <line x1=\"85\" y1=\"25\" x2=\"85\" y2=\"58\" stroke=\"#7c8260\" stroke-width=\"0.4\" stroke-opacity=\"0.2\"/>\n</svg>", "gel": "<svg viewBox=\"0 0 120 80\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <circle cx=\"40\" cy=\"40\" r=\"22\" stroke=\"#7c8260\" stroke-width=\"0.8\" stroke-opacity=\"0.35\" fill=\"#7c8260\" fill-opacity=\"0.06\"/>\n  <circle cx=\"64\" cy=\"36\" r=\"18\" stroke=\"#7c8260\" stroke-width=\"0.8\" stroke-opacity=\"0.3\" fill=\"#7c8260\" fill-opacity=\"0.05\"/>\n  <circle cx=\"52\" cy=\"52\" r=\"12\" stroke=\"#7c8260\" stroke-width=\"0.6\" stroke-opacity=\"0.25\" fill=\"#7c8260\" fill-opacity=\"0.04\"/>\n</svg>", "lotion": "<svg viewBox=\"0 0 120 80\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M10 55 Q35 30 60 45 Q85 60 110 38\" stroke=\"#7c8260\" stroke-width=\"1.2\" stroke-opacity=\"0.5\" fill=\"none\"/>\n  <path d=\"M10 60 Q35 35 60 50 Q85 65 110 43\" stroke=\"#7c8260\" stroke-width=\"0.5\" stroke-opacity=\"0.2\" fill=\"none\"/>\n  <path d=\"M10 50 Q35 25 60 40 Q85 55 110 33\" stroke=\"#7c8260\" stroke-width=\"0.4\" stroke-opacity=\"0.15\" fill=\"none\"/>\n</svg>", "cream": "<svg viewBox=\"0 0 120 80\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M10 60 Q30 20 50 50 Q70 75 90 45 Q105 25 110 50\" stroke=\"#7c8260\" stroke-width=\"2.5\" stroke-opacity=\"0.45\" fill=\"none\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/>\n  <path d=\"M10 65 Q30 25 50 55 Q70 80 90 50 Q105 30 110 55\" stroke=\"#7c8260\" stroke-width=\"1.5\" stroke-opacity=\"0.2\" fill=\"none\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/>\n  <path d=\"M15 55 Q35 18 52 46 Q68 70 88 42 Q103 22 110 46\" stroke=\"#7c8260\" stroke-width=\"0.6\" stroke-opacity=\"0.15\" fill=\"none\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/>\n</svg>", "biphasic": "<svg viewBox=\"0 0 120 80\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <rect x=\"15\" y=\"15\" width=\"90\" height=\"22\" fill=\"#7c8260\" fill-opacity=\"0.12\" rx=\"1\"/>\n  <line x1=\"15\" y1=\"37\" x2=\"105\" y2=\"37\" stroke=\"#7c8260\" stroke-width=\"0.8\" stroke-opacity=\"0.5\"/>\n  <rect x=\"15\" y=\"37\" width=\"90\" height=\"28\" fill=\"#7c8260\" fill-opacity=\"0.06\" rx=\"1\"/>\n  <text x=\"60\" y=\"30\" text-anchor=\"middle\" font-family=\"serif\" font-size=\"7\" fill=\"#7c8260\" fill-opacity=\"0.4\" font-style=\"italic\">oil</text>\n  <text x=\"60\" y=\"55\" text-anchor=\"middle\" font-family=\"serif\" font-size=\"7\" fill=\"#7c8260\" fill-opacity=\"0.4\" font-style=\"italic\">water</text>\n</svg>", "oil": "<svg viewBox=\"0 0 120 80\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M60 12 C60 12 76 32 76 48 C76 57 68.8 64 60 64 C51.2 64 44 57 44 48 C44 32 60 12 60 12Z\" stroke=\"#7c8260\" stroke-width=\"1\" stroke-opacity=\"0.5\" fill=\"#7c8260\" fill-opacity=\"0.1\"/>\n  <path d=\"M60 22 C60 22 70 36 70 47 C70 53 65.5 58 60 58\" stroke=\"#7c8260\" stroke-width=\"0.5\" stroke-opacity=\"0.2\" fill=\"none\"/>\n</svg>", "balm": "<svg viewBox=\"0 0 120 80\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <rect x=\"12\" y=\"28\" width=\"96\" height=\"6\" fill=\"#7c8260\" fill-opacity=\"0.45\" rx=\"1\"/>\n  <rect x=\"12\" y=\"39\" width=\"96\" height=\"5\" fill=\"#7c8260\" fill-opacity=\"0.3\" rx=\"1\"/>\n  <rect x=\"12\" y=\"49\" width=\"96\" height=\"4\" fill=\"#7c8260\" fill-opacity=\"0.2\" rx=\"1\"/>\n  <rect x=\"12\" y=\"58\" width=\"96\" height=\"3\" fill=\"#7c8260\" fill-opacity=\"0.12\" rx=\"1\"/>\n</svg>"};

// ── FUNCTIONS ───────────────────────────────────────────────────────────────
window.openPDP = function(trigger) {
  var img1El     = trigger.querySelector('img');
  var rawName    = (trigger.dataset.productName || '').trim();
  var firstName  = rawName.split('\n')[0];
  var data       = GTR_PRODUCTS[rawName] || GTR_PRODUCTS[firstName] || {};
  var sensory    = GTR_SENSORY[rawName]  || GTR_SENSORY[firstName]  || null;
  var profile    = GTR_SKIN_PROFILES[rawName] || GTR_SKIN_PROFILES[firstName] || null;

  // Image
  document.getElementById('pdp-img1').src = img1El ? img1El.src : '';
  document.getElementById('pdp-img1').alt = firstName;
  var img2El = document.getElementById('pdp-img2');
  if (data.img2) { img2El.src = data.img2; img2El.style.display = 'block'; }
  else { img2El.style.display = 'none'; }

  // Category — try to find from nearby DOM, else guess
  var article = trigger.closest('article') || trigger.closest('.product-card') || trigger.parentElement;
  var catEl   = article ? (article.querySelector('.product-category') || article.querySelector('.card-sub')) : null;
  var cat     = catEl ? catEl.textContent.trim() : '';
  document.getElementById('pdp-category').textContent = cat;

  // Name
  document.getElementById('pdp-name').innerHTML = rawName.replace(/\n/g, '<br>');

  // Desc — try DOM first, then sensory moment
  var descEl = article ? article.querySelector('.product-desc, .card-sub, .pdp-desc') : null;
  var desc   = descEl ? descEl.textContent.trim() : (sensory ? sensory.moment.substring(0, 120) + '…' : '');
  document.getElementById('pdp-desc').textContent = desc;
  document.getElementById('pdp-details').textContent = data.details || '';
  document.getElementById('pdp-ingredients').textContent = data.ingredients || '';

  // Price
  var priceEl = article ? article.querySelector('.product-price, .card-price') : null;
  var price   = priceEl ? priceEl.textContent.trim() : (PRICES[firstName] ? '$' + PRICES[firstName] : '');
  document.getElementById('pdp-price').textContent = price;

  // Badges
  var isMerch = cat && cat.toLowerCase().indexOf('merch') > -1;
  var badgesEl = document.querySelector('.pdp-badges');
  if (badgesEl) {
    badgesEl.style.display = 'flex';
    badgesEl.innerHTML = isMerch
      ? '<span class="pdp-badge">Garment-Dyed</span><span class="pdp-badge">Printed in the Desert</span>'
      : '<span class="pdp-badge">COSMOS Certified</span><span class="pdp-badge">Small-Batch</span><span class="pdp-badge">Vegan</span>';
  }
  var ingBlock = document.querySelector('.pdp-ingredients-block');
  if (ingBlock) ingBlock.style.display = isMerch ? 'none' : 'block';

  // Buy area
  var buyArea = document.getElementById('pdp-buy-area');
  buyArea.innerHTML = '';
  var vid = VARIANT_IDS[rawName] || VARIANT_IDS[firstName];
  var url = PRODUCT_URLS[rawName] || PRODUCT_URLS[firstName];
  if (vid) {
    var btn = document.createElement('button');
    btn.className = 'pdp-buy-btn';
    btn.textContent = 'Add to Cart';
    btn.onclick = function() {
      if (window.GTRCart) GTRCart.add(vid, firstName, 'Default', PRICES[firstName] || 0, img1El ? img1El.src : '');
      closePDP();
    };
    buyArea.appendChild(btn);
  } else if (url) {
    var link = document.createElement('a');
    link.className = 'pdp-buy-btn';
    link.href = url;
    link.textContent = 'Choose Scent →';
    buyArea.appendChild(link);
  }

  // Sensory
  var sensoryEl = document.getElementById('pdp-sensory');
  if (sensory && sensoryEl) {
    var calloutsHtml = sensory.callouts.map(function(c) {
      return '<div class="sensory-callout"><span class="sensory-callout-name">' + c[0] + '</span><p class="sensory-callout-desc">' + c[1] + '</p></div>';
    }).join('');
    var wordsHtml = sensory.sensory.map(function(w, i) {
      var sizes = ['sensory-word--lg','sensory-word--sm','sensory-word--md','sensory-word--sm','sensory-word--lg'];
      return '<span class="sensory-word ' + sizes[i % 5] + '">' + w + '</span>';
    }).join('');
    var texture = profile ? (profile.texture || '') : '';
    sensoryEl.innerHTML =
      '<div class="sensory-moment"><span class="sensory-label">The Moment</span><p class="sensory-moment-text">' + sensory.moment + '</p></div>' +
      '<div class="sensory-callouts"><span class="sensory-label">Key Actives</span>' + calloutsHtml + '</div>' +
      (GTR_TEXTURE_SVGS[texture] ? '<div class="sensory-texture-visual"><span class="sensory-label">Texture</span><div class="sensory-texture-svg">' + GTR_TEXTURE_SVGS[texture] + '</div><span class="sensory-texture-name">' + (texture ? texture.charAt(0).toUpperCase() + texture.slice(1) : '') + '</span></div>' : '') +
      '<div class="sensory-words">' + wordsHtml + '</div>';
    sensoryEl.style.display = 'block';
  } else if (sensoryEl) {
    sensoryEl.style.display = 'none';
  }

  // Skin profile
  var profileEl = document.getElementById('pdp-skin-profile');
  if (profile && profileEl) {
    var texturePos = {watery:1,serum:2,gel:3,lotion:4,cream:5,biphasic:5,oil:6,balm:7};
    var pos = texturePos[profile.texture] || 1;
    var concernTags = profile.concerns.map(function(c) {
      return '<span class="skin-concern-tag" style="border-color:' + (GTR_CONCERN_COLORS[c]||'var(--army)') + ';color:' + (GTR_CONCERN_COLORS[c]||'var(--army)') + '">' + c + '</span>';
    }).join('');
    var timingDots = ['AM','PM'].map(function(t) {
      return '<span class="skin-timing ' + (profile.timing.indexOf(t) > -1 ? 'active' : '') + '">' + t + '</span>';
    }).join('');
    var scentDots = ['none','light','moderate'].map(function(s) {
      return '<span class="skin-scent-dot ' + (profile.scent === s ? 'active' : '') + '"></span>';
    }).join('');
    var skinTypes = profile.skin_type.map(function(s) {
      return '<span class="skin-type-tag">' + s + '</span>';
    }).join('');
    profileEl.innerHTML =
      '<div class="skin-profile-row"><span class="skin-profile-label">Addresses</span><div class="skin-concerns">' + concernTags + '</div></div>' +
      '<div class="skin-profile-row"><span class="skin-profile-label">Texture</span><div class="skin-texture-track"><div class="skin-texture-fill" style="width:' + ((pos/7)*100) + '%"></div></div><span class="skin-texture-label">' + (profile.texture || '') + '</span></div>' +
      '<div class="skin-profile-row skin-profile-row--split"><div><span class="skin-profile-label">Use</span><div class="skin-timing-group">' + timingDots + '</div></div><div><span class="skin-profile-label">Scent</span><div class="skin-scent-track">' + scentDots + '</div></div><div><span class="skin-profile-label">Skin Type</span><div class="skin-types">' + skinTypes + '</div></div></div>';
    profileEl.style.display = 'block';
  } else if (profileEl) {
    profileEl.style.display = 'none';
  }

  document.getElementById('pdp-drawer').classList.add('open');
  document.getElementById('pdp-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closePDP = function() {
  document.getElementById('pdp-drawer').classList.remove('open');
  document.getElementById('pdp-overlay').classList.remove('open');
  document.body.style.overflow = '';
};

})(); // end IIFE
