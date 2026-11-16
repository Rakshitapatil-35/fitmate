import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Heart,
  LayoutDashboard,
  Plus,
  Ruler,
  Search,
  Shirt,
  UserRound,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BrandWordmark, Button, Eyebrow, Surface, TextField } from '../components/DesignSystem.jsx'
import { demoProfile } from '../demoFitData.js'
import {
  clearDemoAccountData,
  loadDemoAccount,
  loadMeasurements,
  loadRecentChecks,
  saveDemoAccount,
  saveMeasurements as saveMeasurementsToStorage,
} from '../measurementStorage.js'
import './DashboardPage.css'

const measurements = Object.entries(demoProfile.measurements).map(([key, value]) => ({
  key,
  name: key[0].toUpperCase() + key.slice(1),
  value: `${value} cm`,
}))

const recommendations = [
  {
    brand: 'FORME STUDIO',
    product: 'Relaxed cotton shirt',
    category: 'WOMEN · TOPS',
    size: 'M',
    note: 'Regular fit',
    tone: 'stone',
  },
  {
    brand: 'NORTHLINE',
    product: 'Straight-leg trouser',
    category: 'MEN · BOTTOMS',
    size: '32',
    note: 'Comfort fit',
    tone: 'olive',
  },
]

const dashboardNav = [
  { href: '#dashboard', label: 'Dashboard', icon: LayoutDashboard, current: true },
  { to: '/measurements', label: 'My Measurements', icon: Ruler },
  { to: '/find-my-size', label: 'Find My Size', icon: Search },
  { to: '/collections', label: 'Collections', icon: Shirt },
  { to: '/my-wardrobe', label: 'My Wardrobe', icon: Heart },
  { href: '#account', label: 'Account', icon: UserRound },
]

