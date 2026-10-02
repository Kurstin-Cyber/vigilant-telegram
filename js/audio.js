/* Synthesized score, ambience and sound effects (Web Audio, no audio files). */
const Sound = (() => {
  let ctx = null, master, ambBus, musBus, sfxBus, noiseBuf, muted = false;
  let ambNodes = [], musNodes = [], ambTimer = null, musTimer = null, curAmb = null, curMood = null;

  const MOODS = {
    calm: { root: 110, chord: [1, 1.5, 2, 2.4], notes: [0, 3, 5, 7, 10], vol: 0.05 },
    tense: { root: 98, chord: [1, 1.5, 1.6, 2.12], notes: [0, 1, 5, 7, 8], vol: 0.06 },
    dread: { root: 82.4, chord: [1, 1.414, 1.5, 2.83], notes: [0, 1, 6, 7, 11], vol: 0.07 },
    none: null
  };

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.85; master.connect(ctx.destination);
    ambBus = ctx.createGain(); ambBus.gain.value = 0.9; ambBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = 0.9; musBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
    const len = ctx.sampleRate * 3;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = (w * 0.5 + last * 6); }
  }

  const ok = () => !!ctx;
  function noise(filterType, freq, q, gain, dest) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(dest);
    src.start();
    return { src, f, g };
  }
  function fadeOutNodes(list, t = 1.2) {
    const now = ctx.currentTime;
    list.forEach(n => {
      try {
        if (n.g) { n.g.gain.cancelScheduledValues(now); n.g.gain.setTargetAtTime(0, now, t / 3); }
        const stop = n.src || n.osc;
        if (stop) stop.stop(now + t + 0.2);
        if (n.lfo) n.lfo.stop(now + t + 0.2);
      } catch (e) {}
    });
  }
  function envTone(freq, type, dur, vol, dest, when = 0, slideTo = null) {
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  function burst(dur, vol, filterType, freq, when = 0, dest) {
    const t = ctx.currentTime + when;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest || sfxBus);
    src.start(t, Math.random() * 1.5); src.stop(t + dur + 0.05);
  }

  /* ----- ambience ----- */
  function setAmbience(name) {
    if (!ok() || name === curAmb) return;
    curAmb = name;
    fadeOutNodes(ambNodes); ambNodes = [];
    clearInterval(ambTimer);
    if (!name || name === 'none') return;
    if (name === 'wind') {
      const n = noise('bandpass', 420, 0.6, 0.22, ambBus);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.11;
      const lg = ctx.createGain(); lg.gain.value = 260; lfo.connect(lg); lg.connect(n.f.frequency); lfo.start();
      n.lfo = lfo; ambNodes.push(n);
    } else if (name === 'fire' || name === 'furnace') {
      const n = noise('lowpass', name === 'furnace' ? 260 : 380, 0.4, name === 'furnace' ? 0.35 : 0.18, ambBus);
      ambNodes.push(n);
      ambTimer = setInterval(() => { if (Math.random() < 0.7) burst(0.04 + Math.random() * 0.05, 0.12 + Math.random() * 0.12, 'highpass', 2200 + Math.random() * 2500, 0, ambBus); }, 180);
    } else if (name === 'room') {
      ambNodes.push(noise('lowpass', 200, 0.3, 0.07, ambBus));
    } else if (name === 'clock') {
      ambNodes.push(noise('lowpass', 180, 0.3, 0.06, ambBus));
      let tick = 0;
      ambTimer = setInterval(() => { envTone(tick++ % 2 ? 1500 : 1200, 'square', 0.03, 0.025, ambBus); }, 1000);
    } else if (name === 'kitchen') {
      ambNodes.push(noise('highpass', 3000, 0.4, 0.025, ambBus));
      ambNodes.push(noise('lowpass', 300, 0.4, 0.12, ambBus));
      ambTimer = setInterval(() => { if (Math.random() < 0.35) envTone(2000 + Math.random() * 1200, 'sine', 0.35, 0.03, ambBus); }, 1500);
    }
  }

  /* ----- music ----- */
  function setMood(name) {
    if (!ok() || name === curMood) return;
    curMood = name;
    fadeOutNodes(musNodes, 2.5); musNodes = [];
    clearInterval(musTimer);
    const m = MOODS[name];
    if (!m) return;
    m.chord.forEach((mult, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = i % 2 ? 'sawtooth' : 'triangle';
      o.frequency.value = m.root * mult * (i === 0 ? 0.5 : 1);
      o.detune.value = (i - 1.5) * 6;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520;
      g.gain.value = 0.0001; g.gain.setTargetAtTime(m.vol / (1 + i * 0.5), ctx.currentTime, 2);
      lfo.frequency.value = 0.07 + i * 0.03; lg.gain.value = m.vol * 0.4;
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(f); f.connect(g); g.connect(musBus);
      o.start(); lfo.start();
      musNodes.push({ osc: o, g, lfo });
    });
    const playNote = () => {
      if (!ok() || curMood !== name) return;
      const n = m.notes[Math.floor(Math.random() * m.notes.length)];
      const f = m.root * 4 * Math.pow(2, n / 12);
      envTone(f, 'sine', 2.6, 0.05, musBus);
      envTone(f * 2.01, 'sine', 1.6, 0.012, musBus);
    };
    musTimer = setInterval(playNote, 4200);
    setTimeout(playNote, 900);
  }

  /* ----- one-shots ----- */
  const FX = {
    clue() { envTone(880, 'sine', 0.9, 0.12, sfxBus); envTone(1320, 'sine', 1.1, 0.09, sfxBus, 0.12); envTone(1760, 'sine', 1.4, 0.05, sfxBus, 0.26); },
    hit() { envTone(70, 'sine', 1.4, 0.5, sfxBus, 0, 32); burst(0.5, 0.25, 'lowpass', 500); },
    knock() { [0, 0.28, 0.56].forEach(t => { envTone(150, 'sine', 0.12, 0.45, sfxBus, t, 70); burst(0.06, 0.2, 'lowpass', 700, t); }); },
    door() { envTone(110, 'sawtooth', 0.7, 0.07, sfxBus, 0, 70); burst(0.25, 0.2, 'lowpass', 400, 0.55); },
    slam() { burst(0.4, 0.6, 'lowpass', 600); envTone(60, 'sine', 0.6, 0.6, sfxBus, 0, 30); },
    thunder() { burst(2.6, 0.5, 'lowpass', 220); envTone(45, 'sine', 2.2, 0.35, sfxBus, 0.1, 30); },
    chime() { [0, 0.9, 1.8].forEach(t => envTone(523, 'sine', 1.6, 0.12, sfxBus, t)); },
    whoosh() { burst(0.9, 0.2, 'bandpass', 900); },
    glass() { for (let i = 0; i < 5; i++) envTone(2400 + Math.random() * 2000, 'triangle', 0.3, 0.08, sfxBus, i * 0.03); burst(0.3, 0.15, 'highpass', 4000); },
    gasp() { burst(0.35, 0.12, 'bandpass', 1500); },
    pour() { burst(1.2, 0.1, 'bandpass', 2600); },
    steps() { [0, 0.45, 0.9, 1.35].forEach(t => { burst(0.09, 0.22, 'lowpass', 300, t); }); },
    cliff() {
      envTone(55, 'sine', 3.5, 0.55, sfxBus, 0, 28);
      [233, 247, 349, 370].forEach((f, i) => envTone(f, 'sawtooth', 3.6, 0.07, sfxBus, 0.05 + i * 0.03));
      burst(1.8, 0.35, 'lowpass', 300);
    },
    stinger() { envTone(196, 'sawtooth', 1.4, 0.09, sfxBus); envTone(277, 'sawtooth', 1.4, 0.09, sfxBus); envTone(392, 'sawtooth', 1.4, 0.06, sfxBus); }
  };
  function sfx(name) { if (ok() && FX[name]) { try { FX[name](); } catch (e) {} } }
  function blip(pitch = 1) {
    if (!ok() || muted) return;
    envTone(180 * pitch + Math.random() * 40, 'triangle', 0.05, 0.018, sfxBus);
  }
  function setMuted(m) {
    muted = m;
    if (ok()) master.gain.setTargetAtTime(m ? 0 : 0.85, ctx.currentTime, 0.05);
  }

  return { init, setAmbience, setMood, sfx, blip, setMuted, isMuted: () => muted };
})();
