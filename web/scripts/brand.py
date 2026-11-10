#!/usr/bin/env python3
"""
Icônes et écran de démarrage de DinoLearn, à partir des deux images de référence :
  brand/icon.webp   (1254 × 1254, cadre jaune arrondi, coins noirs)
  brand/splash.webp (1672 × 941, paysage)
Usage :
  python3 -m venv /tmp/brand && /tmp/brand/bin/pip install pillow
  /tmp/brand/bin/python scripts/brand.py
"""
import os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
P = lambda *a: os.path.join(ROOT, *a)
RES = 'android/app/src/main/res'

icon = Image.open(P('brand/icon.webp')).convert('RGB')
splash = Image.open(P('brand/splash.webp')).convert('RGB')
N = icon.size[0]


def rounded(size, inset, radius, feather=0):
    m = Image.new('L', (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle((inset, inset, size - 1 - inset, size - 1 - inset), radius=radius, fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather)) if feather else m


# L'icône telle quelle, coins transparents (cadre jaune compris).
framed = icon.convert('RGBA')
framed.putalpha(rounded(N, 4, 250, 1.2))
# L'illustration sans le cadre (coins arrondis, bord adouci).
art_mask = rounded(N, 46, 215, 6)


def blurred(size):
    """Fond : l'illustration agrandie et floutée, pour remplir les coins sans cassure."""
    big = icon.crop((140, 140, N - 140, N - 140)).resize((size, size), Image.LANCZOS)
    return big.filter(ImageFilter.GaussianBlur(size / 40))


def full_bleed(size):
    """Carré plein (iOS arrondit lui-même) : l'illustration sur son fond flou."""
    bg = blurred(N)
    bg.paste(icon, (0, 0), art_mask)
    return bg.resize((size, size), Image.LANCZOS)


def out(im, *path):
    os.makedirs(os.path.dirname(P(*path)), exist_ok=True)
    im.save(P(*path), optimize=True)


# ---- Web ----
out(framed.resize((512, 512), Image.LANCZOS), 'public/icons/icon-512.png')
out(framed.resize((192, 192), Image.LANCZOS), 'public/icons/icon-192.png')
out(full_bleed(180), 'public/icons/apple-touch-icon.png')
splash.resize((1600, 900), Image.LANCZOS).save(P('public/loading/splash.webp'), quality=84, method=6)

# ---- iOS ----
out(full_bleed(1024), 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')
# Écran de démarrage : la même image que l'écran de chargement, cadrée pareil (remplit l'écran).
for name in ('splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png'):
    out(splash, 'ios/App/App/Assets.xcassets/Splash.imageset', name)

# ---- Android ----
DPI = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for dpi, k in DPI.items():
    layer = round(108 * k)
    # Icône adaptative : fond flou plein + illustration (70 dp sur 108) au premier plan.
    out(blurred(layer), RES, f'mipmap-{dpi}', 'ic_launcher_background.png')
    fg = Image.new('RGBA', (layer, layer), (0, 0, 0, 0))
    s = round(layer * 70 / 108)
    art = icon.resize((s, s), Image.LANCZOS).convert('RGBA')
    art.putalpha(art_mask.resize((s, s), Image.LANCZOS))
    fg.alpha_composite(art, ((layer - s) // 2, (layer - s) // 2))
    out(fg, RES, f'mipmap-{dpi}', 'ic_launcher_foreground.png')
    # Anciennes versions d'Android : l'icône encadrée, et sa version ronde.
    px = round(48 * k)
    out(framed.resize((px, px), Image.LANCZOS), RES, f'mipmap-{dpi}', 'ic_launcher.png')
    comp = blurred(layer).convert('RGBA')
    comp.alpha_composite(fg)
    v = round(layer * 72 / 108)
    o = (layer - v) // 2
    disc = comp.crop((o, o, o + v, o + v)).resize((px * 4, px * 4), Image.LANCZOS)
    m = Image.new('L', (px * 4, px * 4), 0)
    ImageDraw.Draw(m).ellipse((0, 0, px * 4 - 1, px * 4 - 1), fill=255)
    disc.putalpha(m)
    out(disc.resize((px, px), Image.LANCZOS), RES, f'mipmap-{dpi}', 'ic_launcher_round.png')

# Écran de démarrage Android 12+ : l'icône encadrée entière dans le cercle de 160 dp (sur 240 dp).
canvas = Image.new('RGBA', (960, 960), (0, 0, 0, 0))
s = round(960 * 0.52)
canvas.alpha_composite(framed.resize((s, s), Image.LANCZOS), ((960 - s) // 2, (960 - s) // 2))
out(canvas, RES, 'drawable-nodpi', 'splash_icon.png')

# Couleur du ciel de l'image (fond du démarrage Android et de l'écran de chargement).
sky = splash.crop((560, 0, 1100, 60)).resize((1, 1), Image.BOX).getpixel((0, 0))
print('ciel : #%02x%02x%02x' % sky)
