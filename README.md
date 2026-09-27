# PRISMATIC EMERGENCE

**A deterministic world-and-game architecture for turning visual signals into reproducible worlds, game state, and spatial experiences.**

> **A seed is a question. The map is its answer.**

PRISMATIC EMERGENCE treats an artifact or visual signal as an input to a deterministic transformation system. The system gathers source information, generates elemental pressure, organizes that pressure into spatial structures, exposes game-domain contracts, and projects the resulting state into interactive experiences.

**Gather · Generate · Organize**

PRISMATIC EMERGENCE is a reusable game-domain architecture. Its twelve genre prototypes are framed as first-class game-domain expressions of the same deterministic substrate: Action, Platformer, Shooter, RPG, MMORPG, Action RPG, Strategy, RTS, TBS, Adventure, Visual Novel, and Puzzle. Each prototype specializes its mechanics while sharing the same world, contracts, runtime principles, provenance, and verification model.

## Architecture at a glance

```text
ARTIFACT / VISUAL SIGNAL
        │
        ▼
DETERMINISTIC SEED
        │
        ▼
ELEMENTAL PRESSURE
        │
        ▼
PARAMETERIZED MODAL GRID
        │
        ├──────────────► WORLD DATA / TERRAIN
        │
        ▼
GAME-DOMAIN CONTRACTS
        │
        ▼
DETERMINISTIC GAME STATE
        │
        ├──────────────► BOA PROJECTION
        ├──────────────► HOLOCRON PROJECTION
        └──────────────► APPLICATION RUNTIMES
                                │
                                ▼
                         SPATIAL RENDERING
                                │
                                ▼
                         PRISMATIC LIGHT
                                │
                                ▼
                         INTERACTIVE WORLD
                                │
                                ▼
                           CI VERIFICATION
```

The important boundary is that **world generation, game contracts, application runtimes, and rendering are separate concerns**.

## The Vectored Process

```text
110101011
    ↓
GATHER
    ↓
TRANSMUTATION CUBE
    ↓
DETERMINISTIC SEED
    ↓
ELEMENTAL PRESSURE FIELD
    ↓
MODAL GRID
    ↓
WORLD REPRESENTATION
    ↓
GAME CONTRACT
    ↓
RUNTIME STATE
    ↓
PRISMATIC LIGHT FIELD
    ↓
SPATIAL PROJECTION
    ↓
CI GATE
```

The process is intentionally inspectable. Each stage consumes structured data and produces a deterministic representation that can be tested independently.

## Core principles

### Determinism

The same artifact, seed, spatial dimensions, and algorithm version produce the same generated structures.

```js
const a = generateSourceWorld({
  artifact: "seed.png",
  seed: 0x12345678,
  width,
  height,
});

const b = generateSourceWorld({
  artifact: "seed.png",
  seed: 0x12345678,
  width: 64,
  height: 64,
});

console.assert(JSON.stringify(a.grid) === JSON.stringify(b.grid));
```

Different seeds are expected to produce different fields except where intentional collisions occur.

### Provenance

Generated structures retain information describing their origin, including source seed, algorithm version, spatial dimensions, generator identity, and source metadata.

### Inspectability

The elemental field is represented as explicit spatial elements rather than hidden renderer state. Cells expose coordinates, classification, elevation, elemental pressures, and region information.

### Separation of concerns

World generation does not depend on a particular game genre. Game contracts do not depend on a particular renderer. Rendering consumes runtime state rather than owning gameplay rules.

### Composability

The architecture allows an application to combine world data, a game contract, a runtime, and a renderer without turning any one application into the definition of the system.

## Architectural domains

PRISMATIC EMERGENCE is organized into four principal domains.

### 1. Deterministic world domain

The world domain transforms an artifact and seed into reproducible elemental spatial data.

Responsibilities:

- artifact and seed interpretation;
- deterministic water, fire, earth, and air pressure;
- modal-grid generation;
- element classification;
- elevation and material data;
- provenance and algorithm-version metadata.

