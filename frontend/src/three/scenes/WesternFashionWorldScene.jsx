import { useEffect, useMemo, useRef, useState } from 'react'
import { CameraControls, MeshReflectorMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
  CanvasTexture,
  DoubleSide,
  MathUtils,
} from 'three'
import AvatarModel from '../AvatarModel.jsx'
import CoutureMannequin from '../CoutureMannequin.jsx'
import GarmentModel from '../GarmentModel.jsx'
import { getReadySceneAsset } from '../assetManifest.js'
import { westernGarments } from '../westernFashionCatalog.js'

// High-end minimalist polished terrazzo and French light oak flooring
function makeTerrazzoTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1024
  const ctx = canvas.getContext('2d')

  // Warm alabaster cement base
  ctx.fillStyle = '#e8e2d8'
  ctx.fillRect(0, 0, 1024, 1024)

  // Natural marble aggregate aggregate flecks
  const fleckColors = [
    'rgba(180, 160, 140, 0.45)',
    'rgba(140, 120, 100, 0.35)',
    'rgba(210, 200, 190, 0.65)',
    'rgba(80, 75, 70, 0.25)',
    'rgba(195, 175, 150, 0.4)',
  ]

  for (let i = 0; i < 600; i += 1) {
    const x = Math.random() * 1024
    const y = Math.random() * 1024
    const r = Math.random() * 5 + 1.5
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = fleckColors[Math.floor(Math.random() * fleckColors.length)]
    ctx.fill()
  }

  // Large brass inlay grid lines (architectural flagstone dividers)
  ctx.strokeStyle = 'rgba(190, 160, 110, 0.35)'
  ctx.lineWidth = 2.5
  for (let x = 0; x <= 1024; x += 256) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 1024)
    ctx.stroke()
  }
  for (let y = 0; y <= 1024; y += 256) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(1024, y)
    ctx.stroke()
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = 1000
  texture.repeat.set(6, 6)
  texture.colorSpace = 'srgb'
  return texture
}

// Minimalist Architectural Full-Length Arched Fitting Mirror
function StandingFittingMirror({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Heavy brushed brass stand base */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[1.5, 0.08, 0.55]} />
        <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Outer arched frame */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <boxGeometry args={[1.36, 3.55, 0.08]} />
        <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Ultra-clear silvered glass mirror surface */}
      <mesh position={[0, 1.85, 0.042]}>
        <planeGeometry args={[1.2, 3.38]} />
        <meshPhysicalMaterial
          color="#f4f5f8"
          roughness={0.02}
          metalness={0.98}
          clearcoat={1}
          clearcoatRoughness={0.02}
        />
      </mesh>
      {/* Soft perimeter mirror LED illumination */}
      <pointLight position={[0, 2.1, 0.5]} intensity={4.5} distance={3.5} color="#fff6e8" />
    </group>
  )
}

