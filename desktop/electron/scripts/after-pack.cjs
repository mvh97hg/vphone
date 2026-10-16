#!/usr/bin/env node
/**
 * afterPack: prune Chromium locales, then stamp Windows .exe icon.
 * Icon is stamped again in afterSign (signing can run after this hook).
 */
const pruneLocales = require("./prune-locales.cjs");
const { stampWindowsExeIcon } = require("./stamp-exe-icon.cjs");

module.exports = async function afterPack(context) {
  await pruneLocales(context);
  try {
    stampWindowsExeIcon(context, "after-pack");
  } catch (error) {
    console.warn("[after-pack] icon stamp failed:", error && error.message ? error.message : error);
  }
};
