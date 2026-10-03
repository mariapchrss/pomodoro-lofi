/* Pomodoro Lo-fi para computador: uma janela própria que abre o site (https://pomodoro-lofi.web.app).
   Como abre o site de verdade, toda atualização publicada chega sozinha, sem gerar outro instalador.
   Sem internet, o próprio site abre a cópia guardada (sw.js); só na primeira vez sem internet aparece o offline.html */
const { app, BrowserWindow, shell, session, ipcMain, screen } = require('electron');
const path = require('path');

const SITE = 'https://pomodoro-lofi.web.app/';
const DENTRO = ['pomodoro-lofi.web.app', 'pomodoro-lofi.firebaseapp.com'];          // abre dentro do programa
const LOGIN = ['accounts.google.com', 'pomodoro-lofi.firebaseapp.com'];               // janelinha do "Entrar com Google"
const host = u => { try { return new URL(u).hostname; } catch (e) { return ''; } };

/* o Google recusa login em "navegador embutido": sem o nome do Electron ele trata como Chrome */
app.userAgentFallback = app.userAgentFallback.replace(/\s(?:Electron|pomodoro-lofi)\/\S+/gi, '');
app.setAppUserModelId('app.pomodorolofi.desktop');   // nome certo nos avisos do Windows

let win = null;
function abrir() {
  win = new BrowserWindow({
    width: 1240, height: 860, minWidth: 380, minHeight: 560,
    backgroundColor: '#15131F', autoHideMenuBar: true, title: 'Pomodoro Lo-fi',
    icon: path.join(__dirname, 'icon.png'),
    /* backgroundThrottling desligado: o cronômetro continua certinho com a janela minimizada */
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false, preload: path.join(__dirname, 'preload.js') }
  });
  win.loadURL(SITE);
  /* recarregou no modo mini: o visual pequeno precisa ser colocado de novo */
  win.webContents.on('did-finish-load', () => { miniKey = null; if (mini) pintarMini(); });
  /* primeira vez sem internet: mostra um aviso com botão de tentar de novo */
  win.webContents.on('did-fail-load', (e, code, desc, url, principal) => { if (principal && code !== -3) win.loadFile(path.join(__dirname, 'offline.html')); });
  /* links de fora (YouTube, Spotify, e-mail…) abrem no navegador da pessoa; o login do Google abre numa janelinha */
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (LOGIN.includes(host(url)) || DENTRO.includes(host(url)))
      return { action: 'allow', overrideBrowserWindowOptions: { width: 520, height: 680, autoHideMenuBar: true, parent: win } };
    if (/^(https?|mailto):/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith('file:') || DENTRO.includes(host(url)) || LOGIN.includes(host(url))) return;
    e.preventDefault();
    if (/^(https?|mailto):/i.test(url)) shell.openExternal(url);
  });
  win.on('closed', () => { win = null; mini = false; miniKey = null; });
}

/* ---------- 📌 fixar na tela: a janela vira um reloginho que fica por cima das outras ----------
   O botão vem do preload.js. Aqui a janela encolhe, vai para o canto de baixo à direita e fica sempre por cima;
   um CSS esconde tudo menos o relógio e os botões. Dá para arrastar pela barra de título e mudar o tamanho */
