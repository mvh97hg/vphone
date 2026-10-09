#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const runtimeDir = path.join(desktopRoot, "renderer", "runtime");

const sources = [
  ["src/core", "core"],
  ["src/sdk", "sdk"],
  ["src/ui", "ui"],
  ["src/assets", "assets"],
];

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing runtime source: ${source}`);
  }
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const child of fs.readdirSync(source)) {
      copyDirectory(path.join(source, child), path.join(target, child));
    }
    return;
  }
  if (!stat.isFile()) return;

  const normalized = source.replace(/\\/g, "/");
  if (normalized.includes("/node_modules/") || normalized.includes("/.tmp/")) return;

  const next = fs.readFileSync(source);
  if (fs.existsSync(target)) {
    const current = fs.readFileSync(target);
    if (Buffer.compare(current, next) === 0) return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, next);
}

function main() {
  fs.mkdirSync(runtimeDir, { recursive: true });

  for (const [sourceRel, targetRel] of sources) {
    copyDirectory(path.join(repoRoot, sourceRel), path.join(runtimeDir, targetRel));
  }

  const sourceCss = path.join(repoRoot, "src", "ui", "styles", "phone-ui.css");
  const rendererCss = path.join(desktopRoot, "renderer", "phone-ui.css");
  fs.copyFileSync(sourceCss, rendererCss);

  console.log("[build-widget] Copied src runtime to", runtimeDir);
  console.log("[build-widget] Synced renderer phone-ui.css");
}

main();
