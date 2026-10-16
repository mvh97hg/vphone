// src/main.ts
var fs = require("node:fs");
var path = require("node:path");
var {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  safeStorage,
  session,
  shell,
  systemPreferences,
  Tray
} = require("electron");
var rendererPath = path.join(__dirname, "renderer", "index.html");
var configPath = path.join(__dirname, "config.json");
var packageJsonPath = path.join(__dirname, "package.json");
var DESKTOP_APP_ID = "com.vphone.softphone";
var logFilePath = null;
var mainWindow = null;
var tray = null;
var callPhase = "idle";
var cachedShortcutConfig = null;
var lastShortcutAction = "";
var lastShortcutAt = 0;
var SHORTCUT_DEBOUNCE_MS = 350;
var LOG_MAX_BYTES = 5 * 1024 * 1024;
var LOG_MAX_BACKUPS = 5;
function isDesktopDevMode() {
  const flag = String(process.env.VPHONE_DEVTOOLS || process.env.VPHONE_DEV || "").toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes") return true;
  return !app.isPackaged;
}
app.setName("VPhone");
if (process.platform === "win32") {
  app.setAppUserModelId(DESKTOP_APP_ID);
}
if (process.env.VPHONE_DESKTOP_USER_DATA) {
  app.setPath("userData", process.env.VPHONE_DESKTOP_USER_DATA);
}
var gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.exit(0);
} else {
  app.on("second-instance", (event, argv, workingDirectory) => {
    writeLog("info", "Second instance detected, focusing existing app");
    focusMainWindow("second-instance");
  });
}
function getAssetRoot() {
  return app.isPackaged ? process.resourcesPath : path.resolve(__dirname, "..", "..");
}
function getUserConfigPath() {
  return process.env.VPHONE_DESKTOP_CONFIG || path.join(app.getPath("userData"), "config.json");
}
function getStartupConfigPathCandidates() {
  const candidates = [];
  if (process.env.VPHONE_DESKTOP_CONFIG)
    candidates.push(process.env.VPHONE_DESKTOP_CONFIG);
  try {
    candidates.push(path.join(path.dirname(process.execPath), "config.json"));
  } catch (error) {
  }
  try {
    candidates.push(path.join(process.cwd(), "config.json"));
  } catch (error) {
  }
  candidates.push(configPath);
  candidates.push(getUserConfigPath());
  const unique = [];
  const seen = /* @__PURE__ */ new Set();
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
    time: (/* @__PURE__ */ new Date()).toISOString(),
    level,
    message,
    meta: meta || null
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
    AppIcon: baseConfig.phone && baseConfig.phone.AppIcon || "icons/png/128x128.png",
    NotificationIcon: baseConfig.phone && baseConfig.phone.NotificationIcon || "icons/png/128x128.png",
    DefaultProfileIcon: baseConfig.phone && baseConfig.phone.DefaultProfileIcon || "icons/png/128x128.png"
  };
  const mergedPhone = Object.assign(
    {},
    baseConfig.phone || {},
    overrideConfig.phone || {}
  );
  mergedPhone.AppIcon = fixedIcons.AppIcon;
  mergedPhone.NotificationIcon = fixedIcons.NotificationIcon;
  mergedPhone.DefaultProfileIcon = fixedIcons.DefaultProfileIcon;
  return {
    mount: fixedMount,
    phone: mergedPhone
  };
}
function getBuildPackageDesktopConfig() {
  const pkg = readJsonFile(packageJsonPath) || {};
  const desktopConfig = pkg && pkg.vphone && pkg.vphone.desktop ? pkg.vphone.desktop : {};
  return {
    mount: Object.assign({}, desktopConfig.mount || {}),
    phone: Object.assign({}, desktopConfig.phone || {})
  };
}
var SAVED_PHONE_ACCOUNT_KEYS = [
  "Server",
  "Port",
  "ServerPath",
  "Domain",
  "Username",
  "PasswordType",
  "profileName"
];
function readSavedPhoneAccount() {
  const userConfig = readJsonFile(getUserConfigPath()) || {};
  const phone = userConfig.phone && typeof userConfig.phone === "object" ? userConfig.phone : {};
  const out = {};
  for (const key of SAVED_PHONE_ACCOUNT_KEYS) {
    if (phone[key] === void 0 || phone[key] === null) continue;
    const value = String(phone[key]).trim();
    if (!value) continue;
    out[key] = value;
  }
  return out;
}
function savePhoneAccount(account = {}) {
  const userPath = getUserConfigPath();
  const existing = readJsonFile(userPath) || { mount: {}, phone: {} };
  const phone = Object.assign({}, existing.phone || {});
  const source = account && typeof account === "object" ? account : {};
  for (const key of SAVED_PHONE_ACCOUNT_KEYS) {
    if (source[key] === void 0 || source[key] === null) continue;
    const value = String(source[key]).trim();
    if (value) phone[key] = value;
    else delete phone[key];
  }
  delete phone.Password;
  delete phone.SipPassword;
  const next = {
    mount: Object.assign({}, existing.mount || {}),
    phone
  };
  fs.mkdirSync(path.dirname(userPath), { recursive: true });
  fs.writeFileSync(userPath, JSON.stringify(next, null, 2), "utf8");
  writeLog("info", "Saved phone account to user config", {
    path: userPath,
    keys: Object.keys(phone)
  });
  return { ok: true, path: userPath };
}
function clearPhoneAccount() {
  const userPath = getUserConfigPath();
  const existing = readJsonFile(userPath) || { mount: {}, phone: {} };
  const phone = Object.assign({}, existing.phone || {});
  for (const key of SAVED_PHONE_ACCOUNT_KEYS) {
    delete phone[key];
  }
  delete phone.Password;
  delete phone.SipPassword;
  const next = {
    mount: Object.assign({}, existing.mount || {}),
    phone
  };
  fs.mkdirSync(path.dirname(userPath), { recursive: true });
  fs.writeFileSync(userPath, JSON.stringify(next, null, 2), "utf8");
  writeLog("info", "Cleared phone account from user config", { path: userPath });
  return { ok: true, path: userPath };
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
      selectedConfig.phone || {}
    );
  }
  const buildConfig = getBuildPackageDesktopConfig();
  const savedAccount = readSavedPhoneAccount();
  const baseConfig = {
    mount: Object.assign({}, buildConfig.mount || {}),
    phone: Object.assign(
      {},
      bundledConfig.phone || {},
      buildConfig.phone || {},
      startupConfig.phone || {},
      // UI-saved account always wins over blank bundled/dev config.json.
      savedAccount
    )
  };
  const merged = mergeConfig(baseConfig, {});
  writeLog("info", "Desktop config loaded", sanitizeConfigForLog(merged));
  writeLog("info", "Desktop config sources", {
    selected: selectedConfigPath,
    userConfig: getUserConfigPath(),
    savedAccountKeys: Object.keys(savedAccount),
    candidates: startupConfigCandidates
  });
  return merged;
}
function getDesktopAppTitle(config) {
  const title = config && config.mount && config.mount.title ? String(config.mount.title).trim() : "";
  return title || "VPhone";
}
function resolveDesktopIconPath(config, keyName, defaultRelativePath) {
  const iconFallbackKeys = ["icon", "appIcon"];
  const candidates = [
    config && config.desktop && config.desktop[keyName],
    config && config.mount && config.mount[keyName],
    config && config.phone && config.phone[keyName],
    ...iconFallbackKeys.map(
      (k) => config && config.desktop && config.desktop[k]
    ),
    ...iconFallbackKeys.map((k) => config && config.mount && config.mount[k]),
    ...iconFallbackKeys.map((k) => config && config.phone && config.phone[k])
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
  try {
    const sidecar = path.join(path.dirname(process.execPath), "VPhone.ico");
    if (app.isPackaged && fs.existsSync(sidecar)) return sidecar;
  } catch {
  }
  const unpackedCandidate = path.join(
    process.resourcesPath || "",
    "app.asar.unpacked",
    selected
  );
  if (process.resourcesPath && fs.existsSync(unpackedCandidate)) {
    return unpackedCandidate;
  }
  const appDirCandidate = path.join(__dirname, selected);
  if (fs.existsSync(appDirCandidate)) return appDirCandidate;
  const assetRootCandidate = path.join(getAssetRoot(), selected);
  if (fs.existsSync(assetRootCandidate)) return assetRootCandidate;
  const fallbackUnpacked = path.join(
    process.resourcesPath || "",
    "app.asar.unpacked",
    "icons",
    "win",
    "icon.ico"
  );
  if (process.resourcesPath && fs.existsSync(fallbackUnpacked)) {
    return fallbackUnpacked;
  }
  return path.join(__dirname, "icons", "win", "icon.ico");
}
function loadDesktopIconImage(iconPath) {
  if (!iconPath) return void 0;
  try {
    if (fs.existsSync(iconPath)) {
      let image = nativeImage.createFromPath(iconPath);
      if (image.isEmpty()) {
        image = nativeImage.createFromBuffer(fs.readFileSync(iconPath));
      }
      if (!image.isEmpty()) return image;
    }
  } catch (error) {
    writeLog("warn", "Failed to load desktop icon", {
      iconPath,
      error: String(error)
    });
  }
  return iconPath;
}
function getDesktopWindowIcon(config) {
  return loadDesktopIconImage(
    resolveDesktopIconPath(config, "windowIcon", "icons/win/icon.ico")
  );
}
function getDesktopTrayIcon(config) {
  return loadDesktopIconImage(
    resolveDesktopIconPath(config, "trayIcon", "icons/win/icon.ico")
  );
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
    transfer: "F8"
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
  const name = String(action || "");
  if (!name) return false;
  const now = Date.now();
  if (name === lastShortcutAction && now - lastShortcutAt < SHORTCUT_DEBOUNCE_MS) {
    return false;
  }
  if (mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
    lastShortcutAction = name;
    lastShortcutAt = now;
    mainWindow.webContents.send("vphone-desktop:shortcut-action", {
      action: name
    });
    return true;
  }
  return false;
}
function hwndFromNativeHandle(handleBuffer) {
  if (!handleBuffer || !Buffer.isBuffer(handleBuffer) || handleBuffer.length < 4) {
    return 0n;
  }
  return handleBuffer.length >= 8 ? handleBuffer.readBigUInt64LE(0) : BigInt(handleBuffer.readUInt32LE(0));
}
var winIconHelperPath = "";
var win32FocusApi = null;
function getPackagedSidecarIconPath() {
  try {
    const sidecar = path.join(path.dirname(process.execPath), "VPhone.ico");
    if (fs.existsSync(sidecar)) return sidecar;
  } catch {
  }
  return "";
}
var nativeWindowIconApplied = false;
var nativeWindowIconInFlight = false;
function ensureWinIconHelperPath() {
  if (winIconHelperPath && fs.existsSync(winIconHelperPath)) return winIconHelperPath;
  const target = path.join(app.getPath("temp"), "vphone-set-window-icon.ps1");
  const script = [
    "param([Int64]$Hwnd, [string]$IconPath)",
    "if (-not ([System.Management.Automation.PSTypeName]'VPhoneWinIcon').Type) {",
    "  Add-Type -TypeDefinition @'",
    "using System;",
    "using System.Runtime.InteropServices;",
    "public class VPhoneWinIcon {",
    "  public const int WM_SETICON = 0x0080;",
    "  public const int ICON_SMALL = 0;",
    "  public const int ICON_BIG = 1;",
    "  public const uint IMAGE_ICON = 1;",
    "  public const uint LR_LOADFROMFILE = 0x0010;",
    '  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern IntPtr LoadImage(IntPtr hInst, string name, uint type, int cx, int cy, uint fuLoad);',
    '  [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr hWnd, int Msg, IntPtr wParam, IntPtr lParam);',
    '  [DllImport("user32.dll")] public static extern bool DestroyIcon(IntPtr hIcon);',
    "}",
    "'@",
    "}",
    "$h = [IntPtr]$Hwnd",
    "$big = [VPhoneWinIcon]::LoadImage([IntPtr]::Zero, $IconPath, [VPhoneWinIcon]::IMAGE_ICON, 32, 32, [VPhoneWinIcon]::LR_LOADFROMFILE)",
    "$small = [VPhoneWinIcon]::LoadImage([IntPtr]::Zero, $IconPath, [VPhoneWinIcon]::IMAGE_ICON, 16, 16, [VPhoneWinIcon]::LR_LOADFROMFILE)",
    "if ($big -ne [IntPtr]::Zero) { [void][VPhoneWinIcon]::SendMessage($h, [VPhoneWinIcon]::WM_SETICON, [IntPtr][VPhoneWinIcon]::ICON_BIG, $big) }",
    "if ($small -ne [IntPtr]::Zero) { [void][VPhoneWinIcon]::SendMessage($h, [VPhoneWinIcon]::WM_SETICON, [IntPtr][VPhoneWinIcon]::ICON_SMALL, $small) }",
    "if (($big -ne [IntPtr]::Zero) -or ($small -ne [IntPtr]::Zero)) { '1' } else { '0' }"
  ].join("\r\n");
  fs.writeFileSync(target, script, "utf8");
  winIconHelperPath = target;
  return winIconHelperPath;
}
function forceWindowIconWin32(browserWindow, iconPath) {
  if (process.platform !== "win32") return;
  if (!browserWindow || browserWindow.isDestroyed()) return;
  if (nativeWindowIconApplied || nativeWindowIconInFlight) return;
  const ico = String(iconPath || getPackagedSidecarIconPath() || "").trim();
  if (!ico || !fs.existsSync(ico)) return;
  let hwnd;
  try {
    hwnd = hwndFromNativeHandle(browserWindow.getNativeWindowHandle());
  } catch (error) {
    writeLog("warn", "forceWindowIconWin32 hwnd failed", { error: String(error) });
    return;
  }
  if (!hwnd) return;
  nativeWindowIconInFlight = true;
  const helper = ensureWinIconHelperPath();
  const { execFile } = require("node:child_process");
  execFile(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-WindowStyle",
      "Hidden",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      helper,
      "-Hwnd",
      hwnd.toString(),
      "-IconPath",
      ico
    ],
    { timeout: 2500, windowsHide: true, encoding: "utf8" },
    (error, stdout) => {
      nativeWindowIconInFlight = false;
      if (error) {
        writeLog("warn", "forceWindowIconWin32 failed", { error: String(error) });
        return;
      }
      if (String(stdout || "").trim().endsWith("1")) {
        nativeWindowIconApplied = true;
      }
    }
  );
}
function applyDesktopWindowIcon(browserWindow, desktopConfig, options = {}) {
  if (!browserWindow || browserWindow.isDestroyed()) return;
  const windowIcon = getDesktopWindowIcon(desktopConfig);
  if (windowIcon) {
    try {
      browserWindow.setIcon(windowIcon);
    } catch (error) {
      writeLog("warn", "Failed to set window icon", { error: String(error) });
    }
  }
  const sidecar = getPackagedSidecarIconPath();
  if (sidecar) {
    try {
      browserWindow.setIcon(sidecar);
    } catch {
    }
  }
  if (options && options.native) {
    forceWindowIconWin32(browserWindow, sidecar);
  }
}
function asHwnd(value) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isFinite(value)) return BigInt(value);
  return 0n;
}
function getWin32FocusApi() {
  if (win32FocusApi) return win32FocusApi;
  const koffi = require("koffi");
  const user32 = koffi.load("user32.dll");
  const kernel32 = koffi.load("kernel32.dll");
  win32FocusApi = {
    SetForegroundWindow: user32.func("bool __stdcall SetForegroundWindow(intptr hWnd)"),
    BringWindowToTop: user32.func("bool __stdcall BringWindowToTop(intptr hWnd)"),
    ShowWindow: user32.func("bool __stdcall ShowWindow(intptr hWnd, int nCmdShow)"),
    GetForegroundWindow: user32.func("intptr __stdcall GetForegroundWindow()"),
    SetFocus: user32.func("intptr __stdcall SetFocus(intptr hWnd)"),
    GetWindowThreadProcessId: user32.func(
      "uint32_t __stdcall GetWindowThreadProcessId(intptr hWnd, intptr lpdwProcessId)"
    ),
    AttachThreadInput: user32.func(
      "bool __stdcall AttachThreadInput(uint32_t idAttach, uint32_t idAttachTo, bool fAttach)"
    ),
    keybd_event: user32.func(
      "void __stdcall keybd_event(uint8_t bVk, uint8_t bScan, uint32_t dwFlags, uintptr_t dwExtraInfo)"
    ),
    GetCurrentThreadId: kernel32.func("uint32_t __stdcall GetCurrentThreadId()")
  };
  return win32FocusApi;
}
function forceForegroundWin32(browserWindow) {
  if (process.platform !== "win32") return false;
  if (!browserWindow || browserWindow.isDestroyed()) return false;
  try {
    const hwnd = hwndFromNativeHandle(browserWindow.getNativeWindowHandle());
    if (!hwnd) return false;
    const api = getWin32FocusApi();
    const fg = asHwnd(api.GetForegroundWindow());
    if (fg === hwnd) return true;
    api.keybd_event(18, 0, 1, 0);
    api.keybd_event(18, 0, 3, 0);
    const fgThread = api.GetWindowThreadProcessId(fg, 0) >>> 0;
    const cur = api.GetCurrentThreadId() >>> 0;
    const attached = fgThread !== 0 && fgThread !== cur ? !!api.AttachThreadInput(cur, fgThread, true) : false;
    api.ShowWindow(hwnd, 9);
    api.BringWindowToTop(hwnd);
    api.SetForegroundWindow(hwnd);
    api.SetFocus(hwnd);
    if (attached) api.AttachThreadInput(cur, fgThread, false);
    return asHwnd(api.GetForegroundWindow()) === hwnd;
  } catch (error) {
    writeLog("warn", "forceForegroundWin32 failed", { error: String(error) });
    return false;
  }
}
function matchesAccelerator(input, accelerator) {
  if (!accelerator) return false;
  const parts = accelerator.toLowerCase().split("+");
  const hasAlt = parts.includes("alt");
  const hasCtrl = parts.includes("ctrl") || parts.includes("control");
  const hasShift = parts.includes("shift");
  const key = parts.find(
    (p) => p !== "alt" && p !== "ctrl" && p !== "control" && p !== "shift"
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
  const allowedPermissions = /* @__PURE__ */ new Set([
    "media",
    "mediaKeySystem",
    "display-capture",
    "speaker-selection",
    "fullscreen"
  ]);
  session.defaultSession.setPermissionCheckHandler(
    (webContents, permission) => {
      return allowedPermissions.has(permission);
    }
  );
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      callback(allowedPermissions.has(permission));
    }
  );
  if (typeof session.defaultSession.setDisplayMediaRequestHandler === "function") {
    session.defaultSession.setDisplayMediaRequestHandler(
      (request, callback) => {
        callback({
          video: request.videoRequested ? request.frame : null,
          audio: "loopback"
        });
      }
    );
  }
}
async function requestMediaAccess() {
  const result = { microphone: true, camera: true };
  if (process.platform === "darwin" && systemPreferences && typeof systemPreferences.askForMediaAccess === "function") {
    try {
      result.microphone = await systemPreferences.askForMediaAccess("microphone");
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
  const windowWidth = 270;
  const windowHeight = 485;
  const windowIcon = getDesktopWindowIcon(desktopConfig);
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
    icon: windowIcon,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  applyDesktopWindowIcon(mainWindow, desktopConfig);
  mainWindow.once("ready-to-show", () => {
    applyDesktopWindowIcon(mainWindow, desktopConfig, { native: true });
  });
  mainWindow.on("show", () => {
    applyDesktopWindowIcon(mainWindow, desktopConfig);
  });
  mainWindow.removeMenu();
  try {
    const policy = desktopConfig?.phone?.WebRTCIPHandlingPolicy;
    if (policy && typeof mainWindow.webContents.setWebRTCIPHandlingPolicy === "function") {
      mainWindow.webContents.setWebRTCIPHandlingPolicy(policy);
      writeLog("info", "WebRTC IP handling policy set", { policy });
    }
  } catch (error) {
    writeLog("warn", "Failed to set WebRTC IP handling policy", {
      error: String(error)
    });
  }
  mainWindow.loadFile(rendererPath);
  if (isDesktopDevMode()) {
    mainWindow.webContents.on("console-message", (event) => {
      const params = event || {};
      writeLog("renderer-console", params.message || "", {
        level: params.level,
        line: params.lineNumber,
        sourceId: params.sourceId
      });
    });
  }
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      writeLog("error", "Renderer failed to load", {
        errorCode,
        errorDescription,
        validatedURL
      });
    }
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
    desktopConfig && desktopConfig.phone && desktopConfig.phone.KeyboardShortcuts
  );
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    const key = String(input.key || "");
    const openDevtools = key === "F12" || (input.control || input.meta) && input.shift && key.toLowerCase() === "i";
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
      ["transfer", keyboardShortcuts.transfer]
    ];
    const reserved = new Set(
      bindings.map(([, accelerator]) => String(accelerator || "").toLowerCase()).filter(Boolean)
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
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
      mainWindow.webContents.focus();
      mainWindow.webContents.send("vphone-desktop:window-focused");
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.flashFrame(false);
    }
  });
  mainWindow.on("closed", () => {
    nativeWindowIconApplied = false;
    nativeWindowIconInFlight = false;
    mainWindow = null;
  });
}
function createTray(desktopConfig, appTitle) {
  tray = new Tray(getDesktopTrayIcon(desktopConfig));
  const autoEnabled = getAutoLaunchEnabled();
  const trayMenu = Menu.buildFromTemplate([
    {
      label: "M\u1EDF VPhone",
      click: () => focusMainWindow("tray-open")
    },
    {
      type: "separator"
    },
    {
      label: "T\u1EF1 kh\u1EDFi \u0111\u1ED9ng",
      type: "checkbox",
      checked: !!autoEnabled,
      click: (menuItem) => {
        try {
          setAutoLaunchEnabled(!!menuItem.checked);
        } catch (err) {
          writeLog("error", "Failed to set auto-launch", { err: String(err) });
        }
      }
    },
    {
      type: "separator"
    },
    {
      label: "Tho\xE1t",
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
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
    try {
      options.path = process.execPath;
    } catch (e) {
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
      fs.writeFileSync(marker, (/* @__PURE__ */ new Date()).toISOString());
      writeLog("info", "Auto-launch default enabled on first run");
    }
  } catch (error) {
    writeLog("error", "Failed to ensure auto-launch default", {
      error: String(error)
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
    const maxAttempts = isIncomingCall ? 3 : 2;
    let attempt = 0;
    let lastOsFocused = false;
    const applyFocus = (useWin32) => {
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
      mainWindow.show();
      mainWindow.moveTop();
      mainWindow.focus();
      if (useWin32) {
        lastOsFocused = forceForegroundWin32(mainWindow);
      }
      if (mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
        mainWindow.webContents.focus();
      }
      return lastOsFocused;
    };
    const finalizeFocus = () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (!lastOsFocused) {
        lastOsFocused = forceForegroundWin32(mainWindow);
      }
      const osFocused = lastOsFocused;
      const stillFocused = osFocused || mainWindow.isFocused();
      if (!osFocused) {
        mainWindow.flashFrame(true);
      } else {
        mainWindow.flashFrame(false);
      }
      if (osFocused) {
        mainWindow.setAlwaysOnTop(false);
      } else {
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.setAlwaysOnTop(false);
          }
        }, isIncomingCall ? 4e3 : 1200);
      }
      syncGlobalHotkeys();
      writeLog("info", "Desktop window focus attempt finished", {
        reason: focusReason,
        focused: stillFocused,
        osForeground: osFocused,
        visible: mainWindow.isVisible(),
        minimized: mainWindow.isMinimized()
      });
    };
    const focusWithRetry = () => {
      attempt += 1;
      const isLast = attempt >= maxAttempts;
      applyFocus(isLast);
      if (isLast || lastOsFocused) {
        setTimeout(finalizeFocus, isIncomingCall ? 120 : 60);
        return;
      }
      setTimeout(focusWithRetry, isIncomingCall ? 140 : 100);
    };
    focusWithRetry();
    writeLog("info", "Desktop window focus requested", {
      reason: focusReason,
      maxAttempts
    });
    return true;
  } catch (error) {
    writeLog("warn", "Failed to focus desktop window", {
      reason: reason || "manual",
      name: error?.name,
      message: error?.message
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
  ipcMain.handle(
    "vphone-desktop:save-phone-account",
    (_event, account) => savePhoneAccount(account)
  );
  ipcMain.handle("vphone-desktop:clear-phone-account", () => clearPhoneAccount());
  ipcMain.handle("vphone-desktop:is-dev", () => isDesktopDevMode());
  ipcMain.handle("vphone-desktop:secret-available", () => {
    try {
      return !!(safeStorage && typeof safeStorage.isEncryptionAvailable === "function" && safeStorage.isEncryptionAvailable());
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
  ipcMain.handle(
    "vphone-desktop:request-media-access",
    () => requestMediaAccess()
  );
  ipcMain.handle("vphone-desktop:get-diagnostics", () => ({
    logFilePath: getLogFilePath(),
    userConfigPath: getUserConfigPath(),
    isDev: isDesktopDevMode()
  }));
  ipcMain.on("vphone-desktop:log", (event, payload) => {
    writeLog(
      payload && payload.level || "info",
      payload && payload.message || "",
      payload && payload.meta
    );
  });
  ipcMain.handle(
    "vphone-desktop:focus-window",
    (event, reason) => focusMainWindow(reason)
  );
  ipcMain.handle("vphone-desktop:minimize-window", () => minimizeMainWindow());
  ipcMain.handle("vphone-desktop:close-window", () => closeMainWindow());
  ipcMain.on("vphone-desktop:call-phase", (_event, phase) => {
    callPhase = typeof phase === "string" && phase ? phase : "idle";
    syncGlobalHotkeys();
  });
  ipcMain.handle(
    "vphone-desktop:get-auto-launch",
    () => getAutoLaunchEnabled()
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
      error: String(error)
    });
    return false;
  }
}
function registerActiveCallHotkeys() {
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
function syncGlobalHotkeys() {
  try {
    globalShortcut.unregisterAll();
  } catch (error) {
    writeLog("warn", "Failed to unregister global shortcuts", { error: String(error) });
  }
  if (callPhase === "idle") return;
  registerActiveCallHotkeys();
}
app.on("before-quit", () => {
  app.isQuitting = true;
  try {
    globalShortcut.unregisterAll();
  } catch {
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
