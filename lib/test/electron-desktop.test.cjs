const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

module.exports = function testElectronDesktop() {
  const mainJs = fs.readFileSync(path.join(__dirname, '..', '..', 'desktop', 'electron', 'main.js'), 'utf8');
  const preloadJs = fs.readFileSync(path.join(__dirname, '..', '..', 'desktop', 'electron', 'preload.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '..', '..', 'desktop', 'electron', 'renderer', 'app.js'), 'utf8');
  const rendererHtml = fs.readFileSync(path.join(__dirname, '..', '..', 'desktop', 'electron', 'renderer', 'index.html'), 'utf8');
  const packageJson = fs.readFileSync(path.join(__dirname, '..', '..', 'desktop', 'electron', 'package.json'), 'utf8');
  const readme = fs.readFileSync(path.join(__dirname, '..', '..', 'README.md'), 'utf8');
  const phoneCore = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'core', 'phone-core.js'), 'utf8');

  assert.match(mainJs, /setPermissionCheckHandler/);
  assert.match(mainJs, /["']media["']/);
  assert.match(mainJs, /["']speaker-selection["']/);
  assert.doesNotMatch(mainJs, /function\s+readEnvFile\s*\(/);
  assert.doesNotMatch(mainJs, /loadEnvConfig/);
  assert.doesNotMatch(mainJs, /BROWSER_PHONE_DESKTOP_ENV/);
  assert.doesNotMatch(mainJs, /SIP_USERNAME/);
  assert.match(mainJs, /VPHONE_DESKTOP_USER_DATA/);
  assert.match(mainJs, /app\.setPath\(["']userData["']/);
  assert.match(mainJs, /function\s+getDesktopAppTitle\s*\(/);
  assert.match(mainJs, /app\.setName\(appTitle\)/);
  assert.match(mainJs, /setAppUserModelId/);
  assert.match(mainJs, /vphone-desktop:log/);
  assert.match(mainJs, /vphone-desktop:focus-window/);
  assert.match(mainJs, /vphone-desktop:shortcut-action/);
  assert.match(mainJs, /globalShortcut/);
  assert.match(mainJs, /syncGlobalHotkeys/);
  assert.match(mainJs, /isDesktopDevMode/);
  assert.match(mainJs, /globalShortcut\.register/);
  assert.match(mainJs, /globalShortcut\.unregisterAll/);
  assert.match(preloadJs, /isDevMode/);
  assert.doesNotMatch(mainJs, new RegExp('vphone-legacy' + '-desktop:'));
  assert.match(mainJs, /frame:\s*false/);
  assert.match(mainJs, /windowHeight\s*=\s*485|height:\s*485/);
  assert.match(mainJs, /minHeight:\s*windowHeight/);
  assert.match(mainJs, /maxHeight:\s*windowHeight/);
  assert.match(mainJs, /transparent:\s*true/);
  assert.match(mainJs, /roundedCorners:\s*false/);
  assert.match(mainJs, /backgroundColor:\s*['"]#00000000['"]/);
  assert.match(mainJs, /function\s+getDesktopWindowIcon\s*\(/);
  assert.match(mainJs, /function\s+getDesktopTrayIcon\s*\(/);
  assert.match(mainJs, /icon:\s*windowIcon|getDesktopWindowIcon\(desktopConfig\)/);
  assert.match(mainJs, /mainWindow\.setIcon\(|applyDesktopWindowIcon/);
  assert.match(mainJs, /forceWindowIconWin32|WM_SETICON/);
  // Icon WM_SETICON must not block startup with sync PowerShell (~0.5s/call).
  {
    const iconFn = mainJs.match(
      /function\s+forceWindowIconWin32\s*\([^)]*\)\s*\{[\s\S]*?\nfunction\s+\w+/,
    );
    assert.ok(iconFn, "forceWindowIconWin32 function body");
    assert.match(iconFn[0], /\bexecFile\s*\(/);
    assert.doesNotMatch(iconFn[0], /\bexecFileSync\s*\(/);
  }
  assert.match(mainJs, /native:\s*true/);
  assert.match(mainJs, /VPhone\.ico/);
  assert.match(mainJs, /com\.vphone\.softphone/);
  assert.match(packageJson, /"appId":\s*"com\.vphone\.softphone"/);
  // Pin NSIS GUID so future appId/AUMID tweaks cannot create a second ARP entry.
  assert.match(
    packageJson,
    /"guid":\s*"24035e53-71a1-5f93-9697-a417c79850c6"/,
  );
  assert.match(packageJson, /"extraFiles"/);
  assert.match(packageJson, /VPhone\.ico/);
  const installerNshLang = fs.readFileSync(
    path.join(__dirname, '..', '..', 'desktop', 'electron', 'scripts', 'installer.nsh'),
    'utf8'
  );
  assert.match(installerNshLang, /preInit/);
  assert.match(installerNshLang, /LANG_VIETNAMESE/);
  assert.match(installerNshLang, /customInit/);
  assert.match(installerNshLang, /1a7b4758-7242-5396-97c5-0cf39568734e/);
  assert.match(mainJs, /setAlwaysOnTop\(true/);
  assert.match(mainJs, /mainWindow\.show\(\)/);
  assert.match(mainJs, /mainWindow\.moveTop\(\)/);
  assert.doesNotMatch(mainJs, /showInactive\(\)/);
  assert.match(mainJs, /app\.focus\(/);
  assert.match(mainJs, /forceForegroundWin32|SetForegroundWindow|AttachThreadInput/);
  {
    const focusFn = mainJs.match(
      /function\s+forceForegroundWin32\s*\([^)]*\)\s*\{[\s\S]*?\nfunction\s+\w+/,
    );
    assert.ok(focusFn, "forceForegroundWin32 function body");
    assert.match(focusFn[0], /user32|koffi|SetForegroundWindow/);
    assert.doesNotMatch(focusFn[0], /powershell\.exe/);
  }
  assert.match(mainJs, /getNativeWindowHandle/);
  // Active-call hotkeys must work even when Electron reports a fake focused window.
  assert.match(mainJs, /registerActiveCallHotkeys|callPhase === ["']idle["']/);
  assert.doesNotMatch(
    mainJs,
    /if\s*\(\s*windowFocused\s*\|\|\s*callPhase\s*===\s*["']idle["']\s*\)\s*return/,
  );
  assert.match(mainJs, /lastShortcutAction|shortcutDebounce|SHORTCUT_DEBOUNCE/);
  assert.match(mainJs, /did-finish-load/);
  assert.match(mainJs, /focusMainWindow\(/);
  assert.match(mainJs, /webContents\.on\(["']console-message["']/);
  assert.match(mainJs, /getLogFilePath/);

  assert.match(preloadJs, /requestMediaAccess/);
  assert.match(preloadJs, /VPhoneDesktop/);
  assert.match(preloadJs, /savePhoneAccount/);
  assert.match(preloadJs, /clearPhoneAccount/);
  assert.match(preloadJs, /onShortcutAction/);
  assert.match(mainJs, /savePhoneAccount/);
  assert.match(mainJs, /vphone-desktop:save-phone-account/);
  assert.match(mainJs, /readSavedPhoneAccount|savedAccount/);
  assert.doesNotMatch(preloadJs, new RegExp('Browser' + 'PhoneDesktop'));
  assert.doesNotMatch(preloadJs, new RegExp('vphone-legacy' + '-desktop:'));
  assert.match(preloadJs, /focusWindow:/);
  assert.match(preloadJs, /minimizeWindow:/);
  assert.match(preloadJs, /closeWindow:/);
  assert.match(preloadJs, /log:/);
  assert.match(preloadJs, /getDiagnostics:/);

  assert.match(appJs, /createPhoneWidget/);
  assert.match(appJs, /sip-0\.21\.2\.min\.js/);
  assert.match(appJs, /window\.VPhoneDesktop/);
  assert.match(appJs, /minimizeWindow\(\)/);
  assert.match(appJs, /closeWindow\(\)/);

  assert.match(phoneCore, /sip-0\.21\.2\.min\.js/);
  assert.match(phoneCore, /IceStunServerJson/);

  assert.match(packageJson, /"test:register":\s*"node scripts\/register-smoke\.cjs"/);
  assert.match(packageJson, /"dist:win":\s*"pnpm run package"/);
  assert.match(packageJson, /"dist:portable":\s*"pnpm run package"/);
  assert.match(packageJson, /"dist:mac":\s*"pnpm run set:version:build && pnpm run build:desktop && electron-builder --mac"/);
  assert.match(packageJson, /"mac":\s*\{/);
  assert.match(packageJson, /"name":\s*"vphone"/);
  assert.match(packageJson, /"productName":\s*"VPhone"/);
  assert.match(packageJson, /"buildLanguages":\s*\[\s*"en"\s*,\s*"vi"\s*\]/);
  assert.match(packageJson, /"desktop":\s*\{/);
  assert.match(packageJson, /"windowIcon":\s*"icons\/win\/icon\.ico"/);
  assert.match(packageJson, /"AppIcon":\s*"icons\/png\/128x128\.png"/);
  assert.match(packageJson, /"buildResources":\s*"build"/);
  assert.match(packageJson, /"asarUnpack"/);
  assert.match(packageJson, /ensure-build-icons\.cjs/);
  assert.match(packageJson, /after-pack\.cjs/);
  assert.match(packageJson, /after-sign\.cjs/);
  assert.match(packageJson, /finalize-dir-portable\.cjs/);
  assert.match(packageJson, /"include":\s*"installer\.nsh"/);
  assert.match(packageJson, /"target":\s*\[\s*"dir"\s*\]/);
  const installerNsh = fs.readFileSync(
    path.join(__dirname, '..', '..', 'desktop', 'electron', 'scripts', 'installer.nsh'),
    'utf8'
  );
  assert.match(installerNsh, /customInstall/);
  assert.match(installerNsh, /CreateShortCut/);
  assert.match(installerNsh, /SHChangeNotify/);
  assert.match(mainJs, /loadDesktopIconImage/);
  assert.match(mainJs, /app\.asar\.unpacked/);
  const stampIcon = fs.readFileSync(
    path.join(__dirname, '..', '..', 'desktop', 'electron', 'scripts', 'stamp-exe-icon.cjs'),
    'utf8'
  );
  assert.match(stampIcon, /resedit/);
  assert.match(stampIcon, /replaceIconsForResource/);
  assert.match(stampIcon, /replaceExeIcons/);
  const setVersion = fs.readFileSync(
    path.join(__dirname, '..', '..', 'desktop', 'electron', 'scripts', 'set-build-version.cjs'),
    'utf8'
  );
  assert.match(setVersion, /VPhone-\$\{displayVersion\}-win/);
  const finalize = fs.readFileSync(
    path.join(__dirname, '..', '..', 'desktop', 'electron', 'scripts', 'finalize-dir-portable.cjs'),
    'utf8'
  );
  assert.match(finalize, /win-unpacked/);
  assert.match(finalize, /_pack-/);
  assert.match(finalize, /release/);
  assert.match(finalize, /--nsis|nsisMode/);
  assert.match(finalize, /VPhone-Setup|vphone-setup-/);
  assert.match(packageJson, /"output":\s*"release\/_pack/);
  assert.match(packageJson, /finalize-dir-portable\.cjs --nsis/);
  // Portable must not wipe a previously built Setup in release/.
  assert.doesNotMatch(packageJson, /finalize-dir-portable\.cjs --prune-setup/);
  assert.match(setVersion, /release\/_pack-\$\{displayVersion\}/);
  assert.equal(
    fs.existsSync(path.join(__dirname, '..', '..', 'desktop', 'electron', 'icons', 'win', 'icon.ico')),
    true,
    'icons/win/icon.ico must exist for electron-builder'
  );

  assert.match(rendererHtml, /<title>VPhone<\/title>/);
  assert.match(rendererHtml, /desktop-titlebar/);
  assert.match(rendererHtml, /id="phone-panel"[^>]*tabindex="-1"/);
  assert.match(rendererHtml, /data-window-action="minimize"/);
  assert.match(rendererHtml, /data-window-action="close"/);

  assert.match(readme, /lib\/vphone\.min\.js/);
  assert.match(readme, /Vphone\.mount/);
  assert.match(readme, /build:release/);

  const stylesCss = fs.readFileSync(path.join(__dirname, '..', '..', 'desktop', 'electron', 'renderer', 'styles.css'), 'utf8');
  assert.match(stylesCss, /\.desktop-titlebar\s*\{[^}]*-webkit-app-region:\s*drag\s*;/s);
  assert.match(stylesCss, /\.desktop-window-btn\s*\{[^}]*-webkit-app-region:\s*no-drag\s*;/s);
  assert.match(stylesCss, /\.shell\s*\{/);
  assert.match(stylesCss, /\.phone-panel\s*\{/);
};
