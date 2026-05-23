const fs = require("node:fs");
const path = require("node:path");
const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  globalShortcut,
  session,
  shell,
  systemPreferences,
  Tray,
} = require("electron");

const rendererPath = path.join(__dirname, "renderer", "index.html");
const configPath = path.join(__dirname, "config.json");
const packageJsonPath = path.join(__dirname, "package.json");
const DESKTOP_APP_ID = "com.vphone.app";
let logFilePath = null;
let mainWindow = null;
let tray = null;
const LOG_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const LOG_MAX_BACKUPS = 5;

app.setName("VPhone");

if (process.env.VPHONE_DESKTOP_USER_DATA) {
  app.setPath("userData", process.env.VPHONE_DESKTOP_USER_DATA);
}

// Ensure only one instance runs. If another instance starts, focus existing window.
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  // Another instance is already running — quit this one.
  app.exit(0);
} else {
  app.on("second-instance", (event, argv, workingDirectory) => {
    writeLog("info", "Second instance detected, focusing existing app");
    focusMainWindow("second-instance");
  });
}

function getAssetRoot() {
  return app.isPackaged
    ? process.resourcesPath
    : path.resolve(__dirname, "..", "..");
}

function getUserConfigPath() {
  return (
    process.env.VPHONE_DESKTOP_CONFIG ||
    path.join(app.getPath("userData"), "config.json")
  );
}
function getStartupConfigPathCandidates() {
  const candidates = [];
  // 1) Explicit env override has highest priority.
  if (process.env.VPHONE_DESKTOP_CONFIG)
    candidates.push(process.env.VPHONE_DESKTOP_CONFIG);
  // 2) External config next to executable (portable / installed use-case).
  try {
    candidates.push(path.join(path.dirname(process.execPath), "config.json"));
  } catch (error) {
    // ignore
  }
  // 3) Current working directory.
  try {
    candidates.push(path.join(process.cwd(), "config.json"));
  } catch (error) {
    // ignore
  }
  // 4) Bundled app config.
  candidates.push(configPath);
  // 5) User data config.
  candidates.push(getUserConfigPath());

  const unique = [];
  const seen = new Set();
  for (const item of candidates) {
    if (!item || typeof item !== "string") continue;
    const normalized = path.resolve(item);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(normalized);
  }
  return unique;
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return null;
  }
}

function getLogFilePath() {
  if (logFilePath) return logFilePath;
  const logDir = path.join(app.getPath("userData"), "logs");
  fs.mkdirSync(logDir, { recursive: true });
  logFilePath = path.join(logDir, "vphone-desktop.log");
  return logFilePath;
}

function writeLog(level, message, meta) {
  rotateLogIfNeeded();
  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    message,
    meta: meta || null,
  });
  try {
    fs.appendFileSync(getLogFilePath(), line + "\n");
  } catch (error) {
    console.error("Failed to write desktop log", error);
  }
}
function rotateLogIfNeeded() {
  const basePath = getLogFilePath();
  let stat = null;
  try {
    stat = fs.statSync(basePath);
  } catch (error) {
    return;
  }
  if (!stat || !stat.isFile() || stat.size < LOG_MAX_BYTES) return;

  try {
    for (let i = LOG_MAX_BACKUPS - 1; i >= 1; i -= 1) {
      const source = `${basePath}.${i}`;
      const target = `${basePath}.${i + 1}`;
      if (fs.existsSync(source)) {
        fs.renameSync(source, target);
      }
    }
    const firstBackup = `${basePath}.1`;
    if (fs.existsSync(firstBackup)) fs.rmSync(firstBackup, { force: true });
    fs.renameSync(basePath, firstBackup);
  } catch (error) {
    console.error("Failed to rotate desktop logs", error);
  }
}

function sanitizeConfigForLog(config) {
  const clone = JSON.parse(JSON.stringify(config || {}));
  if (clone.phone) {
    ["SipPassword", "authorizationPassword"].forEach((key) => {
      if (clone.phone[key]) clone.phone[key] = "***";
    });
  }
  return clone;
}

