# 🍅 Pomodoro Lo-fi

Um pomodoro aconchegante, com cenários em pixel art, bichinhos, sons ambientes e amizades.

**▶ Usar agora:** https://pomodoro-lofi.web.app
**💻 Programa para Windows:** baixe o `Instalar Pomodoro Lo-fi.exe` em [Releases](../../releases/latest)

Feito por **Maria Paula** (advogada e desenvolvedora autônoma).

## O que tem

- ⏱️ **Cronômetro pomodoro** com foco, pausa curta e pausa longa, rotinas prontas e rotinas suas
- 🖼️ **Cenários animados** desenhados em canvas (cidade chuvosa, halloween, aquário…) e **clima de verdade** da sua cidade
- 🐱 **Bichinhos em pixel art** que piscam, dormem na pausa e vestem roupinhas da lojinha
- 🎧 **Sons ambientes** gerados na hora (chuva, lareira, café…), metrônomo e player do YouTube/Spotify
- ✅ **Tarefas**, 📓 **diário**, 🗒️ **notas**, 💧 **lembrete de água** e 📅 **contagem regressiva** para provas
- 🎯 **Missões** diárias e semanais, 🏁 metas pessoais, 🏆 **ligas semanais**, conquistas, níveis e moedas
- 👯 **Amizades**: ranking ao vivo, desafios, focar junto e **sala de estudo em grupo** (até 8 pessoas com o mesmo cronômetro)
- 🧩 **Organizar os painéis** do seu jeito, 🎯 foco total e resumo da semana em imagem
- 🌐 Português, inglês e espanhol
- 📲 **Instalável** no celular e no computador (PWA) e funciona sem internet
- 📌 No programa de Windows: **fixar na tela**, um reloginho que fica por cima das outras janelas

## Como é feito

Site estático, sem framework: **HTML, CSS e JavaScript puro**.

| Pasta | O que é |
|---|---|
| `pomodoro/` | o site: `index.html`, `css/style.css` e `js/` (`app.js` cronômetro e tudo que é da pessoa, `scenes.js` cenários, `sounds.js` sons em Web Audio, `pets.js` bichinhos, `cloud.js` conta e amizades, `i18n.js` idiomas, `sw.js` offline) |
| `pomodoro-fas/` | personagens de fãs (`fas.js`) e as ferramentas que leem pixel art de referência; `montar.ps1` junta com o site |
| `pomodoro-app/` | o programa de Windows (Electron): uma janela que abre o site, com o modo "fixar na tela" |
| `firebase-regras.txt` | regras de segurança do Firestore (cada pessoa só mexe no que é dela) |

Contas, sincronização e amizades usam **Firebase** (Authentication + Firestore). A configuração em `pomodoro/js/firebase-config.js` é a chave pública do site: quem protege os dados são as regras do Firestore.

## Rodar no seu computador

Qualquer servidor de arquivos serve. Por exemplo, com Node:

```bash
npx serve pomodoro
```

O programa de Windows:

```bash
cd pomodoro-app
npm install
npm start
```

## Aviso sobre os personagens

Os personagens de jogos e desenhos em `pomodoro-fas/` são **fan art em pixel**, sem fins lucrativos. As marcas e os personagens pertencem aos seus donos (Nintendo, Sanrio, Scott Cawthon, SEGA e outros). Se você é titular de algum deles e quer que seja retirado, escreva para mp.christiee@gmail.com.

## Licença

O código é de Maria Paula. Pode olhar e aprender à vontade; para reutilizar, peça antes. 💜
