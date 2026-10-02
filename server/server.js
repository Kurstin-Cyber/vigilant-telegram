// Mystery Night group-night server: plain Node, no dependencies. Same setup as Squad Bingo:
// the TV and the phones get live updates over Server-Sent Events and send actions as small JSON POSTs.
//
//   /tv        the big screen. It runs the story and shows the QR code to join.
//   /          phones: join with a name (or /ABCD with the room code).
//
// The story itself plays in the TV's browser. The server keeps the room: who has joined, who is the
// host, and the question currently on the table with everyone's answers.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { createStore } = require("./store");

const ROOT = path.join(__dirname, "..");
const ROOM_TTL_MS = 12 * 60 * 60 * 1000;
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I or O, to avoid confusion with 1 and 0
const MAX_PLAYERS = 40, MAX_ROOMS = 300, MAX_NAME = 14;
const COMMANDS = new Set(["start", "pause", "resume", "skip", "auto", "closeAsk", "end", "kick", "makeHost", "openTv", "case"]);
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".mp3": "audio/mpeg", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};
// Only these files are served (never the server code, node_modules or the repo itself).
const PUBLIC = /^\/(index\.html|join\.html|check\.html|style\.css|join\.css|js\/[\w./-]+\.js|audio\/(voice|music)\/[\w-]+\.mp3)$/;

const rooms = new Map();

const hostGraceMs = () => Number(process.env.HOST_GRACE_MS) || 60_000;
const isOnline = (p) => (p.streams?.size || 0) > 0;
const clean = (s, n) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n);

