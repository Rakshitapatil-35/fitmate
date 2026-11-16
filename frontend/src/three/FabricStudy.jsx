import { useEffect, useMemo } from 'react'
import { BufferAttribute, BufferGeometry } from 'three'
import { createFabricMaterial } from './fabricMaterialLibrary.js'

function makeFabricStudyGeometry() {
  const columns = 46
  const rows = 62
  const positions = []
  const uvs = []
  const indices = []

  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows
    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns
      const x = (u - 0.5) * 1.18 + Math.sin(v * 5.6 + u * 2) * 0.055
      const y = (0.5 - v) * 1.62
      const folds = Math.sin(u * Math.PI * 7.5 + v * 1.4) * 0.054 + Math.sin(u * Math.PI * 3.2 - v * 2.2) * 0.03
      const drape = Math.cos(v * Math.PI * 0.8) * (0.04 + Math.cos(u * Math.PI * 2) * 0.02)
      const edgeCurl = Math.pow(Math.abs(u - 0.5) * 2, 5) * 0.035
      positions.push(x, y, folds + drape + edgeCurl)
      uvs.push(u * 4, v * 5)
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = row * (columns + 1) + column
      const b = a + columns + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export default function FabricStudy({ fabricId, position = [0, 1.35, 0], scale = 1, rotation = [0, 0, 0] }) {
  const geometry = useMemo(() => makeFabricStudyGeometry(), [])
  const material = useMemo(() => createFabricMaterial(fabricId), [fabricId])
  useEffect(() => () => geometry.dispose(), [geometry])

  return <mesh geometry={geometry} position={position} scale={scale} rotation={rotation} castShadow receiveShadow>
    <meshPhysicalMaterial {...material} />
  </mesh>
}
