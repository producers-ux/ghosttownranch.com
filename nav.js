/* Ghost Town Ranch — shared top navigation.
   Single source of truth for any page that injects the nav via:
     <script defer src="/nav.js"></script>
   Pages only need the empty container styling (nav, .nav-logo, .nav-links,
   .nav-hamburger) already present in their CSS. */
(function () {
  function build() {
    if (document.getElementById('gtr-shared-nav')) return;

    var path = (location.pathname || '').toLowerCase();
    function active(match) { return path.indexOf(match) !== -1 ? ' class="active"' : ''; }

    var nav = document.createElement('nav');
    nav.id = 'gtr-shared-nav';

    nav.innerHTML = [
      '<a class="nav-logo" href="/" aria-label="Ghost Town Ranch home">',
        '<img src="/ghost_town_ranch_bull_icon_filled_in_army_7c82d02c-6e27-47d3-9500-d2054537d8f0.png" alt="Ghost Town Ranch" style="height:28px;width:auto;display:block;">',
      '</a>',
      '<div class="nav-right">',
        '<ul class="nav-links" id="nav-links">',
          '<li><a href="/">Home</a></li>',
          '<li><a href="/wash-house/"' + active('/wash-house') + '>Wash House</a></li>',
          '<li><a href="/routines/"' + active('/routines') + '>Routines</a></li>',
          '<li><a href="/ritual/"' + active('/ritual') + '>Ritual</a></li>',
          '<li><a href="/collections/deep-well/"' + active('/deep-well') + '>Deep Well</a></li>',
          '<li><a href="/wholesale/"' + active('/wholesale') + '>Wholesale</a></li>',
        '</ul>',
        '<input id="gtr-nav-search" type="search" placeholder="Search the range" aria-label="Search products" style="display:none;width:190px;background:rgba(244,239,230,0.08);border:1px solid rgba(244,239,230,0.35);color:#F4EFE6;font-size:12px;letter-spacing:0.06em;padding:8px 12px;outline:none;">',
        '<button id="gtr-nav-search-btn" aria-label="Search" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;padding:0;margin:0;">',
          '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#F4EFE6" stroke-width="1.5" stroke-linecap="round" style="display:block;"><circle cx="9" cy="9" r="6.5"/><line x1="13.8" y1="13.8" x2="18" y2="18"/></svg>',
        '</button>',
        '<a href="/shop/" class="cart-nav-btn-open" aria-label="Shop All" style="display:flex;align-items:center;opacity:0.8;text-decoration:none;">',
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4EFE6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
        '</a>',
        '<button class="nav-hamburger" id="nav-hamburger" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button>',
      '</div>'
    ].join('');

    document.body.insertBefore(nav, document.body.firstChild);

    // Placeholder color for the search input.
    var st = document.createElement('style');
    st.textContent = '#gtr-nav-search::placeholder{color:rgba(244,239,230,0.5);} @media(max-width:900px){#gtr-nav-search{width:140px;}}';
    document.head.appendChild(st);

    // Search: opens the input, routes to the Shop All search surface.
    var sBtn = nav.querySelector('#gtr-nav-search-btn');
    var sInp = nav.querySelector('#gtr-nav-search');
    if (sBtn && sInp) {
      sBtn.addEventListener('click', function () {
        var hidden = sInp.style.display === 'none' || !sInp.style.display;
        sInp.style.display = hidden ? 'block' : 'none';
        if (hidden) sInp.focus();
      });
      sInp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && sInp.value.trim()) {
          location.href = '/shop/?q=' + encodeURIComponent(sInp.value.trim());
        } else if (e.key === 'Escape') {
          sInp.style.display = 'none';
        }
      });
    }

    var ham = nav.querySelector('#nav-hamburger');
    var links = nav.querySelector('#nav-links');
    if (ham && links) {
      ham.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        ham.classList.toggle('open', open);
        ham.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // Close the mobile menu when a link is tapped.
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('open');
          ham.classList.remove('open');
          ham.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
