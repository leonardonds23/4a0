/* Parâmetros de balanceamento (GDD §11) — ajustar aqui, sem tocar no motor.
   Calibragem validada (base completa 1990-2025, 36 anos × 50): K=0.05,
   clamp [0.08,0.92], ROUND_PEN=[7,7,6,3,2,0,-1] → drafter elite ≈7,2% de 4-0,
   bom ≈0,8%. O -1 da final significa que o campeão histórico joga 1 ponto
   ACIMA do normal na decisão — escolha do Leonardo (11/06/2026) para deixar
   o Golden Slam mais raro. Rodar Monte Carlo ao alterar. */
export const K = 0.05;
export const CLAMP_LO = 0.08;
export const CLAMP_HI = 0.92;
export const MENTAL_W = 0.3;
export const ROUND_PEN = [7, 7, 6, 3, 2, 0, -1];
export const WC_BY_MODE = { classic: 3, almanac: 1 };

/* Só EXIBIÇÃO (não é balanceamento): durante o tie-break ponto a ponto, o intervalo
   entre pontos é o intervalo do modo de velocidade ativo × este fator — deixa o
   tie-break "respirar" mais que os games, de forma relativa à velocidade escolhida. */
export const TIEBREAK_SLOWDOWN = 1.8;

/* Ordem canônica dos atributos: [sv, rt, fh, bh, sl, vl, mv, mn] */
export const ATTR_KEYS = ['sv', 'rt', 'fh', 'bh', 'sl', 'vl', 'mv', 'mn'];

/* Estilos de jogo (conjunto canônico do tênis). Bônus +3 / ônus -2 sobre as
   notas do tenista na temporada — melhora maior que a piora, escolha do
   Leonardo (12/06/2026). Aplicados via applyStyle (src/sim.js); o Mental
   fica fora (é a alma do jogador, não tática). All-Court é o neutro. */
/* nm = chave i18n (traduzida na UI). desc não é exibido (referência interna). */
export const STYLES = [
  { id: 'aggressive', nm: 'style.aggressive', mods: { sv: 3, fh: 3, rt: -2, mv: -2 }, desc: '+Saque +Forehand · −Devolução −Movimentação' },
  { id: 'counter',    nm: 'style.counter',    mods: { rt: 3, mv: 3, sv: -2, vl: -2 }, desc: '+Devolução +Movimentação · −Saque −Voleio' },
  { id: 'snv',        nm: 'style.snv',        mods: { sv: 3, vl: 3, fh: -2, bh: -2 }, desc: '+Saque +Voleio · −Forehand −Backhand' },
  { id: 'allcourt',   nm: 'style.allcourt',   mods: {},                               desc: 'Jogo completo, sem ajustes' },
];

/* nm = chave i18n (traduzida na UI) */
export const ATTRS = [
  { k: 0, ic: 'sv', nm: 'attr.sv' },
  { k: 1, ic: 'rt', nm: 'attr.rt' },
  { k: 2, ic: 'fh', nm: 'attr.fh' },
  { k: 3, ic: 'bh', nm: 'attr.bh' },
  { k: 4, ic: 'sl', nm: 'attr.sl' },
  { k: 5, ic: 'vl', nm: 'attr.vl' },
  { k: 6, ic: 'mv', nm: 'attr.mv' },
  { k: 7, ic: 'mn', nm: 'attr.mn' },
];

/* 4 chips de cada lado da quadra (x%, y%) — x puxado para o centro para os
   textos longos (Movimentação, etiquetas de jogador) caberem nas linhas */
export const CHIP_POS = {
  0: [33, 14], 2: [33, 38], 4: [33, 62], 6: [33, 86],  /* esquerda: saque, forehand, slice, movimentação */
  1: [67, 14], 3: [67, 38], 5: [67, 62], 7: [67, 86],  /* direita: devolução, backhand, voleio, mental */
};

/* Pesos por superfície na ordem canônica dos atributos (GDD §4.1) */
/* nm = nome próprio do torneio (NÃO traduz). sf = chave i18n da superfície. */
export const SLAMS = [
  { id: 'AO', nm: 'Australian Open', sf: 'surface.hard',  col: 'var(--ao)', w: [1.2, 1.1, 1.2, 1.0, 0.8, 0.8, 1.1, 1.0] },
  { id: 'RG', nm: 'Roland Garros',   sf: 'surface.clay',  col: 'var(--rg)', w: [0.8, 1.2, 1.2, 1.1, 0.9, 0.6, 1.5, 1.1] },
  { id: 'WB', nm: 'Wimbledon',       sf: 'surface.grass', col: 'var(--wb)', w: [1.5, 0.9, 1.0, 0.9, 1.3, 1.4, 0.9, 1.1] },
  { id: 'US', nm: 'US Open',         sf: 'surface.hard',  col: 'var(--us)', w: [1.2, 1.1, 1.2, 1.0, 0.8, 0.9, 1.1, 1.0] },
];

/* chaves i18n das rodadas (sim.js guarda ROUNDS[i] opaco; main.js traduz na exibição) */
export const ROUNDS = ['round.r1', 'round.r2', 'round.r3', 'round.r16', 'round.qf', 'round.sf', 'round.final'];
