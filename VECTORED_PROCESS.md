# Vectored Process: Artifact → Spectacle of Light

A deterministic transmutation workflow for turning a visual artifact into a playable 3D world.

## The Signal Chain

```
artifact (visual signal, stored verbatim: 110101011)
  ↓
seedFromImage() → hash bytes → 32-bit seed (deterministic, reproducible)
  ↓
rng(seed) → seeded random generator (no external randomness after seed established)
  ↓
for each cell (x, y) in 64×64 grid:
  ↓
  pressures(x, y, seed):
    - basin(x, seed) → spatial structure
    - ridges(y, seed) → directional bias
    - contour(x, y, seed) → combined gradient
    ↓
    water_pressure   = 0.26 + (1-ny)*0.42 + (1-basin)*0.24 + rng()*0.18
    fire_pressure    = 0.22 + (1-contour)*0.28 + (1-ridges)*0.22 + rng()*0.20
    earth_pressure   = 0.28 + basin*0.46 + ridges*0.40 + rng()*0.12
    air_pressure     = 0.18 + (nx*0.42 + ny*0.28) + contour*0.34 + rng()*0.14
  ↓
  element = argmax(water, fire, earth, air)
  ↓
  elevation = clamp(earth*0.62 + air*0.32 - water*0.38 + fire*0.22 + rng()*0.12, 0, 1)
  ↓
  region = floor((x/8) + (y/8) + rng()*2) % 12
  ↓
  cell = { x, y, element, elevation, pressures, region }
  ↓
grid[64][64] → heightfield → terrain mesh
  ↓
Three.js scene:
  - map element → color (water: 0x2ab7ff, fire: 0xff6b3d, earth: 0x7b8b5a, air: 0xd9efff)
  - map elevation → vertex height (0-120 units)
  - apply element-specific modifiers (water: -52, fire: +26, air: +18)
  ↓
post-processing:
  - Unreal bloom pass (1.35, 0.65, 0.16)
  - ACES filmic tone mapping (1.15 exposure)
  - Exponential fog (density 0.00075)
  - PCF soft shadows
  - Dynamic directional light + hemisphere light
  ↓
spectacle of light ← racing loop, camera, HUD, controls
  ↓
playable world
```

## Stages

### 1. Artifact Storage (Canon)
- Visual seed stored verbatim as binary: `110101011` (byte sequence preserved)
- File: `seed.png`
- Function: `seedFromImage(url)` → reads as Uint8Array, hashes without loss

### 2. Seed Derivation
- Hash algorithm: FNV-1a (32-bit)
- Deterministic: Same bytes always produce same seed
- Function: `seedFromImage("./seed.png")` → `0xHEXVALUE`
- Property: No runtime variation; external to RNG

### 3. Elemental Pressure Field
- Grid: 64×64 cells
- Per-cell computation:
  - Sine-based basin/ridge/contour modulation
  - 4 pressure potentials (water, fire, earth, air)
  - Seeded random perturbation at each cell
  - Region classification (12 regions, spatially coherent)
- Result: Inspectable, deterministic cell data

### 4. Element Selection
- Rule: `element = argmax(pressures)`
- No isolation penalty; highest pressure wins
- Fallback: Earth (most stable)
- Result: 1 categorical label per cell

### 5. Elevation Derivation
- Composite formula: `elevation = weighted_sum(pressures) + noise`
- Scaled to [0, 1]
- No erosion pass; deterministic single-evaluation
- Modifiers applied at render time (element-specific height shifts)

### 6. Terrain Mesh Generation
- Plane geometry: 63×63 segments (64×64 vertices)
- Height per vertex: `terrainHeightFromCell(grid[y][x])`
- Three.js MeshStandardMaterial
- Receives shadow, no transparency

### 7. Crystal Placement
- 160 octahedra placed in a ring around the track
- Height modulated by elevation: `12 + cell.elevation * 110`
- Color derived from element: `elementColor(cell.element)`
- Seeded random rotation and scale variance

### 8. Post-Processing Spectacle
- **Bloom**: UnrealBloomPass (1.35 threshold, 0.65 strength, 0.16 radius)
- **Tone Mapping**: ACES Filmic (1.15 exposure)
- **Fog**: Exponential (0.00075 density, color #030817)
- **Shadows**: PCF soft (1024 resolution)
- **Lights**:
  - Hemisphere (0x8bdcff over, 0x130b2a under, intensity 1.25)
  - Directional sun (0xffffff, intensity 3.0, casts shadow, position 80,140,40)

### 9. Racing Loop (Independent System)
- Player bike: seeded starting position (0.02 track parameter), cyan color (0x00eaff)
- AI riders: 9 bikes seeded random offsets and speeds
- Track: Deterministic spline seeded from same seed as world
- Camera: Chase follow, third-person
- Input: W/A/S/D steering, Shift nitro, Space fire, R reset
- HUD: Speed (km/h), nitro count, shield bar

### 10. Adapter Boundaries
- BOA adapter: Game state workflow (optional, fail-safe)
- HOLOCRON adapter: Item filtering (optional, fail-safe)
- If unavailable, game runs standalone

## Verification

**Determinism Test**: Run 2x with same seed → bit-identical grid
```javascript
const w1 = generateSourceWorld({ seed: 0x12345678 });
const w2 = generateSourceWorld({ seed: 0x12345678 });
assert(JSON.stringify(w1.grid) === JSON.stringify(w2.grid));
```

**Variance Test**: Run 2x with different seed → different grid
```javascript
const w1 = generateSourceWorld({ seed: 0x11111111 });
const w2 = generateSourceWorld({ seed: 0x22222222 });
assert(JSON.stringify(w1.grid) !== JSON.stringify(w2.grid));
```

**Reproducibility Test Suite**: `node src/tests.js`
- 10 test vectors validating determinism, provenance, structure, ranges

**CI Gate**: `npm run build && npm test` (GitHub Actions)

## Provenance Envelope

Every generated world carries:
```json
{
  "source_artifact": "seed.png",
  "seed": 305419896,
  "algorithm_version": "1",
  "grid_resolution": "64x64",
  "generated_at": "2026-09-26T12:19:59.000Z",
  "generator": "Epic-Random-Maps / Prismatic Velocity"
}
```

This metadata:
- Is logged to console at runtime
- Is attached to every world object
- Allows future verification and audit
- Does NOT influence generation (generated_at is provenance-only)

## Next Best Steps (++1)

1. **CI/CD Verification**: Await GitHub Actions green on all gates
2. **Extended Elemental Rules**: Water flow simulation, thermal erosion, element interactions
3. **Performance Tuning**: Mesh caching, grid pre-computation, instanced crystal rendering
4. **Network Sync**: Seed sharing across clients, deterministic world replication
5. **Epic-Random-Maps Deep Integration**: Full AIAgentGatherer + MeshGeneratorAgent + ModalGridAgent

## Next Best Step (1++)

**Immediate**: Run `npm test` locally to verify determinism before declaring phase 4 complete.

```bash
cd prismatic-velocity
npm test
```

Expected output: ✓ 10/10 tests pass → phase 4 cleared → advance to phase 5.

---

**This document is the authoritative specification for the Vectored Process.**
Render adapters may change; world-source remains canonical.
