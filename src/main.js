import './style.css';
import { ATTRS, CHIP_POS, SLAMS, WC_BY_MODE, STYLES } from './config.js';
import { ICONS, RACKET, THEME_ICONS, MATCH_WIN, MATCH_LOSS, RESTART_ICON, XMARK, REPLAY_ICON, WHATSAPP_ICON, courtSVG, trophySVG } from './icons.js';
import { rnd, shuffle, lastName } from './util.js';
import { loadData } from './data.js';
import { samplePlayers } from './draft.js';
import { simulateSeason, applyStyle } from './sim.js';

const $ = (id) => document.getElementById(id);

function show(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('on'));
  $(id).classList.add('on');
  window.scrollTo(0, 0);
}

/* tema do Slam: a cada visita a home veste um dos 4 torneios */
const THEMES = {
  ao: { kicker: 'Australian Open · Melbourne · 1990 — 2026', quote: '«O Slam feliz abre a temporada dos sonhos.»', icon: 'sun' },
  rg: { kicker: 'Roland-Garros · Paris · 1990 — 2026', quote: '«A terra batida consagra os bravos.»', icon: 'trophy' },
  wb: { kicker: 'Wimbledon · London · Est. 1877', quote: '«Na grama sagrada, só entra quem merece.»', icon: 'crown' },
  us: { kicker: 'US Open · New York · 1990 — 2026', quote: '«A noite mais barulhenta do tênis decide tudo.»', icon: 'sky' },
};
(function () {
  const keys = Object.keys(THEMES);
  const forced = new URLSearchParams(location.search).get('slam');
  const key = THEMES[forced] ? forced : keys[Math.floor(Math.random() * keys.length)];
  const t = THEMES[key];
  document.documentElement.dataset.theme = key;
  $('homeKicker').textContent = t.kicker;
  $('homeQuote').textContent = t.quote;
  $('homeRuleIcon').innerHTML = THEME_ICONS[t.icon];
})();

/* home: quadra com os 4 troféus */
(function () {
  /* o selo do Slam da casa escurece para não sumir na quadra da mesma cor */
  const deep = { AO: '#1d5d9e', RG: '#8a3b1c', WB: '#1c4d27', US: '#19306b' };
  const home = (document.documentElement.dataset.theme || '').toUpperCase();
  const slamPos = [['AO', 30, 27, 'var(--ao)'], ['RG', 70, 27, 'var(--rg)'], ['WB', 30, 73, 'var(--wb)'], ['US', 70, 73, 'var(--us)']];
  let h = courtSVG();
  slamPos.forEach(([id, x, y, col]) => {
    h += `<div class="trophy" style="left:${x}%;top:${y}%;">
      ${trophySVG(id)}<span class="tLb" style="background:${id === home ? deep[id] : col}">${id}</span></div>`;
  });
  $('homeCourt').innerHTML = h;
  $('racket').innerHTML = RACKET;
})();

/* ================= ESTADO ================= */
let DATA = {}, YEARS = [], ALL = [];
let mode = 'classic';
let style = 'allcourt';
let st = null;

function setMode(m) {
  mode = m;
  $('mClassic').classList.toggle('sel', m === 'classic');
  $('mAlmanac').classList.toggle('sel', m === 'almanac');
}

function setStyle(s) {
  style = s;
  document.querySelectorAll('.styleBtn').forEach((b) => b.classList.toggle('sel', b.dataset.style === s));
}

const styleName = () => STYLES.find((x) => x.id === style).nm;

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
  $('styleSec').style.display = ''; /* estilo escolhível até o primeiro sorteio */
  renderDraft();
  show('scrDraft');
}
function currentAttr() { return ATTRS[st.order[st.round]]; }

