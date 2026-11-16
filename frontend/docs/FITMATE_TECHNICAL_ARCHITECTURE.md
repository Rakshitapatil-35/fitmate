# FITMATE technical architecture

## Purpose and current boundary

FITMATE is a React + Vite application with React Router, CSS design tokens, browser-local demo storage, fit recommendation demo data, and installed Three.js, React Three Fiber, Drei, and GSAP packages. The current 3D content is explicitly a procedural textile form study and an illustrative mannequin guide. Neither is a realistic garment, avatar, body scan, fit simulation, or production fashion world.

This architecture keeps those boundaries visible while preparing the application for licensed, reviewed GLB/GLTF assets and real product/catalog data. Asset-dependent scenes remain unavailable until their required models pass the asset acceptance process.

The reusable runtime now lives in `src/three/`: `SceneCanvas` configures the renderer, `SceneManager` selects a registered scene, `SceneLoader` and `SceneErrorBoundary` handle loading/failure states, and `ModelAsset` loads only approved manifest entries. The development-only `/dev/3d-foundation` route verifies PBR materials, local environment reflections, lighting, OrbitControls and responsive Canvas sizing with abstract test geometry.

## Proposed structure

The current app can migrate gradually; do not move all pages in one pass.

```text
src/
  app/
    AppRouter.jsx
    providers/
    layouts/
  components/
    ui/
    navigation/
    feedback/
  features/
    showroom/{pages,components,scenes}/
    fitting-room/{pages,components,scenes}/
    avatars/{components,scenes}/
    measurement-profile/{pages,components}/
    recommendations/{pages,components}/
    collections/{pages,data,worlds}/
    wardrobe/{pages,components}/
    theme-customizer/{components}/
  three/
    SceneCanvas.jsx
    SceneLoader.jsx
    SceneErrorBoundary.jsx
    ModelAsset.jsx
    assetManifest.js
    sceneQuality.js
    scene.css
  services/
    account/
    catalog/
    storage/
  data/                 # demo fixtures only
  animation/
  styles/
public/
  models/{environments,avatars,garments,accessories}/
  textures/
  hdri/
docs/
```

The current routes map to the future features as follows:

| Existing route(s) | Current page | Intended feature |
|---|---|---|
| `/` | `HomePage` | Grand showroom entry |
| `/collections`, `/indian-ethnic-wear` | `CollectionsPage` | Collection browsing; Indian fashion world is a separate asset-backed experience |
| `/diwali-edit` | `CollectionsPage` | Diwali catalog edit; immersive Diwali world is pending assets |
| `/lehenga-studio` | `CollectionsPage` | Lehenga catalog edit; dedicated 3D studio is pending garment/environment assets |
| `/western-wear`, `/womens-fashion` | `WesternFashionPage` | Western fashion catalog; 3D world pending assets |
| `/mens-fashion` | `WesternFashionPage` | Menswear catalog; 3D world pending assets |
| `/measurements`, `/my-fit-profile`, `/body-measurements` | `MeasurementProfilePage` | Measurement profile with illustrative guide |
| `/find-my-size`, `/product-details`, `/size-result`, `/recommendation-results` | Fit and product pages | Brand size selection and recommendation |
| `/my-wardrobe` | `MyWardrobePage` | Personal wardrobe backed by saved catalog items |
| `/login`, `/signup`, `/dashboard` | Auth/dashboard pages | Demo account flow today; API-backed account later |

## Dependencies

The project already has React, Vite, React Router, Three.js, React Three Fiber, Drei, GSAP and Lucide. Use those before considering additional runtime packages. GSAP should animate DOM transitions and interface elements; R3F should own scene object transforms. The existing GSAP reveal is lazy-loaded and respects reduced motion. Add `@gsap/react` only if its React-specific context cleanup becomes useful; it is not required for the current setup.

Drei's GLTF hook wraps the Three.js loader. Register an asset only when its source and license are reviewed, it is present in the model directory, and it passes runtime checks. The model component must not silently replace a missing asset with a primitive. See the [Drei GLTF loader](https://drei.docs.pmnd.rs/loaders/gltf-use-gltf) and [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) documentation.

## Page and component boundaries

- `app/` owns providers, route definitions, and shared layouts. Route elements stay lightweight and lazy-load large experiences.
- `features/` owns domain flows and page UI. Recommendation logic, catalog mapping, storage and account behavior should live outside scene meshes.
- `three/` owns shared Canvas defaults, device quality, loaders, error handling, and GLB instance rendering.
- Each world scene receives product/session data through props. It does not import page state, browser storage, or demo charts directly.
- The fitting-room camera supports 360-degree viewing. A camera orbit alone is not virtual fitting: actual fit requires compatible avatar and garment assets, mapped sizing data, and a validated fitting method.
- The theme customizer remains accessible HTML. It can update shared CSS variables and supported material variants without making essential controls available only inside WebGL.

## 3D asset strategy

Asset status is recorded in `src/three/assetManifest.js`. All required production entries currently have `status: 'required'`, `file: null`, and `license: 'not sourced'`. This is intentional: there are no approved production GLB/GLTF human, garment, or environment assets in the project yet.

Required asset classes:

1. Grand showroom and walk-in wardrobe environments.
2. Indian fashion, Diwali, Lehenga Studio, Western fashion, Men’s fashion and measurement studio environments.
3. Full-body male and female avatars with licensed use, consistent scale, documented proportions and an agreed rig/morph-target contract.
4. Actual catalog garments with real textile/trim materials, UVs, size/fit metadata and either compatible rigging or a defined garment fitting pipeline.

For every asset, record creator/source, license, file hash, dimensions, coordinate convention, triangle/texture budgets, supported variants, rig/morph capabilities, review status and target devices. Use GLB when a packaged model is appropriate. Validate material appearance, texture paths, scale, camera framing, accessibility fallback and performance before setting the manifest entry to `ready`.

The scene pipeline supports lazy model loading and a truthful “asset required” state. It does not create a human or garment from an image, primitive, name, or category.

## Performance, accessibility and failures

- Load one feature scene at a time and lazy-load its page, scene code and GLB dependencies.
- Use measured device tiers to cap pixel ratio and reduce antialiasing/shadows on constrained devices.
- Use demand rendering for static scenes; continuous frame loops are reserved for active animation or interaction.
- Compress GLB geometry and textures according to the chosen source asset and supported decoder path. Reuse loaded assets deliberately and dispose of scene-only GPU resources.
- Respect `prefers-reduced-motion` for GSAP and scene movement. Provide touch, keyboard and DOM control paths for important actions.
- Keep loading, model failure, WebGL unavailable, context loss, and retry states visible and accessible. Provide a 2D continuation for core tasks.
- Treat the current Vite warning for the large React Three Fiber chunk as a performance item. Measure before changing chunk thresholds.

## Implementation order

1. Establish shared scene runtime, quality tiers, loading/error fallbacks and the asset manifest.
2. Approve asset specifications and licensing before selecting or commissioning models.
3. Build the grand showroom with its real environment and garment assets.
4. Source/create avatars and establish validated body proportion and measurement mappings.
5. Build fitting-room product sessions against real garment assets and brand size data.
6. Build wardrobe viewing and then the Indian, Diwali, Lehenga, Western and Men’s worlds using reusable scene shells.
7. Connect account/catalog services in place of demo fixtures when a backend contract exists.
8. Validate responsive behavior, reduced motion, asset failures and loading/performance on target devices.

Do not describe the model-dependent stages as complete until the corresponding approved assets, data and flows exist.
