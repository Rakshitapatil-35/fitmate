import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileText,
  Info,
  Maximize2,
  Palette,
  RefreshCw,
  RotateCcw,
  Ruler,
  Scissors,
  Shield,
  ShieldCheck,
  Sliders,
  User,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandWordmark, Eyebrow } from '../components/DesignSystem.jsx'
import { loadAvatarConfig, loadMeasurements, saveAvatarConfig, saveMeasurements } from '../measurementStorage.js'
import { sceneAssets } from '../three/assetManifest.js'
import { avatarPoses, getAvatarAssetId, SKIN_TONES } from '../three/avatarCatalog.js'
import AvatarStudioCanvas from '../three/AvatarStudioCanvas.jsx'
import './avatar-studio.css'

const cameraViews = [
  { id: 'front', label: 'Front (0°)' },
  { id: 'angle', label: 'Angle (45°)' },
  { id: 'side', label: 'Side (90°)' },
  { id: 'back', label: 'Back (180°)' },
]

const outfitOptions = [
  {
    id: 'undergarment',
    label: 'Technical Undergarment',
    category: 'Anatomical Silhouette',
    desc: 'Form-fitting base layer for precision tape alignment & silhouette analysis',
  },
  {
    id: 'western',
    label: 'Western Tailoring',
    category: 'Ready-to-Wear',
    desc: 'Mulberry silk column slip dress (women) / Barathea wool blazer (men)',
  },
  {
    id: 'traditional',
    label: 'Indian Royal Kurta',
    category: 'Heritage Ethnic',
    desc: 'Midnight indigo raw silk tunic with authentic gold zari placket',
  },
  {
    id: 'lehenga',
    label: 'Banarasi Lehenga Choli',
    category: 'Couture Festive',
    desc: '24-kali flared skirt with antique zari hem border (women)',
  },
]

const GLB_SLOTS = [
  { id: 'femaleAvatar', name: 'Female Neutral / Average', rig: 'Mixamo 65-bone', height: '170 cm' },
  { id: 'femaleAvatarSlim', name: 'Female Slim Silhouette', rig: 'Mixamo 65-bone', height: '170 cm' },
  { id: 'femaleAvatarAthletic', name: 'Female Athletic Silhouette', rig: 'Mixamo 65-bone', height: '170 cm' },
  { id: 'femaleAvatarPlusSize', name: 'Female Curvy Silhouette', rig: 'Mixamo 65-bone', height: '170 cm' },
  { id: 'maleAvatar', name: 'Male Neutral / Average', rig: 'Mixamo 65-bone', height: '180 cm' },
  { id: 'maleAvatarSlim', name: 'Male Slim Silhouette', rig: 'Mixamo 65-bone', height: '180 cm' },
  { id: 'maleAvatarAthletic', name: 'Male Athletic Silhouette', rig: 'Mixamo 65-bone', height: '180 cm' },
  { id: 'maleAvatarPlusSize', name: 'Male Broad Silhouette', rig: 'Mixamo 65-bone', height: '180 cm' },
]

