const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function hasBuiltArtifacts() {
  return fs.existsSync(path.join(__dirname, '..', 'vphone.min.js'));
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

async function main() {
  const tests = [
    ['dialpad css', require('./dialpad-css.test.cjs')],
    ['dialpad js', require('./dialpad-js.test.cjs')],
    ['phone ui js', require('./phone-ui-js.test.cjs')],
    ['phone behavior', require('./phone-behavior.test.cjs')],
    ['vphone runtime', require('./vphone-runtime.test.cjs')],
    ['electron desktop', require('./electron-desktop.test.cjs')],
    ['embedded language', require('./embedded-language.test.cjs')],
    ['tab leader', require('./tab-leader.test.cjs')]
  ];

  let failed = 0;
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log('PASS', name);
    } catch (error) {
      failed += 1;
      console.error('FAIL', name);
      console.error(error && error.stack ? error.stack : error);
    }
  }

  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
