"""
Construit le dino 3D (style « jouet chibi ») et l'exporte en glTF binaire.

    python3 tools/blender/build_dino.py            # → public/models/dino.glb

Tout est fait par script avec Blender en module Python (`pip install bpy`) :
formes lisses en métaballes, squelette, poids calculés à la main, yeux et
bouches projetés sur la tête. Le dino regarde vers -Y (Blender, Z en haut) ;
l'export glTF le tourne vers +Z (Three.js, Y en haut).

Les couleurs ne sont que des repères : le jeu remplace chaque matériau par
nom (`skin`, `belly`, `spike`…) avec la couleur du dino de l'enfant.
"""
import math
import os
import sys

import bpy  # noqa: I001 (doit précéder bmesh)
import bmesh
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from common import (  # noqa: E402
    OUT_DIR, clear_scene, ellipsoid, export_glb, material, metaball_mesh, orient_to, tube,
)

# ---------------------------------------------------------------- matériaux

M = {}


def make_materials():
    M.update({
        'skin': material('skin', (0.48, 0.83, 0.35)),
        'belly': material('belly', (1.0, 0.95, 0.74)),
        'spike': material('spike', (1.0, 0.62, 0.26)),
        'cheek': material('cheek', (1.0, 0.56, 0.64)),
        'eyeWhite': material('eyeWhite', (1, 1, 1)),
        'iris': material('iris', (0.36, 0.22, 0.12)),
        'pupil': material('pupil', (0.05, 0.04, 0.06)),
        'shine': material('shine', (1, 1, 1)),
        'line': material('line', (0.12, 0.09, 0.12)),
        'mouth': material('mouth', (0.42, 0.12, 0.2)),
        'tongue': material('tongue', (1.0, 0.47, 0.56)),
        'tooth': material('tooth', (1, 1, 1)),
    })

# --------------------------------------------------------------- squelette

BONES = {
    # nom: (tête, queue, parent)
    'root': ((0, 0, 0), (0, 0, 0.25), None),
    'hips': ((0, 0.02, 0.32), (0, 0.02, 0.62), 'root'),
    'chest': ((0, 0.02, 0.62), (0, 0.02, 0.98), 'hips'),
    'head': ((0, 0, 0.98), (0, 0, 1.6), 'chest'),
    'arm.L': ((0.36, -0.06, 0.86), (0.6, -0.16, 0.6), 'chest'),
    'arm.R': ((-0.36, -0.06, 0.86), (-0.6, -0.16, 0.6), 'chest'),
    'leg.L': ((0.22, 0.0, 0.34), (0.24, -0.06, 0.04), 'hips'),
    'leg.R': ((-0.22, 0.0, 0.34), (-0.24, -0.06, 0.04), 'hips'),
    'eye.L': ((0.2, -0.3, 1.5), (0.2, -0.5, 1.5), 'head'),
    'eye.R': ((-0.2, -0.3, 1.5), (-0.2, -0.5, 1.5), 'head'),
    'tail.1': ((0, 0.34, 0.38), (0.06, 0.62, 0.3), 'hips'),
    'tail.2': ((0.06, 0.62, 0.3), (0.2, 0.86, 0.32), 'tail.1'),
    'tail.3': ((0.2, 0.86, 0.32), (0.4, 1.0, 0.44), 'tail.2'),
}

# Points du dos où poussent les piquants (milieu du dos, de la tête à la queue).
SPIKE_PATH = [
    # (x, y, z) approximatif, taille
    ((0, -0.18, 1.96), 0.17),
    ((0, 0.08, 2.0), 0.21),
    ((0, 0.32, 1.9), 0.21),
    ((0, 0.48, 1.68), 0.18),
    ((0, 0.5, 1.42), 0.14),
    ((0, 0.42, 0.95), 0.13),
    ((0, 0.44, 0.7), 0.13),
    ((0.02, 0.58, 0.5), 0.12),
    ((0.1, 0.78, 0.45), 0.1),
    ((0.25, 0.93, 0.48), 0.08),
]


def build_armature():
    arm_data = bpy.data.armatures.new('rig')
    arm = bpy.data.objects.new('rig', arm_data)
    bpy.context.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    for name, (head, tail, parent) in BONES.items():
        b = arm_data.edit_bones.new(name)
        b.head, b.tail = Vector(head), Vector(tail)
        b.roll = 0
        if parent:
            b.parent = arm_data.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    return arm


