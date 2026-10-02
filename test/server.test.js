const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer, rooms } = require("../server/server");

let server, base;
test.before(async () => {
  server = createServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => { server.closeAllConnections(); server.close(); });

async function post(path, body, headers = {}) {
  const res = await fetch(base + path, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body || {}) });
  return { status: res.status, body: await res.json() };
}
// Read SSE messages until `until` returns true.
async function stateWhen(path, until) {
  const ctrl = new AbortController();
  const res = await fetch(base + path, { signal: ctrl.signal });
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value } = await reader.read();
    buf += dec.decode(value);
    for (const block of buf.split("\n\n").slice(0, -1)) {
      const line = block.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const state = JSON.parse(line.slice(6));
      if (until(state)) { ctrl.abort(); return state; }
    }
    buf = buf.slice(buf.lastIndexOf("\n\n") + 2);
  }
}

test("health, and pages are served", async () => {
  const h = await (await fetch(base + "/health")).json();
  assert.equal(h.ok, true);
  for (const [p, needle] of [["/", "Join"], ["/ABCD", "Join"], ["/tv", "Blackwood"], ["/js/art.js", "Art"], ["/style.css", "--gold"]]) {
    const r = await fetch(base + p);
    assert.equal(r.status, 200, p);
    assert.match(await r.text(), new RegExp(needle), p);
  }
  assert.equal((await fetch(base + "/server/server.js")).status, 404);
  assert.equal((await fetch(base + "/../package.json")).status, 404);
  assert.equal((await fetch(base + "/package.json")).status, 404);
});

test("the TV opens a room, the first player becomes host", { timeout: 15000 }, async () => {
  const tv = await post("/api/rooms");
  assert.equal(tv.status, 200);
  assert.match(tv.body.code, /^[A-Z]{4}$/);
  const { code, tvToken } = tv.body;

  assert.equal((await post("/api/rooms/ZZZZ/join", { name: "X" })).status, 404);
  const a = await post(`/api/rooms/${code.toLowerCase()}/join`, { name: "  Ana<script>  " });
  const b = await post(`/api/rooms/${code}/join`, { name: "Ana" });
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);

  const seen = await stateWhen(`/api/rooms/${code}/tv?token=${tvToken}`, (s) => s.players.length === 2);
  assert.deepEqual(seen.players.map((p) => p.name), ["Anascript", "Ana"]);
  assert.equal(seen.players[0].host, true);
  assert.equal(seen.players[1].host, false);

  const view = await stateWhen(`/api/rooms/${code}/events?token=${b.body.token}`, () => true);
  assert.equal(view.you.host, false);
  assert.equal(view.phase, "lobby");

  // wrong or missing tokens are refused
  assert.equal((await fetch(`${base}/api/rooms/${code}/tv?token=nope`)).status, 401);
  assert.equal((await fetch(`${base}/api/rooms/${code}/events?token=nope`)).status, 401);
});

test("host commands reach the TV, other players cannot send them", { timeout: 15000 }, async () => {
  const { body: { code, tvToken } } = await post("/api/rooms");
  const host = (await post(`/api/rooms/${code}/join`, { name: "Host" })).body;
  const guest = (await post(`/api/rooms/${code}/join`, { name: "Guest" })).body;
  const h = { "x-player-token": host.token }, g = { "x-player-token": guest.token };

  assert.equal((await post(`/api/rooms/${code}/command`, { cmd: "start" }, g)).status, 403);
  assert.equal((await post(`/api/rooms/${code}/command`, { cmd: "bogus" }, h)).status, 400);
  assert.equal((await post(`/api/rooms/${code}/command`, { cmd: "start" }, h)).status, 200);
  const s = await stateWhen(`/api/rooms/${code}/tv?token=${tvToken}`, (x) => x.cmds.length === 1);
  assert.equal(s.cmds[0].cmd, "start");

  // hand over hosting, then remove the old host
  assert.equal((await post(`/api/rooms/${code}/command`, { cmd: "makeHost", arg: guest.id }, h)).status, 200);
  assert.equal((await post(`/api/rooms/${code}/command`, { cmd: "kick", arg: host.id }, h)).status, 403);
  assert.equal((await post(`/api/rooms/${code}/command`, { cmd: "kick", arg: host.id }, g)).status, 200);
  const after = await stateWhen(`/api/rooms/${code}/tv?token=${tvToken}`, () => true);
  assert.deepEqual(after.players.map((p) => p.name), ["Guest"]);
  assert.equal(after.players[0].host, true);
});

