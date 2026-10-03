# -*- coding: utf-8 -*-
"""Coloca no Pomodoro Lo-fi a opção de ORGANIZAR OS PAINÉIS do jeito que a pessoa quiser.

O que ele faz, passo a passo (pode rodar de novo: o que já foi feito ele pula):
  1. index.html  -> botão "🧩 organizar" no topo e a barrinha "pronto / voltar ao padrão"
  2. style.css   -> o visual do modo organizar
  3. app.js      -> a lógica: setas, arrastar e guardar a ordem neste aparelho (pomodoro-layout)
  4. cloud.js    -> apagar a conta "e os dados deste aparelho" também apaga a ordem guardada
  5. i18n.js     -> traduções em inglês e espanhol

Uso:  python ferramentas\\organizar-paineis.py
"""
import io
import sys
import time
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
RAIZ = Path(__file__).resolve().parent.parent          # pasta pomodoro/
VERDE, AMARELO, VERMELHO, ROSA, FIM = '\033[92m', '\033[93m', '\033[91m', '\033[95m', '\033[0m'


def diga(texto, cor=''):
    """Escreve devagarinho, para dar tempo de ler."""
    print(cor + texto + (FIM if cor else ''), flush=True)
    time.sleep(0.35)


def mudar(arquivo, marca, ancora, novo, onde='depois'):
    """Coloca `novo` antes ou depois de `ancora` no arquivo. Se `marca` já estiver lá, não faz nada."""
    caminho = RAIZ / arquivo
    texto = caminho.read_text(encoding='utf-8', newline='')
    if marca in texto:
        diga(f'   • {arquivo}: já estava feito, pulei', AMARELO)
        return False
    if texto.count(ancora) != 1:
        diga(f'   ✗ {arquivo}: não achei o lugar certo ({ancora[:50]!r})', VERMELHO)
        raise SystemExit(1)
    quebra = '\r\n' if '\r\n' in texto else '\n'
    novo = novo.replace('\r\n', '\n').replace('\n', quebra)
    texto = texto.replace(ancora, ancora + novo if onde == 'depois' else novo + ancora)
    caminho.write_text(texto, encoding='utf-8', newline='')
    diga(f'   ✓ {arquivo}: +{novo.count(quebra) + 1} linhas', VERDE)
    return True


# ---------------------------------------------------------------- 1. HTML
BOTAO = '''
      <button class="chip" id="arrangeBtn" type="button" title="mude os painéis de lugar do seu jeito">🧩 organizar</button>'''

BARRA = '''  <div class="arrangebar" id="arrangeBar" hidden>
    <span>🧩 arraste os painéis ou use as setas</span>
    <button class="chip" id="arrangeReset" type="button">voltar ao padrão</button>
    <button class="btn primary" id="arrangeDone" type="button">pronto</button>
  </div>

'''

# ---------------------------------------------------------------- 2. CSS
CSS = '''
/* organizar painéis: a pessoa muda os painéis de lugar (setas ou arrastando); a ordem fica guardada neste aparelho */
.arrangebar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;width:max-content;max-width:calc(100% - 24px);padding:10px 14px;border-radius:18px;background:var(--night);border:1px solid var(--accent);box-shadow:0 18px 50px rgba(0,0,0,.45);font-size:13px;font-weight:700}
.arrangebar[hidden]{display:none}
.arrangebar .btn{min-width:0;padding:8px 16px}
.arrtools{display:none;gap:4px;margin-left:auto;flex:none}
body.arrange .arrtools{display:flex}
body.arrange .minbtn{display:none}
.arrtools button{width:30px;height:30px;border-radius:10px;border:1px solid var(--line);background:var(--glass2);color:var(--ink);font:700 14px var(--body);cursor:pointer;padding:0}
.arrtools button:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
.arrtools button:disabled{opacity:.3;cursor:default}
body.arrange .panel[data-zone]{outline:2px dashed color-mix(in srgb,var(--accent) 60%,transparent);outline-offset:3px;cursor:grab}
body.arrange .panel[data-zone] > :not(h2){display:none!important}
body.arrange .panel[data-zone] > h2{margin:0}
body.arrange .side-col .side{flex:0 0 auto}
body.arrange .panel.dragging{opacity:.4}
body.arrange .panel.dropbefore{box-shadow:0 -5px 0 var(--accent)}
body.arrange .panel.dropafter{box-shadow:0 5px 0 var(--accent)}
body.arrange .stack{min-height:90px}
body.arrange{padding-bottom:90px}
'''

