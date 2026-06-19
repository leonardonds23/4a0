/* ================= ÍCONES (flat, inline SVG) ================= */
const SV = (paths, fill) => `<svg class="ic" viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export const ICONS = {
  sv: SV('<path d="M13 2 6 13h5l-2 9 7-13h-5z"/>', true),
  rt: SV('<path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z"/>'),
  fh: SV('<path d="M3 17Q11 3 20 9"/><path d="M20 9l-5.5-.6M20 9l-1.4-5"/>'),
  bh: SV('<path d="M21 17Q13 3 4 9"/><path d="M4 9l5.5-.6M4 9l1.4-5"/>'),
  sl: SV('<path d="M4 20 20 4"/><path d="M12 12l5 5"/>'),
  vl: SV('<rect x="4" y="8" width="16" height="9" rx="1"/><path d="M9.3 8v9M14.6 8v9M4 12.5h16"/>'),
  mv: SV('<path d="M5 5l6 7-6 7"/><path d="M12 5l6 7-6 7"/>'),
  mn: SV('<circle cx="12" cy="12" r="8.5"/><path d="M7.5 12q2.2-3.4 4.5 0t4.5 0"/>'),
};

/* ícones do filete dos temas (sol, troféu, coroa, arranha-céu) */
const TI = (paths) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
export const THEME_ICONS = {
  sun: TI('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  trophy: TI('<path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5"/>'),
  crown: TI('<path d="M4 18 3 7l5 4 4-6 4 6 5-4-1 11z"/>'),
  sky: TI('<path d="M5 21V9l5-4v16M10 21v-8l6-3v11M3 21h18"/>'),
};

/* resultado de partida: check (vitória) e X (derrota), sem emoji */
const MR = (paths, color) => `<svg class="mres" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5" stroke-width="2"/>${paths}</svg>`;
export const MATCH_WIN = MR('<path d="M7.8 12.4l2.8 2.8L16.4 9"/>', 'var(--win)');
export const MATCH_LOSS = MR('<path d="M9 9l6 6M15 9l-6 6"/>', 'var(--loss)');

/* ícone de recomeçar (Reiniciar) */
export const RESTART_ICON = `<svg class="restIc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 2.6 6.3"/><path d="M3 20v-5h5"/></svg>`;

/* X de derrota para as abas dos Slams (sem emoji) */
export const XMARK = `<svg class="xmk" viewBox="0 0 24 24" fill="none" stroke="var(--loss)" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

/* jogar de novo (seta circular de replay) */
export const REPLAY_ICON = `<svg class="bIc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 4v5h-5"/></svg>`;
/* logo do WhatsApp (balão + fone), desenhado */
export const WHATSAPP_ICON = `<svg class="bIc" viewBox="0 0 32 32" fill="currentColor"><path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8c1.8 1 3.9 1.5 6.2 1.5 7.2 0 13-5.8 13-13S23.2 3 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-4 1.1 1.1-3.9-.3-.4A10.5 10.5 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.3-.7.1a8.6 8.6 0 0 1-2.5-1.6 9.5 9.5 0 0 1-1.8-2.2c-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.4-.6s0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4a3.7 3.7 0 0 0-1.1 2.7c0 1.6 1.1 3.1 1.3 3.3s2.3 3.6 5.7 5c.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5s.3-1.4.2-1.5-.4-.3-.7-.4z"/></svg>`;

/* controles da temporada: avançar rápido (Auto) e pausar */
export const FF_ICON = `<svg class="btnIc" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4 5v14l9-7z"/><path d="M13 5v14l9-7z"/></svg>`;
export const PAUSE_ICON = `<svg class="btnIc" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`;
export const PLAY_ICON = `<svg class="btnIc" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 5v14l11-7z"/></svg>`;
/* compartilhar imagem (moldura com montanha + sol) */
export const IMG_ICON = `<svg class="bIc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.6"/><path d="M21 16l-5-5L5 20"/></svg>`;

/* ================= QUADRA (SVG) ================= */
export function courtSVG() {
  return `<svg viewBox="0 0 360 520" style="width:100%;display:block;border-radius:14px;">
    <rect width="360" height="520" rx="14" fill="var(--court)"/>
    <rect y="65" width="360" height="65" fill="var(--court2)"/><rect y="195" width="360" height="65" fill="var(--court2)"/>
    <rect y="325" width="360" height="65" fill="var(--court2)"/><rect y="455" width="360" height="65" fill="var(--court2)"/>
    <g stroke="var(--chalk)" stroke-width="3" fill="none">
      <rect x="24" y="18" width="312" height="484"/>
      <line x1="60" y1="18" x2="60" y2="502"/><line x1="300" y1="18" x2="300" y2="502"/>
      <line x1="60" y1="150" x2="300" y2="150"/><line x1="60" y1="370" x2="300" y2="370"/>
      <line x1="180" y1="150" x2="180" y2="370"/>
      <line x1="180" y1="18" x2="180" y2="28"/><line x1="180" y1="492" x2="180" y2="502"/>
    </g>
    <line x1="16" y1="260" x2="344" y2="260" stroke="#fff" stroke-width="5"/>
    <circle cx="16" cy="260" r="4" fill="#fff"/><circle cx="344" cy="260" r="4" fill="#fff"/>
  </svg>`;
}

