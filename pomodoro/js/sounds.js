/* ---------- sons ambiente: tudo gerado no navegador, sem arquivos ---------- */
window.Sounds = (() => {
  const KEY = 'pomodoro-sons';
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  const saveVols = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };
  let ctx, master;
  function audio() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor();
      master = ctx.createGain(); master.gain.value = saved.master ?? .9;
      master.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* blocos básicos */
  const buffers = {}, FADE = 2000;
  function noise(kind) {
    if (buffers[kind]) return buffers[kind];
    const len = ctx.sampleRate * 6, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let l = 0, p0 = 0, p1 = 0, p2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'brown') { l = (l + .02 * w) / 1.02; d[i] = l * 3.5; }
      else if (kind === 'pink') { p0 = .99765 * p0 + w * .099046; p1 = .963 * p1 + w * .2965164; p2 = .57 * p2 + w * 1.0526913; d[i] = (p0 + p1 + p2 + w * .1848) * .11; }
      else d[i] = w;
    }
    for (let i = 0; i < FADE; i++) { const a = i / FADE; d[len - FADE + i] = d[len - FADE + i] * (1 - a) + d[i] * a; }
    return buffers[kind] = b;
  }
  const gn = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const filt = (type, freq, Q = .7) => { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = Q; return f; };
  const chain = (a, dest) => { a.connect(dest); return a; };
  function loopNoise(kind, dest) {
    const s = ctx.createBufferSource(); s.buffer = noise(kind); s.loop = true;
    s.loopStart = FADE / ctx.sampleRate; s.loopEnd = s.buffer.duration;
    s.connect(dest); s.start(); return s;
  }
  function lfo(rate, depth, target) {
    const o = ctx.createOscillator(), g = gn(depth); o.frequency.value = rate;
    o.connect(g).connect(target); o.start(); return o;
  }
  function repeat(fn, minMs, maxMs) {
    let on = true;
    (function go() { if (!on) return; fn(ctx.currentTime + .05); setTimeout(go, minMs + Math.random() * (maxMs - minMs)); })();
    return () => { on = false; };
  }
  function crackles(dest, perSec, freq, amp) {
    let on = true;
    (function pop() {
      if (!on) return;
      const t = ctx.currentTime + .05, s = ctx.createBufferSource(), g = gn(0);
      s.buffer = noise('white');
      g.gain.setValueAtTime(amp * (.3 + Math.random()), t);
      g.gain.exponentialRampToValueAtTime(.0001, t + .01 + Math.random() * .04);
      s.connect(filt('bandpass', freq * (.6 + Math.random() * .8), 1.5)).connect(g).connect(dest);
      s.start(t, Math.random() * 5, .08);
      setTimeout(pop, -Math.log(1 - Math.random()) * 1000 / perSec);
    })();
    return () => { on = false; };
  }
  const withBag = fn => out => { const bag = []; fn(out, bag); return () => bag.forEach(x => typeof x === 'function' ? x() : x.stop()); };

  /* batida lo-fi: Fmaj7 · Em7 · Dm7 · Cmaj7 a 74 bpm, com swing */
  function beat(out) {
    const bus = gn(.8); bus.connect(filt('lowpass', 3200)).connect(out);
    const s16 = 60 / 74 / 4, hz = m => 440 * Math.pow(2, (m - 69) / 12);
    const CH = [[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59]];
    let step = 0, next = ctx.currentTime + .1;
    function tone(t, m, dur, type, vol, det = 0) {
      const o = ctx.createOscillator(), g = gn(0);
      o.type = type; o.frequency.value = hz(m); o.detune.value = det;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02);
      g.gain.exponentialRampToValueAtTime(vol * .25, t + dur * .5); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(bus); o.start(t); o.stop(t + dur + .05);
    }
    const keys = (t, notes, dur) => notes.forEach((m, i) => { tone(t + i * .02, m, dur, 'triangle', .045, -7); tone(t + i * .02, m, dur, 'triangle', .045, 7); });
    function kick(t) {
      const o = ctx.createOscillator(), g = gn(0);
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + .14);
      g.gain.setValueAtTime(.8, t); g.gain.exponentialRampToValueAtTime(.001, t + .4);
      o.connect(g).connect(bus); o.start(t); o.stop(t + .42);
    }
    function hit(t, type, freq, vol, dur) {
      const s = ctx.createBufferSource(), g = gn(0); s.buffer = noise('white');
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      s.connect(filt(type, freq, .7)).connect(g).connect(bus); s.start(t, Math.random() * 4, dur + .02);
    }
    function tick() {
      while (next < ctx.currentTime + .3) {
        const s = step % 16, chord = CH[Math.floor(step / 16) % 4];
        const t = next + (s % 2 ? s16 * .28 : 0);
        if (s === 0) keys(t, chord, s16 * 16);
        if (s === 0 || s === 10) tone(t, chord[0] - 12, s16 * 5, 'sine', .22);
        if (s === 0 || s === 10 || (s === 7 && Math.random() < .4)) kick(t);
        if (s === 4 || s === 12) hit(t, 'bandpass', 1700, .22, .2);
        if (s % 2 === 0) hit(t, 'highpass', 7000, s % 4 ? .025 : .045, .045);
        if (s % 2 === 0 && Math.random() < .12) tone(t, chord[Math.floor(Math.random() * 4)] + 24, s16 * 4, 'sine', .035);
        next += s16; step++;
      }
    }
    const timer = setInterval(tick, 50); tick();
    return () => clearInterval(timer);
  }

  const LIST = [
    {id:'beat', ic:'🎹', name:'batida lo-fi', vol:.6, make:beat},
    {id:'rain', ic:'🌧', name:'chuva', vol:.5, make:withBag((out, bag) => {
      const a = gn(.9); a.connect(out); bag.push(loopNoise('brown', chain(filt('lowpass', 1500), a)));
      const h = gn(.05); h.connect(out); bag.push(loopNoise('white', chain(filt('highpass', 3000), h)));
      bag.push(crackles(out, 30, 4000, .06));
    })},
    {id:'fire', ic:'🔥', name:'lareira', vol:.5, make:withBag((out, bag) => {
      const b = gn(.7); b.connect(out); bag.push(lfo(.3, .2, b.gain)); bag.push(loopNoise('brown', chain(filt('lowpass', 350), b)));
      bag.push(crackles(out, 5, 2200, .5)); bag.push(crackles(out, 18, 1000, .12));
    })},
    {id:'sea', ic:'🌊', name:'mar', vol:.5, make:withBag((out, bag) => {
      const w = gn(.45); w.connect(out); bag.push(lfo(.08, .4, w.gain)); bag.push(loopNoise('pink', chain(filt('lowpass', 900), w)));
      const f = gn(.06); f.connect(out); bag.push(lfo(.08, .05, f.gain)); bag.push(loopNoise('white', chain(filt('highpass', 2500), f)));
    })},
    {id:'wind', ic:'🍃', name:'vento', vol:.4, make:withBag((out, bag) => {
      const bp = filt('bandpass', 500, 1.5), g = gn(1.2); bp.connect(g).connect(out);
      bag.push(lfo(.06, 280, bp.frequency)); bag.push(lfo(.11, .5, g.gain)); bag.push(loopNoise('white', bp));
    })},
    {id:'vinyl', ic:'💿', name:'chiado de vinil', vol:.4, make:withBag((out, bag) => {
      bag.push(crackles(out, 14, 3500, .25));
      const h = gn(.012); h.connect(out); bag.push(loopNoise('white', chain(filt('highpass', 5000), h)));
    })},
    {id:'birds', ic:'🐦', name:'passarinhos', vol:.4, make:withBag((out, bag) => {
      const amb = gn(.05); amb.connect(out); bag.push(loopNoise('pink', chain(filt('highpass', 1200), amb)));
      bag.push(repeat(t => {
        const n = 3 + Math.floor(Math.random() * 5), base = 2400 + Math.random() * 2200;
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : gn(1);
        if (pan.pan) pan.pan.value = Math.random() * 1.6 - .8;
        pan.connect(out);
        for (let i = 0; i < n; i++) {
          const o = ctx.createOscillator(), g = gn(0), ti = t + i * (.09 + Math.random() * .05), f0 = base * (.9 + Math.random() * .3);
          o.frequency.setValueAtTime(f0, ti); o.frequency.exponentialRampToValueAtTime(f0 * (1.25 + Math.random() * .4), ti + .06);
          g.gain.setValueAtTime(0, ti); g.gain.linearRampToValueAtTime(.1, ti + .015); g.gain.exponentialRampToValueAtTime(.001, ti + .08);
          o.connect(g).connect(pan); o.start(ti); o.stop(ti + .1);
        }
      }, 900, 4200));
    })},
    {id:'crickets', ic:'🦗', name:'grilos', vol:.35, make:withBag((out, bag) => {
      const amb = gn(.15); amb.connect(out); bag.push(loopNoise('pink', chain(filt('lowpass', 600), amb)));
      [[4400, 900], [4900, 1300], [4100, 1700]].forEach(([f, per]) => bag.push(repeat(t => {
        for (let i = 0; i < 3; i++) {
          const o = ctx.createOscillator(), g = gn(0), ti = t + i * .045;
          o.frequency.value = f; g.gain.setValueAtTime(0, ti); g.gain.linearRampToValueAtTime(.05, ti + .005); g.gain.linearRampToValueAtTime(0, ti + .03);
          o.connect(g).connect(out); o.start(ti); o.stop(ti + .04);
        }
      }, per * .85, per * 1.15)));
    })},
    {id:'cafe', ic:'☕', name:'cafeteria', vol:.5, make:withBag((out, bag) => {
      [[350, .6, .13], [700, .4, .21], [1200, .22, .17]].forEach(([f, v, rate]) => {
        const g = gn(v); g.connect(out); bag.push(lfo(rate, v * .6, g.gain)); bag.push(loopNoise('pink', chain(filt('bandpass', f, 1.2), g)));
      });
      bag.push(repeat(t => {
        const base = 2200 + Math.random() * 1200;
        [1, 2.76].forEach((m, i) => {
          const o = ctx.createOscillator(), g = gn(0); o.frequency.value = base * m;
          g.gain.setValueAtTime(i ? .02 : .06, t); g.gain.exponentialRampToValueAtTime(.0001, t + .35);
          o.connect(g).connect(out); o.start(t); o.stop(t + .4);
        });
      }, 1500, 6500));
    })},
    {id:'space', ic:'🪐', name:'espaço', vol:.45, make:withBag((out, bag) => {
      const lp = filt('lowpass', 500, 2), g = gn(.12); lp.connect(g).connect(out); bag.push(lfo(.05, 300, lp.frequency));
      [55, 82.4, 110.3, 164.8].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = i % 2 ? 'sawtooth' : 'triangle'; o.frequency.value = f; o.detune.value = (Math.random() - .5) * 12;
        o.connect(lp); o.start(); bag.push(o);
      });
      const sh = gn(.015); sh.connect(out); bag.push(lfo(.07, .012, sh.gain)); bag.push(loopNoise('white', chain(filt('bandpass', 6000, 4), sh)));
    })}
  ];
  const byId = Object.fromEntries(LIST.map(s => [s.id, s]));

  /* metrônomo: clique agendado com antecedência (fica no tempo mesmo com a página ocupada) */
  const Metro = (() => {
    const MKEY = 'pomodoro-metro';
    let st = {bpm:90, vol:.7, beats:4, sound:'relogio', sub:1, accent:true};
    try { Object.assign(st, JSON.parse(localStorage.getItem(MKEY)) || {}); } catch (e) {}
    let on = false, timer = null, next = 0, beat = 0, out = null, onBeat = () => {};
    const store = () => { try { localStorage.setItem(MKEY, JSON.stringify(st)); } catch (e) {} };

    /* peças de som: tom com envelope curto e ruído filtrado */
    function tone(t, freq, vol, dur, type = 'sine', endFreq) {
      const o = ctx.createOscillator(), g = gn(0);
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .002); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      o.connect(g).connect(out); o.start(t); o.stop(t + dur + .02);
    }
    function burst(t, type, freq, vol, dur, Q = 1) {
      const s = ctx.createBufferSource(), g = gn(0); s.buffer = noise('white');
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      s.connect(filt(type, freq, Q)).connect(g).connect(out); s.start(t, Math.random() * 4, dur + .02);
    }
    /* lv: 2 = primeiro tempo (acento), 1 = tempo, 0 = subdivisão */
    const SOUNDS = {
      /* tique de relógio (como o metrônomo do Google): "toc" de madeira por volta de 480 Hz com um estalo
         por volta de 1850 Hz, curtíssimo (~12 ms) e igual em todos os tempos. O acento só deixa um pouco mais forte */
      relogio: lv => t => {
        const v = [.45, .9, 1][lv], up = lv === 2 ? 1.08 : 1;
        tone(t, 480 * up, v, .018);
        tone(t, 1850 * up, v * .85, .016);
        burst(t, 'bandpass', 1850, v * .3, .008, 5);
      },
      clique:  lv => t => tone(t, [800, 1100, 1760][lv], [.35, .7, 1][lv], .05),
      bip:     lv => t => tone(t, [700, 880, 1320][lv], [.12, .22, .3][lv], .07, 'square'),
      madeira: lv => t => { tone(t, [900, 1100, 1500][lv], [.35, .7, 1][lv], .07, 'triangle', [700, 850, 1100][lv]); burst(t, 'bandpass', 2200, [.1, .2, .3][lv], .02, 3); },
      clave:   lv => t => tone(t, [2000, 2500, 3100][lv], [.3, .6, .9][lv], .12),
      cowbell: lv => t => { const f = lv === 2 ? 1.25 : 1; tone(t, 540 * f, [.1, .22, .3][lv], .3, 'square'); tone(t, 800 * f, [.1, .22, .3][lv], .3, 'square'); },
      chimbal: lv => t => burst(t, 'highpass', 7000, [.25, .5, .8][lv], lv === 2 ? .12 : .05),
      baqueta: lv => t => { burst(t, 'bandpass', 2600, [.3, .6, .9][lv], .03, 2); tone(t, 420, [.15, .3, .45][lv], .03, 'triangle'); },
      pendulo: lv => t => tone(t, lv === 2 ? 2100 : beat % 2 ? 1150 : 1500, [.3, .6, .8][lv], .03, 'triangle'),
      bateria: lv => t => {
        if (lv === 0) return burst(t, 'highpass', 7500, .2, .04);
        if (lv === 2) { tone(t, 120, 1, .35, 'sine', 45); return burst(t, 'highpass', 7500, .3, .05); }
        if (beat % 2) { burst(t, 'bandpass', 1800, .7, .18); tone(t, 190, .3, .1, 'triangle'); }
        else { tone(t, 110, .7, .3, 'sine', 45); burst(t, 'highpass', 7500, .3, .05); }
      }
    };
    function click(t, lv) { (SOUNDS[st.sound] || SOUNDS.clique)(lv)(t); }
    function tick() {
      while (next < ctx.currentTime + .12) {
        const b = beat % st.beats, step = 60 / st.bpm, sub = Math.max(1, st.sub | 0);
        click(next, b === 0 && st.beats > 1 && st.accent ? 2 : 1);
        for (let i = 1; i < sub; i++) click(next + step * i / sub, 0);
        setTimeout(() => { if (on) onBeat(b); }, Math.max(0, (next - ctx.currentTime) * 1000));
        next += step; beat++;
      }
    }
    function preview(soundId) {
      try { audio(); } catch (e) { return; }
      const was = out; out = gn(st.vol); out.connect(master);
      const t = ctx.currentTime + .05, keep = st.sound; st.sound = soundId;
      [2, 1, 1, 1].forEach((lv, i) => click(t + i * .3, lv));
      st.sound = keep; const o = out; setTimeout(() => o.disconnect(), 2000); out = was;
    }
    function start() {
      try { audio(); } catch (e) { return; }
      out = gn(st.vol); out.connect(master);
      next = ctx.currentTime + .08; beat = 0; on = true;
      timer = setInterval(tick, 25); tick();
    }
    function stop() {
      on = false; clearInterval(timer);
      if (out) { const o = out; o.gain.setTargetAtTime(0, ctx.currentTime, .01); setTimeout(() => o.disconnect(), 300); out = null; }
    }
    function set(p) {
      Object.assign(st, p);
      st.bpm = Math.round(Math.min(240, Math.max(30, st.bpm)));
      st.vol = Math.min(1, Math.max(0, st.vol));
      if (out && 'vol' in p) out.gain.setTargetAtTime(st.vol, ctx.currentTime, .02);
      if (on && 'beats' in p) beat = 0;
      store();
    }
    return {start, stop, set, preview, get:() => st, isOn:() => on, onBeat:f => { onBeat = f; }};
  })();

  const all = {};
  let onCount = () => {}, stopBtn;
  const nudge = (rng, d) => { rng.value = Math.min(1, Math.max(0, +rng.value + d)).toFixed(2); rng.dispatchEvent(new Event('input')); };
  const countOn = () => Object.values(all).filter(x => x.on).length;
  const refresh = () => { const n = countOn(); stopBtn.hidden = !n; onCount(n); };

  function init(opts) {
    onCount = opts.onCount || onCount; stopBtn = opts.stopBtn;
    const mr = opts.masterRange, mv = opts.masterLabel;
    const showMaster = () => { mv.textContent = Math.round(mr.value * 100) + '%'; };
    mr.value = saved.master ?? .9; showMaster();
    mr.oninput = () => { saved.master = +mr.value; saveVols(); showMaster(); if (master) master.gain.setTargetAtTime(+mr.value, ctx.currentTime, .05); };
    opts.masterDown.onclick = () => nudge(mr, -.1);
    opts.masterUp.onclick = () => nudge(mr, .1);

    LIST.forEach(S => {
      const el = document.createElement('div'); el.className = 'snd';
      el.innerHTML = `<button type="button" class="tg" aria-pressed="false"><span class="ic" aria-hidden="true">${S.ic}</span><span class="nm">${S.name}</span><span class="st">desligado</span></button>
        <div class="vol"><button type="button" class="vb" aria-label="− ${S.name}">−</button><input type="range" id="vol-${S.id}" min="0" max="1" step="0.01" aria-label="🔊 ${S.name}"><button type="button" class="vb" aria-label="+ ${S.name}">+</button></div>`;
      const btn = el.querySelector('.tg'), rng = el.querySelector('input'), [down, up] = el.querySelectorAll('.vb');
      const st = all[S.id] = {id:S.id, on:false, vol:saved[S.id] ?? S.vol, g:null, stop:null};
      rng.value = st.vol;
      const ui = () => { el.classList.toggle('on', st.on); btn.setAttribute('aria-pressed', st.on); btn.querySelector('.st').textContent = st.on ? 'tocando' : 'desligado'; refresh(); };
      st.start = () => {
        try { audio(); } catch (e) { return; }
        st.g = gn(0); st.g.connect(master); st.stop = S.make(st.g);
        st.g.gain.setTargetAtTime(st.vol, ctx.currentTime, .4); st.on = true; ui();
      };
      st.off = () => {
        const g = st.g, stop = st.stop; st.on = false; ui();
        g.gain.setTargetAtTime(0, ctx.currentTime, .25);
        setTimeout(() => { stop(); g.disconnect(); }, 1500);
      };
      btn.onclick = () => st.on ? st.off() : st.start();
      down.onclick = () => nudge(rng, -.1); up.onclick = () => nudge(rng, .1);
      rng.oninput = () => {
        st.vol = +rng.value;
        if (st.on) st.g.gain.setTargetAtTime(st.vol, ctx.currentTime, .05);
        saved[S.id] = st.vol; saveVols();
      };
      opts.container.appendChild(el);
    });
    stopBtn.onclick = stopAll;
  }
  function stopAll() { Object.values(all).forEach(x => x.on && x.off()); }
  function play(ids) {
    Object.values(all).forEach(x => x.on && !ids.includes(x.id) && x.off());
    ids.forEach(id => all[id] && !all[id].on && all[id].start());
  }
  const info = id => byId[id];
  return {init, play, stopAll, info, metro:Metro};
})();
