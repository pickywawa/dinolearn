"""
Cris d'animaux : garde le cri le plus fort de chaque enregistrement, normalisé, en MP3 mono
léger, dans public/sfx/animals/. Les fichiers d'origine (BigSoundBank, CC0) sont nommés
par animal (cow.ogg, dog.mp3…) dans le dossier donné.
Usage : python3 scripts/animal-cries.py <dossier des enregistrements>
Puis ajouter l'animal à RECORDED_ANIMALS (src/domain/cries.ts) et à public/sfx/animals/CREDITS.txt.
"""
import subprocess, sys, array, os, glob
src = sys.argv[1]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'sfx', 'animals')
# Longueur gardée : le cri le plus fort, sans le reste de l'enregistrement.
WINDOW = {'donkey': 3.5, 'duck': 2.2, 'frog': 2.0, 'mouse': 2.0, 'rooster': 2.4, 'horse': 1.8, 'owl': 1.4, 'sheep': 1.0,
          'cow': 2.5, 'dog': 1.6, 'cat': 1.6, 'hen': 2.0, 'bee': 2.0, 'chick': 2.0, 'pig': 1.8, 'turkey': 2.0, 'snake': 1.8}
RATE = 22050
for f in sorted(glob.glob(os.path.join(src, '*.*'))):
    name = os.path.splitext(os.path.basename(f))[0]
    if name not in WINDOW: continue
    win = WINDOW[name]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(RATE), '-f', 's16le', '-'], capture_output=True).stdout
    pcm = array.array('h'); pcm.frombytes(raw)
    hop = RATE // 20
    energy = [sum(x * x for x in pcm[i:i + hop]) for i in range(0, len(pcm), hop)]
    n = max(1, int(win * 20))
    best = max(range(max(1, len(energy) - n + 1)), key=lambda i: sum(energy[i:i + n]))
    start = max(0, best / 20 - 0.05)
    dur = min(win, len(pcm) / RATE - start)
    dst = os.path.join(out, name + '.mp3')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{start:.2f}', '-t', f'{dur:.2f}', '-i', f, '-ac', '1', '-ar', str(RATE),
                    '-af', f'afade=t=in:d=0.03,afade=t=out:st={max(0, dur - 0.25):.2f}:d=0.25,loudnorm=I=-16:TP=-1.5:LRA=11',
                    '-b:a', '64k', dst], check=True)
    print(name, f'début {start:.2f}s, {dur:.2f}s,', os.path.getsize(dst) // 1000, 'Ko')
