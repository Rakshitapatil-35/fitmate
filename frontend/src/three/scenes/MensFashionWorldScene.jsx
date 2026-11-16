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
import { mensGarments } from '../mensFashionCatalog.js'

// High-end Smoked Chevron Dark Walnut Flooring Texture
function makeChevronWalnutTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1024
  const ctx = canvas.getContext('2d')

  // Base dark walnut wood stain
  ctx.fillStyle = '#221913'
  ctx.fillRect(0, 0, 1024, 1024)

  // Chevron herringbone planks
  const plankW = 64
  const plankH = 128
  for (let y = 0; y < 1024; y += plankH) {
    for (let x = 0; x < 1024; x += plankW * 2) {
      // Alternating plank wood tones
      const tones = ['#2a1e16', '#261b14', '#1f1610', '#302219']
      ctx.fillStyle = tones[(x + y) % tones.length]

      // Left angle plank
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + plankW, y + plankH / 2)
      ctx.lineTo(x + plankW, y + plankH)
      ctx.lineTo(x, y + plankH / 2)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(12, 8, 5, 0.7)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Right angle plank
      ctx.fillStyle = tones[(x + y + 1) % tones.length]
      ctx.beginPath()
      ctx.moveTo(x + plankW, y + plankH / 2)
      ctx.lineTo(x + plankW * 2, y)
      ctx.lineTo(x + plankW * 2, y + plankH / 2)
      ctx.lineTo(x + plankW, y + plankH)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = 1000
  texture.repeat.set(4, 4)
  texture.colorSpace = 'srgb'
  return texture
}

// Grand Bespoke 3-Panel Tailor's Dressing Mirror
function TriplePanelFittingMirror({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Heavy dark walnut base stand */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[3.2, 0.1, 0.6]} />
        <meshStandardMaterial color="#1f1611" roughness={0.4} />
      </mesh>
      {/* Center Main Mirror Panel */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <boxGeometry args={[1.3, 3.6, 0.08]} />
        <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.9, 0.042]}>
        <planeGeometry args={[1.16, 3.44]} />
        <meshPhysicalMaterial color="#f0f2f6" roughness={0.02} metalness={0.98} clearcoat={1} />
      </mesh>

      {/* Left Angled Wing Mirror */}
      <group position={[-1.02, 1.9, 0.2]} rotation={[0, Math.PI / 7, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 3.4, 0.07]} />
          <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.038]}>
          <planeGeometry args={[0.65, 3.26]} />
          <meshPhysicalMaterial color="#f0f2f6" roughness={0.02} metalness={0.98} clearcoat={1} />
        </mesh>
      </group>

      {/* Right Angled Wing Mirror */}
      <group position={[1.02, 1.9, 0.2]} rotation={[0, -Math.PI / 7, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 3.4, 0.07]} />
          <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.038]}>
          <planeGeometry args={[0.65, 3.26]} />
          <meshPhysicalMaterial color="#f0f2f6" roughness={0.02} metalness={0.98} clearcoat={1} />
        </mesh>
      </group>

      {/* Warm mirror picture downlight */}
      <pointLight position={[0, 3.8, 0.6]} intensity={5.5} distance={4} color="#ffe8c5" />
    </group>
  )
}

// Heavy Industrial Brass & Cast Steel Suiting Rack
function SuitingDisplayRack({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Heavy cast-iron base plate */}
      <mesh position={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[2.2, 0.06, 0.5]} />
        <meshStandardMaterial color="#1a1a1c" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Upright posts in matte blackened steel */}
      {[-0.98, 0.98].map((x) => (
        <mesh key={x} position={[x, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 2.25, 16]} />
          <meshStandardMaterial color="#252528" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {/* Solid brushed brass horizontal crossbar */}
      <mesh position={[0, 2.25, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 2.05, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Hanging Suiting Separates */}
      {[-0.65, -0.22, 0.22, 0.65].map((x, i) => {
        const suitTones = ['#162132', '#26292d', '#b08b62', '#32231b']
        return (
          <group key={x} position={[x, 2.05, 0]}>
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.15, 8]} />
              <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.01, 0]}>
              <boxGeometry args={[0.42, 0.024, 0.025]} />
              <meshStandardMaterial color="#1c120c" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.6, 0]} castShadow>
              <planeGeometry args={[0.38, 1.15]} />
              <meshStandardMaterial color={suitTones[i]} roughness={0.65} side={DoubleSide} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// Bespoke Gentleman's Suiting Fabric & Mill Swatch Display Credenza
function BespokeFabricCredenza({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Dark Walnut Credenza Body */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.9, 0.9]} />
        <meshStandardMaterial color="#241913" roughness={0.45} />
      </mesh>
      {/* Honed Basalt Black Stone Top */}
      <mesh position={[0, 0.92, 0]} receiveShadow>
        <boxGeometry args={[2.45, 0.04, 0.95]} />
        <meshPhysicalMaterial color="#1e1e20" roughness={0.28} metalness={0.12} clearcoat={0.5} />
      </mesh>
      {/* Tailor's Shears & Measuring Tape Stand */}
      <mesh position={[-0.8, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.15, 20]} />
        <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Suiting Fabric Bolt Rolls */}
      {[-0.3, 0.15, 0.6].map((x, idx) => {
        const boltColors = ['#162132', '#26292d', '#b08b62']
        return (
          <group key={x} position={[x, 1.02, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.085, 0.085, 0.65, 24]} />
              <meshStandardMaterial color={boltColors[idx]} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.01, 0.35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[0.16, 0.22]} />
              <meshStandardMaterial color={boltColors[idx]} roughness={0.65} side={DoubleSide} />
            </mesh>
          </group>
        )
      })}
      <pointLight position={[0, 2.2, 0]} intensity={3.8} distance={3.5} color="#ffdca8" />
    </group>
  )
}

