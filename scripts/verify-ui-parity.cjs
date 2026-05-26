const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const phoneJsPath = path.join(root, "Phone", "phone.js");
const rendererPath = path.join(root, "src", "ui", "dom-renderer.js");
const controlsPath = path.join(root, "src", "ui", "controls.js");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function extractLegacyInitUiHtml(phoneJs) {
  const start = phoneJs.indexOf("function InitUi(){");
  if (start < 0) throw new Error("InitUi not found in Phone/phone.js");
  const end = phoneJs.indexOf("var profilePrepend", start);
  const initSlice = phoneJs.slice(start, end > start ? end : phoneJs.length);

  const htmlChunks = [];
  for (const m of initSlice.matchAll(/leftHTML\s*\+=\s*"([\s\S]*?)"\s*;/g)) {
    htmlChunks.push(m[1]);
  }
  const attrIds = [];
  for (const m of initSlice.matchAll(/\.attr\("id",\s*"([A-Za-z0-9_-]+)"\)/g)) {
    attrIds.push(`id="${m[1]}"`);
  }
  return `${htmlChunks.join("\n")}\n${attrIds.join("\n")}`;
}

function extractRendererTemplate(rendererJs) {
  const start = rendererJs.indexOf("this.root.innerHTML = `");
  if (start < 0) throw new Error("renderer template not found");
  const end = rendererJs.indexOf("`;", start + 1);
  if (end <= start) throw new Error("renderer template end not found");
  return rendererJs.slice(start, end);
}

function idsFrom(htmlLike) {
  const out = new Set();
  for (const m of htmlLike.matchAll(/id\s*=\s*["']?([A-Za-z0-9_-]+)/g)) {
    out.add(m[1]);
  }
  return out;
}

function evaluate() {
  const phoneJs = read(phoneJsPath);
  const rendererJs = read(rendererPath);
  const controlsJs = read(controlsPath);

  const legacyHtml = extractLegacyInitUiHtml(phoneJs);
  const template = extractRendererTemplate(rendererJs);
  const legacyIds = idsFrom(legacyHtml);
  const modernIds = idsFrom(template);

  const missingLegacyIds = [...legacyIds].filter((id) => !modernIds.has(id)).sort();
  const extraModernIds = [...modernIds].filter((id) => !legacyIds.has(id)).sort();

  const hasBtnFreeDialIdBinding = /BtnFreeDial\s*:\s*handlers\.onCall/.test(controlsJs);
  const hasActionCallBinding = /call:\s*handlers\.onCall/.test(controlsJs);

  const result = {
    ok: missingLegacyIds.length === 0 && !(hasBtnFreeDialIdBinding && hasActionCallBinding),
    legacyIdCount: legacyIds.size,
    modernIdCount: modernIds.size,
    missingLegacyIds,
    extraModernIds,
    duplicateCallBindingRisk: hasBtnFreeDialIdBinding && hasActionCallBinding,
    checks: {
      hasBtnFreeDialIdBinding,
      hasActionCallBinding
    }
  };

  return result;
}

module.exports = { evaluate };

if (require.main === module) {
  const result = evaluate();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.ok ? 0 : 1);
}
