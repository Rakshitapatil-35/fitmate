import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, RotateCcw, Shirt, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandWordmark, Eyebrow } from '../components/DesignSystem.jsx'
import { getReadySceneAsset } from '../three/assetManifest.js'
import { fabricPresets, getFabricPreset } from '../three/fabricMaterialLibrary.js'
import { garmentTypes, garmentViews } from '../three/garmentCatalog.js'
import { getGarmentAppearanceSupport } from '../three/applyGarmentAppearance.js'
import GarmentStudioCanvas from '../three/GarmentStudioCanvas.jsx'
import './garment-studio.css'

function GarmentStudioPage() {
  const [garmentId, setGarmentId] = useState('saree')
  const [fabricId, setFabricId] = useState('banarasi-silk')
  const [colorVariantId, setColorVariantId] = useState('')
  const [cameraView, setCameraView] = useState('front')
  const [zoom, setZoom] = useState('full')
  const [previewOnAvatar, setPreviewOnAvatar] = useState(false)
  const [avatarGender, setAvatarGender] = useState('female')
  const [motionEnabled, setMotionEnabled] = useState(false)

  const garment = garmentTypes.find((item) => item.id === garmentId) ?? garmentTypes[0]
  const asset = getReadySceneAsset(garment.assetId)
  const colorVariants = asset?.colorVariants ?? []
  const selectedFabric = getFabricPreset(fabricId)
  const appearanceSupport = getGarmentAppearanceSupport(asset, fabricId, colorVariantId)
  const avatarAssetId = avatarGender === 'female' ? 'femaleAvatar' : 'maleAvatar'
  const avatarAsset = getReadySceneAsset(avatarAssetId)
  const avatarCompatible = Boolean(asset && avatarAsset?.skeletonId && asset.compatibleAvatarRigs?.includes(avatarAsset.skeletonId))
  const canPreviewOnAvatar = Boolean(asset && avatarCompatible)
  const hasMotionClip = Boolean(asset?.motionClips?.garmentPreview)
  const hasFabricVariant = Boolean(asset?.fabricVariants?.includes(fabricId) && asset.fabricSlots?.length)
  const hasSelectedColor = Boolean(colorVariants.some((variant) => variant.id === colorVariantId))
  const setGarmentType = (nextId) => {
    setGarmentId(nextId)
    setColorVariantId('')
    setMotionEnabled(false)
    setPreviewOnAvatar(false)
  }

  const resetViewer = () => {
    setCameraView('front')
    setZoom('full')
  }

  return <div className="garment-studio-page">
    <header className="garment-studio-header"><BrandWordmark to="/" /><nav aria-label="Garment studio navigation"><Link to="/my-wardrobe">My Wardrobe</Link><Link to="/avatar-studio">Avatar Studio</Link><Link to="/">Showroom</Link></nav></header>

    <main className="garment-studio-main">
      <Link className="garment-back-link" to="/my-wardrobe"><ArrowLeft size={14} /> Return to your wardrobe</Link>
      <section className="garment-intro"><div><Eyebrow>FITMATE TEXTILE & CRAFT ATELIER</Eyebrow><h1>Material, <em>in motion.</em></h1><p>A reusable GLB garment viewer and PBR fabric library, ready for reviewed garment assets.</p></div><span><Sparkles size={20} /></span></section>

      <section className="garment-studio-layout" aria-label="Interactive garment and material studio">
        <aside className="garment-controls">
          <div className="garment-controls-heading"><span>01 / GARMENT LIBRARY</span><h2>Choose a silhouette.</h2><p>Each type has its own reviewed asset slot; models are never reused as stand-ins.</p></div>
          <label className="garment-select-label" htmlFor="garment-type">Garment type<select id="garment-type" value={garmentId} onChange={(event) => setGarmentType(event.target.value)}>{garmentTypes.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select></label>
          <div className="garment-slot-status" role="status"><span className={asset ? 'is-ready' : ''} />{asset ? 'REVIEWED GLB CONNECTED' : 'DISTINCT GARMENT GLB NOT SOURCED'}</div>
          <div className="garment-section-divider"><span>02 / MATERIAL LIBRARY</span><strong>15 surface presets</strong></div>
          <label className="garment-select-label" htmlFor="fabric-preset">Fabric study<select id="fabric-preset" value={fabricId} onChange={(event) => setFabricId(event.target.value)}>{fabricPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}</select></label>
          <div className="garment-preset-copy"><strong>{selectedFabric.label}</strong><p>{selectedFabric.note}</p><small>{hasFabricVariant ? 'Validated variant available for this garment.' : '3D swatch only; garment application requires a registered variant and fabric material slot.'}</small></div>
          <div className="garment-controls-divider"><span>GARMENT OPTIONS</span></div>
          <label className="garment-select-label" htmlFor="garment-colour">Colour variant<select id="garment-colour" value={colorVariantId} onChange={(event) => setColorVariantId(event.target.value)} disabled={!colorVariants.length}><option value="">{colorVariants.length ? 'Choose a registered colour' : 'No colour variants registered'}</option>{colorVariants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}</select></label>
          <label className={`garment-motion-toggle${hasMotionClip ? '' : ' is-pending'}`}><input type="checkbox" checked={motionEnabled} disabled={!hasMotionClip || previewOnAvatar} onChange={(event) => setMotionEnabled(event.target.checked)} /><span><strong>Authored cloth motion</strong><small>{hasMotionClip ? `GLB clip: ${asset.motionClips.garmentPreview}` : 'No garment animation is registered; no cloth simulation is running.'}</small></span></label>
          <label className="garment-select-label" htmlFor="avatar-preview-profile">Avatar preview<select id="avatar-preview-profile" value={avatarGender} onChange={(event) => setAvatarGender(event.target.value)}><option value="female">Female · average profile</option><option value="male">Male · average profile</option></select></label>
          <button type="button" className="garment-avatar-toggle" disabled={!canPreviewOnAvatar} aria-pressed={previewOnAvatar} onClick={() => setPreviewOnAvatar((value) => !value)}>{previewOnAvatar ? 'Return to garment view' : 'Preview on compatible avatar'}<ArrowUpRight size={13} /></button>
          {!canPreviewOnAvatar && <small className="garment-disabled-note">Requires both a registered garment GLB and a validated compatible avatar rig.</small>}
        </aside>

        <div className="garment-view-column">
          <div className="garment-viewer" aria-label={`3D ${garment.label} and fabric viewer`}>
            <GarmentStudioCanvas asset={asset} fabricId={fabricId} colorVariantId={colorVariantId} motionEnabled={motionEnabled && !previewOnAvatar} previewOnAvatar={previewOnAvatar} avatarAssetId={avatarAssetId} cameraView={cameraView} zoom={zoom} />
            <div className="garment-viewer-title"><span>THE FITMATE MATERIAL ATELIER</span><strong>{previewOnAvatar ? 'Avatar fitting preview' : garment.label}</strong></div>
            {!asset && !previewOnAvatar && <div className="garment-model-pending" role="status"><span className="garment-pending-mark"><Shirt size={19} /></span><Eyebrow>REAL GARMENT MODEL REQUIRED</Eyebrow><h2>{garment.label}<br /><em>asset not yet sourced.</em></h2><p>The visible object is a fabric material study only. No garment is being represented until this type has its own approved GLB.</p><small>{garment.world.toUpperCase()} · {garment.details.toUpperCase()}</small></div>}
            <span className="garment-viewer-hint">DRAG TO ROTATE 360° <i /> SCROLL TO ZOOM</span>
          </div>
          <div className="garment-view-toolbar">
            <div role="group" aria-label="Garment angle">{garmentViews.map((view) => <button key={view.id} type="button" className={cameraView === view.id ? 'is-active' : ''} aria-pressed={cameraView === view.id} onClick={() => setCameraView(view.id)}>{view.label}</button>)}</div>
            <div role="group" aria-label="Garment zoom"><button type="button" aria-pressed={zoom === 'full'} onClick={() => setZoom('full')}>Full view</button><button type="button" aria-pressed={zoom === 'detail'} onClick={() => setZoom('detail')}>Detail</button><button type="button" className="garment-reset-button" onClick={resetViewer} aria-label="Reset garment view"><RotateCcw size={13} /></button></div>
          </div>
          <div className="garment-status-strip" aria-live="polite"><span className="garment-status-light" /><div><strong>{asset ? 'GLB MODEL READY' : 'FABRIC SWATCH · NOT A GARMENT'}</strong><p>{asset ? (hasFabricVariant ? `Applying ${selectedFabric.label} to registered fabric slots.` : 'The selected preset is not registered as a variant for this garment.') : 'Procedural 3D fabric texture preview. Garment folds, seams and fit need a sourced model.'}</p></div></div>
        </div>
      </section>

      <section className="garment-information" aria-label="Garment asset information"><div className="garment-information-heading"><Eyebrow>GARMENT SPECIFICATION</Eyebrow><span>{garment.world}</span></div><div className="garment-info-grid"><article><small>MODEL STATUS</small><strong>{asset ? 'Reviewed asset connected' : 'Asset required'}</strong><p>{asset?.file ?? `No file registered for ${garment.label}.`}</p></article><article><small>GARMENT DETAILS</small><strong>{garment.label}</strong><p>{garment.details}</p></article><article><small>FABRIC SLOT</small><strong>{hasFabricVariant && appearanceSupport.fabric ? selectedFabric.label : 'Not registered'}</strong><p>{appearanceSupport.fabric ? 'Preset mapped to approved textile material slots.' : 'GLB must declare fabricVariants and fabricSlots.'}</p></article><article><small>COLOR VARIANTS</small><strong>{colorVariants.length ? `${colorVariants.length} registered` : 'Not registered'}</strong><p>{hasSelectedColor && appearanceSupport.color ? 'Selected variant applied to its declared material slot.' : 'This type has no reviewed color variants connected.'}</p></article><article><small>AVATAR COMPATIBILITY</small><strong>{avatarCompatible ? 'Validated rig available' : 'Not registered'}</strong><p>{avatarCompatible ? `Compatible with ${avatarAsset.skeletonId}.` : 'Garment fit is not inferred from the silhouette or material preset.'}</p></article></div><p className="garment-material-disclaimer">Fabric presets provide stylized PBR starting values and a procedural micro-weave study. They are not laboratory textile measurements. Embroidery, sequins, real weave/normal/roughness maps, sheerness and construction details require authored or licensed model textures and geometry.</p></section>
    </main>
  </div>
}

export default GarmentStudioPage
