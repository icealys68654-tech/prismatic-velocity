import { createGenreFrameworkAPI, getGenreFrameworkCatalog } from "./api/genre-framework.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export async function runGenreFrameworkTests() {
  const catalog = getGenreFrameworkCatalog();
  const genres = Object.keys(catalog);
  const expected = [
    "action", "platformer", "shooter", "rpg", "mmorpg", "action-rpg",
    "strategy", "rts", "tbs", "adventure", "visual-novel", "puzzle",
  ];

  assert(JSON.stringify(genres) === JSON.stringify(expected), "genre catalog must expose all supported genres");

  const calls = [];
  const api = createGenreFrameworkAPI({
    boa: {
      async gather(request) {
        calls.push(["boa", request.genre]);
        return { adapter: "boa", genre: request.genre, state: request.gameState };
      },
    },
    holocron: {
      async abstract(request) {
        calls.push(["holocron", request.genre]);
        return { adapter: "holocron", genre: request.genre, count: request.items.length };
      },
    },
  });

  for (const genre of genres) {
    assert(api.supports(genre), `framework must support ${genre}`);
    const session = api.createSession({ genre, id: `test-${genre}` });
    const first = session.dispatch({ type: "start", state: { score: 10 } });
    const second = session.dispatch({ type: "tick", state: { level: 2 } });
    assert(first.turn === 1 && second.turn === 2, `${genre} session lifecycle must be deterministic`);
    const projection = await api.project({
      genre,
      session,
      items: [{ genre }],
      query: genre,
    });
    assert(projection.genre === genre, `${genre} projection must preserve genre`);
    assert(projection.boa.genre === genre, `${genre} must project through BOA`);
    assert(projection.holocron.genre === genre, `${genre} must project through HOLOCRON`);
  }

  const repeatedA = api.createSession({ genre: "puzzle", state: { score: 7 } });
  const repeatedB = api.createSession({ genre: "puzzle", state: { score: 7 } });
  const stateA = repeatedA.dispatch({ type: "solve", state: { puzzle: 3 } });
  const stateB = repeatedB.dispatch({ type: "solve", state: { puzzle: 3 } });
  assert(JSON.stringify(stateA) === JSON.stringify(stateB), "genre sessions must be reproducible for identical inputs");
  assert(calls.length === genres.length * 2, "every genre must traverse both linked API projections");

  return "Genre framework tests passed";
}
