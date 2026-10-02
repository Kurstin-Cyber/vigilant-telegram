/* Spoken dialogue via the browser's built-in speech synthesis. Optional and fail-safe:
   if a browser has no usable voices, the game quietly falls back to text and music only. */
const Voice = (() => {
  const supported = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
  let enabled = true, broken = false, voices = [], assigned = {}, cur = null, cbs = [], watchdog = null, maxTimer = null;

  const FEMALE = /female|woman|samantha|victoria|karen|moira|fiona|tessa|serena|kate|hazel|zira|susan|aria|jenny|libby|sonia|amy|emma|joanna|salli|kimberly|ivy/i;
  const MALE = /\bmale\b|daniel|oliver|alex|fred|arthur|george|david|ryan|mark|guy|thomas|james|ralph|brian|joey|matthew|justin|eric/i;
  const FEMALE_ROLES = ['margaret', 'vivian', 'dobbs'];
  const PROFILE = {
    nar: { pitch: 0.8, rate: 0.9 }, you: { pitch: 0.95, rate: 0.98 },
    pennington: { pitch: 0.62, rate: 0.86 }, margaret: { pitch: 0.95, rate: 0.88 },
    vivian: { pitch: 1.3, rate: 1.04 }, hale: { pitch: 0.78, rate: 0.92 },
    dobbs: { pitch: 1.12, rate: 0.98 }, pike: { pitch: 0.7, rate: 0.95 }
  };

  function refresh() {
    if (!supported) return;
    voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
    assigned = {};
  }
  if (supported) { refresh(); if ('onvoiceschanged' in speechSynthesis) speechSynthesis.onvoiceschanged = refresh; }

  function pick(who) {
    if (assigned[who] !== undefined) return assigned[who];
    const role = who === null ? 'nar' : who;
    const wantFemale = FEMALE_ROLES.includes(role);
    let pool = voices.filter(v => (wantFemale ? FEMALE : MALE).test(v.name));
    if (!pool.length) pool = voices.slice();
    pool.sort((a, b) => (/en-gb/i.test(b.lang) - /en-gb/i.test(a.lang)) || (/natural|neural|premium|enhanced/i.test(b.name) - /natural|neural|premium|enhanced/i.test(a.name)));
    const taken = Object.values(assigned);
    const v = pool.find(x => !taken.includes(x)) || pool[0] || null;
    assigned[who] = v;
    return v;
  }

  function finish(skipped) {
    clearTimeout(watchdog); clearTimeout(maxTimer);
    if (!cur && !cbs.length) return;
    cur = null;
    const list = cbs; cbs = [];
    list.forEach(f => f(!!skipped));
  }

  function speak(who, text) {
    if (!supported || !enabled || broken || !text) return false;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const p = PROFILE[who || 'nar'] || PROFILE.nar;
      u.pitch = p.pitch; u.rate = p.rate; u.volume = 1;
      const v = pick(who || 'nar');
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
      let started = false;
      u.onstart = () => { started = true; clearTimeout(watchdog); };
      u.onend = () => { if (cur === u) finish(false); };
      u.onerror = () => { if (cur === u) finish(false); };
      cur = u;
      speechSynthesis.speak(u);
      // if a browser accepts the call but never speaks, give up on voice for the session
      watchdog = setTimeout(() => { if (!started && cur === u) { broken = true; try { speechSynthesis.cancel(); } catch (e) {} finish(false); } }, 2500);
      maxTimer = setTimeout(() => { if (cur === u) { try { speechSynthesis.cancel(); } catch (e) {} finish(false); } }, 4000 + text.length * 120);
      return true;
    } catch (e) { broken = true; return false; }
  }

  return {
    supported: () => supported && !broken,
    isOn: () => supported && enabled && !broken,
    setOn(v) { enabled = !!v; if (!enabled) stop(true); },
    speak,
    busy: () => !!cur,
    whenDone(cb) { if (!cur) cb(false); else cbs.push(cb); },
    stop,
    pause() { try { if (supported) speechSynthesis.pause(); } catch (e) {} },
    resume() { try { if (supported) speechSynthesis.resume(); } catch (e) {} }
  };
  function stop(skipped) {
    if (!supported) return;
    try { speechSynthesis.cancel(); } catch (e) {}
    finish(skipped);
  }
})();