// Which code is running. Render sets RENDER_GIT_COMMIT; locally, ask git.
function currentCommit() {
  if (process.env.RENDER_GIT_COMMIT) return process.env.RENDER_GIT_COMMIT;
  try {
    return require("node:child_process").execSync("git rev-parse HEAD", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch { return null; }
}
const VERSION = { commit: currentCommit(), branch: process.env.RENDER_GIT_BRANCH || null, startedAt: new Date().toISOString() };
VERSION.shortCommit = VERSION.commit ? VERSION.commit.slice(0, 7) : "unknown";

// ---- saving rooms, so a restart or sleep doesn't end the night ----
let store = createStore();
const storeKey = (code) => `bf:room:${code}`;
const loading = new Map();
function useStore(s) { store = s; }

function snapshot(room) {
  return {
    code: room.code, caseId: room.caseId, tvToken: room.tvToken, tvWindow: room.tvWindow, created: room.created, hostId: room.hostId, phase: room.phase, status: room.status,
    ask: room.ask, result: room.result, cmdSeq: room.cmdSeq,
    players: [...room.players.values()].map((p) => ({ id: p.id, token: p.token, name: p.name, observer: !!p.observer })),
  };
}
function restore(s) {
  const room = makeRoom(s.code);
  Object.assign(room, { caseId: s.caseId || 'silverblaze', tvToken: s.tvToken || null, tvWindow: s.tvWindow || 0, created: s.created, hostId: s.hostId, phase: s.phase, status: s.status, ask: s.ask, result: s.result, cmdSeq: s.cmdSeq || 0 });
  for (const p of s.players) room.players.set(p.id, { ...p, streams: new Set() });
  return room;
}
function saveSoon(room) {
  clearTimeout(room.saveTimer);
  room.saveTimer = setTimeout(() => {
    store.set(storeKey(room.code), JSON.stringify(snapshot(room)), ROOM_TTL_MS / 1000)
      .catch((err) => console.error(`Couldn't save room ${room.code}: ${err.message}`));
  }, 250);
  room.saveTimer.unref?.();
}
async function getRoom(code) {
  if (rooms.has(code)) return rooms.get(code);
  if (!/^[A-Z]{4}$/.test(code)) return null;
  if (!loading.has(code)) {
    loading.set(code, (async () => {
      try {
        const saved = await store.get(storeKey(code));
        if (!saved || rooms.has(code)) return rooms.get(code) || null;
        const room = restore(JSON.parse(saved));
        rooms.set(code, room);
        return room;
      } catch (err) {
        console.error(`Couldn't load room ${code}: ${err.message}`);
        return null;
      } finally { loading.delete(code); }
    })());
  }
  return loading.get(code);
}
async function newCode() {
  for (;;) {
    let code = "";
    for (let i = 0; i < 4; i++) code += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
    if (rooms.has(code)) continue;
    if (!(await store.exists(storeKey(code)).catch(() => false))) return code;
  }
}

function makeRoom(code) {
  return {
    code, caseId: 'silverblaze', tvToken: null, tvWindow: 0, created: Date.now(), touched: Date.now(),
    players: new Map(), hostId: null, phase: "lobby",
    status: { text: "", episode: 0, paused: false, auto: true },
    ask: null, result: null, cmdSeq: 0, cmds: [], tvs: new Set(),
  };
}

// ---- views ----
const playersView = (room) => [...room.players.values()].map((p) => ({ id: p.id, name: p.name, online: isOnline(p), host: p.id === room.hostId, observer: !!p.observer }));
const tvView = (room) => ({
  code: room.code, caseId: room.caseId, phase: room.phase, status: room.status, hostId: room.hostId, players: playersView(room),
  ask: room.ask ? { id: room.ask.id, answers: room.ask.answers } : null, cmds: room.cmds.slice(-30),
});
function phoneView(room, p) {
  const online = [...room.players.values()].filter((x) => isOnline(x) && !x.observer).length;
  const ask = room.ask && {
    id: room.ask.id, ...room.ask.def, deadline: room.ask.deadline, yourPicks: room.ask.answers[p.id] ?? null,
    answered: Object.keys(room.ask.answers).length, total: online,
  };
  return {
    code: room.code, caseId: room.caseId, you: { id: p.id, name: p.name, host: p.id === room.hostId, observer: !!p.observer }, players: playersView(room),
    phase: room.phase, status: room.status, ask, result: room.result, tvOnline: room.tvs.size > 0, needsTv: !room.tvToken, tvWindow: room.tvWindow > Date.now(), now: Date.now(),
  };
}
function broadcast(room) {
  room.touched = Date.now();
  saveSoon(room);
  const tv = `data: ${JSON.stringify(tvView(room))}\n\n`;
  for (const res of room.tvs) res.write(tv);
  for (const p of room.players.values()) {
    if (!p.streams?.size) continue;
    const data = `data: ${JSON.stringify(phoneView(room, p))}\n\n`;
    for (const res of p.streams) res.write(data);
  }
}

// If the host has gone (battery died, tab closed) while others are still here, hand hosting to
// someone who is online after a grace period.
function checkHost(room) {
  clearTimeout(room.hostTimer);
  const host = room.players.get(room.hostId);
  if (host && isOnline(host)) return;
  if (![...room.players.values()].some(isOnline)) return;
  room.hostTimer = setTimeout(() => {
    const current = room.players.get(room.hostId);
    if (current && isOnline(current)) return;
    const n = [...room.players.values()].find(isOnline);
    if (n && rooms.has(room.code)) { room.hostId = n.id; broadcast(room); }
  }, hostGraceMs());
  room.hostTimer.unref?.();
}

function addPlayer(room, rawName, observer = false) {
  if (room.players.size >= MAX_PLAYERS) throw new HttpError(400, "This game is full.");
  let name = clean(rawName, MAX_NAME) || "Detective";
  const taken = new Set([...room.players.values()].map((p) => p.name.toLowerCase()));
  const base = name; let k = 2;
  while (taken.has(name.toLowerCase())) name = `${base.slice(0, MAX_NAME - 3)} ${k++}`;
  const player = { id: crypto.randomBytes(4).toString("hex"), token: crypto.randomBytes(12).toString("hex"), name, observer: !!observer, streams: new Set() };
  room.players.set(player.id, player);
  if (!room.hostId) room.hostId = player.id; // the first detective in runs the night
  return player;
}

// ---- http plumbing ----
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; if (raw.length > 24_000) reject(new HttpError(413, "Request too large.")); });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new HttpError(400, "Invalid JSON.")); } });
    req.on("error", reject);
  });
}
function serveFile(res, pathname) {
  const file = path.join(ROOT, pathname);
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, { error: "Not found" });
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream", "cache-control": ext === ".html" ? "no-cache" : "public, max-age=3600" });
    res.end(data);
  });
}
function openStream(req, res, room, set, onClose) {
  res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive", "x-accel-buffering": "no" });
  res.write("retry: 2000\n\n");
  set.add(res);
  broadcast(room);
  const ping = setInterval(() => res.write(": ping\n\n"), 25_000);
  req.on("close", () => {
    clearInterval(ping); set.delete(res);
    if (!rooms.has(room.code)) return;
    broadcast(room);
    onClose?.();
  });
}

