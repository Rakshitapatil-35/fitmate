import { useMemo } from 'react'
import { DoubleSide, LatheGeometry, Vector2 } from 'three'

/**
 * Procedural Lathe Geometry for Anatomical Human Torso & Head
 */
const fullBodyTorsoCache = new Map()

function makeTorsoGeometry(gender = 'female', bodyBuild = 'regular', segments = 40) {
  const points = []
  const isMale = gender === 'male'

  if (isMale) {
    const isAthletic = bodyBuild === 'athletic'
    const isBroad = bodyBuild === 'broad'
    const isSlim = bodyBuild === 'slim'

    const chestW = isAthletic ? 0.30 : isBroad ? 0.31 : isSlim ? 0.25 : 0.27
    const waistW = isAthletic ? 0.20 : isBroad ? 0.26 : isSlim ? 0.19 : 0.22
    const hipW = isBroad ? 0.26 : isSlim ? 0.21 : 0.23

    // Y values from neck down to pelvic base
    points.push(new Vector2(0.065, 1.48)) // neck base
    points.push(new Vector2(0.12, 1.44))  // clavicle slope
    points.push(new Vector2(0.24, 1.38))  // upper shoulder slope
    points.push(new Vector2(chestW, 1.22)) // chest peak
    points.push(new Vector2(chestW - 0.02, 1.10)) // ribcage
    points.push(new Vector2(waistW, 0.94)) // natural waist
    points.push(new Vector2(hipW - 0.01, 0.82)) // high pelvic flare
    points.push(new Vector2(hipW, 0.72)) // full hip & seat
    points.push(new Vector2(0.14, 0.66)) // lower groin cutoff
    points.push(new Vector2(0.0, 0.66))  // pelvic center cap
  } else {
    const isCurvy = bodyBuild === 'curvy'
    const isSlim = bodyBuild === 'slim'

    const bustW = isCurvy ? 0.27 : isSlim ? 0.23 : 0.25
    const waistW = isCurvy ? 0.19 : isSlim ? 0.16 : 0.175
    const hipW = isCurvy ? 0.28 : isSlim ? 0.23 : 0.25

    points.push(new Vector2(0.055, 1.47)) // neck base
    points.push(new Vector2(0.10, 1.43))  // clavicle
    points.push(new Vector2(0.18, 1.36))  // upper bust slope
    points.push(new Vector2(bustW, 1.18)) // bust peak
    points.push(new Vector2(waistW + 0.03, 1.06)) // underbust
    points.push(new Vector2(waistW, 0.94)) // natural waist
    points.push(new Vector2(hipW - 0.02, 0.82)) // high hip
    points.push(new Vector2(hipW, 0.72)) // full hip & seat
    points.push(new Vector2(0.13, 0.66)) // pelvic base
    points.push(new Vector2(0.0, 0.66))  // bottom cap
  }

  return new LatheGeometry(points, segments)
}

function getTorsoGeometry(gender = 'female', bodyBuild = 'regular', lod = 'high') {
  const segments = lod === 'low' ? 20 : lod === 'medium' ? 28 : 40
  const key = `${gender}_${bodyBuild}_${segments}`
  if (!fullBodyTorsoCache.has(key)) {
    fullBodyTorsoCache.set(key, makeTorsoGeometry(gender, bodyBuild, segments))
  }
  return fullBodyTorsoCache.get(key)
}

/**
 * FullBodyAvatarMannequin
 * A precision sculpted full-body anatomical mannequin designed for biometric calibration.
 * Features realistic head finial, neck, shoulders, bust/chest, natural waist, hips, arms, hands, legs and feet.
 */
