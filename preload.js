const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clockAPI', {
  showMenu: () => ipcRenderer.send('show-menu'),
  setInteractive: (val) => ipcRenderer.send('set-interactive', val),
  getTodayTasks: () => ipcRenderer.invoke('get-today-tasks'),
});
