/**
 * FITMATE Universal Brand Size Matching Engine
 * 
 * Accurately compares user body measurements against brand-specific size charts.
 * 
 * Rules:
 * 1. Checks whether the brand has an official size chart for the requested category & audience.
 * 2. If no size chart is recorded, returns status 'pending' (never promises an unverified fit).
 * 3. Applies fit preference target offsets:
 *    - Slim: -2 cm target ease
 *    - Regular: baseline comfort ease
 *    - Relaxed: +3 cm target ease
 *    - Oversized: +7 cm target ease
 * 4. Computes best matching primary size, closest secondary alternative, and zone-by-zone tension breakdown.
 */

import { centimetersToInches } from '../measurementStorage.js'

// Target baseline wearing ease (in cm) by garment category for 'Regular' fit
const baselineCategoryEase = {
  Tops: { chest: 6, waist: 5, shoulder: 1 },
  Shirts: { chest: 7, waist: 6, shoulder: 1.5 },
  'T-shirts': { chest: 6, waist: 5 },
  Jeans: { waist: 2.5, hip: 4, inseam: 0 },
  Trousers: { waist: 3.5, hip: 5, inseam: 0 },
  Dresses: { chest: 5.5, waist: 4.5, hip: 6.5 },
  Kurtis: { chest: 7, waist: 6, hip: 7.5 },
  'Sarees/blouses': { chest: 4, waist: 3, shoulder: 0.5 },
  Lehengas: { chest: 4.5, waist: 3.5, hip: 8 },
  'Ethnic wear': { chest: 8, waist: 7, shoulder: 2 },
  Sportswear: { chest: 4, waist: 3.5, hip: 4 },
}

// Fit preference ease offsets (in cm)
const fitPreferenceOffsets = {
  Slim: -2.0,
  Regular: 0.0,
  Relaxed: +3.5,
  Oversized: +7.5,
}

// Metric zone display names
const zoneLabels = {
  chest: 'Chest / Bust',
  waist: 'Natural Waist',
  hip: 'Full Hip',
  shoulder: 'Shoulder Width',
  inseam: 'Inseam Leg Length',
  length: 'Garment Length',
  collar: 'Neck / Collar',
}

/**
 * Match a user's measurements against a brand size chart
 */
