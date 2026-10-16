#!/usr/bin/env node
/** Re-apply exe icon after code signing / asar integrity edits. */
const { stampWindowsExeIcon } = require("./stamp-exe-icon.cjs");

module.exports = async function afterSign(context) {
  try {
    stampWindowsExeIcon(context, "after-sign");
  } catch (error) {
    console.warn("[after-sign] icon stamp failed:", error && error.message ? error.message : error);
  }
};
