import { Component, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'

class OrbErrorBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}

// Pre-computed static deterministic coordinates for inner micro particles
const PARTICLE_COORDS = Array.from({ length: 18 }, (_, i) => {
  const theta = (i / 18) * Math.PI * 2
  const phi = Math.acos(((i * 2 + 1) / 18) - 1)
  const r = 0.3 + ((i % 5) * 0.06)
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  ]
})

function OrbScene({ accentColor = '#dfc17b', animIntensity = 'full' }) {
  const outerSphereRef = useRef(null)
  const innerCoreRef = useRef(null)
  const ring1Ref = useRef(null)
  const ring2Ref = useRef(null)

  const isAnimated = animIntensity !== 'off'
  const speedMult = animIntensity === 'subtle' ? 0.35 : 1.0

  useFrame((state, delta) => {
    if (!isAnimated || (typeof document !== 'undefined' && document.hidden)) return
    const time = state.clock.getElapsedTime() * speedMult

    if (outerSphereRef.current) {
      outerSphereRef.current.rotation.y += delta * 0.4 * speedMult
      outerSphereRef.current.rotation.x = Math.sin(time * 0.8) * 0.12
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y -= delta * 0.9 * speedMult
      innerCoreRef.current.rotation.z += delta * 0.5 * speedMult
      const pulse = 1 + Math.sin(time * 3.2) * 0.08
      innerCoreRef.current.scale.set(pulse, pulse, pulse)
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.7 * speedMult
      ring1Ref.current.rotation.x = Math.PI * 0.35 + Math.sin(time) * 0.1
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.6 * speedMult
      ring2Ref.current.rotation.y = Math.PI * 0.25 + Math.cos(time * 0.9) * 0.1
    }
  })

  return (
    <>
      <ambientLight intensity={1.4} color="#ffffff" />
      <directionalLight position={[2, 3, 4]} intensity={2.2} color="#fff8e7" />
      <pointLight position={[-2, -2, -2]} intensity={1.2} color={accentColor} />

      {/* 1. Outer Sculpted Glass Orb with Specular Sheen */}
      <mesh ref={outerSphereRef}>
        <sphereGeometry args={[0.78, 32, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.06}
          metalness={0.12}
          transmission={0.88}
          thickness={0.65}
          ior={1.45}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* 2. Inner Glowing Chromatic Jewel Core */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[0.34, 1]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* 3. Floating Micro Gold Particles */}
      {PARTICLE_COORDS.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      ))}

      {/* 4. Dual Celestial Orbital Rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.96, 0.015, 12, 48]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.92}
          roughness={0.18}
          side={DoubleSide}
        />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.08, 0.012, 12, 48]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.85}
          roughness={0.25}
          side={DoubleSide}
          transparent
          opacity={0.7}
        />
      </mesh>
    </>
  )
}

export default function Floating3DOrb({
  accentColor = '#dfc17b',
  animIntensity = 'full',
  size = 56,
}) {
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const isAnimated = animIntensity !== 'off' && !reducedMotion

  const fallback = (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, #fff 0%, ${accentColor} 60%, #120f0c 100%)`,
        boxShadow: `0 0 12px ${accentColor}88`,
      }}
    />
  )

  return (
    <div
      className="floating-3d-orb-canvas-wrapper"
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <OrbErrorBoundary fallback={fallback}>
        <Canvas
          camera={{ position: [0, 0, 2.7], fov: 42 }}
          dpr={[1, 1.5]}
          frameloop={isAnimated ? 'always' : 'demand'}
          gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
          fallback={fallback}
        >
          <OrbScene accentColor={accentColor} animIntensity={animIntensity} />
        </Canvas>
      </OrbErrorBoundary>
    </div>
  )
}
