import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { CameraControls, Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  ExtrudeGeometry,
  LatheGeometry,
  MathUtils,
  Object3D,
  Shape,
  Vector2,
  Vector3,
} from 'three'
import AvatarModel from '../AvatarModel.jsx'
import CoutureMannequin from '../CoutureMannequin.jsx'
import FabricStudy from '../FabricStudy.jsx'
import GarmentModel from '../GarmentModel.jsx'
import ModelAsset from '../ModelAsset.jsx'
import { getReadySceneAsset } from '../assetManifest.js'
import { diwaliGarments } from '../diwaliCatalog.js'

function seededUnit(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

// High-Gloss Palace Marble Floor Texture with Golden Pietra Dura Veins
function makeDiwaliPalaceMarble() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Base luminous ivory-cream Makrana marble
  ctx.fillStyle = '#eee4d4'
  ctx.fillRect(0, 0, 512, 512)

  // Golden and terracotta natural veining
  for (let i = 0; i < 36; i += 1) {
    const x = (i * 181 + 37) % 512
    const y = (i * 113 + 23) % 512
    const curve = new CatmullRomCurve3([
      new Vector3(x - 130, y - 145, 0),
      new Vector3(x + 35, y - 45, 0),
      new Vector3(x - 35, y + 30, 0),
      new Vector3(x + 125, y + 140, 0),
    ])
    const points = curve.getPoints(24)
    ctx.beginPath()
    points.forEach((pt, idx) => (idx ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)))
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(189,142,66,0.32)' : 'rgba(255,250,238,0.78)'
    ctx.lineWidth = i % 3 === 0 ? 2.5 : 1.2
    ctx.stroke()
  }

  // Subtle golden pietra dura octagram inlay border
  ctx.save()
  ctx.translate(256, 256)
  ctx.strokeStyle = 'rgba(197, 152, 73, 0.38)'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(0, 0, 180, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 110, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = 1000
  texture.repeat.set(5, 8)
  texture.colorSpace = 'srgb'
  return texture
}

// Detailed Colourful Sacred Diwali Rangoli Mandala Texture
function makeRangoliTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, 512, 512)

  const cx = 256
  const cy = 256

  // Outer golden-vermilion ring
  ctx.beginPath()
  ctx.arc(cx, cy, 235, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(155, 28, 46, 0.9)' // Sindoor Crimson
  ctx.fill()
  ctx.strokeStyle = '#e5a93c'
  ctx.lineWidth = 8
  ctx.stroke()

  // 16 Outer Marigold & Rani Magenta Petals
  for (let i = 0; i < 16; i += 1) {
    const angle = (i * Math.PI * 2) / 16
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.moveTo(0, -215)
    ctx.quadraticCurveTo(29, -170, 0, -142)
    ctx.quadraticCurveTo(-29, -170, 0, -215)
    ctx.fillStyle = i % 2 === 0 ? '#e5a93c' : '#c2185b'
    ctx.fill()
    ctx.strokeStyle = '#fff8e8'
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.restore()
  }

  // Intermediate Peacock Teal Ring
  ctx.beginPath()
  ctx.arc(cx, cy, 140, 0, Math.PI * 2)
  ctx.fillStyle = '#0e5f76'
  ctx.fill()
  ctx.strokeStyle = '#e5a93c'
  ctx.lineWidth = 6
  ctx.stroke()

  // 12 Inner Lotus Petals
  for (let i = 0; i < 12; i += 1) {
    const angle = (i * Math.PI * 2) / 12
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.moveTo(0, -130)
    ctx.quadraticCurveTo(22, -90, 0, -67)
    ctx.quadraticCurveTo(-22, -90, 0, -130)
    ctx.fillStyle = i % 2 === 0 ? '#d97706' : '#165b33'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }

  // Sacred Inner Golden Sunburst
  ctx.beginPath()
  ctx.arc(cx, cy, 65, 0, Math.PI * 2)
  ctx.fillStyle = '#9b1c2e'
  ctx.fill()
  ctx.strokeStyle = '#ffd875'
  ctx.lineWidth = 5
  ctx.stroke()

  // Kora white lotus center
  ctx.beginPath()
  ctx.arc(cx, cy, 37, 0, Math.PI * 2)
  ctx.fillStyle = '#f7f2e7'
  ctx.fill()

  // Center golden diya mandala star
  ctx.beginPath()
  ctx.arc(cx, cy, 18, 0, Math.PI * 2)
  ctx.fillStyle = '#e5a93c'
  ctx.fill()

  const map = new CanvasTexture(canvas)
  map.colorSpace = 'srgb'
  return map
}

