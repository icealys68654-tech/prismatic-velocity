const ELEMENT_RGB = Object.freeze({
  water: [0, 0.85, 1],
  fire: [1, 0.16, 0.04],
  earth: [0.62, 0.38, 0.12],
  air: [0.72, 0.9, 1],
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function prismaticLightFromCell(cell, phase = 0) {
  if (!cell?.pressures) throw new TypeError("prismaticLightFromCell requires elemental pressures");
  const p = cell.pressures;
  const rgb = [0, 0, 0];
  for (const [element, weight] of Object.entries(p)) {
    const source = ELEMENT_RGB[element];
    if (!source) continue;
    rgb[0] += source[0] * weight;
    rgb[1] += source[1] * weight;
    rgb[2] += source[2] * weight;
  }
  const tension = Math.abs(p.fire - p.water) + Math.abs(p.earth - p.air);
  const intensity = clamp(0.55 + tension * 0.45 + Math.sin(phase + cell.x * 0.17 + cell.y * 0.11) * 0.08, 0, 1);
  return {
    color: rgb.map((value) => clamp(value, 0, 1)),
    intensity,
    phase: phase,
  };
}

export function buildPrismaticLightField(world, { samples = 128, phase = 0 } = {}) {
  if (!world?.grid?.length) throw new TypeError("buildPrismaticLightField requires a generated world");
  const height = world.grid.length;
  const width = world.grid[0].length;
  const count = Math.max(1, Math.min(samples, width * height));
  const points = [];
  for (let i = 0; i < count; i += 1) {
    const index = Math.floor((i * width * height) / count);
    const y = Math.floor(index / width);
    const x = index % width;
    const cell = world.grid[y][x];
    const light = prismaticLightFromCell(cell, phase);
    points.push({
      x: cell.x,
      y: cell.y,
      elevation: cell.elevation,
      color: light.color,
      intensity: light.intensity,
    });
  }
  return {
    source_seed: world.provenance?.seed,
    algorithm_version: "1",
    phase,
    points,
  };
}
