import { ArrowLeft, Orbit } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandWordmark, Eyebrow } from '../components/DesignSystem.jsx'
import SceneManager from './SceneManager.jsx'
import './foundation-test.css'

export default function FoundationTestPage() {
  const [rendererReady, setRendererReady] = useState(false)
  return (
    <main className="foundation-test-page">
      <header className="foundation-test-header">
        <BrandWordmark to="/" />
        <Link to="/" aria-label="Return to FITMATE"><ArrowLeft size={15} /> FITMATE</Link>
      </header>
      <section className="foundation-test-intro" aria-labelledby="foundation-test-title">
        <Eyebrow>3D FOUNDATION · DEVELOPER PREVIEW</Eyebrow>
        <h1 id="foundation-test-title">Light, material <em>& reflection.</em></h1>
        <p>A responsive renderer check using Three.js PBR materials, a local studio environment, adaptive quality and Drei orbit controls.</p>
      </section>
      <section className="foundation-test-stage" aria-label="Interactive abstract 3D rendering test">
        <SceneManager sceneId="foundationTest" onReady={() => setRendererReady(true)} />
        <span className="foundation-test-stage-label">ABSTRACT LIGHTING TEST · NO GARMENT OR HUMAN MODEL</span>
      </section>
      <div className="foundation-test-notes">
        <span role="status"><i className="foundation-test-status" /> {rendererReady ? 'WEBGL RENDERER ACTIVE' : 'INITIALIZING WEBGL SCENE'}</span>
        <span><Orbit size={14} /> Drag or swipe to orbit · Pinch or scroll to zoom</span>
        <span>Champagne PBR · local environment reflections · responsive quality tier</span>
      </div>
    </main>
  )
}
