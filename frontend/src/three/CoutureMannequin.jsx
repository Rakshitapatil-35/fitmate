import { useMemo } from 'react'
import { DoubleSide, LatheGeometry, Vector2 } from 'three'
import { createFabricMaterial } from './fabricMaterialLibrary.js'

const torsoCache = new Map()
const drapeCache = new Map()

function makeMannequinTorsoGeometry(gender = 'female', bodyBuild = 'regular', segments = 48) {
  const points = []
  if (gender === 'female') {
    const isCurvy = bodyBuild === 'curvy'
    const isSlim = bodyBuild === 'slim'
    const bustW = isCurvy ? 0.28 : isSlim ? 0.24 : 0.26
    const waistW = isCurvy ? 0.20 : isSlim ? 0.165 : 0.18
    const hipW = isCurvy ? 0.28 : isSlim ? 0.23 : 0.25

    points.push(new Vector2(0.12, 0.0)) // neck base
    points.push(new Vector2(0.14, -0.08)) // clavicle
    points.push(new Vector2(0.24, -0.18)) // upper chest
    points.push(new Vector2(bustW, -0.28)) // bust peak
    points.push(new Vector2(waistW + 0.04, -0.42)) // underbust
    points.push(new Vector2(waistW, -0.58)) // natural waist
    points.push(new Vector2(hipW - 0.03, -0.74)) // high hip
    points.push(new Vector2(hipW, -0.92)) // full hip
    points.push(new Vector2(hipW - 0.04, -1.05)) // mid-thigh cutoff
    points.push(new Vector2(0.12, -1.1)) // base curve
    points.push(new Vector2(0.0, -1.1)) // bottom cap
  } else {
    // Varied Male Body Proportions: athletic (V-taper), regular, broad, slim
    let clavicleW = 0.18
    let chestW = 0.28
    let waistW = 0.23
    let hipW = 0.24

    if (bodyBuild === 'athletic') {
      clavicleW = 0.20
      chestW = 0.32
      waistW = 0.21
      hipW = 0.23
    } else if (bodyBuild === 'broad') {
      clavicleW = 0.19
      chestW = 0.30
      waistW = 0.27
      hipW = 0.27
    } else if (bodyBuild === 'slim') {
      clavicleW = 0.16
      chestW = 0.25
      waistW = 0.20
      hipW = 0.22
    }

    points.push(new Vector2(0.14, 0.0)) // neck base
    points.push(new Vector2(clavicleW, -0.08)) // clavicle
    points.push(new Vector2(chestW, -0.2)) // broad chest
    points.push(new Vector2(chestW + 0.01, -0.32)) // mid-chest
    points.push(new Vector2(chestW - 0.03, -0.48)) // ribcage
    points.push(new Vector2(waistW, -0.62)) // waist
    points.push(new Vector2(hipW, -0.78)) // hip
    points.push(new Vector2(hipW + 0.01, -0.94)) // pelvic drop
    points.push(new Vector2(hipW - 0.02, -1.08)) // thigh cutoff
    points.push(new Vector2(0.12, -1.12)) // base curve
    points.push(new Vector2(0.0, -1.12)) // bottom cap
  }
  return new LatheGeometry(points, segments)
}

function getMannequinTorsoGeometry(gender = 'female', bodyBuild = 'regular', lod = 'high') {
  const segments = lod === 'low' ? 24 : lod === 'medium' ? 32 : 48
  const key = `${gender}_${bodyBuild}_${segments}`
  if (!torsoCache.has(key)) {
    torsoCache.set(key, makeMannequinTorsoGeometry(gender, bodyBuild, segments))
  }
  return torsoCache.get(key)
}

