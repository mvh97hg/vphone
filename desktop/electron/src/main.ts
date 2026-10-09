const fs = require("node:fs");
const path = require("node:path");
const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  safeStorage,
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
let callPhase = "idle";
let cachedShortcutConfig = null;
const LOG_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const LOG_MAX_BACKUPS = 5;

function isDesktopDevMode() {
  const flag = String(process.env.VPHONE_DEVTOOLS || process.env.VPHONE_DEV || "").toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes") return true;
  return !app.isPackaged;
}

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
  const normalized = String(level || "info").toLowerCase();
  const alwaysLog = normalized === "error" || normalized === "warn";
  if (!alwaysLog && !isDesktopDevMode()) return;

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
    if (isDesktopDevMode()) console.error("Failed to write desktop log", error);
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
    answer: "F2",
    hangup: "Escape",
    hold: "F4",
    mute: "F6",
    transfer: "F8",
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

function matchesAccelerator(input, accelerator) {
  if (!accelerator) return false;
  const parts = accelerator.toLowerCase().split("+");
  const hasAlt = parts.includes("alt");
  const hasCtrl = parts.includes("ctrl") || parts.includes("control");
  const hasShift = parts.includes("shift");
  const key = parts.find(
    (p) => p !== "alt" && p !== "ctrl" && p !== "control" && p !== "shift",
  );

  if (!key) return false;

  const matchAlt = input.alt === hasAlt;
  const matchCtrl = input.control === hasCtrl;
  const matchShift = input.shift === hasShift;

  let matchKey = false;
  const inputKey = input.key.toLowerCase();

  if (key.startsWith("f") && !isNaN(key.substring(1))) {
    matchKey = inputKey === key;
  } else if (key === "escape" || key === "esc") {
    matchKey = inputKey === "escape";
  } else {
    matchKey = inputKey === key;
  }

  return matchAlt && matchCtrl && matchShift && matchKey;
}