// 7-lobed Cusped Rajasthani Palace Arch
function makeCuspedArchShape(width = 1.68, spring = 2.85) {
  const shape = new Shape()
  shape.moveTo(-width, 0)
  shape.lineTo(-width, spring)

  const cusps = 7
  const cuspStep = Math.PI / cusps
  for (let i = 0; i < cusps; i += 1) {
    const startAngle = Math.PI - i * cuspStep
    const endAngle = startAngle - cuspStep
    const midAngle = (startAngle + endAngle) / 2
    const radius = width * 0.98 + (i % 2 === 0 ? 0.08 : -0.04)
    shape.lineTo(Math.cos(startAngle) * width, spring + Math.sin(startAngle) * width)
    shape.quadraticCurveTo(
      Math.cos(midAngle) * (radius + 0.12),
      spring + Math.sin(midAngle) * (radius + 0.12),
      Math.cos(endAngle) * width,
      spring + Math.sin(endAngle) * width
    )
  }
  shape.lineTo(width, 0)
  shape.closePath()

  const opening = new Shape()
  const inner = width - 0.22
  opening.moveTo(-inner, 0.08)
  opening.lineTo(-inner, spring)
  for (let i = 0; i < cusps; i += 1) {
    const startAngle = Math.PI - i * cuspStep
    const endAngle = startAngle - cuspStep
    const midAngle = (startAngle + endAngle) / 2
    opening.lineTo(Math.cos(startAngle) * inner, spring + Math.sin(startAngle) * inner)
    opening.quadraticCurveTo(
      Math.cos(midAngle) * (inner + 0.08),
      spring + Math.sin(midAngle) * (inner + 0.08),
      Math.cos(endAngle) * inner,
      spring + Math.sin(endAngle) * inner
    )
  }
  opening.lineTo(inner, 0.08)
  opening.closePath()
  shape.holes.push(opening)

  return shape
}

// Carved Palace Column with Gilded Rings (shares single LatheGeometry)
function CarvedPalaceColumn({ position, geometry, height = 7.6, radius = 0.42 }) {
  return (
    <group position={position}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#dfd4c3" roughness={0.34} metalness={0.06} />
      </mesh>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index * Math.PI * 2) / 12
        return (
          <mesh
            key={index}
            position={[Math.sin(angle) * radius * 0.86, height / 2, Math.cos(angle) * radius * 0.86]}
          >
            <boxGeometry args={[0.024, height - 1.2, 0.024]} />
            <meshStandardMaterial color="#c5a56a" metalness={0.82} roughness={0.24} />
          </mesh>
        )
      })}
      {[0.36, 1.8, height - 1.6, height - 0.38].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[radius * 1.22, radius * 1.22, 0.13, 36]} />
          <meshStandardMaterial color="#c8a562" metalness={0.88} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function PalaceArch({ position, scale = 1, highlighted = false, archGeometry, rimGeometry }) {
  return (
    <group position={position} scale={scale}>
      <mesh geometry={archGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={highlighted ? '#cfa868' : '#e4d8c5'}
          metalness={highlighted ? 0.65 : 0.1}
          roughness={highlighted ? 0.26 : 0.42}
        />
      </mesh>
      <mesh geometry={rimGeometry} position={[0, 0, 0.2]}>
        <meshStandardMaterial color="#dab878" transparent opacity={0.28} metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  )
}

// Ornate Jharokha Balcony with Gilded Balustrade
function JharokhaBalcony({ position, mirrored = false, archGeometry, rimGeometry }) {
  return (
    <group position={position} scale={[mirrored ? -1 : 1, 1, 1]}>
      <PalaceArch position={[0, 0, 0]} scale={[0.94, 1.04, 1.04]} highlighted archGeometry={archGeometry} rimGeometry={rimGeometry} />
      <mesh position={[0, 2.35, -0.14]}>
        <planeGeometry args={[2.35, 3.55]} />
        <meshStandardMaterial color="#704e26" transparent opacity={0.34} roughness={0.22} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.76, 0.52]} receiveShadow>
        <boxGeometry args={[2.8, 0.16, 0.82]} />
        <meshStandardMaterial color="#96774a" metalness={0.6} roughness={0.3} />
      </mesh>
      {[-1.0, -0.6, -0.2, 0.2, 0.6, 1.0].map((x) => (
        <mesh key={x} position={[x, 0.44, 0.76]}>
          <cylinderGeometry args={[0.038, 0.048, 0.62, 12]} />
          <meshStandardMaterial color="#cca86c" metalness={0.82} roughness={0.22} />
        </mesh>
      ))}
      <mesh position={[0, 0.82, 0.77]}>
        <boxGeometry args={[2.45, 0.05, 0.05]} />
        <meshStandardMaterial color="#caa568" metalness={0.84} roughness={0.2} />
      </mesh>
    </group>
  )
}

