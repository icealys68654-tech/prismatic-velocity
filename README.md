# Prismatic Velocity

A browser-playable, high-speed 3D combat-racing prototype inspired by futuristic arcade racers and generated from a prismatic world seed.

![Prismatic Velocity](seed.png)

## Highlights

- Fast anti-gravity bike racing on a deterministic, looping roller-coaster track.
- Procedural terrain, crystal fields, starfield, emissive materials, fog, dynamic lighting, shadows, ACES tone mapping, and Unreal-style bloom.
- Player bike, nine AI riders, chase camera, plasma projectiles, nitro, shield HUD, and reset support.
- Three.js `0.186.0`, loaded in the browser through an import map—no bundler or package installation is required.
- The supplied `seed.png` is hashed by `src/seed.js` and used to derive the world seed.
- A 64×64 provenance/grid concept is retained in the generated-world metadata.
- Runtime adapter boundaries for `boa-bigapi-framework` and `HOLOCRON-Abstraction-SDK`, with safe local compatibility implementations.

## Quick start

The project uses browser ES modules, so open it through a local HTTP server rather than directly from `file://`.

```bash
python -m http.server 8080
```

Open [http://localhost:8080/](http://localhost:8080/) in a WebGL-capable browser.

Any static HTTP server can be used. For example, with Node.js tooling already available:

```bash
npx serve .
```

No `npm install` step is needed: Three.js is referenced from jsDelivr in `index.html`.

## Controls

| Key | Action |
| --- | --- |
| `W` | Accelerate |
| `S` | Brake |
| `A` / `D` | Steer |
| `Left Shift` | Use nitro while moving |
| `Space` | Fire a plasma projectile |
| `R` | Reset the player state |

## Project structure

```text
.
├── index.html          # HUD, styles, import map, and application entry point
├── seed.png            # Source artifact used to derive the deterministic seed
└── src/
    ├── main.js         # Three.js scene, track, bikes, input, animation, and HUD
    ├── seed.js         # Image hashing and seed/provenance helpers
    ├── integrations.js  # BOA and HOLOCRON compatibility adapters
    └── meshnet/
        └── icosahedron-core.ts  # Prismatic icosahedron/PIN meshnet module
```

## Runtime integration

`src/integrations.js` contains thin, fail-safe compatibility adapters rather than hard dependencies on external repositories.

### BOA adapter

`BoaBigApiAdapter` exposes:

- `gather()` for a staged game-state workflow covering view, input, sequencing, modeling, packet, and frame processing.
- `compute()` for pitch, roll, vertex indexing, and scatter operations.

### HOLOCRON adapter

`HolocronAbstractionAdapter` exposes:

- `abstract()` for filtering items and preparing simulated core ABI, WebGL, and gamepad connector state.
- `addFilter()`, `start()`, and `stop()` for runtime coordination.

`IntegrationCoordinator` provides the higher-level interface used by `src/main.js`. Adapter calls are throttled to every sixth animation frame and status is shown in the HUD. If an eventual integration with the real SDKs is needed, these boundaries can be replaced without changing the core racing loop.

The referenced external projects are:

- `somsung46813-creator/boa-bigapi-framework`
- `somsung46813-creator/HOLOCRON-Abstraction-SDK`

They are not installed or required to run this prototype.

## Determinism and provenance

The track and world decoration use the image-derived seed. Runtime timestamps are logged as provenance only and do not affect terrain generation.

```json
{
  "source_artifact": "seed.png",
  "algorithm_version": "1",
  "grid_resolution": "64x64",
  "generator": "Transmutation World / Prismatic Velocity"
}
```

## Browser requirements

Use a current browser with WebGL 2 support and JavaScript modules enabled. The initial load requires network access to fetch Three.js from jsDelivr unless the import map is changed to a local copy.

## Development notes

This is an experimental visual prototype. There is currently no build pipeline, automated test suite, or server-side component. The application runs entirely in the browser; game state is not persisted between sessions.

## License

No license has been declared for this repository yet. Treat the code and assets as all rights reserved unless the repository owner specifies otherwise.
