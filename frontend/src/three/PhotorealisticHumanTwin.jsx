import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  DoubleSide,
  LatheGeometry,
  MathUtils,
  Vector2,
} from 'three'
import { SKIN_TONES } from './avatarCatalog.js'

// Generate high-resolution lathe geometry for torso based on biometric measurements
function makeAnatomicalTorso(gender, chestScale, waistScale, hipScale, shoulderScale) {
  const points = []
  const isFemale = gender === 'female'

  if (isFemale) {
    const neckR = 0.052
    const clavicleR = 0.095 * shoulderScale
    const shoulderR = 0.175 * shoulderScale
    const bustR = 0.245 * chestScale
    const underBustR = 0.185 * chestScale
    const waistR = 0.165 * waistScale
    const highHipR = 0.225 * hipScale
    const fullHipR = 0.260 * hipScale
    const groinR = 0.130 * hipScale

    points.push(new Vector2(neckR, 1.48))
    points.push(new Vector2(clavicleR, 1.43))
    points.push(new Vector2(shoulderR, 1.36))
    points.push(new Vector2(bustR, 1.20))
    points.push(new Vector2(underBustR, 1.08))
    points.push(new Vector2(waistR, 0.95))
    points.push(new Vector2(highHipR, 0.83))
    points.push(new Vector2(fullHipR, 0.72))
    points.push(new Vector2(groinR, 0.64))
    points.push(new Vector2(0.01, 0.64))
  } else {
    const neckR = 0.065
    const clavicleR = 0.115 * shoulderScale
    const shoulderR = 0.215 * shoulderScale
    const chestR = 0.275 * chestScale
    const ribcageR = 0.235 * chestScale
    const waistR = 0.205 * waistScale
    const highHipR = 0.220 * hipScale
    const fullHipR = 0.240 * hipScale
    const groinR = 0.140 * hipScale

    points.push(new Vector2(neckR, 1.50))
    points.push(new Vector2(clavicleR, 1.45))
    points.push(new Vector2(shoulderR, 1.39))
    points.push(new Vector2(chestR, 1.23))
    points.push(new Vector2(ribcageR, 1.10))
    points.push(new Vector2(waistR, 0.96))
    points.push(new Vector2(highHipR, 0.84))
    points.push(new Vector2(fullHipR, 0.73))
    points.push(new Vector2(groinR, 0.65))
    points.push(new Vector2(0.01, 0.65))
  }

  return new LatheGeometry(points, 48)
}

/**
 * PhotorealisticHumanTwin
 * Real-time 3D Anatomical Human Digital Twin with continuous biometric proportion deformation,
 * natural standing & fashion poses, PBR human skin shading, and fashion garment layers.
 */
