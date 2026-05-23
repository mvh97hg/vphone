#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
}

const desktopRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(desktopRoot, '..', '..');
const libDir = path.join(repoRoot, 'lib');
const packageJsonPath = path.join(desktopRoot, 'package.json');

const packageJson = readJson(packageJsonPath) || {};
const selectedLangs = Array.isArray(packageJson.vphone && packageJson.vphone.buildLanguages)
  ? packageJson.vphone.buildLanguages.map((v) => String(v || '').trim()).filter(Boolean)
  : [];
const langs = selectedLangs.length > 0 ? selectedLangs.join(',') : 'en,vi';

console.log('[build-widget] Languages:', langs);

function runBuild(cmd, args) {
  return spawnSync(cmd, args, {
    cwd: libDir,
    stdio: 'inherit',
    env: Object.assign({}, process.env, { VPHONE_LANGS: langs })
  });
}

const nodeBin = process.execPath;
const buildScript = path.join(libDir, 'scripts', 'build-single-file.js');
const result = runBuild(nodeBin, [buildScript]);
if (result.status !== 0) process.exit(result.status || 1);
