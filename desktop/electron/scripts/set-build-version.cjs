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

function main() {
  const pkgRaw = fs.readFileSync(packageJsonPath, "utf8");
  const pkg = JSON.parse(pkgRaw);
  const nextVersion = buildVersion(new Date());

  if (pkg.version === nextVersion) {
    console.log(`[set-build-version] version unchanged: ${nextVersion}`);
    return;
  }

  pkg.version = nextVersion;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  console.log(`[set-build-version] version updated: ${nextVersion}`);
}

main();
