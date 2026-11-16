import { traditionalWearCategories } from './traditionalWearData.js'

export const demoProfile = {
  name: 'Alex Morgan',
  initials: 'AM',
  email: 'alex.morgan@example.com',
  measurements: {
    chest: 96,
    waist: 81,
    hip: 99,
    shoulder: 43,
    inseam: 76,
  },
}

const baseDemoBrands = [
  {
    id: 'atelier-morrow',
    name: 'Atelier Morrow',
    products: [
      { audience: 'Women', category: 'Tops', type: 'T-shirt', name: 'Everyday cotton tee' },
      { audience: 'Women', category: 'Tops', type: 'Shirt', name: 'Relaxed poplin shirt' },
      { audience: 'Women', category: 'Bottoms', type: 'Jeans', name: 'Straight denim jean' },
      { audience: 'Women', category: 'Bottoms', type: 'Trousers', name: 'Soft tailoring trouser' },
      { audience: 'Women', category: 'Dresses', type: 'Dress', name: 'Weekend shirt dress' },
      { audience: 'Men', category: 'Tops', type: 'T-shirt', name: 'Everyday cotton tee' },
      { audience: 'Men', category: 'Tops', type: 'Shirt', name: 'Relaxed poplin shirt' },
      { audience: 'Men', category: 'Bottoms', type: 'Jeans', name: 'Straight denim jean' },
      { audience: 'Men', category: 'Bottoms', type: 'Trousers', name: 'Soft tailoring trouser' },
    ],
    sizeChart: [
      { size: 'XS', chest: 82, waist: 64, hip: 88 },
      { size: 'S', chest: 88, waist: 70, hip: 94 },
      { size: 'M', chest: 94, waist: 76, hip: 100 },
      { size: 'L', chest: 100, waist: 82, hip: 106 },
      { size: 'XL', chest: 106, waist: 88, hip: 112 },
    ],
  },
  {
    id: 'northline-studio',
    name: 'Northline Studio',
    products: [
      { audience: 'Women', category: 'Tops', type: 'T-shirt', name: 'Studio rib tee' },
      { audience: 'Women', category: 'Tops', type: 'Shirt', name: 'Boxy linen shirt' },
      { audience: 'Women', category: 'Bottoms', type: 'Jeans', name: 'Low-stretch straight jean' },
      { audience: 'Women', category: 'Bottoms', type: 'Trousers', name: 'Everyday pleat trouser' },
      { audience: 'Women', category: 'Dresses', type: 'Dress', name: 'Easy column dress' },
      { audience: 'Men', category: 'Tops', type: 'T-shirt', name: 'Studio rib tee' },
      { audience: 'Men', category: 'Tops', type: 'Shirt', name: 'Boxy linen shirt' },
      { audience: 'Men', category: 'Bottoms', type: 'Jeans', name: 'Low-stretch straight jean' },
      { audience: 'Men', category: 'Bottoms', type: 'Trousers', name: 'Everyday pleat trouser' },
    ],
    sizeChart: [
      { size: 'XS', chest: 84, waist: 66, hip: 90 },
      { size: 'S', chest: 90, waist: 72, hip: 96 },
      { size: 'M', chest: 96, waist: 78, hip: 102 },
      { size: 'L', chest: 102, waist: 84, hip: 108 },
      { size: 'XL', chest: 108, waist: 90, hip: 114 },
    ],
  },
  {
    id: 'common-thread',
    name: 'Common Thread',
    products: [
      { audience: 'Women', category: 'Tops', type: 'T-shirt', name: 'Essential jersey tee' },
      { audience: 'Women', category: 'Tops', type: 'Shirt', name: 'Sunday cotton shirt' },
      { audience: 'Women', category: 'Bottoms', type: 'Jeans', name: 'Classic five-pocket jean' },
      { audience: 'Women', category: 'Bottoms', type: 'Trousers', name: 'Drawn-in waist trouser' },
      { audience: 'Women', category: 'Bottoms', type: 'Skirt', name: 'Clean line midi skirt' },
      { audience: 'Women', category: 'Dresses', type: 'Dress', name: 'Day-to-evening dress' },
      { audience: 'Men', category: 'Tops', type: 'T-shirt', name: 'Essential jersey tee' },
      { audience: 'Men', category: 'Tops', type: 'Shirt', name: 'Sunday cotton shirt' },
      { audience: 'Men', category: 'Bottoms', type: 'Jeans', name: 'Classic five-pocket jean' },
      { audience: 'Men', category: 'Bottoms', type: 'Trousers', name: 'Drawn-in waist trouser' },
    ],
    sizeChart: [
      { size: 'XS', chest: 80, waist: 62, hip: 86 },
      { size: 'S', chest: 86, waist: 68, hip: 92 },
      { size: 'M', chest: 92, waist: 74, hip: 98 },
      { size: 'L', chest: 98, waist: 80, hip: 104 },
      { size: 'XL', chest: 104, waist: 86, hip: 110 },
    ],
  },
]