// Footwear & Sartorial Leather Accessory Plinth
function FootwearAndAccessoryPlinth({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Heavy dark walnut plinth */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.24, 1.2]} />
        <meshStandardMaterial color="#221812" roughness={0.45} />
      </mesh>
      {/* Honed Basalt top surface */}
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <boxGeometry args={[2.64, 0.02, 1.24]} />
        <meshPhysicalMaterial color="#19191b" roughness={0.2} metalness={0.1} clearcoat={0.6} />
      </mesh>
      {/* Display Pair 1: Hand-Burnished Calfskin Oxford Shoes */}
      <group position={[-0.65, 0.35, 0]}>
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.13, 0.12, 0.32]} />
            <meshPhysicalMaterial color="#321b10" roughness={0.3} metalness={0.08} clearcoat={0.5} />
          </mesh>
        ))}
      </group>
      {/* Display Pair 2: Double Monkstrap Burgundy Loafers */}
      <group position={[0.65, 0.35, 0]}>
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.13, 0.11, 0.3]} />
            <meshPhysicalMaterial color="#421822" roughness={0.32} metalness={0.06} clearcoat={0.48} />
          </mesh>
        ))}
      </group>
      {/* Center Brass Horology & Cufflink Case */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.12, 24]} />
        <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
      </mesh>
      <pointLight position={[0, 0.6, 0]} intensity={2.4} distance={2.2} color="#ffecd2" />
    </group>
  )
}

