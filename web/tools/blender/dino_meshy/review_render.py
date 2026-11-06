import bpy, os, sys, json, math
from mathutils import Vector
HERE=os.path.dirname(os.path.abspath(bpy.data.filepath)); sc=bpy.context.scene
arm=bpy.data.objects["DinoRig"]; key=bpy.data.objects["Eyelids"].data.shape_keys
clips=json.load(open(os.path.join(HERE,"clips.json")))
def assign(act):
    for ad,typ in ((arm.animation_data,'OBJECT'),(key.animation_data,'KEY')):
        ad.action=act
        sl=[s for s in act.slots if s.target_id_type==typ]
        if sl: ad.action_slot=sl[0]
wo=bpy.data.worlds.new("w"); sc.world=wo; wo.use_nodes=True; nt=wo.node_tree
bg=next((n for n in nt.nodes if n.type=='BACKGROUND'),None) or nt.nodes.new("ShaderNodeBackground")
if not any(n.type=='OUTPUT_WORLD' for n in nt.nodes): nt.links.new(bg.outputs[0],nt.nodes.new("ShaderNodeOutputWorld").inputs[0])
bg.inputs[0].default_value=(0.78,0.84,0.95,1); bg.inputs[1].default_value=0.75
for n,rot,en in (("key",(math.radians(50),math.radians(10),math.radians(-35)),2.4),("rim",(math.radians(60),0,math.radians(160)),1.2)):
    l=bpy.data.objects.new(n,bpy.data.lights.new(n,'SUN')); sc.collection.objects.link(l); l.rotation_euler=rot; l.data.energy=en; l.data.angle=0.2
bpy.ops.mesh.primitive_plane_add(size=60); fl=bpy.context.object
fm=bpy.data.materials.new("floor"); fm.use_nodes=True; nt=fm.node_tree
p=next((n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'),None)
if p is None:
    nt.nodes.clear(); p=nt.nodes.new("ShaderNodeBsdfPrincipled"); nt.links.new(p.outputs[0],nt.nodes.new("ShaderNodeOutputMaterial").inputs[0])
p.inputs["Base Color"].default_value=(0.80,0.84,0.92,1); p.inputs["Roughness"].default_value=0.9; fl.data.materials.append(fm)
cam=bpy.data.objects.new("c",bpy.data.cameras.new("c")); sc.collection.objects.link(cam); sc.camera=cam; cam.data.lens=50
cam.location=(0.6,-2.35,0.82); cam.rotation_euler=(Vector((0,0,0.52))-cam.location).to_track_quat('-Z','Y').to_euler()
sc.render.engine='BLENDER_EEVEE'; sc.view_settings.view_transform='Standard'; sc.render.resolution_x=sc.render.resolution_y=720
for name,frames,loop in clips:
    assign(bpy.data.actions[name])
    d=os.path.join(HERE,"rframes",name); os.makedirs(d,exist_ok=True)
    for f in range(frames):
        sc.frame_set(f); sc.render.filepath=os.path.join(d,f"{f:04d}.png"); bpy.ops.render.render(write_still=True)
    print("RENDERED",name,flush=True)
