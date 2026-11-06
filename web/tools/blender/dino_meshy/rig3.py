"""Stage 3: full skeleton (UE-style names) + eyelids (shape keys) + skinning + jaw weights.
Run: Blender -b baked.blend -P rig3.py   -> rigged.blend
"""
import bpy, bmesh, os, math
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
V = Vector
sc = bpy.context.scene
body = bpy.data.objects["Dino"]
if "HP" in bpy.data.objects:
    bpy.data.objects.remove(bpy.data.objects["HP"])
me = body.data
co = np.array([v.co[:] for v in me.vertices])

# ---------------------------------------------------------------- tail centreline
tail = co[(co[:, 1] > 0.10) & (co[:, 2] < 0.32)]
base = np.array([0.0, 0.07, 0.20])
dist = np.linalg.norm(tail - base, axis=1)
tp = [base]
for r in np.linspace(0.10, dist.max() - 0.012, 7):
    s = tail[np.abs(dist - r) < 0.008]
    if len(s) > 3:
        tp.append(s.mean(0))
tip = tail[dist.argmax()]
tp.append(tip)
# resample to 9 points (8 bones) evenly along the polyline
tp = np.array(tp)
seg = np.linalg.norm(np.diff(tp, axis=0), axis=1); cum = np.r_[0, np.cumsum(seg)]
tpts = [V(np.array([np.interp(t, cum, tp[:, k]) for k in range(3)])) for t in np.linspace(0, cum[-1], 9)]
print("TAIL", [tuple(round(c, 3) for c in p) for p in tpts])

# ---------------------------------------------------------------- bones
B = {}
def bone(n, h, t, parent=None, deform=True, connect=False, roll_up=None):
    B[n] = dict(h=V(h), t=V(t), p=parent, d=deform, c=connect)

bone("root", (0, 0, 0), (0, 0.12, 0), None, deform=False)
bone("pelvis", (0, 0.02, 0.19), (0, 0.02, 0.25), "root")
bone("spine_01", (0, 0.02, 0.25), (0, 0.02, 0.31), "pelvis", connect=True)
bone("spine_02", (0, 0.02, 0.31), (0, 0.015, 0.37), "spine_01", connect=True)
bone("spine_03", (0, 0.015, 0.37), (0, 0.01, 0.42), "spine_02", connect=True)
bone("neck_01", (0, 0.01, 0.42), (0, 0.0, 0.47), "spine_03", connect=True)
bone("head", (0, 0.0, 0.47), (0, 0.0, 0.80), "neck_01", connect=True)
bone("jaw", (0, -0.08, 0.50), (0, -0.25, 0.43), "head")
bone("frill", (0, 0.05, 0.62), (0, 0.13, 0.90), "head")
for s, sx in (("l", 1), ("r", -1)):
    X = lambda x: x * sx
    bone(f"clavicle_{s}", (X(0.03), 0.0, 0.40), (X(0.14), 0.0, 0.392), "spine_03")
    bone(f"upperarm_{s}", (X(0.14), 0.0, 0.392), (X(0.21), 0.0, 0.389), f"clavicle_{s}", connect=True)
    bone(f"lowerarm_{s}", (X(0.21), 0.0, 0.389), (X(0.275), -0.003, 0.387), f"upperarm_{s}", connect=True)
    bone(f"hand_{s}", (X(0.275), -0.003, 0.387), (X(0.33), -0.005, 0.386), f"lowerarm_{s}", connect=True)
    fing = {
        "thumb": [(0.285, -0.035, 0.378), (0.297, -0.052, 0.372), (0.308, -0.066, 0.367)],
        "index": [(0.335, -0.030, 0.387), (0.356, -0.034, 0.387), (0.377, -0.036, 0.387)],
        "middle": [(0.335, -0.012, 0.387), (0.358, -0.015, 0.387), (0.379, -0.016, 0.387)],
        "ring": [(0.335, 0.008, 0.386), (0.355, 0.008, 0.386), (0.374, 0.008, 0.386)],
        "pinky": [(0.328, 0.030, 0.383), (0.341, 0.039, 0.381), (0.353, 0.045, 0.380)],
    }
    for f, pts in fing.items():
        pts = [(X(p[0]), p[1], p[2]) for p in pts]
        bone(f"{f}_01_{s}", pts[0], pts[1], f"hand_{s}")
        bone(f"{f}_02_{s}", pts[1], pts[2], f"{f}_01_{s}", connect=True)
    bone(f"thigh_{s}", (X(0.08), 0.01, 0.21), (X(0.088), -0.01, 0.12), "pelvis")
    bone(f"calf_{s}", (X(0.088), -0.01, 0.12), (X(0.095), 0.0, 0.045), f"thigh_{s}", connect=True)
    bone(f"foot_{s}", (X(0.095), 0.0, 0.045), (X(0.10), -0.07, 0.022), f"calf_{s}", connect=True)
    bone(f"ball_{s}", (X(0.10), -0.07, 0.022), (X(0.10), -0.11, 0.018), f"foot_{s}", connect=True)
    # controls (non deform): IK targets / poles for hand-animating in Blender
    bone(f"foot_ik_{s}", (X(0.095), 0.0, 0.045), (X(0.095), 0.08, 0.045), "root", deform=False)
    bone(f"knee_pole_{s}", (X(0.09), -0.30, 0.12), (X(0.09), -0.34, 0.12), "root", deform=False)
