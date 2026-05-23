const { contextBridge, ipcRenderer } = require('electron');
const { pathToFileURL } = require('node:url');

contextBridge.exposeInMainWorld('VPhoneDesktop', {
  getConfig: () => ipcRenderer.invoke('vphone-desktop:get-config'),
  requestMediaAccess: () => ipcRenderer.invoke('vphone-desktop:request-media-access'),
  getDiagnostics: () => ipcRenderer.invoke('vphone-desktop:get-diagnostics'),
  focusWindow: (reason) => ipcRenderer.invoke('vphone-desktop:focus-window', reason),
  minimizeWindow: () => ipcRenderer.invoke('vphone-desktop:minimize-window'),
  closeWindow: () => ipcRenderer.invoke('vphone-desktop:close-window'),
  log: (level, message, meta) => ipcRenderer.send('vphone-desktop:log', { level, message, meta }),
  onShortcutAction: (handler) => {
    if (typeof handler !== 'function') return () => {};
    const listener = (_event, payload) => handler(payload || {});
    ipcRenderer.on('vphone-desktop:shortcut-action', listener);
    return () => ipcRenderer.removeListener('vphone-desktop:shortcut-action', listener);
  },
  getAssetUrls: async () => {
    const paths = await ipcRenderer.invoke('vphone-desktop:get-paths');
    return {
      vPhoneScriptUrl: pathToFileURL(paths.vPhoneScript).href
    };
  }
});
