#!/usr/bin/env python3
"""Compose and render the game's orchestral score.

Original cues are written as MIDI, rendered with the FluidR3 General MIDI sample library
(apt: fluidsynth fluid-soundfont-gm), and encoded to MP3 in audio/music/.

    pip install mido
    python3 tools/compose_score.py audio/music
"""
import os, random, re, subprocess, sys
import mido
import numpy as np

SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
PPQ = 480
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}

def N(name):
    m = re.fullmatch(r'([A-G])([#b]?)(-?\d)', name)
    base = NOTE[m.group(1)] + (1 if m.group(2) == '#' else -1 if m.group(2) == 'b' else 0)
    return base + 12 * (int(m.group(3)) + 1)

def chord(*names): return [N(n) for n in names]

class Cue:
    def __init__(self, bpm, seed=1):
        self.bpm, self.ev, self.rnd = bpm, [], random.Random(seed)

    def prog(self, ch, program, vol=100, pan=64, rev=70, chorus=20):
        for ctrl, val in ((0, 0), (7, vol), (10, pan), (11, 110), (91, rev), (93, chorus)):
            self.ev.append((0, 0, mido.Message('control_change', channel=ch, control=ctrl, value=val)))
        self.ev.append((0, 1, mido.Message('program_change', channel=ch, program=program)))

    def n(self, ch, pitch, beat, dur, vel=70, human=True):
        r = self.rnd
        jitter = r.randint(-9, 9) if human else 0
        start = max(0, int(beat * PPQ) + jitter)
        v = max(1, min(127, int(vel * (1 + r.uniform(-0.08, 0.08))))) if human else vel
        end = start + max(30, int(dur * PPQ * (0.97 if human else 1)))
        self.ev.append((start, 3, mido.Message('note_on', channel=ch, note=pitch, velocity=v)))
        self.ev.append((end, 2, mido.Message('note_off', channel=ch, note=pitch, velocity=0)))

    def cc(self, ch, ctrl, beat, val):
        self.ev.append((int(beat * PPQ), 2, mido.Message('control_change', channel=ch, control=ctrl, value=int(max(0, min(127, val))))))

    def swell(self, ch, b0, b1, v0, v1, step=0.5):
        k = int((b1 - b0) / step)
        for i in range(k + 1):
            self.cc(ch, 11, b0 + i * step, v0 + (v1 - v0) * i / max(1, k))

    def chord(self, ch, pitches, beat, dur, vel=60, spread=0.0):
        for i, p in enumerate(pitches):
            self.n(ch, p, beat + i * spread, dur, vel)

    def write(self, path, beats):
        mid = mido.MidiFile(type=0, ticks_per_beat=PPQ)
        tr = mido.MidiTrack(); mid.tracks.append(tr)
        tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(self.bpm), time=0))
        end = int(beats * PPQ)
        ev = sorted(self.ev, key=lambda e: (e[0], e[1]))
        t = 0
        for tick, _, msg in ev:
            tr.append(msg.copy(time=tick - t)); t = tick
        tr.append(mido.MetaMessage('end_of_track', time=max(0, end - t)))
        mid.save(path)

# GM programs
PIANO, HARP, MUSICBOX, STRINGS, TREM, PIZZ, VIOLIN, VIOLA, CELLO, BASS = 0, 46, 10, 48, 44, 45, 40, 41, 42, 43
CHOIR, OBOE, ENGHORN, FLUTE, FRENCHHORN, BRASS, TIMPANI, CELESTA = 53, 68, 69, 73, 60, 61, 47, 8

def rest_pattern(c, ch, pitches, bar_beat, pattern, step, vel, dur):
    """pattern: indexes into pitches (None = rest), one per `step` beats"""
    for i, idx in enumerate(pattern):
        if idx is None: continue
        c.n(ch, pitches[idx % len(pitches)], bar_beat + i * step, dur, vel + (6 if i % 4 == 0 else 0))

