import { Suspense, useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Edit3,
  Eye,
  Info,
  Lock,
  Maximize2,
  Play,
  RotateCcw,
  Ruler,
  Scissors,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { BrandWordmark, Button, TextField } from '../components/DesignSystem.jsx'
import MobileNav from '../components/MobileNav.jsx'
import { getMeasurementProfile, measurementProfiles } from '../measurementProfiles.js'
import {
  centimetersToInches,
  inchesToCentimeters,
  loadFitPreference,
  loadMeasurements,
  saveFitPreference,
  saveMeasurements,
} from '../measurementStorage.js'
import SceneManager from '../three/SceneManager.jsx'
import './MeasurementProfilePage.css'

const cameraViews = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' },
]

const fitPreferences = [
  { id: 'Slim', label: 'Slim Fit', note: 'Tailored close to natural body contours with minimal wearing ease (+1 to +2 cm)' },
  { id: 'Regular', label: 'Regular Fit', note: 'Classic balanced drape with standard comfort wearing ease (+3 to +5 cm)' },
  { id: 'Relaxed', label: 'Relaxed Fit', note: 'Generous cut allowing effortless airflow and easy movement (+6 to +8 cm)' },
  { id: 'Oversized', label: 'Oversized Fit', note: 'Fashion-forward exaggerated volume and dropped shoulder ease (+10+ cm)' },
]

function displayValue(value, unit) {
  if (!Number.isFinite(Number(value))) return ''
  return (unit === 'cm' ? Number(value) : centimetersToInches(value)).toFixed(1)
}