// Minimalist Brushed Brass Garment Rack with Hanging Display Swatches
function GarmentDisplayRack({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Floor feet */}
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.65, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* Vertical uprights */}
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 2.15, 16]} />
          <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* Top hanging rail */}
      <mesh position={[0, 2.15, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.95, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d8b472" metalness={0.92} roughness={0.16} />
      </mesh>
      {/* Display garments hanging along the rail */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => {
        const fabricColors = ['#1a1c22', '#e5dfd5', '#b48c66', '#1e2c3e']
        return (
          <group key={x} position={[x, 1.95, 0]}>
            {/* Hanger hook */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.14, 8]} />
              <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Wooden hanger bar */}
            <mesh position={[0, 0.01, 0]}>
              <boxGeometry args={[0.38, 0.022, 0.02]} />
              <meshStandardMaterial color="#3e2d21" roughness={0.4} />
            </mesh>
            {/* Draped hanging fabric swatch */}
            <mesh position={[0, -0.55, 0]} castShadow>
              <planeGeometry args={[0.34, 1.05]} />
              <meshStandardMaterial color={fabricColors[i]} roughness={0.5} side={DoubleSide} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// Minimalist Floating Architectural Display Shelves with Accessories
function FloatingDisplayShelves({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 3 Tiered Shelves */}
      {[0.8, 1.6, 2.4].map((y, sIdx) => (
        <group key={y} position={[0, y, 0]}>
          {/* Champagne-gold shelf plate */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.04, 0.45]} />
            <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Folded luxury knitwear & accessories on shelves */}
          {sIdx === 0 && (
            <group position={[0, 0.08, 0]}>
              {/* Folded Cashmere stacks */}
              {[-0.6, 0, 0.6].map((x, idx) => {
                const stackColors = ['#f0ece2', '#b38d65', '#141416']
                return (
                  <mesh key={x} position={[x, 0.06, 0]} castShadow>
                    <boxGeometry args={[0.34, 0.12, 0.32]} />
                    <meshStandardMaterial color={stackColors[idx]} roughness={0.7} />
                  </mesh>
                )
              })}
            </group>
          )}
          {sIdx === 1 && (
            <group position={[0, 0.1, 0]}>
              {/* Sculpted Leather Handbag Display */}
              <mesh position={[-0.4, 0.12, 0]} castShadow>
                <boxGeometry args={[0.38, 0.24, 0.18]} />
                <meshPhysicalMaterial color="#241b16" roughness={0.35} metalness={0.08} clearcoat={0.4} />
              </mesh>
              <mesh position={[0.4, 0.1, 0]} castShadow>
                <boxGeometry args={[0.3, 0.2, 0.14]} />
                <meshPhysicalMaterial color="#b38d65" roughness={0.38} metalness={0.05} clearcoat={0.3} />
              </mesh>
            </group>
          )}
          {sIdx === 2 && (
            <group position={[0, 0.1, 0]}>
              {/* Minimalist Fragrance Flacons */}
              {[-0.5, -0.15, 0.2, 0.55].map((x) => (
                <mesh key={x} position={[x, 0.08, 0]} castShadow>
                  <cylinderGeometry args={[0.04, 0.04, 0.16, 16]} />
                  <meshPhysicalMaterial color="#f8f5ee" transmission={0.7} opacity={0.85} roughness={0.05} />
                </mesh>
              ))}
            </group>
          )}
          {/* Warm shelf LED downlight */}
          <pointLight position={[0, -0.05, 0.2]} intensity={1.8} distance={1.8} color="#fff2df" />
        </group>
      ))}
    </group>
  )
}

// Multi-Tiered Travertine Display Platform
function MultiTierDisplayPlatform({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Lower tier */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.2, 1.4]} />
        <meshStandardMaterial color="#e5ded2" roughness={0.38} />
      </mesh>
      {/* Upper tier */}
      <mesh position={[0.4, 0.26, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.2, 0.9]} />
        <meshStandardMaterial color="#dcd3c5" roughness={0.35} />
      </mesh>
      {/* Brass edge inlays */}
      <mesh position={[0, 0.2, 0.69]}>
        <boxGeometry args={[2.8, 0.02, 0.02]} />
        <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Ambient uplight */}
      <pointLight position={[0, 0.5, 0]} intensity={2.5} distance={2.5} color="#ffe8c5" />
    </group>
  )
}
function FabricStudyTable({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Fluted Travertine Marble Plinth Table */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.84, 1.1]} />
        <meshStandardMaterial color="#e2d8c9" roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.85, 0]} receiveShadow>
        <boxGeometry args={[2.3, 0.04, 1.2]} />
        <meshPhysicalMaterial color="#ede5d8" roughness={0.2} metalness={0.08} clearcoat={0.6} />
      </mesh>
      {/* 4 Fabric Rolls / Swatches */}
      {[-0.7, -0.23, 0.23, 0.7].map((x, idx) => {
        const rollColors = ['#1c2838', '#b38d65', '#f0ece2', '#141416']
        return (
          <group key={x} position={[x, 0.94, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.075, 0.075, 0.7, 24]} />
              <meshStandardMaterial color={rollColors[idx]} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.01, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[0.15, 0.2]} />
              <meshStandardMaterial color={rollColors[idx]} roughness={0.45} side={DoubleSide} />
            </mesh>
          </group>
        )
      })}
      {/* Warm brass table spotlight */}
      <pointLight position={[0, 2.2, 0]} intensity={3.5} distance={3.5} color="#fff1db" />
    </group>
  )
}