function configurePermissions() {
  const allowedPermissions = new Set([
    "media",
    "mediaKeySystem",
    "display-capture",
    "speaker-selection",
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

  // Slightly larger than phoneFrame250 (250x425) + titlebar so keypad/settings fit fully
  const windowWidth = 270;
  const windowHeight = 485;
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: windowWidth,
    minHeight: windowHeight,
    maxWidth: windowWidth,
    maxHeight: windowHeight,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    // Windows 10 needs a transparent window + CSS radius to show rounded corners.
    // Native roundedCorners alone only applies on Windows 11 DWM.
    backgroundColor: "#00000000",
    transparent: true,
    roundedCorners: false,
    hasShadow: true,
    thickFrame: false,
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

  // Optional override only — default Chromium policy matches legacy Phone behavior.
  // Forcing default_public_and_private_interfaces produced Net[any/Wildcard] ICE
  // ports and worsened hold Role-conflict with rtpengine ICE=force.
  try {
    const policy = desktopConfig?.phone?.WebRTCIPHandlingPolicy;
    if (
      policy &&
      typeof mainWindow.webContents.setWebRTCIPHandlingPolicy === "function"
    ) {
      mainWindow.webContents.setWebRTCIPHandlingPolicy(policy);
      writeLog("info", "WebRTC IP handling policy set", { policy });
    }
  } catch (error) {
    writeLog("warn", "Failed to set WebRTC IP handling policy", {
      error: String(error),
    });
  }

  mainWindow.loadFile(rendererPath);

  if (isDesktopDevMode()) {
    mainWindow.webContents.on("console-message", (event) => {
      const params = event || {};
      writeLog("renderer-console", params.message || "", {
        level: params.level,
        line: params.lineNumber,
        sourceId: params.sourceId,
      });
    });
  }

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
    if (isDesktopDevMode() && (process.env.VPHONE_DEVTOOLS === "1" || process.env.VPHONE_DEVTOOLS === "true")) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  });

  mainWindow.webContents.on("render-process-gone", (event, details) => {
    writeLog("error", "Renderer process gone", details);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  cachedShortcutConfig = parseGlobalShortcutConfig(
    desktopConfig &&
      desktopConfig.phone &&
      desktopConfig.phone.KeyboardShortcuts,
  );

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;

    // DevTools (F12 / Ctrl+Shift+I) only in unpacker/dev mode
    const key = String(input.key || "");
    const openDevtools =
      key === "F12" ||
      ((input.control || input.meta) && input.shift && key.toLowerCase() === "i");
    if (openDevtools) {
      if (!isDesktopDevMode()) return;
      event.preventDefault();
      if (mainWindow.webContents.isDevToolsOpened()) mainWindow.webContents.closeDevTools();
      else mainWindow.webContents.openDevTools({ mode: "detach" });
      return;
    }

    const keyboardShortcuts = cachedShortcutConfig || parseGlobalShortcutConfig(null);
    const bindings = [
      ["answer", keyboardShortcuts.answer],
      ["hangup", keyboardShortcuts.hangup],
      ["hold", keyboardShortcuts.hold],
      ["mute", keyboardShortcuts.mute],
      ["transfer", keyboardShortcuts.transfer],
    ];
    const reserved = new Set(
      bindings
        .map(([, accelerator]) => String(accelerator || "").toLowerCase())
        .filter(Boolean),
    );
    const inputKey = String(input.key || "").toLowerCase();
    if (inputKey === "escape" || inputKey === "enter" || inputKey === "backspace") return;
    if (inputKey.length === 1 && /[\d*#+]/.test(input.key)) return;

    for (const [action, accelerator] of bindings) {
      if (!accelerator || String(accelerator).toLowerCase() === "escape") continue;
      if (!matchesAccelerator(input, accelerator)) continue;
      if (!reserved.has(String(accelerator).toLowerCase()) && !/^f\d{1,2}$/i.test(String(accelerator))) {
        continue;
      }
      event.preventDefault();
      sendShortcutActionToRenderer(action);
      break;
    }
  });

  mainWindow.on("close", (event) => {
    if (app.isQuitting) return;

    event.preventDefault();
    mainWindow.hide();
    writeLog("info", "Desktop window hidden to tray");
    syncGlobalHotkeys();
  });

  mainWindow.on("blur", () => syncGlobalHotkeys());
  mainWindow.on("focus", () => {
    syncGlobalHotkeys();
    if (
      mainWindow &&
      !mainWindow.isDestroyed() &&
      mainWindow.webContents &&
      !mainWindow.webContents.isDestroyed()
    ) {
      mainWindow.webContents.focus();
      mainWindow.webContents.send("vphone-desktop:window-focused");
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
        mainWindow.show();
      }
      if (!mainWindow.isFocused()) {
        mainWindow.flashFrame(true);
      }
      mainWindow.setAlwaysOnTop(true, "screen-saver");
      app.focus({ steal: true });
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
  ipcMain.handle("vphone-desktop:is-dev", () => isDesktopDevMode());
  ipcMain.handle("vphone-desktop:secret-available", () => {
    try {
      return !!(safeStorage && typeof safeStorage.isEncryptionAvailable === "function"
        && safeStorage.isEncryptionAvailable());
    } catch {
      return false;
    }
  });
  ipcMain.handle("vphone-desktop:secret-encrypt", (_event, plainText) => {
    if (!safeStorage?.isEncryptionAvailable?.()) {
      throw new Error("OS secret storage is not available");
    }
    const encrypted = safeStorage.encryptString(String(plainText ?? ""));
    return Buffer.from(encrypted).toString("base64");
  });
  ipcMain.handle("vphone-desktop:secret-decrypt", (_event, payload) => {
    if (!safeStorage?.isEncryptionAvailable?.()) {
      throw new Error("OS secret storage is not available");
    }
    const buffer = Buffer.from(String(payload ?? ""), "base64");
    return safeStorage.decryptString(buffer);
  });
  ipcMain.handle("vphone-desktop:request-media-access", () =>
    requestMediaAccess(),
  );
  ipcMain.handle("vphone-desktop:get-diagnostics", () => ({
    logFilePath: getLogFilePath(),
    userConfigPath: getUserConfigPath(),
    isDev: isDesktopDevMode(),
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
  ipcMain.on("vphone-desktop:call-phase", (_event, phase) => {
    callPhase = typeof phase === "string" && phase ? phase : "idle";
    syncGlobalHotkeys();
  });
  ipcMain.handle("vphone-desktop:get-auto-launch", () =>
    getAutoLaunchEnabled(),
  );
  ipcMain.handle("vphone-desktop:set-auto-launch", (event, enable) => {
    setAutoLaunchEnabled(!!enable);
    return getAutoLaunchEnabled();
  });
  const desktopConfig = loadDesktopConfig();
  const appTitle = getDesktopAppTitle(desktopConfig);
  createWindow(desktopConfig);
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

function registerGlobalCallShortcut(accelerator, action) {
  const accel = String(accelerator || "").trim();
  if (!accel || accel.toLowerCase() === "escape") return false;
  try {
    const ok = globalShortcut.register(accel, () => {
      sendShortcutActionToRenderer(action);
    });
    if (!ok) {
      writeLog("warn", "Global shortcut registration failed", { action, accelerator: accel });
    }
    return !!ok;
  } catch (error) {
    writeLog("warn", "Global shortcut registration error", {
      action,
      accelerator: accel,
      error: String(error),
    });
    return false;
  }
}

function syncGlobalHotkeys() {
  try {
    globalShortcut.unregisterAll();
  } catch (error) {
    writeLog("warn", "Failed to unregister global shortcuts", { error: String(error) });
  }

  const windowFocused = !!(
    mainWindow &&
    !mainWindow.isDestroyed() &&
    mainWindow.isFocused()
  );
  // Local key handlers cover the focused window; register OS-level hotkeys only
  // when a call is active and the desktop window does not have focus.
  if (windowFocused || callPhase === "idle") return;

  const shortcuts = cachedShortcutConfig || parseGlobalShortcutConfig(null);
  if (callPhase === "incoming") {
    registerGlobalCallShortcut(shortcuts.answer, "answer");
    registerGlobalCallShortcut(shortcuts.hangup, "hangup");
    return;
  }

  if (callPhase === "in-call") {
    registerGlobalCallShortcut(shortcuts.hangup, "hangup");
    registerGlobalCallShortcut(shortcuts.hold, "hold");
    registerGlobalCallShortcut(shortcuts.mute, "mute");
    registerGlobalCallShortcut(shortcuts.transfer, "transfer");
  }
}

app.on("before-quit", () => {
  app.isQuitting = true;
  try {
    globalShortcut.unregisterAll();
  } catch {}
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
