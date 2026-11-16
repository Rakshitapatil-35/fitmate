import { useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { clone as cloneSkinnedModel } from 'three/addons/utils/SkeletonUtils.js'
import { applyGarmentAppearance } from './applyGarmentAppearance.js'

function LoadedGarment({ asset, fabricId, colorVariantId, motionEnabled }) {
  const { scene, animations } = useGLTF(asset.file)
  const model = useMemo(() => {
    const clone = cloneSkinnedModel(scene)
    clone.traverse((node) => {
      if (!node.isMesh || !node.material) return
      node.material = Array.isArray(node.material) ? node.material.map((material) => material.clone()) : node.material.clone()
    })
    return clone
  }, [scene])

  useEffect(() => {
    model.traverse((node) => {
      if (!node.isMesh || !node.material) return
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      materials.forEach((material) => applyGarmentAppearance(material, asset, { fabricId, colorVariantId }))
    })
  }, [asset, colorVariantId, fabricId, model])

  useEffect(() => () => model.traverse((node) => {
      if (!node.isMesh || !node.material) return
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      materials.forEach((material) => material.dispose())
    }), [model])

  const root = useRef(null)
  const { actions } = useAnimations(animations, root)
  const motionClip = asset.motionClips?.garmentPreview

  useEffect(() => {
    if (!motionEnabled || !motionClip || !actions[motionClip]) return undefined
    actions[motionClip].reset().fadeIn(0.3).play()
    return () => actions[motionClip]?.fadeOut(0.2)
  }, [actions, motionClip, motionEnabled])

  return <group ref={root}><primitive object={model} /></group>
}

export default function GarmentModel({ asset, fabricId, colorVariantId, motionEnabled = false }) {
  if (!asset?.file || asset.status !== 'ready') return null
  return <LoadedGarment asset={asset} fabricId={fabricId} colorVariantId={colorVariantId} motionEnabled={motionEnabled} />
}
