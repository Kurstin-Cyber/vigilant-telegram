/* Spoken dialogue: plays the pre-generated neural-voice recordings in audio/voice/.
   Each line's file is named by a hash of "speaker|text" (see tools/extract_lines.js).
   A line with no recording is simply read silently, so the game never stalls on audio. */
const Voice = (() => {
  const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  const el = new Audio(); el.preload = 'auto';
  let enabled = true, cur = null, cbs = [], watchdog = null;

  function hash(s) { // FNV-1a over UTF-8 bytes; keep in sync with tools/extract_lines.js
    let h = 0x811c9dc5;
    for (const b of new TextEncoder().encode(s)) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  }
  const url = (who, text) => 'audio/voice/' + hash((who || 'nar') + '|' + text) + '.mp3';

  function finish(skipped) {
    clearTimeout(watchdog);
    el.onended = el.onerror = el.onplaying = null;
    const had = cur !== null; cur = null;
    try { el.pause(); } catch (e) {}
    if (had && typeof Sound !== 'undefined') Sound.duck(false);
    const list = cbs; cbs = [];
    list.forEach(f => f(!!skipped));
  }
  function stop(skipped) { if (cur !== null || cbs.length) finish(skipped); }

  function speak(who, text) {
    if (!enabled || !text) return false;
    if (cur !== null) finish(false);
    const tok = {}; cur = tok;
    el.onplaying = () => { if (cur === tok && typeof Sound !== 'undefined') Sound.duck(true); };
    el.onended = () => { if (cur === tok) finish(false); };
    el.onerror = () => { if (cur === tok) finish(false); };
    el.src = url(who, text);
    const p = el.play();
    if (p && p.catch) p.catch(() => { if (cur === tok) finish(false); });
    watchdog = setTimeout(() => { if (cur === tok) finish(false); }, 10000 + text.length * 150);
    return true;
  }

  return {
    supported: () => true,
    isOn: () => enabled,
    setOn(v) { enabled = !!v; if (!enabled) stop(true); },
    speak, stop,
    busy: () => cur !== null,
    whenDone(cb) { if (cur === null) cb(false); else cbs.push(cb); },
    warm(who, text) { try { const a = new Audio(); a.preload = 'auto'; a.src = url(who, text); } catch (e) {} },
    pause() { if (cur !== null) { try { el.pause(); } catch (e) {} } },
    resume() { if (cur !== null && el.paused) { const p = el.play(); if (p && p.catch) p.catch(() => {}); } },
    // phones only let an audio element play later if it was started during a tap
    prime() { if (cur === null) { try { el.src = SILENT; const mine = el.src; const p = el.play(); if (p && p.then) p.then(() => { if (cur === null && el.src === mine) el.pause(); }).catch(() => {}); } catch (e) {} } }
  };
})();