export const demoBrands = baseDemoBrands.map((brand) => ({
  ...brand,
  products: [
    ...brand.products,
    ...['Women', 'Men'].flatMap((audience) => [
      { audience, category: 'Tops', type: 'Blazer', name: `${brand.name.split(' ')[0]} tailored blazer` },
      { audience, category: 'Tops', type: 'Jacket', name: `${brand.name.split(' ')[0]} everyday jacket` },
      { audience, category: 'Tops', type: 'Co-ord set', name: `${brand.name.split(' ')[0]} matching co-ord set` },
    ]),
    ...traditionalWearCategories.map((item) => ({
      audience: item.audience,
      category: 'Traditional wear',
      type: item.name,
      name: `${brand.name.split(' ')[0]} ${item.productName}`,
      chartModel: item.chartModel,
      categoryId: item.id,
    })),
  ],
}))

const fitPreferenceOffsets = { Slim: -1, Regular: 0, Relaxed: 1, Oversized: 1 }

const traditionalChartModels = {
  blouse: { metrics: ['chest', 'waist', 'shoulder'], weights: { chest: 0.5, waist: 0.3, shoulder: 0.2 } },
  'lehenga-set': { metrics: ['chest', 'waist', 'hip'], weights: { chest: 0.3, waist: 0.35, hip: 0.35 } },
  anarkali: { metrics: ['chest', 'waist', 'hip'], weights: { chest: 0.45, waist: 0.3, hip: 0.25 } },
  'salwar-set': { metrics: ['chest', 'waist', 'hip'], weights: { chest: 0.4, waist: 0.3, hip: 0.3 } },
  'churidar-set': { metrics: ['chest', 'waist', 'hip', 'inseam'], weights: { chest: 0.25, waist: 0.25, hip: 0.25, inseam: 0.25 } },
  'straight-kurta': { metrics: ['chest', 'waist', 'shoulder'], weights: { chest: 0.55, waist: 0.25, shoulder: 0.2 } },
  'a-line-kurta': { metrics: ['chest', 'waist', 'hip'], weights: { chest: 0.4, waist: 0.25, hip: 0.35 } },
  'kurti-set': { metrics: ['chest', 'waist', 'hip'], weights: { chest: 0.4, waist: 0.3, hip: 0.3 } },
  'sharara-set': { metrics: ['chest', 'waist', 'hip', 'inseam'], weights: { chest: 0.2, waist: 0.3, hip: 0.3, inseam: 0.2 } },
  'gharara-set': { metrics: ['chest', 'waist', 'hip', 'inseam'], weights: { chest: 0.2, waist: 0.3, hip: 0.3, inseam: 0.2 } },
  'palazzo-set': { metrics: ['chest', 'waist', 'hip', 'inseam'], weights: { chest: 0.2, waist: 0.3, hip: 0.25, inseam: 0.25 } },
  'patiala-set': { metrics: ['chest', 'waist', 'hip', 'inseam'], weights: { chest: 0.2, waist: 0.3, hip: 0.3, inseam: 0.2 } },
  'indo-western': { metrics: ['chest', 'waist', 'hip'], weights: { chest: 0.35, waist: 0.35, hip: 0.3 } },
  gown: { metrics: ['chest', 'waist', 'hip'], weights: { chest: 0.35, waist: 0.35, hip: 0.3 } },
  'ethnic-coord': { metrics: ['chest', 'waist', 'hip'], weights: { chest: 0.3, waist: 0.35, hip: 0.35 } },
  'men-kurta': { metrics: ['chest', 'waist', 'shoulder'], weights: { chest: 0.5, waist: 0.25, shoulder: 0.25 } },
  'kurta-pajama': { metrics: ['chest', 'waist', 'inseam'], weights: { chest: 0.4, waist: 0.35, inseam: 0.25 } },
  sherwani: { metrics: ['chest', 'waist', 'shoulder'], weights: { chest: 0.4, waist: 0.3, shoulder: 0.3 } },
  'nehru-jacket': { metrics: ['chest', 'shoulder'], weights: { chest: 0.6, shoulder: 0.4 } },
  bandhgala: { metrics: ['chest', 'waist', 'shoulder'], weights: { chest: 0.4, waist: 0.3, shoulder: 0.3 } },
  'dhoti-set': { metrics: ['chest', 'waist'], weights: { chest: 0.55, waist: 0.45 } },
  'pathani-set': { metrics: ['chest', 'waist', 'hip', 'inseam'], weights: { chest: 0.3, waist: 0.25, hip: 0.25, inseam: 0.2 } },
  'indo-western-men': { metrics: ['chest', 'waist', 'shoulder'], weights: { chest: 0.4, waist: 0.3, shoulder: 0.3 } },
  'ethnic-jacket': { metrics: ['chest', 'shoulder'], weights: { chest: 0.6, shoulder: 0.4 } },
  waistcoat: { metrics: ['chest', 'shoulder'], weights: { chest: 0.6, shoulder: 0.4 } },
}