export default function MensFashionWorldScene({
  quality = 'medium',
  selectedGarmentId = 'men-oxford-shirt',
  fabricId = 'cotton',
  customColor = null,
  cameraView = 'front',
  zoomLevel = 'full',
  avatarRotationDeg = 0,
  autoRotate360 = false,
  maleProportion = 'regular',
  activeInspectionPoint = null,
  onInspectionSelect = () => {},
  previewOnAvatar = false,
  avatarAssetId = 'maleAvatar',
}) {
  const controls = useRef(null)
  const turntableRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const { camera } = useThree()

  const chevronTexture = useMemo(() => makeChevronWalnutTexture(), [])

  const selectedGarment = useMemo(() => {
    return mensGarments.find((g) => g.id === selectedGarmentId) ?? mensGarments[0]
  }, [selectedGarmentId])

  const garmentSilhouette = useMemo(() => {
    const t = (selectedGarment?.clothingType || '').toLowerCase()
    if (t.includes('sherwani')) return 'sherwani'
    if (t.includes('kurta')) return 'kurta'
    if (t.includes('nehru') || t.includes('bandhgala')) return 'nehru-jacket'
    if (t.includes('suit') || t.includes('tuxedo')) return 'suit'
    if (t.includes('blazer') || t.includes('jacket') || t.includes('coat')) return 'jacket'
    if (t.includes('jeans') || t.includes('trouser')) return 'trousers'
    if (t.includes('shirt') || t.includes('t-shirt')) return 'shirt'
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

  useEffect(() => () => chevronTexture.dispose(), [chevronTexture])

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

    const target = [0, 1.48, 0]
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
      {/* Bespoke Sartorial Atelier Ambient Lighting */}
      <color attach="background" args={['#14100d']} />
      <fog attach="fog" args={['#14100d', 16, 44]} />

      <ambientLight intensity={0.75} color="#faedd9" />
      <directionalLight
        position={[-6, 13, 8]}
        intensity={2.9}
        color="#ffecd2"
        castShadow
        shadow-mapSize-width={quality === 'high' ? 1024 : 512}
        shadow-mapSize-height={quality === 'high' ? 1024 : 512}
      />
      {/* Recessed Warm Ceiling Downlights */}
      <pointLight position={[0, 6.8, 0]} intensity={16} distance={15} color="#ffe8be" />
      <pointLight position={[-4.5, 5.2, -2]} intensity={8} distance={10} color="#ffdca8" />
      <pointLight position={[4.5, 5.2, -2]} intensity={8} distance={10} color="#ffdca8" />

      {/* Smoked Chevron Dark Walnut Wood Floor with PBR Reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshPhysicalMaterial
          map={chevronTexture}
          color="#f4eee4"
          roughness={0.24}
          metalness={0.06}
          clearcoat={0.65}
          clearcoatRoughness={0.18}
        />
      </mesh>

      {/* High Quality Floor Reflector */}
      {quality === 'high' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
          <planeGeometry args={[7, 7]} />
          <MeshReflectorMaterial
            color="#2a2019"
            roughness={0.28}
            metalness={0.1}
            blur={[120, 36]}
            resolution={256}
            mixBlur={0.72}
            mixStrength={0.65}
            mirror={0.22}
            depthScale={0.08}
          />
        </mesh>
      )}

      {/* Fluted Dark Walnut Wall Paneling with Brass Inlays */}
      <mesh position={[0, 4, -7.5]} receiveShadow>
        <boxGeometry args={[22, 8, 0.4]} />
        <meshStandardMaterial color="#221812" roughness={0.6} />
      </mesh>
      {/* Vertical Brushed Brass Architectural Strips */}
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, 4, -7.28]}>
          <boxGeometry args={[0.04, 8, 0.05]} />
          <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.18} />
        </mesh>
      ))}

      {/* Side Wing Walls */}
      {[-8.5, 8.5].map((x) => (
        <mesh key={x} position={[x, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[16, 8, 0.4]} />
          <meshStandardMaterial color="#2a1f18" roughness={0.7} />
        </mesh>
      ))}

      {/* Grand Bespoke Triple-Panel Fitting Mirror */}
      <TriplePanelFittingMirror position={[0, 0, -6.8]} />

      {/* Heavy Steel & Brass Suiting Racks on Wings */}
      <SuitingDisplayRack position={[-5.2, 0, 1.2]} rotation={[0, Math.PI / 2, 0]} />
      <SuitingDisplayRack position={[5.2, 0, 1.2]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Footwear & Horology Display Plinths on Flanks */}
      <FootwearAndAccessoryPlinth position={[-4.2, 0, 4.4]} rotation={[0, Math.PI / 6, 0]} />
      <FootwearAndAccessoryPlinth position={[4.2, 0, 4.4]} rotation={[0, -Math.PI / 6, 0]} />

      {/* Fabric Swatch & Tailor's Shears Credenza */}
      <BespokeFabricCredenza position={[0, 0, 4.8]} rotation={[0, Math.PI, 0]} />

      {/* Central Sartorial Fitting Podium */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.62, 0.16, 48]} />
        <meshStandardMaterial color="#1a1510" roughness={0.4} metalness={0.2} />
      </mesh>
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

          {/* If rigged male avatar preview is active */}
          {garmentAsset && previewOnAvatar && supportsAvatar && (
            <AvatarModel
              assetId={avatarAssetId}
              garmentAssetId={garmentAsset.id}
              garmentFabricId={fabricId}
              heightCm={178}
              pose="relaxed"
            />
          )}

          {/* Realistic Haute-Couture Masculine Display Mannequin with PBR Drape & Body Proportion */}
          {!garmentAsset && (
            <CoutureMannequin
              gender="male"
              silhouette={garmentSilhouette}
              bodyBuild={maleProportion}
              fabricId={fabricId ?? selectedGarment?.fabricId ?? 'wool'}
              customColor={customColor}
              active
              showDrape
            />
          )}

          {/* 3D Sartorial Craftsmanship Inspection Pins */}
          {[
            { id: 'lapel', pos: [0, 1.65, 0.34], label: 'Collar Roll & Lapel Pick-Stitch' },
            { id: 'chest', pos: [0, 1.25, 0.32], label: 'Floating Canvas & Chest Drape' },
            { id: 'trouser', pos: [0, 0.52, 0.35], label: 'Waistband Dart & Trouser Crease' },
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
                    color={isPinActive ? '#f3d790' : '#cda863'}
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

        {/* Focused Atelier Downlight */}
        <pointLight position={[0, 3.2, 0.6]} intensity={8.5} distance={5} color="#fff1d6" />
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
