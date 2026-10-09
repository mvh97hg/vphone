const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('path');

module.exports = function testPhoneUiJs() {
  const js = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'ui', 'phone-widget.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'ui', 'styles', 'phone-ui.css'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'ui', 'index.html'), 'utf8');
  const libReadme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');

  assert.match(js, /#maxDidLength\(/);
  assert.match(js, /Configure_Account_Server/);
  assert.match(js, /Configure_Account_Port/);
  assert.match(js, /Configure_Account_ServerPath/);
  assert.match(js, /Configure_Account_Domain/);
  assert.match(js, /Configure_Account_Username/);
  assert.match(js, /Configure_Account_Password/);
  assert.match(js, /configPrimaryButton/);
  assert.match(js, /configSecondaryButton/);
  assert.match(js, /recentActionCall/);
  assert.match(js, /recentActionAdd/);
  assert.match(js, /recentActionCopy/);
  assert.match(js, /recentActionDelete/);
  assert.match(js, /#groupRecents\(/);
  assert.match(js, /contactActionCall/);
  assert.match(js, /contactActionEdit/);
  assert.match(js, /contactActionDelete/);
  assert.match(js, /contactOverflowMenu/);
  assert.match(js, /clear-tab/);
  assert.match(js, /data-tab/);
  assert.match(js, /#copyTextToClipboard\(/);
  assert.match(js, /#showToast\(/);

  assert.match(css, /\.configExtensionForm\s*\{[^}]*overflow-y:\s*auto\s*;/s);
  assert.match(css, /\.enterpriseRecentItem\s*\{/);
  assert.match(css, /\.recentCallExpanded\s*\{/);
  assert.match(css, /\.recentDayDivider\s*\{/);
  assert.match(css, /\.contactOverflowMenu\s*\{/);
  assert.match(css, /\.vphoneToast\s*\{/);
  assert.match(css, /\.panelConfirmActions \.panelConfirmOk\s*\{[^}]*background:\s*#dc2626\s*;/s);

  assert.match(indexHtml, /createPhoneWidget/);
  assert.match(indexHtml, /Language:\s*"vi"/);

  assert.match(libReadme, /^# VPhone Library/m);
  assert.match(libReadme, /vphone\.min\.js/);
  assert.match(libReadme, /Vphone\.mount/);
  assert.match(libReadme, /Single-file/);
};
