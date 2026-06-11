# 🎾 4 a 0 — Game Design Document

**Versão:** 1.0 · **Data:** 10/06/2026 · **Autor:** Leonardo Nogueira
**Status:** Conceito fechado, pronto para prototipagem

---

## 1. Visão geral

### 1.1 Pitch

> Monte o tenista perfeito combinando atributos de diferentes jogadores e épocas — e tente vencer Australian Open, Roland Garros, Wimbledon e US Open na mesma temporada. Sem perder nenhum. **4 a 0.**

### 1.2 Conceito

Jogo de navegador gratuito de draft + simulação, inspirado no fenômeno viral 7a0 (futebol), adaptado ao tênis com um twist próprio: em vez de montar um time, o jogador monta **um único atleta Frankenstein**, escolhendo cada um dos 8 atributos de um jogador real de um ano real da era do ranking ATP moderno (1990+).

O objetivo é o feito mais raro do esporte: o **Grand Slam de calendário** (último no masculino: Rod Laver, 1969).

### 1.3 Pilares de design

1. **Zero fricção** — sem cadastro, sem download, sem pagamento. Abre e joga em < 3 segundos no celular.
2. **Superfície é estratégia** — os 3 pisos (dura, saibro, grama) ponderam atributos de forma diferente. Como o objetivo exige vencer TODOS os Slams, não basta ter picos: é preciso não ter fraquezas.
3. **Simplicidade brutal** — resultado seco, sem tutoriais, sem explicações. O jogador aprende jogando (modelo 7a0).
4. **Carta de amor à história do tênis** — celebra tanto os GOATs quanto os heróis de uma campanha (Kyrgios 2022, Del Potro 2009, Soderling 2009, Wawrinka 2015).
5. **Feito para compartilhar** — todo resultado gera um card + share code prontos para virar print.

### 1.4 Público e plataforma

- Fãs de tênis casuais e hardcore; comunidade de futebol/esportes que já consome 7a0.
- Navegador (mobile-first, desktop suportado). Sem app.
- Idiomas: PT → EN → ES (nessa ordem de lançamento).

---

## 2. Loop principal

```
01 SORTEIO   →  02 ESCOLHA   →  (repete 8x)  →  03 TEMPORADA  →  04 SHARE
atributo + ano   1 entre 10        draft           4 Slams        card +
                 jogadores        completo        simulados      share code
```

Duração alvo de uma run: **3 a 5 minutos**.

---

## 3. Mecânicas

### 3.1 Os 8 atributos

| # | Atributo | Ícone | O que representa |
|---|----------|-------|------------------|
| 1 | Saque | 🎾 | Potência e precisão do serviço |
| 2 | Devolução | 🛡️ | Qualidade de devolução de saque |
| 3 | Forehand | 💥 | Golpe de direita |
| 4 | Backhand | 🔄 | Golpe de esquerda |
| 5 | Slice | 🔪 | Variação, slice de backhand, mudança de ritmo |
| 6 | Voleio | 🤚 | Jogo de rede |
| 7 | Movimentação | 🏃 | Deslocamento, defesa, cobertura de quadra |
| 8 | Mental | 🧠 | Frieza em tiebreaks e sets decisivos |

### 3.2 O draft (8 rodadas)

Cada rodada:

1. **Sorteia-se um atributo** ainda não preenchido — **ordem aleatória a cada run** (decisão de design: evita runs repetitivas; escolher voleio na 1ª rodada é diferente de escolher na 8ª).
2. **Sorteia-se um ano** (1990–2025, uniforme no MVP).
3. **Apresentam-se 10 jogadores** daquele ano (ver §3.3).
4. O jogador **escolhe 1**. Aquele atributo passa a ser o do jogador escolhido naquele ano (ex: Saque = Kyrgios 2022 → 95).

**Regra de não-repetição:** um mesmo jogador (independente do ano) só pode ser usado **uma vez** por run. Os 8 atributos virão de 8 tenistas diferentes. Se um jogador já usado aparecer no sorteio, aparece bloqueado (visível, mas não selecionável — reforça a regra sem esconder a informação).

