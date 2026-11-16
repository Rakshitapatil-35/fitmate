import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Bell,
  Compass,
  Crown,
  Flame,
  Globe,
  Heart,
  Layers,
  Palette,
  Ruler,
  Scissors,
  Search,
  Shirt,
  Sparkles,
  User,
  UserCheck,
  X,
  Zap,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SpatialPortalsCanvas from './SpatialPortalsCanvas.jsx'
import { getActivePortal, spatialPortals } from './spatialPortalsData.js'
import './SpatialNavigation.css'

const PORTAL_ICONS = {
  Sparkles,
  Shirt,
  Crown,
  Compass,
  Flame,
  Layers,
  UserCheck,
  Scissors,
  Ruler,
  Heart,
}

const SEARCH_REGISTRY = [
  { id: 'univ', label: 'Main Fashion Universe', path: '/', category: 'Worlds', icon: Sparkles },
  { id: 'runway', label: '3D Fashion Runway', path: '/runway', category: 'Haute Couture', icon: Sparkles },
  { id: 'collections', label: 'Explore Collections', path: '/collections', category: 'Worlds', icon: Layers },
  { id: 'women', label: 'Women’s Fashion', path: '/womens-fashion', category: 'Worlds', icon: Shirt },
  { id: 'men', label: 'Men’s Fashion', path: '/mens-fashion', category: 'Worlds', icon: Scissors },
  { id: 'ethnic', label: 'Indian Ethnic Fashion', path: '/indian-ethnic-wear', category: 'Worlds', icon: Crown },
  { id: 'diwali', label: 'Diwali Fashion World', path: '/diwali-edit', category: 'Festive', icon: Flame },
  { id: 'lehenga', label: 'Couture Lehenga Studio', path: '/lehenga-studio', category: 'Studios', icon: Compass },
  { id: 'western', label: 'Western Fashion', path: '/western-wear', category: 'Worlds', icon: Shirt },
  { id: 'digital-twin', label: 'Photorealistic 3D Digital Twin Studio', path: '/digital-twin', category: 'Fit Intelligence', icon: User },
  { id: 'measure', label: 'Body Measurement Studio', path: '/measurements', category: 'Fit Intelligence', icon: Ruler },
  { id: 'fitting', label: 'Virtual Fitting Room', path: '/virtual-fitting-room', category: '3D Try-On', icon: UserCheck },
  { id: 'find-size', label: 'Find My Perfect Size', path: '/find-my-size', category: 'Fit Intelligence', icon: Zap },
  { id: 'compare', label: 'Brand Size Comparison Matrix', path: '/brand-comparison', category: 'Fit Intelligence', icon: Ruler },
  { id: 'passport', label: 'Digital Fit Passport', path: '/fit-passport', category: 'Biometrics', icon: Sparkles },
  { id: 'stylist', label: 'Personal Stylist Concierge', path: '/personal-stylist', category: 'Styling', icon: Palette },
  { id: 'builder', label: '3D Outfit Builder', path: '/outfit-builder', category: 'Styling', icon: Layers },
  { id: 'fabric', label: 'Fabric Explorer & Material Lab', path: '/fabric-explorer', category: 'Materials', icon: Scissors },
  { id: 'history', label: 'Fit History & Feedback', path: '/fit-history', category: 'Personal Vault', icon: Sparkles },
  { id: 'wardrobe', label: 'My Wardrobe', path: '/my-wardrobe', category: 'Personal Vault', icon: Heart },
  { id: 'profile', label: 'My Profile & Account', path: '/dashboard', category: 'Account', icon: User },
]

