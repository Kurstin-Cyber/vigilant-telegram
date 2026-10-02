/* Scene runner for Mystery Night. */
let G = null; // game state, global so story conditions can read it
const has = id => !!G && G.clues.includes(id);

(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let CASE, NAMES, CLUES, SOLUTION, SUSPECTS, EPS;
  function useCase(id) {
    CASE = CASES[id] || CASES.silverblaze;
    NAMES = CASE.names; CLUES = CASE.clues; SOLUTION = CASE.solution; SUSPECTS = CASE.suspects; EPS = CASE.episodes;
    Object.entries(CASE.characters || {}).forEach(([cid, c]) => { if (c.look) Art.define(cid, c.look); });
  }
  useCase('silverblaze');
  const IS_TV = location.pathname.replace(/\/+$/, '') === '/tv' || new URLSearchParams(location.search).has('tv');
  const SAVE_KEY = 'mystery-night-v4', SET_KEY = 'mystery-night-settings';
  const E = {
    stage: $('stage'), bg: [$('bgA'), $('bgB')], fx: $('fx'), chars: $('chars'), dialog: $('dialog'),
    dname: $('dname'), dtext: $('dtext'), dnext: $('dnext'), choices: $('choices'), card: $('card'),
    overlay: $('overlay'), slate: $('slate'), flash: $('flash'), tbc: $('tbc')
  };

  /* ---------- persistence ---------- */
  let save = { cur: null, cases: {}, lastCase: 'silverblaze' };
  const sv = () => { save.cases = save.cases || {}; return (save.cases[CASE.id] = save.cases[CASE.id] || { epStart: {}, completed: 0 }); };
  let settings = { auto: true, muted: false, voice: true };
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) save = Object.assign(save, s); } catch (e) {}
  try { if (save.cur && save.cur.snap && !CASES[JSON.parse(save.cur.snap).caseId]) save.cur = null; if (!CASES[save.lastCase]) save.lastCase = 'silverblaze'; } catch (e) { save.cur = null; }
  try { const s = JSON.parse(localStorage.getItem(SET_KEY)); if (s) settings = Object.assign(settings, s); } catch (e) {}
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); localStorage.setItem(SET_KEY, JSON.stringify(settings)); } catch (e) {} };
  const newG = () => ({ ep: 0, scene: 0, clues: [], flags: {}, done: {}, marks: {}, composure: 3, finale: false, players: [], votes: {}, verdict: {}, cleared: {}, attempt: {}, caseId: CASE.id });
  const snap = () => JSON.stringify(G);
  function loadSnap(s) { const g = JSON.parse(s); useCase(g.caseId || 'silverblaze'); return g; }

  /* ---------- timers / flow ---------- */
  let timers = new Set(), pausedQ = [], paused = false, waiter = null, typing = null, frames = [], busy = false, flowToken = 0;
  function after(ms, fn) {
    const t = setTimeout(() => { timers.delete(t); if (paused) pausedQ.push(fn); else fn(); }, ms);
    timers.add(t); return t;
  }
  function clearTimers() {
    flowToken++; Voice.stop(false);
    timers.forEach(clearTimeout); timers.clear(); pausedQ = []; waiter = null;
    if (typing) { clearInterval(typing.iv); typing = null; }
  }
  function setPaused(p) {
    paused = p;
    if (p) Voice.pause(); else Voice.resume();
    if (!p) { const q = pausedQ; pausedQ = []; q.forEach(f => f()); }
  }
  function go(ms, fn, skippable = true) {
    const w = { fn, skippable, t: null };
    w.t = after(ms, () => { if (waiter === w) { waiter = null; fn(); } });
    waiter = w;
  }
  function advance() {
    if (paused) return;
    if (typing) { finishTyping(); return; }
    if (Voice.busy()) { Voice.stop(true); return; }
    if (waiter && waiter.skippable) { const w = waiter; waiter = null; clearTimeout(w.t); timers.delete(w.t); w.fn(); }
  }

  /* ---------- background / fx ---------- */
  let layer = 0;
  function setBg(name, instant) {
    const next = E.bg[1 - layer], cur = E.bg[layer];
    next.innerHTML = Art.bg(name);
    next.classList.remove('kb'); void next.offsetWidth; next.classList.add('kb');
    if (instant) { next.style.transition = cur.style.transition = 'none'; }
    next.classList.add('show'); cur.classList.remove('show');
    if (instant) { void next.offsetWidth; next.style.transition = cur.style.transition = ''; }
    layer = 1 - layer;
  }
  const ctx = E.fx.getContext('2d');
  let parts = [], fxKind = null, W = 0, H = 0, last = 0;
  function resize() {
    const d = Math.min(window.devicePixelRatio || 1, 1.5);
    W = E.fx.width = innerWidth * d; H = E.fx.height = innerHeight * d;
  }
  addEventListener('resize', resize); resize();
  function setFx(kind) {
    fxKind = kind; parts = [];
    const n = { snow: 150, dust: 55, embers: 55 }[kind] || 0;
    for (let i = 0; i < n; i++) parts.push(spawn(true));
  }
  function spawn(init) {
    const s = H / 900;
    if (fxKind === 'snow') return { x: Math.random() * W, y: init ? Math.random() * H : -10, r: (1 + Math.random() * 2.6) * s, v: (40 + Math.random() * 90) * s, p: Math.random() * 6 };
    if (fxKind === 'dust') return { x: Math.random() * W, y: Math.random() * H, r: (0.8 + Math.random() * 1.6) * s, v: -(3 + Math.random() * 8) * s, p: Math.random() * 6 };
    return { x: W * (0.25 + Math.random() * 0.5), y: init ? H * (0.4 + Math.random() * 0.6) : H + 10, r: (1 + Math.random() * 2) * s, v: -(30 + Math.random() * 70) * s, p: Math.random() * 6 };
  }
  function loop(t) {
    const dt = Math.min((t - last) / 1000, 0.05); last = t;
    ctx.clearRect(0, 0, W, H);
    if (fxKind) for (let i = 0; i < parts.length; i++) {
      const p = parts[i]; p.p += dt;
      p.y += p.v * dt; p.x += Math.sin(p.p * (fxKind === 'snow' ? 1.2 : 0.7)) * (fxKind === 'snow' ? 24 : 8) * dt * (H / 900);
      if (p.y > H + 12 || p.y < -12) parts[i] = spawn(false);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3);
      ctx.fillStyle = fxKind === 'snow' ? 'rgba(255,255,255,.8)' : fxKind === 'dust' ? 'rgba(255,220,150,.28)' : `rgba(255,${120 + Math.floor(Math.sin(p.p * 6) * 60 + 60)},40,.8)`;
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function doFlash(color) {
    E.flash.style.transition = 'none'; E.flash.style.background = color || '#fff'; E.flash.style.opacity = 0.9;
    void E.flash.offsetWidth; E.flash.style.transition = 'opacity 1.1s'; E.flash.style.opacity = 0;
  }
  function doShake() { E.stage.classList.remove('shake'); void E.stage.offsetWidth; E.stage.classList.add('shake'); }

  /* ---------- characters ---------- */
  const stage = {};
  function showChar(id, pos, e) {
    if (!Art.PORTRAITS[id]) return;
    if (stage[id]) { stage[id].el.className = 'char in p-' + pos; setExpr(id, e); return; }
    const el = document.createElement('div');
    el.className = 'char p-' + pos; el.style.setProperty('--c', Art.PORTRAITS[id].col); el.innerHTML = Art.portrait(id, e);
    E.chars.appendChild(el); stage[id] = { el, e };
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  }
  function hideChar(id) {
    const ids = id === 'all' ? Object.keys(stage) : [id];
    ids.forEach(i => { const c = stage[i]; if (!c) return; c.el.classList.remove('in'); setTimeout(() => c.el.remove(), 500); delete stage[i]; });
  }
  function setExpr(id, e) {
    const c = stage[id]; if (!c || !e || c.e === e) return;
    c.e = e; c.el.innerHTML = Art.portrait(id, e);
  }
  function spotlight(who) {
    Object.keys(stage).forEach(id => stage[id].el.classList.toggle('dim', !!stage[who] && id !== who));
  }

  /* ---------- text ---------- */
  const PITCH = { edmund: 0.75, pennington: 0.8, margaret: 1.1, vivian: 1.45, hale: 0.95, dobbs: 1.25, you: 1.0, pike: 0.85 };
  function typeText(text, who, cb, ms = 24, blips = true) {
    E.dtext.textContent = '';
    E.dnext.style.opacity = 0;
    let i = 0;
    const iv = setInterval(() => {
      if (paused) return;
      i++; E.dtext.textContent = text.slice(0, i);
      if (blips && who && i % 3 === 0 && /\w/.test(text[i - 1])) Sound.blip(PITCH[who] || 1);
      if (i >= text.length) finishTyping();
    }, ms);
    typing = { iv, text, cb };
  }
  function finishTyping() {
    if (!typing) return;
    const { iv, text, cb } = typing;
    clearInterval(iv); typing = null; E.dtext.textContent = text; cb();
  }
  function beat(text, done) {
    const proceed = skipped => {
      if (skipped) { done(); return; }
      if (settings.auto) go(Voice.isOn() ? 650 : Math.min(8000, Math.max(1700, 1000 + text.length * 44)), done);
      else { E.dnext.style.opacity = 1; go(3600000, done); }
    };
    if (Voice.busy()) { const tok = flowToken; Voice.whenDone(sk => { if (tok === flowToken) proceed(sk); }); }
    else proceed(false);
  }
  function showDialog(who, text, e, done) {
    E.stage.classList.remove('choosing');
    E.dialog.classList.add('on');
    E.dtext.classList.toggle('nar', !who);
    E.dname.textContent = who ? (NAMES[who] || '') : '';
    E.dname.style.color = (Art.PORTRAITS[who] || {}).col || '#d4a64a';
    E.dname.style.display = who ? '' : 'none';
    spotlight(who);
    if (e) setExpr(who, e);
    const spoke = voiceOn() && /[A-Za-z]/.test(text) && Voice.speak(who, text);
    if (spoke) warmAhead();
    typeText(text, who, () => beat(text, done), spoke ? 52 : 24, !spoke);
  }
  const voiceOn = () => settings.voice && !settings.muted;
  function warmAhead() { // fetch the next couple of recordings so they start instantly
    let n = 0;
    for (let fi = frames.length - 1; fi >= 0 && n < 2; fi--) {
      const f = frames[fi];
      for (let i = f.i; i < f.steps.length && n < 2; i++) {
        const s = f.steps[i];
        if (s.nar !== undefined) { Voice.warm(null, s.nar); n++; } else if (s.say) { Voice.warm(s.say, s.t); n++; }
      }
    }
  }
  function applyVoice() { Voice.setOn(voiceOn()); }

  /* ---------- scenes ---------- */
  function startScene(ei, si, opts = {}) {
    clearTimers(); frames = []; closeOverlay(); setPaused(false);
    E.choices.classList.remove('on'); E.card.classList.remove('on'); E.stage.classList.remove('choosing');
    E.stage.classList.add('fade'); E.dialog.classList.remove('on'); E.tbc.classList.remove('on');
    $('tint').classList.remove('on'); E.stage.classList.remove('cliffmode');
    after(opts.quick ? 80 : 650, () => {
      const ep = EPS[ei], sc = ep.scenes[si];
      G.ep = ei; G.scene = si;
      hideChar('all'); Object.keys(stage).forEach(k => delete stage[k]); E.chars.innerHTML = '';
      setBg(sc.bg, true); setFx(sc.fx || null);
      Sound.setAmbience(sc.amb || 'none'); Sound.setMood(sc.mood || 'none');
      save.cur = { ep: ei, scene: si, snap: snap() };
      save.lastCase = CASE.id;
      if (si === 0 && !sv().epStart[ei]) sv().epStart[ei] = snap();
      persist(); updateHud(); pushStatus('playing');
      E.stage.classList.remove('fade');
      const pre = si === (ep.titleScene || 0) && !opts.noIntro ? intro(ep) : [];
      frames = [{ steps: [...pre, ...sc.steps], i: 0 }];
      after(900, next);
    });
  }
  function intro(ep) {
    const steps = [];
    if (ep.recap.length) {
      steps.push({ card: 'PREVIOUSLY', sub: '' });
      ep.recap.forEach(l => steps.push({ card: l, small: true }));
    }
    steps.push({ card: `EPISODE ${ep.n}`, sub: ep.title, big: true });
    return steps;
  }

  function next() {
    try {
      while (true) {
        const f = frames[frames.length - 1];
        if (!f) { sceneDone(); return; }
        if (f.i >= f.steps.length) { frames.pop(); continue; }
        const st = f.steps[f.i++];
        if (exec(st)) return;
      }
    } catch (err) { console.error(err); showError(err); }
  }
  function push(steps) { if (steps && steps.length) frames.push({ steps, i: 0 }); }
  function sceneDone() {
    const ep = EPS[G.ep];
    if (G.scene + 1 < ep.scenes.length) startScene(G.ep, G.scene + 1);
    else cliffhanger(null);
  }
  const resume = () => next();

  function exec(st) {
    if (st.nar !== undefined) { showDialog(null, st.nar, null, resume); return true; }
    if (st.say) { showDialog(st.say, st.t, st.e, resume); return true; }
    if (st.show) { showChar(st.show, st.pos || 'c', st.e || 'n'); go(450, resume); return true; }
    if (st.hide) { hideChar(st.hide); go(300, resume); return true; }
    if (st.slate) { slate(st.slate); go(1500, resume); return true; }
    if (st.card !== undefined) { showCard(st); return true; }
    if (st.sfx) { Sound.sfx(st.sfx); return false; }
    if (st.flash) { doFlash(st.flash); return false; }
    if (st.shake) { doShake(); return false; }
    if (st.wait) { go(st.wait, resume); return true; }
    if (st.clue) { showClueCard(st.clue); return true; }
    if (st.flag) { G.flags[st.flag] = 1; return false; }
    if (st.do) { st.do(); updateHud(); return false; }
    if (st.cost) return loseComposure(st.cost);
    if (st.markDone) { G.done[st.markDone] = 1; return false; }
    if (st.if) { push(st.if() ? st.then : st.else); return false; }
    if (st.choice) { runChoice(st); return true; }
    if (st.menu) { runMenu(st); return true; }
    if (st.present) { return runPresent(st); }
    if (st.switch) { push(st.cases[st.switch()]); return false; }
    if (st.vote) { runVote(st.vote, () => next()); return true; }
    if (st.accuse) { runAccuse(st); return true; }
    if (st.cliff) { cliffhanger(st.cliff); return true; }
    return false;
  }

  /* ---------- cards ---------- */
  function slate(t) {
    E.slate.textContent = t; E.slate.classList.add('on');
    after(4200, () => E.slate.classList.remove('on'));
  }
  function showCard(st) {
    E.card.className = 'on' + (st.big ? ' big' : '') + (st.small ? ' small' : '');
    E.card.innerHTML = `<div class="ct">${esc(st.card)}</div>${st.sub ? `<div class="cs">${esc(st.sub)}</div>` : ''}`;
    E.dialog.classList.remove('on');
    const ms = st.big ? 3600 : st.small ? 2400 + st.card.length * 30 : 1800;
    go(ms, () => { E.card.classList.remove('on'); after(450, resume); });
  }
  function showClueCard(id) {
    const c = CLUES[id];
    if (has(id)) { return next(); }
    G.clues.push(id); updateHud(); persist();
    Sound.sfx('clue');
    E.dialog.classList.remove('on');
    E.card.className = 'on clue';
    E.card.innerHTML = `<div class="spot"><div class="ico">${c.icon}</div></div><div class="ck">New ${c.type === 'Testimony' ? 'testimony' : 'evidence'}</div><div class="ct">${esc(c.name)}</div><div class="cs">${esc(c.text)}</div>`;
    const finish = () => { E.card.classList.remove('on'); after(400, resume); };
    after(800, () => go(Math.max(3600, 1800 + c.text.length * 38), finish));
  }

  /* ---------- player input ---------- */
  function showChoicesUI(html, afterRender) {
    E.dialog.classList.remove('on'); E.stage.classList.add('choosing');
    E.choices.innerHTML = html; E.choices.classList.add('on');
    if (afterRender) afterRender(E.choices);
    groupPick(E.choices);
  }
  function hideChoices() { cancelPick(); E.choices.classList.remove('on'); E.choices.innerHTML = ''; E.stage.classList.remove('choosing'); }
  /* Group night: the same buttons are offered on every phone, and the most popular one is pressed for you.
     Tapping a button on the TV still overrides. */
  let pickId = null;
  function cancelPick() { if (pickId !== null) { Room.cancel(pickId); pickId = null; } }
  function groupPick(root) {
    if (!groupLive()) return;
    cancelPick();
    const btns = [...root.querySelectorAll('[data-i]:not([disabled])')];
    if (!btns.length) return;
    const prompt = ((root.querySelector('.prompt') || {}).textContent || '').trim();
    const options = btns.map(b => ({ id: b.dataset.i, label: b.textContent.replace(/\s+/g, ' ').replace(/✓/g, '').trim().replace(/^\d+\s+/, '') }));
    const hint = document.createElement('div'); hint.className = 'phonehint'; hint.textContent = '📱 Everyone votes on their phone. The most popular choice wins.';
    const p = root.querySelector('.prompt'); if (p) p.after(hint);
    const tally = answers => { const c = {}; Object.values(answers).forEach(v => { c[v] = (c[v] || 0) + 1; }); root.querySelectorAll('[data-i]').forEach(b => { b.dataset.votes = c[b.dataset.i] || 0; }); };
    const id = Room.ask({ kind: 'pick', prompt, options, timeoutMs: 30000 }, {
      onProgress: tally,
      onDone: answers => {
        if (pickId !== id) return; pickId = null;
        const c = {}; Object.values(answers).forEach(v => { c[v] = (c[v] || 0) + 1; });
        const keys = Object.keys(c);
        if (!keys.length) { if (root.classList.contains('on')) groupPick(root); return; } // nobody voted: ask again
        const max = Math.max(...keys.map(k => c[k])), top = keys.filter(k => c[k] === max);
        const win = top[Math.floor(Math.random() * top.length)];
        const b = root.querySelector(`[data-i="${win}"]`);
        if (b && !b.disabled && root.classList.contains('on')) b.click();
      }
    });
    pickId = id; askId = id;
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const btn = (cls, idx, html, extra = '') => `<button class="${cls}" data-i="${idx}" ${extra}>${html}</button>`;

  function runChoice(st) {
    const c = st.choice, opts = c.opts.filter(o => !o.req || o.req());
    showChoicesUI(`<div class="prompt">${esc(c.prompt)}</div>` + opts.map((o, i) => btn('opt', i, `<b>${i + 1}</b> ${esc(o.t)}`)).join(''), root => {
      root.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        hideChoices(); Sound.sfx('whoosh');
        push(opts[+b.dataset.i].steps); next();
      });
    });
  }

  function runMenu(st) {
    const m = st.menu, items = m.items.filter(it => !it.req || it.req());
    const isDone = it => G.done['m:' + it.id] && it.once !== false;
    const mustLeft = items.filter(it => it.must && !G.done['m:' + it.id]);
    const scene = m.style === 'scene';
    let html = `<div class="prompt">${esc(m.prompt)}</div>`;
    html += `<div class="${scene ? 'grid' : 'list'}">` + items.map((it, i) =>
      btn(scene ? 'tile' : 'opt', i, `${scene ? `<span class="ti">${it.icon}</span>` : `<b>${i + 1}</b> `}${esc(it.label)}${isDone(it) ? ' <i>✓</i>' : ''}`, isDone(it) ? 'disabled' : '')).join('') + `</div>`;
    html += btn('done', 'x', esc(m.done || 'Continue'), mustLeft.length ? 'disabled' : '');
    if (mustLeft.length && m.must) html += `<div class="need">${esc(m.must)}</div>`;
    showChoicesUI(html, root => {
      root.classList.toggle('scene', scene);
      root.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
        if (b.dataset.i === 'x') { hideChoices(); next(); return; }
        const it = items[+b.dataset.i];
        hideChoices(); Sound.sfx('whoosh');
        push([...it.steps, { markDone: 'm:' + it.id }, st]);
        next();
      });
    });
  }

  function runPresent(st) {
    const p = st.present;
    if (!p.ok.some(has)) { push(p.right); return false; }
    const found = G.clues.slice();
    let html = `<div class="prompt">${esc(p.prompt)}</div><div class="evid">` + found.map(id => btn('chip', id, `<span>${CLUES[id].icon}</span> ${esc(CLUES[id].name)}`)).join('') + `</div>`;
    if (p._w >= 2 && p.hint) html += `<div class="need">Hint: ${esc(p.hint)}</div>`;
    if (p.skip) html += btn('done', 'x', 'Not now');
    showChoicesUI(html, root => {
      root.classList.add('scene');
      root.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
        hideChoices();
        const id = b.dataset.i;
        if (id === 'x') { push(p.skip); next(); return; }
        if (p.ok.includes(id)) { p._w = 0; Sound.sfx('stinger'); push(p.right); }
        else {
          p._w = (p._w || 0) + 1;
          const steps = [...(p.wrong ? p.wrong(id) : [])];
          if (p.cost) steps.push({ cost: p.cost });
          steps.push(st);
          push(steps);
        }
        next();
      });
    });
    return true;
  }

  function loseComposure(n) {
    G.composure -= n; updateHud(); Sound.sfx('hit'); doFlash('#a02020'); doShake();
    if (G.composure <= 0) { failFinale(); return true; }
    return false;
  }
  function failFinale() {
    clearTimers(); frames = []; hideChoices(); E.dialog.classList.remove('on');
    Sound.setMood('dread');
    showCard({ card: 'THE KILLER WALKS FREE', sub: `Your case unravels. By the time the thaw comes, the doctor has gone.`, big: true });
    clearTimeout(waiter && waiter.t); waiter = null;
    after(4200, () => {
      E.card.classList.remove('on');
      overlay(`<div class="panel center"><h2>The case fell apart</h2><p>You ran out of composure before you ran out of evidence. Gather your thoughts and try the confrontation again.</p>
        <button class="big" id="retry">Try the confrontation again</button><button id="tomenu">Main menu</button></div>`);
      $('retry').onclick = () => { G = loadSnap(save.cur.snap); startScene(save.cur.ep, save.cur.scene, { noIntro: true }); };
      $('tomenu').onclick = showTitle;
    });
  }

  /* ---------- HUD / overlays ---------- */
  function updateHud() {
    if (IS_TV && G && G.room) renderRoster(Room.players());
    $('hp').textContent = G && G.finale ? 'Composure ' + '♥'.repeat(Math.max(0, G.composure)) + '♡'.repeat(Math.max(0, 3 - G.composure)) : '';
    $('hp').style.display = G && G.finale ? '' : 'none';
    $('bAuto').classList.toggle('on', settings.auto);
    $('bAuto').textContent = settings.auto ? 'Auto: on' : 'Auto: off';
    $('bSound').textContent = settings.muted ? 'Sound: off' : 'Sound: on';
    $('bVoice').style.display = Voice.supported() ? '' : 'none';
    $('bVoice').textContent = settings.voice ? 'Voice: on' : 'Voice: off';
    $('bVoice').classList.toggle('on', settings.voice);
    const n = G ? G.clues.length : 0;
    $('bFile').textContent = `Case file (${n}/${Object.keys(CLUES).length})`;
  }
  function overlay(html, lock) { E.overlay.classList.remove('lobbymode'); E.overlay.innerHTML = html; E.overlay.dataset.lock = lock ? '1' : ''; E.overlay.scrollTop = 0; E.overlay.classList.add('on'); setPaused(true); }
  function closeOverlay() { E.overlay.classList.remove('on', 'lobbymode'); E.overlay.innerHTML = ''; E.overlay.dataset.lock = ''; setPaused(false); }

  function suspectWatch(whoHighlight, watch) {
    return SUSPECTS.filter(id => Art.PORTRAITS[id]).map(id => `<div class="sus ${id === whoHighlight ? 'hot' : ''}"><div class="av" style="--c:${Art.PORTRAITS[id].col}">${Art.portrait(id, id === whoHighlight ? 'sh' : 'n')}</div><div><b style="color:${Art.PORTRAITS[id].col}">${NAMES[id]}</b>${id === whoHighlight ? ' <em>CLIFFHANGER</em>' : ''}<br><span>${esc(watch[id] || 'No information yet.')}</span></div></div>`).join('');
  }
  function openFile(tab = 'ev') {
    const by = type => G.clues.filter(c => CLUES[c].type === type).map(c => `<div class="clue"><span class="ico">${CLUES[c].icon}</span><div><b>${esc(CLUES[c].name)}</b><br>${esc(CLUES[c].text)}</div></div>`).join('') || '<div class="empty">Nothing yet.</div>';
    const doneEps = Math.min(sv().completed, EPS.length), watch = doneEps ? EPS[doneEps - 1].watch : {};
    const marks = ['Unmarked', 'Suspect', 'Cleared'];
    const votesHTML = () => {
      const pl = playersOf(), keys = Object.keys(G.votes).filter(k => !k.startsWith('f_') && k !== 'p3');
      if (!keys.length) return '<div class="empty">No votes cast yet. You vote at the end of each episode.</div>';
      return keys.map(k => `<div class="clue"><div><b>${esc(k.replace('r', 'Episode '))}</b><br>${pl.map((p, i) => { const b = G.votes[k][i] || {}; return esc(p.name) + ': ' + Object.keys(b).map(q => esc(NAMES[b[q]] || b[q])).join(' / '); }).join('<br>')}</div></div>`).join('');
    };
    const body = tab === 'ev' ? by('Evidence') : tab === 'te' ? by('Testimony') : tab === 'vo' ? votesHTML()
      : `<div class="watch">${suspectWatch(null, watch)}</div><div class="label">Your notes</div>` + SUSPECTS.filter(id => Art.PORTRAITS[id]).map(id => `<div class="markrow"><span>${NAMES[id]}</span><button class="mk s${G.marks[id] || 0}" data-mk="${id}">${marks[G.marks[id] || 0]}</button></div>`).join('');
    overlay(`<div class="panel"><button class="x" id="closeFile">×</button><h2>Case file</h2>
      <div class="tabs"><button data-t="ev" class="${tab === 'ev' ? 'on' : ''}">Evidence</button><button data-t="te" class="${tab === 'te' ? 'on' : ''}">Testimony</button><button data-t="su" class="${tab === 'su' ? 'on' : ''}">Suspects</button><button data-t="vo" class="${tab === 'vo' ? 'on' : ''}">Votes</button></div>${body}</div>`);
    $('closeFile').onclick = closeOverlay;
    E.overlay.querySelectorAll('[data-t]').forEach(b => b.onclick = () => openFile(b.dataset.t));
    E.overlay.querySelectorAll('[data-mk]').forEach(b => b.onclick = () => { G.marks[b.dataset.mk] = ((G.marks[b.dataset.mk] || 0) + 1) % 3; persist(); openFile('su'); });
  }
  function openMenu() {
    overlay(`<div class="panel center"><h2>Paused</h2>
      <button class="big" id="mResume">Resume</button><button id="mRestart">Restart this scene</button><button id="mAuto">${settings.auto ? 'Auto-advance: on' : 'Auto-advance: off'}</button><button id="mSound">${settings.muted ? 'Sound: off' : 'Sound: on'}</button>${Voice.supported() ? `<button id="mVoice">${settings.voice ? 'Spoken dialogue: on' : 'Spoken dialogue: off'}</button>` : ''}<button id="mTitle">Main menu</button></div>`);
    $('mResume').onclick = closeOverlay;
    $('mRestart').onclick = () => { G = loadSnap(save.cur.snap); startScene(save.cur.ep, save.cur.scene, { noIntro: true, quick: true }); };
    $('mAuto').onclick = () => { toggleAuto(); openMenu(); };
    $('mSound').onclick = () => { toggleSound(); openMenu(); };
    if ($('mVoice')) $('mVoice').onclick = () => { toggleVoice(); openMenu(); };
    $('mTitle').onclick = showTitle;
  }
  function toggleAuto() {
    settings.auto = !settings.auto; persist(); updateHud(); pushStatus('playing');
    if (!settings.auto && waiter && typeof waiter.t === 'number' && !typing) { clearTimeout(waiter.t); E.dnext.style.opacity = 1; }
  }
  function toggleSound() { settings.muted = !settings.muted; Sound.setMuted(settings.muted); applyVoice(); persist(); updateHud(); }
  function toggleVoice() { settings.voice = !settings.voice; applyVoice(); persist(); updateHud(); }
  function showError(err) {
    overlay(`<div class="panel center"><h2>Something went wrong</h2><p>${esc(err && err.message || err)}</p><button class="big" id="eTitle">Main menu</button></div>`);
    $('eTitle').onclick = showTitle;
  }


  /* ---------- voting: pass the device around, or everyone on their own phone ---------- */
  const playersOf = () => (G.players && G.players.length ? G.players : [{ name: 'Detective' }]);
  const groupLive = () => IS_TV && G && G.room && Room.live();
  function tallyQ(q, ballots) {
    const counts = {};
    ballots.forEach(b => { if (b && b[q.id]) counts[b[q.id]] = (counts[b[q.id]] || 0) + 1; });
    const max = Math.max(0, ...Object.values(counts));
    const top = Object.keys(counts).filter(k => counts[k] === max);
    let winner = top[0];
    if (top.length > 1) for (const b of ballots) if (b && top.includes(b[q.id])) { winner = b[q.id]; break; } // tie: the earliest detective's pick
    return { counts, winner };
  }
  function persistVotes() {
    if (save.cur) save.cur.snap = snap();
    if (sv().epStart[G.ep + 1]) sv().epStart[G.ep + 1] = snap();
    persist();
  }
  const voteQs = def => def.qs.map(q => ({ ...q, options: (q.options || def.options).filter(o => !(def.exclude || []).includes(o.id)) }));
  function voteCard(q, o) {
    return `<button class="vopt" data-q="${q.id}" data-id="${o.id}">${o.portrait ? `<span class="av" style="--c:${(Art.PORTRAITS[o.portrait] || {}).col || '#888'}">${Art.portrait(o.portrait, 'n')}</span>` : ''}<span>${esc(o.label)}</span></button>`;
  }
  /* The results screen, shared by both ways of voting. */
  function voteResults(def, qs, ballots, done) {
    const players = playersOf(), multi = players.length > 1;
    G.votes[def.key] = ballots;
    const rows = qs.map(q => { const t = tallyQ(q, ballots); G.verdict[q.id] = t.winner; return { q, ...t }; });
    if (def.persist) persistVotes();
    const label = (q, id) => (q.options.find(o => o.id === id) || {}).label || '?';
    const voters = Math.max(1, ballots.filter(Boolean).length);
    if (groupLive()) Room.showResult({ title: def.title, rows: rows.map(r => ({ q: r.q.text, lines: r.q.options.map(o => ({ label: o.label, count: r.counts[o.id] || 0, win: o.id === r.winner })) })) });
    overlay(`<div class="panel wide vote"><div class="eyebrow">${multi ? 'The group has spoken' : 'Your verdict'}</div><h2>${esc(def.title)}</h2>
      ${rows.map(r => `<div class="vq"><div class="label">${esc(r.q.text)}</div>${r.q.options.map(o => { const c = r.counts[o.id] || 0; return `<div class="bar ${o.id === r.winner ? 'win' : ''}"><span class="bf" style="width:${c / voters * 100}%"></span><span class="bl">${esc(o.label)}</span><span class="bn">${c}</span></div>`; }).join('')}${multi ? `<div class="who">${players.map((p, i) => `${esc(p.name)}: ${esc(label(r.q, (ballots[i] || {})[r.q.id]))}`).join(' · ')}</div>` : ''}</div>`).join('')}
      <button class="big" id="vDone">Continue</button></div>`, true);
    const go = () => { clearTimeout(auto); closeOverlay(); done(); };
    $('vDone').onclick = go;
    const auto = groupLive() ? setTimeout(() => { if ($('vDone')) go(); }, 14000) : null;
  }
  function runVote(def, done) {
    if (groupLive()) return runVoteRoom(def, done);
    const players = playersOf(), multi = players.length > 1, qs = voteQs(def);
    const ballots = []; let pi = 0;
    function ballot() {
      const picks = {};
      overlay(`<div class="panel wide vote"><div class="eyebrow">${multi ? 'Detective ' + esc(players[pi].name) : 'Your verdict'}</div><h2>${esc(def.title)}</h2>${def.intro ? `<p class="teaser">${esc(def.intro)}</p>` : ''}
        ${qs.map(q => `<div class="vq"><div class="label">${esc(q.text)}</div><div class="vgrid">${q.options.map(o => voteCard(q, o)).join('')}</div></div>`).join('')}
        <button class="big" id="vConfirm" disabled>Lock in my vote</button>${multi ? '<div class="tip">Votes stay secret until every detective has voted.</div>' : ''}</div>`, true);
      E.overlay.querySelectorAll('.vopt').forEach(b => b.onclick = () => {
        picks[b.dataset.q] = b.dataset.id;
        E.overlay.querySelectorAll(`.vopt[data-q="${b.dataset.q}"]`).forEach(x => x.classList.toggle('on', x === b));
        $('vConfirm').disabled = !qs.every(q => picks[q.id]);
      });
      $('vConfirm').onclick = () => { ballots[pi] = picks; pi++; if (pi < players.length) pass(); else voteResults(def, qs, ballots, done); };
    }
    function pass() {
      overlay(`<div class="panel center"><h2>Pass the device</h2><p>Hand it to <b>${esc(players[pi].name)}</b>. No peeking!</p><button class="big" id="vReady">I'm ready</button></div>`, true);
      $('vReady').onclick = ballot;
    }
    ballot();
  }
  /* Everyone votes on their phone; the TV waits, then reveals. */
  let askId = null;
  function runVoteRoom(def, done) {
    const players = G.players, qs = voteQs(def);
    const phoneQs = qs.map(q => ({ id: q.id, text: q.text, options: q.options.map(o => ({ id: o.id, label: o.label, portrait: o.portrait || null })) }));
    const chips = answers => players.map(p => `<span class="pchip ${answers && answers[p.id] ? 'ok' : ''} ${Room.onlineIds().includes(p.id) ? '' : 'off'}">${answers && answers[p.id] ? '✓ ' : ''}${esc(p.name)}</span>`).join('');
    overlay(`<div class="panel wide vote center"><div class="eyebrow">📱 Detectives, vote on your phones</div><h2>${esc(def.title)}</h2>${def.intro ? `<p class="teaser">${esc(def.intro)}</p>` : ''}
      ${qs.map(q => `<div class="label">${esc(q.text)}</div>`).join('')}
      <div id="vChips" class="pchips">${chips({})}</div><p class="tip" id="vCount">Waiting for votes…</p>
      <button id="vReveal" disabled>Reveal the verdict now</button></div>`, true);
    const aid = Room.ask({ kind: 'vote', title: def.title, intro: def.intro || '', qs: phoneQs }, {
      onProgress: answers => {
        const c = $('vChips'); if (!c) return;
        c.innerHTML = chips(answers);
        const n = Object.keys(answers).length;
        $('vCount').textContent = `${n} of ${Room.onlineIds().length} have voted`;
        $('vReveal').disabled = n === 0;
      },
      onDone: answers => {
        askId = null;
        voteResults(def, qs, players.map(p => answers[p.id] || null), done);
      }
    });
    askId = aid;
    $('vReveal').onclick = () => Room.close(aid);
  }
  function runAccuse(st) {
    const a = st.accuse, ex = (G.cleared && G.cleared[a.qid]) || [];
    G.attempt[a.qid] = (G.attempt[a.qid] || 0) + 1;
    runVote({ ...a.vote, key: a.vote.key + '#' + G.attempt[a.qid], exclude: ex }, () => {
      const verdict = G.verdict[a.qid];
      if (verdict === SOLUTION[a.qid]) push(a.right);
      else { (G.cleared[a.qid] = G.cleared[a.qid] || []).push(verdict); push([...(a.wrong[verdict] || []), { cost: 1 }, st]); }
      next();
    });
  }
  function scoreboard() {
    const players = playersOf();
    const rounds = CASE.scoreRounds;
    const rows = players.map((p, i) => {
      const cells = rounds.map(([k, q]) => { const b = (G.votes[k] || [])[i]; return b ? (b[q] === SOLUTION[q] ? 1 : 0) : null; });
      return { name: p.name, cells, score: cells.filter(c => c === 1).length };
    });
    const best = Math.max(...rows.map(r => r.score));
    return `<div class="label">Detective scoreboard</div><div class="score"><table><tr><th></th>${rounds.map(r => `<th>${r[2]}</th>`).join('')}<th>Total</th></tr>
      ${rows.map(r => `<tr class="${players.length > 1 && r.score === best ? 'top' : ''}"><td>${esc(r.name)}</td>${r.cells.map(c => `<td>${c === null ? '–' : c ? '✓' : '✗'}</td>`).join('')}<td><b>${r.score}</b></td></tr>`).join('')}</table></div>
      ${players.length > 1 ? `<p class="stats">Sharpest detective: <b>${rows.filter(r => r.score === best).map(r => esc(r.name)).join(' & ')}</b></p>` : ''}
      <div class="label">The truth</div><p class="teaser">${CASE.truth(NAMES)}</p>`;
  }

  /* ---------- cliffhanger ---------- */
  function cliffhanger(who) {
    const ei = G.ep, ep = EPS[ei];
    clearTimers(); frames = []; hideChoices(); E.dialog.classList.remove('on');
    sv().completed = Math.max(sv().completed, ei + 1);
    if (ei + 1 < EPS.length) sv().epStart[ei + 1] = snap();
    save.cur = ei + 1 < EPS.length ? { ep: ei + 1, scene: 0, snap: snap() } : null;
    persist();
    Sound.setMood('dread'); Sound.sfx('cliff'); doFlash('#c02020'); doShake();
    E.stage.classList.add('cliffmode'); $('tint').classList.add('on');
    after(700, () => {
      Object.keys(stage).forEach(id => { if (id !== who) hideChar(id); });
      if (who) { showChar(who, 'c', { hale: 's', pennington: 'w', margaret: 'n' }[who] || 'sh'); stage[who].el.classList.add('hero'); spotlight(who); }
    });
    after(2300, () => { E.tbc.textContent = ep.last ? CASE.endCard : 'TO BE CONTINUED…'; E.tbc.classList.add('on'); });
    go(7500, () => summary(who, ep, ei));
  }
  function summary(who, ep, ei) {
    E.tbc.classList.remove('on');
    const last = !!ep.last, voted = ep.vote && G.votes[ep.vote.key];
    const stats = last ? `<div class="stats">Clues found: <b>${G.clues.length}/${Object.keys(CLUES).length}</b> · Composure left: <b>${G.composure}/3</b></div>${scoreboard()}` : '';
    overlay(`<div class="panel center wide"><div class="eyebrow">${last ? CASE.completeLabel : `Episode ${ep.n} complete`}</div><h2>${esc(ep.title)}</h2>
      <div class="label">Suspect watch</div><div class="watch">${suspectWatch(who, ep.watch)}</div>${stats}
      <p class="teaser">${esc(ep.teaser)}</p>
      ${ep.vote ? `<button class="${voted ? '' : 'big'}" id="vBtn">${voted ? 'Change your votes' : (playersOf().length > 1 ? 'Detectives: cast your votes' : 'Cast your vote')}</button>` : ''}
      ${last ? '' : `<button class="${ep.vote && !voted ? '' : 'big'}" id="nextEp">${ep.vote && !voted ? 'Skip voting and continue' : 'Continue'} to Episode ${ep.n + 1}</button>`}<button id="toMenu">Main menu</button></div>`);
    if (ep.vote) $('vBtn').onclick = () => runVote({ ...ep.vote, persist: true }, () => summary(who, ep, ei));
    if (!last) $('nextEp').onclick = () => startEpisode(ei + 1);
    pushStatus(last ? 'ended' : 'playing');
    if (groupLive()) { // on group night the story keeps moving: vote, then on to the next episode
      const sig = summarySig = {};
      setTimeout(() => { if (summarySig !== sig) return; const b = !voted && ep.vote ? $('vBtn') : (!last ? $('nextEp') : null); if (b) b.click(); }, voted ? 20000 : 9000);
    }
    $('toMenu').onclick = showTitle;
  }

  /* ---------- title / episodes ---------- */
  function startEpisode(ei, players, room) {
    const keep = G && G.players, keepRoom = G && G.room;
    G = ei === 0 || !sv().epStart[ei] ? newG() : JSON.parse(sv().epStart[ei]);
    if (ei === 0) { sv().epStart = {}; sv().completed = Math.min(sv().completed, 0); G.players = players || keep || []; G.room = room !== undefined ? !!room : !!keepRoom; }
    else if (room !== undefined) G.room = !!room;
    startScene(ei, 0);
  }
  function playersSetup(then) {
    let n = 1; const names = [];
    E.overlay.classList.remove('title');
    const render = () => {
      overlay(`<div class="panel center"><h2>Who is investigating?</h2><p>Play alone, or pass the device around. Every detective votes on who they think the killers are.</p>
        <div class="nrow">${[1, 2, 3, 4, 5, 6].map(k => `<button class="np ${k === n ? 'on' : ''}" data-n="${k}">${k}</button>`).join('')}</div>
        <div class="names">${n > 1 ? Array.from({ length: n }, (_, i) => `<input class="pname" data-i="${i}" maxlength="14" placeholder="Detective ${i + 1}" value="${esc(names[i] || '')}">`).join('') : ''}</div>
        <button class="big" id="pGo">Begin</button><button id="pBack">Back</button></div>`, true);
      E.overlay.querySelectorAll('.np').forEach(b => b.onclick = () => { n = +b.dataset.n; render(); });
      E.overlay.querySelectorAll('.pname').forEach(i => i.oninput = () => { names[+i.dataset.i] = i.value; });
      $('pBack').onclick = showTitle;
      $('pGo').onclick = () => then(n === 1 ? [{ name: 'Detective' }] : Array.from({ length: n }, (_, i) => ({ name: (names[i] || '').trim() || 'Detective ' + (i + 1) })));
    };
    render();
  }
  /* Choose a case (solo and pass-and-play). */
  function pickCase(then, back) {
    overlay(`<div class="panel wide"><button class="x" id="cBack">×</button><h2>Choose a case</h2><div class="cases">${CASE_LIST.map(c => `<button class="case" data-c="${c.id}"><span class="tag">${esc(c.tag)}</span><b>${esc(c.title)}</b><span class="len">${esc(c.length)}</span><span class="bl">${esc(c.blurb)}</span><span class="src">${esc(c.source)}</span></button>`).join('')}</div></div>`, true);
    $('cBack').onclick = back || showTitle;
    E.overlay.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { useCase(b.dataset.c); then(b.dataset.c); });
  }
  function showTitle() {
    if (IS_TV) return showTvLobby();
    clearTimers(); frames = []; hideChoices(); E.dialog.classList.remove('on'); E.card.classList.remove('on'); E.tbc.classList.remove('on');
    $('tint').classList.remove('on'); E.stage.classList.remove('cliffmode', 'fade');
    hideChar('all'); E.chars.innerHTML = '';
    G = G || newG();
    setBg('exterior', true); setFx('snow'); Sound.setAmbience('wind'); Sound.setMood('theme');
    $('hud').classList.remove('on');
    const canContinue = !!(save.cur && save.cur.snap);
    overlay(`<div class="titlescreen"><div class="eyebrow">Cinematic murder mysteries</div><h1>Mystery Night</h1><div class="sub">Choose a case</div>
      ${canContinue ? `<button class="big" id="tCont">Continue · ${esc((CASES[JSON.parse(save.cur.snap).caseId || 'silverblaze'] || CASES.silverblaze).title)} · Episode ${save.cur.ep + 1}</button>` : ''}
      <button class="${canContinue ? '' : 'big'}" id="tNew">${canContinue ? 'New game' : 'Begin'}</button>
      <button id="tEps">Episodes</button><button id="tGroup" hidden>Host a group night (big screen + phones)</button><button id="tSound">${settings.muted ? 'Sound: off' : 'Sound: on'}</button>${Voice.supported() ? `<button id="tVoice">${settings.voice ? 'Spoken dialogue: on' : 'Spoken dialogue: off'}</button>` : ''}
      <div class="tip">Best with headphones and the sound up. The story plays itself. Tap or press Space to move faster.</div></div>`);
    E.overlay.classList.add('title');
    const go1 = f => () => { Sound.init(); Sound.setMuted(settings.muted); E.overlay.classList.remove('title'); closeOverlay(); $('hud').classList.add('on'); f(); };
    if (canContinue) $('tCont').onclick = go1(() => { G = loadSnap(save.cur.snap); startScene(save.cur.ep, save.cur.scene, { noIntro: save.cur.scene !== (EPS[save.cur.ep].titleScene || 0) }); });
    $('tNew').onclick = () => {
      if (canContinue && !confirm('Start over? Your saved progress will be erased.')) return;
      pickCase(() => playersSetup(players => {
        save.cur = null; sv().epStart = {}; sv().completed = 0;
        go1(() => { G = newG(); startEpisode(0, players); })();
      }));
    };
    $('tEps').onclick = () => { Sound.init(); E.overlay.classList.remove('title'); useCase(save.lastCase || 'silverblaze'); showEpisodes(); };
    $('tSound').onclick = () => { Sound.init(); toggleSound(); showTitle(); };
    if ($('tVoice')) $('tVoice').onclick = () => { toggleVoice(); showTitle(); };
    Room.available().then(ok => { const g = $('tGroup'); if (ok && g) { g.hidden = false; g.onclick = () => { location.href = 'tv'; }; } });
  }
  function showEpisodes() {
    overlay(`<div class="panel wide"><button class="x" id="eBack">×</button><h2>${esc(CASE.title)}: episodes</h2><p class="teaser">Last played case. Start a new game to pick another.</p>` + EPS.map((ep, i) => {
      const open = i <= sv().completed;
      return `<div class="ep ${open ? '' : 'locked'}"><div><b>Episode ${ep.n}: ${esc(ep.title)}</b><br><span>${open ? esc(ep.logline) : 'Finish the previous episode to unlock.'}</span></div>${open ? `<button data-e="${i}">${i < sv().completed ? 'Replay' : 'Play'}</button>` : '<em>Locked</em>'}</div>`;
    }).join('') + `</div>`);
    $('eBack').onclick = showTitle;
    E.overlay.querySelectorAll('[data-e]').forEach(b => b.onclick = () => {
      Sound.init(); closeOverlay(); $('hud').classList.add('on'); startEpisode(+b.dataset.e);
    });
  }


  /* ---------- group night (the TV) ---------- */
  let tvWired = false, tvPaused = false, summarySig = null;
  function pushStatus(phase) {
    if (!IS_TV || !G || !G.room || !Room.code()) return;
    const ep = EPS[G.ep];
    Room.setStatus({ phase: phase || 'playing', text: ep ? `Episode ${ep.n}: ${ep.title}` : '', episode: ep ? ep.n : 0, paused: tvPaused, auto: settings.auto });
  }
  function syncPlayers(list) {
    if (G && G.room) {
      G.players = G.players || [];
      list.filter(p => !p.observer).forEach(p => {
        const have = G.players.find(x => x.id === p.id);
        if (have) have.name = p.name; else G.players.push({ id: p.id, name: p.name });
      });
    }
    renderRoster(list);
    renderLobbyPlayers(list);
  }
  function renderRoster(list) {
    const box = $('roster'); if (!box) return;
    if (!IS_TV || !G || !G.room || !$('hud').classList.contains('on')) { box.innerHTML = ''; return; }
    box.innerHTML = `<span class="rcode">Room <b>${Room.code()}</b></span>` + list.map(p => `<span class="pchip ${p.online ? '' : 'off'}">${p.host ? '👑 ' : ''}${p.observer ? '🎛️ ' : ''}${esc(p.name)}</span>`).join('');
  }
  function renderLobbyPlayers(list) {
    const box = $('lPlayers'); if (!box) return;
    box.innerHTML = list.length ? list.map(p => `<span class="pchip ${p.online ? '' : 'off'}">${p.host ? '👑 ' : ''}${p.observer ? '🎛️ ' : ''}${esc(p.name)}</span>`).join('') : '<span class="tip">Nobody yet. Scan the code to join!</span>';
    const n = list.filter(p => p.online && !p.observer).length, host = list.find(p => p.host);
    const start = $('lStart'), cnt = $('lCount'), hint = $('lHint');
    if (cnt) cnt.textContent = `Detectives (${list.filter(p => !p.observer).length})`;
    if (start) start.disabled = n === 0;
    if (hint) hint.textContent = host ? `${host.name} is the host and can start the story from their phone. (Or press the button here.)` : 'The first detective to join becomes the host.';
  }
  function remotePause(on) {
    if (!IS_TV || !G || !G.room) return;
    if (on && !tvPaused) {
      if (E.overlay.classList.contains('on')) return; // a vote or menu is already holding the story
      tvPaused = true;
      overlay(`<div class="panel center"><h2>Paused</h2><p>The host paused the story.</p></div>`, true);
    } else if (!on && tvPaused) { tvPaused = false; closeOverlay(); }
    pushStatus('playing');
  }
  function onHostCommand(cmd) {
    if (cmd === 'start') { if ($('lStart') && !$('lStart').disabled) return startGroupGame(); if ($('lResume')) return resumeGroupGame(); return; }
    if (!G || !G.room) return;
    if (cmd === 'pause') return remotePause(true);
    if (cmd === 'resume') return remotePause(false);
    if (cmd === 'skip') {
      for (const id of ['vDone', 'nextEp']) if ($(id)) return $(id).click();
      if (!E.overlay.classList.contains('on')) advance();
      return;
    }
    if (cmd === 'auto') { toggleAuto(); return pushStatus('playing'); }
    if (cmd === 'closeAsk') { if (askId !== null) Room.close(askId); return; }
    if (cmd === 'end') { tvPaused = false; Room.setStatus({ phase: 'lobby', text: '', episode: 0, paused: false, auto: settings.auto }); save.cur = null; G = null; persist(); return showTvLobby(); }
  }
  function startGroupGame() {
    Sound.init(); Sound.setMuted(settings.muted);
    const players = Room.players().filter(p => !p.observer).map(p => ({ id: p.id, name: p.name }));
    useCase(CASES[Room.caseId()] ? Room.caseId() : 'silverblaze');
    save.cur = null; sv().epStart = {}; sv().completed = 0;
    E.overlay.classList.remove('title'); closeOverlay(); $('hud').classList.add('on');
    G = newG(); tvPaused = false;
    startEpisode(0, players, true);
    renderRoster(Room.players());
  }
  function resumeGroupGame() {
    Sound.init(); Sound.setMuted(settings.muted);
    G = loadSnap(save.cur.snap); G.room = true; tvPaused = false;
    syncPlayers(Room.players());
    E.overlay.classList.remove('title'); closeOverlay(); $('hud').classList.add('on');
    startScene(save.cur.ep, save.cur.scene, { noIntro: save.cur.scene !== (EPS[save.cur.ep].titleScene || 0) });
  }
  /* No game yet on this screen: start one here, or connect to the moderator's game by its code. */
  function showTvStart(error) {
    E.overlay.classList.remove('title');
    overlay(`<div class="panel center wide"><div class="eyebrow">Group night</div><h2>Mystery Night</h2>
      <div class="choose"><div class="pick"><h3>Start a game here</h3><p>Everyone scans the QR code. The first person to join becomes the moderator.</p><button class="big" id="sNew">Start a new game night</button></div>
      <div class="pick"><h3>The moderator already has a game</h3><p>On their phone they opened this website and tapped <b>Host a game</b>. Type the code they see:</p>
      <input id="sCode" class="codebox" maxlength="4" autocomplete="off" autocapitalize="characters" placeholder="ABCD"><button id="sGo">Connect this screen</button><p class="error" id="sErr">${esc(error || '')}</p></div></div>
      <button id="sSolo">Play on this screen only</button></div>`, true);
    $('sNew').onclick = async () => { try { await Room.create(); showTvLobby(); } catch (err) { showTvStart(err.message); } };
    const go = async () => {
      const c = $('sCode').value.trim().toUpperCase();
      if (!/^[A-Z]{4}$/.test(c)) return ($('sErr').textContent = 'Codes are 4 letters.');
      try { await Room.claim(c); showTvLobby(); } catch (err) { showTvStart(err.message); }
    };
    $('sGo').onclick = go; $('sCode').onkeydown = ev => { if (ev.key === 'Enter') go(); };
    $('sSolo').onclick = () => { location.href = 'index.html'; };
    setTimeout(() => $('sCode') && $('sCode').focus(), 50);
  }
  async function showTvLobby() {
    clearTimers(); frames = []; hideChoices(); E.dialog.classList.remove('on'); E.card.classList.remove('on'); E.tbc.classList.remove('on');
    $('tint').classList.remove('on'); E.stage.classList.remove('cliffmode', 'fade');
    hideChar('all'); E.chars.innerHTML = ''; tvPaused = false;
    setBg('exterior', true); setFx('snow'); Sound.setAmbience('wind'); Sound.setMood('theme');
    $('hud').classList.remove('on'); $('roster').innerHTML = '';
    overlay(`<div class="titlescreen"><div class="eyebrow">Opening the room…</div><h1>Mystery Night</h1></div>`, true);
    E.overlay.classList.add('title');
    let opened = null;
    try { opened = await Room.open(); } catch (err) {
      overlay(`<div class="panel center"><h2>Can't open group night</h2><p>${esc(err.message || 'The game server is not reachable.')}</p><button class="big" id="lRetry">Try again</button><button id="lSolo">Play on this screen only</button></div>`);
      $('lRetry').onclick = showTvLobby; $('lSolo').onclick = () => { location.href = 'index.html'; };
      return;
    }
    if (!opened) return showTvStart();
    if (!tvWired) {
      tvWired = true; Room.on('players', syncPlayers); Room.on('cmd', onHostCommand);
      Room.on('case', id => { if ($('lStart') && CASES[id]) { useCase(id); renderTvLobby(); } });
    }
    useCase(CASES[Room.caseId()] ? Room.caseId() : 'silverblaze');
    renderTvLobby();
  }
  function renderTvLobby() {
    const url = Room.joinUrl(), meta = CASE_LIST.find(c => c.id === CASE.id) || CASE_LIST[0];
    const canResume = !!(save.cur && save.cur.snap && JSON.parse(save.cur.snap).room && JSON.parse(save.cur.snap).caseId === CASE.id);
    let qr = '';
    try { const q = qrcode(0, 'M'); q.addData(url); q.make(); qr = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (err) { qr = ''; }
    const cast = (CASE.cast || SUSPECTS).filter(id => Art.PORTRAITS[id]).map(id => `<div class="cast1"><span class="av" style="--c:${Art.PORTRAITS[id].col}">${Art.portrait(id, 'n')}</span><span>${esc(NAMES[id])}</span></div>`).join('');
    const cases = CASE_LIST.map(c => `<button class="casebtn ${c.id === CASE.id ? 'on' : ''}" data-case="${c.id}"><b>${esc(c.title)}</b><small>${esc(c.tag)}</small></button>`).join('');
    E.overlay.classList.remove('title');
    overlay(`<div class="lobby">
      <div class="lcol"><div class="eyebrow">Mystery Night · tonight's case</div><h1>${esc(meta.title)}</h1><div class="sub">${esc(meta.length)}</div>
        <p class="blurb">${esc(meta.blurb)}</p>
        <p class="blurb dim">${esc(meta.hook)}</p>
        <div class="cast">${cast}</div>
        <div class="cases-row">${cases}</div>
        <div class="meta">2 to 30 detectives · no apps, just your phone · ${esc(meta.source)}</div></div>
      <div class="rcol"><div class="qrbox"><div class="qrtitle">Scan to play!</div><div class="qrsvg">${qr}</div>
        <div class="qrsub">or go to <b>${esc(Room.host())}</b><br>and enter code <b class="codebig">${Room.code()}</b></div></div>
        <div class="label" id="lCount">Detectives (0)</div><div id="lPlayers" class="pchips"></div>
        <p class="tip" id="lHint"></p>
        ${canResume ? `<button class="big" id="lResume">Resume the story</button>` : ''}
        <button class="${canResume ? '' : 'big'}" id="lStart" disabled>Start the story</button>
        <button id="lSolo">Play on this screen only</button></div></div>`, true);
    E.overlay.classList.add('lobbymode');
    renderLobbyPlayers(Room.players());
    E.overlay.querySelectorAll('[data-case]').forEach(b => b.onclick = () => Room.setCase(b.dataset.case));
    $('lStart').onclick = () => { if (canResume && !confirm('Start over? The saved story will be lost.')) return; startGroupGame(); };
    if ($('lResume')) $('lResume').onclick = resumeGroupGame;
    $('lSolo').onclick = () => { Room.forget(); location.href = 'index.html'; };
  }

  /* ---------- wiring ---------- */
  $('bFile').onclick = () => { if (G) openFile(); };
  $('bAuto').onclick = toggleAuto;
  $('bSound').onclick = toggleSound;
  $('bVoice').onclick = toggleVoice;
  // browsers only allow sound after a gesture: unlock on the very first tap or key, so the title music starts too
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { Sound.init(); Sound.unlock(); Sound.setMuted(settings.muted); }, true));
  $('bMenu').onclick = openMenu;
  document.addEventListener('click', e => {
    if (e.target.closest('button, #overlay, #choices, #hud')) return;
    advance();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (E.overlay.dataset.lock) return; E.overlay.classList.contains('on') && !E.overlay.classList.contains('title') ? closeOverlay() : (G && openMenu()); return; }
    if (E.overlay.classList.contains('on')) return;
    if (/^[1-9]$/.test(e.key) && E.choices.classList.contains('on')) {
      const b = E.choices.querySelectorAll('.opt:not([disabled]), .tile:not([disabled]), .chip:not([disabled])')[+e.key - 1];
      if (b) b.click(); return;
    }
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); advance(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !E.overlay.classList.contains('on') && G && save.cur) { /* keep running; audio is context-managed */ } });

  Sound.setMuted(settings.muted); applyVoice();
  window.__game = { get G() { return G; }, startScene, advance, showTitle, save: () => save };
  setBg('exterior', true); setFx('snow');
  showTitle();
})();
