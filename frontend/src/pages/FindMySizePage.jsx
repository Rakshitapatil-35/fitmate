import { Suspense, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  ExternalLink,
  Heart,
  Maximize2,
  Play,
  RotateCcw,
  Ruler,
  Scale,
  Search,
  ShieldCheck,
  Shirt,
  Sparkles,
  X,
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BrandWordmark, Button } from '../components/DesignSystem.jsx'
import MobileNav from '../components/MobileNav.jsx'
import {
  BRAND_DATABASE,
  BRAND_SECTORS,
  CLOTHING_CATEGORIES,
  filterBrands,
  getBrandById,
} from '../data/brandSizeDatabase.js'
import {
  centimetersToInches,
  loadFitPreference,
  loadMeasurements,
  loadSelectedGarment,
  recordRecentCheck,
  saveActiveRecommendation,
  saveFitPreference,
  toggleSavedProduct,
} from '../measurementStorage.js'
import {
  compareBrandsForCategory,
  matchBrandSize,
} from '../services/brandSizeMatchingEngine.js'
import { fittingGarments } from '../three/fittingRoomCatalog.js'
import SceneManager from '../three/SceneManager.jsx'
import './FindMySizePage.css'

const audiences = ['Women', 'Men', 'Unisex']

const fitPreferences = [
  { id: 'Slim', label: 'Slim Fit', easeNote: 'Closer to body contours (-2 cm target ease)' },
  { id: 'Regular', label: 'Regular Fit', easeNote: 'Classic balanced drape (standard ease)' },
  { id: 'Relaxed', label: 'Relaxed Fit', easeNote: 'Generous cut for airflow (+3.5 cm ease)' },
  { id: 'Oversized', label: 'Oversized Fit', easeNote: 'Voluminous street cut (+7.5 cm ease)' },
]

const cameraViews = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' },
]

// Fallback baseline measurements if none recorded
const fallbackMeasurements = {
  chest: 92,
  waist: 76,
  hip: 98,
  shoulder: 41,
  inseam: 78,
  heightCm: 170,
}