function mergeConfig(baseConfig, overrideConfig) {
  const fixedMount = Object.assign({}, baseConfig.mount || {});
  const fixedIcons = {
    AppIcon:
      (baseConfig.phone && baseConfig.phone.AppIcon) || "icons/png/128x128.png",
    NotificationIcon:
      (baseConfig.phone && baseConfig.phone.NotificationIcon) ||
      "icons/png/128x128.png",
    DefaultProfileIcon:
      (baseConfig.phone && baseConfig.phone.DefaultProfileIcon) ||
      "icons/png/128x128.png",
  };
  const mergedPhone = Object.assign(
    {},
    baseConfig.phone || {},
    overrideConfig.phone || {},
  );
  // These values are fixed by build package and not user-configurable at runtime.
  mergedPhone.AppIcon = fixedIcons.AppIcon;
  mergedPhone.NotificationIcon = fixedIcons.NotificationIcon;
  mergedPhone.DefaultProfileIcon = fixedIcons.DefaultProfileIcon;

  return {
    mount: fixedMount,
    phone: mergedPhone,
  };
}
function getBuildPackageDesktopConfig() {
  const pkg = readJsonFile(packageJsonPath) || {};
  const desktopConfig =
    pkg && pkg.vphone && pkg.vphone.desktop ? pkg.vphone.desktop : {};
  return {
    mount: Object.assign({}, desktopConfig.mount || {}),
    phone: Object.assign({}, desktopConfig.phone || {}),
  };
}

function loadDesktopConfig() {
  const bundledConfig = readJsonFile(configPath) || { mount: {}, phone: {} };
  const startupConfigCandidates = getStartupConfigPathCandidates();
  let selectedConfigPath = null;
  let selectedConfig = null;
  for (const candidate of startupConfigCandidates) {
    const parsed = readJsonFile(candidate);
    if (!parsed) continue;
    selectedConfigPath = candidate;
    selectedConfig = parsed;
    break;
  }
  const startupConfig = { mount: {}, phone: {} };
  if (selectedConfig) {
    const rootPhoneOverrides = Object.assign({}, selectedConfig);
    delete rootPhoneOverrides.mount;
    delete rootPhoneOverrides.phone;
    delete rootPhoneOverrides.build;
    delete rootPhoneOverrides.desktop;
    delete rootPhoneOverrides.vphone;
    startupConfig.mount = Object.assign({}, selectedConfig.mount || {});
    startupConfig.phone = Object.assign(
      {},
      rootPhoneOverrides,
      selectedConfig.phone || {},
    );
  }

  const buildConfig = getBuildPackageDesktopConfig();
  const baseConfig = {
    mount: Object.assign({}, buildConfig.mount || {}),
    phone: Object.assign(
      {},
      bundledConfig.phone || {},
      buildConfig.phone || {},
      startupConfig.phone || {},
    ),
  };
  const merged = mergeConfig(baseConfig, {});
  writeLog("info", "Desktop config loaded", sanitizeConfigForLog(merged));
  writeLog("info", "Desktop config sources", {
    selected: selectedConfigPath,
    candidates: startupConfigCandidates,
  });
  return merged;
}

function getDesktopAppTitle(config) {
  const title =
    config && config.mount && config.mount.title
      ? String(config.mount.title).trim()
      : "";
  return title || "VPhone";
}
function resolveDesktopIconPath(config, keyName, defaultRelativePath) {
  const iconFallbackKeys = ["icon", "appIcon"];
  const candidates = [
    config && config.desktop && config.desktop[keyName],
    config && config.mount && config.mount[keyName],
    config && config.phone && config.phone[keyName],
    ...iconFallbackKeys.map(
      (k) => config && config.desktop && config.desktop[k],
    ),
    ...iconFallbackKeys.map((k) => config && config.mount && config.mount[k]),
    ...iconFallbackKeys.map((k) => config && config.phone && config.phone[k]),
  ];
  let selected = "";
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    selected = trimmed;
    break;
  }
  if (!selected) selected = defaultRelativePath || "icons/win/icon.ico";
  if (path.isAbsolute(selected)) return selected;

  const appDirCandidate = path.join(__dirname, selected);
  if (fs.existsSync(appDirCandidate)) return appDirCandidate;

  const assetRootCandidate = path.join(getAssetRoot(), selected);
  if (fs.existsSync(assetRootCandidate)) return assetRootCandidate;

  return path.join(__dirname, "icons", "win", "icon.ico");
}
function getDesktopWindowIcon(config) {
  return resolveDesktopIconPath(config, "windowIcon", "icons/win/icon.ico");
}
function getDesktopTrayIcon(config) {
  return resolveDesktopIconPath(config, "trayIcon", "icons/win/icon.ico");
}

