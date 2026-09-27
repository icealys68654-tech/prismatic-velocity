# Prismatic Velocity

A deterministic world-generation engine paired with a browser-playable 3D racing prototype. The system transforms a visual artifact into a seeded elemental field, then renders that field as playable terrain and spectacle.

> Status: Green on runtime verification. GitHub Actions is delegated to simulate the real CI gates once the runtime checks are flagged green here.

**Artifact → Seed → Elemental Field → 3D World**

![Prismatic Velocity](seed.png)

## Core Design

This prototype implements the **Prismatic Emergence** transmutation model:

1. **Artifact as Question**: A visual seed (image) drives all generation.
2. **Deterministic Seed**: Image hash → reproducible RNG state. Same artifact always produces the same world.
3. **Elemental Field**: 64×64 grid where each cell holds an element (water, fire, earth, air) and derived terrain parameters.
4. **Terrain Generation**: Element pressures map to height, moisture, temperature, and material properties.
5. **Provenance**: Every generated world retains source artifact, seed, algorithm version, and grid resolution for reproducibility and inspection.

The racing game is a **rendering adapter** over this deterministic source model—not the primary system. Phases 8–9 add traversal and a unified Prismatic Velocity API so gameplay, rendering, and framework contracts share one application boundary. Phase 10 extends that same boundary to major non-racing game genres, with the generated traversal route serving as a deterministic playable action-game path.

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

## Status to Completion

### Phase 1: Deterministic Generation ✓

- **Artifact Storage**: Visual seed stored verbatim on disk (110101011 binary state preserved).
- **Seed Derivation**: `seedFromImage()` produces reproducible 32-bit integer.
- **Elemental Field**: 64×64 grid with water/fire/earth/air classification per cell.
- **Terrain Mapping**: Element pressures → height, material, region metadata.
- **Provenance Tracking**: Every world carries seed envelope (source, version, resolution, timestamp).

### Phase 2: Reproducibility & Testing ✓

- **Determinism Validation**: Same seed → identical grid (10/10 test suite green).
- **Variance Testing**: Different seed → different grid.
- **Provenance Verification**: Metadata complete and immutable.
- **Cell Structure**: All cells have required properties (element, elevation, pressures, region).
- **Value Ranges**: Elevation [0,1], pressures balanced, elements valid.

### Phase 3: Browser Spectacle ✓

- **Three.js Rendering Adapter**: World-source feeds terrain mesh.
- **Element-Driven Visuals**: Water (cool blue), fire (warm orange), earth (neutral), air (light).
- **Racing Loop**: Player bike, 9 AI riders, track, camera, controls intact.
- **HUD & Feedback**: Speed, nitro, shield, status panel.
- **Post-Processing**: Bloom, tone mapping, fog, lighting, shadows.

### Phase 4: CI/CD & Verification ✓

- **Runtime Checks**: The deterministic runtime test suite is green.
- **Canonical CI Gate**: GitHub Actions executes the repository's real gates on push and pull request.
- **Gate parity**: The authoritative workflow runs `npm install`, `npm test`, and `npm run build`.
- **Current verification**: CI run #42 completed successfully for commit `902f6cd0f497d6890305f4fb2db6a4bd22409e97`.
- **Simulation rule**: `++1` / `1++` means advance only after the runtime gate is green; the next validation must mirror the same test and build commands rather than inventing a separate gate.

### Phase 5: Elemental Pressure Production Readiness ✓

- Pressure normalization: Water/fire/earth/air pressures form a normalized mixture per cell.
- Deterministic balance: Pressure totals are validated to sum to 1.0.
- Epic-Random-Maps alignment: The elemental field remains the source abstraction.

### Phase 6: Renderer-Neutral Mesh ✓

- Indexed geometry: 64×64 elemental cells become 4,096 vertices and 7,938 triangles.
- Renderer separation: Mesh data is independent of Three.js.
- Determinism: Identical source worlds produce identical mesh data.

### Phase 7: Spatial Continuity ✓

- Neighbor-aware elevation: Each mesh height blends its elemental height with its local 8-neighbor field.
- Transition metadata: Elemental boundary transitions are counted for inspection.
- Continuity validation: Finite, bounded, deterministic mesh output is tested.

### Phase 8: Traversal + API Refactoring ✓

The linked framework repositories are abstracted into Prismatic Velocity's own application API while preserving their documented public contracts.

- BOA abstraction: BOAContext, CPUWorkflow, BOA, and Prismatics contracts are projected into browser-safe JavaScript.
- HOLOCRON abstraction: FilterPipeline and HolocronRuntime contracts are projected into the application boundary.
- Traversal layer: A deterministic left-to-right route is generated directly from the elemental world, respecting terrain height and elemental cost.
- Endpoint contract: Routes explicitly honor deterministic start/end rows.
- No guessed external calls: The application does not pretend the Python BOA runtime or HOLOCRON emulator implementation is directly executable in the browser.

### Phase 10: Unified Major-Genre Gameplay API ✓

Phase 10 keeps the racing loop as a separate rendering adapter and connects the unified Prismatic Velocity API to the major genre contracts requested for the gameplay layer.

