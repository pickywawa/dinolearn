"""Stage 5: all game reactions as glTF clips on the dino (Quaternius UAL CC0 bases + hand-made layers).
Run: Blender -b rigged.blend -P clips.py [-- ONLY=name1,name2]
Saves dino_clips.blend and dino_anim.glb (one animation per clip).
"""
import bpy, os, sys, math, random, json, struct
sys.path.insert(0, os.path.dirname(bpy.data.filepath))
from retarget_lib import *
from mathutils import Vector, Quaternion, Matrix

FPS = 24
sc = bpy.context.scene; sc.render.fps = FPS
S1 = Source(os.path.join(HERE, "ual_src.glb"), map_ual1(), "DEF-hips")
S2 = Source(os.path.join(HERE, "ual2_src.glb"), map_ual2(), "pelvis")
T = Target()
arm = T.arm; bones = arm.data.bones
MAPPED = set(map_ual2().values())
ONLY = None
for a in sys.argv:
    if a.startswith("ONLY="): ONLY = a[5:].split(",")

# ------------------------------------------------------------------ helpers
def lerp(a, b, t): return a + (b - a) * t
def env(f, a, b, c=None, d=None):
    """0 before a, ramps to 1 at b, holds, ramps down c..d."""
    if f < a: return 0.0
    if f < b: return smooth((f - a) / max(1e-6, b - a))
    if c is None or f < c: return 1.0
    if f < d: return 1 - smooth((f - c) / max(1e-6, d - c))
    return 0.0
def bump(f, a, d):
    """smooth 0->1->0 between a and a+d."""
    if f < a or f > a + d: return 0.0
    return math.sin(math.pi * (f - a) / d) ** 2

def src(S, action, speed=1.0, loop=True, start=0.0):
    L = S.length(action)
    def get(f):
        sf = start + f * speed
        sf = sf % L if loop else min(max(sf, 0), L)
        return S.sample(action, sf, T.R0)
    return get

IDLE = src(S1, "Idle_Loop")
CHILD = {}
for b in bones:
    CHILD.setdefault(b.parent.name if b.parent else None, []).append(b.name)
def subtree(n):
    out = [n]
    for c in CHILD.get(n, []): out += subtree(c)
    return out

def override(Qt, bone, q, w=1.0):
    """Rotate `bone` (world) towards q by weight w; mapped descendants follow rigidly."""
    if w <= 0: return
    new = Qt[bone].slerp(q, w) if w < 1 else q
    delta = new @ Qt[bone].inverted()
    for d in subtree(bone):
        if d in Qt: Qt[d] = delta @ Qt[d]

def rest_dir(bone):
    b = bones[bone]; return (b.tail_local - b.head_local).normalized()

def aim_q(bone, d):
    d = Vector(d).normalized()
    return rest_dir(bone).rotation_difference(d) @ T.R0[bone]

def pre(Qt, bone, axis, deg):
    """extra world rotation on a mapped bone (its subtree follows)."""
    override(Qt, bone, qaxis(axis, deg) @ Qt[bone])

def arm_aim(Qt, side, up, low, w=1.0, hand=None):
    sx = 1 if side == "l" else -1
    m = lambda v: (v[0] * sx, v[1], v[2])
    override(Qt, f"upperarm_{side}", aim_q(f"upperarm_{side}", m(up)), w)
    override(Qt, f"lowerarm_{side}", aim_q(f"lowerarm_{side}", m(low)), w)
    override(Qt, f"hand_{side}", aim_q(f"hand_{side}", m(hand or low)), w)

def curl(Qt, side, fingers, deg, w=1.0):
    """bend fingers (relative to the hand) — keeps them attached to the current hand orientation."""
    sx = 1 if side == "l" else -1
    hd = Qt[f"hand_{side}"] @ T.R0[f"hand_{side}"].inverted()
    for f in fingers:
        for i, k in ((1, 1.0), (2, 1.2)):
            n = f"{f}_0{i}_{side}"
            q = hd @ qaxis((0, 1, 0), sx * deg * k) @ T.R0[n]
            Qt[n] = Qt[n].slerp(q, w)

def blendQt(A, B, w):
    (qa, ha), (qb, hb) = A, B
    return ({n: qa[n].slerp(qb[n], w) for n in qa}, ha.lerp(hb, w))