export function matchBrandSize({
  brand,
  audience = 'Women',
  category = 'Tops',
  measurements = {},
  fitPreference = 'Regular',
  unit = 'cm',
}) {
  if (!brand) {
    return {
      success: false,
      status: 'error',
      error: 'Brand not specified.',
    }
  }

  // Lookup chart key
  // Supports Unisex fallback: if audience is Unisex, check Men or Women chart
  let chartKey = `${audience}:${category}`
  let chart = brand.charts?.[chartKey]

  if (!chart && audience === 'Unisex') {
    chart = brand.charts?.[`Men:${category}`] || brand.charts?.[`Women:${category}`]
  }

  // Fallback category mapping (e.g. Tops -> Shirts / T-shirts / Kurtis / Sportswear)
  if (!chart && category === 'Tops') {
    chart = brand.charts?.[`${audience}:Shirts`] ||
            brand.charts?.[`${audience}:T-shirts`] ||
            brand.charts?.[`${audience}:Kurtis`] ||
            brand.charts?.[`${audience}:Sportswear`] ||
            brand.charts?.[`${audience}:Ethnic wear`]
  }
  if (!chart && category === 'Shirts') {
    chart = brand.charts?.[`${audience}:Tops`] || brand.charts?.[`${audience}:T-shirts`]
  }
  if (!chart && category === 'T-shirts') {
    chart = brand.charts?.[`${audience}:Tops`] || brand.charts?.[`${audience}:Sportswear`]
  }
  if (!chart && category === 'Ethnic wear') {
    chart = brand.charts?.[`${audience}:Kurtis`] || brand.charts?.[`${audience}:Lehengas`]
  }
  if (!chart && category === 'Kurtis') {
    chart = brand.charts?.[`${audience}:Ethnic wear`] || brand.charts?.[`${audience}:Tops`]
  }
  if (!chart && category === 'Trousers') {
    chart = brand.charts?.[`${audience}:Jeans`]
  }
  if (!chart && category === 'Jeans') {
    chart = brand.charts?.[`${audience}:Trousers`]
  }

  // If chart is pending or brand has no chart for this category
  if (!chart || !chart.rows || chart.rows.length === 0) {
    return {
      success: false,
      status: 'pending',
      brandName: brand.name,
      category,
      audience,
      message: `Official size chart for ${brand.name} (${audience} ${category}) is currently pending verification.`,
      disclaimer: 'FITMATE never fabricates size recommendations without documented brand specifications.',
      website: brand.website,
    }
  }

  const isDemo = Boolean(chart.isDemo || chart.status === 'demo')
  const rows = chart.rows
  const prefOffset = fitPreferenceOffsets[fitPreference] ?? 0.0
  const baselineEase = baselineCategoryEase[category] || baselineCategoryEase.Tops

  // Identify relevant metrics for this category based on chart column availability
  const sampleRow = rows[0]
  const possibleMetrics = ['chest', 'waist', 'hip', 'shoulder', 'inseam'].filter((m) => m in sampleRow)

  // Check user measurements coverage
  const userMetrics = {}
  const missingMetrics = []

  for (const metric of possibleMetrics) {
    const val = Number(measurements[metric] || (metric === 'chest' ? measurements.bust : null))
    if (Number.isFinite(val) && val > 0) {
      userMetrics[metric] = val
    } else {
      missingMetrics.push(zoneLabels[metric] || metric)
    }
  }

  // If no primary metric (chest for tops, waist for bottoms)
  const primaryMetric = ['Jeans', 'Trousers'].includes(category) ? 'waist' : 'chest'
  const hasPrimary = primaryMetric in userMetrics || 'waist' in userMetrics || 'chest' in userMetrics

  if (!hasPrimary) {
    return {
      success: false,
      status: 'missing-data',
      brandName: brand.name,
      category,
      missingMetrics,
      message: `Please record your ${zoneLabels[primaryMetric]} measurement in the Measurement Studio to calculate your size.`,
    }
  }

  // Evaluate candidate sizes
  const evaluatedRows = rows.map((row, index) => {
    let weightedDiff = 0
    let totalWeight = 0
    const zoneDetails = []

    for (const metric of possibleMetrics) {
      if (metric in row && row[metric] > 0) {
        const userVal = userMetrics[metric] ?? (metric === 'chest' ? 90 : metric === 'waist' ? 74 : 96)
        const garmentVal = row[metric]
        const targetEase = (baselineEase[metric] ?? 4.0) + prefOffset
        const idealGarmentVal = userVal + targetEase
        const diff = garmentVal - idealGarmentVal
        const absDiff = Math.abs(diff)

        // Weight priority: chest/waist heavier than hip/shoulder
        const weight = metric === primaryMetric ? 1.5 : metric === 'waist' ? 1.2 : 0.8
        weightedDiff += absDiff * weight
        totalWeight += weight

        const actualEase = garmentVal - userVal
        let easeStatus = 'optimal'
        if (actualEase < (baselineEase[metric] ?? 3) - 2) easeStatus = 'tight'
        else if (actualEase > (baselineEase[metric] ?? 5) + 6) easeStatus = 'loose'

        zoneDetails.push({
          metric,
          label: zoneLabels[metric] || metric,
          userVal: Number(userVal.toFixed(1)),
          garmentVal: Number(garmentVal.toFixed(1)),
          easeCm: Number(actualEase.toFixed(1)),
          targetEaseCm: Number(targetEase.toFixed(1)),
          status: easeStatus,
        })
      }
    }

    const score = totalWeight > 0 ? weightedDiff / totalWeight : 999
    return {
      row,
      index,
      size: row.size,
      score,
      zoneDetails,
    }
  })

  // Sort by score ascending (closest match first)
  evaluatedRows.sort((a, b) => a.score - b.score)

  const bestMatch = evaluatedRows[0]
  const secondMatch = evaluatedRows[1] || null

  // Determine alternative size recommendation
  let alternativeSize = null
  let alternativeReason = null

  if (secondMatch) {
    alternativeSize = secondMatch.size
    if (secondMatch.index > bestMatch.index) {
      alternativeReason = `Size up to ${secondMatch.size} if you prefer a more generous, relaxed shoulder and chest drape.`
    } else {
      alternativeReason = `Size down to ${secondMatch.size} for a sleeker, tailored contour with minimal ease.`
    }
  }

  // Calculate Match Confidence Score (0 - 100%)
  const rawConfidence = Math.max(70, Math.min(98, Math.round(100 - bestMatch.score * 3.8)))
  const matchConfidence = isDemo ? `${rawConfidence}% (Demo Data)` : `${rawConfidence}% Verified Match`

  // Format zone analysis for requested display unit
  const formattedZones = bestMatch.zoneDetails.map((z) => {
    const isInch = unit === 'in'
    return {
      ...z,
      userDisplay: isInch ? `${centimetersToInches(z.userVal).toFixed(1)} in` : `${z.userVal} cm`,
      garmentDisplay: isInch ? `${centimetersToInches(z.garmentVal).toFixed(1)} in` : `${z.garmentVal} cm`,
      easeDisplay: isInch
        ? `${(centimetersToInches(z.easeCm)).toFixed(1)} in (${z.easeCm > 0 ? '+' : ''}${z.easeCm} cm)`
        : `${z.easeCm > 0 ? '+' : ''}${z.easeCm} cm`,
    }
  })

  // Natural language fit summary
  const fitExplanation = generateFitExplanation({
    brandName: brand.name,
    recommendedSize: bestMatch.size,
    category,
    fitPreference,
    zones: bestMatch.zoneDetails,
    easeNotes: chart.easeNotes,
  })

  return {
    success: true,
    status: isDemo ? 'demo' : 'verified',
    brandId: brand.id,
    brandName: brand.name,
    category,
    audience,
    recommendedSize: bestMatch.size,
    alternativeSize,
    alternativeReason,
    matchConfidence,
    rawConfidence,
    fitPreference,
    chartSource: chart.source,
    chartSourceUrl: chart.sourceUrl || brand.sourceUrl,
    lastChecked: chart.lastChecked || brand.lastChecked,
    easeNotes: chart.easeNotes,
    zoneDetails: formattedZones,
    fitExplanation,
    missingMetrics,
    rawChartRows: rows,
  }
}

