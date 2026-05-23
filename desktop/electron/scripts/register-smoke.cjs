const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { _electron: electron } = require('playwright');

const appDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appDir, '..', '..');
const envPath = process.env.BROWSER_PHONE_TEST_ENV || path.join(repoRoot, '.env');
const targetNumber = '1235';

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing env file: ${filePath}`);
  const env = {};
  const content = fs.readFileSync(filePath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separator = trimmed.indexOf('=');
    if (separator === -1) return;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  });
  return env;
}

function requireEnv(env, keys) {
  const missing = keys.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing required env keys: ${missing.join(', ')}`);
}

function createDesktopConfig(env, accountIndex) {
  const suffix = accountIndex && accountIndex > 1 ? String(accountIndex) : '';
  requireEnv(env, ['SIP_DOMAIN', 'SERVER', 'PORT', 'SERVER_PATH', `SIP_USERNAME${suffix}`, `SIP_PASSWORD${suffix}`]);
  return {
    mount: {
      width: '250px',
      height: '425px',
      title: `VPhone Register Smoke ${accountIndex || 1}`,
      showStatus: false
    },
    phone: {
      wssServer: env.SERVER,
      WebSocketPort: env.PORT,
      ServerPath: env.SERVER_PATH,
      SipDomain: env.SIP_DOMAIN,
      SipUsername: env[`SIP_USERNAME${suffix}`],
      SipPassword: env[`SIP_PASSWORD${suffix}`],
      SipPasswordType: env.SIP_PASSWORD_TYPE || 'plain',
      Language: env.LANGUAGE || 'vi',
      HideSettingsButton: false,
      EnableVideoCalling: false,
      AutoAnswerPolicy: 'allow',
      DoNotDisturbPolicy: 'allow',
      TraceSip: true
    }
  };
}

async function main() {
  const env = readEnvFile(envPath);
  const desktopConfig = createDesktopConfig(env, 1);
  const tempConfigPath = path.join(os.tmpdir(), `vphone-electron-${Date.now()}.json`);
  fs.writeFileSync(tempConfigPath, JSON.stringify(desktopConfig, null, 2));

  const userDataPath = path.join(os.tmpdir(), `vphone-electron-user-${Date.now()}`);
  const launched = await launchDesktopWithConfig(tempConfigPath, userDataPath);
  const app = launched.app;
  let frame = launched.frame;

  try {
    const registered = await waitForRegistration(frame, 45000);
    if (!registered) {
      const status = await readPhoneStatus(frame);
      throw new Error(`Register timeout. Status: ${JSON.stringify(status)}`);
    }

    const settingsDevices = await readSettingsDevices(frame);

    await frame.evaluate(() => DialByLine('audio', '', '1235'));
    const callStatus = await waitForCallProgress(frame, 15000);

    const diagnostics = await launched.page.evaluate(() => (
      window.VPhoneDesktop && window.VPhoneDesktop.getDiagnostics
        ? window.VPhoneDesktop.getDiagnostics()
        : null
    )).catch(() => null);
    const phoneStatus = await readPhoneStatus(frame);
    const consoleErrors = launched.consoleErrors.slice();
    const failedRequests = launched.failedRequests.slice();
    const dialogs = launched.dialogs.slice();

    await hangupActiveCalls(frame).catch(() => {});
    await closeElectronApp(app);
    frame = null;

    const dualAppResult = await runDualExtensionSmoke(env);

    console.log(JSON.stringify({
      registered: true,
      callTarget: targetNumber,
      callStatus,
      settingsDevices,
      dualAppResult,
      phoneStatus,
      diagnostics,
      consoleErrors,
      failedRequests,
      dialogs
    }, null, 2));
  } finally {
    if (frame) await hangupActiveCalls(frame).catch(() => {});
    await closeElectronApp(app);
    safeRmSync(tempConfigPath);
    safeRmSync(userDataPath, { recursive: true });
  }
}

