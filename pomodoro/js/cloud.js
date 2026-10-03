/* ---------- conta na nuvem: login, sincronização e ranking (Firebase) ---------- */
import cfg from './firebase-config.js';

const $ = id => document.getElementById(id);
const App = window.PomoApp;
const T = (s, v) => window.I18N ? I18N.t(s, v) : s;
document.addEventListener('langchange', () => { if (window.Cloud && window.Cloud.refresh) window.Cloud.refresh(); });
const dlg = $('acctDlg');
const configured = cfg && cfg.apiKey && !cfg.apiKey.startsWith('COLE') && cfg.projectId;

/* ---------- janela da conta ---------- */
const openAcct = () => { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } };
$('acctBtn').onclick = openAcct;
document.querySelectorAll('[data-open-acct]').forEach(b => b.onclick = openAcct);
$('acctClose').onclick = () => dlg.close();
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

function show(view) {
  ['acctOff', 'acctOut', 'acctIn'].forEach(id => { $(id).hidden = id !== view; });
}
const msg = (id, text, err) => { const el = $(id); el.textContent = text || ''; el.classList.toggle('err', !!err); };

if (!configured) {
  show('acctOff');
  $('rankOut').querySelector('.empty').textContent = 'o ranking fica disponível quando as contas forem ativadas neste site.';
} else {
  start().catch(err => { console.error(err); show('acctOff'); $('acctOffMsg').textContent = 'não foi possível carregar o sistema de contas agora. confira sua internet e recarregue a página.'; });
}

