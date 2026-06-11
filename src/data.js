import { ATTR_KEYS } from './config.js';

/* Converte os arquivos /data/<ano>.json (formato GDD §7.1) para o formato interno
   do motor: {n: nome, c: país, r: rank, hl: destaque, ch: slams vencidos, a: [8 notas]}.
   Pura — também usada pelo Monte Carlo em Node. */
export function buildData(yearFiles) {
  const DATA = {};
  for (const f of yearFiles) {
    DATA[f.year] = f.players.map((pl) => ({
      n: pl.name,
      c: pl.country,
      r: pl.rank,
      hl: pl.highlight || '',
      ch: pl.champion || [],
      a: ATTR_KEYS.map((k) => pl.attrs[k]),
    }));
  }
  const YEARS = yearFiles.map((f) => f.year).sort((a, b) => a - b);
  const ALL = [];
  YEARS.forEach((y) => DATA[y].forEach((pl) => ALL.push({ ...pl, y })));
  return { DATA, YEARS, ALL };
}

export async function loadData() {
  const base = import.meta.env.BASE_URL;
  const years = await fetch(`${base}data/years.json`).then((r) => r.json());
  const files = await Promise.all(
    years.map((y) => fetch(`${base}data/${y}.json`).then((r) => r.json()))
  );
  return buildData(files);
}
