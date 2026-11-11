import type { Catalog } from '../index';
import { kv } from '../kv';

/** Bahasa Indonesia (bahasa kedua: Inggris). Tidak ada pengenalan suara: permainan bersuara disembunyikan. */
const id: Catalog = {
  ...kv('lang', 'fr=Prancis; en=Inggris; es=Spanyol; it=Italia; de=Jerman; pt=Portugis; ru=Rusia; zh=Mandarin; hi=Hindi; ar=Arab; ur=Urdu; bn=Bengali; id=Indonesia'),
  ...kv('country', 'fr=Prancis; be=Belgia; ch=Swiss; ca=Kanada; lu=Luksemburg; gb=Inggris Raya; us=Amerika Serikat; es=Spanyol; mx=Meksiko; it=Italia; de=Jerman; at=Austria; pt=Portugal; br=Brasil; ru=Rusia; cn=Tiongkok; in=India; eg=Mesir; ma=Maroko; sa=Arab Saudi; pk=Pakistan; bd=Bangladesh; cd=RD Kongo'),

  'ui.loading': 'Memuat…',
  'ui.rotate': 'Putar tabletmu!',
  'ui.tap': 'Sentuh layar untuk bermain!',
  'ui.retry': 'Coba lagi',
  'ui.problem': 'Masalah: {reason}',
  'ui.cancel': 'Batal',
  'ui.skip': 'Lewati', 'ui.home.play': 'Main', 'ui.home.missions': 'Misi', 'ui.home.mydino': 'Dinoku', 'ui.home.settings': 'Pengaturan', 'ui.end.again': 'Main lagi', 'ui.home.playWith': 'Ayo main dengan dinomu, {name}!',
  'ui.home.learn': 'Belajar dan bermain dengan Dino!',
  'ui.home.summary': '{n} ronde selesai. Dinomu tumbuh bersamamu!',
  'ui.home.sleeping': 'Ssst… dino sedang tidur.\nOrang tua bisa membukanya dengan kode.',
  'ui.home.timeUp': 'Waktu bermain sudah habis.\nOrang tua bisa membukanya dengan kode.',
  'ui.child.title': 'Siapa nama anak ini?',
  'ui.child.sub': 'Dino akan memanggilnya dengan namanya.',
  'ui.parents.title': 'Ruang orang tua',
  'ui.pin.type': 'Ketik kode orang tua.',
  'ui.pin.title': 'Kode orang tua',
  'ui.pin.choose': 'Pilih kode 4 angka.',
  'ui.wardrobe.title': 'Dinoku – Lemari baju',
  'ui.wardrobe.reactions': ['Keren sekali!', 'Aku suka!', 'Aku jadi tampan!', 'Gaya sekali!'],
  'ui.choose.voice': 'Bersuara',
  'ui.choose.voiceTitle': 'Main dengan suaramu!',
  'ui.choose.title': 'Pilih permainan!',
  'ui.end.3': 'Hebat!', 'ui.end.2': 'Bagus sekali!', 'ui.end.1': 'Kerja bagus!', 'ui.end.0': 'Terus semangat!',
  'ui.end.done': 'Kamu sudah menyelesaikan ronde ini!',
  'ui.time.unlimited': 'Tanpa batas', 'ui.time.less': 'Kurangi waktu', 'ui.time.more': 'Tambah waktu',
  'ui.lang': 'Bahasa', 'ui.langLabel': 'Bahasa:', 'ui.mb': '{n} MB',
  'ui.pack.voice': 'paket {language}', 'ui.pack.asr': 'pengenalan suara',
  'ui.pack.stalled': 'Unduhan berhenti. Periksa koneksi.',
  'ui.pack.downloading': 'Mengunduh: {list}', 'ui.pack.installing': 'Memasang pengenalan suara',
  'ui.pack.speechTitle': 'Suara dino ({language})', 'ui.pack.speechDetail': 'Suara alami, sama di semua perangkat.',
  'ui.pack.secondTitle': 'Suara {language}', 'ui.pack.secondDetail': 'Untuk kata-kata di permainan bahasa asing.',
  'ui.pack.asrTitle': 'Pengenalan suara', 'ui.pack.asrDetail': 'Untuk menjawab dengan suara.',
  'ui.pack.download': 'Unduh', 'ui.pack.installed': 'Terpasang ✓',
  'ui.pack.toDownload': 'Perlu diunduh: {n} MB (sebaiknya lewat Wi-Fi).', 'ui.pack.allInstalled': 'Semua sudah terpasang.',
  'ui.pack.running': 'Mengunduh…', 'ui.pack.finished': 'Selesai.', 'ui.pack.failed': 'Gagal: {error}',
  'ui.pack.installingShort': 'Memasang…', 'ui.pack.waiting': 'Menunggu…',
  'voice.heard': 'Aku dengar: {word}.',

  ...kv('p', `title=Ruang orang tua; back=Kembali ke permainan; noName=Tanpa nama; addChild=+ Tambah anak; newChild=Anak baru;
    newChildHelp=Saat keluar dari ruang orang tua, anak baru akan menyentuh telurnya agar dinonya sendiri menetas.;
    cancel=Batal; edit=✏️ Ubah profil; sheetOf=Profil {name}; sheet=Profil anak; sheetHelp=Nama, umur, dan pengaturan.;
    removeChild=Hapus {name}; thisChild=anak ini;
    removeConfirm=Hapus {name}, dinonya, dan semua kemajuannya? Ini tidak bisa dibatalkan.;
    egg=telur belum menetas; dino=dino; alternateAria=Bergantian antar anak; age={n} tahun; otherCountry=negara lain;
    series=ronde dimainkan; answers=jawaban; firstTry=benar pertama kali; today=dimainkan hari ini;
    childrenHelp=Setiap anak punya dino, kemajuan, dan pengaturannya sendiri. Pengaturan di bawah untuk anak yang dipilih.;
    alternate=Bergantian: setelah setiap ronde, giliran anak berikutnya;
    difficulty=Tingkat kesulitan awal: {n} dari 20 ({stage}). Lalu menyesuaikan sendiri dengan hasilnya.;
    stageCP=kelas 1 SD; stageK=TK; dinoLevel=Level dino;
    dinoLevelHelp=Dino tumbuh saat anak memberinya makan (level 1 sampai {max}). Anda bisa mengubahnya untuk mengatur kesulitan: level 21 sampai 40 setara kelas 1 SD.;
    noNight=Tanpa mode malam; week=Waktu bermain 7 hari terakhir; daily=Waktu bermain per hari;
    dailyHelp=Saat waktunya habis, anak menyelesaikan ronde, lalu permainan terkunci sampai besok: dino pergi tidur. Dengan kode Anda, Anda bisa menambah 15 atau 30 menit, atau membuka seharian.;
    night=Waktu tidur (mode malam);
    nightHelp=Setelah jam ini, langit menjadi malam dan dino menguap: ia menawarkan satu ronde terakhir, lalu tidur sampai pagi. Kode Anda membuat anak bisa bermain sedikit lagi malam itu.;
    enable=Aktifkan {game}; levelOf=Level {game}; levelAuto=Level otomatis; level=Level {n}; fromAge=Mulai {n} tahun;
    needsVoice=Permainan bersuara: izinkan mikrofon dan unduh pengenalan suara {language} (bagian “Suara dan unduhan”).;
    nAnswers={n} jawaban; notPlayed=Belum dimainkan; rate={rate} benar pertama kali; mastered={n} / {total} soal dikuasai;
    lastPlayed=terakhir dimainkan {date}; chooseAria=Tombol memilih permainan; games=Permainan;
    choose=Tombol “Pilih permainan” di layar utama;
    chooseHelp=Jika mati, anak bermain dengan planet: setiap ronde mencampur semua permainan untuk umurnya. Jika menyala, anak juga bisa memilih permainan tertentu.;
    gamesHelp=Matikan permainan agar tidak ditawarkan lagi. Level (1 sampai 20; 11 sampai 20 = kelas 1 SD) adalah awal ronde berikutnya; “otomatis” menghitungnya dari umur, dino, dan hasil.;
    reviewToday=diulang hari ini; reviewTomorrow=kembali besok; reviewOn=kembali pada {date}; reviewN=pengulangan {n} dari {total};
    review=Untuk dilatih;
    reviewHelp=Soal yang salah kembali besoknya, lalu 3 hari kemudian, lalu seminggu kemudian. Benar tiga kali: sudah dikuasai; salah: mulai lagi besoknya.;
    reviewNone=Belum ada yang perlu diulang. Hebat!; sfxAria=Efek suara; musicAria=Musik latar; testVoice=Coba suara;
    testHello=Halo! Aku Dino.; sound=Suara; sfx=Efek suara (jawaban benar, salah, nyam…);
    music=Musik latar yang lembut (anak juga bisa mematikannya di layar utama);
    phoneVoices=Suara utama: {main} · Suara bahasa kedua: {second}. Ini suara dari ponsel: untuk suara yang lebih alami, pasang suara “ditingkatkan” atau “premium” di pengaturan aksesibilitas (teks ke ucapan).;
    noVoice=tidak ditemukan; mic=Mikrofon (permainan bersuara);
    micHelp=Di permainan bersuara, anak menjawab dengan berbicara. Semuanya tetap di perangkat ini: suara tidak pernah direkam atau dikirim. Mikrofon hanya menyala saat anak menyentuh tombol mikrofon yang besar.;
    noMic=Peramban ini tidak mengizinkan mikrofon di permainan.; allowMic=Izinkan mikrofon;
    allowMicNow=Izinkan mikrofon di jendela peramban…;
    micBlocked=Mikrofon diblokir. Izinkan di pengaturan peramban (gembok di samping alamat), lalu coba lagi.;
    packsWhere=Paket pengenalan suara diunduh di bagian “Suara dan unduhan”.;
    removePacks=Hapus paket;
    removePacksConfirm=Hapus paket pengenalan suara dari perangkat ini? Permainan bersuara tidak akan ditawarkan lagi.;
    packs=Suara dan unduhan;
    packsHelp=Bahasa permainan, suara alami dino (dibuat di perangkat, tanpa internet setelah diunduh), dan suara untuk permainan bahasa asing. Unduhan tetap berjalan walau bagian ini ditutup. Tanpa suara dino, permainan memakai suara ponsel.;
    changeCode=Ubah kode; newCode=Kode orang tua baru; newCodeHelp=Pilih kode 4 angka yang baru.;
    codeChanged=Kode orang tua sudah diubah.; code=Kode orang tua;
    codeHelp=Kode ini membuka ruang ini dan membuka permainan saat waktu harian habis. Jika lupa, “Lupa kode?” memungkinkan membuat kode baru setelah satu pertanyaan untuk orang dewasa.;
    reset=Mulai dari awal; resetConfirm=Hapus semua kemajuan (level dino, jawaban, buah)? Pengaturan tetap disimpan.;
    privacy=Kebijakan privasi; close=Tutup; data=Data;
    dataHelp=Semuanya hanya disimpan di perangkat ini. Tidak ada data yang dikirim.`),

  ...kv('pin', `erase=Hapus; remember=Ingat baik-baik.; forgot=Lupa kode?;
    adultQuestion=Pertanyaan untuk orang dewasa: berapa {a} × {b}? (3 angka); cancel=Batal; wrongAnswer=Itu belum benar.;
    newCode=Kode orang tua baru; newCodeHelp=Pilih kode 4 angka yang baru.; wrongCode=Kode salah.;
    otherCountry=Negara lain; firstName=Nama;
    micHtml=<b>Izinkan mikrofon</b> (permainan bersuara)<br><small>Semuanya tetap di perangkat ini: suara tidak pernah direkam atau dikirim.</small>;
    missionsHtml=<b>Memilih misi</b><br><small>Anak bisa memilih permainannya (tombol “Misi”). Tanpa centang: hanya ronde acak dengan “Main”.</small>;
    ok=OK; nameMissing=Tulis nama anak.; age=Umur; years={n} tahun; country=Negara; daily=Waktu bermain per hari;
    night=Waktu tidur (mode malam); none=Tidak ada; welcome=Selamat datang!;
    welcomeHeard=Ini yang diceritakan anak Anda kepada dino: perbaiki jika perlu. Anda bisa menambah anak lain dan mengubah semuanya di ruang orang tua (gembok di layar utama).;
    welcomeHelp=Nama, umur, dan pengaturan anak Anda. Anda bisa menambah anak lain dan mengubah semuanya di ruang orang tua (gembok di layar utama).;
    yourCode=Kode orang tua Anda;
    yourCodeHelp=Pilih kode 4 angka. Kode ini membuka ruang orang tua (gembok di layar utama) dan membuka permainan saat waktu harian habis. Jangan beri tahu anak Anda!;
    asleep=Dino sedang tidur; asleepHelp=Sudah waktunya tidur. Ketik kode orang tua untuk bermain sedikit lagi malam ini.;
    timeUp=Waktu bermain habis; timeUpHelp=Ketik kode orang tua untuk menambah waktu hari ini.;
    addTime=Tambah waktu; todayOnly=Hanya untuk hari ini.; plus15=15 menit lagi; plus30=30 menit lagi; unlimited=Tanpa batas hari ini`),

  ...kv('inst', `title=Pasang DinoLearn di ponsel; later=Nanti; okay=OK; never=Jangan tanya lagi;
    android=Aplikasi akan terbuka layar penuh, mendatar, seperti aplikasi sungguhan. Tidak ada lagi yang perlu diunduh.;
    menu=Di menu peramban:;
    androidSteps=<li>Sentuh <b>⋮</b> (tiga titik, kanan atas).</li><li>Pilih <b>“Instal aplikasi”</b> atau <b>“Tambahkan ke layar utama”</b>.</li><li>Buka permainan lewat ikon dino.</li>;
    ios=Aplikasi akan terbuka layar penuh, tanpa bilah Safari, seperti aplikasi sungguhan.;
    iosSteps=<li>Sentuh {share} <b>Bagikan</b> (di bawah atau atas Safari).</li><li>Pilih <b>“Tambahkan ke Layar Utama”</b>, lalu <b>Tambah</b>.</li><li>Buka permainan lewat ikon dino.</li>`),

  ...kv('title', `EN-1=Inggris — Dengar dan sentuh; EN-2=Inggris — Angka; EN-3=Inggris — Kartu memori; MO-1=Dunia — Tunjukkan;
    MO-3=Dunia — Bayangan; MO-4=Dunia — Pasangannya; MO-5=Dunia — Paling besar; LO-1=Logika — Mana yang beda;
    LO-2=Logika — Ada berapa?; LO-3=Logika — Apa selanjutnya; LO-4=Logika — Banyak dan sedikit; LO-5=Logika — Berhitung;
    LO-6=Logika — Angka; LO-7=Logika — Bentuk dan warna; LO-8=Logika — Jam; LO-9=Logika — Uang;
    LO-10=Logika — Kartu memori; LO-11=Logika — Dengar dan hitung; TR-1=Menulis — Menebalkan bentuk;
    TR-2=Menulis — Menebalkan huruf dan angka; VO-1=Bersuara — Apa namanya?; VO-2=Bersuara — Ucapkan dalam bahasa Inggris!;
    VO-13=Bersuara — Berhitung; MO-6=Dunia — Negaraku`),

  ...kv('item', `top-hat=topi tinggi; billed-cap=topi pet; crown=mahkota; womans-hat=topi jerami; graduation-cap=topi wisuda;
    rescue-workers-helmet=helm pemadam kebakaran; headphone=headphone; hibiscus=bunga; glasses=kacamata; sunglasses=kacamata hitam;
    goggles=kacamata renang; ribbon=dasi kupu-kupu; swim-ring=pelampung; sports-medal=medali; prayer-beads=kalung;
    cape-red=jubah pahlawan super; cape-blue=jubah penyihir; wing=sayap; balloon=balon; magic-wand=tongkat ajaib;
    lollipop=permen lolipop; sunflower=bunga matahari; teddy-bear=boneka beruang`),
  ...kv('dinocolor', '0=hijau; 1=biru; 2=ungu; 3=merah muda; 4=oranye; 5=kuning; 6=toska; 7=merah; 8=cokelat'),

  ...kv('cat', `farm=hewan ternak; sea=hewan laut; bird=burung; bug=serangga kecil; wild=hewan liar; forest=hewan hutan; fruit=buah;
    veg=sayuran; meal=makanan; vehicle=kendaraan; toy=mainan; home=benda di rumah; clothes=sesuatu yang dipakai; tool=alat;
    kitchen=benda sehari-hari; music=alat musik; sky=sesuatu di langit; plant=tumbuhan; body=bagian tubuh; landscape=tempat;
    color=warna; element=sesuatu dari alam`),
  ...kv('fam', `farm=hewan ternak; sea=hewan laut; bird=burung; bug=serangga kecil; wild=hewan liar; forest=hewan hutan; fruit=buah-buahan;
    veg=sayuran; meal=makanan dan camilan; vehicle=kendaraan; toy=mainan; home=benda di rumah; clothes=pakaian; tool=alat;
    kitchen=benda di kamar mandi dan dapur; music=alat musik; sky=langit dan cuaca; plant=tumbuhan; body=bagian tubuh;
    landscape=tempat; color=warna; element=benda dari alam`),
  ...kv('fruit', `red-apple=apel; banana=pisang; strawberry=stroberi; cherries=ceri; grapes=anggur; tangerine=jeruk; pear=pir;
    lemon=lemon; watermelon=semangka; peach=persik; pineapple=nanas; kiwi-fruit=kiwi; mango=mangga; blueberries=bluberi;
    melon=melon; green-apple=apel hijau; coconut=kelapa`),
  ...kv('many', `food-red-apple=apel; food-banana=pisang; food-strawberry=stroberi; food-pear=pir; food-lemon=lemon;
    food-tangerine=jeruk; food-kiwi-fruit=kiwi; food-peach=persik`),

  'g.hintFamily': 'Petunjuk: ini {family}.',
  'g.word': '{word}!',
  'g.yesWord': ['Ya, {word}!', 'Betul, {word}!'],
  'g.yesItIs': 'Ya, ini {word}!',
  'g.hint': 'Petunjuk: {hint}.',
  'g.hintTens': 'Petunjuk: lihat dulu angka pertama, yaitu puluhan.',
  'g.plus': '{a} tambah {b}', 'g.minus': '{a} kurang {b}',
  'g.calcPrompt': ['Berapa {calc}?', '{calc}, jadi berapa?'],
  'g.calcYes': 'Ya! {calc} sama dengan {n}!',
  'g.hintAdd': 'Petunjuk: mulai dari {a}, lalu hitung {b} lagi dengan jarimu.',
  'g.hintSub': 'Petunjuk: mulai dari {a}, lalu hitung mundur {b} dengan jarimu.',
  'MO-1.prompt': ['Tunjukkan {word}!', 'Di mana {word}?', 'Sentuh {word}!', 'Bisakah kamu menemukan {word}?'],
  'LO-1.prompt': ['Cari yang berbeda! Mana yang bukan dari keluarga yang sama?', 'Gambar mana yang berbeda dari yang lain?'],
  'LO-1.yes': 'Ya, {word}! Yang lain adalah {family}.',
  'LO-1.hint': 'Petunjuk: {n} gambar adalah {family}. Cari yang bukan.',
  'LO-2.prompt': ['Ada berapa {things}? Hitung baik-baik!', 'Hitung {things}. Ada berapa?'],
  'LO-2.promptMixed': 'Ada berapa {things}? Hati-hati, hitung {things} saja!',
  'LO-2.yes': '{list}. Jumlahnya {n}!',
  'LO-2.hint': 'Petunjuk: sentuh setiap buah dengan jarimu sambil menghitung pelan-pelan.',
  'LO-2.hintBig': 'Petunjuk: hitung sampai sepuluh dulu, lalu lanjutkan: sebelas, dua belas, tiga belas…',
  'MO-3.prompt': ['Bayangan siapa ini? Sentuh gambar yang benar!', 'Siapa yang bersembunyi di balik bayangan ini?'],
  'LO-3.prompt': ['Perhatikan polanya. Buah apa selanjutnya?', 'Buah mana yang melanjutkan pola ini?'],
  'LO-3.yes': 'Ya! {list}!',
  'LO-3.hint': 'Petunjuk: polanya selalu mulai lagi dengan cara yang sama. {list}…',
  'LO-3.numPrompt': 'Lihat dan dengar: {list}. Angka berapa selanjutnya?',
  'LO-3.numYes': 'Ya! {list}, {n}!',
  'LO-3.hintGrow': 'Petunjuk: tambah satu, lalu dua, lalu tiga… lalu?',
  'LO-3.hintPlus': 'Petunjuk: setiap kali ditambah {n}.',
  'LO-3.hintMinus': 'Petunjuk: setiap kali dikurangi {n}.',
  'LO-4.num.most': 'Sentuh angka yang paling besar!', 'LO-4.num.least': 'Sentuh angka yang paling kecil!',
  'LO-4.numYes.most': 'Ya! {n} paling besar!', 'LO-4.numYes.least': 'Ya! {n} paling kecil!',
  'LO-4.numHint.most': 'Petunjuk: saat berhitung, angka paling besar datang paling akhir.',
  'LO-4.numHint.least': 'Petunjuk: saat berhitung, angka paling kecil datang paling awal.',
  'LO-4.pile.most': 'Di mana {things} paling banyak? Sentuh kartu yang benar!',
  'LO-4.pile.least': 'Di mana {things} paling sedikit? Sentuh kartu yang benar!',
  'LO-4.pileYes.most': 'Ya! Di sini ada {n}. Ini yang paling banyak!',
  'LO-4.pileYes.least': 'Ya! Di sini ada {n}. Ini yang paling sedikit!',
  'LO-4.pileHint.least': 'Petunjuk: cari kartu dengan buah yang sedikit sekali.',
  'LO-4.pileHint.most': 'Petunjuk: cari kartu yang paling penuh.',
  'LO-5.compl': '{a} tambah berapa sama dengan {b}?',
  'LO-5.complYes': 'Ya! {a} tambah {x} sama dengan {b}!',
  'LO-5.complHint': 'Petunjuk: hitung dengan jarimu, dari {a} sampai {b}.',
  'LO-5.add': 'Lihat, ada {a} {things}. Aku tambah {b} lagi. Semuanya jadi berapa?',
  'LO-5.eat': 'Lihat, ada {a} {things}. Dino makan {b}. Sisa berapa?',
  'LO-5.addHint': 'Petunjuk: hitung semua buah, di kiri dan di kanan.',
  'LO-5.eatHint': 'Petunjuk: hitung hanya buah yang tidak dicoret.',
  'LO-11.prompt': ['Dengarkan baik-baik: {calc}. Jadi berapa?', 'Berapa {calc}?', 'Hitung di kepala: {calc}. Sentuh jawabannya!'],
  'VO-13.prompt': ['Berapa {calc}? Katakan padaku!'],
  'VO-13.repeat': 'Dengar: {calc} sama dengan {n}. Sekarang kamu yang bilang!',
  'VO-13.fallback': '{calc}, jadi berapa? Sentuh angka yang benar!',
  'MO-4.prompt': ['Lihat: {word}. Apa pasangannya?', 'Cari yang cocok dengan {word}!'],
  'MO-4.yes': 'Ya, {a} cocok dengan {b}!',
  'MO-4.hint': 'Petunjuk: bayangkan {word}. Apa yang sering ada di dekatnya?',
  'MO-5.prompt.big': ['Di dunia nyata, mana yang paling besar?', 'Sentuh yang paling besar di dunia nyata!'],
  'MO-5.prompt.small': ['Di dunia nyata, mana yang paling kecil?', 'Sentuh yang paling kecil di dunia nyata!'],
  'MO-5.yes.big': 'Ya! Di dunia nyata, {word} paling besar!',
  'MO-5.yes.small': 'Ya! Di dunia nyata, {word} paling kecil!',
  'MO-5.hint': 'Petunjuk: di gambar semuanya sama besar. Bayangkan benda aslinya di sebelahmu!',
  'LO-6.prompt': ['Sentuh angka {n}!', 'Di mana angka {n}?', 'Cari {n}!'],
  'LO-6.yes': 'Ya! Itu {n}!',
  'LO-6.hint': 'Petunjuk: hitung dengan jarimu sampai {n}, lalu cari angka itu.',
  'LO-6.hintBig': 'Petunjuk: lihat baik-baik angka pertama, lalu angka kedua.',
  'EN-2.hint': 'Petunjuk: hitung dalam bahasa Inggris dengan jarimu, dan berhenti saat mendengar angka yang benar.',
  'LO-7.shape': 'Sentuh {shape}!',
  'LO-7.color': 'Sentuh bentuk yang berwarna {color}!',
  'LO-7.both': 'Sentuh {shape} berwarna {color}!',
  'LO-7.yes.shape': 'Ya, {shape}!',
  'LO-7.yes.color': 'Ya, yang berwarna {color}!',
  'LO-7.yes.both': 'Ya, {shape} berwarna {color}!',
  'LO-7.hint.color': 'Petunjuk: lihat warnanya saja, bentuknya tidak penting.',
  'LO-7.hint.both': 'Petunjuk: cari dulu warna yang benar, lalu perhatikan bentuknya.',
  ...kv('shape', 'circle=lingkaran; square=persegi; triangle=segitiga; star=bintang; heart=hati; rectangle=persegi panjang; diamond=belah ketupat; oval=oval; hexagon=segi enam; cross=tanda tambah'),
  ...kv('clue', `circle=lingkaran itu bulat, tidak punya sudut; square=persegi punya empat sisi yang sama panjang;
    triangle=segitiga punya tiga sisi dan tiga sudut; star=bintang punya lima ujung;
    heart=hati punya dua lengkungan di atas dan satu ujung di bawah; rectangle=persegi panjang punya empat sisi, dua panjang dan dua pendek;
    diamond=belah ketupat seperti persegi yang berdiri di ujungnya; oval=oval adalah lingkaran yang memanjang;
    hexagon=segi enam punya enam sisi; cross=tanda tambah punya empat lengan`),
  ...kv('color', 'red=merah; blue=biru; green=hijau; yellow=kuning; orange=oranye; purple=ungu; pink=merah muda'),
  'time.0': 'jam {h} tepat', 'time.30': 'jam setengah {next}', 'time.15': 'jam {h} lewat seperempat', 'time.45': 'jam {next} kurang seperempat',
  'time.m': 'jam {h} lewat {m} menit', 'time.24': 'jam {h}:{mm}',
  'LO-8.prompt': ['Sentuh jam yang menunjukkan {time}!', 'Di mana {time}?'],
  'LO-8.yes': 'Ya! Sekarang {time}!',
  'LO-8.hint': 'Petunjuk: jarum pendek menunjukkan jam, jarum panjang menunjukkan menit.',
  'LO-8.hintHard': 'Petunjuk: lihat dulu jarum pendek untuk jamnya, lalu jarum panjang untuk menitnya.',
  'money.e1': 'satu euro', 'money.e': '{e} euro', 'money.c1': 'satu sen', 'money.c': '{c} sen', 'money.ec': '{e} euro {c} sen',
  'LO-9.prompt': ['Sentuh kartu yang berisi {money}!', 'Di mana ada tepat {money}?'],
  'LO-9.yes': 'Ya! Jumlahnya {money}!',
  'LO-9.hint': 'Petunjuk: hitung dulu uang kertas dan koin besar, lalu tambahkan yang kecil.',
  'TR.dots': ['Tebalkan garis titik-titik!', 'Ikuti titik-titiknya dengan jarimu!'],
  'TR.faint': 'Gambarlah dengan mengikuti titik-titik kecil.',
  'TR.free': ['Sekarang gambar sendiri, seperti contohnya!', 'Giliranmu: gambar tanpa titik-titik!'],
  'TR.yes': ['Hebat! Bagus sekali!', 'Keren!', 'Gambarnya cantik sekali!'],
  'TR.hint': 'Lihat, aku tunjukkan! Mulai dari titik hijau nomor satu.',
  'LO-10.prompt': ['Balik dua kartu. Kalau sama, kamu dapat pasangannya!', 'Temukan semua pasangan!'],
  'LO-10.promptForeign': ['Balik dua kartu dan cari pasangannya! Dengar… dalam bahasa Inggris!', 'Cari pasangannya, dan dengarkan kata-kata bahasa Inggris!'],
  'LO-10.yes': ['Hebat, kamu menemukan semua pasangan!', 'Ingatanmu luar biasa! Semua pasangan!'],
  'LO-10.hint': 'Ingat di mana gambar yang sudah kamu lihat!',
  'VO-1.prompt': ['Apa nama benda ini?', 'Ini apa?'],
  'VO-1.repeat': 'Dengarkan baik-baik: {word}. Sekarang kamu yang bilang!',
  'VO-2.prompt': ['Apa bahasa Inggrisnya {word}?'],
  'VO-2.yes': ['Hebat, pengucapannya bagus!', 'Keren, kamu bisa bahasa Inggris!'],
  'VO-2.repeat': 'Dengarkan baik-baik, lalu ulangi bersamaku:',
  'VO-2.fallback': 'Sentuh gambar untuk kata bahasa Inggris ini:',
  'VO-2.hint': 'Petunjuk: ingat kata-kata bahasa Inggris yang sudah kamu tahu!',
  'l.handover': ['Hebat {current}! Sekarang giliran {next}!', 'Terima kasih {current}! {next}, sekarang giliranmu!'],
  'l.gift': ['Aku sudah besar! Pilihkan hadiah untukku!', 'Hadiah! Mana yang akan kamu berikan padaku?'],
  'l.giftThanks': 'Wah, {item}! Terima kasih!',

  'l.hello': ['Halo {name}! Ini aku, dinomu!', 'Halo {name}! Kita akan bersenang-senang bersama!'],
  'l.welcome_back': ['Kamu kembali, {name}! Hore!', 'Halo {name}! Aku sudah menunggumu!', 'Ah, kamu datang! Ayo main?', 'Hore, temanku datang!'],
  'l.home.play': ['Sentuh tombol hijau: ayo keliling dunia permainan!', 'Ayo main? Sentuh tombol hijau!'],
  'l.home.categories': ['Untuk memilih permainanmu, sentuh tombol kecil.'],
  'l.random.go': ['Ayo!', 'Lepas landas! Keliling dunia!', 'Ayo kita main!', 'Siap… mulai!'],
  'l.home.choose': ['Pilih permainan! Sentuh gelembung besar.'],
  'l.home.EN-1': ['Bendera: kata-kata bahasa Inggris!'],
  'l.home.MO-1': ['Tunjukkan benda-benda di dunia!'],
  'l.home.LO-1': ['Teka-teki: cari yang berbeda!'],
  'l.home.LO-2': ['Sempoa: ayo berhitung!'],
  'l.home.MO-3': ['Bayangan: siapa itu?'],
  'l.home.LO-3': ['Panah: apa selanjutnya?'],
  'l.home.LO-4': ['Timbangan: mana yang lebih banyak?'],
  'l.home.LO-5': ['Angka: ayo berhitung!'],
  'l.home.LO-11': ['Telinga: berhitung di kepala!'],
  'l.home.VO-13': ['Mikrofon: katakan hasil hitungannya!'],
  'l.home.EN-2': ['Sepuluh: angka dalam bahasa Inggris!'],
  'l.home.MO-4': ['Jabat tangan: apa pasangannya?'],
  'l.home.MO-5': ['Penggaris: mana yang lebih besar sebenarnya?'],
  'l.home.LO-6': ['Angka: cari angka yang benar!'],
  'l.home.LO-10': ['Kartu: permainan memori!'],
  'l.home.EN-3': ['Joker: memori bahasa Inggris!'],
  'l.home.LO-7': ['Palet: bentuk dan warna!'],
  'l.home.LO-8': ['Jam weker: jam berapa sekarang?'],
  'l.home.LO-9': ['Uang kertas: ayo menghitung uang!'],
  'l.home.TR-1': ['Pensil: ayo menebalkan bentuk!'],
  'l.home.TR-2': ['Tangan menulis: ayo menebalkan huruf dan angka!'],
  'l.home.MO-6': ['Peta: pertanyaan tentang negaramu!'],
  'l.intro.MIX': ['Dengarkan setiap pertanyaan baik-baik!', 'Buka telingamu lebar-lebar!', 'Sudah siap? Aku siap!'],
  'l.short.EN-1': ['Bahasa Inggris!'],
  'l.short.MO-1': ['Tunjukkan!'],
  'l.short.MO-3': ['Bayangan!'],
  'l.short.LO-1': ['Yang berbeda!'],
  'l.short.LO-2': ['Ayo berhitung!'],
  'l.short.LO-3': ['Apa selanjutnya!'],
  'l.short.LO-4': ['Banyak atau sedikit!'],
  'l.short.LO-5': ['Hitungan!'],
  'l.short.LO-11': ['Hitung di kepala!'],
  'l.short.VO-13': ['Katakan jawabannya!'],
  'l.short.EN-2': ['Angka bahasa Inggris!'],
  'l.short.MO-4': ['Apa pasangannya?'],
  'l.short.MO-5': ['Paling besar atau paling kecil!'],
  'l.short.LO-6': ['Cari angkanya!'],
  'l.short.LO-10': ['Memori!'],
  'l.short.EN-3': ['Memori bahasa Inggris!'],
  'l.short.LO-7': ['Bentuk dan warna!'],
  'l.short.LO-8': ['Jam berapa?'],
  'l.short.LO-9': ['Uang!'],
  'l.short.TR-1': ['Ayo menebalkan!'],
  'l.short.TR-2': ['Ayo menulis!'],
  'l.short.MO-6': ['Pertanyaan tentang negaramu!'],
  'l.home.level': ['Bintang itu levelku!'],
  'l.intro.EN-1': ['Aku mengucapkan satu kata bahasa Inggris. Sentuh gambar yang benar!'],
  'l.intro.MO-1': ['Dengarkan baik-baik, lalu sentuh yang aku minta.', 'Ayo keliling dunia! Cari yang aku minta.'],
  'l.intro.LO-1': ['Perhatikan gambarnya. Hanya satu yang bukan dari keluarga yang sama: temukan!'],
  'l.intro.LO-2': ['Ayo berhitung! Hitung buahnya, lalu sentuh angka yang benar.'],
  'l.intro.MO-3': ['Perhatikan bayangan hitam ini. Cari tahu bayangan siapa!'],
  'l.intro.LO-3': ['Perhatikan polanya, lalu cari apa yang datang selanjutnya.'],
  'l.intro.LO-4': ['Perhatikan kartunya. Cari kartu yang aku minta!'],
  'l.intro.LO-11': ['Berhitung tanpa gambar! Dengarkan, hitung di kepala, lalu sentuh angka yang benar.'],
  'l.intro.VO-13': ['Aku mengucapkan soal hitungan, kamu bilang jawabannya. Sentuh mikrofon untuk menjawab!'],
  'l.intro.LO-5': ['Ayo berhitung! Dengarkan baik-baik, lalu sentuh angka yang benar.', 'Waktunya berhitung! Kamu boleh pakai jari.'],
  'l.intro.EN-2': ['Aku mengucapkan angka dalam bahasa Inggris. Sentuh angka yang benar!'],
  'l.intro.MO-4': ['Ada benda yang berpasangan, seperti kunci dan gembok. Cari pasangannya!'],
  'l.intro.MO-5': ['Di gambar, semuanya sama besar. Tapi di dunia nyata? Cari yang aku minta!'],
  'l.intro.LO-6': ['Aku mengucapkan satu angka. Cari di antara kartu-kartu!'],
  'l.intro.LO-10': ['Ayo main memori! Balik dua kartu: kalau gambarnya sama, kamu dapat pasangannya!'],
  'l.intro.EN-3': ['Memori bahasa Inggris! Saat kamu membalik kartu, aku mengucapkan katanya dalam bahasa Inggris. Cari pasangannya!'],
  'l.intro.LO-7': ['Ayo bermain bentuk dan warna! Dengarkan baik-baik, lalu sentuh bentuk yang benar.'],
  'l.intro.LO-8': ['Perhatikan jamnya! Jarum pendek menunjukkan jam, jarum panjang menunjukkan menit.'],
  'l.intro.LO-9': ['Ayo main jual-beli! Hitung uangnya, lalu cari jumlah yang benar.'],
  'l.intro.TR-1': ['Ayo menggambar dengan jari! Mulai dari titik hijau, lalu ikuti garis titik-titik.'],
  'l.intro.TR-2': ['Ayo belajar menulis! Mulai dari titik hijau nomor satu, lalu ikuti garis titik-titik.'],
  'l.intro.MO-6': ['Ayo bicara tentang negaramu! Dengarkan baik-baik, lalu sentuh gambar yang benar.', 'Kamu kenal negaramu? Aku akan bertanya!'],
  'l.trace.start': ['Taruh jarimu di titik hijau, lalu ikuti titik-titik kecil.', 'Ayo, menggambar dengan jarimu!'],
  'l.trace.continue': ['Terus, sedikit lagi!', 'Masih kurang sedikit. Terus!'],
  'l.trace.retry': ['Hampir! Kita hapus dan mulai lagi?', 'Ups, belum pas. Coba lagi!'],
  'l.tutorial': ['Lihat, aku tunjukkan! Kita sentuh gambar yang benar, seperti ini.'],
  'l.tutorial_your_turn': ['Sekarang giliranmu!'],
  'l.correct': ['Hebat {name}!', 'Bagus, {name}!', 'Tepat sekali!', 'Luar biasa!', 'Keren!', 'Yeay!', 'Mantap!', 'Juara!', 'Kamu bintang!',
    'Betul!', 'Sempurna!', 'Wow!'],
  'l.wrong': ['Ups! Coba lagi!', 'Hmm, lihat baik-baik…', 'Bukan yang itu! Terus cari!', 'Hampir! Sekali lagi!', 'Tidak apa-apa, coba lagi!'],
  'l.hint': ['Aku bantu: sentuh yang berkilau!', 'Lihat, yang ini!'],
  'l.streak': ['Tiga kali benar berturut-turut! Kamu hebat!', 'Tiga berturut-turut! Luar biasa!'],
  'l.idle': ['Kamu di situ? Sentuh satu kartu!', 'Aku menunggumu! Sentuh satu kartu.'],
  'l.touch_me': ['Untuk mendengar lagi, sentuh aku!'],
  'l.review_due': ['Yang ini sudah pernah kita lihat. Kamu ingat?', 'Soal ulangan! Aku yakin kamu tahu.'],
  'l.review': ['Kamu sudah tahu semuanya! Kita ulang yuk?'],
  'l.series_perfect': ['Wow, benar semua! Kamu benar-benar bintang, {name}!', 'Tidak ada yang salah! Aku menari kegirangan!'],
  'l.series_great': ['Luar biasa! Hampir benar semua!', 'Kamu berbakat sekali, {name}!'],
  'l.series_good': ['Mainnya bagus sekali! Kamu cepat belajar!', 'Hebat, kamu menemukan banyak!'],
  'l.series_ok': ['Bagus! Kita latihan lagi?', 'Bagus! Setiap ronde membuatmu makin pintar.'],
  'l.series_encourage': ['Tadi sulit, ya? Aku juga sedang belajar!', 'Tidak apa-apa! Kita belajar sambil bermain.', 'Dinosaurus besar juga bisa salah! Mulai lagi?'],
  'l.end.feed': ['Lihat keranjang buah ini! Sentuh keranjangnya untuk memberikannya padaku.', 'Nyam! Berikan keranjangnya: sentuh!'],
  'l.end.nothing': ['Kali ini tidak ada buah. Main lagi supaya dapat buah?'],
  'l.end.again': ['Sentuh tombol hijau untuk main lagi!'],
  'l.fly.visit': ['Lihat, ada lalat!', 'Aku suka lalat!'],
  'l.home.ambient': ['Sepertinya gunung api masih meletus.', 'Aku agak lapar.', 'Bantu aku tumbuh besar, ya!', 'Lihat awannya lewat!'],
  'l.fly.caught': ['Slurp! Seekor lalat!', 'Nyam, renyah!', 'Dapat!'],
  'l.fruit.won': ['Buah untukku!', 'Nyam, buah!'],
  'l.eating': ['Nyam nyam!', 'Kres! Enak!', 'Mmm, lezat!', 'Lagi, dong!', 'Terima kasih!'],
  'l.full': ['Perutku sudah kenyang! Sisanya kusimpan untuk nanti.'],
  'l.level_up': ['Oh! Aku tumbuh! Terima kasih sudah merawatku dengan baik!', 'Lihat, aku jadi lebih besar!'],
  'l.tickle': ['Hihi, geli!', 'Hahaha! Sudah!', 'Aduh, jangan digelitik!'],
  'l.start': ['Sentuh aku untuk membangunkanku!'],
  'l.parent_code': ['Sebelum bermain, panggil Ibu atau Ayah! Mereka harus memilih kode rahasia untukku.'],
  'l.parent_code_done': ['Terima kasih! Sekarang kita bisa main bersama!'],
  'l.wardrobe.intro': ['Seret satu barang ke tubuhku supaya aku memakainya!', 'Dandani aku! Ambil barang dengan jarimu, lalu taruh di tubuhku.'],
  'l.wardrobe.drag': ['Tahan jarimu di barang itu, lalu seret ke arahku!'],
  'l.wardrobe.off': ['Baik, aku lepas!', 'Dilepas!'],
  'l.wardrobe.empty': ['Lemariku kosong! Saat aku tumbuh, kamu dapat barang untukku.'],
  'l.home.wardrobe': ['Topi itu untuk mendandaniku!'],
  'l.gift.waiting': ['Aku sudah besar! Sentuh hadiahnya untuk memilih barang untukku.'],
  'l.gift.go': ['Aku sudah besar! Ayo ke lemariku: ada hadiah menunggumu!'],
  'l.wardrobe.new': ['Seret ke tubuhku supaya aku memakainya!'],
  'l.wardrobe.take_off': ['Untuk melepas barang, seret menjauh dariku.'],
  'l.night.last': ['Wah, sudah malam… Satu ronde terakhir, lalu tidur?', 'Hoahm… aku mengantuk. Ayo, satu ronde terakhir!'],
  'l.night.goodnight': ['Itu ronde terakhir! Terima kasih untuk hari yang indah. Selamat tidur!'],
  'l.night.sleep': ['Ssst… aku sedang tidur. Zzz… Sampai besok!'],
  'l.bedtime': ['Hari ini kita main banyak! Sekarang aku mau tidur. Besok main lagi?'],
  'l.streak5': ['Lima berturut-turut! Kamu jenius!', 'Lima! Kamu lebih kuat dari T-rex!'],
  'l.correct_after_try': ['Kamu menemukannya! Tuh kan, tinggal dicari!', 'Betul! Kamu tidak menyerah, hebat!'],
  'l.halfway': ['Sudah setengah jalan! Terus semangat!', 'Setengah! Tinggal beberapa soal lagi!'],
  'l.last_question': ['Soal terakhir!', 'Ayo, yang terakhir!'],
  'l.home.voice': ['Mikrofon: permainan yang dijawab dengan suara!'],
  'l.home.voice_choose': ['Di sini kamu menjawab dengan berbicara! Pilih permainan.'],
  'l.intro.VO-1': ['Aku tunjukkan gambar. Sentuh mikrofon, lalu sebutkan namanya.'],
  'l.intro.VO-2': ['Ayo berbahasa Inggris! Sentuh mikrofon, lalu ucapkan katanya dalam bahasa Inggris.'],
  'l.home.VO-1': ['Kepala bicara: sebutkan nama gambarnya!'],
  'l.home.VO-2': ['Bendera: ucapkan kata-katanya dalam bahasa Inggris!'],
  'l.short.VO-1': ['Apa namanya?'],
  'l.short.VO-2': ['Bahasa Inggris!'],
  'l.voice.tap_mic': ['Sentuh mikrofon, lalu jawab aku.'],
  'l.voice.listening': ['Aku mendengarkan!'],
  'l.voice.unheard': ['Aku kurang dengar. Sentuh mikrofon, lalu bicara lebih keras.'],
  'l.voice.wrong': ['Bukan itu! Coba lagi!'],
  'l.voice.cards': ['Telingaku lelah! Sentuh jawaban yang benar dengan jarimu.'],
  'l.voice.give_up': ['Mikrofon tidak bisa mendengarku. Mulai sekarang kita main dengan jari!'],
  'l.voice.loading': ['Tunggu, aku sedang membersihkan telinga…'],
  'l.voice.no_mic': ['Oh, aku tidak bisa mendengarmu. Ayo main dengan jari!'],
  'l.egg.1': ['Tok tok! Ada orang?', 'Oh! Ada yang bergerak di dalam!'],
  'l.egg.2': ['Lagi! Bantu aku keluar!', 'Terus, cangkangnya mulai retak!'],
  'l.egg.3': ['Hampir! Ketuk sekali lagi!'],
  'l.egg.hatched': ['Halo!', 'Fiuh! Aku keluar!'],
  'l.hello.1': ['Halo! Aku dinomu, bayi dinosaurus kecil berwarna {color}. Maukah kamu membantuku tumbuh?'],
  'l.hello.4': ['Kita akan main banyak permainan bersama: hewan, bentuk, huruf, angka, bahkan bahasa lain!'],
  'l.hello.5': ['Setiap kali kamu menjawab benar pada percobaan pertama, kamu dapat satu buah. Lihat, buahnya jatuh ke keranjangku!'],
  'l.hello.6': ['Lalu kamu memberikannya untuk kumakan. Nyam! Makin banyak aku makan, makin besar aku!'],
  'l.hello.7': ['Dan saat aku tumbuh, kamu dapat hadiah: baju untuk mendandaniku, bintang, dan kejutan!'],
  'l.hello.2': ['Aku baru saja menetas… Aku belum tahu apa-apa tentang dunia! Bersamamu, aku akan belajar semuanya.'], 'l.hello.9': ['Di “Dinoku”, kamu bisa mendandaniku sesukamu: topi, kacamata, jubah… Aku akan jadi dino paling keren!'], 'l.hello.10': ['Kalau kamu salah, tidak apa-apa: aku akan memberi petunjuk, dan kita coba lagi bersama!'], 'l.hello.8': ['Ayo, kita mulai!'],
  'l.hello.name': ['Tapi pertama, siapa namamu?'],
  'l.hello.name_again': ['Aku kurang dengar. Sebutkan namamu sekali lagi!'],
  'l.hello.name_ok': ['Senang berkenalan denganmu, {name}! Namamu bagus sekali!'],
  'l.hello.name_later': ['Nanti saja kamu beri tahu namamu: Ibu atau Ayah akan menuliskannya untukku!'],
  'l.hello.age': ['Dan kamu, {name}, umurmu berapa?'],
  'l.hello.age_again': ['Aku kurang dengar. Umurmu berapa?'],
  'l.hello.age_later': ['Tidak apa-apa: Ibu atau Ayah akan memberitahuku!'],
  'l.hello.sibling': ['Halo {name}! Aku dinomu, bayi dinosaurus kecil berwarna {color}. Kita akan bersenang-senang bersama!'],
  'l.hello.mic_allow': ['Kalau ada pesan di layar, minta orang dewasa menyentuh “Izinkan”!'],
  'l.hello.parent': ['Sekarang berikan ponselnya ke Ibu atau Ayah! Mereka akan memilih kode rahasia, khusus untukku.'],
  'l.welcome_first': ['Ini rumahku, {name}! Kita akan bersenang-senang!'],
  'l.burp': ['Ups! Maaf!', 'Hihi… permisi!', 'Maaf… tadi enak sekali!'],
  'l.fart': ['Ups… maaf!', 'Hihi, bukan aku!', 'Maaf! Perutku bunyi aneh!'],
  'l.hunger.growl': ['Dengar? Perutku keroncongan! Berikan keranjangnya!'],
  'l.hunger.look': ['Mmm… buah itu kelihatan enak… Sentuh keranjangnya!'],
  'l.hunger.beg': ['Tolong, tolong! Berikan keranjangnya!', 'Ayo, {name}, tolong! Aku lapar!'],
  'l.hunger.gape': ['Lihat, aku buka mulut lebar-lebar: aaa! Masukkan buahnya!'],
  'l.hunger.sad': ['Aku lapar sekali… Sentuh keranjangnya!', 'Perutku kosong… Mau memberiku makan?'],
  'l.child.turn': ['Giliranmu, {name}! Ayo main bersama?', 'Halo {name}! Sekarang giliranmu main!'],
  'l.child.ask_name': ['Halo! Panggil Ibu atau Ayah: mereka harus memberitahuku namamu!'],
  'l.age.ask': ['Umurmu berapa? Sentuh kue dengan umurmu!'],
  'l.age.3': ['Tiga tahun! Keren!'], 'l.age.4': ['Empat tahun! Keren!'], 'l.age.5': ['Lima tahun! Hebat!'],
  'l.age.6': ['Enam tahun! Hebat!'], 'l.age.7': ['Tujuh tahun! Wow!'],

  // ---- Mon pays ----
  "lang.ko": "Korea", "lang.ne": "Nepal",
  "lang.vi": "Vietnam", "lang.tr": "Turki", "lang.fa": "Persia", "lang.pl": "Polandia", "lang.uk": "Ukraina",
  'cty.flag': 'Mana bendera {country}?', 'cty.flagHard': 'Hati-hati, mirip semua! Mana bendera {country}?',
  'cty.flagYes': 'Ya! Itu bendera {country}!', 'cty.flagHint': 'perhatikan warnanya dan urutannya',
  'cty.symbol': 'Mana lambang {country}?', 'cty.symbolYes': 'Ya! Itu lambang {country}!',
  'cty.symbolYesName': 'Ya! {name} adalah lambang {country}!',
  'cty.food': ['Mana makanan khas {country}?', 'Apa yang suka dimakan orang di {country}?'],
  'cty.foodYes': 'Nyam! Itu makanan khas {country}!',
  'cty.day': 'Tanggal {date} adalah hari nasional {country}! Apa yang kita lihat di langit pada malam hari?',
  'cty.dayYes': 'Ya! Tanggal {date} ada kembang api besar!',
  'cty.currency': 'Uang apa yang dipakai di {country}?', 'cty.currencyYes': 'Ya! Di {country} orang membayar dengan {money}!',
  'cty.place': 'Tempat terkenal apa yang ada di {country}?', 'cty.sport': 'Olahraga apa yang disukai orang di {country}?',
  'cty.thing': 'Apa yang sering terlihat saat pesta di {country}?', 'cty.landmarkYes': 'Ya! Hebat, kamu kenal negaramu!',
  'cty.capital': 'Apa ibu kota {country}? Baca nama kotanya baik-baik!',
  'cty.capitalYes': 'Ya! Ibu kota {country} adalah {city}!',
  'cty.neighbour': 'Mana bendera negara tetangga {country}?',
  'cty.neighbourYes': 'Ya! Negara ini tepat di sebelah {country}!',
  'cty.neighbourHint': 'negara tetangga sangat dekat, di benua yang sama',

  ...kv('c', `dog=anjing; cat=kucing; fish=ikan; bird=burung; cow=sapi; pig=babi; horse=kuda; duck=bebek; rabbit=kelinci; hen=ayam betina;
    sheep=domba; frog=katak; mouse=tikus; dinosaur=dinosaurus; red=merah; blue=biru; green=hijau; yellow=kuning; orange_color=oranye;
    purple=ungu; pink=merah muda; black=hitam; white=putih; brown=cokelat; apple=apel; banana=pisang; strawberry=stroberi;
    cherry=ceri; orange=jeruk; egg=telur; ice_cream=es krim; pizza=piza; grapes=anggur; pear=pir; lemon=lemon; carrot=wortel;
    bread=roti; milk=susu; cake=kue; watermelon=semangka; cookie=biskuit; cheese=keju; tomato=tomat; pineapple=nanas; peach=persik;
    broccoli=brokoli; corn=jagung; kiwi=kiwi; mango=mangga; blueberries=bluberi; coconut=kelapa; car=mobil; ball=bola; bus=bus;
    train=kereta api; plane=pesawat; boat=perahu; bike=sepeda; balloon=balon; teddy=boneka beruang; book=buku; house=rumah;
    kite=layang-layang; bed=tempat tidur; chair=kursi; door=pintu; key=kunci; clock=jam dinding; sun=matahari; moon=bulan;
    star=bintang; flower=bunga; cloud=awan; rainbow=pelangi; tree=pohon; rain=hujan; snowflake=kepingan salju; snowman=manusia salju;
    leaf=daun; mountain=gunung; fire=api; sunflower=bunga matahari; drop=tetes air; eye=mata; ear=telinga; nose=hidung; mouth=mulut;
    hand=tangan; foot=kaki; tooth=gigi; lion=singa; tiger=harimau; elephant=gajah; monkey=monyet; bear=beruang; giraffe=jerapah;
    zebra=zebra; panda=panda; snake=ular; turtle=kura-kura; crocodile=buaya; kangaroo=kanguru; hippo=kuda nil; gorilla=gorila;
    rhino=badak; butterfly=kupu-kupu; bee=lebah; ladybug=kepik; spider=laba-laba; ant=semut; snail=siput; dolphin=lumba-lumba;
    whale=paus; octopus=gurita; crab=kepiting; shark=hiu; owl=burung hantu; penguin=penguin; parrot=burung beo; flamingo=flamingo;
    peacock=burung merak; eagle=elang; swan=angsa; hat=topi; shoe=sepatu; dress=gaun; cap=topi pet; socks=kaus kaki;
    gloves=sarung tangan; tshirt=kaus; glasses=kacamata; umbrella=payung; pencil=pensil; spoon=sendok; scissors=gunting;
    hammer=palu; ladder=tangga; broom=sapu; bottle=botol susu; toothbrush=sikat gigi; guitar=gitar; drum=gendang; piano=piano;
    violin=biola; trumpet=terompet; helicopter=helikopter; tractor=traktor; rocket=roket; ambulance=ambulans; motorbike=sepeda motor;
    fire_engine=mobil pemadam kebakaran; police_car=mobil polisi; scooter=skuter; sled=kereta salju; llama=llama; goat=kambing;
    camel=unta; hedgehog=landak; squirrel=tupai; bat=kelelawar; deer=rusa; wolf=serigala; fox=rubah; raccoon=rakun; beaver=berang-berang;
    otter=linsang; sloth=kungkang; skunk=sigung; bison=bison; castle=istana; tent=tenda; lighthouse=mercusuar; volcano=gunung api;
    island=pulau; anchor=jangkar; magnet=magnet; compass=kompas; microscope=mikroskop; telescope=teleskop; hourglass=jam pasir;
    jellyfish=ubur-ubur; seal=anjing laut; lobster=lobster; shrimp=udang; squid=cumi-cumi; oyster=tiram; beetle=kumbang;
    cricket=jangkrik; mosquito=nyamuk; worm=cacing; scorpion=kalajengking; rooster=ayam jantan; turkey=kalkun; donkey=keledai;
    ox=lembu; leopard=macan tutul; polar_bear=beruang kutub; koala=koala; orangutan=orang utan; mammoth=mamut; moose=rusa besar;
    badger=luak; avocado=alpukat; eggplant=terong; garlic=bawang putih; onion=bawang bombai; pepper=cabai; cucumber=mentimun;
    potato=kentang; mushroom=jamur; peanuts=kacang tanah; croissant=kroisan; pancakes=panekuk; honey=madu; spaghetti=spageti;
    fries=kentang goreng; sandwich=roti lapis; candle=lilin; mirror=cermin; window=jendela; bucket=ember; bell=lonceng; lock=gembok;
    light_bulb=bola lampu; flashlight=senter; axe=kapak; saw=gergaji; wrench=kunci inggris; screwdriver=obeng; paintbrush=kuas;
    crayon=krayon; trophy=piala; medal=medali; ring=cincin; skateboard=papan luncur; yoyo=yoyo; roller_skate=sepatu roda;
    canoe=kano; tram=trem; parachute=parasut; satellite=satelit; brain=otak; bone=tulang; tongue=lidah; leg=tungkai;
    tornado=angin puting beliung; lightning=petir; comet=komet; cactus=kaktus; blossom=bunga sakura; feather=bulu burung`),
  // Espace parents : onglets.
  'p.dailyShort': 'Lalu dino pergi tidur.', 'p.tab.profile': 'Profil', 'p.tab.progress': 'Kemajuan', 'p.tab.games': 'Permainan', 'p.tab.settings': 'Pengaturan', 'p.summary': 'Ringkasan', 'p.lower': 'Turunkan', 'p.higher': 'Naikkan',
};

export default id;
