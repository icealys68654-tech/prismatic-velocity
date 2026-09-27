import { getGenreFrameworkCatalog } from "./api/genre-framework.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function routePosition(cell, cellSize) {
  return {
    x: (cell.x - 31.5) * cellSize,
    y: Number(cell.elevation ?? 0),
    z: (cell.y - 31.5) * cellSize,
  };
}

function makeState(genre, world, route) {
  return {
    genre,
    seed: world.seed,
    route_index: 0,
    route_length: route.cells.length,
    score: 0,
    level: 1,
    health: 100,
    stamina: 100,
    experience: 0,
    turn: 0,
    completed: false,
    encounters: 0,
    hits: 0,
    ammo: 12,
    jumps: 0,
    platforms: 0,
    quests: 0,
    reputation: 0,
    territory: 0,
    resources: { energy: 10, metal: 5 },
    bases: 0,
    units: 1,
    action_points: 2,
    scene: 0,
    choices: [],
    discoveries: 0,
    puzzle_progress: 0,
    pattern: [],
    loot: 0,
    node: clone(route.cells[0]),
  };
}

function advance(state, route, delta) {
  state.route_index = clamp(state.route_index + delta, 0, route.cells.length - 1);
  state.node = clone(route.cells[state.route_index]);
  if (state.route_index === route.cells.length - 1) state.completed = true;
}

function stepGenre(state, route, input) {
  const move = clamp(Math.trunc(Number(input.move ?? input.forward ?? 0)), -1, 2);
  const forward = move > 0 ? 1 : 0;

  switch (state.genre) {
    case "action":
      advance(state, route, forward);
      if (input.attack) { state.encounters += 1; state.score += 10; state.health = clamp(state.health - 2, 0, 100); }
      if (input.jump) { state.jumps += 1; state.stamina = clamp(state.stamina - 8, 0, 100); state.score += 5; }
      break;
    case "platformer":
      if (input.jump) { state.jumps += 1; state.platforms += 1; state.score += 8; }
      advance(state, route, forward + (input.jump ? 1 : 0));
      break;
    case "shooter":
      advance(state, route, forward);
      if (input.fire) { state.hits += 1; state.encounters += 1; state.ammo = Math.max(0, state.ammo - 1); state.score += 12; }
      break;
    case "rpg":
      advance(state, route, forward);
      if (input.interact) { state.quests += 1; state.experience += 10; state.score += 5; }
      state.level = 1 + Math.floor(state.experience / 50);
      break;
    case "mmorpg":
      advance(state, route, forward);
      if (input.interact) { state.reputation += 2; state.quests += 1; state.score += 5; }
      break;
    case "action-rpg":
      advance(state, route, forward);
      if (input.attack) { state.encounters += 1; state.loot += 1; state.experience += 8; state.score += 12; }
      if (input.jump) state.jumps += 1;
      state.level = 1 + Math.floor(state.experience / 50);
      break;
    case "strategy":
      if (input.command) state.territory += 1;
      if (input.build && state.resources.metal > 0) { state.resources.metal -= 1; state.bases += 1; state.score += 6; }
      advance(state, route, forward);
      break;
    case "rts":
      if (input.build && state.resources.energy > 0) { state.resources.energy -= 1; state.bases += 1; state.units += 2; }
      if (input.command) state.territory += 1;
      advance(state, route, forward);
      break;
    case "tbs":
      state.turn += 1;
      if (input.command) advance(state, route, 1);
      if (input.build && state.action_points > 0) {
        state.action_points -= 1;
        state.resources.metal = Math.max(0, state.resources.metal - 1);
      }
      if (state.action_points === 0) state.action_points = 2;
      break;
    case "adventure":
      advance(state, route, forward);
      if (input.interact || input.examine) { state.discoveries += 1; state.score += 7; }
      break;
    case "visual-novel":
      if (input.choice !== undefined) {
        state.choices.push(String(input.choice));
        state.scene += 1;
        state.score += 5;
        if (state.scene >= 5) state.completed = true;
      }
      break;
    case "puzzle":
      if (input.pattern !== undefined) {
        state.pattern.push(String(input.pattern));
        state.puzzle_progress += 1;
        state.score += 10;
      }
      if (input.solve && state.puzzle_progress >= 1) state.completed = true;
      break;
    default:
      throw new Error(`Unsupported prototype genre: ${state.genre}`);
  }

  state.stamina = clamp(state.stamina + 1, 0, 100);
}

export function createGenrePrototypeRuntime({
  genre,
  world,
  route,
  cellSize = 5000 / 63,
} = {}) {
  if (!getGenreFrameworkCatalog()[genre]) throw new Error(`Unsupported prototype genre: ${genre}`);
  if (!world) throw new Error("createGenrePrototypeRuntime requires a generated world");
  if (!route?.cells?.length) throw new Error("createGenrePrototypeRuntime requires a route substrate");

  const state = makeState(genre, world, route);
  let frame = 0;
  let running = false;

  function getState() {
    return {
      ...clone(state),
      frame,
      running,
      position: routePosition(state.node, cellSize),
    };
  }

  return {
    start() { running = true; return getState(); },
    stop() { running = false; return getState(); },
    step(input = {}) {
      if (!running || state.completed) return getState();
      stepGenre(state, route, input);
      frame += 1;
      return getState();
    },
    getState,
  };
}