export default function FullBodyAvatarMannequin({
  gender = 'female',
  bodyBuild = 'regular',
  scale = 1.0,
  active = true,
  finish = 'canvas', // 'canvas' | 'titanium' | 'warm-stone'
  lod = 'high',
}) {
  const isMale = gender === 'male'
  const isAthletic = isMale && bodyBuild === 'athletic'
  const isBroad = isMale && bodyBuild === 'broad'

  const torsoGeometry = useMemo(
    () => getTorsoGeometry(gender, bodyBuild, lod),
    [gender, bodyBuild, lod]
  )

  const materialProps = useMemo(() => {
    if (finish === 'titanium') {
      return {
        color: '#2a2723',
        roughness: 0.25,
        metalness: 0.85,
      }
    }
    if (finish === 'warm-stone') {
      return {
        color: '#dfd7ca',
        roughness: 0.72,
        metalness: 0.05,
      }
    }
    // Default Haute-Couture French Alabaster Canvas
    return {
      color: active ? '#f2ebe0' : '#e2d9cb',
      roughness: 0.65,
      metalness: 0.06,
    }
  }, [finish, active])

  const brassProps = {
    color: '#cda863',
    metalness: 0.92,
    roughness: 0.18,
  }

  const shoulderW = isAthletic ? 0.44 : isBroad ? 0.42 : isMale ? 0.40 : 0.36
  const halfShoulder = shoulderW / 2
  const armX = halfShoulder + 0.035
  const legX = isMale ? 0.11 : 0.10

  return (
    <group scale={scale}>
      {/* 1. SCULPTED HEAD & NECK */}
      {/* Turned Brass Neck Finial Base Collar */}
      <mesh position={[0, 1.48, 0]} castShadow>
        <cylinderGeometry args={[0.058, 0.068, 0.04, 28]} />
        <meshStandardMaterial {...brassProps} />
      </mesh>
      {/* Sculpted Neck */}
      <mesh position={[0, 1.54, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.052, 0.058, 0.10, 24]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      {/* Sculpted Mannequin Head / Egg Silhouette */}
      <mesh position={[0, 1.68, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.092, 32, 32]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      {/* Turned Haute-Couture Brass Head Finial Crown */}
      <mesh position={[0, 1.78, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.038, 0.05, 24]} />
        <meshStandardMaterial {...brassProps} />
      </mesh>
      <mesh position={[0, 1.81, 0]} castShadow>
        <sphereGeometry args={[0.022, 20, 20]} />
        <meshStandardMaterial {...brassProps} />
      </mesh>

      {/* 2. SCULPTED TORSO & PELVIS */}
      <mesh geometry={torsoGeometry} castShadow receiveShadow>
        <meshStandardMaterial {...materialProps} side={DoubleSide} />
      </mesh>

      {/* Tailor's Contrast Balance Line (Center Front Seam) */}
      <mesh position={[0, 1.07, 0.185]}>
        <boxGeometry args={[0.003, 0.80, 0.08]} />
        <meshStandardMaterial color="#b39d82" roughness={0.9} />
      </mesh>
      {/* Center Back Spine Seam */}
      <mesh position={[0, 1.07, -0.185]}>
        <boxGeometry args={[0.003, 0.80, 0.08]} />
        <meshStandardMaterial color="#b39d82" roughness={0.9} />
      </mesh>

      {/* 3. ARTICULATED SHOULDERS & ARMS */}
      {[-1, 1].map((side) => {
        const xPos = side * armX
        return (
          <group key={side}>
            {/* Shoulder Deltoid Joint Sphere */}
            <mesh position={[side * halfShoulder, 1.36, 0]} castShadow>
              <sphereGeometry args={[0.048, 20, 20]} />
              <meshStandardMaterial {...brassProps} />
            </mesh>
            {/* Upper Arm */}
            <mesh position={[xPos, 1.18, 0]} rotation={[0, 0, side * 0.06]} castShadow receiveShadow>
              <cylinderGeometry args={[0.040, 0.034, 0.32, 20]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Elbow Articulation Joint */}
            <mesh position={[xPos + side * 0.012, 1.01, 0]} castShadow>
              <sphereGeometry args={[0.032, 18, 18]} />
              <meshStandardMaterial {...brassProps} />
            </mesh>
            {/* Forearm */}
            <mesh position={[xPos + side * 0.024, 0.86, 0.01]} rotation={[0.05, 0, side * 0.08]} castShadow receiveShadow>
              <cylinderGeometry args={[0.033, 0.027, 0.28, 20]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Wrist Joint Collar */}
            <mesh position={[xPos + side * 0.036, 0.71, 0.015]} castShadow>
              <cylinderGeometry args={[0.024, 0.024, 0.02, 16]} />
              <meshStandardMaterial {...brassProps} />
            </mesh>
            {/* Sculpted Minimalist Tailor Hand */}
            <mesh position={[xPos + side * 0.042, 0.64, 0.02]} rotation={[0.08, 0, side * 0.1]} castShadow receiveShadow>
              <boxGeometry args={[0.022, 0.11, 0.048]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      })}

      {/* 4. ANATOMICAL LEGS & FEET */}
      {[-1, 1].map((side) => {
        const lx = side * legX
        return (
          <group key={side}>
            {/* Hip Joint Socket Ring */}
            <mesh position={[lx, 0.66, 0]} castShadow>
              <cylinderGeometry args={[0.078, 0.078, 0.03, 20]} />
              <meshStandardMaterial {...brassProps} />
            </mesh>
            {/* Upper Thigh */}
            <mesh position={[lx, 0.50, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.082, 0.058, 0.30, 24]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Knee Patella Joint */}
            <mesh position={[lx, 0.34, 0.01]} castShadow>
              <sphereGeometry args={[0.048, 20, 20]} />
              <meshStandardMaterial {...brassProps} />
            </mesh>
            {/* Lower Leg / Calf */}
            <mesh position={[lx, 0.19, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.056, 0.036, 0.26, 22]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            {/* Ankle Collar */}
            <mesh position={[lx, 0.065, 0]} castShadow>
              <cylinderGeometry args={[0.034, 0.034, 0.025, 18]} />
              <meshStandardMaterial {...brassProps} />
            </mesh>
            {/* Sculpted Mannequin Foot resting on the stage floor */}
            <mesh position={[lx, 0.025, 0.04]} castShadow receiveShadow>
              <boxGeometry args={[0.064, 0.042, 0.16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
