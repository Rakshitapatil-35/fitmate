import { Suspense, useCallback, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Flame,
  Heart,
  Layers,
  Maximize2,
  Palette,
  Play,
  RotateCcw,
  Ruler,
  Scissors,
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
import {
  mensAssetLedger,
  mensBodyProportions,
  mensCategories,
  mensColorPalette,
  mensGarments,
  mensOccasions,
} from '../three/mensFashionCatalog.js'
import SceneManager from '../three/SceneManager.jsx'
import './MensFashionPage.css'

const cameraViews = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' },
]

const inspectionDetails = [
  { id: 'lapel', label: 'Collar Roll & Lapel Pick-Stitch', note: 'Hand-shaped collar roll and hand-set AMF pick stitching along lapel edges' },
  { id: 'chest', label: 'Floating Canvas & Chest Drape', note: 'Natural horsehair floating canvas molding to the chest with zero adhesive fusing' },
  { id: 'trouser', label: 'Waistband Dart & Trouser Crease', note: 'Curved split waistband with curtain lining and razor-sharp pressed front pleats' },
]

export default function MensFashionPage() {
  const [selectedGarmentId, setSelectedGarmentId] = useState('men-oxford-shirt')
  const [selectedFabricId, setSelectedFabricId] = useState('cotton')
  const [selectedColorHex, setSelectedColorHex] = useState(mensColorPalette[0].hex)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeOccasion, setActiveOccasion] = useState('All Occasions')
  const [selectedProportion, setSelectedProportion] = useState('regular')
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
    return mensGarments.find((g) => g.id === selectedGarmentId) ?? mensGarments[0]
  }, [selectedGarmentId])

  // Filtered garments based on category and occasion
  const filteredGarments = useMemo(() => {
    return mensGarments.filter((g) => {
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
      audience: 'Men',
      collection: 'Men’s',
      category: garment.category,
      clothingType: garment.clothingType ?? garment.category,
      brandId: 'fitmate-mens-atelier',
      brand: "FITMATE Men's Bespoke Atelier",
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
    const targetBrand = demoBrands.find((b) => b.id === 'marks-spencer') ?? demoBrands[0]
    return calculateDemoRecommendation(
      targetBrand,
      selectedGarment.clothingType ?? 'Shirt',
      savedMeasurements,
      'Men'
    )
  }, [selectedGarment, savedMeasurements])

  const handleToggleSaveWardrobe = () => {
    const sizeToSave = fitRecommendation?.primarySize || 'M'
    if (fitRecommendation?.primarySize) {
      saveActiveRecommendation({
        brandId: 'fitmate-mens-atelier',
        brand: "FITMATE Men's Bespoke Atelier",
        product: selectedGarment.label,
        audience: 'Men',
        category: selectedGarment.category,
        clothingType: selectedGarment.clothingType ?? selectedGarment.category,
        recommendedSize: sizeToSave,
        confidence: fitRecommendation.confidenceText,
      })
    }
    toggleSavedProduct({
      id: selectedGarment.id,
      audience: 'Men',
      collection: 'Men’s',
      category: selectedGarment.category,
      clothingType: selectedGarment.clothingType ?? selectedGarment.category,
      brandId: 'fitmate-mens-atelier',
      brand: "FITMATE Men's Bespoke Atelier",
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
    return `/find-my-size?audience=Men&category=${encodeURIComponent(selectedGarment.category)}&clothingType=${encodeURIComponent(selectedGarment.clothingType ?? selectedGarment.category)}`
  }, [selectedGarment])

  const selectedColor = useMemo(
    () => mensColorPalette.find((c) => c.hex === selectedColorHex) ?? mensColorPalette[0],
    [selectedColorHex]
  )
  const selectedFabricPreset = getFabricPreset(selectedFabricId)

  return (
    <div className="mens-world-page">
      {/* Atelier Header */}
      <header className="mens-header">
        <div className="mens-header-left">
          <BrandWordmark to="/" />
          <div className="mens-header-badge">
            <Flame size={13} />
            <span>THE 3D MEN'S FASHION ATELIER</span>
          </div>
        </div>

        <nav className="mens-nav" aria-label="Men's atelier navigation">
          <Link to="/">
            <ArrowLeft size={13} /> Main Showroom
          </Link>
          <Link to="/western-wear" className="mens-nav-accent">
            Western Showroom ↗
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
            { to: '/western-wear', label: 'Western 3D Showroom' },
            { to: '/lehenga-studio', label: 'Lehenga Studio' },
            { to: '/diwali-world', label: 'Diwali Fashion World' },
            { to: '/indian-ethnic-wear', label: 'Indian Couture' },
            { to: '/my-wardrobe', label: 'My Wardrobe' },
            { to: '/find-my-size', label: 'Find My Size' },
          ]}
        />
      </header>

      <main className="mens-main">
        {/* Top Marquee Bar */}
        <section className="mens-top-marquee">
          <div className="marquee-left">
            <span className="marquee-tag">SAVILE ROW & MILAN BESPOKE SARTORIAL ATELIER</span>
            <h1>The Gentleman’s 3D Atelier</h1>
            <p>
              Inspect bespoke suiting, Oxford shirts, selvedge denim, outerwear and royal ethnic fusion garments in real 3D. Explore varied male body proportions and tailoring details.
            </p>
          </div>
          <div className="marquee-actions">
            <Link to="/western-wear" className="mens-switch-btn" title="Explore the Western 3D Showroom">
              <span>Visit Western Showroom</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* 3-Column Studio Stage Grid */}
        <div className="mens-stage-grid">
          {/* Left column: Category & Garment Selection */}
          <aside className="mens-garments-panel" aria-label="Men's collection garments">
            <div className="garments-panel-header">
              <Eyebrow>SARTORIAL COLLECTION</Eyebrow>
              <h2>The Men's Wardrobe</h2>
            </div>

            {/* Department Category Filter Pills */}
            <div className="category-pill-filter" role="tablist" aria-label="Menswear categories">
              {mensCategories.map((cat) => (
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
              {mensOccasions.map((occasion) => (
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
            <div className="garments-scroll-list" role="radiogroup" aria-label="Select menswear garment to inspect">
              {filteredGarments.map((garment, index) => {
                const isSelected = selectedGarment.id === garment.id
                return (
                  <button
                    key={garment.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`mens-garment-card ${isSelected ? 'is-selected' : ''}`}
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
          <div className="mens-canvas-column">
            <div className="mens-canvas-frame" aria-label="3D Men's Fashion Environment">
              <Suspense
                fallback={
                  <div className="mens-scene-loader" role="status">
                    <Flame size={28} />
                    <span>ENTERING THE 3D MENSWEAR ATELIER</span>
                    <small>Lighting dark walnut herringbone floor, suiting racks & fitting mirrors…</small>
                  </div>
                }
              >
                <SceneManager
                  sceneId="mensFashionWorld"
                  sceneProps={{
                    selectedGarmentId,
                    fabricId: selectedFabricId,
                    customColor: selectedColorHex,
                    cameraView,
                    zoomLevel,
                    avatarRotationDeg,
                    autoRotate360,
                    maleProportion: selectedProportion,
                    activeInspectionPoint,
                    onInspectionSelect: setActiveInspectionPoint,
                    previewOnAvatar,
                    avatarAssetId: 'maleAvatar',
                    onGarmentSelect: setSelectedGarmentId,
                  }}
                  className="mens-3d-canvas"
                />
              </Suspense>

              <div className="mens-viewport-watermark" aria-hidden="true">
                <span className="watermark-tag">FITMATE SARTORIAL ATELIER</span>
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
                title={previewOnAvatar ? 'Switch to Tailor Form' : 'Preview on Avatar Form'}
              >
                <UserCheck size={13} />
                <span>{previewOnAvatar ? 'Tailor Form' : 'Avatar Form'}</span>
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

          {/* Right column: Specifications, Body Proportions & Fit Integration */}
          <aside className="mens-specs-panel">
            <div className="spec-header">
              <span className="spec-eyebrow">BESPOKE ATELIER SPECIFICATION</span>
              <h3>{selectedGarment.label}</h3>
              <p className="spec-category">
                {selectedGarment.category} · {selectedGarment.occasion} · {selectedGarment.clothingType}
              </p>
            </div>

            <div className="spec-description">{selectedGarment.detail}</div>

            {/* Varied Male Body Proportions Selector */}
            <div className="spec-proportions-section">
              <div className="section-title">
                <UserCheck size={13} />
                <span>MALE BODY PROPORTIONS ({mensBodyProportions.length} BUILDS)</span>
              </div>
              <div className="proportions-chips-grid">
                {mensBodyProportions.map((prop) => {
                  const isSelected = selectedProportion === prop.id
                  return (
                    <button
                      key={prop.id}
                      type="button"
                      className={`proportion-chip ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedProportion(prop.id)}
                      title={prop.note}
                    >
                      <strong>{prop.label}</strong>
                    </button>
                  )
                })}
              </div>
              <small className="active-proportion-note">
                Active Form: <strong>{mensBodyProportions.find((p) => p.id === selectedProportion)?.note}</strong>
              </small>
            </div>

            {/* Sartorial 3D Inspection Points */}
            <div className="spec-inspection-section">
              <div className="section-title">
                <Eye size={13} />
                <span>3D SARTORIAL INSPECTION POINTS</span>
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

            {/* Sartorial Color Dye Palette */}
            <div className="spec-colors">
              <div className="section-title">
                <Palette size={13} />
                <span>SUITING & SHIRTING DYES ({mensColorPalette.length} SHADES)</span>
              </div>
              <div className="color-dots">
                {mensColorPalette.map((col) => {
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

            {/* PBR Suiting Mill Study */}
            <div className="spec-material-block">
              <div className="section-title">
                <Layers size={13} />
                <span>3D PBR MILL & WEAVE STUDY</span>
              </div>
              <select
                className="fabric-select"
                value={selectedFabricId}
                onChange={(e) => setSelectedFabricId(e.target.value)}
                aria-label="Select Suiting Fabric"
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
                <span>CHEST & COLLAR SIZES</span>
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
                  <span className="fit-rec-label">Recommended for Your Proportions:</span>
                  <strong className="fit-rec-size">Size {fitRecommendation.primarySize}</strong>
                  <small>{fitRecommendation.confidenceText ?? 'Calibrated against verified menswear ease'}</small>
                </div>
              ) : (
                <p>Complete your measurement profile to unlock automated size mapping for this cut.</p>
              )}
              <div className="fit-guidance-text">
                <small><strong>Bespoke Fit Guidance:</strong> {selectedGarment.fitGuidance}</small>
              </div>
            </div>

            {/* Action Buttons: Find My Size & Save to Wardrobe */}
            <div className="spec-buttons">
              <Button to={findMySizeUrl} icon={ArrowUpRight} className="btn-find-size" size="small">
                Find My Size in this Look
              </Button>
              <Button
                to={`/virtual-fitting-room?audience=Men&category=${encodeURIComponent(selectedGarment.category)}`}
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
                <strong>ASSET INTEGRITY LEDGER ({mensAssetLedger.length} SLOTS)</strong>
                {showAssetLedger ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <p>
                Garment slot registered ({selectedGarment.assetId}). Real-time PBR Material Study active on Tailor Form.
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
                      {mensAssetLedger.map((row) => (
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
        <footer className="mens-footer">
          <BrandWordmark to="/" />
          <nav className="footer-links-row" aria-label="Explore other 3D fashion universes">
            <Link to="/western-wear">Western Haute-Couture Showroom</Link>
            <Link to="/lehenga-studio">Luxury Lehenga Studio</Link>
            <Link to="/diwali-world">Diwali Fashion World</Link>
            <Link to="/indian-ethnic-wear">Indian Ethnic Universe</Link>
            <Link to="/my-wardrobe">My Wardrobe</Link>
          </nav>
          <small>
            FITMATE Men’s Bespoke 3D Atelier · PBR Mill Studies & Automated Tailored Sizing.
          </small>
        </footer>
      </main>
    </div>
  )
}
