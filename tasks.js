const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const { app } = require('electron');

const execFileAsync = promisify(execFile);

// 开发模式：项目根目录；打包后：Contents/Resources/EventKitHelper
function helperPath() {
  const isPackaged = typeof app === 'object' && app && app.isPackaged;
  return isPackaged ? path.join(process.resourcesPath, 'EventKitHelper') : path.join(__dirname, 'EventKitHelper');
}

async function fetchTodayTasks() {
  try {
    const { stdout } = await execFileAsync(helperPath(), [], { timeout: 60000 });
    const data = JSON.parse(stdout || '{}');
    const items = (data.items || []).sort((a, b) => a.timeMs - b.timeMs);
    const errors = data.errors || [];
    return { ok: errors.length === 0, items, errors };
  } catch (err) {
    return { ok: false, items: [], errors: [String((err && err.message) || err)] };
  }
}

module.exports = { fetchTodayTasks };
