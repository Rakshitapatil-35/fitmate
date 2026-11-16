import { useMemo } from 'react'
import { DoubleSide, LatheGeometry, Vector2 } from 'three'
import { createFabricMaterial } from './fabricMaterialLibrary.js'

/**
 * Size scale multipliers for visual drape adaptation
 */
const sizeMultipliers = {
  XS: 0.94,
  S: 0.97,
  M: 1.00,
  L: 1.04,
  XL: 1.08,
  XXL: 1.13,
}

/**
 * Procedural Drape Geometry for various garment silhouettes
 */
function makeGarmentDrapeGeometry(silhouette = 'dress', gender = 'female', size = 'M') {
  const points = []
  const steps = 36
  const mult = sizeMultipliers[size] ?? 1.0
  const isMale = gender === 'male'

  if (silhouette === 'lehenga') {
    // 24-kali sweeping royal flared skirt
    for (let i = 0; i <= steps; i += 1) {
      const v = i / steps
      const y = 0.94 - v * 0.92 // from natural waist down to ankle hem
      const flare = (0.24 + Math.pow(v, 1.25) * 0.52) * mult
      const wave = Math.sin(v * Math.PI * 6) * 0.02
      points.push(new Vector2(flare + wave, y))
    }
  } else if (silhouette === 'anarkali') {
    // 32-kali umbrella floor-length flared ghera
    for (let i = 0; i <= steps; i += 1) {
      const v = i / steps
      const y = 1.02 - v * 0.98 // high empire waist cascading down
      const flare = (0.22 + Math.pow(v, 1.35) * 0.48) * mult
      const wave = Math.sin(v * Math.PI * 7) * 0.018
      points.push(new Vector2(flare + wave, y))
    }
  } else if (silhouette === 'dress') {
    // Fluid evening column / A-line drape
    for (let i = 0; i <= steps; i += 1) {
      const v = i / steps
      const y = 0.94 - v * 0.90
      const flare = (0.21 + Math.pow(v, 1.5) * 0.32) * mult
      const wave = Math.sin(v * Math.PI * 4) * 0.015
      points.push(new Vector2(flare + wave, y))
    }
  } else if (silhouette === 'kurti' || silhouette === 'kurta') {
    // Knee-length straight-cut tunic with side vent flare
    for (let i = 0; i <= steps; i += 1) {
      const v = i / steps
      const y = 0.94 - v * 0.60 // down to knee
      const flare = (isMale ? 0.25 : 0.22) * mult + v * 0.06
      points.push(new Vector2(flare, y))
    }
  } else if (silhouette === 'sherwani') {
    // Royal coat skirt from waist down to mid-calf
    for (let i = 0; i <= steps; i += 1) {
      const v = i / steps
      const y = 0.94 - v * 0.68
      const flare = (0.26 + Math.pow(v, 1.25) * 0.16) * mult
      points.push(new Vector2(flare, y))
    }
  } else if (silhouette === 'jeans' || silhouette === 'trousers') {
    // Clean tailored leg columns
    for (let i = 0; i <= steps; i += 1) {
      const v = i / steps
      const y = 0.94 - v * 0.88
      const flare = (0.23 + v * 0.05) * mult
      points.push(new Vector2(flare, y))
    }
  } else {
    // Default tailored top hem flare
    for (let i = 0; i <= steps; i += 1) {
      const v = i / steps
      const y = 0.94 - v * 0.28 // shirt / tee / jacket hem
      const flare = ((isMale ? 0.24 : 0.21) + v * 0.04) * mult
      points.push(new Vector2(flare, y))
    }
  }

  return new LatheGeometry(points, 36)
}

/**
 * 3D Garment Try-On Model on Mannequin
 */
