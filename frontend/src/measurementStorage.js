const storageKey = 'fitmate.measurements.v1'
const accountStorageKey = 'fitmate.account.v1'
const recentChecksStorageKey = 'fitmate.recent-checks.v1'
const wardrobeStorageKey = 'fitmate.wardrobe.v1'
const selectedGarmentStorageKey = 'fitmate.selected-garment.v1'
const avatarConfigStorageKey = 'fitmate.avatar-config.v1'
const activeRecommendationStorageKey = 'fitmate.active-recommendation.v1'

export const CURATED_DEMO_WARDROBE_GARMENTS = [
  {
    id: 'w-banarasi-lehenga',
    audience: 'Women',
    collection: 'Indian Ethnic',
    category: 'Lehengas',
    clothingType: 'Lehenga choli',
    brandId: 'sabyasachi-heritage',
    brand: 'Sabyasachi Heritage',
    productName: 'Royal Kashi Banarasi Lehenga',
    name: 'Royal Kashi Banarasi Lehenga',
    occasion: 'Wedding',
    garmentAssetId: 'garmentBridalLehenga',
    silhouette: 'lehenga',
    fabric: 'banarasi-silk',
    color: '#8f1d2e',
    colorName: 'Sindoor Crimson & Antique Zari',
    price: '₹ 1,85,000',
    notes: '24-kali flared skirt with authentic gold zari jaal and tissue dupatta.',
  },
  {
    id: 'kanjivaram-heritage-saree',
    audience: 'Women',
    collection: 'Indian Ethnic',
    category: 'Sarees',
    clothingType: 'Saree',
    brandId: 'raw-mango-couture',
    brand: 'Raw Mango',
    productName: 'Temple Border Kanjivaram Silk Saree',
    name: 'Temple Border Kanjivaram Silk Saree',
    occasion: 'Diwali',
    garmentAssetId: 'garmentKanjivaramSaree',
    silhouette: 'saree',
    fabric: 'silk',
    color: '#d4af37',
    colorName: 'Temple Gold & Forest Green',
    price: '₹ 94,500',
    notes: 'Pure mulberry silk with korvai weaving and heavy zari pallu.',
  },
  {
    id: 'w-slip-dress',
    audience: 'Women',
    collection: 'Western',
    category: 'Dresses',
    clothingType: 'Dress',
    brandId: 'fitmate-atelier',
    brand: 'FITMATE Haute-Couture',
    productName: 'Evening Column Silk Charmeuse Dress',
    name: 'Evening Column Silk Charmeuse Dress',
    occasion: 'Gala',
    garmentAssetId: 'garmentDress',
    silhouette: 'dress',
    fabric: 'silk',
    color: '#8a2335',
    colorName: 'Burmese Ruby Charmeuse',
    price: '€ 1,450',
    notes: 'Bias-cut liquid mulberry silk with delicate rouleau straps and sweeping hem.',
  },
  {
    id: 'w-tailored-blazer',
    audience: 'Women',
    collection: 'Western',
    category: 'Blazers & Jackets',
    clothingType: 'Blazer',
    brandId: 'massimo-dutti-studio',
    brand: 'Massimo Dutti Studio',
    productName: 'Atelier Tailored Double-Breasted Blazer',
    name: 'Atelier Tailored Double-Breasted Blazer',
    occasion: 'Formal',
    garmentAssetId: 'garmentJacketBlazer',
    silhouette: 'blazer',
    fabric: 'wool',
    color: '#2b2926',
    colorName: 'Anthracite Fine Wool',
    price: '€ 590',
    notes: 'Double-breasted Italian wool canvassing with peaked silk lapels.',
  },
  {
    id: 'm-wedding-sherwani',
    audience: 'Men',
    collection: 'Men’s',
    category: 'Sherwanis & Kurtas',
    clothingType: 'Sherwani',
    brandId: 'manish-malhotra-bespoke',
    brand: 'Manish Malhotra Bespoke',
    productName: 'Imperial Hand-Embroidered Raw Silk Sherwani',
    name: 'Imperial Hand-Embroidered Raw Silk Sherwani',
    occasion: 'Wedding',
    garmentAssetId: 'garmentWeddingSherwani',
    silhouette: 'sherwani',
    fabric: 'zari-gold',
    color: '#dfc07e',
    colorName: 'Nawabi Zari Gold',
    price: '₹ 2,40,000',
    notes: 'Hand-embroidered zardozi bullion stitch on structured ivory raw silk.',
  },
  {
    id: 'm-mens-kurta',
    audience: 'Men',
    collection: 'Men’s',
    category: 'Sherwanis & Kurtas',
    clothingType: 'Kurta',
    brandId: 'anita-dongre-man',
    brand: 'Anita Dongre Man',
    productName: 'Pure Raw Silk Royal Kurta',
    name: 'Pure Raw Silk Royal Kurta',
    occasion: 'Festive',
    garmentAssetId: 'garmentMensKurta',
    silhouette: 'kurta',
    fabric: 'silk',
    color: '#16233b',
    colorName: 'Badshahi Navy Raw Silk',
    price: '₹ 38,000',
    notes: 'Mandarin collar calf-length tailored silhouette with concealed placket.',
  },
  {
    id: 'm-italian-tuxedo',
    audience: 'Men',
    collection: 'Men’s',
    category: 'Suits & Tailoring',
    clothingType: 'Suit',
    brandId: 'raymond-sartorial',
    brand: 'Raymond Sartorial',
    productName: 'Sartorial Midnight Barathea Tuxedo',
    name: 'Sartorial Midnight Barathea Tuxedo',
    occasion: 'Formal',
    garmentAssetId: 'garmentJacketBlazer',
    silhouette: 'blazer',
    fabric: 'wool',
    color: '#121418',
    colorName: 'Midnight Barathea Wool',
    price: '₹ 65,000',
    notes: 'Super 150s wool barathea with grosgrain silk peak lapels and satin side stripes.',
  },
  {
    id: 'acc-luxury-clutch',
    audience: 'Women',
    collection: 'Accessories',
    category: 'Handbags & Accessories',
    clothingType: 'Handbag',
    brandId: 'fitmate-accessories',
    brand: 'FITMATE Leather Goods',
    productName: 'Gilded Minaudière Evening Clutch',
    name: 'Gilded Minaudière Evening Clutch',
    occasion: 'Gala',
    garmentAssetId: 'handbagAccessory',
    silhouette: 'handbag',
    fabric: 'leather',
    color: '#d4af37',
    colorName: 'Gilded Champagne & Onyx',
    price: '€ 850',
    notes: 'Solid brass frame with hand-faceted crystal clasp and supple calfskin lining.',
  },
]

