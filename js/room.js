/* Group night, TV side. The TV opens a room on the server, shows a QR code, and then asks the phones
   questions and collects their answers. Same shape as Squad Bingo: Server-Sent Events down, small POSTs up.
   Without the server (for example on GitHub Pages) nothing here is used and the game plays on one screen. */
const Room = (() => {
  let caseId = 'silverblaze', code = null, tvToken = null, es = null, players = [], hostId = null, lastCmd = 0, seq = 0, cur = null, connected = false;
  const listeners = {};
  const emit = (ev, ...a) => (listeners[ev] || []).forEach(f => f(...a));
  const on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
  const onlineIds = () => players.filter(p => p.online && !p.observer).map(p => p.id);
  const KEY = 'bf-tv-room';
  const store = {
    get() { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; } },
    set(v) { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} },
    del() { try { sessionStorage.removeItem(KEY); } catch (e) {} }
  };

  async function available() {
    if (location.protocol === 'file:') return false;
    try { const r = await fetch('health', { cache: 'no-store' }); const j = await r.json(); return !!j.ok; } catch (e) { return false; }
  }
  const post = (path, body) => fetch(`api/rooms/${code}/tv/${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-tv-token': tvToken }, body: JSON.stringify(body || {})
  }).catch(() => {});

  /* Pick up the room this screen already had (after a reload). Returns the code, or null if there is none. */
  async function open() {
    const saved = store.get();
    if (!saved) return null;
    const r = await fetch(`api/rooms/${saved.code}/tv?token=${saved.tvToken}`, { method: 'HEAD' }).catch(() => null);
    if (r && r.ok) { code = saved.code; tvToken = saved.tvToken; connect(); return code; }
    store.del();
    return null;
  }
  /* The big screen opens a brand-new game itself. */
  async function create() {
    const res = await fetch('api/rooms', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not open a room.');
    const j = await res.json();
    code = j.code; tvToken = j.tvToken; store.set({ code, tvToken });
    connect();
    return code;
  }
  /* The big screen connects to a game the moderator made on their phone. */
  async function claim(c) {
    const res = await fetch(`api/rooms/${c}/tv-claim`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(res.status === 404 ? 'No game with that code. The moderator needs to tap "Host a game" on their phone first.' : (j.error || 'Could not connect.'));
    code = j.code; tvToken = j.tvToken; store.set({ code, tvToken });
    connect();
    return code;
  }
  function connect() {
    if (es) es.close();
    es = new EventSource(`api/rooms/${code}/tv?token=${encodeURIComponent(tvToken)}`);
    es.onopen = () => { connected = true; emit('status', true); };
    es.onmessage = e => onState(JSON.parse(e.data));
    es.onerror = () => { connected = false; emit('status', false); };
  }

  function onState(s) {
    players = s.players; hostId = s.hostId;
    if (s.caseId && s.caseId !== caseId) { caseId = s.caseId; emit('case', caseId); }
    emit('players', players, hostId);
    emit('phase', s.phase);
    for (const c of s.cmds || []) if (c.seq > lastCmd) { lastCmd = c.seq; emit('cmd', c.cmd); }
    if (cur && s.ask && s.ask.id === cur.id) {
      cur.answers = s.ask.answers || {};
      if (cur.h.onProgress) cur.h.onProgress(cur.answers, onlineIds());
      if (everyoneAnswered(cur)) finish(cur.id, 'all');
    } else if (cur && !s.ask && Date.now() - cur.at > 2000) {
      // the server lost the question (restart): put it back
      post('ask', { id: cur.id, def: cur.def });
    }
    if (cur && cur.waitForPlayers && onlineIds().length) { cur.waitForPlayers = false; }
  }
  function everyoneAnswered(a) { const ids = onlineIds(); return ids.length > 0 && ids.every(id => id in a.answers); }

  /* Ask all the phones something. h.onProgress(answers, onlineIds) as they answer, h.onDone(answers, why) at the end. */
  function ask(def, h) {
    const id = ++seq;
    cur = { id, def, h, answers: {}, at: Date.now(), timer: null };
    post('ask', { id, def });
    if (def.timeoutMs) cur.timer = setTimeout(() => finish(id, 'timeout'), def.timeoutMs);
    return id;
  }
  function finish(id, why, result) {
    const a = cur;
    if (!a || a.id !== id) return;
    clearTimeout(a.timer); cur = null;
    post('endask', { id, result: result || null });
    if (a.h.onDone) a.h.onDone(a.answers, why);
  }
  function cancel(id) { if (cur && cur.id === id) { clearTimeout(cur.timer); cur = null; post('endask', { id, result: null }); } }
  function showResult(result) { post('endask', { id: -1, result }); }
  function setStatus(s) { post('status', s); }
  function setCase(id) { caseId = id; post('case', { id }); emit('case', id); }
  function close(id, result) { finish(id, 'host', result); }

  return {
    available, open, create, claim, on, ask, setCase, caseId: () => caseId, cancel, close, showResult, setStatus,
    code: () => code, players: () => players, hostId: () => hostId, onlineIds,
    live: () => !!code && connected && onlineIds().length > 0,
    joinUrl: () => (location.origin + '/' + code),
    host: () => location.host,
    forget: () => store.del()
  };
})();