prev = "pelvis"
for i in range(8):
    n = f"tail_{i + 1:02d}"
    bone(n, tpts[i], tpts[i + 1], prev, connect=i > 0)
    prev = n

ad = bpy.data.armatures.new("DinoRig")
arm = bpy.data.objects.new("DinoRig", ad)
sc.collection.objects.link(arm)
ad.display_type = 'OCTAHEDRAL'; arm.show_in_front = True
bpy.ops.object.select_all(action='DESELECT')
bpy.context.view_layer.objects.active = arm; arm.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
eb = ad.edit_bones
for n, b in B.items():
    e = eb.new(n); e.head, e.tail = b["h"], b["t"]; e.use_deform = b["d"]
for n, b in B.items():
    if b["p"]:
        eb[n].parent = eb[b["p"]]; eb[n].use_connect = b["c"]
bpy.ops.armature.select_all(action='SELECT')
bpy.ops.armature.calculate_roll(type='GLOBAL_POS_Z')
# arms/fingers: roll so local Z points world up (+Z) -> consistent bending axis
bpy.ops.object.mode_set(mode='OBJECT')
# leg IK (off by default -> FK retarget; switch influence to 1 for hand animation)
for s in ("l", "r"):
    pb = arm.pose.bones[f"calf_{s}"]
    c = pb.constraints.new('IK'); c.name = "IK"; c.target = arm; c.subtarget = f"foot_ik_{s}"
    c.pole_target = arm; c.pole_subtarget = f"knee_pole_{s}"; c.chain_count = 2; c.pole_angle = math.radians(-90)
    c.influence = 0.0

# ---------------------------------------------------------------- skinning
body.parent = arm
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
names = [b.name for b in ad.bones]
nv = len(me.vertices)
W = np.zeros((nv, len(names)))
gid = {g.index: names.index(g.name) for g in body.vertex_groups if g.name in names}
for v in me.vertices:
    for g in v.groups:
        if g.group in gid: W[v.index, gid[g.group]] = g.weight
print("SKIN zero-weight verts", int((W.sum(1) < 1e-4).sum()))

# vertex adjacency (for propagation + harmonic solve)
ed = np.array([e.vertices[:] for e in me.edges])
nbr = [[] for _ in range(nv)]
for a, b in ed:
    nbr[a].append(b); nbr[b].append(a)
# fill unweighted verts from neighbours
for it in range(50):
    z = np.where(W.sum(1) < 1e-4)[0]
    if not len(z): break
    for i in z:
        W[i] = W[nbr[i]].mean(0)

# harmonic jaw field: 1 on chin/lower lip, 0 on upper head + neck
J = np.full(nv, 0.5); fixed = np.zeros(nv, bool)
x, y, zz = co[:, 0], co[:, 1], co[:, 2]
one = (y < -0.14) & (zz > 0.395) & (zz < 0.445) & (np.abs(x) < 0.12)
zero = ((zz > 0.53) | ((y < -0.255) & (zz > 0.475)) | ((np.abs(x) > 0.11) & (zz > 0.47)) | (np.abs(x) > 0.17) | (zz < 0.36) | (y > -0.02)) & ~one
J[one] = 1; J[zero] = 0; fixed = one | zero
deg = np.array([len(n) for n in nbr])
rows = np.repeat(np.arange(nv), deg); cols = np.concatenate([np.array(n, int) for n in nbr])
for it in range(3000):
    acc = np.bincount(rows, weights=J[cols], minlength=nv) / np.maximum(deg, 1)
    J = np.where(fixed, J, acc)
