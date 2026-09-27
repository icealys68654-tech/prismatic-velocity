# Prismatic Velocity

Deterministic elemental world generation and a browser-playable 3D racing prototype.

> **Status:** The genre API abstraction is implemented; GitHub Actions remains the authoritative CI gate for completion.

**Genre Contract → BOA / HOLOCRON Projection → Game Session**  
**Artifact → Seed → Elemental Pressure → Terrain → Runtime → Prismatic Light → 3D World**

## Concept

**Prismatic Emergence** treats a visual artifact as a question and a generated world as its answer.

A seed drives a deterministic 64×64 elemental field. Each cell exposes water, fire, earth, and air pressure, which becomes terrain, traversal data, gameplay state, and finally a Three.js spectacle of light.

The design principle is:

> **Gather · Generate · Organize**

The artifact is preserved as the source signal; the generated structures remain inspectable and reproducible.

## Vectored Process

```text
110101011
    ↓
ARTIFACT / VISUAL SIGNAL
    ↓
DETERMINISTIC SEED
    ↓
ELEMENTAL PRESSURE FIELD
    ↓
64×64 MODAL GRID
    ↓
TERRAIN + MESH
    ↓
TRAVERSAL ROUTE
    ↓
GAME RUNTIME
    ↓
PRISMATIC LIGHT FIELD
    ↓
THREE.JS / BLOOM / CRYSTALS
    ↓
CI VERIFICATION
```

The runtime owns gameplay state. Rendering projects that state into the scene. CI verifies the deterministic contracts.

## Architecture

```text
seed.png
   │
   ▼
seedFromImage()
   │
   ▼
generateSourceWorld()
   │
   ├── elemental pressures
   ├── element classification
   ├── elevation / material
   └── provenance
   │
   ▼
buildWorldMesh()
   │
   ▼
buildTraversalRoute()
   │
   ▼
createGameRuntime()
   │
   ├── input normalization
   ├── deterministic frame state
   └── route consumption
   │
   ▼
reactPrismaticLightField()
   │
   ▼
Three.js renderer
```

## Core Contracts

### Determinism

Same artifact + same seed + same algorithm version produces the same generated world.

```js
const a = generateSourceWorld({ seed: 0x12345678 });
const b = generateSourceWorld({ seed: 0x12345678 });

console.assert(JSON.stringify(a.grid) === JSON.stringify(b.grid));
```

Different seeds are expected to produce different generated fields except for intentional collisions.

### Provenance

Generated worlds carry their source seed, algorithm version, grid resolution, generator identity, and source artifact metadata.

### Renderer separation

World generation, traversal, and gameplay state do not depend on Three.js. The renderer consumes deterministic runtime state and projects it into the browser scene.

## Genre API Abstraction

The genre framework is intentionally separate from deterministic elemental world generation and the browser racing prototype. It provides a portable API contract for twelve supported game genres and projects genre state through the browser-safe BOA and HOLOCRON adapters.

| Genre | Family | Contract focus |
|---|---|---|
| Action | Action | Reflex, movement, combat, obstacles |
| Platformer | Action | Run, jump, platforming |
| Shooter | Action | Aim, fire, encounters |
| RPG | Role-playing | Experience, levels, stats, quests |
| MMORPG | Role-playing | Persistent world, characters, shared state |
| Action RPG | Role-playing | Real-time combat, progression, loot |
| Strategy | Strategy | Planning, tactics, resources |
| RTS | Strategy | Continuous time, bases, armies |
| TBS | Strategy | Turns, tactics, resource management |
| Adventure | Adventure | Exploration, story, environmental puzzles |
| Visual Novel | Adventure | Dialogue, artwork, choices |
| Puzzle | Puzzle | Logic, patterns, spatial problem solving |

The framework lives in `src/api/genre-framework.js`. It exposes genre contracts, deterministic sessions, and BOA / HOLOCRON projection without importing world generation, traversal, or racing code.

```text
GENRE CONTRACT
      ↓
DETERMINISTIC GAME SESSION
      ↓
   ┌──┴─────────────┐
   ↓                ↓
 BOA            HOLOCRON
   ↓                ↓
   └──── GAME STATE ┘
```

The existing `src/api/genres.js` remains the concrete gameplay implementation for the project prototype. The new framework is the reusable abstraction boundary for other game implementations.

### Explicit boundary

The genre framework does **not** abstract or replace:

- deterministic elemental world generation;
- the browser-playable 3D racing prototype;
- the generated terrain, traversal, or racing renderer.

Those remain project-specific systems and can consume the genre contracts without becoming dependencies of them.

## Gameplay Runtime

The runtime is built around a deterministic traversal route.

