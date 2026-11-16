import SceneCanvas from './SceneCanvas.jsx'
import GarmentStudioScene from './scenes/GarmentStudioScene.jsx'

export default function GarmentStudioCanvas(props) {
  return <SceneCanvas
    className="garment-studio-scene-frame"
    camera={{ position: [0, 1.2, 5.5], fov: 35, near: 0.1, far: 100 }}
    loadingLabel="Preparing the garment studio"
    gl={{ powerPreference: 'high-performance' }}
  >
    <GarmentStudioScene {...props} />
  </SceneCanvas>
}
