# 🎾 4a0 — Quatro a Zero

Monte o tenista perfeito combinando golpes de 8 lendas de épocas diferentes — e tente
vencer os 4 Grand Slams na mesma temporada. **O Golden Slam.**

**Jogar:** sem instalação, sem cadastro. Para rodar localmente:

```bash
npm install
npm run dev        # servidor de desenvolvimento (Vite)
npm run build      # build de produção em /dist
npm run montecarlo # teste de balanceamento (20k temporadas)
```

O deploy é automático: todo push na branch `main` publica no GitHub Pages
(workflow em `.github/workflows/deploy.yml`).

## Como funciona

1. **Sorteie** — clique na raquete: cai um atributo e um ano
2. **Escolha** — de qual tenista daquele ano será o golpe (10 opções, sem repetir jogador)
3. **Vença** — simule AO → RG → Wimbledon → US Open. Perdeu um, já era o 4–0

Dois modos: **Clássico** (notas visíveis, 3 trocas) e **Almanaque** (notas ocultas, 1 troca).
Cada Slam pesa os atributos pela superfície — voleio vale ouro na grama, movimentação manda
no saibro. Não basta ter picos: pra fazer 4–0 não pode haver fraqueza.

## Documentação

- [GDD.md](GDD.md) — Game Design Document completo (mecânicas, fórmulas, roadmap)
- [CLAUDE.md](CLAUDE.md) — contexto do projeto para desenvolvimento com Claude Code

## Estrutura

- `index.html` + `src/` — app Vite modular (vanilla JS, sem framework)
  - `src/config.js` — parâmetros de balanceamento (pesos de superfície, K, clamp...)
  - `src/sim.js` — motor de simulação (puro, compartilhado com o Monte Carlo)
  - `src/draft.js` — sorteio ponderado de jogadores
  - `src/main.js` — UI e fluxo de telas
- `public/data/<ano>.json` — base de jogadores, um arquivo por ano (formato GDD §7.1)
- `prototype/index.html` — protótipo original em arquivo único (referência de UX)
- `scripts/montecarlo.mjs` — validação de balanceamento com o mesmo motor do jogo

Protótipo criado com Claude. Dados de jogadores: amostra de 8 temporadas (2006–2024).
