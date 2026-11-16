import { useEffect, useMemo, useRef, useState } from 'react'
import { CameraControls, Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import {
  CanvasTexture,
  CatmullRomCurve3,
  DoubleSide,
  LatheGeometry,
  Raycaster,
  Shape,
  Vector2,
  Vector3,
} from 'three'
import CoutureMannequin from '../CoutureMannequin.jsx'
import { showroomPortals } from '../showroomPortals.js'

// Procedural Nero Marquina Black Marble Floor Texture with Gold & Calcite Veins
function createBlackMarbleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1024
  const ctx = canvas.getContext('2d')

  // Deep Obsidian / Nero Marquina base
  ctx.fillStyle = '#0a0b0e'
  ctx.fillRect(0, 0, 1024, 1024)

  // Subtle tonal clouding
  for (let i = 0; i < 60; i += 1) {
    const cx = (i * 187) % 1024
    const cy = (i * 223) % 1024
    const rad = 100 + (i * 17) % 180
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
    grad.addColorStop(0, 'rgba(24, 27, 36, 0.35)')
    grad.addColorStop(1, 'rgba(10, 11, 14, 0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, rad, 0, Math.PI * 2)
    ctx.fill()
  }

  // Champagne Gold & Calcite veins
  for (let i = 0; i < 48; i += 1) {
    const x = (i * 157) % 1024
    const y = (i * 97) % 1024
    const isGold = i % 3 === 0
    const curve = new CatmullRomCurve3([
      new Vector3(x - 180, y - 260, 0),
      new Vector3(x + 40, y - 90, 0),
      new Vector3(x - 55, y + 35, 0),
      new Vector3(x + 220, y + 270, 0),
    ])
    const points = curve.getPoints(32)
    ctx.beginPath()
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    })
    ctx.strokeStyle = isGold ? 'rgba(214, 180, 106, 0.42)' : 'rgba(255, 255, 255, 0.18)'
    ctx.lineWidth = isGold ? 2.4 : 1.2
    ctx.stroke()
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = 1000
  texture.repeat.set(4, 7)
  texture.colorSpace = 'srgb'
  return texture
}

// Grand Arched Portals
function MonumentalArch({ position = [0, 0, 0], scale = 1, color = '#d6b46a' }) {
  const geometry = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-1.6, 0)
    shape.lineTo(-1.6, 3.4)
    shape.absarc(0, 3.4, 1.6, Math.PI, 0, true)
    shape.lineTo(1.6, 0)
    shape.closePath()

    const opening = new Shape()
    opening.moveTo(1.3, 0.12)
    opening.lineTo(1.3, 3.4)
    opening.absarc(0, 3.4, 1.3, 0, Math.PI, false)
    opening.lineTo(-1.3, 0.12)
    opening.closePath()
    shape.holes.push(opening)
    return shape
  }, [])

  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <extrudeGeometry
        args={[
          geometry,
          {
            depth: 0.32,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 1,
            bevelSize: 0.08,
            bevelThickness: 0.06,
            curveSegments: 36,
          },
        ]}
      />
      <meshStandardMaterial color={color} metalness={0.88} roughness={0.22} />
    </mesh>
  )
}

// Classical Fluted Luxury Columns with Brass Collars
function GrandColumn({ position, geometry, height = 6.2, radius = 0.48 }) {
  return (
    <group position={position}>
      {/* Fluted Column Shaft */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#1a1d26" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Vertical Golden Flutes */}
      {Array.from({ length: 16 }, (_, index) => {
        const angle = (index * Math.PI * 2) / 16
        return (
          <mesh
            key={index}
            position={[Math.sin(angle) * radius * 0.94, height / 2, Math.cos(angle) * radius * 0.94]}
            castShadow
          >
            <boxGeometry args={[0.045, height - 0.65, 0.045]} />
            <meshStandardMaterial color="#d6b46a" metalness={0.85} roughness={0.25} />
          </mesh>
        )
      })}

      {/* Turned Brass Base Plinth */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[radius * 1.25, radius * 1.35, 0.18, 32]} />
        <meshStandardMaterial color="#d6b46a" metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Turned Brass Capital */}
      <mesh position={[0, height - 0.32, 0]}>
        <cylinderGeometry args={[radius * 1.28, radius * 1.15, 0.22, 32]} />
        <meshStandardMaterial color="#d6b46a" metalness={0.92} roughness={0.18} />
      </mesh>
    </group>
  )
}

