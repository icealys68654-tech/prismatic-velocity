import { elementColor, terrainHeightFromCell } from "./world-source.js";

/**
 * Phase 6 mesh stage.
 * Converts the deterministic elemental grid into renderer-neutral indexed
 * geometry. The renderer can consume this without changing the world model.
 */
function neighborAverage(grid, x, y, width, height) {
  let total = 0;
  let count = 0;
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        total += terrainHeightFromCell(grid[ny][nx]);
        count += 1;
      }
    }
  }
  return count ? total / count : terrainHeightFromCell(grid[y][x]);
}

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
      const baseHeight = terrainHeightFromCell(cell);
      const neighborHeight = neighborAverage(grid, x, y, width, height);
      // Phase 7 continuity: retain the cell's elemental signature while
      // blending 25% toward its local neighborhood.
      vertices[offset + 1] = baseHeight * 0.75 + neighborHeight * 0.25;
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

  let transition_count = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const element = grid[y][x].element;
      if (x + 1 < width && grid[y][x + 1].element !== element) transition_count += 1;
      if (y + 1 < height && grid[y + 1][x].element !== element) transition_count += 1;
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
    transition_count,
  };
}
