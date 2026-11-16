import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { MathUtils } from 'three'
import AvatarModel from '../AvatarModel.jsx'
import FabricStudy from '../FabricStudy.jsx'
import GarmentModel from '../GarmentModel.jsx'

function StudioStage({ fabricId, showFabricStudy }) {
  return <>
    <color attach="background" args={['#171512']} />
    <fog attach="fog" args={['#171512', 13, 26]} />
    <ambientLight intensity={0.72} color="#e8ddc9" />
    <directionalLight position={[-3, 6, 4]} intensity={3.2} color="#fff0da" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <spotLight position={[3.5, 5, 2.5]} angle={0.56} penumbra={0.78} intensity={120} distance={16} color="#e6c68d" castShadow />
    <pointLight position={[0, 3.5, -2]} intensity={24} distance={9} color="#bd965a" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#29251f" roughness={0.32} metalness={0.35} />
    </mesh>
    <mesh position={[0, 0.08, -0.45]} castShadow receiveShadow>
      <cylinderGeometry args={[1.08, 1.12, 0.16, 88]} />
      <meshPhysicalMaterial color="#bca47f" roughness={0.24} metalness={0.42} clearcoat={0.7} />
    </mesh>
    <mesh position={[0, 0.17, -0.45]}>
      <cylinderGeometry args={[1.015, 1.015, 0.022, 88]} />
      <meshStandardMaterial color="#26221c" roughness={0.3} metalness={0.38} />
    </mesh>
    <mesh position={[0, 2.65, -2.4]}>
      <boxGeometry args={[6.6, 5.4, 0.18]} />
      <meshStandardMaterial color="#302a21" roughness={0.72} />
    </mesh>
    {[-2.35, 0, 2.35].map((x) => <mesh key={x} position={[x, 2.6, -2.27]}>
      <boxGeometry args={[0.018, 4.8, 0.025]} />
      <meshStandardMaterial color="#bc9b65" metalness={0.8} roughness={0.28} emissive="#82643a" emissiveIntensity={0.26} />
    </mesh>)}
    <mesh position={[0, 0.02, -0.45]}>
      <torusGeometry args={[1.16, 0.012, 6, 112]} />
      <meshStandardMaterial color="#d8ba7f" emissive="#aa824a" emissiveIntensity={0.5} metalness={0.8} roughness={0.25} />
    </mesh>
    {showFabricStudy && <FabricStudy fabricId={fabricId} />}
  </>
}

export default function GarmentStudioScene({ asset, fabricId, colorVariantId, motionEnabled, previewOnAvatar, avatarAssetId, cameraView, zoom }) {
  const controls = useRef(null)
  const { camera } = useThree()

  useEffect(() => {
    if (!controls.current) return
    const direction = { front: [0, 0, 1], side: [1, 0, 0], back: [0, 0, -1] }[cameraView] ?? [0, 0, 1]
    const distance = zoom === 'detail' ? 2.8 : 5.5
    const targetY = zoom === 'detail' ? 1.5 : 1.2
    const position = direction.map((value, index) => value * distance + (index === 1 ? targetY : 0))
    controls.current.setLookAt(...position, 0, targetY, 0, true)
  }, [camera, cameraView, zoom])

  return <>
    <StudioStage fabricId={fabricId} showFabricStudy={!asset && !previewOnAvatar} />
    {asset && !previewOnAvatar && <GarmentModel asset={asset} fabricId={fabricId} colorVariantId={colorVariantId} motionEnabled={motionEnabled} />}
    {asset && previewOnAvatar && <AvatarModel assetId={avatarAssetId} garmentAssetId={asset.id} garmentFabricId={fabricId} garmentColorVariantId={colorVariantId} heightCm={170} pose="relaxed" />}
    <CameraControls ref={controls} makeDefault minDistance={2.1} maxDistance={8.5} minPolarAngle={MathUtils.degToRad(50)} maxPolarAngle={MathUtils.degToRad(115)} smoothTime={0.6} draggingSmoothTime={0.18} dollySpeed={0.7} />
  </>
}
