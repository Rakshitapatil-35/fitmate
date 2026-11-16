import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { MathUtils } from 'three'
import AvatarModel from '../AvatarModel.jsx'

function StudioArchitecture() {
  return <>
    <color attach="background" args={['#191713']} />
    <fog attach="fog" args={['#191713', 13, 27]} />
    <ambientLight intensity={0.65} color="#f5e8d1" />
    <directionalLight position={[-4, 7, 4]} intensity={3.1} color="#fff0d8" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <spotLight position={[4, 6, 2]} angle={0.52} penumbra={0.8} intensity={150} distance={18} color="#e8c993" castShadow />
    <pointLight position={[0, 3.8, -2.5]} intensity={36} distance={9} color="#dcb978" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
      <planeGeometry args={[32, 32]} />
      <meshStandardMaterial color="#29251f" roughness={0.27} metalness={0.42} />
    </mesh>
    <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[1.13, 1.18, 0.16, 96]} />
      <meshPhysicalMaterial color="#d6c7ae" roughness={0.24} metalness={0.38} clearcoat={0.7} />
    </mesh>
    <mesh position={[0, 0.17, 0]}>
      <cylinderGeometry args={[1.06, 1.06, 0.018, 96]} />
      <meshStandardMaterial color="#29251f" roughness={0.34} metalness={0.5} />
    </mesh>
    <mesh position={[0, 2.45, -2.4]}>
      <boxGeometry args={[7, 5.2, 0.22]} />
      <meshStandardMaterial color="#302920" roughness={0.72} metalness={0.1} />
    </mesh>
    <mesh position={[0, 2.45, -2.27]}>
      <boxGeometry args={[0.035, 4.8, 0.035]} />
      <meshStandardMaterial color="#c4a66f" emissive="#a17b42" emissiveIntensity={0.38} metalness={0.85} roughness={0.25} />
    </mesh>
    <mesh position={[-2.2, 2.45, -2.25]} rotation={[0, 0.12, 0]}>
      <boxGeometry args={[0.018, 4.45, 0.018]} />
      <meshStandardMaterial color="#aa8c5d" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[2.2, 2.45, -2.25]} rotation={[0, -0.12, 0]}>
      <boxGeometry args={[0.018, 4.45, 0.018]} />
      <meshStandardMaterial color="#aa8c5d" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, 4.85, -2.24]}>
      <boxGeometry args={[4.45, 0.025, 0.025]} />
      <meshStandardMaterial color="#aa8c5d" emissive="#725632" emissiveIntensity={0.25} metalness={0.8} />
    </mesh>
    <mesh position={[0, 0.025, 0]}>
      <torusGeometry args={[1.21, 0.012, 6, 128]} />
      <meshStandardMaterial color="#e6cb91" emissive="#bd9350" emissiveIntensity={0.55} metalness={0.82} roughness={0.23} />
    </mesh>
  </>
}

export default function AvatarStudioScene({
  avatarAssetId,
  garmentAssetId,
  colour,
  heightCm,
  measurements,
  skinToneId,
  pose,
  outfit,
  cameraView,
  zoom,
  onControlsReady,
  onPoseSupport,
}) {
  const controlsRef = useRef(null)
  const { camera } = useThree()

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return undefined
    onControlsReady?.(controls)
    return () => onControlsReady?.(null)
  }, [onControlsReady])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const distance = zoom === 'close' ? 2.55 : 5.4
    const direction = {
      front: [0, 0, 1],
      side: [1, 0, 0],
      back: [0, 0, -1],
    }[cameraView] ?? [0, 0, 1]
    const targetY = zoom === 'close' ? 1.63 : 1.08
    const destination = direction.map((value, index) => value * distance + (index === 1 ? targetY : 0))
    controls.setLookAt(...destination, 0, targetY, 0, true)
  }, [camera, cameraView, zoom])

  return (
    <>
      <StudioArchitecture />
      <AvatarModel
        assetId={avatarAssetId}
        garmentAssetId={garmentAssetId}
        colour={colour}
        heightCm={heightCm}
        measurements={measurements}
        skinToneId={skinToneId}
        pose={pose}
        outfit={outfit}
        onPoseSupport={onPoseSupport}
      />
      <CameraControls
        ref={controlsRef}
        makeDefault
        minDistance={2.1}
        maxDistance={8.5}
        minPolarAngle={MathUtils.degToRad(52)}
        maxPolarAngle={MathUtils.degToRad(112)}
        smoothTime={0.65}
        draggingSmoothTime={0.18}
        dollySpeed={0.7}
        truckSpeed={0.35}
      />
    </>
  )
}
