import { useMemo, useState } from 'react'
import {
  Check,
  Compass,
  Crown,
  Heart,
  Info,
  Palette,
  Shirt,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toggleSavedProduct } from '../measurementStorage.js'
import './PersonalStylistPage.css'

const OCCASIONS = [
  { id: 'royal-wedding', label: 'Royal Wedding & Sangeet', audience: 'Women', icon: Crown },
  { id: 'black-tie', label: 'Black Tie Sartorial Gala', audience: 'Men', icon: Sparkles },
  { id: 'diwali-soiree', label: 'Festive Diwali Soirée', audience: 'Women', icon: Palette },
  { id: 'cocktail', label: 'Contemporary Cocktail Night', audience: 'Women', icon: Compass },
  { id: 'executive', label: 'Haute Executive Boardroom', audience: 'Men', icon: Shirt },
]

const STYLES = ['Opulent Heritage', 'Minimalist Haute', 'Modern Fusion', 'Sculpted Tailoring']

const CURATED_LOOKS = {
  'royal-wedding': {
    title: 'Maharani Crimson & Zari Banarasi Ensemble',
    subtitle: 'Heirloom 24-Kali Royal Flare with Emerald Polki Notes',
    description: 'A sovereign crimson Banarasi silk lehenga enriched with pure gold supplementary-weft floral jaal, paired with an embroidered organza veil and hand-crafted jutti slippers.',
    garments: [
      { piece: 'Primary Garment', item: '24-Kali Banarasi Silk Lehenga', fabric: 'Banarasi Silk & Gold Zari', color: '#9b2438' },
      { piece: 'Blouse', item: 'Zardozi Hand-Embroidered Choli', fabric: 'Raw Silk', color: '#851b2a' },
      { piece: 'Drape & Veil', item: 'Zari Bordered Sheer Dupatta', fabric: 'Silk Organza', color: '#d8c7ad' },
      { piece: 'Footwear', item: 'Gilded Velvet Mojari Slippers', fabric: 'Lacquered Velvet', color: '#d4af37' },
    ],
    tryOnRoute: '/virtual-fitting-room?audience=Women&category=Traditional%20wear&clothingType=Lehenga%20choli',
    category: 'Traditional wear',
  },
  'black-tie': {
    title: 'The Obsidian Silk Peak-Lapel Tuxedo',
    subtitle: 'Bespoke Double-Breasted Dinner Suit with Grosgrain Facing',
    description: 'Precision Italian wool tuxedo tailored with sculpted roped shoulders, silk grosgrain lapels, and high-twist satin trousers, paired with patent calfskin oxford shoes.',
    garments: [
      { piece: 'Tuxedo Jacket', item: 'Double-Breasted Wool Dinner Jacket', fabric: 'Fine Worsted Wool & Grosgrain Silk', color: '#121417' },
      { piece: 'Shirt', item: 'Marcella Pleated Bib Dress Shirt', fabric: 'Egyptian Giza Cotton', color: '#ffffff' },
      { piece: 'Trousers', item: 'Satin Braided Evening Trousers', fabric: 'Worsted Wool', color: '#16181b' },
      { piece: 'Footwear', item: 'High-Gloss Wholecut Patent Shoes', fabric: 'Calfskin Leather', color: '#090a0c' },
    ],
    tryOnRoute: '/virtual-fitting-room?audience=Men&category=Tops&clothingType=Blazer',
    category: 'Tops',
  },
  'diwali-soiree': {
    title: 'Marigold & Sindoor Silk Anarkali Ensemble',
    subtitle: 'Luminous 32-Kali Flare with Golden Gota-Patti Finish',
    description: 'A radiant festive ensemble capturing the spirit of celebration with dipping jewel neckline, fluid georgette drape, and shimmering brass diya embellishments.',
    garments: [
      { piece: 'Couture Tunic', item: '32-Kali Mysore Silk Anarkali', fabric: 'Mysore Silk', color: '#c0263f' },
      { piece: 'Bottom', item: 'Pleated Silk Churidar', fabric: 'Stretch Raw Silk', color: '#983a40' },
      { piece: 'Stole', item: 'Gota-Patti Embellished Dupatta', fabric: 'Flowing Georgette', color: '#e5a93c' },
      { piece: 'Accessories', item: 'Gold-Wrapped Diya Clutch', fabric: 'Embroidered Silk', color: '#d4af37' },
    ],
    tryOnRoute: '/virtual-fitting-room?audience=Women&category=Traditional%20wear&clothingType=Anarkali',
    category: 'Traditional wear',
  },
  'cocktail': {
    title: 'Fluid Bias-Cut Silk Evening Slip Gown',
    subtitle: 'Minimalist Architectural Gown in Champagne Rose',
    description: 'Effortless bias-cut silk satin that contours to the body’s natural lines with cowl neckline, floor-skimming column flare, and metallic stiletto pumps.',
    garments: [
      { piece: 'Evening Gown', item: 'Bias-Cut Silk Column Slip Dress', fabric: 'Heavy Weight Silk Satin', color: '#9b6659' },
      { piece: 'Outer Layer', item: 'Cropped Cashmere Tuxedo Capelet', fabric: 'Double-Faced Cashmere', color: '#2b2320' },
      { piece: 'Footwear', item: 'Ankle-Strap Metallic Stilettos', fabric: 'Calfskin & Gold Leaf', color: '#dfc17b' },
      { piece: 'Jewelry', item: 'Sculpted Golden Choker', fabric: 'Polished Brass & Pearl', color: '#d4af37' },
    ],
    tryOnRoute: '/virtual-fitting-room?audience=Women&category=Dresses&clothingType=Dress',
    category: 'Dresses',
  },
  'executive': {
    title: 'The Savile Row Double-Cloth Navy Blazer',
    subtitle: 'Hand-Canvassed Structured Blazer with Horn Buttons',
    description: 'A commanding contemporary sartorial ensemble designed for international summits, tailored from Scottish hopsack wool with hand-stitched pick lapels.',
    garments: [
      { piece: 'Blazer', item: 'Structured Hopsack Wool Blazer', fabric: 'Super 150s Worsted Wool', color: '#1a273a' },
      { piece: 'Trousers', item: 'Forward-Pleated Flannel Trousers', fabric: 'Wool Flannel', color: '#55504a' },
      { piece: 'Shirt', item: 'Semi-Spread Collar Twill Shirt', fabric: 'Sea Island Cotton', color: '#f7f6f2' },
      { piece: 'Footwear', item: 'Cap-Toe Hand-Burnished Oxfords', fabric: 'Full-Grain Calfskin', color: '#241b16' },
    ],
    tryOnRoute: '/virtual-fitting-room?audience=Men&category=Tops&clothingType=Blazer',
    category: 'Tops',
  },
}

