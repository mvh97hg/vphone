#!/usr/bin/env node
/**
 * Build single-file Browser Phone library.
 * Output: lib/vphone.min.js + lib/vphone-widget.min.js
 */

const fs = require('fs');
const path = require('path');
const terser = require('terser');
const { buildEmbeddedPayloadModule } = require('./build-embedded-ui');

async function buildSingleFile() {
    const libDir = path.join(__dirname, '../');
    const sourceRuntimePath = path.join(libDir, 'vphone.js');
    const outputMinPath = path.join(libDir, 'vphone.min.js');

    const runtimeCode = fs.readFileSync(sourceRuntimePath, 'utf8');
    const embeddedPayload = await buildEmbeddedPayloadModule();

    const combinedCode = embeddedPayload.moduleCode + '\n\n' + runtimeCode;

    const minified = await terser.minify(combinedCode, {
        compress: true,
        mangle: true,
        format: {
            comments: false
        }
    });

    if (minified.error) {
        throw minified.error;
    }

    fs.writeFileSync(outputMinPath, minified.code, 'utf8');

    const cleanupFiles = [
        path.join(libDir, 'vphone.combined.js'),
        path.join(libDir, 'vphone.min.js.map'),
        path.join(libDir, 'embedded-ui-data.js')
    ];

    cleanupFiles.forEach((file) => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    });

    console.log('Build complete');
    console.log('  Output:', outputMinPath);
    console.log('  Size:', Buffer.byteLength(minified.code, 'utf8'), 'bytes');
    console.log('  Embedded UI HTML size:', embeddedPayload.htmlLength, 'bytes');
    console.log('  Languages embedded:', embeddedPayload.langCount);
}

buildSingleFile().catch((error) => {
    console.error('Build failed:', error && error.message ? error.message : error);
    process.exit(1);
});
