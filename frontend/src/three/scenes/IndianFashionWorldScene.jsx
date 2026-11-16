import { useEffect, useMemo, useRef, useState } from 'react'
import { CameraControls, Html, MeshReflectorMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture, CatmullRomCurve3, ExtrudeGeometry, LatheGeometry, MathUtils, Shape, Vector2, Vector3 } from 'three'
import AvatarModel from '../AvatarModel.jsx'
import CoutureMannequin from '../CoutureMannequin.jsx'
import GarmentModel from '../GarmentModel.jsx'
import { getReadySceneAsset } from '../assetManifest.js'
import { indianEthnicPortals } from '../indianEthnicCatalog.js'

function makePalaceMarble() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Base warm Makrana marble color
  ctx.fillStyle = '#eae2d3'
  ctx.fillRect(0, 0, 512, 512)

  // Subtle natural marble veining
  for (let index = 0; index < 36; index += 1) {
    const x = (index * 173 + 47) % 512
    const y = (index * 109 + 29) % 512
    const curve = new CatmullRomCurve3([
      new Vector3(x - 120, y - 140, 0),
      new Vector3(x + 30, y - 55, 0),
      new Vector3(x - 40, y + 22, 0),
      new Vector3(x + 115, y + 145, 0),
    ])
    const points = curve.getPoints(24)
    ctx.beginPath()
    points.forEach((point, pointIndex) => (pointIndex ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)))
    ctx.strokeStyle = index % 4 === 0 ? 'rgba(168,138,91,0.28)' : 'rgba(255,252,242,0.75)'
    ctx.lineWidth = index % 4 === 0 ? 2.5 : 1.2
    ctx.stroke()
  }

  // Pietra Dura Geometric Medallion Inlay in Gold and Deep Lapis Green
  ctx.save()
  ctx.translate(256, 256)
  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath()
    ctx.arc(0, 0, ring * 44, 0, Math.PI * 2)
    ctx.strokeStyle = ring % 2 === 0 ? 'rgba(189,152,86,0.72)' : 'rgba(38,70,54,0.48)'
    ctx.lineWidth = ring % 2 === 0 ? 2.5 : 1.5
    ctx.stroke()
  }

  // 16-point star mandala
  for (let i = 0; i < 16; i += 1) {
    const angle = (i * Math.PI * 2) / 16
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(cos * 170, sin * 170)
    ctx.strokeStyle = 'rgba(197,162,97,0.5)'
    ctx.lineWidth = 1.4
    ctx.stroke()
  }
  ctx.restore()

  const map = new CanvasTexture(canvas)
  map.wrapS = map.wrapT = 1000
  map.repeat.set(5, 8)
  map.colorSpace = 'srgb'
  return map
}