export default function SpatialNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [gatewayOpen, setGatewayOpen] = useState(false)
  const [hoveredPortalId, setHoveredPortalId] = useState(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const modalRef = useRef(null)
  const searchInputRef = useRef(null)

  // Identify active spatial portal from route
  const activePortal = useMemo(() => getActivePortal(location.pathname), [location.pathname])

  // Get active accent for 3D portal canvas (uses hovered portal accent if hovering)
  const hoveredPortal = useMemo(
    () => spatialPortals.find((p) => p.id === hoveredPortalId),
    [hoveredPortalId]
  )
  const currentAccent = hoveredPortal?.accent ?? activePortal.accent

  // Back Navigation handler
  const handleGoBack = useCallback(() => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }, [navigate])

  // Open & Close Gateway
  const handleOpenGateway = useCallback(() => {
    setGatewayOpen(true)
    setSearchOpen(false)
    setNotifOpen(false)
    setHoveredPortalId(activePortal.id)
  }, [activePortal.id])

  const handleCloseGateway = useCallback(() => {
    setGatewayOpen(false)
    setHoveredPortalId(null)
  }, [])

  // Spotlight search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return SEARCH_REGISTRY.slice(0, 8)
    const q = searchQuery.toLowerCase()
    return SEARCH_REGISTRY.filter(
      (item) => item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    )
  }, [searchQuery])

  // Keyboard navigation & Shortcuts (P opens Portals, Cmd+K / / opens Search, Escape closes)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (gatewayOpen) handleCloseGateway()
        if (searchOpen) setSearchOpen(false)
        if (notifOpen) setNotifOpen(false)
        return
      }

      // Hotkey Cmd+K or Ctrl+K or '/' to toggle search
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
        return
      }

      const activeTag = document.activeElement?.tagName?.toLowerCase()
      if (activeTag !== 'input' && activeTag !== 'textarea') {
        if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          setSearchOpen(true)
        } else if ((e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          setGatewayOpen((prev) => !prev)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gatewayOpen, searchOpen, notifOpen, handleCloseGateway])

  // Focus search input on open
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80)
    }
  }, [searchOpen])

  // Navigate to portal with cinematic flash transition
  const handleSelectPortal = useCallback(
    (portal) => {
      if (location.pathname === portal.path) {
        handleCloseGateway()
        return
      }

      setIsNavigating(true)
      setTimeout(() => {
        navigate(portal.path)
        handleCloseGateway()
        setIsNavigating(false)
      }, 160)
    },
    [handleCloseGateway, location.pathname, navigate]
  )

  const handleOpenThemeCustomizer = () => {
    window.dispatchEvent(new CustomEvent('fitmate-open-theme-customizer'))
  }

  return (
    <>
      {/* 1. Permanent Luxury Spatial 3D Top Bar & Personal Controls */}
      <header className="spatial-nav-dock" role="navigation" aria-label="FITMATE Spatial Multiverse Navigation">
        {/* Left: Minimal Monogram, Back & Brand Wordmark */}
        <div className="spatial-dock-left">
          {location.pathname !== '/' && (
            <button
              type="button"
              className="spatial-dock-back-btn"
              onClick={handleGoBack}
              title="Return to previous environment"
              aria-label="Return to previous environment"
            >
              <ArrowLeft size={13} />
              <span className="back-btn-text">Back</span>
            </button>
          )}

          <Link
            to="/"
            className="spatial-dock-brand"
            title="Main Fashion Universe"
            aria-label="FITMATE Fashion Universe"
          >
            <span className="dock-brand-name">FITMATE</span>
            <span className="dock-brand-dot" />
          </Link>
        </div>

        {/* Center: Active Environment Pill & Quick Search Pill */}
        <div className="spatial-dock-center">
          <button
            type="button"
            className="spatial-active-environment-pill"
            onClick={handleOpenGateway}
            title="Explore all 10 spatial fashion environments"
            aria-label={`Current Environment: ${activePortal.label}. Click to open spatial portals.`}
          >
            <span
              className="active-beacon"
              style={{
                backgroundColor: activePortal.accent,
                boxShadow: `0 0 10px ${activePortal.accent}`,
              }}
            />
            <span className="active-world-label">{activePortal.label}</span>
            <span className="active-world-kicker">{activePortal.badge}</span>
          </button>

          {/* Minimal Search Control Pill */}
          <button
            type="button"
            className="spatial-dock-search-pill"
            onClick={() => setSearchOpen(true)}
            title="Search fashion universe ( ⌘K or / )"
            aria-label="Search fashion universe"
          >
            <Search size={12} className="dock-search-icon" />
            <span className="dock-search-placeholder">Search…</span>
            <kbd className="dock-kbd">⌘K</kbd>
          </button>
        </div>

        {/* Right: Notifications, User Profile, 3D Theme Orb & Portals Gateway */}
        <div className="spatial-dock-right">
          {/* Notifications Shortcut */}
          <div className="spatial-notif-wrap">
            <button
              type="button"
              className={`spatial-dock-icon-btn ${notifOpen ? 'is-active' : ''}`}
              onClick={() => setNotifOpen((prev) => !prev)}
              title="Fit notifications & alerts"
              aria-label="Fit notifications"
              aria-expanded={notifOpen}
            >
              <Bell size={14} />
              <span className="notif-badge-dot" />
            </button>

            {/* Notifications Dropdown Card */}
            {notifOpen && (
              <div className="spatial-notif-dropdown">
                <div className="notif-dropdown-header">
                  <span className="notif-header-title">HAUTE ALERTS</span>
                  <span className="notif-header-count">2 Active</span>
                </div>
                <div className="notif-items-list">
                  <div className="notif-item">
                    <div className="notif-item-dot" />
                    <div>
                      <strong className="notif-item-title">Digital Fit Passport Ready</strong>
                      <p className="notif-item-desc">Biometric measurements verified for international luxury sizing.</p>
                    </div>
                  </div>
                  <div className="notif-item">
                    <div className="notif-item-dot" />
                    <div>
                      <strong className="notif-item-title">3D Catwalk Runway Updated</strong>
                      <p className="notif-item-desc">Explore 4 new royal Banarasi & Barathea couture looks.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Shortcut */}
          <Link
            to="/dashboard"
            className="spatial-dock-icon-btn"
            title="My Profile & Measurement Passport"
            aria-label="User Profile & Dashboard"
          >
            <User size={14} />
          </Link>

          {/* Floating Theme Customization Orb Trigger */}
          <button
            type="button"
            className="spatial-dock-icon-btn theme-orb-btn"
            onClick={handleOpenThemeCustomizer}
            title="Customise 3D Theme & Palette"
            aria-label="Customise 3D Theme & Palette"
          >
            <Palette size={14} />
            <span className="theme-orb-halo" />
          </button>

          {/* Master 3D Portals Gateway Trigger */}
          <button
            type="button"
            className={`spatial-gateway-trigger-btn ${gatewayOpen ? 'is-open' : ''}`}
            onClick={handleOpenGateway}
            aria-expanded={gatewayOpen}
            aria-haspopup="dialog"
            aria-label="Open 3D Spatial Navigation Portals (Press P)"
            title="Explore All 10 3D Spatial Navigation Portals (Press 'P')"
          >
            <Globe size={13} className="gateway-trigger-icon" />
            <span className="gateway-trigger-label">PORTALS</span>
            <span className="gateway-count-pill">10</span>
          </button>
        </div>
      </header>

      {/* Spotlight Search Modal */}
      {searchOpen && (
        <div
          className="spatial-search-overlay"
          onClick={() => setSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Spotlight Universe Search"
        >
          <div
            className="spatial-search-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="spatial-search-input-row">
              <Search size={18} className="search-modal-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search fashion worlds, runway, fitting room, brand matrix…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-modal-input"
                aria-label="Search FITMATE universe"
              />
              <button
                type="button"
                className="search-modal-close"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <X size={16} />
              </button>
            </div>

            <div className="search-modal-results">
              {searchResults.length === 0 ? (
                <div className="search-no-matches">No matching suites or tools found</div>
              ) : (
                searchResults.map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className="search-modal-row"
                      onClick={() => setSearchOpen(false)}
                    >
                      <div className="search-row-icon-box">
                        <ItemIcon size={16} />
                      </div>
                      <div className="search-row-content">
                        <span className="search-row-title">{item.label}</span>
                        <span className="search-row-category">{item.category}</span>
                      </div>
                      <span className="search-row-arrow">↗</span>
                    </Link>
                  )
                })
              )}
            </div>

            <div className="search-modal-footer">
              <span>Use TAB or ↑↓ to navigate • Press ESC to exit</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Spatial 3D Navigation Gateway (Full-Screen Spatial Multiverse) */}
      {gatewayOpen && (
        <div
          ref={modalRef}
          className="spatial-multiverse-modal"
          role="dialog"
          aria-modal="true"
          aria-label="FITMATE Spatial Multiverse Navigation"
        >
          {/* Ambient 3D Rotating Celestial Gateway Background */}
          <SpatialPortalsCanvas accent={currentAccent} className="modal-3d-backdrop" />

          {/* Modal Header */}
          <div className="multiverse-modal-header">
            <div className="header-badge-row">
              <span className="multiverse-crest">
                <Compass size={13} />
                FITMATE MULTIVERSE GATEWAY · 10 SPATIAL WORLDS
              </span>
              <span className="hotkey-hint">Press ESC to return</span>
            </div>

            <div className="header-title-bar">
              <div>
                <h2>Spatial 3D Navigation Portals</h2>
                <p>
                  Enter any dimension of the FITMATE fashion universe. Each portal leads directly to an immersive virtual atelier.
                </p>
              </div>

              <button
                type="button"
                className="btn-close-multiverse"
                onClick={handleCloseGateway}
                aria-label="Close spatial portals"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 10 Spatial Navigation Portals Grid */}
          <div className="spatial-portals-grid" role="group" aria-label="10 Spatial Fashion Portals">
            {spatialPortals.map((portal) => {
              const isCurrent = activePortal.id === portal.id
              const isHovered = hoveredPortalId === portal.id
              const IconComponent = PORTAL_ICONS[portal.icon] ?? Sparkles

              return (
                <div
                  key={portal.id}
                  className={`spatial-portal-card ${isCurrent ? 'is-current-world' : ''} ${isHovered ? 'is-hovered' : ''}`}
                  style={{
                    '--portal-accent': portal.accent,
                  }}
                  onMouseEnter={() => setHoveredPortalId(portal.id)}
                  onFocus={() => setHoveredPortalId(portal.id)}
                  onClick={() => handleSelectPortal(portal)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelectPortal(portal)
                    }
                  }}
                  aria-label={`Enter ${portal.label}. ${portal.description}`}
                >
                  {/* Holographic Border Glow & Aura */}
                  <div
                    className="portal-aura-glow"
                    style={{
                      boxShadow: isHovered || isCurrent ? `0 0 35px ${portal.accent}33` : 'none',
                    }}
                  />

                  {/* Card Header Row */}
                  <div className="portal-card-header">
                    <span className="portal-number-badge">{portal.kicker}</span>
                    <span
                      className="portal-domain-badge"
                      style={{
                        borderColor: `${portal.accent}55`,
                        color: portal.accent,
                      }}
                    >
                      {portal.badge}
                    </span>
                  </div>

                  {/* Portal Glyph & Title */}
                  <div className="portal-card-main">
                    <div
                      className="portal-glyph-box"
                      style={{
                        backgroundColor: `${portal.accent}18`,
                        borderColor: `${portal.accent}44`,
                        color: portal.accent,
                      }}
                    >
                      <IconComponent size={20} />
                    </div>

                    <div className="portal-title-group">
                      <strong className="portal-title">{portal.label}</strong>
                      <span className="portal-tagline">{portal.tagline}</span>
                    </div>
                  </div>

                  {/* Portal Description */}
                  <p className="portal-description">{portal.description}</p>

                  {/* Card Footer with Status */}
                  <div className="portal-card-footer">
                    {isCurrent ? (
                      <span className="portal-status-active">
                        <span className="pulse-dot" style={{ backgroundColor: portal.accent }} />
                        CURRENT DIMENSION
                      </span>
                    ) : (
                      <span className="portal-enter-prompt">
                        ENTER PORTAL ↗
                      </span>
                    )}

                    <span className="portal-route-hint">{portal.path}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Modal Bottom Status Bar */}
          <footer className="multiverse-modal-footer">
            <span>KEYBOARD ACCESSIBLE · USE TAB & ARROWS TO EXPLORE · PRESS ESC TO RETURN</span>
            <div className="footer-links">
              <Link to="/about" onClick={handleCloseGateway}>
                About
              </Link>
              <Link to="/how-it-works" onClick={handleCloseGateway}>
                How It Works
              </Link>
              <Link to="/dashboard" onClick={handleCloseGateway}>
                Dashboard
              </Link>
            </div>
          </footer>
        </div>
      )}

      {/* Cinematic Flash Transition Overlay */}
      {isNavigating && (
        <div
          className="spatial-transition-curtain"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${currentAccent}22, #0d0b09 75%)`,
          }}
          aria-hidden="true"
        />
      )}
    </>
  )
}
