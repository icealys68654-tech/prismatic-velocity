import { createGenreGame } from "../api/genres.js";

const FAMILY = Object.freeze({
  action: ["action", "platformer", "shooter", "action-rpg"],
  role_playing: ["rpg", "mmorpg", "action-rpg"],
  strategy: ["strategy", "rts", "tbs"],
  adventure: ["adventure", "visual-novel"],
  puzzle: ["puzzle"],
});

function makeAdapter(id, genres) {
  return Object.freeze({
    id,
    genres: [...genres],
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
  return Object.fromEntries(Object.entries(FAMILY).map(([id, genres]) => [id, makeAdapter(id, genres)]));
}

export function createGenreAdapter(genre) {
  return Object.values(createGenreAdapters()).find((adapter) => adapter.supports(genre)) ?? null;
}