export function loadWardrobeState() {
  if (typeof window === 'undefined') return { savedProducts: CURATED_DEMO_WARDROBE_GARMENTS, recentlyViewed: [], favouriteCategories: [], recentOccasions: [] }
  try {
    const saved = window.localStorage.getItem(wardrobeStorageKey)
    if (saved === null) {
      // First boot: populate with initial curated luxury pieces
      const initial = {
        savedProducts: CURATED_DEMO_WARDROBE_GARMENTS,
        recentlyViewed: [],
        favouriteCategories: [],
        recentOccasions: ['Wedding', 'Diwali', 'Gala', 'Formal'],
      }
      saveWardrobeState(initial)
      return initial
    }
    const parsed = saved ? JSON.parse(saved) : {}
    return {
      savedProducts: Array.isArray(parsed.savedProducts) ? parsed.savedProducts : [],
      recentlyViewed: Array.isArray(parsed.recentlyViewed) ? parsed.recentlyViewed : [],
      favouriteCategories: Array.isArray(parsed.favouriteCategories) ? parsed.favouriteCategories : [],
      recentOccasions: Array.isArray(parsed.recentOccasions) ? parsed.recentOccasions : [],
    }
  } catch {
    return { savedProducts: CURATED_DEMO_WARDROBE_GARMENTS, recentlyViewed: [], favouriteCategories: [], recentOccasions: [] }
  }
}

function saveWardrobeState(next) {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(wardrobeStorageKey, JSON.stringify(next))
    return true
  } catch {
    return false
  }
}

export function loadWardrobe() {
  return loadWardrobeState()
}

export function recordProductView(product) {
  const current = loadWardrobeState()
  const item = { ...product, viewedAt: new Date().toISOString() }
  return saveWardrobeState({ ...current, recentlyViewed: [item, ...current.recentlyViewed.filter((saved) => saved.id !== product.id)].slice(0, 6) })
}

export function toggleSavedProduct(product) {
  const current = loadWardrobeState()
  const isSaved = current.savedProducts.some((item) => item.id === product.id)
  const savedProducts = isSaved
    ? current.savedProducts.filter((item) => item.id !== product.id)
    : [{ ...product, savedAt: new Date().toISOString() }, ...current.savedProducts].slice(0, 24)
  saveWardrobeState({ ...current, savedProducts })
  return !isSaved
}

