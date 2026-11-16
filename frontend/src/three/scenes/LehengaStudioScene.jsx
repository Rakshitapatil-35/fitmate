import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { CameraControls, Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
  CanvasTexture,
  CatmullRomCurve3,
  MathUtils,
  Vector3,
} from 'three'
import AvatarModel from '../AvatarModel.jsx'
import CoutureMannequin from '../CoutureMannequin.jsx'
import FabricStudy from '../FabricStudy.jsx'
import GarmentModel from '../GarmentModel.jsx'
import ModelAsset from '../ModelAsset.jsx'
import { getReadySceneAsset } from '../assetManifest.js'
import { lehengaCollections } from '../lehengaCatalog.js'

function makeLuxuryMarbleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1024
  const ctx = canvas.getContext('2d')

  // Base warm champagne-cream Makrana marble
  ctx.fillStyle = '#f5efe6'
  ctx.fillRect(0, 0, 1024, 1024)

  // Subtle golden amber and pearlescent veining
  for (let i = 0; i < 40; i += 1) {
    const x = (i * 179 + 43) % 1024
    const y = (i * 117 + 29) % 1024
    const curve = new CatmullRomCurve3([
      new Vector3(x - 240, y - 270, 0),
      new Vector3(x + 80, y - 80, 0),
      new Vector3(x - 60, y + 70, 0),
      new Vector3(x + 230, y + 260, 0),
    ])
    const points = curve.getPoints(28)
    ctx.beginPath()
    points.forEach((pt, idx) => (idx ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)))
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(212, 175, 55, 0.22)' : 'rgba(255, 255, 255, 0.75)'
    ctx.lineWidth = i % 2 === 0 ? 3.2 : 1.4
    ctx.stroke()
  }

  // Geometric champagne-gold perimeter border inlays
  ctx.strokeStyle = 'rgba(197, 160, 89, 0.38)'
  ctx.lineWidth = 4
  ctx.strokeRect(40, 40, 944, 944)
  ctx.strokeRect(64, 64, 896, 896)

  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = 1000
  texture.repeat.set(4, 6)
  texture.colorSpace = 'srgb'
  return texture
}

function makeVitrinePlaqueTexture(garment) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 180
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#18120c'
  ctx.fillRect(0, 0, 512, 180)

  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = 4
  ctx.strokeRect(8, 8, 496, 164)

  ctx.fillStyle = '#d4af37'
  ctx.font = '700 21px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(garment.styleCategory.toUpperCase() + ' · ' + garment.price, 256, 46)

  ctx.fillStyle = '#fff8ee'
  ctx.font = '600 32px Georgia, serif'
  ctx.fillText(garment.shortLabel || garment.label, 256, 96)

  ctx.fillStyle = '#c7b8a1'
  ctx.font = '400 20px sans-serif'
  ctx.fillText(`${garment.kalis} KALIS · ${garment.gheraMeters}M GHERA · ${garment.craft.split('&')[0]}`, 256, 140)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = 'srgb'
  return texture
}

// Classical Fluted Champagne Pillar
function ChampagneColumn({ position, height = 7.8, radius = 0.38 }) {
  return (
    <group position={position}>
      {/* Plinth Base */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[radius * 2.8, 0.4, radius * 2.8]} />
        <meshStandardMaterial color="#322216" roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Shaft */}
      <mesh position={[0, height / 2 + 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 0.92, radius, height, 32]} />
        <meshStandardMaterial color="#ede4d4" roughness={0.28} metalness={0.12} />
      </mesh>
      {/* Fluted Gold Accents */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 12
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * radius * 0.96, height / 2 + 0.4, Math.cos(angle) * radius * 0.96]}
          >
            <boxGeometry args={[0.02, height - 0.8, 0.02]} />
            <meshStandardMaterial color="#d4af37" metalness={0.88} roughness={0.22} />
          </mesh>
        )
      })}
      {/* Corinthian Champagne Capital */}
      <mesh position={[0, height + 0.4, 0]} castShadow>
        <boxGeometry args={[radius * 3, 0.38, radius * 3]} />
        <meshStandardMaterial color="#c5a25d" metalness={0.85} roughness={0.24} />
      </mesh>
    </group>
  )
}

