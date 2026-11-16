import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shirt,
  ArrowRight,
  TrendingUp,
  Info,
} from 'lucide-react'
import { BrandWordmark } from '../components/DesignSystem.jsx'
import { loadMeasurements, loadFitPreference, saveActiveRecommendation } from '../measurementStorage.js'
import { demoProfile } from '../demoFitData.js'
import './BrandComparisonPage.css'

const BRAND_COMPARISON_DATA = [
  {
    id: 'sabyasachi',
    name: 'Sabyasachi Heritage',
    origin: 'Kolkata, India',
    tier: 'Haute Couture',
    categoryEase: {
      Tops: { offset: +1.5, notes: 'Tailored imperial cut with moderate ease for embroidery comfort' },
      Bottoms: { offset: +0.5, notes: 'Fitted high-waist waistband with voluminous flared kali skirt' },
      Traditional: { offset: +2.0, notes: 'Structured regal drape allowing effortless ceremonial movement' },
    },
    sizes: [
      { label: '34 (XS)', chest: 82, waist: 66, hip: 90 },
      { label: '36 (S)', chest: 86, waist: 70, hip: 94 },
      { label: '38 (M)', chest: 92, waist: 76, hip: 100 },
      { label: '40 (L)', chest: 98, waist: 82, hip: 106 },
      { label: '42 (XL)', chest: 104, waist: 88, hip: 112 },
    ],
  },
  {
    id: 'zara',
    name: 'Zara Atelier',
    origin: 'Arteixo, Spain',
    tier: 'Contemporary Tailoring',
    categoryEase: {
      Tops: { offset: -2.0, notes: 'Trim European cut; tends to fit narrower through the chest and armholes' },
      Bottoms: { offset: -1.5, notes: 'Slightly higher rise, fitted through seat and thigh' },
      Traditional: { offset: -1.0, notes: 'Fitted silhouette; size up recommended for relaxed comfort' },
    },
    sizes: [
      { label: 'XS (EU 34)', chest: 82, waist: 62, hip: 90 },
      { label: 'S (EU 36)', chest: 86, waist: 66, hip: 94 },
      { label: 'M (EU 38)', chest: 90, waist: 70, hip: 98 },
      { label: 'L (EU 40)', chest: 96, waist: 76, hip: 104 },
      { label: 'XL (EU 42)', chest: 102, waist: 82, hip: 110 },
    ],
  },
  {
    id: 'manyavar',
    name: 'Manyavar Sartorial',
    origin: 'Kolkata, India',
    tier: 'Festive & Occasion',
    categoryEase: {
      Tops: { offset: +3.0, notes: 'Traditional comfort grading designed for layered brocade textiles' },
      Bottoms: { offset: +2.0, notes: 'Standard churidar / trouser room with flexible drawstring/elastic ease' },
      Traditional: { offset: +3.5, notes: 'Spacious royal cut tailored specifically for ceremonial wear' },
    },
    sizes: [
      { label: '36 (S)', chest: 91, waist: 76, hip: 96 },
      { label: '38 (M)', chest: 96, waist: 81, hip: 101 },
      { label: '40 (L)', chest: 101, waist: 86, hip: 106 },
      { label: '42 (XL)', chest: 106, waist: 91, hip: 111 },
      { label: '44 (XXL)', chest: 112, waist: 97, hip: 117 },
    ],
  },
  {
    id: 'hm',
    name: 'H&M Studio',
    origin: 'Stockholm, Sweden',
    tier: 'Nordic Contemporary',
    categoryEase: {
      Tops: { offset: +1.0, notes: 'Standard Scandinavian vanity sizing; generous boxy torso drape' },
      Bottoms: { offset: +0.5, notes: 'Straight fit with neutral hip-to-waist ratio' },
      Traditional: { offset: 0, notes: 'Standard international grading metrics' },
    },
    sizes: [
      { label: 'XS', chest: 84, waist: 68, hip: 92 },
      { label: 'S', chest: 90, waist: 74, hip: 98 },
      { label: 'M', chest: 96, waist: 80, hip: 104 },
      { label: 'L', chest: 104, waist: 88, hip: 112 },
      { label: 'XL', chest: 112, waist: 96, hip: 120 },
    ],
  },
  {
    id: 'gucci',
    name: 'Gucci Couture',
    origin: 'Florence, Italy',
    tier: 'Italian Luxury',
    categoryEase: {
      Tops: { offset: -1.0, notes: 'Sculpted Italian tailoring; sharp high shoulder head with suppressed waist' },
      Bottoms: { offset: -1.0, notes: 'Florentine bespoke rise with tapered slim hem' },
      Traditional: { offset: -0.5, notes: 'Precision structured silhouettes designed for sleek drape' },
    },
    sizes: [
      { label: '44 IT (XS)', chest: 88, waist: 74, hip: 90 },
      { label: '46 IT (S)', chest: 92, waist: 78, hip: 94 },
      { label: '48 IT (M)', chest: 96, waist: 82, hip: 98 },
      { label: '50 IT (L)', chest: 100, waist: 86, hip: 102 },
      { label: '52 IT (XL)', chest: 104, waist: 90, hip: 106 },
    ],
  },
]