def copyQt(A):
    return ({n: q.copy() for n, q in A[0].items()}, A[1].copy())

# leg IK (keeps feet on targets: planted on the floor, or tucked during jumps)
LEG = {}
for s in ("l", "r"):
    th, ca, fo = bones[f"thigh_{s}"], bones[f"calf_{s}"], bones[f"foot_{s}"]
    LEG[s] = dict(a=(ca.head_local - th.head_local).length, b=(fo.head_local - ca.head_local).length, ankle=fo.head_local.copy())

def ik_leg(H, A, s, pole=Vector((0, -1, 0))):
    a, b = LEG[s]["a"], LEG[s]["b"]
    D = A - H; d = min(D.length, a + b - 1e-4); u = D.normalized()
    cosA = (a * a + d * d - b * b) / (2 * a * d); sinA = math.sqrt(max(0, 1 - cosA * cosA))
    v = (pole - u * pole.dot(u)).normalized()
    K = H + u * (a * cosA) + v * (a * sinA)
    return aim_q(f"thigh_{s}", K - H), aim_q(f"calf_{s}", (H + u * d) - K)

# ------------------------------------------------------------------ frame writer with IK + secondary motion
def write(f, Qt, hip, *, spin=0, lift=0, drop=0, tuck=0, ik=False, jaw=0.0, blink=0.0, happy=0.0,
          tail=1.0, tail_lift=0.0, tail_speed=1.0, frill=1.0, shift=(0, 0), extra_local=None,
          tuckL=0.0, tuckR=0.0, blinkL=None, blinkR=None):
    local = dict(extra_local or {})
    # secondary: tail sway + frill wobble
    for i in range(1, 9):
        ph = 2 * math.pi * f / (48 / tail_speed) - i * 0.55
        yaw = tail * (2.0 + 1.1 * i) * math.sin(ph)
        pitch = tail * 1.2 * math.sin(2 * ph + 0.6) - tail_lift * (3 + 1.5 * i)
        local[f"tail_{i:02d}"] = qaxis((0, 0, 1), yaw) @ qaxis((1, 0, 0), pitch)
    local["frill"] = qaxis((1, 0, 0), frill * 1.6 * math.sin(2 * math.pi * f / 40 - 0.9))
    local["jaw"] = jaw_q(jaw)
    if ik:
        # pelvis world position -> hip joints, then solve each leg towards its ankle target
        G = qaxis((0, 0, 1), spin)
        pel = bones["pelvis"]
        P = G @ (pel.head_local + hip * T.hip_scale) + Vector((shift[0], shift[1], lift + drop))
        Rp = (G @ Qt["pelvis"]).to_matrix().to_4x4(); Rp.translation = P
        for s in ("l", "r"):
            H = (Rp @ pel.matrix_local.inverted() @ bones[f"thigh_{s}"].matrix_local).translation
            A = G @ LEG[s]["ankle"] + Vector((shift[0], shift[1], lift + tuck + (tuckL if s == "l" else tuckR)))
            qt, qc = ik_leg(H, A, s, G @ Vector((0, -1, 0)))
            # IK solves in world (already spun) -> undo spin because Target.frame re-applies it
            Gi = G.inverted()
            foot_w = Qt[f"foot_{s}"]
            Qt[f"thigh_{s}"] = Gi @ qt; Qt[f"calf_{s}"] = Gi @ qc
            Qt[f"foot_{s}"] = foot_w; Qt[f"ball_{s}"] = Qt[f"ball_{s}"]
    T.frame(f, Qt, hip, local=local, spin=spin, lift=lift + drop, shift=shift, face=dict(blink=blink, low=happy, blinkL=blinkL, blinkR=blinkR))

def blink_at(f, times, dur=6):
    v = 0.0
    for tb in times:
        d = f - tb
        if 0 <= d < dur * 0.35: v = max(v, smooth(d / (dur * 0.35)))
        elif dur * 0.35 <= d < dur * 0.5: v = 1.0
        elif dur * 0.5 <= d < dur: v = max(v, 1 - smooth((d - dur * 0.5) / (dur * 0.5)))
    return v

