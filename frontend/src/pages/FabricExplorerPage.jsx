import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Sliders,
  Compass,
  Shirt,
  ArrowRight,
  Info,
  Check,
  RotateCcw,
} from 'lucide-react'
import { BrandWordmark } from '../components/DesignSystem.jsx'
import CoutureMannequin from '../three/CoutureMannequin.jsx'
import { fabricPresets } from '../three/fabricMaterialLibrary.js'
import { textileDiscoveries } from '../textileDiscoveryData.js'
import './FabricExplorerPage.css'

// Enriched textile metadata
const TEXTILE_METRICS = {
  silk: { gsm: '75 - 110 GSM', drape: 'Fluid & Cascading', care: 'Dry Clean Only • Steam Drape', origin: 'Mulberry Silkworm Filament' },
  'banarasi-silk': { gsm: '180 - 240 GSM', drape: 'Rich & Structured Flare', care: 'Specialist Dry Clean • Gold Polish', origin: 'Varanasi, Uttar Pradesh' },
  'kanjivaram-silk': { gsm: '200 - 260 GSM', drape: 'Architectural Regal Drape', care: 'Roll Wrap in Muslin Cloth', origin: 'Kanchipuram, Tamil Nadu' },
  'mysore-silk': { gsm: '65 - 85 GSM', drape: 'Ultra-Supple Soft Fall', care: 'Delicate Silk Cleanser', origin: 'Mysuru, Karnataka' },
  cotton: { gsm: '120 - 160 GSM', drape: 'Crisp Natural Structure', care: 'Gentle Cold Cycle', origin: 'Organic Combed Long-Staple' },
  linen: { gsm: '140 - 200 GSM', drape: 'Dry Sculptural Fall', care: 'Steam Press While Damp', origin: 'Flax Bast Fiber' },
  velvet: { gsm: '280 - 360 GSM', drape: 'Substantial Heavy Pillar', care: 'Steam Only • Never Iron Flat', origin: 'Dense Silk/Rayon Pile' },
  georgette: { gsm: '60 - 90 GSM', drape: 'Breezy Micro-Crinkle', care: 'Delicate Hand Wash or Dry Clean', origin: 'High-Twist Silk Weave' },
  chiffon: { gsm: '35 - 55 GSM', drape: 'Weightless Cloud Float', care: 'Gentle Dry Clean Only', origin: 'Fine Twisted Filament' },
  organza: { gsm: '40 - 65 GSM', drape: 'Crisp Glassmorphic Volume', care: 'Low Heat Press with Pressing Cloth', origin: 'Tightly Twisted Sheer Silk' },
  satin: { gsm: '110 - 150 GSM', drape: 'High-Liquid Fluidity', care: 'Dry Clean Only', origin: 'Supplementary Weft Filament' },
  denim: { gsm: '340 - 420 GSM', drape: 'Rigid Architectural Workwear', care: 'Inside-Out Cold Wash', origin: '3x1 Right-Hand Twill Cotton' },
  wool: { gsm: '240 - 320 GSM', drape: 'Tailored Sartorial Memory', care: 'Brush & Dry Clean', origin: 'Super 150s Merino Fiber' },
  'zari-gold': { gsm: '220 - 310 GSM', drape: 'Metallic Royal Armour Drape', care: 'Museum Storage with Acid-Free Tissue', origin: 'Silver Thread Gilded in 24K Gold' },
  'zardozi-velvet': { gsm: '380 - 480 GSM', drape: 'Imperial Heavy Drape', care: 'Restoration Specialist Dry Clean', origin: 'Raised Metallic Wire Handwork' },
  'chikankari-cotton': { gsm: '80 - 110 GSM', drape: 'Airy Featherlight Drape', care: 'Gentle Hand Soak with Mild Soap', origin: 'Lucknow Shadow Embroidery' },
  'bandhani-silk': { gsm: '90 - 130 GSM', drape: 'Textured Rippled Drape', care: 'Dry Clean to Retain Crinkle Nodes', origin: 'Gujarat & Rajasthan Knot Resist' },
  'mirror-work-georgette': { gsm: '160 - 220 GSM', drape: 'Shimmering Liquid Weight', care: 'Dry Clean • Protect Glass Shisha', origin: 'Kutch Traditional Shisha Work' },
  'brocade-royal': { gsm: '240 - 320 GSM', drape: 'Imperial Flared Volume', care: 'Dry Clean Only', origin: 'Kashi Supplementary Jaal' },
  leather: { gsm: '450 - 600 GSM', drape: 'Supple Moulding Fit', care: 'Condition Annually with Leather Balm', origin: 'Full-Grain Tuscan Calfskin' },
}

