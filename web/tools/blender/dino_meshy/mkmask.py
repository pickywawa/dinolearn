import bpy, numpy as np, os, colorsys
HERE=os.path.dirname(os.path.abspath(__file__))
img=bpy.data.images.load(os.path.join(HERE,"tex","dino_basecolor.png")); W,H=img.size
px=np.array(img.pixels[:]).reshape(H,W,4)[:,:,:3]
mx=px.max(2); mn=px.min(2); d=mx-mn+1e-6
r,g,b=px[...,0],px[...,1],px[...,2]
h=np.where(mx==r,((g-b)/d)%6,np.where(mx==g,(b-r)/d+2,(r-g)/d+4))*60
s=d/(mx+1e-6); v=mx
def band(x,a,b,soft): return np.clip(np.minimum((x-a)/soft+1,(b-x)/soft+1),0,1)
purple=band(h,235,300,15)*np.clip((s-0.18)/0.12,0,1)
beige=band(h,22,62,10)*np.clip((v-0.45)/0.1,0,1)*np.clip((0.75-s)/0.1,0,1)*np.clip((s-0.08)/0.08,0,1)
print("purple frac",purple.mean().round(3),"beige frac",beige.mean().round(3))
P=px[purple>0.9]; B=px[beige>0.9]
lum=lambda c:(c*[0.2126,0.7152,0.0722]).sum(-1)
print("REF purple median (linear)",np.median(P,0).round(4),"lum",np.median(lum(P)).round(4))
print("REF beige median (linear)",np.median(B,0).round(4),"lum",np.median(lum(B)).round(4))
out=np.zeros((H,W,4)); out[...,0]=purple; out[...,1]=beige; out[...,3]=1
m=bpy.data.images.new("mask",W,H,alpha=False); m.pixels[:]=out.ravel()
m.filepath_raw=os.path.join(HERE,"tex","dino_mask.png"); m.file_format='PNG'; m.save()
m.scale(512,512); m.filepath_raw=os.path.join(HERE,"tex","dino_mask_512.png"); m.save()
