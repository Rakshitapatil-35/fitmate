import { useEffect, useMemo, useRef, useState } from 'react'
import { CameraControls, MeshReflectorMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
  CanvasTexture,
  DoubleSide,
  MathUtils,
} from 'three'
import AvatarModel from '../AvatarModel.jsx'
import FullBodyAvatarMannequin from '../FullBodyAvatarMannequin.jsx'
import { getReadySceneAsset } from '../assetManifest.js'

// High-precision circular optical scanning stage texture
function makeScanningStageTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1024
  const ctx = canvas.getContext('2d')

  // Dark brushed carbon-titanium ground
  ctx.fillStyle = '#14110e'
  ctx.fillRect(0, 0, 1024, 1024)

  const cx = 512
  const cy = 512

  // Concentric laser calibration rings
  const ringRadii = [80, 160, 240, 320, 400, 470]
  ringRadii.forEach((r, idx) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = idx === ringRadii.length - 1 ? 'rgba(205, 168, 99, 0.85)' : 'rgba(205, 168, 99, 0.35)'
    ctx.lineWidth = idx === ringRadii.length - 1 ? 4 : 2
    ctx.stroke()
  })

  // 360-degree radial millimeter calibration ticks
  for (let deg = 0; deg < 360; deg += 3) {
    const rad = (deg * Math.PI) / 180
    const isMajor = deg % 15 === 0
    const isCardinal = deg % 90 === 0
    const len = isCardinal ? 36 : isMajor ? 20 : 8
    const rStart = 470 - len
    const rEnd = 470

    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(rad) * rStart, cy + Math.sin(rad) * rStart)
    ctx.lineTo(cx + Math.cos(rad) * rEnd, cy + Math.sin(rad) * rEnd)
    ctx.strokeStyle = isCardinal ? '#f3d790' : isMajor ? 'rgba(205, 168, 99, 0.8)' : 'rgba(205, 168, 99, 0.3)'
    ctx.lineWidth = isCardinal ? 3 : isMajor ? 2 : 1
    ctx.stroke()
  }

  // Crosshair laser alignment axes
  ctx.beginPath()
  ctx.moveTo(cx, 40)
  ctx.lineTo(cx, 984)
  ctx.moveTo(40, cy)
  ctx.lineTo(984, cy)
  ctx.strokeStyle = 'rgba(205, 168, 99, 0.25)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = 'srgb'
  return texture
}

// 4 Optical Volumetric Scanner Sensor Towers
function ScannerTower({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Heavy circular mounting base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.1, 24]} />
        <meshStandardMaterial color="#1e1a16" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Carbon-fiber vertical column */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.038, 3.3, 16]} />
        <meshStandardMaterial color="#1a1714" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Champagne-brass vertical sensor strip */}
      <mesh position={[0, 1.7, 0.038]}>
        <boxGeometry args={[0.016, 3.2, 0.01]} />
        <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Vertical Linear LED Emitter Dots */}
      {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((y) => (
        <mesh key={y} position={[0, y, 0.045]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshBasicMaterial color="#f3d790" />
        </mesh>
      ))}
      {/* Top sensor lens head */}
      <mesh position={[0, 3.38, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.14, 20]} />
        <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Targeted soft scanner spotlight */}
      <pointLight position={[0, 2.0, 0.3]} intensity={2.2} distance={3.5} color="#ffe8be" />
    </group>
  )
}

// Curved Volumetric Holographic Enclosure
function CurvedScanChamber() {
  return (
    <group position={[0, 0, 0]}>
      {/* Back cylindrical glass screen */}
      <mesh position={[0, 1.8, -1.8]}>
        <cylinderGeometry args={[2.5, 2.5, 3.6, 48, 1, true, -Math.PI * 0.45, Math.PI * 0.9]} />
        <meshPhysicalMaterial
          color="#221d18"
          roughness={0.15}
          metalness={0.1}
          transmission={0.65}
          opacity={0.35}
          transparent
          side={DoubleSide}
        />
      </mesh>
      {/* Top Circular Scanner Ring Fixture */}
      <mesh position={[0, 3.6, 0]}>
        <torusGeometry args={[2.4, 0.035, 16, 64]} />
        <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Downward Volumetric Studio Spotlight */}
      <spotLight
        position={[0, 5.2, 0]}
        intensity={32}
        distance={8}
        angle={Math.PI / 4}
        penumbra={0.6}
        color="#fff1db"
        castShadow
      />
    </group>
  )
}

