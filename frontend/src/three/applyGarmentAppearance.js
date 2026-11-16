import { Color } from 'three'
import { createFabricTextureMaps, getFabricPreset } from './fabricMaterialLibrary.js'

function supportsMaterialName(slots, material, role) {
  return slots?.includes(material.name) || material.userData?.fitmateRole === role
}

export function applyGarmentAppearance(material, asset, { fabricId, colorVariantId, customColor } = {}) {
  const supportsFabric = Boolean(fabricId && asset.fabricVariants?.includes(fabricId) && supportsMaterialName(asset.fabricSlots, material, 'fabric'))
  const variant = asset.colorVariants?.find((item) => item.id === colorVariantId)
  const supportsColor = Boolean((variant || customColor) && supportsMaterialName(asset.colorSlots, material, 'garment-color'))

  if (supportsColor) {
    const color = variant?.hex ?? customColor
    if (color) material.color?.set(new Color(color))
  }

  if (supportsFabric) {
    const preset = getFabricPreset(fabricId)
    const maps = createFabricTextureMaps(fabricId)
    material.roughness = preset.roughness
    material.metalness = preset.metalness
    if ('sheen' in material) {
      material.sheen = preset.sheen
      material.sheenRoughness = preset.sheenRoughness
      material.clearcoat = preset.clearcoat
      material.transmission = preset.transmission
    }
    material.opacity = preset.opacity
    material.transparent = preset.opacity < 1
    material.depthWrite = preset.opacity >= 1
    material.map ??= maps.weaveColor
    material.normalMap ??= maps.normal
    material.roughnessMap ??= maps.roughness
    if (preset.metalness > 0.05) material.metalnessMap ??= maps.metalness
    material.bumpScale = preset.bumpScale
  }

  material.needsUpdate = true
  return { supportsFabric, supportsColor }
}

export function getGarmentAppearanceSupport(asset, fabricId, colorVariantId) {
  if (!asset) return { fabric: false, color: false }
  const fabric = Boolean(fabricId && asset.fabricVariants?.includes(fabricId) && asset.fabricSlots?.length)
  const color = Boolean(colorVariantId && asset.colorVariants?.some((variant) => variant.id === colorVariantId) && asset.colorSlots?.length)
  return { fabric, color }
}