def jump(f, a, d, h):
    """parabolic lift starting at frame a, airborne for d frames, height h. Returns (lift, crouch, tuck)."""
    crouch = -0.035 * (bump(f, a - 6, 8) + bump(f, a + d - 2, 8))
    if a <= f <= a + d:
        t = (f - a) / d; return 4 * h * t * (1 - t), crouch, 0.05 * math.sin(math.pi * t)
    return 0.0, crouch, 0.0

UP = ((0.8, -0.32, 0.52), (0.5, -0.4, 0.77))

# ------------------------------------------------------------------ clip definitions
CLIPS = {}
def clip(name, frames, loop=False):
    def deco(fn):
        CLIPS[name] = (frames, fn, loop); return fn
    return deco

@clip("idle", 120, loop=True)
def _(f):
    Qt, hip = IDLE(f)
    write(f, Qt, hip, blink=blink_at(f, [38, 100]), tail=0.8)

rng = random.Random(7)
_syl = []
for a, b in [(0.25, 2.55), (3.15, 5.55), (6.15, 8.25)]:
    t = a
    while t < b - 0.12:
        d = rng.uniform(0.17, 0.27); _syl.append((t, min(t + d, b), rng.uniform(0.35, 1.0))); t += d + rng.choice([0, 0, 0.03, 0.08])
def mouth(t):
    v = 0.0
    for a, b, amp in _syl:
        if a <= t <= b: v = max(v, amp * math.sin(math.pi * (t - a) / (b - a)) ** 1.5)
    return v
TALK = src(S1, "Idle_Talking_Loop", speed=70.4 / 70)
@clip("talk", 210, loop=True)
def _(f):
    Qt, hip = TALK(f)
    mo = mouth(f / FPS)
    for s, sx in (("l", 1), ("r", -1)):
        pre(Qt, f"upperarm_{s}", (1, 0, 0), -8); pre(Qt, f"upperarm_{s}", (0, 1, 0), sx * 4)
    pre(Qt, "head", (1, 0, 0), 3 * mo)
    write(f, Qt, hip, jaw=mo * 1.25, blink=blink_at(f, [25, 94, 158, 166], 7), tail_speed=1.1)

@clip("happy", 26)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 5, 18, 26)
    arm_aim(Qt, "l", *UP, w); arm_aim(Qt, "r", *UP, w)
    lift, cr, tk = jump(f, 5, 12, 0.12)
    pre(Qt, "head", (1, 0, 0), -8 * w)
    write(f, Qt, hip, ik=True, lift=lift, drop=cr, tuck=tk, jaw=1.0 * w, blink=w, happy=w, tail=1.6, tail_speed=2.5)

@clip("cheer", 44)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 5, 36, 44)
    wave = math.sin(2 * math.pi * f / 11)
    for s in ("l", "r"):
        arm_aim(Qt, s, (0.8, -0.3, 0.52), (0.45 + 0.3 * wave, -0.4, 0.8), w)
    l1, c1, t1 = jump(f, 5, 12, 0.15); l2, c2, t2 = jump(f, 23, 12, 0.15)
    pre(Qt, "head", (1, 0, 0), -10 * w)
    write(f, Qt, hip, ik=True, lift=l1 + l2, drop=c1 + c2, tuck=t1 + t2, jaw=1.2 * w, blink=w, happy=w, tail=1.8, tail_speed=3)

DANCE = src(S1, "Dance_Loop")
@clip("dance", 96, loop=True)
def _(f):
    Qt, hip = DANCE(f)
    beat = math.sin(2 * math.pi * f / 24)
    pre(Qt, "spine_01", (0, 1, 0), 9 * beat); pre(Qt, "head", (0, 1, 0), -12 * beat)
    for s, sx in (("l", 1), ("r", -1)):
        ph = math.sin(2 * math.pi * f / 24 + (0 if s == "l" else math.pi))
        arm_aim(Qt, s, (0.85, -0.3, 0.35 + 0.3 * ph), (0.55, -0.45, 0.6 + 0.2 * ph), 0.85)
    hop = 0.025 * abs(math.sin(2 * math.pi * f / 24))
    write(f, Qt, hip, ik=True, lift=hop, jaw=0.6, blink=1.0, happy=1.0, tail=2.0, tail_speed=4)

