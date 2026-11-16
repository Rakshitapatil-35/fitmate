import { useEffect, useMemo, useRef } from 'react'
import { CameraControls, Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import {
  CanvasTexture,
  DoubleSide,
  RepeatWrapping,
} from 'three'
import CoutureMannequin from '../CoutureMannequin.jsx'
import ModelAsset from '../ModelAsset.jsx'
import { getReadySceneAsset } from '../assetManifest.js'
import { wardrobeZoneCameras } from '../wardrobeCatalog.js'

function makeFloorMap() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#6b4f35'
  ctx.fillRect(0, 0, 512, 512)

  for (let plank = 0; plank < 8; plank += 1) {
    const y = plank * 64
    ctx.fillStyle = plank % 2 ? '#7a5a3d' : '#61452e'
    ctx.fillRect(0, y, 512, 62)
    ctx.strokeStyle = 'rgba(215, 185, 140, 0.16)'
    ctx.lineWidth = 1
    ctx.strokeRect(0, y, 512, 62)

    for (let grain = 0; grain < 10; grain += 1) {
      const offset = (grain * 67 + plank * 31) % 512
      ctx.beginPath()
      ctx.moveTo(offset, y + 8 + (grain % 4) * 12)
      ctx.bezierCurveTo(offset + 40, y + 6, offset + 80, y + 50, offset + 150, y + 40)
      ctx.strokeStyle = grain % 3 === 0 ? 'rgba(235, 205, 160, 0.15)' : 'rgba(30, 20, 10, 0.12)'
      ctx.lineWidth = grain % 3 === 0 ? 2 : 1
      ctx.stroke()
    }
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(3, 4)
  texture.colorSpace = 'srgb'
  return texture
}

function makeMarbleMap() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#f4ede2'
  ctx.fillRect(0, 0, 512, 512)

  for (let line = 0; line < 20; line += 1) {
    const start = (line * 89) % 512
    ctx.beginPath()
    ctx.moveTo(start, -10)
    ctx.bezierCurveTo(start + 110, 140, start - 60, 320, start + 90, 520)
    ctx.strokeStyle = line % 2 ? 'rgba(180, 155, 115, 0.18)' : 'rgba(215, 180, 130, 0.28)'
    ctx.lineWidth = line % 2 ? 1.2 : 2.5
    ctx.stroke()
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(2, 2)
  texture.colorSpace = 'srgb'
  return texture
}

/**
 * 3D Procedural Luxury Handbag Model
 */
function Handbag3D({ color = '#d4af37', position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, onClick }) {
  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      {/* Trapeze Leather Handbag Body */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.28, 0.16]} />
        <meshStandardMaterial color={color} roughness={0.32} metalness={0.15} />
      </mesh>

      {/* Flap with gold piping */}
      <mesh position={[0, 0.25, 0.085]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.33, 0.14, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.2} />
      </mesh>

      {/* Gold metallic twist clasp */}
      <mesh position={[0, 0.18, 0.098]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.012, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#e5c158" metalness={0.92} roughness={0.15} />
      </mesh>

      {/* Rolled top tubular leather handle */}
      <mesh position={[0, 0.38, 0]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.11, 0.014, 12, 32, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.38} metalness={0.1} />
      </mesh>

      {/* Four gold bottom studs */}
      {[-0.12, 0.12].map((x) =>
        [-0.05, 0.05].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.035, z]} castShadow>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="#e5c158" metalness={0.9} roughness={0.2} />
          </mesh>
        ))
      )}
    </group>
  )
}

/**
 * 3D Procedural Designer Stiletto Heels
 */