**Wildcards:** o jogador tem **2 re-rolls** por run, que sorteiam novo ano para a rodada atual. *(Parâmetro de balanceamento: começar com 2, ajustar em teste.)*

### 3.3 Sorteio dos 10 jogadores

Pool do ano sorteado = Top 50 ATP do fim daquele ano + destaques de Grand Slam do ano (semifinalistas ou melhor que não estejam no top 50).

Seleção dos 10 com probabilidade ponderada por relevância:

- Ranking 1–10: peso 4
- Ranking 11–25: peso 2
- Ranking 26–50: peso 1
- Destaque de Slam (campeão/finalista/semifinalista): +3 de peso adicional

Cada jogador exibe um **selo de destaque** quando aplicável (⭐ "Campeão de Wimbledon", ⭐ "Finalista do US Open", 🎾 "ATP #4"). O jogador não vê a matemática — só percebe que *as opções fazem sentido*.

### 3.4 Modos de jogo

| | **Clássico** | **Almanaque** |
|---|---|---|
| Notas | Visíveis | Ocultas |
| Decisão | Estatística | Memória, intuição, opinião |
| Público | Entrada | Hardcore / streamers |

Mesma run, mesma simulação — muda apenas a informação exibida no draft. No Almanaque, os selos de destaque continuam visíveis (são fatos históricos, não notas).

---

## 4. Superfícies — a mecânica central

Cada Slam pondera os 8 atributos de forma diferente. A nota efetiva do tenista em cada torneio é a média ponderada dos atributos pelos pesos do piso.

### 4.1 Matriz de pesos (v1 — parâmetro de balanceamento)

| Atributo | 🇦🇺 AO (dura) | 🇫🇷 RG (saibro) | 🇬🇧 WB (grama) | 🇺🇸 US (dura) |
|---|---|---|---|---|
| Saque | 1.2 | 0.8 | **1.5** | 1.2 |
| Devolução | 1.1 | 1.2 | 0.9 | 1.1 |
| Forehand | 1.2 | 1.2 | 1.0 | 1.2 |
| Backhand | 1.0 | 1.1 | 0.9 | 1.0 |
| Slice | 0.8 | 0.9 | **1.3** | 0.8 |
| Voleio | 0.8 | 0.6 | **1.4** | 0.9 |
| Movimentação | 1.1 | **1.5** | 0.9 | 1.1 |
| Mental | 1.0 | 1.1 | 1.1 | 1.0 |

*Leitura: voleio quase não importa no saibro (0.6) e é decisivo na grama (1.4); movimentação domina Roland Garros (1.5).*

**Consequência de design:** um build especialista domina 2–3 Slams e quebra em 1 — e 3-1 é derrota. O jogo força construção equilibrada, o que torna o draft um quebra-cabeça real mesmo no modo Clássico (o maior número nem sempre é a melhor escolha).

A nota efetiva por superfície **não é exibida** ao jogador (pilar da simplicidade). Jogadores descobrem o meta jogando e discutindo — isso alimenta a comunidade.

### 4.2 Fórmula da nota efetiva

```
NotaEfetiva(torneio) = Σ (atributo_i × peso_i(torneio)) / Σ peso_i(torneio)
```

---

## 5. A temporada (simulação)

### 5.1 Estrutura

Os 4 Slams em ordem cronológica: **AO → RG → WB → US**. Perdeu um, a run termina ali? **Não** — a temporada continua até o fim (o jogador quer ver o placar final: 4-0, 3-1, 2-2...), mas o "4 a 0" só sai com perfeição.

Cada Slam = **7 rodadas** (R128 → R64 → R32 → oitavas → quartas → semi → final), melhor de 5 sets.

### 5.2 Adversários: versões históricas reais

Cada partida é contra uma **versão histórica real** de um tenista (ex: "Hewitt 2002", "Federer 2006", "Nadal 2008"). O chaveamento é gerado por dificuldade crescente:

| Fase | Pool de adversários |
|---|---|
| R128–R32 | Jogadores rank 20–50 de anos aleatórios |
| Oitavas–quartas | Rank 5–20 / semifinalistas históricos de Slam |
| Semi | Top 5 históricos / finalistas de Slam |
| Final | Campeões históricos **daquele Slam** (ex: final de RG sempre contra um campeão real de RG: Nadal 2008, Kuerten 1997, Ferrero 2003...) |

A nota do adversário usa a mesma base de dados e a mesma matriz de pesos — especialistas históricos são naturalmente mais perigosos no seu piso.

### 5.3 Simulação de partida

Set a set, melhor de 5:

```
diff = NotaEfetiva(jogador) − NotaEfetiva(adversário)
P(vencer set) = 0.5 + diff × k            // k ≈ 0.035, clamp [0.10, 0.90]
```

- O clamp garante **zebras**: nenhum favorito vence sempre, nenhum azarão perde sempre. Zebra é conteúdo compartilhável.
- **Set decisivo (5º set) e tiebreaks:** o atributo Mental entra como modificador extra: `diff_decisivo = diff + (Mental_jogador − Mental_adversário) × 0.3`. Silencioso — o jogador nunca vê a conta, só sente que "fulano amarela no 5º set".
- Placar de games gerado cosmeticamente coerente com o vencedor do set (6-4, 7-5, 7-6...).

### 5.4 Apresentação dos resultados

Estilo 7a0 — seco e rápido:

- Cada partida exibida em uma linha: `QF · vs Safin 2000 · 6-4 3-6 7-6 6-2 ✅`
- Sem narrativa, sem explicação de derrota, sem estatísticas de partida.
- Dois ritmos: avançar toque a toque ou **auto-sim** até o fim.

---

## 6. Tela de resultado e compartilhamento

### 6.1 Card final

Conteúdo do card (otimizado para screenshot vertical de celular):

- Placar gigante: **4-0** / 3-1 / 2-2 / 1-3 / 0-4
- Os 4 Slams com 🏆 ou ❌ (e contra quem perdeu, se perdeu: "❌ WB — final vs Federer 2006")
- O Frankenstein completo: 8 atributos com jogador + ano de cada
- Logo/URL do jogo

### 6.2 Share code

Code curto que codifica apenas as escolhas (8 pares jogador-ano + formação da run). Sem dado pessoal. Quem recebe pode carregar o build e rodar a própria temporada com ele ("seu tenista ganhou 4-0 comigo? Comigo ele caiu na semi do US").

---

## 7. Modelo de dados

### 7.1 Estrutura (JSON estático, sem backend)

```json
{
  "year": 2022,
  "players": [
    {
      "id": "kyrgios",
      "name": "Nick Kyrgios",
      "country": "AUS",
      "rank": 22,
      "highlight": { "type": "finalist", "slam": "WB" },
      "attrs": { "sv": 95, "rt": 76, "fh": 88, "bh": 80,
                 "sl": 84, "vl": 91, "mv": 78, "mn": 70 }
    }
  ]
}
```

Um arquivo por ano (`/data/2022.json`), carregado sob demanda — mantém o load inicial mínimo.

### 7.2 Escopo da base

- **36 anos** (1990–2025) × ~55 jogadores/ano ≈ **~2.000 entradas** (com sobreposição de jogadores entre anos).
- Cada entrada: 8 notas + rank + destaque. ≈ 16.000 notas a curar.

### 7.3 Estratégia de geração das notas

1. **Base estatística automática** onde houver dado público: % pontos ganhos no 1º saque → Saque; % games de devolução vencidos → Devolução; títulos/resultados por piso → ajustes de Movimentação etc. (fontes: ATP, Tennis Abstract).
2. **Curadoria manual** para o que estatística não captura (Slice, Voleio, Mental) e para anos antigos com dados escassos.
3. **Notas na escala 50–99**, distribuição calibrada para que a média do top 10 fique ~88 e a do rank 40–50 fique ~78.
4. MVP pode lançar com **subconjunto de anos** (ex: 2000–2025) e expandir até 1990 depois.