async function launchDesktopWithConfig(tempConfigPath, userDataPath) {
  const app = await electron.launch({
    cwd: appDir,
    args: ['.', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    env: Object.assign({}, process.env, {
      VPHONE_DESKTOP_CONFIG: tempConfigPath,
      VPHONE_DESKTOP_USER_DATA: userDataPath
    })
  });

  const page = await app.firstWindow({ timeout: 30000 });
  const consoleErrors = [];
  const dialogs = [];
  const failedRequests = [];
  const consoleMessages = [];

  page.on('console', (message) => {
    const text = message.text();
    consoleMessages.push(text);
    if (message.type() === 'error') consoleErrors.push(text);
  });
  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: request.url(),
      errorText: request.failure() ? request.failure().errorText : ''
    });
  });
  page.on('dialog', async (dialog) => {
    dialogs.push({ type: dialog.type(), message: dialog.message() });
    await dialog.dismiss().catch(() => {});
  });

  await page.waitForSelector('#phone-panel iframe, #desktop-error:not([hidden])', { timeout: 30000 });
  const errorText = await page.locator('#desktop-error:not([hidden])').textContent().catch(() => '');
  if (errorText) throw new Error(`Desktop app error: ${errorText}`);

  const iframeElement = await page.waitForSelector('#phone-panel iframe', { timeout: 30000 });
  const frame = await iframeElement.contentFrame();
  await frame.waitForSelector('#regStatus, #mobileRegText', { state: 'attached', timeout: 30000 });

  return { app, page, frame, consoleErrors, dialogs, failedRequests, consoleMessages };
}

async function runDualExtensionSmoke(env) {
  if (!env.SIP_USERNAME2 || !env.SIP_PASSWORD2) {
    return { skipped: true, reason: 'SIP_USERNAME2/SIP_PASSWORD2 not configured' };
  }

  const receiverConfigPath = path.join(os.tmpdir(), `vphone-electron-receiver-${Date.now()}.json`);
  const callerConfigPath = path.join(os.tmpdir(), `vphone-electron-caller-${Date.now()}.json`);
  const receiverUserDataPath = path.join(os.tmpdir(), `vphone-electron-receiver-user-${Date.now()}`);
  const callerUserDataPath = path.join(os.tmpdir(), `vphone-electron-caller-user-${Date.now()}`);
  fs.writeFileSync(receiverConfigPath, JSON.stringify(createDesktopConfig(env, 1), null, 2));
  fs.writeFileSync(callerConfigPath, JSON.stringify(createDesktopConfig(env, 2), null, 2));

  let receiver = null;
  let caller = null;
  try {
    receiver = await launchDesktopWithConfig(receiverConfigPath, receiverUserDataPath);
    caller = await launchDesktopWithConfig(callerConfigPath, callerUserDataPath);

    const receiverRegistered = await waitForRegistration(receiver.frame, 45000);
    const callerRegistered = await waitForRegistration(caller.frame, 45000);
    if (!receiverRegistered || !callerRegistered) {
      return {
        skipped: false,
        receiverRegistered,
        callerRegistered,
        receiverStatus: await readPhoneStatus(receiver.frame),
        callerStatus: await readPhoneStatus(caller.frame),
        blocker: getRegistrationBlocker(caller),
        receiverDiagnostics: getSafeDiagnostics(receiver),
        callerDiagnostics: getSafeDiagnostics(caller)
      };
    }

    await setFeatureToggle(receiver.frame, 'dnd', true);
    await caller.frame.evaluate((number) => DialByLine('audio', '', number), env.SIP_USERNAME);
    const dndResult = await waitForSipConsole(caller, 'SIP/2.0 486', 15000);
    const receiverDndResult = await waitForSipConsole(receiver, 'SIP/2.0 486', 5000);
    const dndCallStatus = await waitForCallProgress(caller.frame, 15000);
    await hangupActiveCalls(caller.frame);
    await setFeatureToggle(receiver.frame, 'dnd', false);

    await setFeatureToggle(receiver.frame, 'auto', true);
    await caller.frame.evaluate((number) => DialByLine('audio', '', number), env.SIP_USERNAME);
    const receiverCallStatus = await waitForCallProgress(receiver.frame, 20000);
    const callerCallStatus = await waitForCallProgress(caller.frame, 20000);
    const dndStatusLine = summarizeSipStatusLine(dndResult.message);
    const receiverDndStatusLine = summarizeSipStatusLine(receiverDndResult.message);
    const rejectedWith486 = dndResult.found || dndCallStatus.states.some((state) => state.reasonCode === 486);
    const receiverSentDnd = receiverDndStatusLine === 'SIP/2.0 486 Do Not Disturb';
    if (!rejectedWith486 || !receiverSentDnd) {
      throw new Error(`DND smoke failed. caller=${dndStatusLine || 'missing'} receiver=${receiverDndStatusLine || 'missing'}`);
    }
    if (!receiverCallStatus.connected || !callerCallStatus.connected) {
      throw new Error('Auto answer smoke failed. Both receiver and caller must reach Established state.');
    }

    return {
      skipped: false,
      receiverRegistered,
      callerRegistered,
      dnd: {
        rejectedWith486,
        statusLine: dndStatusLine,
        receiverStatusLine: receiverDndStatusLine,
        receiverSentDnd,
        callerCallStatus: dndCallStatus
      },
      autoAnswer: {
        receiverConnected: receiverCallStatus.connected,
        callerConnected: callerCallStatus.connected,
        receiverCallStatus,
        callerCallStatus
      }
    };
  } finally {
    if (caller && caller.frame) await hangupActiveCalls(caller.frame).catch(() => {});
    if (receiver && receiver.frame) await hangupActiveCalls(receiver.frame).catch(() => {});
    if (caller) await closeElectronApp(caller.app);
    if (receiver) await closeElectronApp(receiver.app);
    safeRmSync(receiverConfigPath);
    safeRmSync(callerConfigPath);
    safeRmSync(receiverUserDataPath, { recursive: true });
    safeRmSync(callerUserDataPath, { recursive: true });
  }
}

