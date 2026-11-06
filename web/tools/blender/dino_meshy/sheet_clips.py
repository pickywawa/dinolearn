import bpy, os, sys, json
from mathutils import Vector
HERE=os.path.dirname(os.path.abspath(bpy.data.filepath)); sc=bpy.context.scene
arm=bpy.data.objects["DinoRig"]; key=bpy.data.objects["Eyelids"].data.shape_keys
clips=json.load(open(os.path.join(HERE,"clips.json")))
ONLY=[a[5:] for a in sys.argv if a.startswith("ONLY=")]
if ONLY: clips=[c for c in clips if c[0] in ONLY[0].split(",")]
def assign(act):
    for idb,ad,typ in ((arm,arm.animation_data,'OBJECT'),(key,key.animation_data,'KEY')):
        ad.action=act
        if hasattr(ad,"action_slot"):
            sl=[s for s in act.slots if s.target_id_type==typ]
            if sl: ad.action_slot=sl[0]
print("SLOTS",[ (s.identifier) for s in bpy.data.actions[clips[0][0]].slots] if hasattr(bpy.data.actions[clips[0][0]],"slots") else None)
wo=bpy.data.worlds.new("w"); sc.world=wo; wo.use_nodes=True; nt=wo.node_tree
bg=next((n for n in nt.nodes if n.type=='BACKGROUND'),None) or nt.nodes.new("ShaderNodeBackground")
if not any(n.type=='OUTPUT_WORLD' for n in nt.nodes): nt.links.new(bg.outputs[0],nt.nodes.new("ShaderNodeOutputWorld").inputs[0])
bg.inputs[0].default_value=(0.8,0.85,0.95,1); bg.inputs[1].default_value=0.8
l=bpy.data.objects.new("l",bpy.data.lights.new("l",'SUN')); sc.collection.objects.link(l); l.rotation_euler=(0.8,0.1,-0.6); l.data.energy=2.4
cam=bpy.data.objects.new("c",bpy.data.cameras.new("c")); sc.collection.objects.link(cam); sc.camera=cam; cam.data.lens=70
cam.location=(1.3,-2.6,0.95); cam.rotation_euler=(Vector((0,0,0.55))-cam.location).to_track_quat('-Z','Y').to_euler()
sc.render.engine='BLENDER_EEVEE'; sc.render.resolution_x=sc.render.resolution_y=280; sc.view_settings.view_transform='Standard'
os.makedirs(os.path.join(HERE,"prev2"),exist_ok=True)
for name,frames,loop in clips:
    assign(bpy.data.actions[name])
    for k in range(6):
        f=round(frames*k/6+frames/12); sc.frame_set(f)
        sc.render.filepath=os.path.join(HERE,"prev2",f"{name}_{k}.png"); bpy.ops.render.render(write_still=True)
