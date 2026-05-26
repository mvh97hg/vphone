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
  const srcIndexUsesModularEntry = srcIndex.includes('import { createModularPhone } from "./create-modular-phone.js"');
  const serverDefaultsToSrc = serveScript.includes('reqPath === "/" ? "/src/ui/index.html" : reqPath');
  const serverInjectsOnlySrc = /if \(filePath\.endsWith\(path\.join\("src", "ui", "index\.html"\)\)\)/.test(serveScript);

  return {
    ok:
      !hasPhoneIndexScriptTag &&
      hasPhoneIndexRefresh &&
      srcIndexUsesModularEntry &&
      serverDefaultsToSrc &&
      serverInjectsOnlySrc,
    checks: {
      hasPhoneIndexScriptTag,
      hasPhoneIndexRefresh,
      srcIndexUsesModularEntry,
      serverDefaultsToSrc,
      serverInjectsOnlySrc
    }
  };
}

module.exports = { evaluate };

if (require.main === module) {
  const result = evaluate();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.ok ? 0 : 1);
}
