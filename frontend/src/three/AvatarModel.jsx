import { useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { clone as cloneSkinnedModel } from 'three/addons/utils/SkeletonUtils.js'
import { getReadySceneAsset } from './assetManifest.js'
import AvatarGarment from './AvatarGarment.jsx'
import PhotorealisticHumanTwin from './PhotorealisticHumanTwin.jsx'

function normalizeClipName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function chooseClip(clips, pose) {
  const keys = {
    relaxed: ['relaxed', 'idle', 'standing'],
    editorial: ['editorial', 'fashionpose', 'pose'],
    walk: ['walk', 'walking', 'runway'],
  }[pose] ?? []
  return clips.find((clip) => keys.some((key) => normalizeClipName(clip.name).includes(key)))?.name
}

function RiggedModel({ asset, garmentAssetId, colour, garmentFabricId, garmentColorVariantId, heightCm, pose, onPoseSupport }) {
  const { scene, animations } = useGLTF(asset.file)
  const model = useMemo(() => cloneSkinnedModel(scene), [scene])
  const modelRef = useRef(null)
  const { actions, names } = useAnimations(animations, modelRef)
  const clipName = useMemo(() => chooseClip(animations, pose), [animations, pose])

  useEffect(() => {
    onPoseSupport?.(Boolean(clipName))
    if (!clipName || !actions[clipName]) return undefined
    actions[clipName].reset().fadeIn(0.25).play()
    return () => actions[clipName]?.fadeOut(0.2)
  }, [actions, clipName, names, onPoseSupport])

  const scale = heightCm / (asset.modelHeightCm || 170)
  return (
    <group ref={modelRef} scale={scale}>
      <primitive object={model} />
      <AvatarGarment
        assetId={garmentAssetId}
        avatarRigId={asset.skeletonId}
        colour={colour}
        fabricId={garmentFabricId}
        colorVariantId={garmentColorVariantId}
        pose={pose}
      />
    </group>
  )
}

export default function AvatarModel({
  assetId,
  garmentAssetId,
  colour,
  garmentFabricId,
  garmentColorVariantId,
  heightCm = 170,
  measurements = {},
  skinToneId = 'warmSand',
  pose = 'relaxed',
  outfit = 'undergarment',
  onPoseSupport,
}) {
  const asset = getReadySceneAsset(assetId)
  const isFemale = !assetId || assetId.toLowerCase().includes('female')

  // When a verified, licensed rigged GLB is present in the pipeline, render RiggedModel
  if (asset?.file) {
    return (
      <RiggedModel
        asset={asset}
        garmentAssetId={garmentAssetId}
        colour={colour}
        garmentFabricId={garmentFabricId}
        colorVariantId={garmentColorVariantId}
        heightCm={heightCm}
        pose={pose}
        onPoseSupport={onPoseSupport}
      />
    )
  }

  // High-fidelity Photorealistic Human Twin fallback
  return (
    <PhotorealisticHumanTwin
      gender={isFemale ? 'female' : 'male'}
      heightCm={heightCm}
      measurements={measurements}
      skinToneId={skinToneId}
      pose={pose}
      outfit={outfit}
      accentColor={colour || '#dfc17b'}
      active={true}
    />
  )
}