export default function FabricExplorerPage() {
  const navigate = useNavigate()
  const [selectedPresetId, setSelectedPresetId] = useState('banarasi-silk')
  const [filterType, setFilterType] = useState('all')

  // Find active preset
  const activePreset = useMemo(() => {
    return fabricPresets.find((p) => p.id === selectedPresetId) || fabricPresets[0]
  }, [selectedPresetId])

  // Custom PBR overrides
  const [roughness, setRoughness] = useState(activePreset.roughness)
  const [metalness, setMetalness] = useState(activePreset.metalness)
  const [clearcoat, setClearcoat] = useState(activePreset.clearcoat || 0.1)

  // Update slider states when preset switches
  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id)
    setRoughness(preset.roughness)
    setMetalness(preset.metalness)
    setClearcoat(preset.clearcoat || 0.1)
  }

  // Cross reference heritage description
  const heritageInfo = useMemo(() => {
    const discovery = textileDiscoveries.find(
      (td) => td.id === selectedPresetId || selectedPresetId.includes(td.id)
    )
    const metrics = TEXTILE_METRICS[selectedPresetId] || {
      gsm: '160 - 220 GSM',
      drape: 'Balanced Medium Drape',
      care: 'Specialist Dry Clean Recommended',
      origin: 'Curated Luxury Mill',
    }

    return {
      description: discovery?.description || activePreset.note,
      region: discovery?.region || metrics.origin,
      kind: discovery?.kind || 'Couture Material Weave',
      ...metrics,
    }
  }, [selectedPresetId, activePreset])

  // Filtered list
  const filteredPresets = useMemo(() => {
    if (filterType === 'all') return fabricPresets
    if (filterType === 'ethnic') {
      return fabricPresets.filter((p) =>
        ['banarasi-silk', 'kanjivaram-silk', 'mysore-silk', 'zari-gold', 'zardozi-velvet', 'chikankari-cotton', 'bandhani-silk', 'mirror-work-georgette', 'brocade-royal'].includes(p.id)
      )
    }
    if (filterType === 'western') {
      return fabricPresets.filter((p) =>
        ['silk', 'cotton', 'linen', 'velvet', 'satin', 'denim', 'wool', 'leather'].includes(p.id)
      )
    }
    if (filterType === 'sheer') {
      return fabricPresets.filter((p) =>
        ['georgette', 'chiffon', 'organza', 'net'].includes(p.id)
      )
    }
    return fabricPresets
  }, [filterType])

  return (
    <div className="fe-page-root">
      <header className="fe-header">
        <div className="fe-header-inner">
          <div className="fe-brand-group">
            <BrandWordmark size="sm" />
            <span className="fe-divider">/</span>
            <span className="fe-section-title">Fabric Explorer & Material Lab</span>
          </div>
          <div className="fe-nav-links">
            <Link to="/runway" className="fe-nav-item">Runway Catwalk</Link>
            <Link to="/outfit-builder" className="fe-nav-item">3D Outfit Builder</Link>
            <Link to="/virtual-fitting-room" className="fe-nav-item highlight">3D Fitting Room</Link>
          </div>
        </div>
      </header>

      <main className="fe-layout">
        {/* Left Column: 3D Mannequin with Active Fabric Drape */}
        <section className="fe-stage-section">
          <div className="fe-canvas-container">
            <CoutureMannequin
              fabricPreset={selectedPresetId}
              accentColor={activePreset.color}
              silhouette={
                ['banarasi-silk', 'kanjivaram-silk', 'zardozi-velvet', 'brocade-royal'].includes(selectedPresetId)
                  ? 'lehenga'
                  : ['zari-gold', 'mysore-silk', 'chikankari-cotton'].includes(selectedPresetId)
                    ? 'kurta'
                    : 'blazer'
              }
            />
            <div className="fe-canvas-caption">
              <span className="fe-live-tag">
                <Sparkles size={13} /> PBR Physical Material Simulation
              </span>
              <p className="fe-live-text">
                Rendering {activePreset.label} with micro-weave bump displacement and physical specular sheen.
              </p>
            </div>
          </div>

          {/* Interactive PBR Sliders */}
          <div className="fe-sliders-card">
            <div className="fe-sliders-header">
              <div className="fe-sliders-title">
                <Sliders size={16} className="gold-icon" />
                <span>Real-Time PBR Surface Modifiers</span>
              </div>
              <button
                type="button"
                className="fe-reset-btn"
                onClick={() => {
                  setRoughness(activePreset.roughness)
                  setMetalness(activePreset.metalness)
                  setClearcoat(activePreset.clearcoat || 0.1)
                }}
              >
                <RotateCcw size={13} /> Defaults
              </button>
            </div>

            <div className="fe-sliders-grid">
              <div className="fe-slider-row">
                <div className="fe-slider-label-row">
                  <span>Surface Roughness (Diffuse Scat.)</span>
                  <strong>{roughness.toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.01"
                  value={roughness}
                  onChange={(e) => setRoughness(parseFloat(e.target.value))}
                  className="fe-range-input"
                />
              </div>

              <div className="fe-slider-row">
                <div className="fe-slider-label-row">
                  <span>Metallic / Zari Specular Sheen</span>
                  <strong>{metalness.toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="0.95"
                  step="0.01"
                  value={metalness}
                  onChange={(e) => setMetalness(parseFloat(e.target.value))}
                  className="fe-range-input"
                />
              </div>

              <div className="fe-slider-row">
                <div className="fe-slider-label-row">
                  <span>Clearcoat Gloss / Glaze</span>
                  <strong>{clearcoat.toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="0.80"
                  step="0.01"
                  value={clearcoat}
                  onChange={(e) => setClearcoat(parseFloat(e.target.value))}
                  className="fe-range-input"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Textile Catalog & Technical Specs */}
        <section className="fe-details-section">
          <div className="fe-details-header">
            <div>
              <span className="fe-eyebrow">{heritageInfo.kind}</span>
              <h1 className="fe-heading">{activePreset.label}</h1>
              <span className="fe-origin-pill">
                <Compass size={13} /> {heritageInfo.region}
              </span>
            </div>
            <div className="fe-color-swatch-box" style={{ backgroundColor: activePreset.color }}>
              <span className="fe-swatch-hex">{activePreset.color}</span>
            </div>
          </div>

          <p className="fe-description">{heritageInfo.description}</p>

          {/* Technical Specs Metric Cards */}
          <div className="fe-specs-grid">
            <div className="fe-spec-card">
              <span className="fe-spec-label">TEXTILE WEIGHT</span>
              <strong className="fe-spec-val">{heritageInfo.gsm}</strong>
            </div>
            <div className="fe-spec-card">
              <span className="fe-spec-label">DRAPE KINETICS</span>
              <strong className="fe-spec-val">{heritageInfo.drape}</strong>
            </div>
            <div className="fe-spec-card">
              <span className="fe-spec-label">WEAVE CONSTRUCT</span>
              <strong className="fe-spec-val capitalize">{activePreset.weave} Weave</strong>
            </div>
            <div className="fe-spec-card">
              <span className="fe-spec-label">CARE PROTOCOL</span>
              <strong className="fe-spec-val">{heritageInfo.care}</strong>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="fe-filter-row">
            <span className="fe-filter-label">Filter Collection:</span>
            <div className="fe-filter-pills">
              {[
                { id: 'all', label: 'All 22 Textiles' },
                { id: 'ethnic', label: 'Indian Heritage' },
                { id: 'western', label: 'Western Luxury' },
                { id: 'sheer', label: 'Sheers & Crepes' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`fe-filter-btn ${filterType === filter.id ? 'active' : ''}`}
                  onClick={() => setFilterType(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textile Grid Swatches */}
          <div className="fe-swatches-grid">
            {filteredPresets.map((preset) => {
              const isSelected = preset.id === selectedPresetId
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`fe-swatch-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <div
                    className="fe-card-color-dot"
                    style={{ backgroundColor: preset.color }}
                  />
                  <div className="fe-card-info">
                    <span className="fe-card-name">{preset.label}</span>
                    <span className="fe-card-weave">{preset.weave}</span>
                  </div>
                  {isSelected && <Check size={14} className="fe-active-check" />}
                </button>
              )
            })}
          </div>

          {/* Action button */}
          <div className="fe-action-wrap">
            <button
              type="button"
              className="fe-fitting-room-btn"
              onClick={() =>
                navigate('/virtual-fitting-room', {
                  state: {
                    presetGarment: {
                      fabric: selectedPresetId,
                      color: activePreset.color,
                      colorName: activePreset.label,
                    },
                  },
                })
              }
            >
              <Shirt size={18} /> Apply {activePreset.label} in 3D Fitting Room <ArrowRight size={18} />
            </button>
          </div>

          <div className="fe-disclaimer">
            <Info size={14} />
            <span>
              Material values reflect calibrated real-time physically based shader models (PBR). In-person tactile sensation and light refraction depend upon environmental ambient exposure and yarn twist.
            </span>
          </div>
        </section>
      </main>
    </div>
  )
}