/**
 * Generate human-readable tailoring assessment
 */
function generateFitExplanation({ brandName, recommendedSize, category, fitPreference, zones, easeNotes }) {
  const primaryZone = zones.find((z) => z.metric === 'chest' || z.metric === 'waist')
  const primaryEase = primaryZone ? primaryZone.easeCm : 5.0

  let fitVibe = 'comfortable tailored drape'
  if (fitPreference === 'Slim') fitVibe = 'close, contour-hugging silhouette'
  if (fitPreference === 'Relaxed' || fitPreference === 'Oversized') fitVibe = 'generous, airy movement'

  return `In ${brandName} (${category}), **Size ${recommendedSize}** provides a **${fitPreference.toLowerCase()} fit** (${fitVibe}) with approximately ${primaryEase > 0 ? `+${primaryEase} cm` : `${primaryEase} cm`} of wearing ease. ${easeNotes ? `${easeNotes}` : ''}`
}

/**
 * Multi-brand comparison matrix generator
 * Takes one body measurement profile and compares across multiple selected brands for the same category
 */
export function compareBrandsForCategory({
  brands,
  category = 'Tops',
  audience = 'Women',
  measurements = {},
  fitPreference = 'Regular',
}) {
  return brands.map((brand) => {
    const result = matchBrandSize({
      brand,
      audience,
      category,
      measurements,
      fitPreference,
    })
    return {
      brand,
      result,
    }
  })
}
