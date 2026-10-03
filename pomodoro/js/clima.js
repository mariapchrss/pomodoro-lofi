/* ---------- clima de verdade: o cenário chove/neva quando está assim na cidade da pessoa ----------
   Usa o Open-Meteo (grátis, sem conta). A cidade fica só neste aparelho (localStorage "pomodoro-clima"),
   não vai para a nuvem. Atualiza a cada 30 min. */
(() => {
  const $ = id => document.getElementById(id);
  const T = (s, v) => window.I18N ? I18N.t(s, v) : s;
  const KEY = 'pomodoro-clima';
  let C = {on:false};
  try { C = Object.assign(C, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(C)); } catch (e) {} };
  const msg = (t, err) => { $('climaMsg').textContent = t || ''; $('climaMsg').classList.toggle('err', !!err); };

  /* códigos do Open-Meteo → efeito no cenário, ícone e nome */
  function kindOf(code, day) {
    if (code === 0) return {w:null, ic:day ? '☀️' : '🌙', nm:'céu limpo'};
    if (code <= 2) return {w:null, ic:day ? '🌤️' : '☁️', nm:'poucas nuvens'};
    if (code === 3) return {w:'clouds', ic:'☁️', nm:'nublado'};
    if (code === 45 || code === 48) return {w:'fog', ic:'🌫️', nm:'neblina'};
    if (code >= 51 && code <= 57) return {w:'drizzle', ic:'🌦️', nm:'garoa'};
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return {w:'rain', ic:'🌧️', nm:'chuva'};
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return {w:'snow', ic:'🌨️', nm:'neve'};
    if (code >= 95) return {w:'storm', ic:'⛈️', nm:'tempestade'};
    return {w:null, ic:'🌤️', nm:'tempo bom'};
  }

  let timer = null;
  async function update() {
    clearTimeout(timer);
    if (!C.on || C.lat == null) { Scenes.weather(null); $('climaRow').hidden = true; return; }
    try {
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${C.lat.toFixed(2)}&longitude=${C.lon.toFixed(2)}&current=temperature_2m,weather_code,is_day&timezone=auto`;
      const r = await fetch(u), j = await r.json(), cur = j.current;
      if (!cur) throw new Error('sem dados');
      const k = kindOf(cur.weather_code, cur.is_day === 1);
      Scenes.weather(k.w);
      C.last = {ic:k.ic, nm:k.nm, temp:Math.round(cur.temperature_2m), at:Date.now()}; save();
      show();
    } catch (e) { console.error(e); show(); }
    timer = setTimeout(update, 30 * 60000);
  }
  function show() {
    const row = $('climaRow');
    row.hidden = !(C.on && C.last);
    if (row.hidden) return;
    row.textContent = '';
    const a = document.createElement('span'); a.textContent = `${C.last.ic} ${C.last.temp}°`;
    const b = document.createElement('span'); b.textContent = T(C.last.nm);
    const c = document.createElement('small'); c.dataset.noi18n = ''; c.textContent = C.name || '';
    row.append(a, b, c);
  }
  function renderCfg() {
    $('climaOn').checked = !!C.on;
    $('climaCity').value = '';
    $('climaWhere').textContent = C.name ? T('cidade: {c}', {c:C.name}) : T('escolha sua cidade abaixo.');
    $('climaPick').hidden = !C.on;
  }
  function choose(name, lat, lon) {
    Object.assign(C, {on:true, name, lat, lon}); delete C.last; save();
    $('climaResults').innerHTML = ''; msg('');
    renderCfg(); update();
    PomoApp.toast(`<b>🌦️ ${T('clima ligado')}</b>${T('o cenário agora segue o tempo de {c}.', {c:name})}`);
  }

  $('climaOn').onchange = e => {
    C.on = e.target.checked; save(); renderCfg();
    if (C.on && C.lat == null) { msg('agora escolha sua cidade 👇'); $('climaCity').focus(); }
    update();
  };
  $('climaForm').onsubmit = async e => {
    e.preventDefault();
    const q = $('climaCity').value.trim(); if (q.length < 2) return;
    msg('procurando…'); $('climaResults').innerHTML = '';
    try {
      const lang = window.I18N ? I18N.lang : 'pt';
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=${lang}`);
      const j = await r.json(), list = j.results || [];
      if (!list.length) { msg('não achei essa cidade. confira o nome.', true); return; }
      msg('');
      list.forEach(p => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.noi18n = '';
        b.textContent = [p.name, p.admin1, p.country].filter(Boolean).join(', ');
        b.onclick = () => choose(p.name, p.latitude, p.longitude);
        $('climaResults').appendChild(b);
      });
    } catch (err) { console.error(err); msg('sem conexão agora. tente de novo.', true); }
  };
  $('climaGeo').onclick = () => {
    if (!navigator.geolocation) { msg('este navegador não deixa usar a localização.', true); return; }
    msg('pedindo a localização…');
    navigator.geolocation.getCurrentPosition(
      p => choose(T('minha localização'), p.coords.latitude, p.coords.longitude),
      () => msg('não deu para pegar a localização. digite a cidade.', true),
      {timeout:10000, maximumAge:3600000}
    );
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && C.on && C.last && Date.now() - C.last.at > 30 * 60000) update(); });
  document.addEventListener('langchange', show);

  renderCfg(); show(); update();
})();