Primary modules include:

- `src/seed.js`
- `src/world-source.js`
- `src/world-mesh.js`

The world domain produces reusable data. It does not decide what kind of game or application consumes that data.

### 2. Game-domain architecture

The game domain is the central architectural layer. It defines reusable contracts, deterministic sessions, genre mechanics, and the shared runtime model through which all twelve prototypes are framed.

Primary abstraction:

- `src/api/genre-framework.js`

The current contract catalog includes:

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

These twelve contracts form the current game-domain vocabulary of PRISMATIC EMERGENCE. They are deliberately parallel: no genre is the primary application, and no single prototype defines the architecture.

### 3. Runtime domain

The runtime domain converts the shared game contracts and inputs into deterministic state transitions for the twelve prototype forms.

Relevant boundaries include:

- `src/genre-prototype-runtime.js`
- `src/api/genres.js`
- `src/game-runtime.js`
- `src/player-controller.js`
- `src/input-controller.js`

The runtime owns state such as position, progression, actions, resources, encounters, choices, or other mechanics appropriate to a selected contract.

Each prototype runtime may specialize its mechanics while remaining anchored to the same portable game-domain contract.

### 4. Presentation domain

The presentation domain projects runtime state into visual and spatial experiences.

Relevant modules include:

- `src/runtime-renderer.js`
- `src/prismatic-light-field.js`
- `src/main.js`
- `src/genre-main.js`

Three.js is a presentation technology, not a gameplay authority.

The prismatic light field converts elemental pressure and runtime context into visual information:

```text
ELEMENTAL PRESSURE
        ↓
COLOR + INTENSITY
        ↓
PRISMATIC LIGHT FIELD
        ↓
PARTICLES / CRYSTALS / BLOOM
        ↓
SPATIAL EXPERIENCE
```

## Dependency direction

The architecture intentionally permits specialization at the edges while preserving reusable central contracts.

```text
                    PRISMATIC EMERGENCE
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   WORLD DOMAIN       GAME DOMAIN      PRESENTATION
          │                │                │
          │         genre contracts         │
          │                │                │
          └────────────┬───┴────┬───────────┘
                       │        │
                       ▼        ▼
                 APPLICATION RUNTIMES
                       │
                       ▼
                  USER EXPERIENCE
```

Constraints:

- the game framework must not depend on a specific application;
- the world generator must not depend on a specific game genre;
- rendering must consume runtime state rather than own game rules;
- adapters may translate external contracts but must not erase domain boundaries;
- an application may specialize the architecture without becoming the architecture.

## Genre-domain projections

The game-domain abstraction can project deterministic state through browser-safe adapters.

```text
GENRE CONTRACT
      │
      ▼
DETERMINISTIC GAME SESSION
      │
      ├──────────────► BOA
      │
      └──────────────► HOLOCRON
             │
             ▼
         GAME STATE
```

The project contains browser-side projections of the public contracts used from:

