const categoriesSeed = [
  {
    name: 'Celebration Hampers',
    slug: 'celebration-hampers',
    description:
      'Grand crimson-and-gold festive, wedding, and milestone hampers wrapped in artisanal luxury.',
    highlightCoverImage: {
      url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=85',
      public_id: 'artistic_fusion/highlights/celebration_hampers',
    },
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Albums',
    slug: 'albums',
    description:
      'Hand-stitched heirloom memory books, linen photo journals, and bespoke scrapbooks.',
    highlightCoverImage: {
      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=85',
      public_id: 'artistic_fusion/highlights/albums',
    },
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Hampers',
    slug: 'hampers',
    description:
      'Thoughtfully curated pastel gift boxes tied with satin ribbons and botanical wax seals.',
    highlightCoverImage: {
      url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=85',
      public_id: 'artistic_fusion/highlights/hampers',
    },
    displayOrder: 3,
    isActive: true,
  },
  {
    name: 'Bouquets',
    slug: 'bouquets',
    description:
      'Everlasting dried botanicals, satin fabric blooms, and fresh-inspired artisanal arrangements.',
    highlightCoverImage: {
      url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=85',
      public_id: 'artistic_fusion/highlights/bouquets',
    },
    displayOrder: 4,
    isActive: true,
  },
  {
    name: 'A5 Frames',
    slug: 'a5-frames',
    description:
      'Pressed-flower keepsake frames and personalized A5 tabletop memory displays.',
    highlightCoverImage: {
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=85',
      public_id: 'artistic_fusion/highlights/a5_frames',
    },
    displayOrder: 5,
    isActive: true,
  },
  {
    name: 'Invitation Cards',
    slug: 'invitation-cards',
    description:
      'Deckle-edged cotton paper suites with gold foil calligraphy and hand-poured wax seals.',
    highlightCoverImage: {
      url: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=600&q=85',
      public_id: 'artistic_fusion/highlights/invitation_cards',
    },
    displayOrder: 6,
    isActive: true,
  },
  {
    name: 'Event Décor',
    slug: 'event-decor',
    description:
      'Bespoke table styling props, welcome easels, and intimate celebration keepsake accents.',
    highlightCoverImage: {
      url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=85',
      public_id: 'artistic_fusion/highlights/event_decor',
    },
    displayOrder: 7,
    isActive: true,
  },
];

