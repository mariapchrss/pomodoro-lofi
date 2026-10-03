/* O que só existe no programa do computador (o site não tem):
   - a faixa invisível no topo para arrastar a janela (ela não tem barra de título);
   - o botão "📌 fixar na tela": some a janela grande e fica só o bichinho com o tempo, flutuando por cima de tudo.
     Enquanto está fixado, este arquivo manda o desenho do bichinho e o tempo para a janelinha (pet.html) */
const { ipcRenderer } = require('electron');

let fixado = false, envio = null, ultimo = '';
const noSite = () => /pomodoro-lofi\.(web\.app|firebaseapp\.com)$/.test(location.hostname);
function mandar() {
  const cv = document.getElementById('petCanvas'), t = document.getElementById('time');
  if (!cv || !t) return;
  let img = ''; try { img = cv.toDataURL('image/png'); } catch (e) {}
  const d = { t: t.textContent, img, mode: document.body.dataset.mode || 'focus' }, chave = d.t + d.mode + img;
  if (chave !== ultimo) { ultimo = chave; ipcRenderer.send('pet-data', d); }
}
function estado(on) {
  fixado = !!on;
  const b = document.getElementById('deskPin');
  if (b) { b.textContent = fixado ? '📌 tirar da tela' : '📌 fixar na tela'; b.title = fixado ? 'tira o bichinho do canto da tela' : 'fica só o seu bichinho com o tempo no canto da tela, por cima das outras janelas'; }
  clearInterval(envio); envio = null; ultimo = '';
  if (fixado) { mandar(); envio = setInterval(mandar, 400); }
}
function montar() {
  if (!noSite() || document.getElementById('deskPin')) return;
  const st = document.createElement('style');
  st.textContent = `
    #deskPin{position:fixed;right:14px;bottom:14px;z-index:9999;font:700 13px system-ui,"Segoe UI",sans-serif;color:#15131F;background:#F4B86A;border:0;border-radius:999px;padding:9px 14px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.4);opacity:.92;-webkit-app-region:no-drag}
    #deskPin:hover{opacity:1}
    body.zen #deskPin{display:none}
    #deskDrag{position:fixed;top:0;left:0;right:140px;height:30px;z-index:9998;-webkit-app-region:drag}`;
  document.head.appendChild(st);
  const b = document.createElement('button'); b.id = 'deskPin'; b.type = 'button';
  b.onclick = () => ipcRenderer.send('mini', !fixado);
  document.body.appendChild(b);
  const faixa = document.createElement('div'); faixa.id = 'deskDrag'; faixa.setAttribute('aria-hidden', 'true');
  document.body.appendChild(faixa);
  estado(false);
  ipcRenderer.send('mini-ask');
}
ipcRenderer.on('mini-state', (e, on) => estado(on));
/* ⏯ na janelinha do bichinho = clicar no botão começar/pausar do site */
ipcRenderer.on('do-toggle', () => { const b = document.getElementById('toggle'); if (b) b.click(); });
window.addEventListener('DOMContentLoaded', montar);
