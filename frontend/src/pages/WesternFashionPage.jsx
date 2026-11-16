import { Suspense, useCallback, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Heart,
  Layers,
  Maximize2,
  Palette,
  Play,
  RotateCcw,
  Ruler,
  Scissors,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandWordmark, Button, Eyebrow } from '../components/DesignSystem.jsx'
import MobileNav from '../components/MobileNav.jsx'
import { calculateDemoRecommendation, demoBrands } from '../demoFitData.js'
import {
  loadMeasurements,
  loadWardrobe,
  saveActiveRecommendation,
  saveSelectedGarment,
  toggleSavedProduct,
} from '../measurementStorage.js'
import { fabricPresets, getFabricPreset } from '../three/fabricMaterialLibrary.js'
import SceneManager from '../three/SceneManager.jsx'
import {
  westernAssetLedger,
  westernCategories,
  westernColorPalette,
  westernGarments,
  westernOccasions,
} from '../three/westernFashionCatalog.js'
import './WesternFashionPage.css'

const cameraViews = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' },
]

const inspectionDetails = [
  { id: 'bodice', label: 'Neckline & Silhouette Cut', note: 'Precise collar, bias cowl or boning architecture defining the upper torso fit' },
  { id: 'waist', label: 'Waistband & Ease Line', note: 'Calibrated ease and interior darts preventing waist gap when seated' },
  { id: 'hem', label: 'Hem Finishing & Sweep', note: 'Weighted stitch edge or vented hemline ensuring fluid natural walking motion' },
]

