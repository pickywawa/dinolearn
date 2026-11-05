"""
Construit les 23 objets de la garde-robe en 3D et les exporte en glTF binaire.

    python3 tools/blender/build_items.py            # → public/models/items.glb

Chaque objet est un nœud vide nommé comme dans `src/content/items.ts`, avec
ses pièces en enfants, modélisé directement à sa place sur le dino au repos
(mêmes repères que `build_dino.py` : Z en haut, le dino regarde vers -Y).
Le jeu l'accroche ensuite à l'os de son emplacement (tête, buste, main).
"""
import math
import os
import sys

import bpy  # noqa: I001 (doit précéder bmesh)
import bmesh
from mathutils import Euler, Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from common import OUT_DIR, clear_scene, ellipsoid, export_glb, link, material, mesh_from_bmesh, smooth, tube  # noqa: E402

C = {}


def mat(name, rgb, rough=0.5):
    if name not in C:
        C[name] = material(name, rgb, rough)
    return C[name]


def hexc(h):
    h = h.lstrip('#')
    lin = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        lin.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(lin)


def M(h, rough=0.5, prefix=''):
    return mat(prefix + h.lstrip('#'), hexc(h), rough)


# ------------------------------------------------------------------ formes

def place(obj, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1)):
    obj.matrix_world = Matrix.LocRotScale(Vector(loc), Euler(rot), Vector(scale)) @ obj.matrix_world
    return obj


def cylinder(name, r, depth, m, segs=40, r2=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r if r2 is None else r2, depth=depth)
    o = mesh_from_bmesh(name, bm, m)
    # Arêtes nettes sur les bords des disques.
    o.data.polygons.foreach_set('use_smooth', [len(p.vertices) == 4 for p in o.data.polygons])
    return place(o, loc, rot)


def torus(name, R, r, m, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), arc=1.0, segs=48, tube_segs=14):
    """Tore (éventuellement partiel : `arc` < 1)."""
    pts = []
    n = segs
    for i in range(n + (0 if arc >= 1 else 1)):
        a = i / n * math.tau * arc - (math.tau * arc / 2 if arc < 1 else 0)
        pts.append((R * math.cos(a), R * math.sin(a), 0))
    if arc >= 1:
        pts.append(pts[0])
    o = tube(name, pts, r, m, caps=arc < 1)
    return place(o, loc, rot, scale)


