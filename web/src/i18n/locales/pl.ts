import type { Catalog } from '../index';
import { kv } from '../kv';

/**
 * Polski (drugi język: angielski). Wstawiane słowa zostają w mianowniku:
 * zdania są budowane tak, by ich nie odmieniać (« Pokaż: {word}! »).
 */
const pl: Catalog = {
  ...kv('lang', 'fr=francuski; en=angielski; es=hiszpański; it=włoski; de=niemiecki; pt=portugalski; ru=rosyjski; zh=chiński; hi=hindi; ar=arabski; ur=urdu; bn=bengalski; id=indonezyjski; vi=wietnamski; tr=turecki; fa=perski; pl=polski; uk=ukraiński'),
  ...kv('country', 'fr=Francja; be=Belgia; ch=Szwajcaria; ca=Kanada; lu=Luksemburg; gb=Wielka Brytania; us=Stany Zjednoczone; es=Hiszpania; mx=Meksyk; it=Włochy; de=Niemcy; at=Austria; pt=Portugalia; br=Brazylia; ru=Rosja; cn=Chiny; in=Indie; eg=Egipt; ma=Maroko; sa=Arabia Saudyjska; pk=Pakistan; bd=Bangladesz; cd=DR Konga'),

  'ui.loading': 'Ładowanie…', 'ui.rotate': 'Obróć tablet!', 'ui.tap': 'Dotknij ekranu, aby zagrać!', 'ui.retry': 'Spróbuj ponownie',
  'ui.problem': 'Problem: {reason}', 'ui.cancel': 'Anuluj', 'ui.skip': 'Pomiń', 'ui.home.play': 'Graj', 'ui.home.missions': 'Misje', 'ui.home.mydino': 'Mój dino', 'ui.home.settings': 'Ustawienia', 'ui.end.again': 'Jeszcze raz', 'ui.home.playWith': 'Pobaw się ze swoim dino, {name}!', 'ui.home.learn': 'Ucz się i baw ze swoim Dino!',
  'ui.home.summary': 'Ukończone rundy: {n}. Twój dino rośnie razem z tobą!',
  'ui.home.sleeping': 'Ćśś… dino śpi.\nRodzic może odblokować grę swoim kodem.', 'ui.home.timeUp': 'Czas gry się skończył.\nRodzic może odblokować grę swoim kodem.',
  'ui.child.title': 'Jak ma na imię dziecko?', 'ui.child.sub': 'Dino będzie mówić do niego po imieniu.', 'ui.parents.title': 'Strefa rodzica',
  'ui.pin.type': 'Wpisz kod rodzica.', 'ui.pin.title': 'Kod rodzica', 'ui.pin.choose': 'Wybierz 4-cyfrowy kod.',
  'ui.wardrobe.title': 'Mój Dino – Szafa', 'ui.wardrobe.reactions': ['Super!', 'Bardzo mi się podoba!', 'Ale ładnie wyglądam!', 'Jak elegancko!'],
  'ui.choose.voice': 'Na głos', 'ui.choose.voiceTitle': 'Graj głosem!', 'ui.choose.title': 'Wybierz grę!',
  'ui.end.3': 'Brawo!', 'ui.end.2': 'Świetnie!', 'ui.end.1': 'Dobra robota!', 'ui.end.0': 'Tak trzymaj!', 'ui.end.done': 'Runda ukończona!',
  'ui.time.unlimited': 'Bez limitu', 'ui.time.less': 'Mniej czasu', 'ui.time.more': 'Więcej czasu', 'ui.lang': 'Język', 'ui.langLabel': 'Język:', 'ui.mb': '{n} MB',
  'ui.pack.voice': 'pakiet: {language}', 'ui.pack.asr': 'rozpoznawanie mowy', 'ui.pack.stalled': 'Pobieranie stanęło. Sprawdź połączenie.', 'ui.pack.downloading': 'Pobieranie: {list}',
  'ui.pack.installing': 'Instalowanie rozpoznawania mowy', 'ui.pack.speechTitle': 'Głos dino ({language})',
  'ui.pack.speechDetail': 'Naturalny głos, taki sam na każdym urządzeniu.', 'ui.pack.secondTitle': 'Głos: {language}',
  'ui.pack.secondDetail': 'Do słów w grach językowych.', 'ui.pack.asrTitle': 'Rozpoznawanie mowy', 'ui.pack.asrDetail': 'Aby odpowiadać na głos.',
  'ui.pack.download': 'Pobierz', 'ui.pack.installed': 'Zainstalowano ✓', 'ui.pack.toDownload': 'Do pobrania: {n} MB (najlepiej przez Wi-Fi).',
  'ui.pack.allInstalled': 'Wszystko zainstalowane.', 'ui.pack.running': 'Pobieranie…', 'ui.pack.finished': 'Gotowe.', 'ui.pack.failed': 'Błąd: {error}',
  'ui.pack.installingShort': 'Instalowanie…', 'ui.pack.waiting': 'Oczekiwanie…', 'voice.heard': 'Usłyszałem: {word}.',

  ...kv('p', `title=Strefa rodzica; back=Wróć do gry; noName=Bez imienia; addChild=+ Dodaj dziecko; newChild=Nowe dziecko;
    newChildHelp=Po wyjściu ze strefy rodzica nowe dziecko dotknie swojego jajka, a z niego wykluje się jego własny dino.;
    cancel=Anuluj; edit=✏️ Edytuj profil; sheetOf=Profil: {name}; sheet=Profil dziecka; sheetHelp=Imię, wiek i ustawienia.;
    removeChild=Usuń: {name}; thisChild=to dziecko; removeConfirm=Usunąć profil „{name}”, jego dino i cały postęp? Tego nie można cofnąć.;
    egg=jajko jeszcze się nie wykluło; dino=dino; alternateAria=Na zmianę między dziećmi; age=Wiek: {n}; otherCountry=inny kraj;
    series=rozegrane rundy; answers=odpowiedzi; firstTry=dobrze za pierwszym razem; today=grane dzisiaj;
    childrenHelp=Każde dziecko ma swojego dino, swój postęp i ustawienia. Ustawienia poniżej dotyczą wybranego dziecka.;
    alternate=Na zmianę: po każdej rundzie gra następne dziecko;
    difficulty=Początkowa trudność gier: {n} z 20 ({stage}). Potem dopasowuje się sama do wyników.;
    stageCP=1. klasa; stageK=przedszkole; dinoLevel=Poziom dino;
    dinoLevelHelp=Dino rośnie, gdy dziecko go karmi (poziom 1–{max}). Możesz go zmienić, aby dostosować trudność: poziomy 21–40 odpowiadają 1. klasie.;
    noNight=Bez trybu nocnego; week=Czas gry z ostatnich 7 dni; daily=Czas gry dziennie;
    dailyHelp=Gdy czas się skończy, dziecko kończy rundę, a gra blokuje się do następnego dnia: dino idzie spać. Swoim kodem możesz dodać 15 lub 30 minut albo odblokować cały dzień.;
    night=Pora snu (tryb nocny);
    nightHelp=Po tej godzinie niebo robi się ciemne, a dino ziewa: proponuje ostatnią rundę i śpi do rana. Twój kod pozwala dziecku pograć jeszcze chwilę tego wieczoru.;
    enable=Włącz: {game}; levelOf=Poziom: {game}; levelAuto=Poziom automatyczny; level=Poziom {n}; fromAge=Od {n} lat;
    needsVoice=Gra na głos: zezwól na mikrofon i pobierz rozpoznawanie mowy ({language}) w sekcji „Głosy i pobieranie”.;
    nAnswers=Odpowiedzi: {n}; notPlayed=Jeszcze nie grano; rate=Dobrze za pierwszym razem: {rate}; mastered=Opanowane pytania: {n} z {total};
    lastPlayed=ostatnio: {date}; chooseAria=Przycisk wyboru gry; games=Gry; choose=Przycisk „Wybierz grę” na ekranie głównym;
    chooseHelp=Gdy wyłączony, dziecko gra z planetą: każda runda miesza wszystkie gry dla jego wieku. Gdy włączony, może też wybrać konkretną grę.;
    gamesHelp=Wyłącz grę, aby nie była już proponowana. Poziom (1–20; 11–20 = 1. klasa) to początek następnej rundy; „auto” liczy go z wieku, dino i wyników.;
    reviewToday=do powtórki dzisiaj; reviewTomorrow=wróci jutro; reviewOn=wróci: {date}; reviewN=powtórka {n} z {total}; review=Do ćwiczenia;
    reviewHelp=Błędne pytanie wraca następnego dnia, potem po 3 dniach, potem po tygodniu. Trzy razy dobrze: opanowane; źle: od następnego dnia od nowa.;
    reviewNone=Na razie nie ma nic do powtórki. Brawo!; sfxAria=Efekty dźwiękowe; musicAria=Muzyka w tle; testVoice=Wypróbuj głos;
    testHello=Cześć! Jestem Dino.; sound=Dźwięk; sfx=Efekty dźwiękowe (dobre odpowiedzi, błędy, mniam…);
    music=Spokojna muzyka w tle (dziecko może ją też wyłączyć na ekranie głównym);
    phoneVoices=Główny głos: {main} · Głos drugiego języka: {second}. To głosy telefonu: aby głos był bardziej naturalny, zainstaluj głos „rozszerzony” w ustawieniach ułatwień dostępu (zamiana tekstu na mowę).;
    noVoice=nie znaleziono; mic=Mikrofon (gry na głos);
    micHelp=W grach na głos dziecko odpowiada mówiąc. Wszystko zostaje na tym urządzeniu: głos nigdy nie jest nagrywany ani wysyłany. Mikrofon włącza się tylko wtedy, gdy dziecko dotknie dużego przycisku mikrofonu.;
    noMic=Ta przeglądarka nie pozwala używać mikrofonu w grze.; allowMic=Zezwól na mikrofon; allowMicNow=Zezwól na mikrofon w oknie przeglądarki…;
    micBlocked=Mikrofon jest zablokowany. Zezwól na niego w ustawieniach przeglądarki (kłódka obok adresu) i spróbuj ponownie.;
    packsWhere=Pakiety rozpoznawania mowy pobiera się w sekcji „Głosy i pobieranie”.; removePacks=Usuń pakiety;
    removePacksConfirm=Usunąć pakiety rozpoznawania mowy z tego urządzenia? Gry na głos nie będą już proponowane.; packs=Głosy i pobieranie;
    packsHelp=Język gry, naturalny głos dino (tworzony na urządzeniu, po pobraniu bez internetu), głos do gier językowych i rozpoznawanie mowy. Pobieranie trwa dalej, nawet gdy zamkniesz tę strefę. Bez głosu dino gra używa głosu telefonu.;
    changeCode=Zmień kod; newCode=Nowy kod rodzica; newCodeHelp=Wybierz nowy 4-cyfrowy kod.; codeChanged=Kod rodzica został zmieniony.; code=Kod rodzica;
    codeHelp=Kod otwiera tę strefę i odblokowuje grę, gdy skończy się czas na dany dzień. Jeśli go zapomnisz, „Nie pamiętasz kodu?” pozwoli utworzyć nowy po pytaniu dla dorosłych.;
    reset=Zacznij od nowa; resetConfirm=Usunąć cały postęp (poziom dino, odpowiedzi, owoce)? Ustawienia zostaną.;
    privacy=Polityka prywatności; close=Zamknij; data=Dane; dataHelp=Wszystko jest zapisywane tylko na tym urządzeniu. Żadne dane nie są wysyłane.`),

  ...kv('pin', `erase=Usuń; remember=Dobrze go zapamiętaj.; forgot=Nie pamiętasz kodu?; adultQuestion=Pytanie dla dorosłego: ile to jest {a} × {b}? (3 cyfry);
    cancel=Anuluj; wrongAnswer=To nie to.; newCode=Nowy kod rodzica; newCodeHelp=Wybierz nowy 4-cyfrowy kod.; wrongCode=Zły kod.;
    otherCountry=Inny kraj; firstName=Imię;
    micHtml=<b>Zezwól na mikrofon</b> (gry na głos)<br><small>Wszystko zostaje na tym urządzeniu: głos nigdy nie jest nagrywany ani wysyłany.</small>;
    missionsHtml=<b>Wybór misji</b><br><small>Dziecko może wybierać gry (przycisk „Misje”). Bez zaznaczenia: tylko losowe rundy przyciskiem „Graj”.</small>;
    ok=OK; nameMissing=Wpisz imię dziecka.; age=Wiek; years=Wiek: {n}; country=Kraj; daily=Czas gry dziennie; night=Pora snu (tryb nocny); none=Brak;
    welcome=Witaj!;
    welcomeHeard=Oto co dziecko powiedziało dino: popraw, jeśli trzeba. Możesz dodać inne dzieci i wszystko zmienić w strefie rodzica (kłódka na ekranie głównym).;
    welcomeHelp=Imię, wiek i ustawienia dziecka. Możesz dodać inne dzieci i wszystko zmienić w strefie rodzica (kłódka na ekranie głównym).;
    yourCode=Twój kod rodzica;
    yourCodeHelp=Wybierz 4-cyfrowy kod. Otwiera strefę rodzica (kłódka na ekranie głównym) i odblokowuje grę, gdy skończy się czas na dany dzień. Nie mów go dziecku!;
    asleep=Dino śpi; asleepHelp=Pora spać. Wpisz kod rodzica, aby pograć jeszcze chwilę tego wieczoru.;
    timeUp=Czas gry się skończył; timeUpHelp=Wpisz kod rodzica, aby dodać czas na dzisiaj.;
    addTime=Dodaj czas; todayOnly=Tylko na dziś.; plus15=Jeszcze 15 minut; plus30=Jeszcze 30 minut; unlimited=Bez limitu dzisiaj`),

  ...kv('inst', `title=Zainstaluj DinoLearn na telefonie; later=Później; okay=OK; never=Nie pytaj więcej;
    android=Otworzy się na pełnym ekranie, poziomo, jak prawdziwa aplikacja. Nic więcej nie trzeba pobierać.; menu=W menu przeglądarki:;
    androidSteps=<li>Dotknij <b>⋮</b> (trzy kropki w prawym górnym rogu).</li><li>Wybierz <b>„Zainstaluj aplikację”</b> lub <b>„Dodaj do ekranu głównego”</b>.</li><li>Otwórz grę ikoną dino.</li>;
    ios=Otworzy się na pełnym ekranie, bez pasków Safari, jak prawdziwa aplikacja.;
    iosSteps=<li>Dotknij {share} <b>Udostępnij</b> (na dole lub u góry Safari).</li><li>Wybierz <b>„Do ekranu początkowego”</b>, potem <b>Dodaj</b>.</li><li>Otwórz grę ikoną dino.</li>`),

  ...kv('title', `EN-1=Angielski — Słuchaj i dotknij; EN-2=Angielski — Liczby; EN-3=Angielski — Memory; MO-1=Świat — Pokaż;
    MO-3=Świat — Cienie; MO-4=Świat — Co pasuje; MO-5=Świat — Największy; LO-1=Logika — Co nie pasuje;
    LO-2=Logika — Ile jest?; LO-3=Logika — Co dalej; LO-4=Logika — Więcej i mniej; LO-5=Logika — Liczenie;
    LO-6=Logika — Liczby; LO-7=Logika — Kształty i kolory; LO-8=Logika — Zegar; LO-9=Logika — Pieniądze;
    LO-10=Logika — Memory; LO-11=Logika — Słuchaj i licz; TR-1=Pisanie — Rysuj kształty; TR-2=Pisanie — Rysuj litery i cyfry;
    VO-1=Na głos — Jak to się nazywa?; VO-2=Na głos — Powiedz po angielsku!; VO-13=Na głos — Liczenie; MO-6=Świat — Mój kraj`),

  ...kv('item', `top-hat=cylinder; billed-cap=czapka z daszkiem; crown=korona; womans-hat=słomkowy kapelusz; graduation-cap=biret;
    rescue-workers-helmet=hełm strażaka; headphone=słuchawki; hibiscus=kwiatek; glasses=okulary; sunglasses=okulary przeciwsłoneczne;
    goggles=okulary do pływania; ribbon=muszka; swim-ring=koło do pływania; sports-medal=medal; prayer-beads=naszyjnik;
    cape-red=peleryna superbohatera; cape-blue=peleryna czarodzieja; wing=skrzydła; balloon=balonik; magic-wand=czarodziejska różdżka;
    lollipop=lizak; sunflower=słonecznik; teddy-bear=pluszowy miś`),
  ...kv('dinocolor', '0=zielony; 1=niebieski; 2=fioletowy; 3=różowy; 4=pomarańczowy; 5=żółty; 6=turkusowy; 7=czerwony; 8=brązowy'),

  ...kv('cat', `farm=zwierzę z gospodarstwa; sea=zwierzę morskie; bird=ptak; bug=robaczek; wild=dzikie zwierzę; forest=zwierzę leśne; fruit=owoc;
    veg=warzywo; meal=coś do jedzenia; vehicle=pojazd; toy=zabawka; home=rzecz z domu; clothes=coś do ubrania; tool=narzędzie;
    kitchen=rzecz codziennego użytku; music=instrument muzyczny; sky=coś na niebie; plant=roślina; body=część ciała; landscape=miejsce;
    color=kolor; element=coś z przyrody`),
  ...kv('fam', `farm=zwierzęta z gospodarstwa; sea=zwierzęta morskie; bird=ptaki; bug=robaczki; wild=dzikie zwierzęta; forest=zwierzęta leśne;
    fruit=owoce; veg=warzywa; meal=jedzenie i słodycze; vehicle=pojazdy; toy=zabawki; home=rzeczy z domu; clothes=ubrania; tool=narzędzia;
    kitchen=rzeczy z łazienki i kuchni; music=instrumenty muzyczne; sky=niebo i pogoda; plant=rośliny; body=części ciała; landscape=miejsca;
    color=kolory; element=rzeczy z przyrody`),
  ...kv('fruit', `red-apple=jabłko; banana=banan; strawberry=truskawka; cherries=wiśnie; grapes=winogrona; tangerine=pomarańcza; pear=gruszka;
    lemon=cytryna; watermelon=arbuz; peach=brzoskwinia; pineapple=ananas; kiwi-fruit=kiwi; mango=mango; blueberries=borówki; melon=melon;
    green-apple=zielone jabłko; coconut=kokos`),
  ...kv('many', `food-red-apple=jabłek; food-banana=bananów; food-strawberry=truskawek; food-pear=gruszek; food-lemon=cytryn;
    food-tangerine=pomarańczy; food-kiwi-fruit=kiwi; food-peach=brzoskwiń`),

  'g.hintFamily': 'Podpowiedź: to {family}.', 'g.word': '{word}!', 'g.yesWord': ['Tak: {word}!', 'Dokładnie: {word}!'], 'g.yesItIs': 'Tak, to {word}!',
  'g.hint': 'Podpowiedź: {hint}.', 'g.hintTens': 'Podpowiedź: najpierw spójrz na pierwszą cyfrę, czyli dziesiątki.', 'g.plus': '{a} dodać {b}', 'g.minus': '{a} odjąć {b}',
  'g.calcPrompt': ['Ile to jest {calc}?', '{calc} — ile to jest?'], 'g.calcYes': 'Tak! {calc} to {n}!',
  'g.hintAdd': 'Podpowiedź: zacznij od liczby {a} i odlicz jeszcze {b} na palcach.', 'g.hintSub': 'Podpowiedź: zacznij od liczby {a} i odlicz {b} do tyłu na palcach.',
  'MO-1.prompt': ['Pokaż: {word}!', 'Gdzie jest {word}?', 'Dotknij: {word}!', 'Znajdziesz? {word}!'],
  'LO-1.prompt': ['Co nie pasuje? Który obrazek nie jest z tej samej rodziny?', 'Który obrazek różni się od innych?'],
  'LO-1.yes': 'Tak, {word}! A pozostałe to {family}.', 'LO-1.hint': 'Podpowiedź: obrazków z rodziny „{family}” jest {n}. Znajdź ten, który nie pasuje.',
  'LO-2.prompt': ['Ile tu jest {things}? Policz dokładnie!', 'Policz! Ile tu jest {things}?'], 'LO-2.promptMixed': 'Ile tu jest {things}? Uwaga: licz tylko je!',
  'LO-2.yes': '{list}. Razem {n}!', 'LO-2.hint': 'Podpowiedź: dotknij każdego owocu palcem i licz powoli.', 'LO-2.hintBig': 'Podpowiedź: najpierw policz do dziesięciu, potem dalej: jedenaście, dwanaście, trzynaście…',
  'MO-3.prompt': ['Czyj to cień? Dotknij właściwego obrazka!', 'Kto chowa się za tym cieniem?'],
  'LO-3.prompt': ['Przyjrzyj się szeregowi. Jaki owoc będzie następny?', 'Który owoc dokończy szereg?'], 'LO-3.yes': 'Tak! {list}!',
  'LO-3.hint': 'Podpowiedź: szereg zawsze zaczyna się od nowa tak samo. {list}…', 'LO-3.numPrompt': 'Patrz i słuchaj: {list}. Jaka liczba będzie następna?',
  'LO-3.numYes': 'Tak! {list}, {n}!', 'LO-3.hintGrow': 'Podpowiedź: dodajemy jeden, potem dwa, potem trzy… a potem?',
  'LO-3.hintPlus': 'Podpowiedź: za każdym razem dodajemy {n}.', 'LO-3.hintMinus': 'Podpowiedź: za każdym razem odejmujemy {n}.',
  'LO-4.num.most': 'Dotknij największej liczby!', 'LO-4.num.least': 'Dotknij najmniejszej liczby!',
  'LO-4.numYes.most': 'Tak! {n} to największa liczba!', 'LO-4.numYes.least': 'Tak! {n} to najmniejsza liczba!',
  'LO-4.numHint.most': 'Podpowiedź: gdy liczymy, największa liczba jest na końcu.', 'LO-4.numHint.least': 'Podpowiedź: gdy liczymy, najmniejsza liczba jest na początku.',
  'LO-4.pile.most': 'Gdzie jest najwięcej {things}? Dotknij właściwej karty!', 'LO-4.pile.least': 'Gdzie jest najmniej {things}? Dotknij właściwej karty!',
  'LO-4.pileYes.most': 'Tak! Tu jest {n}. Najwięcej!', 'LO-4.pileYes.least': 'Tak! Tu jest {n}. Najmniej!',
  'LO-4.pileHint.least': 'Podpowiedź: szukaj karty z bardzo małą liczbą owoców.', 'LO-4.pileHint.most': 'Podpowiedź: szukaj najpełniejszej karty.',
  'LO-5.compl': '{a} dodać ile to {b}?', 'LO-5.complYes': 'Tak! {a} dodać {x} to {b}!', 'LO-5.complHint': 'Podpowiedź: licz na palcach od {a} do {b}.',
  'LO-5.add': 'Patrz, owoce: {a}. Dokładam jeszcze {b}. Ile jest razem?', 'LO-5.eat': 'Patrz, owoce: {a}. Dino zjada {b}. Ile zostało?',
  'LO-5.addHint': 'Podpowiedź: policz wszystkie owoce, z lewej i z prawej.', 'LO-5.eatHint': 'Podpowiedź: licz tylko owoce, które nie są przekreślone.',
  'LO-11.prompt': ['Słuchaj uważnie: {calc}. Ile to jest?', 'Ile to jest {calc}?', 'W pamięci: {calc}. Dotknij odpowiedzi!'],
  'VO-13.prompt': ['Ile to jest {calc}? Powiedz mi!', '{calc} — ile to jest? Powiedz!'], 'VO-13.repeat': 'Posłuchaj: {calc} to {n}. Teraz ty powiedz!',
  'VO-13.fallback': '{calc} — ile to jest? Dotknij właściwej liczby!',
  'MO-4.prompt': ['Patrz: {word}. Co do tego pasuje?', 'Znajdź parę: {word}!'], 'MO-4.yes': 'Tak! {a} i {b} to para!',
  'MO-4.hint': 'Podpowiedź: wyobraź sobie: {word}. Co często jest obok?',
  'MO-5.prompt.big': ['Co jest największe w prawdziwym życiu?', 'Dotknij tego, co w prawdziwym życiu jest największe!'],
  'MO-5.prompt.small': ['Co jest najmniejsze w prawdziwym życiu?', 'Dotknij tego, co w prawdziwym życiu jest najmniejsze!'],
  'MO-5.yes.big': 'Tak! W prawdziwym życiu największe jest to: {word}!', 'MO-5.yes.small': 'Tak! W prawdziwym życiu najmniejsze jest to: {word}!',
  'MO-5.hint': 'Podpowiedź: na obrazkach wszystko jest tej samej wielkości. Wyobraź sobie te rzeczy naprawdę, obok siebie!',
  'LO-6.prompt': ['Dotknij liczby {n}!', 'Gdzie jest liczba {n}?', 'Znajdź liczbę {n}!'], 'LO-6.yes': 'Tak! To {n}!',
  'LO-6.hint': 'Podpowiedź: policz na palcach do {n} i znajdź tę liczbę.', 'LO-6.hintBig': 'Podpowiedź: przyjrzyj się pierwszej cyfrze, potem drugiej.',
  'EN-2.hint': 'Podpowiedź: licz po angielsku na palcach i zatrzymaj się, gdy usłyszysz właściwą liczbę.',
  'LO-7.shape': 'Znajdź kształt: {shape}!', 'LO-7.color': 'Znajdź kształt, którego kolor to {color}!', 'LO-7.both': 'Znajdź: {shape}, kolor: {color}!',
  'LO-7.yes.shape': 'Tak: {shape}!', 'LO-7.yes.color': 'Tak, kolor: {color}!', 'LO-7.yes.both': 'Tak: {shape}, kolor: {color}!',
  'LO-7.hint.color': 'Podpowiedź: patrz tylko na kolor, kształt nie ma znaczenia.', 'LO-7.hint.both': 'Podpowiedź: najpierw znajdź właściwy kolor, potem przyjrzyj się kształtowi.',
  ...kv('shape', 'circle=koło; square=kwadrat; triangle=trójkąt; star=gwiazda; heart=serce; rectangle=prostokąt; diamond=romb; oval=owal; hexagon=sześciokąt; cross=krzyżyk'),
  ...kv('clue', `circle=koło jest okrągłe i nie ma rogów; square=kwadrat ma cztery równe boki; triangle=trójkąt ma trzy boki i trzy rogi;
    star=gwiazda ma pięć ramion; heart=serce ma u góry dwa łuki, a na dole szpic; rectangle=prostokąt ma cztery boki: dwa długie i dwa krótkie;
    diamond=romb wygląda jak kwadrat stojący na rogu; oval=owal to wydłużone koło; hexagon=sześciokąt ma sześć boków; cross=krzyżyk ma cztery ramiona`),
  ...kv('color', 'red=czerwony; blue=niebieski; green=zielony; yellow=żółty; orange=pomarańczowy; purple=fioletowy; pink=różowy'),
  'time.0': 'godzina {h}:00', 'time.30': 'godzina {h}:30', 'time.15': 'godzina {h}:15', 'time.45': 'godzina {h}:45', 'time.m': 'godzina {h}:{mm}', 'time.24': 'godzina {h}:{mm}',
  'LO-8.prompt': ['Dotknij zegara, który pokazuje: {time}!', 'Gdzie jest {time}?'], 'LO-8.yes': 'Tak! Jest {time}!',
  'LO-8.hint': 'Podpowiedź: krótka wskazówka pokazuje godziny, długa minuty.', 'LO-8.hintHard': 'Podpowiedź: najpierw spójrz na krótką wskazówkę (godzina), potem na długą (minuty).',
  'money.e1': 'jedno euro', 'money.e': 'euro: {e}', 'money.c1': 'jeden cent', 'money.c': 'centy: {c}', 'money.ec': 'euro: {e}, centy: {c}',
  'LO-9.prompt': ['Dotknij karty, na której jest: {money}!', 'Gdzie jest dokładnie: {money}?'], 'LO-9.yes': 'Tak! Razem: {money}!',
  'LO-9.hint': 'Podpowiedź: najpierw policz banknoty i duże monety, potem dodaj małe.',
  'TR.dots': ['Obrysuj kropkowaną linię!', 'Prowadź palec po kropkach!'], 'TR.faint': 'Rysuj po małych kropkach.',
  'TR.free': ['Teraz narysuj sam, jak na wzorze!', 'Twoja kolej: narysuj bez kropek!'], 'TR.yes': ['Brawo! Pięknie!', 'Super!', 'Jaki ładny rysunek!'],
  'TR.hint': 'Patrz, pokażę ci! Zacznij od zielonej kropki numer jeden.',
  'LO-10.prompt': ['Odwróć dwie karty. Jeśli są takie same, wygrywasz parę!', 'Znajdź wszystkie pary!'],
  'LO-10.promptForeign': ['Odwracaj karty i szukaj par! Słuchaj… po angielsku!', 'Znajdź pary i posłuchaj angielskich słów!'],
  'LO-10.yes': ['Brawo, znalazłeś wszystkie pary!', 'Co za pamięć! Wszystkie pary!'], 'LO-10.hint': 'Zapamiętaj, gdzie są obrazki, które już widziałeś!',
  'VO-1.prompt': ['Jak to się nazywa?', 'Co to jest?', 'Powiedz mi, co to jest!'], 'VO-1.repeat': 'Posłuchaj uważnie: {word}. Teraz ty powiedz!',
  'VO-2.prompt': ['Jak jest po angielsku: {word}?', 'Powiedz po angielsku: {word}!'], 'VO-2.yes': ['Brawo, świetnie powiedziane!', 'Super, mówisz po angielsku!', 'Idealnie!'],
  'VO-2.repeat': 'Posłuchaj uważnie i powtórz za mną:', 'VO-2.fallback': 'Dotknij obrazka do angielskiego słowa:', 'VO-2.hint': 'Podpowiedź: pomyśl o angielskich słowach, które już znasz!',
  'l.handover': ['Brawo, {current}! Teraz kolej: {next}!', 'Dziękuję, {current}! {next}, twoja kolej!'],
  'l.gift': ['Urosłem! Wybierz dla mnie prezent!', 'Prezent! Który mi dasz?'], 'l.giftThanks': 'Och, {item}! Dziękuję!',

  ...kv('num', `0=zero; 1=jeden|jedna|jedno; 2=dwa|dwie; 3=trzy; 4=cztery; 5=pięć; 6=sześć; 7=siedem; 8=osiem; 9=dziewięć; 10=dziesięć;
    11=jedenaście; 12=dwanaście; 13=trzynaście; 14=czternaście; 15=piętnaście; 16=szesnaście; 17=siedemnaście; 18=osiemnaście;
    19=dziewiętnaście; 20=dwadzieścia`),

  'l.hello': ['Cześć, {name}! To ja, twój dino!', 'Cześć, {name}! Będziemy się świetnie bawić!'],
  'l.welcome_back': ['Wróciłeś, {name}! Hura!', 'Cześć, {name}! Tak na ciebie czekałem!', 'O, jesteś! Pobawimy się?'],
  'l.home.play': ['Dotknij zielonego przycisku: ruszamy w podróż po świecie gier!', 'Gramy? Dotknij zielonego przycisku!'],
  'l.home.categories': ['A żeby wybrać grę, dotknij małego przycisku.'], 'l.random.go': ['Ruszamy!', 'Start! Dookoła świata!', 'Chodź, gramy!'],
  'l.home.choose': ['Wybierz grę! Dotknij dużej bańki.'], 'l.home.EN-1': ['Flaga: słowa po angielsku!'], 'l.home.MO-1': ['Pokaż mi rzeczy na świecie!'],
  'l.home.LO-1': ['Układanka: co nie pasuje?'], 'l.home.LO-2': ['Liczydło: liczymy!'], 'l.home.MO-3': ['Cień: czyj to?'], 'l.home.LO-3': ['Strzałki: co dalej?'],
  'l.home.LO-4': ['Waga: gdzie więcej?'], 'l.home.LO-5': ['Liczby: liczymy!'], 'l.home.LO-11': ['Ucho: liczenie w pamięci!'], 'l.home.VO-13': ['Mikrofon: powiedz wynik!'],
  'l.home.EN-2': ['Dziesiątka: liczby po angielsku!'], 'l.home.MO-4': ['Uścisk dłoni: co do siebie pasuje?'], 'l.home.MO-5': ['Linijka: co jest naprawdę większe?'],
  'l.home.LO-6': ['Liczby: znajdź właściwą liczbę!'], 'l.home.LO-10': ['Karty: memory!'], 'l.home.EN-3': ['Joker: memory po angielsku!'],
  'l.home.LO-7': ['Paleta: kształty i kolory!'], 'l.home.LO-8': ['Budzik: która godzina?'], 'l.home.LO-9': ['Banknot: liczymy pieniądze!'],
  'l.home.TR-1': ['Ołówek: rysujemy kształty!'], 'l.home.TR-2': ['Pisząca ręka: rysujemy litery i cyfry!'], 'l.home.MO-6': ['Mapa: pytania o twój kraj!'],
  'l.intro.MIX': ['Słuchaj uważnie każdego pytania!', 'Nadstaw uszu!', 'Gotowy? Ja tak!'],
  'l.short.EN-1': ['Po angielsku!'], 'l.short.MO-1': ['Pokaż!'], 'l.short.MO-3': ['Cień!'], 'l.short.LO-1': ['Co nie pasuje?'], 'l.short.LO-2': ['Liczymy!'],
  'l.short.LO-3': ['Co dalej?'], 'l.short.LO-4': ['Więcej czy mniej!'], 'l.short.LO-5': ['Działanie!'], 'l.short.LO-11': ['Liczenie w pamięci!'],
  'l.short.VO-13': ['Powiedz wynik!'], 'l.short.EN-2': ['Liczba po angielsku!'], 'l.short.MO-4': ['Co pasuje?'], 'l.short.MO-5': ['Największe czy najmniejsze!'],
  'l.short.LO-6': ['Znajdź liczbę!'], 'l.short.LO-10': ['Memory!'], 'l.short.EN-3': ['Memory po angielsku!'], 'l.short.LO-7': ['Kształty i kolory!'],
  'l.short.LO-8': ['Która godzina?'], 'l.short.LO-9': ['Pieniądze!'], 'l.short.TR-1': ['Rysujemy!'], 'l.short.TR-2': ['Piszemy!'], 'l.short.MO-6': ['Pytanie o twój kraj!'],
  'l.home.level': ['Gwiazdka to mój poziom!'], 'l.intro.EN-1': ['Mówię słowo po angielsku. Dotknij właściwego obrazka!'],
  'l.intro.MO-1': ['Słuchaj uważnie i dotknij tego, co powiem.', 'Ruszamy dookoła świata! Znajdź to, co powiem.'],
  'l.intro.LO-1': ['Przyjrzyj się obrazkom. Tylko jeden nie jest z tej samej rodziny: znajdź go!'], 'l.intro.LO-2': ['Liczymy! Policz owoce i dotknij właściwej liczby.'],
  'l.intro.MO-3': ['Przyjrzyj się temu czarnemu cieniowi. Odgadnij, czyj to!'], 'l.intro.LO-3': ['Przyjrzyj się szeregowi i znajdź, co będzie dalej.'],
  'l.intro.LO-4': ['Przyjrzyj się kartom. Znajdź tę, o którą proszę!'], 'l.intro.LO-11': ['Liczenie bez obrazków! Słuchaj uważnie, licz w pamięci i dotknij właściwej liczby.'],
  'l.intro.VO-13': ['Mówię działanie, a ty mówisz wynik. Dotknij mikrofonu, aby odpowiedzieć!'],
  'l.intro.LO-5': ['Liczymy! Słuchaj uważnie i dotknij właściwej liczby.', 'Czas na liczenie! Możesz liczyć na palcach.'],
  'l.intro.EN-2': ['Mówię liczbę po angielsku. Dotknij właściwej liczby!'], 'l.intro.MO-4': ['Niektóre rzeczy do siebie pasują, jak klucz i kłódka. Znajdź parę!'],
  'l.intro.MO-5': ['Na obrazkach wszystko jest tej samej wielkości. A naprawdę? Znajdź to, o co proszę!'], 'l.intro.LO-6': ['Mówię liczbę. Znajdź ją wśród kart!'],
  'l.intro.LO-10': ['Gramy w memory! Odwróć dwie karty: jeśli obrazki są takie same, wygrywasz parę!'],
  'l.intro.EN-3': ['Memory po angielsku! Gdy odwrócisz kartę, powiem słowo po angielsku. Znajdź pary!'],
  'l.intro.LO-7': ['Bawimy się kształtami i kolorami! Słuchaj uważnie i dotknij właściwego kształtu.'],
  'l.intro.LO-8': ['Przyjrzyj się zegarom! Krótka wskazówka pokazuje godziny, długa minuty.'], 'l.intro.LO-9': ['Bawimy się w sklep! Policz monety i znajdź właściwą kwotę.'],
  'l.intro.TR-1': ['Rysujemy palcem! Zacznij od zielonej kropki i prowadź po kropkowanej linii.'],
  'l.intro.TR-2': ['Uczymy się pisać! Zacznij od zielonej kropki numer jeden i prowadź po kropkowanej linii.'],
  'l.intro.MO-6': ['Porozmawiajmy o twoim kraju! Słuchaj uważnie i dotknij właściwego obrazka.', 'Dobrze znasz swój kraj? Zadam ci pytania!'],
  'l.trace.start': ['Połóż palec na zielonej kropce i prowadź po małych kropkach.'], 'l.trace.continue': ['Dalej, już prawie!'],
  'l.trace.retry': ['Prawie! Zmażemy i zaczniemy od nowa?'], 'l.tutorial': ['Patrz, pokażę ci! Dotykamy właściwego obrazka, o tak.'], 'l.tutorial_your_turn': ['Teraz ty!'],
  'l.correct': ['Brawo, {name}!', 'Świetnie, {name}!', 'Dokładnie!', 'Super!', 'Fantastycznie!', 'Tak!', 'Mistrz!', 'Jesteś gwiazdą!', 'Idealnie!'],
  'l.wrong': ['Ups! Spróbuj jeszcze raz!', 'Hmm, przyjrzyj się…', 'Nie to! Szukaj dalej!', 'Prawie! Jeszcze raz!', 'Nic nie szkodzi, spróbuj ponownie!'],
  'l.hint': ['Pomogę ci: dotknij tego, co świeci!'], 'l.streak': ['Trzy z rzędu! Jesteś świetny!'], 'l.idle': ['Jesteś tam? Dotknij karty!'],
  'l.touch_me': ['Żeby usłyszeć jeszcze raz, dotknij mnie!'], 'l.review_due': ['To już razem widzieliśmy. Pamiętasz?'], 'l.review': ['Wszystko już umiesz! Powtórzymy?'],
  'l.series_perfect': ['Wow, wszystko dobrze! Prawdziwa gwiazda z ciebie, {name}!', 'Ani jednego błędu! Tańczę z radości!'],
  'l.series_great': ['Niesamowite! Prawie wszystko dobrze!', 'Ale talent, {name}!'], 'l.series_good': ['Bardzo dobra gra! Szybko się uczysz!'],
  'l.series_ok': ['Dobra gra! Poćwiczymy jeszcze?'], 'l.series_encourage': ['Trudne było, prawda? Ja też się uczę!', 'Nic nie szkodzi! Uczymy się, bawiąc.'],
  'l.end.feed': ['Zobacz ten koszyk owoców! Dotknij koszyka, żeby mi go dać.'], 'l.end.nothing': ['Tym razem nie ma owoców. Zagramy jeszcze raz, żeby jakieś wygrać?'],
  'l.end.again': ['Dotknij zielonego przycisku, żeby zagrać jeszcze raz!'], 'l.fly.visit': ['Patrz, mucha!'],
  'l.home.ambient': ['Chyba wulkan wciąż wybucha.', 'Jestem trochę głodny.', 'Patrz, chmury płyną!'], 'l.fly.caught': ['Siorb! Mucha!', 'Mam ją!'],
  'l.fruit.won': ['Owoc dla mnie!'], 'l.eating': ['Mniam mniam!', 'Pyszne!', 'Jeszcze, proszę!', 'Dziękuję!'], 'l.full': ['Mój brzuszek jest pełny! Resztę zostawię na później.'],
  'l.level_up': ['Och! Rosnę! Dziękuję, że tak dobrze się mną opiekujesz!', 'Patrz, jestem większy!'], 'l.tickle': ['Hi hi, łaskocze!', 'Ha ha ha! Przestań!'],
  'l.start': ['Dotknij mnie, żeby mnie obudzić!'], 'l.parent_code': ['Zanim zagramy, zawołaj mamę albo tatę! Muszą wybrać dla mnie tajny kod.'],
  'l.parent_code_done': ['Dziękuję! Teraz możemy grać razem!'], 'l.wardrobe.intro': ['Przeciągnij rzecz na mnie, żebym ją założył!'],
  'l.wardrobe.drag': ['Trzymaj palec na rzeczy i przeciągnij ją do mnie!'], 'l.wardrobe.off': ['Dobrze, zdejmuję!'],
  'l.wardrobe.empty': ['Moja szafa jest pusta! Gdy urosnę, wygrasz dla mnie jakąś rzecz.'], 'l.home.wardrobe': ['Kapelusz jest do przebierania mnie!'],
  'l.gift.waiting': ['Urosłem! Dotknij prezentu, żeby wybrać dla mnie rzecz.'], 'l.gift.go': ['Urosłem! Chodź do mojej szafy: czeka na ciebie prezent!'],
  'l.wardrobe.new': ['Przeciągnij to na mnie, żebym założył!'], 'l.wardrobe.take_off': ['Żeby coś ze mnie zdjąć, odciągnij to ode mnie.'],
  'l.night.last': ['Och, robi się późno… Ostatnia runda i spać?'], 'l.night.goodnight': ['To była ostatnia runda! Dziękuję za piękny dzień. Dobranoc!'],
  'l.night.sleep': ['Ćśś… śpię. Chrr… Do jutra!'], 'l.bedtime': ['Dziś dużo się bawiliśmy! Teraz idę spać. Zagramy jutro?'],
  'l.streak5': ['Pięć z rzędu! Jesteś geniuszem!'], 'l.correct_after_try': ['Znalazłeś! Widzisz, wystarczyło poszukać!'], 'l.halfway': ['Już połowa! Tak trzymaj!'],
  'l.last_question': ['Ostatnie pytanie!'], 'l.home.voice': ['Mikrofon: gry, w których odpowiadasz głosem!'], 'l.home.voice_choose': ['Tu odpowiadasz, mówiąc! Wybierz grę.'],
  'l.intro.VO-1': ['Pokazuję ci obrazek. Dotknij mikrofonu i powiedz, jak to się nazywa.'], 'l.intro.VO-2': ['Mówimy po angielsku! Dotknij mikrofonu i powiedz słowo po angielsku.'],
  'l.home.VO-1': ['Mówiąca głowa: nazwij obrazki!'], 'l.home.VO-2': ['Flaga: powiedz słowa po angielsku!'], 'l.short.VO-1': ['Jak to się nazywa?'], 'l.short.VO-2': ['Po angielsku!'],
  'l.voice.tap_mic': ['Dotknij mikrofonu i odpowiedz mi.', 'Twoja kolej! Dotknij mikrofonu i mów głośno.'], 'l.voice.listening': ['Słucham!'],
  'l.voice.unheard': ['Nie usłyszałem cię dobrze. Dotknij mikrofonu i mów głośniej.'], 'l.voice.wrong': ['To nie to! Spróbuj jeszcze raz!'],
  'l.voice.cards': ['Moje uszy są zmęczone! Dotknij palcem właściwej odpowiedzi.'], 'l.voice.give_up': ['Mikrofon mnie słabo słyszy. Od teraz gramy palcem!'],
  'l.voice.loading': ['Poczekaj, czyszczę uszy…'], 'l.voice.no_mic': ['Och, nie słyszę cię. Gramy palcem!'],
  'l.egg.1': ['Puk puk! Jest tam kto?', 'Och! Coś się tam rusza!'], 'l.egg.2': ['Jeszcze! Pomóż mi wyjść!'], 'l.egg.3': ['Prawie! Jeszcze jedno puknięcie!'],
  'l.egg.hatched': ['Cześć!', 'Uff! Jestem!'],
  'l.hello.1': ['Cześć! Jestem twój dino, mały {color} dinozaurek. Pomożesz mi rosnąć?'],
  'l.hello.4': ['Będziemy razem grać w mnóstwo gier: zwierzęta, kształty, litery, liczby, a nawet inny język!'], 'l.hello.5': ['Za każdym razem, gdy znajdziesz dobrą odpowiedź za pierwszym razem, wygrywasz owoc. Patrz, wpadają do mojego koszyka!'],
  'l.hello.6': ['Potem dajesz mi je do zjedzenia. Mniam! Im więcej jem, tym bardziej rosnę!'], 'l.hello.7': ['A kiedy rosnę, wygrywasz prezenty: ubranka do przebierania mnie, gwiazdki i niespodzianki!'], 'l.hello.2': ['Dopiero co się wyklułem… Jeszcze nic nie wiem o świecie! Z tobą wszystkiego się nauczę.'], 'l.hello.9': ['W „Mój dino” możesz mnie ubrać, jak tylko chcesz: kapelusze, okulary, peleryny… Będę najpiękniejszym dino!'], 'l.hello.10': ['A jeśli się pomylisz, nic nie szkodzi: dam ci podpowiedź i spróbujemy jeszcze raz razem!'], 'l.hello.8': ['No to ruszamy!'],
  'l.hello.name': ['Ale najpierw powiedz: jak masz na imię? Dotknij mikrofonu i powiedz głośno swoje imię!'],
  'l.hello.name_again': ['Nie usłyszałem cię dobrze. Dotknij mikrofonu i powtórz swoje imię!'], 'l.hello.name_ok': ['Miło cię poznać, {name}! Jakie ładne imię!'],
  'l.hello.name_later': ['Powiesz mi imię później: mama albo tata mi je zapiszą!'],
  'l.hello.age': ['A ty, {name}, ile masz lat? Dotknij mikrofonu i powiedz mi!'], 'l.hello.age_again': ['Nie usłyszałem cię dobrze. Ile masz lat? Dotknij mikrofonu!'],
  'l.hello.age_later': ['Nic nie szkodzi: mama albo tata mi powiedzą!'],
  'l.hello.sibling': ['Cześć, {name}! Jestem twój dino, mały {color} dinozaurek. Będziemy się świetnie bawić!'],
  'l.hello.mic_allow': ['Jeśli na ekranie pojawi się komunikat, poproś dorosłego, żeby dotknął „Zezwól”!'],
  'l.hello.parent': ['Teraz daj telefon mamie albo tacie! Wybiorą tajny kod, tylko dla mnie.'], 'l.welcome_first': ['To mój dom, {name}! Będziemy się świetnie bawić!'],
  'l.burp': ['Ups! Przepraszam!', 'Przepraszam… to było takie pyszne!'], 'l.fart': ['Ups… przepraszam!', 'Hi hi, to nie ja!'],
  'l.hunger.growl': ['Słyszysz? Burczy mi w brzuchu! Daj mi koszyk!'], 'l.hunger.look': ['Mmm… ten owoc wygląda pysznie… Dotknij koszyka!'],
  'l.hunger.beg': ['Proszę, proszę! Daj mi koszyk!', 'No, {name}, proszę! Jestem głodny!'], 'l.hunger.gape': ['Patrz, szeroko otwieram buzię: aaa! Wkładaj owoc!'],
  'l.hunger.sad': ['Jestem taki głodny… Dotknij koszyka!'], 'l.child.turn': ['Twoja kolej, {name}! Gramy razem?'],
  'l.child.ask_name': ['Cześć! Zawołaj mamę albo tatę: muszą mi powiedzieć, jak masz na imię!'], 'l.age.ask': ['Ile masz lat? Dotknij tortu ze swoim wiekiem!'],
  'l.age.3': ['Trzy lata! Super!'], 'l.age.4': ['Cztery lata! Super!'], 'l.age.5': ['Pięć lat! Świetnie!'], 'l.age.6': ['Sześć lat! Świetnie!'], 'l.age.7': ['Siedem lat! Wow!'],

  // ---- Mon pays ----
  "lang.ko": "koreański", "lang.ne": "nepalski",
  'cty.flag': 'Jaka jest flaga kraju: {country}?', 'cty.flagHard': 'Uwaga, są podobne! Jaka jest flaga kraju: {country}?',
  'cty.flagYes': 'Tak! To flaga kraju: {country}!', 'cty.flagHint': 'przyjrzyj się kolorom i ich kolejności',
  'cty.symbol': 'Co jest symbolem kraju: {country}?', 'cty.symbolYes': 'Tak! To symbol kraju: {country}!', 'cty.symbolYesName': 'Tak! {name} — symbol kraju: {country}!',
  'cty.food': ['Jaka potrawa jest typowa dla kraju: {country}?', 'Co się chętnie je w kraju: {country}?'], 'cty.foodYes': 'Mniam! To typowa potrawa kraju: {country}!',
  'cty.day': '{date} — święto narodowe kraju: {country}! Co oglądamy wieczorem na niebie?', 'cty.dayYes': 'Tak! {date} są wielkie fajerwerki!',
  'cty.currency': 'Czym się płaci w kraju: {country}?', 'cty.currencyYes': 'Tak! Płaci się tak: {money}!',
  'cty.place': 'Jakie słynne miejsce jest w kraju: {country}?', 'cty.sport': 'Jaki sport lubią w kraju: {country}?',
  'cty.thing': 'Co często widać na świętach w kraju: {country}?', 'cty.landmarkYes': 'Tak! Brawo, dobrze znasz swój kraj!',
  'cty.capital': 'Jaka jest stolica kraju: {country}? Przeczytaj uważnie nazwy miast!', 'cty.capitalYes': 'Tak! Stolica to {city}!',
  'cty.neighbour': 'Która z tych flag należy do sąsiada kraju: {country}?', 'cty.neighbourYes': 'Tak! Ten kraj jest tuż obok!',
  'cty.neighbourHint': 'sąsiedzi są bardzo blisko, na tym samym kontynencie',

  ...kv('c', `dog=pies; cat=kot; fish=ryba; bird=ptak; cow=krowa; pig=świnia; horse=koń; duck=kaczka; rabbit=królik; hen=kura; sheep=owca;
    frog=żaba; mouse=mysz; dinosaur=dinozaur; red=czerwony; blue=niebieski; green=zielony; yellow=żółty; orange_color=pomarańczowy; purple=fioletowy;
    pink=różowy; black=czarny; white=biały; brown=brązowy; apple=jabłko; banana=banan; strawberry=truskawka; cherry=wiśnia; orange=pomarańcza;
    egg=jajko; ice_cream=lody; pizza=pizza; grapes=winogrona; pear=gruszka; lemon=cytryna; carrot=marchewka; bread=chleb; milk=mleko; cake=ciasto;
    watermelon=arbuz; cookie=ciastko; cheese=ser; tomato=pomidor; pineapple=ananas; peach=brzoskwinia; broccoli=brokuł; corn=kukurydza;
    kiwi=kiwi; mango=mango; blueberries=borówki; coconut=kokos; car=samochód; ball=piłka; bus=autobus; train=pociąg; plane=samolot;
    boat=łódka; bike=rower; balloon=balon; teddy=miś; book=książka; house=dom; kite=latawiec; bed=łóżko; chair=krzesło; door=drzwi; key=klucz;
    clock=zegar; sun=słońce; moon=księżyc; star=gwiazda; flower=kwiat; cloud=chmura; rainbow=tęcza; tree=drzewo; rain=deszcz;
    snowflake=płatek śniegu; snowman=bałwan; leaf=liść; mountain=góra; fire=ogień; sunflower=słonecznik; drop=kropla wody; eye=oko; ear=ucho;
    nose=nos; mouth=usta; hand=ręka; foot=stopa; tooth=ząb; lion=lew; tiger=tygrys; elephant=słoń; monkey=małpa; bear=niedźwiedź;
    giraffe=żyrafa; zebra=zebra; panda=panda; snake=wąż; turtle=żółw; crocodile=krokodyl; kangaroo=kangur; hippo=hipopotam; gorilla=goryl;
    rhino=nosorożec; butterfly=motyl; bee=pszczoła; ladybug=biedronka; spider=pająk; ant=mrówka; snail=ślimak; dolphin=delfin; whale=wieloryb;
    octopus=ośmiornica; crab=krab; shark=rekin; owl=sowa; penguin=pingwin; parrot=papuga; flamingo=flaming; peacock=paw; eagle=orzeł;
    swan=łabędź; hat=kapelusz; shoe=but; dress=sukienka; cap=czapka z daszkiem; socks=skarpetki; gloves=rękawiczki; tshirt=koszulka;
    glasses=okulary; umbrella=parasol; pencil=ołówek; spoon=łyżka; scissors=nożyczki; hammer=młotek; ladder=drabina; broom=miotła;
    bottle=butelka dla niemowlęcia; toothbrush=szczoteczka do zębów; guitar=gitara; drum=bęben; piano=pianino; violin=skrzypce; trumpet=trąbka;
    helicopter=helikopter; tractor=traktor; rocket=rakieta; ambulance=karetka; motorbike=motocykl; fire_engine=wóz strażacki;
    police_car=radiowóz; scooter=hulajnoga; sled=sanki; llama=lama; goat=koza; camel=wielbłąd; hedgehog=jeż; squirrel=wiewiórka;
    bat=nietoperz; deer=jeleń; wolf=wilk; fox=lis; raccoon=szop pracz; beaver=bóbr; otter=wydra; sloth=leniwiec; skunk=skunks; bison=żubr;
    castle=zamek; tent=namiot; lighthouse=latarnia morska; volcano=wulkan; island=wyspa; anchor=kotwica; magnet=magnes; compass=kompas;
    microscope=mikroskop; telescope=teleskop; hourglass=klepsydra; jellyfish=meduza; seal=foka; lobster=homar; shrimp=krewetka;
    squid=kałamarnica; oyster=ostryga; beetle=chrząszcz; cricket=świerszcz; mosquito=komar; worm=dżdżownica; scorpion=skorpion;
    rooster=kogut; turkey=indyk; donkey=osioł; ox=wół; leopard=lampart; polar_bear=niedźwiedź polarny; koala=koala; orangutan=orangutan;
    mammoth=mamut; moose=łoś; badger=borsuk; avocado=awokado; eggplant=bakłażan; garlic=czosnek; onion=cebula; pepper=papryczka chili;
    cucumber=ogórek; potato=ziemniak; mushroom=grzyb; peanuts=orzeszki ziemne; croissant=rogalik; pancakes=naleśniki; honey=miód;
    spaghetti=spaghetti; fries=frytki; sandwich=kanapka; candle=świeca; mirror=lustro; window=okno; bucket=wiadro; bell=dzwon;
    lock=kłódka; light_bulb=żarówka; flashlight=latarka; axe=siekiera; saw=piła; wrench=klucz francuski; screwdriver=śrubokręt;
    paintbrush=pędzel; crayon=kredka; trophy=puchar; medal=medal; ring=pierścionek; skateboard=deskorolka; yoyo=jojo; roller_skate=wrotka;
    canoe=kajak; tram=tramwaj; parachute=spadochron; satellite=satelita; brain=mózg; bone=kość; tongue=język; leg=noga; tornado=tornado;
    lightning=błyskawica; comet=kometa; cactus=kaktus; blossom=kwiat wiśni; feather=piórko`),
  // Espace parents : onglets.
  'p.dailyShort': 'Potem dino idzie spać.', 'p.credits': 'Podziękowania i licencje', 'p.creditsHelp': 'DinoLearn powstał dzięki tym programom, głosom, obrazkom, czcionkom i dźwiękom. Dziękujemy ich autorom!', 'p.credits.voices': 'Głosy dino', 'p.credits.asr': 'Rozpoznawanie mowy', 'p.credits.code': 'Silnik gry', 'p.credits.images': 'Obrazki i czcionki', 'p.credits.sounds': 'Efekty dźwiękowe', 'p.tab.profile': 'Profil', 'p.tab.progress': 'Postępy', 'p.tab.games': 'Gry', 'p.tab.settings': 'Ustawienia', 'p.summary': 'W skrócie', 'p.lower': 'Niżej', 'p.higher': 'Wyżej',
};

export default pl;
