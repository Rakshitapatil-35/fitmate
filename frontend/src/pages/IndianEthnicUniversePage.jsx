import { Suspense, useCallback, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  Camera,
  Compass,
  Crown,
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
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { BrandWordmark, Button, Eyebrow } from '../components/DesignSystem.jsx'
import MobileNav from '../components/MobileNav.jsx'
import { fabricPresets, getFabricPreset } from '../three/fabricMaterialLibrary.js'
import { indianEthnicPortals, royalColorPalette, textileCrafts } from '../three/indianEthnicCatalog.js'
import { saveSelectedGarment, toggleSavedProduct } from '../measurementStorage.js'
import SceneManager from '../three/SceneManager.jsx'
import './IndianEthnicUniversePage.css'

const cameraViews = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' },
]

export default function IndianEthnicUniversePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPortalId = searchParams.get('portal') || 'saree-world'

  const [activePortalId, setActivePortalId] = useState(initialPortalId)
  const [selectedGarmentId, setSelectedGarmentId] = useState('')
  const [customFabricId, setCustomFabricId] = useState(null)
  const [selectedColorHex, setSelectedColorHex] = useState(royalColorPalette[0].hex)
  const [cameraView, setCameraView] = useState('front')
  const [zoomLevel, setZoomLevel] = useState('full')
  const [isRunwayMode, setIsRunwayMode] = useState(false)
  const [previewOnAvatar, setPreviewOnAvatar] = useState(false)
  const [activeTextileModal, setActiveTextileModal] = useState(null)
  const [activeAudienceFilter, setActiveAudienceFilter] = useState('All')
  const [savedToWardrobe, setSavedToWardrobe] = useState(false)

  // Current Active Portal
  const activePortal = useMemo(() => {
    return indianEthnicPortals.find((p) => p.id === activePortalId) ?? indianEthnicPortals[0]
  }, [activePortalId])

  // Filtered Garments in Current Portal
  const portalGarments = useMemo(() => {
    if (!activePortal) return []
    if (activeAudienceFilter === 'All') return activePortal.garments
    return activePortal.garments.filter(
      () => activePortal.audience === activeAudienceFilter || activeAudienceFilter === 'All'
    )
  }, [activePortal, activeAudienceFilter])

  // Current Active Garment
  const currentGarment = useMemo(() => {
    if (!portalGarments.length) return null
    return portalGarments.find((g) => g.id === selectedGarmentId) ?? portalGarments[0]
  }, [portalGarments, selectedGarmentId])

  const selectedFabricId = customFabricId ?? (currentGarment?.fabricId || 'banarasi-silk')

  // Sync portal param in URL
  const handlePortalChange = useCallback(
    (portalId) => {
      setActivePortalId(portalId)
      setSelectedGarmentId('')
      setCustomFabricId(null)
      setIsRunwayMode(false)
      setSearchParams({ portal: portalId }, { replace: true })
    },
    [setSearchParams]
  )

  const handleGarmentSelect = useCallback((garmentId) => {
    setSelectedGarmentId(garmentId)
    setCustomFabricId(null)
    setIsRunwayMode(false)
    const match = portalGarments.find((g) => g.id === garmentId)
    if (match) {
      saveSelectedGarment({
        id: match.id,
        audience: activePortal.audience === 'Men' ? 'Men' : 'Women',
        collection: 'Indian Ethnic',
        category: 'Indian Ethnic',
        clothingType: match.category || 'Traditional wear',
        brandId: 'fitmate-indian-couture',
        brand: 'FITMATE Indian Couture',
        productName: match.name || match.label,
        name: match.name || match.label,
        occasion: 'Festive / Wedding',
        garmentAssetId: match.assetId,
        color: match.defaultColor || '#d4af37',
        fabric: match.fabricId || 'banarasi-silk',
      })
    }
  }, [portalGarments, activePortal])

  const resetCamera = useCallback(() => {
    setCameraView('front')
    setZoomLevel('full')
    setIsRunwayMode(false)
  }, [])

  const toggleRunwayPresentation = useCallback(() => {
    setIsRunwayMode((prev) => !prev)
    setCameraView('front')
  }, [])

  // Find My Size Link Builder
  const findMySizeUrl = useMemo(() => {
    if (!currentGarment) return '/find-my-size'
    const audience = activePortal.audience === 'Men' ? 'Men' : 'Women'
    const category = 'Traditional wear'
    const clothingType = currentGarment.category || 'Sarees'
    return `/find-my-size?audience=${encodeURIComponent(audience)}&category=${encodeURIComponent(category)}&clothingType=${encodeURIComponent(clothingType)}`
  }, [currentGarment, activePortal])

  // Save to wardrobe
  const handleSaveToWardrobe = () => {
    if (!currentGarment) return
    const audience = activePortal.audience === 'Men' ? 'Men' : 'Women'
    toggleSavedProduct({
      id: currentGarment.id,
      audience,
      category: 'Indian Ethnic',
      clothingType: currentGarment.category || 'Traditional wear',
      brandId: 'fitmate-indian-couture',
      brand: 'FITMATE Indian Couture',
      productName: currentGarment.name || currentGarment.label,
      name: currentGarment.name || currentGarment.label,
      occasion: 'Festive / Wedding',
      garmentAssetId: currentGarment.assetId,
      image: '',
      color: currentGarment.defaultColor || '#d4af37',
      fabric: selectedFabricId,
    })
    setSavedToWardrobe(true)
    setTimeout(() => setSavedToWardrobe(false), 3000)
  }

  const selectedFabricPreset = getFabricPreset(selectedFabricId)

  return (
    <div className="indian-universe-page">
      {/* Royal Palace Header Navigation */}
      <header className="palace-header">
        <div className="palace-header-left">
          <BrandWordmark to="/" />
          <div className="palace-crest">
            <Crown size={15} />
            <span>INDIAN ETHNIC UNIVERSE</span>
          </div>
        </div>

        <nav className="palace-nav" aria-label="Palace navigation">
          <Link to="/">Home</Link>
          <Link
            to="/lehenga-studio"
            className="palace-special-nav-link"
            style={{ color: '#f3d790', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Sparkles size={13} />
            <span>Lehenga Studio</span>
          </Link>
          <Link to="/diwali-world">Diwali Edit</Link>
          <Link to="/collections">All Collections</Link>
          <button
            type="button"
            className="palace-textile-nav-btn"
            onClick={() => setActiveTextileModal('all')}
            aria-haspopup="dialog"
          >
            <Sparkles size={14} />
            <span>Textile Crafts</span>
          </button>
          <Link to="/avatar-studio">Avatar Studio</Link>
          <Link to="/my-wardrobe">My Wardrobe</Link>
          <Button to="/find-my-size" size="small" icon={ArrowUpRight}>
            Find My Size
          </Button>
        </nav>

        <MobileNav
          links={[
            { to: '/', label: 'Home' },
            { to: '/lehenga-studio', label: 'Luxury Lehenga Studio' },
            { to: '/diwali-world', label: 'Diwali Fashion World' },
            { to: '/collections', label: 'Collections' },
            { to: '/avatar-studio', label: 'Avatar Studio' },
            { to: '/my-wardrobe', label: 'My Wardrobe' },
            { to: '/find-my-size', label: 'Find My Size' },
          ]}
        />
      </header>

      {/* Main Experience Layout */}
      <main className="palace-main">
        {/* Top Portal Navigation Pills */}
        <section className="portal-navigation-bar" aria-label="Palace Collection Portals">
          <div className="portal-pills-container">
            <span className="portal-pills-label">
              <Compass size={14} /> 6 SACRED WORLDS:
            </span>
            <div className="portal-pills-scroll" role="tablist">
              {indianEthnicPortals.map((portal) => {
                const isActive = portal.id === activePortalId
                return (
                  <button
                    key={portal.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`portal-pill-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => handlePortalChange(portal.id)}
                  >
                    <span className="portal-pill-bullet" />
                    <strong>{portal.label}</strong>
                    <small>{portal.location}</small>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="portal-filter-actions">
            <Link
              to="/lehenga-studio"
              className="runway-toggle-btn"
              title="Visit the FITMATE Luxury 3D Lehenga Studio"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} />
              <span>3D Lehenga Studio</span>
            </Link>
            <button
              type="button"
              className={`runway-toggle-btn ${isRunwayMode ? 'is-active' : ''}`}
              onClick={toggleRunwayPresentation}
              aria-pressed={isRunwayMode}
              title="Launch Cinematic Grand Runway Camera Walk"
            >
              <Play size={14} />
              <span>{isRunwayMode ? 'Exit Runway Walk' : 'Cinematic Runway Presentation'}</span>
            </button>
          </div>
        </section>

        {/* 3D Viewport + Interactive Couture Controls */}
        <div className="palace-universe-stage">
          {/* Left Column: Collection Categories Drawer */}
          <aside className="palace-collections-sidebar" aria-label="Collection Garment Selection">
            <div className="sidebar-header">
              <Eyebrow>{activePortal.location.toUpperCase()}</Eyebrow>
              <h2>{activePortal.label}</h2>
              <p>{activePortal.description}</p>
            </div>

            {/* Audience Tab Switcher if mixed */}
            <div className="sidebar-audience-switch" role="group" aria-label="Audience Filter">
              <button
                type="button"
                className={activeAudienceFilter === 'All' ? 'is-active' : ''}
                onClick={() => setActiveAudienceFilter('All')}
              >
                All Garments
              </button>
              <button
                type="button"
                className={activeAudienceFilter === 'Women' ? 'is-active' : ''}
                onClick={() => setActiveAudienceFilter('Women')}
              >
                Women's
              </button>
              <button
                type="button"
                className={activeAudienceFilter === 'Men' ? 'is-active' : ''}
                onClick={() => setActiveAudienceFilter('Men')}
              >
                Men's
              </button>
            </div>

            {/* Garments List within this Portal */}
            <div className="garments-selector-list" role="radiogroup" aria-label="Garments in this collection">
              {portalGarments.map((garment, idx) => {
                const isSelected = currentGarment?.id === garment.id
                return (
                  <button
                    key={garment.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`garment-card-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleGarmentSelect(garment.id)}
                  >
                    <div className="garment-card-top">
                      <span className="garment-card-num">0{idx + 1}</span>
                      <span className="garment-card-craft-tag">{garment.craft}</span>
                    </div>
                    <h3>{garment.label}</h3>
                    <p>{garment.detail}</p>
                    <div className="garment-card-footer">
                      <small>{garment.region}</small>
                      <span className="garment-card-inspect">Inspect 3D ↗</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Center Column: 3D Canvas Viewport */}
          <div className="palace-canvas-column">
            <div className="palace-viewport-frame" aria-label="3D Indian Luxury Fashion Palace Environment">
              <Suspense
                fallback={
                  <div className="palace-canvas-loading" role="status">
                    <Crown size={28} />
                    <span>ENTERING THE FITMATE COUTURE PALACE</span>
                    <small>Lighting traditional carved arches, marble runway & silk vitrines…</small>
                  </div>
                }
              >
                <SceneManager
                  sceneId="indianFashionWorld"
                  sceneProps={{
                    activePortalId,
                    selectedGarment: currentGarment,
                    fabricId: selectedFabricId,
                    customColor: selectedColorHex,
                    previewOnAvatar,
                    cameraView,
                    isRunwayMode,
                    onPortalSelect: handlePortalChange,
                    onGarmentSelect: handleGarmentSelect,
                  }}
                  className="palace-3d-scene"
                />
              </Suspense>

              {/* Viewport Floating Watermark */}
              <div className="palace-viewport-watermark" aria-hidden="true">
                <span>FITMATE INDIAN HAUTE COUTURE</span>
                <strong>{activePortal.label}</strong>
              </div>

              {/* Runway Mode Banner Indicator */}
              {isRunwayMode && (
                <div className="runway-mode-banner" role="status">
                  <span className="runway-pulse" />
                  <strong>CINEMATIC RUNWAY SHOWCASE IN PROGRESS</strong>
                  <p>Glide down the grand Makrana marble runway and admire festive silhouettes.</p>
                  <button type="button" onClick={() => setIsRunwayMode(false)}>
                    Exit Showcase <X size={12} />
                  </button>
                </div>
              )}

              {/* Drag & Rotation Guide Tip */}
              <div className="palace-viewport-gesture-hint">
                <span>360° DRAG TO ORBIT</span>
                <i />
                <span>SCROLL TO ZOOM</span>
              </div>
            </div>

            {/* Bottom 3D Inspection Control Toolbar */}
            <div className="palace-inspection-toolbar" aria-label="3D Inspection Tools">
              <div className="camera-view-buttons" role="group" aria-label="Viewing Angles">
                <span className="toolbar-label">Angle:</span>
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

              <div className="camera-zoom-buttons" role="group" aria-label="Camera Framing">
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
                  <Camera size={13} /> Detail
                </button>
                <button
                  type="button"
                  className="toolbar-reset-btn"
                  onClick={resetCamera}
                  aria-label="Reset viewing angle"
                  title="Reset Camera"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Avatar Toggle */}
              <button
                type="button"
                className={`avatar-preview-btn ${previewOnAvatar ? 'is-active' : ''}`}
                onClick={() => setPreviewOnAvatar((prev) => !prev)}
                aria-pressed={previewOnAvatar}
              >
                <UserCheck size={14} />
                <span>{previewOnAvatar ? 'Mannequin Mode' : 'Avatar Rig Preview'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Garment Specification & Textile Studio */}
          <aside className="palace-details-panel" aria-label="Garment & Textile Specifications">
            {currentGarment ? (
              <div className="garment-spec-card">
                <div className="spec-card-top">
                  <div className="spec-card-titles">
                    <Eyebrow>{currentGarment.category.toUpperCase()}</Eyebrow>
                    <h2>{currentGarment.label}</h2>
                    <span className="spec-origin-badge">{currentGarment.region}</span>
                  </div>
                  <button
                    type="button"
                    className={`spec-wardrobe-btn ${savedToWardrobe ? 'is-saved' : ''}`}
                    onClick={handleSaveToWardrobe}
                    aria-label="Save to my wardrobe"
                    title="Save to Wardrobe"
                  >
                    <Heart size={16} fill={savedToWardrobe ? '#d4af37' : 'none'} />
                  </button>
                </div>

                {/* Weave & Motif Technical Information */}
                <div className="spec-craft-section">
                  <div className="spec-craft-pill">
                    <Scissors size={14} />
                    <span>CRAFT: {currentGarment.craft.toUpperCase()}</span>
                  </div>
                  <p className="spec-weave-detail">{currentGarment.weaveDetail}</p>
                  <div className="spec-motifs-box">
                    <strong>TRADITIONAL MOTIFS:</strong>
                    <p>{currentGarment.motifs}</p>
                  </div>
                </div>

                {/* Royal Heritage Color Palette Selection */}
                <div className="spec-color-selection">
                  <div className="section-title-row">
                    <Palette size={14} />
                    <span>ROYAL HERITAGE DYES</span>
                  </div>
                  <div className="color-swatches-grid" role="radiogroup" aria-label="Select Royal Color">
                    {royalColorPalette.map((color) => {
                      const isSelected = selectedColorHex === color.hex
                      return (
                        <button
                          key={color.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={`color-swatch-item ${isSelected ? 'is-selected' : ''}`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => setSelectedColorHex(color.hex)}
                          title={`${color.label} — ${color.note}`}
                        >
                          {isSelected && <span className="swatch-check" />}
                        </button>
                      )
                    })}
                  </div>
                  <small className="color-swatch-label">
                    Active Dye:{' '}
                    <strong>
                      {royalColorPalette.find((c) => c.hex === selectedColorHex)?.label || 'Bespoke Royal'}
                    </strong>
                  </small>
                </div>

                {/* PBR Fabric Material Presets */}
                <div className="spec-fabric-study-section">
                  <div className="section-title-row">
                    <Layers size={14} />
                    <span>3D PBR TEXTILE STUDY</span>
                  </div>
                  <select
                    className="spec-fabric-select"
                    value={selectedFabricId}
                    onChange={(e) => setCustomFabricId(e.target.value)}
                    aria-label="Select Fabric Study Material"
                  >
                    {fabricPresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label} ({preset.weave})
                      </option>
                    ))}
                  </select>
                  <p className="fabric-study-note">{selectedFabricPreset.note}</p>
                </div>

                {/* Drape & Fit Guidance */}
                <div className="spec-fit-guidance-box">
                  <div className="fit-guidance-header">
                    <Ruler size={14} />
                    <strong>FITMATE DRAPE & FIT ADVICE</strong>
                  </div>
                  <p>{currentGarment.fitGuidance}</p>
                  <small>Drape Style: {currentGarment.drapeStyle}</small>
                </div>

                {/* Action Buttons */}
                <div className="spec-action-buttons">
                  <Button to={findMySizeUrl} icon={ArrowUpRight} className="spec-find-size-btn">
                    Find My Size in this Silhouette
                  </Button>
                  <Button
                    to={`/virtual-fitting-room?audience=${encodeURIComponent(activePortal.audience === 'Men' ? 'Men' : 'Women')}&category=Traditional%20wear`}
                    variant="secondary"
                    icon={Scissors}
                    className="spec-find-size-btn"
                  >
                    Try on in 3D Fitting Room
                  </Button>
                  <button
                    type="button"
                    className="spec-textile-explore-btn"
                    onClick={() => setActiveTextileModal(currentGarment.craft)}
                  >
                    <BookOpen size={14} /> Read Textile Craft Story
                  </button>
                </div>

                {/* Asset Integrity Ledger */}
                <div className="spec-asset-ledger">
                  <span className="ledger-dot" />
                  <div>
                    <strong>ASSET INTEGRITY STATUS:</strong>
                    <p>
                      Slot registered ({currentGarment.assetId}). 3D PBR Material Study active on Haute-Couture
                      Mannequin. Verified GLB model in sourcing queue.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        {/* Indian Textile Crafts Experience Modal */}
        {activeTextileModal && (
          <div
            className="textile-craft-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="textile-modal-title"
          >
            <div className="textile-craft-modal">
              <div className="modal-header">
                <div>
                  <Eyebrow>INDIAN TEXTILE HERITAGE & CRAFTSMANSHIP</Eyebrow>
                  <h2 id="textile-modal-title">The Sacred Arts of the Subcontinent</h2>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setActiveTextileModal(null)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body-scroll">
                <div className="textile-cards-grid">
                  {textileCrafts.map((craft) => (
                    <article key={craft.id} className="textile-craft-card">
                      <div className="textile-card-top">
                        <span className="craft-badge">{craft.origin}</span>
                        <small>{craft.era}</small>
                      </div>
                      <h3>{craft.label}</h3>
                      <p className="craft-subtitle">{craft.subtitle}</p>
                      <p className="craft-desc">{craft.description}</p>
                      <div className="craft-technique-box">
                        <strong>ARTISANAL TECHNIQUE:</strong>
                        <p>{craft.technique}</p>
                      </div>
                      <div className="craft-focus-box">
                        <Eye size={14} />
                        <span>3D Inspection Tip: {craft.inspectionFocus}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <p>FITMATE celebrates authentic Indian weavers, dyers, and embroidery artisans.</p>
                <Button size="small" onClick={() => setActiveTextileModal(null)}>
                  Return to 3D Couture Palace
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