OOPS = src(S1, "Hit_Head", speed=0.4, loop=False)
@clip("oops", 34)
def _(f):
    Qt, hip = OOPS(f)
    w = env(f, 0, 4, 24, 34)
    pre(Qt, "head", (0, 1, 0), 14 * w)
    shake = 0.008 * math.sin(f * 2.4) * env(f, 2, 4, 12, 16)
    write(f, Qt, hip, jaw=0.7 * w, blink=0.55 * w, shift=(shake, 0), tail=0.6)

THINK = src(S2, "Idle_FoldArms_Loop")
@clip("think", 72, loop=True)
def _(f):
    Qt, hip = THINK(f)
    tilt = 13 + 3 * math.sin(2 * math.pi * f / 72)
    pre(Qt, "head", (0, 1, 0), -tilt); pre(Qt, "head", (1, 0, 0), -9)
    write(f, Qt, hip, jaw=0.0, blink=0.3 + blink_at(f, [50]) * 0.7, tail=0.5)

EAT = src(S2, "Consume", speed=0.75, loop=False)
@clip("eat", 48)
def _(f):
    Qt, hip = EAT(f)
    chew = 0.9 * max(0.0, math.sin(2 * math.pi * (f - 14) / 7)) if 14 <= f <= 42 else 0.0
    open_ = 1.2 * env(f, 6, 13, 13, 15)
    h = env(f, 14, 18, 40, 46)
    write(f, Qt, hip, jaw=max(chew, open_), blink=h, happy=h, tail=1.2, tail_speed=2)

@clip("levelUp", 60)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 8, 50, 60)
    arm_aim(Qt, "l", *UP, w); arm_aim(Qt, "r", *UP, w)
    lift, cr, tk = jump(f, 8, 26, 0.3)
    spin = 360 * smooth((f - 8) / 26) if f >= 8 else 0
    write(f, Qt, hip, ik=True, lift=lift, drop=cr, tuck=tk, spin=spin, jaw=1.2 * w, blink=w, happy=w, tail=2, tail_speed=3)

TICK = src(S1, "Hit_Chest", speed=0.5)
@clip("tickle", 40)
def _(f):
    Qt, hip = TICK(f)
    w = env(f, 0, 4, 32, 40)
    giggle = math.sin(2 * math.pi * f / 5)
    pre(Qt, "spine_02", (0, 1, 0), 6 * giggle * w)
    pre(Qt, "head", (1, 0, 0), -10 * w)
    write(f, Qt, hip, jaw=(0.9 + 0.35 * giggle) * w, blink=w, happy=w, shift=(0.01 * giggle * w, 0), tail=2, tail_speed=4)

@clip("wave", 48)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 7, 38, 48)
    osc = math.sin(2 * math.pi * (f - 7) / 10)
    arm_aim(Qt, "l", (0.85, -0.35, 0.4), (0.35 + 0.5 * osc, -0.4, 0.85), w, hand=(0.3 + 0.55 * osc, -0.45, 0.85))
    curl(Qt, "l", ("index", "middle", "ring", "pinky"), -10, w)
    pre(Qt, "head", (0, 1, 0), 10 * w)
    write(f, Qt, hip, jaw=0.6 * w, blink=w, happy=w, tail=1.5, tail_speed=2)

@clip("spin", 32)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 5, 24, 32)
    arm_aim(Qt, "l", *UP, w); arm_aim(Qt, "r", *UP, w)
    lift, cr, tk = jump(f, 5, 18, 0.2)
    spin = 360 * smooth((f - 4) / 20) if f >= 4 else 0
    write(f, Qt, hip, ik=True, lift=lift, drop=cr, tuck=tk, spin=spin, jaw=1.0 * w, blink=w, happy=w, tail=1.8)

@clip("yawn", 56)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 4, 20, 38, 54)
    arm_aim(Qt, "l", (0.75, 0.0, 0.66), (0.55, 0.05, 0.83), w); arm_aim(Qt, "r", (0.75, 0.0, 0.66), (0.55, 0.05, 0.83), w)
    pre(Qt, "head", (1, 0, 0), -16 * w); pre(Qt, "spine_02", (1, 0, 0), -6 * w)
    write(f, Qt, hip, jaw=1.45 * env(f, 6, 22, 34, 48), blink=env(f, 4, 12, 44, 52), tail=0.4, tail_lift=0.5 * w)