function normalizeKeyboardShortcutValue(value, fallback) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function parseGlobalShortcutConfig(value) {
  const defaults = {
    answer: "Alt+A",
    hangup: "Alt+C",
    hold: "Alt+H",
    mute: "Alt+M",
    transfer: "Alt+T",
    dialpad: "F2",
  };

  let configured = {};
  if (value && typeof value === "string") {
    try {
      configured = JSON.parse(value);
    } catch (error) {
      configured = {};
    }
  } else if (value && typeof value === "object") {
    configured = value;
  }

  const shortcuts = {};
  for (const key of Object.keys(defaults)) {
    shortcuts[key] = normalizeKeyboardShortcutValue(configured[key], defaults[key]);
  }

  return shortcuts;
}

function sendShortcutActionToRenderer(action) {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  if (mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send("vphone-desktop:shortcut-action", {
      action,
    });
    return true;
  }

  return false;
}

function triggerGlobalShortcut(action, accelerator) {
  const focused = focusMainWindow(`global-shortcut:${action}`);
  if (!focused) return false;

  setTimeout(() => {
    sendShortcutActionToRenderer(action);
  }, 0);

  return true;
}

function registerGlobalShortcuts(desktopConfig) {
  if (!globalShortcut || typeof globalShortcut.register !== "function") return false;

  const keyboardShortcuts = parseGlobalShortcutConfig(
    desktopConfig &&
    desktopConfig.phone &&
    desktopConfig.phone.KeyboardShortcuts,
  );

  const bindings = [
    ["answer", keyboardShortcuts.answer],
    ["hangup", keyboardShortcuts.hangup],
    ["hold", keyboardShortcuts.hold],
    ["mute", keyboardShortcuts.mute],
    ["transfer", keyboardShortcuts.transfer],
    ["dialpad", keyboardShortcuts.dialpad],
  ];

  let registeredCount = 0;
  for (const [action, accelerator] of bindings) {
    if (!accelerator) continue;
    const ok = globalShortcut.register(accelerator, () => {
      triggerGlobalShortcut(action, accelerator);
    });
    if (ok) {
      registeredCount += 1;
    } else {
      writeLog("warn", "Failed to register global shortcut", {
        action,
        accelerator,
      });
    }
  }

  writeLog("info", "Global shortcuts registered", {
    registeredCount,
    bindings,
  });
  return registeredCount > 0;
}

function configurePermissions() {
  const allowedPermissions = new Set([
    "media",
    "mediaKeySystem",
    "display-capture",
    "speaker-selection",
    "notifications",
    "fullscreen",
  ]);

  session.defaultSession.setPermissionCheckHandler(
    (webContents, permission) => {
      return allowedPermissions.has(permission);
    },
  );

  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      callback(allowedPermissions.has(permission));
    },
  );

  if (
    typeof session.defaultSession.setDisplayMediaRequestHandler === "function"
  ) {
    session.defaultSession.setDisplayMediaRequestHandler(
      (request, callback) => {
        callback({
          video: request.videoRequested ? request.frame : null,
          audio: "loopback",
        });
      },
    );
  }
}

async function requestMediaAccess() {
  const result = { microphone: true, camera: true };

  if (
    process.platform === "darwin" &&
    systemPreferences &&
    typeof systemPreferences.askForMediaAccess === "function"
  ) {
    try {
      result.microphone =
        await systemPreferences.askForMediaAccess("microphone");
    } catch (error) {
      result.microphone = false;
    }

    try {
      result.camera = await systemPreferences.askForMediaAccess("camera");
    } catch (error) {
      result.camera = false;
    }
  }

  return result;
}

