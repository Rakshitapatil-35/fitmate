import { Color, DataTexture, DoubleSide, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat, SRGBColorSpace, UnsignedByteType } from 'three'

// Values describe a plausible starting surface response. They are not laboratory-measured textile data.
export const fabricPresets = [
  { id: 'silk', label: 'Silk', color: '#b58a55', roughness: 0.3, metalness: 0.02, sheen: 0.48, sheenRoughness: 0.34, clearcoat: 0.08, transmission: 0, opacity: 1, weave: 'plain', bumpScale: 0.018, note: 'Fine continuous filament · soft directional sheen' },
  { id: 'banarasi-silk', label: 'Banarasi silk', color: '#9b2438', roughness: 0.29, metalness: 0.17, sheen: 0.5, sheenRoughness: 0.3, clearcoat: 0.1, transmission: 0, opacity: 1, weave: 'brocade', bumpScale: 0.03, note: 'Brocade preset · metallic response is a material approximation' },
  { id: 'kanjivaram-silk', label: 'Kanjivaram silk', color: '#983a40', roughness: 0.31, metalness: 0.12, sheen: 0.46, sheenRoughness: 0.32, clearcoat: 0.08, transmission: 0, opacity: 1, weave: 'heavy-silk', bumpScale: 0.027, note: 'Heavier silk weave · zari remains a separate sourced detail map' },
  { id: 'mysore-silk', label: 'Mysore silk', color: '#c0a16c', roughness: 0.24, metalness: 0.025, sheen: 0.55, sheenRoughness: 0.25, clearcoat: 0.14, transmission: 0, opacity: 1, weave: 'fine-silk', bumpScale: 0.012, note: 'Fine weave · smooth, restrained lustre' },
  { id: 'cotton', label: 'Cotton', color: '#c6b9a1', roughness: 0.84, metalness: 0, sheen: 0.04, sheenRoughness: 0.9, clearcoat: 0, transmission: 0, opacity: 1, weave: 'plain', bumpScale: 0.03, note: 'Matte spun yarn · visible fine weave' },
  { id: 'linen', label: 'Linen', color: '#c0b39b', roughness: 0.9, metalness: 0, sheen: 0.03, sheenRoughness: 0.95, clearcoat: 0, transmission: 0, opacity: 1, weave: 'slub', bumpScale: 0.055, note: 'Dry hand · irregular slub weave' },
  { id: 'velvet', label: 'Velvet', color: '#522637', roughness: 0.79, metalness: 0, sheen: 0.82, sheenRoughness: 0.74, clearcoat: 0.02, transmission: 0, opacity: 1, weave: 'pile', bumpScale: 0.045, note: 'Soft pile sheen · requires pile direction in authored asset maps' },
  { id: 'georgette', label: 'Georgette', color: '#b47b61', roughness: 0.58, metalness: 0, sheen: 0.28, sheenRoughness: 0.6, clearcoat: 0, transmission: 0.04, opacity: 0.96, weave: 'crepe', bumpScale: 0.028, note: 'Crepe surface · subtle light transmission' },
  { id: 'chiffon', label: 'Chiffon', color: '#d2b6a1', roughness: 0.55, metalness: 0, sheen: 0.24, sheenRoughness: 0.64, clearcoat: 0, transmission: 0.18, opacity: 0.84, weave: 'open-plain', bumpScale: 0.009, note: 'Lightweight transparent preset · needs layered fabric geometry' },
  { id: 'organza', label: 'Organza', color: '#d8c7ad', roughness: 0.4, metalness: 0, sheen: 0.35, sheenRoughness: 0.42, clearcoat: 0.08, transmission: 0.15, opacity: 0.82, weave: 'open-plain', bumpScale: 0.014, note: 'Crisp sheer preset · transparency depends on mesh layering and lighting' },
  { id: 'net', label: 'Net', color: '#d1bfaa', roughness: 0.5, metalness: 0, sheen: 0.18, sheenRoughness: 0.68, clearcoat: 0, transmission: 0.24, opacity: 0.78, weave: 'mesh', bumpScale: 0.022, note: 'Open mesh response · geometry must contain real openwork' },
  { id: 'satin', label: 'Satin', color: '#9b6659', roughness: 0.18, metalness: 0.025, sheen: 0.68, sheenRoughness: 0.23, clearcoat: 0.26, transmission: 0, opacity: 1, weave: 'satin', bumpScale: 0.008, note: 'Smooth specular response · cut and drape come from the garment model' },
  { id: 'denim', label: 'Denim', color: '#344f68', roughness: 0.82, metalness: 0, sheen: 0.06, sheenRoughness: 0.9, clearcoat: 0, transmission: 0, opacity: 1, weave: 'twill', bumpScale: 0.052, note: 'Twill weave preset · seams, wash and abrasion need authored maps' },
  { id: 'wool', label: 'Wool', color: '#55504a', roughness: 0.8, metalness: 0, sheen: 0.08, sheenRoughness: 0.86, clearcoat: 0, transmission: 0, opacity: 1, weave: 'wool', bumpScale: 0.04, note: 'Soft matte response · nap and yarn detail require authored maps' },
  { id: 'embroidered-fabric', label: 'Embroidered fabric', color: '#867050', roughness: 0.53, metalness: 0.04, sheen: 0.31, sheenRoughness: 0.48, clearcoat: 0.06, transmission: 0, opacity: 1, weave: 'embroidered-base', bumpScale: 0.026, note: 'Base cloth only · embroidery and sequins require a distinct detail mesh or licensed maps' },
  { id: 'zari-gold', label: 'Zari Brocade', color: '#d4af37', roughness: 0.22, metalness: 0.88, sheen: 0.85, sheenRoughness: 0.2, clearcoat: 0.35, transmission: 0, opacity: 1, weave: 'brocade', bumpScale: 0.04, note: 'Metallic gold-wrapped thread weave · luminous royal reflection' },
  { id: 'zardozi-velvet', label: 'Zardozi Velvet', color: '#4a1525', roughness: 0.65, metalness: 0.35, sheen: 0.95, sheenRoughness: 0.4, clearcoat: 0.15, transmission: 0, opacity: 1, weave: 'pile', bumpScale: 0.05, note: 'Deep royal velvet ground with raised metallic zardozi embroidery' },
  { id: 'chikankari-cotton', label: 'Chikankari Fine Cotton', color: '#f7f4ed', roughness: 0.78, metalness: 0.01, sheen: 0.12, sheenRoughness: 0.8, clearcoat: 0, transmission: 0.05, opacity: 0.95, weave: 'plain', bumpScale: 0.035, note: 'Fine Lucknowi shadow-work embroidery on sheer spun cotton' },
  { id: 'bandhani-silk', label: 'Bandhani Silk', color: '#c0263f', roughness: 0.32, metalness: 0.08, sheen: 0.65, sheenRoughness: 0.28, clearcoat: 0.12, transmission: 0, opacity: 1, weave: 'fine-silk', bumpScale: 0.022, note: 'Vibrant resist-dyed silk with dotted circular tie-dye field' },
  { id: 'mirror-work-georgette', label: 'Mirror Work Georgette', color: '#93335b', roughness: 0.42, metalness: 0.45, sheen: 0.55, sheenRoughness: 0.35, clearcoat: 0.4, transmission: 0.08, opacity: 0.94, weave: 'crepe', bumpScale: 0.038, note: 'Flowing crepe with reflective shisha mirror-embellished highlights' },
  { id: 'brocade-royal', label: 'Royal Brocade Silk', color: '#851b2a', roughness: 0.25, metalness: 0.52, sheen: 0.72, sheenRoughness: 0.22, clearcoat: 0.25, transmission: 0, opacity: 1, weave: 'brocade', bumpScale: 0.045, note: 'Heavy supplementary-weft silk featuring raised floral jaal in gold thread' },
  { id: 'leather', label: 'Full-Grain Calfskin Leather', color: '#241b16', roughness: 0.38, metalness: 0.06, sheen: 0.24, sheenRoughness: 0.42, clearcoat: 0.38, transmission: 0, opacity: 1, weave: 'grain', bumpScale: 0.035, note: 'Supple full-grain calfskin · micro-pebble grain with natural specular highlights' },
]