ROAR = src(S2, "Zombie_Idle_Loop")
@clip("roar", 40)
def _(f):
    Qt, hip = ROAR(f)
    Qi = IDLE(f)
    w = env(f, 0, 6, 30, 40)
    Qt, hip = blendQt(Qi, (Qt, hip), 0.6 * w)
    pre(Qt, "head", (1, 0, 0), -26 * env(f, 4, 9, 28, 36))
    curl(Qt, "l", ("index", "middle", "ring", "pinky", "thumb"), 35, w); curl(Qt, "r", ("index", "middle", "ring", "pinky", "thumb"), 35, w)
    shake = 0.006 * math.sin(f * 2.9) * env(f, 8, 10, 26, 30)
    write(f, Qt, hip, jaw=1.5 * env(f, 4, 9, 28, 36), blink=0.35 * w, shift=(shake, 0), tail=1.2, tail_lift=0.6 * w, tail_speed=3)

@clip("lookAround", 64)
def _(f):
    Qt, hip = IDLE(f)
    turn = -32 * env(f, 0, 10, 20, 30) + 32 * env(f, 24, 36, 48, 60)
    pre(Qt, "spine_03", (0, 0, 1), turn * 0.3); pre(Qt, "head", (0, 0, 1), turn * 0.7)
    write(f, Qt, hip, blink=blink_at(f, [22, 46]), tail=0.8)

@clip("hop", 36)
def _(f):
    Qt, hip = IDLE(f)
    lift = cr = tk = 0
    for a in (4, 15, 26):
        l, c, t = jump(f, a, 8, 0.07); lift += l; cr += c; tk += t
    arm_aim(Qt, "l", (0.8, -0.2, 0.2), (0.6, -0.4, 0.4), 0.6); arm_aim(Qt, "r", (0.8, -0.2, 0.2), (0.6, -0.4, 0.4), 0.6)
    write(f, Qt, hip, ik=True, lift=lift, drop=cr, tuck=tk, jaw=0.5, tail=1.6, tail_speed=3)

@clip("beg", 40)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 5, 32, 40)
    osc = 0.5 + 0.5 * math.sin(2 * math.pi * f / 9)
    for s in ("l", "r"):
        arm_aim(Qt, s, (0.35, -0.7, 0.35 + 0.35 * osc), (0.15, -0.75, 0.45 + 0.4 * osc), w)
    lift = 0.03 * abs(math.sin(2 * math.pi * f / 18)) * w
    pre(Qt, "head", (0, 1, 0), 10 * w); pre(Qt, "head", (1, 0, 0), -6 * w)
    write(f, Qt, hip, ik=True, lift=lift, jaw=0.7 * w, blink=w, happy=w, tail=2, tail_speed=4)

@clip("growl", 36)
def _(f):
    Qt, hip = ROAR(f)
    Qi = IDLE(f); w = env(f, 0, 6, 28, 36)
    Qt, hip = blendQt(Qi, (Qt, hip), 0.4 * w)
    pre(Qt, "head", (1, 0, 0), -4 * w)
    write(f, Qt, hip, ik=True, jaw=(0.25 + 0.08 * math.sin(f * 2.2)) * w, blink=0.4 * w, drop=-0.012 * w, tail=0.6, tail_lift=0.4 * w)

@clip("gape", 44)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 8, 32, 44)
    pre(Qt, "head", (1, 0, 0), -15 * w)
    write(f, Qt, hip, jaw=1.5 * w, blink=0.0, tail=0.5)

@clip("burp", 30)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 5, 16, 28)
    pre(Qt, "head", (1, 0, 0), -12 * w); pre(Qt, "spine_03", (1, 0, 0), -5 * w)
    write(f, Qt, hip, jaw=0.85 * w, blink=0.5 * w, tail=0.6)

@clip("fart", 34)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 3, 24, 34)
    lift, cr, tk = jump(f, 4, 8, 0.07)
    write(f, Qt, hip, ik=True, lift=lift, drop=cr, tuck=tk, jaw=0.1 * w, blink=w, tail=0.4, tail_lift=1.4 * env(f, 3, 7, 12, 20))