// Interactive 3D Holographic Portal Plaque
function PortalPlaque({ portal, active, hovered, onSelect, onHover }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 340
    const ctx = canvas.getContext('2d')

    // Dark glassmorphic background
    ctx.fillStyle = active ? 'rgba(28, 24, 18, 0.96)' : 'rgba(14, 16, 22, 0.92)'
    ctx.fillRect(0, 0, 640, 340)

    // Glowing border
    ctx.strokeStyle = active ? '#d6b46a' : portal.accent || '#8a7346'
    ctx.lineWidth = active ? 5 : 2.5
    ctx.strokeRect(10, 10, 620, 320)

    // Inner subtle glow border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(16, 16, 608, 308)

    // Monogram & Index Header
    ctx.fillStyle = active ? '#d6b46a' : '#a5a5aa'
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '4px'
    ctx.fillText(`PORTAL ${portal.index} · ${portal.tagline.toUpperCase()}`, 36, 58)

    // Main Department Title
    ctx.fillStyle = '#f5f0e6'
    ctx.font = '36px Georgia, serif'
    ctx.letterSpacing = '0.5px'
    ctx.fillText(portal.label, 36, 126)

    // Description note
    ctx.fillStyle = '#a5a5aa'
    ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '0px'
    ctx.fillText(portal.note, 36, 180)

    // Interactive Action Pill at bottom
    ctx.fillStyle = active ? '#d6b46a' : 'rgba(214, 180, 106, 0.18)'
    ctx.fillRect(36, 236, 260, 48)
    ctx.strokeStyle = active ? '#fff' : '#d6b46a'
    ctx.lineWidth = 1.5
    ctx.strokeRect(36, 236, 260, 48)

    ctx.fillStyle = active ? '#08090c' : '#f5f0e6'
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '3px'
    ctx.fillText('ENTER WORLD  ↗', 56, 268)

    const map = new CanvasTexture(canvas)
    map.colorSpace = 'srgb'
    return map
  }, [active, portal])

  useEffect(() => () => texture.dispose(), [texture])

  const handleClick = (e) => {
    e.stopPropagation()
    onSelect(portal)
  }

  return (
    <group
      position={portal.position}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
        onHover(portal.id)
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
        onHover(null)
      }}
      onClick={handleClick}
    >
      {/* 3D Pedestal Plinth */}
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.4, 0.35, 32]} />
        <meshStandardMaterial
          color={active ? '#d6b46a' : '#14161f'}
          metalness={active ? 0.9 : 0.4}
          roughness={0.25}
        />
      </mesh>

      {/* Holographic Glowing Ring around Pedestal */}
      <mesh position={[0, -1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.22, 1.34, 48]} />
        <meshBasicMaterial
          color={portal.accent || '#d6b46a'}
          transparent
          opacity={active ? 0.95 : hovered ? 0.65 : 0.35}
          side={DoubleSide}
        />
      </mesh>

      {/* Floating Holographic Plaque Frame */}
      <mesh position={[0, 0, -0.05]} castShadow>
        <planeGeometry args={[3.4, 1.85]} />
        <meshStandardMaterial
          color={active ? '#d6b46a' : '#1a1d26'}
          metalness={0.88}
          roughness={0.24}
        />
      </mesh>

      {/* Holographic Plaque Canvas Surface */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[3.3, 1.75]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Hover Light Halo */}
      {(hovered || active) && (
        <pointLight
          position={[0, 0, 0.8]}
          intensity={active ? 25 : 12}
          distance={6}
          color={portal.accent || '#d6b46a'}
        />
      )}
    </group>
  )
}

