// src/preload.ts
var { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("VPhoneDesktop", {
  getConfig: () => ipcRenderer.invoke("vphone-desktop:get-config"),
  isDevMode: () => ipcRenderer.invoke("vphone-desktop:is-dev"),
  requestMediaAccess: () => ipcRenderer.invoke("vphone-desktop:request-media-access"),
  getDiagnostics: () => ipcRenderer.invoke("vphone-desktop:get-diagnostics"),
  isSecretStorageAvailable: () => ipcRenderer.invoke("vphone-desktop:secret-available"),
  encryptSecret: (plainText) => ipcRenderer.invoke("vphone-desktop:secret-encrypt", plainText),
  decryptSecret: (cipherBase64) => ipcRenderer.invoke("vphone-desktop:secret-decrypt", cipherBase64),
  focusWindow: (reason) => ipcRenderer.invoke("vphone-desktop:focus-window", reason),
  minimizeWindow: () => ipcRenderer.invoke("vphone-desktop:minimize-window"),
  closeWindow: () => ipcRenderer.invoke("vphone-desktop:close-window"),
  log: (level, message, meta) => ipcRenderer.send("vphone-desktop:log", { level, message, meta }),
  setCallPhase: (phase) => ipcRenderer.send("vphone-desktop:call-phase", phase),
  onWindowFocused: (handler) => {
    if (typeof handler !== "function") return () => {
    };
    const listener = () => handler();
    ipcRenderer.on("vphone-desktop:window-focused", listener);
    return () => ipcRenderer.removeListener("vphone-desktop:window-focused", listener);
  },
  onShortcutAction: (handler) => {
    if (typeof handler !== "function") return () => {
    };
    const listener = (_event, payload) => handler(payload || {});
    ipcRenderer.on("vphone-desktop:shortcut-action", listener);
    return () => ipcRenderer.removeListener("vphone-desktop:shortcut-action", listener);
  }
});
(async function injectUserAgent() {
  try {
    let cfg = {};
    try {
      cfg = await ipcRenderer.invoke("vphone-desktop:get-config");
    } catch (e) {
      cfg = {};
    }
    const electronVer = process && process.versions && process.versions.electron ? String(process.versions.electron) : "";
    var cfgUA = cfg && (cfg.UserAgentStr || cfg.userAgentStr || cfg.userAgent) ? cfg.UserAgentStr || cfg.userAgentStr || cfg.userAgent : null;
    var ua = "";
    if (cfgUA && String(cfgUA).trim() !== "") {
      ua = String(cfgUA).trim();
    } else {
      const appVer = cfg && cfg.appversion ? String(cfg.appversion) : "";
      ua = "VPhone";
      if (appVer && appVer !== "") ua += " " + appVer;
    }
    if (ua && window && window.localStorage) {
      try {
        window.localStorage.setItem("UserAgentStr", ua);
      } catch (e) {
      }
    }
  } catch (e) {
  }
})();