// A question for the phones. Only these fields are passed on, and they are trimmed.
function cleanOptions(list) {
  return (Array.isArray(list) ? list : []).slice(0, 60).map((o) => ({
    id: clean(o && o.id, 40), label: clean(o && o.label, 120), ...(o && o.portrait ? { portrait: clean(o.portrait, 20) } : {}),
  })).filter((o) => o.id);
}
function cleanAsk(def = {}) {
  const out = { kind: def.kind === "vote" ? "vote" : "pick", title: clean(def.title, 100), intro: clean(def.intro, 240), prompt: clean(def.prompt, 240) };
  if (out.kind === "vote") out.qs = (Array.isArray(def.qs) ? def.qs : []).slice(0, 4).map((q) => ({ id: clean(q && q.id, 24), text: clean(q && q.text, 140), options: cleanOptions(q && q.options) })).filter((q) => q.id);
  else out.options = cleanOptions(def.options);
  if (Number(def.timeoutMs) > 0) out.timeoutMs = Math.min(Number(def.timeoutMs), 120_000);
  return out;
}
function cleanResult(r = {}) {
  return {
    title: clean(r.title, 100), at: Date.now(),
    rows: (Array.isArray(r.rows) ? r.rows : []).slice(0, 4).map((row) => ({
      q: clean(row && row.q, 140),
      lines: (Array.isArray(row && row.lines) ? row.lines : []).slice(0, 12).map((l) => ({ label: clean(l && l.label, 80), count: Math.max(0, Number(l && l.count) | 0), win: !!(l && l.win) })),
    })),
  };
}

// What a phone can do. Commands are host-only.
const PLAYER_ACTIONS = {
  answer: (room, p, body) => {
    if (p.observer) throw new HttpError(400, "You're moderating, so you don't vote.");
    if (!room.ask || room.ask.id !== body.askId) throw new HttpError(409, "That question has already closed.");
    const picks = body.picks;
    if (typeof picks === "string") room.ask.answers[p.id] = clean(picks, 40);
    else if (picks && typeof picks === "object") room.ask.answers[p.id] = Object.fromEntries(Object.entries(picks).slice(0, 4).map(([k, v]) => [clean(k, 24), clean(v, 40)]));
    else throw new HttpError(400, "Bad answer.");
  },
  command: (room, p, body) => {
    const cmd = String(body.cmd || "");
    if (!COMMANDS.has(cmd)) throw new HttpError(400, "Unknown command.");
    if (p.id !== room.hostId) throw new HttpError(403, "Only the host can do that.");
    if (cmd === "kick") {
      const t = room.players.get(body.arg);
      if (!t || t === p) throw new HttpError(400, "Can't remove that player.");
      for (const res of t.streams) res.end();
      room.players.delete(t.id);
      if (room.ask) delete room.ask.answers[t.id];
    } else if (cmd === "case") {
      if (!/^[a-z]{2,20}$/.test(String(body.arg || ""))) throw new HttpError(400, "Unknown case.");
      room.caseId = body.arg;
    } else if (cmd === "openTv") {
      room.tvWindow = Date.now() + 10 * 60_000; // for ten minutes a big screen can connect by typing the code
    } else if (cmd === "makeHost") {
      if (!room.players.has(body.arg) || body.arg === p.id) throw new HttpError(400, "Can't hand hosting to that player.");
      room.hostId = body.arg;
    } else {
      room.cmds.push({ seq: ++room.cmdSeq, cmd, at: Date.now() });
      if (room.cmds.length > 60) room.cmds.splice(0, room.cmds.length - 60);
    }
  },
};
// What the TV can do (it holds the room's TV token).
const TV_ACTIONS = {
  case: (room, body) => { if (/^[a-z]{2,20}$/.test(String(body.id || ""))) room.caseId = body.id; },
  status: (room, body) => {
    room.phase = ["lobby", "playing", "ended"].includes(body.phase) ? body.phase : room.phase;
    room.status = { text: clean(body.text, 120), episode: Number(body.episode) | 0, paused: !!body.paused, auto: body.auto !== false };
  },
  ask: (room, body) => {
    const def = cleanAsk(body.def);
    room.ask = { id: Number(body.id) | 0, def, answers: {}, deadline: def.timeoutMs ? Date.now() + def.timeoutMs : null };
    room.result = null;
  },
  endask: (room, body) => {
    if (room.ask && room.ask.id === (Number(body.id) | 0)) room.ask = null;
    room.result = body.result ? cleanResult(body.result) : null;
  },
};

