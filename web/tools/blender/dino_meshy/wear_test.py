import bpy, os, sys, json, math
from mathutils import Vector, Matrix
HERE=os.path.dirname(os.path.abspath(__file__)); sc=bpy.context.scene
A=json.load(open(os.path.join(HERE,"anchors.json")))
arm=bpy.data.objects["DinoRig"]; key=bpy.data.objects["Eyelids"].data.shape_keys
act=bpy.data.actions["idle"]
for ad,typ in ((arm.animation_data,'OBJECT'),(key.animation_data,'KEY')):
    ad.action=act; ad.action_slot=[s for s in act.slots if s.target_id_type==typ][0]
sc.frame_set(0)
# scale dino to game units (2.05)
for o in (arm,): o.scale=(2.05,2.05,2.05)
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE,"../../../public/models/items.glb"))
items={o.name:o for o in set(bpy.data.objects)-before if o.parent is None}
SLOT={"top-hat":"head","billed-cap":"head","crown":"head","womans-hat":"head","graduation-cap":"head","rescue-workers-helmet":"head","headphone":"head","hibiscus":"head",
"glasses":"eyes","sunglasses":"eyes","goggles":"eyes","ribbon":"neck","scarf":"neck","sports-medal":"neck","prayer-beads":"neck",
"cape-red":"back","cape-blue":"back","wing":"back","balloon":"hand","magic-wand":"hand","lollipop":"hand","sunflower":"hand","teddy-bear":"hand"}
for n,o in items.items():
    a=A[SLOT.get(n,"head")]
    M=Matrix.Translation(Vector(a["new"]))@Matrix.Scale(a["s"],4)@Matrix.Translation(-Vector(a["old"]))
    o.matrix_world=M@o.matrix_world
    o.hide_render=True
    for c in o.children_recursive: c.hide_render=True
sets=[["top-hat","glasses","scarf","cape-red","magic-wand"],["crown","sunglasses","ribbon","wing","balloon"],["billed-cap","goggles","sports-medal","cape-blue","teddy-bear"],["womans-hat","prayer-beads","lollipop"],["headphone","hibiscus","sunflower"],["graduation-cap","rescue-workers-helmet"]]
wo=bpy.data.worlds.new("w"); sc.world=wo; wo.use_nodes=True; nt=wo.node_tree
bg=next((n for n in nt.nodes if n.type=='BACKGROUND'),None) or nt.nodes.new("ShaderNodeBackground")
if not any(n.type=='OUTPUT_WORLD' for n in nt.nodes): nt.links.new(bg.outputs[0],nt.nodes.new("ShaderNodeOutputWorld").inputs[0])
bg.inputs[0].default_value=(0.8,0.85,0.95,1); bg.inputs[1].default_value=0.9
l=bpy.data.objects.new("l",bpy.data.lights.new("l",'SUN')); sc.collection.objects.link(l); l.rotation_euler=(0.8,0.1,-0.6); l.data.energy=2.4
cam=bpy.data.objects.new("c",bpy.data.cameras.new("c")); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=2.6
sc.render.engine='BLENDER_EEVEE'; sc.render.resolution_x=sc.render.resolution_y=360; sc.view_settings.view_transform='Standard'
os.makedirs(os.path.join(HERE,"wt"),exist_ok=True)
for i,st in enumerate(sets):
    for n,o in items.items():
        vis=n in st; o.hide_render=not vis
        for c in o.children_recursive: c.hide_render=not vis
    for tag,loc in (("f",(0,-6,1.1)),("s",(6,0,1.1)),("q",(4.2,-4.2,1.6))):
        cam.location=loc; cam.rotation_euler=(Vector((0,0,1.1))-Vector(loc)).to_track_quat('-Z','Y').to_euler()
        sc.render.filepath=os.path.join(HERE,"wt",f"{i}_{tag}.png"); bpy.ops.render.render(write_still=True)
