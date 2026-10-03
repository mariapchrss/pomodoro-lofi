/* ---------- caixa de sugestões ----------
   Qualquer pessoa manda (com ou sem conta). Cada sugestão vai para o Firebase (coleção "suggestions")
   e, se tiver a chave do Web3Forms em sugestoes-config.js, também para o e-mail da dona.
   Quem entra com um e-mail da lista "admins" vê a aba "recebidas", ao vivo. */
import cfg from './sugestoes-config.js';

const $ = id => document.getElementById(id);
const App = window.PomoApp;
const T = (s, v) => window.I18N ? I18N.t(s, v) : s;
const dlg = $('ideaDlg');
const KINDS = {ideia:'💡 ideia', problema:'🐞 problema', elogio:'💖 elogio', outro:'💬 outro'};
const WAIT = 2 * 60000, LAST = 'pomodoro-idea-last';

/* ---------- janela ---------- */
const open = () => { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } };
$('ideaBtn').onclick = open;
document.querySelectorAll('[data-open-idea]').forEach(b => b.onclick = open);
$('ideaClose').onclick = () => dlg.close();
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
const msg = (text, err) => { const el = $('ideaMsg'); el.textContent = text || ''; el.classList.toggle('err', !!err); };
const count = () => { $('ideaCount').textContent = `${$('ideaText').value.length}/1000`; };
$('ideaText').oninput = count; count();

function tab(which) {
  $('ideaTabSend').setAttribute('aria-selected', which === 'send');
  $('ideaTabInbox').setAttribute('aria-selected', which === 'inbox');
  $('ideaSend').hidden = which !== 'send';
  $('ideaInbox').hidden = which !== 'inbox';
}
$('ideaTabSend').onclick = () => tab('send');
$('ideaTabInbox').onclick = () => tab('inbox');

/* ---------- Firebase (vem pronto do cloud.js; se não carregar, manda só por e-mail) ---------- */
const fbReady = new Promise(res => {
  if (window.CloudFB) return res(window.CloudFB);
  document.addEventListener('cloudfb', () => res(window.CloudFB), {once:true});
});
const withTimeout = (p, ms) => Promise.race([p, new Promise(res => setTimeout(() => res(null), ms))]);
let user = null;

/* ---------- enviar ---------- */
const lastSent = () => { try { return +localStorage.getItem(LAST) || 0; } catch (e) { return 0; } };
$('ideaForm').onsubmit = async e => {
  e.preventDefault();
  const text = $('ideaText').value.trim(), kind = $('ideaKind').value, contact = $('ideaContact').value.trim().slice(0, 100);
  if ($('ideaHp').value) { done(); return; }   // campo escondido: só robô preenche
  if (text.length < 3) { msg('escreva um pouquinho mais 🙂', true); return; }
  const left = lastSent() + WAIT - Date.now();
  if (left > 0) { msg(T('espere {n} s para mandar outra.', {n:Math.ceil(left / 1000)}), true); return; }
  const btn = $('ideaSubmit'); btn.disabled = true; msg('enviando…');
  const nick = user ? (window.Cloud && window.Cloud.nick ? window.Cloud.nick() : '') || (user.displayName || '').split(' ')[0] || '' : '';
  const data = {text:text.slice(0, 1000), kind, contact, nick:nick.slice(0, 30), uid:user ? user.uid : '', lang:window.I18N ? I18N.lang : 'pt', createdAt:Date.now(), read:false};
  const [saved, mailed] = await Promise.all([saveFirebase(data), sendEmail(data)]);
  btn.disabled = false;
  if (saved || mailed) done();
  else msg('não consegui enviar agora. confira sua internet e tente de novo.', true);
};
async function saveFirebase(data) {
  const fb = await withTimeout(fbReady, 8000);
  if (!fb) return false;
  try { await fb.F.addDoc(fb.F.collection(fb.db, 'suggestions'), data); return true; }
  catch (e) { console.error(e); return false; }
}
async function sendEmail(data) {
  if (!cfg.emailKey) return false;
  const body = {
    access_key:cfg.emailKey, subject:`🍅 Pomodoro · ${KINDS[data.kind] || data.kind}`, from_name:'Pomodoro Lo-fi',
    message:data.text, tipo:KINDS[data.kind] || data.kind, apelido:data.nick || '(sem conta)', contato:data.contact || '(não deixou)', idioma:data.lang
  };
  if (/^\S+@\S+\.\S+$/.test(data.contact)) body.replyto = data.contact;
  try {
    const r = await fetch('https://api.web3forms.com/submit', {method:'POST', headers:{'Content-Type':'application/json', Accept:'application/json'}, body:JSON.stringify(body)});
    const j = await r.json().catch(() => ({}));
    return r.ok && j.success !== false;
  } catch (e) { console.error(e); return false; }
}
function done() {
  try { localStorage.setItem(LAST, Date.now()); } catch (e) {}
  $('ideaText').value = ''; $('ideaContact').value = ''; count();
  msg('');
  dlg.close();
  App.toast('<b>💌 sugestão enviada!</b>obrigada por ajudar o pomodoro a ficar melhor.');
}