// Full-Length Gilded Couture Mirror along the Salon Walls
function CoutureMirror({ position, rotation = [0, 0, 0], scale = [1, 1, 1] }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Gilded Champagne Frame */}
      <mesh castShadow>
        <boxGeometry args={[2.4, 5.6, 0.16]} />
        <meshStandardMaterial color="#c5a059" metalness={0.88} roughness={0.2} />
      </mesh>
      {/* Mirrored Reflective Surface */}
      <mesh position={[0, 0, 0.082]}>
        <planeGeometry args={[2.08, 5.28]} />
        <meshStandardMaterial
          color="#f4ede1"
          metalness={0.96}
          roughness={0.06}
          envMapIntensity={2.5}
        />
      </mesh>
      {/* Crest Ornament at Top */}
      <mesh position={[0, 2.92, 0.06]}>
        <cylinderGeometry args={[0.42, 0.65, 0.14, 24]} />
        <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.18} />
      </mesh>
    </group>
  )
}

// Glass Garment Display Vitrine for perimeter collection pieces
function GlassGarmentVitrine({ garment, selected, customColor, onSelect }) {
  const [x, y, z] = garment.vitrinePosition
  const facingAngle = x < 0 ? Math.PI / 2.5 : -Math.PI / 2.5
  const activeColor = selected && customColor ? customColor : garment.defaultColorHex
  const plaqueTexture = useMemo(() => makeVitrinePlaqueTexture(garment), [garment])

  useEffect(() => {
    return () => {
      plaqueTexture.dispose()
    }
  }, [plaqueTexture])

  return (
    <group
      position={[x, y, z]}
      rotation={[0, facingAngle, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(garment)
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      {/* Circular Rosewood & Gilded Plinth */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.96, 1.08, 0.36, 36]} />
        <meshPhysicalMaterial
          color={selected ? '#3d1c12' : '#22150f'}
          roughness={0.28}
          metalness={0.3}
          clearcoat={0.65}
        />
      </mesh>

      {/* Luminous Champagne Gold Ring */}
      <mesh position={[0, 0.365, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.96, 0.024, 10, 48]} />
        <meshStandardMaterial
          color={selected ? '#ffe082' : '#cda863'}
          metalness={0.94}
          roughness={0.16}
          emissive={selected ? '#d4af37' : '#5e4319'}
          emissiveIntensity={selected ? 0.7 : 0.2}
        />
      </mesh>

      {/* Haute-Couture Exhibition Dress Form & Draped Textile Study */}
      <CoutureMannequin
        position={[0, 0.36, 0]}
        scale={0.88}
        gender="female"
        silhouette="lehenga"
        fabricId={garment.fabricId}
        customColor={activeColor}
        active={selected}
        withSpotlight={false}
        showDrape
        onClick={() => onSelect(garment)}
      />

      {/* Native 3D Engraved Champagne Gold Plaque */}
      <group position={[0, 2.78, 0]}>
        <mesh>
          <boxGeometry args={[1.44, 0.52, 0.04]} />
          <meshStandardMaterial
            color={selected ? '#5c3319' : '#24160e'}
            metalness={0.5}
            roughness={0.32}
          />
        </mesh>
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[1.38, 0.48]} />
          <meshBasicMaterial map={plaqueTexture} />
        </mesh>
      </group>
    </group>
  )
}

// Central 3D Runway Plinth
function CentralStudioRunway() {
  return (
    <group position={[0, 0, -1]}>
      {/* Raised Polished Makrana Runway Ramp */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 0.24, 26]} />
        <meshPhysicalMaterial
          color="#f4ede2"
          roughness={0.15}
          metalness={0.08}
          clearcoat={0.92}
          clearcoatRoughness={0.12}
        />
      </mesh>

      {/* Velvet Burgundy Runner */}
      <mesh position={[0, 0.245, 0]} receiveShadow>
        <boxGeometry args={[2.8, 0.015, 25.6]} />
        <meshStandardMaterial color="#501824" roughness={0.65} metalness={0.04} />
      </mesh>

      {/* Champagne Gold Curbs */}
      {[-1.42, 1.42].map((x) => (
        <mesh key={x} position={[x, 0.254, 0]}>
          <boxGeometry args={[0.04, 0.01, 25.6]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.18} />
        </mesh>
      ))}
      {[-2.08, 2.08].map((x) => (
        <mesh key={x} position={[x, 0.26, 0]}>
          <boxGeometry args={[0.07, 0.025, 25.8]} />
          <meshStandardMaterial color="#c5a059" metalness={0.92} roughness={0.18} />
        </mesh>
      ))}

      {/* Central Turntable Showcase Podium */}
      <group position={[0, 0.25, -1.8]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[1.42, 1.56, 0.12, 64]} />
          <meshPhysicalMaterial color="#22140d" roughness={0.24} metalness={0.35} clearcoat={0.8} />
        </mesh>
        <mesh position={[0, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.42, 0.024, 10, 64]} />
          <meshStandardMaterial
            color="#ffd875"
            metalness={0.95}
            roughness={0.14}
            emissive="#b47b22"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
    </group>
  )
}

