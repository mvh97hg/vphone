#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
}

function mapLangToPak(lang) {
  const normalized = String(lang || '').trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === 'en') return 'en-US.pak';
  if (normalized === 'vi') return 'vi.pak';
  if (normalized === 'pt-br') return 'pt-BR.pak';
  if (normalized === 'zh-hans') return 'zh-CN.pak';
  if (normalized === 'zh') return 'zh-TW.pak';
  return `${lang}.pak`;
}

module.exports = async function pruneLocalesAfterPack(context) {
  const appOutDir = context && context.appOutDir ? context.appOutDir : '';
  if (!appOutDir) return;

  const localesDir = path.join(appOutDir, 'locales');
  if (!fs.existsSync(localesDir)) return;

  const desktopRoot = path.resolve(__dirname, '..');
  const packageJsonPath = path.join(desktopRoot, 'package.json');
  const packageJson = readJson(packageJsonPath) || {};
  const selectedLangs = Array.isArray(packageJson.vphone && packageJson.vphone.buildLanguages)
    ? packageJson.vphone.buildLanguages.map((v) => String(v || '').trim()).filter(Boolean)
    : ['en', 'vi'];

  const keep = new Set(
    selectedLangs
      .map(mapLangToPak)
      .filter(Boolean)
  );

  const files = fs.readdirSync(localesDir);
  let removed = 0;
  for (const fileName of files) {
    if (!fileName.toLowerCase().endsWith('.pak')) continue;
    if (keep.has(fileName)) continue;
    fs.rmSync(path.join(localesDir, fileName), { force: true });
    removed += 1;
  }

  console.log('[prune-locales] keep:', Array.from(keep).join(', '));
  console.log('[prune-locales] removed:', removed);
};
