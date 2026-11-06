import bpy, os, time
HERE=os.path.dirname(os.path.abspath(__file__))
sc=bpy.context.scene
lp=bpy.data.objects["Dino"]; hp=bpy.data.objects["HP"]
for p in lp.data.polygons: p.use_smooth=True
bpy.ops.object.select_all(action='DESELECT'); bpy.context.view_layer.objects.active=lp; lp.select_set(True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.004, area_weight=0.0, scale_to_bounds=False)
bpy.ops.uv.pack_islands(margin=0.004, rotate=True)
bpy.ops.object.mode_set(mode='OBJECT')
R=2048
def img(n,col=True):
    i=bpy.data.images.new(n,R,R,alpha=False,float_buffer=False); 
    if not col: i.colorspace_settings.name='Non-Color'
    i.filepath_raw=os.path.join(HERE,"tex",n+".png"); i.file_format='PNG'; return i
ic=img("dino_basecolor"); inn=img("dino_normal",False)
m=bpy.data.materials.new("DinoSkin"); m.use_nodes=True; nt=m.node_tree; nt.nodes.clear()
out=nt.nodes.new("ShaderNodeOutputMaterial"); p=nt.nodes.new("ShaderNodeBsdfPrincipled"); nt.links.new(p.outputs[0],out.inputs[0])
p.inputs["Roughness"].default_value=0.55
tc=nt.nodes.new("ShaderNodeTexImage"); tc.image=ic; nt.links.new(tc.outputs[0],p.inputs["Base Color"])
tn=nt.nodes.new("ShaderNodeTexImage"); tn.image=inn
nm=nt.nodes.new("ShaderNodeNormalMap"); nt.links.new(tn.outputs[0],nm.inputs["Color"]); nt.links.new(nm.outputs[0],p.inputs["Normal"])
lp.data.materials.clear(); lp.data.materials.append(m)
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=4
hp.hide_render=False; hp.hide_set(False)
bpy.ops.object.select_all(action='DESELECT'); hp.select_set(True); lp.select_set(True); bpy.context.view_layer.objects.active=lp
b=sc.render.bake; b.use_selected_to_active=True; b.cage_extrusion=0.03; b.max_ray_distance=0.0; b.margin=8
for node,typ in ((tc,'DIFFUSE'),(tn,'NORMAL')):
    nt.nodes.active=node; t=time.time()
    kw=dict(type=typ)
    if typ=='DIFFUSE': kw.update(pass_filter={'COLOR'})
    else: kw.update(normal_space='TANGENT')
    print("BAKE",typ,bpy.ops.object.bake(**kw),round(time.time()-t,1))
    node.image.save()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE,"baked.blend"))
