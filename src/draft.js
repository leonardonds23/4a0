/* Sorteio dos 10 jogadores com probabilidade ponderada por relevância (GDD §3.3) */
export function samplePlayers(DATA, year, n) {
  const pool = DATA[year].map((pl) => {
    let w = pl.r <= 10 ? 4 : pl.r <= 25 ? 2 : 1;
    if (pl.hl) w += 3;
    return { pl, w };
  });
  const out = [];
  while (out.length < n && pool.length) {
    const tot = pool.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * tot, idx = 0;
    for (let i = 0; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) { idx = i; break; } }
    out.push(pool[idx].pl); pool.splice(idx, 1);
  }
  out.sort((a, b) => a.r - b.r);
  return out;
}
