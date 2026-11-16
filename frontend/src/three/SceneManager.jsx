import { lazy } from 'react'
import SceneCanvas from './SceneCanvas.jsx'

const FoundationTestScene = lazy(() => import('./scenes/FoundationTestScene.jsx'))
const GrandShowroomScene = lazy(() => import('./scenes/GrandShowroomScene.jsx'))
const IndianFashionWorldScene = lazy(() => import('./scenes/IndianFashionWorldScene.jsx'))
const DiwaliFashionWorldScene = lazy(() => import('./scenes/DiwaliFashionWorldScene.jsx'))
const LehengaStudioScene = lazy(() => import('./scenes/LehengaStudioScene.jsx'))
const WalkInWardrobeScene = lazy(() => import('./scenes/WalkInWardrobeScene.jsx'))
const WesternFashionWorldScene = lazy(() => import('./scenes/WesternFashionWorldScene.jsx'))
const MensFashionWorldScene = lazy(() => import('./scenes/MensFashionWorldScene.jsx'))
const MeasurementStudioScene = lazy(() => import('./scenes/MeasurementStudioScene.jsx'))
const VirtualFittingRoomScene = lazy(() => import('./scenes/VirtualFittingRoomScene.jsx'))

const sceneRegistry = {
  foundationTest: {
    component: FoundationTestScene,
    camera: { position: [4.4, 3.1, 6.4], fov: 36, near: 0.1, far: 100 },
    loadingLabel: 'Lighting the FITMATE test scene',
    gl: { powerPreference: 'high-performance' },
  },
  grandShowroom: {
    component: GrandShowroomScene,
    camera: { position: [0, 5.6, 21], fov: 42, near: 0.1, far: 100 },
    loadingLabel: 'Opening the FITMATE grand showroom',
    gl: { powerPreference: 'high-performance' },
  },
  indianFashionWorld: {
    component: IndianFashionWorldScene,
    camera: { position: [0, 6, 24], fov: 42, near: 0.1, far: 100 },
    loadingLabel: 'Entering the FITMATE Indian Couture Palace',
    gl: { powerPreference: 'high-performance' },
  },
  diwaliWorld: {
    component: DiwaliFashionWorldScene,
    camera: { position: [0, 5.8, 22], fov: 42, near: 0.1, far: 100 },
    loadingLabel: 'Lighting the FITMATE Diwali Palace & Diyas',
    gl: { powerPreference: 'high-performance' },
  },
  lehengaStudio: {
    component: LehengaStudioScene,
    camera: { position: [0, 5.8, 22], fov: 42, near: 0.1, far: 100 },
    loadingLabel: 'Entering the FITMATE Luxury Lehenga Studio',
    gl: { powerPreference: 'high-performance' },
  },
  walkInWardrobe: {
    component: WalkInWardrobeScene,
    camera: { position: [0, 5.7, 19], fov: 43, near: 0.1, far: 100 },
    loadingLabel: 'Opening your private FITMATE wardrobe',
    gl: { powerPreference: 'high-performance' },
  },
  westernFashionWorld: {
    component: WesternFashionWorldScene,
    camera: { position: [0, 6, 24], fov: 42, near: 0.1, far: 100 },
    loadingLabel: 'Opening the FITMATE Western Fashion World',
    gl: { powerPreference: 'high-performance' },
  },
  mensFashionWorld: {
    component: MensFashionWorldScene,
    camera: { position: [0, 6, 24], fov: 42, near: 0.1, far: 100 },
    loadingLabel: 'Entering the FITMATE Men\'s Fashion World',
    gl: { powerPreference: 'high-performance' },
  },
  measurementStudio: {
    component: MeasurementStudioScene,
    camera: { position: [0, 1.4, 5.2], fov: 38, near: 0.1, far: 100 },
    loadingLabel: 'Initializing the FITMATE 3D Body Measurement Studio',
    gl: { powerPreference: 'high-performance' },
  },
  virtualFittingRoom: {
    component: VirtualFittingRoomScene,
    camera: { position: [0, 1.4, 5.2], fov: 38, near: 0.1, far: 100 },
    loadingLabel: 'Entering your FITMATE 3D Virtual Fitting Suite',
    gl: { powerPreference: 'high-performance' },
  },
}

export default function SceneManager({ sceneId, sceneProps = {}, camera, loadingLabel, gl, quality, className, onReady }) {
  const definition = sceneRegistry[sceneId]
  if (!definition) {
    return <div className="fm-scene-error" role="alert"><strong>Scene unavailable.</strong><p>No scene is registered for “{sceneId}”.</p></div>
  }

  const Scene = definition.component
  return (
    <SceneCanvas
      key={sceneId}
      camera={camera ?? definition.camera}
      loadingLabel={loadingLabel ?? definition.loadingLabel}
      gl={{ ...definition.gl, ...gl }}
      quality={quality}
      className={className}
      onReady={onReady}
    >
      <Scene {...sceneProps} />
    </SceneCanvas>
  )
}
