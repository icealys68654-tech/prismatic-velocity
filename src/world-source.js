const ELEMENT_COLORS = {
  water: 0x2ab7ff,
  fire: 0xff6b3d,
  earth: 0x7b8b5a,
  air: 0xd9efff,
};

function makeRng(seed) {
  let state = (seed >>> 0) || 0x50524953;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pickElement(pressures) {
  const entries = Object.entries(pressures);
  let best = entries[0];
  for (let i = 1; i < entries.length; i += 1) {
    if (entries[i][1] > best[1]) {
      best = entries[i];
    }
  }
  return best[0];
}

export function generateSourceWorld({ artifact = "seed.png", seed = 0x50524953, width = 64, height = 64 } = {}) {
  const rng = makeRng(seed);
  const grid = [];

  for (let y = 0; y < height; y += 1) {
    const row = [];
    for (let x = 0; x < width; x += 1) {
      const nx = x / Math.max(1, width - 1);
      const ny = y / Math.max(1, height - 1);

      const basin = Math.sin((x * 0.31) + seed * 0.0003) * 0.5 + 0.5;
      const ridges = Math.sin((y * 0.26) + seed * 0.0004 + 2.1) * 0.5 + 0.5;
      const contour = Math.sin((x * 0.17) + (y * 0.11) + seed * 0.0002) * 0.5 + 0.5;

      const rawPressures = {
        water: 0.26 + (1 - ny) * 0.42 + (1 - basin) * 0.24 + rng() * 0.18,
        fire: 0.22 + (1 - contour) * 0.28 + (1 - ridges) * 0.22 + rng() * 0.20,
        earth: 0.28 + basin * 0.46 + ridges * 0.40 + rng() * 0.12,
        air: 0.18 + (nx * 0.42 + ny * 0.28) + contour * 0.34 + rng() * 0.14,
      };

      // Keep pressure values comparable across cells while preserving their
      // relative strength. This makes the elemental field a true mixture.
      const pressureTotal = Object.values(rawPressures).reduce((sum, value) => sum + value, 0);
      const pressures = Object.fromEntries(
        Object.entries(rawPressures).map(([name, value]) => [name, value / pressureTotal]),
      );

      const element = pickElement(pressures);
      const elevation = clamp(
        pressures.earth * 0.62 + pressures.air * 0.32 - pressures.water * 0.38 + pressures.fire * 0.22 + rng() * 0.12,
        0,
        1,
      );

      row.push({
        x,
        y,
        element,
        elevation,
        pressures,
        region: Math.floor((x / 8) + (y / 8) + rng() * 2) % 12,
      });
    }
    grid.push(row);
  }

  const heightfield = grid.map((row) => row.map((cell) => cell.elevation));

  return {
    artifact,
    seed,
    width,
    height,
    grid,
    heightfield,
    provenance: {
      source_artifact: artifact,
      seed,
      algorithm_version: "3",
      grid_resolution: `${width}x${height}`,
      generated_at: new Date().toISOString(),
      generator: "Epic-Random-Maps / Prismatic Velocity",
    },
  };
}

export function elementColor(element) {
  return ELEMENT_COLORS[element] ?? ELEMENT_COLORS.earth;
}

export function terrainHeightFromCell(cell) {
  const base = cell.elevation * 120;
  const modifier = cell.element === "water" ? -52 : cell.element === "fire" ? 26 : cell.element === "air" ? 18 : 0;
  return base + modifier;
}
