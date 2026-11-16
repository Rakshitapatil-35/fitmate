import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Info, Ruler, Sparkles } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { BrandWordmark, Button, Eyebrow, Surface } from '../components/DesignSystem.jsx'
import { calculateDemoRecommendation, demoBrands } from '../demoFitData.js'
import './SizeResultPage.css'

const metricLabels = { chest: 'Chest', waist: 'Waist', hip: 'Hip', shoulder: 'Shoulder', inseam: 'Inseam' }

function SizeResultPage() {
  const { state } = useLocation()

  if (!state?.selection || !state?.recommendation) {
    return <Navigate to="/find-my-size" replace />
  }

  const { selection, recommendation, productDetails } = state
  const hasBodySizeChart = recommendation.metrics.length > 0
  const isDrapeComparison = recommendation.chartModel === 'saree-drape'
  const getMetricLabel = (metric) => metric === 'chest' && selection.audience === 'Women' && selection.category === 'Traditional wear'
    ? 'Bust'
    : metricLabels[metric]
  const brand = demoBrands.find((item) => item.id === selection.brandId)
  const product = brand?.products.find((item) => item.name === selection.productName)
  const crossBrandComparisons = demoBrands.flatMap((demoBrand) => {
    const matchingProduct = demoBrand.products.find((item) => (
      item.audience === selection.audience
      && item.category === selection.category
      && item.type === selection.clothingType
    ))
    if (!matchingProduct) return []

    return [{
      brand: demoBrand,
      product: matchingProduct,
      recommendation: calculateDemoRecommendation({
        brand: demoBrand,
        category: selection.category,
        fitPreference: selection.fitPreference,
        measurements: selection.measurements,
        productType: matchingProduct.type,
      }),
    }]
  }).sort((first, second) => Number(second.brand.id === selection.brandId) - Number(first.brand.id === selection.brandId))

  if (!brand || !product) return <Navigate to="/find-my-size" replace />

  return (
    <div className="size-result-page">
      <header className="size-result-header">
        <BrandWordmark to="/" />
        <nav aria-label="Results navigation">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/measurements">My Measurements</Link>
        </nav>
      </header>

      <main className="size-result-main">
        <Link className="size-result-back" to="/find-my-size"><ArrowLeft size={15} /> Edit product selection</Link>

        <section className="size-result-hero" aria-labelledby="result-heading">
          <div className="size-result-hero-copy">
            <Eyebrow><Sparkles size={13} /> YOUR FITMATE RESULT · DEMO</Eyebrow>
            <h1 id="result-heading">Your suggested size is <em>{recommendation.size}.</em></h1>
            <p className="size-result-product-line">{brand.name} <span>·</span> {product.name}</p>
            <p className="size-result-context">{selection.audience} · {selection.category} · {product.type}{!isDrapeComparison && ` · ${selection.fitPreference} fit`}</p>
            {productDetails && <p className="size-result-product-details">{productDetails.color} · {productDetails.fabric} · {productDetails.occasion}{productDetails.sizeViewed ? ` · viewed size ${productDetails.sizeViewed}` : ''}</p>}
            <p className="size-result-demo-disclaimer">Illustrative recommendation using fictional sample data. Not live brand sizing.</p>
          </div>
          <div className="size-result-size-mark" aria-label={`Illustrative recommended size ${recommendation.size}`}>
            <span>YOUR DEMO SIZE</span>
            <strong>{recommendation.size}</strong>
            <span>{isDrapeComparison ? 'DRAPE LENGTH' : `${selection.fitPreference.toUpperCase()} FIT`}</span>
          </div>
        </section>

        <section className="size-result-summary-grid" aria-label="Recommendation details">
          {recommendation.confidence !== null ? (
            <Surface as="article" className="size-result-confidence" aria-labelledby="confidence-heading">
              <div className="size-result-card-title">
                <span className="size-result-icon"><Sparkles size={17} /></span>
                <span className="size-result-demo-label">ILLUSTRATIVE ONLY</span>
              </div>
              <Eyebrow>DEMO COMPARISON</Eyebrow>
              <h2 id="confidence-heading">{recommendation.confidence}%</h2>
              <p>Illustrative closeness to this fictional chart row</p>
              <div className="size-result-confidence-track" role="progressbar" aria-label="Illustrative closeness to the selected demo chart row" aria-valuemin="0" aria-valuemax="100" aria-valuenow={recommendation.confidence}>
                <span style={{ width: `${recommendation.confidence}%` }} />
              </div>
              <details className="size-result-method-details">
                <summary>How this indicator is calculated</summary>
                <p>{productDetails ? 'This indicator reflects how closely the selected sample garment measurements match the wearing ease you chose. It is a UI demo heuristic, not a validated fit score.' : 'It starts at 100 and subtracts 28 times the weighted, size-interval-normalized difference between your selected profile measurements and the recommended fictional body-chart row. This is a UI demo heuristic, not a validated confidence model.'}</p>
              </details>
            </Surface>
          ) : (
            <Surface as="article" className="size-result-confidence" aria-labelledby="drape-heading">
              <div className="size-result-card-title"><span className="size-result-icon"><Sparkles size={17} /></span><span className="size-result-demo-label">NO BODY-SIZE SCORE</span></div>
              <Eyebrow>DRAPE LENGTH PREVIEW</Eyebrow>
              <h2 id="drape-heading">550 cm</h2>
              <p>Illustrative sample saree length. No body-measurement confidence is calculated for an unstitched drape.</p>
            </Surface>
          )}

          <Surface as="article" className="size-result-alternative" aria-labelledby="alternative-heading">
            <div className="size-result-card-title">
              <span className="size-result-icon"><ArrowUpRight size={17} /></span>
              <span className="size-result-demo-label">{recommendation.alternative ? 'ANOTHER OPTION' : 'SIZING NOTE'}</span>
            </div>
            <Eyebrow>{recommendation.alternative ? 'ALTERNATIVE SIZE' : 'SEPARATE BLOUSE SIZING'}</Eyebrow>
            <h2 id="alternative-heading">{recommendation.alternative ? <>Consider <strong>{recommendation.alternative}</strong></> : 'One-size drape'}</h2>
            <p>{recommendation.alternativeReason}</p>
            <span className="size-result-alternative-note">A different cut, fabric or construction can change the best choice.</span>
          </Surface>
        </section>

        <section className="size-result-content-grid">
          <Surface as="section" className="size-result-measurements" aria-labelledby="comparison-heading">
            <div className="size-result-section-heading">
              <span className="size-result-icon"><Ruler size={17} /></span>
              <div><Eyebrow>{hasBodySizeChart ? 'YOUR SAVED PROFILE' : 'SAREE SIZE REFERENCE'}</Eyebrow><h2 id="comparison-heading">{hasBodySizeChart ? 'Body measurement comparison' : 'Drape length reference'}</h2></div>
            </div>
            <p className="size-result-table-intro">{productDetails ? 'Your body measurements are compared with this sample product’s finished garment measurements and the wearing ease you selected.' : hasBodySizeChart ? 'Your profile measurements compared with the selected size’s fictional recommended wearer measurements.' : 'The sample one-size drape length is shown here. Body measurements are not used for this saree example.'}</p>
            {hasBodySizeChart ? <div className="size-result-table-scroll">
              <table className="size-result-table">
                <caption className="size-result-visually-hidden">Comparison of saved measurements with the recommended fictional size reference</caption>
                <thead><tr><th scope="col">Measurement</th><th scope="col">Your profile</th><th scope="col">Size {recommendation.size} {productDetails ? 'garment' : 'reference'}</th><th scope="col">Difference</th></tr></thead>
                <tbody>
                  {recommendation.comparison.map(({ metric, bodyValue, chartValue, difference }) => (
                    <tr key={metric}>
                      <th scope="row">{getMetricLabel(metric)}</th>
                      <td>{bodyValue} cm</td>
                      <td>{chartValue} cm</td>
                      <td>{difference} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> : <p className="size-result-chart-note">This saree sample uses a drape length rather than a body-size chart. Any stitched or bundled blouse has separate fit and measurement requirements.</p>}
            {hasBodySizeChart && <p className="size-result-chart-note">{productDetails ? 'Sample garment measurements and availability are illustrative demo catalogue content, not live brand data.' : 'Sample size-chart rows represent intended wearer body measurements for this demo. They are not measurements of the finished garment.'}</p>}
          </Surface>

          <Surface as="section" className="size-result-profile" aria-labelledby="profile-heading">
            <div className="size-result-section-heading">
              <span className="size-result-icon"><Check size={17} /></span>
              <div><Eyebrow>USED FOR THIS DEMO</Eyebrow><h2 id="profile-heading">Measurement summary</h2></div>
            </div>
            {hasBodySizeChart ? <div className="size-result-profile-list">
              {recommendation.metrics.map((metric) => (
                <div key={metric}><span>{getMetricLabel(metric)}</span><strong>{selection.measurements[metric]} cm</strong></div>
              ))}
            </div> : <p className="size-result-profile-note">Body measurements are not used to size this unstitched saree drape. Use the blouse’s separate chart if one is included.</p>}
            <Link className="size-result-profile-link" to="/measurements">Edit measurements <ArrowUpRight size={14} /></Link>
          </Surface>
        </section>

        {!productDetails && <Surface as="section" className="size-result-brand-comparison" aria-labelledby="brand-comparison-heading">
          <div className="size-result-section-heading">
            <span className="size-result-icon"><ArrowUpRight size={17} /></span>
            <div><Eyebrow>{isDrapeComparison ? 'CROSS-BRAND DRAPE VIEW' : 'CROSS-BRAND SIZE VIEW'}</Eyebrow><h2 id="brand-comparison-heading">{isDrapeComparison ? 'Compare drape details across brands' : 'Compare this fit across brands'}</h2></div>
          </div>
          <p className="size-result-table-intro">{isDrapeComparison ? 'Compare the sample drape-length reference for the same saree type across fictional brands.' : 'Same category, product type, profile and fit preference, compared against each fictional demo chart.'}</p>
          <div className="size-result-table-scroll">
            <table className="size-result-table size-result-cross-brand-table">
              <caption className="size-result-visually-hidden">Illustrative size recommendations across fictional brands</caption>
              <thead><tr><th scope="col">Fictional brand</th><th scope="col">Sample product</th><th scope="col">Suggested size</th><th scope="col">{recommendation.chartModel === 'saree-drape' ? 'Sample drape length' : 'Illustrative closeness'}</th></tr></thead>
              <tbody>
                {crossBrandComparisons.map(({ brand: demoBrand, product: demoProduct, recommendation: demoRecommendation }) => (
                  <tr className={demoBrand.id === selection.brandId ? 'is-selected-brand' : ''} key={demoBrand.id}>
                    <th scope="row">{demoBrand.name}{demoBrand.id === selection.brandId && <span className="size-result-selected-label">SELECTED</span>}</th>
                    <td>{demoProduct.name}</td>
                    <td className="size-result-cross-brand-size">{demoRecommendation.size}</td>
                    <td>{demoRecommendation.confidence === null ? `${demoRecommendation.chartRows[0].drapeLengthCm} cm` : `${demoRecommendation.confidence}%`} <span className="size-result-demo-inline">demo only</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="size-result-chart-note">All names and charts are fictional. These calculations are illustrative, not live brand data or validated fit guidance.</p>
        </Surface>}

        <section className="size-result-explanation" aria-labelledby="why-heading">
          <div className="size-result-explanation-icon"><Info size={19} /></div>
          <div>
            <Eyebrow>HOW TO READ THIS RESULT</Eyebrow>
            <h2 id="why-heading">Why we suggested size {recommendation.size}</h2>
            {recommendation.chartModel === 'saree-drape' ? <p>This sample saree is modeled as a one-size drape measured by length, not by comparing body measurements. A stitched or bundled blouse should be sized separately with its own relevant chart.</p> : (
              <p>
                {productDetails
                  ? `The closest starting point was size ${recommendation.size}, comparing your ${recommendation.metrics.map((metric) => getMetricLabel(metric).toLowerCase()).join(' and ')} measurements with this sample garment chart and the ease associated with your ${selection.fitPreference.toLowerCase()} fit preference.`
                  : `The closest starting point in the ${brand.name} fictional ${selection.category === 'Traditional wear' ? `${product.type}-specific` : ''} body-size chart was size ${recommendation.closestSize}, using a weighted comparison of your ${recommendation.metrics.map((metric) => getMetricLabel(metric).toLowerCase()).join(' and ')} measurements. Your ${selection.fitPreference.toLowerCase()} fit preference ${recommendation.preferenceShifted ? `then adjusted the sample suggestion to size ${recommendation.size}` : 'kept the closest size as the sample suggestion'}.`}
              </p>
            )}
            {isDrapeComparison ? (
              <p>The sample length describes the saree drape, not a body measurement or finished blouse. Drape, styling and any blouse fit depend on the specific product and construction, which this demo does not model.</p>
            ) : (
              <p>{productDetails ? 'This comparison uses illustrative finished-garment measurements and ease values. Check the seller’s current garment chart and consider fabric stretch, construction and the fit you prefer before ordering.' : 'The chart describes example wearer measurements. A finished garment can include positive or negative ease, and the actual fit depends on its intended cut, fabric stretch and construction. Those product details are not modeled in this demo, so treat this as a transparent example rather than a real-world fit promise.'}</p>
            )}
          </div>
        </section>

        <section className="size-result-actions" aria-label="Next steps">
          <div><Eyebrow>KEEP EXPLORING</Eyebrow><p>Try another item, inspect 3D draping, or update your sample profile.</p></div>
          <div className="size-result-action-buttons">
            <Button to={`/virtual-fitting-room?audience=${encodeURIComponent(selection.audience)}&category=${encodeURIComponent(selection.category)}`} icon={Sparkles}>Step into 3D Fitting Room</Button>
            <Button to="/find-my-size" variant="secondary" icon={ArrowLeft}>Try another product</Button>
            <Button to="/measurements" variant="secondary" icon={ArrowRight}>Edit measurements</Button>
          </div>
        </section>

        <footer className="size-result-footer">
          <BrandWordmark to="/" />
          <span>Demo only. No live brand data or fit validation.</span>
        </footer>
      </main>
    </div>
  )
}

export default SizeResultPage
