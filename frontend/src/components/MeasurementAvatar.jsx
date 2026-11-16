import { useState } from 'react'
import { OrbitControls } from '@react-three/drei'
import SceneCanvas from '../three/SceneCanvas.jsx'
import './MeasurementAvatar.css'

function Mannequin({ angle }) {
  return <group rotation={[0, angle, 0]}>
    <mesh position={[0, 1.63, 0]} castShadow><sphereGeometry args={[.2, 28, 24]} /><meshStandardMaterial color="#d8c6ad" roughness={.7} /></mesh>
    <mesh position={[0, 1.33, 0]}><cylinderGeometry args={[.065, .08, .18, 24]} /><meshStandardMaterial color="#c9aa84" roughness={.65} /></mesh>
    <mesh position={[0, .94, 0]} castShadow><capsuleGeometry args={[.32, .46, 8, 24]} /><meshStandardMaterial color="#b99a75" roughness={.48} /></mesh>
    <mesh position={[0, .46, 0]}><sphereGeometry args={[.28, 28, 24]} /><meshStandardMaterial color="#c5a783" roughness={.56} /></mesh>
    {[-1, 1].map((side) => <group key={side}>
      <mesh position={[side * .38, 1.04, 0]} rotation={[0, 0, side * -.12]}><capsuleGeometry args={[.075, .45, 6, 16]} /><meshStandardMaterial color="#c5a783" roughness={.58} /></mesh>
      <mesh position={[side * .42, .46, 0]}><capsuleGeometry args={[.105, .76, 6, 18]} /><meshStandardMaterial color="#c5a783" roughness={.56} /></mesh>
    </group>)}
    {[1.13, .91, .65].map((height, index) => <mesh key={height} position={[0, height, .005]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[[.31, .285, .26][index], .009, 8, 56]} /><meshStandardMaterial color={index === 0 ? '#a77b4e' : '#d9c3a5'} emissive="#6c4a2b" emissiveIntensity={.15} /></mesh>)}
    <mesh position={[0, 1.13, .015]}><sphereGeometry args={[.035, 16, 16]} /><meshStandardMaterial color="#a77b4e" emissive="#a77b4e" emissiveIntensity={.3} /></mesh>
  </group>
}

const views = [{ name: 'Front', angle: 0 }, { name: 'Side', angle: Math.PI / 2 }, { name: 'Back', angle: Math.PI }]
export default function MeasurementAvatar() {
  const [view, setView] = useState(views[0])
  return <div className="measurement-avatar">
    <div className="measurement-avatar-canvas" role="img" aria-label={`${view.name} view of an illustrative mannequin guide with chest, waist and hip markers`}>
      <SceneCanvas camera={{ position: [0, .8, 4.1], fov: 36 }} loadingLabel="Preparing the measurement illustration"><ambientLight intensity={1.8} /><directionalLight position={[2, 4, 4]} intensity={2.5} castShadow /><Mannequin angle={view.angle} /><OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.3} maxPolarAngle={Math.PI / 1.8} /></SceneCanvas>
      <span className="avatar-marker avatar-marker--chest">CHEST</span><span className="avatar-marker avatar-marker--waist">WAIST</span><span className="avatar-marker avatar-marker--hip">HIP</span>
    </div>
    <div className="avatar-view-controls" role="group" aria-label="Mannequin view">
      {views.map((item) => <button type="button" key={item.name} aria-pressed={view.name === item.name} onClick={() => setView(item)}>{item.name}</button>)}
      <span>Drag to rotate</span>
    </div>
  </div>
}
