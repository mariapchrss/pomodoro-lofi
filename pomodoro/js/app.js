/* ---------- o pomodoro: cronômetro, tarefas, níveis, conquistas, histórico ---------- */
(() => {
  const $ = id => document.getElementById(id);
  const KEY = 'pomodoro-lofi-v2', OLD = 'pomodoro-noturno-v1';
  const dayKey = (d = new Date()) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  const uid = () => Math.random().toString(36).slice(2, 9);
  const look = () => document.documentElement.dataset.look === 'dia' ? 'dia' : 'noite';
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[ch]));
  const T = (s, v) => window.I18N ? I18N.t(s, v) : String(s).replace(/\{(\w+)\}/g, (a, k) => v && v[k] != null ? v[k] : a);
  const LOC = () => window.I18N ? I18N.locale : 'pt-BR';

  const ACTS = [
    {id:'estudando', ic:'📚', nm:'estudando'},
    {id:'lendo', ic:'📖', nm:'lendo'},
    {id:'trabalhando', ic:'💼', nm:'trabalhando'},
    {id:'programando', ic:'💻', nm:'programando'},
    {id:'escrevendo', ic:'✍️', nm:'escrevendo'},
    {id:'criando', ic:'🎨', nm:'criando'},
    {id:'casa', ic:'🧺', nm:'tarefas de casa'},
    {id:'jogando', ic:'🎮', nm:'jogando'},
    {id:'exercicio', ic:'🏃', nm:'exercício'},
    {id:'musica', ic:'🎸', nm:'tocando'},
    {id:'outro', ic:'✨', nm:'outra coisa'}
  ];
  const actOf = id => ACTS.find(a => a.id === id) || ACTS[ACTS.length - 1];
  const LEVELS = [['🌱','Sementinha'],['🌿','Broto'],['🪴','Mudinha'],['🌼','Florzinha'],['🟢','Tomatinho verde'],['🍅','Tomate maduro'],['🌳','Tomateiro'],['🧺','Horta inteira'],['🌾','Colheita farta'],['👑','Lenda do Foco']];
  const xpFor = n => 30 * (n - 1) * n;
  const levelOf = xp => { let n = 1; while (xp >= xpFor(n + 1)) n++; return n; };
  /* o que a pessoa está plantando: troca os tomatinhos do "hoje" e os nomes dos níveis 5 a 9 */
  const HORTA = [['🧺','Horta inteira'],['🌾','Colheita farta']], JARDIM = [['🏡','Jardim inteiro'],['🌺','Primavera em flor']];
  const PLANTS = [
    {id:'tomate', ic:'🍅', nm:'tomate', lv:[['🟢','Tomatinho verde'],['🍅','Tomate maduro'],['🌳','Tomateiro'], ...HORTA]},
    {id:'milho', ic:'🌽', nm:'milho', lv:[['🟢','Espiguinha verde'],['🌽','Milho maduro'],['🌾','Milharal'], ...HORTA]},
    {id:'morango', ic:'🍓', nm:'morango', lv:[['🟢','Moranguinho verde'],['🍓','Morango maduro'],['🌿','Pé de morango'], ...HORTA]},
    {id:'cenoura', ic:'🥕', nm:'cenoura', lv:[['🟢','Cenourinha'],['🥕','Cenoura madura'],['🌿','Canteiro de cenouras'], ...HORTA]},
    {id:'abobora', ic:'🎃', nm:'abóbora', lv:[['🟢','Aboborinha verde'],['🎃','Abóbora madura'],['🌿','Canteiro de abóboras'], ...HORTA]},
    {id:'lirio', ic:'🌷', nm:'lírio', lv:[['🟢','Botão de lírio'],['🌷','Lírio aberto'],['💐','Canteiro de lírios'], ...JARDIM]},
    {id:'girassol', ic:'🌻', nm:'girassol', lv:[['🟢','Botão de girassol'],['🌻','Girassol aberto'],['💐','Campo de girassóis'], ...JARDIM]},
    {id:'rosa', ic:'🌹', nm:'roseira', lv:[['🟢','Botão de rosa'],['🌹','Rosa aberta'],['💐','Roseiral'], ...JARDIM]},
    {id:'cerejeira', ic:'🌸', nm:'cerejeira', lv:[['🟢','Botão de cerejeira'],['🌸','Flor de cerejeira'],['🌳','Cerejeira'], ...JARDIM]},
    {id:'cacto', ic:'🌵', nm:'cacto', lv:[['🟢','Cactinho'],['🌵','Cacto florido'],['🏜️','Jardim de cactos'], ...JARDIM]}
  ];
  const plantOf = id => PLANTS.find(p => p.id === id) || PLANTS[0];
  const levelInfo = n => { n = Math.min(n, LEVELS.length); return n >= 5 && n <= 9 ? plantOf(S && S.plant).lv[n - 5] : LEVELS[n - 1]; };

  /* ---------- dados ---------- */
  const DEFAULTS = {
    settings:{focus:25, short:5, long:15, every:4, auto:false, sound:true, notify:false, pixelClock:false,
      routine:'classico', steps:[{t:'focus', m:25}, {t:'short', m:25}], loop:true, water:false, waterEvery:45, waterVol:.7, shareNow:false},
    tasks:[
      {id:uid(), text:'Estudar 1 capítulo (exemplo)', est:2, spent:0, done:false},
      {id:uid(), text:'Responder mensagens (exemplo)', est:1, spent:0, done:false}
    ],
    active:null, cycle:0, history:{}, xp:0, total:{pomos:0, tasks:0, cycles:0},
    ach:{}, flags:{}, theme:'cidade', pet:'gato', activity:'estudando', themesUsed:['cidade'], maxSounds:0, music:'', musicAuto:true, musicBreaks:false,
    seqIdx:0, petColors:{}, journal:{}, notes:[], petsUsed:['gato'], deleted:{}, plant:'tomate',
    coinsEarned:0, owned:[], petOutfits:{}, myRoutines:[],
    missionsClaimed:{}, goals:[], goalsDone:{}, chClaimed:{}, chest:{last:'', streak:0, at:0}, missionSet:{}, duelHidden:{},
    countdowns:[], league:{tier:0, at:0, best:0, last:null},
    clocks:['America/Manaus', 'America/Sao_Paulo', 'America/New_York', 'Europe/Lisbon']
  };
  const clone = o => JSON.parse(JSON.stringify(o));
  let S = null;
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  const returning = !!S;   // já usava o site antes (para mostrar as novidades só para quem já conhecia)
  if (!S) {
    let old = null; try { old = JSON.parse(localStorage.getItem(OLD)); } catch (e) {}
    S = clone(DEFAULTS);
    if (old) {
      ['settings', 'tasks', 'active', 'cycle', 'history'].forEach(k => { if (old[k] != null) S[k] = old[k]; });
      let p = 0, m = 0, t = 0;
      Object.values(S.history).forEach(d => { p += d.pomos || 0; m += d.min || 0; t += d.tasks || 0; });
      S.xp = m + 5 * p; S.total.pomos = p; S.total.tasks = t;
    }
  }
  function normalize(s) {
    for (const k in DEFAULTS) if (s[k] == null) s[k] = clone(DEFAULTS[k]);
    s.settings = Object.assign(clone(DEFAULTS.settings), s.settings);
    if (!Array.isArray(s.settings.steps) || !s.settings.steps.length) s.settings.steps = clone(DEFAULTS.settings.steps);
    s.total = Object.assign({}, DEFAULTS.total, s.total);
    if (!s.petsUsed.includes(s.pet)) s.petsUsed.push(s.pet);
    if (!Array.isArray(s.notes)) s.notes = [];
    if (typeof s.petColors !== 'object' || Array.isArray(s.petColors)) s.petColors = {};
    if (!Array.isArray(s.owned)) s.owned = [];
    if (!Array.isArray(s.myRoutines)) s.myRoutines = [];
    if (!Array.isArray(s.goals)) s.goals = [];
    ['missionsClaimed', 'goalsDone', 'chClaimed', 'missionSet', 'duelHidden'].forEach(k => { if (typeof s[k] !== 'object' || Array.isArray(s[k]) || !s[k]) s[k] = {}; });
    if (typeof s.petOutfits !== 'object' || Array.isArray(s.petOutfits)) s.petOutfits = {};
    if (typeof s.chest !== 'object' || !s.chest) s.chest = clone(DEFAULTS.chest);
    if (!Array.isArray(s.countdowns)) s.countdowns = [];
    if (typeof s.league !== 'object' || !s.league) s.league = clone(DEFAULTS.league);
    s.league.tier = Math.max(0, Math.min(4, s.league.tier | 0));
    /* cenário que este site não tem (ex.: veio de outra versão): volta pra cidade chuvosa */
    if (!Scenes.THEMES[s.theme]) s.theme = 'cidade';
    /* quem já usava o site ganha moedas pelo que já fez: 5 por pomodoro e 20 por conquista */
    if (!s.flags.coinsInit) {
      s.coinsEarned = Math.max(s.coinsEarned || 0, (s.total.pomos || 0) * 5 + Object.keys(s.ach || {}).length * 20);
      s.flags.coinsInit = true;
    }
    if (!(s.seqIdx >= 0 && s.seqIdx < s.settings.steps.length)) s.seqIdx = 0;
    if (!s.active && s.tasks[0]) s.active = s.tasks[0].id;
    return s;
  }
  normalize(S);
  /* as bolinhas do ciclo começam do zero a cada dia novo */
  if (S.cycle && S.cycleDay !== dayKey()) { S.cycle = 0; S.cycleDay = dayKey(); }
  const store = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const save = () => { S.updatedAt = Date.now(); store(); if (window.Cloud) window.Cloud.queue(); };
  const day = () => { const d = (S.history[dayKey()] ||= {pomos:0, min:0, tasks:0}); d.act ||= {}; return d; };

  /* ---------- avisos na tela ---------- */
  const toastQ = []; let toasting = false;
  function toast(html) { toastQ.push(html); if (!toasting) nextToast(); }
  function nextToast() {
    const m = toastQ.shift(); if (!m) { toasting = false; return; }
    toasting = true; const el = $('toast'); el.innerHTML = m; el.classList.add('show');
    setTimeout(() => { el.classList.remove('show'); setTimeout(nextToast, 350); }, 3400);
  }

  /* ---------- estatísticas e conquistas ---------- */
  function streak() {
    let n = 0; const d = new Date();
    if (!(S.history[dayKey(d)] || {}).pomos) d.setDate(d.getDate() - 1);
    while ((S.history[dayKey(d)] || {}).pomos) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  const maxDay = () => Math.max(0, ...Object.values(S.history).map(d => d.pomos || 0));
  const totalMin = () => Object.values(S.history).reduce((a, d) => a + (d.min || 0), 0);
  const actsUsed = () => { const s = new Set(); Object.values(S.history).forEach(d => Object.keys(d.act || {}).forEach(a => s.add(a))); return s.size; };
  const fmtMin = m => m < 60 ? m + ' min' : Math.floor(m / 60) + 'h' + (m % 60 ? String(m % 60).padStart(2, '0') : '');

  const ACH = [
    {id:'first', ic:'🍅', nm:'primeiro tomate', ds:'complete seu primeiro pomodoro', ok:() => S.total.pomos >= 1},
    {id:'day5', ic:'🔥', nm:'dia produtivo', ds:'5 pomodoros no mesmo dia', ok:() => maxDay() >= 5},
    {id:'day10', ic:'💪', nm:'maratona', ds:'10 pomodoros no mesmo dia', ok:() => maxDay() >= 10},
    {id:'cycle', ic:'🔁', nm:'ciclo completo', ds:'chegue até uma pausa longa', ok:() => S.total.cycles >= 1},
    {id:'early', ic:'🌅', nm:'cedinho', ds:'termine um pomodoro antes das 8h', ok:() => !!S.flags.early},
    {id:'owl', ic:'🦉', nm:'coruja', ds:'termine um pomodoro depois das 22h', ok:() => !!S.flags.night},
    {id:'streak3', ic:'📅', nm:'3 dias seguidos', ds:'foque 3 dias sem pular nenhum', ok:() => streak() >= 3},
    {id:'streak7', ic:'🗓️', nm:'semana inteira', ds:'foque 7 dias sem pular nenhum', ok:() => streak() >= 7},
    {id:'tot25', ic:'🧺', nm:'cesta cheia', ds:'25 pomodoros no total', ok:() => S.total.pomos >= 25},
    {id:'tot100', ic:'🏆', nm:'centena', ds:'100 pomodoros no total', ok:() => S.total.pomos >= 100},
    {id:'tasks5', ic:'✅', nm:'riscando a lista', ds:'conclua 5 tarefas', ok:() => S.total.tasks >= 5},
    {id:'acts4', ic:'🌈', nm:'multitarefa', ds:'foque em 4 atividades diferentes', ok:() => actsUsed() >= 4},
    {id:'themes3', ic:'🧭', nm:'turista', ds:'experimente 3 cenários', ok:() => S.themesUsed.length >= 3},
    {id:'dj', ic:'🎧', nm:'dj do foco', ds:'toque 3 sons ao mesmo tempo', ok:() => S.maxSounds >= 3},
    {id:'lvl5', ic:'⭐', nm:'nível 5', ds:'chegue ao nível 5', ok:() => levelOf(S.xp) >= 5},
    {id:'lvl10', ic:'👑', nm:'lenda', ds:'chegue ao nível 10', ok:() => levelOf(S.xp) >= 10},
    {id:'streak14', ic:'🌙', nm:'duas semanas', ds:'foque 14 dias seguidos', ok:() => streak() >= 14},
    {id:'streak30', ic:'🌕', nm:'mês inteiro', ds:'foque 30 dias seguidos', ok:() => streak() >= 30},
    {id:'tot250', ic:'💎', nm:'250 tomates', ds:'250 pomodoros no total', ok:() => S.total.pomos >= 250},
    {id:'tot500', ic:'🌟', nm:'500 tomates', ds:'500 pomodoros no total', ok:() => S.total.pomos >= 500},
    {id:'hours10', ic:'⏳', nm:'10 horas', ds:'10 horas de foco no total', ok:() => totalMin() >= 600},
    {id:'hours50', ic:'⌛', nm:'50 horas', ds:'50 horas de foco no total', ok:() => totalMin() >= 3000},
    {id:'deep', ic:'🧠', nm:'mergulho', ds:'termine um foco de 50 minutos ou mais', ok:() => !!S.flags.deep},
    {id:'weekend', ic:'🛋️', nm:'fim de semana produtivo', ds:'termine um pomodoro no sábado ou no domingo', ok:() => !!S.flags.weekend},
    {id:'routine', ic:'⚙️', nm:'do meu jeito', ds:'termine um foco usando uma sequência personalizada', ok:() => !!S.flags.routine},
    {id:'acts8', ic:'🎭', nm:'faz de tudo', ds:'foque em 8 atividades diferentes', ok:() => actsUsed() >= 8},
    {id:'themes6', ic:'🗺️', nm:'viajante', ds:'experimente 6 cenários', ok:() => S.themesUsed.length >= 6},
    {id:'allthemes', ic:'🌍', nm:'volta ao mundo', ds:'experimente todos os cenários de nível', ok:() => Object.keys(Scenes.THEMES).filter(k => !Scenes.THEMES[k].price).every(k => S.themesUsed.includes(k))},
    {id:'pets3', ic:'🐾', nm:'amigo dos bichos', ds:'escolha 3 bichinhos diferentes', ok:() => S.petsUsed.filter(id => !Pets.isSpecial(id)).length >= 3},
    {id:'avatar', ic:'🎨', nm:'estilo próprio', ds:'pinte seu bichinho com uma cor nova', ok:() => !!S.flags.petcolor},
    {id:'diary1', ic:'✍️', nm:'querido diário', ds:'escreva no diário', ok:() => diaryDays() >= 1},
    {id:'diary7', ic:'📓', nm:'diário em dia', ds:'escreva no diário em 7 dias diferentes', ok:() => diaryDays() >= 7},
    {id:'notes3', ic:'🗒️', nm:'bloco cheio', ds:'crie 3 notas', ok:() => S.notes.filter(n => n.title || n.text).length >= 3},
    {id:'music', ic:'🎵', nm:'trilha sonora', ds:'toque uma música do Spotify ou do YouTube', ok:() => !!S.flags.music},
    {id:'friend', ic:'🤝', nm:'turma do foco', ds:'faça uma amizade no ranking', ok:() => !!S.flags.friend},
    {id:'water1', ic:'🥤', nm:'primeiro golinho', ds:'marque seu primeiro copo de água', ok:() => waterTotal() >= 1},
    {id:'water8', ic:'💧', nm:'bem hidratado', ds:'marque 8 copos de água no mesmo dia', ok:() => Object.values(S.history).some(d => (d.water || 0) >= 8)},
    {id:'water3d', ic:'🌊', nm:'onda de hidratação', ds:'beba água 3 dias seguidos (pelo menos 4 copos por dia)', ok:() => waterStreak() >= 3},
    {id:'water7d', ic:'🐳', nm:'baleia azul', ds:'beba água 7 dias seguidos (pelo menos 4 copos por dia)', ok:() => waterStreak() >= 7},
    {id:'water50', ic:'🫗', nm:'50 copos', ds:'marque 50 copos de água no total', ok:() => waterTotal() >= 50},
    {id:'water200', ic:'🏝️', nm:'oásis', ds:'marque 200 copos de água no total', ok:() => waterTotal() >= 200},
    {id:'day20', ic:'🚀', nm:'imparável', ds:'20 pomodoros no mesmo dia', ok:() => maxDay() >= 20},
    {id:'tot1000', ic:'🏅', nm:'mil tomates', ds:'1000 pomodoros no total', ok:() => S.total.pomos >= 1000},
    {id:'hours100', ic:'🕰️', nm:'100 horas', ds:'100 horas de foco no total', ok:() => totalMin() >= 6000},
    {id:'daymin240', ic:'⏱️', nm:'dia de maratona', ds:'4 horas de foco no mesmo dia', ok:() => Object.values(S.history).some(d => (d.min || 0) >= 240)},
    {id:'streak60', ic:'🌠', nm:'dois meses', ds:'foque 60 dias seguidos', ok:() => streak() >= 60},
    {id:'tasks50', ic:'📝', nm:'lista zerada', ds:'conclua 50 tarefas', ok:() => S.total.tasks >= 50},
    {id:'water500', ic:'🌧️', nm:'nuvem de chuva', ds:'marque 500 copos de água no total', ok:() => waterTotal() >= 500},
    {id:'allpets', ic:'🦁', nm:'zoológico', ds:'escolha todos os bichinhos', ok:() => Pets.LIST.filter(p => !p.special).every(p => S.petsUsed.includes(p.id))},
    /* só existe onde há personagens especiais (cópia dos fãs) */
    ...(Pets.LIST.some(p => p.special) ? [{id:'special1', ic:'🌟', nm:'visita especial', ds:'compre um personagem especial', ok:() => S.owned.some(id => id.startsWith('pet:'))}] : []),
    {id:'metro', ic:'🎼', nm:'no ritmo', ds:'use o metrônomo', ok:() => !!S.flags.metro},
    {id:'myroutine', ic:'📋', nm:'rotina própria', ds:'salve uma rotina sua', ok:() => S.myRoutines.length >= 1},
    {id:'coins100', ic:'🪙', nm:'cofrinho', ds:'ganhe 100 moedas', ok:() => S.coinsEarned >= 100},
    {id:'coins1000', ic:'💰', nm:'tesouro', ds:'ganhe 1000 moedas', ok:() => S.coinsEarned >= 1000},
    {id:'shop1', ic:'🛍️', nm:'primeira comprinha', ds:'compre um item na lojinha', ok:() => S.owned.some(id => !id.includes(':'))},
    {id:'shop5', ic:'👒', nm:'guarda-roupa', ds:'tenha 5 itens da lojinha', ok:() => S.owned.filter(id => !id.includes(':')).length >= 5},
    {id:'dressed', ic:'🤵', nm:'bem arrumado', ds:'vista o bichinho com 3 peças ao mesmo tempo', ok:() => Object.values(S.petOutfits).some(o => Object.values(o || {}).filter(Boolean).length >= 3)},
    {id:'crown', ic:'🫅', nm:'realeza', ds:'compre a coroa', ok:() => S.owned.includes('coroa')},
    {id:'mission1', ic:'🎯', nm:'missão cumprida', ds:'complete uma missão', ok:() => Object.keys(S.missionsClaimed).length >= 1},
    {id:'missions30', ic:'🗂️', nm:'agente secreto', ds:'complete 30 missões', ok:() => Object.keys(S.missionsClaimed).length >= 30},
    {id:'weekly1', ic:'📆', nm:'semana vencida', ds:'complete uma missão semanal', ok:() => Object.keys(S.missionsClaimed).some(k => k.startsWith('week:'))},
    {id:'goal1', ic:'🏁', nm:'meta batida', ds:'bata uma meta pessoal', ok:() => Object.keys(S.goalsDone).length >= 1},
    {id:'goals10', ic:'🧗', nm:'persistência', ds:'bata 10 metas pessoais', ok:() => Object.keys(S.goalsDone).length >= 10},
    {id:'summary', ic:'📸', nm:'retrospectiva', ds:'veja o resumo da semana', ok:() => !!S.flags.summary},
    {id:'duel1', ic:'⚔️', nm:'desafiante', ds:'desafie uma amizade', ok:() => !!S.flags.duel},
    {id:'duelwin', ic:'🥇', nm:'vitória', ds:'vença um desafio', ok:() => Object.values(S.chClaimed).includes('win')},
    {id:'duelwin5', ic:'🏆', nm:'campeonato', ds:'vença 5 desafios', ok:() => Object.values(S.chClaimed).filter(v => v === 'win').length >= 5},
    {id:'scenebuy', ic:'🏞️', nm:'paisagem nova', ds:'compre um cenário na coleção', ok:() => S.owned.some(id => id.startsWith('scene:'))},
    {id:'allscenes', ic:'🖼️', nm:'galeria completa', ds:'compre todos os cenários à venda', ok:() => Object.keys(Scenes.THEMES).filter(k => Scenes.THEMES[k].price).every(k => S.owned.includes('scene:' + k))},
    {id:'chest1', ic:'🎁', nm:'surpresa!', ds:'abra o baú diário', ok:() => !!S.chest.last},
    {id:'chest7', ic:'🗝️', nm:'caçador de tesouros', ds:'abra o baú 7 dias seguidos', ok:() => (S.chest.best || S.chest.streak || 0) >= 7},
    {id:'zen', ic:'🧘', nm:'modo monge', ds:'termine um pomodoro no foco total', ok:() => !!S.flags.zen},
    {id:'together', ic:'👯', nm:'estudo em dupla', ds:'termine um pomodoro focando junto com uma amizade', ok:() => !!S.flags.together},
    {id:'spin10', ic:'🎲', nm:'pausa de verdade', ds:'cumpra 10 sorteios da roleta da pausa', ok:() => Object.values(S.history).reduce((a, d) => a + (d.spins || 0), 0) >= 10},
    {id:'league1', ic:'🥈', nm:'subindo de liga', ds:'chegue à liga prata', ok:() => (S.league.best || 0) >= 1},
    {id:'league3', ic:'💎', nm:'brilho de diamante', ds:'chegue à liga diamante', ok:() => (S.league.best || 0) >= 3},
    {id:'countdown', ic:'📅', nm:'de olho no calendário', ds:'crie uma contagem regressiva', ok:() => !!S.flags.countdown},
    {id:'group', ic:'📚', nm:'grupo de estudos', ds:'termine um pomodoro numa sala de estudo com 3 pessoas ou mais', ok:() => !!S.flags.group},
    {id:'halloween', ic:'🎃', nm:'doce ou foco', ds:'complete as 4 missões de Halloween (em outubro)', ok:() => Object.keys(S.missionsClaimed).filter(k => k.startsWith('hw:')).length >= 4}
  ];

  /* ---------- moedas: o saldo é o que ganhou menos o preço do que comprou (assim nada se perde entre aparelhos) ---------- */
  const itemOf = id => Pets.ITEMS.find(i => i.id === id);
  /* o que se compra: roupinhas (id do item) e cenários ("scene:" + id do cenário) */
  /* personagens especiais ficam como "pet:<id>@<preço>": o preço vai junto, então o saldo fica certo
     mesmo num site que não conhece aquele personagem */
  const priceOf = id => id.includes('@') ? +id.split('@')[1] || 0 : id.startsWith('scene:') ? ((Scenes.THEMES[id.slice(6)] || {}).price || 0) : ((itemOf(id) || {}).price || 0);
  const ownsPet = id => S.owned.some(x => x.split('@')[0] === 'pet:' + id);
  const coins = () => Math.max(0, (S.coinsEarned || 0) - S.owned.reduce((a, id) => a + priceOf(id), 0));
  function earn(n) {
    if (!(n > 0)) return;
    S.coinsEarned = (S.coinsEarned || 0) + n;
    renderCoins(true);
  }
  function renderCoins(bump) {
    $('coinVal').textContent = coins();
    if (bump) { const b = $('coinBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    if ($('shopCoins')) $('shopCoins').textContent = coins();
  }
  const waterTotal = () => Object.values(S.history).reduce((a, d) => a + (d.water || 0), 0);
  function waterStreak() {
    let n = 0; const d = new Date();
    if (((S.history[dayKey(d)] || {}).water || 0) < 4) d.setDate(d.getDate() - 1);
    while (((S.history[dayKey(d)] || {}).water || 0) >= 4) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function diaryDays() { return Object.values(S.journal).filter(e => e && (e.text || '').trim()).length; }
  function checkAch(silent) {
    let any = false;
    ACH.forEach(a => { if (!S.ach[a.id] && a.ok()) { S.ach[a.id] = dayKey(); any = true; earn(20); if (!silent) toast(`<b>${a.ic} conquista nova!</b>${a.nm} · +20 🪙`); } });
    if (any) { save(); renderProgress(); }
  }
  function unlocksAt(n) {
    const out = [];
    Object.values(Scenes.THEMES).forEach(t => t.level === n && out.push('🖼 ' + T(t.name)));
    Pets.LIST.forEach(p => p.level === n && !p.price && out.push(p.ic + ' ' + T(p.name)));
    return out;
  }
  function gainXP(n) {
    const before = levelOf(S.xp); S.xp += n; const after = levelOf(S.xp);
    for (let l = before + 1; l <= after; l++) {
      earn(50);
      const [ic, nm] = levelInfo(l), u = unlocksAt(l);
      toast(`<b>${ic} ${T('nível {n}: {name}!', {n:l, name:T(nm)})}</b>` + (u.length ? T('você desbloqueou {list}', {list:u.join(', ')}) : '+ XP, continue assim'));
    }
    if (after > before) renderCollection();
  }

  /* ---------- cronômetro ---------- */
  const LABEL = {focus:'foco', short:'pausa curta', long:'pausa longa'};
  const MOOD = {focus:'hora de focar', short:'respira um pouquinho', long:'pausa merecida'};
  let mode = 'focus', running = false, endAt = 0, happyUntil = 0, pendingMode = null, breakId = 1, spinPaid = 0;
  let remaining = S.settings.focus * 60000, total = remaining;
  const seq = () => S.settings.routine === 'custom' && S.settings.steps.length > 0;
  const stepAt = i => S.settings.steps[Math.min(Math.max(i, 0), S.settings.steps.length - 1)];
  const minutesFor = m => Math.max(1, seq() ? +stepAt(S.seqIdx).m || 1 : +S.settings[m] || 1);

  /* o cronômetro fica salvo neste navegador: recarregar a página ou atualizar o site não zera o tempo */
  const TKEY = 'pomodoro-timer';
  function saveTimer() { try { localStorage.setItem(TKEY, JSON.stringify({mode, running, endAt, remaining, total})); } catch (e) {} }
  function readTimer() { try { return JSON.parse(localStorage.getItem(TKEY)); } catch (e) { return null; } }
  function restoreTimer(t) {
    if (!t || !(t.total > 0) || !LABEL[t.mode]) return;
    mode = t.mode; total = t.total;
    if (t.running) {
      running = true; endAt = t.endAt; remaining = Math.max(0, endAt - Date.now());
      if (remaining <= 0) finish(true); else wake(true);
    } else { running = false; remaining = Math.min(Math.max(0, t.remaining), total); }
  }
  const C = 2 * Math.PI * 108, prog = $('prog');
  prog.style.strokeDasharray = C;
  const fmt = ms => { const s = Math.ceil(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

  let actx;
  const ac = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} return actx; };
  function chime() {
    if (!S.settings.sound || !ac()) return;
    [0, .25, .5].forEach((d, i) => {
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + d;
      o.type = 'triangle'; o.frequency.value = [659, 784, 988][i];
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .9);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 1);
    });
  }
  /* aviso do sistema. No celular (Android) "new Notification" não funciona: tem que ser pelo ajudante (sw.js),
     que também deixa o aviso aparecer com o app minimizado */
  function notify(title, body) {
    try {
      if (!S.settings.notify || !document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;
      const opts = {body, tag:'pomodoro', renotify:true, icon:'icons/icon-192.png', badge:'icons/icon-192.png', vibrate:[200, 100, 200]};
      if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(r => r.showNotification(title, opts)).catch(() => {});
      else new Notification(title, opts);
    } catch (e) {}
  }
  let lock = null;
  async function wake(on) {
    try {
      if (on && 'wakeLock' in navigator && !lock) lock = await navigator.wakeLock.request('screen');
      if (!on && lock) { await lock.release(); lock = null; }
    } catch (e) { lock = null; }
  }

  function setMode(m, keepRunning = false) {
    if (seq()) m = stepAt(S.seqIdx).t;
    mode = LABEL[m] ? m : 'focus'; total = remaining = minutesFor(mode) * 60000; pendingMode = null;
    if (mode !== 'focus') breakId = Date.now();   // cada pausa paga a roleta uma vez
    running = keepRunning; if (running) endAt = Date.now() + remaining;
    saveTimer(); render(); nowChanged();
  }
  /* "o que estou fazendo agora" para as amizades (só se a pessoa ligar na conta) */
  const nowChanged = () => { if (window.Cloud && Cloud.nowChanged) Cloud.nowChanged(); };
  /* soma nos desafios com amizades que estão valendo (o placar começa do 0 no aceite) */
  const duelAdd = (type, n) => { if (window.Cloud && Cloud.duelAdd) Cloud.duelAdd(type, n); };
  /* focar junto: o que a pessoa fez no cronômetro vai para a sala (cloud.js). natural = o tempo acabou sozinho */
  let applying = false;
  const timerState = () => ({mode, running, endAt:running ? endAt : 0, remaining:running ? Math.max(0, endAt - Date.now()) : remaining, total});
  const share = natural => { if (!applying && window.Cloud && Cloud.roomTimer) Cloud.roomTimer(timerState(), !!natural); };
  function start() { ac(); running = true; endAt = Date.now() + remaining; wake(true); saveTimer(); render(); nowChanged(); }
  function pause() { running = false; remaining = Math.max(0, endAt - Date.now()); wake(false); saveTimer(); render(); nowChanged(); }
  function creditFocus() {
    const d = day(), m = Math.max(1, Math.round(total / 60000)), now = new Date(), h = now.getHours();
    d.pomos++; d.min += m; d.act[S.activity] = (d.act[S.activity] || 0) + m;
    S.total.pomos++;
    duelAdd('pomos', 1); duelAdd('min', m);
    if (h >= 4 && h < 8) S.flags.early = true;
    if (h >= 22 || h < 4) S.flags.night = true;
    if (m >= 50) S.flags.deep = true;
    if (now.getDay() === 0 || now.getDay() === 6) S.flags.weekend = true;
    if (seq()) S.flags.routine = true;
    if (document.body.classList.contains('zen')) S.flags.zen = true;
    if (window.Cloud && Cloud.inRoom && Cloud.inRoom()) S.flags.together = true;
    if (window.Cloud && Cloud.groupSize && Cloud.groupSize() >= 3) S.flags.group = true;
    S.cycleDay = dayKey();
    happyUntil = Date.now() + 3500; harvestUntil = Date.now() + 4500;
    gainXP(m + 5);
    /* moedas só para foco de 20 minutos ou mais (1 moeda a cada 5 min: 25 min = 5 moedas) */
    if (m >= 20) earn(Math.round(m / 5));
  }
  /* plantinha no relógio: nasce e cresce durante o foco; colhida no fim; murcha se a pessoa desiste depois de 1 min */
  let harvestUntil = 0, wiltUntil = 0, sproutKey = '';
  function wilt() {
    if (mode !== 'focus' || total - remaining < 60000) return;
    wiltUntil = Date.now() + 3500;
    toast('<b>🥀 a plantinha murchou</b>tudo bem, a próxima cresce!');
  }
  function renderSprout() {
    const el = $('sprout'), now = Date.now(), pl = plantOf(S.plant);
    let ic = '', cls = '';
    if (now < wiltUntil) { ic = '🥀'; cls = 'wilt'; }
    else if (now < harvestUntil) { ic = pl.ic; cls = 'ripe'; }
    else if (mode === 'focus' && remaining < total) { const p = 1 - remaining / total; ic = p < .25 ? '🌰' : p < .5 ? '🌱' : p < .8 ? '🌿' : '🪴'; cls = 'grow'; }
    if (ic + cls === sproutKey) return;
    sproutKey = ic + cls;
    el.className = 'sprout'; void el.offsetWidth;
    el.textContent = ic; el.className = 'sprout ' + cls;
  }
  function finish(natural) {
    const was = mode;
    if (!natural) wilt();
    if (seq()) {
      if (mode === 'focus' && natural) creditFocus();
      S.seqIdx++;
      let keep = S.settings.auto;
      if (S.seqIdx >= S.settings.steps.length) {
        S.seqIdx = 0;
        if (natural) { S.total.cycles++; gainXP(10); }
        if (!S.settings.loop) { keep = false; if (natural) toast('<b>🏁 sequência concluída!</b>quando quiser, é só começar de novo.'); }
      }
      save(); setMode(null, keep);
    } else if (mode === 'focus') {
      /* só foco terminado de verdade conta para a pausa longa; pular não conta */
      if (natural) { creditFocus(); S.cycle++; S.cycleDay = dayKey(); }
      const next = natural && S.cycle % S.settings.every === 0 ? 'long' : 'short';
      if (natural && next === 'long') { S.total.cycles++; gainXP(10); }
      save(); setMode(next, S.settings.auto);
    } else {
      if (mode === 'long') S.cycle = 0;
      save(); setMode('focus', S.settings.auto);
    }
    if (natural) {
      share(true);
      chime();
      notify(T(was === 'focus' ? '🍅 pomodoro concluído!' : '⏰ fim da pausa'), T(was === 'focus' ? 'hora de uma pausa.' : 'bora focar de novo?'));
    }
    if (!running) wake(false);
    checkAch(); renderProgress(); renderHistory();
  }
  setInterval(() => {
    if (!running) return;
    remaining = Math.max(0, endAt - Date.now());
    if (remaining <= 0) finish(true); else renderTime();
  }, 250);

  /* ---------- telas ---------- */
  function renderTime() {
    $('time').textContent = fmt(remaining);
    prog.style.strokeDashoffset = C * (1 - remaining / total);
    document.title = fmt(remaining) + ' · ' + T(LABEL[mode]);
  }
  function render() {
    renderTime();
    document.body.dataset.mode = mode;
    document.body.classList.toggle('pixelclock', !!S.settings.pixelClock);
    $('mood').textContent = MOOD[mode];
    document.querySelectorAll('.modes button').forEach(b => { b.setAttribute('aria-pressed', b.dataset.mode === mode); b.classList.toggle('next', b.dataset.mode === pendingMode); });
    $('toggle').textContent = running && pendingMode ? T('começar {m}', {m:T(LABEL[pendingMode])}) : running ? 'pausar' : (remaining < total ? 'continuar' : 'começar');
    $('toggle').classList.toggle('switch', !!(running && pendingMode));
    const a = actOf(S.activity);
    if (mode === 'focus') $('now').textContent = `${a.ic} ${a.nm}`;
    else $('now').textContent = 'levanta, bebe uma água, alonga ☁';
    $('spinBtn').hidden = mode === 'focus';
    const sq = seq();
    document.querySelector('.modes').hidden = sq; $('seqInfo').hidden = !sq;
    if (sq) {
      const st = S.settings.steps, i = S.seqIdx;
      $('seqInfo').textContent = T('etapa {i} de {n} · {label} {m} min', {i:i + 1, n:st.length, label:T(LABEL[mode]), m:minutesFor(mode)});
      $('set').innerHTML = st.map((s, k) => `<span class="pip t-${s.t}${k < i ? ' on' : ''}${k === i ? ' cur' : ''}" title="${T(LABEL[s.t])} ${s.m} min"></span>`).join('') + `<span>${T(S.settings.loop ? 'sequência · repete' : 'sequência')}</span>`;
    } else {
      const n = S.settings.every, c = S.cycle % n;
      $('set').innerHTML = Array.from({length:n}, (_, i) => `<span class="pip${i < c ? ' on' : ''}"></span>`).join('') + `<span>${T('{c} de {n} até a pausa longa', {c, n})}</span>`
        + (c ? ' <button class="linkbtn" type="button" data-cycle-reset title="Zerar as bolinhas e começar o ciclo de novo">zerar</button>' : '');
    }
    const d = S.history[dayKey()] || {pomos:0, min:0, tasks:0};
    $('st-pomos').textContent = d.pomos; $('st-min').textContent = d.min; $('st-tasks').textContent = d.tasks;
    /* tomate = bolinhas desenhadas; as outras plantinhas usam o emoji */
    const pl = plantOf(S.plant);
    $('tomatoes').innerHTML = (pl.id === 'tomate' ? '<i></i>' : `<i class="em">${pl.ic}</i>`).repeat(Math.min(d.pomos, 40));
    $('tomatoes').title = T('você está plantando: {p}', {p:T(pl.nm)});
    /* copinhos de água do dia: só para quem ligou o lembrete; cada "bebi!" enche um */
    const w = d.water || 0;
    $('cupsRow').hidden = !S.settings.water;
    if (S.settings.water) {
      /* sem meta fixa: aparece um copinho cheio a cada "bebi!" */
      $('cupsList').innerHTML = Array.from({length:Math.min(w, 40)}, () => '<i class="cup on"></i>').join('');
      $('cupsCount').textContent = w ? T(w > 1 ? '{n} copos' : '{n} copo', {n:w}) : T('nenhum copo ainda');
    }
    $('today').textContent = new Date().toLocaleDateString(LOC(), {weekday:'long', day:'numeric', month:'long'});
    renderTasks();
    musicSync();
    renderMissions(); renderChest();
  }
  function renderActs() {
    const box = $('acts'); box.innerHTML = '';
    ACTS.forEach(a => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'act';
      b.textContent = a.ic + ' ' + a.nm; b.setAttribute('aria-pressed', S.activity === a.id);
      b.onclick = () => {
        S.activity = a.id; save(); renderActs(); render();
        const r = S.myRoutines.find(x => x.act === a.id);
        if (r && !running && S.settings.myId !== r.id) { applyMy(r); toast(`<b>📋 ${T('rotina {name}', {name:esc(r.name)})}</b>${r.steps.map(s => s.m).join('·')} min`); }
      };
      box.appendChild(b);
    });
  }
  function renderTasks() {
    const ul = $('tasks'); ul.innerHTML = '';
    /* tarefas e pomodoros são coisas separadas (pedido dela, 03/10/2026): a tarefa é só uma lista para riscar */
    const feitas = S.tasks.filter(t => t.done).length;
    $('taskCount').textContent = S.tasks.length ? T('{a} de {b} feitas', {a:feitas, b:S.tasks.length}) : '';
    if (!S.tasks.length) { ul.innerHTML = '<li class="empty">nenhuma tarefa ainda. adiciona a primeira aí em cima.</li>'; return; }
    S.tasks.forEach(t => {
      const li = document.createElement('li');
      li.className = t.done ? 'done' : '';
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = t.done;
      cb.setAttribute('aria-label', 'Concluir ' + t.text);
      cb.onclick = e => {
        e.stopPropagation(); t.done = cb.checked; t.u = Date.now();
        /* a tarefa conta uma vez só: desmarcar no mesmo dia desfaz; desmarcar e marcar em outro dia não conta de novo
           (senão dava para cumprir as missões de tarefas sem fazer nada) */
        const d = day();
        if (t.done) { if (!t.counted) { d.tasks++; S.total.tasks++; t.counted = true; t.doneDay = dayKey(); duelAdd('tasks', 1); } }
        else if (t.counted === undefined) t.counted = true;
        else if (t.counted && t.doneDay === dayKey()) { d.tasks = Math.max(0, d.tasks - 1); S.total.tasks = Math.max(0, S.total.tasks - 1); t.counted = false; duelAdd('tasks', -1); }
        /* XP e moedas só na primeira vez (desmarcar e marcar de novo não paga de novo) */
        if (t.done) { happyUntil = Date.now() + 2000; if (!t.paid) { t.paid = true; gainXP(3); earn(2); } }
        save(); render(); checkAch(); renderProgress();
      };
      const tx = document.createElement('span'); tx.className = 'txt'; tx.dataset.noi18n = ''; tx.textContent = t.text;
      const del = document.createElement('button'); del.className = 'del'; del.textContent = '×';
      del.setAttribute('aria-label', 'Excluir ' + t.text);
      del.onclick = e => { e.stopPropagation(); S.tasks = S.tasks.filter(x => x !== t); S.deleted[t.id] = Date.now(); if (S.active === t.id) S.active = null; save(); render(); };
      li.append(cb, tx, del); ul.appendChild(li);
    });
  }
  function renderProgress() {
    const n = levelOf(S.xp), [ic, nm] = levelInfo(n), a = xpFor(n), b = xpFor(n + 1);
    const pct = Math.round((S.xp - a) / (b - a) * 100), st = streak();
    $('lvlIc').textContent = ic; $('lvlNm').textContent = nm; $('lvlBar').style.width = pct + '%';
    $('lvlStreak').textContent = st ? '🔥 ' + st : '';
    $('pgIc').textContent = ic; $('pgNm').textContent = nm; $('pgLv').textContent = T('nível {n}', {n});
    $('pgBar').style.width = pct + '%';
    $('pgXp').textContent = T('{a} / {b} xp até o nível {n}', {a:S.xp - a, b:b - a, n:n + 1});
    let nx = null;
    for (let l = n + 1; l <= 12 && !nx; l++) { const u = unlocksAt(l); if (u.length) nx = T('🔓 no nível {n}: {list}', {n:l, list:u.join(', ')}); }
    $('pgNext').textContent = nx || '🎉 você já desbloqueou todos os cenários e bichinhos';
    $('pgStreak').textContent = st ? (st > 1 ? T('🔥 {n} dias seguidos de foco', {n:st}) : T('🔥 1 dia de foco')) : '🔥 faça um pomodoro hoje pra começar sua sequência';
    const box = $('ach'); box.innerHTML = ''; let got = 0;
    ACH.forEach(x => {
      const on = !!S.ach[x.id]; if (on) got++;
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'badge ' + (on ? 'got' : 'lock'); b.textContent = x.ic;
      b.setAttribute('aria-label', `${T(x.nm)}: ${T(x.ds)}${on ? ' ✓' : ''}`);
      b.onclick = b.onmouseenter = b.onfocus = () => { $('achInfo').innerHTML = `<b>${x.ic} ${T(x.nm)}</b> · ${T(x.ds)}${on ? ' ✓' : ''}`; };
      box.appendChild(b);
    });
    $('achCount').textContent = T('{a} de {b}', {a:got, b:ACH.length});
  }
  function renderCollection() {
    const n = levelOf(S.xp), lk = look();
    const tb = $('themes'); tb.innerHTML = '';
    /* primeiro os de nível, depois os que se compram com moedas */
    Object.entries(Scenes.THEMES).sort((a, b) => (a[1].price || 0) - (b[1].price || 0) || a[1].level - b[1].level).forEach(([id, t]) => {
      const forSale = !!t.price && !S.owned.includes('scene:' + id);
      const locked = n < t.level, sel = S.theme === id, b = document.createElement('button'); b.type = 'button';
      b.className = 'item' + (sel ? ' sel' : '') + (locked ? ' lock' : '') + (forSale ? ' forsale' : ''); b.disabled = locked;
      const sw = t.sky(lk === 'dia').map(([p, c]) => `${c} ${Math.round(p * 100)}%`).join(',');
      b.innerHTML = `<span class="sw" style="background:linear-gradient(${sw})"></span><span>${t.name}</span><span class="lk">${locked ? T('🔒 nível {n}', {n:t.level}) : forSale ? '🪙 ' + t.price : sel ? 'usando' : ''}</span>`;
      if (forSale && coins() < t.price) b.classList.add('short');
      b.onclick = () => {
        if (forSale) {
          if (coins() < t.price) { toast(`<b>🪙 ${T('faltam {n} moedas', {n:t.price - coins()})}</b>termine pomodoros, missões e conquistas para ganhar mais.`); return; }
          S.owned.push('scene:' + id); renderCoins(true);
          toast(`<b>🏞️ cenário novo!</b>${T(t.name)}`);
        }
        S.theme = id; if (!S.themesUsed.includes(id)) S.themesUsed.push(id);
        save(); Scenes.set(id); renderCollection(); renderThemeSounds(); checkAch();
      };
      tb.appendChild(b);
    });
    const pb = $('pets'); pb.innerHTML = '';
    /* organizados por grupo (bichinhos primeiro); o título só aparece quando existe mais de um grupo */
    const groupOf = p => p.group || '🐾 bichinhos', groups = [...new Set(Pets.LIST.map(groupOf))];
    groups.flatMap(g => [g, ...Pets.LIST.filter(p => groupOf(p) === g)]).forEach(p => {
      if (typeof p === 'string') {
        if (groups.length < 2) return;
        const h = document.createElement('h4'); h.className = 'petgroup'; h.dataset.noi18n = ''; h.textContent = p.replace(/^(\S+) (.+)$/, (a, ic, nm) => ic + ' ' + T(nm));
        pb.appendChild(h); return;
      }
      const forSale = !!p.price && !ownsPet(p.id);
      const locked = n < p.level, sel = S.pet === p.id, b = document.createElement('button'); b.type = 'button';
      b.className = 'item' + (sel ? ' sel' : '') + (locked ? ' lock' : '') + (forSale ? ' forsale' : '') + (forSale && coins() < p.price ? ' short' : ''); b.disabled = locked;
      b.innerHTML = `<canvas width="16" height="16" aria-hidden="true"></canvas><span>${p.name}</span><span class="lk">${locked ? T('🔒 nível {n}', {n:p.level}) : forSale ? '🪙 ' + p.price : sel ? 'companhia' : ''}</span>`;
      Pets.draw(b.querySelector('canvas'), p.id, true, petColor(p.id), S.petOutfits[p.id]);
      b.onclick = () => {
        if (forSale) {
          if (coins() < p.price) { toast(`<b>🪙 ${T('faltam {n} moedas', {n:p.price - coins()})}</b>termine pomodoros, missões e conquistas para ganhar mais.`); return; }
          S.owned.push(`pet:${p.id}@${p.price}`); renderCoins(true);
          toast(`<b>🌟 ${T('personagem novo!')}</b>${p.ic} ${T(p.name)}`);
        }
        S.pet = p.id; if (!S.petsUsed.includes(p.id)) S.petsUsed.push(p.id); save(); petKey = ''; renderCollection(); checkAch(); };
      pb.appendChild(b);
    });
    renderPetColors();
    renderPlants();
    if ($('shopItems')) renderShop();
  }
  function renderPlants() {
    const box = $('plants'); box.innerHTML = '';
    PLANTS.forEach(p => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'plant';
      b.setAttribute('aria-pressed', plantOf(S.plant).id === p.id);
      b.innerHTML = `<span class="pic" aria-hidden="true">${p.ic}</span><span>${p.nm}</span>`;
      b.onclick = () => {
        if (S.plant === p.id) return;
        S.plant = p.id; save(); renderPlants(); render(); renderProgress();
        toast(`<b>${p.ic} ${T('agora você planta {p}', {p:T(p.nm)})}</b>${T('cada pomodoro vira uma plantinha no "hoje".')}`);
      };
      box.appendChild(b);
    });
  }
  const COLORS = [
    {id:'laranja', nm:'laranja', noite:['#F2B872','#9CC5A1','#B9A8EC'], dia:['#C47A26','#3F8050','#7059C4']},
    {id:'roxo', nm:'roxo', noite:['#B99AF5','#8FD3C8','#F2A7C8'], dia:['#7B4FD1','#2E8A7E','#C0508A']},
    {id:'azul', nm:'azul', noite:['#7FB4F5','#A8E0C0','#C3A8F0'], dia:['#2F6FC4','#2E8A5E','#6A55C0']},
    {id:'rosa', nm:'rosa', noite:['#F4A3C0','#9CD5C5','#C9B0F2'], dia:['#C4497A','#2E8A7E','#7059C4']},
    {id:'verde', nm:'verde', noite:['#8FD19E','#8EC5F0','#E8C27A'], dia:['#2F8A4A','#2F6FC4','#B07A1E']},
    {id:'tomate', nm:'tomate', noite:['#F27A6B','#9CC5A1','#B9A8EC'], dia:['#C8412F','#3F8050','#7059C4']},
    {id:'branco', nm:'branco', noite:['#F4F1F8','#CFE8DA','#DCD3F5'], dia:['#2B2540','#3F6B55','#4F4380']}
  ];
  function renderColors() {
    const cur = document.documentElement.dataset.color || 'laranja', box = $('colors'); box.innerHTML = '';
    COLORS.forEach(c => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'color';
      b.setAttribute('aria-pressed', cur === c.id);
      b.innerHTML = `<span class="dots">${c[look()].map(x => `<i style="background:${x}"></i>`).join('')}</span>${c.nm}`;
      b.onclick = () => {
        if (c.id === 'laranja') delete document.documentElement.dataset.color; else document.documentElement.dataset.color = c.id;
        try { localStorage.setItem('pomodoro-color', c.id === 'laranja' ? '' : c.id); } catch (e) {}
        renderColors();
      };
      box.appendChild(b);
    });
  }
  function renderThemeSounds() {
    const ids = Scenes.THEMES[S.theme].sounds[look()];
    $('themeSndList').textContent = ids.map(id => Sounds.info(id).ic).join(' ');
  }

  let calOff = 0;
  const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  function renderHistory() {
    $('hTot').textContent = S.total.pomos; $('hHours').textContent = fmtMin(totalMin()); $('hBest').textContent = maxDay();
    const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
    const recs = days.map(d => S.history[dayKey(d)] || {}), vals = recs.map(r => r.pomos || 0), max = Math.max(4, ...vals);
    $('week').innerHTML = days.map((d, i) => `<div class="wk${i === 6 ? ' today' : ''}"><span class="n">${vals[i] || ''}</span><span class="t"><span class="b" style="height:${vals[i] / max * 100}%"></span></span><span class="d">${i === 6 ? 'hoje' : WD[d.getDay()]}</span></div>`).join('');
    const wp = vals.reduce((a, b) => a + b, 0), wm = recs.reduce((a, r) => a + (r.min || 0), 0);
    $('weekTot').textContent = wp ? T(wp > 1 ? '{p} pomodoros · {m} de foco nos últimos 7 dias' : '{p} pomodoro · {m} de foco nos últimos 7 dias', {p:wp, m:fmtMin(wm)}) : 'nenhum pomodoro nos últimos 7 dias ainda';

    const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + calOff);
    $('calTitle').textContent = base.toLocaleDateString(LOC(), {month:'long', year:'numeric'});
    let html = (window.I18N ? I18N.dayLetters : ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']).map(x => `<span class="dw" data-noi18n>${x}</span>`).join('');
    for (let i = 0; i < base.getDay(); i++) html += '<span></span>';
    const dim = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate(), tk = dayKey();
    for (let dd = 1; dd <= dim; dd++) {
      const k = dayKey(new Date(base.getFullYear(), base.getMonth(), dd)), p = (S.history[k] || {}).pomos || 0;
      const lv = p >= 6 ? 3 : p >= 3 ? 2 : p >= 1 ? 1 : 0;
      html += `<span class="c l${lv}${k === tk ? ' today' : ''}" title="${T(p === 1 ? 'dia {d}: {p} pomodoro' : 'dia {d}: {p} pomodoros', {d:dd, p})}">${dd}</span>`;
    }
    $('cal').innerHTML = html;
    $('calNext').disabled = calOff >= 0;

    const sum = {};
    for (let i = 0; i < 30; i++) { const d = new Date(); d.setDate(d.getDate() - i); const a = (S.history[dayKey(d)] || {}).act || {}; for (const k in a) sum[k] = (sum[k] || 0) + a[k]; }
    const rows = Object.entries(sum).sort((a, b) => b[1] - a[1]), top = rows.length ? rows[0][1] : 1;
    $('actBars').innerHTML = rows.length
      ? rows.map(([k, m]) => { const a = actOf(k); return `<div class="ab"><span class="an">${a.ic} ${a.nm}</span><span class="at"><i style="width:${m / top * 100}%"></i></span><span class="av">${fmtMin(m)}</span></div>`; }).join('')
      : '<p class="empty">quando você completar pomodoros, aparece aqui no que você mais focou.</p>';
  }

  /* ---------- bichinho ---------- */
  let petKey = '', blinkUntil = 0, nextBlink = Date.now() + 3000;
  function petTick() {
    const now = Date.now();
    const state = now < happyUntil ? 'happy' : mode !== 'focus' ? 'sleep' : running ? 'focus' : 'idle';
    if (now > nextBlink) { blinkUntil = now + 160; nextBlink = now + 2500 + Math.random() * 4000; }
    const open = state !== 'sleep' && now > blinkUntil;
    /* personagem de faca: a faca levanta e dá a facada (dormindo, fica quieta) */
    const knife = Pets.hasKnife(petId()) && state !== 'sleep' ? Pets.knifeFrame(now) : 0;
    /* personagem animado (GIF): dormindo fica parado no 1º quadro, de olho fechado */
    const frame = state === 'sleep' ? 0 : Pets.frameOf(petId(), now);
    const key = [petId(), state, open, S.activity, JSON.stringify(S.petOutfits[petId()] || {}), petColor(petId()), knife, frame].join('|');
    renderSprout();
    if (key === petKey) return;
    petKey = key;
    Pets.draw($('petCanvas'), petId(), open, petColor(petId()), S.petOutfits[petId()], knife, frame, state === 'sleep');
    $('pet').className = 'pet ' + state;
    $('petBubble').textContent = state === 'happy' ? '♥' : state === 'sleep' ? 'z z z' : state === 'focus' ? actOf(S.activity).ic : '♪';
  }
  setInterval(petTick, 120);

  /* ---------- música (Spotify / YouTube) ---------- */
  function embedFor(url) {
    url = (url || '').trim();
    let m = url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|track|artist|episode|show)\/([A-Za-z0-9]+)/);
    if (m) return {kind:'spotify', type:m[1], id:m[2], h:m[1] === 'track' || m[1] === 'episode' ? 152 : 352};
    const ch = url.match(/youtube\.com\/(?:channel\/|embed\/live_stream\?channel=)(UC[A-Za-z0-9_-]{22})/);
    if (ch) return {kind:'youtube', channel:ch[1]};
    const list = url.match(/[?&]list=([A-Za-z0-9_-]+)/);
    m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|shorts\/|embed\/))([A-Za-z0-9_-]{11})/);
    if (m) return {kind:'youtube', id:m[1], list:list && list[1]};
    if (list && /youtube\.com/.test(url)) return {kind:'youtube', id:null, list:list[1]};
    return null;
  }

  /* os players oficiais do Spotify e do YouTube deixam o site dar play e pause */
  const loadScript = src => new Promise((ok, fail) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s);
  });
  const spotifyReady = new Promise(ok => { window.onSpotifyIframeApiReady = api => ok(api); });
  const ytReady = new Promise(ok => { window.onYouTubeIframeAPIReady = () => ok(window.YT); });
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(no, ms))]);
  let music = null, lastWant = null;

  function ytSrc(e) {
    const q = 'enablejsapi=1&rel=0&playsinline=1' + (location.origin.startsWith('http') ? '&origin=' + encodeURIComponent(location.origin) : '');
    if (e.channel) return `https://www.youtube.com/embed/live_stream?channel=${e.channel}&${q}`;
    if (e.id) return `https://www.youtube.com/embed/${e.id}?${q}` + (e.list ? `&list=${e.list}` : '');
    return `https://www.youtube.com/embed/videoseries?list=${e.list}&${q}`;
  }
  function plainIframe(box, e) {
    const src = e.kind === 'spotify' ? `https://open.spotify.com/embed/${e.type}/${e.id}` : ytSrc(e);
    box.innerHTML = `<iframe id="mp" src="${esc(src)}" ${e.kind === 'spotify' ? `height="${e.h}"` : ''} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="Player de música"></iframe>`;
  }
  function showMusic(url, fromUser) {
    const box = $('player'), msg = $('musicMsg');
    music = null; lastWant = null;
    if (!url) { box.innerHTML = ''; box.hidden = true; $('closeMusic').hidden = true; msg.className = 'musicmsg'; msg.textContent = 'cole o link de uma playlist ou música do Spotify, ou de um vídeo ou playlist do YouTube.'; return; }
    const e = embedFor(url);
    if (!e) { msg.className = 'musicmsg err'; msg.textContent = 'não reconheci esse link. use um link do Spotify (open.spotify.com/...) ou do YouTube (youtube.com/... ou youtu.be/...).'; return; }
    S.music = url;
    if (fromUser && !S.flags.music) { S.flags.music = true; setTimeout(checkAch, 500); }
    save();
    box.hidden = false; $('closeMusic').hidden = false;
    box.classList.toggle('yt', e.kind === 'youtube');
    box.innerHTML = '<div id="mp"></div>';
    const me = music = {kind:e.kind, ctl:null, playing:false, started:false};
    const ready = () => { if (music === me) { lastWant = null; musicSync(); } };
    if (e.kind === 'spotify') {
      withTimeout(loadScript('https://open.spotify.com/embed/iframe-api/v1').then(() => spotifyReady), 8000).then(api => {
        if (music !== me) return;
        api.createController($('mp'), {uri:`spotify:${e.type}:${e.id}`, width:'100%', height:e.h}, ctl => {
          me.ctl = ctl;
          ctl.addListener('playback_update', ev => { me.playing = !ev.data.isPaused; if (me.playing) me.started = true; });
          ready();
        });
      }).catch(() => { if (music === me) plainIframe(box, e); });
    } else {
      plainIframe(box, e);
      withTimeout(loadScript('https://www.youtube.com/iframe_api').then(() => ytReady), 8000).then(YT => {
        if (music !== me) return;
        const p = new YT.Player('mp', {events:{onReady:() => { me.ctl = p; ready(); }, onStateChange:ev => { me.playing = ev.data === 1; }}});
      }).catch(() => {});
    }
    msg.className = 'musicmsg';
    msg.textContent = e.kind === 'spotify' ? 'dica: entre na sua conta do Spotify neste navegador para ouvir as músicas inteiras.' : 'o vídeo continua tocando enquanto você usa o pomodoro.';
    if (fromUser) $('musicUrl').value = '';
  }
  function musicSync() {
    if (!S.musicAuto || !music || !music.ctl) return;
    const want = running && (mode === 'focus' || S.musicBreaks);
    if (want === lastWant) return;
    lastWant = want;
    try {
      if (music.kind === 'spotify') {
        if (want) { music.started ? music.ctl.resume() : music.ctl.play(); music.started = true; }
        else if (music.playing) music.ctl.pause();
      } else if (want) music.ctl.playVideo(); else music.ctl.pauseVideo();
    } catch (err) {}
  }
  function renderMusicAuto() {
    $('musicAuto').checked = S.musicAuto; $('musicBreaks').checked = S.musicBreaks;
    $('musicBreaks').disabled = !S.musicAuto;
    $('musicBreaksRow').classList.toggle('off', !S.musicAuto);
  }

  /* ---------- lembrete de água: o bichinho aparece no meio da tela com um sininho ---------- */
  const WKEY = 'pomodoro-water-next';
  let waterNext = 0;
  try { waterNext = +localStorage.getItem(WKEY) || 0; } catch (e) {}
  function scheduleWater(ms) {
    waterNext = Date.now() + (ms != null ? ms : S.settings.waterEvery * 60000);
    try { localStorage.setItem(WKEY, String(waterNext)); } catch (e) {}
  }
  function bell() {
    const vol = Math.max(0, Math.min(1, S.settings.waterVol ?? .7));
    if (!ac() || vol <= 0) return;
    [0, .32].forEach(d => [1, 2.4, 3.9].forEach((m, i) => {
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + d;
      o.type = 'sine'; o.frequency.value = 1320 * m;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, [.32, .1, .045][i] * vol), t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 1.1 - i * .25);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 1.2);
    }));
  }
  let waterIsTest = false;
  function showWater(test) {
    waterIsTest = !!test;
    const pet = Pets.LIST.find(p => p.id === S.pet) || Pets.LIST[0];
    Pets.draw($('waterPet'), pet.id, true, petColor(pet.id), S.petOutfits[pet.id]);
    $('waterSub').textContent = T('{pet} veio lembrar: um golinho agora e você foca melhor.', {pet:pet.ic + ' ' + T(pet.name)});
    const n = (S.history[dayKey()] || {}).water || 0;
    $('waterCount').textContent = waterIsTest ? '🔔 isto é só um teste: o copo não conta.'
      : n ? T(n > 1 ? 'hoje: {drops} {n} copos' : 'hoje: {drops} {n} copo', {drops:'💧'.repeat(Math.min(n, 12)), n}) : 'nenhum copo marcado hoje ainda';
    $('waterPop').hidden = false; $('waterPop').classList.remove('show'); void $('waterPop').offsetWidth; $('waterPop').classList.add('show');
    bell(); notify(T('💧 hora de beber água!'), T('{pet} veio lembrar.', {pet:pet.ic + ' ' + T(pet.name)}));
    setTimeout(() => $('waterDone').focus(), 50);
  }
  function hideWater() { $('waterPop').hidden = true; }
  setInterval(() => {
    if (!S.settings.water || !$('waterPop').hidden) return;
    if (!waterNext) scheduleWater();
    if (Date.now() >= waterNext) { scheduleWater(); showWater(); }
  }, 1000);
  function renderWaterCfg() {
    $('cfg-water').checked = !!S.settings.water; $('cfg-waterEvery').value = String(S.settings.waterEvery);
    $('waterEveryRow').classList.toggle('off', !S.settings.water); $('cfg-waterEvery').disabled = !S.settings.water;
    $('cfg-waterVol').value = S.settings.waterVol ?? .7;
    $('waterVolVal').textContent = Math.round((S.settings.waterVol ?? .7) * 100) + '%';
  }
  function setWaterVol(v) {
    S.settings.waterVol = Math.round(Math.max(0, Math.min(1, v)) * 100) / 100;
    save(); renderWaterCfg();
  }

  /* ---------- relógios do mundo ---------- */
  const CITIES = [
    ['America/Manaus', 'Manaus', '🇧🇷'], ['America/Sao_Paulo', 'Brasília', '🇧🇷'], ['America/Rio_Branco', 'Acre', '🇧🇷'], ['America/Noronha', 'Fernando de Noronha', '🇧🇷'],
    ['America/New_York', 'Nova York', '🇺🇸'], ['America/Chicago', 'Chicago', '🇺🇸'], ['America/Denver', 'Denver', '🇺🇸'], ['America/Los_Angeles', 'Los Angeles', '🇺🇸'],
    ['America/Mexico_City', 'Cidade do México', '🇲🇽'], ['America/Argentina/Buenos_Aires', 'Buenos Aires', '🇦🇷'], ['America/Santiago', 'Santiago', '🇨🇱'],
    ['Europe/Lisbon', 'Lisboa', '🇵🇹'], ['Europe/London', 'Londres', '🇬🇧'], ['Europe/Madrid', 'Madri', '🇪🇸'], ['Europe/Paris', 'Paris', '🇫🇷'],
    ['Europe/Berlin', 'Berlim', '🇩🇪'], ['Europe/Rome', 'Roma', '🇮🇹'], ['Africa/Luanda', 'Luanda', '🇦🇴'], ['Asia/Dubai', 'Dubai', '🇦🇪'],
    ['Asia/Bangkok', 'Bangkok', '🇹🇭'], ['Asia/Shanghai', 'Pequim', '🇨🇳'], ['Asia/Seoul', 'Seul', '🇰🇷'], ['Asia/Tokyo', 'Tóquio', '🇯🇵'], ['Australia/Sydney', 'Sydney', '🇦🇺']
  ];
  function tzOffsetMin(tz, now) {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone:tz, hourCycle:'h23', year:'numeric', month:'numeric', day:'numeric', hour:'numeric', minute:'numeric'}).formatToParts(now).map(x => [x.type, x.value]));
    return Math.round((Date.UTC(+p.year, p.month - 1, +p.day, +p.hour % 24, +p.minute) - now.getTime()) / 60000 / 15) * 15;
  }
  /* a faixa de relógios fica no topo; a lista para escolher as cidades fica no ⚙ ajustes */
  function renderClocks() {
    const now = new Date(), mine = -now.getTimezoneOffset(), ul = $('clockList'), strip = $('clockStrip');
    const valid = (S.clocks || []).filter(tz => CITIES.some(c => c[0] === tz));
    ul.innerHTML = valid.length ? '' : '<li class="empty">adicione uma cidade abaixo.</li>';
    strip.innerHTML = ''; strip.hidden = !valid.length;
    valid.forEach(tz => {
      const [, name, flag] = CITIES.find(c => c[0] === tz);
      let time = '--:--', hour = 12, diff = 0;
      try {
        time = new Intl.DateTimeFormat('pt-BR', {timeZone:tz, hour:'2-digit', minute:'2-digit', hourCycle:'h23'}).format(now);
        hour = +new Intl.DateTimeFormat('en-US', {timeZone:tz, hour:'numeric', hourCycle:'h23'}).format(now);
        diff = tzOffsetMin(tz, now) - mine;
      } catch (e) {}
      const dh = diff / 60, dtxt = diff === 0 ? 'mesma hora' : (dh > 0 ? '+' : '') + (Number.isInteger(dh) ? dh : dh.toFixed(1).replace('.', ',')) + 'h';
      const icon = hour >= 6 && hour < 18 ? '☀' : '🌙';
      const chip = document.createElement('div'); chip.className = 'wc'; chip.title = dtxt;
      chip.innerHTML = `<span class="cf" aria-hidden="true">${flag}</span><b></b><span class="ct">${icon} ${time}</span>`;
      chip.querySelector('b').textContent = name; strip.appendChild(chip);
      const li = document.createElement('li');
      li.innerHTML = `<span class="cf" aria-hidden="true">${flag}</span><span class="cn"><b></b><small>${dtxt}</small></span><span class="ct">${icon} ${time}</span>`;
      li.querySelector('b').textContent = name;
      const del = document.createElement('button'); del.type = 'button'; del.className = 'del'; del.textContent = '×'; del.setAttribute('aria-label', 'Tirar ' + name);
      del.onclick = () => { S.clocks = S.clocks.filter(x => x !== tz); save(); renderClocks(); };
      li.appendChild(del); ul.appendChild(li);
    });
    const sel = $('clockAdd'), keep = sel.value;
    sel.innerHTML = '<option value="">+ adicionar cidade</option>' + CITIES.filter(c => !valid.includes(c[0])).map(c => `<option value="${c[0]}">${c[2]} ${c[1]}</option>`).join('');
    if ([...sel.options].some(o => o.value === keep)) sel.value = keep;
  }
  setInterval(() => { if (!document.hidden) renderClocks(); }, 20000);
  /* horário local ao lado de "hoje" */
  function renderNow() { $('nowClock').textContent = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit', hourCycle:'h23'}); }
  renderNow(); setInterval(renderNow, 1000);

  /* ---------- metrônomo ---------- */
  const M = Sounds.metro;
  const TEMPO = b => b < 60 ? 'Largo' : b < 66 ? 'Larghetto' : b < 76 ? 'Adagio' : b < 108 ? 'Andante' : b < 120 ? 'Moderato' : b < 168 ? 'Allegro' : b < 200 ? 'Presto' : 'Prestissimo';
  function renderMetro() {
    const s = M.get();
    $('bpmVal').textContent = s.bpm; $('bpmRange').value = s.bpm; $('metroName').textContent = TEMPO(s.bpm);
    $('metroSound').value = s.sound || 'relogio'; $('metroSub').value = String(s.sub || 1); $('metroAccent').checked = s.accent !== false;
    $('metroBeats').value = String(s.beats); $('metroVol').value = s.vol; $('metroVolVal').textContent = Math.round(s.vol * 100) + '%';
    if ($('metroDots').children.length !== s.beats)
      $('metroDots').innerHTML = Array.from({length:s.beats}, (_, i) => `<i class="${i === 0 && s.beats > 1 ? 'acc' : ''}"></i>`).join('');
    $('metroToggle').textContent = M.isOn() ? '⏸ parar metrônomo' : '▶ ligar metrônomo';
    $('metroPanel').classList.toggle('on', M.isOn());
  }
  M.onBeat(b => { [...$('metroDots').children].forEach((d, i) => d.classList.toggle('hit', i === b)); });
  const metroSet = p => { M.set(p); renderMetro(); };
  let holdT = null;
  const hold = (id, d) => {
    const step = () => metroSet({bpm:M.get().bpm + d});
    $(id).onpointerdown = e => { e.preventDefault(); step(); holdT = setTimeout(function rep() { step(); holdT = setTimeout(rep, 70); }, 420); };
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => $(id).addEventListener(ev, () => clearTimeout(holdT)));
    $(id).onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); step(); } };
  };
  hold('bpmDown', -1); hold('bpmUp', 1);
  $('bpmRange').oninput = e => metroSet({bpm:+e.target.value});
  $('metroBeats').onchange = e => metroSet({beats:+e.target.value});
  $('metroSound').onchange = e => { metroSet({sound:e.target.value}); if (!M.isOn()) M.preview(e.target.value); };
  $('metroSub').onchange = e => metroSet({sub:+e.target.value});
  $('metroAccent').onchange = e => metroSet({accent:e.target.checked});
  $('metroVol').oninput = e => metroSet({vol:+e.target.value});
  $('metroVolDown').onclick = () => metroSet({vol:Math.round((M.get().vol - .1) * 100) / 100});
  $('metroVolUp').onclick = () => metroSet({vol:Math.round((M.get().vol + .1) * 100) / 100});
  let taps = [];
  $('tapBtn').onclick = () => {
    const now = performance.now();
    taps = taps.filter(x => now - x < 2500); taps.push(now); if (taps.length > 6) taps.shift();
    if (taps.length >= 2) metroSet({bpm:60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1))});
  };
  $('metroToggle').onclick = () => {
    if (!S.flags.metro) { S.flags.metro = true; save(); setTimeout(checkAch, 300); }
    if (M.isOn()) { M.stop(); [...$('metroDots').children].forEach(d => d.classList.remove('hit')); } else M.start();
    renderMetro();
  };

  /* ---------- pintar o bichinho ---------- */
  const petColor = id => (S.petColors || {})[id] || null;
  /* roupinha que o bichinho está usando (só peças que existem), para o perfil do ranking */
  const outfitOf = id => { const o = S.petOutfits[id] || {}, out = {}; Pets.SLOTS.forEach(s => { if (typeof o[s] === 'string' && o[s]) out[s] = o[s].slice(0, 30); }); return out; };
  /* bichinho que este site conhece (a mesma conta pode ter escolhido um personagem que só existe na cópia dos fãs) */
  function petId() { return Pets.LIST.some(p => p.id === S.pet) ? S.pet : Pets.LIST[0].id; }
  function renderPetColors() {
    const box = $('petColors'); box.innerHTML = '';
    /* personagem especial tem as cores dele: não dá para pintar */
    const special = Pets.isSpecial(petId());
    box.hidden = special; box.previousElementSibling.hidden = special;
    if (special) return;
    const cur = petColor(petId());
    const add = (color, label) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'swatch' + (color ? '' : ' orig');
      if (color) b.style.background = color; else b.textContent = '↺';
      b.setAttribute('aria-pressed', cur === color); b.setAttribute('aria-label', label); b.title = label;
      b.onclick = () => {
        if (color) S.petColors[petId()] = color; else delete S.petColors[petId()];
        S.flags.petcolor = true; save(); petKey = ''; renderCollection(); checkAch();
      };
      box.appendChild(b);
    };
    add(null, 'cor original');
    Pets.COLORS.forEach(([label, c]) => add(c, label));
  }

  /* ---------- diário e notas ---------- */
  const MOODS = [['otimo', '😄', 'ótimo'], ['bem', '🙂', 'bem'], ['ok', '😐', 'mais ou menos'], ['triste', '😔', 'triste'], ['cansado', '😫', 'cansado']];
  let dOff = 0, noteSel = null, diaryTimer = null, noteDelArmed = false;
  const dateAt = off => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + off); return d; };
  const offOfKey = k => { const [y, m, d] = k.split('-').map(Number); const a = new Date(y, m - 1, d, 12), b = dateAt(0); return Math.round((a - b) / 864e5); };
  function savedLater(el) {
    $(el).textContent = 'salvando…';
    clearTimeout(diaryTimer);
    diaryTimer = setTimeout(() => { save(); $(el).textContent = 'salvo ✓'; checkAch(); }, 600);
  }
  function writeDiary(patch) {
    const k = dayKey(dateAt(dOff));
    const e = Object.assign({}, S.journal[k], patch, {updated:Date.now()});
    if (!(e.text || '').trim() && !e.mood) delete S.journal[k]; else S.journal[k] = e;
    store(); savedLater('diarySaved');
  }
  function renderDiary() {
    const d = dateAt(dOff), k = dayKey(d), e = S.journal[k] || {};
    $('dDate').textContent = dOff === 0 ? T('hoje, {date}', {date:d.toLocaleDateString(LOC(), {day:'numeric', month:'long'})}) : d.toLocaleDateString(LOC(), {weekday:'long', day:'numeric', month:'long'});
    $('dNext').disabled = dOff >= 0;
    $('moods').innerHTML = '';
    MOODS.forEach(([id, ic, nm]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'moodbtn';
      b.textContent = ic; b.title = nm; b.setAttribute('aria-label', 'humor: ' + nm); b.setAttribute('aria-pressed', e.mood === id);
      b.onclick = () => { writeDiary({mood:e.mood === id ? '' : id}); renderDiary(); };
      $('moods').appendChild(b);
    });
    if (document.activeElement !== $('dText')) $('dText').value = e.text || '';
    const list = Object.entries(S.journal).filter(([key, v]) => v && ((v.text || '').trim() || v.mood) && key !== k)
      .sort((a, b) => offOfKey(b[0]) - offOfKey(a[0])).slice(0, 12);
    $('dList').innerHTML = list.length ? '' : '<li class="empty">seus dias escritos aparecem aqui.</li>';
    list.forEach(([key, v]) => {
      const li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
      const mood = MOODS.find(m => m[0] === v.mood), dd = dateAt(offOfKey(key));
      b.innerHTML = `<span class="dm">${mood ? mood[1] : '📝'}</span><b>${dd.toLocaleDateString(LOC(), {day:'numeric', month:'short'})}</b><span class="dt" data-noi18n></span>`;
      b.querySelector('.dt').textContent = (v.text || '').trim().slice(0, 80);
      b.onclick = () => { dOff = offOfKey(key); renderDiary(); $('dText').focus(); };
      li.appendChild(b); $('dList').appendChild(li);
    });
  }
  function renderNotes() {
    const notes = S.notes.slice().sort((a, b) => (b.updated || 0) - (a.updated || 0));
    if (!notes.find(n => n.id === noteSel)) noteSel = notes.length ? notes[0].id : null;
    $('nList').innerHTML = notes.length ? '' : '<li class="empty">nenhuma nota ainda.</li>';
    notes.forEach(n => {
      const li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
      b.className = n.id === noteSel ? 'sel' : '';
      b.innerHTML = '<b></b><small></small>';
      const nb = b.querySelector('b'), label = n.title || (n.text || '').split('\n')[0].slice(0, 40);
      if (label) nb.dataset.noi18n = '';
      nb.textContent = label || 'nota sem título';
      b.querySelector('small').textContent = new Date(n.updated || Date.now()).toLocaleDateString(LOC(), {day:'numeric', month:'short'});
      b.onclick = () => { noteSel = n.id; noteDelArmed = false; renderNotes(); };
      li.appendChild(b); $('nList').appendChild(li);
    });
    const n = S.notes.find(x => x.id === noteSel);
    $('nEdit').hidden = !n;
    if (n) {
      if (document.activeElement !== $('nTitle')) $('nTitle').value = n.title || '';
      if (document.activeElement !== $('nText')) $('nText').value = n.text || '';
      $('nDel').textContent = noteDelArmed ? 'clique de novo para apagar' : 'apagar nota';
    }
  }
  function editNote(patch) {
    const n = S.notes.find(x => x.id === noteSel); if (!n) return;
    Object.assign(n, patch, {updated:Date.now()}); store(); savedLater('diarySaved');
    const btn = $('nList').querySelector('button.sel b');
    if (btn) btn.textContent = n.title || (n.text || '').split('\n')[0].slice(0, 40) || 'nota sem título';
  }
  function showDiaryTab(tab) {
    $('tabDiary').setAttribute('aria-selected', tab === 'diary'); $('tabNotes').setAttribute('aria-selected', tab === 'notes');
    $('diaryView').hidden = tab !== 'diary'; $('notesView').hidden = tab !== 'notes';
    tab === 'diary' ? renderDiary() : renderNotes();
  }

  /* ---------- rotinas ---------- */
  const ROUTINES = [
    {id:'classico', nm:'🍅 clássico', ds:'25 foco · 5 pausa · 15 a cada 4', v:{focus:25, short:5, long:15, every:4}},
    {id:'meio', nm:'⚖️ meio a meio', ds:'25 foco · 25 pausa', v:{focus:25, short:25, long:25, every:4}},
    {id:'profundo', nm:'🧠 foco profundo', ds:'50 foco · 10 pausa · 30 a cada 3', v:{focus:50, short:10, long:30, every:3}},
    {id:'5217', nm:'📈 52/17', ds:'52 foco · 17 pausa', v:{focus:52, short:17, long:17, every:4}},
    {id:'ultra', nm:'🌊 ultradiano', ds:'90 foco · 20 pausa · 30 a cada 2', v:{focus:90, short:20, long:30, every:2}},
    {id:'leve', nm:'🐣 leve', ds:'15 foco · 5 pausa', v:{focus:15, short:5, long:15, every:4}},
    {id:'custom', nm:'✏️ do meu jeito', ds:'monte sua própria sequência de foco e pausas'}
  ];
  const STEP_NM = {focus:'foco', short:'pausa', long:'pausa longa'};
  function applyRoutine() { S.seqIdx = 0; save(); if (!running) setMode('focus'); else render(); renderRoutines(); syncSettingsUI(); }
  function renderRoutines() {
    renderMyRoutines();
    const box = $('routines'); box.innerHTML = '';
    ROUTINES.forEach(r => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'routine';
      b.setAttribute('aria-pressed', S.settings.routine === r.id && !(r.id === 'custom' && S.settings.myId));
      b.innerHTML = `<b>${r.nm}</b><small>${r.ds}</small>`;
      b.onclick = () => { S.settings.routine = r.id; S.settings.myId = ''; if (r.v) Object.assign(S.settings, r.v); applyRoutine(); };
      box.appendChild(b);
    });
    const custom = S.settings.routine === 'custom';
    $('seqEditor').hidden = !custom; $('classicCfg').hidden = custom;
    if (!custom) return;
    const ol = $('steps'); ol.innerHTML = '';
    S.settings.steps.forEach((s, i) => {
      const li = document.createElement('li'); li.className = 'step t-' + s.t;
      const sel = document.createElement('select'); sel.setAttribute('aria-label', `tipo da etapa ${i + 1}`);
      Object.entries(STEP_NM).forEach(([v, l]) => { const o = document.createElement('option'); o.value = v; o.textContent = l; o.selected = s.t === v; sel.appendChild(o); });
      sel.onchange = () => { s.t = sel.value; stepsChanged(); };
      const num = document.createElement('input'); num.type = 'number'; num.min = 1; num.max = 180; num.value = s.m; num.setAttribute('aria-label', `minutos da etapa ${i + 1}`);
      num.onchange = () => { const v = Math.round(+num.value); if (v > 0) { s.m = Math.min(v, 180); stepsChanged(); } else num.value = s.m; };
      const del = document.createElement('button'); del.type = 'button'; del.className = 'del'; del.textContent = '×'; del.setAttribute('aria-label', `remover etapa ${i + 1}`);
      del.disabled = S.settings.steps.length <= 1;
      del.onclick = () => { S.settings.steps.splice(i, 1); if (S.seqIdx >= S.settings.steps.length) S.seqIdx = 0; stepsChanged(); };
      const n = document.createElement('span'); n.className = 'sn'; n.textContent = (i + 1) + '.';
      const u = document.createElement('span'); u.className = 'su'; u.textContent = 'min';
      li.append(n, sel, num, u, del); ol.appendChild(li);
    });
    const tot = S.settings.steps.reduce((a, s) => a + (+s.m || 0), 0), foc = S.settings.steps.filter(s => s.t === 'focus').reduce((a, s) => a + (+s.m || 0), 0);
    $('seqSum').textContent = T('{n} etapas · {t} no total · {f} de foco', {n:S.settings.steps.length, t:fmtMin(tot), f:fmtMin(foc)});
    $('seqLoop').checked = S.settings.loop;
  }
  function stepsChanged() { S.settings.myId = ''; save(); if (!running && remaining === total) setMode(null); else render(); renderRoutines(); }

  /* ---------- missões diárias e semanais: sorteadas pela data, iguais o dia todo ---------- */
  const hashStr = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const weekStart = (d = new Date()) => { const x = new Date(d); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  /* dias da semana até hoje (compara só a data: antes do meio-dia o dia de hoje também conta) */
  function weekDays(ws = weekStart()) { const out = [], now = new Date(); for (let i = 0; i < 7; i++) { const d = new Date(ws); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0); if (d <= now) out.push(dayKey(d)); } return out; }
  const sumDays = (keys, f) => keys.reduce((a, k) => a + f(S.history[k] || {}), 0);
  const favActs = () => { const s = {}; Object.values(S.history).forEach(d => Object.entries(d.act || {}).forEach(([k, v]) => { s[k] = (s[k] || 0) + v; })); return Object.entries(s).sort((a, b) => b[1] - a[1]).map(x => x[0]).filter(k => k !== 'outro'); };
  const MPOOL = {
    day:[
      {k:'pomos', ic:'🍅', t:'faça {n} pomodoros', n:[2, 3, 4], c:[10, 15, 20]},
      {k:'min', ic:'⏱️', t:'foque {n} minutos', n:[45, 60, 90], c:[10, 15, 20]},
      {k:'tasks', ic:'✅', t:'conclua {n} tarefas', n:[2, 3, 4], c:[10, 15, 20]},
      {k:'water', ic:'💧', t:'beba {n} copos de água', n:[4, 6, 8], c:[10, 15, 20], need:() => S.settings.water},
      {k:'act', ic:'🎯', t:'foque {n} min em {act}', n:[25, 50], c:[15, 20], need:() => favActs().length}
    ],
    week:[
      {k:'pomos', ic:'🍅', t:'faça {n} pomodoros na semana', n:[12, 20, 30], c:[40, 60, 80]},
      {k:'min', ic:'⏱️', t:'foque {h} horas na semana', n:[300, 480, 720], c:[40, 60, 80]},
      {k:'tasks', ic:'✅', t:'conclua {n} tarefas na semana', n:[5, 8, 12], c:[40, 50, 70]},
      {k:'days', ic:'📅', t:'foque em {n} dias diferentes', n:[3, 4, 5], c:[40, 60, 80]},
      {k:'water', ic:'💧', t:'beba {n} copos de água na semana', n:[25, 35, 45], c:[40, 50, 60], need:() => S.settings.water}
    ]
  };
  /* as missões do dia/semana ficam guardadas na primeira vez: ligar a água ou fazer o 1º pomodoro
     não troca a lista no meio do dia (senão dava para receber mais de 3) */
  function missionsFor(kind) {
    const key = kind === 'day' ? dayKey() : dayKey(weekStart()), saved = S.missionSet[kind];
    if (saved && saved.key === key && Array.isArray(saved.list)) return saved.list;
    const list = drawMissions(kind, key);
    S.missionSet[kind] = {key, list}; store();
    return list;
  }
  function drawMissions(kind, key) {
    const r = rng(hashStr(kind + key));
    const bag = MPOOL[kind].filter(m => !m.need || m.need()), out = [];
    while (out.length < 3 && bag.length) {
      const m = bag.splice(Math.floor(r() * bag.length), 1)[0], lv = Math.floor(r() * m.n.length);
      const acts = favActs(), act = m.k === 'act' ? acts[Math.floor(r() * Math.min(3, acts.length))] : null;
      out.push({id:`${kind}:${key}:${m.k}`, kind, k:m.k, ic:act ? actOf(act).ic : m.ic, t:m.t, n:m.n[lv], coins:m.c[Math.min(lv, m.c.length - 1)], act});
    }
    return out;
  }
  function progressOf(k, keys, act) {
    switch (k) {
      case 'pomos': return sumDays(keys, d => d.pomos || 0);
      case 'min': return sumDays(keys, d => act ? (d.act || {})[act] || 0 : d.min || 0);
      case 'tasks': return sumDays(keys, d => d.tasks || 0);
      case 'water': return sumDays(keys, d => d.water || 0);
      case 'act': return sumDays(keys, d => (d.act || {})[act] || 0);
      case 'days': return keys.filter(x => (S.history[x] || {}).pomos).length;
    }
    return 0;
  }
  const missionText = m => T(m.t, {n:m.n, h:m.n / 60, act:m.act ? T(actOf(m.act).nm) : ''});

  /* ---------- evento de Halloween: de 1º de outubro a 2 de novembro, todo ano ---------- */
  const EVENTS = {halloween:d => d.getMonth() === 9 || (d.getMonth() === 10 && d.getDate() <= 2)};
  const eventOn = id => !!EVENTS[id] && EVENTS[id](new Date());
  /* dias do evento até hoje (a partir de 1º de outubro deste ano) */
  function eventDays() {
    const out = [], d = new Date(new Date().getFullYear(), 9, 1, 12), now = new Date();
    while (d <= now && out.length < 40) { out.push(dayKey(d)); d.setDate(d.getDate() + 1); }
    return out;
  }
  const HW = [
    {k:'pomos', ic:'🎃', t:'faça {n} pomodoros no Halloween', n:13, coins:66},
    {k:'min', ic:'🕯️', t:'foque {h} horas no Halloween', n:360, coins:50},
    {k:'days', ic:'🦇', t:'foque em {n} dias diferentes no Halloween', n:7, coins:50},
    {k:'tasks', ic:'👻', t:'conclua {n} tarefas no Halloween', n:13, coins:40}
  ];
  const hwMissions = () => HW.map(m => Object.assign({}, m, {id:`hw:${new Date().getFullYear()}:${m.k}`, kind:'hw'}));
  function claimMission(m) {
    if (S.missionsClaimed[m.id]) return;
    S.missionsClaimed[m.id] = Date.now(); earn(m.coins); save();
    toast(`<b>🎯 missão cumprida!</b>${missionText(m)} · +${m.coins} 🪙`);
    renderMissions(); checkAch();
  }
  function missionRow(m) {
    const keys = m.kind === 'day' ? [dayKey()] : m.kind === 'hw' ? eventDays() : weekDays(), p = progressOf(m.k, keys, m.act), done = p >= m.n, got = !!S.missionsClaimed[m.id];
    const li = document.createElement('li'); li.className = 'mission' + (got ? ' got' : done ? ' done' : '');
    const show = v => m.k === 'min' || m.k === 'act' ? fmtMin(v) : v;
    li.innerHTML = `<span class="mic">${m.ic}</span><span class="mtx"><b></b><span class="mbar"><i style="width:${Math.min(100, p / m.n * 100)}%"></i></span><small>${show(Math.min(p, m.n))} / ${show(m.n)}</small></span>`;
    li.querySelector('b').textContent = missionText(m);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip mbtn';
    b.textContent = got ? '✓' : `+${m.coins} 🪙`; b.disabled = got || !done; if (done && !got) b.classList.add('ok');
    b.onclick = () => claimMission(m);
    li.appendChild(b); return li;
  }

  /* ---------- metas pessoais (ex.: estudar 10h por semana) ---------- */
  function goalText(g) {
    const a = g.act ? actOf(g.act) : null, per = T(g.period === 'day' ? 'por dia' : 'por semana');
    if (g.kind === 'min') return `${a ? a.ic + ' ' + T(a.nm) + ': ' : '⏱️ '}${fmtMin(g.target)} ${per}`;
    if (g.kind === 'pomos') return `🍅 ${T('{n} pomodoros', {n:g.target})} ${per}`;
    if (g.kind === 'water') return `💧 ${T('{n} copos de água', {n:g.target})} ${per}`;
    return `📅 ${T('{n} dias com foco', {n:g.target})} ${per}`;
  }
  function renderGoals() {
    const ul = $('goalList'); ul.innerHTML = S.goals.length ? '' : '<li class="empty">crie sua primeira meta aqui embaixo.</li>';
    S.goals.forEach(g => {
      const keys = g.period === 'day' ? [dayKey()] : weekDays(), pk = g.period === 'day' ? dayKey() : dayKey(weekStart());
      const p = progressOf(g.kind, keys, g.kind === 'min' ? g.act : null), done = p >= g.target;
      /* o prêmio é pelo que a meta é (não pelo id): apagar e criar de novo não paga outra vez.
         Meta criada já batida não paga no mesmo período, e são no máximo 3 prêmios de meta por período */
      const dk = `${g.kind}|${g.period}|${g.act || ''}|${g.target}@${pk}`;
      const bornDone = g.startPk === pk && g.startP >= g.target, paidHere = Object.keys(S.goalsDone).filter(x => x.includes('|' + g.period + '|') && x.endsWith('@' + pk)).length;
      if (done && !S.goalsDone[dk] && !bornDone && paidHere < 3) { S.goalsDone[dk] = Date.now(); earn(25); toast(`<b>🏁 meta batida!</b>${goalText(g)} · +25 🪙`); save(); setTimeout(checkAch, 200); }
      const li = document.createElement('li'); li.className = 'mission' + (done ? ' got' : '');
      const show = v => g.kind === 'min' ? fmtMin(v) : v;
      li.innerHTML = `<span class="mic">${done ? '🏁' : '🎯'}</span><span class="mtx"><b></b><span class="mbar"><i style="width:${Math.min(100, p / g.target * 100)}%"></i></span><small>${show(Math.min(p, g.target))} / ${show(g.target)}</small></span>`;
      li.querySelector('b').textContent = goalText(g);
      const del = document.createElement('button'); del.type = 'button'; del.className = 'del'; del.textContent = '×'; del.setAttribute('aria-label', 'apagar meta');
      del.onclick = () => { S.goals = S.goals.filter(x => x !== g); S.deleted[g.id] = Date.now(); save(); renderGoals(); };
      li.appendChild(del); ul.appendChild(li);
    });
    $('goalAct').hidden = $('goalKind').value !== 'min';
    $('goalUnit').textContent = T({min:'horas', pomos:'pomodoros', days:'dias', water:'copos'}[$('goalKind').value]);
  }
  let missionTab = 'missions';
  function renderMissions() {
    if (!$('missionDay')) return;
    $('missionDay').innerHTML = ''; missionsFor('day').forEach(m => $('missionDay').appendChild(missionRow(m)));
    $('missionWeek').innerHTML = ''; missionsFor('week').forEach(m => $('missionWeek').appendChild(missionRow(m)));
    const now = new Date(), mid = new Date(now); mid.setHours(24, 0, 0, 0);
    const h = Math.floor((mid - now) / 3600000), mn = Math.floor((mid - now) / 60000) % 60;
    $('missionDayLeft').textContent = T('renova em {t}', {t:h ? h + 'h' + String(mn).padStart(2, '0') : mn + ' min'});
    const ws = weekStart(); ws.setDate(ws.getDate() + 7);
    $('missionWeekLeft').textContent = T('renova em {n} dias', {n:Math.max(1, Math.ceil((ws - now) / 864e5))});
    const hw = eventOn('halloween');
    $('hwBox').hidden = !hw;
    if (hw) {
      $('missionHw').innerHTML = ''; hwMissions().forEach(m => $('missionHw').appendChild(missionRow(m)));
      const end = new Date(now.getFullYear(), 10, 3);
      $('hwLeft').textContent = T('acaba em {n} dias', {n:Math.max(1, Math.ceil((end - now) / 864e5))});
    }
    $('tabMissions').setAttribute('aria-selected', missionTab === 'missions'); $('tabGoals').setAttribute('aria-selected', missionTab === 'goals');
    $('tabLeague').setAttribute('aria-selected', missionTab === 'league');
    $('missionsView').hidden = missionTab !== 'missions'; $('goalsView').hidden = missionTab !== 'goals'; $('leagueView').hidden = missionTab !== 'league';
    renderGoals(); renderLeague(); renderCountdowns();
  }

  /* ---------- ligas semanais: a semana vai de segunda a domingo; na segunda ela fecha ----------
     bateu "up" pomodoros: sobe (+50 🪙); fez pelo menos o mínimo da liga: fica (+20 🪙); fez menos: cai uma liga.
     Semana sem abrir o site conta como zero (cai uma liga por semana parada). Não depende de servidor: cada pessoa calcula a sua */
  const LEAGUES = [
    {ic:'🥉', nm:'liga bronze', up:10, keep:1},
    {ic:'🥈', nm:'liga prata', up:20, keep:5},
    {ic:'🥇', nm:'liga ouro', up:35, keep:10},
    {ic:'💎', nm:'liga diamante', up:50, keep:20},
    {ic:'👑', nm:'liga lendária', keep:30}
  ];
  const LEAGUE_PRIZE = {up:50, keep:20};
  const pomosInWeek = ws => { let n = 0; for (let i = 0; i < 7; i++) { const d = new Date(ws); d.setDate(d.getDate() + i); n += (S.history[dayKey(d)] || {}).pomos || 0; } return n; };
  function leagueTick() {
    const cur = weekStart().getTime(), L = S.league;
    if (!L.at) { L.at = cur; store(); return; }   // primeira vez: começa na bronze nesta semana
    if (L.at >= cur) return;
    let res = null, won = 0, guard = 0;
    while (L.at < cur && guard++ < 60) {
      const ws = new Date(L.at), n = pomosInWeek(ws), t = LEAGUES[L.tier];
      let r = 'none';
      if (t.up != null && n >= t.up) { L.tier++; r = 'up'; }
      else if (n >= t.keep) r = 'keep';
      else if (L.tier > 0) { L.tier--; r = 'down'; }
      won += LEAGUE_PRIZE[r] || 0;
      res = {r, n, tier:L.tier};
      const nx = new Date(ws); nx.setDate(nx.getDate() + 7); L.at = weekStart(nx).getTime();
    }
    L.best = Math.max(L.best || 0, L.tier); L.last = res;
    earn(won); save(); checkAch();
    const t = LEAGUES[L.tier];
    if (res.r === 'up') toast(`<b>🏆 ${T('você subiu para a {liga}!', {liga:t.ic + ' ' + T(t.nm)})}</b>+${won} 🪙`);
    else if (res.r === 'keep') toast(`<b>${t.ic} ${T('semana fechada!')}</b>${T('você continua na {liga}.', {liga:T(t.nm)})} +${won} 🪙`);
    else if (res.r === 'down') toast(`<b>${t.ic} ${T('semana fechada')}</b>${T('você caiu para a {liga}. bora recuperar esta semana!', {liga:T(t.nm)})}`);
  }
  function renderLeague() {
    if (!$('lgName')) return;
    const L = S.league, t = LEAGUES[L.tier], n = pomosInWeek(weekStart());
    $('lgIc').textContent = t.ic; $('lgName').textContent = T(t.nm);
    let info;
    if (t.up != null && n >= t.up) info = T('✅ meta batida: na segunda você sobe para a {liga}!', {liga:T(LEAGUES[L.tier + 1].nm)});
    else if (t.up != null) info = T('esta semana: {n} 🍅 · faltam {k} para subir', {n, k:t.up - n});
    else info = T('esta semana: {n} 🍅 · você está no topo!', {n});
    if (L.tier > 0 && n < t.keep) info += ' · ' + T('⚠️ faça pelo menos {k} para não cair', {k:t.keep});
    $('lgInfo').textContent = info;
    $('lgBar').style.width = Math.min(100, n / (t.up || t.keep) * 100) + '%';
    const end = weekStart(); end.setDate(end.getDate() + 7); end.setHours(0, 0, 0, 0);
    const left = Math.max(1, Math.ceil((end - Date.now()) / 864e5));
    $('lgLeft').textContent = T(left > 1 ? 'a semana fecha em {n} dias' : 'a semana fecha hoje à meia-noite', {n:left});
    $('lgLadder').innerHTML = LEAGUES.map((x, i) => `<li class="${i === L.tier ? 'on' : i < L.tier ? 'past' : ''}"><span>${x.ic}</span><b>${esc(T(x.nm))}</b><small>${x.up != null ? esc(T('sobe com {n} 🍅 na semana', {n:x.up})) : esc(T('o topo!'))}</small></li>`).join('');
  }
  setInterval(() => { leagueTick(); renderLeague(); }, 60000);

  /* ---------- contagem regressiva para uma data importante (prova, entrega, viagem…) ---------- */
  const dateOf = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const daysTo = s => { const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((dateOf(s) - t) / 864e5); };
  function focusMinSince(ms) {
    let m = 0; const d = new Date(ms); d.setHours(12, 0, 0, 0); const end = Date.now();
    for (let i = 0; i < 2000 && d.getTime() <= end + 12 * 3600000; i++) { m += (S.history[dayKey(d)] || {}).min || 0; d.setDate(d.getDate() + 1); }
    return m;
  }
  function renderCountdowns() {
    const box = $('cdList'); if (!box) return;
    const list = S.countdowns.filter(c => daysTo(c.date) >= -3).sort((a, b) => dateOf(a.date) - dateOf(b.date));
    box.innerHTML = '';
    list.forEach(c => {
      const n = daysTo(c.date), row = document.createElement('div'); row.className = 'cdrow';
      const when = n > 1 ? T('faltam {n} dias', {n}) : n === 1 ? T('é amanhã!') : n === 0 ? T('é hoje! boa sorte 🍀') : T('já passou');
      let extra = '', pct = null;
      if (c.goal > 0) {
        const doneMin = focusMinSince(c.created), goalMin = c.goal * 60, rest = Math.max(0, goalMin - doneMin);
        pct = Math.min(100, doneMin / goalMin * 100);
        extra = ' · ' + T('{a} de {b}h', {a:fmtMin(doneMin), b:c.goal});
        if (rest > 0 && n > 0) extra += ' · ' + T('{t} por dia', {t:fmtMin(Math.ceil(rest / (n + 1)))});
        else if (!rest) extra += ' ✅';
      }
      row.innerHTML = `<span class="cdic" aria-hidden="true">📅</span><span class="cdtx"><b data-noi18n></b><small></small></span>${pct != null ? `<i class="cdbar" aria-hidden="true"><i style="width:${pct}%"></i></i>` : ''}`;
      row.querySelector('b').textContent = c.name;
      row.querySelector('small').textContent = when + extra;
      if (n <= 7 && n >= 0) row.classList.add('soon');
      box.appendChild(row);
    });
    const mine = $('cdMine'); if (!mine) return;
    mine.innerHTML = '';
    S.countdowns.slice().sort((a, b) => dateOf(a.date) - dateOf(b.date)).forEach(c => {
      const li = document.createElement('li'); li.className = 'mission cdm';
      li.innerHTML = `<span class="cdtx"><b data-noi18n></b><small></small></span><button class="del" type="button" aria-label="Apagar">×</button>`;
      li.querySelector('b').textContent = c.name;
      li.querySelector('small').textContent = dateOf(c.date).toLocaleDateString(LOC(), {day:'numeric', month:'long', year:'numeric'}) + (c.goal ? ' · ' + T('meta: {n}h de foco', {n:c.goal}) : '');
      li.querySelector('button').onclick = () => { S.deleted[c.id] = Date.now(); S.countdowns = S.countdowns.filter(x => x.id !== c.id); save(); renderCountdowns(); };
      mine.appendChild(li);
    });
    if (!S.countdowns.length) mine.innerHTML = `<li class="empty">${T('nenhuma contagem ainda.')}</li>`;
  }

  /* ---------- resumo da semana (imagem para baixar e postar) ---------- */
  let sumOff = 0;
  function weekStats(off) {
    const ws = weekStart(); ws.setDate(ws.getDate() + off * 7);
    const keys = []; for (let i = 0; i < 7; i++) { const d = new Date(ws); d.setDate(d.getDate() + i); keys.push({k:dayKey(d), d}); }
    const recs = keys.map(x => S.history[x.k] || {});
    const acts = {}; recs.forEach(r => Object.entries(r.act || {}).forEach(([a, v]) => { acts[a] = (acts[a] || 0) + v; }));
    const top = Object.entries(acts).sort((a, b) => b[1] - a[1])[0];
    let best = null; keys.forEach((x, i) => { if (!best || (recs[i].pomos || 0) > best.p) best = {p:recs[i].pomos || 0, d:x.d}; });
    return {start:keys[0].d, end:keys[6].d, pomos:recs.reduce((a, r) => a + (r.pomos || 0), 0), min:recs.reduce((a, r) => a + (r.min || 0), 0),
      tasks:recs.reduce((a, r) => a + (r.tasks || 0), 0), water:recs.reduce((a, r) => a + (r.water || 0), 0),
      days:recs.filter(r => r.pomos).length, per:recs.map(r => r.pomos || 0), top, best};
  }
  function drawSummary() {
    const cv = $('sumCanvas'), c = cv.getContext('2d'), W = 1080, H = 1350, st = weekStats(sumOff);
    /* navegador antigo sem cantos arredondados no canvas: desenha retângulo reto */
    if (!c.roundRect) c.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };
    const css = getComputedStyle(document.documentElement), acc = css.getPropertyValue('--amber').trim() || '#F2B872', lav = css.getPropertyValue('--lav').trim() || '#B9A8EC';
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#171329'); g.addColorStop(1, '#2A2046');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) { const r = rng(i + 7)(); c.fillStyle = `rgba(241,230,216,${.2 + r * .5})`; c.fillRect((i * 137) % W, (i * 263) % 520, 3, 3); }
    const f = (sz, w = 400, fam = 'VT323') => `${w} ${sz}px "${fam}", monospace`;
    c.textAlign = 'center'; c.fillStyle = '#F1E6D8'; c.font = f(96);
    c.fillText(T('meu resumo da semana'), W / 2, 140);
    const fmtD = d => d.toLocaleDateString(LOC(), {day:'numeric', month:'short'});
    c.font = f(44); c.fillStyle = lav; c.fillText(`${fmtD(st.start)} – ${fmtD(st.end)}`, W / 2, 205);
    /* bichinho */
    const pv = document.createElement('canvas'); pv.width = 16; pv.height = 16;
    Pets.draw(pv, petId(), true, petColor(petId()), S.petOutfits[petId()]);
    c.imageSmoothingEnabled = false; c.drawImage(pv, W / 2 - 110, 225, 220, 220);
    /* números */
    const box = (x, y, big, small, color) => {
      c.fillStyle = 'rgba(241,230,216,.07)'; c.beginPath(); c.roundRect(x, y, 470, 190, 28); c.fill();
      c.fillStyle = color; c.font = f(110); c.fillText(big, x + 235, y + 110);
      c.fillStyle = '#A69DB6'; c.font = f(34, 700, 'Nunito'); c.fillText(small.toUpperCase(), x + 235, y + 160);
    };
    box(50, 470, String(st.pomos), T('pomodoros'), acc);
    box(560, 470, fmtMin(st.min), T('tempo de foco'), acc);
    box(50, 670, String(st.days) + '/7', T('dias com foco'), '#9CC5A1');
    box(560, 670, String(st.tasks), T('tarefas'), '#9CC5A1');
    /* barrinhas por dia */
    const max = Math.max(1, ...st.per), WD = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
    st.per.forEach((p, i) => {
      const x = 90 + i * 132, h = p / max * 170;
      c.fillStyle = p ? acc : 'rgba(241,230,216,.12)'; c.beginPath(); c.roundRect(x, 1160 - Math.max(h, 8), 90, Math.max(h, 8), 14); c.fill();
      c.fillStyle = '#F1E6D8'; c.font = f(36); if (p) c.fillText(p, x + 45, 1150 - h);
      c.fillStyle = '#A69DB6'; c.font = f(28, 700, 'Nunito'); c.fillText(T(WD[i]), x + 45, 1205);
    });
    c.font = f(40); c.fillStyle = '#F1E6D8';
    const extra = [st.top ? `${actOf(st.top[0]).ic} ${T(actOf(st.top[0]).nm)}` : '', S.settings.water && st.water ? `💧 ${st.water}` : '', streak() ? `🔥 ${streak()}` : ''].filter(Boolean).join('   ·   ');
    c.fillText(extra, W / 2, 925);
    c.font = f(36); c.fillStyle = lav; c.fillText('🍅 meupomodoro-lofi.netlify.app', W / 2, 1290);
    $('sumWeek').textContent = sumOff === 0 ? T('esta semana') : sumOff === -1 ? T('semana passada') : `${fmtD(st.start)} – ${fmtD(st.end)}`;
    $('sumNext').disabled = sumOff >= 0;
  }
  function openSummary() {
    if (!S.flags.summary) { S.flags.summary = true; save(); setTimeout(checkAch, 400); }
    sumOff = 0; try { $('sumDlg').showModal(); } catch (e) { $('sumDlg').setAttribute('open', ''); }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(drawSummary);
  }

  /* ---------- lojinha de roupinhas ---------- */
  const SLOT_NM = {cabeca:'🎩 cabeça', rosto:'🕶️ rosto', pescoco:'🧣 pescoço', roupa:'👕 roupa'};
  let shopSlot = 'cabeca';
  function equip(it, off) {
    const o = S.petOutfits[petId()] = Object.assign({}, S.petOutfits[petId()]);
    if (off) delete o[it.slot]; else o[it.slot] = it.id;
    save(); petKey = ''; renderShop(); renderCollection(); checkAch();
  }
  function buy(it) {
    if (S.owned.includes(it.id)) return equip(it);
    if (coins() < it.price) { toast(`<b>🪙 ${T('faltam {n} moedas', {n:it.price - coins()})}</b>termine pomodoros, tarefas e conquistas para ganhar mais.`); return; }
    S.owned.push(it.id); renderCoins(true);
    toast(`<b>🛍️ comprado!</b>${it.ic} ${T(it.name)}`);
    equip(it);
  }
  function renderShop() {
    const pet = Pets.LIST.find(p => p.id === S.pet) || Pets.LIST[0], outfit = S.petOutfits[pet.id] || {};
    $('shopCoins').textContent = coins();
    $('shopPetName').textContent = pet.ic + ' ' + T(pet.name);
    Pets.draw($('shopPreview'), pet.id, true, petColor(pet.id), outfit);
    $('shopTabs').innerHTML = '';
    Pets.SLOTS.slice().reverse().forEach(s => {
      const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab');
      b.textContent = SLOT_NM[s]; b.setAttribute('aria-selected', s === shopSlot);
      b.onclick = () => { shopSlot = s; renderShop(); };
      $('shopTabs').appendChild(b);
    });
    const grid = $('shopItems'); grid.innerHTML = '';
    /* personagens especiais não usam roupinhas (só os bichinhos) */
    $('shopTabs').hidden = Pets.isSpecial(pet.id);
    if (Pets.isSpecial(pet.id)) { grid.innerHTML = `<p class="empty">${T('personagens especiais não usam roupinhas. escolha um bichinho na coleção para vestir.')}</p>`; return; }
    /* itens de evento só aparecem durante o evento (ou para quem já comprou) */
    Pets.ITEMS.filter(i => i.slot === shopSlot && (!i.event || eventOn(i.event) || S.owned.includes(i.id))).forEach(it => {
      const owned = S.owned.includes(it.id), on = outfit[it.slot] === it.id;
      const card = document.createElement('div'); card.className = 'item shopitem' + (on ? ' sel' : '') + (it.event ? ' eventitem' : '');
      card.innerHTML = `<canvas width="16" height="16" aria-hidden="true"></canvas><span>${it.ic} ${it.name}</span>` + (it.event && !owned ? `<small class="evtag">${T('🎃 só em outubro')}</small>` : '');
      Pets.draw(card.querySelector('canvas'), pet.id, true, petColor(pet.id), Object.assign({}, outfit, {[it.slot]:it.id}));
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (owned ? '' : ' price');
      b.textContent = on ? 'tirar' : owned ? 'usar' : '🪙 ' + it.price;
      if (!owned && coins() < it.price) b.classList.add('short');
      b.onclick = () => on ? equip(it, true) : buy(it);
      card.appendChild(b); grid.appendChild(card);
    });
  }

  /* ---------- rotinas salvas (ex.: "jogando: 40-15-40"), podendo ligar a uma atividade ---------- */
  function currentSteps() {
    if (seq()) return clone(S.settings.steps);
    const st = [], n = S.settings.every;
    for (let i = 0; i < n; i++) { st.push({t:'focus', m:S.settings.focus}); st.push(i === n - 1 ? {t:'long', m:S.settings.long} : {t:'short', m:S.settings.short}); }
    return st;
  }
  function applyMy(r) {
    S.settings.routine = 'custom'; S.settings.steps = clone(r.steps); S.settings.loop = r.loop !== false; S.settings.myId = r.id;
    S.seqIdx = 0; save(); if (!running) setMode(null); else render(); renderRoutines(); syncSettingsUI();
  }
  function renderMyRoutines() {
    const box = $('myRoutines'); box.innerHTML = '';
    S.myRoutines.forEach(r => {
      const a = r.act ? actOf(r.act) : null, wrap = document.createElement('div'); wrap.className = 'myrt';
      const b = document.createElement('button'); b.type = 'button'; b.className = 'routine';
      b.setAttribute('aria-pressed', S.settings.routine === 'custom' && S.settings.myId === r.id);
      b.innerHTML = `<b data-noi18n></b><small></small>`;
      b.querySelector('b').textContent = '⭐ ' + r.name;
      b.querySelector('small').textContent = r.steps.map(s => s.m).join('·') + (a ? ' · ' + a.ic + ' ' + T(a.nm) : '');
      b.onclick = () => applyMy(r);
      const del = document.createElement('button'); del.type = 'button'; del.className = 'del'; del.textContent = '×'; del.setAttribute('aria-label', 'apagar rotina');
      del.onclick = () => { S.myRoutines = S.myRoutines.filter(x => x !== r); S.deleted[r.id] = Date.now(); if (S.settings.myId === r.id) S.settings.myId = ''; save(); renderRoutines(); };
      wrap.append(b, del); box.appendChild(wrap);
    });
    $('myRoutinesWrap').hidden = !S.myRoutines.length;
    const sel = $('rtAct'), keep = sel.value;
    sel.innerHTML = '<option value="">sem atividade</option>' + ACTS.map(a => `<option value="${a.id}">${a.ic} ${a.nm}</option>`).join('');
    sel.value = keep;
  }

  /* ---------- baú diário: uma vez por dia; abrir dias seguidos aumenta o prêmio ---------- */
  function renderChest() { $('chestBtn').hidden = S.chest.last === dayKey(); }
  function openChest() {
    if (S.chest.last === dayKey()) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const streakN = S.chest.last === dayKey(y) ? (S.chest.streak || 0) + 1 : 1;
    const bonus = Math.min(streakN - 1, 7) * 5, prize = 10 + Math.floor(Math.random() * 21) + bonus;
    S.chest = {last:dayKey(), streak:streakN, at:Date.now(), best:Math.max(S.chest.best || 0, streakN)};
    earn(prize); save(); renderChest();
    $('chestSub').innerHTML = `<b class="chestprize">+${prize} 🪙</b>` + (streakN > 1 ? T('{n} dias seguidos abrindo o baú (+{b} de bônus)', {n:streakN, b:bonus}) : T('volte amanhã: abrindo todo dia, o prêmio aumenta.'));
    $('chestPop').hidden = false; $('chestBox').classList.remove('open'); void $('chestBox').offsetWidth; $('chestBox').classList.add('open');
    $('chestOk').focus();
    setTimeout(checkAch, 300);
  }
  $('chestBtn').onclick = openChest;
  $('chestOk').onclick = () => { $('chestPop').hidden = true; };
  $('chestPop').addEventListener('keydown', e => { if (e.key === 'Escape') $('chestOk').click(); });

  /* ---------- foco total: some tudo, fica só o cronômetro e o bichinho ---------- */
  let zenFs = false;
  function zen(on) {
    document.body.classList.toggle('zen', on);
    /* só sai da tela cheia se foi o foco total que abriu (quem já estava em ⛶ continua) */
    try {
      if (on && !document.fullscreenElement) { zenFs = true; document.documentElement.requestFullscreen().catch(() => { zenFs = false; }); }
      else if (on) zenFs = false;
      if (!on && zenFs && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (!on) zenFs = false;
    } catch (e) {}
    if (on) { toggleSettings(false); scrollTo({top:0}); }
    renderZenMusic();
  }
  /* ---------- roleta da pausa: sorteia o que fazer; cumprir vale 2 🪙 (uma vez por pausa, até 10 por dia) ---------- */
  const SPIN = [
    {id:'alongar', ic:'🧘', nm:'alongar', ds:'levanta, estica os braços para cima e gira os ombros e o pescoço devagar.'},
    {id:'agua', ic:'💧', nm:'beber água', ds:'pega um copo de água e bebe com calma.'},
    {id:'olhos', ic:'👀', nm:'descansar os olhos', ds:'olha para algo bem longe por 20 segundos. seus olhos agradecem.'},
    {id:'respirar', ic:'🌬️', nm:'respirar 4-7-8', ds:'inspira em 4, segura em 7 e solta em 8. siga a bolinha:', breath:true},
    {id:'mesa', ic:'🧹', nm:'arrumar a mesa', ds:'guarda 3 coisas que estão fora do lugar.'},
    {id:'dancar', ic:'💃', nm:'dançar uma música', ds:'coloca uma música que você ama e mexe o corpo.'},
    {id:'lanche', ic:'🍎', nm:'lanchinho', ds:'come uma fruta ou alguma coisa leve.'},
    {id:'oi', ic:'💌', nm:'mandar um oi', ds:'manda uma mensagem carinhosa para alguém de quem você gosta.'},
    {id:'andar', ic:'🚶', nm:'dar uma voltinha', ds:'anda um pouco pela casa ou vai até a janela pegar um ar.'},
    {id:'fechar', ic:'😌', nm:'fechar os olhos', ds:'fecha os olhos e fica 1 minuto só respirando.'}
  ];
  const spinDlg = $('spinDlg'), wheel = $('wheel'), SEG = 360 / SPIN.length;
  wheel.style.background = `conic-gradient(${SPIN.map((_, i) => `var(${i % 2 ? '--glass2' : '--wheel-a'}) ${i * SEG}deg ${(i + 1) * SEG}deg`).join(',')})`;
  wheel.innerHTML = SPIN.map((s, i) => `<span style="transform:rotate(${i * SEG + SEG / 2}deg)"><i>${s.ic}</i></span>`).join('');
  let spinRot = 0, spinCur = null, spinning = false, breathT = [];
  const stopBreath = () => { breathT.forEach(clearTimeout); breathT = []; $('breath').hidden = true; };
  function breathe() {
    const c = $('bCircle'), l = $('bLabel'); $('breath').hidden = false;
    const steps = [['inspira…', 4, 1.6], ['segura…', 7, 1.6], ['solta…', 8, .7]];
    let at = 0;
    for (let round = 0; round < 3; round++) steps.forEach(([txt, s, sc]) => {
      breathT.push(setTimeout(() => { l.textContent = T(txt) + ' ' + s; c.style.transition = `transform ${s}s ease-in-out`; c.style.transform = `scale(${sc})`; }, at * 1000));
      at += s;
    });
    breathT.push(setTimeout(() => { l.textContent = T('pronto! 🌿'); }, at * 1000));
  }
  function spin() {
    if (spinning) return;
    spinning = true; stopBreath(); $('spinRes').hidden = true; $('spinGo').disabled = true;
    let i; do { i = Math.floor(Math.random() * SPIN.length); } while (spinCur && SPIN[i] === spinCur);
    spinCur = SPIN[i];
    /* o pedaço i fica embaixo da setinha (em cima da roda) */
    spinRot += 360 * 4 + ((360 - (i * SEG + SEG / 2) - spinRot % 360) + 360) % 360;
    wheel.style.transform = `rotate(${spinRot}deg)`;
    setTimeout(() => {
      spinning = false; $('spinGo').disabled = false; $('spinGo').hidden = true;
      $('spinName').textContent = `${spinCur.ic} ${T(spinCur.nm)}`;
      $('spinDesc').textContent = T(spinCur.ds);
      $('spinRes').hidden = false;
      if (spinCur.breath) breathe();
    }, 3300);
  }
  $('spinBtn').onclick = () => { try { spinDlg.showModal(); } catch (e) { spinDlg.setAttribute('open', ''); } if (!spinCur) spin(); };
  $('spinGo').onclick = $('spinAgain').onclick = spin;
  $('spinClose').onclick = () => spinDlg.close();
  spinDlg.addEventListener('close', stopBreath);
  spinDlg.addEventListener('click', e => { if (e.target === spinDlg) spinDlg.close(); });
  $('spinDone').onclick = () => {
    const d = day(); spinDlg.close();
    if (spinCur && spinCur.id === 'agua' && S.settings.water) { d.water = (d.water || 0) + 1; if (d.water <= 8) earn(1); duelAdd('water', 1); scheduleWater(); }
    happyUntil = Date.now() + 2500;
    if (spinPaid !== breakId && (d.spins || 0) < 10) {
      spinPaid = breakId; d.spins = (d.spins || 0) + 1; earn(2);
      toast(`<b>🎲 ${T('pausa bem feita!')}</b>+2 🪙`);
    } else toast(`<b>🎲 ${T('boa!')}</b>${T('a moedinha da roleta é uma por pausa.')}`);
    spinCur = null; $('spinRes').hidden = true; $('spinGo').hidden = false; save(); render(); checkAch();
  };

  /* ---------- novidades: aparece uma vez para quem já usava o site, a cada atualização grande ----------
     atualização nova = trocar NEWS e o conteúdo de #newsDlg no index.html */
  const NEWS = '2026-10-03', NKEY = 'pomodoro-news';
  const newsDlg = $('newsDlg');
  const openNews = () => { try { newsDlg.showModal(); } catch (e) { newsDlg.setAttribute('open', ''); } try { localStorage.setItem(NKEY, NEWS); } catch (e) {} };
  $('newsOk').onclick = $('newsClose').onclick = () => newsDlg.close();
  newsDlg.addEventListener('click', e => { if (e.target === newsDlg) newsDlg.close(); });
  $('newsBtn').onclick = openNews;
  $('newsPlant').onclick = () => {
    newsDlg.close();
    document.querySelector('[data-coltab=colPlants]').click();
    $('colPanel').scrollIntoView({behavior:'smooth', block:'start'});
  };
  setTimeout(() => {
    let seen = ''; try { seen = localStorage.getItem(NKEY) || ''; } catch (e) {}
    if (seen === NEWS) return;
    /* quem chegou agora não precisa de "novidades"; quem está no meio de um foco vê na próxima vez */
    if (!returning) { try { localStorage.setItem(NKEY, NEWS); } catch (e) {} return; }
    if (!running) openNews();
  }, 1500);

  /* play/pause da música no foco total (só aparece com um player do Spotify/YouTube que aceite comando) */
  /* sem música (ou com um player que não aceita comando), o botão abre uma listinha com as rádios do painel de música */
  function renderZenMusic() {
    const b = $('zenMusic'), zenOn = document.body.classList.contains('zen');
    b.hidden = !zenOn;
    if (!zenOn) { $('zenMenu').hidden = true; return; }
    const t = music && music.ctl ? (music.playing ? '⏸ pausar música' : '▶ tocar música') : '🎵 música';
    if (b.textContent !== t) b.textContent = t;
  }
  $('zenMenu').innerHTML = [...document.querySelectorAll('#musicPanel [data-music]')].map(x => `<button class="chip" type="button" data-zm="${esc(x.dataset.music)}">${esc(x.textContent)}</button>`).join('');
  $('zenMenu').onclick = e => {
    const b = e.target.closest('[data-zm]'); if (!b) return;
    $('zenMenu').hidden = true;
    showMusic(b.dataset.zm, true);
    /* toca assim que o player ficar pronto */
    const me = music; let n = 0;
    const tryPlay = () => { if (music !== me || n++ > 40) return; if (!me.ctl) { setTimeout(tryPlay, 250); return; } try { me.kind === 'spotify' ? (me.ctl.play(), me.started = true) : me.ctl.playVideo(); me.playing = true; } catch (err) {} renderZenMusic(); };
    tryPlay();
  };
  $('zenMusic').onclick = () => {
    if (!music || !music.ctl) { $('zenMenu').hidden = !$('zenMenu').hidden; return; }
    try {
      if (music.kind === 'spotify') {
        if (music.playing) music.ctl.pause(); else { music.started ? music.ctl.resume() : music.ctl.play(); music.started = true; }
      } else if (music.playing) music.ctl.pauseVideo(); else music.ctl.playVideo();
      music.playing = !music.playing;
    } catch (err) {}
    renderZenMusic();
  };
  setInterval(() => { if (document.body.classList.contains('zen')) renderZenMusic(); }, 700);
  $('zenBtn').onclick = () => zen(true);
  $('zenExit').onclick = () => zen(false);
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.body.classList.contains('zen')) zen(false); });

  /* ---------- missões, metas e resumo: botões ---------- */
  $('tabMissions').onclick = () => { missionTab = 'missions'; renderMissions(); };
  $('tabGoals').onclick = () => { missionTab = 'goals'; renderMissions(); };
  $('tabLeague').onclick = () => { missionTab = 'league'; renderMissions(); };
  /* contagem regressiva: janelinha para criar e apagar */
  const cdDlg = $('cdDlg');
  $('cdAdd').onclick = () => {
    const t = new Date(); $('cdDate').min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    renderCountdowns();
    try { cdDlg.showModal(); } catch (e) { cdDlg.setAttribute('open', ''); }
  };
  $('cdClose').onclick = () => cdDlg.close();
  cdDlg.addEventListener('click', e => { if (e.target === cdDlg) cdDlg.close(); });
  $('cdForm').onsubmit = e => {
    e.preventDefault();
    const name = $('cdName').value.trim().slice(0, 30), date = $('cdDate').value, goal = Math.round(+$('cdGoal').value || 0);
    if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    if (daysTo(date) < 0) { toast('<b>📅 essa data já passou</b>escolha hoje ou um dia que ainda vai chegar.'); return; }
    if (S.countdowns.length >= 10) { toast('<b>📅 até 10 contagens</b>apague uma que já passou.'); return; }
    S.countdowns.push({id:uid(), name, date, goal:Math.min(2000, Math.max(0, goal)), created:Date.now(), updated:Date.now()});
    S.flags.countdown = true;
    $('cdName').value = ''; $('cdGoal').value = '';
    save(); renderCountdowns(); checkAch();
  };
  $('goalAct').innerHTML = '<option value="">qualquer atividade</option>' + ACTS.map(a => `<option value="${a.id}">${a.ic} ${a.nm}</option>`).join('');
  $('goalKind').onchange = () => {
    $('goalTarget').value = {min:10, pomos:20, days:5, water:8}[$('goalKind').value];
    $('goalTarget').step = $('goalKind').value === 'min' ? '0.5' : '1';
    renderGoals();
  };
  $('goalForm').onsubmit = e => {
    e.preventDefault();
    const kind = $('goalKind').value, period = $('goalPeriod').value, v = +$('goalTarget').value;
    if (!(v > 0)) { $('goalTarget').focus(); return; }
    if (kind === 'days' && period === 'day') { toast('<b>🏁 meta</b>"dias com foco" só faz sentido por semana.'); $('goalPeriod').value = 'week'; return; }
    if (kind === 'days' && v > 7) { toast('<b>🏁 meta</b>a semana tem 7 dias 😄'); return; }
    if (S.goals.length >= 8) { toast('<b>✋ limite</b>dá para ter até 8 metas.'); return; }
    const target = kind === 'min' ? Math.round(v * 60) : Math.round(v), act = kind === 'min' ? $('goalAct').value : '';
    /* guarda o progresso de quando a meta nasceu: se já estava batida, só paga no próximo período */
    const startPk = period === 'day' ? dayKey() : dayKey(weekStart()), startP = progressOf(kind, period === 'day' ? [dayKey()] : weekDays(), act || null);
    S.goals.push({id:uid(), kind, target, period, act, startPk, startP, updated:Date.now()});
    if (kind === 'water' && !S.settings.water) toast('<b>💧 meta de água</b>ligue o lembrete de água nos ajustes (⚙) para marcar os copos.');
    save(); renderGoals();
  };
  $('sumBtn').onclick = openSummary;
  $('sumClose').onclick = () => $('sumDlg').close();
  $('sumDlg').addEventListener('click', e => { if (e.target === $('sumDlg')) $('sumDlg').close(); });
  $('sumPrev').onclick = () => { if (sumOff > -8) { sumOff--; drawSummary(); } };
  $('sumNext').onclick = () => { if (sumOff < 0) { sumOff++; drawSummary(); } };
  $('sumDown').onclick = () => {
    const a = document.createElement('a'); a.href = $('sumCanvas').toDataURL('image/png');
    a.download = 'resumo-da-semana.png'; document.body.appendChild(a); a.click(); a.remove();
  };
  setInterval(() => { if (!document.hidden) { renderMissions(); renderChest(); } }, 60000);

  /* ---------- eventos ---------- */
  /* com o tempo correndo, clicar numa aba (ex.: pausa curta) só deixa ela marcada como a próxima;
     a troca acontece quando a pessoa aperta "começar pausa curta" */
  function mainButton() {
    if (running && pendingMode) { const m = pendingMode; setMode(m, true); wake(true); share(); return; }
    running ? pause() : start();
    share();
  }
  $('toggle').onclick = mainButton;
  function resetCycle() {
    S.cycle = 0; S.seqIdx = 0; save();
    running = false; wake(false); setMode(seq() ? null : 'focus');
    toast('<b>↺ ciclo zerado</b>as bolinhas voltaram para o começo.');
    share();
  }
  /* ↺ reinicia o tempo; se o tempo já está no começo, um segundo clique zera também as bolinhas */
  $('reset').onclick = () => {
    wake(false);
    const atStart = !running && remaining === total;
    if (atStart && (seq() ? S.seqIdx > 0 : S.cycle % S.settings.every > 0)) resetCycle();
    else { if (running) remaining = Math.max(0, endAt - Date.now()); wilt(); setMode(mode); share(); }
  };
  $('set').addEventListener('click', e => { if (e.target.closest('[data-cycle-reset]')) resetCycle(); });
  $('skip').onclick = () => { finish(false); share(); };
  document.querySelectorAll('.modes button').forEach(b => b.onclick = () => {
    const m = b.dataset.mode;
    if (running) { pendingMode = m === mode || pendingMode === m ? null : m; render(); return; }
    wake(false); setMode(m); share();
  });
  $('addForm').onsubmit = e => {
    e.preventDefault();
    const text = $('newTask').value.trim(); if (!text) return;
    /* est e spent ficaram do tempo em que a tarefa contava pomodoros: continuam no dado para não quebrar quem já tem */
    const t = {id:uid(), text, est:1, spent:0, done:false};
    t.u = Date.now(); S.tasks.push(t);
    $('newTask').value = ''; save(); render();
  };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('zen')) { zen(false); return; }
    const el = e.target && e.target.matches ? e.target : document.body;
    if (el.matches('input, textarea, select, [contenteditable]')) return;
    if (el.matches('button') && (e.code === 'Space' || e.key === 'Enter')) return;
    if (e.code === 'Space') { e.preventDefault(); mainButton(); }
    else if (e.key === 'r' || e.key === 'R') $('reset').click();
    else if (e.key === 's' || e.key === 'S') $('skip').click();
  });
  $('lookBtn').onclick = () => {
    const l = look() === 'dia' ? 'noite' : 'dia';
    document.documentElement.dataset.look = l;
    try { localStorage.setItem('pomodoro-look', l); } catch (e) {}
    lookLabel(); Scenes.redraw(); renderCollection(); renderColors(); renderThemeSounds();
  };
  const lookLabel = () => { $('lookBtn').textContent = look() === 'dia' ? '🌙 modo noite' : '☀ modo dia'; };
  $('fsBtn').onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {} };
  $('lvlPill').onclick = () => $('progressPanel').scrollIntoView({behavior:'smooth', block:'start'});
  const toggleSettings = open => { $('settingsBox').hidden = !open; $('gearBtn').setAttribute('aria-expanded', open); };
  $('gearBtn').onclick = () => toggleSettings($('settingsBox').hidden);
  $('gearClose').onclick = () => { toggleSettings(false); $('gearBtn').focus(); };
  $('calPrev').onclick = () => { calOff--; renderHistory(); };
  $('calNext').onclick = () => { if (calOff < 0) { calOff++; renderHistory(); } };
  $('themeSndBtn').onclick = () => Sounds.play(Scenes.THEMES[S.theme].sounds[look()]);

  document.querySelectorAll('[data-music]').forEach(b => b.onclick = () => showMusic(b.dataset.music, true));
  $('musicForm').onsubmit = e => { e.preventDefault(); showMusic($('musicUrl').value, true); };
  $('closeMusic').onclick = () => { S.music = ''; save(); showMusic(''); };
  $('musicAuto').onchange = e => { S.musicAuto = e.target.checked; save(); renderMusicAuto(); lastWant = null; musicSync(); };
  $('musicBreaks').onchange = e => { S.musicBreaks = e.target.checked; save(); lastWant = null; musicSync(); };

  const cfg = {focus:'cfg-focus', short:'cfg-short', long:'cfg-long', every:'cfg-every'};
  Object.entries(cfg).forEach(([k, id]) => {
    $(id).value = S.settings[k];
    $(id).onchange = () => {
      const v = Math.round(+$(id).value); if (!(v > 0)) { $(id).value = S.settings[k]; return; }
      S.settings[k] = v;
      const match = ROUTINES.find(r => r.v && Object.entries(r.v).every(([kk, vv]) => S.settings[kk] === vv));
      S.settings.routine = match ? match.id : 'manual';
      save(); renderRoutines();
      if (k === mode && !running && remaining === total) setMode(mode); else render();
    };
  });
  $('cfg-auto').checked = S.settings.auto; $('cfg-auto').onchange = e => { S.settings.auto = e.target.checked; save(); };
  $('cfg-sound').checked = S.settings.sound; $('cfg-sound').onchange = e => { S.settings.sound = e.target.checked; save(); if (e.target.checked) chime(); };
  $('cfg-pixel').checked = S.settings.pixelClock; $('cfg-pixel').onchange = e => { S.settings.pixelClock = e.target.checked; save(); render(); };
  $('cfg-notify').checked = S.settings.notify;
  $('cfg-notify').onchange = e => {
    const box = e.target;
    if (!box.checked) { S.settings.notify = false; save(); return; }
    if (!('Notification' in window)) { box.checked = false; toast('<b>🔕 sem notificações</b>este navegador não permite avisos.'); return; }
    Notification.requestPermission().then(p => {
      S.settings.notify = p === 'granted'; box.checked = S.settings.notify; save();
      toast(S.settings.notify ? '<b>🔔 avisos ligados</b>quando o tempo acabar, chega um aviso mesmo se você estiver em outra aba.' : '<b>🔕 avisos bloqueados</b>libere as notificações deste site nas configurações do navegador.');
    }).catch(() => { box.checked = false; });
  };
  /* zera o foco do dia, mas mantém os copos de água (senão as moedas da água liberavam de novo) */
  $('clearDay').onclick = () => {
    const w = (S.history[dayKey()] || {}).water;
    delete S.history[dayKey()];
    if (w) S.history[dayKey()] = {pomos:0, min:0, tasks:0, water:w, act:{}};
    save(); render(); renderHistory();
  };

  document.querySelectorAll('[data-add]').forEach(b => b.onclick = () => {
    if (S.settings.steps.length >= 24) { toast('<b>✋ limite</b>a sequência aceita até 24 etapas.'); return; }
    const t = b.dataset.add; S.settings.steps.push({t, m:t === 'focus' ? 25 : t === 'short' ? 5 : 15}); stepsChanged();
  });
  $('seqLoop').onchange = e => { S.settings.loop = e.target.checked; save(); render(); };

  $('cfg-water').onchange = e => { S.settings.water = e.target.checked; save(); if (S.settings.water) { ac(); scheduleWater(); toast(`<b>💧 lembrete ligado</b>${T('seu bichinho aparece a cada {n} minutos.', {n:S.settings.waterEvery})}`); } renderWaterCfg(); render(); };
  $('cfg-waterEvery').onchange = e => { S.settings.waterEvery = +e.target.value || 45; save(); scheduleWater(); renderWaterCfg(); };
  $('waterTest').onclick = () => { ac(); showWater(true); };
  document.addEventListener('langchange', () => {
    lookLabel(); renderActs(); render(); renderProgress(); renderCollection(); renderHistory(); renderRoutines();
    renderDiary(); renderNotes(); renderClocks(); renderWaterCfg(); renderShop(); renderMetro();
    $('langSel').value = I18N.lang;
  });
  if (window.I18N) { $('langSel').value = I18N.lang; $('langSel').onchange = e => I18N.setLang(e.target.value); }
  $('clockAdd').onchange = e => {
    const tz = e.target.value; if (!tz) return;
    if (!Array.isArray(S.clocks)) S.clocks = [];
    if (!S.clocks.includes(tz)) S.clocks.push(tz);
    e.target.value = ''; save(); renderClocks();
  };
  $('cfg-waterVol').oninput = e => setWaterVol(+e.target.value);
  $('cfg-waterVol').onchange = () => bell();
  $('waterVolDown').onclick = () => { setWaterVol((S.settings.waterVol ?? .7) - .1); bell(); };
  $('waterVolUp').onclick = () => { setWaterVol((S.settings.waterVol ?? .7) + .1); bell(); };
  $('waterDone').onclick = () => {
    if (waterIsTest) { waterIsTest = false; hideWater(); toast('<b>🔔 teste</b>tudo certo! no lembrete de verdade, o copo conta.'); return; }
    const d = day(); d.water = (d.water || 0) + 1; happyUntil = Date.now() + 2500;
    if (d.water <= 8) earn(1);
    duelAdd('water', 1);
    render();
    save(); hideWater(); toast(`<b>💧 boa!</b>${T(d.water > 1 ? '{n} copos hoje.' : '{n} copo hoje.', {n:d.water})}`); checkAch();
  };
  $('waterLater').onclick = () => { if (!waterIsTest) scheduleWater(5 * 60000); waterIsTest = false; hideWater(); };
  $('waterPop').addEventListener('keydown', e => { if (e.key === 'Escape') $('waterLater').click(); });


  document.querySelectorAll('[data-coltab]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-coltab]').forEach(x => { x.setAttribute('aria-selected', x === b); $(x.dataset.coltab).hidden = x !== b; });
  });
  $('tabDiary').onclick = () => showDiaryTab('diary');
  $('tabNotes').onclick = () => showDiaryTab('notes');
  $('dPrev').onclick = () => { dOff--; renderDiary(); };
  $('dNext').onclick = () => { if (dOff < 0) { dOff++; renderDiary(); } };
  $('dText').oninput = () => writeDiary({text:$('dText').value});
  $('dText').onblur = () => renderDiary();
  $('nNew').onclick = () => {
    const n = {id:uid(), title:'', text:'', updated:Date.now()};
    S.notes.push(n); noteSel = n.id; noteDelArmed = false; save(); renderNotes(); $('nTitle').focus();
  };
  $('nTitle').oninput = () => editNote({title:$('nTitle').value});
  $('nText').oninput = () => editNote({text:$('nText').value});
  $('nTitle').onblur = $('nText').onblur = () => renderNotes();
  $('nDel').onclick = () => {
    if (!noteDelArmed) { noteDelArmed = true; renderNotes(); return; }
    S.notes = S.notes.filter(x => x.id !== noteSel); S.deleted[noteSel] = Date.now(); noteSel = null; noteDelArmed = false; save(); renderNotes();
  };

  $('rtSave').onclick = () => {
    const name = $('rtName').value.trim().slice(0, 30);
    if (!name) { toast('<b>📋 rotina</b>dê um nome para a rotina, ex.: jogando.'); $('rtName').focus(); return; }
    const act = $('rtAct').value;
    if (act) S.myRoutines.forEach(r => { if (r.act === act) { r.act = ''; r.updated = Date.now(); } });
    const r = {id:uid(), name, act, steps:currentSteps(), loop:seq() ? S.settings.loop : true, updated:Date.now()};
    S.myRoutines.push(r); $('rtName').value = ''; $('rtAct').value = '';
    applyMy(r); checkAch();
    toast(`<b>💾 ${T('rotina {name}', {name:esc(name)})}</b>${T('salva! {steps} min', {steps:r.steps.map(s => s.m).join('·')})}`);
  };
  $('coinBtn').onclick = () => $('shopPanel').scrollIntoView({behavior:'smooth', block:'start'});

  /* ---------- app instalável: ajudante offline (sw.js) e botão "instalar app" ---------- */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  const installed = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let installPrompt = null;
  /* Android/Chrome/Edge: o navegador avisa que dá para instalar; aí o botão aparece */
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; $('installBtn').hidden = false; });
  addEventListener('appinstalled', () => { installPrompt = null; $('installBtn').hidden = true; toast('<b>📲 app instalado!</b>agora o pomodoro tem ícone próprio no seu aparelho.'); });
  /* iPhone/iPad não têm instalação automática: o botão mostra o passo a passo */
  if (isIOS && !installed()) $('installBtn').hidden = false;
  $('installBtn').onclick = async () => {
    if (installPrompt) { installPrompt.prompt(); const r = await installPrompt.userChoice.catch(() => null); if (r && r.outcome === 'accepted') $('installBtn').hidden = true; installPrompt = null; return; }
    if (isIOS) toast('<b>📲 instalar no iPhone</b>no Safari, toque em compartilhar (o quadradinho com a setinha) e depois em "Adicionar à Tela de Início".');
  };

  /* minimizar painéis: o botão ▾ de cada painel recolhe o conteúdo; a escolha fica guardada neste aparelho */
  const MINKEY = 'pomodoro-min';
  let minSet = new Set();
  try { minSet = new Set(JSON.parse(localStorage.getItem(MINKEY)) || []); } catch (e) {}
  document.querySelectorAll('.panel[id]').forEach(p => {
    const h = p.querySelector(':scope > h2'); if (!h) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'minbtn';
    const upd = () => { const m = p.classList.contains('min'); b.textContent = m ? '▸' : '▾'; b.setAttribute('aria-expanded', !m); b.setAttribute('aria-label', m ? 'Mostrar painel' : 'Minimizar painel'); b.title = m ? 'Mostrar painel' : 'Minimizar painel'; };
    if (minSet.has(p.id)) p.classList.add('min');
    upd();
    b.onclick = () => {
      p.classList.toggle('min');
      p.classList.contains('min') ? minSet.add(p.id) : minSet.delete(p.id);
      try { localStorage.setItem(MINKEY, JSON.stringify([...minSet])); } catch (e) {}
      upd();
    };
    h.appendChild(b);
  });

  /* ---------- organizar painéis: cada pessoa deixa os painéis na ordem que quiser ----------
     Botão "🧩 organizar": os painéis encolhem (só o título) e ganham setas ↑ ↓ e ⇄ (outra coluna); no computador
     também dá para arrastar. A ordem fica guardada só neste aparelho (pomodoro-layout), como o minimizar.
     Zonas: "side" (ao lado do cronômetro: só troca a ordem lá) e as duas colunas de baixo, "c0" e "c1" */
  const LKEY = 'pomodoro-layout';
  const zones = {side:document.querySelector('.side-col'), c0:document.querySelectorAll('.board > .stack')[0], c1:document.querySelectorAll('.board > .stack')[1]};
  const zoneKeys = Object.keys(zones).filter(z => zones[z]);
  const panelsIn = z => [...zones[z].children].filter(p => p.matches('.panel[id]'));
  const defaultLayout = {}, home = {};
  zoneKeys.forEach(z => { defaultLayout[z] = panelsIn(z).map(p => p.id); defaultLayout[z].forEach(id => { home[id] = z; $(id).dataset.zone = z === 'side' ? 'side' : 'board'; }); });
  const sameKind = (id, z) => (home[id] === 'side') === (z === 'side');
  function applyLayout(lay) {
    const placed = new Set();
    zoneKeys.forEach(z => (Array.isArray(lay[z]) ? lay[z] : []).forEach(id => {
      if (!home[id] || placed.has(id) || !sameKind(id, z)) return;
      zones[z].appendChild($(id)); placed.add(id);
    }));
    /* painel que a ordem guardada não conhece (novo no site) vai para o lugar padrão dele, no fim */
    Object.keys(home).forEach(id => { if (!placed.has(id)) zones[home[id]].appendChild($(id)); });
  }
  const saveLayout = () => { const lay = {}; zoneKeys.forEach(z => { lay[z] = panelsIn(z).map(p => p.id); }); try { localStorage.setItem(LKEY, JSON.stringify(lay)); } catch (e) {} };
  try { const lay = JSON.parse(localStorage.getItem(LKEY)); if (lay && typeof lay === 'object') applyLayout(lay); } catch (e) {}
  function updateTools() {
    zoneKeys.forEach(z => panelsIn(z).forEach((p, i, all) => {
      const t = p.querySelector(':scope > h2 > .arrtools'); if (!t) return;
      t.children[0].disabled = i === 0; t.children[1].disabled = i === all.length - 1;
    }));
  }
  function movePanel(p, how) {
    const z = zoneKeys.find(k => zones[k] === p.parentElement), all = panelsIn(z), i = all.indexOf(p);
    if (how === 'up' && i > 0) zones[z].insertBefore(p, all[i - 1]);
    else if (how === 'down' && i < all.length - 1) zones[z].insertBefore(p, all[i + 1].nextSibling);
    else if (how === 'swap') { const o = zones[z === 'c0' ? 'c1' : 'c0']; o.insertBefore(p, panelsIn(z === 'c0' ? 'c1' : 'c0')[Math.min(i, o.children.length)] || null); }
    saveLayout(); updateTools();
    p.scrollIntoView({behavior:'smooth', block:'nearest'});
  }
  Object.keys(home).forEach(id => {
    const p = $(id), h = p.querySelector(':scope > h2'); if (!h) return;
    const box = document.createElement('span'); box.className = 'arrtools';
    [['↑', 'up', 'Subir painel'], ['↓', 'down', 'Descer painel'], ['⇄', 'swap', 'Mandar para a outra coluna']].forEach(([t, how, label]) => {
      if (how === 'swap' && home[id] === 'side') return;
      const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.title = label; b.setAttribute('aria-label', label);
      b.onclick = () => movePanel(p, how);
      box.appendChild(b);
    });
    h.appendChild(box);
  });
  function arrange(on) {
    document.body.classList.toggle('arrange', on);
    $('arrangeBar').hidden = !on;
    Object.keys(home).forEach(id => { $(id).draggable = on; });
    updateTools();
    if (on) (zones.c0 || zones.side).scrollIntoView({behavior:'smooth', block:'start'});
  }
  $('arrangeBtn').onclick = () => arrange(!document.body.classList.contains('arrange'));
  $('arrangeDone').onclick = () => { arrange(false); toast('<b>🧩 painéis organizados!</b>a ordem fica guardada neste aparelho.'); };
  $('arrangeReset').onclick = () => { applyLayout(defaultLayout); try { localStorage.removeItem(LKEY); } catch (e) {} updateTools(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('arrange')) arrange(false); });
  /* arrastar (computador): solta em cima de um painel = antes ou depois dele; solta no vazio da coluna = no fim */
  let dragP = null;
  const clearDrop = () => document.querySelectorAll('.dropbefore, .dropafter').forEach(x => x.classList.remove('dropbefore', 'dropafter'));
  const dropSpot = e => {
    const el = e.target instanceof Element ? e.target : null, st = el && el.closest('.side-col, .stack');
    const z = st && zoneKeys.find(k => zones[k] === st);
    if (!dragP || !z || !sameKind(dragP.id, z)) return null;
    const t = el.closest('.panel[data-zone]');
    return {st, t:t && t !== dragP && t.parentElement === st ? t : null, onSelf:t === dragP};
  };
  document.addEventListener('dragstart', e => {
    const p = e.target instanceof Element && e.target.closest('.panel[data-zone]');
    if (!p || !document.body.classList.contains('arrange')) return;
    dragP = p; p.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', p.id); } catch (err) {}
  });
  document.addEventListener('dragover', e => {
    const s = dropSpot(e); if (!s) return;
    e.preventDefault(); clearDrop();
    if (s.t) { const r = s.t.getBoundingClientRect(); s.t.classList.add(e.clientY < r.top + r.height / 2 ? 'dropbefore' : 'dropafter'); }
  });
  document.addEventListener('drop', e => {
    const s = dropSpot(e); if (!s) return;
    e.preventDefault();
    if (s.t) { const r = s.t.getBoundingClientRect(); s.st.insertBefore(dragP, e.clientY < r.top + r.height / 2 ? s.t : s.t.nextSibling); }
    else if (!s.onSelf) s.st.appendChild(dragP);
    saveLayout(); updateTools();
  });
  document.addEventListener('dragend', () => { if (dragP) dragP.classList.remove('dragging'); dragP = null; clearDrop(); });

  /* ---------- começar ---------- */
  Scenes.start($('sky'), S.theme);
  Sounds.init({
    container:$('sounds'), stopBtn:$('stopAll'),
    masterRange:$('vol-master'), masterLabel:$('masterVal'), masterDown:$('masterDown'), masterUp:$('masterUp'),
    onCount:n => { if (n > S.maxSounds) { S.maxSounds = n; save(); checkAch(); } }
  });
  const savedTimer = readTimer();
  if (seq()) setMode(null); else setMode('focus');
  restoreTimer(savedTimer); saveTimer();
  lookLabel(); renderActs(); render(); renderProgress(); renderColors(); renderCollection(); renderThemeSounds(); renderHistory();
  renderMusicAuto(); showMusic(S.music);
  renderRoutines(); showDiaryTab('diary'); renderWaterCfg(); renderClocks(); renderMetro(); renderCoins(); renderShop();
  if (S.settings.water && (!waterNext || waterNext < Date.now() - 6 * 3600000)) scheduleWater();
  checkAch(true);
  leagueTick(); renderLeague();

  /* ---------- ponte com a conta na nuvem (js/cloud.js) ---------- */
  function syncSettingsUI() {
    Object.entries(cfg).forEach(([k, id]) => { $(id).value = S.settings[k]; });
    $('cfg-auto').checked = S.settings.auto; $('cfg-sound').checked = S.settings.sound;
    $('cfg-pixel').checked = S.settings.pixelClock; $('cfg-notify').checked = S.settings.notify;
  }
  function merge(a, b) {
    if (!b || !b.history) return a;
    if (!a || !a.history) return b;
    const newer = (b.updatedAt || 0) >= (a.updatedAt || 0) ? b : a, older = newer === b ? a : b;
    const m = clone(newer);
    m.history = Object.assign({}, older.history);
    for (const k in newer.history) {
      const x = newer.history[k], y = m.history[k];
      m.history[k] = !y || (x.pomos || 0) >= (y.pomos || 0) ? x : y;
    }
    m.xp = Math.max(a.xp || 0, b.xp || 0);
    m.total = {};
    ['pomos', 'tasks', 'cycles'].forEach(k => { m.total[k] = Math.max((a.total || {})[k] || 0, (b.total || {})[k] || 0); });
    m.ach = Object.assign({}, older.ach, newer.ach);
    m.flags = Object.assign({}, older.flags, newer.flags);
    m.themesUsed = [...new Set([...(a.themesUsed || []), ...(b.themesUsed || [])])];
    m.maxSounds = Math.max(a.maxSounds || 0, b.maxSounds || 0);
    m.petsUsed = [...new Set([...(a.petsUsed || []), ...(b.petsUsed || [])])];
    m.journal = Object.assign({}, older.journal);
    for (const k in newer.journal || {}) { const x = newer.journal[k], y = m.journal[k]; if (!y || (x.updated || 0) >= (y.updated || 0)) m.journal[k] = x; }
    /* tarefas e notas se juntam item por item: nada criado num aparelho some por causa do outro.
       o que foi apagado fica marcado em "deleted" para não voltar */
    m.deleted = Object.assign({}, a.deleted, b.deleted);
    for (const k in m.deleted) if (Date.now() - m.deleted[k] > 90 * 864e5) delete m.deleted[k];
    const unite = (listA, listB, stamp) => {
      const byId = new Map();
      [...(listA || []), ...(listB || [])].forEach(x => { if (x && x.id && (!byId.has(x.id) || stamp(x) >= stamp(byId.get(x.id)))) byId.set(x.id, x); });
      return [...byId.values()].filter(x => !(m.deleted[x.id] >= stamp(x)));
    };
    const order = (list, ref) => { const pos = new Map((ref || []).map((x, i) => [x.id, i])); return list.sort((x, y) => (pos.has(x.id) ? pos.get(x.id) : 1e9) - (pos.has(y.id) ? pos.get(y.id) : 1e9)); };
    m.tasks = order(unite(older.tasks, newer.tasks, x => x.u || 0), newer.tasks);
    m.notes = unite(older.notes, newer.notes, x => x.updated || 0);
    m.myRoutines = unite(older.myRoutines, newer.myRoutines, x => x.updated || 0);
    /* moedas: o total ganho só cresce; o que foi comprado se soma dos dois lados */
    m.coinsEarned = Math.max(a.coinsEarned || 0, b.coinsEarned || 0);
    m.owned = [...new Set([...(a.owned || []), ...(b.owned || [])])];
    /* missões, metas e desafios já recebidos: junta os dois lados para não receber duas vezes */
    ['missionsClaimed', 'goalsDone', 'chClaimed', 'missionSet', 'duelHidden'].forEach(k => { m[k] = Object.assign({}, older[k], newer[k]); });
    /* lista de missões: fica a que é do dia/semana de agora (o outro aparelho pode ter uma antiga) */
    ['day', 'week'].forEach(kind => {
      const cur = kind === 'day' ? dayKey() : dayKey(weekStart());
      const pick = [(newer.missionSet || {})[kind], (older.missionSet || {})[kind]].find(x => x && x.key === cur);
      if (pick) m.missionSet[kind] = pick;
    });
    m.goals = unite(older.goals, newer.goals, x => x.updated || 0);
    m.countdowns = unite(older.countdowns, newer.countdowns, x => x.updated || 0);
    /* liga: fica a que já fechou a semana mais recente */
    const la = a.league || {}, lb = b.league || {};
    m.league = Object.assign({}, (la.at || 0) > (lb.at || 0) ? la : (lb.at || 0) > (la.at || 0) ? lb : (newer.league || {}), {best:Math.max(la.best || 0, lb.best || 0)});
    const ca = a.chest || {}, cb = b.chest || {};
    m.chest = Object.assign({}, (ca.at || 0) >= (cb.at || 0) ? ca : cb, {best:Math.max(ca.best || 0, cb.best || 0)});
    if (m.active && !m.tasks.some(t => t.id === m.active)) m.active = m.tasks[0] ? m.tasks[0].id : null;
    return m;
  }
  window.PomoApp = {
    get: () => S,
    merge,
    toast,
    load(next) {
      const prevMusic = S.music || '';
      S = normalize(clone(next)); store();
      Scenes.set(S.theme);
      if (!running && remaining === total) setMode(mode);
      petKey = '';
      renderActs(); render(); renderProgress(); renderColors(); renderCollection(); renderThemeSounds(); renderHistory(); renderMusicAuto(); syncSettingsUI();
      renderRoutines(); renderDiary(); renderNotes(); renderWaterCfg(); renderClocks(); renderCoins(); renderShop();
      leagueTick(); renderLeague();
      if ((S.music || '') !== prevMusic) showMusic(S.music);
      checkAch(true);
    },
    stats() {
      const n = levelOf(S.xp), [ic, nm] = levelInfo(n);
      let week = 0, weekTasks = 0; const days = {}, water = {}, tasks = {};
      /* 21 dias: o ranking usa os últimos 7 e os desafios de até 7 dias ainda conseguem ser conferidos bem depois de acabar */
      for (let i = 0; i < 21; i++) {
        const d = new Date(); d.setDate(d.getDate() - i); const k = dayKey(d), h = S.history[k] || {}, p = h.pomos || 0;
        if (i < 7) week += p; if (p) days[k] = p; if (h.water) water[k] = h.water;
        /* tarefas dos últimos 7 dias: aparecem no ranking só para mostrar (não entram na disputa) */
        if (i < 7 && h.tasks) { tasks[k] = h.tasks; weekTasks += h.tasks; }
      }
      /* dia do último pomodoro que conta para a sequência: quem olha o ranking outro dia calcula se ela ainda vale */
      const st = streak(), today = dayKey(), y = new Date(); y.setDate(y.getDate() - 1);
      const lastDay = st ? ((S.history[today] || {}).pomos ? today : dayKey(y)) : '';
      return {xp:S.xp, level:n, levelName:nm, levelIc:ic, weekPomos:week, streak:st, pet:S.pet, petColor:petColor(petId()) || '', petOutfit:outfitOf(petId()), plant:plantOf(S.plant).id, days, lastDay, water, league:S.league.tier, tasks, weekTasks};
    },
    /* o que estou fazendo agora, para a minha própria linha do ranking (não vai para a nuvem) */
    nowMine: () => ({m:mode, a:S.activity, run:running, end:running ? endAt : 0, at:Date.now()}),
    plantIc: id => plantOf(id).ic,
    leagueIc: n => { const t = LEAGUES[n] || LEAGUES[0]; return t.ic + ' ' + T(t.nm); },
    /* bichinho de uma amizade no ranking (personagem que este site não tem vira o primeiro bichinho) */
    drawPet(cv, id, color, outfit) {
      const ok = Pets.LIST.some(p => p.id === id);
      Pets.draw(cv, ok ? id : Pets.LIST[0].id, true, ok && color || null, ok && outfit && typeof outfit === 'object' ? outfit : null);
    },
    actIc: id => actOf(id).ic,
    /* focar junto: estado do cronômetro e aplicar o que veio da outra pessoa (sem mandar de volta) */
    timer: timerState,
    applyTimer(t) {
      if (!t || !LABEL[t.mode] || !(t.total > 0)) return;
      applying = true;
      try {
        /* os relógios dos aparelhos nunca batem 100%: se o meu foco estava acabando, conto ele antes de trocar */
        if (mode === 'focus' && t.mode !== 'focus' && running && endAt - Date.now() < 8000) finish(true);
        mode = t.mode; total = t.total; running = !!t.running; pendingMode = null;
        if (running) { endAt = t.endAt; remaining = Math.max(0, endAt - Date.now()); wake(true); }
        else { remaining = Math.min(Math.max(0, t.remaining), total); wake(false); }
        if (mode !== 'focus') breakId = Date.now();
        saveTimer(); render(); nowChanged();
      } finally { applying = false; }
    },
    /* o que a pessoa está fazendo agora (só vai para a nuvem se ela ligar "mostrar às amizades") */
    now() {
      if (!S.settings.shareNow) return null;
      return {m:mode, a:S.activity, run:running, end:running ? endAt : 0, left:running ? 0 : remaining, at:Date.now()};
    },
    shareNow(on) { if (on === undefined) return !!S.settings.shareNow; S.settings.shareNow = !!on; save(); },
    pomosOn: k => (S.history[k] || {}).pomos || 0,
    waterOn: k => (S.history[k] || {}).water || 0,
    actLabel: id => { const a = actOf(id); return a.ic + ' ' + T(a.nm); },
    modeLabel: m => T(LABEL[m] || 'foco'),
    /* resultado de um desafio: cada pessoa recebe o seu prêmio uma vez */
    claimDuel(id, res) {
      if (S.chClaimed[id]) return false;
      S.chClaimed[id] = res; const c = res === 'win' ? 30 : res === 'tie' ? 10 : 0;
      earn(c); save(); checkAch();
      toast(res === 'win' ? `<b>🥇 ${T('você venceu o desafio!')}</b>+30 🪙` : res === 'tie' ? `<b>🤝 ${T('empate!')}</b>+10 🪙` : `<b>⚔️ ${T('desafio encerrado')}</b>${T('não foi dessa vez. bora uma revanche?')}`);
      return true;
    },
    claimed: id => S.chClaimed[id],
    /* ✕ num desafio só esconde para quem clicou (a outra pessoa ainda recebe o prêmio dela) */
    hideDuel(id) { S.duelHidden[id] = Date.now(); save(); },
    duelHidden: id => !!S.duelHidden[id],
    dayKey,
    petIcon: id => (Pets.LIST.find(p => p.id === id) || Pets.LIST[0]).ic,
    flag(name) { if (!S.flags[name]) { S.flags[name] = true; save(); checkAch(); } },
    exportData: () => clone(S)
  };
})();