export function removeSavedProduct(id) {
  const current = loadWardrobeState()
  return saveWardrobeState({ ...current, savedProducts: current.savedProducts.filter((item) => item.id !== id) })
}

export function resetToCuratedDemoWardrobe() {
  const current = loadWardrobeState()
  const next = { ...current, savedProducts: CURATED_DEMO_WARDROBE_GARMENTS }
  saveWardrobeState(next)
  return next
}

export function clearSavedWardrobe() {
  const current = loadWardrobeState()
  const next = { ...current, savedProducts: [] }
  saveWardrobeState(next)
  return next
}

export function toggleFavouriteCategory(category) {
  const current = loadWardrobeState()
  const exists = current.favouriteCategories.some((item) => item.id === category.id)
  const favouriteCategories = exists
    ? current.favouriteCategories.filter((item) => item.id !== category.id)
    : [...current.favouriteCategories, category].slice(0, 8)
  saveWardrobeState({ ...current, favouriteCategories })
  return !exists
}

export function recordOccasion(occasion) {
  const current = loadWardrobeState()
  return saveWardrobeState({ ...current, recentOccasions: [occasion, ...current.recentOccasions.filter((item) => item !== occasion)].slice(0, 6) })
}

export function loadMeasurements() {
  if (typeof window === 'undefined') return null

  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return null

    const parsed = JSON.parse(saved)
    const measurements = parsed?.measurementsCm
    if (!measurements || typeof measurements !== 'object' || Array.isArray(measurements)) return null
    const validMeasurements = Object.fromEntries(Object.entries(measurements).filter(([, value]) => (
      Number.isFinite(Number(value)) && Number(value) > 0
    )).map(([key, value]) => [key, Number(value)]))

    return Object.keys(validMeasurements).length > 0 ? validMeasurements : null
  } catch {
    return null
  }
}

export function loadFitPreference() {
  if (typeof window === 'undefined') return 'Regular'
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return 'Regular'
    const parsed = JSON.parse(saved)
    return parsed?.fitPreference || 'Regular'
  } catch {
    return 'Regular'
  }
}

export function saveFitPreference(preference) {
  if (typeof window === 'undefined') return false
  try {
    const currentRaw = window.localStorage.getItem(storageKey)
    const current = currentRaw ? JSON.parse(currentRaw) : { version: 1, measurementsCm: {} }
    window.localStorage.setItem(storageKey, JSON.stringify({
      ...current,
      fitPreference: preference,
      updatedAt: new Date().toISOString(),
    }))
    return true
  } catch {
    return false
  }
}

export function saveMeasurements(measurements, fitPreference = null) {
  if (typeof window === 'undefined') return false

  try {
    const updates = Object.entries(measurements).filter(([, value]) => value !== undefined).map(([key, value]) => [
      key,
      value === null || value === '' ? null : Number(value),
    ])
    if (updates.length === 0 || updates.some(([, value]) => value !== null && (!Number.isFinite(value) || value <= 0))) return false
    const measurementsCm = { ...(loadMeasurements() ?? {}) }
    for (const [key, value] of updates) {
      if (value === null) delete measurementsCm[key]
      else measurementsCm[key] = Number(value.toFixed(1))
    }
    if (Object.keys(measurementsCm).length === 0) return false

    const currentRaw = window.localStorage.getItem(storageKey)
    const current = currentRaw ? JSON.parse(currentRaw) : {}
    const preference = fitPreference || current?.fitPreference || 'Regular'

    window.localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      measurementsCm,
      fitPreference: preference,
      updatedAt: new Date().toISOString(),
    }))
    return true
  } catch {
    return false
  }
}

export function centimetersToInches(value) {
  return Number(value) / 2.54
}

export function inchesToCentimeters(value) {
  return Number(value) * 2.54
}

export function loadDemoAccount() {
  if (typeof window === 'undefined') return null

  try {
    const saved = window.localStorage.getItem(accountStorageKey)
    if (!saved) return null
    const account = JSON.parse(saved)
    if (typeof account?.name !== 'string' || typeof account?.email !== 'string') return null
    return { name: account.name, email: account.email }
  } catch {
    return null
  }
}

export function saveDemoAccount({ name, email }) {
  if (typeof window === 'undefined') return false
  const cleanName = name.trim()
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanName || !cleanEmail) return false

  try {
    window.localStorage.setItem(accountStorageKey, JSON.stringify({
      name: cleanName,
      email: cleanEmail,
      updatedAt: new Date().toISOString(),
    }))
    return true
  } catch {
    return false
  }
}