function makeCuspedArchShape(width = 1.65, spring = 2.8) {
  const shape = new Shape()
  shape.moveTo(-width, 0)
  shape.lineTo(-width, spring)

  // 7-lobed cusped Rajasthani arch
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

  // Inner opening
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

function CarvedPalaceColumn({ position, geometry, height = 7.6, radius = 0.42 }) {
  return (
    <group position={position}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#ded2c0" roughness={0.34} metalness={0.06} />
      </mesh>
      {/* 16 vertical fluted relief bars */}
      {Array.from({ length: 16 }, (_, index) => {
        const angle = (index * Math.PI * 2) / 16
        return (
          <mesh
            key={index}
            position={[Math.sin(angle) * radius * 0.86, height / 2, Math.cos(angle) * radius * 0.86]}
            castShadow
          >
            <boxGeometry args={[0.024, height - 1.2, 0.024]} />
            <meshStandardMaterial color="#c5a56a" metalness={0.82} roughness={0.24} />
          </mesh>
        )
      })}
      {/* Gilded ornamental collars */}
      {[0.36, 1.8, height - 1.6, height - 0.38].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <cylinderGeometry args={[radius * 1.22, radius * 1.22, 0.13, 24]} />
          <meshStandardMaterial color="#b99658" metalness={0.88} roughness={0.2} />
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
      {/* Outer gold filigree trim */}
      <mesh geometry={rimGeometry} position={[0, 0, 0.2]}>
        <meshStandardMaterial color="#dab878" transparent opacity={0.22} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Wall anchor piers with carved gold relief */}
      {[-1.85, 1.85].map((x) => (
        <group key={x} position={[x, 0.22, 0.18]}>
          <boxGeometry args={[0.12, 0.62, 0.14]} />
          <meshStandardMaterial color="#bfa166" metalness={0.85} roughness={0.22} />
        </group>
      ))}
    </group>
  )
}

function JharokhaBalcony({ position, mirrored = false, archGeometry, rimGeometry }) {
  return (
    <group position={position} scale={[mirrored ? -1 : 1, 1, 1]}>
      <PalaceArch position={[0, 0, 0]} scale={[0.96, 1.05, 1.05]} archGeometry={archGeometry} rimGeometry={rimGeometry} />
      {/* Translucent jaali backing glass */}
      <mesh position={[0, 2.35, -0.14]}>
        <planeGeometry args={[2.4, 3.6]} />
        <meshPhysicalMaterial color="#7f6645" transparent opacity={0.18} transmission={0.65} roughness={0.18} thickness={0.12} />
      </mesh>
      {/* Ornate projected corbel stone base */}
      <mesh position={[0, 0.76, 0.52]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.16, 0.82]} />
        <meshStandardMaterial color="#96774a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Balustrade railing balusters */}
      {[-1.0, -0.6, -0.2, 0.2, 0.6, 1.0].map((x) => (
        <mesh key={x} position={[x, 0.44, 0.76]} castShadow>
          <cylinderGeometry args={[0.038, 0.048, 0.62, 12]} />
          <meshStandardMaterial color="#cca86c" metalness={0.82} roughness={0.22} />
        </mesh>
      ))}
      {/* Top handrail */}
      <mesh position={[0, 0.82, 0.77]} castShadow>
        <boxGeometry args={[2.45, 0.05, 0.05]} />
        <meshStandardMaterial color="#caa568" metalness={0.84} roughness={0.2} />
      </mesh>
    </group>
  )
}

function LuxuryGlassVitrines({ position, selected, onSelect }) {
  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.()
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      {/* Heavy carved rosewood & antique gold plinth */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.44, 2.0]} />
        <meshPhysicalMaterial color="#3d2a1d" roughness={0.35} metalness={0.35} clearcoat={0.6} />
      </mesh>
      {/* Polished Makrana marble inlay platform */}
      <mesh position={[0, 0.46, 0]} receiveShadow>
        <boxGeometry args={[2.42, 0.06, 1.82]} />
        <meshStandardMaterial
          color={selected ? '#f7edd8' : '#c9b592'}
          roughness={0.2}
          metalness={0.4}
          emissive={selected ? '#9b743a' : '#000000'}
          emissiveIntensity={selected ? 0.28 : 0}
        />
      </mesh>
      {/* Gold border plinth trim */}
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[2.46, 0.02, 1.86]} />
        <meshStandardMaterial color="#d4b06e" metalness={0.88} roughness={0.2} />
      </mesh>
      {/* Museum-grade ultra-clear display glass vitrine */}
      <mesh position={[0, 1.58, 0]}>
        <boxGeometry args={[2.32, 2.18, 1.72]} />
        <meshPhysicalMaterial
          color="#f4ebda"
          transparent
          opacity={0.1}
          transmission={0.85}
          roughness={0.08}
          thickness={0.14}
        />
      </mesh>
      {/* Polished brass structural corner brackets */}
      {[-1.16, 1.16].map((x) =>
        [-0.86, 0.86].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 1.58, z]}>
            <boxGeometry args={[0.045, 2.22, 0.045]} />
            <meshStandardMaterial color="#caa667" metalness={0.9} roughness={0.18} />
          </mesh>
        ))
      )}
      {/* Crown gold cornice frame */}
      <mesh position={[0, 2.7, 0]} castShadow>
        <boxGeometry args={[2.44, 0.09, 1.84]} />
        <meshStandardMaterial color="#caa568" metalness={0.88} roughness={0.2} />
      </mesh>
      {/* Warm internal vitrine downlight */}
      <pointLight position={[0, 2.45, 0]} intensity={selected ? 10 : 5} distance={4.5} color="#ffe2a8" />
    </group>
  )
}

