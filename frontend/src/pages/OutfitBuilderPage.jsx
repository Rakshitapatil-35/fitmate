import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Layers3,
  Shirt,
  BookmarkCheck,
  RotateCw,
  ChevronRight,
  Info,
} from 'lucide-react'
import { BrandWordmark } from '../components/DesignSystem.jsx'
import CoutureMannequin from '../three/CoutureMannequin.jsx'
import { toggleSavedProduct } from '../measurementStorage.js'
import './OutfitBuilderPage.css'

const WARDROBE_SLOTS = {
  tops: [
    {
      id: 'top-1',
      name: 'Mulberry Silk Evening Shirt',
      brand: 'Zara Atelier',
      category: 'Tops',
      silhouette: 'shirt',
      color: '#dfc17b',
      colorName: 'Champagne Gold Silk',
      fabric: 'silk',
      price: '€ 280',
      tag: 'Couture',
      formality: 9,
    },
    {
      id: 'top-2',
      name: 'Kashmiri Tilla Embroidered Kurta',
      brand: 'Sabyasachi Heritage',
      category: 'Traditional',
      silhouette: 'kurta',
      color: '#16233b',
      colorName: 'Badshahi Navy',
      fabric: 'banarasi-silk',
      price: '₹ 45,000',
      tag: 'Heritage',
      formality: 10,
    },
    {
      id: 'top-3',
      name: 'Structured Barathea Peak Lapel Blazer',
      brand: 'Gucci Couture',
      category: 'Outerwear',
      silhouette: 'blazer',
      color: '#1a1816',
      colorName: 'Midnight Obsidian',
      fabric: 'wool',
      price: '€ 1,950',
      tag: 'Black Tie',
      formality: 10,
    },
    {
      id: 'top-4',
      name: 'Slub Linen Architectural Tunic',
      brand: 'Atelier Morrow',
      category: 'Tops',
      silhouette: 'shirt',
      color: '#f4ede2',
      colorName: 'Royal Ecru Linen',
      fabric: 'linen',
      price: '€ 195',
      tag: 'Relaxed',
      formality: 6,
    },
  ],
  bottoms: [
    {
      id: 'bot-1',
      name: '24-Kali Flared Banarasi Skirt',
      brand: 'Sabyasachi Heritage',
      category: 'Lehenga',
      silhouette: 'lehenga',
      color: '#8f1d2e',
      colorName: 'Sindoor Crimson & Zari',
      fabric: 'banarasi-silk',
      price: '₹ 1,20,000',
      tag: 'Bridal',
      formality: 10,
    },
    {
      id: 'bot-2',
      name: 'High-Waist Pleated Barathea Trouser',
      brand: 'Raymond Sartorial',
      category: 'Bottoms',
      silhouette: 'trousers',
      color: '#121418',
      colorName: 'Sartorial Tuxedo Black',
      fabric: 'wool',
      price: '₹ 18,500',
      tag: 'Tailored',
      formality: 9,
    },
    {
      id: 'bot-3',
      name: 'Crushed Chanderi Tiered Sharara',
      brand: 'Raw Mango',
      category: 'Traditional',
      silhouette: 'sharara',
      color: '#d4af37',
      colorName: 'Gilded Ochre',
      fabric: 'chanderi',
      price: '₹ 38,000',
      tag: 'Occasion',
      formality: 8,
    },
    {
      id: 'bot-4',
      name: 'Raw Japanese Selvedge Trouser',
      brand: 'Northline Studio',
      category: 'Bottoms',
      silhouette: 'jeans',
      color: '#283344',
      colorName: 'Deep Indigo Twill',
      fabric: 'denim',
      price: '€ 240',
      tag: 'Contemporary',
      formality: 5,
    },
  ],
  outerwear: [
    {
      id: 'out-1',
      name: 'Royal Zardozi Velvet Achkan Coat',
      brand: 'Manyavar Sartorial',
      category: 'Outerwear',
      silhouette: 'sherwani',
      color: '#4a1525',
      colorName: 'Imperial Maroon Velvet',
      fabric: 'velvet',
      price: '₹ 62,000',
      tag: 'Grand Gala',
      formality: 10,
    },
    {
      id: 'out-2',
      name: 'Tissue Organza Dupatta Cape with Marodi Work',
      brand: 'Tarun Tahiliani',
      category: 'Drapes',
      silhouette: 'dupatta',
      color: '#dfc17b',
      colorName: 'Champagne Tissue',
      fabric: 'organza',
      price: '₹ 34,000',
      tag: 'Couture Drape',
      formality: 9,
    },
    {
      id: 'out-3',
      name: 'Double-Faced Cashmere Duster Coat',
      brand: 'Atelier Morrow',
      category: 'Outerwear',
      silhouette: 'blazer',
      color: '#b09e85',
      colorName: 'Camel Cashmere',
      fabric: 'wool',
      price: '€ 1,450',
      tag: 'Winter Soirée',
      formality: 8,
    },
    {
      id: 'out-4',
      name: 'None (Solo Ensemble)',
      brand: 'FITMATE Studio',
      category: 'Minimal',
      silhouette: 'none',
      color: '#888888',
      colorName: 'Clear Layer',
      fabric: 'silk',
      price: '—',
      tag: 'Streamlined',
      formality: 7,
    },
  ],
  accessories: [
    {
      id: 'acc-1',
      name: 'Gilded Minaudière Evening Clutch',
      brand: 'FITMATE Leather Goods',
      category: 'Accessories',
      silhouette: 'handbag',
      color: '#d4af37',
      colorName: 'Gilded Onyx',
      fabric: 'leather',
      price: '€ 850',
      tag: 'Evening',
      formality: 10,
    },
    {
      id: 'acc-2',
      name: 'Handcrafted Zari Embroidered Mojaris',
      brand: 'Sabyasachi Heritage',
      category: 'Footwear',
      silhouette: 'shoes',
      color: '#8f1d2e',
      colorName: 'Crimson Velvet & Zari',
      fabric: 'velvet',
      price: '₹ 19,500',
      tag: 'Traditional',
      formality: 9,
    },
    {
      id: 'acc-3',
      name: 'Polished Italian Calfskin Oxfords',
      brand: 'Raymond Sartorial',
      category: 'Footwear',
      silhouette: 'shoes',
      color: '#1a1816',
      colorName: 'Patent Black Calf',
      fabric: 'leather',
      price: '€ 420',
      tag: 'Black Tie',
      formality: 10,
    },
  ],
}