function rollDraw() {
  if (!st || st.drawn || st.rolling || st.round >= 8) return;
  $('styleSec').style.display = 'none'; /* primeiro sorteio trava o estilo */
  st.selectedName = null;
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
  const done = st.round >= 8;
  const at = done ? null : currentAttr();
  const drawn = st.drawn;
  $('drawAttr').innerHTML = drawn ? ICONS[at.ic] + ' ' + at.nm : '—';
  $('drawYear').textContent = drawn ? st.year : '—';
  $('wcN').textContent = st.wc;
  $('wcYearBtn').disabled = !drawn || st.wc <= 0;
  $('wcAttrBtn').disabled = !drawn || st.wc <= 0 || st.round >= 7;
  $('rollBox').className = 'rollBox' + (drawn || done ? ' off' : '');
  $('boxProg').textContent = 'SEU TENISTA · ' + st.round + '/8';

  const picked = st.picks.filter(Boolean);
  const avgEl = $('boxAvg');
  if ((mode === 'classic' || done) && picked.length) {
    avgEl.style.display = 'block';
    avgEl.querySelector('small').textContent = done ? 'OVERALL' : 'MÉDIA';
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
      ? (mode === 'classic' || done ? pick.val : '✓')
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
  if (done) {
    list.innerHTML = `<button class="big" id="goSeasonBtn">JOGAR A TEMPORADA →</button>`;
    $('goSeasonBtn').onclick = startSeason;
    return;
  }
  if (!drawn) {
    list.innerHTML = `<div class="plistHint">Clique na raquete para sortear o atributo e o ano.</div>`;
    return;
  }
  st.options.forEach((pl) => {
    const used = st.usedNames.has(pl.n);
    const val = pl.a[at.k];
    const sel = st.selectedName === pl.n;
    const btn = document.createElement('button');
    btn.className = 'pl' + (used ? ' used' : '') + (sel ? ' sel' : '');
    const star = pl.ch.length ? '⭐ ' : '';
    const sub = `ATP #${pl.r}` + (pl.hl ? ` <span style="color:var(--line)">|</span> <span class="feat">${star}${pl.hl}</span>` : '');
    const right = used
      ? `<span class="usedTag">JÁ USADO</span>`
      : (mode === 'classic' ? `<span class="rating">${val}</span>` : `<span class="rating" style="color:var(--line)">?</span>`);
    btn.innerHTML = `<div class="info"><div class="nm">${pl.n} <small>${pl.c}</small></div><div class="sub">${sub}</div></div>${right}`;
    if (!used) btn.onclick = () => selectOrConfirm(pl);
    list.appendChild(btn);
  });
}

/* 1º clique seleciona (sombreado); 2º clique no mesmo jogador confirma */
function selectOrConfirm(pl) {
  if (st.selectedName === pl.n) { pick(pl); return; }
  st.selectedName = pl.n;
  const list = $('plist');
  list.querySelectorAll('.pl.sel').forEach((b) => b.classList.remove('sel'));
  [...list.children].forEach((b) => {
    const nm = b.querySelector('.nm')?.firstChild?.textContent.trim();
    if (nm === pl.n) b.classList.add('sel');
  });
}

function pick(pl) {
  const at = currentAttr();
  st.picks[at.k] = { name: pl.n, y: st.year, val: pl.a[at.k] };
  st.usedNames.add(pl.n);
  st.selectedName = null;
  st.round++;
  st.drawn = false;
  renderDraft();
  /* leva o jogador de volta à ação seguinte: rolar de novo, ou jogar a temporada */
  const target = st.round >= 8 ? $('goSeasonBtn') : $('rollBox');
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function myAttrs() { return st.picks.map((p) => p.val); }

/* ================= TEMPORADA ================= */
let seasonIdx, matchIdx, viewIdx, animTimer = null, anim = null, lossPending = null, started = false;
let simSpeed = 'normal';
const SPEEDS = { lenta: 620, normal: 300, rapida: 110 }; /* ms por game */

function startSeason() {
  st.slamResults = simulateSeason(applyStyle(myAttrs(), style), ALL);
  seasonIdx = 0; matchIdx = 0; viewIdx = 0; lossPending = null; started = false;
  beginMatch();           /* monta a 1ª partida no placar (0-0), parada */
  renderSlam();
  show('scrSeason');
}
/* abas dos 4 Slams: troféu do torneio se conquistado, X se perdido. Um Slam é
   "decidido" quando já passou OU quando é o atual e suas partidas terminaram
   (cobre o US Open, último Slam, que não tem etapa de "Continuar"). */
function renderTabs() {
  const tabs = $('slamTabs');
  tabs.innerHTML = '';
  SLAMS.forEach((s, i) => {
    const r = st.slamResults[i];
    const decided = i < seasonIdx || (i === seasonIdx && matchIdx === r.matches.length);
    const t = document.createElement('div');
    let cls = 'stab';
    if (decided) cls += r.won ? ' won' : ' lost';
    else if (i === seasonIdx) cls += ' cur';
    if (i === viewIdx && viewIdx !== seasonIdx) cls += ' viewing';
    t.className = cls;
    const mark = decided ? (r.won ? trophySVG(s.id) : XMARK) : '';
    t.innerHTML = mark + `<span class="stId">${s.id}</span>`;
    if (i <= seasonIdx) t.onclick = () => viewSlam(i);
    tabs.appendChild(t);
  });
}

/* desenha o Slam em viewIdx: ao vivo (placar + parciais) ou revisita de um já disputado */
function renderSlam() {
  const live = viewIdx === seasonIdx;
  const slam = SLAMS[viewIdx];
  const res = st.slamResults[viewIdx];
  renderTabs();
  const head = $('slamHead');
  head.style.background = slam.col;
  head.innerHTML = `<div class="shTop">${trophySVG(slam.id)}<span class="nm">${slam.nm}</span></div><div class="sf">${slam.sf}</div>`;
  $('matches').innerHTML = '';
  res.matches.slice(0, live ? matchIdx : res.matches.length).forEach(appendMatchLine);
  $('lossBox').style.display = 'none';
  $('seasonCtr').style.display = 'flex';
  renderBoard();
  if (!live) {
    $('speedSel').style.display = 'none';
    $('nextBtn').textContent = 'Voltar ao torneio atual →';
  } else if (lossPending) {
    showLossBox(lossPending);
  } else {
    $('speedSel').style.display = 'flex';
    $('nextBtn').textContent = started ? 'Avançar →' : 'Começar →';
  }
}
function viewSlam(i) {
  if (i > seasonIdx || i === viewIdx) return;
  stopTimer();
  viewIdx = i;
  renderSlam();
}
function backToCurrent() {
  viewIdx = seasonIdx;
  renderSlam();
  if (started && anim && !lossPending) startTimer();
}
function appendMatchLine(m) {
  const div = document.createElement('div');
  div.className = 'mt ' + (m.won ? 'W' : 'L');
  div.innerHTML = `<span class="rd">${m.round}</span>
    <span class="opp">${m.opp.n} <small>’${String(m.opp.y).slice(2)}</small></span>
    <span class="sc">${m.sets.map((s) => s[0] + '-' + s[1]).join(' ')}</span>
    ${m.won ? MATCH_WIN : MATCH_LOSS}`;
  $('matches').appendChild(div);
}

/* ----- placar ao vivo, game a game ----- */
function startTimer() { stopTimer(); animTimer = setInterval(tick, SPEEDS[simSpeed]); }
function stopTimer() { if (animTimer) { clearInterval(animTimer); animTimer = null; } }
function setSpeed(s) {
  if (!SPEEDS[s]) return;
  simSpeed = s;
  document.querySelectorAll('#speedSel button').forEach((b) => b.classList.toggle('sel', b.dataset.spd === s));
  if (animTimer) startTimer();
}
/* sequência de vencedores de game ('P'/'O') de um set, terminando em quem o venceu */
function makeGameSeq([pg, og]) {
  const arr = Array(pg).fill('P').concat(Array(og).fill('O'));
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  const w = pg > og ? 'P' : 'O';
  if (arr[arr.length - 1] !== w) { const k = arr.lastIndexOf(w); [arr[arr.length - 1], arr[k]] = [arr[k], arr[arr.length - 1]]; }
  return arr;
}
function beginMatch() {
  const res = st.slamResults[seasonIdx];
  if (matchIdx >= res.matches.length) { anim = null; renderBoard(); return; }
  const m = res.matches[matchIdx];
  anim = { m, si: 0, p: 0, o: 0, seqs: m.sets.map(makeGameSeq) };
  renderBoard();
}
function renderBoard() {
  const board = $('liveBoard');
  if (!anim || viewIdx !== seasonIdx) { board.style.display = 'none'; return; }
  board.style.display = 'block';
  const m = anim.m;
  const you = [], opp = [];
  for (let i = 0; i < anim.si; i++) { you.push(m.sets[i][0]); opp.push(m.sets[i][1]); }
  you.push(anim.p); opp.push(anim.o);
  const cur = you.length - 1;
  const cells = (vals) => vals.map((v, i) => `<span class="bCell${i === cur ? ' cur' : ''}">${v}</span>`).join('');
  board.innerHTML = `<div class="bRound">${m.round}</div>
    <div class="bRow"><span class="bNm">Você</span><span class="bSets">${cells(you)}</span></div>
    <div class="bRow"><span class="bNm">${m.opp.n} <small>’${String(m.opp.y).slice(2)}</small></span><span class="bSets">${cells(opp)}</span></div>`;
}
function tick() {
  if (!anim) { stopTimer(); return; }
  const m = anim.m;
  const [pg, og] = m.sets[anim.si];
  const w = anim.seqs[anim.si][anim.p + anim.o];
  if (w === 'P') anim.p++; else anim.o++;
  if (anim.p === pg && anim.o === og) { anim.si++; anim.p = 0; anim.o = 0; }
  if (anim.si >= m.sets.length) finalizeMatch();
  else renderBoard();
}
function finalizeMatch() {
  const res = st.slamResults[seasonIdx];
  const m = res.matches[matchIdx];
  appendMatchLine(m);
  matchIdx++;
  anim = null;
  renderTabs();
  renderBoard();
  if (!m.won) { stopTimer(); lossPending = m; showLossBox(m); return; }
  if (matchIdx < res.matches.length) { beginMatch(); return; } /* próxima partida (timer segue) */
  /* Slam conquistado */
  stopTimer();
  if (seasonIdx < 3) setTimeout(() => { seasonIdx++; matchIdx = 0; viewIdx = seasonIdx; renderSlam(); beginMatch(); startTimer(); }, 750);
  else setTimeout(showResult, 750);
}
/* Avançar: termina a partida atual na hora (pula a animação) */
function skipMatch() {
  if (viewIdx !== seasonIdx) { backToCurrent(); return; }
  if (!anim || lossPending) return;
  const wasRunning = !!animTimer;
  stopTimer();
  finalizeMatch();
  if (wasRunning && animTimer === null && anim && !lossPending) startTimer();
}
function showLossBox(m) {
  stopTimer();
  const res = st.slamResults[seasonIdx];
  $('seasonCtr').style.display = 'none';
  $('lossT').textContent = 'Eliminado — ' + res.slam.nm;
  $('lossD').textContent = m.round + ' · vs ' + m.opp.n + ' ’' + String(m.opp.y).slice(2);
  $('lossCont').textContent = (seasonIdx < 3) ? 'Continuar temporada →' : 'Ver resultado 🏁';
  $('lossBox').style.display = 'block';
}
function lossContinue() {
  lossPending = null;
  if (seasonIdx < 3) { seasonIdx++; matchIdx = 0; viewIdx = seasonIdx; renderSlam(); beginMatch(); startTimer(); }
  else showResult();
}

/* ================= RESULTADO ================= */
function showResult() {
  stopTimer();
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
  $('resMode').textContent = (mode === 'classic' ? 'MODO CLÁSSICO' : 'MODO ALMANAQUE') + ' · ' + styleName().toUpperCase();

  const rs = $('resSlams');
  rs.innerHTML = '';
  st.slamResults.forEach((r) => {
    const d = document.createElement('div');
    d.className = 'rs1' + (r.won ? ' won' : ' lost');
    d.innerHTML = `<span class="em">${trophySVG(r.slam.id)}</span>
      <span class="nm">${r.slam.nm}</span>
      <span class="dt">${r.won ? 'CAMPEÃO' : r.lostRound + ' · vs ' + lastName(r.lostTo.n) + ' ’' + String(r.lostTo.y).slice(2)}</span>`;
    rs.appendChild(d);
  });

  const sets = { won: 0, lost: 0 };
  st.slamResults.forEach((r) => r.matches.forEach((m) => m.sets.forEach((s) => {
    s[0] > s[1] ? sets.won++ : sets.lost++;
  })));
  $('resSets').innerHTML = `
    <div class="setBox"><span class="cap">Sets ganhos</span><b class="w">${sets.won}</b></div>
    <div class="setBox"><span class="cap">Sets perdidos</span><b class="l">${sets.lost}</b></div>`;

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
  const overall = Math.round(ATTRS.reduce((sum, a) => sum + st.picks[a.k].val, 0) / ATTRS.length);
  const tot = document.createElement('div');
  tot.className = 'bRow total';
  tot.innerHTML = `<span class="a">Overall</span>
    <span class="p"></span>
    <span class="v">${overall}</span>`;
  b.appendChild(tot);
  show('scrResult');
}

/* share code: codifica as 8 escolhas (jogador+ano) + estilo + modo na URL */
function buildShareCode() {
  const payload = { p: ATTRS.map((a) => [st.picks[a.k].name, st.picks[a.k].y]), s: style, m: mode };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return location.origin + location.pathname + '#t=' + b64;
}
function copyShare() {
  const wins = st.slamResults.filter((r) => r.won).length;
  const link = buildShareCode();
  const txt = `4a0 — joguei ${wins}–${4 - wins}. Joga a temporada com o meu tenista:\n${link}`;
  navigator.clipboard.writeText(txt).then(() => {
    const t = $('toast');
    t.classList.add('on');
    setTimeout(() => t.classList.remove('on'), 1800);
  });
}
function resetRun() {
  stopTimer();
  anim = null; lossPending = null;
  show('scrHome');
}

/* ================= EVENTOS ================= */
$('mClassic').addEventListener('click', () => setMode('classic'));
$('mAlmanac').addEventListener('click', () => setMode('almanac'));
document.querySelectorAll('.styleBtn').forEach((b) => b.addEventListener('click', () => setStyle(b.dataset.style)));
$('playBtn').addEventListener('click', startRun);
$('rollBox').addEventListener('click', rollDraw);
$('wcYearBtn').addEventListener('click', wcYear);
$('wcAttrBtn').addEventListener('click', wcAttr);
$('lossRest').innerHTML = RESTART_ICON + ' Reiniciar';
$('againBtn').innerHTML = REPLAY_ICON + ' Jogar de novo';
$('copyBtn').innerHTML = WHATSAPP_ICON + ' Copiar link';
$('lossRest').addEventListener('click', resetRun);
$('lossCont').addEventListener('click', lossContinue);
document.querySelectorAll('#speedSel button').forEach((b) => b.addEventListener('click', () => setSpeed(b.dataset.spd)));
$('nextBtn').addEventListener('click', () => {
  if (viewIdx !== seasonIdx) { backToCurrent(); return; }
  if (!started) { started = true; $('nextBtn').textContent = 'Avançar →'; startTimer(); return; }
  skipMatch();
});
$('copyBtn').addEventListener('click', copyShare);
$('againBtn').addEventListener('click', resetRun);

loadData().then((d) => {
  DATA = d.DATA; YEARS = d.YEARS; ALL = d.ALL;
  $('footStats').textContent = `protótipo · ${YEARS.length} temporadas · ${ALL.length} versões de jogadores`;
});
