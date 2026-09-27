import { createGenrePrototypeRuntime } from "./genre-prototype-runtime.js";
import { getGenreFrameworkCatalog } from "./api/genre-framework.js";

const PROTOTYPE_DEFINITIONS = Object.freeze({
  action: { objective: "Reach the transmutation core while defeating encounters.", palette: [0x00eaff, 0xff2b12], geometry: "arena", input: "W/S move · A/D direction · F attack · Space jump" },
  platformer: { objective: "Traverse floating elemental platforms and reach the exit.", palette: [0x7b2cff, 0x00eaff], geometry: "platforms", input: "W/S move · A/D direction · Space jump" },
  shooter: { objective: "Clear the prismatic target field.", palette: [0xff2b12, 0xffdf22], geometry: "targets", input: "W/S move · A/D aim · F fire" },
  rpg: { objective: "Explore the elemental route and complete the quest.", palette: [0xffdf22, 0x7b2cff], geometry: "shrines", input: "W/S move · F interact" },
  mmorpg: { objective: "Visit persistent-world beacons and advance your character.", palette: [0x00eaff, 0x7dff62], geometry: "beacons", input: "W/S move · F interact" },
  "action-rpg": { objective: "Fight through the route, gain experience, and reach the relic.", palette: [0xff2b12, 0x7b2cff], geometry: "relics", input: "W/S move · A/D direction · F attack · Space jump" },
  strategy: { objective: "Capture territory and manage elemental resources.", palette: [0x7dff62, 0xffdf22], geometry: "territory", input: "W/S advance · F build · Enter command" },
  rts: { objective: "Advance continuously while establishing elemental bases.", palette: [0x00eaff, 0x7dff62], geometry: "bases", input: "W/S advance · F build · Enter command" },
  tbs: { objective: "Resolve the battlefield one deterministic turn at a time.", palette: [0xffdf22, 0x00eaff], geometry: "grid", input: "W/S advance · Enter command · F build" },
  adventure: { objective: "Explore landmarks and discover the hidden transmutation story.", palette: [0x7b2cff, 0xffdf22], geometry: "landmarks", input: "W/S explore · F interact · Enter examine" },
  "visual-novel": { objective: "Move through narrative scenes and make deterministic choices.", palette: [0xff2b12, 0x00eaff], geometry: "story", input: "F interact · Enter choice" },
  puzzle: { objective: "Solve the elemental pattern and unlock the prism.", palette: [0x00eaff, 0x7b2cff], geometry: "puzzle", input: "F advance pattern · Enter solve" },
});

function assertGenre(genre) {
  if (!getGenreFrameworkCatalog()[genre]) throw new Error(`Unsupported prototype genre: ${genre}`);
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }

export function getGenrePrototypeCatalog() {
  return Object.fromEntries(Object.entries(PROTOTYPE_DEFINITIONS).map(([genre, definition]) => [
    genre,
    { genre, ...clone(definition), framework: "PRISMATIC EMERGENCE", deterministic: true },
  ]));
}

export function createGenrePrototype({ genre, world, route } = {}) {
  assertGenre(genre);
  const runtime = createGenrePrototypeRuntime({ genre, world, route });
  return {
    genre,
    definition: { genre, ...clone(PROTOTYPE_DEFINITIONS[genre]) },
    runtime,
    start() { return runtime.start(); },
    stop() { return runtime.stop(); },
    step(input = {}) { return runtime.step(input); },
    getState() { return runtime.getState(); },
  };
}

export function prototypeInputForGenre(genre, input) {
  assertGenre(genre);
  const common = { ...input };
  if (genre === "puzzle") return { ...common, pattern: input.attack || input.action, solve: input.action && input.move < 0 };
  if (genre === "visual-novel") return { ...common, choice: input.action ? "advance" : undefined };
  if (["strategy", "rts", "tbs"].includes(genre)) return { ...common, build: input.action, command: input.attack };
  if (["rpg", "mmorpg", "adventure"].includes(genre)) return { ...common, interact: input.attack, examine: input.attack };
  return common;
}
