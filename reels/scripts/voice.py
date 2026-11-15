"""Generate per-scene Turkish voiceover with Piper and write frame durations.

Usage: python3 scripts/voice.py /path/to/tr_TR-dfki-medium.onnx
"""
import json, subprocess, sys, wave, math, pathlib

FPS = 30
LEAD = 12   # frames before narration starts
TAIL = 18   # frames after narration ends
MIN = 75

root = pathlib.Path(__file__).resolve().parent.parent
model = sys.argv[1]
data = json.loads((root / 'src/script.json').read_text())
out = root / 'public/vo'
out.mkdir(parents=True, exist_ok=True)
durations = {}
for s in data['scenes']:
    wav = out / f"{s['id']}.wav"
    subprocess.run(['piper', '-m', model, '-f', str(wav), '--length_scale', '0.92', '--sentence_silence', '0.15'],
                   input=s['say'].encode(), check=True, capture_output=True)
    with wave.open(str(wav)) as w:
        sec = w.getnframes() / w.getframerate()
    durations[s['id']] = max(MIN, LEAD + math.ceil(sec * FPS) + TAIL)
    print(f"{s['id']:12s} {sec:5.2f}s -> {durations[s['id']]} frames")
(root / 'src/durations.json').write_text(json.dumps(durations, indent=2))
print('total', sum(durations.values()) / FPS, 's')
