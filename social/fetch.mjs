// Fetch featured image (and up to 3 more) + price for each handle in tiers.json into social/assets/
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const DOMAIN='muq7w3-im.myshopify.com', TOKEN='c6efa00d9c5d9849c6c13d59cca6ab82';
const tiers=JSON.parse(await readFile('social/tiers.json','utf8'));
const handles=[...new Set(Object.values(tiers).flat().map(x=>x[0]))];
await mkdir('social/assets',{recursive:true});
const q='query{'+handles.map((h,i)=>`p${i}:product(handle:${JSON.stringify(h)}){ handle title vendor availableForSale priceRange{ minVariantPrice{ amount } maxVariantPrice{ amount } } images(first:4){ nodes{ url } } }`).join(' ')+'}';
const r=await fetch(`https://${DOMAIN}/api/2025-01/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':TOKEN},body:JSON.stringify({query:q})});
const j=await r.json(); const meta={};
for (let i=0;i<handles.length;i++){ const p=j.data&&j.data['p'+i]; if(!p) continue;
  meta[p.handle]={title:p.title,vendor:p.vendor,available:p.availableForSale,min:p.priceRange.minVariantPrice.amount,max:p.priceRange.maxVariantPrice.amount,images:[]};
  let k=0; for (const n of p.images.nodes){ const u=n.url+(n.url.includes('?')?'&':'?')+'width=1600'; const b=Buffer.from(await (await fetch(u)).arrayBuffer()); const ext=(n.url.split('?')[0].split('.').pop()||'jpg').toLowerCase(); const f=`social/assets/${p.handle}-${k}.${ext}`; await writeFile(f,b); meta[p.handle].images.push(f); k++; }
}
await writeFile('social/assets/meta.json',JSON.stringify(meta,null,1));
console.log(Object.keys(meta).length,'products');
