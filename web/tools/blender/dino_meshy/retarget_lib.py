"""Shared retarget helpers: Quaternius UAL1 (Rigify DEF- names) + UAL2 (UE names) -> DinoRig."""
import bpy, os, math
from mathutils import Matrix, Quaternion, Vector

HERE = os.path.dirname(os.path.abspath(__file__))


def map_ual1():
    m = {"DEF-hips": "pelvis", "DEF-spine.001": "spine_01", "DEF-spine.002": "spine_02", "DEF-spine.003": "spine_03",
         "DEF-neck": "neck_01", "DEF-head": "head"}
    for S, s in (("L", "l"), ("R", "r")):
        m.update({f"DEF-shoulder.{S}": f"clavicle_{s}", f"DEF-upper_arm.{S}": f"upperarm_{s}",
                  f"DEF-forearm.{S}": f"lowerarm_{s}", f"DEF-hand.{S}": f"hand_{s}",
                  f"DEF-thigh.{S}": f"thigh_{s}", f"DEF-shin.{S}": f"calf_{s}", f"DEF-foot.{S}": f"foot_{s}",
                  f"DEF-toe.{S}": f"ball_{s}", f"DEF-thumb.01.{S}": f"thumb_01_{s}", f"DEF-thumb.02.{S}": f"thumb_02_{s}"})
        for f in ("index", "middle", "ring", "pinky"):
            m[f"DEF-f_{f}.01.{S}"] = f"{f}_01_{s}"; m[f"DEF-f_{f}.02.{S}"] = f"{f}_02_{s}"
    return m


def map_ual2():
    m = {"pelvis": "pelvis", "spine_01": "spine_01", "spine_02": "spine_02", "spine_03": "spine_03",
         "neck_01": "neck_01", "Head": "head"}
    for s in ("l", "r"):
        for n in ("clavicle", "upperarm", "lowerarm", "hand", "thigh", "calf", "foot", "ball"):
            m[f"{n}_{s}"] = f"{n}_{s}"
        for f in ("thumb", "index", "middle", "ring", "pinky"):
            m[f"{f}_01_{s}"] = f"{f}_01_{s}"; m[f"{f}_02_{s}"] = f"{f}_02_{s}"
    return m


class Source:
    def __init__(self, path, mapping, hip_bone):
        before = set(bpy.data.objects); acts_before = set(bpy.data.actions)
        bpy.ops.import_scene.gltf(filepath=path)
        new = set(bpy.data.objects) - before
        self.arm = [o for o in new if o.type == 'ARMATURE'][0]
        for o in new:
            if o.type != 'ARMATURE': bpy.data.objects.remove(o)
        self.actions = {a.name: a for a in set(bpy.data.actions) - acts_before}
        self.map = mapping; self.hip = hip_bone
        sw = self.arm.matrix_world
        self.R0 = {sn: (sw @ self.arm.data.bones[sn].matrix_local).to_quaternion() for sn in mapping}
        self.hip0 = sw @ self.arm.data.bones[hip_bone].head_local
        self.arm.animation_data_create()

    def length(self, action):
        a = self.actions[action]; return a.frame_range[1] - a.frame_range[0]

    def sample(self, action, sf, tgtR0):
        sc = bpy.context.scene
        self.arm.animation_data.action = self.actions[action]
        sc.frame_set(int(math.floor(sf)), subframe=sf - math.floor(sf))
        sw = self.arm.matrix_world
        Qt = {}
        for sn, tn in self.map.items():
            Qs = (sw @ self.arm.pose.bones[sn].matrix).to_quaternion()
            Qt[tn] = Qs @ self.R0[sn].inverted() @ tgtR0[tn]
        hip = (sw @ self.arm.pose.bones[self.hip].head) - self.hip0
        return Qt, hip


def qaxis(axis, deg):
    return Quaternion(Vector(axis).normalized(), math.radians(deg))


