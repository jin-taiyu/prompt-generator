const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    backgroundColor: '#1e1e1e',
    icon: iconPath
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for data persistence
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const userDataPath = app.getPath('userData');
    const settingsPath = path.join(userDataPath, 'settings.json');
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-settings', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const settingsPath = path.join(userDataPath, 'settings.json');
    const data = await fs.readFile(settingsPath, 'utf8');
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    // Return default settings if file doesn't exist
    return {
      success: true,
      data: {
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: '',
        model: 'gpt-3.5-turbo'
      }
    };
  }
});

ipcMain.handle('save-history', async (event, history) => {
  try {
    const userDataPath = app.getPath('userData');
    const historyPath = path.join(userDataPath, 'history.json');
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-history', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const historyPath = path.join(userDataPath, 'history.json');
    const data = await fs.readFile(historyPath, 'utf8');
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    return { success: true, data: [] };
  }
});

ipcMain.handle('save-model-history', async (event, modelHistory) => {
  try {
    const userDataPath = app.getPath('userData');
    const modelHistoryPath = path.join(userDataPath, 'model-history.json');
    await fs.writeFile(modelHistoryPath, JSON.stringify(modelHistory, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-model-history', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const modelHistoryPath = path.join(userDataPath, 'model-history.json');
    const data = await fs.readFile(modelHistoryPath, 'utf8');
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    return { success: true, data: [] };
  }
});
