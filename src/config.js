/* Parâmetros de balanceamento (GDD §11) — ajustar aqui, sem tocar no motor.
   Calibragem validada: K=0.05, clamp [0.08,0.92], ROUND_PEN=[7,7,6,3,2,0,0]
   → build elite ≈14% de 4-0, build bom ≈0,2%. Rodar Monte Carlo ao alterar. */
export const K = 0.05;
export const CLAMP_LO = 0.08;
export const CLAMP_HI = 0.92;
export const MENTAL_W = 0.3;
export const ROUND_PEN = [7, 7, 6, 3, 2, 0, 0];
export const WC_BY_MODE = { classic: 3, almanac: 1 };

/* Ordem canônica dos atributos: [sv, rt, fh, bh, sl, vl, mv, mn] */
export const ATTR_KEYS = ['sv', 'rt', 'fh', 'bh', 'sl', 'vl', 'mv', 'mn'];

export const ATTRS = [
  { k: 0, ic: 'sv', nm: 'Saque' },
  { k: 1, ic: 'rt', nm: 'Devolução' },
  { k: 2, ic: 'fh', nm: 'Forehand' },
  { k: 3, ic: 'bh', nm: 'Backhand' },
  { k: 4, ic: 'sl', nm: 'Slice' },
  { k: 5, ic: 'vl', nm: 'Voleio' },
  { k: 6, ic: 'mv', nm: 'Movimentação' },
  { k: 7, ic: 'mn', nm: 'Mental' },
];

/* 4 chips de cada lado da quadra (x%, y%) */
export const CHIP_POS = {
  0: [26, 14], 2: [26, 38], 4: [26, 62], 6: [26, 86],  /* esquerda: saque, forehand, slice, movimentação */
  1: [74, 14], 3: [74, 38], 5: [74, 62], 7: [74, 86],  /* direita: devolução, backhand, voleio, mental */
};

/* Pesos por superfície na ordem canônica dos atributos (GDD §4.1) */
export const SLAMS = [
  { id: 'AO', nm: 'Australian Open', sf: 'Quadra dura', col: 'var(--ao)', w: [1.2, 1.1, 1.2, 1.0, 0.8, 0.8, 1.1, 1.0] },
  { id: 'RG', nm: 'Roland Garros',   sf: 'Saibro',      col: 'var(--rg)', w: [0.8, 1.2, 1.2, 1.1, 0.9, 0.6, 1.5, 1.1] },
  { id: 'WB', nm: 'Wimbledon',       sf: 'Grama',       col: 'var(--wb)', w: [1.5, 0.9, 1.0, 0.9, 1.3, 1.4, 0.9, 1.1] },
  { id: 'US', nm: 'US Open',         sf: 'Quadra dura', col: 'var(--us)', w: [1.2, 1.1, 1.2, 1.0, 0.8, 0.9, 1.1, 1.0] },
];

export const ROUNDS = ['1ª rodada', '2ª rodada', '3ª rodada', 'Oitavas', 'Quartas', 'Semifinal', 'FINAL'];
