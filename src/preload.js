const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings API
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),

  // History API
  saveHistory: (history) => ipcRenderer.invoke('save-history', history),
  loadHistory: () => ipcRenderer.invoke('load-history'),

  // Model History API
  saveModelHistory: (modelHistory) => ipcRenderer.invoke('save-model-history', modelHistory),
  loadModelHistory: () => ipcRenderer.invoke('load-model-history'),

  // Network API
  fetch: async (url, options) => {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return {
        ok: response.ok,
        status: response.status,
        data: data
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }
});
