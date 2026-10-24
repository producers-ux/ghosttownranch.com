// Shared site footer. Replaces each page's <footer> so every page has the same links,
// with room at the bottom so the floating cart button never covers them.
(function () {
  if (location.pathname.indexOf('/yucca-valley') === 0) return;

  var css = [
    '#gtr-site-footer{display:block!important;padding:0!important;border:0!important;text-align:left!important;width:auto!important;max-width:none!important;background:#141414;color:#F6F6F3;font-family:"Jost",system-ui,sans-serif;font-weight:300;margin-top:0;}',
    '#gtr-site-footer *{box-sizing:border-box;}',
    '#gtr-site-footer .gf-in{max-width:1500px;margin:0 auto;padding:72px 48px 0;display:grid;grid-template-columns:1.4fr 1fr 1fr 1.3fr;gap:48px;}',
    '#gtr-site-footer .gf-brand img{width:40px;height:auto;display:block;opacity:.9;}',
    '#gtr-site-footer .gf-name{font-family:"PPEiko",Georgia,serif;font-size:22px;margin-top:18px;letter-spacing:.02em;}',
    '#gtr-site-footer .gf-line{font-size:14px;line-height:1.65;color:rgba(246,246,243,.7);margin-top:8px;max-width:300px;}',
    '#gtr-site-footer h4{font-family:"Jost",system-ui,sans-serif;font-weight:400;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#B9BDA8;margin:0 0 18px;}',
    '#gtr-site-footer ul{list-style:none;margin:0;padding:0;}',
    '#gtr-site-footer li{margin:0 0 12px;}',
    '#gtr-site-footer a{color:#F6F6F3;text-decoration:none;font-size:15px;border:0;padding:0;}',
    '#gtr-site-footer a:hover{text-decoration:underline;text-underline-offset:4px;text-decoration-color:rgba(246,246,243,.5);}',
    '#gtr-site-footer .gf-partners p{font-size:14px;line-height:1.65;color:rgba(246,246,243,.7);margin:0 0 20px;}',
    '#gtr-site-footer .gf-btn{display:inline-block;background:#F6F6F3;color:#141414;font-size:12px;letter-spacing:.18em;text-transform:uppercase;padding:15px 24px;}',
    '#gtr-site-footer .gf-btn:hover{background:#B9BDA8;text-decoration:none;}',
    '#gtr-site-footer .gf-mail{display:inline-block;margin-top:18px;font-size:14px;color:rgba(246,246,243,.85);}',
    '#gtr-site-footer .gf-base{max-width:1500px;margin:56px auto 0;padding:24px 48px 110px;border-top:1px solid rgba(246,246,243,.14);display:flex;justify-content:space-between;gap:12px 32px;flex-wrap:wrap;font-size:12px;letter-spacing:.06em;color:rgba(246,246,243,.5);}',
    '@media (max-width:980px){#gtr-site-footer .gf-in{grid-template-columns:1fr 1fr;}}',
    '@media (max-width:640px){#gtr-site-footer .gf-in{grid-template-columns:1fr 1fr;padding:56px 24px 0;gap:40px 24px;}#gtr-site-footer .gf-brand,#gtr-site-footer .gf-partners{grid-column:1/-1;}#gtr-site-footer .gf-base{padding:24px 24px 104px;}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var y = new Date().getFullYear();
  var f = document.createElement('footer');
  f.id = 'gtr-site-footer';
  f.setAttribute('itemscope', ''); f.setAttribute('itemtype', 'https://schema.org/Organization');
  f.innerHTML =
    '<div class="gf-in">' +
      '<div class="gf-brand"><img src="/ghost_town_ranch_bull_icon_filled_in_army_7c82d02c-6e27-47d3-9500-d2054537d8f0.png" alt="">' +
        '<div class="gf-name" itemprop="name">Ghost Town Ranch</div>' +
        '<p class="gf-line">A Frontier Modern apothecary, born in the high desert.</p>' +
        '<p class="gf-line"><a href="/#signup">Join the list</a> for 10% off your first order.</p></div>' +
      '<div><h4>Shop</h4><ul>' +
        '<li><a href="/shop/">Shop all</a></li><li><a href="/routines/">Face</a></li><li><a href="/hair/">Hair</a></li>' +
        '<li><a href="/wash-house/">Bath + Body</a></li><li><a href="/ritual/">Scent + Home</a></li><li><a href="/gifts/">Gifts</a></li></ul></div>' +
      '<div><h4>The Ranch</h4><ul>' +
        '<li><a href="/guest-ranch/">Guest Ranch</a></li><li><a href="/field-guide/">Our Story</a></li>' +
        '<li><a href="https://instagram.com/ghosttownranch" target="_blank" rel="noopener" itemprop="sameAs">Instagram</a></li>' +
        '<li><a href="mailto:howdy@ghosttownranch.com" itemprop="email">Contact</a></li></ul></div>' +
      '<div class="gf-partners"><h4>Partners</h4>' +
        '<p>Wholesale for shops, and amenities for hotels, rentals and spas.</p>' +
        '<a class="gf-btn" href="/wholesale/">Partner with us</a><br>' +
        '<a class="gf-mail" href="mailto:howdy@ghosttownranch.com">howdy@ghosttownranch.com</a></div>' +
    '</div>' +
    '<div class="gf-base"><span>&copy; ' + y + ' Ghost Town Ranch &middot; Pulp Media Lab, Inc.</span><span>Palm Springs, California</span></div>';

  var old = document.querySelector('body > footer, footer');
  if (old) old.replaceWith(f); else document.body.appendChild(f);
})();