const productsSeed = [
  {
    title: 'Wrapped "Just for You" Luxury Hamper Box',
    slug: 'wrapped-just-for-you-luxury-hamper',
    description:
      'Our signature round keepsake gift arrangement enclosed in crystal-clear protective wrapping, finished with a hand-tied satin ribbon and embossed "Just for you" keepsake tag. Filled with artisanal soy candle, gourmet pralines, rose mist, and a linen pocket journal.',
    price: 2499,
    compareAtPrice: 3499,
    stock: 14,
    categorySlug: 'hampers',
    subCategory: 'Gift Hampers',
    leadTimeDays: 2,
    inclusions: [
      'Handcrafted blush rigid round keepsake box',
      'Rose & vanilla hand-poured soy wax candle (180g)',
      'Box of 8 Belgian hazelnut truffles',
      'Linen-bound A6 gratitude notebook',
      'Satin ribbon bow & customized foil tag',
    ],
    dimensions: '28 cm diameter × 14 cm height · Cushion-packed outer shipping carton',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['Just for you', 'Happy Birthday', 'With Love', 'Congratulations'],
      ribbonColors: ['Blush Rose', 'Crimson Red', 'Royal Gold', 'Ivory'],
      requiresPhotoUpload: false,
      maxPhotosAllowed: 0,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/just_for_you_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/just_for_you_inside',
        isPrimary: false,
      },
    ],
    ratings: { average: 4.9, count: 64 },
    badges: ['BESTSELLER', 'NEW'],
    isActive: true,
  },
  {
    title: 'Royal Crimson & Gold Festive Celebration Trunk',
    slug: 'royal-crimson-gold-celebration-trunk',
    description:
      'Designed for milestone weddings, engagements, and festive gifting. This crimson-and-gold velvet-lined trunk unveils brass diyas, spiced almond brittle, Kashmiri kahwa blends, and preserved red roses.',
    price: 3899,
    compareAtPrice: 4999,
    stock: 9,
    categorySlug: 'celebration-hampers',
    subCategory: 'Celebration Hampers',
    leadTimeDays: 3,
    inclusions: [
      'Reusable crimson & gold foil magnetic trunk',
      'Pair of hand-etched brass tea-light holders',
      'Artisanal saffron & pistachio brittle jar (200g)',
      ' Kashmiri saffron kahwa loose-leaf tin',
      'Preserved velvet crimson rose accent & wax-sealed scroll',
    ],
    dimensions: '34 cm × 26 cm × 14 cm · Double-corrugated gift transit shield',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['Congratulations', 'Happy Anniversary', 'With Love', 'Just for you'],
      ribbonColors: ['Royal Gold', 'Crimson Red', 'Ivory'],
      requiresPhotoUpload: false,
      maxPhotosAllowed: 0,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/crimson_trunk_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/crimson_trunk_inside',
        isPrimary: false,
      },
    ],
    ratings: { average: 5.0, count: 47 },
    badges: ['BESTSELLER', 'LIMITED'],
    isActive: true,
  },
  {
    title: 'Heirloom Linen Handcrafted Memory Album',
    slug: 'heirloom-linen-handcrafted-memory-album',
    description:
      'Bound by hand in oatmeal pastel linen with gilded corners and deckle-edged archival cardstock pages. Upload up to 6 cherished photographs and our studio prints, mounts, and accents them with botanical vellum overlays.',
    price: 1899,
    compareAtPrice: 2599,
    stock: 16,
    categorySlug: 'albums',
    subCategory: 'Albums',
    leadTimeDays: 3,
    inclusions: [
      '40 archival ivory 300 GSM pages with glassine interleaves',
      'Complimentary studio printing & mounting of up to 6 customer photos',
      'Botanical pressed-leaf vellum title page',
      'Keepsake cotton muslin drawstring pouch',
    ],
    dimensions: '24 cm × 22 cm × 4 cm (Fits 4×6" and Polaroid prints)',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['Our Forever Story', 'Happy Birthday', 'With Love', 'Just for you'],
      ribbonColors: ['Blush Rose', 'Ivory', 'Royal Gold'],
      requiresPhotoUpload: true,
      maxPhotosAllowed: 6,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/linen_album_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/linen_album_inside',
        isPrimary: false,
      },
    ],
    ratings: { average: 4.9, count: 52 },
    badges: ['BESTSELLER'],
    isActive: true,
  },
  {
    title: 'Pastel Peony & Dried Baby’s Breath Keepsake Bouquet',
    slug: 'pastel-peony-dried-keepsake-bouquet',
    description:
      'An everlasting couture bouquet crafted from handcrafted mulberry-silk peonies, preserved eucalyptus, and cloud-white gypsophila wrapped in layered Korean frosted paper and trailing satin ribbon.',
    price: 1599,
    compareAtPrice: 2199,
    stock: 18,
    categorySlug: 'bouquets',
    subCategory: 'Bouquets',
    leadTimeDays: 2,
    inclusions: [
      '7 handcrafted blush & ivory silk peony stems',
      'Preserved eucalyptus & natural dried baby’s breath',
      'Layered waterproof pastel frosted wrap & satin bow',
      ' hanging calligraphy message tag',
    ],
    dimensions: '42 cm height × 28 cm bouquet spread',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['Just for you', 'With Love', 'Happy Birthday', 'Congratulations'],
      ribbonColors: ['Blush Rose', 'Crimson Red', 'Ivory', 'Royal Gold'],
      requiresPhotoUpload: false,
      maxPhotosAllowed: 0,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/peony_bouquet_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/peony_bouquet_detail',
        isPrimary: false,
      },
    ],
    ratings: { average: 4.8, count: 39 },
    badges: ['NEW'],
    isActive: true,
  },
  {
    title: 'Botanical Pressed-Flower A5 Keepsake Photo Frame',
    slug: 'botanical-pressed-flower-a5-frame',
    description:
      'Double-glass solid oak and brushed-brass A5 floating frame cradling real pressed meadow florals around your uploaded photograph and hand-lettered date or quote.',
    price: 1199,
    compareAtPrice: 1699,
    stock: 20,
    categorySlug: 'a5-frames',
    subCategory: 'A5 Frames',
    leadTimeDays: 2,
    inclusions: [
      'A5 double-pane floating glass & warm wood/gold frame',
      'Real preserved pressed delphinium, fern, andqueen anne’s lace',
      'High-definition studio matte photo print mounted inside',
      'Gift-wrapped in pastel tissue with ribbon tie',
    ],
    dimensions: '21 cm × 15 cm × 2.5 cm (Standard A5 Tabletop)',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['Just for you', 'With Love', 'Happy Anniversary', 'Happy Birthday'],
      ribbonColors: ['Royal Gold', 'Blush Rose', 'Ivory'],
      requiresPhotoUpload: true,
      maxPhotosAllowed: 2,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/a5_frame_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/a5_frame_inside',
        isPrimary: false,
      },
    ],
    ratings: { average: 4.9, count: 44 },
    badges: ['BESTSELLER'],
    isActive: true,
  },
  {
    title: 'Wax-Sealed Cotton Paper Invitation Suite (Set of 10)',
    slug: 'wax-sealed-cotton-invitation-suite',
    description:
      'Handmade 320 GSM deckle-edged cotton cards paired with blush envelopes, botanical vellum belly bands, silk ribbons, and antique gold botanical wax seals for intimate weddings and soirées.',
    price: 1499,
    compareAtPrice: 1999,
    stock: 15,
    categorySlug: 'invitation-cards',
    subCategory: 'Invitation Cards',
    leadTimeDays: 3,
    inclusions: [
      '10 deckle-edged handmade cotton invitation cards (5×7")',
      '10 blush pastel envelopes with gold foil liners',
      '10 translucent botanical vellum wraps & hand-stamped gold wax seals',
    ],
    dimensions: '18 cm × 13 cm boxed suite',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['You Are Invited', 'Save The Date', 'Celebrate With Us', 'With Love'],
      ribbonColors: ['Royal Gold', 'Blush Rose', 'Crimson Red', 'Ivory'],
      requiresPhotoUpload: false,
      maxPhotosAllowed: 0,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/invitation_suite_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/invitation_suite_inside',
        isPrimary: false,
      },
    ],
    ratings: { average: 4.8, count: 27 },
    badges: ['NEW'],
    isActive: true,
  },
  {
    title: 'Blush & Brass Intimate Table Styling Décor Kit',
    slug: 'blush-brass-table-styling-decor-kit',
    description:
      'Transform a birthday dinner, proposal table, or bridal brunch in minutes. Includes gauze table runner, tapered pastel candles with brass holders, place-card easels, and dried floral bud arrangements.',
    price: 2999,
    compareAtPrice: 3999,
    stock: 7,
    categorySlug: 'event-decor',
    subCategory: 'Event Décor',
    leadTimeDays: 2,
    inclusions: [
      '3-meter hand-dyed blush cheesecloth table runner',
      '4 brushed-gold taper candle holders + dripless ivory tapers',
      '2 mini ceramic bud vases with dried bunny tails & lagurus',
      '6 gold-edged calligraphy place cards',
    ],
    dimensions: '36 cm × 28 cm × 12 cm storage keepsake box',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['Congratulations', 'Happy Birthday', 'With Love', 'Just for you'],
      ribbonColors: ['Royal Gold', 'Blush Rose', 'Ivory'],
      requiresPhotoUpload: false,
      maxPhotosAllowed: 0,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/event_decor_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/event_decor_inside',
        isPrimary: false,
      },
    ],
    ratings: { average: 4.9, count: 31 },
    badges: ['NEW'],
    isActive: true,
  },
  {
    title: 'Rose & Ferrero Golden Treats Presentation Box',
    slug: 'rose-golden-treats-presentation-box',
    description:
      'An open-window keepsake presentation box pairing velvet preserved red roses with golden hazelnut confections, fairy micro-lights, and a personalized satin ribbon.',
    price: 1999,
    compareAtPrice: 2699,
    stock: 11,
    categorySlug: 'celebration-hampers',
    subCategory: 'Celebration Hampers',
    leadTimeDays: 1,
    inclusions: [
      'Acrylic-lid drawer keepsake presentation box',
      '6 preserved crimson roses in floral foam bed',
      '12 golden hazelnut praline spheres',
      'Warm white copper-wire fairy light strand',
    ],
    dimensions: '25 cm × 25 cm × 13 cm',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['With Love', 'Just for you', 'Happy Anniversary', 'Happy Birthday'],
      ribbonColors: ['Crimson Red', 'Royal Gold', 'Blush Rose'],
      requiresPhotoUpload: false,
      maxPhotosAllowed: 0,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/rose_golden_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/rose_golden_inside',
        isPrimary: false,
      },
    ],
    ratings: { average: 4.9, count: 73 },
    badges: ['BESTSELLER'],
    isActive: true,
  },
  {
    title: 'Stationery & Floral Flat-Lay Desk Care Hamper',
    slug: 'stationery-floral-desk-care-hamper',
    description:
      'A serene pastel gift box curated for journal lovers, creators, and thoughtful thank-yous. Features brass fountain pen clip, floral planner pad, botanical bookmark, and chamomile tea.',
    price: 1699,
    compareAtPrice: 2299,
    stock: 3,
    categorySlug: 'hampers',
    subCategory: 'Gift Hampers',
    leadTimeDays: 2,
    inclusions: [
      'Hardcover botanical dot-grid journal',
      'Washi tape trio & brass binder clip',
      'Pressed petal resin bookmark',
      'Artisanal chamomile & lavender tea tube',
    ],
    dimensions: '26 cm × 22 cm × 9 cm',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['Just for you', 'Congratulations', 'Thank You', 'Happy Birthday'],
      ribbonColors: ['Blush Rose', 'Ivory', 'Royal Gold'],
      requiresPhotoUpload: false,
      maxPhotosAllowed: 0,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/stationery_hamper_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/stationery_hamper_inside',
        isPrimary: false,
      },
    ],
    ratings: { average: 4.8, count: 29 },
    badges: ['LIMITED'],
    isActive: true,
  },
  {
    title: 'Vintage Accordion Pull-Out Photo Keepsake Box',
    slug: 'vintage-accordion-photo-keepsake-box',
    description:
      'Untie the silk bow and pull the lid to reveal a cascading 8-panel photo story accordion crafted on heavyweight kraft & ivory cardstock with gold hand-lettered captions.',
    price: 999,
    compareAtPrice: 1499,
    stock: 22,
    categorySlug: 'albums',
    subCategory: 'Albums',
    leadTimeDays: 2,
    inclusions: [
      'Rigid pastel keepsake pull-box with satin ribbon pull-tab',
      '8-panel accordion fold with studio-printed customer photos',
      'Mini wax-sealed love note envelope tucked at base',
    ],
    dimensions: '13 cm × 13 cm × 6 cm',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['With Love', 'Just for you', 'Happy Birthday', 'Happy Anniversary'],
      ribbonColors: ['Crimson Red', 'Blush Rose', 'Royal Gold', 'Ivory'],
      requiresPhotoUpload: true,
      maxPhotosAllowed: 6,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/accordion_box_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/accordion_box_inside',
        isPrimary: false,
      },
    ],
    ratings: { average: 4.9, count: 84 },
    badges: ['BESTSELLER'],
    isActive: true,
  },
  {
    title: 'Crimson Velvet Rose & Satin Boutique Bag',
    slug: 'crimson-velvet-rose-boutique-bag',
    description:
      'Presented in our signature structured pastel gift bag with an oversized satin bow, cradling velvet roses, scented wax sachet, and artisan dark chocolate bar.',
    price: 1299,
    compareAtPrice: 1799,
    stock: 19,
    categorySlug: 'bouquets',
    subCategory: 'Bouquets',
    leadTimeDays: 1,
    inclusions: [
      'Structured boutique presentation bag with delicate satin bow',
      '5 preserved velvet roses & eucalyptus sprigs',
      'Botanical scented wardrobe wax tablet',
      'Single-origin raspberry dark chocolate bar',
    ],
    dimensions: '24 cm × 20 cm × 11 cm',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['Just for you', 'With Love', 'Happy Birthday', 'Congratulations'],
      ribbonColors: ['Blush Rose', 'Crimson Red', 'Royal Gold'],
      requiresPhotoUpload: false,
      maxPhotosAllowed: 0,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/boutique_bag_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/boutique_bag_inside',
        isPrimary: false,
      },
    ],
    ratings: { average: 4.8, count: 35 },
    badges: ['NEW'],
    isActive: true,
  },
  {
    title: 'Calligraphy Vow & Polaroid A5 Shadow Frame',
    slug: 'calligraphy-vow-polaroid-a5-frame',
    description:
      'Deep A5 shadow-box keepsake pairing your favorite snapshot beside deckle-edged calligraphy script and a miniature dried rosebud.',
    price: 1349,
    compareAtPrice: 1899,
    stock: 13,
    categorySlug: 'a5-frames',
    subCategory: 'A5 Frames',
    leadTimeDays: 2,
    inclusions: [
      'Solid pine ivory-washed A5 shadow box frame',
      'Mounted Polaroid-style print on cotton mat',
      'Mini preserved rosebud with gold wax seal',
    ],
    dimensions: '21 cm × 15 cm × 3.5 cm',
    isCustomizable: true,
    customizationOptions: {
      allowCustomTag: true,
      defaultTags: ['Forever & Always', 'Happy Anniversary', 'With Love', 'Just for you'],
      ribbonColors: ['Ivory', 'Royal Gold', 'Blush Rose'],
      requiresPhotoUpload: true,
      maxPhotosAllowed: 2,
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/shadow_frame_front',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85',
        public_id: 'artistic_fusion/products/shadow_frame_inside',
        isPrimary: false,
      },
    ],
    ratings: { average: 5.0, count: 22 },
    badges: ['NEW'],
    isActive: true,
  },
];

