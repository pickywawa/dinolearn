"""
Notes de version Google Play (« Nouveautés »), une par langue de fiche, ≤ 500 caractères.
`python3 fastlane/changelogs.py` écrit fastlane/metadata/android/<langue>/changelogs/<versionCode>.txt
pour la version de web/package.json (0.26.0 → 2600). À compléter à chaque version.
"""
import json
import os
from listings import LOCALES, NO_VOICE

HERE = os.path.dirname(os.path.abspath(__file__))
VERSION = json.load(open(os.path.join(HERE, '..', 'package.json')))['version']

# Pour chaque langue : les nouveautés, puis la ligne du micro (seulement là où il y a des jeux à voix haute).
NOTES = {
  '0.26.1': {
    'fr': (['Sur un téléphone dans une autre langue, le jeu démarre en anglais', 'Petites corrections'], ''),
    'en': (['On a phone set to another language, the game now starts in English', 'Small fixes'], ''),
    'es': (['En un teléfono en otro idioma, el juego empieza en inglés', 'Pequeñas correcciones'], ''),
    'it': (['Su un telefono in un\'altra lingua, il gioco parte in inglese', 'Piccole correzioni'], ''),
    'de': (['Auf einem Handy in einer anderen Sprache startet das Spiel jetzt auf Englisch', 'Kleine Korrekturen'], ''),
    'pt': (['Em um celular em outro idioma, o jogo começa em inglês', 'Pequenas correções'], ''),
    'ru': (['На телефоне с другим языком игра теперь запускается на английском', 'Небольшие исправления'], ''),
    'zh': (['手机使用其他语言时，游戏会以英语启动', '小修复'], ''),
    'hi': (['किसी दूसरी भाषा वाले फ़ोन पर खेल अब अंग्रेज़ी में शुरू होता है', 'छोटे सुधार'], ''),
    'ar': (['على هاتف بلغة أخرى، تبدأ اللعبة الآن بالإنجليزية', 'إصلاحات صغيرة'], ''),
    'ur': (['کسی دوسری زبان والے فون پر کھیل اب انگریزی میں شروع ہوتا ہے', 'چھوٹی اصلاحات'], ''),
    'bn': (['অন্য ভাষার ফোনে খেলাটি এখন ইংরেজিতে শুরু হয়', 'ছোটখাটো সংশোধন'], ''),
    'id': (['Di ponsel berbahasa lain, permainan kini dimulai dalam bahasa Inggris', 'Perbaikan kecil'], ''),
    'vi': (['Trên điện thoại dùng ngôn ngữ khác, trò chơi giờ bắt đầu bằng tiếng Anh', 'Sửa lỗi nhỏ'], ''),
    'tr': (['Başka dildeki bir telefonda oyun artık İngilizce başlıyor', 'Küçük düzeltmeler'], ''),
    'fa': (['در گوشی با زبان دیگر، بازی اکنون به انگلیسی شروع می‌شود', 'اصلاحات کوچک'], ''),
    'pl': (['Na telefonie w innym języku gra uruchamia się teraz po angielsku', 'Drobne poprawki'], ''),
    'uk': (['На телефоні з іншою мовою гра тепер запускається англійською', 'Дрібні виправлення'], ''),
    'ne': (['अर्को भाषाको फोनमा खेल अब अंग्रेजीमा सुरु हुन्छ', 'साना सुधारहरू'], ''),
    'ko': (['다른 언어로 설정된 휴대폰에서는 이제 영어로 시작해요', '작은 수정'], ''),
  },
  '0.26.0': {
    'fr': (['Nouveau jeu : le sudoku des fruits (dès 5 ans)', 'Nouveau jeu : partage le gâteau, pour découvrir la moitié, le tiers et le quart',
            'Missions rangées par matière : anglais, maths, français, logique, le monde', 'Nouvelle icône'],
           'Jeux à voix haute : le micro apparaît quand c\'est à l\'enfant de parler'),
    'en': (['New game: fruit sudoku (from age 5)', 'New game: share the cake, to discover halves, thirds and quarters',
            'Missions sorted by subject: Spanish, maths, English, logic, the world', 'New icon'],
           'Speaking games: the microphone appears when it\'s the child\'s turn to speak'),
    'es': (['Nuevo juego: el sudoku de frutas (desde 5 años)', 'Nuevo juego: reparte el pastel, para descubrir la mitad, el tercio y el cuarto',
            'Misiones ordenadas por materia: inglés, mates, español, lógica, el mundo', 'Nuevo icono'],
           'Juegos en voz alta: el micrófono aparece cuando le toca hablar al niño'),
    'it': (['Nuovo gioco: il sudoku della frutta (dai 5 anni)', 'Nuovo gioco: dividi la torta, per scoprire metà, terzo e quarto',
            'Missioni ordinate per materia: inglese, matematica, italiano, logica, il mondo', 'Nuova icona'],
           'Giochi a voce alta: il microfono appare quando tocca al bambino parlare'),
    'de': (['Neues Spiel: Obst-Sudoku (ab 5 Jahren)', 'Neues Spiel: Teil den Kuchen – Hälfte, Drittel und Viertel entdecken',
            'Missionen nach Fächern sortiert: Englisch, Mathe, Deutsch, Logik, die Welt', 'Neues Symbol'],
           'Sprechspiele: Das Mikrofon erscheint, wenn das Kind sprechen darf'),
    'pt': (['Novo jogo: sudoku de frutas (a partir de 5 anos)', 'Novo jogo: divida o bolo, para descobrir metade, terço e quarto',
            'Missões organizadas por matéria: inglês, matemática, português, lógica, o mundo', 'Novo ícone'],
           'Jogos em voz alta: o microfone aparece quando é a vez da criança falar'),
    'ru': (['Новая игра: фруктовое судоку (с 5 лет)', 'Новая игра: подели торт — половина, треть и четверть',
            'Задания по предметам: английский, математика, русский, логика, мир вокруг', 'Новая иконка'],
           'Игры вслух: микрофон появляется, когда ребёнку пора говорить'),
    'zh': (['新游戏：水果数独（5岁起）', '新游戏：分蛋糕，认识二分之一、三分之一和四分之一', '任务按科目分类：英语、数学、中文、逻辑、认识世界', '全新图标'],
           '开口说的游戏：轮到孩子说话时，麦克风才会出现'),
    'hi': (['नया खेल: फलों का सुडोकू (5 साल से)', 'नया खेल: केक बाँटो — आधा, तिहाई और चौथाई सीखो', 'मिशन विषय के हिसाब से: अंग्रेज़ी, गणित, हिंदी, तर्क, दुनिया', 'नया आइकन'],
           'बोलकर खेलने वाले खेल: बच्चे की बारी आने पर माइक दिखता है'),
    'ar': (['لعبة جديدة: سودوكو الفواكه (من 5 سنوات)', 'لعبة جديدة: قسّم الكعكة لاكتشاف النصف والثلث والربع', 'المهام مرتبة حسب المادة: الإنجليزية، الرياضيات، العربية، المنطق، العالم', 'أيقونة جديدة'],
           ''),
    'ur': (['نیا کھیل: پھلوں کا سوڈوکو (5 سال سے)', 'نیا کھیل: کیک بانٹو — آدھا، تہائی اور چوتھائی سیکھو', 'مشن مضمون کے حساب سے: انگریزی، ریاضی، اردو، منطق، دنیا', 'نیا آئیکن'],
           ''),
    'bn': (['নতুন খেলা: ফলের সুডোকু (৫ বছর থেকে)', 'নতুন খেলা: কেক ভাগ করো — অর্ধেক, এক-তৃতীয়াংশ আর এক-চতুর্থাংশ', 'বিষয় অনুযায়ী মিশন: ইংরেজি, গণিত, বাংলা, যুক্তি, পৃথিবী', 'নতুন আইকন'],
           ''),
    'id': (['Permainan baru: sudoku buah (mulai 5 tahun)', 'Permainan baru: bagi kuenya, untuk mengenal setengah, sepertiga, dan seperempat',
            'Misi diurutkan per pelajaran: bahasa Inggris, matematika, bahasa Indonesia, logika, dunia', 'Ikon baru'],
           ''),
    'vi': (['Trò chơi mới: sudoku trái cây (từ 5 tuổi)', 'Trò chơi mới: chia bánh, để học một nửa, một phần ba và một phần tư',
            'Nhiệm vụ xếp theo môn: tiếng Anh, toán, tiếng Việt, tư duy, thế giới', 'Biểu tượng mới'],
           'Trò chơi nói to: micro chỉ hiện ra khi đến lượt bé nói'),
    'tr': (['Yeni oyun: meyve sudokusu (5 yaştan itibaren)', 'Yeni oyun: pastayı paylaş — yarım, üçte bir ve çeyrek',
            'Görevler derse göre sıralandı: İngilizce, matematik, Türkçe, mantık, dünya', 'Yeni simge'],
           'Sesli oyunlar: mikrofon, konuşma sırası çocuğa gelince görünür'),
    'fa': (['بازی جدید: سودوکوی میوه (از ۵ سالگی)', 'بازی جدید: کیک را تقسیم کن — نصف، یک‌سوم و یک‌چهارم', 'مأموریت‌ها بر اساس درس: انگلیسی، ریاضی، فارسی، منطق، جهان', 'نماد جدید'],
           'بازی‌های بلندگفتنی: میکروفون وقتی نوبت حرف زدن کودک است پیدا می‌شود'),
    'pl': (['Nowa gra: owocowe sudoku (od 5 lat)', 'Nowa gra: podziel tort — połowa, jedna trzecia i ćwierć',
            'Misje według przedmiotów: angielski, matematyka, polski, logika, świat', 'Nowa ikona'],
           'Gry na głos: mikrofon pojawia się, gdy przychodzi kolej dziecka'),
    'uk': (['Нова гра: фруктове судоку (з 5 років)', 'Нова гра: поділи торт — половина, третина й чверть',
            'Завдання за предметами: англійська, математика, українська, логіка, світ', 'Нова іконка'],
           'Ігри вголос: мікрофон з’являється, коли дитині час говорити'),
    'ne': (['नयाँ खेल: फलफूलको सुडोकु (५ वर्षदेखि)', 'नयाँ खेल: केक बाँड — आधा, एक तिहाइ र एक चौथाइ', 'विषय अनुसार मिसन: अंग्रेजी, गणित, नेपाली, तर्क, संसार', 'नयाँ आइकन'],
           ''),
    'ko': (['새 게임: 과일 스도쿠(5세부터)', '새 게임: 케이크 나누기 — 2분의 1, 3분의 1, 4분의 1', '과목별 미션: 영어, 수학, 한국어, 논리, 세상', '새 아이콘'],
           '말하기 게임: 아이가 말할 차례에만 마이크가 나타나요'),
  },
}


def version_code(version):
    major, minor, patch = (int(x) for x in version.split('.'))
    return major * 10000 + minor * 100 + patch


def main():
    notes = NOTES.get(VERSION)
    if not notes:
        raise SystemExit(f'Pas de notes pour la version {VERSION} dans fastlane/changelogs.py')
    code = version_code(VERSION)
    for lang, locales in LOCALES.items():
        items, mic = notes[lang]
        lines = list(items)
        if mic and lang not in NO_VOICE:
            lines.insert(2, mic)
        text = '\n'.join('• ' + line for line in lines)
        if len(text) > 500:
            raise SystemExit(f'{lang} : {len(text)} > 500 caractères')
        for loc in locales:
            d = os.path.join(HERE, 'metadata', 'android', loc, 'changelogs')
            os.makedirs(d, exist_ok=True)
            with open(os.path.join(d, f'{code}.txt'), 'w', encoding='utf-8') as f:
                f.write(text + '\n')
        print(f'{lang:3} {len(text):3} caractères → {", ".join(locales)}')


if __name__ == '__main__':
    main()