def bind(obj, arm, weights):
    """Lie un maillage au squelette. `weights(co) -> {os: poids}` pour chaque sommet."""
    groups = {}
    for v in obj.data.vertices:
        for bone, w in weights(obj.matrix_world @ v.co).items():
            if w <= 0:
                continue
            if bone not in groups:
                groups[bone] = obj.vertex_groups.new(name=bone)
            groups[bone].add([v.index], w, 'REPLACE')
    mod = obj.modifiers.new('rig', 'ARMATURE')
    mod.object = arm
    obj.parent = arm


def rigid(bone):
    return lambda co: {bone: 1.0}


def seg_dist(p, a, b):
    a, b = Vector(a), Vector(b)
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length


def smooth_weights(bones, power=6):
    """Poids doux selon la distance aux os (les 2 plus proches)."""
    def fn(co):
        ds = [(seg_dist(co, BONES[b][0], BONES[b][1]), b) for b in bones]
        ds.sort()
        best = ds[:2]
        ws = [(1.0 / (d + 0.02) ** power, b) for d, b in best]
        total = sum(w for w, _ in ws)
        return {b: w / total for w, b in ws}
    return fn


# ------------------------------------------------------------ morceaux

def build_head():
    elems = [
        # (centre, rayon visible, (sx, sy, sz))
        ((0, 0.02, 1.5), 0.5, (1.12, 0.95, 0.92)),       # crâne
        ((0, -0.28, 1.3), 0.36, (1.15, 0.92, 0.72)),     # museau
        ((0.25, -0.2, 1.3), 0.22, (1, 1, 1)),            # joue G
        ((-0.25, -0.2, 1.3), 0.22, (1, 1, 1)),           # joue D
        ((0, 0.0, 1.08), 0.28, (1.1, 1, 0.7)),           # menton / cou
    ]
    head = metaball_mesh('skin.head', elems, resolution=0.03, max_faces=4500)
    head.data.materials.append(M['skin'])
    return head


def build_body():
    elems = [
        ((0, 0.03, 0.6), 0.42, (1.0, 0.92, 1.05)),       # ventre rond
        ((0, 0.05, 0.42), 0.4, (1.08, 0.95, 0.75)),      # bas du corps, en poire
        ((0, 0.02, 0.92), 0.26, (1.0, 0.9, 0.8)),        # haut, vers le cou
        ((0, 0.4, 0.36), 0.24, (1, 1, 1)),               # départ de la queue
        ((0.02, 0.52, 0.32), 0.21, (1, 1, 1)),
        ((0.05, 0.63, 0.3), 0.18, (1, 1, 1)),
        ((0.1, 0.73, 0.3), 0.155, (1, 1, 1)),
        ((0.17, 0.82, 0.31), 0.13, (1, 1, 1)),
        ((0.25, 0.9, 0.35), 0.105, (1, 1, 1)),
        ((0.33, 0.96, 0.4), 0.085, (1, 1, 1)),
        ((0.4, 1.0, 0.46), 0.065, (1, 1, 1)),
    ]
    body = metaball_mesh('skin.body', elems, resolution=0.03, max_faces=4000)
    body.data.materials.append(M['skin'])
    return body


def build_belly(body):
    """Ventre clair : une plaque plaquée sur le devant du corps."""
    return face_shape('belly', bvh_of([body]), ellipse(0, 0.55, 0.29, 0.34), M['belly'], rings=10, offset=0.006)


def build_arm(side):
    s = 1 if side == 'L' else -1
    elems = [
        ((0.38 * s, -0.06, 0.84), 0.11, (1, 1, 1)),
        ((0.48 * s, -0.12, 0.72), 0.1, (1, 1, 1)),
        ((0.54 * s, -0.17, 0.62), 0.115, (1, 1, 1.05)),  # main
    ]
    arm = metaball_mesh(f'skin.arm.{side}', elems, resolution=0.02, max_faces=1200)
    arm.data.materials.append(M['skin'])
    return arm


