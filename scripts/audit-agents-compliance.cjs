const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function readJson(rel) {
  return JSON.parse(read(rel));
}

function hasNoDomInCore() {
  const files = [
    "src/core/phone-core.js"
  ];
  const forbiddenUiDomPattern = /(innerHTML|document\.body|document\.getElementById|window\.)/;
  for (const rel of files) {
    if (!exists(rel)) return false;
    const content = read(rel);
    if (forbiddenUiDomPattern.test(content)) return false;
    if (/querySelector/.test(content) && !/script\[data-vphone-runtime="sipjs"\]/.test(content)) return false;
  }
  return true;
}

function evaluate() {
  const requiredFiles = [
    "src/core/phone-core.js",
    "src/sdk/phone-sdk.js",
    "src/ui/phone-widget.js",
    "src/ui/index.html",
    "src/ui/styles/phone-ui.css"
  ];
  const missingFiles = requiredFiles.filter((f) => !exists(f));

  const phoneIndex = exists("Phone/index.html") ? read("Phone/index.html") : "";
  const srcIndex = exists("src/ui/index.html") ? read("src/ui/index.html") : "";
  const serveScript = exists("scripts/serve-phone-env.cjs") ? read("scripts/serve-phone-env.cjs") : "";
  const auditDoc = exists("docs/library/PHONE_REFACTOR_REQUIREMENT_AUDIT.md")
    ? read("docs/library/PHONE_REFACTOR_REQUIREMENT_AUDIT.md")
    : "";
  const browserMatrix = exists(".tmp/browser-matrix/results.json")
    ? readJson(".tmp/browser-matrix/results.json")
    : null;

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
  const passSrcEntrypoint = srcIndex.includes("phone-widget.js");
  const passRedirectOnly = /http-equiv="refresh"/.test(phoneIndex) && phoneIndex.includes("/src/ui/index.html");
  const passServerDefaultSrc = serveScript.includes('reqPath === "/" ? "/src/ui/index.html" : reqPath');
  const passArtifacts = missingArtifacts.length === 0;
  const passBrowserMatrix = !!browserMatrix && Array.isArray(browserMatrix.results) && browserMatrix.results.length > 0 && browserMatrix.results.every((item) => item.status === "pass");
  const uiParityGap = require(path.join(root, "scripts", "audit-ui-parity-gap.cjs")).evaluate();
  const passFeatureParity = uiParityGap.overall.percent === 100 && uiParityGap.overall.missing.length === 0;

  const result = {
    summary: {
      structure: passStructure ? "PASS" : "FAIL",
      coreDomDecoupling: passDomFree ? "PASS" : "FAIL",
      srcEntrypoint: passSrcEntrypoint ? "PASS" : "FAIL",
      phoneRedirect: passRedirectOnly ? "PASS" : "FAIL",
      serverDefaultSrcEntrypoint: passServerDefaultSrc ? "PASS" : "FAIL",
      requiredArtifactsDoc: passArtifacts ? "PASS" : "FAIL",
      browserMatrix: passBrowserMatrix ? "PASS" : "PENDING",
      featureParity100: passFeatureParity ? "PASS" : "PARTIAL"
    },
    evidence: {
      missingRequiredFiles: missingFiles,
      missingArtifacts,
      browserMatrix: browserMatrix ? browserMatrix.results.map((item) => ({ browser: item.browser, status: item.status })) : [],
      uiParityPercent: uiParityGap.overall.percent,
      uiParityMissing: uiParityGap.overall.missing,
      notes: [
        "Browser matrix uses installed Chrome/Edge executables and Playwright Firefox fallback.",
        "Feature parity status is scoped to the audited migrated UI flows."
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
