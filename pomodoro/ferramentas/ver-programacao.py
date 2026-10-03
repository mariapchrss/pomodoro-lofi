# -*- coding: utf-8 -*-
"""Mostra a programação do "organizar painéis" sendo digitada no terminal, colorida, parte por parte.
Não muda nenhum arquivo: é só para assistir.

Uso:  python ferramentas\\ver-programacao.py           (velocidade normal)
      python ferramentas\\ver-programacao.py rapido    (bem mais rápido)
"""
import importlib.util
import os
import re
import sys
import time
from pathlib import Path

os.system('')   # liga as cores no terminal do Windows
AQUI = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('organizar', AQUI / 'organizar-paineis.py')
org = importlib.util.module_from_spec(spec)
spec.loader.exec_module(org)   # (ele já deixa a saída em UTF-8)

RAPIDO = len(sys.argv) > 1 and sys.argv[1].lower().startswith('r')
PAUSA = 0.0008 if RAPIDO else 0.006          # tempo entre uma letra e outra
CINZA, VERDE, ROSA, AZUL, AMARELO, LARANJA, BRANCO, FIM = '\033[90m', '\033[92m', '\033[95m', '\033[96m', '\033[93m', '\033[38;5;215m', '\033[97m', '\033[0m'

PALAVRAS = r'const|let|function|return|if|else|try|catch|new|typeof|instanceof|null|true|false|document|localStorage|JSON'
TOKEN = re.compile(
    r'(?P<coment>/\*.*?\*/|/\*.*$|^\s*\*.*$|<!--.*?-->)'
    r"|(?P<texto>'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"|`[^`]*`)"
    r'|(?P<chave>\b(?:' + PALAVRAS + r')\b|=>)'
    r'|(?P<tag></?[a-zA-Z][\w-]*|/?>)'
    r'|(?P<seletor>^[.#]?[\w.#\[\]\- >:=+"()!]+(?=\{))'
    r'|(?P<numero>\b\d+(?:\.\d+)?\b)')
COR = {'coment': CINZA, 'texto': VERDE, 'chave': ROSA, 'tag': AZUL, 'seletor': AMARELO, 'numero': LARANJA}


def digitar(texto, cor=''):
    for letra in texto:
        sys.stdout.write(cor + letra + (FIM if cor else ''))
        sys.stdout.flush()
        if letra != ' ':
            time.sleep(PAUSA)


def linha_colorida(linha):
    pos = 0
    for m in TOKEN.finditer(linha):
        digitar(linha[pos:m.start()], BRANCO)
        digitar(m.group(), COR[m.lastgroup])
        pos = m.end()
    digitar(linha[pos:], BRANCO)
    sys.stdout.write('\n')


def parte(numero, titulo, arquivo, codigo, explica):
    print()
    print(ROSA + '━' * 78 + FIM)
    print(f'{ROSA}  parte {numero}/5 · {titulo}{FIM}   {CINZA}→ {arquivo}{FIM}')
    print(f'{CINZA}  {explica}{FIM}')
    print(ROSA + '━' * 78 + FIM)
    time.sleep(0.4 if RAPIDO else 1.5)
    linhas = codigo.strip('\n').split('\n')
    for i, linha in enumerate(linhas, 1):
        sys.stdout.write(f'{CINZA}{i:>3} │ {FIM}')
        linha_colorida(linha)
    time.sleep(0.3 if RAPIDO else 1.2)


def main():
    print()
    print(f'{ROSA}🍅  Pomodoro Lo-fi · programando o "organizar painéis"{FIM}')
    print(f'{CINZA}    (só mostra o código sendo escrito; não muda nenhum arquivo){FIM}')
    parte(1, 'o botão e a barrinha', 'index.html', org.BOTAO + '\n\n' + org.BARRA,
          'HTML: o botão "🧩 organizar" lá em cima e a barra com "voltar ao padrão" e "pronto".')
    parte(2, 'o visual', 'css/style.css', org.CSS,
          'CSS: no modo organizar os painéis encolhem, ganham contorno tracejado e as setas aparecem.')
    parte(3, 'a lógica', 'js/app.js', org.JS,
          'JavaScript: guardar a ordem, as setas ↑ ↓ ⇄, o arrastar com o mouse e o "voltar ao padrão".')
    parte(4, 'apagar junto com a conta', 'js/cloud.js', "['pomodoro-min', 'pomodoro-metro', 'pomodoro-layout', ...].forEach(k => localStorage.removeItem(k));",
          'quem apaga a conta "e os dados deste aparelho" também apaga a ordem guardada.')
    parte(5, 'as traduções', 'js/i18n.js', org.I18N,
          'cada texto novo em inglês e em espanhol.')
    print()
    total = sum(len(x.strip('\n').split('\n')) for x in (org.BOTAO, org.BARRA, org.CSS, org.JS, org.I18N))
    print(f'{VERDE}✅  fim! foram umas {total} linhas de código.{FIM}')
    print()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(FIM + '\n(parei)')