export default function WesternFashionWorldScene({
  quality = 'medium',
  selectedGarmentId = 'west-slip-dress',
  fabricId = 'satin',
  customColor = null,
  cameraView = 'front',
  zoomLevel = 'full',
  avatarRotationDeg = 0,
  autoRotate360 = false,
  previewOnAvatar = false,
  avatarAssetId = 'femaleAvatar',
  activeInspectionPoint = null,
  onInspectionSelect = () => {},
}) {
  const controls = useRef(null)
  const turntableRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const { camera } = useThree()

  const terrazzoTexture = useMemo(() => makeTerrazzoTexture(), [])

  const selectedGarment = useMemo(() => {
    return westernGarments.find((g) => g.id === selectedGarmentId) ?? westernGarments[0]
  }, [selectedGarmentId])

  const garmentSilhouette = useMemo(() => {
    const t = (selectedGarment?.clothingType || '').toLowerCase()
    if (t.includes('dress') || t.includes('gown') || t.includes('jumpsuit') || t.includes('coord')) return 'dress'
    if (t.includes('skirt')) return 'skirt'
    if (t.includes('jeans') || t.includes('trouser')) return 'trousers'
    if (t.includes('shirt') || t.includes('t-shirt') || t.includes('top')) return 'shirt'
    if (t.includes('blazer') || t.includes('jacket') || t.includes('coat')) return 'blazer'
    return 'default'
  }, [selectedGarment])

  const garmentAsset = getReadySceneAsset(selectedGarment?.assetId)
  const avatarAsset = getReadySceneAsset(avatarAssetId)
  const supportsAvatar = Boolean(
    garmentAsset && avatarAsset?.skeletonId && garmentAsset.compatibleAvatarRigs?.includes(avatarAsset.skeletonId)
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => () => terrazzoTexture.dispose(), [terrazzoTexture])

  // Smooth 360-degree Turntable Rotation
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

  // Camera Management: Smooth transitions between Front / Side / Back & Zoom
  useEffect(() => {
    const currentControls = controls.current
    if (!currentControls) return

    const target = [0, 1.45, 0]
    const direction = { front: [0, 0, 1], side: [1, 0, 0], back: [0, 0, -1] }[cameraView] ?? [0, 0, 1]
    const distance = zoomLevel === 'detail' ? 2.8 : 5.8
    const camPos = [
      target[0] + direction[0] * distance,
      target[1] + (zoomLevel === 'detail' ? 0.2 : 0.6),
      target[2] + direction[2] * distance,
    ]

    currentControls.setLookAt(...camPos, ...target, !reducedMotion)
  }, [cameraView, zoomLevel, camera, reducedMotion])

  return (
    <>
      {/* Architectural Showroom Lighting & Environment */}
      <color attach="background" args={['#1c1a17']} />
      <fog attach="fog" args={['#1c1a17', 16, 44]} />

      <ambientLight intensity={0.8} color="#fbf4ea" />
      <directionalLight
        position={[6, 12, 8]}
        intensity={2.8}
        color="#fff4e2"
        castShadow
        shadow-mapSize-width={quality === 'high' ? 1024 : 512}
        shadow-mapSize-height={quality === 'high' ? 1024 : 512}
      />
      {/* Minimalist Ceiling Track Spotlights */}
      <pointLight position={[0, 6.5, 0]} intensity={16} distance={15} color="#fff6ec" />
      <pointLight position={[-4.5, 5, -2]} intensity={8} distance={10} color="#f7ecd9" />
      <pointLight position={[4.5, 5, -2]} intensity={8} distance={10} color="#f7ecd9" />

      {/* Terrazzo Floor with clearcoat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshPhysicalMaterial
          map={terrazzoTexture}
          color="#f4ede2"
          roughness={0.22}
          metalness={0.04}
          clearcoat={0.65}
          clearcoatRoughness={0.16}
        />
      </mesh>

      {/* High Quality Reflection Plane */}
      {quality === 'high' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
          <planeGeometry args={[7, 7]} />
          <MeshReflectorMaterial
            color="#e8e0d4"
            roughness={0.25}
            metalness={0.08}
            blur={[120, 36]}
            resolution={256}
            mixBlur={0.7}
            mixStrength={0.65}
            mirror={0.2}
            depthScale={0.08}
          />
        </mesh>
      )}

      {/* Modern Architectural Showroom Back Wall & Fluted Oak Panels */}
      <mesh position={[0, 4, -7.5]} receiveShadow>
        <boxGeometry args={[22, 8, 0.4]} />
        <meshStandardMaterial color="#2d2a25" roughness={0.7} />
      </mesh>
      {/* Brushed Champagne Gold Cornice Line */}
      <mesh position={[0, 7.8, -7.3]}>
        <boxGeometry args={[22, 0.08, 0.12]} />
        <meshStandardMaterial color="#cda863" metalness={0.88} roughness={0.2} />
      </mesh>

      {/* Side Architectural Concrete Wing Walls */}
      {[-8.5, 8.5].map((x) => (
        <mesh key={x} position={[x, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[16, 8, 0.4]} />
          <meshStandardMaterial color="#35312b" roughness={0.8} />
        </mesh>
      ))}

      {/* Full-Length Standing Arched Fitting Mirrors */}
      <StandingFittingMirror position={[-4.2, 0, -3.8]} rotation={[0, Math.PI / 6, 0]} />
      <StandingFittingMirror position={[4.2, 0, -3.8]} rotation={[0, -Math.PI / 6, 0]} />

      {/* Floating Architectural Display Shelves on Side Walls */}
      <FloatingDisplayShelves position={[-7.8, 1.2, -2.2]} rotation={[0, Math.PI / 2, 0]} />
      <FloatingDisplayShelves position={[7.8, 1.2, -2.2]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Multi-Tiered Travertine Display Platforms */}
      <MultiTierDisplayPlatform position={[-4.2, 0, 4.4]} rotation={[0, Math.PI / 6, 0]} />
      <MultiTierDisplayPlatform position={[4.2, 0, 4.4]} rotation={[0, -Math.PI / 6, 0]} />

      {/* Brushed Brass Garment Display Racks on Wings */}
      <GarmentDisplayRack position={[-5.2, 0, 1.2]} rotation={[0, Math.PI / 2, 0]} />
      <GarmentDisplayRack position={[5.2, 0, 1.2]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Fabric Study & Material Swatches Table */}
      <FabricStudyTable position={[0, 0, 4.8]} rotation={[0, Math.PI, 0]} />

      {/* Central Haute-Couture Display Podium */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.62, 0.16, 48]} />
        <meshStandardMaterial color="#362f26" roughness={0.4} metalness={0.15} />
      </mesh>
      {/* Brass Edge Trim on Podium */}
      <mesh position={[0, 0.16, 0]}>
        <torusGeometry args={[1.5, 0.015, 12, 48]} />
        <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Active Featured Outfit Presentation with 360-degree Turntable */}
      <group position={[0, 0.16, 0]}>
        <group ref={turntableRef}>
          {/* If verified GLB model ready */}
          {garmentAsset && !previewOnAvatar && (
            <GarmentModel asset={garmentAsset} fabricId={fabricId} colorVariantId={customColor} />
          )}

          {/* If rigged avatar preview is active */}
          {garmentAsset && previewOnAvatar && supportsAvatar && (
            <AvatarModel
              assetId={avatarAssetId}
              garmentAssetId={garmentAsset.id}
              garmentFabricId={fabricId}
              heightCm={170}
              pose="relaxed"
            />
          )}

          {/* Realistic Haute-Couture Mannequin with PBR Drape */}
          {!garmentAsset && (
            <CoutureMannequin
              gender="female"
              silhouette={garmentSilhouette}
              fabricId={fabricId ?? selectedGarment?.fabricId ?? 'silk'}
              customColor={customColor}
              active
              showDrape
            />
          )}

          {/* 3D Craftsmanship Inspection Pins */}
          {[
            { id: 'bodice', pos: [0, 1.62, 0.32], label: 'Neckline & Silhouette Cut' },
            { id: 'waist', pos: [0, 1.15, 0.28], label: 'Tailored Waistband Ease' },
            { id: 'hem', pos: [0, 0.45, 0.36], label: 'Hem Finishing & Drape Sweep' },
          ].map((pin) => {
            const isPinActive = activeInspectionPoint === pin.id
            return (
              <group
                key={pin.id}
                position={pin.pos}
                onClick={(e) => {
                  e.stopPropagation()
                  onInspectionSelect(isPinActive ? null : pin.id)
                }}
              >
                {/* Glowing Jewel Pin */}
                <mesh>
                  <sphereGeometry args={[isPinActive ? 0.038 : 0.026, 16, 16]} />
                  <meshStandardMaterial
                    color={isPinActive ? '#f3d790' : '#d4af37'}
                    emissive={isPinActive ? '#f3d790' : '#8a6820'}
                    emissiveIntensity={isPinActive ? 1.2 : 0.4}
                    roughness={0.2}
                    metalness={0.8}
                  />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[isPinActive ? 0.06 : 0.045, 0.005, 8, 24]} />
                  <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            )
          })}
        </group>

        {/* Dedicated Showroom Pedestal Downlight */}
        <pointLight position={[0, 3.2, 0.6]} intensity={8.5} distance={5} color="#fff3df" />
      </group>

      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={reducedMotion ? 0 : 0.75}
        draggingSmoothTime={reducedMotion ? 0 : 0.15}
        dollySpeed={0.5}
        truckSpeed={0.35}
        minDistance={2.2}
        maxDistance={18}
        minPolarAngle={MathUtils.degToRad(35)}
        maxPolarAngle={MathUtils.degToRad(100)}
      />
    </>
  )
}
