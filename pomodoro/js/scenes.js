/* ---------- cenários animados do fundo ---------- */
window.Scenes = (() => {
  const rnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const TAU = Math.PI * 2;

  /* ajudantes de desenho */
  function glow(c, x, y, r, rgb, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function disc(c, x, y, r, color) { c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  function stars(c, P, t, a = 1) {
    c.fillStyle = '#F4ECE0';
    for (const s of P.stars) { c.globalAlpha = a * (.35 + .35 * Math.sin(t / 900 + s.p)); c.fillRect(s.x, s.y, s.s, s.s); }
    c.globalAlpha = 1;
  }
  function rain(c, P, W, H, color, still, clip) {
    c.save();
    if (clip) { c.beginPath(); c.rect(clip.x, clip.y, clip.w, clip.h); c.clip(); }
    c.strokeStyle = color; c.lineWidth = 1; c.beginPath();
    for (const d of P.drops) {
      c.moveTo(d.x, d.y); c.lineTo(d.x - d.l * .25, d.y + d.l);
      if (!still) { d.y += d.v; d.x -= d.v * .25; if (d.y > H) { d.y = -20; d.x = Math.random() * W * 1.2; } }
    }
    c.stroke(); c.restore();
  }
  function shooting(c, P, W, H, still) {
    const s = P.shoot;
    if (still) return;
    if (!s.on) { if (Math.random() < .004) Object.assign(s, {on:true, x:W * (.3 + Math.random() * .7), y:H * Math.random() * .35, life:0}); return; }
    s.life++;
    const x = s.x - s.life * 10, y = s.y + s.life * 4.5, len = 90;
    const g = c.createLinearGradient(x, y, x + len, y - len * .45);
    g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.strokeStyle = g; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + len, y - len * .45); c.stroke();
    if (s.life > 38) s.on = false;
  }
  function buildings(c, x0, x1, base, hMin, hMax, r, day, lit = .22) {
    let x = x0;
    while (x < x1) {
      const bw = 40 + r() * 70, bh = hMin + r() * (hMax - hMin), top = base - bh;
      c.fillStyle = day ? (r() > .5 ? '#C9BFD6' : '#D4CADF') : (r() > .5 ? '#1B1829' : '#201C31');
      c.fillRect(x, top, bw, bh);
      for (let wy = top + 10; wy < base - 8; wy += 14)
        for (let wx = x + 7; wx < x + bw - 8; wx += 12)
          if (r() < lit) { c.fillStyle = day ? (r() > .5 ? 'rgba(255,255,255,.75)' : 'rgba(150,170,210,.5)') : (r() > .3 ? 'rgba(242,184,114,.55)' : 'rgba(185,168,236,.45)'); c.fillRect(wx, wy, 5, 7); }
      x += bw + 2 + r() * 6;
    }
  }
  function wallWithWindow(c, W, H, win, wall) {
    c.fillStyle = wall; c.beginPath(); c.rect(0, 0, W, H); c.rect(win.x, win.y, win.w, win.h); c.fill('evenodd');
  }
  function windowFrame(c, win, color, cols = 2, rows = 2) {
    c.strokeStyle = color; c.lineWidth = 10; c.strokeRect(win.x, win.y, win.w, win.h);
    c.lineWidth = 5; c.beginPath();
    for (let i = 1; i < cols; i++) { const x = win.x + win.w * i / cols; c.moveTo(x, win.y); c.lineTo(x, win.y + win.h); }
    for (let i = 1; i < rows; i++) { const y = win.y + win.h * i / rows; c.moveTo(win.x, y); c.lineTo(win.x + win.w, y); }
    c.stroke();
  }
  function mug(c, x, y, s, body, dark) {
    c.fillStyle = body; c.fillRect(x, y - s, s * .9, s);
    c.strokeStyle = body; c.lineWidth = s * .14; c.beginPath(); c.arc(x + s * .9, y - s * .55, s * .22, -Math.PI / 2, Math.PI / 2); c.stroke();
    c.fillStyle = dark; c.fillRect(x, y - s, s * .9, s * .12);
  }
  function pine(c, x, base, h, color) {
    c.fillStyle = color;
    for (let i = 0; i < 3; i++) {
      const top = base - h + i * h * .22, w = h * (.28 + i * .12), bot = top + h * .5;
      c.beginPath(); c.moveTo(x, top); c.lineTo(x - w, bot); c.lineTo(x + w, bot); c.closePath(); c.fill();
    }
    c.fillRect(x - h * .04, base - h * .12, h * .08, h * .12);
  }
  function ridge(c, W, H, base, amp, f, color, ph) {
    c.fillStyle = color; c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) c.lineTo(x, base + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.3 + ph * 2) * amp * .4);
    c.lineTo(W, H); c.closePath(); c.fill();
  }

  /* os cenários */
  const THEMES = {
    cidade: {
      name:'cidade chuvosa', level:1, pose:'bench',
      sounds:{noite:['beat','rain','vinyl'], dia:['beat','rain']},
      sky:d => d ? [[0,'#BCD0EA'],[.55,'#E6DCEB'],[1,'#F6D9C8']] : [[0,'#0F0D18'],[.6,'#1E1A30'],[1,'#2A2340']],
      build(c, W, H, d, r) { buildings(c, -10, W, H, H * .12, H * .4, r, d); },
      back(c, t, W, H, d, P) { d ? glow(c, W * .82, H * .2, H * .35, '255,236,200', .95) : stars(c, P, t); },
      front(c, t, W, H, d, P, still) { rain(c, P, W, H, d ? 'rgba(90,100,150,.22)' : 'rgba(190,200,235,.22)', still); }
    },

    cafeteria: {
      name:'cafeteria', level:2, pose:'cafe',
      sounds:{noite:['cafe','beat','rain'], dia:['cafe','beat']},
      sky:d => d ? [[0,'#AFC6E0'],[1,'#EADCE4']] : [[0,'#141225'],[1,'#2A2340']],
      build(c, W, H, d, r, P) {
        const win = P.win = {x:W * .12, y:H * .1, w:W * .76, h:H * .5};
        const wall = d ? '#E8D5C0' : '#2A1F1D', wood = d ? '#A8764F' : '#4A3027', frame = d ? '#7E5236' : '#3A2520';
        c.save(); c.beginPath(); c.rect(win.x, win.y, win.w, win.h); c.clip();
        buildings(c, win.x - 10, win.x + win.w, win.y + win.h, win.h * .25, win.h * .65, r, d, .3); c.restore();
        wallWithWindow(c, W, H, win, wall);
        c.fillStyle = d ? '#D9BFA5' : '#221917'; c.fillRect(0, H * .68, W, H * .12);
        windowFrame(c, win, frame, 3, 2);
        c.fillStyle = frame; c.fillRect(win.x - 16, win.y + win.h, win.w + 32, 10);
        c.fillStyle = wood; c.fillRect(0, H * .8, W, H * .2);
        c.fillStyle = frame; c.fillRect(0, H * .8, W, 8);
        for (let x = W * .05; x < W; x += 170 + r() * 120) mug(c, x, H * .8, 20 + r() * 8, d ? '#F4EEE6' : '#B9ABA0', d ? '#6B4630' : '#2B1B16');
        const n = W < 700 ? 2 : 3; P.lamps = [];
        for (let i = 0; i < n; i++) {
          const x = W * (i + .5) / n, y = H * .07; P.lamps.push({x, y});
          c.strokeStyle = frame; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y); c.stroke();
          c.fillStyle = d ? '#C9794F' : '#7A3F2C'; c.beginPath(); c.ellipse(x, y + 12, 26, 16, 0, Math.PI, 0); c.fill();
          disc(c, x, y + 14, 6, '#FFE3B0');
        }
      },
      back(c, t, W, H, d, P) { if (!d) stars(c, P, t, .8); },
      front(c, t, W, H, d, P, still) {
        rain(c, P, W, H, d ? 'rgba(90,100,150,.25)' : 'rgba(190,200,235,.25)', still, P.win);
        for (const l of P.lamps) glow(c, l.x, l.y + 16, 190, '255,200,130', (d ? .16 : .32) + .03 * Math.sin(t / 400 + l.x));
      }
    },

    quarto: {
      name:'quarto', level:3, pose:'laptop',
      sounds:{noite:['beat','vinyl','rain'], dia:['beat','birds']},
      sky:d => d ? [[0,'#9FC4EA'],[1,'#F2DCE6']] : [[0,'#0E0D1C'],[1,'#27224A']],
      build(c, W, H, d, r, P) {
        const ww = Math.max(W * .28, 180), win = P.win = {x:W - ww - W * .08, y:H * .12, w:ww, h:H * .42};
        const wall = d ? '#EADFEA' : '#221D33', wood = d ? '#B98A64' : '#3B2C3A';
        wallWithWindow(c, W, H, win, wall);
        windowFrame(c, win, d ? '#FBF7FA' : '#3B3355', 2, 2);
        const cur = d ? '#F2B8B0' : '#4A3450', cw = win.w * .2;
        c.fillStyle = cur; c.fillRect(win.x - cw * .6, win.y - 16, cw, win.h + 50); c.fillRect(win.x + win.w - cw * .4, win.y - 16, cw, win.h + 50);
        c.fillStyle = d ? '#FBF7FA' : '#3B3355'; c.fillRect(win.x - cw, win.y - 20, win.w + cw * 2, 6);
        // estante com livros e planta
        const sx = W * .05, sw = Math.min(W * .3, 320), sy = H * .34;
        c.fillStyle = wood; c.fillRect(sx, sy, sw, 8);
        const books = d ? ['#E3907E','#9CC5A1','#B9A8EC','#F2B872','#7FA7D9'] : ['#8E5A55','#5C7A61','#6E6296','#9A7447','#4F6A92'];
        for (let x = sx + 6; x < sx + sw * .7;) { const bw = 10 + r() * 9, bh = 34 + r() * 26; c.fillStyle = books[Math.floor(r() * books.length)]; c.fillRect(x, sy - bh, bw, bh); x += bw + 2; }
        const px = sx + sw * .84;
        c.fillStyle = d ? '#C97B5A' : '#6A3F35'; c.beginPath(); c.moveTo(px - 16, sy - 30); c.lineTo(px + 16, sy - 30); c.lineTo(px + 11, sy); c.lineTo(px - 11, sy); c.fill();
        const leaf = d ? '#6FAE7C' : '#3F6B4E';
        [[-14,-44,12],[0,-54,13],[14,-44,12],[-6,-66,10],[8,-66,10]].forEach(([dx, dy, rr]) => { c.fillStyle = leaf; c.beginPath(); c.ellipse(px + dx, sy + dy, rr * .7, rr, dx / 30, 0, TAU); c.fill(); });
        // escrivaninha
        c.fillStyle = wood; c.fillRect(0, H * .84, W, H * .16);
        c.fillStyle = d ? '#9C7050' : '#2E2230'; c.fillRect(0, H * .84, W, 7);
        mug(c, W * .72, H * .84, 24, d ? '#F4EEE6' : '#A99BB5', d ? '#6B4630' : '#2B1B26');
        c.fillStyle = books[0]; c.fillRect(W * .8, H * .84 - 12, 70, 12); c.fillStyle = books[2]; c.fillRect(W * .81, H * .84 - 22, 62, 10);
        // varal de luzinhas
        P.bulbs = [];
        for (let x = 10; x < W; x += 34) { const y = H * .04 + Math.abs(Math.sin(x / W * Math.PI * 3)) * 22; P.bulbs.push({x, y, p:r() * 6}); }
        c.strokeStyle = d ? 'rgba(80,70,90,.35)' : 'rgba(200,190,220,.25)'; c.lineWidth = 1.2; c.beginPath();
        P.bulbs.forEach((b, i) => i ? c.lineTo(b.x, b.y) : c.moveTo(b.x, b.y)); c.stroke();
      },
      back(c, t, W, H, d, P) {
        if (d) glow(c, P.win.x + P.win.w * .7, P.win.y + P.win.h * .3, P.win.w * .6, '255,240,210', .9);
        else { stars(c, P, t); glow(c, P.win.x + P.win.w * .7, P.win.y + P.win.h * .3, 60, '240,232,210', .4); disc(c, P.win.x + P.win.w * .7, P.win.y + P.win.h * .3, 16, '#F2EAD8'); }
      },
      front(c, t, W, H, d, P, still) {
        const cols = ['255,196,120', '255,160,170', '190,170,255', '160,230,190'];
        P.bulbs.forEach((b, i) => {
          const a = (d ? .25 : .55) + .25 * Math.sin(t / 600 + b.p);
          glow(c, b.x, b.y + 4, d ? 12 : 20, cols[i % 4], a);
          disc(c, b.x, b.y + 4, 2.5, `rgba(${cols[i % 4]},${d ? .9 : 1})`);
        });
        if (d) for (const m of P.motes) {
          c.fillStyle = `rgba(255,240,210,${.35 + .3 * Math.sin(t / 700 + m.p)})`;
          c.fillRect(m.x, m.y, 2, 2);
          if (!still) { m.x += Math.sin(t / 2000 + m.p) * .2; m.y -= .08; if (m.y < 0) m.y = H; }
        }
      }
    },

    floresta: {
      name:'floresta', level:4, pose:'log',
      sounds:{noite:['crickets','wind'], dia:['birds','wind']},
      sky:d => d ? [[0,'#A8CBE8'],[.6,'#E4ECDD'],[1,'#F3E3C8']] : [[0,'#0A1018'],[.6,'#15202B'],[1,'#1E2B33']],
      build(c, W, H, d, r) {
        ridge(c, W, H, H * .45, 30, .006, d ? '#B8CFC4' : '#1E2A36', r() * 6);
        ridge(c, W, H, H * .55, 24, .009, d ? '#8FB3A0' : '#18232C', r() * 6);
        const trees = d ? ['#6F9C7E','#4E7D60','#335C45'] : ['#15212A','#111A21','#0C1318'];
        trees.forEach((col, i) => {
          const base = H * (.66 + i * .1), hh = 50 + i * 40;
          for (let x = -20; x < W + 40; x += hh * .5 + r() * hh * .4) pine(c, x, base + r() * 10, hh * (.75 + r() * .5), col);
          c.fillStyle = col; c.fillRect(0, base, W, H - base);
        });
      },
      back(c, t, W, H, d, P) {
        if (d) glow(c, W * .75, H * .2, H * .32, '255,240,200', .95);
        else { stars(c, P, t); glow(c, W * .78, H * .17, 70, '230,230,210', .3); disc(c, W * .78, H * .17, 22, '#EDE7D5'); }
      },
      front(c, t, W, H, d, P, still) {
        if (!d) for (const f of P.flies) {
          const x = f.x + Math.sin(t / 1400 + f.p) * 30, y = f.y + Math.cos(t / 1700 + f.p) * 20, a = .4 + .5 * Math.sin(t / 500 + f.p * 3);
          if (a > 0) { glow(c, x, y, 12, '220,255,140', a * .6); disc(c, x, y, 1.6, `rgba(240,255,190,${a})`); }
        }
        else for (const l of P.leaves) {
          c.save(); c.translate(l.x + Math.sin(t / 900 + l.p) * 20, l.y); c.rotate(t / 800 + l.p);
          c.fillStyle = l.c; c.beginPath(); c.ellipse(0, 0, 5, 2.6, 0, 0, TAU); c.fill(); c.restore();
          if (!still) { l.y += l.v; if (l.y > H) { l.y = -10; l.x = Math.random() * W; } }
        }
      }
    },

    praia: {
      name:'praia', level:6, pose:'towel',
      sounds:{noite:['sea','wind'], dia:['sea','birds']},
      sky:d => d ? [[0,'#8FB8E3'],[.45,'#F3CDB9'],[.62,'#F6B29E']] : [[0,'#0B1030'],[.45,'#1B2152'],[.62,'#2F2E66']],
      build(c, W, H, d, r, P) {
        const hz = P.hz = H * .62, sand = H * .8;
        const g = c.createLinearGradient(0, hz, 0, sand);
        g.addColorStop(0, d ? '#7FA8C9' : '#1F2757'); g.addColorStop(1, d ? '#5E8DB3' : '#141A3C');
        c.fillStyle = g; c.fillRect(0, hz, W, sand - hz);
        c.fillStyle = d ? '#EFD6B4' : '#3A3350';
        c.beginPath(); c.moveTo(0, sand); c.quadraticCurveTo(W * .5, sand - 14, W, sand + 6); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        // coqueiro
        const bx = W * .08, tx = W * .15, ty = H * .42, trunk = d ? '#7A5A45' : '#15142B', leaf = d ? '#3E6B50' : '#12122A';
        c.strokeStyle = trunk; c.lineWidth = 14; c.lineCap = 'round';
        c.beginPath(); c.moveTo(bx, H); c.quadraticCurveTo(bx + W * .02, H * .6, tx, ty); c.stroke();
        c.fillStyle = leaf;
        [-2.8, -2.2, -1.6, -.9, -.4, .2].forEach(a => {
          const len = 110 + r() * 40, ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * .6 + 40;
          c.beginPath(); c.moveTo(tx, ty);
          c.quadraticCurveTo(tx + Math.cos(a) * len * .5, ty + Math.sin(a) * len * .5 - 30, ex, ey);
          c.quadraticCurveTo(tx + Math.cos(a) * len * .45, ty + Math.sin(a) * len * .45 - 8, tx, ty + 6); c.fill();
        });
      },
      back(c, t, W, H, d, P) {
        if (d) { glow(c, W * .62, P.hz - 20, H * .3, '255,220,170', .8); disc(c, W * .62, P.hz - 10, H * .07, '#FFE1B0'); }
        else { stars(c, P, t); glow(c, W * .7, H * .2, 80, '240,235,215', .3); disc(c, W * .7, H * .2, 24, '#F4EBD9'); }
      },
      front(c, t, W, H, d, P) {
        const hz = P.hz, sand = H * .8, sx = d ? W * .62 : W * .7;
        c.lineWidth = 2;
        for (let i = 0; i < 16; i++) {
          const y = hz + 6 + i * (sand - hz - 10) / 16, w = 14 + i * 6 + 10 * Math.sin(t / 700 + i);
          c.strokeStyle = d ? `rgba(255,236,200,${.5 - i * .02})` : `rgba(240,235,215,${.45 - i * .02})`;
          c.beginPath(); c.moveTo(sx - w / 2 + Math.sin(t / 500 + i * 2) * 6, y); c.lineTo(sx + w / 2 + Math.sin(t / 500 + i * 2) * 6, y); c.stroke();
        }
        c.strokeStyle = d ? 'rgba(255,255,255,.55)' : 'rgba(200,210,240,.3)'; c.lineWidth = 2.5; c.beginPath();
        const off = Math.sin(t / 1800) * 6;
        for (let x = 0; x <= W; x += 12) { const y = sand - 6 + off + Math.sin(x / 40 + t / 600) * 2.5 - x / W * 8; x ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.stroke();
      }
    },

    espaco: {
      name:'espaço', level:8, pose:'float',
      sounds:{noite:['space','beat'], dia:['space','beat']},
      sky:d => d ? [[0,'#2E2560'],[.5,'#6A4E9E'],[1,'#D99BC0']] : [[0,'#05040C'],[.5,'#120E28'],[1,'#22143D']],
      build(c, W, H, d, r) {
        [['185,120,220',.2],['110,140,230',.16],['240,140,180',.14],['120,210,200',.1]].forEach(([rgb, a]) => glow(c, W * r(), H * r(), Math.max(W, H) * (.2 + r() * .2), rgb, a));
        const R = Math.min(W, H) * .32, px = W * .86, py = H * .98;
        const g = c.createRadialGradient(px - R * .4, py - R * .5, R * .1, px, py, R);
        g.addColorStop(0, d ? '#F7B7A0' : '#E3907E'); g.addColorStop(1, d ? '#9A5A8C' : '#5C2D4A');
        c.fillStyle = g; c.beginPath(); c.arc(px, py, R, 0, TAU); c.fill();
        c.save(); c.beginPath(); c.arc(px, py, R, 0, TAU); c.clip();
        c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = R * .08;
        for (let i = 1; i < 5; i++) { c.beginPath(); c.ellipse(px, py - R + i * R * .35, R * 1.2, R * .12, -.2, 0, TAU); c.stroke(); }
        c.restore();
        c.strokeStyle = d ? 'rgba(255,235,210,.55)' : 'rgba(242,184,114,.45)'; c.lineWidth = 6;
        c.beginPath(); c.ellipse(px, py, R * 1.6, R * .32, -.28, 0, TAU); c.stroke();
        const sx = W * .14, sy = H * .22, sr = 24;
        const g2 = c.createRadialGradient(sx - 8, sy - 8, 2, sx, sy, sr);
        g2.addColorStop(0, '#BDE3C0'); g2.addColorStop(1, '#3F6B50');
        c.fillStyle = g2; c.beginPath(); c.arc(sx, sy, sr, 0, TAU); c.fill();
        disc(c, W * .32, H * .72, 9, d ? '#E8E0F0' : '#9A93A8');
      },
      back(c, t, W, H, d, P, still) { stars(c, P, t, d ? .7 : 1); shooting(c, P, W, H, still); }
    },

    soninho: {
      name:'hora de dormir', level:1, pose:'sleep',
      sounds:{noite:['rain', 'space'], dia:['birds', 'wind']},
      sky:d => d ? [[0,'#BCD6F2'],[1,'#F4E6EE']] : [[0,'#070A1E'],[1,'#1C1B45']],
      build(c, W, H, d, r, P) {
        const win = P.win = {x:W * .58, y:H * .1, w:Math.max(W * .3, 180), h:H * .42};
        wallWithWindow(c, W, H, win, d ? '#F1E3EC' : '#16163A');
        windowFrame(c, win, d ? '#FFFFFF' : '#2A2A5A', 2, 2);
        const cw = win.w * .2;
        c.fillStyle = d ? '#CDB8FA' : '#3B2F6A';
        c.fillRect(win.x - cw * .6, win.y - 16, cw, win.h + 50); c.fillRect(win.x + win.w - cw * .4, win.y - 16, cw, win.h + 50);
        P.decals = Array.from({length:14}, () => ({x:W * (.04 + r() * .48), y:H * (.08 + r() * .5), s:4 + r() * 5, p:r() * 6, moon:r() < .2}));
        c.fillStyle = d ? '#D8C3B0' : '#12122C'; c.fillRect(0, H * .8, W, H * .2);
        c.fillStyle = d ? '#F2B8B0' : '#2E2458'; c.beginPath(); c.ellipse(W * .5, H * .92, W * .22, H * .04, 0, 0, TAU); c.fill();
        const nx = W * .86, ny = H * .66;
        c.fillStyle = d ? '#B98A64' : '#3B2C3A'; c.fillRect(nx, ny, 70, H * .14);
        c.fillStyle = d ? '#F4E6D0' : '#E8C98A'; c.beginPath(); c.moveTo(nx + 18, ny - 30); c.lineTo(nx + 52, ny - 30); c.lineTo(nx + 60, ny - 8); c.lineTo(nx + 10, ny - 8); c.fill();
        c.fillStyle = '#8A6A4A'; c.fillRect(nx + 33, ny - 8, 4, 8);
        P.lamp = {x:nx + 35, y:ny - 18};
      },
      back(c, t, W, H, d, P) {
        const w = P.win;
        if (d) { glow(c, w.x + w.w * .3, w.y + w.h * .4, w.w * .5, '255,255,255', .8); glow(c, w.x + w.w * .75, w.y + w.h * .6, w.w * .4, '255,255,255', .7); }
        else { stars(c, P, t); glow(c, w.x + w.w * .65, w.y + w.h * .35, 90, '240,232,210', .35); disc(c, w.x + w.w * .65, w.y + w.h * .35, 30, '#F2EAD8'); disc(c, w.x + w.w * .65 + 12, w.y + w.h * .35 - 8, 26, '#1C1B45'); }
      },
      front(c, t, W, H, d, P) {
        for (const s of P.decals) {
          const a = d ? .55 : .5 + .4 * Math.sin(t / 700 + s.p);
          if (!d) glow(c, s.x, s.y, s.s * 3, '255,240,180', a * .35);
          c.fillStyle = d ? `rgba(255,255,255,${a})` : `rgba(255,240,190,${a})`;
          if (s.moon) { disc(c, s.x, s.y, s.s, c.fillStyle); }
          else { c.fillRect(s.x - s.s, s.y - 1, s.s * 2, 2); c.fillRect(s.x - 1, s.y - s.s, 2, s.s * 2); }
        }
        if (!d) glow(c, P.lamp.x, P.lamp.y, 170, '255,200,140', .32 + .02 * Math.sin(t / 500));
      }
    },

    estudio: {
      name:'estúdio de música', level:2, pose:'guitar',
      sounds:{noite:['beat', 'vinyl'], dia:['beat']},
      sky:d => d ? [[0,'#EADDF0'],[1,'#F6E7EE']] : [[0,'#170F24'],[1,'#26183A']],
      build(c, W, H, d, r, P) {
        c.fillStyle = d ? '#E2D2EC' : '#1E1530'; c.fillRect(0, 0, W, H);
        const sz = 34, gap = 6, foam = d ? '#D2BEE0' : '#2A1E40', foamD = d ? '#C3ADD4' : '#231935';
        for (let y = H * .14; y + sz < H * .62; y += sz + gap) for (let x = W * .05; x + sz < W * .95; x += sz + gap) {
          c.fillStyle = foam; c.fillRect(x, y, sz, sz);
          c.fillStyle = foamD; c.beginPath(); c.moveTo(x, y + sz); c.lineTo(x + sz / 2, y + sz / 2); c.lineTo(x + sz, y + sz); c.fill();
        }
        [[.8, .22, '#F4A3C0'], [.88, .34, '#9CC5A1'], [.72, .36, '#F2B872']].forEach(([a, b, col]) => {
          disc(c, W * a, H * b, 28, '#15121E'); disc(c, W * a, H * b, 18, '#221E2E'); disc(c, W * a, H * b, 8, col); disc(c, W * a, H * b, 2, '#F4F4F8');
        });
        c.fillStyle = d ? '#C9A98A' : '#2A1E2E'; c.fillRect(0, H * .72, W, H * .28);
        c.strokeStyle = d ? 'rgba(120,80,50,.25)' : 'rgba(0,0,0,.35)'; c.lineWidth = 2;
        for (let y = H * .76; y < H; y += 22) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
        c.fillStyle = d ? '#E3907E' : '#5B2F4A'; c.beginPath(); c.ellipse(W * .2, H * .94, W * .18, H * .045, 0, 0, TAU); c.fill();
        P.neon = {x:W * .08, y:H * .1};
      },
      front(c, t, W, H, d, P, still) {
        [.3, .7].forEach((k, i) => {
          const x = W * k, hue = (t / 40 + i * 140) % 360;
          const g = c.createLinearGradient(x, 0, x, H);
          g.addColorStop(0, `hsla(${hue},80%,70%,${d ? .12 : .22})`); g.addColorStop(1, `hsla(${hue},80%,70%,0)`);
          c.fillStyle = g; c.beginPath(); c.moveTo(x - 14, 0); c.lineTo(x + 14, 0); c.lineTo(x + W * .16, H); c.lineTo(x - W * .16, H); c.fill();
        });
        const flick = still ? 1 : (Math.sin(t / 90) > .97 ? .4 : 1);
        c.save(); c.globalAlpha = flick;
        c.font = '44px VT323, monospace'; c.fillStyle = d ? '#C0508A' : '#F7A8D0';
        if (!d) { c.shadowColor = '#F27AA0'; c.shadowBlur = 18; }
        c.fillText('lo-fi ♪', P.neon.x, P.neon.y + 30); c.restore();
        for (const n of P.notes) {
          c.fillStyle = d ? `rgba(160,90,140,${n.a})` : `rgba(247,168,208,${n.a})`;
          c.font = `${n.s}px VT323, monospace`; c.fillText(n.ch, n.x, n.y);
          if (!still) { n.y -= n.v; n.x += Math.sin(t / 800 + n.p) * .3; n.a = Math.min(.8, n.a + .005); if (n.y < H * .1) { n.y = H * .9; n.a = 0; } }
        }
      }
    },

    gamer: {
      name:'quarto gamer', level:3, pose:'game',
      sounds:{noite:['beat'], dia:['beat', 'birds']},
      sky:d => d ? [[0,'#A9CBEF'],[1,'#EAD9EC']] : [[0,'#0B0A1C'],[1,'#221A44']],
      build(c, W, H, d, r, P) {
        const win = P.win = {x:W * .62, y:H * .12, w:Math.max(W * .24, 160), h:H * .34};
        c.save(); c.beginPath(); c.rect(win.x, win.y, win.w, win.h); c.clip();
        buildings(c, win.x - 10, win.x + win.w, win.y + win.h, win.h * .2, win.h * .7, r, d, .35); c.restore();
        wallWithWindow(c, W, H, win, d ? '#DCD3EE' : '#191433');
        windowFrame(c, win, d ? '#F4F0FA' : '#2C2450', 2, 1);
        [['#F27AA0', .05, .14], ['#7FB4F5', .17, .2], ['#9CC5A1', .29, .13]].forEach(([col, a, b]) => {
          const x = W * a, y = H * b, w = Math.max(W * .09, 60), h = w * 1.35;
          c.fillStyle = col; c.globalAlpha = d ? .8 : .55; c.fillRect(x, y, w, h);
          c.globalAlpha = d ? .9 : .7; c.fillStyle = '#FFFFFF'; c.fillRect(x + w * .15, y + h * .7, w * .7, 4);
          disc(c, x + w / 2, y + h * .38, w * .22, 'rgba(255,255,255,.7)'); c.globalAlpha = 1;
        });
        c.fillStyle = d ? '#B98A64' : '#2E2440'; c.fillRect(W * .36, H * .46, W * .2, 6);
        for (let i = 0; i < 5; i++) { c.fillStyle = ['#F2B872', '#F27AA0', '#9CC5A1', '#B99AF5', '#7FB4F5'][i]; c.fillRect(W * .37 + i * W * .035, H * .46 - 16 - (i % 2) * 6, 10, 16 + (i % 2) * 6); }
        c.fillStyle = d ? '#BFA7C9' : '#140F26'; c.fillRect(0, H * .76, W, H * .24);
        c.fillStyle = d ? '#9C7BE0' : '#3B2A6A'; c.beginPath(); c.ellipse(W * .22, H * .93, W * .2, H * .045, 0, 0, TAU); c.fill();
        c.fillStyle = d ? '#8A6A4A' : '#2A2240'; c.fillRect(W * .66, H * .68, W * .3, 8); c.fillRect(W * .68, H * .68, 6, H * .2); c.fillRect(W * .93, H * .68, 6, H * .2);
        c.fillStyle = '#1E1B2A'; P.screen = {x:W * .72, y:H * .5, w:Math.max(W * .16, 110), h:Math.max(H * .15, 70)};
        c.fillRect(P.screen.x - 5, P.screen.y - 5, P.screen.w + 10, P.screen.h + 10); c.fillRect(P.screen.x + P.screen.w / 2 - 4, P.screen.y + P.screen.h + 5, 8, H * .68 - P.screen.y - P.screen.h - 5);
      },
      back(c, t, W, H, d, P) { if (d) glow(c, P.win.x + P.win.w * .7, P.win.y + P.win.h * .3, P.win.w * .5, '255,240,210', .8); else stars(c, P, t); },
      front(c, t, W, H, d, P) {
        for (let x = 0; x < W; x += 10) { c.fillStyle = `hsla(${(x / W * 360 + t / 15) % 360},90%,65%,${d ? .55 : .95})`; c.fillRect(x, H * .04, 8, 3); }
        if (!d) { const g = c.createLinearGradient(0, H * .04, 0, H * .2); g.addColorStop(0, `hsla(${(t / 15) % 360},90%,65%,.18)`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, H * .04, W, H * .16); }
        const s = P.screen, hue = (t / 25) % 360, g2 = c.createLinearGradient(s.x, s.y, s.x + s.w, s.y + s.h);
        g2.addColorStop(0, `hsl(${hue},70%,55%)`); g2.addColorStop(1, `hsl(${(hue + 80) % 360},70%,45%)`);
        c.fillStyle = g2; c.fillRect(s.x, s.y, s.w, s.h);
        c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(s.x + ((t / 8) % s.w), s.y + s.h * .7, 8, 8);
        if (!d) glow(c, s.x + s.w / 2, s.y + s.h / 2, s.w, `${Math.round(128 + 127 * Math.sin(t / 900))},140,255`, .18);
      }
    },

    parque: {
      name:'parque', level:5, pose:'workout',
      sounds:{noite:['crickets', 'wind'], dia:['birds', 'wind']},
      sky:d => d ? [[0,'#8EC3EE'],[.6,'#D8EEF6'],[1,'#EAF6E4']] : [[0,'#0B1426'],[.6,'#18263F'],[1,'#22324C']],
      build(c, W, H, d, r, P) {
        ridge(c, W, H, H * .58, 18, .007, d ? '#A8D4A0' : '#1C3328', r() * 6);
        const leaf = d ? ['#5E9C6A', '#76B27E'] : ['#15261D', '#1B3024'];
        for (let x = -20; x < W + 40; x += 110 + r() * 90) {
          const h = 70 + r() * 50, base = H * .71;
          c.fillStyle = d ? '#7A5A45' : '#1A1418'; c.fillRect(x - 5, base - h * .5, 10, h * .5);
          disc(c, x, base - h * .6, h * .32, leaf[0]); disc(c, x - h * .2, base - h * .48, h * .24, leaf[1]); disc(c, x + h * .22, base - h * .5, h * .25, leaf[1]);
        }
        c.fillStyle = d ? '#8CC37A' : '#17291F'; c.fillRect(0, H * .7, W, H * .3);
        c.fillStyle = d ? '#E8D6B0' : '#2A2A30';
        c.beginPath(); c.moveTo(W * .42, H); c.quadraticCurveTo(W * .5, H * .8, W * .56, H * .7); c.lineTo(W * .6, H * .7); c.quadraticCurveTo(W * .6, H * .82, W * .72, H); c.fill();
        P.lamps = [];
        [W * .34, W * .8].forEach(x => {
          c.fillStyle = '#3A3A48'; c.fillRect(x - 2, H * .5, 4, H * .22); c.fillRect(x - 9, H * .5 - 6, 18, 6);
          c.fillStyle = d ? '#E8E4D8' : '#FFE3A8'; c.fillRect(x - 6, H * .5, 12, 4); P.lamps.push({x, y:H * .5 + 2});
        });
      },
      back(c, t, W, H, d, P) {
        if (d) glow(c, W * .78, H * .18, H * .3, '255,240,200', .95);
        else { stars(c, P, t); glow(c, W * .8, H * .16, 70, '230,230,210', .3); disc(c, W * .8, H * .16, 20, '#EDE7D5'); }
      },
      front(c, t, W, H, d, P, still) {
        if (!d) {
          for (const l of P.lamps) glow(c, l.x, l.y, 110, '255,220,150', .35);
          for (const f of P.flies.slice(0, 12)) { const x = f.x + Math.sin(t / 1400 + f.p) * 30, y = f.y + Math.cos(t / 1700 + f.p) * 20, a = .4 + .5 * Math.sin(t / 500 + f.p * 3); if (a > 0) disc(c, x, y, 1.6, `rgba(240,255,190,${a})`); }
        } else for (const b of P.birds) {
          const wing = Math.sin(t / 150 + b.p) * 4;
          c.strokeStyle = 'rgba(60,70,90,.7)'; c.lineWidth = 1.6; c.beginPath();
          c.moveTo(b.x - 7, b.y - wing); c.lineTo(b.x, b.y); c.lineTo(b.x + 7, b.y - wing); c.stroke();
          if (!still) { b.x += b.v; if (b.x > W + 20) { b.x = -20; b.y = H * (.1 + Math.random() * .25); } }
        }
      }
    },

    cerejeiras: {
      name:'cerejeiras', level:7, pose:'bench',
      sounds:{noite:['wind', 'crickets'], dia:['birds', 'wind']},
      sky:d => d ? [[0,'#BFD8F2'],[.6,'#F6E3EC'],[1,'#FBEFF2']] : [[0,'#141430'],[.6,'#2A2548'],[1,'#3B2F58']],
      build(c, W, H, d, r, P) {
        ridge(c, W, H, H * .55, 26, .006, d ? '#D9C8E6' : '#2A2446', r() * 6);
        ridge(c, W, H, H * .64, 18, .009, d ? '#C8DDB8' : '#1F2A2E', r() * 6);
        c.fillStyle = d ? '#B9D8A6' : '#18241F'; c.fillRect(0, H * .74, W, H * .26);
        for (let i = 0; i < W / 6; i++) { c.fillStyle = d ? 'rgba(242,167,200,.7)' : 'rgba(165,106,150,.6)'; c.fillRect(r() * W, H * (.75 + r() * .25), 3, 2); }
        const blossom = d ? ['#F7C6D9', '#F2A7C8', '#FBDDE8'] : ['#8E5A86', '#A56A96', '#7A4C76'];
        for (let x = 30; x < W + 60; x += 170 + r() * 120) {
          const h = 150 + r() * 70, base = H * .76, tx = x + h * .08, ty = base - h * .62;
          c.strokeStyle = d ? '#6B4A45' : '#2A1E28'; c.lineCap = 'round';
          c.lineWidth = h * .07; c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x - h * .05, base - h * .3, tx, ty); c.stroke();
          c.lineWidth = h * .03; c.beginPath(); c.moveTo(tx, ty + h * .1); c.lineTo(tx - h * .3, ty - h * .05); c.moveTo(tx, ty + h * .05); c.lineTo(tx + h * .32, ty - h * .02); c.stroke();
          for (let i = 0; i < 11; i++) disc(c, tx + (r() - .5) * h * .9, ty + (r() - .5) * h * .45, h * (.1 + r() * .08), blossom[Math.floor(r() * 3)]);
        }
        P.lanterns = [];
        for (let i = 0; i < 5; i++) {
          const x = W * (.1 + i * .2), y = H * (.08 + (i % 2) * .05);
          c.strokeStyle = d ? 'rgba(80,60,70,.4)' : 'rgba(200,180,200,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y); c.stroke();
          c.fillStyle = '#E0564F'; c.fillRect(x - 9, y, 18, 22); c.fillStyle = '#3A2A2A'; c.fillRect(x - 7, y - 2, 14, 3); c.fillRect(x - 7, y + 21, 14, 3);
          P.lanterns.push({x, y:y + 11});
        }
      },
      back(c, t, W, H, d, P) {
        if (d) glow(c, W * .75, H * .2, H * .3, '255,240,215', .9);
        else { stars(c, P, t); glow(c, W * .76, H * .18, 70, '240,225,235', .3); disc(c, W * .76, H * .18, 22, '#F2E6EE'); }
      },
      front(c, t, W, H, d, P, still) {
        if (!d) for (const l of P.lanterns) glow(c, l.x, l.y, 60, '255,150,120', .35 + .05 * Math.sin(t / 400 + l.x));
        for (const p of P.petals) {
          c.save(); c.translate(p.x + Math.sin(t / 900 + p.p) * 25, p.y); c.rotate(t / 700 + p.p);
          c.fillStyle = d ? 'rgba(242,167,200,.9)' : 'rgba(230,170,210,.75)'; c.beginPath(); c.ellipse(0, 0, 4, 2.4, 0, 0, TAU); c.fill(); c.restore();
          if (!still) { p.y += p.v; p.x -= p.v * .4; if (p.y > H) { p.y = -10; p.x = Math.random() * W * 1.2; } }
        }
      }
    },

    neve: {
      name:'chalé na neve', level:9, pose:'cocoa',
      sounds:{noite:['fire', 'wind'], dia:['wind', 'fire']},
      sky:d => d ? [[0,'#B8D2EC'],[.6,'#E4EEF6'],[1,'#F4F7FA']] : [[0,'#050C1C'],[.6,'#10203A'],[1,'#1B2D48']],
      build(c, W, H, d, r, P) {
        ridge(c, W, H, H * .46, 44, .005, d ? '#E3EAF4' : '#27364F', r() * 6);
        ridge(c, W, H, H * .58, 22, .008, d ? '#F4F7FA' : '#34445E', r() * 6);
        for (let x = -20; x < W + 40; x += 60 + r() * 60) {
          const h = 60 + r() * 60, base = H * .74 + r() * 8;
          pine(c, x, base, h, d ? '#4E7D60' : '#16261F');
          c.fillStyle = d ? '#FFFFFF' : '#C9D4E6';
          for (let i = 0; i < 3; i++) { const top = base - h + i * h * .22, w = h * (.12 + i * .06); c.beginPath(); c.moveTo(x, top); c.lineTo(x - w, top + h * .14); c.lineTo(x + w, top + h * .14); c.fill(); }
        }
        c.fillStyle = d ? '#F4F7FA' : '#C3CEE2'; c.fillRect(0, H * .74, W, H * .26);
        const cx0 = W * .66, cw = Math.max(170, W * .16), ch = cw * .62, cb = H * .76;
        c.fillStyle = d ? '#8A5A3C' : '#4A3024'; c.fillRect(cx0, cb - ch, cw, ch);
        c.strokeStyle = d ? 'rgba(60,35,20,.35)' : 'rgba(0,0,0,.35)'; c.lineWidth = 2;
        for (let y = cb - ch + 12; y < cb; y += 12) { c.beginPath(); c.moveTo(cx0, y); c.lineTo(cx0 + cw, y); c.stroke(); }
        P.chimney = {x:cx0 + cw * .75, y:cb - ch - cw * .38};
        c.fillStyle = '#5E3A2A'; c.fillRect(P.chimney.x - 9, P.chimney.y, 18, cw * .3);
        c.fillStyle = d ? '#5E3A2A' : '#2E1E18'; c.beginPath(); c.moveTo(cx0 - 16, cb - ch); c.lineTo(cx0 + cw / 2, cb - ch - cw * .42); c.lineTo(cx0 + cw + 16, cb - ch); c.fill();
        c.fillStyle = d ? '#FFFFFF' : '#DCE4F0'; c.beginPath(); c.moveTo(cx0 - 16, cb - ch); c.lineTo(cx0 + cw / 2, cb - ch - cw * .42); c.lineTo(cx0 + cw + 16, cb - ch); c.lineTo(cx0 + cw + 16, cb - ch + 6); c.lineTo(cx0 + cw / 2, cb - ch - cw * .36); c.lineTo(cx0 - 16, cb - ch + 6); c.fill();
        P.cabinWins = [{x:cx0 + cw * .14, y:cb - ch * .7, w:cw * .22, h:ch * .32}, {x:cx0 + cw * .64, y:cb - ch * .7, w:cw * .22, h:ch * .32}];
        P.cabinWins.forEach(w => { c.fillStyle = d ? '#BFD8F0' : '#F2C46A'; c.fillRect(w.x, w.y, w.w, w.h); c.fillStyle = d ? '#6B4630' : '#2E1E18'; c.fillRect(w.x + w.w / 2 - 1, w.y, 2, w.h); c.fillRect(w.x, w.y + w.h / 2 - 1, w.w, 2); });
        c.fillStyle = d ? '#5E3A2A' : '#2E1E18'; c.fillRect(cx0 + cw * .42, cb - ch * .55, cw * .16, ch * .55);
      },
      back(c, t, W, H, d, P) {
        if (d) { glow(c, W * .2, H * .18, H * .3, '255,245,225', .9); return; }
        stars(c, P, t);
        for (let i = 0; i < 3; i++) {
          c.strokeStyle = i === 1 ? 'rgba(185,140,255,.12)' : 'rgba(120,240,190,.13)'; c.lineWidth = 34 - i * 8; c.beginPath();
          for (let x = 0; x <= W; x += 24) { const y = H * (.12 + i * .05) + Math.sin(x * .006 + t / 2600 + i) * 22; x ? c.lineTo(x, y) : c.moveTo(x, y); }
          c.stroke();
        }
      },
      front(c, t, W, H, d, P, still) {
        if (!d) P.cabinWins.forEach(w => glow(c, w.x + w.w / 2, w.y + w.h / 2, w.w * 1.6, '255,190,110', .3));
        for (let i = 0; i < 5; i++) { const k = ((t / 3200) + i / 5) % 1; disc(c, P.chimney.x + Math.sin(k * 6 + i) * 10, P.chimney.y - k * 120, 7 + k * 16, `rgba(225,225,235,${(1 - k) * .32})`); }
        c.fillStyle = 'rgba(255,255,255,.85)';
        for (const s of P.snow) {
          c.beginPath(); c.arc(s.x + Math.sin(t / 1000 + s.p) * 12, s.y, s.r, 0, TAU); c.fill();
          if (!still) { s.y += s.v; if (s.y > H) { s.y = -5; s.x = Math.random() * W; } }
        }
      }
    },

    /* ---------- cenários à venda (comprados com moedas na coleção) ---------- */
    aquario: {
      name:'aquário', level:1, price:250,
      sounds:{noite:['sea', 'space'], dia:['sea', 'beat']},
      sky:d => d ? [[0,'#7FD3E8'],[.5,'#3E9CC4'],[1,'#1E5A8A']] : [[0,'#0E2A4A'],[.5,'#0A1E38'],[1,'#061226']],
      build(c, W, H, d, r, P) {
        const base = H * .86;
        c.fillStyle = d ? '#E8D6A8' : '#2E3448';
        c.beginPath(); c.moveTo(0, H);
        for (let x = 0; x <= W + 20; x += 20) c.lineTo(x, base + Math.sin(x * .01) * 10);
        c.lineTo(W, H); c.fill();
        for (let i = 0; i < 9; i++) {
          const x = r() * W, s = 20 + r() * 40;
          c.fillStyle = d ? ['#8A7A6A', '#9C8A78'][i % 2] : ['#1E2233', '#262B40'][i % 2];
          c.beginPath(); c.ellipse(x, base + 8, s, s * .55, 0, Math.PI, 0); c.fill();
        }
        const coral = d ? ['#F27A8A', '#F2A65A', '#B99AF5'] : ['#7A3A5A', '#7A5230', '#4E4080'];
        for (let x = 60; x < W; x += 180 + r() * 160) {
          const col = coral[Math.floor(r() * 3)], h = 50 + r() * 60;
          c.strokeStyle = col; c.lineWidth = 7; c.lineCap = 'round';
          for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x + k * 18, base - h * .5, x + k * 28, base - h + Math.abs(k) * 12); c.stroke(); }
        }
        P.weeds = Array.from({length:Math.round(W / 90)}, () => ({x:r() * W, h:80 + r() * 120, p:r() * 6}));
        P.fish = Array.from({length:7}, () => ({x:r() * W, y:H * (.2 + r() * .55), v:(.4 + r() * .8) * (r() < .5 ? -1 : 1), s:8 + r() * 10, col:['#F2A65A', '#F7D154', '#8EC5F0', '#F4A3C0'][Math.floor(r() * 4)]}));
      },
      back(c, t, W, H, d) {
        for (let i = 0; i < 5; i++) {
          const x = W * (.1 + i * .22) + Math.sin(t / 3000 + i) * 30;
          const g = c.createLinearGradient(x, 0, x, H * .8);
          g.addColorStop(0, `rgba(255,255,255,${d ? .18 : .06})`); g.addColorStop(1, 'rgba(255,255,255,0)');
          c.fillStyle = g; c.beginPath(); c.moveTo(x - 20, 0); c.lineTo(x + 20, 0); c.lineTo(x + 90, H * .8); c.lineTo(x - 50, H * .8); c.fill();
        }
      },
      front(c, t, W, H, d, P, still) {
        c.strokeStyle = d ? '#3F8050' : '#1E4A30'; c.lineWidth = 6; c.lineCap = 'round';
        for (const w of P.weeds) { c.beginPath(); c.moveTo(w.x, H); c.quadraticCurveTo(w.x + Math.sin(t / 900 + w.p) * 25, H - w.h * .5, w.x + Math.sin(t / 700 + w.p) * 35, H - w.h); c.stroke(); }
        for (const f of P.fish) {
          const dir = Math.sign(f.v), y = f.y + Math.sin(t / 700 + f.x * .01) * 6;
          c.fillStyle = d ? f.col : 'rgba(170,190,230,.5)';
          c.beginPath(); c.ellipse(f.x, y, f.s, f.s * .55, 0, 0, TAU); c.fill();
          c.beginPath(); c.moveTo(f.x - dir * f.s * .8, y); c.lineTo(f.x - dir * f.s * 1.6, y - f.s * .6); c.lineTo(f.x - dir * f.s * 1.6, y + f.s * .6); c.fill();
          c.fillStyle = '#1E1B2A'; c.fillRect(f.x + dir * f.s * .45, y - 2, 3, 3);
          if (!still) { f.x += f.v; if (f.x < -40) f.x = W + 30; if (f.x > W + 40) f.x = -30; }
        }
        c.strokeStyle = d ? 'rgba(255,255,255,.7)' : 'rgba(180,220,255,.45)'; c.lineWidth = 1.5;
        for (const m of P.motes.slice(0, 26)) {
          c.beginPath(); c.arc(m.x + Math.sin(t / 600 + m.p) * 6, m.y, 2 + (m.p % 3), 0, TAU); c.stroke();
          if (!still) { m.y -= .6; if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; } }
        }
      }
    },

    lanternas: {
      name:'festival de lanternas', level:1, price:300,
      sounds:{noite:['wind', 'crickets'], dia:['wind', 'birds']},
      sky:d => d ? [[0,'#F2B880'],[.5,'#E88A7A'],[1,'#7A5A8C']] : [[0,'#0B0A22'],[.6,'#1E1640'],[1,'#2E1E4A']],
      build(c, W, H, d, r, P) {
        ridge(c, W, H, H * .6, 30, .006, d ? '#6A4A6E' : '#15122A', r() * 6);
        const lake = H * .7, g = c.createLinearGradient(0, lake, 0, H);
        g.addColorStop(0, d ? '#B06A7A' : '#1A1838'); g.addColorStop(1, d ? '#5A3A5A' : '#0C0B1E');
        c.fillStyle = g; c.fillRect(0, lake, W, H - lake);
        c.fillStyle = d ? '#3A2A30' : '#0A0814'; c.fillRect(W * .05, H * .78, W * .3, 8);
        for (let x = W * .06; x < W * .35; x += 40) c.fillRect(x, H * .78, 6, 50);
        P.lake = lake;
        P.lanterns2 = Array.from({length:22}, () => ({x:r() * W, y:H * (.2 + r() * .55), v:.15 + r() * .3, s:.6 + r() * .7, p:r() * 6}));
      },
      back(c, t, W, H, d, P) {
        if (d) { glow(c, W * .7, P.lake - 30, H * .3, '255,210,150', .7); disc(c, W * .7, P.lake - 10, H * .06, '#FFD8A0'); }
        else { stars(c, P, t); glow(c, W * .2, H * .15, 70, '240,230,210', .3); disc(c, W * .2, H * .15, 22, '#F2EAD8'); }
      },
      front(c, t, W, H, d, P, still) {
        for (const l of P.lanterns2) {
          const x = l.x + Math.sin(t / 1500 + l.p) * 12, w = 16 * l.s, h = 22 * l.s, a = d ? .55 : .9;
          glow(c, x, l.y, 40 * l.s, '255,170,90', d ? .2 : .45);
          c.fillStyle = `rgba(255,${150 + Math.round(30 * Math.sin(t / 400 + l.p))},80,${a})`;
          c.beginPath(); c.moveTo(x - w * .5, l.y - h * .5); c.lineTo(x + w * .5, l.y - h * .5); c.lineTo(x + w * .4, l.y + h * .5); c.lineTo(x - w * .4, l.y + h * .5); c.fill();
          if (l.y > P.lake - 200) { const ry = P.lake + (P.lake - l.y) * .35 + 20; if (ry < H) { c.fillStyle = `rgba(255,170,90,${d ? .15 : .3})`; c.fillRect(x - w * .3, ry, w * .6, 3); } }
          if (!still) { l.y -= l.v; if (l.y < -40) { l.y = H * .72; l.x = Math.random() * W; } }
        }
      }
    },

    deserto: {
      name:'deserto sob as estrelas', level:1, price:350,
      sounds:{noite:['wind', 'space'], dia:['wind']},
      sky:d => d ? [[0,'#8EC0EA'],[.6,'#F3D9A8'],[1,'#F2B880']] : [[0,'#06091E'],[.6,'#171A40'],[1,'#33285A']],
      build(c, W, H, d, r) {
        ridge(c, W, H, H * .66, 30, .004, d ? '#E8B878' : '#3A2E4A', r() * 6);
        ridge(c, W, H, H * .74, 26, .006, d ? '#D9A060' : '#2E2440', r() * 6);
        ridge(c, W, H, H * .84, 20, .008, d ? '#C98A4A' : '#221A32', r() * 6);
        const cactus = d ? '#4E7D50' : '#141A20';
        for (let x = 80; x < W; x += 260 + r() * 260) {
          const base = H * (.8 + r() * .1), h = 60 + r() * 60;
          c.fillStyle = cactus; c.fillRect(x - 7, base - h, 14, h);
          c.fillRect(x - 26, base - h * .6, 10, h * .3); c.fillRect(x - 26, base - h * .6, 22, 8);
          c.fillRect(x + 16, base - h * .75, 10, h * .35); c.fillRect(x + 4, base - h * .45, 22, 8);
        }
      },
      back(c, t, W, H, d, P, still) {
        if (d) { glow(c, W * .75, H * .25, H * .35, '255,240,200', .95); disc(c, W * .75, H * .25, H * .06, '#FFF3D0'); return; }
        c.save(); c.translate(W / 2, H * .35); c.rotate(-.35);
        const g = c.createLinearGradient(0, -80, 0, 80); g.addColorStop(0, 'rgba(185,168,236,0)'); g.addColorStop(.5, 'rgba(185,168,236,.14)'); g.addColorStop(1, 'rgba(185,168,236,0)');
        c.fillStyle = g; c.fillRect(-W, -80, W * 2, 160); c.restore();
        stars(c, P, t, 1.2);
        glow(c, W * .8, H * .2, 120, '240,235,220', .35); disc(c, W * .8, H * .2, 42, '#F2EAD8');
        disc(c, W * .8 - 12, H * .2 - 8, 7, 'rgba(0,0,0,.08)'); disc(c, W * .8 + 14, H * .2 + 10, 5, 'rgba(0,0,0,.08)');
        shooting(c, P, W, H, still);
      }
    },

    /* ---------- tema de Halloween: lua laranja, cemitério, abóboras acesas, morcegos e névoa ---------- */
    halloween: {
      name:'noite de halloween', level:1,
      sounds:{noite:['wind', 'crickets'], dia:['wind', 'crickets']},
      sky:d => d ? [[0,'#4A2E6E'],[.55,'#B0527A'],[1,'#F2995A']] : [[0,'#0C0718'],[.55,'#23123A'],[1,'#4A1E3A']],
      build(c, W, H, d, r, P) {
        ridge(c, W, H, H * .72, 26, .005, d ? '#3A2448' : '#140C22', r() * 6);
        const ground = H * .84;
        c.fillStyle = d ? '#2A1A36' : '#0B0714';
        c.beginPath(); c.moveTo(0, H);
        for (let x = 0; x <= W + 20; x += 20) c.lineTo(x, ground + Math.sin(x * .012) * 8);
        c.lineTo(W, H); c.fill();
        /* árvore seca */
        const tx = W * .12, tc = d ? '#1E1228' : '#07040E';
        c.strokeStyle = tc; c.lineCap = 'round';
        const branch = (x, y, len, ang, w) => {
          if (w < 1.2) return;
          const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
          c.lineWidth = w; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
          branch(x2, y2, len * .72, ang - .45 - r() * .2, w * .68);
          branch(x2, y2, len * .7, ang + .4 + r() * .2, w * .66);
        };
        branch(tx, ground + 4, H * .16, -Math.PI / 2, 16);
        /* lápides e cerquinha */
        const stone = d ? '#5E4E6E' : '#2A2438', dark = d ? '#3E3250' : '#17121F';
        for (let i = 0; i < 7; i++) {
          const x = W * (.28 + i * .1 + r() * .04), h = 34 + r() * 26, w = 24 + r() * 10, y = ground + 6 + r() * 10;
          c.fillStyle = stone; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w / 2, y - h + w / 2); c.arc(x, y - h + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w / 2, y); c.fill();
          c.fillStyle = dark; c.fillRect(x - 5, y - h + 14, 10, 3); c.fillRect(x - 1.5, y - h + 9, 3, 12);
        }
        c.fillStyle = d ? '#241630' : '#0A0612';
        for (let x = W * .62; x < W; x += 16) { c.fillRect(x, ground - 30, 5, 40); c.beginPath(); c.moveTo(x - 2, ground - 30); c.lineTo(x + 2.5, ground - 38); c.lineTo(x + 7, ground - 30); c.fill(); }
        c.fillRect(W * .62, ground - 22, W * .38, 4); c.fillRect(W * .62, ground - 8, W * .38, 4);
        /* abóboras (a carinha acesa pisca no "front") */
        P.pumpkins = [];
        for (let i = 0; i < 5; i++) {
          const x = W * (.2 + i * .17 + r() * .05), s = 16 + r() * 12, y = ground + 18 + r() * 14;
          c.fillStyle = '#D9661E'; c.beginPath(); c.ellipse(x, y, s * 1.15, s, 0, 0, TAU); c.fill();
          c.fillStyle = '#B04E14'; c.beginPath(); c.ellipse(x, y, s * .45, s, 0, 0, TAU); c.fill();
          c.fillStyle = '#3F6A2A'; c.fillRect(x - 2, y - s - 6, 4, 8);
          P.pumpkins.push({x, y, s, p:r() * 6});
        }
        P.bats = Array.from({length:6}, () => ({x:r() * W, y:H * (.12 + r() * .3), v:(.6 + r() * .8) * (r() < .5 ? -1 : 1), p:r() * 6, s:.7 + r() * .6}));
      },
      back(c, t, W, H, d, P) {
        if (!d) stars(c, P, t, .9);
        const mx = W * .78, my = H * .24, R = Math.min(W, H) * .09;
        glow(c, mx, my, R * 4, d ? '255,190,120' : '255,170,90', d ? .55 : .45);
        disc(c, mx, my, R, d ? '#FFD9A0' : '#F7B865');
        disc(c, mx - R * .3, my - R * .2, R * .18, 'rgba(0,0,0,.07)'); disc(c, mx + R * .35, my + R * .25, R * .12, 'rgba(0,0,0,.07)');
      },
      front(c, t, W, H, d, P, still) {
        /* carinha das abóboras acesa, tremendo como vela */
        for (const k of P.pumpkins) {
          const f = .75 + .25 * Math.sin(t / 130 + k.p) * Math.sin(t / 370 + k.p * 2);
          glow(c, k.x, k.y, k.s * 3, '255,160,60', (d ? .12 : .28) * f);
          c.fillStyle = `rgba(255,${200 + Math.round(40 * f)},90,${.75 + .25 * f})`;
          const e = k.s * .28;
          c.beginPath(); c.moveTo(k.x - k.s * .5, k.y - e); c.lineTo(k.x - k.s * .5 + e, k.y - e * 2.2); c.lineTo(k.x - k.s * .5 + e * 2, k.y - e); c.fill();
          c.beginPath(); c.moveTo(k.x + k.s * .5, k.y - e); c.lineTo(k.x + k.s * .5 - e, k.y - e * 2.2); c.lineTo(k.x + k.s * .5 - e * 2, k.y - e); c.fill();
          c.fillRect(k.x - k.s * .55, k.y + e * .6, k.s * 1.1, e * .9);
        }
        /* morcegos batendo asa */
        c.fillStyle = d ? '#2A1838' : '#05030A';
        for (const b of P.bats) {
          const fl = Math.sin(t / 90 + b.p), s = 10 * b.s, y = b.y + Math.sin(t / 700 + b.p) * 10;
          c.beginPath(); c.moveTo(b.x, y);
          c.quadraticCurveTo(b.x - s, y - s * fl, b.x - s * 2, y - s * .2 * fl);
          c.quadraticCurveTo(b.x - s * 1.1, y + s * .3, b.x, y + s * .35);
          c.quadraticCurveTo(b.x + s * 1.1, y + s * .3, b.x + s * 2, y - s * .2 * fl);
          c.quadraticCurveTo(b.x + s, y - s * fl, b.x, y); c.fill();
          if (!still) { b.x += b.v; if (b.x < -40) b.x = W + 30; if (b.x > W + 40) b.x = -30; }
        }
        /* névoa baixinha passando */
        for (let i = 0; i < 4; i++) {
          const x = ((t / 60 * (i % 2 ? 1 : -1) + i * W / 3) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * .2;
          const g = c.createRadialGradient(x, H * .9, 0, x, H * .9, W * .25);
          g.addColorStop(0, `rgba(${d ? '230,210,240' : '170,150,200'},${d ? .16 : .13})`); g.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = g; c.fillRect(x - W * .25, H * .7, W * .5, H * .3);
        }
      }
    }
  };

  /* motor */
  let cv, cx, W, H, fg, P, cur = 'cidade', still = false;
  const isDay = () => document.documentElement.dataset.look === 'dia';
  function particles(r) {
    return {
      stars: Array.from({length:Math.round(W * H / 7000)}, () => ({x:r() * W, y:r() * H, s:r() * 1.4 + .3, p:r() * 6.28})),
      drops: Array.from({length:Math.round(W / 7)}, () => ({x:r() * W * 1.2, y:r() * H, l:10 + r() * 18, v:6 + r() * 6})),
      flies: Array.from({length:28}, () => ({x:r() * W, y:H * (.5 + r() * .45), p:r() * 20})),
      leaves: Array.from({length:18}, () => ({x:r() * W, y:r() * H, v:.4 + r() * .6, p:r() * 6, c:['#D98B4A','#E3B04B','#8DB86A'][Math.floor(r() * 3)]})),
      motes: Array.from({length:40}, () => ({x:r() * W, y:r() * H, p:r() * 6})),
      snow: Array.from({length:Math.round(W / 10)}, () => ({x:r() * W, y:r() * H, r:1 + r() * 2.2, v:.4 + r() * .9, p:r() * 6})),
      petals: Array.from({length:40}, () => ({x:r() * W * 1.2, y:r() * H, v:.5 + r() * .8, p:r() * 6})),
      notes: Array.from({length:10}, () => ({x:W * (.1 + r() * .8), y:H * (.2 + r() * .7), v:.25 + r() * .35, s:22 + r() * 18, a:0, p:r() * 6, ch:r() < .5 ? '♪' : '♫'})),
      birds: Array.from({length:4}, () => ({x:r() * W, y:H * (.1 + r() * .25), v:.6 + r() * .6, p:r() * 6})),
      shoot: {on:false},
      wdrops: Array.from({length:Math.round(W / 5)}, () => ({x:r() * W * 1.2, y:r() * H, l:12 + r() * 20, v:9 + r() * 7})),
      wsnow: Array.from({length:Math.round(W / 8)}, () => ({x:r() * W, y:r() * H, r:1.2 + r() * 2.4, v:.5 + r() * 1, p:r() * 6}))
    };
  }
  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(innerWidth, 1); H = Math.max(innerHeight, 1);
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fg = document.createElement('canvas'); fg.width = W * dpr; fg.height = H * dpr;
    const c = fg.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = rnd(42); P = particles(r);
    THEMES[cur].build(c, W, H, isDay(), r, P);
  }
  function frame(t) {
    const th = THEMES[cur], d = isDay();
    const g = cx.createLinearGradient(0, 0, 0, H); th.sky(d).forEach(([p, col]) => g.addColorStop(p, col));
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    th.back && th.back(cx, t, W, H, d, P, still);
    if (fg.width && fg.height) cx.drawImage(fg, 0, 0, W, H);
    th.front && th.front(cx, t, W, H, d, P, still);
    if (weather) drawWeather(cx, t, d);
    if (!still) requestAnimationFrame(frame);
  }
  /* clima de verdade (clima.js): desenha por cima de qualquer cenário.
     Cenário de dentro de casa (com janela, P.win) só mostra o tempo pela janela */
  let weather = null, flash = 0;
  function drawWeather(c, t, d) {
    const clip = P.win, w = weather;
    if (w === 'clouds' || w === 'fog' || w === 'storm' || w === 'rain') {
      c.fillStyle = d ? 'rgba(110,115,135,.14)' : 'rgba(10,10,20,.18)'; c.fillRect(0, 0, W, H);
    }
    if (w === 'rain' || w === 'drizzle' || w === 'storm') {
      c.save();
      if (clip) { c.beginPath(); c.rect(clip.x, clip.y, clip.w, clip.h); c.clip(); }
      c.strokeStyle = d ? 'rgba(80,90,130,.35)' : 'rgba(190,200,235,.32)'; c.lineWidth = w === 'drizzle' ? 1 : 1.3; c.beginPath();
      const n = w === 'drizzle' ? P.wdrops.length / 3 : P.wdrops.length;
      for (let i = 0; i < n; i++) {
        const q = P.wdrops[i];
        c.moveTo(q.x, q.y); c.lineTo(q.x - q.l * .2, q.y + q.l);
        if (!still) { q.y += q.v; q.x -= q.v * .2; if (q.y > H) { q.y = -20; q.x = Math.random() * W * 1.2; } }
      }
      c.stroke(); c.restore();
    }
    if (w === 'storm' && !still) {
      if (flash <= 0 && Math.random() < .003) flash = 1;
      if (flash > 0) { c.fillStyle = `rgba(255,255,255,${flash * .35})`; c.fillRect(0, 0, W, H); flash -= .06; }
    }
    if (w === 'snow') {
      c.save();
      if (clip) { c.beginPath(); c.rect(clip.x, clip.y, clip.w, clip.h); c.clip(); }
      c.fillStyle = 'rgba(255,255,255,.85)';
      for (const s of P.wsnow) {
        c.beginPath(); c.arc(s.x + Math.sin(t / 900 + s.p) * 6, s.y, s.r, 0, TAU); c.fill();
        if (!still) { s.y += s.v; if (s.y > H) { s.y = -5; s.x = Math.random() * W; } }
      }
      c.restore();
    }
    if (w === 'fog') {
      for (let i = 0; i < 5; i++) {
        const x = ((t / 50 * (i % 2 ? 1 : -1) + i * W / 4) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * .2, y = H * (.35 + i * .13);
        const g = c.createRadialGradient(x, y, 0, x, y, W * .35);
        g.addColorStop(0, `rgba(${d ? '235,235,245' : '160,160,185'},${d ? .3 : .18})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.fillRect(x - W * .35, y - W * .35, W * .7, W * .7);
      }
    }
  }
  function setWeather(w) { weather = w || null; if (still) frame(0); }
  function redraw() { build(); if (still) frame(0); }
  function start(canvas, id) {
    cv = canvas; cx = cv.getContext('2d');
    still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    cur = THEMES[id] ? id : 'cidade';
    build(); requestAnimationFrame(frame);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(redraw, 150); });
  }
  function set(id) { if (THEMES[id]) { cur = id; redraw(); } }
  return {THEMES, start, set, redraw, weather:setWeather};
})();