function StilettoShoes3D({ color = '#1a1816', position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, onClick }) {
  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      {[-0.07, 0.07].map((xOffset, idx) => (
        <group key={idx} position={[xOffset, 0, 0]} rotation={[0, idx === 0 ? 0.08 : -0.08, 0]}>
          {/* Pointed Sole and arched vamp */}
          <mesh position={[0, 0.05, 0.04]} rotation={[0.22, 0, 0]} castShadow>
            <boxGeometry args={[0.075, 0.018, 0.18]} />
            <meshStandardMaterial color={color} roughness={0.22} metalness={0.2} />
          </mesh>

          {/* Pointed Toe Cap */}
          <mesh position={[0, 0.02, 0.12]} rotation={[-0.1, 0, 0]} castShadow>
            <coneGeometry args={[0.042, 0.08, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={color} roughness={0.18} metalness={0.3} />
          </mesh>

          {/* Slender Stiletto Heel */}
          <mesh position={[0, 0.055, -0.04]} castShadow>
            <cylinderGeometry args={[0.006, 0.004, 0.11, 12]} />
            <meshStandardMaterial color="#c5a059" metalness={0.92} roughness={0.15} />
          </mesh>

          {/* Lacquered Red / Gold Sole underside */}
          <mesh position={[0, 0.044, 0.04]} rotation={[0.22, 0, 0]}>
            <planeGeometry args={[0.07, 0.17]} />
            <meshStandardMaterial color="#a81e28" roughness={0.15} metalness={0.1} side={DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * 3D Jewelry Presentation Tray
 */
function JewelryTray3D({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Polished walnut tray frame */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.025, 0.28]} />
        <meshStandardMaterial color="#3b2b1d" roughness={0.4} />
      </mesh>
      {/* Black velvet interior cushion */}
      <mesh position={[0, 0.033, 0]}>
        <boxGeometry args={[0.39, 0.008, 0.25]} />
        <meshStandardMaterial color="#141416" roughness={0.88} />
      </mesh>
      {/* Polished Gold Bangles / Bracelets */}
      {[-0.1, 0, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.035, 0.007, 12, 32]} />
          <meshStandardMaterial color="#e5c158" metalness={0.94} roughness={0.15} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Cabinet Bay along the left or right wall
 */
function CabinetBay({ side, z, variant = 0 }) {
  const bronze = '#ad905e'
  const walnut = variant % 2 ? '#493728' : '#59432e'

  return (
    <group position={[side * 9.55, 0, z]} scale={[side, 1, 1]}>
      {/* Main vertical back panel */}
      <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 7.6, 4.7]} />
        <meshStandardMaterial color={walnut} roughness={0.42} />
      </mesh>
      {/* Inner backboard */}
      <mesh position={[-1.35, 3.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 7.6, 4.7]} />
        <meshStandardMaterial color="#30251c" roughness={0.34} />
      </mesh>
      {/* Side dividers */}
      {[-2.25, 2.25].map((edge) => (
        <mesh key={edge} position={[-0.72, 3.8, edge]} castShadow>
          <boxGeometry args={[1.45, 7.6, 0.2]} />
          <meshStandardMaterial color={walnut} roughness={0.36} />
        </mesh>
      ))}
      {/* Shelves & warm brass LED edge strip */}
      {[0.25, 1.25, 2.15, 3.05, 6.25, 7.25].map((y) => (
        <group key={y}>
          <mesh position={[-0.7, y, 0]} receiveShadow>
            <boxGeometry args={[1.35, 0.14, 4.45]} />
            <meshStandardMaterial color={y > 6 ? '#806849' : walnut} roughness={0.38} />
          </mesh>
          {y < 3.2 && (
            <mesh position={[-1.43, y + 0.34, 0]}>
              <boxGeometry args={[0.08, 0.045, 4.2]} />
              <meshStandardMaterial color={bronze} metalness={0.76} roughness={0.23} />
            </mesh>
          )}
        </group>
      ))}
      {/* Brass Clothing Hanging Rail */}
      <mesh position={[-1.17, 5.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 4.05, 20]} />
        <meshStandardMaterial color={bronze} metalness={0.82} roughness={0.2} />
      </mesh>
      {/* Architectural Fluted Brass Corner Trims */}
      {[-1.55, 1.55].map((trimZ) => (
        <mesh key={trimZ} position={[-1.45, 3.8, trimZ]}>
          <boxGeometry args={[0.08, 7.4, 0.08]} />
          <meshStandardMaterial color="#c7a873" metalness={0.78} roughness={0.22} />
        </mesh>
      ))}
    </group>
  )
}

function WardrobeCabinetry() {
  return (
    <>
      {[-9, -3, 3, 9].map((z, index) => (
        <CabinetBay key={`left-${z}`} side={-1} z={z} variant={index} />
      ))}
      {[-9, -3, 3, 9].map((z, index) => (
        <CabinetBay key={`right-${z}`} side={1} z={z} variant={index + 1} />
      ))}
      {/* Sliding Glass Doors with golden handles */}
      {[-9, -3, 3, 9].map((z) => (
        <group key={`glass-left-${z}`} position={[-8.48, 3.8, z]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[4.25, 7.05]} />
            <meshPhysicalMaterial
              color="#e7dcc8"
              transparent
              opacity={0.16}
              transmission={0.78}
              thickness={0.12}
              roughness={0.08}
              metalness={0.08}
            />
          </mesh>
        </group>
      ))}
      {[-9, -3, 3, 9].map((z) => (
        <group key={`glass-right-${z}`} position={[8.48, 3.8, z]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[4.25, 7.05]} />
            <meshPhysicalMaterial
              color="#e7dcc8"
              transparent
              opacity={0.16}
              transmission={0.78}
              thickness={0.12}
              roughness={0.08}
              metalness={0.08}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

/**
 * Central Boutique Marble & Fluted Walnut Island
 */
function WardrobeIsland({ marble, onSelectAccessory }) {
  return (
    <group position={[0, 0, 1.2]}>
      {/* Base Walnut Cabinet with fluted profile */}
      <mesh position={[0, 0.84, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.35, 1.35, 1.95]} />
        <meshStandardMaterial color="#3d2d21" roughness={0.32} />
      </mesh>

      {/* Fluted walnut drawer fronts with horizontal bronze pulls */}
      {[-0.45, 0.4, 1.25].map((y) => (
        <mesh key={y} position={[0, y, 1.01]}>
          <boxGeometry args={[3.65, 0.08, 0.045]} />
          <meshStandardMaterial color="#b89a65" metalness={0.82} roughness={0.2} />
        </mesh>
      ))}

      {/* Honed Calacatta Marble Countertop */}
      <mesh position={[0, 1.58, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.55, 0.16, 2.12]} />
        <meshStandardMaterial
          map={marble}
          color="#f3ede1"
          roughness={0.24}
          metalness={0.08}
        />
      </mesh>

      {/* Gilded vitrine display recess */}
      <mesh position={[0, 1.66, 0]}>
        <boxGeometry args={[3.8, 0.03, 1.4]} />
        <meshPhysicalMaterial color="#af8c5c" metalness={0.76} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.69, 0]}>
        <boxGeometry args={[3.55, 0.035, 1.18]} />
        <meshStandardMaterial map={marble} color="#f6f0e6" roughness={0.24} />
      </mesh>

      {/* 3D Accessories Displayed on Island */}
      <Handbag3D
        color="#d4af37"
        position={[-1.1, 1.72, 0]}
        rotation={[0, 0.25, 0]}
        scale={1.2}
        onClick={() => onSelectAccessory?.('handbag')}
      />

      <StilettoShoes3D
        color="#1a1816"
        position={[0, 1.72, -0.22]}
        rotation={[0, -0.15, 0]}
        scale={1.15}
        onClick={() => onSelectAccessory?.('shoes')}
      />

      <JewelryTray3D
        position={[1.1, 1.72, 0]}
        rotation={[0, -0.12, 0]}
      />
    </group>
  )
}

function CeilingLighting() {
  return (
    <>
      <mesh position={[0, 8, -1]}>
        <boxGeometry args={[24, 0.4, 32]} />
        <meshStandardMaterial color="#29231c" roughness={0.44} />
      </mesh>

      {[-8, -4, 0, 4, 8].map((x) => (
        <group key={x} position={[x, 7.72, -3]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.3, 0.045, 12, 64]} />
            <meshStandardMaterial color="#b99b69" metalness={0.82} roughness={0.2} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.82, 0.82, 0.82]}>
            <torusGeometry args={[1.3, 0.027, 10, 64]} />
            <meshBasicMaterial color="#fff1d7" />
          </mesh>
          <pointLight position={[0, -0.5, 0]} intensity={12} distance={9} color="#f5d7a5" />
        </group>
      ))}
    </>
  )
}

function RoomShell({ wood }) {
  return (
    <>
      <color attach="background" args={['#211c17']} />
      <fog attach="fog" args={['#211c17', 25, 48]} />

      {/* Hardwood Parquet Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[24, 32]} />
        <meshPhysicalMaterial map={wood} roughness={0.32} metalness={0.06} clearcoat={0.22} />
      </mesh>

      {/* Central Polished Runway Carpet with real reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.035, 0]} receiveShadow>
        <planeGeometry args={[3.4, 30]} />
        <MeshReflectorMaterial
          color="#d4c2a1"
          roughness={0.24}
          metalness={0.2}
          blur={[200, 70]}
          resolution={256}
          mixBlur={0.72}
          mixStrength={0.72}
          mirror={0.22}
          depthScale={0.1}
        />
      </mesh>

      {/* Side Architectural Walls */}
      {[-12, 12].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 4, 0]} receiveShadow>
            <boxGeometry args={[0.45, 8, 32]} />
            <meshStandardMaterial color="#3e3023" roughness={0.38} />
          </mesh>
        </group>
      ))}

      {/* Back Wall with Tall Bronze Dressing Mirrors */}
      <mesh position={[0, 4, -15.9]}>
        <boxGeometry args={[24, 8, 0.5]} />
        <meshStandardMaterial color="#34281e" roughness={0.42} />
      </mesh>

      {[-9, 9].map((x) => (
        <group key={`back-mirror-${x}`} position={[x, 3.9, -15.62]}>
          <mesh>
            <planeGeometry args={[4.4, 6.8]} />
            <meshPhysicalMaterial color="#ae9675" metalness={0.82} roughness={0.16} clearcoat={0.75} />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[4.22, 6.62]} />
            <MeshReflectorMaterial
              color="#d9d4c8"
              metalness={0.18}
              roughness={0.16}
              blur={[160, 60]}
              resolution={256}
              mixBlur={0.48}
              mixStrength={0.8}
              mirror={0.55}
              depthScale={0.08}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

/**
 * Individual Garment Placed on a Bay Stand
 */
function WardrobeGarmentBaySlot({ item, isSelected, position, rotation, onSelect }) {
  const readyAsset = getReadySceneAsset(item.garmentAssetId || item.assetId)

  // Map category to silhouette
  const silhouette = useMemo(() => {
    const cat = (item.clothingType || item.category || '').toLowerCase()
    if (cat.includes('lehenga')) return 'lehenga'
    if (cat.includes('saree')) return 'saree'
    if (cat.includes('sherwani')) return 'sherwani'
    if (cat.includes('kurta')) return 'kurta'
    if (cat.includes('blazer') || cat.includes('suit')) return 'blazer'
    if (cat.includes('dress')) return 'dress'
    if (cat.includes('shirt')) return 'shirt'
    if (cat.includes('jean') || cat.includes('trouser')) return 'jeans'
    return 'dress'
  }, [item])

  const gender = item.audience === 'Men' ? 'male' : 'female'
  const customColor = item.color || '#d4af37'
  const fabricId = item.fabric || 'silk'

  return (
    <group position={position} rotation={rotation}>
      {/* Bay Pedestal Base */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.62, 0.08, 32]} />
        <meshStandardMaterial color={isSelected ? '#dfbf7c' : '#5a4634'} roughness={0.35} metalness={0.3} />
      </mesh>

      {/* Spotlight for selected or active garment */}
      {isSelected && (
        <pointLight position={[0, 2.5, 0.8]} intensity={6.5} distance={4.5} color="#fff6e5" />
      )}

      {/* Render Real 3D GLB or Couture Mannequin */}
      {readyAsset ? (
        <group
          position={[0, 0.1, 0]}
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(item)
          }}
        >
          <ModelAsset assetId={readyAsset.id} />
        </group>
      ) : (
        <CoutureMannequin
          position={[0, 0.08, 0]}
          scale={0.72}
          gender={gender}
          silhouette={silhouette}
          fabricId={fabricId}
          customColor={customColor}
          active={isSelected}
          withSpotlight={false}
          onClick={() => onSelect?.(item)}
        />
      )}
    </group>
  )
}

/**
 * Central 3D Inspection Pedestal & Rotating Garment
 */
function InspectionStage({ garment, inspectionView = 'front', autoRotate = false }) {
  const rotationRef = useRef(null)
  const readyAsset = getReadySceneAsset(garment.garmentAssetId || garment.assetId)

  const silhouette = useMemo(() => {
    const cat = (garment.clothingType || garment.category || '').toLowerCase()
    if (cat.includes('lehenga')) return 'lehenga'
    if (cat.includes('saree')) return 'saree'
    if (cat.includes('sherwani')) return 'sherwani'
    if (cat.includes('kurta')) return 'kurta'
    if (cat.includes('blazer') || cat.includes('suit')) return 'blazer'
    if (cat.includes('dress')) return 'dress'
    if (cat.includes('shirt')) return 'shirt'
    if (cat.includes('jean') || cat.includes('trouser')) return 'jeans'
    return 'dress'
  }, [garment])

  const gender = garment.audience === 'Men' ? 'male' : 'female'
  const customColor = garment.color || '#d4af37'
  const fabricId = garment.fabric || 'silk'

  // Smooth continuous auto-rotation if enabled
  useFrame((_, delta) => {
    if (autoRotate && rotationRef.current) {
      rotationRef.current.rotation.y += delta * 0.65
    }
  })

  // Fixed viewpoints: front = 0, side = 90 deg, back = 180 deg
  const targetRotationY = useMemo(() => {
    if (inspectionView === 'side') return Math.PI / 2
    if (inspectionView === 'back') return Math.PI
    return 0
  }, [inspectionView])

  useEffect(() => {
    if (!autoRotate && rotationRef.current) {
      rotationRef.current.rotation.y = targetRotationY
    }
  }, [autoRotate, targetRotationY])

  return (
    <group position={[0, 0, 0]}>
      {/* Circular Exhibition Pedestal */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.25, 0.16, 48]} />
        <meshStandardMaterial color="#f6f0e4" roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Brushed gold perimeter band */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.11, 1.11, 0.06, 48, 1, true]} />
        <meshStandardMaterial color="#d4af37" metalness={0.88} roughness={0.2} side={DoubleSide} />
      </mesh>

      {/* 3-Point Studio Inspection Lighting */}
      <spotLight
        position={[2.5, 4.5, 3.5]}
        intensity={18}
        angle={0.55}
        penumbra={0.6}
        color="#fff5e6"
        castShadow
      />
      <spotLight
        position={[-3, 4, 2]}
        intensity={10}
        angle={0.65}
        color="#e0d6c8"
      />
      <pointLight position={[0, 3.5, -2.5]} intensity={8} color="#ffe5bd" />

      {/* Rotating Garment Container */}
      <group ref={rotationRef} position={[0, 0.16, 0]}>
        {readyAsset ? (
          <ModelAsset assetId={readyAsset.id} />
        ) : (
          <CoutureMannequin
            scale={0.92}
            gender={gender}
            silhouette={silhouette}
            fabricId={fabricId}
            customColor={customColor}
            active
            withSpotlight={false}
          />
        )}
      </group>
    </group>
  )
}