// Glowing Traditional Clay Diya (uses shader-friendly emissive flame core + warm aura, no heavy pointLight flood)
function TraditionalDiya({ position, scale = 1, pulsePhase = 0 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.13, 0.08, 0.07, 16]} />
        <meshStandardMaterial color="#a74a2a" roughness={0.78} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.075, 0]}>
        <torusGeometry args={[0.132, 0.012, 8, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.88} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.072, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.015, 14]} />
        <meshStandardMaterial color="#3d2012" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.14, 0]} scale={[1, 0.96 + (pulsePhase % 2) * 0.1, 1]}>
        <coneGeometry args={[0.042, 0.125, 12]} />
        <meshBasicMaterial color={pulsePhase % 2 === 0 ? '#ffe59c' : '#ffd26a'} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.072, 10, 10]} />
        <meshBasicMaterial color="#ff9b26" transparent opacity={0.42} depthWrite={false} />
      </mesh>
    </group>
  )
}

// Multi-Tiered Brass Deepstambh (Royal Temple Lamp Tower)
function BrassDeepstambh({ position, showTowerLight = false }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.62, 0.4, 24]} />
        <meshStandardMaterial color="#9e7b42" metalness={0.85} roughness={0.24} />
      </mesh>
      <mesh position={[0, 1.85, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.16, 3.3, 24]} />
        <meshStandardMaterial color="#c8a25a" metalness={0.9} roughness={0.2} />
      </mesh>
      {[0.9, 1.65, 2.4, 3.1].map((y, tierIdx) => {
        const tierRadius = 0.44 - tierIdx * 0.07
        return (
          <group key={y} position={[0, y, 0]}>
            <mesh>
              <cylinderGeometry args={[tierRadius, tierRadius * 0.72, 0.09, 20]} />
              <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.18} />
            </mesh>
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i * Math.PI * 2) / 6
              return (
                <TraditionalDiya
                  key={i}
                  position={[Math.cos(angle) * (tierRadius - 0.04), 0.04, Math.sin(angle) * (tierRadius - 0.04)]}
                  scale={0.46}
                  pulsePhase={i + tierIdx}
                />
              )
            })}
          </group>
        )
      })}
      {showTowerLight && <pointLight position={[0, 2.4, 0]} intensity={10} distance={8} color="#ffc46b" />}
    </group>
  )
}

// Instanced Marigold Flower Garland Toran (1 draw call per garland)
function MarigoldGarland({ start = [-2, 0, 0], end = [2, 0, 0], sag = 0.45, flowerCount = 14 }) {
  const meshRef = useRef(null)

  const flowers = useMemo(() => {
    const list = []
    const dummy = new Object3D()
    for (let i = 0; i < flowerCount; i += 1) {
      const t = i / Math.max(1, flowerCount - 1)
      const x = MathUtils.lerp(start[0], end[0], t)
      const z = MathUtils.lerp(start[2], end[2], t)
      const yBase = MathUtils.lerp(start[1], end[1], t)
      const y = yBase - Math.sin(t * Math.PI) * sag
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(i % 2 === 0 ? 1.04 : 0.92)
      dummy.updateMatrix()
      list.push({
        matrix: dummy.matrix.clone(),
        color: new Color(i % 2 === 0 ? '#e67300' : '#f5b800'),
      })
    }
    return list
  }, [start, end, sag, flowerCount])

  useEffect(() => {
    if (!meshRef.current) return
    flowers.forEach((flower, index) => {
      meshRef.current.setMatrixAt(index, flower.matrix)
      meshRef.current.setColorAt(index, flower.color)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [flowers])

  return (
    <instancedMesh ref={meshRef} args={[null, null, flowerCount]}>
      <sphereGeometry args={[0.078, 10, 10]} />
      <meshStandardMaterial roughness={0.82} />
    </instancedMesh>
  )
}

// Deterministic Floating Golden Sparkles and Diya Embers
function FloatingGoldenParticles({ count = 110, reducedMotion = false }) {
  const meshRef = useRef(null)
  const dummy = useMemo(() => new Object3D(), [])

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, idx) => ({
      x: (seededUnit(idx * 7 + 1) - 0.5) * 22,
      y: seededUnit(idx * 7 + 2) * 8.5 + 0.4,
      z: (seededUnit(idx * 7 + 3) - 0.5) * 26,
      speedY: 0.18 + seededUnit(idx * 7 + 4) * 0.35,
      driftX: (seededUnit(idx * 7 + 5) - 0.5) * 0.15,
      scale: 0.035 + seededUnit(idx * 7 + 6) * 0.055,
      phase: seededUnit(idx * 7 + 7) * Math.PI * 2,
    }))
  }, [count])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const time = reducedMotion ? 0.5 : clock.getElapsedTime()
    particles.forEach((p, i) => {
      let y = p.y + time * p.speedY
      if (y > 9) y = 0.5 + (y % 8.5)
      const x = p.x + Math.sin(time + p.phase) * 0.4 + p.driftX
      const z = p.z + Math.cos(time + p.phase) * 0.3

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(p.scale * (0.8 + Math.sin(time * 3 + p.phase) * 0.32))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#ffe899" transparent opacity={0.84} />
    </instancedMesh>
  )
}

