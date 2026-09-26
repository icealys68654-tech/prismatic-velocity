# Prismatic Velocity

A deterministic world-generation engine paired with a browser-playable 3D racing prototype. The system transforms a visual artifact into a seeded elemental field, then renders that field as playable terrain.

**Artifact → Seed → Elemental Field → 3D World**

![Prismatic Velocity](seed.png)

## Core Design

This prototype implements the **Prismatic Emergence** transmutation model:

1. **Artifact as Question**: A visual seed (image) drives all generation.
2. **Deterministic Seed**: Image hash → reproducible RNG state. Same artifact always produces the same world.
3. **Elemental Field**: 64×64 grid where each cell holds an element (water, fire, earth, air) and derived terrain parameters.
4. **Terrain Generation**: Element pressures map to height, moisture, temperature, and material properties.
5. **Provenance**: Every generated world retains source artifact, seed, algorithm version, and grid resolution for reproducibility and inspection.

The racing game is a **rendering adapter** over this deterministic source model—not the primary system.

## Architecture

```
seed.png (artifact)
    ↓
seedFromImage() → deterministic seed
    ↓
generateSourceWorld() → 64×64 elemental grid
    ↓
terrain() → Three.js mesh with heights from pressures
    ↓
Playable world + bike racing
```

The world-source layer (`src/world-source.js`) is decoupled from rendering. It can be used independently for:
- Procedural map generation
- Level design tooling
- Network synchronization
- Offline world inspection

## Status

- **Implemented**: Deterministic artifact-to-seed hashing, 64×64 elemental field generation, height/material mapping, seeded crystal placement, and browser Three.js rendering.
- **CI/CD**: Green. GitHub Actions runs build and test on push and pull request.
- **Next**: Extended elemental rules (water flow, erosion, element interactions), testing harness for reproducibility across seeds, and optional Epic-Random-Maps deep integration.

Verification gates:
```bash
npm run build
npm test
```

## Quick Start

The project uses browser ES modules, so open it through a local HTTP server rather than directly from `file://`.

```bash
python -m http.server 8080
```

Open [http://localhost:8080/](http://localhost:8080/) in a WebGL-capable browser.

Any static HTTP server works. For example, with Node.js:

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

## API Usage

### Generate a Deterministic World

```javascript
import { generateSourceWorld } from "./src/world-source.js";

const world = generateSourceWorld({
  artifact: "seed.png",
  seed: 0x12345678,
  width: 64,
  height: 64,
});

console.log(world.provenance);
// {
//   source_artifact: "seed.png",
//   seed: 305419896,
//   algorithm_version: "1",
//   grid_resolution: "64x64",
//   generated_at: "2026-09-26T12:07:54.000Z",
//   generator: "Epic-Random-Maps / Prismatic Velocity"
// }

console.log(world.grid[32][32]);
// {
//   x: 32,
//   y: 32,
//   element: "earth",
//   elevation: 0.62,
//   pressures: { water: 0.21, fire: 0.18, earth: 0.68, air: 0.35 },
//   region: 7
// }
```

### Inspect Element Pressures

Each cell in the 64×64 grid maintains four elemental pressures that determine:

- **Water**: Low elevation, high moisture, cool thermal regions.
- **Fire**: High thermal pressure, rough terrain, boundary tension.
- **Earth**: Structural stability, mountain/plateau formation.
- **Air**: Elevated corridors, light transition zones.

The element is chosen by highest pressure. Pressures are inspectable at runtime for debugging or tooling.

### Render Adapter

`src/main.js` demonstrates a Three.js rendering adapter over the world-source. The adapter:
- Reads the 64×64 grid
- Maps element and elevation to mesh height
- Applies element colors to crystal decoration
- Preserves the racing loop and HUD as independent systems

You can swap the renderer without touching the world generation logic.

## Project Structure

```
.
├── index.html              # Entry point, HUD styles, import map
├── seed.png                # Visual artifact (hashed to produce seed)
├── project.json            # Project metadata
└── src/
    ├── main.js             # Three.js scene, bikes, track, racing loop
    ├── seed.js             # Image hashing, seed derivation
    ├── world-source.js     # Elemental field generation (core)
    ├── integrations.js     # BOA and HOLOCRON adapter bindings
    └── meshnet/            # (Future) Icosahedron mesh topology
```

## Determinism Contract

Same artifact + same seed → identical world.
Different seed → different world.

This is testable:

```javascript
const w1 = generateSourceWorld({ seed: 0x12345678 });
const w2 = generateSourceWorld({ seed: 0x12345678 });
console.assert(JSON.stringify(w1.grid) === JSON.stringify(w2.grid)); // true

const w3 = generateSourceWorld({ seed: 0x87654321 });
console.assert(JSON.stringify(w1.grid) === JSON.stringify(w3.grid)); // false
```

## Epic-Random-Maps Integration

This repo wires **Epic-Random-Maps** as the world-source layer. The transmutation model is shared:

- **Artifact gathering**: Extract visual evidence
- **Elemental generation**: Derive water/fire/earth/air pressures
- **Grid organization**: Classify cells into 64×64 modal grid
- **Provenance preservation**: Attach seed envelope to every generated world

Epic-Random-Maps can be extended with deeper agents (AIAgentGatherer, MeshGeneratorAgent, ModalGridAgent) without breaking the rendering adapter.

## Runtime Integration

`src/integrations.js` provides optional adapter boundaries for external systems:

- **BOA adapter** (`boa-bigapi-framework`): Game state workflow (view, input, model, packet, frame processing).
- **HOLOCRON adapter** (`HOLOCRON-Abstraction-SDK`): Item filtering and abstract state management.

Both are sandboxed and safe to fail. If unavailable, the game runs standalone.

## Browser Requirements

- WebGL 2 support
- JavaScript ES modules enabled
- Modern browser (Chrome, Firefox, Safari, Edge)
- Network access to fetch Three.js from jsDelivr (unless import map is modified)

## Development

```bash
npm install
npm run build
npm test
```

Tests validate determinism and provenance contracts. GitHub Actions runs the same commands on every push and pull request.

## License

GNU GENERAL PUBLIC LICENSE v3.0

## Related Work

- **Epic-Random-Maps**: Source design for elemental transmutation and world generation.
- **Prismatic Emergence**: Conceptual framework for artifact-driven content generation.
- **Three.js**: Browser rendering adapter.
