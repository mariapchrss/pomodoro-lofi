// relatório de onde cada personagem ficou com os olhos ("e"): altura (0 = topo do desenho, 1 = pé) e lado
const fs = require('fs');
const src = fs.readFileSync('C:/Users/danie/OneDrive/Documentos/Documentos/Bot/pomodoro-fas/fas.js', 'utf8');
const out = [];
global.Pets = { LIST:[], addSpecial(info, s) {
  const g = s.rows, N = g.length; let top = N, bot = -1, left = N, right = -1; const eyes = [];
  g.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') { top = Math.min(top, y); bot = Math.max(bot, y); left = Math.min(left, x); right = Math.max(right, x); } if (ch === 'e') eyes.push([y, x]); }));
  (s.eyes || []).forEach(c => eyes.push(c));   // olhos marcados à mão (máscara)
  if (!eyes.length) { out.push(`${info.id.padEnd(13)} SEM OLHO`); return; }
  // pedaços de olho
  const seen = new Set(), comps = [];
  for (const [y, x] of eyes) { if (seen.has(y * N + x)) continue; const st = [[y, x]], c = []; seen.add(y * N + x);
    while (st.length) { const [cy, cx] = st.pop(); c.push([cy, cx]); for (const [dy, dx] of [[1,0],[-1,0],[0,1],[0,-1]]) { const ny = cy + dy, nx = cx + dx; if (eyes.some(([ey, ex]) => ey === ny && ex === nx) && !seen.has(ny * N + nx)) { seen.add(ny * N + nx); st.push([ny, nx]); } } }
    comps.push(c); }
  const H = bot - top + 1, W = right - left + 1;
  const desc = comps.map(c => { const ys = c.map(p => p[0]), xs = c.map(p => p[1]);
    return `[alt ${((Math.min(...ys) - top) / H).toFixed(2)} lado ${((xs.reduce((a, b) => a + b) / xs.length - left) / W).toFixed(2)} ${c.length}px]`; }).join(' ');
  out.push(`${info.id.padEnd(13)} ${N}x${N} ${desc}`);
} };
eval(src);
console.log(out.join('\n'));