# --------------------------------------------------------------------------------------------
def theme():
    """Main theme: solo piano and cello over strings. D minor, slow."""
    c = Cue(58, 11); B = 4
    c.prog(0, STRINGS, 78, 50, 85); c.prog(1, CELLO, 96, 40, 75); c.prog(2, PIANO, 100, 78, 80)
    c.prog(3, ENGHORN, 90, 64, 90); c.prog(4, HARP, 80, 88, 85); c.prog(5, VIOLIN, 80, 46, 90)
    prog = [('D2', ['D3', 'F3', 'A3', 'D4']), ('Bb1', ['Bb2', 'D3', 'F3', 'Bb3']), ('G2', ['G3', 'Bb3', 'D4', 'G4']), ('A1', ['A2', 'E3', 'A3', 'C#4']),
            ('D2', ['D3', 'F3', 'A3', 'D4']), ('F2', ['F3', 'A3', 'C4', 'F4']), ('Bb1', ['Bb2', 'D3', 'F3', 'Bb3']), ('A1', ['A2', 'E3', 'G3', 'C#4'])]
    for rep in range(2):
        for i, (root, ch_) in enumerate(prog):
            bar = (rep * 8 + i) * B
            c.n(1, N(root), bar, 4, 62 + rep * 8)
            c.chord(0, [N(x) for x in ch_], bar, 4, 40 + rep * 8)
            c.swell(0, bar, bar + 2, 70, 112); c.swell(0, bar + 2, bar + 4, 112, 80)
            # piano arpeggio, quarter-note bell tones
            for j, x in enumerate([ch_[0], ch_[2], ch_[3], ch_[2]]):
                c.n(2, N(x) + 12, bar + j, 1.0, 42 + (6 if j == 0 else 0) + rep * 5)
    # melody (D minor): two 8-bar phrases
    mel = [('A4', 0, 2), ('D5', 2, 1), ('F5', 3, 1), ('E5', 4, 2), ('D5', 6, 1), ('C5', 7, 1), ('Bb4', 8, 3), ('A4', 11, 1), ('G4', 12, 2), ('A4', 14, 2),
           ('Bb4', 16, 2), ('D5', 18, 2), ('C#5', 20, 2), ('A4', 22, 2), ('F5', 24, 3), ('E5', 27, 1), ('D5', 28, 4)]
    for name, beat, dur in mel:
        c.n(3, N(name), beat + 0, dur, 78)
    for name, beat, dur in mel:   # second statement an octave up on violin + piano, bars 9-16
        c.n(5, N(name) + 12, beat + 32, dur, 66); c.n(2, N(name) + 12, beat + 32, dur, 58)
    # cello counter line
    for name, beat, dur in [('D3', 32, 4), ('F3', 36, 4), ('E3', 40, 4), ('A2', 44, 4), ('D3', 48, 4), ('C3', 52, 4), ('Bb2', 56, 4), ('A2', 60, 4)]:
        c.n(1, N(name), beat, dur, 70)
    # harp rolls
    for bar in (8, 12, 14):
        for j, x in enumerate(['D4', 'F4', 'A4', 'D5', 'F5', 'A5']):
            c.n(4, N(x), bar * B + j * 0.25, 1.5, 50)
    return c, 16 * B

def calm():
    """Calm, melancholic. A minor."""
    c = Cue(66, 21); B = 4
    c.prog(0, STRINGS, 74, 52, 85); c.prog(1, CELLO, 92, 40, 75); c.prog(2, PIANO, 98, 76, 80)
    c.prog(3, OBOE, 84, 60, 90); c.prog(4, HARP, 74, 90, 85); c.prog(5, FLUTE, 70, 36, 90)
    prog = [('A1', ['A2', 'E3', 'A3', 'C4']), ('F1', ['F2', 'C3', 'A3', 'E4']), ('D2', ['D3', 'A3', 'D4', 'F4']), ('E2', ['E3', 'B3', 'E4', 'G#4']),
            ('A1', ['A2', 'E3', 'A3', 'C4']), ('D2', ['D3', 'A3', 'D4', 'F4']), ('F1', ['F2', 'C3', 'A3', 'C4']), ('E2', ['E3', 'B3', 'D4', 'G#4'])]
    for rep in range(2):
        for i, (root, ch_) in enumerate(prog):
            bar = (rep * 8 + i) * B
            c.n(1, N(root) + 12, bar, 4, 58); c.chord(0, [N(x) for x in ch_], bar, 4, 38 + rep * 6)
            c.swell(0, bar, bar + 2, 66, 108); c.swell(0, bar + 2, bar + 4, 108, 78)
            pat = [0, 2, 3, 2, 1, 2, 3, 2] if (i + rep) % 2 == 0 else [0, 1, 2, 3, 2, 3, 2, 1]
            if rep == 0 and i < 2: pat = [0, None, 2, None, 3, None, 2, None]
            for j, k in enumerate(pat):
                if k is not None: c.n(2, N(ch_[k]) + 12, bar + j * 0.5, 0.9, 38 + (5 if j % 4 == 0 else 0))
    mel = [('E5', 16, 2), ('D5', 18, 1), ('C5', 19, 1), ('B4', 20, 3), ('A4', 23, 1), ('C5', 24, 2), ('B4', 26, 1), ('A4', 27, 1), ('G#4', 28, 4),
           ('A4', 32, 2), ('C5', 34, 2), ('E5', 36, 2), ('F5', 38, 2), ('E5', 40, 3), ('D5', 43, 1), ('C5', 44, 2), ('B4', 46, 2), ('A4', 48, 6), ]
    for name, beat, dur in mel: c.n(3, N(name), beat, dur, 76)
    for name, beat, dur in [('A5', 56, 1), ('E5', 58, 1), ('C5', 60, 2)]: c.n(5, N(name), beat, dur, 56)
    for bar in (4, 10):
        for j, x in enumerate(['A3', 'C4', 'E4', 'A4', 'C5', 'E5']): c.n(4, N(x), bar * B + j * 0.25, 1.5, 52)
    return c, 16 * B

