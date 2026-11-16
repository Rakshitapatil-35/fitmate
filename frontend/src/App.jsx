import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Compass,
  Crown,
  Flame,
  Layers,
  Layers3,
  Menu,
  Palette,
  RotateCcw,
  Ruler,
  Scissors,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  UserCheck,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BrandWordmark, Button, Eyebrow } from './components/DesignSystem.jsx'
import SpatialNavigation from './components/SpatialNavigation.jsx'
import LuxurySidebar from './components/LuxurySidebar.jsx'
import ThemeCustomizer from './components/ThemeCustomizer.jsx'
import HolographicStylist from './components/HolographicStylist.jsx'
import { showroomPortals } from './three/showroomPortals.js'
import './HomePage.css'
import useGsapReveal from './animation/useGsapReveal.js'
import './three/showroom-ui.css'

const SceneManager = lazy(() => import('./three/SceneManager.jsx'))
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const CollectionsPage = lazy(() => import('./pages/CollectionsPage.jsx'))
const FindMySizePage = lazy(() => import('./pages/FindMySizePage.jsx'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage.jsx'))
const MeasurementProfilePage = lazy(() => import('./pages/MeasurementProfilePage.jsx'))
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage.jsx'))
const MyWardrobePage = lazy(() => import('./pages/MyWardrobePage.jsx'))
const AvatarStudioPage = lazy(() => import('./pages/AvatarStudioPage.jsx'))
const GarmentStudioPage = lazy(() => import('./pages/GarmentStudioPage.jsx'))
const SizeResultPage = lazy(() => import('./pages/SizeResultPage.jsx'))
const WesternFashionPage = lazy(() => import('./pages/WesternFashionPage.jsx'))
const MensFashionPage = lazy(() => import('./pages/MensFashionPage.jsx'))
const FoundationTestPage = lazy(() => import('./three/FoundationTestPage.jsx'))
const IndianEthnicUniversePage = lazy(() => import('./pages/IndianEthnicUniversePage.jsx'))
const DiwaliFashionWorldPage = lazy(() => import('./pages/DiwaliFashionWorldPage.jsx'))
const LehengaStudioPage = lazy(() => import('./pages/LehengaStudioPage.jsx'))
const VirtualFittingRoomPage = lazy(() => import('./pages/VirtualFittingRoomPage.jsx'))
const FashionRunwayPage = lazy(() => import('./pages/FashionRunwayPage.jsx'))
const PersonalStylistPage = lazy(() => import('./pages/PersonalStylistPage.jsx'))
const OutfitBuilderPage = lazy(() => import('./pages/OutfitBuilderPage.jsx'))
const FitPassportPage = lazy(() => import('./pages/FitPassportPage.jsx'))
const BrandComparisonPage = lazy(() => import('./pages/BrandComparisonPage.jsx'))
const FabricExplorerPage = lazy(() => import('./pages/FabricExplorerPage.jsx'))
const FitHistoryPage = lazy(() => import('./pages/FitHistoryPage.jsx'))

const PORTAL_ICONS = {
  womens: Shirt,
  menswear: Scissors,
  indian: Crown,
  diwali: Flame,
  lehenga: Compass,
  western: Layers,
  measurements: Ruler,
  fitting: UserCheck,
  'find-size': Zap,
  wardrobe: ShoppingBag,
  'digital-twin': UserRound,
}

function HomePage() {
  const [selectedPortalId, setSelectedPortalId] = useState('womens')
  const [showIntroReveal, setShowIntroReveal] = useState(true)
  const [activeViewMode, setActiveViewMode] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const heroRef = useRef(null)
  useGsapReveal(heroRef)

  const activePortal = useMemo(() => (
    showroomPortals.find((p) => p.id === selectedPortalId) || showroomPortals[0]
  ), [selectedPortalId])

  const handlePortalSelect = useCallback((portal) => {
    setSelectedPortalId(portal.id || portal)
    setShowIntroReveal(false)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="fitmate-home">
      {/* Navigation Header */}
      <header className="home-header">
        <BrandWordmark to="/" onClick={closeMenu} />
        <button
          className="home-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="home-navigation"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={menuOpen ? 'home-nav is-open' : 'home-nav'} id="home-navigation" aria-label="Main navigation">
          <Link to="/collections" onClick={closeMenu}>Collections</Link>
          <Link to="/indian-ethnic-wear" onClick={closeMenu}>Indian Couture</Link>
          <Link to="/womens-fashion" onClick={closeMenu}>Women</Link>
          <Link to="/mens-fashion" onClick={closeMenu}>Men</Link>
          <Link to="/virtual-fitting-room" onClick={closeMenu}>3D Try-On</Link>
          <Link to="/measurements" onClick={closeMenu}>Measurements</Link>
          <Link className="home-login-link" to="/login" onClick={closeMenu}>Login</Link>
          <Button to="/signup" size="small" icon={ArrowUpRight} onClick={closeMenu}>Get Started</Button>
        </nav>
      </header>

      <main>
        {/* ==================================================================
            GRAND 3D SHOWROOM CENTERPIECE
            ================================================================== */}
        <section
          className="home-hero grand-showroom"
          id="home"
          ref={heroRef}
          aria-label="FITMATE Grand Luxury 3D Showroom"
        >
          {/* Three.js Grand Showroom Canvas */}
          <div className="grand-showroom-canvas" aria-label="Interactive 3D Grand Luxury Architecture">
            <Suspense fallback={<div className="grand-showroom-loading" role="status">Entering the FITMATE Grand Showroom…</div>}>
              <SceneManager
                sceneId="grandShowroom"
                sceneProps={{
                  selectedDepartment: selectedPortalId,
                  onDepartmentSelect: handlePortalSelect,
                }}
              />
            </Suspense>
          </div>

          {/* Vignette Depth Overlay */}
          <div className="grand-showroom-vignette" aria-hidden="true" />

          {/* 1. FIRST IMPRESSION: Sophisticated Logo Reveal & Welcome Overlay */}
          {showIntroReveal && (
            <div className="grand-showroom-reveal-overlay">
              <div className="reveal-crest-wrap">
                <span className="reveal-monogram">FM</span>
                <span className="reveal-halo" />
              </div>
              <span className="reveal-kicker">HAUTE-COUTURE 3D FASHION UNIVERSE</span>
              <h2 className="reveal-title">
                One Body. Every Brand.<br /><em>One Perfect Fit.</em>
              </h2>
              <p className="reveal-description">
                Step inside the world’s most advanced 3D fashion showroom. Explore 10 immersive haute-couture pavilions,
                discover tailor-grade biometrics, and experience live garment draping.
              </p>
              <div className="reveal-actions">
                <button
                  type="button"
                  className="btn-enter-showroom"
                  onClick={() => setShowIntroReveal(false)}
                >
                  <Sparkles size={14} /> Enter Grand Showroom
                </button>
                <button
                  type="button"
                  className="btn-skip-intro"
                  onClick={() => setShowIntroReveal(false)}
                >
                  Explore Freely (360° Roam)
                </button>
              </div>
            </div>
          )}

          {/* 2. Top-Left Headline & Active World Beacon */}
          <div className="grand-showroom-welcome">
            <div className="welcome-beacon">
              <span className="welcome-dot" />
              <span>GRAND LUXURY SHOWROOM</span>
            </div>
            <h1>
              The 3D Fashion<br /><em>Showroom.</em>
            </h1>
            <p>One Body. Every Brand. One Perfect Fit.</p>
          </div>

          {/* 3. Top-Right View Modes */}
          <div className="showroom-view-modes" role="group" aria-label="Showroom camera perspectives">
            <button
              type="button"
              className={activeViewMode === 'overview' ? 'is-active' : ''}
              onClick={() => {
                setActiveViewMode('overview')
                setSelectedPortalId('womens')
              }}
            >
              Overview
            </button>
            <button
              type="button"
              className={activeViewMode === 'couture' ? 'is-active' : ''}
              onClick={() => {
                setActiveViewMode('couture')
                setSelectedPortalId('indian')
              }}
            >
              Couture Wing
            </button>
            <button
              type="button"
              className={activeViewMode === 'sartorial' ? 'is-active' : ''}
              onClick={() => {
                setActiveViewMode('sartorial')
                setSelectedPortalId('menswear')
              }}
            >
              Sartorial Wing
            </button>
            <button
              type="button"
              className={activeViewMode === 'tech' ? 'is-active' : ''}
              onClick={() => {
                setActiveViewMode('tech')
                setSelectedPortalId('measurements')
              }}
            >
              Fit Tech Lab
            </button>
          </div>

          {/* 4. Bottom-Left Active Portal Card */}
          <div className="showroom-active-portal-card" aria-live="polite">
            <div className="active-portal-header">
              <span className="active-portal-index">PORTAL {activePortal.index}</span>
              <span className="active-portal-tag">{activePortal.tagline}</span>
            </div>
            <h3 className="active-portal-title">{activePortal.label}</h3>
            <p className="active-portal-desc">{activePortal.note}</p>
            <div className="active-portal-actions">
              <Link to={activePortal.route} className="btn-launch-portal">
                Enter World <ArrowUpRight size={13} />
              </Link>
              <button
                type="button"
                className="btn-stylist-concierge"
                onClick={() => window.dispatchEvent(new CustomEvent('fitmate:open-stylist'))}
                title="Consult AURA AI Personal Stylist"
              >
                <Palette size={13} /> Stylist
              </button>
            </div>
          </div>

          {/* 5. Bottom-Right 10-Portal Interactive Directory Drawer */}
          <div className="grand-showroom-departments" aria-label="10 Showroom Fashion Worlds">
            <div className="departments-header">
              <span>FASHION UNIVERSES (10)</span>
              <Sparkles size={12} color="#d6b46a" />
            </div>
            <div className="departments-list">
              {showroomPortals.map((portal) => (
                <button
                  key={portal.id}
                  type="button"
                  className={`showroom-dept-btn ${selectedPortalId === portal.id ? 'is-active' : ''}`}
                  onClick={() => handlePortalSelect(portal)}
                >
                  <span className="dept-index">{portal.index}</span>
                  <span>{portal.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 6. Interaction Hint */}
          <div className="showroom-orbit-hint" aria-hidden="true">
            <span className="hint-dot" />
            <span>DRAG TO ORBIT 360° · SCROLL TO ZOOM · CLICK PORTAL TO FLY</span>
          </div>
        </section>

        {/* ==================================================================
            SHOWROOM PROMISE BANNER
            ================================================================== */}
        <section className="home-promise" aria-label="FITMATE House Promise">
          <span>ONE BODY</span>
          <i aria-hidden="true" />
          <p>Every brand. <em>One perfect fit.</em></p>
          <i aria-hidden="true" />
          <span>MADE AROUND YOU</span>
        </section>

        {/* ==================================================================
            10 FASHION MULTIVERSE PORTALS SHOWCASE
            ================================================================== */}
        <section className="home-section" id="portals-universe" aria-label="Interactive Fashion Multiverse Portals">
          <div className="home-section-heading">
            <div>
              <Eyebrow>HAUTE-COUTURE DESTINATIONS</Eyebrow>
              <h2>The 10 Fashion <em>Universes.</em></h2>
            </div>
            <p>
              Each pavilion is an authentic 3D environment crafted with dedicated architectural motifs, catalog assets,
              and precision fit intelligence.
            </p>
          </div>

          <div className="home-portals-grid">
            {showroomPortals.map((portal) => {
              const Icon = PORTAL_ICONS[portal.id] || Sparkles
              return (
                <Link
                  key={portal.id}
                  to={portal.route}
                  className="home-portal-card"
                  style={{ '--card-accent': portal.accent }}
                >
                  <div className="portal-card-top">
                    <span className="portal-card-index">{portal.index}</span>
                    <span className="portal-card-tagline">{portal.tagline}</span>
                  </div>
                  <div className="portal-card-icon">
                    <Icon size={20} />
                  </div>
                  <h3>{portal.label}</h3>
                  <p>{portal.note}</p>
                  <span className="portal-card-action">
                    Launch Environment <ArrowUpRight size={13} />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ==================================================================
            HOW FITMATE WORKS: THREE-STEP FIT INTELLIGENCE
            ================================================================== */}
        <section className="home-section" id="how-it-works" aria-label="How FITMATE Works">
          <div className="home-section-heading">
            <div>
              <Eyebrow>INTELLIGENT SIZE ACCURACY</Eyebrow>
              <h2>Three steps.<br /><em>A tailored fit.</em></h2>
            </div>
            <p>No more size guesswork or frustrating returns. Move across any luxury label with total confidence.</p>
          </div>

          <div className="home-step-grid">
            <article className="home-step">
              <div className="home-step-top">
                <span>STEP 01</span>
                <Ruler size={22} strokeWidth={1.5} />
              </div>
              <h3>Enter your measurements</h3>
              <p>Record your circumference dimensions once. Your private Fit Passport keeps them ready whenever you explore.</p>
            </article>

            <article className="home-step">
              <div className="home-step-top">
                <span>STEP 02</span>
                <UserRound size={22} strokeWidth={1.5} />
              </div>
              <h3>3D Digital Twin Simulation</h3>
              <p>Witness your anatomical proportions deformed in real time. Inspect garment drape in the Virtual Fitting Room.</p>
            </article>

            <article className="home-step">
              <div className="home-step-top">
                <span>STEP 03</span>
                <BadgeCheck size={22} strokeWidth={1.5} />
              </div>
              <h3>Intelligent Brand Recommendations</h3>
              <p>Discover your optimal size across 12 luxury brands with tailored ease tolerances for slim, regular, or relaxed cuts.</p>
            </article>
          </div>
        </section>

        {/* ==================================================================
            THE HAUTE-COUTURE GUARANTEE & PRIVACY
            ================================================================== */}
        <section className="home-section" aria-label="FITMATE Engineering Pillars">
          <div className="home-section-heading">
            <div>
              <Eyebrow>DESIGNED AROUND YOU</Eyebrow>
              <h2>The FITMATE <em>Distinction.</em></h2>
            </div>
            <p>Engineered for the discerning fashion patron who demands precision, sustainability, and absolute privacy.</p>
          </div>

          <div className="home-benefit-grid">
            <div className="home-benefit-card">
              <div className="home-benefit-icon">
                <Layers3 size={22} strokeWidth={1.5} />
              </div>
              <h3>One Profile. Every Maison.</h3>
              <p>Move seamlessly between Sabyasachi, Zara, Armani, and Raw Mango without ever restarting your sizing search.</p>
            </div>

            <div className="home-benefit-card">
              <div className="home-benefit-icon">
                <ShieldCheck size={22} strokeWidth={1.5} />
              </div>
              <h3>100% Private Tape Biometrics</h3>
              <p>Zero intrusive camera scanning, zero LiDAR video capture. All 3D geometry is computed purely from your numbers.</p>
            </div>

            <div className="home-benefit-card">
              <div className="home-benefit-icon">
                <RotateCcw size={22} strokeWidth={1.5} />
              </div>
              <h3>Sustainable Luxury</h3>
              <p>Drastically diminish size-related return shipments, reducing carbon footprint while guaranteeing your garment fits.</p>
            </div>
          </div>
        </section>

        {/* ==================================================================
            CALL TO ACTION
            ================================================================== */}
        <section className="home-get-started" id="get-started">
          <Eyebrow>YOUR BESPOKE JOURNEY BEGINS HERE</Eyebrow>
          <h2>Ready to feel<br /><em>confident in your clothes?</em></h2>
          <p>One Body. Every Brand. One Perfect Fit.</p>
          <Button to="/signup" variant="light" icon={ArrowRight}>Get Started Free</Button>
        </section>
      </main>

      {/* ==================================================================
          MIDNIGHT LUXURY FOOTER
          ================================================================== */}
      <footer className="home-footer">
        <div className="home-footer-main">
          <div className="home-footer-brand">
            <BrandWordmark to="/" />
            <p>One Body. Every Brand.<br />One Perfect Fit.</p>
          </div>
          <nav className="home-footer-nav" aria-label="Footer navigation">
            <Link to="/collections">Collections</Link>
            <Link to="/indian-ethnic-wear">Indian Ethnic</Link>
            <Link to="/womens-fashion">Women's Fashion</Link>
            <Link to="/mens-fashion">Men's Fashion</Link>
            <Link to="/virtual-fitting-room">Virtual Fitting Room</Link>
            <Link to="/measurements">Measurement Studio</Link>
            <Link to="/find-my-size">Find My Size</Link>
            <Link to="/my-wardrobe">My Wardrobe</Link>
            <Link to="/about">About FITMATE</Link>
          </nav>
        </div>
        <div className="home-footer-bottom">
          <span>© 2026 FITMATE. HAUTE COUTURE 3D FASHION-TECH. ALL RIGHTS RESERVED.</span>
          <span>Designed with precision in Midnight Black & Champagne Gold.</span>
        </div>
      </footer>
    </div>
  )
}

function App() {
  const location = useLocation()
  const isFoundationPreview = import.meta.env.DEV && location.pathname === '/dev/3d-foundation'
  return (
    <>
      {!isFoundationPreview && <LuxurySidebar />}
      {!isFoundationPreview && <SpatialNavigation />}
      <Suspense fallback={<main className="fm-route-loading" role="status">Preparing your FITMATE experience…</main>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {import.meta.env.DEV ? <Route path="/dev/3d-foundation" element={<FoundationTestPage />} /> : null}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<AuthPage key="login" mode="login" />} />
          <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/measurements" element={<MeasurementProfilePage />} />
          <Route path="/measurement-studio" element={<MeasurementProfilePage />} />
          <Route path="/3d-body-measurements" element={<MeasurementProfilePage />} />
          <Route path="/avatar-studio" element={<AvatarStudioPage />} />
          <Route path="/digital-twin" element={<AvatarStudioPage />} />
          <Route path="/3d-avatar" element={<AvatarStudioPage />} />
          <Route path="/garment-studio" element={<GarmentStudioPage />} />
          <Route path="/my-fit-profile" element={<MeasurementProfilePage />} />
          <Route path="/body-measurements" element={<MeasurementProfilePage />} />
          <Route path="/find-my-size" element={<FindMySizePage />} />
          <Route path="/product-details" element={<ProductDetailsPage />} />
          <Route path="/my-wardrobe" element={<MyWardrobePage />} />
          <Route path="/size-result" element={<SizeResultPage />} />
          <Route path="/recommendation-results" element={<SizeResultPage />} />
          <Route path="/indian-ethnic-wear" element={<IndianEthnicUniversePage />} />
          <Route path="/indian-fashion-universe" element={<IndianEthnicUniversePage />} />
          <Route path="/western-wear" element={<WesternFashionPage />} />
          <Route path="/mens-fashion" element={<MensFashionPage />} />
          <Route path="/womens-fashion" element={<WesternFashionPage />} />
          <Route path="/diwali-edit" element={<DiwaliFashionWorldPage />} />
          <Route path="/diwali-world" element={<DiwaliFashionWorldPage />} />
          <Route path="/lehenga-studio" element={<LehengaStudioPage />} />
          <Route path="/couture-lehenga-studio" element={<LehengaStudioPage />} />
          <Route path="/virtual-fitting-room" element={<VirtualFittingRoomPage />} />
          <Route path="/fitting-room" element={<VirtualFittingRoomPage />} />
          <Route path="/3d-try-on" element={<VirtualFittingRoomPage />} />
          <Route path="/runway" element={<FashionRunwayPage />} />
          <Route path="/personal-stylist" element={<PersonalStylistPage />} />
          <Route path="/outfit-builder" element={<OutfitBuilderPage />} />
          <Route path="/fit-passport" element={<FitPassportPage />} />
          <Route path="/brand-comparison" element={<BrandComparisonPage />} />
          <Route path="/fabric-explorer" element={<FabricExplorerPage />} />
          <Route path="/fit-history" element={<FitHistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {!isFoundationPreview && (
        <ThemeCustomizer
          className={
            location.pathname === '/'
              ? 'theme-customizer--showroom'
              : location.pathname === '/my-wardrobe'
                ? 'theme-customizer--wardrobe'
                : ''
          }
        />
      )}
      {!isFoundationPreview && <HolographicStylist />}
    </>
  )
}

export default App


