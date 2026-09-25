// Steppe by Steppe: shared daily statistics.
//   POST /result  {day, map, route, client, guesses, shortest, won, hints, borders}
//   GET  /stats?day=YYYY-MM-DD&map=core&route=START>END
//        -> {played, won, avgOver, avgGuesses, dist: {"0":n,"1":n,"2":n,"3":n,"4":n,"x":n}}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const ROUTE = /^[A-Z]{2}-[A-Z0-9]{1,3}>[A-Z]{2}-[A-Z0-9]{1,3}$/;
const CLIENT = /^[a-z0-9]{6,40}$/;
const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;

function cors(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOW_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
}
const json = (env, body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...cors(env), ...extra } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: cors(env) });

    if (req.method === "POST" && url.pathname === "/result") {
      const b = await req.json().catch(() => null);
      if (!b || !DAY.test(b.day) || !["core", "gs"].includes(b.map) || !ROUTE.test(b.route) || !CLIENT.test(b.client) ||
          !int(b.guesses, 0, 40) || !int(b.shortest, 1, 30) || typeof b.won !== "boolean" || !int(b.hints, 0, 40) ||
          typeof b.borders !== "boolean" || (b.won && b.guesses < b.shortest)) {
        return json(env, { error: "bad_request" }, 400);
      }
      // Only accept results for dates within a day of now (players are in different time zones).
      const diff = Math.abs(Date.parse(b.day + "T12:00:00Z") - Date.now());
      if (diff > 2 * 864e5) return json(env, { error: "bad_day" }, 400);
      await env.DB.prepare(
        "INSERT OR IGNORE INTO results (day, map, route, client, guesses, shortest, won, hints, borders, ts) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)"
      ).bind(b.day, b.map, b.route, b.client, b.guesses, b.shortest, b.won ? 1 : 0, b.hints, b.borders ? 1 : 0, Date.now()).run();
      return json(env, { ok: true });
    }

    if (req.method === "GET" && url.pathname === "/stats") {
      const day = url.searchParams.get("day"), map = url.searchParams.get("map"), route = url.searchParams.get("route");
      if (!DAY.test(day || "") || !["core", "gs"].includes(map) || !ROUTE.test(route || "")) return json(env, { error: "bad_request" }, 400);
      const [agg, dist] = await env.DB.batch([
        env.DB.prepare(
          "SELECT COUNT(*) AS played, COALESCE(SUM(won), 0) AS won, AVG(CASE WHEN won = 1 THEN guesses - shortest END) AS avgOver, AVG(CASE WHEN won = 1 THEN guesses END) AS avgGuesses FROM results WHERE day = ?1 AND map = ?2 AND route = ?3"
        ).bind(day, map, route),
        env.DB.prepare(
          "SELECT CASE WHEN won = 0 THEN 'x' ELSE CAST(MIN(guesses - shortest, 4) AS TEXT) END AS k, COUNT(*) AS n FROM results WHERE day = ?1 AND map = ?2 AND route = ?3 GROUP BY k"
        ).bind(day, map, route),
      ]);
      const a = agg.results[0];
      const d = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, x: 0 };
      for (const r of dist.results) d[r.k] = r.n;
      return json(env, { played: a.played, won: a.won, avgOver: a.avgOver, avgGuesses: a.avgGuesses, dist: d });
    }

    return json(env, { error: "not_found" }, 404);
  },
};