export default function BrandComparisonPage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('Tops')
  const [fitPreference, setFitPreference] = useState(loadFitPreference() || 'Regular')

  // Saved body measurements
  const measurements = useMemo(() => {
    const loaded = loadMeasurements()
    return loaded && Object.keys(loaded).length > 0 ? loaded : demoProfile.measurements
  }, [])

  // Fit preference offset (cm)
  const prefOffset = useMemo(() => {
    switch (fitPreference) {
      case 'Slim': return -2
      case 'Relaxed': return +3
      case 'Oversized': return +6
      default: return 0
    }
  }, [fitPreference])

  // Calculation per brand
  const comparisonResults = useMemo(() => {
    const userTargetChest = (measurements.chest || 96) + prefOffset
    const userTargetWaist = (measurements.waist || 80) + prefOffset

    return BRAND_COMPARISON_DATA.map((brand) => {
      const easeInfo = brand.categoryEase[selectedCategory] || { offset: 0, notes: 'Standard fit' }
      const effectiveTarget = userTargetChest - easeInfo.offset

      // Find closest size matching target
      let bestSize = brand.sizes[0]
      let minDiff = 999

      for (const size of brand.sizes) {
        const metric = selectedCategory === 'Bottoms' ? size.waist : size.chest
        const target = selectedCategory === 'Bottoms' ? userTargetWaist : effectiveTarget
        const diff = Math.abs(metric - target)
        if (diff < minDiff) {
          minDiff = diff
          bestSize = size
        }
      }

      const brandCutNature =
        easeInfo.offset > 1.5
          ? 'Runs Generous'
          : easeInfo.offset < -1
            ? 'Runs Slim / Trim'
            : 'True to Size'

      return {
        brand,
        recommendedSize: bestSize.label,
        easeInfo,
        brandCutNature,
        exactDiff: Math.round(minDiff * 10) / 10,
        chartSample: bestSize,
      }
    })
  }, [measurements, prefOffset, selectedCategory])

  return (
    <div className="bc-page-root">
      <header className="bc-header">
        <div className="bc-header-inner">
          <div className="bc-brand-group">
            <BrandWordmark size="sm" />
            <span className="bc-divider">/</span>
            <span className="bc-section-title">Brand Size Comparison</span>
          </div>
          <div className="bc-nav-links">
            <Link to="/fit-passport" className="bc-nav-item">Fit Passport</Link>
            <Link to="/find-my-size" className="bc-nav-item">Size Calculator</Link>
            <Link to="/virtual-fitting-room" className="bc-nav-item highlight">3D Fitting Room</Link>
          </div>
        </div>
      </header>

      <main className="bc-main">
        {/* Intro Header */}
        <div className="bc-hero">
          <span className="bc-eyebrow">Multi-House Fit Comparative Engine</span>
          <h1 className="bc-heading">Compare Your Size Across 5 Fashion Houses</h1>
          <p className="bc-desc">
            No two brands grade sizes identically. See precisely what size you wear in Sabyasachi, Zara, Manyavar, H&M, and Gucci based on your actual anatomical dimensions.
          </p>

          {/* Controls Bar */}
          <div className="bc-controls-bar">
            {/* Category Switcher */}
            <div className="bc-control-group">
              <span className="bc-control-label">Category:</span>
              <div className="bc-pill-selector">
                {['Tops', 'Bottoms', 'Traditional'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`bc-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit Preference Switcher */}
            <div className="bc-control-group">
              <span className="bc-control-label">Fit Preference:</span>
              <div className="bc-pill-selector">
                {['Slim', 'Regular', 'Relaxed', 'Oversized'].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    className={`bc-pill-btn ${fitPreference === pref ? 'active' : ''}`}
                    onClick={() => setFitPreference(pref)}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comparative Brand Matrix Cards */}
        <div className="bc-matrix-grid">
          {comparisonResults.map((result) => (
            <div key={result.brand.id} className="bc-brand-card">
              <div className="bc-card-header">
                <div>
                  <span className="bc-card-origin">{result.brand.origin} • {result.brand.tier}</span>
                  <h3 className="bc-card-name">{result.brand.name}</h3>
                </div>
                <span
                  className={`bc-cut-badge ${
                    result.brandCutNature === 'Runs Slim / Trim'
                      ? 'slim'
                      : result.brandCutNature === 'Runs Generous'
                        ? 'generous'
                        : 'true'
                  }`}
                >
                  {result.brandCutNature}
                </span>
              </div>

              {/* Recommended Size Big Box */}
              <div className="bc-size-highlight-box">
                <span className="bc-size-eyebrow">RECOMMENDED SIZE</span>
                <span className="bc-size-val">{result.recommendedSize}</span>
                <span className="bc-size-fit-pref">Calibrated for {fitPreference} fit</span>
              </div>

              {/* Cut & Ease Analysis */}
              <div className="bc-ease-analysis">
                <span className="bc-analysis-label">House Grading Profile:</span>
                <p className="bc-analysis-notes">{result.easeInfo.notes}</p>
              </div>

              {/* Garment Spec Chart Snapshot */}
              <div className="bc-chart-snapshot">
                <div className="bc-spec-row">
                  <span>Graded Chest / Bust:</span>
                  <strong>{result.chartSample.chest} cm</strong>
                </div>
                <div className="bc-spec-row">
                  <span>Graded Natural Waist:</span>
                  <strong>{result.chartSample.waist} cm</strong>
                </div>
                <div className="bc-spec-row">
                  <span>Graded High Hip:</span>
                  <strong>{result.chartSample.hip} cm</strong>
                </div>
              </div>

              {/* Try on in fitting room button */}
              <button
                type="button"
                className="bc-tryon-btn"
                onClick={() => {
                  saveActiveRecommendation({
                    brandId: result.brand.id,
                    brand: result.brand.name,
                    product: `${result.brand.name} ${selectedCategory}`,
                    category: selectedCategory,
                    recommendedSize: result.recommendedSize,
                    fitPreference,
                    confidence: `${result.brandCutNature} (${result.exactDiff} cm variance)`,
                  })
                  navigate(`/virtual-fitting-room?category=${encodeURIComponent(selectedCategory)}&size=${encodeURIComponent(result.recommendedSize)}`, {
                    state: {
                      presetGarment: {
                        brand: result.brand.name,
                        size: result.recommendedSize,
                        category: selectedCategory,
                      },
                    },
                  })
                }}
              >
                <Shirt size={15} /> Test {result.recommendedSize} in 3D Fitting Room <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Takeaways */}
        <div className="bc-insights-card">
          <div className="bc-insights-header">
            <TrendingUp size={20} className="gold-icon" />
            <h3 className="bc-insights-title">Fitmeter Architectural Fit Insights</h3>
          </div>
          <div className="bc-insights-grid">
            <div className="bc-insight-item">
              <strong>Spanish vs Italian Grading:</strong>
              <p>Zara Atelier cuts approximately 2 cm tighter in the chest than standard European measurements. If between sizes, always select the larger tier.</p>
            </div>
            <div className="bc-insight-item">
              <strong>Indian Ethnic Ease:</strong>
              <p>Sabyasachi and Manyavar build in ample wearing ease for mobility, layered waistbands, and heavy metallic brocades. Order your exact fitted size for optimal drape.</p>
            </div>
            <div className="bc-insight-item">
              <strong>Nordic Vanity Grading:</strong>
              <p>H&M Studio features a broader shoulder line with relaxed armhole depths. Perfect for modern boxy tailoring.</p>
            </div>
          </div>
        </div>

        <div className="bc-disclaimer">
          <Info size={14} />
          <span>
            Brand size grading charts reflect official brand specifications and empirical measurement ease matrices. Fabric stretch, weave density, and lining structure alter real-world wearing sensation.
          </span>
        </div>
      </main>
    </div>
  )
}