SLEEP = src(S1, "Crouch_Idle_Loop", speed=0.5)
@clip("sleep", 140, loop=True)
def _(f):
    Qt, hip = blendQt(IDLE(f), SLEEP(f), 0.55)
    br = math.sin(2 * math.pi * f / 70)
    pre(Qt, "head", (1, 0, 0), 6 + 3 * br); pre(Qt, "spine_02", (1, 0, 0), 2 * br)
    write(f, Qt, hip, jaw=0.15 + 0.1 * (0.5 + 0.5 * br), blink=1.0, tail=0.25, tail_speed=0.5, frill=0.3)

CROUCH = src(S1, "Crouch_Idle_Loop", speed=0.0)
@clip("hatch", 64)
def _(f):
    A = blendQt(IDLE(0), CROUCH(0), 0.8); B = IDLE(f)
    w = env(f, 10, 26)
    Qt, hip = blendQt(A, B, w)
    pre(Qt, "head", (1, 0, 0), 18 * (1 - w))
    ta = env(f, 24, 32, 52, 62)
    arm_aim(Qt, "l", *UP, ta); arm_aim(Qt, "r", *UP, ta)
    lift, cr, tk = jump(f, 28, 10, 0.08)
    write(f, Qt, hip, ik=False, lift=lift, drop=cr, tuck=tk, jaw=1.0 * ta, blink=max(1 - env(f, 14, 20), ta), happy=ta,
          tail=0.3 + 1.5 * ta, tail_speed=2)

@clip("point", 44)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 8, 34, 44)
    arm_aim(Qt, "l", (0.8, -0.55, 0.25), (0.7, -0.7, 0.2), w)
    curl(Qt, "l", ("middle", "ring", "pinky"), 70, w); curl(Qt, "l", ("thumb",), 30, w); curl(Qt, "l", ("index",), -5, w)
    pre(Qt, "head", (0, 0, 1), 18 * w); pre(Qt, "head", (1, 0, 0), 6 * w)
    write(f, Qt, hip, jaw=0.4 * w, blink=blink_at(f, [30]), tail=1.0)

YES = src(S2, "Yes")
@clip("yes", 60)
def _(f):
    Qt, hip = YES(f)
    w = env(f, 0, 6, 50, 60)
    write(f, Qt, hip, jaw=0.6 * w, blink=w, happy=w, tail=1.4, tail_speed=2)

NO = src(S2, "Idle_No_Loop")
@clip("no", 60)
def _(f):
    Qt, hip = NO(f)
    write(f, Qt, hip, jaw=0.0, blink=blink_at(f, [44]), tail=0.6)


@clip("clap", 40)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 5, 32, 40)
    osc = 0.5 + 0.5 * math.cos(2 * math.pi * (f - 5) / 7)
    for s in ("l", "r"):
        arm_aim(Qt, s, (0.55, -0.8, 0.2), (-0.05 + 0.45 * osc, -0.95, 0.25), w, hand=(-0.15 + 0.4 * osc, -0.9, 0.35))
    lift = 0.0
    for a in (8, 22):
        l, c_, t_ = jump(f, a, 7, 0.04); lift += l
    write(f, Qt, hip, ik=True, lift=lift, jaw=0.9 * w, blink=w, happy=w, tail=1.8, tail_speed=3)

@clip("fistPump", 36)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 5, 28, 36)
    pump = 0.5 + 0.5 * math.cos(2 * math.pi * (f - 5) / 8)
    arm_aim(Qt, "l", (0.75, -0.3, 0.6), (0.3, -0.35, 0.6 + 0.45 * pump), w)
    curl(Qt, "l", ("index", "middle", "ring", "pinky"), 85, w); curl(Qt, "l", ("thumb",), 45, w)
    lift, cr, tk = jump(f, 6, 12, 0.13)
    pre(Qt, "spine_02", (0, 1, 0), -6 * w); pre(Qt, "head", (1, 0, 0), -8 * w)
    write(f, Qt, hip, ik=True, lift=lift, drop=cr, tuck=tk, jaw=1.3 * w, blink=w, happy=w, tail=1.8, tail_speed=3)

@clip("wink", 30)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 5, 22, 30)
    arm_aim(Qt, "r", (0.8, -0.4, 0.35), (0.45, -0.55, 0.7), w)
    pre(Qt, "head", (0, 1, 0), -12 * w)
    write(f, Qt, hip, jaw=0.7 * w, blinkL=w, blinkR=0.0, tail=1.4, tail_speed=2)

