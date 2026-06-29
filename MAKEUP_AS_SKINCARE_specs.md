# Makeup as Skincare — product spec blocks

Five products, formatted for the `products/index.html` accordion. For each: the
badge row the template now renders (verified), the paste-ready Shopify
description (copy + INCI — the template auto-splits the INCI into its own
"Ingredients" accordion row), and the Details lines the template generates.

Set the Shopify tag `cosmos` on Desert Veil, Soft Proof, Long Shot, and Mojave
Reset. Do **not** tag Drawn Line `cosmos`. Soft Proof is handled as non-vegan in
the template by name; you can also add a `non-vegan` tag to be explicit.

---

## Desert Veil · Tone Correction + Barrier Protection

**Badges:** COSMOS Certified · ECOCERT  |  Formulated in the EU  |  Vegan · Cruelty-Free  |  No Dyes · No Parabens · No Phthalates

```html
<p>The bridge between skin and makeup. Sheer mineral coverage that protects while it corrects.</p>
<p>Zinc oxide for sheer mineral protection. Ceramides to support the barrier. Cocoa butter and jojoba oil for skin-like moisture. 98% natural origin. Evens tone, softens the look of dark spots, holds up a compromised barrier. One swipe, buildable, all skin types. Light, Medium, Tan, Deep.</p>
<p><strong>Ingredients</strong></p>
<p>Full INCI pending from the Selfnamed spec sheet.</p>
```

**Details accordion:** COSMOS Certified by ECOCERT, third-party verified · Vegan · Cruelty-Free · Free of parabens, phthalates, and synthetic dyes · Frontier Modernism · Palm Springs, CA

> INCI still missing for this one. Do not publish the ingredients row until you send the full deck.

---

## Soft Proof · Peptide Foundation

**Badges:** COSMOS Certified · ECOCERT  |  Formulated in the EU  |  Cruelty-Free  |  No Dyes · No Parabens · No Phthalates

```html
<p>Coverage that treats while it covers. Aloe juice base, not water, with peptide and hyaluronic acid under the pigment. Reads as skin, works like a serum underneath.</p>
<p>Hexapeptide-11 supports firmness. Hydrolyzed Hyaluronic Acid and Sodium Hyaluronate hydrate. Peony root and organic blueberry brighten and defend against environmental stress. Kaolin, silica, and rice starch give the soft-focus, velvety finish. Self-setting, no powder needed. Visibly blurs pores. Made for even complexion and the look of dark spots. All skin types. 10 shades.</p>
<p><strong>Ingredients</strong></p>
<p>Aloe Barbadensis (Aloe) Leaf Juice*, Dicaprylyl Carbonate, Isoamyl Laurate, Polyglyceryl-3 Ricinoleate, Butylene Glycol, Sorbitan Olivate, Kaolin, Glycerin, Cellulose, Lecithin, Silica, Sodium Chloride, Sodium PCA, Zinc Stearate, Oryza Sativa (Rice) Starch, Cera Alba (Beeswax)*, Sorbitan Caprylate, Aqua/Water, Parfum/Fragrance, Tocopherol, Propanediol, Aluminum Hydroxide, Benzoic Acid, Caprylyl Glycol, Paeonia Lactiflora (Peony) Root Extract, Potassium Hydroxide, Vaccinium Myrtillus (Blueberry) Fruit Extract*, Glycolipids, Magnesium Stearate, Hexapeptide-11, Leuconostoc/Radish Root Ferment Filtrate, Hydrolyzed Hyaluronic Acid, Sodium Hyaluronate, Citric Acid, Propylene Glycol, Citrus Aurantium Bergamia Peel Oil, Limonene, Linalyl Acetate, Citrus Limon Peel Oil, Linalool, Pinene, Citrus Aurantium Peel Oil, Citral, +/- [CI 77891 (Titanium Dioxide), CI 77491, CI 77492, CI 77499 (Iron Oxides)]. *Organic. Dermatologically tested.</p>
```

**Details accordion:** COSMOS Certified by ECOCERT, third-party verified · Cruelty-Free · Free of parabens, phthalates, and synthetic dyes · Frontier Modernism · Palm Springs, CA

> Not vegan (Cera Alba / beeswax). Template shows "Cruelty-Free" only. Keep "vegan" off the tags, the badge, and any bundle that includes this item.

---

## Long Shot · Peptide Mascara (Blackened Earth)

**Badges:** COSMOS Certified · ECOCERT  |  Formulated in the EU  |  Vegan · Cruelty-Free  |  No Dyes · No Parabens · No Phthalates

