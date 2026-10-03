/* Pomodoro Lo-fi para computador: uma janela própria que abre o site (https://pomodoro-lofi.web.app).
   Como abre o site de verdade, toda atualização publicada chega sozinha, sem gerar outro instalador.
   Sem internet, o próprio site abre a cópia guardada (sw.js); só na primeira vez sem internet aparece o offline.html */
const { app, BrowserWindow, shell, session, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const SITE = 'https://pomodoro-lofi.web.app/';
const DENTRO = ['pomodoro-lofi.web.app', 'pomodoro-lofi.firebaseapp.com'];          // abre dentro do programa
const LOGIN = ['accounts.google.com', 'pomodoro-lofi.firebaseapp.com'];               // janelinha do "Entrar com Google"
const host = u => { try { return new URL(u).hostname; } catch (e) { return ''; } };
const TESTE = process.argv.includes('--teste');

/* o Google recusa login em "navegador embutido": sem o nome do Electron ele trata como Chrome */
app.userAgentFallback = app.userAgentFallback.replace(/\s(?:Electron|pomodoro-lofi)\/\S+/gi, '');
app.setAppUserModelId('app.pomodorolofi.desktop');   // nome certo nos avisos do Windows

let win = null;
function abrir() {
  win = new BrowserWindow({
    width: 1240, height: 860, minWidth: 380, minHeight: 560,
    backgroundColor: '#15131F', autoHideMenuBar: true, title: 'Pomodoro Lo-fi',
    /* sem a barra de título (pedido dela): ficam só os botões de minimizar/maximizar/fechar por cima do site;
       a janela é arrastada pela faixa invisível do topo (#deskDrag, no preload.js) */
    titleBarStyle: 'hidden', titleBarOverlay: { color: '#00000000', symbolColor: '#D9903A', height: 32 },
    icon: path.join(__dirname, 'icon.png'),
    /* backgroundThrottling desligado: o cronômetro e o bichinho continuam andando com a janela minimizada */
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false, preload: path.join(__dirname, 'preload.js') }
  });
  win.loadURL(SITE);
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
  win.on('closed', () => { win = null; if (pet) pet.close(); });
}

/* ---------- 📌 fixar na tela: só o bichinho com o tempo, flutuando no canto, por cima das outras janelas ----------
   O botão "📌 fixar na tela" vem do preload.js. Ao fixar, abre uma janelinha transparente (pet.html) e a janela
   grande é minimizada. O preload da janela grande manda o desenho do bichinho e o tempo a cada meio segundo.
   Na janelinha: arrastar pelo bichinho, ⏯ começa/pausa, ⤢ volta para a janela grande. O lugar dela fica guardado */
