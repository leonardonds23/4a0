// Monte Carlo da simulação (convenção do projeto: rodar 20k temporadas ao
// alterar parâmetros de balanceamento). Usa o MESMO motor do jogo
// (src/sim.js + src/draft.js): cada temporada começa com um draft real.
//
//   npm run montecarlo [n]
//
// Perfis de drafter:
//   elite — sempre escolhe a maior nota entre as 10 opções (jogador otimizador)
//   bom   — escolhe entre as 3 melhores notas ao acaso (jogador casual forte)
import fs from 'node:fs';
import path from 'node:path';
import { buildData } from '../src/data.js';
import { samplePlayers } from '../src/draft.js';
import { simulateSeason, applyStyle } from '../src/sim.js';
import { STYLES } from '../src/config.js';
import { rnd } from '../src/util.js';

const root = new URL('..', import.meta.url).pathname;
const dataDir = path.join(root, 'public/data');
const years = JSON.parse(fs.readFileSync(path.join(dataDir, 'years.json'), 'utf8'));
const files = years.map((y) => JSON.parse(fs.readFileSync(path.join(dataDir, `${y}.json`), 'utf8')));
const { DATA, YEARS, ALL } = buildData(files);

const N = Number(process.argv[2]) || 20000;

/* Draft completo: 8 rodadas, ano sorteado, 10 opções, sem repetir jogador.
   pickIdx escolhe a posição (0 = maior nota) entre as opções ordenadas. */
function draftBuild(pickIdx) {
  const build = Array(8).fill(0);
  const usedNames = new Set();
  for (let k = 0; k < 8; k++) {
    const year = rnd(YEARS);
    const options = samplePlayers(DATA, year, 10).filter((pl) => !usedNames.has(pl.n));
    const sorted = options.slice().sort((a, b) => b.a[k] - a.a[k]);
    const choice = sorted[Math.min(pickIdx(), sorted.length - 1)];
    build[k] = choice.a[k];
    usedNames.add(choice.n);
  }
  return build;
}

function run(name, pickIdx, styleId = 'allcourt') {
  const byScore = [0, 0, 0, 0, 0];
  let avgSum = 0;
  for (let i = 0; i < N; i++) {
    const build = draftBuild(pickIdx);
    avgSum += build.reduce((s, v) => s + v, 0) / 8;
    const wins = simulateSeason(applyStyle(build, styleId), ALL).filter((r) => r.won).length;
    byScore[wins]++;
  }
  const pct = (x) => ((100 * x) / N).toFixed(2) + '%';
  console.log(`\n${name} — ${N} temporadas (média do build: ${(avgSum / N).toFixed(1)})`);
  console.log(`  4-0: ${pct(byScore[4])} | 3-1: ${pct(byScore[3])} | 2-2: ${pct(byScore[2])} | 1-3: ${pct(byScore[1])} | 0-4: ${pct(byScore[0])}`);
}

run('Drafter elite (sempre a maior nota)', () => 0);
run('Drafter bom (top 3 ao acaso)       ', () => Math.floor(Math.random() * 3));

console.log('\n=== Balanceamento por estilo (drafter elite) ===');
for (const s of STYLES) run(`Estilo ${s.nm}`, () => 0, s.id);