function createWindow(desktopConfig) {
  const appTitle = getDesktopAppTitle(desktopConfig);
  app.setName(appTitle);
  if (process.platform === "win32") {
    app.setAppUserModelId(DESKTOP_APP_ID);
  }

  mainWindow = new BrowserWindow({
    width: 250,
    height: 453,
    minWidth: 250,
    minHeight: 453,
    maxWidth: 250,
    maxHeight: 453,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    backgroundColor: "#00000000",
    transparent: true,
    roundedCorners: true,
    title: appTitle,
    icon: getDesktopWindowIcon(desktopConfig),
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.removeMenu();
  mainWindow.loadFile(rendererPath);

  mainWindow.webContents.on("console-message", (event) => {
    const params = event || {};
    writeLog("renderer-console", params.message || "", {
      level: params.level,
      line: params.lineNumber,
      sourceId: params.sourceId,
    });
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      writeLog("error", "Renderer failed to load", {
        errorCode,
        errorDescription,
        validatedURL,
      });
    },
  );

  mainWindow.webContents.once("did-finish-load", () => {
    writeLog("info", "Renderer finished load");
  });

  mainWindow.webContents.on("render-process-gone", (event, details) => {
    writeLog("error", "Renderer process gone", details);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("close", (event) => {
    if (app.isQuitting) return;

    event.preventDefault();
    mainWindow.hide();
    writeLog("info", "Desktop window hidden to tray");
  });

  mainWindow.on("focus", () => {
    if (
      mainWindow &&
      !mainWindow.isDestroyed() &&
      mainWindow.webContents &&
      !mainWindow.webContents.isDestroyed()
    ) {
      mainWindow.webContents.focus();
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.flashFrame(false);
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
function createTray(desktopConfig, appTitle) {
  tray = new Tray(getDesktopTrayIcon(desktopConfig));
  const autoEnabled = getAutoLaunchEnabled();

  const trayMenu = Menu.buildFromTemplate([
    {
      label: "Mở VPhone",
      click: () => focusMainWindow("tray-open"),
    },
    {
      type: "separator",
    },
    {
      label: "Tự khởi động",
      type: "checkbox",
      checked: !!autoEnabled,
      click: (menuItem) => {
        try {
          setAutoLaunchEnabled(!!menuItem.checked);
        } catch (err) {
          writeLog("error", "Failed to set auto-launch", { err: String(err) });
        }
      },
    },
    {
      type: "separator",
    },
    {
      label: "Thoát",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip(appTitle || "VPhone");
  tray.setContextMenu(trayMenu);
  tray.on("click", () => focusMainWindow("tray-click"));
}

function getAutoLaunchEnabled() {
  try {
    const settings = app.getLoginItemSettings({});
    return !!settings.openAtLogin;
  } catch (error) {
    writeLog("error", "getAutoLaunchEnabled failed", { error: String(error) });
    return false;
  }
}

function setAutoLaunchEnabled(enabled) {
  try {
    const options = { openAtLogin: !!enabled };
    // For packaged apps, setting path and args is recommended on Windows
    try {
      options.path = process.execPath;
    } catch (e) {
      // ignore
    }
    app.setLoginItemSettings(options);
    writeLog("info", "Auto-launch set", { enabled: !!enabled });
    return true;
  } catch (error) {
    writeLog("error", "setAutoLaunchEnabled failed", { error: String(error) });
    return false;
  }
}

function getAutoLaunchInitMarkerPath() {
  return path.join(app.getPath("userData"), "autolaunch_initialized");
}

function ensureAutoLaunchDefaultEnabled() {
  const marker = getAutoLaunchInitMarkerPath();
  try {
    if (!fs.existsSync(marker)) {
      const currentlyEnabled = getAutoLaunchEnabled();
      if (!currentlyEnabled) {
        setAutoLaunchEnabled(true);
      }
      fs.writeFileSync(marker, new Date().toISOString());
      writeLog("info", "Auto-launch default enabled on first run");
    }
  } catch (error) {
    writeLog("error", "Failed to ensure auto-launch default", {
      error: String(error),
    });
  }
}

function focusMainWindow(reason) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return false;
  }

  try {
    const focusReason = typeof reason === "string" ? reason : "manual";
    const isIncomingCall = focusReason === "incoming-call";
    const maxAttempts = isIncomingCall ? 5 : 1;
    let attempt = 0;

    const applyFocus = () => {
      if (!mainWindow || mainWindow.isDestroyed()) return false;
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      if (!mainWindow.isVisible()) {
        if (isIncomingCall && typeof mainWindow.showInactive === "function") {
          mainWindow.showInactive();
        }
        mainWindow.show();
      }
      if (!mainWindow.isFocused()) {
        mainWindow.flashFrame(true);
      }
      mainWindow.setAlwaysOnTop(true, "screen-saver");
      app.focus();
      mainWindow.focus();
      mainWindow.moveTop();
      mainWindow.show();
      if (mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
        mainWindow.webContents.focus();
      }
      return mainWindow.isFocused();
    };

    const finalizeFocus = () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      const stillFocused = mainWindow.isFocused();
      if (!stillFocused) {
        mainWindow.flashFrame(true);
      } else {
        mainWindow.flashFrame(false);
      }
      mainWindow.setAlwaysOnTop(false);
      writeLog("info", "Desktop window focus attempt finished", {
        reason: focusReason,
        focused: stillFocused,
        visible: mainWindow.isVisible(),
        minimized: mainWindow.isMinimized(),
      });
    };

    const focusWithRetry = () => {
      attempt += 1;
      const focused = applyFocus();
      if (focused || attempt >= maxAttempts) {
        const releaseDelay = isIncomingCall ? 1400 : 250;
        setTimeout(finalizeFocus, releaseDelay);
        return;
      }
      setTimeout(focusWithRetry, isIncomingCall ? 180 : 140);
    };

    focusWithRetry();
    writeLog("info", "Desktop window focus requested", {
      reason: focusReason,
      maxAttempts,
    });

    return true;
  } catch (error) {
    writeLog("warn", "Failed to focus desktop window", {
      reason: reason || "manual",
      name: error?.name,
      message: error?.message,
    });

    return false;
  }
}
function minimizeMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  mainWindow.minimize();
  return true;
}
function closeMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  mainWindow.hide();
  writeLog("info", "Desktop window hidden via close action");
  return true;
}

app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId(DESKTOP_APP_ID);
  }
  configurePermissions();

  ipcMain.handle("vphone-desktop:get-config", () => loadDesktopConfig());
  ipcMain.handle("vphone-desktop:request-media-access", () =>
    requestMediaAccess(),
  );
  ipcMain.handle("vphone-desktop:get-diagnostics", () => ({
    logFilePath: getLogFilePath(),
    userConfigPath: getUserConfigPath(),
  }));
  ipcMain.on("vphone-desktop:log", (event, payload) => {
    writeLog(
      (payload && payload.level) || "info",
      (payload && payload.message) || "",
      payload && payload.meta,
    );
  });
  ipcMain.handle("vphone-desktop:focus-window", (event, reason) =>
    focusMainWindow(reason),
  );
  ipcMain.handle("vphone-desktop:minimize-window", () => minimizeMainWindow());
  ipcMain.handle("vphone-desktop:close-window", () => closeMainWindow());
  ipcMain.handle("vphone-desktop:get-auto-launch", () =>
    getAutoLaunchEnabled(),
  );
  ipcMain.handle("vphone-desktop:set-auto-launch", (event, enable) => {
    setAutoLaunchEnabled(!!enable);
    return getAutoLaunchEnabled();
  });
  ipcMain.handle("vphone-desktop:get-paths", () => {
    const assetRoot = getAssetRoot();
    return {
      appRoot: assetRoot,
      vPhoneScript: path.join(assetRoot, "lib", "vphone-widget.min.js"),
      userConfigPath: getUserConfigPath(),
    };
  });

  const desktopConfig = loadDesktopConfig();
  const appTitle = getDesktopAppTitle(desktopConfig);
  createWindow(desktopConfig);
  registerGlobalShortcuts(desktopConfig);
  ensureAutoLaunchDefaultEnabled();
  createTray(desktopConfig, appTitle);
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(loadDesktopConfig());
      return;
    }

    focusMainWindow("app-activate");
  });
});

app.on("before-quit", () => {
  app.isQuitting = true;
});

app.on("will-quit", () => {
  if (globalShortcut && typeof globalShortcut.unregisterAll === "function") {
    globalShortcut.unregisterAll();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