function makeDrapePleatsGeometry(gender = 'female', silhouette = 'default', segments = 56) {
  const points = []
  const steps = 40
  const baseRadius = gender === 'female' ? 0.21 : 0.24

  for (let i = 0; i <= steps; i += 1) {
    const v = i / steps
    let y = -0.55 - v * 0.96
    let flare = Math.pow(v, 1.4) * (gender === 'female' ? 0.38 : 0.28)
    let wave = Math.sin(v * Math.PI * 4.2) * 0.028

    if (silhouette === 'lehenga') {
      // Sweeping 24-kali circular royal flare
      flare = Math.pow(v, 1.25) * 0.56
      wave = Math.sin(v * Math.PI * 6) * 0.032
    } else if (silhouette === 'anarkali') {
      // High empire waist cascading into 32-kali umbrella ghera
      y = -0.42 - v * 1.1
      flare = Math.pow(v, 1.35) * 0.52
      wave = Math.sin(v * Math.PI * 7) * 0.025
    } else if (silhouette === 'saree') {
      // Structured Nivi pleated drape with graceful column silhouette
      flare = Math.pow(v, 1.55) * 0.31
      wave = Math.sin(v * Math.PI * 5) * 0.022
    } else if (silhouette === 'sharara') {
      // Fitted to mid-thigh/knee then dramatic tiered flare
      flare = v < 0.45 ? v * 0.14 : 0.06 + Math.pow((v - 0.45) / 0.55, 1.2) * 0.48
      wave = v > 0.45 ? Math.sin(v * Math.PI * 8) * 0.035 : 0.01
    } else if (silhouette === 'kurti') {
      // Straight knee-length tunic over relaxed palazzo flare
      flare = v < 0.55 ? v * 0.12 : 0.07 + (v - 0.55) * 0.34
      wave = Math.sin(v * Math.PI * 3.5) * 0.018
    } else if (silhouette === 'sherwani') {
      // Structured royal coat skirt flaring cleanly from waist
      y = -0.52 - v * 0.92
      flare = Math.pow(v, 1.3) * 0.26
      wave = Math.sin(v * Math.PI * 3) * 0.015
    } else if (silhouette === 'indo-western') {
      // Asymmetric tailored jacket over draped cowl trousers
      y = -0.52 - v * 0.94
      flare = v < 0.5 ? v * 0.22 : 0.11 - (v - 0.5) * 0.06
      wave = Math.sin(v * Math.PI * 4.5) * 0.024
    } else if (silhouette === 'kurta' && gender === 'male') {
      // Classic straight silk kurta over tapered churidar
      y = -0.52 - v * 0.94
      flare = v < 0.6 ? v * 0.15 : 0.09 - (v - 0.6) * 0.08
      wave = Math.sin(v * Math.PI * 3) * 0.014
    } else if (silhouette === 'nehru-jacket' || silhouette === 'bandhgala') {
      // Clean hip-length tailored coat drop
      y = -0.52 - v * 0.65
      flare = v * 0.08
      wave = 0.005
    } else if (silhouette === 'dress' || silhouette === 'slip-dress') {
      // Bias-cut fluid column dress
      flare = Math.pow(v, 1.35) * 0.32
      wave = Math.sin(v * Math.PI * 3.5) * 0.016
    } else if (silhouette === 'evening-gown' || silhouette === 'gown') {
      // Sculpted column evening gown with floor flare
      flare = Math.pow(v, 1.6) * 0.44
      wave = Math.sin(v * Math.PI * 4) * 0.02
    } else if (silhouette === 'skirt') {
      // High-waisted fluid A-line midi skirt
      y = -0.56 - v * 0.88
      flare = Math.pow(v, 1.3) * 0.38
      wave = Math.sin(v * Math.PI * 4.5) * 0.022
    } else if (silhouette === 'trousers' || silhouette === 'jeans') {
      // Tailored straight-leg trouser column study
      y = -0.58 - v * 0.98
      flare = v * 0.12
      wave = Math.sin(v * Math.PI * 2.5) * 0.01
    } else if (silhouette === 'blazer' || silhouette === 'suit' || silhouette === 'jacket') {
      // Tailored jacket skirt and vent
      y = -0.52 - v * 0.55
      flare = v * 0.09
      wave = 0.006
    }

    points.push(new Vector2(baseRadius + flare + wave, y))
  }
  return new LatheGeometry(points, segments)
}