function getSafeDiagnostics(desktop) {
  return desktop.consoleMessages
    .filter((message) => (
      message.indexOf('Registration Failed') !== -1 ||
      message.indexOf('Registered!') !== -1 ||
      message.indexOf('Transport') !== -1 ||
      message.indexOf('Register timeout') !== -1 ||
      message.indexOf('SIP account is not configured') !== -1
    ))
    .map(summarizeDiagnosticMessage)
    .slice(-20);
}

function summarizeDiagnosticMessage(message) {
  if (message.indexOf('403 Transport not allowed') !== -1) return 'REGISTER rejected: 403 Transport not allowed';
  if (message.indexOf('401 Unauthorized') !== -1) return 'REGISTER challenged: 401 Unauthorized';
  if (message.indexOf('SIP/2.0 200 OK') !== -1 && message.indexOf('REGISTER') !== -1) return 'REGISTER accepted: 200 OK';
  if (message.indexOf('Registration Failed') !== -1) return message.replace(/Authorization:[^\r\n]+/gi, 'Authorization: ***');
  if (message.indexOf('WebSocket opened') !== -1) return 'Transport connected';
  if (message.indexOf('WebSocket closed') !== -1) return 'Transport closed';
  if (message.indexOf('Connecting wss://') !== -1) return 'Transport connecting';
  if (message.indexOf('CRLF Keep Alive') !== -1) return 'Transport keepalive ok';
  if (message.indexOf('Registered!') !== -1) return 'Registered';
  return message.split(/\r?\n/)[0].replace(/Authorization:[^\r\n]+/gi, 'Authorization: ***');
}

function summarizeSipStatusLine(message) {
  if (!message) return '';
  const match = message.match(/SIP\/2\.0\s+\d{3}[^\r\n]*/);
  return match ? match[0].trim() : '';
}

function getRegistrationBlocker(desktop) {
  const transportNotAllowed = desktop.consoleMessages.some((message) => message.indexOf('403 Transport not allowed') !== -1);
  if (transportNotAllowed) return 'SIP server rejected the second extension with 403 Transport not allowed';
  const registrationFailed = desktop.consoleMessages.find((message) => message.indexOf('Registration Failed') !== -1);
  return registrationFailed ? summarizeDiagnosticMessage(registrationFailed) : '';
}

async function waitForRegistration(frame, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const status = await readPhoneStatus(frame);
    if (status.isRegistered) return true;
    await frame.page().waitForTimeout(1000);
  }
  return false;
}

async function readPhoneStatus(frame) {
  return frame.evaluate(() => ({
    regStatus: document.querySelector('#regStatus') ? document.querySelector('#regStatus').textContent.trim() : '',
    mobileRegText: document.querySelector('#mobileRegText') ? document.querySelector('#mobileRegText').textContent.trim() : '',
    isRegistered: typeof IsSipRegistered === 'function' ? IsSipRegistered() : false,
    hasUserAgent: typeof userAgent !== 'undefined' && !!userAgent,
    hasRegisterer: typeof userAgent !== 'undefined' && !!userAgent && !!userAgent.registerer,
    microphoneOptions: document.querySelectorAll('#microphoneSrc option').length,
    speakerOptions: document.querySelectorAll('#playbackSrc option').length
  }));
}

