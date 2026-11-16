import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  History,
  Shirt,
  Trash2,
  BookmarkCheck,
  Calendar,
} from 'lucide-react'
import { BrandWordmark } from '../components/DesignSystem.jsx'
import {
  loadRecentChecks,
  toggleSavedProduct,
} from '../measurementStorage.js'
import './FitHistoryPage.css'

const DEMO_HISTORY_LOGS = [
  {
    id: 'chk-1',
    brandId: 'sabyasachi-heritage',
    brand: 'Sabyasachi Heritage',
    product: 'Royal Kashi Banarasi Lehenga',
    category: 'Traditional',
    size: '38 (M)',
    fitPreference: 'Regular',
    date: '14 Nov 2026',
    feedback: 'Flawless Drape',
    status: 'In Wardrobe',
  },
  {
    id: 'chk-2',
    brandId: 'zara-atelier',
    brand: 'Zara Atelier',
    product: 'Mulberry Silk Evening Shirt',
    category: 'Tops',
    size: 'L',
    fitPreference: 'Relaxed',
    date: '10 Nov 2026',
    feedback: 'True to Size',
    status: 'Purchased',
  },
  {
    id: 'chk-3',
    brandId: 'raymond-sartorial',
    brand: 'Raymond Sartorial',
    product: 'Sartorial Midnight Barathea Tuxedo',
    category: 'Tailoring',
    size: '40 Regular',
    fitPreference: 'Slim',
    date: '02 Nov 2026',
    feedback: 'Bespoke Fit',
    status: 'In Wardrobe',
  },
  {
    id: 'chk-4',
    brandId: 'raw-mango-couture',
    brand: 'Raw Mango',
    product: 'Temple Border Kanjivaram Silk Saree',
    category: 'Sarees',
    size: 'Free Size Drape',
    fitPreference: 'Regular',
    date: '28 Oct 2026',
    feedback: 'Flawless Drape',
    status: 'Tried On',
  },
]

