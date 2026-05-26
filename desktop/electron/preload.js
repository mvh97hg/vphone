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

// Inject a default UserAgent string into localStorage so renderer `phone.js` can pick it up
(async function injectUserAgent(){
  try{
    // Try to get app config from main (may include appversion)
    let cfg = {};
    try{ cfg = await ipcRenderer.invoke('vphone-desktop:get-config'); } catch(e) { cfg = {}; }

    const electronVer = (process && process.versions && process.versions.electron) ? String(process.versions.electron) : "";
    // Prefer explicit UserAgentStr from config if present
    var cfgUA = (cfg && (cfg.UserAgentStr || cfg.userAgentStr || cfg.userAgent)) ? (cfg.UserAgentStr || cfg.userAgentStr || cfg.userAgent) : null;
    var ua = "";
    if(cfgUA && String(cfgUA).trim() !== "") {
      ua = String(cfgUA).trim();
    } else {
      const appVer = (cfg && cfg.appversion) ? String(cfg.appversion) : "";
      ua = "VPhone";
      if(appVer && appVer !== "") ua += " " + appVer;
    }

    if(ua && window && window.localStorage){
      try{ window.localStorage.setItem('UserAgentStr', ua); }
      catch(e) { /* ignore storage errors */ }
    }
  }
  catch(e){ /* swallow preload errors */ }
})();
