import { useEffect, useState } from 'react'
import { getSceneQuality } from './sceneQuality.js'

export default function useSceneQuality() {
  const [quality, setQuality] = useState(getSceneQuality)

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setQuality(getSceneQuality())
    window.addEventListener('resize', update)
    motionPreference.addEventListener('change', update)
    return () => {
      window.removeEventListener('resize', update)
      motionPreference.removeEventListener('change', update)
    }
  }, [])

  return quality
}