export function loadRecentChecks() {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(recentChecksStorageKey)
    const checks = saved ? JSON.parse(saved) : []
    if (!Array.isArray(checks)) return []
    return checks.filter((check) => (
      typeof check?.brandId === 'string'
      && typeof check?.brand === 'string'
      && typeof check?.product === 'string'
      && typeof check?.category === 'string'
      && typeof check?.size === 'string'
    )).slice(0, 5)
  } catch {
    return []
  }
}

export function recordRecentCheck(check) {
  if (typeof window === 'undefined') return false

  try {
    const previous = loadRecentChecks()
    const next = [
      { ...check, checkedAt: new Date().toISOString() },
      ...previous.filter((item) => !(item.brandId === check.brandId && item.product === check.product)),
    ].slice(0, 5)
    window.localStorage.setItem(recentChecksStorageKey, JSON.stringify(next))
    return true
  } catch {
    return false
  }
}

export function clearDemoAccountData() {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.removeItem(storageKey)
    window.localStorage.removeItem(accountStorageKey)
    window.localStorage.removeItem(recentChecksStorageKey)
    window.localStorage.removeItem(wardrobeStorageKey)
    window.localStorage.removeItem(selectedGarmentStorageKey)
    window.localStorage.removeItem(avatarConfigStorageKey)
    window.localStorage.removeItem(activeRecommendationStorageKey)
    return true
  } catch {
    return false
  }
}

export function loadSelectedGarment() {
  if (typeof window === 'undefined') return CURATED_DEMO_WARDROBE_GARMENTS[0]
  try {
    const saved = window.localStorage.getItem(selectedGarmentStorageKey)
    if (!saved) return CURATED_DEMO_WARDROBE_GARMENTS[0]
    const parsed = JSON.parse(saved)
    return parsed && typeof parsed === 'object' && parsed.id ? parsed : CURATED_DEMO_WARDROBE_GARMENTS[0]
  } catch {
    return CURATED_DEMO_WARDROBE_GARMENTS[0]
  }
}

export function saveSelectedGarment(garment) {
  if (typeof window === 'undefined' || !garment || typeof garment !== 'object') return false
  try {
    const payload = {
      ...garment,
      updatedAt: new Date().toISOString(),
    }
    window.localStorage.setItem(selectedGarmentStorageKey, JSON.stringify(payload))
    window.dispatchEvent(new CustomEvent('fitmate:selected-garment-updated', { detail: payload }))
    return true
  } catch {
    return false
  }
}

export function loadAvatarConfig() {
  const defaultConfig = {
    gender: 'female',
    skinToneId: 'warmSand',
    pose: 'relaxed',
    outfit: 'undergarment',
    accentColor: '#dfc17b',
  }
  if (typeof window === 'undefined') return defaultConfig
  try {
    const saved = window.localStorage.getItem(avatarConfigStorageKey)
    if (!saved) return defaultConfig
    const parsed = JSON.parse(saved)
    return {
      gender: parsed.gender || defaultConfig.gender,
      skinToneId: parsed.skinToneId || defaultConfig.skinToneId,
      pose: parsed.pose || defaultConfig.pose,
      outfit: parsed.outfit || defaultConfig.outfit,
      accentColor: parsed.accentColor || defaultConfig.accentColor,
      updatedAt: parsed.updatedAt || null,
    }
  } catch {
    return defaultConfig
  }
}

export function saveAvatarConfig(config) {
  if (typeof window === 'undefined' || !config || typeof config !== 'object') return false
  try {
    const current = loadAvatarConfig()
    const next = {
      ...current,
      ...config,
      updatedAt: new Date().toISOString(),
    }
    window.localStorage.setItem(avatarConfigStorageKey, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('fitmate:avatar-config-updated', { detail: next }))
    return true
  } catch {
    return false
  }
}

export function loadActiveRecommendation() {
  if (typeof window === 'undefined') return null
  try {
    const saved = window.localStorage.getItem(activeRecommendationStorageKey)
    if (!saved) return null
    return JSON.parse(saved)
  } catch {
    return null
  }
}

export function saveActiveRecommendation(recommendation) {
  if (typeof window === 'undefined' || !recommendation || typeof recommendation !== 'object') return false
  try {
    const next = {
      ...recommendation,
      updatedAt: new Date().toISOString(),
    }
    window.localStorage.setItem(activeRecommendationStorageKey, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('fitmate:recommendation-updated', { detail: next }))
    return true
  } catch {
    return false
  }
}
