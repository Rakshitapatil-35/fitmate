export const avatarGenders = [
  { id: 'female', label: 'Female avatar' },
  { id: 'male', label: 'Male avatar' },
]

export const SKIN_TONES = {
  alabaster: { id: 'alabaster', label: 'Fair Alabaster', color: '#f5dfd0', subColor: '#e8beab', roughness: 0.48 },
  warmSand: { id: 'warmSand', label: 'Warm Sand', color: '#e2c5a5', subColor: '#cf9f76', roughness: 0.46 },
  goldenOlive: { id: 'goldenOlive', label: 'Golden Olive', color: '#c49f76', subColor: '#a67b51', roughness: 0.44 },
  deepBronze: { id: 'deepBronze', label: 'Deep Bronze', color: '#885e3d', subColor: '#6c4323', roughness: 0.42 },
  richUmber: { id: 'richUmber', label: 'Rich Umber', color: '#4d3322', subColor: '#361f12', roughness: 0.40 },
}

export const bodyProfiles = [
  { id: 'slim', label: 'Slim' },
  { id: 'average', label: 'Average' },
  { id: 'athletic', label: 'Athletic' },
  { id: 'plus-size', label: 'Plus size' },
]

export const avatarPoses = [
  { id: 'relaxed', label: 'Relaxed stance' },
  { id: 'editorial', label: 'Editorial stance' },
  { id: 'walk', label: 'Walk cycle' },
]

export const avatarOutfits = [
  { id: 'ethnic', label: 'Indian couture', assetId: 'garmentSaree' },
  { id: 'festive', label: 'Festive edit', assetId: 'garmentLehenga' },
  { id: 'western', label: 'Western tailoring', assetId: 'garmentDress' },
  { id: 'menswear', label: 'Modern menswear', assetId: 'garmentMensKurta' },
]

export function getAvatarAssetId(gender, shape) {
  if (shape === 'average') return `${gender}Avatar`
  return `${gender}Avatar${shape.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join('')}`
}