def ball(name, radii, m, loc=(0, 0, 0), rot=(0, 0, 0), segs=24):
    return place(ellipsoid(name, (0, 0, 0), radii, m, segs, segs // 2), loc, rot)


def star(name, r_out, r_in, depth, m, loc=(0, 0, 0), rot=(0, 0, 0), points=5):
    """Étoile bombée (prisme aux bords arrondis)."""
    bm = bmesh.new()
    top, bot = [], []
    for i in range(points * 2):
        a = math.pi / 2 + i * math.pi / points
        r = r_out if i % 2 == 0 else r_in
        top.append(bm.verts.new((r * math.cos(a), depth / 2, r * math.sin(a))))
        bot.append(bm.verts.new((r * math.cos(a), -depth / 2, r * math.sin(a))))
    c_top = bm.verts.new((0, depth / 2 + depth * 0.4, 0))
    c_bot = bm.verts.new((0, -depth / 2 - depth * 0.4, 0))
    n = len(top)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((top[i], top[j], c_top))
        bm.faces.new((bot[j], bot[i], c_bot))
        bm.faces.new((top[j], top[i], bot[i], bot[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = mesh_from_bmesh(name, bm, m)
    o.data.polygons.foreach_set('use_smooth', [False] * len(o.data.polygons))
    return place(o, loc, rot)


def sheet(name, fn, nu, nv, m, thickness=0.02):
    """Surface (u, v) ∈ [0,1]² → point, épaissie (capes, bords de chapeau…)."""
    bm = bmesh.new()
    grid = [[bm.verts.new(fn(u / nu, v / nv)) for u in range(nu + 1)] for v in range(nv + 1)]
    for v in range(nv):
        for u in range(nu):
            bm.faces.new((grid[v][u], grid[v][u + 1], grid[v + 1][u + 1], grid[v + 1][u]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = mesh_from_bmesh(name, bm, m)
    mod = o.modifiers.new('solid', 'SOLIDIFY')
    mod.thickness = thickness
    mod.offset = 0
    bpy.context.view_layer.update()
    from common import evaluated_copy
    out = evaluated_copy(o, name)
    bpy.data.objects.remove(o)
    out.data.materials.clear()
    out.data.materials.append(m)
    return smooth(out)


def group(name, parts):
    # Les pièces prennent le nom de l'objet en préfixe (sinon « balloon » ou
    # « crown » seraient déjà pris par une pièce et le groupe deviendrait « crown.001 »).
    for p in parts:
        p.name = f'{name}_{p.name}'
    root = link(bpy.data.objects.new(name, None))
    assert root.name == name, root.name
    for p in parts:
        mw = p.matrix_world.copy()
        p.parent = root
        p.matrix_world = mw
    return root


# ------------------------------------------------------------------ objets

HEAD_TOP = 1.93     # haut du crâne
EYE_Z = 1.55
EYE_X = 0.22
EYE_FRONT = -0.53   # devant des yeux
NECK_Z = 1.04
HAND = Vector((0.55, -0.17, 0.62))


def hat_base(z=HEAD_TOP - 0.06, tilt=-0.12):
    """Repère commun aux chapeaux : posé sur le crâne, un peu penché en arrière."""
    return dict(loc=(0, 0.02, z), rot=(tilt, 0, 0))


def top_hat():
    b = hat_base()
    black, red = M('#2b2b38', 0.35), M('#e63946')
    parts = [
        cylinder('brim', 0.36, 0.035, black),
        cylinder('crown', 0.23, 0.38, black, r2=0.25, loc=(0, 0, 0.2)),
        cylinder('band', 0.235, 0.08, red, loc=(0, 0, 0.06)),
    ]
    for p in parts:
        place(p, **b)
    return group('top-hat', parts)


def billed_cap():
    blue, white, yellow = M('#3a7bd5', 0.45), M('#ffffff'), M('#ffd23f', 0.35)
    dome = ball('dome', (0.47, 0.47, 0.3), blue, loc=(0, 0.04, HEAD_TOP - 0.2))
    # On garde la moitié haute du dôme.
    bm = bmesh.new()
    bm.from_mesh(dome.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.02], context='VERTS')
    bm.to_mesh(dome.data)
    bm.free()

    def bill(u, v):
        a = math.pi * (0.15 + 0.7 * u)
        r = 0.3 + 0.28 * v
        return (math.cos(a) * r * 1.05, -math.sin(a) * r - 0.05, HEAD_TOP - 0.2 - 0.04 * v)
    parts = [
        dome,
        sheet('bill', bill, 16, 4, blue, 0.03),
        ball('button', (0.05, 0.05, 0.03), white, loc=(0, 0.04, HEAD_TOP + 0.09)),
        star('star', 0.11, 0.05, 0.03, yellow, loc=(0, -0.38, HEAD_TOP - 0.02), rot=(-0.7, 0, 0)),
    ]
    for p in parts:
        place(p, loc=(0, 0, 0.02), rot=(-0.05, 0, 0))
    return group('billed-cap', parts)


def crown():
    gold, red, blue = M('#ffc93c', 0.3), M('#e63946', 0.2), M('#3a86ff', 0.2)
    z = HEAD_TOP - 0.07
    parts = [cylinder('band', 0.27, 0.14, gold, r2=0.29, loc=(0, 0, z))]
    for i in range(5):
        a = i / 5 * math.tau + math.pi / 2
        x, y = 0.28 * math.cos(a), 0.28 * math.sin(a)
        parts.append(cylinder(f'point{i}', 0.07, 0.16, gold, r2=0.0, segs=12, loc=(x, y, z + 0.14)))
        parts.append(ball(f'tip{i}', (0.035, 0.035, 0.035), gold, loc=(x, y, z + 0.23)))
        parts.append(ball(f'gem{i}', (0.04, 0.025, 0.04), red if i % 2 else blue,
                          loc=(0.29 * math.cos(a), 0.29 * math.sin(a), z), rot=(0, 0, a + math.pi / 2)))
    for p in parts:
        place(p, rot=(-0.1, 0, 0.08))
    return group('crown', parts)


def straw_hat():
    straw, pink = M('#efcf7a', 0.75), M('#ff7aa2')
    b = hat_base(HEAD_TOP - 0.1, -0.1)

    def brim(u, v):
        a = u * math.tau
        r = 0.28 + 0.36 * v
        return (math.cos(a) * r, math.sin(a) * r, -0.05 * v * v)
    parts = [
        sheet('brim', brim, 48, 4, straw, 0.025),
        ball('crown', (0.27, 0.27, 0.2), straw, loc=(0, 0, 0.05)),
        cylinder('ribbon', 0.275, 0.07, pink, loc=(0, 0, 0.04)),
        ball('bow', (0.07, 0.04, 0.05), pink, loc=(0.2, -0.2, 0.05)),
    ]
    for p in parts:
        place(p, **b)
    return group('womans-hat', parts)


def graduation_cap():
    black, gold = M('#2b2b38', 0.4), M('#ffc93c', 0.35)
    b = hat_base(HEAD_TOP - 0.05, -0.1)
    board = cylinder('board', 0.48, 0.035, black, segs=4, loc=(0, 0, 0.12), rot=(0, 0, math.pi / 4))
    parts = [
        cylinder('cap', 0.3, 0.16, black, loc=(0, 0, 0.04)),
        board,
        ball('button', (0.04, 0.04, 0.025), gold, loc=(0, 0, 0.145)),
        tube('cord', [(0, 0, 0.145), (0.3, -0.12, 0.14), (0.33, -0.14, -0.05)], 0.012, gold),
        cylinder('tassel', 0.04, 0.12, gold, r2=0.015, loc=(0.33, -0.14, -0.1)),
    ]
    for p in parts:
        place(p, **b)
    return group('graduation-cap', parts)


def fire_helmet():
    red, yellow, dark = M('#e63946', 0.3), M('#ffd23f', 0.35), M('#9b1c26', 0.4)
    dome = ball('dome', (0.46, 0.5, 0.36), red, loc=(0, 0.03, HEAD_TOP - 0.2))
    bm = bmesh.new()
    bm.from_mesh(dome.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.02], context='VERTS')
    bm.to_mesh(dome.data)
    bm.free()

    def brim(u, v):
        a = u * math.tau
        r = 1 + 0.25 * v * (0.5 + 0.5 * math.sin(a))   # plus large derrière
        return (math.cos(a) * 0.46 * r, math.sin(a) * 0.5 * r + 0.03, HEAD_TOP - 0.2 - 0.03 * v)
    parts = [
        dome,
        sheet('brim', brim, 48, 3, dark, 0.03),
        tube('ridge', [(0, -0.45, HEAD_TOP - 0.1), (0, -0.2, HEAD_TOP + 0.13), (0, 0.2, HEAD_TOP + 0.13),
                       (0, 0.48, HEAD_TOP - 0.1)], 0.035, dark),
        cylinder('badge', 0.11, 0.03, yellow, segs=6, loc=(0, -0.44, HEAD_TOP - 0.06), rot=(math.pi / 2 - 0.35, 0, 0)),
    ]
    for p in parts:
        place(p, rot=(-0.06, 0, 0))
    return group('rescue-workers-helmet', parts)


def headphones():
    band, cup, pad = M('#ff6b6b', 0.35), M('#3d405b', 0.35), M('#f4f1de', 0.6)
    cz = 1.5
    pts = [(0.62 * math.cos(a), 0.0, cz + 0.55 * math.sin(a)) for a in [math.pi * i / 24 for i in range(25)]]
    parts = [tube('band', pts, 0.045, band)]
    for s in (1, -1):
        parts.append(cylinder(f'cup{s}', 0.16, 0.1, cup, loc=(0.62 * s, 0, cz), rot=(0, math.pi / 2, 0)))
        parts.append(cylinder(f'pad{s}', 0.13, 0.04, pad, loc=(0.56 * s, 0, cz), rot=(0, math.pi / 2, 0)))
        parts.append(ball(f'dot{s}', (0.03, 0.06, 0.06), band, loc=(0.675 * s, 0, cz)))
    return group('headphone', parts)


def hibiscus():
    petal, center, pollen = M('#ff4d6d', 0.45), M('#ffd23f', 0.4), M('#ff9f1c', 0.4)
    parts = []
    for i in range(5):
        a = i / 5 * math.tau
        parts.append(ball(f'petal{i}', (0.1, 0.03, 0.065), petal,
                          loc=(0.08 * math.cos(a), 0, 0.08 * math.sin(a)), rot=(0, -a, 0)))
    parts.append(ball('heart', (0.04, 0.03, 0.04), center, loc=(0, -0.02, 0)))
    parts.append(tube('pistil', [(0, -0.02, 0), (0.02, -0.12, 0.05)], 0.012, center))
    parts.append(ball('pollen', (0.022, 0.022, 0.022), pollen, loc=(0.02, -0.13, 0.055)))
    root = group('hibiscus', parts)
    root.matrix_world = Matrix.LocRotScale(Vector((0.42, -0.08, 1.82)), Euler((0.3, 0.2, 0.9)), Vector((1, 1, 1)))
    return root


def frames(name, frame_m, lens_m=None, r=0.16, thick=0.026, oval=1.0):
    parts = []
    for s in (1, -1):
        cx = EYE_X * s
        parts.append(torus(f'rim{s}', r, thick, frame_m, loc=(cx, EYE_FRONT - 0.03, EYE_Z),
                           rot=(math.pi / 2, 0, 0), scale=(1, oval, 1)))
        if lens_m:
            parts.append(cylinder(f'lens{s}', r, 0.012, lens_m, loc=(cx, EYE_FRONT - 0.03, EYE_Z),
                                  rot=(math.pi / 2, 0, 0)))
            parts[-1].scale = (1, 1, 1)
        # Branche jusqu'au côté de la tête.
        parts.append(tube(f'arm{s}', [(cx + r * s, EYE_FRONT - 0.03, EYE_Z + 0.02),
                                       (0.5 * s, -0.25, EYE_Z + 0.03), (0.55 * s, 0.05, EYE_Z)], thick * 0.7, frame_m))
    parts.append(tube('bridge', [(EYE_X - r, EYE_FRONT - 0.03, EYE_Z + 0.03), (0, EYE_FRONT - 0.07, EYE_Z + 0.05),
                                 (-EYE_X + r, EYE_FRONT - 0.03, EYE_Z + 0.03)], thick * 0.8, frame_m))
    return group(name, parts)


def glasses():
    return frames('glasses', M('#8a5a36', 0.35), r=0.17)


def sunglasses():
    lens = M('#1d1d2c', 0.15, prefix='noline_')
    return frames('sunglasses', M('#2b2b38', 0.3), lens, r=0.17)


def goggles():
    frame, lens, strap = M('#ff9f1c', 0.35), M('#7fd1ff', 0.1, prefix='noline_'), M('#3d405b', 0.5)
    g = frames('goggles_tmp', frame, lens, r=0.18, thick=0.04)
    parts = list(g.children)
    for p in parts:
        mw = p.matrix_world.copy()
        p.parent = None
        p.matrix_world = mw
    bpy.data.objects.remove(g)
    # Sangle autour de la tête (à la place des branches).
    keep = []
    for p in parts:
        if p.name.startswith('goggles_tmp_arm'):
            bpy.data.objects.remove(p)
        else:
            keep.append(p)
    parts = keep
    parts.append(torus('strap', 0.55, 0.035, strap, loc=(0, 0.02, EYE_Z), scale=(1.03, 1.0, 1)))
    return group('goggles', parts)


def bow_tie():
    red, dark = M('#e63946', 0.4), M('#9b1c26', 0.4)
    y, z = -0.34, NECK_Z - 0.03
    parts = [ball('knot', (0.05, 0.04, 0.05), dark, loc=(0, y - 0.02, z))]
    for s in (1, -1):
        parts.append(cylinder(f'wing{s}', 0.09, 0.15, red, r2=0.02, segs=24,
                              loc=(0.08 * s, y, z), rot=(0, -s * math.pi / 2, 0)))
    for p in parts[1:]:
        p.scale = (1, 1, 1)
    return group('ribbon', parts)


def scarf():
    blue, stripe = M('#3a86ff', 0.6), M('#ffffff', 0.6)
    z = NECK_Z
    parts = [
        torus('loop', 0.36, 0.085, blue, loc=(0, 0.02, z), scale=(1.0, 0.92, 1)),
        torus('stripe', 0.36, 0.088, stripe, loc=(0, 0.02, z), scale=(1.0, 0.92, 1), arc=0.04),
        tube('tail', [(0.18, -0.3, z), (0.24, -0.36, z - 0.15), (0.26, -0.34, z - 0.32)], 0.07, blue),
    ]
    return group('scarf', parts)


def medal():
    ribbon, gold, red = M('#3a86ff', 0.5), M('#ffc93c', 0.25), M('#e63946', 0.4)
    z = NECK_Z
    parts = [
        tube('ribbonL', [(0.2, -0.22, z + 0.02), (0.1, -0.36, z - 0.14), (0.02, -0.4, z - 0.22)], 0.03, ribbon),
        tube('ribbonR', [(-0.2, -0.22, z + 0.02), (-0.1, -0.36, z - 0.14), (-0.02, -0.4, z - 0.22)], 0.03, red),
        cylinder('disc', 0.1, 0.03, gold, loc=(0, -0.42, z - 0.3), rot=(math.pi / 2 - 0.2, 0, 0)),
        star('star', 0.06, 0.028, 0.02, M('#ffe08a', 0.3), loc=(0, -0.44, z - 0.3), rot=(-0.2, 0, 0)),
    ]
    return group('sports-medal', parts)


def necklace():
    colors = ['#ff6b6b', '#ffd23f', '#4ecdc4', '#a06cd5', '#ff9f1c']
    parts = []
    n = 18
    for i in range(n):
        a = i / n * math.tau
        x, y = 0.36 * math.cos(a), 0.32 * math.sin(a)
        dz = -0.08 * max(0, -math.sin(a))   # descend un peu devant
        parts.append(ball(f'bead{i}', (0.045, 0.045, 0.045), M(colors[i % len(colors)], 0.25),
                          loc=(x, y + 0.02, NECK_Z - 0.03 + dz)))
    return group('prayer-beads', parts)


def cape(name, color, deco=None):
    m = M(color, 0.55)

    def fn(u, v):
        a = math.pi * (0.1 + 0.8 * u)          # de l'épaule droite à la gauche, par derrière
        r = 0.34 + 0.22 * v
        z = NECK_Z - 0.02 - 0.82 * v
        wave = 0.03 * math.sin(u * math.tau * 3) * v
        return (math.cos(a) * r * 1.05, math.sin(a) * r + 0.12 + 0.08 * v + wave, z)
    parts = [sheet('cloth', fn, 24, 10, m, 0.025),
             torus('collar', 0.33, 0.04, m, loc=(0, 0.04, NECK_Z), scale=(1, 0.9, 1))]
    if deco:
        for i, (u, v) in enumerate([(0.3, 0.45), (0.55, 0.7), (0.7, 0.35), (0.42, 0.85)]):
            p = Vector(fn(u, v))
            n = Vector((p.x, p.y - 0.12, 0)).normalized()
            parts.append(star(f'star{i}', 0.06, 0.028, 0.03, M(deco, 0.35),
                              loc=p + n * 0.025, rot=(0, 0, math.atan2(n.y, n.x) - math.pi / 2)))
    return group(name, parts)


def wings():
    white, tip = M('#ffffff', 0.5), M('#cfe8ff', 0.5)
    parts = []
    for s in (1, -1):
        for i, (dx, dz, ln) in enumerate([(0.0, 0.0, 0.32), (0.04, -0.1, 0.27), (0.06, -0.19, 0.2)]):
            parts.append(ball(f'feather{s}{i}', (ln, 0.035, 0.085), white if i < 2 else tip,
                              loc=(s * (0.33 + dx + ln * 0.6), 0.5, 0.95 + dz), rot=(0, s * (0.5 + i * 0.25), 0)))
    root = group('wing', parts)
    return root


def balloon():
    red, string = M('#ff4d6d', 0.2), M('#f4f1de', 0.6)
    top = Vector((0.82, -0.12, 1.55))
    parts = [
        ball('balloon', (0.22, 0.2, 0.26), red, loc=top),
        cylinder('knot', 0.03, 0.05, red, r2=0.0, loc=top + Vector((0, 0, -0.27)), rot=(math.pi, 0, 0)),
        tube('string', [HAND + Vector((0.02, -0.02, 0.05)), Vector((0.7, -0.15, 1.0)), top + Vector((0, 0, -0.3))],
             0.008, string),
    ]
    return group('balloon', parts)


def wand():
    stick, gold = M('#3d405b', 0.4), M('#ffd23f', 0.25)
    base = HAND + Vector((0.0, -0.06, -0.08))
    tip = HAND + Vector((0.22, -0.12, 0.48))
    parts = [
        tube('stick', [base, tip], 0.02, stick),
        star('star', 0.11, 0.05, 0.045, gold, loc=tip + Vector((0.04, -0.02, 0.08)), rot=(0, 0, -0.4)),
    ]
    return group('magic-wand', parts)


def lollipop():
    stick, pink, white = M('#ffffff', 0.4), M('#ff5d8f', 0.2), M('#ffffff', 0.25)
    base = HAND + Vector((0.0, -0.06, -0.06))
    top = HAND + Vector((0.12, -0.1, 0.4))
    parts = [
        tube('stick', [base, top], 0.018, stick),
        cylinder('candy', 0.15, 0.06, pink, loc=top + Vector((0, 0, 0.12)), rot=(math.pi / 2, 0, 0.3)),
    ]
    pts = [(top.x + 0.012 * a * math.cos(a), top.y - 0.035, top.z + 0.12 + 0.012 * a * math.sin(a))
           for a in [i * 0.35 for i in range(36)]]
    parts.append(tube('swirl', pts, 0.012, white))
    return group('lollipop', parts)


def sunflower():
    stem, petal, heart = M('#4caf50', 0.6), M('#ffcc00', 0.45), M('#7a4a2a', 0.7)
    base = HAND + Vector((0.0, -0.05, -0.1))
    top = HAND + Vector((0.12, -0.12, 0.55))
    parts = [tube('stem', [base, HAND + Vector((0.06, -0.08, 0.25)), top], 0.025, stem),
             ball('leaf', (0.1, 0.02, 0.045), stem, loc=HAND + Vector((0.13, -0.08, 0.22)), rot=(0, -0.6, 0))]
    face = top + Vector((0, -0.03, 0.04))
    for i in range(12):
        a = i / 12 * math.tau
        parts.append(ball(f'petal{i}', (0.075, 0.02, 0.03), petal,
                          loc=face + Vector((0.12 * math.cos(a), 0.01, 0.12 * math.sin(a))), rot=(0, -a, 0)))
    parts.append(ball('heart', (0.085, 0.04, 0.085), heart, loc=face + Vector((0, -0.02, 0))))
    return group('sunflower', parts)


def teddy():
    fur, light, dark = M('#b5835a', 0.8), M('#f0d5b0', 0.8), M('#2b2b38', 0.3)
    c = HAND + Vector((0.1, -0.16, -0.02))
    parts = [
        ball('body', (0.13, 0.11, 0.15), fur, loc=c),
        ball('belly', (0.08, 0.04, 0.09), light, loc=c + Vector((0, -0.09, -0.01))),
        ball('head', (0.12, 0.11, 0.11), fur, loc=c + Vector((0, -0.01, 0.2))),
        ball('muzzle', (0.05, 0.035, 0.04), light, loc=c + Vector((0, -0.11, 0.18))),
        ball('nose', (0.018, 0.012, 0.014), dark, loc=c + Vector((0, -0.145, 0.195))),
    ]
    for s in (1, -1):
        parts.append(ball(f'ear{s}', (0.045, 0.03, 0.045), fur, loc=c + Vector((0.09 * s, 0, 0.3))))
        parts.append(ball(f'eye{s}', (0.016, 0.01, 0.018), dark, loc=c + Vector((0.045 * s, -0.1, 0.24))))
        parts.append(ball(f'arm{s}', (0.04, 0.04, 0.08), fur, loc=c + Vector((0.13 * s, -0.04, 0.03)), rot=(0, 0.5 * s, 0)))
        parts.append(ball(f'leg{s}', (0.05, 0.06, 0.045), fur, loc=c + Vector((0.07 * s, -0.06, -0.14))))
    return group('teddy-bear', parts)


BUILDERS = [
    top_hat, billed_cap, crown, straw_hat, graduation_cap, fire_helmet, headphones, hibiscus,
    glasses, sunglasses, goggles,
    bow_tie, scarf, medal, necklace,
    lambda: cape('cape-red', '#e63946'), lambda: cape('cape-blue', '#4361ee', '#ffd23f'), wings,
    balloon, wand, lollipop, sunflower, teddy,
]


def main():
    clear_scene()
    C.clear()
    for build in BUILDERS:
        build()
    export_glb(os.path.join(OUT_DIR, 'items.glb'))


if __name__ == '__main__':
    main()
