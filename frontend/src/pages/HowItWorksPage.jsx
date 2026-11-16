import { ArrowRight, BadgeCheck, ChartNoAxesCombined, Ruler, ScanSearch, Shirt } from 'lucide-react'
import { Button, Eyebrow, Surface } from '../components/DesignSystem.jsx'
import EditorialPageLayout from '../components/EditorialPageLayout.jsx'

const steps = [
  {
    number: '01',
    icon: Ruler,
    title: 'Create your measurement profile',
    description: 'Add the body measurements you want to use as a reference. Your profile gives the sizing conversation a more personal starting point.',
    detail: 'Start with the measurements that are relevant to the clothing you shop for.',
  },
  {
    number: '02',
    icon: Shirt,
    title: 'Choose a clothing category and brand',
    description: 'Select what you are shopping for, then choose a brand and a specific product to explore its sizing context.',
    detail: 'A shirt, a pair of trousers and a dress can each have different fit considerations.',
  },
  {
    number: '03',
    icon: ScanSearch,
    title: 'Compare with the product size chart',
    description: 'Consider how your profile relates to the available size information, along with the fit preference you choose.',
    detail: 'A size chart is a useful reference, but it does not describe every detail of a finished garment.',
  },
  {
    number: '04',
    icon: BadgeCheck,
    title: 'Receive a recommended size',
    description: 'See a suggested size and an explanation of how your profile and selected fit preference informed that result.',
    detail: 'Use the result as guidance. The feel of a garment can still vary by fabric and construction.',
  },
]

function HowItWorksPage() {
  return (
    <EditorialPageLayout
      eyebrow="THE FITMATE APPROACH"
      title={<>A few thoughtful steps<br />to a <em>clearer choice.</em></>}
      description="FITMATE brings your measurements, a product’s size information and the fit you prefer into one simple path through the sizing process."
      image="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85"
      imageAlt="Friends considering clothing styles while shopping"
      imageCaption="YOUR MEASUREMENTS, YOUR PREFERENCE, YOUR CHOICE"
    >
      <section className="how-process-section" aria-labelledby="how-process-heading">
        <div className="editorial-section-label"><span>01 — 04</span><Eyebrow>FROM PROFILE TO PRODUCT</Eyebrow></div>
        <div className="how-process-heading">
          <h2 id="how-process-heading">Four steps to a<br /><em>more informed fit.</em></h2>
          <p>Each step adds a little more context. The aim is not to make fit feel complicated, but to help you understand how a size suggestion was reached.</p>
        </div>
        <div className="how-steps-list">
          {steps.map(({ number, icon: Icon, title, description, detail }) => (
            <article className="how-step-row" key={number}>
              <span className="how-step-number">{number}</span>
              <span className="how-step-icon"><Icon size={20} strokeWidth={1.5} /></span>
              <div className="how-step-copy">
                <h3>{title}</h3>
                <p>{description}</p>
                <span>{detail}</span>
              </div>
              {number === '03' && <ChartNoAxesCombined className="how-step-end-icon" size={19} strokeWidth={1.4} aria-hidden="true" />}
            </article>
          ))}
        </div>
      </section>

      <section className="fit-preference-section" aria-labelledby="fit-preference-heading">
        <div className="fit-preference-copy">
          <Eyebrow>A PERSONAL PART OF THE PROCESS</Eyebrow>
          <h2 id="fit-preference-heading">Fit is more than<br /><em>a measurement.</em></h2>
          <p>Two people with similar measurements may want their clothes to feel different. Fit preference helps express that choice, whether you like a closer silhouette or more room to move.</p>
        </div>
        <div className="fit-preference-options" aria-label="Fit preference examples">
          {['Slim', 'Regular', 'Relaxed', 'Oversized'].map((preference, index) => (
            <Surface as="div" className={index === 1 ? 'fit-preference-option is-featured' : 'fit-preference-option'} key={preference}>
              <span>0{index + 1}</span><strong>{preference}</strong>
              <small>{['Closer to the body', 'An even balance', 'A little more ease', 'Extra room and volume'][index]}</small>
            </Surface>
          ))}
        </div>
      </section>

      <section className="how-ease-note">
        <span><ChartNoAxesCombined size={19} /></span>
        <div>
          <Eyebrow>SIZE CHARTS NEED CONTEXT</Eyebrow>
          <h2>A garment’s measurements are not the whole fit.</h2>
          <p>Finished garments may include ease: extra room or shaping added in the pattern. Fit can also depend on a garment’s intended cut, fabric stretch and construction. FITMATE’s goal is to help interpret size information alongside your preferences, not treat every measurement as a direct one-to-one match.</p>
        </div>
      </section>

      <section className="editorial-cta-band">
        <div><Eyebrow>READY WHEN YOU ARE</Eyebrow><h2>Start with your<br /><em>next favourite piece.</em></h2></div>
        <Button to="/find-my-size" icon={ArrowRight}>Find My Size</Button>
      </section>
    </EditorialPageLayout>
  )
}

export default HowItWorksPage