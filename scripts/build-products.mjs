#!/usr/bin/env node
// Pre-renders one static page per Shopify product at /products/<handle>/index.html
// so crawlers (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot...) get real HTTP 200
// pages with title, description, canonical, Open Graph and Product JSON-LD in the raw HTML.
// The existing client-side template (products/index.html) still hydrates cart + variants.
//
// Usage:  node scripts/build-products.mjs            (live Storefront API)
//         node scripts/build-products.mjs --mock f.json   (offline test)
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const SITE = 'https://ghosttownranch.com';
const SHOP = process.env.SHOPIFY_DOMAIN || 'or-cre.com';
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || 'c6efa00d9c5d9849c6c13d59cca6ab82'; // public Storefront token already shipped in products/index.html
const API = `https://${SHOP}/api/2025-01/graphql.json`;

const template = await readFile('products/index.html', 'utf8');

// Single source of truth: reuse the handle lists already defined in the template.
const list = (name) => {
  const m = template.match(new RegExp(`const ${name}\\s*=\\s*\\[([^\\]]*)\\]`));
  return m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
};
const SKIP = new Set([...list('RETIRED_HANDLES'), ...list('COMING_SOON_HANDLES')]);

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const trunc = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');
const jsonLd = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

async function gql(query, variables) {
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (!r.ok) throw new Error(`Storefront API ${r.status}`);
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}

async function loadProducts() {
  const mock = process.argv.indexOf('--mock');
  if (mock > -1) return JSON.parse(await readFile(process.argv[mock + 1], 'utf8'));
  const out = [];
  let after = null;
  for (;;) {
    const d = await gql(
      `query($after:String){ products(first:50, after:$after){
        pageInfo{hasNextPage endCursor}
        edges{node{ id title handle description productType vendor tags updatedAt
          images(first:6){edges{node{url altText}}}
          variants(first:30){edges{node{ sku availableForSale price{amount currencyCode} }}} }}
      }}`,
      { after }
    );
    out.push(...d.products.edges.map((e) => e.node));
    if (!d.products.pageInfo.hasNextPage) break;
    after = d.products.pageInfo.endCursor;
  }
  return out;
}

function swap(html, re, replacement, label) {
  if (!re.test(html)) throw new Error(`Template placeholder not found: ${label}`);
  return html.replace(re, () => replacement);
}

function render(p) {
  const url = `${SITE}/products/${p.handle}/`;
  const title = `${clean(p.title)} · Ghost Town Ranch`;
  const desc = trunc(clean(p.description) || 'Skincare, fragrance, and home goods rooted in the American West. COSMOS-certified. Frontier Modernism.', 160);
  const images = p.images.edges.map((e) => e.node);
  const variants = p.variants.edges.map((e) => e.node);
  const prices = variants.map((v) => parseFloat(v.price.amount)).filter((n) => !Number.isNaN(n));
  const cur = variants[0]?.price.currencyCode || 'USD';
  const low = Math.min(...prices), high = Math.max(...prices);
  const inStock = variants.some((v) => v.availableForSale);
  const availability = `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`;
  const offer = prices.length > 1 && low !== high
    ? { '@type': 'AggregateOffer', priceCurrency: cur, lowPrice: low.toFixed(2), highPrice: high.toFixed(2), offerCount: variants.length, availability, url }
    : { '@type': 'Offer', priceCurrency: cur, price: low.toFixed(2), availability, itemCondition: 'https://schema.org/NewCondition', url };

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: clean(p.title),
    description: clean(p.description) || desc,
    url,
    brand: { '@type': 'Brand', name: 'Ghost Town Ranch' },
    offers: offer,
  };
  if (images.length) product.image = images.map((i) => i.url);
  if (variants[0]?.sku) product.sku = variants[0].sku;
  if (p.productType) product.category = p.productType;

  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ghost Town Ranch', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE}/shop/` },
      { '@type': 'ListItem', position: 3, name: clean(p.title), item: url },
    ],
  };

  let h = template;
  h = swap(h, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, 'title');
  h = swap(h, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(desc)}" />`, 'description');
  h = swap(h, /<meta id="og-title"[^>]*>/, `<meta id="og-title" property="og:title" content="${esc(title)}" />`, 'og-title');
  h = swap(h, /<meta id="og-description"[^>]*>/, `<meta id="og-description" property="og:description" content="${esc(desc)}" />`, 'og-description');
  h = swap(h, /<meta id="og-image"[^>]*>/, `<meta id="og-image" property="og:image" content="${esc(images[0]?.url || SITE + '/herogtr-v2.png')}" />`, 'og-image');
  h = swap(h, /<meta id="og-url"[^>]*>/, `<meta id="og-url" property="og:url" content="${url}" />`, 'og-url');
  h = swap(h, /<link rel="canonical" id="canonical"[^>]*>/, `<link rel="canonical" id="canonical" href="${url}" />`, 'canonical');
  h = swap(
    h,
    /<\/head>/,
    `<script type="application/ld+json">${jsonLd(product)}</script>\n<script type="application/ld+json">${jsonLd(crumbs)}</script>\n</head>`,
    'head close'
  );
  // Raw-HTML snapshot for crawlers that don't run JS. Hidden for people; same facts the live page shows.
  const snapshot = `<div hidden data-seo-snapshot><p><strong>${esc(clean(p.title))}</strong> — ${esc(cur === 'USD' ? '$' : cur + ' ')}${low.toFixed(2)}${prices.length > 1 && low !== high ? ' and up' : ''} · ${inStock ? 'In stock' : 'Currently unavailable'}</p><p>${esc(clean(p.description))}</p><p><a href="${SITE}/shop/">Shop all Ghost Town Ranch</a></p></div>`;
  h = swap(h, /<body[^>]*>/, (m) => m, 'body');
  h = h.replace(/<body[^>]*>/, (m) => `${m}\n${snapshot}`);
  return h;
}

const products = (await loadProducts()).filter((p) => p.handle && !SKIP.has(p.handle));
const built = [];
for (const p of products) {
  await mkdir(`products/${p.handle}`, { recursive: true });
  await writeFile(`products/${p.handle}/index.html`, render(p));
  built.push(p);
}

// Rebuild sitemap: keep existing non-product URLs, replace product URLs.
let sm = await readFile('sitemap.xml', 'utf8');
sm = sm.replace(/\s*<url>(?:(?!<\/url>)[\s\S])*?\/products\/[\s\S]*?<\/url>/g, '');
if (!sm.includes('xmlns:image')) sm = sm.replace('<urlset ', '<urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ');
const entries = built
  .map((p) => {
    const img = p.images.edges[0]?.node.url;
    return `  <url>\n    <loc>${SITE}/products/${p.handle}/</loc>\n    <lastmod>${(p.updatedAt || new Date().toISOString()).slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>${img ? `\n    <image:image><image:loc>${esc(img)}</image:loc></image:image>` : ''}\n  </url>`;
  })
  .join('\n');
sm = sm.replace('</urlset>', `${entries}\n</urlset>`);
await writeFile('sitemap.xml', sm);
console.log(`Built ${built.length} product pages (skipped ${products.length ? SKIP.size : 0} retired/coming-soon handles). Sitemap updated.`);