export default function AvatarStudioPage() {
  const initialConfig = loadAvatarConfig()
  const [gender, setGender] = useState(initialConfig.gender || 'female')
  const [skinToneId, setSkinToneId] = useState(initialConfig.skinToneId || 'warmSand')
  const [pose, setPose] = useState(initialConfig.pose || 'relaxed')
  const [outfit, setOutfit] = useState(initialConfig.outfit || 'undergarment')
  const [accentColor, setAccentColor] = useState(initialConfig.accentColor || '#dfc17b')
  const [cameraView, setCameraView] = useState('front')
  const [zoom, setZoom] = useState('full')
  const [unit, setUnit] = useState('cm') // 'cm' | 'in'
  const [activeTab, setActiveTab] = useState('biometrics') // 'biometrics' | 'styling' | 'accuracy' | 'pipeline'
  const [toast, setToast] = useState(null)
  const [openAccordion, setOpenAccordion] = useState('accuracy-1')

  // Initialize from verified storage if present
  const [hasVerifiedData, setHasVerifiedData] = useState(() => {
    const saved = loadMeasurements()
    return Boolean(saved && Object.keys(saved).length > 0)
  })

  // Biometric Tape Measurements State (stored in cm)
  const [measurements, setMeasurements] = useState(() => {
    const saved = loadMeasurements()
    if (saved) {
      return {
        height: saved.height || saved.heightCm || 168,
        chest: saved.chest || saved.bust || saved.chestCm || 88,
        waist: saved.waist || saved.waistCm || 68,
        hips: saved.hip || saved.hips || saved.hipsCm || 94,
        shoulder: saved.shoulder || saved.shoulderCm || 39,
        inseam: saved.inseam || saved.inseamCm || 76,
      }
    }
    return {
      height: 168,
      chest: 88,
      waist: 68,
      hips: 94,
      shoulder: 39,
      inseam: 76,
    }
  })

  const controlsRef = useRef(null)

  // Standard Baselines for Delta Comparison
  const baseline = useMemo(() => (
    gender === 'female'
      ? { height: 168, chest: 88, waist: 68, hips: 94, shoulder: 39, inseam: 76 }
      : { height: 178, chest: 98, waist: 82, hips: 96, shoulder: 44, inseam: 82 }
  ), [gender])

  // Sync default baseline when gender switches if user hasn't imported custom data
  const handleGenderChange = (newGender) => {
    setGender(newGender)
    if (!hasVerifiedData) {
      if (newGender === 'male') {
        setMeasurements({ height: 178, chest: 98, waist: 82, hips: 96, shoulder: 44, inseam: 82 })
      } else {
        setMeasurements({ height: 168, chest: 88, waist: 68, hips: 94, shoulder: 39, inseam: 76 })
      }
    }
  }

  const handleMeasurementChange = (key, rawValue) => {
    const num = Number(rawValue)
    if (Number.isFinite(num)) {
      setMeasurements((prev) => ({ ...prev, [key]: num }))
    }
  }

  // Import from localStorage explicitly
  const handleImportVerified = () => {
    const saved = loadMeasurements()
    if (saved) {
      setHasVerifiedData(true)
      setMeasurements({
        height: saved.height || saved.heightCm || baseline.height,
        chest: saved.chest || saved.bust || saved.chestCm || baseline.chest,
        waist: saved.waist || saved.waistCm || baseline.waist,
        hips: saved.hip || saved.hips || saved.hipsCm || baseline.hips,
        shoulder: saved.shoulder || saved.shoulderCm || baseline.shoulder,
        inseam: saved.inseam || saved.inseamCm || baseline.inseam,
      })
      showToast('Verified tape measurements loaded from your FITMATE profile')
    } else {
      // Load sample verified measurements
      const demoData = gender === 'female'
        ? { height: 170, chest: 90, waist: 70, hips: 96, shoulder: 40, inseam: 78 }
        : { height: 180, chest: 100, waist: 84, hips: 98, shoulder: 45, inseam: 83 }
      setMeasurements(demoData)
      setHasVerifiedData(true)
      showToast('Applied sample verified body tape profile')
    }
  }

  // Save back to fit profile in localStorage
  const handleSaveToProfile = () => {
    const successMeasurements = saveMeasurements(measurements)
    const successConfig = saveAvatarConfig({ gender, skinToneId, pose, outfit, accentColor })
    if (successMeasurements || successConfig) {
      setHasVerifiedData(true)
      showToast('Digital Twin biometric measurements and avatar profile saved to your FITMATE profile')
    } else {
      showToast('Could not save measurements')
    }
  }

  // Reset to anatomical baseline
  const handleResetBaseline = () => {
    setMeasurements({ ...baseline })
    setHasVerifiedData(false)
    showToast(`Reset to standard ${gender === 'female' ? 'female' : 'male'} anatomical proportions`)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3800)
  }

  const resetCamera = () => {
    setCameraView('front')
    setZoom('full')
    controlsRef.current?.setLookAt(0, 1.2, 5.4, 0, 1.08, 0, true)
  }

  const onControlsReady = useCallback((controls) => {
    controlsRef.current = controls
  }, [])

  // Asset slot lookup for verified GLB pipeline
  const avatarAssetId = getAvatarAssetId(gender, 'average')
  const registeredAsset = sceneAssets[avatarAssetId]

  // Convert for display if inches selected
  const toDisplay = (cm) => (unit === 'cm' ? cm : Math.round(cm / 2.54 * 10) / 10)
  const unitLabel = unit === 'cm' ? 'cm' : 'in'

  return (
    <div className="avatar-studio-page">
      {/* Toast Notification */}
      {toast && (
        <div className="digital-twin-toast" role="status" aria-live="polite">
          <BadgeCheck size={16} className="toast-icon" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="avatar-studio-header">
        <div className="header-left">
          <BrandWordmark to="/" />
          <span className="header-divider" />
          <span className="header-label">3D DIGITAL TWIN LAB</span>
        </div>
        <nav className="header-nav" aria-label="Digital Twin navigation">
          <Link to="/measurements">
            <Ruler size={13} /> Measurement Studio
          </Link>
          <Link to="/virtual-fitting-room">
            <Scissors size={13} /> Fitting Room
          </Link>
          <Link to="/find-my-size">
            <Cpu size={13} /> Size Recommendations
          </Link>
          <Link to="/my-wardrobe">
            <User size={13} /> My Wardrobe
          </Link>
        </nav>
      </header>

      <main className="avatar-studio-main">
        {/* Navigation Breadcrumb */}
        <div className="avatar-studio-topbar">
          <Link className="avatar-studio-back" to="/measurements">
            <ArrowLeft size={14} /> Back to Measurement Studio
          </Link>
          <div className="avatar-status-pill">
            <span className="status-orb pulse" />
            <span>BIOMETRIC SYNTHESIS READY</span>
            <span className="status-separator" />
            <span className="status-sub">Zero Intrusive Scanning · 100% Private</span>
          </div>
        </div>

        {/* Studio Heading & Overview */}
        <div className="avatar-studio-heading">
          <div className="heading-copy">
            <Eyebrow>FITMATE PHOTOREALISTIC HUMAN TWIN</Eyebrow>
            <h1>
              Your Personal <em>3D Digital Twin.</em>
            </h1>
            <p>
              A high-fidelity anatomical human twin sculpted dynamically from your verified tape measurements.
              Experience genuine human proportions, realistic melanin skin physics, and precision garment draping across
              every FITMATE fashion world.
            </p>
          </div>
          <div className="heading-badges">
            <div className="twin-stat-card">
              <span className="stat-num">{measurements.height} <small>cm</small></span>
              <span className="stat-label">Height</span>
            </div>
            <div className="twin-stat-card">
              <span className="stat-num">{measurements.chest} <small>cm</small></span>
              <span className="stat-label">{gender === 'female' ? 'Bust' : 'Chest'}</span>
            </div>
            <div className="twin-stat-card">
              <span className="stat-num">{measurements.waist} <small>cm</small></span>
              <span className="stat-label">Waist</span>
            </div>
            <div className="twin-stat-card">
              <span className="stat-num">{measurements.hips} <small>cm</small></span>
              <span className="stat-label">Hips</span>
            </div>
          </div>
        </div>

        {/* Main 3D Studio Workspace Layout */}
        <section className="avatar-studio-layout" aria-label="3D Digital Twin Viewer and Controls">
          {/* Left Column: Interactive Customisation Deck */}
          <aside className="avatar-controls-panel" aria-label="Digital Twin Controls">
            {/* Tab Switcher */}
            <div className="avatar-panel-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'biometrics'}
                className={activeTab === 'biometrics' ? 'is-active' : ''}
                onClick={() => setActiveTab('biometrics')}
              >
                <Sliders size={13} /> Biometrics
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'styling'}
                className={activeTab === 'styling' ? 'is-active' : ''}
                onClick={() => setActiveTab('styling')}
              >
                <Palette size={13} /> Appearance
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'accuracy'}
                className={activeTab === 'accuracy' ? 'is-active' : ''}
                onClick={() => setActiveTab('accuracy')}
              >
                <ShieldCheck size={13} /> Accuracy
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'pipeline'}
                className={activeTab === 'pipeline' ? 'is-active' : ''}
                onClick={() => setActiveTab('pipeline')}
              >
                <Cpu size={13} /> 3D Pipeline
              </button>
            </div>

            {/* TAB 1: BIOMETRIC CUSTOMISATION */}
            {activeTab === 'biometrics' && (
              <div className="tab-pane biometrics-pane">
                {/* Gender Switcher */}
                <div className="control-card">
                  <div className="card-header">
                    <span className="card-kicker">ANATOMICAL SILHOUETTE</span>
                    <h4>Avatar Biological Frame</h4>
                  </div>
                  <div className="gender-toggle-group" role="group" aria-label="Avatar silhouette frame">
                    <button
                      type="button"
                      className={`gender-btn ${gender === 'female' ? 'is-active' : ''}`}
                      onClick={() => handleGenderChange('female')}
                    >
                      <User size={14} /> Female Form
                    </button>
                    <button
                      type="button"
                      className={`gender-btn ${gender === 'male' ? 'is-active' : ''}`}
                      onClick={() => handleGenderChange('male')}
                    >
                      <User size={14} /> Male Form
                    </button>
                  </div>
                </div>

                {/* Verified Sync & Actions */}
                <div className="control-card sync-card">
                  <div className="sync-status-row">
                    <div className="sync-status-text">
                      <span className="sync-indicator">
                        {hasVerifiedData ? (
                          <>
                            <ShieldCheck size={14} className="icon-verified" /> Verified Tape Profile Active
                          </>
                        ) : (
                          <>
                            <Info size={14} className="icon-default" /> Standard Anatomical Defaults
                          </>
                        )}
                      </span>
                      <small>
                        {hasVerifiedData
                          ? 'Synchronized with your FITMATE profile measurements'
                          : 'Load saved measurements from your profile or adjust sliders below'}
                      </small>
                    </div>
                  </div>

                  <div className="sync-actions-row">
                    <button
                      type="button"
                      className="btn-sync-action"
                      onClick={handleImportVerified}
                      title="Import verified tape measurements from Fit Profile"
                    >
                      <RefreshCw size={13} /> Import Verified Data
                    </button>
                    <button
                      type="button"
                      className="btn-sync-action btn-save"
                      onClick={handleSaveToProfile}
                      title="Save current digital twin proportions to profile"
                    >
                      <Check size={13} /> Save to Profile
                    </button>
                  </div>
                </div>

                {/* Unit Switcher & Measurement Sliders */}
                <div className="control-card sliders-card">
                  <div className="sliders-header">
                    <div>
                      <span className="card-kicker">DYNAMIC DEFORMATION</span>
                      <h4>Tape Proportions</h4>
                    </div>
                    <div className="unit-toggle" role="group" aria-label="Measurement units">
                      <button
                        type="button"
                        className={unit === 'cm' ? 'is-active' : ''}
                        onClick={() => setUnit('cm')}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        className={unit === 'in' ? 'is-active' : ''}
                        onClick={() => setUnit('in')}
                      >
                        in
                      </button>
                    </div>
                  </div>

                  {/* Height Slider */}
                  <div className="slider-group">
                    <div className="slider-label-row">
                      <span>Total Height</span>
                      <div className="val-delta">
                        <strong>
                          {toDisplay(measurements.height)} {unitLabel}
                        </strong>
                        {measurements.height !== baseline.height && (
                          <span className="delta-tag">
                            {measurements.height > baseline.height ? '+' : ''}
                            {toDisplay(measurements.height - baseline.height)} {unitLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="145"
                      max="205"
                      step="1"
                      value={measurements.height}
                      onChange={(e) => handleMeasurementChange('height', e.target.value)}
                      aria-label="Height slider"
                    />
                    <div className="slider-ends">
                      <small>145 cm (4′9″)</small>
                      <small>205 cm (6′9″)</small>
                    </div>
                  </div>

                  {/* Chest / Bust Slider */}
                  <div className="slider-group">
                    <div className="slider-label-row">
                      <span>{gender === 'female' ? 'Bust Circumference' : 'Chest Circumference'}</span>
                      <div className="val-delta">
                        <strong>
                          {toDisplay(measurements.chest)} {unitLabel}
                        </strong>
                        {measurements.chest !== baseline.chest && (
                          <span className="delta-tag">
                            {measurements.chest > baseline.chest ? '+' : ''}
                            {toDisplay(measurements.chest - baseline.chest)} {unitLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="135"
                      step="1"
                      value={measurements.chest}
                      onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                      aria-label="Chest / Bust circumference slider"
                    />
                    <div className="slider-ends">
                      <small>70 cm</small>
                      <small>135 cm</small>
                    </div>
                  </div>

                  {/* Natural Waist Slider */}
                  <div className="slider-group">
                    <div className="slider-label-row">
                      <span>Natural Waist</span>
                      <div className="val-delta">
                        <strong>
                          {toDisplay(measurements.waist)} {unitLabel}
                        </strong>
                        {measurements.waist !== baseline.waist && (
                          <span className="delta-tag">
                            {measurements.waist > baseline.waist ? '+' : ''}
                            {toDisplay(measurements.waist - baseline.waist)} {unitLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="55"
                      max="125"
                      step="1"
                      value={measurements.waist}
                      onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                      aria-label="Natural waist slider"
                    />
                    <div className="slider-ends">
                      <small>55 cm</small>
                      <small>125 cm</small>
                    </div>
                  </div>

                  {/* Full Hips Slider */}
                  <div className="slider-group">
                    <div className="slider-label-row">
                      <span>Full Hips / Seat</span>
                      <div className="val-delta">
                        <strong>
                          {toDisplay(measurements.hips)} {unitLabel}
                        </strong>
                        {measurements.hips !== baseline.hips && (
                          <span className="delta-tag">
                            {measurements.hips > baseline.hips ? '+' : ''}
                            {toDisplay(measurements.hips - baseline.hips)} {unitLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="75"
                      max="140"
                      step="1"
                      value={measurements.hips}
                      onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                      aria-label="Hips slider"
                    />
                    <div className="slider-ends">
                      <small>75 cm</small>
                      <small>140 cm</small>
                    </div>
                  </div>

                  {/* Shoulder Breadth */}
                  <div className="slider-group">
                    <div className="slider-label-row">
                      <span>Shoulder Breadth</span>
                      <div className="val-delta">
                        <strong>
                          {toDisplay(measurements.shoulder)} {unitLabel}
                        </strong>
                        {measurements.shoulder !== baseline.shoulder && (
                          <span className="delta-tag">
                            {measurements.shoulder > baseline.shoulder ? '+' : ''}
                            {toDisplay(measurements.shoulder - baseline.shoulder)} {unitLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="32"
                      max="56"
                      step="1"
                      value={measurements.shoulder}
                      onChange={(e) => handleMeasurementChange('shoulder', e.target.value)}
                      aria-label="Shoulder width slider"
                    />
                    <div className="slider-ends">
                      <small>32 cm</small>
                      <small>56 cm</small>
                    </div>
                  </div>

                  {/* Inseam / Leg Length */}
                  <div className="slider-group">
                    <div className="slider-label-row">
                      <span>Inseam (Leg Length)</span>
                      <div className="val-delta">
                        <strong>
                          {toDisplay(measurements.inseam)} {unitLabel}
                        </strong>
                        {measurements.inseam !== baseline.inseam && (
                          <span className="delta-tag">
                            {measurements.inseam > baseline.inseam ? '+' : ''}
                            {toDisplay(measurements.inseam - baseline.inseam)} {unitLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="98"
                      step="1"
                      value={measurements.inseam}
                      onChange={(e) => handleMeasurementChange('inseam', e.target.value)}
                      aria-label="Inseam slider"
                    />
                    <div className="slider-ends">
                      <small>60 cm</small>
                      <small>98 cm</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-reset-baseline"
                    onClick={handleResetBaseline}
                  >
                    <RotateCcw size={12} /> Reset to Anatomical Baseline
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: APPEARANCE & STYLING */}
            {activeTab === 'styling' && (
              <div className="tab-pane styling-pane">
                {/* Melanin Tone Palette */}
                <div className="control-card">
                  <div className="card-header">
                    <span className="card-kicker">PHYSICALLY BASED SHADING</span>
                    <h4>Melanin Skin Tone Spectrum</h4>
                    <p>Sub-surface scattering approximation with micro-roughness pore simulation.</p>
                  </div>

                  <div className="melanin-swatches-grid" role="radiogroup" aria-label="Melanin skin tone selection">
                    {Object.values(SKIN_TONES).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        role="radio"
                        aria-checked={skinToneId === t.id}
                        className={`melanin-swatch-item ${skinToneId === t.id ? 'is-active' : ''}`}
                        onClick={() => setSkinToneId(t.id)}
                      >
                        <span className="swatch-color" style={{ backgroundColor: t.color }}>
                          {skinToneId === t.id && <Check size={12} className="check-icon" />}
                        </span>
                        <div className="swatch-text">
                          <strong>{t.label}</strong>
                          <small>Roughness {t.roughness}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stance / Pose */}
                <div className="control-card">
                  <div className="card-header">
                    <span className="card-kicker">ANATOMICAL POSITIONING</span>
                    <h4>Pose & Motion Stance</h4>
                  </div>

                  <div className="pose-selector-grid">
                    {avatarPoses.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`pose-btn ${pose === p.id ? 'is-active' : ''}`}
                        onClick={() => setPose(p.id)}
                      >
                        <span className="pose-dot" />
                        <strong>{p.label}</strong>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fashion Outfit Overlays */}
                <div className="control-card">
                  <div className="card-header">
                    <span className="card-kicker">ATELIER GARMENT OVERLAYS</span>
                    <h4>Digital Fit Ensemble</h4>
                  </div>

                  <div className="outfit-options-list">
                    {outfitOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`outfit-btn ${outfit === opt.id ? 'is-active' : ''}`}
                        onClick={() => setOutfit(opt.id)}
                      >
                        <div className="outfit-btn-top">
                          <span className="outfit-category">{opt.category}</span>
                          {outfit === opt.id && <Check size={13} className="check-active" />}
                        </div>
                        <strong>{opt.label}</strong>
                        <p>{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Garment Accent Color */}
                  <div className="color-picker-row">
                    <label htmlFor="accent-color-picker">
                      <span>Garment Accent Tint</span>
                      <small>Customise PBR silk & embroidery threads</small>
                    </label>
                    <div className="picker-input-wrap">
                      <input
                        id="accent-color-picker"
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                      />
                      <span className="color-hex-badge">{accentColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ACCURACY & DISCLAIMERS */}
            {activeTab === 'accuracy' && (
              <div className="tab-pane accuracy-pane">
                <div className="control-card disclaimer-intro-card">
                  <div className="card-header">
                    <ShieldCheck size={20} className="gold-shield-icon" />
                    <h4>Digital Twin Engineering Integrity</h4>
                    <p>
                      FITMATE prioritizes rigorous scientific honesty. We clearly distinguish between verified
                      tape measurements, algorithmic 3D surface deformations, and real-world textile physics.
                    </p>
                  </div>
                </div>

                {/* Disclaimers Accordion */}
                <div className="disclaimers-accordion">
                  {/* Item 1 */}
                  <div className={`accordion-item ${openAccordion === 'accuracy-1' ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="accordion-trigger"
                      onClick={() => setOpenAccordion(openAccordion === 'accuracy-1' ? null : 'accuracy-1')}
                      aria-expanded={openAccordion === 'accuracy-1'}
                    >
                      <div className="trigger-title">
                        <Ruler size={14} className="acc-icon" />
                        <span>Tape Measurements vs 3D Mesh Deformations</span>
                      </div>
                      {openAccordion === 'accuracy-1' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openAccordion === 'accuracy-1' && (
                      <div className="accordion-content">
                        <p>
                          <strong>Verified tape measurements are your single source of truth.</strong> When you input
                          circumferences (bust, waist, hips), the FITMATE 3D engine scales anatomical cross-sections
                          parametrically using biometric ratios.
                        </p>
                        <p>
                          However, 3D polygon meshes deform through procedural vertices. While mathematically proportional,
                          they do not simulate the internal bone structure or individual fat distribution unique to your
                          physique.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Item 2 */}
                  <div className={`accordion-item ${openAccordion === 'accuracy-2' ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="accordion-trigger"
                      onClick={() => setOpenAccordion(openAccordion === 'accuracy-2' ? null : 'accuracy-2')}
                      aria-expanded={openAccordion === 'accuracy-2'}
                    >
                      <div className="trigger-title">
                        <Shield size={14} className="acc-icon" />
                        <span>Zero Intrusive Camera / LiDAR Scanning Notice</span>
                      </div>
                      {openAccordion === 'accuracy-2' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openAccordion === 'accuracy-2' && (
                      <div className="accordion-content">
                        <p>
                          <strong>Your visual privacy is completely respected.</strong> FITMATE does not access your
                          device camera, perform biometric facial recognition, or record depth sensor/LiDAR video streams.
                        </p>
                        <p>
                          All avatars in this studio are generated purely from numerical tape measurements you provide,
                          ensuring no biometric image data is ever captured, analyzed, or stored.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Item 3 */}
                  <div className={`accordion-item ${openAccordion === 'accuracy-3' ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="accordion-trigger"
                      onClick={() => setOpenAccordion(openAccordion === 'accuracy-3' ? null : 'accuracy-3')}
                      aria-expanded={openAccordion === 'accuracy-3'}
                    >
                      <div className="trigger-title">
                        <Scissors size={14} className="acc-icon" />
                        <span>Soft-Tissue Compression & Fabric Limitations</span>
                      </div>
                      {openAccordion === 'accuracy-3' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openAccordion === 'accuracy-3' && (
                      <div className="accordion-content">
                        <p>
                          Garments fit differently depending on undergarments, shapewear, posture, and textile stiffness.
                          A rigid Banarasi brocade behaves differently than an elastic silk-jersey blend.
                        </p>
                        <p>
                          Digital avatars cannot simulate dynamic flesh compressibility or personal sensory comfort (e.g.
                          preferring a snug waistline versus a relaxed drape). Use the Size Recommendations engine for
                          tailored brand ease recommendations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: 3D ASSET INTEGRATION PIPELINE */}
            {activeTab === 'pipeline' && (
              <div className="tab-pane pipeline-pane">
                <div className="control-card">
                  <div className="card-header">
                    <span className="card-kicker">ASSET MANIFEST & RIG AUDIT</span>
                    <h4>Licensed Humanoid GLB Registry</h4>
                    <p>
                      FITMATE follows strict asset honesty: we never pretend primitive shapes are licensed models.
                      The high-fidelity procedural twin renders below while awaiting production GLB ingestions.
                    </p>
                  </div>

                  <div className="glb-slots-list">
                    {GLB_SLOTS.map((slot) => {
                      const isReady = Boolean(sceneAssets[slot.id]?.file)
                      return (
                        <div key={slot.id} className="glb-slot-item">
                          <div className="slot-info">
                            <strong>{slot.name}</strong>
                            <small>{slot.rig} · {slot.height} Reference</small>
                          </div>
                          <span className={`slot-badge ${isReady ? 'is-ready' : 'is-standby'}`}>
                            {isReady ? 'CERTIFIED GLB CONNECTED' : 'PROCEDURAL ENGINE ACTIVE'}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="specs-box">
                    <strong>Asset Integration Standards:</strong>
                    <ul>
                      <li>Humanoid / Mixamo 65-bone skeletal rig with root motion anchor</li>
                      <li>Quad-dominant topology (25,000 – 45,000 polygons)</li>
                      <li>Non-overlapping 4K PBR UDIMs with melanin SSS maps</li>
                      <li>Pre-baked animation clips: idle_a_pose, editorial_stance, catwalk_strut</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Right Column: 3D Viewport & Cinematic Controls */}
          <div className="avatar-viewer-column">
            <div className="avatar-viewer" aria-label="Interactive 3D digital twin viewport">
              {/* Three.js Canvas Scene */}
              <AvatarStudioCanvas
                avatarAssetId={avatarAssetId}
                garmentAssetId={null}
                colour={accentColor}
                heightCm={measurements.height}
                measurements={measurements}
                skinToneId={skinToneId}
                pose={pose}
                outfit={outfit}
                cameraView={cameraView}
                zoom={zoom}
                onControlsReady={onControlsReady}
              />

              {/* Viewport Vignette & Ambient Glow */}
              <div className="avatar-viewer-vignette" aria-hidden="true" />

              {/* Top Viewport Floating Title & HUD */}
              <div className="avatar-viewer-title">
                <div className="title-beacon">
                  <span className="beacon-dot" />
                  <span>PHOTOREALISTIC 3D DIGITAL TWIN</span>
                </div>
                <strong>
                  {gender === 'female' ? 'Female Anatomical Twin' : 'Male Anatomical Twin'} · {SKIN_TONES[skinToneId]?.label}
                </strong>
                <small className="viewport-meta">
                  Height: {measurements.height} cm | Chest: {measurements.chest} cm | Waist: {measurements.waist} cm | Hips: {measurements.hips} cm
                </small>
              </div>

              {/* Floating Asset Pipeline Status Chip */}
              <div className="avatar-pipeline-badge" role="status">
                <span className="badge-orb" />
                <span>
                  {registeredAsset?.file
                    ? `Production GLB: ${registeredAsset.file}`
                    : 'Procedural Anatomical Synthesis Active'}
                </span>
              </div>

              {/* Interaction Hint */}
              <span className="avatar-viewer-tip">
                <span className="avatar-tip-dot" />
                DRAG TO ORBIT 360° <i /> SCROLL TO ZOOM <i /> TWO-FINGER PAN
              </span>

              {/* Studio Frame Marks */}
              <div className="viewport-corner top-left" aria-hidden="true" />
              <div className="viewport-corner top-right" aria-hidden="true" />
              <div className="viewport-corner bottom-left" aria-hidden="true" />
              <div className="viewport-corner bottom-right" aria-hidden="true" />
            </div>

            {/* Camera Angles & Zoom Toolbar */}
            <div className="avatar-viewer-toolbar">
              {/* Angles Group */}
              <div className="toolbar-group">
                <span className="group-label">Camera Angle</span>
                <div className="avatar-angle-buttons" role="group" aria-label="Avatar viewing angle">
                  {cameraViews.map((view) => (
                    <button
                      type="button"
                      key={view.id}
                      aria-pressed={cameraView === view.id}
                      className={cameraView === view.id ? 'is-active' : ''}
                      onClick={() => setCameraView(view.id)}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom Group */}
              <div className="toolbar-group">
                <span className="group-label">Inspection Zoom</span>
                <div className="avatar-zoom-buttons" role="group" aria-label="Avatar camera zoom">
                  <button
                    type="button"
                    aria-pressed={zoom === 'full'}
                    className={zoom === 'full' ? 'is-active' : ''}
                    onClick={() => setZoom('full')}
                  >
                    <Maximize2 size={13} /> Full Body
                  </button>
                  <button
                    type="button"
                    aria-pressed={zoom === 'close'}
                    className={zoom === 'close' ? 'is-active' : ''}
                    onClick={() => setZoom('close')}
                  >
                    <Camera size={13} /> Close-Up
                  </button>
                  <button
                    className="avatar-reset-camera"
                    type="button"
                    onClick={resetCamera}
                    aria-label="Reset camera"
                    title="Reset to default front perspective"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Biometric Summary Ledger */}
            <div className="avatar-asset-ledger">
              <span className="avatar-ledger-light" />
              <div className="ledger-content">
                <strong>BIOMETRIC TWIN STATUS: DEFORMED IN REAL-TIME</strong>
                <p>
                  Proportions dynamically computed from your active tape measurements. Clavicle breadth, bust volume,
                  waist curvature, hip flare, and leg inseam scale mathematically to your silhouette.
                </p>
              </div>
              <div className="ledger-actions">
                <Link to="/measurements" className="btn-ledger-action">
                  Edit Tape Data <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Fashion Multiverse Action Bridges */}
        <section className="digital-twin-bridges" aria-label="Fashion Multiverse Integration">
          <div className="bridges-header">
            <Eyebrow>CONNECTED FASHION MULTIVERSE</Eyebrow>
            <h2>Deploy your <em>Digital Twin</em> across FITMATE</h2>
            <p>Your calibrated 3D twin flows seamlessly into virtual fitting rooms, size engines, and bespoke couture studios.</p>
          </div>

          <div className="bridges-grid">
            <Link to="/virtual-fitting-room" className="bridge-card">
              <div className="bridge-icon-wrap">
                <Scissors size={20} />
              </div>
              <div className="bridge-body">
                <span className="bridge-kicker">3D TRY-ON SUITE</span>
                <h3>Virtual Fitting Room</h3>
                <p>Drape luxury sarees, couture lehengas, and western blazers onto your verified twin with real-time tension mapping.</p>
              </div>
              <span className="bridge-link-arrow">
                Launch Try-On <ArrowRight size={13} />
              </span>
            </Link>

            <Link to="/find-my-size" className="bridge-card">
              <div className="bridge-icon-wrap">
                <Cpu size={20} />
              </div>
              <div className="bridge-body">
                <span className="bridge-kicker">INTELLIGENT FIT ENGINE</span>
                <h3>Size Recommendations</h3>
                <p>Cross-reference your digital twin’s tape measurements across 12 luxury fashion houses including Zara, Sabyasachi, and Armani.</p>
              </div>
              <span className="bridge-link-arrow">
                Find My Size <ArrowRight size={13} />
              </span>
            </Link>

            <Link to="/brand-comparison" className="bridge-card">
              <div className="bridge-icon-wrap">
                <Ruler size={20} />
              </div>
              <div className="bridge-body">
                <span className="bridge-kicker">EASE & TOLERANCE MATRIX</span>
                <h3>Brand Sizing Nuances</h3>
                <p>Inspect ease allowances, chest-to-waist drop cuts, and hem lengths tailored to your verified proportions.</p>
              </div>
              <span className="bridge-link-arrow">
                Compare Brands <ArrowRight size={13} />
              </span>
            </Link>

            <Link to="/fit-passport" className="bridge-card">
              <div className="bridge-icon-wrap">
                <FileText size={20} />
              </div>
              <div className="bridge-body">
                <span className="bridge-kicker">PORTABLE FIT IDENTITY</span>
                <h3>Digital Fit Passport</h3>
                <p>Generate a cryptographically verified fit credential and QR card to take your body measurements to any bespoke atelier.</p>
              </div>
              <span className="bridge-link-arrow">
                View Passport <ArrowRight size={13} />
              </span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