// Hanging Ornate Brass Palace Lantern (Aakash Kandil) with luminous emissive amber lantern core
function PalaceLantern({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.14, 0.32, 0.08, 8]} />
        <meshStandardMaterial color="#c29a5c" metalness={0.86} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 8]} />
        <meshStandardMaterial color="#a88046" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.36, 0]}>
        <octahedronGeometry args={[0.34, 1]} />
        <meshStandardMaterial
          color="#f7ca74"
          emissive="#f59e0b"
          emissiveIntensity={1.45}
          roughness={0.24}
          metalness={0.35}
        />
      </mesh>
      <mesh position={[0, -0.36, 0]}>
        <sphereGeometry args={[0.52, 12, 12]} />
        <meshBasicMaterial color="#ffd584" transparent opacity={0.14} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.72, 0]}>
        <coneGeometry args={[0.22, 0.34, 8]} />
        <meshStandardMaterial color="#b58e52" metalness={0.84} roughness={0.22} />
      </mesh>
    </group>
  )
}

function makeAlcovePlaqueTexture(garment) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 176
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#1b1009'
  ctx.fillRect(0, 0, 512, 176)

  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = 4
  ctx.strokeRect(8, 8, 496, 160)

  ctx.fillStyle = '#f5b800'
  ctx.font = '700 22px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(garment.audience.toUpperCase(), 256, 48)

  ctx.fillStyle = '#fff5e4'
  ctx.font = '600 34px Georgia, serif'
  ctx.fillText(garment.shortLabel || garment.label, 256, 98)

  ctx.fillStyle = '#cbbba6'
  ctx.font = '400 21px sans-serif'
  ctx.fillText(garment.craft, 256, 138)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = 'srgb'
  return texture
}

// Interactive 3D Festive Garment Alcove Vitrine for each of the 9 Diwali Collection Garments
function FestiveGarmentAlcove({ garment, selected, customColor, onSelect }) {
  const [x, y, z] = garment.alcovePosition
  const facingAngle = x < 0 ? Math.PI / 2.6 : -Math.PI / 2.6
  const activeColor = selected && customColor ? customColor : garment.defaultColorHex
  const plaqueTexture = useMemo(() => makeAlcovePlaqueTexture(garment), [garment])

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
      {/* Carved Rosewood & Gilded Plinth */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.92, 1.04, 0.36, 32]} />
        <meshPhysicalMaterial
          color={selected ? '#4a2518' : '#2e1b12'}
          roughness={0.32}
          metalness={0.28}
          clearcoat={0.6}
        />
      </mesh>
      {/* Luminous Gold Rim Ring */}
      <mesh position={[0, 0.365, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.92, 0.022, 10, 40]} />
        <meshStandardMaterial
          color={selected ? '#ffe082' : '#cda863'}
          metalness={0.92}
          roughness={0.18}
          emissive={selected ? '#d97706' : '#5e4319'}
          emissiveIntensity={selected ? 0.65 : 0.18}
        />
      </mesh>

      {/* Corner Glowing Diyas on Plinth */}
      {[-0.68, 0.68].map((dx, idx) => (
        <TraditionalDiya key={dx} position={[dx, 0.36, 0.48]} scale={0.5} pulsePhase={idx} />
      ))}

      {/* Haute-Couture Exhibition Dress Form & Draped Textile Study */}
      <CoutureMannequin
        position={[0, 0.36, 0]}
        scale={0.86}
        gender={garment.audience === 'Men' ? 'male' : 'female'}
        silhouette={garment.silhouette}
        fabricId={garment.fabricId}
        customColor={activeColor}
        active={selected}
        withSpotlight={false}
        showDrape
        onClick={() => onSelect(garment)}
      />

      {/* Native 3D Rosewood & Gold Engraved Crest Plaque (zero DOM portal overhead) */}
      <group position={[0, 2.75, 0]}>
        <mesh>
          <boxGeometry args={[1.42, 0.5, 0.04]} />
          <meshStandardMaterial
            color={selected ? '#5e311a' : '#2a180f'}
            metalness={0.45}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[1.36, 0.46]} />
          <meshBasicMaterial map={plaqueTexture} />
        </mesh>
      </group>
    </group>
  )
}

