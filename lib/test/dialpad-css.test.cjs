const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

module.exports = function testDialpadCss() {
  const css = fs.readFileSync(path.join(__dirname, '..', '..', 'Phone', 'phone.css'), 'utf8');
  assert.doesNotMatch(css, /#leftContentTable\s+tr:first-child/);
  assert.match(css, /#leftContentTable\s*>\s*tbody\s*>\s*tr:first-child/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s*\{[^}]*--dial-button-size:\s*38px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s*\{[^}]*--dial-action-size:\s*42px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s*\{[^}]*--dial-frame-width:\s*238px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialScreenMobile\s*\{[^}]*gap:\s*3px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialScreenMobile\s*\{[^}]*margin-top:\s*auto\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialScreenMobile\s*\{[^}]*margin-bottom:\s*5px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialInputRow\s*\{[^}]*width:\s*var\(--dial-frame-width\)\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialInputRow\s*\{[^}]*min-height:\s*36px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialInputRow\s*\{[^}]*grid-template-columns:\s*30px minmax\(0, 1fr\) 30px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialTextInput\s*\{[^}]*width:\s*100% !important\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialTextInput\s*\{[^}]*height:\s*34px !important\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+#dialDeleteKey\s*\{[^}]*visibility:\s*hidden\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+#dialDeleteKey\.hasDigits\s*\{[^}]*visibility:\s*visible\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+#actionArea\.dialpadMode\s*\{[^}]*justify-content:\s*flex-end\s*;/s);
  assert.match(css, /\.dialTextInput\s*\{[^}]*background:\s*#ffffff\s*;/s);
  assert.match(css, /\.dialTextInput\s*\{[^}]*border:\s*1px solid var\(--border\)\s*;/s);
};
