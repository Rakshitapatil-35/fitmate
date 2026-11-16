import { useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { clone as cloneSkinnedModel } from 'three/addons/utils/SkeletonUtils.js'
import { applyGarmentAppearance } from './applyGarmentAppearance.js'
import { getReadySceneAsset } from './assetManifest.js'

function CompatibleGarment({ asset, colour, fabricId, colorVariantId, pose }) {
  const { scene, animations } = useGLTF(asset.file)
  const garment = useMemo(() => {
    const clone = cloneSkinnedModel(scene)
    clone.traverse((node) => {
      if (!node.isMesh || !node.material) return
      node.material = Array.isArray(node.material) ? node.material.map((material) => material.clone()) : node.material.clone()
    })
    return clone
  }, [scene])

  useEffect(() => {
    garment.traverse((node) => {
      if (!node.isMesh || !node.material) return
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      materials.forEach((material) => applyGarmentAppearance(material, asset, { fabricId, colorVariantId, customColor: colour }))
    })
  }, [asset, colorVariantId, colour, fabricId, garment])

  useEffect(() => () => garment.traverse((node) => {
    if (!node.isMesh || !node.material) return
    const materials = Array.isArray(node.material) ? node.material : [node.material]
    materials.forEach((material) => material.dispose())
  }), [garment])

  const root = useRef(null)
  const { actions } = useAnimations(animations, root)
  const poseTerms = { relaxed: ['relaxed', 'idle', 'standing'], editorial: ['editorial', 'fashionpose', 'pose'], walk: ['walk', 'walking', 'runway'] }[pose] ?? []
  const poseClip = animations.find((clip) => poseTerms.some((term) => clip.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(term)))?.name

  useEffect(() => {
    if (!poseClip || !actions[poseClip]) return undefined
    actions[poseClip].reset().fadeIn(0.2).play()
    return () => actions[poseClip]?.fadeOut(0.15)
  }, [actions, poseClip])

  return <group ref={root}><primitive object={garment} /></group>
}

export default function AvatarGarment({ assetId, avatarRigId, colour, fabricId, colorVariantId, pose }) {
  const asset = getReadySceneAsset(assetId)
  if (!asset || !avatarRigId || !asset.compatibleAvatarRigs?.includes(avatarRigId)) return null
  return <CompatibleGarment asset={asset} colour={colour} fabricId={fabricId} colorVariantId={colorVariantId} pose={pose} />
}
