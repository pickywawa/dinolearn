"""Stage 4: retarget Quaternius UAL 'Idle_Talking_Loop' (CC0) onto the dino rig + facial layer.
Run: Blender -b rigged.blend -P anim_talk.py [-- --render]
"""
import bpy, os, sys, math, random
import numpy as np
from mathutils import Matrix, Quaternion, Vector

HERE = os.path.dirname(os.path.abspath(bpy.data.filepath))
RENDER = "--render" in sys.argv
sc = bpy.context.scene
arm = bpy.data.objects["DinoRig"]; lid = bpy.data.objects["Eyelids"]; body = bpy.data.objects["Dino"]
FPS = 24; SRC_LEN = 70.4; LOOP = 70; NLOOP = 3; TOTAL = LOOP * NLOOP  # 210 frames = 8.75 s
sc.render.fps = FPS

# ------------------------------------------------------------- import source
before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, "ual_src.glb"))
new = set(bpy.data.objects) - before
src = [o for o in new if o.type == 'ARMATURE'][0]
for o in new:
    if o.type == 'MESH': bpy.data.objects.remove(o)
src.animation_data.action = bpy.data.actions["Idle_Talking_Loop"]

MAP = {"DEF-hips": "pelvis", "DEF-spine.001": "spine_01", "DEF-spine.002": "spine_02", "DEF-spine.003": "spine_03",
       "DEF-neck": "neck_01", "DEF-head": "head"}
for S, s in (("L", "l"), ("R", "r")):
    MAP.update({f"DEF-shoulder.{S}": f"clavicle_{s}", f"DEF-upper_arm.{S}": f"upperarm_{s}",
                f"DEF-forearm.{S}": f"lowerarm_{s}", f"DEF-hand.{S}": f"hand_{s}",
                f"DEF-thigh.{S}": f"thigh_{s}", f"DEF-shin.{S}": f"calf_{s}", f"DEF-foot.{S}": f"foot_{s}", f"DEF-toe.{S}": f"ball_{s}",
                f"DEF-thumb.01.{S}": f"thumb_01_{s}", f"DEF-thumb.02.{S}": f"thumb_02_{s}"})
    for f in ("index", "middle", "ring", "pinky"):
        MAP[f"DEF-f_{f}.01.{S}"] = f"{f}_01_{s}"; MAP[f"DEF-f_{f}.02.{S}"] = f"{f}_02_{s}"
INV = {v: k for k, v in MAP.items()}

sw = src.matrix_world; tw = arm.matrix_world
srcR0 = {sn: (sw @ src.data.bones[sn].matrix_local).to_quaternion() for sn in MAP}
tgtR0 = {b.name: (tw @ b.matrix_local).to_quaternion() for b in arm.data.bones}
src_hip0 = sw @ src.data.bones["DEF-hips"].head_local
HIP_SCALE = arm.data.bones["pelvis"].head_local.z / src_hip0.z

order = []
def walk(b):
    order.append(b); [walk(c) for c in b.children]
for b in arm.data.bones:
    if b.parent is None: walk(b)

def smooth(x): return x * x * (3 - 2 * x)
def qaxis(axis, deg): return Quaternion(Vector(axis).normalized(), math.radians(deg))

# ------------------------------------------------------------- facial / secondary layers
rng = random.Random(7)
t_end = TOTAL / FPS
phrases = [(0.25, 2.55), (3.15, 5.55), (6.15, 8.25)]
syl = []  # (start, end, amp)
for a, b in phrases:
    t = a
    while t < b - 0.12:
        d = rng.uniform(0.17, 0.27); syl.append((t, min(t + d, b), rng.uniform(0.35, 1.0))); t += d + rng.choice([0, 0, 0.03, 0.08])
def mouth_open(t):
    v = 0.0
    for a, b, amp in syl:
        if a <= t <= b: v = max(v, amp * math.sin(math.pi * (t - a) / (b - a)) ** 1.5)
    return v
blinks = [1.05, 3.9, 6.6, 6.95]
def blink(t):
    v = 0.0
    for tb in blinks:
        d = t - tb
        if 0 <= d < 0.09: v = max(v, smooth(d / 0.09))
        elif 0.09 <= d < 0.13: v = 1.0
        elif 0.13 <= d < 0.27: v = max(v, 1 - smooth((d - 0.13) / 0.14))
    return v
JAW_CLOSED, JAW_OPEN = -21.0, 6.0

# ------------------------------------------------------------- bake per frame
act = bpy.data.actions.new("Parle"); arm.animation_data_create(); arm.animation_data.action = act
for pb in arm.pose.bones:
    pb.rotation_mode = 'QUATERNION'
