import './style.css';
import { ATTRS, CHIP_POS, SLAMS, WC_BY_MODE } from './config.js';
import { ICONS, RACKET, courtSVG, trophySVG } from './icons.js';
import { rnd, shuffle, lastName } from './util.js';
import { loadData } from './data.js';
import { samplePlayers } from './draft.js';
import { simulateSeason } from './sim.js';

const $ = (id) => document.getElementById(id);

function show(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('on'));
  $(id).classList.add('on');
  window.scrollTo(0, 0);
}

/* home: quadra com os 4 troféus */
(function () {
  const slamPos = [['AO', 30, 27, 'var(--ao)'], ['RG', 70, 27, 'var(--rg)'], ['WB', 30, 73, 'var(--wb)'], ['US', 70, 73, 'var(--us)']];
  let h = courtSVG();
  slamPos.forEach(([id, x, y, col]) => {
    h += `<div class="trophy" style="left:${x}%;top:${y}%;">
      ${trophySVG(id)}<span class="tLb" style="background:${col}">${id}</span></div>`;
  });
  $('homeCourt').innerHTML = h;
  $('racket').innerHTML = RACKET;
})();

/* ================= ESTADO ================= */
let DATA = {}, YEARS = [], ALL = [];
let mode = 'classic';
let st = null;

function setMode(m) {
  mode = m;
  $('mClassic').classList.toggle('sel', m === 'classic');
  $('mAlmanac').classList.toggle('sel', m === 'almanac');
}

/* ================= DRAFT ================= */
function startRun() {
  if (!YEARS.length) return; /* dados ainda carregando */
  st = {
    order: shuffle(ATTRS.map((a) => a.k)),
    round: 0,
    drawn: false,
    picks: Array(8).fill(null),
    usedNames: new Set(),
    wc: WC_BY_MODE[mode],
    year: null, options: null,
    slamResults: [],
  };
  renderDraft();
  show('scrDraft');
}
function currentAttr() { return ATTRS[st.order[st.round]]; }

function rollDraw() {
  if (!st || st.drawn || st.rolling || st.round >= 8) return;
  st.rolling = true;
  $('rollBox').className = 'rollBox off';
  const finalYear = rnd(YEARS);
  const aEl = $('drawAttr');
  const yEl = $('drawYear');
  let t = 0;
  const iv = setInterval(() => {
    t++;
    const ra = ATTRS[Math.floor(Math.random() * 8)];
    aEl.innerHTML = ICONS[ra.ic] + ' ' + ra.nm;
    yEl.textContent = rnd(YEARS);
    if (t >= 12) {
      clearInterval(iv);
      st.rolling = false;
      st.year = finalYear;
      st.options = samplePlayers(DATA, finalYear, 10);
      st.drawn = true;
      renderDraft();
    }
  }, 75);
}

/* trocas: o jogador escolhe se troca o ano ou o atributo */
function wcYear() {
  if (!st || !st.drawn || st.wc <= 0) return;
  st.wc--;
  let y = rnd(YEARS);
  while (YEARS.length > 1 && y === st.year) y = rnd(YEARS);
  st.year = y;
  st.options = samplePlayers(DATA, y, 10);
  renderDraft();
}
function wcAttr() {
  if (!st || !st.drawn || st.wc <= 0 || st.round >= 7) return;
  st.wc--;
  const j = st.round + 1 + Math.floor(Math.random() * (8 - st.round - 1));
  [st.order[st.round], st.order[j]] = [st.order[j], st.order[st.round]];
  renderDraft();
}

