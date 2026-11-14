"""
Fiches App Store de DinoLearn, une par langue. `python3 fastlane/appstore.py` écrit
fastlane/metadata/ios/<langue App Store>/{name,subtitle,description,keywords,promotional_text}.txt
et vérifie les limites d'Apple (nom 30, sous-titre 30, mots-clés 100, texte promotionnel 170,
description 4000 caractères). Les descriptions viennent de listings.py (mêmes promesses que Google Play).
Envoi : `node scripts/asc-listings.mjs` (vérifie), puis `--commit` (enregistre).
"""
import os
from listings import L, full

# Langue du jeu → langues de fiche App Store (Apple n'a pas de fiche pour l'ourdou, le persan ni le népalais :
# ces langues retombent sur l'anglais).
LOCALES = {
    'fr': ['fr-FR', 'fr-CA'], 'en': ['en-US', 'en-GB'], 'es': ['es-ES', 'es-MX'], 'it': ['it'], 'de': ['de-DE'],
    'pt': ['pt-BR'], 'ru': ['ru'], 'zh': ['zh-Hans'], 'hi': ['hi'], 'ar': ['ar-SA'], 'bn': ['bn-BD'],
    'id': ['id'], 'vi': ['vi'], 'tr': ['tr'], 'pl': ['pl'], 'uk': ['uk'], 'ko': ['ko'],
}

# Nom de l'appli dans App Store Connect, pour l'anglais (choisi à la création de la fiche).
NAME_EN = 'DinoLearn: Kids Learning Games'

# Sous-titre (30 max) et mots-clés (100 max, séparés par des virgules, sans répéter le nom de l'appli).
EXTRA = {
'fr': ('Jeux éducatifs 3-7 ans', 'enfant,maternelle,maths,lecture,logique,dinosaure,calcul,syllabes,mémoire,anglais,éducatif,sans pub'),
'en': ('Fun learning for ages 3-7', 'kids,toddler,preschool,maths,logic,counting,reading,spanish,dinosaur,educational,memory,no ads'),
'es': ('Juegos educativos 3-7 años', 'niños,preescolar,mates,lectura,lógica,dinosaurio,contar,memoria,inglés,educativo,sin anuncios'),
'it': ('Giochi educativi 3-7 anni', 'bambini,prescolare,matematica,lettura,logica,dinosauro,contare,memoria,inglese,educativo'),
'de': ('Lernspiele für 3–7 Jahre', 'Kinder,Vorschule,Mathe,Lesen,Logik,Dinosaurier,Zählen,Gedächtnis,Englisch,lernen,ohne Werbung'),
'pt': ('Jogos educativos 3-7 anos', 'crianças,pré-escola,matemática,leitura,lógica,dinossauro,contar,memória,inglês,educativo'),
'ru': ('Игры для детей 3–7 лет', 'дети,дошкольники,математика,чтение,логика,динозавр,счёт,память,английский,обучение,без рекламы'),
'zh': ('3到7岁儿童的学习游戏', '儿童,幼儿园,数学,阅读,逻辑,恐龙,算术,记忆,英语,早教,益智,无广告'),
'hi': ('3-7 साल के लिए सीखने के खेल', 'बच्चे,प्रीस्कूल,गणित,पढ़ना,तर्क,डायनासोर,गिनती,याददाश्त,अंग्रेज़ी,शिक्षा,खेल'),
'ar': ('ألعاب تعليمية للأطفال ٣-٧', 'أطفال,روضة,رياضيات,قراءة,منطق,ديناصور,عد,ذاكرة,إنجليزي,تعليم,ألعاب'),
'bn': ('৩-৭ বছরের শিশুদের খেলা', 'শিশু,প্রি-স্কুল,গণিত,পড়া,যুক্তি,ডাইনোসর,গোনা,স্মৃতি,ইংরেজি,শিক্ষা,খেলা'),
'id': ('Game edukasi usia 3-7 tahun', 'anak,balita,prasekolah,matematika,membaca,logika,dinosaurus,berhitung,memori,inggris,belajar'),
'vi': ('Trò chơi học cho bé 3-7 tuổi', 'trẻ em,mầm non,toán,đọc,tư duy,khủng long,đếm,trí nhớ,tiếng Anh,giáo dục,không quảng cáo'),
'tr': ('3-7 yaş eğitici oyunlar', 'çocuk,okul öncesi,matematik,okuma,mantık,dinozor,sayma,hafıza,İngilizce,eğitim,reklamsız'),
'pl': ('Gry edukacyjne dla dzieci 3–7', 'dzieci,przedszkole,matematyka,czytanie,logika,dinozaur,liczenie,pamięć,angielski,nauka'),
'uk': ('Ігри для дітей 3–7 років', 'діти,дошкільнята,математика,читання,логіка,динозавр,лічба,пам’ять,англійська,навчання'),
'ko': ('3~7세 학습 놀이', '어린이,유아,수학,읽기,논리,공룡,숫자,기억력,영어,교육,놀이,광고없음'),
}

def name(lang):
    return NAME_EN if lang == 'en' else L[lang]['title']

def main():
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'metadata', 'ios')
    problems = []
    for lang, locales in LOCALES.items():
        sub, kw = EXTRA[lang]
        t = L[lang]
        values = {'name': name(lang), 'subtitle': sub, 'description': full(lang), 'keywords': kw, 'promotional_text': t['short']}
        limits = {'name': 30, 'subtitle': 30, 'description': 4000, 'keywords': 100, 'promotional_text': 170}
        for k, v in values.items():
            if len(v) > limits[k]:
                problems.append(f'{lang} {k}: {len(v)} > {limits[k]}')
        for loc in locales:
            d = os.path.join(root, loc)
            os.makedirs(d, exist_ok=True)
            for k, v in values.items():
                with open(os.path.join(d, k + '.txt'), 'w', encoding='utf-8') as fh:
                    fh.write(v.strip() + '\n')
        print(f'{lang:3} nom {len(values["name"]):2}  sous-titre {len(sub):2}  mots-clés {len(kw):3}  → {", ".join(locales)}')
    if problems:
        raise SystemExit('Trop long :\n' + '\n'.join(problems))

if __name__ == '__main__':
    main()
