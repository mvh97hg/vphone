const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function hasBuiltArtifacts() {
  const root = path.join(__dirname, '..');
  const required = [
    path.join(root, 'vphone.min.js'),
    path.join(root, 'dist', 'vphone-sdk.cjs'),
    path.join(root, 'dist', 'vphone-sdk.mjs'),
    path.join(root, 'dist', 'vphone-sdk.d.ts')
  ];
  return required.every((file) => fs.existsSync(file));
}

function ensureBuiltArtifacts() {
  if (hasBuiltArtifacts()) return;
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCmd, ['run', 'build:release'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

ensureBuiltArtifacts();

const tests = [
  ['dialpad css', require('./dialpad-css.test.cjs')],
  ['dialpad js', require('./dialpad-js.test.cjs')],
  ['phone ui js', require('./phone-ui-js.test.cjs')],
  ['phone behavior', require('./phone-behavior.test.cjs')],
  ['vphone runtime', require('./vphone-runtime.test.cjs')],
  ['sdk client', require('./sdk-client.test.cjs')],
  ['electron desktop', require('./electron-desktop.test.cjs')],
  ['embedded language', require('./embedded-language.test.cjs')]
];

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log('PASS', name);
  } catch (error) {
    failed += 1;
    console.error('FAIL', name);
    console.error(error && error.stack ? error.stack : error);
  }
}

if (failed > 0) process.exit(1);
