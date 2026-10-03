/* ---------- bichinhos em pixel (16x16) ---------- */
window.Pets = (() => {
  // o = contorno, b = corpo, d = orelha escura, l = barriga, e = olho, p = nariz/bochecha, w = branco
  const BODY = [
    '..obbbbbbbbo....',
    '..obllllllbo....',
    '.obbllllllbbo.o.',
    '.obbllllllbbooo.',
    '.obbllllllbbo...',
    '..oooooooooo....',
    '................'
  ];
  const BODY_NOTAIL = BODY.map(row => row.slice(0, 13) + '...');
  const HEADS = {
    gato: [
      '................',
      '..o........o....',
      '.obo......obo...',
      '.obbo....obbo...',
      '.obbboooobbbo...',
      '.obbbbbbbbbbo...',
      '.obbebbbbebbo...',
      '.obbebbbbebbo...',
      '.obbbbppbbbbo...'
    ],
    cachorro: [
      '................',
      '................',
      '...oooooooo.....',
      '..obbbbbbbbo....',
      '.oddbbbbbbddo...',
      '.oddbbbbbbddo...',
      '.oddebbbbeddo...',
      '.odbebbbbebdo...',
      '.obbbbppbbbbo...'
    ],
    coelho: [
      '...o......o.....',
      '..obo....obo....',
      '..opo....opo....',
      '..opo....opo....',
      '.oobboooobboo...',
      '.obbbbbbbbbbo...',
      '.obbebbbbebbo...',
      '.obbebbbbebbo...',
      '.obpbbppbbpbo...'
    ],
    sapo: [
      '................',
      '..ooo....ooo....',
      '.owewo..owewo...',
      '.owewo..owewo...',
      '.obbboooobbbo...',
      '.obbbbbbbbbbo...',
      '.opbbbbbbbbpo...',
      '.obboooooobbo...',
      '.obbbbbbbbbbo...'
    ],
    raposa: [
      '................',
      '..o........o....',
      '.odo......odo...',
      '.obbo....obbo...',
      '.obbboooobbbo...',
      '.obbbbbbbbbbo...',
      '.obbebbbbebbo...',
      '.ollebbbbello...',
      '.olllloollllo...'
    ],
    hamster: [
      '................',
      '................',
      '..oo......oo....',
      '.opbo....obpo...',
      '.obbboooobbbo...',
      '.obbbbbbbbbbo...',
      '.obbebbbbebbo...',
      '.obbebbbbebbo...',
      '.oplllpplllpo...'
    ],
    pinguim: [
      '................',
      '................',
      '...oooooooo.....',
      '..obbbbbbbbo....',
      '.obbbbbbbbbbo...',
      '.obbllllllbbo...',
      '.oblelllleblo...',
      '.oblelllleblo...',
      '.oblllnnlllbo...'
    ],
    panda: [
      '................',
      '................',
      '.ddd......ddd...',
      '.ddoooooooodd...',
      '.obbbbbbbbbbo...',
      '.obbbbbbbbbbo...',
      '.obdebbbbedbo...',
      '.obdebbbbedbo...',
      '.obbbbddbbbbo...'
    ],
    pato: [
      '................',
      '................',
      '...oooooooo.....',
      '..obbbbbbbbo....',
      '.obbbbbbbbbbo...',
      '.obbbbbbbbbbo...',
      '.obbebbbbebbo...',
      '.obbebbbbebbo...',
      '.obbnnnnnnbbo...'
    ],
    urso: [
      '................',
      '................',
      '.ooo......ooo...',
      '.opoooooooopo...',
      '.obbbbbbbbbbo...',
      '.obbbbbbbbbbo...',
      '.obbebbbbebbo...',
      '.obbebbbbebbo...',
      '.obbblooblbbo...'
    ]
  };
  const PAL = {
    gato:     {o:'#2A2238', b:'#F2A65A', l:'#FBE3C4', e:'#2A2238', p:'#E88A9A', lid:'b'},
    cachorro: {o:'#2A2238', b:'#D9B68C', d:'#8A5A3C', l:'#F4E6D0', e:'#2A2238', p:'#2A2238', lid:'b'},
    coelho:   {o:'#5A5070', b:'#EDEAF2', l:'#FFFFFF', e:'#2A2238', p:'#F2A7B8', lid:'b'},
    sapo:     {o:'#1F3A26', b:'#7CC47F', l:'#D8F0C8', w:'#FFFFFF', e:'#1F3A26', p:'#F2A7B8', lid:'w'},
    raposa:   {o:'#2A2238', b:'#E8783A', d:'#2A2238', l:'#FFF3E6', e:'#2A2238', lid:'b'},
    hamster:  {o:'#5A4030', b:'#E6B98A', l:'#FFF4E4', e:'#2A2238', p:'#F2A7B8', lid:'b'},
    pinguim:  {o:'#111118', b:'#2B2B3A', l:'#F4F4F8', e:'#111118', n:'#F2A03D', lid:'l'},
    panda:    {o:'#2B2B3A', b:'#F4F4F8', l:'#FFFFFF', d:'#2B2B3A', e:'#FFFFFF', lid:'d'},
    pato:     {o:'#6B5020', b:'#F7D154', l:'#FFF1B8', e:'#2A2238', n:'#F2903D', lid:'b'},
    urso:     {o:'#3A2618', b:'#9A6A48', l:'#D9B894', p:'#D9B894', e:'#2A2238', lid:'b'}
  };
  const LIST = [
    {id:'gato', ic:'🐱', name:'gatinho', level:1},
    {id:'raposa', ic:'🦊', name:'raposinha', level:2},
    {id:'cachorro', ic:'🐶', name:'cachorrinho', level:3},
    {id:'hamster', ic:'🐹', name:'hamster', level:4},
    {id:'coelho', ic:'🐰', name:'coelhinho', level:5},
    {id:'pinguim', ic:'🐧', name:'pinguim', level:6},
    {id:'sapo', ic:'🐸', name:'sapinho', level:7},
    {id:'panda', ic:'🐼', name:'panda', level:8},
    {id:'pato', ic:'🦆', name:'patinho', level:9},
    {id:'urso', ic:'🐻', name:'ursinho', level:10}
  ];
  /* ---------- personagens especiais: desenho inteiro 16x16, comprados com moedas na coleção ----------
     ("e" = olho que pisca, "lid" = cor da pálpebra). Não pintam e não usam roupinhas: isso é só dos bichinhos.
     O site oficial não tem nenhum; a cópia dos fãs acrescenta os seus com Pets.addSpecial (pomodoro-fas/fas.js) */
  const SPRITES = {};

  /* cores para pintar o bichinho */
  const COLORS = [['preto', '#2E2A36'], ['cinza', '#9A98A6'], ['branco', '#F4F2F6'], ['creme', '#E8D2B0'], ['laranja', '#F2A65A'], ['marrom', '#8A5A3C'],
    ['rosa', '#F4A3C0'], ['lilás', '#B99AF5'], ['azul', '#8EC5F0'], ['verde', '#9CD5A8'], ['amarelo', '#F7D154'], ['vermelho', '#E0645A']];
  function mix(hex, to, f) {
    const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
    const c = [16, 8, 0].map(s => Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function paint(pal, color) {
    const n = parseInt(color.slice(1), 16), lum = (.299 * (n >> 16) + .587 * (n >> 8 & 255) + .114 * (n & 255)) / 255;
    const p = Object.assign({}, pal, {b:color, l:mix(color, '#FFFFFF', lum < .35 ? .25 : .55)});
    if (pal.d && pal.d !== pal.o) p.d = mix(color, '#000000', .45);
    if (lum < .3) { p.o = '#0E0B14'; p.e = '#9FD8FF'; }
    else if (lum > .85) { p.o = '#6B6480'; }
    return p;
  }
  /* ---------- roupinhas da lojinha ----------
     cada item é um desenho por cima do bichinho (linha: texto de 16 colunas, '.' = transparente).
     slot: cabeça, rosto, pescoço ou roupa; a roupa pinta a barriga (linhas 10 a 13) */
  const ITEMS = [
    {id:'laco', slot:'cabeca', name:'laço', ic:'🎀', price:40, pal:{r:'#F27AA0', d:'#C94F7C'}, rows:{1:'........rr.rr...', 2:'........rrdrr...'}},
    {id:'flor', slot:'cabeca', name:'florzinha', ic:'🌸', price:50, pal:{p:'#F4A3C0', y:'#F2C94C', g:'#6FAE7C'}, rows:{0:'.........p......', 1:'........pyp.....', 2:'.........pg.....'}},
    {id:'gorro-rosa', slot:'cabeca', name:'gorro rosa', ic:'🧶', price:60, pal:{c:'#F4A3C0', d:'#D97CA0', w:'#FFFFFF'}, rows:{0:'......ww........', 1:'....cccccc......', 2:'...cccccccc.....', 3:'...dddddddd.....'}},
    {id:'gorro-azul', slot:'cabeca', name:'gorro azul', ic:'🧢', price:60, pal:{c:'#8EC5F0', d:'#5E9BD0', w:'#FFFFFF'}, rows:{0:'......ww........', 1:'....cccccc......', 2:'...cccccccc.....', 3:'...dddddddd.....'}},
    {id:'bone', slot:'cabeca', name:'boné', ic:'🧢', price:80, pal:{c:'#E0645A', d:'#B84A40'}, rows:{1:'....cccccc......', 2:'...cccccccc.....', 3:'...ddddddddddd..'}},
    {id:'festa', slot:'cabeca', name:'chapéu de festa', ic:'🥳', price:100, pal:{a:'#B99AF5', b:'#F2C94C', w:'#FFFFFF'}, rows:{0:'......ww........', 1:'......ab........', 2:'.....abab.......', 3:'....ababab......'}},
    {id:'bruxa', slot:'cabeca', name:'chapéu de bruxa', ic:'🧙', price:150, pal:{c:'#5B3A8C', y:'#F2B872'}, rows:{0:'.......c........', 1:'......ccc.......', 2:'.....ccccc......', 3:'..cccyyyyyccc...'}},
    {id:'coroa', slot:'cabeca', name:'coroa', ic:'👑', price:300, pal:{y:'#F2C94C', r:'#E0645A', d:'#C9A032'}, rows:{0:'...y..yy..y.....', 1:'...yyyyyyyy.....', 2:'...yyryyryy.....', 3:'...dddddddd.....'}},
    {id:'oculos', slot:'rosto', name:'óculos escuros', ic:'🕶️', price:120, pal:{k:'#1E1B2A'}, rows:{6:'...kkkkkkkk.....', 7:'...kkk..kkk.....'}},
    {id:'oculos-coracao', slot:'rosto', name:'óculos de coração', ic:'💖', price:120, pal:{h:'#F27AA0'}, rows:{5:'...h.h..h.h.....', 6:'...hhh..hhh.....', 7:'....h....h......'}},
    {id:'gravata', slot:'pescoco', name:'gravatinha', ic:'🎀', price:50, pal:{c:'#E0645A', d:'#B84A40'}, rows:{9:'....ccddcc......', 10:'....c....c......'}},
    {id:'bandana', slot:'pescoco', name:'bandana', ic:'🧣', price:60, pal:{c:'#8EC5F0', w:'#FFFFFF'}, rows:{9:'...cccwcccc.....', 10:'....cccccc......', 11:'.....cccc.......', 12:'......cc........'}},
    {id:'cachecol', slot:'pescoco', name:'cachecol', ic:'🧣', price:70, pal:{c:'#9CD5A8', d:'#6FAE7C'}, rows:{9:'...cdcdcdcd.....', 10:'.........dc.....', 11:'.........cd.....'}},
    {id:'sueter', slot:'roupa', name:'suéter listrado', ic:'👕', price:150, paint:y => y % 2 ? '#F4F2F6' : '#E0645A'},
    {id:'moletom', slot:'roupa', name:'moletom lilás', ic:'🧥', price:180, paint:(y, x) => y === 12 && x > 4 && x < 9 ? '#9C7BE0' : '#B99AF5'},
    {id:'capa', slot:'roupa', name:'capa de herói', ic:'🦸', price:200, pal:{c:'#E0645A'}, behind:true, rows:{9:'.c..........c...', 10:'c............c..', 11:'c............c..', 12:'c............c..', 13:'c............c..', 14:'.cc.........cc..'}},
    {id:'orelhas', slot:'cabeca', name:'orelhas de coelho', ic:'🐰', price:80, pal:{w:'#FFFFFF', p:'#F4A3C0'}, rows:{0:'...ww....ww.....', 1:'...wp....pw.....', 2:'...ww....ww.....'}},
    {id:'chef', slot:'cabeca', name:'chapéu de chef', ic:'👨‍🍳', price:90, pal:{w:'#FFFFFF', g:'#DCDCE6'}, rows:{0:'....wwwwww......', 1:'...wwwwwwww.....', 2:'....wwwwww......', 3:'....gggggg......'}},
    {id:'noel', slot:'cabeca', name:'gorro de Natal', ic:'🎅', price:90, pal:{r:'#E0645A', w:'#FFFFFF'}, rows:{0:'.......rrrw.....', 1:'....rrrrrr......', 2:'...rrrrrrrr.....', 3:'...wwwwwwww.....'}},
    {id:'fones', slot:'cabeca', name:'fones de ouvido', ic:'🎧', price:110, pal:{k:'#2B2B3A', p:'#F4A3C0'}, rows:{1:'...kkkkkkkk.....', 2:'..k........k....', 3:'..k........k....', 4:'..k........k....', 5:'.pp........pp...', 6:'.pp........pp...', 7:'.pp........pp...'}},
    {id:'aureola', slot:'cabeca', name:'auréola', ic:'😇', price:120, pal:{y:'#F7E27A'}, rows:{0:'....yyyyyy......', 1:'...y......y.....'}},
    {id:'oculos-nerd', slot:'rosto', name:'óculos redondos', ic:'🤓', price:80, pal:{k:'#2B2B3A'}, rows:{5:'...kkk..kkk.....', 6:'...k.kkkk.k.....', 7:'...kkk..kkk.....'}},
    {id:'bigode', slot:'rosto', name:'bigode', ic:'🥸', price:60, pal:{k:'#3A2A20', d:'#5A4030'}, rows:{7:'..k........k....', 8:'..dkkk..kkkd....', 9:'....kkkkkk......'}},
    {id:'sininho', slot:'pescoco', name:'coleira de sininho', ic:'🔔', price:50, pal:{r:'#E0645A', y:'#F2C94C'}, rows:{9:'...rrrrrrrr.....', 10:'......yy........'}},
    {id:'perolas', slot:'pescoco', name:'colar de pérolas', ic:'📿', price:90, pal:{w:'#F4F2F6', g:'#C9C4D6'}, rows:{9:'...wgwgwgwg.....', 10:'......ww........'}},
    {id:'pijama', slot:'roupa', name:'pijama de bolinhas', ic:'🌙', price:150, paint:(y, x) => (x + y) % 3 === 0 ? '#F4F2F6' : '#8EC5F0'},
    {id:'asas-anjo', slot:'roupa', name:'asas de anjo', ic:'🪽', price:220, pal:{w:'#FFFFFF', g:'#DCDCE6'}, behind:true, rows:{8:'ww..........ww..', 9:'www........www..', 10:'gww........wwg..', 11:'.gw........wg...', 12:'..g........g....'}},
    {id:'asas-morcego', slot:'roupa', name:'asas de morcego', ic:'🦇', price:220, pal:{k:'#3A2E4A'}, behind:true, rows:{8:'k............k..', 9:'kk..........kk..', 10:'kkk........kkk..', 11:'k.k........k.k..'}},
    /* evento de Halloween: só aparecem na lojinha em outubro (quem comprou fica com eles para sempre) */
    {id:'abobora', slot:'cabeca', name:'abóbora na cabeça', ic:'🎃', price:130, event:'halloween', pal:{o:'#FF8A1F', d:'#A8461A', g:'#4F9A5C'}, rows:{0:'......gg........', 1:'....dddddd......', 2:'...dodoodod.....', 3:'...dddddddd.....'}},
    {id:'aranha', slot:'pescoco', name:'colar de aranha', ic:'🕷️', price:70, event:'halloween', pal:{k:'#1E1B2A', r:'#E0645A'}, rows:{9:'...kkkkkkkk.....', 10:'.....krrk.......', 11:'.....k..k.......'}},
    {id:'fantasma', slot:'roupa', name:'lençol de fantasma', ic:'👻', price:180, event:'halloween', paint:(y, x) => y === 13 && x % 2 ? '#C9C4D6' : '#F4F2F6'},
    {id:'vampiro', slot:'roupa', name:'capa de vampiro', ic:'🧛', price:200, event:'halloween', pal:{k:'#2B2238', r:'#B8323A'}, behind:true, rows:{6:'.k...........k..', 7:'.kk.........kk..', 8:'krk.........krk.', 9:'kr...........rk.', 10:'kr...........rk.', 11:'kr...........rk.', 12:'kr...........rk.', 13:'kr...........rk.', 14:'.kk.........kk..'}}
  ];
  const SLOTS = ['roupa', 'pescoco', 'rosto', 'cabeca'];
  const EYES_UP = {sapo:-4};
  function overlay(c, item, dy = 0) {
    for (const [y, row] of Object.entries(item.rows || {})) for (let x = 0; x < 16; x++) {
      const ch = row[x]; if (ch === '.' || !item.pal[ch]) continue;
      c.fillStyle = item.pal[ch]; c.fillRect(x, +y + dy, 1, 1);
    }
  }
  /* faca que se mexe (personagens de Halloween): sp.knife = [linha1, linha2, col1, col2], o pedaço que levanta e dá a facada.
     knifeFrame(ms) dá o deslocamento em pixels da grade naquele instante: parada, levanta, levanta mais, desce com tudo */
  const KNIFE = [0, 0, 0, 0, 0, 0, -1, -2, -2, -2, 1, 1, 0, 0];
  const knifeFrame = ms => KNIFE[Math.floor(ms / 110) % KNIFE.length];
  /* personagem animado (GIF): sp.frames = [linhas do quadro 1, quadro 2, …]; sp.frameEyes = olhos de cada quadro; sp.frameMs = tempo de cada quadro */
  const frameOf = (id, ms) => { const sp = SPRITES[id]; return sp && sp.frames ? Math.floor(ms / (sp.frameMs || 100)) % sp.frames.length : 0; };
  function draw(canvas, id, eyesOpen = true, color = null, outfit = null, knifeDy = 0, frame = 0, sleeping = false) {
    if (!HEADS[id] && !SPRITES[id]) id = 'gato';
    /* pose de dormir própria (ex.: o Tails pousa e dorme sentado) */
    const sp = SPRITES[id] && sleeping && SPRITES[id].sleep ? SPRITES[id].sleep : SPRITES[id];
    /* personagem especial: desenho próprio, sem pintar e sem roupinha */
    const fr = sp && sp.frames ? sp.frames[frame % sp.frames.length] : null;
    const grid = fr || (sp ? sp.rows : HEADS[id].concat(id === 'sapo' || id === 'pinguim' || id === 'pato' ? BODY_NOTAIL : BODY));
    const pal = sp ? sp.pal : color ? paint(PAL[id], color) : PAL[id];
    /* especiais podem ter 32x32 (o dobro de detalhe no mesmo tamanho de tela) */
    const N = grid.length;
    if (canvas.width !== N) { canvas.width = N; canvas.height = N; }
    const c = canvas.getContext('2d'); c.clearRect(0, 0, N, N);
    const wear = outfit && !sp ? SLOTS.map(s => ITEMS.find(i => i.id === outfit[s])).filter(Boolean) : [];
    wear.filter(i => i.behind).forEach(i => overlay(c, i));
    const shirt = wear.find(i => i.paint);
    /* olho = letra "e"/"i", ou as casas listadas em sp.eyes (olho de várias cores, ex.: branco com pupila preta) */
    const eyeList = sp ? (sp.frameEyes ? sp.frameEyes[frame % sp.frameEyes.length] : sp.eyes) : null;
    const mask = eyeList ? new Set(eyeList.map(([y, x]) => y * N + x)) : null;
    const eye = (y, x) => { const ch = (grid[y] || '')[x]; return ch === 'e' || ch === 'i' || (!!mask && mask.has(y * N + x)); };
    const kn = sp && sp.knife, inKnife = (y, x) => !!kn && y >= kn[0] && y <= kn[1] && x >= kn[2] && x <= kn[3];
    /* a faca é desenhada depois, deslocada (a escala da grade grande é maior: 2 casas numa grade de 40 ≈ 1 casa numa de 16) */
    const kdy = kn ? Math.round(knifeDy * N / 20) : 0;
    for (let pass = 0; pass < (kn ? 2 : 1); pass++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let ch = grid[y][x];
      if (ch === '.' || (kn && inKnife(y, x) !== (pass === 1))) continue;
      const yy = pass === 1 ? y + kdy : y;
      /* piscar: o olho vira pálpebra, e a última linha do olho vira um risquinho */
      if (!eyesOpen && eye(y, x)) ch = eye(y + 1, x) ? pal.lid : 'o';
      c.fillStyle = shirt && y >= 10 && y <= 13 && (ch === 'b' || ch === 'l') ? shirt.paint(y, x) : pal[ch] || pal.b || '#000';
      c.fillRect(x, yy, 1, 1);
    }
    wear.filter(i => !i.behind && !i.paint).forEach(i => overlay(c, i, i.slot === 'rosto' ? EYES_UP[id] || 0 : 0));
  }
  /* outro arquivo pode acrescentar personagens (usado pela cópia dos fãs) */
  function addSpecial(info, sprite) { SPRITES[info.id] = sprite; info.special = true; info.level = info.level || 1; LIST.push(info); }
  return {LIST, COLORS, ITEMS, SLOTS, draw, addSpecial, knifeFrame, frameOf, isSpecial:id => !!SPRITES[id], hasKnife:id => !!(SPRITES[id] && SPRITES[id].knife)};
})();