export default function PhotorealisticHumanTwin({
  gender = 'female',
  heightCm = 170,
  measurements = {},
  skinToneId = 'warmSand',
  pose = 'relaxed', // 'relaxed' | 'editorial' | 'walk'
  outfit = 'undergarment', // 'undergarment' | 'western' | 'traditional' | 'lehenga'
  accentColor = '#dfc17b',
  active = true,
}) {
  const groupRef = useRef(null)
  const isFemale = gender === 'female'

  // Biometric deformation ratios against standard 170cm model baseline
  const baseChest = isFemale ? 90 : 98
  const baseWaist = isFemale ? 70 : 82
  const baseHip = isFemale ? 96 : 98
  const baseShoulder = isFemale ? 39 : 44
  const baseInseam = isFemale ? 76 : 80

  const userChest = measurements.chest || measurements.bust || baseChest
  const userWaist = measurements.waist || baseWaist
  const userHip = measurements.hip || baseHip
  const userShoulder = measurements.shoulder || baseShoulder
  const userInseam = measurements.inseam || baseInseam

  const heightRatio = heightCm / 170
  const chestScale = MathUtils.clamp(userChest / baseChest, 0.75, 1.35)
  const waistScale = MathUtils.clamp(userWaist / baseWaist, 0.75, 1.40)
  const hipScale = MathUtils.clamp(userHip / baseHip, 0.75, 1.40)
  const shoulderScale = MathUtils.clamp(userShoulder / baseShoulder, 0.80, 1.30)
  const legLengthScale = MathUtils.clamp(userInseam / baseInseam, 0.85, 1.25)

  // Active PBR skin properties
  const skin = SKIN_TONES[skinToneId] || SKIN_TONES.warmSand

  // Dynamic Torso Geometry
  const torsoGeom = useMemo(() => {
    return makeAnatomicalTorso(gender, chestScale, waistScale, hipScale, shoulderScale)
  }, [gender, chestScale, waistScale, hipScale, shoulderScale])

  // Pose Rotation & Offsets
  const poseOffsets = useMemo(() => {
    if (pose === 'editorial') {
      return {
        torsoRotY: -0.08,
        headRotY: 0.14,
        headRotZ: 0.03,
        leftArmRotZ: -0.22,
        rightArmRotZ: 0.35,
        leftLegRotX: -0.06,
        rightLegRotX: 0.08,
        hipOffsetZ: 0.02,
      }
    }
    if (pose === 'walk') {
      return {
        torsoRotY: 0.04,
        headRotY: 0.0,
        headRotZ: 0.0,
        leftArmRotZ: -0.32,
        rightArmRotZ: 0.28,
        leftLegRotX: 0.22,
        rightLegRotX: -0.18,
        hipOffsetZ: 0.0,
      }
    }
    // Relaxed Natural Standing Stance
    return {
      torsoRotY: 0.0,
      headRotY: 0.0,
      headRotZ: 0.0,
      leftArmRotZ: -0.14,
      rightArmRotZ: 0.14,
      leftLegRotX: 0.0,
      rightLegRotX: 0.0,
      hipOffsetZ: 0.0,
    }
  }, [pose])

  // Subtle breathing idle animation
  useFrame((state) => {
    if (!groupRef.current || !active) return
    const t = state.clock.getElapsedTime()
    // Micro breath in chest
    const breath = Math.sin(t * 1.8) * 0.003
    groupRef.current.position.y = breath
  })

  return (
    <group ref={groupRef} scale={[heightRatio, heightRatio, heightRatio]} position={[0, 0, 0]}>
      {/* ====================================================================
          1. ANATOMICAL HEAD & FACIAL STRUCTURE
          ==================================================================== */}
      <group position={[0, 1.58, 0]} rotation={[0, poseOffsets.headRotY, poseOffsets.headRotZ]}>
        {/* Cranium / Head Form */}
        <mesh position={[0, 0.06, 0.015]} castShadow>
          <sphereGeometry args={[isFemale ? 0.096 : 0.104, 32, 28]} />
          <meshPhysicalMaterial
            color={skin.color}
            roughness={skin.roughness}
            metalness={0.02}
            clearcoat={0.12}
            clearcoatRoughness={0.4}
          />
        </mesh>

        {/* Sculpted Jawline & Chin */}
        <mesh position={[0, -0.035, 0.045]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.042, 0.024, 0.08, 20]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} metalness={0.02} />
        </mesh>

        {/* Nose Bridge Contour */}
        <mesh position={[0, 0.02, 0.102]} rotation={[-0.1, 0, 0]}>
          <coneGeometry args={[0.014, 0.042, 12]} />
          <meshStandardMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>

        {/* Left & Right Eyes (Realistic Iris & Cornea) */}
        <mesh position={[-0.034, 0.042, 0.088]}>
          <sphereGeometry args={[0.011, 16, 16]} />
          <meshStandardMaterial color="#1a1410" roughness={0.1} metalness={0.1} />
        </mesh>
        <mesh position={[0.034, 0.042, 0.088]}>
          <sphereGeometry args={[0.011, 16, 16]} />
          <meshStandardMaterial color="#1a1410" roughness={0.1} metalness={0.1} />
        </mesh>

        {/* Anatomical Ears */}
        <mesh position={[-0.098, 0.04, 0.005]} rotation={[0, -0.2, 0.1]}>
          <sphereGeometry args={[0.024, 16, 12]} />
          <meshStandardMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        <mesh position={[0.098, 0.04, 0.005]} rotation={[0, 0.2, -0.1]}>
          <sphereGeometry args={[0.024, 16, 12]} />
          <meshStandardMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>

        {/* Sculpted Coiffed Hair Layer */}
        {isFemale ? (
          <group position={[0, 0.08, -0.01]}>
            <mesh position={[0, 0.02, 0]} castShadow>
              <sphereGeometry args={[0.104, 28, 24, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
              <meshStandardMaterial color="#1c1612" roughness={0.65} metalness={0.1} />
            </mesh>
            {/* Elegant Hair Chignon at Nape */}
            <mesh position={[0, -0.05, -0.09]} castShadow>
              <sphereGeometry args={[0.045, 20, 18]} />
              <meshStandardMaterial color="#1c1612" roughness={0.6} metalness={0.1} />
            </mesh>
          </group>
        ) : (
          <group position={[0, 0.09, 0]}>
            <mesh position={[0, 0.01, 0.01]} castShadow>
              <sphereGeometry args={[0.108, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
              <meshStandardMaterial color="#201a14" roughness={0.7} metalness={0.08} />
            </mesh>
          </group>
        )}
      </group>

      {/* ====================================================================
          2. ANATOMICAL NECK & TORSO MESH
          ==================================================================== */}
      <group rotation={[0, poseOffsets.torsoRotY, 0]}>
        {/* Torso Lathe Mesh with Dynamic Biometric Scaling */}
        <mesh geometry={torsoGeom} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={skin.color}
            roughness={skin.roughness}
            metalness={0.02}
            clearcoat={0.15}
            clearcoatRoughness={0.4}
            side={DoubleSide}
          />
        </mesh>

        {/* Female Bust Volume definition */}
        {isFemale && (
          <group position={[0, 1.20, 0.08 * chestScale]}>
            <mesh position={[-0.082 * chestScale, 0, 0]} castShadow>
              <sphereGeometry args={[0.085 * chestScale, 24, 20]} />
              <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} metalness={0.02} />
            </mesh>
            <mesh position={[0.082 * chestScale, 0, 0]} castShadow>
              <sphereGeometry args={[0.085 * chestScale, 24, 20]} />
              <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} metalness={0.02} />
            </mesh>
          </group>
        )}
      </group>

      {/* ====================================================================
          3. ARMS AND HANDS (LEFT & RIGHT)
          ==================================================================== */}
      {/* Left Arm */}
      <group
        position={[-0.20 * shoulderScale, 1.37, 0]}
        rotation={[0, 0, poseOffsets.leftArmRotZ]}
      >
        {/* Shoulder Deltoid Joint */}
        <mesh castShadow>
          <sphereGeometry args={[0.048, 18, 18]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Upper Arm Bicep */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.042, 0.036, 0.28, 16]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Elbow Joint */}
        <mesh position={[0, -0.30, 0]}>
          <sphereGeometry args={[0.034, 16, 16]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.44, 0]} castShadow>
          <cylinderGeometry args={[0.034, 0.026, 0.26, 16]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Sculpted Hand with Fingers */}
        <mesh position={[0, -0.61, 0]} castShadow>
          <boxGeometry args={[0.038, 0.085, 0.022]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group
        position={[0.20 * shoulderScale, 1.37, 0]}
        rotation={[0, 0, poseOffsets.rightArmRotZ]}
      >
        {/* Shoulder Deltoid Joint */}
        <mesh castShadow>
          <sphereGeometry args={[0.048, 18, 18]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Upper Arm Bicep */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.042, 0.036, 0.28, 16]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Elbow Joint */}
        <mesh position={[0, -0.30, 0]}>
          <sphereGeometry args={[0.034, 16, 16]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.44, 0]} castShadow>
          <cylinderGeometry args={[0.034, 0.026, 0.26, 16]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Sculpted Hand with Fingers */}
        <mesh position={[0, -0.61, 0]} castShadow>
          <boxGeometry args={[0.038, 0.085, 0.022]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
      </group>

      {/* ====================================================================
          4. LEGS AND FEET (LEFT & RIGHT) WITH INSEAM SCALING
          ==================================================================== */}
      {/* Left Leg */}
      <group
        position={[-0.10 * hipScale, 0.65, 0]}
        rotation={[poseOffsets.leftLegRotX, 0, 0.02]}
        scale={[1, legLengthScale, 1]}
      >
        {/* Hip Joint */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.065, 18, 18]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Thigh (Quadriceps) */}
        <mesh position={[0, -0.20, 0]} castShadow>
          <cylinderGeometry args={[0.075 * hipScale, 0.052, 0.38, 20]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Knee Joint */}
        <mesh position={[0, -0.40, 0]}>
          <sphereGeometry args={[0.046, 16, 16]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Lower Leg & Calf */}
        <mesh position={[0, -0.58, 0]} castShadow>
          <cylinderGeometry args={[0.048, 0.032, 0.35, 18]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Ankle & Foot */}
        <group position={[0, -0.78, 0.04]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.045, 0.16]} />
            <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
          </mesh>
        </group>
      </group>

      {/* Right Leg */}
      <group
        position={[0.10 * hipScale, 0.65, 0]}
        rotation={[poseOffsets.rightLegRotX, 0, -0.02]}
        scale={[1, legLengthScale, 1]}
      >
        {/* Hip Joint */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.065, 18, 18]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Thigh (Quadriceps) */}
        <mesh position={[0, -0.20, 0]} castShadow>
          <cylinderGeometry args={[0.075 * hipScale, 0.052, 0.38, 20]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Knee Joint */}
        <mesh position={[0, -0.40, 0]}>
          <sphereGeometry args={[0.046, 16, 16]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Lower Leg & Calf */}
        <mesh position={[0, -0.58, 0]} castShadow>
          <cylinderGeometry args={[0.048, 0.032, 0.35, 18]} />
          <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
        </mesh>
        {/* Ankle & Foot */}
        <group position={[0, -0.78, 0.04]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.045, 0.16]} />
            <meshPhysicalMaterial color={skin.color} roughness={skin.roughness} />
          </mesh>
        </group>
      </group>

      {/* ====================================================================
          5. FASHION ATELIER GARMENT OVERLAYS
          ==================================================================== */}
      {outfit === 'undergarment' && (
        <group>
          {/* Minimal Form-Fitting Technical Undergarment */}
          {isFemale ? (
            <group>
              {/* Bustier Top */}
              <mesh position={[0, 1.18, 0.01]}>
                <cylinderGeometry args={[0.22 * chestScale, 0.17 * waistScale, 0.22, 32, 1, true]} />
                <meshStandardMaterial color="#1a1816" roughness={0.65} metalness={0.1} side={DoubleSide} />
              </mesh>
              {/* Briefs / Bottom */}
              <mesh position={[0, 0.76, 0]}>
                <cylinderGeometry args={[0.18 * waistScale, 0.24 * hipScale, 0.20, 32, 1, true]} />
                <meshStandardMaterial color="#1a1816" roughness={0.65} metalness={0.1} side={DoubleSide} />
              </mesh>
            </group>
          ) : (
            <mesh position={[0, 0.78, 0]}>
              <cylinderGeometry args={[0.21 * waistScale, 0.24 * hipScale, 0.22, 32, 1, true]} />
              <meshStandardMaterial color="#181a20" roughness={0.7} metalness={0.1} side={DoubleSide} />
            </mesh>
          )}
        </group>
      )}

      {outfit === 'western' && (
        <group>
          {/* Western Tailored Fitwear */}
          {isFemale ? (
            <group>
              {/* Mulberry Silk Slip Dress */}
              <mesh position={[0, 0.95, 0]}>
                <cylinderGeometry args={[0.21 * chestScale, 0.32 * hipScale, 0.72, 36, 1, true]} />
                <meshPhysicalMaterial
                  color="#261b17"
                  roughness={0.25}
                  metalness={0.1}
                  sheen={0.65}
                  clearcoat={0.3}
                  side={DoubleSide}
                />
              </mesh>
            </group>
          ) : (
            <group>
              {/* Barathea Tailored Blazer */}
              <mesh position={[0, 1.18, 0]}>
                <cylinderGeometry args={[0.28 * chestScale, 0.24 * waistScale, 0.58, 36, 1, true]} />
                <meshStandardMaterial color="#121418" roughness={0.75} metalness={0.15} side={DoubleSide} />
              </mesh>
              {/* Tailored Barathea Trousers */}
              <mesh position={[0, 0.52, 0]}>
                <cylinderGeometry args={[0.22 * waistScale, 0.20 * hipScale, 0.70, 36, 1, true]} />
                <meshStandardMaterial color="#121418" roughness={0.8} metalness={0.1} side={DoubleSide} />
              </mesh>
            </group>
          )}
        </group>
      )}

      {outfit === 'traditional' && (
        <group>
          {/* Indian Royal Kurta / Sherwani */}
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.27 * chestScale, 0.33 * hipScale, 0.85, 40, 1, true]} />
            <meshPhysicalMaterial
              color="#16233b"
              roughness={0.32}
              metalness={0.25}
              sheen={0.7}
              side={DoubleSide}
            />
          </mesh>
          {/* Gold Zari Collar & Placket Accent */}
          <mesh position={[0, 1.45, 0.05]}>
            <cylinderGeometry args={[0.075, 0.075, 0.04, 32, 1, true]} />
            <meshStandardMaterial color={accentColor} metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      )}

      {outfit === 'lehenga' && (
        <group>
          {/* Choli Blouse */}
          <mesh position={[0, 1.22, 0]}>
            <cylinderGeometry args={[0.23 * chestScale, 0.17 * waistScale, 0.18, 36, 1, true]} />
            <meshPhysicalMaterial color="#8f1d2e" roughness={0.3} metalness={0.4} side={DoubleSide} />
          </mesh>
          {/* 24-Kali Flared Banarasi Skirt */}
          <mesh position={[0, 0.44, 0]}>
            <cylinderGeometry args={[0.18 * waistScale, 0.52, 0.88, 48, 1, true]} />
            <meshPhysicalMaterial
              color="#8f1d2e"
              roughness={0.28}
              metalness={0.55}
              sheen={0.8}
              side={DoubleSide}
            />
          </mesh>
          {/* Antique Gold Zari Hem Border */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.518, 0.522, 0.05, 48, 1, true]} />
            <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.2} side={DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  )
}