export default function FindMySizePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sharedGarment = loadSelectedGarment()

  // Mode: 'single' (Find My Size for 1 brand) vs 'compare' (Compare My Sizes across brands)
  const initialMode = searchParams.get('mode') === 'compare' ? 'compare' : 'single'
  const [activeMode, setActiveMode] = useState(initialMode)

  // Audience & Category
  const requestedAudience = audiences.includes(searchParams.get('audience'))
    ? searchParams.get('audience')
    : sharedGarment?.audience === 'Men'
      ? 'Men'
      : 'Women'
  const [audience, setAudience] = useState(requestedAudience)

  const [category, setCategory] = useState(() => {
    const requested = searchParams.get('category')
    const match = CLOTHING_CATEGORIES.find((c) => c.id === requested)
    if (match) return match.id
    if (sharedGarment?.category && CLOTHING_CATEGORIES.some((c) => c.id === sharedGarment.category)) {
      return sharedGarment.category
    }
    return 'Tops'
  })

  // Brand Search & Filtering
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSector, setSelectedSector] = useState('all')
  const [brandId, setBrandId] = useState(() => {
    const reqBrand = searchParams.get('brandId')
    if (reqBrand && getBrandById(reqBrand)) return reqBrand
    return 'zara'
  })

  // Selected Brand Object
  const selectedBrand = useMemo(() => {
    return getBrandById(brandId) || BRAND_DATABASE[0]
  }, [brandId])

  // Filtered Brands List
  const filteredBrands = useMemo(() => {
    return filterBrands({
      query: searchQuery,
      sector: selectedSector,
      audience,
    })
  }, [searchQuery, selectedSector, audience])

  // Fit Preference & Unit Toggle
  const [fitPreference, setFitPreference] = useState(() => loadFitPreference() || 'Regular')
  const [unit, setUnit] = useState('cm') // 'cm' | 'in'
  const [wardrobeSaved, setWardrobeSaved] = useState(false)
  const [inspectedBrandForModal, setInspectedBrandForModal] = useState(null)

  // User Measurements
  const [savedMeasurements] = useState(() => {
    const loaded = loadMeasurements()
    return loaded && Object.keys(loaded).length > 0 ? loaded : fallbackMeasurements
  })
  const hasLocalProfile = useMemo(() => {
    const loaded = loadMeasurements()
    return Boolean(loaded && Object.keys(loaded).length > 0)
  }, [])

  // 3D Viewport Controls
  const [cameraView, setCameraView] = useState('front')
  const [zoomLevel, setZoomLevel] = useState('full')
  const [avatarRotationDeg, setAvatarRotationDeg] = useState(0)
  const [autoRotate360, setAutoRotate360] = useState(false)
  const [fitMapMode, setFitMapMode] = useState(false)

  // Map to 3D Silhouette
  const active3DGarment = useMemo(() => {
    const aud = audience === 'Men' ? 'Men' : 'Women'
    const match = fittingGarments.find(
      (g) =>
        g.audience === aud &&
        (g.category.toLowerCase() === category.toLowerCase() ||
          g.type.toLowerCase().includes(category.toLowerCase()))
    )
    return match || fittingGarments[0]
  }, [audience, category])

  // Execute Size Matching Engine for Single Brand
  const matchingResult = useMemo(() => {
    return matchBrandSize({
      brand: selectedBrand,
      audience,
      category,
      measurements: savedMeasurements,
      fitPreference,
      unit,
    })
  }, [selectedBrand, audience, category, savedMeasurements, fitPreference, unit])

  // Execute Multi-Brand Comparison Matrix for Category
  const comparisonResults = useMemo(() => {
    if (activeMode !== 'compare') return []
    // Select top 8 brands in sector or across directory
    const candidates = filteredBrands.slice(0, 10)
    return compareBrandsForCategory({
      brands: candidates,
      category,
      audience,
      measurements: savedMeasurements,
      fitPreference,
    })
  }, [activeMode, filteredBrands, category, audience, savedMeasurements, fitPreference])

  // Handlers
  const handleAudienceChange = (nextAud) => {
    setAudience(nextAud)
  }

  const handleCategoryChange = (nextCat) => {
    setCategory(nextCat)
  }

  const handleFitPreferenceChange = (nextPref) => {
    setFitPreference(nextPref)
    saveFitPreference(nextPref)
  }

  const handleSelectBrand = (brand) => {
    setBrandId(brand.id)
    if (matchingResult?.success && matchingResult.recommendedSize) {
      recordRecentCheck({
        brandId: brand.id,
        brand: brand.name,
        product: `${brand.name} ${category}`,
        category: `${audience} · ${category}`,
        size: matchingResult.recommendedSize,
      })
    }
  }

  const handleProceedToFittingSuite = () => {
    if (matchingResult?.success) {
      saveActiveRecommendation({
        brandId: selectedBrand.id,
        brand: selectedBrand.name,
        product: `${selectedBrand.name} ${category}`,
        audience,
        category,
        clothingType: category,
        recommendedSize: matchingResult.recommendedSize,
        fitPreference,
        confidence: matchingResult.matchConfidence,
      })
      recordRecentCheck({
        brandId: selectedBrand.id,
        brand: selectedBrand.name,
        product: `${selectedBrand.name} ${category}`,
        category: `${audience} · ${category}`,
        size: matchingResult.recommendedSize,
      })
    }
    navigate(
      `/virtual-fitting-room?audience=${encodeURIComponent(audience)}&category=${encodeURIComponent(category)}&garmentId=${encodeURIComponent(active3DGarment.id)}&size=${encodeURIComponent(matchingResult?.recommendedSize || 'M')}`
    )
  }

  const handleSaveToWardrobe = () => {
    if (matchingResult?.success) {
      saveActiveRecommendation({
        brandId: selectedBrand.id,
        brand: selectedBrand.name,
        product: `${selectedBrand.name} ${category}`,
        audience,
        category,
        clothingType: category,
        recommendedSize: matchingResult.recommendedSize,
        fitPreference,
        confidence: matchingResult.matchConfidence,
      })
    }
    toggleSavedProduct({
      id: `brand-rec-${selectedBrand.id}-${category}`,
      audience,
      collection: category.includes('Ethnic') || category.includes('Lehengas') ? 'Indian Ethnic' : audience === 'Men' ? 'Men’s' : 'Western',
      category,
      clothingType: category,
      brandId: selectedBrand.id,
      brand: selectedBrand.name,
      productName: `${selectedBrand.name} ${category}`,
      name: `${selectedBrand.name} ${category}`,
      occasion: 'Recommended Brand Match',
      garmentAssetId: active3DGarment.assetId,
      size: matchingResult?.recommendedSize || 'M',
      color: active3DGarment.defaultColor || '#d4af37',
      fabric: active3DGarment.defaultFabricId || 'cotton',
    })
    setWardrobeSaved(true)
    setTimeout(() => setWardrobeSaved(false), 3500)
  }

  return (
    <div className="size-rec-room-page universal-size-page">
      {/* 1. Global Luxury Header */}
      <header className="size-rec-header">
        <div className="size-rec-header-left">
          <BrandWordmark to="/" />
          <div className="size-rec-header-badge">
            <Sparkles size={13} />
            <span>UNIVERSAL BRAND SIZE MATCHING SYSTEM</span>
          </div>
        </div>

        <nav className="size-rec-nav" aria-label="Recommendation studio navigation">
          <Link to="/">Main Showroom</Link>
          <Link to="/measurements">3D Measurement Studio</Link>
          <Link to="/virtual-fitting-room">3D Fitting Room</Link>
          <Link to="/brand-comparison">Brand Matrix</Link>
          <Link to="/my-wardrobe">My Wardrobe</Link>
        </nav>

        <MobileNav
          links={[
            { to: '/', label: 'Main Showroom' },
            { to: '/measurements', label: 'Measurement Studio' },
            { to: '/virtual-fitting-room', label: '3D Fitting Room' },
            { to: '/brand-comparison', label: 'Brand Matrix' },
            { to: '/my-wardrobe', label: 'My Wardrobe' },
          ]}
        />
      </header>

      <main className="size-rec-main">
        {/* 2. Top Marquee & Mode Switcher */}
        <section className="size-rec-marquee">
          <div className="marquee-left">
            <span className="marquee-tag">ONE BODY · EVERY BRAND · YOUR PERFECT FIT</span>
            <h1>Universal Brand Size Matching</h1>
            <p>
              Match your verified body measurements against brand-specific sizing charts across international maisons, Indian ready-to-wear, and performance activewear.
            </p>
          </div>

          <div className="marquee-mode-controls">
            <div className="mode-toggle-group" role="tablist" aria-label="Size matching mode">
              <button
                type="button"
                className={`mode-btn ${activeMode === 'single' ? 'is-active' : ''}`}
                role="tab"
                aria-selected={activeMode === 'single'}
                onClick={() => setActiveMode('single')}
              >
                <Shirt size={13} />
                <span>Find My Size</span>
              </button>
              <button
                type="button"
                className={`mode-btn ${activeMode === 'compare' ? 'is-active' : ''}`}
                role="tab"
                aria-selected={activeMode === 'compare'}
                onClick={() => setActiveMode('compare')}
              >
                <Scale size={13} />
                <span>Compare My Sizes</span>
              </button>
            </div>

            {/* Unit Toggle cm/in */}
            <div className="unit-toggle-pill" role="radiogroup" aria-label="Measurement units">
              <button
                type="button"
                className={`unit-btn ${unit === 'cm' ? 'is-active' : ''}`}
                onClick={() => setUnit('cm')}
                aria-checked={unit === 'cm'}
              >
                CM
              </button>
              <button
                type="button"
                className={`unit-btn ${unit === 'in' ? 'is-active' : ''}`}
                onClick={() => setUnit('in')}
                aria-checked={unit === 'in'}
              >
                IN
              </button>
            </div>
          </div>
        </section>

        {/* 3. Measurement Passport Quick Bar */}
        <section className="passport-status-strip">
          <div className="passport-strip-info">
            <Ruler size={15} className="gold-icon" />
            <span className="passport-strip-label">
              Active Passport ({hasLocalProfile ? 'Verified 3D Tape' : 'Sample Biometrics'}):
            </span>
            <div className="passport-metric-pills">
              <span>Chest: <strong>{unit === 'in' ? `${centimetersToInches(savedMeasurements.chest ?? 92).toFixed(1)} in` : `${savedMeasurements.chest ?? 92} cm`}</strong></span>
              <span>Waist: <strong>{unit === 'in' ? `${centimetersToInches(savedMeasurements.waist ?? 76).toFixed(1)} in` : `${savedMeasurements.waist ?? 76} cm`}</strong></span>
              <span>Hips: <strong>{unit === 'in' ? `${centimetersToInches(savedMeasurements.hip ?? 98).toFixed(1)} in` : `${savedMeasurements.hip ?? 98} cm`}</strong></span>
              {savedMeasurements.shoulder && (
                <span>Shoulder: <strong>{unit === 'in' ? `${centimetersToInches(savedMeasurements.shoulder).toFixed(1)} in` : `${savedMeasurements.shoulder} cm`}</strong></span>
              )}
            </div>
          </div>
          <Link to="/measurements" className="passport-edit-link">
            <span>Edit in Measurement Studio</span>
            <ArrowUpRight size={13} />
          </Link>
        </section>

        {/* 4. Category & Audience Filter Ribbon */}
        <section className="filter-ribbon-card">
          {/* Audience Row */}
          <div className="ribbon-audience-row">
            <span className="ribbon-label">DEPARTMENT:</span>
            <div className="audience-pills">
              {audiences.map((aud) => (
                <button
                  key={aud}
                  type="button"
                  className={`aud-pill ${audience === aud ? 'is-active' : ''}`}
                  onClick={() => handleAudienceChange(aud)}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          {/* Garment Category Row */}
          <div className="ribbon-categories-row">
            <span className="ribbon-label">GARMENT CATEGORY:</span>
            <div className="category-scroll-container">
              {CLOTHING_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`cat-pill ${category === cat.id ? 'is-active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            MODE 1: SINGLE BRAND MATCHING STUDIO
            =================================================================== */}
        {activeMode === 'single' && (
          <div className="size-rec-stage-grid">
            {/* Left Column: 3D Live Try-On Avatar Viewport */}
            <div className="rec-viewport-column">
              <div className="rec-canvas-frame" aria-label="3D Recommendation Avatar Viewport">
                <Suspense
                  fallback={
                    <div className="rec-scene-loader" role="status">
                      <Sparkles size={28} />
                      <span>PREPARING 3D RECOMMENDATION AVATAR</span>
                      <small>Draping in size {matchingResult?.recommendedSize || 'M'}…</small>
                    </div>
                  }
                >
                  <SceneManager
                    sceneId="virtualFittingRoom"
                    sceneProps={{
                      gender: audience === 'Men' ? 'male' : 'female',
                      heightCm: savedMeasurements.heightCm ?? 170,
                      silhouette: active3DGarment.silhouette,
                      fabricId: active3DGarment.defaultFabricId,
                      customColor: active3DGarment.defaultColor,
                      size: matchingResult?.recommendedSize || 'M',
                      fitMapMode,
                      cameraView,
                      zoomLevel,
                      avatarRotationDeg,
                      autoRotate360,
                    }}
                    className="rec-3d-canvas"
                  />
                </Suspense>

                <div className="rec-viewport-watermark" aria-hidden="true">
                  <span className="watermark-tag">LIVE AVATAR DRAPE</span>
                  <strong className="watermark-title">
                    {selectedBrand.name} · {category} (Size {matchingResult?.recommendedSize || 'M'})
                  </strong>
                </div>

                {fitMapMode && (
                  <div className="rec-tension-pill" aria-hidden="true">
                    <span className="tension-dot" />
                    <span>BIOMETRIC EASE TENSION ACTIVE</span>
                  </div>
                )}
              </div>

              {/* Viewport Turntable & Camera Controls */}
              <div className="viewport-controls">
                <div className="control-group">
                  <span className="control-label">VIEW</span>
                  {cameraViews.map((view) => (
                    <button
                      key={view.id}
                      type="button"
                      className={`view-btn ${cameraView === view.id ? 'is-active' : ''}`}
                      onClick={() => {
                        setCameraView(view.id)
                        setZoomLevel('full')
                      }}
                    >
                      <RotateCcw size={12} />
                      <span>{view.label}</span>
                    </button>
                  ))}
                </div>

                <div className="control-group">
                  <button
                    type="button"
                    className={`zoom-btn ${zoomLevel === 'detail' ? 'is-active' : ''}`}
                    onClick={() => setZoomLevel((prev) => (prev === 'full' ? 'detail' : 'full'))}
                  >
                    <Maximize2 size={13} />
                    <span>{zoomLevel === 'detail' ? 'Close-up' : 'Full'}</span>
                  </button>
                </div>

                <div className="control-group">
                  <button
                    type="button"
                    className={`turntable-spin-btn ${autoRotate360 ? 'is-active' : ''}`}
                    onClick={() => setAutoRotate360((prev) => !prev)}
                  >
                    <Play size={12} />
                    <span>{autoRotate360 ? 'Pause' : 'Rotate 360°'}</span>
                  </button>
                </div>

                <div className="control-group">
                  <button
                    type="button"
                    className={`fit-map-toggle-btn ${fitMapMode ? 'is-active' : ''}`}
                    onClick={() => setFitMapMode((prev) => !prev)}
                  >
                    <Eye size={12} />
                    <span>{fitMapMode ? 'Hide Tension' : 'Show Tension'}</span>
                  </button>
                </div>
              </div>

              {/* Turntable Slider */}
              <div className="turntable-slider-bar">
                <span className="slider-label">360° TURNTABLE:</span>
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
                  aria-label="Rotate 3D avatar 0 to 360 degrees"
                />
                <span className="slider-deg-display">{Math.round(avatarRotationDeg)}°</span>
              </div>
            </div>

            {/* Right Column: Searchable Brand Selector & Sizing Output */}
            <aside className="rec-controls-column">
              <div className="rec-glass-panel">
                {/* Step 1: Search & Choose Fashion Brand */}
                <div className="rec-step-section">
                  <div className="step-header">
                    <span className="step-number">01</span>
                    <div className="step-text">
                      <h3>SELECT FASHION BRAND</h3>
                      <p>Search across 48 international, Indian and athletic maisons.</p>
                    </div>
                  </div>

                  {/* Brand Search Bar */}
                  <div className="brand-search-box">
                    <Search size={14} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search Zara, H&M, Uniqlo, Fabindia, Manyavar, Nike…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="brand-search-input"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="clear-search-btn"
                        aria-label="Clear search"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Sector Pills */}
                  <div className="sector-filter-pills">
                    {BRAND_SECTORS.map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        className={`sector-pill ${selectedSector === sec.id ? 'is-active' : ''}`}
                        onClick={() => setSelectedSector(sec.id)}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>

                  {/* Expandable Brand Grid */}
                  <div className="brand-card-grid">
                    {filteredBrands.map((b) => {
                      const isSelected = b.id === selectedBrand.id
                      const hasChart = Boolean(b.hasVerifiedCharts)
                      return (
                        <button
                          key={b.id}
                          type="button"
                          className={`brand-select-card ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => handleSelectBrand(b)}
                        >
                          <div className="brand-card-top">
                            <strong className="brand-card-name">{b.name}</strong>
                            <span className="brand-card-origin">{b.country}</span>
                          </div>
                          <div className="brand-card-bottom">
                            <span className="brand-card-tier">{b.tier}</span>
                            <span className={`brand-status-badge ${hasChart ? 'is-verified' : 'is-pending'}`}>
                              {hasChart ? 'Verified Chart' : 'Chart Pending'}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Step 2: Fit Preference */}
                <div className="rec-step-section">
                  <div className="step-header">
                    <span className="step-number">02</span>
                    <div className="step-text">
                      <h3>FIT PREFERENCE</h3>
                      <p>Adjust wearing ease to match your personal style.</p>
                    </div>
                  </div>

                  <div className="fit-preference-chips-grid">
                    {fitPreferences.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`fit-pref-btn ${fitPreference === p.id ? 'is-selected' : ''}`}
                        onClick={() => handleFitPreferenceChange(p.id)}
                        title={p.easeNote}
                      >
                        <strong>{p.label}</strong>
                        <small>{p.easeNote}</small>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Size Recommendation Result Card */}
                {matchingResult?.success ? (
                  <div className="rec-results-card">
                    <div className="results-top-row">
                      <div className="recommended-size-display">
                        <span className="badge-rec-label">
                          {selectedBrand.name.toUpperCase()} RECOMMENDED SIZE
                        </span>
                        <strong className="size-giant-text">
                          {matchingResult.recommendedSize}
                        </strong>
                        <div className="match-quality-badge">
                          <Check size={12} />
                          <span>{matchingResult.matchConfidence}</span>
                        </div>
                      </div>

                      {matchingResult.alternativeSize && (
                        <div className="alternative-size-card">
                          <span className="alt-label">CLOSEST ALTERNATIVE</span>
                          <strong className="alt-size-code">
                            Size {matchingResult.alternativeSize}
                          </strong>
                          <p className="alt-reason">{matchingResult.alternativeReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Natural Tailoring Narrative */}
                    <div className="explanation-bubble">
                      <p>{matchingResult.fitExplanation}</p>
                    </div>

                    {/* Zone-by-Zone Measurement Comparison Table */}
                    <div className="spec-table-box">
                      <div className="spec-table-header">
                        <span>ANATOMICAL ZONE</span>
                        <span>BODY TAPE</span>
                        <span>GARMENT</span>
                        <span>WEARING EASE</span>
                      </div>
                      {matchingResult.zoneDetails.map((zone) => (
                        <div key={zone.metric} className="spec-table-row">
                          <span className="zone-name">{zone.label}</span>
                          <span className="zone-body">{zone.userDisplay}</span>
                          <span className="zone-garment">{zone.garmentDisplay}</span>
                          <span className={`zone-ease status-${zone.status}`}>
                            {zone.easeDisplay}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Chart Provenance Transparency Note */}
                    <div className="provenance-footnote">
                      <ShieldCheck size={13} className="gold-icon" />
                      <span>
                        Source: {matchingResult.chartSource} · Checked: {matchingResult.lastChecked || '2026-03'} · Region: Official Brand Standard
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="results-action-row">
                      <Button
                        variant="primary"
                        icon={Sparkles}
                        onClick={handleProceedToFittingSuite}
                        size="small"
                      >
                        Try On in 3D Fitting Room
                      </Button>

                      <button
                        type="button"
                        className={`btn-save-rec ${wardrobeSaved ? 'is-saved' : ''}`}
                        onClick={handleSaveToWardrobe}
                      >
                        <Heart size={14} fill={wardrobeSaved ? '#d4af37' : 'none'} />
                        <span>{wardrobeSaved ? 'Saved in My Wardrobe' : 'Save to Wardrobe'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-inspect-chart"
                        onClick={() => setInspectedBrandForModal(selectedBrand)}
                      >
                        <ExternalLink size={13} />
                        <span>Inspect Size Chart</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Size Chart Pending State */
                  <div className="rec-pending-card">
                    <div className="pending-icon-wrap">
                      <AlertCircle size={28} className="gold-icon" />
                    </div>
                    <h4>Size Chart Pending Official Verification</h4>
                    <p>
                      Official size grading specifications for <strong>{selectedBrand.name}</strong> ({category}) are currently being verified by our tailoring team.
                    </p>
                    <p className="pending-disclaimer">
                      FITMATE never fabricates size recommendations or uses arbitrary vanity estimations without documented brand size charts.
                    </p>
                    {selectedBrand.website && (
                      <a
                        href={selectedBrand.website}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-external-brand"
                      >
                        <span>Visit {selectedBrand.name} Official Website</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* ===================================================================
            MODE 2: COMPARE MY SIZES MULTI-BRAND MATRIX
            =================================================================== */}
        {activeMode === 'compare' && (
          <div className="compare-mode-container">
            <div className="compare-mode-header">
              <div>
                <h2>Compare My Sizes Across Fashion Maisons</h2>
                <p>
                  See your exact size recommendation across top brands for <strong>{audience}’s {category}</strong> using your active biometric passport.
                </p>
              </div>
              <div className="compare-filter-count">
                <span>Displaying {comparisonResults.length} Brands in {category}</span>
              </div>
            </div>

            <div className="compare-matrix-grid">
              {comparisonResults.map(({ brand, result }) => {
                const hasResult = result?.success
                return (
                  <div
                    key={brand.id}
                    className={`compare-brand-card ${hasResult ? 'is-active-match' : 'is-pending'}`}
                  >
                    <div className="card-top-bar">
                      <div>
                        <strong className="compare-brand-title">{brand.name}</strong>
                        <span className="compare-brand-sub">{brand.country} · {brand.tier}</span>
                      </div>
                      <span className={`status-pill ${hasResult ? 'verified' : 'pending'}`}>
                        {hasResult ? 'Verified Match' : 'Chart Pending'}
                      </span>
                    </div>

                    {hasResult ? (
                      <div className="card-body">
                        <div className="compare-size-badge">
                          <span className="sub-tag">YOUR SIZE:</span>
                          <strong className="size-highlight">{result.recommendedSize}</strong>
                        </div>

                        {result.alternativeSize && (
                          <div className="compare-alt-note">
                            <span>Alternative: <strong>{result.alternativeSize}</strong></span>
                          </div>
                        )}

                        <p className="compare-ease-note">
                          {result.easeNotes || 'Standard brand tailoring ease.'}
                        </p>

                        <div className="compare-actions-row">
                          <button
                            type="button"
                            className="btn-test-fitting"
                            onClick={() => {
                              handleSelectBrand(brand)
                              handleProceedToFittingSuite()
                            }}
                          >
                            <span>Test in 3D Fitting Room</span>
                            <ArrowRight size={12} />
                          </button>

                          <button
                            type="button"
                            className="btn-view-spec"
                            onClick={() => setInspectedBrandForModal(brand)}
                            title="View Size Chart"
                          >
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="card-pending-body">
                        <p>Size chart awaiting official brand verification.</p>
                        <span className="pending-muted">No estimated guessing</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* 5. Brand Size Chart Inspector Modal */}
      {inspectedBrandForModal && (
        <div className="chart-modal-backdrop" onClick={() => setInspectedBrandForModal(null)}>
          <div className="chart-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <ShieldCheck size={18} className="gold-icon" />
                <h3>{inspectedBrandForModal.name} Official Size Chart</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setInspectedBrandForModal(null)}
                aria-label="Close size chart modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-provenance-info">
                <span>Origin: {inspectedBrandForModal.country}</span>
                <span>Tier: {inspectedBrandForModal.tier}</span>
                {inspectedBrandForModal.sourceUrl && (
                  <a
                    href={inspectedBrandForModal.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="modal-source-link"
                  >
                    <span>Official Source URL</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Show chart table for active audience & category */}
              {(() => {
                const chartKey = `${audience}:${category}`
                const chart = inspectedBrandForModal.charts?.[chartKey] || Object.values(inspectedBrandForModal.charts || {})[0]
                if (!chart || !chart.rows || chart.rows.length === 0) {
                  return (
                    <div className="modal-empty-chart">
                      <AlertCircle size={24} className="gold-icon" />
                      <p>No verified size chart available for this category yet.</p>
                    </div>
                  )
                }

                const columns = Object.keys(chart.rows[0]).filter((k) => k !== 'size')

                return (
                  <div className="modal-table-wrap">
                    <div className="modal-chart-meta">
                      <strong>{chart.source || `${inspectedBrandForModal.name} Sizing`}</strong>
                      <small>{chart.easeNotes || 'Official metric dimensions'}</small>
                    </div>

                    <table className="official-chart-table">
                      <thead>
                        <tr>
                          <th>SIZE</th>
                          {columns.map((col) => (
                            <th key={col}>{col.toUpperCase()} ({unit})</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chart.rows.map((row) => (
                          <tr key={row.size}>
                            <td className="size-col">{row.size}</td>
                            {columns.map((col) => {
                              const val = row[col]
                              const displayVal = unit === 'in' ? centimetersToInches(val).toFixed(1) : val
                              return <td key={col}>{displayVal}</td>
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
