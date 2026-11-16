/**
 * FITMATE Intelligent Size Recommendation Engine
 *
 * Transparent, reusable frontend recommendation engine using sample brand size charts
 * and user body measurements.
 *
 * PRINCIPLES:
 * 1. Body measurements != Garment measurements (garment measurements include wearing ease).
 * 2. Fabric stretch and garment cut heavily influence required wearing ease.
 * 3. Never invent random confidence percentages; calculate honest data coverage and variance.
 * 4. Clearly handle missing measurements and brand grading variations.
 */

// Desired baseline wearing ease (in cm) for different garment categories and fit preferences
const categoryEaseMatrix = {
  Tops: {
    Slim: { chest: 3, waist: 3, hip: 3, shoulder: 0 },
    Regular: { chest: 6, waist: 5, hip: 5, shoulder: 1 },
    Relaxed: { chest: 10, waist: 8, hip: 8, shoulder: 2 },
    Oversized: { chest: 16, waist: 14, hip: 14, shoulder: 4 },
  },
  Bottoms: {
    Slim: { waist: 1.5, hip: 2.5, inseam: 0 },
    Regular: { waist: 3.5, hip: 5.5, inseam: 0 },
    Relaxed: { waist: 6.0, hip: 9.0, inseam: 0 },
    Oversized: { waist: 9.0, hip: 13.0, inseam: 0 },
  },
  Dresses: {
    Slim: { chest: 2.5, waist: 2.0, hip: 3.0, shoulder: 0 },
    Regular: { chest: 5.5, waist: 4.5, hip: 6.5, shoulder: 1 },
    Relaxed: { chest: 9.0, waist: 8.0, hip: 11.0, shoulder: 2 },
    Oversized: { chest: 15.0, waist: 13.0, hip: 16.0, shoulder: 3 },
  },
  'Traditional wear': {
    Slim: { chest: 3.5, waist: 3.0, hip: 4.0, shoulder: 0.5 },
    Regular: { chest: 7.0, waist: 5.5, hip: 7.5, shoulder: 1.5 },
    Relaxed: { chest: 11.0, waist: 9.0, hip: 12.0, shoulder: 2.5 },
    Oversized: { chest: 16.0, waist: 14.0, hip: 17.0, shoulder: 3.5 },
  },
}

// Fabric stretch allowance modifiers
const fabricStretchOffsets = {
  none: 0,       // Rigid denim, heavy brocade, structured wool (-0 cm stretch ease)
  low: -1.0,     // Poplin cotton, raw silk, linen (+1 cm natural give)
  medium: -2.5,  // Cotton jersey, stretch denim (2% elastane)
  high: -4.5,    // Ribbed knit, spandex blend
}

/**
 * Reusable intelligent recommendation function
 */
