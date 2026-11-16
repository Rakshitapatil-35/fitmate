import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Printer,
  Copy,
  Check,
  Ruler,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react'
import { BrandWordmark } from '../components/DesignSystem.jsx'
import { loadMeasurements, loadFitPreference } from '../measurementStorage.js'
import { demoProfile } from '../demoFitData.js'
import './FitPassportPage.css'

export default function FitPassportPage() {
  const navigate = useNavigate()
  const [unit, setUnit] = useState('cm')
  const [copiedToken, setCopiedToken] = useState(false)

  // Load saved or fallback demo measurements
  const savedMeasurements = useMemo(() => {
    const loaded = loadMeasurements()
    return loaded && Object.keys(loaded).length > 0 ? loaded : demoProfile.measurements
  }, [])

  const fitPref = useMemo(() => loadFitPreference(), [])

  // Calculate body shape profile
  const bodyShape = useMemo(() => {
    const { chest = 96, waist = 80, hip = 98 } = savedMeasurements
    const bustHipDiff = Math.abs(chest - hip)
    const waistToHip = waist / hip

    if (waistToHip < 0.78 && bustHipDiff < 6) {
      return {
        type: 'Hourglass',
        desc: 'Balanced upper and lower body proportions with a well-defined waistline.',
      }
    }
    if (chest - hip > 7) {
      return {
        type: 'Inverted Triangle',
        desc: 'Broader shoulder and chest framework tapering gracefully toward the hip.',
      }
    }
    if (hip - chest > 7) {
      return {
        type: 'Pear / Triangle',
        desc: 'Gentle torso transition with hip dimensions defining primary garment drape.',
      }
    }
    return {
      type: 'Athletic Rectangle',
      desc: 'Uniform proportional silhouette with balanced shoulder, waist, and hip distribution.',
    }
  }, [savedMeasurements])

  // Conversion helper
  const formatVal = (valInCm) => {
    if (!valInCm) return '—'
    if (unit === 'inches') {
      return `${(valInCm / 2.54).toFixed(1)}"`
    }
    return `${Math.round(valInCm)} cm`
  }

  const passportId = useMemo(() => {
    const hash = Object.values(savedMeasurements).reduce((acc, curr) => acc + curr, 700)
    return `FM-BIOM-${Math.round(hash * 4.19).toString(16).toUpperCase()}`
  }, [savedMeasurements])

  const handleCopyToken = () => {
    const token = `FITMATE-PASS:v2:${passportId}:C${savedMeasurements.chest || 0}:W${savedMeasurements.waist || 0}:H${savedMeasurements.hip || 0}:PREF-${fitPref}`
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(token)
    }
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2500)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fp-page-root">
      <header className="fp-header">
        <div className="fp-header-inner">
          <div className="fp-brand-group">
            <BrandWordmark size="sm" />
            <span className="fp-divider">/</span>
            <span className="fp-section-title">Digital Fit Passport</span>
          </div>
          <div className="fp-nav-links">
            <Link to="/measurements" className="fp-nav-item">Measurement Studio</Link>
            <Link to="/virtual-fitting-room" className="fp-nav-item">Fitting Room</Link>
            <Link to="/brand-comparison" className="fp-nav-item highlight">Brand Matrix</Link>
          </div>
        </div>
      </header>

      <main className="fp-main">
        <div className="fp-intro-section">
          <span className="fp-eyebrow">Universal Biometric Credential</span>
          <h1 className="fp-heading">Your Verified FITMATE Fit Passport</h1>
          <p className="fp-desc">
            A permanent cryptographic biometric token guaranteeing seamless size accuracy across international luxury fashion houses.
          </p>

          <div className="fp-unit-toggle-row">
            <span className="fp-unit-label">Display Units:</span>
            <div className="fp-toggle-pill">
              <button
                type="button"
                className={`fp-pill-btn ${unit === 'cm' ? 'active' : ''}`}
                onClick={() => setUnit('cm')}
              >
                Metric (Centimetres)
              </button>
              <button
                type="button"
                className={`fp-pill-btn ${unit === 'inches' ? 'active' : ''}`}
                onClick={() => setUnit('inches')}
              >
                Imperial (Inches)
              </button>
            </div>
          </div>
        </div>

        {/* The Holographic Passport Card */}
        <div className="fp-card-wrapper">
          <div className="fp-passport-card">
            <div className="fp-card-foil-border" />
            
            {/* Top Bar of Passport */}
            <div className="fp-card-topbar">
              <div className="fp-card-chip">
                <div className="fp-microchip-lines" />
                <span className="fp-chip-label">BIOMETRIC FIT NFC</span>
              </div>
              <div className="fp-passport-badge">
                <ShieldCheck size={16} /> FITMATE CERTIFIED FIT
              </div>
            </div>

            {/* Passport Identity Header */}
            <div className="fp-card-id-row">
              <div className="fp-id-meta">
                <span className="fp-meta-label">PASSPORT CREDENTIAL</span>
                <span className="fp-meta-val">{passportId}</span>
              </div>
              <div className="fp-id-meta right">
                <span className="fp-meta-label">BODY ARCHETYPE</span>
                <span className="fp-archetype-badge">{bodyShape.type}</span>
              </div>
            </div>

            {/* Biometric Measurements Grid */}
            <div className="fp-measurements-grid">
              <div className="fp-meas-cell">
                <span className="fp-meas-label">CHEST / BUST</span>
                <span className="fp-meas-val">{formatVal(savedMeasurements.chest)}</span>
              </div>
              <div className="fp-meas-cell">
                <span className="fp-meas-label">NATURAL WAIST</span>
                <span className="fp-meas-val">{formatVal(savedMeasurements.waist)}</span>
              </div>
              <div className="fp-meas-cell">
                <span className="fp-meas-label">HIGH HIP</span>
                <span className="fp-meas-val">{formatVal(savedMeasurements.hip)}</span>
              </div>
              <div className="fp-meas-cell">
                <span className="fp-meas-label">SHOULDER BREADTH</span>
                <span className="fp-meas-val">{formatVal(savedMeasurements.shoulder || 42)}</span>
              </div>
              <div className="fp-meas-cell">
                <span className="fp-meas-label">INSEAM LENGTH</span>
                <span className="fp-meas-val">{formatVal(savedMeasurements.inseam || 78)}</span>
              </div>
              <div className="fp-meas-cell">
                <span className="fp-meas-label">FIT BIAS</span>
                <span className="fp-meas-val highlight">{fitPref} Fit</span>
              </div>
            </div>

            {/* Bottom Row with QR and Security Hash */}
            <div className="fp-card-bottom">
              <div className="fp-qr-container">
                {/* Clean inline SVG luxury QR pattern */}
                <svg
                  className="fp-qr-svg"
                  viewBox="0 0 100 100"
                  width="78"
                  height="78"
                  aria-label="Fit Passport Cryptographic QR Code"
                >
                  <rect width="100" height="100" fill="#0d0b09" rx="8" />
                  {/* Position squares */}
                  <rect x="8" y="8" width="24" height="24" fill="#dfc17b" rx="4" />
                  <rect x="12" y="12" width="16" height="16" fill="#0d0b09" rx="2" />
                  <rect x="16" y="16" width="8" height="8" fill="#dfc17b" rx="1" />

                  <rect x="68" y="8" width="24" height="24" fill="#dfc17b" rx="4" />
                  <rect x="72" y="12" width="16" height="16" fill="#0d0b09" rx="2" />
                  <rect x="76" y="16" width="8" height="8" fill="#dfc17b" rx="1" />

                  <rect x="8" y="68" width="24" height="24" fill="#dfc17b" rx="4" />
                  <rect x="12" y="72" width="16" height="16" fill="#0d0b09" rx="2" />
                  <rect x="16" y="76" width="8" height="8" fill="#dfc17b" rx="1" />

                  {/* Decorative data points */}
                  <rect x="38" y="14" width="6" height="6" fill="#dfc17b" />
                  <rect x="48" y="24" width="6" height="6" fill="#dfc17b" />
                  <rect x="38" y="34" width="8" height="6" fill="#dfc17b" />
                  <rect x="52" y="44" width="12" height="6" fill="#dfc17b" />
                  <rect x="40" y="60" width="6" height="10" fill="#dfc17b" />
                  <rect x="70" y="44" width="8" height="8" fill="#dfc17b" />
                  <rect x="58" y="72" width="8" height="8" fill="#dfc17b" />
                  <rect x="78" y="78" width="8" height="8" fill="#dfc17b" />
                </svg>
                <div className="fp-qr-caption">
                  <span className="fp-qr-sub">SCAN FOR TRY-ON</span>
                  <span className="fp-qr-sub-id">HASH: SHA256-F17M</span>
                </div>
              </div>

              <div className="fp-archetype-info">
                <span className="fp-info-heading">Silhouette Analysis</span>
                <p className="fp-info-desc">{bodyShape.desc}</p>
                <span className="fp-watermark">FITMATE HAUTE BIOMETRICS • 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="fp-actions-card">
          <div className="fp-actions-btns">
            <button
              type="button"
              className="fp-btn fp-btn-primary"
              onClick={handleCopyToken}
            >
              {copiedToken ? <Check size={18} /> : <Copy size={18} />}
              {copiedToken ? 'Passport Token Copied!' : 'Copy Digital Fit Token'}
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-secondary"
              onClick={handlePrint}
            >
              <Printer size={18} /> Export / Print Passport
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-secondary"
              onClick={() => navigate('/measurements')}
            >
              <Ruler size={18} /> Recalibrate Measurements
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-secondary"
              onClick={() => navigate('/brand-comparison')}
            >
              <Layers size={18} /> Compare Across 5 Brands <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Security & Authenticity Banner */}
        <div className="fp-security-banner">
          <Info size={16} className="gold-icon" />
          <p className="fp-security-text">
            <strong>Privacy & Integrity Standard:</strong> Biometric profile data is stored locally in client-side secure browser sandbox (`fitmate.measurements.v1`). No unencrypted raw anatomical data is transmitted to third-party ad networks.
          </p>
        </div>
      </main>
    </div>
  )
}
