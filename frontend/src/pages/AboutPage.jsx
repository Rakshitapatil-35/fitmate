import { ArrowRight, Compass, Heart, Ruler } from 'lucide-react'
import { Button, Eyebrow, Surface } from '../components/DesignSystem.jsx'
import EditorialPageLayout from '../components/EditorialPageLayout.jsx'

function AboutPage() {
  return (
    <EditorialPageLayout
      eyebrow="A BETTER FIT, BY DESIGN"
      title={<>Finding your size<br /><em>should feel personal.</em></>}
      description="Clothing sizes can change from one label to the next. FITMATE is a student startup concept built around a simple idea: your fit should make sense wherever you shop."
      image="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85"
      imageAlt="Friends browsing clothing together in a fashion boutique"
      imageCaption="A MORE CONFIDENT WAY TO CHOOSE WHAT FITS"
    >
      <section className="editorial-intro-section">
        <div className="editorial-section-label"><span>01</span><Eyebrow>THE PROBLEM</Eyebrow></div>
        <div className="editorial-section-copy">
          <h2>One size label.<br /><em>Different realities.</em></h2>
          <p>A medium in one shop may feel very different from a medium in another. Sizing can vary with a brand’s patterns, intended silhouette, fabric and the way each item is made.</p>
          <p>That inconsistency makes it harder to shop online with confidence. It can mean second-guessing a choice, ordering multiple sizes, or finding that a piece simply does not feel right once it arrives.</p>
        </div>
      </section>

      <section className="editorial-origin-section">
        <div className="editorial-origin-image">
          <img
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1100&q=85"
            alt="Carefully arranged garments in a clothing store"
            loading="lazy"
          />
          <span>GOOD FIT IS PERSONAL</span>
        </div>
        <div className="editorial-origin-copy">
          <div className="editorial-section-label"><span>02</span><Eyebrow>WHY FITMATE</Eyebrow></div>
          <h2>Made for the space<br />between <em>you and the label.</em></h2>
          <p>FITMATE began with a familiar frustration: a size number on its own does not tell the whole story. We imagined a simpler starting point, one that considers a person’s measurements alongside the way different brands describe their sizing.</p>
          <p>Our goal is to help people make more informed clothing choices across brands, while keeping fit preference part of the conversation. FITMATE is a student startup concept exploring how that experience could feel clearer and more considered.</p>
        </div>
      </section>

      <section className="editorial-values-section" aria-labelledby="about-values-heading">
        <div className="editorial-values-heading">
          <Eyebrow>WHAT GUIDES THE IDEA</Eyebrow>
          <h2 id="about-values-heading">A more thoughtful<br /><em>fit experience.</em></h2>
        </div>
        <div className="editorial-values-grid">
          <Surface as="article" className="editorial-value-card">
            <span><Ruler size={19} /></span>
            <h3>Personal by nature</h3>
            <p>Start with the individual, not a universal idea of what a size should mean.</p>
          </Surface>
          <Surface as="article" className="editorial-value-card">
            <span><Compass size={19} /></span>
            <h3>Clear across brands</h3>
            <p>Make brand-to-brand sizing easier to navigate with a consistent point of reference.</p>
          </Surface>
          <Surface as="article" className="editorial-value-card">
            <span><Heart size={19} /></span>
            <h3>Confidence, not pressure</h3>
            <p>Support more comfortable choices without telling anyone how their body should look.</p>
          </Surface>
        </div>
      </section>

      <section className="editorial-mission-grid" aria-label="FITMATE mission and vision">
        <article className="editorial-mission-card">
          <Eyebrow>OUR MISSION</Eyebrow>
          <h2>Make cross-brand sizing feel <em>more understandable.</em></h2>
          <p>We want to give shoppers a clearer way to consider their measurements, product sizing and personal fit preferences together.</p>
        </article>
        <article className="editorial-vision-card">
          <Eyebrow>OUR VISION</Eyebrow>
          <h2>A world where shopping for clothes feels <em>more like you.</em></h2>
          <p>We imagine a future where people can explore different brands with less uncertainty and more room to choose what feels right to them.</p>
        </article>
      </section>

      <section className="editorial-cta-band">
        <div><Eyebrow>YOUR FIT STARTS WITH YOU</Eyebrow><h2>One Body. Every Brand.<br /><em>One Perfect Fit.</em></h2></div>
        <Button to="/find-my-size" icon={ArrowRight}>Find My Size</Button>
      </section>
    </EditorialPageLayout>
  )
}

export default AboutPage