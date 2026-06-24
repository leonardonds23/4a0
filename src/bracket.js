/* Chaveamento eliminatório do multiplayer local (PvP). Reusa o motor do jogo
   (playMatchVs, simétrico) e a base de dados de adversários históricos. */
import { playMatchVs } from './sim.js';
import { shuffle, lastName } from './util.js';

/* rótulo da rodada pela quantidade de tenistas ainda na chave (potência de 2) */
/* devolve uma CHAVE i18n; o caso genérico carrega o nº de tenistas após '|' */
export function roundLabel(remaining) {
  if (remaining === 2) return 'bracket.final';
  if (remaining === 4) return 'bracket.semi';
  if (remaining === 8) return 'bracket.quarters';
  if (remaining === 16) return 'bracket.r16';
  return 'bracket.roundOf|' + remaining;
}

const overallOf = (a) => Math.round(a.reduce((s, v) => s + v, 0) / a.length);

/* Entrantes = humanos + históricos distintos (por nome) preenchendo o resto.
   Seeding aleatório (shuffle). Devolve um array de tamanho `size`. */
export function buildEntrants(humanPlayers, size, ALL) {
  const entrants = humanPlayers.slice();
  const need = size - entrants.length;
  if (need > 0) {
    const byName = new Map();
    for (const p of ALL) if (!byName.has(p.n)) byName.set(p.n, p);
    let pool = shuffle([...byName.values()]);
    if (pool.length < need) pool = shuffle(ALL.slice()); /* fallback: nome+ano */
    for (let i = 0; i < need; i++) {
      const p = pool[i];
      entrants.push({
        kind: 'historical',
        nick: lastName(p.n) + ' ’' + String(p.y).slice(2),
        name: p.n, y: p.y,
        attrs: p.a,
        overall: overallOf(p.a),
      });
    }
  }
  return shuffle(entrants);
}

/* Pré-simula o chaveamento inteiro (padrão do single-player: simular e depois
   reproduzir). Cada match: { a, b, sets (ótica de A), aWon, winner, label }. */
export function simulateBracket(entrants, slam) {
  const rounds = [];
  let alive = entrants.slice();
  while (alive.length > 1) {
    const label = roundLabel(alive.length);
    const matches = [];
    const winners = [];
    for (let i = 0; i < alive.length; i += 2) {
      const a = alive[i], b = alive[i + 1];
      const r = playMatchVs(a.attrs, b.attrs, slam);
      const winner = r.aWon ? a : b;
      matches.push({ a, b, sets: r.sets, aWon: r.aWon, winner, label });
      winners.push(winner);
    }
    rounds.push(matches);
    alive = winners;
  }
  return { rounds, champion: alive[0] };
}
