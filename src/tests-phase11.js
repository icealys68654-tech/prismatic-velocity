import { createGameRuntime } from "./game-runtime.js";
import { createPlayerController } from "./player-controller.js";
import { generateSourceWorld } from "./world-source.js";
import { buildTraversalRoute } from "./traversal.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function runPhase11Tests() {
  const world = generateSourceWorld({ seed: 112358, width: 16, height: 16 });
  const route = buildTraversalRoute(world);
  const game = { ...world, route };
  const runtime = createGameRuntime({ genre: "action", world: game, cellSize: 10 });

  const initial = runtime.getState();
  assert(initial.route_index === 0, "runtime must begin at route index zero");
  assert(initial.position && Number.isFinite(initial.position.x), "runtime must expose a 3D position");

  runtime.start();
  const moved = runtime.step({ move: 2 });
  assert(moved.route_index >= initial.route_index, "runtime movement must consume the traversal route");
  assert(moved.frame === 1, "runtime frame counter must increment");

  const controller = createPlayerController();
  const jump = controller.step({ jump: true, direction: 1 });
  assert(jump.velocity.y > 0 && !jump.grounded, "player controller must support deterministic jumping");

  const repeatA = createGameRuntime({ genre: "action", world: game, cellSize: 10 });
  const repeatB = createGameRuntime({ genre: "action", world: game, cellSize: 10 });
  repeatA.start();
  repeatB.start();
  const a = repeatA.step({ move: 2, attack: true });
  const b = repeatB.step({ move: 2, attack: true });
  assert(JSON.stringify(a) === JSON.stringify(b), "identical seed and input must produce identical runtime state");

  return "Phase 11 tests passed";
}
