import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandWordmark, Button, Eyebrow } from './DesignSystem.jsx'
import MobileNav from './MobileNav.jsx'
import './EditorialPages.css'

function EditorialPageLayout({ eyebrow, title, description, image, imageAlt, imageCaption, children }) {
  return (
    <div className="editorial-page">
      <header className="editorial-header">
        <BrandWordmark to="/" />
        <nav className="editorial-nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
          <Button to="/signup" size="small" icon={ArrowUpRight}>Get Started</Button>
        </nav>
        <Link className="editorial-mobile-home" to="/">FITMATE home <ArrowRight size={14} /></Link>
        <MobileNav links={[{ to: '/', label: 'Home' }, { to: '/collections', label: 'Collections' }, { to: '/my-wardrobe', label: 'My Wardrobe' }, { to: '/find-my-size', label: 'Find My Size' }]} />
      </header>

      <main>
        <section className="editorial-hero">
          <div className="editorial-hero-copy">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <figure className="editorial-hero-image">
            <img src={image} alt={imageAlt} fetchPriority="high" />
            <figcaption>{imageCaption}</figcaption>
          </figure>
          <span className="editorial-hero-side-note">ONE BODY. EVERY BRAND. ONE PERFECT FIT.</span>
        </section>

        <div className="editorial-content">{children}</div>
      </main>

      <footer className="editorial-footer">
        <div className="editorial-footer-brand">
          <BrandWordmark to="/" />
          <p>One Body. Every Brand.<br />One Perfect Fit.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/about">About</Link>
          <Link to="/find-my-size">Find My Size</Link>
        </nav>
        <span className="editorial-footer-note">A more personal way to shop.</span>
      </footer>
    </div>
  )
}

export default EditorialPageLayout