/* ---------- caixa de entrada (só para quem está em "admins") ---------- */
let unsub = null, items = [];
fbReady.then(fb => fb.A.onAuthStateChanged(fb.auth, u => {
  user = u;
  const admin = !!(u && u.email && u.emailVerified && cfg.admins.includes(u.email.toLowerCase()));
  $('ideaTabs').hidden = !admin;
  if (unsub) { unsub(); unsub = null; }
  if (!admin) { items = []; badge(); tab('send'); return; }
  const F = fb.F;
  unsub = F.onSnapshot(F.query(F.collection(fb.db, 'suggestions'), F.orderBy('createdAt', 'desc'), F.limit(300)), snap => {
    items = snap.docs.map(d => Object.assign({id:d.id, ref:d.ref}, d.data()));
    render(); badge();
  }, err => { console.error(err); $('ideaList').innerHTML = `<li class="empty">${T('não consegui abrir as sugestões. as regras novas do Firebase já foram publicadas?')}</li>`; });
}));
function badge() {
  const n = items.filter(i => !i.read).length;
  $('ideaBadge').hidden = !n; $('ideaBadge').textContent = n || '';
  $('ideaInboxN').textContent = n ? ` (${n})` : '';
}
let filter = 'new';
document.querySelectorAll('[data-ideafilter]').forEach(b => b.onclick = () => {
  filter = b.dataset.ideafilter;
  document.querySelectorAll('[data-ideafilter]').forEach(x => x.setAttribute('aria-pressed', x === b));
  render();
});
function render() {
  const fb = window.CloudFB, ul = $('ideaList'); ul.innerHTML = '';
  const list = items.filter(i => filter === 'all' || !i.read);
  if (!list.length) { ul.innerHTML = `<li class="empty">${T(filter === 'all' ? 'nenhuma sugestão ainda.' : 'nada novo por aqui ✨')}</li>`; return; }
  list.forEach(i => {
    const li = document.createElement('li'); li.className = 'idea' + (i.read ? ' read' : '');
    const head = document.createElement('div'); head.className = 'ihead';
    const k = document.createElement('b'); k.textContent = T(KINDS[i.kind] || KINDS.outro);
    const meta = document.createElement('small'); meta.dataset.noi18n = '';
    meta.textContent = [new Date(i.createdAt).toLocaleString(I18N.locale, {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}), i.nick || T('sem conta'), (i.lang || 'pt').toUpperCase()].join(' · ');
    head.append(k, meta);
    const p = document.createElement('p'); p.dataset.noi18n = ''; p.textContent = i.text;
    li.append(head, p);
    if (i.contact) { const c = document.createElement('small'); c.className = 'icontact'; c.dataset.noi18n = ''; c.textContent = '✉ ' + i.contact; li.appendChild(c); }
    const btns = document.createElement('span'); btns.className = 'rb';
    const btn = (t, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip ' + cls; b.textContent = t; b.onclick = () => fn(b).catch(e => { console.error(e); App.toast('<b>⚠</b>não consegui agora. tente de novo.'); }); btns.appendChild(b); };
    btn(i.read ? '↩ marcar como nova' : '✓ lida', 'ok', () => fb.F.updateDoc(i.ref, {read:!i.read}));
    btn('apagar', '', async b => {
      if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = T('apagar?'); b.classList.add('armed'); return; }
      await fb.F.deleteDoc(i.ref);
    });
    li.appendChild(btns);
    ul.appendChild(li);
  });
}
