import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'

// Pre-computed static deterministic particle positions
const PORTAL_PARTICLES = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * Math.PI * 2
  const rad = 1.35 + ((i % 4) * 0.18)
  return [
    rad * Math.cos(angle),
    (i % 3 - 1) * 0.22,
    rad * Math.sin(angle),
  ]
})

function PortalGatewayScene({ accent = '#d4af37', isReducedMotion = false }) {
  const portalRingRef = useRef(null)
  const coreAuraRef = useRef(null)
  const outerRingRef = useRef(null)

  useFrame((state, delta) => {
    if (isReducedMotion) return
    const time = state.clock.getElapsedTime()

    if (portalRingRef.current) {
      portalRingRef.current.rotation.z += delta * 0.4
      portalRingRef.current.rotation.x = Math.PI * 0.35 + Math.sin(time * 0.5) * 0.08
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= delta * 0.25
      outerRingRef.current.rotation.y = Math.PI * 0.15 + Math.cos(time * 0.4) * 0.06
    }

    if (coreAuraRef.current) {
      const pulse = 1 + Math.sin(time * 2.5) * 0.06
      coreAuraRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  return (
    <>
      <ambientLight intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 0, 3]} intensity={2.4} color={accent} />

      {/* Main Celestial Golden Portal Ring */}
      <mesh ref={portalRingRef}>
        <torusGeometry args={[1.35, 0.028, 16, 64]} />
        <meshStandardMaterial
          color={accent}
          metalness={0.92}
          roughness={0.16}
          side={DoubleSide}
        />
      </mesh>

      {/* Outer Counter-Rotating Crystal Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.58, 0.016, 12, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.65}
          side={DoubleSide}
        />
      </mesh>

      {/* Central Holographic Translucent Singularity Disk */}
      <mesh ref={coreAuraRef}>
        <circleGeometry args={[1.18, 48]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.14}
          side={DoubleSide}
        />
      </mesh>

      {/* Orbiting Stardust Particles */}
      {PORTAL_PARTICLES.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      ))}
    </>
  )
}

export default function SpatialPortalsCanvas({ accent = '#d4af37', className = '' }) {
  const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className={`spatial-portals-canvas-container ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      >
        <PortalGatewayScene accent={accent} isReducedMotion={isReducedMotion} />
      </Canvas>
    </div>
  )
}
