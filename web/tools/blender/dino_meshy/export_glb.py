import bpy, os, json, struct
HERE=os.path.dirname(os.path.abspath(bpy.data.filepath))
arm=bpy.data.objects["DinoRig"]; body=bpy.data.objects["Dino"]; lid=bpy.data.objects["Eyelids"]
body.data.name="DinoBody"
clips=json.load(open(os.path.join(HERE,"clips.json")))
# rest pose (no active action) so the bind pose is the T-pose
arm.animation_data.action=None; lid.data.shape_keys.animation_data.action=None
for pb in arm.pose.bones: pb.rotation_quaternion=(1,0,0,0); pb.location=(0,0,0)
for kb in lid.data.shape_keys.key_blocks[1:]: kb.value=0
# one NLA track per clip on both the armature and the shape keys -> exporter merges by track name
for idb, typ in ((arm,'OBJECT'),(lid.data.shape_keys,'KEY')):
    ad=idb.animation_data
    for t in list(ad.nla_tracks): ad.nla_tracks.remove(t)
    for name,frames,loop in clips:
        act=bpy.data.actions[name]
        tr=ad.nla_tracks.new(); tr.name=name
        st=tr.strips.new(name,0,act)
        sl=[s for s in act.slots if s.target_id_type==typ]
        if sl and hasattr(st,"action_slot"): st.action_slot=sl[0]
        tr.mute=False
bpy.ops.object.select_all(action='DESELECT')
for o in (arm,body,lid): o.select_set(True)
import sys
out=next((a[4:] for a in sys.argv if a.startswith("OUT=")), os.path.join(HERE,"dino_anim.glb"))
RES=int(next((a[4:] for a in sys.argv if a.startswith("RES=")), "0"))
if RES:
    for im in bpy.data.images:
        if im.size[0]>RES: im.scale(RES,RES)
bpy.ops.export_scene.gltf(filepath=out, use_selection=True, export_format='GLB', export_animation_mode='NLA_TRACKS',
    export_def_bones=True, export_morph=True, export_skins=True, export_image_format='JPEG', export_image_quality=90,
    export_force_sampling=True, export_optimize_animation_size=True)
raw=open(out,"rb").read(); jl=struct.unpack("<I",raw[12:16])[0]; js=json.loads(raw[20:20+jl])
print("ANIMS",[(a["name"],len(a["channels"]),round(max(js["accessors"][s["input"]]["max"][0] for s in a["samplers"]),2)) for a in js["animations"]])
print("SIZE",len(raw))
