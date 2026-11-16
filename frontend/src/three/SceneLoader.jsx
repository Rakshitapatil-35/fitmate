import { Html, useProgress } from '@react-three/drei'

export default function SceneLoader({ label = 'Preparing this 3D experience' }) {
  const { progress, item } = useProgress()
  const detail = item ? `Loading ${item.split('/').at(-1)}` : `${Math.round(progress)}%`

  return (
    <Html center>
      <div className="fm-scene-loader" role="status" aria-live="polite">
        <span className="fm-scene-loader__mark" aria-hidden="true" />
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
    </Html>
  )
}
