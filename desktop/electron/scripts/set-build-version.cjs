#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const packageJsonPath = path.join(__dirname, "..", "package.json");

function pad2(value) {
  return String(value).padStart(2, "0");
}

function buildVersion(now) {
  const year = pad2(now.getFullYear() % 100);
  const month = pad2(now.getMonth() + 1);
  const day = pad2(now.getDate());
  const hour = pad2(now.getHours());
  const minute = pad2(now.getMinutes());
  return `${year}.${month}.${day}.${hour}${minute}`;
}

function buildSemver(now) {
  const year = now.getFullYear() % 100;
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${year}.${month}.${day}`;
}

function main() {
  const pkgRaw = fs.readFileSync(packageJsonPath, "utf8");
  const pkg = JSON.parse(pkgRaw);
  const now = new Date();
  const displayVersion = buildVersion(now);
  const semverVersion = buildSemver(now);

  pkg.version = semverVersion;
  pkg.build = pkg.build || {};
  // Unique staging under release/ per build (no separate dist/).
  // finalize renames win-unpacked -> release/VPhone-<ver>-win.
  pkg.build.directories = pkg.build.directories || {};
  pkg.build.directories.output = `release/_pack-${displayVersion}`;
  pkg.build.directories.buildResources =
    pkg.build.directories.buildResources || "build";
  pkg.build.artifactName = `VPhone-${displayVersion}.\${ext}`;
  pkg.build.nsis = pkg.build.nsis || {};
  pkg.build.nsis.artifactName = `VPhone-Setup-${displayVersion}.\${ext}`;
  pkg.build.portable = pkg.build.portable || {};
  pkg.build.portable.artifactName = `VPhone-${displayVersion}-win`;

  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  console.log(`[set-build-version] app version: ${semverVersion}`);
  console.log(`[set-build-version] artifact version: ${displayVersion}`);
  console.log(
    `[set-build-version] pack staging: ${pkg.build.directories.output}`
  );
}

main();
