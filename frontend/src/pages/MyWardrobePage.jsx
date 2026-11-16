import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Filter,
  Heart,
  Play,
  Pause,
  RefreshCw,
  RotateCcw,
  Ruler,
  Scissors,
  Shirt,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandWordmark, Eyebrow } from '../components/DesignSystem.jsx'
import { useToast } from '../components/ToastContext.jsx'
import {
  clearSavedWardrobe,
  loadMeasurements,
  loadRecentChecks,
  loadWardrobe,
  removeSavedProduct,
  resetToCuratedDemoWardrobe,
  saveSelectedGarment,
} from '../measurementStorage.js'
import { getReadySceneAsset } from '../three/assetManifest.js'
import {
  filterOptions,
  wardrobeCollections,
  wardrobeInspectionViews,
  wardrobeZoneCameras,
} from '../three/wardrobeCatalog.js'
import './MyWardrobePage.css'
import './walk-in-wardrobe.css'

const SceneManager = lazy(() => import('../three/SceneManager.jsx'))

export default function MyWardrobePage() {
  const toast = useToast()
  const navigate = useNavigate()

  // Persistent Wardrobe State from localStorage
  const [wardrobe, setWardrobe] = useState(() => loadWardrobe())
  const [selectedCollection, setSelectedCollection] = useState('all')

  // Multi-dimensional Filters
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [occasionFilter, setOccasionFilter] = useState('All Occasions')
  const [colorFilter, setColorFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('All Brands')
  const [showFiltersModal, setShowFiltersModal] = useState(false)

  // 3D Scene Controls
  const [cameraZone, setCameraZone] = useState('overview')
  const [selectedGarment, setSelectedGarment] = useState(null)
  const [inspectionView, setInspectionView] = useState('front')
  const [autoRotate, setAutoRotate] = useState(false)

  const savedMeasurements = loadMeasurements()
  const recentSizes = loadRecentChecks()

  const refreshState = useCallback(() => {
    setWardrobe(loadWardrobe())
  }, [])

  // Collect unique brands from saved items for the filter
  const availableBrands = useMemo(() => {
    const brands = new Set(wardrobe.savedProducts.map((p) => p.brand).filter(Boolean))
    return ['All Brands', ...Array.from(brands)]
  }, [wardrobe.savedProducts])

  // Filtered Garment Collection
  const filteredGarments = useMemo(() => {
    return wardrobe.savedProducts.filter((item) => {
      // 1. Collection Tab
      if (selectedCollection !== 'all') {
        const col = (item.collection || '').toLowerCase()
        const aud = (item.audience || '').toLowerCase()
        const cat = (item.category || item.clothingType || '').toLowerCase()

        if (selectedCollection === 'western' && !col.includes('western') && !cat.includes('dress') && !cat.includes('blazer')) return false
        if (selectedCollection === 'menswear' && aud !== 'men' && !col.includes('men')) return false
        if (selectedCollection === 'womens' && aud !== 'women' && !col.includes('women')) return false
        if (selectedCollection === 'indian' && !col.includes('indian') && !cat.includes('saree') && !cat.includes('lehenga') && !cat.includes('kurti')) return false
        if (selectedCollection === 'accessories' && col !== 'accessories' && !cat.includes('handbag') && !cat.includes('shoe')) return false
      }

      // 2. Category
      if (categoryFilter !== 'All Categories') {
        const itemCat = (item.category || item.clothingType || '').toLowerCase()
        const filterCat = categoryFilter.toLowerCase()
        if (!itemCat.includes(filterCat.replace(' & jackets', '').replace(' & kurtas', '').replace(' & accessories', ''))) {
          return false
        }
      }

      // 3. Occasion
      if (occasionFilter !== 'All Occions' && occasionFilter !== 'All Occasions') {
        if ((item.occasion || '').toLowerCase() !== occasionFilter.toLowerCase()) return false
      }

      // 4. Color
      if (colorFilter !== 'all') {
        const selectedColorObj = filterOptions.colors.find((c) => c.id === colorFilter)
        if (selectedColorObj?.hex && item.color) {
          // Color match based on proximity or name
          const hex = (item.color || '').toLowerCase()
          const colorName = (item.colorName || '').toLowerCase()
          if (!colorName.includes(colorFilter) && hex !== selectedColorObj.hex.toLowerCase()) {
            return false
          }
        }
      }

      // 5. Brand
      if (brandFilter !== 'All Brands' && item.brand !== brandFilter) {
        return false
      }

      return true
    })
  }, [wardrobe.savedProducts, selectedCollection, categoryFilter, occasionFilter, colorFilter, brandFilter])

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (categoryFilter !== 'All Categories') count += 1
    if (occasionFilter !== 'All Occasions') count += 1
    if (colorFilter !== 'all') count += 1
    if (brandFilter !== 'All Brands') count += 1
    return count
  }, [categoryFilter, occasionFilter, colorFilter, brandFilter])

  const handleResetFilters = () => {
    setCategoryFilter('All Categories')
    setOccasionFilter('All Occasions')
    setColorFilter('all')
    setBrandFilter('All Brands')
  }

  // Garment Selection & Camera Flight
  const handleSelectGarment = useCallback((garment) => {
    setSelectedGarment(garment)
    setCameraZone('inspect')
    setInspectionView('front')
    setAutoRotate(false)
  }, [])

  const handleCloseInspector = useCallback(() => {
    setSelectedGarment(null)
    setCameraZone(selectedCollection === 'all' ? 'overview' : selectedCollection)
    setAutoRotate(false)
  }, [selectedCollection])

  const handleZoneChange = useCallback((zoneKey) => {
    setCameraZone(zoneKey)
    if (zoneKey !== 'inspect') {
      setSelectedGarment(null)
    }
  }, [])

  // Garment Actions
  const handleRemoveGarment = useCallback(
    (id) => {
      removeSavedProduct(id)
      refreshState()
      if (selectedGarment?.id === id) {
        handleCloseInspector()
      }
      toast('Garment removed from your private wardrobe.')
    },
    [handleCloseInspector, refreshState, selectedGarment?.id, toast]
  )

  const handleRestoreCurated = useCallback(() => {
    resetToCuratedDemoWardrobe()
    refreshState()
    handleResetFilters()
    setSelectedCollection('all')
    setCameraZone('overview')
    toast('Curated luxury wardrobe restored.')
  }, [refreshState, toast])

  const handleClearWardrobe = useCallback(() => {
    clearSavedWardrobe()
    refreshState()
    handleCloseInspector()
    toast('Wardrobe cleared on this device.')
  }, [handleCloseInspector, refreshState, toast])

  // Try-on in 3D Fitting Room
  const handleTryOnInFittingRoom = (garment) => {
    saveSelectedGarment(garment)
    const params = new URLSearchParams({
      garmentId: garment.id,
      clothingType: garment.clothingType || garment.category || '',
      audience: garment.audience || 'Women',
    })
    navigate(`/virtual-fitting-room?${params.toString()}`)
  }

  // Size Recommendation Check
  const handleFindSizeRecommendation = (garment) => {
    saveSelectedGarment(garment)
    const params = new URLSearchParams({
      audience: garment.audience || 'Women',
      category: garment.category || 'Traditional wear',
      clothingType: garment.clothingType || garment.name || '',
      brandId: garment.brandId || 'fitmate-studio',
      productName: garment.name || garment.productName || '',
    })
    navigate(`/find-my-size?${params.toString()}`)
  }

  const selectedAsset = selectedGarment
    ? getReadySceneAsset(selectedGarment.garmentAssetId || selectedGarment.assetId)
    : null

  return (
    <div className="wardrobe-page walk-in-wardrobe-page">
      {/* 1. Haute-Couture Architectural Header */}
      <header className="walkin-header">
        <div className="walkin-header-left">
          <BrandWordmark to="/" />
          <div className="walkin-crest-badge">
            <Sparkles size={14} />
            <span>3D WALK-IN WARDROBE</span>
          </div>
        </div>

        {/* Camera Zone Quick Switcher */}
        <div className="walkin-camera-switcher" role="group" aria-label="Walk-in wardrobe camera zones">
          {Object.entries(wardrobeZoneCameras).map(([key, zone]) => {
            if (key === 'inspect' && !selectedGarment) return null
            const isActive = cameraZone === key
            return (
              <button
                key={key}
                type="button"
                className={`zone-pill-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => handleZoneChange(key)}
                title={zone.label}
              >
                {key === 'inspect' && <Camera size={11} />}
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </button>
            )
          })}
        </div>

        <nav className="walkin-nav" aria-label="Wardrobe navigation">
          <Link to="/">Showroom</Link>
          <Link to="/indian-ethnic-wear">Indian Couture</Link>
          <Link to="/western-wear">Western</Link>
          <Link to="/mens-fashion">Men’s</Link>
          <Link to="/virtual-fitting-room" className="nav-highlight">
            <Scissors size={12} />
            Fitting Room
          </Link>
        </nav>
      </header>

      {/* 2. Interactive 3D Wardrobe Stage */}
      <section className="walkin-stage" aria-label="Interactive 3D Walk-in Wardrobe">
        <div className="walkin-scene">
          <Suspense
            fallback={
              <div className="walkin-loading" role="status">
                <div className="loading-gold-spinner" />
                <span>HAUTE-COUTURE ATELIER · PRIVATE SUITE</span>
                <strong>Assembling your 3D walk-in wardrobe…</strong>
              </div>
            }
          >
            <SceneManager
              sceneId="walkInWardrobe"
              sceneProps={{
                savedGarments: filteredGarments,
                selectedGarment,
                cameraZone,
                inspectionView,
                autoRotate,
                onSelectGarment: handleSelectGarment,
              }}
            />
          </Suspense>
        </div>

        {/* Ambient room gradients */}
        <div className="walkin-shade" aria-hidden="true" />

        {/* Empty State Overlay if user removed all items */}
        {wardrobe.savedProducts.length === 0 && (
          <div className="wardrobe-empty-glass-card" role="dialog" aria-label="Empty Wardrobe">
            <span className="empty-kicker">
              <Heart size={14} />
              YOUR PRIVATE ATELIER SUITE
            </span>
            <h2>Your Wardrobe Awaits</h2>
            <p>
              No garments are currently saved on this device. Explore FITMATE’s 3D fashion worlds to save haute-couture pieces, or restore our curated luxury starter collection.
            </p>
            <div className="empty-actions">
              <button type="button" className="btn-restore-curated" onClick={handleRestoreCurated}>
                <Sparkles size={14} />
                <span>Populate with Curated Luxury Edit</span>
              </button>
              <div className="empty-world-links">
                <Link to="/indian-ethnic-wear">Indian Couture</Link>
                <Link to="/lehenga-studio">Lehenga Studio</Link>
                <Link to="/western-wear">Western Fashion</Link>
                <Link to="/mens-fashion">Men’s Atelier</Link>
                <Link to="/diwali-world">Diwali Edit</Link>
              </div>
            </div>
          </div>
        )}

        {/* Floating 3D Garment Inspector HUD */}
        {selectedGarment && (
          <aside className="walkin-garment-inspector-panel" role="dialog" aria-label="3D Garment Inspector">
            <div className="inspector-panel-header">
              <div className="kicker-row">
                <span className="panel-kicker">{selectedGarment.collection || 'HAUTE COUTURE'}</span>
                <span className="occasion-tag">{selectedGarment.occasion || 'Formal'}</span>
              </div>
              <button
                type="button"
                className="btn-close-inspector"
                onClick={handleCloseInspector}
                aria-label="Close garment inspection"
              >
                <X size={15} />
              </button>
            </div>

            <h2 className="inspector-garment-title">{selectedGarment.name || selectedGarment.productName}</h2>
            <p className="inspector-brand-line">
              <strong>{selectedGarment.brand || 'FITMATE Studio'}</strong>
              {selectedGarment.price && <span> · {selectedGarment.price}</span>}
            </p>

            {/* Asset Validation Badge */}
            <div className={`asset-status-pill ${selectedAsset ? 'is-ready' : 'is-pending'}`}>
              <i aria-hidden="true" />
              <span>
                {selectedAsset
                  ? 'REVIEWED 3D GLB MODEL LOADED'
                  : 'HAUTE COUTURE STUDY DRAPE · REAL GLB MODEL PENDING SOURCING'}
              </span>
            </div>
            {!selectedAsset && (
              <p className="asset-honesty-note">
                FITMATE never substitutes flat 2D photography for 3D clothing. A tailor drape study is displayed until a licensed GLB is approved.
              </p>
            )}

            {/* 3D Camera Angles & Orbit Controls */}
            <div className="inspector-controls-box">
              <span className="control-label">3D INSPECTION ANGLE:</span>
              <div className="view-angle-btns">
                {wardrobeInspectionViews.map((view) => (
                  <button
                    key={view}
                    type="button"
                    className={`angle-btn ${inspectionView === view && !autoRotate ? 'is-active' : ''}`}
                    onClick={() => {
                      setAutoRotate(false)
                      setInspectionView(view)
                    }}
                  >
                    {view.toUpperCase()}
                  </button>
                ))}
                <button
                  type="button"
                  className={`angle-btn btn-auto-rotate ${autoRotate ? 'is-active' : ''}`}
                  onClick={() => setAutoRotate((prev) => !prev)}
                  title="360° Continuous Orbit Rotation"
                >
                  {autoRotate ? <Pause size={10} /> : <Play size={10} />}
                  <span>360°</span>
                </button>
              </div>
            </div>

            {/* Garment Details & Color / Fabric Swatch */}
            <div className="inspector-specs-grid">
              {selectedGarment.color && (
                <div className="spec-row">
                  <span className="spec-name">Color / Dye:</span>
                  <div className="color-swatch-box">
                    <span className="color-dot" style={{ backgroundColor: selectedGarment.color }} />
                    <span className="color-label">{selectedGarment.colorName || selectedGarment.color}</span>
                  </div>
                </div>
              )}
              {selectedGarment.fabric && (
                <div className="spec-row">
                  <span className="spec-name">Fabric Weave:</span>
                  <span className="spec-value">{selectedGarment.fabric}</span>
                </div>
              )}
              {selectedGarment.notes && (
                <p className="garment-curator-note">{selectedGarment.notes}</p>
              )}
            </div>

            {/* Connected Workflows & Management Actions */}
            <div className="inspector-actions-grid">
              <button
                type="button"
                className="btn-try-on-fitting"
                onClick={() => handleTryOnInFittingRoom(selectedGarment)}
              >
                <Sparkles size={13} />
                <span>Try on in 3D Fitting Room</span>
              </button>

              <button
                type="button"
                className="btn-check-recommendation"
                onClick={() => handleFindSizeRecommendation(selectedGarment)}
              >
                <Ruler size={13} />
                <span>Check Size Recommendation</span>
              </button>

              <button
                type="button"
                className="btn-remove-from-wardrobe"
                onClick={() => handleRemoveGarment(selectedGarment.id)}
              >
                <Trash2 size={13} />
                <span>Remove from Wardrobe</span>
              </button>
            </div>
          </aside>
        )}

        {/* 3. Floating Glassmorphism Collections & Filtering Dock */}
        <footer className="walkin-dock-hud">
          {/* Top Row: Collection Switcher Tabs */}
          <div className="dock-collections-bar" role="tablist" aria-label="Wardrobe collections">
            {wardrobeCollections.map((col) => {
              const isSelected = selectedCollection === col.id
              return (
                <button
                  key={col.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`collection-tab-btn ${isSelected ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedCollection(col.id)
                    handleCloseInspector()
                    if (col.id === 'indian') setCameraZone('indian')
                    else if (col.id === 'western') setCameraZone('western')
                    else if (col.id === 'menswear') setCameraZone('menswear')
                    else if (col.id === 'accessories') setCameraZone('accessories')
                    else setCameraZone('overview')
                  }}
                >
                  <span>{col.label}</span>
                </button>
              )
            })}

            {/* Filter Toggle Button */}
            <button
              type="button"
              className={`btn-toggle-filters ${activeFiltersCount > 0 ? 'has-active' : ''}`}
              onClick={() => setShowFiltersModal((prev) => !prev)}
              aria-expanded={showFiltersModal}
              aria-label="Filter saved garments"
            >
              <Filter size={12} />
              <span>Filter {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
              <ChevronDown size={11} className={showFiltersModal ? 'rotate-180' : ''} />
            </button>
          </div>

          {/* Interactive Floating Garment Carousel / Rack Bar */}
          <div className="dock-rack-strip" role="list" aria-label="Saved garments on rack">
            {filteredGarments.length > 0 ? (
              filteredGarments.map((item) => {
                const isSelected = selectedGarment?.id === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="listitem"
                    className={`rack-item-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelectGarment(item)}
                    aria-pressed={isSelected}
                  >
                    <div className="rack-card-top">
                      <span className="rack-card-brand">{item.brand || 'FITMATE'}</span>
                      {item.color && (
                        <span className="rack-card-color-dot" style={{ backgroundColor: item.color }} />
                      )}
                    </div>
                    <strong className="rack-card-name">{item.name || item.productName}</strong>
                    <div className="rack-card-footer">
                      <small className="rack-card-type">{item.clothingType || item.category}</small>
                      <span className="rack-card-inspect-hint">INSPECT ↗</span>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="dock-rack-empty-message">
                <span>No saved garments match the current collection or filter criteria.</span>
                <button type="button" onClick={handleResetFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </footer>

        {/* 4. Comprehensive Floating Filters Modal */}
        {showFiltersModal && (
          <div className="wardrobe-filters-drawer" role="dialog" aria-modal="true" aria-label="Filter Saved Wardrobe">
            <div className="drawer-header">
              <div className="drawer-title-group">
                <Filter size={13} />
                <h3>Filter Saved Wardrobe</h3>
              </div>
              <button
                type="button"
                className="btn-close-drawer"
                onClick={() => setShowFiltersModal(false)}
                aria-label="Close filter drawer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Filter 1: Category */}
              <div className="drawer-filter-group">
                <label className="filter-label">Garment Category:</label>
                <div className="filter-chip-row">
                  {filterOptions.categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`filter-chip ${categoryFilter === cat ? 'is-active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 2: Occasion */}
              <div className="drawer-filter-group">
                <label className="filter-label">Occasion / Dress Code:</label>
                <div className="filter-chip-row">
                  {filterOptions.occasions.map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      className={`filter-chip ${occasionFilter === occ ? 'is-active' : ''}`}
                      onClick={() => setOccasionFilter(occ)}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 3: Colour Palette */}
              <div className="drawer-filter-group">
                <label className="filter-label">Dominant Colour Palette:</label>
                <div className="color-filter-row">
                  {filterOptions.colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`color-filter-btn ${colorFilter === c.id ? 'is-active' : ''}`}
                      onClick={() => setColorFilter(c.id)}
                      title={c.label}
                      aria-label={c.label}
                    >
                      {c.hex ? (
                        <span className="color-swatch-dot" style={{ backgroundColor: c.hex }} />
                      ) : (
                        <span className="all-colors-icon">ALL</span>
                      )}
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 4: Brand */}
              {availableBrands.length > 1 && (
                <div className="drawer-filter-group">
                  <label className="filter-label">Fashion Brand / Atelier:</label>
                  <div className="filter-chip-row">
                    {availableBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={`filter-chip ${brandFilter === b ? 'is-active' : ''}`}
                        onClick={() => setBrandFilter(b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button type="button" className="btn-drawer-reset" onClick={handleResetFilters}>
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>

              <button
                type="button"
                className="btn-drawer-apply"
                onClick={() => setShowFiltersModal(false)}
              >
                <Check size={13} />
                <span>Apply Filters ({filteredGarments.length} Pieces)</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 5. Additional Wardrobe Summary & Fit Profile Insights */}
      <main className="wardrobe-main">
        <section className="wardrobe-summary" aria-label="Wardrobe summary statistics">
          <div className="summary-card">
            <Heart size={18} />
            <strong>{wardrobe.savedProducts.length}</strong>
            <span>Saved Pieces</span>
          </div>
          <div className="summary-card">
            <Shirt size={18} />
            <strong>{filteredGarments.length}</strong>
            <span>Active in 3D View</span>
          </div>
          <div className="summary-card">
            <Ruler size={18} />
            <strong>{savedMeasurements ? Object.keys(savedMeasurements).length : 0}</strong>
            <span>Saved Measurements</span>
          </div>
          <div className="summary-card">
            <Sparkles size={18} />
            <strong>{recentSizes.length}</strong>
            <span>Recent Fit Checks</span>
          </div>
        </section>

        {/* Fit Profile & Quick Reset Tools */}
        <section className="wardrobe-management-section">
          <div className="management-card">
            <Eyebrow>LOCAL ATELIER PROFILE</Eyebrow>
            <h3>Connected Fit Measurements</h3>
            {savedMeasurements ? (
              <div className="measurements-quick-grid">
                {Object.entries(savedMeasurements).map(([key, val]) => (
                  <div key={key} className="quick-measurement-item">
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <strong>{val} cm</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-measurements-note">
                No measurements saved yet. Calibrate your profile in the 3D Measurement Studio to receive tailored size charts.
              </p>
            )}
            <div className="management-card-actions">
              <Link to="/measurements" className="btn-edit-measurements">
                <span>Manage Measurements</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="management-card">
            <Eyebrow>WARDROBE DEMO STORAGE</Eyebrow>
            <h3>Manage Local Wardrobe Data</h3>
            <p>
              Wardrobe items are securely persisted in your browser’s localStorage. You can restore the full curated luxury collection or clear all saved items at any time.
            </p>
            <div className="management-card-actions">
              <button type="button" className="btn-mgmt-action" onClick={handleRestoreCurated}>
                <RefreshCw size={13} />
                <span>Restore Curated Collection</span>
              </button>
              <button
                type="button"
                className="btn-mgmt-action btn-danger"
                onClick={handleClearWardrobe}
              >
                <Trash2 size={13} />
                <span>Clear All Saved Items</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
