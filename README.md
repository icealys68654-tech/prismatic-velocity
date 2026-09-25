# Prismatic Velocity — Extreme-G Inspired 3D Racing Simulation

A browser-playable high-speed combat-racing prototype generated from the supplied **Prismatic Emergence** image.

## What is included

- 3D futuristic anti-gravity bike racing.
- Procedural roller-coaster track generated from a deterministic seed.
- The supplied image is hashed into the world seed.
- 64×64 / elemental-world concept is represented by the terrain + crystal field.
- Nitro, steering, acceleration, weapons, shields, AI riders, camera chase and bloom.
- PBR materials, ACES tone mapping, HDR-like bloom, fog, emissive geometry and dynamic lighting.
- Three.js **r186**, the current release visible in the Three.js GitHub releases page at the time this project was generated.
- Adapter boundaries for the requested `boa-bigapi-framework` and `HOLOCRON-Abstraction-SDK` repositories.

## Prismatic Neon Icosahedron Meshnet (New)

The repository now includes a high-performance **Prismatic Neon Icosahedron Core** meshnet architecture powered by PIN (Popping Interning NPU).

### Architecture Overview

Located in `src/meshnet/icosahedron-core.ts`, this module provides:

#### Geometric Core
- **20-sided Icosahedron Structure**: Golden ratio-proportioned vertices with 5.5-scale XYZ vectoring
- **Tri-Axis Refraction**: Three orthogonal circles (X, Y, Z axes) for geometric transformation
- **Isosceles Triangle Projection**: Refraction through tri-axis planes with plane-based projection

#### PIN (Popping Interning NPU) Architecture
```typescript
// Preloading & Offsetting
pinManager.preload(vertices)

// Offloading & Memory Mapping
pinManager.offload(key, data)

// Sort, Pull, Filter, Poll Operations
pinManager.sortPullFilterPoll(criteria)

// Packet Handling (Read/Write)
pinManager.handlePacket(packetData)

// Updates & Upgrades
pinManager.processUpdates()
```

#### CPU/NPU Workflow Integration
- **CPU Phase**: Sequential priority-based task execution
- **NPU Phase**: Parallel geometric acceleration and transformation
- **Workflow Engine**: Coordinates CPU and NPU processing with result merging

### Key Features

- **Vectored Coordinates**: All vertices offset by 5.5 scale factor for high-precision spatial representation
- **Hybrid Caching**: Memory-mapped, polling, and hybrid caching strategies
- **Packet Serialization**: Binary packet format with checksum validation for I/O operations
- **Geometric Acceleration**: NPU-based tri-axis refraction for real-time transformations

### Usage

```typescript
import { buildMeshnetCore } from './src/meshnet/icosahedron-core';

// Build the complete meshnet
const meshnet = buildMeshnetCore();

// Access components
const { vertices, faces, triAxisRefraction, workflow } = meshnet;

// Execute CPU/NPU workflow
const result = await workflow.executeWorkflow(inputData);
```

### Design by
**Jonathan R McKinney** — PIN Architecture Designer

## Run

Because browser modules are used, serve this directory over HTTP:

```bash
python -m http.server 8080
```

Then open:

`http://localhost:8080/`

Controls:

- `W/S` — accelerate / brake
- `A/D` — steer
- `Shift` — nitro
- `Space` — fire plasma projectile
- `R` — reset

## Repository integration

The two requested GitHub repositories could not be fetched from the build environment, so the project does **not** fabricate their API surface. See:

`src/integrations.js`

After making the repositories available, replace the adapter method bodies with their real imports/exports. The game already exposes the integration boundary:

```js
const boa = new BoaBigApiAdapter();
const holocron = new HolocronAbstractionAdapter();
```

## Design

The original Extreme-G series is characterized by very high-speed futuristic racing, looping/roller-coaster track layouts and weapon combat. This project uses those *gameplay concepts* while gener[...]

## Seed / provenance

```json
{
  "source_artifact": "seed.png",
  "algorithm_version": "1",
  "grid_resolution": "64x64",
  "generator": "Transmutation World / Prismatic Velocity"
}
```

The timestamp is provenance only; it does not affect terrain generation.
