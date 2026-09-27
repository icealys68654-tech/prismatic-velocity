import { createGenreGame } from "./api/genres.js";

function routePosition(cell, cellSize) {
  return {
    x: (cell.x - 31.5) * cellSize,
    y: Number(cell.elevation ?? 0),
    z: (cell.y - 31.5) * cellSize,
  };
}

export function createGenrePrototypeRuntime({
  genre,
  world,
  route,
  cellSize = 5000 / 63,
} = {}) {
  if (!world) throw new Error("createGenrePrototypeRuntime requires a generated world");
  const game = createGenreGame({ genre, world, route });
  let frame = 0;
  let running = false;

  function getState() {
    const snapshot = game.getState();
    return {
      frame,
      running,
      ...snapshot,
      position: routePosition(snapshot.node, cellSize),
    };
  }

  return {
    game,
    start() {
      running = true;
      return getState();
    },
    stop() {
      running = false;
      return getState();
    },
    step(input = {}) {
      if (!running) return getState();
      game.step(input);
      frame += 1;
      return getState();
    },
    getState,
  };
}
