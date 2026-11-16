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
  Flame,
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
import { getGarmentAppearanceSupport } from '../three/applyGarmentAppearance.js'
import { getReadySceneAsset } from '../three/assetManifest.js'
import { fabricPresets, getFabricPreset } from '../three/fabricMaterialLibrary.js'
import { diwaliAssetLedger, diwaliColorPalette, diwaliGarments } from '../three/diwaliCatalog.js'
import { loadWardrobe, saveSelectedGarment, toggleSavedProduct } from '../measurementStorage.js'
import SceneManager from '../three/SceneManager.jsx'
import './DiwaliFashionWorldPage.css'

const cameraViews = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' },
]

export default function DiwaliFashionWorldPage() {
  const [selectedGarmentId, setSelectedGarmentId] = useState('diwali-banarasi')
  const [selectedFabricId, setSelectedFabricId] = useState('banarasi-silk')
  const [selectedColorHex, setSelectedColorHex] = useState(diwaliGarments[0].defaultColorHex)
  const [cameraView, setCameraView] = useState('front')
  const [zoomLevel, setZoomLevel] = useState('full')
  const [isRunwayMode, setIsRunwayMode] = useState(false)
  const [previewOnAvatar, setPreviewOnAvatar] = useState(false)
  const [autoRotate360, setAutoRotate360] = useState(false)
  const [avatarRotationDeg, setAvatarRotationDeg] = useState(0)
  const [activeInspectionPoint, setActiveInspectionPoint] = useState(null)
  const [poseSupported, setPoseSupported] = useState(false)
  const [showAssetLedger, setShowAssetLedger] = useState(false)
  const [audienceFilter, setAudienceFilter] = useState('All')
  const [wardrobe, setWardrobe] = useState(() => loadWardrobe())
  const [savedSuccessToast, setSavedSuccessToast] = useState(false)
  const toastTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  // Current active garment
  const selectedGarment = useMemo(() => {
    return diwaliGarments.find((g) => g.id === selectedGarmentId) ?? diwaliGarments[0]
  }, [selectedGarmentId])

  const selectedColorEntry = useMemo(() => {
    return diwaliColorPalette.find((c) => c.hex === selectedColorHex) ?? diwaliColorPalette[0]
  }, [selectedColorHex])

  const worldAsset = getReadySceneAsset('diwaliWorld')
  const garmentAsset = getReadySceneAsset(selectedGarment.assetId)
  const avatarAssetId = selectedGarment.audience === 'Men' ? 'maleAvatar' : 'femaleAvatar'
  const avatarAsset = getReadySceneAsset(avatarAssetId)
  const supportsAvatar = Boolean(
    garmentAsset && avatarAsset?.skeletonId && garmentAsset.compatibleAvatarRigs?.includes(avatarAsset.skeletonId)
  )
  const appearanceSupport = useMemo(
    () => getGarmentAppearanceSupport(garmentAsset, selectedFabricId, selectedColorEntry.id),
    [garmentAsset, selectedFabricId, selectedColorEntry.id]
  )
  const hasGlbColorSlots = Boolean(garmentAsset?.colorSlots?.length && garmentAsset?.colorVariants?.length)
  const colorControlNote = garmentAsset
    ? appearanceSupport.color
      ? 'Production GLB colorSlot active.'
      : 'Production GLB has no editable colorSlots for this shade.'
    : `${selectedGarment.supportedColors?.length ?? 0} festive shades supported on PBR weave study.`

  // Filtered garments list
  const filteredGarments = useMemo(() => {
    if (audienceFilter === 'All') return diwaliGarments
    return diwaliGarments.filter((g) => g.audience === audienceFilter)
  }, [audienceFilter])

  // Check if outfit is currently saved in wardrobe
  const isOutfitSaved = useMemo(() => {
    return wardrobe.savedProducts.some((item) => item.id === selectedGarment.id)
  }, [wardrobe, selectedGarment])

  const handleGarmentSelect = useCallback((garmentOrId) => {
    const garment =
      typeof garmentOrId === 'string'
        ? diwaliGarments.find((item) => item.id === garmentOrId)
        : garmentOrId
    if (!garment) return
    setSelectedGarmentId(garment.id)
    setSelectedFabricId(garment.fabricId)
    setSelectedColorHex(garment.defaultColorHex)
    setActiveInspectionPoint(null)
    setIsRunwayMode(false)
    setAutoRotate360(false)
    setAvatarRotationDeg(0)
    saveSelectedGarment({
      id: garment.id,
      audience: garment.audience,
      collection: 'Diwali',
      category: garment.category,
      clothingType: garment.category,
      brandId: 'fitmate-diwali-atelier',
      brand: 'FITMATE Diwali Atelier',
      productName: garment.label,
      name: garment.label,
      occasion: 'Diwali',
      garmentAssetId: garment.assetId,
      color: garment.defaultColorHex,
      fabric: garment.fabricId,
    })
  }, [])

  const handleInspectionSelect = useCallback((point) => {
    setActiveInspectionPoint(point)
    setIsRunwayMode(false)
    setZoomLevel(point ? 'detail' : 'full')
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

  // Save outfit to My Wardrobe
  const handleToggleSaveWardrobe = () => {
    toggleSavedProduct({
      id: selectedGarment.id,
      audience: selectedGarment.audience,
      category: selectedGarment.category,
      clothingType: selectedGarment.category,
      brandId: 'fitmate-diwali-atelier',
      brand: 'FITMATE Diwali Atelier',
      productName: selectedGarment.label,
      name: selectedGarment.label,
      occasion: 'Diwali',
      garmentAssetId: selectedGarment.assetId,
      image: '',
      color: selectedColorHex,
      fabric: selectedFabricId,
    })
    setWardrobe(loadWardrobe())
    setSavedSuccessToast(true)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setSavedSuccessToast(false), 3200)
  }

  // Find My Size Link builder
  const findMySizeUrl = useMemo(() => {
    const audience = selectedGarment.audience
    const category = 'Traditional wear'
    const clothingType = selectedGarment.category
    return `/find-my-size?audience=${encodeURIComponent(audience)}&category=${encodeURIComponent(category)}&clothingType=${encodeURIComponent(clothingType)}`
  }, [selectedGarment])

  const selectedFabricPreset = getFabricPreset(selectedFabricId)

  return (
    <div className="diwali-world-page">
      {/* Festive Palace Header */}
      <header className="diwali-header">
        <div className="diwali-header-left">
          <BrandWordmark to="/" />
          <div className="diwali-header-badge">
            <Flame size={14} />
            <span>THE 3D DIWALI FASHION WORLD</span>
          </div>
        </div>

        <nav className="diwali-nav" aria-label="Diwali World Navigation">
          <Link to="/">
            <ArrowLeft size={14} /> Main Showroom
          </Link>
          <Link to="/lehenga-studio" style={{ color: '#ffd56b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} />
            <span>Lehenga Studio</span>
          </Link>
          <Link to="/indian-ethnic-wear">Indian Couture Palace</Link>
          <Link to="/my-wardrobe">My Wardrobe</Link>
          <Link to="/avatar-studio">Avatar Studio</Link>
          <Button to="/find-my-size" size="small" icon={ArrowUpRight}>
            Find My Size
          </Button>
        </nav>

        <MobileNav
          links={[
            { to: '/', label: 'Home & Showroom' },
            { to: '/lehenga-studio', label: 'Luxury Lehenga Studio' },
            { to: '/indian-ethnic-wear', label: 'Indian Couture' },
            { to: '/my-wardrobe', label: 'My Wardrobe' },
            { to: '/find-my-size', label: 'Find My Size' },
          ]}
        />
      </header>

      {/* Main Experience Layout */}
      <main className="diwali-main">
        {/* Top Festive Hero Marquee */}
        <section className="diwali-top-marquee">
          <div className="marquee-left">
            <span className="marquee-tag">
              <Sparkles size={13} /> AUSPICIOUS DIWALI COUTURE ATELIER
            </span>
            <h1>The Grand Festival of Light & Fashion</h1>
            <p>
              Step into the illuminated palace court featuring glowing traditional clay diyas, sacred Rangoli,
              fragrant marigold torans, and festive Indian couture in motion.
            </p>
          </div>

          <div className="marquee-actions">
            <button
              type="button"
              className={`diwali-runway-btn ${isRunwayMode ? 'is-active' : ''}`}
              onClick={toggleRunwayMode}
              aria-pressed={isRunwayMode}
            >
              <Play size={15} />
              <span>{isRunwayMode ? 'Exit Runway Promenade' : 'Start Festive Runway Walk'}</span>
            </button>
            <Link to="/" className="diwali-back-showroom-btn">
              <ArrowLeft size={14} /> Return to Showroom
            </Link>
          </div>
        </section>

        {/* 3-Column Experience Stage */}
        <div className="diwali-stage-grid">
          {/* Left Column: 9 Festive Garments Selector */}
          <aside className="diwali-garments-panel" aria-label="Diwali Collection Garments">
            <div className="garments-panel-header">
              <Eyebrow>DIWALI OCCASIONWEAR</Eyebrow>
              <h2>Festive Collection</h2>
              <div className="audience-pill-filter" role="group" aria-label="Filter by audience">
                <button
                  type="button"
                  className={audienceFilter === 'All' ? 'is-active' : ''}
                  onClick={() => setAudienceFilter('All')}
                >
                  All (9)
                </button>
                <button
                  type="button"
                  className={audienceFilter === 'Women' ? 'is-active' : ''}
                  onClick={() => setAudienceFilter('Women')}
                >
                  Women's
                </button>
                <button
                  type="button"
                  className={audienceFilter === 'Men' ? 'is-active' : ''}
                  onClick={() => setAudienceFilter('Men')}
                >
                  Men's
                </button>
              </div>
            </div>

            <div className="garments-scroll-list" role="radiogroup" aria-label="Select garment to inspect">
              {filteredGarments.map((garment, index) => {
                const isSelected = selectedGarment.id === garment.id
                return (
                  <button
                    key={garment.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`diwali-garment-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleGarmentSelect(garment)}
                  >
                    <div className="card-top-row">
                      <span className="card-index">0{index + 1}</span>
                      <span className="card-audience-badge">{garment.audience}</span>
                    </div>
                    <h3>{garment.label}</h3>
                    <p>{garment.detail}</p>
                    <div className="card-footer-row">
                      <small className="card-craft">{garment.craft}</small>
                      <span className="card-inspect-cta">Inspect in 3D ↗</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Center Column: 3D Canvas Viewport */}
          <div className="diwali-canvas-column">
            <div className="diwali-canvas-frame" aria-label="3D Diwali Palace Environment">
              <Suspense
                fallback={
                  <div className="diwali-scene-loader" role="status">
                    <Flame size={28} />
                    <span>ENTERING THE 3D DIWALI PALACE</span>
                    <small>Igniting festive clay diyas, rangoli mandalas & marigold torans…</small>
                  </div>
                }
              >
                <SceneManager
                  sceneId="diwaliWorld"
                  sceneProps={{
                    selectedGarmentId: selectedGarment.id,
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
                    onGarmentSelect: handleGarmentSelect,
                    onPoseSupport: setPoseSupported,
                  }}
                  className="diwali-3d-canvas"
                />
              </Suspense>

              {/* Viewport Floating Watermark */}
              <div className="diwali-viewport-watermark" aria-hidden="true">
                <span className="watermark-tag">
                  FITMATE FESTIVE UNIVERSE · {garmentAsset ? 'GLB PRODUCTION MODEL' : 'TEMPORARY DRESS FORM & PBR WEAVE'}
                </span>
                <strong className="watermark-title">{selectedGarment.label}</strong>
                {previewOnAvatar && !supportsAvatar && (
                  <span className="diwali-3d-pending-note">
                    Rigged Avatar &amp; Garment GLB Pending · Dress Form Active
                  </span>
                )}
              </div>

              {/* Active Craftsmanship Inspection Banner */}
              {activeInspectionPoint && !isRunwayMode && (
                <div className="diwali-inspection-banner" role="status">
                  <Eye size={15} />
                  <div>
                    <strong>{activeInspectionPoint.label}</strong>
                    <p>{activeInspectionPoint.note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInspectionSelect(null)}
                    aria-label="Close garment inspection detail"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Runway Banner Indicator */}
              {isRunwayMode && (
                <div className="diwali-runway-indicator" role="status">
                  <span className="diwali-flame-dot" />
                  <div>
                    <strong>CINEMATIC DIWALI RUNWAY PROMENADE</strong>
                    <p>
                      {supportsAvatar && poseSupported
                        ? 'Rigged 3D avatar walking along the glowing diya walkway.'
                        : 'Showcasing festive silhouette motion along the glowing diya runway.'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setIsRunwayMode(false)} aria-label="Exit runway view">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Toast Notification when Outfit Saved to Wardrobe */}
              {savedSuccessToast && (
                <div className="diwali-toast" role="status">
                  <Check size={16} />
                  <span>Outfit saved to My Wardrobe!</span>
                  <Link to="/my-wardrobe">View Wardrobe ↗</Link>
                </div>
              )}

              {/* Gesture Hint */}
              <div className="diwali-gesture-hint">
                <span>360° DRAG TO ROTATE</span>
                <i />
                <span>SCROLL TO ZOOM</span>
                <i />
                <span>CLICK PINS OR ALCOVES TO INSPECT</span>
              </div>
            </div>

            {/* Bottom 3D Inspection Control Toolbar */}
            <div className="diwali-toolbar" aria-label="3D Viewing and Camera Controls">
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
                  aria-pressed={zoomLevel === 'detail'}
                  className={zoomLevel === 'detail' ? 'is-active' : ''}
                  onClick={() => setZoomLevel('detail')}
                >
                  <Camera size={13} /> Weave Detail
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

              {/* Avatar / Dress Form Toggle */}
              <button
                type="button"
                className={`toolbar-avatar-toggle ${previewOnAvatar ? 'is-active' : ''}`}
                onClick={() => setPreviewOnAvatar((prev) => !prev)}
                aria-pressed={previewOnAvatar}
                title={
                  supportsAvatar
                    ? 'Toggle between standalone garment and rigged 3D avatar'
                    : 'Rigged avatar & garment GLBs pending licensing — previews notice on dress form'
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
                      : 'Avatar Mode (GLB Pending)'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Garment Specification, Colors & Wardrobe Action */}
          <aside className="diwali-spec-panel" aria-label="Outfit Details and Actions">
            <div className="spec-card">
              <div className="spec-card-header">
                <div>
                  <Eyebrow>{selectedGarment.category.toUpperCase()}</Eyebrow>
                  <h2>{selectedGarment.label}</h2>
                  <span className="spec-region-tag">{selectedGarment.region}</span>
                </div>
                <button
                  type="button"
                  className={`wardrobe-save-btn ${isOutfitSaved ? 'is-saved' : ''}`}
                  onClick={handleToggleSaveWardrobe}
                  aria-label={isOutfitSaved ? 'Remove from My Wardrobe' : 'Save outfit to My Wardrobe'}
                  title={isOutfitSaved ? 'Saved in My Wardrobe' : 'Save outfit to My Wardrobe'}
                >
                  <Heart size={18} fill={isOutfitSaved ? '#d4af37' : 'none'} />
                </button>
              </div>

              {/* Festive Significance */}
              <div className="spec-significance-box">
                <div className="box-header">
                  <Flame size={14} />
                  <span>DIWALI FESTIVE SIGNIFICANCE</span>
                </div>
                <p>{selectedGarment.festiveSignificance}</p>
              </div>

              {/* Craft & Weave Breakdown */}
              <div className="spec-craft-details">
                <div className="craft-pill">
                  <Scissors size={14} />
                  <span>TRADITION: {selectedGarment.craft.toUpperCase()}</span>
                </div>
                <div className="spec-motifs-block">
                  <strong>ICONIC MOTIFS:</strong>
                  <p>{selectedGarment.motifs}</p>
                </div>
                <small className="spec-drape-style">
                  <strong>Drape Style:</strong> {selectedGarment.drapeStyle}
                </small>
              </div>

              {/* Interactive Craftsmanship Inspection Points */}
              {selectedGarment.inspectionPoints?.length > 0 && (
                <div className="spec-inspection-block">
                  <div className="section-title">
                    <Eye size={14} />
                    <span>GARMENT INSPECTION POINTS</span>
                  </div>
                  <div className="inspection-chip-list">
                    {selectedGarment.inspectionPoints.map((pt) => {
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
                      : 'Select any craftsmanship hotspot above or on the 3D garment to zoom in and inspect details.'}
                  </p>
                </div>
              )}

              {/* Auspicious Diwali Color Dyes (Colour selection where supported) */}
              <div className="spec-color-block">
                <div className="section-title">
                  <Palette size={14} />
                  <span>FESTIVE HERITAGE COLOURS</span>
                </div>
                <div className="color-swatches" role="radiogroup" aria-label="Select Festive Dye">
                  {diwaliColorPalette.map((col) => {
                    const isSupportedByGarment =
                      selectedGarment.supportedColors?.includes(col.id) &&
                      (!garmentAsset || hasGlbColorSlots)
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
                            : `${col.label} — Not supported for ${selectedGarment.shortLabel || selectedGarment.label}`
                        }
                      >
                        {isSelected && <span className="dot-active-marker" />}
                      </button>
                    )
                  })}
                </div>
                <small className="active-color-name">
                  Selected Dye:{' '}
                  <strong>{selectedColorEntry?.label || 'Bespoke Festive'}</strong> · {colorControlNote}
                </small>
              </div>

              {/* 3D PBR Material Selector */}
              <div className="spec-material-block">
                <div className="section-title">
                  <Layers size={14} />
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

              {/* Fit & Drape Guidance */}
              <div className="spec-fit-box">
                <div className="fit-box-header">
                  <Ruler size={14} />
                  <strong>FITMATE FIT GUIDANCE</strong>
                </div>
                <p>{selectedGarment.fitGuidance}</p>
              </div>

              {/* Action Buttons */}
              <div className="spec-buttons">
                <Button to={findMySizeUrl} icon={ArrowUpRight} className="btn-find-size">
                  Find My Size in this Look
                </Button>
                <Button
                  to={`/virtual-fitting-room?audience=${encodeURIComponent(selectedGarment.audience)}&category=Traditional%20wear`}
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

              {/* Transparent Asset Integrity & Missing GLB Ledger */}
              <div className="spec-asset-status">
                <div className="asset-status-top">
                  <span className={`status-light ${garmentAsset && avatarAsset && worldAsset ? 'is-ready' : ''}`} />
                  <div>
                    <strong>TEMPORARY &amp; MISSING ASSETS LEDGER</strong>
                    <p>
                      Palace GLB ({worldAsset ? 'Ready' : 'Procedural Temp'}), Garment Slot{' '}
                      <code>{selectedGarment.assetId}</code> ({garmentAsset ? 'Ready' : 'Pending GLB'}), Rigged Avatar{' '}
                      <code>{avatarAssetId}</code> ({avatarAsset ? 'Ready' : 'Pending GLB'}).
                    </p>
                  </div>
                  <button
                    type="button"
                    className="asset-ledger-toggle"
                    onClick={() => setShowAssetLedger((prev) => !prev)}
                    aria-expanded={showAssetLedger}
                  >
                    {showAssetLedger ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                {showAssetLedger && (
                  <ul className="asset-ledger-list">
                    {diwaliAssetLedger.map((entry) => (
                      <li key={entry.slotId}>
                        <strong>{entry.slotId}</strong> — <span>{entry.status}</span>
                        <small>{entry.missingFile}</small>
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
