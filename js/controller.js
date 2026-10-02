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

  /* ---------- join ---------- */
  function showJoin(error) {
    const saved = store.get();
    app.innerHTML = `<div class="card join">
      <div class="eyebrow">A murder mystery for the whole table</div>
      <h1>The Blackwood Files</h1>
      <form id="jf">
        ${urlCode ? `<div class="codeshow">Game <b>${esc(urlCode)}</b></div>` : `<label>Game code<input id="jc" maxlength="4" autocomplete="off" autocapitalize="characters" placeholder="ABCD" required></label>`}
        <label>Your name<input id="jn" maxlength="14" autocomplete="nickname" placeholder="Detective" value="${esc((saved && saved.name) || '')}" required></label>
        <button class="primary">Join the investigation</button>
        <p class="error" role="alert">${esc(error || '')}</p>
      </form></div>`;
    $('#jf').onsubmit = async e => {
      e.preventDefault();
      const code = (urlCode || $('#jc').value).trim().toUpperCase(), name = $('#jn').value.trim();
      if (!/^[A-Z]{4}$/.test(code)) return showJoin('Codes are 4 letters.');
      try {
        const res = await fetch(`api/rooms/${code}/join`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) return showJoin(j.error || 'Could not join.');
        session = { code: j.code, id: j.id, token: j.token, name };
        store.set(session); connect();
      } catch (err) { showJoin('Could not reach the game. Check your connection.'); }
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
    setBanner(view.tvOnline ? '' : 'The big screen is offline. Waiting for it to come back…');
    const ask = view.ask, fresh = view.result && Date.now() + clockSkew - view.result.at < 15000;
    if (ask) renderAsk(ask);
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
      <h2>${lobby ? `You're in, ${esc(view.you.name)}` : view.phase === 'ended' ? 'The night is over' : esc(s.text || 'Watch the big screen')}</h2>
      <p>${lobby ? (view.you.host ? 'You are the host. Start the story when everyone has joined.' : 'Waiting for the host to start the story. Look up at the big screen.') : s.paused ? 'Paused.' : 'Eyes on the screen. When the story needs you, your phone will buzz.'}</p></div>`;
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
    box.innerHTML = `<div class="card host"><div class="eyebrow">👑 Host controls</div><div class="hbtns">
      ${lobby ? `<button class="primary" data-cmd="start">▶ Start the story</button>` : ended ? '' : `
        <button data-cmd="${s.paused ? 'resume' : 'pause'}">${s.paused ? '▶ Resume' : '⏸ Pause'}</button>
        <button data-cmd="skip">⏭ Skip line</button>
        <button data-cmd="auto">Auto-play: ${s.auto ? 'on' : 'off'}</button>
        ${view.ask ? `<button class="primary" data-cmd="closeAsk">✔ Close voting now</button>` : ''}
        <button class="danger" data-cmd="end">⏹ End the night</button>`}
    </div></div>`;
    box.querySelectorAll('[data-cmd]').forEach(b => b.onclick = async () => {
      if (b.dataset.cmd === 'end' && !confirm('End the night for everyone?')) return;
      try { await api('command', { cmd: b.dataset.cmd }); } catch (e) { setBanner(e.message); }
    });
  }

  function renderPeople() {
    const box = $('#people'), host = view.you.host;
    box.innerHTML = `<div class="card"><div class="eyebrow">Detectives (${view.players.length})</div><ul class="plist">${view.players.map(p => `<li class="${p.online ? '' : 'off'}"><span>${p.host ? '👑 ' : ''}${esc(p.name)}${p.id === view.you.id ? ' (you)' : ''}</span>
      ${host && p.id !== view.you.id ? `<span class="pa"><button data-act="makeHost" data-id="${p.id}">Make host</button><button data-act="kick" data-id="${p.id}">Remove</button></span>` : ''}</li>`).join('')}</ul></div>`;
    box.querySelectorAll('[data-act]').forEach(b => b.onclick = async () => {
      if (b.dataset.act === 'kick' && !confirm('Remove this player?')) return;
      try { await api('command', { cmd: b.dataset.act, arg: b.dataset.id }); } catch (e) { setBanner(e.message); }
    });
  }

  /* ---------- start ---------- */
  (async () => {
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
