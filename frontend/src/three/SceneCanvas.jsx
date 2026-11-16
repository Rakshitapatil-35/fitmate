import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import SceneErrorBoundary from './SceneErrorBoundary.jsx'
import SceneLoader from './SceneLoader.jsx'
import { getSceneSettings } from './sceneQuality.js'
import useSceneQuality from './useSceneQuality.js'
import './scene.css'

export default function SceneCanvas({
  camera,
  children,
  loadingLabel,
  className = '',
  shadows,
  gl,
  frameloop = 'always',
  quality,
  onReady,
}) {
  const deviceQuality = useSceneQuality()
  const selectedQuality = quality ?? deviceQuality
  const settings = useMemo(() => getSceneSettings(selectedQuality), [selectedQuality])
  const frameRef = useRef(null)
  const canvasRef = useRef(null)
  const [contextLost, setContextLost] = useState(false)
  const [generation, setGeneration] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const onLost = (event) => {
      event.preventDefault()
      setContextLost(true)
    }
    const onRestored = () => setContextLost(false)
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
    }
  }, [generation])

  useEffect(() => {
    // A lazy route can apply its CSS after Canvas first measures; remeasure once layout settles.
    const timer = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 250)
    return () => window.clearTimeout(timer)
  }, [generation])

  return (
    <SceneErrorBoundary>
      <div ref={frameRef} className={`fm-scene-frame ${className}`.trim()}>
        <Canvas
          key={generation}
          ref={canvasRef}
          className="fm-scene-canvas"
          style={{ width: '100%', height: '100%' }}
          camera={camera}
          dpr={settings.dpr}
          shadows={shadows ?? settings.shadows}
          gl={{ antialias: settings.antialias, alpha: false, ...gl }}
          frameloop={frameloop}
          performance={{ min: 0.55 }}
          onCreated={(state) => {
            const bounds = frameRef.current?.getBoundingClientRect()
            if (bounds?.width && bounds?.height) state.setSize(bounds.width, bounds.height, bounds.top, bounds.left)
            onReady?.(state)
          }}
          fallback={<div className="fm-scene-error" role="status"><strong>3D is not available on this device.</strong><p>Continue with FITMATE’s accessible page controls.</p></div>}
        >
          <Suspense fallback={<SceneLoader label={loadingLabel} />}>
            {children}
          </Suspense>
        </Canvas>
        {contextLost && <div className="fm-scene-error fm-scene-error--overlay" role="alert"><strong>3D connection interrupted.</strong><p>The scene lost its graphics context.</p><button type="button" onClick={() => { setContextLost(false); setGeneration((current) => current + 1) }}>Reload scene</button></div>}
      </div>
    </SceneErrorBoundary>
  )
}
