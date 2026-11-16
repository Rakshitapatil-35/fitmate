import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronRight, Heart, Ruler, Sparkles } from 'lucide-react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { BrandWordmark, Button, Eyebrow, Surface } from '../components/DesignSystem.jsx'
import { ProductImage } from '../components/Feedback.jsx'
import { useToast } from '../components/ToastContext.jsx'
import MobileNav from '../components/MobileNav.jsx'
import { calculateDemoRecommendation, demoBrands, getTraditionalDemoChart } from '../demoFitData.js'
import { loadMeasurements, loadWardrobe, recordOccasion, recordProductView, recordRecentCheck, toggleSavedProduct } from '../measurementStorage.js'
import { traditionalWearCategories } from '../traditionalWearData.js'
import './ProductDetailsPage.css'

const sizeLabels = ['XS', 'S', 'M', 'L', 'XL']
const colors = [
  { name: 'Ivory', value: '#e7ddc9' },
  { name: 'Sage', value: '#87917a' },
  { name: 'Rose', value: '#b77f79' },
  { name: 'Midnight', value: '#303642' },
]
const alternateImages = [
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
]
const westernImages = [
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85',
]

function makeProductChart(baseRows, metrics, label) {
  const easeByMetric = { chest: 8, waist: 6, hip: 8, shoulder: 1, inseam: 0 }
  return baseRows.map((row, index) => ({
    size: row.size ?? sizeLabels[index],
    ...Object.fromEntries(metrics.map((metric) => [metric, Number(row[metric] ?? 0) + (easeByMetric[metric] ?? 6)])),
    length: label === 'Sarees' ? 550 : label?.toLowerCase().includes('kurta') ? 108 + index : 96 + index,
  }))
}

const metricNames = { chest: 'Chest / bust', waist: 'Waist', hip: 'Hip', shoulder: 'Shoulder width', inseam: 'Inseam' }
const preferredEase = {
  Slim: { chest: 4, waist: 4, hip: 4, shoulder: 0, inseam: 0 },
  Regular: { chest: 8, waist: 6, hip: 8, shoulder: 1, inseam: 0 },
  Relaxed: { chest: 14, waist: 12, hip: 14, shoulder: 2, inseam: 0 },
  Oversized: { chest: 20, waist: 18, hip: 20, shoulder: 3, inseam: 0 },
}

function recommendFromGarmentChart(rows, metrics, measurements, fitPreference, weights = {}) {
  if (!metrics.length) return null
  const metricWeights = Object.fromEntries(metrics.map((metric) => [metric, weights[metric] ?? 1 / metrics.length]))
  const scored = rows.map((row) => ({
    ...row,
    weightedDistance: metrics.reduce((sum, metric) => {
      const interval = Math.max(1, Math.abs((rows[1]?.[metric] ?? row[metric] + 1) - (rows[0]?.[metric] ?? row[metric])))
      const actualEase = row[metric] - measurements[metric]
      const desiredEase = preferredEase[fitPreference]?.[metric] ?? 8
      return sum + Math.abs(actualEase - desiredEase) / interval * metricWeights[metric]
    }, 0),
  }))
  const best = scored.reduce((current, row) => row.weightedDistance < current.weightedDistance ? row : current)
  const index = scored.findIndex((row) => row.size === best.size)
  const alternateIndex = index < scored.length - 1 ? index + 1 : Math.max(0, index - 1)
  const alternate = scored[alternateIndex]
  return {
    size: best.size,
    closestSize: best.size,
    fitPreference,
    alternative: alternate?.size ?? null,
    alternativeReason: alternateIndex > index ? 'Consider this size up if you want more room beyond the ease shown in this sample garment chart.' : 'Consider this size down if you prefer less room than the ease shown in this sample garment chart.',
    weightedDistance: best.weightedDistance,
    confidence: Math.max(0, Math.round(100 - best.weightedDistance * 28)),
    comparison: metrics.map((metric) => ({ metric, bodyValue: measurements[metric], chartValue: best[metric], difference: Number(Math.abs(measurements[metric] - best[metric]).toFixed(1)) })),
    metrics,
    chartRows: rows,
    chartModel: 'product-garment-demo',
    preferenceShifted: false,
  }
}

function ProductDetailsPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const audience = searchParams.get('audience') ?? 'Women'
  const category = searchParams.get('category') ?? 'Traditional wear'
  const clothingType = searchParams.get('clothingType') ?? ''
  const brandId = searchParams.get('brandId') ?? ''
  const productName = searchParams.get('productName') ?? ''
  const brand = demoBrands.find((item) => item.id === brandId)
  const product = brand?.products.find((item) => item.name === productName && item.type === clothingType)
  const categoryInfo = traditionalWearCategories.find((item) => item.audience === audience && item.name === clothingType)
  const traditionalChart = category === 'Traditional wear' && brand ? getTraditionalDemoChart(brand, clothingType) : null
  const baseRows = traditionalChart?.rows ?? brand?.sizeChart ?? []
  const metrics = traditionalChart?.metrics ?? ['chest', 'waist', 'hip']
  const productChart = makeProductChart(baseRows, metrics, clothingType)
  const isDrape = traditionalChart?.model === 'saree-drape'
  const productSizes = isDrape ? ['One size'] : sizeLabels
  const images = categoryInfo
    ? [...new Set([categoryInfo.image, ...alternateImages])]
    : westernImages
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(colors[0].name)
  const [fitPreference, setFitPreference] = useState('Regular')
  const [availableSize, setAvailableSize] = useState(isDrape ? 'One size' : 'M')
  const [notice, setNotice] = useState('')
  const measurements = loadMeasurements()
  const requiredMetrics = traditionalChart?.metrics ?? (category === 'Bottoms' ? ['waist', 'hip'] : category === 'Dresses' ? ['chest', 'waist', 'hip'] : ['chest', 'waist'])
  const fabric = categoryInfo?.fabrics?.[0] ?? 'Cotton blend'
  const occasion = categoryInfo?.occasions?.[0] ?? (category === 'Dresses' ? 'Occasion' : 'Everyday')
  const productRecord = product && brand ? {
    id: `${brand.id}:${product.name}`, name: product.name, brand: brand.name, audience, category, clothingType,
    brandId: brand.id, productName: product.name, image: images[0], occasion,
  } : null
  const [savedState, setSavedState] = useState({ productId: '', isSaved: false })
  const isSaved = productRecord && savedState.productId === productRecord.id
    ? savedState.isSaved
    : Boolean(productRecord && loadWardrobe().savedProducts.some((item) => item.id === productRecord.id))

  useEffect(() => {
    if (!product || !brand) return
    recordProductView({
      id: `${brand.id}:${product.name}`, name: product.name, brand: brand.name, audience, category, clothingType,
      brandId: brand.id, productName: product.name, image: categoryInfo?.image ?? westernImages[0], occasion,
    })
    recordOccasion(occasion)
  }, [product, brand, audience, category, clothingType, categoryInfo, occasion])

  if (!product || !brand) {
    return <main className="product-missing"><Eyebrow>DEMO CATALOGUE</Eyebrow><h1>Product unavailable</h1><p>Choose a sample item to view its details.</p><Button to="/find-my-size" icon={ArrowRight}>Browse products</Button></main>
  }

  const handleFindSize = () => {
    if (!isDrape && (!measurements || requiredMetrics.some((metric) => !Number.isFinite(measurements[metric])))) {
      setNotice('Add the measurements needed for this item to your profile before continuing.')
      return
    }
    const recommendation = isDrape
      ? calculateDemoRecommendation({ brand, category, fitPreference, measurements: measurements ?? {}, productType: clothingType })
      : recommendFromGarmentChart(productChart, metrics, measurements, fitPreference, traditionalChart?.weights ?? {})
    recordRecentCheck({ brandId: brand.id, brand: brand.name, product: product.name, category: `${audience} · ${category}`, size: recommendation.size })
    navigate('/size-result', { state: {
      selection: { audience, category, clothingType, brandId, productName, fitPreference, measurements: measurements ?? {}, color: selectedColor, availableSize },
      recommendation,
      productDetails: { name: product.name, fabric, color: selectedColor, occasion, sizeViewed: availableSize, chart: productChart.find((row) => row.size === availableSize) ?? productChart[0] },
    } })
  }

  const displayMetrics = metrics.length ? metrics : []

  return (
    <div className="product-page">
      <header className="product-header">
        <BrandWordmark to="/" />
        <nav aria-label="Product navigation"><Link to="/collections">Collections</Link><Link to="/my-wardrobe">My Wardrobe</Link><Link to="/measurements">My Measurements</Link></nav>
        <MobileNav links={[{ to: '/collections', label: 'Collections' }, { to: '/my-wardrobe', label: 'My Wardrobe' }, { to: '/measurements', label: 'My Measurements' }, { to: '/find-my-size', label: 'Find My Size' }]} />
      </header>
      <main className="product-main">
        <Link className="product-back" to="/find-my-size"><ArrowLeft size={15} /> Back to product selection</Link>
        <div className="product-breadcrumb"><span>{audience}</span><ChevronRight size={13} /><span>{category}</span><ChevronRight size={13} /><span>{clothingType}</span></div>
        <div className="product-grid">
          <section className="product-gallery" aria-label="Product image gallery">
            <div className="product-gallery-main">
              <ProductImage src={images[selectedImage]} alt={`${product.name} in ${selectedColor}`} />
              <span className="product-demo-tag"><Sparkles size={12} /> DEMO CATALOGUE</span>
              <span className="product-image-count">{String(selectedImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
            </div>
            <div className="product-thumbnails" role="group" aria-label="Choose product image">
              {images.map((image, index) => <button type="button" key={image} aria-label={`Show product image ${index + 1}`} aria-pressed={selectedImage === index} className={selectedImage === index ? 'is-selected' : ''} onClick={() => setSelectedImage(index)}><ProductImage src={image} alt="" /></button>)}
            </div>
          </section>

          <section className="product-info" aria-labelledby="product-title">
            <Eyebrow>{brand.name} <span className="product-eyebrow-divider">/</span> {category}</Eyebrow>
            <h1 id="product-title">{product.name}</h1>
            <p className="product-type-line">{clothingType} <span>·</span> Sample product details</p>
            <button className={isSaved ? 'product-save is-saved' : 'product-save'} type="button" aria-pressed={isSaved} onClick={() => { const next = toggleSavedProduct(productRecord); setSavedState({ productId: productRecord.id, isSaved: next }); toast(next ? 'Saved to My Wardrobe on this device.' : 'Removed from My Wardrobe.'); }}>
              <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} /> {isSaved ? 'Saved to My Wardrobe' : 'Save to My Wardrobe'}
            </button>
            <p className="product-description">{categoryInfo?.description ?? `A considered ${clothingType.toLowerCase()} silhouette, designed to pair everyday comfort with an easy, polished fit.`}</p>
            <div className="product-meta-grid">
              <div><span>FABRIC</span><strong>{fabric}{categoryInfo?.fabrics?.[1] ? ` · ${categoryInfo.fabrics[1]}` : ''}</strong></div>
              <div><span>OCCASION</span><strong>{occasion}</strong></div>
              <div><span>COLOUR</span><strong>{selectedColor}</strong></div>
              <div><span>FIT</span><strong>{fitPreference} silhouette</strong></div>
            </div>

            <div className="product-option-block">
              <div className="product-option-heading"><span>Colour</span><strong>{selectedColor}</strong></div>
              <div className="product-color-options" role="group" aria-label="Choose colour">
                {colors.map((color) => <button key={color.name} type="button" aria-label={color.name} aria-pressed={selectedColor === color.name} className={selectedColor === color.name ? 'is-selected' : ''} onClick={() => setSelectedColor(color.name)}><span style={{ backgroundColor: color.value }} /></button>)}
              </div>
            </div>

            <div className="product-option-block">
              <div className="product-option-heading"><span>Available sizes</span><Link to="/measurements"><Ruler size={13} /> Size guide</Link></div>
              <div className="product-size-options" role="group" aria-label="Available sample sizes">
                {productSizes.map((size) => <button type="button" key={size} aria-pressed={availableSize === size} className={availableSize === size ? 'is-selected' : ''} onClick={() => setAvailableSize(size)}>{size}</button>)}
              </div>
            </div>

            <div className="product-option-block product-fit-block">
              <div className="product-option-heading"><span>How do you like your fit?</span><span className="product-demo-inline">FIT PREFERENCE</span></div>
              <div className="product-fit-options" role="group" aria-label="Fit preference">
                {['Slim', 'Regular', 'Relaxed', 'Oversized'].map((fit) => <button type="button" key={fit} aria-pressed={fitPreference === fit} className={fitPreference === fit ? 'is-selected' : ''} onClick={() => setFitPreference(fit)}>{fit}</button>)}
              </div>
            </div>
            {notice && <p className="product-profile-notice" role="alert">{notice} <Link to={`/measurements?audience=${encodeURIComponent(audience)}&category=${encodeURIComponent(category)}&clothingType=${encodeURIComponent(clothingType)}`}>Add measurements <ArrowRight size={13} /></Link></p>}
            <Button className="product-find-size" type="button" icon={ArrowRight} onClick={handleFindSize}>Find My Size</Button>
            <p className="product-cta-note"><Check size={13} /> Uses your saved fit profile and this selected demo item.</p>
          </section>
        </div>

        <section className="product-detail-sections">
          <Surface as="section" className="product-detail-card" aria-labelledby="fit-heading">
            <Eyebrow>DESIGNED FOR COMFORT</Eyebrow><h2 id="fit-heading">Fit information</h2>
            <p>{categoryInfo?.description ?? `A ${fitPreference.toLowerCase()}-friendly ${clothingType.toLowerCase()} with a balanced, versatile shape.`} Check the garment chart below against your body measurements and consider the wearing ease you prefer for this fabric and silhouette.</p>
            <div className="product-length-spec"><Ruler size={17} /><span><small>PRODUCT LENGTH</small><strong>{productChart.find((row) => row.size === availableSize)?.length ?? productChart[0]?.length ?? 100} cm <em>· sample garment specification</em></strong></span></div>
          </Surface>
          <Surface as="section" className="product-detail-card product-chart-card" aria-labelledby="chart-heading">
            <div className="product-chart-heading"><div><Eyebrow>GARMENT SPECIFICATIONS</Eyebrow><h2 id="chart-heading">Size chart</h2></div><span>CM · DEMO DATA</span></div>
            <p className="product-chart-note">Illustrative finished-garment measurements for this sample catalogue item. Compare with your body measurements and allow for your preferred wearing ease.</p>
            {isDrape ? <div className="product-drape-spec"><span>One size · drape length</span><strong>550 cm</strong></div> : <div className="product-chart-scroll"><table><thead><tr><th>Size</th>{displayMetrics.map((metric) => <th key={metric}>{metricNames[metric] ?? metric}</th>)}<th>Length</th></tr></thead><tbody>{productChart.map((row) => <tr key={row.size} className={row.size === availableSize ? 'is-selected' : ''}><th>{row.size}</th>{displayMetrics.map((metric) => <td key={metric}>{row[metric]} cm</td>)}<td>{row.length} cm</td></tr>)}</tbody></table></div>}
            <p className="product-chart-footnote">Sample catalogue content only; measurements and availability are illustrative, not live inventory.</p>
          </Surface>
        </section>
        <div className="product-bottom-cta"><span>Ready to find your best starting size?</span><Button type="button" icon={ArrowRight} onClick={handleFindSize}>Find My Size</Button></div>
      </main>
    </div>
  )
}

export default ProductDetailsPage
