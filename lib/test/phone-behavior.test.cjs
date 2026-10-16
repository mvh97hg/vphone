const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('path');

module.exports = function testPhoneBehavior() {
  const js = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'ui', 'phone-widget.js'), 'utf8');
  const core = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'core', 'phone-core.js'), 'utf8');
  const versionJs = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'version.js'), 'utf8');

  assert.match(js, /#formatBillsec\(/);
  assert.match(js, /#getRecentCallStatus\(/);
  assert.match(js, /#clearAllRecents\(/);
  assert.match(js, /#clearAllContacts\(/);
  assert.match(js, /#deleteRecentGroup\(/);
  assert.match(js, /ItemType !== "CDR"/);
  assert.match(js, /call_busy/);
  assert.match(js, /you_missed_a_call/);
  assert.match(js, /call_noanswer/);
  assert.match(js, /#groupRecents\(/);
  assert.match(js, /Consecutive same contact/);
  assert.match(core, /userAgentString:\s*getSipUserAgentString\(/);
  assert.match(core, /from\s+["']\.\.\/version\.js["']/);
  assert.match(versionJs, /formatBuildVersion/);
  assert.match(versionJs, /getSipUserAgentString/);
  assert.match(versionJs, /VPhone\//);
  assert.match(versionJs, /__VPHONE_BUILD_VERSION__/);
  const embedBuild = fs.readFileSync(
    path.join(__dirname, '..', 'scripts', 'build-embedded-ui.js'),
    'utf8'
  );
  assert.match(embedBuild, /__VPHONE_BUILD_VERSION__/);
  assert.match(embedBuild, /formatBuildVersion/);
  const desktopBuild = fs.readFileSync(
    path.join(__dirname, '..', '..', 'desktop', 'electron', 'scripts', 'build-desktop.cjs'),
    'utf8'
  );
  assert.match(desktopBuild, /__VPHONE_BUILD_VERSION__/);
  assert.match(core, /sessionDescriptionHandlerOptionsReInvite/);
  assert.match(core, /hold:\s*wantHold/);
  assert.match(core, /_preserveIceCredentials/);
  // Re-INVITE must not wait forever (timeout 0) when gathering restarts after
  // hold direction change — first Hold never sends; next click finally does.
  assert.match(core, /_holdIceGatheringTimeoutMs/);
  assert.match(core, /_restoreTransceiverHoldDirection/);
  assert.match(core, /_holdRenegotiationSucceeded/);
  assert.match(js, /#syncHoldButtons/);
  assert.match(js, /#runHoldAction/);
  assert.match(core, /IceStunCheckTimeout/);
  assert.match(core, /sip-0\.21\.2\.min\.js/);
  assert.match(core, /resolveSipDomain/);
  assert.match(core, /getAudioConstraints/);
  assert.match(core, /extraHeaders/);
  assert.match(js, /makeCallFromHost/);
  assert.match(js, /vphone-call/);
  assert.match(js, /vphone-status/);
  assert.match(js, /vphone-credentials-required/);
  assert.match(js, /action === "configure"/);
  assert.match(core, /_extractIncomingHeaders/);
  assert.match(core, /IncomingHeaders/);
  assert.match(core, /ensureMediaAccess/);
  assert.match(js, /#restoreIdleUi/);
  assert.match(js, /ensureMediaAccess/);
  assert.match(core, /sipCallerFromInvitation/);
  assert.match(core, /assertedIdentity \|\| invitation\?\.remoteIdentity/);
  assert.match(core, /uri\?\.user/);
  assert.match(js, /headers: call\.headers/);
  assert.match(js, /number: call\.number/);
  assert.match(js, /window\.VPhoneDesktop/);
  assert.match(js, /persistSipPassword/);
  assert.match(js, /savePhoneAccount/);
  assert.match(js, /sdk\.core\?\.config/);
  assert.match(core, /_intentionallyUnregistered/);
  assert.match(core, /_disposeUserAgent/);
  assert.match(core, /_uaBoundFingerprint/);
  assert.match(core, /_recycleTransport/);
  assert.match(core, /_wireTransportRecovery/);
  assert.match(core, /keepAliveInterval/);
  assert.match(core, /reconnectionAttempts/);
  assert.match(core, /register-failed/);
  assert.match(core, /status: "offline"/);
  assert.match(js, /hydrateSecrets/);
  assert.match(js, /#startRingtone/);
  assert.match(js, /#loadDialpadToggles/);
  assert.match(js, /#saveDialpadToggles/);
  assert.match(js, /DialpadToggles/);
  assert.match(js, /#bindDialpadTogglesSync|#applyDialpadTogglesUi/);
  assert.match(js, /addEventListener\(\s*["']storage["']/);
  assert.match(js, /EnableSettings/);
  assert.match(js, /EnableNotifications/);
  assert.match(js, /EnableRecordAllCalls/);
  assert.match(js, /EnableFreeDial/);
  assert.match(js, /EnableBuddies/);
  assert.match(js, /notification-click/);
  assert.match(js, /#focusBrowserWindow|focusBrowserWindow|topWin\.focus|window\.top/);
  assert.match(js, /ensurePermission/);
  assert.match(js, /#SettingsMenu/);
  assert.match(js, /settingsButtonVisible/);
  assert.match(js, /showSettingsButton/);
  assert.match(js, /prepareSipPasswordForStorage/);
  assert.match(js, /normalizePhoneConfig/);
  assert.equal(js.includes("HideSettingsButton"), false);
  assert.equal(js.includes("EnableNotificationSettings"), false);
  assert.equal(js.includes("NotificationsActive"), false);
  assert.equal(/\bSettingsButton\b/.test(js), false);
  assert.equal(js.includes("HideRecordAllCallsButton"), false);
  assert.equal(js.includes("DisableFreeDial"), false);
  assert.match(js, /Ringtone is always enabled/);
  assert.match(js, /NoiseSuppression/);
  assert.match(js, /Missing SIP configuration/);
  assert.match(fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'sdk', 'tab-leader.js'), 'utf8'), /hasLiveSipRegistration/);
  const sipAuth = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'sdk', 'sip-auth.js'), 'utf8');
  assert.match(sipAuth, /computeHa1/);
  assert.match(sipAuth, /authorizationHa1/);
  assert.match(core, /sipAuthorizationOptions/);

  const ringtone = path.join(__dirname, '..', '..', 'src', 'ui', 'media', 'Ringtone.mp3');
  assert.equal(fs.existsSync(ringtone), true, 'default Ringtone.mp3 must exist');
};
