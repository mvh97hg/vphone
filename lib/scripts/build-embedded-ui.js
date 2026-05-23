#!/usr/bin/env node
/**
 * Build Embedded UI payload module.
 * Produces JavaScript that exports:
 * - __VPhoneEmbeddedUIHtml (raw HTML)
 * - __VPhoneEmbeddedUI (data URI fallback)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const terser = require('terser');

const phoneDir = path.join(__dirname, '../../Phone');
const outputDir = path.join(__dirname, '../');
const outputFile = path.join(outputDir, 'embedded-ui-data.js');

const networkCache = new Map();
const EMBED_MEDIA_FILES = [
    'Ringtone.mp3',
    'Busy.mp3',
    'CallWaiting.mp3',
    'Congestion.mp3',
    'EarlyMedia.mp3'
];

function readText(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

function readBinary(filePath) {
    return fs.readFileSync(filePath);
}

function guessContentType(filePathOrUrl) {
    const lower = String(filePathOrUrl || '').toLowerCase();
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.woff2')) return 'font/woff2';
    if (lower.endsWith('.woff')) return 'font/woff';
    if (lower.endsWith('.ttf')) return 'font/ttf';
    if (lower.endsWith('.otf')) return 'font/otf';
    if (lower.endsWith('.mp3')) return 'audio/mpeg';
    if (lower.endsWith('.css')) return 'text/css; charset=utf-8';
    if (lower.endsWith('.js')) return 'application/javascript; charset=utf-8';
    if (lower.endsWith('.json')) return 'application/json; charset=utf-8';
    return 'application/octet-stream';
}

function escapeClosingScript(content) {
    return String(content).replace(/<\/script/gi, '<\\/script');
}

function bufferToDataUri(buffer, contentType) {
    return 'data:' + contentType + ';base64,' + buffer.toString('base64');
}

async function minifyJavaScript(code, label) {
    try {
        const result = await terser.minify(code, {
            compress: {
                pure_funcs: ['console.log']
            },
            mangle: true,
            format: {
                comments: false
            }
        });
        if (result && result.code) {
            return result.code;
        }
    } catch (e) {
        console.warn('Warning: could not minify JS for', label, '-', e.message);
    }
    return code;
}

function fetchUrlBuffer(url, redirectCount) {
    const redirects = redirectCount || 0;

    if (networkCache.has(url)) {
        return Promise.resolve(networkCache.get(url));
    }

    return new Promise((resolve, reject) => {
        const client = url.startsWith('https://') ? https : http;

        const req = client.get(url, (res) => {
            const status = res.statusCode || 0;

            if (status >= 300 && status < 400 && res.headers.location) {
                if (redirects >= 5) {
                    reject(new Error('Too many redirects for ' + url));
                    return;
                }
                const redirected = new URL(res.headers.location, url).toString();
                fetchUrlBuffer(redirected, redirects + 1).then(resolve).catch(reject);
                return;
            }

            if (status < 200 || status >= 300) {
                reject(new Error('HTTP ' + status + ' for ' + url));
                return;
            }

            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const result = {
                    buffer,
                    contentType: res.headers['content-type'] || guessContentType(url),
                    finalUrl: url
                };
                networkCache.set(url, result);
                resolve(result);
            });
        });

        req.on('error', reject);
    });
}

function loadLanguagePacks() {
    const langDir = path.join(phoneDir, 'lang');
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
        const content = readText(path.join(langDir, file));
        packs[langCode] = JSON.parse(content);
    });

    return packs;
}

function loadEmbeddedMediaMap() {
    const mediaDir = path.join(phoneDir, 'media');
    const media = {};

    EMBED_MEDIA_FILES.forEach((fileName) => {
        const filePath = path.join(mediaDir, fileName);
        if (!fs.existsSync(filePath)) {
            console.warn('Warning: media file not found for embedding:', fileName);
            return;
        }

        const contentType = guessContentType(fileName);
        media[fileName] = bufferToDataUri(readBinary(filePath), contentType);
    });

    return media;
}

async function inlineCssUrlAssets(css, cssSourceUrl) {
    const urlRegex = /url\(\s*(['"]?)([^'"\)]+)\1\s*\)/gi;
    let result = css;
    let match;

    while ((match = urlRegex.exec(css)) !== null) {
        let rawUrl = (match[2] || '').trim();
        rawUrl = rawUrl.replace(/^\\?"|"\\?$/g, '');
        rawUrl = rawUrl.replace(/^\\?'|'\\?$/g, '');
        rawUrl = rawUrl.replace(/^"|"$/g, '');
        rawUrl = rawUrl.replace(/^'|'$/g, '');
        rawUrl = rawUrl.replace(/^\s+|\s+$/g, '');
        if (!rawUrl || rawUrl.startsWith('data:') || rawUrl.startsWith('#')) {
            continue;
        }

        // jQuery UI ships theme query hints like url(%22images/...%22) in comments.
        // They are not runtime assets and should be ignored.
        if (rawUrl.startsWith('%22') || rawUrl.endsWith('%22')) {
            continue;
        }

        let assetUrl;
        try {
            assetUrl = new URL(rawUrl, cssSourceUrl).toString();
        } catch (e) {
            continue;
        }

        try {
            const fetched = await fetchUrlBuffer(assetUrl);
            const dataUri = bufferToDataUri(fetched.buffer, fetched.contentType || guessContentType(assetUrl));
            result = result.split(rawUrl).join(dataUri);
        } catch (e) {
            console.warn('Warning: could not inline CSS asset', assetUrl, '-', e.message);
        }
    }

    return result;
}

async function inlineExternalStyles(html) {
    const linkRegex = /<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    let result = html;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
        const fullTag = match[0];
        const href = (match[1] || '').trim();

        if (!/^https?:\/\//i.test(href)) {
            continue;
        }

        try {
            const fetched = await fetchUrlBuffer(href);
            let css = fetched.buffer.toString('utf8');
            css = await inlineCssUrlAssets(css, href);
            const replacement = '<style type="text/css">\n' + css + '\n</style>';
            result = result.split(fullTag).join(replacement);
        } catch (e) {
            console.warn('Warning: could not inline stylesheet', href, '-', e.message);
        }
    }

    return result;
}

async function inlineExternalScripts(html) {
    const scriptRegex = /<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi;
    let result = html;
    let match;

    while ((match = scriptRegex.exec(html)) !== null) {
        const fullTag = match[0];
        const src = (match[2] || '').trim();

        if (!/^https?:\/\//i.test(src)) {
            continue;
        }

        try {
            const fetched = await fetchUrlBuffer(src);
            const js = escapeClosingScript(fetched.buffer.toString('utf8'));
            const replacement = '<script type="text/javascript">\n' + js + '\n</script>';
            result = result.split(fullTag).join(replacement);
        } catch (e) {
            console.warn('Warning: could not inline script', src, '-', e.message);
        }
    }

    return result;
}

function embedLocalHeadAssets(html) {
    const manifestText = readText(path.join(phoneDir, 'manifest.json'));
    const manifestDataUri = 'data:application/manifest+json;base64,' + Buffer.from(manifestText, 'utf8').toString('base64');

    const iconBuffer = readBinary(path.join(phoneDir, 'icons', 'phone.svg'));
    const iconDataUri = bufferToDataUri(iconBuffer, 'image/svg+xml');

    let result = html;
    result = result.replace(/href=["']icons\/phone\.svg["']/gi, 'href="' + iconDataUri + '"');
    result = result.replace(/href=["']manifest\.json["']/gi, 'href="' + manifestDataUri + '"');
    return result;
}

function injectLocalMomentCoreAndVi(html) {
    const momentCorePath = path.join(__dirname, '../node_modules/moment/min/moment.min.js');
    const momentViPath = path.join(__dirname, '../node_modules/moment/locale/vi.js');

    if (!fs.existsSync(momentCorePath) || !fs.existsSync(momentViPath)) {
        console.warn('Warning: local moment files not found, keeping original moment script include');
        return html;
    }

    const momentCore = readText(momentCorePath);
    const momentVi = readText(momentViPath);
    const combinedMoment = escapeClosingScript(momentCore + '\n' + momentVi);

    const inlineMomentScript = [
        '<script type="text/javascript">',
        combinedMoment,
        '</script>'
    ].join('\n');

    // Replace the original Moment script include at its original location.
    let replaced = false;
    let result = html.replace(
        /<script[^>]*src\s*=\s*["']https:\/\/dtd6jl0d42sve\.cloudfront\.net\/lib\/Moment\/[^"']+["'][^>]*><\/script>/i,
        function() {
            replaced = true;
            return inlineMomentScript;
        }
    );

    // Remove any remaining remote Moment script tags if present.
    result = result.replace(
        /\s*<script[^>]*src\s*=\s*["']https:\/\/dtd6jl0d42sve\.cloudfront\.net\/lib\/Moment\/[^"']+["'][^>]*><\/script>\s*/gi,
        '\n'
    );

    // Fallback: if no matching Moment tag was found, insert before closing head.
    if (!replaced) {
        result = result.replace(/\s*<\/head>/i, '\n' + inlineMomentScript + '\n</head>');
    }

    return result;
}