prevq = {}
for f in range(TOTAL + 1):
    t = f / FPS
    sf = (f % LOOP) * SRC_LEN / LOOP
    sc.frame_set(int(sf), subframe=sf - int(sf))
    Qt = {}
    for sn, tn in MAP.items():
        Qs = (sw @ src.pose.bones[sn].matrix).to_quaternion()
        Qt[tn] = Qs @ srcR0[sn].inverted() @ tgtR0[tn]
    hip = (sw @ src.pose.bones["DEF-hips"].head) - src_hip0
    mo = mouth_open(t)
    # world-space tweaks for the dino's proportions
    for s, sx in (("l", 1), ("r", -1)):
        Qt[f"upperarm_{s}"] = qaxis((0, 1, 0), sx * 4) @ qaxis((1, 0, 0), -8) @ Qt[f"upperarm_{s}"]  # keep short arms off the round belly
    Qt["head"] = qaxis((1, 0, 0), 3.0 * mo) @ Qt["head"]  # small nod on stressed syllables
    pose = {}
    for b in order:
        n = b.name
        Brest = b.matrix_local
        if b.parent:
            P = pose[b.parent.name]; Prest = b.parent.matrix_local
            base = P @ Prest.inverted() @ Brest
        else:
            base = Brest.copy()
        if n in Qt:
            h = base.translation.copy()
            if n == "pelvis": h = h + hip * HIP_SCALE
            want = Matrix.Translation(h) @ Qt[n].to_matrix().to_4x4()
            L = base.inverted() @ want
        else:
            L = Matrix.Identity(4)
            if n == "jaw":
                L = qaxis((1, 0, 0), JAW_CLOSED + (JAW_OPEN - JAW_CLOSED) * mo).to_matrix().to_4x4()
            elif n.startswith("tail_"):
                i = int(n[-2:])
                ph = 2 * math.pi * f / (TOTAL / 4) - i * 0.55
                yaw = (2.0 + 1.1 * i) * math.sin(ph); pitch = 1.2 * math.sin(2 * ph + 0.6)
                L = (qaxis((0, 0, 1), yaw) @ qaxis((1, 0, 0), pitch)).to_matrix().to_4x4()
            elif n == "frill":
                L = qaxis((1, 0, 0), 1.8 * math.sin(2 * math.pi * f / (TOTAL / 6) - 0.9)).to_matrix().to_4x4()
            # world-axis rotations above are expressed in bone-local space via the rest frame
            if n.startswith("tail_") or n in ("jaw", "frill"):
                R = Brest.to_quaternion()
                L = (R.inverted() @ L.to_quaternion() @ R).to_matrix().to_4x4()
        pose[n] = base @ L
        pb = arm.pose.bones[n]
        q = L.to_quaternion()
        if n in prevq and prevq[n].dot(q) < 0: q.negate()
        prevq[n] = q
        pb.rotation_quaternion = q
        pb.keyframe_insert("rotation_quaternion", frame=f, group=n)
        if n == "pelvis":
            pb.location = L.translation; pb.keyframe_insert("location", frame=f, group=n)
    # eyelids
    bv = blink(t)
    kb = lid.data.shape_keys.key_blocks
    wh = 2 * bv if bv < 0.5 else 2 - 2 * bv; wf = 0 if bv < 0.5 else 2 * bv - 1
    for s in ("l", "r"):
        kb[f"blink_half_{s}"].value = wh; kb[f"blink_{s}"].value = wf
        kb[f"blink_half_{s}"].keyframe_insert("value", frame=f); kb[f"blink_{s}"].keyframe_insert("value", frame=f)
lid.data.shape_keys.animation_data.action.name = "Parle"
bpy.data.objects.remove(src)
sc.frame_start, sc.frame_end = 0, TOTAL - 1
print("BAKED", TOTAL, "syllables", len(syl))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "dino_parle.blend"))

# ------------------------------------------------------------- GLB
body.data.name = 'DinoBody'
bpy.ops.object.select_all(action='DESELECT')
for o in (arm, body, lid): o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, "dino_parle.glb"), use_selection=True, export_format='GLB',
                          export_animation_mode='ACTIVE_ACTIONS', export_def_bones=True, export_morph=True,
                          export_skins=True, export_image_format='JPEG', export_image_quality=90, export_force_sampling=True)
import json, struct
gp = os.path.join(HERE, "dino_parle.glb"); raw = open(gp, "rb").read()
jl = struct.unpack("<I", raw[12:16])[0]; js = json.loads(raw[20:20 + jl]); rest = raw[20 + jl:]
for a in js.get("animations", []): a["name"] = "Parle"
enc = json.dumps(js, separators=(",", ":")).encode(); enc += b" " * ((4 - len(enc) % 4) % 4)
out = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(enc) + len(rest)) + struct.pack("<II", len(enc), 0x4E4F534A) + enc + rest
open(gp, "wb").write(out)
print("GLB ok", len(out))
