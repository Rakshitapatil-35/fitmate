import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crown,
  Eye,
  Flame,
  Heart,
  History,
  Layers,
  Menu,
  Palette,
  QrCode,
  Ruler,
  Scale,
  Scissors,
  Search,
  Shirt,
  Sparkles,
  User,
  UserCheck,
  X,
  Zap,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import './LuxurySidebar.css'

const NAV_GROUPS = [
  {
    title: 'MAIN WORLD',
    items: [
      { id: 'universe', label: 'Fashion Universe', path: '/', icon: Sparkles, badge: '3D' },
      { id: 'runway', label: 'Fashion Runway', path: '/runway', icon: Eye, badge: 'Live' },
      { id: 'collections', label: 'Explore Collections', path: '/collections', icon: Layers, badge: 'Haute' },
    ],
  },
  {
    title: 'FASHION WORLDS',
    items: [
      { id: 'womens', label: "Women’s Fashion", path: '/womens-fashion', icon: Shirt },
      { id: 'mens', label: "Men’s Fashion", path: '/mens-fashion', icon: Scissors },
      { id: 'indian', label: 'Indian Ethnic Fashion', path: '/indian-ethnic-wear', icon: Crown },
      { id: 'diwali', label: 'Diwali Collection', path: '/diwali-edit', icon: Flame, badge: 'Festive' },
      { id: 'lehenga', label: 'Lehenga Studio', path: '/lehenga-studio', icon: Compass },
      { id: 'western', label: 'Western Fashion', path: '/western-wear', icon: Shirt },
    ],
  },
  {
    title: 'FITMATE TECHNOLOGY',
    items: [
      { id: 'digital-twin', label: '3D Digital Twin Studio', path: '/digital-twin', icon: User, badge: 'Twin' },
      { id: 'measurements', label: 'Body Measurement Studio', path: '/measurements', icon: Ruler },
      { id: 'fitting', label: 'Virtual Fitting Room', path: '/virtual-fitting-room', icon: UserCheck, badge: '3D Try-On' },
      { id: 'find-size', label: 'Find My Perfect Size', path: '/find-my-size', icon: Zap },
      { id: 'brand-comparison', label: 'Brand Size Comparison', path: '/brand-comparison', icon: Scale, badge: 'Matrix' },
      { id: 'fit-passport', label: 'Digital Fit Passport', path: '/fit-passport', icon: QrCode, badge: 'Verified' },
    ],
  },
  {
    title: 'PERSONAL SPACE',
    items: [
      { id: 'wardrobe', label: 'My Wardrobe', path: '/my-wardrobe', icon: Bookmark },
      { id: 'favourites', label: 'Saved Favourites', path: '/collections', icon: Heart },
      { id: 'builder', label: 'Outfit Builder', path: '/outfit-builder', icon: Palette, badge: '3D' },
      { id: 'fit-history', label: 'Fit History', path: '/fit-history', icon: History },
      { id: 'profile', label: 'My Profile', path: '/dashboard', icon: User },
    ],
  },
]

