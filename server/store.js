// Where group-night rooms are saved so they survive a server restart.
//
// With REDIS_URL set (Render's Key Value service, or any Redis), rooms are saved there.
// Without it, nothing is saved and rooms live only in memory.
// The Redis client below is deliberately tiny (just the commands we use) so the app keeps
// its zero dependencies. (Same store as Squad Bingo.)
const net = require("node:net");
const tls = require("node:tls");

class NoStore {
  get name() { return "memory"; }
  async get() { return null; }
  async set() {}
  async exists() { return false; }
}

class RedisStore {
  constructor(url) {
    this.url = new URL(url);
    this.socket = null;
    this.pending = [];
    this.buffer = Buffer.alloc(0);
    this.downUntil = 0;
  }

  get name() { return "redis"; }

  async get(key) { return this.command("GET", key); }
  async set(key, value, ttlSeconds) { await this.command("SET", key, value, "EX", String(ttlSeconds)); }
  async exists(key) { return (await this.command("EXISTS", key)) === 1; }

  connect() {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      const { hostname, port, protocol, username, password, pathname } = this.url;
      const options = { host: hostname, port: Number(port) || 6379 };
      const socket = protocol === "rediss:" ? tls.connect({ ...options, servername: hostname }) : net.connect(options);
      socket.setNoDelay(true);
      // Don't keep players waiting on a store that isn't answering.
      socket.setTimeout(2_000, () => socket.destroy(new Error("Redis didn't answer")));
      socket.on("data", (chunk) => this.receive(chunk));
      socket.on("error", (err) => this.reset(err));
      socket.on("close", () => this.reset(new Error("Redis connection closed")));
      socket.once(protocol === "rediss:" ? "secureConnect" : "connect", async () => {
        socket.setTimeout(0);
        this.socket = socket;
        try {
          if (password) await this.send(username ? ["AUTH", decodeURIComponent(username), decodeURIComponent(password)] : ["AUTH", decodeURIComponent(password)]);
          const db = pathname.slice(1);
          if (db) await this.send(["SELECT", db]);
          resolve();
        } catch (err) {
          reject(err);
          socket.destroy();
        }
      });
      socket.once("error", reject);
    });
    return this.ready;
  }

  // Drop a broken connection; the next command reconnects.
  reset(err) {
    this.socket = null;
    this.ready = null;
    this.buffer = Buffer.alloc(0);
    for (const p of this.pending.splice(0)) p.reject(err);
  }

  async command(...args) {
    // After a failure, skip the store for a while so games stay quick; they
    // keep running in memory and are saved again once it's back.
    if (Date.now() < this.downUntil) throw new Error("Redis is unavailable");
    try {
      await this.connect();
      return await this.send(args);
    } catch (err) {
      if (!this.downUntil || Date.now() >= this.downUntil) console.error(`Saved games unavailable: ${err.message}. Retrying in 30s.`);
      this.downUntil = Date.now() + 30_000;
      throw err;
    }
  }

  send(args) {
    return new Promise((resolve, reject) => {
      let out = `*${args.length}\r\n`;
      for (const a of args) out += `$${Buffer.byteLength(String(a))}\r\n${a}\r\n`;
      this.pending.push({ resolve, reject });
      this.socket.write(out);
    });
  }

  receive(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    for (;;) {
      const parsed = parse(this.buffer, 0);
      if (!parsed) return; // wait for more data
      this.buffer = this.buffer.subarray(parsed.end);
      const p = this.pending.shift();
      if (!p) continue;
      if (parsed.value instanceof Error) p.reject(parsed.value);
      else p.resolve(parsed.value);
    }
  }
}

// Parse one Redis reply starting at `at`; returns { value, end } or null if incomplete.
function parse(buf, at) {
  const lineEnd = buf.indexOf("\r\n", at);
  if (lineEnd === -1) return null;
  const type = String.fromCharCode(buf[at]);
  const line = buf.toString("utf8", at + 1, lineEnd);
  const next = lineEnd + 2;
  if (type === "+") return { value: line, end: next };
  if (type === "-") return { value: new Error(line), end: next };
  if (type === ":") return { value: Number(line), end: next };
  if (type === "$") {
    const len = Number(line);
    if (len === -1) return { value: null, end: next };
    if (buf.length < next + len + 2) return null;
    return { value: buf.toString("utf8", next, next + len), end: next + len + 2 };
  }
  if (type === "*") {
    const count = Number(line);
    if (count === -1) return { value: null, end: next };
    const items = [];
    let pos = next;
    for (let i = 0; i < count; i++) {
      const item = parse(buf, pos);
      if (!item) return null;
      items.push(item.value);
      pos = item.end;
    }
    return { value: items, end: pos };
  }
  throw new Error(`Unexpected Redis reply: ${type}`);
}

function createStore(env = process.env) {
  return env.REDIS_URL ? new RedisStore(env.REDIS_URL) : new NoStore();
}

module.exports = { createStore, RedisStore, NoStore, parse };
