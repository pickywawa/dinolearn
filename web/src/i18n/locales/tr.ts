import type { Catalog } from '../index';
import { kv } from '../kv';

/**
 * Türkçe (ikinci dil: İngilizce). Eklenen kelimelerin arkasına ek gelmesin diye
 * cümleler « Göster: {word}! » gibi kuruldu.
 */
const tr: Catalog = {
  ...kv('lang', 'fr=Fransızca; en=İngilizce; es=İspanyolca; it=İtalyanca; de=Almanca; pt=Portekizce; ru=Rusça; zh=Çince; hi=Hintçe; ar=Arapça; ur=Urduca; bn=Bengalce; id=Endonezce; vi=Vietnamca; tr=Türkçe; fa=Farsça; pl=Lehçe; uk=Ukraynaca'),
  ...kv('country', 'fr=Fransa; be=Belçika; ch=İsviçre; ca=Kanada; lu=Lüksemburg; gb=Birleşik Krallık; us=Amerika Birleşik Devletleri; es=İspanya; mx=Meksika; it=İtalya; de=Almanya; at=Avusturya; pt=Portekiz; br=Brezilya; ru=Rusya; cn=Çin; in=Hindistan; eg=Mısır; ma=Fas; sa=Suudi Arabistan; pk=Pakistan; bd=Bangladeş; cd=Kongo DC'),

  'ui.loading': 'Yükleniyor…', 'ui.rotate': 'Tableti çevir!', 'ui.tap': 'Oynamak için ekrana dokun!', 'ui.retry': 'Tekrar dene',
  'ui.problem': 'Sorun: {reason}', 'ui.cancel': 'İptal', 'ui.home.playWith': 'Dinonla oyna, {name}!', 'ui.home.learn': 'Dinonla oyna ve öğren!',
  'ui.home.summary': 'Biten tur: {n}. Dinon seninle birlikte büyüyor!',
  'ui.home.sleeping': 'Şşş… dino uyuyor.\nBir ebeveyn koduyla kilidi açabilir.', 'ui.home.timeUp': 'Oyun süresi bitti.\nBir ebeveyn koduyla kilidi açabilir.',
  'ui.child.title': 'Çocuğun adı ne?', 'ui.child.sub': 'Dino ona adıyla seslenecek.', 'ui.parents.title': 'Ebeveyn alanı',
  'ui.pin.type': 'Ebeveyn kodunu yaz.', 'ui.pin.title': 'Ebeveyn kodu', 'ui.pin.choose': '4 haneli bir kod seç.',
  'ui.wardrobe.title': 'Dinom – Gardırop', 'ui.wardrobe.reactions': ['Çok havalı!', 'Bayıldım!', 'Çok yakışıklı oldum!', 'Ne şık!'],
  'ui.choose.voice': 'Sesli', 'ui.choose.voiceTitle': 'Sesinle oyna!', 'ui.choose.title': 'Bir oyun seç!',
  'ui.end.3': 'Aferin!', 'ui.end.2': 'Harika!', 'ui.end.1': 'İyi iş!', 'ui.end.0': 'Devam et!', 'ui.end.done': 'Turu bitirdin!',
  'ui.time.less': 'Daha az süre', 'ui.time.more': 'Daha çok süre', 'ui.lang': 'Dil', 'ui.langLabel': 'Dil:', 'ui.mb': '{n} MB',
  'ui.pack.voice': '{language} paketi', 'ui.pack.asr': 'ses tanıma', 'ui.pack.downloading': 'İndiriliyor: {list}',
  'ui.pack.installing': 'Ses tanıma kuruluyor', 'ui.pack.speechTitle': 'Dinonun sesi ({language})',
  'ui.pack.speechDetail': 'Doğal bir ses, her cihazda aynı.', 'ui.pack.secondTitle': '{language} ses',
  'ui.pack.secondDetail': 'Yabancı dil oyunlarındaki kelimeler için.', 'ui.pack.asrTitle': 'Ses tanıma', 'ui.pack.asrDetail': 'Sesli cevap vermek için.',
  'ui.pack.download': 'İndir', 'ui.pack.installed': 'Kuruldu ✓', 'ui.pack.toDownload': 'İndirilecek: {n} MB (tercihen Wi-Fi ile).',
  'ui.pack.allInstalled': 'Her şey kurulu.', 'ui.pack.running': 'İndiriliyor…', 'ui.pack.finished': 'Bitti.', 'ui.pack.failed': 'Hata: {error}',
  'ui.pack.installingShort': 'Kuruluyor…', 'ui.pack.waiting': 'Bekleniyor…', 'voice.heard': 'Duyduğum: {word}.',

  ...kv('p', `title=Ebeveyn alanı; back=Oyuna dön; noName=İsimsiz; addChild=+ Çocuk ekle; newChild=Yeni çocuk;
    newChildHelp=Ebeveyn alanından çıkınca yeni çocuk kendi yumurtasına dokunacak ve dinosu çıkacak.;
    cancel=İptal; edit=✏️ Profili düzenle; sheetOf=Profil: {name}; sheet=Çocuğun profili; sheetHelp=Ad, yaş ve ayarlar.;
    removeChild=Sil: {name}; thisChild=bu çocuk; removeConfirm=Silinsin mi: {name}, dinosu ve tüm ilerlemesi? Bu geri alınamaz.;
    egg=yumurta henüz çatlamadı; dino=dino; alternateAria=Çocuklar arasında sırayla; age=Yaş: {n}; otherCountry=başka ülke;
    series=oynanan tur; answers=cevap; firstTry=ilk denemede doğru; today=bugün oynandı;
    childrenHelp=Her çocuğun kendi dinosu, ilerlemesi ve ayarları var. Aşağıdaki ayarlar seçili çocuğa ait.;
    alternate=Sırayla: her turdan sonra sıra bir sonraki çocuğa geçer;
    difficulty=Başlangıç zorluğu: 20 üzerinden {n} ({stage}). Sonra sonuçlara göre kendiliğinden ayarlanır.;
    stageCP=1. sınıf; stageK=anaokulu; dinoLevel=Dino seviyesi;
    dinoLevelHelp=Çocuk dinoyu besledikçe dino büyür (seviye 1 ile {max} arası). Zorluğu ayarlamak için değiştirebilirsiniz: 21 ile 40 arası seviyeler 1. sınıfa denk gelir.;
    noNight=Gece modu yok; week=Son 7 günün oyun süresi; daily=Günlük oyun süresi;
    dailyHelp=Süre bitince çocuk turu tamamlar, sonra oyun ertesi güne kadar kilitlenir: dino uyumaya gider. Kodunuzla 15 veya 30 dakika ekleyebilir ya da günü açabilirsiniz.;
    night=Yatma saati (gece modu);
    nightHelp=Bu saatten sonra gökyüzü kararır ve dino esner: son bir tur önerir, sonra sabaha kadar uyur. Kodunuzla çocuk o akşam biraz daha oynayabilir.;
    enable=Aç: {game}; levelOf=Seviye: {game}; levelAuto=Otomatik seviye; level=Seviye {n}; fromAge=Yaş: {n} ve üstü;
    needsVoice=Sesli oyun: mikrofona izin verin ve ses tanımayı indirin ({language}, “Sesler ve indirmeler” bölümü).;
    nAnswers=Cevap: {n}; notPlayed=Henüz oynanmadı; rate=İlk denemede doğru: {rate}; mastered=Öğrenilen soru: {n} / {total};
    lastPlayed=son oynama: {date}; chooseAria=Oyun seçme düğmesi; games=Oyunlar; choose=Ana ekrandaki “Oyun seç” düğmesi;
    chooseHelp=Kapalıyken çocuk gezegenle oynar: her tur yaşına uygun tüm oyunları karıştırır. Açıkken belirli bir oyunu da seçebilir.;
    gamesHelp=Bir oyunu kapatırsanız artık önerilmez. Seviye (1-20; 11-20 = 1. sınıf) bir sonraki turun başlangıcıdır; “otomatik” yaşa, dinoya ve sonuçlara göre hesaplar.;
    reviewToday=bugün tekrar; reviewTomorrow=yarın geri gelecek; reviewOn=geri gelecek: {date}; reviewN=tekrar {n} / {total}; review=Pekiştirilecekler;
    reviewHelp=Yanlış cevaplanan soru ertesi gün, sonra 3 gün sonra, sonra bir hafta sonra geri gelir. Üç kez doğru: öğrenildi; yanlış: ertesi gün baştan başlar.;
    reviewNone=Şimdilik tekrar edilecek bir şey yok. Aferin!; sfxAria=Ses efektleri; musicAria=Arka plan müziği; testVoice=Sesi dene;
    testHello=Merhaba! Ben Dino.; sound=Ses; sfx=Ses efektleri (doğru cevap, hata, ham ham…);
    music=Yumuşak arka plan müziği (çocuk da ana ekrandan kapatabilir);
    phoneVoices=Ana ses: {main} · İkinci dil sesi: {second}. Bunlar telefonun sesleri: daha doğal bir ses için erişilebilirlik ayarlarından (metin okuma) “gelişmiş” bir ses kurun.;
    noVoice=bulunamadı; mic=Mikrofon (sesli oyunlar);
    micHelp=Sesli oyunlarda çocuk konuşarak cevap verir. Her şey bu cihazda kalır: ses asla kaydedilmez veya gönderilmez. Mikrofon yalnızca çocuk büyük mikrofon düğmesine dokunduğunda açılır.;
    noMic=Bu tarayıcı oyunda mikrofon kullanımına izin vermiyor.; allowMic=Mikrofona izin ver; allowMicNow=Tarayıcı penceresinde mikrofona izin verin…;
    micBlocked=Mikrofon engelli. Tarayıcı ayarlarından (adresin yanındaki kilit) izin verip tekrar deneyin.;
    packsWhere=Ses tanıma paketleri “Sesler ve indirmeler” bölümünden indirilir.; removePacks=Paketleri sil;
    removePacksConfirm=Ses tanıma paketleri bu cihazdan silinsin mi? Sesli oyunlar artık önerilmeyecek.; packs=Sesler ve indirmeler;
    packsHelp=Oyunun dili, dinonun doğal sesi (cihazda üretilir, indirildikten sonra internet gerekmez), yabancı dil oyunlarının sesi ve ses tanıma. İndirmeler bu alanı kapatsanız da sürer. Dino sesi yoksa oyun telefonun sesini kullanır.;
    changeCode=Kodu değiştir; newCode=Yeni ebeveyn kodu; newCodeHelp=4 haneli yeni bir kod seçin.; codeChanged=Ebeveyn kodu değişti.; code=Ebeveyn kodu;
    codeHelp=Kod bu alanı açar ve günlük süre bitince oyunun kilidini açar. Unutursanız “Kodu mu unuttunuz?” ile yetişkinler için bir sorudan sonra yeni kod oluşturabilirsiniz.;
    reset=Baştan başla; resetConfirm=Tüm ilerleme silinsin mi (dino seviyesi, cevaplar, meyveler)? Ayarlar korunur.;
    privacy=Gizlilik politikası; close=Kapat; data=Veriler; dataHelp=Her şey yalnızca bu cihazda saklanır. Hiçbir veri gönderilmez.`),

  ...kv('pin', `erase=Sil; remember=İyi hatırlayın.; forgot=Kodu mu unuttunuz?; adultQuestion=Yetişkinler için soru: {a} × {b} kaç eder? (3 hane);
    cancel=İptal; wrongAnswer=Doğru değil.; newCode=Yeni ebeveyn kodu; newCodeHelp=4 haneli yeni bir kod seçin.; wrongCode=Yanlış kod.;
    otherCountry=Başka ülke; firstName=Ad;
    micHtml=<b>Mikrofona izin ver</b> (sesli oyunlar)<br><small>Her şey bu cihazda kalır: ses asla kaydedilmez veya gönderilmez.</small>;
    missionsHtml=<b>Görev seçme</b><br><small>Çocuk oyunlarını seçebilir (“Görevler” düğmesi). İşaretsiz: yalnızca “Oyna” ile rastgele turlar.</small>;
    ok=Tamam; nameMissing=Çocuğun adını yazın.; age=Yaş; years={n} yaş; country=Ülke; daily=Günlük oyun süresi;
    night=Yatma saati (gece modu); none=Yok; welcome=Hoş geldiniz!;
    welcomeHeard=Çocuğunuzun dinoya söyledikleri bunlar: gerekirse düzeltin. Ebeveyn alanından (ana ekrandaki kilit) başka çocuk ekleyebilir ve her şeyi değiştirebilirsiniz.;
    welcomeHelp=Çocuğunuzun adı, yaşı ve ayarları. Ebeveyn alanından (ana ekrandaki kilit) başka çocuk ekleyebilir ve her şeyi değiştirebilirsiniz.;
    yourCode=Ebeveyn kodunuz;
    yourCodeHelp=4 haneli bir kod seçin. Ebeveyn alanını (ana ekrandaki kilit) açar ve günlük süre bitince oyunun kilidini açar. Çocuğunuza söylemeyin!;
    asleep=Dino uyuyor; asleepHelp=Uyku vakti. Bu akşam biraz daha oynamak için ebeveyn kodunu yazın.;
    timeUp=Oyun süresi bitti; timeUpHelp=Bugüne süre eklemek için ebeveyn kodunu yazın.;
    addTime=Süre ekle; todayOnly=Yalnızca bugün.; plus15=15 dakika daha; plus30=30 dakika daha; unlimited=Bugün sınırsız`),

  ...kv('inst', `title=DinoLearn'ü telefona kur; later=Sonra; okay=Tamam; never=Bir daha sorma;
    android=Gerçek bir uygulama gibi tam ekran ve yatay açılır. Başka bir şey indirmeye gerek yok.; menu=Tarayıcı menüsünde:;
    androidSteps=<li><b>⋮</b> simgesine dokunun (sağ üstteki üç nokta).</li><li><b>“Uygulamayı yükle”</b> veya <b>“Ana ekrana ekle”</b> seçin.</li><li>Oyunu dino simgesinden açın.</li>;
    ios=Gerçek bir uygulama gibi, Safari çubukları olmadan tam ekran açılır.;
    iosSteps=<li>{share} <b>Paylaş</b> simgesine dokunun (Safari'nin altında veya üstünde).</li><li><b>“Ana Ekrana Ekle”</b>, sonra <b>Ekle</b> seçin.</li><li>Oyunu dino simgesinden açın.</li>`),

  ...kv('title', `EN-1=İngilizce — Dinle ve dokun; EN-2=İngilizce — Sayılar; EN-3=İngilizce — Hafıza; MO-1=Dünya — Göster;
    MO-3=Dünya — Gölgeler; MO-4=Dünya — Ne ne ile gider; MO-5=Dünya — En büyük; LO-1=Mantık — Farklı olan;
    LO-2=Mantık — Kaç tane?; LO-3=Mantık — Sırada ne var; LO-4=Mantık — Çok ve az; LO-5=Mantık — Hesap;
    LO-6=Mantık — Sayılar; LO-7=Mantık — Şekiller ve renkler; LO-8=Mantık — Saat; LO-9=Mantık — Para;
    LO-10=Mantık — Hafıza; LO-11=Mantık — Dinle ve say; TR-1=Yazı — Şekil çiz; TR-2=Yazı — Harf ve rakam çiz;
    VO-1=Sesli — Bunun adı ne?; VO-2=Sesli — İngilizce söyle!; VO-13=Sesli — Hesap; MO-6=Dünya — Ülkem`),

  ...kv('item', `top-hat=silindir şapka; billed-cap=kep; crown=taç; womans-hat=hasır şapka; graduation-cap=mezuniyet kepi;
    rescue-workers-helmet=itfaiyeci kaskı; headphone=kulaklık; hibiscus=çiçek; glasses=gözlük; sunglasses=güneş gözlüğü;
    goggles=yüzücü gözlüğü; ribbon=papyon; swim-ring=can simidi; sports-medal=madalya; prayer-beads=kolye;
    cape-red=süper kahraman pelerini; cape-blue=büyücü pelerini; wing=kanatlar; balloon=balon; magic-wand=sihirli değnek;
    lollipop=lolipop; sunflower=ayçiçeği; teddy-bear=oyuncak ayı`),
  ...kv('dinocolor', '0=yeşil; 1=mavi; 2=mor; 3=pembe; 4=turuncu; 5=sarı; 6=turkuaz; 7=kırmızı; 8=kahverengi'),

  ...kv('cat', `farm=bir çiftlik hayvanı; sea=bir deniz hayvanı; bird=bir kuş; bug=bir böcek; wild=bir vahşi hayvan; forest=bir orman hayvanı;
    fruit=bir meyve; veg=bir sebze; meal=yiyecek bir şey; vehicle=bir taşıt; toy=bir oyuncak; home=evdeki bir eşya; clothes=giyilen bir şey;
    tool=bir alet; kitchen=her gün kullanılan bir eşya; music=bir müzik aleti; sky=gökyüzündeki bir şey; plant=bir bitki;
    body=vücudun bir parçası; landscape=bir yer; color=bir renk; element=doğadan bir şey`),
  ...kv('fam', `farm=çiftlik hayvanları; sea=deniz hayvanları; bird=kuşlar; bug=böcekler; wild=vahşi hayvanlar; forest=orman hayvanları;
    fruit=meyveler; veg=sebzeler; meal=yiyecekler ve tatlılar; vehicle=taşıtlar; toy=oyuncaklar; home=ev eşyaları; clothes=giysiler;
    tool=aletler; kitchen=banyo ve mutfak eşyaları; music=müzik aletleri; sky=gökyüzü ve hava; plant=bitkiler; body=vücut parçaları;
    landscape=yerler; color=renkler; element=doğadaki şeyler`),
  ...kv('fruit', `red-apple=elma; banana=muz; strawberry=çilek; cherries=kiraz; grapes=üzüm; tangerine=portakal; pear=armut; lemon=limon;
    watermelon=karpuz; peach=şeftali; pineapple=ananas; kiwi-fruit=kivi; mango=mango; blueberries=yaban mersini; melon=kavun;
    green-apple=yeşil elma; coconut=hindistancevizi`),
  ...kv('many', `food-red-apple=elma; food-banana=muz; food-strawberry=çilek; food-pear=armut; food-lemon=limon; food-tangerine=portakal;
    food-kiwi-fruit=kivi; food-peach=şeftali`),

  'g.hintFamily': 'İpucu: {family}.', 'g.word': '{word}!', 'g.yesWord': ['Evet: {word}!', 'Doğru: {word}!'], 'g.yesItIs': 'Evet, bu {word}!',
  'g.hint': 'İpucu: {hint}.', 'g.hintTens': 'İpucu: önce ilk rakama, yani onluklara bak.', 'g.plus': '{a} artı {b}', 'g.minus': '{a} eksi {b}',
  'g.calcPrompt': ['{calc} kaç eder?', '{calc}, sonuç kaç?'], 'g.calcYes': 'Evet! {calc} eşittir {n}!',
  'g.hintAdd': 'İpucu: {a} sayısından başla ve parmaklarınla {b} tane daha say.', 'g.hintSub': 'İpucu: {a} sayısından başla ve parmaklarınla {b} geri say.',
  'MO-1.prompt': ['Göster: {word}!', '{word} nerede?', 'Dokun: {word}!', 'Bulabilir misin? {word}!'],
  'LO-1.prompt': ['Farklı olanı bul! Hangisi aynı aileden değil?', 'Hangi resim diğerlerinden farklı?'],
  'LO-1.yes': 'Evet, {word}! Diğerleri: {family}.', 'LO-1.hint': 'İpucu: {n} resim şu aileden: {family}. Olmayanı bul.',
  'LO-2.prompt': ['Kaç tane {things} var? İyice say!', 'Say bakalım: {things}. Kaç tane?'],
  'LO-2.promptMixed': 'Kaç tane {things} var? Dikkat, yalnızca {things} say!', 'LO-2.yes': '{list}. Toplam {n}!',
  'LO-2.hint': 'İpucu: her meyveye parmağınla dokun ve yavaşça say.', 'LO-2.hintBig': 'İpucu: önce ona kadar say, sonra devam et: on bir, on iki, on üç…',
  'MO-3.prompt': ['Bu kimin gölgesi? Doğru resme dokun!', 'Bu gölgenin arkasında kim saklanıyor?'],
  'LO-3.prompt': ['Diziye iyi bak. Sırada hangi meyve var?', 'Diziyi hangi meyve devam ettirir?'], 'LO-3.yes': 'Evet! {list}!',
  'LO-3.hint': 'İpucu: dizi hep aynı şekilde yeniden başlıyor. {list}…', 'LO-3.numPrompt': 'Bak ve dinle: {list}. Sırada hangi sayı var?',
  'LO-3.numYes': 'Evet! {list}, {n}!', 'LO-3.hintGrow': 'İpucu: bir ekliyoruz, sonra iki, sonra üç… sonra?',
  'LO-3.hintPlus': 'İpucu: her seferinde {n} ekliyoruz.', 'LO-3.hintMinus': 'İpucu: her seferinde {n} çıkarıyoruz.',
  'LO-4.num.most': 'En büyük sayıya dokun!', 'LO-4.num.least': 'En küçük sayıya dokun!',
  'LO-4.numYes.most': 'Evet! En büyüğü: {n}!', 'LO-4.numYes.least': 'Evet! En küçüğü: {n}!',
  'LO-4.numHint.most': 'İpucu: sayarken en büyük sayı en sona gelir.', 'LO-4.numHint.least': 'İpucu: sayarken en küçük sayı en başta gelir.',
  'LO-4.pile.most': 'En çok {things} nerede? Doğru karta dokun!', 'LO-4.pile.least': 'En az {things} nerede? Doğru karta dokun!',
  'LO-4.pileYes.most': 'Evet! Burada {n} tane var. En çok bu!', 'LO-4.pileYes.least': 'Evet! Burada {n} tane var. En az bu!',
  'LO-4.pileHint.least': 'İpucu: çok az meyve olan kartı ara.', 'LO-4.pileHint.most': 'İpucu: en dolu kartı ara.',
  'LO-5.compl': '{a} artı kaç eşittir {b}?', 'LO-5.complYes': 'Evet! {a} artı {x} eşittir {b}!', 'LO-5.complHint': 'İpucu: {a} sayısından {b} sayısına kadar parmaklarınla say.',
  'LO-5.add': 'Bak, {a} tane {things}. {b} tane daha koyuyorum. Toplam kaç tane?', 'LO-5.eat': 'Bak, {a} tane {things}. Dino {b} tane yiyor. Kaç tane kaldı?',
  'LO-5.addHint': 'İpucu: soldaki ve sağdaki bütün meyveleri say.', 'LO-5.eatHint': 'İpucu: yalnızca üstü çizilmemiş meyveleri say.',
  'LO-11.prompt': ['İyi dinle: {calc}. Kaç eder?', '{calc} kaç eder?', 'Aklından: {calc}. Cevaba dokun!'],
  'VO-13.prompt': ['{calc} kaç eder? Söyle bana!', '{calc}, sonuç kaç? Söyle!'], 'VO-13.repeat': 'Dinle: {calc} eşittir {n}. Şimdi sen söyle!',
  'VO-13.fallback': '{calc} kaç eder? Doğru sayıya dokun!',
  'MO-4.prompt': ['Bak: {word}. Bununla ne gider?', 'Eşini bul: {word}!'], 'MO-4.yes': 'Evet! {a} ve {b} birlikte gider!',
  'MO-4.hint': 'İpucu: düşün: {word}. Yanında sık sık ne görürüz?',
  'MO-5.prompt.big': ['Gerçekte hangisi en büyük?', 'Gerçekte en büyük olana dokun!'], 'MO-5.prompt.small': ['Gerçekte hangisi en küçük?', 'Gerçekte en küçük olana dokun!'],
  'MO-5.yes.big': 'Evet! Gerçekte en büyüğü: {word}!', 'MO-5.yes.small': 'Evet! Gerçekte en küçüğü: {word}!',
  'MO-5.hint': 'İpucu: resimlerde hepsi aynı boyda. Onları gerçekten yanında hayal et!',
  'LO-6.prompt': ['{n} sayısına dokun!', '{n} sayısı nerede?', 'Bul: {n}!'], 'LO-6.yes': 'Evet! Bu {n}!',
  'LO-6.hint': 'İpucu: parmaklarınla {n} sayısına kadar say ve o sayıyı ara.', 'LO-6.hintBig': 'İpucu: önce ilk rakama, sonra ikinci rakama iyi bak.',
  'EN-2.hint': 'İpucu: parmaklarınla İngilizce say ve doğru sayıyı duyunca dur.',
  'LO-7.shape': 'Dokun: {shape}!', 'LO-7.color': 'Rengi {color} olan şekle dokun!', 'LO-7.both': 'Dokun: {shape}, renk: {color}!',
  'LO-7.yes.shape': 'Evet: {shape}!', 'LO-7.yes.color': 'Evet, renk: {color}!', 'LO-7.yes.both': 'Evet: {shape}, renk: {color}!',
  'LO-7.hint.color': 'İpucu: yalnızca renge bak, şekil önemli değil.', 'LO-7.hint.both': 'İpucu: önce doğru rengi bul, sonra şekle iyi bak.',
  ...kv('shape', 'circle=daire; square=kare; triangle=üçgen; star=yıldız; heart=kalp; rectangle=dikdörtgen; diamond=eşkenar dörtgen; oval=oval; hexagon=altıgen; cross=artı işareti'),
  ...kv('clue', `circle=daire yuvarlaktır, köşesi yoktur; square=karenin dört eşit kenarı vardır; triangle=üçgenin üç kenarı ve üç köşesi vardır;
    star=yıldızın beş ucu vardır; heart=kalbin üstte iki kavisi, altta bir sivri ucu vardır; rectangle=dikdörtgenin iki uzun, iki kısa kenarı vardır;
    diamond=eşkenar dörtgen ucunun üstünde duran bir kare gibidir; oval=oval uzatılmış bir dairedir; hexagon=altıgenin altı kenarı vardır;
    cross=artı işaretinin dört kolu vardır`),
  ...kv('color', 'red=kırmızı; blue=mavi; green=yeşil; yellow=sarı; orange=turuncu; purple=mor; pink=pembe'),
  'time.0': 'saat {h}', 'time.30': 'saat {h} buçuk', 'time.15': 'saat {h}:15', 'time.45': 'saat {h}:45', 'time.m': 'saat {h}:{mm}', 'time.24': 'saat {h}:{mm}',
  'LO-8.prompt': ['Şu saati gösteren saate dokun: {time}!', 'Hangisi {time}?'], 'LO-8.yes': 'Evet! Şu an {time}!',
  'LO-8.hint': 'İpucu: kısa kol saati, uzun kol dakikayı gösterir.', 'LO-8.hintHard': 'İpucu: önce saat için kısa kola, sonra dakika için uzun kola bak.',
  'money.e1': 'bir avro', 'money.e': '{e} avro', 'money.c1': 'bir sent', 'money.c': '{c} sent', 'money.ec': '{e} avro {c} sent',
  'LO-9.prompt': ['Şu kadar para olan karta dokun: {money}!', 'Tam olarak nerede var: {money}?'], 'LO-9.yes': 'Evet! Toplam {money}!',
  'LO-9.hint': 'İpucu: önce banknotları ve büyük paraları say, sonra küçükleri ekle.',
  'TR.dots': ['Noktalı çizginin üstünden geç!', 'Parmağınla noktaları takip et!'], 'TR.faint': 'Küçük noktaları takip ederek çiz.',
  'TR.free': ['Şimdi örnekteki gibi kendin çiz!', 'Sıra sende: noktasız çiz!'], 'TR.yes': ['Aferin! Çok güzel!', 'Süper!', 'Ne güzel bir çizim!'],
  'TR.hint': 'Bak, göstereyim! Bir numaralı yeşil noktadan başla.',
  'LO-10.prompt': ['İki kart çevir. Aynıysa çifti kazanırsın!', 'Bütün çiftleri bul!'],
  'LO-10.promptForeign': ['İki kart çevir ve çiftleri bul! Dinle… İngilizce!', 'Çiftleri bul ve İngilizce kelimeleri dinle!'],
  'LO-10.yes': ['Aferin, bütün çiftleri buldun!', 'Ne hafıza! Bütün çiftler!'], 'LO-10.hint': 'Gördüğün resimlerin yerini hatırla!',
  'VO-1.prompt': ['Bunun adı ne?', 'Bu ne?', 'Bana bunun ne olduğunu söyle!'], 'VO-1.repeat': 'İyi dinle: {word}. Şimdi sen söyle!',
  'VO-2.prompt': ['İngilizce nasıl denir: {word}?', 'İngilizce söyle: {word}!'], 'VO-2.yes': ['Aferin, çok güzel söyledin!', 'Süper, İngilizce konuşuyorsun!', 'Mükemmel!'],
  'VO-2.repeat': 'İyi dinle ve benimle tekrar et:', 'VO-2.fallback': 'İngilizce kelimenin resmine dokun:', 'VO-2.hint': 'İpucu: bildiğin İngilizce kelimeleri düşün!',
  'l.handover': ['Aferin {current}! Şimdi sıra şurada: {next}!', 'Teşekkürler {current}! {next}, sıra sende!'],
  'l.gift': ['Büyüdüm! Bana bir hediye seç!', 'Hediye! Bana hangisini vereceksin?'], 'l.giftThanks': 'Vay, {item}! Teşekkürler!',

  ...kv('num', `0=sıfır; 1=bir; 2=iki; 3=üç; 4=dört; 5=beş; 6=altı; 7=yedi; 8=sekiz; 9=dokuz; 10=on; 11=on bir; 12=on iki; 13=on üç;
    14=on dört; 15=on beş; 16=on altı; 17=on yedi; 18=on sekiz; 19=on dokuz; 20=yirmi`),

  'l.hello': ['Merhaba {name}! Benim, senin dinon!', 'Merhaba {name}! Birlikte çok eğleneceğiz!'],
  'l.welcome_back': ['Geri geldin, {name}! Yaşasın!', 'Merhaba {name}! Seni çok özledim!', 'A, geldin! Oynayalım mı?'],
  'l.home.play': ['Yeşil düğmeye dokun: oyunlar dünyasını gezelim!', 'Oynayalım mı? Yeşil düğmeye dokun!'],
  'l.home.categories': ['Oyununu seçmek için küçük düğmeye dokun.'], 'l.random.go': ['Hadi bakalım!', 'Kalkış! Dünya turu!', 'Haydi oynayalım!'],
  'l.home.choose': ['Bir oyun seç! Büyük bir baloncuğa dokun.'], 'l.home.EN-1': ['Bayrak: İngilizce kelimeler!'],
  'l.home.MO-1': ['Bana dünyadaki şeyleri göster!'], 'l.home.LO-1': ['Yapboz: farklı olanı bul!'], 'l.home.LO-2': ['Abaküs: hadi sayalım!'],
  'l.home.MO-3': ['Gölge: kimin bu?'], 'l.home.LO-3': ['Oklar: sırada ne var?'], 'l.home.LO-4': ['Terazi: nerede daha çok?'],
  'l.home.LO-5': ['Sayılar: hadi hesap yapalım!'], 'l.home.LO-11': ['Kulak: akıldan hesap!'], 'l.home.VO-13': ['Mikrofon: hesabın sonucunu söyle!'],
  'l.home.EN-2': ['On: İngilizce sayılar!'], 'l.home.MO-4': ['El sıkışma: ne ne ile gider?'], 'l.home.MO-5': ['Cetvel: gerçekte hangisi büyük?'],
  'l.home.LO-6': ['Sayılar: doğru sayıyı bul!'], 'l.home.LO-10': ['Kartlar: hafıza oyunu!'], 'l.home.EN-3': ['Joker: İngilizce hafıza!'],
  'l.home.LO-7': ['Palet: şekiller ve renkler!'], 'l.home.LO-8': ['Çalar saat: saat kaç?'], 'l.home.LO-9': ['Banknot: hadi para sayalım!'],
  'l.home.TR-1': ['Kalem: hadi şekil çizelim!'], 'l.home.TR-2': ['Yazan el: hadi harf ve rakam çizelim!'], 'l.home.MO-6': ['Harita: ülkenle ilgili sorular!'],
  'l.intro.MIX': ['Her soruyu iyi dinle!', 'Kulaklarını aç!', 'Hazır mısın? Ben hazırım!'],
  'l.short.EN-1': ['İngilizce!'], 'l.short.MO-1': ['Göster!'], 'l.short.MO-3': ['Bir gölge!'], 'l.short.LO-1': ['Farklı olan!'],
  'l.short.LO-2': ['Hadi sayalım!'], 'l.short.LO-3': ['Sırada ne var!'], 'l.short.LO-4': ['Çok mu az mı!'], 'l.short.LO-5': ['Bir hesap!'],
  'l.short.LO-11': ['Akıldan hesap!'], 'l.short.VO-13': ['Cevabı söyle!'], 'l.short.EN-2': ['İngilizce bir sayı!'], 'l.short.MO-4': ['Ne ne ile gider?'],
  'l.short.MO-5': ['En büyük mü en küçük mü!'], 'l.short.LO-6': ['Sayıyı bul!'], 'l.short.LO-10': ['Hafıza!'], 'l.short.EN-3': ['İngilizce hafıza!'],
  'l.short.LO-7': ['Şekiller ve renkler!'], 'l.short.LO-8': ['Saat kaç?'], 'l.short.LO-9': ['Para!'], 'l.short.TR-1': ['Hadi çizelim!'],
  'l.short.TR-2': ['Hadi yazalım!'], 'l.short.MO-6': ['Ülkenle ilgili bir soru!'], 'l.home.level': ['Yıldız benim seviyem!'],
  'l.intro.EN-1': ['İngilizce bir kelime söylüyorum. Doğru resme dokun!'], 'l.intro.MO-1': ['İyi dinle ve söylediğime dokun.', 'Hadi dünyayı gezelim! Söylediğimi bul.'],
  'l.intro.LO-1': ['Resimlere iyi bak. Yalnızca biri aynı aileden değil: onu bul!'], 'l.intro.LO-2': ['Hadi sayalım! Meyveleri say ve doğru sayıya dokun.'],
  'l.intro.MO-3': ['Bu siyah gölgeye iyi bak. Kimin olduğunu bul!'], 'l.intro.LO-3': ['Diziye iyi bak ve sırada ne olduğunu bul.'],
  'l.intro.LO-4': ['Kartlara iyi bak. Söylediğim kartı bul!'], 'l.intro.LO-11': ['Resimsiz hesap! İyi dinle, aklından hesapla ve doğru sayıya dokun.'],
  'l.intro.VO-13': ['Ben bir hesap söylüyorum, sen sonucunu söylüyorsun. Cevap vermek için mikrofona dokun!'],
  'l.intro.LO-5': ['Hadi hesap yapalım! İyi dinle ve doğru sayıya dokun.', 'Hesap zamanı! Parmaklarınla sayabilirsin.'],
  'l.intro.EN-2': ['İngilizce bir sayı söylüyorum. Doğru sayıya dokun!'], 'l.intro.MO-4': ['Bazı şeyler birlikte gider, anahtar ve kilit gibi. Eşini bul!'],
  'l.intro.MO-5': ['Resimlerde her şey aynı boyda. Peki gerçekte? Söylediğimi bul!'], 'l.intro.LO-6': ['Bir sayı söylüyorum. Kartların arasında onu bul!'],
  'l.intro.LO-10': ['Hafıza oyunu oynayalım! İki kart çevir: resimler aynıysa çifti kazanırsın!'],
  'l.intro.EN-3': ['İngilizce hafıza! Bir kart çevirdiğinde kelimeyi İngilizce söylüyorum. Çiftleri bul!'],
  'l.intro.LO-7': ['Şekiller ve renklerle oynayalım! İyi dinle ve doğru şekle dokun.'],
  'l.intro.LO-8': ['Saatlere iyi bak! Kısa kol saati, uzun kol dakikayı gösterir.'], 'l.intro.LO-9': ['Bakkalcılık oynayalım! Paraları say ve doğru tutarı bul.'],
  'l.intro.TR-1': ['Parmakla çizelim! Yeşil noktadan başla ve noktalı çizgiyi takip et.'],
  'l.intro.TR-2': ['Yazmayı öğrenelim! Bir numaralı yeşil noktadan başla ve noktalı çizgiyi takip et.'],
  'l.intro.MO-6': ['Ülkenden konuşalım! İyi dinle ve doğru resme dokun.', 'Ülkeni iyi tanıyor musun? Sana sorular soracağım!'],
  'l.trace.start': ['Parmağını yeşil noktaya koy ve küçük noktaları takip et.'], 'l.trace.continue': ['Devam et, neredeyse bitti!'],
  'l.trace.retry': ['Az kaldı! Silip yeniden başlayalım mı?'], 'l.tutorial': ['Bak, göstereyim! Doğru resme böyle dokunuyoruz.'],
  'l.tutorial_your_turn': ['Şimdi sıra sende!'],
  'l.correct': ['Aferin {name}!', 'Harika, {name}!', 'Tam olarak!', 'Süper!', 'Mükemmel!', 'Evet!', 'Şampiyon!', 'Sen bir yıldızsın!', 'Bravo!'],
  'l.wrong': ['Hop! Tekrar dene!', 'Hmm, iyi bak…', 'O değil! Aramaya devam!', 'Az kaldı! Bir kez daha!', 'Olsun, tekrar dene!'],
  'l.hint': ['Sana yardım edeyim: parlayana dokun!'], 'l.streak': ['Üst üste üç! Harikasın!'], 'l.idle': ['Orada mısın? Bir karta dokun!'],
  'l.touch_me': ['Tekrar duymak için bana dokun!'], 'l.review_due': ['Bunu daha önce birlikte gördük. Hatırlıyor musun?'], 'l.review': ['Her şeyi biliyorsun! Tekrar edelim mi?'],
  'l.series_perfect': ['Vay, hepsi doğru! Gerçek bir yıldızsın, {name}!', 'Tek bir hata bile yok! Sevinçten dans ediyorum!'],
  'l.series_great': ['İnanılmaz! Neredeyse hepsi doğru!', 'Ne yetenek, {name}!'], 'l.series_good': ['Çok iyi oynadın! Hızlı öğreniyorsun!'],
  'l.series_ok': ['İyi oynadın! Biraz daha çalışalım mı?'], 'l.series_encourage': ['Zordu, değil mi? Ben de öğreniyorum!', 'Olsun! Oynayarak öğreniriz.'],
  'l.end.feed': ['Şu meyve sepetine bak! Bana vermek için sepete dokun.'], 'l.end.nothing': ['Bu sefer meyve yok. Kazanmak için tekrar oynayalım mı?'],
  'l.end.again': ['Tekrar oynamak için yeşil düğmeye dokun!'], 'l.fly.visit': ['Bak, bir sinek!'],
  'l.home.ambient': ['Sanırım yanardağ hâlâ püskürüyor.', 'Biraz acıktım.', 'Bulutlar geçiyor, bak!'], 'l.fly.caught': ['Şlurp! Bir sinek!', 'Yakaladım!'],
  'l.fruit.won': ['Bana bir meyve!'], 'l.eating': ['Ham ham!', 'Çok lezzetli!', 'Biraz daha lütfen!', 'Teşekkürler!'],
  'l.full': ['Karnım doydu! Gerisini sonraya saklıyorum.'], 'l.level_up': ['Ah! Büyüyorum! Bana iyi baktığın için teşekkürler!', 'Bak, büyüdüm!'],
  'l.tickle': ['Hi hi, gıdıklanıyorum!', 'Ha ha ha! Dur!'], 'l.start': ['Beni uyandırmak için dokun!'],
  'l.parent_code': ['Oynamadan önce annene ya da babana seslen! Benim için gizli bir kod seçmeleri gerekiyor.'],
  'l.parent_code_done': ['Teşekkürler! Artık birlikte oynayabiliriz!'], 'l.wardrobe.intro': ['Giymem için bir eşyayı üstüme sürükle!'],
  'l.wardrobe.drag': ['Parmağını eşyanın üstünde tut ve bana doğru sürükle!'], 'l.wardrobe.off': ['Tamam, çıkarıyorum!'],
  'l.wardrobe.empty': ['Gardırobum boş! Büyüdüğümde benim için bir eşya kazanacaksın.'], 'l.home.wardrobe': ['Şapka beni giydirmek için!'],
  'l.gift.waiting': ['Büyüdüm! Benim için eşya seçmek için hediyeye dokun.'], 'l.gift.go': ['Büyüdüm! Gardırobuma gel: seni bir hediye bekliyor!'],
  'l.wardrobe.new': ['Giymem için üstüme sürükle!'], 'l.wardrobe.take_off': ['Bir eşyayı çıkarmak için onu benden uzağa sürükle.'],
  'l.night.last': ['Ah, geç oldu… Son bir tur, sonra uyku mu?'], 'l.night.goodnight': ['Son turdu! Bu güzel gün için teşekkürler. İyi geceler!'],
  'l.night.sleep': ['Şşş… uyuyorum. Zzz… Yarın görüşürüz!'], 'l.bedtime': ['Bugün çok oynadık! Şimdi uyumaya gidiyorum. Yarın yine oynar mıyız?'],
  'l.streak5': ['Üst üste beş! Sen bir dahisin!'], 'l.correct_after_try': ['Buldun! Gördün mü, sadece aramak gerekiyordu!'],
  'l.halfway': ['Yarısına geldik! Devam et!'], 'l.last_question': ['Son soru!'],
  'l.home.voice': ['Mikrofon: sesinle cevap verdiğin oyunlar!'], 'l.home.voice_choose': ['Burada konuşarak cevap veriyorsun! Bir oyun seç.'],
  'l.intro.VO-1': ['Sana bir resim gösteriyorum. Mikrofona dokun ve adını söyle.'], 'l.intro.VO-2': ['Hadi İngilizce konuşalım! Mikrofona dokun ve kelimeyi İngilizce söyle.'],
  'l.home.VO-1': ['Konuşan kafa: resimlerin adını söyle!'], 'l.home.VO-2': ['Bayrak: kelimeleri İngilizce söyle!'],
  'l.short.VO-1': ['Bunun adı ne?'], 'l.short.VO-2': ['İngilizce!'], 'l.voice.tap_mic': ['Mikrofona dokun ve bana cevap ver.', 'Sıra sende! Mikrofona dokun ve yüksek sesle konuş.'],
  'l.voice.listening': ['Dinliyorum!'], 'l.voice.unheard': ['Seni iyi duyamadım. Mikrofona dokun ve daha yüksek sesle konuş.'],
  'l.voice.wrong': ['Bu değil! Tekrar dene!'], 'l.voice.cards': ['Kulaklarım yoruldu! Doğru cevaba parmağınla dokun.'],
  'l.voice.give_up': ['Mikrofon beni iyi duymuyor. Bundan sonra parmakla oynayalım!'], 'l.voice.loading': ['Bekle, kulaklarımı temizliyorum…'],
  'l.voice.no_mic': ['Ah, seni duyamıyorum. Parmakla oynayalım!'],
  'l.egg.1': ['Tık tık! Kimse var mı?', 'Ah! İçeride bir şey kıpırdıyor!'], 'l.egg.2': ['Tekrar! Çıkmama yardım et!'], 'l.egg.3': ['Az kaldı! Bir tık daha!'],
  'l.egg.hatched': ['Merhaba!', 'Oh! İşte buradayım!'],
  'l.hello.1': ['Merhaba! Ben senin dinonum, küçük {color} bir dinozor yavrusu. Büyümeme yardım eder misin?'],
  'l.hello.4': ['Birlikte bir sürü oyun oynayacağız!'], 'l.hello.5': ['Her doğru cevapta bir meyve kazanırsın.'],
  'l.hello.6': ['Meyveleri bana yedirirsin: ne kadar çok yersem o kadar büyürüm!'], 'l.hello.7': ['Büyüdükçe de sen ödül kazanırsın!'], 'l.hello.8': ['Hadi başlayalım!'],
  'l.hello.name': ['Ama önce söyle: adın ne? Mikrofona dokun ve adını yüksek sesle söyle!'],
  'l.hello.name_again': ['Seni iyi duyamadım. Mikrofona dokun ve adını tekrar söyle!'], 'l.hello.name_ok': ['Tanıştığımıza memnun oldum, {name}! Ne güzel bir isim!'],
  'l.hello.name_later': ['Adını sonra söylersin: annen ya da baban benim için yazacak!'],
  'l.hello.age': ['Peki sen, {name}, kaç yaşındasın? Mikrofona dokun ve söyle!'], 'l.hello.age_again': ['Seni iyi duyamadım. Kaç yaşındasın? Mikrofona dokun!'],
  'l.hello.age_later': ['Olsun: annen ya da baban söyler!'],
  'l.hello.sibling': ['Merhaba {name}! Ben senin dinonum, küçük {color} bir dinozor yavrusu. Birlikte çok eğleneceğiz!'],
  'l.hello.mic_allow': ['Ekranda bir mesaj çıkarsa bir büyükten “İzin ver”e dokunmasını iste!'],
  'l.hello.parent': ['Şimdi telefonu annene ya da babana ver! Sadece benim için gizli bir kod seçecekler.'],
  'l.welcome_first': ['Burası benim evim, {name}! Çok eğleneceğiz!'], 'l.burp': ['Hop! Pardon!', 'Pardon… çok lezzetliydi!'], 'l.fart': ['Hop… pardon!', 'Hi hi, ben değildim!'],
  'l.hunger.growl': ['Duyuyor musun? Karnım guruldadı! Sepeti ver bana!'], 'l.hunger.look': ['Mmm… o meyve çok lezzetli görünüyor… Sepete dokun!'],
  'l.hunger.beg': ['Lütfen, lütfen! Sepeti ver!', 'Hadi {name}, lütfen! Acıktım!'], 'l.hunger.gape': ['Bak, ağzımı kocaman açıyorum: aaa! Meyveyi koy!'],
  'l.hunger.sad': ['Çok acıktım… Sepete dokun!'], 'l.child.turn': ['Sıra sende, {name}! Birlikte oynayalım mı?'],
  'l.child.ask_name': ['Merhaba! Annene ya da babana seslen: bana adını söylemeleri gerekiyor!'], 'l.age.ask': ['Kaç yaşındasın? Yaşının yazdığı pastaya dokun!'],
  'l.age.3': ['Üç yaş! Süper!'], 'l.age.4': ['Dört yaş! Süper!'], 'l.age.5': ['Beş yaş! Harika!'], 'l.age.6': ['Altı yaş! Harika!'], 'l.age.7': ['Yedi yaş! Vay!'],

  // ---- Mon pays ----
  "lang.ko": "Korece", "lang.ne": "Nepalce",
  'cty.flag': 'Hangi bayrak? Ülke: {country}.', 'cty.flagHard': 'Dikkat, birbirlerine benziyorlar! Hangi bayrak? Ülke: {country}.',
  'cty.flagYes': 'Evet! Bu, {country} bayrağı!', 'cty.flagHint': 'renklere ve sıralarına iyi bak',
  'cty.symbol': 'Hangisi bir sembol? Ülke: {country}.', 'cty.symbolYes': 'Evet! Bu bir sembol! Ülke: {country}.',
  'cty.symbolYesName': 'Evet! {name}: bir sembol! Ülke: {country}.',
  'cty.food': ['Hangisi meşhur bir yemek? Ülke: {country}.', 'Orada ne yemeyi severler? Ülke: {country}.'], 'cty.foodYes': 'Ham! Bu meşhur bir yemek! Ülke: {country}.',
  'cty.day': '{date}: ulusal bayram! Ülke: {country}. Akşam gökyüzünde ne izleriz?', 'cty.dayYes': 'Evet! {date} günü büyük havai fişekler var!',
  'cty.currency': 'Hangi parayla ödenir? Ülke: {country}.', 'cty.currencyYes': 'Evet! Ödeme şununla yapılır: {money}!',
  'cty.place': 'Hangi ünlü yer orada? Ülke: {country}.', 'cty.sport': 'Hangi sporu çok severler? Ülke: {country}.',
  'cty.thing': 'Bayramlarda sık sık ne görülür? Ülke: {country}.', 'cty.landmarkYes': 'Evet! Aferin, ülkeni iyi tanıyorsun!',
  'cty.capital': 'Başkent hangisi? Ülke: {country}. Şehirlerin adlarını iyi oku!', 'cty.capitalYes': 'Evet! Başkent: {city}!',
  'cty.neighbour': 'Bu bayraklardan hangisi bir komşu ülkenin? Ülke: {country}.', 'cty.neighbourYes': 'Evet! Bu ülke hemen yanında!',
  'cty.neighbourHint': 'komşular çok yakındır, aynı kıtada',

  ...kv('c', `dog=köpek; cat=kedi; fish=balık; bird=kuş; cow=inek; pig=domuz; horse=at; duck=ördek; rabbit=tavşan; hen=tavuk; sheep=koyun;
    frog=kurbağa; mouse=fare; dinosaur=dinozor; red=kırmızı; blue=mavi; green=yeşil; yellow=sarı; orange_color=turuncu; purple=mor; pink=pembe;
    black=siyah; white=beyaz; brown=kahverengi; apple=elma; banana=muz; strawberry=çilek; cherry=kiraz; orange=portakal; egg=yumurta;
    ice_cream=dondurma; pizza=pizza; grapes=üzüm; pear=armut; lemon=limon; carrot=havuç; bread=ekmek; milk=süt; cake=pasta; watermelon=karpuz;
    cookie=kurabiye; cheese=peynir; tomato=domates; pineapple=ananas; peach=şeftali; broccoli=brokoli; corn=mısır; kiwi=kivi; mango=mango;
    blueberries=yaban mersini; coconut=hindistancevizi; car=araba; ball=top; bus=otobüs; train=tren; plane=uçak; boat=tekne; bike=bisiklet;
    balloon=balon; teddy=oyuncak ayı; book=kitap; house=ev; kite=uçurtma; bed=yatak; chair=sandalye; door=kapı; key=anahtar; clock=saat;
    sun=güneş; moon=ay; star=yıldız; flower=çiçek; cloud=bulut; rainbow=gökkuşağı; tree=ağaç; rain=yağmur; snowflake=kar tanesi;
    snowman=kardan adam; leaf=yaprak; mountain=dağ; fire=ateş; sunflower=ayçiçeği; drop=su damlası; eye=göz; ear=kulak; nose=burun;
    mouth=ağız; hand=el; foot=ayak; tooth=diş; lion=aslan; tiger=kaplan; elephant=fil; monkey=maymun; bear=ayı; giraffe=zürafa;
    zebra=zebra; panda=panda; snake=yılan; turtle=kaplumbağa; crocodile=timsah; kangaroo=kanguru; hippo=su aygırı; gorilla=goril;
    rhino=gergedan; butterfly=kelebek; bee=arı; ladybug=uğur böceği; spider=örümcek; ant=karınca; snail=salyangoz; dolphin=yunus;
    whale=balina; octopus=ahtapot; crab=yengeç; shark=köpek balığı; owl=baykuş; penguin=penguen; parrot=papağan; flamingo=flamingo;
    peacock=tavus kuşu; eagle=kartal; swan=kuğu; hat=şapka; shoe=ayakkabı; dress=elbise; cap=kep; socks=çorap; gloves=eldiven;
    tshirt=tişört; glasses=gözlük; umbrella=şemsiye; pencil=kurşun kalem; spoon=kaşık; scissors=makas; hammer=çekiç; ladder=merdiven;
    broom=süpürge; bottle=biberon; toothbrush=diş fırçası; guitar=gitar; drum=davul; piano=piyano; violin=keman; trumpet=trompet;
    helicopter=helikopter; tractor=traktör; rocket=roket; ambulance=ambulans; motorbike=motosiklet; fire_engine=itfaiye aracı;
    police_car=polis arabası; scooter=scooter; sled=kızak; llama=lama; goat=keçi; camel=deve; hedgehog=kirpi; squirrel=sincap; bat=yarasa;
    deer=geyik; wolf=kurt; fox=tilki; raccoon=rakun; beaver=kunduz; otter=su samuru; sloth=tembel hayvan; skunk=kokarca; bison=bizon;
    castle=şato; tent=çadır; lighthouse=deniz feneri; volcano=yanardağ; island=ada; anchor=çapa; magnet=mıknatıs; compass=pusula;
    microscope=mikroskop; telescope=teleskop; hourglass=kum saati; jellyfish=denizanası; seal=fok; lobster=ıstakoz; shrimp=karides;
    squid=kalamar; oyster=istiridye; beetle=böcek; cricket=cırcır böceği; mosquito=sivrisinek; worm=solucan; scorpion=akrep; rooster=horoz;
    turkey=hindi; donkey=eşek; ox=öküz; leopard=leopar; polar_bear=kutup ayısı; koala=koala; orangutan=orangutan; mammoth=mamut;
    moose=sığın; badger=porsuk; avocado=avokado; eggplant=patlıcan; garlic=sarımsak; onion=soğan; pepper=acı biber; cucumber=salatalık;
    potato=patates; mushroom=mantar; peanuts=yer fıstığı; croissant=kruvasan; pancakes=pankek; honey=bal; spaghetti=spagetti;
    fries=patates kızartması; sandwich=sandviç; candle=mum; mirror=ayna; window=pencere; bucket=kova; bell=çan; lock=asma kilit;
    light_bulb=ampul; flashlight=el feneri; axe=balta; saw=testere; wrench=İngiliz anahtarı; screwdriver=tornavida; paintbrush=fırça;
    crayon=boya kalemi; trophy=kupa; medal=madalya; ring=yüzük; skateboard=kaykay; yoyo=yoyo; roller_skate=paten; canoe=kano; tram=tramvay;
    parachute=paraşüt; satellite=uydu; brain=beyin; bone=kemik; tongue=dil; leg=bacak; tornado=hortum; lightning=şimşek; comet=kuyruklu yıldız;
    cactus=kaktüs; blossom=kiraz çiçeği; feather=tüy`),
};

export default tr;