def build_leg(side):
    s = 1 if side == 'L' else -1
    elems = [
        ((0.22 * s, 0.02, 0.24), 0.17, (1, 1, 1)),
        ((0.24 * s, -0.08, 0.09), 0.15, (1.0, 1.4, 0.62)),  # pied
    ]
    leg = metaball_mesh(f'skin.leg.{side}', elems, resolution=0.02, max_faces=1200)
    leg.data.materials.append(M['skin'])
    return leg


def bvh_of(objs):
    deps = bpy.context.evaluated_depsgraph_get()
    bm = bmesh.new()
    for o in objs:
        m = o.evaluated_get(deps).to_mesh()
        tmp = bmesh.new()
        tmp.from_mesh(m)
        tmp.transform(o.matrix_world)
        mt = bpy.data.meshes.new('tmp')
        tmp.to_mesh(mt)
        bm.from_mesh(mt)
        bpy.data.meshes.remove(mt)
        tmp.free()
        o.evaluated_get(deps).to_mesh_clear()
    tree = BVHTree.FromBMesh(bm)
    bm.free()
    return tree


def project_front(tree, x, z, offset=0.0, direction=Vector((0, 1, 0))):
    """Point de la surface vu de face (rayon tiré depuis l'avant vers l'arrière)."""
    origin = Vector((x, -3, z)) if direction.y > 0 else Vector((x, 3, z))
    loc, normal, _, _ = tree.ray_cast(origin, direction)
    if loc is None:
        return None, None
    return loc + normal * offset, normal


def project_toward(tree, target, origin_dist=2.0, offset=0.0, center=Vector((0, 0, 1.3))):
    """Point de surface sur la droite centre → cible (pour le dos, les joues…)."""
    d = (Vector(target) - center).normalized()
    loc, normal, _, _ = tree.ray_cast(center + d * origin_dist, -d)
    if loc is None:
        return None, None
    return loc + normal * offset, normal


def build_spikes(tree, bones_for):
    """Piquants coniques arrondis, plantés perpendiculairement au dos."""
    out = []
    for i, (p, size) in enumerate(SPIKE_PATH):
        # Rayon tiré depuis l'intérieur de la partie concernée (tête, corps ou queue).
        if p[2] > 1.1:
            center = Vector((0, 0.02, 1.45))
        elif p[1] < 0.55:
            center = Vector((0, 0.03, 0.6))
        else:
            center = Vector((p[0] * 0.6, p[1] - 0.1, p[2] - 0.15))
        loc, normal = project_toward(tree, p, center=center, offset=-size * 0.25)
        if loc is None:
            continue
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=size * 0.68, radius2=size * 0.2,
                              depth=size * 1.5)
        bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, size * 0.75))
        # Bout arrondi : on aplatit légèrement en cône « bonbon ».
        for v in bm.verts:
            v.co.x *= 0.7
        # Les piquants de la tête se cachent sous les chapeaux.
        name = f'spike.head{i}' if p[2] > 1.1 else f'spike{i}'
        me = bpy.data.meshes.new(name)
        bm.to_mesh(me)
        bm.free()
        obj = bpy.data.objects.new(name, me)
        bpy.context.collection.objects.link(obj)
        # Les piquants penchent un peu vers l'arrière.
        up = (normal + Vector((0, 0.35, -0.15))).normalized()
        obj.matrix_world = orient_to(loc, up, Vector((1, 0, 0)))
        obj.data.materials.append(M['spike'])
        for poly in obj.data.polygons:
            poly.use_smooth = True
        out.append((obj, bones_for(Vector(p))))
    return out


