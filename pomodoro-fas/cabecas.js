// imprime a parte de cima (cabeça) do desenho original de cada personagem, com números de linha e coluna
const fs = require('fs');
const src = fs.readFileSync('C:/Users/danie/OneDrive/Documentos/Documentos/Bot/pomodoro-fas/fas.js', 'utf8');
global.Pets = { LIST:[], addSpecial() {} };
eval(src.replace('const add = (info, pal, rows) => {', 'const add = (info, pal, rows) => { global.RAW = global.RAW || {}; global.RAW[info.id] = {pal, rows: rows.slice()};'));
for (const id of process.argv.slice(2)) {
  const {pal, rows} = global.RAW[id], N = rows.length;
  let top = N, bot = 0; rows.forEach((r, y) => { if (/[^.]/.test(r)) { top = Math.min(top, y); bot = y; } });
  const upto = top + Math.ceil((bot - top) * 0.6);
  console.log(`== ${id} ${N}x${N} ${JSON.stringify(pal)}`);
  console.log('    ' + [...Array(N).keys()].map(i => i % 10).join(''));
  for (let y = top; y <= upto; y++) console.log(String(y).padStart(3) + ' ' + rows[y]);
}