```html
<p>A lash treatment that wears like a mascara. Pea peptide and a sunflower-and-carnauba wax base. Length and lift now, conditioning over time.</p>
<p>Pisum Sativum (pea) peptide conditions and supports the lash. Olive unsaponifiables and castor oil soften and nourish. Trehalose and a radish root ferment hydrate and keep it clean. Builds volume and length that stay put, and strengthens with consistent wear. Blackened Earth, a soft true black. Neutral scent.</p>
<p><strong>Ingredients</strong></p>
<p>Aqua/Water, Stearic Acid, Helianthus Annuus (Sunflower) Seed Cera, Glycerin*, Copernicia Cerifera (Carnauba) Wax, Olea Europaea (Olive) Oil Unsaponifiables, Glyceryl Rosinate, Cellulose, Pentylene Glycol, Pullulan, Octyldodecanol, Glyceryl Stearate, Pisum Sativum Peptide, Polyglyceryl-10 Laurate, Sorbitol, Rhus Verniciflua Peel Cera, Shorea Robusta Resin, Glyceryl Caprylate/Caprate, Palmitic Acid, Potassium Hydroxide, Acacia Senegal Gum, Magnesium Stearate, Xanthan Gum, Trehalose, Citric Acid, Leuconostoc/Radish Root Ferment Filtrate, Ricinus Communis (Castor) Seed Oil*, CI 77499 (Iron Oxides). *Organic. 100% natural origin, 5% organic.</p>
```

**Details accordion:** COSMOS Certified by ECOCERT, third-party verified · Vegan · Cruelty-Free · Free of parabens, phthalates, and synthetic dyes · Frontier Modernism · Palm Springs, CA

---

## Drawn Line · Satin Lip Color (01 Nude, terracotta)

**Badges:** Formulated in the EU  |  Vegan · Cruelty-Free  |  No Dyes · No Parabens · No Phthalates

```html
<p>Lip color that behaves like a balm. Organic blueberry seed oil and shea under the pigment. Color that conditions while it wears.</p>
<p>Blueberry seed oil for antioxidant defense. Shea butter and rice bran oil for moisture and slip. Vitamin E and a stable vitamin C ester to protect. Plant and mineral waxes for the satin set. Creamy, velvety, satin finish. Conditions dehydrated lips. Soft vanilla on application. 01 Nude, a warm terracotta. All skin types.</p>
<p><strong>Ingredients</strong></p>
<p>Oryza Sativa (Rice) Bran Oil, Vegetable Oil, Ricinus Communis (Castor) Seed Oil, Coco-Caprylate, Dicaprylyl Carbonate, Helianthus Annuus (Sunflower) Seed Wax, Oryza Sativa (Rice) Bran Wax, Rhus Succedanea Fruit Wax, Capryloyl Glycerin/Sebacic Acid Copolymer, Cellulose, Polyglyceryl-2 Triisostearate, Silica, Rhus Verniciflua Peel Cera, Tocopherol, Parfum/Fragrance, Butyrospermum Parkii (Shea) Butter*, Aluminum Hydroxide, Ascorbyl Palmitate, Vaccinium Myrtillus (Blueberry) Seed Oil*, Glycolipids, Stevia Rebaudiana Extract, Helianthus Annuus (Sunflower) Seed Oil, Vanillin, Citrus Aurantium Peel Oil, Limonene, +/- [CI 77861 (Tin Oxide), Mica (CI 77019), CI 77891 (Titanium Dioxide), CI 77742 (Manganese Violet), CI 77491, CI 77499 (Iron Oxides)]. *Organic. 99% natural origin (ISO 16128).</p>
```

**Details accordion:** Vegan · Cruelty-Free · Free of parabens, phthalates, and synthetic dyes · Frontier Modernism · Palm Springs, CA

> No COSMOS badge by design. 99% natural origin, no COSMOS certificate on file. If ECOCERT issues one, add the `cosmos` tag and it badges automatically.

---

## Mojave Reset · Cooling Face Mist

**Badges:** COSMOS Certified · ECOCERT  |  Formulated in the EU  |  Vegan · Cruelty-Free  |  No Dyes · No Parabens · No Phthalates

```html
<p>The skincare step that lives in the makeup bag. Sets the face, then brings it back at noon.</p>
<p>Lactobacillus Ferment prebiotic complex feeds the skin's microbiome. Sodium PCA and Sodium Hyaluronate hold moisture. Aloe and panthenol calm. Instant hydration, no residue, no scent. Use over makeup, mid-ride, post-sun. 100ml.</p>
<p><strong>Ingredients</strong></p>
<p>Aqua, Glycerin*, Lactobacillus Ferment (Prebiotic Complex), Sodium PCA, Sodium Hyaluronate, Aloe Barbadensis Leaf Juice*, Panthenol, Phenoxyethanol, Ethylhexylglycerin. *Organic.</p>
```

**Details accordion:** COSMOS Certified by ECOCERT, third-party verified · Vegan · Cruelty-Free · Free of parabens, phthalates, and synthetic dyes · Frontier Modernism · Palm Springs, CA

> Keep this product's Shopify `productType` as "Skincare" or "Face Mist" — not anything containing the word "mist" alone is fine, but do **not** let the type read as a fragrance. The template adds the six-scent fragrance copy to any type containing "candle", "fragrance", "diffuser", or "mist". If Mojave Reset's type triggers that, it will show candle scent descriptions. Use "Face Mist" and confirm it renders clean, or set type to "Skincare".
