"""Icône de l'appli (écran d'accueil) : la tête du dino, de trois quarts, sur fond bleu ciel → public/icons/."""
import bpy, os, math
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(bpy.data.filepath))
OUT = os.path.join(HERE, "../../../public/icons"); os.makedirs(OUT, exist_ok=True)
sc = bpy.context.scene
arm = bpy.data.objects["DinoRig"]; key = bpy.data.objects["Eyelids"].data.shape_keys
act = bpy.data.actions["idle"]
for ad, typ in ((arm.animation_data, 'OBJECT'), (key.animation_data, 'KEY')):
    ad.action = act; ad.action_slot = [s for s in act.slots if s.target_id_type == typ][0]
sc.frame_set(0)
wo = bpy.data.worlds.new("w"); sc.world = wo; wo.use_nodes = True; nt = wo.node_tree
bg = next((n for n in nt.nodes if n.type == 'BACKGROUND'), None) or nt.nodes.new("ShaderNodeBackground")
if not any(n.type == 'OUTPUT_WORLD' for n in nt.nodes): nt.links.new(bg.outputs[0], nt.nodes.new("ShaderNodeOutputWorld").inputs[0])
bg.inputs[0].default_value = (0.75, 0.88, 1.0, 1); bg.inputs[1].default_value = 1.0
for n, rot, en in (("key", (math.radians(50), math.radians(10), math.radians(-35)), 2.6), ("rim", (math.radians(60), 0, math.radians(160)), 1.2)):
    l = bpy.data.objects.new(n, bpy.data.lights.new(n, 'SUN')); sc.collection.objects.link(l); l.rotation_euler = rot; l.data.energy = en
cam = bpy.data.objects.new("c", bpy.data.cameras.new("c")); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 100
cam.location = (0.75, -2.5, 1.0); cam.rotation_euler = (Vector((0.02, 0.0, 0.66)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.render.engine = 'BLENDER_EEVEE'; sc.view_settings.view_transform = 'Standard'
sc.render.resolution_x = sc.render.resolution_y = 512; sc.render.film_transparent = False
sc.render.filepath = os.path.join(OUT, "icon-512.png"); bpy.ops.render.render(write_still=True)
