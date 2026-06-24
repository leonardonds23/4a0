/* Português (canônico). Chave → texto. Nomes próprios de torneios e marca ("4–0",
   "Quatro a Zero", "Golden Slam") não se traduzem. Os "feitos históricos" dos
   jogadores vêm dos dados (public/data) e não são traduzidos aqui. */
export default {
  /* home */
  'home.h1': 'Conquiste o que nunca foi conquistado:',
  'home.h3': 'Vença os 4 Grand Slams numa mesma temporada e fique marcado na história.',
  'home.stepsTitle': 'Monte o seu tenista dos sonhos',
  'home.step1Title': 'Sorteie', 'home.step1': 'Um atributo e um ano.',
  'home.step2Title': 'Escolha', 'home.step2': 'De qual tenista daquele ano será o atributo.',
  'home.step3Title': 'Simule e vença', 'home.step3': 'O tão sonhado Golden Slam.',
  'home.play': 'JOGAR AGORA →',
  'home.friends': 'Jogar com amigos · Local →',
  'home.loading': 'protótipo · carregando…',
  'home.stats': 'protótipo · {years} temporadas · {players} versões de jogadores',
  /* citações por Slam (home) */
  'quote.ao': '«O Slam feliz abre a temporada dos sonhos.»',
  'quote.rg': '«A terra batida consagra os bravos.»',
  'quote.wb': '«Na grama sagrada, só entra quem merece.»',
  'quote.us': '«A noite mais barulhenta do tênis decide tudo.»',

  /* modos */
  'mode.classic': 'Clássico', 'mode.classicSub': 'Notas visíveis · 3 trocas',
  'mode.almanac': 'Almanaque', 'mode.almanacSub': 'Notas ocultas · 1 troca',
  'mode.classicCap': 'MODO CLÁSSICO', 'mode.almanacCap': 'MODO ALMANAQUE',

  /* draft */
  'draft.tag': '8 atributos · 4 Slams · 1 lenda',
  'draft.trades': 'Trocas restantes ·',
  'draft.draw': 'Sorteie', 'draft.choose': 'Escolha',
  'draft.attr': 'Atributo', 'draft.year': 'Ano',
  'draft.swapAttr': 'Trocar o atributo', 'draft.swapYear': 'Trocar o ano',
  'draft.styleTitle': 'Estilo de jogo',
  'draft.rollHint': 'Clique na raquete para sortear o atributo e o ano.',
  'draft.progress': 'SEU TENISTA · {n}/8',
  'draft.avg': 'MÉDIA', 'draft.overall': 'OVERALL',
  'draft.confirmPlayer': 'CONFIRMAR TENISTA →', 'draft.playSeason': 'JOGAR A TEMPORADA →',
  'draft.used': 'JÁ USADO',
  'draft.building': '{nick} montando · {i}/{total}',

  /* atributos (config ATTRS) */
  'attr.sv': 'Saque', 'attr.rt': 'Devolução', 'attr.fh': 'Forehand', 'attr.bh': 'Backhand',
  'attr.sl': 'Slice', 'attr.vl': 'Voleio', 'attr.mv': 'Movimentação', 'attr.mn': 'Mental',

  /* estilos de jogo (config STYLES) */
  'style.aggressive': 'Agressivo', 'style.counter': 'Contra-atacante',
  'style.snv': 'Saque-e-voleio', 'style.allcourt': 'All-Court',

  /* superfícies (config SLAMS.sf) */
  'surface.hard': 'Quadra dura', 'surface.clay': 'Saibro', 'surface.grass': 'Grama',

  /* rodadas da temporada (config ROUNDS) */
  'round.r1': '1ª rodada', 'round.r2': '2ª rodada', 'round.r3': '3ª rodada',
  'round.r16': 'Oitavas', 'round.qf': 'Quartas', 'round.sf': 'Semifinal', 'round.final': 'FINAL',

  /* temporada / simulação */
  'season.title': 'Temporada',
  'season.speed': 'Velocidade',
  'speed.lenta': 'Lenta', 'speed.normal': 'Normal', 'speed.rapida': 'Rápida', 'speed.auto': 'Auto',
  'season.start': 'Começar →', 'season.simulate': 'Simular {round} →',
  'season.backToCurrent': 'Voltar ao torneio atual →',
  'season.pause': 'Pausar', 'season.resume': 'Retomar',
  'season.eliminated': 'Eliminado — {slam}',
  'season.lossDetail': '{round} · vs {opp} ’{yy}',
  'season.continue': 'Continuar temporada →', 'season.seeResult': 'Ver resultado 🏁',
  'season.reset': 'Reiniciar',
  'board.you': 'Você',
  'tiebreak': 'tie-break', 'tiebreak.decisive': 'tie-break decisivo',

  /* resultado */
  'result.perf': 'Desempenho nos Grand Slams', 'result.yourPlayer': 'Seu tenista',
  'result.share': 'Compartilhar imagem', 'result.copy': 'Copiar link', 'result.again': 'Jogar de novo',
  'result.champion': 'CAMPEÃO', 'result.overall': 'Overall',
  'result.setsWon': 'Sets ganhos', 'result.setsLost': 'Sets perdidos',
  'result.msg4': '<b>GOLDEN SLAM!</b> Os quatro troféus na mesma temporada — você é eterno.',
  'result.msg3': 'Três taças numa temporada. A perfeição passou de raspão.',
  'result.msg2': 'Dois Slams na conta — faltou pouco para a lenda.',
  'result.msg1': 'Um título na bagagem. O Golden Slam fica para a próxima.',
  'result.msg0': 'Sem troféus desta vez, mas toda lenda começa recomeçando.',
  /* mensagens do card de imagem (mais curtas) */
  'img.msg4': 'GOLDEN SLAM — você é eterno.', 'img.msg3': 'Três taças. A perfeição passou perto.',
  'img.msg2': 'Dois Slams — faltou pouco para a lenda.', 'img.msg1': 'Um título na bagagem. O resto fica pra próxima.',
  'img.msg0': 'Toda lenda começa recomeçando.',
  'share.text': '4a0 — joguei {score}. Joga a temporada com o meu tenista:',
  'toast.copied': 'Link copiado!', 'toast.imgSaved': 'Imagem baixada!',

  /* sala (multiplayer local) */
  'room.localTitle': 'Jogar com amigos · Local',
  'room.title': 'Configure a sala',
  'room.slam': 'Grand Slam', 'room.bracket': 'Tamanho da chave',
  'room.humans': 'Jogadores humanos ·', 'room.draftMode': 'Modo de draft',
  'room.modeClassic': 'Clássico · notas visíveis', 'room.modeAlmanac': 'Almanaque · notas ocultas',
  'room.start': 'Começar →', 'room.back': '← Voltar',
  'room.fill1': '{n} vaga vira tenista histórico', 'room.fillN': '{n} vagas viram tenistas históricos',
  'room.fillFull': 'chave cheia — sem históricos',
  'room.player': 'Jogador {n}',

  /* passe o aparelho */
  'pass.placeholder': 'Seu nome (opcional)',
  'pass.title': 'Passe o aparelho para o Jogador {n}',
  'pass.subAlmanac': 'É a vez dele montar o tenista — e as notas ficam ocultas para todos.',
  'pass.subClassic': 'É a vez dele montar o tenista. Sem espiar!',
  'pass.start': 'Começar meu draft →',

  /* bracket (torneio local) */
  'bracket.title': 'Torneio local',
  'bracket.head': '{surface} · {size} tenistas · {humans}',
  'bracket.human1': '1 humano', 'bracket.humanN': '{n} humanos',
  'bracket.final': 'Final', 'bracket.semi': 'Semifinal', 'bracket.quarters': 'Quartas',
  'bracket.r16': 'Oitavas', 'bracket.roundOf': 'Rodada de {n}',
  'bracket.champTitle': 'Campeão do torneio',
  'bracket.built': 'Tenista montado', 'bracket.historical': 'Histórico',
  'bracket.champOv': '{kind} · Overall {ov} · {slam}',
  'bracket.backHome': '← Voltar ao início',
};