# ---------------------------------------------------------------- 3. JS
JS = '''  /* ---------- organizar painéis: cada pessoa deixa os painéis na ordem que quiser ----------
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

'''

# ---------------------------------------------------------------- 5. traduções
I18N = '''

    /* organizar painéis */
    'organizar':['arrange','organizar'], 'mude os painéis de lugar do seu jeito':['move the panels around your way','mueve los paneles a tu manera'],
    'arraste os painéis ou use as setas':['drag the panels or use the arrows','arrastra los paneles o usa las flechas'], 'voltar ao padrão':['back to default','volver al orden original'],
    'Subir painel':['Move panel up','Subir panel'], 'Descer painel':['Move panel down','Bajar panel'], 'Mandar para a outra coluna':['Send to the other column','Enviar a la otra columna'],
    'painéis organizados!':['panels arranged!','¡paneles organizados!'], 'a ordem fica guardada neste aparelho.':['the order is saved on this device.','el orden queda guardado en este dispositivo.'],
    'organize do seu jeito':['arrange it your way','organiza a tu manera'],
    'com o botão 🧩 organizar, lá em cima, você muda os painéis de lugar: setas no celular, arrastar no computador.':['with the 🧩 arrange button at the top, you move the panels around: arrows on your phone, drag on a computer.','con el botón 🧩 organizar, arriba, cambias los paneles de lugar: flechas en el celular, arrastrar en la computadora.'],'''

NOVIDADE = '''
    <li><span class="nic" aria-hidden="true">🧩</span><span><b>organize do seu jeito</b><small>com o botão 🧩 organizar, lá em cima, você muda os painéis de lugar: setas no celular, arrastar no computador.</small></span></li>'''


def main():
    diga('')
    diga('🍅  Pomodoro Lo-fi · organizar os painéis', ROSA)
    diga(f'    pasta: {RAIZ}')
    diga('')

    diga('1/5  botão "🧩 organizar" e barrinha no index.html')
    mudar('index.html', 'id="arrangeBtn"',
          '<button class="chip" id="zenBtn" type="button" title="esconde tudo e deixa só o cronômetro">🎯 foco total</button>', BOTAO)
    mudar('index.html', 'id="arrangeBar"', '  <div class="board">', BARRA, onde='antes')
    mudar('index.html', 'organize do seu jeito', '  <ul class="news">', NOVIDADE)

    diga('2/5  visual do modo organizar no style.css')
    mudar('css/style.css', '.arrangebar{', '.side-col .side.min{flex:0 0 auto}', CSS)

    diga('3/5  lógica (setas, arrastar, guardar a ordem) no app.js')
    mudar('js/app.js', "const LKEY = 'pomodoro-layout'", '  /* ---------- começar ---------- */', JS, onde='antes')
    app = RAIZ / 'js/app.js'
    txt = app.read_text(encoding='utf-8', newline='')
    if "const NEWS = '2026-10-02b'" in txt:
        app.write_text(txt.replace("const NEWS = '2026-10-02b'", "const NEWS = '2026-10-03'"), encoding='utf-8', newline='')
        diga('   ✓ js/app.js: janela de novidades marcada como nova (2026-10-03)', VERDE)

    diga('4/5  apagar a conta também apaga a ordem guardada (cloud.js)')
    mudar('js/cloud.js', "'pomodoro-layout'", "'pomodoro-min', 'pomodoro-metro'", ", 'pomodoro-layout'")

    diga('5/5  traduções em inglês e espanhol no i18n.js')
    mudar('js/i18n.js', "'organizar':[", "'liga lendária':['legendary league','liga legendaria'],", I18N)

    diga('')
    diga('✅  pronto! agora é só testar no navegador e publicar.', VERDE)
    diga('')


if __name__ == '__main__':
    main()
