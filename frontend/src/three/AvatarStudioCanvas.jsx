import SceneCanvas from './SceneCanvas.jsx'
import AvatarStudioScene from './scenes/AvatarStudioScene.jsx'

export default function AvatarStudioCanvas(props) {
  return <SceneCanvas
    className="avatar-studio-scene-frame"
    camera={{ position: [0, 1.2, 5.4], fov: 35, near: 0.1, far: 100 }}
    loadingLabel="Preparing your avatar studio"
    gl={{ powerPreference: 'high-performance' }}
  >
    <AvatarStudioScene {...props} />
  </SceneCanvas>
}