async function readSettingsDevices(frame) {
  await frame.evaluate(() => {
    if (typeof ShowMyProfile === 'function') ShowMyProfile();
  });
  await frame.waitForSelector('#microphoneSrc, #playbackSrc', { state: 'attached', timeout: 10000 });

  const started = Date.now();
  let devices = null;
  while (Date.now() - started < 10000) {
    devices = await frame.evaluate(() => ({
      microphoneOptions: document.querySelectorAll('#microphoneSrc option').length,
      speakerOptions: document.querySelectorAll('#playbackSrc option').length,
      ringOptions: document.querySelectorAll('#ringDevice option').length,
      hasMicrophoneSelect: !!document.querySelector('#microphoneSrc'),
      hasSpeakerSelect: !!document.querySelector('#playbackSrc')
    }));
    if (devices.microphoneOptions > 0 && devices.speakerOptions > 0) return devices;
    await frame.page().waitForTimeout(500);
  }

  return devices || {
    microphoneOptions: 0,
    speakerOptions: 0,
    ringOptions: 0,
    hasMicrophoneSelect: false,
    hasSpeakerSelect: false
  };
}

async function setFeatureToggle(frame, featureName, enabled) {
  await frame.evaluate(({ featureName, enabled }) => {
    if (featureName === 'auto') {
      if (typeof AutoAnswerEnabled !== 'undefined' && AutoAnswerEnabled !== enabled && typeof ToggleAutoAnswer === 'function') {
        ToggleAutoAnswer();
      }
      return;
    }

    if (featureName === 'dnd') {
      if (typeof DoNotDisturbEnabled !== 'undefined' && DoNotDisturbEnabled !== enabled && typeof ToggleDoNoDisturb === 'function') {
        ToggleDoNoDisturb();
      }
    }
  }, { featureName, enabled });
}

async function waitForSipConsole(desktop, pattern, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const found = desktop.consoleMessages.find((message) => message.indexOf(pattern) !== -1);
    if (found) return { found: true, message: found };
    await desktop.page.waitForTimeout(500);
  }
  return { found: false, message: '' };
}

async function waitForCallProgress(frame, timeoutMs) {
  const started = Date.now();
  let lastStatus = null;
  while (Date.now() - started < timeoutMs) {
    lastStatus = await readCallStatus(frame);
    if (lastStatus.connected || lastStatus.ended) return lastStatus;
    await frame.page().waitForTimeout(500);
  }
  return lastStatus || { activeCount: 0, connected: false, ended: false, states: [] };
}

async function readCallStatus(frame) {
  return frame.evaluate(() => {
    const states = (typeof Lines !== 'undefined' ? Lines : []).map((line) => {
      const session = line && line.SipSession;
      return {
        lineNumber: line && line.LineNumber,
        state: session && session.state ? String(session.state) : '',
        reasonCode: session && session.data ? session.data.reasonCode || null : null,
        reasonText: session && session.data ? session.data.reasonText || '' : ''
      };
    });
    return {
      activeCount: typeof countSessions === 'function' ? countSessions('0') : 0,
      connected: states.some((item) => item.state.indexOf('Established') !== -1),
      ended: states.some((item) => item.state.indexOf('Terminated') !== -1 || item.reasonCode),
      states
    };
  });
}

async function hangupActiveCalls(frame) {
  await frame.evaluate(() => {
    if (typeof Lines === 'undefined' || typeof endSession !== 'function') return;
    Lines.forEach((line) => {
      if (line && line.SipSession) endSession(line.LineNumber);
    });
  }).catch(() => {});
  await frame.page().waitForTimeout(1000).catch(() => {});
}

async function closeElectronApp(app) {
  let childPid = null;
  try {
    const childProcess = typeof app.process === 'function' ? app.process() : null;
    childPid = childProcess && childProcess.pid ? childProcess.pid : null;
  } catch (error) {
    childPid = null;
  }

  await Promise.race([
    app.close(),
    new Promise((resolve) => setTimeout(resolve, 5000))
  ]).catch(() => {});

  if (childPid) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(childPid), '/t', '/f'], { stdio: 'ignore' });
    } else {
      try {
        process.kill(childPid, 'SIGKILL');
      } catch (error) {}
    }
  }
}

function safeRmSync(targetPath, options) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      fs.rmSync(targetPath, Object.assign({ force: true }, options || {}));
      return;
    } catch (error) {
      if (attempt === 2) return;
      spawnSync('powershell', ['-NoProfile', '-Command', 'Start-Sleep -Milliseconds 500'], { stdio: 'ignore' });
    }
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});