async function start() {
  const V = '10.12.2', base = `https://www.gstatic.com/firebasejs/${V}/`;
  const [{initializeApp}, A, F] = await Promise.all([
    import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')
  ]);
  const app = initializeApp(cfg), auth = A.getAuth(app), db = F.getFirestore(app);
  auth.languageCode = 'pt';
  window.CloudFB = {A, F, auth, db};   // a caixa de sugestões (sugestoes.js) usa a mesma conexão
  document.dispatchEvent(new Event('cloudfb'));

  /* ---------- login do programa do computador (?app-login=CÓDIGO, aberto pelo programa no navegador) ----------
     A pessoa entra com o Google aqui, numa conexão separada (não mexe na conta que já está aberta neste navegador),
     e a página devolve o login para o programa pelo endereço pomodoro-lofi://. O CÓDIGO volta junto: o programa só
     aceita se for o que ele mesmo criou (assim outra página não consegue empurrar uma conta para dentro dele) */
  const appState = new URLSearchParams(location.search).get('app-login');
  if (appState && /^[a-f0-9]{16,64}$/.test(appState)) {
    const box = document.createElement('div'); box.className = 'applogin';
    box.innerHTML = `<div class="applogin-card"><div class="applogin-ic">🍅</div><h2>${T('entrar no programa do computador')}</h2>
      <p id="appLoginMsg">${T('clique no botão para entrar com o Google. depois o login volta sozinho para o programa.')}</p>
      <button class="btn primary" id="appLoginBtn" type="button">${T('entrar com o Google')}</button></div>`;
    document.body.appendChild(box);
    const say = (t, err) => { const el = $('appLoginMsg'); el.textContent = t; el.classList.toggle('err', !!err); };
    $('appLoginBtn').onclick = async () => {
      try {
        const auth2 = A.getAuth(initializeApp(cfg, 'applogin-' + Date.now()));
        const res = await A.signInWithPopup(auth2, new A.GoogleAuthProvider());
        const cred = A.GoogleAuthProvider.credentialFromResult(res);
        await A.signOut(auth2).catch(() => {});
        if (!cred || !cred.idToken) throw new Error('sem credencial');
        $('appLoginBtn').hidden = true;
        say(T('pronto! o navegador vai perguntar se pode abrir o Pomodoro Lo-fi: clique em abrir. depois pode fechar esta aba.'));
        location.href = 'pomodoro-lofi://login?state=' + appState + '&id=' + encodeURIComponent(cred.idToken) + '&at=' + encodeURIComponent(cred.accessToken || '');
      } catch (e) { console.error(e); say(errText(e), true); }
    };
  }

  let user = null, profile = {nick:'', code:'', public:true}, friends = [], consentAt = null, timer = null, busy = false, creating = false;
  let links = [], unsubLinks = null, seenReq = null;

  /* erros do Firebase em português */
  const ERR = {
    'auth/invalid-email':'esse e-mail não parece válido.',
    'auth/email-already-in-use':'já existe uma conta com esse e-mail. tente entrar.',
    'auth/weak-password':'a senha precisa ter pelo menos 6 caracteres.',
    'auth/invalid-credential':'e-mail ou senha incorretos.',
    'auth/wrong-password':'e-mail ou senha incorretos.',
    'auth/user-not-found':'não achei conta com esse e-mail.',
    'auth/missing-password':'digite a senha.',
    'auth/popup-closed-by-user':'a janela do Google foi fechada antes de terminar.',
    'auth/cancelled-popup-request':'a janela do Google foi fechada antes de terminar.',
    'auth/popup-blocked':'o navegador bloqueou a janela do Google. libere pop-ups para este site e tente de novo.',
    'auth/unauthorized-domain':'este endereço ainda não foi autorizado no Firebase (Authentication > Configurações > Domínios autorizados).',
    'auth/operation-not-allowed':'esse jeito de entrar ainda não foi ativado no Firebase.',
    'auth/too-many-requests':'muitas tentativas seguidas. espere uns minutos e tente de novo.',
    'auth/network-request-failed':'sem conexão com a internet.',
    'auth/requires-recent-login':'por segurança, saia e entre de novo na conta antes de excluir.'
  };
  const errText = e => ERR[e && e.code] || 'algo deu errado. tente de novo.';

  /* ---------- entrar / criar conta ---------- */
  const needConsent = () => {
    if ($('consent').checked) return true;
    msg('acctMsg', 'para continuar, marque que você leu e aceita a política de privacidade.', true);
    return false;
  };
  const setMode = c => {
    creating = c;
    $('nickIn').hidden = !c; $('nickIn').required = c;
    $('emailSubmit').textContent = c ? 'criar conta' : 'entrar';
    $('modeSwitch').textContent = c ? 'já tenho conta, quero entrar' : 'não tenho conta, quero criar';
    $('passIn').autocomplete = c ? 'new-password' : 'current-password';
    msg('acctMsg', '');
  };
  $('modeSwitch').onclick = () => setMode(!creating);
  $('googleBtn').onclick = async () => {
    if (!needConsent()) return;
    consentAt = consentAt || Date.now();
    /* no programa do computador o Google não aceita login dentro da janela: o programa abre o navegador de verdade,
       a pessoa entra lá (?app-login) e o login volta para o programa sozinho (pomodoro-app/main.js) */
    if (window.pomoDesk && window.pomoDesk.google) { window.pomoDesk.google(); msg('acctMsg', 'abri o seu navegador: entre com o Google lá e depois volte para cá.'); return; }
    msg('acctMsg', 'abrindo o Google…');
    try { await A.signInWithPopup(auth, new A.GoogleAuthProvider()); } catch (e) { msg('acctMsg', errText(e), true); }
  };
  $('emailForm').onsubmit = async e => {
    e.preventDefault();
    if (!needConsent()) return;
    const email = $('emailIn').value.trim(), pass = $('passIn').value;
    consentAt = consentAt || Date.now();
    msg('acctMsg', creating ? 'criando sua conta…' : 'entrando…');
    try {
      if (creating) {
        const cred = await A.createUserWithEmailAndPassword(auth, email, pass);
        const nick = $('nickIn').value.trim().slice(0, 24);
        if (nick) { profile.nick = nick; await A.updateProfile(cred.user, {displayName:nick}); }
      } else await A.signInWithEmailAndPassword(auth, email, pass);
    } catch (err) { msg('acctMsg', errText(err), true); }
  };
  $('forgotBtn').onclick = async () => {
    const email = $('emailIn').value.trim();
    if (!email) { msg('acctMsg', 'digite seu e-mail no campo acima e clique de novo em "esqueci a senha".', true); return; }
    try { await A.sendPasswordResetEmail(auth, email); msg('acctMsg', 'se existir conta com esse e-mail, chegou um link para criar uma senha nova. olhe também o spam.'); }
    catch (err) { msg('acctMsg', errText(err), true); }
  };

  /* ---------- sincronização ---------- */
  const code = () => { const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += L[Math.floor(Math.random() * L.length)]; return s; };
  const userRef = () => F.doc(db, 'users', user.uid);
  const profRef = uid => F.doc(db, 'profiles', uid || user.uid);
  const status = t => { $('syncStatus').textContent = t; };

  async function push() {
    if (!user || busy) return;
    clearTimeout(timer);
    try {
      await F.setDoc(userRef(), {state:JSON.parse(JSON.stringify(App.get())), updatedAt:Date.now(), clientId, profile, friends, consentAt:consentAt || Date.now()});
      await pushProfile();
      renderRanking();
      status(T('☁ tudo salvo na nuvem · {t}', {t:new Date().toLocaleTimeString(I18N.locale, {hour:'2-digit', minute:'2-digit'})}));
    } catch (e) { console.error(e); status('⚠ não consegui salvar agora. vou tentar de novo.'); timer = setTimeout(push, 15000); }
  }
  /* perfil do ranking. "days" e "lastDay" deixam o ranking certo mesmo quando a pessoa passa dias sem abrir o site;
     "water" serve para os desafios de água; "now" (o que está fazendo agora) só vai se a pessoa ligar na conta.
     Se as regras do Firebase ainda forem antigas, salva só o básico para não travar o resto */
  let oldRules = 0;   // quantas tentativas pular (regras antigas recusam os campos novos)
  async function pushProfile() {
    if (!profile.public) { await F.deleteDoc(profRef()).catch(() => {}); return; }
    const s = App.stats(), now = App.now();
    const base = {nick:profile.nick || 'alguém', code:profile.code, xp:s.xp, level:s.level, levelName:s.levelName, levelIc:s.levelIc, weekPomos:s.weekPomos, streak:s.streak, pet:s.pet, updatedAt:Date.now()};
    const prev = Object.assign({days:s.days, lastDay:s.lastDay, water:s.water}, now ? {now} : {}, base);
    const tries = [Object.assign({petColor:s.petColor, petOutfit:s.petOutfit, plant:s.plant, league:s.league, tasks:s.tasks}, prev), Object.assign({petColor:s.petColor, petOutfit:s.petOutfit, plant:s.plant, league:s.league}, prev), Object.assign({petColor:s.petColor, petOutfit:s.petOutfit, plant:s.plant}, prev), Object.assign({petColor:s.petColor, plant:s.plant}, prev), prev, Object.assign({days:s.days, lastDay:s.lastDay}, base), base];
    for (let i = oldRules; i < tries.length; i++) {
      try { await F.setDoc(profRef(), tries[i]); return; }
      catch (e) { if (!(e && e.code === 'permission-denied') || i === tries.length - 1) throw e; oldRules = i + 1; }
    }
  }
  let nowTimer = null;
  const nowChanged = () => { if (!user) return; renderRanking(); if (!App.shareNow()) return; clearTimeout(nowTimer); nowTimer = setTimeout(() => pushProfile().catch(e => console.error(e)), 1500); };

  /* outro aparelho (ou outra aba) salvou: junta com o que tem aqui, item por item */
  const clientId = Math.random().toString(36).slice(2, 10);
  let unsubMe = null;
  function watchMe() {
    if (unsubMe) unsubMe();
    unsubMe = F.onSnapshot(userRef(), snap => {
      if (!snap.exists() || snap.metadata.hasPendingWrites || busy) return;
      const d = snap.data();
      if (!d.state || d.clientId === clientId) return;
      App.load(App.merge(App.get(), d.state));
    }, err => console.error(err));
  }
  window.Cloud = { nowChanged, nick: () => profile.nick, refresh() { if (user) loadRanking(); }, queue() { if (!user) return; clearTimeout(timer); status('☁ salvando…'); timer = setTimeout(push, 2500); } };
  document.addEventListener('visibilitychange', () => { if (document.hidden && user && timer) push(); });

  A.onAuthStateChanged(auth, async u => {
    user = u;
    if (!u) {
      if (unsubLinks) { unsubLinks(); unsubLinks = null; }
      if (unsubMe) { unsubMe(); unsubMe = null; }
      if (unsubDuels) { unsubDuels(); unsubDuels = null; } duels = []; duelsLoaded = false;
      profUnsubs.forEach(f => f()); profUnsubs = []; profKey = ''; profMap = {};
      links = []; seenReq = null; renderBuddies(null);
      if (unsubRooms) { unsubRooms(); unsubRooms = null; } rooms = []; roomsLoaded = false; renderRooms();
      if (unsubSala) { unsubSala(); unsubSala = null; } sala = null; renderSala();
      $('acctBtn').textContent = '☁ entrar';
      show('acctOut'); setMode(false);
      $('rankOut').hidden = false; $('rankIn').hidden = true;
      return;
    }
    busy = true;
    $('acctBtn').textContent = '☁ sincronizando…';
    try {
      const snap = await F.getDoc(userRef());
      if (snap.exists()) {
        const d = snap.data();
        profile = Object.assign({nick:'', code:'', public:true}, d.profile);
        friends = d.friends || []; consentAt = d.consentAt || consentAt;
        App.load(App.merge(App.get(), d.state));
      }
    } catch (e) { console.error(e); App.toast('<b>⚠ nuvem</b>não consegui buscar seus dados agora.'); }
    if (!profile.code) profile.code = code();
    if (!profile.nick) profile.nick = ((u.displayName || (u.email || '').split('@')[0] || 'alguém').split(' ')[0]).slice(0, 24);
    busy = false;
    await push();
    $('acctBtn').textContent = '👤 ' + profile.nick;
    renderAccount(); show('acctIn');
    $('rankOut').hidden = true; $('rankIn').hidden = false;
    watchLinks();
    watchMe();
    watchDuels();
    watchRooms();
    watchSala();
    migrateOldFriends();
    App.toast(`<b>☁ ${T('oi, {nick}!', {nick:escapeHtml(profile.nick)})}</b>seu progresso agora fica salvo na nuvem.`);
  });

  /* ---------- tela da conta ---------- */
  function renderAccount() {
    $('acctEmail').textContent = user.email || 'conta Google';
    $('nickEdit').value = profile.nick;
    $('publicIn').checked = profile.public;
    $('shareNowIn').checked = $('shareNowRank').checked = App.shareNow();
    $('myCode').textContent = profile.code;
  }
  $('nickEdit').onchange = () => {
    const v = $('nickEdit').value.trim().slice(0, 24);
    if (!v) { $('nickEdit').value = profile.nick; return; }
    profile.nick = v; $('acctBtn').textContent = '👤 ' + v; push().then(loadRanking);
  };
  $('publicIn').onchange = () => { profile.public = $('publicIn').checked; push().then(loadRanking); };
  /* a mesma opção fica na conta e no ranking */
  $('shareNowIn').onchange = $('shareNowRank').onchange = e => {
    const on = e.target.checked;
    $('shareNowIn').checked = $('shareNowRank').checked = on;
    App.shareNow(on); pushProfile().catch(err => console.error(err));
  };
  $('copyCode').onclick = () => {
    const t = profile.code;
    navigator.clipboard.writeText(t).then(() => msg('acctMsg2', 'código copiado! mande para seus amigos.'))
      .catch(() => { const r = document.createRange(); r.selectNodeContents($('myCode')); getSelection().removeAllRanges(); getSelection().addRange(r); msg('acctMsg2', 'selecionei o código: é só copiar (Ctrl+C).'); });
  };
  $('logoutBtn').onclick = async () => { await push(); await A.signOut(auth); msg('acctMsg2', ''); };
  $('exportBtn').onclick = () => {
    const data = {exportadoEm:new Date().toISOString(), conta:{email:user.email, apelido:profile.nick, codigo:profile.code, aparecerNoRanking:profile.public, amigos:friends, consentimentoEm:consentAt ? new Date(consentAt).toISOString() : null}, dados:App.exportData()};
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'meus-dados-pomodoro.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  $('deleteBtn').onclick = async () => {
    if ($('delConfirm').value.trim().toUpperCase() !== 'EXCLUIR') { msg('acctMsg2', 'para confirmar, digite EXCLUIR no campo acima.', true); return; }
    msg('acctMsg2', 'excluindo…');
    const u = user;
    try {
      busy = true; clearTimeout(timer);
      for (const l of links) await F.deleteDoc(F.doc(db, 'friendships', l.id)).catch(() => {});
      for (const d of duels) await F.deleteDoc(F.doc(db, 'challenges', d.id)).catch(() => {});
      for (const r of rooms) await F.deleteDoc(F.doc(db, 'rooms', r.id)).catch(() => {});
      await F.deleteDoc(profRef(u.uid)).catch(() => {});
      await F.deleteDoc(F.doc(db, 'users', u.uid));
      await A.deleteUser(u);
      if ($('delLocal').checked) { try { ['pomodoro-lofi-v2', 'pomodoro-noturno-v1', 'pomodoro-sons', 'pomodoro-look', 'pomodoro-color', 'pomodoro-timer', 'pomodoro-water-next', 'pomodoro-min', 'pomodoro-metro', 'pomodoro-layout', 'pomodoro-lang', 'pomodoro-clima', 'pomodoro-news', 'pomodoro-idea-last'].forEach(k => localStorage.removeItem(k)); } catch (e) {} }
      dlg.close(); alertLater();
    } catch (e) {
      busy = false;
      msg('acctMsg2', errText(e), true);
      if (e.code === 'auth/requires-recent-login') push();
    }
  };
  function alertLater() {
    App.toast('<b>🗑 conta excluída</b>seus dados foram apagados da nuvem.');
    /* recarrega na hora: se esperar, o que ainda está na memória pode ser salvo de novo */
    if ($('delLocal').checked) location.reload();
  }

  /* erro de amizade com o motivo real; "permission-denied" quase sempre é regra do Firebase desatualizada */
  function friendFail(text, err) {
    const code = err && err.code ? String(err.code).replace('firestore/', '') : '';
    if (code === 'permission-denied') msg('rankMsg', 'o Firebase bloqueou as amizades: as regras de segurança novas ainda não foram publicadas.', true);
    else if (code === 'unavailable') msg('rankMsg', 'sem conexão com a internet.', true);
    else msg('rankMsg', T(text) + (code ? ` (${code})` : ''), true);
  }

  /* ---------- amizades (dos dois lados): friendships/{uidA_uidB} com pedido e aceite ---------- */
  const pairId = (a, b) => [a, b].sort().join('_');
  const other = l => l.members.find(m => m !== user.uid);
  const friendIds = () => links.filter(l => l.status === 'accepted').map(other);
  function watchLinks() {
    if (unsubLinks) unsubLinks();
    unsubLinks = F.onSnapshot(F.query(F.collection(db, 'friendships'), F.where('members', 'array-contains', user.uid)), snap => {
      links = snap.docs.map(d => Object.assign({id:d.id}, d.data()));
      const incoming = links.filter(l => l.status === 'pending' && l.from !== user.uid);
      if (seenReq) incoming.filter(l => !seenReq.has(l.id)).forEach(l => App.toast(`<b>💌 pedido de amizade</b>${T('{who} quer entrar no seu ranking.', {who:escapeHtml(l.fromNick || T('alguém'))})}`));
      seenReq = new Set(incoming.map(l => l.id));
      if (friendIds().length) App.flag('friend');
      loadRanking();
    }, err => { console.error(err); friendFail('não consegui carregar as amizades agora.', err); });
  }
  async function migrateOldFriends() {
    if (!friends.length) return;
    for (const uid of friends) { try { await requestFriend(uid); } catch (e) { console.error(e); } }
    friends = []; push();
  }
  async function requestFriend(uid) {
    const id = pairId(user.uid, uid), ref = F.doc(db, 'friendships', id);
    let l = links.find(x => x.id === id);
    if (!l) { const s = await F.getDoc(ref); if (s.exists()) l = Object.assign({id}, s.data()); }
    if (l) {
      if (l.status === 'accepted') return 'already';
      if (l.from !== user.uid) { await F.updateDoc(ref, {status:'accepted'}); return 'accepted'; }
      return 'pending';
    }
    await F.setDoc(ref, {members:[user.uid, uid].sort(), from:user.uid, fromNick:profile.nick || 'alguém', status:'pending', createdAt:Date.now()});
    return 'sent';
  }

  /* ranking ao vivo: escuta os perfis (os amigos veem as mudanças na hora) e recalcula
     "pomodoros da semana" e "sequência" com a data de hoje de quem está olhando */
  let names = {}, profMap = {}, profUnsubs = [], profKey = '';
  function watchProfiles() {
    if (!user) return;
    const ids = [...new Set([user.uid, ...links.map(other)])].sort(), key = ids.join(',');
    if (key === profKey) return renderRanking();
    profKey = key; profUnsubs.forEach(u => u()); profUnsubs = []; profMap = {};
    for (let i = 0; i < ids.length; i += 30) {
      profUnsubs.push(F.onSnapshot(F.query(F.collection(db, 'profiles'), F.where(F.documentId(), 'in', ids.slice(i, i + 30))), snap => {
        snap.docChanges().forEach(ch => { if (ch.type === 'removed') delete profMap[ch.doc.id]; else profMap[ch.doc.id] = Object.assign({id:ch.doc.id}, ch.doc.data()); });
        renderRanking();
      }, e => { console.error(e); friendFail('não consegui carregar o ranking agora.', e); }));
    }
  }
  function fresh(p) {
    const r = Object.assign({}, p);
    const today = App.dayKey(), y = new Date(); y.setDate(y.getDate() - 1); const yest = App.dayKey(y);
    if (p.days) {
      const keys = new Set(); for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); keys.add(App.dayKey(d)); }
      r.weekPomos = Object.entries(p.days).reduce((a, [k, v]) => a + (keys.has(k) ? v : 0), 0);
      /* tarefas da semana: só para mostrar ao lado dos pomodoros (perfil antigo, sem "tasks", não mostra) */
      r.weekTasks = p.tasks ? Object.entries(p.tasks).reduce((a, [k, v]) => a + (keys.has(k) ? v : 0), 0) : null;
    }
    if (p.lastDay !== undefined) r.streak = p.lastDay === today || p.lastDay === yest ? p.streak : 0;
    return r;
  }
  function loadRanking() { watchProfiles(); }
  setInterval(() => { if (user && !document.hidden) renderRanking(); }, 60000);
  function renderRanking() {
    if (!user) return;
    const accepted = friendIds();
    names = {}; Object.values(profMap).forEach(p => { names[p.id] = p.nick; });
    renderRequests();
    const rows = Object.values(profMap).filter(p => accepted.includes(p.id)).map(fresh);
    const me = Object.assign({id:user.uid}, App.stats());
    me.nick = profile.public ? profile.nick : T('{nick} (só você vê)', {nick:profile.nick});
    rows.push(me);
    accepted.filter(id => !rows.find(r => r.id === id)).forEach(id => rows.push({id, nick:'amizade escondida', hidden:true}));
    rows.sort((a, b) => (b.weekPomos || 0) - (a.weekPomos || 0) || (b.xp || 0) - (a.xp || 0));
    const medal = ['🥇', '🥈', '🥉'];
    $('rankList').innerHTML = rows.map((r, i) => {
      const mine = r.id === user.uid, ic = r.hidden ? '' : nowIc(mine ? App.nowMine() : r.now, mine);
      return `
      <li class="${mine ? 'me' : ''}">
        <span class="pos">${medal[i] || (i + 1) + 'º'}</span>
        <span class="rpet">${r.hidden ? '' : `<canvas width="16" height="16" data-rid="${escapeHtml(r.id)}" aria-hidden="true"></canvas>`}${ic ? `<i title="${escapeHtml(ic)}">${ic}</i>` : ''}</span>
        <span class="who"><b data-noi18n>${escapeHtml(r.nick || T('alguém'))}</b><small>${r.hidden ? 'essa pessoa saiu do ranking' : `${T('{ic} nível {n}', {ic:r.levelIc || '🌱', n:r.level || 1})}${r.league != null ? ' · ' + App.leagueIc(r.league) : ''}${r.streak ? ' · 🔥 ' + r.streak : ''}`}</small>${!mine ? nowLine(r.now) : ''}</span>
        <span class="pts">${r.hidden ? '' : `<span title="${escapeHtml(T('pomodoros nos últimos 7 dias'))}">${r.weekPomos || 0} ${App.plantIc(r.plant)}</span>${r.weekTasks != null ? `<span class="ptasks" title="${escapeHtml(T('tarefas concluídas nos últimos 7 dias (só para mostrar, não conta no ranking)'))}">${r.weekTasks} ✅</span>` : ''}`}</span>
        ${!mine ? `<button class="del" type="button" data-rm="${r.id}" aria-label="Desfazer amizade com ${escapeHtml(r.nick || '')}" title="desfazer amizade">×</button>` : '<span></span>'}
      </li>`;
    }).join('');
    $('rankList').querySelectorAll('canvas[data-rid]').forEach(cv => { const r = rows.find(x => x.id === cv.dataset.rid) || {}; App.drawPet(cv, r.pet, r.petColor, r.petOutfit); });
    $('rankList').querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => {
      if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'desfazer?'; b.classList.add('armed'); return; }
      try { await F.deleteDoc(F.doc(db, 'friendships', pairId(user.uid, b.dataset.rm))); msg('rankMsg', 'amizade desfeita.'); }
      catch (e) { console.error(e); friendFail('não consegui desfazer agora.', e); }
    });
    $('rankEmpty').hidden = accepted.length > 0;
    renderDuels();
    renderBuddies(rows.filter(r => r.id !== user.uid && !r.hidden));
    renderRooms();
  }
  /* bichinhos das amizades com o tempo correndo agora, em cima do cronômetro (do lado oposto ao meu) */
  function renderBuddies(friendsRows) {
    const box = $('buddies');
    const on = friendsRows ? friendsRows.filter(r => r.now && r.now.run && r.now.end > Date.now() && Date.now() - r.now.at < 3 * 3600000) : [];
    box.hidden = !on.length;
    const key = (innerWidth < 560) + on.map(r => [r.id, r.pet, r.petColor, JSON.stringify(r.petOutfit || {}), r.now.m, r.now.a].join(':')).join('|');
    if (key === box.dataset.key) return;
    box.dataset.key = key; box.innerHTML = '';
    const max = innerWidth < 560 ? 2 : 4;   // no celular cabe menos (o meu bichinho fica do outro lado)
    on.slice(0, max).forEach(r => {
      const b = document.createElement('div'), focus = r.now.m === 'focus', ic = focus ? App.actIc(r.now.a) : '☕';
      b.className = 'buddy ' + (focus ? 'focus' : 'sleep');
      b.title = `${r.nick || T('alguém')} · ${focus ? App.actLabel(r.now.a) : App.modeLabel(r.now.m)}`;
      b.dataset.noi18n = '';
      b.innerHTML = `<span class="bb">${ic}</span><canvas width="16" height="16" aria-hidden="true"></canvas><small></small>`;
      b.querySelector('small').textContent = r.nick || T('alguém');
      App.drawPet(b.querySelector('canvas'), r.pet, r.petColor, r.petOutfit);
      box.appendChild(b);
    });
    if (on.length > max) { const m = document.createElement('span'); m.className = 'bmore'; m.textContent = '+' + (on.length - max); box.appendChild(m); }
  }
  /* simbolozinho ao lado do bichinho: atividade no foco, ☕ na pausa, ⏸ pausado (o meu só aparece com o tempo correndo) */
  function nowIc(n, mine) {
    if (!n || !n.at || Date.now() - n.at > 3 * 3600000) return '';
    if (n.run) return n.end < Date.now() ? '' : n.m === 'focus' ? App.actIc(n.a) : '☕';
    return mine || Date.now() - n.at > 3600000 ? '' : '⏸';
  }
  /* "agora": o que a amizade está fazendo (só aparece se ela ligou essa opção) */
  function nowLine(n) {
    if (!n || !n.at || Date.now() - n.at > 3 * 3600000) return '';
    let t;
    if (n.run) {
      const left = Math.round((n.end - Date.now()) / 60000);
      if (left < 0) return '';
      t = n.m === 'focus' ? `🟢 ${App.actLabel(n.a)} · ${T('faltam {n} min', {n:Math.max(1, left)})}` : `☕ ${App.modeLabel(n.m)} · ${T('faltam {n} min', {n:Math.max(1, left)})}`;
    } else {
      if (Date.now() - n.at > 3600000) return '';
      t = `⏸ ${T('pausado')} · ${App.actLabel(n.a)}`;
    }
    return `<small class="nowline">${escapeHtml(t)}</small>`;
  }

  /* ---------- desafios entre amizades: challenges/{id} ---------- */
  let duels = [], unsubDuels = null;
  const DAY = 864e5;
  function watchDuels() {
    if (unsubDuels) unsubDuels();
    unsubDuels = F.onSnapshot(F.query(F.collection(db, 'challenges'), F.where('members', 'array-contains', user.uid)), snap => {
      const before = new Set(duels.map(d => d.id)), first = !duelsLoaded; duelsLoaded = true; duelsFail = false;
      duels = snap.docs.map(d => Object.assign({id:d.id}, d.data()));
      duels.filter(d => !first && !before.has(d.id) && d.status === 'pending' && d.from !== user.uid)
        .forEach(d => App.toast(`<b>⚔️ ${T('desafio novo!')}</b>${T('{who} te desafiou.', {who:escapeHtml(d.fromNick || T('alguém'))})}`));
      renderDuels();
    }, err => { console.error(err); duelsFail = true; renderDuels(); });
  }
  let duelsFail = false, duelsLoaded = false;
  const dayKeys = d => { const out = []; for (let i = 0; i < d.days; i++) { const x = new Date(d.startAt); x.setDate(x.getDate() + i); out.push(App.dayKey(x)); } return out; };
  const duelEnd = d => { const x = new Date(d.startAt); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() + d.days); return x.getTime(); };
  /* tipos de desafio. Desde 02/10/2026 (v:2) o placar fica no próprio desafio (score.<uid>) e começa do 0 no aceite:
     antes ele somava o dia inteiro, então quem já tinha bebido 4 copos começava com 4 */
  const DUEL_IC = {pomos:'🍅', water:'💧', min:'⏱️', tasks:'✅'};
  const duelIc = d => d.type === 'custom' ? (d.ic || '⭐') : DUEL_IC[d.type] || '🍅';
  const duelLive = d => d.status === 'active' && d.startAt && Date.now() >= d.startAt && Date.now() < duelEnd(d);
  /* o app avisa o que a pessoa fez (pomodoro, minutos, tarefa, copo) e soma nos desafios que estão valendo */
  function duelAdd(type, n) {
    if (!user || !n) return;
    duels.filter(d => d.v === 2 && d.type === type && duelLive(d)).forEach(d => bump(d, n));
  }
  function bump(d, n) {
    const cur = (d.score || {})[user.uid] || 0;
    if (n < 0 && cur <= 0) return Promise.resolve();
    return F.updateDoc(F.doc(db, 'challenges', d.id), {['score.' + user.uid]: F.increment(n < 0 ? -Math.min(cur, -n) : n)}).catch(e => console.error(e));
  }
  window.Cloud.duelAdd = duelAdd;
  function duelScore(d) {
    if (d.v === 2) {
      const sc = d.score || {};
      return {mine:sc[user.uid] || 0, theirs:sc[other(d)] || 0, final:Date.now() >= duelEnd(d)};
    }
    const keys = dayKeys(d), them = other(d), p = profMap[them] || {}, src = d.type === 'water' ? p.water : p.days;
    const mine = keys.reduce((a, k) => a + (d.type === 'water' ? App.waterOn(k) : App.pomosOn(k)), 0);
    const theirs = src ? keys.reduce((a, k) => a + (src[k] || 0), 0) : null;
    return {mine, theirs, final:!!p.updatedAt && p.updatedAt >= duelEnd(d) || Date.now() > duelEnd(d) + 2 * DAY};
  }
  function renderDuels() {
    if (!user) return;
    const friendsNow = friendIds();
    $('duelBox').hidden = !friendsNow.length;
    if (!friendsNow.length) return;
    const sel = $('duelWho'), keep = sel.value;
    sel.innerHTML = friendsNow.map(id => `<option value="${id}" data-noi18n>${escapeHtml(names[id] || T('alguém'))}</option>`).join('');
    if (friendsNow.includes(keep)) sel.value = keep;
    const ul = $('duelList'); ul.innerHTML = '';
    if (duelsFail) { ul.innerHTML = `<li class="empty">${T('os desafios precisam das regras novas do Firebase.')}</li>`; return; }
    const list = duels.filter(d => !App.duelHidden(d.id)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    list.forEach(d => {
      const them = other(d), who = d.from === user.uid ? (d.toNick || names[them] || T('alguém')) : (d.fromNick || names[them] || T('alguém'));
      const ref = F.doc(db, 'challenges', d.id), li = document.createElement('li'), ic = duelIc(d) + (d.type === 'min' ? ' min' : '');
      li.className = 'duel';
      const title = document.createElement('b'); title.dataset.noi18n = '';
      title.textContent = `${duelIc(d)} ${d.type === 'custom' ? (d.name || '') + ' · ' : ''}${T('você x {who}', {who})} · ${T(d.days > 1 ? '{n} dias' : '{n} dia', {n:d.days})}`;
      const info = document.createElement('small'), btns = document.createElement('span'); btns.className = 'rb';
      const btn = (t, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip ' + cls; b.textContent = t; b.onclick = () => fn().catch(e => { console.error(e); friendFail('não consegui agora. tente de novo.', e); }); btns.appendChild(b); };
      if (d.status === 'pending') {
        if (d.from === user.uid) { info.textContent = T('⏳ esperando {who} aceitar', {who}); btn('cancelar', '', () => F.deleteDoc(ref)); }
        else {
          info.textContent = T('{who} te desafiou! começa quando você aceitar.', {who});
          btn('aceitar', 'ok', () => F.updateDoc(ref, {status:'active', start:App.dayKey(), startAt:Date.now()}));
          btn('recusar', '', () => F.deleteDoc(ref));
        }
      } else {
        const s = duelScore(d), ended = Date.now() >= duelEnd(d), score = `${s.mine} x ${s.theirs == null ? '?' : s.theirs} ${ic}`;
        if (!ended) {
          const left = Math.ceil((duelEnd(d) - Date.now()) / DAY);
          info.textContent = `${score} · ${T(left > 1 ? 'acaba em {n} dias' : 'acaba hoje à meia-noite', {n:left})}`;
          li.classList.add('live');
          /* desafio criado pela pessoa: cada uma marca +1 quando fizer (e −1 se clicar sem querer) */
          if (d.type === 'custom' && duelLive(d)) { btn('−1', '', () => bump(d, -1)); btn('+1 ' + duelIc(d), 'ok', () => bump(d, 1)); }
        } else if (!s.final) info.textContent = `${score} · ${T('esperando {who} abrir o site para fechar o placar', {who})}`;
        else if (s.theirs == null) {
          /* não dá para ver o placar da outra pessoa (saiu do ranking ou desfez a amizade): ninguém ganha */
          info.textContent = T('sem placar: não consegui ver os pontos de {who}', {who});
          li.classList.add('end');
          btn('×', 'del', async () => { App.hideDuel(d.id); renderDuels(); });
        } else {
          const theirs = s.theirs, res = s.mine > theirs ? 'win' : s.mine === theirs ? 'tie' : 'loss';
          if (!App.claimed(d.id)) App.claimDuel(d.id, res);
          info.textContent = `${s.mine} x ${theirs} ${ic} · ${T(res === 'win' ? '🥇 você venceu!' : res === 'tie' ? '🤝 empate' : '{who} venceu', {who})}`;
          li.classList.add('end');
          btn('×', 'del', async () => { App.hideDuel(d.id); renderDuels(); });
          if (Date.now() > duelEnd(d) + 10 * DAY) F.deleteDoc(ref).catch(() => {});
        }
      }
      const txt = document.createElement('span'); txt.className = 'dtx'; txt.append(title, info);
      li.append(txt, btns); ul.appendChild(li);
    });
    if (!list.length) ul.innerHTML = `<li class="empty">${T('nenhum desafio ainda. escolha uma amizade e mande o primeiro!')}</li>`;
  }
  $('duelType').onchange = () => {
    const c = $('duelType').value === 'custom';
    $('duelCustom').hidden = $('duelHelpCustom').hidden = !c;
    if (c) $('duelName').focus();
  };
  $('duelForm').onsubmit = async e => {
    e.preventDefault();
    const them = $('duelWho').value; if (!them) return;
    const type = $('duelType').value, days = +$('duelDays').value;
    const name = type === 'custom' ? $('duelName').value.trim().replace(/\s+/g, ' ').slice(0, 40) : '', ic = $('duelIcon').value;
    if (type === 'custom' && !name) { msg('rankMsg', 'escreva qual é o desafio (ex.: ler 10 páginas).', true); $('duelName').focus(); return; }
    if (duels.filter(d => !App.duelHidden(d.id)).length >= 10) { msg('rankMsg', 'dá para ter até 10 desafios ao mesmo tempo. apague os que já acabaram.', true); return; }
    const same = d => (d.type || 'pomos') === type && (type !== 'custom' || (d.name || '').toLowerCase() === name.toLowerCase());
    if (duels.some(d => other(d) === them && same(d) && Date.now() < (d.startAt ? duelEnd(d) : Infinity))) { msg('rankMsg', 'vocês já têm um desafio desse tipo rolando.', true); return; }
    try {
      const doc = {members:[user.uid, them].sort(), from:user.uid, fromNick:profile.nick || 'alguém', toNick:names[them] || 'alguém', type, days, status:'pending', createdAt:Date.now(), v:2};
      if (type === 'custom') Object.assign(doc, {name, ic});
      await F.addDoc(F.collection(db, 'challenges'), doc);
      $('duelName').value = '';
      App.flag('duel');
      msg('rankMsg', T('desafio enviado para {who}! ⚔️', {who:names[them] || T('alguém')}));
    } catch (err) { console.error(err); friendFail('não consegui mandar o desafio agora.', err); }
  };
  /* ---------- focar junto: rooms/{id} com duas pessoas e o cronômetro em comum ----------
     quem convida cria "pending" com o cronômetro dela; quem aceita passa para "active" e copia esse cronômetro.
     Depois, cada ação (começar, pausar, pular, trocar de modo) grava o cronômetro na sala e a outra pessoa aplica.
     Quando o tempo acaba sozinho, os dois aparelhos trocam juntos; só quem convidou grava, para não brigar. */
  let rooms = [], unsubRooms = null, roomsLoaded = false, lastRev = 0, leaving = false;
  const activeRoom = () => rooms.find(r => r.status === 'active');
  const myPending = () => rooms.find(r => r.status === 'pending' && r.host === user.uid);
  function watchRooms() {
    if (unsubRooms) unsubRooms();
    unsubRooms = F.onSnapshot(F.query(F.collection(db, 'rooms'), F.where('members', 'array-contains', user.uid)), snap => {
      const before = new Set(rooms.map(r => r.id)), wasActive = activeRoom();
      rooms = snap.docs.map(d => Object.assign({id:d.id}, d.data()));
      if (roomsLoaded) rooms.filter(r => !before.has(r.id) && r.status === 'pending' && r.host !== user.uid)
        .forEach(r => App.toast(`<b>👯 ${T('convite para focar junto!')}</b>${T('{who} quer focar junto com você. aceite no ranking.', {who:escapeHtml(r.hostNick || T('alguém'))})}`));
      roomsLoaded = true;
      /* convite esquecido (15 min) ou sala parada há mais de 12 h some sozinha */
      rooms.filter(r => (r.status === 'pending' && Date.now() - r.createdAt > 15 * 60000) || (r.status === 'active' && Date.now() - ((r.timer || {}).rev || r.createdAt) > 12 * 3600000))
        .forEach(r => F.deleteDoc(F.doc(db, 'rooms', r.id)).catch(() => {}));
      const act = activeRoom();
      if (act) {
        const t = act.timer || {};
        if (!wasActive) App.toast(`<b>👯 ${T('focando junto!')}</b>${T('agora o cronômetro de vocês é um só.')}`);
        if (t.rev && t.rev !== lastRev) { lastRev = t.rev; if (t.by !== user.uid) App.applyTimer(t); }
      } else if (wasActive && !leaving) App.toast(`<b>👯 ${T('a sala acabou')}</b>${T('{who} saiu. seu cronômetro continua normal.', {who:escapeHtml(roomPartnerNick(wasActive))})}`);
      leaving = false;
      renderRooms();
    }, err => { console.error(err); roomsFail = true; renderRooms(); });
  }
  let roomsFail = false;
  const roomPartnerNick = r => (r.host === user.uid ? r.guestNick : r.hostNick) || names[other(r)] || T('alguém');
  window.Cloud.inRoom = () => !!(user && activeRoom());
  window.Cloud.roomTimer = (state, natural) => {
    if (!user) return;
    if (sala) {
      /* sala de estudo: quando o tempo acaba sozinho, só quem cuida da sala (host) grava */
      if (natural && sala.host !== user.uid) return;
      const t = Object.assign({}, state, {rev:Date.now(), by:user.uid});
      lastSalaRev = t.rev;
      F.updateDoc(F.doc(db, 'salas', sala.id), {timer:t}).catch(e => console.error(e));
      return;
    }
    const r = activeRoom() || myPending();
    if (!r || (natural && r.host !== user.uid)) return;
    const t = Object.assign({}, state, {rev:Date.now(), by:user.uid});
    lastRev = t.rev;
    F.updateDoc(F.doc(db, 'rooms', r.id), {timer:t}).catch(e => console.error(e));
  };
  async function leaveRoom(r) { leaving = true; await F.deleteDoc(F.doc(db, 'rooms', r.id)); }
  $('roomLeave').onclick = () => {
    if (sala) { leaveSala().catch(e => console.error(e)); return; }
    const r = activeRoom(); if (r) leaveRoom(r).catch(e => { leaving = false; console.error(e); });
  };
  /* barrinha em cima do cronômetro: com quem estou focando (dupla ou sala de estudo) */
  function renderBar() {
    const act = user && activeRoom();
    $('roomBar').hidden = !act && !sala;
    if (act) {
      const them = other(act), p = profMap[them] || {};
      App.drawPet($('roomPet'), p.pet, p.petColor, p.petOutfit);
      $('roomTxt').textContent = T('👯 focando junto com {who}', {who:roomPartnerNick(act)});
    } else if (sala) {
      const them = sala.members.find(id => id !== user.uid), p = (them && (profMap[them] || salaProf[them])) || {};
      App.drawPet($('roomPet'), them ? p.pet : App.get().pet, p.petColor, p.petOutfit);
      $('roomTxt').textContent = T('📚 {name} · {n} na sala', {name:sala.name, n:sala.members.length});
    }
  }
  function renderRooms() {
    const act = user && activeRoom();
    renderBar();
    if (!user) return;
    const friendsNow = friendIds();
    $('roomBox').hidden = !friendsNow.length;
    if (!friendsNow.length) return;
    const sel = $('roomWho'), keep = sel.value;
    sel.innerHTML = friendsNow.map(id => `<option value="${id}" data-noi18n>${escapeHtml(names[id] || T('alguém'))}</option>`).join('');
    if (friendsNow.includes(keep)) sel.value = keep;
    $('roomForm').hidden = !!act;
    const ul = $('roomList'); ul.innerHTML = '';
    if (roomsFail) { ul.innerHTML = `<li class="empty">${T('o focar junto precisa das regras novas do Firebase.')}</li>`; return; }
    rooms.forEach(r => {
      const li = document.createElement('li'); li.className = 'duel' + (r.status === 'active' ? ' live' : '');
      const txt = document.createElement('span'); txt.className = 'dtx'; txt.dataset.noi18n = '';
      const who = roomPartnerNick(r), btns = document.createElement('span'); btns.className = 'rb';
      const ref = F.doc(db, 'rooms', r.id);
      const btn = (t, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip ' + cls; b.textContent = t; b.onclick = () => fn().catch(e => { console.error(e); friendFail('não consegui agora. tente de novo.', e); }); btns.appendChild(b); };
      if (r.status === 'active') { txt.textContent = T('👯 focando junto com {who}', {who}); btn('sair', '', () => leaveRoom(r)); }
      else if (r.host === user.uid) { txt.textContent = T('⏳ esperando {who} aceitar', {who}); btn('cancelar', '', () => F.deleteDoc(ref)); }
      else {
        txt.textContent = T('{who} te chamou para focar junto!', {who});
        btn('aceitar', 'ok', async () => {
          if (activeRoom() || sala) { msg('rankMsg', 'saia da sala atual antes de entrar em outra.', true); return; }
          await F.updateDoc(ref, {status:'active'});
          if (r.timer) { lastRev = r.timer.rev; App.applyTimer(r.timer); }
          /* os outros convites deixam de valer */
          rooms.filter(x => x.id !== r.id && x.status === 'pending').forEach(x => F.deleteDoc(F.doc(db, 'rooms', x.id)).catch(() => {}));
        });
        btn('recusar', '', () => F.deleteDoc(ref));
      }
      li.append(txt, btns); ul.appendChild(li);
    });
  }
  $('roomForm').onsubmit = async e => {
    e.preventDefault();
    const them = $('roomWho').value; if (!them) return;
    if (activeRoom() || sala) { msg('rankMsg', 'você já está focando junto com alguém.', true); return; }
    if (myPending()) { msg('rankMsg', 'você já mandou um convite. espere a resposta ou cancele.', true); return; }
    try {
      await F.addDoc(F.collection(db, 'rooms'), {members:[user.uid, them].sort(), host:user.uid, hostNick:profile.nick || 'alguém', guestNick:names[them] || 'alguém', status:'pending', timer:Object.assign(App.timer(), {rev:Date.now(), by:user.uid}), createdAt:Date.now()});
      msg('rankMsg', T('convite enviado para {who}! 👯', {who:names[them] || T('alguém')}));
    } catch (err) { console.error(err); friendFail('não consegui mandar o convite agora.', err); }
  };

  /* ---------- sala de estudo em grupo: salas/{CÓDIGO}, até 8 pessoas, o cronômetro é um só ----------
     Qualquer pessoa com conta entra com o código (não precisa ser amizade). Cada ação no cronômetro grava "timer"
     e as outras aplicam (igual ao focar junto). "seen" diz quem está com o site aberto (atualiza a cada 90 s).
     Quem sai tira só a si; a última pessoa a sair apaga a sala; se quem criou sair, outra pessoa passa a cuidar dela */
  const SALA_MAX = 8;
  let sala = null, unsubSala = null, lastSalaRev = 0, salaProf = {}, salaLeaving = false;
  window.Cloud.groupSize = () => (user && sala ? sala.members.length : 0);
  function watchSala() {
    if (unsubSala) unsubSala();
    let first = true;
    unsubSala = F.onSnapshot(F.query(F.collection(db, 'salas'), F.where('members', 'array-contains', user.uid)), snap => {
      const was = sala, list = snap.docs.map(d => Object.assign({id:d.id}, d.data()));
      sala = list[0] || null;
      /* sobrou em mais de uma sala (dois aparelhos ao mesmo tempo): sai das outras */
      list.slice(1).forEach(s => leaveSala(s).catch(() => {}));
      if (sala) {
        const seen = sala.seen || {};
        /* sala abandonada (ninguém abre há 12 h): sai sozinha */
        if (first && Object.values(seen).every(t => Date.now() - t > 12 * 3600000)) { leaveSala(sala).catch(() => {}); }
        else if (first) setTimeout(ping, 500);
        if (was && was.id === sala.id) sala.members.filter(id => !was.members.includes(id) && id !== user.uid)
          .forEach(id => App.toast(`<b>📚 ${T('chegou gente!')}</b>${T('{who} entrou na sala.', {who:escapeHtml((sala.nicks || {})[id] || T('alguém'))})}`));
        const t = sala.timer || {};
        if (t.rev && t.rev !== lastSalaRev) { lastSalaRev = t.rev; if (t.by !== user.uid && t.rev > Date.now() - 12 * 3600000) App.applyTimer(t); }
        loadSalaProfiles();
      } else if (was && !salaLeaving) App.toast(`<b>📚 ${T('a sala acabou')}</b>${T('seu cronômetro continua normal.')}`);
      salaLeaving = false; first = false;
      renderSala(); renderBar();
    }, err => { console.error(err); salaFail = true; renderSala(); });
  }
  let salaFail = false;
  async function loadSalaProfiles() {
    const miss = sala.members.filter(id => id !== user.uid && !profMap[id] && !salaProf[id]);
    for (const id of miss) {
      salaProf[id] = {};
      try { const s = await F.getDoc(profRef(id)); if (s.exists()) salaProf[id] = s.data(); } catch (e) {}
    }
    if (miss.length) { renderSala(); renderBar(); }
  }
  function ping() {
    if (!user || !sala || document.hidden) return;
    F.updateDoc(F.doc(db, 'salas', sala.id), {['seen.' + user.uid]:Date.now()}).catch(() => {});
  }
  setInterval(ping, 90000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) ping(); });
  async function leaveSala(s = sala) {
    if (!s) return;
    if (s === sala) salaLeaving = true;
    const ref = F.doc(db, 'salas', s.id), rest = s.members.filter(id => id !== user.uid);
    if (!rest.length) { await F.deleteDoc(ref); return; }
    const upd = {members:F.arrayRemove(user.uid), ['nicks.' + user.uid]:F.deleteField(), ['seen.' + user.uid]:F.deleteField()};
    if (s.host === user.uid) {
      /* quem cuida da sala passa a ser quem abriu o site por último */
      const seen = s.seen || {};
      upd.host = rest.slice().sort((a, b) => (seen[b] || 0) - (seen[a] || 0))[0];
    }
    await F.updateDoc(ref, upd);
  }
  const salaLink = id => location.origin + location.pathname + '?sala=' + id;
  function renderSala() {
    if (!$('salaBox')) return;
    $('salaBox').hidden = !user;
    if (!user) return;
    $('salaOut').hidden = !!sala; $('salaIn').hidden = !sala;
    if (salaFail) { $('salaMsg').textContent = T('a sala de estudo precisa das regras novas do Firebase.'); $('salaMsg').classList.add('err'); }
    if (!sala) return;
    $('salaTitle').textContent = '📚 ' + sala.name;
    $('salaCopy').textContent = T('código {c} · copiar convite', {c:sala.id});
    const ul = $('salaMembers'); ul.innerHTML = '';
    const seen = sala.seen || {};
    sala.members.slice().sort((a, b) => (a === user.uid ? -1 : b === user.uid ? 1 : (seen[b] || 0) - (seen[a] || 0))).forEach(id => {
      const mine = id === user.uid, p = mine ? Object.assign({}, App.stats()) : (profMap[id] || salaProf[id] || {});
      const on = mine || Date.now() - (seen[id] || 0) < 4 * 60000;
      const li = document.createElement('li'); li.className = 'smember' + (on ? ' on' : '');
      const cv = document.createElement('canvas'); cv.width = cv.height = 16; cv.setAttribute('aria-hidden', 'true');
      const nm = document.createElement('b'); nm.dataset.noi18n = '';
      nm.textContent = (mine ? profile.nick : (sala.nicks || {})[id] || p.nick || T('alguém')) + (id === sala.host ? ' 👑' : '');
      const st = document.createElement('small');
      st.textContent = on ? T('🟢 aqui agora') : T('💤 saiu um pouquinho');
      const tx = document.createElement('span'); tx.className = 'dtx'; tx.append(nm, st);
      li.append(cv, tx); ul.appendChild(li);
      App.drawPet(cv, p.pet, p.petColor, p.petOutfit);
    });
  }
  $('salaNew').onsubmit = async e => {
    e.preventDefault();
    if (sala) return;
    if (activeRoom()) { msg('salaMsg', 'saia do focar junto antes de abrir uma sala.', true); return; }
    const name = $('salaName').value.trim().replace(/\s+/g, ' ').slice(0, 30) || T('sala de estudo');
    try {
      let id = '';
      for (let i = 0; i < 5 && !id; i++) { const c = code(); if (!(await F.getDoc(F.doc(db, 'salas', c))).exists()) id = c; }
      if (!id) throw new Error('sem código');
      const now = Date.now();
      await F.setDoc(F.doc(db, 'salas', id), {code:id, name, host:user.uid, members:[user.uid], nicks:{[user.uid]:profile.nick || 'alguém'}, seen:{[user.uid]:now}, timer:Object.assign(App.timer(), {rev:now, by:user.uid}), createdAt:now});
      lastSalaRev = now; $('salaName').value = '';
      msg('salaMsg', T('sala criada! mande o código {c} para quem vai estudar com você.', {c:id}));
    } catch (err) { console.error(err); msg('salaMsg', 'não consegui criar a sala agora. tente de novo.', true); }
  };
  $('salaJoin').onsubmit = async e => {
    e.preventDefault();
    if (sala) return;
    const id = $('salaCode').value.trim().toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(id)) { msg('salaMsg', 'o código da sala tem 6 letras e números.', true); return; }
    if (activeRoom()) { msg('salaMsg', 'saia do focar junto antes de entrar numa sala.', true); return; }
    try {
      const snap = await F.getDoc(F.doc(db, 'salas', id));
      if (!snap.exists()) { msg('salaMsg', 'não achei sala com esse código. confira com quem te mandou.', true); return; }
      const s = snap.data();
      if ((s.members || []).length >= SALA_MAX) { msg('salaMsg', T('essa sala já está cheia ({n} pessoas).', {n:SALA_MAX}), true); return; }
      await F.updateDoc(F.doc(db, 'salas', id), {members:F.arrayUnion(user.uid), ['nicks.' + user.uid]:profile.nick || 'alguém', ['seen.' + user.uid]:Date.now()});
      if (s.timer && s.timer.rev) { lastSalaRev = s.timer.rev; App.applyTimer(s.timer); }
      $('salaCode').value = '';
      msg('salaMsg', T('você entrou na sala {name}! 📚', {name:s.name || ''}));
      if (history.replaceState && location.search.includes('sala=')) history.replaceState(null, '', location.pathname);
    } catch (err) { console.error(err); msg('salaMsg', 'não consegui entrar agora. tente de novo.', true); }
  };
  $('salaLeave').onclick = () => leaveSala().catch(e => { salaLeaving = false; console.error(e); });
  $('salaCopy').onclick = async () => {
    if (!sala) return;
    const txt = T('vem estudar comigo no Pomodoro Lo-fi! sala "{name}", código {c}: {link}', {name:sala.name, c:sala.id, link:salaLink(sala.id)});
    try { await navigator.clipboard.writeText(txt); msg('salaMsg', 'convite copiado! é só colar no WhatsApp ou onde quiser.'); }
    catch (e) { msg('salaMsg', txt); }
  };
  /* link de convite (?sala=CÓDIGO): já deixa o código preenchido */
  const fromLink = new URLSearchParams(location.search).get('sala');
  if (fromLink && /^[A-Za-z2-9]{6}$/.test(fromLink)) {
    $('salaCode').value = fromLink.toUpperCase();
    App.toast(`<b>📚 ${T('convite para uma sala de estudo!')}</b>${T('o código já está no ranking: com a conta aberta, é só clicar em "entrar na sala".')}`);
  }

  function renderRequests() {
    const pend = links.filter(l => l.status === 'pending');
    $('reqBox').hidden = !pend.length;
    $('reqList').innerHTML = '';
    pend.forEach(l => {
      const incoming = l.from !== user.uid, li = document.createElement('li');
      const who = incoming ? (l.fromNick || names[l.from] || 'alguém') : (names[other(l)] || 'alguém');
      li.innerHTML = `<span class="rq"></span><span class="rb"></span>`;
      li.querySelector('.rq').dataset.noi18n = '';
      li.querySelector('.rq').textContent = incoming ? T('💌 {who} quer ser sua amizade no ranking', {who}) : T('⏳ esperando {who} aceitar', {who});
      const ref = F.doc(db, 'friendships', l.id);
      const btn = (t, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip ' + cls; b.textContent = t; b.onclick = () => fn().catch(e => { console.error(e); friendFail('não consegui agora. tente de novo.', e); }); li.querySelector('.rb').appendChild(b); };
      if (incoming) {
        btn('aceitar', 'ok', async () => { await F.updateDoc(ref, {status:'accepted'}); msg('rankMsg', T('pronto! você e {who} agora estão no mesmo ranking 🎉', {who})); });
        btn('recusar', '', () => F.deleteDoc(ref));
      } else btn('cancelar', '', () => F.deleteDoc(ref));
      $('reqList').appendChild(li);
    });
  }
  $('friendForm').onsubmit = async e => {
    e.preventDefault();
    const c = $('friendCode').value.trim().toUpperCase();
    if (c.length !== 6) { msg('rankMsg', 'o código tem 6 letras e números.', true); return; }
    if (c === profile.code) { msg('rankMsg', 'esse é o seu próprio código 😄', true); return; }
    if (links.length >= 60) { msg('rankMsg', 'você chegou ao limite de 60 amizades e pedidos.', true); return; }
    try {
      const snap = await F.getDocs(F.query(F.collection(db, 'profiles'), F.where('code', '==', c), F.limit(1)));
      if (snap.empty) { msg('rankMsg', 'não achei ninguém com esse código. confira se a pessoa deixou "aparecer no ranking" ligado.', true); return; }
      const uid = snap.docs[0].id, nick = snap.docs[0].data().nick;
      const r = await requestFriend(uid);
      $('friendCode').value = '';
      msg('rankMsg', T({sent:'pedido enviado para {nick}! quando a pessoa aceitar, vocês ficam no mesmo ranking.', accepted:'{nick} já tinha te mandado um pedido. agora vocês estão no mesmo ranking! 🎉', already:'{nick} já está no seu ranking.', pending:'você já mandou um pedido para {nick}. é só esperar.'}[r], {nick}));
    } catch (err) { console.error(err); friendFail('não consegui mandar o pedido agora. tente de novo.', err); }
  };
  $('rankRefresh').onclick = loadRanking;
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c])); }
