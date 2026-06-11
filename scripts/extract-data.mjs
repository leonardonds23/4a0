// One-off migration: extracts the player DATA from the original prototype
// (prototype/index.html) and writes /public/data/<year>.json in the GDD §7.1 format.
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const html = fs.readFileSync(path.join(root, 'prototype/index.html'), 'utf8');

const match = html.match(/const DATA = \{([\s\S]*?)\};\s*\nconst YEARS/);
if (!match) throw new Error('DATA block not found in prototype/index.html');

const p = (n, c, r, hl, ch, a) => ({ n, c, r, hl, ch, a });
const DATA = new Function('p', `return {${match[1]}};`)(p);

const ATTR_KEYS = ['sv', 'rt', 'fh', 'bh', 'sl', 'vl', 'mv', 'mn'];

const slug = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const years = Object.keys(DATA).map(Number).sort((a, b) => a - b);
const outDir = path.join(root, 'public/data');
fs.mkdirSync(outDir, { recursive: true });

for (const year of years) {
  const players = DATA[year].map((pl) => ({
    id: slug(pl.n),
    name: pl.n,
    country: pl.c,
    rank: pl.r,
    highlight: pl.hl || null,
    champion: pl.ch && pl.ch.length ? pl.ch : null,
    attrs: Object.fromEntries(ATTR_KEYS.map((k, i) => [k, pl.a[i]])),
  }));
  fs.writeFileSync(
    path.join(outDir, `${year}.json`),
    JSON.stringify({ year, players }, null, 2) + '\n'
  );
  console.log(`${year}.json — ${players.length} players`);
}

fs.writeFileSync(path.join(outDir, 'years.json'), JSON.stringify(years) + '\n');
console.log(`years.json — ${years.length} years`);