function renderDraft() {
  const at = currentAttr();
  const drawn = st.drawn;
  $('drawAttr').innerHTML = drawn ? ICONS[at.ic] + ' ' + at.nm : '—';
  $('drawYear').textContent = drawn ? st.year : '—';
  $('wcN').textContent = st.wc;
  $('wcYearBtn').disabled = !drawn || st.wc <= 0;
  $('wcAttrBtn').disabled = !drawn || st.wc <= 0 || st.round >= 7;
  $('rollBox').className = 'rollBox' + (drawn ? ' off' : '');
  $('boxProg').textContent = 'SEU TENISTA · ' + st.round + '/8';

  const picked = st.picks.filter(Boolean);
  const avgEl = $('boxAvg');
  if (mode === 'classic' && picked.length) {
    avgEl.style.display = 'block';
    $('avgN').textContent = Math.round(picked.reduce((s, p) => s + p.val, 0) / picked.length);
  } else avgEl.style.display = 'none';

  /* quadra: 4 chips de cada lado */
  let h = courtSVG();
  ATTRS.forEach((a) => {
    const [x, y] = CHIP_POS[a.k];
    const pick = st.picks[a.k];
    const isNow = drawn && a.k === at.k;
    const cls = 'chip' + (pick ? ' done' : '') + (isNow ? ' cur' : '');
    const inner = pick
      ? (mode === 'classic' ? pick.val : '✓')
      : ICONS[a.ic];
    const tag = pick ? lastName(pick.name) + ' ’' + String(pick.y).slice(2) : '–';
    h += `<div class="${cls}" style="left:${x}%;top:${y}%;">
            <span class="lbA">${a.nm}</span>
            <div class="cir">${inner}</div>
            <span class="lb">${tag}</span></div>`;
  });
  $('draftCourt').innerHTML = h;

  /* lista de jogadores */
  const list = $('plist');
  list.innerHTML = '';
  if (!drawn) {
    list.innerHTML = `<div class="plistHint">Clique na raquete para sortear o atributo e o ano.</div>`;
    return;
  }
  st.options.forEach((pl) => {
    const used = st.usedNames.has(pl.n);
    const val = pl.a[at.k];
    const btn = document.createElement('button');
    btn.className = 'pl' + (used ? ' used' : '');
    const sub = `ATP #${pl.r}` + (pl.hl ? ` <span style="color:var(--line)">|</span> <span class="feat">⭐ ${pl.hl}</span>` : '');
    const right = used
      ? `<span class="usedTag">JÁ USADO</span>`
      : (mode === 'classic' ? `<span class="rating">${val}</span>` : `<span class="rating" style="color:var(--line)">?</span>`);
    btn.innerHTML = `<div class="info"><div class="nm">${pl.n} <small>${pl.c}</small></div><div class="sub">${sub}</div></div>${right}`;
    if (!used) btn.onclick = () => pick(pl);
    list.appendChild(btn);
  });
}

function pick(pl) {
  const at = currentAttr();
  st.picks[at.k] = { name: pl.n, y: st.year, val: pl.a[at.k] };
  st.usedNames.add(pl.n);
  st.round++;
  st.drawn = false;
  if (st.round < 8) { renderDraft(); }
  else { startSeason(); }
}

function myAttrs() { return st.picks.map((p) => p.val); }

/* ================= TEMPORADA ================= */
let seasonIdx, matchIdx, autoTimer = null;

function startSeason() {
  st.slamResults = simulateSeason(myAttrs(), ALL);
  seasonIdx = 0; matchIdx = 0;
  renderSeasonHead(true);
  $('nextBtn').textContent = 'Avançar →';
  show('scrSeason');
}
function renderSeasonHead(clearList) {
  const slam = SLAMS[seasonIdx];
  const tabs = $('slamTabs');
  tabs.innerHTML = '';
  SLAMS.forEach((s, i) => {
    const t = document.createElement('div');
    let cls = 'stab';
    if (i < seasonIdx) cls += st.slamResults[i].won ? ' won' : ' lost';
    else if (i === seasonIdx) cls += ' cur';
    t.className = cls;
    t.textContent = (i < seasonIdx ? (st.slamResults[i].won ? '🏆 ' : '❌ ') : '') + s.id;
    tabs.appendChild(t);
  });
  const head = $('slamHead');
  head.style.background = slam.col;
  head.innerHTML = `<div class="nm">${slam.nm}</div><div class="sf">${slam.sf}</div>`;
  if (clearList) $('matches').innerHTML = '';
  $('lossBox').style.display = 'none';
  $('seasonCtr').style.display = 'flex';
}
function appendMatchLine(m) {
  const div = document.createElement('div');
  div.className = 'mt ' + (m.won ? 'W' : 'L');
  div.innerHTML = `<span class="rd">${m.round}</span>
    <span class="opp">${m.opp.n} <small>’${String(m.opp.y).slice(2)}</small></span>
    <span class="sc">${m.sets.map((s) => s[0] + '-' + s[1]).join(' ')}</span>
    <span style="font-size:15px">${m.won ? '✅' : '❌'}</span>`;
  $('matches').appendChild(div);
}
function showLossBox(m) {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; $('autoBtn').textContent = 'Auto ⏩'; }
  const res = st.slamResults[seasonIdx];
  $('seasonCtr').style.display = 'none';
  $('lossT').textContent = 'Eliminado — ' + res.slam.nm;
  $('lossD').textContent = m.round + ' · vs ' + m.opp.n + ' ’' + String(m.opp.y).slice(2);
  $('lossCont').textContent = (seasonIdx < 3) ? 'Continuar temporada →' : 'Ver resultado 🏁';
  $('lossBox').style.display = 'block';
}
function lossContinue() {
  if (seasonIdx < 3) { seasonIdx++; matchIdx = 0; renderSeasonHead(true); }
  else showResult();
}
function stepSim() {
  const res = st.slamResults[seasonIdx];
  if (matchIdx < res.matches.length) {
    const m = res.matches[matchIdx];
    appendMatchLine(m);
    matchIdx++;
    if (!m.won) { showLossBox(m); return; }
    if (matchIdx === res.matches.length && seasonIdx === 3) {
      $('nextBtn').textContent = 'Ver resultado 🏁';
    }
  } else {
    if (seasonIdx < 3) { seasonIdx++; matchIdx = 0; renderSeasonHead(true); }
    else showResult();
  }
}
function autoSim() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; $('autoBtn').textContent = 'Auto ⏩'; return; }
  $('autoBtn').textContent = 'Pausar ⏸';
  autoTimer = setInterval(() => {
    const res = st.slamResults[seasonIdx];
    if (matchIdx < res.matches.length) {
      const m = res.matches[matchIdx];
      appendMatchLine(m); matchIdx++;
      if (!m.won) { showLossBox(m); }
    }
    else if (seasonIdx < 3) { seasonIdx++; matchIdx = 0; renderSeasonHead(true); }
    else { clearInterval(autoTimer); autoTimer = null; showResult(); }
  }, 280);
}

