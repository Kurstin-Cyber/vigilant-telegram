/* Scene runner for The Blackwood Files. */
let G = null; // game state, global so story conditions can read it
const has = id => !!G && G.clues.includes(id);

(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const { NAMES, CLUES, episodes: EPS } = STORY;
  const SAVE_KEY = 'blackwood-files-v2', SET_KEY = 'blackwood-files-settings';
  const E = {
    stage: $('stage'), bg: [$('bgA'), $('bgB')], fx: $('fx'), chars: $('chars'), dialog: $('dialog'),
    dname: $('dname'), dtext: $('dtext'), dnext: $('dnext'), choices: $('choices'), card: $('card'),
    overlay: $('overlay'), slate: $('slate'), flash: $('flash'), tbc: $('tbc')
  };

  /* ---------- persistence ---------- */
  let save = { cur: null, epStart: {}, completed: 0 };
  let settings = { auto: true, muted: false, voice: true };
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) save = Object.assign(save, s); } catch (e) {}
  try { const s = JSON.parse(localStorage.getItem(SET_KEY)); if (s) settings = Object.assign(settings, s); } catch (e) {}
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); localStorage.setItem(SET_KEY, JSON.stringify(settings)); } catch (e) {} };
  const newG = () => ({ ep: 0, scene: 0, clues: [], flags: {}, done: {}, marks: {}, composure: 3, finale: false });
  const snap = () => JSON.stringify(G);

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
  const PITCH = { pennington: 0.8, margaret: 1.1, vivian: 1.45, hale: 0.95, dobbs: 1.25, you: 1.0, pike: 0.85 };
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
      if (si === 0 && !save.epStart[ei]) save.epStart[ei] = snap();
      persist(); updateHud();
      E.stage.classList.remove('fade');
      const pre = si === 0 && !opts.noIntro ? intro(ep) : [];
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
  }
  function hideChoices() { E.choices.classList.remove('on'); E.choices.innerHTML = ''; E.stage.classList.remove('choosing'); }
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
      $('retry').onclick = () => { G = JSON.parse(save.cur.snap); startScene(save.cur.ep, save.cur.scene, { noIntro: true }); };
      $('tomenu').onclick = showTitle;
    });
  }

  /* ---------- HUD / overlays ---------- */
  function updateHud() {
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
  function overlay(html) { E.overlay.innerHTML = html; E.overlay.classList.add('on'); setPaused(true); }
  function closeOverlay() { E.overlay.classList.remove('on'); E.overlay.innerHTML = ''; setPaused(false); }

  function suspectWatch(whoHighlight, watch) {
    return ['pennington', 'margaret', 'vivian', 'hale'].map(id => `<div class="sus ${id === whoHighlight ? 'hot' : ''}"><div class="av" style="--c:${Art.PORTRAITS[id].col}">${Art.portrait(id, id === whoHighlight ? 'sh' : 'n')}</div><div><b style="color:${Art.PORTRAITS[id].col}">${NAMES[id]}</b>${id === whoHighlight ? ' <em>CLIFFHANGER</em>' : ''}<br><span>${esc(watch[id] || 'No information yet.')}</span></div></div>`).join('');
  }
  function openFile(tab = 'ev') {
    const by = type => G.clues.filter(c => CLUES[c].type === type).map(c => `<div class="clue"><span class="ico">${CLUES[c].icon}</span><div><b>${esc(CLUES[c].name)}</b><br>${esc(CLUES[c].text)}</div></div>`).join('') || '<div class="empty">Nothing yet.</div>';
    const doneEps = Math.min(save.completed, EPS.length), watch = doneEps ? EPS[doneEps - 1].watch : {};
    const marks = ['Unmarked', 'Suspect', 'Cleared'];
    const body = tab === 'ev' ? by('Evidence') : tab === 'te' ? by('Testimony')
      : `<div class="watch">${suspectWatch(null, watch)}</div><div class="label">Your notes</div>` + ['pennington', 'margaret', 'vivian', 'hale'].map(id => `<div class="markrow"><span>${NAMES[id]}</span><button class="mk s${G.marks[id] || 0}" data-mk="${id}">${marks[G.marks[id] || 0]}</button></div>`).join('');
    overlay(`<div class="panel"><button class="x" id="closeFile">×</button><h2>Case file</h2>
      <div class="tabs"><button data-t="ev" class="${tab === 'ev' ? 'on' : ''}">Evidence</button><button data-t="te" class="${tab === 'te' ? 'on' : ''}">Testimony</button><button data-t="su" class="${tab === 'su' ? 'on' : ''}">Suspects</button></div>${body}</div>`);
    $('closeFile').onclick = closeOverlay;
    E.overlay.querySelectorAll('[data-t]').forEach(b => b.onclick = () => openFile(b.dataset.t));
    E.overlay.querySelectorAll('[data-mk]').forEach(b => b.onclick = () => { G.marks[b.dataset.mk] = ((G.marks[b.dataset.mk] || 0) + 1) % 3; persist(); openFile('su'); });
  }
  function openMenu() {
    overlay(`<div class="panel center"><h2>Paused</h2>
      <button class="big" id="mResume">Resume</button><button id="mRestart">Restart this scene</button><button id="mAuto">${settings.auto ? 'Auto-advance: on' : 'Auto-advance: off'}</button><button id="mSound">${settings.muted ? 'Sound: off' : 'Sound: on'}</button>${Voice.supported() ? `<button id="mVoice">${settings.voice ? 'Spoken dialogue: on' : 'Spoken dialogue: off'}</button>` : ''}<button id="mTitle">Main menu</button></div>`);
    $('mResume').onclick = closeOverlay;
    $('mRestart').onclick = () => { G = JSON.parse(save.cur.snap); startScene(save.cur.ep, save.cur.scene, { noIntro: true, quick: true }); };
    $('mAuto').onclick = () => { toggleAuto(); openMenu(); };
    $('mSound').onclick = () => { toggleSound(); openMenu(); };
    if ($('mVoice')) $('mVoice').onclick = () => { toggleVoice(); openMenu(); };
    $('mTitle').onclick = showTitle;
  }
  function toggleAuto() {
    settings.auto = !settings.auto; persist(); updateHud();
    if (!settings.auto && waiter && typeof waiter.t === 'number' && !typing) { clearTimeout(waiter.t); E.dnext.style.opacity = 1; }
  }
  function toggleSound() { settings.muted = !settings.muted; Sound.setMuted(settings.muted); applyVoice(); persist(); updateHud(); }
  function toggleVoice() { settings.voice = !settings.voice; applyVoice(); persist(); updateHud(); }
  function showError(err) {
    overlay(`<div class="panel center"><h2>Something went wrong</h2><p>${esc(err && err.message || err)}</p><button class="big" id="eTitle">Main menu</button></div>`);
    $('eTitle').onclick = showTitle;
  }

  /* ---------- cliffhanger ---------- */
  function cliffhanger(who) {
    const ei = G.ep, ep = EPS[ei];
    clearTimers(); frames = []; hideChoices(); E.dialog.classList.remove('on');
    save.completed = Math.max(save.completed, ei + 1);
    if (ei + 1 < EPS.length) save.epStart[ei + 1] = snap();
    save.cur = ei + 1 < EPS.length ? { ep: ei + 1, scene: 0, snap: snap() } : null;
    persist();
    Sound.setMood('dread'); Sound.sfx('cliff'); doFlash('#c02020'); doShake();
    E.stage.classList.add('cliffmode'); $('tint').classList.add('on');
    after(700, () => {
      Object.keys(stage).forEach(id => { if (id !== who) hideChar(id); });
      if (who) { showChar(who, 'c', { hale: 's', pennington: 'w' }[who] || 'sh'); stage[who].el.classList.add('hero'); spotlight(who); }
    });
    after(2300, () => { E.tbc.textContent = ep.last ? 'SEASON ONE · THE END?' : 'TO BE CONTINUED…'; E.tbc.classList.add('on'); });
    go(7500, () => summary(who, ep, ei));
  }
  function summary(who, ep, ei) {
    E.tbc.classList.remove('on');
    const last = !!ep.last;
    const stats = last ? `<div class="stats">Clues found: <b>${G.clues.length}/${Object.keys(CLUES).length}</b> · Composure left: <b>${G.composure}/3</b></div>` : '';
    overlay(`<div class="panel center wide"><div class="eyebrow">${last ? 'Season One complete' : `Episode ${ep.n} complete`}</div><h2>${esc(ep.title)}</h2>
      <div class="label">Suspect watch</div><div class="watch">${suspectWatch(who, ep.watch)}</div>${stats}
      <p class="teaser">${esc(ep.teaser)}</p>
      ${last ? '' : `<button class="big" id="nextEp">Continue to Episode ${ep.n + 1}</button>`}<button id="toMenu">Main menu</button></div>`);
    if (!last) $('nextEp').onclick = () => startEpisode(ei + 1);
    $('toMenu').onclick = showTitle;
  }

  /* ---------- title / episodes ---------- */
  function startEpisode(ei) {
    G = ei === 0 || !save.epStart[ei] ? newG() : JSON.parse(save.epStart[ei]);
    if (ei === 0) { save.epStart = {}; }
    startScene(ei, 0);
  }
  function showTitle() {
    clearTimers(); frames = []; hideChoices(); E.dialog.classList.remove('on'); E.card.classList.remove('on'); E.tbc.classList.remove('on');
    $('tint').classList.remove('on'); E.stage.classList.remove('cliffmode', 'fade');
    hideChar('all'); E.chars.innerHTML = '';
    G = G || newG();
    setBg('exterior', true); setFx('snow'); Sound.setAmbience('wind'); Sound.setMood('theme');
    $('hud').classList.remove('on');
    const canContinue = !!(save.cur && save.cur.snap);
    overlay(`<div class="titlescreen"><div class="eyebrow">A murder mystery in episodes</div><h1>The Blackwood Files</h1><div class="sub">Season One</div>
      ${canContinue ? `<button class="big" id="tCont">Continue · Episode ${save.cur.ep + 1}</button>` : ''}
      <button class="${canContinue ? '' : 'big'}" id="tNew">${canContinue ? 'New game' : 'Begin'}</button>
      <button id="tEps">Episodes</button><button id="tSound">${settings.muted ? 'Sound: off' : 'Sound: on'}</button>${Voice.supported() ? `<button id="tVoice">${settings.voice ? 'Spoken dialogue: on' : 'Spoken dialogue: off'}</button>` : ''}
      <div class="tip">Best with headphones and the sound up. The story plays itself. Tap or press Space to move faster.</div></div>`);
    E.overlay.classList.add('title');
    const go1 = f => () => { Sound.init(); Sound.setMuted(settings.muted); E.overlay.classList.remove('title'); closeOverlay(); $('hud').classList.add('on'); f(); };
    if (canContinue) $('tCont').onclick = go1(() => { G = JSON.parse(save.cur.snap); startScene(save.cur.ep, save.cur.scene, { noIntro: save.cur.scene !== 0 }); });
    $('tNew').onclick = () => {
      if (canContinue && !confirm('Start over? Your saved progress will be erased.')) return;
      save = { cur: null, epStart: {}, completed: 0 };
      go1(() => { G = newG(); startEpisode(0); })();
    };
    $('tEps').onclick = () => { Sound.init(); E.overlay.classList.remove('title'); showEpisodes(); };
    $('tSound').onclick = () => { Sound.init(); toggleSound(); showTitle(); };
    if ($('tVoice')) $('tVoice').onclick = () => { toggleVoice(); showTitle(); };
  }
  function showEpisodes() {
    overlay(`<div class="panel wide"><button class="x" id="eBack">×</button><h2>Episodes</h2>` + EPS.map((ep, i) => {
      const open = i <= save.completed;
      return `<div class="ep ${open ? '' : 'locked'}"><div><b>Episode ${ep.n}: ${esc(ep.title)}</b><br><span>${open ? esc(ep.logline) : 'Finish the previous episode to unlock.'}</span></div>${open ? `<button data-e="${i}">${i < save.completed ? 'Replay' : 'Play'}</button>` : '<em>Locked</em>'}</div>`;
    }).join('') + `</div>`);
    $('eBack').onclick = showTitle;
    E.overlay.querySelectorAll('[data-e]').forEach(b => b.onclick = () => {
      Sound.init(); closeOverlay(); $('hud').classList.add('on'); startEpisode(+b.dataset.e);
    });
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
    if (e.key === 'Escape') { E.overlay.classList.contains('on') && !E.overlay.classList.contains('title') ? closeOverlay() : (G && openMenu()); return; }
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
