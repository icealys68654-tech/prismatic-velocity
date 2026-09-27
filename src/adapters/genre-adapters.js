import { createGenreGame } from "../api/genres.js";
import { getGenreFrameworkCatalog } from "../api/genre-framework.js";

const FAMILY = Object.freeze({
  action: ["action", "platformer", "shooter", "action-rpg"],
  role_playing: ["rpg", "mmorpg", "action-rpg"],
  strategy: ["strategy", "rts", "tbs"],
  adventure: ["adventure", "visual-novel"],
  puzzle: ["puzzle"],
});

function makeAdapter(id, genres, catalog) {
  return Object.freeze({
    id,
    genres: [...genres],
    contracts: Object.fromEntries(genres.map((genre) => [genre, catalog[genre]])),
    supports(genre) { return genres.includes(genre); },
    bind({ world, route, genre } = {}) {
      const selected = genre ?? genres[0];
      if (!genres.includes(selected)) throw new Error(`Adapter "${id}" does not support genre "${selected}"`);
      if (!world || !route?.cells?.length) throw new Error("Genre adapter requires world and traversal route");
      return createGenreGame({ genre: selected, world, route });
    },
  });
}

export function createGenreAdapters() {
  const catalog = getGenreFrameworkCatalog();
  return Object.fromEntries(Object.entries(FAMILY).map(([id, genres]) => [id, makeAdapter(id, genres, catalog)]));
}

export function createGenreAdapter(genre) {
  return Object.values(createGenreAdapters()).find((adapter) => adapter.supports(genre)) ?? null;
}
