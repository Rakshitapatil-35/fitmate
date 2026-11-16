import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from '../three/SceneCanvas.jsx'
import './FashionShowroom.css'

const looks = [
  { id: 'silk', name: 'Terracotta study', note: 'Gloss study · Abstract material', color: '#a45d48', roughness: 0.23, accent: '#d9ac86' },
  { id: 'moss', name: 'Moss study', note: 'Matte study · Abstract material', color: '#566a52', roughness: 0.68, accent: '#b2a07b' },
  { id: 'noir', name: 'Charcoal study', note: 'Soft sheen · Abstract material', color: '#34343b', roughness: 0.52, accent: '#b5a891' },
]

function makeDrapeGeometry() {
  const radialSegments = 96
  const heightSegments = 32
  const positions = []
  const uvs = []
  const indices = []

  for (let row = 0; row <= heightSegments; row += 1) {
    const t = row / heightSegments
    const y = 1.08 - t * 2.25
    const flare = 0.29 + t * 0.57 + Math.pow(t, 5) * 0.1
    for (let column = 0; column <= radialSegments; column += 1) {
      const angle = (column / radialSegments) * Math.PI * 2
      const pleat = Math.cos(angle * 12 + t * 1.8) * (0.018 + t * 0.043)
      const radius = flare + pleat
      positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.58)
      uvs.push(column / radialSegments, t)
    }
  }

  for (let row = 0; row < heightSegments; row += 1) {
    for (let column = 0; column < radialSegments; column += 1) {
      const a = row * (radialSegments + 1) + column
      const b = a + radialSegments + 1
      indices.push(a, a + 1, b, a + 1, b + 1, b)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function makeBodiceGeometry() {
  const radialSegments = 64
  const rings = [
    { y: -0.06, radius: 0.31 },
    { y: 0.08, radius: 0.34 },
    { y: 0.4, radius: 0.29 },
    { y: 0.69, radius: 0.39 },
    { y: 0.84, radius: 0.36 },
  ]
  const positions = []
  const indices = []
  rings.forEach(({ y, radius }, row) => {
    for (let column = 0; column <= radialSegments; column += 1) {
      const angle = (column / radialSegments) * Math.PI * 2
      const shoulder = row === rings.length - 1 ? Math.sin(angle) * 0.035 : 0
      positions.push(Math.cos(angle) * radius, y + shoulder, Math.sin(angle) * radius * 0.62)
    }
  })
  for (let row = 0; row < rings.length - 1; row += 1) {
    for (let column = 0; column < radialSegments; column += 1) {
      const a = row * (radialSegments + 1) + column
      const b = a + radialSegments + 1
      indices.push(a, a + 1, b, a + 1, b + 1, b)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function Dress({ look }) {
  const drape = useMemo(() => makeDrapeGeometry(), [])
  const bodice = useMemo(() => makeBodiceGeometry(), [])
  return (
    <group position={[0, -0.12, 0]}>
      <mesh geometry={drape} castShadow receiveShadow>
        <meshPhysicalMaterial color={look.color} roughness={look.roughness} metalness={0.08} sheen={0.55} sheenRoughness={0.34} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={bodice} castShadow receiveShadow>
        <meshPhysicalMaterial color={look.color} roughness={look.roughness} metalness={0.06} sheen={0.45} sheenRoughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 0]} castShadow>
        <torusGeometry args={[0.305, 0.028, 12, 80]} />
        <meshStandardMaterial color={look.accent} metalness={0.42} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.79, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.018, 10, 48, Math.PI]} />
        <meshStandardMaterial color={look.accent} metalness={0.28} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.03, 0]} castShadow>
        <sphereGeometry args={[0.08, 24, 20]} />
        <meshStandardMaterial color="#d8c9b4" roughness={0.85} />
      </mesh>
    </group>
  )
}

function AtelierScene({ look, autoRotate }) {
  const garment = useRef(null)
  const target = useRef({ x: 0, y: 0.12 })
  const invalidate = useThree((state) => state.invalidate)
  useFrame((_, delta) => {
    if (!garment.current) return
    if (autoRotate) garment.current.rotation.y += delta * 0.12
    garment.current.rotation.y = THREE.MathUtils.damp(garment.current.rotation.y, target.current.y, 1.8, delta)
    garment.current.rotation.x = THREE.MathUtils.damp(garment.current.rotation.x, target.current.x, 1.8, delta)
    if (Math.abs(garment.current.rotation.y - target.current.y) > 0.001 || Math.abs(garment.current.rotation.x - target.current.x) > 0.001) invalidate()
  })
  const point = (event) => {
    event.stopPropagation()
    target.current = { x: (event.pointer.y - 0.5) * 0.12, y: (event.pointer.x - 0.5) * 0.8 }
    invalidate()
  }
  const resetPoint = () => {
    target.current = { x: 0, y: 0.12 }
    invalidate()
  }

  return (
    <group>
      <color attach="background" args={['#d9d0c2']} />
      <fog attach="fog" args={['#d9d0c2', 5.5, 10]} />
      <ambientLight intensity={1.55} />
      <directionalLight position={[-3, 5, 4]} intensity={3.1} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[3, 4, -1]} intensity={40} angle={0.5} penumbra={0.8} color="#fff0dc" />
      <group ref={garment} onPointerMove={point} onPointerLeave={resetPoint}>
        <Dress look={look} />
      </group>
      <mesh position={[0, -1.42, 0]} receiveShadow>
        <cylinderGeometry args={[0.93, 1.05, 0.13, 80]} />
        <meshStandardMaterial color="#b7a88f" roughness={0.52} metalness={0.2} />
      </mesh>
      <mesh position={[0, -1.54, 0]} receiveShadow>
        <cylinderGeometry args={[1.12, 1.12, 0.11, 80]} />
        <meshStandardMaterial color="#786c5d" roughness={0.48} metalness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.63, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#d9d0c2" roughness={0.94} />
      </mesh>
    </group>
  )
}

export default function FashionShowroom() {
  const [lookIndex, setLookIndex] = useState(0)
  const [autoRotate, setAutoRotate] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const look = looks[lookIndex]
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setAutoRotate(!preference.matches)
    preference.addEventListener('change', updateMotion)
    return () => preference.removeEventListener('change', updateMotion)
  }, [])
  return (
    <div className="showroom" aria-label="Interactive procedural fashion silhouette study">
      <SceneCanvas camera={{ position: [0, 0.15, 5.2], fov: 34 }} loadingLabel="Preparing the silhouette study" gl={{ alpha: false }} frameloop={autoRotate ? 'always' : 'demand'}>
        <AtelierScene look={look} autoRotate={autoRotate} />
      </SceneCanvas>
      <div className="showroom-heading"><span>FITMATE · 3D FORM STUDY</span><span>01 / 03</span></div>
      <div className="showroom-product-card" aria-live="polite">
        <span className="showroom-product-label">PROCEDURAL FORM · CONCEPT STUDY</span>
        <strong>{look.name}</strong>
        <span>{look.note}</span>
      </div>
      <div className="showroom-look-selector" role="group" aria-label="Select an atelier look">
        {looks.map((item, index) => (
          <button key={item.id} type="button" className={index === lookIndex ? 'is-active' : ''} aria-label={`Show ${item.name}`} aria-pressed={index === lookIndex} onClick={() => setLookIndex(index)}>
            <span style={{ '--swatch-color': item.color }} />
          </button>
        ))}
        <span>EXPLORE TEXTURES</span>
      </div>
      <span className="showroom-instruction">ABSTRACT TEXTILE STUDY · NOT A GARMENT MODEL</span>
    </div>
  )
}
