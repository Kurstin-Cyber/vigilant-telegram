// Deletes voice recordings that no line of the story uses any more.  Usage: node tools/prune_voices.js [--dry]
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const dir = path.join(__dirname, '../audio/voice');
const need = new Set(JSON.parse(execFileSync('node', [path.join(__dirname, 'extract_lines.js')], { maxBuffer: 1e8 }).toString()).map(l => l.hash));
const stale = fs.readdirSync(dir).filter(f => f.endsWith('.mp3') && !need.has(f.slice(0, -4)));
for (const f of stale) if (!process.argv.includes('--dry')) fs.unlinkSync(path.join(dir, f));
console.log(`${stale.length} unused recording(s) ${process.argv.includes('--dry') ? 'found' : 'deleted'}; ${need.size} lines in use.`);
