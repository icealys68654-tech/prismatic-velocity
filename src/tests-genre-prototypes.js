import { generateSourceWorld } from "./world-source.js";
import { buildTraversalRoute } from "./traversal.js";
import { getGenrePrototypeCatalog, createGenrePrototype, prototypeInputForGenre } from "./genre-prototypes.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function runGenrePrototypeTests() {
  const world = generateSourceWorld({ seed: 0x31415926, width: 64, height: 64 });
  const route = buildTraversalRoute(world);
  const catalog = getGenrePrototypeCatalog();
  const genres = Object.keys(catalog);

  assert(genres.length === 12, "genre prototype catalog must expose all 12 supported genres");

  const results = genres.map((genre) => {
    const prototype = createGenrePrototype({ genre, world, route });
    const first = prototype.start();
    const before = JSON.stringify(first);
    prototype.step(prototypeInputForGenre(genre, { move: 1, forward: 1, attack: true, action: true }));
    const after = prototype.getState();
    assert(after.genre === genre, `${genre} state must preserve genre`);
    assert(Number.isFinite(after.route_index), `${genre} route index must be numeric`);
    assert(after.position && Number.isFinite(after.position.x), `${genre} must expose 3D runtime position`);
    assert(before !== JSON.stringify(after) || genre === "puzzle", `${genre} prototype must produce a runtime state`);
    prototype.stop();
    return { genre, objective: catalog[genre].objective, geometry: catalog[genre].geometry };
  });

  const repeatedA = createGenrePrototype({ genre: "strategy", world, route });
  const repeatedB = createGenrePrototype({ genre: "strategy", world, route });
  repeatedA.start();
  repeatedB.start();
  const input = prototypeInputForGenre("strategy", { move: 1, attack: true, action: true });
  assert(JSON.stringify(repeatedA.step(input)) === JSON.stringify(repeatedB.step(input)), "identical genre inputs must be deterministic");

  return results;
}