/* ================= RESULTADO ================= */
function showResult() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  const wins = st.slamResults.filter((r) => r.won).length;
  const sc = $('resScore');
  sc.textContent = wins + '–' + (4 - wins);
  sc.className = 'resScore' + (wins === 4 ? ' perfect' : '');
  const msgs = {
    4: '<b>GOLDEN SLAM!</b> Você venceu os 4 e entrou para a história.',
    3: 'Brilhante. Mas perfeição era o objetivo.',
    2: 'Seu tenista era ótimo. Só não era perfeito.',
    1: 'Uma temporada para esquecer — e tentar de novo.',
    0: 'Até os maiores têm anos ruins.',
  };
  $('resMsg').innerHTML = msgs[wins];
  $('resMode').textContent = mode === 'classic' ? 'MODO CLÁSSICO' : 'MODO ALMANAQUE';

  const rs = $('resSlams');
  rs.innerHTML = '';
  st.slamResults.forEach((r) => {
    const d = document.createElement('div');
    d.className = 'rs1';
    d.innerHTML = `<span class="em">${r.won ? '🏆' : '❌'}</span>
      <span class="nm">${r.slam.nm}</span>
      <span class="dt">${r.won ? 'Campeão' : r.lostRound + ' · vs ' + lastName(r.lostTo.n) + ' ’' + String(r.lostTo.y).slice(2)}</span>`;
    rs.appendChild(d);
  });

  const b = $('resBuild');
  b.innerHTML = '';
  ATTRS.forEach((a) => {
    const pk = st.picks[a.k];
    const d = document.createElement('div');
    d.className = 'bRow';
    d.innerHTML = `<span class="a">${ICONS[a.ic]} ${a.nm}</span>
      <span class="p">${pk.name} <small>’${String(pk.y).slice(2)}</small></span>
      <span class="v">${pk.val}</span>`;
    b.appendChild(d);
  });
  show('scrResult');
}

function copyShare() {
  const wins = st.slamResults.filter((r) => r.won).length;
  let txt = `🎾 4a0 — fiz ${wins}–${4 - wins} na temporada!\n`;
  st.slamResults.forEach((r) => {
    txt += `${r.won ? '🏆' : '❌'} ${r.slam.id}${r.won ? '' : ' (' + r.lostRound + ' vs ' + lastName(r.lostTo.n) + ' ’' + String(r.lostTo.y).slice(2) + ')'}\n`;
  });
  txt += '\nMeu tenista:\n';
  ATTRS.forEach((a) => {
    const pk = st.picks[a.k];
    txt += `• ${a.nm}: ${pk.name} ${pk.y}\n`;
  });
  txt += '\nVocê consegue o 4 a 0?';
  navigator.clipboard.writeText(txt).then(() => {
    const t = $('toast');
    t.classList.add('on');
    setTimeout(() => t.classList.remove('on'), 1800);
  });
}
function resetRun() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  $('autoBtn').textContent = 'Auto ⏩';
  show('scrHome');
}

/* ================= EVENTOS ================= */
$('mClassic').addEventListener('click', () => setMode('classic'));
$('mAlmanac').addEventListener('click', () => setMode('almanac'));
$('playBtn').addEventListener('click', startRun);
$('rollBox').addEventListener('click', rollDraw);
$('wcYearBtn').addEventListener('click', wcYear);
$('wcAttrBtn').addEventListener('click', wcAttr);
$('lossRest').addEventListener('click', resetRun);
$('lossCont').addEventListener('click', lossContinue);
$('autoBtn').addEventListener('click', autoSim);
$('nextBtn').addEventListener('click', stepSim);
$('copyBtn').addEventListener('click', copyShare);
$('againBtn').addEventListener('click', resetRun);

loadData().then((d) => {
  DATA = d.DATA; YEARS = d.YEARS; ALL = d.ALL;
  $('footStats').textContent = `protótipo · ${YEARS.length} temporadas · ${ALL.length} versões de jogadores`;
});
