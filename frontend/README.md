# FITMATE

FITMATE is a React + Vite fashion fit platform prototype. Its product direction is a premium 3D fashion experience built around the tagline “One Body. Every Brand. One Perfect Fit.”

## Development

```sh
npm install
npm run dev
```

Available project checks:

```sh
npm run lint
npm run build
npm run preview
```

## Current implementation boundary

This repository contains route-based fit and collection demos, browser-local profile/wardrobe storage, a procedural 3D textile form study, and an illustrative mannequin guide. The procedural scene is not a realistic garment; the mannequin is not a body scan or fit simulation. Production fashion worlds, full-body avatars, and garment models require reviewed, licensed GLB/GLTF assets that are not yet included.

See [the technical architecture](docs/FITMATE_TECHNICAL_ARCHITECTURE.md) for route mapping, scene boundaries, asset requirements, performance guidance and implementation order. The [3D asset directory guide](public/models/README.md) describes the review gate for adding models.
