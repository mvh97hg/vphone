import { createPhoneWidget } from "./phone-widget.js";
import { normalizePhoneConfig, compactPhoneConfig } from "../sdk/phone-config.js";

function parseEmbedConfig() {
  let merged = {};
  try {
    const pairs = [];
    const hash = (window.location.hash || "").replace(/^#/, "");
    const query = (window.location.search || "").replace(/^\?/, "");
    if (hash) pairs.push(...hash.split("&"));
    if (query) pairs.push(...query.split("&"));
    const configPair = pairs.find((part) => part.indexOf("bpConfig=") === 0);
    if (configPair) merged = JSON.parse(decodeURIComponent(configPair.substring(9)));
  } catch (err) {
    console.warn("Invalid bpConfig payload", err);
  }

  if (window.__VPhoneEmbedConfig && typeof window.__VPhoneEmbedConfig === "object") {
    merged = { ...merged, ...window.__VPhoneEmbedConfig };
  }
  return normalizePhoneConfig(merged);
}

const config = {
  AppMode: "embedded",
  phoneShell: "embedded",
  ...compactPhoneConfig(parseEmbedConfig())
};

const root = document.getElementById("Phone") || document.body;
if (root && root.setAttribute) {
  root.setAttribute("data-phone-shell", "embedded");
}
if (typeof document !== "undefined" && document.body) {
  document.body.classList.remove("phoneStandaloneApp");
  document.body.classList.add("phoneEmbeddedApp");
}
window.__VPhoneWidget = createPhoneWidget({ root, config });