def tense():
    """Stalking pizzicato under a cello pedal. D minor."""
    c = Cue(88, 31); B = 4
    c.prog(0, PIZZ, 100, 44, 70); c.prog(1, CELLO, 96, 40, 70); c.prog(2, TREM, 70, 70, 90)
    c.prog(3, PIANO, 90, 84, 85); c.prog(4, TIMPANI, 90, 64, 80); c.prog(5, VIOLA, 80, 56, 80)
    prog = [('D2', 'D3', 'A3', 'F3'), ('Bb1', 'Bb2', 'F3', 'D3'), ('G1', 'G2', 'D3', 'Bb2'), ('A1', 'A2', 'E3', 'C#3')]
    for rep in range(4):
        for i, (root, r2, f, t) in enumerate(prog):
            bar = (rep * 4 + i) * B
            c.n(1, N(root) + 12, bar, 4, 60 + rep * 4)
            pat = [0, None, 0, 1, None, 2, 1, None] if rep % 2 == 0 else [0, 1, None, 2, 1, None, 0, 2]
            notes = [N(r2) + 12, N(f) + 12, N(t) + 12]
            for j, k in enumerate(pat):
                if k is not None: c.n(0, notes[k], bar + j * 0.5, 0.35, 66 + (8 if j == 0 else 0))
            c.n(4, N('D2'), bar, 1.5, 52 + rep * 6)
            if rep >= 2: c.n(5, N(r2) + 12, bar, 4, 50)
            if rep % 2 == 1 and i % 2 == 0:
                c.n(3, N('D6'), bar + 2, 2, 40); c.n(3, N('F6'), bar + 2.5, 2, 36)
        if rep in (1, 3):
            ba = (rep * 4 + 3) * B
            c.chord(2, chord('A4', 'Eb5', 'F5'), ba, 4, 52); c.swell(2, ba, ba + 4, 40, 118)
    c.chord(2, chord('D4', 'A4', 'F5'), 0, 12, 40); c.swell(2, 0, 12, 40, 90)
    for bar in (7, 15):
        for j in range(8): c.n(4, N('D2'), bar * B + 2 + j * 0.25, 0.3, 40 + j * 5)
    return c, 16 * B

def dread():
    """Slow, low, unresolved. E phrygian."""
    c = Cue(54, 41); B = 4
    c.prog(0, BASS, 72, 50, 80); c.prog(1, CELLO, 104, 38, 80); c.prog(2, TREM, 112, 66, 95)
    c.prog(3, CHOIR, 104, 60, 100); c.prog(4, TIMPANI, 80, 64, 85); c.prog(5, MUSICBOX, 100, 92, 95); c.prog(6, PIANO, 100, 40, 90); c.prog(7, VIOLIN, 96, 60, 95)
    for bar in (0, 4, 8, 12):
        c.n(0, N('E1'), bar * B, 16, 70); c.n(1, N('E2'), bar * B, 16, 62); c.n(1, N('B2'), bar * B + 8, 8, 56)
    # tremolo strings: cluster that slowly breathes
    for bar in (0, 8):
        c.chord(2, chord('E4', 'F4', 'B4', 'E5'), bar * B, 30, 62); c.swell(2, bar * B, bar * B + 16, 50, 118); c.swell(2, bar * B + 16, bar * B + 32, 118, 50)
    # choir enters second half
    c.chord(3, chord('E3', 'B3', 'G4', 'B4'), 4 * B, 48, 56); c.swell(3, 4 * B, 10 * B, 40, 118); c.swell(3, 10 * B, 16 * B, 118, 60)
    for bar in (2, 6, 10, 14): c.n(7, N('B5'), bar * B, 8, 40); c.n(7, N('F5'), bar * B + 0.5, 8, 34); c.swell(7, bar * B, bar * B + 8, 30, 100)
    # heartbeat
    for bar in range(16):
        c.n(4, N('E1'), bar * B, 0.6, 50 + (10 if bar >= 8 else 0)); c.n(4, N('E1'), bar * B + 0.75, 0.6, 40 + (10 if bar >= 8 else 0))
        c.n(4, N('E1'), bar * B + 2, 0.6, 48 + (8 if bar >= 8 else 0)); c.n(4, N('E1'), bar * B + 2.75, 0.6, 38 + (8 if bar >= 8 else 0))
    # music box ghost melody
    for name, beat in [('E6', 8), ('G6', 10), ('F#6', 13), ('B5', 16), ('E6', 24), ('D#6', 27), ('B5', 30), ('G5', 36), ('F#5', 40), ('E5', 46), ('B5', 52), ('E6', 56)]:
        c.n(5, N(name), beat, 3, 56)
    for bar in (0, 4, 8, 12): c.n(6, N('E2'), bar * B + 2, 8, 50); c.n(6, N('B2'), bar * B + 2, 8, 44)
    return c, 16 * B