test("a question goes to the phones and answers come back to the TV", { timeout: 15000 }, async () => {
  const { body: { code, tvToken } } = await post("/api/rooms");
  const p1 = (await post(`/api/rooms/${code}/join`, { name: "One" })).body;
  const p2 = (await post(`/api/rooms/${code}/join`, { name: "Two" })).body;
  const tv = { "x-tv-token": tvToken };

  const ask = { kind: "vote", title: "Verdict", qs: [{ id: "q1", text: "Who?", options: [{ id: "a", label: "A", portrait: "hale" }, { id: "b", label: "B" }] }] };
  assert.equal((await post(`/api/rooms/${code}/tv/ask`, { id: 7, def: ask }, { "x-tv-token": "bad" })).status, 401);
  assert.equal((await post(`/api/rooms/${code}/tv/ask`, { id: 7, def: ask }, tv)).status, 200);

  const phone = await stateWhen(`/api/rooms/${code}/events?token=${p1.token}`, (s) => s.ask);
  assert.equal(phone.ask.id, 7);
  assert.equal(phone.ask.qs[0].options.length, 2);
  assert.equal(phone.ask.yourPicks, null);

  assert.equal((await post(`/api/rooms/${code}/answer`, { askId: 99, picks: { q1: "a" } }, { "x-player-token": p1.token })).status, 409);
  assert.equal((await post(`/api/rooms/${code}/answer`, { askId: 7, picks: { q1: "a" } }, { "x-player-token": p1.token })).status, 200);
  assert.equal((await post(`/api/rooms/${code}/answer`, { askId: 7, picks: { q1: "b" } }, { "x-player-token": p2.token })).status, 200);

  const answered = await stateWhen(`/api/rooms/${code}/tv?token=${tvToken}`, (s) => s.ask && Object.keys(s.ask.answers).length === 2);
  assert.deepEqual(answered.ask.answers[p1.id], { q1: "a" });
  assert.deepEqual(answered.ask.answers[p2.id], { q1: "b" });

  const result = { title: "Verdict", rows: [{ q: "Who?", lines: [{ label: "A", count: 1, win: true }, { label: "B", count: 1 }] }] };
  assert.equal((await post(`/api/rooms/${code}/tv/endask`, { id: 7, result }, tv)).status, 200);
  const after = await stateWhen(`/api/rooms/${code}/events?token=${p2.token}`, () => true);
  assert.equal(after.ask, null);
  assert.equal(after.result.rows[0].lines[0].count, 1);
});

test("a long evidence list reaches the phones intact", { timeout: 15000 }, async () => {
  const { body: { code, tvToken } } = await post("/api/rooms");
  const p = (await post(`/api/rooms/${code}/join`, { name: "One" })).body;
  const options = Array.from({ length: 40 }, (_, i) => ({ id: `clue${i}`, label: `Clue number ${i} with a reasonably long name` }));
  assert.equal((await post(`/api/rooms/${code}/tv/ask`, { id: 1, def: { kind: "pick", prompt: "Show something", options } }, { "x-tv-token": tvToken })).status, 200);
  const phone = await stateWhen(`/api/rooms/${code}/events?token=${p.token}`, (s) => s.ask);
  assert.equal(phone.ask.options.length, 40);
});

test("a moderator can create the game on their phone and a big screen connects with the code", { timeout: 15000 }, async () => {
  const mod = await post("/api/rooms", { name: "Mo", observer: true });
  assert.equal(mod.status, 200);
  const { code } = mod.body;
  assert.match(code, /^[A-Z]{4}$/);

  // the TV is not connected yet, so nothing can be sent as the TV
  assert.equal((await post(`/api/rooms/${code}/tv/status`, {}, { "x-tv-token": "x" })).status, 401);
  const view0 = await stateWhen(`/api/rooms/${code}/events?token=${mod.body.token}`, () => true);
  assert.equal(view0.needsTv, true);
  assert.equal(view0.you.host, true);
  assert.equal(view0.you.observer, true);

  // the big screen types the code
  assert.equal((await post(`/api/rooms/ZZZZ/tv-claim`)).status, 404);
  const claim = await post(`/api/rooms/${code.toLowerCase()}/tv-claim`);
  assert.equal(claim.status, 200);
  assert.ok(claim.body.tvToken);
  // a second screen cannot grab it, unless the moderator allows it
  assert.equal((await post(`/api/rooms/${code}/tv-claim`)).status, 403);
  assert.equal((await post(`/api/rooms/${code}/command`, { cmd: "openTv" }, { "x-player-token": mod.body.token })).status, 200);
  const claim2 = await post(`/api/rooms/${code}/tv-claim`);
  assert.equal(claim2.status, 200);
  assert.notEqual(claim2.body.tvToken, claim.body.tvToken);
  assert.equal((await post(`/api/rooms/${code}/tv/status`, {}, { "x-tv-token": claim.body.tvToken })).status, 401); // the old screen is out

  // a moderator who is not playing cannot vote and is not counted as a voter
  const pat = (await post(`/api/rooms/${code}/join`, { name: "Pat" })).body;
  const tv = { "x-tv-token": claim2.body.tvToken };
  await post(`/api/rooms/${code}/tv/ask`, { id: 1, def: { kind: "pick", prompt: "Which?", options: [{ id: "a", label: "A" }] } }, tv);
  assert.equal((await post(`/api/rooms/${code}/answer`, { askId: 1, picks: "a" }, { "x-player-token": mod.body.token })).status, 400);
  assert.equal((await post(`/api/rooms/${code}/answer`, { askId: 1, picks: "a" }, { "x-player-token": pat.token })).status, 200);
  const seen = await stateWhen(`/api/rooms/${code}/events?token=${pat.token}`, (s) => s.ask);
  assert.equal(seen.ask.total, 1);
  assert.equal(seen.players.find((p) => p.name === "Mo").observer, true);
});

test("rooms are saved and come back after a restart", async () => {
  const saved = new Map();
  const { useStore } = require("../server/server");
  useStore({ name: "test", get: async (k) => saved.get(k) ?? null, set: async (k, v) => { saved.set(k, v); }, exists: async (k) => saved.has(k) });
  const { body: { code } } = await post("/api/rooms");
  const p = (await post(`/api/rooms/${code}/join`, { name: "Sam" })).body;
  await new Promise((r) => setTimeout(r, 400)); // saves are debounced
  assert.ok(saved.has(`bf:room:${code}`));
  rooms.delete(code); // a restart forgets everything in memory
  const view = await stateWhen(`/api/rooms/${code}/events?token=${p.token}`, () => true);
  assert.equal(view.you.name, "Sam");
  assert.equal(view.you.host, true);
  useStore({ name: "memory", get: async () => null, set: async () => {}, exists: async () => false });
});
