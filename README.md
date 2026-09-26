# Prismatic Velocity — Extreme-G Inspired 3D Racing Simulation

A browser-playable high-speed combat-racing prototype generated from the supplied Prismatic Emergence image.

## What is included

- 3D futuristic anti-gravity bike racing.
- Procedural roller-coaster track generated from a deterministic seed.
- The supplied image is hashed into the world seed.
- 64×64 / elemental-world concept is represented by the terrain + crystal field.
- Nitro, steering, acceleration, weapons, shields, AI riders, camera chase and bloom.
- PBR materials, ACES tone mapping, HDR-like bloom, fog, emissive geometry and dynamic lighting.
- Three.js r186.
- Adapter boundaries for the requested `boa-bigapi-framework` and `HOLOCRON-Abstraction-SDK` repositories.
- Active runtime wiring for both adapter boundaries through the main game loop, with fail-safe status telemetry.

## Prismatic Neon Icosahedron Meshnet

The repository includes a high-performance Prismatic Neon Icosahedron Core meshnet architecture powered by PIN (Popping Interning NPU).

### Architecture Overview

Located in `src/meshnet/icosahedron-core.ts`, this module provides:

#### Geometric Core
- 20-sided Icosahedron Structure: Golden ratio-proportioned vertices with 5.5-scale XYZ vectoring
- Tri-Axis Refraction: Three orthogonal circles (X, Y, Z axes) for geometric transformation
- Isosceles Triangle Projection: Refraction through tri-axis planes with plane-based projection

#### PIN (Popping Interning NPU) Architecture
```typescript
pinManager.preload(vertices)
pinManager.offload(key, data)
pinManager.sortPullFilterPoll(criteria)
pinManager.handlePacket(packetData)
pinManager.processUpdates()
```

#### CPU/NPU Workflow Integration
- CPU Phase: Sequential priority-based task execution
- NPU Phase: Parallel geometric acceleration and transformation
- Workflow Engine: Coordinates CPU and NPU processing with result merging

### Key Features
- Vectored Coordinates: All vertices offset by a 5.5 scale factor
- Hybrid Caching: memory-mapped, polling, and hybrid caching strategies
- Packet Serialization: binary packet format with checksum validation
- Geometric Acceleration: NPU-based tri-axis refraction for real-time transformations

## Runtime integration status

This project now includes active adapter integration rather than a passive placeholder boundary.

- `src/integrations.js` defines the BOA and HOLOCRON bridge adapters.
- `src/main.js` wires both adapters into the live frame loop.
- The runtime calls are throttled and fail-safe so render performance remains stable even if the external repositories are not installed or their APIs are not yet mapped.
- The HUD shows adapter health (`BOA`, `HOLOCRON`) in the status panel.

### Adapter behavior

The BOA adapter exposes a workflow-oriented bridge for game-state snapshots and prismatics-style compute payloads.
The HOLOCRON adapter exposes a runtime/filter pipeline bridge for simulation metadata and runtime control.

Both remain intentionally thin and stable so real imports can be substituted later without disturbing core gameplay logic.

## Run

Because browser modules are used, serve this directory over HTTP:

```bash
python -m http.server 8080
```

Then open:

`http://localhost:8080/`

Controls:
- W/S — accelerate / brake
- A/D — steer
- Shift — nitro
- Space — fire plasma projectile
- R — reset

## Repository integration

The project includes an explicit boundary for the requested GitHub repositories:

- `somsung46813-creator/boa-bigapi-framework`
- `somsung46813-creator/HOLOCRON-Abstraction-SDK`

The actual adapters currently operate as safe compatibility shims, and runtime wiring is intentionally resilient to missing or incomplete real imports. The architecture is ready to be replaced with direct library imports when those repository contracts are confirmed and available locally.

## Design

The original Extreme-G series is characterized by very high-speed futuristic racing, looping/roller-coaster track layouts and weapon combat. This project uses those gameplay concepts while generating a deterministic, image-derived world.

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