function getDrapePleatsGeometry(gender = 'female', silhouette = 'default', lod = 'high') {
  const segments = lod === 'low' ? 28 : lod === 'medium' ? 38 : 56
  const key = `${gender}_${silhouette}_${segments}`
  if (!drapeCache.has(key)) {
    drapeCache.set(key, makeDrapePleatsGeometry(gender, silhouette, segments))
  }
  return drapeCache.get(key)
}

export default function CoutureMannequin({
  gender = 'female',
  silhouette = 'default',
  bodyBuild = 'regular',
  fabricId = 'banarasi-silk',
  customColor = null,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  active = false,
  showDrape = true,
  withSpotlight = true,
  lod = 'high',
  onClick,
}) {
  const torsoGeometry = useMemo(
    () => getMannequinTorsoGeometry(gender, bodyBuild, lod),
    [gender, bodyBuild, lod]
  )
  const drapeGeometry = useMemo(
    () => getDrapePleatsGeometry(gender, silhouette, lod),
    [gender, silhouette, lod]
  )

  const fabricMaterialProps = useMemo(() => {
    const base = createFabricMaterial(fabricId)
    if (customColor) {
      return { ...base, color: customColor }
    }
    return base
  }, [fabricId, customColor])

  const isEthnic = useMemo(() => {
    return ['saree', 'lehenga', 'anarkali', 'sharara', 'kurti', 'sherwani'].includes(silhouette)
  }, [silhouette])

  const hemRadius = useMemo(() => {
    if (silhouette === 'lehenga') return 0.76
    if (silhouette === 'anarkali') return 0.72
    if (silhouette === 'sharara') return 0.68
    if (silhouette === 'saree') return 0.51
    if (silhouette === 'kurti') return 0.43
    if (silhouette === 'sherwani') return 0.49
    if (silhouette === 'indo-western' || (silhouette === 'kurta' && gender === 'male')) return 0.36
    if (silhouette === 'dress' || silhouette === 'slip-dress') return 0.48
    if (silhouette === 'evening-gown' || silhouette === 'gown') return 0.58
    if (silhouette === 'skirt') return 0.52
    if (silhouette === 'trousers' || silhouette === 'jeans') return 0.34
    if (silhouette === 'blazer' || silhouette === 'suit' || silhouette === 'jacket') return 0.32
    return gender === 'female' ? 0.54 : 0.48
  }, [gender, silhouette])

  const mannequinTone = active ? '#f5eee1' : '#e6d9c5'

  return (
    <group
      position={position}
      scale={scale}
      rotation={rotation}
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
      {/* Antique Brass Tripod Exhibition Base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.4, 0.08, 36]} />
        <meshStandardMaterial color="#8e6f3e" metalness={0.88} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.32, 0.06, 36]} />
        <meshStandardMaterial color="#b39158" metalness={0.85} roughness={0.22} />
      </mesh>

      {/* Fluted Vertical Stand & Decorative Brass Collars */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.024, 0.024, 1.7, 24]} />
        <meshStandardMaterial color="#b89354" metalness={0.92} roughness={0.18} />
      </mesh>
      {[0.4, 0.8, 1.25].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <torusGeometry args={[0.038, 0.012, 12, 24]} />
          <meshStandardMaterial color="#cfaa68" metalness={0.94} roughness={0.15} />
        </mesh>
      ))}

      {/* Sculpted French-Canvas Tailor Form & Textile Drape Study */}
      <group position={[0, 2.3, 0]}>
        <mesh geometry={torsoGeometry} castShadow receiveShadow>
          <meshStandardMaterial color={mannequinTone} roughness={0.76} metalness={0.02} />
        </mesh>

        {/* Tailor's center seam reference line */}
        <mesh position={[0, -0.55, 0.1]}>
          <boxGeometry args={[0.005, 1.05, 0.28]} />
          <meshStandardMaterial color="#bfad95" roughness={0.9} />
        </mesh>

        {/* Turned Brass Neck Finial Cap */}
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.08, 0.14, 24]} />
          <meshStandardMaterial color="#c5a467" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.18, 0]} castShadow>
          <sphereGeometry args={[0.055, 24, 24]} />
          <meshStandardMaterial color="#dfbf7c" metalness={0.92} roughness={0.18} />
        </mesh>

        {/* Sculpted Textile Drape Swatch (Temporary Study Pending Production GLB) */}
        {showDrape && (
          <group position={[0, 0, 0]}>
            {/* Torso diagonal couture wrap / sash drape */}
            <mesh position={[0, -0.31, 0.015]} rotation={[0.1, -0.15, -0.22]} castShadow receiveShadow>
              <cylinderGeometry
                args={[
                  gender === 'female' ? 0.265 : 0.29,
                  gender === 'female' ? 0.235 : 0.255,
                  gender === 'female' ? 0.44 : 0.48,
                  40,
                  1,
                  true,
                  0,
                  silhouette === 'saree' || silhouette === 'lehenga' ? Math.PI * 1.55 : Math.PI * 1.85,
                ]}
              />
              <meshPhysicalMaterial {...fabricMaterialProps} side={DoubleSide} />
            </mesh>

            {/* Zari upper trim on female saree/lehenga drape study */}
            {isEthnic && gender === 'female' && (
              <mesh position={[0, -0.09, 0.015]} rotation={[0.1, -0.15, -0.22]}>
                <cylinderGeometry args={[0.268, 0.268, 0.032, 40, 1, true, 0, Math.PI * 1.55]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} side={DoubleSide} />
              </mesh>
            )}

            {/* Waist accent: Golden Kamarbandh for ethnic wear, sleek tailored belt line for western */}
            <mesh position={[0, -0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[gender === 'female' ? 0.205 : 0.245, isEthnic ? 0.015 : 0.008, 12, 48]} />
              <meshStandardMaterial
                color={isEthnic ? '#d4af37' : '#3c352f'}
                metalness={isEthnic ? 0.9 : 0.4}
                roughness={isEthnic ? 0.2 : 0.5}
              />
            </mesh>

            {/* Cascading Pleated Lower Drape Volume */}
            <mesh geometry={drapeGeometry} position={[0, 0, 0]} castShadow receiveShadow>
              <meshPhysicalMaterial {...fabricMaterialProps} side={DoubleSide} />
            </mesh>

            {/* Hem Accent: Golden Zari border for ethnic garments, minimal tailored stitch line for modern garments */}
            {isEthnic ? (
              <mesh position={[0, silhouette === 'anarkali' ? -1.49 : -1.47, 0]}>
                <cylinderGeometry args={[hemRadius - 0.01, hemRadius, 0.072, 56, 1, true]} />
                <meshStandardMaterial color="#d4af37" metalness={0.88} roughness={0.22} side={DoubleSide} />
              </mesh>
            ) : (
              <mesh position={[0, -1.48, 0]}>
                <cylinderGeometry args={[hemRadius - 0.004, hemRadius, 0.018, 56, 1, true]} />
                <meshStandardMaterial color="#2d2822" roughness={0.7} metalness={0.1} side={DoubleSide} />
              </mesh>
            )}
          </group>
        )}
      </group>

      {/* Atmospheric Pedestal Spotlight when active */}
      {active && withSpotlight && (
        <pointLight position={[0, 2.2, 0.6]} intensity={5.5} distance={3.8} color="#fbf1d8" />
      )}
    </group>
  )
}