// Complete Grand Showroom 3D Architecture
function ShowroomArchitecture() {
  const blackMarble = useMemo(() => createBlackMarbleTexture(), [])

  // Lathe geometry for 16-fluted Corinthian-style luxury columns
  const columnGeometry = useMemo(() => {
    const radius = 0.48
    const height = 6.2
    return new LatheGeometry(
      [
        new Vector2(radius * 0.85, 0),
        new Vector2(radius, 0.12),
        new Vector2(radius, 0.25),
        new Vector2(radius * 0.86, 0.42),
        new Vector2(radius * 0.78, 0.65),
        new Vector2(radius * 0.78, height - 0.65),
        new Vector2(radius * 0.86, height - 0.42),
        new Vector2(radius, height - 0.25),
        new Vector2(radius, height - 0.12),
        new Vector2(radius * 0.85, height),
      ],
      32
    )
  }, [])

  useEffect(() => () => {
    blackMarble.dispose()
    columnGeometry.dispose()
  }, [blackMarble, columnGeometry])

  // Spatial arrangement of grand columns
  const columnPositions = useMemo(() => (
    [-11, -6.5, 6.5, 11].flatMap((x) => [-12, -4, 4, 12].map((z) => [x, 0, z]))
  ), [])

  return (
    <>
      {/* Studio Lighting & Reflections */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3.8} color="#fff6e5" position={[-9, 9, 4]} scale={[10, 5, 1]} />
        <Lightformer form="rect" intensity={2.8} color="#d6b46a" position={[9, 8, -6]} scale={[8, 4, 1]} />
        <Lightformer form="ring" intensity={2.5} color="#fff8ee" position={[0, 11, -4]} scale={5} />
      </Environment>

      {/* Atmospheric Fog */}
      <color attach="background" args={['#08090c']} />
      <fog attach="fog" args={['#08090c', 24, 60]} />

      {/* Key Directional & Ambient Lighting */}
      <ambientLight intensity={0.7} color="#f5eedd" />
      <directionalLight
        position={[-10, 14, 8]}
        intensity={3.2}
        color="#fff4dd"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 8, -8]} intensity={42} distance={32} color="#f2d29b" />
      <pointLight position={[0, 6, 12]} intensity={32} distance={26} color="#ffe8c2" />

      {/* 1. Grand Nero Marquina Black Marble Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[28, 44]} />
        <meshPhysicalMaterial
          map={blackMarble}
          color="#0c0d12"
          roughness={0.2}
          metalness={0.15}
          clearcoat={0.65}
          clearcoatRoughness={0.18}
        />
      </mesh>

      {/* 2. Central Glossy Runway with Realistic Mirror Reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -1]} receiveShadow>
        <planeGeometry args={[4.8, 32]} />
        <MeshReflectorMaterial
          color="#12141a"
          roughness={0.18}
          metalness={0.3}
          blur={[300, 100]}
          resolution={512}
          mixBlur={0.75}
          mixStrength={1.4}
          mirror={0.45}
          depthScale={0.15}
        />
      </mesh>

      {/* Central Runway Champagne Gold Trim Borders */}
      <mesh position={[-2.42, 0.02, -1]}>
        <boxGeometry args={[0.06, 0.02, 32]} />
        <meshStandardMaterial color="#d6b46a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[2.42, 0.02, -1]}>
        <boxGeometry args={[0.06, 0.02, 32]} />
        <meshStandardMaterial color="#d6b46a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 3. Perimeter Glass & Dark Granite Curtain Walls */}
      {[-13.5, 13.5].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 4.5, -1]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 9.0, 38]} />
            <meshStandardMaterial color="#0f1117" roughness={0.45} />
          </mesh>
          {/* Champagne Gold Horizontal Inlays */}
          <mesh position={[-Math.sign(x) * 0.28, 4.5, -1]}>
            <boxGeometry args={[0.1, 8.8, 38]} />
            <meshPhysicalMaterial color="#d6b46a" metalness={0.88} roughness={0.22} />
          </mesh>
          {/* Luminous Vertical Light Strips */}
          {[-12, -5, 2, 9, 16].map((z) => (
            <mesh key={z} position={[-Math.sign(x) * 0.38, 4.5, z]}>
              <planeGeometry args={[0.02, 6.4]} />
              <meshBasicMaterial color="#ffe6b3" transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 4. Grand Columns Flanking Showroom */}
      {columnPositions.map((position, index) => (
        <GrandColumn key={index} position={position} geometry={columnGeometry} />
      ))}

      {/* 5. Overhead Ceiling & Dramatic Concentric Light Rings */}
      <mesh position={[0, 9.2, -1]} castShadow>
        <boxGeometry args={[28, 0.6, 40]} />
        <meshStandardMaterial color="#101218" roughness={0.6} />
      </mesh>

      {/* Suspended Champagne-Gold Halo Chandeliers */}
      {[-10, -5, 0, 5, 10].map((x) => (
        <group key={x} position={[x, 8.85, -2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.65, 0.045, 12, 72]} />
            <meshStandardMaterial color="#d6b46a" metalness={0.92} roughness={0.18} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.82, 0.82, 0.82]}>
            <torusGeometry args={[1.65, 0.028, 10, 64]} />
            <meshBasicMaterial color="#fff4dd" />
          </mesh>
          <pointLight position={[0, -0.6, 0]} intensity={18} distance={11} color="#f7e1b5" />
        </group>
      ))}

      {/* 6. Grand Architectural Entrance (South Gate) */}
      <group position={[0, 0, 17.5]}>
        <MonumentalArch position={[0, 0, 0]} scale={[2.3, 2.3, 1]} color="#d6b46a" />
        {/* Double Glass Doors */}
        <group position={[-2.6, 0, 0.5]} rotation={[0, 1.35, 0]}>
          <mesh position={[1.25, 2.8, 0]}>
            <boxGeometry args={[2.5, 5.6, 0.12]} />
            <meshPhysicalMaterial
              color="#1a1c24"
              roughness={0.1}
              metalness={0.2}
              transmission={0.65}
              thickness={0.2}
            />
          </mesh>
          <mesh position={[1.25, 2.8, 0.1]}>
            <boxGeometry args={[0.045, 5.1, 0.03]} />
            <meshStandardMaterial color="#d6b46a" metalness={0.92} roughness={0.18} />
          </mesh>
        </group>
        <group position={[2.6, 0, 0.5]} rotation={[0, -1.35, 0]}>
          <mesh position={[-1.25, 2.8, 0]}>
            <boxGeometry args={[2.5, 5.6, 0.12]} />
            <meshPhysicalMaterial
              color="#1a1c24"
              roughness={0.1}
              metalness={0.2}
              transmission={0.65}
              thickness={0.2}
            />
          </mesh>
          <mesh position={[-1.25, 2.8, 0.1]}>
            <boxGeometry args={[0.045, 5.1, 0.03]} />
            <meshStandardMaterial color="#d6b46a" metalness={0.92} roughness={0.18} />
          </mesh>
        </group>
      </group>

      {/* 7. Elevated Platforms & Dual Staircases */}
      {/* Left Mezzanine Staircase */}
      <group position={[-9.5, 0, -13.5]}>
        {/* Elevated Platform Plinth */}
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.8, 0.4, 6.8]} />
          <meshStandardMaterial color="#141720" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Stair Steps */}
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[2.8 + i * 0.35, i * 0.22, 0]} castShadow>
            <boxGeometry args={[0.38, 0.22, 2.4]} />
            <meshStandardMaterial color="#d6b46a" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Gold Balustrade */}
        <mesh position={[0, 2.9, 3.3]}>
          <boxGeometry args={[6.6, 0.9, 0.05]} />
          <meshPhysicalMaterial
            color="#d6b46a"
            metalness={0.88}
            roughness={0.2}
            transmission={0.4}
            thickness={0.1}
          />
        </mesh>
      </group>

      {/* Right Mezzanine Staircase */}
      <group position={[9.5, 0, -13.5]}>
        {/* Elevated Platform Plinth */}
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.8, 0.4, 6.8]} />
          <meshStandardMaterial color="#141720" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Stair Steps */}
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[-2.8 - i * 0.35, i * 0.22, 0]} castShadow>
            <boxGeometry args={[0.38, 0.22, 2.4]} />
            <meshStandardMaterial color="#d6b46a" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Gold Balustrade */}
        <mesh position={[0, 2.9, 3.3]}>
          <boxGeometry args={[6.6, 0.9, 0.05]} />
          <meshPhysicalMaterial
            color="#d6b46a"
            metalness={0.88}
            roughness={0.2}
            transmission={0.4}
            thickness={0.1}
          />
        </mesh>
      </group>

      {/* 8. Feature Haute Couture Mannequins in Grand Rotunda */}
      {/* Center Left: Festive Banarasi Lehenga Mannequin */}
      <group position={[-3.2, 0, -4.5]} rotation={[0, 0.45, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[1.1, 1.25, 0.24, 36]} />
          <meshStandardMaterial color="#181b24" metalness={0.6} roughness={0.3} />
        </mesh>
        <CoutureMannequin
          gender="female"
          bodyBuild="curvy"
          silhouette="lehenga"
          fabricId="banarasi-silk"
          color="#8f1d2e"
          showDrape={true}
        />
        <pointLight position={[0, 2.5, 0.8]} intensity={14} distance={6} color="#e11d48" />
      </group>

      {/* Center Right: Sartorial Barathea Tuxedo / Sherwani Mannequin */}
      <group position={[3.2, 0, -4.5]} rotation={[0, -0.45, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[1.1, 1.25, 0.24, 36]} />
          <meshStandardMaterial color="#181b24" metalness={0.6} roughness={0.3} />
        </mesh>
        <CoutureMannequin
          gender="male"
          bodyBuild="athletic"
          silhouette="sherwani"
          fabricId="raw-silk"
          color="#16233b"
          showDrape={true}
        />
        <pointLight position={[0, 2.5, 0.8]} intensity={14} distance={6} color="#d4af37" />
      </group>

      {/* Center End: Western Haute Couture Evening Column Dress */}
      <group position={[0, 0.35, -8.5]} rotation={[0, 0, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[1.3, 1.45, 0.35, 40]} />
          <meshStandardMaterial color="#d6b46a" metalness={0.9} roughness={0.22} />
        </mesh>
        <CoutureMannequin
          gender="female"
          bodyBuild="regular"
          silhouette="dress"
          fabricId="chanderi-silk"
          color="#261b17"
          showDrape={true}
        />
        <pointLight position={[0, 2.8, 1.0]} intensity={18} distance={7} color="#fff1d4" />
      </group>
    </>
  )
}

export default function GrandShowroomScene({
  selectedDepartment = 'runway',
  onDepartmentSelect = () => {},
}) {
  const controls = useRef(null)
  const { camera, gl, scene } = useThree()
  const [hoveredPortalId, setHoveredPortalId] = useState(null)

  const selected = useMemo(() => (
    showroomPortals.find((p) => p.id === selectedDepartment)
  ), [selectedDepartment])

  // Camera glide to selected department
  useEffect(() => {
    if (!controls.current) return
    if (selected) {
      const [x, y, z] = selected.camera
      controls.current.setLookAt(x, y, z, selected.position[0], selected.position[1], selected.position[2], true)
    } else {
      // Default Grand Runway Overview
      controls.current.setLookAt(0, 5.2, 18, 0, 2.2, -2, true)
    }
  }, [selected])

  // Raycasting for interactive 3D portal clicks
  useEffect(() => {
    const canvas = gl.domElement
    const raycaster = new Raycaster()
    const pointer = new Vector2()
    let origin = null

    const onDown = (event) => {
      origin = [event.clientX, event.clientY]
    }

    const onUp = (event) => {
      if (!origin || Math.hypot(event.clientX - origin[0], event.clientY - origin[1]) > 7) {
        origin = null
        return
      }
      origin = null

      const bounds = canvas.getBoundingClientRect()
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      )
      raycaster.setFromCamera(pointer, camera)

      // Project onto portal targets
      const hit = raycaster.intersectObjects(scene.children, true).find((intersection) => {
        let object = intersection.object
        while (object && !object.userData.portalId) object = object.parent
        return Boolean(object?.userData?.portalId)
      })

      const portalId = hit?.object?.userData?.portalId
      if (portalId) {
        const found = showroomPortals.find((p) => p.id === portalId)
        if (found) onDepartmentSelect(found)
      }
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
    }
  }, [camera, gl, onDepartmentSelect, scene])

  return (
    <>
      <ShowroomArchitecture />

      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={0.75}
        dollySpeed={0.65}
        truckSpeed={0.4}
        minDistance={5}
        maxDistance={32}
        minPolarAngle={0.62}
        maxPolarAngle={1.48}
        maxAzimuthAngle={Math.PI * 0.52}
        minAzimuthAngle={-Math.PI * 0.52}
      />

      {/* 10 Interactive 3D Showroom Portals */}
      {showroomPortals.map((portal) => (
        <PortalPlaque
          key={portal.id}
          portal={portal}
          active={portal.id === selectedDepartment}
          hovered={portal.id === hoveredPortalId}
          onSelect={onDepartmentSelect}
          onHover={setHoveredPortalId}
        />
      ))}
    </>
  )
}
