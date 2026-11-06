import bpy, numpy as np, os
from mathutils import Vector, Matrix
HERE=os.path.dirname(os.path.abspath(__file__))
sc=bpy.context.scene; arm=bpy.data.objects["DinoRig"]; body=bpy.data.objects["Dino"]
key=bpy.data.objects["Eyelids"].data.shape_keys
act=bpy.data.actions["idle"]
for ad,typ in ((arm.animation_data,'OBJECT'),(key.animation_data,'KEY')):
    ad.action=act; ad.action_slot=[s for s in act.slots if s.target_id_type==typ][0]
sc.frame_set(0)
dg=bpy.context.evaluated_depsgraph_get(); me=body.evaluated_get(dg).to_mesh()
co=np.array([v.co[:] for v in me.vertices])*2.05
def q(m,txt):
    s=co[m]; print(txt, len(s), s.min(0).round(3) if len(s) else None, s.max(0).round(3) if len(s) else None)
x,y,z=co.T
q((abs(x)<0.04)&(y<0.0)&(y>-0.25)&(z>1.4),"head top midline (front of frill)")
q((abs(z-1.29)<0.03),"eye-level slice")
q((abs(z-0.88)<0.03)&(abs(x)<0.4),"neck slice")
q((abs(z-0.62)<0.03)&(abs(x)<0.4),"chest slice")
for b in ("head","neck_01","spine_03","hand_l","lowerarm_l"):
    pb=arm.pose.bones[b]; print("BONE",b,tuple(round(c*2.05,3) for c in arm.matrix_world@pb.head),tuple(round(c*2.05,3) for c in arm.matrix_world@pb.tail))
