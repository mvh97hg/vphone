#!/usr/bin/env node
/** Stamp build/icon.ico onto the Windows product .exe via resedit (full icon-group replace). */
const fs = require("node:fs");
const path = require("node:path");
const ResEdit = require("resedit");

function loadIconFile(iconPath) {
  return ResEdit.Data.IconFile.from(fs.readFileSync(iconPath));
}

function listIconGroups(exeBuf) {
  const exe = ResEdit.NtExecutable.from(exeBuf, { ignoreCert: true });
  const res = ResEdit.NtExecutableResource.from(exe);
  return ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
}

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* busy wait — keep afterSign sync-friendly */
  }
}

function writeExeAtomic(exePath, data) {
  const tmpPath = `${exePath}.icon-tmp`;
  fs.writeFileSync(tmpPath, data);
  try {
    fs.renameSync(tmpPath, exePath);
  } catch {
    fs.copyFileSync(tmpPath, exePath);
    fs.unlinkSync(tmpPath);
  }
}

function replaceExeIcons(exePath, iconPath) {
  const iconFile = loadIconFile(iconPath);
  const iconDatas = iconFile.icons.map((item) => item.data);
  if (!iconDatas.length) {
    throw new Error(`icon has no images: ${iconPath}`);
  }

  const exeBuf = fs.readFileSync(exePath);
  const exe = ResEdit.NtExecutable.from(exeBuf, { ignoreCert: true });
  const res = ResEdit.NtExecutableResource.from(exe);
  const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);

  if (!groups.length) {
    ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
      res.entries,
      1,
      1033,
      iconDatas
    );
  } else {
    for (const g of groups) {
      ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
        res.entries,
        g.id,
        g.lang,
        iconDatas
      );
    }
  }

  res.outputResource(exe);
  const outBuf = Buffer.from(exe.generate());

  let lastError;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      writeExeAtomic(exePath, outBuf);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      const code = error && error.code;
      if (code !== "EBUSY" && code !== "EPERM" && code !== "EACCES") throw error;
      sleepSync(150 * attempt);
    }
  }
  if (lastError) throw lastError;

  const after = listIconGroups(fs.readFileSync(exePath));
  if (!after.length) {
    throw new Error(`icon stamp produced no icon groups: ${exePath}`);
  }
  const expected = iconDatas.length;
  for (const g of after) {
    if (g.icons.length !== expected) {
      throw new Error(
        `icon group ${g.id} has ${g.icons.length} images, expected ${expected}`
      );
    }
  }
  return { groups: after.length, iconsPerGroup: expected };
}

function stampWindowsExeIcon(context, label = "stamp-exe-icon") {
  if (process.platform !== "win32" && context?.electronPlatformName !== "win32") {
    return false;
  }
  const appOutDir = context?.appOutDir || "";
  const productFilename =
    context?.packager?.appInfo?.productFilename ||
    context?.packager?.appInfo?.productName ||
    "VPhone";
  const exePath = path.join(appOutDir, `${productFilename}.exe`);
  const iconPath = path.join(__dirname, "..", "build", "icon.ico");

  if (!fs.existsSync(exePath)) {
    console.warn(`[${label}] exe not found:`, exePath);
    return false;
  }
  if (!fs.existsSync(iconPath)) {
    console.warn(`[${label}] icon not found:`, iconPath);
    return false;
  }

  const result = replaceExeIcons(exePath, iconPath);
  const now = new Date();
  try {
    fs.utimesSync(exePath, now, now);
  } catch {
    // ignore mtime nudge failures
  }
  console.log(
    `[${label}] stamped icon onto ${exePath} (${result.groups} group(s), ${result.iconsPerGroup} size(s))`
  );
  return true;
}

module.exports = { stampWindowsExeIcon, replaceExeIcons, listIconGroups };