let pet = null;
const LUGAR = () => path.join(app.getPath('userData'), 'bichinho.json');
function lugarGuardado(w, h) {
  try {
    const p = JSON.parse(fs.readFileSync(LUGAR(), 'utf8'));
    /* só vale se ainda cair dentro de alguma tela (a pessoa pode ter tirado um monitor) */
    const a = screen.getDisplayMatching({ x: p.x, y: p.y, width: w, height: h }).workArea;
    if (p.x >= a.x - 20 && p.y >= a.y - 20 && p.x + w <= a.x + a.width + 20 && p.y + h <= a.y + a.height + 20) return p;
  } catch (e) {}
  return null;
}
function fixar(on) {
  if (!win || on === !!pet) return;
  if (on) {
    const w = 150, h = 196, a = screen.getDisplayMatching(win.getBounds()).workArea;
    const p = lugarGuardado(w, h) || { x: a.x + a.width - w - 24, y: a.y + a.height - h - 24 };
    pet = new BrowserWindow({
      x: p.x, y: p.y, width: w, height: h, frame: false, transparent: true, resizable: false, maximizable: false, minimizable: false,
      fullscreenable: false, alwaysOnTop: true, skipTaskbar: true, hasShadow: false, show: false, title: 'Pomodoro Lo-fi',
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false, preload: path.join(__dirname, 'pet-preload.js') }
    });
    pet.setAlwaysOnTop(true, 'screen-saver');
    pet.loadFile(path.join(__dirname, 'pet.html'));
    /* quando a janelinha termina de abrir, pede o desenho de novo (o primeiro envio pode ter chegado cedo demais) */
    pet.webContents.once('did-finish-load', () => { if (win) win.webContents.send('mini-state', true); });
    pet.once('ready-to-show', () => { if (pet) { pet.showInactive(); if (win && !TESTE) win.minimize(); } });
    pet.on('moved', () => { try { const [x, y] = pet.getPosition(); fs.writeFileSync(LUGAR(), JSON.stringify({ x, y })); } catch (e) {} });
    pet.on('closed', () => { pet = null; if (win) win.webContents.send('mini-state', false); });
  } else {
    pet.close();
    if (win.isMinimized()) win.restore();
    win.show(); win.focus();
  }
  win.webContents.send('mini-state', on);
}
const daJanela = e => win && e.sender === win.webContents, doBichinho = e => pet && e.sender === pet.webContents;
ipcMain.on('mini', (e, on) => { if (daJanela(e)) fixar(!!on); });
ipcMain.on('mini-ask', e => e.sender.send('mini-state', !!pet));
ipcMain.on('pet-data', (e, d) => { if (daJanela(e) && pet) pet.webContents.send('pet-data', d); });
ipcMain.on('pet-toggle', e => { if (doBichinho(e) && win) win.webContents.send('do-toggle'); });
ipcMain.on('pet-back', e => { if (doBichinho(e)) fixar(false); });

/* ---------- entrar com o Google pelo navegador de verdade ----------
   O Google recusa login dentro de janela de programa ("este navegador ou app pode não ser seguro"). Então:
   1. o site (cloud.js) chama pomoDesk.google() → aqui cria um código e abre o navegador em ?app-login=CÓDIGO;
   2. a pessoa entra com o Google lá; a página chama pomodoro-lofi://login?state=CÓDIGO&id=...;
   3. o Windows entrega esse endereço ao programa (second-instance); se o código bater, o site daqui entra com a credencial.
   O código vale uma vez e por 10 minutos */
const ESQUEMA = 'pomodoro-lofi';
let loginState = null, loginAte = 0;
ipcMain.on('google-login', e => {
  if (!daJanela(e)) return;
  loginState = require('crypto').randomBytes(16).toString('hex'); loginAte = Date.now() + 10 * 60000;
  shell.openExternal(SITE + '?app-login=' + loginState);
});
function linkDoNavegador(endereco) {
  let u; try { u = new URL(endereco); } catch (e) { return; }
  if (u.protocol !== ESQUEMA + ':' || !win) return;
  const id = u.searchParams.get('id'), at = u.searchParams.get('at') || '', st = u.searchParams.get('state');
  if (!id || !loginState || st !== loginState || Date.now() > loginAte) return;
  loginState = null;
  if (win.isMinimized()) win.restore();
  win.show(); win.focus();
  win.webContents.executeJavaScript(`(async () => {
    const fb = window.CloudFB; if (!fb) return 'sem conta';
    await fb.A.signInWithCredential(fb.auth, fb.A.GoogleAuthProvider.credential(${JSON.stringify(id)}, ${JSON.stringify(at)} || null));
    return 'ok';
  })()`).catch(() => {});
}