def face_shape(name, tree, outline, mat, rings=6, offset=0.012, scale=1.0):
    """
    Forme pleine (bouche, œil fermé…) dessinée en 2D (x, z) puis plaquée sur la
    tête vue de face. `outline(t)` donne le bord pour t de 0 à 1.
    """
    n = 48
    pts = [outline(i / n) for i in range(n)]
    cx = sum(p[0] for p in pts) / n
    cz = sum(p[1] for p in pts) / n
    bm = bmesh.new()
    center_v = None
    ring_verts = []
    for r in range(rings + 1):
        f = r / rings
        row = []
        for (x, z) in pts:
            px, pz = cx + (x - cx) * f, cz + (z - cz) * f
            loc, _ = project_front(tree, px, pz, offset)
            if loc is None:
                loc = Vector((px, -0.5, pz))
            row.append(bm.verts.new(loc))
            if r == 0:
                break
        ring_verts.append(row)
    center_v = ring_verts[0][0]
    first = ring_verts[1]
    for i in range(n):
        bm.faces.new((center_v, first[i], first[(i + 1) % n]))
    for r in range(1, rings):
        a, b = ring_verts[r], ring_verts[r + 1]
        for i in range(n):
            j = (i + 1) % n
            bm.faces.new((a[i], b[i], b[j], a[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    # Les normales doivent regarder vers l'avant (-Y).
    if sum(f.normal.y for f in bm.faces) > 0:
        bmesh.ops.reverse_faces(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def face_line(name, tree, pts2d, radius, mat, offset=0.0):
    pts = []
    for (x, z) in pts2d:
        loc, normal = project_front(tree, x, z, offset)
        if loc is not None:
            pts.append(loc)
    return tube(name, pts, radius, mat)


def ellipse(cx, cz, rx, rz, squash_top=0.0):
    def fn(t):
        a = t * math.tau
        z = math.sin(a) * rz
        if z > 0:
            z *= (1 - squash_top)
        return (cx + math.cos(a) * rx, cz + z)
    return fn


def d_shape(cx, top, w, depth, curve=0.05):
    """Bouche en « D » couché : haut légèrement en sourire, bas bien rond."""
    def fn(t):
        a = t * math.tau
        x = math.cos(a) * w
        if math.sin(a) >= 0:   # bord du haut (petite courbe de sourire)
            z = top - curve * (1 - (x / w) ** 2)
        else:                  # bord du bas (arrondi)
            z = top - curve * (1 - (x / w) ** 2) + math.sin(a) * depth
        return (cx + x, z)
    return fn


def build_face(head):
    tree = bvh_of([head])
    parts = []  # (objet, os)

    # ---- yeux : grands, brillants, posés sur le haut du museau
    for side, s in (('L', 1), ('R', -1)):
        ex, ez = 0.22 * s, 1.55
        loc, normal = project_front(tree, ex, ez, -0.035)
        rot = orient_to(loc, normal, Vector((1, 0, 0)))
        white = ellipsoid(f'eye.{side}.white', (0, 0, 0), (0.165, 0.2, 0.08), M['eyeWhite'], 32, 16)
        white.matrix_world = rot
        iris = ellipsoid(f'eye.{side}.iris', (0, 0, 0), (0.13, 0.158, 0.04), M['iris'], 32, 16)
        pupil = ellipsoid(f'eye.{side}.pupil', (0, 0, 0), (0.072, 0.09, 0.03), M['pupil'], 24, 12)
        shine1 = ellipsoid(f'eye.{side}.shine1', (0, 0, 0), (0.048, 0.058, 0.02), M['shine'], 16, 8)
        shine2 = ellipsoid(f'eye.{side}.shine2', (0, 0, 0), (0.022, 0.022, 0.012), M['shine'], 12, 6)
        # Profondeurs : blanc (devant à 0,08) < iris < pupille < reflets.
        for o, (dx, dy, dz) in ((iris, (0, -0.008, 0.052)), (pupil, (0, -0.01, 0.07)),
                                (shine1, (-0.045, 0.05, 0.092)),
                                (shine2, (0.048, -0.052, 0.09))):
            o.matrix_world = rot @ Matrix.Translation((dx, dy, dz))
        # Le regard : iris, pupille et reflets suivent l'os de l'œil.
        parts += [(white, 'head'), (iris, f'eye.{side}'), (pupil, f'eye.{side}'),
                  (shine1, f'eye.{side}'), (shine2, f'eye.{side}')]

        # Œil fermé (arc vers le bas) et œil joyeux (arc vers le haut « ^ »).
        closed = [(ex + 0.15 * math.cos(a), ez - 0.03 - 0.06 * math.sin(a))
                  for a in [math.pi * i / 12 for i in range(13)]]
        happy = [(ex + 0.13 * math.cos(a), ez - 0.06 + 0.09 * math.sin(a))
                 for a in [math.pi * i / 12 for i in range(13)]]
        parts.append((face_line(f'eye.{side}.closed', tree, closed, 0.018, M['line'], 0.012), 'head'))
        parts.append((face_line(f'eye.{side}.happy', tree, happy, 0.018, M['line'], 0.012), 'head'))

        # Joue rose.
        cl, cn = project_front(tree, 0.38 * s, 1.27, -0.012)
        cheek = ellipsoid(f'cheek.{side}', (0, 0, 0), (0.085, 0.06, 0.02), M['cheek'], 24, 12)
        cheek.matrix_world = orient_to(cl, cn, Vector((1, 0, 0)))
        parts.append((cheek, 'head'))

        # Narine.
        nl, nn = project_front(tree, 0.07 * s, 1.36, -0.006)
        nostril = ellipsoid(f'nostril.{side}', (0, 0, 0), (0.022, 0.014, 0.012), M['line'], 12, 6)
        nostril.matrix_world = orient_to(nl, nn, Vector((1, 0, 0)))
        parts.append((nostril, 'head'))

    # ---- bouches (une seule visible à la fois)
    mz = 1.22
    smile = [(0.2 * math.cos(a), mz + 0.03 - 0.08 * math.sin(a))
             for a in [math.pi * i / 16 for i in range(17)]]
    parts.append((face_line('mouth.smile', tree, smile, 0.017, M['line'], 0.01), 'head'))
    for name, shape, tongue in (
        ('open', d_shape(0, mz + 0.03, 0.15, 0.12), d_shape(0, mz - 0.04, 0.1, 0.05, 0.0)),
        ('wide', d_shape(0, mz + 0.05, 0.2, 0.19), d_shape(0, mz - 0.06, 0.13, 0.08, 0.0)),
        ('o', ellipse(0, mz - 0.03, 0.07, 0.08), ellipse(0, mz - 0.07, 0.045, 0.03)),
        ('small', d_shape(0, mz + 0.02, 0.1, 0.06), None),
    ):
        o = face_shape(f'mouth.{name}', tree, shape, M['mouth'], offset=0.006)
        parts.append((o, 'head'))
        rim_pts = [shape(i / 48) for i in range(49)]
        parts.append((face_line(f'mouth.{name}.rim', tree, rim_pts, 0.014, M['line'], 0.008), 'head'))
        if tongue:
            parts.append((face_shape(f'mouth.{name}.tongue', tree, tongue, M['tongue'], offset=0.012), 'head'))
        if name in ('open', 'wide'):
            w = 0.15 if name == 'open' else 0.2
            top = mz + (0.03 if name == 'open' else 0.05)
            # Deux petites dents en haut.
            for tx in (-0.45 * w, 0.45 * w):
                tooth = d_shape(tx, top - 0.05 * (1 - (tx / w) ** 2) + 0.005, 0.03, 0.035, 0.0)
                parts.append((face_shape(f'mouth.{name}.tooth{int(tx > 0)}', tree, tooth, M['tooth'], offset=0.014), 'head'))
    return parts


# ------------------------------------------------------------ assemblage

def main():
    clear_scene()
    make_materials()
    arm = build_armature()
    head = build_head()
    body = build_body()
    belly = build_belly(body)
    arms = [build_arm('L'), build_arm('R')]
    legs = [build_leg('L'), build_leg('R')]

    body_bones = ['hips', 'chest', 'tail.1', 'tail.2', 'tail.3']
    bind(head, arm, rigid('head'))
    bind(body, arm, smooth_weights(body_bones))
    bind(belly, arm, smooth_weights(['hips', 'chest']))
    for a, side in zip(arms, 'LR'):
        bind(a, arm, rigid(f'arm.{side}'))
    for leg, side in zip(legs, 'LR'):
        bind(leg, arm, rigid(f'leg.{side}'))

    # Piquants : sur la tête → os de la tête ; sinon le plus proche du corps.
    tree = bvh_of([head, body])
    def spike_bone(p):
        if p.z > 1.1:
            return rigid('head')
        return smooth_weights(body_bones)
    for obj, w in build_spikes(tree, spike_bone):
        bind(obj, arm, w)

    for obj, bone in build_face(head):
        bind(obj, arm, rigid(bone))
        for poly in obj.data.polygons:
            poly.use_smooth = True

    export_glb(os.path.join(OUT_DIR, 'dino.glb'))


if __name__ == '__main__':
    main()