export default function FittingRoomGarment3D({
  silhouette = 'dress',
  fabricId = 'silk',
  customColor = null,
  size = 'M',
  fitMapMode = false,
  gender = 'female',
  scale = 1.0,
  fitAnalysis = null,
}) {
  const mult = sizeMultipliers[size] ?? 1.0
  const isMale = gender === 'male'
  const isEthnic = ['lehenga', 'anarkali', 'kurti', 'kurta', 'sherwani', 'nehru-jacket'].includes(silhouette)

  const fabricMaterialProps = useMemo(() => {
    return createFabricMaterial(fabricId, customColor)
  }, [fabricId, customColor])

  const lowerDrapeGeometry = useMemo(() => {
    return makeGarmentDrapeGeometry(silhouette, gender, size)
  }, [silhouette, gender, size])

  // Tension Colors:
  // Tight = #f87171 (coral red)
  // Optimal = #34d399 (emerald green)
  // Loose = #60a5fa (relaxed blue)
  const getZoneTensionColor = (zoneStatus) => {
    if (zoneStatus === 'tight') return '#f87171'
    if (zoneStatus === 'loose' || zoneStatus === 'oversized') return '#60a5fa'
    return '#34d399' // balanced / optimal
  }

  const chestStatus = fitAnalysis?.chest?.status ?? 'optimal'
  const waistStatus = fitAnalysis?.waist?.status ?? 'optimal'
  const hipStatus = fitAnalysis?.hip?.status ?? 'optimal'

  const chestColor = getZoneTensionColor(chestStatus)
  const waistColor = getZoneTensionColor(waistStatus)
  const hipColor = getZoneTensionColor(hipStatus)

  // Torso overlay dimensions adjusted by size multiplier
  const bustW = (isMale ? 0.28 : 0.26) * mult
  const waistW = (isMale ? 0.23 : 0.18) * mult
  const hipW = (isMale ? 0.24 : 0.25) * mult

  return (
    <group scale={scale}>
      {/* 1. UPPER BODICE / JACKET / SHIRT LAYER */}
      <group position={[0, 0, 0]}>
        {/* Chest/Bust Wrap */}
        <mesh position={[0, 1.18, 0]} castShadow receiveShadow>
          <cylinderGeometry
            args={[
              bustW + 0.008,
              waistW + 0.016,
              0.26,
              36,
              1,
              true
            ]}
          />
          <meshPhysicalMaterial
            {...fabricMaterialProps}
            side={DoubleSide}
            wireframe={fitMapMode}
          />
        </mesh>

        {/* Upper Chest to Clavicle / Neckline */}
        <mesh position={[0, 1.34, 0]} castShadow receiveShadow>
          <cylinderGeometry
            args={[
              (isMale ? 0.20 : 0.16) * mult,
              bustW + 0.008,
              0.16,
              36,
              1,
              true
            ]}
          />
          <meshPhysicalMaterial
            {...fabricMaterialProps}
            side={DoubleSide}
            wireframe={fitMapMode}
          />
        </mesh>

        {/* Collar Accent */}
        <mesh position={[0, 1.45, 0]}>
          <torusGeometry args={[(isMale ? 0.12 : 0.10) * mult, 0.014, 12, 32]} />
          <meshStandardMaterial
            color={isEthnic ? '#cda863' : (customColor ?? '#2a2723')}
            metalness={isEthnic ? 0.85 : 0.1}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* 2. LOWER DRAPE / SKIRT / TROUSERS LAYER */}
      <mesh geometry={lowerDrapeGeometry} position={[0, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          {...fabricMaterialProps}
          side={DoubleSide}
          wireframe={fitMapMode}
        />
      </mesh>

      {/* Hem Trim Accent */}
      {isEthnic && (
        <mesh position={[0, silhouette === 'lehenga' ? 0.04 : 0.32, 0]}>
          <cylinderGeometry
            args={[
              (silhouette === 'lehenga' ? 0.76 : 0.34) * mult - 0.005,
              (silhouette === 'lehenga' ? 0.76 : 0.34) * mult,
              0.04,
              36,
              1,
              true
            ]}
          />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} side={DoubleSide} />
        </mesh>
      )}

      {/* 3. VISUAL TENSION & FIT MAP OVERLAYS (WHEN ACTIVE) */}
      {fitMapMode && (
        <group>
          {/* Bust/Chest Tension Band */}
          <group position={[0, 1.18, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[bustW + 0.025, 0.012, 12, 48]} />
              <meshBasicMaterial color={chestColor} />
            </mesh>
            <mesh position={[bustW + 0.06, 0, 0]}>
              <sphereGeometry args={[0.024, 12, 12]} />
              <meshBasicMaterial color={chestColor} />
            </mesh>
          </group>

          {/* Waist Tension Band */}
          <group position={[0, 0.94, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[waistW + 0.025, 0.012, 12, 48]} />
              <meshBasicMaterial color={waistColor} />
            </mesh>
            <mesh position={[waistW + 0.06, 0, 0]}>
              <sphereGeometry args={[0.024, 12, 12]} />
              <meshBasicMaterial color={waistColor} />
            </mesh>
          </group>

          {/* Hip Tension Band */}
          <group position={[0, 0.72, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[hipW + 0.035, 0.012, 12, 48]} />
              <meshBasicMaterial color={hipColor} />
            </mesh>
            <mesh position={[hipW + 0.07, 0, 0]}>
              <sphereGeometry args={[0.024, 12, 12]} />
              <meshBasicMaterial color={hipColor} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  )
}
