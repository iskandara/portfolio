// Merges content/works/*.json (one file per project, edited in the CMS)
// into content/works.json, which is what index.html loads.
// Run automatically on deploy: `node scripts/build-works.mjs`
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const dir = new URL('../content/works/', import.meta.url);
const works = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8')))
  .sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || String(a.title).localeCompare(String(b.title)));

writeFileSync(new URL('../content/works.json', import.meta.url), JSON.stringify({ works }, null, 2) + '\n');
console.log(`works.json built from ${works.length} projects`);
