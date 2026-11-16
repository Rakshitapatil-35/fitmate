const field = (key, label, instruction, options = {}) => ({
  key,
  label,
  instruction,
  minCm: options.minCm ?? 20,
  maxCm: options.maxCm ?? 250,
  optional: options.optional ?? false,
  isGarmentPreference: options.isGarmentPreference ?? false,
})

const bust = field('chest', 'Bust', 'Measure around the fullest part of the bust, keeping the tape level.')
const chest = field('chest', 'Chest', 'Measure around the fullest part of the chest, keeping the tape level.')
const waist = field('waist', 'Waist', 'Measure around the natural waist without pulling the tape tight.')
const hips = field('hip', 'Hips', 'Measure around the fullest part of the hips and seat.')
const shoulder = field('shoulder', 'Shoulder', 'Measure across the back between the shoulder points.')
const sleeve = field('sleeveLength', 'Sleeve length', 'Measure from the shoulder point to the preferred sleeve end.', { maxCm: 120 })
const armhole = field('armhole', 'Armhole', 'Measure around the shoulder joint where the sleeve joins the bodice.')
const inseam = field('inseam', 'Inseam', 'Measure from the crotch point to the ankle or desired hem.', { maxCm: 180 })
const thigh = field('thigh', 'Thigh', 'Measure around the fullest part of the upper thigh, just below the crotch.', { minCm: 30, maxCm: 110, optional: true })
const torso = field('torsoLength', 'Torso length', 'Measure vertically from high shoulder point beside the neck down to the natural waistline.', { minCm: 30, maxCm: 90, optional: true })