async function buildEmbeddedHtml() {
    const indexHtml = readText(path.join(phoneDir, 'index.html'));
    const phoneCss = readText(path.join(phoneDir, 'phone.css'));
    const phoneJs = readText(path.join(phoneDir, 'phone.js'));
        const phoneJsNoAudioLogs = phoneJs.replace(/\s*console\.log\("Audio:",[^\r\n]*\)\s*;?/g, '');
    const phoneJsMin = await minifyJavaScript(phoneJsNoAudioLogs, 'Phone/phone.js');
    const manifestJson = readText(path.join(phoneDir, 'manifest.json'));
    const langPacks = loadLanguagePacks();
    const mediaMap = loadEmbeddedMediaMap();

    let html = indexHtml;

    // Reduce payload size: use system fonts (keep icon font, only trim Roboto webfont).
    html = html.replace(/\s*<link[^>]*font_roboto\/roboto\.css[^>]*>\s*/gi, '\n');

    // Reduce payload size: inline moment core + vi locale from local package.
    html = injectLocalMomentCoreAndVi(html);

    const langInject = [
        '<!-- Embedded Language Packs -->',
        '<script type="text/javascript">',
        'window.__VPhoneLangPacks = ' + JSON.stringify(langPacks) + ';',
        'window.__VPhoneEmbeddedMedia = ' + JSON.stringify(mediaMap) + ';',
        'window.__VPhoneManifest = ' + manifestJson + ';',
        '</script>'
    ].join('\n');

    html = html.replace(/\s*<\/head>/i, '\n' + langInject + '\n</head>');

    const inlineCssTag = '<style type="text/css">\n' + phoneCss + '\n</style>';
    html = html.replace(
        /<link\s+rel="stylesheet"\s+type="text\/css"\s+href="phone\.css"\/?\s*>/i,
        inlineCssTag
    );

    const inlinePhoneJs = [
        '<script type="text/javascript">',
        escapeClosingScript(phoneJsMin),
        'console.log("Browser Phone UI initialized in embedded mode");',
        '</script>'
    ].join('\n');

    // Keep original load order: inject inline phone.js exactly where phone.js tag was.
    html = html.replace(
        /<script[^>]*src\s*=\s*["']?phone\.js["']?[^>]*><\/script>/gi,
        inlinePhoneJs
    );

    html = html.replace(/if\s*\(\s*'serviceWorker'\s+in\s+navigator\s*\)\s*\{/g, 'if (false) {');
    html = html.replace(/console\.warn\(["']Cannot make use of ServiceWorker["']\);?/g, '');

    html = embedLocalHeadAssets(html);
    html = await inlineExternalStyles(html);
    html = await inlineExternalScripts(html);

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