J = np.clip(J, 0, 1)
# sharpen a bit so lips separate cleanly
J = np.where(J > 0.5, 1 - 0.5 * ((1 - J) / 0.5) ** 1.6, 0.5 * (J / 0.5) ** 1.6)
print("JAW verts>0.5", int((J > 0.5).sum()))
ij = names.index("jaw")
W[:, names.index('head')] += W[:, ij]; W[:, ij] = 0
W *= (1 - J)[:, None]; W[:, ij] += J

# frill: everything behind the head plane above the neck follows the frill bone (smoothly)
def sstep(a, b, v):
    t = np.clip((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
F = sstep(0.03, 0.09, y) * sstep(0.50, 0.58, zz) * (1 - J)
ih, ifr = names.index("head"), names.index("frill")
headish = W[:, ih] + W[:, ifr]
W[:, ifr] = headish * F; W[:, ih] = headish * (1 - F)

# normalise, keep 4 strongest (glTF)
for i in range(nv):
    r = W[i]; idx = np.argsort(-r)[4:]; r[idx] = 0
W /= np.maximum(W.sum(1, keepdims=True), 1e-8)
for g in list(body.vertex_groups): body.vertex_groups.remove(g)
for j, n in enumerate(names):
    if not ad.bones[n].use_deform: continue
    g = body.vertex_groups.new(name=n)
    nz = np.where(W[:, j] > 1e-4)[0]
    for i in nz: g.add([int(i)], float(W[i, j]), 'REPLACE')

# ---------------------------------------------------------------- eyelids
eye = np.load(os.path.join(HERE, "eyemask.npy"))
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); tree = BVHTree.FromBMesh(bm)
nrm = np.array([v.normal[:] for v in me.vertices])
img = bpy.data.images["dino_basecolor"]
lid_img = bpy.data.images.new("eyelid", 4, 64, alpha=False)
skin = np.array([0.42, 0.27, 0.80])
# sample real skin colour around the eyes from the baked texture
px = np.array(img.pixels[:]).reshape(img.size[1], img.size[0], 4)
uv = np.zeros((len(me.loops), 2)); me.uv_layers.active.data.foreach_get("uv", uv.ravel())
vi = np.zeros(len(me.loops), int); me.loops.foreach_get("vertex_index", vi)
vcol = np.zeros((nv, 3)); vcol[vi] = px[np.clip((uv[:, 1] * img.size[1]).astype(int), 0, img.size[1] - 1), np.clip((uv[:, 0] * img.size[0]).astype(int), 0, img.size[0] - 1), :3]
lp = []
for v in range(64):
    t = v / 63.0  # 0 = lid edge (bottom), 1 = top
    lp.append(None)
NU, NVR = 16, 12
lid_me = bpy.data.meshes.new("Eyelids"); verts = []; faces = []; uvs = []
keys = {"Basis": [], "blink_half_l": [], "blink_l": [], "blink_half_r": [], "blink_r": []}
eyeinfo = {}
for s, sx in (("l", 1), ("r", -1)):
    m = eye & (co[:, 0] * sx > 0.05) & (co[:, 2] < 0.70)
    pts = co[m]; C = (pts.min(0) + pts.max(0)) / 2
    N = V(nrm[m].mean(0)).normalized()
    U = (V((0, 0, 1)) - N * N.z).normalized(); R = U.cross(N).normalized()
    loc = np.array([[V(p - C).dot(R), V(p - C).dot(U)] for p in pts])
    a = np.abs(loc[:, 0]).max() * 1.12; b = np.abs(loc[:, 1]).max() * 1.10
    ring = vcol[(np.linalg.norm(co - C, axis=1) < 0.09) & (np.linalg.norm(co - C, axis=1) > 0.07)]
    sk = np.median(ring, axis=0)
    eyeinfo[s] = (C, N, a, b, sk)
    print("EYE", s, C.round(3), tuple(round(c, 3) for c in N), round(a, 3), round(b, 3), sk.round(3))
    for lower in (False, True):
        base = len(verts)
        for r_ in range(NVR):
            for c_ in range(NU):
                verts.append((0, 0, 0)); uvs.append((c_ / (NU - 1), 1 - r_ / (NVR - 1)))
        flip = (sx > 0) != lower
        for r_ in range(NVR - 1):
            for c_ in range(NU - 1):
                i0 = base + r_ * NU + c_
                faces.append((i0, i0 + 1, i0 + NU + 1, i0 + NU) if flip else (i0, i0 + NU, i0 + NU + 1, i0 + 1))

def lid_positions(s, cl, lower=False):
    C, N, a, b, _ = eyeinfo[s]
    U = (V((0, 0, 1)) - N * N.z).normalized(); R = U.cross(N).normalized()
    out = []
    for r_ in range(NVR):
        tt = r_ / (NVR - 1)
        for c_ in range(NU):
            ss = -1 + 2 * c_ / (NU - 1)
            if not lower:
                yy = b - 2 * b * cl * tt
            else:  # lower lid rises from the bottom; its edge arches up in the middle (happy eyes)
                edge = -b + 2 * b * cl + 1.0 * b * cl * (1 - ss * ss)
                yy = -b + (edge + b) * tt
            w = a * math.sqrt(max(0.0, 1 - (min(abs(yy), b) / b) ** 2))
            P = V(C) + R * (ss * w) + U * yy
            hit = tree.ray_cast(P + N * 0.06, -N, 0.2)
            if hit[0] is None:
                hit = tree.find_nearest(P)
            out.append(hit[0] + hit[1] * (0.003 if not lower else 0.0036))
    return out

keys = {"Basis": [], "blink_half_l": [], "blink_l": [], "blink_half_r": [], "blink_r": [], "happy_l": [], "happy_r": []}
for key in keys:
    pos = []
    for s in ("l", "r"):
        cl = 0.0
        if key == f"blink_half_{s}": cl = 0.5
        if key == f"blink_{s}": cl = 1.0
        pos += lid_positions(s, cl)
        pos += lid_positions(s, 0.5 if key == f"happy_{s}" else 0.0, lower=True)
    keys[key] = pos
lid_me.from_pydata([tuple(p) for p in keys["Basis"]], [], faces)
uvl = lid_me.uv_layers.new(name="UVMap")
for poly in lid_me.polygons:
    for li in poly.loop_indices:
        uvl.data[li].uv = uvs[lid_me.loops[li].vertex_index]
lid = bpy.data.objects.new("Eyelids", lid_me); sc.collection.objects.link(lid)
for p in lid_me.polygons: p.use_smooth = True
lid.shape_key_add(name="Basis")
for key, pos in keys.items():
    if key == "Basis": continue
    k = lid.shape_key_add(name=key, from_mix=False)
    for i, p in enumerate(pos): k.data[i].co = p
    k.value = 0.0
    k.slider_max = 1.0
# eyelid texture: skin colour, darker lash line at the lid edge (v near 0)
sk = (eyeinfo["l"][4] + eyeinfo["r"][4]) / 2
pix = []
for v in range(64):
    t = v / 63.0
    if t < 0.07: c = (0.10, 0.06, 0.18)
    elif t < 0.14: c = tuple(sk * 0.75)
    else: c = tuple(sk * 0.9)
    for u in range(4): pix += [c[0], c[1], c[2], 1.0]
lid_img.pixels[:] = pix
lid_img.filepath_raw = os.path.join(HERE, "tex", "eyelid.png"); lid_img.file_format = 'PNG'; lid_img.save()
mm = bpy.data.materials.new("Eyelid"); mm.use_nodes = True; nt = mm.node_tree; nt.nodes.clear()
o_ = nt.nodes.new("ShaderNodeOutputMaterial"); p_ = nt.nodes.new("ShaderNodeBsdfPrincipled"); nt.links.new(p_.outputs[0], o_.inputs[0])
p_.inputs["Roughness"].default_value = 0.55
t_ = nt.nodes.new("ShaderNodeTexImage"); t_.image = lid_img; t_.interpolation = 'Linear'; nt.links.new(t_.outputs[0], p_.inputs["Base Color"])
lid_me.materials.append(mm)
lid.parent = arm
g = lid.vertex_groups.new(name="head"); g.add(list(range(len(lid_me.vertices))), 1.0, 'REPLACE')
md = lid.modifiers.new("Armature", 'ARMATURE'); md.object = arm

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "rigged.blend"))
print("OK bones", len(B), "deform", sum(1 for b in B.values() if b["d"]))
