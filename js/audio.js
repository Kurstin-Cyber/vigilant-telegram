/* Synthesized score, ambience and sound effects (Web Audio, no audio files). */
const Sound = (() => {
  let ctx = null, analyser, master, ambBus, musBus, sfxBus, reverb, noiseBuf, muted = false;
  let ambNodes = [], musNodes = [], ambTimers = [], musTimers = [], curAmb = null, curMood = null;
  let wantAmb = null, wantMood = null;

  /* root in Hz, scale = semitones above root, pad = chord multipliers */
  const MOODS = {
    calm: { root: 110, pad: [1, 1.5, 2, 2.378], scale: [0, 3, 5, 7, 10, 12], vol: 0.11, gap: [2.4, 4.6], beat: 0 },
    tense: { root: 98, pad: [1, 1.5, 1.587, 2.119], scale: [0, 1, 3, 7, 8, 12], vol: 0.13, gap: [2.8, 5.2], beat: 0 },
    dread: { root: 82.4, pad: [1, 1.414, 1.5, 2.828], scale: [0, 1, 6, 7, 11, 13], vol: 0.15, gap: [3.4, 6.5], beat: 1.05 }
  };

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch (e) { ctx = null; return; }
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    analyser = ctx.createAnalyser(); analyser.fftSize = 2048; comp.connect(analyser);
    ambBus = ctx.createGain(); ambBus.gain.value = 1; ambBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = 1; musBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
    // generated hall reverb
    reverb = ctx.createConvolver();
    const rl = Math.floor(ctx.sampleRate * 3.2), ir = ctx.createBuffer(2, rl, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < rl; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rl, 2.6); }
    reverb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.38;
    reverb.connect(wet); wet.connect(master);
    musBus.connect(reverb); sfxBus.connect(reverb);
    const len = ctx.sampleRate * 3;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = w * 0.5 + last * 6; }
    prime(); if (typeof Voice !== 'undefined') Voice.prime();
    // apply whatever the game asked for before sound was unlocked
    const a = wantAmb, m = wantMood; curAmb = curMood = null;
    setAmbience(a); setMood(m);
  }

  const ok = () => !!ctx;

  /* ----- recorded score (audio/music/*.mp3), played through two reusable media elements ----- */
  const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  const TRACKS = ['theme', 'calm', 'tense', 'dread', 'storm', 'finale'];
  const SYNTH_FALLBACK = { theme: 'calm', storm: 'tense', finale: 'tense' };
  const mus = [new Audio(), new Audio()]; mus.forEach(a => { a.preload = 'auto'; a.loop = true; });
  const stingEl = new Audio(); stingEl.preload = 'auto';
  let musIdx = 0, duckOn = false, trackName = null;
  const BASE_VOL = 0.9, DUCK = 0.3;
  const targetVol = () => (muted ? 0 : BASE_VOL * (duckOn ? DUCK : 1));
  function fade(a, to, ms, done) {
    clearInterval(a._f);
    const from = a.volume, t0 = performance.now();
    a._f = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k >= 1) { clearInterval(a._f); if (done) done(); }
    }, 40);
  }
  function playTrack(name, onFail) {
    const old = mus[musIdx]; musIdx ^= 1; const a = mus[musIdx];
    trackName = name;
    a.onerror = () => { if (trackName === name && onFail) onFail(); };
    a.src = 'audio/music/' + name + '.mp3'; a.volume = 0; a.loop = true;
    const p = a.play(); if (p && p.catch) p.catch(() => { if (trackName === name && onFail) onFail(); });
    fade(a, targetVol(), 2600);
    fade(old, 0, 2600, () => { if (old !== mus[musIdx]) old.pause(); });
  }
  function stopTrack() {
    trackName = null;
    mus.forEach(a => fade(a, 0, 1800, () => { if (a !== mus[musIdx] || !trackName) a.pause(); }));
  }
  function refreshVol() { if (trackName) fade(mus[musIdx], targetVol(), 350); }
  function duck(on) {
    duckOn = !!on; refreshVol();
    if (ok()) ambBus.gain.setTargetAtTime(on ? 0.5 : 1, ctx.currentTime, 0.15);
  }
  function sting() {
    if (muted) return;
    stingEl.src = 'audio/music/sting.mp3'; stingEl.volume = 0.9;
    const p = stingEl.play(); if (p && p.catch) p.catch(() => {});
    if (trackName) fade(mus[musIdx], 0.12, 600);
  }
  function prime() {   // let phones play these elements later from timers
    [mus[musIdx ^ 1], stingEl].forEach(a => { try { a.loop = false; a.src = SILENT; const mine = a.src; const p = a.play(); if (p && p.then) p.then(() => { if (a.src === mine) a.pause(); a.loop = a !== stingEl; }).catch(() => {}); } catch (e) {} });
  }
  function noise(filterType, freq, q, gain, dest) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(dest); src.start();
    return { src, f, g };
  }
  function fadeOutNodes(list, t = 1.2) {
    const now = ctx.currentTime;
    list.forEach(n => {
      try {
        if (n.g) { n.g.gain.cancelScheduledValues(now); n.g.gain.setTargetAtTime(0, now, t / 3); }
        const s = n.src || n.osc; if (s) s.stop(now + t + 0.3);
        if (n.lfo) n.lfo.stop(now + t + 0.3);
      } catch (e) {}
    });
  }
  function tone(freq, type, dur, vol, dest, when = 0, slideTo = null, attack = 0.02) {
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  function burst(dur, vol, filterType, freq, when = 0, dest) {
    const t = ctx.currentTime + when;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest || sfxBus);
    src.start(t, Math.random() * 1.5); src.stop(t + dur + 0.05);
  }
  /* soft piano-ish note */
  function piano(freq, vol, dest, when = 0) {
    tone(freq, 'triangle', 3.2, vol, dest, when, null, 0.012);
    tone(freq * 2, 'sine', 2.2, vol * 0.35, dest, when, null, 0.01);
    tone(freq * 3.01, 'sine', 1.0, vol * 0.12, dest, when, null, 0.008);
  }

  /* ----- ambience ----- */
  function setAmbience(name) {
    wantAmb = name;
    if (!ok() || name === curAmb) return;
    curAmb = name;
    fadeOutNodes(ambNodes); ambNodes = [];
    ambTimers.forEach(clearInterval); ambTimers.forEach(clearTimeout); ambTimers = [];
    if (!name || name === 'none') return;
    if (name === 'wind') {
      const n = noise('bandpass', 420, 0.7, 0.34, ambBus);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.09;
      const lg = ctx.createGain(); lg.gain.value = 300; lfo.connect(lg); lg.connect(n.f.frequency); lfo.start();
      n.lfo = lfo; ambNodes.push(n);
      ambNodes.push(noise('lowpass', 140, 0.5, 0.22, ambBus));
      const gust = () => { if (curAmb !== 'wind') return; const t = ctx.currentTime; n.g.gain.cancelScheduledValues(t); n.g.gain.setTargetAtTime(0.7, t, 1.2); n.g.gain.setTargetAtTime(0.3, t + 2.4, 1.5); ambTimers.push(setTimeout(gust, 7000 + Math.random() * 9000)); };
      ambTimers.push(setTimeout(gust, 3000));
      const thunder = () => { if (curAmb !== 'wind') return; if (Math.random() < 0.5) FX.thunder(0.5); ambTimers.push(setTimeout(thunder, 24000 + Math.random() * 30000)); };
      ambTimers.push(setTimeout(thunder, 14000));
    } else if (name === 'fire' || name === 'furnace') {
      const fur = name === 'furnace';
      ambNodes.push(noise('lowpass', fur ? 240 : 360, 0.4, fur ? 0.5 : 0.3, ambBus));
      ambTimers.push(setInterval(() => { if (Math.random() < 0.8) burst(0.03 + Math.random() * 0.06, 0.2 + Math.random() * 0.25, 'highpass', 1800 + Math.random() * 3000, 0, ambBus); }, fur ? 120 : 170));
      ambTimers.push(setInterval(() => { if (Math.random() < 0.18) burst(0.18, 0.35, 'bandpass', 900, 0, ambBus); }, 900));
    } else if (name === 'room') {
      ambNodes.push(noise('lowpass', 200, 0.3, 0.12, ambBus));
    } else if (name === 'clock') {
      ambNodes.push(noise('lowpass', 190, 0.3, 0.1, ambBus));
      let tick = 0;
      ambTimers.push(setInterval(() => { tone(tick++ % 2 ? 1700 : 1350, 'square', 0.035, 0.05, ambBus); }, 1000));
    } else if (name === 'kitchen') {
      ambNodes.push(noise('highpass', 3200, 0.4, 0.05, ambBus));
      ambNodes.push(noise('lowpass', 300, 0.4, 0.2, ambBus));
      ambTimers.push(setInterval(() => { if (Math.random() < 0.4) tone(1800 + Math.random() * 1600, 'sine', 0.4, 0.07, ambBus); }, 1400));
    }
  }

  /* ----- music ----- */
  function setMood(name) {
    wantMood = name;
    if (!ok() || name === curMood) return;
    curMood = name;
    fadeOutNodes(musNodes, 3); musNodes = [];
    musTimers.forEach(clearTimeout); musTimers.forEach(clearInterval); musTimers = [];
    if (TRACKS.includes(name)) { playTrack(name, () => { if (curMood === name) { trackName = null; startSynth(SYNTH_FALLBACK[name] || name); } }); return; }
    if (!name || name === 'none') { stopTrack(); return; }
    stopTrack(); startSynth(name);
  }
  function startSynth(name) {
    const mood = name;
    const m = MOODS[mood];
    if (!m) return;
    const stillWanted = () => ok() && (curMood === name || SYNTH_FALLBACK[curMood] === name || curMood === wantMood);
    // drone pad
    m.pad.forEach((mult, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = i % 2 ? 'sawtooth' : 'triangle';
      o.frequency.value = m.root * mult * (i === 0 ? 0.5 : 1); o.detune.value = (i - 1.5) * 7;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600;
      g.gain.value = 0.0001; g.gain.setTargetAtTime(m.vol / (1 + i * 0.6), ctx.currentTime, 2.5);
      lfo.frequency.value = 0.06 + i * 0.03; lg.gain.value = m.vol * 0.45;
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(f); f.connect(g); g.connect(musBus); o.start(); lfo.start();
      musNodes.push({ osc: o, g, lfo });
    });
    // melodic motif: random walk over the scale, sometimes a dyad
    let step = 2;
    const play = () => {
      if (!stillWanted()) return;
      step = Math.max(0, Math.min(m.scale.length - 1, step + Math.floor(Math.random() * 3) - 1));
      const f = m.root * 4 * Math.pow(2, m.scale[step] / 12);
      piano(f, 0.16, musBus);
      if (Math.random() < 0.3) piano(f * 1.5, 0.08, musBus, 0.18);
      if (Math.random() < 0.15) piano(m.root * Math.pow(2, m.scale[0] / 12), 0.2, musBus, 0.05);
      musTimers.push(setTimeout(play, (m.gap[0] + Math.random() * (m.gap[1] - m.gap[0])) * 1000));
    };
    musTimers.push(setTimeout(play, 800));
    // slow swell
    const swell = () => {
      if (!stillWanted()) return;
      m.pad.slice(0, 3).forEach((mult, i) => {
        const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.value = m.root * mult * 2; f.type = 'lowpass'; f.frequency.value = 500;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(m.vol * 0.7, t + 4); g.gain.linearRampToValueAtTime(0.0001, t + 9);
        o.connect(f); f.connect(g); g.connect(musBus); o.start(t); o.stop(t + 9.5);
      });
      musTimers.push(setTimeout(swell, 15000 + Math.random() * 8000));
    };
    musTimers.push(setTimeout(swell, 5000));
    // heartbeat for the darkest scenes
    if (m.beat) {
      musTimers.push(setInterval(() => { if (!stillWanted()) return; tone(52, 'sine', 0.22, 0.45, musBus, 0, 36); tone(52, 'sine', 0.22, 0.32, musBus, 0.28, 36); }, m.beat * 1000 * 1.6));
    }
  }

  /* ----- one-shots ----- */
  const FX = {
    clue() { piano(880, 0.3, sfxBus); piano(1318, 0.24, sfxBus, 0.13); piano(1760, 0.16, sfxBus, 0.27); },
    hit() { tone(70, 'sine', 1.6, 0.9, sfxBus, 0, 30); burst(0.6, 0.5, 'lowpass', 500); },
    knock() { [0, 0.3, 0.6].forEach(t => { tone(150, 'sine', 0.14, 0.9, sfxBus, t, 70); burst(0.07, 0.4, 'lowpass', 700, t); }); },
    door() { tone(110, 'sawtooth', 0.8, 0.14, sfxBus, 0, 70); burst(0.3, 0.4, 'lowpass', 400, 0.6); },
    slam() { burst(0.5, 1, 'lowpass', 600); tone(60, 'sine', 0.7, 1, sfxBus, 0, 30); },
    thunder(v = 1) { burst(3, 0.9 * v, 'lowpass', 220); tone(45, 'sine', 2.6, 0.6 * v, sfxBus, 0.1, 28); },
    chime() { [0, 1.1, 2.2].forEach(t => { tone(523, 'sine', 2, 0.25, sfxBus, t); tone(1046, 'sine', 1.2, 0.08, sfxBus, t); }); },
    whoosh() { burst(0.9, 0.35, 'bandpass', 900); },
    glass() { for (let i = 0; i < 5; i++) tone(2400 + Math.random() * 2000, 'triangle', 0.3, 0.12, sfxBus, i * 0.03); burst(0.3, 0.3, 'highpass', 4000); },
    gasp() { burst(0.4, 0.3, 'bandpass', 1500); },
    pour() { burst(1.2, 0.2, 'bandpass', 2600); },
    steps() { [0, 0.5, 1, 1.5].forEach(t => burst(0.1, 0.5, 'lowpass', 300, t)); },
    cliff() {
      tone(55, 'sine', 4, 1, sfxBus, 0, 26);
      [233, 247, 349, 370].forEach((f, i) => tone(f, 'sawtooth', 4, 0.14, sfxBus, 0.05 + i * 0.03));
      burst(2, 0.6, 'lowpass', 300);
      sting();
    },
    stinger() { tone(196, 'sawtooth', 1.6, 0.16, sfxBus); tone(277, 'sawtooth', 1.6, 0.16, sfxBus); tone(392, 'sawtooth', 1.6, 0.1, sfxBus); }
  };
  function sfx(name) { if (ok() && FX[name]) { try { FX[name](); } catch (e) {} } }
  function blip(pitch = 1) {
    if (!ok() || muted) return;
    tone(170 * pitch + Math.random() * 40, 'triangle', 0.05, 0.03, sfxBus);
  }
  function setMuted(m) {
    muted = m;
    if (ok()) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05);
    refreshVol();
    if (m) { try { stingEl.pause(); } catch (e) {} }
  }
  /* RMS of what is currently playing, 0..1 (used by tests to confirm sound is not silent) */
  function level() {
    if (!analyser) return 0;
    const d = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(d);
    let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i];
    return Math.sqrt(s / d.length);
  }
  function unlock() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

  return { init, unlock, setAmbience, setMood, sfx, blip, setMuted, duck, isMuted: () => muted, isReady: () => !!ctx, level, track: () => trackName };
})();