export function getTraditionalDemoChart(brand, productType) {
  const category = traditionalWearCategories.find((item) => item.name === productType)
  if (!category) return null
  if (category.chartModel === 'saree-drape') {
    return {
      model: category.chartModel,
      metrics: [],
      weights: {},
      rows: [{ size: 'Free', drapeLengthCm: 550, blousePiece: 'Unstitched; sized separately' }],
    }
  }

  const model = traditionalChartModels[category.chartModel]
  if (!model) return null
  const brandIndex = baseDemoBrands.findIndex((item) => item.id === brand.id)
  const sizeRows = brand.sizeChart.map((row, index) => {
    const adjusted = { size: row.size }
    for (const metric of model.metrics) {
      if (metric === 'shoulder') adjusted[metric] = 34 + index * 2 + brandIndex
      else if (metric === 'inseam') adjusted[metric] = 69 + index * 3 + brandIndex
      else adjusted[metric] = row[metric]
    }
    return adjusted
  })

  return { model: category.chartModel, metrics: model.metrics, weights: model.weights, rows: sizeRows }
}

export function calculateDemoRecommendation({ brand, category, fitPreference, measurements, productType }) {
  const traditionalChart = category === 'Traditional wear' ? getTraditionalDemoChart(brand, productType) : null

  if (traditionalChart?.model === 'saree-drape') {
    return {
      size: 'Free',
      closestSize: 'Free',
      fitPreference,
      alternative: null,
      alternativeReason: 'Saree drape length is shown separately; a stitched or bundled blouse has its own sizing requirements.',
      weightedDistance: null,
      confidence: null,
      comparison: [],
      metrics: [],
      chartRows: traditionalChart.rows,
      chartModel: traditionalChart.model,
      preferenceShifted: false,
    }
  }

  const chartRows = traditionalChart?.rows ?? brand.sizeChart
  const metricWeights = traditionalChart?.weights ?? (category === 'Bottoms'
    ? { waist: 0.6, hip: 0.4 }
    : category === 'Dresses'
      ? { chest: 0.4, waist: 0.3, hip: 0.3 }
      : { chest: 0.7, waist: 0.3 })

  const scoredSizes = chartRows.map((row) => {
    const weightedDistance = Object.entries(metricWeights).reduce((total, [metric, weight]) => (
      total + (Math.abs(measurements[metric] - row[metric]) / Math.max(1, chartRows[1][metric] - chartRows[0][metric])) * weight
    ), 0)
    return { ...row, weightedDistance }
  })

  const closestRow = scoredSizes.reduce((closest, row) => (
    row.weightedDistance < closest.weightedDistance ? row : closest
  ))
  const closestIndex = chartRows.findIndex((row) => row.size === closestRow.size)
  const fitOffset = fitPreferenceOffsets[fitPreference]
  const recommendedIndex = Math.max(0, Math.min(chartRows.length - 1, closestIndex + fitOffset))
  const recommended = scoredSizes[recommendedIndex]
  const preferredAlternativeIndex = ['Slim', 'Regular'].includes(fitPreference)
    ? recommendedIndex + 1
    : recommendedIndex - 1
  const alternativeIndex = preferredAlternativeIndex >= 0 && preferredAlternativeIndex < chartRows.length
    ? preferredAlternativeIndex
    : recommendedIndex > 0 ? recommendedIndex - 1 : recommendedIndex + 1
  const alternative = chartRows[alternativeIndex]
  const alternativeDirection = alternativeIndex > recommendedIndex ? 'up' : 'down'
  const comparison = Object.keys(metricWeights).map((metric) => ({
    metric,
    bodyValue: measurements[metric],
    chartValue: recommended[metric],
    difference: Number(Math.abs(measurements[metric] - recommended[metric]).toFixed(1)),
  }))

  return {
    size: recommended.size,
    closestSize: closestRow.size,
    fitPreference,
    alternative: alternative.size,
    alternativeReason: alternativeDirection === 'up'
      ? 'Consider this size up if you prefer more room, especially in a firm, low-stretch fabric.'
      : 'Consider this size down if the garment already has a generous cut or you prefer a closer silhouette.',
    weightedDistance: recommended.weightedDistance,
    confidence: Math.max(0, Math.round(100 - recommended.weightedDistance * 28)),
    comparison,
    metrics: Object.keys(metricWeights),
    chartRows,
    chartModel: traditionalChart?.model ?? 'western-standard',
    preferenceShifted: closestRow.size !== recommended.size,
  }
}