async function handleApi(req, res, parts) {
  // POST /api/rooms -> the TV opens a room
  if (parts.length === 1 && req.method === "POST") {
    if (rooms.size >= MAX_ROOMS) throw new HttpError(503, "The server is busy. Try again in a few minutes.");
    const body = await readJson(req);
    const room = makeRoom(await newCode());
    rooms.set(room.code, room);
    if (body.name !== undefined) { // a moderator made this game on their phone; a big screen connects later with the code
      const player = addPlayer(room, body.name, !!body.observer);
      room.tvWindow = Date.now() + 10 * 60_000;
      saveSoon(room);
      return send(res, 200, { code: room.code, id: player.id, token: player.token });
    }
    room.tvToken = crypto.randomBytes(12).toString("hex"); // the big screen made this game itself
    saveSoon(room);
    return send(res, 200, { code: room.code, tvToken: room.tvToken });
  }

  const room = await getRoom(String(parts[1] || "").toUpperCase());
  if (!room) return send(res, 404, { error: "No game with that code. Check the screen and try again." });
  const action = parts[2];
  const url = new URL(req.url, "http://x");

  // POST /api/rooms/CODE/join
  if (action === "join" && req.method === "POST") {
    const body = await readJson(req);
    const player = addPlayer(room, body.name);
    broadcast(room);
    return send(res, 200, { code: room.code, id: player.id, token: player.token });
  }

  // POST /api/rooms/CODE/tv-claim: a big screen connects to a game the moderator opened on their phone
  if (action === "tv-claim" && req.method === "POST") {
    if (room.tvToken && !(room.tvWindow > Date.now())) return send(res, 403, { error: "That game already has a big screen. Ask the moderator to tap \"Show on a TV\"." });
    for (const r of room.tvs) r.end();
    room.tvToken = crypto.randomBytes(12).toString("hex");
    room.tvWindow = 0;
    broadcast(room);
    return send(res, 200, { code: room.code, tvToken: room.tvToken });
  }

  // ---- the TV ----
  if (action === "tv") {
    const tvToken = req.headers["x-tv-token"] || url.searchParams.get("token");
    if (!tvToken || !room.tvToken || tvToken !== room.tvToken) return send(res, 401, { error: "This isn't the screen for that room." });
    if (parts[3] === undefined && req.method === "GET") return openStream(req, res, room, room.tvs, () => checkHost(room));
    if (parts[3] === undefined && req.method === "HEAD") return res.writeHead(204).end();
    const handler = TV_ACTIONS[parts[3]];
    if (!handler || req.method !== "POST") return send(res, 404, { error: "Not found" });
    handler(room, await readJson(req));
    broadcast(room);
    return send(res, 200, { ok: true });
  }

  // ---- phones ----
  const token = req.headers["x-player-token"] || url.searchParams.get("token");
  const player = token && [...room.players.values()].find((p) => p.token === token);
  if (!player) return send(res, 401, { error: "You're not in this game. Join again." });
  if (action === "events" && req.method === "GET") { checkHost(room); return openStream(req, res, room, player.streams, () => checkHost(room)); }
  if (action === "events" && req.method === "HEAD") return res.writeHead(204).end();
  const handler = PLAYER_ACTIONS[action];
  if (!handler || req.method !== "POST") return send(res, 404, { error: "Not found" });
  handler(room, player, await readJson(req));
  broadcast(room);
  return send(res, 200, { ok: true });
}

function createServer() {
  return http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, "http://x");
    try {
      if (pathname === "/health") return send(res, 200, { ok: true, rooms: rooms.size, storage: store.name, ...VERSION });
      const parts = pathname.split("/").filter(Boolean);
      if (parts[0] === "api" && parts[1] === "rooms") return await handleApi(req, res, parts.slice(1));
      if (req.method !== "GET" && req.method !== "HEAD") return send(res, 404, { error: "Not found" });
      if (pathname === "/tv") return serveFile(res, "/index.html");
      if (pathname === "/tv/") { res.writeHead(302, { location: "/tv" }); return res.end(); }
      if (pathname === "/host") { res.writeHead(302, { location: "/?host=1" }); return res.end(); }
      if (pathname === "/check") return serveFile(res, "/check.html");
      if (pathname === "/" || /^\/[A-Za-z]{4}$/.test(pathname) || pathname === "/join") return serveFile(res, "/join.html");
      if (PUBLIC.test(pathname)) return serveFile(res, pathname);
      return send(res, 404, { error: "Not found" });
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { error: err.message });
      console.error(err);
      return send(res, 500, { error: "Something went wrong." });
    }
  });
}

// Forget rooms nobody has touched in a while.
function sweep() {
  const cutoff = Date.now() - ROOM_TTL_MS;
  for (const [code, room] of rooms) {
    if (room.touched < cutoff) {
      clearTimeout(room.hostTimer);
      for (const p of room.players.values()) for (const res of p.streams) res.end();
      for (const res of room.tvs) res.end();
      rooms.delete(code);
    }
  }
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  setInterval(sweep, 10 * 60 * 1000).unref();
  createServer().listen(port, process.env.HOST || "0.0.0.0", () => {
    console.log(`Mystery Night running on http://localhost:${port}  (big screen: /tv)`);
  });
}

module.exports = { createServer, rooms, VERSION, useStore };
