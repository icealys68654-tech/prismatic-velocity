/**
 * Genre-agnostic game API boundary.
 * Intentionally independent of world generation, traversal, and racing.
 */
export const GENRE_CONTRACTS = Object.freeze({
  action: { family: "action", mechanics: ["reflex", "movement", "combat", "obstacles"], mode: "real-time" },
  platformer: { family: "action", mechanics: ["run", "jump", "platforming"], mode: "vertical" },
  shooter: { family: "action", mechanics: ["aim", "fire", "encounters"], mode: "combat" },
  rpg: { family: "role-playing", mechanics: ["experience", "levels", "stats", "quests"], mode: "exploration" },
  mmorpg: { family: "role-playing", mechanics: ["persistent-world", "characters", "quests", "shared-state"], mode: "persistent" },
  "action-rpg": { family: "role-playing", mechanics: ["real-time-combat", "experience", "stats", "loot"], mode: "real-time" },
  strategy: { family: "strategy", mechanics: ["planning", "tactics", "resources"], mode: "territory" },
  rts: { family: "strategy", mechanics: ["continuous-time", "bases", "armies", "resources"], mode: "continuous" },
  tbs: { family: "strategy", mechanics: ["turns", "tactics", "resource-management"], mode: "turn-based" },
  adventure: { family: "adventure", mechanics: ["exploration", "story", "environmental-puzzles"], mode: "exploration" },
  "visual-novel": { family: "adventure", mechanics: ["dialogue", "artwork", "choices"], mode: "narrative" },
  puzzle: { family: "puzzle", mechanics: ["logic", "patterns", "spatial-problem-solving"], mode: "node-graph" },
});

const DEFAULT_STATE = Object.freeze({ status: "ready", score: 0, level: 1, turn: 0, flags: {} });

function clone(value) { return JSON.parse(JSON.stringify(value)); }

export function getGenreFrameworkCatalog() {
  return Object.fromEntries(
    Object.entries(GENRE_CONTRACTS).map(([id, contract]) => [
      id, { id, ...contract, abstraction: "genre-contract", deterministic: true },
    ]),
  );
}

export function createGenreSession({ genre, id = "session-1", state = {} } = {}) {
  if (!GENRE_CONTRACTS[genre]) throw new Error(`Unsupported game genre: ${genre}`);
  let current = { ...clone(DEFAULT_STATE), ...clone(state) };
  return {
    id,
    genre,
    contract: { id: genre, ...GENRE_CONTRACTS[genre] },
    dispatch(event = {}) {
      current = { ...current, ...clone(event.state ?? {}), turn: current.turn + 1, last_event: clone(event.type ?? "tick") };
      return clone(current);
    },
    getState() { return clone(current); },
  };
}

export function createGenreFrameworkAPI({ boa = null, holocron = null } = {}) {
  const catalog = getGenreFrameworkCatalog();
  return {
    catalog,
    supports(genre) { return Boolean(catalog[genre]); },
    createSession(options = {}) { return createGenreSession(options); },
    async project({ genre, session, items = [], query = "", gameState = {} } = {}) {
      if (!catalog[genre]) throw new Error(`Unsupported game genre: ${genre}`);
      const state = session?.getState?.() ?? gameState;
      const result = { genre, state: clone(state), boa: null, holocron: null };
      if (boa?.gather) result.boa = await boa.gather({ genre, gameState: state });
      if (holocron?.abstract) result.holocron = await holocron.abstract({ items, query, genre });
      return result;
    },
  };
}
