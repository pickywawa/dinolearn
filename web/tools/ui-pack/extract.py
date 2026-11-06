"""Découpe le pack d'icônes (icon-pack.webp) en images à fond transparent : public/ui/<nom>.png."""
import bpy, numpy as np, os, collections
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "../../public/ui"); os.makedirs(OUT, exist_ok=True)
im = bpy.data.images.load(os.path.join(HERE, "icon-pack.webp")); W, H = im.size
PX = np.array(im.pixels[:], dtype=np.float32).reshape(H, W, 4)[::-1].copy()
# (nom, x0, y0, x1, y1, mode) — coordonnées de l'image 1536 × 1024, haut à gauche.
# Le pack a un fond transparent : on garde sa transparence, on enlève seulement les libellés.
ICONS = [
 ("home", 30, 30, 176, 160, "s"), ("back", 206, 50, 322, 148, "s"), ("play", 358, 48, 506, 158, "s"),
 ("pause", 536, 44, 656, 158, "s"), ("sound-on", 690, 40, 814, 162, "s"), ("sound-off", 848, 40, 974, 162, "s"),
 ("fullscreen", 1016, 44, 1130, 152, "s"), ("info", 1164, 40, 1268, 146, "s"), ("help", 1288, 42, 1390, 146, "s"),
 ("close", 1414, 46, 1514, 144, "s"),
 ("missions", 34, 256, 176, 394, "s"), ("wardrobe", 194, 236, 332, 388, "s"), ("progress", 356, 268, 474, 380, "s"),
 ("settings", 510, 264, 640, 390, "s"), ("parents", 666, 268, 794, 374, "s"), ("profile", 820, 270, 928, 378, "s"),
 ("trophy", 952, 266, 1076, 380, "s"), ("medal", 1108, 264, 1210, 384, "s"), ("chest", 1242, 272, 1368, 380, "s"),
 ("envelope", 1388, 272, 1516, 382, "s"),
 ("star-empty", 32, 488, 128, 580, "s"), ("star", 170, 488, 266, 580, "s"), ("star-shine", 296, 466, 446, 582, "s"),
 ("star-special", 478, 476, 582, 580, "s"), ("stars-3", 622, 482, 784, 576, "s"),
 ("cat-animals", 22, 676, 190, 830, "s"), ("cat-space", 194, 676, 360, 830, "s"), ("cat-nature", 366, 676, 532, 830, "s"),
 ("cat-daily", 536, 676, 708, 830, "s"), ("cat-maths", 712, 676, 864, 830, "s"), ("cat-reading", 870, 676, 1032, 830, "s"),
 ("cat-world", 1036, 676, 1196, 830, "s"), ("cat-creative", 1200, 676, 1358, 830, "s"), ("cat-logic", 1362, 676, 1522, 830, "s"),
 ("btn-validate", 24, 892, 256, 976, "s"), ("btn-retry", 270, 892, 520, 976, "s"), ("btn-continue", 534, 894, 766, 974, "s"),
 ("arrow-left", 770, 882, 872, 980, "c"), ("arrow-right", 876, 884, 970, 978, "c"), ("refresh", 986, 884, 1082, 980, "c"),
 ("lock", 1116, 870, 1198, 966, "s"), ("unlock", 1258, 870, 1346, 966, "s"), ("list", 1398, 856, 1502, 968, "s"),
]
def flood_outside(mask):
    h, w = mask.shape; out = np.zeros_like(mask); q = collections.deque()
    for y in range(h):
        for x in (0, w - 1):
            if not mask[y, x] and not out[y, x]: out[y, x] = True; q.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if not mask[y, x] and not out[y, x]: out[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < h and 0 <= nx < w and not mask[ny, nx] and not out[ny, nx]:
                out[ny, nx] = True; q.append((ny, nx))
    return out
def components(mask):
    h, w = mask.shape; lab = np.zeros((h, w), np.int32); n = 0; info = []
    for y, x in zip(*np.nonzero(mask)):
        if lab[y, x]: continue
        n += 1; q = collections.deque([(y, x)]); lab[y, x] = n; pts = []
        while q:
            cy, cx = q.popleft(); pts.append((cy, cx))
            for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = n; q.append((ny, nx))
        a = np.array(pts); info.append((n, len(pts), a[:, 0].min(), a[:, 1].min(), a[:, 0].max(), a[:, 1].max()))
    return lab, info
def dilate(m, r):
    p = np.pad(m, r); out = p.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dy * dy + dx * dx <= r * r: out |= np.roll(np.roll(p, dy, 0), dx, 1)
    return out[r:-r, r:-r]
def save(name, rgba):
    h, w = rgba.shape[:2]
    img = bpy.data.images.new(name, w, h, alpha=True)
    img.pixels[:] = rgba[::-1].ravel(); img.filepath_raw = os.path.join(OUT, name + ".png"); img.file_format = 'PNG'; img.save()
for name, x0, y0, x1, y1, mode in ICONS:
    P = 8
    c = PX[y0 - P:y1 + P, x0 - P:x1 + P].copy(); rgb = c[..., :3]
    h, w = rgb.shape[:2]
    A = c[..., 3]
    # l'icône (pièces opaques) : la plus grande pièce + les petites pièces proches (rayons…), pas le libellé dessous
    lab, info = components(A > 0.05)
    info.sort(key=lambda t: -t[1]); keep = np.zeros(A.shape, bool)
    if info:
        _, _, ty, tx, by, bx = info[0]
        for n, cnt, a0, b0, a1, b1 in info:
            if n == info[0][0] or (cnt >= 6 and a0 >= ty - 30 and a1 <= by + 6 and b0 >= tx - 30 and b1 <= bx + 30):
                keep |= lab == n
    alpha = np.where(keep, A, 0).astype(np.float32)
    # recadre au contenu
    ys, xs = np.nonzero(alpha > 0.02)
    c = c[ys.min():ys.max() + 1, xs.min():xs.max() + 1]; alpha = alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    c[..., 3] = alpha
    save(name, c)
    print("ICON", name, c.shape[1], c.shape[0])