/* teste rápido (npx electron . --teste): abre, tira uma foto da janela e outra do bichinho fixado em teste/, e fecha */
async function teste() {
  const dir = path.join(__dirname, 'teste'), espera = ms => new Promise(r => setTimeout(r, ms));
  fs.mkdirSync(dir, { recursive: true });
  const info = {};
  try {
    await new Promise(r => win.webContents.once('did-finish-load', r));
    await espera(3500);
    await win.webContents.executeJavaScript(`(() => { const d = document.getElementById('newsDlg'); if (d && d.open) d.close(); })()`);
    await espera(400);
    info.url = win.webContents.getURL();
    info.botao = await win.webContents.executeJavaScript(`!!document.getElementById('deskPin')`);
    fs.writeFileSync(path.join(dir, 'normal.png'), (await win.webContents.capturePage()).toPNG());
    await win.webContents.executeJavaScript(`document.getElementById('deskPin').click()`);
    await espera(2500);
    info.fixado = { ligado: !!pet, porCima: pet && pet.isAlwaysOnTop(), janela: pet && pet.getBounds() };
    info.bichinho = pet && await pet.webContents.executeJavaScript(`({tempo:document.getElementById('time').textContent, temDesenho:document.getElementById('pet').src.length > 100, modo:document.body.dataset.mode})`);
    if (pet) fs.writeFileSync(path.join(dir, 'mini.png'), (await pet.webContents.capturePage()).toPNG());
    /* com a janela grande minimizada, o tempo do bichinho tem que continuar andando */
    win.minimize(); await espera(600);
    const ler = () => pet.webContents.executeJavaScript(`document.getElementById('time').textContent`);
    let a = await ler(); await espera(3000); let b = await ler();
    if (a === b) { await pet.webContents.executeJavaScript(`document.getElementById('tg').click()`); await espera(1000); a = await ler(); await espera(3000); b = await ler(); }
    info.minimizada = win.isMinimized();
    info.tempoAndando = { antes: a, tresSegundosDepois: b };
    await pet.webContents.executeJavaScript(`document.getElementById('tg').click()`);   // deixa pausado para o próximo teste
    if (pet) await pet.webContents.executeJavaScript(`document.getElementById('bk').click()`);
    await espera(800);
    info.voltou = { ligado: !!pet, janelaVisivel: win.isVisible() && !win.isMinimized() };
  } catch (e) { info.erro = String(e); }
  fs.writeFileSync(path.join(dir, 'resultado.json'), JSON.stringify(info, null, 2));
  app.quit();
}

/* o teste usa uma pasta de dados separada, para rodar mesmo com o programa de verdade aberto */
if (TESTE) app.setPath('userData', path.join(app.getPath('temp'), 'pomodoro-lofi-teste'));
/* só uma janela do programa por vez: abrir de novo traz a que já existe */
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', (e, argv) => {
    const link = argv.find(a => a.startsWith(ESQUEMA + '://'));
    if (link) { linkDoNavegador(link); return; }
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  app.whenReady().then(() => {
    /* avisa o Windows que endereços pomodoro-lofi:// abrem este programa (é assim que o login volta do navegador) */
    if (!TESTE) {
      if (app.isPackaged) app.setAsDefaultProtocolClient(ESQUEMA);
      else app.setAsDefaultProtocolClient(ESQUEMA, process.execPath, [path.resolve(process.argv[1])]);
    }
    /* o site pode avisar (fim do tempo, água), ficar em tela cheia e copiar o convite; o resto é negado */
    const OK = ['notifications', 'fullscreen', 'clipboard-sanitized-write'];
    session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(OK.includes(perm) && DENTRO.includes(host(wc.getURL()))));
    abrir();
    app.on('activate', () => { if (!win) abrir(); });
    if (TESTE) teste();
    /* atualização automática do PROGRAMA (o site já se atualiza sozinho): olha a última versão em Releases do GitHub,
       baixa em silêncio e instala quando a pessoa fechar o programa. Só vale no programa instalado */
    if (app.isPackaged) {
      try {
        const { autoUpdater } = require('electron-updater');
        autoUpdater.autoDownload = true; autoUpdater.autoInstallOnAppQuit = true;
        autoUpdater.on('error', () => {});
        autoUpdater.checkForUpdates().catch(() => {});
        setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 6 * 3600000);
      } catch (e) {}
    }
  });
  app.on('window-all-closed', () => app.quit());
}
