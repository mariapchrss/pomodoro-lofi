/* ---------- mudança de endereço (Netlify → Firebase Hosting, outubro/2026) ----------
   No endereço antigo aparece um aviso fixo com "ir para o endereço novo" e "levar meus dados" (baixa um arquivo).
   Em qualquer endereço, ⚙ > "carregar meus dados de um arquivo" junta esse arquivo com o que já existe aqui. */
(() => {
  const $ = id => document.getElementById(id);
  const T = (s, v) => window.I18N ? I18N.t(s, v) : s;
  const NOVO = 'https://pomodoro-lofi.web.app';
  const STATE = 'pomodoro-lofi-v2';
  /* o progresso e as preferências (o cronômetro e os avisos ficam de fora) */
  const KEYS = [STATE, 'pomodoro-sons', 'pomodoro-look', 'pomodoro-color', 'pomodoro-min', 'pomodoro-metro', 'pomodoro-lang', 'pomodoro-clima'];

  function exportar() {
    const keys = {};
    KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v != null) keys[k] = v; } catch (e) {} });
    const data = {app:'pomodoro-lofi', exportadoEm:new Date().toISOString(), keys};
    const url = URL.createObjectURL(new Blob([JSON.stringify(data)], {type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'meu-pomodoro.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /* aviso no endereço antigo */
  if (/netlify\.app$/.test(location.hostname)) {
    const bar = document.createElement('div');
    bar.className = 'movebar'; bar.setAttribute('role', 'status');
    bar.innerHTML = `<span>🏡 <b>o pomodoro mudou de casa!</b> <span>agora ele fica em</span> <a href="${NOVO}" data-noi18n>pomodoro-lofi.web.app</a></span>
      <span class="mvbtns"><a class="btn primary" href="${NOVO}">ir para o endereço novo</a><button class="btn" type="button" id="moveExport">⬇ levar meus dados</button><button class="linkbtn" type="button" id="moveHelp">como levo meu progresso?</button></span>
      <small id="moveTip" hidden>com conta: é só entrar na sua conta no endereço novo, tudo volta sozinho. sem conta: clique em "levar meus dados", abra o endereço novo e vá em ⚙ ajustes → "carregar meus dados de um arquivo".</small>`;
    document.body.prepend(bar);
    document.body.classList.add('moved');
    $('moveExport').onclick = () => { exportar(); $('moveTip').hidden = false; };
    $('moveHelp').onclick = () => { $('moveTip').hidden = !$('moveTip').hidden; };
  }

  /* carregar o arquivo (também aceita o "baixar meus dados" da conta) */
  $('importBtn').onclick = () => $('importFile').click();
  $('importFile').onchange = async e => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    let j;
    try { j = JSON.parse(await f.text()); } catch (err) { PomoApp.toast(`<b>⚠ ${T('arquivo inválido')}</b>${T('escolha o arquivo meu-pomodoro.json.')}`); return; }
    let keys = j && j.app === 'pomodoro-lofi' && j.keys;
    if (!keys && j && j.dados && j.dados.history) keys = {[STATE]:JSON.stringify(j.dados)};
    if (!keys || typeof keys !== 'object') { PomoApp.toast(`<b>⚠ ${T('arquivo inválido')}</b>${T('escolha o arquivo meu-pomodoro.json.')}`); return; }
    if (!confirm(T('juntar os dados do arquivo com os deste aparelho? nada daqui é apagado.'))) return;
    try {
      if (keys[STATE]) PomoApp.load(PomoApp.merge(PomoApp.get(), JSON.parse(keys[STATE])));
      Object.entries(keys).forEach(([k, v]) => { if (k !== STATE && KEYS.includes(k) && typeof v === 'string') localStorage.setItem(k, v); });
      PomoApp.toast(`<b>📥 ${T('dados carregados!')}</b>${T('seu progresso chegou. a página vai recarregar.')}`);
      if (window.Cloud && Cloud.queue) Cloud.queue();
      setTimeout(() => location.reload(), 2500);
    } catch (err) { console.error(err); PomoApp.toast(`<b>⚠ ${T('não deu certo')}</b>${T('o arquivo parece estar danificado.')}`); }
  };
})();
