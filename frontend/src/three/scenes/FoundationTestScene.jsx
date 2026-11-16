import { Environment, Lightformer, OrbitControls } from '@react-three/drei'

function MaterialSamples() {
  return (
    <group>
      <mesh position={[-1.25, 0.72, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.62, 64, 64]} />
        <meshPhysicalMaterial color="#c8a879" metalness={0.72} roughness={0.2} clearcoat={0.8} clearcoatRoughness={0.18} />
      </mesh>
      <mesh position={[0, 0.78, 0]} rotation={[0.2, 0.4, 0.2]} castShadow receiveShadow>
        <torusKnotGeometry args={[0.38, 0.14, 180, 32, 2, 5]} />
        <meshPhysicalMaterial color="#ad8d5c" metalness={0.86} roughness={0.24} clearcoat={0.65} />
      </mesh>
      <mesh position={[1.25, 0.72, 0]} castShadow receiveShadow>
        <icosahedronGeometry args={[0.62, 4]} />
        <meshPhysicalMaterial color="#f1e8d9" metalness={0.08} roughness={0.24} clearcoat={0.65} clearcoatRoughness={0.22} />
      </mesh>
    </group>
  )
}

function TestSet() {
  return (
    <group>
      {[-1.25, 0, 1.25].map((x) => (
        <mesh key={x} position={[x, 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.48, 0.58, 0.2, 64]} />
          <meshStandardMaterial color="#4b443a" metalness={0.5} roughness={0.32} />
        </mesh>
      ))}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.5, 0.16, 96]} />
        <meshStandardMaterial color="#302c27" metalness={0.34} roughness={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]} receiveShadow>
        <circleGeometry args={[200, 96]} />
        <meshStandardMaterial color="#24211e" roughness={0.88} />
      </mesh>
    </group>
  )
}

export default function FoundationTestScene() {
  return (
    <>
      <color attach="background" args={['#24211e']} />
      <fog attach="fog" args={['#24211e', 9, 22]} />
      <ambientLight intensity={0.42} color="#fff3df" />
      <directionalLight position={[-3, 6, 4]} intensity={2.2} color="#fff0d5" castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[4, 5, 2]} intensity={65} angle={0.55} penumbra={0.75} color="#e8c994" />
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={3.2} color="#fff4e4" position={[-4, 3, 2]} scale={[5, 4, 1]} />
        <Lightformer form="rect" intensity={2.5} color="#dfc397" position={[4, 2, -2]} scale={[4, 5, 1]} />
        <Lightformer form="ring" intensity={2} color="#fffaf0" position={[0, 5, 1]} scale={2.5} />
      </Environment>
      <TestSet />
      <MaterialSamples />
      <OrbitControls makeDefault enablePan={false} enableDamping minDistance={4.2} maxDistance={8} minPolarAngle={0.65} maxPolarAngle={1.48} target={[0, 0.65, 0]} />
    </>
  )
}
