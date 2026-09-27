import { generateSourceWorld } from "./world-source.js";
import { buildTraversalRoute } from "./traversal.js";
import { createBOA, createCPUWorkflow, createBOAContext } from "./api/boa-api.js";
import { createFilterPipeline, createHolocronRuntime } from "./api/holocron-api.js";
import { createPrismaticVelocityAPI } from "./api/prismatic-velocity.js";

export async function runPhase8And9Tests() {
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const world = generateSourceWorld({ seed: 0x13579bdf, width: 64, height: 64 });
const routeA = buildTraversalRoute(world, { startY: 8, endY: 55 });
const routeB = buildTraversalRoute(world, { startY: 8, endY: 55 });
assert(routeA.start.y === 8, "route must honor startY");
assert(routeA.finish.y === 55, "route must honor endY");
assert(routeA.cells.length === 64, "route must span the world width");
assert(JSON.stringify(routeA) === JSON.stringify(routeB), "route must be deterministic");

const component = { process: (data) => ({ ...data, phase: 8 }) };
const context = createBOAContext({ seed: world.seed }, { source: "prismatic-velocity" });
const workflow = createCPUWorkflow().use(component);
const boa = createBOA({ workflow });
const boaResult = boa.execute(context);
assert(boaResult.payload.phase === 8, "BOA workflow contract failed");
assert(boaResult.request_id === context.request_id, "BOA context identity was not preserved");

const filterPipeline = createFilterPipeline();
filterPipeline.use({
  id: "query",
  order: 100,
  apply: (items, query) => items.filter((item) => item.name.includes(query)),
});
const filtered = filterPipeline.run({
  items: [{ name: "alpha" }, { name: "beta" }],
  query: "alpha",
});
assert(filtered.length === 1 && filtered[0].name === "alpha", "HOLOCRON filter contract failed");

const core = { start() {}, stop() {} };
const video = { connect() {}, disconnect() {} };
const input = { connect() {}, disconnect() {} };
const runtime = createHolocronRuntime(core, video, input);
assert(runtime.start().status === "runtime-started", "runtime start contract failed");
assert(runtime.state === "running", "runtime state did not become running");
assert(runtime.stop().status === "runtime-stopped", "runtime stop contract failed");

const api = createPrismaticVelocityAPI({ core, video, input });
const apiWorld = api.generateWorld({ seed: 0x2468ace0, width: 16, height: 16 });
const apiMesh = api.buildMesh(apiWorld);
const apiRoute = api.buildRoute(apiWorld);
assert(apiMesh.vertex_count === 256, "unified API mesh contract failed");
assert(apiRoute.cells.length === 16, "unified API traversal contract failed");
assert(api.boa && api.holocron, "unified API integration surface missing");

console.log("Phase 8-9 API tests: GREEN");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runPhase8And9Tests();
}
