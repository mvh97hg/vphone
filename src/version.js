/**
 * Build identity for SIP User-Agent and packaging.
 * Bundlers replace __VPHONE_BUILD_VERSION__ with yy.mm.dd at build time.
 */

function pad2(value) {
  return String(value).padStart(2, "0");
}

/** @param {Date} [date] */
export function formatBuildVersion(date = new Date()) {
  const yy = pad2(date.getFullYear() % 100);
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  return `${yy}.${mm}.${dd}`;
}

// esbuild `define` injects a string literal; fallback is today's date for raw source.
export const VPHONE_BUILD_VERSION =
  typeof __VPHONE_BUILD_VERSION__ !== "undefined"
    ? __VPHONE_BUILD_VERSION__
    : formatBuildVersion();

export function getSipUserAgentString(version = VPHONE_BUILD_VERSION) {
  const ver = String(version || formatBuildVersion()).trim() || formatBuildVersion();
  return `VPhone/${ver}`;
}
