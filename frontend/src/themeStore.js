import { useEffect, useState } from 'react'

/**
 * FITMATE 8 Curated Luxury Fashion Themes
 */
export const themePresets = {
  beige: {
    id: 'beige',
    label: 'Luxury Beige',
    description: 'Natural linen, soft alabaster marble & warm champagne sand',
    paper: '#f8f4ec',
    surface: '#fffdfa',
    ink: '#211d18',
    textMuted: '#716e67',
    accent: '#b89358',
    border: '#dedad1',
    borderStrong: '#c9c3b8',
    lighting3d: '#fff8ed',
    ambient3d: '#faeedb',
    background3d: '#181512',
    lightingMood: 'warm',
    isDark: false,
  },
  black: {
    id: 'black',
    label: 'Midnight Black',
    description: 'Deep Midnight obsidian, charcoal surfaces & radiant champagne gold elegance',
    paper: '#08090C',
    surface: '#12141A',
    ink: '#F5F0E6',
    textMuted: '#A5A5AA',
    accent: '#D6B46A',
    accentSoft: '#A98A4D',
    border: 'rgba(214, 180, 106, 0.22)',
    borderStrong: '#A98A4D',
    lighting3d: '#F5F0E6',
    ambient3d: '#D6B46A',
    background3d: '#08090C',
    lightingMood: 'dramatic',
    isDark: true,
  },
  champagne: {
    id: 'champagne',
    label: 'Champagne Gold',
    description: 'Luminous gilded French salon, golden hour radiance & royal brass',
    paper: '#16130e',
    surface: '#221e16',
    ink: '#fdfaf2',
    textMuted: '#aba28f',
    accent: '#d4af37',
    border: '#362f22',
    borderStrong: '#524734',
    lighting3d: '#fdf1d6',
    ambient3d: '#f7e5be',
    background3d: '#110d08',
    lightingMood: 'warm',
    isDark: true,
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald Luxury',
    description: 'Deep Panna emerald velvet, royal jade highlights & lustrous speculars',
    paper: '#09130f',
    surface: '#11211a',
    ink: '#edf7f2',
    textMuted: '#8ba69a',
    accent: '#34d399',
    border: '#1c362b',
    borderStrong: '#294f3f',
    lighting3d: '#e6fffa',
    ambient3d: '#ccfbf1',
    background3d: '#050c09',
    lightingMood: 'studio',
    isDark: true,
  },
  rose: {
    id: 'rose',
    label: 'Rose Gold',
    description: 'Tuscan blush silk, rose quartz crystalline hues & soft twilight warmth',
    paper: '#160f12',
    surface: '#24181c',
    ink: '#fdf3f5',
    textMuted: '#a88f95',
    accent: '#e09f9f',
    border: '#38252c',
    borderStrong: '#543842',
    lighting3d: '#ffe4e6',
    ambient3d: '#fecdd3',
    background3d: '#100a0d',
    lightingMood: 'warm',
    isDark: true,
  },
  diwali: {
    id: 'diwali',
    label: 'Diwali Gold',
    description: 'Festive marigold garland, glowing clay diya warmth & temple zari',
    paper: '#180d05',
    surface: '#261509',
    ink: '#fff6e8',
    textMuted: '#ad957e',
    accent: '#f59e0b',
    border: '#3d220e',
    borderStrong: '#5e3416',
    lighting3d: '#fef3c7',
    ambient3d: '#fde68a',
    background3d: '#120803',
    lightingMood: 'warm',
    isDark: true,
  },
  ivory: {
    id: 'ivory',
    label: 'Royal Ivory',
    description: 'Pure Parisian alabaster, crisp Carrara marble & antique bronze',
    paper: '#faf7f2',
    surface: '#ffffff',
    ink: '#1c1915',
    textMuted: '#6e695f',
    accent: '#967848',
    border: '#dedad1',
    borderStrong: '#c4beb1',
    lighting3d: '#ffffff',
    ambient3d: '#fbf9f4',
    background3d: '#1a1714',
    lightingMood: 'studio',
    isDark: false,
  },
  cyber: {
    id: 'cyber',
    label: 'Cyber Luxury',
    description: 'Futuristic optical titanium, holographic cyan lasers & neo-atelier glow',
    paper: '#07090e',
    surface: '#10141f',
    ink: '#f0f6fc',
    textMuted: '#8b9bb4',
    accent: '#38bdf8',
    border: '#1a2337',
    borderStrong: '#253554',
    lighting3d: '#e0f2fe',
    ambient3d: '#bae6fd',
    background3d: '#040508',
    lightingMood: 'dramatic',
    isDark: true,
  },
}

export const defaultThemeSettings = {
  preset: 'black',
  customAccent: null,
  atmosphere: 'cinematic', // 'default' | 'minimal' | 'cinematic'
  lightingMood: 'dramatic', // 'warm' | 'studio' | 'dramatic'
  glassPanel: 'frosted',  // 'frosted' | 'ultra-clear' | 'smoked'
  animationIntensity: 'full', // 'full' | 'subtle' | 'off'
  cornerPosition: 'bottom-right', // 'bottom-right' | 'top-right'
}

