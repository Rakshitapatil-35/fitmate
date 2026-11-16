import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Eye,
  Move,
  Palette,
  RefreshCw,
  Sliders,
  Sparkles,
  Sun,
  X,
  Zap,
} from 'lucide-react'
import Floating3DOrb from './Floating3DOrb.jsx'
import {
  themePresets,
  useFmtTheme,
} from '../themeStore.js'
import './ThemeCustomizer.css'

const luxuryAccentJewels = [
  { name: 'Champagne Gold', hex: '#d4af37' },
  { name: 'Tuscan Rose', hex: '#e09f9f' },
  { name: 'Panna Emerald', hex: '#34d399' },
  { name: 'Prismatic Cyan', hex: '#38bdf8' },
  { name: 'Diya Amber', hex: '#f59e0b' },
  { name: 'Obsidian Pearl', hex: '#c4bcb0' },
  { name: 'Royal Crimson', hex: '#b91c1c' },
  { name: 'Kashi Violet', hex: '#a855f7' },
]

export default function ThemeCustomizer({ className = '' }) {
  const [open, setOpen] = useState(false)
  const { settings, preset, updateTheme, resetTheme } = useFmtTheme()
  const panelRef = useRef(null)
  const triggerRef = useRef(null)

  const activeAccent = settings.customAccent ?? preset.accent

  // Keyboard accessibility & external dispatch triggers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    const handleOpenExternal = () => setOpen(true)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('fitmate-open-theme-customizer', handleOpenExternal)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('fitmate-open-theme-customizer', handleOpenExternal)
    }
  }, [open])

  const handleSelectPreset = (presetKey) => {
    updateTheme({
      preset: presetKey,
      customAccent: null, // reset custom accent to preset's curated signature
      lightingMood: themePresets[presetKey]?.lightingMood ?? 'warm',
    })
  }

  const handleSelectAccent = (hex) => {
    updateTheme({ customAccent: hex })
  }

  const handleAtmosphereChange = (atm) => {
    updateTheme({ atmosphere: atm })
  }

  const handleLightingChange = (light) => {
    updateTheme({ lightingMood: light })
  }

  const handleGlassChange = (glass) => {
    updateTheme({ glassPanel: glass })
  }

  const handleAnimChange = (anim) => {
    updateTheme({ animationIntensity: anim })
  }

  const toggleCornerPosition = () => {
    const nextPos = settings.cornerPosition === 'top-right' ? 'bottom-right' : 'top-right'
    updateTheme({ cornerPosition: nextPos })
  }

  const isTopRight = settings.cornerPosition === 'top-right'

  return (
    <div
      className={`theme-customizer-root ${isTopRight ? 'is-top-right' : 'is-bottom-right'} ${className}`.trim()}
    >
      {/* Floating 3D Orb Interactive Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        className={`floating-theme-orb-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Customize FITMATE Theme & Visual Universe"
        title="Customize Fashion Universe Theme & Atmosphere"
      >
        <div className="orb-halo-glow" style={{ boxShadow: `0 0 28px ${activeAccent}44` }} />
        <Floating3DOrb
          accentColor={activeAccent}
          animIntensity={settings.animationIntensity}
          size={52}
        />
        <div className="orb-text-badge">
          <Palette size={11} />
          <span>THEME</span>
        </div>
      </button>

      {/* Mobile-Friendly Backdrop to dismiss panel and prevent accidental 3D clickthrough */}
      {open && (
        <div
          className="theme-panel-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Glassmorphism Customization Suite Panel */}
      {open && (
        <section
          ref={panelRef}
          className="theme-floating-glass-panel"
          role="dialog"
          aria-modal="true"
          aria-label="FITMATE Theme Customisation Studio"
        >
          {/* Panel Header */}
          <header className="theme-panel-header">
            <div className="header-title-group">
              <span className="header-tag">
                <Sparkles size={11} />
                FITMATE UNIVERSE ATELIER
              </span>
              <h2>Visual Atmosphere</h2>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="btn-corner-toggle"
                onClick={toggleCornerPosition}
                title={`Move control to ${isTopRight ? 'bottom-right' : 'top-right'}`}
                aria-label="Toggle corner position"
              >
                <Move size={13} />
              </button>
              <button
                type="button"
                className="btn-close-theme"
                onClick={() => setOpen(false)}
                aria-label="Close customisation panel"
              >
                <X size={15} />
              </button>
            </div>
          </header>

          <p className="theme-panel-intro">
            Live customized styles propagate immediately across the entire FITMATE interface and connected 3D fashion worlds.
          </p>

          <div className="theme-panel-scrollable-body">
            {/* Section 1: 8 Curated Luxury Fashion Themes */}
            <div className="theme-config-section">
              <div className="section-title-row">
                <Palette size={12} />
                <span>CURATED THEME COLLECTION (8 THEMES)</span>
              </div>

              <div className="theme-presets-grid" role="group" aria-label="Select theme preset">
                {Object.entries(themePresets).map(([key, item]) => {
                  const isSelected = settings.preset === key
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`theme-card-btn ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => handleSelectPreset(key)}
                      aria-pressed={isSelected}
                    >
                      <div className="theme-card-top">
                        <div className="theme-swatch-pills">
                          <span className="dot paper-dot" style={{ backgroundColor: item.paper }} />
                          <span className="dot surface-dot" style={{ backgroundColor: item.surface }} />
                          <span className="dot accent-dot" style={{ backgroundColor: item.accent }} />
                        </div>
                        {isSelected && (
                          <span className="theme-check-icon">
                            <Check size={11} />
                          </span>
                        )}
                      </div>
                      <strong className="theme-title">{item.label}</strong>
                      <small className="theme-desc">{item.description}</small>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Section 2: Live Accent Color Customizer */}
            <div className="theme-config-section">
              <div className="section-title-row">
                <Sliders size={12} />
                <span>ACCENT JEWEL COLOUR</span>
              </div>

              <div className="accent-jewels-row">
                {luxuryAccentJewels.map((j) => {
                  const isSelected = activeAccent.toLowerCase() === j.hex.toLowerCase()
                  return (
                    <button
                      key={j.hex}
                      type="button"
                      className={`jewel-chip-btn ${isSelected ? 'is-selected' : ''}`}
                      style={{ backgroundColor: j.hex }}
                      onClick={() => handleSelectAccent(j.hex)}
                      title={j.name}
                      aria-label={`Select ${j.name}`}
                    />
                  )
                })}

                <div className="custom-color-picker-box">
                  <input
                    type="color"
                    value={activeAccent}
                    onChange={(e) => handleSelectAccent(e.target.value)}
                    aria-label="Choose custom accent colour"
                    title="Choose custom hex colour"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Background Atmosphere & Lighting Mood */}
            <div className="theme-config-section">
              <div className="section-title-row">
                <Sun size={12} />
                <span>ATMOSPHERE & LIGHTING MOOD</span>
              </div>

              <div className="setting-choice-group">
                <label className="sub-label">Background Atmosphere:</label>
                <div className="choice-pills-row">
                  {[
                    { id: 'default', label: 'Atmospheric Gradient' },
                    { id: 'minimal', label: 'Monochrome Minimal' },
                    { id: 'cinematic', label: 'Cinematic Vignette' },
                  ].map((atm) => (
                    <button
                      key={atm.id}
                      type="button"
                      className={`choice-pill-btn ${settings.atmosphere === atm.id ? 'is-active' : ''}`}
                      onClick={() => handleAtmosphereChange(atm.id)}
                    >
                      {atm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-choice-group">
                <label className="sub-label">3D Scene Lighting Temperature:</label>
                <div className="choice-pills-row">
                  {[
                    { id: 'warm', label: 'Warm Champagne (3000K)' },
                    { id: 'studio', label: 'Studio Runway (4500K)' },
                    { id: 'dramatic', label: 'Dramatic High-Contrast' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className={`choice-pill-btn ${settings.lightingMood === l.id ? 'is-active' : ''}`}
                      onClick={() => handleLightingChange(l.id)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Glass-Panel Appearance */}
            <div className="theme-config-section">
              <div className="section-title-row">
                <Eye size={12} />
                <span>GLASS-PANEL TEXTURE</span>
              </div>

              <div className="choice-pills-row">
                {[
                  { id: 'frosted', label: 'Frosted Silk (22px Blur)' },
                  { id: 'ultra-clear', label: 'Ultra-Clear Crystal' },
                  { id: 'smoked', label: 'Smoked Obsidian' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`choice-pill-btn ${settings.glassPanel === g.id ? 'is-active' : ''}`}
                    onClick={() => handleGlassChange(g.id)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 5: Animation Intensity */}
            <div className="theme-config-section">
              <div className="section-title-row">
                <Zap size={12} />
                <span>ANIMATION INTENSITY</span>
              </div>

              <div className="choice-pills-row">
                {[
                  { id: 'full', label: 'Full Cinematic' },
                  { id: 'subtle', label: 'Subtle Restrained' },
                  { id: 'off', label: 'Off / Static' },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`choice-pill-btn ${settings.animationIntensity === a.id ? 'is-active' : ''}`}
                    onClick={() => handleAnimChange(a.id)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Footer Actions */}
          <footer className="theme-panel-footer">
            <button
              type="button"
              className="btn-theme-reset"
              onClick={resetTheme}
              title="Reset all settings to Luxury Beige"
            >
              <RefreshCw size={12} />
              <span>Reset to Default</span>
            </button>

            <button
              type="button"
              className="btn-theme-apply"
              onClick={() => setOpen(false)}
            >
              <Check size={13} />
              <span>Save & Close</span>
            </button>
          </footer>
        </section>
      )}
    </div>
  )
}