export default function OutfitBuilderPage() {
  const navigate = useNavigate()
  const [selectedTop, setSelectedTop] = useState(WARDROBE_SLOTS.tops[0])
  const [selectedBottom, setSelectedBottom] = useState(WARDROBE_SLOTS.bottoms[0])
  const [selectedOuterwear, setSelectedOuterwear] = useState(WARDROBE_SLOTS.outerwear[1])
  const [selectedAccessory, setSelectedAccessory] = useState(WARDROBE_SLOTS.accessories[0])
  const [activeCategory, setActiveCategory] = useState('tops')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Calculate style harmony score
  const avgFormality = Math.round(
    (selectedTop.formality +
      selectedBottom.formality +
      selectedOuterwear.formality +
      selectedAccessory.formality) /
      4
  )
  const isColorMatched =
    selectedTop.color === selectedBottom.color ||
    (selectedTop.fabric.includes('silk') && selectedBottom.fabric.includes('silk'))
  const harmonyScore = Math.min(99, 84 + (isColorMatched ? 8 : 4) + (avgFormality >= 8 ? 6 : 2))

  const handleSaveLook = () => {
    const outfitItem = {
      id: `outfit-${selectedTop.id}-${selectedBottom.id}`,
      audience: 'All',
      collection: 'Custom 3D Ensembles',
      category: 'Ensemble',
      clothingType: 'Complete Look',
      brandId: 'fitmate-couture',
      brand: 'FITMATE Haute Studio',
      productName: `${selectedTop.name} & ${selectedBottom.name}`,
      name: `${selectedTop.name} & ${selectedBottom.name}`,
      occasion: avgFormality >= 9 ? 'Gala & Haute Couture' : 'Curated Evening',
      garmentAssetId: 'garmentBridalLehenga',
      silhouette: selectedBottom.silhouette === 'lehenga' ? 'lehenga' : 'blazer',
      fabric: selectedTop.fabric,
      color: selectedTop.color,
      colorName: `${selectedTop.colorName} + ${selectedBottom.colorName}`,
      price: 'Curated Ensemble',
      notes: `Top: ${selectedTop.name} (${selectedTop.brand}) | Bottom: ${selectedBottom.name} (${selectedBottom.brand}) | Layer: ${selectedOuterwear.name}`,
    }

    toggleSavedProduct(outfitItem)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3500)
  }

  const handleFittingRoomTryOn = () => {
    navigate('/virtual-fitting-room', {
      state: {
        presetGarment: {
          id: selectedBottom.id,
          name: `${selectedTop.name} with ${selectedBottom.name}`,
          brand: selectedTop.brand,
          silhouette: selectedBottom.silhouette,
          fabric: selectedTop.fabric,
          color: selectedTop.color,
          colorName: selectedTop.colorName,
        },
      },
    })
  }

  return (
    <div className="ob-page-root">
      <header className="ob-header">
        <div className="ob-header-inner">
          <div className="ob-brand-group">
            <BrandWordmark size="sm" />
            <span className="ob-divider">/</span>
            <span className="ob-section-title">3D Outfit Builder</span>
          </div>
          <div className="ob-nav-links">
            <Link to="/runway" className="ob-nav-item">Runway Catwalk</Link>
            <Link to="/personal-stylist" className="ob-nav-item">Stylist Concierge</Link>
            <Link to="/virtual-fitting-room" className="ob-nav-item highlight">3D Fitting Room</Link>
          </div>
        </div>
      </header>

      <main className="ob-layout">
        {/* Left: 3D Interactive Mannequin Preview */}
        <section className="ob-stage-panel">
          <div className="ob-stage-canvas-wrap">
            <CoutureMannequin
              fabricPreset={selectedTop.fabric}
              accentColor={selectedTop.color}
              silhouette={selectedBottom.silhouette === 'lehenga' ? 'lehenga' : 'kurta'}
            />
            <div className="ob-stage-overlay">
              <span className="ob-stage-badge">
                <Sparkles size={14} /> Live 3D Layering Mannequin
              </span>
              <p className="ob-stage-sub">
                Rotating silhouette responding dynamically to selected textile & palette
              </p>
            </div>
          </div>

          <div className="ob-harmony-card">
            <div className="ob-harmony-header">
              <div className="ob-harmony-title-wrap">
                <Layers3 size={18} className="gold-icon" />
                <span className="ob-harmony-title">Ensemble Harmony Score</span>
              </div>
              <span className="ob-harmony-num">{harmonyScore}%</span>
            </div>
            <div className="ob-harmony-bar-bg">
              <div className="ob-harmony-bar-fill" style={{ width: `${harmonyScore}%` }} />
            </div>
            <div className="ob-harmony-meta">
              <span>Formality Rating: {avgFormality}/10</span>
              <span>•</span>
              <span>Palette Cohesion: {isColorMatched ? 'Monochromatic Elegance' : 'Contrasting Accent'}</span>
            </div>
          </div>
        </section>

        {/* Right: Slot Selectors & Item Catalog */}
        <section className="ob-control-panel">
          <div className="ob-panel-header">
            <div>
              <span className="ob-eyebrow">Haute Couture Atelier</span>
              <h1 className="ob-heading">Curate Your 4-Piece Look</h1>
            </div>
            <button
              type="button"
              className="ob-reset-btn"
              onClick={() => {
                setSelectedTop(WARDROBE_SLOTS.tops[0])
                setSelectedBottom(WARDROBE_SLOTS.bottoms[0])
                setSelectedOuterwear(WARDROBE_SLOTS.outerwear[1])
                setSelectedAccessory(WARDROBE_SLOTS.accessories[0])
              }}
              title="Reset ensemble"
            >
              <RotateCw size={15} /> Reset
            </button>
          </div>

          {/* Layer Category Selector Tabs */}
          <div className="ob-slot-tabs" role="tablist">
            {[
              { id: 'tops', label: '1. Top Silhouette', item: selectedTop },
              { id: 'bottoms', label: '2. Bottoms / Skirt', item: selectedBottom },
              { id: 'outerwear', label: '3. Layer / Cape', item: selectedOuterwear },
              { id: 'accessories', label: '4. Footwear & Bags', item: selectedAccessory },
            ].map((slot) => (
              <button
                key={slot.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === slot.id}
                className={`ob-slot-tab ${activeCategory === slot.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(slot.id)}
              >
                <span className="ob-slot-num">{slot.label}</span>
                <span className="ob-slot-cur">{slot.item.name}</span>
              </button>
            ))}
          </div>

          {/* Garment Grid for active category */}
          <div className="ob-items-grid">
            {WARDROBE_SLOTS[activeCategory].map((garment) => {
              const isSelected =
                (activeCategory === 'tops' && selectedTop.id === garment.id) ||
                (activeCategory === 'bottoms' && selectedBottom.id === garment.id) ||
                (activeCategory === 'outerwear' && selectedOuterwear.id === garment.id) ||
                (activeCategory === 'accessories' && selectedAccessory.id === garment.id)

              return (
                <div
                  key={garment.id}
                  className={`ob-item-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (activeCategory === 'tops') setSelectedTop(garment)
                    else if (activeCategory === 'bottoms') setSelectedBottom(garment)
                    else if (activeCategory === 'outerwear') setSelectedOuterwear(garment)
                    else if (activeCategory === 'accessories') setSelectedAccessory(garment)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (activeCategory === 'tops') setSelectedTop(garment)
                      else if (activeCategory === 'bottoms') setSelectedBottom(garment)
                      else if (activeCategory === 'outerwear') setSelectedOuterwear(garment)
                      else if (activeCategory === 'accessories') setSelectedAccessory(garment)
                    }
                  }}
                >
                  <div className="ob-item-color-chip" style={{ backgroundColor: garment.color }} />
                  <div className="ob-item-details">
                    <div className="ob-item-header">
                      <span className="ob-item-brand">{garment.brand}</span>
                      <span className="ob-item-tag">{garment.tag}</span>
                    </div>
                    <h3 className="ob-item-name">{garment.name}</h3>
                    <div className="ob-item-footer">
                      <span className="ob-item-price">{garment.price}</span>
                      <span className="ob-item-fabric">{garment.fabric}</span>
                    </div>
                  </div>
                  {isSelected && <span className="ob-selected-check">✓ Active Layer</span>}
                </div>
              )
            })}
          </div>

          {/* Action Row */}
          <div className="ob-actions-row">
            <button
              type="button"
              className="ob-primary-action"
              onClick={handleFittingRoomTryOn}
            >
              <Shirt size={18} /> Try Outfit in 3D Fitting Room <ChevronRight size={18} />
            </button>
            <button
              type="button"
              className={`ob-secondary-action ${saveSuccess ? 'saved' : ''}`}
              onClick={handleSaveLook}
            >
              <BookmarkCheck size={18} />
              {saveSuccess ? 'Ensemble Saved to Wardrobe!' : 'Save Look to Wardrobe'}
            </button>
          </div>

          <div className="ob-disclaimer-note">
            <Info size={14} />
            <span>
              Real 3D garment drape studies represent mathematical mesh simulations. Sourced high-poly brand GLBs render directly on compatible WebGL2 devices.
            </span>
          </div>
        </section>
      </main>
    </div>
  )
}
