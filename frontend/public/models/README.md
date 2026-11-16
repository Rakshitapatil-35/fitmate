# FITMATE 3D model assets

No approved production GLB/GLTF assets are currently included in this directory.

Place reviewed models under `environments/`, `avatars/`, `garments/` or `accessories/`. Before registering a model as ready in `src/three/assetManifest.js`, record its source and license, validate its scale/materials/rig, optimize it for supported devices, and confirm it loads in the intended scene. Do not use primitive geometry or flat images as stand-ins for realistic humans or garments.

## Avatar studio integration

The avatar studio expects eight separately reviewed full-body GLBs: female and male profiles in slim, average, athletic and plus-size proportions. The average profile slots use `femaleAvatar` and `maleAvatar`; the other profile slots are listed in `src/three/assetManifest.js`. Register each model only after its license is recorded and its `modelHeightCm` and `skeletonId` are validated. The reference height is 170 cm; the viewer scales a registered profile to the selected height and does not infer body shape from height or measurements.

Avatar GLBs should include authored face, hair, skin, hands and feet materials plus named clips that include a supported pose term (`relaxed`/`idle`/`standing`, `editorial`/`fashionpose`/`pose`, or `walk`/`walking`/`runway`). The viewer uses compatible clips when present and reports when a requested pose is absent.

Garment assets must declare validated `compatibleAvatarRigs` and optional named `colorSlots` before they can be shown or recolored. A matching rig identifier is an integration check; it does not establish fit accuracy. Validate garment-to-body drape and fit separately before enabling fit or size claims. No avatar, garment, body scan or fit simulation asset is currently included.

## Garment and fabric studio integration

`src/three/garmentCatalog.js` defines 18 distinct garment types. Each maps to its own required GLB slot in `src/three/assetManifest.js`; register distinct, reviewed source files and licences rather than assigning one silhouette to unrelated garment types. Preserve GLTF PBR base-colour, normal, roughness and metallic-roughness maps. Add real embroidery/sequin meshes or authored maps for decorative details; the studio's procedural micro-weave is only a material study, not a replacement for textile scans or garment maps.

An asset may declare `fabricVariants`, `fabricSlots`, `colorVariants`, `colorSlots`, `compatibleAvatarRigs` and a `motionClips.garmentPreview` GLB clip. These are opt-in capabilities: the viewer does not apply a material, colour, avatar fit or cloth motion unless the corresponding metadata is registered and validated.

The default mobile path should use authored folds, skinning/morph targets and baked GLB motion. Live cloth simulation is not enabled. A mobile simulation experiment would need a coarse, pinned cloth lattice, bounded solver work, self-collision disabled by default, a device-quality gate and a static/baked fallback before release.