export default function WalkInWardrobeScene({
  savedGarments = [],
  selectedGarment = null,
  cameraZone = 'overview',
  inspectionView = 'front',
  autoRotate = false,
  onSelectGarment = () => {},
}) {
  const controls = useRef(null)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const wood = useMemo(() => makeFloorMap(), [])
  const marble = useMemo(() => makeMarbleMap(), [])

  useEffect(() => () => {
    wood.dispose()
    marble.dispose()
  }, [wood, marble])

  // Camera animation between zones and inspection view
  useEffect(() => {
    if (!controls.current) return

    if (cameraZone === 'inspect' && selectedGarment) {
      controls.current.setLookAt(0, 2.3, 3.2, 0, 1.6, 0, !reducedMotion)
      return
    }

    const zoneConfig = wardrobeZoneCameras[cameraZone] ?? wardrobeZoneCameras.overview
    controls.current.setLookAt(
      zoneConfig.position[0],
      zoneConfig.position[1],
      zoneConfig.position[2],
      zoneConfig.target[0],
      zoneConfig.target[1],
      zoneConfig.target[2],
      !reducedMotion
    )
  }, [cameraZone, reducedMotion, selectedGarment])

  // Distribute saved garments across architectural bays
  const positionedGarments = useMemo(() => {
    const leftSlots = [
      { position: [-8.5, 0.4, -9.5], rotation: [0, Math.PI / 2, 0] },
      { position: [-8.5, 0.4, -4.5], rotation: [0, Math.PI / 2, 0] },
      { position: [-8.5, 0.4, 0.5], rotation: [0, Math.PI / 2, 0] },
      { position: [-8.5, 0.4, 5.5], rotation: [0, Math.PI / 2, 0] },
    ]
    const rightSlots = [
      { position: [8.5, 0.4, -9.5], rotation: [0, -Math.PI / 2, 0] },
      { position: [8.5, 0.4, -4.5], rotation: [0, -Math.PI / 2, 0] },
      { position: [8.5, 0.4, 0.5], rotation: [0, -Math.PI / 2, 0] },
      { position: [8.5, 0.4, 5.5], rotation: [0, -Math.PI / 2, 0] },
    ]
    const rearSlots = [
      { position: [-4.2, 0.4, -13.8], rotation: [0, 0, 0] },
      { position: [0, 0.4, -13.8], rotation: [0, 0, 0] },
      { position: [4.2, 0.4, -13.8], rotation: [0, 0, 0] },
    ]

    let lIdx = 0
    let rIdx = 0
    let bIdx = 0

    return savedGarments.slice(0, 11).map((item) => {
      const col = (item.collection || '').toLowerCase()
      const cat = (item.clothingType || item.category || '').toLowerCase()
      const isIndian = col.includes('indian') || cat.includes('saree') || cat.includes('lehenga') || cat.includes('kurti')
      const isMens = item.audience === 'Men' || col.includes('men') || cat.includes('sherwani') || cat.includes('suit')

      let slot
      if (isIndian && lIdx < leftSlots.length) {
        slot = leftSlots[lIdx++]
      } else if (isMens && bIdx < rearSlots.length) {
        slot = rearSlots[bIdx++]
      } else if (rIdx < rightSlots.length) {
        slot = rightSlots[rIdx++]
      } else if (lIdx < leftSlots.length) {
        slot = leftSlots[lIdx++]
      } else {
        slot = rearSlots[bIdx++ % rearSlots.length]
      }

      return { item, slot }
    })
  }, [savedGarments])

  return (
    <>
      {/* Environment lighting & reflections */}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3.4} color="#fff2dc" position={[-7, 8, 4]} scale={[7, 4, 1]} />
        <Lightformer form="rect" intensity={2.8} color="#dfc18d" position={[8, 7, -7]} scale={[6, 4, 1]} />
        <Lightformer form="ring" intensity={2.2} color="#fff8e9" position={[0, 9, -4]} scale={3.5} />
      </Environment>

      <ambientLight intensity={0.65} color="#fff1de" />
      <directionalLight position={[-7, 11, 7]} intensity={2.6} color="#fff0d5" castShadow />
      <pointLight position={[0, 6, 5]} intensity={22} distance={25} color="#f2d29c" />
      <pointLight position={[0, 6, -8]} intensity={25} distance={27} color="#fff3df" />

      {/* Room Shell & Custom Architectural Cabinetry */}
      <RoomShell wood={wood} />
      <CeilingLighting />
      <WardrobeCabinetry />
      <WardrobeIsland marble={marble} onSelectAccessory={() => onSelectGarment?.(savedGarments.find((g) => g.collection === 'Accessories') ?? savedGarments[0])} />

      {/* Render Saved Garments in Wardrobe Bays */}
      {cameraZone !== 'inspect' &&
        positionedGarments.map(({ item, slot }) => (
          <WardrobeGarmentBaySlot
            key={item.id}
            item={item}
            isSelected={selectedGarment?.id === item.id}
            position={slot.position}
            rotation={slot.rotation}
            onSelect={onSelectGarment}
          />
        ))}

      {/* When in 3D Garment Inspection Mode, showcase on the central inspection stage */}
      {cameraZone === 'inspect' && selectedGarment && (
        <InspectionStage
          garment={selectedGarment}
          inspectionView={inspectionView}
          autoRotate={autoRotate}
        />
      )}

      {/* Smooth Camera Controls */}
      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={reducedMotion ? 0 : 0.85}
        dollySpeed={0.5}
        truckSpeed={0.42}
        minDistance={cameraZone === 'inspect' ? 1.8 : 4.5}
        maxDistance={28}
        minPolarAngle={0.68}
        maxPolarAngle={1.48}
        maxAzimuthAngle={Math.PI * 0.48}
        minAzimuthAngle={-Math.PI * 0.48}
      />
    </>
  )
}