export default function WesternFashionPage() {
  const [selectedGarmentId, setSelectedGarmentId] = useState('west-slip-dress')
  const [selectedFabricId, setSelectedFabricId] = useState('satin')
  const [selectedColorHex, setSelectedColorHex] = useState(westernColorPalette[0].hex)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeOccasion, setActiveOccasion] = useState('All Occasions')
  const [cameraView, setCameraView] = useState('front')
  const [zoomLevel, setZoomLevel] = useState('full')
  const [avatarRotationDeg, setAvatarRotationDeg] = useState(0)
  const [autoRotate360, setAutoRotate360] = useState(false)
  const [activeInspectionPoint, setActiveInspectionPoint] = useState(null)
  const [previewOnAvatar, setPreviewOnAvatar] = useState(false)
  const [showAssetLedger, setShowAssetLedger] = useState(false)
  const [wardrobe, setWardrobe] = useState(() => loadWardrobe())
  const [savedSuccessToast, setSavedSuccessToast] = useState(false)
  const toastTimerRef = useRef(null)

  // Current selected garment
  const selectedGarment = useMemo(() => {
    return westernGarments.find((g) => g.id === selectedGarmentId) ?? westernGarments[0]
  }, [selectedGarmentId])

  // Filtered garments based on category and occasion
  const filteredGarments = useMemo(() => {
    return westernGarments.filter((g) => {
      const matchCategory = activeCategory === 'All' || g.category === activeCategory
      const matchOccasion = activeOccasion === 'All Occasions' || g.occasion === activeOccasion
      return matchCategory && matchOccasion
    })
  }, [activeCategory, activeOccasion])

  const isOutfitSaved = useMemo(() => {
    return wardrobe.savedProducts.some((item) => item.id === selectedGarment.id)
  }, [wardrobe, selectedGarment])

  const handleGarmentSelect = useCallback((garment) => {
    setSelectedGarmentId(garment.id)
    setSelectedFabricId(garment.fabricId)
    setActiveInspectionPoint(null)
    setAutoRotate360(false)
    setAvatarRotationDeg(0)
    saveSelectedGarment({
      id: garment.id,
      audience: 'Women',
      collection: 'Western',
      category: garment.category,
      clothingType: garment.clothingType ?? garment.category,
      brandId: 'fitmate-western-atelier',
      brand: 'FITMATE Western Haute-Couture',
      productName: garment.label,
      name: garment.label,
      occasion: garment.occasion,
      garmentAssetId: garment.assetId,
      fabric: garment.fabricId,
      color: selectedColorHex,
    })
  }, [selectedColorHex])

  const [savedMeasurements] = useState(() => loadMeasurements())

  // FITMATE Size Recommendation Integration
  const fitRecommendation = useMemo(() => {
    const targetBrand = demoBrands.find((b) => b.id === 'zara') ?? demoBrands[0]
    return calculateDemoRecommendation(
      targetBrand,
      selectedGarment.clothingType ?? 'Dress',
      savedMeasurements,
      'Women'
    )
  }, [selectedGarment, savedMeasurements])

  const handleToggleSaveWardrobe = () => {
    const sizeToSave = fitRecommendation?.primarySize || 'M'
    if (fitRecommendation?.primarySize) {
      saveActiveRecommendation({
        brandId: 'fitmate-western-atelier',
        brand: 'FITMATE Western Haute-Couture',
        product: selectedGarment.label,
        audience: 'Women',
        category: selectedGarment.category,
        clothingType: selectedGarment.clothingType ?? selectedGarment.category,
        recommendedSize: sizeToSave,
        confidence: fitRecommendation.confidenceText,
      })
    }
    toggleSavedProduct({
      id: selectedGarment.id,
      audience: 'Women',
      collection: 'Western',
      category: selectedGarment.category,
      clothingType: selectedGarment.clothingType ?? selectedGarment.category,
      brandId: 'fitmate-western-atelier',
      brand: 'FITMATE Western Haute-Couture',
      productName: selectedGarment.label,
      name: selectedGarment.label,
      occasion: selectedGarment.occasion,
      garmentAssetId: selectedGarment.assetId,
      image: '',
      size: sizeToSave,
      color: selectedColorHex,
      fabric: selectedFabricId,
    })
    setWardrobe(loadWardrobe())
    setSavedSuccessToast(true)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setSavedSuccessToast(false), 3200)
  }

  const findMySizeUrl = useMemo(() => {
    return `/find-my-size?audience=Women&category=${encodeURIComponent(selectedGarment.category)}&clothingType=${encodeURIComponent(selectedGarment.clothingType ?? selectedGarment.category)}`
  }, [selectedGarment])

  const selectedColor = useMemo(
    () => westernColorPalette.find((c) => c.hex === selectedColorHex) ?? westernColorPalette[0],
    [selectedColorHex]
  )
  const selectedFabricPreset = getFabricPreset(selectedFabricId)

  return (
    <div className="western-world-page womens-world">
      {/* Showroom Header */}
      <header className="western-header">
        <div className="western-header-left">
          <BrandWordmark to="/" />
          <div className="western-header-badge">
            <Sparkles size={13} />
            <span>THE 3D WESTERN FASHION WORLD</span>
          </div>
        </div>

        <nav className="western-nav" aria-label="Fashion world navigation">
          <Link to="/">
            <ArrowLeft size={13} /> Main Showroom
          </Link>
          <Link to="/mens-fashion" className="western-nav-accent">
            Men’s Atelier ↗
          </Link>
          <Link to="/lehenga-studio">Lehenga Studio</Link>
          <Link to="/diwali-world">Diwali Edit</Link>
          <Link to="/indian-ethnic-wear">Indian Couture</Link>
          <Link to="/my-wardrobe">My Wardrobe</Link>
          <Button to="/find-my-size" size="small" icon={ArrowUpRight}>
            Find My Size
          </Button>
        </nav>

        <MobileNav
          links={[
            { to: '/', label: 'Main Showroom' },
            { to: '/mens-fashion', label: "Men's 3D Atelier" },
            { to: '/lehenga-studio', label: 'Lehenga Studio' },
            { to: '/diwali-world', label: 'Diwali Fashion World' },
            { to: '/indian-ethnic-wear', label: 'Indian Couture' },
            { to: '/my-wardrobe', label: 'My Wardrobe' },
            { to: '/find-my-size', label: 'Find My Size' },
          ]}
        />
      </header>

      <main className="western-main">
        {/* Top Marquee Bar */}
        <section className="western-top-marquee">
          <div className="marquee-left">
            <span className="marquee-tag">HAUTE-COUTURE WESTERN SHOWROOM</span>
            <h1>Modern Silhouettes. Calibrated Fit.</h1>
            <p>
              Explore 3D dresses, tops, denim, tailoring, co-ords, skirts and outerwear. Inspect luxury fabrics in real-time PBR shaders with 360-degree rotation.
            </p>
          </div>
          <div className="marquee-actions">
            <Link to="/mens-fashion" className="western-switch-btn" title="Explore the Men's 3D Fashion Atelier">
              <span>Visit Men’s 3D Atelier</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* 3-Column Studio Stage Grid */}
        <div className="western-stage-grid">
          {/* Left column: Category & Garment Selection */}
          <aside className="western-garments-panel" aria-label="Western collection garments">
            <div className="garments-panel-header">
              <Eyebrow>COLLECTION EXPLORER</Eyebrow>
              <h2>Western Wardrobe</h2>
            </div>

            {/* Department Category Filter Pills */}
            <div className="category-pill-filter" role="tablist" aria-label="Garment categories">
              {westernCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={`category-pill ${activeCategory === cat ? 'is-active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Occasion Filter Pills */}
            <div className="occasions-filter" role="group" aria-label="Filter by occasion">
              {westernOccasions.map((occasion) => (
                <button
                  key={occasion}
                  type="button"
                  className={`occasion-pill ${activeOccasion === occasion ? 'is-active' : ''}`}
                  onClick={() => setActiveOccasion(occasion)}
                >
                  {occasion}
                </button>
              ))}
            </div>

            {/* Scrollable Garments List */}
            <div className="garments-scroll-list" role="radiogroup" aria-label="Select garment to inspect in 3D">
              {filteredGarments.map((garment, index) => {
                const isSelected = selectedGarment.id === garment.id
                return (
                  <button
                    key={garment.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`western-garment-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleGarmentSelect(garment)}
                  >
                    <div className="card-top-row">
                      <span className="card-index">0{index + 1}</span>
                      <span className="card-audience-badge">{garment.category}</span>
                    </div>
                    <h3>{garment.label}</h3>
                    <p>{garment.detail}</p>
                    <div className="card-footer-row">
                      <small className="card-occasion">{garment.occasion} · {garment.clothingType}</small>
                      <span className="card-inspect-cta">Inspect in 3D ↗</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Center column: 3D Canvas Viewport */}
          <div className="western-canvas-column">
            <div className="western-canvas-frame" aria-label="3D Western Fashion Environment">
              <Suspense
                fallback={
                  <div className="western-scene-loader" role="status">
                    <Sparkles size={28} />
                    <span>OPENING THE 3D WESTERN SHOWROOM</span>
                    <small>Lighting terrazzo floors, garment racks & fitting mirrors…</small>
                  </div>
                }
              >
                <SceneManager
                  sceneId="westernFashionWorld"
                  sceneProps={{
                    selectedGarmentId,
                    fabricId: selectedFabricId,
                    customColor: selectedColorHex,
                    cameraView,
                    zoomLevel,
                    avatarRotationDeg,
                    autoRotate360,
                    activeInspectionPoint,
                    onInspectionSelect: setActiveInspectionPoint,
                    previewOnAvatar,
                    avatarAssetId: 'femaleAvatar',
                    onGarmentSelect: setSelectedGarmentId,
                  }}
                  className="western-3d-canvas"
                />
              </Suspense>

              <div className="western-viewport-watermark" aria-hidden="true">
                <span className="watermark-tag">FITMATE WESTERN HAUTE-COUTURE</span>
                <strong className="watermark-title">{selectedGarment.label}</strong>
              </div>
            </div>

            {/* Viewport Controls Bar: Views, Zoom & 360 Spin */}
            <div className="viewport-controls">
              <div className="control-group">
                <span className="control-label">VIEW</span>
                {cameraViews.map((view) => (
                  <button
                    key={view.id}
                    type="button"
                    className={`view-btn ${cameraView === view.id ? 'is-active' : ''}`}
                    aria-pressed={cameraView === view.id}
                    onClick={() => {
                      setCameraView(view.id)
                      setZoomLevel('full')
                      setActiveInspectionPoint(null)
                    }}
                    title={`${view.label} view`}
                  >
                    <RotateCcw size={12} />
                    <span>{view.label}</span>
                  </button>
                ))}
              </div>

              <div className="control-group">
                <span className="control-label">ZOOM</span>
                <button
                  type="button"
                  className={`zoom-btn ${zoomLevel === 'detail' ? 'is-active' : ''}`}
                  aria-pressed={zoomLevel === 'detail'}
                  onClick={() => setZoomLevel((prev) => (prev === 'full' ? 'detail' : 'full'))}
                  title="Garment inspection zoom"
                >
                  <Maximize2 size={13} />
                  <span>{zoomLevel === 'detail' ? 'Close-up' : 'Full'}</span>
                </button>
              </div>

              <div className="control-group">
                <span className="control-label">360° SPIN</span>
                <button
                  type="button"
                  className={`turntable-spin-btn ${autoRotate360 ? 'is-active' : ''}`}
                  aria-pressed={autoRotate360}
                  onClick={() => setAutoRotate360((prev) => !prev)}
                  title="Continuous 360-degree rotation"
                >
                  <Play size={12} />
                  <span>{autoRotate360 ? 'Pause Spin' : 'Rotate 360°'}</span>
                </button>
              </div>

              <button
                type="button"
                className={`avatar-btn ${previewOnAvatar ? 'is-active' : ''}`}
                aria-pressed={previewOnAvatar}
                onClick={() => setPreviewOnAvatar((prev) => !prev)}
                title={previewOnAvatar ? 'Switch to Mannequin' : 'Preview on Avatar Form'}
              >
                <UserCheck size={13} />
                <span>{previewOnAvatar ? 'Mannequin' : 'Avatar Form'}</span>
              </button>
            </div>

            {/* 360 Degree Turntable Slider */}
            <div className="turntable-slider-bar">
              <span className="slider-label">MANUAL 360° DEGREE SLIDER:</span>
              <input
                type="range"
                min="0"
                max="360"
                value={avatarRotationDeg}
                onChange={(e) => {
                  setAutoRotate360(false)
                  setAvatarRotationDeg(Number(e.target.value))
                }}
                className="rotation-slider"
                aria-label="Rotate garment 0 to 360 degrees"
              />
              <span className="slider-deg-display">{Math.round(avatarRotationDeg)}°</span>
            </div>
          </div>

          {/* Right column: Specifications, Materials & Fit Integration */}
          <aside className="western-specs-panel">
            <div className="spec-header">
              <span className="spec-eyebrow">HAUTE-COUTURE SPECIFICATION</span>
              <h3>{selectedGarment.label}</h3>
              <p className="spec-category">
                {selectedGarment.category} · {selectedGarment.occasion} · {selectedGarment.clothingType}
              </p>
            </div>

            <div className="spec-description">{selectedGarment.detail}</div>

            {/* Craftsmanship 3D Inspection Points */}
            <div className="spec-inspection-section">
              <div className="section-title">
                <Eye size={13} />
                <span>3D CRAFTSMANSHIP INSPECTION</span>
              </div>
              <div className="inspection-chips-list">
                {inspectionDetails.map((pt) => {
                  const isActive = activeInspectionPoint === pt.id
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      className={`inspection-chip ${isActive ? 'is-active' : ''}`}
                      onClick={() => {
                        setActiveInspectionPoint(isActive ? null : pt.id)
                        setZoomLevel(isActive ? 'full' : 'detail')
                      }}
                    >
                      <span className="chip-bullet" />
                      <strong>{pt.label}</strong>
                    </button>
                  )
                })}
              </div>
              {activeInspectionPoint && (
                <div className="active-inspection-callout">
                  <small>
                    {inspectionDetails.find((d) => d.id === activeInspectionPoint)?.note}
                  </small>
                </div>
              )}
            </div>

            {/* Color Dye Options */}
            <div className="spec-colors">
              <div className="section-title">
                <Palette size={13} />
                <span>ATELIER DYES ({westernColorPalette.length} SHADES)</span>
              </div>
              <div className="color-dots">
                {westernColorPalette.map((col) => {
                  const isSelected = selectedColorHex === col.hex
                  return (
                    <button
                      key={col.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`color-dot ${isSelected ? 'is-selected' : ''}`}
                      style={{ backgroundColor: col.hex }}
                      onClick={() => setSelectedColorHex(col.hex)}
                      title={`${col.label} — ${col.note}`}
                    >
                      {isSelected && <span className="dot-active-marker" />}
                    </button>
                  )
                })}
              </div>
              <small className="active-color-name">
                Selected Dye: <strong>{selectedColor.label}</strong>
              </small>
            </div>

            {/* PBR Textile Study with Real Weave Presets */}
            <div className="spec-material-block">
              <div className="section-title">
                <Layers size={13} />
                <span>3D PBR TEXTILE STUDY</span>
              </div>
              <select
                className="fabric-select"
                value={selectedFabricId}
                onChange={(e) => setSelectedFabricId(e.target.value)}
                aria-label="Select Fabric Material"
              >
                {fabricPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} ({preset.weave})
                  </option>
                ))}
              </select>
              <p className="material-note">{selectedFabricPreset.note}</p>
            </div>

            {/* Available Sizes */}
            <div className="spec-sizes">
              <div className="section-title">
                <Scissors size={13} />
                <span>STANDARD SIZES</span>
              </div>
              <div className="size-list">
                {selectedGarment.sizes.map((size) => (
                  <button key={size} type="button" className="size-chip">
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* FITMATE Sizing Recommendation Card */}
            <div className="spec-fit-box">
              <div className="fit-box-header">
                <Ruler size={14} />
                <strong>FITMATE RECOMMENDED FIT</strong>
              </div>
              {fitRecommendation.primarySize ? (
                <div className="fit-rec-badge">
                  <span className="fit-rec-label">Recommended for Your Profile:</span>
                  <strong className="fit-rec-size">Size {fitRecommendation.primarySize}</strong>
                  <small>{fitRecommendation.confidenceText ?? 'Calibrated against verified brand size ease'}</small>
                </div>
              ) : (
                <p>Complete your measurement profile to unlock automated size mapping for this cut.</p>
              )}
              <div className="fit-guidance-text">
                <small><strong>Garment Fit Guidance:</strong> {selectedGarment.fitGuidance}</small>
              </div>
            </div>

            {/* Action Buttons: Find My Size & Save to Wardrobe */}
            <div className="spec-buttons">
              <Button to={findMySizeUrl} icon={ArrowUpRight} className="btn-find-size" size="small">
                Find My Size in this Look
              </Button>
              <Button
                to={`/virtual-fitting-room?audience=Women&category=${encodeURIComponent(selectedGarment.category)}`}
                variant="secondary"
                icon={Scissors}
                className="btn-try-fitting"
                size="small"
              >
                Try on in 3D Fitting Room
              </Button>
              <button
                type="button"
                className={`btn-save-wardrobe ${isOutfitSaved ? 'is-saved' : ''}`}
                onClick={handleToggleSaveWardrobe}
              >
                <Heart size={14} fill={isOutfitSaved ? '#d4af37' : 'none'} />
                <span>{isOutfitSaved ? 'Saved in My Wardrobe' : 'Save to My Wardrobe'}</span>
              </button>
            </div>

            {/* Asset Integrity Ledger */}
            <div className="spec-asset-status">
              <button
                type="button"
                className="asset-ledger-toggle-btn"
                onClick={() => setShowAssetLedger((prev) => !prev)}
              >
                <span className="status-light" />
                <strong>ASSET INTEGRITY LEDGER ({westernAssetLedger.length} SLOTS)</strong>
                {showAssetLedger ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <p>
                Garment slot registered ({selectedGarment.assetId}). Real-time PBR Material Study active on French-Canvas Couture Form.
              </p>
              {showAssetLedger && (
                <div className="asset-ledger-drawer">
                  <table className="asset-ledger-table">
                    <thead>
                      <tr>
                        <th>Garment Slot</th>
                        <th>Target Garments</th>
                        <th>3D Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {westernAssetLedger.map((row) => (
                        <tr key={row.slot}>
                          <td><code>{row.slot}</code></td>
                          <td>{row.target}</td>
                          <td>
                            <span className="ledger-status-tag">{row.status}</span>
                            <small className="ledger-pending-note">({row.missingGlb})</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {savedSuccessToast && (
              <div className="spec-toast">
                <Check size={13} />
                <span>Saved to My Wardrobe</span>
              </div>
            )}
          </aside>
        </div>

        {/* Footer Navigation */}
        <footer className="western-footer">
          <BrandWordmark to="/" />
          <nav className="footer-links-row" aria-label="Explore other 3D fashion universes">
            <Link to="/mens-fashion">Men’s Bespoke 3D Atelier</Link>
            <Link to="/lehenga-studio">Luxury Lehenga Studio</Link>
            <Link to="/diwali-world">Diwali Fashion World</Link>
            <Link to="/indian-ethnic-wear">Indian Ethnic Universe</Link>
            <Link to="/my-wardrobe">My Wardrobe</Link>
          </nav>
          <small>
            FITMATE Western Haute-Couture Showroom · PBR Material Studies & Automated Fit Calibration.
          </small>
        </footer>
      </main>
    </div>
  )
}
