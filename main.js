const { app, BrowserWindow, Menu, ipcMain, globalShortcut, screen } = require('electron');
const path = require('path');
const { fetchTodayTasks } = require('./tasks');

const WIN_W = 300;
const WIN_H = 340;

let win = null;
// 默认鼠标穿透：透明区域不挡其他应用的点击，光标落在可见圆盘上时才交互
let forcedInteractive = false;

function createWindow() {
  win = new BrowserWindow({
    width: WIN_W,
    height: WIN_H,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    fullscreenable: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // 初始即鼠标穿透，forward:true 让渲染层仍能收到 mousemove 来做悬停判定
  win.setIgnoreMouseEvents(true, { forward: true });

  // 开发模式加载 Vite dev server（HMR）；生产/打包加载构建产物
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    win.loadURL(devServerUrl);
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'renderer', 'index.html'));
  }

  // 初始位置：主屏右上角
  const { workArea } = screen.getPrimaryDisplay();
  win.setPosition(
    Math.round(workArea.x + workArea.width - WIN_W - 16),
    Math.round(workArea.y + 16)
  );

  win.on('closed', () => {
    win = null;
  });
}

// interactive=true 时窗口接收鼠标事件（可拖动/点菜单）；false 时点击穿透
function setInteractive(val) {
  if (win) {
    win.setIgnoreMouseEvents(!val, { forward: true });
  }
}

// 开机自启动：打包后注册 .app；开发模式则注册 Electron 二进制并带上应用路径
function setLoginItem(enable) {
  const options = { openAtLogin: enable };
  if (!app.isPackaged) {
    options.path = process.execPath;
    options.args = [app.getAppPath()];
  }
  app.setLoginItemSettings(options);
}

function loginItemEnabled() {
  if (app.isPackaged) return app.getLoginItemSettings().openAtLogin;
  return app.getLoginItemSettings({ path: process.execPath, args: [app.getAppPath()] }).openAtLogin;
}

function showMenu() {
  if (!win) return;
  const menu = Menu.buildFromTemplate([
    {
      label: '始终可交互（Cmd+Shift+C）',
      type: 'checkbox',
      checked: forcedInteractive,
      click: (item) => {
        forcedInteractive = item.checked;
        setInteractive(forcedInteractive);
      },
    },
    {
      label: '始终置顶',
      type: 'checkbox',
      checked: win.isAlwaysOnTop(),
      click: (item) => win.setAlwaysOnTop(item.checked, 'screen-saver'),
    },
    { type: 'separator' },
    {
      label: '开机自启动',
      type: 'checkbox',
      checked: loginItemEnabled(),
      click: (item) => setLoginItem(item.checked),
    },
    { type: 'separator' },
    { label: '退出（Cmd+Shift+Q）', click: () => app.quit() },
  ]);
  menu.popup({ window: win });
}

app.whenReady().then(() => {
  // 隐藏 Dock 图标，更像一个小部件
  app.setActivationPolicy('accessory');

  createWindow();

  ipcMain.on('show-menu', () => showMenu());

  ipcMain.handle('get-today-tasks', async () => fetchTodayTasks());
  // 渲染层悬停判定：光标进入/离开可见圆盘时切换交互状态（除非用户强制始终可交互）
  ipcMain.on('set-interactive', (_e, val) => {
    if (!forcedInteractive) setInteractive(val);
  });

  globalShortcut.register('CommandOrControl+Shift+C', () => {
    forcedInteractive = !forcedInteractive;
    setInteractive(forcedInteractive);
  });
  globalShortcut.register('CommandOrControl+Shift+Q', () => app.quit());
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // 保持后台运行，不退出
});
