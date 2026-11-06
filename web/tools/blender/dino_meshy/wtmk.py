import subprocess
rows=[]
for i in range(6):
    subprocess.run(["/opt/homebrew/bin/ffmpeg","-loglevel","error","-y","-i",f"wt/{i}_f.png","-i",f"wt/{i}_s.png","-i",f"wt/{i}_q.png","-filter_complex","hstack=3",f"wt/row{i}.png"],check=True)
for a,b in ((0,3),(3,6)):
    args=sum([["-i",f"wt/row{i}.png"] for i in range(a,b)],[])
    subprocess.run(["/opt/homebrew/bin/ffmpeg","-loglevel","error","-y"]+args+["-filter_complex","vstack=3",f"wt/sheet{a}.png"],check=True)
