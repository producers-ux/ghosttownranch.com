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
        '<a href="/shop/" class="cart-nav-btn-open" aria-label="Shop All" style="display:flex;align-items:center;opacity:0.8;text-decoration:none;">',
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4EFE6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
        '</a>',
        '<button class="nav-hamburger" id="nav-hamburger" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button>',
      '</div>'
    ].join('');

    document.body.insertBefore(nav, document.body.firstChild);

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
