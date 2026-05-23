const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

module.exports = function testEmbeddedLanguage() {
  const buildScript = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'build-embedded-ui.js'), 'utf8');
  assert.doesNotMatch(buildScript, /ALLOWED_LANGUAGE_CODES/);
  assert.match(buildScript, /fs\.readdirSync\(langDir\)/);

  const viJson = fs.readFileSync(path.join(__dirname, '..', '..', 'Phone', 'lang', 'vi.json'), 'utf8');
  const enJson = fs.readFileSync(path.join(__dirname, '..', '..', 'Phone', 'lang', 'en.json'), 'utf8');
  const minPath = path.join(__dirname, '..', 'vphone.min.js');
  assert.equal(fs.existsSync(minPath), true);
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'vphone.min.js')), true);
  const minJs = fs.readFileSync(minPath, 'utf8');
  const vi = JSON.parse(viJson);
  const en = JSON.parse(enJson);

  assert.equal(vi.call_busy, 'Máy bận');
  assert.equal(en.call_busy, 'Busy');

  assert.match(minJs, new RegExp(JSON.stringify(vi.mobile_tab_recents).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(minJs, new RegExp(JSON.stringify(vi.add_contact).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(minJs, new RegExp(JSON.stringify(vi.call_busy).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(minJs, /Vphone/);
  assert.doesNotMatch(minJs, /global\.VPhone/);
};
