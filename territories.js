// Territories: The Bull. One product page, with City and Colorway as options.
// Each print is its own Tejas Country Club product (Shopify Collective), so orders
// still route to Tejas for printing. The page at /products/gtr-territories-collection-the-bull/
// stitches them together. To add or drop a print, edit this list only.
// Every print is sold in 24″×36″ only, at the same price.
window.GTR_TERRITORIES = {
  handle: 'gtr-territories-collection-the-bull',
  title: 'The Bull',
  size: '24″×36″',
  colors: ['Olive Green', 'Rust', 'Sky Blue'],
  prints: [
    { city: 'Joshua Tree', color: 'Olive Green', handle: 'ghost-town-ranch-skull-joshua-tree-olive-green-1' },
    { city: 'Joshua Tree', color: 'Rust',        handle: 'ghost-town-ranch-skull-joshua-tree-red-orange' },
    { city: 'Park City',   color: 'Olive Green', handle: 'park-city-olive-24-x-36' },
    { city: 'Park City',   color: 'Rust',        handle: 'park-city-rust-24-x-36' },
    { city: 'Park City',   color: 'Sky Blue',    handle: 'park-city-blue-24-x-36' },
    { city: 'Midway',      color: 'Olive Green', handle: 'midway-olive-24-x-36' },
    { city: 'Midway',      color: 'Rust',        handle: 'midway-rust-24-x-36' },
    { city: 'Bozeman',     color: 'Olive Green', handle: 'bozeman-olive-24-x-36' },
    { city: 'Bozeman',     color: 'Sky Blue',    handle: 'bozeman-blue-24-x-36' },
    { city: 'Ketchum',     color: 'Olive Green', handle: 'ketchum-olive-24-x-36' },
    { city: 'Ketchum',     color: 'Rust',        handle: 'ketchum-rust-24-x-36' },
    { city: 'Gig Harbor',  color: 'Olive Green', handle: 'gig-harbor-olive-24-x-36' },
    { city: 'Gig Harbor',  color: 'Rust',        handle: 'gig-harbor-rust-24-x-36' },
    { city: 'Gig Harbor',  color: 'Sky Blue',    handle: 'gig-harbor-blue-24-x-36' },
    { city: 'Los Olivos',  color: 'Rust',        handle: 'los-olivos-rust-24-x-36' },
    { city: 'Los Olivos',  color: 'Sky Blue',    handle: 'los-olivos-blue-24-x-36' },
    { city: 'Santa Ynez',  color: 'Olive Green', handle: 'santa-ynez-olive-24-x-36' },
    { city: 'Santa Ynez',  color: 'Rust',        handle: 'santa-ynez-rust-24-x-36' },
    { city: 'St. George',  color: 'Sky Blue',    handle: 'st-george-blue-24-x-36' }
  ]
};
window.GTR_TERRITORIES.byHandle = window.GTR_TERRITORIES.prints.reduce(function (m, p) { m[p.handle] = p; return m; }, {});