const STORAGE_KEY = 'fitmate.theme.v2'

/**
 * Load Theme Settings from localStorage
 */
export function loadThemeSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultThemeSettings
    const parsed = JSON.parse(raw)
    return { ...defaultThemeSettings, ...parsed }
  } catch {
    return defaultThemeSettings
  }
}

/**
 * Apply Theme Settings to Root Document & CSS Variables
 */
export function applyThemeToDOM(settings) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const preset = themePresets[settings.preset] ?? themePresets.black
  const activeAccent = settings.customAccent ?? preset.accent

  // Set CSS Custom Properties
  root.style.setProperty('--fm-color-paper', preset.paper)
  root.style.setProperty('--fm-color-surface', preset.surface)
  root.style.setProperty('--fm-color-ink', preset.ink)
  root.style.setProperty('--fm-color-text', preset.ink)
  root.style.setProperty('--fm-color-text-muted', preset.textMuted)
  root.style.setProperty('--fm-color-brown', activeAccent)
  root.style.setProperty('--fm-color-border', preset.border)
  root.style.setProperty('--fm-color-border-strong', preset.borderStrong)

  // Spatial Midnight Luxury Redesign Variables
  root.style.setProperty('--fm-bg-canvas', preset.paper)
  root.style.setProperty('--fm-bg-surface', preset.surface)
  root.style.setProperty('--fm-text-primary', preset.ink)
  root.style.setProperty('--fm-text-muted', preset.textMuted)
  root.style.setProperty('--fm-accent-gold', activeAccent)
  root.style.setProperty('--fm-accent-gold-soft', preset.accentSoft || '#A98A4D')
  root.style.setProperty('--paper', preset.paper)
  root.style.setProperty('--surface', preset.surface)
  root.style.setProperty('--ink', preset.ink)
  root.style.setProperty('--muted', preset.textMuted)
  root.style.setProperty('--line', preset.border)
  root.style.setProperty('--brown', activeAccent)

  // Glass panel appearance
  if (settings.glassPanel === 'ultra-clear') {
    root.style.setProperty('--fm-glass-blur', '8px')
    root.style.setProperty('--fm-glass-opacity', '0.75')
  } else if (settings.glassPanel === 'smoked') {
    root.style.setProperty('--fm-glass-blur', '16px')
    root.style.setProperty('--fm-glass-opacity', '0.94')
  } else {
    // frosted default
    root.style.setProperty('--fm-glass-blur', '22px')
    root.style.setProperty('--fm-glass-opacity', '0.88')
  }

  // Animation intensity
  if (settings.animationIntensity === 'off') {
    root.style.setProperty('--fm-transition-duration', '0s')
  } else if (settings.animationIntensity === 'subtle') {
    root.style.setProperty('--fm-transition-duration', '0.15s')
  } else {
    root.style.setProperty('--fm-transition-duration', '0.35s')
  }

  // Set Dataset Attributes for declarative CSS targeting
  root.dataset.fmTheme = preset.id
  root.dataset.fmMode = preset.isDark ? 'dark' : 'light'
  root.dataset.fmAtmosphere = settings.atmosphere
  root.dataset.fmLighting = settings.lightingMood
  root.dataset.fmGlass = settings.glassPanel
  root.dataset.fmAnim = settings.animationIntensity

  // Dispatch custom event for 3D canvases and listeners
  window.dispatchEvent(
    new CustomEvent('fitmate-theme-change', {
      detail: { settings, preset, activeAccent },
    })
  )
}

// Global in-memory listener store for React subscribers
const listeners = new Set()

export function getActiveThemeSettings() {
  return currentSettings
}

let currentSettings = typeof window !== 'undefined' ? loadThemeSettings() : defaultThemeSettings
if (typeof window !== 'undefined') {
  applyThemeToDOM(currentSettings)
}

export function updateThemeSettings(updater) {
  const nextSettings = typeof updater === 'function' ? updater(currentSettings) : { ...currentSettings, ...updater }
  currentSettings = nextSettings
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings))
  } catch {
    // Ignore storage quota in restricted mode
  }
  applyThemeToDOM(nextSettings)
  listeners.forEach((fn) => fn(nextSettings))
}

export function resetThemeSettings() {
  updateThemeSettings(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore
    }
    return defaultThemeSettings
  })
}

/**
 * React Hook for consuming active theme settings
 */
export function useFmtTheme() {
  const [settings, setSettings] = useState(() => currentSettings)

  useEffect(() => {
    listeners.add(setSettings)
    return () => listeners.delete(setSettings)
  }, [])

  return {
    settings,
    preset: themePresets[settings.preset] ?? themePresets.beige,
    updateTheme: updateThemeSettings,
    resetTheme: resetThemeSettings,
  }
}
