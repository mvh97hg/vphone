#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const outDir = path.join(root, ".tmp", "browser-matrix");
fs.mkdirSync(outDir, { recursive: true });

const baseUrl = process.env.HARNESS_URL || "http://127.0.0.1:9011/src/ui/harness.html";
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
    exec: "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
    args: (url) => [
      "--headless",
      "--dump-dom",
      url
    ]
  }
];

function runTarget(target) {
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

const results = targets.map(runTarget);
const outJson = path.join(outDir, "results.json");
fs.writeFileSync(outJson, JSON.stringify({ baseUrl, iterations, generatedAt: new Date().toISOString(), results }, null, 2));

console.log(JSON.stringify({ outJson, results }, null, 2));
