export function getSceneQuality() {
  const memory = navigator.deviceMemory ?? 4
  const cores = navigator.hardwareConcurrency ?? 4
  const smallViewport = window.matchMedia('(max-width: 680px)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (memory <= 2 || cores <= 2) return 'low'
  if (smallViewport || memory <= 4 || reducedMotion) return 'medium'
  return 'high'
}

export function getSceneSettings(quality) {
  if (quality === 'low') return { dpr: 1, shadows: false, antialias: false, reflections: false, shadowMapSize: 512 }
  if (quality === 'medium') return { dpr: [1, 1.25], shadows: false, antialias: false, reflections: false, shadowMapSize: 512 }
  return { dpr: [1, 1.5], shadows: true, antialias: true, reflections: true, shadowMapSize: 1024 }
}
