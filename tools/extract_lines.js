// Lists every spoken line (narration + dialogue) in the story as JSON: [{who, text, e, hash}]
// Usage: node tools/extract_lines.js > lines.json
global.window = global;
const fs = require('fs'), path = require('path');
eval(fs.readFileSync(path.join(__dirname, '../js/story.js'), 'utf8') + ';global.STORY = STORY;');

function fnv(str) { // keep in sync with Voice.hash in js/voice.js
  let h = 0x811c9dc5;
  for (const b of Buffer.from(str, 'utf8')) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
const out = new Map(), seen = new Set();
function walk(x) {
  if (!x || typeof x !== 'object' || seen.has(x)) return;
  seen.add(x);
  if (Array.isArray(x)) return x.forEach(walk);
  if (x.nar !== undefined || x.say) {
    const who = x.nar !== undefined ? 'nar' : x.say, text = x.nar !== undefined ? x.nar : x.t;
    const key = who + '|' + text;
    if (/[A-Za-z]/.test(text) && !out.has(key)) out.set(key, { who, text, e: x.e || 'n', hash: fnv(key) });
  }
  for (const k of ['steps', 'then', 'else', 'right', 'skip', 'items', 'opts', 'menu', 'choice', 'present', 'accuse']) walk(x[k]);
  if (typeof x.wrong === 'function') walk(x.wrong('x'));
  else if (x.wrong && typeof x.wrong === 'object') Object.values(x.wrong).forEach(walk);
  if (x.cases) Object.values(x.cases).forEach(walk);
  if (typeof x.if === 'function') { walk(x.then); walk(x.else); }
}
STORY.episodes.forEach(ep => ep.scenes.forEach(sc => walk(sc.steps)));
process.stdout.write(JSON.stringify([...out.values()], null, 1));
