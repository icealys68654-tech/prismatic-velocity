import { createGenreGame } from "./api/genres.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function routePosition(cell, cellSize = 5000 / 63) {
  return {
    x: (cell.x - 31.5) * cellSize,
    y: Number(cell.elevation ?? 0),
    z: (cell.y - 31.5) * cellSize,
  };
}

export function createGameRuntime({ genre = "action", world, routeOptions = {}, cellSize } = {}) {
  if (!world) throw new Error("createGameRuntime requires a generated world");
  const route = world.route ?? null;
  const game = createGenreGame({
    genre,
    world,
    route: route ?? (() => {
      throw new Error("createGameRuntime requires a traversal route");
    })(),
  });
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
    const cell = snapshot.node;
    return {
      frame,
      running,
      ...snapshot,
      position: routePosition(cell, cellSize),
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
