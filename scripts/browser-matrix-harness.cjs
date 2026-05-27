#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const outDir = path.join(root, ".tmp", "browser-matrix");
fs.mkdirSync(outDir, { recursive: true });

const baseUrl = process.env.HARNESS_URL || "http://127.0.0.1:9011/scripts/ui-harness.html";
const iterations = Number(process.env.MATRIX_ITERATIONS || "10");

const targets = [
  {
    name: "chrome",
    exec: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: (url, profile) => [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-crash-reporter",
      "--disable-breakpad",
      `--user-data-dir=${profile}`,
      "--virtual-time-budget=15000",
      "--dump-dom",
      url
    ]
  },
  {
    name: "edge",
    exec: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    args: (url, profile) => [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-crash-reporter",
      "--disable-breakpad",
      `--user-data-dir=${profile}`,
      "--virtual-time-budget=15000",
      "--dump-dom",
      url
    ]
  },
  {
    name: "firefox",
    playwright: "firefox"
  }
];

async function runPlaywrightTarget(target) {
  let playwright;
  const candidates = [
    path.join(root, "desktop", "electron", "node_modules", "playwright"),
    path.join(root, "node_modules", "playwright")
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        playwright = require(candidate);
        break;
      }
    } catch {}
  }
  if (!playwright || !playwright[target.playwright]) {
    return { browser: target.name, status: "missing", reason: "playwright browser launcher not found" };
  }

  const url = `${baseUrl}?autorun=1&iterations=${iterations}&cb=${target.name}-${Date.now()}`;
  const start = Date.now();
  const domFile = path.join(outDir, `${target.name}-dom.html`);
  const errFile = path.join(outDir, `${target.name}-stderr.log`);
  const logs = [];
  let browser;
  try {
    browser = await playwright[target.playwright].launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on("console", (msg) => {
      if (["error", "warning"].includes(msg.type())) logs.push(`${msg.type()}: ${msg.text()}`);
    });
    page.on("pageerror", (err) => logs.push(`pageerror: ${err.message}`));
    await page.goto(url, { waitUntil: "networkidle" });
    const status = await page.locator("#self-test-result").getAttribute("data-status");
    const dom = await page.content();
    fs.writeFileSync(domFile, dom || "", "utf8");
    fs.writeFileSync(errFile, logs.join("\n"), "utf8");
    return {
      browser: target.name,
      status: status === "pass" ? "pass" : status === "fail" ? "fail" : "inconclusive",
      exitCode: 0,
      signal: null,
      spawnError: null,
      durationMs: Date.now() - start,
      domBytes: Buffer.byteLength(dom || "", "utf8"),
      stderrBytes: Buffer.byteLength(logs.join("\n"), "utf8"),
      domFile,
      errFile
    };
  } catch (error) {
    fs.writeFileSync(domFile, "", "utf8");
    fs.writeFileSync(errFile, String(error && error.stack ? error.stack : error), "utf8");
    return {
      browser: target.name,
      status: "fail",
      exitCode: 1,
      signal: null,
      spawnError: { code: error && error.code ? error.code : "ERROR", message: String(error && error.message ? error.message : error) },
      durationMs: Date.now() - start,
      domBytes: 0,
      stderrBytes: Buffer.byteLength(String(error && error.stack ? error.stack : error), "utf8"),
      domFile,
      errFile
    };
  } finally {
    if (browser) await browser.close();
  }
}

function runExecutableTarget(target) {
  const profileDir = path.join(outDir, `${target.name}-profile`);
  fs.mkdirSync(profileDir, { recursive: true });
  const url = `${baseUrl}?autorun=1&iterations=${iterations}&cb=${target.name}-${Date.now()}`;
  const args = target.args(url, profileDir);

  if (!fs.existsSync(target.exec)) {
    return { browser: target.name, status: "missing", reason: "browser executable not found" };
  }

  const start = Date.now();
  const res = spawnSync(target.exec, args, {
    cwd: root,
    timeout: 120000,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
  const durationMs = Date.now() - start;

  const domFile = path.join(outDir, `${target.name}-dom.html`);
  const errFile = path.join(outDir, `${target.name}-stderr.log`);
  fs.writeFileSync(domFile, res.stdout || "", "utf8");
  fs.writeFileSync(errFile, res.stderr || "", "utf8");

  const dom = res.stdout || "";
  const hasPass = dom.includes('id="self-test-result"') && dom.includes('data-status="pass"');
  const hasFail = dom.includes('id="self-test-result"') && dom.includes('data-status="fail"');

  let status = "inconclusive";
  if (hasPass) status = "pass";
  if (hasFail) status = "fail";
  if (res.error && res.error.code === "ETIMEDOUT") status = "timeout";

  return {
    browser: target.name,
    status,
    exitCode: res.status,
    signal: res.signal,
    spawnError: res.error ? { code: res.error.code, message: res.error.message } : null,
    durationMs,
    domBytes: Buffer.byteLength(dom, "utf8"),
    stderrBytes: Buffer.byteLength(res.stderr || "", "utf8"),
    domFile,
    errFile
  };
}

(async () => {
  const results = [];
  for (const target of targets) {
    results.push(target.playwright ? await runPlaywrightTarget(target) : runExecutableTarget(target));
  }
  const outJson = path.join(outDir, "results.json");
  fs.writeFileSync(outJson, JSON.stringify({ baseUrl, iterations, generatedAt: new Date().toISOString(), results }, null, 2));

  console.log(JSON.stringify({ outJson, results }, null, 2));
})();