export default function PersonalStylistPage() {
  const [selectedOccasion, setSelectedOccasion] = useState('royal-wedding')
  const [selectedStyle, setSelectedStyle] = useState('Opulent Heritage')
  const [budgetTier, setBudgetTier] = useState('Couture')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const activeLook = useMemo(
    () => CURATED_LOOKS[selectedOccasion] ?? CURATED_LOOKS['royal-wedding'],
    [selectedOccasion]
  )

  const handleSaveLookToWardrobe = () => {
    toggleSavedProduct({
      id: `stylist-look-${selectedOccasion}`,
      name: activeLook.title,
      brand: 'FITMATE Haute Atelier',
      collection: selectedOccasion.replace('-', ' '),
      category: activeLook.category,
      price: budgetTier === 'Couture' ? 175000 : 85000,
      fabric: activeLook.garments[0]?.fabric,
      clothingType: activeLook.garments[0]?.item,
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="personal-stylist-universe">
      <div className="stylist-container">
        {/* Header */}
        <header className="stylist-header">
          <span className="stylist-kicker">
            <Sparkles size={13} />
            FITMATE AI CONCIERGE & STYLIST
          </span>
          <h1>Your Personal Haute Couture Stylist</h1>
          <p className="stylist-tagline">
            Curated silhouettes, heirloom textiles and complete occasionwear ensembles mapped directly to your 3D fitting room.
          </p>

          <div className="stylist-demo-banner" role="status">
            <Info size={15} />
            <span>
              <strong>Stylist Algorithm:</strong> Rule-based couture coordination engine modelled on bespoke atelier standards until our live AI service is connected.
            </span>
          </div>
        </header>

        {/* 2-Column Styling Layout */}
        <div className="stylist-stage-grid">
          {/* Left Column: Preference Selectors */}
          <section className="stylist-controls-panel" aria-label="Style Customisation Options">
            {/* 1. Occasion Selection */}
            <div className="control-group">
              <label className="control-label">01 · SELECT YOUR OCCASION</label>
              <div className="occasions-pills-grid">
                {OCCASIONS.map((occ) => {
                  const OccIcon = occ.icon
                  return (
                    <button
                      key={occ.id}
                      type="button"
                      className={`btn-occasion-pill ${selectedOccasion === occ.id ? 'is-active' : ''}`}
                      onClick={() => setSelectedOccasion(occ.id)}
                    >
                      <OccIcon size={16} className="occ-icon" />
                      <div className="occ-info">
                        <strong>{occ.label}</strong>
                        <span>{occ.audience}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Aesthetic Direction */}
            <div className="control-group">
              <label className="control-label">02 · AESTHETIC DIRECTION</label>
              <div className="styles-row">
                {STYLES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`btn-style-chip ${selectedStyle === st ? 'is-active' : ''}`}
                    onClick={() => setSelectedStyle(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Budget & Tier */}
            <div className="control-group">
              <label className="control-label">03 · INVESTMENT LEVEL</label>
              <div className="budget-row">
                {['Accessible Luxury', 'Designer Ready-to-Wear', 'Haute Couture'].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    className={`btn-budget-pill ${budgetTier === tier ? 'is-active' : ''}`}
                    onClick={() => setBudgetTier(tier)}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column: Curated Ensemble Card */}
          <main className="stylist-ensemble-card" aria-label="Curated Fashion Ensemble">
            <div className="ensemble-header">
              <span className="ensemble-badge">{selectedStyle} · {budgetTier}</span>
              <h2>{activeLook.title}</h2>
              <p className="ensemble-subtitle">{activeLook.subtitle}</p>
              <p className="ensemble-desc">{activeLook.description}</p>
            </div>

            {/* Garments Breakdown */}
            <div className="ensemble-pieces-list">
              <span className="pieces-title">CURATED 4-PIECE ENSEMBLE</span>
              {activeLook.garments.map((g, idx) => (
                <div key={idx} className="ensemble-piece-row">
                  <div className="piece-color-dot" style={{ background: g.color }} />
                  <div className="piece-details">
                    <strong className="piece-name">{g.item}</strong>
                    <span className="piece-meta">{g.piece} · {g.fabric}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="ensemble-actions-row">
              <Link to={activeLook.tryOnRoute} className="btn-stylist-tryon">
                <UserCheck size={16} />
                Try Ensemble in 3D Fitting Room
              </Link>
              <button
                type="button"
                className={`btn-stylist-save ${savedSuccess ? 'is-saved' : ''}`}
                onClick={handleSaveLookToWardrobe}
              >
                {savedSuccess ? <Check size={16} /> : <Heart size={16} />}
                {savedSuccess ? 'Saved to 3D Wardrobe!' : 'Save Look to Wardrobe'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