/* troféus estilizados de cada Slam */
export function trophySVG(id) {
  const silver = ['#dfe4e8', '#8e979e'], gold = ['#e7bd4d', '#a87f1f'];
  const [f, s] = id === 'WB' ? gold : silver;
  const W = `width="38" height="38" viewBox="0 0 48 48"`;
  if (id === 'AO') /* Norman Brookes: taça larga e baixa, com tampa e alças grandes */
    return `<svg ${W} fill="${f}" stroke="${s}" stroke-width="1.5">
      <ellipse cx="24" cy="13" rx="11" ry="2.5"/><circle cx="24" cy="8" r="2.5"/><path d="M24 10v2"/>
      <path d="M11 14h26c0 9-6.5 13-13 13s-13-4-13-13z"/>
      <path d="M11 15c-7 0-7 9 1 10M37 15c7 0 7 9-1 10" fill="none" stroke-width="2.5"/>
      <rect x="21.5" y="27" width="5" height="7"/><rect x="14" y="34" width="20" height="4" rx="1"/></svg>`;
  if (id === 'RG') /* Coupe des Mousquetaires: bowl prateado sem tampa, alças em curva */
    return `<svg ${W} fill="${f}" stroke="${s}" stroke-width="1.5">
      <path d="M13 12h22c0 10-5.5 15-11 15s-11-5-11-15z"/>
      <path d="M13 13c-6 2-5 9 2 9M35 13c6 2 5 9-2 9" fill="none" stroke-width="2.5"/>
      <rect x="21.5" y="27" width="5" height="6"/><rect x="13" y="33" width="22" height="5" rx="1"/></svg>`;
  if (id === 'WB') /* Gentlemen's Trophy: taça dourada com tampa e abacaxi */
    return `<svg ${W} fill="${f}" stroke="${s}" stroke-width="1.5">
      <circle cx="24" cy="5.5" r="2.2"/><ellipse cx="24" cy="11" rx="8.5" ry="2.2"/><path d="M24 8v1"/>
      <path d="M14 12h20v4c0 8-4.5 12-10 12s-10-4-10-12z"/>
      <path d="M14 14c-5.5 0-5.5 8 1 8M34 14c5.5 0 5.5 8-1 8" fill="none" stroke-width="2.3"/>
      <rect x="21.5" y="28" width="5" height="6"/><rect x="15" y="34" width="18" height="4" rx="1"/></svg>`;
  /* US Open: taça alta prateada com alças amplas */
  return `<svg ${W} fill="${f}" stroke="${s}" stroke-width="1.5">
    <path d="M15 7h18v8c0 9-4 14-9 14s-9-5-9-14z"/>
    <path d="M15 9c-7 1-7 11 1 12M33 9c7 1 7 11-1 12" fill="none" stroke-width="2.5"/>
    <rect x="21.5" y="29" width="5" height="5"/><rect x="14" y="34" width="20" height="4" rx="1"/></svg>`;
}

/* raquete profissional do sorteio */
export const RACKET = `<svg width="64" height="64" viewBox="0 0 72 72" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <g transform="rotate(-32 30 26)">
    <defs><clipPath id="rkHead"><ellipse cx="30" cy="22" rx="12.2" ry="16"/></clipPath></defs>
    <!-- cordas -->
    <g clip-path="url(#rkHead)" stroke="#9aa4ac" stroke-width=".9">
      <path d="M20 9v28M24 7v32M28 6v33M32 6v33M36 7v32M40 9v28"/>
      <path d="M17 12h26M16 17h28M16 22h28M16 27h28M17 32h26"/>
    </g>
    <!-- aro externo e interno -->
    <ellipse cx="30" cy="22" rx="14.5" ry="18.3" stroke="#1b1813" stroke-width="3.6"/>
    <ellipse cx="30" cy="22" rx="12.2" ry="16" stroke="#c0562a" stroke-width="1.4"/>
    <!-- garganta em V -->
    <path d="M21.5 36.5C24 42 26.5 44.5 28.6 46.5M38.5 36.5C36 42 33.5 44.5 31.4 46.5" stroke="#1b1813" stroke-width="3.4"/>
    <!-- cabo com grip -->
    <rect x="27.4" y="46" width="5.2" height="16.5" rx="2" fill="#1b1813"/>
    <path d="M27.6 49.5l4.8 1.8M27.6 53l4.8 1.8M27.6 56.5l4.8 1.8" stroke="#6b6257" stroke-width="1"/>
    <rect x="26.9" y="61" width="6.2" height="2.6" rx="1.2" fill="#c0562a"/>
  </g>
  <circle cx="57" cy="18" r="6.5" fill="var(--ballBg)" stroke="var(--ball)" stroke-width="2"/>
  <path d="M51.5 14.5q5.5 3.8 11 0" stroke="var(--ball)" stroke-width="1.5"/>
  <path d="M51.5 21.5q5.5-3.8 11 0" stroke="var(--ball)" stroke-width="1.5"/></svg>`;

/* bola de tênis miúda — indicador de quem está sacando no placar ao vivo */
export const TENNIS_BALL = `<svg class="srvBall" viewBox="0 0 16 16" aria-label="saque">
  <circle cx="8" cy="8" r="6.6" fill="#d4e34a" stroke="#aac039" stroke-width="0.8"/>
  <path d="M3.1 3.3Q7.4 8 3.1 12.7" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M12.9 3.3Q8.6 8 12.9 12.7" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>`;
