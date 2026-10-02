/* The Blackwood Files, phone side. Join the room shown on the big screen, vote on your phone.
   The host (the first person in) also gets moderator controls. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#app');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const KEY = 'bf-session';
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} },
    del() { try { localStorage.removeItem(KEY); } catch (e) {} }
  };
  const pathCode = (location.pathname.match(/^\/([A-Za-z]{4})$/) || [])[1];
  const urlCode = (pathCode || new URLSearchParams(location.search).get('c') || '').toUpperCase();

  let session = null, stream = null, view = null, clockSkew = 0, shown = null, picks = {}, tick = null;

  async function api(path, body) {
    const res = await fetch(`api/rooms/${session.code}/${path}`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-player-token': session.token }, body: JSON.stringify(body || {})
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || 'Something went wrong.');
    return j;
  }

  /* ---------- join or host ---------- */
  const friendly = (res, j, fallback) => {
    if (res.status === 404) return 'No game with that code. If you are hosting, tap "Host a game" and create one. Otherwise check the code on the big screen.';
    return (j && j.error) || fallback;
  };
  function noServer() {
    app.innerHTML = `<div class="card join"><div class="eyebrow">The Blackwood Files</div><h1>Group night needs the game server</h1>
      <p class="teaser">This page can't reach a game. Open the address shown on the big screen (it ends in <b>/tv</b>) or the link the moderator gave you. If you are the moderator, your game server has to be running first.</p></div>`;
  }
  function showJoin(error, mode) {
    const saved = store.get();
    mode = mode || (new URLSearchParams(location.search).has('host') && !urlCode ? 'host' : 'join');
    const joinForm = `<form id="jf">
        ${urlCode ? `<div class="codeshow">Game <b>${esc(urlCode)}</b></div>` : `<label>Game code<input id="jc" maxlength="4" autocomplete="off" autocapitalize="characters" placeholder="ABCD" required></label>`}
        <label>Your name<input id="jn" maxlength="14" autocomplete="nickname" placeholder="Detective" value="${esc((saved && saved.name) || '')}" required></label>
        <button class="primary">Join the investigation</button><p class="error" role="alert">${esc(error || '')}</p></form>`;
    const hostForm = `<form id="hf">
        <p class="teaser">You run the night: start the story, pause, close votes. You get a 4-letter code to show on the big screen.</p>
        <label>Your name<input id="hn" maxlength="14" autocomplete="nickname" placeholder="Moderator" value="${esc((saved && saved.name) || '')}" required></label>
        <label class="check"><input type="checkbox" id="ho"> I'll only moderate (I won't vote)</label>
        <button class="primary">Create the game</button><p class="error" role="alert">${esc(error || '')}</p></form>`;
    app.innerHTML = `<div class="card join"><div class="eyebrow">A murder mystery for the whole table</div><h1>The Blackwood Files</h1>
      <div class="tabs"><button data-m="join" class="${mode === 'join' ? 'on' : ''}">Join a game</button><button data-m="host" class="${mode === 'host' ? 'on' : ''}">Host a game</button></div>
      ${mode === 'join' ? joinForm : hostForm}</div>`;
    app.querySelectorAll('[data-m]').forEach(b => b.onclick = () => showJoin('', b.dataset.m));
    if (mode === 'join') $('#jf').onsubmit = async e => {
      e.preventDefault();
      const code = (urlCode || $('#jc').value).trim().toUpperCase(), name = $('#jn').value.trim();
      if (!/^[A-Z]{4}$/.test(code)) return showJoin('Codes are 4 letters.', 'join');
      try {
        const res = await fetch(`api/rooms/${code}/join`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) return showJoin(friendly(res, j, 'Could not join.'), 'join');
        session = { code: j.code, id: j.id, token: j.token, name };
        store.set(session); connect();
      } catch (err) { showJoin('Could not reach the game. Check your connection.', 'join'); }
    };
    else $('#hf').onsubmit = async e => {
      e.preventDefault();
      const name = $('#hn').value.trim(), observer = $('#ho').checked;
      try {
        const res = await fetch('api/rooms', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, observer }) });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) return showJoin(friendly(res, j, 'Could not create the game.'), 'host');
        session = { code: j.code, id: j.id, token: j.token, name };
        store.set(session); connect();
      } catch (err) { showJoin('Could not reach the game server.', 'host'); }
    };
  }

  /* ---------- live connection ---------- */
  function connect() {
    if (stream) stream.close();
    renderShell();
    stream = new EventSource(`api/rooms/${session.code}/events?token=${encodeURIComponent(session.token)}`);
    stream.onmessage = e => { const v = JSON.parse(e.data); clockSkew = (v.now || Date.now()) - Date.now(); view = v; render(); };
    stream.onerror = async () => {
      if (stream.readyState !== EventSource.CLOSED) { setBanner('Reconnecting…'); return; }
      try {
        const r = await fetch(`api/rooms/${session.code}/events?token=${encodeURIComponent(session.token)}`, { method: 'HEAD' });
        if (r.status === 401 || r.status === 404) { store.del(); session = null; return showJoin('That game has ended, or you were removed. Join again?'); }
      } catch (e) { /* offline */ }
      setTimeout(() => session && connect(), 2500);
    };
  }
  function setBanner(t) { const b = $('#banner'); if (b) { b.textContent = t || ''; b.hidden = !t; } }

  /* ---------- screens ---------- */
  function renderShell() {
    app.innerHTML = `<header class="top"><div><b>The Blackwood Files</b><small>Game ${esc(session.code)}</small></div><div id="me" class="me"></div></header>
      <div id="banner" class="banner" hidden></div><section id="body"></section><section id="host"></section><section id="people"></section>`;
    shown = null;
  }
  function render() {
    if (!$('#body')) renderShell();
    $('#me').innerHTML = `${view.you.host ? '👑 ' : ''}${esc(view.you.name)}`;
    setBanner(view.tvOnline ? '' : (view.needsTv ? 'No big screen is connected yet.' : 'The big screen is offline. Waiting for it to come back…'));
    const ask = view.ask, fresh = view.result && Date.now() + clockSkew - view.result.at < 15000;
    if (ask && view.you.observer) renderWatching(ask);
    else if (ask) renderAsk(ask);
    else if (fresh) renderResult(view.result);
    else renderStatus();
    renderHost();
    renderPeople();
  }

  function renderStatus() {
    shown = null; clearInterval(tick);
    const s = view.status || {};
    const lobby = view.phase === 'lobby';
    $('#body').innerHTML = `<div class="card center"><div class="big-emoji">${lobby ? '🕯️' : view.phase === 'ended' ? '🎬' : '🎞️'}</div>
      <h2>${lobby ? (view.you.observer ? `You're the moderator, ${esc(view.you.name)}` : `You're in, ${esc(view.you.name)}`) : view.phase === 'ended' ? 'The night is over' : esc(s.text || 'Watch the big screen')}</h2>
      ${lobby && typeof CASE_LIST !== 'undefined' ? `<p class="meta">Tonight's case: <b>${esc((CASE_LIST.find(c => c.id === view.caseId) || {}).title || '')}</b></p>` : ''}
      <p>${lobby ? (view.you.host ? (view.tvOnline ? 'You are the host. Start the story when everyone has joined.' : 'You are the host. First connect a big screen below.') : 'Waiting for the host to start the story. Look up at the big screen.') : s.paused ? 'Paused.' : 'Eyes on the screen. When the story needs you, your phone will buzz.'}</p></div>`;
  }

  function renderWatching(ask) {
    shown = null; clearInterval(tick);
    $('#body').innerHTML = `<div class="card center"><div class="big-emoji">🗳️</div><h2>The detectives are voting</h2><p>${ask.answered || 0} of ${ask.total || 0} have answered. Close the vote early below if you need to.</p></div>`;
  }
  function renderResult(r) {
    shown = null; clearInterval(tick);
    $('#body').innerHTML = `<div class="card"><h2>${esc(r.title || 'The group has spoken')}</h2>${r.rows.map(row => `<div class="vq"><div class="label">${esc(row.q)}</div>${row.lines.map(l => `<div class="bar ${l.win ? 'win' : ''}"><span class="bl">${esc(l.label)}</span><span class="bn">${l.count}</span></div>`).join('')}</div>`).join('')}</div>`;
  }

  function renderAsk(ask) {
    if (!shown || shown.id !== ask.id) { buildAsk(ask); try { navigator.vibrate && navigator.vibrate([70]); } catch (e) {} }
    const meta = $('#askmeta');
    if (meta) meta.textContent = `${ask.answered || 0} of ${ask.total || 0} answered`;
  }
  function buildAsk(ask) {
    shown = { id: ask.id }; picks = ask.yourPicks && typeof ask.yourPicks === 'object' ? { ...ask.yourPicks } : {};
    let chosen = typeof ask.yourPicks === 'string' ? ask.yourPicks : null;
    const timer = ask.deadline ? `<div class="timer"><span id="tbar"></span></div>` : '';
    if (ask.kind === 'pick') {
      $('#body').innerHTML = `<div class="card"><div class="eyebrow">Your decision</div><h2>${esc(ask.prompt || ask.title || 'Choose')}</h2>${timer}
        <div class="opts ${ask.options.length > 8 ? 'many' : ''}">${ask.options.map(o => `<button class="opt ${chosen === o.id ? 'on' : ''}" data-id="${esc(o.id)}">${esc(o.label)}</button>`).join('')}</div>
        <p class="meta" id="askmeta"></p></div>`;
      document.querySelectorAll('.opt').forEach(b => b.onclick = async () => {
        chosen = b.dataset.id; document.querySelectorAll('.opt').forEach(x => x.classList.toggle('on', x === b));
        try { await api('answer', { askId: ask.id, picks: chosen }); } catch (e) { setBanner(e.message); }
      });
    } else {
      $('#body').innerHTML = `<div class="card"><div class="eyebrow">${esc(ask.title || 'Cast your vote')}</div>${ask.intro ? `<p class="teaser">${esc(ask.intro)}</p>` : ''}
        ${ask.qs.map(q => `<div class="vq"><div class="label">${esc(q.text)}</div><div class="vgrid">${q.options.map(o => `<button class="vopt ${picks[q.id] === o.id ? 'on' : ''}" data-q="${esc(q.id)}" data-id="${esc(o.id)}">${o.portrait && typeof Art !== 'undefined' ? `<span class="av" style="--c:${(Art.PORTRAITS[o.portrait] || {}).col || '#888'}">${Art.portrait(o.portrait, 'n')}</span>` : ''}<span>${esc(o.label)}</span></button>`).join('')}</div></div>`).join('')}
        <button class="primary" id="lock" disabled>Lock in my vote</button><p class="meta" id="askmeta"></p></div>`;
      const ready = () => ask.qs.every(q => picks[q.id]);
      const sync = () => { $('#lock').disabled = !ready(); };
      document.querySelectorAll('.vopt').forEach(b => b.onclick = () => {
        picks[b.dataset.q] = b.dataset.id;
        document.querySelectorAll(`.vopt[data-q="${b.dataset.q}"]`).forEach(x => x.classList.toggle('on', x === b));
        $('#lock').textContent = 'Lock in my vote'; sync();
      });
      $('#lock').onclick = async () => {
        try { await api('answer', { askId: ask.id, picks }); $('#lock').textContent = 'Vote locked ✓ (tap a card to change it)'; $('#lock').disabled = true; }
        catch (e) { setBanner(e.message); }
      };
      sync();
      if (ask.yourPicks && typeof ask.yourPicks === 'object') { $('#lock').textContent = 'Vote locked ✓ (tap a card to change it)'; $('#lock').disabled = true; }
    }
    clearInterval(tick);
    if (ask.deadline) tick = setInterval(() => {
      const bar = $('#tbar'); if (!bar) return;
      const total = ask.timeoutMs || 25000, left = ask.deadline - (Date.now() + clockSkew);
      bar.style.width = Math.max(0, Math.min(100, left / total * 100)) + '%';
    }, 200);
  }

  function renderHost() {
    const box = $('#host');
    if (!view.you.host) { box.innerHTML = ''; return; }
    const s = view.status || {}, lobby = view.phase === 'lobby', ended = view.phase === 'ended';
    const tvCard = view.tvOnline ? '' : `<div class="card tvcard"><div class="eyebrow">📺 Show on a big screen</div>
      <p>On the TV or laptop, open <b>${esc(location.host)}/tv</b> and type this code:</p><div class="bigcode">${esc(view.code)}</div>
      <p class="meta">${view.tvWindow ? 'The big screen can connect now.' : 'Tap below first, then type the code on the big screen.'}</p>
      ${view.tvWindow ? '' : '<button data-cmd="openTv">Allow a big screen to connect</button>'}</div>`;
    const pick = !lobby || typeof CASE_LIST === 'undefined' ? '' : `<div class="card"><div class="eyebrow">🔎 Tonight's case</div><div class="hbtns">${CASE_LIST.map(c =>
      `<button data-case="${c.id}" class="${c.id === view.caseId ? 'primary' : ''}">${esc(c.title)}<br><span class="meta">${esc(c.tag)} · ${esc(c.length)}</span></button>`).join('')}</div></div>`;
    box.innerHTML = `${tvCard}${pick}<div class="card host"><div class="eyebrow">👑 Host controls</div><div class="hbtns">
      ${lobby ? `<button class="primary" data-cmd="start" ${view.tvOnline ? '' : 'disabled'}>▶ Start the story</button>` : ended ? '' : `
        <button data-cmd="${s.paused ? 'resume' : 'pause'}">${s.paused ? '▶ Resume' : '⏸ Pause'}</button>
        <button data-cmd="skip">⏭ Skip line</button>
        <button data-cmd="auto">Auto-play: ${s.auto ? 'on' : 'off'}</button>
        ${view.ask ? `<button class="primary" data-cmd="closeAsk">✔ Close voting now</button>` : ''}
        <button class="danger" data-cmd="end">⏹ End the night</button>`}
    </div></div>`;
    box.querySelectorAll('[data-case]').forEach(b => b.onclick = async () => {
      try { await api('command', { cmd: 'case', arg: b.dataset.case }); } catch (e) { setBanner(e.message); }
    });
    box.querySelectorAll('[data-cmd]').forEach(b => b.onclick = async () => {
      if (b.dataset.cmd === 'end' && !confirm('End the night for everyone?')) return;
      try { await api('command', { cmd: b.dataset.cmd }); } catch (e) { setBanner(e.message); }
    });
  }

  function renderPeople() {
    const box = $('#people'), host = view.you.host;
    box.innerHTML = `<div class="card"><div class="eyebrow">Detectives (${view.players.filter(p => !p.observer).length})</div><ul class="plist">${view.players.map(p => `<li class="${p.online ? '' : 'off'}"><span>${p.host ? '👑 ' : ''}${esc(p.name)}${p.observer ? ' · moderator' : ''}${p.id === view.you.id ? ' (you)' : ''}</span>
      ${host && p.id !== view.you.id ? `<span class="pa"><button data-act="makeHost" data-id="${p.id}">Make host</button><button data-act="kick" data-id="${p.id}">Remove</button></span>` : ''}</li>`).join('')}</ul></div>`;
    box.querySelectorAll('[data-act]').forEach(b => b.onclick = async () => {
      if (b.dataset.act === 'kick' && !confirm('Remove this player?')) return;
      try { await api('command', { cmd: b.dataset.act, arg: b.dataset.id }); } catch (e) { setBanner(e.message); }
    });
  }

  /* ---------- start ---------- */
  (async () => {
    try { const h = await fetch('health', { cache: 'no-store' }); const j = await h.json(); if (!j.ok) throw new Error('no'); } catch (e) { return noServer(); }
    const saved = store.get();
    if (saved && (!urlCode || saved.code === urlCode)) {
      session = saved;
      try {
        const r = await fetch(`api/rooms/${session.code}/events?token=${encodeURIComponent(session.token)}`, { method: 'HEAD' });
        if (r.ok) return connect();
      } catch (e) { /* offline: fall through to the form */ }
      store.del(); session = null;
    }
    showJoin();
  })();
  document.addEventListener('visibilitychange', () => { if (!document.hidden && session && (!stream || stream.readyState === EventSource.CLOSED)) connect(); });
})();
