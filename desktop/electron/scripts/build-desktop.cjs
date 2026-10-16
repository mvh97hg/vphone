#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");

async function main() {
  const sipSource = path.join(repoRoot, "src", "vendor", "sip-0.21.2.min.js");
  const sipTarget = path.join(desktopRoot, "vendor", "sip-0.21.2.min.js");
  fs.mkdirSync(path.dirname(sipTarget), { recursive: true });
  if (fs.existsSync(sipSource)) fs.copyFileSync(sipSource, sipTarget);
  const legacySip = path.join(desktopRoot, "vendor", "sip-0.20.0.min.js");
  if (fs.existsSync(legacySip)) fs.unlinkSync(legacySip);

  const faSource = path.join(repoRoot, "src", "vendor", "font-awesome");
  const faTarget = path.join(desktopRoot, "renderer", "vendor", "font-awesome");
  if (fs.existsSync(faSource)) fs.cpSync(faSource, faTarget, { recursive: true });

  const cssSource = path.join(repoRoot, "src", "ui", "styles", "phone-ui.css");
  const cssTarget = path.join(desktopRoot, "renderer", "phone-ui.css");
  if (fs.existsSync(cssSource)) fs.copyFileSync(cssSource, cssTarget);

  const mediaSource = path.join(repoRoot, "src", "ui", "media");
  const mediaTarget = path.join(desktopRoot, "renderer", "media");
  if (fs.existsSync(mediaSource)) {
    fs.cpSync(mediaSource, mediaTarget, { recursive: true });
  }

  const langSource = path.join(repoRoot, "src", "assets", "lang");
  const langTarget = path.join(desktopRoot, "assets", "lang");
  const packageJson = JSON.parse(fs.readFileSync(path.join(desktopRoot, "package.json"), "utf8"));
  const buildLanguages = Array.isArray(packageJson?.vphone?.buildLanguages)
    ? packageJson.vphone.buildLanguages.map((v) => String(v || "").trim().toLowerCase()).filter(Boolean)
    : ["en", "vi"];
  fs.mkdirSync(langTarget, { recursive: true });
  // Remove previously copied packs so package only ships en/vi by default.
  for (const entry of fs.readdirSync(langTarget)) {
    if (!entry.toLowerCase().endsWith(".json")) continue;
    const code = path.basename(entry, ".json").toLowerCase();
    if (!buildLanguages.includes(code)) {
      fs.rmSync(path.join(langTarget, entry), { force: true });
    }
  }
  for (const code of buildLanguages) {
    const src = path.join(langSource, `${code}.json`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(langTarget, `${code}.json`));
    }
  }

  const pad2 = (value) => String(value).padStart(2, "0");
  const now = new Date();
  const buildVersion = `${pad2(now.getFullYear() % 100)}.${pad2(now.getMonth() + 1)}.${pad2(now.getDate())}`;
  const buildDefines = {
    __VPHONE_BUILD_VERSION__: JSON.stringify(buildVersion)
  };

  await esbuild.build({
    entryPoints: [path.join(desktopRoot, "src", "main.ts")],
    outfile: path.join(desktopRoot, "main.js"),
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20",
    external: ["electron", "koffi"],
    define: buildDefines,
    logLevel: "info"
  });

  await esbuild.build({
    entryPoints: [path.join(desktopRoot, "src", "preload.ts")],
    outfile: path.join(desktopRoot, "preload.js"),
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20",
    external: ["electron"],
    define: buildDefines,
    logLevel: "info"
  });

  await esbuild.build({
    entryPoints: [path.join(desktopRoot, "renderer", "src", "app.ts")],
    outfile: path.join(desktopRoot, "renderer", "app.js"),
    bundle: true,
    platform: "browser",
    format: "esm",
    target: "es2020",
    define: buildDefines,
    logLevel: "info"
  });
  console.log(`[build-desktop] SIP User-Agent: VPhone/${buildVersion}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