### 7.4 Risco jurídico

Uso de nomes e dados factuais de atletas reais. Mitigação: apenas dados factuais públicos (nome, ranking, resultados), sem fotos, sem likeness visual, sem monetização agressiva. **Buscar orientação jurídica antes de qualquer monetização.** (Mesmo modelo de exposição do 7a0.)

---

## 8. Telas (fluxo)

```
[Home] → [Config: modo Clássico/Almanaque] → [Draft ×8] → [Temporada ×4 Slams] → [Card final + share]
   ↑__________________________________________________________________________________| (Jogar de novo)
```

1. **Home** — logo, tagline, botão JOGAR, contagem de runs do dia (social proof), seletor de idioma.
2. **Config** — escolha do modo. Nada mais.
3. **Draft** — atributo sorteado em destaque, ano sorteado, lista de 10 jogadores com selos (e notas, se Clássico), botão de wildcard (×2), barra de progresso dos 8 atributos.
4. **Temporada** — chaveamento do Slam atual, partidas linha a linha, botão auto-sim.
5. **Resultado** — card final, botão copiar share code, botão jogar de novo.

---

## 9. Stack técnica

| Camada | Escolha | Racional |
|---|---|---|
| Frontend | **SPA estática** (Svelte ou React + Vite) | Leve, carrega < 3s, lógica 100% no cliente |
| Backend | **Nenhum** | Toda simulação roda no navegador; segue o modelo 7a0 que aguentou 100k usuários/hora |
| Dados | JSON estáticos por ano, servidos via CDN | Cache agressivo, custo ~zero |
| Hosting | Cloudflare Pages ou Vercel (free tier) | Edge, escala viral sem fatura surpresa |
| Share code | Build serializado em base64/URL | Sem banco de dados |
| Analytics | Plausible ou Cloudflare Analytics | Sem cookie, simplifica LGPD |
| i18n | Arquivos de strings PT/EN/ES | — |

**Custo de operação alvo: R$ 0–50/mês** mesmo em cenário viral (só domínio + eventual excesso de banda).

---

## 10. Roadmap

### MVP (objetivo: jogável de ponta a ponta)

- [ ] Motor do draft (sorteios, regra de não-repetição, wildcards)
- [ ] Motor de simulação (pesos de superfície, sets, Mental em decisivos)
- [ ] Base de dados inicial: 10 anos (2015–2024), ~550 entradas
- [ ] Modo Clássico
- [ ] Card final + share code
- [ ] PT apenas

### v1.0 (lançamento público)

- [ ] Modo Almanaque
- [ ] Base completa 2000–2025
- [ ] EN + ES
- [ ] Polimento mobile + card otimizado para print

### Pós-lançamento (conforme tração)

- [ ] Expansão 1990–1999
- [ ] Tênis feminino (WTA) — duplica o público
- [ ] Desafio diário (mesmo sorteio para todos, estilo Wordle)
- [ ] Modo "carregar build de amigo" via share code

---

## 11. Parâmetros de balanceamento (resumo)

Tudo que deve ser ajustável sem reescrever código:

| Parâmetro | Valor inicial |
|---|---|
| Wildcards por run | 2 |
| Matriz de pesos por superfície | §4.1 |
| k (sensibilidade da prob. de set) | 0.035 |
| Clamp de probabilidade | [0.10, 0.90] |
| Peso do Mental em decisivos | 0.3 |
| Pesos do sorteio de jogadores | §3.3 |
| Taxa-alvo de runs 4-0 | **~5–8%** (raro o suficiente para ser troféu, comum o suficiente para ser perseguível) |

---

## 12. Decisões em aberto

1. Nome final e domínio (4a0.com.br? quatroazero?).
2. Quantidade exata de wildcards (2 vs 3).
3. Mostrar ou não o adversário da próxima rodada antes da partida (tensão vs simplicidade).
4. WTA no lançamento ou depois.
5. Validação jurídica do uso de nomes reais.
