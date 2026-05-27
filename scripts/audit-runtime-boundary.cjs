const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function evaluate() {
  const phoneIndexPath = path.join(root, "Phone", "index.html");
  const srcIndexPath = path.join(root, "src", "ui", "index.html");
  const serveScriptPath = path.join(root, "scripts", "serve-phone-env.cjs");

  const phoneIndex = fs.existsSync(phoneIndexPath) ? read("Phone/index.html") : "";
  const srcIndex = fs.existsSync(srcIndexPath) ? read("src/ui/index.html") : "";
  const serveScript = fs.existsSync(serveScriptPath) ? read("scripts/serve-phone-env.cjs") : "";

  const hasPhoneIndexScriptTag = /<script\b/i.test(phoneIndex);
  const hasPhoneIndexRefresh = /http-equiv="refresh"/i.test(phoneIndex) && phoneIndex.includes("/src/ui/index.html");
  const srcIndexUsesModularEntry = srcIndex.includes('import { createPhoneWidget } from "./phone-widget.js"');
  const srcIndexDoesNotLoadLegacyPhoneJs = !/<script[^>]+src=["']phone\.js["']/i.test(srcIndex);
  const srcIndexLoadsSingleCss = srcIndex.includes("./styles/phone-ui.css") && !srcIndex.includes('href="phone.css"');
  const serverDefaultsToSrc = serveScript.includes('reqPath === "/" ? "/src/ui/index.html" : reqPath');
  const serverInjectsOnlySrc = /if \(filePath\.endsWith\(path\.join\("src", "ui", "index\.html"\)\)\)/.test(serveScript);
  const targetFiles = [
    "src/core/phone-core.js",
    "src/sdk/phone-sdk.js",
    "src/ui/phone-widget.js",
    "src/ui/index.html",
    "src/ui/styles/phone-ui.css"
  ];
  const allowedAssetPatterns = [
    /^src\/assets\/lang\/[a-z0-9-]+\.json$/i
  ];
  const missingTargetFiles = targetFiles.filter((rel) => !fs.existsSync(path.join(root, rel)));
  const srcFiles = [];
  function collectSrcFiles(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectSrcFiles(full);
      } else {
        srcFiles.push(path.relative(root, full).replace(/\\/g, "/"));
      }
    }
  }
  collectSrcFiles(path.join(root, "src"));
  const expectedSrcFiles = targetFiles.map((rel) => rel.replace(/\\/g, "/")).sort();
  const unexpectedSrcFiles = srcFiles
    .filter((rel) => !expectedSrcFiles.includes(rel))
    .filter((rel) => !allowedAssetPatterns.some((pattern) => pattern.test(rel)))
    .sort();
  const removedRuntimeFiles = [
    "src/core/sip-core.js",
    "src/core/webrtc-core.js",
    "src/core/media-manager.js",
    "src/core/peer-manager.js",
    "src/core/signaling.js",
    "src/core/call-state.js",
    "src/core/event-emitter.js",
    "src/sdk/sdk.js",
    "src/adapters/legacy-phone-adapter.js",
    "src/ui/create-modular-phone.js",
    "src/ui/phone-ui.js",
    "src/ui/dom-renderer.js",
    "src/ui/controls.js",
    "src/ui/notifications.js",
    "src/ui/phone.js",
    "src/ui/phone.css",
    "src/ui/sw.js",
    "src/ui/manifest.json",
    "src/ui/icons",
    "src/ui/lang",
    "src/ui/media"
  ];
  const lingeringRuntimeFiles = removedRuntimeFiles.filter((rel) => fs.existsSync(path.join(root, rel)));

  return {
    ok:
      !hasPhoneIndexScriptTag &&
      hasPhoneIndexRefresh &&
      srcIndexUsesModularEntry &&
      srcIndexDoesNotLoadLegacyPhoneJs &&
      srcIndexLoadsSingleCss &&
      serverDefaultsToSrc &&
      serverInjectsOnlySrc &&
      missingTargetFiles.length === 0 &&
      lingeringRuntimeFiles.length === 0 &&
      unexpectedSrcFiles.length === 0,
    checks: {
      hasPhoneIndexScriptTag,
      hasPhoneIndexRefresh,
      srcIndexUsesModularEntry,
      srcIndexDoesNotLoadLegacyPhoneJs,
      srcIndexLoadsSingleCss,
      serverDefaultsToSrc,
      serverInjectsOnlySrc,
      missingTargetFiles,
      lingeringRuntimeFiles,
      unexpectedSrcFiles
    }
  };
}

module.exports = { evaluate };

if (require.main === module) {
  const result = evaluate();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.ok ? 0 : 1);
}
