"""Outils partagés par les scripts Blender (dino, objets, décors)."""
import os

import bpy  # noqa: I001 (doit précéder bmesh)
import bmesh
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(os.path.dirname(HERE))
OUT_DIR = os.path.join(WEB, 'public', 'models')


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, color, rough=0.5):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*color, 1)
        bsdf.inputs['Roughness'].default_value = rough
    m.diffuse_color = (*color, 1)
    return m


def link(obj):
    bpy.context.collection.objects.link(obj)
    return obj


def smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def mesh_from_bmesh(name, bm, mat=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = link(bpy.data.objects.new(name, me))
    if mat:
        obj.data.materials.append(mat)
    return smooth(obj)


def ellipsoid(name, center, radii, mat=None, segments=32, rings=16):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segments, v_segments=rings, radius=1)
    bmesh.ops.scale(bm, vec=radii, verts=bm.verts)
    bmesh.ops.translate(bm, vec=center, verts=bm.verts)
    return mesh_from_bmesh(name, bm, mat)


def evaluated_copy(obj, name):
    """Maillage « figé » d'un objet (métaballes, courbes, modificateurs)."""
    deps = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(obj.evaluated_get(deps))
    me.name = name
    out = link(bpy.data.objects.new(name, me))
    out.matrix_world = obj.matrix_world.copy()
    return out


def decimate(obj, max_faces):
    """Allège un maillage trop dense (jeu sur tablette) en gardant sa forme."""
    faces = len(obj.data.polygons)
    if faces <= max_faces:
        return obj
    mod = obj.modifiers.new('decimate', 'DECIMATE')
    mod.ratio = max_faces / faces
    bpy.context.view_layer.update()
    name = obj.name
    out = evaluated_copy(obj, name + '_d')
    mats = list(obj.data.materials)
    bpy.data.objects.remove(obj)
    out.name = name
    for m in mats:
        out.data.materials.append(m)
    return smooth(out)


def metaball_mesh(name, elems, resolution=0.04, max_faces=6000):
    threshold = 0.6
    """
    Forme lisse faite de métaballes. `elems` : (centre, rayon visible, (sx, sy, sz)).
    Avec le seuil 0,6, une métaballe seule a un rayon visible de 0,575 × son
    rayon d'influence : on convertit pour donner directement la taille voulue.
    La métaballe est convertie en maillage tout de suite (les métaballes de
    même nom de base fusionneraient entre elles).
    """
    data = bpy.data.metaballs.new('mb_' + name.replace('.', '_'))
    data.resolution = resolution
    data.render_resolution = resolution
    data.threshold = threshold
    mb = link(bpy.data.objects.new('mb_' + name.replace('.', '_'), data))
    for co, r, (sx, sy, sz) in elems:
        e = data.elements.new(type='ELLIPSOID')
        e.co = co
        e.radius = r / 0.575
        e.size_x, e.size_y, e.size_z = sx, sy, sz
    bpy.context.view_layer.update()
    obj = evaluated_copy(mb, name)
    bpy.data.objects.remove(mb)
    bpy.data.metaballs.remove(data)
    return decimate(smooth(obj), max_faces)


def orient_to(loc, normal, x_hint):
    """Matrice placée en `loc`, axe Z le long de `normal`, X proche de `x_hint`."""
    z = Vector(normal).normalized()
    x = Vector(x_hint)
    x = (x - z * x.dot(z)).normalized()
    y = z.cross(x)
    m = Matrix((
        (x.x, y.x, z.x, loc[0]),
        (x.y, y.y, z.y, loc[1]),
        (x.z, y.z, z.z, loc[2]),
        (0, 0, 0, 1),
    ))
    return m


def tube(name, pts, radius, mat=None, caps=True):
    """Tube rond qui suit une suite de points (traits du visage, anses…)."""
    cu = bpy.data.curves.new(name + '_c', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    cu.use_fill_caps = caps
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for p, v in zip(sp.points, pts):
        p.co = (v[0], v[1], v[2], 1)
    tmp = link(bpy.data.objects.new(name + '_c', cu))
    bpy.context.view_layer.update()
    obj = evaluated_copy(tmp, name)
    bpy.data.objects.remove(tmp)
    bpy.data.curves.remove(cu)
    if mat:
        obj.data.materials.append(mat)
    return smooth(obj)


def export_glb(path, animations=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        export_yup=True,
        export_apply=False,
        export_animations=animations,
        export_skins=True,
        export_morph=False,
        export_materials='EXPORT',
        export_texcoords=False,
        export_normals=True,
    )
    print('→', path, os.path.getsize(path) // 1024, 'Ko')