export default function MeasurementStudioScene({
  quality = 'medium',
  gender = 'female',
  heightCm = 170,
  bodyBuild = 'regular',
  activeFields = [],
  activeMarker = null,
  onMarkerClick = () => {},
  cameraView = 'front',
  zoomLevel = 'full',
  avatarRotationDeg = 0,
  autoRotate360 = false,
  avatarAssetId = null,
}) {
  const controls = useRef(null)
  const turntableRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const { camera } = useThree()

  const stageTexture = useMemo(() => makeScanningStageTexture(), [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => () => stageTexture.dispose(), [stageTexture])

  // 360-degree Smooth Turntable Rotation
  useFrame((_, delta) => {
    if (turntableRef.current) {
      if (autoRotate360) {
        turntableRef.current.rotation.y += delta * 0.75
      } else {
        const targetRad = MathUtils.degToRad(avatarRotationDeg)
        turntableRef.current.rotation.y = MathUtils.damp(turntableRef.current.rotation.y, targetRad, 6, delta)
      }
    }
  })

  // Scale factor based on user's height compared to standard 170cm
  const scale = heightCm / 170

  // Camera Management: Front / Side / Back & Zoom
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

  // 8 Core Visual Measurement Guide Specs
  const guides = useMemo(() => {
    const isMale = gender === 'male'
    const isAthletic = isMale && bodyBuild === 'athletic'
    const isBroad = isMale && bodyBuild === 'broad'

    const chestR = isAthletic ? 0.33 : isBroad ? 0.31 : isMale ? 0.29 : 0.26
    const waistR = isBroad ? 0.28 : isMale ? 0.23 : 0.18
    const hipR = isBroad ? 0.28 : isMale ? 0.24 : 0.25
    const shoulderW = isAthletic ? 0.44 : isMale ? 0.40 : 0.36
    const legCenterOffset = isMale ? 0.11 : 0.10

    return [
      {
        id: 'chest',
        type: 'ring',
        label: isMale ? 'Chest' : 'Bust',
        y: 1.18 * scale,
        radius: chestR * scale,
        note: 'Horizontal level across the fullest point of the bust/chest',
      },
      {
        id: 'waist',
        type: 'ring',
        label: 'Waist',
        y: 0.94 * scale,
        radius: waistR * scale,
        note: 'Natural waistline at the narrowest circumference',
      },
      {
        id: 'hip',
        type: 'ring',
        label: 'Hips',
        y: 0.72 * scale,
        radius: hipR * scale,
        note: 'Widest circumference around the hips and seat',
      },
      {
        id: 'shoulder',
        type: 'horizontal-caliper',
        label: 'Shoulders',
        y: 1.36 * scale,
        width: shoulderW * scale,
        note: 'Back width between the acromion shoulder bone tips',
      },
      {
        id: 'sleeveLength',
        type: 'arm-guide',
        label: 'Sleeve Length',
        start: [(shoulderW / 2) * scale, 1.36 * scale, 0],
        end: [(shoulderW / 2 + 0.035) * scale, 0.71 * scale, 0],
        note: 'Shoulder point down to the preferred wrist joint',
      },
      {
        id: 'inseam',
        type: 'vertical-caliper',
        label: 'Inseam',
        x: -(isMale ? 0.075 : 0.065) * scale,
        topY: 0.66 * scale,
        bottomY: 0.065 * scale,
        note: 'Inner crotch point down to ankle floor level',
      },
      {
        id: 'thigh',
        type: 'leg-ring',
        label: 'Thigh',
        x: legCenterOffset * scale,
        y: 0.50 * scale,
        radius: (isMale ? 0.095 : 0.088) * scale,
        note: 'Circumference around the fullest part of the upper thigh',
      },
      {
        id: 'torsoLength',
        type: 'vertical-line',
        label: 'Torso Length',
        x: 0,
        topY: 1.44 * scale,
        bottomY: 0.94 * scale,
        z: 0.185 * scale,
        note: 'Vertical distance from base of neck down to natural waist',
      },
    ]
  }, [gender, bodyBuild, scale])

  // Filter guides to only those relevant to activeFields (or show all if activeFields empty/All)
  const visibleGuides = useMemo(() => {
    if (!activeFields || activeFields.length === 0) return guides
    return guides.filter((g) => activeFields.includes(g.id))
  }, [guides, activeFields])

  const avatarAsset = avatarAssetId ? getReadySceneAsset(avatarAssetId) : null

  return (
    <>
      {/* Futuristic Scanner Laboratory Ambient & Background */}
      <color attach="background" args={['#0b0908']} />
      <fog attach="fog" args={['#0b0908', 12, 32]} />

      <ambientLight intensity={0.8} color="#faeedb" />
      <directionalLight
        position={[4, 9, 6]}
        intensity={2.8}
        color="#fff1db"
        castShadow
        shadow-mapSize-width={quality === 'high' ? 1024 : 512}
        shadow-mapSize-height={quality === 'high' ? 1024 : 512}
      />
      <directionalLight position={[-4, 7, -5]} intensity={1.5} color="#e5ceaa" />

      {/* Titanium Floor with Real-time Reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#110e0b" roughness={0.3} metalness={0.7} />
      </mesh>

      {quality === 'high' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
          <planeGeometry args={[6, 6]} />
          <MeshReflectorMaterial
            color="#1f1a14"
            roughness={0.28}
            metalness={0.3}
            blur={[120, 36]}
            resolution={256}
            mixBlur={0.75}
            mixStrength={0.65}
            mirror={0.25}
            depthScale={0.08}
          />
        </mesh>
      )}

      {/* Optical Volumetric Scanning Stage */}
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.5, 1.58, 0.1, 64]} />
        <meshStandardMaterial map={stageTexture} roughness={0.28} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.105, 0]}>
        <torusGeometry args={[1.5, 0.015, 12, 64]} />
        <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
      </mesh>

      {/* 4 Optical Sensor Towers Surrounding the Stage */}
      <ScannerTower position={[-1.75, 0, -1.75]} rotation={[0, Math.PI / 4, 0]} />
      <ScannerTower position={[1.75, 0, -1.75]} rotation={[0, -Math.PI / 4, 0]} />
      <ScannerTower position={[-1.75, 0, 1.75]} rotation={[0, (Math.PI * 3) / 4, 0]} />
      <ScannerTower position={[1.75, 0, 1.75]} rotation={[0, (-Math.PI * 3) / 4, 0]} />

      {/* Curved Volumetric Enclosure & Lighting */}
      <CurvedScanChamber />

      {/* Center 3D Avatar & Visual Measurement Guides inside Turntable */}
      <group position={[0, 0.11, 0]}>
        <group ref={turntableRef}>
          {/* Avatar Presentation */}
          {avatarAsset ? (
            <AvatarModel
              assetId={avatarAsset.id}
              heightCm={heightCm}
              pose="relaxed"
            />
          ) : (
            <FullBodyAvatarMannequin
              gender={gender}
              bodyBuild={bodyBuild}
              scale={scale}
              active
            />
          )}

          {/* Visual 3D Measurement Markers & Laser Calibration Guides */}
          {visibleGuides.map((guide) => {
            const isMarkerActive = activeMarker === guide.id
            const guideColor = isMarkerActive ? '#f3d790' : '#cda863'
            const emissiveIntensity = isMarkerActive ? 1.5 : 0.65

            if (guide.type === 'ring') {
              return (
                <group
                  key={guide.id}
                  position={[0, guide.y, 0]}
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkerClick(isMarkerActive ? null : guide.id)
                  }}
                >
                  {/* Glowing Laser Tape Ring */}
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[guide.radius + 0.02, isMarkerActive ? 0.012 : 0.006, 12, 64]} />
                    <meshStandardMaterial
                      color={guideColor}
                      emissive={guideColor}
                      emissiveIntensity={emissiveIntensity}
                      metalness={0.9}
                      roughness={0.2}
                    />
                  </mesh>
                  {/* Floating Marker Bead */}
                  <mesh position={[guide.radius + 0.04, 0, 0]}>
                    <sphereGeometry args={[isMarkerActive ? 0.038 : 0.024, 16, 16]} />
                    <meshBasicMaterial color={guideColor} />
                  </mesh>
                </group>
              )
            }

            if (guide.type === 'horizontal-caliper') {
              const halfW = guide.width / 2
              return (
                <group
                  key={guide.id}
                  position={[0, guide.y, 0]}
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkerClick(isMarkerActive ? null : guide.id)
                  }}
                >
                  {/* Horizontal Bar */}
                  <mesh position={[0, 0, 0.01]}>
                    <boxGeometry args={[guide.width, isMarkerActive ? 0.018 : 0.008, 0.008]} />
                    <meshStandardMaterial
                      color={guideColor}
                      emissive={guideColor}
                      emissiveIntensity={emissiveIntensity}
                    />
                  </mesh>
                  {/* End Ticks */}
                  {[-halfW, halfW].map((x) => (
                    <mesh key={x} position={[x, 0, 0.01]}>
                      <cylinderGeometry args={[0.016, 0.016, 0.08, 12]} />
                      <meshBasicMaterial color={guideColor} />
                    </mesh>
                  ))}
                </group>
              )
            }

            if (guide.type === 'arm-guide') {
              return (
                <group
                  key={guide.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkerClick(isMarkerActive ? null : guide.id)
                  }}
                >
                  {/* Diagonal arm measurement points */}
                  <mesh position={guide.start}>
                    <sphereGeometry args={[isMarkerActive ? 0.032 : 0.02, 12, 12]} />
                    <meshBasicMaterial color={guideColor} />
                  </mesh>
                  <mesh position={guide.end}>
                    <sphereGeometry args={[isMarkerActive ? 0.032 : 0.02, 12, 12]} />
                    <meshBasicMaterial color={guideColor} />
                  </mesh>
                  {/* Connecting arm guide line */}
                  <mesh
                    position={[
                      (guide.start[0] + guide.end[0]) / 2,
                      (guide.start[1] + guide.end[1]) / 2,
                      (guide.start[2] + guide.end[2]) / 2,
                    ]}
                    rotation={[0, 0, -Math.PI / 10]}
                  >
                    <boxGeometry args={[0.008, 0.58 * scale, 0.008]} />
                    <meshStandardMaterial
                      color={guideColor}
                      emissive={guideColor}
                      emissiveIntensity={emissiveIntensity}
                    />
                  </mesh>
                </group>
              )
            }

            if (guide.type === 'vertical-caliper') {
              const h = guide.topY - guide.bottomY
              return (
                <group
                  key={guide.id}
                  position={[guide.x, (guide.topY + guide.bottomY) / 2, 0.02]}
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkerClick(isMarkerActive ? null : guide.id)
                  }}
                >
                  <mesh>
                    <boxGeometry args={[isMarkerActive ? 0.014 : 0.006, h, 0.006]} />
                    <meshStandardMaterial
                      color={guideColor}
                      emissive={guideColor}
                      emissiveIntensity={emissiveIntensity}
                    />
                  </mesh>
                  {/* Top and Bottom Ticks */}
                  <mesh position={[0, h / 2, 0]}>
                    <boxGeometry args={[0.06, 0.012, 0.012]} />
                    <meshBasicMaterial color={guideColor} />
                  </mesh>
                  <mesh position={[0, -h / 2, 0]}>
                    <boxGeometry args={[0.06, 0.012, 0.012]} />
                    <meshBasicMaterial color={guideColor} />
                  </mesh>
                </group>
              )
            }

            if (guide.type === 'leg-ring') {
              return (
                <group
                  key={guide.id}
                  position={[guide.x, guide.y, 0]}
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkerClick(isMarkerActive ? null : guide.id)
                  }}
                >
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[guide.radius, isMarkerActive ? 0.012 : 0.006, 12, 48]} />
                    <meshStandardMaterial
                      color={guideColor}
                      emissive={guideColor}
                      emissiveIntensity={emissiveIntensity}
                    />
                  </mesh>
                </group>
              )
            }

            if (guide.type === 'vertical-line') {
              const h = guide.topY - guide.bottomY
              return (
                <group
                  key={guide.id}
                  position={[guide.x, (guide.topY + guide.bottomY) / 2, guide.z]}
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkerClick(isMarkerActive ? null : guide.id)
                  }}
                >
                  <mesh>
                    <boxGeometry args={[isMarkerActive ? 0.014 : 0.006, h, 0.006]} />
                    <meshStandardMaterial
                      color={guideColor}
                      emissive={guideColor}
                      emissiveIntensity={emissiveIntensity}
                    />
                  </mesh>
                </group>
              )
            }

            return null
          })}
        </group>

        {/* Focused Stage Downlight */}
        <pointLight position={[0, 3.2, 0.8]} intensity={8.5} distance={5} color="#fff4df" />
      </group>

      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={reducedMotion ? 0 : 0.75}
        draggingSmoothTime={reducedMotion ? 0 : 0.15}
        dollySpeed={0.5}
        truckSpeed={0.35}
        minDistance={1.8}
        maxDistance={12}
        minPolarAngle={MathUtils.degToRad(35)}
        maxPolarAngle={MathUtils.degToRad(100)}
      />
    </>
  )
}
