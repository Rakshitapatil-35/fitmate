import { Suspense, useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  Heart,
  Info,
  Maximize2,
  Play,
  RotateCcw,
  Ruler,
  Scissors,
  Sparkles,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { BrandWordmark, Button } from '../components/DesignSystem.jsx'
import MobileNav from '../components/MobileNav.jsx'
import {
  loadAvatarConfig,
  loadFitPreference,
  loadMeasurements,
  loadSelectedGarment,
  saveActiveRecommendation,
  saveSelectedGarment,
  toggleSavedProduct,
} from '../measurementStorage.js'
import { fabricPresets } from '../three/fabricMaterialLibrary.js'
import { fittingGarments } from '../three/fittingRoomCatalog.js'
import SceneManager from '../three/SceneManager.jsx'
import './VirtualFittingRoomPage.css'

const cameraViews = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' },
]

// Fallback demo body measurements if none saved yet in measurement studio
const defaultBodyMeasurements = {
  chest: 92,
  waist: 76,
  hip: 98,
  shoulder: 41,
  inseam: 78,
  heightCm: 170,
}

export default function VirtualFittingRoomPage() {
  const [searchParams] = useSearchParams()
  const avatarConfig = loadAvatarConfig()
  const sharedSelectedGarment = loadSelectedGarment()
  const initialAudience = ['Women', 'Men'].includes(searchParams.get('audience'))
    ? searchParams.get('audience')
    : sharedSelectedGarment?.audience === 'Men' || avatarConfig?.gender === 'male'
      ? 'Men'
      : 'Women'

  const [audience, setAudience] = useState(initialAudience)
  const availableGarments = useMemo(
    () => fittingGarments.filter((g) => g.audience === audience),
    [audience]
  )

  const requestedGarmentId = searchParams.get('garmentId')
  const initialGarment =
    availableGarments.find((g) => g.id === requestedGarmentId) ||
    availableGarments.find(
      (g) =>
        g.id === sharedSelectedGarment?.id ||
        g.assetId === sharedSelectedGarment?.garmentAssetId ||
        g.category === sharedSelectedGarment?.category
    ) ||
    availableGarments[0]

  const [selectedGarmentId, setSelectedGarmentId] = useState(initialGarment.id)
  const garment = useMemo(
    () => availableGarments.find((g) => g.id === selectedGarmentId) ?? availableGarments[0],
    [availableGarments, selectedGarmentId]
  )

  const [selectedFabricId, setSelectedFabricId] = useState(garment.defaultFabricId)
  const [selectedColorHex, setSelectedColorHex] = useState(garment.defaultColor)
  const [fitPreference] = useState(() => loadFitPreference() ?? 'Regular')
  const [savedMeasurements] = useState(() => {
    const loaded = loadMeasurements()
    return loaded && Object.keys(loaded).length > 0 ? loaded : defaultBodyMeasurements
  })

  // 3D Fitting Room Camera & Turntable State
  const [cameraView, setCameraView] = useState('front')
  const [zoomLevel, setZoomLevel] = useState('full')
  const [avatarRotationDeg, setAvatarRotationDeg] = useState(0)
  const [autoRotate360, setAutoRotate360] = useState(false)
  const [fitMapMode, setFitMapMode] = useState(false)
  const [bodyBuild, setBodyBuild] = useState('regular')
  const [wardrobeSaved, setWardrobeSaved] = useState(false)

  // Compute Recommended Size based on User's Saved Measurements & Fit Preference
  const recommendedSize = useMemo(() => {
    if (!garment?.sizeChart || garment.sizeChart.length === 0) return 'M'
    const targetChest = savedMeasurements.chest ?? 92
    const targetWaist = savedMeasurements.waist ?? 76
    const targetHip = savedMeasurements.hip ?? 98

    let bestSize = 'M'
    let bestDist = Infinity

    garment.sizeChart.forEach((row) => {
      // Metric differences
      const cDiff = row.chest > 0 ? Math.abs(row.chest - targetChest) : 0
      const wDiff = row.waist > 0 ? Math.abs(row.waist - targetWaist) : 0
      const hDiff = row.hip > 0 ? Math.abs(row.hip - targetHip) : 0
      const dist = cDiff * 0.45 + wDiff * 0.35 + hDiff * 0.2

      if (dist < bestDist) {
        bestDist = dist
        bestSize = row.size
      }
    })

    // Apply fit preference offset
    const sizeKeys = garment.sizeChart.map((r) => r.size)
    const baseIndex = sizeKeys.indexOf(bestSize)
    const offset = { Slim: -1, Regular: 0, Relaxed: 1, Oversized: 1 }[fitPreference] ?? 0
    const finalIndex = Math.max(0, Math.min(sizeKeys.length - 1, baseIndex + offset))
    return sizeKeys[finalIndex]
  }, [garment, savedMeasurements, fitPreference])

  const requestedSize = searchParams.get('size')
  const [selectedSize, setSelectedSize] = useState(() => (
    (requestedSize && garment?.sizeChart?.some((r) => r.size === requestedSize))
      ? requestedSize
      : recommendedSize
  ))

  // Calculate Zone-by-Zone Fit Tension Analysis for Selected Size
  const fitAnalysis = useMemo(() => {
    const sizeRow =
      garment?.sizeChart?.find((r) => r.size === selectedSize) ?? garment?.sizeChart?.[2]
    if (!sizeRow) return null

    const userChest = savedMeasurements.chest ?? 92
    const userWaist = savedMeasurements.waist ?? 76
    const userHip = savedMeasurements.hip ?? 98

    const chestEase = sizeRow.chest > 0 ? Number((sizeRow.chest - userChest).toFixed(1)) : null
    const waistEase = sizeRow.waist > 0 ? Number((sizeRow.waist - userWaist).toFixed(1)) : null
    const hipEase = sizeRow.hip > 0 ? Number((sizeRow.hip - userHip).toFixed(1)) : null

    const evaluateEase = (ease, isWaist = false) => {
      if (ease == null) return { status: 'optimal', label: 'Standard drape', diff: 0 }
      const minThreshold = isWaist ? 1.5 : 2.0
      const maxThreshold = isWaist ? 7.0 : 8.0

      if (ease < minThreshold) {
        return { status: 'tight', label: 'Snug / Tight Tension', diff: ease }
      }
      if (ease > maxThreshold) {
        return { status: 'loose', label: 'Generous / Relaxed Ease', diff: ease }
      }
      return { status: 'optimal', label: 'Optimal Tailored Drape', diff: ease }
    }

    return {
      chest: {
        bodyVal: userChest,
        garmentVal: sizeRow.chest,
        ease: chestEase,
        ...evaluateEase(chestEase, false),
      },
      waist: {
        bodyVal: userWaist,
        garmentVal: sizeRow.waist,
        ease: waistEase,
        ...evaluateEase(waistEase, true),
      },
      hip: {
        bodyVal: userHip,
        garmentVal: sizeRow.hip,
        ease: hipEase,
        ...evaluateEase(hipEase, false),
      },
      sizeRow,
    }
  }, [garment, selectedSize, savedMeasurements])

  const handleAudienceChange = (nextAudience) => {
    setAudience(nextAudience)
    const matching = fittingGarments.filter((g) => g.audience === nextAudience)
    if (matching.length > 0) {
      setSelectedGarmentId(matching[0].id)
      setSelectedFabricId(matching[0].defaultFabricId)
      setSelectedColorHex(matching[0].defaultColor)
    }
  }

  const handleGarmentChange = (garmentId) => {
    const nextGarment = fittingGarments.find((g) => g.id === garmentId)
    if (nextGarment) {
      setSelectedGarmentId(nextGarment.id)
      setSelectedFabricId(nextGarment.defaultFabricId)
      setSelectedColorHex(nextGarment.defaultColor)
      saveSelectedGarment({
        id: nextGarment.id,
        audience,
        collection: nextGarment.category === 'Traditional wear' ? 'Indian Ethnic' : audience === 'Men' ? 'Men’s' : 'Western',
        category: nextGarment.category,
        clothingType: nextGarment.type || nextGarment.category,
        brandId: 'fitmate-atelier',
        brand: 'FITMATE Haute-Couture',
        productName: nextGarment.name,
        name: nextGarment.name,
        occasion: 'Fitting Room',
        garmentAssetId: nextGarment.assetId,
        color: nextGarment.defaultColor,
        fabric: nextGarment.defaultFabricId,
      })
    }
  }

  const handleSaveToWardrobe = () => {
    saveActiveRecommendation({
      brandId: 'fitmate-atelier',
      brand: 'FITMATE Haute-Couture',
      product: garment.name,
      audience,
      category: garment.category,
      clothingType: garment.type || garment.category,
      recommendedSize,
      fitPreference,
      confidence: 'Calibrated with verified 3D tension ease matrix',
    })
    toggleSavedProduct({
      id: `fit-${garment.id}`,
      audience,
      collection: garment.category === 'Traditional wear' ? 'Indian Ethnic' : audience === 'Men' ? 'Men’s' : 'Western',
      category: garment.category,
      clothingType: garment.type || garment.category,
      brandId: 'fitmate-atelier',
      brand: 'FITMATE Haute-Couture',
      productName: garment.name,
      name: garment.name,
      occasion: 'Fitting Room selection',
      garmentAssetId: garment.assetId,
      size: selectedSize || recommendedSize,
      color: selectedColorHex,
      fabric: selectedFabricId,
    })
    setWardrobeSaved(true)
    setTimeout(() => setWardrobeSaved(false), 3500)
  }

  return (
    <div className="virtual-fitting-page">
      {/* Fitting Suite Header */}
      <header className="fitting-header">
        <div className="fitting-header-left">
          <BrandWordmark to="/" />
          <div className="fitting-header-badge">
            <Sparkles size={13} />
            <span>FITMATE 3D VIRTUAL FITTING SUITE</span>
          </div>
        </div>

        <nav className="fitting-nav" aria-label="Fitting room navigation">
          <Link to="/">Main Showroom</Link>
          <Link to="/measurements">3D Measurement Studio</Link>
          <Link to="/avatar-studio">Avatar Studio</Link>
          <Link to="/lehenga-studio">Lehenga Studio</Link>
          <Link to="/western-wear">Western World</Link>
          <Link to="/mens-fashion">Men’s Atelier</Link>
          <Link to="/my-wardrobe">My Wardrobe</Link>
          <Button to="/find-my-size" size="small" icon={ArrowUpRight}>
            Find My Size
          </Button>
        </nav>

        <MobileNav
          links={[
            { to: '/', label: 'Main Showroom' },
            { to: '/measurements', label: 'Measurement Studio' },
            { to: '/find-my-size', label: 'Find My Size' },
            { to: '/avatar-studio', label: 'Avatar Studio' },
            { to: '/lehenga-studio', label: 'Lehenga Studio' },
            { to: '/western-wear', label: 'Western World' },
            { to: '/mens-fashion', label: "Men's Atelier" },
            { to: '/my-wardrobe', label: 'My Wardrobe' },
          ]}
        />
      </header>

      <main className="fitting-main">
        {/* Top Marquee Banner */}
        <section className="fitting-top-marquee">
          <div className="marquee-left">
            <span className="marquee-tag">HAUTE COUTURE VIRTUAL TRY-ON & BIOMETRIC EASE SIMULATION</span>
            <h1>3D Virtual Fitting Room</h1>
            <p>
              Experience how different sizes (XS through XXL) drape around your 3D avatar. Inspect real-time tension heat-maps, compare finished garment dimensions against your verified measurements, and choose your perfect fit with complete confidence.
            </p>
          </div>
          <div className="marquee-actions">
            <Link to="/measurements" className="fitting-switch-btn" title="Recalibrate body tape measurements">
              <Ruler size={13} />
              <span>Calibrate Measurements</span>
            </Link>
          </div>
        </section>

        {/* Honest Simulation Disclaimer Banner */}
        <section className="fitting-accuracy-banner" role="note" aria-label="Simulation transparency disclosure">
          <div className="accuracy-banner-icon">
            <Info size={16} />
          </div>
          <div className="accuracy-banner-content">
            <strong>HONEST BIOMETRIC SIMULATION COMMITMENT:</strong>
            <p>
              Garment try-on drape is generated through biometric grading algorithms comparing your verified body measurements with brand size charts. <strong>FITMATE does not claim live physical cloth simulation</strong> or real-time yarn stretching. Tension highlights reflect mathematical wearing ease (+/- cm) from standard tailoring specifications.
            </p>
          </div>
        </section>

        {/* 2-Column Fitting Suite Grid */}
        <div className="fitting-stage-grid">
          {/* Left Column: 3D Fitting Salon Viewport */}
          <div className="fitting-canvas-column">
            <div className="fitting-canvas-frame" aria-label="3D Fitting Salon Viewport">
              <Suspense
                fallback={
                  <div className="fitting-scene-loader" role="status">
                    <Sparkles size={28} />
                    <span>ENTERING 3D VIRTUAL FITTING SUITE</span>
                    <small>Preparing tri-fold mirrors, chevron oak floor & tailored drape…</small>
                  </div>
                }
              >
                <SceneManager
                  sceneId="virtualFittingRoom"
                  sceneProps={{
                    gender: audience === 'Men' ? 'male' : 'female',
                    bodyBuild,
                    heightCm: savedMeasurements.heightCm ?? 170,
                    silhouette: garment.silhouette,
                    fabricId: selectedFabricId,
                    customColor: selectedColorHex,
                    size: selectedSize,
                    fitMapMode,
                    fitAnalysis,
                    cameraView,
                    zoomLevel,
                    avatarRotationDeg,
                    autoRotate360,
                  }}
                  className="fitting-3d-canvas"
                />
              </Suspense>

              <div className="fitting-viewport-watermark" aria-hidden="true">
                <span className="watermark-tag">TRY-ON: SIZE {selectedSize}</span>
                <strong className="watermark-title">{garment.name}</strong>
              </div>

              {/* Fit Map Mode Active Badge */}
              {fitMapMode && (
                <div className="fitting-heat-badge" aria-hidden="true">
                  <span className="heat-dot" />
                  <span>BIOMETRIC TENSION MAP ACTIVE</span>
                </div>
              )}
            </div>

            {/* Viewport Camera & 360 Turntable Controls */}
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
                    }}
                    title={`${view.label} camera angle`}
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
                  title="Toggle close-up inspection"
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
                  title="Toggle continuous 360-degree rotation"
                >
                  <Play size={12} />
                  <span>{autoRotate360 ? 'Pause' : 'Rotate 360°'}</span>
                </button>
              </div>

              {/* Fit Tension Overlay Toggle */}
              <div className="control-group">
                <button
                  type="button"
                  className={`fit-map-toggle-btn ${fitMapMode ? 'is-active' : ''}`}
                  aria-pressed={fitMapMode}
                  onClick={() => setFitMapMode((prev) => !prev)}
                  title="Toggle biometric tension heat-map"
                >
                  <Eye size={12} />
                  <span>{fitMapMode ? 'Hide Tension Map' : 'Show Tension Map'}</span>
                </button>
              </div>
            </div>

            {/* Manual 360 Degree Slider */}
            <div className="turntable-slider-bar">
              <span className="slider-label">360° FITTING TURNTABLE:</span>
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

          {/* Right Column: Size Comparison Suite & Controls */}
          <aside className="fitting-controls-column" aria-label="Fitting room size comparison and controls">
            <div className="fitting-glass-panel">
              {/* Audience & Garment Selectors */}
              <div className="panel-header-row">
                <div className="panel-title-group">
                  <span className="panel-eyebrow">FITTING ROOM ATELIER</span>
                  <h2>{garment.name}</h2>
                </div>

                <div className="gender-toggle-pills" role="group" aria-label="Department selection">
                  <button
                    type="button"
                    aria-pressed={audience === 'Women'}
                    className={audience === 'Women' ? 'is-active' : ''}
                    onClick={() => handleAudienceChange('Women')}
                  >
                    Women
                  </button>
                  <button
                    type="button"
                    aria-pressed={audience === 'Men'}
                    className={audience === 'Men' ? 'is-active' : ''}
                    onClick={() => handleAudienceChange('Men')}
                  >
                    Men
                  </button>
                </div>
              </div>

              {/* Garment Selector */}
              <div className="garment-select-field">
                <label htmlFor="fitting-garment-select">TRY ON ANOTHER GARMENT</label>
                <select
                  id="fitting-garment-select"
                  value={selectedGarmentId}
                  onChange={(e) => handleGarmentChange(e.target.value)}
                >
                  {availableGarments.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} · {g.category} ({g.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fabric Preset Customizer */}
              <div className="fabric-customizer-group">
                <div className="control-section-header">
                  <Scissors size={13} />
                  <span>HAUTE COUTURE FABRIC SELECTION</span>
                </div>
                <div className="fabric-chips-scroll">
                  {garment.supportedFabrics.map((fabId) => {
                    const preset = fabricPresets.find((p) => p.id === fabId)
                    const isSelected = selectedFabricId === fabId
                    return (
                      <button
                        key={fabId}
                        type="button"
                        className={`fabric-chip-btn ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => setSelectedFabricId(fabId)}
                        title={preset?.note ?? preset?.label}
                      >
                        <strong>{preset?.label ?? fabId}</strong>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color Swatch Options */}
              <div className="color-swatches-group">
                <span className="control-section-label">CURATED COLOR PALETTE</span>
                <div className="color-swatches-row">
                  {garment.colors.map((c) => {
                    const isSelected = selectedColorHex === c.hex
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`color-swatch-btn ${isSelected ? 'is-selected' : ''}`}
                        style={{ backgroundColor: c.hex }}
                        onClick={() => setSelectedColorHex(c.hex)}
                        title={c.name}
                        aria-label={`Select ${c.name} color`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Interactive Size Comparison Selector (XS to XXL) */}
              <div className="size-selector-suite">
                <div className="size-header-row">
                  <div className="size-title-group">
                    <Ruler size={14} />
                    <span>COMPARE SIZES ON YOUR 3D AVATAR</span>
                  </div>
                  <span className="user-pref-tag">
                    Fit Preference: <strong>{fitPreference}</strong>
                  </span>
                </div>

                <div className="sizes-grid">
                  {garment.sizeChart.map((row) => {
                    const isSelected = selectedSize === row.size
                    const isRec = recommendedSize === row.size
                    return (
                      <button
                        key={row.size}
                        type="button"
                        className={`size-card-btn ${isSelected ? 'is-selected' : ''} ${isRec ? 'is-recommended' : ''}`}
                        onClick={() => setSelectedSize(row.size)}
                        aria-pressed={isSelected}
                      >
                        <div className="size-card-top">
                          <strong className="size-code">{row.size}</strong>
                          {isRec && <span className="rec-pill">RECOMMENDED</span>}
                        </div>
                        <div className="size-card-dims">
                          {row.chest > 0 && <span>Chest: {row.chest}cm</span>}
                          {row.waist > 0 && <span>Waist: {row.waist}cm</span>}
                          {row.hip > 0 && <span>Hip: {row.hip}cm</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Fit Analysis & Wearing Ease Breakdown */}
              {fitAnalysis && (
                <div className="fit-analysis-panel">
                  <div className="analysis-header-row">
                    <span className="analysis-title">
                      FIT ANALYSIS FOR SIZE <strong>{selectedSize}</strong>:
                    </span>
                    <span className={`fit-overall-badge status-${fitAnalysis.chest.status}`}>
                      {selectedSize === recommendedSize ? 'OPTIMAL MATCH' : 'ALTERNATIVE FIT'}
                    </span>
                  </div>

                  <div className="tension-zones-grid">
                    {/* Chest / Bust Zone */}
                    {fitAnalysis.chest.ease != null && (
                      <div className={`tension-card status-${fitAnalysis.chest.status}`}>
                        <div className="zone-label-row">
                          <strong>Bust / Chest</strong>
                          <span className="zone-ease-diff">
                            {fitAnalysis.chest.ease >= 0 ? `+${fitAnalysis.chest.ease}` : fitAnalysis.chest.ease} cm ease
                          </span>
                        </div>
                        <span className="zone-status-text">{fitAnalysis.chest.label}</span>
                        <div className="zone-bar-frame">
                          <div
                            className={`zone-bar-fill fill-${fitAnalysis.chest.status}`}
                            style={{
                              width: `${Math.min(100, Math.max(20, (fitAnalysis.chest.ease + 4) * 8))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Waist Zone */}
                    {fitAnalysis.waist.ease != null && (
                      <div className={`tension-card status-${fitAnalysis.waist.status}`}>
                        <div className="zone-label-row">
                          <strong>Waistline</strong>
                          <span className="zone-ease-diff">
                            {fitAnalysis.waist.ease >= 0 ? `+${fitAnalysis.waist.ease}` : fitAnalysis.waist.ease} cm ease
                          </span>
                        </div>
                        <span className="zone-status-text">{fitAnalysis.waist.label}</span>
                        <div className="zone-bar-frame">
                          <div
                            className={`zone-bar-fill fill-${fitAnalysis.waist.status}`}
                            style={{
                              width: `${Math.min(100, Math.max(20, (fitAnalysis.waist.ease + 4) * 8))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Hip Zone */}
                    {fitAnalysis.hip.ease != null && (
                      <div className={`tension-card status-${fitAnalysis.hip.status}`}>
                        <div className="zone-label-row">
                          <strong>Hips & Seat</strong>
                          <span className="zone-ease-diff">
                            {fitAnalysis.hip.ease >= 0 ? `+${fitAnalysis.hip.ease}` : fitAnalysis.hip.ease} cm ease
                          </span>
                        </div>
                        <span className="zone-status-text">{fitAnalysis.hip.label}</span>
                        <div className="zone-bar-frame">
                          <div
                            className={`zone-bar-fill fill-${fitAnalysis.hip.status}`}
                            style={{
                              width: `${Math.min(100, Math.max(20, (fitAnalysis.hip.ease + 4) * 8))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Side-by-Side Measurements Comparison Table */}
              <div className="measurement-diff-table-frame">
                <span className="table-caption">BODY VS GARMENT MEASUREMENTS ({selectedSize})</span>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th scope="col">Measurement Area</th>
                      <th scope="col">Your Body</th>
                      <th scope="col">Garment ({selectedSize})</th>
                      <th scope="col">Wearing Ease</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fitAnalysis?.chest?.ease != null && (
                      <tr>
                        <td>Chest / Bust</td>
                        <td>{fitAnalysis.chest.bodyVal} cm</td>
                        <td>{fitAnalysis.chest.garmentVal} cm</td>
                        <td className={`ease-cell ${fitAnalysis.chest.status}`}>
                          {fitAnalysis.chest.ease >= 0 ? `+${fitAnalysis.chest.ease}` : fitAnalysis.chest.ease} cm
                        </td>
                      </tr>
                    )}
                    {fitAnalysis?.waist?.ease != null && (
                      <tr>
                        <td>Natural Waist</td>
                        <td>{fitAnalysis.waist.bodyVal} cm</td>
                        <td>{fitAnalysis.waist.garmentVal} cm</td>
                        <td className={`ease-cell ${fitAnalysis.waist.status}`}>
                          {fitAnalysis.waist.ease >= 0 ? `+${fitAnalysis.waist.ease}` : fitAnalysis.waist.ease} cm
                        </td>
                      </tr>
                    )}
                    {fitAnalysis?.hip?.ease != null && (
                      <tr>
                        <td>Hips & Seat</td>
                        <td>{fitAnalysis.hip.bodyVal} cm</td>
                        <td>{fitAnalysis.hip.garmentVal} cm</td>
                        <td className={`ease-cell ${fitAnalysis.hip.status}`}>
                          {fitAnalysis.hip.ease >= 0 ? `+${fitAnalysis.hip.ease}` : fitAnalysis.hip.ease} cm
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons: Wardrobe & Size Recommender */}
              <div className="fitting-actions-row">
                <Button
                  onClick={handleSaveToWardrobe}
                  variant="secondary"
                  icon={wardrobeSaved ? Check : Heart}
                  className="btn-save-wardrobe"
                >
                  {wardrobeSaved ? 'Saved to My Wardrobe!' : 'Save Outfit to Wardrobe'}
                </Button>
                {wardrobeSaved ? (
                  <Button
                    to="/my-wardrobe"
                    variant="primary"
                    icon={Sparkles}
                    className="btn-open-wardrobe"
                  >
                    Open in 3D Wardrobe
                  </Button>
                ) : (
                  <Button
                    to={`/find-my-size?audience=${encodeURIComponent(audience)}&category=${encodeURIComponent(garment.category)}`}
                    icon={ArrowRight}
                    className="btn-find-size"
                  >
                    Confirm Size Recommendation
                  </Button>
                )}
              </div>

              {/* Anatomical Build Modifier */}
              <div className="build-customizer-row">
                <span className="build-customizer-label">AVATAR BUILD:</span>
                <div className="build-chips">
                  {(audience === 'Men'
                    ? [
                        { id: 'regular', label: 'Tailored' },
                        { id: 'athletic', label: 'Athletic (V-Taper)' },
                        { id: 'broad', label: 'Executive' },
                        { id: 'slim', label: 'Slim' },
                      ]
                    : [
                        { id: 'regular', label: 'Tailored' },
                        { id: 'curvy', label: 'Curvy' },
                        { id: 'slim', label: 'Slim' },
                      ]
                  ).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`build-chip ${bodyBuild === b.id ? 'is-active' : ''}`}
                      onClick={() => setBodyBuild(b.id)}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer Portals Navigation */}
        <footer className="fitting-footer">
          <BrandWordmark to="/" />
          <nav className="footer-links-row" aria-label="Fashion universe portals">
            <Link to="/measurements">3D Body Measurement Studio</Link>
            <Link to="/find-my-size">Size Recommendation Engine</Link>
            <Link to="/lehenga-studio">Luxury Lehenga Studio</Link>
            <Link to="/western-wear">Western Fashion World</Link>
            <Link to="/mens-fashion">Men’s Sartorial Atelier</Link>
            <Link to="/my-wardrobe">My Wardrobe</Link>
          </nav>
          <small>
            FITMATE 3D Virtual Fitting Suite · Biometric Ease Simulation & Multi-Size Comparison.
          </small>
        </footer>
      </main>
    </div>
  )
}
