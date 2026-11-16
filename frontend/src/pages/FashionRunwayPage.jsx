import { useState } from 'react'
import { Camera, ShieldCheck, Sparkles, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import SceneManager from '../three/SceneManager.jsx'
import './FashionRunwayPage.css'

const RUNWAY_MODELS = [
  {
    id: 'runway-anarkali',
    title: 'The Mughal Lotus 32-Kali Anarkali',
    atelier: 'Sabyasachi Heritage Couture',
    collection: 'Indian Haute Couture',
    fabric: 'Mysore Silk & Zari Brocade',
    fabricId: 'mysore-silk',
    silhouette: 'anarkali',
    gender: 'female',
    price: '₹1,85,000',
    colorVariant: '#983a40',
    description: 'An architectural 32-kali umbrella flare cascading gracefully from an empire bodice with hand-beaten gold zari border.',
    fittingRoute: '/virtual-fitting-room?audience=Women&category=Traditional%20wear&clothingType=Anarkali',
  },
  {
    id: 'runway-bandhgala',
    title: 'Imperial Velvet Bandhgala Tuxedo',
    atelier: 'The Men’s Sartorial House',
    collection: 'Haute Menswear',
    fabric: 'Zardozi Velvet',
    fabricId: 'zardozi-velvet',
    silhouette: 'bandhgala',
    gender: 'male',
    price: '₹95,000',
    colorVariant: '#4a1525',
    description: 'Structured high mandarin collar with floating canvas construction and raised gold thread embroidery on deep wine velvet.',
    fittingRoute: '/virtual-fitting-room?audience=Men&category=Traditional%20wear&clothingType=Bandhgala',
  },
  {
    id: 'runway-lehenga',
    title: 'Celestial Gold 24-Kali Bridal Lehenga',
    atelier: 'Royal Jaipur Atelier',
    collection: 'Bridal Couture',
    fabric: 'Banarasi Brocade & Raw Silk',
    fabricId: 'banarasi-silk',
    silhouette: 'lehenga',
    gender: 'female',
    price: '₹2,45,000',
    colorVariant: '#9b2438',
    description: 'Masterpiece 24-kali flare lehenga woven with floral supplementary-weft gold thread and hand-pleated waist ghera.',
    fittingRoute: '/virtual-fitting-room?audience=Women&category=Traditional%20wear&clothingType=Lehenga%20choli',
  },
  {
    id: 'runway-suit',
    title: 'Milano Sculpted Double-Breasted Suit',
    atelier: 'Via Montenapoleone Bespoke',
    collection: 'Western Runway',
    fabric: 'Fine Worsted Wool',
    fabricId: 'wool',
    silhouette: 'suit',
    gender: 'male',
    price: '₹1,40,000',
    colorVariant: '#22252a',
    description: 'Precision Italian double-breasted silhouette with peak lapels, roped shoulder expression, and tapered column trousers.',
    fittingRoute: '/virtual-fitting-room?audience=Men&category=Tops&clothingType=Blazer',
  },
]

export default function FashionRunwayPage() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [cameraAngle, setCameraAngle] = useState('front')
  const activeModel = RUNWAY_MODELS[selectedIdx]

  return (
    <div className="fashion-runway-universe">
      {/* 3D Runway Stage Canvas */}
      <div className="runway-canvas-container" aria-label="FITMATE 3D Fashion Runway Stage">
        <SceneManager
          sceneId="indianFashionWorld"
          sceneProps={{
            activePortalId: 'runway-hall',
            selectedGarment: {
              title: activeModel.title,
              category: 'Traditional wear',
              silhouette: activeModel.silhouette,
              fabricId: activeModel.fabricId,
              color: activeModel.colorVariant,
            },
            fabricId: activeModel.fabricId,
            customColor: activeModel.colorVariant,
            isRunwayMode: true,
            cameraView: cameraAngle,
          }}
        />
        <div className="runway-vignette-overlay" aria-hidden="true" />
      </div>

      {/* Floating Glassmorphism Runway Header */}
      <header className="runway-floating-header">
        <div className="runway-header-meta">
          <span className="runway-kicker">
            <Sparkles size={12} />
            THE FITMATE GRAND RUNWAY
          </span>
          <h1>Haute Couture Catwalk</h1>
        </div>
        <div className="runway-camera-bar" role="toolbar" aria-label="Runway Camera Perspectives">
          <span className="camera-label">
            <Camera size={13} />
            ANGLE:
          </span>
          {[
            { id: 'front', label: 'Front Catwalk' },
            { id: 'side', label: 'Side Profile' },
            { id: 'back', label: 'Train & Back' },
          ].map((cam) => (
            <button
              key={cam.id}
              type="button"
              className={`btn-camera-angle ${cameraAngle === cam.id ? 'is-active' : ''}`}
              onClick={() => setCameraAngle(cam.id)}
            >
              {cam.label}
            </button>
          ))}
        </div>
      </header>

      {/* Floating Active Garment Presentation Glass Card */}
      <aside className="runway-couture-card">
        <span className="card-collection-tag">{activeModel.collection}</span>
        <h2>{activeModel.title}</h2>
        <p className="card-atelier-name">{activeModel.atelier}</p>
        <p className="card-description">{activeModel.description}</p>

        <div className="card-specs-row">
          <div>
            <span className="spec-label">FABRIC</span>
            <strong className="spec-value">{activeModel.fabric}</strong>
          </div>
          <div>
            <span className="spec-label">EST. VALUE</span>
            <strong className="spec-value">{activeModel.price}</strong>
          </div>
        </div>

        <div className="card-actions-group">
          <Link to={activeModel.fittingRoute} className="btn-try-runway">
            <UserCheck size={16} />
            Try on in 3D Fitting Room
          </Link>
          <Link to="/find-my-size" className="btn-size-runway">
            <Sparkles size={14} />
            Find My Size
          </Link>
        </div>

        {/* Garment Selector Strip */}
        <div className="runway-models-selector" aria-label="Select Runway Model">
          <span className="selector-title">CATWALK LOOKS (4)</span>
          <div className="selector-pills-row">
            {RUNWAY_MODELS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                className={`runway-model-pill ${selectedIdx === idx ? 'is-active' : ''}`}
                onClick={() => setSelectedIdx(idx)}
              >
                <span className="pill-index">0{idx + 1}</span>
                <span className="pill-title">{item.title.split(' ')[1] || item.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="runway-footer-note">
          <ShieldCheck size={13} />
          <span>Real-time physically based fabric drape study · 360° interactive rotation supported</span>
        </div>
      </aside>
    </div>
  )
}