export default function FitHistoryPage() {
  const navigate = useNavigate()
  const [historyItems, setHistoryItems] = useState(() => {
    const stored = loadRecentChecks()
    if (stored && stored.length > 0) {
      return stored.map((item, index) => ({
        id: `recent-${index}`,
        brandId: item.brandId,
        brand: item.brand,
        product: item.product,
        category: item.category,
        size: item.size,
        fitPreference: item.fitPreference || 'Regular',
        date: item.checkedAt ? new Date(item.checkedAt).toLocaleDateString('en-GB') : 'Recent',
        status: 'Calibrated',
      }))
    }
    return DEMO_HISTORY_LOGS
  })
  const [feedbackMap, setFeedbackMap] = useState({})

  const handleSetFeedback = (id, feedback) => {
    setFeedbackMap((prev) => ({
      ...prev,
      [id]: feedback,
    }))
  }

  const handleSaveToWardrobe = (item) => {
    toggleSavedProduct({
      id: `history-${item.id}`,
      audience: 'All',
      collection: 'History Saved',
      category: item.category,
      clothingType: item.category,
      brandId: item.brandId,
      brand: item.brand,
      productName: item.product,
      name: item.product,
      occasion: 'Specialist Fit',
      silhouette: 'blazer',
      fabric: 'silk',
      color: '#dfc17b',
      colorName: 'Champagne History Spec',
      price: 'Fit Calibrated',
    })
  }

  const handleClearHistory = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('fitmate.recent-checks.v1')
    }
    setHistoryItems([])
  }

  return (
    <div className="fh-page-root">
      <header className="fh-header">
        <div className="fh-header-inner">
          <div className="fh-brand-group">
            <BrandWordmark size="sm" />
            <span className="fh-divider">/</span>
            <span className="fh-section-title">Fit History & Feedback</span>
          </div>
          <div className="fh-nav-links">
            <Link to="/fit-passport" className="fh-nav-item">Fit Passport</Link>
            <Link to="/brand-comparison" className="fh-nav-item">Brand Matrix</Link>
            <Link to="/my-wardrobe" className="fh-nav-item highlight">My Wardrobe</Link>
          </div>
        </div>
      </header>

      <main className="fh-main">
        {/* Hero & Analytics Banner */}
        <div className="fh-hero">
          <span className="fh-eyebrow">Personal Sizing Ledger</span>
          <h1 className="fh-heading">Your Garment Fit History</h1>
          <p className="fh-desc">
            Track past size recommendations, rate garment wearing accuracy, and review the sizing precision of every fashion house you shop.
          </p>

          <div className="fh-stats-grid">
            <div className="fh-stat-card">
              <span className="fh-stat-num">{historyItems.length}</span>
              <span className="fh-stat-label">Recommendations Logged</span>
            </div>
            <div className="fh-stat-card">
              <span className="fh-stat-num">96.4%</span>
              <span className="fh-stat-label">Verified Fit Accuracy</span>
            </div>
            <div className="fh-stat-card">
              <span className="fh-stat-num">0%</span>
              <span className="fh-stat-label">Size Return Rate</span>
            </div>
            <div className="fh-stat-card">
              <span className="fh-stat-num">~45 min</span>
              <span className="fh-stat-label">Fitting Room Time Saved</span>
            </div>
          </div>
        </div>

        {/* History Table / Cards */}
        <div className="fh-history-section">
          <div className="fh-section-header">
            <div className="fh-section-title-wrap">
              <History size={18} className="gold-icon" />
              <h2 className="fh-section-title-text">Past Size Consultations</h2>
            </div>
            {historyItems.length > 0 && (
              <button
                type="button"
                className="fh-clear-btn"
                onClick={handleClearHistory}
              >
                <Trash2 size={14} /> Clear Ledger
              </button>
            )}
          </div>

          {historyItems.length === 0 ? (
            <div className="fh-empty-state">
              <Shirt size={38} className="fh-empty-icon" />
              <h3>No size consultations logged yet</h3>
              <p>Explore fashion worlds or test garments in Find My Size to build your sizing ledger.</p>
              <Link to="/find-my-size" className="fh-empty-btn">
                Run Size Recommendation
              </Link>
            </div>
          ) : (
            <div className="fh-cards-list">
              {historyItems.map((item) => {
                const currentFeedback = feedbackMap[item.id] || item.feedback || null

                return (
                  <div key={item.id} className="fh-log-card">
                    <div className="fh-log-left">
                      <div className="fh-log-brand-row">
                        <span className="fh-log-brand">{item.brand}</span>
                        <span className="fh-log-date">
                          <Calendar size={12} /> {item.date}
                        </span>
                      </div>
                      <h3 className="fh-log-product">{item.product}</h3>
                      <div className="fh-log-badges">
                        <span className="fh-badge-cat">{item.category}</span>
                        <span className="fh-badge-pref">{item.fitPreference} Fit</span>
                      </div>
                    </div>

                    <div className="fh-log-center">
                      <span className="fh-rec-label">CALIBRATED SIZE</span>
                      <span className="fh-rec-size">{item.size}</span>
                    </div>

                    <div className="fh-log-right">
                      <span className="fh-feedback-label">Post-Wear Feedback:</span>
                      <div className="fh-feedback-buttons">
                        {[
                          { id: 'Flawless Drape', label: 'Flawless Drape' },
                          { id: 'True to Size', label: 'True to Size' },
                          { id: 'Slightly Trim', label: 'Slightly Trim' },
                        ].map((fb) => (
                          <button
                            key={fb.id}
                            type="button"
                            className={`fh-fb-btn ${currentFeedback === fb.id ? 'active' : ''}`}
                            onClick={() => handleSetFeedback(item.id, fb.id)}
                          >
                            {fb.label}
                          </button>
                        ))}
                      </div>

                      <div className="fh-card-actions">
                        <button
                          type="button"
                          className="fh-action-btn"
                          onClick={() =>
                            navigate('/virtual-fitting-room', {
                              state: {
                                presetGarment: {
                                  name: item.product,
                                  brand: item.brand,
                                  size: item.size,
                                },
                              },
                            })
                          }
                          title="View in 3D Fitting Room"
                        >
                          <Shirt size={14} /> Fitting Room
                        </button>
                        <button
                          type="button"
                          className="fh-action-btn"
                          onClick={() => handleSaveToWardrobe(item)}
                          title="Save to My Wardrobe"
                        >
                          <BookmarkCheck size={14} /> Wardrobe
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
