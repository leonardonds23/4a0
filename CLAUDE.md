# 4a0 — Quatro a Zero

Jogo de navegador de tênis: o jogador monta um "tenista Frankenstein" draftando 8 atributos
(Saque, Devolução, Forehand, Backhand, Slice, Voleio, Movimentação, Mental) de jogadores
reais de anos diferentes (era ATP moderna, 1990+), e simula os 4 Grand Slams da temporada.
Objetivo: vencer todos — o Golden Slam (4–0). Inspirado no jogo viral 7a0 (futebol).

## Estado atual

- Projeto Vite modular (vanilla JS): `index.html` + `src/` (config de balanceamento,
  motor de simulação puro, draft, UI) com dados em `public/data/<ano>.json` (GDD §7.1).
- `prototype/index.html` — protótipo original em arquivo único (validado com usuários).
  É a referência de UX/visual/mecânicas. Tudo que ele faz deve continuar funcionando.
- `GDD.md` — Game Design Document com fórmulas, pesos de superfície, modelo de dados e roadmap.
- Deploy automático no GitHub Pages a cada push na `main` (`.github/workflows/deploy.yml`).
- `npm run montecarlo` roda o teste de balanceamento (20k temporadas, mesmo motor do jogo).

## Regras de design já validadas (não mudar sem perguntar)

- Zero fricção: sem cadastro, sem backend, lógica 100% no cliente, carrega < 3s.
- Visual: fundo creme (#f2ecdd), tinta #1b1813, acento vermelho #e8442a, ano em azul #2f7fd1,
  estilo "box score". Quadra de tênis com os 8 atributos posicionados (4 por lado).
- Draft: raquete clicável sorteia atributo+ano com animação de roleta; lista de 10 jogadores
  com `ATP #X | feito histórico` (⭐ só para campeões de Slam no ano, decisão do Leco
  11/06/2026 — estrela em todo feito confundia); não pode repetir jogador; trocas escolhíveis
  (ano OU atributo): 3 no Clássico, 1 no Almanaque (notas ocultas).
- Simulação: pesos por superfície (ver GDD §4), adversários históricos reais, final de cada
  Slam contra campeão real daquele Slam; Mental pesa em sets decisivos. Resultado seco.
- Ao perder um Slam: opção Continuar/Reiniciar. Tela final: placar gigante, desempenho por
  Slam à esquerda, lista de atributos alinhada à direita, botão copiar.
- Calibragem validada (base completa 1990–2025): K=0.05, clamp [0.08,0.92],
  ROUND_PEN=[7,7,6,3,2,0,-1] → drafter elite ≈7,2% de 4-0, bom ≈0,8%. O −1 da final
  = campeão histórico joga 1 acima na decisão (escolha do Leonardo, 11/06/2026, para
  tornar o Golden Slam mais raro; endurecer para −2 é opção futura se 4-0 banalizar).

## Roadmap (do GDD)

1. ✅ Migrar para Vite + estrutura modular (dados em /data/<ano>.json, lógica separada da UI)
   mantendo build final leve e deploy estático.
2. ✅ Base completa 1990–2025 (36 anos × 50 = 1.802 versões; rankings oficiais de fim de
   ano via dataset Tennis Abstract + notas curadas; scripts em /scripts/expand-data*.mjs).
3. Share code (build serializado em base64 na URL).
4. i18n PT/EN/ES. Modo Almanaque polido. Desafio diário.
5. ✅ Deploy: GitHub Pages (gratuito) — workflow de deploy automático no push.

## Convenções

- Português nos textos de UI; código e commits em inglês.
- Sem dependências pesadas; sem framework de UI a menos que necessário (vanilla ou Svelte).
- Testes da simulação: rodar Monte Carlo (20k temporadas) ao alterar parâmetros de balanceamento.
