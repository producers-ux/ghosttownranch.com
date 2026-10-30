(function () {
  const links = [
    { href: '/shop/', label: 'Shop' },
    { href: '/routines/', label: 'Face' },
    { href: '/hair/', label: 'Hair' },
    { href: '/wash-house/', label: 'Bath + Body' },
    { href: '/ritual/', label: 'Scent + Home' },
    { href: '/travel/', label: 'Travel' },
    { href: '/guest-ranch/', label: 'Guest Ranch' },
  ];

  const path = window.location.pathname;

  const nav = document.createElement('nav');
  nav.id = 'gtr-shared-nav';
  nav.innerHTML = `
    <a class="nav-logo" href="/" aria-label="Ghost Town Ranch home">
      <img src="/GTRlogo.png" alt="Ghost Town Ranch"
        onerror="this.style.display='none';this.parentNode.innerHTML='<span style=\\'font-family:Georgia,serif;font-size:13px;letter-spacing:0.22em;text-transform:uppercase;color:#F6F6F3;\\'>Ghost Town Ranch</span>'">
    </a>
    <div class="nav-right">
      <ul class="nav-links" id="gtr-nav-links">
        ${links.map(l => `
          <li><a href="${l.href}"${path.startsWith(l.href) ? ' class="active"' : ''}>${l.label}</a></li>
        `).join('')}
      </ul>
      <button class="nav-hamburger" id="gtr-nav-btn" aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;

  document.body.prepend(nav);

  const btn  = document.getElementById('gtr-nav-btn');
  const list = document.getElementById('gtr-nav-links');

  btn.addEventListener('click', function () {
    const open = list.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  list.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      list.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();