const MINI_CSS = `
.top,.side-col,.board,#histPanel,.foot,.acts-wrap,.gear,#settingsBox,.modebar,.set,#spinBtn,.buddies,.roombar,.arrangebar,.zenexit,.zenmusic,.zenmenu,#toast{display:none!important}
html,body{overflow:hidden!important;height:100%!important}
body{padding:0!important;margin:0!important}
body > *:not(canvas):not(dialog):not(#deskPin){padding:0!important;margin:0!important;max-width:none!important}
.hero{display:block!important;padding:0!important;margin:0!important}
.timer{background:transparent!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;padding:8px!important;margin:0!important;min-height:100vh;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.timer .clock{width:min(62vw,58vh)!important;height:min(62vw,58vh)!important;margin:0!important;transform:none!important}
.timer .time{font-size:min(15vw,14vh)!important;line-height:1!important}
.timer .mood{font-size:min(4.2vw,4vh)!important;letter-spacing:0!important;white-space:nowrap}
.timer .now{font-size:12px!important;margin:0!important}
.timer .controls{margin:0!important;gap:6px!important}
.timer .controls .btn{padding:6px 12px!important;font-size:13px!important;min-width:0!important}
.timer .pet{display:none!important}
`;
let mini = false, miniKey = null, antes = null;
async function pintarMini() { if (win && !miniKey) miniKey = await win.webContents.insertCSS(MINI_CSS); }
async function setMini(on) {
  if (!win || on === mini) return;
  mini = on;
  if (on) {
    if (win.isFullScreen()) win.setFullScreen(false);
    if (win.isMaximized()) win.unmaximize();
    antes = win.getBounds();
    const area = screen.getDisplayMatching(antes).workArea, w = 280, h = 350;
    win.setMinimumSize(200, 240);
    win.setBounds({ x: area.x + area.width - w - 16, y: area.y + area.height - h - 16, width: w, height: h });
    win.setAlwaysOnTop(true, 'floating');
    await pintarMini();
  } else {
    if (miniKey) { await win.webContents.removeInsertedCSS(miniKey).catch(() => {}); miniKey = null; }
    win.setAlwaysOnTop(false);
    win.setMinimumSize(380, 560);
    if (antes) win.setBounds(antes);
  }
  win.webContents.send('mini-state', mini);
}
ipcMain.on('mini', (e, on) => { if (win && e.sender === win.webContents) setMini(!!on); });
ipcMain.on('mini-ask', e => e.sender.send('mini-state', mini));

/* teste rápido (npx electron . --teste): abre, tira uma foto da janela normal e outra do modo mini em teste/, e fecha */
async function teste() {
  const fs = require('fs'), dir = path.join(__dirname, 'teste'), espera = ms => new Promise(r => setTimeout(r, ms));
  fs.mkdirSync(dir, { recursive: true });
  const info = {};
  try {
    await new Promise(r => win.webContents.once('did-finish-load', r));
    await espera(3500);
    await win.webContents.executeJavaScript(`(() => { const d = document.getElementById('newsDlg'); if (d && d.open) d.close(); })()`);
    await espera(400);
    info.url = win.webContents.getURL();
    info.botao = await win.webContents.executeJavaScript(`!!document.getElementById('deskPin')`);
    info.userAgent = await win.webContents.executeJavaScript('navigator.userAgent');
    fs.writeFileSync(path.join(dir, 'normal.png'), (await win.webContents.capturePage()).toPNG());
    await win.webContents.executeJavaScript(`document.getElementById('deskPin').click()`);
    await espera(1500);
    info.mini = { ligado: mini, porCima: win.isAlwaysOnTop(), janela: win.getBounds() };
    fs.writeFileSync(path.join(dir, 'mini.png'), (await win.webContents.capturePage()).toPNG());
    await win.webContents.executeJavaScript(`document.getElementById('deskPin').click()`);
    await espera(800);
    info.voltou = { ligado: mini, porCima: win.isAlwaysOnTop(), janela: win.getBounds() };
  } catch (e) { info.erro = String(e); }
  fs.writeFileSync(path.join(dir, 'resultado.json'), JSON.stringify(info, null, 2));
  app.quit();
}

/* só uma janela do programa por vez: abrir de novo traz a que já existe */
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    /* o site pode avisar (fim do tempo, água), ficar em tela cheia e copiar o convite; o resto é negado */
    const OK = ['notifications', 'fullscreen', 'clipboard-sanitized-write'];
    session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(OK.includes(perm) && DENTRO.includes(host(wc.getURL()))));
    abrir();
    app.on('activate', () => { if (!win) abrir(); });
    if (process.argv.includes('--teste')) teste();
  });
  app.on('window-all-closed', () => app.quit());
}
