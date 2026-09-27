import { GENRE_CONTRACTS } from "./genre-framework.js";

const GENRE_DEFINITIONS = Object.freeze(
  Object.fromEntries(
    Object.entries(GENRE_CONTRACTS).map(([id, contract]) => [
      id,
      {
        family: contract.family,
        mechanics: contract.mechanics,
        route_mode: contract.mode,
      },
    ]),
  ),
);

const ACTION_GENRES = new Set(["action", "platformer", "shooter", "action-rpg"]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function routeNode(route, index) {
  const cell = route.cells[clamp(index, 0, route.cells.length - 1)];
  return {
    index: clamp(index, 0, route.cells.length - 1),
    x: cell.x,
    y: cell.y,
    element: cell.element,
    elevation: cell.elevation,
    region: cell.region,
    pressures: { ...cell.pressures },
  };
}

function defaultStats() {
  return { strength: 5, agility: 5, vitality: 5, intellect: 5 };
}

function makeState(genre, route, seed) {
  const action = ACTION_GENRES.has(genre);
  return {
    genre,
    seed,
    route_length: route.cells.length,
    route_index: 0,
    node: routeNode(route, 0),
    health: 100,
    stamina: 100,
    level: 1,
    experience: 0,
    score: 0,
    turn: 0,
    resources: { food: 10, energy: 10, metal: 5 },
    stats: defaultStats(),
    quest: { id: "route-transmutation", progress: 0, goal: route.cells.length - 1 },
    flags: {},
    action_mode: action,
    grounded: true,
    ammo: action && (genre === "shooter" || genre === "action-rpg") ? 12 : 0,
    enemies_defeated: 0,
    choices: [],
    puzzle_progress: 0,
    completed: false,
  };
}

export function getGenreCatalog() {
  return Object.fromEntries(
    Object.entries(GENRE_DEFINITIONS).map(([id, definition]) => [id, {
      id,
      ...definition,
      traversal: "deterministic",
    }]),
  );
}

export function createGenreGame({ genre = "action", world, route } = {}) {
  if (!GENRE_DEFINITIONS[genre]) {
    throw new Error(`Unsupported game genre: ${genre}`);
  }
  if (!world || !route?.cells?.length) {
    throw new Error("createGenreGame requires a generated world and traversal route");
  }

  const state = makeState(genre, route, world.seed);

  return {
    genre,
    definition: { id: genre, ...GENRE_DEFINITIONS[genre] },
    route: clone(route),
    state,
    step(input = {}) {
      return stepGenreGame(this, input);
    },
    getState() {
      return clone(this.state);
    },
  };
}

function stepActionGame(game, input) {
  const state = game.state;
  const route = game.route;
  const movement = Number(input.move ?? input.forward ?? 0);
  const direction = Number(input.direction ?? 0);
  const jump = Boolean(input.jump);
  const fire = Boolean(input.fire);
  const attack = Boolean(input.attack);

  let delta = clamp(Math.trunc(movement), -2, 3);
  if (movement === 0 && (input.forward || input.move)) delta = 1;
  delta += direction > 0 ? 1 : direction < 0 ? -1 : 0;

  if (jump && state.grounded && (game.genre === "platformer" || game.genre === "action")) {
    state.grounded = false;
    state.stamina = clamp(state.stamina - 8, 0, 100);
    state.score += 5;
  } else if (!jump) {
    state.grounded = true;
  }

  if (fire && state.ammo > 0) {
    state.ammo -= 1;
    state.score += 10;
    state.enemies_defeated += 1;
  }
  if (attack) {
    state.score += 8;
    state.enemies_defeated += 1;
  }

  state.route_index = clamp(state.route_index + delta, 0, route.cells.length - 1);
  state.node = routeNode(route, state.route_index);
  state.stamina = clamp(state.stamina + (delta > 0 ? 1 : 2), 0, 100);
  state.experience += Math.max(0, delta) * (game.genre === "action-rpg" ? 3 : 1);
}

function stepRolePlayingGame(game, input) {
  const state = game.state;
  const route = game.route;
  const delta = clamp(Math.trunc(Number(input.move ?? input.forward ?? 1)), -1, 2);
  state.route_index = clamp(state.route_index + delta, 0, route.cells.length - 1);
  state.node = routeNode(route, state.route_index);
  state.experience += Math.max(0, delta) * 2;
  state.quest.progress = state.route_index;
  if (input.quest_complete) state.flags.quest_complete = true;
}

function stepStrategyGame(game, input) {
  const state = game.state;
  const route = game.route;
  if (game.genre === "tbs") state.turn += 1;
  const delta = clamp(Math.trunc(Number(input.move ?? input.advance ?? 1)), -1, 2);
  state.route_index = clamp(state.route_index + delta, 0, route.cells.length - 1);
  state.node = routeNode(route, state.route_index);
  state.resources.energy = clamp(state.resources.energy - Math.max(0, delta), 0, 100);
  if (input.build) {
    state.resources.metal = Math.max(0, state.resources.metal - 1);
    state.score += 5;
  }
  if (input.command) state.score += 3;
}

function stepAdventureGame(game, input) {
  const state = game.state;
  const route = game.route;
  const delta = clamp(Math.trunc(Number(input.move ?? input.explore ?? 1)), -1, 2);
  state.route_index = clamp(state.route_index + delta, 0, route.cells.length - 1);
  state.node = routeNode(route, state.route_index);
  if (input.interact || input.examine) {
    state.score += 5;
    state.flags[`examined_${state.route_index}`] = true;
  }
  if (input.choice !== undefined) state.choices.push(input.choice);
}

function stepPuzzleGame(game, input) {
  const state = game.state;
  if (input.pattern !== undefined) {
    state.puzzle_progress += 1;
    state.score += 10;
  }
  if (input.solve) state.completed = true;
}

export function stepGenreGame(game, input = {}) {
  if (!game || !GENRE_DEFINITIONS[game.genre]) throw new Error("Invalid genre game");
  if (game.state.completed) return game.getState();

  if (ACTION_GENRES.has(game.genre)) stepActionGame(game, input);
  else if (["rpg", "mmorpg"].includes(game.genre)) stepRolePlayingGame(game, input);
  else if (["strategy", "rts", "tbs"].includes(game.genre)) stepStrategyGame(game, input);
  else if (["adventure", "visual-novel"].includes(game.genre)) stepAdventureGame(game, input);
  else if (game.genre === "puzzle") stepPuzzleGame(game, input);

  if (game.state.route_index >= game.route.cells.length - 1) {
    game.state.completed = true;
    game.state.quest.progress = game.state.quest.goal;
  }
  return game.getState();
}
