# Prismatic Velocity

Deterministic elemental world generation and a browser-playable 3D PC video-game prototype.

> **Status:** Genre API abstraction and architecture boundaries are implemented and verified by GitHub Actions.

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

## Architecture Boundaries

The project is organized into three deliberately separate domains. The **genre framework is an API abstraction**, not a replacement for the project's deterministic world generator or its racing-specific renderer.

```text
                         PRISMATIC VELOCITY
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
     WORLD GENERATION     GENRE / GAME API   RACING / RENDERING
             │                  │                  │
     artifact → seed      genre contracts      terrain mesh
     elemental pressure   game sessions        traversal route
     64×64 modal grid     BOA / HOLOCRON       player runtime
             │            projections           Three.js
             │                  │                  │
             └─────────── data/state ─────────────┘
```

### 1. Deterministic elemental world generation

This is the **world-source domain**. It transforms an artifact and seed into reproducible elemental data.

Responsibilities include:
- artifact / seed interpretation;
- deterministic water, fire, earth, and air pressure;
- 64×64 modal-grid generation;
- element classification;
- elevation and material data;
- provenance and algorithm-version metadata.

Primary modules:
- `src/seed.js`
- `src/world-source.js`

The genre framework does **not** generate or own this world. A genre implementation may consume world data when the application chooses to bind the two systems.

### 2. Browser-playable video-game genre framework

This is the **game-domain abstraction**. It describes reusable contracts for the supported video-game genres without assuming that every game is a racing game or even that a generated elemental world exists.

Primary abstraction:
- `src/api/genre-framework.js`

Supported contracts:
- Action
- Platformer
- Shooter
- RPG
- MMORPG
- Action RPG
- Strategy
- RTS
- TBS
- Adventure
- Visual Novel
- Puzzle

The framework provides:
- genre metadata and mechanics;
- deterministic game sessions;
- genre state transitions;
- BOA projection;
- HOLOCRON abstraction projection.

The browser-playable application can then select a concrete genre implementation. `src/api/genres.js` remains the project's current concrete gameplay implementation, while `genre-framework.js` defines the reusable contract boundary.

### 3. Racing-specific terrain, traversal, and renderer

The racing prototype is a **specialized consumer** of the other domains. Its terrain, traversal, player controls, runtime, and Three.js projection are not part of the generic genre framework.

Primary modules include:
- `src/world-mesh.js` — terrain mesh construction;
- `src/traversal.js` — deterministic route construction;
- `src/game-runtime.js` — runtime state boundary;
- `src/player-controller.js` — player motion;
- `src/input-controller.js` — browser input;
- `src/runtime-renderer.js` — runtime-to-render projection;
- `src/prismatic-light-field.js` — prismatic visual field;
- `src/main.js` — browser / Three.js application.

The racing prototype may use the genre contracts, but the generic genre framework must remain usable without importing racing terrain, traversal, or renderer code.

### Dependency direction

```text
GENRE FRAMEWORK
     │
     ├── BOA contract projection
     └── HOLOCRON contract projection

WORLD GENERATOR ────────► optional game/world data

RACING PROTOTYPE
     ├── world generator output
     ├── genre/game runtime
     ├── terrain + traversal
     └── Three.js renderer

Constraint:
genre-framework.js → must not depend on racing renderer
genre-framework.js → must not generate elemental worlds
racing renderer    → consumes runtime state; does not own game rules
```

This separation keeps the reusable game-genre API portable while preserving the project's specialized deterministic elemental-world and racing systems.
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

## Phase 13 — Independent Genre Runtime

The 12 browser genre prototypes now run through `src/genre-prototype-runtime.js`, an independent runtime boundary built on the genre game contracts. The racing-oriented `src/game-runtime.js` remains a specialized consumer and is no longer required to instantiate the generic genre prototypes.

Dependency direction:

```text
Deterministic World
       │
       ├──────────────► Genre Prototype Runtime ──► 12 Genre Prototypes
       │
       └──────────────► Racing Runtime ──► Racing Renderer
```

This makes the genre prototypes concrete applications of the PRISMATIC EMERGENCE architecture rather than alternate names for the racing implementation.

## Twelve Browser Genre Prototypes

Phase 12 adds a shared browser prototype surface at `genre.html`. It uses the same deterministic elemental world, traversal route, game runtime, and prismatic light field while giving each genre its own objective, input mapping, and 3D presentation.

| Prototype | Concrete focus |
|---|---|
| Action | arena movement, combat, obstacles |
| Platformer | vertical platforms and jumping |
| Shooter | target-field encounters and firing |
| RPG | exploration, quest progress, experience |
| MMORPG | persistent-world style beacons and character state |
| Action RPG | real-time combat plus progression |
| Strategy | territory, planning, resources |
| RTS | continuous bases, armies, resources |
| TBS | deterministic turn-based tactics |
| Adventure | exploration, landmarks, interaction |
| Visual Novel | narrative scenes and deterministic choices |
| Puzzle | pattern progression and spatial solving |

Open `genre.html?genre=<genre>` to launch a specific prototype. The prototype catalog and runtime live in `src/genre-prototypes.js` and `src/genre-main.js`; they consume the generic genre contracts rather than moving racing logic into the framework.


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

### Architecture verification

The genre abstraction and the shared genre-contract refactor have passed the repository CI gates. The architecture remains intentionally separated into world generation, generic genre/game API, and racing-specific terrain/traversal/rendering.

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
| Genre API | Implemented | Twelve genre contracts + BOA / HOLOCRON projection |
| Phase 12 | Implemented | Twelve browser genre prototypes; CI verification follows |

### Current verification

The Phase 12 genre-prototype changes are implemented and are being verified by the same repository gates:

```text
npm install
npm test
npm run build
```

The README distinguishes implemented architecture from CI-verified completion.
## Project Structure

```text
.
├── index.html
├── genre.html
├── seed.png
├── package.json
├── project.json
├── README.md
└── src/
    ├── main.js
    ├── genre-main.js
    ├── genre-prototypes.js
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


## Phase 14 — Genre-Specific Mechanics

Phase 14 is implemented and verified by GitHub Actions. The 12 browser prototypes now execute distinct deterministic mechanics inside `src/genre-prototype-runtime.js` rather than delegating gameplay state transitions to the racing game implementation.

The runtime separates action, platformer, shooter, RPG, MMORPG, action-RPG, strategy, RTS, TBS, adventure, visual-novel, and puzzle state transitions while continuing to consume the deterministic elemental world as a shared substrate.

**Status:** Phase 14 genre-specific mechanics are implemented and the real CI reproducibility/build gates are green.
