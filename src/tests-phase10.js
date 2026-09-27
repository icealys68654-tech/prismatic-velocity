import { createPrismaticVelocityAPI } from "./api/prismatic-velocity.js";

export async function runPhase10Tests() {
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };

  const api = createPrismaticVelocityAPI();
  const catalog = api.getGenreCatalog();
  const genres = [
    "action", "platformer", "shooter",
    "rpg", "mmorpg", "action-rpg",
    "strategy", "rts", "tbs",
    "adventure", "visual-novel",
    "puzzle",
  ];

  assert(genres.every((genre) => catalog[genre]), "major genre catalog is incomplete");

  const world = api.generateWorld({ seed: 0x10203040, width: 32, height: 32 });
  const route = api.buildRoute(world, { startY: 4, endY: 27 });
  assert(route.cells.length === 32, "Phase 10 must consume the deterministic traversal route");

  const action = api.createGame({
    genre: "action",
    world,
    routeOptions: { startY: 4, endY: 27 },
  });
  const before = api.getGameState(action);
  const after = api.stepGame(action, { move: 2, jump: true, attack: true });
  assert(after.route_index > before.route_index, "action game must advance along traversal route");
  assert(after.node.x === after.route_index, "action node must map to traversal route");
  assert(after.score > before.score, "action input must produce gameplay state changes");

  const shooter = api.createGame({
    genre: "shooter",
    world,
    routeOptions: { startY: 4, endY: 27 },
  });
  const ammoBefore = shooter.getState().ammo;
  api.stepGame(shooter, { move: 1, fire: true });
  assert(shooter.getState().ammo === ammoBefore - 1, "shooter fire must consume ammo");

  const rpg = api.createGame({ genre: "rpg", world });
  api.stepGame(rpg, { move: 2 });
  assert(rpg.getState().experience > 0, "RPG traversal must award experience");

  const tbs = api.createGame({ genre: "tbs", world });
  api.stepGame(tbs, { advance: 1 });
  assert(tbs.getState().turn === 1, "TBS must advance by turns");

  const puzzle = api.createGame({ genre: "puzzle", world });
  api.stepGame(puzzle, { pattern: "phase" });
  assert(puzzle.getState().puzzle_progress === 1, "puzzle state must respond to pattern input");

  const repeatedA = api.createGame({ genre: "action", world, routeOptions: { startY: 4, endY: 27 } });
  const repeatedB = api.createGame({ genre: "action", world, routeOptions: { startY: 4, endY: 27 } });
  for (const input of [{ move: 1 }, { move: 2, attack: true }, { jump: true }]) {
    api.stepGame(repeatedA, input);
    api.stepGame(repeatedB, input);
  }
  assert(
    JSON.stringify(repeatedA.getState()) === JSON.stringify(repeatedB.getState()),
    "genre gameplay state must remain deterministic",
  );

  console.log("Phase 10 genre/action gameplay tests: GREEN");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runPhase10Tests();
}