class Target:
    """Writes keyframes on DinoRig (+ eyelid shape keys) from world-space bone rotations."""
    JAW_CLOSED, JAW_OPEN = -21.0, 6.0

    def __init__(self):
        self.arm = bpy.data.objects["DinoRig"]; self.lid = bpy.data.objects["Eyelids"]
        self.R0 = {b.name: (self.arm.matrix_world @ b.matrix_local).to_quaternion() for b in self.arm.data.bones}
        self.order = []
        def walk(b):
            self.order.append(b); [walk(c) for c in b.children]
        for b in self.arm.data.bones:
            if b.parent is None: walk(b)
        self.hip_scale = self.arm.data.bones["pelvis"].head_local.z / 0.917
        for pb in self.arm.pose.bones: pb.rotation_mode = 'QUATERNION'
        self.key = self.lid.data.shape_keys

    def rest_world(self):
        return {n: q.copy() for n, q in self.R0.items() if n in self._mapped()}

    def _mapped(self):
        return set(map_ual2().values())

    def begin(self, name):
        act = bpy.data.actions.new(name); act.use_fake_user = True
        self.arm.animation_data_create(); self.arm.animation_data.action = act
        self.key.animation_data_create(); self.key.animation_data.action = act
        self.prev = {}
        return act

    def frame(self, f, Qt, hip, local=None, spin=0.0, lift=0.0, shift=(0, 0), face=None):
        """Qt: world rotations of mapped bones. local: {bone: Quaternion} extra local (world-axis) rotations
        for unmapped bones (jaw/tail/frill) or added after mapping. spin (deg about Z), lift (m) = global."""
        local = local or {}
        G = qaxis((0, 0, 1), spin)
        pose = {}
        for b in self.order:
            n = b.name; Brest = b.matrix_local
            if b.parent:
                base = pose[b.parent.name] @ b.parent.matrix_local.inverted() @ Brest
            else:
                base = Brest.copy()
            if n in Qt:
                h = base.translation.copy()
                q = G @ Qt[n]
                if n == "pelvis":
                    h = G @ (h + hip * self.hip_scale) + Vector((shift[0], shift[1], lift))
                if n in local: q = local[n] @ q
                want = Matrix.Translation(h) @ q.to_matrix().to_4x4()
                L = base.inverted() @ want
            else:
                L = Matrix.Identity(4)
                if n in local:
                    R = Brest.to_quaternion()
                    L = (R.inverted() @ local[n] @ R).to_matrix().to_4x4()
            pose[n] = base @ L
            pb = self.arm.pose.bones[n]
            q = L.to_quaternion()
            if n in self.prev and self.prev[n].dot(q) < 0: q.negate()
            self.prev[n] = q
            pb.rotation_quaternion = q
            pb.keyframe_insert("rotation_quaternion", frame=f, group=n)
            if n == "pelvis":
                pb.location = L.translation; pb.keyframe_insert("location", frame=f, group=n)
        self.face(f, **(face or {}))

    def face(self, f, blink=0.0, low=0.0, blinkL=None, blinkR=None):
        """blink: upper lids 0..1 (blinkL/blinkR override one side) ; low: lower lids ('happy' eyes) 0..1."""
        kb = self.key.key_blocks
        for s in ("l", "r"):
            b = blinkL if (s == "l" and blinkL is not None) else blinkR if (s == "r" and blinkR is not None) else blink
            wh = 2 * b if b < 0.5 else 2 - 2 * b; wf = 0 if b < 0.5 else 2 * b - 1
            vals = {f"blink_half_{s}": wh, f"blink_{s}": wf}
            if f"happy_{s}" in kb: vals[f"happy_{s}"] = low
            for k, v in vals.items():
                kb[k].value = v; kb[k].keyframe_insert("value", frame=f)


def jaw_q(open_):
    """open_: -0.0 = closed (default smile), 1 = sculpted open, >1 wider."""
    return qaxis((1, 0, 0), Target.JAW_CLOSED + (0 - Target.JAW_CLOSED) * open_)


def smooth(x):
    x = min(1.0, max(0.0, x)); return x * x * (3 - 2 * x)
