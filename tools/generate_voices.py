#!/usr/bin/env python3
"""Generate the spoken-dialogue audio files with the Kokoro neural voice model.

The recordings in audio/voice/ are what the game plays. Re-run this after editing story text.

Setup (once):
    pip install sherpa-onnx numpy
    npm pack n8n-nodes-ttsbro && tar xzf n8n-nodes-ttsbro-*.tgz     # bundles the Kokoro v0.19 int8 model + voices
    export KOKORO_DIR=$PWD/package/kokoro-int8-en-v0_19
    node tools/extract_lines.js > lines.json
Run (optionally sharded across processes):
    python3 tools/generate_voices.py lines.json audio/voice [shard_index shard_count]
Needs ffmpeg with libmp3lame. Kokoro-82M is Apache-2.0 licensed.
"""
import json, os, re, subprocess, sys
import numpy as np
import sherpa_onnx

# Kokoro v0.19 speaker ids: 0 af, 1 af_bella, 2 af_nicole, 3 af_sarah, 4 af_sky, 5 am_adam,
# 6 am_michael, 7 bf_emma, 8 bf_isabella, 9 bm_george, 10 bm_lewis
CAST = {
    'nar':        (10, 0.95),   # narrator, also the Inspector's inner voice
    'you':        (10, 0.95),
    'pennington': (9, 0.90),    # formal, measured
    'hale':       (6, 0.93),    # smooth
    'margaret':   (2, 0.88),    # lower, slower
    'vivian':     (7, 1.06),    # bright, quick
    'dobbs':      (8, 0.95),
    'edmund':     (5, 0.88),    # the host: warm, commanding
}
EMOTION_SPEED = {'a': 1.07, 'w': 0.95, 'sh': 1.08, 's': 0.98}

ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
def words(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ('-' + ONES[n % 10] if n % 10 else '')
    if n < 1000: return ONES[n // 100] + ' hundred' + (' and ' + words(n % 100) if n % 100 else '')
    return words(n // 1000) + ' thousand' + (' ' + words(n % 1000) if n % 1000 else '')

def spoken(t):
    # respellings for the speech model: it stresses "Edmund" as two hard syllables (ED-MUND); "Edmond" gives the natural ED-mund
    t = re.sub(r'\bEdmund', 'Edmond', t)
    t = t.replace('Dr.', 'Doctor').replace('Mr.', 'Mister').replace('Mrs.', 'Missus')
    t = re.sub(r'£([\d,]+)', lambda m: words(int(m.group(1).replace(',', ''))) + ' pounds', t)
    t = re.sub(r'\b(\d{1,2}):(\d{2})\b', lambda m: words(int(m.group(1))) + (' oh ' + words(int(m.group(2))) if m.group(2)[0] == '0' else ' ' + words(int(m.group(2)))), t)
    t = re.sub(r'\b([A-Z])\.([A-Z])\.', r'\1 \2', t)
    return t.replace('...', ', ').replace('…', ', ').replace('"', '')

def trim_level(x, sr):
    a = np.abs(x); idx = np.where(a > 0.01)[0]
    if len(idx): x = x[max(0, idx[0] - int(0.06 * sr)): idx[-1] + int(0.20 * sr)]
    rms = np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2)) if np.any(np.abs(x) > 0.01) else 0.05
    x = x * (0.09 / max(rms, 1e-4))
    x = np.tanh(x * 1.2) / np.tanh(1.2)           # gentle limiter
    f = int(0.03 * sr); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    return x.astype(np.float32)

def main():
    lines_path, out_dir = sys.argv[1], sys.argv[2]
    shard, shards = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (0, 1)
    D = os.environ['KOKORO_DIR'] + '/'
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=D + 'model.int8.onnx', voices=D + 'voices.bin', tokens=D + 'tokens.txt', data_dir=D + 'espeak-ng-data'),
        num_threads=int(os.environ.get('THREADS', '1')), provider='cpu'))
    tts = sherpa_onnx.OfflineTts(cfg)
    os.makedirs(out_dir, exist_ok=True)
    lines = json.load(open(lines_path))
    for i, l in enumerate(lines):
        if i % shards != shard: continue
        path = f"{out_dir}/{l['hash']}.mp3"
        if os.path.exists(path): continue
        sid, speed, pitch = (l.get('voice') or [*CAST.get(l['who'], CAST['nar']), 1.0])[:3]
        speed *= EMOTION_SPEED.get(l.get('e', 'n'), 1.0) if l['who'] not in ('nar', 'you') else 1.0
        a = tts.generate(spoken(l['text']), sid=sid, speed=speed)
        x = trim_level(np.array(a.samples, dtype=np.float32), a.sample_rate)
        af = ['-af', f'asetrate={int(a.sample_rate * pitch)},aresample={a.sample_rate},atempo={1 / pitch:.4f}'] if abs(pitch - 1) > 0.005 else []
        p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(a.sample_rate), '-ac', '1', '-i', '-', *af, '-c:a', 'libmp3lame', '-b:a', '56k', '-ar', '24000', path], input=x.tobytes())
        print(f"[{shard}] {i + 1}/{len(lines)} {l['who']:10s} {len(x) / a.sample_rate:5.1f}s {l['text'][:50]}", flush=True)

if __name__ == '__main__':
    main()
