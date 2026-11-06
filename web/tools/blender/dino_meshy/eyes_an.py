import bpy,numpy as np,os
HERE=os.path.dirname(os.path.abspath(__file__))
o=bpy.data.objects["Dino"]; me=o.data
img=bpy.data.images["dino_basecolor"]; W,H=img.size
px=np.array(img.pixels[:]).reshape(H,W,4)
uv=np.zeros((len(me.loops),2)); me.uv_layers.active.data.foreach_get("uv",uv.ravel())
vi=np.zeros(len(me.loops),int); me.loops.foreach_get("vertex_index",vi)
col=np.zeros((len(me.vertices),3)); 
xs=np.clip((uv[:,0]*W).astype(int),0,W-1); ys=np.clip((uv[:,1]*H).astype(int),0,H-1)
col[vi]=px[ys,xs,:3]
co=np.array([v.co[:] for v in me.vertices])
r,g,b=col.T; mx=col.max(1); mn=col.min(1); sat=(mx-mn)/(mx+1e-6)
purple=(b>=r)&(r>g*1.05)&(sat>0.3)
face=(np.abs(co[:,0])<0.3)&(co[:,1]<-0.05)&(co[:,2]>0.55)&(co[:,2]<0.82)
eye=face&~purple&~((r>0.6)&(g>0.5)&(b<0.6))  # exclude beige horn
for sx in (1,-1):
    m=eye&(co[:,0]*sx>0.05)
    c=co[m]; print("EYE",sx,len(c),"min",c.min(0).round(3),"max",c.max(0).round(3),"mean",c.mean(0).round(3))
    # sphere fit
    A=np.c_[2*c,np.ones(len(c))]; f=(c**2).sum(1); sol=np.linalg.lstsq(A,f,rcond=None)[0]
    cen=sol[:3]; rad=np.sqrt(sol[3]+cen@cen); res=np.linalg.norm(c-cen,axis=1)-rad
    print("SPH",sx,cen.round(3),round(rad,3),"res std",res.std().round(4))
np.save(os.path.join(HERE,"eyemask.npy"),eye)