function PalaceLantern({ position }) {
  return (
    <group position={position}>
      {/* Ceiling canopy */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.34, 0.09, 8]} />
        <meshStandardMaterial color="#c29a5c" metalness={0.86} roughness={0.2} />
      </mesh>
      {/* Chain link */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
        <meshStandardMaterial color="#a88046" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Octagonal warm glass lantern body */}
      <mesh position={[0, -0.38, 0]}>
        <octahedronGeometry args={[0.34, 1]} />
        <meshPhysicalMaterial
          color="#e0b46f"
          emissive="#d49748"
          emissiveIntensity={0.65}
          roughness={0.25}
          metalness={0.42}
          transmission={0.25}
        />
      </mesh>
      {/* Lower finial drop */}
      <mesh position={[0, -0.74, 0]} castShadow>
        <coneGeometry args={[0.24, 0.36, 8]} />
        <meshStandardMaterial color="#b58e52" metalness={0.84} roughness={0.22} />
      </mesh>
      <pointLight position={[0, -0.38, 0]} intensity={6.5} distance={6} color="#ffd485" />
    </group>
  )
}

function JaaliLatticePanel({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[2.8, 3.8, 0.14]} />
        <meshStandardMaterial color="#6a5438" roughness={0.55} />
      </mesh>
      {/* Diamond jali lattice geometry */}
      {Array.from({ length: 8 }, (_, index) => {
        const x = (index - 3.5) * 0.35
        return (
          <group key={index} position={[x, 0, 0.09]}>
            <mesh>
              <boxGeometry args={[0.026, 3.55, 0.026]} />
              <meshStandardMaterial color="#cbb07a" metalness={0.75} roughness={0.28} />
            </mesh>
            {Array.from({ length: 8 }, (_, row) => (
              <mesh key={row} position={[0, (row - 3.5) * 0.45, 0]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.29, 0.028, 0.026]} />
                <meshStandardMaterial color="#cbb07a" metalness={0.75} roughness={0.28} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

function GrandRunway() {
  return (
    <group position={[0, 0, -1]}>
      {/* Main elevated Makrana polished marble ramp */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 0.24, 27]} />
        <meshPhysicalMaterial color="#eee6d9" roughness={0.18} metalness={0.08} clearcoat={0.85} clearcoatRoughness={0.18} />
      </mesh>
      {/* Red carpet / crimson silk runner inlay in center */}
      <mesh position={[0, 0.245, 0]} receiveShadow>
        <boxGeometry args={[2.8, 0.015, 26.6]} />
        <meshStandardMaterial color="#7a1c2a" roughness={0.62} metalness={0.05} />
      </mesh>
      {/* Gold metallic side curbs */}
      {[-2.05, 2.05].map((x) => (
        <mesh key={x} position={[x, 0.26, 0]}>
          <boxGeometry args={[0.06, 0.022, 26.8]} />
          <meshStandardMaterial color="#cda863" metalness={0.92} roughness={0.16} emissive="#967137" emissiveIntensity={0.25} />
        </mesh>
      ))}
      {/* Gold filigree side runner trims */}
      {[-1.42, 1.42].map((x) => (
        <mesh key={x} position={[x, 0.255, 0]}>
          <boxGeometry args={[0.035, 0.012, 26.6]} />
          <meshStandardMaterial color="#e5c57b" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
      {/* Runway approach footlights along both edges */}
      {[-12, -8, -4, 0, 4, 8, 12].map((z) => (
        <group key={z}>
          {[-2.12, 2.12].map((x) => (
            <group key={x} position={[x, 0.25, z]}>
              <mesh>
                <cylinderGeometry args={[0.045, 0.06, 0.04, 16]} />
                <meshStandardMaterial color="#cda863" metalness={0.9} roughness={0.18} />
              </mesh>
              <pointLight position={[0, 0.08, 0]} intensity={1.8} distance={2.5} color="#ffe4aa" />
            </group>
          ))}
        </group>
      ))}
      {/* Front & Back ceremonial podium arches */}
      {[-11.5, 11.5].map((z) => (
        <group key={z} position={[0, 0.2, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[5.2, 0.16, 0.65]} />
            <meshStandardMaterial color="#a78652" metalness={0.78} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <boxGeometry args={[4.2, 0.08, 0.28]} />
            <meshStandardMaterial color="#f7e6c4" metalness={0.42} roughness={0.24} emissive="#ba914e" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function PortalArchEntrance({ portal, active, onSelect }) {
  const [x, , z] = portal.position
  return (
    <group position={[x, 0, z]}>
      <PalaceArch position={[0, 0, 0]} scale={[0.92, 1.1, 1]} highlighted={active} />
      <mesh position={[0, 0.1, 0.42]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.16, 0.82]} />
        <meshStandardMaterial color="#a28151" metalness={0.78} roughness={0.24} />
      </mesh>
      {/* 3D Floating Portal Badge in World Space */}
      <Html position={[0, 4.9, 0.25]} center distanceFactor={14}>
        <button
          type="button"
          className={`indian-world-hotspot${active ? ' is-active' : ''}`}
          onClick={() => onSelect(portal.id)}
          aria-label={`Enter ${portal.label}`}
        >
          <small>FITMATE COUTURE PALACE</small>
          <strong>{portal.label}</strong>
          <span>{portal.subtitle}</span>
          <i>EXPLORE WORLD ↗</i>
        </button>
      </Html>
    </group>
  )
}

function PalaceArchitecture({ quality, marble }) {
  const columns = [-11.4, 11.4].flatMap((x) => [-13.5, -6.8, 0, 6.8, 13.5].map((z) => [x, 0, z]))

  const sharedArchResources = useMemo(() => {
    const shape = makeCuspedArchShape()
    const archGeometry = new ExtrudeGeometry(shape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.05,
      bevelThickness: 0.04,
      curveSegments: 24,
    })
    const rimGeometry = new ExtrudeGeometry(shape, {
      depth: 0.03,
      bevelEnabled: false,
      curveSegments: 24,
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
      28
    )
  }, [])

  useEffect(() => {
    return () => {
      sharedArchResources.archGeometry.dispose()
      sharedArchResources.rimGeometry.dispose()
      sharedColumnGeometry.dispose()
    }
  }, [sharedArchResources, sharedColumnGeometry])

  return (
    <>
      <color attach="background" args={['#17120e']} />
      <fog attach="fog" args={['#17120e', 24, 60]} />

      {/* Warm Indian Palace Ambient Lighting */}
      <ambientLight intensity={0.75} color="#faecd5" />
      <directionalLight
        position={[-9, 15, 9]}
        intensity={3.2}
        color="#ffeed0"
        castShadow
        shadow-mapSize-width={quality === 'high' ? 1024 : 512}
        shadow-mapSize-height={quality === 'high' ? 1024 : 512}
      />
      {/* High-intensity golden chandelier spotlights */}
      <pointLight position={[0, 9.2, -12]} intensity={42} distance={32} color="#fcd595" />
      <pointLight position={[0, 8.5, 0]} intensity={36} distance={30} color="#ffdeaa" />
      <pointLight position={[0, 7.5, 12]} intensity={28} distance={26} color="#ffe2b5" />

      {/* Side wing fill lights */}
      <pointLight position={[-8.5, 5.5, -4]} intensity={14} distance={16} color="#dbb478" />
      <pointLight position={[8.5, 5.5, -4]} intensity={14} distance={16} color="#dbb478" />
      <pointLight position={[-8.5, 5.5, 4]} intensity={14} distance={16} color="#e0ba7e" />
      <pointLight position={[8.5, 5.5, 4]} intensity={14} distance={16} color="#e0ba7e" />

      {/* Inlaid Makrana Marble Floor with Reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[28, 42]} />
        <meshPhysicalMaterial
          map={marble}
          color="#f6efe4"
          roughness={0.24}
          metalness={0.06}
          clearcoat={0.65}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {quality === 'high' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, -1]} receiveShadow>
          <planeGeometry args={[4.4, 27]} />
          <MeshReflectorMaterial
            color="#e6dcce"
            roughness={0.22}
            metalness={0.12}
            blur={[140, 42]}
            resolution={256}
            mixBlur={0.78}
            mixStrength={0.75}
            mirror={0.24}
            depthScale={0.1}
          />
        </mesh>
      )}

      {/* Grand Palace Rear Sanctuary / Darbar Arch Screen */}
      <mesh position={[0, 4.6, -20.5]}>
        <boxGeometry args={[28, 9.2, 0.6]} />
        <meshStandardMaterial color="#4d3d2c" roughness={0.75} />
      </mesh>
      {/* Coffered Ceiling with gold borders */}
      <mesh position={[0, 9.2, 0]}>
        <boxGeometry args={[28, 0.5, 42]} />
        <meshStandardMaterial color="#2d2218" roughness={0.68} />
      </mesh>

      {/* Colonnade of multi-cusped arches spanning across the hall */}
      {[...Array(5)].map((_, index) => (
        <PalaceArch
          key={index}
          position={[0, 0, -15 + index * 7.5]}
          scale={[4.3, 2.4, 1.25]}
          archGeometry={sharedArchResources.archGeometry}
          rimGeometry={sharedArchResources.rimGeometry}
        />
      ))}

      {/* 20 Carved Palace Columns flanking the central runway */}
      {columns.map((pos, index) => (
        <CarvedPalaceColumn key={index} position={pos} geometry={sharedColumnGeometry} />
      ))}

      {/* Jharokha Balconies overlooking the central runway */}
      <JharokhaBalcony
        position={[-10.8, 2.4, -11.5]}
        archGeometry={sharedArchResources.archGeometry}
        rimGeometry={sharedArchResources.rimGeometry}
      />
      <JharokhaBalcony
        position={[10.8, 2.4, -11.5]}
        mirrored
        archGeometry={sharedArchResources.archGeometry}
        rimGeometry={sharedArchResources.rimGeometry}
      />
      <JharokhaBalcony
        position={[-10.8, 2.4, 1.8]}
        archGeometry={sharedArchResources.archGeometry}
        rimGeometry={sharedArchResources.rimGeometry}
      />
      <JharokhaBalcony
        position={[10.8, 2.4, 1.8]}
        mirrored
        archGeometry={sharedArchResources.archGeometry}
        rimGeometry={sharedArchResources.rimGeometry}
      />

      {/* Ornate Jaali screens in side recesses */}
      <JaaliLatticePanel position={[-13.2, 4.2, 4.5]} rotation={[0, Math.PI / 2, 0]} />
      <JaaliLatticePanel position={[13.2, 4.2, 4.5]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Hanging Royal Palace Lanterns */}
      {[-9, -3, 3, 9].map((x) => (
        <group key={x} position={[x, 8.8, -2.5]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.4, 0.058, 12, 64]} />
            <meshStandardMaterial color="#cda867" metalness={0.88} roughness={0.18} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={0.78}>
            <torusGeometry args={[1.4, 0.03, 10, 56]} />
            <meshBasicMaterial color="#fff2d7" />
          </mesh>
          <pointLight position={[0, -0.45, 0]} intensity={14} distance={9} color="#fadc9e" />
        </group>
      ))}

      {[-7.5, 0, 7.5].map((x) => (
        <PalaceLantern key={x} position={[x, 7.8, 12.5]} />
      ))}

      {/* Central Fashion Runway */}
      <GrandRunway />
    </>
  )
}

export default function IndianFashionWorldScene({
  quality = 'medium',
  activePortalId = 'saree-world',
  selectedGarment,
  fabricId,
  customColor = null,
  previewOnAvatar = false,
  avatarAssetId = 'femaleAvatar',
  cameraView = 'front',
  isRunwayMode = false,
  onPortalSelect = () => {},
}) {
  const controls = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const { camera } = useThree()
  const marble = useMemo(() => makePalaceMarble(), [])
  const activePortal = indianEthnicPortals.find((portal) => portal.id === activePortalId) ?? indianEthnicPortals[0]
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

  useEffect(() => () => marble.dispose(), [marble])

  // Camera Management: Smoothly animates camera for Portals, Angles (Front/Side/Back), and Runway Walk
  useEffect(() => {
    const currentControls = controls.current
    if (!currentControls) return

    if (isRunwayMode) {
      // Cinematic Runway Camera View: Down the grand runway
      currentControls.setLookAt(0, 3.2, 14.5, 0, 1.8, -4, !reducedMotion)
      return
    }

    const display = activePortal?.displayPosition ?? [-5.7, 0.42, -7.4]
    const direction = { front: [0, 0, 1], side: [1, 0, 0], back: [0, 0, -1] }[cameraView] ?? [0, 0, 1]
    const distance = activePortal ? 6.8 : 22
    const lookAt = activePortal
      ? [display[0], previewOnAvatar ? 1.5 : display[1] + 1.25, display[2]]
      : [0, 2.2, -3]
    const cameraPosition = [
      lookAt[0] + direction[0] * distance,
      lookAt[1] + (cameraView === 'front' ? 1.4 : 0.8),
      lookAt[2] + direction[2] * distance,
    ]

    currentControls.setLookAt(...cameraPosition, ...lookAt, !reducedMotion)
  }, [activePortal, cameraView, camera, previewOnAvatar, reducedMotion, isRunwayMode])

  // Continuous subtle runway camera tracking in Runway Mode
  useFrame(({ clock }) => {
    if (!isRunwayMode || !controls.current) return
    const t = clock.getElapsedTime() * 0.28
    const zPos = 13 - (t % 22) // Dolly camera down runway
    const xSway = Math.sin(t * 1.5) * 0.4
    controls.current.setLookAt(xSway, 2.8, zPos, 0, 1.7, zPos - 6, false)
  })

  return (
    <>
      <PalaceArchitecture quality={quality} marble={marble} />

      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={reducedMotion ? 0 : 0.8}
        draggingSmoothTime={reducedMotion ? 0 : 0.16}
        dollySpeed={0.55}
        truckSpeed={0.4}
        minDistance={3.5}
        maxDistance={35}
        minPolarAngle={MathUtils.degToRad(35)}
        maxPolarAngle={MathUtils.degToRad(110)}
      />

      {/* 6 Portal Architectural Hotspots */}
      {indianEthnicPortals.map((portal) => (
        <PortalArchEntrance
          key={portal.id}
          portal={portal}
          active={portal.id === activePortalId}
          onSelect={onPortalSelect}
        />
      ))}

      {/* Glass Garment Displays for the 6 Portals across the Palace Wings */}
      <LuxuryGlassVitrines
        position={[-5.7, 0, -7.4]}
        selected={activePortalId === 'saree-world'}
        garmentTitle="Saree World"
        onSelect={() => onPortalSelect('saree-world')}
      />
      <LuxuryGlassVitrines
        position={[5.7, 0, -7.4]}
        selected={activePortalId === 'lehenga-world'}
        garmentTitle="Lehenga World"
        onSelect={() => onPortalSelect('lehenga-world')}
      />
      <LuxuryGlassVitrines
        position={[-5.7, 0, 4.4]}
        selected={activePortalId === 'kurti-world'}
        garmentTitle="Kurti World"
        onSelect={() => onPortalSelect('kurti-world')}
      />
      <LuxuryGlassVitrines
        position={[5.7, 0, 4.4]}
        selected={activePortalId === 'festive-collection'}
        garmentTitle="Festive Collection"
        onSelect={() => onPortalSelect('festive-collection')}
      />
      <LuxuryGlassVitrines
        position={[0, 0, -11.4]}
        selected={activePortalId === 'bridal-collection'}
        garmentTitle="Bridal Collection"
        onSelect={() => onPortalSelect('bridal-collection')}
      />
      <LuxuryGlassVitrines
        position={[-5.7, 0, 13.4]}
        selected={activePortalId === 'mens-ethnic-world'}
        garmentTitle="Men’s Ethnic World"
        onSelect={() => onPortalSelect('mens-ethnic-world')}
      />

      {/* Active Garment & Mannequin Presentation in Selected Wing */}
      <group position={activePortal?.displayPosition ?? [0, 0, 0]}>
        {/* If a reviewed GLB garment model is ready and connected */}
        {garmentAsset && !previewOnAvatar && (
          <GarmentModel asset={garmentAsset} fabricId={fabricId} colorVariantId={customColor} />
        )}

        {/* If avatar preview mode is active with validated rig */}
        {garmentAsset && previewOnAvatar && supportsAvatar && (
          <AvatarModel
            assetId={avatarAssetId}
            garmentAssetId={garmentAsset.id}
            garmentFabricId={fabricId}
            heightCm={170}
            pose="relaxed"
          />
        )}

        {/* When asset GLB is pending sourcing: Present on Realistic Haute-Couture Mannequin + PBR Fabric Study */}
        {!garmentAsset && (
          <group position={[0, 0.42, 0]}>
            <CoutureMannequin
              gender={activePortal?.audience === 'Men' ? 'male' : 'female'}
              fabricId={fabricId ?? selectedGarment?.fabricId ?? 'banarasi-silk'}
              customColor={customColor}
              active
              showDrape
            />
          </group>
        )}
      </group>

      {/* Central Runway Showcase Model */}
      <group position={[0, 0.24, -2.5]}>
        <CoutureMannequin
          gender={activePortal?.audience === 'Men' ? 'male' : 'female'}
          fabricId={fabricId ?? 'brocade-royal'}
          customColor={customColor}
          active={isRunwayMode}
          showDrape
        />
        <pointLight position={[0, 3.2, 0]} intensity={12} distance={6} color="#ffe8be" />
      </group>
    </>
  )
}
