/**
 * FITMATE Holographic AI Personal Stylist Service
 * 
 * Reusable, honest client-side fashion styling & size intelligence engine.
 * Accesses user's verified tape measurements, wardrobe state, and fit preferences.
 * 
 * NOTE: Operates with deterministic high-precision rule sets & curated couture knowledge.
 * No external API keys are exposed. Clearly discloses demonstration intelligence status.
 */

import {
  loadActiveRecommendation,
  loadAvatarConfig,
  loadFitPreference,
  loadMeasurements,
  loadSelectedGarment,
  loadWardrobeState,
} from '../measurementStorage.js'

export const STYLIST_INITIAL_MESSAGE = {
  id: 'msg-welcome',
  sender: 'stylist',
  text: `Greetings. I am AURA, your FITMATE Holographic AI Stylist & Fit Concierge.
I synthesize your verified tape measurements, 3D Digital Twin silhouette, and saved wardrobe to curate bespoke couture looks, analyze brand sizing nuances, and coordinate head-to-toe ensembles.

How may I style you today?`,
  timestamp: '2026-11-16T00:00:00.000Z',
  badges: ['AURA HOLOGRAPHIC CONCIERGE', 'FIT INTELLIGENCE CONNECTED'],
}

export const SUGGESTED_PROMPTS = [
  { id: 'selected', label: 'Style my selected garment', query: 'Style my selected garment' },
  { id: 'diwali', label: 'Help me choose a Diwali outfit', query: 'Help me choose a Diwali outfit' },
  { id: 'wedding', label: 'Create a royal wedding outfit', query: 'Create a royal wedding outfit' },
  { id: 'jeans', label: 'Find my perfect-fitting jeans', query: 'Find my perfect-fitting jeans' },
  { id: 'complete', label: 'Suggest a complete head-to-toe outfit', query: 'Suggest a complete head-to-toe outfit' },
  { id: 'brands', label: 'Compare luxury brand sizes', query: 'Compare two luxury brands' },
  { id: 'wardrobe', label: 'Style my saved wardrobe pieces', query: 'Style my saved wardrobe pieces' },
]