- **Action / racing:** real-time route traversal and player actions.
- **Platformer / shooter:** the same spatial route provides movement and action state.
- **RPG / MMORPG / action RPG:** route nodes provide deterministic exploration and progression state.
- **Strategy / RTS / TBS:** route cells provide a deterministic tactical substrate.
- **Adventure / visual novel:** route nodes can anchor exploration and narrative state.
- **Puzzle:** route geometry provides a deterministic spatial substrate.

The genre layer is exposed through `src/api/genres.js`, while `src/game-runtime.js` remains the runtime state boundary.

## Prismatic Light

The current light system converts elemental pressure into deterministic RGB values and projects sampled points into the scene.

Phase 11.4 adds runtime reaction:

```text
RUNTIME POSITION
      ↓
PROXIMITY FIELD
      ↓
LIGHT INTENSITY
      ↓
ADDITIVE POINT LIGHT
      ↓
BLOOM / SPECTACLE
```

The light field is visual state; gameplay authority remains in the runtime.

### Genre abstraction gate

The next verification gate is the repository CI run for the genre framework changes. Completion requires `npm install`, `npm test`, and `npm run build` to pass on the resulting commit.

## Framework Boundaries

The project contains browser-safe application projections of the public contracts needed from:

- [BOA BIG API Framework](https://github.com/somsung46813-creator/boa-bigapi-framework)
- [HOLOCRON Abstraction SDK](https://github.com/somsung46813-creator/HOLOCRON-Abstraction-SDK)

The application does not claim that the Python BOA runtime or a separate HOLOCRON emulator executes directly inside the browser. Their contracts are isolated behind local adapters.

## Status to Completion

| Phase | State | Verified gate |
|---|---|---|
| 1–7 | Complete | Deterministic generation, pressure field, mesh, continuity |
| 8–9 | Complete | Traversal and unified API contracts |
| 10 | Complete | Major genre gameplay contracts |
| 11 | Complete | Deterministic gameplay runtime |
| 11.2 | Complete | Input + renderer bridge |
| 11.3 | Complete | Deterministic prismatic light field |
| 11.4 | Complete | Runtime-reactive prismatic light |
| 11.5 | Implemented | Vectorized light flow |
| Genre API | Implemented | Twelve genre contracts + BOA / HOLOCRON projection; CI pending for current changes |

### Current verification

The preceding verified gate was Phase 11.4. Phase 11.5 also has successful GitHub Actions runs in the repository history. The new genre-framework changes are **pending their own CI verification** and are not marked complete until the current commit passes the same gates.

```text
npm install
npm test
npm run build
```

The README deliberately separates implemented code from verified completion.
## Project Structure

```text
.
├── index.html
├── seed.png
├── package.json
├── project.json
├── README.md
└── src/
    ├── main.js
    ├── seed.js
    ├── world-source.js
    ├── world-mesh.js
    ├── traversal.js
    ├── game-runtime.js
    ├── player-controller.js
    ├── input-controller.js
    ├── runtime-renderer.js
    ├── prismatic-light-field.js
    ├── integrations.js
    ├── api/
    │   ├── genre-framework.js
    │   ├── boa-api.js
    │   ├── holocron-api.js
    │   ├── prismatic-velocity.js
    │   └── genres.js
    ├── adapters/
    │   ├── boa-prismatics-adapter.js
    │   ├── holocron-adapter.js
    │   └── genre-adapters.js
    └── tests*.js
```

## Quick Start

The browser application uses ES modules and should be served through HTTP.

```bash
python -m http.server 8080
```

Open `http://localhost:8080/` in a WebGL-capable browser.

For repository verification:

```bash
npm install
npm test
npm run build
```

GitHub Actions runs the same gates on pushes to `main` and pull requests.

## Controls

| Key | Action |
|---|---|
| `W` | Accelerate |
| `S` | Brake |
| `A` / `D` | Steer |
| `Left Shift` | Nitro |
| `Space` | Fire |
| `R` | Reset |

## Deterministic API Example

```js
import { generateSourceWorld } from "./src/world-source.js";

const world = generateSourceWorld({
  artifact: "seed.png",
  seed: 0x12345678,
  width: 64,
  height: 64,
});

console.log(world.provenance);
console.log(world.grid[32][32]);
```

Each cell exposes coordinates, element classification, elevation, elemental pressures, and region metadata.

## Development Rule

The `++1` / `1++` process means:

```text
CONFIRM CURRENT CHANGES
        ↓
ABSTRACT THE NEXT BEST STEP
        ↓
IMPLEMENT
        ↓
RUN THE SAME REAL CI GATES
        ↓
IF GREEN → UPDATE README STATUS
        ↓
CONTINUE
```

No phase is marked complete merely because code exists. Completion requires the repository's real runtime and build gates to pass.

## License

GNU General Public License v3.0.
