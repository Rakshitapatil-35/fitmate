import { useEffect, useMemo, useRef, useState } from 'react'
import { CameraControls, MeshReflectorMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
  CanvasTexture,
  DoubleSide,
  MathUtils,
} from 'three'
import FullBodyAvatarMannequin from '../FullBodyAvatarMannequin.jsx'
import FittingRoomGarment3D from '../FittingRoomGarment3D.jsx'

/**
 * Procedural French Chevron Oak Parquet Texture
 */
function makeParquetFloorTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1024
  const ctx = canvas.getContext('2d')

  // Warm honey-walnut base
  ctx.fillStyle = '#221c17'
  ctx.fillRect(0, 0, 1024, 1024)

  // Chevron wood plank bands
  const plankWidth = 64
  const plankLength = 128
  const woodShades = [
    '#29221b',
    '#241d17',
    '#2c251e',
    '#1e1813',
    '#312a22',
  ]

  for (let y = 0; y < 1024; y += plankLength) {
    for (let x = 0; x < 1024; x += plankWidth * 2) {
      // Left chevron plank
      ctx.fillStyle = woodShades[Math.floor(Math.random() * woodShades.length)]
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + plankWidth, y + plankWidth)
      ctx.lineTo(x + plankWidth, y + plankLength)
      ctx.lineTo(x, y + plankLength - plankWidth)
      ctx.closePath()
      ctx.fill()

      // Right chevron plank
      ctx.fillStyle = woodShades[Math.floor(Math.random() * woodShades.length)]
      ctx.beginPath()
      ctx.moveTo(x + plankWidth, y + plankWidth)
      ctx.lineTo(x + plankWidth * 2, y)
      ctx.lineTo(x + plankWidth * 2, y + plankLength - plankWidth)
      ctx.lineTo(x + plankWidth, y + plankLength)
      ctx.closePath()
      ctx.fill()
    }
  }

  // Subtle brass inlay joints
  ctx.strokeStyle = 'rgba(205, 168, 99, 0.22)'
  ctx.lineWidth = 1.5
  for (let y = 0; y <= 1024; y += 256) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(1024, y)
    ctx.stroke()
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = 'srgb'
  return texture
}

/**
 * Architectural Standing Tri-Fold Fitting Room Mirror
 */
function TriFoldFittingMirrors({ quality = 'high' }) {
  const brassTrimProps = {
    color: '#cda863',
    metalness: 0.92,
    roughness: 0.18,
  }

  return (
    <group position={[0, 0, -2.6]}>
      {/* 1. Center Tall Mirror */}
      <group position={[0, 1.8, 0]}>
        {/* Outer Champagne Brass Frame */}
        <mesh position={[0, 0, -0.02]} castShadow>
          <boxGeometry args={[1.56, 2.76, 0.04]} />
          <meshStandardMaterial {...brassTrimProps} />
        </mesh>
        {/* Beveled Mirrored Glass Surface */}
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[1.44, 2.64]} />
          {quality === 'high' ? (
            <MeshReflectorMaterial
              color="#55514b"
              roughness={0.06}
              metalness={0.96}
              blur={[80, 20]}
              resolution={256}
              mirror={0.7}
              depthScale={0.05}
            />
          ) : (
            <meshStandardMaterial color="#3d3933" metalness={0.92} roughness={0.12} />
          )}
        </mesh>
        {/* Mirror Crown Accent */}
        <mesh position={[0, 1.42, 0.01]}>
          <boxGeometry args={[0.4, 0.06, 0.05]} />
          <meshStandardMaterial {...brassTrimProps} />
        </mesh>
      </group>

      {/* 2. Left Wing Mirror (Angled 26 degrees inward) */}
      <group position={[-1.25, 1.8, 0.25]} rotation={[0, Math.PI * 0.14, 0]}>
        <mesh position={[0, 0, -0.02]} castShadow>
          <boxGeometry args={[0.96, 2.64, 0.04]} />
          <meshStandardMaterial {...brassTrimProps} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.88, 2.54]} />
          <meshStandardMaterial color="#423e37" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* 3. Right Wing Mirror (Angled -26 degrees inward) */}
      <group position={[1.25, 1.8, 0.25]} rotation={[0, -Math.PI * 0.14, 0]}>
        <mesh position={[0, 0, -0.02]} castShadow>
          <boxGeometry args={[0.96, 2.64, 0.04]} />
          <meshStandardMaterial {...brassTrimProps} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.88, 2.54]} />
          <meshStandardMaterial color="#423e37" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Architectural Fitting Suite Curtains & Fluted Walnut Walls
 */