// Grand Festive Runway with Inlaid Marble and Diya Pathway
function GrandFestiveRunway({ quality = 'medium' }) {
  const diyaPoints = useMemo(() => {
    const list = []
    const step = quality === 'low' ? 3.2 : 2.2
    for (let z = -12; z <= 12; z += step) {
      list.push([-2.25, 0.25, z])
      list.push([2.25, 0.25, z])
    }
    return list
  }, [quality])

  return (
    <group position={[0, 0, -1]}>
      {/* Raised Polished Makrana Marble Ramp */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.6, 0.24, 27]} />
        <meshPhysicalMaterial color="#ede4d6" roughness={0.16} metalness={0.08} clearcoat={0.9} clearcoatRoughness={0.15} />
      </mesh>

      {/* Royal Crimson Silk Runner */}
      <mesh position={[0, 0.245, 0]} receiveShadow>
        <boxGeometry args={[2.9, 0.015, 26.6]} />
        <meshStandardMaterial color="#7a1c2a" roughness={0.62} metalness={0.05} />
      </mesh>

      {/* Gold Zari Side Runner Filigree Strips */}
      {[-1.46, 1.46].map((x) => (
        <mesh key={x} position={[x, 0.254, 0]}>
          <boxGeometry args={[0.045, 0.01, 26.6]} />
          <meshStandardMaterial color="#e5c168" metalness={0.88} roughness={0.2} />
        </mesh>
      ))}

      {/* Gold metallic curbs along runway */}
      {[-2.15, 2.15].map((x) => (
        <mesh key={x} position={[x, 0.26, 0]}>
          <boxGeometry args={[0.07, 0.024, 26.8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.16} emissive="#967137" emissiveIntensity={0.25} />
        </mesh>
      ))}

      {/* Glowing Traditional Diyas Lining Both Runway Edges */}
      {diyaPoints.map((pos, idx) => (
        <TraditionalDiya key={idx} position={pos} scale={0.72} pulsePhase={idx} />
      ))}

      {/* Central Runway Turntable Podium */}
      <group position={[0, 0.25, -1.5]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[1.38, 1.52, 0.12, 56]} />
          <meshPhysicalMaterial color="#2b1810" roughness={0.24} metalness={0.35} clearcoat={0.75} />
        </mesh>
        <mesh position={[0, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.38, 0.024, 10, 56]} />
          <meshStandardMaterial color="#ffd875" metalness={0.95} roughness={0.14} emissive="#b47b22" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* Ceremony Podiums at ends of Runway */}
      {[-11.8, 11.8].map((z) => (
        <group key={z} position={[0, 0.2, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[5.2, 0.18, 0.8]} />
            <meshStandardMaterial color="#a78652" metalness={0.78} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <boxGeometry args={[4.4, 0.08, 0.35]} />
            <meshStandardMaterial color="#f7e6c4" metalness={0.42} roughness={0.24} emissive="#ba914e" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default function DiwaliFashionWorldScene({
  quality = 'medium',
  selectedGarmentId = 'diwali-banarasi',
  fabricId = 'banarasi-silk',
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
  onGarmentSelect = () => {},
  onPoseSupport,
}) {
  const controls = useRef(null)
  const runwayWalkerRef = useRef(null)
  const turntableRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const { camera } = useThree()

  const marbleTexture = useMemo(() => makeDiwaliPalaceMarble(), [])
  const rangoliTexture = useMemo(() => makeRangoliTexture(), [])

  const sharedArchResources = useMemo(() => {
    const shape = makeCuspedArchShape()
    const archGeometry = new ExtrudeGeometry(shape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.05,
      bevelThickness: 0.04,
      curveSegments: 28,
    })
    const rimGeometry = new ExtrudeGeometry(shape, {
      depth: 0.03,
      bevelEnabled: false,
      curveSegments: 28,
    })
    return { archGeometry, rimGeometry }
  }, [])

  const sharedColumnGeometry = useMemo(() => {
    const radius = 0.42
    const height = 7.6
    return new LatheGeometry(
      [
        new Vector2(radius * 0.78, 0),
        new Vector2(radius * 1.15, 0.14),
        new Vector2(radius * 1.15, 0.32),
        new Vector2(radius * 0.82, 0.52),
        new Vector2(radius * 0.76, 0.78),
        new Vector2(radius * 0.76, height - 0.92),
        new Vector2(radius * 0.95, height - 0.58),
        new Vector2(radius * 1.25, height - 0.28),
        new Vector2(radius * 1.25, height - 0.14),
        new Vector2(radius * 0.88, height),
      ],
      36
    )
  }, [])

  const selectedGarment = useMemo(() => {
    return diwaliGarments.find((g) => g.id === selectedGarmentId) ?? diwaliGarments[0]
  }, [selectedGarmentId])

  const worldAsset = getReadySceneAsset('diwaliWorld')
  const avatarAssetId = selectedGarment?.audience === 'Men' ? 'maleAvatar' : 'femaleAvatar'
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

  useEffect(() => {
    return () => {
      marbleTexture.dispose()
      rangoliTexture.dispose()
      sharedArchResources.archGeometry.dispose()
      sharedArchResources.rimGeometry.dispose()
      sharedColumnGeometry.dispose()
    }
  }, [marbleTexture, rangoliTexture, sharedArchResources, sharedColumnGeometry])

  // Camera Management: Smooth transitions for Front / Side / Back / Zoom / Runway View
  useEffect(() => {
    const currentControls = controls.current
    if (!currentControls) return

    if (isRunwayMode) {
      currentControls.setLookAt(4.2, 3.1, 11.4, 0, 1.65, -2.5, !reducedMotion)
      return
    }

    const baseTargetY = zoomLevel === 'detail' ? 1.85 : 1.65
    const target = [0, baseTargetY, -2.5]
    const direction = { front: [0, 0, 1], side: [1, 0, 0], back: [0, 0, -1] }[cameraView] ?? [0, 0, 1]
    const distance = zoomLevel === 'detail' ? 3.25 : 5.8
    const heightOffset = zoomLevel === 'detail' ? 0.25 : 0.75
    const camPos = [
      target[0] + direction[0] * distance,
      target[1] + heightOffset,
      target[2] + direction[2] * distance,
    ]

    currentControls.setLookAt(...camPos, ...target, !reducedMotion)
  }, [cameraView, zoomLevel, isRunwayMode, selectedGarmentId, camera, reducedMotion])

  // Animate Runway Promenade Walk & 360-degree Turntable Rotation
  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime()

    if (runwayWalkerRef.current) {
      if (isRunwayMode && !reducedMotion) {
        const cycle = (time * 0.28) % 2
        const progress = cycle <= 1 ? cycle : 2 - cycle
        const smoothZ = MathUtils.lerp(-8.2, 6.2, MathUtils.smoothstep(progress, 0, 1))
        const strideBob = Math.abs(Math.sin(time * 4.8)) * 0.032
        const hipSway = Math.sin(time * 2.4) * 0.025
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

  const columns = [-11.2, 11.2].flatMap((x) => [-13, -6.5, 0, 6.5, 13].map((z) => [x, 0, z]))
  const inspectionCoordinates = [
    [0.34, 2.15, 0.24],
    [-0.36, 1.48, 0.32],
    [0.32, 0.88, 0.44],
  ]
  const enableShadows = quality !== 'low'

  return (
    <>
      <Environment resolution={quality === 'low' ? 64 : 128}>
        <Lightformer form="rect" intensity={3.8} color="#ffe8b8" position={[-8, 8, 4]} scale={[9, 4, 1]} />
        <Lightformer form="rect" intensity={3.2} color="#f5b800" position={[8, 7, -4]} scale={[8, 4, 1]} />
        <Lightformer form="ring" intensity={2.4} color="#fff5dc" position={[0, 10, -5]} scale={5} />
      </Environment>

      <color attach="background" args={['#160e08']} />
      <fog attach="fog" args={['#160e08', 22, 58]} />

      {/* Warm Cinematic Diwali Palace Illumination (bounded light count for desktop & mobile WebGL) */}
      <ambientLight intensity={0.92} color="#faecd5" />
      <directionalLight
        position={[-8, 15, 8]}
        intensity={3.5}
        color="#ffeed0"
        castShadow={enableShadows}
        shadow-mapSize-width={quality === 'high' ? 1024 : 512}
        shadow-mapSize-height={quality === 'high' ? 1024 : 512}
      />
      <pointLight position={[0, 9.2, -12]} intensity={45} distance={34} color="#ffd488" />
      <pointLight position={[0, 8.5, 0]} intensity={42} distance={32} color="#ffdeaa" />
      {quality !== 'low' && <pointLight position={[0, 7.5, 12]} intensity={32} distance={26} color="#ffe2b5" />}

      {worldAsset ? (
        <Suspense fallback={null}>
          <ModelAsset assetId="diwaliWorld" />
        </Suspense>
      ) : (
        <>
          {/* Reflective Makrana Marble Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow={enableShadows}>
            <planeGeometry args={[28, 42]} />
            <meshPhysicalMaterial
              map={marbleTexture}
              color="#f6efe4"
              roughness={0.2}
              metalness={0.08}
              clearcoat={quality === 'low' ? 0.35 : 0.78}
              clearcoatRoughness={0.16}
            />
          </mesh>

          {/* Real-Time Reflective Marble Corridor on High-Quality Devices */}
          {quality === 'high' && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.006, -1]} receiveShadow>
              <planeGeometry args={[16, 36]} />
              <MeshReflectorMaterial
                color="#e6dcce"
                roughness={0.18}
                metalness={0.14}
                blur={[120, 38]}
                resolution={256}
                mixBlur={0.78}
                mixStrength={0.75}
                mirror={0.32}
                depthScale={0.1}
              />
            </mesh>
          )}

          {/* Sacred Colourful Rangoli Mandala at Front & Rear of Runway */}
          {[10.5, -13.2].map((zPos) => (
            <group key={zPos} position={[0, 0.006, zPos]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={enableShadows}>
                <planeGeometry args={[4.4, 4.4]} />
                <meshBasicMaterial map={rangoliTexture} transparent opacity={0.96} />
              </mesh>
              {Array.from({ length: quality === 'low' ? 8 : 12 }, (_, i) => {
                const count = quality === 'low' ? 8 : 12
                const angle = (i * Math.PI * 2) / count
                const r = 2.15
                return (
                  <TraditionalDiya
                    key={i}
                    position={[Math.cos(angle) * r, 0.01, Math.sin(angle) * r]}
                    scale={0.7}
                    pulsePhase={i}
                  />
                )
              })}
            </group>
          ))}

          {/* Grand Indian Palace Architecture: Rear Darbar Sanctuary & Coffered Ceiling */}
          <mesh position={[0, 4.6, -20.5]}>
            <boxGeometry args={[28, 9.2, 0.6]} />
            <meshStandardMaterial color="#422c1b" roughness={0.7} />
          </mesh>
          <mesh position={[0, 9.2, 0]}>
            <boxGeometry args={[28, 0.5, 42]} />
            <meshStandardMaterial color="#2a1d13" roughness={0.68} />
          </mesh>

          {/* Multi-Tiered Brass Deepstambh Lamp Towers Flanking the Royal Darbar */}
          <BrassDeepstambh position={[-4.2, 0, -14.8]} showTowerLight={quality === 'high'} />
          <BrassDeepstambh position={[4.2, 0, -14.8]} showTowerLight={quality === 'high'} />

          {/* Jharokha Royal Balconies Overlooking the Runway */}
          <JharokhaBalcony
            position={[-10.6, 2.5, -9.5]}
            archGeometry={sharedArchResources.archGeometry}
            rimGeometry={sharedArchResources.rimGeometry}
          />
          <JharokhaBalcony
            position={[10.6, 2.5, -9.5]}
            mirrored
            archGeometry={sharedArchResources.archGeometry}
            rimGeometry={sharedArchResources.rimGeometry}
          />
          <JharokhaBalcony
            position={[-10.6, 2.5, 3.5]}
            archGeometry={sharedArchResources.archGeometry}
            rimGeometry={sharedArchResources.rimGeometry}
          />
          <JharokhaBalcony
            position={[10.6, 2.5, 3.5]}
            mirrored
            archGeometry={sharedArchResources.archGeometry}
            rimGeometry={sharedArchResources.rimGeometry}
          />

          {/* Colonnade of Multi-Cusped Rajasthani Arches */}
          {[...Array(5)].map((_, index) => (
            <PalaceArch
              key={index}
              position={[0, 0, -15 + index * 7.5]}
              scale={[4.3, 2.4, 1.25]}
              highlighted={index === 2}
              archGeometry={sharedArchResources.archGeometry}
              rimGeometry={sharedArchResources.rimGeometry}
            />
          ))}

          {/* 20 Carved Palace Columns */}
          {columns.map((pos, index) => (
            <CarvedPalaceColumn key={index} position={pos} geometry={sharedColumnGeometry} />
          ))}

          {/* Marigold Flower Garlands (Genda Phool Torans) Draped Across Arches & Colonnades */}
          {[-15, -7.5, 0, 7.5].map((z) => (
            <group key={z} position={[0, 5.2, z]}>
              <MarigoldGarland start={[-3.8, 0, 0]} end={[0, -0.6, 0]} sag={0.5} flowerCount={16} />
              <MarigoldGarland start={[0, -0.6, 0]} end={[3.8, 0, 0]} sag={0.5} flowerCount={16} />
            </group>
          ))}
          {[-9.5, -3.2, 3.2, 9.5].map((z) => (
            <group key={`side-garland-${z}`}>
              <MarigoldGarland start={[-11.2, 4.8, z - 3]} end={[-11.2, 4.8, z + 3]} sag={0.42} flowerCount={12} />
              <MarigoldGarland start={[11.2, 4.8, z - 3]} end={[11.2, 4.8, z + 3]} sag={0.42} flowerCount={12} />
            </group>
          ))}

          {/* Hanging Brass Palace Lanterns (Aakash Kandils) */}
          {[-7.5, 0, 7.5].map((x) => (
            <PalaceLantern key={`front-lantern-${x}`} position={[x, 7.8, 12]} />
          ))}
          {[-9, -3, 3, 9].map((x) => (
            <PalaceLantern key={`mid-lantern-${x}`} position={[x, 8.2, -4]} />
          ))}
          {[-6, 0, 6].map((x) => (
            <PalaceLantern key={`rear-lantern-${x}`} position={[x, 8.0, -12]} />
          ))}

          {/* Floating Golden Particles & Festive Embers */}
          <FloatingGoldenParticles count={quality === 'low' ? 48 : 110} reducedMotion={reducedMotion} />

          {/* Central Grand Festive Runway */}
          <GrandFestiveRunway quality={quality} />
        </>
      )}

      {/* All 9 Diwali Collection Garments Showcased in Interactive 3D Palace Alcoves */}
      {diwaliGarments.map((garment) => (
        <FestiveGarmentAlcove
          key={garment.id}
          garment={garment}
          selected={garment.id === selectedGarment.id}
          customColor={customColor}
          onSelect={onGarmentSelect}
        />
      ))}

      {/* Active Featured Outfit Presentation on the Grand Runway */}
      <group ref={runwayWalkerRef} position={[0, 0.31, -2.5]}>
        <group ref={turntableRef}>
          {/* 1. Production GLB garment on showcase plinth */}
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

          {/* 2. Production GLB rigged avatar wearing compatible garment GLB */}
          {garmentAsset && previewOnAvatar && supportsAvatar && (
            <Suspense fallback={null}>
              <AvatarModel
                assetId={avatarAssetId}
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
                gender={selectedGarment?.audience === 'Men' ? 'male' : 'female'}
                silhouette={selectedGarment?.silhouette ?? 'saree'}
                fabricId={fabricId ?? selectedGarment?.fabricId ?? 'banarasi-silk'}
                customColor={customColor}
                active
                withSpotlight={false}
                showDrape
              />
              {zoomLevel === 'detail' && (
                <FabricStudy fabricId={fabricId ?? selectedGarment?.fabricId ?? 'banarasi-silk'} position={[0.98, 1.38, 0.12]} />
              )}
            </>
          )}

          {/* Clickable 3D Gemstone Inspection Pins (rotate with turntable, React 19 native WebGL) */}
          {!isRunwayMode &&
            selectedGarment?.inspectionPoints?.map((pt, index) => {
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
                    <meshBasicMaterial color={isPointActive ? '#ffd875' : '#e5a93c'} transparent opacity={isPointActive ? 0.95 : 0.55} />
                  </mesh>
                </group>
              )
            })}
        </group>

        {/* Dedicated Golden Runway Follow-Spotlights */}
        <pointLight position={[0, 3.6, 0.9]} intensity={16} distance={8} color="#fff1d0" />
        {quality !== 'low' && <pointLight position={[0, 2.4, -1.1]} intensity={8} distance={6} color="#ffd27d" />}
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
