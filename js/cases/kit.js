/* Shared pieces for the Sherlock Holmes cases: story-step helpers and the cast.
   Each character is a few traits (see Art.define) plus a voice: [speaker id, speed, pitch]. */
const KIT = (() => {
  const N = t => ({ nar: t });
  const S = (who, t, e) => ({ say: who, t, e });
  const Y = t => S('you', t);
  const show = (id, pos, e) => ({ show: id, pos, e });
  const hide = id => ({ hide: id });
  const clue = id => ({ clue: id });
  const sfx = n => ({ sfx: n });
  const slate = t => ({ slate: t });
  const flag = f => ({ flag: f });
  const flash = c => ({ flash: c });
  const shake = () => ({ shake: 1 });

  /* voices: Kokoro speaker ids 0 af, 1 af_bella, 2 af_nicole, 3 af_sarah, 4 af_sky, 5 am_adam, 6 am_michael, 7 bf_emma, 8 bf_isabella, 9 bm_george, 10 bm_lewis */
  const CAST = {
    holmes: { name: 'Sherlock Holmes', voice: [9, 0.97, 1.0], look: { skin: '#dcb99c', col: '#c9b27a', suit: '#3a3a44', shirt: '#ece6d6', accent: '#7a3a2a', hair: { style: 'sidepart', color: '#2a2420' }, hat: 'deerstalker', hatColor: '#7a6a4a', collar: 'cravat', ry: 82, age: 0.3, build: 'slim' } },
    watson: { name: 'Dr. Watson', voice: [5, 0.95, 1.0], look: { skin: '#dcb090', col: '#8aa0b8', suit: '#4a4038', accent: '#2a4a6a', hair: { style: 'short', color: '#6a5a3a' }, beard: 'mustache', facial: '#6a5a3a', collar: 'tie', ry: 76, age: 0.2, build: 'broad' } },
    lestrade: { name: 'Inspector Lestrade', voice: [6, 1.05, 0.97], look: { skin: '#d6ae90', col: '#a8a8a8', suit: '#3a3a3a', accent: '#3a3a3a', hair: { style: 'short', color: '#2a2a2a' }, beard: 'mustache', facial: '#2a2a2a', hat: 'bowler', hatColor: '#1e1e1e', collar: 'tie', ry: 82, age: 0.3 } },
    gregory: { name: 'Inspector Gregory', voice: [6, 1.0, 0.94], look: { skin: '#d6ae90', col: '#7aa0c0', suit: '#26303a', accent: '#3a3a3a', hair: { style: 'short', color: '#3a2a1a' }, beard: 'mustache', facial: '#3a2a1a', hat: 'bowler', hatColor: '#222', collar: 'tie', age: 0.3, build: 'broad' } },
    hopkins: { name: 'Inspector Hopkins', voice: [6, 1.08, 1.0], look: { skin: '#e4bf9e', col: '#6a9ac0', suit: '#2a3a4a', accent: '#6a2a2a', hair: { style: 'short', color: '#6a4a2a' }, hat: 'bowler', hatColor: '#1e2630', collar: 'tie', ry: 72, age: 0 } },
    ross: { name: 'Colonel Ross', voice: [10, 0.9, 0.93], look: { skin: '#d8a888', col: '#c0604d', suit: '#5a2a22', shirt: '#efe8d8', accent: '#3a2a22', hair: { style: 'bald', color: '#d0d0d0' }, beard: 'mutton', facial: '#dcdcdc', collar: 'high', ry: 78, age: 0.7, build: 'broad' } },
    simpson: { name: 'Fitzroy Simpson', voice: [5, 1.02, 1.07], look: { skin: '#e0bc9c', col: '#c07ab0', suit: '#6a2a52', accent: '#c8a24a', hair: { style: 'sidepart', color: '#17120f' }, beard: 'mustache', facial: '#17120f', collar: 'cravat', age: 0.2, build: 'slim' } },
    silas: { name: 'Silas Brown', voice: [9, 0.9, 0.9], look: { skin: '#d8a888', col: '#a08a52', suit: '#5a4a32', accent: '#7a3a2a', hair: { style: 'bald', color: '#9a9a9a' }, beard: 'full', facial: '#a0a0a0', hat: 'cap', hatColor: '#4a3a2a', collar: 'scarf', ry: 78, age: 0.8 } },
    ned: { name: 'Ned Hunter', voice: [5, 1.12, 1.12], look: { skin: '#e4c0a0', col: '#9ab06a', suit: '#6a5a3a', hair: { style: 'short', color: '#6a4a2a' }, hat: 'cap', hatColor: '#3a3a2a', collar: 'open', ry: 72, age: 0, build: 'slim' } },
    mrsstraker: { name: 'Mrs. Straker', voice: [8, 0.95, 1.0], look: { skin: '#e0bc9c', col: '#8ab0a8', suit: '#2a3a3a', hair: { style: 'bun', color: '#4a3a30' }, collar: 'lace', ry: 74, age: 0.3 } },
    edith: { name: 'Edith Baxter', voice: [3, 1.05, 1.0], look: { skin: '#e4c4a4', col: '#c9a0a0', suit: '#2a2a2a', shirt: '#f0ece0', accent: '#d0c8b8', hair: { style: 'bun', color: '#6a4a30' }, hat: 'bonnet', hatColor: '#f2eee4', collar: 'apron', ry: 72, age: 0 } },
    jamesm: { name: 'James McCarthy', voice: [5, 1.05, 1.04], look: { skin: '#e2bc9a', col: '#8aa070', suit: '#4a4a50', accent: '#3a3a3a', hair: { style: 'short', color: '#5a3a22' }, collar: 'open', ry: 72, age: 0 } },
    charlesm: { name: 'Charles McCarthy', voice: [9, 0.88, 0.92], look: { skin: '#d49a78', col: '#a07a5a', suit: '#5a4a3a', hair: { style: 'short', color: '#8a8a8a' }, beard: 'stubble', hat: 'cap', hatColor: '#3a3028', collar: 'open', age: 0.6, build: 'broad' } },
    turner: { name: 'John Turner', voice: [10, 0.85, 0.92], look: { skin: '#d8b8a0', col: '#b0a090', suit: '#26262c', shirt: '#eee8da', accent: '#2a2a2a', hair: { style: 'short', color: '#dcdcdc' }, beard: 'mutton', facial: '#e4e4e4', collar: 'high', ry: 82, age: 0.95 } },
    alice: { name: 'Alice Turner', voice: [7, 1.04, 1.0], look: { skin: '#e8c8a8', col: '#7ab0d0', suit: '#3a5a7a', hair: { style: 'long', color: '#7a4a2a' }, collar: 'lace', ry: 73, age: 0 } },
    patience: { name: 'Patience Moran', voice: [3, 1.1, 1.05], look: { skin: '#e6c4a2', col: '#d8a060', suit: '#7a4a3a', accent: '#d8d0b0', hair: { style: 'long', color: '#c8a860' }, collar: 'scarf', ry: 72, age: 0 } },
    crowder: { name: 'William Crowder', voice: [6, 0.92, 0.9], look: { skin: '#d8a888', col: '#7a9a5a', suit: '#3a4a2a', hair: { style: 'short', color: '#5a4a3a' }, beard: 'full', facial: '#5a4a3a', hat: 'cap', hatColor: '#3a4a2a', collar: 'open', age: 0.4, build: 'broad' } },
    lady: { name: 'Lady Brackenstall', voice: [2, 0.95, 1.04], look: { skin: '#e8c8a8', col: '#c08ad0', suit: '#4a2a5a', hair: { style: 'bun', color: '#b88a3a' }, collar: 'lace', ry: 73, age: 0.1 } },
    theresa: { name: 'Theresa Wright', voice: [8, 1.0, 0.96], look: { skin: '#dcb898', col: '#c0a088', suit: '#2a2a2a', shirt: '#f0ece0', accent: '#d0c8b8', hair: { style: 'bun', color: '#4a3a2a' }, hat: 'bonnet', hatColor: '#f2eee4', collar: 'apron', age: 0.3 } },
    croker: { name: 'Captain Croker', voice: [10, 0.97, 1.0], look: { skin: '#c8946a', col: '#4a7aba', suit: '#1a2a4a', accent: '#c8a24a', hair: { style: 'short', color: '#7a5a2a' }, beard: 'full', facial: '#8a6a30', hat: 'sailor', hatColor: '#1a2030', collar: 'open', ry: 77, age: 0.2, build: 'broad' } },
    eustace: { name: 'Sir Eustace', voice: [9, 0.9, 0.9], look: { skin: '#d08a6a', col: '#b06a5a', suit: '#4a2a2a', hair: { style: 'short', color: '#4a3a2a' }, beard: 'stubble', collar: 'cravat', accent: '#6a2a2a', ry: 78, age: 0.4, build: 'broad' } }
  };
  const opt = id => ({ id, label: CAST[id].name, portrait: id });
  /* Register a Holmes case. o.cast = people shown on screen (the player is Holmes, speaking as "you"). */
  const build = o => {
    const names = { you: 'Sherlock Holmes' };
    const characters = { nar: { name: '', voice: [10, 0.95, 1] }, you: { name: 'Sherlock Holmes', voice: CAST.holmes.voice } };
    ['holmes', ...o.cast].forEach(id => { names[id] = CAST[id].name; characters[id] = { name: CAST[id].name, voice: CAST[id].voice, look: CAST[id].look }; });
    CASES[o.id] = {
      id: o.id, title: o.title, names, suspects: o.suspects, suspectOptions: o.suspects.map(opt), clues: o.clues, solution: o.solution,
      episodes: o.episodes, characters, cast: o.cast, scoreRounds: o.scoreRounds, truth: o.truth, endCard: o.endCard, completeLabel: o.completeLabel
    };
    return CASES[o.id];
  };
  return { N, S, Y, show, hide, clue, sfx, slate, flag, flash, shake, CAST, opt, build };
})();