export function calculateIntelligentRecommendation({
  brand,
  category = 'Tops',
  clothingType = '',
  fitPreference = 'Regular',
  measurements = {},
  fabricStretch = 'low',
}) {
  if (!brand || !brand.sizeChart || brand.sizeChart.length === 0) {
    return {
      success: false,
      error: 'Brand size chart is currently unavailable.',
    }
  }

  const chartRows = brand.sizeChart
  const isTraditional = category === 'Traditional wear'
  const isBottoms = category === 'Bottoms'
  const isDresses = category === 'Dresses'

  // Determine relevant biometric metrics based on category
  const relevantMetrics = isBottoms
    ? ['waist', 'hip']
    : isDresses
      ? ['chest', 'waist', 'hip']
      : ['chest', 'waist']

  if (isTraditional && (clothingType.includes('kurta') || clothingType.includes('sherwani') || clothingType.includes('blouse'))) {
    relevantMetrics.push('shoulder')
  }

  // Check which metrics user has provided
  const availableMetrics = relevantMetrics.filter(
    (m) => Number.isFinite(Number(measurements[m])) && Number(measurements[m]) > 0
  )
  const missingMetrics = relevantMetrics.filter((m) => !availableMetrics.includes(m))

  if (availableMetrics.length === 0) {
    return {
      success: false,
      error: 'No relevant body measurements found. Please enter or save your measurements.',
      missingMetrics,
    }
  }

  // Weights for metric priority
  const weights = isBottoms
    ? { waist: 0.6, hip: 0.4 }
    : isDresses
      ? { chest: 0.45, waist: 0.35, hip: 0.20 }
      : { chest: 0.60, waist: 0.30, shoulder: 0.10 }

  const baseCategoryEase = categoryEaseMatrix[category]?.[fitPreference] ?? categoryEaseMatrix.Tops[fitPreference]
  const stretchOffset = fabricStretchOffsets[fabricStretch] ?? 0

  // Score each size in the chart
  const scoredSizes = chartRows.map((row, index) => {
    let totalScore = 0
    let totalWeight = 0

    availableMetrics.forEach((metric) => {
      const bodyVal = Number(measurements[metric])
      const garmentVal = Number(row[metric])
      if (Number.isFinite(garmentVal) && garmentVal > 0) {
        const actualEase = garmentVal - bodyVal
        const targetEase = (baseCategoryEase[metric] ?? 5) + stretchOffset
        const diff = Math.abs(actualEase - targetEase)
        const weight = weights[metric] ?? 0.3
        totalScore += diff * weight
        totalWeight += weight
      }
    })

    const normalizedDistance = totalWeight > 0 ? totalScore / totalWeight : 999
    return {
      ...row,
      index,
      distance: normalizedDistance,
    }
  })

  // Find closest size (before fit preference shift)
  const closestScored = scoredSizes.reduce((best, curr) => (curr.distance < best.distance ? curr : best))
  const closestIndex = closestScored.index

  // Apply Fit Preference shift offset (-1 for Slim, 0 for Regular, +1 for Relaxed/Oversized)
  const prefOffset = { Slim: -1, Regular: 0, Relaxed: 1, Oversized: 1 }[fitPreference] ?? 0
  const recommendedIndex = Math.max(0, Math.min(chartRows.length - 1, closestIndex + prefOffset))
  const recommended = chartRows[recommendedIndex]

  // Alternative Size calculation
  const altIndex = ['Slim', 'Regular'].includes(fitPreference)
    ? Math.min(chartRows.length - 1, recommendedIndex + 1)
    : Math.max(0, recommendedIndex - 1)
  const alternative = chartRows[altIndex]

  // Detailed Zone Breakdown (Tension & Ease)
  const zoneAnalysis = {}
  relevantMetrics.forEach((metric) => {
    const bodyVal = Number(measurements[metric])
    const garmentVal = Number(recommended[metric])

    if (Number.isFinite(bodyVal) && Number.isFinite(garmentVal)) {
      const ease = Number((garmentVal - bodyVal).toFixed(1))
      const target = Number(((baseCategoryEase[metric] ?? 5) + stretchOffset).toFixed(1))

      let status = 'comfortable'
      let note = 'Optimal tailored comfort and natural breathing ease'

      if (ease < 1.5) {
        status = 'tight'
        note = 'Snug fit with noticeable tension across fabric'
      } else if (ease > target + 5.0) {
        status = 'loose'
        note = 'Generous relaxed drape with ample movement room'
      }

      zoneAnalysis[metric] = {
        bodyVal,
        garmentVal,
        ease,
        targetEase: target,
        status,
        note,
      }
    }
  })

  // Honest Data-Grounded Match Quality
  let matchQuality = 'Good Match'
  const coverageRatio = availableMetrics.length / relevantMetrics.length
  if (coverageRatio === 1.0 && closestScored.distance < 2.5) {
    matchQuality = 'High Precision Match'
  } else if (coverageRatio < 0.7 || closestScored.distance > 5.0) {
    matchQuality = 'Approximate Match'
  }

  // Clear explanation generator
  let explanation = `Based on your ${availableMetrics.map((m) => `${m} (${measurements[m]}cm)`).join(', ')}, size ${recommended.size} provides the ideal balance with your ${fitPreference.toLowerCase()} fit preference.`
  if (recommended.size !== closestScored.size) {
    explanation += ` Your choice of ${fitPreference} fit adjusted the recommendation from size ${closestScored.size} to size ${recommended.size} to give you desired wearing ease.`
  }
  if (fabricStretch === 'none') {
    explanation += ' Because this fabric has minimal stretch, standard wearing ease was prioritized to ensure comfort when moving.'
  }

  let alternativeReason =
    altIndex > recommendedIndex
      ? `Consider size ${alternative.size} if you prefer extra breathing room or have broader shoulders.`
      : `Consider size ${alternative.size} if you prefer a sharper, closer-to-body silhouette.`

  return {
    success: true,
    recommendedSize: recommended.size,
    closestSize: closestScored.size,
    preferenceShifted: recommended.size !== closestScored.size,
    fitPreference,
    matchQuality,
    coverageRatio,
    availableMetrics,
    missingMetrics,
    zoneAnalysis,
    alternativeSize: alternative.size,
    alternativeReason,
    explanation,
    chartRows,
    brandName: brand.name,
  }
}
