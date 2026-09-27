import { createGenreGame } from "./api/genres.js";
// Racing-specific runtime boundary. Generic genre prototypes use genre-prototype-runtime.js.
import { buildTraversalRoute } from "./traversal.js";

function routePosition(cell, cellSize = 5000 / 63) {
  return {
    x: (cell.x - 31.5) * cellSize,
    y: Number(cell.elevation ?? 0),
    z: (cell.y - 31.5) * cellSize,
  };
}

export function createGameRuntime({
  genre = "action",
  world,
  route,
  routeOptions = {},
  cellSize = 5000 / 63,
} = {}) {
  if (!world) throw new Error("createGameRuntime requires a generated world");
  const traversal = route ?? buildTraversalRoute(world, routeOptions);
  const game = createGenreGame({ genre, world, route: traversal });
  return createRuntimeFromGame(game, { cellSize });
}

export function createRuntimeFromGame(game, { cellSize = 5000 / 63 } = {}) {
  if (!game?.route?.cells?.length) {
    throw new Error("createRuntimeFromGame requires a game with a traversal route");
  }

  let frame = 0;
  let running = false;
  let previousState = game.getState();

  function state() {
    const snapshot = game.getState();
    return {
      frame,
      running,
      ...snapshot,
      position: routePosition(snapshot.node, cellSize),
      previous_route_index: previousState.route_index,
    };
  }

  return {
    game,
    start() {
      running = true;
      return state();
    },
    stop() {
      running = false;
      return state();
    },
    step(input = {}) {
      if (!running) return state();
      previousState = game.getState();
      game.step(input);
      frame += 1;
      return state();
    },
    getState: state,
  };
}
