"""Relie les textures au dossier tex/ et étale la couleur au-delà des îlots UV (pas de coutures sombres)."""
import bpy, os, numpy as np, time
HERE = os.path.dirname(os.path.abspath(bpy.data.filepath))
for im in bpy.data.images:
    if im.name in ("dino_basecolor", "dino_normal", "eyelid"):
        im.filepath = "//tex/" + im.name + ".png"; im.reload()
for im in list(bpy.data.images):
    if im.users == 0 or im.name.startswith("Image_"): bpy.data.images.remove(im)
me = bpy.data.objects["Dino"].data
S = 2048
uv = np.zeros((len(me.loops), 2)); me.uv_layers.active.data.foreach_get("uv", uv.ravel())
cov = np.zeros((S, S), bool); t = time.time()
for p in me.polygons:
    li = list(p.loop_indices)
    for k in range(1, len(li) - 1):
        tri = uv[[li[0], li[k], li[k + 1]]] * S - 0.5
        x0, y0 = np.floor(tri.min(0)).astype(int) - 1; x1, y1 = np.ceil(tri.max(0)).astype(int) + 1
        x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, S - 1), min(y1, S - 1)
        if x1 < x0 or y1 < y0: continue
        X, Y = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
        (ax, ay), (bx, by), (cx, cy) = tri
        d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
        if abs(d) < 1e-12: continue
        l1 = ((by - cy) * (X - cx) + (cx - bx) * (Y - cy)) / d
        l2 = ((cy - ay) * (X - cx) + (ax - cx) * (Y - cy)) / d
        inside = (l1 >= -0.02) & (l2 >= -0.02) & (1 - l1 - l2 >= -0.02)
        cov[y0:y1 + 1, x0:x1 + 1] |= inside
print("COVER", cov.mean().round(3), round(time.time() - t, 1), "s")
# rétrécit d'un pixel : les bords d'îlots contiennent souvent du fond mélangé
inner = cov.copy()
for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
    inner &= np.roll(cov, (dy, dx), (0, 1))
def dilate(name):
    im = bpy.data.images[name]
    px = np.array(im.pixels[:], dtype=np.float32).reshape(S, S, 4)
    known = inner.copy(); col = px.copy(); col[~known] = 0
    for it in range(96):
        acc = np.zeros_like(col); n = np.zeros((S, S), np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
            acc += np.roll(col, (dy, dx), (0, 1)); n += np.roll(known, (dy, dx), (0, 1))
        grow = (~known) & (n > 0)
        if not grow.any(): break
        col[grow] = acc[grow] / n[grow][:, None]; known |= grow
    col[..., 3] = 1
    im.pixels[:] = col.ravel(); im.filepath_raw = os.path.join(HERE, "tex", name + ".png"); im.file_format = 'PNG'; im.save()
    print("DILATED", name, it)
dilate("dino_basecolor"); dilate("dino_normal")
bpy.ops.wm.save_mainfile()