const textureCache = new Map()
const palette = new Map(fabricPresets.map((preset) => [preset.id, preset]))

function makeTexture(data, size, colorSpace = null) {
  const texture = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.generateMipmaps = true
  texture.magFilter = LinearFilter
  texture.minFilter = LinearMipmapLinearFilter
  texture.colorSpace = colorSpace ?? ''
  texture.needsUpdate = true
  return texture
}

export function createFabricTextureMaps(presetId) {
  if (textureCache.has(presetId)) return textureCache.get(presetId)
  const preset = palette.get(presetId) ?? palette.get('silk')
  const size = 128
  const color = new Uint8Array(size * size * 4)
  const normal = new Uint8Array(size * size * 4)
  const roughness = new Uint8Array(size * size * 4)
  const metalness = new Uint8Array(size * size * 4)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4
      const slub = preset.weave === 'slub' ? Math.sin((x * 0.17) + Math.sin(y * 0.11) * 5) : 0
      const pile = preset.weave === 'pile' ? Math.sin((x + y * 0.13) * 0.17) * 7 : 0
      const twill = ['twill', 'brocade', 'heavy-silk'].includes(preset.weave) ? Math.sin((x + y * 0.8) * 0.8) * 5 : Math.sin(x * 0.78) * 3
      const cross = Math.sin(y * 0.8 + (preset.weave === 'satin' ? 0.35 : 0)) * (preset.weave === 'satin' ? 2 : 4)
      const grain = Math.sin((x * 17 + y * 31) * 0.43) * 1.3
      const weave = Math.max(220, Math.min(255, Math.round(245 + twill + cross + grain + slub + pile)))
      color.set([weave, weave, weave, 255], index)

      const dx = Math.cos((x + y * 0.35) * 0.78) * 5 + slub
      const dy = Math.cos(y * 0.8) * 4
      normal.set([Math.max(0, Math.min(255, 128 - dx)), Math.max(0, Math.min(255, 128 - dy)), 252, 255], index)

      const rough = Math.max(220, Math.min(255, Math.round(247 + twill * 0.65 + cross * 0.5 + slub)))
      roughness.set([rough, rough, rough, 255], index)

      const metallicThread = preset.metalness > 0.05 && Math.abs(Math.sin((x + y * 0.8) * 0.8)) > 0.91 ? 230 : 18
      metalness.set([metallicThread, metallicThread, metallicThread, 255], index)
    }
  }

  const maps = {
    weaveColor: makeTexture(color, size, SRGBColorSpace),
    normal: makeTexture(normal, size),
    roughness: makeTexture(roughness, size),
    metalness: makeTexture(metalness, size),
  }
  textureCache.set(presetId, maps)
  return maps
}

export function getFabricPreset(presetId) {
  return palette.get(presetId) ?? palette.get('silk')
}

export function createFabricMaterial(presetId) {
  const preset = getFabricPreset(presetId)
  const maps = createFabricTextureMaps(preset.id)
  return {
    color: new Color(preset.color),
    map: maps.weaveColor,
    normalMap: maps.normal,
    roughnessMap: maps.roughness,
    metalnessMap: preset.metalness > 0.05 ? maps.metalness : null,
    roughness: preset.roughness,
    metalness: preset.metalness,
    sheen: preset.sheen,
    sheenRoughness: preset.sheenRoughness,
    clearcoat: preset.clearcoat,
    transmission: preset.transmission,
    opacity: preset.opacity,
    transparent: preset.opacity < 1,
    side: DoubleSide, // DoubleSide for the isolated swatch, not a substitute garment.
    depthWrite: preset.opacity >= 1,
    bumpScale: preset.bumpScale,
  }
}
