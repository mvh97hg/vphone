const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('path');

module.exports = function testDialpadJs() {
  const js = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'ui', 'phone-widget.js'), 'utf8');
  assert.match(js, /#syncDialDeleteKeyState\(/);
  assert.match(js, /deleteKey\.classList\.toggle\("hasDigits", hasDigits\)/);
  assert.match(js, /#clampDialValue\(/);
  assert.match(js, /#maxDidLength\(/);
  assert.match(js, /maxlength="\$\{this\.#maxDidLength\(\)\}"/);
};