function FittingRoomSurroundings() {
  return (
    <group>
      {/* Fluted Dark Walnut Back Wall */}
      <mesh position={[0, 2.8, -3.2]} receiveShadow>
        <boxGeometry args={[14, 6.2, 0.3]} />
        <meshStandardMaterial color="#1a1511" roughness={0.75} />
      </mesh>
      {/* Brass Cornice Crown Line */}
      <mesh position={[0, 5.8, -3.02]}>
        <boxGeometry args={[14, 0.1, 0.15]} />
        <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Side Velvet Curtains with Deep Vertical Folds */}
      {[-2.8, 2.8].map((x) => {
        const sideSign = Math.sign(x)
        return (
          <group key={x} position={[x, 2.5, -0.8]}>
            {/* Curved Brass Curtain Rail */}
            <mesh position={[0, 2.4, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 3.2, 16]} rotation={[0, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
            </mesh>
            {/* Deep Burgundy Velvet Curtain Body */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry
                args={[0.38, 0.44, 4.8, 24, 1, false, 0, Math.PI * 1.5]}
                rotation={[0, sideSign * 0.4, 0]}
              />
              <meshPhysicalMaterial
                color="#3d1822"
                roughness={0.78}
                metalness={0.04}
                sheen={0.88}
                sheenRoughness={0.65}
                side={DoubleSide}
              />
            </mesh>
          </group>
        )
      })}

      {/* Wall Sconces with Warm Amber Glow */}
      {[-2.2, 2.2].map((x) => (
        <group key={x} position={[x, 2.6, -2.9]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.045, 0.38, 16]} />
            <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
          </mesh>
          <pointLight intensity={1.8} distance={3.2} color="#fce2b3" />
        </group>
      ))}
    </group>
  )
}

/**
 * VirtualFittingRoomScene Component
 */
export default function VirtualFittingRoomScene({
  gender = 'female',
  bodyBuild = 'regular',
  heightCm = 170,
  silhouette = 'dress',
  fabricId = 'silk',
  customColor = null,
  size = 'M',
  fitMapMode = false,
  fitAnalysis = null,
  cameraView = 'front',
  zoomLevel = 'full',
  avatarRotationDeg = 0,
  autoRotate360 = false,
  quality = 'high',
}) {
  const controls = useRef(null)
  const turntableRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const { camera } = useThree()

  const parquetTexture = useMemo(() => makeParquetFloorTexture(), [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => () => parquetTexture.dispose(), [parquetTexture])

  // Scale factor based on user's height compared to standard 170cm
  const scale = heightCm / 170

  // 360-degree Smooth Turntable Rotation
  useFrame((_, delta) => {
    if (turntableRef.current) {
      if (autoRotate360) {
        turntableRef.current.rotation.y += delta * 0.75
      } else {
        const targetRad = MathUtils.degToRad(avatarRotationDeg)
        turntableRef.current.rotation.y = MathUtils.damp(
          turntableRef.current.rotation.y,
          targetRad,
          6,
          delta
        )
      }
    }
  })

  // Camera Management: Smooth transitions between Front / Side / Back & Zoom
  useEffect(() => {
    const currentControls = controls.current
    if (!currentControls) return

    const target = [0, 1.05 * scale, 0]
    const direction = { front: [0, 0, 1], side: [1, 0, 0], back: [0, 0, -1] }[cameraView] ?? [0, 0, 1]
    const distance = zoomLevel === 'detail' ? 2.2 : 4.4
    const camPos = [
      target[0] + direction[0] * distance,
      target[1] + (zoomLevel === 'detail' ? 0.05 : 0.25),
      target[2] + direction[2] * distance,
    ]

    currentControls.setLookAt(...camPos, ...target, !reducedMotion)
  }, [cameraView, zoomLevel, camera, reducedMotion, scale])

  return (
    <>
      <CameraControls
        ref={controls}
        makeDefault
        minDistance={1.8}
        maxDistance={6.8}
        maxPolarAngle={Math.PI / 2 + 0.05}
        minPolarAngle={Math.PI / 6}
      />

      {/* Luxury Fitting Room Background & Ambient Lighting */}
      <color attach="background" args={['#110e0b']} />
      <fog attach="fog" args={['#110e0b', 10, 28]} />

      <ambientLight intensity={0.85} color="#faeedb" />
      <directionalLight
        position={[3, 8, 5]}
        intensity={2.6}
        color="#fff1db"
        castShadow
        shadow-mapSize-width={quality === 'high' ? 1024 : 512}
        shadow-mapSize-height={quality === 'high' ? 1024 : 512}
      />
      <directionalLight position={[-3, 6, -3]} intensity={1.2} color="#ebd5b7" />

      {/* Downward Podium Spotlight */}
      <spotLight
        position={[0, 5.4, 0.4]}
        intensity={26}
        distance={7.5}
        angle={Math.PI / 4.2}
        penumbra={0.65}
        color="#fff5e6"
        castShadow
      />

      {/* Chevron Parquet Wood Flooring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial map={parquetTexture} roughness={0.35} metalness={0.15} />
      </mesh>

      {/* Floor Reflections on High Quality */}
      {quality === 'high' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
          <planeGeometry args={[6, 6]} />
          <MeshReflectorMaterial
            color="#221b14"
            roughness={0.3}
            metalness={0.3}
            blur={[100, 30]}
            resolution={256}
            mixBlur={0.7}
            mixStrength={0.55}
            mirror={0.22}
            depthScale={0.06}
          />
        </mesh>
      )}

      {/* Fitting Suite Surroundings: Walls, Sconces, Curtains */}
      <FittingRoomSurroundings />

      {/* Tri-Fold Fitting Mirrors */}
      <TriFoldFittingMirrors quality={quality} />

      {/* Central Haute-Couture Fitting Podium */}
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.5, 1.58, 0.12, 48]} />
        <meshStandardMaterial color="#2d261e" roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.122, 0]}>
        <torusGeometry args={[1.5, 0.014, 12, 48]} />
        <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
      </mesh>

      {/* 360-degree Turntable Avatar & Garment Assembly */}
      <group position={[0, 0.125, 0]}>
        <group ref={turntableRef}>
          {/* 1. Realistic Full-Body 3D Mannequin Avatar */}
          <FullBodyAvatarMannequin
            gender={gender}
            bodyBuild={bodyBuild}
            scale={scale}
            active
            finish="canvas"
          />

          {/* 2. 3D Fitted Garment Overlay with Real-time Size & Tension Visualization */}
          <FittingRoomGarment3D
            silhouette={silhouette}
            fabricId={fabricId}
            customColor={customColor}
            size={size}
            fitMapMode={fitMapMode}
            gender={gender}
            scale={scale}
            fitAnalysis={fitAnalysis}
          />
        </group>
      </group>
    </>
  )
}