def storm():
    """Driving chase. D minor, relentless cello and timpani."""
    c = Cue(112, 51); B = 4
    c.prog(0, CELLO, 104, 40, 60); c.prog(1, VIOLA, 96, 60, 60); c.prog(2, STRINGS, 90, 66, 70)
    c.prog(3, TIMPANI, 100, 64, 75); c.prog(4, BRASS, 80, 58, 80); c.prog(5, VIOLIN, 80, 46, 70); c.prog(6, PIANO, 80, 86, 70)
    prog = [('D2', 'A2'), ('D2', 'A2'), ('Bb1', 'F2'), ('C2', 'G2')]
    for bar in range(16):
        root, fifth = prog[bar % 4]
        for j in range(8):
            p = N(root) + (12 if j % 2 else 0) if j % 4 != 3 else N(fifth) + 12
            c.n(0, p, bar * B + j * 0.5, 0.45, 76 + (14 if j % 4 == 0 else 0) + min(bar, 8))
            c.n(1, p + 12, bar * B + j * 0.5, 0.45, 56 + (10 if j % 4 == 0 else 0))
        if bar % 2 == 0:
            chd = {'D2': ['D4', 'F4', 'A4'], 'Bb1': ['Bb3', 'D4', 'F4'], 'C2': ['C4', 'E4', 'G4']}[root]
            c.chord(2, [N(x) for x in chd], bar * B, 0.5, 88); c.chord(2, [N(x) for x in chd], bar * B + 2, 0.5, 80)
        c.n(3, N('D2'), bar * B, 0.5, 80); c.n(3, N('D2'), bar * B + 2, 0.5, 70)
        if bar % 4 == 3:
            for j in range(10): c.n(3, N('D2'), bar * B + 2 + j * 0.2, 0.2, 40 + j * 7)
    for bar in range(8, 16):
        c.n(4, N(prog[bar % 4][0]) + 12, bar * B, 4, 62); c.swell(4, bar * B, bar * B + 4, 60, 110)
        for j, x in enumerate(['D5', 'F5', 'A5', 'F5', 'D5', 'F5', 'A5', 'D6']): c.n(5, N(x), bar * B + j * 0.5, 0.4, 62)
        c.n(6, N('D5'), bar * B, 1, 70); c.n(6, N('A5'), bar * B + 2, 1, 70)
    return c, 16 * B

