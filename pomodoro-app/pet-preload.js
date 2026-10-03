/* Ponte da janelinha do bichinho (pet.html) com o programa: recebe o desenho e o tempo, manda os cliques dos botões */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bichinho', {
  aoReceber: fn => ipcRenderer.on('pet-data', (e, d) => fn(d)),
  comecarOuPausar: () => ipcRenderer.send('pet-toggle'),
  voltar: () => ipcRenderer.send('pet-back')
});
