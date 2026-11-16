/**
 * FITMATE Spatial 3D Navigation Portals Catalog
 * Defines all 10 immersive spatial environments across the FITMATE universe.
 */

export const spatialPortals = [
  {
    id: 'universe',
    path: '/',
    aliases: ['/collections', '/about', '/how-it-works'],
    kicker: 'PORTAL · 01',
    label: 'Main Fashion Universe',
    tagline: 'Grand Showroom Runway',
    description: 'Central haute-couture runway, architectural grand showroom & complete collections universe.',
    accent: '#d4af37',
    badge: 'GRAND SHOWROOM',
    icon: 'Sparkles',
  },
  {
    id: 'western',
    path: '/western-wear',
    aliases: ['/womens-fashion'],
    kicker: 'PORTAL · 02',
    label: 'Western Fashion',
    tagline: 'Modern Haute-Couture',
    description: 'Ready-to-wear dresses, tailored blazers, Japanese selvedge denim & silk column gowns.',
    accent: '#38bdf8',
    badge: 'READY-TO-WEAR',
    icon: 'Shirt',
  },
  {
    id: 'menswear',
    path: '/mens-fashion',
    aliases: [],
    kicker: 'PORTAL · 03',
    label: 'Men’s Fashion',
    tagline: 'Sartorial Men’s Atelier',
    description: 'Bespoke suits, barathea tuxedos, Bandhgala jackets, raw silk kurtas & sherwanis.',
    accent: '#dfc17b',
    badge: 'SARTORIAL ATELIER',
    icon: 'Crown',
  },
  {
    id: 'indian',
    path: '/indian-ethnic-wear',
    aliases: ['/indian-fashion-universe'],
    kicker: 'PORTAL · 04',
    label: 'Indian Ethnic Fashion',
    tagline: 'Royal Couture Palace',
    description: 'Majestic carved arches, authentic Banarasi & Kanjivaram silks, royal master textiles.',
    accent: '#10b981',
    badge: 'ROYAL PALACE',
    icon: 'Compass',
  },
  {
    id: 'diwali',
    path: '/diwali-world',
    aliases: ['/diwali-edit'],
    kicker: 'PORTAL · 05',
    label: 'Diwali Fashion World',
    tagline: 'Festive Runway & Diyas',
    description: 'Gleaming traditional diyas, marigold arches, celebratory runway & festive masterworks.',
    accent: '#f59e0b',
    badge: 'FESTIVE PALACE',
    icon: 'Flame',
  },
  {
    id: 'lehenga',
    path: '/lehenga-studio',
    aliases: ['/couture-lehenga-studio'],
    kicker: 'PORTAL · 06',
    label: 'Lehenga Studio',
    tagline: 'Couture Bridal Studio',
    description: 'Exclusive 24-kali flared lehengas, authentic gold zari jaal, mirror-work & reception silks.',
    accent: '#e09f9f',
    badge: 'BRIDAL COUTURE',
    icon: 'Layers',
  },
  {
    id: 'measurement',
    path: '/measurement-studio',
    aliases: ['/measurements', '/3d-body-measurements', '/my-fit-profile', '/body-measurements', '/digital-twin', '/avatar-studio', '/3d-avatar'],
    kicker: 'PORTAL · 07',
    label: 'Body Measurement Studio',
    tagline: '3D Anatomical Calibration',
    description: 'Interactive 3D body proportions, anatomical circumference markers & custom fit preferences.',
    accent: '#06b6d4',
    badge: '3D CALIBRATION',
    icon: 'UserCheck',
  },
  {
    id: 'fitting-room',
    path: '/virtual-fitting-room',
    aliases: ['/fitting-room', '/3d-try-on'],
    kicker: 'PORTAL · 08',
    label: 'Virtual Fitting Room',
    tagline: 'Real-Time 3D Try-On Suite',
    description: 'Live 3D avatar garment draping, XS through XXL multi-size comparison & 360° inspection.',
    accent: '#ec4899',
    badge: '3D TRY-ON',
    icon: 'Scissors',
  },
  {
    id: 'size-recommendations',
    path: '/find-my-size',
    aliases: ['/size-result', '/recommendation-results'],
    kicker: 'PORTAL · 09',
    label: 'Size Recommendations',
    tagline: 'Intelligent Fit Engine',
    description: 'Multi-brand size chart matching, fit ease comparison & precision recommendations.',
    accent: '#a855f7',
    badge: 'SIZE ENGINE',
    icon: 'Ruler',
  },
  {
    id: 'wardrobe',
    path: '/my-wardrobe',
    aliases: [],
    kicker: 'PORTAL · 10',
    label: 'My Wardrobe',
    tagline: '3D Walk-In Wardrobe',
    description: 'French-fluted walnut cabinetry, saved 3D garments, designer handbags & luxury footwear.',
    accent: '#c5a467',
    badge: 'WALK-IN SUITE',
    icon: 'Heart',
  },
]

/**
 * Identify active portal from current route pathname
 */
export function getActivePortal(pathname) {
  const clean = pathname.replace(/\/$/, '') || '/'

  // Exact match
  const exact = spatialPortals.find((p) => p.path === clean)
  if (exact) return exact

  // Alias match
  const alias = spatialPortals.find((p) => p.aliases.includes(clean))
  if (alias) return alias

  // Prefix match (except root)
  const prefix = spatialPortals.find((p) => p.path !== '/' && clean.startsWith(p.path))
  if (prefix) return prefix

  return spatialPortals[0]
}
