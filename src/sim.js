import { K, CLAMP_LO, CLAMP_HI, MENTAL_W, ROUND_PEN, SLAMS, ROUNDS } from './config.js';
import { rnd } from './util.js';

export function eff(attrs, w) {
  let num = 0, den = 0;
  for (let i = 0; i < 8; i++) { num += attrs[i] * w[i]; den += w[i]; }
  return num / den;
}

export function pickOpponent(roundIdx, slam, usedKeys, ALL) {
  let pool;
  if (roundIdx <= 2)       pool = ALL.filter((x) => x.r >= 11 && x.r <= 50);
  else if (roundIdx <= 4)  pool = ALL.filter((x) => x.r >= 4 && x.r <= 20);
  else if (roundIdx === 5) pool = ALL.filter((x) => x.r <= 5);
  else                     pool = ALL.filter((x) => x.ch && x.ch.includes(slam.id));
  pool = pool.filter((x) => !usedKeys.has(x.n + x.y));
  if (!pool.length) pool = ALL;
  const o = rnd(pool);
  usedKeys.add(o.n + o.y);
  return o;
}

export function playMatch(me, opp, slam, roundIdx) {
  const myE = eff(me, slam.w), opE = eff(opp.a, slam.w) - (ROUND_PEN[roundIdx] || 0);
  const mnDiff = (me[7] - opp.a[7]) * MENTAL_W;
  let sw = 0, sl = 0; const sets = [];
  while (sw < 3 && sl < 3) {
    let diff = myE - opE;
    if (sw + sl + 1 === 5) diff += mnDiff;
    const pr = Math.max(CLAMP_LO, Math.min(CLAMP_HI, 0.5 + diff * K));
    const win = Math.random() < pr;
    sets.push(setScore(win));
    win ? sw++ : sl++;
  }
  return { won: sw === 3, sets };
}

export function setScore(win) {
  const r = Math.random();
  let a, b;
  if (r < 0.55) { a = 6; b = Math.floor(Math.random() * 5); }
  else if (r < 0.8) { a = 7; b = 5; }
  else { a = 7; b = 6; }
  return win ? [a, b] : [b, a];
}

export function simulateSlam(me, slam, ALL) {
  const usedKeys = new Set();
  const matches = [];
  for (let i = 0; i < 7; i++) {
    const opp = pickOpponent(i, slam, usedKeys, ALL);
    const m = playMatch(me, opp, slam, i);
    matches.push({ round: ROUNDS[i], opp, won: m.won, sets: m.sets });
    if (!m.won) return { slam, won: false, lostRound: ROUNDS[i], lostTo: opp, matches };
  }
  return { slam, won: true, matches };
}

export function simulateSeason(me, ALL) {
  return SLAMS.map((s) => simulateSlam(me, s, ALL));
}