export const measurementProfiles = [
  {
    id: 'women-full-body', audience: 'Women', garmentType: 'Complete 3D Body Profile (All 8 Guides)', category: 'All Categories',
    productTypes: ['All garments'],
    fields: [bust, waist, hips, shoulder, sleeve, inseam, thigh, torso],
  },
  {
    id: 'men-full-body', audience: 'Men', garmentType: 'Complete 3D Body Profile (All 8 Guides)', category: 'All Categories',
    productTypes: ['All garments'],
    fields: [chest, waist, hips, shoulder, sleeve, inseam, thigh, torso],
  },
  {
    id: 'women-saree-blouse', audience: 'Women', garmentType: 'Saree blouse', category: 'Traditional wear',
    productTypes: ['Blouses'],
    fields: [bust, field('underbust', 'Underbust', 'Measure around the ribcage directly below the bust; useful for fitted or structured blouse styles.', { optional: true }), shoulder, armhole, sleeve, field('blouseLength', 'Blouse length', 'Measure from the shoulder beside the neck, over the bust, to the desired blouse hem.', { maxCm: 100 }), waist],
  },
  {
    id: 'women-lehenga', audience: 'Women', garmentType: 'Lehenga choli', category: 'Traditional wear',
    productTypes: ['Lehenga choli'],
    fields: [waist, hips, field('lehengaLength', 'Lehenga length', 'Measure from the waistline where the lehenga will sit down to the desired skirt hem.', { maxCm: 180 }), field('skirtCircumference', 'Preferred skirt circumference', 'Optional garment preference: measure around the skirt hem or note a desired sweep. This is not a body measurement.', { minCm: 100, maxCm: 1200, optional: true, isGarmentPreference: true })],
  },
  {
    id: 'women-kurti', audience: 'Women', garmentType: 'Kurti', category: 'Traditional wear',
    productTypes: ['Straight-cut kurtas', 'A-line kurtas', 'Kurti sets'],
    fields: [bust, waist, hips, shoulder, sleeve, field('kurtiLength', 'Garment length', 'Measure from the shoulder beside the neck to the desired kurti hem.', { maxCm: 180 })],
  },
  {
    id: 'women-salwar', audience: 'Women', garmentType: 'Salwar suit', category: 'Traditional wear',
    productTypes: ['Salwar kameez', 'Churidar suits', 'Anarkali suits', 'Sharara sets', 'Gharara sets', 'Palazzo suits', 'Patiala suits', 'Indo-western outfits', 'Ethnic co-ord sets'],
    fields: [bust, waist, hips, shoulder, sleeve, inseam, field('kameezLength', 'Garment length', 'Measure from the shoulder beside the neck to the desired top hem.', { maxCm: 180 })],
  },
  {
    id: 'women-gown', audience: 'Women', garmentType: 'Gown', category: 'Traditional wear',
    productTypes: ['Gowns'],
    fields: [bust, waist, hips, shoulder, field('gownLength', 'Gown length', 'Measure from the shoulder beside the neck to the desired hem.', { maxCm: 220 })],
  },
  {
    id: 'women-saree-drape', audience: 'Women', garmentType: 'Saree drape', category: 'Traditional wear',
    productTypes: ['Sarees'],
    fields: [],
    note: 'An unstitched saree is typically chosen by drape length rather than body measurements. A stitched or bundled blouse has a separate profile.',
  },
  {
    id: 'men-kurta', audience: 'Men', garmentType: 'Kurta', category: 'Traditional wear',
    productTypes: ['Kurta'],
    fields: [chest, waist, shoulder, sleeve, field('kurtaLength', 'Kurta length', 'Measure from the shoulder beside the neck to the desired hem.', { maxCm: 180 })],
  },
  {
    id: 'men-kurta-pajama', audience: 'Men', garmentType: 'Kurta pajama set', category: 'Traditional wear',
    productTypes: ['Kurta pajama sets', 'Pathani suits', 'Indo-western sets'],
    fields: [chest, waist, hips, shoulder, sleeve, field('kurtaLength', 'Kurta length', 'Measure from the shoulder beside the neck to the desired hem.', { maxCm: 180 }), inseam, field('pajamaLength', 'Pajama length', 'Measure from the waist to the ankle or preferred hem.', { maxCm: 180 })],
  },
  {
    id: 'men-sherwani', audience: 'Men', garmentType: 'Sherwani or bandhgala', category: 'Traditional wear',
    productTypes: ['Sherwani', 'Bandhgala suits'],
    fields: [chest, waist, shoulder, sleeve, field('torsoLength', 'Torso length', 'Measure from the shoulder beside the neck to the desired jacket hem.', { maxCm: 180 }), field('hip', 'Hip', 'Measure around the fullest part of the hips; used when the cut extends over the hip.', { optional: true })],
  },
  {
    id: 'men-dhoti-pajama', audience: 'Men', garmentType: 'Dhoti or pajama', category: 'Traditional wear',
    productTypes: ['Dhoti sets'],
    fields: [waist, hips, inseam, field('dhotiLength', 'Dhoti or pajama length', 'For pajama, measure from the waist to the desired hem. For dhoti, measure the preferred drape length.', { maxCm: 220 })],
  },
  {
    id: 'men-nehru-jacket', audience: 'Men', garmentType: 'Nehru jacket or waistcoat', category: 'Traditional wear',
    productTypes: ['Nehru jackets', 'Ethnic jackets', 'Traditional waistcoats'],
    fields: [chest, shoulder, waist, field('jacketLength', 'Jacket length', 'Measure from the shoulder beside the neck to the desired jacket hem.', { maxCm: 150 })],
  },
  {
    id: 'women-western-top', audience: 'Women', garmentType: 'Western tops', category: 'Tops',
    productTypes: ['T-shirt', 'Shirt'],
    fields: [bust, waist, shoulder, sleeve, field('westernTopLength', 'Top length', 'Measure from the shoulder beside the neck to the desired hem.', { maxCm: 150 })],
  },
  {
    id: 'women-western-bottom', audience: 'Women', garmentType: 'Western bottoms', category: 'Bottoms',
    productTypes: ['Jeans', 'Trousers', 'Skirt'],
    fields: [waist, hips, inseam, thigh],
  },
  {
    id: 'women-western-dress', audience: 'Women', garmentType: 'Western dresses', category: 'Dresses',
    productTypes: ['Dress'],
    fields: [bust, waist, hips, shoulder, sleeve, torso, field('dressLength', 'Dress length', 'Measure from the shoulder beside the neck to the desired hem.', { maxCm: 220 })],
  },
  {
    id: 'men-western-top', audience: 'Men', garmentType: 'Western tops', category: 'Tops',
    productTypes: ['T-shirt', 'Shirt'],
    fields: [chest, waist, shoulder, sleeve, torso, field('westernTopLength', 'Top length', 'Measure from the shoulder beside the neck to the desired hem.', { maxCm: 150 })],
  },
  {
    id: 'men-western-bottom', audience: 'Men', garmentType: 'Western bottoms', category: 'Bottoms',
    productTypes: ['Jeans', 'Trousers'],
    fields: [waist, hips, inseam, thigh],
  },
]

export function getMeasurementProfile(audience, category, clothingType) {
  return measurementProfiles.find((profile) => (
    profile.audience === audience
    && profile.category === category
    && (category === 'Traditional wear' ? profile.productTypes.includes(clothingType) : true)
    && (category !== 'Traditional wear' || profile.productTypes.includes(clothingType))
  )) ?? null
}