- [BOA BIG API Framework](https://github.com/somsung46813-creator/boa-bigapi-framework)
- [HOLOCRON Abstraction SDK](https://github.com/somsung46813-creator/HOLOCRON-Abstraction-SDK)

The adapters preserve the relevant public contracts without claiming that external Python runtimes or separate native execution environments run directly inside the browser.

## Twelve game-domain prototypes

The twelve prototypes are framed as first-class consumers of PRISMATIC EMERGENCE. Together they define a reusable spectrum of game-domain behavior built over the same deterministic world and runtime architecture:

| Prototype | Primary domain |
|---|---|
| Action | Reflex, movement, combat, obstacles |
| Platformer | Run, jump, platforming |
| Shooter | Aim, fire, encounters |
| RPG | Experience, levels, stats, quests |
| MMORPG | Persistent-world characters, quests, shared state |
| Action RPG | Real-time combat, progression, loot |
| Strategy | Planning, tactics, resources |
| RTS | Continuous time, bases, armies, resources |
| TBS | Turns, tactics, resource management |
| Adventure | Exploration, story, environmental puzzles |
| Visual Novel | Dialogue, artwork, choices |
| Puzzle | Logic, patterns, spatial problem solving |

All twelve prototypes share the same architectural substrate:

```text
                    PRISMATIC EMERGENCE
                           │
             ┌─────────────┴─────────────┐
             │                           │
        WORLD DOMAIN                 GAME DOMAIN
             │                           │
             └─────────────┬─────────────┘
                           ▼
                 GENRE PROTOTYPE RUNTIMES
                  /   /   |   \   \
                 /   /    |    \   \
            Action ... Strategy ... Puzzle
                           │
                           ▼
                    PRESENTATION LAYER
```

Each prototype specializes mechanics, state, controls, and presentation while preserving the same architectural contracts. The twelve prototypes are peers within the game domain; no individual prototype is the architectural center.

## Deterministic game sessions

The generic genre framework provides deterministic sessions:

```js
const session = createGenreSession({
  genre: "puzzle",
  id: "session-1",
});

session.dispatch({
  type: "advance",
  state: { score: 10 },
});

console.log(session.getState());
```

The framework exposes:

- genre contracts;
- supported mechanics;
- deterministic session creation;
- state transitions;
- BOA projection;
- HOLOCRON projection.

The twelve prototypes extend these contracts with genre-specific mechanics without changing the underlying world-generation architecture.

## World representation

The world generator constructs a parameterized modal grid whose dimensions are part of the generation input. The modal world is not bounded to a fixed resolution; its width, height, or other spatial dimensions may be selected according to the artifact, seed, algorithm version, and consuming game-domain prototype.

Each cell can carry:

- spatial coordinates appropriate to the generated dimensionality;
- grid or field indices when a discrete modal representation is used;
- elemental classification;
- water pressure;
- fire pressure;
- earth pressure;
- air pressure;
- elevation;
- material / region information.

The elemental pressures form the basis for terrain, visual composition, spatial interaction, and other game-specific interpretations.

The same deterministic world can therefore become twelve different prototype experiences without changing the source signal.

## Prismatic emergence

The central abstraction is a phase transformation:

```text
COLOR
  │
  ├──────────► ELEMENTAL PRESSURE
  │
GEOMETRY
  │
  ├──────────► SPATIAL STRUCTURE
  │
SPATIAL
  │
  └──────────► WORLD / GAME STATE
```

The transmutation cube is a conceptual boundary for gathering these signals, not a fixed spatial-resolution boundary. The generated seed becomes the reproducible identity of the resulting world.

**A seed is a question.  
The map is its answer.**

## Verification

The repository uses the same deterministic gates locally and in GitHub Actions:

```bash
npm install
npm test
npm run build
```

The CI workflow validates:

1. dependency installation;
2. deterministic reproducibility tests;
3. build integrity.

The tests cover the world generator, game contracts, runtime behavior, genre prototypes, integrations, traversal and prismatic systems.

A change is not considered complete merely because source code exists. The repository's actual CI gates must pass.

## Project structure

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
    ├── genre-prototype-runtime.js
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

## Quick start

Serve the browser application through HTTP:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

For repository verification:

```bash
npm install
npm test
npm run build
```

## Development loop

The project's `++1` / `1++` process is a deterministic development gate:

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

The purpose is to keep architecture, implementation, documentation, and verification synchronized.

## Status

PRISMATIC EMERGENCE is an evolving deterministic world-and-game architecture.

The repository currently contains:

- deterministic elemental world generation;
- provenance and reproducibility contracts;
- a reusable genre-domain abstraction;
- twelve genre contracts;
- deterministic genre sessions;
- independent runtime mechanics for all twelve genre prototypes;
- browser-safe BOA and HOLOCRON projections;
- reusable prismatic visual systems;
- shared spatial and presentation infrastructure;
- automated reproducibility and build gates.

The architecture is intentionally shared across all twelve game-domain consumers rather than centered on a single application.

## License

GNU General Public License v3.0.
