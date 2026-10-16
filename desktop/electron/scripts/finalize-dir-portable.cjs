#!/usr/bin/env node
/**
 * Promote electron-builder staging into release/ artifacts.
 *
 * Staging:  release/_pack-<ver>/…
 * Portable: release/VPhone-<ver>-win/          (default; keeps existing Setup)
 * NSIS:     release/VPhone-Setup-<ver>.exe    (--nsis; prunes older Setup)
 * Optional: --prune-setup removes all Setup artifacts (not used by dist:portable)
 */
const fs = require("node:fs");
const path = require("node:path");

const desktopRoot = path.resolve(__dirname, "..");
const releaseDir = path.join(desktopRoot, "release");
const packageJson = JSON.parse(
  fs.readFileSync(path.join(desktopRoot, "package.json"), "utf8")
);
const version = String(packageJson.version || "0.0.0");
const portableName = String(
  (packageJson.build && packageJson.build.portable && packageJson.build.portable.artifactName) || ""
).trim();
const destName =
  portableName && !portableName.includes("${")
    ? portableName
    : `VPhone-${version}-win`;

const nsisMode = process.argv.includes("--nsis");
const pruneSetup = process.argv.includes("--prune-setup");

const packDir = path.resolve(
  desktopRoot,
  (packageJson.build &&
    packageJson.build.directories &&
    packageJson.build.directories.output) ||
    "release"
);
const srcUnpacked = path.join(packDir, "win-unpacked");
const destPortable = path.join(releaseDir, destName);

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* busy wait */
  }
}

function rmSafe(target, attempts = 6) {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      fs.rmSync(target, { recursive: true, force: true });
      return true;
    } catch (error) {
      lastError = error;
      sleepSync(120 * i);
    }
  }
  console.warn(
    "[finalize-dir-portable] could not remove",
    target,
    lastError && lastError.message ? lastError.message : lastError
  );
  return false;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function moveDir(src, dest) {
  if (fs.existsSync(dest)) rmSafe(dest);
  let lastError;
  for (let i = 1; i <= 5; i++) {
    try {
      fs.renameSync(src, dest);
      return;
    } catch (error) {
      lastError = error;
      sleepSync(100 * i);
    }
  }
  console.warn(
    "[finalize-dir-portable] rename failed, copying instead:",
    lastError && lastError.message ? lastError.message : lastError
  );
  fs.cpSync(src, dest, { recursive: true, force: true });
  if (!rmSafe(src)) {
    console.warn(
      "[finalize-dir-portable] staging left locked. Close editors under release\\_pack-* then delete:",
      src
    );
  }
}

/** @returns {string[]} promoted setup file names */
function promoteSetupArtifacts() {
  const promoted = [];
  if (!fs.existsSync(packDir)) return promoted;
  ensureDir(releaseDir);
  for (const name of fs.readdirSync(packDir)) {
    const lower = name.toLowerCase();
    if (!lower.startsWith("vphone-setup-")) continue;
    if (!lower.endsWith(".exe") && !lower.endsWith(".exe.blockmap")) continue;
    const from = path.join(packDir, name);
    const to = path.join(releaseDir, name);
    try {
      if (fs.existsSync(to)) rmSafe(to);
      fs.renameSync(from, to);
      console.log(`[finalize-dir-portable] setup -> release\\${name}`);
      promoted.push(name);
    } catch {
      try {
        fs.copyFileSync(from, to);
        rmSafe(from);
        console.log(`[finalize-dir-portable] setup copied -> release\\${name}`);
        promoted.push(name);
      } catch (copyError) {
        console.warn(
          "[finalize-dir-portable] could not promote",
          name,
          copyError.message
        );
      }
    }
  }
  return promoted;
}

function pruneLeftovers() {
  if (!fs.existsSync(releaseDir)) return;
  for (const name of fs.readdirSync(releaseDir)) {
    const lower = name.toLowerCase();
    if (lower.startsWith("vphone-portable-") || lower.startsWith("vphone setup ")) {
      rmSafe(path.join(releaseDir, name));
      console.log("[finalize-dir-portable] removed leftover", name);
    }
    if (lower === "win-unpacked" || lower === "dist") {
      rmSafe(path.join(releaseDir, name));
    }
  }
}

function pruneOtherSetups(keepNames) {
  if (!fs.existsSync(releaseDir)) return;
  const keep = new Set(keepNames.map((n) => n.toLowerCase()));
  for (const name of fs.readdirSync(releaseDir)) {
    const lower = name.toLowerCase();
    if (!lower.startsWith("vphone-setup-")) continue;
    if (keep.has(lower)) continue;
    rmSafe(path.join(releaseDir, name));
    console.log("[finalize-dir-portable] removed old setup", name);
  }
}

function main() {
  ensureDir(releaseDir);

  let promotedPortable = false;
  // NSIS: only the Setup exe is the deliverable. Drop staging win-unpacked
  // instead of also creating a portable VPhone-*-win folder.
  if (nsisMode) {
    if (fs.existsSync(srcUnpacked)) {
      rmSafe(srcUnpacked);
      console.log("[finalize-dir-portable] nsis: discarded staging win-unpacked");
    }
  } else if (fs.existsSync(srcUnpacked)) {
    moveDir(srcUnpacked, destPortable);
    console.log(
      `[finalize-dir-portable] ${path.relative(desktopRoot, srcUnpacked)} -> release\\${destName}`
    );
    console.log(
      `[finalize-dir-portable] portable folder: release\\${destName}\\VPhone.exe`
    );
    promotedPortable = true;
  } else {
    console.warn("[finalize-dir-portable] missing", srcUnpacked);
  }

  const promotedSetups = promoteSetupArtifacts();
  pruneLeftovers();

  if (pruneSetup) {
    for (const name of fs.readdirSync(releaseDir)) {
      const lower = name.toLowerCase();
      if (lower.startsWith("vphone-setup-")) {
        rmSafe(path.join(releaseDir, name));
        console.log("[finalize-dir-portable] removed leftover", name);
      }
    }
  } else if (nsisMode && promotedSetups.length) {
    pruneOtherSetups(promotedSetups);
    const setupExe = promotedSetups.find((n) => n.toLowerCase().endsWith(".exe"));
    if (setupExe) {
      console.log(`[finalize-dir-portable] nsis installer: release\\${setupExe}`);
    }
  }

  if (fs.existsSync(packDir)) {
    try {
      rmSafe(packDir);
    } catch {
      // ignore
    }
  }

  const ok = nsisMode ? promotedSetups.length > 0 : promotedPortable;
  if (!ok) {
    process.exitCode = 1;
  }
}

main();