export default function LuxurySidebar() {
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const sidebarRef = useRef(null)
  const [prevPath, setPrevPath] = useState(location.pathname)

  // Auto-close mobile drawer on route change
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname)
    setMobileOpen(false)
  }

  // Keyboard shortcut: Press '[' to toggle sidebar collapse/expand
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '[' && !['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) {
        e.preventDefault()
        setExpanded((prev) => !prev)
      }
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  // Flattened navigation list for quick searching
  const allNavItems = useMemo(
    () => NAV_GROUPS.flatMap((group) => group.items),
    []
  )

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return allNavItems.filter((item) => item.label.toLowerCase().includes(q))
  }, [allNavItems, searchQuery])

  const isCurrentActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  }

  const handleOpenThemeCustomizer = () => {
    window.dispatchEvent(new CustomEvent('fitmate-open-theme-customizer'))
  }

  return (
    <>
      {/* Mobile Drawer Trigger Button */}
      <button
        type="button"
        className="mobile-sidebar-toggle-btn"
        aria-label={mobileOpen ? 'Close navigation sidebar' : 'Open navigation sidebar'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        <span className="mobile-toggle-text">NAV</span>
      </button>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="luxury-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Spatial 3D Sliding Sidebar */}
      <aside
        ref={sidebarRef}
        className={`luxury-3d-sidebar ${expanded ? 'is-expanded' : 'is-collapsed'} ${mobileOpen ? 'is-mobile-open' : ''}`}
        aria-label="FITMATE Spatial 3D Navigation"
      >
        {/* Specular Edge & Ambient Holographic Halo */}
        <div className="sidebar-specular-edge" aria-hidden="true" />
        <div className="sidebar-aurora-glow" aria-hidden="true" />

        {/* Sidebar Header & Monogram */}
        <header className="sidebar-header">
          <Link to="/" className="sidebar-brand-link" title="FITMATE Fashion Universe">
            <div className="sidebar-brand-crest">
              <span className="crest-monogram">FM</span>
              <span className="crest-halo" />
            </div>
            {expanded && (
              <div className="sidebar-brand-text">
                <span className="brand-name">FITMATE</span>
                <span className="brand-subtext">SPATIAL 3D ATELIER</span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            type="button"
            className="sidebar-toggle-collapse-btn"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            title={expanded ? 'Collapse Sidebar ( [ )' : 'Expand Sidebar ( [ )'}
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </header>

        {/* Quick Utility Bar in Collapsed/Expanded: Search & Theme Trigger */}
        <div className="sidebar-utility-bar">
          <button
            type="button"
            className="sidebar-utility-btn"
            onClick={() => {
              setExpanded(true)
              setTimeout(() => {
                document.querySelector('.sidebar-search-input')?.focus()
              }, 120)
            }}
            title="Search Universe ( / )"
            aria-label="Search Universe"
          >
            <Search size={15} />
            {expanded && <span className="utility-label">Search Universe…</span>}
          </button>

          <button
            type="button"
            className="sidebar-utility-btn theme-orb-trigger"
            onClick={handleOpenThemeCustomizer}
            title="Customise 3D Theme & Palette"
            aria-label="Customise 3D Theme & Palette"
          >
            <Palette size={15} className="palette-icon" />
            {expanded && <span className="utility-label">Theme Studio</span>}
            <span className="theme-orb-halo" />
          </button>
        </div>

        {/* Integrated Search Input (Visible When Expanded) */}
        {expanded && (
          <div className={`sidebar-search-container ${searchFocused ? 'is-focused' : ''}`}>
            <Search size={14} className="sidebar-search-icon" />
            <input
              type="text"
              placeholder="Search 18+ worlds & tools…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              aria-label="Search FITMATE fashion worlds and tools"
              className="sidebar-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Search Results Dropdown Overlay */}
        {expanded && searchQuery.trim() && (
          <div className="sidebar-search-results" role="listbox">
            {filteredItems.length === 0 ? (
              <div className="search-no-results">No matching fashion suites found</div>
            ) : (
              filteredItems.map((item) => {
                const ItemIcon = item.icon
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="search-result-row"
                    onClick={() => {
                      setSearchQuery('')
                      setMobileOpen(false)
                    }}
                  >
                    <ItemIcon size={14} className="result-icon" />
                    <span>{item.label}</span>
                  </Link>
                )
              })
            )}
          </div>
        )}

        {/* Navigation Body */}
        <nav className="sidebar-scrollable-nav" aria-label="Main Navigation Categories">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="sidebar-nav-group">
              {expanded && <h3 className="sidebar-group-title">{group.title}</h3>}
              <ul className="sidebar-nav-list">
                {group.items.map((item) => {
                  const ItemIcon = item.icon
                  const active = isCurrentActive(item.path)
                  return (
                    <li key={item.id} className="sidebar-nav-item">
                      <Link
                        to={item.path}
                        className={`sidebar-nav-link ${active ? 'is-active' : ''}`}
                        title={!expanded ? item.label : undefined}
                        onClick={() => setMobileOpen(false)}
                      >
                        {/* 3D Icon Container */}
                        <div className="nav-icon-3d-box">
                          <ItemIcon size={18} className="nav-icon" />
                          {active && <span className="active-gold-beacon" />}
                        </div>

                        {/* Text Label & Badge in Expanded State */}
                        {expanded && (
                          <div className="nav-label-group">
                            <span className="nav-label-text">{item.label}</span>
                            {item.badge && <span className="nav-badge-pill">{item.badge}</span>}
                          </div>
                        )}

                        {/* Hover Holographic Tooltip for Collapsed State */}
                        {!expanded && (
                          <div className="collapsed-hover-tooltip" role="tooltip">
                            <span>{item.label}</span>
                            {item.badge && <small>{item.badge}</small>}
                          </div>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer User Shortcut */}
        <footer className="sidebar-footer">
          <Link
            to="/dashboard"
            className="sidebar-user-pill"
            title="My FITMATE Passport & Profile"
            onClick={() => setMobileOpen(false)}
          >
            <div className="user-avatar-gem">
              <User size={15} />
            </div>
            {expanded && (
              <div className="user-text-group">
                <span className="user-name">Guest Atelier</span>
                <span className="user-tier">PRO FIT ACCESS</span>
              </div>
            )}
          </Link>
        </footer>
      </aside>
    </>
  )
}
