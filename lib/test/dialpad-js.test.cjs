const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

module.exports = function testDialpadJs() {
  const js = fs.readFileSync(path.join(__dirname, '..', '..', 'Phone', 'phone.js'), 'utf8');
  assert.doesNotMatch(js, /#dialText"\)\.css\("width","138px"\)/);
  assert.doesNotMatch(js, /#dialText"\)\.css\("width","170px"\)/);
  assert.doesNotMatch(js, /#dialDeleteKey"\)\.show\(\)/);
  assert.doesNotMatch(js, /#dialDeleteKey"\)\.hide\(\)/);
  assert.match(js, /function\s+SyncDialDeleteKey\s*\(\)\s*\{/);
  assert.match(js, /#dialDeleteKey"\)\.toggleClass\("hasDigits",\s*hasDigits\)/);
  assert.match(js, /value\.length\s*>\s*18/);
  assert.match(js, /dialText\.css\("font-size",\s*fontSize\)/);
};
