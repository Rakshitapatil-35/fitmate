import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  Heart,
  Layers,
  Maximize2,
  Palette,
  Play,
  RefreshCw,
  RotateCcw,
  Ruler,
  Scissors,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandWordmark, Button, Eyebrow } from '../components/DesignSystem.jsx'
import MobileNav from '../components/MobileNav.jsx'
import { calculateDemoRecommendation, demoBrands } from '../demoFitData.js'
import { getGarmentAppearanceSupport } from '../three/applyGarmentAppearance.js'
import { getReadySceneAsset } from '../three/assetManifest.js'
import { fabricPresets, getFabricPreset } from '../three/fabricMaterialLibrary.js'
import {
  lehengaAssetLedger,
  lehengaColorPalette,
  lehengaCollections,
} from '../three/lehengaCatalog.js'
import { loadMeasurements, loadWardrobe, saveSelectedGarment, toggleSavedProduct } from '../measurementStorage.js'
import SceneManager from '../three/SceneManager.jsx'
import './LehengaStudioPage.css'

const cameraViews = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' },
]

export default function LehengaStudioPage() {
  const [selectedLehengaId, setSelectedLehengaId] = useState('lehenga-bridal')
  const [selectedFabricId, setSelectedFabricId] = useState('zardozi-velvet')
  const [selectedColorHex, setSelectedColorHex] = useState(lehengaCollections[0].defaultColorHex)
  const [selectedEmbroidery, setSelectedEmbroidery] = useState('Zardozi & Dabka')
  const [selectedBlouseStyle, setSelectedBlouseStyle] = useState('Heritage Sweetheart')
  const [selectedDupattaStyle, setSelectedDupattaStyle] = useState('Dual Bridal Drape')
  const [selectedSleeveStyle, setSelectedSleeveStyle] = useState('Elbow-Length')
  const [cameraView, setCameraView] = useState('front')
  const [zoomLevel, setZoomLevel] = useState('full')
  const [isRunwayMode, setIsRunwayMode] = useState(false)
  const [previewOnAvatar, setPreviewOnAvatar] = useState(false)
  const [autoRotate360, setAutoRotate360] = useState(false)
  const [avatarRotationDeg, setAvatarRotationDeg] = useState(0)
  const [activeInspectionPoint, setActiveInspectionPoint] = useState(null)
  const [poseSupported, setPoseSupported] = useState(false)
  const [showAssetLedger, setShowAssetLedger] = useState(false)
  const [styleFilter, setStyleFilter] = useState('All')
  const [wardrobe, setWardrobe] = useState(() => loadWardrobe())
  const [savedSuccessToast, setSavedSuccessToast] = useState(false)
  const [userMeasurements, setUserMeasurements] = useState(() => loadMeasurements())
  const toastTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  // Listen for storage changes if user updates measurements in another tab/page
  useEffect(() => {
    const handleStorage = () => {
      setUserMeasurements(loadMeasurements())
      setWardrobe(loadWardrobe())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const selectedLehenga = useMemo(() => {
    return lehengaCollections.find((g) => g.id === selectedLehengaId) ?? lehengaCollections[0]
  }, [selectedLehengaId])

  const selectedColorEntry = useMemo(() => {
    return lehengaColorPalette.find((c) => c.hex === selectedColorHex) ?? lehengaColorPalette[0]
  }, [selectedColorHex])

  const studioAsset = getReadySceneAsset('lehengaStudio')
  const garmentAsset = getReadySceneAsset(selectedLehenga.assetId)
  const avatarAsset = getReadySceneAsset('femaleAvatar')
  const supportsAvatar = Boolean(
    garmentAsset && avatarAsset?.skeletonId && garmentAsset.compatibleAvatarRigs?.includes(avatarAsset.skeletonId)
  )

  const appearanceSupport = useMemo(
    () => getGarmentAppearanceSupport(garmentAsset, selectedFabricId, selectedColorEntry.id),
    [garmentAsset, selectedFabricId, selectedColorEntry.id]
  )

  const colorControlNote = garmentAsset
    ? appearanceSupport.color
      ? 'Production GLB colorSlot active.'
      : 'Production GLB has no editable colorSlots for this shade.'
    : `${selectedLehenga.supportedColors?.length ?? 0} shades supported on PBR textile study.`

  const filteredLehengas = useMemo(() => {
    if (styleFilter === 'All') return lehengaCollections
    return lehengaCollections.filter((g) => g.styleCategory === styleFilter)
  }, [styleFilter])

  const isOutfitSaved = useMemo(() => {
    return wardrobe.savedProducts.some((item) => item.id === selectedLehenga.id)
  }, [wardrobe, selectedLehenga])

  // Size recommendation using FITMATE measurement engine
  const recommendedSize = useMemo(() => {
    if (!userMeasurements) return null
    try {
      const rec = calculateDemoRecommendation({
        brand: demoBrands[0],
        category: 'Traditional wear',
        fitPreference: 'Regular',
        measurements: {
          chest: userMeasurements.bust ?? userMeasurements.chest ?? 88,
          waist: userMeasurements.waist ?? 72,
          hip: userMeasurements.hip ?? 98,
        },
        productType: 'Lehenga choli',
      })
      return rec
    } catch {
      return null
    }
  }, [userMeasurements])

  const handleLehengaSelect = useCallback((lehengaOrId) => {
    const lehenga =
      typeof lehengaOrId === 'string'
        ? lehengaCollections.find((item) => item.id === lehengaOrId)
        : lehengaOrId
    if (!lehenga) return
    setSelectedLehengaId(lehenga.id)
    setSelectedFabricId(lehenga.fabricId)
    setSelectedColorHex(lehenga.defaultColorHex)
    setActiveInspectionPoint(null)
    setIsRunwayMode(false)
    setAutoRotate360(false)
    setAvatarRotationDeg(0)
    saveSelectedGarment({
      id: lehenga.id,
      audience: 'Women',
      collection: 'Indian Ethnic',
      category: 'Lehengas',
      clothingType: 'Lehenga choli',
      brandId: 'fitmate-couture-lehenga',
      brand: 'FITMATE Haute Couture',
      productName: lehenga.label,
      name: lehenga.label,
      occasion: 'Bridal & Festive',
      garmentAssetId: lehenga.assetId,
      color: lehenga.defaultColorHex,
      fabric: lehenga.fabricId,
    })
  }, [])

  const handleInspectionSelect = useCallback((point) => {
    setActiveInspectionPoint(point)
    setIsRunwayMode(false)
    if (point) {
      if (point.id === 'choli') setZoomLevel('blouse-detail')
      else if (point.id === 'kalis' || point.id === 'flair' || point.id === 'border') setZoomLevel('skirt-detail')
      else setZoomLevel('blouse-detail')
    } else {
      setZoomLevel('full')
    }
  }, [])

  const resetCamera = useCallback(() => {
    setCameraView('front')
    setZoomLevel('full')
    setIsRunwayMode(false)
    setAutoRotate360(false)
    setAvatarRotationDeg(0)
    setActiveInspectionPoint(null)
  }, [])

  const toggleRunwayMode = useCallback(() => {
    setIsRunwayMode((prev) => {
      const next = !prev
      if (next) setActiveInspectionPoint(null)
      return next
    })
    setCameraView('front')
  }, [])

  const handleToggleSaveWardrobe = () => {
    toggleSavedProduct({
      id: selectedLehenga.id,
      audience: 'Women',
      category: 'Lehenga choli',
      clothingType: 'Lehenga choli',
      brandId: 'fitmate-couture-lehenga',
      brand: 'FITMATE Haute Couture',
      productName: selectedLehenga.label,
      name: selectedLehenga.label,
      occasion: 'Bridal & Festive',
      garmentAssetId: selectedLehenga.assetId,
      image: '',
      color: selectedColorHex,
      fabric: selectedFabricId,
    })
    setWardrobe(loadWardrobe())
    setSavedSuccessToast(true)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setSavedSuccessToast(false), 3200)
  }

  const findMySizeUrl = useMemo(() => {
    return `/find-my-size?audience=Women&category=${encodeURIComponent('Traditional wear')}&clothingType=${encodeURIComponent('Lehenga choli')}`
  }, [])

  const selectedFabricPreset = getFabricPreset(selectedFabricId)

  return (
    <div className="lehenga-studio-page">
      {/* Luxury Salon Header */}
      <header className="lehenga-header">
        <div className="lehenga-header-left">
          <BrandWordmark to="/" />
          <div className="lehenga-header-badge">
            <Sparkles size={14} />
            <span>LUXURY 3D LEHENGA STUDIO</span>
          </div>
        </div>

        <nav className="lehenga-nav" aria-label="Lehenga Studio Navigation">
          <Link to="/">Main Showroom</Link>
          <Link to="/indian-ethnic-wear">Indian Couture Palace</Link>
          <Link to="/diwali-edit">Diwali Atelier</Link>
          <Link to="/my-wardrobe">My Wardrobe</Link>
          <Button to={findMySizeUrl} size="small" icon={ArrowUpRight}>
            Find My Size
          </Button>
        </nav>

        <MobileNav
          links={[
            { to: '/', label: 'Home & Showroom' },
            { to: '/indian-ethnic-wear', label: 'Indian Couture' },
            { to: '/diwali-edit', label: 'Diwali Atelier' },
            { to: '/my-wardrobe', label: 'My Wardrobe' },
            { to: '/find-my-size', label: 'Find My Size' },
          ]}
        />
      </header>

      {/* Main Experience Layout */}
      <main className="lehenga-main">
        {/* Top Champagne Gold Hero Marquee */}
        <section className="lehenga-top-marquee">
          <div className="marquee-left">
            <span className="marquee-tag">
              <Sparkles size={13} /> EXCLUSIVE HAUTE COUTURE ATELIER
            </span>
            <h1>The Grand 3D Lehenga Studio</h1>
            <p>
              Step into an exclusive couture salon featuring champagne-gold arches, fluted columns, reflective
              Makrana marble, and 10 bespoke bridal, festive and designer lehenga creations in motion.
            </p>
          </div>

          <div className="marquee-actions">
            <button
              type="button"
              className={`lehenga-runway-btn ${isRunwayMode ? 'is-active' : ''}`}
              onClick={toggleRunwayMode}
              aria-pressed={isRunwayMode}
            >
              <Play size={15} />
              <span>{isRunwayMode ? 'Exit Runway Promenade' : 'Start Runway Walk'}</span>
            </button>
            <Link to="/indian-ethnic-wear" className="lehenga-back-universe-btn">
              <ArrowLeft size={14} /> Return to Indian Couture
            </Link>
          </div>
        </section>

        {/* 3-Column Experience Grid */}
        <div className="lehenga-stage-grid">
          {/* Left Column: 10 Lehenga Collections Selector */}
          <aside className="lehenga-collection-panel" aria-label="Lehenga Collection Catalog">
            <div className="collection-panel-header">
              <Eyebrow>COUTURE COLLECTIONS</Eyebrow>
              <h2>The 10 Lehenga Styles</h2>
              <div className="style-pill-filter" role="group" aria-label="Filter lehenga styles">
                <button
                  type="button"
                  className={styleFilter === 'All' ? 'is-active' : ''}
                  onClick={() => setStyleFilter('All')}
                >
                  All (10)
                </button>
                <button
                  type="button"
                  className={styleFilter === 'Bridal' ? 'is-active' : ''}
                  onClick={() => setStyleFilter('Bridal')}
                >
                  Bridal
                </button>
                <button
                  type="button"
                  className={styleFilter === 'Festive' ? 'is-active' : ''}
                  onClick={() => setStyleFilter('Festive')}
                >
                  Festive
                </button>
                <button
                  type="button"
                  className={styleFilter === 'Designer' ? 'is-active' : ''}
                  onClick={() => setStyleFilter('Designer')}
                >
                  Designer
                </button>
              </div>
            </div>

            <div className="lehengas-scroll-list" role="radiogroup" aria-label="Select lehenga style">
              {filteredLehengas.map((garment, index) => {
                const isSelected = selectedLehenga.id === garment.id
                return (
                  <button
                    key={garment.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`lehenga-item-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleLehengaSelect(garment)}
                  >
                    <div className="card-top-row">
                      <span className="card-index">0{index + 1}</span>
                      <span className="card-category-badge">{garment.styleCategory}</span>
                      <strong className="card-price">{garment.price}</strong>
                    </div>
                    <h3>{garment.label}</h3>
                    <p>{garment.detail}</p>
                    <div className="card-specs-row">
                      <span>{garment.kalis} Kalis</span>
                      <span>{garment.gheraMeters}m Flare</span>
                      <span className="card-inspect-cta">Inspect in 3D ↗</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Center Column: 3D Studio Canvas */}
          <div className="lehenga-canvas-column">
            <div className="lehenga-canvas-frame" aria-label="3D Luxury Lehenga Studio Environment">
              <Suspense
                fallback={
                  <div className="lehenga-scene-loader" role="status">
                    <Sparkles size={28} />
                    <span>ENTERING THE LUXURY LEHENGA STUDIO</span>
                    <small>Lighting champagne-gold salons, marble runway &amp; glass showcases…</small>
                  </div>
                }
              >
                <SceneManager
                  sceneId="lehengaStudio"
                  sceneProps={{
                    selectedLehengaId: selectedLehenga.id,
                    fabricId: selectedFabricId,
                    selectedColorId: selectedColorEntry.id,
                    customColor: selectedColorHex,
                    cameraView,
                    zoomLevel,
                    isRunwayMode,
                    previewOnAvatar,
                    autoRotate360,
                    avatarRotationDeg,
                    activeInspectionPoint,
                    onInspectionSelect: handleInspectionSelect,
                    onLehengaSelect: handleLehengaSelect,
                    onPoseSupport: setPoseSupported,
                  }}
                  className="lehenga-3d-canvas"
                />
              </Suspense>

              {/* Viewport Floating Watermark */}
              <div className="lehenga-viewport-watermark" aria-hidden="true">
                <span className="watermark-tag">
                  FITMATE COUTURE ATELIER ·{' '}
                  {garmentAsset ? 'GLB PRODUCTION MODEL' : 'PBR TEXTILE & SILHOUETTE STUDY'}
                </span>
                <strong className="watermark-title">{selectedLehenga.label}</strong>
                {previewOnAvatar && !supportsAvatar && (
                  <span className="lehenga-3d-pending-note">
                    Rigged Avatar &amp; Garment GLB Pending · Dress Form Active
                  </span>
                )}
              </div>

              {/* Active Craftsmanship Inspection Banner */}
              {activeInspectionPoint && !isRunwayMode && (
                <div className="lehenga-inspection-banner" role="status">
                  <Eye size={15} />
                  <div>
                    <strong>{activeInspectionPoint.label}</strong>
                    <p>{activeInspectionPoint.note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInspectionSelect(null)}
                    aria-label="Close craftsmanship inspection detail"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Runway Indicator Banner */}
              {isRunwayMode && (
                <div className="lehenga-runway-indicator" role="status">
                  <span className="lehenga-sparkle-dot" />
                  <div>
                    <strong>CINEMATIC LEHENGA RUNWAY PROMENADE</strong>
                    <p>
                      {supportsAvatar && poseSupported
                        ? 'Rigged 3D avatar walking along the champagne-gold runway.'
                        : 'Observing skirt flare and silhouette motion along the marble runway.'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setIsRunwayMode(false)} aria-label="Exit runway view">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Toast Notification when Outfit Saved to Wardrobe */}
              {savedSuccessToast && (
                <div className="lehenga-toast" role="status">
                  <Check size={16} />
                  <span>Lehenga saved to My Wardrobe!</span>
                  <Link to="/my-wardrobe">View Wardrobe ↗</Link>
                </div>
              )}

              {/* Gesture Hint */}
              <div className="lehenga-gesture-hint">
                <span>360° DRAG TO ROTATE</span>
                <i />
                <span>SCROLL TO ZOOM</span>
                <i />
                <span>CLICK 3D PINS OR VITRINES TO INSPECT</span>
              </div>
            </div>

            {/* Bottom 3D Inspection Control Toolbar */}
            <div className="lehenga-toolbar" aria-label="3D Viewing and Camera Controls">
              <div className="toolbar-angle-group" role="group" aria-label="Camera Angle">
                <span className="toolbar-heading">Angle:</span>
                {cameraViews.map((view) => (
                  <button
                    key={view.id}
                    type="button"
                    aria-pressed={cameraView === view.id && !isRunwayMode}
                    className={cameraView === view.id && !isRunwayMode ? 'is-active' : ''}
                    onClick={() => {
                      setIsRunwayMode(false)
                      setCameraView(view.id)
                    }}
                  >
                    {view.label}
                  </button>
                ))}
              </div>

              <div className="toolbar-turntable-group" role="group" aria-label="360 Degree Turntable Rotation">
                <button
                  type="button"
                  aria-pressed={autoRotate360}
                  className={autoRotate360 ? 'is-active' : ''}
                  onClick={() => setAutoRotate360((prev) => !prev)}
                >
                  <RefreshCw size={13} /> 360° Spin
                </button>
                <label className="toolbar-degree-slider" aria-label="Manual 360-degree garment angle">
                  <Compass size={13} />
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={5}
                    value={avatarRotationDeg}
                    onChange={(e) => {
                      setAutoRotate360(false)
                      setAvatarRotationDeg(Number(e.target.value))
                    }}
                  />
                  <span>{avatarRotationDeg}°</span>
                </label>
              </div>

              <div className="toolbar-zoom-group" role="group" aria-label="Camera Zoom">
                <button
                  type="button"
                  aria-pressed={zoomLevel === 'full'}
                  className={zoomLevel === 'full' ? 'is-active' : ''}
                  onClick={() => setZoomLevel('full')}
                >
                  <Maximize2 size={13} /> Full View
                </button>
                <button
                  type="button"
                  aria-pressed={zoomLevel === 'blouse-detail'}
                  className={zoomLevel === 'blouse-detail' ? 'is-active' : ''}
                  onClick={() => setZoomLevel('blouse-detail')}
                >
                  <Camera size={13} /> Blouse
                </button>
                <button
                  type="button"
                  aria-pressed={zoomLevel === 'skirt-detail'}
                  className={zoomLevel === 'skirt-detail' ? 'is-active' : ''}
                  onClick={() => setZoomLevel('skirt-detail')}
                >
                  <Camera size={13} /> Skirt Ghera
                </button>
                <button
                  type="button"
                  className="toolbar-reset-icon"
                  onClick={resetCamera}
                  aria-label="Reset camera"
                  title="Reset Camera & Rotation"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Avatar Toggle */}
              <button
                type="button"
                className={`toolbar-avatar-toggle ${previewOnAvatar ? 'is-active' : ''}`}
                onClick={() => setPreviewOnAvatar((prev) => !prev)}
                aria-pressed={previewOnAvatar}
                title={
                  supportsAvatar
                    ? 'Toggle between standalone garment and rigged 3D human avatar'
                    : 'Rigged avatar GLB pending licensing — previews notice on dress form'
                }
              >
                <UserCheck size={14} />
                <span>
                  {supportsAvatar
                    ? previewOnAvatar
                      ? 'Garment Only'
                      : 'Rigged Avatar View'
                    : previewOnAvatar
                      ? 'Dress Form Only'
                      : 'Avatar View (GLB Pending)'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Customisation, Separates Breakdown, Size Integration & Wardrobe Action */}
          <aside className="lehenga-spec-panel" aria-label="Lehenga Details and Sizing">
            <div className="spec-card">
              <div className="spec-card-header">
                <div>
                  <Eyebrow>{selectedLehenga.styleCategory.toUpperCase()} LEHENGA</Eyebrow>
                  <h2>{selectedLehenga.label}</h2>
                  <div className="spec-price-row">
                    <strong className="spec-price-tag">{selectedLehenga.price}</strong>
                    <span className="spec-region-tag">{selectedLehenga.region}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`wardrobe-save-btn ${isOutfitSaved ? 'is-saved' : ''}`}
                  onClick={handleToggleSaveWardrobe}
                  aria-label={isOutfitSaved ? 'Remove from My Wardrobe' : 'Save lehenga to My Wardrobe'}
                  title={isOutfitSaved ? 'Saved in My Wardrobe' : 'Save lehenga to My Wardrobe'}
                >
                  <Heart size={18} fill={isOutfitSaved ? '#d4af37' : 'none'} />
                </button>
              </div>

              {/* 3-Piece Separates Component Breakdown */}
              <div className="spec-separates-box">
                <div className="section-title">
                  <Scissors size={14} />
                  <span>SEPARATES COMPONENT BREAKDOWN</span>
                </div>
                <div className="separates-grid">
                  <div className="separate-item">
                    <span className="separate-badge">1. BLOUSE (CHOLI)</span>
                    <strong>{selectedLehenga.components.blouse.name}</strong>
                    <p>{selectedLehenga.components.blouse.cut}</p>
                    <small>Sleeve: {selectedLehenga.components.blouse.sleeve}</small>
                  </div>
                  <div className="separate-item">
                    <span className="separate-badge">2. SKIRT (LEHENGA)</span>
                    <strong>{selectedLehenga.components.skirt.name}</strong>
                    <p>{selectedLehenga.components.skirt.ghera}</p>
                    <small>Waist: {selectedLehenga.components.skirt.waistBand}</small>
                  </div>
                  <div className="separate-item">
                    <span className="separate-badge">3. DUPATTA (VEIL)</span>
                    <strong>{selectedLehenga.components.dupatta.name}</strong>
                    <p>{selectedLehenga.components.dupatta.drape}</p>
                    <small>Border: {selectedLehenga.components.dupatta.border}</small>
                  </div>
                </div>
              </div>

              {/* Interactive Craftsmanship Inspection Hotspot Chips */}
              <div className="spec-inspection-block">
                <div className="section-title">
                  <Eye size={14} />
                  <span>CRAFTSMANSHIP INSPECTION POINTS</span>
                </div>
                <div className="inspection-chip-list">
                  {selectedLehenga.inspectionPoints.map((pt) => {
                    const isPointActive = activeInspectionPoint?.id === pt.id
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        className={`inspection-chip ${isPointActive ? 'is-active' : ''}`}
                        onClick={() => handleInspectionSelect(isPointActive ? null : pt)}
                        aria-pressed={isPointActive}
                      >
                        {pt.label}
                      </button>
                    )
                  })}
                </div>
                <p className="inspection-active-note">
                  {activeInspectionPoint
                    ? activeInspectionPoint.note
                    : 'Select any craftsmanship hotspot above or click the 3D gemstone pins on the runway model.'}
                </p>
              </div>

              {/* Customisation: Colour Variants */}
              <div className="spec-color-block">
                <div className="section-title">
                  <Palette size={14} />
                  <span>HERITAGE &amp; BRIDAL COLOUR SHADES</span>
                </div>
                <div className="color-swatches" role="radiogroup" aria-label="Select Lehenga Colour">
                  {lehengaColorPalette.map((col) => {
                    const isSupportedByGarment = selectedLehenga.supportedColors.includes(col.id)
                    const isSelected = selectedColorHex === col.hex
                    return (
                      <button
                        key={col.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={!isSupportedByGarment}
                        className={`color-dot ${isSelected ? 'is-selected' : ''} ${!isSupportedByGarment ? 'is-unsupported' : ''}`}
                        style={{ backgroundColor: col.hex }}
                        onClick={() => setSelectedColorHex(col.hex)}
                        title={
                          isSupportedByGarment
                            ? `${col.label} — ${col.note}`
                            : `${col.label} — Not supported for ${selectedLehenga.shortLabel}`
                        }
                      >
                        {isSelected && <span className="dot-active-marker" />}
                      </button>
                    )
                  })}
                </div>
                <small className="active-color-name">
                  Selected Shade: <strong>{selectedColorEntry?.label}</strong> · {colorControlNote}
                </small>
              </div>

              {/* Customisation: Fabric Variant Selector */}
              <div className="spec-material-block">
                <div className="section-title">
                  <Layers size={14} />
                  <span>3D PBR TEXTILE WEAVE</span>
                </div>
                <select
                  className="fabric-select"
                  value={selectedFabricId}
                  onChange={(e) => setSelectedFabricId(e.target.value)}
                  aria-label="Select Fabric Material"
                >
                  {fabricPresets
                    .filter((p) =>
                      ['zardozi-velvet', 'banarasi-silk', 'silk', 'mirror-work-georgette', 'organza', 'net', 'georgette', 'brocade-royal'].includes(
                        p.id
                      )
                    )
                    .map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label} ({preset.weave})
                      </option>
                    ))}
                </select>
                <p className="material-note">{selectedFabricPreset.note}</p>
              </div>

              {/* Customisation: Silhouette & Component Styling Options */}
              <div className="spec-customisation-options">
                <div className="section-title">
                  <Sparkles size={14} />
                  <span>BESPOKE STYLING VARIATIONS</span>
                </div>
                <div className="custom-options-grid">
                  <div className="custom-option-group">
                    <label htmlFor="blouse-select">Blouse Cut:</label>
                    <select
                      id="blouse-select"
                      value={selectedBlouseStyle}
                      onChange={(e) => setSelectedBlouseStyle(e.target.value)}
                    >
                      <option value="Heritage Sweetheart">Heritage Sweetheart</option>
                      <option value="Deep V-Neckline">Deep V-Neckline</option>
                      <option value="Queen Anne Jewel">Queen Anne Jewel</option>
                      <option value="Corset Bustier">Corset Bustier</option>
                      <option value="Mandarin Wrap Top">Mandarin Wrap Top</option>
                    </select>
                  </div>
                  <div className="custom-option-group">
                    <label htmlFor="sleeve-select">Sleeve Cut:</label>
                    <select
                      id="sleeve-select"
                      value={selectedSleeveStyle}
                      onChange={(e) => setSelectedSleeveStyle(e.target.value)}
                    >
                      <option value="Elbow-Length">Elbow-Length</option>
                      <option value="Sleeveless">Sleeveless</option>
                      <option value="Cap Sleeve">Cap Sleeve</option>
                      <option value="Full Illusion Net">Full Illusion Net</option>
                    </select>
                  </div>
                  <div className="custom-option-group">
                    <label htmlFor="dupatta-select">Dupatta Drape:</label>
                    <select
                      id="dupatta-select"
                      value={selectedDupattaStyle}
                      onChange={(e) => setSelectedDupattaStyle(e.target.value)}
                    >
                      <option value="Dual Bridal Drape">Dual Bridal Drape</option>
                      <option value="Diagonal Nivi Drape">Diagonal Nivi Drape</option>
                      <option value="Cape Veil Attachment">Cape Veil Attachment</option>
                      <option value="Pre-Pleated Stole">Pre-Pleated Stole</option>
                    </select>
                  </div>
                  <div className="custom-option-group">
                    <label htmlFor="embroidery-select">Embroidery:</label>
                    <select
                      id="embroidery-select"
                      value={selectedEmbroidery}
                      onChange={(e) => setSelectedEmbroidery(e.target.value)}
                    >
                      <option value="Zardozi & Dabka">Zardozi &amp; Dabka</option>
                      <option value="Gota Patti">Gota Patti</option>
                      <option value="Resham Threadwork">Resham Threadwork</option>
                      <option value="Shisha Mirror Work">Shisha Mirror Work</option>
                      <option value="Micro-Sequin Pave">Micro-Sequin Pave</option>
                    </select>
                  </div>
                </div>
                <small className="customisation-disclaimer">
                  Styling selections previewed on PBR textile study &amp; specifications. 3D mesh component swaps require multipart GLB assets.
                </small>
              </div>

              {/* FITMATE Size & Measurement Integration */}
              <div className="spec-sizing-block">
                <div className="section-title">
                  <Ruler size={14} />
                  <span>FITMATE SIZE &amp; MEASUREMENT INTEGRATION</span>
                </div>

                {/* Sizing Comparison: Wearer Body vs Finished Garment */}
                <div className="sizing-comparison-table">
                  <div className="sizing-table-header">
                    <span>Metric</span>
                    <span>Garment Spec</span>
                    <span>Wearer Body</span>
                  </div>
                  <div className="sizing-table-row">
                    <span>Choli Bust</span>
                    <strong>{selectedLehenga.garmentMeasurements.choliBust} cm</strong>
                    <span>{userMeasurements?.bust ? `${userMeasurements.bust} cm` : 'Not saved'}</span>
                  </div>
                  <div className="sizing-table-row">
                    <span>Skirt Waist</span>
                    <strong>{selectedLehenga.garmentMeasurements.skirtWaist} cm</strong>
                    <span>{userMeasurements?.waist ? `${userMeasurements.waist} cm` : 'Not saved'}</span>
                  </div>
                  <div className="sizing-table-row">
                    <span>Skirt Length</span>
                    <strong>{selectedLehenga.garmentMeasurements.skirtLength} cm</strong>
                    <span>Heel: 3.5 in</span>
                  </div>
                  <div className="sizing-table-row">
                    <span>Skirt Sweep</span>
                    <strong>{selectedLehenga.garmentMeasurements.skirtGhera} cm</strong>
                    <span>{selectedLehenga.kalis} Kalis</span>
                  </div>
                </div>

                {/* Recommendation Pill */}
                <div className="recommendation-badge-box">
                  {recommendedSize ? (
                    <div>
                      <span className="rec-size-label">RECOMMENDED SIZE:</span>
                      <strong className="rec-size-value">{recommendedSize.size}</strong>
                      <p>{recommendedSize.alternativeReason}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="rec-size-label">SAMPLE SIZE PROFILE</span>
                      <strong className="rec-size-value">{selectedLehenga.garmentMeasurements.size}</strong>
                      <p>Save your measurements to see a bespoke size recommendation for this lehenga.</p>
                    </div>
                  )}
                </div>

                <p className="sizing-ease-note">
                  <strong>Wearing Ease Notice:</strong> {selectedLehenga.fitEaseGuidance}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="spec-actions-row">
                <Button to={findMySizeUrl} icon={ArrowUpRight} className="btn-find-size">
                  Find My Size in this Lehenga
                </Button>
                <Button
                  to="/virtual-fitting-room?audience=Women&category=Traditional%20wear&clothingType=Lehenga%20choli"
                  variant="secondary"
                  icon={Scissors}
                  className="btn-try-fitting"
                >
                  Try on in 3D Fitting Room
                </Button>
                <button
                  type="button"
                  className={`btn-save-wardrobe ${isOutfitSaved ? 'is-saved' : ''}`}
                  onClick={handleToggleSaveWardrobe}
                >
                  <Heart size={15} fill={isOutfitSaved ? '#d4af37' : 'none'} />
                  <span>{isOutfitSaved ? 'Saved in My Wardrobe' : 'Save to My Wardrobe'}</span>
                </button>
              </div>

              {/* Transparent Temporary & Missing GLB Ledger */}
              <div className="spec-asset-status">
                <div className="asset-status-top">
                  <span className={`status-light ${garmentAsset && avatarAsset && studioAsset ? 'is-ready' : ''}`} />
                  <div>
                    <strong>TEMPORARY &amp; MISSING ASSETS LEDGER</strong>
                    <p>
                      Couture Studio GLB ({studioAsset ? 'Ready' : 'Procedural Salon'}), Garment Slot{' '}
                      <code>{selectedLehenga.assetId}</code> ({garmentAsset ? 'Ready' : 'Pending GLB'}), Rigged Avatar{' '}
                      <code>femaleAvatar</code> ({avatarAsset ? 'Ready' : 'Pending GLB'}).
                    </p>
                  </div>
                  <button
                    type="button"
                    className="asset-ledger-toggle"
                    onClick={() => setShowAssetLedger((prev) => !prev)}
                    aria-expanded={showAssetLedger}
                    aria-label="Toggle asset ledger details"
                  >
                    {showAssetLedger ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                {showAssetLedger && (
                  <ul className="asset-ledger-list">
                    {lehengaAssetLedger.map((entry) => (
                      <li key={entry.slotId}>
                        <strong>{entry.slotId}</strong> — <span>{entry.status}</span>
                        <small>{entry.missingFile}</small>
                        <p>{entry.currentRepresentation}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