function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(() => loadDemoAccount() ?? demoProfile)
  const [profileDraft, setProfileDraft] = useState(profile)
  const [profileErrors, setProfileErrors] = useState({})
  const [profileNotice, setProfileNotice] = useState('')
  const [recentChecks] = useState(() => loadRecentChecks())
  const [measurementValues, setMeasurementValues] = useState(() => loadMeasurements() ?? Object.fromEntries(measurements.map(({ key, value }) => [key, Number.parseFloat(value)])))
  const [measurementDraft, setMeasurementDraft] = useState(measurementValues)
  const [isMeasurementsSaved, setIsMeasurementsSaved] = useState(() => Boolean(loadMeasurements()))
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [measurementNotice, setMeasurementNotice] = useState('')
  const measurementDialogRef = useRef(null)
  const profileDialogRef = useRef(null)
  const deleteDialogRef = useRef(null)
  const measurementCount = Object.values(measurementValues).filter((value) => Number.isFinite(Number(value)) && Number(value) > 0).length
  const profileInitials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || demoProfile.initials

  useEffect(() => {
    const dialog = measurementDialogRef.current
    if (isEditingMeasurements && dialog && !dialog.open) dialog.showModal()
    if (!isEditingMeasurements && dialog?.open) dialog.close()
    const profileDialog = profileDialogRef.current
    if (isEditingProfile && profileDialog && !profileDialog.open) profileDialog.showModal()
    if (!isEditingProfile && profileDialog?.open) profileDialog.close()
    const deleteDialog = deleteDialogRef.current
    if (isConfirmingDelete && deleteDialog && !deleteDialog.open) deleteDialog.showModal()
    if (!isConfirmingDelete && deleteDialog?.open) deleteDialog.close()
  }, [isEditingMeasurements, isEditingProfile, isConfirmingDelete])

  const openMeasurementEditor = () => {
    setMeasurementDraft(measurementValues)
    setIsEditingMeasurements(true)
  }

  const updateMeasurementDraft = ({ target }) => {
    setMeasurementDraft((current) => ({ ...current, [target.name]: target.value }))
  }

  const saveMeasurements = (event) => {
    event.preventDefault()
    const nextMeasurements = Object.fromEntries(Object.entries(measurementDraft).map(([name, value]) => [name.toLowerCase(), Number(value)]))
    if (!saveMeasurementsToStorage(nextMeasurements)) {
      setMeasurementNotice('Your browser could not save these values. Please try the Measurement Profile page.')
      return
    }
    setMeasurementValues(nextMeasurements)
    setIsMeasurementsSaved(true)
    setMeasurementNotice('Measurements saved in this browser only. They are not sent to an account or backend.')
    setIsEditingMeasurements(false)
  }

  const openProfileEditor = () => {
    setProfileDraft(profile)
    setProfileErrors({})
    setProfileNotice('')
    setIsEditingProfile(true)
  }

  const saveProfile = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!profileDraft.name.trim()) nextErrors.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileDraft.email.trim())) nextErrors.email = 'Enter a valid email address.'
    setProfileErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const nextProfile = { name: profileDraft.name.trim(), email: profileDraft.email.trim() }
    if (!saveDemoAccount(nextProfile)) {
      setProfileNotice('This browser could not save the demo profile. Try again.')
      return
    }
    setProfile(nextProfile)
    setProfileNotice('Profile details saved in this browser only.')
    setIsEditingProfile(false)
  }

  const deleteDemoAccount = () => {
    if (!clearDemoAccountData()) return
    setIsConfirmingDelete(false)
    navigate('/signup', { state: { demoAccountDeleted: true } })
  }

  return (
    <div className="dashboard-page" id="dashboard">
      <header className="dashboard-topbar">
        <BrandWordmark to="/" />
        <div className="dashboard-topbar-actions">
          <span className="dashboard-demo-badge"><span /> DEMO PROFILE</span>
          <a className="dashboard-avatar" href="#account" aria-label={`View ${profile.name}'s account`}>{profileInitials}</a>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-label">YOUR SPACE</div>
          <nav className="dashboard-nav" aria-label="Dashboard navigation">
            {dashboardNav.map(({ href, to, label, icon: Icon, current }) => {
              const className = current ? 'dashboard-nav-link is-current' : 'dashboard-nav-link'
              const content = <><Icon size={17} strokeWidth={1.7} /><span>{label}</span>{current && <span className="dashboard-nav-indicator" aria-hidden="true" />}</>
              return to
                ? <Link className={className} to={to} key={label}>{content}</Link>
                : <a className={className} href={href} aria-current={current ? 'page' : undefined} key={label}>{content}</a>
            })}
          </nav>
          <div className="dashboard-sidebar-note">
            <CircleHelp size={17} strokeWidth={1.6} />
            <span>Need a hand?<br /><a href="mailto:hello@fitmate.com">Talk to FITMATE</a></span>
          </div>
          <div className="dashboard-sidebar-footer">SAMPLE DATA · NOT CONNECTED</div>
        </aside>

        <main className="dashboard-main">
          <section className="dashboard-welcome" aria-labelledby="dashboard-heading">
            <div>
              <Eyebrow>Your fit, at a glance</Eyebrow>
              <h1 id="dashboard-heading">Welcome back, {profile.name.split(' ')[0]}.</h1>
              <p>Your fit profile is ready when you are.</p>
            </div>
            <span className="dashboard-date">FITMATE MEMBER · DEMO</span>
          </section>
          {location.state?.demoAuth && <p className="dashboard-demo-auth" role="status">Demo {location.state.demoAuth} complete. No account was created and no authentication service is connected.</p>}

          <section className="dashboard-overview-grid" aria-label="Profile overview">
            <Surface as="article" className="dashboard-profile-card" id="account">
              <div className="dashboard-card-heading">
                <span className="dashboard-avatar dashboard-avatar--large">{profileInitials}</span>
                <span className="dashboard-sample-tag">{loadDemoAccount() ? 'LOCAL PROFILE' : 'SAMPLE PROFILE'}</span>
              </div>
              <h2>{profile.name}</h2>
              <p className="dashboard-profile-email">{profile.email}</p>
              <div className="dashboard-profile-divider" />
              <div className="dashboard-profile-status">
                <span className="dashboard-status-icon"><Check size={14} /></span>
                <span><strong>{isMeasurementsSaved ? 'Measurements saved' : 'Sample profile not saved'}</strong><small>{measurementCount} of {measurements.length} measurements available</small></span>
              </div>
            </Surface>

            <Surface as="article" className="dashboard-measurement-card" id="measurements">
              <div className="dashboard-card-title-row">
                <div>
                  <Eyebrow>BODY PROFILE</Eyebrow>
                  <h2>Your measurements</h2>
                </div>
                <Ruler size={20} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="dashboard-progress-copy"><span>Profile completeness</span><strong>{measurementCount} / {measurements.length}</strong></div>
              <div className="dashboard-progress-track" role="progressbar" aria-label="Measurement profile completeness" aria-valuemin="0" aria-valuemax={measurements.length} aria-valuenow={measurementCount}>
                <span style={{ width: `${measurementCount / measurements.length * 100}%` }} />
              </div>
              <div className="dashboard-measurement-list">
                {measurements.map(({ key, name, value }) => (
                  <div className="dashboard-measurement-value" key={key}><span>{name}</span><strong>{measurementValues[key] ?? value.replace(' cm', '')} cm</strong></div>
                ))}
              </div>
              {measurementNotice && <p className="dashboard-measurement-notice" role="status">{measurementNotice}</p>}
              <Button type="button" variant="secondary" size="small" icon={ArrowUpRight} onClick={openMeasurementEditor}>Add or update measurements</Button>
            </Surface>
          </section>

          <section className="dashboard-quick-actions" aria-labelledby="quick-actions-heading">
            <div className="dashboard-section-heading">
              <div>
                <Eyebrow>MAKE YOUR NEXT MOVE</Eyebrow>
                <h2 id="quick-actions-heading">Quick actions</h2>
              </div>
            </div>
            <div className="dashboard-action-grid">
              <Surface as={Link} to="/measurements" className="dashboard-action-card">
                <span className="dashboard-action-icon"><Plus size={19} /></span>
                <span><strong>Add or update measurements</strong><small>Keep your fit profile current</small></span>
                <ArrowRight size={17} className="dashboard-action-arrow" />
              </Surface>
              <Surface as={Link} to="/find-my-size" className="dashboard-action-card dashboard-action-card--dark">
                <span className="dashboard-action-icon"><Search size={19} /></span>
                <span><strong>Find My Size</strong><small>Explore a sample recommendation</small></span>
                <ArrowRight size={17} className="dashboard-action-arrow" />
              </Surface>
            </div>
          </section>

          <section className="dashboard-recommendations" id="recent-sizes" aria-labelledby="recommendations-heading">
            <div className="dashboard-section-heading dashboard-recommendations-heading">
              <div>
                <Eyebrow>RECENTLY SAVED</Eyebrow>
                <h2 id="recommendations-heading">Size recommendations</h2>
              </div>
              <span className="dashboard-sample-tag">SAMPLE DATA</span>
            </div>
            <div className="dashboard-recommendation-list">
              {recommendations.map(({ brand, product, category, size, note, tone }) => (
                <Surface as="article" className="dashboard-recommendation" key={product}>
                  <span className={`dashboard-product-mark dashboard-product-mark--${tone}`}><Shirt size={22} strokeWidth={1.4} /></span>
                  <span className="dashboard-product-copy"><small>{category}</small><strong>{product}</strong><span>{brand} · {note}</span></span>
                  <span className="dashboard-size-label"><small>YOUR SIZE</small><strong>{size}</strong></span>
                  <ArrowUpRight className="dashboard-recommendation-arrow" size={17} aria-hidden="true" />
                </Surface>
              ))}
            </div>
            <p className="dashboard-demo-caption">These examples are illustrative only and are not based on a real fit calculation.</p>
          </section>

          <section className="dashboard-recent-checks" aria-labelledby="recent-checks-heading">
            <div className="dashboard-section-heading">
              <div><Eyebrow>YOUR RECENT ACTIVITY · THIS DEVICE</Eyebrow><h2 id="recent-checks-heading">Recently checked brands</h2></div>
            </div>
            {recentChecks.length > 0 ? (
              <div className="dashboard-recent-check-list">
                {recentChecks.map((check) => (
                  <Link className="dashboard-recent-check" to="/find-my-size" key={`${check.brandId}-${check.product}`}>
                    <span><strong>{check.brand}</strong><small>{check.category} · {check.product}</small></span>
                    <span className="dashboard-recent-check-size">{check.size}</span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dashboard-recent-empty"><p>Brands you check will appear here after you get a sample size recommendation.</p><Link to="/find-my-size">Check a brand <ArrowRight size={14} /></Link></div>
            )}
          </section>

          <section className="dashboard-account-settings" aria-labelledby="account-settings-heading">
            <div className="dashboard-section-heading"><div><Eyebrow>PROFILE CONTROLS</Eyebrow><h2 id="account-settings-heading">Account</h2></div></div>
            {profileNotice && <p className="dashboard-measurement-notice" role="status">{profileNotice}</p>}
            <div className="dashboard-account-actions">
              <Surface as="article" className="dashboard-account-action">
                <div><strong>Edit profile</strong><small>Update the name and email shown in this local demo.</small></div>
                <Button type="button" variant="secondary" size="small" onClick={openProfileEditor}>Edit profile</Button>
              </Surface>
              <Surface as="article" className="dashboard-account-action dashboard-account-action--delete">
                <div><strong>Delete account</strong><small>Remove profile, measurements and recent checks from this browser.</small></div>
                <Button type="button" variant="secondary" size="small" onClick={() => setIsConfirmingDelete(true)}>Delete account</Button>
              </Surface>
            </div>
            <p className="dashboard-account-disclaimer">Demo account only. There is no live account or server-side data to delete.</p>
          </section>

          <section className="dashboard-find-size" id="find-size" aria-labelledby="find-size-heading">
            <div className="dashboard-find-copy">
              <Eyebrow>START A NEW SIZE CHECK</Eyebrow>
              <h2 id="find-size-heading">A better fit is<br /><em>one step away.</em></h2>
              <p>FITMATE compares your profile with how a brand’s pieces are designed to fit. This dashboard preview uses sample recommendations.</p>
              <Button to="/find-my-size" icon={ArrowRight}>Find My Size</Button>
            </div>
            <div className="dashboard-find-mark" aria-hidden="true"><Search size={72} strokeWidth={1} /><span>FITMATE</span></div>
          </section>

          <section className="dashboard-how" id="how-it-works" aria-labelledby="dashboard-how-heading">
            <div className="dashboard-section-heading">
              <div>
                <Eyebrow>A SIMPLE FIT ROUTINE</Eyebrow>
                <h2 id="dashboard-how-heading">How FITMATE works</h2>
              </div>
              <Link to="/how-it-works" className="dashboard-learn-link">Learn more <ArrowUpRight size={14} /></Link>
            </div>
            <ol className="dashboard-how-list">
              <li><span>01</span><strong>Add your measurements</strong></li>
              <li><span>02</span><strong>Choose a brand and item</strong></li>
              <li><span>03</span><strong>See your suggested size</strong></li>
            </ol>
          </section>

          <footer className="dashboard-footer">
            <BrandWordmark to="/" />
            <span>Demo dashboard. No account data is connected or stored.</span>
          </footer>
        </main>
      </div>

      <dialog
        className="dashboard-edit-dialog"
        ref={measurementDialogRef}
        aria-labelledby="measurement-dialog-title"
        onClose={() => setIsEditingMeasurements(false)}
      >
        <form className="dashboard-edit-form" onSubmit={saveMeasurements}>
          <div className="dashboard-edit-heading">
            <div>
              <Eyebrow>DEMO PROFILE</Eyebrow>
              <h2 id="measurement-dialog-title">Update measurements</h2>
            </div>
            <button className="dashboard-edit-close" type="button" aria-label="Close measurements editor" onClick={() => setIsEditingMeasurements(false)}>×</button>
          </div>
            <p>Changes are stored in local browser storage only. They are not sent to an account or backend.</p>
          <div className="dashboard-edit-fields">
            {measurements.map(({ key, name }) => (
              <TextField
                key={key}
                label={`${name} (cm)`}
                name={key}
                type="number"
                min="1"
                max="250"
                step="0.1"
                value={measurementDraft[key] ?? ''}
                onChange={updateMeasurementDraft}
                required
              />
            ))}
          </div>
          <div className="dashboard-edit-actions">
            <Button type="button" variant="secondary" onClick={() => setIsEditingMeasurements(false)}>Cancel</Button>
            <Button type="submit" icon={Check}>Update sample</Button>
          </div>
        </form>
      </dialog>

      <dialog
        className="dashboard-edit-dialog"
        ref={profileDialogRef}
        aria-labelledby="profile-dialog-title"
        onClose={() => setIsEditingProfile(false)}
      >
        <form className="dashboard-edit-form" onSubmit={saveProfile}>
          <div className="dashboard-edit-heading">
            <div><Eyebrow>LOCAL DEMO PROFILE</Eyebrow><h2 id="profile-dialog-title">Edit profile</h2></div>
            <button className="dashboard-edit-close" type="button" aria-label="Close profile editor" onClick={() => setIsEditingProfile(false)}>×</button>
          </div>
          <p>Only your name and email are stored in this browser. Passwords are never stored.</p>
          <div className="dashboard-edit-fields dashboard-profile-fields">
            <TextField label="Full name" name="name" autoComplete="name" value={profileDraft.name} onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))} error={profileErrors.name} required />
            <TextField label="Email address" name="email" type="email" autoComplete="email" value={profileDraft.email} onChange={(event) => setProfileDraft((current) => ({ ...current, email: event.target.value }))} error={profileErrors.email} required />
          </div>
          <div className="dashboard-edit-actions">
            <Button type="button" variant="secondary" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
            <Button type="submit" icon={Check}>Save profile</Button>
          </div>
        </form>
      </dialog>

      <dialog
        className="dashboard-edit-dialog dashboard-delete-dialog"
        ref={deleteDialogRef}
        aria-labelledby="delete-dialog-title"
        onClose={() => setIsConfirmingDelete(false)}
      >
        <div>
          <div className="dashboard-edit-heading">
            <div><Eyebrow>LOCAL DEMO DATA</Eyebrow><h2 id="delete-dialog-title">Delete account data?</h2></div>
            <button className="dashboard-edit-close" type="button" aria-label="Close delete confirmation" onClick={() => setIsConfirmingDelete(false)}>×</button>
          </div>
          <p>This clears your locally saved demo profile, measurements and recently checked brands from this browser. No backend account exists.</p>
          <div className="dashboard-edit-actions">
            <Button type="button" variant="secondary" onClick={() => setIsConfirmingDelete(false)}>Keep profile</Button>
            <Button type="button" onClick={deleteDemoAccount}>Delete local data</Button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default DashboardPage
