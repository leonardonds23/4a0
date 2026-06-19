import './style.css';
import { ATTRS, CHIP_POS, SLAMS, WC_BY_MODE, STYLES, ROUNDS } from './config.js';
import { ICONS, RACKET, THEME_ICONS, MATCH_WIN, MATCH_LOSS, RESTART_ICON, XMARK, REPLAY_ICON, WHATSAPP_ICON, PAUSE_ICON, PLAY_ICON, IMG_ICON, TENNIS_BALL, courtSVG, trophySVG } from './icons.js';
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
  wb: { kicker: 'Wimbledon · London · 1990 — 2026', quote: '«Na grama sagrada, só entra quem merece.»', icon: 'crown' },
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
  updateDraftMeta();
}

const styleName = () => STYLES.find((x) => x.id === style).nm;

/* meta no topo do draft (estilo · modo), no espírito do 7a0 */
function updateDraftMeta() {
  $('draftMeta').textContent = styleName() + ' · ' + (mode === 'classic' ? 'Clássico' : 'Almanaque');
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
      st.options = samplePlayers(DATA, finalYear, 10, st.usedNames);
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
function startTimer() { stopTimer(); animTimer = setInterval(tick, SPEEDS[simSpeed]); }
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

  if (anim.tb) { /* tiebreak do set decisivo — estilo "pênaltis" do 7a0 */
    const detail = [];
    for (let i = 0; i < anim.si; i++) detail.push(`${m.sets[i][0]}-${m.sets[i][1]}`);
    const dots = anim.tb.seq.slice(0, anim.tb.i)
      .map((w) => `<span class="tbDot ${w === 'P' ? 'you' : 'opp'}"></span>`).join('');
    board.innerHTML = `<div class="bRound">${m.round} · tie-break decisivo</div>
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
  if (anim.tb) { /* ponto a ponto do tie-break decisivo */
    anim.tb.seq[anim.tb.i] === 'P' ? anim.tb.p++ : anim.tb.o++;
    anim.tb.i++;
    if (anim.tb.i >= anim.tb.seq.length) { anim.tb = null; anim.si++; anim.p = 0; anim.o = 0; }
    if (anim.si >= m.sets.length) finalizeMatch(); else renderBoard();
    return;
  }
  const [pg, og] = m.sets[anim.si];
  anim.seqs[anim.si][anim.p + anim.o] === 'P' ? anim.p++ : anim.o++;
  /* 2 sets a 2 e set decisivo no tie-break (6-6)? entra no modo dramático */
  if (anim.si === 4 && isTiebreak(m.sets[4]) && anim.p === 6 && anim.o === 6) { anim.tb = makeTiebreak(m.won); renderBoard(); return; }
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

loadData().then((d) => {
  DATA = d.DATA; YEARS = d.YEARS; ALL = d.ALL;
  $('footStats').textContent = `protótipo · ${YEARS.length} temporadas · ${ALL.length} versões de jogadores`;
});
