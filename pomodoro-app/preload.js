/* Botão "📌 fixar na tela" que só existe no programa do computador (o site não tem).
   Clicou: a janela vira um reloginho pequeno que fica por cima das outras janelas. Clicou de novo: volta ao normal. */
const { ipcRenderer } = require('electron');

let mini = false;
function botao() {
  if (!/pomodoro-lofi\.(web\.app|firebaseapp\.com)$/.test(location.hostname) || document.getElementById('deskPin')) return;
  const b = document.createElement('button');
  b.id = 'deskPin'; b.type = 'button';
  const pinta = () => {
    b.textContent = mini ? '⤢' : '📌 fixar na tela';
    b.title = mini ? 'voltar para a janela grande' : 'vira um reloginho pequeno que fica por cima das outras janelas';
    b.classList.toggle('mini', mini);
  };
  b.onclick = () => { mini = !mini; pinta(); ipcRenderer.send('mini', mini); };
  const st = document.createElement('style');
  st.textContent = `
    #deskPin{position:fixed;right:14px;bottom:14px;z-index:9999;font:700 13px system-ui,"Segoe UI",sans-serif;color:#15131F;background:#F4B86A;border:0;border-radius:999px;padding:9px 14px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.4);opacity:.92}
    #deskPin:hover{opacity:1}
    #deskPin.mini{right:6px;top:6px;bottom:auto;padding:4px 9px;font-size:14px;opacity:.75}
    body.zen #deskPin:not(.mini){display:none}`;
  document.head.appendChild(st);
  document.body.appendChild(b);
  pinta();
}
ipcRenderer.on('mini-state', (e, on) => { mini = !!on; const b = document.getElementById('deskPin'); if (b) { b.classList.toggle('mini', mini); b.textContent = mini ? '⤢' : '📌 fixar na tela'; } });
window.addEventListener('DOMContentLoaded', () => { botao(); ipcRenderer.send('mini-ask'); });