export default function MeasurementProfilePage() {
  const [searchParams] = useSearchParams()
  const requestedAudience = ['Women', 'Men'].includes(searchParams.get('audience'))
    ? searchParams.get('audience')
    : 'Women'
  const requestedProfile = getMeasurementProfile(
    requestedAudience,
    searchParams.get('category'),
    searchParams.get('clothingType')
  )
  const initialProfile =
    requestedProfile ?? measurementProfiles.find((profile) => profile.audience === requestedAudience)

  const [audience, setAudience] = useState(requestedAudience)
  const [profileId, setProfileId] = useState(initialProfile?.id ?? 'women-full-body')
  const [savedMeasurements, setSavedMeasurements] = useState(() => loadMeasurements())
  const [unit, setUnit] = useState('cm')
  const [values, setValues] = useState(() => loadMeasurements() ?? {})
  const [fitPreference, setFitPreference] = useState(() => loadFitPreference())
  const [isEditing, setIsEditing] = useState(true)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState(null)

  // 3D Studio Camera & Turntable State
  const [cameraView, setCameraView] = useState('front')
  const [zoomLevel, setZoomLevel] = useState('full')
  const [avatarRotationDeg, setAvatarRotationDeg] = useState(0)
  const [autoRotate360, setAutoRotate360] = useState(false)
  const [activeMarker, setActiveMarker] = useState(null)
  const [bodyBuild, setBodyBuild] = useState('regular')
  const [heightCm, setHeightCm] = useState(requestedAudience === 'Men' ? 178 : 170)

  const profileOptions = useMemo(
    () => measurementProfiles.filter((p) => p.audience === audience),
    [audience]
  )
  const profile = useMemo(
    () => profileOptions.find((item) => item.id === profileId) ?? profileOptions[0],
    [profileOptions, profileId]
  )

  const requiredFields = useMemo(
    () => profile?.fields.filter((item) => !item.optional && !item.isGarmentPreference) ?? [],
    [profile]
  )

  const isProfileSaved = useMemo(() => {
    return requiredFields.length > 0 && requiredFields.every(
      (item) => Number.isFinite(savedMeasurements?.[item.key]) && savedMeasurements[item.key] > 0
    )
  }, [requiredFields, savedMeasurements])

  const activeFieldKeys = useMemo(() => {
    return (profile?.fields ?? []).map((f) => f.key)
  }, [profile])

  const changeUnit = (nextUnit) => setUnit(nextUnit)

  const handleChange = ({ target }) => {
    const raw = target.value
    const storedValue = raw === '' ? '' : Number(unit === 'cm' ? raw : inchesToCentimeters(raw))
    setValues((current) => ({ ...current, [target.name]: storedValue }))
    setErrors((current) => ({ ...current, [target.name]: '' }))
    setFeedback(null)
  }

  const handleAudienceChange = (event) => {
    const nextAudience = event.target.value
    setAudience(nextAudience)
    setHeightCm(nextAudience === 'Men' ? 178 : 170)
    setBodyBuild('regular')
    const nextProfile = measurementProfiles.find((item) => item.audience === nextAudience)
    setProfileId(nextProfile?.id ?? '')
    setErrors({})
    setFeedback(null)
    setActiveMarker(null)
  }

  const handleProfileChange = (event) => {
    setProfileId(event.target.value)
    setErrors({})
    setFeedback(null)
    setActiveMarker(null)
  }

  const handleFitPreferenceChange = (prefId) => {
    setFitPreference(prefId)
    saveFitPreference(prefId)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    for (const { key, label, minCm, maxCm, optional } of profile?.fields ?? []) {
      const val = values[key]
      const centimeters = Number(val)
      if ((val === '' || val == null || !Number.isFinite(centimeters)) && optional) continue
      if (val === '' || val == null || !Number.isFinite(centimeters)) {
        nextErrors[key] = `Enter your ${label.toLowerCase()}.`
      } else if (centimeters < minCm || centimeters > maxCm) {
        nextErrors[key] = `Enter between ${displayValue(minCm, unit)} and ${displayValue(maxCm, unit)} ${unit}.`
      }
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setFeedback({ type: 'error', text: 'Please review the highlighted measurement entries.' })
      return
    }

    const measurementsCm = Object.fromEntries(
      (profile?.fields ?? []).map(({ key, optional }) => [
        key,
        values[key] === '' && optional ? null : Number(Number(values[key]).toFixed(1)),
      ])
    )

    if (!saveMeasurements(measurementsCm, fitPreference)) {
      setFeedback({
        type: 'error',
        text: 'Could not write to local storage. Check your browser privacy settings.',
      })
      return
    }

    const nextSaved = loadMeasurements() ?? {}
    setSavedMeasurements(nextSaved)
    setValues(nextSaved)
    setIsEditing(false)
    setFeedback({
      type: 'success',
      text: 'Measurements and fit preference saved locally on this device. Fully confidential.',
    })
  }

  const handleResetToSaved = () => {
    const currentSaved = loadMeasurements() ?? {}
    setValues(currentSaved)
    setErrors({})
    setFeedback(null)
    setIsEditing(false)
  }

  return (
    <div className="measurement-studio-page">
      {/* Studio Header */}
      <header className="measurement-header">
        <div className="measurement-header-left">
          <BrandWordmark to="/" />
          <div className="measurement-header-badge">
            <Ruler size={13} />
            <span>FITMATE 3D BODY MEASUREMENT STUDIO</span>
          </div>
        </div>

        <nav className="measurement-nav" aria-label="Measurement studio navigation">
          <Link to="/">Main Showroom</Link>
          <Link to="/virtual-fitting-room">3D Fitting Room</Link>
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
            { to: '/virtual-fitting-room', label: '3D Fitting Room' },
            { to: '/find-my-size', label: 'Find My Size' },
            { to: '/avatar-studio', label: 'Avatar Studio' },
            { to: '/lehenga-studio', label: 'Lehenga Studio' },
            { to: '/western-wear', label: 'Western World' },
            { to: '/mens-fashion', label: "Men's Atelier" },
            { to: '/my-wardrobe', label: 'My Wardrobe' },
          ]}
        />
      </header>

      <main className="measurement-main">
        {/* Top Laboratory Marquee */}
        <section className="measurement-top-marquee">
          <div className="marquee-left">
            <span className="marquee-tag">OPTICAL 3D SCANNING LABORATORY & CALIBRATION</span>
            <h1>3D Body Measurement Studio</h1>
            <p>
              Inspect visual laser guides mapped around a calibrated 3D anatomical avatar. Rotate 360 degrees and enter verified tape measurements with millimeter confidence.
            </p>
          </div>
          <div className="marquee-actions">
            <Link to="/avatar-studio" className="measurement-switch-btn" title="Explore Rigged Avatar Studio">
              <span>Avatar Rig Studio</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* Accuracy & Ethics Disclosure Banner */}
        <section className="accuracy-notice-banner" role="note" aria-label="Measurement accuracy disclosure">
          <div className="accuracy-notice-icon">
            <Lock size={16} />
          </div>
          <div className="accuracy-notice-content">
            <strong>ACCURACY & ETHICAL MEASUREMENT COMMITMENT:</strong>
            <p>
              FITMATE does <strong>not</strong> access your camera, capture biometrics, or estimate numbers through AI video. Body measurements must always be taken with a soft measuring tape against the skin or imported from professional tailoring records. <strong>Body measurements describe your biological form</strong>; garment size charts describe finished cloth and include wearing ease.
            </p>
          </div>
        </section>

        {/* 2-Column Laboratory Stage Grid */}
        <div className="measurement-stage-grid">
          {/* Left Column: 3D Volumetric Scanning Chamber Viewport */}
          <div className="measurement-canvas-column">
            <div className="measurement-canvas-frame" aria-label="3D Body Measurement Scanning Chamber">
              <Suspense
                fallback={
                  <div className="measurement-scene-loader" role="status">
                    <Ruler size={28} />
                    <span>INITIALIZING 3D MEASUREMENT LABORATORY</span>
                    <small>Calibrating optical laser rings, titanium stage & anatomical form…</small>
                  </div>
                }
              >
                <SceneManager
                  sceneId="measurementStudio"
                  sceneProps={{
                    gender: audience === 'Men' ? 'male' : 'female',
                    heightCm,
                    bodyBuild,
                    activeFields: activeFieldKeys,
                    activeMarker,
                    onMarkerClick: (markerKey) => setActiveMarker(markerKey),
                    cameraView,
                    zoomLevel,
                    avatarRotationDeg,
                    autoRotate360,
                  }}
                  className="measurement-3d-canvas"
                />
              </Suspense>

              <div className="measurement-viewport-watermark" aria-hidden="true">
                <span className="watermark-tag">OPTICAL SCAN CALIBRATION</span>
                <strong className="watermark-title">
                  {audience} · {profile?.garmentType ?? 'Full Body Profile'}
                </strong>
              </div>
            </div>

            {/* Viewport Camera & 360 Controls */}
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
                      setActiveMarker(null)
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
                  title="Toggle close-up zoom"
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
            </div>

            {/* Manual 360 Degree Slider */}
            <div className="turntable-slider-bar">
              <span className="slider-label">360° TURNTABLE ROTATION:</span>
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

            {/* Quick 3D Measurement Guide Highlights */}
            <div className="studio-guides-pills-bar">
              <span className="guides-bar-label">
                <Eye size={12} /> ACTIVE 3D GUIDES:
              </span>
              <div className="guides-pills-scroll">
                {(profile?.fields ?? []).map((f) => {
                  const isActive = activeMarker === f.key
                  return (
                    <button
                      key={f.key}
                      type="button"
                      className={`guide-pill-btn ${isActive ? 'is-active' : ''}`}
                      onClick={() => {
                        setActiveMarker(isActive ? null : f.key)
                        setZoomLevel(isActive ? 'full' : 'detail')
                      }}
                      title={f.instruction}
                    >
                      <span className="guide-pill-dot" />
                      <strong>{f.label}</strong>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Manual Measurement Entry Form & Controls */}
          <aside className="measurement-form-column" aria-label="Measurement entry and calibration">
            <form className="measurement-glass-panel" noValidate onSubmit={handleSubmit}>
              <div className="panel-header-row">
                <div className="panel-title-group">
                  <span className="panel-eyebrow">LABORATORY FORM</span>
                  <h2>{profile?.garmentType ?? 'Body Profile'}</h2>
                </div>

                {/* Units Toggle: cm vs in */}
                <div className="unit-toggle-pills" role="group" aria-label="Measurement unit selection">
                  <button
                    type="button"
                    aria-pressed={unit === 'cm'}
                    className={unit === 'cm' ? 'is-active' : ''}
                    onClick={() => changeUnit('cm')}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    aria-pressed={unit === 'in'}
                    className={unit === 'in' ? 'is-active' : ''}
                    onClick={() => changeUnit('in')}
                  >
                    inches
                  </button>
                </div>
              </div>

              {/* Department & Garment Category Pickers */}
              <div className="profile-select-grid">
                <div className="select-field">
                  <label htmlFor="measurement-audience">SHOPPING FOR</label>
                  <select
                    id="measurement-audience"
                    value={audience}
                    onChange={handleAudienceChange}
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                  </select>
                </div>

                <div className="select-field">
                  <label htmlFor="measurement-garment">TARGET CATEGORY</label>
                  <select
                    id="measurement-garment"
                    value={profile?.id ?? ''}
                    onChange={handleProfileChange}
                  >
                    {profileOptions.map((opt) => (
                      <option value={opt.id} key={opt.id}>
                        {opt.garmentType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Anatomical Body Build Option */}
              <div className="build-picker-card">
                <span className="field-group-label">
                  {audience === 'Men' ? 'MALE ANATOMICAL BUILD' : 'FEMALE ANATOMICAL BUILD'}
                </span>
                <div className="build-chips-row">
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

              {/* Fit Preference Selector */}
              <div className="fit-preference-group">
                <div className="fit-preference-title-row">
                  <Scissors size={13} />
                  <span>DESIRED WEARING EASE / FIT PREFERENCE</span>
                </div>
                <div className="fit-preference-chips">
                  {fitPreferences.map((pref) => {
                    const isSelected = fitPreference === pref.id
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        className={`fit-pref-chip ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => handleFitPreferenceChange(pref.id)}
                        title={pref.note}
                      >
                        <strong>{pref.label}</strong>
                      </button>
                    )
                  })}
                </div>
                <small className="fit-preference-note">
                  Active Ease: <strong>{fitPreferences.find((p) => p.id === fitPreference)?.note}</strong>
                </small>
              </div>

              {/* Measurement Input Fields */}
              <div className="measurement-inputs-grid">
                {(profile?.fields ?? []).map(({ key, label, minCm, maxCm, optional, instruction }) => {
                  const isFieldHighlighted = activeMarker === key
                  return (
                    <div
                      key={key}
                      className={`measurement-input-card ${isFieldHighlighted ? 'is-highlighted' : ''}`}
                      onFocus={() => setActiveMarker(key)}
                    >
                      <TextField
                        label={`${label} (${unit})`}
                        name={key}
                        type="number"
                        min={displayValue(minCm, unit)}
                        max={displayValue(maxCm, unit)}
                        step="0.1"
                        inputMode="decimal"
                        placeholder="e.g. 92.5"
                        hint={instruction}
                        value={values[key] == null ? '' : displayValue(values[key], unit)}
                        onChange={handleChange}
                        error={errors[key]}
                        required={!optional}
                        disabled={!isEditing}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="conversion-footer-note">
                <small>1 inch = 2.54 cm. Values are encrypted into your device’s local storage in centimeters.</small>
              </div>

              {feedback && (
                <div
                  className={`studio-feedback-bar ${feedback.type === 'error' ? 'is-error' : 'is-success'}`}
                  role={feedback.type === 'error' ? 'alert' : 'status'}
                >
                  {feedback.type === 'error' ? <Info size={14} /> : <Check size={14} />}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Form Actions: Edit, Save, Reset & Find My Size */}
              <div className="studio-actions-row">
                {isEditing ? (
                  <>
                    <Button type="submit" icon={Check} className="btn-save-measurements">
                      Save Verified Measurements
                    </Button>
                    <button
                      type="button"
                      className="btn-cancel-edit"
                      onClick={handleResetToSaved}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-edit-mode"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 size={14} />
                      <span>Edit Measurements</span>
                    </button>
                    <Button
                      to={`/find-my-size?audience=${encodeURIComponent(audience)}&category=${encodeURIComponent(profile?.category ?? 'Traditional wear')}`}
                      icon={ArrowRight}
                    >
                      Proceed to Size Recommendations
                    </Button>
                  </>
                )}
              </div>

              {/* Saved Status Indicator */}
              <div className="saved-status-badge">
                <span className={`status-led ${isProfileSaved ? 'is-ready' : 'is-pending'}`} />
                <span>
                  {isProfileSaved
                    ? 'VERIFIED FIT PROFILE STORED IN THIS BROWSER'
                    : 'CALIBRATION INCOMPLETE — ENTER REQUIRED MEASUREMENTS'}
                </span>
              </div>
            </form>
          </aside>
        </div>

        {/* Footer Navigation */}
        <footer className="measurement-footer">
          <BrandWordmark to="/" />
          <nav className="footer-links-row" aria-label="Fashion universe portals">
            <Link to="/virtual-fitting-room">3D Virtual Fitting Suite</Link>
            <Link to="/find-my-size">Find My Size Calculator</Link>
            <Link to="/avatar-studio">3D Avatar Studio</Link>
            <Link to="/lehenga-studio">Luxury Lehenga Studio</Link>
            <Link to="/western-wear">Western Fashion World</Link>
            <Link to="/mens-fashion">Men’s Sartorial Atelier</Link>
            <Link to="/my-wardrobe">My Wardrobe</Link>
          </nav>
          <small>
            FITMATE 3D Body Measurement Studio · Physical Measuring Tape Calibration & Local Device Persistence.
          </small>
        </footer>
      </main>
    </div>
  )
}