const instagramPostsSeed = [
  {
    caption:
      'Wrapped "Just for you" gift arrangement finished with a lush blush satin bow and botanical tag ✨',
    handle: '@artisticfusion.in',
    imageUrl:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=85',
    isReel: false,
    likesCount: 418,
    productSlugs: ['wrapped-just-for-you-luxury-hamper'],
    displayOrder: 1,
  },
  {
    caption:
      'Curated flat-lay gift set with assorted handmade stationery, brass accents, and dried florals 🌸',
    handle: '@artisticfusion.in',
    imageUrl:
      'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=85',
    isReel: false,
    likesCount: 356,
    productSlugs: ['stationery-floral-desk-care-hamper', 'wax-sealed-cotton-invitation-suite'],
    displayOrder: 2,
  },
  {
    caption:
      'Behind the ribbon: assembling our signature presentation paper bag with delicate satin bow 🎀',
    handle: '@artisticfusion.in',
    imageUrl:
      'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=800&q=85',
    isReel: true,
    likesCount: 612,
    productSlugs: ['crimson-velvet-rose-boutique-bag', 'pastel-peony-dried-keepsake-bouquet'],
    displayOrder: 3,
  },
  {
    caption:
      'Unboxing magic: decorated open presentation box with velvet red roses and golden treats ✨🌹',
    handle: '@artisticfusion.in',
    imageUrl:
      'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=85',
    isReel: true,
    likesCount: 789,
    productSlugs: ['rose-golden-treats-presentation-box'],
    displayOrder: 4,
  },
  {
    caption:
      'Red-and-gold decorative celebration trunk crafted for wedding welcomes and festive milestones 🪔',
    handle: '@artisticfusion.in',
    imageUrl:
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=85',
    isReel: false,
    likesCount: 524,
    productSlugs: ['royal-crimson-gold-celebration-trunk', 'blush-brass-table-styling-decor-kit'],
    displayOrder: 5,
  },
  {
    caption:
      'Ribbon-wrapped floral keepsake boxes & pressed-flower frames ready to leave our craft table 💌',
    handle: '@artisticfusion.in',
    imageUrl:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=85',
    isReel: false,
    likesCount: 447,
    productSlugs: [
      'botanical-pressed-flower-a5-frame',
      'heirloom-linen-handcrafted-memory-album',
    ],
    displayOrder: 6,
  },
];

module.exports = {
  categoriesSeed,
  productsSeed,
  instagramPostsSeed,
};
