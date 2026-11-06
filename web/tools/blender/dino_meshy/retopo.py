"""Stage 1: normalise Meshy HP mesh, voxel + QuadriFlow symmetric quad retopo. Saves retopo.blend"""
import bpy, bmesh, os, sys, time
import numpy as np
from mathutils import Vector, Matrix
HERE=os.path.dirname(os.path.abspath(__file__))
TF=int(sys.argv[sys.argv.index("--")+1]) if "--" in sys.argv else 14000
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath="/Users/apicard/Downloads/model (2).glb")
hp=[o for o in bpy.data.objects if o.type=='MESH'][0]; hp.name="HP"
for o in list(bpy.data.objects):
    if o is not hp: bpy.data.objects.remove(o)
hp.parent=None
bpy.context.view_layer.objects.active=hp; hp.select_set(True)
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
co=np.array([v.co[:] for v in hp.data.vertices])
mn,mx=co.min(0),co.max(0); s=1.0/(mx[2]-mn[2])
feet=co[co[:,2]<mn[2]+0.06*(mx[2]-mn[2])]
cx=(mn[0]+mx[0])/2; cy=feet[:,1].mean()
hp.data.transform(Matrix.Scale(s,4)@Matrix.Translation((-cx,-cy,-mn[2])))
hp.data.update()
co=np.array([v.co[:] for v in hp.data.vertices])
# symmetry check: mirror verts and nearest distance
from mathutils.kdtree import KDTree
kd=KDTree(len(co)); [kd.insert(c,i) for i,c in enumerate(co)]; kd.balance()
idx=np.random.default_rng(0).choice(len(co),3000,replace=False)
d=[kd.find((-co[i,0],co[i,1],co[i,2]))[2] for i in idx]
print("SYM median/95%",np.median(d),np.percentile(d,95))
print("BBOX",co.min(0).round(3),co.max(0).round(3))
# proxy
lp=hp.copy(); lp.data=hp.data.copy(); lp.name="Dino"; bpy.context.scene.collection.objects.link(lp)
lp.data.materials.clear()
t=time.time()
m=lp.modifiers.new("v",'REMESH'); m.mode='VOXEL'; m.voxel_size=0.0035; m.use_smooth_shade=True
bpy.ops.object.select_all(action='DESELECT'); bpy.context.view_layer.objects.active=lp; lp.select_set(True)
bpy.ops.object.modifier_apply(modifier="v")
# keep largest connected piece only
bm=bmesh.new(); bm.from_mesh(lp.data); bm.verts.ensure_lookup_table()
seen=set(); comps=[]
for v in bm.verts:
    if v.index in seen: continue
    st=[v]; comp=[]; seen.add(v.index)
    while st:
        x=st.pop(); comp.append(x)
        for e in x.link_edges:
            y=e.other_vert(x)
            if y.index not in seen: seen.add(y.index); st.append(y)
    comps.append(comp)
comps.sort(key=len,reverse=True); print("voxel comps",[len(c) for c in comps[:5]])
for c in comps[1:]: bmesh.ops.delete(bm,geom=c,context='VERTS')
for it in range(6):
    bad=[v for v in bm.verts if not v.is_manifold]
    print("nonmanifold verts",len(bad))
    if not bad: break
    bmesh.ops.delete(bm,geom=bad,context='VERTS')
    bnd=[e for e in bm.edges if e.is_boundary]
    bmesh.ops.holes_fill(bm,edges=bnd,sides=0)
    bmesh.ops.triangulate(bm,faces=[f for f in bm.faces if len(f.verts)>4])
    loose=[v for v in bm.verts if not v.link_faces]; bmesh.ops.delete(bm,geom=loose,context='VERTS')
bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
bm.to_mesh(lp.data); bm.free()
print("voxel verts",len(lp.data.vertices),time.time()-t)
lp.data.use_mirror_x=True
md=lp.modifiers.new('d','DECIMATE'); md.ratio=0.25; bpy.ops.object.modifier_apply(modifier='d')
from mathutils.bvhtree import BVHTree
ref=np.array([v.co[:] for v in lp.data.vertices])[::10]
best=None
for seed in range(1,7):
    q=lp.copy(); q.data=lp.data.copy(); bpy.context.scene.collection.objects.link(q)
    bpy.ops.object.select_all(action='DESELECT'); bpy.context.view_layer.objects.active=q; q.select_set(True)
    r=bpy.ops.object.quadriflow_remesh(use_mesh_symmetry=False,mode='FACES',target_faces=TF,seed=seed)
    bm=bmesh.new(); bm.from_mesh(q.data); tree=BVHTree.FromBMesh(bm); bm.free()
    d=np.array([tree.find_nearest(p)[3] for p in ref]); sc_=np.percentile(d,99.9)
    print("QF seed",seed,r,len(q.data.polygons),"p99.9",round(sc_,4),"max",round(d.max(),4))
    if 'FINISHED' in r and (best is None or sc_<best[0]):
        if best: bpy.data.objects.remove(best[1])
        best=(sc_,q)
    else: bpy.data.objects.remove(q)
bpy.data.objects.remove(lp); lp=best[1]; lp.name="Dino"
bpy.ops.object.select_all(action='DESELECT'); bpy.context.view_layer.objects.active=lp; lp.select_set(True)
sw=lp.modifiers.new("sw",'SHRINKWRAP'); sw.target=hp; sw.wrap_method='NEAREST_SURFACEPOINT'
bpy.ops.object.modifier_apply(modifier="sw")
from mathutils.kdtree import KDTree
for it in range(3):
    me=lp.data; bm=bmesh.new(); bm.from_mesh(me); tree=BVHTree.FromBMesh(bm); bm.free()
    d=np.array([tree.find_nearest(p)[3] for p in ref]); far=np.argsort(-d); far=far[d[far]>0.003]
    kd=KDTree(len(me.vertices)); [kd.insert(v.co,v.index) for v in me.vertices]; kd.balance()
    used=set()
    for i in far:
        co_,j,_=kd.find(ref[i])
        if j in used: continue
        used.add(j); me.vertices[j].co=ref[i]
    print("SNAP it",it,"far",len(far),"moved",len(used),"max",round(d.max(),4))
# symmetry of result
co2=np.array([v.co[:] for v in lp.data.vertices])
print("RT x-range",co2[:,0].min(),co2[:,0].max(),"verts on x<0",(co2[:,0]<-1e-4).sum(),"x>0",(co2[:,0]>1e-4).sum())
nq=sum(1 for p in lp.data.polygons if len(p.vertices)==4); print("quads",nq,"of",len(lp.data.polygons))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE,"retopo.blend"))
