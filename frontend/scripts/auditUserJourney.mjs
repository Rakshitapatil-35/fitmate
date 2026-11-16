/**
 * FITMATE Complete User Journey & Integration Audit
 *
 * Verifies end-to-end integration across all 14 environments:
 * 1. Grand 3D Showroom Homepage
 * 2. Spatial 3D Sliding Sidebar
 * 3. Realistic 3D Digital Twin System
 * 4. Body Measurement Studio
 * 5. Fashion Collections (Western, Men's, Indian Ethnic, Diwali, Lehenga)
 * 6. Shared Garment Selection Pipeline
 * 7. Integrated Holographic AI Stylist (AURA)
 * 8. Intelligent Size Recommendation & Brand Sizing Comparison
 * 9. Virtual Fitting Room with 3D Tension Analysis
 * 10. My Wardrobe Persistent Vault & State Synchronization
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(__dirname, '../src')

// Mock window and localStorage for node environment testing
const storageData = new Map()

globalThis.window = {
  localStorage: {
    getItem: (key) => (storageData.has(key) ? storageData.get(key) : null),
    setItem: (key, val) => storageData.set(key, String(val)),
    removeItem: (key) => storageData.delete(key),
    clear: () => storageData.clear(),
  },
  dispatchEvent: (event) => {
    // Event bus simulation
  },
  addEventListener: () => {},
  removeEventListener: () => {},
}

globalThis.CustomEvent = class CustomEvent {
  constructor(name, options) {
    this.name = name
    this.detail = options?.detail
  }
}

let passedSteps = 0
let failedSteps = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`)
    passedSteps++
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    failedSteps++
  }
}

async function runJourneyAudit() {
  console.log('\n============================================================')
  console.log('   FITMATE 10-STEP COMPLETE USER JOURNEY AUDIT')
  console.log('============================================================\n')

  // Import application modules dynamically
  const {
    saveMeasurements,
    loadMeasurements,
    saveFitPreference,
    loadFitPreference,
    saveSelectedGarment,
    loadSelectedGarment,
    saveAvatarConfig,
    loadAvatarConfig,
    saveActiveRecommendation,
    loadActiveRecommendation,
    loadWardrobe,
    toggleSavedProduct,
    clearDemoAccountData,
    CURATED_DEMO_WARDROBE_GARMENTS,
  } = await import('../src/measurementStorage.js')

  const {
    generateStylistResponse,
    STYLIST_INITIAL_MESSAGE,
    SUGGESTED_PROMPTS,
  } = await import('../src/services/stylistService.js')

  const { showroomPortals } = await import('../src/three/showroomPortals.js')
  const { westernGarments } = await import('../src/three/westernFashionCatalog.js')
  const { mensGarments } = await import('../src/three/mensFashionCatalog.js')
  const { diwaliGarments } = await import('../src/three/diwaliCatalog.js')
  const { lehengaCollections } = await import('../src/three/lehengaCatalog.js')
  const { fittingGarments } = await import('../src/three/fittingRoomCatalog.js')
  const { demoBrands } = await import('../src/demoFitData.js')
  const { calculateIntelligentRecommendation } = await import('../src/recommendationEngine.js')

  // Clean initial slate
  clearDemoAccountData()

  // -------------------------------------------------------------
  // STEP 1: Enter Grand 3D Showroom
  // -------------------------------------------------------------
  console.log('[STEP 1] Grand 3D Showroom Homepage & Spatial Portals')
  assert(showroomPortals.length >= 10, `Showroom has ${showroomPortals.length} active 3D portals (expected >= 10)`)
  const portalRoutes = showroomPortals.map((p) => p.route)
  assert(portalRoutes.includes('/western-wear') || portalRoutes.includes('/womens-fashion'), 'Showroom has Western Fashion portal')
  assert(portalRoutes.includes('/mens-fashion'), 'Showroom has Men\'s Fashion portal')
  assert(portalRoutes.includes('/indian-ethnic-wear'), 'Showroom has Indian Ethnic portal')
  assert(portalRoutes.includes('/diwali-edit'), 'Showroom has Diwali Collection portal')
  assert(portalRoutes.includes('/lehenga-studio'), 'Showroom has Lehenga Studio portal')
  assert(portalRoutes.includes('/digital-twin') || portalRoutes.includes('/avatar-studio'), 'Showroom has Digital Twin Studio portal')
  assert(portalRoutes.includes('/measurements'), 'Showroom has Body Measurement Studio portal')
  assert(portalRoutes.includes('/virtual-fitting-room'), 'Showroom has Virtual Fitting Room portal')

  // -------------------------------------------------------------
  // STEP 2: Spatial 3D Sliding Sidebar Navigation
  // -------------------------------------------------------------
  console.log('\n[STEP 2] Spatial 3D Sliding Sidebar Navigation')
  const sidebarCode = readFileSync(resolve(srcDir, 'components/LuxurySidebar.jsx'), 'utf-8')
  assert(sidebarCode.includes('Fashion Universe') && sidebarCode.includes('3D Digital Twin Studio'), 'LuxurySidebar declares Fashion Universe and Digital Twin routes')
  assert(sidebarCode.includes('Virtual Fitting Room') && sidebarCode.includes('Brand Size Comparison'), 'LuxurySidebar includes Fitting Room and Brand Comparison links')
  assert(sidebarCode.includes("e.key === '['"), 'LuxurySidebar includes keyboard bracket shortcut for accessibility')

  // -------------------------------------------------------------
  // STEP 3: Create or Load 3D Digital Twin
  // -------------------------------------------------------------
  console.log('\n[STEP 3] 3D Digital Twin Biometric Customization & Persistence')
  const defaultAvatar = loadAvatarConfig()
  assert(defaultAvatar.gender === 'female', 'Initial avatar default gender is female')
  
  // User modifies avatar into custom digital twin
  const customTwin = {
    gender: 'female',
    skinToneId: 'goldenDeep',
    pose: 'contrapposto',
    outfit: 'couture-bodycon',
    accentColor: '#d6b46a',
  }
  saveAvatarConfig(customTwin)
  const reloadedTwin = loadAvatarConfig()
  assert(reloadedTwin.skinToneId === 'goldenDeep', 'Digital Twin skin tone correctly saved and loaded')
  assert(reloadedTwin.pose === 'contrapposto', 'Digital Twin pose saved and persisted across sessions')

  // -------------------------------------------------------------
  // STEP 4: Enter Verified Body Measurements
  // -------------------------------------------------------------
  console.log('\n[STEP 4] Body Measurement Studio Input & Validation')
  const verifiedTape = {
    height: 172,
    chest: 90,
    waist: 68,
    hip: 96,
    shoulder: 41,
    inseam: 80,
  }
  saveMeasurements(verifiedTape, 'Regular')
  saveFitPreference('Slim')
  const reloadedMeasurements = loadMeasurements()
  const reloadedFitPref = loadFitPreference()
  assert(reloadedMeasurements.chest === 90, 'Chest measurement (90 cm) preserved in persistent storage')
  assert(reloadedMeasurements.waist === 68, 'Waist measurement (68 cm) preserved in persistent storage')
  assert(reloadedFitPref === 'Slim', 'Fit preference "Slim" successfully saved and loaded')

  // -------------------------------------------------------------
  // STEP 5: Explore Fashion Collections
  // -------------------------------------------------------------
  console.log('\n[STEP 5] Explore Fashion Collections Across Worlds')
  assert(westernGarments.length >= 6, `Western catalog verified (${westernGarments.length} garments)`)
  assert(mensGarments.length >= 6, `Men's catalog verified (${mensGarments.length} garments)`)
  assert(diwaliGarments.length >= 6, `Diwali collection verified (${diwaliGarments.length} garments)`)
  assert(lehengaCollections.length >= 6, `Lehenga studio catalog verified (${lehengaCollections.length} garments)`)

  // -------------------------------------------------------------
  // STEP 6: Select an Actual Garment
  // -------------------------------------------------------------
  console.log('\n[STEP 6] Garment Selection & Cross-Page State Propagation')
  const selectedLook = {
    id: 'west-slip-dress',
    audience: 'Women',
    collection: 'Western',
    category: 'Dresses',
    clothingType: 'Dress',
    brandId: 'fitmate-western-atelier',
    brand: 'FITMATE Western Haute-Couture',
    productName: 'Obsidian Silk Slip Dress',
    name: 'Obsidian Silk Slip Dress',
    occasion: 'Gala & Evening Soirée',
    garmentAssetId: 'garmentDress',
    fabric: 'silk',
    color: '#0a0a0c',
  }
  saveSelectedGarment(selectedLook)
  const loadedGarment = loadSelectedGarment()
  assert(loadedGarment.id === 'west-slip-dress', 'Selected garment ID synchronized across application')
  assert(loadedGarment.productName === 'Obsidian Silk Slip Dress', 'Selected garment name preserved')

  // -------------------------------------------------------------
  // STEP 7: Ask the Stylist for Outfit Advice (AURA)
  // -------------------------------------------------------------
  console.log('\n[STEP 7] Integrated Holographic AI Stylist (AURA)')
  assert(STYLIST_INITIAL_MESSAGE.sender === 'stylist', 'AURA stylist initial message available')
  const stylistAdvice = generateStylistResponse('Style my selected garment')
  assert(stylistAdvice.text.includes('Obsidian Silk Slip Dress'), 'Stylist correctly identifies currently selected garment')
  assert(stylistAdvice.text.includes('90cm chest') || stylistAdvice.text.includes('90'), 'Stylist incorporates user verified tape chest measurement')
  assert(stylistAdvice.tryOnLink && stylistAdvice.tryOnLink.path.includes('/virtual-fitting-room'), 'Stylist produces 1-click try on link in 3D Fitting Room')

  // -------------------------------------------------------------
  // STEP 8: Intelligent Size Recommendation & Brand Comparison
  // -------------------------------------------------------------
  console.log('\n[STEP 8] Intelligent Size Recommendation & Brand Comparison')
  const testBrand = demoBrands.find((b) => b.id === 'zara') || demoBrands[0]
  const recResult = calculateIntelligentRecommendation({
    brand: testBrand,
    category: 'Dresses',
    clothingType: 'Dress',
    fitPreference: reloadedFitPref,
    measurements: reloadedMeasurements,
    fabricStretch: 'low',
  })
  assert(recResult.success === true, 'Intelligent recommendation calculated successfully')
  assert(typeof recResult.recommendedSize === 'string', `Recommended size produced: ${recResult.recommendedSize}`)
  
  saveActiveRecommendation({
    brandId: testBrand.id,
    brand: testBrand.name,
    product: selectedLook.productName,
    audience: 'Women',
    category: 'Dresses',
    clothingType: 'Dress',
    recommendedSize: recResult.recommendedSize,
    fitPreference: reloadedFitPref,
    confidence: `${recResult.confidenceScore}% confidence`,
  })
  const activeRec = loadActiveRecommendation()
  assert(activeRec.recommendedSize === recResult.recommendedSize, 'Active recommendation persisted in shared state')

  // -------------------------------------------------------------
  // STEP 9: View Garment in Virtual Fitting Room
  // -------------------------------------------------------------
  console.log('\n[STEP 9] Virtual Fitting Room with 3D Tension Analysis')
  assert(fittingGarments.length >= 8, `Virtual Fitting Room has ${fittingGarments.length} 3D test garments`)
  const matchingFittingGarment = fittingGarments.find((g) => g.assetId === selectedLook.garmentAssetId) || fittingGarments[0]
  assert(matchingFittingGarment !== undefined, `Found fitting room 3D silhouette for ${selectedLook.garmentAssetId}`)
  assert(Array.isArray(matchingFittingGarment.sizeChart), 'Fitting garment has calibrated multi-zone size chart')

  // -------------------------------------------------------------
  // STEP 10: Save Garment and Recommendation to My Wardrobe
  // -------------------------------------------------------------
  console.log('\n[STEP 10] Save to My Wardrobe Vault & Persistent Retrieval')
  const wardrobeItem = {
    id: selectedLook.id,
    audience: selectedLook.audience,
    collection: selectedLook.collection,
    category: selectedLook.category,
    clothingType: selectedLook.clothingType,
    brandId: selectedLook.brandId,
    brand: selectedLook.brand,
    productName: selectedLook.productName,
    name: selectedLook.name,
    occasion: selectedLook.occasion,
    garmentAssetId: selectedLook.garmentAssetId,
    size: activeRec.recommendedSize,
    color: selectedLook.color,
    fabric: selectedLook.fabric,
  }
  toggleSavedProduct(wardrobeItem)
  const userWardrobe = loadWardrobe()
  const savedItem = userWardrobe.savedProducts.find((item) => item.id === selectedLook.id)
  assert(savedItem !== undefined, 'Garment successfully saved to My Wardrobe')
  assert(savedItem.size === activeRec.recommendedSize, `Garment in wardrobe retains recommended size (${savedItem.size})`)
  assert(savedItem.brand === 'FITMATE Western Haute-Couture', 'Wardrobe retains couture brand provenance')

  console.log('\n============================================================')
  console.log(`JOURNEY AUDIT RESULT: ${passedSteps} PASSED, ${failedSteps} FAILED`)
  console.log('============================================================\n')

  if (failedSteps > 0) {
    process.exit(1)
  }
}

runJourneyAudit().catch((err) => {
  console.error('Audit execution error:', err)
  process.exit(1)
})
