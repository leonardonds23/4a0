import './style.css';
import { ATTRS, CHIP_POS, SLAMS, WC_BY_MODE, STYLES, ROUNDS, TIEBREAK_SLOWDOWN } from './config.js';
import { ICONS, RACKET, THEME_ICONS, MATCH_WIN, MATCH_LOSS, RESTART_ICON, XMARK, REPLAY_ICON, WHATSAPP_ICON, PAUSE_ICON, PLAY_ICON, IMG_ICON, TENNIS_BALL, courtSVG, trophySVG } from './icons.js';
import { rnd, shuffle, lastName } from './util.js';
import { loadData } from './data.js';
import { samplePlayers } from './draft.js';
import { simulateSeason, applyStyle } from './sim.js';
import { buildEntrants, simulateBracket } from './bracket.js';

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
  wb: { kicker: 'Wimbledon · London · 1990 — 2026', quote: '«Na grama sagrada, só entra quem merece.»', icon: 'crown' },
  us: { kicker: 'US Open · New York · 1990 — 2026', quote: '«A noite mais barulhenta do tênis decide tudo.»', icon: 'sky' },
};
let homeTheme = 'ao'; /* tema sorteado na home — restaurado ao sair do multiplayer */
(function () {
  const keys = Object.keys(THEMES);
  const forced = new URLSearchParams(location.search).get('slam');
  const key = THEMES[forced] ? forced : keys[Math.floor(Math.random() * keys.length)];
  homeTheme = key;
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
let mp = null;                 /* sessão de multiplayer local (null no single-player) */
let onDraftDone = null;        /* o que fazer ao concluir um draft (temporada ou capturar humano) */

function setMode(m) {
  mode = m;
  $('mClassic').classList.toggle('sel', m === 'classic');
  $('mAlmanac').classList.toggle('sel', m === 'almanac');
}

function setStyle(s) {
  style = s;
  document.querySelectorAll('.styleBtn').forEach((b) => b.classList.toggle('sel', b.dataset.style === s));
  updateDraftMeta();
}

const styleName = () => STYLES.find((x) => x.id === style).nm;

/* reinicia uma animação CSS de "pop" (re-trigger forçando reflow) */
function pop(el) { if (!el) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }

/* meta no topo do draft (estilo · modo), no espírito do 7a0 */
function updateDraftMeta() {
  $('draftMeta').textContent = styleName() + ' · ' + (mode === 'classic' ? 'Clássico' : 'Almanaque');
}

/* ================= DRAFT ================= */
/* inicializa o estado de um draft — usado pelo single-player e por cada humano do PvP */
function initDraftState() {
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
function startRun() {
  if (!YEARS.length) return; /* dados ainda carregando */
  mp = null;
  onDraftDone = startSeason;
  $('draftWho').style.display = 'none';
  initDraftState();
}
function currentAttr() { return ATTRS[st.order[st.round]]; }

function rollDraw() {
  if (!st || st.drawn || st.rolling || st.round >= 8) return;
  $('styleSec').style.display = 'none'; /* primeiro sorteio trava o estilo */
  st.selectedName = null;
  st.rolling = true;
  $('rollBox').className = 'rollBox rolling';
  $('racket').classList.add('spin');
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
      st.options = samplePlayers(DATA, finalYear, 10, st.usedNames);
      st.drawn = true;
      $('racket').classList.remove('spin');
      renderDraft();
      pop($('drawAttr'));
      pop($('drawYear'));
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
  st.options = samplePlayers(DATA, y, 10, st.usedNames);
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
  updateDraftMeta();
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
    h += `<div class="${cls}" data-k="${a.k}" style="left:${x}%;top:${y}%;">
            <span class="lbA">${a.nm}</span>
            <div class="cir">${inner}</div>
            <span class="lb">${tag}</span></div>`;
  });
  $('draftCourt').innerHTML = h;

  /* lista de jogadores */
  const list = $('plist');
  list.innerHTML = '';
  if (done) {
    const label = mp ? 'CONFIRMAR TENISTA →' : 'JOGAR A TEMPORADA →';
    list.innerHTML = `<button class="big" id="goSeasonBtn">${label}</button>`;
    $('goSeasonBtn').onclick = onDraftDone;
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
  const k = at.k;
  st.picks[at.k] = { name: pl.n, y: st.year, val: pl.a[at.k] };
  st.usedNames.add(pl.n);
  st.selectedName = null;
  st.round++;
  st.drawn = false;
  renderDraft();
  /* microanimação: o chip recém-preenchido "pula" e dá um flash de progresso */
  document.querySelector(`.chip[data-k="${k}"]`)?.classList.add('justFilled');
  /* leva o jogador de volta à ação seguinte: rolar de novo, ou jogar a temporada */
  const target = st.round >= 8 ? $('goSeasonBtn') : $('rollBox');
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function myAttrs() { return st.picks.map((p) => p.val); }

/* ================= TEMPORADA ================= */
let seasonIdx, matchIdx, viewIdx, animTimer = null, anim = null, lossPending = null, started = false;
let simSpeed = 'normal';
const SPEEDS = { lenta: 620, normal: 300, rapida: 110, auto: 360 }; /* ms por game; 'auto' = ms por partida (revela inteira, como na versão original) */

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
  } else if (lossPending) {
    showLossBox(lossPending);
  } else {
    $('speedSel').style.display = 'flex';
  }
  setNextBtn();
}
/* botão principal: "Simular [fase atual] →"; botão de pausa ao lado quando rodando */
function setNextBtn() {
  const btn = $('nextBtn'), pause = $('pauseBtn');
  /* sem Pausar visível, o botão principal ocupa a largura toda (span 4) */
  if (viewIdx !== seasonIdx) { btn.textContent = 'Voltar ao torneio atual →'; pause.style.display = 'none'; btn.classList.add('full'); return; }
  if (!started) { btn.textContent = 'Começar →'; pause.style.display = 'none'; btn.classList.add('full'); return; }
  if (lossPending) { pause.style.display = 'none'; btn.classList.add('full'); return; }
  const round = ROUNDS[matchIdx];
  /* transição entre partidas/Slams (matchIdx já fora do array): não sobrescrever
     o rótulo com "Simular undefined →" — o próximo setNextBtn corrige em seguida */
  if (!round) { pause.style.display = 'none'; btn.classList.add('full'); return; }
  btn.textContent = 'Simular ' + round + ' →';
  pause.style.display = '';
  btn.classList.remove('full');
  pause.innerHTML = animTimer ? (PAUSE_ICON + ' Pausar') : (PLAY_ICON + ' Retomar');
}
function togglePause() {
  if (!started || viewIdx !== seasonIdx || lossPending || !anim) return;
  if (animTimer) stopTimer(); else startTimer();
  setNextBtn();
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
  let sp = 0, so = 0;
  m.sets.forEach((s) => { s[0] > s[1] ? sp++ : so++; });
  const det = m.sets.map((s) => s[0] + '-' + s[1]).join(' ');
  div.innerHTML = `<span class="rd">${m.round}</span>
    <span class="opp">${m.opp.n} <small>’${String(m.opp.y).slice(2)}</small></span>
    <span class="mScore"><b class="setsAgg">${sp}-${so}</b><span class="setsDet">${det}</span></span>
    ${m.won ? MATCH_WIN : MATCH_LOSS}`;
  $('matches').appendChild(div);
}

/* ----- placar ao vivo, game a game ----- */
/* durante o tie-break os pontos correm mais devagar que os games (relativo ao modo) */
function stepDelay() { return (anim && anim.tb) ? Math.round(SPEEDS[simSpeed] * TIEBREAK_SLOWDOWN) : SPEEDS[simSpeed]; }
function startTimer() { stopTimer(); animTimer = setInterval(tick, stepDelay()); }
function stopTimer() { if (animTimer) { clearInterval(animTimer); animTimer = null; } }
function setSpeed(s) {
  if (!SPEEDS[s]) return;
  simSpeed = s;
  document.querySelectorAll('#speedSel button').forEach((b) => b.classList.toggle('sel', b.dataset.spd === s));
  renderBoard(); /* mostra/esconde o placar (Auto não usa placar ao vivo) */
  if (animTimer) startTimer();
}
const shufArr = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
/* sequência de vencedores de game ('P'/'O') para um set [pg, og], modelando
   SAQUE e QUEBRA como no tênis real: os games alternam o sacador e quase sempre
   quem saca segura; a QUEBRA é o evento raro que decide o set. Convenção: o
   vencedor do set saca primeiro (índices pares), segura todos os seus games e
   quebra o sacador perdedor só o necessário — gerando o vaivém característico
   (1-1, 2-2…) com quebras pontuais e o clássico "quebra/saca para fechar o set".
   O placar final continua sendo o que o motor sorteou; isto é só a encenação
   fiel dele (zero impacto no balanceamento). Quebrar as posições de saque MAIS
   TARDIAS garante placar sempre legal (o vencedor só chega ao total no último
   game, sem "6-3 que vira 6-4"). */
function makeGameSeq([pg, og]) {
  const winP = pg > og;
  const W = winP ? 'P' : 'O', L = winP ? 'O' : 'P';
  const a = Math.max(pg, og), b = Math.min(pg, og);
  /* 7-6: 12 games segurados (vaivém até 6-6) e o tiebreak decide o 13º */
  if (a === 7 && b === 6) {
    const s = []; for (let k = 0; k < 12; k++) s.push(k % 2 === 0 ? W : L); s.push(W); return s;
  }
  const G = a + b;
  const wServes = Math.ceil(G / 2);   /* games sacados pelo vencedor (saca primeiro) */
  const breaks = a - wServes;         /* nº de quebras do vencedor sobre o perdedor */
  const loserServe = [];              /* índices ímpares = saque do perdedor */
  for (let k = 1; k < G; k += 2) loserServe.push(k);
  const broken = new Set(loserServe.slice(loserServe.length - breaks)); /* quebra as mais tardias */
  const seq = new Array(G);
  for (let k = 0; k < G; k++) {
    if (k % 2 === 0) seq[k] = W;             /* vencedor saca e segura */
    else seq[k] = broken.has(k) ? W : L;     /* saque do perdedor: quebra ou hold */
  }
  return seq;
}
/* quem saca o game atual do set (vencedor do set saca os índices pares) */
function serverIsYou(youWonSet, gameIdx) {
  return gameIdx % 2 === 0 ? youWonSet : !youWonSet;
}
function beginMatch() {
  const res = st.slamResults[seasonIdx];
  if (matchIdx >= res.matches.length) { anim = null; renderBoard(); return; }
  const m = res.matches[matchIdx];
  anim = { m, si: 0, p: 0, o: 0, seqs: m.sets.map(makeGameSeq) };
  renderBoard();
  setNextBtn();
}
const isTiebreak = ([a, b]) => Math.max(a, b) === 7 && Math.min(a, b) === 6;
function renderBoard() {
  const board = $('liveBoard');
  if (!anim || viewIdx !== seasonIdx || simSpeed === 'auto') { board.style.display = 'none'; return; }
  board.style.display = 'block';
  const m = anim.m;
  const yy = '’' + String(m.opp.y).slice(2);

  if (anim.tb) { /* tiebreak ponto a ponto — estilo "pênaltis" do 7a0 */
    const detail = [];
    for (let i = 0; i < anim.si; i++) detail.push(`${m.sets[i][0]}-${m.sets[i][1]}`);
    const dots = anim.tb.seq.slice(0, anim.tb.i)
      .map((w) => `<span class="tbDot ${w === 'P' ? 'you' : 'opp'}"></span>`).join('');
    const tbLabel = anim.si === m.sets.length - 1 ? 'tie-break decisivo' : 'tie-break';
    board.innerHTML = `<div class="bRound">${m.round} · ${tbLabel}</div>
      <div class="bMain">
        <span class="bSide">Você</span>
        <span class="bScore"><span class="${anim.tb.p > anim.tb.o ? 'lead' : ''}">${anim.tb.p}</span><i>—</i><span class="${anim.tb.o > anim.tb.p ? 'lead' : ''}">${anim.tb.o}</span></span>
        <span class="bSide">${m.opp.n} <small>${yy}</small></span>
      </div>
      <div class="tbDots">${dots}</div>
      <div class="bDetail">${detail.join(' · ')}${detail.length ? ' · ' : ''}<b>6-6</b></div>`;
    return;
  }

  /* placar ao vivo (layout original): duas linhas com os games de cada set */
  const you = [], opp = [];
  for (let i = 0; i < anim.si; i++) { you.push(m.sets[i][0]); opp.push(m.sets[i][1]); }
  you.push(anim.p); opp.push(anim.o);
  const cur = you.length - 1;
  const cells = (vals) => vals.map((v, i) => `<span class="bCell${i === cur ? ' cur' : ''}">${v}</span>`).join('');
  const youWonSet = m.sets[anim.si][0] > m.sets[anim.si][1];
  const youServe = serverIsYou(youWonSet, anim.p + anim.o); /* saque do game atual */
  const ball = TENNIS_BALL;
  board.innerHTML = `<div class="bRound">${m.round}</div>
    <div class="bRow"><span class="bNm">Você${youServe ? ball : ''}</span><span class="bSets">${cells(you)}</span></div>
    <div class="bRow"><span class="bNm">${m.opp.n} <small>${yy}</small>${youServe ? '' : ball}</span><span class="bSets">${cells(opp)}</span></div>`;
}
/* pontos do tie-break decisivo: vencedor faz 7, perdedor 3–5; revelado ponto a ponto */
function makeTiebreak(playerWon) {
  const W = playerWon ? 'P' : 'O', L = playerWon ? 'O' : 'P';
  const lp = 3 + Math.floor(Math.random() * 3); /* 3,4,5 */
  const seq = shufArr(Array(6).fill(W).concat(Array(lp).fill(L))).concat(W);
  return { seq, i: 0, p: 0, o: 0 };
}
function tick() {
  if (!anim) { stopTimer(); return; }
  if (simSpeed === 'auto') { finalizeMatch(); return; } /* revela a partida inteira (como na versão original) */
  const m = anim.m;
  if (anim.tb) { /* ponto a ponto do tie-break */
    anim.tb.seq[anim.tb.i] === 'P' ? anim.tb.p++ : anim.tb.o++;
    anim.tb.i++;
    if (anim.tb.i >= anim.tb.seq.length) { anim.tb = null; anim.si++; anim.p = 0; anim.o = 0; if (animTimer) startTimer(); } /* volta ao ritmo de games */
    if (anim.si >= m.sets.length) finalizeMatch(); else renderBoard();
    return;
  }
  const [pg, og] = m.sets[anim.si];
  anim.seqs[anim.si][anim.p + anim.o] === 'P' ? anim.p++ : anim.o++;
  /* qualquer set empatado em 6-6 entra no tie-break dramático (vencedor = quem ganhou ESTE set) */
  if (isTiebreak(m.sets[anim.si]) && anim.p === 6 && anim.o === 6) {
    anim.tb = makeTiebreak(m.sets[anim.si][0] > m.sets[anim.si][1]);
    if (animTimer) startTimer(); /* desacelera para o ritmo de tie-break */
    renderBoard();
    return;
  }
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
  if (seasonIdx < 3) setTimeout(() => { seasonIdx++; matchIdx = 0; viewIdx = seasonIdx; renderSlam(); beginMatch(); startTimer(); setNextBtn(); }, 750);
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
  setNextBtn();
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
  if (seasonIdx < 3) { seasonIdx++; matchIdx = 0; viewIdx = seasonIdx; renderSlam(); beginMatch(); startTimer(); setNextBtn(); }
  else showResult();
}

/* ================= MULTIPLAYER LOCAL (PvP) ================= */
let room = { slam: 'AO', size: 8, humans: 2, mode: 'classic' };

function openRoom() {
  if (!YEARS.length) return;
  syncRoomHumans();
  show('scrRoom');
}
function selOpt(container, btn) {
  container.querySelectorAll('.optBtn').forEach((b) => b.classList.toggle('sel', b === btn));
}
/* mantém o slider de humanos coerente com o tamanho da chave + atualiza o aviso */
function syncRoomHumans() {
  const r = $('roomHumans');
  r.max = room.size;
  if (+r.value > room.size) r.value = room.size;
  room.humans = +r.value;
  $('humansN').textContent = room.humans;
  const fill = room.size - room.humans;
  $('humansHint').textContent = fill > 0
    ? `${fill} ${fill === 1 ? 'vaga vira tenista histórico' : 'vagas viram tenistas históricos'}`
    : 'chave cheia — sem históricos';
}

/* ----- draft revezado dos humanos ----- */
function startRoom() {
  mp = {
    slam: SLAMS.find((s) => s.id === room.slam),
    size: room.size, humans: room.humans, mode: room.mode,
    nicks: Array.from({ length: room.humans }, (_, i) => 'Jogador ' + (i + 1)),
    players: [], currentHuman: 0,
  };
  /* da próxima tela em diante, veste o tema do Slam escolhido para o torneio */
  document.documentElement.dataset.theme = mp.slam.id.toLowerCase();
  beginHumanDraft(0);
}
function beginHumanDraft(i) {
  mp.currentHuman = i;
  $('passIcon').innerHTML = RACKET;
  $('passTitle').textContent = 'Passe o aparelho para o Jogador ' + (i + 1);
  $('passSub').textContent = mp.mode === 'almanac'
    ? 'É a vez dele montar o tenista — e as notas ficam ocultas para todos.'
    : 'É a vez dele montar o tenista. Sem espiar!';
  $('passName').value = '';
  $('passStart').textContent = 'Começar meu draft →';
  show('scrPass');
}
function startHumanDraft() {
  const typed = $('passName').value.trim();
  if (typed) mp.nicks[mp.currentHuman] = typed;   /* nome é opcional: em branco mantém "Jogador N" */
  mode = mp.mode;
  style = 'allcourt'; setStyle('allcourt');
  onDraftDone = captureHumanAndAdvance;
  $('draftWho').textContent = `${mp.nicks[mp.currentHuman]} montando · ${mp.currentHuman + 1}/${mp.humans}`;
  $('draftWho').style.display = '';
  initDraftState();
}
function captureHumanAndAdvance() {
  const raw = myAttrs();
  const i = mp.currentHuman;
  mp.players[i] = {
    kind: 'human',
    nick: mp.nicks[i],
    attrs: applyStyle(raw, style),                                   /* notas com estilo: o que o motor usa */
    overall: Math.round(raw.reduce((s, v) => s + v, 0) / raw.length), /* overall mostrado: média crua */
    picks: st.picks.slice(),
    style,
  };
  if (i + 1 < mp.humans) beginHumanDraft(i + 1);
  else startBracket();
}

/* ----- chaveamento: pré-simula tudo e reproduz GAME A GAME só os confrontos com humano ----- */
let brk = null, bQueue = [], bIdx = 0, bAnim = null, bTimer = null, bStarted = false, bSpeed = 'normal';
const involvesHuman = (m) => m.a.kind === 'human' || m.b.kind === 'human';
/* nick pode ser um nome digitado pelo jogador → escapar antes de ir para innerHTML */
const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function startBracket() {
  $('draftWho').style.display = 'none';
  const entrants = buildEntrants(mp.players, mp.size, ALL);
  brk = simulateBracket(entrants, mp.slam);
  /* fila = só jogos com humano, em ordem de rodada; histórico-vs-histórico fica oculto */
  bQueue = [];
  brk.rounds.forEach((rd) => rd.forEach((m) => { if (involvesHuman(m)) bQueue.push(m); }));
  bIdx = 0; bAnim = null; bStarted = false; bSpeed = 'normal';
  bStopTimer();
  document.querySelectorAll('#brkSpeed button').forEach((b) => b.classList.toggle('sel', b.dataset.spd === 'normal'));
  $('brkTitle').textContent = 'Torneio local · ' + mp.slam.id;
  $('brkHead').style.background = mp.slam.col;
  $('brkHead').innerHTML = `<div class="shTop">${trophySVG(mp.slam.id)}<span class="nm">${mp.slam.nm}</span></div><div class="sf">${mp.slam.sf} · ${mp.size} tenistas · ${mp.humans} ${mp.humans === 1 ? 'humano' : 'humanos'}</div>`;
  $('brkMatches').innerHTML = '';
  $('champBox').style.display = 'none';
  $('brkHome').style.display = 'none';
  $('brkCtr').style.display = 'flex';
  show('scrBracket');
  if (!bQueue.length) { showChampion(); return; }  /* salvaguarda (não ocorre com ≥2 humanos) */
  bBeginMatch();
  setBrkNext();
}
/* monta a partida atual da fila no placar (0-0), parada */
function bBeginMatch() {
  if (bIdx >= bQueue.length) { bAnim = null; bRenderBoard(); return; }
  const m = bQueue[bIdx];
  bAnim = { m, si: 0, p: 0, o: 0, seqs: m.sets.map(makeGameSeq) };
  bRenderBoard();
}
function bRenderBoard() {
  const board = $('brkBoard');
  if (!bAnim || bSpeed === 'auto') { board.style.display = 'none'; return; } /* Auto: sem placar ao vivo (como no single-player) */
  board.style.display = 'block';
  const m = bAnim.m;
  if (bAnim.tb) { /* tie-break ponto a ponto — lado A à esquerda, B à direita */
    const detail = [];
    for (let i = 0; i < bAnim.si; i++) detail.push(`${m.sets[i][0]}-${m.sets[i][1]}`);
    const dots = bAnim.tb.seq.slice(0, bAnim.tb.i)
      .map((w) => `<span class="tbDot ${w === 'P' ? 'you' : 'opp'}"></span>`).join('');
    const tbLabel = bAnim.si === m.sets.length - 1 ? 'tie-break decisivo' : 'tie-break';
    board.innerHTML = `<div class="bRound">${m.label} · ${tbLabel}</div>
      <div class="bMain">
        <span class="bSide">${escHtml(m.a.nick)}</span>
        <span class="bScore"><span class="${bAnim.tb.p > bAnim.tb.o ? 'lead' : ''}">${bAnim.tb.p}</span><i>—</i><span class="${bAnim.tb.o > bAnim.tb.p ? 'lead' : ''}">${bAnim.tb.o}</span></span>
        <span class="bSide">${escHtml(m.b.nick)}</span>
      </div>
      <div class="tbDots">${dots}</div>
      <div class="bDetail">${detail.join(' · ')}${detail.length ? ' · ' : ''}<b>6-6</b></div>`;
    return;
  }
  const you = [], opp = [];
  for (let i = 0; i < bAnim.si; i++) { you.push(m.sets[i][0]); opp.push(m.sets[i][1]); }
  you.push(bAnim.p); opp.push(bAnim.o);
  const cur = you.length - 1;
  const cells = (vals) => vals.map((v, i) => `<span class="bCell${i === cur ? ' cur' : ''}">${v}</span>`).join('');
  const nm = (p) => `${escHtml(p.nick)} <small>${p.overall}</small>`;
  /* bolinha no sacador, como no placar ao vivo do single-player */
  const aWonSet = m.sets[bAnim.si][0] > m.sets[bAnim.si][1];
  const aServe = serverIsYou(aWonSet, bAnim.p + bAnim.o);
  board.innerHTML = `<div class="bRound">${m.label}</div>
    <div class="bRow"><span class="bNm">${nm(m.a)}${aServe ? TENNIS_BALL : ''}</span><span class="bSets">${cells(you)}</span></div>
    <div class="bRow"><span class="bNm">${nm(m.b)}${aServe ? '' : TENNIS_BALL}</span><span class="bSets">${cells(opp)}</span></div>`;
}
function bStepDelay() { return (bAnim && bAnim.tb) ? Math.round(SPEEDS[bSpeed] * TIEBREAK_SLOWDOWN) : SPEEDS[bSpeed]; }
function bStartTimer() { bStopTimer(); bTimer = setInterval(bTick, bStepDelay()); }
function bStopTimer() { if (bTimer) { clearInterval(bTimer); bTimer = null; } }
function bSetSpeed(s) {
  if (!SPEEDS[s]) return;
  bSpeed = s;
  document.querySelectorAll('#brkSpeed button').forEach((b) => b.classList.toggle('sel', b.dataset.spd === s));
  bRenderBoard(); /* mostra/esconde o placar (Auto não usa placar ao vivo) */
  if (bTimer) bStartTimer();
}
function bTick() {
  if (!bAnim) { bStopTimer(); return; }
  if (bSpeed === 'auto') { bFinalize(); return; } /* revela a partida inteira (como no single-player) */
  const m = bAnim.m;
  if (bAnim.tb) { /* ponto a ponto do tie-break */
    bAnim.tb.seq[bAnim.tb.i] === 'P' ? bAnim.tb.p++ : bAnim.tb.o++;
    bAnim.tb.i++;
    if (bAnim.tb.i >= bAnim.tb.seq.length) { bAnim.tb = null; bAnim.si++; bAnim.p = 0; bAnim.o = 0; if (bTimer) bStartTimer(); }
    if (bAnim.si >= m.sets.length) bFinalize(); else bRenderBoard();
    return;
  }
  const [pg, og] = m.sets[bAnim.si];
  bAnim.seqs[bAnim.si][bAnim.p + bAnim.o] === 'P' ? bAnim.p++ : bAnim.o++;
  /* qualquer set 6-6 vira tie-break dramático; lado A ('P') é quem venceu ESTE set */
  if (isTiebreak(m.sets[bAnim.si]) && bAnim.p === 6 && bAnim.o === 6) {
    bAnim.tb = makeTiebreak(m.sets[bAnim.si][0] > m.sets[bAnim.si][1]);
    if (bTimer) bStartTimer();
    bRenderBoard();
    return;
  }
  if (bAnim.p === pg && bAnim.o === og) { bAnim.si++; bAnim.p = 0; bAnim.o = 0; }
  if (bAnim.si >= m.sets.length) bFinalize();
  else bRenderBoard();
}
function bFinalize() {
  appendBrkLine(bQueue[bIdx]);
  bIdx++;
  bAnim = null;
  if (bIdx < bQueue.length) { bBeginMatch(); setBrkNext(); return; }  /* próximo jogo com humano */
  bStopTimer();
  setTimeout(showChampion, 500);
}
function appendBrkLine(m) {
  const div = document.createElement('div');
  div.className = 'bm hum';
  const side = (p, won) => `<div class="bmP ${won ? 'w' : 'l'}${p.kind === 'human' ? ' you' : ''}"><span class="bmNm">${escHtml(p.nick)}</span><span class="bmOv">${p.overall}</span></div>`;
  const sc = m.sets.map((s) => s[0] + '-' + s[1]).join(' ');
  div.innerHTML = `<div class="bmTop"><span class="bmRd">${m.label}</span><span class="bmSc">${sc}</span></div><div class="bmMain">${side(m.a, m.aWon)}${side(m.b, !m.aWon)}</div>`;
  $('brkMatches').appendChild(div);
}
/* Simular: termina a partida atual na hora (pula a animação) */
function bSkip() {
  if (!bAnim) return;
  const wasRunning = !!bTimer;
  bStopTimer();
  bFinalize();
  if (wasRunning && bAnim) bStartTimer();
  setBrkNext();
}
function setBrkNext() {
  const btn = $('brkNext'), pause = $('brkPause');
  if (!bStarted) { btn.textContent = 'Começar →'; pause.style.display = 'none'; btn.classList.add('full'); return; }
  if (!bAnim) { pause.style.display = 'none'; btn.classList.add('full'); return; }
  btn.textContent = 'Simular ' + bAnim.m.label + ' →';
  pause.style.display = '';
  btn.classList.remove('full');
  pause.innerHTML = bTimer ? (PAUSE_ICON + ' Pausar') : (PLAY_ICON + ' Retomar');
}
function bTogglePause() {
  if (!bStarted || !bAnim) return;
  if (bTimer) bStopTimer(); else bStartTimer();
  setBrkNext();
}
function showChampion() {
  const c = brk.champion;
  bStopTimer();
  $('brkBoard').style.display = 'none';
  $('brkCtr').style.display = 'none';
  const cb = $('champBox');
  cb.style.display = 'block';
  cb.innerHTML = `<span class="cap">Campeão do torneio</span>
    <div class="champTrophy">${trophySVG(mp.slam.id)}</div>
    <div class="champName">${escHtml(c.nick)}</div>
    <div class="champOv">${c.kind === 'human' ? 'Tenista montado' : 'Histórico'} · Overall ${c.overall} · ${mp.slam.nm}</div>`;
  $('brkHome').style.display = '';
  cb.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function exitMp() {
  mp = null; brk = null; bAnim = null;
  bStopTimer();
  onDraftDone = startSeason;
  $('draftWho').style.display = 'none';
  document.documentElement.dataset.theme = homeTheme; /* volta ao tema sorteado da home */
  show('scrHome');
}

/* ================= RESULTADO ================= */
function showResult() {
  stopTimer();
  const wins = st.slamResults.filter((r) => r.won).length;
  const sc = $('resScore');
  sc.textContent = wins + '–' + (4 - wins);
  sc.className = 'resScore' + (wins === 4 ? ' perfect' : '');
  const msgs = {
    4: '<b>GOLDEN SLAM!</b> Os quatro troféus na mesma temporada — você é eterno.',
    3: 'Três taças numa temporada. A perfeição passou de raspão.',
    2: 'Dois Slams na conta — faltou pouco para a lenda.',
    1: 'Um título na bagagem. O Golden Slam fica para a próxima.',
    0: 'Sem troféus desta vez, mas toda lenda começa recomeçando.',
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
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 1800);
}
function copyShare() {
  const wins = st.slamResults.filter((r) => r.won).length;
  const link = buildShareCode();
  const txt = `4a0 — joguei ${wins}–${4 - wins}. Joga a temporada com o meu tenista:\n${link}`;
  navigator.clipboard.writeText(txt).then(() => toast('Link copiado!'));
}

/* gera uma imagem (card) com a campanha e o tenista formado, para compartilhar */
function shareImage() {
  const cs = getComputedStyle(document.documentElement);
  const C = (n, fb) => (cs.getPropertyValue(n).trim() || fb);
  const bg = C('--bg', '#f2ecdd'), ink = C('--ink', '#1b1813'), prim = C('--prim', '#1b1813'),
    acc = C('--acc', '#e8442a'), dim = C('--dim', '#94896f'), line = C('--line', '#ddd3ba'),
    win = C('--win', '#1f9d55'), loss = C('--loss', '#d23b3b');
  const wins = st.slamResults.filter((r) => r.won).length;
  const W = 540, H = 786, s = 2;
  const cv = document.createElement('canvas');
  cv.width = W * s; cv.height = H * s;
  const x = cv.getContext('2d'); x.scale(s, s);
  const serif = (px, w = 400) => `italic ${w} ${px}px Georgia, "Times New Roman", serif`;
  const sans = (px, w = 700) => `${w} ${px}px -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
  const pad = 40;
  x.fillStyle = bg; x.fillRect(0, 0, W, H);
  x.strokeStyle = prim; x.lineWidth = 2; x.strokeRect(14, 14, W - 28, H - 28);

  x.textBaseline = 'alphabetic';
  x.fillStyle = acc; x.font = serif(26); x.textAlign = 'left';
  x.fillText('4–0', pad, 58);
  x.fillStyle = dim; x.font = sans(11); x.textAlign = 'right';
  x.fillText((mode === 'classic' ? 'MODO CLÁSSICO' : 'MODO ALMANAQUE') + ' · ' + styleName().toUpperCase(), W - pad, 56);

  x.textAlign = 'center';
  x.fillStyle = wins === 4 ? acc : prim; x.font = serif(104);
  x.fillText(wins + '–' + (4 - wins), W / 2, 190);
  const msgs = { 4: 'GOLDEN SLAM — você é eterno.', 3: 'Três taças. A perfeição passou perto.', 2: 'Dois Slams — faltou pouco para a lenda.', 1: 'Um título na bagagem. O resto fica pra próxima.', 0: 'Toda lenda começa recomeçando.' };
  x.fillStyle = dim; x.font = serif(17); x.fillText(msgs[wins], W / 2, 224);

  let y = 274;
  x.fillStyle = prim; x.font = serif(18); x.textAlign = 'center';
  x.fillText('Desempenho nos Grand Slams', W / 2, y); y += 22;
  st.slamResults.forEach((r) => {
    x.font = sans(15); x.fillStyle = ink; x.textAlign = 'left';
    x.fillText(r.slam.nm, pad, y + 16);
    x.textAlign = 'right'; x.font = sans(13);
    if (r.won) { x.fillStyle = win; x.fillText('CAMPEÃO', W - pad, y + 16); }
    else { x.fillStyle = loss; x.fillText(r.lostRound + ' · vs ' + lastName(r.lostTo.n) + ' ’' + String(r.lostTo.y).slice(2), W - pad, y + 16); }
    y += 30; x.strokeStyle = line; x.lineWidth = 1; x.beginPath(); x.moveTo(pad, y); x.lineTo(W - pad, y); x.stroke(); y += 8;
  });

  y += 18;
  x.fillStyle = prim; x.font = serif(18); x.textAlign = 'center';
  x.fillText('Seu tenista', W / 2, y); y += 24;
  ATTRS.forEach((a) => {
    const pk = st.picks[a.k];
    x.font = sans(10.5, 800); x.fillStyle = dim; x.textAlign = 'left';
    x.fillText(a.nm.toUpperCase(), pad, y + 14);
    x.font = sans(13.5); x.fillStyle = ink;
    x.fillText(pk.name + ' ’' + String(pk.y).slice(2), pad + 132, y + 14);
    x.font = sans(15, 900); x.fillStyle = acc; x.textAlign = 'right';
    x.fillText(pk.val, W - pad, y + 14);
    y += 26;
  });
  const overall = Math.round(ATTRS.reduce((sum, a) => sum + st.picks[a.k].val, 0) / ATTRS.length);
  y += 4; x.strokeStyle = prim; x.lineWidth = 2; x.beginPath(); x.moveTo(pad, y); x.lineTo(W - pad, y); x.stroke(); y += 22;
  x.font = sans(13, 800); x.fillStyle = prim; x.textAlign = 'left'; x.fillText('OVERALL', pad, y);
  x.font = sans(20, 900); x.textAlign = 'right'; x.fillText('' + overall, W - pad, y);

  x.fillStyle = dim; x.font = sans(12, 700); x.textAlign = 'center';
  x.fillText('leonardonds23.github.io/4a0', W / 2, H - 38);

  cv.toBlob(async (blob) => {
    const file = new File([blob], '4a0.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: '4a0', text: `Joguei ${wins}–${4 - wins} no 4a0` }); } catch (e) { /* cancelado */ }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = '4a0.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Imagem baixada!');
    }
  }, 'image/png');
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
$('imgBtn').innerHTML = IMG_ICON + ' Compartilhar imagem';
$('lossRest').addEventListener('click', resetRun);
$('lossCont').addEventListener('click', lossContinue);
document.querySelectorAll('#speedSel button').forEach((b) => b.addEventListener('click', () => setSpeed(b.dataset.spd)));
$('nextBtn').addEventListener('click', () => {
  if (viewIdx !== seasonIdx) { backToCurrent(); return; }
  if (!started) { started = true; startTimer(); setNextBtn(); return; }
  skipMatch();
});
$('pauseBtn').addEventListener('click', togglePause);
$('copyBtn').addEventListener('click', copyShare);
$('imgBtn').addEventListener('click', shareImage);
$('againBtn').addEventListener('click', resetRun);

/* ----- multiplayer local ----- */
$('friendsBtn').addEventListener('click', openRoom);
$('roomBack').addEventListener('click', () => show('scrHome'));
$('roomSlam').addEventListener('click', (e) => { const b = e.target.closest('.optBtn'); if (!b) return; selOpt($('roomSlam'), b); room.slam = b.dataset.slam; });
$('roomMode').addEventListener('click', (e) => { const b = e.target.closest('.optBtn'); if (!b) return; selOpt($('roomMode'), b); room.mode = b.dataset.mode; });
$('roomSize').addEventListener('click', (e) => { const b = e.target.closest('.optBtn'); if (!b) return; selOpt($('roomSize'), b); room.size = +b.dataset.size; syncRoomHumans(); });
$('roomHumans').addEventListener('input', syncRoomHumans);
$('roomStart').addEventListener('click', startRoom);
$('passStart').addEventListener('click', startHumanDraft);
document.querySelectorAll('#brkSpeed button').forEach((b) => b.addEventListener('click', () => bSetSpeed(b.dataset.spd)));
$('brkNext').addEventListener('click', () => { if (!bStarted) { bStarted = true; bStartTimer(); setBrkNext(); return; } bSkip(); });
$('brkPause').addEventListener('click', bTogglePause);
$('brkHome').addEventListener('click', exitMp);

loadData().then((d) => {
  DATA = d.DATA; YEARS = d.YEARS; ALL = d.ALL;
  $('footStats').textContent = `protótipo · ${YEARS.length} temporadas · ${ALL.length} versões de jogadores`;
});
