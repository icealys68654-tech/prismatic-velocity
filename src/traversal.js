import { terrainHeightFromCell } from "./world-source.js";

export function buildTraversalRoute(world, { startY, endY } = {}) {
  const { width, height, grid } = world;
  const start = Math.max(0, Math.min(height - 1, startY ?? Math.floor(height / 2)));
  const finish = Math.max(0, Math.min(height - 1, endY ?? Math.floor(height / 2)));
  const costs = Array.from({ length: height }, () => Array(width).fill(Infinity));
  const previous = Array.from({ length: height }, () => Array(width).fill(null));

  const cellCost = (x, y, fromY = y) => {
    const cell = grid[y][x];
    const slope = Math.abs(
      terrainHeightFromCell(cell) - terrainHeightFromCell(grid[fromY][x]),
    ) / 120;
    const elemental = { water: 1.1, fire: 1.2, earth: 0.85, air: 1.0 }[cell.element];
    return 1 + slope * 2 + elemental * 0.1;
  };

  costs[start][0] = cellCost(0, start, start);

  for (let x = 1; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      for (const fromY of [y - 1, y, y + 1]) {
        if (fromY < 0 || fromY >= height) continue;
        const candidate = costs[fromY][x - 1] + cellCost(x, y, fromY);
        if (candidate < costs[y][x]) {
          costs[y][x] = candidate;
          previous[y][x] = fromY;
        }
      }
    }
  }

  let y = finish;
  const cells = [];
  for (let x = width - 1; x >= 0; x -= 1) {
    cells.push({ x, y, ...grid[y][x] });
    y = previous[y][x] ?? y;
  }
  cells.reverse();

  return {
    source_seed: world.seed,
    algorithm_version: world.provenance.algorithm_version,
    start: { x: 0, y: cells[0].y },
    finish: { x: width - 1, y: cells[cells.length - 1].y },
    cells,
    cost: costs[finish][width - 1],
  };
}
