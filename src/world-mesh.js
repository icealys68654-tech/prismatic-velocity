import { elementColor, terrainHeightFromCell } from "./world-source.js";

/**
 * Phase 6 mesh stage.
 * Converts the deterministic elemental grid into renderer-neutral indexed
 * geometry. The renderer can consume this without changing the world model.
 */
export function buildWorldMesh(world, { cellSize = 5000 / Math.max(world.width - 1, 1) } = {}) {
  const { width, height, grid } = world;
  const vertexCount = width * height;
  const vertices = new Array(vertexCount * 3);
  const colors = new Array(vertexCount * 3);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const cell = grid[y][x];
      const index = y * width + x;
      const offset = index * 3;
      vertices[offset] = (x - (width - 1) / 2) * cellSize;
      vertices[offset + 1] = terrainHeightFromCell(cell);
      vertices[offset + 2] = (y - (height - 1) / 2) * cellSize;

      const hex = elementColor(cell.element);
      colors[offset] = ((hex >> 16) & 0xff) / 255;
      colors[offset + 1] = ((hex >> 8) & 0xff) / 255;
      colors[offset + 2] = (hex & 0xff) / 255;
    }
  }

  const indices = [];
  for (let y = 0; y < height - 1; y += 1) {
    for (let x = 0; x < width - 1; x += 1) {
      const a = y * width + x;
      const b = a + 1;
      const c = a + width;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  return {
    vertices,
    colors,
    indices,
    vertex_count: vertexCount,
    triangle_count: indices.length / 3,
    dimensions: { width, height },
    cell_size: cellSize,
    source_seed: world.seed,
    algorithm_version: world.provenance.algorithm_version,
  };
}
