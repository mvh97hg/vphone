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
  assert.match(mainJs, /icon:\s*getDesktopWindowIcon\(desktopConfig\)/);
  assert.match(mainJs, /setAlwaysOnTop\(true/);
  assert.match(mainJs, /mainWindow\.show\(\)/);
  assert.match(mainJs, /mainWindow\.moveTop\(\)/);
  assert.doesNotMatch(mainJs, /showInactive\(\)/);
  assert.match(mainJs, /app\.focus\(/);
  assert.match(mainJs, /did-finish-load/);
  assert.match(mainJs, /focusMainWindow\(/);
  assert.match(mainJs, /webContents\.on\(["']console-message["']/);
  assert.match(mainJs, /getLogFilePath/);

  assert.match(preloadJs, /requestMediaAccess/);
  assert.match(preloadJs, /VPhoneDesktop/);
  assert.match(preloadJs, /onShortcutAction/);
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
  assert.match(packageJson, /"dist:win":\s*"pnpm run set:version:build && pnpm run build:desktop && electron-builder --win"/);
  assert.match(packageJson, /"dist:mac":\s*"pnpm run set:version:build && pnpm run build:desktop && electron-builder --mac"/);
  assert.match(packageJson, /"mac":\s*\{/);
  assert.match(packageJson, /"name":\s*"vphone"/);
  assert.match(packageJson, /"productName":\s*"VPhone"/);
  assert.match(packageJson, /"buildLanguages":\s*\[\s*"en"\s*,\s*"vi"\s*\]/);
  assert.match(packageJson, /"desktop":\s*\{/);
  assert.match(packageJson, /"windowIcon":\s*"icons\/win\/icon\.ico"/);
  assert.match(packageJson, /"AppIcon":\s*"icons\/png\/128x128\.png"/);

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