@clip("sad", 52)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 9, 40, 52)
    for s in ("l", "r"):
        arm_aim(Qt, s, (0.25, -0.35, -0.9), (-0.25, -0.6, -0.75), w)
    pre(Qt, "spine_02", (1, 0, 0), 8 * w); pre(Qt, "head", (1, 0, 0), 16 * w); pre(Qt, "head", (0, 1, 0), 8 * w)
    write(f, Qt, hip, ik=True, drop=-0.012 * w, jaw=0.0, blink=0.45 * w, tail=0.2, tail_lift=-1.0 * w, frill=0.4)

@clip("surprised", 30)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 3, 20, 30)
    for s in ("l", "r"):
        arm_aim(Qt, s, (0.85, -0.25, 0.45), (0.6, -0.3, 0.75), w)
        curl(Qt, s, ("index", "middle", "ring", "pinky", "thumb"), -15, w)
    lift, cr, tk = jump(f, 2, 8, 0.07)
    pre(Qt, "head", (1, 0, 0), -12 * w); pre(Qt, "spine_03", (1, 0, 0), -5 * w)
    write(f, Qt, hip, ik=True, lift=lift, drop=cr, tuck=tk, jaw=1.1 * w, blink=0.0, tail=1.5, tail_lift=0.8 * w, tail_speed=3)

@clip("march", 48, loop=True)
def _(f):
    Qt, hip = IDLE(f)
    ph = 2 * math.pi * f / 24
    for s, sx in (("l", 1), ("r", -1)):
        sw = math.sin(ph + (0 if s == "l" else math.pi))
        arm_aim(Qt, s, (0.35, -0.45 * sw, -0.85), (0.3, -0.75 * sw - 0.2, -0.6), 0.9)
    tl = 0.06 * max(0.0, math.sin(ph)); tr = 0.06 * max(0.0, -math.sin(ph))
    pre(Qt, "spine_01", (0, 1, 0), 5 * math.sin(ph)); pre(Qt, "head", (0, 1, 0), -4 * math.sin(ph))
    bob = 0.012 * abs(math.sin(ph))
    write(f, Qt, hip, ik=True, lift=bob, tuckL=tl, tuckR=tr, jaw=0.3, blink=blink_at(f, [30]), tail=1.5, tail_speed=2)

@clip("celebrate", 64)
def _(f):
    Qt, hip = IDLE(f)
    w = env(f, 0, 5, 56, 64)
    wave = math.sin(2 * math.pi * f / 10)
    for s in ("l", "r"):
        arm_aim(Qt, s, (0.8, -0.3, 0.52), (0.45 + 0.3 * wave, -0.4, 0.8), w)
    lift = cr = tk = 0
    for a, h in ((5, 0.14), (20, 0.14), (36, 0.26)):
        l, c_, t_ = jump(f, a, 13 if h < 0.2 else 20, h); lift += l; cr += c_; tk += t_
    spin = 360 * smooth((f - 36) / 20) if f >= 36 else 0
    write(f, Qt, hip, ik=True, lift=lift, drop=cr, tuck=tk, spin=spin, jaw=1.3 * w, blink=w, happy=w, tail=2, tail_speed=4)

RUN = src(S1, "Jog_Fwd_Loop")
@clip("run", 22, loop=True)
def _(f):
    Qt, hip = RUN(f)
    write(f, Qt, hip, jaw=0.8, tail=1.6, tail_speed=4, frill=1.5)

# ------------------------------------------------------------------ bake
made = []
for name, (frames, fn, loop) in CLIPS.items():
    if ONLY and name not in ONLY: continue
    T.begin(name)
    for f in range(frames + 1 if loop else frames):
        fn(f)
    act = bpy.data.actions[name]
    act["loop"] = loop
    made.append((name, frames, loop))
    print("CLIP", name, frames, "loop" if loop else "")
for S in (S1, S2):
    bpy.data.objects.remove(S.arm)
for a in list(bpy.data.actions):
    if a.name not in CLIPS: bpy.data.actions.remove(a)
json.dump(made, open(os.path.join(HERE, "clips.json"), "w"))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "dino_clips.blend"))
print("SAVED", len(made))
