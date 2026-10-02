/* Procedural scene backgrounds and character portraits (inline SVG, no image files). */
const Art = (() => {
  let uid = 0;
  const nid = () => 'a' + (uid++);
  const seeded = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const svg = inner => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  function grad(a, b, vertical = true) {
    const id = nid();
    return [id, `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`];
  }
  function glow(cx, cy, r, color, op = 0.8, cls = '') {
    const id = nid();
    return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
  }
  function room(wallA, wallB, floorA, floorB, horizon = 640) {
    const [w, wd] = grad(wallA, wallB), [f, fd] = grad(floorA, floorB);
    return `<defs>${wd}${fd}</defs>
      <rect width="1600" height="${horizon}" fill="url(#${w})"/>
      <rect y="${horizon}" width="1600" height="${900 - horizon}" fill="url(#${f})"/>
      <rect y="${horizon - 8}" width="1600" height="16" fill="#000" opacity=".4"/>`;
  }
  function books(x, y, w, h, rows, seed) {
    const r = seeded(seed), cols = ['#5b2a2a', '#2e3f55', '#3d4d2e', '#6b5426', '#41294f', '#2a2a2a', '#7a3b20'];
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#150d07"/>`;
    const rh = h / rows;
    for (let i = 0; i < rows; i++) {
      let bx = x + 8;
      const by = y + i * rh;
      while (bx < x + w - 14) {
        const bw = 10 + r() * 14, bh = rh * (0.6 + r() * 0.3);
        s += `<rect x="${bx.toFixed(0)}" y="${(by + rh - 8 - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="${cols[Math.floor(r() * cols.length)]}" opacity=".9"/>`;
        bx += bw + 1;
      }
      s += `<rect x="${x}" y="${by + rh - 8}" width="${w}" height="8" fill="#2a1a0d"/>`;
    }
    return s + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#2a1a0d" stroke-width="8"/>`;
  }
  function window_(x, y, w, h, sky = '#14233a', snow = true) {
    const [g, gd] = grad(sky, '#2b4466');
    let s = `<defs>${gd}</defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${g})"/>`;
    if (snow) { const r = seeded(x + 7); for (let i = 0; i < 40; i++) s += `<circle cx="${x + r() * w}" cy="${y + r() * h}" r="${1 + r() * 2}" fill="#fff" opacity=".7"/>`; }
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#0c0805" stroke-width="10"/>`;
    s += `<rect x="${x + w / 2 - 4}" y="${y}" width="8" height="${h}" fill="#0c0805"/><rect x="${x}" y="${y + h / 2 - 4}" width="${w}" height="8" fill="#0c0805"/>`;
    return s;
  }
  function curtains(x, y, w, h, color = '#5a1f22') {
    return `<path d="M${x - 40} ${y - 20} H${x + 40} V${y + h + 20} H${x - 40} Z" fill="${color}" opacity=".95"/><path d="M${x + w - 40} ${y - 20} H${x + w + 40} V${y + h + 20} H${x + w - 40} Z" fill="${color}" opacity=".95"/><rect x="${x - 60}" y="${y - 34}" width="${w + 120}" height="12" fill="#c8a24a" opacity=".8"/>`;
  }
  function fireplace(x, y, w, h) {
    return `<rect x="${x - 30}" y="${y - 40}" width="${w + 60}" height="${h + 40}" fill="#2a2018"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0a0503"/>
      ${glow(x + w / 2, y + h * 0.7, w * 1.4, '#ff8a2a', 0.85, 'flicker')}
      <path d="M${x + w * 0.25} ${y + h} Q${x + w * 0.35} ${y + h * 0.4} ${x + w * 0.5} ${y + h * 0.55} Q${x + w * 0.6} ${y + h * 0.3} ${x + w * 0.75} ${y + h} Z" fill="#ffb14a" class="flicker"/>
      <rect x="${x - 50}" y="${y - 56}" width="${w + 100}" height="18" fill="#3a2c20"/>`;
  }
  function chair(x, y, color = '#3b1c18') {
    return `<path d="M${x} ${y} h160 v-260 q0 -40 -40 -40 h-80 q-40 0 -40 40 z" fill="${color}"/><rect x="${x + 10}" y="${y - 20}" width="140" height="60" rx="14" fill="${color}"/>`;
  }
  function table(x, y, w, color = '#3b2412') {
    return `<rect x="${x}" y="${y}" width="${w}" height="26" fill="${color}"/><rect x="${x + 20}" y="${y + 26}" width="18" height="${900 - y - 30}" fill="#1b0f07"/><rect x="${x + w - 38}" y="${y + 26}" width="18" height="${900 - y - 30}" fill="#1b0f07"/>`;
  }
  function candle(x, y) {
    return `<rect x="${x - 4}" y="${y}" width="8" height="34" fill="#e8dcc0"/>${glow(x, y - 8, 46, '#ffc866', 0.9, 'flicker')}<ellipse cx="${x}" cy="${y - 6}" rx="4" ry="9" fill="#ffd98a" class="flicker"/>`;
  }
  function snowGround(y) {
    const [g, gd] = grad('#cfd9e6', '#8da0b8');
    return `<defs>${gd}</defs><path d="M0 ${y} Q300 ${y - 30} 600 ${y - 6} T1200 ${y - 14} T1600 ${y - 4} V900 H0 Z" fill="url(#${g})"/>`;
  }
  function tree(x, y, s = 1) {
    return `<g stroke="#0b0e14" stroke-width="${6 * s}" fill="none" stroke-linecap="round"><path d="M${x} ${y} v${-200 * s}"/><path d="M${x} ${y - 120 * s} l${-60 * s} ${-70 * s}"/><path d="M${x} ${y - 150 * s} l${70 * s} ${-80 * s}"/><path d="M${x} ${y - 190 * s} l${-30 * s} ${-60 * s}"/><path d="M${x} ${y - 90 * s} l${55 * s} ${-40 * s}"/></g>`;
  }

  /* ---------- Backgrounds ---------- */
  const BG = {
    black: () => svg(`<rect width="1600" height="900" fill="#050404"/>`),

    exterior: () => {
      const [g, gd] = grad('#0a0f1c', '#2a3a55'), r = seeded(11);
      let wins = '';
      for (let i = 0; i < 9; i++) for (let j = 0; j < 2; j++) if (r() > 0.25) wins += `<rect x="${430 + i * 90}" y="${420 + j * 110}" width="36" height="58" fill="#ffc866" opacity="${0.5 + r() * 0.4}"/>`;
      return svg(`<defs>${gd}</defs><rect width="1600" height="900" fill="url(#${g})"/>
        ${glow(1250, 150, 160, '#cfe0ff', 0.35)}
        <circle cx="1250" cy="150" r="46" fill="#e8f0ff" opacity=".85"/>
        <path d="M0 640 L0 560 L120 520 L240 560 L240 640 Z" fill="#070a10"/>
        <g fill="#0a0d14"><rect x="380" y="380" width="840" height="300"/><path d="M360 380 L800 250 L1240 380 Z"/><rect x="560" y="300" width="60" height="100"/><rect x="980" y="290" width="60" height="110"/><path d="M700 380 L800 300 L900 380 Z"/><rect x="740" y="520" width="120" height="160"/></g>
        ${wins}
        <rect x="742" y="522" width="116" height="156" fill="#ffb14a" opacity=".75"/>
        ${glow(800, 600, 220, '#ffb14a', 0.45)}
        ${snowGround(690)}
        ${tree(150, 700, 1.3)}${tree(1450, 710, 1.5)}${tree(300, 720, 0.9)}
        <path d="M720 900 L780 690 L820 690 L880 900 Z" fill="#aab7c9" opacity=".55"/>`);
    },

    study: (alive) => {
      return svg(`${room('#2b2219', '#150e08', '#3a2616', '#160b05')}
        ${books(40, 90, 460, 540, 5, 3)}
        ${window_(660, 130, 260, 320)}${curtains(660, 130, 260, 320, '#4a1c1e')}
        ${fireplace(1090, 360, 220, 270)}
        <rect x="1000" y="120" width="140" height="190" fill="#2a1a10" stroke="#a8822e" stroke-width="6"/><circle cx="1070" cy="215" r="44" fill="#4b3322"/>
        <path d="M540 640 h520 v40 h-520 z" fill="#241408"/>
        <rect x="560" y="560" width="480" height="30" fill="#4a2f16"/><rect x="580" y="590" width="40" height="90" fill="#1d1007"/><rect x="980" y="590" width="40" height="90" fill="#1d1007"/>
        ${glow(760, 530, 200, '#ffd98a', 0.45, 'flicker')}
        <rect x="740" y="540" width="40" height="20" fill="#0b3d2a"/><path d="M765 540 q10 -40 40 -40 h-20 q-20 0 -20 40" fill="#c8a24a"/>
        <g opacity=".95"><ellipse cx="500" cy="740" rx="140" ry="22" fill="#000" opacity=".4"/>${chair(430, 700, '#31150f')}
        ${alive ? '' : '<path d="M470 640 q20 -150 70 -150 q50 0 60 150 z" fill="#0d0907"/><circle cx="525" cy="470" r="38" fill="#0d0907"/>'}</g>
        <rect x="0" y="0" width="1600" height="900" fill="#000" opacity=".15"/>`);
    },

    study_alive: () => BG.study(true),
    library: () => {
      return svg(`${room('#22190f', '#120b06', '#2d1c10', '#120a05')}
        ${books(0, 60, 540, 580, 6, 5)}${books(1060, 60, 540, 580, 6, 9)}
        <rect x="560" y="70" width="460" height="320" fill="#0f0a06"/>
        ${window_(620, 100, 340, 360, '#0f1d33')}${curtains(620, 100, 340, 360, '#2f3d2a')}
        <path d="M120 640 L200 120" stroke="#6a4a22" stroke-width="12"/><path d="M200 640 L280 120" stroke="#6a4a22" stroke-width="12"/>
        <g stroke="#6a4a22" stroke-width="8"><path d="M140 520 H235"/><path d="M155 420 H250"/><path d="M170 320 H265"/></g>
        ${fireplace(700, 470, 200, 170)}
        <path d="M1180 700 q0 -140 100 -140 q100 0 100 140 z" fill="#3e1b1a"/><rect x="1160" y="680" width="240" height="70" rx="22" fill="#4b2020"/>
        ${glow(1280, 540, 220, '#ffd98a', 0.4)}
        <rect x="1255" y="480" width="50" height="80" fill="#caa14a" opacity=".6"/>`);
    },

    conservatory: () => {
      const [g, gd] = grad('#0b1a2e', '#2c4a6a');
      let panes = '';
      for (let i = 0; i <= 16; i++) panes += `<path d="M${i * 100} 0 V640" stroke="#5f7a6a" stroke-width="5" opacity=".6"/>`;
      for (let j = 0; j < 7; j++) panes += `<path d="M0 ${j * 100} H1600" stroke="#5f7a6a" stroke-width="5" opacity=".6"/>`;
      const r = seeded(21);
      let snow = '';
      for (let i = 0; i < 90; i++) snow += `<circle cx="${r() * 1600}" cy="${r() * 640}" r="${1 + r() * 2.4}" fill="#fff" opacity=".6"/>`;
      let plants = '';
      for (let i = 0; i < 9; i++) {
        const x = 80 + i * 180, h = 140 + r() * 160;
        plants += `<g fill="#1f4a2c" opacity=".95"><ellipse cx="${x}" cy="${640 - h}" rx="70" ry="${h * 0.5}"/><ellipse cx="${x - 40}" cy="${660 - h * 0.6}" rx="50" ry="${h * 0.4}" transform="rotate(-20 ${x - 40} ${660 - h * 0.6})"/><ellipse cx="${x + 40}" cy="${660 - h * 0.6}" rx="50" ry="${h * 0.4}" transform="rotate(20 ${x + 40} ${660 - h * 0.6})"/></g><circle cx="${x + 20}" cy="${600 - h * 0.5}" r="14" fill="${i % 2 ? '#d86a9a' : '#e8d86a'}"/>`;
      }
      return svg(`<defs>${gd}</defs><rect width="1600" height="640" fill="url(#${g})"/>${snow}${panes}
        ${glow(800, 80, 500, '#8fb0d8', 0.25)}
        <rect y="640" width="1600" height="260" fill="#1d2b22"/>${plants}
        <rect x="520" y="560" width="560" height="26" fill="#6a5a3a"/><rect x="540" y="586" width="16" height="130" fill="#3a2f1c"/><rect x="1044" y="586" width="16" height="130" fill="#3a2f1c"/>
        <path d="M760 560 q0 -70 80 -70 h60 q30 0 30 40 v30 z" fill="#14100c"/><rect x="800" y="540" width="70" height="20" fill="#3a3025"/>
        <rect x="610" y="545" width="26" height="14" fill="#cfcfd2"/>`);
    },

    kitchen: () => {
      return svg(`${room('#3a2a1c', '#1d130b', '#2a1e14', '#110a05')}
        <g fill="none" stroke="#5d4630" stroke-width="3" opacity=".4">${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 100} 0 V630"/>`).join('')}</g>
        <rect x="120" y="360" width="560" height="280" fill="#15100c"/><rect x="150" y="390" width="500" height="200" fill="#0a0604"/>
        ${glow(400, 540, 320, '#ff7a1c', 0.7, 'flicker')}
        <rect x="140" y="320" width="520" height="40" fill="#2a2018"/>
        ${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${300 + i * 120}" cy="${120 + (i % 2) * 40}" r="${30 + (i % 3) * 10}" fill="#8a5a2a" stroke="#c28a42" stroke-width="4"/><path d="M${300 + i * 120} 0 V${90 + (i % 2) * 40}" stroke="#222" stroke-width="3"/>`).join('')}
        <rect x="900" y="200" width="560" height="26" fill="#4a3320"/><rect x="900" y="360" width="560" height="26" fill="#4a3320"/>
        ${Array.from({ length: 12 }, (_, i) => `<path d="M${930 + i * 44} 200 l8 -50 h22 l8 50 z" fill="#b8c8d8" opacity=".5"/>`).join('')}
        ${Array.from({ length: 7 }, (_, i) => `<rect x="${920 + i * 76}" y="${316 - (i % 2) * 20}" width="46" height="${44 + (i % 2) * 20}" fill="${['#6a4a2a', '#3a4a5a', '#5a3a3a'][i % 3]}"/>`).join('')}
        <rect x="760" y="560" width="620" height="30" fill="#6a4a2a"/><rect x="800" y="590" width="26" height="150" fill="#2a1a0c"/><rect x="1310" y="590" width="26" height="150" fill="#2a1a0c"/>
        <circle cx="1000" cy="545" r="30" fill="#cfc9b8"/><rect x="1100" y="520" width="100" height="40" fill="#7a5a3a"/>`);
    },

    dining: () => {
      let chands = '';
      for (let i = 0; i < 5; i++) chands += `<circle cx="${560 + i * 120}" cy="${240 + (i % 2) * 14}" r="9" fill="#ffd98a"/>${glow(560 + i * 120, 240, 60, '#ffc866', 0.5, 'flicker')}`;
      return svg(`${room('#3b1a1c', '#1c0b0c', '#2a190f', '#0f0804')}
        <g stroke="#000" stroke-width="3" opacity=".18">${Array.from({ length: 33 }, (_, i) => `<path d="M${i * 50} 0 V630"/>`).join('')}</g>
        ${window_(120, 120, 220, 360)}${curtains(120, 120, 220, 360, '#5d2326')}${window_(1260, 120, 220, 360)}${curtains(1260, 120, 220, 360, '#5d2326')}
        <path d="M800 0 V200" stroke="#222" stroke-width="4"/><path d="M540 250 H1060" stroke="#c8a24a" stroke-width="8"/>${chands}
        <path d="M300 600 H1300 L1420 760 H180 Z" fill="#3a2412"/><path d="M180 760 H1420 V800 H180 Z" fill="#241408"/>
        <rect x="360" y="560" width="880" height="44" fill="#d9d2c0" opacity=".1"/>
        ${[420, 560, 700, 900, 1040, 1180].map(x => `<ellipse cx="${x}" cy="640" rx="50" ry="10" fill="#e8e2d4" opacity=".8"/>`).join('')}
        ${candle(700, 560)}${candle(900, 560)}
        <rect x="660" y="680" width="280" height="60" fill="#4a2a14"/>
        <g fill="#150a06"><rect x="330" y="560" width="70" height="200" rx="14"/><rect x="1200" y="560" width="70" height="200" rx="14"/><rect x="760" y="520" width="80" height="110" rx="14"/></g>`);
    },


    train: () => {
      const [g, gd] = grad('#2b3a52', '#c98a5a'), r = seeded(61);
      let hills = '', lines = '';
      for (let i = 0; i < 14; i++) lines += `<rect x="${i * 120 + (i % 3) * 7}" y="${300 + r() * 120}" width="${60 + r() * 60}" height="3" fill="#0a0e18" opacity=".35"/>`;
      return svg(`${room('#3a2418', '#1a0e08', '#2a1810', '#0f0805', 700)}
        <rect x="480" y="120" width="640" height="420" fill="#0a0e18"/><defs>${gd}</defs>
        <rect x="490" y="130" width="620" height="400" fill="url(#${g})"/>
        <path d="M490 430 Q640 330 780 400 T1110 380 V530 H490 Z" fill="#1c2434"/><path d="M490 470 Q700 410 900 460 T1110 450 V530 H490 Z" fill="#10161f"/>
        <g clip-path="inset(130px 490px 370px 490px)">${lines}</g>
        <rect x="480" y="120" width="640" height="420" fill="none" stroke="#5a3a1c" stroke-width="22"/><rect x="788" y="130" width="24" height="400" fill="#5a3a1c"/>
        <path d="M60 560 h340 v160 q0 40 -40 40 h-260 q-40 0 -40 -40z" fill="#6e1f24"/><path d="M1200 560 h340 v160 q0 40 -40 40 h-260 q-40 0 -40 -40z" fill="#6e1f24"/>
        <rect x="40" y="130" width="360" height="22" fill="#c8a24a" opacity=".6"/><rect x="1200" y="130" width="360" height="22" fill="#c8a24a" opacity=".6"/>
        ${glow(800, 80, 330, '#ffc866', 0.5, 'flicker')}<circle cx="800" cy="70" r="20" fill="#ffd98a"/>`);
    },
    stable: () => {
      let stalls = '';
      for (let i = 0; i < 4; i++) {
        const x = 70 + i * 380;
        stalls += `<rect x="${x}" y="150" width="340" height="480" fill="#2a1b10"/><rect x="${x + 20}" y="170" width="300" height="440" fill="#150d07"/>
          <path d="M${x + 150} 520 q-10 -140 40 -200 q10 -50 50 -50 l30 40 q-30 20 -20 60 q20 100 -10 150z" fill="${i % 2 ? '#3b2616' : '#1d1209'}" opacity=".95"/>
          <rect x="${x}" y="150" width="340" height="14" fill="#4a3320"/><path d="M${x + 20} 600 q150 -30 300 0 v20 h-300z" fill="#9a8030" opacity=".6"/>`;
      }
      return svg(`${room('#2c1e12', '#140c06', '#3a2a18', '#150d06', 650)}${stalls}
        ${glow(800, 220, 380, '#ffb14a', 0.45, 'flicker')}<rect x="780" y="120" width="40" height="60" fill="#caa14a" opacity=".7"/>
        <path d="M0 700 H1600" stroke="#000" opacity=".3" stroke-width="3"/>`);
    },
    moor: () => {
      const [g, gd] = grad('#2a3140', '#9aa0a8'), r = seeded(77);
      let gorse = '', mist = '';
      for (let i = 0; i < 40; i++) gorse += `<ellipse cx="${r() * 1600}" cy="${560 + r() * 280}" rx="${20 + r() * 40}" ry="${8 + r() * 14}" fill="${r() > .5 ? '#2c3a22' : '#4a4a1c'}" opacity=".8"/>`;
      for (let i = 0; i < 6; i++) mist += `<ellipse cx="${r() * 1600}" cy="${480 + r() * 260}" rx="${300 + r() * 300}" ry="${30 + r() * 30}" fill="#c9ced4" opacity=".14"/>`;
      return svg(`<defs>${gd}</defs><rect width="1600" height="900" fill="url(#${g})"/>
        <path d="M0 520 Q250 420 520 500 T1040 470 T1600 500 V900 H0 Z" fill="#323c34"/><path d="M0 600 Q300 540 640 590 T1300 570 T1600 600 V900 H0 Z" fill="#26301f"/>
        <path d="M0 720 Q400 670 800 710 T1600 700 V900 H0 Z" fill="#1c2417"/>${gorse}
        <g fill="#15181b"><rect x="1180" y="420" width="46" height="120" rx="8"/><rect x="1250" y="440" width="40" height="100" rx="8"/><rect x="1110" y="450" width="36" height="90" rx="8"/></g>
        ${mist}<path d="M700 900 Q780 760 860 640 T1000 520" stroke="#6a5a40" stroke-width="26" fill="none" opacity=".5"/>`);
    },
    racecourse: () => {
      const [g, gd] = grad('#7fb2e0', '#d8ecf8'), r = seeded(88);
      let flags = '', crowd = '';
      for (let i = 0; i < 16; i++) flags += `<path d="M${100 + i * 95} 250 l22 10 -22 10z" fill="${['#c83c3c', '#e8d24a', '#3c6ac8'][i % 3]}"/><path d="M${100 + i * 95} 250 v-10" stroke="#fff" stroke-width="3"/>`;
      for (let i = 0; i < 90; i++) crowd += `<circle cx="${60 + r() * 1480}" cy="${420 + r() * 70}" r="${6 + r() * 4}" fill="${['#3a2a22', '#6a4a3a', '#2a3a4a', '#7a2a2a'][Math.floor(r() * 4)]}"/>`;
      return svg(`<defs>${gd}</defs><rect width="1600" height="900" fill="url(#${g})"/>
        <rect x="200" y="300" width="1200" height="200" fill="#a9916a"/><path d="M200 300 L300 220 H1300 L1400 300Z" fill="#7a5a3a"/>${flags}${crowd}
        <rect y="520" width="1600" height="380" fill="#5f9a3a"/><path d="M0 640 H1600" stroke="#fff" stroke-width="8"/><path d="M0 760 H1600" stroke="#fff" stroke-width="8"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${60 + i * 200}" y="630" width="8" height="140" fill="#fff"/>`).join('')}
        ${glow(1300, 120, 260, '#fff4c0', 0.5)}`);
    },
    pool: () => {
      const [g, gd] = grad('#1b2a22', '#4a5a42'), r = seeded(99);
      let reeds = '';
      for (let i = 0; i < 40; i++) reeds += `<path d="M${200 + r() * 1200} 700 q${r() * 20 - 10} -${40 + r() * 60} ${r() * 20 - 10} -${80 + r() * 60}" stroke="#2c3a22" stroke-width="3" fill="none"/>`;
      return svg(`<defs>${gd}</defs><rect width="1600" height="900" fill="url(#${g})"/>
        ${tree(120, 700, 2.2)}${tree(1480, 720, 2.4)}${tree(380, 640, 1.2)}${tree(1180, 650, 1.3)}
        ${glow(800, 180, 420, '#d8e8b8', 0.28)}
        <ellipse cx="800" cy="700" rx="560" ry="120" fill="#1a2c34"/><ellipse cx="800" cy="700" rx="520" ry="96" fill="#2a4450" opacity=".8"/>
        <ellipse cx="760" cy="690" rx="200" ry="30" fill="#8fb0c0" opacity=".2"/>${reeds}
        <path d="M0 780 Q400 740 800 770 T1600 760 V900 H0Z" fill="#14200f"/>`);
    },
    cell: () => {
      const r = seeded(55);
      let bricks = '';
      for (let y = 0; y < 640; y += 44) for (let x = (y / 44 % 2) * 45 - 45; x < 1600; x += 90) bricks += `<rect x="${x}" y="${y}" width="86" height="40" fill="hsl(30 6% ${15 + r() * 8}%)"/>`;
      return svg(`<rect width="1600" height="900" fill="#0c0a09"/>${bricks}<rect y="640" width="1600" height="260" fill="#0a0908"/>
        <rect x="660" y="140" width="280" height="260" fill="#8fa0b8" opacity=".35"/><g stroke="#0a0a0a" stroke-width="12"><path d="M730 140 V400"/><path d="M800 140 V400"/><path d="M870 140 V400"/></g>
        ${glow(800, 270, 520, '#b8c8e0', 0.35)}<rect x="1180" y="560" width="300" height="60" fill="#3a2e24"/><rect x="1180" y="620" width="300" height="20" fill="#241a12"/>`);
    },
    drawing: () => {
      return svg(`${room('#2a2b3a', '#14151f', '#2b1a14', '#100806')}
        ${window_(180, 120, 260, 380, '#2a3a58')}${curtains(180, 120, 260, 380, '#3a2a4a')}
        ${glow(310, 300, 360, '#ffd9a8', 0.28)}
        ${fireplace(1050, 380, 240, 250)}
        <rect x="560" y="640" width="360" height="80" rx="26" fill="#3a2230"/><path d="M540 640 q0 -130 80 -130 h240 q80 0 80 130 z" fill="#4a2a3c"/>
        <rect x="620" y="760" width="220" height="40" rx="10" fill="#2a1a10"/>
        <path d="M1380 700 q0 -110 70 -110 q70 0 70 110 z" fill="#2a3a2e"/>
        <rect x="760" y="120" width="120" height="170" fill="#2a1a10" stroke="#a8822e" stroke-width="6"/>`);
    },

    cellar: () => {
      const r = seeded(33);
      let bricks = '';
      for (let y = 0; y < 640; y += 40) for (let x = (y / 40 % 2) * 40 - 40; x < 1600; x += 80) bricks += `<rect x="${x}" y="${y}" width="76" height="36" fill="hsl(18 ${12 + r() * 10}% ${12 + r() * 8}%)"/>`;
      return svg(`<rect width="1600" height="900" fill="#0b0605"/>${bricks}
        <rect y="640" width="1600" height="260" fill="#0a0707"/>
        <rect x="560" y="300" width="480" height="340" rx="20" fill="#1a1412" stroke="#3a2a22" stroke-width="10"/>
        <rect x="640" y="400" width="320" height="160" rx="10" fill="#ff6a1a"/>
        ${glow(800, 480, 520, '#ff5a10', 0.85, 'flicker')}
        <path d="M660 560 L700 440 L740 520 L790 410 L840 520 L890 430 L940 560 Z" fill="#ffd25a" class="flicker"/>
        <g stroke="#2a2220" stroke-width="22" fill="none"><path d="M200 0 V500 H560"/><path d="M1400 0 V420 H1040"/></g>
        <rect x="1180" y="560" width="200" height="80" fill="#1d1511"/><rect x="200" y="590" width="150" height="50" fill="#1d1511"/>
        <path d="M0 900 H1600 V700 Q800 600 0 700 Z" fill="#000" opacity=".35"/>`);
    },

    garden: () => {
      const [g, gd] = grad('#070b14', '#26344c'), r = seeded(41);
      let flakes = '';
      for (let i = 0; i < 60; i++) flakes += `<circle cx="${r() * 1600}" cy="${r() * 500}" r="${1 + r() * 2}" fill="#fff" opacity=".5"/>`;
      return svg(`<defs>${gd}</defs><rect width="1600" height="900" fill="url(#${g})"/>${flakes}
        ${glow(300, 140, 220, '#cfe0ff', 0.25)}
        <path d="M0 520 Q400 480 800 510 T1600 500 V900 H0 Z" fill="#9fb0c8"/>
        <path d="M0 700 Q400 650 800 690 T1600 670 V900 H0 Z" fill="#c7d4e6"/>
        <ellipse cx="780" cy="600" rx="420" ry="60" fill="#8fb0d0" opacity=".55"/>
        <g fill="#0c0f16"><rect x="1100" y="360" width="330" height="190"/><path d="M1080 360 L1265 270 L1450 360 Z"/><rect x="1180" y="440" width="70" height="110"/></g>
        <rect x="1182" y="442" width="66" height="106" fill="#ffb14a" opacity=".55"/>
        ${glow(1215, 495, 140, '#ffb14a', 0.5)}
        ${tree(150, 700, 1.8)}${tree(420, 640, 1.1)}${tree(960, 620, 0.8)}${tree(1500, 720, 1.6)}`);
    },

    bedroom: () => {
      return svg(`${room('#2b2230', '#16111a', '#2a1c16', '#100907')}
        ${window_(1180, 130, 240, 330, '#12203a')}${curtains(1180, 130, 240, 330, '#3a2a40')}
        <rect x="140" y="470" width="540" height="200" rx="10" fill="#3a2a2f"/><rect x="120" y="420" width="40" height="260" fill="#241a1c"/><rect x="660" y="450" width="40" height="230" fill="#241a1c"/>
        <rect x="170" y="440" width="180" height="60" rx="26" fill="#d8d2c8" opacity=".8"/>
        <rect x="780" y="220" width="280" height="420" fill="#2a1b12" stroke="#4a3220" stroke-width="10"/><path d="M780 220 L920 640 V220 Z" fill="#150c07"/>
        <path d="M860 300 q20 40 0 120" stroke="#7a1f2a" stroke-width="22" fill="none"/>
        ${glow(930, 530, 240, '#ffd98a', 0.35, 'flicker')}
        <rect x="1050" y="560" width="120" height="14" fill="#4a3320"/><rect x="1100" y="574" width="20" height="70" fill="#2a1a0c"/>
        <rect x="1088" y="520" width="44" height="40" fill="#caa14a" opacity=".7"/>`);
    }
  };

  /* ---------- Portraits ---------- */
  const PORTRAITS = {
    pennington: { skin: '#d8b79a', suit: '#2b2b38', col: '#8aa0b8' },
    margaret: { skin: '#e2c3a8', suit: '#533468', col: '#b78ac9' },
    vivian: { skin: '#e8c4aa', suit: '#5d3b3b', col: '#e0866b' },
    hale: { skin: '#dcb99c', suit: '#59636f', col: '#7fb08a' },
    dobbs: { skin: '#e0b896', suit: '#6e5438', col: '#d9b36a' },
    edmund: { skin: '#d8b08e', suit: '#6a1f26', col: '#c9a06a' }
  };
  const BROWS = {
    n: ['M104 176 q20 -6 38 0', 'M158 176 q20 -6 38 0'],
    w: ['M104 180 q20 -2 38 -12', 'M158 168 q18 10 38 12'],
    a: ['M104 168 q20 8 38 12', 'M158 180 q18 -4 38 -12'],
    s: ['M104 174 q20 -8 38 -2', 'M158 172 q20 -6 38 2'],
    sh: ['M104 166 q20 -10 38 -2', 'M158 164 q20 -8 38 2']
  };
  const MOUTH = {
    n: 'M130 250 q20 4 40 0',
    w: 'M130 254 q20 -8 40 0',
    a: 'M130 254 q20 -4 40 0',
    s: 'M126 246 q24 22 48 0',
    sh: 'M140 246 q10 22 20 0 q-10 -10 -20 0'
  };

  /* A character described by a few traits, drawn in the same style as the hand-made portraits. */
  const LOOKS = {};
  function define(id, look) { LOOKS[id] = look; PORTRAITS[id] = { skin: look.skin, suit: look.suit, col: look.col }; }
  function genericPortrait(P, e) {
    const brow = BROWS[e] || BROWS.n, mouth = MOUTH[e] || MOUTH.n;
    const ry = P.ry || 76, hair = P.hair || { style: 'short', color: '#4a3a2a' }, hc = hair.color;
    const bodyPath = { normal: 'M10 440 C10 345 70 305 150 305 C230 305 290 345 290 440 Z', broad: 'M-14 440 C-6 340 70 300 150 300 C230 300 306 340 314 440 Z', slim: 'M44 440 C44 352 92 308 150 308 C208 308 256 352 256 440 Z' }[P.build || 'normal'];
    const shirt = P.shirt || '#e8e4da', accent = P.accent || '#8f2a2a';
    let body = `<path d="${bodyPath}" fill="${P.suit}"/>`;
    const collar = P.collar || 'tie';
    if (collar === 'tie') body += `<path d="M118 305 L150 395 L182 305 Z" fill="${shirt}"/><path d="M150 322 l-9 60 h18 z" fill="${accent}"/><path d="M64 330 L112 440 H20 Z M236 330 L188 440 H280 Z" fill="#000" opacity=".28"/>`;
    else if (collar === 'bowtie') body += `<path d="M116 305 L150 392 L184 305 Z" fill="${shirt}"/><path d="M132 316 l18 10 -18 10z M168 316 l-18 10 18 10z" fill="${accent}"/><path d="M64 330 L112 440 H20 Z M236 330 L188 440 H280 Z" fill="#000" opacity=".28"/>`;
    else if (collar === 'cravat') body += `<path d="M112 305 L150 388 L188 305 Z" fill="${shirt}"/><ellipse cx="150" cy="332" rx="22" ry="16" fill="${accent}"/><path d="M64 330 L112 440 H20 Z M236 330 L188 440 H280 Z" fill="#000" opacity=".28"/>`;
    else if (collar === 'high') body += `<path d="M112 305 L150 380 L188 305 Z" fill="${shirt}"/><rect x="124" y="282" width="52" height="30" rx="6" fill="${shirt}"/><path d="M150 330 l-6 70 h12 z" fill="#2a2a2a"/>`;
    else if (collar === 'open') body += `<path d="M112 305 L150 372 L188 305 Z" fill="${P.skin}"/><path d="M104 305 L150 372 L196 305 L150 330Z" fill="${shirt}"/>`;
    else if (collar === 'apron') body += `<path d="M92 440 V345 q58 -34 116 0 V440 Z" fill="${shirt}"/><path d="M118 440 V372 h64 V440" fill="#d6cfbd"/>`;
    else if (collar === 'scarf') body += `<path d="M104 305 q46 56 92 0 l14 50 q-60 36 -120 0z" fill="${accent}"/><path d="M150 330 l-14 80 h28z" fill="${accent}" opacity=".85"/>`;
    else if (collar === 'lace') body += `<path d="M104 305 q46 46 92 0 v-26 h-92z" fill="#1e1328" opacity=".0"/><path d="M104 310 q46 40 92 0" fill="none" stroke="#f1ece0" stroke-width="12" stroke-dasharray="2 10" stroke-linecap="round"/><path d="M118 296 h64 v22 h-64z" fill="#eadfd0" opacity=".85"/>`;
    const neck = `<rect x="128" y="262" width="44" height="50" fill="${P.skin}" opacity=".9"/><rect x="128" y="262" width="44" height="22" fill="#000" opacity=".18"/>`;
    let behind = '', front = '';
    const st = hair.style;
    if (st === 'long') behind = `<path d="M82 220 q-16 -112 68 -116 q84 4 68 116 l14 120 q-60 20 -72 -10 q-12 30 -72 10z" fill="${hc}"/>`;
    else if (st === 'bob') behind = `<path d="M82 250 q-18 -120 68 -126 q86 6 68 126 q-26 24 -68 20 q-42 4 -68 -20z" fill="${hc}"/>`;
    else if (st === 'bun') behind = `<circle cx="150" cy="110" r="34" fill="${hc}"/><path d="M84 200 q-10 -86 66 -90 q76 4 66 90 q-12 -44 -66 -46 q-54 2 -66 46z" fill="${hc}"/>`;
    else if (st === 'curly') behind = `<g fill="${hc}">${[[96, 150], [124, 124], [156, 118], [188, 126], [212, 152], [90, 188], [214, 190]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26"/>`).join('')}</g>`;
    else if (st === 'bald') behind = '';
    else behind = `<path d="M88 192 q-8 -68 62 -74 q70 6 62 74 q-10 -44 -62 -48 q-52 4 -62 48z" fill="${hc}"/>`;
    if (st === 'bald' || (P.hat && P.hat !== 'none' && false)) front += `<path d="M92 172 q-6 30 2 52 M208 172 q6 30 -2 52" stroke="${hc}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
    if (st === 'sidepart') front += `<path d="M96 160 q40 -40 110 -6 q-40 -8 -70 8z" fill="${hc}"/>`;
    if (st === 'long' || st === 'bob') front += `<path d="M90 170 q-6 40 6 70 M210 170 q6 40 -6 70" stroke="${hc}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M96 150 q54 -34 108 0 q-54 -12 -108 0z" fill="${hc}"/>`;
    const fh = P.facial || '#888', beard = P.beard || 'none';
    let beardSvg = '', stache = '';
    if (beard === 'full') { beardSvg = `<path d="M98 226 q4 70 52 74 q48 -4 52 -74 q-14 28 -52 28 q-38 0 -52 -28z" fill="${fh}"/>`; stache = `<path d="M118 238 q32 -14 64 0 q-32 18 -64 0z" fill="${fh}"/>`; }
    else if (beard === 'goatee') { beardSvg = `<path d="M130 262 q20 34 40 0 q-20 10 -40 0z" fill="${fh}"/>`; stache = `<path d="M120 238 q30 -12 60 0 q-30 16 -60 0z" fill="${fh}"/>`; }
    else if (beard === 'mustache') stache = `<path d="M114 238 q36 -16 72 0 q-36 20 -72 0z" fill="${fh}"/>`;
    else if (beard === 'mutton') { beardSvg = `<path d="M92 190 q-8 46 14 64 q-4 -34 8 -54z M208 190 q8 46 -14 64 q4 -34 -8 -54z" fill="${fh}"/>`; stache = `<path d="M118 238 q32 -12 64 0 q-32 16 -64 0z" fill="${fh}"/>`; }
    else if (beard === 'stubble') beardSvg = `<path d="M104 232 q46 64 92 0 q-12 40 -46 40 q-34 0 -46 -40z" fill="#000" opacity=".16"/>`;
    let hat = '';
    const hatC = P.hatColor || '#2a2a2a', hatSt = P.hat || 'none';
    if (hatSt === 'tophat') hat = `<rect x="104" y="62" width="92" height="104" rx="6" fill="${hatC}"/><ellipse cx="150" cy="166" rx="84" ry="14" fill="${hatC}"/><rect x="104" y="140" width="92" height="14" fill="${accent}" opacity=".8"/>`;
    else if (hatSt === 'bowler') hat = `<path d="M94 160 q0 -66 56 -66 q56 0 56 66z" fill="${hatC}"/><ellipse cx="150" cy="162" rx="76" ry="12" fill="${hatC}"/><rect x="96" y="142" width="108" height="9" fill="${accent}" opacity=".7"/>`;
    else if (hatSt === 'deerstalker') hat = `<path d="M88 168 q-4 -76 62 -78 q66 2 62 78 q-20 -16 -62 -16 q-42 0 -62 16z" fill="${hatC}"/><path d="M92 160 q-28 18 -22 50 q18 -10 34 -26z M208 160 q28 18 22 50 q-18 -10 -34 -26z" fill="${hatC}" opacity=".9"/><path d="M104 122 q46 -22 92 0" stroke="#000" stroke-opacity=".25" stroke-width="3" fill="none"/><path d="M150 96 l-26 -22 52 0z" fill="${hatC}"/><path d="M96 168 h108" stroke="#000" stroke-opacity=".3" stroke-width="3"/>`;
    else if (hatSt === 'cap') hat = `<path d="M92 166 q2 -62 58 -62 q56 0 58 62z" fill="${hatC}"/><path d="M92 166 q58 14 130 -4 q-6 14 -60 20 q-50 2 -70 -16z" fill="${hatC}" opacity=".95"/>`;
    else if (hatSt === 'jockey') hat = `<path d="M96 164 q0 -64 54 -64 q54 0 54 64z" fill="${accent}"/><path d="M96 164 q60 12 124 -2 q-6 12 -60 16 q-46 0 -64 -14z" fill="${hatC}"/><path d="M150 100 v64" stroke="#fff" stroke-width="10" opacity=".8"/>`;
    else if (hatSt === 'bonnet') hat = `<path d="M82 200 q-18 -110 68 -112 q86 2 68 112 q-20 -60 -68 -62 q-48 2 -68 62z" fill="${hatC}"/><path d="M100 150 q50 -34 100 0" stroke="${accent}" stroke-width="10" fill="none"/>`;
    else if (hatSt === 'sailor') hat = `<path d="M96 164 q0 -50 54 -50 q54 0 54 50z" fill="${hatC}"/><rect x="96" y="150" width="108" height="14" fill="#10131a"/><path d="M150 114 l-8 -14 16 0z" fill="${accent}"/>`;
    else if (hatSt === 'cloche') hat = `<path d="M92 190 q-6 -80 58 -84 q64 4 58 84 q-16 -30 -58 -30 q-42 0 -58 30z" fill="${hatC}"/><path d="M96 168 q54 -20 108 0" stroke="${accent}" stroke-width="8" fill="none"/>`;
    let glasses = '';
    if (P.glasses) glasses = `<circle cx="123" cy="200" r="21" fill="none" stroke="#c8a24a" stroke-width="3.5"/><circle cx="177" cy="200" r="21" fill="none" stroke="#c8a24a" stroke-width="3.5"/><path d="M144 200 h12" stroke="#c8a24a" stroke-width="3.5"/>`;
    const age = P.age || 0;
    const wrinkles = age > 0.4 ? `<path d="M96 196 q6 4 12 0 M192 196 q6 4 12 0 M110 156 q40 -8 80 0 M124 262 q26 8 52 0" stroke="#000" stroke-opacity="${(0.12 + age * 0.12).toFixed(2)}" stroke-width="3" fill="none" stroke-linecap="round"/>` : '';
    return `<svg viewBox="0 0 300 440" xmlns="http://www.w3.org/2000/svg">
      ${behind}${body}${neck}
      <ellipse cx="150" cy="200" rx="62" ry="${ry}" fill="${P.skin}"/><ellipse cx="150" cy="200" rx="62" ry="${ry}" fill="url(#shade)" opacity=".5"/>
      <ellipse cx="88" cy="204" rx="9" ry="16" fill="${P.skin}"/><ellipse cx="212" cy="204" rx="9" ry="16" fill="${P.skin}"/>
      ${front}
      <g fill="#1a1210"><ellipse cx="123" cy="200" rx="6" ry="${e === 'sh' ? 9 : 6.5}"/><ellipse cx="177" cy="200" rx="6" ry="${e === 'sh' ? 9 : 6.5}"/></g>
      <g fill="#fff" opacity=".8"><circle cx="125" cy="198" r="2"/><circle cx="179" cy="198" r="2"/></g>
      <g stroke="${P.brows || '#1a1210'}" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".85"><path d="${brow[0]}"/><path d="${brow[1]}"/></g>
      <path d="M150 208 q-6 22 4 30" stroke="#000" stroke-opacity=".2" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${beardSvg}<path d="${mouth}" stroke="#5a2a28" stroke-width="4" fill="${e === 'sh' ? '#2a0f0f' : 'none'}" stroke-linecap="round"/>${stache}${wrinkles}${glasses}${hat}
      <defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs>
    </svg>`;
  }
  function portrait(id, e = 'n') {
    const P = PORTRAITS[id];
    if (!P) return '';
    if (LOOKS[id]) return genericPortrait(LOOKS[id], e);
    const brow = BROWS[e] || BROWS.n, mouth = MOUTH[e] || MOUTH.n;
    let behind = '', front = '', body = '';
    const neck = `<rect x="128" y="262" width="44" height="50" fill="${P.skin}" opacity=".9"/><rect x="128" y="262" width="44" height="22" fill="#000" opacity=".18"/>`;
    const ry = id === 'pennington' ? 82 : 76;
    if (id === 'pennington') {
      body = `<path d="M10 440 C10 345 70 305 150 305 C230 305 290 345 290 440 Z" fill="${P.suit}"/><path d="M118 305 L150 400 L182 305 Z" fill="#e8e4da"/><path d="M132 318 L150 328 L168 318 L168 338 L150 328 L132 338 Z" fill="#e8e4da" stroke="#ccc" stroke-width="1"/><path d="M60 330 L110 440 H20 Z M240 330 L190 440 H280 Z" fill="#0c0c10"/>`;
      behind = `<path d="M92 190 q-6 -50 28 -70 q30 -12 60 0 q34 20 28 70 q-8 -40 -58 -44 q-50 4 -58 44z" fill="#8c8c92"/>`;
      front = `<path d="M90 160 q-8 40 4 62 M210 160 q8 40 -4 62" stroke="#a0a0a8" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M126 224 q-4 14 2 26 M174 224 q4 14 -2 26" stroke="#000" stroke-opacity=".16" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    } else if (id === 'margaret') {
      body = `<path d="M10 440 C10 345 70 305 150 305 C230 305 290 345 290 440 Z" fill="${P.suit}"/><path d="M104 312 q46 40 92 0" fill="none" stroke="#ece6dc" stroke-width="10" stroke-dasharray="1 13" stroke-linecap="round"/><path d="M104 305 q46 56 92 0 v-22 h-92 z" fill="#1e1328"/><path d="M118 296 h64 v24 h-64 z" fill="#eadfd0" opacity=".85"/>`;
      behind = `<circle cx="150" cy="112" r="36" fill="#a9a7b0"/><path d="M82 200 q-12 -90 68 -92 q80 2 68 92 q-14 -52 -68 -54 q-54 2 -68 54z" fill="#b6b4bd"/>`;
      front = `<path d="M92 170 q-6 30 4 50 M208 170 q6 30 -4 50" stroke="#b6b4bd" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="150" cy="298" r="5" fill="#f3efe6"/>`;
    } else if (id === 'vivian') {
      body = `<path d="M10 440 C10 345 70 305 150 305 C230 305 290 345 290 440 Z" fill="${P.suit}"/><path d="M104 306 q46 36 92 0 l16 48 q-62 40 -124 0 z" fill="#b33a3a"/><path d="M150 330 l-14 70 h28 z" fill="#8f2a2a"/>`;
      behind = `<path d="M80 250 q-22 -120 70 -128 q92 8 70 128 q-10 -90 -70 -92 q-60 2 -70 92z" fill="#17110f"/>`;
      front = `<path d="M92 168 q-18 70 -6 100 q16 -8 22 -40 M208 168 q18 70 6 100 q-16 -8 -22 -40" fill="#17110f"/><path d="M84 150 q66 -40 132 0" stroke="#b33a3a" stroke-width="8" fill="none"/>`;
    } else if (id === 'hale') {
      body = `<path d="M10 440 C10 345 70 305 150 305 C230 305 290 345 290 440 Z" fill="${P.suit}"/><path d="M116 305 L150 392 L184 305 Z" fill="#ece8de"/><path d="M150 326 l-8 90 h16 z" fill="#5a2a2a"/><path d="M186 360 q30 20 60 6" stroke="#c8a24a" stroke-width="3" fill="none"/>`;
      behind = `<path d="M88 190 q-10 -62 62 -66 q72 4 62 66 q-10 -46 -62 -50 q-52 4 -62 50z" fill="#8a8680"/>`;
      front = `<path d="M92 176 q-4 20 2 40 M208 176 q4 20 -2 40" stroke="#8a8680" stroke-width="12" fill="none" stroke-linecap="round"/>
        <circle cx="123" cy="200" r="21" fill="none" stroke="#c8a24a" stroke-width="3.5"/><circle cx="177" cy="200" r="21" fill="none" stroke="#c8a24a" stroke-width="3.5"/><path d="M144 200 h12" stroke="#c8a24a" stroke-width="3.5"/>
        <path d="M120 238 q30 -12 60 0 q-30 14 -60 0z" fill="#8a8680"/>`;
    } else if (id === 'edmund') {
      body = `<path d="M10 440 C10 345 70 305 150 305 C230 305 290 345 290 440 Z" fill="${P.suit}"/><path d="M60 330 L112 440 H20 Z M240 330 L188 440 H280 Z" fill="#3a1015"/><path d="M116 305 L150 385 L184 305 Z" fill="#efe8d8"/><path d="M150 320 l-13 46 h26 z" fill="#c9a06a"/>`;
      behind = `<path d="M84 196 q-14 -84 66 -88 q80 4 66 88 q-12 -50 -66 -54 q-54 4 -66 54z" fill="#ecebe5"/>`;
      front = `<path d="M92 176 q-8 36 4 66 M208 176 q8 36 -4 66" stroke="#ecebe5" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M98 226 q4 70 52 74 q48 -4 52 -74 q-14 28 -52 28 q-38 0 -52 -28z" fill="#f1f0ea"/><path d="M118 238 q32 -14 64 0 q-32 18 -64 0z" fill="#f1f0ea"/>`;
    } else if (id === 'dobbs') {
      body = `<path d="M10 440 C10 345 70 305 150 305 C230 305 290 345 290 440 Z" fill="${P.suit}"/><path d="M96 440 V345 q54 -30 108 0 V440 Z" fill="#ece6d8"/><path d="M130 440 V360 h40 V440" fill="#d6cfbd"/>`;
      behind = `<path d="M84 190 q-4 -90 66 -92 q70 2 66 92 q-10 -44 -66 -46 q-56 2 -66 46z" fill="#8a7a6a"/>`;
      front = `<path d="M84 150 q66 -66 132 0 q-20 -34 -66 -36 q-46 2 -66 36z" fill="#f2eee4"/><path d="M82 152 q68 -22 136 0 v14 q-68 -22 -136 0z" fill="#e0dacb"/><circle cx="106" cy="226" r="14" fill="#e0866b" opacity=".35"/><circle cx="194" cy="226" r="14" fill="#e0866b" opacity=".35"/>`;
    }
    return `<svg viewBox="0 0 300 440" xmlns="http://www.w3.org/2000/svg">
      ${behind}${body}${neck}
      <ellipse cx="150" cy="200" rx="62" ry="${ry}" fill="${P.skin}"/>
      <ellipse cx="150" cy="200" rx="62" ry="${ry}" fill="url(#shade)" opacity=".5"/>
      <ellipse cx="88" cy="204" rx="9" ry="16" fill="${P.skin}"/><ellipse cx="212" cy="204" rx="9" ry="16" fill="${P.skin}"/>
      ${front}
      <g fill="#1a1210"><ellipse cx="123" cy="200" rx="6" ry="${e === 'sh' ? 9 : 6.5}"/><ellipse cx="177" cy="200" rx="6" ry="${e === 'sh' ? 9 : 6.5}"/></g>
      <g fill="#fff" opacity=".8"><circle cx="125" cy="198" r="2"/><circle cx="179" cy="198" r="2"/></g>
      <g stroke="#1a1210" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".85"><path d="${brow[0]}"/><path d="${brow[1]}"/></g>
      <path d="M150 208 q-6 22 4 30" stroke="#000" stroke-opacity=".2" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="${mouth}" stroke="#5a2a28" stroke-width="4" fill="${e === 'sh' ? '#2a0f0f' : 'none'}" stroke-linecap="round"/>
      <defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs>
    </svg>`;
  }

  return { bg: name => (BG[name] || BG.black)(), portrait, PORTRAITS, define };
})();
