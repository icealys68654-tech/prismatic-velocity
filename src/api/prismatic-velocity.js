import { generateSourceWorld } from "../world-source.js";
import { buildWorldMesh } from "../world-mesh.js";
import { buildTraversalRoute } from "../traversal.js";
import { createBOA, createCPUWorkflow } from "./boa-api.js";
import { createFilterPipeline, createHolocronRuntime } from "./holocron-api.js";
import { createGenreGame, getGenreCatalog } from "./genres.js";

/**
 * Phase 9 unified Prismatic Velocity API.
 * One application-facing boundary for generation, mesh, traversal, and
 * external-framework-compatible runtime orchestration.
 */
export function createPrismaticVelocityAPI(options = {}) {
  const workflow = createCPUWorkflow();
  const boa = createBOA({ workflow });
  const filters = createFilterPipeline();
  const core = options.core ?? { start() {}, stop() {} };
  const video = options.video ?? { connect() {}, disconnect() {} };
  const input = options.input ?? { connect() {}, disconnect() {} };
  const holocron = createHolocronRuntime(core, video, input);

  return {
    boa,
    holocron,

    generateWorld(params = {}) {
      return generateSourceWorld(params);
    },

    buildMesh(world, options = {}) {
      return buildWorldMesh(world, options);
    },

    buildRoute(world, options = {}) {
      return buildTraversalRoute(world, options);
    },

    getGenreCatalog() {
      return getGenreCatalog();
    },

    createGame({ genre = "action", world, routeOptions = {} } = {}) {
      const sourceWorld = world ?? generateSourceWorld({});
      const route = buildTraversalRoute(sourceWorld, routeOptions);
      return createGenreGame({ genre, world: sourceWorld, route });
    },

    stepGame(game, input = {}) {
      return game.step(input);
    },

    getGameState(game) {
      return game.getState();
    },

    query(items, query = "") {
      return filters.run({ items, query });
    },

    addFilter(filter) {
      filters.use(filter);
      return this;
    },

    execute(data) {
      return boa.execute(data);
    },

    runtime: {
      start: (options) => holocron.start(options),
      stop: () => holocron.stop(),
    },
  };
}
