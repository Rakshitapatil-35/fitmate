import { Clone, Html, useGLTF } from '@react-three/drei'
import { getReadySceneAsset } from './assetManifest.js'

function UnavailableAsset({ assetId }) {
  return (
    <Html center>
      <div className="fm-asset-pending" role="status">
        <span>3D ASSET REQUIRED</span>
        <strong>{assetId}</strong>
        <p>No approved model is registered for this scene yet.</p>
      </div>
    </Html>
  )
}

function LoadedAsset({ asset, ...transform }) {
  const gltf = useGLTF(asset.file)
  return <Clone object={gltf.scene} {...transform} />
}

export default function ModelAsset({ assetId, ...transform }) {
  const asset = getReadySceneAsset(assetId)
  if (!asset) return <UnavailableAsset assetId={assetId} />
  return <LoadedAsset asset={asset} {...transform} />
}
