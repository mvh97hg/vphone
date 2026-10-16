#!/usr/bin/env node
/**
 * Build Embedded UI payload from the modular src/ui widget (same UI as Electron).
 * Produces JavaScript that exports:
 * - __VPhoneEmbeddedUIHtml (raw HTML)
 * - __VPhoneEmbeddedUI (data URI fallback)
 */

const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');
const terser = require('terser');

const repoRoot = path.join(__dirname, '../..');
const libDir = path.join(__dirname, '..');
const outputFile = path.join(libDir, 'embedded-ui-data.js');
const srcUiDir = path.join(repoRoot, 'src', 'ui');
const srcAssetsDir = path.join(repoRoot, 'src', 'assets');
const srcVendorDir = path.join(repoRoot, 'src', 'vendor');

function resolveEsbuild() {
  const candidates = [
    path.join(repoRoot, 'desktop', 'electron', 'node_modules', 'esbuild'),
    path.join(libDir, 'node_modules', 'esbuild'),
    path.join(repoRoot, 'node_modules', 'esbuild')
  ];
  for (const candidate of candidates) {
    try {
      return createRequire(path.join(candidate, 'package.json'))('esbuild');
    } catch {
      // try next
    }
  }
  try {
    return require('esbuild');
  } catch {
    throw new Error('esbuild is required to build the embedded UI (install in desktop/electron or lib)');
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readBinary(filePath) {
  return fs.readFileSync(filePath);
}

function bufferToDataUri(buffer, contentType) {
  return 'data:' + contentType + ';base64,' + buffer.toString('base64');
}

function escapeClosingScript(content) {
  return String(content).replace(/<\/script/gi, '<\\/script');
}

async function minifyJavaScript(code, label) {
  try {
    const result = await terser.minify(code, {
      compress: true,
      mangle: true,
      format: { comments: false }
    });
    if (result && result.code) return result.code;
  } catch (e) {
    console.warn('Warning: could not minify JS for', label, '-', e.message);
  }
  return code;
}

function loadLanguagePacks() {
  const langDir = path.join(srcAssetsDir, 'lang');
  const packs = {};
  const files = fs.readdirSync(langDir);
  const selected = String(process.env.VPHONE_LANGS || 'en,vi')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  const useFilter = selected.length > 0;

  files.forEach((file) => {
    if (!file.endsWith('.json')) return;
    const langCode = file.replace('.json', '');
    if (useFilter && !selected.includes(langCode.toLowerCase())) return;
    packs[langCode] = JSON.parse(readText(path.join(langDir, file)));
  });

  return packs;
}

function buildFontAwesomeCss() {
  const cssPath = path.join(srcVendorDir, 'font-awesome', 'css', 'font-awesome.min.css');
  const fontPath = path.join(srcVendorDir, 'font-awesome', 'fonts', 'fontawesome-webfont.woff2');
  let css = readText(cssPath);
  if (fs.existsSync(fontPath)) {
    const dataUri = bufferToDataUri(readBinary(fontPath), 'font/woff2');
    css = css.replace(
      /url\(\s*['"]?[^)'"]*fontawesome-webfont\.woff2[^)'"]*['"]?\s*\)/gi,
      "url('" + dataUri + "')"
    );
  }
  return css;
}

function formatBuildVersion(date = new Date()) {
  const pad2 = (value) => String(value).padStart(2, '0');
  return `${pad2(date.getFullYear() % 100)}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
}

async function bundleEmbedBoot() {
  const esbuild = resolveEsbuild();
  const entry = path.join(srcUiDir, 'embed-boot.js');
  const buildVersion = formatBuildVersion();
  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    platform: 'browser',
    format: 'iife',
    target: 'es2020',
    logLevel: 'silent',
    define: {
      __VPHONE_BUILD_VERSION__: JSON.stringify(buildVersion)
    }
  });
  const code = result.outputFiles[0].text;
  return minifyJavaScript(code, 'src/ui/embed-boot.js');
}

async function buildEmbeddedHtml() {
  const phoneCss = readText(path.join(srcUiDir, 'styles', 'phone-ui.css'));
  const faCss = buildFontAwesomeCss();
  const sipJs = readText(path.join(srcVendorDir, 'sip-0.21.2.min.js'));
  const bootJs = await bundleEmbedBoot();
  const langPacks = loadLanguagePacks();

  const ringtonePath = path.join(srcUiDir, 'media', 'Ringtone.mp3');
  let ringtoneInject = 'window.__VPhoneRingtoneUrl = window.__VPhoneRingtoneUrl || "";';
  if (fs.existsSync(ringtonePath)) {
    const ringtoneDataUri = bufferToDataUri(readBinary(ringtonePath), 'audio/mpeg');
    ringtoneInject = 'window.__VPhoneRingtoneUrl = ' + JSON.stringify(ringtoneDataUri) + ';';
  }

  const langInject = [
    'window.__VPhoneLangPacks = ' + JSON.stringify(langPacks) + ';',
    'window.__VphoneLangPacks = window.__VPhoneLangPacks;',
    ringtoneInject
  ].join('\n');

  const html = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">',
    '<title>VPhone</title>',
    '<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">',
    '<style type="text/css">',
    faCss,
    '</style>',
    '<style type="text/css">',
    phoneCss,
    '</style>',
    '<script type="text/javascript">',
    escapeClosingScript(sipJs),
    '</script>',
    '<script type="text/javascript">',
    escapeClosingScript(langInject),
    '</script>',
    '</head>',
    '<body class="phoneEmbeddedApp">',
    '<div id="Phone" data-phone-shell="embedded"></div>',
    '<script type="text/javascript">',
    escapeClosingScript(bootJs),
    '</script>',
    '</body>',
    '</html>'
  ].join('\n');

  return {
    html,
    langCount: Object.keys(langPacks).length,
    languages: Object.keys(langPacks)
  };
}

async function buildEmbeddedPayloadModule() {
  const { html, langCount, languages } = await buildEmbeddedHtml();

  const moduleCode = [
    '/**',
    ' * ============================================================================',
    ' *                    EMBEDDED UI DATA (Auto-generated)',
    ' * ============================================================================',
    ' * DO NOT EDIT MANUALLY',
    ' * ============================================================================',
    ' */',
    '',
    '(function(global) {',
    "    'use strict';",
    '',
    '    var EMBEDDED_PHONE_UI_HTML = ' + JSON.stringify(html) + ';',
    '',
    '    if (typeof module === "object" && typeof module.exports === "object") {',
    '        module.exports = {',
    '            html: EMBEDDED_PHONE_UI_HTML,',
    '            dataUri: null',
    '        };',
    '    } else {',
    '        global.__VPhoneEmbeddedUIHtml = EMBEDDED_PHONE_UI_HTML;',
    '        global.__VPhoneEmbeddedUI = null;',
    '    }',
    '})(typeof window !== "undefined" ? window : global);',
    ''
  ].join('\n');

  return {
    moduleCode,
    htmlLength: html.length,
    dataUriLength: 0,
    langCount,
    languages
  };
}

async function writePayloadToFile() {
  const payload = await buildEmbeddedPayloadModule();
  fs.writeFileSync(outputFile, payload.moduleCode, 'utf8');

  console.log('Embedded UI payload generated');
  console.log('  Output:', outputFile);
  console.log('  HTML size:', payload.htmlLength, 'bytes');
  console.log('  Data URI size:', payload.dataUriLength, 'bytes');
  console.log('  Languages:', payload.langCount, '(' + payload.languages.join(', ') + ')');
}

if (require.main === module) {
  writePayloadToFile().catch((error) => {
    console.error('Build embedded payload failed:', error && error.message ? error.message : error);
    process.exit(1);
  });
}

module.exports = {
  buildEmbeddedPayloadModule,
  writePayloadToFile
};
