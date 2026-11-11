import type { Catalog } from '../index';
import { kv } from '../kv';

/** Italiano (la seconda lingua è l'inglese). */
const it: Catalog = {
  ...kv('lang', 'fr=francese; en=inglese; es=spagnolo; it=italiano; de=tedesco; pt=portoghese; ru=russo; zh=cinese; hi=hindi; ar=arabo; ur=urdu; bn=bengalese'),
  ...kv('country', 'fr=Francia; be=Belgio; ch=Svizzera; ca=Canada; lu=Lussemburgo; gb=Regno Unito; us=Stati Uniti; es=Spagna; mx=Messico; it=Italia; de=Germania; at=Austria; pt=Portogallo; br=Brasile; ru=Russia; cn=Cina; in=India; eg=Egitto; ma=Marocco; sa=Arabia Saudita; pk=Pakistan; bd=Bangladesh'),

  'ui.loading': 'Caricamento…',
  'ui.rotate': 'Gira il tablet!',
  'ui.tap': 'Tocca lo schermo per giocare!',
  'ui.retry': 'Riprova',
  'ui.problem': 'Problema: {reason}',
  'ui.cancel': 'Annulla',
  'ui.skip': 'Salta', 'ui.home.play': 'Gioca', 'ui.home.missions': 'Missioni', 'ui.home.mydino': 'Il mio dino', 'ui.home.settings': 'Impostazioni', 'ui.end.again': 'Rigioca', 'ui.home.playWith': 'Gioca con il tuo dino, {name}!',
  'ui.home.learn': 'Impara e gioca con il tuo Dino!',
  'ui.home.summary': '{n} partite finite. Il tuo dino cresce con te!',
  'ui.home.sleeping': 'Ssst… il dino dorme.\nUn genitore può sbloccarlo con il suo codice.',
  'ui.home.timeUp': 'Il tempo di gioco è finito.\nUn genitore può sbloccarlo con il suo codice.',
  'ui.child.title': 'Come si chiama il bambino?',
  'ui.child.sub': 'Il dino lo chiamerà per nome.',
  'ui.parents.title': 'Area genitori',
  'ui.pin.type': 'Scrivi il tuo codice genitori.',
  'ui.pin.title': 'Codice genitori',
  'ui.pin.choose': 'Scegli un codice di 4 cifre.',
  'ui.wardrobe.title': 'Il mio Dino – Guardaroba',
  'ui.wardrobe.reactions': ['Che bello!', 'Mi piace tantissimo!', 'Come sto bene!', 'Che eleganza!'],
  'ui.choose.voice': 'A voce alta',
  'ui.choose.voiceTitle': 'Gioca a voce alta!',
  'ui.choose.title': 'Scegli un gioco!',
  'ui.end.3': 'Bravissimo!', 'ui.end.2': 'Fantastico!', 'ui.end.1': 'Ben fatto!', 'ui.end.0': 'Continua così!',
  'ui.end.done': 'Hai finito la partita!',
  'ui.time.unlimited': 'Illimitato', 'ui.time.less': 'Meno tempo', 'ui.time.more': 'Più tempo',
  'ui.lang': 'Lingua', 'ui.langLabel': 'Lingua:', 'ui.mb': '{n} MB',
  'ui.pack.voice': 'pacchetto {language}', 'ui.pack.asr': 'riconoscimento vocale',
  'ui.pack.stalled': 'Il download non procede. Controlla la connessione.',
  'ui.pack.downloading': 'Download in corso: {list}', 'ui.pack.installing': 'Installazione del riconoscimento vocale',
  'ui.pack.speechTitle': 'Voce del dino ({language})', 'ui.pack.speechDetail': 'Una voce naturale, uguale su tutti i dispositivi.',
  'ui.pack.secondTitle': 'Voce in {language}', 'ui.pack.secondDetail': 'Per le parole dei giochi in lingua straniera.',
  'ui.pack.asrTitle': 'Riconoscimento vocale', 'ui.pack.asrDetail': 'Per rispondere a voce alta.',
  'ui.pack.download': 'Scarica', 'ui.pack.installed': 'Installato ✓',
  'ui.pack.toDownload': 'Da scaricare: {n} MB (meglio con il Wi-Fi).', 'ui.pack.allInstalled': 'È tutto installato.',
  'ui.pack.running': 'Download in corso…', 'ui.pack.finished': 'Finito.', 'ui.pack.failed': 'Errore: {error}',
  'ui.pack.installingShort': 'Installazione…', 'ui.pack.waiting': 'In attesa…',
  'voice.heard': 'Ho sentito: {word}.',

  ...kv('p', `title=Area genitori; back=Torna al gioco; noName=Senza nome; addChild=+ Aggiungi un bambino; newChild=Nuovo bambino;
    newChildHelp=Uscendo dall'area genitori, il nuovo bambino toccherà il suo uovo per far nascere il suo dino.;
    cancel=Annulla; edit=✏️ Modifica la scheda; sheetOf=Scheda di {name}; sheet=Scheda del bambino; sheetHelp=Nome, età e impostazioni.;
    removeChild=Elimina {name}; thisChild=questo bambino;
    removeConfirm=Eliminare {name}, il suo dino e tutti i suoi progressi? Non si può annullare.;
    egg=uovo non ancora schiuso; dino=dino; alternateAria=Turni tra i bambini; age={n} anni; otherCountry=altro paese;
    series=partite giocate; answers=risposte; firstTry=al primo colpo; today=giocato oggi;
    childrenHelp=Ogni bambino ha il suo dino, i suoi progressi e le sue impostazioni. Le impostazioni qui sotto sono quelle del bambino scelto.;
    alternate=Turni: dopo ogni partita tocca al bambino successivo;
    difficulty=Difficoltà iniziale dei giochi: {n} su 20 ({stage}). Poi si adatta da sola ai risultati.;
    stageCP=prima elementare; stageK=scuola dell'infanzia; dinoLevel=Livello del dino;
    dinoLevelHelp=Il dino cresce quando il bambino gli dà da mangiare (livello da 1 a {max}). Puoi cambiarlo per regolare la difficoltà: i livelli da 21 a 40 corrispondono alla prima elementare.;
    noNight=Nessuna modalità notte; week=Tempo di gioco negli ultimi 7 giorni; daily=Tempo di gioco al giorno;
    dailyHelp=Quando il tempo è finito, il bambino finisce la partita, poi il gioco si blocca fino al giorno dopo: il dino va a dormire. Con il tuo codice puoi aggiungere 15 o 30 minuti, o sbloccare la giornata.;
    night=Ora di andare a letto (modalità notte);
    nightHelp=Da quest'ora il cielo diventa notte e il dino sbadiglia: propone un'ultima partita, poi dorme fino al mattino. Il tuo codice permette di giocare ancora un po' quella sera.;
    enable=Attiva {game}; levelOf=Livello di {game}; levelAuto=Livello automatico; level=Livello {n}; fromAge=Dai {n} anni;
    needsVoice=Gioco a voce alta: consenti il microfono e scarica il riconoscimento vocale in {language} (sezione «Voci e download»).;
    nAnswers={n} risposte; notPlayed=Non ancora giocato; rate={rate} al primo colpo; mastered={n} / {total} domande imparate;
    lastPlayed=ultima partita il {date}; chooseAria=Pulsante per scegliere un gioco; games=Giochi;
    choose=Pulsante «Scegli un gioco» nella schermata iniziale;
    chooseHelp=Disattivato, il bambino gioca con il pianeta: ogni partita mescola tutti i giochi della sua età. Attivato, può anche scegliere un gioco preciso (e i giochi a voce alta, che non sono mescolati con gli altri).;
    gamesHelp=Disattiva un gioco perché non venga più proposto. Il livello (da 1 a 20; da 11 a 20 = prima elementare) è quello da cui parte la prossima partita; «auto» lo calcola in base a età, dino e risultati.;
    reviewToday=da ripassare oggi; reviewTomorrow=torna domani; reviewOn=torna il {date}; reviewN=ripasso {n} di {total};
    review=Da ripassare;
    reviewHelp=Una domanda sbagliata torna il giorno dopo, poi 3 giorni dopo, poi una settimana dopo. Giusta tutte e tre le volte, è imparata; sbagliata, si ricomincia dal giorno dopo.;
    reviewNone=Niente da ripassare per ora. Bravo!; sfxAria=Effetti sonori; musicAria=Musica di sottofondo; testVoice=Prova la voce;
    testHello=Ciao! Sono Dino.; sound=Suono e voce; sfx=Effetti sonori (risposte giuste, errori, gnam…);
    music=Musica di sottofondo dolce (il bambino può spegnerla anche dalla schermata iniziale);
    phoneVoices=Voce principale: {main} · Voce della seconda lingua: {second}. Queste voci sono del telefono: per una voce più naturale, installa una voce «avanzata» o «premium» nelle impostazioni di accessibilità (sintesi vocale).;
    noVoice=nessuna trovata; mic=Microfono (giochi a voce alta);
    micHelp=Nei giochi a voce alta il bambino risponde parlando: nomina le immagini, dice parole nella seconda lingua e risolve i calcoli. Tutto resta su questo dispositivo: la voce non viene mai registrata né inviata. Il microfono si accende solo quando il bambino tocca il grande pulsante del microfono. Queste domande si mescolano con le altre quando il bambino tocca il pianeta.;
    noMic=Questo browser non permette di usare il microfono nel gioco.; allowMic=Consenti il microfono;
    allowMicNow=Consenti il microfono nella finestra del browser…;
    micBlocked=Il microfono è bloccato. Consentilo nelle impostazioni del browser (lucchetto accanto all'indirizzo), poi riprova.;
    packsWhere=I pacchetti di riconoscimento vocale si scaricano nella sezione «Voci e download».;
    removePacks=Elimina i pacchetti;
    removePacksConfirm=Eliminare da questo dispositivo i pacchetti di riconoscimento vocale? I giochi a voce alta non saranno più proposti.;
    packs=Voci e download;
    packsHelp=La lingua del gioco, la voce naturale del dino (creata sul dispositivo, senza Internet una volta scaricata), la voce dei giochi in lingua straniera e il riconoscimento vocale. I download vanno in parallelo e continuano anche se chiudi quest'area. Senza la voce del dino, il gioco usa la voce del telefono.;
    changeCode=Cambia il codice; newCode=Nuovo codice genitori; newCodeHelp=Scegli un nuovo codice di 4 cifre.;
    codeChanged=Il codice genitori è stato cambiato.; code=Codice genitori;
    codeHelp=Il codice apre quest'area e sblocca il gioco quando il tempo del giorno è finito. Se lo dimentichi, «Codice dimenticato?» permette di crearne un altro dopo una domanda per adulti.;
    reset=Ricomincia da zero; resetConfirm=Cancellare tutti i progressi (livello del dino, risposte, frutta)? Le impostazioni restano.;
    privacy=Informativa sulla privacy; close=Chiudi; data=Dati;
    dataHelp=Tutto è salvato solo su questo dispositivo. Nessun dato viene mai inviato.`),

  ...kv('pin', `erase=Cancella; remember=Ricordalo bene.; forgot=Codice dimenticato?;
    adultQuestion=Domanda per un adulto: quanto fa {a} × {b}? (3 cifre); cancel=Annulla; wrongAnswer=Non è giusto.;
    newCode=Nuovo codice genitori; newCodeHelp=Scegli un nuovo codice di 4 cifre.; wrongCode=Codice sbagliato.;
    otherCountry=Altro paese; firstName=Nome;
    micHtml=<b>Consenti il microfono</b> (giochi a voce alta)<br><small>Tutto resta su questo dispositivo: la voce non viene mai registrata né inviata.</small>;
    missionsHtml=<b>Scegliere le missioni</b><br><small>Il bambino può scegliere i suoi giochi (pulsante «Missioni»). Senza spunta: solo partite a caso con «Gioca».</small>;
    ok=OK; nameMissing=Scrivi il nome del bambino.; age=Età; years={n} anni; country=Paese; daily=Tempo di gioco al giorno;
    night=Ora di andare a letto (modalità notte); none=Nessuno; welcome=Benvenuto, genitore!;
    welcomeHeard=Ecco cosa ha detto tuo figlio al dino: correggi se serve. Puoi aggiungere altri bambini e cambiare tutto nell'area genitori (lucchetto nella schermata iniziale).;
    welcomeHelp=Nome, età e impostazioni di tuo figlio. Puoi aggiungere altri bambini e cambiare tutto nell'area genitori (lucchetto nella schermata iniziale).;
    yourCode=Il tuo codice genitori;
    yourCodeHelp=Scegli un codice di 4 cifre. Apre l'area genitori (lucchetto nella schermata iniziale) e sblocca il gioco quando il tempo del giorno è finito. Non darlo a tuo figlio!;
    asleep=Il dino dorme; asleepHelp=È ora di andare a letto. Scrivi il codice genitori per giocare ancora un po' stasera.;
    timeUp=Il tempo di gioco è finito; timeUpHelp=Scrivi il codice genitori per aggiungere tempo oggi.;
    addTime=Aggiungi tempo; todayOnly=Solo per oggi.; plus15=15 minuti in più; plus30=30 minuti in più; unlimited=Senza limiti oggi`),

  ...kv('inst', `title=Installa DinoLearn sul telefono; later=Più tardi; okay=OK; never=Non chiedere più;
    android=Si aprirà a schermo intero, in orizzontale, come una vera app. Non c'è nient'altro da scaricare.;
    menu=Nel menu del browser:;
    androidSteps=<li>Tocca <b>⋮</b> (i tre puntini, in alto a destra).</li><li>Scegli <b>«Installa app»</b> o <b>«Aggiungi a schermata Home»</b>.</li><li>Apri il gioco con l'icona del dino.</li>;
    ios=Si aprirà a schermo intero, senza le barre di Safari, come una vera app.;
    iosSteps=<li>Tocca {share} <b>Condividi</b> (in basso o in alto in Safari).</li><li>Scegli <b>«Aggiungi alla schermata Home»</b>, poi <b>Aggiungi</b>.</li><li>Apri il gioco con l'icona del dino.</li>`),

  ...kv('title', `EN-1=Inglese — Ascolta e tocca; EN-2=Inglese — I numeri; EN-3=Inglese — Memory; MO-1=Il mondo — Fammi vedere;
    MO-3=Il mondo — Le ombre; MO-4=Il mondo — Cosa va insieme; MO-5=Il mondo — Il più grande; LO-1=Logica — L'intruso;
    LO-2=Logica — Quanti sono?; LO-3=Logica — Cosa viene dopo; LO-4=Logica — Di più, di meno; LO-5=Logica — I calcoli;
    LO-6=Logica — I numeri; LO-7=Logica — Forme e colori; LO-8=Logica — L'ora; LO-9=Logica — I soldi;
    LO-10=Logica — Memory; LO-11=Logica — Ascolta e conta; TR-1=Scrittura — Traccia le forme;
    TR-2=Scrittura — Traccia lettere e numeri; VO-1=A voce alta — Come si chiama?; VO-2=A voce alta — Dillo in inglese!;
    VO-13=A voce alta — I calcoli`),

  ...kv('item', `top-hat=il cilindro; billed-cap=il cappellino; crown=la corona; womans-hat=il cappello di paglia;
    graduation-cap=il tocco da laureato; rescue-workers-helmet=il casco da pompiere; headphone=le cuffie; hibiscus=il fiore;
    glasses=gli occhiali; sunglasses=gli occhiali da sole; goggles=la maschera da sub; ribbon=il papillon; swim-ring=il salvagente;
    sports-medal=la medaglia; prayer-beads=la collana; cape-red=il mantello da supereroe; cape-blue=il mantello da mago; wing=le ali;
    balloon=il palloncino; magic-wand=la bacchetta magica; lollipop=il lecca-lecca; sunflower=il girasole; teddy-bear=l'orsacchiotto`),
  ...kv('dinocolor', '0=verde; 1=blu; 2=viola; 3=rosa; 4=arancione; 5=giallo; 6=turchese; 7=rosso; 8=marrone'),

  ...kv('cat', `farm=un animale della fattoria; sea=un animale del mare; bird=un uccello; bug=un insetto; wild=un animale selvatico;
    forest=un animale del bosco; fruit=un frutto; veg=una verdura; meal=qualcosa da mangiare; vehicle=un veicolo; toy=un giocattolo;
    home=una cosa di casa; clothes=una cosa da indossare; tool=un attrezzo; kitchen=un oggetto di tutti i giorni;
    music=uno strumento musicale; sky=una cosa del cielo; plant=una pianta; body=una parte del corpo; landscape=un luogo;
    color=un colore; element=una cosa della natura`),
  ...kv('fam', `farm=animali della fattoria; sea=animali del mare; bird=uccelli; bug=insetti; wild=animali selvatici;
    forest=animali del bosco; fruit=frutti; veg=verdure; meal=cibi e dolci; vehicle=veicoli; toy=giocattoli;
    home=cose di casa; clothes=vestiti; tool=attrezzi; kitchen=cose del bagno e della cucina; music=strumenti musicali;
    sky=cose del cielo e del tempo; plant=piante; body=parti del corpo; landscape=luoghi; color=colori; element=cose della natura`),
  ...kv('fruit', `red-apple=mela; banana=banana; strawberry=fragola; cherries=ciliegie; grapes=uva; tangerine=arancia;
    pear=pera; lemon=limone; watermelon=anguria; peach=pesca; pineapple=ananas; kiwi-fruit=kiwi; mango=mango;
    blueberries=mirtilli; melon=melone; green-apple=mela verde; coconut=cocco`),
  ...kv('many', `food-red-apple=mele; food-banana=banane; food-strawberry=fragole; food-pear=pere; food-lemon=limoni;
    food-tangerine=arance; food-kiwi-fruit=kiwi; food-peach=pesche`),

  'g.hintFamily': 'Indizio: è {family}.',
  'g.word': '{word}!',
  'g.yesWord': ['Sì, {word}!', 'Esatto, {word}!'],
  'g.yesItIs': 'Sì, è {word}!',
  'g.hint': 'Indizio: {hint}.',
  'g.hintTens': 'Indizio: guarda prima la prima cifra, le decine.',
  'g.plus': '{a} più {b}', 'g.minus': '{a} meno {b}',
  'g.calcPrompt': ['Quanto fa {calc}?', '{calc}, quanto fa?'],
  'g.calcYes': 'Sì! {calc} fa {n}!',
  'g.hintAdd': 'Indizio: parti da {a} e conta ancora {b} sulle dita.',
  'g.hintSub': 'Indizio: parti da {a} e conta {b} all\'indietro sulle dita.',
  'MO-1.prompt': ['Fammi vedere {word}!', 'Dov\'è {word}?', 'Tocca {word}!', 'Trovi {word}?'],
  'LO-1.prompt': ['Trova l\'intruso! Quale non è della stessa famiglia?', 'Quale immagine non è della stessa famiglia?'],
  'LO-1.yes': 'Sì, {word}! Gli altri sono {family}.',
  'LO-1.hint': 'Indizio: {n} immagini sono {family}. Cerca quella che non lo è.',
  'LO-2.prompt': ['Ci sono {things}. Quanti frutti sono? Conta bene!', 'Conta i frutti: {things}. Quanti sono?'],
  'LO-2.promptMixed': 'Attenzione! Conta solo questi frutti: {things}. Quanti sono?',
  'LO-2.yes': '{list}. Sono {n}!',
  'LO-2.hint': 'Indizio: tocca ogni frutto con il dito, contando piano.',
  'LO-2.hintBig': 'Indizio: conta prima fino a dieci, poi continua: undici, dodici, tredici…',
  'MO-3.prompt': ['Di chi è quest\'ombra? Tocca l\'immagine giusta!', 'Chi si nasconde dietro quest\'ombra?'],
  'LO-3.prompt': ['Guarda bene la sequenza. Quale frutto viene dopo?', 'Quale frutto continua la sequenza?'],
  'LO-3.yes': 'Sì! {list}!',
  'LO-3.hint': 'Indizio: la sequenza ricomincia sempre uguale. {list}…',
  'LO-3.numPrompt': 'Guarda e ascolta: {list}. Quale numero viene dopo?',
  'LO-3.numYes': 'Sì! {list}, {n}!',
  'LO-3.hintGrow': 'Indizio: aggiungiamo uno, poi due, poi tre… e poi?',
  'LO-3.hintPlus': 'Indizio: aggiungiamo {n} ogni volta.',
  'LO-3.hintMinus': 'Indizio: togliamo {n} ogni volta.',
  'LO-4.num.most': 'Tocca il numero più grande!', 'LO-4.num.least': 'Tocca il numero più piccolo!',
  'LO-4.numYes.most': 'Sì! {n} è il più grande!', 'LO-4.numYes.least': 'Sì! {n} è il più piccolo!',
  'LO-4.numHint.most': 'Indizio: quando contiamo, il più grande arriva per ultimo.',
  'LO-4.numHint.least': 'Indizio: quando contiamo, il più piccolo arriva per primo.',
  'LO-4.pile.most': 'Dove ci sono più {things}? Tocca la carta giusta!',
  'LO-4.pile.least': 'Dove ci sono meno {things}? Tocca la carta giusta!',
  'LO-4.pileYes.most': 'Sì! Qui ce ne sono {n}. È dove ce ne sono di più!',
  'LO-4.pileYes.least': 'Sì! Qui ce ne sono {n}. È dove ce ne sono di meno!',
  'LO-4.pileHint.least': 'Indizio: cerca la carta con pochissimi frutti.',
  'LO-4.pileHint.most': 'Indizio: cerca la carta più piena.',
  'LO-5.compl': '{a} più quanto fa {b}?',
  'LO-5.complYes': 'Sì! {a} più {x} fa {b}!',
  'LO-5.complHint': 'Indizio: conta sulle dita, da {a} fino a {b}.',
  'LO-5.add': 'Guarda, {a} {things}. Ne aggiungo {b}. Quanti frutti ci sono in tutto?',
  'LO-5.eat': 'Guarda, {a} {things}. Dino ne mangia {b}. Quanti frutti restano?',
  'LO-5.addHint': 'Indizio: conta tutti i frutti, a sinistra e a destra.',
  'LO-5.eatHint': 'Indizio: conta solo i frutti che non sono barrati.',
  'LO-11.prompt': ['Ascolta bene: {calc}. Quanto fa?', 'Quanto fa {calc}?', 'A mente: {calc}. Tocca la risposta!'],
  'VO-13.prompt': ['Quanto fa {calc}? Dimmelo!', '{calc}, quanto fa? Dimmelo!'],
  'VO-13.repeat': 'Ascolta: {calc} fa {n}. Ora dillo tu!',
  'VO-13.fallback': '{calc}, quanto fa? Tocca il numero giusto!',
  'MO-4.prompt': ['Guarda: {word}. Cosa ci va insieme?', 'Trova cosa va bene con {word}!'],
  'MO-4.yes': 'Sì, {a} va con {b}!',
  'MO-4.hint': 'Indizio: immagina {word}. Cosa si vede spesso insieme?',
  'MO-5.prompt.big': ['Nella realtà, qual è il più grande?', 'Tocca il più grande nella realtà!'],
  'MO-5.prompt.small': ['Nella realtà, qual è il più piccolo?', 'Tocca il più piccolo nella realtà!'],
  'MO-5.yes.big': 'Sì! Nella realtà, {word} è il più grande!',
  'MO-5.yes.small': 'Sì! Nella realtà, {word} è il più piccolo!',
  'MO-5.hint': 'Indizio: nelle immagini sono tutti della stessa grandezza. Immaginali veri, accanto a te!',
  'LO-6.prompt': ['Tocca il numero {n}!', 'Dov\'è il numero {n}?', 'Trova il {n}!'],
  'LO-6.yes': 'Sì! È il {n}!',
  'LO-6.hint': 'Indizio: conta sulle dita fino a {n} e cerca quel numero.',
  'LO-6.hintBig': 'Indizio: guarda bene la prima cifra, poi la seconda.',
  'EN-2.hint': 'Indizio: conta in inglese sulle dita e fermati quando senti il numero giusto.',
  'LO-7.shape': 'Tocca {shape}!',
  'LO-7.color': 'Tocca la forma di colore {color}!',
  'LO-7.both': 'Tocca {shape} di colore {color}!',
  'LO-7.yes.shape': 'Sì, {shape}!',
  'LO-7.yes.color': 'Sì! Quella di colore {color}!',
  'LO-7.yes.both': 'Sì, {shape} di colore {color}!',
  'LO-7.hint.color': 'Indizio: guarda solo il colore, la forma non conta.',
  'LO-7.hint.both': 'Indizio: cerca prima il colore giusto, poi guarda bene la forma.',
  ...kv('shape', 'circle=il cerchio; square=il quadrato; triangle=il triangolo; star=la stella; heart=il cuore; rectangle=il rettangolo; diamond=il rombo; oval=l\'ovale; hexagon=l\'esagono; cross=la croce'),
  ...kv('clue', `circle=il cerchio è tondo, non ha angoli; square=il quadrato ha quattro lati uguali;
    triangle=il triangolo ha tre lati e tre punte; star=la stella ha cinque punte;
    heart=il cuore ha due gobbe in alto e una punta in basso; rectangle=il rettangolo ha quattro lati, due lunghi e due corti;
    diamond=il rombo è come un quadrato appoggiato su una punta; oval=l'ovale è un cerchio allungato;
    hexagon=l'esagono ha sei lati; cross=la croce ha quattro bracci`),
  ...kv('color', 'red=rosso; blue=blu; green=verde; yellow=giallo; orange=arancione; purple=viola; pink=rosa'),
  'time.0': 'le {h} in punto', 'time.30': 'le {h} e mezza', 'time.15': 'le {h} e un quarto', 'time.45': 'le {next} meno un quarto',
  'time.m': 'le {h} e {m}', 'time.24': 'le {h}:{mm}',
  'LO-8.prompt': ['Tocca l\'orologio che segna {time}!', 'Dove sono {time}?'],
  'LO-8.yes': 'Sì! Sono {time}!',
  'LO-8.hint': 'Indizio: la lancetta corta segna l\'ora, quella lunga i minuti.',
  'LO-8.hintHard': 'Indizio: guarda prima la lancetta corta per l\'ora, poi quella lunga per i minuti.',
  'money.e1': 'un euro', 'money.e': '{e} euro', 'money.c1': 'un centesimo', 'money.c': '{c} centesimi', 'money.ec': '{e} euro e {c}',
  'LO-9.prompt': ['Tocca la carta con {money}!', 'Dove ci sono esattamente {money}?'],
  'LO-9.yes': 'Sì! Fa {money}!',
  'LO-9.hint': 'Indizio: conta prima le banconote e le monete grandi, poi aggiungi quelle piccole.',
  'TR.dots': ['Ripassa la linea tratteggiata!', 'Con il dito, segui i puntini!'],
  'TR.faint': 'Traccialo seguendo i puntini.',
  'TR.free': ['Ora disegnalo da solo, come il modello!', 'Tocca a te: disegnalo senza i puntini!'],
  'TR.yes': ['Bravo! Bellissimo!', 'Fantastico!', 'Che bel disegno!'],
  'TR.hint': 'Guarda, ti faccio vedere! Parti dal punto verde numero uno.',
  'LO-10.prompt': ['Gira due carte. Se sono uguali, vinci la coppia!', 'Trova tutte le coppie!'],
  'LO-10.promptForeign': ['Gira due carte e trova le coppie! Ascolta… in inglese!', 'Trova le coppie e ascolta le parole in inglese!'],
  'LO-10.yes': ['Bravo, hai trovato tutte le coppie!', 'Che memoria! Tutte le coppie!'],
  'LO-10.hint': 'Ricorda dove sono le immagini che hai già visto!',
  'VO-1.prompt': ['Come si chiama questo?', 'Che cos\'è?', 'Dimmi che cos\'è!'],
  'VO-1.repeat': 'Ascolta bene: {word}. Ora dillo tu!',
  'VO-2.prompt': ['Come si dice {word} in inglese?', 'In inglese, come si dice {word}?', 'Di\' {word} in inglese!'],
  'VO-2.yes': ['Bravo, detto benissimo!', 'Fantastico, parli inglese!', 'Perfetto!'],
  'VO-2.repeat': 'Ascolta bene e ripeti con me:',
  'VO-2.fallback': 'Tocca l\'immagine della parola inglese:',
  'VO-2.hint': 'Indizio: pensa alle parole inglesi che conosci già!',
  'l.handover': ['Bravo {current}! Ora tocca a {next}!', 'Grazie {current}! {next}, tocca a te giocare!'],
  'l.gift': ['Sono cresciuto! Scegli un regalo per me!', 'Un regalo! Quale mi darai?'],
  'l.giftThanks': 'Oh, {item}! Grazie!',

  ...kv('num', `0=zero; 1=uno|un|una; 2=due; 3=tre; 4=quattro; 5=cinque; 6=sei; 7=sette; 8=otto; 9=nove; 10=dieci; 11=undici;
    12=dodici; 13=tredici; 14=quattordici; 15=quindici; 16=sedici; 17=diciassette; 18=diciotto; 19=diciannove; 20=venti`),

  'l.hello': ['Ciao {name}! Sono io, il tuo dino!', 'Ciao {name}! Ci divertiremo tanto insieme!'],
  'l.welcome_back': ['Sei tornato, {name}! Evviva!', 'Ciao {name}! Non vedevo l\'ora di vederti!', 'Ah, eccoti! Giochiamo?',
    'Evviva, è arrivato il mio amico!'],
  'l.home.play': ['Tocca il pulsante verde: facciamo il giro del mondo dei giochi!', 'Giochiamo? Tocca il pulsante verde!'],
  'l.home.categories': ['E per scegliere il tuo gioco, tocca il pulsantino.'],
  'l.random.go': ['Si parte!', 'Decollo! Facciamo il giro del mondo!', 'Dai, giochiamo!', 'Pronti… via!'],
  'l.home.choose': ['Scegli un gioco! Tocca una grande bolla.'],
  'l.home.EN-1': ['La bandiera: parole in inglese!'],
  'l.home.MO-1': ['Fammi vedere le cose del mondo!'],
  'l.home.LO-1': ['Il puzzle: trova l\'intruso!'],
  'l.home.LO-2': ['L\'abaco: contiamo!'],
  'l.home.MO-3': ['L\'ombra: di chi è?'],
  'l.home.LO-3': ['Le frecce: cosa viene dopo?'],
  'l.home.LO-4': ['La bilancia: dove ce ne sono di più?'],
  'l.home.LO-5': ['I numeri: facciamo i calcoli!'],
  'l.home.LO-11': ['L\'orecchio: calcoli a mente!'],
  'l.home.VO-13': ['Il microfono: dimmi il risultato del calcolo!'],
  'l.home.EN-2': ['Il dieci: i numeri in inglese!'],
  'l.home.MO-4': ['La stretta di mano: cosa va insieme?'],
  'l.home.MO-5': ['Il righello: cosa è più grande nella realtà?'],
  'l.home.LO-6': ['I numeri: trova il numero giusto!'],
  'l.home.LO-10': ['Le carte: memory!'],
  'l.home.EN-3': ['Il jolly: memory in inglese!'],
  'l.home.LO-7': ['La tavolozza: forme e colori!'],
  'l.home.LO-8': ['La sveglia: che ore sono?'],
  'l.home.LO-9': ['La banconota: contiamo i soldi!'],
  'l.home.TR-1': ['La matita: tracciamo le forme!'],
  'l.home.TR-2': ['La mano che scrive: tracciamo lettere e numeri!'],
  'l.intro.MIX': ['Ascolta bene ogni domanda!', 'Apri bene le orecchie!', 'Sei pronto? Io sì!'],
  'l.short.EN-1': ['In inglese!'],
  'l.short.MO-1': ['Fammi vedere!'],
  'l.short.MO-3': ['Un\'ombra!'],
  'l.short.LO-1': ['L\'intruso!'],
  'l.short.LO-2': ['Contiamo!'],
  'l.short.LO-3': ['Cosa viene dopo!'],
  'l.short.LO-4': ['Di più o di meno!'],
  'l.short.LO-5': ['Un calcolo!'],
  'l.short.LO-11': ['Un calcolo a mente!'],
  'l.short.VO-13': ['Dimmi il risultato!'],
  'l.short.EN-2': ['Un numero in inglese!'],
  'l.short.MO-4': ['Cosa va insieme?'],
  'l.short.MO-5': ['Il più grande o il più piccolo!'],
  'l.short.LO-6': ['Trova il numero!'],
  'l.short.LO-10': ['Memory!'],
  'l.short.EN-3': ['Memory in inglese!'],
  'l.short.LO-7': ['Forme e colori!'],
  'l.short.LO-8': ['Che ore sono?'],
  'l.short.LO-9': ['I soldi!'],
  'l.short.TR-1': ['Tracciamo!'],
  'l.short.TR-2': ['Scriviamo!'],
  'l.home.level': ['La stella è il mio livello!'],
  'l.intro.EN-1': ['Dico una parola in inglese. Tocca l\'immagine giusta!'],
  'l.intro.MO-1': ['Ascolta bene e tocca quello che ti chiedo.', 'Facciamo il giro del mondo! Trova quello che ti chiedo.'],
  'l.intro.LO-1': ['Guarda bene le immagini. Solo una non è della stessa famiglia: trova l\'intruso!'],
  'l.intro.LO-2': ['Contiamo! Conta i frutti e tocca il numero giusto.'],
  'l.intro.MO-3': ['Guarda bene quest\'ombra nera. Trova di chi è!'],
  'l.intro.LO-3': ['Guarda bene la sequenza e trova cosa viene dopo.'],
  'l.intro.LO-4': ['Guarda bene le carte. Trova quella che ti chiedo!'],
  'l.intro.LO-11': ['Calcoli senza immagini! Ascolta bene, calcola a mente e tocca il numero giusto.'],
  'l.intro.VO-13': ['Io dico un calcolo e tu mi dici il risultato. Tocca il microfono per rispondere!'],
  'l.intro.LO-5': ['Facciamo i calcoli! Ascolta bene e tocca il numero giusto.', 'È l\'ora dei calcoli! Puoi contare sulle dita.'],
  'l.intro.EN-2': ['Dico un numero in inglese. Tocca il numero giusto!'],
  'l.intro.MO-4': ['Alcune cose vanno insieme, come la chiave e il lucchetto. Trova cosa va insieme!'],
  'l.intro.MO-5': ['Nelle immagini tutto ha la stessa grandezza. Ma nella realtà? Trova quello che ti chiedo!'],
  'l.intro.LO-6': ['Dico un numero. Trovalo tra le carte!'],
  'l.intro.LO-10': ['Giochiamo a memory! Gira due carte: se le immagini sono uguali, vinci la coppia!'],
  'l.intro.EN-3': ['Memory in inglese! Quando giri una carta, dico la parola in inglese. Trova le coppie!'],
  'l.intro.LO-7': ['Giochiamo con forme e colori! Ascolta bene e tocca la forma giusta.'],
  'l.intro.LO-8': ['Guarda bene gli orologi! La lancetta corta segna l\'ora, quella lunga i minuti.'],
  'l.intro.LO-9': ['Giochiamo al negozio! Conta le monete e trova la somma giusta.'],
  'l.intro.TR-1': ['Disegniamo con il dito! Parti dal punto verde e segui la linea tratteggiata.'],
  'l.intro.TR-2': ['Impariamo a scrivere! Parti dal punto verde numero uno e segui la linea tratteggiata.'],
  'l.trace.start': ['Metti il dito sul punto verde e segui i puntini.', 'Dai, disegna con il dito!'],
  'l.trace.continue': ['Continua, ci sei quasi!', 'Manca ancora un pezzo. Continua!'],
  'l.trace.retry': ['Quasi! Cancelliamo e ricominciamo?', 'Ops, non è proprio così. Riprova!'],
  'l.tutorial': ['Guarda, ti faccio vedere! Si tocca l\'immagine giusta, così.'],
  'l.tutorial_your_turn': ['Ora tocca a te!'],
  'l.correct': ['Bravo {name}!', 'Benissimo, {name}!', 'Esatto!', 'Fantastico!', 'Super!', 'Sìììì!', 'Grande!', 'Campione!',
    'Sei una stella!', 'Proprio così!', 'Perfetto!', 'Wow!'],
  'l.wrong': ['Ops! Riprova!', 'Mmm, guarda bene…', 'Non quello! Continua a cercare!', 'Quasi! Ancora una volta!', 'Non fa niente, riprova!'],
  'l.hint': ['Ti aiuto: tocca quello che brilla!', 'Guarda, è quello che ti mostro!'],
  'l.streak': ['Tre di fila! Sei fortissimo!', 'Tre di fila! Incredibile!'],
  'l.idle': ['Ci sei? Tocca una carta!', 'Ti aspetto! Tocca una carta.'],
  'l.touch_me': ['Per sentirlo di nuovo, toccami!'],
  'l.review_due': ['Questa l\'abbiamo già vista insieme. Ti ricordi?', 'Una domanda di ripasso! Sono sicuro che la sai.'],
  'l.review': ['Sai già tutto! Ripassiamo?'],
  'l.series_perfect': ['Wow, tutto giusto! Sei una vera stella, {name}!', 'Nessun errore! Ballo di gioia!'],
  'l.series_great': ['Incredibile! Quasi tutto giusto!', 'Che talento, {name}!'],
  'l.series_good': ['Giocato benissimo! Impari in fretta!', 'Bravo, ne hai trovate tante!'],
  'l.series_ok': ['Ben giocato! Continuiamo ad allenarci?', 'Bene! Ogni partita ti aiuta a migliorare.'],
  'l.series_encourage': ['Era difficile, vero? Anch\'io sto imparando!', 'Non fa niente! Si impara giocando.',
    'Anche i grandi dinosauri sbagliano! Ricominciamo?'],
  'l.end.feed': ['Guarda questo cestino di frutta! Tocca il cestino per darmela.', 'Gnam! Dammi il cestino: toccalo!'],
  'l.end.nothing': ['Niente frutta questa volta. Rigiochiamo per vincerne un po\'?'],
  'l.end.again': ['Tocca il pulsante verde per giocare ancora!'],
  'l.fly.visit': ['Guarda, una mosca!', 'Mi piacciono le mosche!'],
  'l.home.ambient': ['Credo che il vulcano sia ancora in eruzione.', 'Ho un po\' di fame.', 'Mi piacerebbe che mi aiutassi a crescere.',
    'Guarda le nuvole che passano!'],
  'l.fly.caught': ['Slurp! Una mosca!', 'Gnam, croccante!', 'Presa!'],
  'l.fruit.won': ['Un frutto per me!', 'Gnam, un frutto!'],
  'l.eating': ['Gnam gnam!', 'Crunch! Buonissimo!', 'Mmm, che buono!', 'Ancora, per favore!', 'Grazie!'],
  'l.full': ['Ho la pancia piena! Tengo il resto per dopo.'],
  'l.level_up': ['Oh! Sto crescendo! Grazie perché ti prendi cura di me!', 'Guarda, sono più grande!'],
  'l.tickle': ['Ih ih, mi fai il solletico!', 'Ah ah ah! Basta!', 'Oh no, il solletico no!'],
  'l.start': ['Toccami per svegliarmi!'],
  'l.parent_code': ['Prima di giocare, vai a chiamare mamma o papà! Devono scegliere un codice segreto per me.'],
  'l.parent_code_done': ['Grazie! Ora possiamo giocare insieme!'],
  'l.wardrobe.intro': ['Trascina un oggetto su di me per mettermelo!', 'Vestimi! Prendi un oggetto con il dito e mettimelo.'],
  'l.wardrobe.drag': ['Tieni il dito sull\'oggetto e trascinalo su di me!'],
  'l.wardrobe.off': ['Va bene, me lo tolgo!', 'Via!'],
  'l.wardrobe.empty': ['Il mio armadio è vuoto! Quando cresco, vinci un oggetto per me.'],
  'l.home.wardrobe': ['Il cappello serve per vestirmi!'],
  'l.gift.waiting': ['Sono cresciuto! Tocca il regalo per scegliere un oggetto per me.'],
  'l.gift.go': ['Sono cresciuto! Vieni al mio armadio: ti aspetta un regalo!'],
  'l.wardrobe.new': ['Trascinalo su di me per mettermelo!'],
  'l.wardrobe.take_off': ['Per togliermi un oggetto, trascinalo lontano da me.'],
  'l.night.last': ['Oh, si fa tardi… Un\'ultima partita e poi a nanna?', 'Aaah… ho sonno. Dai, un\'ultimissima partita!'],
  'l.night.goodnight': ['Era l\'ultima partita! Grazie per questa bella giornata. Buonanotte!'],
  'l.night.sleep': ['Ssst… sto dormendo. Zzz… A domani!'],
  'l.bedtime': ['Oggi abbiamo giocato tanto! Ora vado a dormire. Giochiamo ancora domani?'],
  'l.streak5': ['Cinque di fila! Sei un genio!', 'Cinque! Sei più forte di un T-rex!'],
  'l.correct_after_try': ['L\'hai trovato! Vedi, bastava cercare!', 'Ecco! Non ti sei arreso, bravo!'],
  'l.halfway': ['Siamo già a metà! Continua così!', 'Metà! Ancora qualche domanda!'],
  'l.last_question': ['Ultima domanda!', 'Dai, l\'ultima!'],
  'l.home.voice': ['Il microfono: giochi in cui rispondi con la voce!'],
  'l.home.voice_choose': ['Qui rispondi parlando! Scegli un gioco.'],
  'l.intro.VO-1': ['Ti mostro un\'immagine. Tocca il microfono e dimmi come si chiama.'],
  'l.intro.VO-2': ['Parliamo inglese! Tocca il microfono e di\' la parola in inglese.'],
  'l.home.VO-1': ['La testa che parla: dimmi il nome delle immagini!'],
  'l.home.VO-2': ['La bandiera: di\' le parole in inglese!'],
  'l.short.VO-1': ['Come si chiama?'],
  'l.short.VO-2': ['In inglese!'],
  'l.voice.tap_mic': ['Tocca il microfono e rispondimi.', 'Tocca a te! Tocca il microfono e parla forte.'],
  'l.voice.listening': ['Ti ascolto!', 'Ho le orecchie ben aperte!'],
  'l.voice.unheard': ['Non ti ho sentito bene. Tocca il microfono e parla forte.', 'Oh, non ho sentito niente! Avvicinati e parla più forte.'],
  'l.voice.wrong': ['Non è questo! Riprova!', 'Quasi! Ancora una volta!'],
  'l.voice.cards': ['Ho le orecchie stanche! Tocca la risposta giusta con il dito.'],
  'l.voice.give_up': ['Il microfono non mi sente bene. Da ora giochiamo con il dito!'],
  'l.voice.loading': ['Aspetta, mi pulisco le orecchie…'],
  'l.voice.no_mic': ['Oh, non ti sento. Giochiamo con il dito!'],
  'l.egg.1': ['Toc toc! C\'è qualcuno?', 'Oh! Qualcosa si muove lì dentro!'],
  'l.egg.2': ['Ancora! Aiutami a uscire!', 'Continua, il guscio si rompe!'],
  'l.egg.3': ['Quasi! Ancora un colpetto!'],
  'l.egg.hatched': ['Ciao!', 'Uff! Eccomi!'],
  'l.hello.1': ['Ciao! Sono il tuo dino, un piccolo cucciolo di dinosauro {color}. Mi aiuti a crescere?'],
  'l.hello.4': ['Giocheremo a tantissimi giochi insieme: gli animali, le forme, le lettere, i numeri e perfino un\'altra lingua!'],
  'l.hello.5': ['Ogni volta che trovi la risposta giusta al primo colpo, vinci un frutto. Guarda, cadono nel mio cestino!'],
  'l.hello.6': ['Poi me li dai da mangiare. Gnam! Più mangio, più cresco!'],
  'l.hello.7': ['E quando cresco, vinci dei regali: vestiti per travestirmi, stelle e sorprese!'],
  'l.hello.2': ['Sono appena nato… Non so ancora niente del mondo! Con te imparerò tutto.'], 'l.hello.9': ['In «Il mio dino» potrai vestirmi come vuoi: cappelli, occhiali, mantelli… Sarò il dino più bello!'], 'l.hello.10': ['E se sbagli, non importa: ti darò un aiuto e riproveremo insieme!'], 'l.hello.8': ['Dai, andiamo!'],
  'l.hello.name': ['Ma prima dimmi: come ti chiami? Tocca il microfono e di\' il tuo nome a voce alta!'],
  'l.hello.name_again': ['Non ti ho sentito bene. Tocca il microfono e ripetimi il tuo nome!'],
  'l.hello.name_ok': ['Piacere, {name}! Che bel nome!'],
  'l.hello.name_later': ['Mi dirai il tuo nome più tardi: me lo scriveranno mamma o papà!'],
  'l.hello.age': ['E tu, {name}, quanti anni hai? Tocca il microfono e dimmelo!'],
  'l.hello.age_again': ['Non ti ho sentito bene. Quanti anni hai? Tocca il microfono!'],
  'l.hello.age_later': ['Non fa niente: me lo diranno mamma o papà!'],
  'l.hello.sibling': ['Ciao {name}! Sono il tuo dino, un piccolo cucciolo di dinosauro {color}. Ci divertiremo tanto insieme!'],
  'l.hello.mic_allow': ['Se compare un messaggio sullo schermo, chiedi a un adulto di toccare «Consenti»!'],
  'l.hello.parent': ['Ora dai il telefono a mamma o papà! Sceglieranno un codice segreto, solo per me.'],
  'l.welcome_first': ['Questa è casa mia, {name}! Ci divertiremo tanto!'],
  'l.burp': ['Ops! Scusa!', 'Ih ih… scusami!', 'Scusa… era troppo buono!'],
  'l.fart': ['Ops… scusa!', 'Ih ih, non sono stato io!', 'Scusa! La mia pancia fa rumori strani!'],
  'l.hunger.growl': ['Senti? La mia pancia brontola! Dammi il cestino!'],
  'l.hunger.look': ['Mmm… quel frutto sembra buonissimo… Tocca il cestino!'],
  'l.hunger.beg': ['Per favore, per favore! Dammi il cestino!', 'Dai, {name}, per favore! Ho fame!'],
  'l.hunger.gape': ['Guarda, apro la bocca: aaah! Mettici il frutto!'],
  'l.hunger.sad': ['Ho tanta fame… Tocca il cestino!', 'Ho la pancia vuota… Mi dai da mangiare?'],
  'l.child.turn': ['Tocca a te, {name}! Giochiamo insieme?', 'Ciao {name}! Tocca a te giocare!'],
  'l.child.ask_name': ['Ciao! Vai a chiamare mamma o papà: devono dirmi il tuo nome!'],
  'l.age.ask': ['Quanti anni hai? Tocca la torta con la tua età!'],
  'l.age.3': ['Tre anni! Super!'], 'l.age.4': ['Quattro anni! Super!'], 'l.age.5': ['Cinque anni! Fantastico!'],
  'l.age.6': ['Sei anni! Fantastico!'], 'l.age.7': ['Sette anni! Wow!'],

  ...kv('c', `dog=il cane; cat=il gatto; fish=il pesce; bird=l'uccello; cow=la mucca; pig=il maiale; horse=il cavallo; duck=l'anatra;
    rabbit=il coniglio; hen=la gallina; sheep=la pecora; frog=la rana; mouse=il topo; dinosaur=il dinosauro; red=rosso; blue=blu;
    green=verde; yellow=giallo; orange_color=arancione; purple=viola; pink=rosa; black=nero; white=bianco; brown=marrone;
    apple=la mela; banana=la banana; strawberry=la fragola; cherry=la ciliegia; orange=l'arancia; egg=l'uovo;
    ice_cream=il gelato; pizza=la pizza; grapes=l'uva; pear=la pera; lemon=il limone; carrot=la carota; bread=il pane;
    milk=il latte; cake=la torta; watermelon=l'anguria; cookie=il biscotto; cheese=il formaggio; tomato=il pomodoro; pineapple=l'ananas;
    peach=la pesca; broccoli=i broccoli; corn=il mais; kiwi=il kiwi; mango=il mango; blueberries=i mirtilli; coconut=il cocco;
    car=la macchina; ball=la palla; bus=l'autobus; train=il treno; plane=l'aereo; boat=la barca; bike=la bicicletta; balloon=il palloncino;
    teddy=l'orsacchiotto; book=il libro; house=la casa; kite=l'aquilone; bed=il letto; chair=la sedia; door=la porta;
    key=la chiave; clock=l'orologio; sun=il sole; moon=la luna; star=la stella; flower=il fiore; cloud=la nuvola; rainbow=l'arcobaleno;
    tree=l'albero; rain=la pioggia; snowflake=il fiocco di neve; snowman=il pupazzo di neve; leaf=la foglia; mountain=la montagna;
    fire=il fuoco; sunflower=il girasole; drop=la goccia d'acqua; eye=l'occhio; ear=l'orecchio; nose=il naso; mouth=la bocca;
    hand=la mano; foot=il piede; tooth=il dente; lion=il leone; tiger=la tigre; elephant=l'elefante; monkey=la scimmia; bear=l'orso;
    giraffe=la giraffa; zebra=la zebra; panda=il panda; snake=il serpente; turtle=la tartaruga; crocodile=il coccodrillo;
    kangaroo=il canguro; hippo=l'ippopotamo; gorilla=il gorilla; rhino=il rinoceronte; butterfly=la farfalla; bee=l'ape;
    ladybug=la coccinella; spider=il ragno; ant=la formica; snail=la lumaca; dolphin=il delfino; whale=la balena; octopus=il polpo;
    crab=il granchio; shark=lo squalo; owl=il gufo; penguin=il pinguino; parrot=il pappagallo; flamingo=il fenicottero; peacock=il pavone;
    eagle=l'aquila; swan=il cigno; hat=il cappello; shoe=la scarpa; dress=il vestito; cap=il cappellino; socks=i calzini;
    gloves=i guanti; tshirt=la maglietta; glasses=gli occhiali; umbrella=l'ombrello; pencil=la matita; spoon=il cucchiaio;
    scissors=le forbici; hammer=il martello; ladder=la scala; broom=la scopa; bottle=il biberon; toothbrush=lo spazzolino;
    guitar=la chitarra; drum=il tamburo; piano=il pianoforte; violin=il violino; trumpet=la tromba; helicopter=l'elicottero;
    tractor=il trattore; rocket=il razzo; ambulance=l'ambulanza; motorbike=la moto; fire_engine=il camion dei pompieri;
    police_car=la macchina della polizia; scooter=il monopattino; sled=la slitta; llama=il lama; goat=la capra; camel=il cammello;
    hedgehog=il riccio; squirrel=lo scoiattolo; bat=il pipistrello; deer=il cervo; wolf=il lupo; fox=la volpe; raccoon=il procione;
    beaver=il castoro; otter=la lontra; sloth=il bradipo; skunk=la puzzola; bison=il bisonte; castle=il castello; tent=la tenda;
    lighthouse=il faro; volcano=il vulcano; island=l'isola; anchor=l'ancora; magnet=la calamita; compass=la bussola;
    microscope=il microscopio; telescope=il telescopio; hourglass=la clessidra; jellyfish=la medusa; seal=la foca;
    lobster=l'aragosta; shrimp=il gambero; squid=il calamaro; oyster=l'ostrica; beetle=lo scarabeo; cricket=il grillo;
    mosquito=la zanzara; worm=il verme; scorpion=lo scorpione; rooster=il gallo; turkey=il tacchino; donkey=l'asino; ox=il bue;
    leopard=il leopardo; polar_bear=l'orso polare; koala=il koala; orangutan=l'orango; mammoth=il mammut; moose=l'alce;
    badger=il tasso; avocado=l'avocado; eggplant=la melanzana; garlic=l'aglio; onion=la cipolla; pepper=il peperoncino;
    cucumber=il cetriolo; potato=la patata; mushroom=il fungo; peanuts=le arachidi; croissant=il cornetto; pancakes=i pancake;
    honey=il miele; spaghetti=gli spaghetti; fries=le patatine fritte; sandwich=il panino; candle=la candela; mirror=lo specchio;
    window=la finestra; bucket=il secchio; bell=la campana; lock=il lucchetto; light_bulb=la lampadina; flashlight=la torcia;
    axe=l'ascia; saw=la sega; wrench=la chiave inglese; screwdriver=il cacciavite; paintbrush=il pennello; crayon=il pastello;
    trophy=la coppa; medal=la medaglia; ring=l'anello; skateboard=lo skateboard; yoyo=lo yo-yo; roller_skate=il pattino;
    canoe=la canoa; tram=il tram; parachute=il paracadute; satellite=il satellite; brain=il cervello; bone=l'osso;
    tongue=la lingua; leg=la gamba; tornado=il tornado; lightning=il fulmine; comet=la cometa; cactus=il cactus;
    blossom=il fiore di ciliegio; feather=la piuma`),

  // ---- Mon pays ----
  "lang.ko": "coreano", "lang.ne": "nepalese",
  "lang.vi": "vietnamita", "lang.tr": "turco", "lang.fa": "persiano", "lang.pl": "polacco", "lang.uk": "ucraino",
  "lang.id": "indonesiano",
  "country.cd": "RD del Congo",
  "title.MO-6": "Il mondo — Il mio paese",
  "l.home.MO-6": ["La mappa: domande sul tuo paese!"],
  "l.intro.MO-6": ["Parliamo del tuo paese! Ascolta bene e tocca l'immagine giusta.", "Conosci bene il tuo paese? Ti faccio delle domande!"],
  "l.short.MO-6": ["Una domanda sul tuo paese!"],
  "cty.flag": "Qual è la bandiera di {country}?",
  "cty.flagHard": "Attenzione, si somigliano! Qual è la bandiera di {country}?",
  "cty.flagYes": "Sì! È la bandiera di {country}!",
  "cty.flagHint": "guarda bene i colori e in che ordine sono",
  "cty.symbol": "Qual è un simbolo di {country}?",
  "cty.symbolYes": "Sì! È un simbolo di {country}!",
  "cty.symbolYesName": "Sì! {name} è un simbolo di {country}!",
  "cty.food": ["Qual è una specialità di {country}?", "Cosa si mangia volentieri in {country}?"],
  "cty.foodYes": "Gnam! È una specialità di {country}!",
  "cty.day": "Il {date} è la festa nazionale di {country}! Cosa guardiamo nel cielo la sera?",
  "cty.dayYes": "Sì! Il {date} ci sono grandi fuochi d'artificio!",
  "cty.currency": "Con quali soldi si paga in {country}?",
  "cty.currencyYes": "Sì! In {country} si paga con: {money}!",
  "cty.place": "Quale luogo famoso si vede in {country}?",
  "cty.sport": "Quale sport piace tanto in {country}?",
  "cty.thing": "Cosa si vede spesso alle feste in {country}?",
  "cty.landmarkYes": "Sì! Bravo, conosci bene il tuo paese!",
  "cty.capital": "Qual è la capitale di {country}? Leggi bene i nomi delle città!",
  "cty.capitalYes": "Sì! La capitale di {country} è {city}!",
  "cty.neighbour": "Quale di queste bandiere è di un paese vicino di {country}?",
  "cty.neighbourYes": "Sì! Questo paese è proprio accanto a {country}!",
  "cty.neighbourHint": "i vicini sono molto vicini, sullo stesso continente",
};

export default it;
