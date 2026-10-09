const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

module.exports = function testDialpadCss() {
  const css = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'ui', 'styles', 'phone-ui.css'), 'utf8');
  assert.doesNotMatch(css, /#leftContentTable\s+tr:first-child/);
  assert.match(css, /#leftContentTable\s*>\s*tbody\s*>\s*tr:first-child/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s*\{[^}]*--dial-button-size:\s*48px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s*\{[^}]*--dial-action-size:\s*50px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s*\{[^}]*--dial-frame-width:\s*100%\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialScreenMobile\s*\{[^}]*gap:\s*2px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialInputRow\s*\{[^}]*width:\s*100%\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialInputRow\s*\{[^}]*min-height:\s*40px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialInputRow\s*\{[^}]*grid-template-columns:\s*36px minmax\(0, 1fr\) 36px\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialTextInput\s*\{[^}]*width:\s*100% !important\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+\.dialTextInput\s*\{[^}]*height:\s*40px !important\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+#dialDeleteKey\s*\{[^}]*visibility:\s*hidden\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+#dialDeleteKey\.hasDigits\s*\{[^}]*visibility:\s*visible\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+#mobileTopBar\s*\{[^}]*background:\s*#ffffff\s*;/s);
  assert.match(css, /\.pageContainer\.phoneFrame250\s+#bottomTabBar\s*\{[^}]*background:\s*#ffffff\s*;/s);
  assert.match(css, /\.dialTextInput\s*\{[^}]*background:\s*#ffffff\s*;/s);
};