def finale():
    """Rising resolve. A minor opening toward a held major lift."""
    c = Cue(96, 61); B = 4
    c.prog(0, PIANO, 100, 76, 75); c.prog(1, STRINGS, 90, 52, 80); c.prog(2, CELLO, 100, 40, 70)
    c.prog(3, TIMPANI, 100, 64, 80); c.prog(4, BRASS, 80, 60, 85); c.prog(5, VIOLIN, 80, 46, 80); c.prog(6, CHOIR, 70, 64, 95)
    prog = [('A1', ['A3', 'C4', 'E4']), ('F1', ['A3', 'C4', 'F4']), ('C2', ['G3', 'C4', 'E4']), ('G1', ['G3', 'B3', 'D4']),
            ('A1', ['A3', 'C4', 'E4']), ('D2', ['A3', 'D4', 'F4']), ('E2', ['G#3', 'B3', 'E4']), ('A1', ['A3', 'C4', 'E4'])]
    for rep in range(2):
        for i, (root, ch_) in enumerate(prog):
            bar = (rep * 8 + i) * B
            c.n(2, N(root) + 12, bar, 4, 72 + rep * 6)
            c.chord(1, [N(x) for x in ch_], bar, 4, 54 + rep * 10); c.swell(1, bar, bar + 4, 70, 118)
            for j in range(8):
                x = [ch_[0], ch_[1], ch_[2], ch_[1]][j % 4]
                c.n(0, N(x) + (12 if j % 4 == 2 else 0), bar + j * 0.5, 0.45, 56 + (8 if j % 4 == 0 else 0) + rep * 8)
            c.n(3, N('A1'), bar, 0.5, 64 + rep * 10)
            if rep == 1: c.n(3, N('A1'), bar + 2, 0.5, 70)
    mel = [('E5', 16, 2), ('A5', 18, 2), ('G5', 20, 2), ('E5', 22, 2), ('F5', 24, 2), ('A5', 26, 2), ('G#5', 28, 4),
           ('C6', 32, 2), ('B5', 34, 2), ('A5', 36, 2), ('E5', 38, 2), ('F5', 40, 2), ('E5', 42, 2), ('D5', 44, 2), ('E5', 46, 2), ('A5', 48, 8)]
    for name, beat, dur in mel: c.n(5, N(name), beat, dur, 84)
    for bar in range(12, 16):
        c.chord(4, chord('A3', 'E4', 'A4'), bar * B, 4, 74); c.swell(4, bar * B, bar * B + 4, 70, 118)
    c.chord(6, chord('A3', 'E4', 'C5'), 8 * B, 32, 52); c.swell(6, 8 * B, 16 * B, 50, 112)
    return c, 16 * B

def sting():
    """Short cliffhanger hit with a long tail."""
    c = Cue(60, 71)
    c.prog(0, TIMPANI, 110, 64, 90); c.prog(1, BRASS, 100, 58, 95); c.prog(2, TREM, 100, 64, 100); c.prog(3, CELLO, 100, 40, 90); c.prog(4, PIANO, 100, 60, 100)
    for j in range(14): c.n(0, N('E2'), j * 0.13, 0.3, 30 + j * 5)
    c.n(0, N('E1'), 2, 4, 120, human=False)
    c.chord(1, chord('E2', 'B2', 'F3', 'Bb3'), 2, 5, 118, 0.0); c.chord(2, chord('E4', 'F4', 'B4', 'Bb4'), 2, 8, 90)
    c.swell(2, 2, 10, 120, 40); c.n(3, N('E1'), 2, 8, 110); c.n(4, N('E1'), 2, 8, 100); c.n(4, N('Bb1'), 2, 8, 80)
    return c, 12

CUES = {'theme': theme, 'calm': calm, 'tense': tense, 'dread': dread, 'storm': storm, 'finale': finale, 'sting': sting}

def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'audio/music'
    only = sys.argv[2:] or list(CUES)
    os.makedirs(out, exist_ok=True)
    tmp = '/tmp/score_build'; os.makedirs(tmp, exist_ok=True)
    for name in only:
        cue, beats = CUES[name]()
        mid, wav, mp3 = f'{tmp}/{name}.mid', f'{tmp}/{name}.wav', f'{out}/{name}.mp3'
        cue.write(mid, beats)
        subprocess.run(['fluidsynth', '-ni', '-g', '0.9', '-r', '44100', '-R', '1', '-C', '1', '-F', wav, SF2, mid], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        # make the loop seamless: let the final tail ring into the start, then cut to the exact loop length
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', wav, '-f', 'f32le', '-ac', '2', '-ar', '44100', '-'], capture_output=True, check=True).stdout
        x = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
        if name != 'sting':
            L = int(beats * 60 / cue.bpm * 44100)
            body, tail = x[:L].copy(), x[L:]
            n = min(len(tail), L); body[:n] += tail[:n]
            x = body
        # tidy: gentle compression, loudness to a bed level that sits under dialogue
        af = 'highpass=f=28,acompressor=threshold=-22dB:ratio=2.2:attack=30:release=300,loudnorm=I=-21:TP=-2:LRA=9'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', '44100', '-ac', '2', '-i', '-', '-af', af, '-c:a', 'libmp3lame', '-b:a', '112k', '-ar', '44100', mp3], input=x.tobytes(), check=True)
        print(name, f'{os.path.getsize(mp3) / 1e6:.2f}MB', f'{beats * 60 / cue.bpm:.0f}s')

if __name__ == '__main__':
    main()