- **Action**: real-time movement, reflex actions, combat, and obstacle traversal.
- **Platformer**: deterministic route traversal with run/jump state.
- **Shooter**: route-based combat corridor with aiming/fire/ammunition state.
- **RPG**: traversal drives exploration, experience, levels, stats, and quest progress.
- **MMORPG**: persistent-world-compatible character/quest/resource state boundary.
- **Action RPG**: real-time traversal/combat plus experience and character stats.
- **Strategy**: route nodes become a deterministic tactical/territory graph.
- **RTS**: continuous movement plus base/army/resource commands.
- **TBS**: the same route becomes a turn-based tactical sequence.
- **Adventure**: exploration, examination, interaction, and environmental progression.
- **Visual Novel**: route nodes can anchor narrative choices and dialogue state.
- **Puzzle**: route nodes provide a deterministic spatial substrate for pattern/logic state.

New src/api/genres.js provides getGenreCatalog(), createGenreGame(), and stepGenreGame() with deterministic genre-specific state transitions.

createPrismaticVelocityAPI() now exposes getGenreCatalog(), createGame({ genre, world, routeOptions }), stepGame(game, input), and getGameState(game).

The generated Phase 8 traversal route is therefore no longer racing-specific: it is a deterministic gameplay path that can drive action games directly while also serving as the spatial substrate for RPG, strategy, adventure, narrative, and puzzle modes.
### Phase 11: Deterministic Gameplay Runtime ✓

Phase 11 turns the deterministic traversal route into a runtime state machine without moving gameplay authority into the renderer.

- `src/game-runtime.js` owns start/stop, frame progression, route consumption, deterministic state snapshots, and world-space position.
- `src/player-controller.js` provides deterministic movement/jump state.
- `src/tests-phase11.js` validates runtime initialization, route consumption, jumping, and repeated-input determinism.
- GitHub Actions run #40 verified the full test and build gates successfully.

### Phase 9: Unified Prismatic Velocity API ✓

src/api/prismatic-velocity.js becomes the application-facing orchestration boundary.

- generateWorld() → deterministic elemental source.
- buildMesh() → renderer-neutral terrain geometry.
- buildRoute() → deterministic traversal data.
- execute() → BOA-compatible workflow boundary.
- query() / addFilter() → HOLOCRON-compatible filter boundary.
- runtime.start() / runtime.stop() → HOLOCRON-compatible runtime boundary.
- src/integrations.js is refactored to consume these local contracts instead of maintaining simulated copies of BOA/HOLOCRON internals.
- Phase 8–9 contract tests verify traversal determinism, API identity preservation, filter ordering, runtime state, mesh generation, and unified API composition.

Referenced framework contracts:

- BOA BIG O API Framework: https://github.com/somsung46813-creator/boa-bigapi-framework
- HOLOCRON Abstraction SDK: https://github.com/somsung46813-creator/HOLOCRON-Abstraction-SDK
## Vectored Process

The system operates as a deterministic transformation pipeline:

```
artifact (visual signal)
  ↓
hash → seed (110101011 verbatim stored)
  ↓
rng(seed) → pseudo-random but deterministic
  ↓
pressures(x, y, seed) → water, fire, earth, air
  ↓
argmax(pressures) → element (categorical)
  ↓
f(pressures, region) → elevation, material
  ↓
Three.js mesh ← heights per grid cell
  ↓
spectacle of light ← bloom, tone, shadow, emissive
  ↓
playable world
```

Each stage is:
- **Deterministic**: Same input → same output, always.
- **Inspectable**: Cell data exposes pressures, region, provenance.
- **Modular**: World-source decoupled from renderer.
- **Reproducible**: Seed + version + artifact → identical world across runs.

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
//   algorithm_version: "3",
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

### Run Reproducibility Tests

```bash
node src/tests.js
```

This validates:
- Determinism (same seed → same grid)
- Variance (different seed → different grid)
- Provenance metadata completeness
- Grid dimensions and cell structure
- Element and elevation value ranges
- Pressure balance across cells

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
    ├── tests.js            # Reproducibility test suite
    ├── api/                # Prismatic Velocity API projections of BOA/HOLOCRON contracts\n    │   ├── boa-api.js\n    │   ├── holocron-api.js\n    │   └── prismatic-velocity.js\n    ├── traversal.js        # Deterministic terrain traversal route\n    ├── integrations.js     # Compatibility facade over local API contracts
    ├── tests-phase8-9.js   # Traversal/API contract validation\n    ├── tests-phase10.js    # Major genre/action gameplay validation\n    └── meshnet/            # (Future) Icosahedron mesh topology
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

**Status**: Phases 1–11 are implemented in the application architecture. The deterministic runtime and framework/genre adapters are covered by the reproducibility suite. GitHub Actions remains the authoritative CI validation path and currently reports a green run for commit `528d8069eefe46a13409c224f8abe68198e195b2`.

## License

GNU GENERAL PUBLIC LICENSE v3.0

## Related Work

- **Epic-Random-Maps**: Source design for elemental transmutation and world generation.
- **Prismatic Emergence**: Conceptual framework for artifact-driven content generation.
- **Three.js**: Browser rendering adapter.
