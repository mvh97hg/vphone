const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function hasNoDomInCore() {
  const files = [
    "src/core/webrtc-core.js",
    "src/core/signaling.js",
    "src/core/media-manager.js",
    "src/core/peer-manager.js",
    "src/core/call-state.js",
    "src/core/event-emitter.js",
    "src/sdk/sdk.js",
    "src/adapters/legacy-phone-adapter.js"
  ];
  const domPattern = /(querySelector|addEventListener|innerHTML|document\.|window\.)/;
  for (const rel of files) {
    if (!exists(rel)) return false;
    if (domPattern.test(read(rel))) return false;
  }
  return true;
}

function evaluate() {
  const requiredFiles = [
    "src/core/webrtc-core.js",
    "src/core/signaling.js",
    "src/core/media-manager.js",
    "src/core/peer-manager.js",
    "src/core/call-state.js",
    "src/core/event-emitter.js",
    "src/sdk/sdk.js",
    "src/ui/phone-ui.js",
    "src/ui/dom-renderer.js",
    "src/ui/controls.js",
    "src/ui/notifications.js",
    "src/ui/styles/phone-ui.css",
    "src/adapters/legacy-phone-adapter.js"
  ];
  const missingFiles = requiredFiles.filter((f) => !exists(f));

  const phoneIndex = exists("Phone/index.html") ? read("Phone/index.html") : "";
  const srcIndex = exists("src/ui/index.html") ? read("src/ui/index.html") : "";
  const serveScript = exists("scripts/serve-phone-env.cjs") ? read("scripts/serve-phone-env.cjs") : "";
  const auditDoc = exists("docs/library/PHONE_REFACTOR_REQUIREMENT_AUDIT.md")
    ? read("docs/library/PHONE_REFACTOR_REQUIREMENT_AUDIT.md")
    : "";

  const artifacts = [
    "mapping",
    "Feature Parity Checklist",
    "Event Flow Diagram",
    "Call State Diagram",
    "Migration Strategy",
    "Rollback Strategy"
  ];
  const missingArtifacts = artifacts.filter((k) => !auditDoc.includes(k));

  const passStructure = missingFiles.length === 0;
  const passDomFree = hasNoDomInCore();
  const passSrcEntrypoint = srcIndex.includes("create-modular-phone.js");
  const passRedirectOnly = /http-equiv="refresh"/.test(phoneIndex) && phoneIndex.includes("/src/ui/index.html");
  const passServerDefaultSrc = serveScript.includes('reqPath === "/" ? "/src/ui/index.html" : reqPath');
  const passArtifacts = missingArtifacts.length === 0;

  const result = {
    summary: {
      structure: passStructure ? "PASS" : "FAIL",
      coreDomDecoupling: passDomFree ? "PASS" : "FAIL",
      srcEntrypoint: passSrcEntrypoint ? "PASS" : "FAIL",
      phoneRedirect: passRedirectOnly ? "PASS" : "FAIL",
      serverDefaultSrcEntrypoint: passServerDefaultSrc ? "PASS" : "FAIL",
      requiredArtifactsDoc: passArtifacts ? "PASS" : "FAIL",
      browserMatrix: "PENDING",
      featureParity100: "PARTIAL"
    },
    evidence: {
      missingRequiredFiles: missingFiles,
      missingArtifacts,
      notes: [
        "Browser matrix remains pending due environment EPERM in this workspace.",
        "Feature parity is partial until full dynamic legacy flow migration is complete."
      ]
    }
  };

  return result;
}

module.exports = { evaluate };

if (require.main === module) {
  const result = evaluate();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(0);
}
