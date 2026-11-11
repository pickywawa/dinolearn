import type { Catalog } from '../index';
import { kv } from '../kv';

/** Português do Brasil (segunda língua: inglês). */
const pt: Catalog = {
  ...kv('lang', 'fr=francês; en=inglês; es=espanhol; it=italiano; de=alemão; pt=português; ru=russo; zh=chinês; hi=híndi; ar=árabe; ur=urdu; bn=bengali'),
  ...kv('country', 'fr=França; be=Bélgica; ch=Suíça; ca=Canadá; lu=Luxemburgo; gb=Reino Unido; us=Estados Unidos; es=Espanha; mx=México; it=Itália; de=Alemanha; at=Áustria; pt=Portugal; br=Brasil; ru=Rússia; cn=China; in=Índia; eg=Egito; ma=Marrocos; sa=Arábia Saudita; pk=Paquistão; bd=Bangladesh'),

  'ui.loading': 'Carregando…',
  'ui.rotate': 'Vire o tablet!',
  'ui.tap': 'Toque na tela para jogar!',
  'ui.retry': 'Tentar de novo',
  'ui.problem': 'Problema: {reason}',
  'ui.cancel': 'Cancelar',
  'ui.skip': 'Saltar', 'ui.home.play': 'Jogar', 'ui.home.missions': 'Missões', 'ui.home.mydino': 'Meu dino', 'ui.home.settings': 'Definições', 'ui.end.again': 'Jogar de novo', 'ui.home.playWith': 'Brinque com o seu dino, {name}!',
  'ui.home.learn': 'Aprenda e brinque com o seu Dino!',
  'ui.home.summary': '{n} rodadas terminadas. O seu dino cresce com você!',
  'ui.home.sleeping': 'Psiu… o dino está dormindo.\nUm adulto pode desbloquear com o código.',
  'ui.home.timeUp': 'O tempo de jogo acabou.\nUm adulto pode desbloquear com o código.',
  'ui.child.title': 'Qual é o nome da criança?',
  'ui.child.sub': 'O dino vai chamar a criança pelo nome.',
  'ui.parents.title': 'Área dos pais',
  'ui.pin.type': 'Digite o código dos pais.',
  'ui.pin.title': 'Código dos pais',
  'ui.pin.choose': 'Escolha um código de 4 dígitos.',
  'ui.wardrobe.title': 'Meu Dino – Guarda-roupa',
  'ui.wardrobe.reactions': ['Que legal!', 'Adorei!', 'Como estou bonito!', 'Que chique!'],
  'ui.choose.voice': 'Em voz alta',
  'ui.choose.voiceTitle': 'Jogue em voz alta!',
  'ui.choose.title': 'Escolha um jogo!',
  'ui.end.3': 'Parabéns!', 'ui.end.2': 'Muito bem!', 'ui.end.1': 'Bom trabalho!', 'ui.end.0': 'Continue assim!',
  'ui.end.done': 'Você terminou a rodada!',
  'ui.time.unlimited': 'Ilimitado', 'ui.time.less': 'Menos tempo', 'ui.time.more': 'Mais tempo',
  'ui.lang': 'Idioma', 'ui.langLabel': 'Idioma:', 'ui.mb': '{n} MB',
  'ui.pack.voice': 'pacote de {language}', 'ui.pack.asr': 'reconhecimento de voz',
  'ui.pack.stalled': 'O download parou. Verifique a ligação à internet.',
  'ui.pack.downloading': 'Baixando: {list}', 'ui.pack.installing': 'Instalando o reconhecimento de voz',
  'ui.pack.speechTitle': 'Voz do dino ({language})', 'ui.pack.speechDetail': 'Uma voz natural, igual em todos os aparelhos.',
  'ui.pack.secondTitle': 'Voz em {language}', 'ui.pack.secondDetail': 'Para as palavras dos jogos em outra língua.',
  'ui.pack.asrTitle': 'Reconhecimento de voz', 'ui.pack.asrDetail': 'Para responder em voz alta.',
  'ui.pack.download': 'Baixar', 'ui.pack.installed': 'Instalado ✓',
  'ui.pack.toDownload': 'Para baixar: {n} MB (de preferência no Wi-Fi).', 'ui.pack.allInstalled': 'Tudo está instalado.',
  'ui.pack.running': 'Baixando…', 'ui.pack.finished': 'Pronto.', 'ui.pack.failed': 'Falha: {error}',
  'ui.pack.installingShort': 'Instalando…', 'ui.pack.waiting': 'Aguardando…',
  'voice.heard': 'Eu ouvi: {word}.',

  ...kv('p', `title=Área dos pais; back=Voltar ao jogo; noName=Sem nome; addChild=+ Adicionar uma criança; newChild=Nova criança;
    newChildHelp=Ao sair da área dos pais, a nova criança vai tocar no ovo para o seu próprio dino nascer.;
    cancel=Cancelar; edit=✏️ Editar ficha; sheetOf=Ficha de {name}; sheet=Ficha da criança; sheetHelp=Nome, idade e ajustes.;
    removeChild=Excluir {name}; thisChild=esta criança;
    removeConfirm=Excluir {name}, o dino e todo o progresso? Isso não pode ser desfeito.;
    egg=ovo ainda não chocado; dino=dino; alternateAria=Revezar entre as crianças; age={n} anos; otherCountry=outro país;
    series=rodadas jogadas; answers=respostas; firstTry=de primeira; today=jogado hoje;
    childrenHelp=Cada criança tem o seu dino, o seu progresso e os seus ajustes. Os ajustes abaixo são os da criança escolhida.;
    alternate=Revezar: depois de cada rodada, é a vez da próxima criança;
    difficulty=Dificuldade inicial dos jogos: {n} de 20 ({stage}). Depois ela se ajusta sozinha aos resultados.;
    stageCP=1º ano do fundamental; stageK=educação infantil; dinoLevel=Nível do dino;
    dinoLevelHelp=O dino cresce quando a criança dá comida para ele (nível 1 a {max}). Você pode mudar para ajustar a dificuldade: os níveis 21 a 40 correspondem ao 1º ano do fundamental.;
    noNight=Sem modo noite; week=Tempo de jogo nos últimos 7 dias; daily=Tempo de jogo por dia;
    dailyHelp=Quando o tempo acaba, a criança termina a rodada e o jogo fica bloqueado até o dia seguinte: o dino vai dormir. Com o seu código, você pode adicionar 15 ou 30 minutos, ou liberar o dia.;
    night=Hora de dormir (modo noite);
    nightHelp=A partir desse horário, o céu escurece e o dino boceja: ele propõe uma última rodada e depois dorme até de manhã. O seu código deixa a criança jogar um pouco mais naquela noite.;
    enable=Ativar {game}; levelOf=Nível de {game}; levelAuto=Nível automático; level=Nível {n}; fromAge=A partir de {n} anos;
    needsVoice=Jogo em voz alta: permita o microfone e baixe o reconhecimento de voz em {language} (seção “Vozes e downloads”).;
    nAnswers={n} respostas; notPlayed=Ainda não jogado; rate={rate} de primeira; mastered={n} / {total} perguntas dominadas;
    lastPlayed=jogado pela última vez em {date}; chooseAria=Botão para escolher um jogo; games=Jogos;
    choose=Botão “Escolher um jogo” na tela inicial;
    chooseHelp=Desativado, a criança joga com o planeta: cada rodada mistura todos os jogos da idade dela. Ativado, ela também pode escolher um jogo específico (e os jogos em voz alta, que não se misturam com os outros).;
    gamesHelp=Desative um jogo para que ele não apareça mais. O nível (1 a 20; 11 a 20 = 1º ano do fundamental) é onde começa a próxima rodada; “auto” calcula pela idade, pelo dino e pelos resultados.;
    reviewToday=para revisar hoje; reviewTomorrow=volta amanhã; reviewOn=volta em {date}; reviewN=revisão {n} de {total};
    review=Para revisar;
    reviewHelp=Uma pergunta errada volta no dia seguinte, depois 3 dias depois e depois uma semana depois. Certa as três vezes, está aprendida; errada, recomeça no dia seguinte.;
    reviewNone=Nada para revisar por enquanto. Parabéns!; sfxAria=Efeitos sonoros; musicAria=Música de fundo; testVoice=Testar a voz;
    testHello=Olá! Eu sou o Dino.; sound=Som e voz; sfx=Efeitos sonoros (acertos, erros, nham…);
    music=Música de fundo suave (a criança também pode desligar na tela inicial);
    phoneVoices=Voz principal: {main} · Voz da segunda língua: {second}. Essas vozes são do celular: para uma voz mais natural, instale uma voz “aprimorada” ou “premium” nas configurações de acessibilidade (conversão de texto em voz).;
    noVoice=nenhuma encontrada; mic=Microfone (jogos em voz alta);
    micHelp=Nos jogos em voz alta, a criança responde falando: diz o nome das imagens, fala palavras na segunda língua e resolve contas. Tudo fica neste aparelho: a voz nunca é gravada nem enviada. O microfone só liga quando a criança toca no botão grande do microfone. Essas perguntas se misturam com as outras quando a criança toca no planeta.;
    noMic=Este navegador não permite usar o microfone no jogo.; allowMic=Permitir o microfone;
    allowMicNow=Permita o microfone na janela do navegador…;
    micBlocked=O microfone está bloqueado. Permita nas configurações do navegador (cadeado ao lado do endereço) e tente de novo.;
    packsWhere=Os pacotes de reconhecimento de voz são baixados na seção “Vozes e downloads”.;
    removePacks=Excluir os pacotes;
    removePacksConfirm=Excluir deste aparelho os pacotes de reconhecimento de voz? Os jogos em voz alta não serão mais oferecidos.;
    packs=Vozes e downloads;
    packsHelp=O idioma do jogo, a voz natural do dino (criada no aparelho, sem Internet depois de baixada), a voz dos jogos em outra língua e o reconhecimento de voz. Os downloads acontecem em paralelo e continuam mesmo se você fechar esta área. Sem a voz do dino, o jogo usa a voz do celular.;
    changeCode=Mudar o código; newCode=Novo código dos pais; newCodeHelp=Escolha um novo código de 4 dígitos.;
    codeChanged=O código dos pais foi alterado.; code=Código dos pais;
    codeHelp=O código abre esta área e desbloqueia o jogo quando o tempo do dia acaba. Se esquecer, “Esqueceu o código?” permite criar outro depois de uma pergunta para adultos.;
    reset=Recomeçar do zero; resetConfirm=Apagar todo o progresso (nível do dino, respostas, frutas)? Os ajustes são mantidos.;
    privacy=Política de privacidade; close=Fechar; data=Dados;
    dataHelp=Tudo fica salvo apenas neste aparelho. Nenhum dado é enviado.`),

  ...kv('pin', `erase=Apagar; remember=Guarde bem.; forgot=Esqueceu o código?;
    adultQuestion=Pergunta para um adulto: quanto é {a} × {b}? (3 dígitos); cancel=Cancelar; wrongAnswer=Não está certo.;
    newCode=Novo código dos pais; newCodeHelp=Escolha um novo código de 4 dígitos.; wrongCode=Código errado.;
    otherCountry=Outro país; firstName=Nome;
    micHtml=<b>Permitir o microfone</b> (jogos em voz alta)<br><small>Tudo fica neste aparelho: a voz nunca é gravada nem enviada.</small>;
    missionsHtml=<b>Escolher as missões</b><br><small>A criança pode escolher os jogos (botão “Missões”). Desmarcado: só rodadas aleatórias com “Jogar”.</small>;
    ok=OK; nameMissing=Escreva o nome da criança.; age=Idade; years={n} anos; country=País; daily=Tempo de jogo por dia;
    night=Hora de dormir (modo noite); none=Nenhum; welcome=Bem-vindo!;
    welcomeHeard=Foi isto que a criança disse ao dino: corrija se precisar. Você pode adicionar outras crianças e mudar tudo na área dos pais (cadeado na tela inicial).;
    welcomeHelp=O nome, a idade e os ajustes da criança. Você pode adicionar outras crianças e mudar tudo na área dos pais (cadeado na tela inicial).;
    yourCode=Seu código dos pais;
    yourCodeHelp=Escolha um código de 4 dígitos. Ele abre a área dos pais (cadeado na tela inicial) e desbloqueia o jogo quando o tempo do dia acaba. Não conte para a criança!;
    asleep=O dino está dormindo; asleepHelp=É hora de dormir. Digite o código dos pais para jogar mais um pouco hoje à noite.;
    timeUp=O tempo de jogo acabou; timeUpHelp=Digite o código dos pais para adicionar tempo hoje.;
    addTime=Adicionar tempo; todayOnly=Só por hoje.; plus15=Mais 15 minutos; plus30=Mais 30 minutos; unlimited=Sem limite hoje`),

  ...kv('inst', `title=Instale o DinoLearn no celular; later=Mais tarde; okay=OK; never=Não perguntar de novo;
    android=Ele vai abrir em tela cheia, na horizontal, como um aplicativo de verdade. Não precisa baixar mais nada.;
    menu=No menu do navegador:;
    androidSteps=<li>Toque em <b>⋮</b> (os três pontinhos, no canto superior direito).</li><li>Escolha <b>“Instalar app”</b> ou <b>“Adicionar à tela inicial”</b>.</li><li>Abra o jogo pelo ícone do dino.</li>;
    ios=Ele vai abrir em tela cheia, sem as barras do Safari, como um aplicativo de verdade.;
    iosSteps=<li>Toque em {share} <b>Compartilhar</b> (embaixo ou em cima no Safari).</li><li>Escolha <b>“Adicionar à Tela de Início”</b> e depois <b>Adicionar</b>.</li><li>Abra o jogo pelo ícone do dino.</li>`),

  ...kv('title', `EN-1=Inglês — Ouça e toque; EN-2=Inglês — Os números; EN-3=Inglês — Memória; MO-1=O mundo — Me mostre;
    MO-3=O mundo — As sombras; MO-4=O mundo — O que combina; MO-5=O mundo — O maior; LO-1=Lógica — O intruso;
    LO-2=Lógica — Quantos são?; LO-3=Lógica — O que vem depois; LO-4=Lógica — Mais e menos; LO-5=Lógica — As contas;
    LO-6=Lógica — Os números; LO-7=Lógica — Formas e cores; LO-8=Lógica — As horas; LO-9=Lógica — O dinheiro;
    LO-10=Lógica — Memória; LO-11=Lógica — Ouça e conte; TR-1=Escrita — Traçar formas;
    TR-2=Escrita — Traçar letras e números; VO-1=Em voz alta — Como se chama?; VO-2=Em voz alta — Fale em inglês!;
    VO-13=Em voz alta — As contas`),

  ...kv('item', `top-hat=a cartola; billed-cap=o boné; crown=a coroa; womans-hat=o chapéu de palha;
    graduation-cap=o capelo de formatura; rescue-workers-helmet=o capacete de bombeiro; headphone=os fones de ouvido; hibiscus=a flor;
    glasses=os óculos; sunglasses=os óculos de sol; goggles=os óculos de mergulho; ribbon=a gravata-borboleta; swim-ring=a boia;
    sports-medal=a medalha; prayer-beads=o colar; cape-red=a capa de super-herói; cape-blue=a capa de mago; wing=as asas;
    balloon=o balão; magic-wand=a varinha mágica; lollipop=o pirulito; sunflower=o girassol; teddy-bear=o ursinho de pelúcia`),
  ...kv('dinocolor', '0=verde; 1=azul; 2=roxo; 3=rosa; 4=laranja; 5=amarelo; 6=turquesa; 7=vermelho; 8=marrom'),

  ...kv('cat', `farm=um animal da fazenda; sea=um animal do mar; bird=um pássaro; bug=um bichinho; wild=um animal selvagem;
    forest=um animal da floresta; fruit=uma fruta; veg=um legume; meal=algo para comer; vehicle=um veículo; toy=um brinquedo;
    home=algo da casa; clothes=algo para vestir; tool=uma ferramenta; kitchen=um objeto do dia a dia;
    music=um instrumento musical; sky=algo do céu; plant=uma planta; body=uma parte do corpo; landscape=um lugar;
    color=uma cor; element=algo da natureza`),
  ...kv('fam', `farm=animais da fazenda; sea=animais do mar; bird=pássaros; bug=bichinhos; wild=animais selvagens;
    forest=animais da floresta; fruit=frutas; veg=legumes; meal=comidas e doces; vehicle=veículos; toy=brinquedos;
    home=coisas da casa; clothes=roupas; tool=ferramentas; kitchen=coisas do banheiro e da cozinha; music=instrumentos musicais;
    sky=coisas do céu e do tempo; plant=plantas; body=partes do corpo; landscape=lugares; color=cores; element=coisas da natureza`),
  ...kv('fruit', `red-apple=maçã; banana=banana; strawberry=morango; cherries=cerejas; grapes=uvas; tangerine=laranja;
    pear=pera; lemon=limão; watermelon=melancia; peach=pêssego; pineapple=abacaxi; kiwi-fruit=kiwi; mango=manga;
    blueberries=mirtilos; melon=melão; green-apple=maçã verde; coconut=coco`),
  ...kv('many', `food-red-apple=maçãs; food-banana=bananas; food-strawberry=morangos; food-pear=peras; food-lemon=limões;
    food-tangerine=laranjas; food-kiwi-fruit=kiwis; food-peach=pêssegos`),

  'g.hintFamily': 'Dica: é {family}.',
  'g.word': '{word}!',
  'g.yesWord': ['Sim, {word}!', 'Isso, {word}!'],
  'g.yesItIs': 'Sim, é {word}!',
  'g.hint': 'Dica: {hint}.',
  'g.hintTens': 'Dica: olhe primeiro o primeiro algarismo, as dezenas.',
  'g.plus': '{a} mais {b}', 'g.minus': '{a} menos {b}',
  'g.calcPrompt': ['Quanto é {calc}?', '{calc}, quanto dá?'],
  'g.calcYes': 'Sim! {calc} dá {n}!',
  'g.hintAdd': 'Dica: comece no {a} e conte mais {b} nos dedos.',
  'g.hintSub': 'Dica: comece no {a} e conte {b} para trás nos dedos.',
  'MO-1.prompt': ['Me mostre {word}!', 'Onde está {word}?', 'Você acha {word}?', 'Procure {word}!'],
  'LO-1.prompt': ['Encontre o intruso! Qual não é da mesma família?', 'Qual imagem não é da mesma família?'],
  'LO-1.yes': 'Sim, {word}! Os outros são {family}.',
  'LO-1.hint': 'Dica: {n} imagens são {family}. Procure a que não é.',
  'LO-2.prompt': ['Tem {things}. Quantas frutas são? Conte direitinho!', 'Conte as frutas: {things}. Quantas são?'],
  'LO-2.promptMixed': 'Atenção! Conte só estas frutas: {things}. Quantas são?',
  'LO-2.yes': '{list}. São {n}!',
  'LO-2.hint': 'Dica: toque em cada fruta com o dedo, contando devagar.',
  'LO-2.hintBig': 'Dica: conte primeiro até dez e depois continue: onze, doze, treze…',
  'MO-3.prompt': ['De quem é esta sombra? Toque na imagem certa!', 'Quem está escondido atrás desta sombra?'],
  'LO-3.prompt': ['Olhe bem a sequência. Qual fruta vem depois?', 'Qual fruta continua a sequência?'],
  'LO-3.yes': 'Sim! {list}!',
  'LO-3.hint': 'Dica: a sequência sempre recomeça igual. {list}…',
  'LO-3.numPrompt': 'Olhe e ouça: {list}. Qual número vem depois?',
  'LO-3.numYes': 'Sim! {list}, {n}!',
  'LO-3.hintGrow': 'Dica: somamos um, depois dois, depois três… e depois?',
  'LO-3.hintPlus': 'Dica: somamos {n} cada vez.',
  'LO-3.hintMinus': 'Dica: tiramos {n} cada vez.',
  'LO-4.num.most': 'Toque no maior número!', 'LO-4.num.least': 'Toque no menor número!',
  'LO-4.numYes.most': 'Sim! {n} é o maior!', 'LO-4.numYes.least': 'Sim! {n} é o menor!',
  'LO-4.numHint.most': 'Dica: quando contamos, o maior vem por último.',
  'LO-4.numHint.least': 'Dica: quando contamos, o menor vem primeiro.',
  'LO-4.pile.most': 'Onde tem mais {things}? Toque na carta certa!',
  'LO-4.pile.least': 'Onde tem menos {things}? Toque na carta certa!',
  'LO-4.pileYes.most': 'Sim! Aqui tem {n}. É onde tem mais!',
  'LO-4.pileYes.least': 'Sim! Aqui tem {n}. É onde tem menos!',
  'LO-4.pileHint.least': 'Dica: procure a carta com pouquinhas frutas.',
  'LO-4.pileHint.most': 'Dica: procure a carta mais cheia.',
  'LO-5.compl': '{a} mais quanto dá {b}?',
  'LO-5.complYes': 'Sim! {a} mais {x} dá {b}!',
  'LO-5.complHint': 'Dica: conte nos dedos, do {a} até o {b}.',
  'LO-5.add': 'Olha, {a} {things}. Coloco mais {b}. Quantas frutas tem no total?',
  'LO-5.eat': 'Olha, {a} {things}. O Dino come {b}. Quantas frutas sobram?',
  'LO-5.addHint': 'Dica: conte todas as frutas, à esquerda e à direita.',
  'LO-5.eatHint': 'Dica: conte só as frutas que não estão riscadas.',
  'LO-11.prompt': ['Ouça bem: {calc}. Quanto dá?', 'Quanto é {calc}?', 'De cabeça: {calc}. Toque na resposta!'],
  'VO-13.prompt': ['Quanto é {calc}? Me diga!', '{calc}, quanto dá? Me diga!'],
  'VO-13.repeat': 'Ouça: {calc} dá {n}. Agora fale você!',
  'VO-13.fallback': '{calc}, quanto dá? Toque no número certo!',
  'MO-4.prompt': ['Olha: {word}. O que combina com isso?', 'Encontre o que combina com {word}!'],
  'MO-4.yes': 'Sim, {a} combina com {b}!',
  'MO-4.hint': 'Dica: imagine {word}. O que a gente vê muitas vezes junto?',
  'MO-5.prompt.big': ['Na vida real, qual é o maior?', 'Toque no maior, na vida real!'],
  'MO-5.prompt.small': ['Na vida real, qual é o menor?', 'Toque no menor, na vida real!'],
  'MO-5.yes.big': 'Sim! Na vida real, {word} é o maior!',
  'MO-5.yes.small': 'Sim! Na vida real, {word} é o menor!',
  'MO-5.hint': 'Dica: nas imagens todos têm o mesmo tamanho. Imagine de verdade, do seu lado!',
  'LO-6.prompt': ['Toque no número {n}!', 'Onde está o número {n}?', 'Encontre o {n}!'],
  'LO-6.yes': 'Sim! É o {n}!',
  'LO-6.hint': 'Dica: conte nos dedos até {n} e procure esse número.',
  'LO-6.hintBig': 'Dica: olhe bem o primeiro algarismo e depois o segundo.',
  'EN-2.hint': 'Dica: conte em inglês nos dedos e pare quando ouvir o número certo.',
  'LO-7.shape': 'Mostre {shape}!',
  'LO-7.color': 'Mostre a forma de cor {color}!',
  'LO-7.both': 'Mostre {shape} de cor {color}!',
  'LO-7.yes.shape': 'Sim, {shape}!',
  'LO-7.yes.color': 'Sim! A de cor {color}!',
  'LO-7.yes.both': 'Sim, {shape} de cor {color}!',
  'LO-7.hint.color': 'Dica: olhe só a cor, a forma não importa.',
  'LO-7.hint.both': 'Dica: procure primeiro a cor certa e depois olhe bem a forma.',
  ...kv('shape', 'circle=o círculo; square=o quadrado; triangle=o triângulo; star=a estrela; heart=o coração; rectangle=o retângulo; diamond=o losango; oval=o oval; hexagon=o hexágono; cross=a cruz'),
  ...kv('clue', `circle=o círculo é redondo, não tem cantos; square=o quadrado tem quatro lados iguais;
    triangle=o triângulo tem três lados e três pontas; star=a estrela tem cinco pontas;
    heart=o coração tem duas curvas em cima e uma ponta embaixo; rectangle=o retângulo tem quatro lados, dois compridos e dois curtos;
    diamond=o losango é como um quadrado em pé numa ponta; oval=o oval é um círculo esticado;
    hexagon=o hexágono tem seis lados; cross=a cruz tem quatro braços`),
  ...kv('color', 'red=vermelha; blue=azul; green=verde; yellow=amarela; orange=laranja; purple=roxa; pink=rosa'),
  'time.0': '{h} em ponto', 'time.30': '{h} e meia', 'time.15': '{h} e quinze', 'time.45': 'quinze para as {next}',
  'time.m': '{h} e {m}', 'time.24': '{h}:{mm}',
  'LO-8.prompt': ['Toque no relógio que marca {time}!', 'Onde são {time}?'],
  'LO-8.yes': 'Sim! São {time}!',
  'LO-8.hint': 'Dica: o ponteiro pequeno mostra a hora, o grande mostra os minutos.',
  'LO-8.hintHard': 'Dica: olhe primeiro o ponteiro pequeno para a hora e depois o grande para os minutos.',
  'money.e1': 'um euro', 'money.e': '{e} euros', 'money.c1': 'um centavo', 'money.c': '{c} centavos', 'money.ec': '{e} euros e {c}',
  'LO-9.prompt': ['Toque na carta com {money}!', 'Onde tem exatamente {money}?'],
  'LO-9.yes': 'Sim! Dá {money}!',
  'LO-9.hint': 'Dica: conte primeiro as notas e as moedas grandes, depois some as pequenas.',
  'TR.dots': ['Passe o dedo na linha pontilhada!', 'Com o dedo, siga os pontinhos!'],
  'TR.faint': 'Desenhe seguindo os pontinhos.',
  'TR.free': ['Agora desenhe sozinho, como o modelo!', 'Sua vez: desenhe sem os pontinhos!'],
  'TR.yes': ['Parabéns! Que lindo!', 'Muito bem!', 'Que desenho bonito!'],
  'TR.hint': 'Olha, eu te mostro! Comece no ponto verde número um.',
  'LO-10.prompt': ['Vire duas cartas. Se forem iguais, você ganha o par!', 'Encontre todos os pares!'],
  'LO-10.promptForeign': ['Vire duas cartas e encontre os pares! Ouça… em inglês!', 'Encontre os pares e ouça as palavras em inglês!'],
  'LO-10.yes': ['Parabéns, você encontrou todos os pares!', 'Que memória! Todos os pares!'],
  'LO-10.hint': 'Lembre onde estão as imagens que você já viu!',
  'VO-1.prompt': ['Como se chama isto?', 'O que é isto?', 'Me diga o que é!'],
  'VO-1.repeat': 'Ouça bem: {word}. Agora fale você!',
  'VO-2.prompt': ['Como se diz {word} em inglês?', 'Em inglês, como se diz {word}?', 'Fale {word} em inglês!'],
  'VO-2.yes': ['Parabéns, falou muito bem!', 'Muito bem, você fala inglês!', 'Perfeito!'],
  'VO-2.repeat': 'Ouça bem e repita comigo:',
  'VO-2.fallback': 'Toque na imagem da palavra em inglês:',
  'VO-2.hint': 'Dica: pense nas palavras em inglês que você já conhece!',
  'l.handover': ['Parabéns {current}! Agora é a vez de {next}!', 'Obrigado {current}! {next}, sua vez de jogar!'],
  'l.gift': ['Eu cresci! Escolha um presente para mim!', 'Um presente! Qual você vai me dar?'],
  'l.giftThanks': 'Oh, {item}! Obrigado!',

  ...kv('num', `0=zero; 1=um|uma; 2=dois|duas; 3=três; 4=quatro; 5=cinco; 6=seis; 7=sete; 8=oito; 9=nove; 10=dez; 11=onze;
    12=doze; 13=treze; 14=catorze|quatorze; 15=quinze; 16=dezesseis; 17=dezessete; 18=dezoito; 19=dezenove; 20=vinte`),

  'l.hello': ['Oi {name}! Sou eu, o seu dino!', 'Oi {name}! Vamos nos divertir muito juntos!'],
  'l.welcome_back': ['Você voltou, {name}! Oba!', 'Oi {name}! Eu estava com saudade!', 'Ah, aí está você! Vamos brincar?',
    'Oba, meu amigo chegou!'],
  'l.home.play': ['Toque no botão verde: vamos dar a volta ao mundo dos jogos!', 'Vamos brincar? Toque no botão verde!'],
  'l.home.categories': ['E para escolher o seu jogo, toque no botãozinho.'],
  'l.random.go': ['Vamos lá!', 'Decolar! Volta ao mundo!', 'Vem, vamos brincar!', 'Preparar… já!'],
  'l.home.choose': ['Escolha um jogo! Toque numa bolha grande.'],
  'l.home.EN-1': ['A bandeira: palavras em inglês!'],
  'l.home.MO-1': ['Me mostre as coisas do mundo!'],
  'l.home.LO-1': ['O quebra-cabeça: encontre o intruso!'],
  'l.home.LO-2': ['O ábaco: vamos contar!'],
  'l.home.MO-3': ['A sombra: de quem é?'],
  'l.home.LO-3': ['As setas: o que vem depois?'],
  'l.home.LO-4': ['A balança: onde tem mais?'],
  'l.home.LO-5': ['Os números: vamos fazer contas!'],
  'l.home.LO-11': ['A orelha: contas de cabeça!'],
  'l.home.VO-13': ['O microfone: me diga o resultado da conta!'],
  'l.home.EN-2': ['O dez: os números em inglês!'],
  'l.home.MO-4': ['O aperto de mão: o que combina?'],
  'l.home.MO-5': ['A régua: o que é maior de verdade?'],
  'l.home.LO-6': ['Os números: encontre o número certo!'],
  'l.home.LO-10': ['As cartas: jogo da memória!'],
  'l.home.EN-3': ['O curinga: memória em inglês!'],
  'l.home.LO-7': ['A paleta: formas e cores!'],
  'l.home.LO-8': ['O despertador: que horas são?'],
  'l.home.LO-9': ['A nota: vamos contar dinheiro!'],
  'l.home.TR-1': ['O lápis: vamos traçar formas!'],
  'l.home.TR-2': ['A mão que escreve: vamos traçar letras e números!'],
  'l.intro.MIX': ['Ouça bem cada pergunta!', 'Abra bem os ouvidos!', 'Está pronto? Eu estou!'],
  'l.short.EN-1': ['Em inglês!'],
  'l.short.MO-1': ['Me mostre!'],
  'l.short.MO-3': ['Uma sombra!'],
  'l.short.LO-1': ['O intruso!'],
  'l.short.LO-2': ['Vamos contar!'],
  'l.short.LO-3': ['O que vem depois!'],
  'l.short.LO-4': ['Mais ou menos!'],
  'l.short.LO-5': ['Uma conta!'],
  'l.short.LO-11': ['Uma conta de cabeça!'],
  'l.short.VO-13': ['Me diga o resultado!'],
  'l.short.EN-2': ['Um número em inglês!'],
  'l.short.MO-4': ['O que combina?'],
  'l.short.MO-5': ['O maior ou o menor!'],
  'l.short.LO-6': ['Encontre o número!'],
  'l.short.LO-10': ['Memória!'],
  'l.short.EN-3': ['Memória em inglês!'],
  'l.short.LO-7': ['Formas e cores!'],
  'l.short.LO-8': ['Que horas são?'],
  'l.short.LO-9': ['O dinheiro!'],
  'l.short.TR-1': ['Vamos traçar!'],
  'l.short.TR-2': ['Vamos escrever!'],
  'l.home.level': ['A estrela é o meu nível!'],
  'l.intro.EN-1': ['Eu falo uma palavra em inglês. Toque na imagem certa!'],
  'l.intro.MO-1': ['Ouça bem e toque no que eu pedir.', 'Vamos dar a volta ao mundo! Encontre o que eu pedir.'],
  'l.intro.LO-1': ['Olhe bem as imagens. Só uma não é da mesma família: encontre o intruso!'],
  'l.intro.LO-2': ['Vamos contar! Conte as frutas e toque no número certo.'],
  'l.intro.MO-3': ['Olhe bem esta sombra preta. Descubra de quem ela é!'],
  'l.intro.LO-3': ['Olhe bem a sequência e encontre o que vem depois.'],
  'l.intro.LO-4': ['Olhe bem as cartas. Encontre a que eu pedir!'],
  'l.intro.LO-11': ['Contas sem imagens! Ouça bem, calcule de cabeça e toque no número certo.'],
  'l.intro.VO-13': ['Eu falo uma conta e você me diz o resultado. Toque no microfone para responder!'],
  'l.intro.LO-5': ['Vamos fazer contas! Ouça bem e toque no número certo.', 'Hora das contas! Você pode contar nos dedos.'],
  'l.intro.EN-2': ['Eu falo um número em inglês. Toque no número certo!'],
  'l.intro.MO-4': ['Algumas coisas combinam, como a chave e o cadeado. Encontre o que combina!'],
  'l.intro.MO-5': ['Nas imagens, tudo tem o mesmo tamanho. Mas e na vida real? Encontre o que eu pedir!'],
  'l.intro.LO-6': ['Eu falo um número. Encontre ele entre as cartas!'],
  'l.intro.LO-10': ['Vamos jogar o jogo da memória! Vire duas cartas: se as imagens forem iguais, você ganha o par!'],
  'l.intro.EN-3': ['Memória em inglês! Quando você vira uma carta, eu falo a palavra em inglês. Encontre os pares!'],
  'l.intro.LO-7': ['Vamos brincar com formas e cores! Ouça bem e toque na forma certa.'],
  'l.intro.LO-8': ['Olhe bem os relógios! O ponteiro pequeno mostra a hora, o grande os minutos.'],
  'l.intro.LO-9': ['Vamos brincar de loja! Conte as moedas e encontre o valor certo.'],
  'l.intro.TR-1': ['Vamos desenhar com o dedo! Comece no ponto verde e siga a linha pontilhada.'],
  'l.intro.TR-2': ['Vamos aprender a escrever! Comece no ponto verde número um e siga a linha pontilhada.'],
  'l.trace.start': ['Coloque o dedo no ponto verde e siga os pontinhos.', 'Vai, desenhe com o dedo!'],
  'l.trace.continue': ['Continue, está quase!', 'Ainda falta um pedaço. Continue!'],
  'l.trace.retry': ['Quase! Vamos apagar e começar de novo?', 'Opa, não foi bem assim. Tente de novo!'],
  'l.tutorial': ['Olha, eu te mostro! A gente toca na imagem certa, assim.'],
  'l.tutorial_your_turn': ['Agora é a sua vez!'],
  'l.correct': ['Parabéns {name}!', 'Muito bem, {name}!', 'Isso mesmo!', 'Ótimo!', 'Demais!', 'Siiim!', 'Fantástico!', 'Campeão!',
    'Você é uma estrela!', 'É isso!', 'Perfeito!', 'Uau!'],
  'l.wrong': ['Opa! Tente de novo!', 'Hmm, olhe bem…', 'Esse não! Continue procurando!', 'Quase! Mais uma vez!', 'Tudo bem, tente de novo!'],
  'l.hint': ['Eu te ajudo: toque no que está brilhando!', 'Olha, é este que eu mostro!'],
  'l.streak': ['Três seguidas! Você está arrasando!', 'Três seguidas! Incrível!'],
  'l.idle': ['Você está aí? Toque numa carta!', 'Estou esperando! Toque numa carta.'],
  'l.touch_me': ['Para ouvir de novo, toque em mim!'],
  'l.review_due': ['Já vimos esta juntos. Você lembra?', 'Uma pergunta de revisão! Tenho certeza que você sabe.'],
  'l.review': ['Você já sabe tudo! Vamos revisar?'],
  'l.series_perfect': ['Uau, tudo certo! Você é uma estrela, {name}!', 'Nenhum erro! Estou dançando de alegria!'],
  'l.series_great': ['Incrível! Quase tudo certo!', 'Que talento, {name}!'],
  'l.series_good': ['Muito bem jogado! Você aprende rápido!', 'Parabéns, você acertou muitas!'],
  'l.series_ok': ['Bem jogado! Vamos continuar treinando?', 'Bom! Cada rodada ajuda você a melhorar.'],
  'l.series_encourage': ['Foi difícil, né? Eu também estou aprendendo!', 'Tudo bem! A gente aprende brincando.',
    'Até os dinossauros grandes erram! Vamos de novo?'],
  'l.end.feed': ['Olha esta cesta de frutas! Toque na cesta para me dar.', 'Nham! Me dá a cesta: toque nela!'],
  'l.end.nothing': ['Desta vez não tem frutas. Vamos jogar de novo para ganhar algumas?'],
  'l.end.again': ['Toque no botão verde para jogar de novo!'],
  'l.fly.visit': ['Olha, uma mosca!', 'Eu adoro moscas!'],
  'l.home.ambient': ['Acho que o vulcão ainda está em erupção.', 'Estou com um pouquinho de fome.', 'Eu queria que você me ajudasse a crescer.',
    'Olha as nuvens passando!'],
  'l.fly.caught': ['Slurp! Uma mosca!', 'Nham, crocante!', 'Peguei!'],
  'l.fruit.won': ['Uma fruta para mim!', 'Nham, uma fruta!'],
  'l.eating': ['Nham nham!', 'Crec! Delícia!', 'Hmm, que gostoso!', 'Mais, por favor!', 'Obrigado!'],
  'l.full': ['Minha barriga está cheia! Vou guardar o resto para depois.'],
  'l.level_up': ['Oh! Estou crescendo! Obrigado por cuidar tão bem de mim!', 'Olha, estou maior!'],
  'l.tickle': ['Hi hi, faz cócegas!', 'Ha ha ha! Para!', 'Ai não, cócegas não!'],
  'l.start': ['Toque em mim para me acordar!'],
  'l.parent_code': ['Antes de brincar, chame a mamãe ou o papai! Eles precisam escolher um código secreto para mim.'],
  'l.parent_code_done': ['Obrigado! Agora podemos brincar juntos!'],
  'l.wardrobe.intro': ['Arraste uma peça até mim para eu vestir!', 'Me vista! Pegue uma peça com o dedo e coloque em mim.'],
  'l.wardrobe.drag': ['Deixe o dedo na peça e arraste até mim!'],
  'l.wardrobe.off': ['Tá bom, vou tirar!', 'Tirei!'],
  'l.wardrobe.empty': ['Meu guarda-roupa está vazio! Quando eu crescer, você ganha uma peça para mim.'],
  'l.home.wardrobe': ['O chapéu é para me vestir!'],
  'l.gift.waiting': ['Eu cresci! Toque no presente para escolher uma peça para mim.'],
  'l.gift.go': ['Eu cresci! Venha ao meu guarda-roupa: tem um presente esperando você!'],
  'l.wardrobe.new': ['Arraste até mim para eu vestir!'],
  'l.wardrobe.take_off': ['Para tirar uma peça, arraste para longe de mim.'],
  'l.night.last': ['Ih, está ficando tarde… Uma última rodada e depois cama?', 'Aaah… estou com sono. Vem, uma ultimazinha!'],
  'l.night.goodnight': ['Foi a última rodada! Obrigado por este dia lindo. Boa noite!'],
  'l.night.sleep': ['Psiu… estou dormindo. Zzz… Até amanhã!'],
  'l.bedtime': ['Brincamos muito hoje! Agora vou dormir. Vamos brincar amanhã?'],
  'l.streak5': ['Cinco seguidas! Você é um gênio!', 'Cinco! Você é mais forte que um T-rex!'],
  'l.correct_after_try': ['Você achou! Viu, era só procurar!', 'Isso! Você não desistiu, parabéns!'],
  'l.halfway': ['Já estamos na metade! Continue assim!', 'Metade! Só mais algumas perguntas!'],
  'l.last_question': ['Última pergunta!', 'Vamos, a última!'],
  'l.home.voice': ['O microfone: jogos em que você responde com a voz!'],
  'l.home.voice_choose': ['Aqui você responde falando! Escolha um jogo.'],
  'l.intro.VO-1': ['Eu mostro uma imagem. Toque no microfone e me diga como ela se chama.'],
  'l.intro.VO-2': ['Vamos falar inglês! Toque no microfone e fale a palavra em inglês.'],
  'l.home.VO-1': ['A cabeça que fala: me diga o nome das imagens!'],
  'l.home.VO-2': ['A bandeira: fale as palavras em inglês!'],
  'l.short.VO-1': ['Como se chama?'],
  'l.short.VO-2': ['Em inglês!'],
  'l.voice.tap_mic': ['Toque no microfone e me responda.', 'Sua vez! Toque no microfone e fale alto.'],
  'l.voice.listening': ['Estou ouvindo!', 'Meus ouvidos estão bem abertos!'],
  'l.voice.unheard': ['Não ouvi direito. Toque no microfone e fale alto.', 'Oh, não ouvi nada! Chegue mais perto e fale mais alto.'],
  'l.voice.wrong': ['Não é isso! Tente de novo!', 'Quase! Mais uma vez!'],
  'l.voice.cards': ['Meus ouvidos estão cansados! Toque na resposta certa com o dedo.'],
  'l.voice.give_up': ['O microfone não está me ouvindo bem. A partir de agora, vamos jogar com o dedo!'],
  'l.voice.loading': ['Espere, estou limpando os ouvidos…'],
  'l.voice.no_mic': ['Oh, não consigo te ouvir. Vamos jogar com o dedo!'],
  'l.egg.1': ['Toc toc! Tem alguém aí?', 'Oh! Tem alguma coisa se mexendo aí dentro!'],
  'l.egg.2': ['De novo! Me ajude a sair!', 'Continue, a casca está quebrando!'],
  'l.egg.3': ['Quase! Mais uma batidinha!'],
  'l.egg.hatched': ['Oi!', 'Ufa! Cheguei!'],
  'l.hello.1': ['Oi! Eu sou o seu dino, um bebê dinossauro {color}. Você me ajuda a crescer?'],
  'l.hello.4': ['Vamos jogar muitos jogos juntos: os animais, as formas, as letras, os números e até outra língua!'],
  'l.hello.5': ['Cada vez que acertas à primeira, ganhas uma fruta. Olha, elas caem no meu cesto!'],
  'l.hello.6': ['Depois dás-mas a comer. Nham! Quanto mais como, mais cresço!'],
  'l.hello.7': ['E quando cresço, ganhas presentes: roupas para me mascarar, estrelas e surpresas!'],
  'l.hello.2': ['Acabei de nascer… Ainda não sei nada do mundo! Contigo vou aprender tudo.'], 'l.hello.9': ['Em «Meu dino» podes vestir-me como quiseres: chapéus, óculos, capas… Vou ser o dino mais bonito!'], 'l.hello.10': ['E se te enganares, não faz mal nenhum: dou-te uma ajuda e tentamos outra vez juntos!'], 'l.hello.8': ['Vamos lá!'],
  'l.hello.name': ['Mas primeiro me diga: qual é o seu nome? Toque no microfone e fale o seu nome bem alto!'],
  'l.hello.name_again': ['Não ouvi direito. Toque no microfone e repita o seu nome!'],
  'l.hello.name_ok': ['Prazer, {name}! Que nome bonito!'],
  'l.hello.name_later': ['Você me diz o seu nome depois: a mamãe ou o papai vão escrever para mim!'],
  'l.hello.age': ['E você, {name}, quantos anos tem? Toque no microfone e me diga!'],
  'l.hello.age_again': ['Não ouvi direito. Quantos anos você tem? Toque no microfone!'],
  'l.hello.age_later': ['Tudo bem: a mamãe ou o papai vão me dizer!'],
  'l.hello.sibling': ['Oi {name}! Eu sou o seu dino, um bebê dinossauro {color}. Vamos nos divertir muito juntos!'],
  'l.hello.mic_allow': ['Se aparecer uma mensagem na tela, peça para um adulto tocar em “Permitir”!'],
  'l.hello.parent': ['Agora entregue o celular para a mamãe ou o papai! Eles vão escolher um código secreto, só para mim.'],
  'l.welcome_first': ['Esta é a minha casa, {name}! Vamos nos divertir muito!'],
  'l.burp': ['Opa! Desculpa!', 'Hi hi… com licença!', 'Desculpa… estava tão gostoso!'],
  'l.fart': ['Opa… desculpa!', 'Hi hi, não fui eu!', 'Desculpa! Minha barriga faz barulhos engraçados!'],
  'l.hunger.growl': ['Está ouvindo? Minha barriga está roncando! Me dá a cesta!'],
  'l.hunger.look': ['Hmm… essa fruta parece deliciosa… Toque na cesta!'],
  'l.hunger.beg': ['Por favor, por favor! Me dá a cesta!', 'Vai, {name}, por favor! Estou com fome!'],
  'l.hunger.gape': ['Olha, abro bem a boca: aaah! Coloque a fruta!'],
  'l.hunger.sad': ['Estou com tanta fome… Toque na cesta!', 'Minha barriga está vazia… Você me dá comida?'],
  'l.child.turn': ['Sua vez, {name}! Vamos brincar juntos?', 'Oi {name}! Sua vez de jogar!'],
  'l.child.ask_name': ['Oi! Chame a mamãe ou o papai: eles precisam me dizer o seu nome!'],
  'l.age.ask': ['Quantos anos você tem? Toque no bolo com a sua idade!'],
  'l.age.3': ['Três anos! Demais!'], 'l.age.4': ['Quatro anos! Demais!'], 'l.age.5': ['Cinco anos! Ótimo!'],
  'l.age.6': ['Seis anos! Ótimo!'], 'l.age.7': ['Sete anos! Uau!'],

  ...kv('c', `dog=o cachorro; cat=o gato; fish=o peixe; bird=o pássaro; cow=a vaca; pig=o porco; horse=o cavalo; duck=o pato;
    rabbit=o coelho; hen=a galinha; sheep=a ovelha; frog=o sapo; mouse=o rato; dinosaur=o dinossauro; red=vermelho; blue=azul;
    green=verde; yellow=amarelo; orange_color=laranja; purple=roxo; pink=rosa; black=preto; white=branco; brown=marrom;
    apple=a maçã; banana=a banana; strawberry=o morango; cherry=a cereja; orange=a laranja; egg=o ovo;
    ice_cream=o sorvete; pizza=a pizza; grapes=as uvas; pear=a pera; lemon=o limão; carrot=a cenoura; bread=o pão;
    milk=o leite; cake=o bolo; watermelon=a melancia; cookie=o biscoito; cheese=o queijo; tomato=o tomate; pineapple=o abacaxi;
    peach=o pêssego; broccoli=o brócolis; corn=o milho; kiwi=o kiwi; mango=a manga; blueberries=os mirtilos; coconut=o coco;
    car=o carro; ball=a bola; bus=o ônibus; train=o trem; plane=o avião; boat=o barco; bike=a bicicleta; balloon=o balão;
    teddy=o ursinho de pelúcia; book=o livro; house=a casa; kite=a pipa; bed=a cama; chair=a cadeira; door=a porta;
    key=a chave; clock=o relógio; sun=o sol; moon=a lua; star=a estrela; flower=a flor; cloud=a nuvem; rainbow=o arco-íris;
    tree=a árvore; rain=a chuva; snowflake=o floco de neve; snowman=o boneco de neve; leaf=a folha; mountain=a montanha;
    fire=o fogo; sunflower=o girassol; drop=a gota de água; eye=o olho; ear=a orelha; nose=o nariz; mouth=a boca;
    hand=a mão; foot=o pé; tooth=o dente; lion=o leão; tiger=o tigre; elephant=o elefante; monkey=o macaco; bear=o urso;
    giraffe=a girafa; zebra=a zebra; panda=o panda; snake=a cobra; turtle=a tartaruga; crocodile=o crocodilo;
    kangaroo=o canguru; hippo=o hipopótamo; gorilla=o gorila; rhino=o rinoceronte; butterfly=a borboleta; bee=a abelha;
    ladybug=a joaninha; spider=a aranha; ant=a formiga; snail=o caracol; dolphin=o golfinho; whale=a baleia; octopus=o polvo;
    crab=o caranguejo; shark=o tubarão; owl=a coruja; penguin=o pinguim; parrot=o papagaio; flamingo=o flamingo; peacock=o pavão;
    eagle=a águia; swan=o cisne; hat=o chapéu; shoe=o sapato; dress=o vestido; cap=o boné; socks=as meias;
    gloves=as luvas; tshirt=a camiseta; glasses=os óculos; umbrella=o guarda-chuva; pencil=o lápis; spoon=a colher;
    scissors=a tesoura; hammer=o martelo; ladder=a escada; broom=a vassoura; bottle=a mamadeira; toothbrush=a escova de dentes;
    guitar=o violão; drum=o tambor; piano=o piano; violin=o violino; trumpet=o trompete; helicopter=o helicóptero;
    tractor=o trator; rocket=o foguete; ambulance=a ambulância; motorbike=a moto; fire_engine=o caminhão de bombeiros;
    police_car=o carro de polícia; scooter=o patinete; sled=o trenó; llama=a lhama; goat=a cabra; camel=o camelo;
    hedgehog=o ouriço; squirrel=o esquilo; bat=o morcego; deer=o veado; wolf=o lobo; fox=a raposa; raccoon=o guaxinim;
    beaver=o castor; otter=a lontra; sloth=o bicho-preguiça; skunk=o gambá; bison=o bisão; castle=o castelo; tent=a barraca;
    lighthouse=o farol; volcano=o vulcão; island=a ilha; anchor=a âncora; magnet=o ímã; compass=a bússola;
    microscope=o microscópio; telescope=o telescópio; hourglass=a ampulheta; jellyfish=a água-viva; seal=a foca;
    lobster=a lagosta; shrimp=o camarão; squid=a lula; oyster=a ostra; beetle=o besouro; cricket=o grilo;
    mosquito=o mosquito; worm=a minhoca; scorpion=o escorpião; rooster=o galo; turkey=o peru; donkey=o burro; ox=o boi;
    leopard=o leopardo; polar_bear=o urso-polar; koala=o coala; orangutan=o orangotango; mammoth=o mamute; moose=o alce;
    badger=o texugo; avocado=o abacate; eggplant=a berinjela; garlic=o alho; onion=a cebola; pepper=a pimenta;
    cucumber=o pepino; potato=a batata; mushroom=o cogumelo; peanuts=os amendoins; croissant=o croissant; pancakes=as panquecas;
    honey=o mel; spaghetti=o espaguete; fries=a batata frita; sandwich=o sanduíche; candle=a vela; mirror=o espelho;
    window=a janela; bucket=o balde; bell=o sino; lock=o cadeado; light_bulb=a lâmpada; flashlight=a lanterna;
    axe=o machado; saw=o serrote; wrench=a chave inglesa; screwdriver=a chave de fenda; paintbrush=o pincel; crayon=o giz de cera;
    trophy=o troféu; medal=a medalha; ring=o anel; skateboard=o skate; yoyo=o ioiô; roller_skate=o patins;
    canoe=a canoa; tram=o bonde; parachute=o paraquedas; satellite=o satélite; brain=o cérebro; bone=o osso;
    tongue=a língua; leg=a perna; tornado=o tornado; lightning=o raio; comet=o cometa; cactus=o cacto;
    blossom=a flor de cerejeira; feather=a pena`),

  // ---- Mon pays ----
  "lang.ko": "coreano", "lang.ne": "nepalês",
  "lang.vi": "vietnamita", "lang.tr": "turco", "lang.fa": "persa", "lang.pl": "polonês", "lang.uk": "ucraniano",
  "lang.id": "indonésio",
  "country.cd": "RD do Congo",
  "title.MO-6": "O mundo — Meu país",
  "l.home.MO-6": ["O mapa: perguntas sobre o seu país!"],
  "l.intro.MO-6": ["Vamos falar do seu país! Ouça bem e toque na imagem certa.", "Você conhece bem o seu país? Vou fazer perguntas!"],
  "l.short.MO-6": ["Uma pergunta sobre o seu país!"],
  "cty.flag": "Qual é a bandeira do país: {country}?",
  "cty.flagHard": "Cuidado, elas se parecem! Qual é a bandeira do país: {country}?",
  "cty.flagYes": "Sim! É a bandeira do país: {country}!",
  "cty.flagHint": "olhe bem as cores e a ordem delas",
  "cty.symbol": "Qual é um símbolo do país: {country}?",
  "cty.symbolYes": "Sim! É um símbolo do país: {country}!",
  "cty.symbolYesName": "Sim! {name} é um símbolo do país: {country}!",
  "cty.food": ["Qual é uma comida típica do país: {country}?", "O que se gosta de comer no país: {country}?"],
  "cty.foodYes": "Nham! É uma comida típica do país: {country}!",
  "cty.day": "Dia {date} é a festa nacional do país: {country}! O que olhamos no céu à noite?",
  "cty.dayYes": "Sim! Dia {date} tem uma grande queima de fogos!",
  "cty.currency": "Com que dinheiro se paga no país: {country}?",
  "cty.currencyYes": "Sim! Paga-se com: {money}!",
  "cty.place": "Que lugar famoso se vê no país: {country}?",
  "cty.sport": "Qual esporte o povo adora no país: {country}?",
  "cty.thing": "O que se vê muito nas festas do país: {country}?",
  "cty.landmarkYes": "Sim! Parabéns, você conhece bem o seu país!",
  "cty.capital": "Qual é a capital do país: {country}? Leia bem os nomes das cidades!",
  "cty.capitalYes": "Sim! A capital é {city}!",
  "cty.neighbour": "Qual destas bandeiras é de um país vizinho do país: {country}?",
  "cty.neighbourYes": "Sim! Este país fica bem ao lado!",
  "cty.neighbourHint": "os vizinhos ficam bem perto, no mesmo continente",
  // Espace parents : onglets.
  'p.dailyShort': 'Depois, o dino vai dormir.', 'p.credits': 'Créditos e licenças', 'p.creditsHelp': 'O DinoLearn é feito com estes programas, vozes, imagens, tipos de letra e sons. Obrigado aos seus autores!', 'p.credits.voices': 'Vozes do dino', 'p.credits.asr': 'Reconhecimento de voz', 'p.credits.code': 'Motor do jogo', 'p.credits.images': 'Imagens e tipos de letra', 'p.credits.sounds': 'Efeitos sonoros', 'p.tab.profile': 'Perfil', 'p.tab.progress': 'Progresso', 'p.tab.games': 'Jogos', 'p.tab.settings': 'Definições', 'p.summary': 'Em resumo', 'p.lower': 'Baixar', 'p.higher': 'Subir',
};

export default pt;
