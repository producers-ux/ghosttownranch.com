// Territories: The Bull. One product page, with City, Colorway and Size as options.
// Each print is its own Tejas Country Club product (Shopify Collective), so orders
// still route to Tejas for printing. The page at /products/gtr-territories-collection-the-bull/
// stitches them together. To add or drop a print, edit this list only.
// A print is one city + colorway + size. Some Tejas products are one size each
// (e.g. park-city-olive-24-x-36); others carry every size as variants, so the same
// handle appears once per size and the page picks the variant whose title matches.
(function () {
  var L = '24″×36″', M = '16″×20″';
  var prints = [
    // 24″×36″
    ['Joshua Tree', 'Olive Green', L, 'ghost-town-ranch-skull-joshua-tree-olive-green-1'],
    ['Joshua Tree', 'Rust',        L, 'ghost-town-ranch-skull-joshua-tree-red-orange'],
    ['29 Palms',    'Olive Green', L, 'ghost-town-ranch-skull-29-palms-olive-green-art-print'],
    ['29 Palms',    'Rust',        L, 'ghost-town-ranch-skull-29-palms-rusty-red-orange-art-print'],
    ['29 Palms',    'Sky Blue',    L, 'ghost-town-ranch-skull-29-palms-dusty-blue-art-print'],
    ['Palm Springs', 'Olive Green', L, 'ghost-town-ranch-skull-palm-springs-olive-green'],
    ['Desert Hot Springs', 'Rust', L, 'ghost-town-ranch-desert-hot-springs-desert-rust'],
    ['Park City',   'Olive Green', L, 'park-city-olive-24-x-36'],
    ['Park City',   'Rust',        L, 'park-city-rust-24-x-36'],
    ['Park City',   'Sky Blue',    L, 'park-city-blue-24-x-36'],
    ['Midway',      'Olive Green', L, 'midway-olive-24-x-36'],
    ['Midway',      'Rust',        L, 'midway-rust-24-x-36'],
    ['Bozeman',     'Olive Green', L, 'bozeman-olive-24-x-36'],
    ['Bozeman',     'Sky Blue',    L, 'bozeman-blue-24-x-36'],
    ['Ketchum',     'Olive Green', L, 'ketchum-olive-24-x-36'],
    ['Ketchum',     'Rust',        L, 'ketchum-rust-24-x-36'],
    ['Gig Harbor',  'Olive Green', L, 'gig-harbor-olive-24-x-36'],
    ['Gig Harbor',  'Rust',        L, 'gig-harbor-rust-24-x-36'],
    ['Gig Harbor',  'Sky Blue',    L, 'gig-harbor-blue-24-x-36'],
    ['Los Olivos',  'Rust',        L, 'los-olivos-rust-24-x-36'],
    ['Los Olivos',  'Sky Blue',    L, 'los-olivos-blue-24-x-36'],
    ['Santa Ynez',  'Olive Green', L, 'santa-ynez-olive-24-x-36'],
    ['Santa Ynez',  'Rust',        L, 'santa-ynez-rust-24-x-36'],
    ['St. George',  'Sky Blue',    L, 'st-george-blue-24-x-36'],
    // 16″×20″
    ['Joshua Tree', 'Olive Green', M, 'ghost-town-ranch-skull-joshua-tree-olive-green-1'],
    ['Joshua Tree', 'Rust',        M, 'ghost-town-ranch-skull-joshua-tree-red-orange'],
    ['29 Palms',    'Olive Green', M, 'ghost-town-ranch-skull-29-palms-olive-green-art-print'],
    ['29 Palms',    'Rust',        M, 'ghost-town-ranch-skull-29-palms-rusty-red-orange-art-print'],
    ['29 Palms',    'Sky Blue',    M, 'ghost-town-ranch-skull-29-palms-dusty-blue-art-print'],
    ['Palm Springs', 'Olive Green', M, 'ghost-town-ranch-skull-palm-springs-olive-green'],
    ['Desert Hot Springs', 'Rust', M, 'ghost-town-ranch-desert-hot-springs-desert-rust'],
    ['Park City',   'Olive Green', M, 'park-city-olive-16-x-20'],
    ['Park City',   'Sky Blue',    M, 'park-city-blue-16-x-20'],
    ['Midway',      'Rust',        M, 'midway-rust-16-x20'],
    ['Midway',      'Sky Blue',    M, 'midway-blue-16-x-20'],
    ['Bozeman',     'Olive Green', M, 'bozeman-olive-16-x-20'],
    ['Bozeman',     'Rust',        M, 'bozeman-rust-16-x-20'],
    ['Bozeman',     'Sky Blue',    M, 'bozeman-blue-16-x-20'],
    ['Ketchum',     'Rust',        M, 'ketchum-rust-16-x-20'],
    ['Ketchum',     'Sky Blue',    M, 'ketchum-blue-16-x-20'],
    ['Gig Harbor',  'Olive Green', M, 'gig-harbor-olive-16-x-20'],
    ['Gig Harbor',  'Sky Blue',    M, 'gig-harbor-blue-16-x-20'],
    ['Los Olivos',  'Olive Green', M, 'los-olivos-olive-16-x-20'],
    ['Los Olivos',  'Sky Blue',    M, 'los-olivos-blue-16-x-20'],
    ['Santa Ynez',  'Sky Blue',    M, 'santa-ynez-blue-16-x-20'],
    ['St. George',  'Olive Green', M, 'st-george-olive-16-x-20']
  ].map(function (r) { return { city: r[0], color: r[1], size: r[2], handle: r[3] }; });
  window.GTR_TERRITORIES = {
    handle: 'gtr-territories-collection-the-bull',
    title: 'The Bull',
    size: L, // default size
    sizes: [M, L],
    colors: ['Olive Green', 'Rust', 'Sky Blue'],
    prints: prints,
    // First entry per handle (24″×36″ when the handle has both), for old links and the cart.
    byHandle: prints.reduce(function (m, p) { if (!m[p.handle]) m[p.handle] = p; return m; }, {})
  };
})();
