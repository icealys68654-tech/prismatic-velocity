# GAME-ENGINE-CMS Integration Guide

## Overview
This document outlines the integration of the **GAME-ENGINE-CMS** module into the **prismatic-velocity** project. The GAME-ENGINE-CMS is a deterministic, content-driven world generation engine based on the Prismatic Emergence design.

## Source Repository
- **Repository:** https://github.com/icealys68654-tech/GAME-ENGINE-CMS
- **Main Branch:** main
- **Language:** TypeScript
- **Version:** 0.1.0
- **Status:** Core implementation complete with CI/CD configured

## Module Architecture

### Pipeline Flow
```
CMS Artifact 
  → FilterPipeline 
  → AIAgentGatherer 
  → MeshGeneratorAgent
  → ModalGridAgent (64×64) 
  → Height/Material Fields 
  → Generated World
```

### Key Features
- **Deterministic Generation:** Artifact + seed → reproducible world
- **Artifact Storage:** In-memory content store with filtering
- **Mesh Generation:** 64×64 modal grid-based terrain
- **Provenance Contracts:** Full tracking of generation metadata
- **Reproducibility:** Built-in testing and validation

## Integration Points

### Dependencies
- `@types/node`: ^22.0.0
- `typescript`: ^5.6.0
- **Runtime:** Zero external dependencies

### Build & Test Commands
```bash
# Build
npm run build

# Test
npm test (compiles TypeScript + runs Node tests)
```

## Current Status
- ✅ Deterministic artifact storage
- ✅ Filtering/gathering system
- ✅ Mesh generation engine
- ✅ Modal grid generation (64×64)
- ✅ Seeded world generation
- ✅ Provenance contracts
- ✅ Reproducibility tests
- ✅ GitHub Actions CI workflow (green)
- ⏳ **Next:** Concrete browser/native rendering adapter

## Usage Example

```typescript
import { generateWorld, InMemoryContentStore } from "./src/index.js";

const store = new InMemoryContentStore();
const artifact = store.add({
  id: "crystal-01",
  title: "Crystal Basin",
  body: "A warm volcanic basin surrounded by clear water and high stone ridges.",
  tags: ["volcanic", "water", "crystal"],
  metadata: { biome: "basin" }
});

const world = generateWorld(artifact, "question-42");
console.log(world.provenance, world.heightfield.length);
```

## Generated World Contract

Every generated world includes:
- `sourceArtifact` - Reference to source content
- `seed` - Deterministic seed value
- `algorithmVersion` - Generation algorithm version
- `gridResolution` - Grid size (typically 64×64)
- `generatedAt` - Timestamp (provenance only)
- `generator` - Generator identification
- `heightfield` - Terrain height data
- `materialfield` - Material/biome data

## Rendering Adapter Contract

The module exports a `RenderAdapter` contract for implementing:
- WebGL rendering
- OpenGL rendering
- Vulkan rendering
- Other native/browser adapters

## Integration Strategy

### Phase 1: Module Structure
- [ ] Create `modules/game-engine-cms/` directory in prismatic-velocity
- [ ] Add as submodule or copy core source files
- [ ] Update root `package.json` with build scripts

### Phase 2: Configuration Merge
- [ ] Merge TypeScript configurations
- [ ] Align build processes
- [ ] Set up unified test suite

### Phase 3: Feature Integration
- [ ] Implement rendering adapter for prismatic-velocity UI
- [ ] Connect artifact management to prismatic-velocity data layer
- [ ] Integrate world generation into visualization pipeline

### Phase 4: Testing & Validation
- [ ] Validate deterministic generation
- [ ] Test cross-module integration
- [ ] Verify CI/CD workflows

## References
- **README:** https://github.com/icealys68654-tech/GAME-ENGINE-CMS/blob/main/README.md
- **CI Workflow:** https://github.com/icealys68654-tech/GAME-ENGINE-CMS/actions/workflows/ci.yml
- **Source Code:** https://github.com/icealys68654-tech/GAME-ENGINE-CMS/tree/main/src

## Next Steps
1. Review this integration plan
2. Decide on integration approach (submodule vs. source copy)
3. Create module directory structure
4. Merge build configurations
5. Begin rendering adapter implementation