export default function LehengaStudioScene({
  quality = 'medium',
  selectedLehengaId = 'lehenga-bridal',
  fabricId = 'zardozi-velvet',
  selectedColorId = null,
  customColor = null,
  cameraView = 'front',
  zoomLevel = 'full',
  isRunwayMode = false,
  previewOnAvatar = false,
  autoRotate360 = false,
  avatarRotationDeg = 0,
  activeInspectionPoint = null,
  onInspectionSelect = () => {},
  onLehengaSelect = () => {},
  onPoseSupport,
}) {
  const controls = useRef(null)
  const runwayWalkerRef = useRef(null)
  const turntableRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const { camera } = useThree()

  const marbleTexture = useMemo(() => makeLuxuryMarbleTexture(), [])

  const selectedLehenga = useMemo(() => {
    return lehengaCollections.find((item) => item.id === selectedLehengaId) ?? lehengaCollections[0]
  }, [selectedLehengaId])

  const studioAsset = getReadySceneAsset('lehengaStudio')
  const garmentAsset = getReadySceneAsset(selectedLehenga.assetId)
  const avatarAsset = getReadySceneAsset('femaleAvatar')
  const supportsAvatar = Boolean(
    garmentAsset && avatarAsset?.skeletonId && garmentAsset.compatibleAvatarRigs?.includes(avatarAsset.skeletonId)
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    return () => {
      marbleTexture.dispose()
    }
  }, [marbleTexture])

  // Camera Management
  useEffect(() => {
    const currentControls = controls.current
    if (!currentControls) return

    if (isRunwayMode) {
      currentControls.setLookAt(3.8, 2.9, 11.2, 0, 1.65, -2.5, !reducedMotion)
      return
    }

    let baseTargetY = 1.65
    let distance = 5.6
    let heightOffset = 0.7

    if (zoomLevel === 'blouse-detail') {
      baseTargetY = 2.15
      distance = 2.4
      heightOffset = 0.15
    } else if (zoomLevel === 'skirt-detail') {
      baseTargetY = 1.15
      distance = 3.1
      heightOffset = 0.2
    }

    const target = [0, baseTargetY, -2.5]
    const direction = { front: [0, 0, 1], side: [1, 0, 0], back: [0, 0, -1] }[cameraView] ?? [0, 0, 1]
    const camPos = [
      target[0] + direction[0] * distance,
      target[1] + heightOffset,
      target[2] + direction[2] * distance,
    ]

    currentControls.setLookAt(...camPos, ...target, !reducedMotion)
  }, [cameraView, zoomLevel, isRunwayMode, selectedLehengaId, camera, reducedMotion])

  // Runway promenade & 360-degree turntable rotation
  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime()

    if (runwayWalkerRef.current) {
      if (isRunwayMode && !reducedMotion) {
        const cycle = (time * 0.28) % 2
        const progress = cycle <= 1 ? cycle : 2 - cycle
        const smoothZ = MathUtils.lerp(-8.2, 6.2, MathUtils.smoothstep(progress, 0, 1))
        const strideBob = Math.abs(Math.sin(time * 4.8)) * 0.03
        const hipSway = Math.sin(time * 2.4) * 0.024
        runwayWalkerRef.current.position.set(0, 0.31 + strideBob, smoothZ)
        runwayWalkerRef.current.rotation.z = hipSway

        const targetHeading = cycle <= 1 ? 0 : Math.PI
        runwayWalkerRef.current.rotation.y = MathUtils.damp(
          runwayWalkerRef.current.rotation.y,
          targetHeading,
          4,
          delta
        )
      } else {
        runwayWalkerRef.current.position.set(0, 0.31, -2.5)
        runwayWalkerRef.current.rotation.z = 0
        runwayWalkerRef.current.rotation.y = 0
      }
    }

    if (turntableRef.current) {
      if (autoRotate360 && !reducedMotion) {
        turntableRef.current.rotation.y += delta * 0.75
      } else {
        const targetRad = MathUtils.degToRad(avatarRotationDeg)
        turntableRef.current.rotation.y = MathUtils.damp(turntableRef.current.rotation.y, targetRad, 6, delta)
      }
    }
  })

  const columnPositions = [-11.4, 11.4].flatMap((x) => [-12, -6, 0, 6, 12].map((z) => [x, 0, z]))
  const mirrorPositions = [
    { pos: [-11.8, 2.8, -3], rot: [0, Math.PI / 2, 0] },
    { pos: [-11.8, 2.8, 3], rot: [0, Math.PI / 2, 0] },
    { pos: [11.8, 2.8, -3], rot: [0, -Math.PI / 2, 0] },
    { pos: [11.8, 2.8, 3], rot: [0, -Math.PI / 2, 0] },
    { pos: [0, 2.8, -18.2], rot: [0, 0, 0] },
  ]

  const inspectionCoordinates = [
    [0.34, 2.2, 0.24],
    [-0.38, 1.45, 0.35],
    [0.36, 0.85, 0.48],
  ]

  const enableShadows = quality !== 'low'

  return (
    <>
      <Environment resolution={quality === 'low' ? 64 : 128}>
        <Lightformer form="rect" intensity={3.8} color="#ffe8b8" position={[-8, 8, 4]} scale={[9, 4, 1]} />
        <Lightformer form="rect" intensity={3.2} color="#f5b800" position={[8, 7, -4]} scale={[8, 4, 1]} />
        <Lightformer form="ring" intensity={2.4} color="#fff5dc" position={[0, 10, -5]} scale={5} />
      </Environment>

      <color attach="background" args={['#100b08']} />
      <fog attach="fog" args={['#100b08', 22, 58]} />

      {/* Warm Luxury Studio Lighting */}
      <ambientLight intensity={0.92} color="#faedd9" />
      <directionalLight
        position={[-7, 14, 7]}
        intensity={3.6}
        color="#ffeed2"
        castShadow={enableShadows}
        shadow-mapSize-width={quality === 'high' ? 1024 : 512}
        shadow-mapSize-height={quality === 'high' ? 1024 : 512}
      />
      <pointLight position={[0, 9.4, -12]} intensity={44} distance={32} color="#fedba5" />
      <pointLight position={[0, 8.8, 0]} intensity={42} distance={30} color="#ffdeaa" />
      {quality !== 'low' && <pointLight position={[0, 7.8, 12]} intensity={30} distance={26} color="#ffe4be" />}

      {studioAsset ? (
        <Suspense fallback={null}>
          <ModelAsset assetId="lehengaStudio" />
        </Suspense>
      ) : (
        <>
          {/* Reflective Makrana Marble Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow={enableShadows}>
            <planeGeometry args={[28, 42]} />
            <meshPhysicalMaterial
              map={marbleTexture}
              color="#f8f2e8"
              roughness={0.18}
              metalness={0.09}
              clearcoat={quality === 'low' ? 0.35 : 0.8}
              clearcoatRoughness={0.14}
            />
          </mesh>

          {/* Real-Time Reflection on High Quality Devices */}
          {quality === 'high' && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.006, -1]} receiveShadow>
              <planeGeometry args={[16, 36]} />
              <MeshReflectorMaterial
                color="#ebe1d2"
                roughness={0.16}
                metalness={0.15}
                blur={[120, 36]}
                resolution={256}
                mixBlur={0.76}
                mixStrength={0.78}
                mirror={0.34}
                depthScale={0.1}
              />
            </mesh>
          )}

          {/* Grand Neoclassical Salon Walls & Gilded Coffered Ceiling */}
          <mesh position={[0, 4.6, -19]}>
            <boxGeometry args={[28, 9.4, 0.6]} />
            <meshStandardMaterial color="#2b1a13" roughness={0.65} metalness={0.1} />
          </mesh>
          <mesh position={[0, 9.4, 0]}>
            <boxGeometry args={[28, 0.5, 42]} />
            <meshStandardMaterial color="#1a100b" roughness={0.7} />
          </mesh>

          {/* Full-Length Couture Mirrors along Salon Walls */}
          {mirrorPositions.map((m, idx) => (
            <CoutureMirror key={idx} position={m.pos} rotation={m.rot} />
          ))}

          {/* Fluted Champagne-Gold Columns */}
          {columnPositions.map((pos, idx) => (
            <ChampagneColumn key={idx} position={pos} />
          ))}

          {/* Central 3D Runway Plinth */}
          <CentralStudioRunway quality={quality} />
        </>
      )}

      {/* Perimeter Glass Vitrines for all 10 Lehengas */}
      {lehengaCollections.map((garment) => (
        <GlassGarmentVitrine
          key={garment.id}
          garment={garment}
          selected={garment.id === selectedLehenga.id}
          customColor={customColor}
          onSelect={onLehengaSelect}
        />
      ))}

      {/* Central Turntable Featured Lehenga Presentation */}
      <group ref={runwayWalkerRef} position={[0, 0.31, -2.5]}>
        <group ref={turntableRef}>
          {/* 1. Production GLB lehenga on runway plinth */}
          {garmentAsset && !previewOnAvatar && (
            <Suspense fallback={null}>
              <GarmentModel
                asset={garmentAsset}
                fabricId={fabricId}
                colorVariantId={selectedColorId}
                motionEnabled={isRunwayMode}
              />
            </Suspense>
          )}

          {/* 2. Production GLB rigged avatar wearing compatible lehenga GLB */}
          {garmentAsset && previewOnAvatar && supportsAvatar && (
            <Suspense fallback={null}>
              <AvatarModel
                assetId="femaleAvatar"
                garmentAssetId={garmentAsset.id}
                colour={customColor}
                garmentFabricId={fabricId}
                garmentColorVariantId={selectedColorId}
                heightCm={170}
                pose={isRunwayMode ? 'walk' : 'relaxed'}
                onPoseSupport={onPoseSupport}
              />
            </Suspense>
          )}

          {/* 3. Honest Haute-Couture Exhibition Dress Form & PBR Textile Study when GLB is pending */}
          {(!garmentAsset || (previewOnAvatar && !supportsAvatar)) && (
            <>
              <CoutureMannequin
                gender="female"
                silhouette="lehenga"
                fabricId={fabricId ?? selectedLehenga.fabricId}
                customColor={customColor}
                active
                withSpotlight={false}
                showDrape
              />
              {(zoomLevel === 'blouse-detail' || zoomLevel === 'skirt-detail') && (
                <FabricStudy
                  fabricId={fabricId ?? selectedLehenga.fabricId}
                  position={[0.98, 1.45, 0.12]}
                />
              )}
            </>
          )}

          {/* Clickable 3D Gemstone Inspection Pins (Native WebGL) */}
          {!isRunwayMode &&
            selectedLehenga.inspectionPoints?.map((pt, index) => {
              const pos = inspectionCoordinates[index] ?? [0, 1.5, 0.3]
              const isPointActive = activeInspectionPoint?.id === pt.id
              return (
                <group
                  key={pt.id}
                  position={pos}
                  onClick={(e) => {
                    e.stopPropagation()
                    onInspectionSelect(isPointActive ? null : pt)
                  }}
                  onPointerOver={() => {
                    document.body.style.cursor = 'pointer'
                  }}
                  onPointerOut={() => {
                    document.body.style.cursor = ''
                  }}
                >
                  <mesh>
                    <octahedronGeometry args={[isPointActive ? 0.075 : 0.055, 0]} />
                    <meshStandardMaterial
                      color={isPointActive ? '#fff2b2' : '#f5b800'}
                      emissive={isPointActive ? '#ff8f00' : '#b45309'}
                      emissiveIntensity={isPointActive ? 1.5 : 0.75}
                      metalness={0.8}
                      roughness={0.18}
                    />
                  </mesh>
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.095, 0.012, 8, 24]} />
                    <meshBasicMaterial
                      color={isPointActive ? '#ffd875' : '#e5a93c'}
                      transparent
                      opacity={isPointActive ? 0.95 : 0.55}
                    />
                  </mesh>
                </group>
              )
            })}
        </group>

        {/* Dedicated Follow-Spotlights */}
        <pointLight position={[0, 3.6, 0.9]} intensity={16} distance={8} color="#fff2d6" />
        {quality !== 'low' && <pointLight position={[0, 2.4, -1.1]} intensity={8} distance={6} color="#ffd484" />}
      </group>

      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={reducedMotion ? 0 : 0.75}
        draggingSmoothTime={reducedMotion ? 0 : 0.16}
        dollySpeed={0.55}
        truckSpeed={0.4}
        minDistance={2.6}
        maxDistance={32}
        minPolarAngle={MathUtils.degToRad(32)}
        maxPolarAngle={MathUtils.degToRad(108)}
      />
    </>
  )
}
