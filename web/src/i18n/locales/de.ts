import type { Catalog } from '../index';
import { kv } from '../kv';

/** Deutsch (zweite Sprache: Englisch). Bildwörter im Nominativ, Sätze ohne Fallwechsel. */
const de: Catalog = {
  ...kv('lang', 'fr=Französisch; en=Englisch; es=Spanisch; it=Italienisch; de=Deutsch; pt=Portugiesisch; ru=Russisch; zh=Chinesisch; hi=Hindi; ar=Arabisch; ur=Urdu; bn=Bengalisch'),
  ...kv('country', 'fr=Frankreich; be=Belgien; ch=Schweiz; ca=Kanada; lu=Luxemburg; gb=Vereinigtes Königreich; us=Vereinigte Staaten; es=Spanien; mx=Mexiko; it=Italien; de=Deutschland; at=Österreich; pt=Portugal; br=Brasilien; ru=Russland; cn=China; in=Indien; eg=Ägypten; ma=Marokko; sa=Saudi-Arabien; pk=Pakistan; bd=Bangladesch'),

  'ui.loading': 'Wird geladen…',
  'ui.rotate': 'Dreh das Tablet!',
  'ui.tap': 'Tippe auf den Bildschirm, um zu spielen!',
  'ui.retry': 'Nochmal versuchen',
  'ui.problem': 'Problem: {reason}',
  'ui.cancel': 'Abbrechen',
  'ui.skip': 'Überspringen', 'ui.home.play': 'Spielen', 'ui.home.missions': 'Missionen', 'ui.home.mydino': 'Mein Dino', 'ui.home.settings': 'Einstellungen', 'ui.end.again': 'Nochmal', 'ui.home.playWith': 'Spiel mit deinem Dino, {name}!',
  'ui.home.learn': 'Lerne und spiele mit deinem Dino!',
  'ui.home.summary': '{n} Runden gespielt. Dein Dino wächst mit dir!',
  'ui.home.sleeping': 'Pssst… der Dino schläft.\nEin Elternteil kann ihn mit seinem Code entsperren.',
  'ui.home.timeUp': 'Die Spielzeit ist vorbei.\nEin Elternteil kann sie mit seinem Code entsperren.',
  'ui.child.title': 'Wie heißt das Kind?',
  'ui.child.sub': 'Der Dino ruft es beim Vornamen.',
  'ui.parents.title': 'Elternbereich',
  'ui.pin.type': 'Gib deinen Eltern-Code ein.',
  'ui.pin.title': 'Eltern-Code',
  'ui.pin.choose': 'Wähle einen 4-stelligen Code.',
  'ui.wardrobe.title': 'Mein Dino – Kleiderschrank',
  'ui.wardrobe.reactions': ['Wie toll!', 'Das gefällt mir!', 'Sehe ich gut aus!', 'Wie schick!'],
  'ui.choose.voice': 'Laut sprechen',
  'ui.choose.voiceTitle': 'Spiel mit deiner Stimme!',
  'ui.choose.title': 'Wähle ein Spiel!',
  'ui.end.3': 'Bravo!', 'ui.end.2': 'Super!', 'ui.end.1': 'Gut gemacht!', 'ui.end.0': 'Weiter so!',
  'ui.end.done': 'Du hast die Runde geschafft!',
  'ui.time.unlimited': 'Unbegrenzt', 'ui.time.less': 'Weniger Zeit', 'ui.time.more': 'Mehr Zeit',
  'ui.lang': 'Sprache', 'ui.langLabel': 'Sprache:', 'ui.mb': '{n} MB',
  'ui.pack.voice': 'Paket {language}', 'ui.pack.asr': 'Spracherkennung',
  'ui.pack.stalled': 'Der Download kommt nicht voran. Bitte Verbindung prüfen.',
  'ui.pack.downloading': 'Wird heruntergeladen: {list}', 'ui.pack.installing': 'Spracherkennung wird installiert',
  'ui.pack.speechTitle': 'Stimme des Dinos ({language})', 'ui.pack.speechDetail': 'Eine natürliche Stimme, auf jedem Gerät gleich.',
  'ui.pack.secondTitle': 'Stimme {language}', 'ui.pack.secondDetail': 'Für die Wörter in den Fremdsprachen-Spielen.',
  'ui.pack.asrTitle': 'Spracherkennung', 'ui.pack.asrDetail': 'Um laut zu antworten.',
  'ui.pack.download': 'Herunterladen', 'ui.pack.installed': 'Installiert ✓',
  'ui.pack.toDownload': 'Herunterzuladen: {n} MB (am besten im WLAN).', 'ui.pack.allInstalled': 'Alles ist installiert.',
  'ui.pack.running': 'Wird heruntergeladen…', 'ui.pack.finished': 'Fertig.', 'ui.pack.failed': 'Fehler: {error}',
  'ui.pack.installingShort': 'Wird installiert…', 'ui.pack.waiting': 'Wartet…',
  'voice.heard': 'Ich habe gehört: {word}.',

  ...kv('p', `title=Elternbereich; back=Zurück zum Spiel; noName=Ohne Namen; addChild=+ Kind hinzufügen; newChild=Neues Kind;
    newChildHelp=Wenn du den Elternbereich verlässt, tippt das neue Kind auf sein Ei, damit sein eigener Dino schlüpft.;
    cancel=Abbrechen; edit=✏️ Profil bearbeiten; sheetOf=Profil von {name}; sheet=Profil des Kindes; sheetHelp=Vorname, Alter und Einstellungen.;
    removeChild={name} löschen; thisChild=dieses Kind;
    removeConfirm={name}, den Dino und alle Fortschritte löschen? Das kann nicht rückgängig gemacht werden.;
    egg=Ei noch nicht geschlüpft; dino=Dino; alternateAria=Abwechselnd zwischen den Kindern; age={n} Jahre; otherCountry=anderes Land;
    series=gespielte Runden; answers=Antworten; firstTry=beim ersten Versuch; today=heute gespielt;
    childrenHelp=Jedes Kind hat seinen eigenen Dino, seine Fortschritte und Einstellungen. Die Einstellungen unten gelten für das ausgewählte Kind.;
    alternate=Abwechseln: nach jeder Runde ist das nächste Kind dran;
    difficulty=Anfangsschwierigkeit der Spiele: {n} von 20 ({stage}). Danach passt sie sich den Ergebnissen an.;
    stageCP=1. Klasse; stageK=Kindergarten; dinoLevel=Dino-Stufe;
    dinoLevelHelp=Der Dino wächst, wenn das Kind ihn füttert (Stufe 1 bis {max}). Du kannst sie ändern, um die Schwierigkeit anzupassen: Die Stufen 21 bis 40 entsprechen der 1. Klasse.;
    noNight=Kein Nachtmodus; week=Spielzeit der letzten 7 Tage; daily=Spielzeit pro Tag;
    dailyHelp=Wenn die Zeit um ist, beendet das Kind die Runde, dann ist das Spiel bis zum nächsten Tag gesperrt: Der Dino geht schlafen. Mit deinem Code kannst du 15 oder 30 Minuten hinzufügen oder den Tag freigeben.;
    night=Schlafenszeit (Nachtmodus);
    nightHelp=Ab dieser Uhrzeit wird der Himmel dunkel und der Dino gähnt: Er schlägt eine letzte Runde vor und schläft dann bis zum Morgen. Mit deinem Code kann das Kind an diesem Abend noch etwas spielen.;
    enable={game} aktivieren; levelOf=Stufe von {game}; levelAuto=Automatische Stufe; level=Stufe {n}; fromAge=Ab {n} Jahren;
    needsVoice=Sprechspiel: Erlaube das Mikrofon und lade die Spracherkennung {language} herunter (Abschnitt „Stimmen und Downloads“).;
    nAnswers={n} Antworten; notPlayed=Noch nicht gespielt; rate={rate} beim ersten Versuch; mastered={n} / {total} Fragen gelernt;
    lastPlayed=zuletzt gespielt am {date}; chooseAria=Taste zum Auswählen eines Spiels; games=Spiele;
    choose=Taste „Spiel wählen“ auf dem Startbildschirm;
    chooseHelp=Ausgeschaltet spielt das Kind mit dem Planeten: Jede Runde mischt alle Spiele für sein Alter. Eingeschaltet kann es auch ein bestimmtes Spiel wählen (und die Sprechspiele, die nicht mit den anderen gemischt werden).;
    gamesHelp=Schalte ein Spiel aus, damit es nicht mehr angeboten wird. Die Stufe (1 bis 20; 11 bis 20 = 1. Klasse) ist der Start der nächsten Runde; „auto“ berechnet sie aus Alter, Dino und Ergebnissen.;
    reviewToday=heute zu wiederholen; reviewTomorrow=kommt morgen wieder; reviewOn=kommt am {date} wieder; reviewN=Wiederholung {n} von {total};
    review=Zum Üben;
    reviewHelp=Eine falsch beantwortete Frage kommt am nächsten Tag wieder, dann nach 3 Tagen, dann nach einer Woche. Dreimal richtig: gelernt; falsch: es geht am nächsten Tag von vorne los.;
    reviewNone=Im Moment gibt es nichts zu wiederholen. Bravo!; sfxAria=Soundeffekte; musicAria=Hintergrundmusik; testVoice=Stimme testen;
    testHello=Hallo! Ich bin Dino.; sound=Ton und Stimme; sfx=Soundeffekte (richtige Antworten, Fehler, mampf…);
    music=Sanfte Hintergrundmusik (das Kind kann sie auch auf dem Startbildschirm ausschalten);
    phoneVoices=Hauptstimme: {main} · Stimme der zweiten Sprache: {second}. Diese Stimmen kommen vom Telefon: Für eine natürlichere Stimme installiere eine „erweiterte“ oder „Premium“-Stimme in den Bedienungshilfen (Sprachausgabe).;
    noVoice=keine gefunden; mic=Mikrofon (Sprechspiele);
    micHelp=In den Sprechspielen antwortet das Kind mit der Stimme: Es benennt Bilder, sagt Wörter in der zweiten Sprache und löst Rechenaufgaben. Alles bleibt auf diesem Gerät: Die Stimme wird nie aufgenommen oder gesendet. Das Mikrofon geht nur an, wenn das Kind auf die große Mikrofontaste tippt. Diese Fragen werden mit den anderen gemischt, wenn das Kind auf den Planeten tippt.;
    noMic=Dieser Browser erlaubt das Mikrofon im Spiel nicht.; allowMic=Mikrofon erlauben;
    allowMicNow=Erlaube das Mikrofon im Browserfenster…;
    micBlocked=Das Mikrofon ist blockiert. Erlaube es in den Browsereinstellungen (Schloss neben der Adresse) und versuche es noch einmal.;
    packsWhere=Die Spracherkennungspakete werden im Abschnitt „Stimmen und Downloads“ heruntergeladen.;
    removePacks=Pakete löschen;
    removePacksConfirm=Die Spracherkennungspakete von diesem Gerät löschen? Die Sprechspiele werden dann nicht mehr angeboten.;
    packs=Stimmen und Downloads;
    packsHelp=Die Sprache des Spiels, die natürliche Stimme des Dinos (auf dem Gerät erzeugt, nach dem Download ohne Internet), die Stimme für die Fremdsprachen-Spiele und die Spracherkennung. Die Downloads laufen parallel weiter, auch wenn du diesen Bereich schließt. Ohne Dino-Stimme nutzt das Spiel die Stimme des Telefons.;
    changeCode=Code ändern; newCode=Neuer Eltern-Code; newCodeHelp=Wähle einen neuen 4-stelligen Code.;
    codeChanged=Der Eltern-Code wurde geändert.; code=Eltern-Code;
    codeHelp=Der Code öffnet diesen Bereich und entsperrt das Spiel, wenn die Tageszeit um ist. Wenn du ihn vergisst, kannst du mit „Code vergessen?“ nach einer Frage für Erwachsene einen neuen erstellen.;
    reset=Neu beginnen; resetConfirm=Alle Fortschritte löschen (Dino-Stufe, Antworten, Obst)? Die Einstellungen bleiben.;
    privacy=Datenschutzerklärung; close=Schließen; data=Daten;
    dataHelp=Alles wird nur auf diesem Gerät gespeichert. Es werden nie Daten gesendet.`),

  ...kv('pin', `erase=Löschen; remember=Merk ihn dir gut.; forgot=Code vergessen?;
    adultQuestion=Frage für Erwachsene: Wie viel ist {a} × {b}? (3 Ziffern); cancel=Abbrechen; wrongAnswer=Das stimmt nicht.;
    newCode=Neuer Eltern-Code; newCodeHelp=Wähle einen neuen 4-stelligen Code.; wrongCode=Falscher Code.;
    otherCountry=Anderes Land; firstName=Vorname;
    micHtml=<b>Mikrofon erlauben</b> (Sprechspiele)<br><small>Alles bleibt auf diesem Gerät: Die Stimme wird nie aufgenommen oder gesendet.</small>;
    missionsHtml=<b>Missionen wählen</b><br><small>Das Kind kann seine Spiele wählen (Taste „Missionen“). Ohne Haken: nur zufällige Runden mit „Spielen“.</small>;
    ok=OK; nameMissing=Schreib den Vornamen des Kindes.; age=Alter; years={n} Jahre; country=Land; daily=Spielzeit pro Tag;
    night=Schlafenszeit (Nachtmodus); none=Keine; welcome=Willkommen, liebe Eltern!;
    welcomeHeard=Das hat dein Kind dem Dino erzählt: Korrigiere es bei Bedarf. Du kannst weitere Kinder hinzufügen und alles im Elternbereich ändern (Schloss auf dem Startbildschirm).;
    welcomeHelp=Vorname, Alter und Einstellungen deines Kindes. Du kannst weitere Kinder hinzufügen und alles im Elternbereich ändern (Schloss auf dem Startbildschirm).;
    yourCode=Dein Eltern-Code;
    yourCodeHelp=Wähle einen 4-stelligen Code. Er öffnet den Elternbereich (Schloss auf dem Startbildschirm) und entsperrt das Spiel, wenn die Tageszeit um ist. Verrate ihn deinem Kind nicht!;
    asleep=Der Dino schläft; asleepHelp=Es ist Schlafenszeit. Gib den Eltern-Code ein, um heute Abend noch etwas zu spielen.;
    timeUp=Die Spielzeit ist vorbei; timeUpHelp=Gib den Eltern-Code ein, um heute Spielzeit hinzuzufügen.;
    addTime=Zeit hinzufügen; todayOnly=Nur für heute.; plus15=15 Minuten mehr; plus30=30 Minuten mehr; unlimited=Heute unbegrenzt`),

  ...kv('inst', `title=DinoLearn auf dem Handy installieren; later=Später; okay=OK; never=Nicht mehr fragen;
    android=Es öffnet sich im Vollbild und im Querformat, wie eine echte App. Sonst gibt es nichts herunterzuladen.;
    menu=Im Browsermenü:;
    androidSteps=<li>Tippe auf <b>⋮</b> (die drei Punkte oben rechts).</li><li>Wähle <b>„App installieren“</b> oder <b>„Zum Startbildschirm hinzufügen“</b>.</li><li>Öffne das Spiel über das Dino-Symbol.</li>;
    ios=Es öffnet sich im Vollbild, ohne die Leisten von Safari, wie eine echte App.;
    iosSteps=<li>Tippe auf {share} <b>Teilen</b> (unten oder oben in Safari).</li><li>Wähle <b>„Zum Home-Bildschirm“</b> und dann <b>Hinzufügen</b>.</li><li>Öffne das Spiel über das Dino-Symbol.</li>`),

  ...kv('title', `EN-1=Englisch — Hören und tippen; EN-2=Englisch — Zahlen; EN-3=Englisch — Memory; MO-1=Die Welt — Zeig mal;
    MO-3=Die Welt — Schatten; MO-4=Die Welt — Was passt zusammen; MO-5=Die Welt — Das Größte; LO-1=Logik — Was passt nicht;
    LO-2=Logik — Wie viele?; LO-3=Logik — Was kommt danach; LO-4=Logik — Mehr und weniger; LO-5=Logik — Rechnen;
    LO-6=Logik — Zahlen; LO-7=Logik — Formen und Farben; LO-8=Logik — Die Uhrzeit; LO-9=Logik — Geld;
    LO-10=Logik — Memory; LO-11=Logik — Hören und rechnen; TR-1=Schreiben — Formen nachfahren;
    TR-2=Schreiben — Buchstaben und Zahlen nachfahren; VO-1=Laut — Wie heißt das?; VO-2=Laut — Sag es auf Englisch!;
    VO-13=Laut — Rechnen`),

  ...kv('item', `top-hat=der Zylinder; billed-cap=die Kappe; crown=die Krone; womans-hat=der Strohhut;
    graduation-cap=der Doktorhut; rescue-workers-helmet=der Feuerwehrhelm; headphone=die Kopfhörer; hibiscus=die Blume;
    glasses=die Brille; sunglasses=die Sonnenbrille; goggles=die Taucherbrille; ribbon=die Fliege; swim-ring=der Schwimmring;
    sports-medal=die Medaille; prayer-beads=die Halskette; cape-red=der Superheldenumhang; cape-blue=der Zauberumhang; wing=die Flügel;
    balloon=der Luftballon; magic-wand=der Zauberstab; lollipop=der Lutscher; sunflower=die Sonnenblume; teddy-bear=der Teddybär`),
  ...kv('dinocolor', '0=grünes; 1=blaues; 2=lila; 3=rosa; 4=oranges; 5=gelbes; 6=türkises; 7=rotes; 8=braunes'),

  ...kv('cat', `farm=ein Bauernhoftier; sea=ein Meerestier; bird=ein Vogel; bug=ein Krabbeltier; wild=ein wildes Tier;
    forest=ein Waldtier; fruit=ein Obst; veg=ein Gemüse; meal=etwas zum Essen; vehicle=ein Fahrzeug; toy=ein Spielzeug;
    home=etwas aus dem Haus; clothes=etwas zum Anziehen; tool=ein Werkzeug; kitchen=ein Gegenstand für jeden Tag;
    music=ein Musikinstrument; sky=etwas am Himmel; plant=eine Pflanze; body=ein Körperteil; landscape=ein Ort;
    color=eine Farbe; element=etwas aus der Natur`),
  ...kv('fam', `farm=Bauernhoftiere; sea=Meerestiere; bird=Vögel; bug=Krabbeltiere; wild=wilde Tiere; forest=Waldtiere;
    fruit=Obst; veg=Gemüse; meal=Essen und Leckereien; vehicle=Fahrzeuge; toy=Spielsachen; home=Dinge aus dem Haus;
    clothes=Kleidung; tool=Werkzeuge; kitchen=Dinge aus Bad und Küche; music=Musikinstrumente; sky=Dinge am Himmel und Wetter;
    plant=Pflanzen; body=Körperteile; landscape=Orte; color=Farben; element=Dinge aus der Natur`),
  ...kv('fruit', `red-apple=Apfel; banana=Banane; strawberry=Erdbeere; cherries=Kirschen; grapes=Trauben; tangerine=Orange;
    pear=Birne; lemon=Zitrone; watermelon=Wassermelone; peach=Pfirsich; pineapple=Ananas; kiwi-fruit=Kiwi; mango=Mango;
    blueberries=Blaubeeren; melon=Melone; green-apple=grüner Apfel; coconut=Kokosnuss`),
  ...kv('many', `food-red-apple=Äpfel; food-banana=Bananen; food-strawberry=Erdbeeren; food-pear=Birnen; food-lemon=Zitronen;
    food-tangerine=Orangen; food-kiwi-fruit=Kiwis; food-peach=Pfirsiche`),

  'g.hintFamily': 'Tipp: Es ist {family}.',
  'g.word': '{word}!',
  'g.yesWord': ['Ja, {word}!', 'Genau, {word}!'],
  'g.yesItIs': 'Ja, das ist {word}!',
  'g.hint': 'Tipp: {hint}.',
  'g.hintTens': 'Tipp: Schau zuerst auf die erste Ziffer, die Zehner.',
  'g.plus': '{a} plus {b}', 'g.minus': '{a} minus {b}',
  'g.calcPrompt': ['Wie viel ist {calc}?', '{calc}, wie viel ist das?'],
  'g.calcYes': 'Ja! {calc} ist {n}!',
  'g.hintAdd': 'Tipp: Fang bei {a} an und zähl noch {b} an den Fingern weiter.',
  'g.hintSub': 'Tipp: Fang bei {a} an und zähl {b} an den Fingern zurück.',
  'MO-1.prompt': ['Wo ist {word}?', 'Tippe auf das Bild: {word}!', 'Findest du es? {word}!', 'Such das Bild: {word}!'],
  'LO-1.prompt': ['Was passt nicht dazu? Welches Bild gehört nicht zur Familie?', 'Welches Bild ist anders als die anderen?'],
  'LO-1.yes': 'Ja, {word}! Die anderen sind {family}.',
  'LO-1.hint': 'Tipp: {n} Bilder sind {family}. Such das, das nicht dazugehört.',
  'LO-2.prompt': ['Wie viele {things} sind es? Zähl gut!', 'Zähl die {things}. Wie viele sind es?'],
  'LO-2.promptMixed': 'Wie viele {things} sind es? Achtung, zähl nur die {things}!',
  'LO-2.yes': '{list}. Das sind {n}!',
  'LO-2.hint': 'Tipp: Tippe jedes Obst mit dem Finger an und zähl langsam.',
  'LO-2.hintBig': 'Tipp: Zähl zuerst bis zehn und dann weiter: elf, zwölf, dreizehn…',
  'MO-3.prompt': ['Wessen Schatten ist das? Tippe auf das richtige Bild!', 'Wer versteckt sich hinter diesem Schatten?'],
  'LO-3.prompt': ['Schau dir die Reihe gut an. Welches Obst kommt danach?', 'Welches Obst setzt die Reihe fort?'],
  'LO-3.yes': 'Ja! {list}!',
  'LO-3.hint': 'Tipp: Die Reihe fängt immer gleich wieder an. {list}…',
  'LO-3.numPrompt': 'Schau und hör zu: {list}. Welche Zahl kommt danach?',
  'LO-3.numYes': 'Ja! {list}, {n}!',
  'LO-3.hintGrow': 'Tipp: Wir zählen eins dazu, dann zwei, dann drei… und dann?',
  'LO-3.hintPlus': 'Tipp: Wir zählen jedes Mal {n} dazu.',
  'LO-3.hintMinus': 'Tipp: Wir nehmen jedes Mal {n} weg.',
  'LO-4.num.most': 'Tippe auf die größte Zahl!', 'LO-4.num.least': 'Tippe auf die kleinste Zahl!',
  'LO-4.numYes.most': 'Ja! {n} ist die größte!', 'LO-4.numYes.least': 'Ja! {n} ist die kleinste!',
  'LO-4.numHint.most': 'Tipp: Beim Zählen kommt die größte zuletzt.',
  'LO-4.numHint.least': 'Tipp: Beim Zählen kommt die kleinste zuerst.',
  'LO-4.pile.most': 'Wo sind die meisten {things}? Tippe auf die richtige Karte!',
  'LO-4.pile.least': 'Wo sind die wenigsten {things}? Tippe auf die richtige Karte!',
  'LO-4.pileYes.most': 'Ja! Hier sind es {n}. Das sind die meisten!',
  'LO-4.pileYes.least': 'Ja! Hier sind es {n}. Das sind die wenigsten!',
  'LO-4.pileHint.least': 'Tipp: Such die Karte mit ganz wenig Obst.',
  'LO-4.pileHint.most': 'Tipp: Such die vollste Karte.',
  'LO-5.compl': '{a} plus wie viel ist {b}?',
  'LO-5.complYes': 'Ja! {a} plus {x} ist {b}!',
  'LO-5.complHint': 'Tipp: Zähl an den Fingern von {a} bis {b}.',
  'LO-5.add': 'Schau, {a} {things}. Ich lege noch {b} dazu. Wie viele sind es zusammen?',
  'LO-5.eat': 'Schau, {a} {things}. Dino isst {b} davon. Wie viele bleiben übrig?',
  'LO-5.addHint': 'Tipp: Zähl alles Obst, links und rechts.',
  'LO-5.eatHint': 'Tipp: Zähl nur das Obst, das nicht durchgestrichen ist.',
  'LO-11.prompt': ['Hör gut zu: {calc}. Wie viel ist das?', 'Wie viel ist {calc}?', 'Im Kopf: {calc}. Tippe auf die Antwort!'],
  'VO-13.prompt': ['Wie viel ist {calc}? Sag es mir!', '{calc}, wie viel ist das? Sag es mir!'],
  'VO-13.repeat': 'Hör zu: {calc} ist {n}. Jetzt sag du es!',
  'VO-13.fallback': '{calc}, wie viel ist das? Tippe auf die richtige Zahl!',
  'MO-4.prompt': ['Schau: {word}. Was passt dazu?', 'Hier ist {word}. Was gehört dazu?'],
  'MO-4.yes': 'Ja, {a} und {b} gehören zusammen!',
  'MO-4.hint': 'Tipp: Denk an das Bild: {word}. Was sieht man oft dabei?',
  'MO-5.prompt.big': ['In echt: Was ist am größten?', 'Tippe auf das, was in echt am größten ist!'],
  'MO-5.prompt.small': ['In echt: Was ist am kleinsten?', 'Tippe auf das, was in echt am kleinsten ist!'],
  'MO-5.yes.big': 'Ja! In echt ist {word} am größten!',
  'MO-5.yes.small': 'Ja! In echt ist {word} am kleinsten!',
  'MO-5.hint': 'Tipp: Auf den Bildern sind alle gleich groß. Stell sie dir in echt vor, neben dir!',
  'LO-6.prompt': ['Tippe auf die Zahl {n}!', 'Wo ist die Zahl {n}?', 'Finde die {n}!'],
  'LO-6.yes': 'Ja! Das ist die {n}!',
  'LO-6.hint': 'Tipp: Zähl an den Fingern bis {n} und such diese Zahl.',
  'LO-6.hintBig': 'Tipp: Schau dir die erste Ziffer gut an, dann die zweite.',
  'EN-2.hint': 'Tipp: Zähl auf Englisch an den Fingern und hör auf, wenn du die richtige Zahl hörst.',
  'LO-7.shape': 'Wo ist {shape}?',
  'LO-7.color': 'Wo ist die Form in {color}?',
  'LO-7.both': 'Wo ist {shape} in {color}?',
  'LO-7.yes.shape': 'Ja, {shape}!',
  'LO-7.yes.color': 'Ja, die Form in {color}!',
  'LO-7.yes.both': 'Ja, {shape} in {color}!',
  'LO-7.hint.color': 'Tipp: Schau nur auf die Farbe, die Form ist egal.',
  'LO-7.hint.both': 'Tipp: Such zuerst die richtige Farbe, dann schau dir die Form gut an.',
  ...kv('shape', 'circle=der Kreis; square=das Quadrat; triangle=das Dreieck; star=der Stern; heart=das Herz; rectangle=das Rechteck; diamond=die Raute; oval=das Oval; hexagon=das Sechseck; cross=das Kreuz'),
  ...kv('clue', `circle=der Kreis ist ganz rund und hat keine Ecken; square=das Quadrat hat vier gleich lange Seiten;
    triangle=das Dreieck hat drei Seiten und drei Spitzen; star=der Stern hat fünf Zacken;
    heart=das Herz hat oben zwei Bögen und unten eine Spitze; rectangle=das Rechteck hat vier Seiten, zwei lange und zwei kurze;
    diamond=die Raute ist wie ein Quadrat, das auf der Spitze steht; oval=das Oval ist ein langgezogener Kreis;
    hexagon=das Sechseck hat sechs Seiten; cross=das Kreuz hat vier Arme`),
  ...kv('color', 'red=Rot; blue=Blau; green=Grün; yellow=Gelb; orange=Orange; purple=Lila; pink=Rosa'),
  'time.0': '{h} Uhr', 'time.30': 'halb {next}', 'time.15': 'Viertel nach {h}', 'time.45': 'Viertel vor {next}',
  'time.m': '{h} Uhr {m}', 'time.24': '{h} Uhr {mm}',
  'LO-8.prompt': ['Tippe auf die Uhr, die {time} zeigt!', 'Wo ist es {time}?'],
  'LO-8.yes': 'Ja! Es ist {time}!',
  'LO-8.hint': 'Tipp: Der kurze Zeiger zeigt die Stunde, der lange die Minuten.',
  'LO-8.hintHard': 'Tipp: Schau zuerst auf den kurzen Zeiger für die Stunde, dann auf den langen für die Minuten.',
  'money.e1': 'ein Euro', 'money.e': '{e} Euro', 'money.c1': 'ein Cent', 'money.c': '{c} Cent', 'money.ec': '{e} Euro {c}',
  'LO-9.prompt': ['Tippe auf die Karte mit {money}!', 'Wo sind genau {money}?'],
  'LO-9.yes': 'Ja! Das sind {money}!',
  'LO-9.hint': 'Tipp: Zähl zuerst die Scheine und großen Münzen, dann die kleinen dazu.',
  'TR.dots': ['Fahr die gepunktete Linie nach!', 'Fahr mit dem Finger über die Punkte!'],
  'TR.faint': 'Zeichne es, indem du den kleinen Punkten folgst.',
  'TR.free': ['Jetzt zeichne es ganz allein, wie die Vorlage!', 'Du bist dran: zeichne es ohne Punkte!'],
  'TR.yes': ['Bravo! Wunderschön!', 'Super!', 'Was für ein schönes Bild!'],
  'TR.hint': 'Schau, ich zeig es dir! Fang beim grünen Punkt Nummer eins an.',
  'LO-10.prompt': ['Dreh zwei Karten um. Wenn sie gleich sind, gewinnst du das Paar!', 'Finde alle Paare!'],
  'LO-10.promptForeign': ['Dreh zwei Karten um und finde die Paare! Hör zu… auf Englisch!', 'Finde die Paare und hör dir die englischen Wörter an!'],
  'LO-10.yes': ['Bravo, du hast alle Paare gefunden!', 'Was für ein Gedächtnis! Alle Paare!'],
  'LO-10.hint': 'Merk dir, wo die Bilder sind, die du schon gesehen hast!',
  'VO-1.prompt': ['Wie heißt das?', 'Was ist das?', 'Sag mir, was das ist!'],
  'VO-1.repeat': 'Hör gut zu: {word}. Jetzt sag du es!',
  'VO-2.prompt': ['Schau: {word}! Auf {language} sagt man:', 'Das ist {word}. Auf {language} heißt das:'],
  'VO-2.yes': ['Bravo, gut gesagt!', 'Super, du sprichst Englisch!', 'Perfekt!'],
  'VO-2.repeat': 'Hör gut zu und sprich mir nach:',
  'VO-2.fallback': 'Tippe auf das Bild zum englischen Wort:',
  'l.handover': ['Bravo {current}! Jetzt ist {next} dran!', 'Danke {current}! {next}, du bist dran!'],
  'l.gift': ['Ich bin gewachsen! Such ein Geschenk für mich aus!', 'Ein Geschenk! Welches gibst du mir?'],
  'l.giftThanks': 'Oh, {item}! Danke!',

  ...kv('num', `0=null; 1=eins|ein|eine; 2=zwei; 3=drei; 4=vier; 5=fünf; 6=sechs; 7=sieben; 8=acht; 9=neun; 10=zehn; 11=elf;
    12=zwölf; 13=dreizehn; 14=vierzehn; 15=fünfzehn; 16=sechzehn; 17=siebzehn; 18=achtzehn; 19=neunzehn; 20=zwanzig`),

  'l.hello': ['Hallo {name}! Ich bin es, dein Dino!', 'Hallo {name}! Wir werden zusammen viel Spaß haben!'],
  'l.welcome_back': ['Du bist wieder da, {name}! Hurra!', 'Hallo {name}! Ich habe mich so auf dich gefreut!', 'Ah, da bist du ja! Spielen wir?',
    'Hurra, mein Freund ist da!'],
  'l.home.play': ['Tippe auf den grünen Knopf: Wir reisen um die Welt der Spiele!', 'Spielen wir? Tippe auf den grünen Knopf!'],
  'l.home.categories': ['Und um dein Spiel auszusuchen, tippe auf den kleinen Knopf.'],
  'l.random.go': ['Los geht’s!', 'Abflug! Einmal um die Welt!', 'Komm, wir spielen!', 'Achtung, fertig… los!'],
  'l.home.choose': ['Wähle ein Spiel! Tippe auf eine große Blase.'],
  'l.home.EN-1': ['Die Flagge: Wörter auf Englisch!'],
  'l.home.MO-1': ['Zeig mir die Dinge der Welt!'],
  'l.home.LO-1': ['Das Puzzle: Was passt nicht dazu?'],
  'l.home.LO-2': ['Der Rechenschieber: Wir zählen!'],
  'l.home.MO-3': ['Der Schatten: Wer ist das?'],
  'l.home.LO-3': ['Die Pfeile: Was kommt danach?'],
  'l.home.LO-4': ['Die Waage: Wo ist mehr?'],
  'l.home.LO-5': ['Die Zahlen: Wir rechnen!'],
  'l.home.LO-11': ['Das Ohr: Kopfrechnen!'],
  'l.home.VO-13': ['Das Mikrofon: Sag mir das Ergebnis!'],
  'l.home.EN-2': ['Die Zehn: Zahlen auf Englisch!'],
  'l.home.MO-4': ['Der Händedruck: Was passt zusammen?'],
  'l.home.MO-5': ['Das Lineal: Was ist in echt größer?'],
  'l.home.LO-6': ['Die Zahlen: Finde die richtige Zahl!'],
  'l.home.LO-10': ['Die Karten: Memory!'],
  'l.home.EN-3': ['Der Joker: Memory auf Englisch!'],
  'l.home.LO-7': ['Die Farbpalette: Formen und Farben!'],
  'l.home.LO-8': ['Der Wecker: Wie spät ist es?'],
  'l.home.LO-9': ['Der Geldschein: Wir zählen Geld!'],
  'l.home.TR-1': ['Der Stift: Wir fahren Formen nach!'],
  'l.home.TR-2': ['Die schreibende Hand: Wir schreiben Buchstaben und Zahlen!'],
  'l.intro.MIX': ['Hör dir jede Frage gut an!', 'Spitz die Ohren!', 'Bist du bereit? Ich schon!'],
  'l.short.EN-1': ['Auf Englisch!'],
  'l.short.MO-1': ['Zeig mal!'],
  'l.short.MO-3': ['Ein Schatten!'],
  'l.short.LO-1': ['Was passt nicht?'],
  'l.short.LO-2': ['Wir zählen!'],
  'l.short.LO-3': ['Was kommt danach?'],
  'l.short.LO-4': ['Mehr oder weniger!'],
  'l.short.LO-5': ['Eine Rechenaufgabe!'],
  'l.short.LO-11': ['Kopfrechnen!'],
  'l.short.VO-13': ['Sag mir das Ergebnis!'],
  'l.short.EN-2': ['Eine Zahl auf Englisch!'],
  'l.short.MO-4': ['Was passt zusammen?'],
  'l.short.MO-5': ['Am größten oder am kleinsten!'],
  'l.short.LO-6': ['Finde die Zahl!'],
  'l.short.LO-10': ['Memory!'],
  'l.short.EN-3': ['Memory auf Englisch!'],
  'l.short.LO-7': ['Formen und Farben!'],
  'l.short.LO-8': ['Wie spät ist es?'],
  'l.short.LO-9': ['Geld!'],
  'l.short.TR-1': ['Wir zeichnen nach!'],
  'l.short.TR-2': ['Wir schreiben!'],
  'l.home.level': ['Der Stern ist meine Stufe!'],
  'l.intro.EN-1': ['Ich sage ein Wort auf Englisch. Tippe auf das richtige Bild!'],
  'l.intro.MO-1': ['Hör gut zu und tippe auf das, was ich sage.', 'Wir reisen um die Welt! Finde, was ich sage.'],
  'l.intro.LO-1': ['Schau dir die Bilder gut an. Nur eins gehört nicht zur Familie: Finde es!'],
  'l.intro.LO-2': ['Wir zählen! Zähl das Obst und tippe auf die richtige Zahl.'],
  'l.intro.MO-3': ['Schau dir diesen schwarzen Schatten gut an. Finde heraus, wem er gehört!'],
  'l.intro.LO-3': ['Schau dir die Reihe gut an und finde, was danach kommt.'],
  'l.intro.LO-4': ['Schau dir die Karten gut an. Finde die, die ich sage!'],
  'l.intro.LO-11': ['Rechnen ohne Bilder! Hör gut zu, rechne im Kopf und tippe auf die richtige Zahl.'],
  'l.intro.VO-13': ['Ich sage dir eine Rechnung, und du sagst mir das Ergebnis! Wenn das Mikrofon erscheint, sag die Antwort.'],
  'l.intro.LO-5': ['Wir rechnen! Hör gut zu und tippe auf die richtige Zahl.', 'Rechenzeit! Du kannst an den Fingern zählen.'],
  'l.intro.EN-2': ['Ich sage eine Zahl auf Englisch. Tippe auf die richtige Zahl!'],
  'l.intro.MO-4': ['Manche Dinge gehören zusammen, wie Schlüssel und Schloss. Finde, was zusammenpasst!'],
  'l.intro.MO-5': ['Auf den Bildern ist alles gleich groß. Aber in echt? Finde das, was ich sage!'],
  'l.intro.LO-6': ['Ich sage eine Zahl. Finde sie unter den Karten!'],
  'l.intro.LO-10': ['Wir spielen Memory! Dreh zwei Karten um: Wenn die Bilder gleich sind, gewinnst du das Paar!'],
  'l.intro.EN-3': ['Memory auf Englisch! Wenn du eine Karte umdrehst, sage ich das Wort auf Englisch. Finde die Paare!'],
  'l.intro.LO-7': ['Wir spielen mit Formen und Farben! Hör gut zu und tippe auf die richtige Form.'],
  'l.intro.LO-8': ['Schau dir die Uhren gut an! Der kurze Zeiger zeigt die Stunde, der lange die Minuten.'],
  'l.intro.LO-9': ['Wir spielen Kaufladen! Zähl die Münzen und finde den richtigen Betrag.'],
  'l.intro.TR-1': ['Wir malen mit dem Finger! Fang beim grünen Punkt an und folge der gepunkteten Linie.'],
  'l.intro.TR-2': ['Wir lernen schreiben! Fang beim grünen Punkt Nummer eins an und folge der gepunkteten Linie.'],
  'l.trace.start': ['Leg den Finger auf den grünen Punkt und folge den kleinen Punkten.', 'Los, mal mit dem Finger!'],
  'l.trace.continue': ['Weiter, du hast es fast geschafft!', 'Es fehlt noch ein Stück. Weiter!'],
  'l.trace.retry': ['Fast! Wollen wir es löschen und neu anfangen?', 'Hoppla, das ist es noch nicht. Versuch es nochmal!'],
  'l.tutorial': ['Schau, ich zeig es dir! Man tippt auf das richtige Bild, so.'],
  'l.tutorial_your_turn': ['Jetzt bist du dran!'],
  'l.correct': ['Bravo {name}!', 'Super, {name}!', 'Genau!', 'Toll!', 'Klasse!', 'Jaaa!', 'Fantastisch!', 'Du bist ein Champion!',
    'Du bist ein Star!', 'Richtig!', 'Perfekt!', 'Wow!'],
  'l.wrong': ['Hoppla! Versuch es nochmal!', 'Hmm, schau genau hin…', 'Das nicht! Such weiter!', 'Fast! Noch einmal!', 'Macht nichts, versuch es nochmal!'],
  'l.hint': ['Ich helfe dir: Tippe auf das, was leuchtet!', 'Schau, es ist das, was ich dir zeige!'],
  'l.streak': ['Drei hintereinander! Du bist super!', 'Drei hintereinander! Unglaublich!'],
  'l.idle': ['Bist du da? Tippe auf eine Karte!', 'Ich warte auf dich! Tippe auf eine Karte.'],
  'l.touch_me': ['Wenn du es nochmal hören willst, tippe auf mich!'],
  'l.review_due': ['Das hatten wir schon zusammen. Weißt du es noch?', 'Eine Wiederholungsfrage! Ich bin sicher, du weißt es.'],
  'l.review': ['Du kannst schon alles! Wiederholen wir?'],
  'l.series_perfect': ['Wow, alles richtig! Du bist ein echter Star, {name}!', 'Kein einziger Fehler! Ich tanze vor Freude!'],
  'l.series_great': ['Unglaublich! Fast alles richtig!', 'Was für ein Talent, {name}!'],
  'l.series_good': ['Sehr gut gespielt! Du lernst schnell!', 'Bravo, du hast ganz viele gefunden!'],
  'l.series_ok': ['Gut gespielt! Üben wir weiter?', 'Gut! Jede Runde macht dich besser.'],
  'l.series_encourage': ['Das war schwer, oder? Ich lerne auch noch!', 'Macht nichts! Beim Spielen lernt man.',
    'Auch große Dinosaurier machen Fehler! Fangen wir nochmal an?'],
  'l.end.feed': ['Schau mal, ein Korb voll Obst! Tippe auf den Korb, um ihn mir zu geben.', 'Mmm! Gib mir den Korb: Tippe darauf!'],
  'l.end.nothing': ['Diesmal kein Obst. Spielen wir nochmal, um welches zu gewinnen?'],
  'l.end.again': ['Tippe auf den grünen Knopf, um nochmal zu spielen!'],
  'l.fly.visit': ['Schau, eine Fliege!', 'Ich mag Fliegen!'],
  'l.home.ambient': ['Ich glaube, der Vulkan bricht immer noch aus.', 'Ich habe ein bisschen Hunger.', 'Hilfst du mir beim Wachsen?',
    'Schau, wie die Wolken vorbeiziehen!'],
  'l.fly.caught': ['Schlürf! Eine Fliege!', 'Mmm, knusprig!', 'Erwischt!'],
  'l.fruit.won': ['Ein Obst für mich!', 'Mmm, ein Obst!'],
  'l.eating': ['Mampf mampf!', 'Knusper! Lecker!', 'Mmm, ist das gut!', 'Mehr, bitte!', 'Danke!'],
  'l.full': ['Mein Bauch ist ganz voll! Den Rest hebe ich mir auf.'],
  'l.level_up': ['Oh! Ich wachse! Danke, dass du dich so gut um mich kümmerst!', 'Schau, ich bin größer!'],
  'l.tickle': ['Hihi, das kitzelt!', 'Hahaha! Hör auf!', 'Oh nein, nicht kitzeln!'],
  'l.start': ['Tippe auf mich, um mich zu wecken!'],
  'l.parent_code': ['Bevor wir spielen, hol Mama oder Papa! Sie müssen einen Geheimcode für mich wählen.'],
  'l.parent_code_done': ['Danke! Jetzt können wir zusammen spielen!'],
  'l.wardrobe.intro': ['Zieh ein Teil auf mich, um es mir anzuziehen!', 'Zieh mich an! Nimm ein Teil mit dem Finger und leg es auf mich.'],
  'l.wardrobe.drag': ['Lass den Finger auf dem Teil und zieh es zu mir!'],
  'l.wardrobe.off': ['Gut, ich ziehe es aus!', 'Weg damit!'],
  'l.wardrobe.empty': ['Mein Kleiderschrank ist leer! Wenn ich wachse, gewinnst du ein Teil für mich.'],
  'l.home.wardrobe': ['Mit dem Hut kannst du mich anziehen!'],
  'l.gift.waiting': ['Ich bin gewachsen! Tippe auf das Geschenk, um ein Teil für mich auszusuchen.'],
  'l.gift.go': ['Ich bin gewachsen! Komm zu meinem Kleiderschrank: Ein Geschenk wartet auf dich!'],
  'l.wardrobe.new': ['Zieh es auf mich, um es mir anzuziehen!'],
  'l.wardrobe.take_off': ['Um mir ein Teil auszuziehen, zieh es von mir weg.'],
  'l.night.last': ['Oh, es wird spät… Eine letzte Runde, und dann ins Bett?', 'Uaaah… ich bin müde. Komm, eine allerletzte Runde!'],
  'l.night.goodnight': ['Das war die letzte Runde! Danke für diesen schönen Tag. Gute Nacht!'],
  'l.night.sleep': ['Pssst… ich schlafe. Zzz… Bis morgen!'],
  'l.bedtime': ['Wir haben heute viel gespielt! Jetzt gehe ich schlafen. Spielen wir morgen wieder?'],
  'l.streak5': ['Fünf hintereinander! Du bist ein Genie!', 'Fünf! Du bist stärker als ein T-Rex!'],
  'l.correct_after_try': ['Du hast es gefunden! Siehst du, man musste nur suchen!', 'Genau! Du hast nicht aufgegeben, bravo!'],
  'l.halfway': ['Schon die Hälfte! Weiter so!', 'Halbzeit! Nur noch ein paar Fragen!'],
  'l.last_question': ['Letzte Frage!', 'Komm, die letzte!'],
  'l.home.voice': ['Das Mikrofon: Spiele, bei denen du mit der Stimme antwortest!'],
  'l.home.voice_choose': ['Hier antwortest du mit der Stimme! Wähle ein Spiel.'],
  'l.intro.VO-1': ['Ich zeige dir ein Bild. Wenn das Mikrofon erscheint, sag mir, wie es heißt!', 'Wir spielen mit deiner Stimme! Schau dir das Bild an und sag laut seinen Namen, wenn das Mikrofon erscheint.'],
  'l.intro.VO-2': ['Wir sprechen {language}! Ich sage das Wort, und du sprichst es nach, wenn das Mikrofon erscheint.', 'Hör dir das Wort auf {language} gut an und sprich es nach, wenn das Mikrofon erscheint!'],
  'l.home.VO-1': ['Der sprechende Kopf: Sag mir, wie die Bilder heißen!'],
  'l.home.VO-2': ['Die Flagge: Sprich die Wörter auf {language} nach!'],
  'l.short.VO-1': ['Wie heißt das?'],
  'l.short.VO-2': ['Auf Englisch!'],
  'l.voice.tap_mic': ['Du bist dran! Wenn das Mikrofon erscheint, sprich!', 'Das Mikrofon ist an: Sprich laut!', 'Ich höre zu: Los, sprich!'],
  'l.voice.listening': ['Ich höre zu!', 'Meine Ohren sind ganz offen!'],
  'l.voice.unheard': ['Ich habe dich nicht gut gehört. Das Mikrofon geht wieder an: Sprich laut!', 'Hmm, das habe ich nicht verstanden. Kannst du es laut wiederholen?', 'Oh, ich habe nichts gehört! Komm näher und sprich lauter.'],
  'l.voice.wrong': ['Das ist es nicht! Versuch es nochmal!', 'Fast! Noch einmal!'],
  'l.voice.cards': ['Meine Ohren sind müde! Tippe mit dem Finger auf die richtige Antwort.'],
  'l.voice.give_up': ['Das Mikrofon hört mich nicht gut. Ab jetzt spielen wir mit dem Finger!'],
  'l.voice.loading': ['Warte, ich putze mir die Ohren…'],
  'l.voice.no_mic': ['Oh, ich kann dich nicht hören. Wir spielen mit dem Finger!'],
  'l.egg.1': ['Klopf klopf! Ist da jemand?', 'Oh! Da drin bewegt sich was!'],
  'l.egg.2': ['Nochmal! Hilf mir raus!', 'Weiter, die Schale bricht!'],
  'l.egg.3': ['Fast! Noch ein kleines Klopfen!'],
  'l.egg.hatched': ['Hallo!', 'Puh! Da bin ich!'],
  'l.hello.1': ['Hallo! Ich bin dein Dino, ein kleines {color} Dinosaurierbaby. Hilfst du mir beim Wachsen?'],
  'l.hello.4': ['Wir spielen zusammen ganz viele Spiele: Tiere, Formen, Buchstaben, Zahlen und sogar eine andere Sprache!'],
  'l.hello.5': ['Jedes Mal, wenn du die richtige Antwort gleich beim ersten Mal findest, bekommst du eine Frucht. Schau, sie fallen in meinen Korb!'],
  'l.hello.6': ['Dann gibst du sie mir zu essen. Mmh! Je mehr ich esse, desto größer werde ich!'],
  'l.hello.7': ['Und wenn ich wachse, bekommst du Geschenke: Kleider zum Verkleiden, Sterne und Überraschungen!'],
  'l.hello.2': ['Ich bin gerade erst geschlüpft… Ich weiß noch gar nichts über die Welt! Mit dir lerne ich alles.'], 'l.hello.9': ['Bei „Mein Dino“ kannst du mich anziehen, wie du willst: Hüte, Brillen, Umhänge… Ich werde der schönste Dino!'], 'l.hello.10': ['Und wenn du dich irrst, ist das gar nicht schlimm: Ich gebe dir einen Tipp, und wir versuchen es zusammen noch einmal!'], 'l.hello.8': ['Komm, los geht’s!'],
  'l.hello.name': ['Aber zuerst sag mir: Wie heißt du? Wenn das Mikrofon erscheint, sag laut deinen Namen!'],
  'l.hello.name_again': ['Ich habe dich nicht gut gehört. Sag mir noch einmal deinen Namen, wenn das Mikrofon erscheint!'],
  'l.hello.name_ok': ['Schön, dich kennenzulernen, {name}! Was für ein schöner Name!'],
  'l.hello.name_later': ['Du kannst mir deinen Namen später sagen: Mama oder Papa schreiben ihn für mich auf!'],
  'l.hello.age': ['Und du, {name}, wie alt bist du? Wenn das Mikrofon erscheint, sag es mir!'],
  'l.hello.age_again': ['Ich habe dich nicht gut gehört. Wie alt bist du? Sprich, wenn das Mikrofon erscheint!'],
  'l.hello.age_later': ['Macht nichts: Mama oder Papa sagen es mir!'],
  'l.hello.sibling': ['Hallo {name}! Ich bin dein Dino, ein kleines {color} Dinosaurierbaby. Wir werden viel Spaß zusammen haben!'],
  'l.hello.mic_allow': ['Wenn eine Nachricht auf dem Bildschirm erscheint, bitte einen Erwachsenen, auf „Erlauben“ zu tippen!'],
  'l.hello.parent': ['Jetzt gib das Telefon Mama oder Papa! Sie wählen einen Geheimcode, nur für mich.'],
  'l.welcome_first': ['Das ist mein Zuhause, {name}! Wir werden viel Spaß haben!'],
  'l.hunger.growl': ['Hörst du das? Mein Bauch knurrt! Gib mir den Korb!'],
  'l.hunger.look': ['Mmm… das Obst sieht lecker aus… Tippe auf den Korb!'],
  'l.hunger.beg': ['Bitte, bitte! Gib mir den Korb!', 'Komm, {name}, bitte! Ich habe Hunger!'],
  'l.hunger.gape': ['Schau, ich mache den Mund weit auf: Aaah! Leg das Obst hinein!'],
  'l.hunger.sad': ['Ich habe so großen Hunger… Tippe auf den Korb!', 'Mein Bauch ist ganz leer… Fütterst du mich?'],
  'l.child.turn': ['Du bist dran, {name}! Spielen wir zusammen?', 'Hallo {name}! Du bist dran!'],
  'l.child.ask_name': ['Hallo! Hol Mama oder Papa: Sie müssen mir deinen Namen sagen!'],
  'l.age.ask': ['Wie alt bist du? Tippe auf den Kuchen mit deinem Alter!'],
  'l.age.3': ['Drei Jahre! Super!'], 'l.age.4': ['Vier Jahre! Super!'], 'l.age.5': ['Fünf Jahre! Toll!'],
  'l.age.6': ['Sechs Jahre! Toll!'], 'l.age.7': ['Sieben Jahre! Wow!'],

  ...kv('c', `dog=der Hund; cat=die Katze; fish=der Fisch; bird=der Vogel; cow=die Kuh; pig=das Schwein; horse=das Pferd; duck=die Ente;
    rabbit=der Hase; hen=das Huhn; sheep=das Schaf; frog=der Frosch; mouse=die Maus; dinosaur=der Dinosaurier; red=Rot; blue=Blau;
    green=Grün; yellow=Gelb; orange_color=Orange; purple=Lila; pink=Rosa; black=Schwarz; white=Weiß; brown=Braun;
    apple=der Apfel; banana=die Banane; strawberry=die Erdbeere; cherry=die Kirsche; orange=die Orange; egg=das Ei;
    ice_cream=das Eis; pizza=die Pizza; grapes=die Trauben; pear=die Birne; lemon=die Zitrone; carrot=die Karotte; bread=das Brot;
    milk=die Milch; cake=der Kuchen; watermelon=die Wassermelone; cookie=der Keks; cheese=der Käse; tomato=die Tomate; pineapple=die Ananas;
    peach=der Pfirsich; broccoli=der Brokkoli; corn=der Mais; kiwi=die Kiwi; mango=die Mango; blueberries=die Blaubeeren; coconut=die Kokosnuss;
    car=das Auto; ball=der Ball; bus=der Bus; train=der Zug; plane=das Flugzeug; boat=das Boot; bike=das Fahrrad; balloon=der Luftballon;
    teddy=der Teddybär; book=das Buch; house=das Haus; kite=der Drachen; bed=das Bett; chair=der Stuhl; door=die Tür;
    key=der Schlüssel; clock=die Uhr; sun=die Sonne; moon=der Mond; star=der Stern; flower=die Blume; cloud=die Wolke; rainbow=der Regenbogen;
    tree=der Baum; rain=der Regen; snowflake=die Schneeflocke; snowman=der Schneemann; leaf=das Blatt; mountain=der Berg;
    fire=das Feuer; sunflower=die Sonnenblume; drop=der Wassertropfen; eye=das Auge; ear=das Ohr; nose=die Nase; mouth=der Mund;
    hand=die Hand; foot=der Fuß; tooth=der Zahn; lion=der Löwe; tiger=der Tiger; elephant=der Elefant; monkey=der Affe; bear=der Bär;
    giraffe=die Giraffe; zebra=das Zebra; panda=der Panda; snake=die Schlange; turtle=die Schildkröte; crocodile=das Krokodil;
    kangaroo=das Känguru; hippo=das Nilpferd; gorilla=der Gorilla; rhino=das Nashorn; butterfly=der Schmetterling; bee=die Biene;
    ladybug=der Marienkäfer; spider=die Spinne; ant=die Ameise; snail=die Schnecke; dolphin=der Delfin; whale=der Wal; octopus=der Krake;
    crab=die Krabbe; shark=der Hai; owl=die Eule; penguin=der Pinguin; parrot=der Papagei; flamingo=der Flamingo; peacock=der Pfau;
    eagle=der Adler; swan=der Schwan; hat=der Hut; shoe=der Schuh; dress=das Kleid; cap=die Kappe; socks=die Socken;
    gloves=die Handschuhe; tshirt=das T-Shirt; glasses=die Brille; umbrella=der Regenschirm; pencil=der Bleistift; spoon=der Löffel;
    scissors=die Schere; hammer=der Hammer; ladder=die Leiter; broom=der Besen; bottle=die Babyflasche; toothbrush=die Zahnbürste;
    guitar=die Gitarre; drum=die Trommel; piano=das Klavier; violin=die Geige; trumpet=die Trompete; helicopter=der Hubschrauber;
    tractor=der Traktor; rocket=die Rakete; ambulance=der Krankenwagen; motorbike=das Motorrad; fire_engine=das Feuerwehrauto;
    police_car=das Polizeiauto; scooter=der Roller; sled=der Schlitten; llama=das Lama; goat=die Ziege; camel=das Kamel;
    hedgehog=der Igel; squirrel=das Eichhörnchen; bat=die Fledermaus; deer=der Hirsch; wolf=der Wolf; fox=der Fuchs; raccoon=der Waschbär;
    beaver=der Biber; otter=der Otter; sloth=das Faultier; skunk=das Stinktier; bison=der Bison; castle=die Burg; tent=das Zelt;
    lighthouse=der Leuchtturm; volcano=der Vulkan; island=die Insel; anchor=der Anker; magnet=der Magnet; compass=der Kompass;
    microscope=das Mikroskop; telescope=das Teleskop; hourglass=die Sanduhr; jellyfish=die Qualle; seal=die Robbe;
    lobster=der Hummer; shrimp=die Garnele; squid=der Tintenfisch; oyster=die Auster; beetle=der Käfer; cricket=die Grille;
    mosquito=die Mücke; worm=der Wurm; scorpion=der Skorpion; rooster=der Hahn; turkey=der Truthahn; donkey=der Esel; ox=der Ochse;
    leopard=der Leopard; polar_bear=der Eisbär; koala=der Koala; orangutan=der Orang-Utan; mammoth=das Mammut; moose=der Elch;
    badger=der Dachs; avocado=die Avocado; eggplant=die Aubergine; garlic=der Knoblauch; onion=die Zwiebel; pepper=die Chilischote;
    cucumber=die Gurke; potato=die Kartoffel; mushroom=der Pilz; peanuts=die Erdnüsse; croissant=das Croissant; pancakes=die Pfannkuchen;
    honey=der Honig; spaghetti=die Spaghetti; fries=die Pommes; sandwich=das Sandwich; candle=die Kerze; mirror=der Spiegel;
    window=das Fenster; bucket=der Eimer; bell=die Glocke; lock=das Vorhängeschloss; light_bulb=die Glühbirne; flashlight=die Taschenlampe;
    axe=die Axt; saw=die Säge; wrench=der Schraubenschlüssel; screwdriver=der Schraubenzieher; paintbrush=der Pinsel; crayon=der Wachsmalstift;
    trophy=der Pokal; medal=die Medaille; ring=der Ring; skateboard=das Skateboard; yoyo=das Jo-Jo; roller_skate=der Rollschuh;
    canoe=das Kanu; tram=die Straßenbahn; parachute=der Fallschirm; satellite=der Satellit; brain=das Gehirn; bone=der Knochen;
    tongue=die Zunge; leg=das Bein; tornado=der Tornado; lightning=der Blitz; comet=der Komet; cactus=der Kaktus;
    blossom=die Kirschblüte; feather=die Feder`),

  // ---- Mon pays ----
  "lang.ko": "Koreanisch", "lang.ne": "Nepalesisch",
  "lang.vi": "Vietnamesisch", "lang.tr": "Türkisch", "lang.fa": "Persisch", "lang.pl": "Polnisch", "lang.uk": "Ukrainisch",
  "lang.id": "Indonesisch",
  "country.cd": "DR Kongo",
  "title.MO-6": "Die Welt — Mein Land",
  "l.home.MO-6": ["Die Landkarte: Fragen über dein Land!"],
  "l.intro.MO-6": ["Wir sprechen über dein Land! Hör gut zu und tippe auf das richtige Bild.", "Kennst du dein Land gut? Ich stelle dir Fragen!"],
  "l.short.MO-6": ["Eine Frage über dein Land!"],
  "cty.flag": "Welche Flagge gehört zu: {country}?",
  "cty.flagHard": "Achtung, sie sehen sich ähnlich! Welche Flagge gehört zu: {country}?",
  "cty.flagYes": "Ja! Das ist die Flagge von: {country}!",
  "cty.flagHint": "schau dir die Farben und ihre Reihenfolge gut an",
  "cty.symbol": "Was ist ein Symbol für: {country}?",
  "cty.symbolYes": "Ja! Das ist ein Symbol für: {country}!",
  "cty.symbolYesName": "Ja! {name}: ein Symbol für {country}!",
  "cty.food": ["Was ist eine Spezialität? Land: {country}.", "Was isst man gern? Land: {country}."],
  "cty.foodYes": "Mmm! Das ist eine Spezialität! Land: {country}.",
  "cty.day": "Am {date} ist der Nationalfeiertag! Land: {country}. Was sieht man abends am Himmel?",
  "cty.dayYes": "Ja! Am {date} gibt es ein großes Feuerwerk!",
  "cty.currency": "Mit welchem Geld bezahlt man? Land: {country}.",
  "cty.currencyYes": "Ja! Man bezahlt mit: {money}!",
  "cty.place": "Welchen berühmten Ort sieht man? Land: {country}.",
  "cty.sport": "Welchen Sport liebt man dort? Land: {country}.",
  "cty.thing": "Was sieht man oft bei Festen? Land: {country}.",
  "cty.landmarkYes": "Ja! Bravo, du kennst dein Land gut!",
  "cty.capital": "Was ist die Hauptstadt? Land: {country}. Lies die Namen der Städte gut!",
  "cty.capitalYes": "Ja! Die Hauptstadt ist {city}!",
  "cty.neighbour": "Welche dieser Flaggen gehört zu einem Nachbarland? Land: {country}.",
  "cty.neighbourYes": "Ja! Dieses Land liegt direkt daneben!",
  "cty.neighbourHint": "Nachbarn sind ganz nah, auf demselben Kontinent",
  // Espace parents : onglets.
  'p.dailyShort': 'Danach geht der Dino schlafen.', 'p.credits': 'Danksagungen und Lizenzen', 'p.creditsHelp': 'DinoLearn verwendet diese Programme, Stimmen, Bilder, Schriften und Klänge. Danke an ihre Autorinnen und Autoren!', 'p.credits.voices': 'Stimmen des Dinos', 'p.credits.asr': 'Spracherkennung', 'p.credits.code': 'Spiel-Engine', 'p.credits.images': 'Bilder und Schriften', 'p.credits.sounds': 'Geräusche', 'p.tab.control': 'Kontrolle', 'p.tab.print': 'Drucken', 'p.printOffer': 'Druckblätter anbieten', 'p.printOfferHelp': 'Am Ende der Spielzeit bietet der Dino drei Umschläge an; das Kind wählt einen (einmal am Tag) und das Blatt erscheint unter „Drucken“.', 'p.tab.profile': 'Profil', 'p.tab.progress': 'Fortschritt', 'p.tab.games': 'Spiele', 'p.tab.settings': 'Einstellungen', 'p.summary': 'Auf einen Blick', 'p.lower': 'Niedriger', 'p.higher': 'Höher',
  // Programme le dino (LO-12).
  'title.LO-12': 'Logik — Programmiere den Dino',
  'l.intro.LO-12': ['Wir programmieren! Die Pfeile sagen mir, wohin ich gehen soll: Hilf mir, den Apfel zu finden!'],
  'l.home.LO-12': ['Die Pfeile: Programmiere den Dino!'],
  'l.short.LO-12': ['Programmiere den Dino!'],
  'LO-12.prompt': 'Tippe auf die Pfeile, um mich zum Apfel zu bringen!',
  'LO-12.promptProgram': 'Lege die Pfeile hin und drücke dann den grünen Knopf, damit ich losgehe!',
  'LO-12.promptLoop': 'Lege die Pfeile hin und benutze den „mal“-Knopf, um einen Pfeil zu wiederholen. Dann drücke den grünen Knopf!',
  'LO-12.promptFruits': 'Sammle beide Früchte ein! Lege alle Pfeile hin und drücke dann den grünen Knopf.',
  'LO-12.yes': 'Mmh! Super, du hast mich toll programmiert!',
  'LO-12.hint': 'Schau genau: Der blinkende Pfeil zeigt die richtige Richtung!',
  'LO-12.bumpRock': 'Hoppla, ein Stein!',
  'LO-12.bumpWater': 'Oh nein, Wasser! Ich kann nicht schwimmen.',
  'LO-12.bumpEdge': 'Hoppla, ich kann den Garten nicht verlassen!',
  'LO-12.short': 'Mir fehlen noch Pfeile: Ich bin noch nicht da!',
  'LO-12.empty': 'Lege zuerst unten Pfeile hin und drücke dann den grünen Knopf!',
  'LO-12.full': 'Kein Platz mehr! Tippe unten auf einen Pfeil, um ihn wegzunehmen.',
  'LO-12.best': 'Und du hast sogar das kürzeste Programm gefunden!',
  // Micro qui s'allume tout seul, ventre qui gargouille, anglais à répéter.
  'l.tummy': ['Blubb blubb… Hörst du? Mein Bauch sagt danke!', 'Oh, mein Bauch grummelt: Er ist ganz glücklich!', 'Mein Bauch macht lustige Geräusche: Er verdaut!'],
  'l.home.hungry': ['Mein Bauch grummelt…', 'Ich habe so einen Hunger!', 'Ich würde so gern einen Apfel essen!', 'Hmm, eine Banane wäre jetzt lecker…'],
  'p.micHelp': 'Das Kind antwortet mit der Stimme (ein Bild benennen, ein Wort nachsprechen, rechnen). Alles bleibt auf diesem Gerät: Nichts wird aufgenommen oder gesendet. Das große Mikrofon erscheint nur, wenn das Kind sprechen darf.',
  'VO-2.repeatNow': ['Du bist dran, sprich nach!', 'Sprich mir nach!'],
  // Catégories des missions.
  'ui.cat.math': 'Mathe',
  'ui.cat.logic': 'Logik',
  'ui.cat.world': 'Die Welt',
  // Sudoku des fruits (LO-13).
  'title.LO-13': 'Logik — Obst-Sudoku',
  'l.intro.LO-13': ['Das Obst-Sudoku! Schieb jede Frucht in ein leeres Feld, aber Achtung: Nie zweimal dieselbe Frucht in einer Reihe oder Spalte!'],
  'l.home.LO-13': ['Das Obstgitter: Sudoku!'],
  'l.short.LO-13': ['Das Obst-Sudoku!'],
  'LO-13.prompt': 'Schieb die Früchte in die leeren Felder. Jede Frucht nur einmal in jeder Reihe und jeder Spalte!',
  'LO-13.promptBox': 'Schieb die Früchte in die leeren Felder. Jede Frucht nur einmal in jeder Reihe, jeder Spalte und jedem Quadrat!',
  'LO-13.yes': 'Super, das Gitter ist voll!',
  'LO-13.hint': 'Schau auf das leuchtende Feld: Dort passt nur eine Frucht hin!',
  'LO-13.conflictRow': 'Hoppla! Diese Frucht ist schon in dieser Reihe.',
  'LO-13.conflictCol': 'Hoppla! Diese Frucht ist schon in dieser Spalte.',
  'LO-13.conflictBox': 'Hoppla! Diese Frucht ist schon in diesem Quadrat.',
  'LO-13.wrong': 'Hm, nicht hier! Schau dir die anderen Reihen und Spalten genau an.',
  // Partage le gâteau (LO-14).
  'title.LO-14': 'Mathe — Teil den Kuchen',
  'l.intro.LO-14': ['Zeit für die Jause! Hilf mir, den Kuchen mit meinen Freunden zu teilen: Alle sollen gleich viel bekommen.'],
  'l.home.LO-14': ['Der Kuchen: Teil ihn mit meinen Freunden!'],
  'l.short.LO-14': ['Teil den Kuchen!'],
  'LO-14.give': 'Meine Freunde kommen zum Kuchenessen! Schieb ein Stück Kuchen auf jeden Teller.',
  'LO-14.smallest': 'Oh, einer meiner Freunde hat ein kleineres Stück! Tippe auf den, der am wenigsten hat.',
  'LO-14.cut2': 'Wir sind zu zweit! Schneide den Kuchen in zwei gleiche Stücke: Zieh den Finger genau durch die Mitte.',
  'LO-14.cut4': 'Wir sind zu viert! Schneide den Kuchen in vier gleiche Stücke: Mach zwei Striche über Kreuz, genau durch die Mitte.',
  'LO-14.equalPick': 'Welcher Kuchen ist in lauter gleiche Stücke geschnitten? Tippe ihn an!',
  'LO-14.half': 'Gib meinem Freund die Hälfte vom Kuchen: Schieb die Stücke auf seinen Teller und tippe dann auf den grünen Knopf.',
  'LO-14.quarter': 'Gib meinem Freund ein Viertel vom Kuchen: Schieb die Stücke auf seinen Teller und tippe dann auf den grünen Knopf.',
  'LO-14.cookies': 'Teil die Kekse: Jeder Freund soll gleich viele bekommen! Wenn du fertig bist, tippe auf den grünen Knopf.',
  'LO-14.findHalf': 'Wir haben die Hälfte von einem dieser Kuchen gegessen. Von welchem? Tippe ihn an!',
  'LO-14.findQuarter': 'Wir haben ein Viertel von einem dieser Kuchen gegessen. Von welchem? Tippe ihn an!',
  'LO-14.yes': 'Mmh! Alle haben gleich viel, das ist gerecht!',
  'LO-14.hint': 'Schau genau, die Hand zeigt es dir!',
  'LO-14.already': 'Er hat schon ein Stück! Gib es einem anderen Freund.',
  'LO-14.offCenter': 'Oh, die Stücke wären nicht gleich! Schneide genau durch die Mitte des Kuchens.',
  'LO-14.unfair': 'Nicht gerecht! Die Stücke sind nicht gleich: Schneide über Kreuz, schön gerade!',
  'LO-14.tooFew': 'Noch nicht! Schau genau, wie viele Stücke du brauchst.',
  'LO-14.tooMany': 'Oh, das ist zu viel! Tippe auf ein Stück auf dem Teller, um es zurückzunehmen.',
  'LO-14.left': 'Es sind noch Kekse zu verteilen!',
  'LO-14.uneven': 'Nicht gleich! Zähl die Kekse von jedem Freund genau.',
  'LO-14.wrongPick': 'Nein, schau dir die Größe der Stücke genau an!',
  'LO-14.cut3': 'Wir sind zu dritt! Schneide den Kuchen in drei gleiche Stücke: Mach drei Striche von der Mitte bis zum Rand, wie ein Stern.',
  'LO-14.cut6': 'Wir sind zu sechst! Schneide den Kuchen in sechs gleiche Stücke: drei Striche genau durch die Mitte.',
  'LO-14.cut8': 'Wir sind zu acht! Schneide den Kuchen in acht gleiche Stücke: vier Striche genau durch die Mitte.',
  'LO-14.third': 'Gib meinem Freund ein Drittel vom Kuchen: Schieb die Stücke auf seinen Teller und tippe dann auf den grünen Knopf.',
  'LO-14.twoThirds': 'Gib meinem Freund zwei Drittel vom Kuchen: Schieb die Stücke auf seinen Teller und tippe dann auf den grünen Knopf.',
  'LO-14.threeQuarters': 'Gib meinem Freund drei Viertel vom Kuchen: Schieb die Stücke auf seinen Teller und tippe dann auf den grünen Knopf.',
  'LO-14.findThird': 'Wir haben ein Drittel von einem dieser Kuchen gegessen. Von welchem? Tippe ihn an!',
  'LO-14.fromCenter': 'Fang genau in der Mitte des Kuchens an und zieh bis zum Rand!',
  'LO-14.unfairEven': 'Nicht gerecht! Die Stücke sind nicht gleich: Verteil deine Striche schön gleichmäßig!',
  'p.yourOpinion': 'Ihre Meinung',
  'p.rateHelp': 'Gefällt Ihnen DinoLearn? Eine Bewertung oder eine kurze Rezension im Store hilft anderen Eltern, die App zu finden. Das ist kostenlos und ganz freiwillig.',
  'p.rateBtn': 'DinoLearn bewerten',
  'p.rateAsk': 'Gefällt Ihnen DinoLearn?',
  'p.rateLater': 'Später',
  'p.rateNever': 'Nicht mehr fragen',
};

export default de;