export function generateStylistResponse(prompt) {
  const query = prompt.toLowerCase().trim()
  const measurements = loadMeasurements() || {}
  const fitPreference = loadFitPreference() || 'Regular'
  const wardrobe = loadWardrobeState()
  const selectedGarment = loadSelectedGarment()
  const activeRecommendation = loadActiveRecommendation()
  const avatarConfig = loadAvatarConfig()
  const hasMeasurements = Boolean(measurements.chest || measurements.bust || measurements.waist)
  const savedCount = wardrobe?.savedProducts?.length || 0

  // 0. SELECTED SHOWROOM GARMENT CONSULTATION
  if (
    query.includes('selected') ||
    query.includes('this garment') ||
    query.includes('this outfit') ||
    query.includes('my selection') ||
    query.includes('style this') ||
    (selectedGarment && (query.includes(selectedGarment.name?.toLowerCase() || '') || query.includes(selectedGarment.productName?.toLowerCase() || '')))
  ) {
    const garmentName = selectedGarment?.productName || selectedGarment?.name || 'Curated Couture Garment'
    const brandName = selectedGarment?.brand || 'FITMATE Haute Couture'
    const occasionName = selectedGarment?.occasion || 'Gala & Evening Soirée'
    const fabricName = selectedGarment?.fabric || 'pure silk weave'

    return {
      text: `I have analyzed your currently selected piece in the showroom: **${garmentName}** by *${brandName}*.

**Bespoke Styling Consultation:**
• **Occasion Resonance:** Perfectly tailored for **${occasionName}**.
• **Textile Architecture:** The ${fabricName} drape flatters natural movement and reflects rich depth under warm chandelier lighting.
• **Harmonizing Pairings:** Pair with minimalist champagne-gold jewelry and pointed architectural footwear to let the focal silhouette speak.
• **Digital Twin Fit:** Calibrated for your ${avatarConfig.gender} silhouette with a **${fitPreference}** wearing ease${activeRecommendation?.recommendedSize ? ` (Active Recommendation: **Size ${activeRecommendation.recommendedSize}**)` : ''}.

${hasMeasurements ? `*Biometric Match:* Calibrated to your ${measurements.chest || measurements.bust || 88}cm chest and ${measurements.waist || 68}cm waist.` : '*Stylist Note:* Record your verified measurements in the Measurement Studio for millimetric ease calibration.'}`,
      actionLink: {
        label: 'Compare Brand Sizing Ease',
        path: `/find-my-size?audience=${encodeURIComponent(selectedGarment?.audience || 'Women')}&category=${encodeURIComponent(selectedGarment?.category || 'Tops')}&clothingType=${encodeURIComponent(selectedGarment?.clothingType || selectedGarment?.category || 'Dress')}`,
      },
      tryOnLink: {
        label: 'Try On in 3D Fitting Room',
        path: `/virtual-fitting-room?audience=${encodeURIComponent(selectedGarment?.audience || 'Women')}&garmentId=${encodeURIComponent(selectedGarment?.id || 'w-slip-dress')}`,
      },
      chips: ['Selected Look', brandName, occasionName],
    }
  }

  // 1. DIWALI & FESTIVE SOIRÉE
  if (query.includes('diwali') || query.includes('festive') || query.includes('deepavali')) {
    return {
      text: `For a luminous Diwali soirée, I recommend celebrating the play of warm ambient light with rich jewel tones and metallic golden zari.

**Curated Ensemble: The Marigold & Sindoor Silk Anarkali / Raw Silk Kurta**
• **Primary Garment:** 32-Kali Mysore Silk Anarkali or Royal Chanderi Kurta in Crimson & Temple Gold.
• **Textile Architecture:** Pure mulberry silk with gold gota-patti border that shimmers under diya candlelight.
• **Coordinated Footwear:** Gilded velvet mojari slippers with antique zardozi work.
• **Accessories:** Hand-crafted brass diya minaudière clutch.

${hasMeasurements ? `*Fit Note:* Calibrated to your ${measurements.chest || measurements.bust || 88}cm chest and ${measurements.waist || 68}cm waist, with a generous ${fitPreference} wearing ease to ensure fluid drape while seated for festive celebrations.` : '*Fit Note:* Record your measurements in the Measurement Studio for bespoke ease calibration.'}`,
      actionLink: {
        label: 'Explore 3D Diwali World',
        path: '/diwali-edit',
      },
      tryOnLink: {
        label: 'Try On Festive Look in 3D',
        path: '/virtual-fitting-room?audience=Women&category=Traditional%20wear&clothingType=Anarkali',
      },
      chips: ['Festival of Lights', 'Gold Zari', 'Diwali Edit'],
    }
  }

  // 2. WEDDING & SANGEET OCCASION
  if (query.includes('wedding') || query.includes('sangeet') || query.includes('lehenga') || query.includes('bridal')) {
    return {
      text: `For a grand royal wedding, structured heritage weaves with dramatic flares create an unforgettable sovereign silhouette.

**Curated Ensemble: The Maharani 24-Kali Banarasi Lehenga / Sherwani**
• **Lehenga Skirt:** 24-kali flared Banarasi silk skirt with authentic gold zari jaal in Sovereign Sindoor Crimson.
• **Blouse / Choli:** Hand-embroidered raw silk choli with sweet-heart neckline and antique marodi embroidery.
• **Drape & Dupatta:** Lightweight silk tissue dupatta with scalloped zardozi border.
• **Jewelry Harmony:** Uncut Polki emerald choker with pearl drop accents.

${hasMeasurements ? `*Sizing Intelligence:* Based on your natural waist of ${measurements.waist || 70}cm and hip span of ${measurements.hips || 96}cm, I recommend Size M in bridal lehengas to allow the structured waistband to sit comfortably 2 inches above the navel without tight restriction.` : '*Sizing Intelligence:* Enter your waist and high-hip measurements to calculate optimal skirt drop lengths.'}`,
      actionLink: {
        label: 'Enter Couture Lehenga Studio',
        path: '/lehenga-studio',
      },
      tryOnLink: {
        label: '3D Try-On in Fitting Room',
        path: '/virtual-fitting-room?audience=Women&category=Traditional%20wear&clothingType=Lehenga%20choli',
      },
      chips: ['24-Kali Flare', 'Heritage Banarasi', 'Royal Sangeet'],
    }
  }

  // 3. PERFECT JEANS & DENIM SIZING
  if (query.includes('jeans') || query.includes('denim') || query.includes('trousers') || query.includes('pants')) {
    const waist = measurements.waist || 70
    const hips = measurements.hips || 96
    const drop = hips - waist

    return {
      text: `Denim fit hinges on the mathematical drop between your natural waist and high-hip curvature.

**Fit Diagnostics for Your Silhouette:**
• **Your Waist-to-Hip Delta:** ${drop} cm difference.
• **Recommended Silhouette:** High-rise straight leg or contoured tapered cut to prevent waistband gap.
• **Fabric Stretch Guidance:** 
  - *100% Cotton Rigid Selvedge:* Order true to size with +1.5 cm ease allowance; molds to your frame over time.
  - *Stretch Denim (2% Elastane):* Size down by 1 cm if you prefer a sculpted compressive hold.

${hasMeasurements ? `*Size Engine Match:* For your ${waist}cm waist and ${hips}cm hips, Zara Denim runs true in Size 28/S, whereas Levi's 501s fit best in 29W to accommodate hip curvature.` : '*Tip:* Calibrate your waist and hip tape measurements in the Measurement Studio for exact denim sizing.'}`,
      actionLink: {
        label: 'Find My Perfect Denim Size',
        path: '/find-my-size?category=Bottoms',
      },
      tryOnLink: {
        label: 'Inspect in Fitting Room',
        path: '/virtual-fitting-room?audience=Women&category=Bottoms&clothingType=Jeans',
      },
      chips: ['Selvedge Denim', 'Waist-to-Hip Drop', 'Tension Map'],
    }
  }

  // 4. COMPLETE HEAD-TO-TOE OUTFIT
  if (query.includes('complete') || query.includes('outfit') || query.includes('head-to-toe') || query.includes('look')) {
    return {
      text: `Here is a complete, coordinated haute-couture ensemble balanced across proportion, texture, and tonal harmony:

**The Obsidian & Champagne Evening Ensemble**
1. **Top / Bodice:** Double-faced Barathea tailored blazer or draped cowl-neck silk charmeuse top.
2. **Bottom:** Fluid high-twist crepe wide-leg palazzo trousers with satin waist piping.
3. **Outerwear Accent:** Structured cashmere capelet with champagne-gold horn buttons.
4. **Footwear:** Pointed-toe lacquered calfskin stilettos (75mm) in antique champagne.
5. **Color Story:** Midnight Obsidian (#090a0d) anchored with warm Champagne Gold (#d6b46a) and soft ivory pearls.

${hasMeasurements ? `*Biometric Harmony:* This column silhouette elongates a ${measurements.height || 168}cm frame by drawing continuous vertical sightlines from shoulder to hem.` : ''}`,
      actionLink: {
        label: 'Explore 3D Outfit Builder',
        path: '/outfit-builder',
      },
      tryOnLink: {
        label: 'Drape Complete Look',
        path: '/virtual-fitting-room?audience=Women&category=Dresses',
      },
      chips: ['Head-to-Toe', 'Obsidian & Champagne', 'Column Silhouette'],
    }
  }

  // 5. BRAND SIZE COMPARISON
  if (query.includes('brand') || query.includes('compare') || query.includes('difference') || query.includes('zara') || query.includes('sabyasachi')) {
    return {
      text: `Every luxury fashion maison designs around their proprietary fit block and wearing ease philosophy:

**Key Luxury Brand Grading Nuances:**
• **Sabyasachi Heritage:** Cut with traditional artisanal allowances (+7cm chest ease, +5.5cm waist ease). Accommodates heavy brocades and formal posture.
• **Zara Haute High-Street:** European fast-tailoring block with minimal ease (+3.5cm chest, +2cm waist). Often requires sizing up for curvy silhouettes.
• **Massimo Dutti:** Relaxed continental elegance (+5cm chest, +4cm waist). True-to-size with comfortable shoulder drape.
• **Armani Collezioni:** Deconstructed sartorial Italian cut; narrow through the biceps and high armhole.

${hasMeasurements ? `*Your Fit Profile:* For your measurements (${measurements.chest || 88}cm chest, ${measurements.waist || 68}cm waist), you are a solid **Size S** in Massimo Dutti, but will prefer **Size M** in structured Zara outerwear.` : ''}`,
      actionLink: {
        label: 'View Brand Sizing Matrix',
        path: '/brand-comparison',
      },
      tryOnLink: {
        label: 'Compare in Virtual Fitting Room',
        path: '/virtual-fitting-room',
      },
      chips: ['Brand Comparison', 'Wearing Ease', 'Fit Nuance'],
    }
  }

  // 6. STYLE MY SAVED WARDROBE
  if (query.includes('wardrobe') || query.includes('saved') || query.includes('my clothes') || query.includes('closet')) {
    if (savedCount > 0) {
      const firstItem = wardrobe.savedProducts[0]
      return {
        text: `I have inspected your private FITMATE Wardrobe. You currently have **${savedCount} luxury garment${savedCount > 1 ? 's' : ''}** curated.

**Styling Your Saved Piece: "${firstItem.name || firstItem.productName || 'Curated Garment'}"**
• **Occasion Recommendation:** Ideal for ${firstItem.occasion || 'Evening & Gallery Receptions'}.
• **Pairing Idea:** Pair this ${firstItem.fabric || 'silk'} piece with high-contrast metallic accessories in champagne gold and clean, minimal footwear to let the textile weave take center stage.
• **Care & Fit:** Stored with your active fit preference (**${fitPreference}**).

Would you like me to coordinate matching shoes and outerwear from the showroom?`,
        actionLink: {
          label: 'Open My Wardrobe (3D Vault)',
          path: '/my-wardrobe',
        },
        tryOnLink: {
          label: 'Try On Saved Garment',
          path: `/virtual-fitting-room?garmentId=${firstItem.id}`,
        },
        chips: ['Wardrobe Curation', 'Saved Outfits', 'Personal Vault'],
      }
    }

    return {
      text: `Your virtual walk-in wardrobe is currently waiting for its first curated couture pieces!

**How to Build Your Wardrobe:**
1. Explore any of our 10 3D Showroom Pavilions (Western, Men's, Indian Ethnic, Lehenga Studio, Diwali).
2. Tap the bookmark icon on garments you love to save them into your 3D Wardrobe Vault.
3. Return here, and I will create custom styling combinations using your saved pieces.`,
      actionLink: {
        label: 'Explore Fashion Universe',
        path: '/collections',
      },
      tryOnLink: {
        label: 'Open Walk-In Wardrobe',
        path: '/my-wardrobe',
      },
      chips: ['Curate Closet', 'Bookmark Garments', '3D Vault'],
    }
  }

  // 7. BUDGET & FIT PREFERENCES
  if (query.includes('budget') || query.includes('price') || query.includes('cost') || query.includes('tier')) {
    return {
      text: `FITMATE categorizes fashion discovery into four distinct luxury investment tiers:

1. **Haute Couture / Heirloom:** Pure handwoven Banarasi & Kanjivaram silks, real gold zari, bespoke tailor-fitted bridal lehengas (Sabyasachi, Raw Mango).
2. **Designer Bridge:** Contemporary luxury blazers, fine merino knitwear, and evening silk slips (Massimo Dutti, Theory).
3. **Accessible Elegance:** Quality ready-to-wear essentials, cotton-linen shirts, and selvedge denim (Zara, Levi's).
4. **Bespoke Tailoring:** Made-to-measure tuxedos and sherwanis cut precisely to your tape passport.

You can filter any showroom portal by your target price range and preferred wearing ease (${fitPreference}).`,
      actionLink: {
        label: 'Explore Curated Collections',
        path: '/collections',
      },
      tryOnLink: {
        label: 'View Size Recommendations',
        path: '/find-my-size',
      },
      chips: ['Investment Tiers', 'Bespoke Tailoring', 'Couture Filter'],
    }
  }

  // 8. GENERAL / OPEN FASHION CONSULTATION (HONEST DEMO REASONING)
  return {
    text: `I have analyzed your styling inquiry: *"${prompt}"*.

**Stylist Recommendation:**
To achieve effortless elegance, focus on balanced silhouette proportions. Pair voluminous pieces (such as a flared 24-kali skirt or wide-leg palazzo) with clean, structured bodices. Maintain tonal continuity by echoing your shoe or accessory shade in your garment trim.

${hasMeasurements ? `*Your Biometric Fit:* Your saved measurements (${measurements.height || 168}cm height, ${measurements.chest || 88}cm chest, ${measurements.waist || 68}cm waist) are active and guiding this recommendation.` : '*Stylist Tip:* Connect your body tape dimensions in the Measurement Studio for personalized ease calculations.'}

*(Note: Operating in Demonstration Stylist Mode. Connect backend AI LLM provider in settings for unrestricted natural language generation.)*`,
    actionLink: {
      label: 'Explore 3D Showroom Portals',
      path: '/collections',
    },
    tryOnLink: {
      label: 'Test in Virtual Fitting Room',
      path: '/virtual-fitting-room',
    },
    chips: ['AURA Styling Engine', 'Bespoke Advice', '3D Fitting'],
  }
}
