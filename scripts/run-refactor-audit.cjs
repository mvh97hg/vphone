const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, ".tmp", "audit");
const outFile = path.join(outDir, "refactor-audit.json");

function main() {
  const { evaluate: evaluateCompliance } = require(path.join(root, "scripts", "audit-agents-compliance.cjs"));
  const { evaluate: evaluateParity } = require(path.join(root, "scripts", "verify-ui-parity.cjs"));
  const { evaluate: evaluateRuntimeBoundary } = require(path.join(root, "scripts", "audit-runtime-boundary.cjs"));
  const { evaluate: evaluateUiParityGap } = require(path.join(root, "scripts", "audit-ui-parity-gap.cjs"));

  const complianceResult = evaluateCompliance();
  const parityResult = evaluateParity();
  const runtimeBoundaryResult = evaluateRuntimeBoundary();
  const uiParityGapResult = evaluateUiParityGap();

  const payload = {
    generatedAt: new Date().toISOString(),
    compliance: {
      status: "ok",
      result: complianceResult,
      stderr: ""
    },
    uiParity: {
      status: parityResult.ok ? "ok" : "fail",
      result: parityResult,
      stderr: ""
    },
    runtimeBoundary: {
      status: runtimeBoundaryResult.ok ? "ok" : "fail",
      result: runtimeBoundaryResult,
      stderr: ""
    },
    uiParityGap: {
      status: "ok",
      result: uiParityGapResult,
      stderr: ""
    }
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf8");
  process.stdout.write(`${JSON.stringify({ outFile, payload }, null, 2)}\n`);
  process.exit(0);
}

main();
