#!/usr/bin/env node
/**
 * electron-builder defaults to build/icon.ico (+ build/icon.icns on mac).
 * Keep icons/ as the source of truth and sync into build/ before packaging so
 * the Windows .exe / installer do not fall back to the stock Electron icon.
 */
const fs = require("node:fs");
const path = require("node:path");

const desktopRoot = path.resolve(__dirname, "..");
const buildDir = path.join(desktopRoot, "build");

const copies = [
  ["icons/win/icon.ico", "icon.ico"],
  ["icons/mac/icon.icns", "icon.icns"],
  ["icons/png/256x256.png", "icon.png"],
  ["icons/png/512x512.png", "icon@2x.png"],
  // NSIS include lives under buildResources (build/).
  ["scripts/installer.nsh", "installer.nsh"]
];

function main() {
  fs.mkdirSync(buildDir, { recursive: true });
  for (const [fromRel, toName] of copies) {
    const from = path.join(desktopRoot, fromRel);
    const to = path.join(buildDir, toName);
    if (!fs.existsSync(from)) {
      console.warn(`[ensure-build-icons] missing source: ${fromRel}`);
      continue;
    }
    fs.copyFileSync(from, to);
    console.log(`[ensure-build-icons] ${fromRel} -> build/${toName}`);
  }
}

main();
