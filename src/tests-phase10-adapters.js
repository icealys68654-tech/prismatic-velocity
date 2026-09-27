import { createPrismaticVelocityAPI } from "./api/prismatic-velocity.js";

export async function runPhase10AdapterTests() {
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };

  const api = createPrismaticVelocityAPI();
  const world = api.generateWorld({ seed: 0x10203040, width: 24, height: 24 });
  const route = api.buildRoute(world, { startY: 3, endY: 20 });

  for (const genre of Object.keys(api.getGenreCatalog())) {
    const adapter = api.adapters[Object.keys(api.adapters).find((id) => api.adapters[id].supports(genre))];
    assert(adapter, `missing genre adapter for ${genre}`);
    const game = adapter.bind({ genre, world, route });
    assert(game.getState().genre === genre, `adapter failed to bind ${genre}`);
    api.stepGame(game, { move: 1 });
  }

  const core = {
    frames: 0,
    runFrame() { this.frames += 1; },
    getFramebuffer() { return { width: 1, height: 1, data: new Uint8Array([255, 0, 0, 255]) }; },
  };
  const video = { connect() {}, disconnect() {} };
  const input = { connect() {}, disconnect() {} };
  const adapter = api.holocronAdapter;
  assert(adapter.connect(null, null).status === "runtime-started", "HOLOCRON adapter did not start");
  assert(adapter.state === "running", "HOLOCRON adapter state mismatch");
  assert(adapter.frame().width === 1 && core.frames === 1, "HOLOCRON frame bridge failed");
  assert(adapter.disconnect().status === "runtime-stopped", "HOLOCRON adapter did not stop");

  const operations = [];
  const prismatics = api.createPrismaticsAdapter({
    execute(list) { operations.push(...list); return list.length; },
  });
  const result = prismatics.pitch(45).roll(30).index({ x: 1 }).scatter([{ x: 0 }]).compute();
  assert(result === 4, "BOA Prismatics adapter did not execute");
  assert(JSON.stringify(operations) === JSON.stringify([
    ["pitch", 45], ["roll", 30], ["index", { x: 1 }], ["scatter", [{ x: 0 }]],
  ]), "BOA Prismatics operation order changed");

  console.log("Phase 10 framework/genre adapter tests: GREEN");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runPhase10AdapterTests();
}
